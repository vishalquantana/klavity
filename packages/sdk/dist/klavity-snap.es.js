var ap = Object.defineProperty;
var lp = (e, t, r) => t in e ? ap(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var Pn = (e, t, r) => lp(e, typeof t != "symbol" ? t + "" : t, r);
function cp(e, t) {
  return e[13] = 1, e[14] = t >> 8, e[15] = t & 255, e[16] = t >> 8, e[17] = t & 255, e;
}
const Bc = 112, qc = 72, Wc = 89, Hc = 115;
let Ki;
function up() {
  const e = new Int32Array(256);
  for (let t = 0; t < 256; t++) {
    let r = t;
    for (let n = 0; n < 8; n++)
      r = r & 1 ? 3988292384 ^ r >>> 1 : r >>> 1;
    e[t] = r;
  }
  return e;
}
function dp(e) {
  let t = -1;
  Ki || (Ki = up());
  for (let r = 0; r < e.length; r++)
    t = Ki[(t ^ e[r]) & 255] ^ t >>> 8;
  return t ^ -1;
}
function pp(e) {
  const t = e.length - 1;
  for (let r = t; r >= 4; r--)
    if (e[r - 4] === 9 && e[r - 3] === Bc && e[r - 2] === qc && e[r - 1] === Wc && e[r] === Hc)
      return r - 3;
  return 0;
}
function hp(e, t, r = !1) {
  const n = new Uint8Array(13);
  t *= 39.3701, n[0] = Bc, n[1] = qc, n[2] = Wc, n[3] = Hc, n[4] = t >>> 24, n[5] = t >>> 16, n[6] = t >>> 8, n[7] = t & 255, n[8] = n[4], n[9] = n[5], n[10] = n[6], n[11] = n[7], n[12] = 1;
  const i = dp(n), s = new Uint8Array(4);
  if (s[0] = i >>> 24, s[1] = i >>> 16, s[2] = i >>> 8, s[3] = i & 255, r) {
    const a = pp(e);
    return e.set(n, a), e.set(s, a + 13), e;
  } else {
    const a = new Uint8Array(4);
    a[0] = 0, a[1] = 0, a[2] = 0, a[3] = 9;
    const c = new Uint8Array(54);
    return c.set(e, 0), c.set(a, 33), c.set(n, 37), c.set(s, 50), c;
  }
}
const fp = "AAlwSFlz", mp = "AAAJcEhZ", gp = "AAAACXBI";
function yp(e) {
  let t = e.indexOf(fp);
  return t === -1 && (t = e.indexOf(mp)), t === -1 && (t = e.indexOf(gp)), t;
}
const jc = "[modern-screenshot]", nr = typeof window < "u", bp = nr && "Worker" in window, vp = nr && "atob" in window, kp = nr && "btoa" in window;
var Uc;
const Co = nr ? (Uc = window.navigator) == null ? void 0 : Uc.userAgent : "", Vc = Co.includes("Chrome"), ii = Co.includes("AppleWebKit") && !Vc, Mo = Co.includes("Firefox"), wp = (e) => e && "__CONTEXT__" in e, xp = (e) => e.constructor.name === "CSSFontFaceRule", Sp = (e) => e.constructor.name === "CSSImportRule", Ep = (e) => e.constructor.name === "CSSLayerBlockRule", Ut = (e) => e.nodeType === 1, kn = (e) => typeof e.className == "object", Yc = (e) => e.tagName === "image", Cp = (e) => e.tagName === "use", fn = (e) => Ut(e) && typeof e.style < "u" && !kn(e), Mp = (e) => e.nodeType === 8, Tp = (e) => e.nodeType === 3, Yr = (e) => e.tagName === "IMG", gi = (e) => e.tagName === "VIDEO", Rp = (e) => e.tagName === "CANVAS", Ap = (e) => e.tagName === "TEXTAREA", _p = (e) => e.tagName === "INPUT", Ip = (e) => e.tagName === "STYLE", Lp = (e) => e.tagName === "SCRIPT", Op = (e) => e.tagName === "SELECT", Np = (e) => e.tagName === "SLOT", Pp = (e) => e.tagName === "IFRAME", zp = (...e) => console.warn(jc, ...e);
function Dp(e) {
  var r;
  const t = (r = e == null ? void 0 : e.createElement) == null ? void 0 : r.call(e, "canvas");
  return t && (t.height = t.width = 1), !!t && "toDataURL" in t && !!t.toDataURL("image/webp").includes("image/webp");
}
const ho = (e) => e.startsWith("data:");
function Gc(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (nr && e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i) || !nr)
    return e;
  const r = yi().implementation.createHTMLDocument(), n = r.createElement("base"), i = r.createElement("a");
  return r.head.appendChild(n), r.body.appendChild(i), t && (n.href = t), i.href = e, i.href;
}
function yi(e) {
  return (e && Ut(e) ? e == null ? void 0 : e.ownerDocument : e) ?? window.document;
}
const bi = "http://www.w3.org/2000/svg";
function $p(e, t, r) {
  const n = yi(r).createElementNS(bi, "svg");
  return n.setAttributeNS(null, "width", e.toString()), n.setAttributeNS(null, "height", t.toString()), n.setAttributeNS(null, "viewBox", `0 0 ${e} ${t}`), n;
}
function Fp(e, t) {
  let r = new XMLSerializer().serializeToString(e);
  return t && (r = r.replace(/[\u0000-\u0008\v\f\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/gu, "")), `data:image/svg+xml;charset=utf-8,${encodeURIComponent(r)}`;
}
function Up(e, t) {
  return new Promise((r, n) => {
    const i = new FileReader();
    i.onload = () => r(i.result), i.onerror = () => n(i.error), i.onabort = () => n(new Error(`Failed read blob to ${t}`)), i.readAsDataURL(e);
  });
}
const Bp = (e) => Up(e, "dataUrl");
function Wr(e, t) {
  const r = yi(t).createElement("img");
  return r.decoding = "sync", r.loading = "eager", r.src = e, r;
}
function mn(e, t) {
  return new Promise((r) => {
    const { timeout: n, ownerDocument: i, onError: s, onWarn: a } = t ?? {}, c = typeof e == "string" ? Wr(e, yi(i)) : e;
    let l = null, d = null;
    function o() {
      r(c), l && clearTimeout(l), d == null || d();
    }
    if (n && (l = setTimeout(o, n)), gi(c)) {
      const h = c.currentSrc || c.src;
      if (!h)
        return c.poster ? mn(c.poster, t).then(r) : o();
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
      const h = Yc(c) ? c.href.baseVal : c.currentSrc || c.src;
      if (!h)
        return o();
      const p = async () => {
        if (Yr(c) && "decode" in c)
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
      if (Yr(c) && c.complete)
        return p();
      d = () => {
        c.removeEventListener("load", p), c.removeEventListener("error", u);
      }, c.addEventListener("load", p, { once: !0 }), c.addEventListener("error", u, { once: !0 });
    }
  });
}
async function qp(e, t) {
  fn(e) && (Yr(e) || gi(e) ? await mn(e, t) : await Promise.all(
    ["img", "video"].flatMap((r) => Array.from(e.querySelectorAll(r)).map((n) => mn(n, t)))
  ));
}
const Xc = /* @__PURE__ */ (function() {
  let t = 0;
  const r = () => `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4);
  return () => (t += 1, `u${r()}${t}`);
})();
function Kc(e) {
  return e == null ? void 0 : e.split(",").map((t) => t.trim().replace(/"|'/g, "").toLowerCase()).filter(Boolean);
}
let Na = 0;
function Wp(e) {
  const t = `${jc}[#${Na}]`;
  return Na++, {
    // eslint-disable-next-line no-console
    time: (r) => e && console.time(`${t} ${r}`),
    // eslint-disable-next-line no-console
    timeEnd: (r) => e && console.timeEnd(`${t} ${r}`),
    warn: (...r) => e && zp(...r)
  };
}
function Hp(e) {
  return {
    cache: e ? "no-cache" : "force-cache"
  };
}
async function vi(e, t) {
  return wp(e) ? e : jp(e, { ...t, autoDestruct: !0 });
}
async function jp(e, t) {
  var u, m;
  const { scale: r = 1, workerUrl: n, workerNumber: i = 1 } = t || {}, s = !!(t != null && t.debug), a = (t == null ? void 0 : t.features) ?? !0, c = e.ownerDocument ?? (nr ? window.document : void 0), l = ((u = e.ownerDocument) == null ? void 0 : u.defaultView) ?? (nr ? window : void 0), d = /* @__PURE__ */ new Map(), o = {
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
      requestInit: Hp((m = t == null ? void 0 : t.fetch) == null ? void 0 : m.bypassingCache),
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
    log: Wp(s),
    node: e,
    ownerDocument: c,
    ownerWindow: l,
    dpi: r === 1 ? null : 96 * r,
    svgStyleElement: Jc(c),
    svgDefsElement: c == null ? void 0 : c.createElementNS(bi, "defs"),
    svgStyles: /* @__PURE__ */ new Map(),
    defaultComputedStyles: /* @__PURE__ */ new Map(),
    workers: [
      ...Array.from({
        length: bp && n && i ? i : 0
      })
    ].map(() => {
      try {
        const f = new Worker(n);
        return f.onmessage = async (g) => {
          var b, C, w, k;
          const { url: x, result: v } = g.data;
          v ? (C = (b = d.get(x)) == null ? void 0 : b.resolve) == null || C.call(b, v) : (k = (w = d.get(x)) == null ? void 0 : w.reject) == null || k.call(w, new Error(`Error receiving message from worker: ${x}`));
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
      Dp(c) && "image/webp",
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
  o.log.time("wait until load"), await qp(e, { timeout: o.timeout, onWarn: o.log.warn }), o.log.timeEnd("wait until load");
  const { width: h, height: p } = Vp(e, o);
  return o.width = h, o.height = p, o;
}
function Jc(e) {
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
function Vp(e, t) {
  let { width: r, height: n } = t;
  if (Ut(e) && (!r || !n)) {
    const i = e.getBoundingClientRect();
    r = r || i.width || Number(e.getAttribute("width")) || 0, n = n || i.height || Number(e.getAttribute("height")) || 0;
  }
  return { width: r, height: n };
}
async function Yp(e, t) {
  const {
    log: r,
    timeout: n,
    drawImageCount: i,
    drawImageInterval: s
  } = t;
  r.time("image to canvas");
  const a = await mn(e, { timeout: n, onWarn: t.log.warn }), { canvas: c, context2d: l } = Gp(e.ownerDocument, t), d = () => {
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
function Gp(e, t) {
  const { width: r, height: n, scale: i, backgroundColor: s, maximumCanvasSize: a } = t, c = e.createElement("canvas");
  c.width = Math.floor(r * i), c.height = Math.floor(n * i), c.style.width = `${r}px`, c.style.height = `${n}px`, a && (c.width > a || c.height > a) && (c.width > a && c.height > a ? c.width > c.height ? (c.height *= a / c.width, c.width = a) : (c.width *= a / c.height, c.height = a) : c.width > a ? (c.height *= a / c.width, c.width = a) : (c.width *= a / c.height, c.height = a));
  const l = c.getContext("2d");
  return l && s && (l.fillStyle = s, l.fillRect(0, 0, c.width, c.height)), { canvas: c, context2d: l };
}
function Zc(e, t) {
  if (e.ownerDocument)
    try {
      const s = e.toDataURL();
      if (s !== "data:,")
        return Wr(s, e.ownerDocument);
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
function Xp(e, t) {
  var r;
  try {
    if ((r = e == null ? void 0 : e.contentDocument) != null && r.documentElement)
      return To(e.contentDocument.documentElement, t);
  } catch (n) {
    t.log.warn("Failed to clone iframe", n);
  }
  return e.cloneNode(!1);
}
function Kp(e) {
  const t = e.cloneNode(!1);
  return e.currentSrc && e.currentSrc !== e.src && (t.src = e.currentSrc, t.srcset = ""), t.loading === "lazy" && (t.loading = "eager"), t;
}
async function Jp(e, t) {
  if (e.ownerDocument && !e.currentSrc && e.poster)
    return Wr(e.poster, e.ownerDocument);
  const r = e.cloneNode(!1);
  r.crossOrigin = "anonymous", e.currentSrc && e.currentSrc !== e.src && (r.src = e.currentSrc);
  const n = r.ownerDocument;
  if (n) {
    let i = !0;
    if (await mn(r, { onError: () => i = !1, onWarn: t.log.warn }), !i)
      return e.poster ? Wr(e.poster, e.ownerDocument) : r;
    r.currentTime = e.currentTime, await new Promise((a) => {
      r.addEventListener("seeked", a, { once: !0 });
    });
    const s = n.createElement("canvas");
    s.width = e.offsetWidth, s.height = e.offsetHeight;
    try {
      const a = s.getContext("2d");
      a && a.drawImage(r, 0, 0, s.width, s.height);
    } catch (a) {
      return t.log.warn("Failed to clone video", a), e.poster ? Wr(e.poster, e.ownerDocument) : r;
    }
    return Zc(s, t);
  }
  return r;
}
function Zp(e, t) {
  return Rp(e) ? Zc(e, t) : Pp(e) ? Xp(e, t) : Yr(e) ? Kp(e) : gi(e) ? Jp(e, t) : e.cloneNode(!1);
}
function Qp(e) {
  let t = e.sandbox;
  if (!t) {
    const { ownerDocument: r } = e;
    try {
      r && (t = r.createElement("iframe"), t.id = `__SANDBOX__${Xc()}`, t.width = "0", t.height = "0", t.style.visibility = "hidden", t.style.position = "fixed", r.body.appendChild(t), t.srcdoc = '<!DOCTYPE html><meta charset="UTF-8"><title></title><body>', e.sandbox = t);
    } catch (n) {
      e.log.warn("Failed to getSandBox", n);
    }
  }
  return t;
}
const eh = [
  "width",
  "height",
  "-webkit-text-fill-color"
], th = [
  "stroke",
  "fill"
];
function Qc(e, t, r) {
  const { defaultComputedStyles: n } = r, i = e.nodeName.toLowerCase(), s = kn(e) && i !== "svg", a = s ? th.map((f) => [f, e.getAttribute(f)]).filter(([, f]) => f !== null) : [], c = [
    s && "svg",
    i,
    a.map((f, g) => `${f}=${g}`).join(","),
    t
  ].filter(Boolean).join(":");
  if (n.has(c))
    return n.get(c);
  const l = Qp(r), d = l == null ? void 0 : l.contentWindow;
  if (!d)
    return /* @__PURE__ */ new Map();
  const o = d == null ? void 0 : d.document;
  let h, p;
  s ? (h = o.createElementNS(bi, "svg"), p = h.ownerDocument.createElementNS(h.namespaceURI, i), a.forEach(([f, g]) => {
    p.setAttributeNS(null, f, g);
  }), h.appendChild(p)) : h = p = o.createElement(i), p.textContent = " ", o.body.appendChild(h);
  const u = d.getComputedStyle(p, t), m = /* @__PURE__ */ new Map();
  for (let f = u.length, g = 0; g < f; g++) {
    const x = u.item(g);
    eh.includes(x) || m.set(x, u.getPropertyValue(x));
  }
  return o.body.removeChild(h), n.set(c, m), m;
}
function eu(e, t, r) {
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
function rh(e, t, r, n) {
  var h, p, u, m;
  const { ownerWindow: i, includeStyleProperties: s, currentParentNodeStyle: a } = n, c = t.style, l = i.getComputedStyle(e), d = Qc(e, null, n);
  a == null || a.forEach((f, g) => {
    d.delete(g);
  });
  const o = eu(l, d, s);
  o.delete("transition-property"), o.delete("all"), o.delete("d"), o.delete("content"), r && (o.delete("position"), o.delete("margin-top"), o.delete("margin-right"), o.delete("margin-bottom"), o.delete("margin-left"), o.delete("margin-block-start"), o.delete("margin-block-end"), o.delete("margin-inline-start"), o.delete("margin-inline-end"), o.set("box-sizing", ["border-box", ""])), ((h = o.get("background-clip")) == null ? void 0 : h[0]) === "text" && t.classList.add("______background-clip--text"), Vc && (o.has("font-kerning") || o.set("font-kerning", ["normal", ""]), (((p = o.get("overflow-x")) == null ? void 0 : p[0]) === "hidden" || ((u = o.get("overflow-y")) == null ? void 0 : u[0]) === "hidden") && ((m = o.get("text-overflow")) == null ? void 0 : m[0]) === "ellipsis" && e.scrollWidth === e.clientWidth && o.set("text-overflow", ["clip", ""]));
  for (let f = c.length, g = 0; g < f; g++)
    c.removeProperty(c.item(g));
  return o.forEach(([f, g], x) => {
    c.setProperty(x, f, g);
  }), o;
}
function nh(e, t) {
  (Ap(e) || _p(e) || Op(e)) && t.setAttribute("value", e.value);
}
const ih = [
  "::before",
  "::after"
  // '::placeholder', TODO
], sh = [
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
function oh(e, t, r, n, i) {
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
    const u = [Xc()], m = Qc(e, o, n);
    l == null || l.forEach((C, w) => {
      m.delete(w);
    });
    const f = eu(h, m, n.includeStyleProperties);
    f.delete("content"), f.delete("-webkit-locale"), ((b = f.get("background-clip")) == null ? void 0 : b[0]) === "text" && t.classList.add("______background-clip--text");
    const g = [
      `content: '${p}';`
    ];
    if (f.forEach(([C, w], k) => {
      g.push(`${k}: ${C}${w ? " !important" : ""};`);
    }), g.length === 1)
      return;
    try {
      t.className = [t.className, ...u].join(" ");
    } catch (C) {
      n.log.warn("Failed to copyPseudoClass", C);
      return;
    }
    const x = g.join(`
  `);
    let v = c.get(x);
    v || (v = [], c.set(x, v)), v.push(`.${u[0]}${o}`);
  }
  ih.forEach(d), r && sh.forEach(d);
}
const Pa = /* @__PURE__ */ new Set([
  "symbol"
  // test/fixtures/svg.symbol.html
]);
async function za(e, t, r, n, i) {
  if (Ut(r) && (Ip(r) || Lp(r)) || n.filter && !n.filter(r))
    return;
  Pa.has(t.nodeName) || Pa.has(r.nodeName) ? n.currentParentNodeStyle = void 0 : n.currentParentNodeStyle = n.currentNodeStyle;
  const s = await To(r, n, !1, i);
  n.isEnable("restoreScrollPosition") && ah(e, s), t.appendChild(s);
}
async function Da(e, t, r, n) {
  var s;
  let i = e.firstChild;
  Ut(e) && e.shadowRoot && (i = (s = e.shadowRoot) == null ? void 0 : s.firstChild, r.shadowRoots.push(e.shadowRoot));
  for (let a = i; a; a = a.nextSibling)
    if (!Mp(a))
      if (Ut(a) && Np(a) && typeof a.assignedNodes == "function") {
        const c = a.assignedNodes();
        for (let l = 0; l < c.length; l++)
          await za(e, t, c[l], r, n);
      } else
        await za(e, t, a, r, n);
}
function ah(e, t) {
  if (!fn(e) || !fn(t))
    return;
  const { scrollTop: r, scrollLeft: n } = e;
  if (!r && !n)
    return;
  const { transform: i } = t.style, s = new DOMMatrix(i), { a, b: c, c: l, d } = s;
  s.a = 1, s.b = 0, s.c = 0, s.d = 1, s.translateSelf(-n, -r), s.a = a, s.b = c, s.c = l, s.d = d, t.style.transform = s.toString();
}
function lh(e, t) {
  const { backgroundColor: r, width: n, height: i, style: s } = t, a = e.style;
  if (r && a.setProperty("background-color", r, "important"), n && a.setProperty("width", `${n}px`, "important"), i && a.setProperty("height", `${i}px`, "important"), s)
    for (const c in s) a[c] = s[c];
}
const ch = /^[\w-:]+$/;
async function To(e, t, r = !1, n) {
  var d, o, h, p;
  const { ownerDocument: i, ownerWindow: s, fontFamilies: a, onCloneEachNode: c } = t;
  if (i && Tp(e))
    return n && /\S/.test(e.data) && n(e.data), i.createTextNode(e.data);
  if (i && s && Ut(e) && (fn(e) || kn(e))) {
    const u = await Zp(e, t);
    if (t.isEnable("removeAbnormalAttributes")) {
      const b = u.getAttributeNames();
      for (let C = b.length, w = 0; w < C; w++) {
        const k = b[w];
        ch.test(k) || u.removeAttribute(k);
      }
    }
    const m = t.currentNodeStyle = rh(e, u, r, t);
    r && lh(u, t);
    let f = !1;
    if (t.isEnable("copyScrollbar")) {
      const b = [
        (d = m.get("overflow-x")) == null ? void 0 : d[0],
        (o = m.get("overflow-y")) == null ? void 0 : o[0]
      ];
      f = b.includes("scroll") || (b.includes("auto") || b.includes("overlay")) && (e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth);
    }
    const g = (h = m.get("text-transform")) == null ? void 0 : h[0], x = Kc((p = m.get("font-family")) == null ? void 0 : p[0]), v = x ? (b) => {
      g === "uppercase" ? b = b.toUpperCase() : g === "lowercase" ? b = b.toLowerCase() : g === "capitalize" && (b = b[0].toUpperCase() + b.substring(1)), x.forEach((C) => {
        let w = a.get(C);
        w || a.set(C, w = /* @__PURE__ */ new Set()), b.split("").forEach((k) => w.add(k));
      });
    } : void 0;
    return oh(
      e,
      u,
      f,
      t,
      v
    ), nh(e, u), gi(e) || await Da(
      e,
      u,
      t,
      v
    ), await (c == null ? void 0 : c(u)), u;
  }
  const l = e.cloneNode(!1);
  return await Da(e, l, t), await (c == null ? void 0 : c(l)), l;
}
function uh(e) {
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
function dh(e) {
  const { url: t, timeout: r, responseType: n, ...i } = e, s = new AbortController(), a = r ? setTimeout(() => s.abort(), r) : void 0;
  return fetch(t, { signal: s.signal, ...i }).then((c) => {
    if (!c.ok)
      throw new Error("Failed fetch, not 2xx response", { cause: c });
    switch (n) {
      case "arrayBuffer":
        return c.arrayBuffer();
      case "dataUrl":
        return c.blob().then(Bp);
      case "text":
      default:
        return c.text();
    }
  }).finally(() => clearTimeout(a));
}
function gn(e, t) {
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
  n === "image" && (ii || Mo) && e.drawImageCount++;
  let x = d.get(r);
  if (!x) {
    p && p instanceof RegExp && p.test(a) && (a += (/\?/.test(a) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
    const v = n.startsWith("font") && m && m.minify, b = /* @__PURE__ */ new Set();
    v && n.split(";")[1].split(",").forEach((M) => {
      g.has(M) && g.get(M).forEach((O) => b.add(O));
    });
    const C = v && b.size, w = {
      url: a,
      timeout: c,
      responseType: C ? "arrayBuffer" : i,
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
      return !ii && r.startsWith("http") && f.length ? new Promise((k, M) => {
        f[d.size & f.length - 1].postMessage({ rawUrl: r, ...w }), x.resolve = k, x.reject = M;
      }) : dh(w);
    })().catch((k) => {
      if (d.delete(r), n === "image" && u)
        return e.log.warn("Failed to fetch image base64, trying to use placeholder image", a), typeof u == "string" ? u : u(s);
      throw k;
    }), d.set(r, x);
  }
  return x.response;
}
async function tu(e, t, r, n) {
  if (!ru(e))
    return e;
  for (const [i, s] of ph(e, t))
    try {
      const a = await gn(
        r,
        {
          url: s,
          requestType: n ? "image" : "text",
          responseType: "dataUrl"
        }
      );
      e = e.replace(hh(i), `$1${a}$3`);
    } catch (a) {
      r.log.warn("Failed to fetch css data url", i, a);
    }
  return e;
}
function ru(e) {
  return /url\((['"]?)([^'"]+?)\1\)/.test(e);
}
const nu = /url\((['"]?)([^'"]+?)\1\)/g;
function ph(e, t) {
  const r = [];
  return e.replace(nu, (n, i, s) => (r.push([s, Gc(s, t)]), n)), r.filter(([n]) => !ho(n));
}
function hh(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
const fh = [
  "background-image",
  "border-image-source",
  "-webkit-border-image",
  "-webkit-mask-image",
  "list-style-image"
];
function mh(e, t) {
  return fh.map((r) => {
    const n = e.getPropertyValue(r);
    return !n || n === "none" ? null : ((ii || Mo) && t.drawImageCount++, tu(n, null, t, !0).then((i) => {
      !i || n === i || e.setProperty(
        r,
        i,
        e.getPropertyPriority(r)
      );
    }));
  }).filter(Boolean);
}
function gh(e, t) {
  if (Yr(e)) {
    const r = e.currentSrc || e.src;
    if (!ho(r))
      return [
        gn(t, {
          url: r,
          imageDom: e,
          requestType: "image",
          responseType: "dataUrl"
        }).then((n) => {
          n && (e.srcset = "", e.dataset.originalSrc = r, e.src = n || "");
        })
      ];
    (ii || Mo) && t.drawImageCount++;
  } else if (kn(e) && !ho(e.href.baseVal)) {
    const r = e.href.baseVal;
    return [
      gn(t, {
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
function yh(e, t) {
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
        gn(t, {
          url: s,
          responseType: "text"
        }).then((d) => {
          n == null || n.insertAdjacentHTML("beforeend", d);
        })
      ];
  }
  return [];
}
function iu(e, t) {
  const { tasks: r } = t;
  Ut(e) && ((Yr(e) || Yc(e)) && r.push(...gh(e, t)), Cp(e) && r.push(...yh(e, t))), fn(e) && r.push(...mh(e.style, t)), e.childNodes.forEach((n) => {
    iu(n, t);
  });
}
async function bh(e, t) {
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
      const l = Fa(c.cssText, t);
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
          if (Sp(m)) {
            const f = m.href;
            let g = "";
            try {
              g = await gn(t, {
                url: f,
                requestType: "text",
                responseType: "text"
              });
            } catch (v) {
              t.log.warn(`Error fetch remote css import from ${f}`, v);
            }
            const x = g.replace(
              nu,
              (v, b, C) => v.replace(C, Gc(C, f))
            );
            for (const v of kh(x))
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
        fo(u.cssRules, p);
      }), p.filter((u) => {
        var m;
        return xp(u) && ru(u.style.getPropertyValue("src")) && ((m = Kc(u.style.getPropertyValue("font-family"))) == null ? void 0 : m.some((f) => i.has(f)));
      }).forEach((u) => {
        const m = u, f = s.get(m.cssText);
        f ? n.appendChild(r.createTextNode(`${f}
`)) : a.push(
          tu(
            m.cssText,
            m.parentStyleSheet ? m.parentStyleSheet.href : null,
            t
          ).then((g) => {
            g = Fa(g, t), s.set(m.cssText, g), n.appendChild(r.createTextNode(`${g}
`));
          })
        );
      });
    }
}
const vh = /(\/\*[\s\S]*?\*\/)/g, $a = /((@.*?keyframes [\s\S]*?){([\s\S]*?}\s*?)})/gi;
function kh(e) {
  if (e == null)
    return [];
  const t = [];
  let r = e.replace(vh, "");
  for (; ; ) {
    const s = $a.exec(r);
    if (!s)
      break;
    t.push(s[0]);
  }
  r = r.replace($a, "");
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
const wh = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, xh = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function Fa(e, t) {
  const { font: r } = t, n = r ? r == null ? void 0 : r.preferredFormat : void 0;
  return n ? e.replace(xh, (i) => {
    for (; ; ) {
      const [s, , a] = wh.exec(i) || [];
      if (!a)
        return "";
      if (a === n)
        return `src: ${s};`;
    }
  }) : e;
}
function fo(e, t = []) {
  for (const r of Array.from(e))
    Ep(r) ? t.push(...fo(r.cssRules)) : "cssRules" in r ? fo(r.cssRules, t) : t.push(r);
  return t;
}
const Sh = /\bx?link:?href\s*=\s*["'](?!data:)[^"']+["']/i;
function Eh(e) {
  return Sh.test(e.innerHTML);
}
async function Ch(e, t) {
  const r = await vi(e, t);
  if (Ut(r.node) && kn(r.node) && !Eh(r.node))
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
  const f = await To(r.node, r, !0);
  if (a && n) {
    let C = "";
    l.forEach((w, k) => {
      C += `${w.join(`,
`)} {
  ${k}
}
`;
    }), a.appendChild(n.createTextNode(C));
  }
  i.timeEnd("clone node"), await (p == null ? void 0 : p(f)), d !== !1 && Ut(f) && (i.time("embed web font"), await bh(f, r), i.timeEnd("embed web font")), i.time("embed node"), iu(f, r);
  const g = s.length;
  let x = 0;
  const v = async () => {
    for (; ; ) {
      const C = s.pop();
      if (!C)
        break;
      try {
        await C;
      } catch (w) {
        r.log.warn("Failed to run task", w);
      }
      o == null || o(++x, g);
    }
  };
  o == null || o(x, g), await Promise.all([...Array.from({ length: 4 })].map(v)), i.timeEnd("embed node"), await (u == null ? void 0 : u(f));
  const b = Mh(f, r);
  return c && b.insertBefore(c, b.children[0]), a && b.insertBefore(a, b.children[0]), h && uh(r), await (m == null ? void 0 : m(b)), b;
}
function Mh(e, t) {
  const { width: r, height: n } = t, i = $p(r, n, e.ownerDocument), s = i.ownerDocument.createElementNS(i.namespaceURI, "foreignObject");
  return s.setAttributeNS(null, "x", "0%"), s.setAttributeNS(null, "y", "0%"), s.setAttributeNS(null, "width", "100%"), s.setAttributeNS(null, "height", "100%"), s.append(e), i.appendChild(s), i;
}
async function Th(e, t) {
  var a;
  const r = await vi(e, t), n = await Ch(r), i = Fp(n, r.isEnable("removeControlCharacter"));
  r.autoDestruct || (r.svgStyleElement = Jc(r.ownerDocument), r.svgDefsElement = (a = r.ownerDocument) == null ? void 0 : a.createElementNS(bi, "defs"), r.svgStyles.clear());
  const s = Wr(i, n.ownerDocument);
  return await Yp(s, r);
}
async function Rh(e, t) {
  const r = await vi(e, t), { log: n, quality: i, type: s, dpi: a } = r, c = await Th(r);
  n.time("canvas to data url");
  let l = c.toDataURL(s, i);
  if (["image/png", "image/jpeg"].includes(s) && a && vp && kp) {
    const [d, o] = l.split(",");
    let h = 0, p = !1;
    if (s === "image/png") {
      const b = yp(o);
      b >= 0 ? (h = Math.ceil((b + 28) / 3) * 4, p = !0) : h = 33 / 3 * 4;
    } else s === "image/jpeg" && (h = 18 / 3 * 4);
    const u = o.substring(0, h), m = o.substring(h), f = window.atob(u), g = new Uint8Array(f.length);
    for (let b = 0; b < g.length; b++)
      g[b] = f.charCodeAt(b);
    const x = s === "image/png" ? hp(g, a, p) : cp(g, a), v = window.btoa(String.fromCharCode(...x));
    l = [d, ",", v, m].join("");
  }
  return n.timeEnd("canvas to data url"), l;
}
async function Ah(e, t) {
  return Rh(
    await vi(e, { ...t, type: "image/png" })
  );
}
const _h = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", Ih = 8e3, Lh = 16384, Ua = 4096, Oh = 16e6, Nh = 500, Ph = 1e4, Ji = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z4kwAAAAASUVORK5CYII=", su = 600, zh = 1200, Dh = 24, $h = 1024, xt = 32, Fh = 4, ou = 400, Uh = 0.985, Bh = 250;
function au(e, t) {
  if (!e || e.startsWith("data:") || e.startsWith("blob:")) return !1;
  try {
    return new URL(e, t).origin !== t;
  } catch {
    return !1;
  }
}
function qh(e) {
  const t = e;
  if (!t || t.tagName !== "IMG") return !1;
  const r = t.currentSrc || t.src || "";
  return au(r, location.origin);
}
function Wh(e) {
  const t = e;
  if (!t || t.nodeType !== 1) return !1;
  const r = t.tagName;
  if (r === "SCRIPT" || r === "STYLE" || r === "NOSCRIPT" || r === "TEMPLATE" || r === "IFRAME" && au(t.src || "", location.origin)) return !0;
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
function Zi(e) {
  try {
    console.warn(e);
  } catch {
  }
}
function Ba(e) {
  return !e || e === "transparent" || e === "rgba(0, 0, 0, 0)";
}
function Hh(e, t, r = 1) {
  try {
    const n = e.getBoundingClientRect(), i = Math.max(1, Math.ceil(Math.max(e.scrollWidth, e.clientWidth, n.width))), s = Math.max(1, Math.ceil(Math.max(e.scrollHeight, e.clientHeight, n.height))), a = Math.max(0.1, r), c = Math.min(Ua / i, Ua / s), l = Math.min(a, c, Math.sqrt(Oh / (i * s))), d = document.createElement("canvas");
    d.width = Math.max(1, Math.floor(i * l)), d.height = Math.max(1, Math.floor(s * l));
    const o = d.getContext("2d");
    if (!o) return { dataUrl: Ji, scale: 1 };
    o.scale(l, l), o.fillStyle = "#ffffff", o.fillRect(0, 0, i, s);
    const h = Date.now() + Nh;
    let p = 0;
    const u = () => p >= Ph || Date.now() >= h, m = (g, x = !1) => {
      var k;
      if (u() || (p++, !x && t && !t(g))) return;
      const v = getComputedStyle(g);
      if (v.display === "none" || v.visibility === "hidden" || Number(v.opacity) === 0) return;
      const b = g.getBoundingClientRect(), C = b.left - n.left, w = b.top - n.top;
      if (b.width > 0 && b.height > 0) {
        Ba(v.backgroundColor) || (o.fillStyle = v.backgroundColor, o.fillRect(C, w, b.width, b.height));
        const M = parseFloat(v.borderTopWidth);
        M > 0 && v.borderTopStyle !== "none" && !Ba(v.borderTopColor) && (o.strokeStyle = v.borderTopColor, o.lineWidth = M, o.strokeRect(C, w, b.width, b.height)), g.tagName === "IMG" && (o.fillStyle = "#f1f5f9", o.fillRect(C, w, b.width, b.height), o.strokeStyle = "#cbd5e1", o.lineWidth = 1, o.strokeRect(C, w, b.width, b.height));
      }
      for (const M of Array.from(g.childNodes)) {
        if (u()) break;
        if (M instanceof HTMLElement) {
          m(M);
          continue;
        }
        if (!(M.nodeType !== Node.TEXT_NODE || !((k = M.textContent) != null && k.trim())))
          try {
            const O = document.createRange();
            O.selectNodeContents(M);
            const P = O.getBoundingClientRect();
            if (P.width <= 0 || P.height <= 0) continue;
            o.save(), o.beginPath(), o.rect(P.left - n.left, P.top - n.top, P.width, P.height), o.clip(), o.fillStyle = v.color, o.font = `${v.fontStyle} ${v.fontWeight} ${v.fontSize} ${v.fontFamily}`, o.textBaseline = "top", o.fillText(M.textContent.trim(), P.left - n.left, P.top - n.top), o.restore();
          } catch {
          }
      }
    };
    m(e, !0);
    const f = d.toDataURL("image/png");
    return f.startsWith("data:image/png") ? { dataUrl: f, scale: l } : { dataUrl: Ji, scale: 1 };
  } catch {
    return { dataUrl: Ji, scale: 1 };
  }
}
function jh() {
  return new Promise((e) => {
    typeof requestAnimationFrame == "function" ? requestAnimationFrame(() => e()) : setTimeout(e, 16);
  });
}
function Qi(e, t) {
  return Promise.race([
    Promise.resolve(e).then(() => {
    }, () => {
    }),
    new Promise((r) => setTimeout(r, Math.max(0, t)))
  ]);
}
function Vh(e) {
  if (!e || typeof e.querySelectorAll != "function") return [];
  const t = typeof window < "u" && window.innerWidth || 0, r = typeof window < "u" && window.innerHeight || 0, n = [];
  let i;
  try {
    i = e.querySelectorAll("img");
  } catch {
    return [];
  }
  for (let s = 0; s < i.length && n.length < Dh; s++) {
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
async function qa(e, t = su) {
  if (typeof document > "u") return;
  const r = Date.now() + Math.max(0, t), n = () => Math.max(0, r - Date.now());
  try {
    const i = document.fonts;
    i && i.status !== "loaded" && i.ready && typeof i.ready.then == "function" && await Qi(i.ready, n());
    const s = Vh(e);
    s.length && await Qi(
      Promise.allSettled(s.map((a) => typeof a.decode == "function" ? a.decode() : Promise.resolve())),
      n()
    ), await Qi(jh(), Math.min(n(), 50));
  } catch {
  }
}
function lu(e, t) {
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
async function Yh(e) {
  if (typeof document > "u") return null;
  const t = await lu(e, ou);
  if (!t) return null;
  let r;
  try {
    r = document.createElement("canvas");
  } catch {
    return null;
  }
  r.width = xt, r.height = xt;
  const n = r.getContext("2d");
  if (!n) return null;
  try {
    n.drawImage(t, 0, 0, xt, xt);
    const { data: i } = n.getImageData(0, 0, xt, xt);
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
async function es(e) {
  if (!e || !e.startsWith("data:image/png")) return !0;
  const t = e.indexOf(","), r = t >= 0 ? e.slice(t + 1) : "";
  if (Math.floor(r.length * 3 / 4) <= $h) return !0;
  try {
    const i = await Yh(e);
    if (i !== null && i <= Fh) return !0;
  } catch {
  }
  return !1;
}
async function Gh(e) {
  if (typeof document > "u") return null;
  const t = await lu(e, ou);
  if (!t) return null;
  let r;
  try {
    r = document.createElement("canvas");
  } catch {
    return null;
  }
  r.width = xt, r.height = xt;
  const n = r.getContext("2d");
  if (!n) return null;
  try {
    n.drawImage(t, 0, 0, xt, xt);
    const { data: i } = n.getImageData(0, 0, xt, xt);
    let s = 0, a = 0;
    for (let c = 0; c < i.length; c += 4) {
      const l = i[c + 3] / 255, d = i[c] * l + 255 * (1 - l), o = i[c + 1] * l + 255 * (1 - l), h = i[c + 2] * l + 255 * (1 - l);
      0.299 * d + 0.587 * o + 0.114 * h >= Bh && a++, s++;
    }
    return s ? a / s : null;
  } catch {
    return null;
  }
}
async function Xh(e, t = {}) {
  if ((t.skippedImages ?? 0) > 0) return !0;
  try {
    const r = await Gh(e);
    if (r !== null && r >= Uh) return !0;
  } catch {
  }
  return !1;
}
const Kh = [
  "material icons",
  "material symbols",
  "fontawesome",
  "font awesome",
  "icomoon",
  "glyphicons",
  "ionicons"
], Jh = /* @__PURE__ */ new Set([
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
function Zh(e) {
  return ((e || "").split(",")[0] || "").trim().replace(/^['"]+|['"]+$/g, "").toLowerCase();
}
function Qh(e) {
  const t = (e || "").toLowerCase();
  return Kh.some((r) => t.includes(r));
}
const ef = /^[a-z0-9]+(?:[_-][a-z0-9]+)+$/i;
function tf(e) {
  const t = (e || "").trim();
  return !t || t.length > 40 || /\s/.test(t) ? !1 : ef.test(t);
}
function rf(e) {
  const t = (e.text || "").trim();
  if (!t) return !1;
  const r = e.fontFamily || "", n = Zh(r);
  return e.embeddedFamilies && n && e.embeddedFamilies.has(n) ? !1 : !!(Qh(r) || n && !Jh.has(n) && t.includes("_") && tf(t));
}
function nf(e, t) {
  var r;
  try {
    if (!e || e.nodeType !== 1) return;
    const n = e;
    if (n.childElementCount > 0) return;
    const i = n.textContent || "";
    if (!i.trim()) return;
    const s = ((r = n.style) == null ? void 0 : r.fontFamily) || "";
    if (!s) return;
    rf({ fontFamily: s, text: i, embeddedFamilies: t }) && (n.textContent = "");
  } catch {
  }
}
const ei = { cssText: "", embeddedFamilies: /* @__PURE__ */ new Set() }, sf = 3e3, of = 4e3, Wa = 24, Ha = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
async function af(e, t = of) {
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
function lf(e) {
  var n, i, s;
  const t = [];
  let r;
  try {
    r = e.styleSheets;
  } catch {
    return t;
  }
  for (let a = 0; a < r.length && t.length < Wa; a++) {
    let c = null;
    try {
      c = r[a].cssRules;
    } catch {
      continue;
    }
    if (c)
      for (let l = 0; l < c.length && t.length < Wa; l++) {
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
function cf(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function uf(e, t, r) {
  const n = new RegExp(`url\\(\\s*(['"]?)${cf(t)}\\1\\s*\\)`, "g");
  return e.replace(n, `url("${r}")`);
}
async function df(e = {}) {
  const t = /* @__PURE__ */ new Set(), r = e.doc ?? (typeof document < "u" ? document : null), n = e.faces ?? (r ? lf(r) : []);
  if (!n.length) return { cssText: "", embeddedFamilies: t };
  const i = e.baseUrl ?? (typeof location < "u" ? location.href : ""), s = e.fetchAsDataUrl ?? ((c) => af(c)), a = [];
  for (const c of n) {
    const l = [];
    Ha.lastIndex = 0;
    let d;
    for (; (d = Ha.exec(c.src)) !== null; ) {
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
      m && (o = uf(o, u, m), h = !0);
    h && (a.push(o), t.add(c.family.toLowerCase()));
  }
  return { cssText: a.join(`
`), embeddedFamilies: t };
}
async function pf() {
  try {
    return await Promise.race([
      df({}).catch(() => ei),
      new Promise((e) => setTimeout(() => e(ei), sf))
    ]);
  } catch {
    return ei;
  }
}
function hf(e, t) {
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
async function ff(e, t = {}) {
  return (await mf(e, t)).dataUrl;
}
async function mf(e, t = {}) {
  let r = 0;
  const n = t.filter, i = typeof window < "u" && Number(window.devicePixelRatio) || 1, s = t.skipFonts ? 1 : Math.min(Math.max(i, 1), 2), a = t.pixelRatio ?? s, c = t.skipFonts ? ei : await pf(), l = t.width && t.height ? { width: t.width, height: t.height } : void 0, d = async () => {
    r = 0;
    const o = !t.skipFonts && c.cssText ? { cssText: c.cssText } : !1, h = await hf(Ah(e, {
      scale: a,
      ...l ?? {},
      font: o,
      onCloneEachNode: (p) => nf(p, c.embeddedFamilies),
      maximumCanvasSize: Lh,
      fetch: { placeholderImage: _h },
      filter: (p) => n && !n(p) || Wh(p) ? !1 : qh(p) ? (r++, !1) : !0
    }), Ih);
    if (!h.startsWith("data:image/png")) throw new Error("capture returned a non-PNG result");
    return h;
  };
  await qa(e, su);
  try {
    let o = await d(), h = await es(o);
    if (h) {
      await qa(e, zh);
      try {
        const u = await d();
        await es(u) || (o = u, h = !1);
      } catch {
      }
    }
    r && Zi(`[Klavity] capture: omitted ${r} cross-origin image(s) the page's CSP/CORS blocks — captured the rest`), h && Zi("[Klavity] capture: DOM render came back blank after retry — caller may retake with the sharp path");
    const p = h ? !1 : await Xh(o, { skippedImages: r });
    return { dataUrl: o, scale: a, quality: "rendered", blank: h, partial: p, skippedImages: r };
  } catch (o) {
    const h = o instanceof Error ? o.message : String(o);
    Zi(`[Klavity] capture: renderer unavailable (${h}); using fetch-free fallback`);
    const p = Hh(e, n, a), u = await es(p.dataUrl);
    return { ...p, quality: "wireframe", blank: u, partial: !1, skippedImages: 0 };
  }
}
const gf = {
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
function yf(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function re(e, t = {}) {
  const r = gf[e];
  if (!r)
    return console.warn("[Klavity] unknown icon: " + e), "";
  const n = t.size ?? 18, i = t.class ? `icon ${t.class}` : "icon", s = t.label ? 'role="img"' : 'aria-hidden="true"', a = t.label ? `<title>${yf(t.label)}</title>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" class="${i}" width="${n}" height="${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" ${s}>${a}${r}</svg>`;
}
const cu = "https://klavity.in", Nr = {
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
function ts(e, t, r) {
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
function zn(e, t) {
  try {
    if (typeof e.measureText != "function") return 0;
    const r = e.measureText(t), n = r && r.width;
    return typeof n == "number" && Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}
function bf(e) {
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
function vf(e) {
  const t = bf(e);
  if (!t) return 0;
  const [r, n, i] = t.map((s) => s / 255);
  return 0.2126 * r + 0.7152 * n + 0.0722 * i;
}
function rs(e) {
  return vf(e) > 0.55 ? "rgba(17,17,17,0.92)" : "rgba(255,255,255,0.92)";
}
class mo {
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
    const s = rs(r);
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
      t.lineWidth = n + this.haloPad(n), t.strokeStyle = rs(r.color), t.strokeRect(r.x, r.y, r.w, r.h), t.lineWidth = n, t.strokeStyle = r.color, t.strokeRect(r.x, r.y, r.w, r.h);
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
      t.beginPath(), t.arc(r.x, r.y, n, 0, Math.PI * 2), t.fill(), t.lineWidth = this.haloPad(this.computeLineWidth()), t.strokeStyle = rs(r.color), t.stroke(), t.fillStyle = "#fff", t.font = `bold ${Math.round(n * 1.05)}px sans-serif`, t.textAlign = "center", t.textBaseline = "middle", t.fillText(String(r.n), r.x, r.y), t.textAlign = "start", t.textBaseline = "alphabetic";
    } else if (r.type === "text") {
      const { x: n, y: i, size: s, maxW: a } = this.textAnchor(r, t);
      t.font = `bold ${s}px sans-serif`, t.textBaseline = "top";
      const c = ts((o) => zn(t, o), r.text, a), l = s * 1.25, d = r.outline ?? "none";
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
            const C = (v * s + b) * 4;
            p += d[C], u += d[C + 1], m += d[C + 2], f++;
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
    r && typeof r.measureText == "function" && (r.font = `bold ${n}px sans-serif`, l = Math.max(1, ts((h) => zn(r, h), t.text, a).length));
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
    const c = ts((p) => zn(r, p), t.text, a);
    let l = 0;
    for (const p of c) l = Math.max(l, zn(r, p));
    const d = s * 1.25, o = Math.min(Math.max(s, l), Math.max(1, this.canvas.width - n)), h = Math.min(Math.max(d, c.length * d), Math.max(1, this.canvas.height - i));
    return { x: n, y: i, w: o, h };
  }
  async save() {
    const t = this.canvas.toDataURL("image/png");
    return t.length > 5 * 1024 * 1024 ? this.canvas.toDataURL("image/jpeg", 0.85) : t;
  }
}
function kf(e) {
  if (!Array.isArray(e)) return [];
  const t = [];
  for (const r of e)
    r && r.type === "text" && typeof r.text == "string" && r.text.trim() && t.push(r.text.trim());
  return t;
}
async function wf(e, t, r, n) {
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
          const o = new mo(l, e);
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
async function xf(e, t, r) {
  const n = t.backendUrl ? t : { ...t, backendUrl: cu }, i = {
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
const Sf = 50, Ef = 2e3, Cf = 1e3, Mf = 500, ja = /^(?:token|access_token|refresh_token|api[_-]?key|apikey|key|secret|password|passwd|pwd|auth|authorization|session|sid|jwt|code|otp)$/i;
function Dn(e, t) {
  e.push(t), e.length > Sf && e.shift();
}
function Ro(e, t) {
  return e.length <= t ? e : e.slice(0, t) + "…[truncated]";
}
function ns(e) {
  let t = String(e || "");
  try {
    const r = new URL(t, typeof location < "u" ? location.href : "http://localhost");
    let n = !1;
    r.searchParams.forEach((i, s) => {
      ja.test(s) && (r.searchParams.set(s, "REDACTED"), n = !0);
    }), n && (t = r.toString());
  } catch {
    t = t.replace(/([?&])([^=&]+)=([^&]*)/g, (r, n, i, s) => ja.test(i) ? `${n}${i}=REDACTED` : r);
  }
  return Ro(t, Cf);
}
function Tf(e) {
  if (typeof e == "string") return e;
  if (e instanceof Error) return e.message;
  try {
    return Ro(JSON.stringify(e), Mf);
  } catch {
    return String(e);
  }
}
function Rf(e, t = {}) {
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
function Af(e, t = {}) {
  if (typeof window > "u") return e;
  const r = window;
  if (r.__klavityCaptureInstalled) return e;
  r.__klavityCaptureInstalled = !0;
  const n = () => t.isContextValid ? t.isContextValid() : !0, i = (l, d, o) => {
    Dn(e.consoleErrors, { message: Ro(d, Ef), stack: o, timestamp: Date.now(), level: l });
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
          n() && i(d, h.map(Tf).join(" "));
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
      return Dn(e.networkFailures, { url: ns(o), status: u.status, method: String(h).toUpperCase(), timestamp: d, durationMs: Date.now() - d }), u;
    } catch (u) {
      throw Dn(e.networkFailures, { url: ns(o), status: 0, method: String(h).toUpperCase(), timestamp: d, durationMs: Date.now() - d }), u;
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
            Dn(e.networkFailures, {
              url: ns(h.url),
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
const _f = ["light", "dark", "glass", "neon", "custom", "liquid"], If = ["hidden", "icon", "full", "custom"], Lf = ["lightbulb", "bug"], Of = ["full", "reportOnly", "off"], Nf = /^#[0-9a-fA-F]{3,8}$/, Pf = /^[\w \-,'"().]+$/, Va = (e) => typeof e == "object" && e !== null, $n = (e) => typeof e == "string" && Nf.test(e.trim()) ? e.trim() : void 0, Fn = (e, t) => typeof e == "string" && e.trim() ? e.trim().slice(0, t) : void 0, zf = (e) => {
  if (typeof e != "string") return;
  const t = e.trim().slice(0, 120);
  return t && Pf.test(t) ? t : void 0;
}, Ya = {
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
function Ga(e) {
  let t = e.replace("#", "");
  t.length === 3 && (t = t.split("").map((a) => a + a).join(""));
  const r = parseInt(t.slice(0, 6), 16), n = r >> 16 & 255, i = r >> 8 & 255, s = r & 255;
  return 0.299 * n + 0.587 * i + 0.114 * s;
}
function uu(e) {
  const t = Va(e) ? e : {}, n = { theme: typeof t.theme == "string" && _f.includes(t.theme) ? t.theme : "light" }, i = $n(t.primary), s = $n(t.secondary), a = $n(t.background), c = Fn(t.thankYou, 140), l = zf(t.font);
  i && (n.primary = i), s && (n.secondary = s), a && (n.background = a), l && (n.font = l), c && (n.thankYou = c), typeof t.launcherMode == "string" && If.includes(t.launcherMode) && (n.launcherMode = t.launcherMode);
  const d = Fn(t.launcherText, 60);
  d && (n.launcherText = d);
  const o = $n(t.launcherIconColor);
  o && (n.launcherIconColor = o), typeof t.launcherIcon == "string" && Lf.includes(t.launcherIcon) && (n.launcherIcon = t.launcherIcon), typeof t.rightClickMode == "string" && Of.includes(t.rightClickMode) && (n.rightClickMode = t.rightClickMode), t.maskNumbers === !0 && (n.maskNumbers = !0), t.reportClarity === !0 ? n.reportClarity = !0 : t.reportClarity === !1 && (n.reportClarity = !1), t.preSubmitNudge === !1 ? n.preSubmitNudge = !1 : t.preSubmitNudge === !0 && (n.preSubmitNudge = !0), t.debug === !0 && (n.debug = !0), t.submitTargetToggle === !1 ? n.submitTargetToggle = !1 : t.submitTargetToggle === !0 && (n.submitTargetToggle = !0);
  const h = Fn(t.projectDisplayName, 60);
  h && (n.projectDisplayName = h);
  const p = Va(t.agency_branding) ? t.agency_branding : {};
  (t.whiteLabel === !0 || p.whiteLabel === !0) && (n.whiteLabel = !0);
  const u = Fn(t.projectId, 200);
  return u && (n.projectId = u), (t.attributionMedium === "extension" || t.attributionMedium === "widget") && (n.attributionMedium = t.attributionMedium), n;
}
function Df(e) {
  const t = uu(e), r = t.theme === "custom" ? { ...Ya.light } : { ...Ya[t.theme] };
  if (t.theme === "custom" && (t.primary && (r["--kl-accent"] = t.primary), t.secondary && (r["--kl-accent2"] = t.secondary), t.background)) {
    r["--kl-bg"] = t.background;
    const i = Ga(t.background) < 140;
    r["--kl-fg"] = i ? "#f4f4f7" : "#1d1d24", r["--kl-muted"] = i ? "rgba(255,255,255,.6)" : "#706560", r["--kl-border"] = i ? "rgba(255,255,255,.16)" : "#e6e6ec", r["--kl-chip"] = i ? "rgba(255,255,255,.08)" : "#f4f4f7", r["--kl-input-bg"] = i ? "rgba(255,255,255,.05)" : "#fafafb";
  }
  return t.font && (r["--kl-font"] = t.font), t.theme === "dark" || t.theme === "neon" || t.theme === "glass" || t.theme === "liquid" || t.theme === "custom" && t.background && Ga(t.background) < 140, r["--kl-img-outline"] = "var(--kl-img-outline-val, color-mix(in srgb, var(--kl-fg) 10%, transparent))", r["--kl-glow"] = "radial-gradient(120% 80% at 50% -10%, color-mix(in srgb, var(--kl-accent) 12%, transparent), transparent 60%), radial-gradient(80% 60% at 100% 110%, color-mix(in srgb, var(--kl-accent2) 6%, transparent), transparent 60%)", `:host{${Object.entries(r).map(([i, s]) => `${i}:${s};`).join("")}}`;
}
function $f(e, t = !1, r = !1) {
  if (!e) return "";
  let n = e;
  return n = n.replace(/\s*\b(?:new paragraph|next paragraph)\b\s*/gi, `

`), n = n.replace(/\s*\b(?:new line|next line)\b\s*/gi, `
`), n = n.replace(/\b(?:full stop|period)\b/gi, "."), n = n.replace(/\bquestion mark\b/gi, "?"), n = n.replace(/\b(?:exclamation mark|exclamation point)\b/gi, "!"), n = n.replace(/\bcomma\b/gi, ","), n = n.replace(/\bsemicolon\b/gi, ";"), n = n.replace(/\bcolon\b/gi, ":"), n = n.replace(/\s+([,.:;!?])/g, "$1"), n = n.replace(/([,.:;!?])[^\S\r\n]+/g, "$1 "), n = n.replace(/([,.:;!?])\1+/g, "$1"), n = n.replace(/([,.:;!?])([^\s\d\n,.:;!?])/g, "$1 $2"), n = n.replace(/\b(i)('m|'ve|'ll|'d)?\b/gi, (i, s, a) => "I" + (a ? a.toLowerCase() : "")), n = n.replace(/(^|[.!?\n]\s*)([a-z])/g, (i, s, a) => s + a.toUpperCase()), (r || t) && n.trim() && (n = n.trim(), r && !/[.!?:]$/.test(n) && (n += ".")), n;
}
function Un(e, t) {
  if (!e) return t;
  if (!t) return e;
  const r = e.trimEnd(), n = t.trimStart();
  return r ? n ? r + " " + n : r : n;
}
function Xa(e) {
  if (!e) return "";
  let t = e.trim();
  return t ? (t = $f(t, !0, !0), t = t.replace(/^\s*([a-z])/, (r, n) => n.toUpperCase()), t = t.replace(/([.!?\n]\s*)([a-z])/g, (r, n, i) => n + i.toUpperCase()), /[.!?:]$/.test(t) || (t += "."), t) : "";
}
const st = class st {
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
    this._recording || !st.isSupported() || (this._recording = !0, this._stopping = !1, this._stopFired = !1, this._showedReconnecting = !1, this._consecFailures = 0, this._timer = setTimeout(() => this.stop(), st.SESSION_MS), this._begin());
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
      if (i && i in st.TERMINAL_ERRORS) {
        this.onError(i, st.TERMINAL_ERRORS[i]), this._teardown();
        return;
      }
      i && i !== "no-speech" && (this._consecFailures++, this._showedReconnecting || (this._showedReconnecting = !0, this.onStatus("retrying", "Reconnecting voice…")));
    }, r.onend = () => {
      if (this._recognition = null, this._stopping || !this._recording) {
        this._emitStop();
        return;
      }
      if (this._consecFailures > st.MAX_CONSEC_FAILURES) {
        this.onError("network", "Voice disconnected — tap Voice to try again"), this._teardown();
        return;
      }
      const n = this._consecFailures === 0 ? st.BENIGN_RESTART_MS : Math.min(st.MAX_BACKOFF_MS, st.BASE_BACKOFF_MS * 2 ** (this._consecFailures - 1));
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
st.MAX_CONSEC_FAILURES = 6, st.BASE_BACKOFF_MS = 400, st.MAX_BACKOFF_MS = 8e3, st.BENIGN_RESTART_MS = 250, st.SESSION_MS = 18e4, st.TERMINAL_ERRORS = {
  "not-allowed": "Microphone access was denied",
  "service-not-allowed": "Microphone access was denied",
  "audio-capture": "No microphone was found"
};
let un = st;
function Ff() {
  const t = globalThis.MediaRecorder;
  return {
    getUserMedia: (r) => navigator.mediaDevices.getUserMedia(r),
    MediaRecorder: t,
    isTypeSupported: (r) => !!(t && t.isTypeSupported && t.isTypeSupported(r)),
    setTimeout: (r, n) => setTimeout(r, n),
    clearTimeout: (r) => clearTimeout(r)
  };
}
const Uf = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
function du(e) {
  for (const t of Uf)
    if (e.isTypeSupported(t)) return t;
  return null;
}
const qr = class qr {
  constructor(t) {
    this.onTranscript = (r) => {
    }, this.onError = (r, n) => {
    }, this.onStatus = (r, n) => {
    }, this.onStop = () => {
    }, this.onUnavailable = () => {
    }, this._recording = !1, this._stream = null, this._recorder = null, this._chunks = [], this._segTimer = null, this._sessTimer = null, this._mime = null, this._firstSegment = !0, this._transcribe = t.transcribe, this._deps = { ...Ff(), ...t.deps || {} };
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
    this._stream = t, this._mime = du(this._deps);
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
    }, this._sessTimer = this._deps.setTimeout(() => this.stop(), qr.MAX_SESSION_MS), this._beginSegment();
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
      }, qr.SEGMENT_MS);
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
qr.SEGMENT_MS = 2500, qr.MAX_SESSION_MS = 18e4;
let si = qr;
function Bf() {
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
    }, this._recording = !1, this._stream = null, this._recorder = null, this._ws = null, this._mime = null, this._connected = !1, this._everConnected = !1, this._connectTimer = null, this._sessTimer = null, this._reconnects = 0, this._stopped = !1, this._awaitingFinal = !1, this._graceTimer = null, this._flushFallbackTimer = null, this._torn = !1, this._statusShown = !1, this._stopFired = !1, this._url = t.url, this._deps = { ...Bf(), ...t.deps || {} };
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
    this._stream = t, this._mime = du(this._deps), this._sessTimer = this._deps.setTimeout(() => this.stop(), Xe.MAX_SESSION_MS), this._openSocket();
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
        this._stopRecorder(), this._flushFallbackTimer = this._deps.setTimeout(a, Xe.STOP_FLUSH_FALLBACK_MS);
      } else
        this._stopRecorder(), a();
      this._graceTimer = this._deps.setTimeout(() => this._finishGrace(), Xe.STOP_GRACE_MS);
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
Xe.MAX_SESSION_MS = 18e4, Xe.TIMESLICE_MS = 150, Xe.CONNECT_TIMEOUT_MS = 4e3, Xe.MAX_RECONNECTS = 3, Xe.BASE_BACKOFF_MS = 500, Xe.MAX_BACKOFF_MS = 4e3, Xe.STOP_GRACE_MS = 2e3, Xe.STOP_FLUSH_FALLBACK_MS = 1200;
let oi = Xe;
function qf(e) {
  return e.hasEndpoint && e.mediaRecorderSupported ? "server" : e.webSpeechSupported ? "webspeech" : "none";
}
function je(e) {
  try {
    e && e.parentNode && e.parentNode.removeChild(e);
  } catch {
  }
}
const Wf = /* @__PURE__ */ new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"]);
function hr(e) {
  const t = [], r = [], n = document.createTreeWalker(e, NodeFilter.SHOW_TEXT, {
    acceptNode(a) {
      let c = a.parentElement;
      for (; c && c !== e; ) {
        if (Wf.has(c.tagName)) return NodeFilter.FILTER_REJECT;
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
    je(a);
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
        for (const o of l) o.parentNode === a && je(o);
      }
    }
    for (const { el: a, original: c } of r)
      a.value = c;
  };
}
const pu = [
  "not working",
  "doesn't work",
  "does not work",
  "doesnt work",
  "broken",
  "pls fix",
  "please fix",
  "fix it",
  "help"
], Hf = /\b(when i|steps?|click|clicked|clicking|tap|tapped|then|go to|navigate|reload|refresh|press|select|enter)\b/i, jf = /(https?:\/\/|\s\/[a-z0-9]|^\/[a-z0-9])/i, Vf = /\b(expected?|should|instead|supposed to|meant to|i wanted)\b/i, Yf = /* @__PURE__ */ new Set([
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
]), Gf = { needs: "Needs detail", good: "Good", great: "Great" };
function Xf(e) {
  let t = e;
  for (const r of pu) t = t.split(r).join(" ");
  return t;
}
function Kf(e) {
  const t = e.split(/[^a-z0-9]+/i).filter(Boolean);
  let r = 0;
  for (const n of t)
    n.length < 3 || Yf.has(n) || r++;
  return r;
}
function hu(e) {
  const t = (e || "").trim(), r = t.toLowerCase(), n = Xf(r), i = Kf(n), s = t.length > 0 && pu.some((p) => r.includes(p)) && i < 3, a = i >= 3 && t.length >= 12, c = Vf.test(r), l = Hf.test(r) || jf.test(t), d = { problem: a, expected: c, repro: l }, o = (a ? 1 : 0) + (c ? 1 : 0) + (l ? 1 : 0), h = o >= 3 ? "great" : o === 2 ? "good" : "needs";
  return { score: o, coverage: d, level: h, label: Gf[h], vague: s };
}
function Jf(e) {
  const t = (e || "").trim();
  return t.length <= 15 ? !1 : hu(t).level !== "great";
}
const Zf = [
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
function Qf(e) {
  const t = (e || "").toLowerCase();
  return t ? Zf.some((r) => t.includes(r)) : !1;
}
function fu(e) {
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
function mu(e, t) {
  let r;
  try {
    r = new URL(e);
  } catch {
    return e;
  }
  const n = [
    ["utm_source", fu(t.source)],
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
async function em() {
  try {
    const e = navigator.permissions;
    if (!(e != null && e.query)) return !1;
    const t = await e.query({ name: "display-capture" });
    return (t == null ? void 0 : t.state) === "granted";
  } catch {
    return !1;
  }
}
function tm() {
  try {
    return location.host || location.hostname || "this site";
  } catch {
    return "this site";
  }
}
let rm = 0;
function nm(e) {
  const t = e.host || tm(), r = "kl-shp-" + ++rm, n = document.createElement("div");
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
  const C = document.createElement("div");
  C.className = "kl-shp-steer";
  const w = document.createElement("span");
  w.className = "kl-shp-n", w.textContent = "1";
  const k = document.createElement("span");
  return k.textContent = e.steer, C.append(w, k), n.append(i, s, l, C), n;
}
const im = 1, sm = 6, om = 1.08;
function am(e, t = im, r = sm) {
  return Number.isFinite(e) ? Math.min(r, Math.max(t, e)) : t;
}
function lm(e, t = om) {
  return e < 0 ? t : 1 / t;
}
function cm(e) {
  return e ? "transform .1s ease-out" : "transform .34s cubic-bezier(.22,1.24,.32,1)";
}
function gu(e, t) {
  return t > 0 ? e.width / t : 1;
}
function um(e, t, r, n, i, s) {
  const a = (e - r.left - s.panX) / n, c = (t - r.top - s.panY) / n;
  return { panX: e - r.left - i * a, panY: t - r.top - i * c };
}
function dm(e, t, r, n, i, s) {
  const a = gu(t, i) * n, c = (u) => Math.min(i, Math.max(0, u)), l = (u) => Math.min(s, Math.max(0, u)), d = a > 0 ? c((e.left - t.left - r.panX) / a) : 0, o = a > 0 ? c((e.right - t.left - r.panX) / a) : i, h = a > 0 ? l((e.top - t.top - r.panY) / a) : 0, p = a > 0 ? l((e.bottom - t.top - r.panY) / a) : s;
  return { x: d, y: h, w: Math.max(0, o - d), h: Math.max(0, p - h) };
}
function pm(e, t, r, n, i, s) {
  const a = r > 0 ? e / r * i : 0, c = n > 0 ? t / n * s : 0;
  return { ix: Math.min(i, Math.max(0, a)), iy: Math.min(s, Math.max(0, c)) };
}
function hm(e, t, r, n, i, s) {
  const a = gu(n, s) * i, c = (r.left + r.right) / 2, l = (r.top + r.bottom) / 2;
  return { panX: c - n.left - a * e, panY: l - n.top - a * t };
}
function fm(e) {
  return mu("https://klavity.in", {
    campaign: "powered-by",
    medium: "annotation-editor",
    source: "snap-widget",
    // utm_content = the customer project id, or (when we don't have one) the embedding host, so we can still
    // see who clicked.
    ref: e || fu()
  });
}
function mm(e) {
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
function gm(e, t, r) {
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
function et(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function Ka(e) {
  let t = et(String(e ?? ""));
  return t = t.replace(/`([^`\n]+)`/g, (r, n) => `<span class="kl-mk">\`</span><code>${n}</code><span class="kl-mk">\`</span>`), t = t.replace(/\*([^*\n]+)\*/g, (r, n) => `<span class="kl-mk">*</span><b>${n}</b><span class="kl-mk">*</span>`), t = t.replace(/_([^_\n]+)_/g, (r, n) => `<span class="kl-mk">_</span><i>${n}</i><span class="kl-mk">_</span>`), t = t.replace(/~([^~\n]+)~/g, (r, n) => `<span class="kl-mk">~</span><s>${n}</s><span class="kl-mk">~</span>`), t = t.replace(/\n/g, "<br>"), t;
}
function Ja(e) {
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
function ym(e) {
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
function bm(e) {
  const t = /^fb_([0-9a-f]{8})[0-9a-f-]+$/i.exec(e);
  return t ? "fb_" + t[1] : e;
}
const vm = /^[A-Za-z][A-Za-z0-9]{1,9}-\d+$/;
function km(e) {
  if (!e) return "";
  try {
    const t = new URL(e);
    if (t.protocol !== "https:" && t.protocol !== "http:") return "";
    const r = t.pathname.split("/").filter(Boolean).pop() || "";
    return vm.test(r) ? r : "";
  } catch {
    return "";
  }
}
function Za(e, t) {
  return km(t) || bm(e);
}
function Qa(e) {
  if (!e) return "";
  try {
    const t = new URL(e);
    return t.protocol === "https:" || t.protocol === "http:" ? t.href : "";
  } catch {
    return "";
  }
}
function Dt(e) {
  return typeof e == "string" ? { dataUrl: e } : { dataUrl: e.dataUrl, quality: e.quality, suggestSharp: e.suggestSharp, blank: e.blank };
}
function wm(e) {
  return e.screenCaptureDefault && typeof e.onCaptureSharp == "function" ? "screen" : typeof e.onCaptureViewport == "function" ? "viewport" : typeof e.onCaptureFull == "function" ? "full" : "none";
}
function xm(e) {
  const t = e && typeof e == "object" && "name" in e ? String(e.name) : "";
  return t === "NotAllowedError" || t === "AbortError" || t === "NotFoundError" || t === "InvalidStateError";
}
const Sm = {
  "real-pixel": { label: "Sharp", iconName: "check-circle", degraded: !1 },
  rendered: { label: "Rendered", iconName: "image", degraded: !0 },
  wireframe: { label: "Wireframe", iconName: "triangle-alert", degraded: !0 }
};
function go(e) {
  return (e.type || "").toLowerCase().startsWith("video/") || /\.(mp4|m4v|mov|webm|avi|mkv|ogv|3gp)$/i.test(e.name || "");
}
function Em(e) {
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
const Cm = "image/*,.heic,.heif,video/*,.pdf,.log,.har,.txt,.json,.csv,.zip,.xml,.yml,.yaml", Mm = 100, Tm = Mm * 1024 * 1024;
function Rm(e) {
  return (e.type || "").toLowerCase().startsWith("image/") || /\.(heic|heif|png|jpe?g|gif|webp|bmp|avif|svg)$/i.test(e.name || "");
}
function Lr(e) {
  return go(e) ? "video" : Rm(e) ? "image" : "file";
}
function Am(e, t) {
  if (e.size <= t.capBytes) return { overCap: !1 };
  const r = Math.round(t.capBytes / 1024 / 1024), n = t.role === "owner" || t.role === "admin" || t.role === "member", s = `${e.name ? `"${e.name}"` : "This file"} is over the ${r}MB limit on your plan.`, a = n ? { kind: "upgrade", label: "Request upgrade", url: t.upgradeUrl, reason: "storage_over_cap", hint: "or attach a smaller file" } : { kind: "ask-team", label: "Request upgrade", reason: "storage_over_cap", hint: "or attach a smaller file" };
  return { overCap: !0, message: s, cta: a };
}
function Bn(e) {
  return e == null || typeof e != "number" || !isFinite(e) ? null : Math.max(0, Math.min(100, Math.round(e)));
}
function _m(e, t, r = {}) {
  var wa, xa, Sa, Ea;
  const n = uu(r);
  let i = !!n.maskNumbers;
  const s = document.createElement("div");
  s.setAttribute("data-klavity-ui", "composer"), s.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;";
  const a = s.attachShadow({ mode: "open" });
  document.body.appendChild(s);
  let c = [], l = !1, d = [], o = [], h = [], p = [], u = !1, m = !1, f = !1;
  const g = !!t.onMinimize, x = g ? 8 : 5, v = 15e3, b = 10 * 1024 * 1024, C = !!t.allowFileAttachments, w = 5, k = t.maxFileBytes && t.maxFileBytes > 0 ? t.maxFileBytes : Tm, M = t.reporterRole ?? "anon", O = t.upgradeUrl, P = Math.max(120 * 1024 * 1024, k + 20 * 1024 * 1024);
  let L = [];
  const G = /* @__PURE__ */ new WeakMap(), j = () => typeof URL < "u" && typeof URL.createObjectURL == "function", _ = (y) => G.get(y) || y.dataUrl, ke = (y) => {
    const S = G.get(y);
    if (S) {
      try {
        URL.revokeObjectURL(S);
      } catch {
      }
      G.delete(y);
    }
  };
  let Ae = null;
  const he = !!(t.allowRecording && t.onRecord), ae = qf({
    hasEndpoint: !!t.onDictate,
    mediaRecorderSupported: si.isSupported(),
    webSpeechSupported: un.isSupported()
  }), Te = ae !== "none", _e = 2;
  let ve = [];
  const me = t.issueTypes && t.issueTypes.length ? t.issueTypes : null, ne = {};
  let z = null;
  const fe = () => {
    const y = Object.keys(ne);
    if (!y.length && !z) return null;
    const S = {};
    if (y.length) {
      const E = {};
      for (const T of y) E[T] = ne[T];
      const R = ne[0] ?? ne[Number(y[0])] ?? {};
      Object.assign(S, R, { byIndex: E });
    }
    return z && (S.selector = z.selector, S.selectorText = z.text), S;
  };
  let de = e, pe = 0, ie = null, le = null, Ye = null, tt = t.replayState === "attached", te = null, Ne = null, ue = null, we = !1;
  const Je = 4e3, Ce = 5e3, Fe = {}, at = {}, sr = (y) => y ? JSON.parse(JSON.stringify(y)) : null, ge = (y) => {
    var S;
    try {
      (S = t.onAnnotationsChanged) == null || S.call(t, y, sr(ne[y]));
    } catch {
    }
  }, We = () => {
    const y = {};
    for (const S of Object.keys(ne)) {
      const E = ne[S];
      E && (y[Number(S)] = sr(E));
    }
    return y;
  }, rt = (y) => ({
    url: c[y],
    compressed: d[y],
    ann: sr(ne[y])
  }), yt = (y) => {
    (Fe[y] ?? (Fe[y] = [])).push(rt(y));
  }, qt = (y, S) => {
    c[y] = S.url, d[y] = S.compressed, S.ann ? ne[y] = sr(S.ann) : delete ne[y];
  }, Wt = (y) => {
    const S = Fe[y];
    if (!S || !S.length) return !1;
    const E = S.pop(), R = at[y];
    for (; R && R.length && R[R.length - 1].mark >= S.length; ) R.pop();
    return qt(y, E), ge(y), Pe(), !0;
  }, Cn = (y) => {
    const S = at[y];
    if (!S || !S.length) return !1;
    const { snap: E, mark: R } = S.pop();
    return Fe[y] && (Fe[y].length = Math.min(Fe[y].length, R)), qt(y, E), ge(y), Pe(), !0;
  }, Jr = document.createElement("style");
  Jr.textContent = `
    ${Df(n)}
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
  `, a.appendChild(Jr);
  const or = document.createElement("div");
  or.className = "klavity-overlay";
  const se = document.createElement("div");
  se.className = "klavity-modal", se.innerHTML = `
    ${g ? '<button class="klavity-min" id="klavity-min" type="button" aria-label="Minimize" title="Minimize (keeps your evidence)"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>' : ""}
    <button class="klavity-x" id="klavity-x" type="button" aria-label="Close" title="Close (Esc)">${re("x", { size: 16 })}</button>
    <div class="kl-hero" id="klavity-hero">
      <div class="kl-hero-tools" id="klavity-hero-tools"></div>
      <div class="kl-hero-stage" id="klavity-hero-stage">
        <div class="kl-hero-empty" id="klavity-hero-empty">${re("image", { size: 34 })}<span id="klavity-hero-empty-txt">Capture or upload a screenshot to start marking it up</span></div>
      </div>
      <div class="klavity-strip" id="klavity-strip"></div>
      ${t.onCaptureSharp ? '<div class="klavity-sharphint" id="klavity-sharphint" role="status" aria-live="polite" hidden></div>' : ""}
    </div>
    <div class="kl-side" id="klavity-side">
      ${t.showTitleField ? '<label class="klavity-title-label" for="klavity-title">Title<input type="text" class="klavity-title" id="klavity-title" maxlength="200" placeholder="One line summarising the issue"></label>' : ""}
      ${me ? `<div class="klavity-types" id="klavity-types" role="radiogroup" aria-label="Issue type">${me.map((y) => `<button type="button" class="kl-type-chip${y.value === e ? " active" : ""}" data-kind="${et(y.value)}" role="radio" aria-checked="${y.value === e ? "true" : "false"}">${et(y.label)}${y.mappingLabel ? `<span class="kl-type-map">${et(y.mappingLabel)}</span>` : ""}</button>`).join("")}</div>` : `<div class="klavity-toggle">
        <button class="kl-toggle-bug ${e === "bug" ? "active" : ""}"><span class="kl-cap-ic">${re("bug")}</span>Bug</button>
        <button class="kl-toggle-feat ${e === "feature" ? "active" : ""}"><span class="kl-cap-ic">${re("lightbulb")}</span>Feature</button>
      </div>`}
      
      
      <div class="klavity-actions">
        ${t.onCaptureSharp ? `<button id="klavity-sharp" class="kl-cap-primary" aria-label="Snap capture" title="Snap capture" aria-describedby="klavity-sharp-tip"><span class="kl-cap-main"><span class="kl-cap-ic">${re("app-window")}</span><span class="kl-sharp-label">Snap</span></span><span class="kl-info-badge" aria-hidden="true"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></span><span id="klavity-sharp-tip" class="klavity-info-pop" role="tooltip"><b>Snap</b> grabs the <b>whole page — every image, embedded frame, and web font, pixel-perfect</b> using your browser's screen-share. Your browser will ask you to <b>share this tab</b>.</span></button>` : ""}
        <button id="klavity-full" title="Full Page — pixel-perfect capture of the whole page via tab share (captures embedded frames &amp; cross-origin images). Falls back to a fast render if you decline the share."><span class="kl-cap-ic">${re("camera")}</span><span class="kl-full-label">Full Page</span></button>
        
        <button id="klavity-upload" title="${C ? "Add a screenshot, video, or file (images, MP4, PDF, .log, .har, ...)" : "Upload a screenshot"}"><span class="kl-cap-ic">${re(C ? "paperclip" : "image")}</span><span class="kl-upload-label">${C ? "Attach" : "Upload"}</span></button>
        ${he ? `<button id="klavity-record" title="Record your screen, camera and narration"><span class="kl-cap-ic">${re("monitor")}</span><span class="kl-record-label">Record me</span></button>` : ""}
        ${t.onRegionCapture ? `<button id="klavity-region"><span class="kl-cap-ic">${re("scissors")}</span><span class="kl-region-label">Region</span></button>` : ""}
        ${t.onPickElement ? `<button id="klavity-pick" title="Pick the exact element that's broken"><span class="kl-cap-ic">${re("mouse-pointer-2")}</span><span class="kl-pick-label">Pick element</span></button>` : ""}
      </div>
      ${t.onPickElement ? '<div class="klavity-pickinfo" id="klavity-pickinfo" role="status" aria-live="polite" hidden></div>' : ""}
      
      
      <input type="file" id="klavity-file" accept="${C ? Cm : "image/*,.heic,.heif"}" multiple style="display:none">
      ${C ? `<div class="klavity-attach-hint" id="klavity-attach-hint"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg><span>Images, video, PDF or logs — up to ${Math.round(k / 1024 / 1024)}MB each</span></div>` : ""}
      
      <div class="klavity-descbar">
        <div class="klavity-counter" id="klavity-counter" hidden>0/${x} images</div>
        ${Te ? `<button id="klavity-voice" class="kl-voice-circle" type="button" title="Voice dictation" aria-label="Voice dictation" aria-pressed="false"><span class="kl-cap-ic">${re("mic")}<span class="kl-vdot"></span><span class="kl-vstop" aria-hidden="true"></span></span><svg class="kl-vring" viewBox="0 0 32 32" aria-hidden="true"><circle class="kl-vring-bg" cx="16" cy="16" r="13" fill="none" stroke-width="2"/><circle class="kl-vring-prog" cx="16" cy="16" r="13" fill="none" stroke-width="2" stroke-dasharray="81.68" stroke-dashoffset="81.68" stroke-linecap="round" transform="rotate(-90 16 16)"/></svg></button>` : ""}
      </div>
      ${C ? '<div class="klavity-capmsg" id="klavity-capmsg" role="alert" hidden></div>' : ""}
      ${C ? '<div class="klavity-files" id="klavity-files" hidden></div>' : ""}
      
      <div class="klavity-error" id="klavity-err"></div>
      <div class="klavity-desc" id="klavity-desc" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Description" data-ph="${e === "feature" ? "Describe the feature you'd like..." : "Describe the bug..."}"></div>
      <div class="klavity-desc-hint" id="klavity-desc-hint" hidden>${re("sparkles", { size: 13 })}<span>No title needed — we'll auto-generate one for you</span></div>
      ${t.onEnhance ? `<div class="klavity-enhance-row" id="klavity-enhance-row">
        <button type="button" class="klavity-enhance-btn" id="klavity-enhance">${re("sparkles", { size: 14 })}<span>Enhance with AI</span></button>
        <button type="button" class="klavity-enhance-undo" id="klavity-enhance-undo" hidden>${re("rotate-cw", { size: 13 })}<span>Undo</span></button>
        <button type="button" class="klavity-enhance-regen" id="klavity-enhance-regen" hidden>${re("refresh-cw", { size: 13 })}<span>Regenerate</span></button>
      </div>
      <div class="klavity-enhance-spin" id="klavity-enhance-spin" hidden><span class="kl-enh-loader"></span><span>Drafting from your screenshot…</span></div>` : ""}
      
      <label class="klavity-remail-label" for="klavity-remail">Email${t.requireEmail ? "" : " (optional)"}</label>
      <div class="klavity-remail-wrap">
        <input type="email" class="klavity-remail" id="klavity-remail" placeholder="name@company.com" autocomplete="klavity-off" autocapitalize="off" autocorrect="off" spellcheck="false" data-lpignore="true" data-1p-ignore data-form-type="other" role="combobox" aria-expanded="false" aria-autocomplete="list" aria-controls="klavity-remail-sugg">
        <span class="klavity-remail-caret" id="klavity-remail-caret" aria-hidden="true"></span>
      <div class="klavity-remail-sugg" id="klavity-remail-sugg" role="listbox" aria-label="People" hidden>
        <div class="klavity-remail-matches" id="klavity-remail-matches"></div>
        <button type="button" class="klavity-remail-sugg-opt klavity-remail-create" id="klavity-remail-addcontact" role="option" aria-selected="false" hidden>
          <span class="klavity-remail-sugg-av" aria-hidden="true">+</span>
          <span class="klavity-remail-sugg-txt">Create "<b class="klavity-remail-sugg-em"></b>"</span>
          <span class="klavity-remail-sugg-check" aria-hidden="true" hidden>${re("check", { size: 13 })}</span>
        </button>
        <div class="klavity-remail-sugg-hint" id="klavity-remail-sugg-hint">So the team can reply and tag you on this report.</div>
      </div>
      
      </div>
      ${Te ? '<div class="klavity-voice-status" id="klavity-voice-status" role="status" aria-live="polite" hidden></div>' : ""}
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
          <button type="button" class="kl-tgt-opt on" id="klavity-target-project" role="radio" aria-checked="true" data-target="project">Your team<small>${et(n.projectDisplayName || "your project")}</small></button>
          <button type="button" class="kl-tgt-opt" id="klavity-target-klavity" role="radio" aria-checked="false" data-target="klavity">Klavity<small>problem with this tool</small></button>
        </div>
      </div>` : ""}
      ${t.consoleAttachToggle ? `<div class="klavity-conlog" id="klavity-conlog">
        <label class="kl-conlog-lbl" title="Attach this page's captured console logs to the report">
          <input type="checkbox" id="klavity-conlog-cb" checked>${re("file-text", { size: 14 })}<span>Attach console logs</span>
        </label>
      </div>` : ""}
      <button type="button" class="klavity-submit" id="klavity-submit" disabled>Submit</button>
      <div class="klavity-progress" id="klavity-progress" role="progressbar" aria-label="Uploading report"><div class="klavity-progress-fill" id="klavity-progress-fill"></div></div>
    </div>
  `, or.appendChild(se), a.appendChild(or);
  const Ie = a.getElementById("klavity-sharp"), Jo = a.querySelector(".klavity-info-pop");
  if (Ie && Jo) {
    const y = document.createElement("div");
    y.className = "kl-float-tip", y.setAttribute("role", "tooltip"), y.innerHTML = Jo.innerHTML, a.appendChild(y);
    const S = nm({
      title: "One click to snap this tab",
      steer: "When the dialog appears, just click Allow — we'll grab a pixel-perfect screenshot of the issue."
    });
    S.style.position = "fixed", a.appendChild(S);
    let E = !1;
    em().then((I) => {
      E = I;
    }).catch(() => {
    });
    const R = (I, D) => {
      const $ = Ie.getBoundingClientRect(), B = Math.min(D, window.innerWidth - 16), U = 8, Y = window.innerWidth, W = window.innerHeight;
      I.style.left = Math.max(U, Math.min($.left + $.width / 2 - B / 2, Y - B - U)) + "px", I.style.top = "-9999px", I.style.visibility = "hidden", I.style.display = "block";
      const K = I.offsetHeight;
      I.style.display = "";
      let Q = $.bottom + 8;
      Q + K + U > W && (Q = $.top - K - 8), I.style.top = Math.max(U, Math.min(Q, W - K - U)) + "px", I.style.visibility = "";
    }, T = () => {
      !f && !E ? (y.classList.remove("kl-show"), R(S, 288), S.classList.add("kl-show")) : (S.classList.remove("kl-show"), R(y, 228), y.classList.add("kl-show"));
    }, A = () => {
      y.classList.remove("kl-show"), S.classList.remove("kl-show");
    };
    Ie.addEventListener("mouseenter", T), Ie.addEventListener("mouseleave", A), Ie.addEventListener("focus", T), Ie.addEventListener("blur", A);
  }
  let Zo = !1, Cr = null;
  function Ii() {
    try {
      Cr == null || Cr.remove();
    } catch {
    }
    Cr = null;
    try {
      Ie == null || Ie.classList.remove("kl-pulse");
    } catch {
    }
  }
  function Od() {
    var A;
    if (Zo || !Ie || we) return;
    Zo = !0;
    const y = document.createElement("div");
    y.className = "kl-float-tip kl-nudge", y.setAttribute("role", "status"), y.setAttribute("aria-live", "polite"), y.innerHTML = `<div class="kl-nudge-row"><span><b>This screenshot may be missing images or detail.</b> Share your screen for a pixel-perfect shot.</span><button type="button" class="kl-nudge-x" aria-label="Dismiss">${re("x", { size: 13 })}</button></div>`, a.appendChild(y), Cr = y, y.style.visibility = "hidden", y.style.left = "-9999px", y.style.top = "-9999px", y.style.display = "block";
    const S = 8, E = Math.min(228, window.innerWidth - 16);
    let R = 0;
    const T = () => {
      if (!Cr || we) return;
      const I = Ie.getBoundingClientRect();
      if ((I.width === 0 || I.height === 0) && R++ < 20) {
        requestAnimationFrame(T);
        return;
      }
      const D = window.innerWidth, $ = window.innerHeight;
      y.style.visibility = "hidden", y.style.display = "block";
      const B = y.offsetHeight;
      y.style.left = Math.max(S, Math.min(I.right - E, D - E - S)) + "px";
      let U = I.bottom + 8;
      U + B + S > $ && (U = I.top - B - 8), y.style.top = Math.max(S, Math.min(U, $ - B - S)) + "px", y.style.visibility = "", y.classList.add("kl-show");
    };
    requestAnimationFrame(T), (A = y.querySelector(".kl-nudge-x")) == null || A.addEventListener("click", Ii);
    try {
      Ie.classList.add("kl-pulse");
    } catch {
    }
    try {
      setTimeout(() => Ii(), 9e3);
    } catch {
    }
    Ie.addEventListener("click", Ii, { once: !0 });
  }
  function Nd(y) {
    tt = y === "attached", Ze();
  }
  const Qo = {
    shadowRoot: a,
    // Host seeds shots it already tracks (evidence-session restore, region-initial): fireAdded=false so
    // onShotAdded does NOT re-fire (which would double-persist). Page metadata is carried through as-is.
    addScreenshot: (y, S, E, R, T, A) => bt(y, S, E, !1, !!R, T, A),
    // fireAdded=true: select the new shot as the active hero + fire onShotAdded (persist). See interface doc.
    addCapturedShot: (y, S, E, R, T) => bt(y, S, E, !0, !!R, T),
    close: Zr,
    // KLA-772: expose the full per-image overlay map so the host can persist it on minimize.
    getAnnotations: We,
    setReplayState: Nd,
    // KLA-591: mirror the aggregate upload percent onto every video tile + file chip while a submit is in
    // flight. Re-renders the strip + chips so the bars paint; passing null clears them.
    setUploadProgress: (y) => {
      if (Ae = Bn(y), !we)
        try {
          Pe(), Pi();
        } catch {
        }
    }
  };
  function Pe() {
    const y = a.getElementById("klavity-strip"), S = a.getElementById("klavity-counter");
    y.innerHTML = "", c.forEach((E, R) => {
      const T = document.createElement("div");
      T.className = "klavity-thumb", R === pe && T.classList.add("kl-thumb-active");
      const A = document.createElement("img");
      A.src = E, A.title = "Click to select + mark up", A.addEventListener("load", () => {
        A.naturalHeight > A.naturalWidth * 1.4 && T.classList.add("kl-tall");
      }, { once: !0 }), A.addEventListener("click", () => {
        pe = R, ie = null, le = null, Pe();
      });
      const I = document.createElement("button");
      I.className = "klavity-rm", I.innerHTML = re("x", { size: 13 }), I.title = "Remove", I.addEventListener("click", (U) => {
        var Y;
        U.stopPropagation(), c.splice(R, 1), d.splice(R, 1), o.splice(R, 1), h.splice(R, 1), p.splice(R, 1), delete ne[R];
        for (const W of Object.keys(ne).map(Number).filter((K) => K > R).sort((K, Q) => K - Q))
          ne[W - 1] = ne[W], delete ne[W];
        try {
          (Y = t.onShotRemoved) == null || Y.call(t, R);
        } catch {
        }
        delete Fe[R], delete at[R];
        for (const W of Object.keys(Fe).map(Number).filter((K) => K > R).sort((K, Q) => K - Q))
          Fe[W - 1] = Fe[W], delete Fe[W];
        for (const W of Object.keys(at).map(Number).filter((K) => K > R).sort((K, Q) => K - Q))
          at[W - 1] = at[W], delete at[W];
        c.length === 0 && zt(null), Pe();
      });
      const D = document.createElement("button");
      D.className = "klavity-mk", D.innerHTML = re("pencil", { size: 13 }), D.title = "Mark up", D.addEventListener("click", (U) => {
        U.stopPropagation(), Zd(R);
      });
      const $ = document.createElement("div");
      $.className = "klavity-thumb-media", $.append(A, I, D), T.append($);
      const B = o[R];
      if (B) {
        const U = Sm[B], Y = document.createElement("span");
        if (Y.className = "klavity-qb kl-q-" + B, Y.title = B === "real-pixel" ? "Pixel-perfect capture (every image included)" : B === "wireframe" ? 'Wireframe fallback — layout only, images not captured. This shot may contain defects; share your screen with Snap (or "Retake sharp") for a pixel-perfect capture.' : 'Rendered screenshot — may be missing images or detail. This shot can contain defects; share your screen with Snap (or "Retake sharp") for a pixel-perfect capture.', Y.innerHTML = re(U.iconName, { size: 10 }) + '<span class="klavity-qb-t">' + et(U.label) + "</span>", $.appendChild(Y), U.degraded && t.onRetakeSharp) {
          const W = document.createElement("button");
          W.type = "button", W.className = "klavity-retake", W.innerHTML = re("zap", { size: 11 }) + "<span>Retake sharp</span>", W.title = "Recapture this shot at full pixel quality", W.addEventListener("click", (K) => {
            K.stopPropagation(), zd(R, W);
          }), T.appendChild(W);
        }
      }
      if (ea.has(R)) {
        const U = document.createElement("div");
        U.className = "klavity-retake-note", U.textContent = "Markup cleared for the retake.", T.appendChild(U);
      }
      y.appendChild(T);
    }), L.forEach((E, R) => {
      if (Lr(E) !== "video") return;
      const T = document.createElement("div");
      T.className = "klavity-thumb kl-video-thumb", ie === R && T.classList.add("kl-thumb-active");
      const A = document.createElement("video");
      A.src = _(E), A.muted = !0, A.preload = "metadata", A.setAttribute("playsinline", ""), A.tabIndex = -1;
      const I = document.createElement("span");
      I.className = "kl-video-play", I.setAttribute("aria-hidden", "true"), I.innerHTML = re("play", { size: 16 });
      const D = document.createElement("span");
      D.className = "kl-video-badge", D.innerHTML = re("play", { size: 9 }) + "<span>Video</span>", T.title = "Click to play " + E.name, T.addEventListener("click", () => {
        ie = R, le = null, Pe();
      });
      const $ = document.createElement("button");
      $.className = "klavity-rm", $.innerHTML = re("x", { size: 13 }), $.title = "Remove", $.addEventListener("click", (U) => {
        U.stopPropagation(), ra(R);
      }), T.append(A, I, D, $);
      const B = Bn(Ae);
      if (B != null) {
        const U = document.createElement("div");
        U.className = "kl-att-prog";
        const Y = document.createElement("i");
        Y.style.width = B + "%", U.appendChild(Y), T.appendChild(U);
      }
      y.appendChild(T);
    }), ve.forEach((E, R) => {
      const T = document.createElement("div");
      T.className = "klavity-thumb kl-video-thumb kl-rec-tile", le === R && T.classList.add("kl-thumb-active");
      const A = document.createElement("video");
      A.src = E.dataUrl, A.muted = !0, A.preload = "metadata", A.setAttribute("playsinline", ""), A.tabIndex = -1;
      const I = document.createElement("span");
      I.className = "kl-video-play", I.setAttribute("aria-hidden", "true"), I.innerHTML = re("play", { size: 16 });
      const D = Math.round(E.durationMs / 1e3), $ = document.createElement("span");
      $.className = "kl-video-badge", $.innerHTML = re("play", { size: 9 }) + `<span>${Math.floor(D / 60)}:${String(D % 60).padStart(2, "0")}${E.screenOnly ? " · screen" : ""}</span>`, T.title = "Click to play your recording", T.addEventListener("click", () => {
        le = R, ie = null, Pe();
      });
      const B = document.createElement("button");
      B.type = "button", B.className = "kl-rerec", B.innerHTML = re("refresh-cw", { size: 12 }), B.title = "Re-record", B.setAttribute("aria-label", "Re-record"), B.addEventListener("click", (W) => {
        var K;
        W.stopPropagation(), ve.splice(R, 1), le === R ? le = null : le != null && le > R && (le -= 1), zi();
        try {
          (K = a.getElementById("klavity-record")) == null || K.click();
        } catch {
        }
      });
      const U = document.createElement("button");
      U.className = "klavity-rm", U.innerHTML = re("x", { size: 13 }), U.title = "Remove", U.addEventListener("click", (W) => {
        W.stopPropagation(), ve.splice(R, 1), le === R ? le = null : le != null && le > R && (le -= 1), zi();
      }), T.append(A, I, $, B, U);
      const Y = Bn(Ae);
      if (Y != null) {
        const W = document.createElement("div");
        W.className = "kl-att-prog";
        const K = document.createElement("i");
        K.style.width = Y + "%", W.appendChild(K), T.appendChild(W);
      }
      y.appendChild(T);
    });
    try {
      const E = y.children[pe];
      E && typeof E.scrollIntoView == "function" && E.scrollIntoView({ block: "nearest", inline: "nearest" });
    } catch {
    }
    if (l) {
      const E = document.createElement("div");
      E.className = "kl-thumb-skel kl-loading", E.setAttribute("role", "status"), E.setAttribute("aria-label", "Capturing screenshot"), E.innerHTML = '<span class="kl-skel-spin" aria-hidden="true"></span><span>Capturing…</span>', y.appendChild(E);
    }
    S.textContent = `${c.length}/${x} images`, S instanceof HTMLElement && (S.hidden = c.length === 0), Ze(), Mn(), va();
  }
  function Mn() {
    const y = a.getElementById("klavity-sharphint");
    if (!y) return;
    if (c.length > 0 && pe >= 0 && pe < c.length && !!h[pe] && !u && !!t.onCaptureSharp && !Ct) {
      if (!y.dataset.built) {
        y.dataset.built = "1", y.innerHTML = "";
        const R = document.createElement("span");
        R.className = "kl-sh-ic", R.innerHTML = re("triangle-alert", { size: 15 });
        const T = document.createElement("span");
        T.className = "kl-sh-txt", T.textContent = "This screenshot may be missing images or detail. Share your screen with Snap for a pixel-perfect shot.";
        const A = document.createElement("button");
        A.type = "button", A.className = "kl-sh-use", A.textContent = "Use Snap", A.addEventListener("click", () => {
          u = !0, Mn(), Ie == null || Ie.click();
        });
        const I = document.createElement("button");
        I.type = "button", I.className = "kl-sh-x", I.setAttribute("aria-label", "Dismiss"), I.title = "Dismiss", I.innerHTML = re("x", { size: 12 }), I.addEventListener("click", () => {
          u = !0, Mn();
        }), y.append(R, T, A, I);
      }
      y.hidden = !1, Ie == null || Ie.classList.add("kl-suggest");
    } else
      y.hidden = !0, Ie == null || Ie.classList.remove("kl-suggest");
  }
  function Li() {
    m = !0, l = !1, Pe();
  }
  function Pd() {
    return m ? t.onCaptureSharp ? "Couldn't grab this page automatically — click Snap to share your tab for a pixel-perfect shot, or attach an image." : "Couldn't grab this page automatically — try Full Page, or attach an image." : "Capture or upload a screenshot to start marking it up";
  }
  function Pt(y) {
    const S = a.getElementById("klavity-err");
    S && (S.textContent = y, S.style.display = "block");
  }
  function Oi() {
    const y = a.getElementById("klavity-err");
    y && (y.style.display = "none");
  }
  function bt(y, S, E, R = !0, T = !1, A, I) {
    var $;
    if (c.length >= x) {
      Pt(`You can attach up to ${x} images.`);
      return;
    }
    Oi(), m = !1, c.push(y);
    const D = c.length - 1;
    if (I && Array.isArray(I.shapes) && I.shapes.length && (ne[D] = sr(I)), d.push(t.compressImage ? t.compressImage(y) : Promise.resolve(y)), o.push(S), h.push(T && S !== "real-pixel"), p.push(A), R && (pe = c.length - 1, ie = null, le = null), Pe(), R)
      try {
        ($ = t.onShotAdded) == null || $.call(t, y, S);
      } catch {
      }
  }
  const ea = /* @__PURE__ */ new Set();
  async function zd(y, S) {
    if (!(Ct || !t.onRetakeSharp)) {
      lt(!0), S.classList.add("kl-loading"), s.style.display = "none";
      try {
        const E = i ? hr(document.body) : null;
        let R;
        try {
          R = await t.onRetakeSharp(p[y]);
        } finally {
          E == null || E();
        }
        if (R) {
          const { dataUrl: T, quality: A } = Dt(R);
          T && (c[y] = T, d[y] = t.compressImage ? t.compressImage(T) : Promise.resolve(T), o[y] = A ?? "real-pixel", h[y] = !1, ne[y] && (delete ne[y], ea.add(y), ge(y)), delete Fe[y], delete at[y]);
        }
      } catch {
      } finally {
        s.style.display = "", lt(!1), Pe();
      }
    }
  }
  function ta(y) {
    return y.type.startsWith("image/") || /\.(heic|heif|png|jpe?g|gif|webp|bmp|avif|svg)$/i.test(y.name);
  }
  async function Ni(y) {
    Oi();
    for (const S of y) {
      if (c.length >= x) {
        Pt(`You can attach up to ${x} images.`);
        break;
      }
      if (!ta(S)) {
        Pt(`"${S.name}" isn't an image — only image files can be attached.`);
        continue;
      }
      if (S.size > b) {
        Pt(`"${S.name}" is too large — images must be under ${Math.round(b / 1024 / 1024)} MB.`);
        continue;
      }
      try {
        bt(await el(S));
      } catch {
        Pt(`Couldn't add "${S.name}". Please try a different image.`);
      }
    }
  }
  function Pi() {
    const y = a.getElementById("klavity-files");
    if (!y) return;
    y.innerHTML = "";
    const S = L.filter((E) => Lr(E) === "file");
    y.hidden = S.length === 0, L.forEach((E, R) => {
      if (Lr(E) !== "file") return;
      const T = document.createElement("div");
      T.className = "kl-file-chip";
      const A = document.createElement("span");
      A.className = "kl-file-ic", A.innerHTML = re("file-text", { size: 14 });
      const I = document.createElement("span");
      I.className = "kl-file-nm", I.textContent = E.name, I.title = E.name;
      const D = document.createElement("span");
      D.className = "kl-file-sz", D.textContent = E.size < 1024 ? `${E.size} B` : E.size < 1024 * 1024 ? `${Math.round(E.size / 1024)} KB` : `${(E.size / 1024 / 1024).toFixed(1)} MB`;
      const $ = document.createElement("button");
      $.type = "button", $.className = "kl-file-rm", $.setAttribute("aria-label", `Remove ${E.name}`), $.title = "Remove", $.innerHTML = re("x", { size: 11 }), $.addEventListener("click", () => {
        ra(R);
      }), T.append(A, I, D, $);
      const B = Bn(Ae);
      if (B != null) {
        const U = document.createElement("div");
        U.className = "kl-att-prog";
        const Y = document.createElement("i");
        Y.style.width = B + "%", U.appendChild(Y), T.appendChild(U);
      }
      y.appendChild(T);
    }), Ze();
  }
  function ra(y) {
    const S = L[y] && Lr(L[y]) === "video";
    L[y] && ke(L[y]), L.splice(y, 1), ie != null && (S && ie === y ? ie = null : ie > y && (ie -= 1)), Pi(), Pe();
  }
  function Dd(y, S) {
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
        T = await t.onRequestUpgrade({ reason: y.reason || "upgrade", context: S });
      } catch {
        T = !1;
      }
      if (T) {
        const A = document.createElement("span");
        A.className = "kl-capmsg-sent", A.innerHTML = `<span class="kl-capmsg-sent-ic">${re("check")}</span>Request sent to your team`, E.replaceWith(A);
      } else
        E.disabled = !1, E.textContent = R;
    }), E;
  }
  function $d(y, S) {
    const E = a.getElementById("klavity-capmsg");
    if (!E || !y.overCap) return;
    E.innerHTML = "";
    const R = document.createElement("span");
    if (R.className = "kl-capmsg-t", R.textContent = y.message || "", E.appendChild(R), y.cta) {
      const T = Dd(y.cta, S);
      if (T && E.appendChild(T), y.cta.hint) {
        const A = document.createElement("span");
        A.className = "kl-capmsg-hint", A.textContent = y.cta.hint, E.appendChild(A);
      }
    }
    E.hidden = !1;
  }
  function Fd() {
    const y = a.getElementById("klavity-capmsg");
    y && (y.hidden = !0, y.innerHTML = "");
  }
  async function Ud(y) {
    Oi(), Fd();
    for (const S of y) {
      if (ta(S)) {
        await Ni([S]);
        continue;
      }
      if (L.length >= w) {
        Pt(`You can attach up to ${w} files.`);
        break;
      }
      const E = Am(S, { capBytes: k, role: M, upgradeUrl: O });
      if (E.overCap) {
        $d(E, {
          page: (typeof location < "u" ? location.href : "") || "",
          fileMeta: { name: S.name, sizeMb: Math.round(S.size / 1024 / 1024 * 10) / 10 }
        });
        continue;
      }
      if (L.reduce((T, A) => T + A.size, 0) + S.size > P) {
        Pt(`Attachments exceed the ${Math.round(P / 1024 / 1024)} MB total limit.`);
        break;
      }
      try {
        const T = S.type || (go(S) ? Em(S.name) : ""), A = go(S) && j(), I = A ? { name: S.name, type: T, size: S.size, dataUrl: "", blob: S } : { name: S.name, type: T, size: S.size, dataUrl: await el(S) };
        if (A)
          try {
            G.set(I, URL.createObjectURL(S));
          } catch {
          }
        const D = L.push(I) - 1;
        Pi(), Lr(L[D]) === "video" && (ie = D), Pe();
      } catch {
        Pt(`Couldn't add "${S.name}". Please try a different file.`);
      }
    }
  }
  function zi() {
    we || (Pe(), Ze());
  }
  let ar = null;
  function Zr(y) {
    var R;
    if (we) return;
    we = !0;
    for (const T of L) ke(T);
    ar == null || ar(), ue && (clearTimeout(ue), ue = null), document.removeEventListener("keydown", lr, { capture: !0 }), document.removeEventListener("paste", ia);
    try {
      (R = t.onClose) == null || R.call(t, y == null ? void 0 : y.reason);
    } catch {
    }
    const S = a.querySelector(".klavity-modal");
    if (y != null && y.immediate || !S) {
      je(s);
      return;
    }
    S.classList.add("kl-closing");
    const E = () => je(s);
    S.addEventListener("animationend", E, { once: !0 }), setTimeout(E, 700);
  }
  function na(y, S) {
    if (ue || we) return;
    const E = document.createElement("div");
    E.className = "klavity-toast-progress", E.style.animationDuration = S + "ms", y.appendChild(E);
    let R = S, T = Date.now();
    const A = () => {
      T = Date.now(), ue = setTimeout(() => {
        Zr();
      }, R);
    }, I = () => {
      ue && (clearTimeout(ue), ue = null, R = Math.max(0, R - (Date.now() - T)), E.style.animationPlayState = "paused");
    }, D = () => {
      ue || y.classList.contains("kl-closing") || (E.style.animationPlayState = "running", A());
    };
    y.addEventListener("mouseenter", I), y.addEventListener("mouseleave", D), y.addEventListener("focusin", I), y.addEventListener("focusout", ($) => {
      y.contains($.relatedTarget) || D();
    }), A();
  }
  function lr(y) {
    var S;
    if (Rn) {
      y.key === "Escape" ? (y.stopPropagation(), Rn()) : (y.key === "s" || y.key === "S") && y.stopPropagation();
      return;
    }
    if (y.key === "Escape") {
      y.stopPropagation(), Fi();
      return;
    }
    if ((y.key === "s" || y.key === "S") && !y.metaKey && !y.ctrlKey && !y.altKey) {
      const E = typeof y.composedPath == "function" && y.composedPath()[0] || y.target;
      if (E && (E.tagName === "INPUT" || E.tagName === "TEXTAREA" || E.tagName === "SELECT" || E.isContentEditable || ((S = E.getAttribute) == null ? void 0 : S.call(E, "contenteditable")) === "true") || a.querySelector(".kl-edtb")) return;
      const R = a.getElementById("klavity-submit");
      R && !R.disabled && (y.preventDefault(), y.stopPropagation(), R.click());
    }
  }
  document.addEventListener("keydown", lr, { capture: !0 });
  const ia = (y) => {
    if (!y.clipboardData) return;
    const S = Array.from(y.clipboardData.items).filter((E) => E.type.startsWith("image/")).map((E) => E.getAsFile()).filter((E) => !!E);
    S.length && Ni(S);
  };
  document.addEventListener("paste", ia);
  const Di = () => {
    const y = se.querySelector("#klavity-desc");
    y && (y.placeholder = de === "feature" ? "Describe the feature you'd like..." : de === "bug" ? "Describe the bug..." : "Describe the issue...");
  };
  if (me) {
    const y = Array.from(se.querySelectorAll(".kl-type-chip"));
    y.forEach((S) => {
      S.addEventListener("click", () => {
        de = S.getAttribute("data-kind") || "bug", y.forEach((E) => {
          const R = E === S;
          E.classList.toggle("active", R), E.setAttribute("aria-checked", R ? "true" : "false");
        }), Di();
      });
    });
  } else {
    const y = se.querySelector(".kl-toggle-bug"), S = se.querySelector(".kl-toggle-feat");
    y.addEventListener("click", () => {
      de = "bug", y.classList.add("active"), S.classList.remove("active"), Di();
    }), S.addEventListener("click", () => {
      de = "feature", S.classList.add("active"), y.classList.remove("active"), Di();
    });
  }
  let sa = "project";
  {
    const y = se.querySelector("#klavity-target");
    if (y) {
      const S = Array.from(y.querySelectorAll(".kl-tgt-opt"));
      for (const E of S)
        E.addEventListener("click", () => {
          sa = E.dataset.target === "klavity" ? "klavity" : "project";
          for (const T of S) {
            const A = T === E;
            T.classList.toggle("on", A), T.setAttribute("aria-checked", A ? "true" : "false");
          }
        });
    }
  }
  const H = se.querySelector("#klavity-desc");
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
    }, S = () => {
      const T = y();
      if (!T || !T.rangeCount) return -1;
      try {
        const A = T.getRangeAt(0);
        if (!H.contains(A.endContainer)) return -1;
        const I = A.cloneRange();
        return I.selectNodeContents(H), I.setEnd(A.endContainer, A.endOffset), I.toString().length;
      } catch {
        return -1;
      }
    }, E = (T) => {
      const A = y();
      if (A)
        try {
          const I = document.createRange(), D = document.createTreeWalker(H, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
          let $, B = T, U = !1;
          for (; $ = D.nextNode(); ) {
            if ($.nodeName === "BR") {
              if (B === 0) {
                I.setStartBefore($), U = !0;
                break;
              }
              B -= 1;
              continue;
            }
            if ($.nodeType === 3) {
              const Y = ($.textContent || "").length;
              if (B <= Y) {
                I.setStart($, B), U = !0;
                break;
              }
              B -= Y;
            }
          }
          U ? I.collapse(!0) : (I.selectNodeContents(H), I.collapse(!1)), A.removeAllRanges(), A.addRange(I);
        } catch {
        }
    }, R = () => {
      const T = S(), A = Ja(H).replace(/\n$/, "");
      H.innerHTML = A ? Ka(A) : "", T >= 0 && E(T);
    };
    H.addEventListener("input", R), Object.defineProperty(H, "value", {
      configurable: !0,
      get() {
        return Ja(H);
      },
      set(T) {
        const A = String(T ?? "").replace(/\n$/, "");
        H.innerHTML = A ? Ka(A) : "";
      }
    }), Object.defineProperty(H, "disabled", {
      configurable: !0,
      get() {
        return H.getAttribute("contenteditable") === "false";
      },
      set(T) {
        H.setAttribute("contenteditable", T ? "false" : "true"), H.classList.toggle("kl-desc-disabled", !!T);
      }
    }), Object.defineProperty(H, "placeholder", {
      configurable: !0,
      get() {
        return H.getAttribute("data-ph") || "";
      },
      set(T) {
        H.setAttribute("data-ph", String(T ?? ""));
      }
    });
  }
  const cr = se.querySelector("#klavity-submit"), xe = se.querySelector("#klavity-remail");
  let Qr = "", en = !1;
  xe && t.prefillEmail && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t.prefillEmail) && (xe.value = t.prefillEmail), xe && xe.value.trim() && (Qr = xe.value.trim().toLowerCase());
  const oa = se.querySelector("#klavity-desc-hint"), Bd = () => !t.requireEmail || !!xe && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(xe.value.trim()), $i = () => {
    var y;
    return c.length > 0 || tt || L.length > 0 || ve.length > 0 || H.value.trim().length > 0 || (((y = se.querySelector("#klavity-title")) == null ? void 0 : y.value.trim().length) ?? 0) > 0;
  };
  let Tn = null, Rn = null;
  const Fi = () => {
    var R, T, A;
    if (!$i()) {
      Zr();
      return;
    }
    if (Tn) return;
    const y = document.createElement("div");
    Tn = y, y.setAttribute("role", "alertdialog"), y.setAttribute("aria-modal", "true"), y.setAttribute("aria-labelledby", "kl-cc-title"), y.style.cssText = "position:absolute;inset:0;z-index:30;display:flex;align-items:center;justify-content:center;background:rgba(12,10,8,.55);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)", y.innerHTML = '<div style="max-width:340px;background:var(--kl-bg,#1c1712);color:var(--kl-fg,#f5f3ee);border:1px solid var(--kl-border,#574f45);border-radius:14px;padding:20px 20px 16px;box-shadow:0 18px 48px rgba(0,0,0,.45);font-family:var(--kl-font,system-ui,sans-serif)"><div id="kl-cc-title" style="font-size:15px;font-weight:600;margin-bottom:6px">Discard this capture?</div><div style="font-size:13px;opacity:.8;line-height:1.45;margin-bottom:16px">Your screenshot and any annotations, recording or attached files will be lost.</div><div style="display:flex;gap:8px;justify-content:flex-end"><button id="kl-cc-keep" style="padding:8px 14px;border-radius:9px;border:1px solid var(--kl-border,#574f45);background:transparent;color:inherit;font-size:13px;font-weight:600;cursor:pointer">Keep editing</button><button id="kl-cc-discard" style="padding:8px 14px;border-radius:9px;border:none;background:#c0392b;color:#fff;font-size:13px;font-weight:600;cursor:pointer">Discard</button></div></div>';
    const S = () => {
      je(y), Tn === y && (Tn = null, Rn = null);
    };
    Rn = S, y.addEventListener("click", (I) => {
      I.target === y && S();
    }), (R = y.querySelector("#kl-cc-keep")) == null || R.addEventListener("click", S), (T = y.querySelector("#kl-cc-discard")) == null || T.addEventListener("click", () => {
      S(), Zr({ reason: "discard" });
    }), (a.querySelector(".klavity-modal") || or).appendChild(y);
    try {
      (A = y.querySelector("#kl-cc-keep")) == null || A.focus();
    } catch {
    }
  }, qd = () => {
  }, Ze = () => {
    const y = H.value.trim() === "";
    cr.disabled = y && !$i() || !Bd(), oa && (oa.hidden = !(y && $i()));
  };
  if (H.addEventListener("input", qd), H.addEventListener("input", Ze), xe == null || xe.addEventListener("input", Ze), t.onDescriptionChange) {
    const y = t.onDescriptionChange;
    let S = null;
    const E = () => {
      S && (clearTimeout(S), S = null);
      try {
        y(H.value);
      } catch {
      }
    };
    H.addEventListener("input", () => {
      S && clearTimeout(S), S = setTimeout(E, 600);
    }), H.addEventListener("blur", E), H.addEventListener("change", E), typeof window < "u" && (window.addEventListener("beforeunload", E), window.addEventListener("pagehide", E));
  }
  const tn = se.querySelector("#klavity-title");
  if (tn && t.onTitleChange) {
    const y = t.onTitleChange;
    let S = null;
    const E = () => {
      S && (clearTimeout(S), S = null);
      try {
        y(tn.value);
      } catch {
      }
    };
    tn.addEventListener("input", () => {
      S && clearTimeout(S), S = setTimeout(E, 600);
    }), tn.addEventListener("blur", E), tn.addEventListener("change", E), typeof window < "u" && (window.addEventListener("beforeunload", E), window.addEventListener("pagehide", E));
  }
  const ur = se.querySelector("#klavity-remail-sugg"), Ui = se.querySelector("#klavity-remail-matches"), aa = se.querySelector("#klavity-remail-sugg-hint"), Gt = se.querySelector("#klavity-remail-addcontact"), la = se.querySelector(".klavity-remail-sugg-em"), ca = se.querySelector(".klavity-remail-sugg-check");
  let Et = !1, Mr = "", An = [], Bi = "", qi = !1, ua = 0;
  const da = (y) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(y), Wd = (y) => {
    var R, T;
    const S = (y.name || y.email).trim(), E = S.split(/[\s._-]+/).filter(Boolean);
    return ((((R = E[0]) == null ? void 0 : R[0]) || "") + (((T = E[1]) == null ? void 0 : T[0]) || "")).toUpperCase() || S.slice(0, 1).toUpperCase();
  }, Hd = (y) => {
    let S = 0;
    for (let E = 0; E < y.length; E++) S = S * 31 + y.charCodeAt(E) >>> 0;
    return `hsl(${S % 360} 58% 42%)`;
  };
  async function pa(y) {
    if (!t.onLookupPeople) {
      An = [], Bi = y, qi = !0;
      return;
    }
    const S = ++ua;
    try {
      const E = await t.onLookupPeople(y);
      if (S !== ua) return;
      An = Array.isArray(E) ? E : [];
    } catch {
      An = [];
    }
    Bi = y, qi = !0, Xt();
  }
  function Xt() {
    if (!ur || !xe) return;
    const y = xe.value.trim(), S = y.toLowerCase();
    Et && S !== Mr && (Et = !1, Mr = "");
    const E = en ? An.filter((I) => !S || I.email.toLowerCase().includes(S) || (I.name || "").toLowerCase().includes(S)) : [], R = E.some((I) => I.email.toLowerCase() === S), T = en && da(y) && !R;
    Ui && (Ui.innerHTML = E.map((I) => `
        <button type="button" class="klavity-remail-person" role="option" data-email="${et(I.email)}">
          <span class="klavity-remail-av" style="background:${et(Hd(I.email))}">${et(Wd(I))}</span>
          <span class="klavity-remail-who">${I.name ? `${et(I.name)} <i>(${et(I.email)})</i>` : et(I.email)}</span>
        </button>`).join(""), Ui.querySelectorAll(".klavity-remail-person").forEach((I) => {
      I.addEventListener("click", () => {
        xe.value = I.getAttribute("data-email") || "", Et = !1, Mr = "", Qr = xe.value.trim().toLowerCase(), Xt(), Ze();
      });
    }));
    const A = xe.parentElement;
    A && A.classList.contains("klavity-remail-wrap") && A.classList.toggle("is-open", !!(E.length || T)), xe.setAttribute("aria-expanded", E.length || T ? "true" : "false"), Gt && (Gt.hidden = !T), aa && (aa.hidden = !T), ur.hidden = !(E.length || T), la && (la.textContent = y), ca && (ca.hidden = !Et), Gt == null || Gt.setAttribute("aria-selected", Et ? "true" : "false");
  }
  Gt == null || Gt.addEventListener("click", () => {
    const y = (xe == null ? void 0 : xe.value.trim()) || "";
    da(y) && (Et = !Et, Mr = Et ? y.toLowerCase() : "", Qr = Et ? y.toLowerCase() : "", Xt(), Ze());
  });
  function jd() {
    if (!xe || t.requireEmail) return;
    const y = xe.value.trim();
    y && y.toLowerCase() !== Qr && (xe.value = "", Et = !1, Mr = "", Qr = "", Xt(), Ze());
  }
  function ha() {
    setTimeout(() => {
      const S = se.getRootNode().activeElement;
      S === xe || ur && S && ur.contains(S) || (en = !1, jd(), Xt());
    }, 0);
  }
  xe == null || xe.addEventListener("blur", ha), ur == null || ur.addEventListener("focusout", ha);
  let Wi = null;
  if (xe == null || xe.addEventListener("focus", () => {
    en = !0, Xt(), qi || pa("");
  }), xe == null || xe.addEventListener("input", () => {
    en = !0, Xt();
    const y = xe.value.trim().toLowerCase();
    y !== Bi && (Wi && clearTimeout(Wi), Wi = setTimeout(() => {
      pa(y);
    }, 180));
  }), Xt(), t.onEnhance) {
    const y = t.onEnhance, S = se.querySelector("#klavity-enhance"), E = se.querySelector("#klavity-enhance-undo"), R = se.querySelector("#klavity-enhance-regen"), T = se.querySelector("#klavity-enhance-spin");
    let A = 0, I = null;
    const D = () => c[pe] || c[0] || "", $ = () => {
      const U = D();
      if (!U) return "";
      const Y = pe >= 0 && pe < c.length ? pe : 0, W = ne[Y] ?? (Y === 0 ? ne[0] : null);
      if (!W || !Array.isArray(W.shapes) || !W.shapes.length) return U;
      const K = a.getElementById("klavity-hero-stage"), Q = K == null ? void 0 : K.querySelector("canvas");
      if (Q && pe === Y && Q.width > 1 && Q.height > 1)
        try {
          const oe = Q.toDataURL("image/png");
          if (oe && oe.length > 64) return oe;
        } catch {
        }
      return null;
    }, B = async () => {
      if (Ct) return;
      const U = H.value.trim();
      I = H.value;
      const Y = ++A;
      S && (S.disabled = !0), T && (T.hidden = !1);
      try {
        const W = z ? { selector: z.selector, text: z.text } : null, K = pe >= 0 && pe < c.length ? pe : 0, Q = ne[K] ?? (K === 0 ? ne[0] : null), oe = kf(Q == null ? void 0 : Q.shapes), X = D();
        let Se = $();
        Se === null && (Se = await wf(X, Q.shapes, Q.w, Q.h));
        const De = await y(U, {
          images: c.length,
          shot: Se,
          annotations: Q,
          annotationTexts: oe,
          picked: W
        });
        if (Y !== A || !De) return;
        H.value = ym(De), H.dispatchEvent(new Event("input", { bubbles: !0 })), te = De.suggestedSeverity || null, Ne = De.suggestedPriority || null, H.classList.add("kl-just-enhanced"), setTimeout(() => H.classList.remove("kl-just-enhanced"), 700), E && (E.hidden = !1), R && (R.hidden = !1), Ze();
      } catch {
      } finally {
        Y === A && (S && (S.disabled = !1), T && (T.hidden = !0));
      }
    };
    S == null || S.addEventListener("click", () => {
      B();
    }), R == null || R.addEventListener("click", () => {
      B();
    }), E == null || E.addEventListener("click", () => {
      I !== null && (H.value = I, H.dispatchEvent(new Event("input", { bubbles: !0 })), Ze()), I = null, te = null, Ne = null, E && (E.hidden = !0), R && (R.hidden = !0);
    });
  }
  if (t.onCheckKnown) {
    const y = se.querySelector("#klavity-known"), S = t.onCheckKnown;
    let E = null, R = 0, T = "";
    const A = () => {
      y && (y.hidden = !0, y.textContent = "");
    }, I = ($) => {
      var U;
      if (!y) return;
      const B = $.headline ? et($.headline) : "Already reported";
      y.innerHTML = `<span class="kl-known-ic">${re("check-circle", { size: 15 })}</span><div class="kl-known-body"><span class="kl-known-title">${B}</span> — status: <span class="kl-known-status">${et($.statusLabel)}</span>. We're already tracking "${et($.title)}". Add your note and submit anyway — it'll be linked.</div><button type="button" class="kl-known-dismiss" id="klavity-known-dismiss">Dismiss</button>`, y.hidden = !1, (U = y.querySelector("#klavity-known-dismiss")) == null || U.addEventListener("click", () => {
        T = H.value.trim(), A();
      });
    }, D = async () => {
      const $ = H.value.trim();
      if ($.length < 12 || $ === T) {
        A();
        return;
      }
      const B = ++R;
      try {
        const U = await S($);
        if (B !== R) return;
        if (H.value.trim() === T) {
          A();
          return;
        }
        U ? I(U) : A();
      } catch {
      }
    };
    H.addEventListener("input", () => {
      H.value.trim() !== T && (T = ""), E && clearTimeout(E), E = setTimeout(D, 500);
    });
  }
  if (n.reportClarity) {
    const y = se.querySelector("#klavity-clarity"), S = se.querySelector("#klavity-clarity-status"), E = {
      problem: se.querySelector("#klavity-clarity-problem"),
      expected: se.querySelector("#klavity-clarity-expected"),
      repro: se.querySelector("#klavity-clarity-repro")
    }, R = se.querySelector("#klavity-clarity-tip"), T = se.querySelector("#klavity-clarity-tip-text"), A = se.querySelector("#klavity-nudge"), I = t.onClarityTip, D = /* @__PURE__ */ new Map();
    let $ = null, B = 0;
    const U = (oe, X, Se) => {
      if (!oe) return;
      oe.classList.toggle("done", X);
      const De = oe.querySelector(".kl-clr-mark");
      De && (De.innerHTML = X ? re("check", { size: 12 }) : "○"), oe.setAttribute("aria-label", (X ? "covered: " : "missing: ") + Se);
    }, Y = () => {
      R && (R.hidden = !0);
    }, W = (oe) => {
      !R || !T || Qf(oe) || (T.innerHTML = et(oe) + '<span class="kl-clr-aitag">AI</span>', R.hidden = !1);
    }, K = () => {
      const oe = H.value, X = hu(oe);
      y && (y.hidden = oe.trim().length === 0, y.classList.remove("l1", "l2", "l3"), y.classList.add(X.level === "great" ? "l3" : X.level === "good" ? "l2" : "l1")), S && (S.textContent = X.label), U(E.problem, X.coverage.problem, "What's broken"), U(E.expected, X.coverage.expected, "What you expected"), U(E.repro, X.coverage.repro, "How to reproduce"), A && !A.hidden && (A.hidden = !0), X.level === "great" && Y();
    }, Q = () => {
      !I || !R || ($ && clearTimeout($), $ = setTimeout(async () => {
        const oe = H.value.trim();
        if (!Jf(oe)) {
          Y();
          return;
        }
        if (D.has(oe)) {
          W(D.get(oe));
          return;
        }
        const X = ++B;
        try {
          const Se = await I(oe, { images: c.length });
          if (X !== B || H.value.trim() !== oe) return;
          Se && Se.tip && (D.set(oe, Se.tip), W(Se.tip));
        } catch {
        }
      }, 1e3));
    };
    H.addEventListener("input", () => {
      K(), Q();
    }), K(), (wa = se.querySelector("#klavity-nudge-add")) == null || wa.addEventListener("click", () => {
      A && (A.hidden = !0);
      try {
        H.focus();
      } catch {
      }
    }), (xa = se.querySelector("#klavity-nudge-anyway")) == null || xa.addEventListener("click", () => {
      A && (A.hidden = !0), cr.click();
    });
  }
  or.addEventListener("click", (y) => {
    y.target === or && Fi();
  }), (Sa = se.querySelector("#klavity-x")) == null || Sa.addEventListener("click", () => Fi()), (Ea = se.querySelector("#klavity-min")) == null || Ea.addEventListener("click", () => {
    var y;
    try {
      (y = t.onMinimize) == null || y.call(t);
    } catch {
    }
  });
  const fa = () => Array.from(se.querySelectorAll(".klavity-actions button:not(#klavity-voice)"));
  let Ct = !1;
  const lt = (y) => {
    Ct = y, fa().forEach((E) => {
      E.disabled = y;
    }), H.disabled = y;
    const S = se.querySelector("#klavity-voice");
    S && (S.disabled = y), se.querySelectorAll(".kl-htool,.kl-htbtn,.kl-hopt,.kl-hcolor").forEach((E) => {
      E.disabled = y;
    }), a.querySelectorAll("#klavity-title,#klavity-remail,.kl-type-chip,.klavity-toggle button,#klavity-mask-numbers,.kl-file-rm,.klavity-rm,.klavity-mk,.klavity-retake").forEach((E) => {
      E.disabled = y;
    }), y ? (ar == null || ar(), cr.disabled = !0) : (Ze(), Mn());
  }, zt = (y) => {
    fa().forEach((S) => {
      S.classList.remove("kl-active"), S.removeAttribute("aria-pressed");
    }), y && (y.classList.add("kl-active"), y.setAttribute("aria-pressed", "true"));
  }, Ht = se.querySelector("#klavity-voice");
  if (Ht) {
    const E = Ht.querySelector(".kl-vring-prog");
    let R = 0, T = 0, A = !1, I, D = "";
    const $ = () => {
      T = Date.now();
      const ye = () => {
        const Oe = Date.now() - T, Le = Math.min(Oe / 18e4, 1);
        if (E == null || E.setAttribute("stroke-dashoffset", String(Le * 81.68)), Oe >= 165e3 && Ht.classList.add("kl-voice-warn"), Oe >= 18e4) {
          I.stop();
          return;
        }
        R = requestAnimationFrame(ye);
      };
      R = requestAnimationFrame(ye);
    }, B = () => {
      cancelAnimationFrame(R), E == null || E.setAttribute("stroke-dashoffset", String(81.68)), Ht.classList.remove("kl-voice-warn");
    }, U = se.querySelector("#klavity-voice-status");
    let Y = null;
    const W = () => {
      Y && (clearTimeout(Y), Y = null), U && (U.hidden = !0, U.textContent = "", U.classList.remove("kl-vs-info", "kl-vs-err"));
    }, K = (ye, Oe, Le) => {
      !U || !Oe || (Y && (clearTimeout(Y), Y = null), U.classList.remove("kl-vs-info", "kl-vs-err"), U.classList.add(ye === "err" ? "kl-vs-err" : "kl-vs-info"), U.textContent = Oe, U.hidden = !1, Le && (Y = setTimeout(W, Le)));
    }, Q = "Recording — tap to stop", oe = () => {
      U && U.classList.contains("kl-vs-info") && W();
    }, X = (ye) => {
      Ht.classList.toggle("kl-voice-rec", ye), Ht.setAttribute("aria-pressed", ye ? "true" : "false"), Ht.setAttribute("aria-label", ye ? "Stop recording" : "Voice dictation"), Ht.title = ye ? Q : "Voice dictation";
    }, Se = (ye) => {
      let Oe = "";
      ye.onTranscript = (Le) => {
        Oe = "", D = Un(D, Le), H.value = D;
        try {
          H.scrollTop = H.scrollHeight;
        } catch {
        }
        try {
          H.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        Ze();
      }, ye.onInterim = (Le) => {
        Oe = Le || "";
        const V = D.length > 0 && !/\s$/.test(D) ? " " : "";
        H.value = D + (Le ? V + Le : "");
        try {
          H.scrollTop = H.scrollHeight;
        } catch {
        }
        try {
          H.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        Ze();
      }, ye.onStatus = (Le, V) => {
        Le === "idle" ? oe() : K("info", V);
      }, ye.onError = (Le, V) => {
        V && K("err", V, 4e3);
      }, ye.onStop = () => {
        Oe && (D = Un(D, Oe), Oe = ""), D && (D = Xa(D), H.value = D);
        try {
          H.scrollTop = H.scrollHeight;
        } catch {
        }
        try {
          H.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        A = !1, X(!1), B(), oe(), Ze();
      };
    }, De = () => {
      const ye = new un();
      return Se(ye), ye;
    }, Ve = () => {
      if (!A) {
        X(!1), B(), oe();
        return;
      }
      un.isSupported() ? (D = H.value, I = De(), K("info", "Reconnecting dictation…"), I.start()) : (A = !1, X(!1), B(), K("err", "Voice dictation is unavailable right now", 4e3));
    }, Ge = () => {
      if (!(ae === "server" && t.onDictate)) return null;
      const ye = new si({ transcribe: (Oe) => t.onDictate(Oe) });
      return Se(ye), ye.onUnavailable = Ve, ye;
    }, Kt = (ye) => {
      const Oe = () => D.length > 0 && !/\s$/.test(D) ? " " : "";
      let Le = "";
      ye.onTranscript = (V) => {
        Le = "", D = Un(D, V), H.value = D;
        try {
          H.scrollTop = H.scrollHeight;
        } catch {
        }
        try {
          H.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        Ze();
      }, ye.onInterim = (V) => {
        Le = V || "", H.value = D + Oe() + V;
        try {
          H.scrollTop = H.scrollHeight;
        } catch {
        }
        try {
          H.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        Ze();
      }, ye.onStatus = (V, ce) => {
        V === "idle" ? oe() : K("info", ce);
      }, ye.onError = (V, ce) => {
        ce && K("err", ce, 4e3);
      }, ye.onStop = () => {
        Le && (D = Un(D, Le), Le = ""), D && (D = Xa(D)), H.value = D;
        try {
          H.scrollTop = H.scrollHeight;
        } catch {
        }
        try {
          H.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        A = !1, X(!1), B(), oe(), Ze();
      }, ye.onUnavailable = () => {
        H.value = D;
        try {
          H.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        if (!A) {
          X(!1), B(), oe();
          return;
        }
        const V = Ge();
        if (V) {
          I = V, K("info", "Reconnecting dictation…"), I.start();
          return;
        }
        Ve();
      };
    }, vt = () => {
      if (ae === "server" && t.dictationStreamUrl && oi.isSupported()) {
        const ye = new oi({ url: t.dictationStreamUrl });
        return Kt(ye), ye;
      }
      return Ge() ?? De();
    };
    I = vt(), Ht.addEventListener("click", () => {
      A ? I.stop() : (W(), D = H.value, I = vt(), A = !0, X(!0), I.start(), $());
    }), ar = () => {
      A && I.stop();
    };
  }
  cr.addEventListener("click", async () => {
    var Se;
    if (Ct || cr.disabled) return;
    const y = H.value.trim(), S = se.querySelector("#klavity-title"), E = S ? S.value.trim() : "", R = de === "feature" ? "feature" : "bug", T = d.slice(), A = fe(), I = L.slice(), D = ve.slice(), $ = de, B = (xe == null ? void 0 : xe.value.trim()) || "", U = B && (t.requireEmail || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(B)) ? B : void 0, Y = !!(U && Et && U.toLowerCase() === Mr);
    lt(!0), cr.textContent = "Uploading…";
    const W = a.getElementById("klavity-err");
    W.style.display = "none";
    const K = a.getElementById("klavity-progress"), Q = a.getElementById("klavity-progress-fill");
    K && Q && (K.classList.add("show"), Q.style.transition = "none", Q.style.width = "8%", Q.offsetWidth, Q.style.transition = "width 10s cubic-bezier(.05,.7,.2,1)", requestAnimationFrame(() => {
      Q.style.width = "90%";
    }));
    const oe = () => {
      Q && (Q.style.transition = "width .25s ease", Q.style.width = "100%");
    }, X = () => {
      K && Q && (K.classList.remove("show"), Q.style.transition = "none", Q.style.width = "0");
    };
    try {
      const De = await Promise.all(T), Ve = {
        type: R,
        ...me ? { kind: $ } : {},
        ...E ? { title: E } : {},
        description: y,
        screenshots: De,
        ...I.length ? { files: I } : {},
        ...D.length ? { recordings: D } : {},
        annotations: A,
        reporterEmail: U,
        createContact: Y,
        // KLA submit-target: ride the reporter's destination choice through onSubmit. Only present when the
        // segmented control was rendered (cfg.submitTargetToggle !== false); default 'project' (never surprise-
        // route to Klavity). The server resolves the real Klavity intake project — the client only says 'klavity'.
        ...n.submitTargetToggle !== !1 ? { feedbackTarget: sa } : {},
        // KLA-586: ride the accepted AI-Enhance draft's severity/priority as structured fields (cleared on Undo).
        ...te ? { suggestedSeverity: te } : {},
        ...Ne ? { suggestedPriority: Ne } : {},
        // #638: only when the toggle was rendered — the reporter's console-logs opt-in (DEFAULT false). Read
        // live from the checkbox so the current state travels; the host attaches console logs only when true.
        ...t.consoleAttachToggle ? { attachConsole: !!((Se = a.getElementById("klavity-conlog-cb")) != null && Se.checked) } : {}
      };
      if (t.backgroundUpload) {
        t.onSubmit(Ve), Zr({ immediate: !0, reason: "submitted" });
        return;
      }
      const Ge = await t.onSubmit(Ve);
      if (we) return;
      oe(), t.success ? ep(Ge.issueKey, Ge.issueUrl, t.success) : Qd(Ge.issueKey, Ge.issueUrl);
    } catch (De) {
      X();
      const Ve = (De == null ? void 0 : De.message) || "Unknown error";
      try {
        console.error("[Klavity] submit failed:", De);
      } catch {
      }
      W.textContent = n.debug ? `Couldn't submit your report — ${Ve}` : "Couldn't submit your report. Please check your connection and try again.", W.style.display = "block", cr.textContent = "Submit", lt(!1);
    }
  });
  function Vd(y, S) {
    const { dataUrl: E, quality: R, suggestSharp: T } = Dt(S);
    if (!E) return;
    const A = c.indexOf(y);
    A < 0 || (c[A] = E, d[A] = t.compressImage ? t.compressImage(E) : Promise.resolve(E), o[A] = R, h[A] = !!T && R !== "real-pixel", ne[A] && delete ne[A], delete Fe[A], delete at[A], Pe());
  }
  async function Yd(y) {
    if (!t.onCaptureViewport) return !1;
    let S = null;
    const E = i ? hr(document.body) : null;
    try {
      const { dataUrl: R } = Dt(await t.onCaptureViewport());
      R && (S = R, l = !1, bt(R, "rendered", void 0, !0, !1), y && zt(y));
    } catch {
    } finally {
      E == null || E();
    }
    return (async () => {
      const R = i ? hr(document.body) : null;
      try {
        const T = await t.onCaptureFull();
        if (S) Vd(S, T);
        else {
          l = !1;
          const { dataUrl: A, quality: I, suggestSharp: D } = Dt(T);
          A && (bt(A, I, void 0, !0, !!D), y && zt(y));
        }
      } catch {
        l = !1, Pe();
      } finally {
        R == null || R();
      }
    })(), !0;
  }
  async function ma(y) {
    if (!t.onCaptureViewport) return !1;
    const S = i ? hr(document.body) : null;
    try {
      const { dataUrl: E, blank: R } = Dt(await t.onCaptureViewport());
      R && c.length === 0 ? Li() : E ? (l = !1, bt(E, "rendered", void 0, !0, !1)) : (l = !1, Pe());
    } catch {
      l = !1, Pe();
    } finally {
      S == null || S();
    }
    return !0;
  }
  const dr = se.querySelector("#klavity-full");
  dr.addEventListener("click", async () => {
    if (!Ct && !(t.onCaptureSharp && await Hi())) {
      lt(!0), dr.classList.add("kl-loading");
      try {
        if (t.onCaptureViewport) {
          await Yd(dr);
          return;
        }
        const y = i ? hr(document.body) : null;
        try {
          const { dataUrl: S, quality: E, suggestSharp: R } = Dt(await t.onCaptureFull());
          bt(S, E, void 0, !0, !!R), zt(dr);
        } finally {
          y == null || y();
        }
      } catch {
      } finally {
        dr.classList.remove("kl-loading"), lt(!1);
      }
    }
  });
  async function Hi(y) {
    const S = y != null && y.viewport && t.onCaptureSharpViewport ? t.onCaptureSharpViewport : t.onCaptureSharp;
    if (Ct || !S || !Ie) return !1;
    const E = Ie.querySelector(".kl-sharp-label");
    lt(!0), Ie.classList.add("kl-loading"), s.style.display = "none";
    const R = E ?? Ie, T = R.textContent;
    R.textContent = "Capturing…";
    let A = !1;
    try {
      const I = i ? hr(document.body) : null;
      let D;
      try {
        D = await S();
      } finally {
        I == null || I();
      }
      if (D) {
        const { dataUrl: $, quality: B } = Dt(D);
        $ && (bt($, B ?? "real-pixel", void 0, !0, !1, { kind: y != null && y.viewport ? "viewport" : "full" }), zt(Ie), A = !0, f = !0);
      }
    } catch (I) {
      if (xm(I))
        try {
          Od();
        } catch {
        }
      else
        try {
          console.warn("[Klavity] Screen capture failed; using rendered fallback:", I);
        } catch {
        }
    } finally {
      s.style.display = "", R.textContent = T, Ie.classList.remove("kl-loading"), lt(!1);
    }
    return A;
  }
  Ie && t.onCaptureSharp && Ie.addEventListener("click", () => {
    Hi();
  });
  const ga = se.querySelector("#klavity-file"), ya = se.querySelector("#klavity-upload");
  ya.addEventListener("click", () => {
    if (!Ct) {
      if (!C && c.length >= x) {
        Pt(`You can attach up to ${x} images.`);
        return;
      }
      ga.click();
    }
  }), ga.addEventListener("change", async (y) => {
    const S = y.target, E = S.files ? Array.from(S.files) : [];
    if (S.value = "", !E.length) return;
    const R = c.length, T = L.length;
    C ? await Ud(E) : await Ni(E), (c.length > R || L.length > T) && zt(ya);
  });
  const rn = a.getElementById("klavity-record");
  rn && t.onRecord && rn.addEventListener("click", async () => {
    if (Ct) return;
    if (ve.length >= _e) {
      Pt(`You can attach up to ${_e} recordings.`);
      return;
    }
    lt(!0), rn.classList.add("kl-loading");
    const y = (S) => {
      s.style.display = S === "recording" ? "none" : "";
    };
    try {
      const S = await t.onRecord(y);
      S && (ve.push(S), le = ve.length - 1, ie = null, zi(), zt(rn));
    } catch {
    } finally {
      s.style.display = "", rn.classList.remove("kl-loading"), lt(!1);
    }
  });
  const ji = a.getElementById("klavity-region");
  ji && t.onRegionCapture && (ji.onclick = () => {
    Ct || (lt(!0), document.removeEventListener("keydown", lr, { capture: !0 }), s.style.display = "none", Im(async (y) => {
      document.addEventListener("keydown", lr, { capture: !0 });
      try {
        const S = i ? hr(document.body) : null;
        let E;
        try {
          E = await t.onRegionCapture(y);
        } finally {
          S == null || S();
        }
        if (E) {
          const { dataUrl: R, quality: T, suggestSharp: A } = Dt(E);
          R && (bt(R, T, void 0, !0, !!A, { kind: "region", rect: y }), zt(ji));
        }
      } finally {
        s.style.display = "", lt(!1);
      }
    }, () => {
      document.addEventListener("keydown", lr, { capture: !0 }), s.style.display = "", lt(!1);
    }));
  });
  const Tr = a.getElementById("klavity-pick"), Rr = a.getElementById("klavity-pickinfo"), ba = () => {
    var E;
    if (Tr && (Tr.classList.toggle("kl-active", !!z), z ? Tr.setAttribute("aria-pressed", "true") : Tr.removeAttribute("aria-pressed")), !Rr) return;
    if (!z) {
      Rr.hidden = !0, Rr.innerHTML = "";
      return;
    }
    Rr.hidden = !1;
    const { text: y } = z, S = y ? `: <span class="kl-pick-txt">${et(y)}</span>` : "";
    Rr.innerHTML = `<span class="kl-pick-ic">${re("mouse-pointer-2", { size: 13 })}</span><span>Element pinned${S}</span><button type="button" class="kl-pick-clear" id="klavity-pick-clear">Clear</button>`, (E = Rr.querySelector("#klavity-pick-clear")) == null || E.addEventListener("click", () => {
      z = null, ba();
    });
  };
  Tr && t.onPickElement && (Tr.onclick = async () => {
    if (!Ct) {
      lt(!0), document.removeEventListener("keydown", lr, { capture: !0 }), s.style.display = "none";
      try {
        const y = await t.onPickElement();
        y && (z = y, ba(), y.shot && bt(y.shot, y.shotQuality, void 0, !0, !1, { kind: "element", selector: y.selector, rect: y.rect }));
      } catch {
      } finally {
        document.addEventListener("keydown", lr, { capture: !0 }), s.style.display = "", lt(!1);
      }
    }
  });
  function Mt(y, S = 15) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em">${y}</svg>`;
  }
  function Gd(y) {
    const S = (A, I, D, $) => `<button type="button" class="kl-htool" data-tool="${A}" title="${I} (${$.toUpperCase()})" aria-label="${I}">${D}<span class="kl-hk">${$.toUpperCase()}</span></button>`, E = (A) => {
      const I = A.replace("#", "");
      if (!/^[0-9a-fA-F]{6}$/.test(I)) return !1;
      const D = parseInt(I.slice(0, 2), 16), $ = parseInt(I.slice(2, 4), 16), B = parseInt(I.slice(4, 6), 16);
      return (0.2126 * D + 0.7152 * $ + 0.0722 * B) / 255 > 0.7;
    }, R = (A) => `<button type="button" class="kl-hcolor${E(A) ? " kl-hcolor-light" : ""}" data-color="${A}" style="background:${A}" title="${A}" aria-label="Colour ${A}"></button>`;
    return (
      // Klavity logo, TOP-LEFT of the editor toolbar. It links to the homepage (UTM-stamped so clicks are
      // attributable to WHICH project/site) — the href is assigned in JS (never innerHTML) per this file's
      // XSS guards. See heroLogoHref + the #kl-hero-logo wiring in mountHeroAnnotator.
      '<a class="kl-hlogo" id="kl-hero-logo" target="_blank" rel="noopener" title="Powered by Klavity — visit klavity.in" aria-label="Klavity homepage (opens in a new tab)"><svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g fill="#818cf8"><circle cx="15" cy="9" r="2"/><circle cx="11" cy="16" r="2"/><circle cx="10" cy="24" r="2"/><circle cx="11" cy="32" r="2"/><circle cx="15" cy="39" r="2"/><circle cx="33" cy="9" r="2"/><circle cx="37" cy="16" r="2"/><circle cx="38" cy="24" r="2"/><circle cx="37" cy="32" r="2"/><circle cx="33" cy="39" r="2"/></g><g stroke="#818cf8" stroke-width="1.6" stroke-linecap="round" opacity="0.4"><line x1="15" y1="9" x2="33" y2="9"/><line x1="11" y1="16" x2="37" y2="16"/><line x1="10" y1="24" x2="38" y2="24"/><line x1="11" y1="32" x2="37" y2="32"/><line x1="15" y1="39" x2="33" y2="39"/></g></svg><span class="kl-hlogo-word">Klavity</span></a><span class="kl-hsep"></span>' + S("pen", "Pen", re("pencil", { size: 15 }), "p") + S("line", "Line", Mt('<line x1="5" y1="19" x2="19" y2="5"/>'), "l") + S("rect", "Rectangle", re("square", { size: 15 }), "r") + S("circle", "Circle", Mt('<circle cx="12" cy="12" r="9"/>'), "o") + S("arrow", "Arrow", Mt('<line x1="5" y1="19" x2="19" y2="5"/><polyline points="10 5 19 5 19 14"/>'), "a") + S("text", "Text", Mt('<path d="M5 6h14M12 6v13M9 19h6"/>'), "t") + S("count", "Numbers", Mt('<circle cx="12" cy="12" r="9"/><text x="12" y="16" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor" stroke="none">1</text>'), "c") + `<span class="kl-hsep"></span><label class="kl-hmask" title="Mask numbers in new screen captures"><input type="checkbox" class="kl-hmask-cb"${i ? " checked" : ""}>${re("eye-off", { size: 13 })}<span>Mask numbers</span></label>` + S("pixelate", "Redact (pixelate)", Mt('<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>'), "b") + S("crop", "Crop", Mt('<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>'), "k") + '<span class="kl-hsep"></span><span class="kl-hcolors">' + R("#ef4444") + R("#f97316") + R("#16a34a") + R("#3b82f6") + R("#ffffff") + R("#111827") + // Custom colour picker — a rainbow swatch that opens a native <input type="color">. The chosen colour
      // becomes the active colour and shows as the selected swatch. Input is visually hidden but focusable
      // via the button (kept inside the shadow root so its styling stays scoped).
      `<span class="kl-hcolor-cwrap"><button type="button" class="kl-hcolor kl-hcolor-custom" title="Custom colour" aria-label="Choose a custom colour"></button><input type="color" class="kl-hcolor-input" value="#ef4444" aria-label="Custom colour value" tabindex="-1"></span></span><span class="kl-hsep"></span><span class="kl-hgroup"><span class="kl-hlabel">Stroke</span><button type="button" class="kl-hopt" data-stroke="0.6" title="Thin stroke" aria-label="Thin stroke">S</button><button type="button" class="kl-hopt kl-on" data-stroke="1" title="Medium stroke" aria-label="Medium stroke">M</button><button type="button" class="kl-hopt" data-stroke="1.8" title="Thick stroke" aria-label="Thick stroke">L</button><button type="button" class="kl-hopt" data-stroke="2.8" title="Extra-thick stroke" aria-label="Extra-thick stroke">XL</button></span><span class="kl-htextopts" id="kl-hero-textopts" hidden><span class="kl-hsep"></span><span class="kl-hlabel">Outline</span><button type="button" class="kl-hopt kl-on" data-outline="black" title="Black outline"><span class="kl-osq" style="background:#111"></span></button><button type="button" class="kl-hopt" data-outline="white" title="White outline"><span class="kl-osq" style="background:#fff;border:1px solid #999"></span></button><button type="button" class="kl-hopt" data-outline="none" title="No outline">None</button><span class="kl-hlabel">Size</span><button type="button" class="kl-hopt" data-size="18" title="Small">S</button><button type="button" class="kl-hopt kl-on" data-size="26" title="Medium">M</button><button type="button" class="kl-hopt" data-size="40" title="Large">L</button></span><span class="kl-hsep"></span><button type="button" class="kl-htbtn" id="kl-hero-undo" title="Undo (Cmd+Z / Ctrl+Z)" aria-label="Undo">${Mt('<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>', 14)}</button>` + // #449: explicit "Revert crop" — shown only after a crop on this image (visibility driven by the
      // per-image crop stack). Reverts the most recent crop to its pre-crop image + original markup.
      (y ? `<button type="button" class="kl-htbtn kl-hrevert" id="kl-hero-revert" title="Revert crop to original" aria-label="Revert crop">${Mt('<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 5 5v2"/>', 14)}<span class="kl-hk kl-hrevert-lbl">Revert</span></button>` : "") + `<button type="button" class="kl-htbtn" id="kl-hero-clear" title="Clear" aria-label="Clear">${re("trash-2", { size: 14 })}</button><span class="kl-hgrow"></span><span class="kl-hgroup kl-hzoom"><button type="button" class="kl-htbtn" id="kl-hero-zoomout" title="Zoom out (Z toggles fit / 2×)" aria-label="Zoom out">${Mt('<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16" y2="16"/><line x1="8" y1="11" x2="14" y2="11"/>', 14)}</button><button type="button" class="kl-htbtn" id="kl-hero-zoomin" title="Zoom in (Z toggles fit / 2×)" aria-label="Zoom in">${Mt('<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16" y2="16"/><line x1="8" y1="11" x2="14" y2="11"/><line x1="11" y1="8" x2="11" y2="14"/>', 14)}</button></span>`
    );
  }
  function nn() {
    Ye && (document.removeEventListener("keydown", Ye, { capture: !0 }), Ye = null);
  }
  function Vi() {
    const y = a.getElementById("klavity-hero-stage"), S = a.getElementById("klavity-hero-tools");
    S && (S.innerHTML = ""), y && (y.innerHTML = `<div class="kl-hero-empty" id="klavity-hero-empty"><span class="kl-hero-empty-ic">${re("image", { size: 34 })}</span><span id="klavity-hero-empty-txt">${et(Pd())}</span></div>`), nn();
  }
  function va() {
    if (ie != null && !(L[ie] && Lr(L[ie]) === "video") && (ie = null), le != null && !ve[le] && (le = null), le != null) {
      ka(ve[le].dataUrl);
      return;
    }
    if (ie != null) {
      ka(L[ie] ? _(L[ie]) : void 0);
      return;
    }
    if (c.length === 0) {
      pe = 0, Vi();
      return;
    }
    pe >= c.length && (pe = c.length - 1), pe < 0 && (pe = 0), Jd(pe);
  }
  function ka(y) {
    const S = a.getElementById("klavity-hero-stage"), E = a.getElementById("klavity-hero-tools");
    if (!S || !y) {
      Vi();
      return;
    }
    nn(), E && (E.innerHTML = ""), S.innerHTML = "";
    const R = document.createElement("div");
    R.className = "kl-hero-vwrap", R.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;max-width:100%;max-height:100%;";
    const T = document.createElement("video");
    T.src = y, T.controls = !0, T.setAttribute("playsinline", ""), T.preload = "metadata", T.className = "kl-hero-video", T.style.cssText = "display:block;max-width:100%;max-height:100%;border-radius:8px;background:#000;box-shadow:0 12px 40px rgba(0,0,0,.5);";
    const A = document.createElement("div");
    A.className = "kl-hero-verror", A.style.cssText = "display:none;flex-direction:column;align-items:center;gap:6px;color:#fff;font-size:13px;text-align:center;";
    const I = document.createElement("a");
    I.href = y, I.setAttribute("download", "recording.webm"), I.setAttribute("target", "_blank"), I.setAttribute("rel", "noopener"), I.textContent = "Download recording", I.style.cssText = "color:#a5b4fc;font-size:12px;text-decoration:underline;", A.innerHTML = "<span>This recording couldn’t play here.</span>", A.appendChild(I), R.appendChild(T), R.appendChild(A), S.appendChild(R), Xd(T, A);
  }
  function Xd(y, S) {
    let E = !1;
    y.addEventListener("loadedmetadata", () => {
      if (!isFinite(y.duration) || y.duration <= 0) {
        E = !0;
        try {
          y.currentTime = 1e101;
        } catch {
        }
      }
    }), y.addEventListener("durationchange", () => {
      if (E && isFinite(y.duration) && y.duration > 0) {
        E = !1;
        try {
          y.currentTime = 0;
        } catch {
        }
      }
    }), y.addEventListener("error", () => {
      try {
        y.style.display = "none";
      } catch {
      }
      S && (S.style.display = "flex");
    });
  }
  function Kd(y, S, E, R, T) {
    const A = c[y];
    if (!A) return;
    const I = new Image();
    I.onload = () => {
      var K, Q;
      if (c[y] !== A) return;
      const D = document.createElement("canvas");
      D.width = Math.max(1, Math.round(R)), D.height = Math.max(1, Math.round(T));
      const $ = D.getContext("2d");
      if (!$) return;
      $.drawImage(I, S, E, R, T, 0, 0, D.width, D.height);
      let B;
      try {
        B = D.toDataURL("image/png");
      } catch {
        return;
      }
      const U = ((K = Fe[y]) == null ? void 0 : K.length) ?? 0, Y = rt(y);
      c[y] = B, d[y] = t.compressImage ? t.compressImage(B) : Promise.resolve(B);
      const W = (Q = ne[y]) == null ? void 0 : Q.shapes;
      Array.isArray(W) && W.length ? ne[y] = { w: D.width, h: D.height, shapes: gm(W, -S, -E) } : delete ne[y], (Fe[y] ?? (Fe[y] = [])).push(Y), (at[y] ?? (at[y] = [])).push({ snap: Y, mark: U }), ge(y), Pe();
    }, I.src = A;
  }
  function Jd(y) {
    var $, B, U, Y, W, K, Q;
    const S = a.getElementById("klavity-hero-stage"), E = a.getElementById("klavity-hero-tools");
    if (!S || !E) return;
    const R = c[y];
    if (!R) {
      Vi();
      return;
    }
    nn(), S.innerHTML = "";
    const T = document.createElement("canvas");
    T.width = 1, T.height = 1, T.style.cssText = "display:block;max-width:100%;max-height:100%;object-fit:contain;cursor:crosshair;touch-action:none;background:#fff;border-radius:8px;box-shadow:0 12px 40px rgba(0,0,0,.5);";
    const A = new mo(T, R), I = ($ = ne[y]) == null ? void 0 : $.shapes;
    Array.isArray(I) && I.forEach((oe) => A.shapes.push({ ...oe })), S.appendChild(T);
    const D = new Image();
    D.onload = () => {
      !document.body.contains(s) || pe !== y || c[y] !== R || (T.width = D.naturalWidth || 1, T.height = D.naturalHeight || 1, A.redraw());
    }, D.src = R, A.redraw();
    {
      E.innerHTML = Gd((((B = at[y]) == null ? void 0 : B.length) ?? 0) > 0);
      const oe = E.querySelector("#kl-hero-logo");
      oe && (oe.href = fm(n.projectId));
      let X = "pen", Se = "#ef4444", De = 26, Ve = "black", Ge = null;
      const Kt = E.querySelector("#kl-hero-textopts"), vt = () => {
        A.shapes.length ? ne[y] = { w: T.width, h: T.height, shapes: A.shapes.map((N) => ({ ...N })) } : delete ne[y], ge(y);
      }, ye = (N) => {
        X = N, E.querySelectorAll("[data-tool]").forEach((F) => F.classList.toggle("kl-on", F.dataset.tool === N)), Kt && (Kt.hidden = N !== "text");
      }, Oe = E.querySelector(".kl-hcolor-custom"), Le = E.querySelector(".kl-hcolor-input"), V = (N, F) => {
        Se = N, E.querySelectorAll("[data-color]").forEach((Z) => Z.classList.toggle("kl-on", Z === F)), Oe && Oe.classList.toggle("kl-on", Oe === F);
      };
      if (E.querySelectorAll("[data-tool]").forEach((N) => N.addEventListener("click", () => ye(N.dataset.tool))), E.querySelectorAll("[data-color]").forEach((N) => N.addEventListener("click", () => V(N.dataset.color, N))), Oe && Le) {
        Oe.addEventListener("click", () => Le.click());
        const N = () => {
          Oe.style.background = Le.value, V(Le.value, Oe);
        };
        Le.addEventListener("input", N), Le.addEventListener("change", N);
      }
      const ce = E.querySelector(".kl-hmask-cb");
      ce && ce.addEventListener("change", () => {
        i = ce.checked;
      }), E.querySelectorAll("[data-outline]").forEach((N) => N.addEventListener("click", () => {
        Ve = N.dataset.outline, E.querySelectorAll("[data-outline]").forEach((F) => F.classList.toggle("kl-on", F === N));
      })), E.querySelectorAll("[data-size]").forEach((N) => N.addEventListener("click", () => {
        De = Number(N.dataset.size), E.querySelectorAll("[data-size]").forEach((F) => F.classList.toggle("kl-on", F === N));
      })), E.querySelectorAll("[data-stroke]").forEach((N) => N.addEventListener("click", () => {
        A.strokeScale = Number(N.dataset.stroke) || 1, E.querySelectorAll("[data-stroke]").forEach((F) => F.classList.toggle("kl-on", F === N)), A.redraw();
      })), (U = E.querySelector("#kl-hero-undo")) == null || U.addEventListener("click", () => {
        Wt(y);
      }), (Y = E.querySelector("#kl-hero-revert")) == null || Y.addEventListener("click", () => {
        Cn(y);
      }), (W = E.querySelector("#kl-hero-clear")) == null || W.addEventListener("click", () => {
        yt(y), A.clearAll(), vt();
      }), ye(X), V(Se, E.querySelector("[data-color]"));
      const ze = (N) => {
        const F = T.getBoundingClientRect(), Z = Math.min(F.width / T.width, F.height / T.height) || 1, J = T.width * Z, ee = T.height * Z, qe = (F.width - J) / 2, ct = (F.height - ee) / 2;
        return { x: (N.clientX - F.left - qe) / Z, y: (N.clientY - F.top - ct) / Z };
      }, _n = () => {
        const N = T.getBoundingClientRect();
        return Math.min(N.width / T.width, N.height / T.height) || 1;
      }, tp = (N, F, Z, J, ee, qe) => N === "line" ? { type: "line", color: qe, x1: F, y1: Z, x2: J, y2: ee } : N === "arrow" ? { type: "arrow", color: qe, x1: F, y1: Z, x2: J, y2: ee } : N === "rect" ? { type: "rect", color: qe, x: Math.min(F, J), y: Math.min(Z, ee), w: Math.abs(J - F), h: Math.abs(ee - Z) } : N === "circle" ? { type: "circle", color: qe, x: (F + J) / 2, y: (Z + ee) / 2, rx: Math.abs(J - F) / 2, ry: Math.abs(ee - Z) / 2 } : N === "pixelate" ? { type: "pixelate", x: Math.min(F, J), y: Math.min(Z, ee), w: Math.abs(J - F), h: Math.abs(ee - Z) } : null;
      let nt = 1, Jt = 0, Zt = 0, In = null;
      const rp = (() => {
        try {
          return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
        } catch {
          return !1;
        }
      })(), Ln = cm(rp), Yi = () => {
        if (In) return In;
        const N = T.style.transform;
        return T.style.transform = "", In = T.getBoundingClientRect(), T.style.transform = N, In;
      }, Qe = document.createElement("div");
      Qe.className = "kl-minimap", Qe.hidden = !0, Qe.setAttribute("role", "navigation"), Qe.setAttribute("aria-label", "Zoom navigator — click or drag to pan the image");
      const sn = document.createElement("img");
      sn.className = "kl-minimap-img", sn.alt = "", sn.draggable = !1, sn.src = R;
      const Ar = document.createElement("div");
      Ar.className = "kl-minimap-vp", Qe.append(sn, Ar), S.appendChild(Qe);
      const Ca = () => {
        const N = T.width, F = T.height;
        if (nt <= 1 || N < 2 || F < 2) {
          Qe.hidden = !0;
          return;
        }
        const Z = Yi();
        if (!Z) {
          Qe.hidden = !0;
          return;
        }
        const J = 148, ee = Math.min(J / N, J / F), qe = Math.max(1, Math.round(N * ee)), ct = Math.max(1, Math.round(F * ee));
        Qe.style.width = qe + "px", Qe.style.height = ct + "px";
        const Tt = S.getBoundingClientRect(), Ir = dm(
          { left: Tt.left, top: Tt.top, right: Tt.right, bottom: Tt.bottom },
          { left: Z.left, top: Z.top, width: Z.width, height: Z.height },
          { panX: Jt, panY: Zt },
          nt,
          N,
          F
        );
        Ar.style.left = Ir.x * ee + "px", Ar.style.top = Ir.y * ee + "px", Ar.style.width = Math.max(3, Ir.w * ee) + "px", Ar.style.height = Math.max(3, Ir.h * ee) + "px", Qe.hidden = !1;
      }, on = () => {
        if (nt === 1) {
          Jt = 0, Zt = 0, T.style.transform = "", T.style.cursor = "crosshair", Ca();
          return;
        }
        T.style.transformOrigin = "0 0", T.style.transform = `translate(${Jt}px,${Zt}px) scale(${nt})`, T.style.cursor = "grab", Ca();
      }, On = (N, F, Z) => {
        const J = Yi();
        if (!J) return;
        const ee = nt;
        if (nt = am(nt * Z), nt === ee) return;
        const qe = um(N, F, { left: J.left, top: J.top, width: J.width, height: J.height }, ee, nt, { panX: Jt, panY: Zt });
        Jt = qe.panX, Zt = qe.panY, T.style.transition = Ln, on();
      }, Gi = () => {
        const N = S.getBoundingClientRect();
        return { cx: N.left + N.width / 2, cy: N.top + N.height / 2 };
      }, np = () => {
        nt = 1, T.style.transition = Ln, on();
      };
      (K = E.querySelector("#kl-hero-zoomin")) == null || K.addEventListener("click", () => {
        const { cx: N, cy: F } = Gi();
        On(N, F, 1.25);
      }), (Q = E.querySelector("#kl-hero-zoomout")) == null || Q.addEventListener("click", () => {
        const { cx: N, cy: F } = Gi();
        On(N, F, 0.8);
      });
      const ip = (N, F) => {
        const Z = Yi();
        if (!Z) return;
        const J = S.getBoundingClientRect(), ee = hm(N, F, { left: J.left, top: J.top, right: J.right, bottom: J.bottom }, { left: Z.left, top: Z.top, width: Z.width, height: Z.height }, nt, T.width);
        Jt = ee.panX, Zt = ee.panY, T.style.transition = Ln, on();
      };
      let Nn = !1;
      const Ma = (N, F) => {
        const Z = Qe.getBoundingClientRect(), { ix: J, iy: ee } = pm(N - Z.left, F - Z.top, Z.width, Z.height, T.width, T.height);
        ip(J, ee);
      };
      Qe.addEventListener("pointerdown", (N) => {
        Nn = !0;
        try {
          Qe.setPointerCapture(N.pointerId);
        } catch {
        }
        Ma(N.clientX, N.clientY), N.preventDefault(), N.stopPropagation();
      }), Qe.addEventListener("pointermove", (N) => {
        Nn && (Ma(N.clientX, N.clientY), N.preventDefault());
      });
      const Ta = (N) => {
        if (Nn) {
          Nn = !1;
          try {
            Qe.releasePointerCapture(N.pointerId);
          } catch {
          }
        }
      };
      Qe.addEventListener("pointerup", Ta), Qe.addEventListener("pointercancel", Ta), S.addEventListener("wheel", (N) => {
        X !== "crop" && (N.preventDefault(), On(N.clientX, N.clientY, lm(N.deltaY)));
      }, { passive: !1 }), S.addEventListener("dblclick", () => {
        nt = 1, T.style.transition = Ln, on();
      });
      let sp = A.shapes.reduce((N, F) => F.type === "count" ? Math.max(N, F.n) : N, 0), Qt = !1, ht = 0, ft = 0, pr = [], _r = !1, Ra = 0, Aa = 0, _a = 0, Ia = 0, mt = null, an = { x: 0, y: 0 }, it = null;
      const op = () => Math.max(14, A.computeFontSize() * 0.6), La = (N, F) => {
        for (let Z = A.shapes.length - 1; Z >= 0; Z--) {
          const J = A.shapes[Z];
          if (J.type !== "text") continue;
          const ee = A.textBounds(J);
          if (!ee) continue;
          const qe = op();
          if (N >= ee.x + ee.w - qe && N <= ee.x + ee.w + qe && F >= ee.y + ee.h - qe && F <= ee.y + ee.h + qe)
            return { shape: J, mode: "resize" };
          const ct = 6;
          if (N >= ee.x - ct && N <= ee.x + ee.w + ct && F >= ee.y - ct && F <= ee.y + ee.h + ct)
            return { shape: J, mode: "move" };
        }
        return null;
      };
      T.addEventListener("pointerdown", (N) => {
        if (N.shiftKey && nt > 1) {
          _r = !0, Ra = N.clientX, Aa = N.clientY, _a = Jt, Ia = Zt, T.style.transition = "none", T.style.cursor = "grabbing";
          try {
            T.setPointerCapture(N.pointerId);
          } catch {
          }
          N.preventDefault();
          return;
        }
        const F = ze(N);
        if (ht = F.x, ft = F.y, X === "crop") {
          Qt = !0;
          try {
            T.setPointerCapture(N.pointerId);
          } catch {
          }
          an = { x: N.clientX, y: N.clientY }, mt = document.createElement("div"), mt.style.cssText = "position:absolute;border:2px dashed #6366f1;background:rgba(99,102,241,.14);pointer-events:none;z-index:6;left:0;top:0;width:0;height:0;", S.appendChild(mt);
          return;
        }
        if (X === "text") {
          const Z = La(F.x, F.y);
          if (Z) {
            yt(y), it = { shape: Z.shape, mode: Z.mode, grabX: F.x, grabY: F.y, origX: Z.shape.x, origY: Z.shape.y, origSize: Z.shape.size ?? A.computeFontSize() };
            try {
              T.setPointerCapture(N.pointerId);
            } catch {
            }
            T.style.cursor = Z.mode === "resize" ? "nwse-resize" : "move", N.preventDefault();
            return;
          }
          const J = document.createElement("input"), ee = Ve === "none" ? "none" : `0 0 2px ${Ve}, 0 0 2px ${Ve}`, qe = _n(), ct = Math.max(6, De * qe), Tt = De, Ir = Ve;
          J.style.cssText = `position:fixed;left:${N.clientX}px;top:${N.clientY}px;padding:0;margin:0;line-height:1;box-sizing:content-box;background:transparent;border:0;color:${Se};font-size:${ct}px;font-family:sans-serif;font-weight:700;text-shadow:${ee};outline:1px dashed ${Se};z-index:2147483647;min-width:80px;`, document.body.appendChild(J), Ge = J, requestAnimationFrame(() => {
            document.body.contains(J) && J.focus();
          }), J.addEventListener("blur", () => {
            Ge = null, J.value.trim() && (yt(y), A.addShape({ type: "text", color: Se, x: ht, y: ft, text: J.value.trim(), size: Tt, outline: Ir }), vt()), je(J);
          }, { once: !0 }), J.addEventListener("keydown", (Xi) => {
            Xi.key === "Enter" && J.blur(), Xi.key === "Escape" && (J.value = "", J.blur()), Xi.stopPropagation();
          });
          return;
        }
        if (X === "count") {
          yt(y), A.addShape({ type: "count", color: Se, x: F.x, y: F.y, n: ++sp }), vt();
          return;
        }
        Qt = !0;
        try {
          T.setPointerCapture(N.pointerId);
        } catch {
        }
        X === "pen" && (pr = [F]);
      }), T.addEventListener("pointermove", (N) => {
        if (_r) {
          T.style.transition = "none", Jt = _a + (N.clientX - Ra), Zt = Ia + (N.clientY - Aa), on(), T.style.cursor = "grabbing";
          return;
        }
        if (it) {
          const J = ze(N);
          it.mode === "move" ? (it.shape.x = it.origX + (J.x - it.grabX), it.shape.y = it.origY + (J.y - it.grabY)) : it.shape.size = Math.max(10, Math.min(240, it.origSize + (J.y - it.grabY))), A.redraw();
          return;
        }
        if (X === "text" && !Qt) {
          const J = ze(N), ee = La(J.x, J.y);
          T.style.cursor = ee ? ee.mode === "resize" ? "nwse-resize" : "move" : "crosshair";
        }
        if (!Qt) return;
        if (X === "pen") {
          pr.push(ze(N)), pr.length > 1 && A.drawPreview({ type: "pen", color: Se, points: pr });
          return;
        }
        if (X === "crop" && mt) {
          const J = S.getBoundingClientRect(), ee = Math.min(an.x, N.clientX), qe = Math.min(an.y, N.clientY), ct = Math.max(an.x, N.clientX), Tt = Math.max(an.y, N.clientY);
          mt.style.left = ee - J.left + "px", mt.style.top = qe - J.top + "px", mt.style.width = ct - ee + "px", mt.style.height = Tt - qe + "px";
          return;
        }
        const F = ze(N), Z = tp(X, ht, ft, F.x, F.y, Se);
        Z && A.drawPreview(Z);
      }), T.addEventListener("pointerup", (N) => {
        if (_r) {
          _r = !1, T.style.cursor = nt > 1 ? "grab" : "crosshair";
          try {
            T.releasePointerCapture(N.pointerId);
          } catch {
          }
          return;
        }
        if (it) {
          it = null;
          try {
            T.releasePointerCapture(N.pointerId);
          } catch {
          }
          T.style.cursor = "crosshair", A.redraw(), vt();
          return;
        }
        if (!Qt) return;
        Qt = !1;
        try {
          T.releasePointerCapture(N.pointerId);
        } catch {
        }
        const F = ze(N);
        if (X === "crop") {
          mt && (je(mt), mt = null);
          const ee = Math.max(0, Math.min(ht, F.x)), qe = Math.max(0, Math.min(ft, F.y)), ct = Math.abs(F.x - ht), Tt = Math.abs(F.y - ft);
          ct > 4 && Tt > 4 && Kd(y, ee, qe, ct, Tt);
          return;
        }
        const Z = X === "pixelate" && Math.abs(F.x - ht) > 4 && Math.abs(F.y - ft) > 4;
        (X === "pen" && pr.length > 1 || X === "line" || X === "rect" || X === "circle" || X === "arrow" || Z) && yt(y), X === "pen" && pr.length > 1 ? A.addShape({ type: "pen", color: Se, points: pr }) : X === "line" ? A.addShape({ type: "line", color: Se, x1: ht, y1: ft, x2: F.x, y2: F.y }) : X === "rect" ? A.addShape({ type: "rect", color: Se, x: Math.min(ht, F.x), y: Math.min(ft, F.y), w: Math.abs(F.x - ht), h: Math.abs(F.y - ft) }) : X === "circle" ? A.addShape({ type: "circle", color: Se, x: (ht + F.x) / 2, y: (ft + F.y) / 2, rx: Math.abs(F.x - ht) / 2, ry: Math.abs(F.y - ft) / 2 }) : X === "arrow" ? A.addShape({ type: "arrow", color: Se, x1: ht, y1: ft, x2: F.x, y2: F.y }) : Z && A.addShape({ type: "pixelate", x: Math.min(ht, F.x), y: Math.min(ft, F.y), w: Math.abs(F.x - ht), h: Math.abs(F.y - ft) }), vt();
      }), T.addEventListener("pointercancel", (N) => {
        try {
          T.releasePointerCapture(N.pointerId);
        } catch {
        }
        mt && (je(mt), mt = null), _r && (_r = !1, T.style.cursor = nt > 1 ? "grab" : "crosshair"), it && (it = null, T.style.cursor = "crosshair", A.redraw(), vt()), Qt && (Qt = !1, A.redraw());
      });
      const Oa = { p: "pen", l: "line", r: "rect", o: "circle", a: "arrow", t: "text", c: "count", b: "pixelate", k: "crop" };
      Ye = (N) => {
        if (!document.body.contains(s)) {
          nn();
          return;
        }
        if (Ge && document.body.contains(Ge)) return;
        const F = typeof N.composedPath == "function" && N.composedPath()[0] || N.target;
        if (F && (F.tagName === "INPUT" || F.tagName === "TEXTAREA" || F.tagName === "SELECT" || F.isContentEditable)) return;
        if ((N.metaKey || N.ctrlKey) && N.key.toLowerCase() === "z") {
          N.preventDefault(), Wt(y);
          return;
        }
        if (N.metaKey || N.ctrlKey || N.altKey) return;
        const Z = N.key.toLowerCase();
        if (Z === "z") {
          if (N.preventDefault(), nt > 1) np();
          else {
            const { cx: J, cy: ee } = Gi();
            On(J, ee, 2);
          }
          return;
        }
        Oa[Z] && (N.preventDefault(), ye(Oa[Z]));
      }, document.addEventListener("keydown", Ye, { capture: !0 });
    }
  }
  function Zd(y) {
    const S = c[y], E = new Image();
    E.onload = () => {
      const R = document.createElement("canvas");
      R.width = E.naturalWidth, R.height = E.naturalHeight;
      const T = new mo(R, S);
      T.redraw();
      const A = document.createElement("div");
      A.style.cssText = "position:fixed;inset:0;background:#000;z-index:2147483647;display:flex;flex-direction:column;pointer-events:all;";
      const I = document.createElement("div");
      I.className = "kl-edtb", I.style.cssText = "display:flex;align-items:center;gap:8px;padding:8px;background:#1e1e2e;flex-wrap:wrap;", I.innerHTML = `
        <button data-tool="pen" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${re("pencil", { size: 14 })} Pen</button>
        <button data-tool="rect" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${re("square", { size: 14 })} Rect</button>
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
        <button id="klavity-clear-ann" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${re("trash-2", { size: 14 })} Clear</button>
        <button id="klavity-save-ann" style="padding:6px 10px;background:#89b4fa;color:#1e1e2e;border:none;border-radius:4px;cursor:pointer;font-weight:700;">${re("check", { label: "Save", size: 14 })} Save</button>
        <button id="klavity-cancel-ann" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${re("x", { size: 14 })}</button>
      `, R.style.cssText = "cursor:crosshair;display:block;margin:12px auto;touch-action:none;background:#fff;border-radius:4px;outline:1px solid rgba(255,255,255,.12);outline-offset:-1px;box-shadow:0 12px 44px rgba(0,0,0,.55);";
      const D = document.createElement("div");
      D.style.cssText = "flex:1;min-height:0;overflow:auto;display:block;box-shadow:inset 0 1px 0 rgba(255,255,255,.04);", D.appendChild(R);
      const $ = document.createElement("style");
      $.textContent = ".kl-edtb button{transition:transform .15s cubic-bezier(.34,1.56,.64,1),background .15s ease;will-change:transform;}.kl-edtb button:hover{transform:translateY(-1px) scale(1.02);background:#45475a;}.kl-edtb button[data-color]:hover{transform:scale(1.14);background:initial;}.kl-edtb button:active{transform:scale(.96);}.kl-edtb button:focus-visible{outline:2px solid #89b4fa;outline-offset:2px;}.kl-edtb .kl-zb{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:34px;padding:0 9px;background:#313244;color:#cdd6f4;border:none;border-radius:8px;cursor:pointer;font-size:15px;font-weight:600;line-height:1;}.kl-edtb .kl-zb:hover{background:#45475a;}@media (prefers-reduced-motion:reduce){.kl-edtb button{transition:none;}.kl-edtb button:hover,.kl-edtb button:active,.kl-edtb button[data-color]:hover{transform:none;}}", A.append($, I, D), a.appendChild(A), nn();
      let B = 1;
      const U = (V) => Math.max(0.05, Math.min(5, V || 1));
      function Y(V) {
        B = U(V), R.style.width = Math.round(R.width * B) + "px", R.style.height = Math.round(R.height * B) + "px";
        const ce = I.querySelector("#klavity-zoom-pct");
        ce && (ce.textContent = Math.round(B * 100) + "%");
      }
      const W = () => Math.max(1, D.clientWidth - 24) / R.width, K = () => Math.min(Math.max(1, D.clientWidth - 24) / R.width, Math.max(1, D.clientHeight - 24) / R.height), Q = R.height / R.width > Math.max(1, D.clientHeight) / Math.max(1, D.clientWidth);
      Y(Q ? W() : K()), I.querySelector("#klavity-zoom-in").addEventListener("click", () => Y(B * 1.25)), I.querySelector("#klavity-zoom-out").addEventListener("click", () => Y(B / 1.25)), I.querySelector("#klavity-fit-width").addEventListener("click", () => Y(W())), I.querySelector("#klavity-fit-page").addEventListener("click", () => Y(K()));
      let oe = "rect", X = "#ef4444", Se = !1, De = [], Ve = 0, Ge = 0;
      function Kt(V) {
        oe = V, I.querySelectorAll("[data-tool]").forEach((ce) => {
          const ze = ce.dataset.tool === V;
          ce.style.background = ze ? "#585b70" : "#313244", ce.style.outline = ze ? "2px solid #89b4fa" : "none";
        });
      }
      I.querySelectorAll("[data-tool]").forEach((V) => V.addEventListener("click", () => Kt(V.dataset.tool))), I.querySelectorAll("[data-color]").forEach((V) => V.addEventListener("click", () => {
        X = V.dataset.color;
      }));
      {
        const V = I.querySelector("#klavity-color-custom"), ce = I.querySelector("#klavity-color-input");
        if (V && ce) {
          V.addEventListener("click", () => ce.click());
          const ze = () => {
            V.style.background = ce.value, X = ce.value;
          };
          ce.addEventListener("input", ze), ce.addEventListener("change", ze);
        }
      }
      I.querySelector("#klavity-undo").addEventListener("click", () => T.undo()), I.querySelector("#klavity-clear-ann").addEventListener("click", () => T.clearAll());
      const vt = { p: "pen", r: "rect", c: "circle", a: "arrow", t: "text" };
      function ye(V) {
        const ce = V.target;
        if (ce && (ce.tagName === "INPUT" || ce.tagName === "TEXTAREA" || ce.isContentEditable)) return;
        if (V.key === "Escape") {
          V.stopPropagation(), Oe();
          return;
        }
        if ((V.metaKey || V.ctrlKey) && V.key.toLowerCase() === "z") {
          V.preventDefault(), T.undo();
          return;
        }
        if (V.metaKey || V.ctrlKey || V.altKey) return;
        const ze = V.key.toLowerCase();
        vt[ze] ? (V.preventDefault(), Kt(vt[ze])) : ze === "u" && (V.preventDefault(), T.undo());
      }
      function Oe() {
        document.removeEventListener("keydown", ye, { capture: !0 }), je(A), va();
      }
      document.addEventListener("keydown", ye, { capture: !0 }), Kt(oe), I.querySelector("#klavity-save-ann").addEventListener("click", async () => {
        yt(y), T.shapes.length ? ne[y] = { w: R.width, h: R.height, shapes: T.shapes.map((V) => ({ ...V })) } : delete ne[y], ge(y), Oe(), Pe();
      }), I.querySelector("#klavity-cancel-ann").addEventListener("click", () => Oe());
      function Le(V) {
        const ce = R.getBoundingClientRect();
        return { x: (V.clientX - ce.left) / ce.width * R.width, y: (V.clientY - ce.top) / ce.height * R.height };
      }
      R.addEventListener("pointerdown", (V) => {
        Se = !0;
        const ce = Le(V);
        if ({ x: Ve, y: Ge } = ce, oe === "pen" && (De = [ce]), oe === "text") {
          Se = !1;
          const ze = document.createElement("input");
          ze.style.cssText = `position:fixed;left:${V.clientX}px;top:${V.clientY}px;background:transparent;border:1px dashed ${X};color:${X};font-size:16px;outline:none;z-index:9999999;min-width:80px;`, document.body.appendChild(ze), requestAnimationFrame(() => {
            document.body.contains(ze) && ze.focus();
          }), ze.addEventListener("blur", () => {
            ze.value.trim() && T.addShape({ type: "text", color: X, x: Ve, y: Ge, text: ze.value.trim() }), je(ze);
          }, { once: !0 }), ze.addEventListener("keydown", (_n) => {
            _n.key === "Enter" && ze.blur(), _n.stopPropagation();
          });
        }
      }), R.addEventListener("pointermove", (V) => {
        Se && oe === "pen" && De.push(Le(V));
      }), R.addEventListener("pointerup", (V) => {
        if (!Se) return;
        Se = !1;
        const ce = Le(V);
        oe === "pen" && De.length > 1 ? T.addShape({ type: "pen", color: X, points: De }) : oe === "rect" ? T.addShape({ type: "rect", color: X, x: Math.min(Ve, ce.x), y: Math.min(Ge, ce.y), w: Math.abs(ce.x - Ve), h: Math.abs(ce.y - Ge) }) : oe === "circle" ? T.addShape({ type: "circle", color: X, x: (Ve + ce.x) / 2, y: (Ge + ce.y) / 2, rx: Math.abs(ce.x - Ve) / 2, ry: Math.abs(ce.y - Ge) / 2 }) : oe === "arrow" && T.addShape({ type: "arrow", color: X, x1: Ve, y1: Ge, x2: ce.x, y2: ce.y });
      });
    }, E.src = S;
  }
  function Qd(y, S) {
    const E = document.createElement("div");
    E.style.cssText = "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:all;";
    const R = document.createElement("div");
    R.className = "klavity-sent";
    const T = document.createElement("div");
    T.className = "kl-sent-check", T.innerHTML = re("check", { label: "Sent", size: 22 }), R.appendChild(T);
    const A = document.createElement("h2");
    A.textContent = "Report sent", R.appendChild(A);
    const I = document.createElement("p");
    if (I.textContent = n.thankYou || "We filed it and emailed you a copy.", R.appendChild(I), y) {
      const D = document.createElement("div");
      D.className = "klavity-ref";
      const $ = document.createElement("span");
      $.textContent = "Filed as";
      const B = document.createElement("code");
      B.textContent = Za(y, S), D.append($, B);
      const U = Qa(S);
      if (U) {
        const Y = document.createElement("a");
        Y.href = U, Y.target = "_blank", Y.rel = "noopener", Y.textContent = "Open in Klavity", D.appendChild(Y);
      }
      R.appendChild(D);
    }
    E.appendChild(R), je(or), a.appendChild(E), na(R, Je);
  }
  function ep(y, S, E) {
    const { copy: R, onLead: T } = E;
    se.innerHTML = "";
    const A = document.createElement("div");
    A.className = "klavity-success";
    const I = document.createElement("h2");
    if (I.innerHTML = R.headline, A.appendChild(I), R.body) {
      const $ = document.createElement("p");
      $.textContent = R.body, A.appendChild($);
    }
    if (y) {
      const $ = document.createElement("div");
      $.className = "klavity-ref";
      const B = document.createElement("span");
      B.textContent = "Filed as";
      const U = document.createElement("code");
      U.textContent = Za(y, S), $.append(B, U);
      const Y = Qa(S);
      if (Y) {
        const W = document.createElement("a");
        W.href = Y, W.target = "_blank", W.rel = "noopener", W.textContent = "Open in Klavity", $.appendChild(W);
      }
      A.appendChild($);
    }
    const D = () => na(se, Ce);
    if (R.showEmail) {
      const $ = document.createElement("div");
      $.className = "klavity-lead";
      const B = document.createElement("input");
      B.type = "email", B.placeholder = "you@company.com";
      const U = document.createElement("button"), Y = R.emailLabel;
      U.textContent = Y;
      const W = document.createElement("div");
      W.className = "klavity-lead-err", W.setAttribute("role", "alert"), W.style.display = "none";
      const K = async () => {
        const Q = B.value.trim();
        if (!Q || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(Q)) {
          W.textContent = "Please enter a valid email so we can reach you.", W.style.display = "block", B.focus();
          return;
        }
        U.disabled = !0, U.textContent = "Saving…", W.style.display = "none";
        try {
          T && await T(y, Q);
        } catch (X) {
          try {
            console.warn("[Klavity] lead capture failed:", (X == null ? void 0 : X.message) || X);
          } catch {
          }
          W.textContent = "Couldn't save your email — please try again.", W.style.display = "block", U.disabled = !1, U.textContent = "Retry", B.focus();
          return;
        }
        const oe = document.createElement("div");
        oe.className = "klavity-thanks", oe.textContent = "Thanks — we'll be in touch.", je(W), $.replaceWith(oe), R.showCta || D();
      };
      U.addEventListener("click", K), B.addEventListener("keydown", (Q) => {
        Q.key === "Enter" && K();
      }), $.append(B, U), A.appendChild($), A.appendChild(W);
    }
    if (R.showCta && R.ctaUrl) {
      const $ = document.createElement("a");
      $.className = "klavity-cta", $.href = R.ctaUrl, $.target = "_blank", $.rel = "noopener", $.textContent = R.ctaText, A.appendChild($);
    }
    if (se.appendChild(A), !n.whiteLabel) {
      const $ = document.createElement("div");
      $.className = "klavity-pb";
      const B = document.createElement("a");
      B.href = mu("https://klavity.in", {
        campaign: "powered_by",
        medium: n.attributionMedium,
        ref: n.projectId
      }), B.target = "_blank", B.rel = "noopener", B.textContent = "Klavity", $.append("Powered by ", B), se.appendChild($);
    }
    !R.showEmail && !R.showCta && D();
  }
  if (t.autoCaptureOnOpen) {
    let y = 0;
    try {
      y = document.getElementsByTagName("*").length;
    } catch {
      y = 0;
    }
    if (y <= v) {
      if (l = !0, Pe(), wm(t) === "screen")
        return (async () => {
          if (await Hi({ viewport: !0 })) {
            l = !1, Pe();
            return;
          }
          if (c.length) {
            l = !1, Pe();
            return;
          }
          if (l = !0, Pe(), t.onCaptureViewport) {
            ma(null).catch(() => {
              l = !1, Pe();
            });
            return;
          }
          t.onCaptureFull().then((T) => {
            const { dataUrl: A, quality: I, suggestSharp: D, blank: $ } = Dt(T);
            if (l = !1, $ && c.length === 0) {
              Li();
              return;
            }
            bt(A, I, void 0, !0, !!D), zt(dr);
          }).catch(() => {
            l = !1, Pe();
          });
        })(), Qo;
      const S = () => {
        if (t.onCaptureViewport) {
          ma(null).catch(() => {
            l = !1, Pe();
          });
          return;
        }
        t.onCaptureFull().then((R) => {
          const { dataUrl: T, quality: A, suggestSharp: I, blank: D } = Dt(R);
          if (l = !1, D && c.length === 0) {
            Li();
            return;
          }
          bt(T, A, void 0, !0, !!I), zt(dr);
        }).catch(() => {
          l = !1, Pe();
        });
      }, E = window.requestIdleCallback;
      typeof E == "function" ? E(() => S(), { timeout: 1200 }) : requestAnimationFrame(() => setTimeout(S, 0));
    }
  }
  return Qo;
}
function Im(e, t) {
  const r = document.createElement("div");
  r.style.cssText = "position:fixed;inset:0;cursor:crosshair;z-index:2147483646;user-select:none;", r.setAttribute("data-klavity-region-overlay", ""), document.body.appendChild(r);
  const n = document.createElement("div");
  n.textContent = "Drag to select an area · Esc to cancel", n.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-family:system-ui;font-size:14px;background:rgba(0,0,0,.7);padding:8px 16px;border-radius:6px;pointer-events:none;z-index:2147483647;", document.body.appendChild(n);
  let i = 0, s = 0, a = !1;
  function c() {
    document.removeEventListener("keydown", l, { capture: !0 }), je(r), je(n);
  }
  function l(d) {
    d.key === "Escape" && (d.stopPropagation(), c(), t());
  }
  document.addEventListener("keydown", l, { capture: !0 }), r.addEventListener("pointerdown", (d) => {
    a = !0, i = d.clientX, s = d.clientY, je(n);
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
const Lm = 2e4;
async function el(e) {
  if (e.type === "image/heic" || e.type === "image/heif" || e.name.endsWith(".heic") || e.name.endsWith(".heif")) {
    let t;
    try {
      const r = await Promise.race([
        (async () => {
          const n = (await import("./heic2any-D6xzzX7R.js").then((i) => i.h)).default;
          return await n({ blob: e, toType: "image/jpeg", quality: 0.85 });
        })(),
        new Promise((n, i) => {
          t = setTimeout(() => i(new Error("heic-convert-timeout")), Lm);
        })
      ]);
      return tl(r);
    } catch {
    } finally {
      t && clearTimeout(t);
    }
  }
  return tl(e);
}
const Om = 3e4;
function tl(e) {
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
    }, Om), a = (c) => {
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
const Nm = {
  frustrated: { accent: "#e8849a", mark: "vein", label: "Frustrated" },
  confused: { accent: "#e8a24a", mark: "q", label: "Confused" },
  satisfied: { accent: "#7fd1c4", mark: "check", label: "Satisfied" },
  delighted: { accent: "#9fd6a0", mark: "spark", label: "Delighted" },
  neutral: { accent: "#8a8276", mark: "dots", label: "Neutral" },
  inspired: { accent: "#8b8bf5", mark: "bulb", label: "Inspired" },
  alarmed: { accent: "#ef6b6b", mark: "bang", label: "Alarmed" }
};
function Pm(e) {
  const t = (e || "").trim().split(/\s+/).filter(Boolean);
  return t.length === 0 ? "?" : t.length === 1 ? t[0].slice(0, 2).toUpperCase() : (t[0][0] + t[t.length - 1][0]).toUpperCase();
}
function zm(e) {
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
const Dm = {
  vein: "ksim-m-vein",
  spark: "ksim-m-spark",
  bulb: "ksim-m-bulb",
  bang: "ksim-m-bang",
  q: "ksim-m-q",
  dots: "ksim-m-dots",
  check: "ksim-m-check"
};
function fr(e) {
  return String(e).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function $m(e) {
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
  } = e, o = fr(e.initials || Pm(t)), h = i !== "none" ? Nm[i] : null, p = h ? `<span class="ksim-mark ${l ? Dm[h.mark] : ""}" style="color:${fr(h.accent)}">${zm(h.mark)}</span>` : "", m = r ? `<span class="ksim-head ksim-photo"><img src="${fr(r)}" alt="${fr(t)}" loading="lazy" onerror="this.style.display='none';this.parentNode.classList.add('ksim-fallback')"><span class="ksim-ini">${o}</span></span>` : `<span class="ksim-head ksim-mono"><span class="ksim-ini">${o}</span>${a ? '<span class="ksim-eyes"><i></i><i></i></span>' : ""}</span>`, f = c ? '<span class="ksim-legs"><i></i><i></i></span>' : "", g = ["ksim", l ? "is-animated" : "", d].filter(Boolean).join(" "), x = `--ksim-persona:${fr(n)};--ksim-size:${s}px;` + (h ? `--ksim-accent:${fr(h.accent)};` : "");
  return `<span class="${g}" style="${x}" data-emotion="${i}" title="${fr(t)}">${p}${m}${f}</span>`;
}
function Fm(e) {
  const t = document.createElement("template");
  return t.innerHTML = $m(e).trim(), t.content.firstElementChild;
}
const Um = `
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
function Bm(e = document) {
  var n;
  const t = e.head ?? e ?? null;
  if (!t || (n = t.querySelector) != null && n.call(t, "style[data-ksim]")) return;
  const r = document.createElement("style");
  r.setAttribute("data-ksim", ""), r.textContent = Um, t.appendChild(r);
}
function yo(e, t) {
  const r = e.indexOf(","), n = e.slice(0, r), i = e.slice(r + 1), s = /data:([^;,]+)/.exec(n), a = t || (s ? s[1] : "application/octet-stream");
  if (/;base64/i.test(n)) {
    const c = atob(i), l = new Uint8Array(c.length);
    for (let d = 0; d < c.length; d++) l[d] = c.charCodeAt(d);
    return new Blob([l], { type: a });
  }
  return new Blob([decodeURIComponent(i)], { type: a });
}
function qm(e) {
  if (!e || typeof e != "object") return !1;
  if (typeof e.selector == "string" && e.selector.trim() !== "") return !0;
  const t = (r) => r && Array.isArray(r.shapes) && r.shapes.length > 0;
  if (t(e)) return !0;
  if (e.byIndex && typeof e.byIndex == "object") {
    for (const r of Object.keys(e.byIndex)) if (t(e.byIndex[r])) return !0;
  }
  return !1;
}
function Wm(e) {
  const t = new FormData();
  if (t.set("type", e.type ?? "bug"), t.set("description", e.description), t.set("page_url", e.pageUrl), e.context && t.set("context", JSON.stringify(e.context)), e.projectId && t.set("project_id", e.projectId), e.replayEvents && e.replayEvents.length && t.set("replay_events", JSON.stringify(e.replayEvents)), e.title && t.set("title", e.title), e.referrer && t.set("referrer", e.referrer), e.reporter && Object.keys(e.reporter).length && t.set("reporter", JSON.stringify(e.reporter)), e.clientInfo && Object.keys(e.clientInfo).length && t.set("client_info", JSON.stringify(e.clientInfo)), e.files)
    for (const r of e.files)
      try {
        t.append("files", r.blob ?? yo(r.dataUrl, r.type), r.name);
      } catch {
      }
  if (e.recordings && e.recordings.length) {
    const r = [];
    for (const n of e.recordings)
      try {
        const i = (n.mime || "").includes("mp4") ? "mp4" : "webm", s = n.mime && /^video\//.test(n.mime) ? n.mime : `video/${i}`;
        t.append("recording", yo(n.dataUrl, s), `recording-${n.id}.${i}`), r.push({ id: n.id, durationMs: n.durationMs, width: n.width, height: n.height, bytes: n.bytes, mime: n.mime, screenOnly: n.screenOnly });
      } catch {
      }
    r.length && t.set("recording_meta", JSON.stringify(r));
  }
  return qm(e.annotations) && t.set("annotations_json", JSON.stringify(e.annotations)), t;
}
async function Hm(e) {
  try {
    const t = e.get("replay_events");
    if (typeof t != "string" || !t || typeof CompressionStream != "function") return;
    const r = await new Response(new Blob([t]).stream().pipeThrough(new CompressionStream("gzip"))).blob();
    if (!r.size || r.size >= t.length) return;
    e.delete("replay_events"), e.set("replay_events_gz", new Blob([r], { type: "application/gzip" }), "replay.json.gz");
  } catch {
  }
}
async function jm(e) {
  const { settings: t, type: r, description: n, context: i, screenshots: s, projectId: a, replayEvents: c } = e, l = Wm({
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
  await Hm(l), e.reporterEmail && l.set("reporter_email", e.reporterEmail);
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
        l.append("screenshot_thumbs", yo(u), "thumb.jpg");
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
const Vm = (
  // entrance keyframes: spring scale-in from top-left (cursor anchor)
  "@keyframes klm-in{0%{opacity:0;transform:scale(.9) translateY(-6px)}100%{opacity:1;transform:scale(1) translateY(0)}}@keyframes klm-row-in{0%{opacity:0;transform:translateY(8px) scale(.97)}100%{opacity:1;transform:translateY(0) scale(1)}}@keyframes klm-shine{0%{transform:translateX(-130%)}100%{transform:translateX(240%)}}@keyframes klm-spin{to{transform:rotate(360deg)}}.klm-menu{animation:klm-in .34s cubic-bezier(.34,1.56,.64,1) both}.klm-card{position:relative;display:flex;align-items:center;gap:8px;width:100%;border:0;cursor:pointer;text-align:left;padding:8px 10px;border-radius:12px;color:#2a2342;font-family:inherit;background:linear-gradient(180deg,rgba(255,255,255,.72),rgba(252,250,246,.55));box-shadow:0 1px 2px rgba(40,25,70,.06),inset 0 0 0 1px rgba(99,102,241,.08);transition:scale .14s cubic-bezier(.2,0,0,1),box-shadow .2s ease,background .2s ease;animation:klm-row-in .42s cubic-bezier(.16,1,.3,1) both}.klm-card:hover{scale:1.015;box-shadow:0 5px 14px -3px rgba(99,102,241,.3),inset 0 0 0 1px rgba(99,102,241,.16)}.klm-card:active{scale:.96}.klm-card:focus-visible{outline:2px solid #6366f1;outline-offset:2px}.klm-chip{flex:none;width:32px;height:32px;border-radius:8px;display:grid;place-items:center;color:#5b51c9;background:rgba(99,102,241,.12);transition:transform .2s cubic-bezier(.34,1.56,.64,1)}.klm-chip svg{width:16px;height:16px;display:block}.klm-card:hover .klm-chip{transform:scale(1.1) rotate(-5deg)}.klm-body{display:flex;flex-direction:column;gap:2px;min-width:0}.klm-t{font-size:13px;font-weight:650;letter-spacing:-.01em;line-height:1.2}.klm-d{font-size:10.5px;line-height:1.35;color:#7c7793;text-wrap:pretty}.klm-go{margin-left:auto;flex:none;color:#b6afce;display:inline-flex;transition:transform .2s cubic-bezier(.2,0,0,1)}.klm-go svg{width:14px;height:14px;display:block}.klm-card:hover .klm-go{transform:translateX(3px)}.klm-hint{margin-left:auto;flex:none;font-family:ui-monospace,monospace;font-size:10px;color:#9a93a6;background:rgba(40,30,60,.06);padding:3px 8px;border-radius:12px;text-align:center;line-height:1.32}.klm-card.primary{background:linear-gradient(160deg,#6d6bf3,#5b51d8);color:#fff;box-shadow:0 6px 16px -4px rgba(79,70,229,.45),inset 0 1px 0 rgba(255,255,255,.3)}.klm-card.primary:hover{box-shadow:0 9px 22px -4px rgba(79,70,229,.55),inset 0 1px 0 rgba(255,255,255,.35)}.klm-card.primary .klm-chip{background:rgba(255,255,255,.22);color:#fff}.klm-card.primary .klm-d{color:rgba(255,255,255,.85)}.klm-card.primary .klm-go{color:rgba(255,255,255,.72)}.klm-card.muted{background:linear-gradient(180deg,rgba(250,248,244,.62),rgba(243,236,225,.5))}.klm-card.muted .klm-chip{background:rgba(40,30,60,.06);color:#8a8390}.klm-card.muted .klm-t{color:#5d5870}.klm-card.muted .klm-d{color:#9a93a6}.klm-sims-row{display:flex;align-items:center;justify-content:space-between;padding:2px 4px 4px;gap:6px;min-height:30px}.klm-sims-chips{display:flex;align-items:center;gap:0}.klm-sim-chip{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font-size:9px;font-weight:700;color:#fff;flex-shrink:0;border:1.5px solid rgba(255,255,255,.65);margin-left:-3px}.klm-sims-chips .klm-sim-chip:first-child{margin-left:0}.klm-issue-pill{font-size:10px;font-weight:650;color:#ef4444;background:rgba(239,68,68,.1);border-radius:20px;padding:2px 7px;white-space:nowrap;margin-left:auto}.klm-sims-label{font-size:10.5px;color:#9a93a6;margin-left:6px;white-space:nowrap}.klm-foot{text-align:center;font-size:11px;color:#8a8076;padding:4px 0 2px;border:0;background:transparent;width:100%;cursor:pointer;font-family:inherit;border-radius:8px;transition:color .18s ease;animation:klm-row-in .42s cubic-bezier(.16,1,.3,1) both}.klm-foot:hover{color:#5b51c9}.klm-foot:focus-visible{outline:2px solid #6366f1;outline-offset:2px}.klm-shine{position:absolute;top:0;left:0;width:42%;height:100%;pointer-events:none;background:linear-gradient(105deg,transparent,rgba(255,255,255,.6),transparent);transform:translateX(-130%);animation:klm-shine 1s ease-out .15s both}"
), Ym = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
function Gm(e, t) {
  const r = e.createElement("button");
  r.className = "klm-card" + (t.primary ? " primary" : "") + (t.muted ? " muted" : ""), t.animationDelayMs != null && (r.style.animationDelay = t.animationDelayMs + "ms");
  const n = t.hint ? '<span class="klm-hint">' + t.hint + "</span>" : '<span class="klm-go">' + Ym + "</span>";
  return r.innerHTML = '<span class="klm-chip">' + t.iconHtml + '</span><span class="klm-body"><span class="klm-t">' + t.label + "</span>" + (t.desc ? '<span class="klm-d">' + t.desc + "</span>" : "") + "</span>" + n, r;
}
function Xm(e) {
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
function Km(e) {
  if (/Windows NT 10/.test(e)) return "Windows 10/11";
  if (/Windows NT/.test(e)) return "Windows";
  if (/iPhone|iPad|iPod/.test(e)) return "iOS";
  if (/Android/.test(e)) return "Android";
  if (/Mac OS X/.test(e)) return "macOS";
  if (/CrOS/.test(e)) return "ChromeOS";
  if (/Linux/.test(e)) return "Linux";
}
function is(e = typeof window < "u" ? window : void 0, t = typeof navigator < "u" ? navigator : void 0) {
  const r = {}, n = t && t.userAgent || "";
  n && (r.userAgent = n.slice(0, 500));
  const i = Xm(n);
  i.browser && (r.browser = i.browser), i.version && (r.browserVersion = i.version);
  const s = Km(n);
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
function $t(e, t) {
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
function rl(e, t = 0) {
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
function nl(e) {
  const t = new ArrayBuffer(8);
  return new DataView(t).setFloat64(0, e, !1), new Uint8Array(t);
}
function Jm(e, t) {
  if (e instanceof Uint8Array || (e = new Uint8Array(e)), e.length < 16 || t <= 0 || e[0] !== 26 || e[1] !== 69 || e[2] !== 223 || e[3] !== 163)
    return e;
  const r = $t(e, 0);
  if (!r) return e;
  const n = $t(e, r.width);
  if (!n) return e;
  const i = r.width + n.width + n.value;
  if (i >= e.length) return e;
  const s = $t(e, i);
  if (!s || s.rawId !== 408125543) return e;
  const a = $t(e, i + s.width);
  if (!a) return e;
  const c = i + s.width + a.width;
  let l = c;
  const d = a.width === 8 && a.value === 72057594037927940, o = d ? e.length : Math.min(e.length, c + a.value);
  let h = -1, p = null, u = 0;
  for (; l < o; ) {
    const fe = $t(e, l);
    if (!fe) break;
    const de = $t(e, l + fe.width);
    if (!de) break;
    if (fe.rawId === 357149030) {
      h = l, p = de, u = fe.width + de.width;
      break;
    }
    if (fe.rawId === 524531317) break;
    l += fe.width + de.width + de.value;
  }
  if (h === -1 || !p) return e;
  const m = h + u, f = m + p.value;
  let g = m, x = 1e6, v = -1, b = 0, C = 0, w = !1;
  for (; g < f; ) {
    const fe = $t(e, g);
    if (!fe) break;
    const de = $t(e, g + fe.width);
    if (!de) break;
    const pe = g + fe.width + de.width, ie = pe + de.value;
    if (fe.rawId === 2807729) {
      w = !0;
      let le = 0;
      for (let Ye = 0; Ye < de.value; Ye++)
        le = le * 256 + e[pe + Ye];
      le > 0 && (x = le);
    } else fe.rawId === 17545 && (v = g, b = ie - g, C = de.value);
    g = ie;
  }
  const k = t * 1e6 / x;
  if (v !== -1 && C === 8) {
    const fe = $t(e, v);
    if (fe) {
      const de = $t(e, v + fe.width);
      if (de && de.value === 8) {
        const pe = v + fe.width + de.width, ie = new Uint8Array(e);
        return ie.set(nl(k), pe), ie;
      }
    }
  }
  const M = new Uint8Array(11);
  M[0] = 68, M[1] = 137, M[2] = 136, M.set(nl(k), 3);
  let O = null;
  w || (O = new Uint8Array([42, 215, 177, 131, 15, 66, 64]));
  let P;
  if (v === -1) {
    const fe = e.subarray(m, f), de = M.length + (O ? O.length : 0);
    P = new Uint8Array(fe.length + de);
    let pe = 0;
    O && (P.set(O, pe), pe += O.length), P.set(fe, pe), pe += fe.length, P.set(M, pe);
  } else {
    const fe = e.subarray(m, v), de = e.subarray(v + b, f), pe = M.length + (O ? O.length : 0);
    P = new Uint8Array(fe.length + pe + de.length);
    let ie = 0;
    O && (P.set(O, ie), ie += O.length), P.set(fe, ie), ie += fe.length, P.set(M, ie), ie += M.length, P.set(de, ie);
  }
  const L = rl(P.length), G = new Uint8Array(4 + L.length);
  G[0] = 21, G[1] = 73, G[2] = 169, G[3] = 102, G.set(L, 4);
  const j = new Uint8Array(G.length + P.length);
  j.set(G, 0), j.set(P, G.length);
  const _ = u + p.value, ke = j.length - _;
  let Ae = null;
  d || (Ae = rl(a.value + ke, a.width));
  const he = e.subarray(0, i + s.width), ae = Ae || e.subarray(i + s.width, c), Te = e.subarray(c, h), _e = j, ve = e.subarray(h + _), me = he.length + ae.length + Te.length + _e.length + ve.length, ne = new Uint8Array(me);
  let z = 0;
  return ne.set(he, z), z += he.length, ne.set(ae, z), z += ae.length, ne.set(Te, z), z += Te.length, ne.set(_e, z), z += _e.length, ne.set(ve, z), z += ve.length, ne;
}
function Zm(e) {
  return typeof e.arrayBuffer == "function" ? e.arrayBuffer() : new Promise((t, r) => {
    try {
      const n = new FileReader();
      n.onload = () => t(n.result), n.onerror = () => r(n.error || new Error("read failed")), n.readAsArrayBuffer(e);
    } catch (n) {
      r(n);
    }
  });
}
async function Qm(e, t) {
  if (!e || t <= 0) return e;
  try {
    const r = new Uint8Array(await Zm(e)), n = Jm(r, t);
    return n === r ? e : new Blob([n], { type: e.type || "video/webm" });
  } catch {
    return e;
  }
}
const eg = 180 * 1e3, tg = 50 * 1024 * 1024, rg = 1e6, ng = 96e3, ig = 15, il = 1280, yu = {
  maxDurationMs: eg,
  maxBytes: tg
}, sg = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm;codecs=h264,opus",
  "video/mp4;codecs=avc1,mp4a.40.2",
  "video/webm"
];
function Ao() {
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
function og(e, t = sg) {
  const r = e ?? ((n) => typeof MediaRecorder < "u" && !!MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(n));
  for (const n of t)
    if (r(n)) return n;
  return null;
}
function bu(e = Ao()) {
  const t = e.mediaDevices, r = e.MediaRecorder ?? globalThis.MediaRecorder;
  return !!t && typeof t.getDisplayMedia == "function" && typeof r < "u";
}
function ag() {
  return "rec_" + (typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));
}
async function lg(e = {}, t = Ao()) {
  var x, v, b, C, w, k, M, O, P, L, G, j;
  const r = { ...yu, ...e.caps || {} }, n = e.wantCamera === !0, i = e.wantMic !== !1, s = Math.max(5, Math.min(60, e.fps ?? ig)), a = og(
    (x = t.MediaRecorder) != null && x.isTypeSupported ? (_) => t.MediaRecorder.isTypeSupported(_) : void 0
  );
  if (!a) throw new Error("recording-unsupported: no MediaRecorder codec available in this browser");
  const c = ag(), l = t.createElement("canvas"), d = l.getContext ? l.getContext("2d") : null, o = t.createElement("video");
  o.muted = !0, o.playsInline = !0;
  const h = t.createElement("video");
  h.muted = !0, h.playsInline = !0;
  let p = "idle";
  const u = (_) => {
    var ke;
    p = _;
    try {
      (ke = e.onState) == null || ke.call(e, _);
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
    for (const ke of [m, f])
      try {
        (_ = ke == null ? void 0 : ke.getTracks) == null || _.call(ke).forEach((Ae) => {
          var he;
          return (he = Ae.stop) == null ? void 0 : he.call(Ae);
        });
      } catch {
      }
  };
  try {
    let _ = function() {
      if (!Je) {
        Je = !0;
        try {
          le.state !== "inactive" && le.stop();
        } catch {
        }
      }
    };
    const ke = (v = m.getVideoTracks) == null ? void 0 : v.call(m)[0], Ae = ((b = ke == null ? void 0 : ke.getSettings) == null ? void 0 : b.call(ke)) ?? {}, he = Ae.width && Ae.height ? Ae.width / Ae.height : 16 / 9;
    l.width = il, l.height = Math.round(il / he);
    try {
      o.srcObject = m, await (((C = o.play) == null ? void 0 : C.call(o)) ?? Promise.resolve());
    } catch {
    }
    let ae = null, Te = !1, _e = !0;
    if (n || i)
      try {
        if (f = await t.mediaDevices.getUserMedia({
          video: n ? { width: 640, height: 480, facingMode: "user" } : !1,
          audio: i ? { echoCancellation: !0, noiseSuppression: !0 } : !1
        }), n && ((w = f.getVideoTracks) != null && w.call(f).length)) {
          Te = !0, _e = !1;
          try {
            h.srcObject = f, await (((k = h.play) == null ? void 0 : k.call(h)) ?? Promise.resolve());
          } catch {
          }
        }
        i && (ae = ((M = f.getAudioTracks) == null ? void 0 : M.call(f)[0]) || null, ae && (_e = !1));
      } catch (ge) {
        let We = !1;
        if (i && n)
          try {
            if (f = await t.mediaDevices.getUserMedia({ video: !1, audio: { echoCancellation: !0, noiseSuppression: !0 } }), ae = ((O = f.getAudioTracks) == null ? void 0 : O.call(f)[0]) || null, ae) {
              _e = !1, We = !0;
              try {
                (P = e.onFallback) == null || P.call(e, "camera-blocked");
              } catch {
              }
            }
          } catch {
          }
        if (!We) {
          try {
            (L = e.onFallback) == null || L.call(e, (ge == null ? void 0 : ge.name) === "NotAllowedError" ? "permissions-policy" : (ge == null ? void 0 : ge.name) || "camera-mic-blocked");
          } catch {
          }
          _e = !0;
        }
      }
    const ve = !!ae;
    let me = 0;
    const ne = () => {
      if (me = t.raf(ne), !d) return;
      const ge = l.width, We = l.height;
      if (o.videoWidth) {
        const rt = o.videoWidth / o.videoHeight, yt = ge / We;
        let qt = ge, Wt = We, Cn = 0, Jr = 0;
        rt > yt ? (Wt = ge / rt, Jr = (We - Wt) / 2) : (qt = We * rt, Cn = (ge - qt) / 2), d.fillStyle = "#000", d.fillRect(0, 0, ge, We), d.drawImage(o, Cn, Jr, qt, Wt);
      }
      if (Te && h.videoWidth) {
        const rt = Math.round(ge * 0.22), yt = Math.round(rt * (h.videoHeight / h.videoWidth)), qt = ge - rt - 20, Wt = We - yt - 20;
        d.drawImage(h, qt, Wt, rt, yt), d.strokeStyle = "#7c3aed", d.lineWidth = 2, d.strokeRect(qt, Wt, rt, yt);
      }
      p === "recording" && (d.fillStyle = "#e11", d.beginPath(), d.arc(24, 24, 7, 0, Math.PI * 2), d.fill());
    };
    ne();
    const z = l.captureStream(s), fe = [(G = z.getVideoTracks) == null ? void 0 : G.call(z)[0]].filter(Boolean);
    ae && fe.push(ae);
    const de = new t.MediaStream(fe), pe = Math.max(15e4, Math.floor(e.videoBitsPerSecond ?? rg)), ie = Math.max(16e3, Math.floor(e.audioBitsPerSecond ?? ng)), le = new t.MediaRecorder(de, { mimeType: a, videoBitsPerSecond: pe, audioBitsPerSecond: ie }), Ye = [];
    let tt = 0, te = 0, Ne = 0, ue = 0, we = 0, Je = !1;
    const Ce = () => {
      if (p === "idle") return 0;
      const ge = t.now() - te - Ne;
      return Math.max(0, ge - (ue ? t.now() - ue : 0));
    };
    le.ondataavailable = (ge) => {
      var We;
      ge != null && ge.data && ge.data.size && (Ye.push(ge.data), tt += ge.data.size);
      try {
        (We = e.onStats) == null || We.call(e, { elapsedMs: Ce(), bytes: tt });
      } catch {
      }
      tt >= r.maxBytes && _();
    };
    let Fe;
    const at = new Promise((ge) => {
      Fe = ge;
    }), sr = g;
    le.onstop = async () => {
      t.caf(me), we && (t.clearInterval(we), we = 0);
      const ge = Ce();
      sr(), u("stopped");
      const We = new Blob(Ye, { type: a.split(";")[0] });
      let rt = We;
      if (ge > 0 && (We.type.includes("webm") || a.includes("webm")))
        try {
          rt = await Qm(We, ge);
        } catch {
          rt = We;
        }
      Fe({
        id: c,
        blob: rt,
        mime: rt.type || a,
        durationMs: ge,
        bytes: rt.size || tt,
        width: l.width,
        height: l.height,
        screenOnly: _e,
        hadCamera: Te,
        hadAudio: ve
      });
    };
    try {
      (j = ke == null ? void 0 : ke.addEventListener) == null || j.call(ke, "ended", () => _());
    } catch {
    }
    return le.start(1e3), te = t.now(), u("recording"), we = t.setInterval(() => {
      var We;
      const ge = Ce();
      try {
        (We = e.onStats) == null || We.call(e, { elapsedMs: ge, bytes: tt });
      } catch {
      }
      ge >= r.maxDurationMs && _();
    }, 200), {
      pause() {
        if (p === "recording") {
          try {
            le.pause();
          } catch {
          }
          ue = t.now(), u("paused");
        }
      },
      resume() {
        if (p === "paused") {
          try {
            le.resume();
          } catch {
          }
          Ne += t.now() - ue, ue = 0, u("recording");
        }
      },
      stop() {
        _();
      },
      state() {
        return p;
      },
      screenOnly() {
        return _e;
      },
      // KLA-602(b): expose the live camera stream ONLY when the camera is genuinely part of the capture, so the
      // overlay can mount a self-view bubble. Screen-only / audio-only(mic) fallbacks return null → no bubble.
      cameraStream() {
        return Te && f ? f : null;
      },
      done: at
    };
  } catch (_) {
    throw g(), _;
  }
}
function cg(e) {
  return new Promise((t, r) => {
    try {
      const n = new FileReader();
      n.onload = () => t(String(n.result)), n.onerror = () => r(n.error || new Error("read failed")), n.readAsDataURL(e);
    } catch (n) {
      r(n);
    }
  });
}
async function ug(e) {
  return {
    id: e.id,
    dataUrl: await cg(e.blob),
    mime: e.mime,
    durationMs: Math.round(e.durationMs),
    bytes: e.bytes,
    width: e.width,
    height: e.height,
    screenOnly: e.screenOnly
  };
}
function dg(e) {
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
async function pg(e = {}) {
  if (typeof document > "u") return null;
  const t = e.deps ?? Ao();
  return bu(t) ? new Promise((r) => {
    const n = document.createElement("div");
    n.setAttribute("data-klavity-ui", "recorder");
    const i = document.createElement("div");
    n.appendChild(i), document.body.appendChild(n);
    const s = 'font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#19140f', a = (k) => {
      k === "bar" ? (n.style.cssText = `position:fixed;inset:0;z-index:2147483647;pointer-events:none;${s}`, i.style.cssText = "position:fixed;right:20px;top:50%;transform:translateY(-50%);pointer-events:auto;background:#f5f3ee;border:1px solid #e3ddd1;border-radius:14px;box-shadow:0 12px 40px rgba(28,22,40,.32);overflow:hidden;max-width:min(240px,80vw)") : (n.style.cssText = `position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;background:rgba(10,8,14,.55);${s}`, i.style.cssText = "width:360px;max-width:92vw;background:#f5f3ee;border:1px solid #e3ddd1;border-radius:12px;box-shadow:0 20px 60px rgba(28,22,40,.28);overflow:hidden");
    }, c = (k) => {
      var M;
      try {
        (M = e.onPhase) == null || M.call(e, k);
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
      const M = Math.max(0, Math.round(k / 1e3));
      return `${Math.floor(M / 60)}:${String(M % 60).padStart(2, "0")}`;
    }, x = (k) => `${(k / 1048576).toFixed(1)} MB`, v = { ...yu, ...e.caps || {} }, b = () => {
      a("modal"), c("consent"), o = !0, i.setAttribute("role", "dialog"), i.setAttribute("aria-modal", "true"), i.setAttribute("aria-label", "Record a walkthrough");
      const k = e.defaultCamera === !0 ? " checked" : "";
      i.innerHTML = `<div style="padding:14px;border-bottom:1px solid #e3ddd1;font-weight:600">Record a walkthrough</div><div style="padding:14px"><label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="klr-screen" checked disabled> Share my <b>screen</b></label><label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="klr-cam"${k}> Camera <span style="font-size:9px;font-weight:800;color:#fff;background:#6366f1;padding:1px 5px;border-radius:999px">optional</span></label><label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="klr-mic" checked> Microphone (narration)</label><div style="display:flex;gap:8px;margin-top:10px"><button id="klr-start" style="padding:8px 13px;border-radius:8px;border:1px solid #dc2626;background:#dc2626;color:#fff;font-weight:600;cursor:pointer">Start recording</button><button id="klr-cancel" style="padding:8px 13px;border-radius:8px;border:1px solid #e3ddd1;background:#fffdf8;font-weight:600;cursor:pointer">Cancel</button></div><p style="font-size:11px;color:#574f45;margin-top:8px;padding:8px;background:#efeadf;border-radius:8px;border:1px solid #e3ddd1">Tip: to capture steps across <b>multiple pages/tabs</b>, choose <b>&quot;Entire Screen&quot;</b> in the next dialog. Sharing a single tab will not follow you when you switch tabs.</p><p style="font-size:11px;color:#574f45;margin-top:8px">Your browser will ask to share a tab/screen. Max ${Math.round(v.maxDurationMs / 6e4)} min. Nothing uploads until you attach it.</p><div id="klr-hint"></div></div>`, i.querySelector("#klr-cancel").onclick = () => f(null), i.querySelector("#klr-start").onclick = () => {
        const M = i.querySelector("#klr-cam").checked, O = i.querySelector("#klr-mic").checked;
        C(M, O);
      };
    }, C = async (k, M) => {
      var P;
      let O = null;
      try {
        d = await lg({
          wantCamera: k,
          wantMic: M,
          caps: e.caps,
          onFallback: (L) => {
            O = L;
          },
          onStats: ({ elapsedMs: L, bytes: G }) => {
            const j = i.querySelector("#klr-timer");
            j && (j.textContent = "REC " + g(L));
            const _ = i.querySelector("#klr-meta");
            _ && (_.innerHTML = `${g(Math.max(0, v.maxDurationMs - L))} left<br>~${x(G)}`);
          }
        }, t);
      } catch {
        f(null);
        return;
      }
      w(O);
      try {
        const L = dg((P = d == null ? void 0 : d.cameraStream) == null ? void 0 : P.call(d));
        L && n.appendChild(L);
      } catch {
      }
      d.done.then(async (L) => {
        f(await ug(L));
      });
    }, w = (k) => {
      const M = k === "camera-blocked", P = M ? '<div style="padding:0 14px 10px;font-size:11px;color:#574f45">Camera blocked by this site — recording <b>screen + mic narration</b>.</div>' : !!k && !M ? '<div style="padding:0 14px 10px;font-size:11px;color:#574f45">Camera/mic blocked — recording <b>screen only</b>. Narrate by typing, or use the extension.</div>' : "";
      a("bar"), c("recording"), o = !1, i.removeAttribute("role"), i.removeAttribute("aria-modal"), i.removeAttribute("aria-label"), i.innerHTML = '<div style="display:flex;flex-direction:column;gap:9px;padding:12px 14px;min-width:180px"><span style="display:inline-flex;align-items:center;gap:7px;font-weight:700;white-space:nowrap"><span aria-hidden="true" style="width:10px;height:10px;border-radius:50%;background:#e11;flex:none"></span><span id="klr-timer">REC 0:00</span></span><button id="klr-stop" aria-label="Stop recording" title="Stop recording" style="display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:12px 16px;border-radius:10px;border:1px solid #dc2626;background:#dc2626;color:#fff;font-weight:700;font-size:15px;cursor:pointer"><span aria-hidden="true" style="width:12px;height:12px;border-radius:2px;background:#fff;flex:none"></span>Stop recording</button><button id="klr-pause" style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid #e3ddd1;background:#fffdf8;font-weight:600;cursor:pointer">Pause</button><span id="klr-meta" style="font-size:11px;color:#574f45;text-align:center;white-space:nowrap"></span></div>' + P;
      const L = i.querySelector("#klr-pause");
      L.onclick = () => {
        d && (d.state() === "recording" ? (d.pause(), L.textContent = "Resume") : (d.resume(), L.textContent = "Pause"));
      }, i.querySelector("#klr-stop").onclick = () => d == null ? void 0 : d.stop();
    };
    b();
  }) : null;
}
async function sl(e, t = {}) {
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
async function hg(e, t = {}) {
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
var fg = Object.defineProperty, mg = (e, t, r) => t in e ? fg(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, q = (e, t, r) => mg(e, typeof t != "symbol" ? t + "" : t, r), ol, gg = Object.defineProperty, yg = (e, t, r) => t in e ? gg(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, al = (e, t, r) => yg(e, typeof t != "symbol" ? t + "" : t, r), Ke = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(Ke || {});
const ll = {
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
}, cl = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, qn = {}, vu = {}, bg = () => !!globalThis.Zone;
function _o(e) {
  if (qn[e])
    return qn[e];
  const t = globalThis[e], r = t.prototype, n = e in ll ? ll[e] : void 0, i = !!(n && // @ts-expect-error 2345
  n.every(
    (c) => {
      var l, d;
      return !!((d = (l = Object.getOwnPropertyDescriptor(r, c)) == null ? void 0 : l.get) != null && d.toString().includes("[native code]"));
    }
  )), s = e in cl ? cl[e] : void 0, a = !!(s && s.every(
    // @ts-expect-error 2345
    (c) => {
      var l;
      return typeof r[c] == "function" && ((l = r[c]) == null ? void 0 : l.toString().includes("[native code]"));
    }
  ));
  if (i && a && !bg())
    return qn[e] = t.prototype, t.prototype;
  try {
    const c = document.createElement("iframe");
    c.style.display = "none", document.body.appendChild(c);
    const l = c.contentWindow;
    if (!l) return t.prototype;
    const d = l[e].prototype;
    if (!d)
      return c.remove(), r;
    const o = navigator.userAgent;
    return o.includes("Safari") && !o.includes("Chrome") ? (c.classList.add("rr-block"), c.setAttribute("__rrwebUntaintedMutationObserver", ""), vu[e] = () => c.remove()) : c.remove(), qn[e] = d;
  } catch {
    return r;
  }
}
const ss = {};
function Vt(e, t, r) {
  var n;
  const i = `${e}.${String(r)}`;
  if (ss[i])
    return ss[i].call(
      t
    );
  const s = _o(e), a = (n = Object.getOwnPropertyDescriptor(
    s,
    r
  )) == null ? void 0 : n.get;
  return a ? (ss[i] = a, a.call(t)) : t[r];
}
const os = {};
function ku(e, t, r) {
  const n = `${e}.${String(r)}`;
  if (os[n])
    return os[n].bind(
      t
    );
  const s = _o(e)[r];
  return typeof s != "function" ? t[r] : (os[n] = s, s.bind(t));
}
function vg(e) {
  return Vt("Node", e, "ownerDocument");
}
function kg(e) {
  return Vt("Node", e, "childNodes");
}
function wg(e) {
  return Vt("Node", e, "parentNode");
}
function xg(e) {
  return Vt("Node", e, "parentElement");
}
function Sg(e) {
  return Vt("Node", e, "textContent");
}
function Eg(e, t) {
  return ku("Node", e, "contains")(t);
}
function Cg(e) {
  return ku("Node", e, "getRootNode")();
}
function Mg(e) {
  return !e || !("host" in e) ? null : Vt("ShadowRoot", e, "host");
}
function Tg(e) {
  return e.styleSheets;
}
function Rg(e) {
  return !e || !("shadowRoot" in e) ? null : Vt("Element", e, "shadowRoot");
}
function Ag(e, t) {
  return Vt("Element", e, "querySelector")(t);
}
function _g(e, t) {
  return Vt("Element", e, "querySelectorAll")(t);
}
function Ig() {
  return [
    _o("MutationObserver").constructor,
    vu.MutationObserver ?? (() => {
    })
  ];
}
let wu = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (wu = () => (/* @__PURE__ */ new Date()).getTime());
function Lg(e, t, r) {
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
const ot = {
  ownerDocument: vg,
  childNodes: kg,
  parentNode: wg,
  parentElement: xg,
  textContent: Sg,
  contains: Eg,
  getRootNode: Cg,
  host: Mg,
  styleSheets: Tg,
  shadowRoot: Rg,
  querySelector: Ag,
  querySelectorAll: _g,
  nowTimestamp: wu,
  mutationObserverCtor: Ig,
  patch: Lg
};
function xu(e) {
  return e.nodeType === e.ELEMENT_NODE;
}
function dn(e) {
  const t = (
    // anchor and textarea elements also have a `host` property
    // but only shadow roots have a `mode` property
    e && "host" in e && "mode" in e && ot.host(e) || null
  );
  return !!(t && "shadowRoot" in t && ot.shadowRoot(t) === e);
}
function pn(e) {
  return Object.prototype.toString.call(e) === "[object ShadowRoot]";
}
function Og(e) {
  return e.includes(" background-clip: text;") && !e.includes(" -webkit-background-clip: text;") && (e = e.replace(
    /\sbackground-clip:\s*text;/g,
    " -webkit-background-clip: text; background-clip: text;"
  )), e;
}
function Ng(e) {
  const { cssText: t } = e;
  if (t.split('"').length < 3) return t;
  const r = ["@import", `url(${JSON.stringify(e.href)})`];
  return e.layerName === "" ? r.push("layer") : e.layerName && r.push(`layer(${e.layerName})`), e.supportsText && r.push(`supports(${e.supportsText})`), e.media.length && r.push(e.media.mediaText), r.join(" ") + ";";
}
function bo(e) {
  try {
    const t = e.rules || e.cssRules;
    if (!t)
      return null;
    let r = e.href;
    !r && e.ownerNode && (r = e.ownerNode.baseURI);
    const n = Array.from(
      t,
      (i) => Su(i, r)
    ).join("");
    return Og(n);
  } catch {
    return null;
  }
}
function Su(e, t) {
  if (zg(e)) {
    let r;
    try {
      r = // for same-origin stylesheets,
      // we can access the imported stylesheet rules directly
      bo(e.styleSheet) || // work around browser issues with the raw string `@import url(...)` statement
      Ng(e);
    } catch {
      r = e.cssText;
    }
    return e.styleSheet.href ? ci(r, e.styleSheet.href) : r;
  } else {
    let r = e.cssText;
    return Dg(e) && e.selectorText.includes(":") && (r = Pg(r)), t ? ci(r, t) : r;
  }
}
function Pg(e) {
  const t = /(\[(?:[\w-]+)[^\\])(:(?:[\w-]+)\])/gm;
  return e.replace(t, "$1\\$2");
}
function zg(e) {
  return "styleSheet" in e;
}
function Dg(e) {
  return "selectorText" in e;
}
class Eu {
  constructor() {
    al(this, "idNodeMap", /* @__PURE__ */ new Map()), al(this, "nodeMetaMap", /* @__PURE__ */ new WeakMap());
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
function $g() {
  return new Eu();
}
function ai({
  element: e,
  maskInputOptions: t,
  tagName: r,
  type: n,
  value: i,
  maskInputFn: s
}) {
  let a = i || "";
  const c = n && wr(n);
  return (t[r.toLowerCase()] || c && t[c]) && (s ? a = s(a, e) : a = "*".repeat(a.length)), a;
}
function wr(e) {
  return e.toLowerCase();
}
const ul = "__rrweb_original__";
function Fg(e) {
  const t = e.getContext("2d");
  if (!t) return !0;
  const r = 50;
  for (let n = 0; n < e.width; n += r)
    for (let i = 0; i < e.height; i += r) {
      const s = t.getImageData, a = ul in s ? s[ul] : s;
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
function li(e) {
  const t = e.type;
  return e.hasAttribute("data-rr-is-password") ? "password" : t ? (
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    wr(t)
  ) : null;
}
function Cu(e, t) {
  let r;
  try {
    r = new URL(e, t ?? window.location.href);
  } catch {
    return null;
  }
  const n = /\.([0-9a-z]+)(?:$)/i, i = r.pathname.match(n);
  return (i == null ? void 0 : i[1]) ?? null;
}
function Ug(e) {
  let t = "";
  return e.indexOf("//") > -1 ? t = e.split("/").slice(0, 3).join("/") : t = e.split("/")[0], t = t.split("?")[0], t;
}
const Bg = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm, qg = /^(?:[a-z+]+:)?\/\//i, Wg = /^www\..*/i, Hg = /^(data:)([^,]*),(.*)/i;
function ci(e, t) {
  return (e || "").replace(
    Bg,
    (r, n, i, s, a, c) => {
      const l = i || a || c, d = n || s || "";
      if (!l)
        return r;
      if (qg.test(l) || Wg.test(l))
        return `url(${d}${l}${d})`;
      if (Hg.test(l))
        return `url(${d}${l}${d})`;
      if (l[0] === "/")
        return `url(${d}${Ug(t) + l}${d})`;
      const o = t.split("/"), h = l.split("/");
      o.pop();
      for (const p of h)
        p !== "." && (p === ".." ? o.pop() : o.push(p));
      return `url(${d}${o.join("/")}${d})`;
    }
  );
}
function Wn(e, t = !1) {
  return t ? e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "") : e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "").replace(/0px/g, "0");
}
function jg(e, t, r = !1) {
  const n = Array.from(t.childNodes), i = [];
  let s = 0;
  if (n.length > 1 && e && typeof e == "string") {
    let a = Wn(e, r);
    const c = a.length / e.length;
    for (let l = 1; l < n.length; l++)
      if (n[l].textContent && typeof n[l].textContent == "string") {
        const d = Wn(
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
              const g = Wn(f).length;
              m = a.indexOf(p, g);
            }
            m === -1 && (m = u[0].length);
          }
          if (m !== -1) {
            let f = Math.floor(m / c);
            for (; f > 0 && f < e.length; ) {
              if (s += 1, s > 50 * n.length)
                return i.push(e), i;
              const g = Wn(
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
function Vg(e, t) {
  return jg(e, t).join("/* rr_split */");
}
let Yg = 1;
const Gg = new RegExp("[^a-z0-9-_:]"), yn = -2;
function Mu() {
  return Yg++;
}
function Xg(e) {
  if (e instanceof HTMLFormElement)
    return "form";
  const t = wr(e.tagName);
  return Gg.test(t) ? "div" : t;
}
let Or, dl;
const Kg = /^[^ \t\n\r\u000c]+/, Jg = /^[, \t\n\r\u000c]+/;
function Zg(e, t) {
  if (t.trim() === "")
    return t;
  let r = 0;
  function n(s) {
    let a;
    const c = s.exec(t.substring(r));
    return c ? (a = c[0], r += a.length, a) : "";
  }
  const i = [];
  for (; n(Jg), !(r >= t.length); ) {
    let s = n(Kg);
    if (s.slice(-1) === ",")
      s = Dr(e, s.substring(0, s.length - 1)), i.push(s);
    else {
      let a = "";
      s = Dr(e, s);
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
const pl = /* @__PURE__ */ new WeakMap();
function Dr(e, t) {
  return !t || t.trim() === "" ? t : Io(e, t);
}
function Qg(e) {
  return !!(e.tagName === "svg" || e.ownerSVGElement);
}
function Io(e, t) {
  let r = pl.get(e);
  if (r || (r = e.createElement("a"), pl.set(e, r)), !t)
    t = "";
  else if (t.startsWith("blob:") || t.startsWith("data:"))
    return t;
  return r.setAttribute("href", t), r.href;
}
function Tu(e, t, r, n) {
  return n && (r === "src" || r === "href" && !(t === "use" && n[0] === "#") || r === "xlink:href" && n[0] !== "#" || r === "background" && ["table", "td", "th"].includes(t) ? Dr(e, n) : r === "srcset" ? Zg(e, n) : r === "style" ? ci(n, Io(e)) : t === "object" && r === "data" ? Dr(e, n) : n);
}
function Ru(e, t, r) {
  return ["video", "audio"].includes(e) && t === "autoplay";
}
function ey(e, t, r) {
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
function ui(e, t, r) {
  if (!e) return !1;
  if (e.nodeType !== e.ELEMENT_NODE)
    return r ? ui(ot.parentNode(e), t, r) : !1;
  for (let n = e.classList.length; n--; ) {
    const i = e.classList[n];
    if (t.test(i))
      return !0;
  }
  return r ? ui(ot.parentNode(e), t, r) : !1;
}
function Au(e, t, r, n) {
  let i;
  if (xu(e)) {
    if (i = e, !ot.childNodes(i).length)
      return !1;
  } else {
    if (ot.parentElement(e) === null)
      return !1;
    i = ot.parentElement(e);
  }
  try {
    if (typeof t == "string") {
      if (n) {
        if (i.closest(`.${t}`)) return !0;
      } else if (i.classList.contains(t)) return !0;
    } else if (ui(i, t, n)) return !0;
    if (r) {
      if (n) {
        if (i.closest(r)) return !0;
      } else if (i.matches(r)) return !0;
    }
  } catch {
  }
  return !1;
}
function ty(e, t, r) {
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
function ry(e, t, r) {
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
function ny(e, t) {
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
  } = t, x = iy(r, n);
  switch (e.nodeType) {
    case e.DOCUMENT_NODE:
      return e.compatMode !== "CSS1Compat" ? {
        type: Ke.Document,
        childNodes: [],
        compatMode: e.compatMode
        // probably "BackCompat"
      } : {
        type: Ke.Document,
        childNodes: []
      };
    case e.DOCUMENT_TYPE_NODE:
      return {
        type: Ke.DocumentType,
        name: e.name,
        publicId: e.publicId,
        systemId: e.systemId,
        rootId: x
      };
    case e.ELEMENT_NODE:
      return oy(e, {
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
      return sy(e, {
        doc: r,
        needsMask: a,
        maskTextFn: d,
        rootId: x,
        cssCaptured: g
      });
    case e.CDATA_SECTION_NODE:
      return {
        type: Ke.CDATA,
        textContent: "",
        rootId: x
      };
    case e.COMMENT_NODE:
      return {
        type: Ke.Comment,
        textContent: ot.textContent(e) || "",
        rootId: x
      };
    default:
      return !1;
  }
}
function iy(e, t) {
  if (!t.hasNode(e)) return;
  const r = t.getId(e);
  return r === 1 ? void 0 : r;
}
function sy(e, t) {
  const { needsMask: r, maskTextFn: n, rootId: i, cssCaptured: s } = t, a = ot.parentNode(e), c = a && a.tagName;
  let l = "";
  const d = c === "STYLE" ? !0 : void 0, o = c === "SCRIPT" ? !0 : void 0;
  return o ? l = "SCRIPT_PLACEHOLDER" : s || (l = ot.textContent(e), d && l && (l = ci(l, Io(t.doc)))), !d && !o && l && r && (l = n ? n(l, ot.parentElement(e)) : l.replace(/[\S]/g, "*")), {
    type: Ke.Text,
    textContent: l || "",
    rootId: i
  };
}
function oy(e, t) {
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
  } = t, m = ey(e, n, i), f = Xg(e);
  let g = {};
  const x = e.attributes.length;
  for (let b = 0; b < x; b++) {
    const C = e.attributes[b];
    Ru(f, C.name, C.value) || (g[C.name] = Tu(
      r,
      f,
      wr(C.name),
      C.value
    ));
  }
  if (f === "link" && s) {
    const b = Array.from(r.styleSheets).find((w) => w.href === e.href);
    let C = null;
    b && (C = bo(b)), C && (delete g.rel, delete g.href, g._cssText = C);
  }
  if (f === "style" && e.sheet) {
    let b = bo(
      e.sheet
    );
    b && (e.childNodes.length > 1 && (b = Vg(b, e)), g._cssText = b);
  }
  if (["input", "textarea", "select"].includes(f)) {
    const b = e.value, C = e.checked;
    g.type !== "radio" && g.type !== "checkbox" && g.type !== "submit" && g.type !== "button" && b ? g.value = ai({
      element: e,
      type: li(e),
      tagName: f,
      value: b,
      maskInputOptions: a,
      maskInputFn: c
    }) : C && (g.checked = C);
  }
  if (f === "option" && (e.selected && !a.select ? g.selected = !0 : delete g.selected), f === "dialog" && e.open && (g.rr_open_mode = e.matches("dialog:modal") ? "modal" : "non-modal"), f === "canvas" && o) {
    if (e.__context === "2d")
      Fg(e) || (g.rr_dataURL = e.toDataURL(
        l.type,
        l.quality
      ));
    else if (!("__context" in e)) {
      const b = e.toDataURL(
        l.type,
        l.quality
      ), C = r.createElement("canvas");
      C.width = e.width, C.height = e.height;
      const w = C.toDataURL(
        l.type,
        l.quality
      );
      b !== w && (g.rr_dataURL = b);
    }
  }
  if (f === "img" && d) {
    Or || (Or = r.createElement("canvas"), dl = Or.getContext("2d"));
    const b = e, C = b.currentSrc || b.getAttribute("src") || "<unknown-src>", w = b.crossOrigin, k = () => {
      b.removeEventListener("load", k);
      try {
        Or.width = b.naturalWidth, Or.height = b.naturalHeight, dl.drawImage(b, 0, 0), g.rr_dataURL = Or.toDataURL(
          l.type,
          l.quality
        );
      } catch (M) {
        if (b.crossOrigin !== "anonymous") {
          b.crossOrigin = "anonymous", b.complete && b.naturalWidth !== 0 ? k() : b.addEventListener("load", k);
          return;
        } else
          console.warn(
            `Cannot inline img src=${C}! Error: ${M}`
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
    const { width: b, height: C } = e.getBoundingClientRect();
    g = {
      class: g.class,
      rr_width: `${b}px`,
      rr_height: `${C}px`
    };
  }
  f === "iframe" && !h(g.src) && (e.contentDocument || (g.rr_src = g.src), delete g.src);
  let v;
  try {
    customElements.get(f) && (v = !0);
  } catch {
  }
  return {
    type: Ke.Element,
    tagName: f,
    attributes: g,
    childNodes: [],
    isSVG: Qg(e) || void 0,
    needBlock: m,
    rootId: u,
    isCustom: v
  };
}
function $e(e) {
  return e == null ? "" : e.toLowerCase();
}
function _u(e) {
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
function ay(e, t) {
  if (t.comment && e.type === Ke.Comment)
    return !0;
  if (e.type === Ke.Element) {
    if (t.script && // script tag
    (e.tagName === "script" || // (module)preload link
    e.tagName === "link" && (e.attributes.rel === "preload" && e.attributes.as === "script" || e.attributes.rel === "modulepreload") || // prefetch link
    e.tagName === "link" && e.attributes.rel === "prefetch" && typeof e.attributes.href == "string" && Cu(e.attributes.href) === "js"))
      return !0;
    if (t.headFavicon && (e.tagName === "link" && e.attributes.rel === "shortcut icon" || e.tagName === "meta" && ($e(e.attributes.name).match(
      /^msapplication-tile(image|color)$/
    ) || $e(e.attributes.name) === "application-name" || $e(e.attributes.rel) === "icon" || $e(e.attributes.rel) === "apple-touch-icon" || $e(e.attributes.rel) === "shortcut icon")))
      return !0;
    if (e.tagName === "meta") {
      if (t.headMetaDescKeywords && $e(e.attributes.name).match(/^description|keywords$/))
        return !0;
      if (t.headMetaSocial && ($e(e.attributes.property).match(/^(og|twitter|fb):/) || // og = opengraph (facebook)
      $e(e.attributes.name).match(/^(og|twitter):/) || $e(e.attributes.name) === "pinterest"))
        return !0;
      if (t.headMetaRobots && ($e(e.attributes.name) === "robots" || $e(e.attributes.name) === "googlebot" || $e(e.attributes.name) === "bingbot"))
        return !0;
      if (t.headMetaHttpEquiv && e.attributes["http-equiv"] !== void 0)
        return !0;
      if (t.headMetaAuthorship && ($e(e.attributes.name) === "author" || $e(e.attributes.name) === "generator" || $e(e.attributes.name) === "framework" || $e(e.attributes.name) === "publisher" || $e(e.attributes.name) === "progid" || $e(e.attributes.property).match(/^article:/) || $e(e.attributes.property).match(/^product:/)))
        return !0;
      if (t.headMetaVerification && ($e(e.attributes.name) === "google-site-verification" || $e(e.attributes.name) === "yandex-verification" || $e(e.attributes.name) === "csrf-token" || $e(e.attributes.name) === "p:domain_verify" || $e(e.attributes.name) === "verify-v1" || $e(e.attributes.name) === "verification" || $e(e.attributes.name) === "shopify-checkout-api-token"))
        return !0;
    }
  }
  return !1;
}
function $r(e, t) {
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
    onStylesheetLoad: C,
    stylesheetLoadTimeout: w = 5e3,
    keepIframeSrcFn: k = () => !1,
    newlyAddedElement: M = !1,
    cssCaptured: O = !1
  } = t;
  let { needsMask: P } = t, { preserveWhiteSpace: L = !0 } = t;
  P || (P = Au(
    e,
    a,
    c,
    P === void 0
  ));
  const G = ny(e, {
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
    newlyAddedElement: M,
    cssCaptured: O
  });
  if (!G)
    return console.warn(e, "not serialized"), null;
  let j;
  n.hasNode(e) ? j = n.getId(e) : ay(G, u) || !L && G.type === Ke.Text && !G.textContent.replace(/^\s+|\s+$/gm, "").length ? j = yn : j = Mu();
  const _ = Object.assign(G, { id: j });
  if (n.add(e, _), j === yn)
    return null;
  x && x(e);
  let ke = !l;
  if (_.type === Ke.Element) {
    ke = ke && !_.needBlock, delete _.needBlock;
    const he = ot.shadowRoot(e);
    he && pn(he) && (_.isShadowHost = !0);
  }
  if ((_.type === Ke.Document || _.type === Ke.Element) && ke) {
    u.headWhitespace && _.type === Ke.Element && _.tagName === "head" && (L = !1);
    const he = {
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
      onIframeLoad: v,
      iframeLoadTimeout: b,
      onStylesheetLoad: C,
      stylesheetLoadTimeout: w,
      keepIframeSrcFn: k,
      cssCaptured: !1
    };
    if (!(_.type === Ke.Element && _.tagName === "textarea" && _.attributes.value !== void 0)) {
      _.type === Ke.Element && _.attributes._cssText !== void 0 && typeof _.attributes._cssText == "string" && (he.cssCaptured = !0);
      for (const Te of Array.from(ot.childNodes(e))) {
        const _e = $r(Te, he);
        _e && _.childNodes.push(_e);
      }
    }
    let ae = null;
    if (xu(e) && (ae = ot.shadowRoot(e)))
      for (const Te of Array.from(ot.childNodes(ae))) {
        const _e = $r(Te, he);
        _e && (pn(ae) && (_e.isShadow = !0), _.childNodes.push(_e));
      }
  }
  const Ae = ot.parentNode(e);
  return Ae && dn(Ae) && pn(Ae) && (_.isShadow = !0), _.type === Ke.Element && _.tagName === "iframe" && ty(
    e,
    () => {
      const he = e.contentDocument;
      if (he && v) {
        const ae = $r(he, {
          doc: he,
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
          onIframeLoad: v,
          iframeLoadTimeout: b,
          onStylesheetLoad: C,
          stylesheetLoadTimeout: w,
          keepIframeSrcFn: k
        });
        ae && v(
          e,
          ae
        );
      }
    },
    b
  ), _.type === Ke.Element && _.tagName === "link" && typeof _.attributes.rel == "string" && (_.attributes.rel === "stylesheet" || _.attributes.rel === "preload" && typeof _.attributes.href == "string" && Cu(_.attributes.href) === "css") && ry(
    e,
    () => {
      if (C) {
        const he = $r(e, {
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
          onIframeLoad: v,
          iframeLoadTimeout: b,
          onStylesheetLoad: C,
          stylesheetLoadTimeout: w,
          keepIframeSrcFn: k
        });
        he && C(
          e,
          he
        );
      }
    },
    w
  ), _;
}
function ly(e, t) {
  const {
    mirror: r = new Eu(),
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
    stylesheetLoadTimeout: C,
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
  } : o, M = _u(u);
  return $r(e, {
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
    slimDOMOptions: M,
    dataURLOptions: m,
    inlineImages: l,
    recordCanvas: d,
    preserveWhiteSpace: f,
    onSerialize: g,
    onIframeLoad: x,
    iframeLoadTimeout: v,
    onStylesheetLoad: b,
    stylesheetLoadTimeout: C,
    keepIframeSrcFn: w,
    newlyAddedElement: !1
  });
}
function cy(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function uy(e) {
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
var Hn = { exports: {} }, hl;
function dy() {
  if (hl) return Hn.exports;
  hl = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return Hn.exports = t(), Hn.exports.createColors = t, Hn.exports;
}
const py = {}, hy = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: py
}, Symbol.toStringTag, { value: "Module" })), Ot = /* @__PURE__ */ uy(hy);
var as, fl;
function Lo() {
  if (fl) return as;
  fl = 1;
  let e = /* @__PURE__ */ dy(), t = Ot;
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
  return as = r, r.default = r, as;
}
var jn = {}, ml;
function Oo() {
  return ml || (ml = 1, jn.isClean = Symbol("isClean"), jn.my = Symbol("my")), jn;
}
var ls, gl;
function Iu() {
  if (gl) return ls;
  gl = 1;
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
  return ls = r, r.default = r, ls;
}
var cs, yl;
function ki() {
  if (yl) return cs;
  yl = 1;
  let e = Iu();
  function t(r, n) {
    new e(n).stringify(r);
  }
  return cs = t, t.default = t, cs;
}
var us, bl;
function wi() {
  if (bl) return us;
  bl = 1;
  let { isClean: e, my: t } = Oo(), r = Lo(), n = Iu(), i = ki();
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
  return us = a, a.default = a, us;
}
var ds, vl;
function xi() {
  if (vl) return ds;
  vl = 1;
  let e = wi();
  class t extends e {
    constructor(n) {
      n && typeof n.value < "u" && typeof n.value != "string" && (n = { ...n, value: String(n.value) }), super(n), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return ds = t, t.default = t, ds;
}
var ps, kl;
function fy() {
  if (kl) return ps;
  kl = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return ps = { nanoid: (n = 21) => {
    let i = "", s = n;
    for (; s--; )
      i += e[Math.random() * 64 | 0];
    return i;
  }, customAlphabet: (n, i = 21) => (s = i) => {
    let a = "", c = s;
    for (; c--; )
      a += n[Math.random() * n.length | 0];
    return a;
  } }, ps;
}
var hs, wl;
function Lu() {
  if (wl) return hs;
  wl = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Ot, { existsSync: r, readFileSync: n } = Ot, { dirname: i, join: s } = Ot;
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
  return hs = c, c.default = c, hs;
}
var fs, xl;
function Si() {
  if (xl) return fs;
  xl = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Ot, { fileURLToPath: r, pathToFileURL: n } = Ot, { isAbsolute: i, resolve: s } = Ot, { nanoid: a } = /* @__PURE__ */ fy(), c = Ot, l = Lo(), d = Lu(), o = Symbol("fromOffsetCache"), h = !!(e && t), p = !!(s && i);
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
      let b, C, w;
      if (g && typeof g == "object") {
        let M = g, O = x;
        if (typeof M.offset == "number") {
          let P = this.fromOffset(M.offset);
          g = P.line, x = P.col;
        } else
          g = M.line, x = M.column;
        if (typeof O.offset == "number") {
          let P = this.fromOffset(O.offset);
          C = P.line, w = P.col;
        } else
          C = O.line, w = O.column;
      } else if (!x) {
        let M = this.fromOffset(g);
        g = M.line, x = M.col;
      }
      let k = this.origin(g, x, C, w);
      return k ? b = new l(
        f,
        k.endLine === void 0 ? k.line : { column: k.column, line: k.line },
        k.endLine === void 0 ? k.column : { column: k.endColumn, line: k.endLine },
        k.source,
        k.file,
        v.plugin
      ) : b = new l(
        f,
        C === void 0 ? g : { column: x, line: g },
        C === void 0 ? x : { column: w, line: C },
        this.css,
        this.file,
        v.plugin
      ), b.input = { column: x, endColumn: w, endLine: C, line: g, source: this.css }, this.file && (n && (b.input.url = n(this.file).toString()), b.input.file = this.file), b;
    }
    fromOffset(f) {
      let g, x;
      if (this[o])
        x = this[o];
      else {
        let b = this.css.split(`
`);
        x = new Array(b.length);
        let C = 0;
        for (let w = 0, k = b.length; w < k; w++)
          x[w] = C, C += b[w].length + 1;
        this[o] = x;
      }
      g = x[x.length - 1];
      let v = 0;
      if (f >= g)
        v = x.length - 1;
      else {
        let b = x.length - 2, C;
        for (; v < b; )
          if (C = v + (b - v >> 1), f < x[C])
            b = C - 1;
          else if (f >= x[C + 1])
            v = C + 1;
          else {
            v = C;
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
      let b = this.map.consumer(), C = b.originalPositionFor({ column: g, line: f });
      if (!C.source) return !1;
      let w;
      typeof x == "number" && (w = b.originalPositionFor({ column: v, line: x }));
      let k;
      i(C.source) ? k = n(C.source) : k = new URL(
        C.source,
        this.map.consumer().sourceRoot || n(this.map.mapFile)
      );
      let M = {
        column: C.column,
        endColumn: w && w.column,
        endLine: w && w.line,
        line: C.line,
        url: k.toString()
      };
      if (k.protocol === "file:")
        if (r)
          M.file = r(k);
        else
          throw new Error("file: protocol is not available in this PostCSS build");
      let O = b.sourceContentFor(C.source);
      return O && (M.source = O), M;
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
  return fs = u, u.default = u, c && c.registerInput && c.registerInput(u), fs;
}
var ms, Sl;
function Ou() {
  if (Sl) return ms;
  Sl = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Ot, { dirname: r, relative: n, resolve: i, sep: s } = Ot, { pathToFileURL: a } = Ot, c = Si(), l = !!(e && t), d = !!(r && i && n && s);
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
      this.stringify(this.root, (v, b, C) => {
        if (this.css += v, b && C !== "end" && (f.generated.line = p, f.generated.column = u - 1, b.source && b.source.start ? (f.source = this.sourcePath(b), f.original.line = b.source.start.line, f.original.column = b.source.start.column - 1, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, this.map.addMapping(f))), g = v.match(/\n/g), g ? (p += g.length, x = v.lastIndexOf(`
`), u = v.length - x) : u += v.length, b && C !== "start") {
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
  return ms = o, ms;
}
var gs, El;
function Ei() {
  if (El) return gs;
  El = 1;
  let e = wi();
  class t extends e {
    constructor(n) {
      super(n), this.type = "comment";
    }
  }
  return gs = t, t.default = t, gs;
}
var ys, Cl;
function xr() {
  if (Cl) return ys;
  Cl = 1;
  let { isClean: e, my: t } = Oo(), r = xi(), n = Ei(), i = wi(), s, a, c, l;
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
  }, ys = h, h.default = h, h.rebuild = (p) => {
    p.type === "atrule" ? Object.setPrototypeOf(p, c.prototype) : p.type === "rule" ? Object.setPrototypeOf(p, a.prototype) : p.type === "decl" ? Object.setPrototypeOf(p, r.prototype) : p.type === "comment" ? Object.setPrototypeOf(p, n.prototype) : p.type === "root" && Object.setPrototypeOf(p, l.prototype), p[t] = !0, p.nodes && p.nodes.forEach((u) => {
      h.rebuild(u);
    });
  }, ys;
}
var bs, Ml;
function No() {
  if (Ml) return bs;
  Ml = 1;
  let e = xr(), t, r;
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
  }, bs = n, n.default = n, bs;
}
var vs, Tl;
function Nu() {
  if (Tl) return vs;
  Tl = 1;
  let e = {};
  return vs = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, vs;
}
var ks, Rl;
function Pu() {
  if (Rl) return ks;
  Rl = 1;
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
  return ks = e, e.default = e, ks;
}
var ws, Al;
function Po() {
  if (Al) return ws;
  Al = 1;
  let e = Pu();
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
  return ws = t, t.default = t, ws;
}
var xs, _l;
function my() {
  if (_l) return xs;
  _l = 1;
  const e = 39, t = 34, r = 92, n = 47, i = 10, s = 32, a = 12, c = 9, l = 13, d = 91, o = 93, h = 40, p = 41, u = 123, m = 125, f = 59, g = 42, x = 58, v = 64, b = /[\t\n\f\r "#'()/;[\\\]{}]/g, C = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, w = /.[\r\n"'(/\\]/, k = /[\da-f]/i;
  return xs = function(O, P = {}) {
    let L = O.css.valueOf(), G = P.ignoreErrors, j, _, ke, Ae, he, ae, Te, _e, ve, me, ne = L.length, z = 0, fe = [], de = [];
    function pe() {
      return z;
    }
    function ie(te) {
      throw O.error("Unclosed " + te, z);
    }
    function le() {
      return de.length === 0 && z >= ne;
    }
    function Ye(te) {
      if (de.length) return de.pop();
      if (z >= ne) return;
      let Ne = te ? te.ignoreUnclosed : !1;
      switch (j = L.charCodeAt(z), j) {
        case i:
        case s:
        case c:
        case l:
        case a: {
          _ = z;
          do
            _ += 1, j = L.charCodeAt(_);
          while (j === s || j === i || j === c || j === l || j === a);
          me = ["space", L.slice(z, _)], z = _ - 1;
          break;
        }
        case d:
        case o:
        case u:
        case m:
        case x:
        case f:
        case p: {
          let ue = String.fromCharCode(j);
          me = [ue, ue, z];
          break;
        }
        case h: {
          if (_e = fe.length ? fe.pop()[1] : "", ve = L.charCodeAt(z + 1), _e === "url" && ve !== e && ve !== t && ve !== s && ve !== i && ve !== c && ve !== a && ve !== l) {
            _ = z;
            do {
              if (ae = !1, _ = L.indexOf(")", _ + 1), _ === -1)
                if (G || Ne) {
                  _ = z;
                  break;
                } else
                  ie("bracket");
              for (Te = _; L.charCodeAt(Te - 1) === r; )
                Te -= 1, ae = !ae;
            } while (ae);
            me = ["brackets", L.slice(z, _ + 1), z, _], z = _;
          } else
            _ = L.indexOf(")", z + 1), Ae = L.slice(z, _ + 1), _ === -1 || w.test(Ae) ? me = ["(", "(", z] : (me = ["brackets", Ae, z, _], z = _);
          break;
        }
        case e:
        case t: {
          ke = j === e ? "'" : '"', _ = z;
          do {
            if (ae = !1, _ = L.indexOf(ke, _ + 1), _ === -1)
              if (G || Ne) {
                _ = z + 1;
                break;
              } else
                ie("string");
            for (Te = _; L.charCodeAt(Te - 1) === r; )
              Te -= 1, ae = !ae;
          } while (ae);
          me = ["string", L.slice(z, _ + 1), z, _], z = _;
          break;
        }
        case v: {
          b.lastIndex = z + 1, b.test(L), b.lastIndex === 0 ? _ = L.length - 1 : _ = b.lastIndex - 2, me = ["at-word", L.slice(z, _ + 1), z, _], z = _;
          break;
        }
        case r: {
          for (_ = z, he = !0; L.charCodeAt(_ + 1) === r; )
            _ += 1, he = !he;
          if (j = L.charCodeAt(_ + 1), he && j !== n && j !== s && j !== i && j !== c && j !== l && j !== a && (_ += 1, k.test(L.charAt(_)))) {
            for (; k.test(L.charAt(_ + 1)); )
              _ += 1;
            L.charCodeAt(_ + 1) === s && (_ += 1);
          }
          me = ["word", L.slice(z, _ + 1), z, _], z = _;
          break;
        }
        default: {
          j === n && L.charCodeAt(z + 1) === g ? (_ = L.indexOf("*/", z + 2) + 1, _ === 0 && (G || Ne ? _ = L.length : ie("comment")), me = ["comment", L.slice(z, _ + 1), z, _], z = _) : (C.lastIndex = z + 1, C.test(L), C.lastIndex === 0 ? _ = L.length - 1 : _ = C.lastIndex - 2, me = ["word", L.slice(z, _ + 1), z, _], fe.push(me), z = _);
          break;
        }
      }
      return z++, me;
    }
    function tt(te) {
      de.push(te);
    }
    return {
      back: tt,
      endOfFile: le,
      nextToken: Ye,
      position: pe
    };
  }, xs;
}
var Ss, Il;
function zo() {
  if (Il) return Ss;
  Il = 1;
  let e = xr();
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
  return Ss = t, t.default = t, e.registerAtRule(t), Ss;
}
var Es, Ll;
function wn() {
  if (Ll) return Es;
  Ll = 1;
  let e = xr(), t, r;
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
  }, Es = n, n.default = n, e.registerRoot(n), Es;
}
var Cs, Ol;
function zu() {
  if (Ol) return Cs;
  Ol = 1;
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
  return Cs = e, e.default = e, Cs;
}
var Ms, Nl;
function Do() {
  if (Nl) return Ms;
  Nl = 1;
  let e = xr(), t = zu();
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
  return Ms = r, r.default = r, e.registerRule(r), Ms;
}
var Ts, Pl;
function gy() {
  if (Pl) return Ts;
  Pl = 1;
  let e = xi(), t = my(), r = Ei(), n = zo(), i = wn(), s = Do();
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
          let b = o.slice(0), C = "";
          for (let w = v; w > 0; w--) {
            let k = b[w][0];
            if (C.trim().indexOf("!") === 0 && k !== "space")
              break;
            C = b.pop()[1] + C;
          }
          C.trim().indexOf("!") === 0 && (p.important = !0, p.raws.important = C, o = b);
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
      let m, f, g = p.length, x = "", v = !0, b, C;
      for (let w = 0; w < g; w += 1)
        m = p[w], f = m[0], f === "space" && w === g - 1 && !u ? v = !1 : f === "comment" ? (C = p[w - 1] ? p[w - 1][0] : "empty", b = p[w + 1] ? p[w + 1][0] : "empty", !a[C] && !a[b] ? x.slice(-1) === "," ? v = !1 : x += m[1] : v = !1) : x += m[1];
      if (!v) {
        let w = p.reduce((k, M) => k + M[1], "");
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
  return Ts = l, Ts;
}
var Rs, zl;
function $o() {
  if (zl) return Rs;
  zl = 1;
  let e = xr(), t = gy(), r = Si();
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
  return Rs = n, n.default = n, e.registerParse(n), Rs;
}
var As, Dl;
function Du() {
  if (Dl) return As;
  Dl = 1;
  let { isClean: e, my: t } = Oo(), r = Ou(), n = ki(), i = xr(), s = No(), a = Nu(), c = Po(), l = $o(), d = wn();
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
  function m(C) {
    return typeof C == "object" && typeof C.then == "function";
  }
  function f(C) {
    let w = !1, k = o[C.type];
    return C.type === "decl" ? w = C.prop.toLowerCase() : C.type === "atrule" && (w = C.name.toLowerCase()), w && C.append ? [
      k,
      k + "-" + w,
      u,
      k + "Exit",
      k + "Exit-" + w
    ] : w ? [k, k + "-" + w, k + "Exit", k + "Exit-" + w] : C.append ? [k, u, k + "Exit"] : [k, k + "Exit"];
  }
  function g(C) {
    let w;
    return C.type === "document" ? w = ["Document", u, "DocumentExit"] : C.type === "root" ? w = ["Root", u, "RootExit"] : w = f(C), {
      eventIndex: 0,
      events: w,
      iterator: 0,
      node: C,
      visitorIndex: 0,
      visitors: []
    };
  }
  function x(C) {
    return C[e] = !1, C.nodes && C.nodes.forEach((w) => x(w)), C;
  }
  let v = {};
  class b {
    constructor(w, k, M) {
      this.stringified = !1, this.processed = !1;
      let O;
      if (typeof k == "object" && k !== null && (k.type === "root" || k.type === "document"))
        O = x(k);
      else if (k instanceof b || k instanceof c)
        O = x(k.root), k.map && (typeof M.map > "u" && (M.map = {}), M.map.inline || (M.map.inline = !1), M.map.prev = k.map);
      else {
        let P = l;
        M.syntax && (P = M.syntax.parse), M.parser && (P = M.parser), P.parse && (P = P.parse);
        try {
          O = P(k, M);
        } catch (L) {
          this.processed = !0, this.error = L;
        }
        O && !O[t] && i.rebuild(O);
      }
      this.result = new c(w, O, M), this.helpers = { ...v, postcss: v, result: this.result }, this.plugins = this.processor.plugins.map((P) => typeof P == "object" && P.prepare ? { ...P, ...P.prepare(this.result) } : P);
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
      let M = this.result.lastPlugin;
      try {
        if (k && k.addToError(w), this.error = w, w.name === "CssSyntaxError" && !w.plugin)
          w.plugin = M.postcssPlugin, w.setMessage();
        else if (M.postcssVersion && process.env.NODE_ENV !== "production") {
          let O = M.postcssPlugin, P = M.postcssVersion, L = this.result.processor.version, G = P.split("."), j = L.split(".");
          (G[0] !== j[0] || parseInt(G[1]) > parseInt(j[1])) && console.error(
            "Unknown error from PostCSS plugin. Your current PostCSS version is " + L + ", but " + O + " uses " + P + ". Perhaps this is the source of the error below."
          );
        }
      } catch (O) {
        console && console.error && console.error(O);
      }
      return w;
    }
    prepareVisitors() {
      this.listeners = {};
      let w = (k, M, O) => {
        this.listeners[M] || (this.listeners[M] = []), this.listeners[M].push([k, O]);
      };
      for (let k of this.plugins)
        if (typeof k == "object")
          for (let M in k) {
            if (!h[M] && /^[A-Z]/.test(M))
              throw new Error(
                `Unknown event ${M} in ${k.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`
              );
            if (!p[M])
              if (typeof k[M] == "object")
                for (let O in k[M])
                  O === "*" ? w(k, M, k[M][O]) : w(
                    k,
                    M + "-" + O.toLowerCase(),
                    k[M][O]
                  );
              else typeof k[M] == "function" && w(k, M, k[M]);
          }
      this.hasListener = Object.keys(this.listeners).length > 0;
    }
    async runAsync() {
      this.plugin = 0;
      for (let w = 0; w < this.plugins.length; w++) {
        let k = this.plugins[w], M = this.runOnRoot(k);
        if (m(M))
          try {
            await M;
          } catch (O) {
            throw this.handleError(O);
          }
      }
      if (this.prepareVisitors(), this.hasListener) {
        let w = this.result.root;
        for (; !w[e]; ) {
          w[e] = !0;
          let k = [g(w)];
          for (; k.length > 0; ) {
            let M = this.visitTick(k);
            if (m(M))
              try {
                await M;
              } catch (O) {
                let P = k[k.length - 1].node;
                throw this.handleError(O, P);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [k, M] of this.listeners.OnceExit) {
            this.result.lastPlugin = k;
            try {
              if (w.type === "document") {
                let O = w.nodes.map(
                  (P) => M(P, this.helpers)
                );
                await Promise.all(O);
              } else
                await M(w, this.helpers);
            } catch (O) {
              throw this.handleError(O);
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
              (M) => w.Once(M, this.helpers)
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
      let O = new r(k, this.result.root, this.result.opts).generate();
      return this.result.css = O[0], this.result.map = O[1], this.result;
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
      for (let [M, O] of w) {
        this.result.lastPlugin = M;
        let P;
        try {
          P = O(k, this.helpers);
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
      let k = w[w.length - 1], { node: M, visitors: O } = k;
      if (M.type !== "root" && M.type !== "document" && !M.parent) {
        w.pop();
        return;
      }
      if (O.length > 0 && k.visitorIndex < O.length) {
        let [L, G] = O[k.visitorIndex];
        k.visitorIndex += 1, k.visitorIndex === O.length && (k.visitors = [], k.visitorIndex = 0), this.result.lastPlugin = L;
        try {
          return G(M.toProxy(), this.helpers);
        } catch (j) {
          throw this.handleError(j, M);
        }
      }
      if (k.iterator !== 0) {
        let L = k.iterator, G;
        for (; G = M.nodes[M.indexes[L]]; )
          if (M.indexes[L] += 1, !G[e]) {
            G[e] = !0, w.push(g(G));
            return;
          }
        k.iterator = 0, delete M.indexes[L];
      }
      let P = k.events;
      for (; k.eventIndex < P.length; ) {
        let L = P[k.eventIndex];
        if (k.eventIndex += 1, L === u) {
          M.nodes && M.nodes.length && (M[e] = !0, k.iterator = M.getIterator());
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
      for (let M of k)
        if (M === u)
          w.nodes && w.each((O) => {
            O[e] || this.walkSync(O);
          });
        else {
          let O = this.listeners[M];
          if (O && this.visitSync(O, w.toProxy()))
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
  return b.registerPostcss = (C) => {
    v = C;
  }, As = b, b.default = b, d.registerLazyResult(b), s.registerLazyResult(b), As;
}
var _s, $l;
function yy() {
  if ($l) return _s;
  $l = 1;
  let e = Ou(), t = ki(), r = Nu(), n = $o();
  const i = Po();
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
  return _s = s, s.default = s, _s;
}
var Is, Fl;
function by() {
  if (Fl) return Is;
  Fl = 1;
  let e = yy(), t = Du(), r = No(), n = wn();
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
  return Is = i, i.default = i, n.registerProcessor(i), r.registerProcessor(i), Is;
}
var Ls, Ul;
function vy() {
  if (Ul) return Ls;
  Ul = 1;
  let e = xi(), t = Lu(), r = Ei(), n = zo(), i = Si(), s = wn(), a = Do();
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
  return Ls = c, c.default = c, Ls;
}
var Os, Bl;
function ky() {
  if (Bl) return Os;
  Bl = 1;
  let e = Lo(), t = xi(), r = Du(), n = xr(), i = by(), s = ki(), a = vy(), c = No(), l = Pu(), d = Ei(), o = zo(), h = Po(), p = Si(), u = $o(), m = zu(), f = Do(), g = wn(), x = wi();
  function v(...b) {
    return b.length === 1 && Array.isArray(b[0]) && (b = b[0]), new i(b);
  }
  return v.plugin = function(C, w) {
    let k = !1;
    function M(...P) {
      console && console.warn && !k && (k = !0, console.warn(
        C + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`
      ), process.env.LANG && process.env.LANG.startsWith("cn") && console.warn(
        C + `: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`
      ));
      let L = w(...P);
      return L.postcssPlugin = C, L.postcssVersion = new i().version, L;
    }
    let O;
    return Object.defineProperty(M, "postcss", {
      get() {
        return O || (O = M()), O;
      }
    }), M.process = function(P, L, G) {
      return v([M(G)]).process(P, L);
    }, M;
  }, v.stringify = s, v.parse = u, v.fromJSON = a, v.list = m, v.comment = (b) => new d(b), v.atRule = (b) => new o(b), v.decl = (b) => new t(b), v.rule = (b) => new f(b), v.root = (b) => new g(b), v.document = (b) => new c(b), v.CssSyntaxError = e, v.Declaration = t, v.Container = n, v.Processor = i, v.Document = c, v.Comment = d, v.Warning = l, v.AtRule = o, v.Result = h, v.Input = p, v.Rule = f, v.Root = g, v.Node = x, r.registerPostcss(v), Os = v, v.default = v, Os;
}
var wy = ky();
const Ue = /* @__PURE__ */ cy(wy);
Ue.stringify;
Ue.fromJSON;
Ue.plugin;
Ue.parse;
Ue.list;
Ue.document;
Ue.comment;
Ue.atRule;
Ue.rule;
Ue.decl;
Ue.root;
Ue.CssSyntaxError;
Ue.Declaration;
Ue.Container;
Ue.Processor;
Ue.Document;
Ue.Comment;
Ue.Warning;
Ue.AtRule;
Ue.Result;
Ue.Input;
Ue.Rule;
Ue.Root;
Ue.Node;
var xy = Object.defineProperty, Sy = (e, t, r) => t in e ? xy(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, kt = (e, t, r) => Sy(e, typeof t != "symbol" ? t + "" : t, r);
Date.now().toString();
function Ey(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function Cy(e) {
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
var Vn = { exports: {} }, ql;
function My() {
  if (ql) return Vn.exports;
  ql = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return Vn.exports = t(), Vn.exports.createColors = t, Vn.exports;
}
const Ty = {}, Ry = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Ty
}, Symbol.toStringTag, { value: "Module" })), Nt = /* @__PURE__ */ Cy(Ry);
var Ns, Wl;
function Fo() {
  if (Wl) return Ns;
  Wl = 1;
  let e = /* @__PURE__ */ My(), t = Nt;
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
  return Ns = r, r.default = r, Ns;
}
var Yn = {}, Hl;
function Uo() {
  return Hl || (Hl = 1, Yn.isClean = Symbol("isClean"), Yn.my = Symbol("my")), Yn;
}
var Ps, jl;
function $u() {
  if (jl) return Ps;
  jl = 1;
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
  return Ps = r, r.default = r, Ps;
}
var zs, Vl;
function Ci() {
  if (Vl) return zs;
  Vl = 1;
  let e = $u();
  function t(r, n) {
    new e(n).stringify(r);
  }
  return zs = t, t.default = t, zs;
}
var Ds, Yl;
function Mi() {
  if (Yl) return Ds;
  Yl = 1;
  let { isClean: e, my: t } = Uo(), r = Fo(), n = $u(), i = Ci();
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
  return Ds = a, a.default = a, Ds;
}
var $s, Gl;
function Ti() {
  if (Gl) return $s;
  Gl = 1;
  let e = Mi();
  class t extends e {
    constructor(n) {
      n && typeof n.value < "u" && typeof n.value != "string" && (n = { ...n, value: String(n.value) }), super(n), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return $s = t, t.default = t, $s;
}
var Fs, Xl;
function Ay() {
  if (Xl) return Fs;
  Xl = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return Fs = { nanoid: (n = 21) => {
    let i = "", s = n;
    for (; s--; )
      i += e[Math.random() * 64 | 0];
    return i;
  }, customAlphabet: (n, i = 21) => (s = i) => {
    let a = "", c = s;
    for (; c--; )
      a += n[Math.random() * n.length | 0];
    return a;
  } }, Fs;
}
var Us, Kl;
function Fu() {
  if (Kl) return Us;
  Kl = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Nt, { existsSync: r, readFileSync: n } = Nt, { dirname: i, join: s } = Nt;
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
  return Us = c, c.default = c, Us;
}
var Bs, Jl;
function Ri() {
  if (Jl) return Bs;
  Jl = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Nt, { fileURLToPath: r, pathToFileURL: n } = Nt, { isAbsolute: i, resolve: s } = Nt, { nanoid: a } = /* @__PURE__ */ Ay(), c = Nt, l = Fo(), d = Fu(), o = Symbol("fromOffsetCache"), h = !!(e && t), p = !!(s && i);
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
      let b, C, w;
      if (g && typeof g == "object") {
        let M = g, O = x;
        if (typeof M.offset == "number") {
          let P = this.fromOffset(M.offset);
          g = P.line, x = P.col;
        } else
          g = M.line, x = M.column;
        if (typeof O.offset == "number") {
          let P = this.fromOffset(O.offset);
          C = P.line, w = P.col;
        } else
          C = O.line, w = O.column;
      } else if (!x) {
        let M = this.fromOffset(g);
        g = M.line, x = M.col;
      }
      let k = this.origin(g, x, C, w);
      return k ? b = new l(
        f,
        k.endLine === void 0 ? k.line : { column: k.column, line: k.line },
        k.endLine === void 0 ? k.column : { column: k.endColumn, line: k.endLine },
        k.source,
        k.file,
        v.plugin
      ) : b = new l(
        f,
        C === void 0 ? g : { column: x, line: g },
        C === void 0 ? x : { column: w, line: C },
        this.css,
        this.file,
        v.plugin
      ), b.input = { column: x, endColumn: w, endLine: C, line: g, source: this.css }, this.file && (n && (b.input.url = n(this.file).toString()), b.input.file = this.file), b;
    }
    fromOffset(f) {
      let g, x;
      if (this[o])
        x = this[o];
      else {
        let b = this.css.split(`
`);
        x = new Array(b.length);
        let C = 0;
        for (let w = 0, k = b.length; w < k; w++)
          x[w] = C, C += b[w].length + 1;
        this[o] = x;
      }
      g = x[x.length - 1];
      let v = 0;
      if (f >= g)
        v = x.length - 1;
      else {
        let b = x.length - 2, C;
        for (; v < b; )
          if (C = v + (b - v >> 1), f < x[C])
            b = C - 1;
          else if (f >= x[C + 1])
            v = C + 1;
          else {
            v = C;
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
      let b = this.map.consumer(), C = b.originalPositionFor({ column: g, line: f });
      if (!C.source) return !1;
      let w;
      typeof x == "number" && (w = b.originalPositionFor({ column: v, line: x }));
      let k;
      i(C.source) ? k = n(C.source) : k = new URL(
        C.source,
        this.map.consumer().sourceRoot || n(this.map.mapFile)
      );
      let M = {
        column: C.column,
        endColumn: w && w.column,
        endLine: w && w.line,
        line: C.line,
        url: k.toString()
      };
      if (k.protocol === "file:")
        if (r)
          M.file = r(k);
        else
          throw new Error("file: protocol is not available in this PostCSS build");
      let O = b.sourceContentFor(C.source);
      return O && (M.source = O), M;
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
  return Bs = u, u.default = u, c && c.registerInput && c.registerInput(u), Bs;
}
var qs, Zl;
function Uu() {
  if (Zl) return qs;
  Zl = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Nt, { dirname: r, relative: n, resolve: i, sep: s } = Nt, { pathToFileURL: a } = Nt, c = Ri(), l = !!(e && t), d = !!(r && i && n && s);
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
      this.stringify(this.root, (v, b, C) => {
        if (this.css += v, b && C !== "end" && (f.generated.line = p, f.generated.column = u - 1, b.source && b.source.start ? (f.source = this.sourcePath(b), f.original.line = b.source.start.line, f.original.column = b.source.start.column - 1, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, this.map.addMapping(f))), g = v.match(/\n/g), g ? (p += g.length, x = v.lastIndexOf(`
`), u = v.length - x) : u += v.length, b && C !== "start") {
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
  return qs = o, qs;
}
var Ws, Ql;
function Ai() {
  if (Ql) return Ws;
  Ql = 1;
  let e = Mi();
  class t extends e {
    constructor(n) {
      super(n), this.type = "comment";
    }
  }
  return Ws = t, t.default = t, Ws;
}
var Hs, ec;
function Sr() {
  if (ec) return Hs;
  ec = 1;
  let { isClean: e, my: t } = Uo(), r = Ti(), n = Ai(), i = Mi(), s, a, c, l;
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
  }, Hs = h, h.default = h, h.rebuild = (p) => {
    p.type === "atrule" ? Object.setPrototypeOf(p, c.prototype) : p.type === "rule" ? Object.setPrototypeOf(p, a.prototype) : p.type === "decl" ? Object.setPrototypeOf(p, r.prototype) : p.type === "comment" ? Object.setPrototypeOf(p, n.prototype) : p.type === "root" && Object.setPrototypeOf(p, l.prototype), p[t] = !0, p.nodes && p.nodes.forEach((u) => {
      h.rebuild(u);
    });
  }, Hs;
}
var js, tc;
function Bo() {
  if (tc) return js;
  tc = 1;
  let e = Sr(), t, r;
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
  }, js = n, n.default = n, js;
}
var Vs, rc;
function Bu() {
  if (rc) return Vs;
  rc = 1;
  let e = {};
  return Vs = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, Vs;
}
var Ys, nc;
function qu() {
  if (nc) return Ys;
  nc = 1;
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
  return Ys = e, e.default = e, Ys;
}
var Gs, ic;
function qo() {
  if (ic) return Gs;
  ic = 1;
  let e = qu();
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
  return Gs = t, t.default = t, Gs;
}
var Xs, sc;
function _y() {
  if (sc) return Xs;
  sc = 1;
  const e = 39, t = 34, r = 92, n = 47, i = 10, s = 32, a = 12, c = 9, l = 13, d = 91, o = 93, h = 40, p = 41, u = 123, m = 125, f = 59, g = 42, x = 58, v = 64, b = /[\t\n\f\r "#'()/;[\\\]{}]/g, C = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, w = /.[\r\n"'(/\\]/, k = /[\da-f]/i;
  return Xs = function(O, P = {}) {
    let L = O.css.valueOf(), G = P.ignoreErrors, j, _, ke, Ae, he, ae, Te, _e, ve, me, ne = L.length, z = 0, fe = [], de = [];
    function pe() {
      return z;
    }
    function ie(te) {
      throw O.error("Unclosed " + te, z);
    }
    function le() {
      return de.length === 0 && z >= ne;
    }
    function Ye(te) {
      if (de.length) return de.pop();
      if (z >= ne) return;
      let Ne = te ? te.ignoreUnclosed : !1;
      switch (j = L.charCodeAt(z), j) {
        case i:
        case s:
        case c:
        case l:
        case a: {
          _ = z;
          do
            _ += 1, j = L.charCodeAt(_);
          while (j === s || j === i || j === c || j === l || j === a);
          me = ["space", L.slice(z, _)], z = _ - 1;
          break;
        }
        case d:
        case o:
        case u:
        case m:
        case x:
        case f:
        case p: {
          let ue = String.fromCharCode(j);
          me = [ue, ue, z];
          break;
        }
        case h: {
          if (_e = fe.length ? fe.pop()[1] : "", ve = L.charCodeAt(z + 1), _e === "url" && ve !== e && ve !== t && ve !== s && ve !== i && ve !== c && ve !== a && ve !== l) {
            _ = z;
            do {
              if (ae = !1, _ = L.indexOf(")", _ + 1), _ === -1)
                if (G || Ne) {
                  _ = z;
                  break;
                } else
                  ie("bracket");
              for (Te = _; L.charCodeAt(Te - 1) === r; )
                Te -= 1, ae = !ae;
            } while (ae);
            me = ["brackets", L.slice(z, _ + 1), z, _], z = _;
          } else
            _ = L.indexOf(")", z + 1), Ae = L.slice(z, _ + 1), _ === -1 || w.test(Ae) ? me = ["(", "(", z] : (me = ["brackets", Ae, z, _], z = _);
          break;
        }
        case e:
        case t: {
          ke = j === e ? "'" : '"', _ = z;
          do {
            if (ae = !1, _ = L.indexOf(ke, _ + 1), _ === -1)
              if (G || Ne) {
                _ = z + 1;
                break;
              } else
                ie("string");
            for (Te = _; L.charCodeAt(Te - 1) === r; )
              Te -= 1, ae = !ae;
          } while (ae);
          me = ["string", L.slice(z, _ + 1), z, _], z = _;
          break;
        }
        case v: {
          b.lastIndex = z + 1, b.test(L), b.lastIndex === 0 ? _ = L.length - 1 : _ = b.lastIndex - 2, me = ["at-word", L.slice(z, _ + 1), z, _], z = _;
          break;
        }
        case r: {
          for (_ = z, he = !0; L.charCodeAt(_ + 1) === r; )
            _ += 1, he = !he;
          if (j = L.charCodeAt(_ + 1), he && j !== n && j !== s && j !== i && j !== c && j !== l && j !== a && (_ += 1, k.test(L.charAt(_)))) {
            for (; k.test(L.charAt(_ + 1)); )
              _ += 1;
            L.charCodeAt(_ + 1) === s && (_ += 1);
          }
          me = ["word", L.slice(z, _ + 1), z, _], z = _;
          break;
        }
        default: {
          j === n && L.charCodeAt(z + 1) === g ? (_ = L.indexOf("*/", z + 2) + 1, _ === 0 && (G || Ne ? _ = L.length : ie("comment")), me = ["comment", L.slice(z, _ + 1), z, _], z = _) : (C.lastIndex = z + 1, C.test(L), C.lastIndex === 0 ? _ = L.length - 1 : _ = C.lastIndex - 2, me = ["word", L.slice(z, _ + 1), z, _], fe.push(me), z = _);
          break;
        }
      }
      return z++, me;
    }
    function tt(te) {
      de.push(te);
    }
    return {
      back: tt,
      endOfFile: le,
      nextToken: Ye,
      position: pe
    };
  }, Xs;
}
var Ks, oc;
function Wo() {
  if (oc) return Ks;
  oc = 1;
  let e = Sr();
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
  return Ks = t, t.default = t, e.registerAtRule(t), Ks;
}
var Js, ac;
function xn() {
  if (ac) return Js;
  ac = 1;
  let e = Sr(), t, r;
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
  }, Js = n, n.default = n, e.registerRoot(n), Js;
}
var Zs, lc;
function Wu() {
  if (lc) return Zs;
  lc = 1;
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
  return Zs = e, e.default = e, Zs;
}
var Qs, cc;
function Ho() {
  if (cc) return Qs;
  cc = 1;
  let e = Sr(), t = Wu();
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
  return Qs = r, r.default = r, e.registerRule(r), Qs;
}
var eo, uc;
function Iy() {
  if (uc) return eo;
  uc = 1;
  let e = Ti(), t = _y(), r = Ai(), n = Wo(), i = xn(), s = Ho();
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
          let b = o.slice(0), C = "";
          for (let w = v; w > 0; w--) {
            let k = b[w][0];
            if (C.trim().indexOf("!") === 0 && k !== "space")
              break;
            C = b.pop()[1] + C;
          }
          C.trim().indexOf("!") === 0 && (p.important = !0, p.raws.important = C, o = b);
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
      let m, f, g = p.length, x = "", v = !0, b, C;
      for (let w = 0; w < g; w += 1)
        m = p[w], f = m[0], f === "space" && w === g - 1 && !u ? v = !1 : f === "comment" ? (C = p[w - 1] ? p[w - 1][0] : "empty", b = p[w + 1] ? p[w + 1][0] : "empty", !a[C] && !a[b] ? x.slice(-1) === "," ? v = !1 : x += m[1] : v = !1) : x += m[1];
      if (!v) {
        let w = p.reduce((k, M) => k + M[1], "");
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
  return eo = l, eo;
}
var to, dc;
function jo() {
  if (dc) return to;
  dc = 1;
  let e = Sr(), t = Iy(), r = Ri();
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
  return to = n, n.default = n, e.registerParse(n), to;
}
var ro, pc;
function Hu() {
  if (pc) return ro;
  pc = 1;
  let { isClean: e, my: t } = Uo(), r = Uu(), n = Ci(), i = Sr(), s = Bo(), a = Bu(), c = qo(), l = jo(), d = xn();
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
  function m(C) {
    return typeof C == "object" && typeof C.then == "function";
  }
  function f(C) {
    let w = !1, k = o[C.type];
    return C.type === "decl" ? w = C.prop.toLowerCase() : C.type === "atrule" && (w = C.name.toLowerCase()), w && C.append ? [
      k,
      k + "-" + w,
      u,
      k + "Exit",
      k + "Exit-" + w
    ] : w ? [k, k + "-" + w, k + "Exit", k + "Exit-" + w] : C.append ? [k, u, k + "Exit"] : [k, k + "Exit"];
  }
  function g(C) {
    let w;
    return C.type === "document" ? w = ["Document", u, "DocumentExit"] : C.type === "root" ? w = ["Root", u, "RootExit"] : w = f(C), {
      eventIndex: 0,
      events: w,
      iterator: 0,
      node: C,
      visitorIndex: 0,
      visitors: []
    };
  }
  function x(C) {
    return C[e] = !1, C.nodes && C.nodes.forEach((w) => x(w)), C;
  }
  let v = {};
  class b {
    constructor(w, k, M) {
      this.stringified = !1, this.processed = !1;
      let O;
      if (typeof k == "object" && k !== null && (k.type === "root" || k.type === "document"))
        O = x(k);
      else if (k instanceof b || k instanceof c)
        O = x(k.root), k.map && (typeof M.map > "u" && (M.map = {}), M.map.inline || (M.map.inline = !1), M.map.prev = k.map);
      else {
        let P = l;
        M.syntax && (P = M.syntax.parse), M.parser && (P = M.parser), P.parse && (P = P.parse);
        try {
          O = P(k, M);
        } catch (L) {
          this.processed = !0, this.error = L;
        }
        O && !O[t] && i.rebuild(O);
      }
      this.result = new c(w, O, M), this.helpers = { ...v, postcss: v, result: this.result }, this.plugins = this.processor.plugins.map((P) => typeof P == "object" && P.prepare ? { ...P, ...P.prepare(this.result) } : P);
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
      let M = this.result.lastPlugin;
      try {
        if (k && k.addToError(w), this.error = w, w.name === "CssSyntaxError" && !w.plugin)
          w.plugin = M.postcssPlugin, w.setMessage();
        else if (M.postcssVersion && process.env.NODE_ENV !== "production") {
          let O = M.postcssPlugin, P = M.postcssVersion, L = this.result.processor.version, G = P.split("."), j = L.split(".");
          (G[0] !== j[0] || parseInt(G[1]) > parseInt(j[1])) && console.error(
            "Unknown error from PostCSS plugin. Your current PostCSS version is " + L + ", but " + O + " uses " + P + ". Perhaps this is the source of the error below."
          );
        }
      } catch (O) {
        console && console.error && console.error(O);
      }
      return w;
    }
    prepareVisitors() {
      this.listeners = {};
      let w = (k, M, O) => {
        this.listeners[M] || (this.listeners[M] = []), this.listeners[M].push([k, O]);
      };
      for (let k of this.plugins)
        if (typeof k == "object")
          for (let M in k) {
            if (!h[M] && /^[A-Z]/.test(M))
              throw new Error(
                `Unknown event ${M} in ${k.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`
              );
            if (!p[M])
              if (typeof k[M] == "object")
                for (let O in k[M])
                  O === "*" ? w(k, M, k[M][O]) : w(
                    k,
                    M + "-" + O.toLowerCase(),
                    k[M][O]
                  );
              else typeof k[M] == "function" && w(k, M, k[M]);
          }
      this.hasListener = Object.keys(this.listeners).length > 0;
    }
    async runAsync() {
      this.plugin = 0;
      for (let w = 0; w < this.plugins.length; w++) {
        let k = this.plugins[w], M = this.runOnRoot(k);
        if (m(M))
          try {
            await M;
          } catch (O) {
            throw this.handleError(O);
          }
      }
      if (this.prepareVisitors(), this.hasListener) {
        let w = this.result.root;
        for (; !w[e]; ) {
          w[e] = !0;
          let k = [g(w)];
          for (; k.length > 0; ) {
            let M = this.visitTick(k);
            if (m(M))
              try {
                await M;
              } catch (O) {
                let P = k[k.length - 1].node;
                throw this.handleError(O, P);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [k, M] of this.listeners.OnceExit) {
            this.result.lastPlugin = k;
            try {
              if (w.type === "document") {
                let O = w.nodes.map(
                  (P) => M(P, this.helpers)
                );
                await Promise.all(O);
              } else
                await M(w, this.helpers);
            } catch (O) {
              throw this.handleError(O);
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
              (M) => w.Once(M, this.helpers)
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
      let O = new r(k, this.result.root, this.result.opts).generate();
      return this.result.css = O[0], this.result.map = O[1], this.result;
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
      for (let [M, O] of w) {
        this.result.lastPlugin = M;
        let P;
        try {
          P = O(k, this.helpers);
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
      let k = w[w.length - 1], { node: M, visitors: O } = k;
      if (M.type !== "root" && M.type !== "document" && !M.parent) {
        w.pop();
        return;
      }
      if (O.length > 0 && k.visitorIndex < O.length) {
        let [L, G] = O[k.visitorIndex];
        k.visitorIndex += 1, k.visitorIndex === O.length && (k.visitors = [], k.visitorIndex = 0), this.result.lastPlugin = L;
        try {
          return G(M.toProxy(), this.helpers);
        } catch (j) {
          throw this.handleError(j, M);
        }
      }
      if (k.iterator !== 0) {
        let L = k.iterator, G;
        for (; G = M.nodes[M.indexes[L]]; )
          if (M.indexes[L] += 1, !G[e]) {
            G[e] = !0, w.push(g(G));
            return;
          }
        k.iterator = 0, delete M.indexes[L];
      }
      let P = k.events;
      for (; k.eventIndex < P.length; ) {
        let L = P[k.eventIndex];
        if (k.eventIndex += 1, L === u) {
          M.nodes && M.nodes.length && (M[e] = !0, k.iterator = M.getIterator());
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
      for (let M of k)
        if (M === u)
          w.nodes && w.each((O) => {
            O[e] || this.walkSync(O);
          });
        else {
          let O = this.listeners[M];
          if (O && this.visitSync(O, w.toProxy()))
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
  return b.registerPostcss = (C) => {
    v = C;
  }, ro = b, b.default = b, d.registerLazyResult(b), s.registerLazyResult(b), ro;
}
var no, hc;
function Ly() {
  if (hc) return no;
  hc = 1;
  let e = Uu(), t = Ci(), r = Bu(), n = jo();
  const i = qo();
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
  return no = s, s.default = s, no;
}
var io, fc;
function Oy() {
  if (fc) return io;
  fc = 1;
  let e = Ly(), t = Hu(), r = Bo(), n = xn();
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
  return io = i, i.default = i, n.registerProcessor(i), r.registerProcessor(i), io;
}
var so, mc;
function Ny() {
  if (mc) return so;
  mc = 1;
  let e = Ti(), t = Fu(), r = Ai(), n = Wo(), i = Ri(), s = xn(), a = Ho();
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
  return so = c, c.default = c, so;
}
var oo, gc;
function Py() {
  if (gc) return oo;
  gc = 1;
  let e = Fo(), t = Ti(), r = Hu(), n = Sr(), i = Oy(), s = Ci(), a = Ny(), c = Bo(), l = qu(), d = Ai(), o = Wo(), h = qo(), p = Ri(), u = jo(), m = Wu(), f = Ho(), g = xn(), x = Mi();
  function v(...b) {
    return b.length === 1 && Array.isArray(b[0]) && (b = b[0]), new i(b);
  }
  return v.plugin = function(C, w) {
    let k = !1;
    function M(...P) {
      console && console.warn && !k && (k = !0, console.warn(
        C + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`
      ), process.env.LANG && process.env.LANG.startsWith("cn") && console.warn(
        C + `: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`
      ));
      let L = w(...P);
      return L.postcssPlugin = C, L.postcssVersion = new i().version, L;
    }
    let O;
    return Object.defineProperty(M, "postcss", {
      get() {
        return O || (O = M()), O;
      }
    }), M.process = function(P, L, G) {
      return v([M(G)]).process(P, L);
    }, M;
  }, v.stringify = s, v.parse = u, v.fromJSON = a, v.list = m, v.comment = (b) => new d(b), v.atRule = (b) => new o(b), v.decl = (b) => new t(b), v.rule = (b) => new f(b), v.root = (b) => new g(b), v.document = (b) => new c(b), v.CssSyntaxError = e, v.Declaration = t, v.Container = n, v.Processor = i, v.Document = c, v.Comment = d, v.Warning = l, v.AtRule = o, v.Result = h, v.Input = p, v.Rule = f, v.Root = g, v.Node = x, r.registerPostcss(v), oo = v, v.default = v, oo;
}
var zy = Py();
const Be = /* @__PURE__ */ Ey(zy);
Be.stringify;
Be.fromJSON;
Be.plugin;
Be.parse;
Be.list;
Be.document;
Be.comment;
Be.atRule;
Be.rule;
Be.decl;
Be.root;
Be.CssSyntaxError;
Be.Declaration;
Be.Container;
Be.Processor;
Be.Document;
Be.Comment;
Be.Warning;
Be.AtRule;
Be.Result;
Be.Input;
Be.Rule;
Be.Root;
Be.Node;
class Vo {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  constructor(...t) {
    kt(this, "parentElement", null), kt(this, "parentNode", null), kt(this, "ownerDocument"), kt(this, "firstChild", null), kt(this, "lastChild", null), kt(this, "previousSibling", null), kt(this, "nextSibling", null), kt(this, "ELEMENT_NODE", 1), kt(this, "TEXT_NODE", 3), kt(this, "nodeType"), kt(this, "nodeName"), kt(this, "RRNodeType");
  }
  get childNodes() {
    const t = [];
    let r = this.firstChild;
    for (; r; )
      t.push(r), r = r.nextSibling;
    return t;
  }
  contains(t) {
    if (t instanceof Vo) {
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
}, Gn = {}, ju = {}, Dy = () => !!globalThis.Zone;
function Yo(e) {
  if (Gn[e])
    return Gn[e];
  const t = globalThis[e], r = t.prototype, n = e in yc ? yc[e] : void 0, i = !!(n && // @ts-expect-error 2345
  n.every(
    (c) => {
      var l, d;
      return !!((d = (l = Object.getOwnPropertyDescriptor(r, c)) == null ? void 0 : l.get) != null && d.toString().includes("[native code]"));
    }
  )), s = e in bc ? bc[e] : void 0, a = !!(s && s.every(
    // @ts-expect-error 2345
    (c) => {
      var l;
      return typeof r[c] == "function" && ((l = r[c]) == null ? void 0 : l.toString().includes("[native code]"));
    }
  ));
  if (i && a && !Dy())
    return Gn[e] = t.prototype, t.prototype;
  try {
    const c = document.createElement("iframe");
    c.style.display = "none", document.body.appendChild(c);
    const l = c.contentWindow;
    if (!l) return t.prototype;
    const d = l[e].prototype;
    if (!d)
      return c.remove(), r;
    const o = navigator.userAgent;
    return o.includes("Safari") && !o.includes("Chrome") ? (c.classList.add("rr-block"), c.setAttribute("__rrwebUntaintedMutationObserver", ""), ju[e] = () => c.remove()) : c.remove(), Gn[e] = d;
  } catch {
    return r;
  }
}
const ao = {};
function Yt(e, t, r) {
  var n;
  const i = `${e}.${String(r)}`;
  if (ao[i])
    return ao[i].call(
      t
    );
  const s = Yo(e), a = (n = Object.getOwnPropertyDescriptor(
    s,
    r
  )) == null ? void 0 : n.get;
  return a ? (ao[i] = a, a.call(t)) : t[r];
}
const lo = {};
function Vu(e, t, r) {
  const n = `${e}.${String(r)}`;
  if (lo[n])
    return lo[n].bind(
      t
    );
  const s = Yo(e)[r];
  return typeof s != "function" ? t[r] : (lo[n] = s, s.bind(t));
}
function $y(e) {
  return Yt("Node", e, "ownerDocument");
}
function Fy(e) {
  return Yt("Node", e, "childNodes");
}
function Uy(e) {
  return Yt("Node", e, "parentNode");
}
function By(e) {
  return Yt("Node", e, "parentElement");
}
function qy(e) {
  return Yt("Node", e, "textContent");
}
function Wy(e, t) {
  return Vu("Node", e, "contains")(t);
}
function Hy(e) {
  return Vu("Node", e, "getRootNode")();
}
function jy(e) {
  return !e || !("host" in e) ? null : Yt("ShadowRoot", e, "host");
}
function Vy(e) {
  return e.styleSheets;
}
function Yy(e) {
  return !e || !("shadowRoot" in e) ? null : Yt("Element", e, "shadowRoot");
}
function Gy(e, t) {
  return Yt("Element", e, "querySelector")(t);
}
function Xy(e, t) {
  return Yt("Element", e, "querySelectorAll")(t);
}
function Yu() {
  return [
    Yo("MutationObserver").constructor,
    ju.MutationObserver ?? (() => {
    })
  ];
}
let bn = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (bn = () => (/* @__PURE__ */ new Date()).getTime());
function Er(e, t, r) {
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
  ownerDocument: $y,
  childNodes: Fy,
  parentNode: Uy,
  parentElement: By,
  textContent: qy,
  contains: Wy,
  getRootNode: Hy,
  host: jy,
  styleSheets: Vy,
  shadowRoot: Yy,
  querySelector: Gy,
  querySelectorAll: Xy,
  nowTimestamp: bn,
  mutationObserverCtor: Yu,
  patch: Er
};
function dt(e, t, r = document) {
  const n = { capture: !0, passive: !0 };
  return r.addEventListener(e, t, n), () => r.removeEventListener(e, t, n);
}
const Pr = `Please stop import mirror directly. Instead of that,\r
now you can use replayer.getMirror() to access the mirror instance of a replayer,\r
or you can use record.mirror to access the mirror instance during recording.`;
let vc = {
  map: {},
  getId() {
    return console.error(Pr), -1;
  },
  getNode() {
    return console.error(Pr), null;
  },
  removeNodeFromMap() {
    console.error(Pr);
  },
  has() {
    return console.error(Pr), !1;
  },
  reset() {
    console.error(Pr);
  }
};
typeof window < "u" && window.Proxy && window.Reflect && (vc = new Proxy(vc, {
  get(e, t, r) {
    return t === "map" && console.error(Pr), Reflect.get(e, t, r);
  }
}));
function vn(e, t, r = {}) {
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
function _i(e, t, r, n, i = window) {
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
  ), () => _i(e, t, s || {}, !0);
}
function Gu(e) {
  var t, r, n, i;
  const s = e.document;
  return {
    left: s.scrollingElement ? s.scrollingElement.scrollLeft : e.pageXOffset !== void 0 ? e.pageXOffset : s.documentElement.scrollLeft || (s == null ? void 0 : s.body) && ((t = be.parentElement(s.body)) == null ? void 0 : t.scrollLeft) || ((r = s == null ? void 0 : s.body) == null ? void 0 : r.scrollLeft) || 0,
    top: s.scrollingElement ? s.scrollingElement.scrollTop : e.pageYOffset !== void 0 ? e.pageYOffset : (s == null ? void 0 : s.documentElement.scrollTop) || (s == null ? void 0 : s.body) && ((n = be.parentElement(s.body)) == null ? void 0 : n.scrollTop) || ((i = s == null ? void 0 : s.body) == null ? void 0 : i.scrollTop) || 0
  };
}
function Xu() {
  return window.innerHeight || document.documentElement && document.documentElement.clientHeight || document.body && document.body.clientHeight;
}
function Ku() {
  return window.innerWidth || document.documentElement && document.documentElement.clientWidth || document.body && document.body.clientWidth;
}
function Ju(e) {
  return e ? e.nodeType === e.ELEMENT_NODE ? e : be.parentElement(e) : null;
}
function pt(e, t, r, n) {
  if (!e)
    return !1;
  const i = Ju(e);
  if (!i)
    return !1;
  try {
    if (typeof t == "string") {
      if (i.classList.contains(t) || n && i.closest("." + t) !== null) return !0;
    } else if (ui(i, t, n)) return !0;
  } catch {
  }
  return !!(r && (i.matches(r) || n && i.closest(r) !== null));
}
function Ky(e, t) {
  return t.getId(e) !== -1;
}
function co(e, t, r) {
  return e.tagName === "TITLE" && r.headTitleMutations ? !0 : t.getId(e) === yn;
}
function Zu(e, t) {
  if (dn(e))
    return !1;
  const r = t.getId(e);
  if (!t.has(r))
    return !0;
  const n = be.parentNode(e);
  return n && n.nodeType === e.DOCUMENT_NODE ? !1 : n ? Zu(n, t) : !0;
}
function vo(e) {
  return !!e.changedTouches;
}
function Jy(e = window) {
  "NodeList" in e && !e.NodeList.prototype.forEach && (e.NodeList.prototype.forEach = Array.prototype.forEach), "DOMTokenList" in e && !e.DOMTokenList.prototype.forEach && (e.DOMTokenList.prototype.forEach = Array.prototype.forEach);
}
function Qu(e, t) {
  return !!(e.nodeName === "IFRAME" && t.getMeta(e));
}
function ed(e, t) {
  return !!(e.nodeName === "LINK" && e.nodeType === e.ELEMENT_NODE && e.getAttribute && e.getAttribute("rel") === "stylesheet" && t.getMeta(e));
}
function ko(e) {
  return e ? e instanceof Vo && "shadowRoot" in e ? !!e.shadowRoot : !!be.shadowRoot(e) : !1;
}
class Zy {
  constructor() {
    q(this, "id", 1), q(this, "styleIDMap", /* @__PURE__ */ new WeakMap()), q(this, "idStyleMap", /* @__PURE__ */ new Map());
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
function td(e) {
  var t;
  let r = null;
  return "getRootNode" in e && ((t = be.getRootNode(e)) == null ? void 0 : t.nodeType) === Node.DOCUMENT_FRAGMENT_NODE && be.host(be.getRootNode(e)) && (r = be.host(be.getRootNode(e))), r;
}
function Qy(e) {
  let t = e, r;
  for (; r = td(t); )
    t = r;
  return t;
}
function eb(e) {
  const t = be.ownerDocument(e);
  if (!t) return !1;
  const r = Qy(e);
  return be.contains(t, r);
}
function rd(e) {
  const t = be.ownerDocument(e);
  return t ? be.contains(t, e) || eb(e) : !1;
}
var Re = /* @__PURE__ */ ((e) => (e[e.DomContentLoaded = 0] = "DomContentLoaded", e[e.Load = 1] = "Load", e[e.FullSnapshot = 2] = "FullSnapshot", e[e.IncrementalSnapshot = 3] = "IncrementalSnapshot", e[e.Meta = 4] = "Meta", e[e.Custom = 5] = "Custom", e[e.Plugin = 6] = "Plugin", e[e.Asset = 7] = "Asset", e))(Re || {}), Ee = /* @__PURE__ */ ((e) => (e[e.Mutation = 0] = "Mutation", e[e.MouseMove = 1] = "MouseMove", e[e.MouseInteraction = 2] = "MouseInteraction", e[e.Scroll = 3] = "Scroll", e[e.ViewportResize = 4] = "ViewportResize", e[e.Input = 5] = "Input", e[e.TouchMove = 6] = "TouchMove", e[e.MediaInteraction = 7] = "MediaInteraction", e[e.StyleSheetRule = 8] = "StyleSheetRule", e[e.CanvasMutation = 9] = "CanvasMutation", e[e.Font = 10] = "Font", e[e.Log = 11] = "Log", e[e.Drag = 12] = "Drag", e[e.StyleDeclaration = 13] = "StyleDeclaration", e[e.Selection = 14] = "Selection", e[e.AdoptedStyleSheet = 15] = "AdoptedStyleSheet", e[e.CustomElement = 16] = "CustomElement", e))(Ee || {}), gt = /* @__PURE__ */ ((e) => (e[e.MouseUp = 0] = "MouseUp", e[e.MouseDown = 1] = "MouseDown", e[e.Click = 2] = "Click", e[e.ContextMenu = 3] = "ContextMenu", e[e.DblClick = 4] = "DblClick", e[e.Focus = 5] = "Focus", e[e.Blur = 6] = "Blur", e[e.TouchStart = 7] = "TouchStart", e[e.TouchMove_Departed = 8] = "TouchMove_Departed", e[e.TouchEnd = 9] = "TouchEnd", e[e.TouchCancel = 10] = "TouchCancel", e))(gt || {}), jt = /* @__PURE__ */ ((e) => (e[e.Mouse = 0] = "Mouse", e[e.Pen = 1] = "Pen", e[e.Touch = 2] = "Touch", e))(jt || {}), Gr = /* @__PURE__ */ ((e) => (e[e["2D"] = 0] = "2D", e[e.WebGL = 1] = "WebGL", e[e.WebGL2 = 2] = "WebGL2", e))(Gr || {}), zr = /* @__PURE__ */ ((e) => (e[e.Play = 0] = "Play", e[e.Pause = 1] = "Pause", e[e.Seeked = 2] = "Seeked", e[e.VolumeChange = 3] = "VolumeChange", e[e.RateChange = 4] = "RateChange", e))(zr || {}), nd = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(nd || {});
function kc(e) {
  return "__ln" in e;
}
class tb {
  constructor() {
    q(this, "length", 0), q(this, "head", null), q(this, "tail", null);
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
    if (t.__ln = r, t.previousSibling && kc(t.previousSibling)) {
      const n = t.previousSibling.__ln.next;
      r.next = n, r.previous = t.previousSibling.__ln, t.previousSibling.__ln.next = r, n && (n.previous = r);
    } else if (t.nextSibling && kc(t.nextSibling) && t.nextSibling.__ln.previous) {
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
const wc = (e, t) => `${e}@${t}`;
class rb {
  constructor() {
    q(this, "frozen", !1), q(this, "locked", !1), q(this, "texts", []), q(this, "attributes", []), q(this, "attributeMap", /* @__PURE__ */ new WeakMap()), q(this, "removes", []), q(this, "mapRemoves", []), q(this, "movedMap", {}), q(this, "addedSet", /* @__PURE__ */ new Set()), q(this, "movedSet", /* @__PURE__ */ new Set()), q(this, "droppedSet", /* @__PURE__ */ new Set()), q(this, "removesSubTreeCache", /* @__PURE__ */ new Set()), q(this, "mutationCb"), q(this, "blockClass"), q(this, "blockSelector"), q(this, "maskTextClass"), q(this, "maskTextSelector"), q(this, "inlineStylesheet"), q(this, "maskInputOptions"), q(this, "maskTextFn"), q(this, "maskInputFn"), q(this, "keepIframeSrcFn"), q(this, "recordCanvas"), q(this, "inlineImages"), q(this, "slimDOMOptions"), q(this, "dataURLOptions"), q(this, "doc"), q(this, "mirror"), q(this, "iframeManager"), q(this, "stylesheetManager"), q(this, "shadowDomManager"), q(this, "canvasManager"), q(this, "processedNodeManager"), q(this, "unattachedDoc"), q(this, "processMutations", (t) => {
      t.forEach(this.processMutation), this.emit();
    }), q(this, "emit", () => {
      if (this.frozen || this.locked)
        return;
      const t = [], r = /* @__PURE__ */ new Set(), n = new tb(), i = (l) => {
        let d = l, o = yn;
        for (; o === yn; )
          d = d && d.nextSibling, o = d && this.mirror.getId(d);
        return o;
      }, s = (l) => {
        const d = be.parentNode(l);
        if (!d || !rd(l))
          return;
        let o = !1;
        if (l.nodeType === Node.TEXT_NODE) {
          const m = d.tagName;
          if (m === "TEXTAREA")
            return;
          m === "STYLE" && this.addedSet.has(d) && (o = !0);
        }
        const h = dn(d) ? this.mirror.getId(td(l)) : this.mirror.getId(d), p = i(l);
        if (h === -1 || p === -1)
          return n.addNode(l);
        const u = $r(l, {
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
            Qu(m, this.mirror) && this.iframeManager.addIframe(m), ed(m, this.mirror) && this.stylesheetManager.trackLinkElement(
              m
            ), ko(l) && this.shadowDomManager.addShadowRoot(be.shadowRoot(l), this.doc);
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
        xc(this.removesSubTreeCache, l, this.mirror) && !this.movedSet.has(be.parentNode(l)) || s(l);
      for (const l of this.addedSet)
        !Sc(this.droppedSet, l) && !xc(this.removesSubTreeCache, l, this.mirror) || Sc(this.movedSet, l) ? s(l) : this.droppedSet.add(l);
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
                const u = o.value, m = be.parentNode(u);
                if (m && m.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                  const f = be.host(m);
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
    }), q(this, "genTextAreaValueMutation", (t) => {
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
      r.attributes.value = ai({
        element: t,
        maskInputOptions: this.maskInputOptions,
        tagName: t.tagName,
        type: li(t),
        value: n,
        maskInputFn: this.maskInputFn
      });
    }), q(this, "processMutation", (t) => {
      if (!co(t.target, this.mirror, this.slimDOMOptions))
        switch (t.type) {
          case "characterData": {
            const r = be.textContent(t.target);
            !pt(t.target, this.blockClass, this.blockSelector, !1) && r !== t.oldValue && this.texts.push({
              value: Au(
                t.target,
                this.maskTextClass,
                this.maskTextSelector,
                !0
                // checkAncestors
              ) && r ? this.maskTextFn ? this.maskTextFn(r, Ju(t.target)) : r.replace(/[\S]/g, "*") : r,
              node: t.target
            });
            break;
          }
          case "attributes": {
            const r = t.target;
            let n = t.attributeName, i = t.target.getAttribute(n);
            if (n === "value") {
              const a = li(r);
              i = ai({
                element: r,
                maskInputOptions: this.maskInputOptions,
                tagName: r.tagName,
                type: a,
                value: i,
                maskInputFn: this.maskInputFn
              });
            }
            if (pt(t.target, this.blockClass, this.blockSelector, !1) || i === t.oldValue)
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
            }, this.attributes.push(s), this.attributeMap.set(t.target, s)), n === "type" && r.tagName === "INPUT" && (t.oldValue || "").toLowerCase() === "password" && r.setAttribute("data-rr-is-password", "true"), !Ru(r.tagName, n))
              if (s.attributes[n] = Tu(
                this.doc,
                wr(r.tagName),
                wr(n),
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
            if (pt(t.target, this.blockClass, this.blockSelector, !0))
              return;
            if (t.target.tagName === "TEXTAREA") {
              this.genTextAreaValueMutation(t.target);
              return;
            }
            t.addedNodes.forEach((r) => this.genAdds(r, t.target)), t.removedNodes.forEach((r) => {
              const n = this.mirror.getId(r), i = dn(t.target) ? this.mirror.getId(be.host(t.target)) : this.mirror.getId(t.target);
              pt(t.target, this.blockClass, this.blockSelector, !1) || co(r, this.mirror, this.slimDOMOptions) || !Ky(r, this.mirror) || (this.addedSet.has(r) ? (wo(this.addedSet, r), this.droppedSet.add(r)) : this.addedSet.has(t.target) && n === -1 || Zu(t.target, this.mirror) || (this.movedSet.has(r) && this.movedMap[wc(n, i)] ? wo(this.movedSet, r) : (this.removes.push({
                parentId: i,
                id: n,
                isShadow: dn(t.target) && pn(t.target) ? !0 : void 0
              }), nb(r, this.removesSubTreeCache))), this.mapRemoves.push(r));
            });
            break;
          }
        }
    }), q(this, "genAdds", (t, r) => {
      if (!this.processedNodeManager.inOtherBuffer(t, this) && !(this.addedSet.has(t) || this.movedSet.has(t))) {
        if (this.mirror.hasNode(t)) {
          if (co(t, this.mirror, this.slimDOMOptions))
            return;
          this.movedSet.add(t);
          let n = null;
          r && this.mirror.hasNode(r) && (n = this.mirror.getId(r)), n && n !== -1 && (this.movedMap[wc(this.mirror.getId(t), n)] = !0);
        } else
          this.addedSet.add(t), this.droppedSet.delete(t);
        pt(t, this.blockClass, this.blockSelector, !1) || (be.childNodes(t).forEach((n) => this.genAdds(n)), ko(t) && be.childNodes(be.shadowRoot(t)).forEach((n) => {
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
function wo(e, t) {
  e.delete(t), be.childNodes(t).forEach((r) => wo(e, r));
}
function nb(e, t) {
  const r = [e];
  for (; r.length; ) {
    const n = r.pop();
    t.has(n) || (t.add(n), be.childNodes(n).forEach((i) => r.push(i)));
  }
}
function xc(e, t, r) {
  return e.size === 0 ? !1 : ib(e, t);
}
function ib(e, t, r) {
  const n = be.parentNode(t);
  return n ? e.has(n) : !1;
}
function Sc(e, t) {
  return e.size === 0 ? !1 : id(e, t);
}
function id(e, t) {
  const r = be.parentNode(t);
  return r ? e.has(r) ? !0 : id(e, r) : !1;
}
let hn;
function sb(e) {
  hn = e;
}
function ob() {
  hn = void 0;
}
const Me = (e) => hn ? (...r) => {
  try {
    return e(...r);
  } catch (n) {
    if (hn && hn(n) === !0)
      return;
    throw n;
  }
} : e, br = [];
function Sn(e) {
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
function sd(e, t) {
  const r = new rb();
  br.push(r), r.init(e);
  const [n, i] = Yu(), s = new n(
    Me(r.processMutations.bind(r))
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
function ab({
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
  const l = vn(
    Me(
      (h) => {
        const p = Date.now() - c;
        e(
          a.map((u) => (u.timeOffset -= p, u)),
          h
        ), a = [], c = null;
      }
    ),
    s
  ), d = Me(
    vn(
      Me((h) => {
        const p = Sn(h), { clientX: u, clientY: m } = vo(h) ? h.changedTouches[0] : h;
        c || (c = bn()), a.push({
          x: u,
          y: m,
          id: n.getId(p),
          timeOffset: bn() - c
        }), l(
          typeof DragEvent < "u" && h instanceof DragEvent ? Ee.Drag : h instanceof MouseEvent ? Ee.MouseMove : Ee.TouchMove
        );
      }),
      i,
      {
        trailing: !1
      }
    )
  ), o = [
    dt("mousemove", d, r),
    dt("touchmove", d, r),
    dt("drag", d, r)
  ];
  return Me(() => {
    o.forEach((h) => h());
  });
}
function lb({
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
    const p = Sn(h);
    if (pt(p, n, i, !0))
      return;
    let u = null, m = o;
    if ("pointerType" in h) {
      switch (h.pointerType) {
        case "mouse":
          u = jt.Mouse;
          break;
        case "touch":
          u = jt.Touch;
          break;
        case "pen":
          u = jt.Pen;
          break;
      }
      u === jt.Touch ? gt[o] === gt.MouseDown ? m = "TouchStart" : gt[o] === gt.MouseUp && (m = "TouchEnd") : jt.Pen;
    } else vo(h) && (u = jt.Touch);
    u !== null ? (l = u, (m.startsWith("Touch") && u === jt.Touch || m.startsWith("Mouse") && u === jt.Mouse) && (u = null)) : gt[o] === gt.Click && (u = l, l = null);
    const f = vo(h) ? h.changedTouches[0] : h;
    if (!f)
      return;
    const g = r.getId(p), { clientX: x, clientY: v } = f;
    Me(e)({
      type: gt[m],
      id: g,
      x,
      y: v,
      ...u !== null && { pointerType: u }
    });
  };
  return Object.keys(gt).filter(
    (o) => Number.isNaN(Number(o)) && !o.endsWith("_Departed") && a[o] !== !1
  ).forEach((o) => {
    let h = wr(o);
    const p = d(o);
    if (window.PointerEvent)
      switch (gt[o]) {
        case gt.MouseDown:
        case gt.MouseUp:
          h = h.replace(
            "mouse",
            "pointer"
          );
          break;
        case gt.TouchStart:
        case gt.TouchEnd:
          return;
      }
    c.push(dt(h, p, t));
  }), Me(() => {
    c.forEach((o) => o());
  });
}
function od({
  scrollCb: e,
  doc: t,
  mirror: r,
  blockClass: n,
  blockSelector: i,
  sampling: s
}) {
  const a = Me(
    vn(
      Me((c) => {
        const l = Sn(c);
        if (!l || pt(l, n, i, !0))
          return;
        const d = r.getId(l);
        if (l === t && t.defaultView) {
          const o = Gu(t.defaultView);
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
  return dt("scroll", a, t);
}
function cb({ viewportResizeCb: e }, { win: t }) {
  let r = -1, n = -1;
  const i = Me(
    vn(
      Me(() => {
        const s = Xu(), a = Ku();
        (r !== s || n !== a) && (e({
          width: Number(a),
          height: Number(s)
        }), r = s, n = a);
      }),
      200
    )
  );
  return dt("resize", i, t);
}
const ub = ["INPUT", "TEXTAREA", "SELECT"], Ec = /* @__PURE__ */ new WeakMap();
function db({
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
    let b = Sn(v);
    const C = v.isTrusted, w = b && b.tagName;
    if (b && w === "OPTION" && (b = be.parentElement(b)), !b || !w || ub.indexOf(w) < 0 || pt(b, n, i, !0) || b.classList.contains(s) || a && b.matches(a))
      return;
    let k = b.value, M = !1;
    const O = li(b) || "";
    O === "radio" || O === "checkbox" ? M = b.checked : (c[w.toLowerCase()] || c[O]) && (k = ai({
      element: b,
      maskInputOptions: c,
      tagName: w,
      type: O,
      value: k,
      maskInputFn: l
    })), p(
      b,
      o ? { text: k, isChecked: M, userTriggered: C } : { text: k, isChecked: M }
    );
    const P = b.name;
    O === "radio" && P && M && t.querySelectorAll(`input[type="radio"][name="${P}"]`).forEach((L) => {
      if (L !== b) {
        const G = L.value;
        p(
          L,
          o ? { text: G, isChecked: !M, userTriggered: !1 } : { text: G, isChecked: !M }
        );
      }
    });
  }
  function p(v, b) {
    const C = Ec.get(v);
    if (!C || C.text !== b.text || C.isChecked !== b.isChecked) {
      Ec.set(v, b);
      const w = r.getId(v);
      Me(e)({
        ...b,
        id: w
      });
    }
  }
  const m = (d.input === "last" ? ["change"] : ["input", "change"]).map(
    (v) => dt(v, Me(h), t)
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
      (v) => _i(
        v[0],
        v[1],
        {
          set() {
            Me(h)({
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
  ), Me(() => {
    m.forEach((v) => v());
  });
}
function di(e) {
  const t = [];
  function r(n, i) {
    if (Xn("CSSGroupingRule") && n.parentRule instanceof CSSGroupingRule || Xn("CSSMediaRule") && n.parentRule instanceof CSSMediaRule || Xn("CSSSupportsRule") && n.parentRule instanceof CSSSupportsRule || Xn("CSSConditionRule") && n.parentRule instanceof CSSConditionRule) {
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
function er(e, t, r) {
  let n, i;
  return e ? (e.ownerNode ? n = t.getId(e.ownerNode) : i = r.getId(e), {
    styleId: i,
    id: n
  }) : {};
}
function pb({ styleSheetRuleCb: e, mirror: t, stylesheetManager: r }, { win: n }) {
  if (!n.CSSStyleSheet || !n.CSSStyleSheet.prototype)
    return () => {
    };
  const i = n.CSSStyleSheet.prototype.insertRule;
  n.CSSStyleSheet.prototype.insertRule = new Proxy(i, {
    apply: Me(
      (o, h, p) => {
        const [u, m] = p, { id: f, styleId: g } = er(
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
    apply: Me(
      (o, h, p) => {
        const [u] = p, { id: m, styleId: f } = er(
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
    apply: Me(
      (o, h, p) => {
        const [u] = p, { id: m, styleId: f } = er(
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
    apply: Me(
      (o, h, p) => {
        const [u] = p, { id: m, styleId: f } = er(
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
  Kn("CSSGroupingRule") ? l.CSSGroupingRule = n.CSSGroupingRule : (Kn("CSSMediaRule") && (l.CSSMediaRule = n.CSSMediaRule), Kn("CSSConditionRule") && (l.CSSConditionRule = n.CSSConditionRule), Kn("CSSSupportsRule") && (l.CSSSupportsRule = n.CSSSupportsRule));
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
        apply: Me(
          (p, u, m) => {
            const [f, g] = m, { id: x, styleId: v } = er(
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
                    ...di(u),
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
        apply: Me(
          (p, u, m) => {
            const [f] = m, { id: g, styleId: x } = er(
              u.parentStyleSheet,
              t,
              r.styleMirror
            );
            return (g && g !== -1 || x && x !== -1) && e({
              id: g,
              styleId: x,
              removes: [
                { index: [...di(u), f] }
              ]
            }), p.apply(u, m);
          }
        )
      }
    );
  }), Me(() => {
    n.CSSStyleSheet.prototype.insertRule = i, n.CSSStyleSheet.prototype.deleteRule = s, a && (n.CSSStyleSheet.prototype.replace = a), c && (n.CSSStyleSheet.prototype.replaceSync = c), Object.entries(l).forEach(([o, h]) => {
      h.prototype.insertRule = d[o].insertRule, h.prototype.deleteRule = d[o].deleteRule;
    });
  });
}
function ad({
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
  }), Me(() => {
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
function hb({
  styleDeclarationCb: e,
  mirror: t,
  ignoreCSSAttributes: r,
  stylesheetManager: n
}, { win: i }) {
  const s = i.CSSStyleDeclaration.prototype.setProperty;
  i.CSSStyleDeclaration.prototype.setProperty = new Proxy(s, {
    apply: Me(
      (c, l, d) => {
        var o;
        const [h, p, u] = d;
        if (r.has(h))
          return s.apply(l, [h, p, u]);
        const { id: m, styleId: f } = er(
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
          index: di(l.parentRule)
        }), c.apply(l, d);
      }
    )
  });
  const a = i.CSSStyleDeclaration.prototype.removeProperty;
  return i.CSSStyleDeclaration.prototype.removeProperty = new Proxy(a, {
    apply: Me(
      (c, l, d) => {
        var o;
        const [h] = d;
        if (r.has(h))
          return a.apply(l, [h]);
        const { id: p, styleId: u } = er(
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
          index: di(l.parentRule)
        }), c.apply(l, d);
      }
    )
  }), Me(() => {
    i.CSSStyleDeclaration.prototype.setProperty = s, i.CSSStyleDeclaration.prototype.removeProperty = a;
  });
}
function fb({
  mediaInteractionCb: e,
  blockClass: t,
  blockSelector: r,
  mirror: n,
  sampling: i,
  doc: s
}) {
  const a = Me(
    (l) => vn(
      Me((d) => {
        const o = Sn(d);
        if (!o || pt(o, t, r, !0))
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
    dt("play", a(zr.Play), s),
    dt("pause", a(zr.Pause), s),
    dt("seeked", a(zr.Seeked), s),
    dt("volumechange", a(zr.VolumeChange), s),
    dt("ratechange", a(zr.RateChange), s)
  ];
  return Me(() => {
    c.forEach((l) => l());
  });
}
function mb({ fontCb: e, doc: t }) {
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
  const a = Er(
    t.fonts,
    "add",
    function(c) {
      return function(l) {
        return setTimeout(
          Me(() => {
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
  }), n.push(a), Me(() => {
    n.forEach((c) => c());
  });
}
function gb(e) {
  const { doc: t, mirror: r, blockClass: n, blockSelector: i, selectionCb: s } = e;
  let a = !0;
  const c = Me(() => {
    const l = t.getSelection();
    if (!l || a && (l != null && l.isCollapsed)) return;
    a = l.isCollapsed || !1;
    const d = [], o = l.rangeCount || 0;
    for (let h = 0; h < o; h++) {
      const p = l.getRangeAt(h), { startContainer: u, startOffset: m, endContainer: f, endOffset: g } = p;
      pt(u, n, i, !0) || pt(f, n, i, !0) || d.push({
        start: r.getId(u),
        startOffset: m,
        end: r.getId(f),
        endOffset: g
      });
    }
    s({ ranges: d });
  });
  return c(), dt("selectionchange", c);
}
function yb({
  doc: e,
  customElementCb: t
}) {
  const r = e.defaultView;
  return !r || !r.customElements ? () => {
  } : Er(
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
function bb(e, t) {
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
function vb(e, t = {}) {
  const r = e.doc.defaultView;
  if (!r)
    return () => {
    };
  bb(e, t);
  let n, i = () => {
  };
  e.recordDOM && ([n, i] = sd(e, e.doc));
  const s = ab(e), a = lb(e), c = od(e), l = cb(e, {
    win: r
  }), d = db(e), o = fb(e);
  let h = () => {
  }, p = () => {
  }, u = () => {
  }, m = () => {
  };
  e.recordDOM && (h = pb(e, { win: r }), p = ad(e, e.doc), u = hb(e, {
    win: r
  }), e.collectFonts && (m = mb(e)));
  const f = gb(e), g = yb(e), x = [];
  for (const v of e.plugins)
    x.push(
      v.observer(v.callback, r, v.options)
    );
  return Me(() => {
    br.forEach((v) => v.reset()), n == null || n.disconnect(), i(), s(), a(), c(), l(), d(), o(), h(), p(), u(), m(), f(), g(), x.forEach((v) => v());
  });
}
function Xn(e) {
  return typeof window[e] < "u";
}
function Kn(e) {
  return !!(typeof window[e] < "u" && // Note: Generally, this check _shouldn't_ be necessary
  // However, in some scenarios (e.g. jsdom) this can sometimes fail, so we check for it here
  window[e].prototype && "insertRule" in window[e].prototype && "deleteRule" in window[e].prototype);
}
class Cc {
  constructor(t) {
    q(this, "iframeIdToRemoteIdMap", /* @__PURE__ */ new WeakMap()), q(this, "iframeRemoteIdToIdMap", /* @__PURE__ */ new WeakMap()), this.generateIdFn = t;
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
class kb {
  constructor(t) {
    q(this, "iframes", /* @__PURE__ */ new WeakMap()), q(this, "crossOriginIframeMap", /* @__PURE__ */ new WeakMap()), q(this, "crossOriginIframeMirror", new Cc(Mu)), q(this, "crossOriginIframeStyleMirror"), q(this, "crossOriginIframeRootIdMap", /* @__PURE__ */ new WeakMap()), q(this, "mirror"), q(this, "mutationCb"), q(this, "wrappedEmit"), q(this, "loadListener"), q(this, "stylesheetManager"), q(this, "recordCrossOriginIframes"), this.mutationCb = t.mutationCb, this.wrappedEmit = t.wrappedEmit, this.stylesheetManager = t.stylesheetManager, this.recordCrossOriginIframes = t.recordCrossOriginIframes, this.crossOriginIframeStyleMirror = new Cc(
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
            source: Ee.Mutation,
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
          case Ee.Mutation:
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
          case Ee.Drag:
          case Ee.TouchMove:
          case Ee.MouseMove:
            return r.data.positions.forEach((i) => {
              this.replaceIds(i, t, ["id"]);
            }), r;
          case Ee.ViewportResize:
            return !1;
          case Ee.MediaInteraction:
          case Ee.MouseInteraction:
          case Ee.Scroll:
          case Ee.CanvasMutation:
          case Ee.Input:
            return this.replaceIds(r.data, t, ["id"]), r;
          case Ee.StyleSheetRule:
          case Ee.StyleDeclaration:
            return this.replaceIds(r.data, t, ["id"]), this.replaceStyleIds(r.data, t, ["styleId"]), r;
          case Ee.Font:
            return r;
          case Ee.Selection:
            return r.data.ranges.forEach((i) => {
              this.replaceIds(i, t, ["start", "end"]);
            }), r;
          case Ee.AdoptedStyleSheet:
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
    t.type !== nd.Document && !t.rootId && (t.rootId = r), "childNodes" in t && t.childNodes.forEach((n) => {
      this.patchRootIdOnNode(n, r);
    });
  }
}
class wb {
  constructor(t) {
    q(this, "shadowDoms", /* @__PURE__ */ new WeakSet()), q(this, "mutationCb"), q(this, "scrollCb"), q(this, "bypassOptions"), q(this, "mirror"), q(this, "restoreHandlers", []), this.mutationCb = t.mutationCb, this.scrollCb = t.scrollCb, this.bypassOptions = t.bypassOptions, this.mirror = t.mirror, this.init();
  }
  init() {
    this.reset(), this.patchAttachShadow(Element, document);
  }
  addShadowRoot(t, r) {
    if (!pn(t) || this.shadowDoms.has(t)) return;
    this.shadowDoms.add(t);
    const [n] = sd(
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
      od({
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
        ad(
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
      Er(
        t.prototype,
        "attachShadow",
        function(i) {
          return function(s) {
            const a = i.call(this, s), c = be.shadowRoot(this);
            return c && rd(this) && n.addShadowRoot(c, r), a;
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
var Fr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", xb = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (var Jn = 0; Jn < Fr.length; Jn++)
  xb[Fr.charCodeAt(Jn)] = Jn;
var Sb = function(e) {
  var t = new Uint8Array(e), r, n = t.length, i = "";
  for (r = 0; r < n; r += 3)
    i += Fr[t[r] >> 2], i += Fr[(t[r] & 3) << 4 | t[r + 1] >> 4], i += Fr[(t[r + 1] & 15) << 2 | t[r + 2] >> 6], i += Fr[t[r + 2] & 63];
  return n % 3 === 2 ? i = i.substring(0, i.length - 1) + "=" : n % 3 === 1 && (i = i.substring(0, i.length - 2) + "=="), i;
};
const Mc = /* @__PURE__ */ new Map();
function Eb(e, t) {
  let r = Mc.get(e);
  return r || (r = /* @__PURE__ */ new Map(), Mc.set(e, r)), r.has(t) || r.set(t, []), r.get(t);
}
const ld = (e, t, r) => {
  if (!e || !(ud(e, t) || typeof e == "object"))
    return;
  const n = e.constructor.name, i = Eb(r, n);
  let s = i.indexOf(e);
  return s === -1 && (s = i.length, i.push(e)), s;
};
function ti(e, t, r) {
  if (e instanceof Array)
    return e.map((n) => ti(n, t, r));
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
    const n = e.constructor.name, i = Sb(e);
    return {
      rr_type: n,
      base64: i
    };
  } else {
    if (e instanceof DataView)
      return {
        rr_type: e.constructor.name,
        args: [
          ti(e.buffer, t, r),
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
          args: [ti(e.data, t, r), e.width, e.height]
        };
      if (ud(e, t) || typeof e == "object") {
        const n = e.constructor.name, i = ld(e, t, r);
        return {
          rr_type: n,
          index: i
        };
      }
    }
  }
  return e;
}
const cd = (e, t, r) => e.map((n) => ti(n, t, r)), ud = (e, t) => !![
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
function Cb(e, t, r, n) {
  const i = [], s = Object.getOwnPropertyNames(
    t.CanvasRenderingContext2D.prototype
  );
  for (const a of s)
    try {
      if (typeof t.CanvasRenderingContext2D.prototype[a] != "function")
        continue;
      const c = Er(
        t.CanvasRenderingContext2D.prototype,
        a,
        function(l) {
          return function(...d) {
            return pt(this.canvas, r, n, !0) || setTimeout(() => {
              const o = cd(d, t, this);
              e(this.canvas, {
                type: Gr["2D"],
                property: a,
                args: o
              });
            }, 0), l.apply(this, d);
          };
        }
      );
      i.push(c);
    } catch {
      const c = _i(
        t.CanvasRenderingContext2D.prototype,
        a,
        {
          set(l) {
            e(this.canvas, {
              type: Gr["2D"],
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
function Mb(e) {
  return e === "experimental-webgl" ? "webgl" : e;
}
function Tc(e, t, r, n) {
  const i = [];
  try {
    const s = Er(
      e.HTMLCanvasElement.prototype,
      "getContext",
      function(a) {
        return function(c, ...l) {
          if (!pt(this, t, r, !0)) {
            const d = Mb(c);
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
function Rc(e, t, r, n, i, s) {
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
        const d = Er(
          e,
          l,
          function(o) {
            return function(...h) {
              const p = o.apply(this, h);
              if (ld(p, s, this), "tagName" in this.canvas && !pt(this.canvas, n, i, !0)) {
                const u = cd(h, s, this), m = {
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
        const d = _i(e, l, {
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
function Tb(e, t, r, n) {
  const i = [];
  return typeof t.WebGLRenderingContext < "u" && i.push(
    ...Rc(
      t.WebGLRenderingContext.prototype,
      Gr.WebGL,
      e,
      r,
      n,
      t
    )
  ), typeof t.WebGL2RenderingContext < "u" && i.push(
    ...Rc(
      t.WebGL2RenderingContext.prototype,
      Gr.WebGL2,
      e,
      r,
      n,
      t
    )
  ), () => {
    i.forEach((s) => s());
  };
}
const dd = `(function() {
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
`, Ac = typeof self < "u" && self.Blob && new Blob([dd], { type: "text/javascript;charset=utf-8" });
function Rb(e) {
  let t;
  try {
    if (t = Ac && (self.URL || self.webkitURL).createObjectURL(Ac), !t) throw "";
    const r = new Worker(t, {
      name: e == null ? void 0 : e.name
    });
    return r.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(t);
    }), r;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(dd),
      {
        name: e == null ? void 0 : e.name
      }
    );
  } finally {
    t && (self.URL || self.webkitURL).revokeObjectURL(t);
  }
}
class Ab {
  constructor(t) {
    q(this, "pendingCanvasMutations", /* @__PURE__ */ new Map()), q(this, "rafStamps", { latestId: 0, invokeId: null }), q(this, "mirror"), q(this, "mutationCb"), q(this, "resetObservers"), q(this, "frozen", !1), q(this, "locked", !1), q(this, "processMutation", (l, d) => {
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
    const a = Tc(
      r,
      n,
      i,
      !0
    ), c = /* @__PURE__ */ new Map(), l = new Rb();
    l.onmessage = (m) => {
      const { id: f } = m.data;
      if (c.set(f, !1), !("base64" in m.data)) return;
      const { base64: g, type: x, width: v, height: b } = m.data;
      this.mutationCb({
        id: f,
        type: Gr["2D"],
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
        pt(f, n, i, !0) || m.push(f);
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
    const i = Tc(
      t,
      r,
      n,
      !1
    ), s = Cb(
      this.processMutation.bind(this),
      t,
      r,
      n
    ), a = Tb(
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
class _b {
  constructor(t) {
    q(this, "trackedLinkElements", /* @__PURE__ */ new WeakSet()), q(this, "mutationCb"), q(this, "adoptedStyleSheetCb"), q(this, "styleMirror", new Zy()), this.mutationCb = t.mutationCb, this.adoptedStyleSheetCb = t.adoptedStyleSheetCb;
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
          rule: Su(c, s.href),
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
class Ib {
  constructor() {
    q(this, "nodeMap", /* @__PURE__ */ new WeakMap()), q(this, "active", !1);
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
let He, ri, uo, pi = !1;
try {
  if (Array.from([1], (e) => e * 2)[0] !== 2) {
    const e = document.createElement("iframe");
    document.body.appendChild(e), Array.from = ((ol = e.contentWindow) == null ? void 0 : ol.Array.from) || Array.from, document.body.removeChild(e);
  }
} catch (e) {
  console.debug("Unable to override Array.from", e);
}
const Rt = $g();
function ir(e = {}) {
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
    mousemoveWait: C,
    recordDOM: w = !0,
    recordCanvas: k = !1,
    recordCrossOriginIframes: M = !1,
    recordAfter: O = e.recordAfter === "DOMContentLoaded" ? e.recordAfter : "load",
    userTriggeredOnInput: P = !1,
    collectFonts: L = !1,
    inlineImages: G = !1,
    plugins: j,
    keepIframeSrcFn: _ = () => !1,
    ignoreCSSAttributes: ke = /* @__PURE__ */ new Set([]),
    errorHandler: Ae
  } = e;
  sb(Ae);
  const he = M ? window.parent === window : !0;
  let ae = !1;
  if (!he)
    try {
      window.parent.document && (ae = !1);
    } catch {
      ae = !0;
    }
  if (he && !t)
    throw new Error("emit function is required");
  if (!he && !ae)
    return () => {
    };
  C !== void 0 && v.mousemove === void 0 && (v.mousemove = C), Rt.reset();
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
  } : p !== void 0 ? p : { password: !0 }, _e = _u(u);
  Jy();
  let ve, me = 0;
  const ne = (te) => {
    for (const Ne of j || [])
      Ne.eventProcessor && (te = Ne.eventProcessor(te));
    return x && // Disable packing events which will be emitted to parent frames.
    !ae && (te = x(te)), te;
  };
  He = (te, Ne) => {
    var ue;
    const we = te;
    if (we.timestamp = bn(), (ue = br[0]) != null && ue.isFrozen() && we.type !== Re.FullSnapshot && !(we.type === Re.IncrementalSnapshot && we.data.source === Ee.Mutation) && br.forEach((Je) => Je.unfreeze()), he)
      t == null || t(ne(we), Ne);
    else if (ae) {
      const Je = {
        type: "rrweb",
        event: ne(we),
        origin: window.location.origin,
        isCheckout: Ne
      };
      window.parent.postMessage(Je, "*");
    }
    if (we.type === Re.FullSnapshot)
      ve = we, me = 0;
    else if (we.type === Re.IncrementalSnapshot) {
      if (we.data.source === Ee.Mutation && we.data.isAttachIframe)
        return;
      me++;
      const Je = n && me >= n, Ce = r && we.timestamp - ve.timestamp > r;
      (Je || Ce) && ri(!0);
    }
  };
  const z = (te) => {
    He({
      type: Re.IncrementalSnapshot,
      data: {
        source: Ee.Mutation,
        ...te
      }
    });
  }, fe = (te) => He({
    type: Re.IncrementalSnapshot,
    data: {
      source: Ee.Scroll,
      ...te
    }
  }), de = (te) => He({
    type: Re.IncrementalSnapshot,
    data: {
      source: Ee.CanvasMutation,
      ...te
    }
  }), pe = (te) => He({
    type: Re.IncrementalSnapshot,
    data: {
      source: Ee.AdoptedStyleSheet,
      ...te
    }
  }), ie = new _b({
    mutationCb: z,
    adoptedStyleSheetCb: pe
  }), le = new kb({
    mirror: Rt,
    mutationCb: z,
    stylesheetManager: ie,
    recordCrossOriginIframes: M,
    wrappedEmit: He
  });
  for (const te of j || [])
    te.getMirror && te.getMirror({
      nodeMirror: Rt,
      crossOriginIframeMirror: le.crossOriginIframeMirror,
      crossOriginIframeStyleMirror: le.crossOriginIframeStyleMirror
    });
  const Ye = new Ib();
  uo = new Ab({
    recordCanvas: k,
    mutationCb: de,
    win: window,
    blockClass: i,
    blockSelector: s,
    mirror: Rt,
    sampling: v.canvas,
    dataURLOptions: b
  });
  const tt = new wb({
    mutationCb: z,
    scrollCb: fe,
    bypassOptions: {
      blockClass: i,
      blockSelector: s,
      maskTextClass: l,
      maskTextSelector: d,
      inlineStylesheet: o,
      maskInputOptions: Te,
      dataURLOptions: b,
      maskTextFn: f,
      maskInputFn: m,
      recordCanvas: k,
      inlineImages: G,
      sampling: v,
      slimDOMOptions: _e,
      iframeManager: le,
      stylesheetManager: ie,
      canvasManager: uo,
      keepIframeSrcFn: _,
      processedNodeManager: Ye
    },
    mirror: Rt
  });
  ri = (te = !1) => {
    if (!w)
      return;
    He(
      {
        type: Re.Meta,
        data: {
          href: window.location.href,
          width: Ku(),
          height: Xu()
        }
      },
      te
    ), ie.reset(), tt.init(), br.forEach((ue) => ue.lock());
    const Ne = ly(document, {
      mirror: Rt,
      blockClass: i,
      blockSelector: s,
      maskTextClass: l,
      maskTextSelector: d,
      inlineStylesheet: o,
      maskAllInputs: Te,
      maskTextFn: f,
      maskInputFn: m,
      slimDOM: _e,
      dataURLOptions: b,
      recordCanvas: k,
      inlineImages: G,
      onSerialize: (ue) => {
        Qu(ue, Rt) && le.addIframe(ue), ed(ue, Rt) && ie.trackLinkElement(ue), ko(ue) && tt.addShadowRoot(be.shadowRoot(ue), document);
      },
      onIframeLoad: (ue, we) => {
        le.attachIframe(ue, we), tt.observeAttachShadow(ue);
      },
      onStylesheetLoad: (ue, we) => {
        ie.attachLinkElement(ue, we);
      },
      keepIframeSrcFn: _
    });
    if (!Ne)
      return console.warn("Failed to snapshot the document");
    He(
      {
        type: Re.FullSnapshot,
        data: {
          node: Ne,
          initialOffset: Gu(window)
        }
      },
      te
    ), br.forEach((ue) => ue.unlock()), document.adoptedStyleSheets && document.adoptedStyleSheets.length > 0 && ie.adoptStyleSheets(
      document.adoptedStyleSheets,
      Rt.getId(document)
    );
  };
  try {
    const te = [], Ne = (we) => {
      var Je;
      return Me(vb)(
        {
          mutationCb: z,
          mousemoveCb: (Ce, Fe) => He({
            type: Re.IncrementalSnapshot,
            data: {
              source: Fe,
              positions: Ce
            }
          }),
          mouseInteractionCb: (Ce) => He({
            type: Re.IncrementalSnapshot,
            data: {
              source: Ee.MouseInteraction,
              ...Ce
            }
          }),
          scrollCb: fe,
          viewportResizeCb: (Ce) => He({
            type: Re.IncrementalSnapshot,
            data: {
              source: Ee.ViewportResize,
              ...Ce
            }
          }),
          inputCb: (Ce) => He({
            type: Re.IncrementalSnapshot,
            data: {
              source: Ee.Input,
              ...Ce
            }
          }),
          mediaInteractionCb: (Ce) => He({
            type: Re.IncrementalSnapshot,
            data: {
              source: Ee.MediaInteraction,
              ...Ce
            }
          }),
          styleSheetRuleCb: (Ce) => He({
            type: Re.IncrementalSnapshot,
            data: {
              source: Ee.StyleSheetRule,
              ...Ce
            }
          }),
          styleDeclarationCb: (Ce) => He({
            type: Re.IncrementalSnapshot,
            data: {
              source: Ee.StyleDeclaration,
              ...Ce
            }
          }),
          canvasMutationCb: de,
          fontCb: (Ce) => He({
            type: Re.IncrementalSnapshot,
            data: {
              source: Ee.Font,
              ...Ce
            }
          }),
          selectionCb: (Ce) => {
            He({
              type: Re.IncrementalSnapshot,
              data: {
                source: Ee.Selection,
                ...Ce
              }
            });
          },
          customElementCb: (Ce) => {
            He({
              type: Re.IncrementalSnapshot,
              data: {
                source: Ee.CustomElement,
                ...Ce
              }
            });
          },
          blockClass: i,
          ignoreClass: a,
          ignoreSelector: c,
          maskTextClass: l,
          maskTextSelector: d,
          maskInputOptions: Te,
          inlineStylesheet: o,
          sampling: v,
          recordDOM: w,
          recordCanvas: k,
          inlineImages: G,
          userTriggeredOnInput: P,
          collectFonts: L,
          doc: we,
          maskInputFn: m,
          maskTextFn: f,
          keepIframeSrcFn: _,
          blockSelector: s,
          slimDOMOptions: _e,
          dataURLOptions: b,
          mirror: Rt,
          iframeManager: le,
          stylesheetManager: ie,
          shadowDomManager: tt,
          processedNodeManager: Ye,
          canvasManager: uo,
          ignoreCSSAttributes: ke,
          plugins: ((Je = j == null ? void 0 : j.filter((Ce) => Ce.observer)) == null ? void 0 : Je.map((Ce) => ({
            observer: Ce.observer,
            options: Ce.options,
            callback: (Fe) => He({
              type: Re.Plugin,
              data: {
                plugin: Ce.name,
                payload: Fe
              }
            })
          }))) || []
        },
        g
      );
    };
    le.addLoadListener((we) => {
      try {
        te.push(Ne(we.contentDocument));
      } catch (Je) {
        console.warn(Je);
      }
    });
    const ue = () => {
      ri(), te.push(Ne(document)), pi = !0;
    };
    return ["interactive", "complete"].includes(document.readyState) ? ue() : (te.push(
      dt("DOMContentLoaded", () => {
        He({
          type: Re.DomContentLoaded,
          data: {}
        }), O === "DOMContentLoaded" && ue();
      })
    ), te.push(
      dt(
        "load",
        () => {
          He({
            type: Re.Load,
            data: {}
          }), O === "load" && ue();
        },
        window
      )
    )), () => {
      te.forEach((we) => {
        try {
          we();
        } catch (Je) {
          String(Je).toLowerCase().includes("cross-origin") || console.warn(Je);
        }
      }), Ye.destroy(), pi = !1, ob();
    };
  } catch (te) {
    console.warn(te);
  }
}
ir.addCustomEvent = (e, t) => {
  if (!pi)
    throw new Error("please add custom event after start recording");
  He({
    type: Re.Custom,
    data: {
      tag: e,
      payload: t
    }
  });
};
ir.freezePage = () => {
  br.forEach((e) => e.freeze());
};
ir.takeFullSnapshot = (e) => {
  if (!pi)
    throw new Error("please take full snapshot after start recording");
  ri(e);
};
ir.mirror = Rt;
var _c;
(function(e) {
  e[e.NotStarted = 0] = "NotStarted", e[e.Running = 1] = "Running", e[e.Stopped = 2] = "Stopped";
})(_c || (_c = {}));
const { addCustomEvent: xv } = ir, { freezePage: Sv } = ir, { takeFullSnapshot: Ev } = ir, Zn = 2, po = 4;
class Lb {
  constructor(t) {
    Pn(this, "events", []);
    Pn(this, "lastMeta", null);
    Pn(this, "lastFull", null);
    this.opts = t;
  }
  push(t) {
    t.type === po && (this.lastMeta = t), t.type === Zn && (this.lastFull = t, this.events = []), this.events.push(t), this.prune();
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
    const t = [], r = this.events.some((i) => i.type === Zn), n = this.events.some((i) => i.type === po);
    return !r && this.lastFull ? (this.lastMeta && t.push(this.lastMeta), t.push(this.lastFull)) : r && !n && this.lastMeta && t.push(this.lastMeta), [...t, ...this.events];
  }
  /** True when the buffer can produce a scrubbable replay: a full snapshot + at least one event to
   *  play beyond the meta+full pair (a lone meta+full renders a single static frame, not a replay). */
  isPlayable() {
    const t = this.snapshot(), r = t.some((i) => i.type === Zn), n = t.some((i) => i.type !== Zn && i.type !== po);
    return r && n;
  }
  clear() {
    this.events = [], this.lastMeta = null, this.lastFull = null;
  }
}
function Ob(e, t = {}) {
  const r = t.windowMs ?? 6e4, n = new Lb({
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
const pd = "klav-sims-live", hd = "klav-sims-overlay", Ic = "klav-sims-ext-css";
let _t = null, gr = null, wt = null, Ur = null;
const hi = /* @__PURE__ */ new Map(), St = /* @__PURE__ */ new Map();
let fd = 0, Bt = !1, vr = null, Hr = null, En = !1, ut = null, cn = null, tr = null, rr = null, It = null, kr = null, At = null, Ft = null, Lt = null, Br = null;
const fi = /* @__PURE__ */ new Set();
function Nb(e) {
  return String(e || "").trim().toLowerCase().replace(/\s+/g, " ");
}
function md(e, t) {
  return `${e}::${Nb(t.text)}`;
}
function gd(e) {
  try {
    document.dispatchEvent(new CustomEvent("klavity:sims-live", { detail: { active: e } }));
  } catch {
  }
}
const Pb = `
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
`, zb = `
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
function Lc(e, t) {
  const r = e.replace("#", ""), n = (c) => parseInt(c, 16), [i, s, a] = r.length === 3 ? [n(r[0] + r[0]), n(r[1] + r[1]), n(r[2] + r[2])] : [n(r.slice(0, 2)), n(r.slice(2, 4)), n(r.slice(4, 6))];
  return `rgba(${i},${s},${a},${t})`;
}
function Db(e) {
  if (e.suggestedBug) return !0;
  const t = String(e.priority ?? "").trim().toLowerCase();
  if (t && t !== "none") return !0;
  const r = String(e.sentiment ?? "").trim().toLowerCase();
  return r ? !(/* @__PURE__ */ new Set(["positive", "satisfied", "delighted", "neutral", "none"])).has(r) : !1;
}
function xo() {
  var e, t;
  try {
    return ((t = (e = window.matchMedia) == null ? void 0 : e.call(window, "(prefers-reduced-motion: reduce)")) == null ? void 0 : t.matches) ?? !1;
  } catch {
    return !1;
  }
}
function $b(e) {
  return new Promise((t) => setTimeout(t, e));
}
function jr(e) {
  const t = String(e.priority ?? "").trim().toLowerCase();
  return t === "high" || t === "critical" || t === "urgent" ? "HIGH" : t === "medium" || t === "med" ? "MED" : t === "low" ? "LOW" : e.suggestedBug ? "HIGH" : null;
}
const yd = { HIGH: "h", MED: "m", LOW: "l" }, Oc = { HIGH: 0, MED: 1, LOW: 2 };
function Fb(e) {
  if (!e) return !1;
  if (e === wt || e === _t || e.id === hd || e.id === pd || e.id === "klavity-widget-host") return !0;
  const t = e.classList;
  return !!t && t.contains("klav-halo");
}
function Ub(e) {
  const t = [];
  for (const r of [wt, _t])
    r && (t.push({ el: r, vis: r.style.visibility }), r.style.visibility = "hidden");
  try {
    return e();
  } finally {
    for (const { el: r, vis: n } of t) r.style.visibility = n;
  }
}
function bd(e) {
  const t = e.targetViewport;
  return {
    scrollX: Number.isFinite(t == null ? void 0 : t.scrollX) ? Number(t.scrollX) : window.scrollX,
    scrollY: Number.isFinite(t == null ? void 0 : t.scrollY) ? Number(t.scrollY) : window.scrollY,
    width: Math.max(1, Number.isFinite(t == null ? void 0 : t.width) ? Number(t.width) : window.innerWidth),
    height: Math.max(1, Number.isFinite(t == null ? void 0 : t.height) ? Number(t.height) : window.innerHeight)
  };
}
function vd(e, t) {
  return new DOMRect(
    t.scrollX + e.x * t.width,
    t.scrollY + e.y * t.height,
    Math.max(1, e.w * t.width),
    Math.max(1, e.h * t.height)
  );
}
function Nc(e) {
  return Math.max(0, e.width) * Math.max(0, e.height);
}
function Bb(e, t) {
  const r = Math.max(e.left, t.left), n = Math.min(e.right, t.right), i = Math.max(e.top, t.top), s = Math.min(e.bottom, t.bottom);
  return Math.max(0, n - r) * Math.max(0, s - i);
}
function qb(e) {
  return new DOMRect(e.left + window.scrollX, e.top + window.scrollY, e.width, e.height);
}
function kd(e) {
  if (!e || !(e instanceof HTMLElement) || e === document.body || e === document.documentElement || Fb(e)) return !1;
  const t = e.getBoundingClientRect();
  if (t.width < 8 || t.height < 8) return !1;
  try {
    const r = getComputedStyle(e);
    if (r.display === "none" || r.visibility === "hidden" || Number(r.opacity) === 0) return !1;
  } catch {
  }
  return !0;
}
function Wb(e, t) {
  return Ub(() => {
    const r = /* @__PURE__ */ new Set(), n = [], i = (a) => {
      let c = a;
      for (; c && c !== document.body && c !== document.documentElement; )
        !r.has(c) && kd(c) && (r.add(c), n.push(c)), c = c.parentElement;
    }, s = typeof document.elementsFromPoint == "function" ? document.elementsFromPoint(e, t) : [document.elementFromPoint(e, t)].filter(Boolean);
    for (const a of s) i(a);
    return n;
  });
}
function Hb(e, t) {
  const r = bd(t), n = vd(e, r), i = Math.max(2, Math.min(window.innerWidth - 2, n.left + n.width / 2 - window.scrollX)), s = Math.max(2, Math.min(window.innerHeight - 2, n.top + n.height / 2 - window.scrollY)), a = Wb(i, s);
  if (!a.length) return null;
  const c = Math.max(1, Nc(n));
  let l = null, d = -1 / 0;
  for (const o of a) {
    const h = qb(o.getBoundingClientRect()), p = Bb(h, n);
    if (p <= 0) continue;
    const u = Math.max(1, Nc(h)), m = p / c, f = Math.max(0, (u - p) / u), g = o.tagName.toLowerCase(), x = /^(button|a|input|textarea|select|label|section|article|nav|header|footer|main|form)$/.test(g) ? 0.18 : 0, v = u > window.innerWidth * window.innerHeight * 0.92 ? 0.8 : 0, b = m - f * 0.35 + x - v;
    b > d && (l = o, d = b);
  }
  return l ?? a[0] ?? null;
}
async function jb(e, t) {
  if (e >= window.scrollX + 80 && e <= window.scrollX + window.innerWidth - 80 && t >= window.scrollY + 80 && t <= window.scrollY + window.innerHeight - 80) return;
  const i = Math.max(0, document.documentElement.scrollHeight - window.innerHeight), s = Math.max(0, document.documentElement.scrollWidth - window.innerWidth), a = Math.max(0, Math.min(i, t - window.innerHeight * 0.38)), c = Math.max(0, Math.min(s, e - window.innerWidth * 0.45));
  try {
    window.scrollTo({ top: a, left: c, behavior: xo() ? "auto" : "smooth" });
  } catch {
    window.scrollTo(c, a);
  }
  await $b(xo() ? 80 : 520);
}
const Vb = /* @__PURE__ */ new Set([
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
function Yb(e) {
  const t = /* @__PURE__ */ new Set();
  return String(e || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((r) => r.length < 4 || Vb.has(r) || t.has(r) ? !1 : (t.add(r), !0));
}
function Gb(e) {
  const t = Yb(e.text);
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
    if (!kd(a)) continue;
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
async function Xb(e, t = {}) {
  if (e.region) {
    const r = bd(e), n = vd(e.region, r);
    t.scroll !== !1 && await jb(n.left + n.width / 2, n.top + n.height / 2);
    const i = Hb(e.region, e);
    if (i) return i;
  }
  return Gb(e);
}
function Kb() {
  if (_t && gr) return gr;
  _t = document.createElement("div"), _t.id = pd, _t.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;", gr = _t.attachShadow({ mode: "open" }), Bm(gr);
  const e = document.createElement("style");
  return e.textContent = Pb, gr.appendChild(e), document.body.appendChild(_t), gr;
}
function wd() {
  if (wt) return wt;
  if (!document.getElementById(Ic)) {
    const e = document.createElement("style");
    e.id = Ic, e.textContent = zb, document.head.appendChild(e);
  }
  return wt = document.createElement("div"), wt.id = hd, wt.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;z-index:2147483640;pointer-events:none;overflow:visible;", document.body.appendChild(wt), wt;
}
function xd(e, t) {
  return Fm({
    name: e.name,
    initials: e.initials,
    photoUrl: e.photoUrl,
    color: e.accent,
    animate: !1,
    legs: !0,
    size: t
  });
}
function Jb(e, t = [], r = {}) {
  if (typeof document > "u") return;
  Eo();
  const n = Kb();
  wd(), Ur = new AbortController();
  const i = e === "all" ? t : t.filter((h) => e.includes(h.id));
  if (!i.length) {
    console.warn("[KlavitySims] deploy(): no matching Sims — panel not mounted."), Eo();
    return;
  }
  i.slice(0, 8).forEach((h) => {
    const p = h.accent || "#6366f1", u = h.initials || h.name.slice(0, 2).toUpperCase();
    hi.set(h.id, { simId: h.id, accent: p, initials: u, name: h.name, photoUrl: h.photoUrl });
  });
  const s = document.createElement("div");
  s.className = "ksl-root", n.appendChild(s), Lt = document.createElement("div"), Lt.className = "ksl-sr", Lt.id = "ksl-announcer", Lt.setAttribute("aria-live", "polite"), Lt.setAttribute("aria-atomic", "true"), s.appendChild(Lt), ut = document.createElement("button"), ut.type = "button", ut.className = "ksl-launcher", ut.setAttribute("aria-label", "Open Sims feedback panel"), ut.addEventListener("click", () => Zb());
  const a = document.createElement("span");
  a.className = "ksl-pill", cn = document.createElement("span"), cn.className = "ksl-pill-avatars", tr = document.createElement("span"), tr.className = "ksl-pill-txt", a.append(cn, tr), rr = document.createElement("span"), rr.className = "ksl-pill-badge", rr.hidden = !0, ut.append(a, rr), s.appendChild(ut), i.slice(0, 3).forEach((h) => {
    const p = hi.get(h.id);
    p && cn.appendChild(xd(p, 26));
  }), It = document.createElement("section"), It.className = "ksl-panel", It.setAttribute("aria-label", "Sims feedback"), It.setAttribute("role", "dialog");
  const c = document.createElement("div");
  c.className = "ksl-head";
  const l = document.createElement("div");
  l.className = "ksl-title-row";
  const d = document.createElement("div");
  d.className = "ksl-title", d.textContent = "Sims feedback";
  const o = document.createElement("button");
  o.type = "button", o.className = "ksl-icon-btn", o.title = "Minimize", o.setAttribute("aria-label", "Minimize Sims feedback panel"), o.innerHTML = re("x", { size: 15 }), o.addEventListener("click", () => Pc()), l.append(d, o), kr = document.createElement("div"), kr.className = "ksl-count", At = document.createElement("div"), At.className = "ksl-chips", c.append(l, kr, At), Ft = document.createElement("div"), Ft.className = "ksl-list", Ft.setAttribute("role", "list"), It.append(c, Ft), s.appendChild(It), document.addEventListener("keydown", (h) => {
    h.key === "Escape" && Bt && Pc();
  }, { signal: Ur.signal }), gd(!0), Kr();
}
function Sd(e) {
  En = e, ut == null || ut.classList.toggle("is-reviewing", e), Kr(), Bt && Xr();
}
function Zb() {
  !It || !ut || (Bt = !0, It.classList.add("is-open"), ut.hidden = !0, Xr());
}
function Pc() {
  !It || !ut || (Bt = !1, It.classList.remove("is-open"), ut.hidden = !1, Kr());
}
function Ed() {
  const e = Array.from(St.values()), t = new Set(e.map((n) => n.entry.simId)), r = e.filter((n) => jr(n.obs) === "HIGH").length;
  return { total: e.length, sims: t.size, high: r };
}
function Kr() {
  const e = Ed();
  tr && (En && e.total === 0 ? tr.innerHTML = "Your Sims are reviewing…" : e.total === 0 ? tr.innerHTML = "Sims are watching this page" : tr.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from your Sims`), rr && (rr.hidden = e.high === 0, rr.textContent = `${e.high} high`), Bt && Cd(e);
}
function Cd(e) {
  kr && (e.total === 0 ? kr.innerHTML = En ? "Your Sims are reviewing this page…" : "No findings yet — your Sims are watching." : kr.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from <b>${e.sims}</b> Sim${e.sims === 1 ? "" : "s"}` + (e.high > 0 ? ` · <span class="ksl-hi">${e.high} high</span>` : "")), Qb();
}
function Qb() {
  if (!At) return;
  const e = Array.from(St.values());
  if (At.hidden = e.length === 0, At.textContent = "", !e.length) return;
  const t = document.createElement("span");
  t.className = "ksl-chips-label", t.textContent = "Sim", At.appendChild(t);
  const r = /* @__PURE__ */ new Map();
  e.forEach((i) => {
    const s = r.get(i.entry.simId) ?? { entry: i.entry, n: 0 };
    s.n += 1, r.set(i.entry.simId, s);
  }), r.forEach(({ entry: i, n: s }) => {
    const a = document.createElement("button");
    a.type = "button", a.className = "ksl-chip" + (vr === i.simId ? " is-on" : ""), a.setAttribute("aria-pressed", String(vr === i.simId));
    const c = document.createElement("span");
    c.className = "ksl-dot", c.style.background = i.accent, a.append(c, document.createTextNode(`${i.initials} · ${s}`)), a.addEventListener("click", () => {
      vr = vr === i.simId ? null : i.simId, Xr();
    }), At.appendChild(a);
  });
  const n = document.createElement("span");
  n.className = "ksl-chips-label", n.style.marginLeft = "6px", n.textContent = "Priority", At.appendChild(n), ["HIGH", "MED", "LOW"].forEach((i) => {
    const s = e.filter((l) => jr(l.obs) === i).length;
    if (!s) return;
    const a = document.createElement("button");
    a.type = "button";
    const c = Hr === i;
    a.className = "ksl-chip" + (c ? ` sev-on-${yd[i]}` : ""), a.setAttribute("aria-pressed", String(c)), a.textContent = `${i} · ${s}`, a.addEventListener("click", () => {
      Hr = Hr === i ? null : i, Xr();
    }), At.appendChild(a);
  });
}
function ev() {
  return Array.from(St.values()).filter((e) => !vr || e.entry.simId === vr).filter((e) => !Hr || jr(e.obs) === Hr).sort((e, t) => {
    const r = jr(e.obs), n = jr(t.obs), i = r ? Oc[r] : 3, s = n ? Oc[n] : 3;
    return i - s;
  });
}
function tv(e) {
  const { entry: t, obs: r } = e, n = jr(r), i = document.createElement("div");
  i.className = "ksl-row", i.setAttribute("role", "listitem"), i.dataset.id = e.id, i.style.borderLeftColor = t.accent;
  const s = document.createElement("div");
  s.className = "ksl-r-head", s.appendChild(xd(t, 26));
  const a = document.createElement("span");
  a.className = "ksl-r-name", a.style.color = t.accent, a.textContent = t.name, s.appendChild(a);
  const c = String(r.sentiment ?? "").trim();
  if (c) {
    const m = document.createElement("span");
    m.className = "ksl-r-sent", m.textContent = c, s.appendChild(m);
  }
  if (n) {
    const m = document.createElement("span");
    m.className = `ksl-sev ${yd[n]}`, m.setAttribute("aria-label", `Priority: ${n}`), m.textContent = n, s.appendChild(m);
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
  h.type = "button", h.className = "ksl-r-act track", h.innerHTML = re("bug", { size: 12 }) + " Track as Bug", h.setAttribute("aria-label", `Track feedback from ${t.name} as a bug`), h.addEventListener("click", () => {
    var m;
    (m = ni.onTriage) == null || m.call(ni, r, t.name), zc(e.id);
  });
  const p = document.createElement("button");
  p.type = "button", p.className = "ksl-r-act jump", p.innerHTML = re("map-pin", { size: 12 }) + " Jump to on page", p.setAttribute("aria-label", `Jump to where ${t.name} flagged this`), p.addEventListener("click", () => {
    nv(e.id);
  });
  const u = document.createElement("button");
  return u.type = "button", u.className = "ksl-r-act dismiss", u.textContent = "Dismiss", u.setAttribute("aria-label", `Dismiss feedback from ${t.name}`), u.addEventListener("click", () => {
    zc(e.id);
  }), o.append(h, p, u), i.appendChild(o), i;
}
function rv(e) {
  e.querySelectorAll(".ksl-row").forEach((t) => {
    const r = t.querySelector(".ksl-r-obs");
    r && r.scrollHeight - r.clientHeight > 4 && t.classList.add("is-clamped");
  });
}
function Xr() {
  if (!Ft || !Bt) {
    Kr();
    return;
  }
  const e = Ed();
  Cd(e);
  const t = ev();
  if (Ft.textContent = "", !t.length) {
    const n = document.createElement("div");
    n.className = "ksl-empty";
    const i = St.size > 0;
    if (En && !i) {
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
    Ft.appendChild(n), St.forEach((s) => {
      s.rowEl = null;
    });
    return;
  }
  t.forEach((n) => {
    const i = tv(n);
    n.rowEl = i, Ft.appendChild(i);
  });
  const r = new Set(t.map((n) => n.id));
  St.forEach((n) => {
    r.has(n.id) || (n.rowEl = null);
  }), rv(Ft);
}
function So() {
  Br == null || Br(), Br = null;
}
async function nv(e) {
  const t = St.get(e);
  if (!t) return;
  const r = await Xb(t.obs, { scroll: !0 });
  !r || !wt || iv(r, t.entry.accent);
}
function iv(e, t) {
  So();
  const r = wd(), n = document.createElement("div");
  n.className = "klav-halo", n.style.borderColor = t, n.style.boxShadow = `0 0 0 4px ${Lc(t, 0.16)},0 0 24px ${Lc(t, 0.2)}`, r.appendChild(n);
  const i = new AbortController(), s = () => {
    const d = e.getBoundingClientRect(), o = d.width > 0 && d.height > 0 && d.bottom > 0 && d.right > 0 && d.top < window.innerHeight && d.left < window.innerWidth;
    n.style.display = o ? "" : "none", o && (n.style.left = `${d.left - 5}px`, n.style.top = `${d.top - 5}px`, n.style.width = `${d.width + 10}px`, n.style.height = `${d.height + 10}px`);
  }, a = () => requestAnimationFrame(s);
  s(), window.addEventListener("scroll", a, { passive: !0, signal: i.signal }), window.addEventListener("resize", a, { signal: i.signal });
  const c = setTimeout(() => {
    n.style.opacity = "0", n.style.transition = "opacity .3s ease", setTimeout(() => {
      Br === l && So();
    }, 320);
  }, 3200), l = () => {
    clearTimeout(c), i.abort(), je(n);
  };
  Br = l;
}
function sv(e, t) {
  const r = `f_${e.simId}_${++fd}`;
  St.set(r, { id: r, entry: e, obs: t, rowEl: null }), Bt ? Xr() : Kr(), Lt && (Lt.textContent = "", requestAnimationFrame(() => {
    Lt && (Lt.textContent = `${e.name}: ${t.text || ""}`);
  }));
}
function ov(e) {
  const t = St.get(e);
  if (!t) return;
  const r = () => {
    St.delete(e), Bt ? Xr() : Kr();
  };
  t.rowEl && Bt ? (t.rowEl.classList.add("is-removing"), setTimeout(r, xo() ? 0 : 300)) : r();
}
function zc(e) {
  const t = St.get(e);
  t && (fi.add(md(t.entry.simId, t.obs)), ov(e));
}
function av(e, t, r) {
  if (!_t) return;
  const n = hi.get(e);
  if (!n) {
    console.warn(`[KlavitySims] renderFeedback: simId "${e}" not registered`);
    return;
  }
  if (r.length) {
    Sd(!1);
    for (const i of r) {
      if (!Db(i)) continue;
      const s = md(e, i);
      fi.has(s) || (fi.add(s), sv(n, i));
    }
  }
}
function Eo() {
  So(), St.clear(), fd = 0, hi.clear(), fi.clear(), Bt = !1, vr = null, Hr = null, En = !1, Ur == null || Ur.abort(), Ur = null, ut = null, cn = null, tr = null, rr = null, It = null, kr = null, At = null, Ft = null, Lt = null, je(wt), wt = null, je(_t), _t = null, gr = null, gd(!1);
}
const ni = {
  deploy: Jb,
  setReviewing: Sd,
  renderFeedback: av,
  undeploy: Eo,
  onTriage: null
};
function lv() {
  typeof window > "u" || window.KlavitySims || (window.KlavitySims = ni);
}
typeof window < "u" && lv();
const Dc = "klav-ao-css", cv = "klav-ao-overlay";
function uv(e, t, r, n, i, s = 10) {
  const l = !(e.y - r - 14 >= s), d = l ? e.y + e.h + 14 : e.y - r - 14, o = Math.max(s, Math.min(d, i - r - s));
  return { left: Math.max(s, Math.min(e.x, n - t - s)), top: o, below: l };
}
const dv = `
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
let mr = null, pv = 1;
const mi = /* @__PURE__ */ new Map();
function $c(e, t) {
  const r = e.replace("#", ""), n = (c) => parseInt(c, 16), [i, s, a] = r.length === 3 ? [n(r[0] + r[0]), n(r[1] + r[1]), n(r[2] + r[2])] : [n(r.slice(0, 2)), n(r.slice(2, 4)), n(r.slice(4, 6))];
  return `rgba(${i},${s},${a},${t})`;
}
function hv() {
  if (mr) return mr;
  if (!document.getElementById(Dc)) {
    const e = document.createElement("style");
    e.id = Dc, e.textContent = dv, document.head.appendChild(e);
  }
  return mr = document.createElement("div"), mr.id = cv, mr.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;pointer-events:none;overflow:visible;z-index:2147483640;", document.body.appendChild(mr), mr;
}
function Cv(e, t, r = {}) {
  const n = hv(), i = r.color ?? "#6366f1", s = `klav-ao-${pv++}`, a = 5, c = document.createElement("div");
  c.className = "klav-ao-halo", c.dataset.aoId = s, c.style.left = e.x - a + "px", c.style.top = e.y - a + "px", c.style.width = e.w + a * 2 + "px", c.style.height = e.h + a * 2 + "px", c.style.borderColor = i, c.style.boxShadow = `0 0 0 4px ${$c(i, 0.14)},0 0 24px ${$c(i, 0.18)}`, n.appendChild(c);
  let l = null;
  if (t) {
    const h = { x: e.x - a, y: e.y - a, w: e.w + a * 2, h: e.h + a * 2 }, { left: p, top: u, below: m } = uv(
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
      const b = x === "medium" ? " sev-m" : x === "low" ? " sev-l" : "", C = document.createElement("span");
      C.className = `klav-ao-sev${b}`, C.textContent = x, f.appendChild(C);
    }
    const v = document.createElement("button");
    v.className = "klav-ao-dismiss", v.textContent = "Dismiss", v.addEventListener("click", () => Md(s)), l.appendChild(f), l.appendChild(v), n.appendChild(l);
  }
  return mi.set(s, { halo: c, pin: l }), s;
}
function Md(e) {
  const t = mi.get(e);
  if (!t) return;
  mi.delete(e);
  const { halo: r, pin: n } = t;
  n ? (n.classList.add("is-out"), r.style.animation = "klav-ao-pin-out .22s ease-in forwards", setTimeout(() => {
    je(n), je(r);
  }, 240)) : je(r);
}
function Mv() {
  for (const e of [...mi.keys()]) Md(e);
}
let Go = Nr, yr = "";
const Td = { consoleErrors: [], networkFailures: [] };
let Xo, Rd, Vr = null;
function ln() {
  return Go.backendUrl || cu;
}
const fv = 15e3;
function Qn(e, t = {}, r = fv) {
  const n = new AbortController(), i = setTimeout(() => n.abort(), r);
  return fetch(e, { ...t, signal: n.signal }).finally(() => clearTimeout(i));
}
function Ad(e) {
  const t = {};
  for (const [r, n] of Object.entries(e))
    n != null && (t[String(r).slice(0, 64)] = String(n).slice(0, 1e3));
  return t;
}
async function Fc() {
  return ff(document.body, {
    filter: (e) => e.id !== "klavity-sdk-host"
  });
}
function mv() {
  return Rf(Td, { identity: Xo, metadata: Rd });
}
async function gv(e) {
  return xf(
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
      projectId: yr || void 0,
      replayEvents: e.replayEvents
    },
    Go,
    { backend: jm }
  );
}
function Ko(e = "bug") {
  const t = _m(e, {
    onCaptureFull: Fc,
    // #638: render the "Attach console logs" toggle (default OFF). Console errors ride the report only when
    // the reporter opts in (p.attachConsole) — parity with the widget's privacy-preserving default.
    consoleAttachToggle: !0,
    // Pre-compress each screenshot as it's captured (runs while the reporter types), same as the widget —
    // by submit time the promise is settled so there's zero compression delay before upload.
    compressImage: sl,
    // ── KLA-729 composer AI-assist (parity with widget.ts) — all best-effort, all resolve null on failure ──
    // KLAVITYKLA-241 pre-submit known-issue check: as the reporter types, ask the backend whether this
    // project already tracks a matching issue so they don't file a blind duplicate.
    onCheckKnown: async (r) => {
      try {
        const n = await Qn(ln() + "/api/widget/known-check", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ project: yr, text: r, url: location.href })
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
        const i = await Qn(ln() + "/api/report/clarity", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ projectId: yr, text: r, pageUrl: location.href, images: (n == null ? void 0 : n.images) ?? 0, client: is() })
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
        const i = await Qn(ln() + "/api/report/enhance", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            projectId: yr,
            text: r,
            pageUrl: location.href,
            shot: (n == null ? void 0 : n.shot) || "",
            annotations: (n == null ? void 0 : n.annotations) || null,
            annotationTexts: (n == null ? void 0 : n.annotationTexts) || [],
            picked: (n == null ? void 0 : n.picked) || null,
            images: (n == null ? void 0 : n.images) ?? 0,
            client: is()
          })
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
        n.append("projectId", yr), n.append("audio", r, "dictation.webm"), r.type && n.append("mime", r.type);
        const i = await Qn(ln() + "/api/voice/transcribe", { method: "POST", body: n });
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
        const r = new URL(ln() + "/api/voice/stream");
        return r.protocol = r.protocol === "https:" ? "wss:" : "ws:", r.searchParams.set("project", yr), r.toString();
      } catch {
        return;
      }
    })(),
    // KLAVITYKLA-438 "Record me": expose the button when the browser can screen-record, driving the
    // consent → record overlay from the shared sdk recorder (same as the widget).
    allowRecording: (() => {
      try {
        return bu();
      } catch {
        return !1;
      }
    })(),
    onRecord: (r) => pg({ onPhase: r }),
    // PX4 #425: allow non-image file attachments through the unified attach control (parity with widget).
    allowFileAttachments: !0,
    onSubmit: async (r) => {
      const n = await Promise.all(r.screenshots.map((a) => sl(a))), i = await Promise.all(n.map((a) => hg(a))), s = mv();
      return r.attachConsole !== !0 && (s.consoleErrors = []), gv({
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
        reporter: Xo,
        clientInfo: is(),
        referrer: typeof document < "u" && document.referrer || void 0,
        replayEvents: (Vr == null ? void 0 : Vr.getEvents()) ?? []
      });
    }
  });
  setTimeout(async () => {
    try {
      const r = await Fc();
      t.addScreenshot(r);
    } catch {
    }
  }, 200);
}
function yv() {
  if (typeof document > "u" || !document.body) return;
  let e = document.getElementById("klavity-sdk-host");
  e || (e = document.createElement("div"), e.id = "klavity-sdk-host", e.style.cssText = "display:none!important;position:fixed;width:0;height:0;pointer-events:none;", document.body.appendChild(e)), e.setAttribute("data-klavity-ui", "sdk");
}
function bv() {
  Af(Td, { consoleLevels: !0 });
}
function _d(e) {
  Xo = e ? Ad(e) : void 0;
}
function Id(e) {
  Rd = e ? Ad(e) : void 0;
}
function vv() {
  if (typeof document > "u" || document.getElementById("klavity-sdk-menu-anim")) return;
  const e = document.createElement("style");
  e.id = "klavity-sdk-menu-anim", e.textContent = Vm, (document.head || document.documentElement).appendChild(e);
}
function kv() {
  document.addEventListener("contextmenu", (e) => {
    if (mm(e.target)) return;
    e.preventDefault(), vv();
    const t = document.createElement("div");
    t.className = "klm-menu", t.style.cssText = "position:fixed;z-index:2147483647;width:200px;max-width:calc(100vw - 16px);border-radius:20px;overflow:hidden;font-family:system-ui,-apple-system,sans-serif;transform-origin:top left;padding:8px;display:flex;flex-direction:column;gap:7px;box-sizing:border-box;pointer-events:auto;background:radial-gradient(135% 90% at 50% -12%, rgba(139,92,246,.18), rgba(139,92,246,0) 55%), linear-gradient(180deg, rgba(250,247,240,.95), rgba(243,236,225,.96));border:1px solid rgba(255,255,255,.55);box-shadow:0 24px 60px -12px rgba(76,40,130,.32), 0 8px 22px rgba(99,102,241,.16), 0 1.5px 4px rgba(25,20,15,.10), inset 0 1px 0 rgba(255,255,255,.75);";
    const r = (d, o, h, p, u = {}) => {
      const m = Gm(document, { iconHtml: re(d), label: o, desc: h, primary: u.primary });
      return m.addEventListener("click", () => {
        a(), Ko(p);
      }), m;
    };
    t.appendChild(r("zap", "Report a Bug", "Snap the page and tell us what broke.", "bug", { primary: !0 })), t.appendChild(r("lightbulb", "Request a Feature", "Suggest something you'd love to see.", "feature")), t.style.left = e.clientX + "px", t.style.top = "-9999px", document.body.appendChild(t);
    const n = 8, i = Math.max(n, Math.min(e.clientX, window.innerWidth - t.offsetWidth - n)), s = Math.max(n, Math.min(e.clientY, window.innerHeight - t.offsetHeight - n));
    t.style.left = i + "px", t.style.top = s + "px";
    const a = () => {
      je(t), document.removeEventListener("click", c), document.removeEventListener("keydown", l, !0);
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
function Ld(e = {}) {
  if (Go = {
    ...Nr,
    ...e,
    jira: { ...Nr.jira, ...e.jira },
    linear: { ...Nr.linear, ...e.linear },
    github: { ...Nr.github, ...e.github },
    plane: { ...Nr.plane, ...e.plane }
  }, typeof e.projectId == "string" && (yr = e.projectId), bv(), yv(), kv(), !Vr)
    try {
      Vr = Ob(ir);
    } catch {
      Vr = null;
    }
}
typeof window < "u" && (window.KlavitySnap = { init: Ld, openModal: Ko, identify: _d, setMetadata: Id });
const Tv = { init: Ld, openModal: Ko, identify: _d, setMetadata: Id };
export {
  ni as KlavitySims,
  ni as SimsLive,
  Md as clearAnnotation,
  Mv as clearAnnotations,
  Tv as default,
  _d as identify,
  Ld as init,
  lv as installKlavitySims,
  Ko as openModal,
  Id as setMetadata,
  Cv as showAnnotation
};
