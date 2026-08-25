var Cu = Object.defineProperty;
var Eu = (e, t, r) => t in e ? Cu(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var Kr = (e, t, r) => Eu(e, typeof t != "symbol" ? t + "" : t, r);
function Mu(e, t) {
  return e[13] = 1, e[14] = t >> 8, e[15] = t & 255, e[16] = t >> 8, e[17] = t & 255, e;
}
const yl = 112, bl = 72, vl = 89, kl = 115;
let Yn;
function Ru() {
  const e = new Int32Array(256);
  for (let t = 0; t < 256; t++) {
    let r = t;
    for (let n = 0; n < 8; n++)
      r = r & 1 ? 3988292384 ^ r >>> 1 : r >>> 1;
    e[t] = r;
  }
  return e;
}
function Au(e) {
  let t = -1;
  Yn || (Yn = Ru());
  for (let r = 0; r < e.length; r++)
    t = Yn[(t ^ e[r]) & 255] ^ t >>> 8;
  return t ^ -1;
}
function Tu(e) {
  const t = e.length - 1;
  for (let r = t; r >= 4; r--)
    if (e[r - 4] === 9 && e[r - 3] === yl && e[r - 2] === bl && e[r - 1] === vl && e[r] === kl)
      return r - 3;
  return 0;
}
function Iu(e, t, r = !1) {
  const n = new Uint8Array(13);
  t *= 39.3701, n[0] = yl, n[1] = bl, n[2] = vl, n[3] = kl, n[4] = t >>> 24, n[5] = t >>> 16, n[6] = t >>> 8, n[7] = t & 255, n[8] = n[4], n[9] = n[5], n[10] = n[6], n[11] = n[7], n[12] = 1;
  const i = Au(n), o = new Uint8Array(4);
  if (o[0] = i >>> 24, o[1] = i >>> 16, o[2] = i >>> 8, o[3] = i & 255, r) {
    const l = Tu(e);
    return e.set(n, l), e.set(o, l + 13), e;
  } else {
    const l = new Uint8Array(4);
    l[0] = 0, l[1] = 0, l[2] = 0, l[3] = 9;
    const c = new Uint8Array(54);
    return c.set(e, 0), c.set(l, 33), c.set(n, 37), c.set(o, 50), c;
  }
}
const Lu = "AAlwSFlz", Ou = "AAAJcEhZ", _u = "AAAACXBI";
function Nu(e) {
  let t = e.indexOf(Lu);
  return t === -1 && (t = e.indexOf(Ou)), t === -1 && (t = e.indexOf(_u)), t;
}
const wl = "[modern-screenshot]", _t = typeof window < "u", Pu = _t && "Worker" in window, $u = _t && "atob" in window, Du = _t && "btoa" in window;
var gl;
const ys = _t ? (gl = window.navigator) == null ? void 0 : gl.userAgent : "", xl = ys.includes("Chrome"), fn = ys.includes("AppleWebKit") && !xl, bs = ys.includes("Firefox"), zu = (e) => e && "__CONTEXT__" in e, Fu = (e) => e.constructor.name === "CSSFontFaceRule", Uu = (e) => e.constructor.name === "CSSImportRule", Bu = (e) => e.constructor.name === "CSSLayerBlockRule", xt = (e) => e.nodeType === 1, Wr = (e) => typeof e.className == "object", Sl = (e) => e.tagName === "image", qu = (e) => e.tagName === "use", Dr = (e) => xt(e) && typeof e.style < "u" && !Wr(e), Wu = (e) => e.nodeType === 8, ju = (e) => e.nodeType === 3, Sr = (e) => e.tagName === "IMG", En = (e) => e.tagName === "VIDEO", Hu = (e) => e.tagName === "CANVAS", Vu = (e) => e.tagName === "TEXTAREA", Gu = (e) => e.tagName === "INPUT", Yu = (e) => e.tagName === "STYLE", Ku = (e) => e.tagName === "SCRIPT", Xu = (e) => e.tagName === "SELECT", Ju = (e) => e.tagName === "SLOT", Zu = (e) => e.tagName === "IFRAME", Qu = (...e) => console.warn(wl, ...e);
function ed(e) {
  var r;
  const t = (r = e == null ? void 0 : e.createElement) == null ? void 0 : r.call(e, "canvas");
  return t && (t.height = t.width = 1), !!t && "toDataURL" in t && !!t.toDataURL("image/webp").includes("image/webp");
}
const ls = (e) => e.startsWith("data:");
function Cl(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (_t && e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i) || !_t)
    return e;
  const r = Mn().implementation.createHTMLDocument(), n = r.createElement("base"), i = r.createElement("a");
  return r.head.appendChild(n), r.body.appendChild(i), t && (n.href = t), i.href = e, i.href;
}
function Mn(e) {
  return (e && xt(e) ? e == null ? void 0 : e.ownerDocument : e) ?? window.document;
}
const Rn = "http://www.w3.org/2000/svg";
function td(e, t, r) {
  const n = Mn(r).createElementNS(Rn, "svg");
  return n.setAttributeNS(null, "width", e.toString()), n.setAttributeNS(null, "height", t.toString()), n.setAttributeNS(null, "viewBox", `0 0 ${e} ${t}`), n;
}
function rd(e, t) {
  let r = new XMLSerializer().serializeToString(e);
  return t && (r = r.replace(/[\u0000-\u0008\v\f\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/gu, "")), `data:image/svg+xml;charset=utf-8,${encodeURIComponent(r)}`;
}
function nd(e, t) {
  return new Promise((r, n) => {
    const i = new FileReader();
    i.onload = () => r(i.result), i.onerror = () => n(i.error), i.onabort = () => n(new Error(`Failed read blob to ${t}`)), i.readAsDataURL(e);
  });
}
const id = (e) => nd(e, "dataUrl");
function vr(e, t) {
  const r = Mn(t).createElement("img");
  return r.decoding = "sync", r.loading = "eager", r.src = e, r;
}
function zr(e, t) {
  return new Promise((r) => {
    const { timeout: n, ownerDocument: i, onError: o, onWarn: l } = t ?? {}, c = typeof e == "string" ? vr(e, Mn(i)) : e;
    let a = null, p = null;
    function s() {
      r(c), a && clearTimeout(a), p == null || p();
    }
    if (n && (a = setTimeout(s, n)), En(c)) {
      const h = c.currentSrc || c.src;
      if (!h)
        return c.poster ? zr(c.poster, t).then(r) : s();
      if (c.readyState >= 2)
        return s();
      const d = s, u = (m) => {
        l == null || l(
          "Failed video load",
          h,
          m
        ), o == null || o(m), s();
      };
      p = () => {
        c.removeEventListener("loadeddata", d), c.removeEventListener("error", u);
      }, c.addEventListener("loadeddata", d, { once: !0 }), c.addEventListener("error", u, { once: !0 });
    } else {
      const h = Sl(c) ? c.href.baseVal : c.currentSrc || c.src;
      if (!h)
        return s();
      const d = async () => {
        if (Sr(c) && "decode" in c)
          try {
            await c.decode();
          } catch (m) {
            l == null || l(
              "Failed to decode image, trying to render anyway",
              c.dataset.originalSrc || h,
              m
            );
          }
        s();
      }, u = (m) => {
        l == null || l(
          "Failed image load",
          c.dataset.originalSrc || h,
          m
        ), s();
      };
      if (Sr(c) && c.complete)
        return d();
      p = () => {
        c.removeEventListener("load", d), c.removeEventListener("error", u);
      }, c.addEventListener("load", d, { once: !0 }), c.addEventListener("error", u, { once: !0 });
    }
  });
}
async function sd(e, t) {
  Dr(e) && (Sr(e) || En(e) ? await zr(e, t) : await Promise.all(
    ["img", "video"].flatMap((r) => Array.from(e.querySelectorAll(r)).map((n) => zr(n, t)))
  ));
}
const El = /* @__PURE__ */ (function() {
  let t = 0;
  const r = () => `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4);
  return () => (t += 1, `u${r()}${t}`);
})();
function Ml(e) {
  return e == null ? void 0 : e.split(",").map((t) => t.trim().replace(/"|'/g, "").toLowerCase()).filter(Boolean);
}
let fo = 0;
function od(e) {
  const t = `${wl}[#${fo}]`;
  return fo++, {
    // eslint-disable-next-line no-console
    time: (r) => e && console.time(`${t} ${r}`),
    // eslint-disable-next-line no-console
    timeEnd: (r) => e && console.timeEnd(`${t} ${r}`),
    warn: (...r) => e && Qu(...r)
  };
}
function ad(e) {
  return {
    cache: e ? "no-cache" : "force-cache"
  };
}
async function An(e, t) {
  return zu(e) ? e : ld(e, { ...t, autoDestruct: !0 });
}
async function ld(e, t) {
  var u, m;
  const { scale: r = 1, workerUrl: n, workerNumber: i = 1 } = t || {}, o = !!(t != null && t.debug), l = (t == null ? void 0 : t.features) ?? !0, c = e.ownerDocument ?? (_t ? window.document : void 0), a = ((u = e.ownerDocument) == null ? void 0 : u.defaultView) ?? (_t ? window : void 0), p = /* @__PURE__ */ new Map(), s = {
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
      requestInit: ad((m = t == null ? void 0 : t.fetch) == null ? void 0 : m.bypassingCache),
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
    log: od(o),
    node: e,
    ownerDocument: c,
    ownerWindow: a,
    dpi: r === 1 ? null : 96 * r,
    svgStyleElement: Rl(c),
    svgDefsElement: c == null ? void 0 : c.createElementNS(Rn, "defs"),
    svgStyles: /* @__PURE__ */ new Map(),
    defaultComputedStyles: /* @__PURE__ */ new Map(),
    workers: [
      ...Array.from({
        length: Pu && n && i ? i : 0
      })
    ].map(() => {
      try {
        const f = new Worker(n);
        return f.onmessage = async (g) => {
          var y, C, w, k;
          const { url: x, result: b } = g.data;
          b ? (C = (y = p.get(x)) == null ? void 0 : y.resolve) == null || C.call(y, b) : (k = (w = p.get(x)) == null ? void 0 : w.reject) == null || k.call(w, new Error(`Error receiving message from worker: ${x}`));
        }, f.onmessageerror = (g) => {
          var b, y;
          const { url: x } = g.data;
          (y = (b = p.get(x)) == null ? void 0 : b.reject) == null || y.call(b, new Error(`Error receiving message from worker: ${x}`));
        }, f;
      } catch (f) {
        return s.log.warn("Failed to new Worker", f), null;
      }
    }).filter(Boolean),
    fontFamilies: /* @__PURE__ */ new Map(),
    fontCssTexts: /* @__PURE__ */ new Map(),
    acceptOfImage: `${[
      ed(c) && "image/webp",
      "image/svg+xml",
      "image/*",
      "*/*"
    ].filter(Boolean).join(",")};q=0.8`,
    requests: p,
    drawImageCount: 0,
    tasks: [],
    features: l,
    isEnable: (f) => f === "restoreScrollPosition" ? typeof l == "boolean" ? !1 : l[f] ?? !1 : typeof l == "boolean" ? l : l[f] ?? !0,
    shadowRoots: []
  };
  s.log.time("wait until load"), await sd(e, { timeout: s.timeout, onWarn: s.log.warn }), s.log.timeEnd("wait until load");
  const { width: h, height: d } = cd(e, s);
  return s.width = h, s.height = d, s;
}
function Rl(e) {
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
function cd(e, t) {
  let { width: r, height: n } = t;
  if (xt(e) && (!r || !n)) {
    const i = e.getBoundingClientRect();
    r = r || i.width || Number(e.getAttribute("width")) || 0, n = n || i.height || Number(e.getAttribute("height")) || 0;
  }
  return { width: r, height: n };
}
async function ud(e, t) {
  const {
    log: r,
    timeout: n,
    drawImageCount: i,
    drawImageInterval: o
  } = t;
  r.time("image to canvas");
  const l = await zr(e, { timeout: n, onWarn: t.log.warn }), { canvas: c, context2d: a } = dd(e.ownerDocument, t), p = () => {
    try {
      a == null || a.drawImage(l, 0, 0, c.width, c.height);
    } catch (s) {
      t.log.warn("Failed to drawImage", s);
    }
  };
  if (p(), t.isEnable("fixSvgXmlDecode"))
    for (let s = 0; s < i; s++)
      await new Promise((h) => {
        setTimeout(() => {
          a == null || a.clearRect(0, 0, c.width, c.height), p(), h();
        }, s + o);
      });
  return t.drawImageCount = 0, r.timeEnd("image to canvas"), c;
}
function dd(e, t) {
  const { width: r, height: n, scale: i, backgroundColor: o, maximumCanvasSize: l } = t, c = e.createElement("canvas");
  c.width = Math.floor(r * i), c.height = Math.floor(n * i), c.style.width = `${r}px`, c.style.height = `${n}px`, l && (c.width > l || c.height > l) && (c.width > l && c.height > l ? c.width > c.height ? (c.height *= l / c.width, c.width = l) : (c.width *= l / c.height, c.height = l) : c.width > l ? (c.height *= l / c.width, c.width = l) : (c.width *= l / c.height, c.height = l));
  const a = c.getContext("2d");
  return a && o && (a.fillStyle = o, a.fillRect(0, 0, c.width, c.height)), { canvas: c, context2d: a };
}
function Al(e, t) {
  if (e.ownerDocument)
    try {
      const o = e.toDataURL();
      if (o !== "data:,")
        return vr(o, e.ownerDocument);
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
function pd(e, t) {
  var r;
  try {
    if ((r = e == null ? void 0 : e.contentDocument) != null && r.documentElement)
      return vs(e.contentDocument.documentElement, t);
  } catch (n) {
    t.log.warn("Failed to clone iframe", n);
  }
  return e.cloneNode(!1);
}
function hd(e) {
  const t = e.cloneNode(!1);
  return e.currentSrc && e.currentSrc !== e.src && (t.src = e.currentSrc, t.srcset = ""), t.loading === "lazy" && (t.loading = "eager"), t;
}
async function fd(e, t) {
  if (e.ownerDocument && !e.currentSrc && e.poster)
    return vr(e.poster, e.ownerDocument);
  const r = e.cloneNode(!1);
  r.crossOrigin = "anonymous", e.currentSrc && e.currentSrc !== e.src && (r.src = e.currentSrc);
  const n = r.ownerDocument;
  if (n) {
    let i = !0;
    if (await zr(r, { onError: () => i = !1, onWarn: t.log.warn }), !i)
      return e.poster ? vr(e.poster, e.ownerDocument) : r;
    r.currentTime = e.currentTime, await new Promise((l) => {
      r.addEventListener("seeked", l, { once: !0 });
    });
    const o = n.createElement("canvas");
    o.width = e.offsetWidth, o.height = e.offsetHeight;
    try {
      const l = o.getContext("2d");
      l && l.drawImage(r, 0, 0, o.width, o.height);
    } catch (l) {
      return t.log.warn("Failed to clone video", l), e.poster ? vr(e.poster, e.ownerDocument) : r;
    }
    return Al(o, t);
  }
  return r;
}
function md(e, t) {
  return Hu(e) ? Al(e, t) : Zu(e) ? pd(e, t) : Sr(e) ? hd(e) : En(e) ? fd(e, t) : e.cloneNode(!1);
}
function gd(e) {
  let t = e.sandbox;
  if (!t) {
    const { ownerDocument: r } = e;
    try {
      r && (t = r.createElement("iframe"), t.id = `__SANDBOX__${El()}`, t.width = "0", t.height = "0", t.style.visibility = "hidden", t.style.position = "fixed", r.body.appendChild(t), t.srcdoc = '<!DOCTYPE html><meta charset="UTF-8"><title></title><body>', e.sandbox = t);
    } catch (n) {
      e.log.warn("Failed to getSandBox", n);
    }
  }
  return t;
}
const yd = [
  "width",
  "height",
  "-webkit-text-fill-color"
], bd = [
  "stroke",
  "fill"
];
function Tl(e, t, r) {
  const { defaultComputedStyles: n } = r, i = e.nodeName.toLowerCase(), o = Wr(e) && i !== "svg", l = o ? bd.map((f) => [f, e.getAttribute(f)]).filter(([, f]) => f !== null) : [], c = [
    o && "svg",
    i,
    l.map((f, g) => `${f}=${g}`).join(","),
    t
  ].filter(Boolean).join(":");
  if (n.has(c))
    return n.get(c);
  const a = gd(r), p = a == null ? void 0 : a.contentWindow;
  if (!p)
    return /* @__PURE__ */ new Map();
  const s = p == null ? void 0 : p.document;
  let h, d;
  o ? (h = s.createElementNS(Rn, "svg"), d = h.ownerDocument.createElementNS(h.namespaceURI, i), l.forEach(([f, g]) => {
    d.setAttributeNS(null, f, g);
  }), h.appendChild(d)) : h = d = s.createElement(i), d.textContent = " ", s.body.appendChild(h);
  const u = p.getComputedStyle(d, t), m = /* @__PURE__ */ new Map();
  for (let f = u.length, g = 0; g < f; g++) {
    const x = u.item(g);
    yd.includes(x) || m.set(x, u.getPropertyValue(x));
  }
  return s.body.removeChild(h), n.set(c, m), m;
}
function Il(e, t, r) {
  var c;
  const n = /* @__PURE__ */ new Map(), i = [], o = /* @__PURE__ */ new Map();
  if (r)
    for (const a of r)
      l(a);
  else
    for (let a = e.length, p = 0; p < a; p++) {
      const s = e.item(p);
      l(s);
    }
  for (let a = i.length, p = 0; p < a; p++)
    (c = o.get(i[p])) == null || c.forEach((s, h) => n.set(h, s));
  function l(a) {
    const p = e.getPropertyValue(a), s = e.getPropertyPriority(a), h = a.lastIndexOf("-"), d = h > -1 ? a.substring(0, h) : void 0;
    if (d) {
      let u = o.get(d);
      u || (u = /* @__PURE__ */ new Map(), o.set(d, u)), u.set(a, [p, s]);
    }
    t.get(a) === p && !s || (d ? i.push(d) : n.set(a, [p, s]));
  }
  return n;
}
function vd(e, t, r, n) {
  var h, d, u, m;
  const { ownerWindow: i, includeStyleProperties: o, currentParentNodeStyle: l } = n, c = t.style, a = i.getComputedStyle(e), p = Tl(e, null, n);
  l == null || l.forEach((f, g) => {
    p.delete(g);
  });
  const s = Il(a, p, o);
  s.delete("transition-property"), s.delete("all"), s.delete("d"), s.delete("content"), r && (s.delete("position"), s.delete("margin-top"), s.delete("margin-right"), s.delete("margin-bottom"), s.delete("margin-left"), s.delete("margin-block-start"), s.delete("margin-block-end"), s.delete("margin-inline-start"), s.delete("margin-inline-end"), s.set("box-sizing", ["border-box", ""])), ((h = s.get("background-clip")) == null ? void 0 : h[0]) === "text" && t.classList.add("______background-clip--text"), xl && (s.has("font-kerning") || s.set("font-kerning", ["normal", ""]), (((d = s.get("overflow-x")) == null ? void 0 : d[0]) === "hidden" || ((u = s.get("overflow-y")) == null ? void 0 : u[0]) === "hidden") && ((m = s.get("text-overflow")) == null ? void 0 : m[0]) === "ellipsis" && e.scrollWidth === e.clientWidth && s.set("text-overflow", ["clip", ""]));
  for (let f = c.length, g = 0; g < f; g++)
    c.removeProperty(c.item(g));
  return s.forEach(([f, g], x) => {
    c.setProperty(x, f, g);
  }), s;
}
function kd(e, t) {
  (Vu(e) || Gu(e) || Xu(e)) && t.setAttribute("value", e.value);
}
const wd = [
  "::before",
  "::after"
  // '::placeholder', TODO
], xd = [
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
function Sd(e, t, r, n, i) {
  const { ownerWindow: o, svgStyleElement: l, svgStyles: c, currentNodeStyle: a } = n;
  if (!l || !o)
    return;
  function p(s) {
    var y;
    const h = o.getComputedStyle(e, s);
    let d = h.getPropertyValue("content");
    if (!d || d === "none")
      return;
    i == null || i(d), d = d.replace(/(')|(")|(counter\(.+\))/g, "");
    const u = [El()], m = Tl(e, s, n);
    a == null || a.forEach((C, w) => {
      m.delete(w);
    });
    const f = Il(h, m, n.includeStyleProperties);
    f.delete("content"), f.delete("-webkit-locale"), ((y = f.get("background-clip")) == null ? void 0 : y[0]) === "text" && t.classList.add("______background-clip--text");
    const g = [
      `content: '${d}';`
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
    let b = c.get(x);
    b || (b = [], c.set(x, b)), b.push(`.${u[0]}${s}`);
  }
  wd.forEach(p), r && xd.forEach(p);
}
const mo = /* @__PURE__ */ new Set([
  "symbol"
  // test/fixtures/svg.symbol.html
]);
async function go(e, t, r, n, i) {
  if (xt(r) && (Yu(r) || Ku(r)) || n.filter && !n.filter(r))
    return;
  mo.has(t.nodeName) || mo.has(r.nodeName) ? n.currentParentNodeStyle = void 0 : n.currentParentNodeStyle = n.currentNodeStyle;
  const o = await vs(r, n, !1, i);
  n.isEnable("restoreScrollPosition") && Cd(e, o), t.appendChild(o);
}
async function yo(e, t, r, n) {
  var o;
  let i = e.firstChild;
  xt(e) && e.shadowRoot && (i = (o = e.shadowRoot) == null ? void 0 : o.firstChild, r.shadowRoots.push(e.shadowRoot));
  for (let l = i; l; l = l.nextSibling)
    if (!Wu(l))
      if (xt(l) && Ju(l) && typeof l.assignedNodes == "function") {
        const c = l.assignedNodes();
        for (let a = 0; a < c.length; a++)
          await go(e, t, c[a], r, n);
      } else
        await go(e, t, l, r, n);
}
function Cd(e, t) {
  if (!Dr(e) || !Dr(t))
    return;
  const { scrollTop: r, scrollLeft: n } = e;
  if (!r && !n)
    return;
  const { transform: i } = t.style, o = new DOMMatrix(i), { a: l, b: c, c: a, d: p } = o;
  o.a = 1, o.b = 0, o.c = 0, o.d = 1, o.translateSelf(-n, -r), o.a = l, o.b = c, o.c = a, o.d = p, t.style.transform = o.toString();
}
function Ed(e, t) {
  const { backgroundColor: r, width: n, height: i, style: o } = t, l = e.style;
  if (r && l.setProperty("background-color", r, "important"), n && l.setProperty("width", `${n}px`, "important"), i && l.setProperty("height", `${i}px`, "important"), o)
    for (const c in o) l[c] = o[c];
}
const Md = /^[\w-:]+$/;
async function vs(e, t, r = !1, n) {
  var p, s, h, d;
  const { ownerDocument: i, ownerWindow: o, fontFamilies: l, onCloneEachNode: c } = t;
  if (i && ju(e))
    return n && /\S/.test(e.data) && n(e.data), i.createTextNode(e.data);
  if (i && o && xt(e) && (Dr(e) || Wr(e))) {
    const u = await md(e, t);
    if (t.isEnable("removeAbnormalAttributes")) {
      const y = u.getAttributeNames();
      for (let C = y.length, w = 0; w < C; w++) {
        const k = y[w];
        Md.test(k) || u.removeAttribute(k);
      }
    }
    const m = t.currentNodeStyle = vd(e, u, r, t);
    r && Ed(u, t);
    let f = !1;
    if (t.isEnable("copyScrollbar")) {
      const y = [
        (p = m.get("overflow-x")) == null ? void 0 : p[0],
        (s = m.get("overflow-y")) == null ? void 0 : s[0]
      ];
      f = y.includes("scroll") || (y.includes("auto") || y.includes("overlay")) && (e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth);
    }
    const g = (h = m.get("text-transform")) == null ? void 0 : h[0], x = Ml((d = m.get("font-family")) == null ? void 0 : d[0]), b = x ? (y) => {
      g === "uppercase" ? y = y.toUpperCase() : g === "lowercase" ? y = y.toLowerCase() : g === "capitalize" && (y = y[0].toUpperCase() + y.substring(1)), x.forEach((C) => {
        let w = l.get(C);
        w || l.set(C, w = /* @__PURE__ */ new Set()), y.split("").forEach((k) => w.add(k));
      });
    } : void 0;
    return Sd(
      e,
      u,
      f,
      t,
      b
    ), kd(e, u), En(e) || await yo(
      e,
      u,
      t,
      b
    ), await (c == null ? void 0 : c(u)), u;
  }
  const a = e.cloneNode(!1);
  return await yo(e, a, t), await (c == null ? void 0 : c(a)), a;
}
function Rd(e) {
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
function Ad(e) {
  const { url: t, timeout: r, responseType: n, ...i } = e, o = new AbortController(), l = r ? setTimeout(() => o.abort(), r) : void 0;
  return fetch(t, { signal: o.signal, ...i }).then((c) => {
    if (!c.ok)
      throw new Error("Failed fetch, not 2xx response", { cause: c });
    switch (n) {
      case "arrayBuffer":
        return c.arrayBuffer();
      case "dataUrl":
        return c.blob().then(id);
      case "text":
      default:
        return c.text();
    }
  }).finally(() => clearTimeout(l));
}
function Fr(e, t) {
  const { url: r, requestType: n = "text", responseType: i = "text", imageDom: o } = t;
  let l = r;
  const {
    timeout: c,
    acceptOfImage: a,
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
  n === "image" && (fn || bs) && e.drawImageCount++;
  let x = p.get(r);
  if (!x) {
    d && d instanceof RegExp && d.test(l) && (l += (/\?/.test(l) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
    const b = n.startsWith("font") && m && m.minify, y = /* @__PURE__ */ new Set();
    b && n.split(";")[1].split(",").forEach((S) => {
      g.has(S) && g.get(S).forEach((L) => y.add(L));
    });
    const C = b && y.size, w = {
      url: l,
      timeout: c,
      responseType: C ? "arrayBuffer" : i,
      headers: n === "image" ? { accept: a } : void 0,
      ...h
    };
    x = {
      type: n,
      resolve: void 0,
      reject: void 0,
      response: null
    }, x.response = (async () => {
      if (s && n === "image") {
        const k = await s(r);
        if (k)
          return k;
      }
      return !fn && r.startsWith("http") && f.length ? new Promise((k, S) => {
        f[p.size & f.length - 1].postMessage({ rawUrl: r, ...w }), x.resolve = k, x.reject = S;
      }) : Ad(w);
    })().catch((k) => {
      if (p.delete(r), n === "image" && u)
        return e.log.warn("Failed to fetch image base64, trying to use placeholder image", l), typeof u == "string" ? u : u(o);
      throw k;
    }), p.set(r, x);
  }
  return x.response;
}
async function Ll(e, t, r, n) {
  if (!Ol(e))
    return e;
  for (const [i, o] of Td(e, t))
    try {
      const l = await Fr(
        r,
        {
          url: o,
          requestType: n ? "image" : "text",
          responseType: "dataUrl"
        }
      );
      e = e.replace(Id(i), `$1${l}$3`);
    } catch (l) {
      r.log.warn("Failed to fetch css data url", i, l);
    }
  return e;
}
function Ol(e) {
  return /url\((['"]?)([^'"]+?)\1\)/.test(e);
}
const _l = /url\((['"]?)([^'"]+?)\1\)/g;
function Td(e, t) {
  const r = [];
  return e.replace(_l, (n, i, o) => (r.push([o, Cl(o, t)]), n)), r.filter(([n]) => !ls(n));
}
function Id(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
const Ld = [
  "background-image",
  "border-image-source",
  "-webkit-border-image",
  "-webkit-mask-image",
  "list-style-image"
];
function Od(e, t) {
  return Ld.map((r) => {
    const n = e.getPropertyValue(r);
    return !n || n === "none" ? null : ((fn || bs) && t.drawImageCount++, Ll(n, null, t, !0).then((i) => {
      !i || n === i || e.setProperty(
        r,
        i,
        e.getPropertyPriority(r)
      );
    }));
  }).filter(Boolean);
}
function _d(e, t) {
  if (Sr(e)) {
    const r = e.currentSrc || e.src;
    if (!ls(r))
      return [
        Fr(t, {
          url: r,
          imageDom: e,
          requestType: "image",
          responseType: "dataUrl"
        }).then((n) => {
          n && (e.srcset = "", e.dataset.originalSrc = r, e.src = n || "");
        })
      ];
    (fn || bs) && t.drawImageCount++;
  } else if (Wr(e) && !ls(e.href.baseVal)) {
    const r = e.href.baseVal;
    return [
      Fr(t, {
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
function Nd(e, t) {
  const { ownerDocument: r, svgDefsElement: n } = t, i = e.getAttribute("href") ?? e.getAttribute("xlink:href");
  if (!i)
    return [];
  const [o, l] = i.split("#");
  if (l) {
    const c = `#${l}`, a = t.shadowRoots.reduce(
      (p, s) => p ?? s.querySelector(`svg ${c}`),
      r == null ? void 0 : r.querySelector(`svg ${c}`)
    );
    if (o && e.setAttribute("href", c), n != null && n.querySelector(c))
      return [];
    if (a)
      return n == null || n.appendChild(a.cloneNode(!0)), [];
    if (o)
      return [
        Fr(t, {
          url: o,
          responseType: "text"
        }).then((p) => {
          n == null || n.insertAdjacentHTML("beforeend", p);
        })
      ];
  }
  return [];
}
function Nl(e, t) {
  const { tasks: r } = t;
  xt(e) && ((Sr(e) || Sl(e)) && r.push(..._d(e, t)), qu(e) && r.push(...Nd(e, t))), Dr(e) && r.push(...Od(e.style, t)), e.childNodes.forEach((n) => {
    Nl(n, t);
  });
}
async function Pd(e, t) {
  const {
    ownerDocument: r,
    svgStyleElement: n,
    fontFamilies: i,
    fontCssTexts: o,
    tasks: l,
    font: c
  } = t;
  if (!(!r || !n || !i.size))
    if (c && c.cssText) {
      const a = vo(c.cssText, t);
      n.appendChild(r.createTextNode(`${a}
`));
    } else {
      const a = Array.from(r.styleSheets).filter((u) => {
        try {
          return "cssRules" in u && !!u.cssRules.length;
        } catch (m) {
          return t.log.warn(`Error while reading CSS rules from ${u.href}`, m), !1;
        }
      }), p = r.implementation.createHTMLDocument(""), s = p.createElement("style");
      p.head.appendChild(s);
      const h = s.sheet;
      await Promise.all(
        a.flatMap((u) => Array.from(u.cssRules).map(async (m) => {
          if (Uu(m)) {
            const f = m.href;
            let g = "";
            try {
              g = await Fr(t, {
                url: f,
                requestType: "text",
                responseType: "text"
              });
            } catch (b) {
              t.log.warn(`Error fetch remote css import from ${f}`, b);
            }
            const x = g.replace(
              _l,
              (b, y, C) => b.replace(C, Cl(C, f))
            );
            for (const b of Dd(x))
              try {
                h.insertRule(b, h.cssRules.length);
              } catch (y) {
                t.log.warn("Error inserting rule from remote css import", { rule: b, error: y });
              }
          }
        }))
      ), h.cssRules.length && a.push(h);
      const d = [];
      a.forEach((u) => {
        cs(u.cssRules, d);
      }), d.filter((u) => {
        var m;
        return Fu(u) && Ol(u.style.getPropertyValue("src")) && ((m = Ml(u.style.getPropertyValue("font-family"))) == null ? void 0 : m.some((f) => i.has(f)));
      }).forEach((u) => {
        const m = u, f = o.get(m.cssText);
        f ? n.appendChild(r.createTextNode(`${f}
`)) : l.push(
          Ll(
            m.cssText,
            m.parentStyleSheet ? m.parentStyleSheet.href : null,
            t
          ).then((g) => {
            g = vo(g, t), o.set(m.cssText, g), n.appendChild(r.createTextNode(`${g}
`));
          })
        );
      });
    }
}
const $d = /(\/\*[\s\S]*?\*\/)/g, bo = /((@.*?keyframes [\s\S]*?){([\s\S]*?}\s*?)})/gi;
function Dd(e) {
  if (e == null)
    return [];
  const t = [];
  let r = e.replace($d, "");
  for (; ; ) {
    const o = bo.exec(r);
    if (!o)
      break;
    t.push(o[0]);
  }
  r = r.replace(bo, "");
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
const zd = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, Fd = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function vo(e, t) {
  const { font: r } = t, n = r ? r == null ? void 0 : r.preferredFormat : void 0;
  return n ? e.replace(Fd, (i) => {
    for (; ; ) {
      const [o, , l] = zd.exec(i) || [];
      if (!l)
        return "";
      if (l === n)
        return `src: ${o};`;
    }
  }) : e;
}
function cs(e, t = []) {
  for (const r of Array.from(e))
    Bu(r) ? t.push(...cs(r.cssRules)) : "cssRules" in r ? cs(r.cssRules, t) : t.push(r);
  return t;
}
const Ud = /\bx?link:?href\s*=\s*["'](?!data:)[^"']+["']/i;
function Bd(e) {
  return Ud.test(e.innerHTML);
}
async function qd(e, t) {
  const r = await An(e, t);
  if (xt(r.node) && Wr(r.node) && !Bd(r.node))
    return r.node;
  const {
    ownerDocument: n,
    log: i,
    tasks: o,
    svgStyleElement: l,
    svgDefsElement: c,
    svgStyles: a,
    font: p,
    progress: s,
    autoDestruct: h,
    onCloneNode: d,
    onEmbedNode: u,
    onCreateForeignObjectSvg: m
  } = r;
  i.time("clone node");
  const f = await vs(r.node, r, !0);
  if (l && n) {
    let C = "";
    a.forEach((w, k) => {
      C += `${w.join(`,
`)} {
  ${k}
}
`;
    }), l.appendChild(n.createTextNode(C));
  }
  i.timeEnd("clone node"), await (d == null ? void 0 : d(f)), p !== !1 && xt(f) && (i.time("embed web font"), await Pd(f, r), i.timeEnd("embed web font")), i.time("embed node"), Nl(f, r);
  const g = o.length;
  let x = 0;
  const b = async () => {
    for (; ; ) {
      const C = o.pop();
      if (!C)
        break;
      try {
        await C;
      } catch (w) {
        r.log.warn("Failed to run task", w);
      }
      s == null || s(++x, g);
    }
  };
  s == null || s(x, g), await Promise.all([...Array.from({ length: 4 })].map(b)), i.timeEnd("embed node"), await (u == null ? void 0 : u(f));
  const y = Wd(f, r);
  return c && y.insertBefore(c, y.children[0]), l && y.insertBefore(l, y.children[0]), h && Rd(r), await (m == null ? void 0 : m(y)), y;
}
function Wd(e, t) {
  const { width: r, height: n } = t, i = td(r, n, e.ownerDocument), o = i.ownerDocument.createElementNS(i.namespaceURI, "foreignObject");
  return o.setAttributeNS(null, "x", "0%"), o.setAttributeNS(null, "y", "0%"), o.setAttributeNS(null, "width", "100%"), o.setAttributeNS(null, "height", "100%"), o.append(e), i.appendChild(o), i;
}
async function jd(e, t) {
  var l;
  const r = await An(e, t), n = await qd(r), i = rd(n, r.isEnable("removeControlCharacter"));
  r.autoDestruct || (r.svgStyleElement = Rl(r.ownerDocument), r.svgDefsElement = (l = r.ownerDocument) == null ? void 0 : l.createElementNS(Rn, "defs"), r.svgStyles.clear());
  const o = vr(i, n.ownerDocument);
  return await ud(o, r);
}
async function Hd(e, t) {
  const r = await An(e, t), { log: n, quality: i, type: o, dpi: l } = r, c = await jd(r);
  n.time("canvas to data url");
  let a = c.toDataURL(o, i);
  if (["image/png", "image/jpeg"].includes(o) && l && $u && Du) {
    const [p, s] = a.split(",");
    let h = 0, d = !1;
    if (o === "image/png") {
      const y = Nu(s);
      y >= 0 ? (h = Math.ceil((y + 28) / 3) * 4, d = !0) : h = 33 / 3 * 4;
    } else o === "image/jpeg" && (h = 18 / 3 * 4);
    const u = s.substring(0, h), m = s.substring(h), f = window.atob(u), g = new Uint8Array(f.length);
    for (let y = 0; y < g.length; y++)
      g[y] = f.charCodeAt(y);
    const x = o === "image/png" ? Iu(g, l, d) : Mu(g, l), b = window.btoa(String.fromCharCode(...x));
    a = [p, ",", b, m].join("");
  }
  return n.timeEnd("canvas to data url"), a;
}
async function Vd(e, t) {
  return Hd(
    await An(e, { ...t, type: "image/png" })
  );
}
const Gd = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", Yd = 8e3, Kd = 16384, ko = 4096, Xd = 16e6, Jd = 500, Zd = 1e4, Kn = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z4kwAAAAASUVORK5CYII=", Pl = 600, Qd = 1200, ep = 24, tp = 1024, tt = 32, rp = 4, $l = 400, np = 0.985, ip = 250;
function Dl(e, t) {
  if (!e || e.startsWith("data:") || e.startsWith("blob:")) return !1;
  try {
    return new URL(e, t).origin !== t;
  } catch {
    return !1;
  }
}
function sp(e) {
  const t = e;
  if (!t || t.tagName !== "IMG") return !1;
  const r = t.currentSrc || t.src || "";
  return Dl(r, location.origin);
}
function op(e) {
  const t = e;
  if (!t || t.nodeType !== 1) return !1;
  const r = t.tagName;
  if (r === "SCRIPT" || r === "STYLE" || r === "NOSCRIPT" || r === "TEMPLATE" || r === "IFRAME" && Dl(t.src || "", location.origin)) return !0;
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
  const o = window.scrollX || window.pageXOffset || 0, l = window.scrollY || window.pageYOffset || 0;
  return i.right + o <= 0 || i.bottom + l <= 0;
}
function Xn(e) {
  try {
    console.warn(e);
  } catch {
  }
}
function wo(e) {
  return !e || e === "transparent" || e === "rgba(0, 0, 0, 0)";
}
function ap(e, t, r = 1) {
  try {
    const n = e.getBoundingClientRect(), i = Math.max(1, Math.ceil(Math.max(e.scrollWidth, e.clientWidth, n.width))), o = Math.max(1, Math.ceil(Math.max(e.scrollHeight, e.clientHeight, n.height))), l = Math.max(0.1, r), c = Math.min(ko / i, ko / o), a = Math.min(l, c, Math.sqrt(Xd / (i * o))), p = document.createElement("canvas");
    p.width = Math.max(1, Math.floor(i * a)), p.height = Math.max(1, Math.floor(o * a));
    const s = p.getContext("2d");
    if (!s) return { dataUrl: Kn, scale: 1 };
    s.scale(a, a), s.fillStyle = "#ffffff", s.fillRect(0, 0, i, o);
    const h = Date.now() + Jd;
    let d = 0;
    const u = () => d >= Zd || Date.now() >= h, m = (g, x = !1) => {
      var k;
      if (u() || (d++, !x && t && !t(g))) return;
      const b = getComputedStyle(g);
      if (b.display === "none" || b.visibility === "hidden" || Number(b.opacity) === 0) return;
      const y = g.getBoundingClientRect(), C = y.left - n.left, w = y.top - n.top;
      if (y.width > 0 && y.height > 0) {
        wo(b.backgroundColor) || (s.fillStyle = b.backgroundColor, s.fillRect(C, w, y.width, y.height));
        const S = parseFloat(b.borderTopWidth);
        S > 0 && b.borderTopStyle !== "none" && !wo(b.borderTopColor) && (s.strokeStyle = b.borderTopColor, s.lineWidth = S, s.strokeRect(C, w, y.width, y.height)), g.tagName === "IMG" && (s.fillStyle = "#f1f5f9", s.fillRect(C, w, y.width, y.height), s.strokeStyle = "#cbd5e1", s.lineWidth = 1, s.strokeRect(C, w, y.width, y.height));
      }
      for (const S of Array.from(g.childNodes)) {
        if (u()) break;
        if (S instanceof HTMLElement) {
          m(S);
          continue;
        }
        if (!(S.nodeType !== Node.TEXT_NODE || !((k = S.textContent) != null && k.trim())))
          try {
            const L = document.createRange();
            L.selectNodeContents(S);
            const N = L.getBoundingClientRect();
            if (N.width <= 0 || N.height <= 0) continue;
            s.save(), s.beginPath(), s.rect(N.left - n.left, N.top - n.top, N.width, N.height), s.clip(), s.fillStyle = b.color, s.font = `${b.fontStyle} ${b.fontWeight} ${b.fontSize} ${b.fontFamily}`, s.textBaseline = "top", s.fillText(S.textContent.trim(), N.left - n.left, N.top - n.top), s.restore();
          } catch {
          }
      }
    };
    m(e, !0);
    const f = p.toDataURL("image/png");
    return f.startsWith("data:image/png") ? { dataUrl: f, scale: a } : { dataUrl: Kn, scale: 1 };
  } catch {
    return { dataUrl: Kn, scale: 1 };
  }
}
function lp() {
  return new Promise((e) => {
    typeof requestAnimationFrame == "function" ? requestAnimationFrame(() => e()) : setTimeout(e, 16);
  });
}
function Jn(e, t) {
  return Promise.race([
    Promise.resolve(e).then(() => {
    }, () => {
    }),
    new Promise((r) => setTimeout(r, Math.max(0, t)))
  ]);
}
function cp(e) {
  if (!e || typeof e.querySelectorAll != "function") return [];
  const t = typeof window < "u" && window.innerWidth || 0, r = typeof window < "u" && window.innerHeight || 0, n = [];
  let i;
  try {
    i = e.querySelectorAll("img");
  } catch {
    return [];
  }
  for (let o = 0; o < i.length && n.length < ep; o++) {
    const l = i[o];
    if (!l || l.complete) continue;
    let c;
    try {
      c = l.getBoundingClientRect();
    } catch {
      continue;
    }
    c.bottom < 0 || c.right < 0 || c.top > r || c.left > t || n.push(l);
  }
  return n;
}
async function xo(e, t = Pl) {
  if (typeof document > "u") return;
  const r = Date.now() + Math.max(0, t), n = () => Math.max(0, r - Date.now());
  try {
    const i = document.fonts;
    i && i.status !== "loaded" && i.ready && typeof i.ready.then == "function" && await Jn(i.ready, n());
    const o = cp(e);
    o.length && await Jn(
      Promise.allSettled(o.map((l) => typeof l.decode == "function" ? l.decode() : Promise.resolve())),
      n()
    ), await Jn(lp(), Math.min(n(), 50));
  } catch {
  }
}
function zl(e, t) {
  return new Promise((r) => {
    if (typeof Image > "u") {
      r(null);
      return;
    }
    let n = !1;
    const i = new Image(), o = (c) => {
      n || (n = !0, r(c ? i : null));
    }, l = setTimeout(() => o(!1), Math.max(0, t));
    i.onload = () => {
      clearTimeout(l), o(!0);
    }, i.onerror = () => {
      clearTimeout(l), o(!1);
    };
    try {
      i.src = e;
    } catch {
      clearTimeout(l), o(!1);
    }
  });
}
async function up(e) {
  if (typeof document > "u") return null;
  const t = await zl(e, $l);
  if (!t) return null;
  let r;
  try {
    r = document.createElement("canvas");
  } catch {
    return null;
  }
  r.width = tt, r.height = tt;
  const n = r.getContext("2d");
  if (!n) return null;
  try {
    n.drawImage(t, 0, 0, tt, tt);
    const { data: i } = n.getImageData(0, 0, tt, tt);
    let o = 0, l = 0, c = 0;
    for (let p = 0; p < i.length; p += 4) {
      const s = i[p + 3] / 255, h = i[p] * s + 255 * (1 - s), d = i[p + 1] * s + 255 * (1 - s), u = i[p + 2] * s + 255 * (1 - s), m = 0.299 * h + 0.587 * d + 0.114 * u;
      l += m, c += m * m, o++;
    }
    if (!o) return null;
    const a = l / o;
    return c / o - a * a;
  } catch {
    return null;
  }
}
async function Zn(e) {
  if (!e || !e.startsWith("data:image/png")) return !0;
  const t = e.indexOf(","), r = t >= 0 ? e.slice(t + 1) : "";
  if (Math.floor(r.length * 3 / 4) <= tp) return !0;
  try {
    const i = await up(e);
    if (i !== null && i <= rp) return !0;
  } catch {
  }
  return !1;
}
async function dp(e) {
  if (typeof document > "u") return null;
  const t = await zl(e, $l);
  if (!t) return null;
  let r;
  try {
    r = document.createElement("canvas");
  } catch {
    return null;
  }
  r.width = tt, r.height = tt;
  const n = r.getContext("2d");
  if (!n) return null;
  try {
    n.drawImage(t, 0, 0, tt, tt);
    const { data: i } = n.getImageData(0, 0, tt, tt);
    let o = 0, l = 0;
    for (let c = 0; c < i.length; c += 4) {
      const a = i[c + 3] / 255, p = i[c] * a + 255 * (1 - a), s = i[c + 1] * a + 255 * (1 - a), h = i[c + 2] * a + 255 * (1 - a);
      0.299 * p + 0.587 * s + 0.114 * h >= ip && l++, o++;
    }
    return o ? l / o : null;
  } catch {
    return null;
  }
}
async function pp(e, t = {}) {
  if ((t.skippedImages ?? 0) > 0) return !0;
  try {
    const r = await dp(e);
    if (r !== null && r >= np) return !0;
  } catch {
  }
  return !1;
}
const hp = [
  "material icons",
  "material symbols",
  "fontawesome",
  "font awesome",
  "icomoon",
  "glyphicons",
  "ionicons"
], fp = /* @__PURE__ */ new Set([
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
function mp(e) {
  return ((e || "").split(",")[0] || "").trim().replace(/^['"]+|['"]+$/g, "").toLowerCase();
}
function gp(e) {
  const t = (e || "").toLowerCase();
  return hp.some((r) => t.includes(r));
}
const yp = /^[a-z0-9]+(?:[_-][a-z0-9]+)+$/i;
function bp(e) {
  const t = (e || "").trim();
  return !t || t.length > 40 || /\s/.test(t) ? !1 : yp.test(t);
}
function vp(e) {
  const t = (e.text || "").trim();
  if (!t) return !1;
  const r = e.fontFamily || "", n = mp(r);
  return e.embeddedFamilies && n && e.embeddedFamilies.has(n) ? !1 : !!(gp(r) || n && !fp.has(n) && t.includes("_") && bp(t));
}
function kp(e, t) {
  var r;
  try {
    if (!e || e.nodeType !== 1) return;
    const n = e;
    if (n.childElementCount > 0) return;
    const i = n.textContent || "";
    if (!i.trim()) return;
    const o = ((r = n.style) == null ? void 0 : r.fontFamily) || "";
    if (!o) return;
    vp({ fontFamily: o, text: i, embeddedFamilies: t }) && (n.textContent = "");
  } catch {
  }
}
const un = { cssText: "", embeddedFamilies: /* @__PURE__ */ new Set() }, wp = 3e3, xp = 4e3, So = 24, Co = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
async function Sp(e, t = xp) {
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
    return await new Promise((l) => {
      try {
        const c = new FileReader();
        c.onload = () => l(typeof c.result == "string" ? c.result : null), c.onerror = () => l(null), c.readAsDataURL(o);
      } catch {
        l(null);
      }
    });
  } catch {
    return null;
  } finally {
    n && clearTimeout(n);
  }
}
function Cp(e) {
  var n, i, o;
  const t = [];
  let r;
  try {
    r = e.styleSheets;
  } catch {
    return t;
  }
  for (let l = 0; l < r.length && t.length < So; l++) {
    let c = null;
    try {
      c = r[l].cssRules;
    } catch {
      continue;
    }
    if (c)
      for (let a = 0; a < c.length && t.length < So; a++) {
        const p = c[a];
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
function Ep(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Mp(e, t, r) {
  const n = new RegExp(`url\\(\\s*(['"]?)${Ep(t)}\\1\\s*\\)`, "g");
  return e.replace(n, `url("${r}")`);
}
async function Rp(e = {}) {
  const t = /* @__PURE__ */ new Set(), r = e.doc ?? (typeof document < "u" ? document : null), n = e.faces ?? (r ? Cp(r) : []);
  if (!n.length) return { cssText: "", embeddedFamilies: t };
  const i = e.baseUrl ?? (typeof location < "u" ? location.href : ""), o = e.fetchAsDataUrl ?? ((c) => Sp(c)), l = [];
  for (const c of n) {
    const a = [];
    Co.lastIndex = 0;
    let p;
    for (; (p = Co.exec(c.src)) !== null; ) {
      const u = p[2];
      u && !u.startsWith("data:") && a.push(u);
    }
    if (!a.length) {
      l.push(c.cssText), t.add(c.family.toLowerCase());
      continue;
    }
    let s = c.cssText, h = !1;
    const d = await Promise.all(a.map(async (u) => {
      let m = u;
      try {
        m = new URL(u, i).href;
      } catch {
      }
      return { rawUrl: u, dataUrl: await o(m) };
    }));
    for (const { rawUrl: u, dataUrl: m } of d)
      m && (s = Mp(s, u, m), h = !0);
    h && (l.push(s), t.add(c.family.toLowerCase()));
  }
  return { cssText: l.join(`
`), embeddedFamilies: t };
}
async function Ap() {
  try {
    return await Promise.race([
      Rp({}).catch(() => un),
      new Promise((e) => setTimeout(() => e(un), wp))
    ]);
  } catch {
    return un;
  }
}
function Tp(e, t) {
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
async function Ip(e, t = {}) {
  return (await Lp(e, t)).dataUrl;
}
async function Lp(e, t = {}) {
  let r = 0;
  const n = t.filter, i = typeof window < "u" && Number(window.devicePixelRatio) || 1, o = t.skipFonts ? 1 : Math.min(Math.max(i, 1), 2), l = t.pixelRatio ?? o, c = t.skipFonts ? un : await Ap(), a = t.width && t.height ? { width: t.width, height: t.height } : void 0, p = async () => {
    r = 0;
    const s = !t.skipFonts && c.cssText ? { cssText: c.cssText } : !1, h = await Tp(Vd(e, {
      scale: l,
      ...a ?? {},
      font: s,
      onCloneEachNode: (d) => kp(d, c.embeddedFamilies),
      maximumCanvasSize: Kd,
      fetch: { placeholderImage: Gd },
      filter: (d) => n && !n(d) || op(d) ? !1 : sp(d) ? (r++, !1) : !0
    }), Yd);
    if (!h.startsWith("data:image/png")) throw new Error("capture returned a non-PNG result");
    return h;
  };
  await xo(e, Pl);
  try {
    let s = await p(), h = await Zn(s);
    if (h) {
      await xo(e, Qd);
      try {
        const u = await p();
        await Zn(u) || (s = u, h = !1);
      } catch {
      }
    }
    r && Xn(`[Klavity] capture: omitted ${r} cross-origin image(s) the page's CSP/CORS blocks — captured the rest`), h && Xn("[Klavity] capture: DOM render came back blank after retry — caller may retake with the sharp path");
    const d = h ? !1 : await pp(s, { skippedImages: r });
    return { dataUrl: s, scale: l, quality: "rendered", blank: h, partial: d, skippedImages: r };
  } catch (s) {
    const h = s instanceof Error ? s.message : String(s);
    Xn(`[Klavity] capture: renderer unavailable (${h}); using fetch-free fallback`);
    const d = ap(e, n, l), u = await Zn(d.dataUrl);
    return { ...d, quality: "wireframe", blank: u, partial: !1, skippedImages: 0 };
  }
}
const Op = {
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
function _p(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function Y(e, t = {}) {
  const r = Op[e];
  if (!r)
    return console.warn("[Klavity] unknown icon: " + e), "";
  const n = t.size ?? 18, i = t.class ? `icon ${t.class}` : "icon", o = t.label ? 'role="img"' : 'aria-hidden="true"', l = t.label ? `<title>${_p(t.label)}</title>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" class="${i}" width="${n}" height="${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" ${o}>${l}${r}</svg>`;
}
const ur = {
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
class Eo {
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
  drawShape(t, r) {
    if (t.strokeStyle = r.color, t.fillStyle = r.color, t.lineWidth = this.computeLineWidth(), t.lineCap = "round", r.type === "pen")
      t.beginPath(), r.points.forEach(
        (n, i) => i === 0 ? t.moveTo(n.x, n.y) : t.lineTo(n.x, n.y)
      ), t.stroke();
    else if (r.type === "rect")
      t.strokeRect(r.x, r.y, r.w, r.h);
    else if (r.type === "arrow") {
      const n = this.computeLineWidth() * 1.7;
      t.lineWidth = n;
      const i = Math.atan2(r.y2 - r.y1, r.x2 - r.x1), o = Math.max(16, n * 4);
      t.beginPath(), t.moveTo(r.x1, r.y1), t.lineTo(r.x2, r.y2), t.lineTo(
        r.x2 - o * Math.cos(i - Math.PI / 6),
        r.y2 - o * Math.sin(i - Math.PI / 6)
      ), t.moveTo(r.x2, r.y2), t.lineTo(
        r.x2 - o * Math.cos(i + Math.PI / 6),
        r.y2 - o * Math.sin(i + Math.PI / 6)
      ), t.stroke();
    } else if (r.type === "line")
      t.lineWidth = this.computeLineWidth() * 1.7, t.beginPath(), t.moveTo(r.x1, r.y1), t.lineTo(r.x2, r.y2), t.stroke();
    else if (r.type === "circle")
      t.beginPath(), t.ellipse(r.x, r.y, Math.abs(r.rx), Math.abs(r.ry), 0, 0, Math.PI * 2), t.stroke();
    else if (r.type === "count") {
      const n = Math.max(13, this.computeFontSize());
      t.beginPath(), t.arc(r.x, r.y, n, 0, Math.PI * 2), t.fill(), t.fillStyle = "#fff", t.font = `bold ${Math.round(n * 1.05)}px sans-serif`, t.textAlign = "center", t.textBaseline = "middle", t.fillText(String(r.n), r.x, r.y), t.textAlign = "start", t.textBaseline = "alphabetic";
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
    const n = Math.max(0, Math.floor(Math.min(r.x, r.x + r.w))), i = Math.max(0, Math.floor(Math.min(r.y, r.y + r.h))), o = Math.min(this.canvas.width - n, Math.ceil(Math.abs(r.w))), l = Math.min(this.canvas.height - i, Math.ceil(Math.abs(r.h)));
    if (o <= 0 || l <= 0) return;
    const c = Math.max(8, Math.round(this.canvas.width / 90));
    let a;
    try {
      a = t.getImageData(n, i, o, l);
    } catch {
      a = void 0;
    }
    if (!a || !a.data) {
      t.fillStyle = "rgba(30,30,40,1)", t.fillRect(n, i, o, l);
      return;
    }
    const p = a.data;
    for (let s = 0; s < l; s += c)
      for (let h = 0; h < o; h += c) {
        let d = 0, u = 0, m = 0, f = 0;
        const g = Math.min(s + c, l), x = Math.min(h + c, o);
        for (let b = s; b < g; b++)
          for (let y = h; y < x; y++) {
            const C = (b * o + y) * 4;
            d += p[C], u += p[C + 1], m += p[C + 2], f++;
          }
        f && (t.fillStyle = `rgb(${Math.round(d / f)},${Math.round(u / f)},${Math.round(m / f)})`, t.fillRect(n + h, i + s, x - h, g - s));
      }
  }
  async save() {
    const t = this.canvas.toDataURL("image/png");
    return t.length > 5 * 1024 * 1024 ? this.canvas.toDataURL("image/jpeg", 0.85) : t;
  }
}
async function Np(e, t, r) {
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
const Pp = 50, $p = 2e3, Dp = 1e3, zp = 500, Mo = /^(?:token|access_token|refresh_token|api[_-]?key|apikey|key|secret|password|passwd|pwd|auth|authorization|session|sid|jwt|code|otp)$/i;
function Xr(e, t) {
  e.push(t), e.length > Pp && e.shift();
}
function ks(e, t) {
  return e.length <= t ? e : e.slice(0, t) + "…[truncated]";
}
function Qn(e) {
  let t = String(e || "");
  try {
    const r = new URL(t, typeof location < "u" ? location.href : "http://localhost");
    let n = !1;
    r.searchParams.forEach((i, o) => {
      Mo.test(o) && (r.searchParams.set(o, "REDACTED"), n = !0);
    }), n && (t = r.toString());
  } catch {
    t = t.replace(/([?&])([^=&]+)=([^&]*)/g, (r, n, i, o) => Mo.test(i) ? `${n}${i}=REDACTED` : r);
  }
  return ks(t, Dp);
}
function Fp(e) {
  if (typeof e == "string") return e;
  if (e instanceof Error) return e.message;
  try {
    return ks(JSON.stringify(e), zp);
  } catch {
    return String(e);
  }
}
function Up(e, t = {}) {
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
function Bp(e, t = {}) {
  if (typeof window > "u") return e;
  const r = window;
  if (r.__klavityCaptureInstalled) return e;
  r.__klavityCaptureInstalled = !0;
  const n = () => t.isContextValid ? t.isContextValid() : !0, i = (a, p, s) => {
    Xr(e.consoleErrors, { message: ks(p, $p), stack: s, timestamp: Date.now(), level: a });
  }, o = window.onerror;
  if (window.onerror = (a, p, s, h, d) => {
    var u;
    if (n()) {
      const m = String(a);
      i("error", m, d == null ? void 0 : d.stack), (u = t.onError) == null || u.call(t, m, d == null ? void 0 : d.stack);
    }
    return typeof o == "function" ? o.call(window, a, p, s, h, d) : !1;
  }, window.addEventListener("unhandledrejection", (a) => {
    var h;
    if (!n()) return;
    const p = a.reason, s = String((p == null ? void 0 : p.message) ?? p);
    i("error", s, p == null ? void 0 : p.stack), (h = t.onError) == null || h.call(t, s, p == null ? void 0 : p.stack);
  }), t.consoleLevels) {
    const a = ["log", "info", "warn", "error"];
    for (const p of a) {
      const s = console[p];
      typeof s == "function" && (console[p] = (...h) => {
        try {
          n() && i(p, h.map(Fp).join(" "));
        } catch {
        }
        return s.apply(console, h);
      });
    }
  }
  const l = window.fetch;
  window.fetch = async (...a) => {
    var d;
    if (!n()) return l(...a);
    const p = Date.now(), s = typeof a[0] == "string" ? a[0] : a[0] instanceof URL ? a[0].href : a[0].url, h = (typeof a[0] == "object" && a[0] && "method" in a[0] ? a[0].method : (d = a[1]) == null ? void 0 : d.method) || "GET";
    try {
      const u = await l(...a);
      return Xr(e.networkFailures, { url: Qn(s), status: u.status, method: String(h).toUpperCase(), timestamp: p, durationMs: Date.now() - p }), u;
    } catch (u) {
      throw Xr(e.networkFailures, { url: Qn(s), status: 0, method: String(h).toUpperCase(), timestamp: p, durationMs: Date.now() - p }), u;
    }
  };
  const c = window.XMLHttpRequest;
  if (c && c.prototype) {
    const a = c.prototype.open, p = c.prototype.send;
    c.prototype.open = function(s, h, ...d) {
      return this.__klav = { method: String(s || "GET").toUpperCase(), url: String(h || "") }, a.call(this, s, h, ...d);
    }, c.prototype.send = function(...s) {
      const h = this.__klav;
      if (h && n()) {
        const d = Date.now();
        this.addEventListener("loadend", () => {
          try {
            Xr(e.networkFailures, {
              url: Qn(h.url),
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
const qp = ["light", "dark", "glass", "neon", "custom", "liquid"], Wp = ["hidden", "icon", "full", "custom"], jp = ["lightbulb", "bug"], Hp = ["full", "reportOnly", "off"], Vp = /^#[0-9a-fA-F]{3,8}$/, Gp = /^[\w \-,'"().]+$/, Ro = (e) => typeof e == "object" && e !== null, Jr = (e) => typeof e == "string" && Vp.test(e.trim()) ? e.trim() : void 0, Zr = (e, t) => typeof e == "string" && e.trim() ? e.trim().slice(0, t) : void 0, Yp = (e) => {
  if (typeof e != "string") return;
  const t = e.trim().slice(0, 120);
  return t && Gp.test(t) ? t : void 0;
}, Ao = {
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
function To(e) {
  let t = e.replace("#", "");
  t.length === 3 && (t = t.split("").map((l) => l + l).join(""));
  const r = parseInt(t.slice(0, 6), 16), n = r >> 16 & 255, i = r >> 8 & 255, o = r & 255;
  return 0.299 * n + 0.587 * i + 0.114 * o;
}
function Fl(e) {
  const t = Ro(e) ? e : {}, n = { theme: typeof t.theme == "string" && qp.includes(t.theme) ? t.theme : "light" }, i = Jr(t.primary), o = Jr(t.secondary), l = Jr(t.background), c = Zr(t.thankYou, 140), a = Yp(t.font);
  i && (n.primary = i), o && (n.secondary = o), l && (n.background = l), a && (n.font = a), c && (n.thankYou = c), typeof t.launcherMode == "string" && Wp.includes(t.launcherMode) && (n.launcherMode = t.launcherMode);
  const p = Zr(t.launcherText, 60);
  p && (n.launcherText = p);
  const s = Jr(t.launcherIconColor);
  s && (n.launcherIconColor = s), typeof t.launcherIcon == "string" && jp.includes(t.launcherIcon) && (n.launcherIcon = t.launcherIcon), typeof t.rightClickMode == "string" && Hp.includes(t.rightClickMode) && (n.rightClickMode = t.rightClickMode), t.maskNumbers === !0 && (n.maskNumbers = !0), t.reportClarity === !0 ? n.reportClarity = !0 : t.reportClarity === !1 && (n.reportClarity = !1), t.preSubmitNudge === !1 ? n.preSubmitNudge = !1 : t.preSubmitNudge === !0 && (n.preSubmitNudge = !0), t.debug === !0 && (n.debug = !0), t.submitTargetToggle === !1 ? n.submitTargetToggle = !1 : t.submitTargetToggle === !0 && (n.submitTargetToggle = !0);
  const h = Zr(t.projectDisplayName, 60);
  h && (n.projectDisplayName = h);
  const d = Ro(t.agency_branding) ? t.agency_branding : {};
  (t.whiteLabel === !0 || d.whiteLabel === !0) && (n.whiteLabel = !0);
  const u = Zr(t.projectId, 200);
  return u && (n.projectId = u), (t.attributionMedium === "extension" || t.attributionMedium === "widget") && (n.attributionMedium = t.attributionMedium), n;
}
function Kp(e) {
  const t = Fl(e), r = t.theme === "custom" ? { ...Ao.light } : { ...Ao[t.theme] };
  if (t.theme === "custom" && (t.primary && (r["--kl-accent"] = t.primary), t.secondary && (r["--kl-accent2"] = t.secondary), t.background)) {
    r["--kl-bg"] = t.background;
    const i = To(t.background) < 140;
    r["--kl-fg"] = i ? "#f4f4f7" : "#1d1d24", r["--kl-muted"] = i ? "rgba(255,255,255,.6)" : "#706560", r["--kl-border"] = i ? "rgba(255,255,255,.16)" : "#e6e6ec", r["--kl-chip"] = i ? "rgba(255,255,255,.08)" : "#f4f4f7", r["--kl-input-bg"] = i ? "rgba(255,255,255,.05)" : "#fafafb";
  }
  return t.font && (r["--kl-font"] = t.font), t.theme === "dark" || t.theme === "neon" || t.theme === "glass" || t.theme === "liquid" || t.theme === "custom" && t.background && To(t.background) < 140, r["--kl-img-outline"] = "var(--kl-img-outline-val, color-mix(in srgb, var(--kl-fg) 10%, transparent))", r["--kl-glow"] = "radial-gradient(120% 80% at 50% -10%, color-mix(in srgb, var(--kl-accent) 12%, transparent), transparent 60%), radial-gradient(80% 60% at 100% 110%, color-mix(in srgb, var(--kl-accent2) 6%, transparent), transparent 60%)", `:host{${Object.entries(r).map(([i, o]) => `${i}:${o};`).join("")}}`;
}
const ze = class ze {
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
    this._recording || !ze.isSupported() || (this._recording = !0, this._stopping = !1, this._stopFired = !1, this._showedReconnecting = !1, this._consecFailures = 0, this._timer = setTimeout(() => this.stop(), ze.SESSION_MS), this._begin());
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
      if (i && i in ze.TERMINAL_ERRORS) {
        this.onError(i, ze.TERMINAL_ERRORS[i]), this._teardown();
        return;
      }
      i && i !== "no-speech" && (this._consecFailures++, this._showedReconnecting || (this._showedReconnecting = !0, this.onStatus("retrying", "Reconnecting voice…")));
    }, r.onend = () => {
      if (this._recognition = null, this._stopping || !this._recording) {
        this._emitStop();
        return;
      }
      if (this._consecFailures > ze.MAX_CONSEC_FAILURES) {
        this.onError("network", "Voice disconnected — tap Voice to try again"), this._teardown();
        return;
      }
      const n = this._consecFailures === 0 ? ze.BENIGN_RESTART_MS : Math.min(ze.MAX_BACKOFF_MS, ze.BASE_BACKOFF_MS * 2 ** (this._consecFailures - 1));
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
ze.MAX_CONSEC_FAILURES = 6, ze.BASE_BACKOFF_MS = 400, ze.MAX_BACKOFF_MS = 8e3, ze.BENIGN_RESTART_MS = 250, ze.SESSION_MS = 18e4, ze.TERMINAL_ERRORS = {
  "not-allowed": "Microphone access was denied",
  "service-not-allowed": "Microphone access was denied",
  "audio-capture": "No microphone was found"
};
let _r = ze;
function Xp() {
  const t = globalThis.MediaRecorder;
  return {
    getUserMedia: (r) => navigator.mediaDevices.getUserMedia(r),
    MediaRecorder: t,
    isTypeSupported: (r) => !!(t && t.isTypeSupported && t.isTypeSupported(r)),
    setTimeout: (r, n) => setTimeout(r, n),
    clearTimeout: (r) => clearTimeout(r)
  };
}
const Jp = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
function Zp(e) {
  for (const t of Jp)
    if (e.isTypeSupported(t)) return t;
  return null;
}
const br = class br {
  constructor(t) {
    this.onTranscript = (r) => {
    }, this.onError = (r, n) => {
    }, this.onStatus = (r, n) => {
    }, this.onStop = () => {
    }, this.onUnavailable = () => {
    }, this._recording = !1, this._stream = null, this._recorder = null, this._chunks = [], this._segTimer = null, this._sessTimer = null, this._mime = null, this._firstSegment = !0, this._transcribe = t.transcribe, this._deps = { ...Xp(), ...t.deps || {} };
  }
  // Feature-detect: mic capture + MediaRecorder. False on iOS Safari / anywhere without MediaRecorder.
  static isSupported(t = {}) {
    const r = typeof navigator < "u" ? navigator.mediaDevices : void 0, n = !!(t.getUserMedia || r && typeof r.getUserMedia == "function"), i = t.MediaRecorder ?? globalThis.MediaRecorder;
    return n && typeof i < "u";
  }
  async start() {
    if (!this._recording) {
      this._recording = !0, this._firstSegment = !0;
      try {
        this._stream = await this._deps.getUserMedia({ audio: { echoCancellation: !0, noiseSuppression: !0 } });
      } catch (t) {
        this._recording = !1;
        const r = (t == null ? void 0 : t.name) === "NotAllowedError" || (t == null ? void 0 : t.name) === "SecurityError";
        this.onError(r ? "not-allowed" : "mic-error", r ? "Microphone access was denied" : "Could not access the microphone"), this.onStop();
        return;
      }
      this._mime = Zp(this._deps);
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
        t != null && t.data && t.data.size && this._chunks.push(t.data);
      }, this._recorder.onstop = () => {
        this._flushSegment();
      }, this._sessTimer = this._deps.setTimeout(() => this.stop(), br.MAX_SESSION_MS), this._beginSegment();
    }
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
      }, br.SEGMENT_MS);
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
        const l = (o.text || "").trim();
        l && this.onTranscript(l);
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
br.SEGMENT_MS = 5e3, br.MAX_SESSION_MS = 18e4;
let mn = br;
function Qp(e) {
  return e.hasEndpoint && e.mediaRecorderSupported ? "server" : e.webSpeechSupported ? "webspeech" : "none";
}
function Le(e) {
  try {
    e && e.parentNode && e.parentNode.removeChild(e);
  } catch {
  }
}
const eh = /* @__PURE__ */ new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"]);
function qt(e) {
  const t = [], r = [], n = document.createTreeWalker(e, NodeFilter.SHOW_TEXT, {
    acceptNode(l) {
      let c = l.parentElement;
      for (; c && c !== e; ) {
        if (eh.has(c.tagName)) return NodeFilter.FILTER_REJECT;
        c = c.parentElement;
      }
      return /\d/.test(l.textContent ?? "") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  }), i = [];
  let o;
  for (; o = n.nextNode(); ) i.push(o);
  for (const l of i) {
    const a = (l.textContent ?? "").split(/(\d+)/);
    if (a.length <= 1) continue;
    const p = l.parentNode, s = l.nextSibling, h = a.map((d, u) => {
      if (u % 2 === 1) {
        const m = document.createElement("span");
        return m.style.cssText = "background:#111;color:transparent;border-radius:2px;", m.textContent = d, m;
      }
      return document.createTextNode(d);
    });
    Le(l);
    for (const d of h) p.insertBefore(d, s);
    t.push({ parent: p, original: l, replacements: h });
  }
  return e.querySelectorAll("input, select").forEach((l) => {
    const c = l.value;
    /\d/.test(c) && (r.push({ el: l, original: c }), l.value = "█".repeat(c.length));
  }), () => {
    for (const { parent: l, original: c, replacements: a } of t) {
      const p = a[0];
      if ((p == null ? void 0 : p.parentNode) === l) {
        l.insertBefore(c, p);
        for (const s of a) s.parentNode === l && Le(s);
      }
    }
    for (const { el: l, original: c } of r)
      l.value = c;
  };
}
const Ul = [
  "not working",
  "doesn't work",
  "does not work",
  "doesnt work",
  "broken",
  "pls fix",
  "please fix",
  "fix it",
  "help"
], th = /\b(when i|steps?|click|clicked|clicking|tap|tapped|then|go to|navigate|reload|refresh|press|select|enter)\b/i, rh = /(https?:\/\/|\s\/[a-z0-9]|^\/[a-z0-9])/i, nh = /\b(expected?|should|instead|supposed to|meant to|i wanted)\b/i, ih = /* @__PURE__ */ new Set([
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
]), sh = { needs: "Needs detail", good: "Good", great: "Great" };
function oh(e) {
  let t = e;
  for (const r of Ul) t = t.split(r).join(" ");
  return t;
}
function ah(e) {
  const t = e.split(/[^a-z0-9]+/i).filter(Boolean);
  let r = 0;
  for (const n of t)
    n.length < 3 || ih.has(n) || r++;
  return r;
}
function Bl(e) {
  const t = (e || "").trim(), r = t.toLowerCase(), n = oh(r), i = ah(n), o = t.length > 0 && Ul.some((d) => r.includes(d)) && i < 3, l = i >= 3 && t.length >= 12, c = nh.test(r), a = th.test(r) || rh.test(t), p = { problem: l, expected: c, repro: a }, s = (l ? 1 : 0) + (c ? 1 : 0) + (a ? 1 : 0), h = s >= 3 ? "great" : s === 2 ? "good" : "needs";
  return { score: s, coverage: p, level: h, label: sh[h], vague: o };
}
function lh(e) {
  const t = (e || "").trim();
  return t.length <= 15 ? !1 : Bl(t).level !== "great";
}
const ch = [
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
function uh(e) {
  const t = (e || "").toLowerCase();
  return t ? ch.some((r) => t.includes(r)) : !1;
}
function dh(e) {
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
function ph(e, t) {
  let r;
  try {
    r = new URL(e);
  } catch {
    return e;
  }
  const n = [
    ["utm_source", dh(t.source)],
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
function hh(e) {
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
function fh(e, t, r) {
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
function at(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function Io(e) {
  let t = at(String(e ?? ""));
  return t = t.replace(/`([^`\n]+)`/g, (r, n) => `<span class="kl-mk">\`</span><code>${n}</code><span class="kl-mk">\`</span>`), t = t.replace(/\*([^*\n]+)\*/g, (r, n) => `<span class="kl-mk">*</span><b>${n}</b><span class="kl-mk">*</span>`), t = t.replace(/_([^_\n]+)_/g, (r, n) => `<span class="kl-mk">_</span><i>${n}</i><span class="kl-mk">_</span>`), t = t.replace(/~([^~\n]+)~/g, (r, n) => `<span class="kl-mk">~</span><s>${n}</s><span class="kl-mk">~</span>`), t = t.replace(/\n/g, "<br>"), t;
}
function Lo(e) {
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
function mh(e) {
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
function Oo(e) {
  const t = /^fb_([0-9a-f]{8})[0-9a-f-]+$/i.exec(e);
  return t ? "fb_" + t[1] : e;
}
function _o(e) {
  if (!e) return "";
  try {
    const t = new URL(e);
    return t.protocol === "https:" || t.protocol === "http:" ? t.href : "";
  } catch {
    return "";
  }
}
function kt(e) {
  return typeof e == "string" ? { dataUrl: e } : { dataUrl: e.dataUrl, quality: e.quality, suggestSharp: e.suggestSharp };
}
function gh(e) {
  return e.screenCaptureDefault && typeof e.onCaptureSharp == "function" ? "screen" : typeof e.onCaptureViewport == "function" ? "viewport" : typeof e.onCaptureFull == "function" ? "full" : "none";
}
function yh(e) {
  const t = e && typeof e == "object" && "name" in e ? String(e.name) : "";
  return t === "NotAllowedError" || t === "AbortError" || t === "NotFoundError" || t === "InvalidStateError";
}
const bh = {
  "real-pixel": { label: "Sharp", iconName: "check-circle", degraded: !1 },
  rendered: { label: "Rendered", iconName: "image", degraded: !0 },
  wireframe: { label: "Wireframe", iconName: "triangle-alert", degraded: !0 }
};
function ql(e) {
  return (e.type || "").toLowerCase().startsWith("video/") || /\.(mp4|m4v|mov|webm|avi|mkv|ogv|3gp)$/i.test(e.name || "");
}
function vh(e) {
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
const kh = "image/*,.heic,.heif,video/*,.pdf,.log,.har,.txt,.json,.csv,.zip,.xml,.yml,.yaml", wh = 100, xh = wh * 1024 * 1024;
function Sh(e) {
  return (e.type || "").toLowerCase().startsWith("image/") || /\.(heic|heif|png|jpe?g|gif|webp|bmp|avif|svg)$/i.test(e.name || "");
}
function lr(e) {
  return ql(e) ? "video" : Sh(e) ? "image" : "file";
}
function Ch(e, t) {
  if (e.size <= t.capBytes) return { overCap: !1 };
  const r = Math.round(t.capBytes / 1024 / 1024), n = t.role === "owner" || t.role === "admin" || t.role === "member", o = `${e.name ? `"${e.name}"` : "This file"} is over the ${r}MB limit on your plan.`, l = n ? { kind: "upgrade", label: "Upgrade for larger uploads", url: t.upgradeUrl } : { kind: "ask-team", label: "Ask your team to upgrade — or attach a smaller file" };
  return { overCap: !0, message: o, cta: l };
}
function ei(e) {
  return e == null || typeof e != "number" || !isFinite(e) ? null : Math.max(0, Math.min(100, Math.round(e)));
}
function Eh(e, t, r = {}) {
  var io, so, oo, ao;
  const n = Fl(r);
  let i = !!n.maskNumbers;
  const o = document.createElement("div");
  o.setAttribute("data-klavity-ui", "composer"), o.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;";
  const l = o.attachShadow({ mode: "open" });
  document.body.appendChild(o);
  let c = [], a = !1, p = [], s = [], h = [], d = !1;
  const u = !!t.onMinimize, m = u ? 8 : 5, f = 15e3, g = 10 * 1024 * 1024, x = !!t.allowFileAttachments, b = 5, y = t.maxFileBytes && t.maxFileBytes > 0 ? t.maxFileBytes : xh, C = t.reporterRole ?? "anon", w = t.upgradeUrl, k = Math.max(120 * 1024 * 1024, y + 20 * 1024 * 1024);
  let S = [], L = null;
  const N = !!(t.allowRecording && t.onRecord), O = Qp({
    hasEndpoint: !!t.onDictate,
    mediaRecorderSupported: mn.isSupported(),
    webSpeechSupported: _r.isSupported()
  }), K = O !== "none", H = 2;
  let I = [];
  const $e = t.issueTypes && t.issueTypes.length ? t.issueTypes : null, ne = {};
  let Q = null;
  const he = () => {
    const v = Object.keys(ne);
    if (!v.length && !Q) return null;
    const M = {};
    if (v.length) {
      const R = {};
      for (const A of v) R[A] = ne[A];
      const E = ne[0] ?? ne[Number(v[0])] ?? {};
      Object.assign(M, E, { byIndex: R });
    }
    return Q && (M.selector = Q.selector, M.selectorText = Q.text), M;
  };
  let ye = e, fe = 0, oe = null, le = null, nt = t.replayState === "attached", P = null, Ue = null, Re = null, it = !1;
  const Pe = 4e3, Xe = 5e3, be = {}, Ae = {}, X = (v) => v ? JSON.parse(JSON.stringify(v)) : null, Te = (v) => ({
    url: c[v],
    compressed: p[v],
    ann: X(ne[v])
  }), ue = (v) => {
    (be[v] ?? (be[v] = [])).push(Te(v));
  }, ke = (v, M) => {
    c[v] = M.url, p[v] = M.compressed, M.ann ? ne[v] = X(M.ann) : delete ne[v];
  }, De = (v) => {
    const M = be[v];
    if (!M || !M.length) return !1;
    const R = M.pop(), E = Ae[v];
    for (; E && E.length && E[E.length - 1].mark >= M.length; ) E.pop();
    return ke(v, R), we(), !0;
  }, ge = (v) => {
    const M = Ae[v];
    if (!M || !M.length) return !1;
    const { snap: R, mark: E } = M.pop();
    return be[v] && (be[v].length = Math.min(be[v].length, E)), ke(v, R), we(), !0;
  }, Qt = document.createElement("style");
  Qt.textContent = `
    ${Kp(n)}
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
    .kl-hsep{width:1px;height:24px;background:rgba(255,255,255,.14);margin:0 3px;}
    .kl-hgrow{flex:1;}
    .kl-hhint{color:#7d879f;font-size:11px;font-weight:600;white-space:nowrap;}
    /* Contextual text options (outline colour + size) — only visible while the Text tool is active. */
    .kl-htextopts{display:inline-flex;align-items:center;gap:5px;}
    .kl-htextopts[hidden]{display:none;}
    .kl-hlabel{color:#7d879f;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;margin:0 1px;}
    .kl-hopt{min-width:28px;height:30px;padding:0 8px;border-radius:8px;border:1px solid rgba(255,255,255,.14);background:transparent;color:#cfd5ea;font-size:12px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;}
    .kl-hopt:hover{background:rgba(255,255,255,.08);}
    .kl-hopt.kl-on{background:var(--kl-accent);color:var(--kl-on-accent);border-color:transparent;}
    .kl-osq{width:13px;height:13px;border-radius:3px;display:inline-block;}
    .kl-hmask{display:inline-flex;align-items:center;gap:5px;height:38px;padding:0 8px;border-radius:9px;color:#cfd5ea;font-size:11px;font-weight:600;cursor:pointer;user-select:none;white-space:nowrap;}
    .kl-hmask:hover{background:rgba(255,255,255,.08);}
    .kl-hmask input{cursor:pointer;margin:0;accent-color:var(--kl-accent);}
    .kl-htool:focus-visible,.kl-htbtn:focus-visible,.kl-hcolor:focus-visible{outline:2px solid var(--kl-accent);outline-offset:2px;}
    .klavity-thumb.kl-thumb-active img{outline:2px solid var(--kl-accent);outline-offset:1px;}
    @media (max-width:760px){.kl-hhint{display:none;}}
    @media (prefers-reduced-motion:reduce){.kl-htool,.kl-htbtn,.kl-hcolor{transition:none;}.kl-htool:hover,.kl-htbtn:hover,.kl-hcolor:hover{transform:none;}}
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
    .klavity-capmsg .kl-capmsg-cta:hover{text-decoration:underline;}
    .klavity-capmsg .kl-capmsg-hint{color:var(--kl-muted);}
    .klavity-capmsg[hidden]{display:none;}
    .kl-video-thumb{width:104px;height:72px;border-radius:8px;overflow:hidden;cursor:pointer;background:#000;outline:1px solid var(--kl-img-outline);outline-offset:-1px;}
    .kl-video-thumb.kl-thumb-active{outline:2px solid var(--kl-accent);outline-offset:1px;}
    .kl-video-thumb video{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;}
    .kl-video-thumb .kl-video-play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;background:rgba(0,0,0,.28);transition:background .12s;}
    .kl-video-thumb:hover .kl-video-play{background:rgba(0,0,0,.12);}
    .kl-video-thumb .kl-video-play svg{filter:drop-shadow(0 1px 3px rgba(0,0,0,.6));}
    .kl-video-thumb .kl-video-badge{position:absolute;left:4px;bottom:4px;display:inline-flex;align-items:center;gap:3px;padding:1px 5px 1px 4px;border-radius:5px;background:rgba(0,0,0,.62);color:#fff;font-size:9px;font-weight:700;letter-spacing:.02em;text-transform:uppercase;}
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
    .kl-tgt-opt{flex:1;min-width:0;border:none;background:transparent;border-radius:8px;padding:8px 6px;font-size:12.5px;font-weight:600;color:var(--kl-muted);cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;line-height:1.2;text-align:center;transition:background .15s ease,color .15s ease,transform .12s ease;}
    .kl-tgt-opt small{font-weight:500;font-size:10px;opacity:.85;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
    .kl-tgt-opt:hover:not(.on){color:var(--kl-fg);}
    .kl-tgt-opt:active{transform:scale(.97);}
    .kl-tgt-opt.on{background:var(--kl-input-bg);color:var(--kl-fg);box-shadow:0 1px 4px rgba(20,16,40,.14);}
    .kl-tgt-opt.on small{color:var(--kl-accent);opacity:1;}
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
    /* KLA-587: Screen is the RECOMMENDED default capture — real tab pixels (every image, embedded frame and
       web font, no CORS gaps). Style it as the primary/accent button so the reporter's eye + first click land
       here; Full Page (the DOM re-render) stays the neutral fallback. Screen still requires a user gesture, so
       "default" = the recommended button + steer, NOT an auto-fired permission prompt (see KLAVITYKLA-473). */
    /* KLA-587: the Screen button STACKS a "Recommended" pill ABOVE the icon+label row so the full word never
       truncates at the narrow widget button width (the old inline pill clipped to "RECOMMEND…"). Column layout
       keeps it self-contained — no overhang that could overlap the row above — and flex align-items:stretch on
       .klavity-actions makes the neighbouring capture buttons match its height, so the row stays aligned. */
    #klavity-sharp{flex:1.4;flex-direction:column;gap:3px;padding-top:6px;padding-bottom:6px;background:var(--kl-accent);color:var(--kl-on-accent);font-weight:600;}
    #klavity-sharp:hover{filter:brightness(1.06);}
    #klavity-sharp .kl-cap-main{display:inline-flex;align-items:center;justify-content:center;gap:6px;line-height:1;}
    #klavity-sharp .kl-info-badge{opacity:.7;}
    #klavity-sharp:hover .kl-info-badge,#klavity-sharp:focus-visible .kl-info-badge{opacity:1;}
    /* Full-word "Recommended" pill on its own line above "Screen" — nowrap guarantees it is never truncated. */
    .kl-rec-tag{font-size:8.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;line-height:1;white-space:nowrap;padding:2px 7px;border-radius:999px;background:color-mix(in srgb,var(--kl-on-accent) 22%,transparent);color:var(--kl-on-accent);flex:none;}
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
    #klavity-voice.kl-voice-rec{color:rgb(220 38 38);background:color-mix(in srgb,rgb(220 38 38) 10%,var(--kl-chip));}
    #klavity-voice.kl-voice-warn .kl-vring-prog{stroke:#f97316;}
    .kl-vdot{display:none;position:absolute;top:0;right:0;width:6px;height:6px;border-radius:50%;background:rgb(220 38 38);}
    #klavity-voice.kl-voice-rec .kl-vdot{display:block;animation:kl-vdot-pulse 1.2s ease infinite;}
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
  `, l.appendChild(Qt);
  const er = document.createElement("div");
  er.className = "klavity-overlay";
  const ee = document.createElement("div");
  ee.className = "klavity-modal", ee.innerHTML = `
    ${u ? '<button class="klavity-min" id="klavity-min" type="button" aria-label="Minimize" title="Minimize (keeps your evidence)"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>' : ""}
    <button class="klavity-x" id="klavity-x" type="button" aria-label="Close" title="Close (Esc)">${Y("x", { size: 16 })}</button>
    <div class="kl-hero" id="klavity-hero">
      <div class="kl-hero-tools" id="klavity-hero-tools"></div>
      <div class="kl-hero-stage" id="klavity-hero-stage">
        <div class="kl-hero-empty" id="klavity-hero-empty">${Y("image", { size: 34 })}<span>Capture or upload a screenshot to start marking it up</span></div>
      </div>
      <div class="klavity-strip" id="klavity-strip"></div>
      ${t.onCaptureSharp ? '<div class="klavity-sharphint" id="klavity-sharphint" role="status" aria-live="polite" hidden></div>' : ""}
    </div>
    <div class="kl-side" id="klavity-side">
      ${t.showTitleField ? '<label class="klavity-title-label" for="klavity-title">Title<input type="text" class="klavity-title" id="klavity-title" maxlength="200" placeholder="One line summarising the issue"></label>' : ""}
      ${$e ? `<div class="klavity-types" id="klavity-types" role="radiogroup" aria-label="Issue type">${$e.map((v) => `<button type="button" class="kl-type-chip${v.value === e ? " active" : ""}" data-kind="${at(v.value)}" role="radio" aria-checked="${v.value === e ? "true" : "false"}">${at(v.label)}${v.mappingLabel ? `<span class="kl-type-map">${at(v.mappingLabel)}</span>` : ""}</button>`).join("")}</div>` : `<div class="klavity-toggle">
        <button class="bug ${e === "bug" ? "active" : ""}"><span class="kl-cap-ic">${Y("bug")}</span>Bug</button>
        <button class="feat ${e === "feature" ? "active" : ""}"><span class="kl-cap-ic">${Y("lightbulb")}</span>Feature</button>
      </div>`}
      
      
      <div class="klavity-actions">
        ${t.onCaptureSharp ? `<button id="klavity-sharp" class="kl-cap-primary" aria-label="Screen capture — recommended" aria-describedby="klavity-sharp-tip"><span class="kl-rec-tag">Recommended</span><span class="kl-cap-main"><span class="kl-cap-ic">${Y("app-window")}</span><span class="kl-sharp-label">Screen</span></span><span class="kl-info-badge" aria-hidden="true"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></span><span id="klavity-sharp-tip" class="klavity-info-pop" role="tooltip"><b>Recommended.</b> Screen grabs the <b>whole page — every image, embedded frame, and web font, pixel-perfect</b> using your browser's screen-share. Your browser will ask you to <b>share this tab</b>.</span></button>` : ""}
        <button id="klavity-full" title="Full Page — instant, but re-renders the page (may miss cross-origin images or embedded frames). Use Screen for a pixel-perfect shot."><span class="kl-cap-ic">${Y("camera")}</span><span class="kl-full-label">Full Page</span></button>
        
        <button id="klavity-upload" title="${x ? "Add a screenshot, video, or file (images, MP4, PDF, .log, .har, ...)" : "Upload a screenshot"}"><span class="kl-cap-ic">${Y(x ? "paperclip" : "image")}</span><span class="kl-upload-label">${x ? "Attach" : "Upload"}</span></button>
        ${N ? `<button id="klavity-record" title="Record your screen, camera and narration"><span class="kl-cap-ic">${Y("monitor")}</span><span class="kl-record-label">Record me</span></button>` : ""}
        ${t.onRegionCapture ? `<button id="klavity-region"><span class="kl-cap-ic">${Y("scissors")}</span><span class="kl-region-label">Region</span></button>` : ""}
        ${t.onPickElement ? `<button id="klavity-pick" title="Pick the exact element that's broken"><span class="kl-cap-ic">${Y("mouse-pointer-2")}</span><span class="kl-pick-label">Pick element</span></button>` : ""}
      </div>
      ${t.onPickElement ? '<div class="klavity-pickinfo" id="klavity-pickinfo" role="status" aria-live="polite" hidden></div>' : ""}
      
      
      <input type="file" id="klavity-file" accept="${x ? kh : "image/*,.heic,.heif"}" multiple style="display:none">
      ${x ? `<div class="klavity-attach-hint" id="klavity-attach-hint"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg><span>Images, video, PDF or logs — up to ${Math.round(y / 1024 / 1024)}MB each</span></div>` : ""}
      
      <div class="klavity-descbar">
        <div class="klavity-counter" id="klavity-counter" hidden>0/${m} images</div>
        ${K ? `<button id="klavity-voice" class="kl-voice-circle" type="button" title="Voice dictation" aria-label="Voice dictation"><span class="kl-cap-ic">${Y("mic")}<span class="kl-vdot"></span></span><svg class="kl-vring" viewBox="0 0 32 32" aria-hidden="true"><circle class="kl-vring-bg" cx="16" cy="16" r="13" fill="none" stroke-width="2"/><circle class="kl-vring-prog" cx="16" cy="16" r="13" fill="none" stroke-width="2" stroke-dasharray="81.68" stroke-dashoffset="81.68" stroke-linecap="round" transform="rotate(-90 16 16)"/></svg></button>` : ""}
      </div>
      ${x ? '<div class="klavity-capmsg" id="klavity-capmsg" role="alert" hidden></div>' : ""}
      ${x ? '<div class="klavity-files" id="klavity-files" hidden></div>' : ""}
      ${N ? '<div class="klavity-files klavity-recordings" id="klavity-recordings" hidden></div>' : ""}
      <div class="klavity-error" id="klavity-err"></div>
      <div class="klavity-desc" id="klavity-desc" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Description" data-ph="${e === "feature" ? "Describe the feature you'd like..." : "Describe the bug..."}"></div>
      <div class="klavity-desc-hint" id="klavity-desc-hint" hidden>${Y("sparkles", { size: 13 })}<span>No title needed — we'll auto-generate one for you</span></div>
      ${t.onEnhance ? `<div class="klavity-enhance-row" id="klavity-enhance-row">
        <button type="button" class="klavity-enhance-btn" id="klavity-enhance">${Y("sparkles", { size: 14 })}<span>Enhance with AI</span></button>
        <button type="button" class="klavity-enhance-undo" id="klavity-enhance-undo" hidden>${Y("rotate-cw", { size: 13 })}<span>Undo</span></button>
        <button type="button" class="klavity-enhance-regen" id="klavity-enhance-regen" hidden>${Y("refresh-cw", { size: 13 })}<span>Regenerate</span></button>
      </div>
      <div class="klavity-enhance-spin" id="klavity-enhance-spin" hidden><span class="kl-enh-loader"></span><span>Drafting from your screenshot…</span></div>` : ""}
      ${K ? '<div class="klavity-voice-status" id="klavity-voice-status" role="status" aria-live="polite" hidden></div>' : ""}
      ${n.reportClarity ? `<div class="klavity-clarity" id="klavity-clarity" role="status" aria-live="polite" hidden>
        <div class="kl-clr-bar"><i></i><i></i><i></i></div>
        <div class="kl-clr-row"><span>Report clarity</span><span class="kl-clr-st" id="klavity-clarity-status">Needs detail</span></div>
        <div class="kl-clr-chips">
          <span class="kl-clr-chip" id="klavity-clarity-problem"><span class="kl-clr-mark">○</span> What's broken</span>
          <span class="kl-clr-chip" id="klavity-clarity-expected"><span class="kl-clr-mark">○</span> What you expected</span>
          <span class="kl-clr-chip" id="klavity-clarity-repro"><span class="kl-clr-mark">○</span> How to reproduce</span>
        </div>
        <div class="kl-clr-tip" id="klavity-clarity-tip" hidden><span class="kl-clr-ai">${Y("lightbulb", { size: 14 })}</span><span id="klavity-clarity-tip-text"></span></div>
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
          <button type="button" class="kl-tgt-opt on" id="klavity-target-project" role="radio" aria-checked="true" data-target="project">Your team<small>${at(n.projectDisplayName || "your project")}</small></button>
          <button type="button" class="kl-tgt-opt" id="klavity-target-klavity" role="radio" aria-checked="false" data-target="klavity">Klavity<small>problem with this tool</small></button>
        </div>
      </div>` : ""}
      <button type="button" class="klavity-submit" id="klavity-submit" title="Submit (S)" disabled>Submit</button>
      <div class="klavity-progress" id="klavity-progress" role="progressbar" aria-label="Uploading report"><div class="klavity-progress-fill" id="klavity-progress-fill"></div></div>
    </div>
  `, er.appendChild(ee), l.appendChild(er);
  const Me = l.getElementById("klavity-sharp"), Us = l.querySelector(".klavity-info-pop");
  if (Me && Us) {
    const v = document.createElement("div");
    v.className = "kl-float-tip", v.setAttribute("role", "tooltip"), v.innerHTML = Us.innerHTML, l.appendChild(v);
    const M = () => {
      const E = Me.getBoundingClientRect(), A = Math.min(228, window.innerWidth - 16), T = 8, _ = window.innerWidth, U = window.innerHeight, $ = E.left + E.width / 2 - A / 2, z = Math.max(T, Math.min($, _ - A - T));
      v.style.left = z + "px", v.style.top = "-9999px", v.style.visibility = "hidden", v.style.display = "block";
      const q = v.offsetHeight;
      v.style.display = "", v.style.visibility = "";
      let W = E.bottom + 8;
      W + q + T > U && (W = E.top - q - 8), W = Math.max(T, Math.min(W, U - q - T)), v.style.top = W + "px", v.classList.add("kl-show");
    }, R = () => v.classList.remove("kl-show");
    Me.addEventListener("mouseenter", M), Me.addEventListener("mouseleave", R), Me.addEventListener("focus", M), Me.addEventListener("blur", R);
  }
  function su(v) {
    nt = v === "attached", yt();
  }
  const Bs = {
    shadowRoot: l,
    // Host seeds shots it already tracks (evidence-session restore, region-initial): fireAdded=false so
    // onShotAdded does NOT re-fire (which would double-persist). Page metadata is carried through as-is.
    addScreenshot: (v, M, R, E) => Je(v, M, R, !1, !!E),
    // fireAdded=true: select the new shot as the active hero + fire onShotAdded (persist). See interface doc.
    addCapturedShot: (v, M, R, E) => Je(v, M, R, !0, !!E),
    close: tr,
    setReplayState: su,
    // KLA-591: mirror the aggregate upload percent onto every video tile + file chip while a submit is in
    // flight. Re-renders the strip + chips so the bars paint; passing null clears them.
    setUploadProgress: (v) => {
      if (L = ei(v), !it)
        try {
          we(), qn();
        } catch {
        }
    }
  };
  function we() {
    const v = l.getElementById("klavity-strip"), M = l.getElementById("klavity-counter");
    v.innerHTML = "", c.forEach((R, E) => {
      const A = document.createElement("div");
      A.className = "klavity-thumb", E === fe && A.classList.add("kl-thumb-active");
      const T = document.createElement("img");
      T.src = R, T.title = "Click to select + mark up", T.addEventListener("load", () => {
        T.naturalHeight > T.naturalWidth * 1.4 && A.classList.add("kl-tall");
      }, { once: !0 }), T.addEventListener("click", () => {
        fe = E, oe = null, we();
      });
      const _ = document.createElement("button");
      _.className = "klavity-rm", _.innerHTML = Y("x", { size: 13 }), _.title = "Remove", _.addEventListener("click", (z) => {
        var q;
        z.stopPropagation(), c.splice(E, 1), p.splice(E, 1), s.splice(E, 1), h.splice(E, 1);
        try {
          (q = t.onShotRemoved) == null || q.call(t, E);
        } catch {
        }
        delete ne[E];
        for (const W of Object.keys(ne).map(Number).filter((j) => j > E).sort((j, J) => j - J))
          ne[W - 1] = ne[W], delete ne[W];
        delete be[E], delete Ae[E];
        for (const W of Object.keys(be).map(Number).filter((j) => j > E).sort((j, J) => j - J))
          be[W - 1] = be[W], delete be[W];
        for (const W of Object.keys(Ae).map(Number).filter((j) => j > E).sort((j, J) => j - J))
          Ae[W - 1] = Ae[W], delete Ae[W];
        c.length === 0 && bt(null), we();
      });
      const U = document.createElement("button");
      U.className = "klavity-mk", U.innerHTML = Y("pencil", { size: 13 }), U.title = "Mark up", U.addEventListener("click", (z) => {
        z.stopPropagation(), bu(E);
      }), A.append(T, _, U);
      const $ = s[E];
      if ($) {
        const z = bh[$], q = document.createElement("span");
        if (q.className = "klavity-qb kl-q-" + $, q.title = $ === "real-pixel" ? "Pixel-perfect capture (every image included)" : $ === "wireframe" ? "Wireframe fallback — layout only, images not captured. Retake for a sharp shot." : "Rendered capture — some cross-origin images may be missing. Retake for a sharp shot.", q.innerHTML = Y(z.iconName, { size: 10 }) + '<span class="klavity-qb-t">' + at(z.label) + "</span>", A.appendChild(q), z.degraded && t.onRetakeSharp) {
          const W = document.createElement("button");
          W.type = "button", W.className = "klavity-retake", W.innerHTML = Y("zap", { size: 11 }) + "<span>Retake sharp</span>", W.title = "Recapture this shot at full pixel quality", W.addEventListener("click", (j) => {
            j.stopPropagation(), ou(E, W);
          }), A.appendChild(W);
        }
      }
      if (qs.has(E)) {
        const z = document.createElement("div");
        z.className = "klavity-retake-note", z.textContent = "Markup cleared for the retake.", A.appendChild(z);
      }
      v.appendChild(A);
    }), S.forEach((R, E) => {
      if (lr(R) !== "video") return;
      const A = document.createElement("div");
      A.className = "klavity-thumb kl-video-thumb", oe === E && A.classList.add("kl-thumb-active");
      const T = document.createElement("video");
      T.src = R.dataUrl, T.muted = !0, T.preload = "metadata", T.setAttribute("playsinline", ""), T.tabIndex = -1;
      const _ = document.createElement("span");
      _.className = "kl-video-play", _.setAttribute("aria-hidden", "true"), _.innerHTML = Y("play", { size: 16 });
      const U = document.createElement("span");
      U.className = "kl-video-badge", U.innerHTML = Y("play", { size: 9 }) + "<span>Video</span>", A.title = "Click to play " + R.name, A.addEventListener("click", () => {
        oe = E, we();
      });
      const $ = document.createElement("button");
      $.className = "klavity-rm", $.innerHTML = Y("x", { size: 13 }), $.title = "Remove", $.addEventListener("click", (q) => {
        q.stopPropagation(), js(E);
      }), A.append(T, _, U, $);
      const z = ei(L);
      if (z != null) {
        const q = document.createElement("div");
        q.className = "kl-att-prog";
        const W = document.createElement("i");
        W.style.width = z + "%", q.appendChild(W), A.appendChild(q);
      }
      v.appendChild(A);
    });
    try {
      const R = v.children[fe];
      R && typeof R.scrollIntoView == "function" && R.scrollIntoView({ block: "nearest", inline: "nearest" });
    } catch {
    }
    if (a) {
      const R = document.createElement("div");
      R.className = "kl-thumb-skel kl-loading", R.setAttribute("role", "status"), R.setAttribute("aria-label", "Capturing screenshot"), R.innerHTML = '<span class="kl-skel-spin" aria-hidden="true"></span><span>Capturing…</span>', v.appendChild(R);
    }
    M.textContent = `${c.length}/${m} images`, M instanceof HTMLElement && (M.hidden = c.length === 0), yt(), Yr(), no();
  }
  function Yr() {
    const v = l.getElementById("klavity-sharphint");
    if (!v) return;
    if (c.length > 0 && fe >= 0 && fe < c.length && !!h[fe] && !d && !!t.onCaptureSharp && !st) {
      if (!v.dataset.built) {
        v.dataset.built = "1", v.innerHTML = "";
        const E = document.createElement("span");
        E.className = "kl-sh-ic", E.innerHTML = Y("triangle-alert", { size: 15 });
        const A = document.createElement("span");
        A.className = "kl-sh-txt", A.textContent = "Some areas can't be captured this way (embedded frames or cross-origin images) - click Screen for a pixel-perfect shot.";
        const T = document.createElement("button");
        T.type = "button", T.className = "kl-sh-use", T.textContent = "Use Screen", T.addEventListener("click", () => {
          d = !0, Yr(), Me == null || Me.click();
        });
        const _ = document.createElement("button");
        _.type = "button", _.className = "kl-sh-x", _.setAttribute("aria-label", "Dismiss"), _.title = "Dismiss", _.innerHTML = Y("x", { size: 12 }), _.addEventListener("click", () => {
          d = !0, Yr();
        }), v.append(E, A, T, _);
      }
      v.hidden = !1, Me == null || Me.classList.add("kl-suggest");
    } else
      v.hidden = !0, Me == null || Me.classList.remove("kl-suggest");
  }
  function mt(v) {
    const M = l.getElementById("klavity-err");
    M && (M.textContent = v, M.style.display = "block");
  }
  function Un() {
    const v = l.getElementById("klavity-err");
    v && (v.style.display = "none");
  }
  function Je(v, M, R, E = !0, A = !1) {
    var T;
    if (c.length >= m) {
      mt(`You can attach up to ${m} images.`);
      return;
    }
    if (Un(), c.push(v), p.push(t.compressImage ? t.compressImage(v) : Promise.resolve(v)), s.push(M), h.push(A && M !== "real-pixel"), E && (fe = c.length - 1), we(), E)
      try {
        (T = t.onShotAdded) == null || T.call(t, v, M);
      } catch {
      }
  }
  const qs = /* @__PURE__ */ new Set();
  async function ou(v, M) {
    if (!(st || !t.onRetakeSharp)) {
      Be(!0), M.classList.add("kl-loading"), o.style.display = "none";
      try {
        const R = i ? qt(document.body) : null;
        let E;
        try {
          E = await t.onRetakeSharp();
        } finally {
          R == null || R();
        }
        if (E) {
          const { dataUrl: A, quality: T } = kt(E);
          A && (c[v] = A, p[v] = t.compressImage ? t.compressImage(A) : Promise.resolve(A), s[v] = T ?? "real-pixel", h[v] = !1, ne[v] && (delete ne[v], qs.add(v)), delete be[v], delete Ae[v]);
        }
      } catch {
      } finally {
        o.style.display = "", Be(!1), we();
      }
    }
  }
  function Ws(v) {
    return v.type.startsWith("image/") || /\.(heic|heif|png|jpe?g|gif|webp|bmp|avif|svg)$/i.test(v.name);
  }
  async function Bn(v) {
    Un();
    for (const M of v) {
      if (c.length >= m) {
        mt(`You can attach up to ${m} images.`);
        break;
      }
      if (!Ws(M)) {
        mt(`"${M.name}" isn't an image — only image files can be attached.`);
        continue;
      }
      if (M.size > g) {
        mt(`"${M.name}" is too large — images must be under ${Math.round(g / 1024 / 1024)} MB.`);
        continue;
      }
      try {
        Je(await No(M));
      } catch {
        mt(`Couldn't add "${M.name}". Please try a different image.`);
      }
    }
  }
  function qn() {
    const v = l.getElementById("klavity-files");
    if (!v) return;
    v.innerHTML = "";
    const M = S.filter((R) => lr(R) === "file");
    v.hidden = M.length === 0, S.forEach((R, E) => {
      if (lr(R) !== "file") return;
      const A = document.createElement("div");
      A.className = "kl-file-chip";
      const T = document.createElement("span");
      T.className = "kl-file-ic", T.innerHTML = Y("file-text", { size: 14 });
      const _ = document.createElement("span");
      _.className = "kl-file-nm", _.textContent = R.name, _.title = R.name;
      const U = document.createElement("span");
      U.className = "kl-file-sz", U.textContent = R.size < 1024 ? `${R.size} B` : R.size < 1024 * 1024 ? `${Math.round(R.size / 1024)} KB` : `${(R.size / 1024 / 1024).toFixed(1)} MB`;
      const $ = document.createElement("button");
      $.type = "button", $.className = "kl-file-rm", $.setAttribute("aria-label", `Remove ${R.name}`), $.title = "Remove", $.innerHTML = Y("x", { size: 11 }), $.addEventListener("click", () => {
        js(E);
      }), A.append(T, _, U, $);
      const z = ei(L);
      if (z != null) {
        const q = document.createElement("div");
        q.className = "kl-att-prog";
        const W = document.createElement("i");
        W.style.width = z + "%", q.appendChild(W), A.appendChild(q);
      }
      v.appendChild(A);
    }), yt();
  }
  function js(v) {
    const M = S[v] && lr(S[v]) === "video";
    S.splice(v, 1), oe != null && (M && oe === v ? oe = null : oe > v && (oe -= 1)), qn(), we();
  }
  function au(v) {
    const M = l.getElementById("klavity-capmsg");
    if (!M || !v.overCap) return;
    M.innerHTML = "";
    const R = document.createElement("span");
    if (R.className = "kl-capmsg-t", R.textContent = v.message || "", M.appendChild(R), v.cta)
      if (v.cta.kind === "upgrade" && v.cta.url) {
        const E = document.createElement("a");
        E.className = "kl-capmsg-cta", E.href = v.cta.url, E.target = "_blank", E.rel = "noopener noreferrer", E.textContent = v.cta.label, M.appendChild(E);
      } else {
        const E = document.createElement("span");
        E.className = "kl-capmsg-hint", E.textContent = v.cta.label, M.appendChild(E);
      }
    M.hidden = !1;
  }
  function lu() {
    const v = l.getElementById("klavity-capmsg");
    v && (v.hidden = !0, v.innerHTML = "");
  }
  async function cu(v) {
    Un(), lu();
    for (const M of v) {
      if (Ws(M)) {
        await Bn([M]);
        continue;
      }
      if (S.length >= b) {
        mt(`You can attach up to ${b} files.`);
        break;
      }
      const R = Ch(M, { capBytes: y, role: C, upgradeUrl: w });
      if (R.overCap) {
        au(R);
        continue;
      }
      if (S.reduce((A, T) => A + T.size, 0) + M.size > k) {
        mt(`Attachments exceed the ${Math.round(k / 1024 / 1024)} MB total limit.`);
        break;
      }
      try {
        const A = M.type || (ql(M) ? vh(M.name) : ""), T = S.push({ name: M.name, type: A, size: M.size, dataUrl: await No(M) }) - 1;
        qn(), lr(S[T]) === "video" && (oe = T), we();
      } catch {
        mt(`Couldn't add "${M.name}". Please try a different file.`);
      }
    }
  }
  function Hs() {
    const v = l.getElementById("klavity-recordings");
    v && (v.innerHTML = "", v.hidden = I.length === 0, I.forEach((M, R) => {
      const E = document.createElement("div");
      E.className = "kl-file-chip kl-rec-chip", E.setAttribute("data-kind", "recording");
      const A = document.createElement("span");
      A.className = "kl-file-ic", A.innerHTML = Y("play", { size: 14 });
      const T = document.createElement("span");
      T.className = "kl-file-nm";
      const _ = Math.round(M.durationMs / 1e3), U = `Recording ${Math.floor(_ / 60)}:${String(_ % 60).padStart(2, "0")}${M.screenOnly ? " (screen only)" : ""}`;
      T.textContent = U, T.title = U;
      const $ = document.createElement("span");
      $.className = "kl-file-sz", $.textContent = M.bytes < 1024 * 1024 ? `${Math.round(M.bytes / 1024)} KB` : `${(M.bytes / 1024 / 1024).toFixed(1)} MB`;
      const z = document.createElement("button");
      z.type = "button", z.className = "kl-file-rm", z.setAttribute("aria-label", `Remove ${U}`), z.title = "Remove", z.innerHTML = Y("x", { size: 11 }), z.addEventListener("click", () => {
        I.splice(R, 1), Hs();
      }), E.append(A, T, $, z), v.appendChild(E);
    }), yt());
  }
  let Pt = null;
  function tr(v) {
    var E;
    if (it) return;
    it = !0, Pt == null || Pt(), Re && (clearTimeout(Re), Re = null), document.removeEventListener("keydown", $t, { capture: !0 }), document.removeEventListener("paste", Gs);
    try {
      (E = t.onClose) == null || E.call(t, v == null ? void 0 : v.reason);
    } catch {
    }
    const M = l.querySelector(".klavity-modal");
    if (v != null && v.immediate || !M) {
      Le(o);
      return;
    }
    M.classList.add("kl-closing");
    const R = () => Le(o);
    M.addEventListener("animationend", R, { once: !0 }), setTimeout(R, 700);
  }
  function Vs(v, M) {
    if (Re || it) return;
    const R = document.createElement("div");
    R.className = "klavity-toast-progress", R.style.animationDuration = M + "ms", v.appendChild(R);
    let E = M, A = Date.now();
    const T = () => {
      A = Date.now(), Re = setTimeout(() => {
        tr();
      }, E);
    }, _ = () => {
      Re && (clearTimeout(Re), Re = null, E = Math.max(0, E - (Date.now() - A)), R.style.animationPlayState = "paused");
    }, U = () => {
      Re || v.classList.contains("kl-closing") || (R.style.animationPlayState = "running", T());
    };
    v.addEventListener("mouseenter", _), v.addEventListener("mouseleave", U), v.addEventListener("focusin", _), v.addEventListener("focusout", ($) => {
      v.contains($.relatedTarget) || U();
    }), T();
  }
  function $t(v) {
    var M;
    if (v.key === "Escape") {
      v.stopPropagation(), tr();
      return;
    }
    if ((v.key === "s" || v.key === "S") && !v.metaKey && !v.ctrlKey && !v.altKey) {
      const R = typeof v.composedPath == "function" && v.composedPath()[0] || v.target;
      if (R && (R.tagName === "INPUT" || R.tagName === "TEXTAREA" || R.tagName === "SELECT" || R.isContentEditable || ((M = R.getAttribute) == null ? void 0 : M.call(R, "contenteditable")) === "true") || l.querySelector(".kl-edtb")) return;
      const E = l.getElementById("klavity-submit");
      E && !E.disabled && (v.preventDefault(), v.stopPropagation(), E.click());
    }
  }
  document.addEventListener("keydown", $t, { capture: !0 });
  const Gs = (v) => {
    if (!v.clipboardData) return;
    const M = Array.from(v.clipboardData.items).filter((R) => R.type.startsWith("image/")).map((R) => R.getAsFile()).filter((R) => !!R);
    M.length && Bn(M);
  };
  document.addEventListener("paste", Gs);
  const Wn = () => {
    const v = ee.querySelector("#klavity-desc");
    v && (v.placeholder = ye === "feature" ? "Describe the feature you'd like..." : ye === "bug" ? "Describe the bug..." : "Describe the issue...");
  };
  if ($e) {
    const v = Array.from(ee.querySelectorAll(".kl-type-chip"));
    v.forEach((M) => {
      M.addEventListener("click", () => {
        ye = M.getAttribute("data-kind") || "bug", v.forEach((R) => {
          const E = R === M;
          R.classList.toggle("active", E), R.setAttribute("aria-checked", E ? "true" : "false");
        }), Wn();
      });
    });
  } else {
    const v = ee.querySelector(".bug"), M = ee.querySelector(".feat");
    v.addEventListener("click", () => {
      ye = "bug", v.classList.add("active"), M.classList.remove("active"), Wn();
    }), M.addEventListener("click", () => {
      ye = "feature", M.classList.add("active"), v.classList.remove("active"), Wn();
    });
  }
  let Ys = "project";
  {
    const v = ee.querySelector("#klavity-target");
    if (v) {
      const M = Array.from(v.querySelectorAll(".kl-tgt-opt"));
      for (const R of M)
        R.addEventListener("click", () => {
          Ys = R.dataset.target === "klavity" ? "klavity" : "project";
          for (const A of M) {
            const T = A === R;
            A.classList.toggle("on", T), A.setAttribute("aria-checked", T ? "true" : "false");
          }
        });
    }
  }
  const re = ee.querySelector("#klavity-desc");
  {
    const v = () => {
      try {
        return l.getSelection ? l.getSelection() : typeof window < "u" ? window.getSelection() : null;
      } catch {
        try {
          return typeof window < "u" ? window.getSelection() : null;
        } catch {
          return null;
        }
      }
    }, M = () => {
      const A = v();
      if (!A || !A.rangeCount) return -1;
      try {
        const T = A.getRangeAt(0);
        if (!re.contains(T.endContainer)) return -1;
        const _ = T.cloneRange();
        return _.selectNodeContents(re), _.setEnd(T.endContainer, T.endOffset), _.toString().length;
      } catch {
        return -1;
      }
    }, R = (A) => {
      const T = v();
      if (T)
        try {
          const _ = document.createRange(), U = document.createTreeWalker(re, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
          let $, z = A, q = !1;
          for (; $ = U.nextNode(); ) {
            if ($.nodeName === "BR") {
              if (z === 0) {
                _.setStartBefore($), q = !0;
                break;
              }
              z -= 1;
              continue;
            }
            if ($.nodeType === 3) {
              const W = ($.textContent || "").length;
              if (z <= W) {
                _.setStart($, z), q = !0;
                break;
              }
              z -= W;
            }
          }
          q ? _.collapse(!0) : (_.selectNodeContents(re), _.collapse(!1)), T.removeAllRanges(), T.addRange(_);
        } catch {
        }
    }, E = () => {
      const A = M(), T = Lo(re).replace(/\n$/, "");
      re.innerHTML = T ? Io(T) : "", A >= 0 && R(A);
    };
    re.addEventListener("input", E), Object.defineProperty(re, "value", {
      configurable: !0,
      get() {
        return Lo(re);
      },
      set(A) {
        const T = String(A ?? "").replace(/\n$/, "");
        re.innerHTML = T ? Io(T) : "";
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
  const Dt = ee.querySelector("#klavity-submit"), gt = ee.querySelector("#klavity-remail");
  gt && t.prefillEmail && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t.prefillEmail) && (gt.value = t.prefillEmail);
  const Ks = ee.querySelector("#klavity-desc-hint"), uu = () => !t.requireEmail || !!gt && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(gt.value.trim()), Xs = () => c.length > 0 || nt || S.length > 0 || I.length > 0, du = () => {
  }, yt = () => {
    const v = re.value.trim() === "";
    Dt.disabled = v && !Xs() || !uu(), Ks && (Ks.hidden = !(v && Xs()));
  };
  if (re.addEventListener("input", du), re.addEventListener("input", yt), gt == null || gt.addEventListener("input", yt), t.onEnhance) {
    const v = t.onEnhance, M = ee.querySelector("#klavity-enhance"), R = ee.querySelector("#klavity-enhance-undo"), E = ee.querySelector("#klavity-enhance-regen"), A = ee.querySelector("#klavity-enhance-spin");
    let T = 0, _ = null;
    const U = () => c[fe] || c[0] || "", $ = async () => {
      if (st) return;
      const z = re.value.trim();
      _ === null && (_ = re.value);
      const q = ++T;
      M && (M.disabled = !0), A && (A.hidden = !1);
      try {
        const W = Q ? { selector: Q.selector, text: Q.text } : null, j = await v(z, { images: c.length, shot: U(), picked: W });
        if (q !== T || !j) return;
        re.value = mh(j), P = j.suggestedSeverity || null, Ue = j.suggestedPriority || null, re.classList.add("kl-just-enhanced"), setTimeout(() => re.classList.remove("kl-just-enhanced"), 700), R && (R.hidden = !1), E && (E.hidden = !1), yt();
      } catch {
      } finally {
        q === T && (M && (M.disabled = !1), A && (A.hidden = !0));
      }
    };
    M == null || M.addEventListener("click", () => {
      $();
    }), E == null || E.addEventListener("click", () => {
      $();
    }), R == null || R.addEventListener("click", () => {
      _ !== null && (re.value = _, yt()), _ = null, P = null, Ue = null, R && (R.hidden = !0), E && (E.hidden = !0);
    });
  }
  if (t.onCheckKnown) {
    const v = ee.querySelector("#klavity-known"), M = t.onCheckKnown;
    let R = null, E = 0, A = "";
    const T = () => {
      v && (v.hidden = !0, v.textContent = "");
    }, _ = ($) => {
      var q;
      if (!v) return;
      const z = $.headline ? at($.headline) : "Already reported";
      v.innerHTML = `<span class="kl-known-ic">${Y("check-circle", { size: 15 })}</span><div class="kl-known-body"><span class="kl-known-title">${z}</span> — status: <span class="kl-known-status">${at($.statusLabel)}</span>. We're already tracking "${at($.title)}". Add your note and submit anyway — it'll be linked.</div><button type="button" class="kl-known-dismiss" id="klavity-known-dismiss">Dismiss</button>`, v.hidden = !1, (q = v.querySelector("#klavity-known-dismiss")) == null || q.addEventListener("click", () => {
        A = re.value.trim(), T();
      });
    }, U = async () => {
      const $ = re.value.trim();
      if ($.length < 12 || $ === A) {
        T();
        return;
      }
      const z = ++E;
      try {
        const q = await M($);
        if (z !== E) return;
        if (re.value.trim() === A) {
          T();
          return;
        }
        q ? _(q) : T();
      } catch {
      }
    };
    re.addEventListener("input", () => {
      re.value.trim() !== A && (A = ""), R && clearTimeout(R), R = setTimeout(U, 500);
    });
  }
  if (n.reportClarity) {
    const v = ee.querySelector("#klavity-clarity"), M = ee.querySelector("#klavity-clarity-status"), R = {
      problem: ee.querySelector("#klavity-clarity-problem"),
      expected: ee.querySelector("#klavity-clarity-expected"),
      repro: ee.querySelector("#klavity-clarity-repro")
    }, E = ee.querySelector("#klavity-clarity-tip"), A = ee.querySelector("#klavity-clarity-tip-text"), T = ee.querySelector("#klavity-nudge"), _ = t.onClarityTip, U = /* @__PURE__ */ new Map();
    let $ = null, z = 0;
    const q = (Z, V, ae) => {
      if (!Z) return;
      Z.classList.toggle("done", V);
      const xe = Z.querySelector(".kl-clr-mark");
      xe && (xe.innerHTML = V ? Y("check", { size: 12 }) : "○"), Z.setAttribute("aria-label", (V ? "covered: " : "missing: ") + ae);
    }, W = () => {
      E && (E.hidden = !0);
    }, j = (Z) => {
      !E || !A || uh(Z) || (A.innerHTML = at(Z) + '<span class="kl-clr-aitag">AI</span>', E.hidden = !1);
    }, J = () => {
      const Z = re.value, V = Bl(Z);
      v && (v.hidden = Z.trim().length === 0, v.classList.remove("l1", "l2", "l3"), v.classList.add(V.level === "great" ? "l3" : V.level === "good" ? "l2" : "l1")), M && (M.textContent = V.label), q(R.problem, V.coverage.problem, "What's broken"), q(R.expected, V.coverage.expected, "What you expected"), q(R.repro, V.coverage.repro, "How to reproduce"), T && !T.hidden && (T.hidden = !0), V.level === "great" && W();
    }, me = () => {
      !_ || !E || ($ && clearTimeout($), $ = setTimeout(async () => {
        const Z = re.value.trim();
        if (!lh(Z)) {
          W();
          return;
        }
        if (U.has(Z)) {
          j(U.get(Z));
          return;
        }
        const V = ++z;
        try {
          const ae = await _(Z, { images: c.length });
          if (V !== z || re.value.trim() !== Z) return;
          ae && ae.tip && (U.set(Z, ae.tip), j(ae.tip));
        } catch {
        }
      }, 1e3));
    };
    re.addEventListener("input", () => {
      J(), me();
    }), J(), (io = ee.querySelector("#klavity-nudge-add")) == null || io.addEventListener("click", () => {
      T && (T.hidden = !0);
      try {
        re.focus();
      } catch {
      }
    }), (so = ee.querySelector("#klavity-nudge-anyway")) == null || so.addEventListener("click", () => {
      T && (T.hidden = !0), Dt.click();
    });
  }
  er.addEventListener("click", (v) => {
    v.target === er && tr();
  }), (oo = ee.querySelector("#klavity-x")) == null || oo.addEventListener("click", () => tr()), (ao = ee.querySelector("#klavity-min")) == null || ao.addEventListener("click", () => {
    var v;
    try {
      (v = t.onMinimize) == null || v.call(t);
    } catch {
    }
  });
  const Js = () => Array.from(ee.querySelectorAll(".klavity-actions button:not(#klavity-voice)"));
  let st = !1;
  const Be = (v) => {
    st = v, Js().forEach((R) => {
      R.disabled = v;
    }), re.disabled = v;
    const M = ee.querySelector("#klavity-voice");
    M && (M.disabled = v), ee.querySelectorAll(".kl-htool,.kl-htbtn,.kl-hopt,.kl-hcolor").forEach((R) => {
      R.disabled = v;
    }), l.querySelectorAll("#klavity-title,#klavity-remail,.kl-type-chip,.klavity-toggle button,#klavity-mask-numbers,.kl-file-rm,.klavity-rm,.klavity-mk,.klavity-retake").forEach((R) => {
      R.disabled = v;
    }), v ? (Pt == null || Pt(), Dt.disabled = !0) : (yt(), Yr());
  }, bt = (v) => {
    Js().forEach((M) => {
      M.classList.remove("kl-active"), M.removeAttribute("aria-pressed");
    }), v && (v.classList.add("kl-active"), v.setAttribute("aria-pressed", "true"));
  }, Tt = ee.querySelector("#klavity-voice");
  if (Tt) {
    const R = Tt.querySelector(".kl-vring-prog");
    let E = 0, A = 0, T = !1, _;
    const U = () => {
      A = Date.now();
      const V = () => {
        const ae = Date.now() - A, xe = Math.min(ae / 18e4, 1);
        if (R == null || R.setAttribute("stroke-dashoffset", String(xe * 81.68)), ae >= 165e3 && Tt.classList.add("kl-voice-warn"), ae >= 18e4) {
          _.stop();
          return;
        }
        E = requestAnimationFrame(V);
      };
      E = requestAnimationFrame(V);
    }, $ = () => {
      cancelAnimationFrame(E), R == null || R.setAttribute("stroke-dashoffset", String(81.68)), Tt.classList.remove("kl-voice-warn");
    }, z = ee.querySelector("#klavity-voice-status");
    let q = null;
    const W = () => {
      q && (clearTimeout(q), q = null), z && (z.hidden = !0, z.textContent = "", z.classList.remove("kl-vs-info", "kl-vs-err"));
    }, j = (V, ae, xe) => {
      !z || !ae || (q && (clearTimeout(q), q = null), z.classList.remove("kl-vs-info", "kl-vs-err"), z.classList.add(V === "err" ? "kl-vs-err" : "kl-vs-info"), z.textContent = ae, z.hidden = !1, xe && (q = setTimeout(W, xe)));
    }, J = (V) => {
      V.onTranscript = (ae) => {
        const xe = re.value;
        re.value = xe + (xe.length > 0 && !/\s$/.test(xe) ? " " : "") + ae, yt();
      }, V.onStatus = (ae, xe) => {
        ae === "idle" ? W() : j("info", xe);
      }, V.onError = (ae, xe) => {
        xe && j("err", xe, 4e3);
      }, V.onStop = () => {
        T = !1, Tt.classList.remove("kl-voice-rec"), $();
      };
    }, me = () => {
      const V = new _r();
      return J(V), V;
    }, Z = () => {
      if (O === "server" && t.onDictate) {
        const V = new mn({ transcribe: (ae) => t.onDictate(ae) });
        return J(V), V.onUnavailable = () => {
          _r.isSupported() ? (_ = me(), j("info", "Reconnecting dictation…"), _.start()) : (T = !1, Tt.classList.remove("kl-voice-rec"), $(), j("err", "Voice dictation is unavailable right now", 4e3));
        }, V;
      }
      return me();
    };
    _ = Z(), Tt.addEventListener("click", () => {
      T ? _.stop() : (W(), _ = Z(), T = !0, Tt.classList.add("kl-voice-rec"), _.start(), U());
    }), Pt = () => {
      T && _.stop();
    };
  }
  Dt.addEventListener("click", async () => {
    if (st || Dt.disabled) return;
    const v = re.value.trim(), M = ee.querySelector("#klavity-title"), R = M ? M.value.trim() : "", E = ye === "feature" ? "feature" : "bug", A = p.slice(), T = he(), _ = S.slice(), U = I.slice(), $ = ye, z = (gt == null ? void 0 : gt.value.trim()) || void 0;
    Be(!0), Dt.textContent = "Uploading…";
    const q = l.getElementById("klavity-err");
    q.style.display = "none";
    const W = l.getElementById("klavity-progress"), j = l.getElementById("klavity-progress-fill");
    W && j && (W.classList.add("show"), j.style.transition = "none", j.style.width = "8%", j.offsetWidth, j.style.transition = "width 10s cubic-bezier(.05,.7,.2,1)", requestAnimationFrame(() => {
      j.style.width = "90%";
    }));
    const J = () => {
      j && (j.style.transition = "width .25s ease", j.style.width = "100%");
    }, me = () => {
      W && j && (W.classList.remove("show"), j.style.transition = "none", j.style.width = "0");
    };
    try {
      const Z = await Promise.all(A), V = {
        type: E,
        ...$e ? { kind: $ } : {},
        ...R ? { title: R } : {},
        description: v,
        screenshots: Z,
        ..._.length ? { files: _ } : {},
        ...U.length ? { recordings: U } : {},
        annotations: T,
        reporterEmail: z,
        // KLA submit-target: ride the reporter's destination choice through onSubmit. Only present when the
        // segmented control was rendered (cfg.submitTargetToggle !== false); default 'project' (never surprise-
        // route to Klavity). The server resolves the real Klavity intake project — the client only says 'klavity'.
        ...n.submitTargetToggle !== !1 ? { feedbackTarget: Ys } : {},
        // KLA-586: ride the accepted AI-Enhance draft's severity/priority as structured fields (cleared on Undo).
        ...P ? { suggestedSeverity: P } : {},
        ...Ue ? { suggestedPriority: Ue } : {}
      };
      if (t.backgroundUpload) {
        t.onSubmit(V), tr({ immediate: !0, reason: "submitted" });
        return;
      }
      const ae = await t.onSubmit(V);
      if (it) return;
      J(), t.success ? ku(ae.issueKey, ae.issueUrl, t.success) : vu(ae.issueKey, ae.issueUrl);
    } catch (Z) {
      me();
      const V = (Z == null ? void 0 : Z.message) || "Unknown error";
      try {
        console.error("[Klavity] submit failed:", Z);
      } catch {
      }
      q.textContent = n.debug ? `Couldn't submit your report — ${V}` : "Couldn't submit your report. Please check your connection and try again.", q.style.display = "block", Dt.textContent = "Submit", Be(!1);
    }
  });
  function pu(v, M) {
    const { dataUrl: R, quality: E, suggestSharp: A } = kt(M);
    if (!R) return;
    const T = c.indexOf(v);
    T < 0 || (c[T] = R, p[T] = t.compressImage ? t.compressImage(R) : Promise.resolve(R), s[T] = E, h[T] = !!A && E !== "real-pixel", ne[T] && delete ne[T], delete be[T], delete Ae[T], we());
  }
  async function hu(v) {
    if (!t.onCaptureViewport) return !1;
    let M = null;
    const R = i ? qt(document.body) : null;
    try {
      const { dataUrl: E } = kt(await t.onCaptureViewport());
      E && (M = E, a = !1, Je(E, "rendered", void 0, !0, !1), v && bt(v));
    } catch {
    } finally {
      R == null || R();
    }
    return (async () => {
      const E = i ? qt(document.body) : null;
      try {
        const A = await t.onCaptureFull();
        if (M) pu(M, A);
        else {
          a = !1;
          const { dataUrl: T, quality: _, suggestSharp: U } = kt(A);
          T && (Je(T, _, void 0, !0, !!U), v && bt(v));
        }
      } catch {
        a = !1, we();
      } finally {
        E == null || E();
      }
    })(), !0;
  }
  async function Zs(v) {
    if (!t.onCaptureViewport) return !1;
    const M = i ? qt(document.body) : null;
    try {
      const { dataUrl: R } = kt(await t.onCaptureViewport());
      R ? (a = !1, Je(R, "rendered", void 0, !0, !1)) : (a = !1, we());
    } catch {
      a = !1, we();
    } finally {
      M == null || M();
    }
    return !0;
  }
  const zt = ee.querySelector("#klavity-full");
  zt.addEventListener("click", async () => {
    if (!st) {
      Be(!0), zt.classList.add("kl-loading");
      try {
        if (t.onCaptureViewport) {
          await hu(zt);
          return;
        }
        const v = i ? qt(document.body) : null;
        try {
          const { dataUrl: M, quality: R, suggestSharp: E } = kt(await t.onCaptureFull());
          Je(M, R, void 0, !0, !!E), bt(zt);
        } finally {
          v == null || v();
        }
      } catch {
      } finally {
        zt.classList.remove("kl-loading"), Be(!1);
      }
    }
  });
  async function Qs(v) {
    const M = v != null && v.viewport && t.onCaptureSharpViewport ? t.onCaptureSharpViewport : t.onCaptureSharp;
    if (st || !M || !Me) return !1;
    const R = Me.querySelector(".kl-sharp-label");
    Be(!0), Me.classList.add("kl-loading"), o.style.display = "none";
    const E = R ?? Me, A = E.textContent;
    E.textContent = "Capturing…";
    let T = !1;
    try {
      const _ = i ? qt(document.body) : null;
      let U;
      try {
        U = await M();
      } finally {
        _ == null || _();
      }
      if (U) {
        const { dataUrl: $, quality: z } = kt(U);
        $ && (Je($, z ?? "real-pixel"), bt(Me), T = !0);
      }
    } catch (_) {
      if (!yh(_))
        try {
          console.warn("[Klavity] Screen capture failed; using rendered fallback:", _);
        } catch {
        }
    } finally {
      o.style.display = "", E.textContent = A, Me.classList.remove("kl-loading"), Be(!1);
    }
    return T;
  }
  Me && t.onCaptureSharp && Me.addEventListener("click", () => {
    Qs();
  });
  const eo = ee.querySelector("#klavity-file"), to = ee.querySelector("#klavity-upload");
  to.addEventListener("click", () => {
    if (!st) {
      if (!x && c.length >= m) {
        mt(`You can attach up to ${m} images.`);
        return;
      }
      eo.click();
    }
  }), eo.addEventListener("change", async (v) => {
    const M = v.target, R = M.files ? Array.from(M.files) : [];
    if (M.value = "", !R.length) return;
    const E = c.length, A = S.length;
    x ? await cu(R) : await Bn(R), (c.length > E || S.length > A) && bt(to);
  });
  const Rr = l.getElementById("klavity-record");
  Rr && t.onRecord && Rr.addEventListener("click", async () => {
    if (st) return;
    if (I.length >= H) {
      mt(`You can attach up to ${H} recordings.`);
      return;
    }
    Be(!0), Rr.classList.add("kl-loading");
    const v = (M) => {
      o.style.display = M === "recording" ? "none" : "";
    };
    try {
      const M = await t.onRecord(v);
      M && (I.push(M), Hs(), bt(Rr));
    } catch {
    } finally {
      o.style.display = "", Rr.classList.remove("kl-loading"), Be(!1);
    }
  });
  const jn = l.getElementById("klavity-region");
  jn && t.onRegionCapture && (jn.onclick = () => {
    st || (Be(!0), document.removeEventListener("keydown", $t, { capture: !0 }), o.style.display = "none", Mh(async (v) => {
      document.addEventListener("keydown", $t, { capture: !0 });
      try {
        const M = i ? qt(document.body) : null;
        let R;
        try {
          R = await t.onRegionCapture(v);
        } finally {
          M == null || M();
        }
        if (R) {
          const { dataUrl: E, quality: A, suggestSharp: T } = kt(R);
          E && (Je(E, A, void 0, !0, !!T), bt(jn));
        }
      } finally {
        o.style.display = "", Be(!1);
      }
    }, () => {
      document.addEventListener("keydown", $t, { capture: !0 }), o.style.display = "", Be(!1);
    }));
  });
  const rr = l.getElementById("klavity-pick"), nr = l.getElementById("klavity-pickinfo"), ro = () => {
    var R;
    if (rr && (rr.classList.toggle("kl-active", !!Q), Q ? rr.setAttribute("aria-pressed", "true") : rr.removeAttribute("aria-pressed")), !nr) return;
    if (!Q) {
      nr.hidden = !0, nr.innerHTML = "";
      return;
    }
    nr.hidden = !1;
    const { text: v } = Q, M = v ? `: <span class="kl-pick-txt">${at(v)}</span>` : "";
    nr.innerHTML = `<span class="kl-pick-ic">${Y("mouse-pointer-2", { size: 13 })}</span><span>Element pinned${M}</span><button type="button" class="kl-pick-clear" id="klavity-pick-clear">Clear</button>`, (R = nr.querySelector("#klavity-pick-clear")) == null || R.addEventListener("click", () => {
      Q = null, ro();
    });
  };
  rr && t.onPickElement && (rr.onclick = async () => {
    if (!st) {
      Be(!0), document.removeEventListener("keydown", $t, { capture: !0 }), o.style.display = "none";
      try {
        const v = await t.onPickElement();
        v && (Q = v, ro(), v.shot && Je(v.shot, v.shotQuality, void 0, !0));
      } catch {
      } finally {
        document.addEventListener("keydown", $t, { capture: !0 }), o.style.display = "", Be(!1);
      }
    }
  });
  function Ct(v, M = 15) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${M}" height="${M}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em">${v}</svg>`;
  }
  function fu(v) {
    const M = (E, A, T, _) => `<button type="button" class="kl-htool" data-tool="${E}" title="${A} (${_.toUpperCase()})" aria-label="${A}">${T}<span class="kl-hk">${_.toUpperCase()}</span></button>`, R = (E) => `<button type="button" class="kl-hcolor" data-color="${E}" style="background:${E}" title="${E}" aria-label="Colour ${E}"></button>`;
    return (
      // Redaction controls grouped at the TOP of the editing toolbar: the "Mask numbers" toggle (masks digits
      // in fresh captures) sits alongside the Pixelate brush (drag to mosaic-redact a region of this image).
      `<label class="kl-hmask" title="Mask numbers in new screen captures"><input type="checkbox" class="kl-hmask-cb"${i ? " checked" : ""}>${Y("eye-off", { size: 13 })}<span>Mask numbers</span></label><span class="kl-hsep"></span>` + M("pen", "Pen", Y("pencil", { size: 15 }), "p") + M("line", "Line", Ct('<line x1="5" y1="19" x2="19" y2="5"/>'), "l") + M("rect", "Rectangle", Y("square", { size: 15 }), "r") + M("circle", "Circle", Ct('<circle cx="12" cy="12" r="9"/>'), "o") + M("arrow", "Arrow", Ct('<line x1="5" y1="19" x2="19" y2="5"/><polyline points="10 5 19 5 19 14"/>'), "a") + M("text", "Text", Ct('<path d="M5 6h14M12 6v13M9 19h6"/>'), "t") + M("count", "Numbers", Ct('<circle cx="12" cy="12" r="9"/><text x="12" y="16" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor" stroke="none">1</text>'), "c") + M("pixelate", "Redact (pixelate)", Ct('<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>'), "b") + M("crop", "Crop", Ct('<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>'), "k") + '<span class="kl-hsep"></span>' + R("#ef4444") + R("#f97316") + R("#3b82f6") + R("#111827") + // Line-width control (applies to pen/line/rect/circle/arrow strokes via Annotator.strokeScale).
      `<span class="kl-hsep"></span><span class="kl-hlabel">Stroke</span><button type="button" class="kl-hopt" data-stroke="0.6" title="Thin stroke" aria-label="Thin stroke">S</button><button type="button" class="kl-hopt kl-on" data-stroke="1" title="Medium stroke" aria-label="Medium stroke">M</button><button type="button" class="kl-hopt" data-stroke="1.8" title="Thick stroke" aria-label="Thick stroke">L</button><button type="button" class="kl-hopt" data-stroke="2.8" title="Extra-thick stroke" aria-label="Extra-thick stroke">XL</button><span class="kl-htextopts" id="kl-hero-textopts" hidden><span class="kl-hsep"></span><span class="kl-hlabel">Outline</span><button type="button" class="kl-hopt kl-on" data-outline="black" title="Black outline"><span class="kl-osq" style="background:#111"></span></button><button type="button" class="kl-hopt" data-outline="white" title="White outline"><span class="kl-osq" style="background:#fff;border:1px solid #999"></span></button><button type="button" class="kl-hopt" data-outline="none" title="No outline">None</button><span class="kl-hlabel">Size</span><button type="button" class="kl-hopt" data-size="18" title="Small">S</button><button type="button" class="kl-hopt kl-on" data-size="26" title="Medium">M</button><button type="button" class="kl-hopt" data-size="40" title="Large">L</button></span><span class="kl-hsep"></span><button type="button" class="kl-htbtn" id="kl-hero-undo" title="Undo (Cmd+Z / Ctrl+Z)" aria-label="Undo">${Ct('<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>', 14)}</button>` + // #449: explicit "Revert crop" — shown only after a crop on this image (visibility driven by the
      // per-image crop stack). Reverts the most recent crop to its pre-crop image + original markup.
      (v ? `<button type="button" class="kl-htbtn kl-hrevert" id="kl-hero-revert" title="Revert crop to original" aria-label="Revert crop">${Ct('<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 5 5v2"/>', 14)}<span class="kl-hk kl-hrevert-lbl">Revert</span></button>` : "") + `<button type="button" class="kl-htbtn" id="kl-hero-clear" title="Clear" aria-label="Clear">${Y("trash-2", { size: 14 })}</button><span class="kl-hgrow"></span><span class="kl-hhint">P pen · L line · R rect · O circle · T text · C numbers · B redact · K crop · scroll to zoom · shift-drag to pan</span>`
    );
  }
  function Ar() {
    le && (document.removeEventListener("keydown", le, { capture: !0 }), le = null);
  }
  function Hn() {
    const v = l.getElementById("klavity-hero-stage"), M = l.getElementById("klavity-hero-tools");
    M && (M.innerHTML = ""), v && (v.innerHTML = `<div class="kl-hero-empty">${Y("image", { size: 34 })}<span>Capture or upload a screenshot to start marking it up</span></div>`), Ar();
  }
  function no() {
    if (oe != null && !(S[oe] && lr(S[oe]) === "video") && (oe = null), oe != null) {
      mu(oe);
      return;
    }
    if (c.length === 0) {
      fe = 0, Hn();
      return;
    }
    fe >= c.length && (fe = c.length - 1), fe < 0 && (fe = 0), yu(fe);
  }
  function mu(v) {
    const M = l.getElementById("klavity-hero-stage"), R = l.getElementById("klavity-hero-tools"), E = S[v];
    if (!M || !E) {
      Hn();
      return;
    }
    Ar(), R && (R.innerHTML = ""), M.innerHTML = "";
    const A = document.createElement("video");
    A.src = E.dataUrl, A.controls = !0, A.setAttribute("playsinline", ""), A.preload = "metadata", A.className = "kl-hero-video", A.style.cssText = "display:block;max-width:100%;max-height:100%;border-radius:8px;background:#000;box-shadow:0 12px 40px rgba(0,0,0,.5);", M.appendChild(A);
  }
  function gu(v, M, R, E, A) {
    const T = c[v];
    if (!T) return;
    const _ = new Image();
    _.onload = () => {
      var J, me;
      if (c[v] !== T) return;
      const U = document.createElement("canvas");
      U.width = Math.max(1, Math.round(E)), U.height = Math.max(1, Math.round(A));
      const $ = U.getContext("2d");
      if (!$) return;
      $.drawImage(_, M, R, E, A, 0, 0, U.width, U.height);
      let z;
      try {
        z = U.toDataURL("image/png");
      } catch {
        return;
      }
      const q = ((J = be[v]) == null ? void 0 : J.length) ?? 0, W = Te(v);
      c[v] = z, p[v] = t.compressImage ? t.compressImage(z) : Promise.resolve(z);
      const j = (me = ne[v]) == null ? void 0 : me.shapes;
      Array.isArray(j) && j.length ? ne[v] = { w: U.width, h: U.height, shapes: fh(j, -M, -R) } : delete ne[v], (be[v] ?? (be[v] = [])).push(W), (Ae[v] ?? (Ae[v] = [])).push({ snap: W, mark: q }), we();
    }, _.src = T;
  }
  function yu(v) {
    var $, z, q, W, j;
    const M = l.getElementById("klavity-hero-stage"), R = l.getElementById("klavity-hero-tools");
    if (!M || !R) return;
    const E = c[v];
    if (!E) {
      Hn();
      return;
    }
    Ar(), M.innerHTML = "";
    const A = document.createElement("canvas");
    A.width = 1, A.height = 1, A.style.cssText = "display:block;max-width:100%;max-height:100%;object-fit:contain;cursor:crosshair;touch-action:none;background:#fff;border-radius:8px;box-shadow:0 12px 40px rgba(0,0,0,.5);";
    const T = new Eo(A, E), _ = ($ = ne[v]) == null ? void 0 : $.shapes;
    Array.isArray(_) && _.forEach((J) => T.shapes.push({ ...J })), M.appendChild(A);
    const U = new Image();
    U.onload = () => {
      !document.body.contains(o) || fe !== v || c[v] !== E || (A.width = U.naturalWidth || 1, A.height = U.naturalHeight || 1, T.redraw());
    }, U.src = E, T.redraw();
    {
      R.innerHTML = fu((((z = Ae[v]) == null ? void 0 : z.length) ?? 0) > 0);
      let J = "pen", me = "#ef4444", Z = 26, V = "black", ae = null;
      const xe = R.querySelector("#kl-hero-textopts"), Ze = () => {
        T.shapes.length ? ne[v] = { w: A.width, h: A.height, shapes: T.shapes.map((D) => ({ ...D })) } : delete ne[v];
      }, ot = (D) => {
        J = D, R.querySelectorAll("[data-tool]").forEach((B) => B.classList.toggle("kl-on", B.dataset.tool === D)), xe && (xe.hidden = D !== "text");
      }, ir = (D, B) => {
        me = D, R.querySelectorAll("[data-color]").forEach((te) => te.classList.toggle("kl-on", te === B));
      };
      R.querySelectorAll("[data-tool]").forEach((D) => D.addEventListener("click", () => ot(D.dataset.tool))), R.querySelectorAll("[data-color]").forEach((D) => D.addEventListener("click", () => ir(D.dataset.color, D)));
      const sr = R.querySelector(".kl-hmask-cb");
      sr && sr.addEventListener("change", () => {
        i = sr.checked;
      }), R.querySelectorAll("[data-outline]").forEach((D) => D.addEventListener("click", () => {
        V = D.dataset.outline, R.querySelectorAll("[data-outline]").forEach((B) => B.classList.toggle("kl-on", B === D));
      })), R.querySelectorAll("[data-size]").forEach((D) => D.addEventListener("click", () => {
        Z = Number(D.dataset.size), R.querySelectorAll("[data-size]").forEach((B) => B.classList.toggle("kl-on", B === D));
      })), R.querySelectorAll("[data-stroke]").forEach((D) => D.addEventListener("click", () => {
        T.strokeScale = Number(D.dataset.stroke) || 1, R.querySelectorAll("[data-stroke]").forEach((B) => B.classList.toggle("kl-on", B === D)), T.redraw();
      })), (q = R.querySelector("#kl-hero-undo")) == null || q.addEventListener("click", () => {
        De(v);
      }), (W = R.querySelector("#kl-hero-revert")) == null || W.addEventListener("click", () => {
        ge(v);
      }), (j = R.querySelector("#kl-hero-clear")) == null || j.addEventListener("click", () => {
        ue(v), T.clearAll(), Ze();
      }), ot(J), ir(me, R.querySelector("[data-color]"));
      const Ft = (D) => {
        const B = A.getBoundingClientRect(), te = Math.min(B.width / A.width, B.height / A.height) || 1, Oe = A.width * te, _e = A.height * te, qe = (B.width - Oe) / 2, vt = (B.height - _e) / 2;
        return { x: (D.clientX - B.left - qe) / te, y: (D.clientY - B.top - vt) / te };
      }, Tr = () => {
        const D = A.getBoundingClientRect();
        return Math.min(D.width / A.width, D.height / A.height) || 1;
      }, Ir = (D, B, te, Oe, _e, qe) => D === "line" ? { type: "line", color: qe, x1: B, y1: te, x2: Oe, y2: _e } : D === "arrow" ? { type: "arrow", color: qe, x1: B, y1: te, x2: Oe, y2: _e } : D === "rect" ? { type: "rect", color: qe, x: Math.min(B, Oe), y: Math.min(te, _e), w: Math.abs(Oe - B), h: Math.abs(_e - te) } : D === "circle" ? { type: "circle", color: qe, x: (B + Oe) / 2, y: (te + _e) / 2, rx: Math.abs(Oe - B) / 2, ry: Math.abs(_e - te) / 2 } : D === "pixelate" ? { type: "pixelate", x: Math.min(B, Oe), y: Math.min(te, _e), w: Math.abs(Oe - B), h: Math.abs(_e - te) } : null;
      let G = 1, se = 0, Se = 0, Et = null;
      const wu = (D) => Math.min(6, Math.max(1, D)), Vn = () => {
        if (G === 1) {
          se = 0, Se = 0, A.style.transform = "", A.style.cursor = "crosshair";
          return;
        }
        A.style.transformOrigin = "0 0", A.style.transform = `translate(${se}px,${Se}px) scale(${G})`, A.style.cursor = "grab";
      }, xu = (D, B, te) => {
        if (G === 1) {
          const vt = A.style.transform;
          A.style.transform = "", Et = A.getBoundingClientRect(), A.style.transform = vt;
        }
        if (!Et) return;
        const Oe = G;
        if (G = wu(G * te), G === Oe) return;
        const _e = (D - Et.left - se) / Oe, qe = (B - Et.top - Se) / Oe;
        se = D - Et.left - G * _e, Se = B - Et.top - G * qe, Vn();
      };
      M.addEventListener("wheel", (D) => {
        J !== "crop" && (D.preventDefault(), xu(D.clientX, D.clientY, D.deltaY < 0 ? 1.18 : 1 / 1.18));
      }, { passive: !1 }), M.addEventListener("dblclick", () => {
        G = 1, Vn();
      });
      let Su = T.shapes.reduce((D, B) => B.type === "count" ? Math.max(D, B.n) : D, 0), Ut = !1, Ve = 0, Ge = 0, Bt = [], or = !1, lo = 0, co = 0, uo = 0, po = 0, Ye = null, Lr = { x: 0, y: 0 };
      A.addEventListener("pointerdown", (D) => {
        if (D.shiftKey && G > 1) {
          or = !0, lo = D.clientX, co = D.clientY, uo = se, po = Se, A.style.cursor = "grabbing";
          try {
            A.setPointerCapture(D.pointerId);
          } catch {
          }
          D.preventDefault();
          return;
        }
        const B = Ft(D);
        if (Ve = B.x, Ge = B.y, J === "crop") {
          Ut = !0;
          try {
            A.setPointerCapture(D.pointerId);
          } catch {
          }
          Lr = { x: D.clientX, y: D.clientY }, Ye = document.createElement("div"), Ye.style.cssText = "position:absolute;border:2px dashed #6c63ff;background:rgba(108,99,255,.14);pointer-events:none;z-index:6;left:0;top:0;width:0;height:0;", M.appendChild(Ye);
          return;
        }
        if (J === "text") {
          const te = document.createElement("input"), Oe = V === "none" ? "none" : `0 0 2px ${V}, 0 0 2px ${V}`, _e = Tr(), qe = Math.max(6, Z * _e), vt = Z, ar = V;
          te.style.cssText = `position:fixed;left:${D.clientX}px;top:${D.clientY}px;padding:0;margin:0;line-height:1;box-sizing:content-box;background:transparent;border:0;color:${me};font-size:${qe}px;font-family:sans-serif;font-weight:700;text-shadow:${Oe};outline:1px dashed ${me};z-index:2147483647;min-width:80px;`, document.body.appendChild(te), ae = te, requestAnimationFrame(() => {
            document.body.contains(te) && te.focus();
          }), te.addEventListener("blur", () => {
            ae = null, te.value.trim() && (ue(v), T.addShape({ type: "text", color: me, x: Ve, y: Ge, text: te.value.trim(), size: vt, outline: ar }), Ze()), Le(te);
          }, { once: !0 }), te.addEventListener("keydown", (Gn) => {
            Gn.key === "Enter" && te.blur(), Gn.key === "Escape" && (te.value = "", te.blur()), Gn.stopPropagation();
          });
          return;
        }
        if (J === "count") {
          ue(v), T.addShape({ type: "count", color: me, x: B.x, y: B.y, n: ++Su }), Ze();
          return;
        }
        Ut = !0;
        try {
          A.setPointerCapture(D.pointerId);
        } catch {
        }
        J === "pen" && (Bt = [B]);
      }), A.addEventListener("pointermove", (D) => {
        if (or) {
          se = uo + (D.clientX - lo), Se = po + (D.clientY - co), Vn(), A.style.cursor = "grabbing";
          return;
        }
        if (!Ut) return;
        if (J === "pen") {
          Bt.push(Ft(D)), Bt.length > 1 && T.drawPreview({ type: "pen", color: me, points: Bt });
          return;
        }
        if (J === "crop" && Ye) {
          const Oe = M.getBoundingClientRect(), _e = Math.min(Lr.x, D.clientX), qe = Math.min(Lr.y, D.clientY), vt = Math.max(Lr.x, D.clientX), ar = Math.max(Lr.y, D.clientY);
          Ye.style.left = _e - Oe.left + "px", Ye.style.top = qe - Oe.top + "px", Ye.style.width = vt - _e + "px", Ye.style.height = ar - qe + "px";
          return;
        }
        const B = Ft(D), te = Ir(J, Ve, Ge, B.x, B.y, me);
        te && T.drawPreview(te);
      }), A.addEventListener("pointerup", (D) => {
        if (or) {
          or = !1, A.style.cursor = G > 1 ? "grab" : "crosshair";
          try {
            A.releasePointerCapture(D.pointerId);
          } catch {
          }
          return;
        }
        if (!Ut) return;
        Ut = !1;
        try {
          A.releasePointerCapture(D.pointerId);
        } catch {
        }
        const B = Ft(D);
        if (J === "crop") {
          Ye && (Le(Ye), Ye = null);
          const _e = Math.max(0, Math.min(Ve, B.x)), qe = Math.max(0, Math.min(Ge, B.y)), vt = Math.abs(B.x - Ve), ar = Math.abs(B.y - Ge);
          vt > 4 && ar > 4 && gu(v, _e, qe, vt, ar);
          return;
        }
        const te = J === "pixelate" && Math.abs(B.x - Ve) > 4 && Math.abs(B.y - Ge) > 4;
        (J === "pen" && Bt.length > 1 || J === "line" || J === "rect" || J === "circle" || J === "arrow" || te) && ue(v), J === "pen" && Bt.length > 1 ? T.addShape({ type: "pen", color: me, points: Bt }) : J === "line" ? T.addShape({ type: "line", color: me, x1: Ve, y1: Ge, x2: B.x, y2: B.y }) : J === "rect" ? T.addShape({ type: "rect", color: me, x: Math.min(Ve, B.x), y: Math.min(Ge, B.y), w: Math.abs(B.x - Ve), h: Math.abs(B.y - Ge) }) : J === "circle" ? T.addShape({ type: "circle", color: me, x: (Ve + B.x) / 2, y: (Ge + B.y) / 2, rx: Math.abs(B.x - Ve) / 2, ry: Math.abs(B.y - Ge) / 2 }) : J === "arrow" ? T.addShape({ type: "arrow", color: me, x1: Ve, y1: Ge, x2: B.x, y2: B.y }) : te && T.addShape({ type: "pixelate", x: Math.min(Ve, B.x), y: Math.min(Ge, B.y), w: Math.abs(B.x - Ve), h: Math.abs(B.y - Ge) }), Ze();
      }), A.addEventListener("pointercancel", (D) => {
        try {
          A.releasePointerCapture(D.pointerId);
        } catch {
        }
        Ye && (Le(Ye), Ye = null), or && (or = !1, A.style.cursor = G > 1 ? "grab" : "crosshair"), Ut && (Ut = !1, T.redraw());
      });
      const ho = { p: "pen", l: "line", r: "rect", o: "circle", a: "arrow", t: "text", c: "count", b: "pixelate", k: "crop" };
      le = (D) => {
        if (!document.body.contains(o)) {
          Ar();
          return;
        }
        if (ae && document.body.contains(ae)) return;
        const B = typeof D.composedPath == "function" && D.composedPath()[0] || D.target;
        if (B && (B.tagName === "INPUT" || B.tagName === "TEXTAREA" || B.tagName === "SELECT" || B.isContentEditable)) return;
        if ((D.metaKey || D.ctrlKey) && D.key.toLowerCase() === "z") {
          D.preventDefault(), De(v);
          return;
        }
        if (D.metaKey || D.ctrlKey || D.altKey) return;
        const te = D.key.toLowerCase();
        ho[te] && (D.preventDefault(), ot(ho[te]));
      }, document.addEventListener("keydown", le, { capture: !0 });
    }
  }
  function bu(v) {
    const M = c[v], R = new Image();
    R.onload = () => {
      const E = document.createElement("canvas");
      E.width = R.naturalWidth, E.height = R.naturalHeight;
      const A = new Eo(E, M);
      A.redraw();
      const T = document.createElement("div");
      T.style.cssText = "position:fixed;inset:0;background:#000;z-index:2147483647;display:flex;flex-direction:column;pointer-events:all;";
      const _ = document.createElement("div");
      _.className = "kl-edtb", _.style.cssText = "display:flex;align-items:center;gap:8px;padding:8px;background:#1e1e2e;flex-wrap:wrap;", _.innerHTML = `
        <button data-tool="pen" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${Y("pencil", { size: 14 })} Pen</button>
        <button data-tool="rect" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${Y("square", { size: 14 })} Rect</button>
        <button data-tool="arrow" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">↗ Arrow</button>
        <button data-tool="text" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">T Text</button>
        <button data-color="#ef4444" style="background:#ef4444;width:24px;height:24px;border:none;border-radius:50%;cursor:pointer;"></button>
        <button data-color="#f97316" style="background:#f97316;width:24px;height:24px;border:none;border-radius:50%;cursor:pointer;"></button>
        <button data-color="#3b82f6" style="background:#3b82f6;width:24px;height:24px;border:none;border-radius:50%;cursor:pointer;"></button>
        <button data-color="#111827" style="background:#111827;width:24px;height:24px;border:none;border-radius:50%;cursor:pointer;border:1px solid #555;"></button>
        <span style="display:inline-flex;align-items:center;gap:4px;margin-left:6px;">
          <button id="klavity-zoom-out" class="kl-zb" title="Zoom out" aria-label="Zoom out">−</button>
          <span id="klavity-zoom-pct" style="min-width:46px;text-align:center;color:#a6adc8;font-size:12px;font-variant-numeric:tabular-nums;">100%</span>
          <button id="klavity-zoom-in" class="kl-zb" title="Zoom in" aria-label="Zoom in">+</button>
          <button id="klavity-fit-width" class="kl-zb" title="Fit to width (best for tall pages)" style="font-size:11.5px;">Fit&nbsp;W</button>
          <button id="klavity-fit-page" class="kl-zb" title="Fit the whole page" style="font-size:11.5px;">Fit&nbsp;page</button>
        </span>
        <button id="klavity-undo" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;margin-left:auto;">↩ Undo</button>
        <button id="klavity-clear-ann" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${Y("trash-2", { size: 14 })} Clear</button>
        <button id="klavity-save-ann" style="padding:6px 10px;background:#89b4fa;color:#1e1e2e;border:none;border-radius:4px;cursor:pointer;font-weight:700;">${Y("check", { label: "Save", size: 14 })} Save</button>
        <button id="klavity-cancel-ann" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${Y("x", { size: 14 })}</button>
      `, E.style.cssText = "cursor:crosshair;display:block;margin:12px auto;touch-action:none;background:#fff;border-radius:4px;outline:1px solid rgba(255,255,255,.12);outline-offset:-1px;box-shadow:0 12px 44px rgba(0,0,0,.55);";
      const U = document.createElement("div");
      U.style.cssText = "flex:1;min-height:0;overflow:auto;display:block;box-shadow:inset 0 1px 0 rgba(255,255,255,.04);", U.appendChild(E);
      const $ = document.createElement("style");
      $.textContent = ".kl-edtb button{transition:transform .15s cubic-bezier(.34,1.56,.64,1),background .15s ease;will-change:transform;}.kl-edtb button:hover{transform:translateY(-1px) scale(1.02);background:#45475a;}.kl-edtb button[data-color]:hover{transform:scale(1.14);background:initial;}.kl-edtb button:active{transform:scale(.96);}.kl-edtb button:focus-visible{outline:2px solid #89b4fa;outline-offset:2px;}.kl-edtb .kl-zb{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:34px;padding:0 9px;background:#313244;color:#cdd6f4;border:none;border-radius:8px;cursor:pointer;font-size:15px;font-weight:600;line-height:1;}.kl-edtb .kl-zb:hover{background:#45475a;}@media (prefers-reduced-motion:reduce){.kl-edtb button{transition:none;}.kl-edtb button:hover,.kl-edtb button:active,.kl-edtb button[data-color]:hover{transform:none;}}", T.append($, _, U), l.appendChild(T), Ar();
      let z = 1;
      const q = (G) => Math.max(0.05, Math.min(5, G || 1));
      function W(G) {
        z = q(G), E.style.width = Math.round(E.width * z) + "px", E.style.height = Math.round(E.height * z) + "px";
        const se = _.querySelector("#klavity-zoom-pct");
        se && (se.textContent = Math.round(z * 100) + "%");
      }
      const j = () => Math.max(1, U.clientWidth - 24) / E.width, J = () => Math.min(Math.max(1, U.clientWidth - 24) / E.width, Math.max(1, U.clientHeight - 24) / E.height), me = E.height / E.width > Math.max(1, U.clientHeight) / Math.max(1, U.clientWidth);
      W(me ? j() : J()), _.querySelector("#klavity-zoom-in").addEventListener("click", () => W(z * 1.25)), _.querySelector("#klavity-zoom-out").addEventListener("click", () => W(z / 1.25)), _.querySelector("#klavity-fit-width").addEventListener("click", () => W(j())), _.querySelector("#klavity-fit-page").addEventListener("click", () => W(J()));
      let Z = "rect", V = "#ef4444", ae = !1, xe = [], Ze = 0, ot = 0;
      function ir(G) {
        Z = G, _.querySelectorAll("[data-tool]").forEach((se) => {
          const Se = se.dataset.tool === G;
          se.style.background = Se ? "#585b70" : "#313244", se.style.outline = Se ? "2px solid #89b4fa" : "none";
        });
      }
      _.querySelectorAll("[data-tool]").forEach((G) => G.addEventListener("click", () => ir(G.dataset.tool))), _.querySelectorAll("[data-color]").forEach((G) => G.addEventListener("click", () => {
        V = G.dataset.color;
      })), _.querySelector("#klavity-undo").addEventListener("click", () => A.undo()), _.querySelector("#klavity-clear-ann").addEventListener("click", () => A.clearAll());
      const sr = { p: "pen", r: "rect", c: "circle", a: "arrow", t: "text" };
      function Ft(G) {
        const se = G.target;
        if (se && (se.tagName === "INPUT" || se.tagName === "TEXTAREA" || se.isContentEditable)) return;
        if (G.key === "Escape") {
          G.stopPropagation(), Tr();
          return;
        }
        if ((G.metaKey || G.ctrlKey) && G.key.toLowerCase() === "z") {
          G.preventDefault(), A.undo();
          return;
        }
        if (G.metaKey || G.ctrlKey || G.altKey) return;
        const Se = G.key.toLowerCase();
        sr[Se] ? (G.preventDefault(), ir(sr[Se])) : Se === "u" && (G.preventDefault(), A.undo());
      }
      function Tr() {
        document.removeEventListener("keydown", Ft, { capture: !0 }), Le(T), no();
      }
      document.addEventListener("keydown", Ft, { capture: !0 }), ir(Z), _.querySelector("#klavity-save-ann").addEventListener("click", async () => {
        ue(v), A.shapes.length ? ne[v] = { w: E.width, h: E.height, shapes: A.shapes.map((G) => ({ ...G })) } : delete ne[v], Tr(), we();
      }), _.querySelector("#klavity-cancel-ann").addEventListener("click", () => Tr());
      function Ir(G) {
        const se = E.getBoundingClientRect();
        return { x: (G.clientX - se.left) / se.width * E.width, y: (G.clientY - se.top) / se.height * E.height };
      }
      E.addEventListener("pointerdown", (G) => {
        ae = !0;
        const se = Ir(G);
        if ({ x: Ze, y: ot } = se, Z === "pen" && (xe = [se]), Z === "text") {
          ae = !1;
          const Se = document.createElement("input");
          Se.style.cssText = `position:fixed;left:${G.clientX}px;top:${G.clientY}px;background:transparent;border:1px dashed ${V};color:${V};font-size:16px;outline:none;z-index:9999999;min-width:80px;`, document.body.appendChild(Se), requestAnimationFrame(() => {
            document.body.contains(Se) && Se.focus();
          }), Se.addEventListener("blur", () => {
            Se.value.trim() && A.addShape({ type: "text", color: V, x: Ze, y: ot, text: Se.value.trim() }), Le(Se);
          }, { once: !0 }), Se.addEventListener("keydown", (Et) => {
            Et.key === "Enter" && Se.blur(), Et.stopPropagation();
          });
        }
      }), E.addEventListener("pointermove", (G) => {
        ae && Z === "pen" && xe.push(Ir(G));
      }), E.addEventListener("pointerup", (G) => {
        if (!ae) return;
        ae = !1;
        const se = Ir(G);
        Z === "pen" && xe.length > 1 ? A.addShape({ type: "pen", color: V, points: xe }) : Z === "rect" ? A.addShape({ type: "rect", color: V, x: Math.min(Ze, se.x), y: Math.min(ot, se.y), w: Math.abs(se.x - Ze), h: Math.abs(se.y - ot) }) : Z === "circle" ? A.addShape({ type: "circle", color: V, x: (Ze + se.x) / 2, y: (ot + se.y) / 2, rx: Math.abs(se.x - Ze) / 2, ry: Math.abs(se.y - ot) / 2 }) : Z === "arrow" && A.addShape({ type: "arrow", color: V, x1: Ze, y1: ot, x2: se.x, y2: se.y });
      });
    }, R.src = M;
  }
  function vu(v, M) {
    const R = document.createElement("div");
    R.style.cssText = "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:all;";
    const E = document.createElement("div");
    E.className = "klavity-sent";
    const A = document.createElement("div");
    A.className = "kl-sent-check", A.innerHTML = Y("check", { label: "Sent", size: 22 }), E.appendChild(A);
    const T = document.createElement("h2");
    T.textContent = "Report sent", E.appendChild(T);
    const _ = document.createElement("p");
    if (_.textContent = n.thankYou || "We filed it and emailed you a copy.", E.appendChild(_), v) {
      const U = document.createElement("div");
      U.className = "klavity-ref";
      const $ = document.createElement("span");
      $.textContent = "Filed as";
      const z = document.createElement("code");
      z.textContent = Oo(v), U.append($, z);
      const q = _o(M);
      if (q) {
        const W = document.createElement("a");
        W.href = q, W.target = "_blank", W.rel = "noopener", W.textContent = "Open in Klavity", U.appendChild(W);
      }
      E.appendChild(U);
    }
    R.appendChild(E), Le(er), l.appendChild(R), Vs(E, Pe);
  }
  function ku(v, M, R) {
    const { copy: E, onLead: A } = R;
    ee.innerHTML = "";
    const T = document.createElement("div");
    T.className = "klavity-success";
    const _ = document.createElement("h2");
    if (_.innerHTML = E.headline, T.appendChild(_), E.body) {
      const $ = document.createElement("p");
      $.textContent = E.body, T.appendChild($);
    }
    if (v) {
      const $ = document.createElement("div");
      $.className = "klavity-ref";
      const z = document.createElement("span");
      z.textContent = "Filed as";
      const q = document.createElement("code");
      q.textContent = Oo(v), $.append(z, q);
      const W = _o(M);
      if (W) {
        const j = document.createElement("a");
        j.href = W, j.target = "_blank", j.rel = "noopener", j.textContent = "View in dashboard", $.appendChild(j);
      }
      T.appendChild($);
    }
    const U = () => Vs(ee, Xe);
    if (E.showEmail) {
      const $ = document.createElement("div");
      $.className = "klavity-lead";
      const z = document.createElement("input");
      z.type = "email", z.placeholder = "you@company.com";
      const q = document.createElement("button"), W = E.emailLabel;
      q.textContent = W;
      const j = document.createElement("div");
      j.className = "klavity-lead-err", j.setAttribute("role", "alert"), j.style.display = "none";
      const J = async () => {
        const me = z.value.trim();
        if (!me || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(me)) {
          j.textContent = "Please enter a valid email so we can reach you.", j.style.display = "block", z.focus();
          return;
        }
        q.disabled = !0, q.textContent = "Saving…", j.style.display = "none";
        try {
          A && await A(v, me);
        } catch (V) {
          try {
            console.warn("[Klavity] lead capture failed:", (V == null ? void 0 : V.message) || V);
          } catch {
          }
          j.textContent = "Couldn't save your email — please try again.", j.style.display = "block", q.disabled = !1, q.textContent = "Retry", z.focus();
          return;
        }
        const Z = document.createElement("div");
        Z.className = "klavity-thanks", Z.textContent = "Thanks — we'll be in touch.", Le(j), $.replaceWith(Z), E.showCta || U();
      };
      q.addEventListener("click", J), z.addEventListener("keydown", (me) => {
        me.key === "Enter" && J();
      }), $.append(z, q), T.appendChild($), T.appendChild(j);
    }
    if (E.showCta && E.ctaUrl) {
      const $ = document.createElement("a");
      $.className = "klavity-cta", $.href = E.ctaUrl, $.target = "_blank", $.rel = "noopener", $.textContent = E.ctaText, T.appendChild($);
    }
    if (ee.appendChild(T), !n.whiteLabel) {
      const $ = document.createElement("div");
      $.className = "klavity-pb";
      const z = document.createElement("a");
      z.href = ph("https://klavity.in", {
        campaign: "powered_by",
        medium: n.attributionMedium,
        ref: n.projectId
      }), z.target = "_blank", z.rel = "noopener", z.textContent = "Klavity", $.append("Powered by ", z), ee.appendChild($);
    }
    !E.showEmail && !E.showCta && U();
  }
  if (t.autoCaptureOnOpen) {
    let v = 0;
    try {
      v = document.getElementsByTagName("*").length;
    } catch {
      v = 0;
    }
    if (v <= f) {
      if (a = !0, we(), gh(t) === "screen")
        return (async () => {
          if (await Qs({ viewport: !0 })) {
            a = !1, we();
            return;
          }
          if (c.length) {
            a = !1, we();
            return;
          }
          if (a = !0, we(), t.onCaptureViewport) {
            Zs(null).catch(() => {
              a = !1, we();
            });
            return;
          }
          t.onCaptureFull().then((A) => {
            const { dataUrl: T, quality: _, suggestSharp: U } = kt(A);
            a = !1, Je(T, _, void 0, !0, !!U), bt(zt);
          }).catch(() => {
            a = !1, we();
          });
        })(), Bs;
      const M = () => {
        if (t.onCaptureViewport) {
          Zs(null).catch(() => {
            a = !1, we();
          });
          return;
        }
        t.onCaptureFull().then((E) => {
          const { dataUrl: A, quality: T, suggestSharp: _ } = kt(E);
          a = !1, Je(A, T, void 0, !0, !!_), bt(zt);
        }).catch(() => {
          a = !1, we();
        });
      }, R = window.requestIdleCallback;
      typeof R == "function" ? R(() => M(), { timeout: 1200 }) : requestAnimationFrame(() => setTimeout(M, 0));
    }
  }
  return Bs;
}
function Mh(e, t) {
  const r = document.createElement("div");
  r.style.cssText = "position:fixed;inset:0;cursor:crosshair;z-index:2147483646;user-select:none;", r.setAttribute("data-klavity-region-overlay", ""), document.body.appendChild(r);
  const n = document.createElement("div");
  n.textContent = "Drag to select an area · Esc to cancel", n.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-family:system-ui;font-size:14px;background:rgba(0,0,0,.7);padding:8px 16px;border-radius:6px;pointer-events:none;z-index:2147483647;", document.body.appendChild(n);
  let i = 0, o = 0, l = !1;
  function c() {
    document.removeEventListener("keydown", a, { capture: !0 }), Le(r), Le(n);
  }
  function a(p) {
    p.key === "Escape" && (p.stopPropagation(), c(), t());
  }
  document.addEventListener("keydown", a, { capture: !0 }), r.addEventListener("pointerdown", (p) => {
    l = !0, i = p.clientX, o = p.clientY, Le(n);
  }), r.addEventListener("pointermove", (p) => {
    if (!l) return;
    const s = Math.min(p.clientX, i), h = Math.min(p.clientY, o), d = Math.abs(p.clientX - i), u = Math.abs(p.clientY - o);
    r.style.background = `
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) 0 0/${s}px 100%,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${s + d}px 0/calc(100% - ${s + d}px) 100%,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${s}px 0/${d}px ${h}px,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${s}px ${h + u}px/${d}px calc(100% - ${h + u}px)
    `, r.style.backgroundRepeat = "no-repeat";
  }), r.addEventListener("pointerup", (p) => {
    if (!l) return;
    l = !1;
    const s = Math.abs(p.clientX - i), h = Math.abs(p.clientY - o);
    if (s < 8 || h < 8) {
      c(), t();
      return;
    }
    const d = { x: Math.min(p.clientX, i), y: Math.min(p.clientY, o), w: s, h };
    c(), e(d);
  });
}
async function No(e) {
  if (e.type === "image/heic" || e.type === "image/heif" || e.name.endsWith(".heic") || e.name.endsWith(".heif"))
    try {
      const t = (await import("./heic2any-D6xzzX7R.js").then((n) => n.h)).default, r = await t({ blob: e, toType: "image/jpeg", quality: 0.85 });
      return Po(r);
    } catch {
    }
  return Po(e);
}
function Po(e) {
  return new Promise((t, r) => {
    const n = new FileReader();
    n.onload = () => t(n.result), n.onerror = r, n.readAsDataURL(e);
  });
}
const Rh = {
  frustrated: { accent: "#e8849a", mark: "vein", label: "Frustrated" },
  confused: { accent: "#e8a24a", mark: "q", label: "Confused" },
  satisfied: { accent: "#7fd1c4", mark: "check", label: "Satisfied" },
  delighted: { accent: "#9fd6a0", mark: "spark", label: "Delighted" },
  neutral: { accent: "#8a8276", mark: "dots", label: "Neutral" },
  inspired: { accent: "#8b8bf5", mark: "bulb", label: "Inspired" },
  alarmed: { accent: "#ef6b6b", mark: "bang", label: "Alarmed" }
};
function Ah(e) {
  const t = (e || "").trim().split(/\s+/).filter(Boolean);
  return t.length === 0 ? "?" : t.length === 1 ? t[0].slice(0, 2).toUpperCase() : (t[0][0] + t[t.length - 1][0]).toUpperCase();
}
function Th(e) {
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
const Ih = {
  vein: "ksim-m-vein",
  spark: "ksim-m-spark",
  bulb: "ksim-m-bulb",
  bang: "ksim-m-bang",
  q: "ksim-m-q",
  dots: "ksim-m-dots",
  check: "ksim-m-check"
};
function Wt(e) {
  return String(e).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function Lh(e) {
  const {
    name: t,
    photoUrl: r,
    color: n = "#6f6cf2",
    emotion: i = "none",
    size: o = 58,
    eyes: l = !0,
    legs: c = !0,
    animate: a = !0,
    className: p = ""
  } = e, s = Wt(e.initials || Ah(t)), h = i !== "none" ? Rh[i] : null, d = h ? `<span class="ksim-mark ${a ? Ih[h.mark] : ""}" style="color:${Wt(h.accent)}">${Th(h.mark)}</span>` : "", m = r ? `<span class="ksim-head ksim-photo"><img src="${Wt(r)}" alt="${Wt(t)}" loading="lazy" onerror="this.style.display='none';this.parentNode.classList.add('ksim-fallback')"><span class="ksim-ini">${s}</span></span>` : `<span class="ksim-head ksim-mono"><span class="ksim-ini">${s}</span>${l ? '<span class="ksim-eyes"><i></i><i></i></span>' : ""}</span>`, f = c ? '<span class="ksim-legs"><i></i><i></i></span>' : "", g = ["ksim", a ? "is-animated" : "", p].filter(Boolean).join(" "), x = `--ksim-persona:${Wt(n)};--ksim-size:${o}px;` + (h ? `--ksim-accent:${Wt(h.accent)};` : "");
  return `<span class="${g}" style="${x}" data-emotion="${i}" title="${Wt(t)}">${d}${m}${f}</span>`;
}
function Oh(e) {
  const t = document.createElement("template");
  return t.innerHTML = Lh(e).trim(), t.content.firstElementChild;
}
const _h = `
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
function Nh(e = document) {
  var n;
  const t = e.head ?? e ?? null;
  if (!t || (n = t.querySelector) != null && n.call(t, "style[data-ksim]")) return;
  const r = document.createElement("style");
  r.setAttribute("data-ksim", ""), r.textContent = _h, t.appendChild(r);
}
function Ph(e) {
  const { context: t, description: r } = e, n = t.consoleErrors.map((a) => `- [${a.level ?? "error"}] \`${a.message}\``).join(`
`) || "_none_", i = t.networkFailures.map((a) => `- ${a.method} ${a.url} → ${a.status}${a.durationMs != null ? ` (${a.durationMs}ms)` : ""}`).join(`
`) || "_none_", o = [
    `*Page:* ${t.pageUrl}`,
    `*Browser:* ${t.userAgent}`,
    `*Screen:* ${t.screenSize}  |  *Viewport:* ${t.viewportSize}`
  ], l = t.identity ? Object.entries(t.identity).filter(([, a]) => a != null) : [], c = t.metadata ? Object.entries(t.metadata) : [];
  return (l.length || c.length) && o.push(`*User / metadata:* ${[...l, ...c].map(([a, p]) => `${a}=${p}`).join(", ")}`), [
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
async function $h(e) {
  const { settings: t, type: r, description: n } = e, { baseUrl: i, email: o, token: l, projectKey: c } = t.jira, a = btoa(`${o}:${l}`), p = r === "bug" ? "Bug" : "Story", s = r === "bug" ? ["klavity", "klavity-bug"] : ["klavity", "klavity-feature"], h = `[Klavity] ${n.slice(0, 180)}`, d = await fetch(`${i}/rest/api/3/issue`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${a}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      fields: {
        project: { key: c },
        summary: h,
        description: { version: 1, type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: Ph(e) }] }] },
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
    const x = await (await fetch(g)).blob(), b = new FormData();
    b.append("file", x, `klavity-screenshot-${Date.now()}.png`), await fetch(`${i}/rest/api/3/issue/${m}/attachments`, {
      method: "POST",
      headers: { Authorization: `Basic ${a}`, "X-Atlassian-Token": "no-check" },
      body: b
    });
  }
  return { issueKey: m, issueUrl: f };
}
async function Dh(e) {
  var h, d, u;
  const { settings: t, type: r, description: n, context: i } = e, { apiKey: o, teamId: l } = t.linear, c = [
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
          teamId: l,
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
async function zh(e) {
  const { settings: t, type: r, description: n, context: i, screenshots: o } = e, { token: l, repo: c } = t.github, a = r === "bug" ? ["klavity", "klavity-bug"] : ["klavity", "klavity-feature"], p = o.length ? `

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
      Authorization: `Bearer ${l}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: `[Klavity] ${n.slice(0, 180)}`,
      body: s,
      labels: a
    })
  });
  if (!h.ok)
    throw new Error(`GitHub API error ${h.status}: ${await h.text()}`);
  const d = await h.json();
  return { issueKey: `#${d.number}`, issueUrl: d.html_url };
}
async function Fh(e) {
  const { settings: t, description: r, context: n } = e, { token: i, workspace: o, projectId: l } = t.plane, c = (t.plane.host || "https://api.plane.so").replace(/\/+$/, ""), a = c === "https://api.plane.so" ? "https://app.plane.so" : c, p = await fetch(
    `${c}/api/v1/workspaces/${o}/projects/${l}/issues/`,
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
    issueUrl: `${a}/${o}/projects/${l}/issues/`
  };
}
function Uh(e) {
  const t = new FormData();
  return t.set("type", e.type ?? "bug"), t.set("description", e.description), t.set("page_url", e.pageUrl), e.context && t.set("context", JSON.stringify(e.context)), e.projectId && t.set("project_id", e.projectId), e.replayEvents && e.replayEvents.length && t.set("replay_events", JSON.stringify(e.replayEvents)), t;
}
async function Bh(e) {
  const { settings: t, type: r, description: n, context: i, screenshots: o, projectId: l, replayEvents: c } = e, a = Uh({ type: r, description: n, pageUrl: i.pageUrl, context: i, projectId: l, replayEvents: c }), p = t.connectionMode === "klavity" && !!t.klavToken;
  if (!p) {
    const { plane: u } = t;
    a.append("plane_token", u.token), a.append("plane_workspace", u.workspace), a.append("plane_project_id", u.projectId), a.append("plane_host", u.host);
  }
  for (let u = 0; u < o.length; u++) {
    const m = await (await fetch(o[u])).blob();
    a.append("screenshots", m, `screenshot-${u}.png`);
  }
  const s = p ? { Authorization: `Bearer ${t.klavToken}` } : {}, h = await fetch(`${t.backendUrl}/api/feedback`, { method: "POST", headers: s, body: a });
  if (!h.ok) throw new Error(`Klavity backend error ${h.status}: ${await h.text()}`);
  const d = await h.json();
  return {
    issueKey: d.jira_key ?? d.id,
    issueUrl: d.issue_url ?? t.backendUrl
  };
}
var qh = Object.defineProperty, Wh = (e, t, r) => t in e ? qh(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, F = (e, t, r) => Wh(e, typeof t != "symbol" ? t + "" : t, r), $o, jh = Object.defineProperty, Hh = (e, t, r) => t in e ? jh(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, Do = (e, t, r) => Hh(e, typeof t != "symbol" ? t + "" : t, r), Ne = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(Ne || {});
const zo = {
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
}, Fo = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, Qr = {}, Wl = {}, Vh = () => !!globalThis.Zone;
function ws(e) {
  if (Qr[e])
    return Qr[e];
  const t = globalThis[e], r = t.prototype, n = e in zo ? zo[e] : void 0, i = !!(n && // @ts-expect-error 2345
  n.every(
    (c) => {
      var a, p;
      return !!((p = (a = Object.getOwnPropertyDescriptor(r, c)) == null ? void 0 : a.get) != null && p.toString().includes("[native code]"));
    }
  )), o = e in Fo ? Fo[e] : void 0, l = !!(o && o.every(
    // @ts-expect-error 2345
    (c) => {
      var a;
      return typeof r[c] == "function" && ((a = r[c]) == null ? void 0 : a.toString().includes("[native code]"));
    }
  ));
  if (i && l && !Vh())
    return Qr[e] = t.prototype, t.prototype;
  try {
    const c = document.createElement("iframe");
    c.style.display = "none", document.body.appendChild(c);
    const a = c.contentWindow;
    if (!a) return t.prototype;
    const p = a[e].prototype;
    if (!p)
      return c.remove(), r;
    const s = navigator.userAgent;
    return s.includes("Safari") && !s.includes("Chrome") ? (c.classList.add("rr-block"), c.setAttribute("__rrwebUntaintedMutationObserver", ""), Wl[e] = () => c.remove()) : c.remove(), Qr[e] = p;
  } catch {
    return r;
  }
}
const ti = {};
function Rt(e, t, r) {
  var n;
  const i = `${e}.${String(r)}`;
  if (ti[i])
    return ti[i].call(
      t
    );
  const o = ws(e), l = (n = Object.getOwnPropertyDescriptor(
    o,
    r
  )) == null ? void 0 : n.get;
  return l ? (ti[i] = l, l.call(t)) : t[r];
}
const ri = {};
function jl(e, t, r) {
  const n = `${e}.${String(r)}`;
  if (ri[n])
    return ri[n].bind(
      t
    );
  const o = ws(e)[r];
  return typeof o != "function" ? t[r] : (ri[n] = o, o.bind(t));
}
function Gh(e) {
  return Rt("Node", e, "ownerDocument");
}
function Yh(e) {
  return Rt("Node", e, "childNodes");
}
function Kh(e) {
  return Rt("Node", e, "parentNode");
}
function Xh(e) {
  return Rt("Node", e, "parentElement");
}
function Jh(e) {
  return Rt("Node", e, "textContent");
}
function Zh(e, t) {
  return jl("Node", e, "contains")(t);
}
function Qh(e) {
  return jl("Node", e, "getRootNode")();
}
function ef(e) {
  return !e || !("host" in e) ? null : Rt("ShadowRoot", e, "host");
}
function tf(e) {
  return e.styleSheets;
}
function rf(e) {
  return !e || !("shadowRoot" in e) ? null : Rt("Element", e, "shadowRoot");
}
function nf(e, t) {
  return Rt("Element", e, "querySelector")(t);
}
function sf(e, t) {
  return Rt("Element", e, "querySelectorAll")(t);
}
function of() {
  return [
    ws("MutationObserver").constructor,
    Wl.MutationObserver ?? (() => {
    })
  ];
}
let Hl = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (Hl = () => (/* @__PURE__ */ new Date()).getTime());
function af(e, t, r) {
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
const Fe = {
  ownerDocument: Gh,
  childNodes: Yh,
  parentNode: Kh,
  parentElement: Xh,
  textContent: Jh,
  contains: Zh,
  getRootNode: Qh,
  host: ef,
  styleSheets: tf,
  shadowRoot: rf,
  querySelector: nf,
  querySelectorAll: sf,
  nowTimestamp: Hl,
  mutationObserverCtor: of,
  patch: af
};
function Vl(e) {
  return e.nodeType === e.ELEMENT_NODE;
}
function Nr(e) {
  const t = (
    // anchor and textarea elements also have a `host` property
    // but only shadow roots have a `mode` property
    e && "host" in e && "mode" in e && Fe.host(e) || null
  );
  return !!(t && "shadowRoot" in t && Fe.shadowRoot(t) === e);
}
function Pr(e) {
  return Object.prototype.toString.call(e) === "[object ShadowRoot]";
}
function lf(e) {
  return e.includes(" background-clip: text;") && !e.includes(" -webkit-background-clip: text;") && (e = e.replace(
    /\sbackground-clip:\s*text;/g,
    " -webkit-background-clip: text; background-clip: text;"
  )), e;
}
function cf(e) {
  const { cssText: t } = e;
  if (t.split('"').length < 3) return t;
  const r = ["@import", `url(${JSON.stringify(e.href)})`];
  return e.layerName === "" ? r.push("layer") : e.layerName && r.push(`layer(${e.layerName})`), e.supportsText && r.push(`supports(${e.supportsText})`), e.media.length && r.push(e.media.mediaText), r.join(" ") + ";";
}
function us(e) {
  try {
    const t = e.rules || e.cssRules;
    if (!t)
      return null;
    let r = e.href;
    !r && e.ownerNode && (r = e.ownerNode.baseURI);
    const n = Array.from(
      t,
      (i) => Gl(i, r)
    ).join("");
    return lf(n);
  } catch {
    return null;
  }
}
function Gl(e, t) {
  if (df(e)) {
    let r;
    try {
      r = // for same-origin stylesheets,
      // we can access the imported stylesheet rules directly
      us(e.styleSheet) || // work around browser issues with the raw string `@import url(...)` statement
      cf(e);
    } catch {
      r = e.cssText;
    }
    return e.styleSheet.href ? bn(r, e.styleSheet.href) : r;
  } else {
    let r = e.cssText;
    return pf(e) && e.selectorText.includes(":") && (r = uf(r)), t ? bn(r, t) : r;
  }
}
function uf(e) {
  const t = /(\[(?:[\w-]+)[^\\])(:(?:[\w-]+)\])/gm;
  return e.replace(t, "$1\\$2");
}
function df(e) {
  return "styleSheet" in e;
}
function pf(e) {
  return "selectorText" in e;
}
class Yl {
  constructor() {
    Do(this, "idNodeMap", /* @__PURE__ */ new Map()), Do(this, "nodeMetaMap", /* @__PURE__ */ new WeakMap());
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
function hf() {
  return new Yl();
}
function gn({
  element: e,
  maskInputOptions: t,
  tagName: r,
  type: n,
  value: i,
  maskInputFn: o
}) {
  let l = i || "";
  const c = n && Kt(n);
  return (t[r.toLowerCase()] || c && t[c]) && (o ? l = o(l, e) : l = "*".repeat(l.length)), l;
}
function Kt(e) {
  return e.toLowerCase();
}
const Uo = "__rrweb_original__";
function ff(e) {
  const t = e.getContext("2d");
  if (!t) return !0;
  const r = 50;
  for (let n = 0; n < e.width; n += r)
    for (let i = 0; i < e.height; i += r) {
      const o = t.getImageData, l = Uo in o ? o[Uo] : o;
      if (new Uint32Array(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        l.call(
          t,
          n,
          i,
          Math.min(r, e.width - n),
          Math.min(r, e.height - i)
        ).data.buffer
      ).some((a) => a !== 0)) return !1;
    }
  return !0;
}
function yn(e) {
  const t = e.type;
  return e.hasAttribute("data-rr-is-password") ? "password" : t ? (
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    Kt(t)
  ) : null;
}
function Kl(e, t) {
  let r;
  try {
    r = new URL(e, t ?? window.location.href);
  } catch {
    return null;
  }
  const n = /\.([0-9a-z]+)(?:$)/i, i = r.pathname.match(n);
  return (i == null ? void 0 : i[1]) ?? null;
}
function mf(e) {
  let t = "";
  return e.indexOf("//") > -1 ? t = e.split("/").slice(0, 3).join("/") : t = e.split("/")[0], t = t.split("?")[0], t;
}
const gf = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm, yf = /^(?:[a-z+]+:)?\/\//i, bf = /^www\..*/i, vf = /^(data:)([^,]*),(.*)/i;
function bn(e, t) {
  return (e || "").replace(
    gf,
    (r, n, i, o, l, c) => {
      const a = i || l || c, p = n || o || "";
      if (!a)
        return r;
      if (yf.test(a) || bf.test(a))
        return `url(${p}${a}${p})`;
      if (vf.test(a))
        return `url(${p}${a}${p})`;
      if (a[0] === "/")
        return `url(${p}${mf(t) + a}${p})`;
      const s = t.split("/"), h = a.split("/");
      s.pop();
      for (const d of h)
        d !== "." && (d === ".." ? s.pop() : s.push(d));
      return `url(${p}${s.join("/")}${p})`;
    }
  );
}
function en(e, t = !1) {
  return t ? e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "") : e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "").replace(/0px/g, "0");
}
function kf(e, t, r = !1) {
  const n = Array.from(t.childNodes), i = [];
  let o = 0;
  if (n.length > 1 && e && typeof e == "string") {
    let l = en(e, r);
    const c = l.length / e.length;
    for (let a = 1; a < n.length; a++)
      if (n[a].textContent && typeof n[a].textContent == "string") {
        const p = en(
          n[a].textContent,
          r
        ), s = 100;
        let h = 3;
        for (; h < p.length && // keep consuming css identifiers (to get a decent chunk more quickly)
        (p[h].match(/[a-zA-Z0-9]/) || // substring needs to be unique to this section
        p.indexOf(p.substring(0, h), 1) !== -1); h++)
          ;
        for (; h < p.length; h++) {
          let d = p.substring(0, h), u = l.split(d), m = -1;
          if (u.length === 2)
            m = u[0].length;
          else if (u.length > 2 && u[0] === "" && n[a - 1].textContent !== "")
            m = l.indexOf(d, 1);
          else if (u.length === 1) {
            if (d = d.substring(
              0,
              d.length - 1
            ), u = l.split(d), u.length <= 1)
              return i.push(e), i;
            h = s + 1;
          } else h === p.length - 1 && (m = l.indexOf(d));
          if (u.length >= 2 && h > s) {
            const f = n[a - 1].textContent;
            if (f && typeof f == "string") {
              const g = en(f).length;
              m = l.indexOf(d, g);
            }
            m === -1 && (m = u[0].length);
          }
          if (m !== -1) {
            let f = Math.floor(m / c);
            for (; f > 0 && f < e.length; ) {
              if (o += 1, o > 50 * n.length)
                return i.push(e), i;
              const g = en(
                e.substring(0, f),
                r
              );
              if (g.length === m) {
                i.push(e.substring(0, f)), e = e.substring(f), l = l.substring(m);
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
function wf(e, t) {
  return kf(e, t).join("/* rr_split */");
}
let xf = 1;
const Sf = new RegExp("[^a-z0-9-_:]"), Ur = -2;
function Xl() {
  return xf++;
}
function Cf(e) {
  if (e instanceof HTMLFormElement)
    return "form";
  const t = Kt(e.tagName);
  return Sf.test(t) ? "div" : t;
}
let cr, Bo;
const Ef = /^[^ \t\n\r\u000c]+/, Mf = /^[, \t\n\r\u000c]+/;
function Rf(e, t) {
  if (t.trim() === "")
    return t;
  let r = 0;
  function n(o) {
    let l;
    const c = o.exec(t.substring(r));
    return c ? (l = c[0], r += l.length, l) : "";
  }
  const i = [];
  for (; n(Mf), !(r >= t.length); ) {
    let o = n(Ef);
    if (o.slice(-1) === ",")
      o = hr(e, o.substring(0, o.length - 1)), i.push(o);
    else {
      let l = "";
      o = hr(e, o);
      let c = !1;
      for (; ; ) {
        const a = t.charAt(r);
        if (a === "") {
          i.push((o + l).trim());
          break;
        } else if (c)
          a === ")" && (c = !1);
        else if (a === ",") {
          r += 1, i.push((o + l).trim());
          break;
        } else a === "(" && (c = !0);
        l += a, r += 1;
      }
    }
  }
  return i.join(", ");
}
const qo = /* @__PURE__ */ new WeakMap();
function hr(e, t) {
  return !t || t.trim() === "" ? t : xs(e, t);
}
function Af(e) {
  return !!(e.tagName === "svg" || e.ownerSVGElement);
}
function xs(e, t) {
  let r = qo.get(e);
  if (r || (r = e.createElement("a"), qo.set(e, r)), !t)
    t = "";
  else if (t.startsWith("blob:") || t.startsWith("data:"))
    return t;
  return r.setAttribute("href", t), r.href;
}
function Jl(e, t, r, n) {
  return n && (r === "src" || r === "href" && !(t === "use" && n[0] === "#") || r === "xlink:href" && n[0] !== "#" || r === "background" && ["table", "td", "th"].includes(t) ? hr(e, n) : r === "srcset" ? Rf(e, n) : r === "style" ? bn(n, xs(e)) : t === "object" && r === "data" ? hr(e, n) : n);
}
function Zl(e, t, r) {
  return ["video", "audio"].includes(e) && t === "autoplay";
}
function Tf(e, t, r) {
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
function vn(e, t, r) {
  if (!e) return !1;
  if (e.nodeType !== e.ELEMENT_NODE)
    return r ? vn(Fe.parentNode(e), t, r) : !1;
  for (let n = e.classList.length; n--; ) {
    const i = e.classList[n];
    if (t.test(i))
      return !0;
  }
  return r ? vn(Fe.parentNode(e), t, r) : !1;
}
function Ql(e, t, r, n) {
  let i;
  if (Vl(e)) {
    if (i = e, !Fe.childNodes(i).length)
      return !1;
  } else {
    if (Fe.parentElement(e) === null)
      return !1;
    i = Fe.parentElement(e);
  }
  try {
    if (typeof t == "string") {
      if (n) {
        if (i.closest(`.${t}`)) return !0;
      } else if (i.classList.contains(t)) return !0;
    } else if (vn(i, t, n)) return !0;
    if (r) {
      if (n) {
        if (i.closest(r)) return !0;
      } else if (i.matches(r)) return !0;
    }
  } catch {
  }
  return !1;
}
function If(e, t, r) {
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
  const l = "about:blank";
  if (n.location.href !== l || e.src === l || e.src === "")
    return setTimeout(t, 0), e.addEventListener("load", t);
  e.addEventListener("load", t);
}
function Lf(e, t, r) {
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
function Of(e, t) {
  const {
    doc: r,
    mirror: n,
    blockClass: i,
    blockSelector: o,
    needsMask: l,
    inlineStylesheet: c,
    maskInputOptions: a = {},
    maskTextFn: p,
    maskInputFn: s,
    dataURLOptions: h = {},
    inlineImages: d,
    recordCanvas: u,
    keepIframeSrcFn: m,
    newlyAddedElement: f = !1,
    cssCaptured: g = !1
  } = t, x = _f(r, n);
  switch (e.nodeType) {
    case e.DOCUMENT_NODE:
      return e.compatMode !== "CSS1Compat" ? {
        type: Ne.Document,
        childNodes: [],
        compatMode: e.compatMode
        // probably "BackCompat"
      } : {
        type: Ne.Document,
        childNodes: []
      };
    case e.DOCUMENT_TYPE_NODE:
      return {
        type: Ne.DocumentType,
        name: e.name,
        publicId: e.publicId,
        systemId: e.systemId,
        rootId: x
      };
    case e.ELEMENT_NODE:
      return Pf(e, {
        doc: r,
        blockClass: i,
        blockSelector: o,
        inlineStylesheet: c,
        maskInputOptions: a,
        maskInputFn: s,
        dataURLOptions: h,
        inlineImages: d,
        recordCanvas: u,
        keepIframeSrcFn: m,
        newlyAddedElement: f,
        rootId: x
      });
    case e.TEXT_NODE:
      return Nf(e, {
        doc: r,
        needsMask: l,
        maskTextFn: p,
        rootId: x,
        cssCaptured: g
      });
    case e.CDATA_SECTION_NODE:
      return {
        type: Ne.CDATA,
        textContent: "",
        rootId: x
      };
    case e.COMMENT_NODE:
      return {
        type: Ne.Comment,
        textContent: Fe.textContent(e) || "",
        rootId: x
      };
    default:
      return !1;
  }
}
function _f(e, t) {
  if (!t.hasNode(e)) return;
  const r = t.getId(e);
  return r === 1 ? void 0 : r;
}
function Nf(e, t) {
  const { needsMask: r, maskTextFn: n, rootId: i, cssCaptured: o } = t, l = Fe.parentNode(e), c = l && l.tagName;
  let a = "";
  const p = c === "STYLE" ? !0 : void 0, s = c === "SCRIPT" ? !0 : void 0;
  return s ? a = "SCRIPT_PLACEHOLDER" : o || (a = Fe.textContent(e), p && a && (a = bn(a, xs(t.doc)))), !p && !s && a && r && (a = n ? n(a, Fe.parentElement(e)) : a.replace(/[\S]/g, "*")), {
    type: Ne.Text,
    textContent: a || "",
    rootId: i
  };
}
function Pf(e, t) {
  const {
    doc: r,
    blockClass: n,
    blockSelector: i,
    inlineStylesheet: o,
    maskInputOptions: l = {},
    maskInputFn: c,
    dataURLOptions: a = {},
    inlineImages: p,
    recordCanvas: s,
    keepIframeSrcFn: h,
    newlyAddedElement: d = !1,
    rootId: u
  } = t, m = Tf(e, n, i), f = Cf(e);
  let g = {};
  const x = e.attributes.length;
  for (let y = 0; y < x; y++) {
    const C = e.attributes[y];
    Zl(f, C.name, C.value) || (g[C.name] = Jl(
      r,
      f,
      Kt(C.name),
      C.value
    ));
  }
  if (f === "link" && o) {
    const y = Array.from(r.styleSheets).find((w) => w.href === e.href);
    let C = null;
    y && (C = us(y)), C && (delete g.rel, delete g.href, g._cssText = C);
  }
  if (f === "style" && e.sheet) {
    let y = us(
      e.sheet
    );
    y && (e.childNodes.length > 1 && (y = wf(y, e)), g._cssText = y);
  }
  if (["input", "textarea", "select"].includes(f)) {
    const y = e.value, C = e.checked;
    g.type !== "radio" && g.type !== "checkbox" && g.type !== "submit" && g.type !== "button" && y ? g.value = gn({
      element: e,
      type: yn(e),
      tagName: f,
      value: y,
      maskInputOptions: l,
      maskInputFn: c
    }) : C && (g.checked = C);
  }
  if (f === "option" && (e.selected && !l.select ? g.selected = !0 : delete g.selected), f === "dialog" && e.open && (g.rr_open_mode = e.matches("dialog:modal") ? "modal" : "non-modal"), f === "canvas" && s) {
    if (e.__context === "2d")
      ff(e) || (g.rr_dataURL = e.toDataURL(
        a.type,
        a.quality
      ));
    else if (!("__context" in e)) {
      const y = e.toDataURL(
        a.type,
        a.quality
      ), C = r.createElement("canvas");
      C.width = e.width, C.height = e.height;
      const w = C.toDataURL(
        a.type,
        a.quality
      );
      y !== w && (g.rr_dataURL = y);
    }
  }
  if (f === "img" && p) {
    cr || (cr = r.createElement("canvas"), Bo = cr.getContext("2d"));
    const y = e, C = y.currentSrc || y.getAttribute("src") || "<unknown-src>", w = y.crossOrigin, k = () => {
      y.removeEventListener("load", k);
      try {
        cr.width = y.naturalWidth, cr.height = y.naturalHeight, Bo.drawImage(y, 0, 0), g.rr_dataURL = cr.toDataURL(
          a.type,
          a.quality
        );
      } catch (S) {
        if (y.crossOrigin !== "anonymous") {
          y.crossOrigin = "anonymous", y.complete && y.naturalWidth !== 0 ? k() : y.addEventListener("load", k);
          return;
        } else
          console.warn(
            `Cannot inline img src=${C}! Error: ${S}`
          );
      }
      y.crossOrigin === "anonymous" && (w ? g.crossOrigin = w : y.removeAttribute("crossorigin"));
    };
    y.complete && y.naturalWidth !== 0 ? k() : y.addEventListener("load", k);
  }
  if (["audio", "video"].includes(f)) {
    const y = g;
    y.rr_mediaState = e.paused ? "paused" : "played", y.rr_mediaCurrentTime = e.currentTime, y.rr_mediaPlaybackRate = e.playbackRate, y.rr_mediaMuted = e.muted, y.rr_mediaLoop = e.loop, y.rr_mediaVolume = e.volume;
  }
  if (d || (e.scrollLeft && (g.rr_scrollLeft = e.scrollLeft), e.scrollTop && (g.rr_scrollTop = e.scrollTop)), m) {
    const { width: y, height: C } = e.getBoundingClientRect();
    g = {
      class: g.class,
      rr_width: `${y}px`,
      rr_height: `${C}px`
    };
  }
  f === "iframe" && !h(g.src) && (e.contentDocument || (g.rr_src = g.src), delete g.src);
  let b;
  try {
    customElements.get(f) && (b = !0);
  } catch {
  }
  return {
    type: Ne.Element,
    tagName: f,
    attributes: g,
    childNodes: [],
    isSVG: Af(e) || void 0,
    needBlock: m,
    rootId: u,
    isCustom: b
  };
}
function ve(e) {
  return e == null ? "" : e.toLowerCase();
}
function ec(e) {
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
function $f(e, t) {
  if (t.comment && e.type === Ne.Comment)
    return !0;
  if (e.type === Ne.Element) {
    if (t.script && // script tag
    (e.tagName === "script" || // (module)preload link
    e.tagName === "link" && (e.attributes.rel === "preload" && e.attributes.as === "script" || e.attributes.rel === "modulepreload") || // prefetch link
    e.tagName === "link" && e.attributes.rel === "prefetch" && typeof e.attributes.href == "string" && Kl(e.attributes.href) === "js"))
      return !0;
    if (t.headFavicon && (e.tagName === "link" && e.attributes.rel === "shortcut icon" || e.tagName === "meta" && (ve(e.attributes.name).match(
      /^msapplication-tile(image|color)$/
    ) || ve(e.attributes.name) === "application-name" || ve(e.attributes.rel) === "icon" || ve(e.attributes.rel) === "apple-touch-icon" || ve(e.attributes.rel) === "shortcut icon")))
      return !0;
    if (e.tagName === "meta") {
      if (t.headMetaDescKeywords && ve(e.attributes.name).match(/^description|keywords$/))
        return !0;
      if (t.headMetaSocial && (ve(e.attributes.property).match(/^(og|twitter|fb):/) || // og = opengraph (facebook)
      ve(e.attributes.name).match(/^(og|twitter):/) || ve(e.attributes.name) === "pinterest"))
        return !0;
      if (t.headMetaRobots && (ve(e.attributes.name) === "robots" || ve(e.attributes.name) === "googlebot" || ve(e.attributes.name) === "bingbot"))
        return !0;
      if (t.headMetaHttpEquiv && e.attributes["http-equiv"] !== void 0)
        return !0;
      if (t.headMetaAuthorship && (ve(e.attributes.name) === "author" || ve(e.attributes.name) === "generator" || ve(e.attributes.name) === "framework" || ve(e.attributes.name) === "publisher" || ve(e.attributes.name) === "progid" || ve(e.attributes.property).match(/^article:/) || ve(e.attributes.property).match(/^product:/)))
        return !0;
      if (t.headMetaVerification && (ve(e.attributes.name) === "google-site-verification" || ve(e.attributes.name) === "yandex-verification" || ve(e.attributes.name) === "csrf-token" || ve(e.attributes.name) === "p:domain_verify" || ve(e.attributes.name) === "verify-v1" || ve(e.attributes.name) === "verification" || ve(e.attributes.name) === "shopify-checkout-api-token"))
        return !0;
    }
  }
  return !1;
}
function fr(e, t) {
  const {
    doc: r,
    mirror: n,
    blockClass: i,
    blockSelector: o,
    maskTextClass: l,
    maskTextSelector: c,
    skipChild: a = !1,
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
    iframeLoadTimeout: y = 5e3,
    onStylesheetLoad: C,
    stylesheetLoadTimeout: w = 5e3,
    keepIframeSrcFn: k = () => !1,
    newlyAddedElement: S = !1,
    cssCaptured: L = !1
  } = t;
  let { needsMask: N } = t, { preserveWhiteSpace: O = !0 } = t;
  N || (N = Ql(
    e,
    l,
    c,
    N === void 0
  ));
  const K = Of(e, {
    doc: r,
    mirror: n,
    blockClass: i,
    blockSelector: o,
    needsMask: N,
    inlineStylesheet: p,
    maskInputOptions: s,
    maskTextFn: h,
    maskInputFn: d,
    dataURLOptions: m,
    inlineImages: f,
    recordCanvas: g,
    keepIframeSrcFn: k,
    newlyAddedElement: S,
    cssCaptured: L
  });
  if (!K)
    return console.warn(e, "not serialized"), null;
  let H;
  n.hasNode(e) ? H = n.getId(e) : $f(K, u) || !O && K.type === Ne.Text && !K.textContent.replace(/^\s+|\s+$/gm, "").length ? H = Ur : H = Xl();
  const I = Object.assign(K, { id: H });
  if (n.add(e, I), H === Ur)
    return null;
  x && x(e);
  let $e = !a;
  if (I.type === Ne.Element) {
    $e = $e && !I.needBlock, delete I.needBlock;
    const Q = Fe.shadowRoot(e);
    Q && Pr(Q) && (I.isShadowHost = !0);
  }
  if ((I.type === Ne.Document || I.type === Ne.Element) && $e) {
    u.headWhitespace && I.type === Ne.Element && I.tagName === "head" && (O = !1);
    const Q = {
      doc: r,
      mirror: n,
      blockClass: i,
      blockSelector: o,
      needsMask: N,
      maskTextClass: l,
      maskTextSelector: c,
      skipChild: a,
      inlineStylesheet: p,
      maskInputOptions: s,
      maskTextFn: h,
      maskInputFn: d,
      slimDOMOptions: u,
      dataURLOptions: m,
      inlineImages: f,
      recordCanvas: g,
      preserveWhiteSpace: O,
      onSerialize: x,
      onIframeLoad: b,
      iframeLoadTimeout: y,
      onStylesheetLoad: C,
      stylesheetLoadTimeout: w,
      keepIframeSrcFn: k,
      cssCaptured: !1
    };
    if (!(I.type === Ne.Element && I.tagName === "textarea" && I.attributes.value !== void 0)) {
      I.type === Ne.Element && I.attributes._cssText !== void 0 && typeof I.attributes._cssText == "string" && (Q.cssCaptured = !0);
      for (const ye of Array.from(Fe.childNodes(e))) {
        const fe = fr(ye, Q);
        fe && I.childNodes.push(fe);
      }
    }
    let he = null;
    if (Vl(e) && (he = Fe.shadowRoot(e)))
      for (const ye of Array.from(Fe.childNodes(he))) {
        const fe = fr(ye, Q);
        fe && (Pr(he) && (fe.isShadow = !0), I.childNodes.push(fe));
      }
  }
  const ne = Fe.parentNode(e);
  return ne && Nr(ne) && Pr(ne) && (I.isShadow = !0), I.type === Ne.Element && I.tagName === "iframe" && If(
    e,
    () => {
      const Q = e.contentDocument;
      if (Q && b) {
        const he = fr(Q, {
          doc: Q,
          mirror: n,
          blockClass: i,
          blockSelector: o,
          needsMask: N,
          maskTextClass: l,
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
          preserveWhiteSpace: O,
          onSerialize: x,
          onIframeLoad: b,
          iframeLoadTimeout: y,
          onStylesheetLoad: C,
          stylesheetLoadTimeout: w,
          keepIframeSrcFn: k
        });
        he && b(
          e,
          he
        );
      }
    },
    y
  ), I.type === Ne.Element && I.tagName === "link" && typeof I.attributes.rel == "string" && (I.attributes.rel === "stylesheet" || I.attributes.rel === "preload" && typeof I.attributes.href == "string" && Kl(I.attributes.href) === "css") && Lf(
    e,
    () => {
      if (C) {
        const Q = fr(e, {
          doc: r,
          mirror: n,
          blockClass: i,
          blockSelector: o,
          needsMask: N,
          maskTextClass: l,
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
          preserveWhiteSpace: O,
          onSerialize: x,
          onIframeLoad: b,
          iframeLoadTimeout: y,
          onStylesheetLoad: C,
          stylesheetLoadTimeout: w,
          keepIframeSrcFn: k
        });
        Q && C(
          e,
          Q
        );
      }
    },
    w
  ), I;
}
function Df(e, t) {
  const {
    mirror: r = new Yl(),
    blockClass: n = "rr-block",
    blockSelector: i = null,
    maskTextClass: o = "rr-mask",
    maskTextSelector: l = null,
    inlineStylesheet: c = !0,
    inlineImages: a = !1,
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
    onStylesheetLoad: y,
    stylesheetLoadTimeout: C,
    keepIframeSrcFn: w = () => !1
  } = t, k = s === !0 ? {
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
  } : s, S = ec(u);
  return fr(e, {
    doc: e,
    mirror: r,
    blockClass: n,
    blockSelector: i,
    maskTextClass: o,
    maskTextSelector: l,
    skipChild: !1,
    inlineStylesheet: c,
    maskInputOptions: k,
    maskTextFn: h,
    maskInputFn: d,
    slimDOMOptions: S,
    dataURLOptions: m,
    inlineImages: a,
    recordCanvas: p,
    preserveWhiteSpace: f,
    onSerialize: g,
    onIframeLoad: x,
    iframeLoadTimeout: b,
    onStylesheetLoad: y,
    stylesheetLoadTimeout: C,
    keepIframeSrcFn: w,
    newlyAddedElement: !1
  });
}
function zf(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function Ff(e) {
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
var tn = { exports: {} }, Wo;
function Uf() {
  if (Wo) return tn.exports;
  Wo = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return tn.exports = t(), tn.exports.createColors = t, tn.exports;
}
const Bf = {}, qf = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Bf
}, Symbol.toStringTag, { value: "Module" })), ht = /* @__PURE__ */ Ff(qf);
var ni, jo;
function Ss() {
  if (jo) return ni;
  jo = 1;
  let e = /* @__PURE__ */ Uf(), t = ht;
  class r extends Error {
    constructor(i, o, l, c, a, p) {
      super(i), this.name = "CssSyntaxError", this.reason = i, a && (this.file = a), c && (this.source = c), p && (this.plugin = p), typeof o < "u" && typeof l < "u" && (typeof o == "number" ? (this.line = o, this.column = l) : (this.line = o.line, this.column = o.column, this.endLine = l.line, this.endColumn = l.column)), this.setMessage(), Error.captureStackTrace && Error.captureStackTrace(this, r);
    }
    setMessage() {
      this.message = this.plugin ? this.plugin + ": " : "", this.message += this.file ? this.file : "<css input>", typeof this.line < "u" && (this.message += ":" + this.line + ":" + this.column), this.message += ": " + this.reason;
    }
    showSourceCode(i) {
      if (!this.source) return "";
      let o = this.source;
      i == null && (i = e.isColorSupported), t && i && (o = t(o));
      let l = o.split(/\r?\n/), c = Math.max(this.line - 3, 0), a = Math.min(this.line + 2, l.length), p = String(a).length, s, h;
      if (i) {
        let { bold: d, gray: u, red: m } = e.createColors(!0);
        s = (f) => d(m(f)), h = (f) => u(f);
      } else
        s = h = (d) => d;
      return l.slice(c, a).map((d, u) => {
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
  return ni = r, r.default = r, ni;
}
var rn = {}, Ho;
function Cs() {
  return Ho || (Ho = 1, rn.isClean = Symbol("isClean"), rn.my = Symbol("my")), rn;
}
var ii, Vo;
function tc() {
  if (Vo) return ii;
  Vo = 1;
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
      let l = "@" + i.name, c = i.params ? this.rawValue(i, "params") : "";
      if (typeof i.raws.afterName < "u" ? l += i.raws.afterName : c && (l += " "), i.nodes)
        this.block(i, l + c);
      else {
        let a = (i.raws.between || "") + (o ? ";" : "");
        this.builder(l + c + a, i);
      }
    }
    beforeAfter(i, o) {
      let l;
      i.type === "decl" ? l = this.raw(i, null, "beforeDecl") : i.type === "comment" ? l = this.raw(i, null, "beforeComment") : o === "before" ? l = this.raw(i, null, "beforeRule") : l = this.raw(i, null, "beforeClose");
      let c = i.parent, a = 0;
      for (; c && c.type !== "root"; )
        a += 1, c = c.parent;
      if (l.includes(`
`)) {
        let p = this.raw(i, null, "indent");
        if (p.length)
          for (let s = 0; s < a; s++) l += p;
      }
      return l;
    }
    block(i, o) {
      let l = this.raw(i, "between", "beforeOpen");
      this.builder(o + l + "{", i, "start");
      let c;
      i.nodes && i.nodes.length ? (this.body(i), c = this.raw(i, "after")) : c = this.raw(i, "after", "emptyBody"), c && this.builder(c), this.builder("}", i, "end");
    }
    body(i) {
      let o = i.nodes.length - 1;
      for (; o > 0 && i.nodes[o].type === "comment"; )
        o -= 1;
      let l = this.raw(i, "semicolon");
      for (let c = 0; c < i.nodes.length; c++) {
        let a = i.nodes[c], p = this.raw(a, "before");
        p && this.builder(p), this.stringify(a, o !== c || l);
      }
    }
    comment(i) {
      let o = this.raw(i, "left", "commentLeft"), l = this.raw(i, "right", "commentRight");
      this.builder("/*" + o + i.text + l + "*/", i);
    }
    decl(i, o) {
      let l = this.raw(i, "between", "colon"), c = i.prop + l + this.rawValue(i, "value");
      i.important && (c += i.raws.important || " !important"), o && (c += ";"), this.builder(c, i);
    }
    document(i) {
      this.body(i);
    }
    raw(i, o, l) {
      let c;
      if (l || (l = o), o && (c = i.raws[o], typeof c < "u"))
        return c;
      let a = i.parent;
      if (l === "before" && (!a || a.type === "root" && a.first === i || a && a.type === "document"))
        return "";
      if (!a) return e[l];
      let p = i.root();
      if (p.rawCache || (p.rawCache = {}), typeof p.rawCache[l] < "u")
        return p.rawCache[l];
      if (l === "before" || l === "after")
        return this.beforeAfter(i, l);
      {
        let s = "raw" + t(l);
        this[s] ? c = this[s](p, i) : p.walk((h) => {
          if (c = h.raws[o], typeof c < "u") return !1;
        });
      }
      return typeof c > "u" && (c = e[l]), p.rawCache[l] = c, c;
    }
    rawBeforeClose(i) {
      let o;
      return i.walk((l) => {
        if (l.nodes && l.nodes.length > 0 && typeof l.raws.after < "u")
          return o = l.raws.after, o.includes(`
`) && (o = o.replace(/[^\n]+$/, "")), !1;
      }), o && (o = o.replace(/\S/g, "")), o;
    }
    rawBeforeComment(i, o) {
      let l;
      return i.walkComments((c) => {
        if (typeof c.raws.before < "u")
          return l = c.raws.before, l.includes(`
`) && (l = l.replace(/[^\n]+$/, "")), !1;
      }), typeof l > "u" ? l = this.raw(o, null, "beforeDecl") : l && (l = l.replace(/\S/g, "")), l;
    }
    rawBeforeDecl(i, o) {
      let l;
      return i.walkDecls((c) => {
        if (typeof c.raws.before < "u")
          return l = c.raws.before, l.includes(`
`) && (l = l.replace(/[^\n]+$/, "")), !1;
      }), typeof l > "u" ? l = this.raw(o, null, "beforeRule") : l && (l = l.replace(/\S/g, "")), l;
    }
    rawBeforeOpen(i) {
      let o;
      return i.walk((l) => {
        if (l.type !== "decl" && (o = l.raws.between, typeof o < "u"))
          return !1;
      }), o;
    }
    rawBeforeRule(i) {
      let o;
      return i.walk((l) => {
        if (l.nodes && (l.parent !== i || i.first !== l) && typeof l.raws.before < "u")
          return o = l.raws.before, o.includes(`
`) && (o = o.replace(/[^\n]+$/, "")), !1;
      }), o && (o = o.replace(/\S/g, "")), o;
    }
    rawColon(i) {
      let o;
      return i.walkDecls((l) => {
        if (typeof l.raws.between < "u")
          return o = l.raws.between.replace(/[^\s:]/g, ""), !1;
      }), o;
    }
    rawEmptyBody(i) {
      let o;
      return i.walk((l) => {
        if (l.nodes && l.nodes.length === 0 && (o = l.raws.after, typeof o < "u"))
          return !1;
      }), o;
    }
    rawIndent(i) {
      if (i.raws.indent) return i.raws.indent;
      let o;
      return i.walk((l) => {
        let c = l.parent;
        if (c && c !== i && c.parent && c.parent === i && typeof l.raws.before < "u") {
          let a = l.raws.before.split(`
`);
          return o = a[a.length - 1], o = o.replace(/\S/g, ""), !1;
        }
      }), o;
    }
    rawSemicolon(i) {
      let o;
      return i.walk((l) => {
        if (l.nodes && l.nodes.length && l.last.type === "decl" && (o = l.raws.semicolon, typeof o < "u"))
          return !1;
      }), o;
    }
    rawValue(i, o) {
      let l = i[o], c = i.raws[o];
      return c && c.value === l ? c.raw : l;
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
  return ii = r, r.default = r, ii;
}
var si, Go;
function Tn() {
  if (Go) return si;
  Go = 1;
  let e = tc();
  function t(r, n) {
    new e(n).stringify(r);
  }
  return si = t, t.default = t, si;
}
var oi, Yo;
function In() {
  if (Yo) return oi;
  Yo = 1;
  let { isClean: e, my: t } = Cs(), r = Ss(), n = tc(), i = Tn();
  function o(c, a) {
    let p = new c.constructor();
    for (let s in c) {
      if (!Object.prototype.hasOwnProperty.call(c, s) || s === "proxyCache") continue;
      let h = c[s], d = typeof h;
      s === "parent" && d === "object" ? a && (p[s] = a) : s === "source" ? p[s] = h : Array.isArray(h) ? p[s] = h.map((u) => o(u, p)) : (d === "object" && h !== null && (h = o(h)), p[s] = h);
    }
    return p;
  }
  class l {
    constructor(a = {}) {
      this.raws = {}, this[e] = !1, this[t] = !0;
      for (let p in a)
        if (p === "nodes") {
          this.nodes = [];
          for (let s of a[p])
            typeof s.clone == "function" ? this.append(s.clone()) : this.append(s);
        } else
          this[p] = a[p];
    }
    addToError(a) {
      if (a.postcssNode = this, a.stack && this.source && /\n\s{4}at /.test(a.stack)) {
        let p = this.source;
        a.stack = a.stack.replace(
          /\n\s{4}at /,
          `$&${p.input.from}:${p.start.line}:${p.start.column}$&`
        );
      }
      return a;
    }
    after(a) {
      return this.parent.insertAfter(this, a), this;
    }
    assign(a = {}) {
      for (let p in a)
        this[p] = a[p];
      return this;
    }
    before(a) {
      return this.parent.insertBefore(this, a), this;
    }
    cleanRaws(a) {
      delete this.raws.before, delete this.raws.after, a || delete this.raws.between;
    }
    clone(a = {}) {
      let p = o(this);
      for (let s in a)
        p[s] = a[s];
      return p;
    }
    cloneAfter(a = {}) {
      let p = this.clone(a);
      return this.parent.insertAfter(this, p), p;
    }
    cloneBefore(a = {}) {
      let p = this.clone(a);
      return this.parent.insertBefore(this, p), p;
    }
    error(a, p = {}) {
      if (this.source) {
        let { end: s, start: h } = this.rangeBy(p);
        return this.source.input.error(
          a,
          { column: h.column, line: h.line },
          { column: s.column, line: s.line },
          p
        );
      }
      return new r(a);
    }
    getProxyProcessor() {
      return {
        get(a, p) {
          return p === "proxyOf" ? a : p === "root" ? () => a.root().toProxy() : a[p];
        },
        set(a, p, s) {
          return a[p] === s || (a[p] = s, (p === "prop" || p === "value" || p === "name" || p === "params" || p === "important" || /* c8 ignore next */
          p === "text") && a.markDirty()), !0;
        }
      };
    }
    markDirty() {
      if (this[e]) {
        this[e] = !1;
        let a = this;
        for (; a = a.parent; )
          a[e] = !1;
      }
    }
    next() {
      if (!this.parent) return;
      let a = this.parent.index(this);
      return this.parent.nodes[a + 1];
    }
    positionBy(a, p) {
      let s = this.source.start;
      if (a.index)
        s = this.positionInside(a.index, p);
      else if (a.word) {
        p = this.toString();
        let h = p.indexOf(a.word);
        h !== -1 && (s = this.positionInside(h, p));
      }
      return s;
    }
    positionInside(a, p) {
      let s = p || this.toString(), h = this.source.start.column, d = this.source.start.line;
      for (let u = 0; u < a; u++)
        s[u] === `
` ? (h = 1, d += 1) : h += 1;
      return { column: h, line: d };
    }
    prev() {
      if (!this.parent) return;
      let a = this.parent.index(this);
      return this.parent.nodes[a - 1];
    }
    rangeBy(a) {
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
      if (a.word) {
        let h = this.toString(), d = h.indexOf(a.word);
        d !== -1 && (p = this.positionInside(d, h), s = this.positionInside(d + a.word.length, h));
      } else
        a.start ? p = {
          column: a.start.column,
          line: a.start.line
        } : a.index && (p = this.positionInside(a.index)), a.end ? s = {
          column: a.end.column,
          line: a.end.line
        } : typeof a.endIndex == "number" ? s = this.positionInside(a.endIndex) : a.index && (s = this.positionInside(a.index + 1));
      return (s.line < p.line || s.line === p.line && s.column <= p.column) && (s = { column: p.column + 1, line: p.line }), { end: s, start: p };
    }
    raw(a, p) {
      return new n().raw(this, a, p);
    }
    remove() {
      return this.parent && this.parent.removeChild(this), this.parent = void 0, this;
    }
    replaceWith(...a) {
      if (this.parent) {
        let p = this, s = !1;
        for (let h of a)
          h === this ? s = !0 : s ? (this.parent.insertAfter(p, h), p = h) : this.parent.insertBefore(p, h);
        s || this.remove();
      }
      return this;
    }
    root() {
      let a = this;
      for (; a.parent && a.parent.type !== "document"; )
        a = a.parent;
      return a;
    }
    toJSON(a, p) {
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
    toString(a = i) {
      a.stringify && (a = a.stringify);
      let p = "";
      return a(this, (s) => {
        p += s;
      }), p;
    }
    warn(a, p, s) {
      let h = { node: this };
      for (let d in s) h[d] = s[d];
      return a.warn(p, h);
    }
    get proxyOf() {
      return this;
    }
  }
  return oi = l, l.default = l, oi;
}
var ai, Ko;
function Ln() {
  if (Ko) return ai;
  Ko = 1;
  let e = In();
  class t extends e {
    constructor(n) {
      n && typeof n.value < "u" && typeof n.value != "string" && (n = { ...n, value: String(n.value) }), super(n), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return ai = t, t.default = t, ai;
}
var li, Xo;
function Wf() {
  if (Xo) return li;
  Xo = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return li = { nanoid: (n = 21) => {
    let i = "", o = n;
    for (; o--; )
      i += e[Math.random() * 64 | 0];
    return i;
  }, customAlphabet: (n, i = 21) => (o = i) => {
    let l = "", c = o;
    for (; c--; )
      l += n[Math.random() * n.length | 0];
    return l;
  } }, li;
}
var ci, Jo;
function rc() {
  if (Jo) return ci;
  Jo = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = ht, { existsSync: r, readFileSync: n } = ht, { dirname: i, join: o } = ht;
  function l(a) {
    return Buffer ? Buffer.from(a, "base64").toString() : window.atob(a);
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
        return l(p.substr(RegExp.lastMatch.length));
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
  return ci = c, c.default = c, ci;
}
var ui, Zo;
function On() {
  if (Zo) return ui;
  Zo = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = ht, { fileURLToPath: r, pathToFileURL: n } = ht, { isAbsolute: i, resolve: o } = ht, { nanoid: l } = /* @__PURE__ */ Wf(), c = ht, a = Ss(), p = rc(), s = Symbol("fromOffsetCache"), h = !!(e && t), d = !!(o && i);
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
      this.file || (this.id = "<input css " + l(6) + ">"), this.map && (this.map.file = this.from);
    }
    error(f, g, x, b = {}) {
      let y, C, w;
      if (g && typeof g == "object") {
        let S = g, L = x;
        if (typeof S.offset == "number") {
          let N = this.fromOffset(S.offset);
          g = N.line, x = N.col;
        } else
          g = S.line, x = S.column;
        if (typeof L.offset == "number") {
          let N = this.fromOffset(L.offset);
          C = N.line, w = N.col;
        } else
          C = L.line, w = L.column;
      } else if (!x) {
        let S = this.fromOffset(g);
        g = S.line, x = S.col;
      }
      let k = this.origin(g, x, C, w);
      return k ? y = new a(
        f,
        k.endLine === void 0 ? k.line : { column: k.column, line: k.line },
        k.endLine === void 0 ? k.column : { column: k.endColumn, line: k.endLine },
        k.source,
        k.file,
        b.plugin
      ) : y = new a(
        f,
        C === void 0 ? g : { column: x, line: g },
        C === void 0 ? x : { column: w, line: C },
        this.css,
        this.file,
        b.plugin
      ), y.input = { column: x, endColumn: w, endLine: C, line: g, source: this.css }, this.file && (n && (y.input.url = n(this.file).toString()), y.input.file = this.file), y;
    }
    fromOffset(f) {
      let g, x;
      if (this[s])
        x = this[s];
      else {
        let y = this.css.split(`
`);
        x = new Array(y.length);
        let C = 0;
        for (let w = 0, k = y.length; w < k; w++)
          x[w] = C, C += y[w].length + 1;
        this[s] = x;
      }
      g = x[x.length - 1];
      let b = 0;
      if (f >= g)
        b = x.length - 1;
      else {
        let y = x.length - 2, C;
        for (; b < y; )
          if (C = b + (y - b >> 1), f < x[C])
            y = C - 1;
          else if (f >= x[C + 1])
            b = C + 1;
          else {
            b = C;
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
      let y = this.map.consumer(), C = y.originalPositionFor({ column: g, line: f });
      if (!C.source) return !1;
      let w;
      typeof x == "number" && (w = y.originalPositionFor({ column: b, line: x }));
      let k;
      i(C.source) ? k = n(C.source) : k = new URL(
        C.source,
        this.map.consumer().sourceRoot || n(this.map.mapFile)
      );
      let S = {
        column: C.column,
        endColumn: w && w.column,
        endLine: w && w.line,
        line: C.line,
        url: k.toString()
      };
      if (k.protocol === "file:")
        if (r)
          S.file = r(k);
        else
          throw new Error("file: protocol is not available in this PostCSS build");
      let L = y.sourceContentFor(C.source);
      return L && (S.source = L), S;
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
  return ui = u, u.default = u, c && c.registerInput && c.registerInput(u), ui;
}
var di, Qo;
function nc() {
  if (Qo) return di;
  Qo = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = ht, { dirname: r, relative: n, resolve: i, sep: o } = ht, { pathToFileURL: l } = ht, c = On(), a = !!(e && t), p = !!(r && i && n && o);
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
      if (this.clearAnnotation(), p && a && this.isMap())
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
      this.stringify(this.root, (b, y, C) => {
        if (this.css += b, y && C !== "end" && (f.generated.line = d, f.generated.column = u - 1, y.source && y.source.start ? (f.source = this.sourcePath(y), f.original.line = y.source.start.line, f.original.column = y.source.start.column - 1, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, this.map.addMapping(f))), g = b.match(/\n/g), g ? (d += g.length, x = b.lastIndexOf(`
`), u = b.length - x) : u += b.length, y && C !== "start") {
          let w = y.parent || { raws: {} };
          (!(y.type === "decl" || y.type === "atrule" && !y.nodes) || y !== w.last || w.raws.semicolon) && (y.source && y.source.end ? (f.source = this.sourcePath(y), f.original.line = y.source.end.line, f.original.column = y.source.end.column - 1, f.generated.line = d, f.generated.column = u - 2, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, f.generated.line = d, f.generated.column = u - 1, this.map.addMapping(f)));
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
      if (l) {
        let m = l(d).toString();
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
  return di = s, di;
}
var pi, ea;
function _n() {
  if (ea) return pi;
  ea = 1;
  let e = In();
  class t extends e {
    constructor(n) {
      super(n), this.type = "comment";
    }
  }
  return pi = t, t.default = t, pi;
}
var hi, ta;
function Xt() {
  if (ta) return hi;
  ta = 1;
  let { isClean: e, my: t } = Cs(), r = Ln(), n = _n(), i = In(), o, l, c, a;
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
      for (let y of x) this.proxyOf.nodes.splice(f, 0, y);
      let b;
      for (let y in this.indexes)
        b = this.indexes[y], f <= b && (this.indexes[y] = b + x.length);
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
        u = [new l(u)];
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
    l = d;
  }, h.registerAtRule = (d) => {
    c = d;
  }, h.registerRoot = (d) => {
    a = d;
  }, hi = h, h.default = h, h.rebuild = (d) => {
    d.type === "atrule" ? Object.setPrototypeOf(d, c.prototype) : d.type === "rule" ? Object.setPrototypeOf(d, l.prototype) : d.type === "decl" ? Object.setPrototypeOf(d, r.prototype) : d.type === "comment" ? Object.setPrototypeOf(d, n.prototype) : d.type === "root" && Object.setPrototypeOf(d, a.prototype), d[t] = !0, d.nodes && d.nodes.forEach((u) => {
      h.rebuild(u);
    });
  }, hi;
}
var fi, ra;
function Es() {
  if (ra) return fi;
  ra = 1;
  let e = Xt(), t, r;
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
  }, fi = n, n.default = n, fi;
}
var mi, na;
function ic() {
  if (na) return mi;
  na = 1;
  let e = {};
  return mi = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, mi;
}
var gi, ia;
function sc() {
  if (ia) return gi;
  ia = 1;
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
  return gi = e, e.default = e, gi;
}
var yi, sa;
function Ms() {
  if (sa) return yi;
  sa = 1;
  let e = sc();
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
  return yi = t, t.default = t, yi;
}
var bi, oa;
function jf() {
  if (oa) return bi;
  oa = 1;
  const e = 39, t = 34, r = 92, n = 47, i = 10, o = 32, l = 12, c = 9, a = 13, p = 91, s = 93, h = 40, d = 41, u = 123, m = 125, f = 59, g = 42, x = 58, b = 64, y = /[\t\n\f\r "#'()/;[\\\]{}]/g, C = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, w = /.[\r\n"'(/\\]/, k = /[\da-f]/i;
  return bi = function(L, N = {}) {
    let O = L.css.valueOf(), K = N.ignoreErrors, H, I, $e, ne, Q, he, ye, fe, oe, le, nt = O.length, P = 0, Ue = [], Re = [];
    function it() {
      return P;
    }
    function Pe(X) {
      throw L.error("Unclosed " + X, P);
    }
    function Xe() {
      return Re.length === 0 && P >= nt;
    }
    function be(X) {
      if (Re.length) return Re.pop();
      if (P >= nt) return;
      let Te = X ? X.ignoreUnclosed : !1;
      switch (H = O.charCodeAt(P), H) {
        case i:
        case o:
        case c:
        case a:
        case l: {
          I = P;
          do
            I += 1, H = O.charCodeAt(I);
          while (H === o || H === i || H === c || H === a || H === l);
          le = ["space", O.slice(P, I)], P = I - 1;
          break;
        }
        case p:
        case s:
        case u:
        case m:
        case x:
        case f:
        case d: {
          let ue = String.fromCharCode(H);
          le = [ue, ue, P];
          break;
        }
        case h: {
          if (fe = Ue.length ? Ue.pop()[1] : "", oe = O.charCodeAt(P + 1), fe === "url" && oe !== e && oe !== t && oe !== o && oe !== i && oe !== c && oe !== l && oe !== a) {
            I = P;
            do {
              if (he = !1, I = O.indexOf(")", I + 1), I === -1)
                if (K || Te) {
                  I = P;
                  break;
                } else
                  Pe("bracket");
              for (ye = I; O.charCodeAt(ye - 1) === r; )
                ye -= 1, he = !he;
            } while (he);
            le = ["brackets", O.slice(P, I + 1), P, I], P = I;
          } else
            I = O.indexOf(")", P + 1), ne = O.slice(P, I + 1), I === -1 || w.test(ne) ? le = ["(", "(", P] : (le = ["brackets", ne, P, I], P = I);
          break;
        }
        case e:
        case t: {
          $e = H === e ? "'" : '"', I = P;
          do {
            if (he = !1, I = O.indexOf($e, I + 1), I === -1)
              if (K || Te) {
                I = P + 1;
                break;
              } else
                Pe("string");
            for (ye = I; O.charCodeAt(ye - 1) === r; )
              ye -= 1, he = !he;
          } while (he);
          le = ["string", O.slice(P, I + 1), P, I], P = I;
          break;
        }
        case b: {
          y.lastIndex = P + 1, y.test(O), y.lastIndex === 0 ? I = O.length - 1 : I = y.lastIndex - 2, le = ["at-word", O.slice(P, I + 1), P, I], P = I;
          break;
        }
        case r: {
          for (I = P, Q = !0; O.charCodeAt(I + 1) === r; )
            I += 1, Q = !Q;
          if (H = O.charCodeAt(I + 1), Q && H !== n && H !== o && H !== i && H !== c && H !== a && H !== l && (I += 1, k.test(O.charAt(I)))) {
            for (; k.test(O.charAt(I + 1)); )
              I += 1;
            O.charCodeAt(I + 1) === o && (I += 1);
          }
          le = ["word", O.slice(P, I + 1), P, I], P = I;
          break;
        }
        default: {
          H === n && O.charCodeAt(P + 1) === g ? (I = O.indexOf("*/", P + 2) + 1, I === 0 && (K || Te ? I = O.length : Pe("comment")), le = ["comment", O.slice(P, I + 1), P, I], P = I) : (C.lastIndex = P + 1, C.test(O), C.lastIndex === 0 ? I = O.length - 1 : I = C.lastIndex - 2, le = ["word", O.slice(P, I + 1), P, I], Ue.push(le), P = I);
          break;
        }
      }
      return P++, le;
    }
    function Ae(X) {
      Re.push(X);
    }
    return {
      back: Ae,
      endOfFile: Xe,
      nextToken: be,
      position: it
    };
  }, bi;
}
var vi, aa;
function Rs() {
  if (aa) return vi;
  aa = 1;
  let e = Xt();
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
  return vi = t, t.default = t, e.registerAtRule(t), vi;
}
var ki, la;
function jr() {
  if (la) return ki;
  la = 1;
  let e = Xt(), t, r;
  class n extends e {
    constructor(o) {
      super(o), this.type = "root", this.nodes || (this.nodes = []);
    }
    normalize(o, l, c) {
      let a = super.normalize(o);
      if (l) {
        if (c === "prepend")
          this.nodes.length > 1 ? l.raws.before = this.nodes[1].raws.before : delete l.raws.before;
        else if (this.first !== l)
          for (let p of a)
            p.raws.before = l.raws.before;
      }
      return a;
    }
    removeChild(o, l) {
      let c = this.index(o);
      return !l && c === 0 && this.nodes.length > 1 && (this.nodes[1].raws.before = this.nodes[c].raws.before), super.removeChild(o);
    }
    toResult(o = {}) {
      return new t(new r(), this, o).stringify();
    }
  }
  return n.registerLazyResult = (i) => {
    t = i;
  }, n.registerProcessor = (i) => {
    r = i;
  }, ki = n, n.default = n, e.registerRoot(n), ki;
}
var wi, ca;
function oc() {
  if (ca) return wi;
  ca = 1;
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
      let i = [], o = "", l = !1, c = 0, a = !1, p = "", s = !1;
      for (let h of t)
        s ? s = !1 : h === "\\" ? s = !0 : a ? h === p && (a = !1) : h === '"' || h === "'" ? (a = !0, p = h) : h === "(" ? c += 1 : h === ")" ? c > 0 && (c -= 1) : c === 0 && r.includes(h) && (l = !0), l ? (o !== "" && i.push(o.trim()), o = "", l = !1) : o += h;
      return (n || o !== "") && i.push(o.trim()), i;
    }
  };
  return wi = e, e.default = e, wi;
}
var xi, ua;
function As() {
  if (ua) return xi;
  ua = 1;
  let e = Xt(), t = oc();
  class r extends e {
    constructor(i) {
      super(i), this.type = "rule", this.nodes || (this.nodes = []);
    }
    get selectors() {
      return t.comma(this.selector);
    }
    set selectors(i) {
      let o = this.selector ? this.selector.match(/,\s*/) : null, l = o ? o[0] : "," + this.raw("between", "beforeOpen");
      this.selector = i.join(l);
    }
  }
  return xi = r, r.default = r, e.registerRule(r), xi;
}
var Si, da;
function Hf() {
  if (da) return Si;
  da = 1;
  let e = Ln(), t = jf(), r = _n(), n = Rs(), i = jr(), o = As();
  const l = {
    empty: !0,
    space: !0
  };
  function c(p) {
    for (let s = p.length - 1; s >= 0; s--) {
      let h = p[s], d = h[3] || h[2];
      if (d) return d;
    }
  }
  class a {
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
          let y = this.stringFrom(s, b);
          y = this.spacesFromEnd(s) + y, y !== " !important" && (d.raws.important = y);
          break;
        } else if (m[1].toLowerCase() === "important") {
          let y = s.slice(0), C = "";
          for (let w = b; w > 0; w--) {
            let k = y[w][0];
            if (C.trim().indexOf("!") === 0 && k !== "space")
              break;
            C = y.pop()[1] + C;
          }
          C.trim().indexOf("!") === 0 && (d.important = !0, d.raws.important = C, s = y);
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
      let m, f, g = d.length, x = "", b = !0, y, C;
      for (let w = 0; w < g; w += 1)
        m = d[w], f = m[0], f === "space" && w === g - 1 && !u ? b = !1 : f === "comment" ? (C = d[w - 1] ? d[w - 1][0] : "empty", y = d[w + 1] ? d[w + 1][0] : "empty", !l[C] && !l[y] ? x.slice(-1) === "," ? b = !1 : x += m[1] : b = !1) : x += m[1];
      if (!b) {
        let w = d.reduce((k, S) => k + S[1], "");
        s.raws[h] = { raw: w, value: x };
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
  return Si = a, Si;
}
var Ci, pa;
function Ts() {
  if (pa) return Ci;
  pa = 1;
  let e = Xt(), t = Hf(), r = On();
  function n(i, o) {
    let l = new r(i, o), c = new t(l);
    try {
      c.parse();
    } catch (a) {
      throw process.env.NODE_ENV !== "production" && a.name === "CssSyntaxError" && o && o.from && (/\.scss$/i.test(o.from) ? a.message += `
You tried to parse SCSS with the standard CSS parser; try again with the postcss-scss parser` : /\.sass/i.test(o.from) ? a.message += `
You tried to parse Sass with the standard CSS parser; try again with the postcss-sass parser` : /\.less$/i.test(o.from) && (a.message += `
You tried to parse Less with the standard CSS parser; try again with the postcss-less parser`)), a;
    }
    return c.root;
  }
  return Ci = n, n.default = n, e.registerParse(n), Ci;
}
var Ei, ha;
function ac() {
  if (ha) return Ei;
  ha = 1;
  let { isClean: e, my: t } = Cs(), r = nc(), n = Tn(), i = Xt(), o = Es(), l = ic(), c = Ms(), a = Ts(), p = jr();
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
  function m(C) {
    return typeof C == "object" && typeof C.then == "function";
  }
  function f(C) {
    let w = !1, k = s[C.type];
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
  let b = {};
  class y {
    constructor(w, k, S) {
      this.stringified = !1, this.processed = !1;
      let L;
      if (typeof k == "object" && k !== null && (k.type === "root" || k.type === "document"))
        L = x(k);
      else if (k instanceof y || k instanceof c)
        L = x(k.root), k.map && (typeof S.map > "u" && (S.map = {}), S.map.inline || (S.map.inline = !1), S.map.prev = k.map);
      else {
        let N = a;
        S.syntax && (N = S.syntax.parse), S.parser && (N = S.parser), N.parse && (N = N.parse);
        try {
          L = N(k, S);
        } catch (O) {
          this.processed = !0, this.error = O;
        }
        L && !L[t] && i.rebuild(L);
      }
      this.result = new c(w, L, S), this.helpers = { ...b, postcss: b, result: this.result }, this.plugins = this.processor.plugins.map((N) => typeof N == "object" && N.prepare ? { ...N, ...N.prepare(this.result) } : N);
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
      let S = this.result.lastPlugin;
      try {
        if (k && k.addToError(w), this.error = w, w.name === "CssSyntaxError" && !w.plugin)
          w.plugin = S.postcssPlugin, w.setMessage();
        else if (S.postcssVersion && process.env.NODE_ENV !== "production") {
          let L = S.postcssPlugin, N = S.postcssVersion, O = this.result.processor.version, K = N.split("."), H = O.split(".");
          (K[0] !== H[0] || parseInt(K[1]) > parseInt(H[1])) && console.error(
            "Unknown error from PostCSS plugin. Your current PostCSS version is " + O + ", but " + L + " uses " + N + ". Perhaps this is the source of the error below."
          );
        }
      } catch (L) {
        console && console.error && console.error(L);
      }
      return w;
    }
    prepareVisitors() {
      this.listeners = {};
      let w = (k, S, L) => {
        this.listeners[S] || (this.listeners[S] = []), this.listeners[S].push([k, L]);
      };
      for (let k of this.plugins)
        if (typeof k == "object")
          for (let S in k) {
            if (!h[S] && /^[A-Z]/.test(S))
              throw new Error(
                `Unknown event ${S} in ${k.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`
              );
            if (!d[S])
              if (typeof k[S] == "object")
                for (let L in k[S])
                  L === "*" ? w(k, S, k[S][L]) : w(
                    k,
                    S + "-" + L.toLowerCase(),
                    k[S][L]
                  );
              else typeof k[S] == "function" && w(k, S, k[S]);
          }
      this.hasListener = Object.keys(this.listeners).length > 0;
    }
    async runAsync() {
      this.plugin = 0;
      for (let w = 0; w < this.plugins.length; w++) {
        let k = this.plugins[w], S = this.runOnRoot(k);
        if (m(S))
          try {
            await S;
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
            let S = this.visitTick(k);
            if (m(S))
              try {
                await S;
              } catch (L) {
                let N = k[k.length - 1].node;
                throw this.handleError(L, N);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [k, S] of this.listeners.OnceExit) {
            this.result.lastPlugin = k;
            try {
              if (w.type === "document") {
                let L = w.nodes.map(
                  (N) => S(N, this.helpers)
                );
                await Promise.all(L);
              } else
                await S(w, this.helpers);
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
              (S) => w.Once(S, this.helpers)
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
      return process.env.NODE_ENV !== "production" && ("from" in this.opts || l(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(w, k);
    }
    toString() {
      return this.css;
    }
    visitSync(w, k) {
      for (let [S, L] of w) {
        this.result.lastPlugin = S;
        let N;
        try {
          N = L(k, this.helpers);
        } catch (O) {
          throw this.handleError(O, k.proxyOf);
        }
        if (k.type !== "root" && k.type !== "document" && !k.parent)
          return !0;
        if (m(N))
          throw this.getAsyncError();
      }
    }
    visitTick(w) {
      let k = w[w.length - 1], { node: S, visitors: L } = k;
      if (S.type !== "root" && S.type !== "document" && !S.parent) {
        w.pop();
        return;
      }
      if (L.length > 0 && k.visitorIndex < L.length) {
        let [O, K] = L[k.visitorIndex];
        k.visitorIndex += 1, k.visitorIndex === L.length && (k.visitors = [], k.visitorIndex = 0), this.result.lastPlugin = O;
        try {
          return K(S.toProxy(), this.helpers);
        } catch (H) {
          throw this.handleError(H, S);
        }
      }
      if (k.iterator !== 0) {
        let O = k.iterator, K;
        for (; K = S.nodes[S.indexes[O]]; )
          if (S.indexes[O] += 1, !K[e]) {
            K[e] = !0, w.push(g(K));
            return;
          }
        k.iterator = 0, delete S.indexes[O];
      }
      let N = k.events;
      for (; k.eventIndex < N.length; ) {
        let O = N[k.eventIndex];
        if (k.eventIndex += 1, O === u) {
          S.nodes && S.nodes.length && (S[e] = !0, k.iterator = S.getIterator());
          return;
        } else if (this.listeners[O]) {
          k.visitors = this.listeners[O];
          return;
        }
      }
      w.pop();
    }
    walkSync(w) {
      w[e] = !0;
      let k = f(w);
      for (let S of k)
        if (S === u)
          w.nodes && w.each((L) => {
            L[e] || this.walkSync(L);
          });
        else {
          let L = this.listeners[S];
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
  return y.registerPostcss = (C) => {
    b = C;
  }, Ei = y, y.default = y, p.registerLazyResult(y), o.registerLazyResult(y), Ei;
}
var Mi, fa;
function Vf() {
  if (fa) return Mi;
  fa = 1;
  let e = nc(), t = Tn(), r = ic(), n = Ts();
  const i = Ms();
  class o {
    constructor(c, a, p) {
      a = a.toString(), this.stringified = !1, this._processor = c, this._css = a, this._opts = p, this._map = void 0;
      let s, h = t;
      this.result = new i(this._processor, s, this._opts), this.result.css = a;
      let d = this;
      Object.defineProperty(this.result, "root", {
        get() {
          return d.root;
        }
      });
      let u = new e(h, s, this._opts, a);
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
    then(c, a) {
      return process.env.NODE_ENV !== "production" && ("from" in this._opts || r(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(c, a);
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
      let c, a = n;
      try {
        c = a(this._css, this._opts);
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
  return Mi = o, o.default = o, Mi;
}
var Ri, ma;
function Gf() {
  if (ma) return Ri;
  ma = 1;
  let e = Vf(), t = ac(), r = Es(), n = jr();
  class i {
    constructor(l = []) {
      this.version = "8.4.38", this.plugins = this.normalize(l);
    }
    normalize(l) {
      let c = [];
      for (let a of l)
        if (a.postcss === !0 ? a = a() : a.postcss && (a = a.postcss), typeof a == "object" && Array.isArray(a.plugins))
          c = c.concat(a.plugins);
        else if (typeof a == "object" && a.postcssPlugin)
          c.push(a);
        else if (typeof a == "function")
          c.push(a);
        else if (typeof a == "object" && (a.parse || a.stringify)) {
          if (process.env.NODE_ENV !== "production")
            throw new Error(
              "PostCSS syntaxes cannot be used as plugins. Instead, please use one of the syntax/parser/stringifier options as outlined in your PostCSS runner documentation."
            );
        } else
          throw new Error(a + " is not a PostCSS plugin");
      return c;
    }
    process(l, c = {}) {
      return !this.plugins.length && !c.parser && !c.stringifier && !c.syntax ? new e(this, l, c) : new t(this, l, c);
    }
    use(l) {
      return this.plugins = this.plugins.concat(this.normalize([l])), this;
    }
  }
  return Ri = i, i.default = i, n.registerProcessor(i), r.registerProcessor(i), Ri;
}
var Ai, ga;
function Yf() {
  if (ga) return Ai;
  ga = 1;
  let e = Ln(), t = rc(), r = _n(), n = Rs(), i = On(), o = jr(), l = As();
  function c(a, p) {
    if (Array.isArray(a)) return a.map((d) => c(d));
    let { inputs: s, ...h } = a;
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
    if (h.nodes && (h.nodes = a.nodes.map((d) => c(d, p))), h.source) {
      let { inputId: d, ...u } = h.source;
      h.source = u, d != null && (h.source.input = p[d]);
    }
    if (h.type === "root")
      return new o(h);
    if (h.type === "decl")
      return new e(h);
    if (h.type === "rule")
      return new l(h);
    if (h.type === "comment")
      return new r(h);
    if (h.type === "atrule")
      return new n(h);
    throw new Error("Unknown node type: " + a.type);
  }
  return Ai = c, c.default = c, Ai;
}
var Ti, ya;
function Kf() {
  if (ya) return Ti;
  ya = 1;
  let e = Ss(), t = Ln(), r = ac(), n = Xt(), i = Gf(), o = Tn(), l = Yf(), c = Es(), a = sc(), p = _n(), s = Rs(), h = Ms(), d = On(), u = Ts(), m = oc(), f = As(), g = jr(), x = In();
  function b(...y) {
    return y.length === 1 && Array.isArray(y[0]) && (y = y[0]), new i(y);
  }
  return b.plugin = function(C, w) {
    let k = !1;
    function S(...N) {
      console && console.warn && !k && (k = !0, console.warn(
        C + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`
      ), process.env.LANG && process.env.LANG.startsWith("cn") && console.warn(
        C + `: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`
      ));
      let O = w(...N);
      return O.postcssPlugin = C, O.postcssVersion = new i().version, O;
    }
    let L;
    return Object.defineProperty(S, "postcss", {
      get() {
        return L || (L = S()), L;
      }
    }), S.process = function(N, O, K) {
      return b([S(K)]).process(N, O);
    }, S;
  }, b.stringify = o, b.parse = u, b.fromJSON = l, b.list = m, b.comment = (y) => new p(y), b.atRule = (y) => new s(y), b.decl = (y) => new t(y), b.rule = (y) => new f(y), b.root = (y) => new g(y), b.document = (y) => new c(y), b.CssSyntaxError = e, b.Declaration = t, b.Container = n, b.Processor = i, b.Document = c, b.Comment = p, b.Warning = a, b.AtRule = s, b.Result = h, b.Input = d, b.Rule = f, b.Root = g, b.Node = x, r.registerPostcss(b), Ti = b, b.default = b, Ti;
}
var Xf = Kf();
const Ce = /* @__PURE__ */ zf(Xf);
Ce.stringify;
Ce.fromJSON;
Ce.plugin;
Ce.parse;
Ce.list;
Ce.document;
Ce.comment;
Ce.atRule;
Ce.rule;
Ce.decl;
Ce.root;
Ce.CssSyntaxError;
Ce.Declaration;
Ce.Container;
Ce.Processor;
Ce.Document;
Ce.Comment;
Ce.Warning;
Ce.AtRule;
Ce.Result;
Ce.Input;
Ce.Rule;
Ce.Root;
Ce.Node;
var Jf = Object.defineProperty, Zf = (e, t, r) => t in e ? Jf(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, Qe = (e, t, r) => Zf(e, typeof t != "symbol" ? t + "" : t, r);
Date.now().toString();
function Qf(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function em(e) {
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
var nn = { exports: {} }, ba;
function tm() {
  if (ba) return nn.exports;
  ba = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return nn.exports = t(), nn.exports.createColors = t, nn.exports;
}
const rm = {}, nm = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: rm
}, Symbol.toStringTag, { value: "Module" })), ft = /* @__PURE__ */ em(nm);
var Ii, va;
function Is() {
  if (va) return Ii;
  va = 1;
  let e = /* @__PURE__ */ tm(), t = ft;
  class r extends Error {
    constructor(i, o, l, c, a, p) {
      super(i), this.name = "CssSyntaxError", this.reason = i, a && (this.file = a), c && (this.source = c), p && (this.plugin = p), typeof o < "u" && typeof l < "u" && (typeof o == "number" ? (this.line = o, this.column = l) : (this.line = o.line, this.column = o.column, this.endLine = l.line, this.endColumn = l.column)), this.setMessage(), Error.captureStackTrace && Error.captureStackTrace(this, r);
    }
    setMessage() {
      this.message = this.plugin ? this.plugin + ": " : "", this.message += this.file ? this.file : "<css input>", typeof this.line < "u" && (this.message += ":" + this.line + ":" + this.column), this.message += ": " + this.reason;
    }
    showSourceCode(i) {
      if (!this.source) return "";
      let o = this.source;
      i == null && (i = e.isColorSupported), t && i && (o = t(o));
      let l = o.split(/\r?\n/), c = Math.max(this.line - 3, 0), a = Math.min(this.line + 2, l.length), p = String(a).length, s, h;
      if (i) {
        let { bold: d, gray: u, red: m } = e.createColors(!0);
        s = (f) => d(m(f)), h = (f) => u(f);
      } else
        s = h = (d) => d;
      return l.slice(c, a).map((d, u) => {
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
  return Ii = r, r.default = r, Ii;
}
var sn = {}, ka;
function Ls() {
  return ka || (ka = 1, sn.isClean = Symbol("isClean"), sn.my = Symbol("my")), sn;
}
var Li, wa;
function lc() {
  if (wa) return Li;
  wa = 1;
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
      let l = "@" + i.name, c = i.params ? this.rawValue(i, "params") : "";
      if (typeof i.raws.afterName < "u" ? l += i.raws.afterName : c && (l += " "), i.nodes)
        this.block(i, l + c);
      else {
        let a = (i.raws.between || "") + (o ? ";" : "");
        this.builder(l + c + a, i);
      }
    }
    beforeAfter(i, o) {
      let l;
      i.type === "decl" ? l = this.raw(i, null, "beforeDecl") : i.type === "comment" ? l = this.raw(i, null, "beforeComment") : o === "before" ? l = this.raw(i, null, "beforeRule") : l = this.raw(i, null, "beforeClose");
      let c = i.parent, a = 0;
      for (; c && c.type !== "root"; )
        a += 1, c = c.parent;
      if (l.includes(`
`)) {
        let p = this.raw(i, null, "indent");
        if (p.length)
          for (let s = 0; s < a; s++) l += p;
      }
      return l;
    }
    block(i, o) {
      let l = this.raw(i, "between", "beforeOpen");
      this.builder(o + l + "{", i, "start");
      let c;
      i.nodes && i.nodes.length ? (this.body(i), c = this.raw(i, "after")) : c = this.raw(i, "after", "emptyBody"), c && this.builder(c), this.builder("}", i, "end");
    }
    body(i) {
      let o = i.nodes.length - 1;
      for (; o > 0 && i.nodes[o].type === "comment"; )
        o -= 1;
      let l = this.raw(i, "semicolon");
      for (let c = 0; c < i.nodes.length; c++) {
        let a = i.nodes[c], p = this.raw(a, "before");
        p && this.builder(p), this.stringify(a, o !== c || l);
      }
    }
    comment(i) {
      let o = this.raw(i, "left", "commentLeft"), l = this.raw(i, "right", "commentRight");
      this.builder("/*" + o + i.text + l + "*/", i);
    }
    decl(i, o) {
      let l = this.raw(i, "between", "colon"), c = i.prop + l + this.rawValue(i, "value");
      i.important && (c += i.raws.important || " !important"), o && (c += ";"), this.builder(c, i);
    }
    document(i) {
      this.body(i);
    }
    raw(i, o, l) {
      let c;
      if (l || (l = o), o && (c = i.raws[o], typeof c < "u"))
        return c;
      let a = i.parent;
      if (l === "before" && (!a || a.type === "root" && a.first === i || a && a.type === "document"))
        return "";
      if (!a) return e[l];
      let p = i.root();
      if (p.rawCache || (p.rawCache = {}), typeof p.rawCache[l] < "u")
        return p.rawCache[l];
      if (l === "before" || l === "after")
        return this.beforeAfter(i, l);
      {
        let s = "raw" + t(l);
        this[s] ? c = this[s](p, i) : p.walk((h) => {
          if (c = h.raws[o], typeof c < "u") return !1;
        });
      }
      return typeof c > "u" && (c = e[l]), p.rawCache[l] = c, c;
    }
    rawBeforeClose(i) {
      let o;
      return i.walk((l) => {
        if (l.nodes && l.nodes.length > 0 && typeof l.raws.after < "u")
          return o = l.raws.after, o.includes(`
`) && (o = o.replace(/[^\n]+$/, "")), !1;
      }), o && (o = o.replace(/\S/g, "")), o;
    }
    rawBeforeComment(i, o) {
      let l;
      return i.walkComments((c) => {
        if (typeof c.raws.before < "u")
          return l = c.raws.before, l.includes(`
`) && (l = l.replace(/[^\n]+$/, "")), !1;
      }), typeof l > "u" ? l = this.raw(o, null, "beforeDecl") : l && (l = l.replace(/\S/g, "")), l;
    }
    rawBeforeDecl(i, o) {
      let l;
      return i.walkDecls((c) => {
        if (typeof c.raws.before < "u")
          return l = c.raws.before, l.includes(`
`) && (l = l.replace(/[^\n]+$/, "")), !1;
      }), typeof l > "u" ? l = this.raw(o, null, "beforeRule") : l && (l = l.replace(/\S/g, "")), l;
    }
    rawBeforeOpen(i) {
      let o;
      return i.walk((l) => {
        if (l.type !== "decl" && (o = l.raws.between, typeof o < "u"))
          return !1;
      }), o;
    }
    rawBeforeRule(i) {
      let o;
      return i.walk((l) => {
        if (l.nodes && (l.parent !== i || i.first !== l) && typeof l.raws.before < "u")
          return o = l.raws.before, o.includes(`
`) && (o = o.replace(/[^\n]+$/, "")), !1;
      }), o && (o = o.replace(/\S/g, "")), o;
    }
    rawColon(i) {
      let o;
      return i.walkDecls((l) => {
        if (typeof l.raws.between < "u")
          return o = l.raws.between.replace(/[^\s:]/g, ""), !1;
      }), o;
    }
    rawEmptyBody(i) {
      let o;
      return i.walk((l) => {
        if (l.nodes && l.nodes.length === 0 && (o = l.raws.after, typeof o < "u"))
          return !1;
      }), o;
    }
    rawIndent(i) {
      if (i.raws.indent) return i.raws.indent;
      let o;
      return i.walk((l) => {
        let c = l.parent;
        if (c && c !== i && c.parent && c.parent === i && typeof l.raws.before < "u") {
          let a = l.raws.before.split(`
`);
          return o = a[a.length - 1], o = o.replace(/\S/g, ""), !1;
        }
      }), o;
    }
    rawSemicolon(i) {
      let o;
      return i.walk((l) => {
        if (l.nodes && l.nodes.length && l.last.type === "decl" && (o = l.raws.semicolon, typeof o < "u"))
          return !1;
      }), o;
    }
    rawValue(i, o) {
      let l = i[o], c = i.raws[o];
      return c && c.value === l ? c.raw : l;
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
  return Li = r, r.default = r, Li;
}
var Oi, xa;
function Nn() {
  if (xa) return Oi;
  xa = 1;
  let e = lc();
  function t(r, n) {
    new e(n).stringify(r);
  }
  return Oi = t, t.default = t, Oi;
}
var _i, Sa;
function Pn() {
  if (Sa) return _i;
  Sa = 1;
  let { isClean: e, my: t } = Ls(), r = Is(), n = lc(), i = Nn();
  function o(c, a) {
    let p = new c.constructor();
    for (let s in c) {
      if (!Object.prototype.hasOwnProperty.call(c, s) || s === "proxyCache") continue;
      let h = c[s], d = typeof h;
      s === "parent" && d === "object" ? a && (p[s] = a) : s === "source" ? p[s] = h : Array.isArray(h) ? p[s] = h.map((u) => o(u, p)) : (d === "object" && h !== null && (h = o(h)), p[s] = h);
    }
    return p;
  }
  class l {
    constructor(a = {}) {
      this.raws = {}, this[e] = !1, this[t] = !0;
      for (let p in a)
        if (p === "nodes") {
          this.nodes = [];
          for (let s of a[p])
            typeof s.clone == "function" ? this.append(s.clone()) : this.append(s);
        } else
          this[p] = a[p];
    }
    addToError(a) {
      if (a.postcssNode = this, a.stack && this.source && /\n\s{4}at /.test(a.stack)) {
        let p = this.source;
        a.stack = a.stack.replace(
          /\n\s{4}at /,
          `$&${p.input.from}:${p.start.line}:${p.start.column}$&`
        );
      }
      return a;
    }
    after(a) {
      return this.parent.insertAfter(this, a), this;
    }
    assign(a = {}) {
      for (let p in a)
        this[p] = a[p];
      return this;
    }
    before(a) {
      return this.parent.insertBefore(this, a), this;
    }
    cleanRaws(a) {
      delete this.raws.before, delete this.raws.after, a || delete this.raws.between;
    }
    clone(a = {}) {
      let p = o(this);
      for (let s in a)
        p[s] = a[s];
      return p;
    }
    cloneAfter(a = {}) {
      let p = this.clone(a);
      return this.parent.insertAfter(this, p), p;
    }
    cloneBefore(a = {}) {
      let p = this.clone(a);
      return this.parent.insertBefore(this, p), p;
    }
    error(a, p = {}) {
      if (this.source) {
        let { end: s, start: h } = this.rangeBy(p);
        return this.source.input.error(
          a,
          { column: h.column, line: h.line },
          { column: s.column, line: s.line },
          p
        );
      }
      return new r(a);
    }
    getProxyProcessor() {
      return {
        get(a, p) {
          return p === "proxyOf" ? a : p === "root" ? () => a.root().toProxy() : a[p];
        },
        set(a, p, s) {
          return a[p] === s || (a[p] = s, (p === "prop" || p === "value" || p === "name" || p === "params" || p === "important" || /* c8 ignore next */
          p === "text") && a.markDirty()), !0;
        }
      };
    }
    markDirty() {
      if (this[e]) {
        this[e] = !1;
        let a = this;
        for (; a = a.parent; )
          a[e] = !1;
      }
    }
    next() {
      if (!this.parent) return;
      let a = this.parent.index(this);
      return this.parent.nodes[a + 1];
    }
    positionBy(a, p) {
      let s = this.source.start;
      if (a.index)
        s = this.positionInside(a.index, p);
      else if (a.word) {
        p = this.toString();
        let h = p.indexOf(a.word);
        h !== -1 && (s = this.positionInside(h, p));
      }
      return s;
    }
    positionInside(a, p) {
      let s = p || this.toString(), h = this.source.start.column, d = this.source.start.line;
      for (let u = 0; u < a; u++)
        s[u] === `
` ? (h = 1, d += 1) : h += 1;
      return { column: h, line: d };
    }
    prev() {
      if (!this.parent) return;
      let a = this.parent.index(this);
      return this.parent.nodes[a - 1];
    }
    rangeBy(a) {
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
      if (a.word) {
        let h = this.toString(), d = h.indexOf(a.word);
        d !== -1 && (p = this.positionInside(d, h), s = this.positionInside(d + a.word.length, h));
      } else
        a.start ? p = {
          column: a.start.column,
          line: a.start.line
        } : a.index && (p = this.positionInside(a.index)), a.end ? s = {
          column: a.end.column,
          line: a.end.line
        } : typeof a.endIndex == "number" ? s = this.positionInside(a.endIndex) : a.index && (s = this.positionInside(a.index + 1));
      return (s.line < p.line || s.line === p.line && s.column <= p.column) && (s = { column: p.column + 1, line: p.line }), { end: s, start: p };
    }
    raw(a, p) {
      return new n().raw(this, a, p);
    }
    remove() {
      return this.parent && this.parent.removeChild(this), this.parent = void 0, this;
    }
    replaceWith(...a) {
      if (this.parent) {
        let p = this, s = !1;
        for (let h of a)
          h === this ? s = !0 : s ? (this.parent.insertAfter(p, h), p = h) : this.parent.insertBefore(p, h);
        s || this.remove();
      }
      return this;
    }
    root() {
      let a = this;
      for (; a.parent && a.parent.type !== "document"; )
        a = a.parent;
      return a;
    }
    toJSON(a, p) {
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
    toString(a = i) {
      a.stringify && (a = a.stringify);
      let p = "";
      return a(this, (s) => {
        p += s;
      }), p;
    }
    warn(a, p, s) {
      let h = { node: this };
      for (let d in s) h[d] = s[d];
      return a.warn(p, h);
    }
    get proxyOf() {
      return this;
    }
  }
  return _i = l, l.default = l, _i;
}
var Ni, Ca;
function $n() {
  if (Ca) return Ni;
  Ca = 1;
  let e = Pn();
  class t extends e {
    constructor(n) {
      n && typeof n.value < "u" && typeof n.value != "string" && (n = { ...n, value: String(n.value) }), super(n), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return Ni = t, t.default = t, Ni;
}
var Pi, Ea;
function im() {
  if (Ea) return Pi;
  Ea = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return Pi = { nanoid: (n = 21) => {
    let i = "", o = n;
    for (; o--; )
      i += e[Math.random() * 64 | 0];
    return i;
  }, customAlphabet: (n, i = 21) => (o = i) => {
    let l = "", c = o;
    for (; c--; )
      l += n[Math.random() * n.length | 0];
    return l;
  } }, Pi;
}
var $i, Ma;
function cc() {
  if (Ma) return $i;
  Ma = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = ft, { existsSync: r, readFileSync: n } = ft, { dirname: i, join: o } = ft;
  function l(a) {
    return Buffer ? Buffer.from(a, "base64").toString() : window.atob(a);
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
        return l(p.substr(RegExp.lastMatch.length));
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
  return $i = c, c.default = c, $i;
}
var Di, Ra;
function Dn() {
  if (Ra) return Di;
  Ra = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = ft, { fileURLToPath: r, pathToFileURL: n } = ft, { isAbsolute: i, resolve: o } = ft, { nanoid: l } = /* @__PURE__ */ im(), c = ft, a = Is(), p = cc(), s = Symbol("fromOffsetCache"), h = !!(e && t), d = !!(o && i);
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
      this.file || (this.id = "<input css " + l(6) + ">"), this.map && (this.map.file = this.from);
    }
    error(f, g, x, b = {}) {
      let y, C, w;
      if (g && typeof g == "object") {
        let S = g, L = x;
        if (typeof S.offset == "number") {
          let N = this.fromOffset(S.offset);
          g = N.line, x = N.col;
        } else
          g = S.line, x = S.column;
        if (typeof L.offset == "number") {
          let N = this.fromOffset(L.offset);
          C = N.line, w = N.col;
        } else
          C = L.line, w = L.column;
      } else if (!x) {
        let S = this.fromOffset(g);
        g = S.line, x = S.col;
      }
      let k = this.origin(g, x, C, w);
      return k ? y = new a(
        f,
        k.endLine === void 0 ? k.line : { column: k.column, line: k.line },
        k.endLine === void 0 ? k.column : { column: k.endColumn, line: k.endLine },
        k.source,
        k.file,
        b.plugin
      ) : y = new a(
        f,
        C === void 0 ? g : { column: x, line: g },
        C === void 0 ? x : { column: w, line: C },
        this.css,
        this.file,
        b.plugin
      ), y.input = { column: x, endColumn: w, endLine: C, line: g, source: this.css }, this.file && (n && (y.input.url = n(this.file).toString()), y.input.file = this.file), y;
    }
    fromOffset(f) {
      let g, x;
      if (this[s])
        x = this[s];
      else {
        let y = this.css.split(`
`);
        x = new Array(y.length);
        let C = 0;
        for (let w = 0, k = y.length; w < k; w++)
          x[w] = C, C += y[w].length + 1;
        this[s] = x;
      }
      g = x[x.length - 1];
      let b = 0;
      if (f >= g)
        b = x.length - 1;
      else {
        let y = x.length - 2, C;
        for (; b < y; )
          if (C = b + (y - b >> 1), f < x[C])
            y = C - 1;
          else if (f >= x[C + 1])
            b = C + 1;
          else {
            b = C;
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
      let y = this.map.consumer(), C = y.originalPositionFor({ column: g, line: f });
      if (!C.source) return !1;
      let w;
      typeof x == "number" && (w = y.originalPositionFor({ column: b, line: x }));
      let k;
      i(C.source) ? k = n(C.source) : k = new URL(
        C.source,
        this.map.consumer().sourceRoot || n(this.map.mapFile)
      );
      let S = {
        column: C.column,
        endColumn: w && w.column,
        endLine: w && w.line,
        line: C.line,
        url: k.toString()
      };
      if (k.protocol === "file:")
        if (r)
          S.file = r(k);
        else
          throw new Error("file: protocol is not available in this PostCSS build");
      let L = y.sourceContentFor(C.source);
      return L && (S.source = L), S;
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
  return Di = u, u.default = u, c && c.registerInput && c.registerInput(u), Di;
}
var zi, Aa;
function uc() {
  if (Aa) return zi;
  Aa = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = ft, { dirname: r, relative: n, resolve: i, sep: o } = ft, { pathToFileURL: l } = ft, c = Dn(), a = !!(e && t), p = !!(r && i && n && o);
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
      if (this.clearAnnotation(), p && a && this.isMap())
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
      this.stringify(this.root, (b, y, C) => {
        if (this.css += b, y && C !== "end" && (f.generated.line = d, f.generated.column = u - 1, y.source && y.source.start ? (f.source = this.sourcePath(y), f.original.line = y.source.start.line, f.original.column = y.source.start.column - 1, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, this.map.addMapping(f))), g = b.match(/\n/g), g ? (d += g.length, x = b.lastIndexOf(`
`), u = b.length - x) : u += b.length, y && C !== "start") {
          let w = y.parent || { raws: {} };
          (!(y.type === "decl" || y.type === "atrule" && !y.nodes) || y !== w.last || w.raws.semicolon) && (y.source && y.source.end ? (f.source = this.sourcePath(y), f.original.line = y.source.end.line, f.original.column = y.source.end.column - 1, f.generated.line = d, f.generated.column = u - 2, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, f.generated.line = d, f.generated.column = u - 1, this.map.addMapping(f)));
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
      if (l) {
        let m = l(d).toString();
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
  return zi = s, zi;
}
var Fi, Ta;
function zn() {
  if (Ta) return Fi;
  Ta = 1;
  let e = Pn();
  class t extends e {
    constructor(n) {
      super(n), this.type = "comment";
    }
  }
  return Fi = t, t.default = t, Fi;
}
var Ui, Ia;
function Jt() {
  if (Ia) return Ui;
  Ia = 1;
  let { isClean: e, my: t } = Ls(), r = $n(), n = zn(), i = Pn(), o, l, c, a;
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
      for (let y of x) this.proxyOf.nodes.splice(f, 0, y);
      let b;
      for (let y in this.indexes)
        b = this.indexes[y], f <= b && (this.indexes[y] = b + x.length);
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
        u = [new l(u)];
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
    l = d;
  }, h.registerAtRule = (d) => {
    c = d;
  }, h.registerRoot = (d) => {
    a = d;
  }, Ui = h, h.default = h, h.rebuild = (d) => {
    d.type === "atrule" ? Object.setPrototypeOf(d, c.prototype) : d.type === "rule" ? Object.setPrototypeOf(d, l.prototype) : d.type === "decl" ? Object.setPrototypeOf(d, r.prototype) : d.type === "comment" ? Object.setPrototypeOf(d, n.prototype) : d.type === "root" && Object.setPrototypeOf(d, a.prototype), d[t] = !0, d.nodes && d.nodes.forEach((u) => {
      h.rebuild(u);
    });
  }, Ui;
}
var Bi, La;
function Os() {
  if (La) return Bi;
  La = 1;
  let e = Jt(), t, r;
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
  }, Bi = n, n.default = n, Bi;
}
var qi, Oa;
function dc() {
  if (Oa) return qi;
  Oa = 1;
  let e = {};
  return qi = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, qi;
}
var Wi, _a;
function pc() {
  if (_a) return Wi;
  _a = 1;
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
  return Wi = e, e.default = e, Wi;
}
var ji, Na;
function _s() {
  if (Na) return ji;
  Na = 1;
  let e = pc();
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
  return ji = t, t.default = t, ji;
}
var Hi, Pa;
function sm() {
  if (Pa) return Hi;
  Pa = 1;
  const e = 39, t = 34, r = 92, n = 47, i = 10, o = 32, l = 12, c = 9, a = 13, p = 91, s = 93, h = 40, d = 41, u = 123, m = 125, f = 59, g = 42, x = 58, b = 64, y = /[\t\n\f\r "#'()/;[\\\]{}]/g, C = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, w = /.[\r\n"'(/\\]/, k = /[\da-f]/i;
  return Hi = function(L, N = {}) {
    let O = L.css.valueOf(), K = N.ignoreErrors, H, I, $e, ne, Q, he, ye, fe, oe, le, nt = O.length, P = 0, Ue = [], Re = [];
    function it() {
      return P;
    }
    function Pe(X) {
      throw L.error("Unclosed " + X, P);
    }
    function Xe() {
      return Re.length === 0 && P >= nt;
    }
    function be(X) {
      if (Re.length) return Re.pop();
      if (P >= nt) return;
      let Te = X ? X.ignoreUnclosed : !1;
      switch (H = O.charCodeAt(P), H) {
        case i:
        case o:
        case c:
        case a:
        case l: {
          I = P;
          do
            I += 1, H = O.charCodeAt(I);
          while (H === o || H === i || H === c || H === a || H === l);
          le = ["space", O.slice(P, I)], P = I - 1;
          break;
        }
        case p:
        case s:
        case u:
        case m:
        case x:
        case f:
        case d: {
          let ue = String.fromCharCode(H);
          le = [ue, ue, P];
          break;
        }
        case h: {
          if (fe = Ue.length ? Ue.pop()[1] : "", oe = O.charCodeAt(P + 1), fe === "url" && oe !== e && oe !== t && oe !== o && oe !== i && oe !== c && oe !== l && oe !== a) {
            I = P;
            do {
              if (he = !1, I = O.indexOf(")", I + 1), I === -1)
                if (K || Te) {
                  I = P;
                  break;
                } else
                  Pe("bracket");
              for (ye = I; O.charCodeAt(ye - 1) === r; )
                ye -= 1, he = !he;
            } while (he);
            le = ["brackets", O.slice(P, I + 1), P, I], P = I;
          } else
            I = O.indexOf(")", P + 1), ne = O.slice(P, I + 1), I === -1 || w.test(ne) ? le = ["(", "(", P] : (le = ["brackets", ne, P, I], P = I);
          break;
        }
        case e:
        case t: {
          $e = H === e ? "'" : '"', I = P;
          do {
            if (he = !1, I = O.indexOf($e, I + 1), I === -1)
              if (K || Te) {
                I = P + 1;
                break;
              } else
                Pe("string");
            for (ye = I; O.charCodeAt(ye - 1) === r; )
              ye -= 1, he = !he;
          } while (he);
          le = ["string", O.slice(P, I + 1), P, I], P = I;
          break;
        }
        case b: {
          y.lastIndex = P + 1, y.test(O), y.lastIndex === 0 ? I = O.length - 1 : I = y.lastIndex - 2, le = ["at-word", O.slice(P, I + 1), P, I], P = I;
          break;
        }
        case r: {
          for (I = P, Q = !0; O.charCodeAt(I + 1) === r; )
            I += 1, Q = !Q;
          if (H = O.charCodeAt(I + 1), Q && H !== n && H !== o && H !== i && H !== c && H !== a && H !== l && (I += 1, k.test(O.charAt(I)))) {
            for (; k.test(O.charAt(I + 1)); )
              I += 1;
            O.charCodeAt(I + 1) === o && (I += 1);
          }
          le = ["word", O.slice(P, I + 1), P, I], P = I;
          break;
        }
        default: {
          H === n && O.charCodeAt(P + 1) === g ? (I = O.indexOf("*/", P + 2) + 1, I === 0 && (K || Te ? I = O.length : Pe("comment")), le = ["comment", O.slice(P, I + 1), P, I], P = I) : (C.lastIndex = P + 1, C.test(O), C.lastIndex === 0 ? I = O.length - 1 : I = C.lastIndex - 2, le = ["word", O.slice(P, I + 1), P, I], Ue.push(le), P = I);
          break;
        }
      }
      return P++, le;
    }
    function Ae(X) {
      Re.push(X);
    }
    return {
      back: Ae,
      endOfFile: Xe,
      nextToken: be,
      position: it
    };
  }, Hi;
}
var Vi, $a;
function Ns() {
  if ($a) return Vi;
  $a = 1;
  let e = Jt();
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
  return Vi = t, t.default = t, e.registerAtRule(t), Vi;
}
var Gi, Da;
function Hr() {
  if (Da) return Gi;
  Da = 1;
  let e = Jt(), t, r;
  class n extends e {
    constructor(o) {
      super(o), this.type = "root", this.nodes || (this.nodes = []);
    }
    normalize(o, l, c) {
      let a = super.normalize(o);
      if (l) {
        if (c === "prepend")
          this.nodes.length > 1 ? l.raws.before = this.nodes[1].raws.before : delete l.raws.before;
        else if (this.first !== l)
          for (let p of a)
            p.raws.before = l.raws.before;
      }
      return a;
    }
    removeChild(o, l) {
      let c = this.index(o);
      return !l && c === 0 && this.nodes.length > 1 && (this.nodes[1].raws.before = this.nodes[c].raws.before), super.removeChild(o);
    }
    toResult(o = {}) {
      return new t(new r(), this, o).stringify();
    }
  }
  return n.registerLazyResult = (i) => {
    t = i;
  }, n.registerProcessor = (i) => {
    r = i;
  }, Gi = n, n.default = n, e.registerRoot(n), Gi;
}
var Yi, za;
function hc() {
  if (za) return Yi;
  za = 1;
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
      let i = [], o = "", l = !1, c = 0, a = !1, p = "", s = !1;
      for (let h of t)
        s ? s = !1 : h === "\\" ? s = !0 : a ? h === p && (a = !1) : h === '"' || h === "'" ? (a = !0, p = h) : h === "(" ? c += 1 : h === ")" ? c > 0 && (c -= 1) : c === 0 && r.includes(h) && (l = !0), l ? (o !== "" && i.push(o.trim()), o = "", l = !1) : o += h;
      return (n || o !== "") && i.push(o.trim()), i;
    }
  };
  return Yi = e, e.default = e, Yi;
}
var Ki, Fa;
function Ps() {
  if (Fa) return Ki;
  Fa = 1;
  let e = Jt(), t = hc();
  class r extends e {
    constructor(i) {
      super(i), this.type = "rule", this.nodes || (this.nodes = []);
    }
    get selectors() {
      return t.comma(this.selector);
    }
    set selectors(i) {
      let o = this.selector ? this.selector.match(/,\s*/) : null, l = o ? o[0] : "," + this.raw("between", "beforeOpen");
      this.selector = i.join(l);
    }
  }
  return Ki = r, r.default = r, e.registerRule(r), Ki;
}
var Xi, Ua;
function om() {
  if (Ua) return Xi;
  Ua = 1;
  let e = $n(), t = sm(), r = zn(), n = Ns(), i = Hr(), o = Ps();
  const l = {
    empty: !0,
    space: !0
  };
  function c(p) {
    for (let s = p.length - 1; s >= 0; s--) {
      let h = p[s], d = h[3] || h[2];
      if (d) return d;
    }
  }
  class a {
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
          let y = this.stringFrom(s, b);
          y = this.spacesFromEnd(s) + y, y !== " !important" && (d.raws.important = y);
          break;
        } else if (m[1].toLowerCase() === "important") {
          let y = s.slice(0), C = "";
          for (let w = b; w > 0; w--) {
            let k = y[w][0];
            if (C.trim().indexOf("!") === 0 && k !== "space")
              break;
            C = y.pop()[1] + C;
          }
          C.trim().indexOf("!") === 0 && (d.important = !0, d.raws.important = C, s = y);
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
      let m, f, g = d.length, x = "", b = !0, y, C;
      for (let w = 0; w < g; w += 1)
        m = d[w], f = m[0], f === "space" && w === g - 1 && !u ? b = !1 : f === "comment" ? (C = d[w - 1] ? d[w - 1][0] : "empty", y = d[w + 1] ? d[w + 1][0] : "empty", !l[C] && !l[y] ? x.slice(-1) === "," ? b = !1 : x += m[1] : b = !1) : x += m[1];
      if (!b) {
        let w = d.reduce((k, S) => k + S[1], "");
        s.raws[h] = { raw: w, value: x };
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
  return Xi = a, Xi;
}
var Ji, Ba;
function $s() {
  if (Ba) return Ji;
  Ba = 1;
  let e = Jt(), t = om(), r = Dn();
  function n(i, o) {
    let l = new r(i, o), c = new t(l);
    try {
      c.parse();
    } catch (a) {
      throw process.env.NODE_ENV !== "production" && a.name === "CssSyntaxError" && o && o.from && (/\.scss$/i.test(o.from) ? a.message += `
You tried to parse SCSS with the standard CSS parser; try again with the postcss-scss parser` : /\.sass/i.test(o.from) ? a.message += `
You tried to parse Sass with the standard CSS parser; try again with the postcss-sass parser` : /\.less$/i.test(o.from) && (a.message += `
You tried to parse Less with the standard CSS parser; try again with the postcss-less parser`)), a;
    }
    return c.root;
  }
  return Ji = n, n.default = n, e.registerParse(n), Ji;
}
var Zi, qa;
function fc() {
  if (qa) return Zi;
  qa = 1;
  let { isClean: e, my: t } = Ls(), r = uc(), n = Nn(), i = Jt(), o = Os(), l = dc(), c = _s(), a = $s(), p = Hr();
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
  function m(C) {
    return typeof C == "object" && typeof C.then == "function";
  }
  function f(C) {
    let w = !1, k = s[C.type];
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
  let b = {};
  class y {
    constructor(w, k, S) {
      this.stringified = !1, this.processed = !1;
      let L;
      if (typeof k == "object" && k !== null && (k.type === "root" || k.type === "document"))
        L = x(k);
      else if (k instanceof y || k instanceof c)
        L = x(k.root), k.map && (typeof S.map > "u" && (S.map = {}), S.map.inline || (S.map.inline = !1), S.map.prev = k.map);
      else {
        let N = a;
        S.syntax && (N = S.syntax.parse), S.parser && (N = S.parser), N.parse && (N = N.parse);
        try {
          L = N(k, S);
        } catch (O) {
          this.processed = !0, this.error = O;
        }
        L && !L[t] && i.rebuild(L);
      }
      this.result = new c(w, L, S), this.helpers = { ...b, postcss: b, result: this.result }, this.plugins = this.processor.plugins.map((N) => typeof N == "object" && N.prepare ? { ...N, ...N.prepare(this.result) } : N);
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
      let S = this.result.lastPlugin;
      try {
        if (k && k.addToError(w), this.error = w, w.name === "CssSyntaxError" && !w.plugin)
          w.plugin = S.postcssPlugin, w.setMessage();
        else if (S.postcssVersion && process.env.NODE_ENV !== "production") {
          let L = S.postcssPlugin, N = S.postcssVersion, O = this.result.processor.version, K = N.split("."), H = O.split(".");
          (K[0] !== H[0] || parseInt(K[1]) > parseInt(H[1])) && console.error(
            "Unknown error from PostCSS plugin. Your current PostCSS version is " + O + ", but " + L + " uses " + N + ". Perhaps this is the source of the error below."
          );
        }
      } catch (L) {
        console && console.error && console.error(L);
      }
      return w;
    }
    prepareVisitors() {
      this.listeners = {};
      let w = (k, S, L) => {
        this.listeners[S] || (this.listeners[S] = []), this.listeners[S].push([k, L]);
      };
      for (let k of this.plugins)
        if (typeof k == "object")
          for (let S in k) {
            if (!h[S] && /^[A-Z]/.test(S))
              throw new Error(
                `Unknown event ${S} in ${k.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`
              );
            if (!d[S])
              if (typeof k[S] == "object")
                for (let L in k[S])
                  L === "*" ? w(k, S, k[S][L]) : w(
                    k,
                    S + "-" + L.toLowerCase(),
                    k[S][L]
                  );
              else typeof k[S] == "function" && w(k, S, k[S]);
          }
      this.hasListener = Object.keys(this.listeners).length > 0;
    }
    async runAsync() {
      this.plugin = 0;
      for (let w = 0; w < this.plugins.length; w++) {
        let k = this.plugins[w], S = this.runOnRoot(k);
        if (m(S))
          try {
            await S;
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
            let S = this.visitTick(k);
            if (m(S))
              try {
                await S;
              } catch (L) {
                let N = k[k.length - 1].node;
                throw this.handleError(L, N);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [k, S] of this.listeners.OnceExit) {
            this.result.lastPlugin = k;
            try {
              if (w.type === "document") {
                let L = w.nodes.map(
                  (N) => S(N, this.helpers)
                );
                await Promise.all(L);
              } else
                await S(w, this.helpers);
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
              (S) => w.Once(S, this.helpers)
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
      return process.env.NODE_ENV !== "production" && ("from" in this.opts || l(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(w, k);
    }
    toString() {
      return this.css;
    }
    visitSync(w, k) {
      for (let [S, L] of w) {
        this.result.lastPlugin = S;
        let N;
        try {
          N = L(k, this.helpers);
        } catch (O) {
          throw this.handleError(O, k.proxyOf);
        }
        if (k.type !== "root" && k.type !== "document" && !k.parent)
          return !0;
        if (m(N))
          throw this.getAsyncError();
      }
    }
    visitTick(w) {
      let k = w[w.length - 1], { node: S, visitors: L } = k;
      if (S.type !== "root" && S.type !== "document" && !S.parent) {
        w.pop();
        return;
      }
      if (L.length > 0 && k.visitorIndex < L.length) {
        let [O, K] = L[k.visitorIndex];
        k.visitorIndex += 1, k.visitorIndex === L.length && (k.visitors = [], k.visitorIndex = 0), this.result.lastPlugin = O;
        try {
          return K(S.toProxy(), this.helpers);
        } catch (H) {
          throw this.handleError(H, S);
        }
      }
      if (k.iterator !== 0) {
        let O = k.iterator, K;
        for (; K = S.nodes[S.indexes[O]]; )
          if (S.indexes[O] += 1, !K[e]) {
            K[e] = !0, w.push(g(K));
            return;
          }
        k.iterator = 0, delete S.indexes[O];
      }
      let N = k.events;
      for (; k.eventIndex < N.length; ) {
        let O = N[k.eventIndex];
        if (k.eventIndex += 1, O === u) {
          S.nodes && S.nodes.length && (S[e] = !0, k.iterator = S.getIterator());
          return;
        } else if (this.listeners[O]) {
          k.visitors = this.listeners[O];
          return;
        }
      }
      w.pop();
    }
    walkSync(w) {
      w[e] = !0;
      let k = f(w);
      for (let S of k)
        if (S === u)
          w.nodes && w.each((L) => {
            L[e] || this.walkSync(L);
          });
        else {
          let L = this.listeners[S];
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
  return y.registerPostcss = (C) => {
    b = C;
  }, Zi = y, y.default = y, p.registerLazyResult(y), o.registerLazyResult(y), Zi;
}
var Qi, Wa;
function am() {
  if (Wa) return Qi;
  Wa = 1;
  let e = uc(), t = Nn(), r = dc(), n = $s();
  const i = _s();
  class o {
    constructor(c, a, p) {
      a = a.toString(), this.stringified = !1, this._processor = c, this._css = a, this._opts = p, this._map = void 0;
      let s, h = t;
      this.result = new i(this._processor, s, this._opts), this.result.css = a;
      let d = this;
      Object.defineProperty(this.result, "root", {
        get() {
          return d.root;
        }
      });
      let u = new e(h, s, this._opts, a);
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
    then(c, a) {
      return process.env.NODE_ENV !== "production" && ("from" in this._opts || r(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(c, a);
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
      let c, a = n;
      try {
        c = a(this._css, this._opts);
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
  return Qi = o, o.default = o, Qi;
}
var es, ja;
function lm() {
  if (ja) return es;
  ja = 1;
  let e = am(), t = fc(), r = Os(), n = Hr();
  class i {
    constructor(l = []) {
      this.version = "8.4.38", this.plugins = this.normalize(l);
    }
    normalize(l) {
      let c = [];
      for (let a of l)
        if (a.postcss === !0 ? a = a() : a.postcss && (a = a.postcss), typeof a == "object" && Array.isArray(a.plugins))
          c = c.concat(a.plugins);
        else if (typeof a == "object" && a.postcssPlugin)
          c.push(a);
        else if (typeof a == "function")
          c.push(a);
        else if (typeof a == "object" && (a.parse || a.stringify)) {
          if (process.env.NODE_ENV !== "production")
            throw new Error(
              "PostCSS syntaxes cannot be used as plugins. Instead, please use one of the syntax/parser/stringifier options as outlined in your PostCSS runner documentation."
            );
        } else
          throw new Error(a + " is not a PostCSS plugin");
      return c;
    }
    process(l, c = {}) {
      return !this.plugins.length && !c.parser && !c.stringifier && !c.syntax ? new e(this, l, c) : new t(this, l, c);
    }
    use(l) {
      return this.plugins = this.plugins.concat(this.normalize([l])), this;
    }
  }
  return es = i, i.default = i, n.registerProcessor(i), r.registerProcessor(i), es;
}
var ts, Ha;
function cm() {
  if (Ha) return ts;
  Ha = 1;
  let e = $n(), t = cc(), r = zn(), n = Ns(), i = Dn(), o = Hr(), l = Ps();
  function c(a, p) {
    if (Array.isArray(a)) return a.map((d) => c(d));
    let { inputs: s, ...h } = a;
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
    if (h.nodes && (h.nodes = a.nodes.map((d) => c(d, p))), h.source) {
      let { inputId: d, ...u } = h.source;
      h.source = u, d != null && (h.source.input = p[d]);
    }
    if (h.type === "root")
      return new o(h);
    if (h.type === "decl")
      return new e(h);
    if (h.type === "rule")
      return new l(h);
    if (h.type === "comment")
      return new r(h);
    if (h.type === "atrule")
      return new n(h);
    throw new Error("Unknown node type: " + a.type);
  }
  return ts = c, c.default = c, ts;
}
var rs, Va;
function um() {
  if (Va) return rs;
  Va = 1;
  let e = Is(), t = $n(), r = fc(), n = Jt(), i = lm(), o = Nn(), l = cm(), c = Os(), a = pc(), p = zn(), s = Ns(), h = _s(), d = Dn(), u = $s(), m = hc(), f = Ps(), g = Hr(), x = Pn();
  function b(...y) {
    return y.length === 1 && Array.isArray(y[0]) && (y = y[0]), new i(y);
  }
  return b.plugin = function(C, w) {
    let k = !1;
    function S(...N) {
      console && console.warn && !k && (k = !0, console.warn(
        C + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`
      ), process.env.LANG && process.env.LANG.startsWith("cn") && console.warn(
        C + `: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`
      ));
      let O = w(...N);
      return O.postcssPlugin = C, O.postcssVersion = new i().version, O;
    }
    let L;
    return Object.defineProperty(S, "postcss", {
      get() {
        return L || (L = S()), L;
      }
    }), S.process = function(N, O, K) {
      return b([S(K)]).process(N, O);
    }, S;
  }, b.stringify = o, b.parse = u, b.fromJSON = l, b.list = m, b.comment = (y) => new p(y), b.atRule = (y) => new s(y), b.decl = (y) => new t(y), b.rule = (y) => new f(y), b.root = (y) => new g(y), b.document = (y) => new c(y), b.CssSyntaxError = e, b.Declaration = t, b.Container = n, b.Processor = i, b.Document = c, b.Comment = p, b.Warning = a, b.AtRule = s, b.Result = h, b.Input = d, b.Rule = f, b.Root = g, b.Node = x, r.registerPostcss(b), rs = b, b.default = b, rs;
}
var dm = um();
const Ee = /* @__PURE__ */ Qf(dm);
Ee.stringify;
Ee.fromJSON;
Ee.plugin;
Ee.parse;
Ee.list;
Ee.document;
Ee.comment;
Ee.atRule;
Ee.rule;
Ee.decl;
Ee.root;
Ee.CssSyntaxError;
Ee.Declaration;
Ee.Container;
Ee.Processor;
Ee.Document;
Ee.Comment;
Ee.Warning;
Ee.AtRule;
Ee.Result;
Ee.Input;
Ee.Rule;
Ee.Root;
Ee.Node;
class Ds {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  constructor(...t) {
    Qe(this, "parentElement", null), Qe(this, "parentNode", null), Qe(this, "ownerDocument"), Qe(this, "firstChild", null), Qe(this, "lastChild", null), Qe(this, "previousSibling", null), Qe(this, "nextSibling", null), Qe(this, "ELEMENT_NODE", 1), Qe(this, "TEXT_NODE", 3), Qe(this, "nodeType"), Qe(this, "nodeName"), Qe(this, "RRNodeType");
  }
  get childNodes() {
    const t = [];
    let r = this.firstChild;
    for (; r; )
      t.push(r), r = r.nextSibling;
    return t;
  }
  contains(t) {
    if (t instanceof Ds) {
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
const Ga = {
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
}, Ya = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, on = {}, mc = {}, pm = () => !!globalThis.Zone;
function zs(e) {
  if (on[e])
    return on[e];
  const t = globalThis[e], r = t.prototype, n = e in Ga ? Ga[e] : void 0, i = !!(n && // @ts-expect-error 2345
  n.every(
    (c) => {
      var a, p;
      return !!((p = (a = Object.getOwnPropertyDescriptor(r, c)) == null ? void 0 : a.get) != null && p.toString().includes("[native code]"));
    }
  )), o = e in Ya ? Ya[e] : void 0, l = !!(o && o.every(
    // @ts-expect-error 2345
    (c) => {
      var a;
      return typeof r[c] == "function" && ((a = r[c]) == null ? void 0 : a.toString().includes("[native code]"));
    }
  ));
  if (i && l && !pm())
    return on[e] = t.prototype, t.prototype;
  try {
    const c = document.createElement("iframe");
    c.style.display = "none", document.body.appendChild(c);
    const a = c.contentWindow;
    if (!a) return t.prototype;
    const p = a[e].prototype;
    if (!p)
      return c.remove(), r;
    const s = navigator.userAgent;
    return s.includes("Safari") && !s.includes("Chrome") ? (c.classList.add("rr-block"), c.setAttribute("__rrwebUntaintedMutationObserver", ""), mc[e] = () => c.remove()) : c.remove(), on[e] = p;
  } catch {
    return r;
  }
}
const ns = {};
function At(e, t, r) {
  var n;
  const i = `${e}.${String(r)}`;
  if (ns[i])
    return ns[i].call(
      t
    );
  const o = zs(e), l = (n = Object.getOwnPropertyDescriptor(
    o,
    r
  )) == null ? void 0 : n.get;
  return l ? (ns[i] = l, l.call(t)) : t[r];
}
const is = {};
function gc(e, t, r) {
  const n = `${e}.${String(r)}`;
  if (is[n])
    return is[n].bind(
      t
    );
  const o = zs(e)[r];
  return typeof o != "function" ? t[r] : (is[n] = o, o.bind(t));
}
function hm(e) {
  return At("Node", e, "ownerDocument");
}
function fm(e) {
  return At("Node", e, "childNodes");
}
function mm(e) {
  return At("Node", e, "parentNode");
}
function gm(e) {
  return At("Node", e, "parentElement");
}
function ym(e) {
  return At("Node", e, "textContent");
}
function bm(e, t) {
  return gc("Node", e, "contains")(t);
}
function vm(e) {
  return gc("Node", e, "getRootNode")();
}
function km(e) {
  return !e || !("host" in e) ? null : At("ShadowRoot", e, "host");
}
function wm(e) {
  return e.styleSheets;
}
function xm(e) {
  return !e || !("shadowRoot" in e) ? null : At("Element", e, "shadowRoot");
}
function Sm(e, t) {
  return At("Element", e, "querySelector")(t);
}
function Cm(e, t) {
  return At("Element", e, "querySelectorAll")(t);
}
function yc() {
  return [
    zs("MutationObserver").constructor,
    mc.MutationObserver ?? (() => {
    })
  ];
}
let Br = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (Br = () => (/* @__PURE__ */ new Date()).getTime());
function Zt(e, t, r) {
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
const ie = {
  ownerDocument: hm,
  childNodes: fm,
  parentNode: mm,
  parentElement: gm,
  textContent: ym,
  contains: bm,
  getRootNode: vm,
  host: km,
  styleSheets: wm,
  shadowRoot: xm,
  querySelector: Sm,
  querySelectorAll: Cm,
  nowTimestamp: Br,
  mutationObserverCtor: yc,
  patch: Zt
};
function je(e, t, r = document) {
  const n = { capture: !0, passive: !0 };
  return r.addEventListener(e, t, n), () => r.removeEventListener(e, t, n);
}
const dr = `Please stop import mirror directly. Instead of that,\r
now you can use replayer.getMirror() to access the mirror instance of a replayer,\r
or you can use record.mirror to access the mirror instance during recording.`;
let Ka = {
  map: {},
  getId() {
    return console.error(dr), -1;
  },
  getNode() {
    return console.error(dr), null;
  },
  removeNodeFromMap() {
    console.error(dr);
  },
  has() {
    return console.error(dr), !1;
  },
  reset() {
    console.error(dr);
  }
};
typeof window < "u" && window.Proxy && window.Reflect && (Ka = new Proxy(Ka, {
  get(e, t, r) {
    return t === "map" && console.error(dr), Reflect.get(e, t, r);
  }
}));
function qr(e, t, r = {}) {
  let n = null, i = 0;
  return function(...o) {
    const l = Date.now();
    !i && r.leading === !1 && (i = l);
    const c = t - (l - i), a = this;
    c <= 0 || c > t ? (n && (clearTimeout(n), n = null), i = l, e.apply(a, o)) : !n && r.trailing !== !1 && (n = setTimeout(() => {
      i = r.leading === !1 ? 0 : Date.now(), n = null, e.apply(a, o);
    }, c));
  };
}
function Fn(e, t, r, n, i = window) {
  const o = i.Object.getOwnPropertyDescriptor(e, t);
  return i.Object.defineProperty(
    e,
    t,
    n ? r : {
      set(l) {
        setTimeout(() => {
          r.set.call(this, l);
        }, 0), o && o.set && o.set.call(this, l);
      }
    }
  ), () => Fn(e, t, o || {}, !0);
}
function bc(e) {
  var t, r, n, i;
  const o = e.document;
  return {
    left: o.scrollingElement ? o.scrollingElement.scrollLeft : e.pageXOffset !== void 0 ? e.pageXOffset : o.documentElement.scrollLeft || (o == null ? void 0 : o.body) && ((t = ie.parentElement(o.body)) == null ? void 0 : t.scrollLeft) || ((r = o == null ? void 0 : o.body) == null ? void 0 : r.scrollLeft) || 0,
    top: o.scrollingElement ? o.scrollingElement.scrollTop : e.pageYOffset !== void 0 ? e.pageYOffset : (o == null ? void 0 : o.documentElement.scrollTop) || (o == null ? void 0 : o.body) && ((n = ie.parentElement(o.body)) == null ? void 0 : n.scrollTop) || ((i = o == null ? void 0 : o.body) == null ? void 0 : i.scrollTop) || 0
  };
}
function vc() {
  return window.innerHeight || document.documentElement && document.documentElement.clientHeight || document.body && document.body.clientHeight;
}
function kc() {
  return window.innerWidth || document.documentElement && document.documentElement.clientWidth || document.body && document.body.clientWidth;
}
function wc(e) {
  return e ? e.nodeType === e.ELEMENT_NODE ? e : ie.parentElement(e) : null;
}
function He(e, t, r, n) {
  if (!e)
    return !1;
  const i = wc(e);
  if (!i)
    return !1;
  try {
    if (typeof t == "string") {
      if (i.classList.contains(t) || n && i.closest("." + t) !== null) return !0;
    } else if (vn(i, t, n)) return !0;
  } catch {
  }
  return !!(r && (i.matches(r) || n && i.closest(r) !== null));
}
function Em(e, t) {
  return t.getId(e) !== -1;
}
function ss(e, t, r) {
  return e.tagName === "TITLE" && r.headTitleMutations ? !0 : t.getId(e) === Ur;
}
function xc(e, t) {
  if (Nr(e))
    return !1;
  const r = t.getId(e);
  if (!t.has(r))
    return !0;
  const n = ie.parentNode(e);
  return n && n.nodeType === e.DOCUMENT_NODE ? !1 : n ? xc(n, t) : !0;
}
function ds(e) {
  return !!e.changedTouches;
}
function Mm(e = window) {
  "NodeList" in e && !e.NodeList.prototype.forEach && (e.NodeList.prototype.forEach = Array.prototype.forEach), "DOMTokenList" in e && !e.DOMTokenList.prototype.forEach && (e.DOMTokenList.prototype.forEach = Array.prototype.forEach);
}
function Sc(e, t) {
  return !!(e.nodeName === "IFRAME" && t.getMeta(e));
}
function Cc(e, t) {
  return !!(e.nodeName === "LINK" && e.nodeType === e.ELEMENT_NODE && e.getAttribute && e.getAttribute("rel") === "stylesheet" && t.getMeta(e));
}
function ps(e) {
  return e ? e instanceof Ds && "shadowRoot" in e ? !!e.shadowRoot : !!ie.shadowRoot(e) : !1;
}
class Rm {
  constructor() {
    F(this, "id", 1), F(this, "styleIDMap", /* @__PURE__ */ new WeakMap()), F(this, "idStyleMap", /* @__PURE__ */ new Map());
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
function Ec(e) {
  var t;
  let r = null;
  return "getRootNode" in e && ((t = ie.getRootNode(e)) == null ? void 0 : t.nodeType) === Node.DOCUMENT_FRAGMENT_NODE && ie.host(ie.getRootNode(e)) && (r = ie.host(ie.getRootNode(e))), r;
}
function Am(e) {
  let t = e, r;
  for (; r = Ec(t); )
    t = r;
  return t;
}
function Tm(e) {
  const t = ie.ownerDocument(e);
  if (!t) return !1;
  const r = Am(e);
  return ie.contains(t, r);
}
function Mc(e) {
  const t = ie.ownerDocument(e);
  return t ? ie.contains(t, e) || Tm(e) : !1;
}
var pe = /* @__PURE__ */ ((e) => (e[e.DomContentLoaded = 0] = "DomContentLoaded", e[e.Load = 1] = "Load", e[e.FullSnapshot = 2] = "FullSnapshot", e[e.IncrementalSnapshot = 3] = "IncrementalSnapshot", e[e.Meta = 4] = "Meta", e[e.Custom = 5] = "Custom", e[e.Plugin = 6] = "Plugin", e[e.Asset = 7] = "Asset", e))(pe || {}), ce = /* @__PURE__ */ ((e) => (e[e.Mutation = 0] = "Mutation", e[e.MouseMove = 1] = "MouseMove", e[e.MouseInteraction = 2] = "MouseInteraction", e[e.Scroll = 3] = "Scroll", e[e.ViewportResize = 4] = "ViewportResize", e[e.Input = 5] = "Input", e[e.TouchMove = 6] = "TouchMove", e[e.MediaInteraction = 7] = "MediaInteraction", e[e.StyleSheetRule = 8] = "StyleSheetRule", e[e.CanvasMutation = 9] = "CanvasMutation", e[e.Font = 10] = "Font", e[e.Log = 11] = "Log", e[e.Drag = 12] = "Drag", e[e.StyleDeclaration = 13] = "StyleDeclaration", e[e.Selection = 14] = "Selection", e[e.AdoptedStyleSheet = 15] = "AdoptedStyleSheet", e[e.CustomElement = 16] = "CustomElement", e))(ce || {}), Ke = /* @__PURE__ */ ((e) => (e[e.MouseUp = 0] = "MouseUp", e[e.MouseDown = 1] = "MouseDown", e[e.Click = 2] = "Click", e[e.ContextMenu = 3] = "ContextMenu", e[e.DblClick = 4] = "DblClick", e[e.Focus = 5] = "Focus", e[e.Blur = 6] = "Blur", e[e.TouchStart = 7] = "TouchStart", e[e.TouchMove_Departed = 8] = "TouchMove_Departed", e[e.TouchEnd = 9] = "TouchEnd", e[e.TouchCancel = 10] = "TouchCancel", e))(Ke || {}), Mt = /* @__PURE__ */ ((e) => (e[e.Mouse = 0] = "Mouse", e[e.Pen = 1] = "Pen", e[e.Touch = 2] = "Touch", e))(Mt || {}), Cr = /* @__PURE__ */ ((e) => (e[e["2D"] = 0] = "2D", e[e.WebGL = 1] = "WebGL", e[e.WebGL2 = 2] = "WebGL2", e))(Cr || {}), pr = /* @__PURE__ */ ((e) => (e[e.Play = 0] = "Play", e[e.Pause = 1] = "Pause", e[e.Seeked = 2] = "Seeked", e[e.VolumeChange = 3] = "VolumeChange", e[e.RateChange = 4] = "RateChange", e))(pr || {}), Rc = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(Rc || {});
function Xa(e) {
  return "__ln" in e;
}
class Im {
  constructor() {
    F(this, "length", 0), F(this, "head", null), F(this, "tail", null);
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
    if (t.__ln = r, t.previousSibling && Xa(t.previousSibling)) {
      const n = t.previousSibling.__ln.next;
      r.next = n, r.previous = t.previousSibling.__ln, t.previousSibling.__ln.next = r, n && (n.previous = r);
    } else if (t.nextSibling && Xa(t.nextSibling) && t.nextSibling.__ln.previous) {
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
const Ja = (e, t) => `${e}@${t}`;
class Lm {
  constructor() {
    F(this, "frozen", !1), F(this, "locked", !1), F(this, "texts", []), F(this, "attributes", []), F(this, "attributeMap", /* @__PURE__ */ new WeakMap()), F(this, "removes", []), F(this, "mapRemoves", []), F(this, "movedMap", {}), F(this, "addedSet", /* @__PURE__ */ new Set()), F(this, "movedSet", /* @__PURE__ */ new Set()), F(this, "droppedSet", /* @__PURE__ */ new Set()), F(this, "removesSubTreeCache", /* @__PURE__ */ new Set()), F(this, "mutationCb"), F(this, "blockClass"), F(this, "blockSelector"), F(this, "maskTextClass"), F(this, "maskTextSelector"), F(this, "inlineStylesheet"), F(this, "maskInputOptions"), F(this, "maskTextFn"), F(this, "maskInputFn"), F(this, "keepIframeSrcFn"), F(this, "recordCanvas"), F(this, "inlineImages"), F(this, "slimDOMOptions"), F(this, "dataURLOptions"), F(this, "doc"), F(this, "mirror"), F(this, "iframeManager"), F(this, "stylesheetManager"), F(this, "shadowDomManager"), F(this, "canvasManager"), F(this, "processedNodeManager"), F(this, "unattachedDoc"), F(this, "processMutations", (t) => {
      t.forEach(this.processMutation), this.emit();
    }), F(this, "emit", () => {
      if (this.frozen || this.locked)
        return;
      const t = [], r = /* @__PURE__ */ new Set(), n = new Im(), i = (a) => {
        let p = a, s = Ur;
        for (; s === Ur; )
          p = p && p.nextSibling, s = p && this.mirror.getId(p);
        return s;
      }, o = (a) => {
        const p = ie.parentNode(a);
        if (!p || !Mc(a))
          return;
        let s = !1;
        if (a.nodeType === Node.TEXT_NODE) {
          const m = p.tagName;
          if (m === "TEXTAREA")
            return;
          m === "STYLE" && this.addedSet.has(p) && (s = !0);
        }
        const h = Nr(p) ? this.mirror.getId(Ec(a)) : this.mirror.getId(p), d = i(a);
        if (h === -1 || d === -1)
          return n.addNode(a);
        const u = fr(a, {
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
            Sc(m, this.mirror) && this.iframeManager.addIframe(m), Cc(m, this.mirror) && this.stylesheetManager.trackLinkElement(
              m
            ), ps(a) && this.shadowDomManager.addShadowRoot(ie.shadowRoot(a), this.doc);
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
      for (const a of this.movedSet)
        Za(this.removesSubTreeCache, a, this.mirror) && !this.movedSet.has(ie.parentNode(a)) || o(a);
      for (const a of this.addedSet)
        !Qa(this.droppedSet, a) && !Za(this.removesSubTreeCache, a, this.mirror) || Qa(this.movedSet, a) ? o(a) : this.droppedSet.add(a);
      let l = null;
      for (; n.length; ) {
        let a = null;
        if (l) {
          const p = this.mirror.getId(ie.parentNode(l.value)), s = i(l.value);
          p !== -1 && s !== -1 && (a = l);
        }
        if (!a) {
          let p = n.tail;
          for (; p; ) {
            const s = p;
            if (p = p.previous, s) {
              const h = this.mirror.getId(ie.parentNode(s.value));
              if (i(s.value) === -1) continue;
              if (h !== -1) {
                a = s;
                break;
              } else {
                const u = s.value, m = ie.parentNode(u);
                if (m && m.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                  const f = ie.host(m);
                  if (this.mirror.getId(f) !== -1) {
                    a = s;
                    break;
                  }
                }
              }
            }
          }
        }
        if (!a) {
          for (; n.head; )
            n.removeNode(n.head.value);
          break;
        }
        l = a.previous, n.removeNode(a.value), o(a.value);
      }
      const c = {
        texts: this.texts.map((a) => {
          const p = a.node, s = ie.parentNode(p);
          return s && s.tagName === "TEXTAREA" && this.genTextAreaValueMutation(s), {
            id: this.mirror.getId(p),
            value: a.value
          };
        }).filter((a) => !r.has(a.id)).filter((a) => this.mirror.has(a.id)),
        attributes: this.attributes.map((a) => {
          const { attributes: p } = a;
          if (typeof p.style == "string") {
            const s = JSON.stringify(a.styleDiff), h = JSON.stringify(a._unchangedStyles);
            s.length < p.style.length && (s + h).split("var(").length === p.style.split("var(").length && (p.style = a.styleDiff);
          }
          return {
            id: this.mirror.getId(a.node),
            attributes: p
          };
        }).filter((a) => !r.has(a.id)).filter((a) => this.mirror.has(a.id)),
        removes: this.removes,
        adds: t
      };
      !c.texts.length && !c.attributes.length && !c.removes.length && !c.adds.length || (this.texts = [], this.attributes = [], this.attributeMap = /* @__PURE__ */ new WeakMap(), this.removes = [], this.addedSet = /* @__PURE__ */ new Set(), this.movedSet = /* @__PURE__ */ new Set(), this.droppedSet = /* @__PURE__ */ new Set(), this.removesSubTreeCache = /* @__PURE__ */ new Set(), this.movedMap = {}, this.mutationCb(c));
    }), F(this, "genTextAreaValueMutation", (t) => {
      let r = this.attributeMap.get(t);
      r || (r = {
        node: t,
        attributes: {},
        styleDiff: {},
        _unchangedStyles: {}
      }, this.attributes.push(r), this.attributeMap.set(t, r));
      const n = Array.from(
        ie.childNodes(t),
        (i) => ie.textContent(i) || ""
      ).join("");
      r.attributes.value = gn({
        element: t,
        maskInputOptions: this.maskInputOptions,
        tagName: t.tagName,
        type: yn(t),
        value: n,
        maskInputFn: this.maskInputFn
      });
    }), F(this, "processMutation", (t) => {
      if (!ss(t.target, this.mirror, this.slimDOMOptions))
        switch (t.type) {
          case "characterData": {
            const r = ie.textContent(t.target);
            !He(t.target, this.blockClass, this.blockSelector, !1) && r !== t.oldValue && this.texts.push({
              value: Ql(
                t.target,
                this.maskTextClass,
                this.maskTextSelector,
                !0
                // checkAncestors
              ) && r ? this.maskTextFn ? this.maskTextFn(r, wc(t.target)) : r.replace(/[\S]/g, "*") : r,
              node: t.target
            });
            break;
          }
          case "attributes": {
            const r = t.target;
            let n = t.attributeName, i = t.target.getAttribute(n);
            if (n === "value") {
              const l = yn(r);
              i = gn({
                element: r,
                maskInputOptions: this.maskInputOptions,
                tagName: r.tagName,
                type: l,
                value: i,
                maskInputFn: this.maskInputFn
              });
            }
            if (He(t.target, this.blockClass, this.blockSelector, !1) || i === t.oldValue)
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
            }, this.attributes.push(o), this.attributeMap.set(t.target, o)), n === "type" && r.tagName === "INPUT" && (t.oldValue || "").toLowerCase() === "password" && r.setAttribute("data-rr-is-password", "true"), !Zl(r.tagName, n))
              if (o.attributes[n] = Jl(
                this.doc,
                Kt(r.tagName),
                Kt(n),
                i
              ), n === "style") {
                if (!this.unattachedDoc)
                  try {
                    this.unattachedDoc = document.implementation.createHTMLDocument();
                  } catch {
                    this.unattachedDoc = this.doc;
                  }
                const l = this.unattachedDoc.createElement("span");
                t.oldValue && l.setAttribute("style", t.oldValue);
                for (const c of Array.from(r.style)) {
                  const a = r.style.getPropertyValue(c), p = r.style.getPropertyPriority(c);
                  a !== l.style.getPropertyValue(c) || p !== l.style.getPropertyPriority(c) ? p === "" ? o.styleDiff[c] = a : o.styleDiff[c] = [a, p] : o._unchangedStyles[c] = [a, p];
                }
                for (const c of Array.from(l.style))
                  r.style.getPropertyValue(c) === "" && (o.styleDiff[c] = !1);
              } else n === "open" && r.tagName === "DIALOG" && (r.matches("dialog:modal") ? o.attributes.rr_open_mode = "modal" : o.attributes.rr_open_mode = "non-modal");
            break;
          }
          case "childList": {
            if (He(t.target, this.blockClass, this.blockSelector, !0))
              return;
            if (t.target.tagName === "TEXTAREA") {
              this.genTextAreaValueMutation(t.target);
              return;
            }
            t.addedNodes.forEach((r) => this.genAdds(r, t.target)), t.removedNodes.forEach((r) => {
              const n = this.mirror.getId(r), i = Nr(t.target) ? this.mirror.getId(ie.host(t.target)) : this.mirror.getId(t.target);
              He(t.target, this.blockClass, this.blockSelector, !1) || ss(r, this.mirror, this.slimDOMOptions) || !Em(r, this.mirror) || (this.addedSet.has(r) ? (hs(this.addedSet, r), this.droppedSet.add(r)) : this.addedSet.has(t.target) && n === -1 || xc(t.target, this.mirror) || (this.movedSet.has(r) && this.movedMap[Ja(n, i)] ? hs(this.movedSet, r) : (this.removes.push({
                parentId: i,
                id: n,
                isShadow: Nr(t.target) && Pr(t.target) ? !0 : void 0
              }), Om(r, this.removesSubTreeCache))), this.mapRemoves.push(r));
            });
            break;
          }
        }
    }), F(this, "genAdds", (t, r) => {
      if (!this.processedNodeManager.inOtherBuffer(t, this) && !(this.addedSet.has(t) || this.movedSet.has(t))) {
        if (this.mirror.hasNode(t)) {
          if (ss(t, this.mirror, this.slimDOMOptions))
            return;
          this.movedSet.add(t);
          let n = null;
          r && this.mirror.hasNode(r) && (n = this.mirror.getId(r)), n && n !== -1 && (this.movedMap[Ja(this.mirror.getId(t), n)] = !0);
        } else
          this.addedSet.add(t), this.droppedSet.delete(t);
        He(t, this.blockClass, this.blockSelector, !1) || (ie.childNodes(t).forEach((n) => this.genAdds(n)), ps(t) && ie.childNodes(ie.shadowRoot(t)).forEach((n) => {
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
function hs(e, t) {
  e.delete(t), ie.childNodes(t).forEach((r) => hs(e, r));
}
function Om(e, t) {
  const r = [e];
  for (; r.length; ) {
    const n = r.pop();
    t.has(n) || (t.add(n), ie.childNodes(n).forEach((i) => r.push(i)));
  }
}
function Za(e, t, r) {
  return e.size === 0 ? !1 : _m(e, t);
}
function _m(e, t, r) {
  const n = ie.parentNode(t);
  return n ? e.has(n) : !1;
}
function Qa(e, t) {
  return e.size === 0 ? !1 : Ac(e, t);
}
function Ac(e, t) {
  const r = ie.parentNode(t);
  return r ? e.has(r) ? !0 : Ac(e, r) : !1;
}
let $r;
function Nm(e) {
  $r = e;
}
function Pm() {
  $r = void 0;
}
const de = (e) => $r ? (...r) => {
  try {
    return e(...r);
  } catch (n) {
    if ($r && $r(n) === !0)
      return;
    throw n;
  }
} : e, Vt = [];
function Vr(e) {
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
function Tc(e, t) {
  const r = new Lm();
  Vt.push(r), r.init(e);
  const [n, i] = yc(), o = new n(
    de(r.processMutations.bind(r))
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
function $m({
  mousemoveCb: e,
  sampling: t,
  doc: r,
  mirror: n
}) {
  if (t.mousemove === !1)
    return () => {
    };
  const i = typeof t.mousemove == "number" ? t.mousemove : 50, o = typeof t.mousemoveCallback == "number" ? t.mousemoveCallback : 500;
  let l = [], c;
  const a = qr(
    de(
      (h) => {
        const d = Date.now() - c;
        e(
          l.map((u) => (u.timeOffset -= d, u)),
          h
        ), l = [], c = null;
      }
    ),
    o
  ), p = de(
    qr(
      de((h) => {
        const d = Vr(h), { clientX: u, clientY: m } = ds(h) ? h.changedTouches[0] : h;
        c || (c = Br()), l.push({
          x: u,
          y: m,
          id: n.getId(d),
          timeOffset: Br() - c
        }), a(
          typeof DragEvent < "u" && h instanceof DragEvent ? ce.Drag : h instanceof MouseEvent ? ce.MouseMove : ce.TouchMove
        );
      }),
      i,
      {
        trailing: !1
      }
    )
  ), s = [
    je("mousemove", p, r),
    je("touchmove", p, r),
    je("drag", p, r)
  ];
  return de(() => {
    s.forEach((h) => h());
  });
}
function Dm({
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
  const l = o.mouseInteraction === !0 || o.mouseInteraction === void 0 ? {} : o.mouseInteraction, c = [];
  let a = null;
  const p = (s) => (h) => {
    const d = Vr(h);
    if (He(d, n, i, !0))
      return;
    let u = null, m = s;
    if ("pointerType" in h) {
      switch (h.pointerType) {
        case "mouse":
          u = Mt.Mouse;
          break;
        case "touch":
          u = Mt.Touch;
          break;
        case "pen":
          u = Mt.Pen;
          break;
      }
      u === Mt.Touch ? Ke[s] === Ke.MouseDown ? m = "TouchStart" : Ke[s] === Ke.MouseUp && (m = "TouchEnd") : Mt.Pen;
    } else ds(h) && (u = Mt.Touch);
    u !== null ? (a = u, (m.startsWith("Touch") && u === Mt.Touch || m.startsWith("Mouse") && u === Mt.Mouse) && (u = null)) : Ke[s] === Ke.Click && (u = a, a = null);
    const f = ds(h) ? h.changedTouches[0] : h;
    if (!f)
      return;
    const g = r.getId(d), { clientX: x, clientY: b } = f;
    de(e)({
      type: Ke[m],
      id: g,
      x,
      y: b,
      ...u !== null && { pointerType: u }
    });
  };
  return Object.keys(Ke).filter(
    (s) => Number.isNaN(Number(s)) && !s.endsWith("_Departed") && l[s] !== !1
  ).forEach((s) => {
    let h = Kt(s);
    const d = p(s);
    if (window.PointerEvent)
      switch (Ke[s]) {
        case Ke.MouseDown:
        case Ke.MouseUp:
          h = h.replace(
            "mouse",
            "pointer"
          );
          break;
        case Ke.TouchStart:
        case Ke.TouchEnd:
          return;
      }
    c.push(je(h, d, t));
  }), de(() => {
    c.forEach((s) => s());
  });
}
function Ic({
  scrollCb: e,
  doc: t,
  mirror: r,
  blockClass: n,
  blockSelector: i,
  sampling: o
}) {
  const l = de(
    qr(
      de((c) => {
        const a = Vr(c);
        if (!a || He(a, n, i, !0))
          return;
        const p = r.getId(a);
        if (a === t && t.defaultView) {
          const s = bc(t.defaultView);
          e({
            id: p,
            x: s.left,
            y: s.top
          });
        } else
          e({
            id: p,
            x: a.scrollLeft,
            y: a.scrollTop
          });
      }),
      o.scroll || 100
    )
  );
  return je("scroll", l, t);
}
function zm({ viewportResizeCb: e }, { win: t }) {
  let r = -1, n = -1;
  const i = de(
    qr(
      de(() => {
        const o = vc(), l = kc();
        (r !== o || n !== l) && (e({
          width: Number(l),
          height: Number(o)
        }), r = o, n = l);
      }),
      200
    )
  );
  return je("resize", i, t);
}
const Fm = ["INPUT", "TEXTAREA", "SELECT"], el = /* @__PURE__ */ new WeakMap();
function Um({
  inputCb: e,
  doc: t,
  mirror: r,
  blockClass: n,
  blockSelector: i,
  ignoreClass: o,
  ignoreSelector: l,
  maskInputOptions: c,
  maskInputFn: a,
  sampling: p,
  userTriggeredOnInput: s
}) {
  function h(b) {
    let y = Vr(b);
    const C = b.isTrusted, w = y && y.tagName;
    if (y && w === "OPTION" && (y = ie.parentElement(y)), !y || !w || Fm.indexOf(w) < 0 || He(y, n, i, !0) || y.classList.contains(o) || l && y.matches(l))
      return;
    let k = y.value, S = !1;
    const L = yn(y) || "";
    L === "radio" || L === "checkbox" ? S = y.checked : (c[w.toLowerCase()] || c[L]) && (k = gn({
      element: y,
      maskInputOptions: c,
      tagName: w,
      type: L,
      value: k,
      maskInputFn: a
    })), d(
      y,
      s ? { text: k, isChecked: S, userTriggered: C } : { text: k, isChecked: S }
    );
    const N = y.name;
    L === "radio" && N && S && t.querySelectorAll(`input[type="radio"][name="${N}"]`).forEach((O) => {
      if (O !== y) {
        const K = O.value;
        d(
          O,
          s ? { text: K, isChecked: !S, userTriggered: !1 } : { text: K, isChecked: !S }
        );
      }
    });
  }
  function d(b, y) {
    const C = el.get(b);
    if (!C || C.text !== y.text || C.isChecked !== y.isChecked) {
      el.set(b, y);
      const w = r.getId(b);
      de(e)({
        ...y,
        id: w
      });
    }
  }
  const m = (p.input === "last" ? ["change"] : ["input", "change"]).map(
    (b) => je(b, de(h), t)
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
      (b) => Fn(
        b[0],
        b[1],
        {
          set() {
            de(h)({
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
  ), de(() => {
    m.forEach((b) => b());
  });
}
function kn(e) {
  const t = [];
  function r(n, i) {
    if (an("CSSGroupingRule") && n.parentRule instanceof CSSGroupingRule || an("CSSMediaRule") && n.parentRule instanceof CSSMediaRule || an("CSSSupportsRule") && n.parentRule instanceof CSSSupportsRule || an("CSSConditionRule") && n.parentRule instanceof CSSConditionRule) {
      const l = Array.from(
        n.parentRule.cssRules
      ).indexOf(n);
      return i.unshift(l), r(n.parentRule, i);
    } else if (n.parentStyleSheet) {
      const l = Array.from(n.parentStyleSheet.cssRules).indexOf(n);
      i.unshift(l);
    }
    return i;
  }
  return r(e, t);
}
function It(e, t, r) {
  let n, i;
  return e ? (e.ownerNode ? n = t.getId(e.ownerNode) : i = r.getId(e), {
    styleId: i,
    id: n
  }) : {};
}
function Bm({ styleSheetRuleCb: e, mirror: t, stylesheetManager: r }, { win: n }) {
  if (!n.CSSStyleSheet || !n.CSSStyleSheet.prototype)
    return () => {
    };
  const i = n.CSSStyleSheet.prototype.insertRule;
  n.CSSStyleSheet.prototype.insertRule = new Proxy(i, {
    apply: de(
      (s, h, d) => {
        const [u, m] = d, { id: f, styleId: g } = It(
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
    apply: de(
      (s, h, d) => {
        const [u] = d, { id: m, styleId: f } = It(
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
  let l;
  n.CSSStyleSheet.prototype.replace && (l = n.CSSStyleSheet.prototype.replace, n.CSSStyleSheet.prototype.replace = new Proxy(l, {
    apply: de(
      (s, h, d) => {
        const [u] = d, { id: m, styleId: f } = It(
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
    apply: de(
      (s, h, d) => {
        const [u] = d, { id: m, styleId: f } = It(
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
  const a = {};
  ln("CSSGroupingRule") ? a.CSSGroupingRule = n.CSSGroupingRule : (ln("CSSMediaRule") && (a.CSSMediaRule = n.CSSMediaRule), ln("CSSConditionRule") && (a.CSSConditionRule = n.CSSConditionRule), ln("CSSSupportsRule") && (a.CSSSupportsRule = n.CSSSupportsRule));
  const p = {};
  return Object.entries(a).forEach(([s, h]) => {
    p[s] = {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      insertRule: h.prototype.insertRule,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      deleteRule: h.prototype.deleteRule
    }, h.prototype.insertRule = new Proxy(
      p[s].insertRule,
      {
        apply: de(
          (d, u, m) => {
            const [f, g] = m, { id: x, styleId: b } = It(
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
                    ...kn(u),
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
        apply: de(
          (d, u, m) => {
            const [f] = m, { id: g, styleId: x } = It(
              u.parentStyleSheet,
              t,
              r.styleMirror
            );
            return (g && g !== -1 || x && x !== -1) && e({
              id: g,
              styleId: x,
              removes: [
                { index: [...kn(u), f] }
              ]
            }), d.apply(u, m);
          }
        )
      }
    );
  }), de(() => {
    n.CSSStyleSheet.prototype.insertRule = i, n.CSSStyleSheet.prototype.deleteRule = o, l && (n.CSSStyleSheet.prototype.replace = l), c && (n.CSSStyleSheet.prototype.replaceSync = c), Object.entries(a).forEach(([s, h]) => {
      h.prototype.insertRule = p[s].insertRule, h.prototype.deleteRule = p[s].deleteRule;
    });
  });
}
function Lc({
  mirror: e,
  stylesheetManager: t
}, r) {
  var n, i, o;
  let l = null;
  r.nodeName === "#document" ? l = e.getId(r) : l = e.getId(ie.host(r));
  const c = r.nodeName === "#document" ? (n = r.defaultView) == null ? void 0 : n.Document : (o = (i = r.ownerDocument) == null ? void 0 : i.defaultView) == null ? void 0 : o.ShadowRoot, a = c != null && c.prototype ? Object.getOwnPropertyDescriptor(
    c == null ? void 0 : c.prototype,
    "adoptedStyleSheets"
  ) : void 0;
  return l === null || l === -1 || !c || !a ? () => {
  } : (Object.defineProperty(r, "adoptedStyleSheets", {
    configurable: a.configurable,
    enumerable: a.enumerable,
    get() {
      var p;
      return (p = a.get) == null ? void 0 : p.call(this);
    },
    set(p) {
      var s;
      const h = (s = a.set) == null ? void 0 : s.call(this, p);
      if (l !== null && l !== -1)
        try {
          t.adoptStyleSheets(p, l);
        } catch {
        }
      return h;
    }
  }), de(() => {
    Object.defineProperty(r, "adoptedStyleSheets", {
      configurable: a.configurable,
      enumerable: a.enumerable,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      get: a.get,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      set: a.set
    });
  }));
}
function qm({
  styleDeclarationCb: e,
  mirror: t,
  ignoreCSSAttributes: r,
  stylesheetManager: n
}, { win: i }) {
  const o = i.CSSStyleDeclaration.prototype.setProperty;
  i.CSSStyleDeclaration.prototype.setProperty = new Proxy(o, {
    apply: de(
      (c, a, p) => {
        var s;
        const [h, d, u] = p;
        if (r.has(h))
          return o.apply(a, [h, d, u]);
        const { id: m, styleId: f } = It(
          (s = a.parentRule) == null ? void 0 : s.parentStyleSheet,
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
          index: kn(a.parentRule)
        }), c.apply(a, p);
      }
    )
  });
  const l = i.CSSStyleDeclaration.prototype.removeProperty;
  return i.CSSStyleDeclaration.prototype.removeProperty = new Proxy(l, {
    apply: de(
      (c, a, p) => {
        var s;
        const [h] = p;
        if (r.has(h))
          return l.apply(a, [h]);
        const { id: d, styleId: u } = It(
          (s = a.parentRule) == null ? void 0 : s.parentStyleSheet,
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
          index: kn(a.parentRule)
        }), c.apply(a, p);
      }
    )
  }), de(() => {
    i.CSSStyleDeclaration.prototype.setProperty = o, i.CSSStyleDeclaration.prototype.removeProperty = l;
  });
}
function Wm({
  mediaInteractionCb: e,
  blockClass: t,
  blockSelector: r,
  mirror: n,
  sampling: i,
  doc: o
}) {
  const l = de(
    (a) => qr(
      de((p) => {
        const s = Vr(p);
        if (!s || He(s, t, r, !0))
          return;
        const { currentTime: h, volume: d, muted: u, playbackRate: m, loop: f } = s;
        e({
          type: a,
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
    je("play", l(pr.Play), o),
    je("pause", l(pr.Pause), o),
    je("seeked", l(pr.Seeked), o),
    je("volumechange", l(pr.VolumeChange), o),
    je("ratechange", l(pr.RateChange), o)
  ];
  return de(() => {
    c.forEach((a) => a());
  });
}
function jm({ fontCb: e, doc: t }) {
  const r = t.defaultView;
  if (!r)
    return () => {
    };
  const n = [], i = /* @__PURE__ */ new WeakMap(), o = r.FontFace;
  r.FontFace = function(a, p, s) {
    const h = new o(a, p, s);
    return i.set(h, {
      family: a,
      buffer: typeof p != "string",
      descriptors: s,
      fontSource: typeof p == "string" ? p : JSON.stringify(Array.from(new Uint8Array(p)))
    }), h;
  };
  const l = Zt(
    t.fonts,
    "add",
    function(c) {
      return function(a) {
        return setTimeout(
          de(() => {
            const p = i.get(a);
            p && (e(p), i.delete(a));
          }),
          0
        ), c.apply(this, [a]);
      };
    }
  );
  return n.push(() => {
    r.FontFace = o;
  }), n.push(l), de(() => {
    n.forEach((c) => c());
  });
}
function Hm(e) {
  const { doc: t, mirror: r, blockClass: n, blockSelector: i, selectionCb: o } = e;
  let l = !0;
  const c = de(() => {
    const a = t.getSelection();
    if (!a || l && (a != null && a.isCollapsed)) return;
    l = a.isCollapsed || !1;
    const p = [], s = a.rangeCount || 0;
    for (let h = 0; h < s; h++) {
      const d = a.getRangeAt(h), { startContainer: u, startOffset: m, endContainer: f, endOffset: g } = d;
      He(u, n, i, !0) || He(f, n, i, !0) || p.push({
        start: r.getId(u),
        startOffset: m,
        end: r.getId(f),
        endOffset: g
      });
    }
    o({ ranges: p });
  });
  return c(), je("selectionchange", c);
}
function Vm({
  doc: e,
  customElementCb: t
}) {
  const r = e.defaultView;
  return !r || !r.customElements ? () => {
  } : Zt(
    r.customElements,
    "define",
    function(i) {
      return function(o, l, c) {
        try {
          t({
            define: {
              name: o
            }
          });
        } catch {
          console.warn(`Custom element callback failed for ${o}`);
        }
        return i.apply(this, [o, l, c]);
      };
    }
  );
}
function Gm(e, t) {
  const {
    mutationCb: r,
    mousemoveCb: n,
    mouseInteractionCb: i,
    scrollCb: o,
    viewportResizeCb: l,
    inputCb: c,
    mediaInteractionCb: a,
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
    t.viewportResize && t.viewportResize(...f), l(...f);
  }, e.inputCb = (...f) => {
    t.input && t.input(...f), c(...f);
  }, e.mediaInteractionCb = (...f) => {
    t.mediaInteaction && t.mediaInteaction(...f), a(...f);
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
function Ym(e, t = {}) {
  const r = e.doc.defaultView;
  if (!r)
    return () => {
    };
  Gm(e, t);
  let n, i = () => {
  };
  e.recordDOM && ([n, i] = Tc(e, e.doc));
  const o = $m(e), l = Dm(e), c = Ic(e), a = zm(e, {
    win: r
  }), p = Um(e), s = Wm(e);
  let h = () => {
  }, d = () => {
  }, u = () => {
  }, m = () => {
  };
  e.recordDOM && (h = Bm(e, { win: r }), d = Lc(e, e.doc), u = qm(e, {
    win: r
  }), e.collectFonts && (m = jm(e)));
  const f = Hm(e), g = Vm(e), x = [];
  for (const b of e.plugins)
    x.push(
      b.observer(b.callback, r, b.options)
    );
  return de(() => {
    Vt.forEach((b) => b.reset()), n == null || n.disconnect(), i(), o(), l(), c(), a(), p(), s(), h(), d(), u(), m(), f(), g(), x.forEach((b) => b());
  });
}
function an(e) {
  return typeof window[e] < "u";
}
function ln(e) {
  return !!(typeof window[e] < "u" && // Note: Generally, this check _shouldn't_ be necessary
  // However, in some scenarios (e.g. jsdom) this can sometimes fail, so we check for it here
  window[e].prototype && "insertRule" in window[e].prototype && "deleteRule" in window[e].prototype);
}
class tl {
  constructor(t) {
    F(this, "iframeIdToRemoteIdMap", /* @__PURE__ */ new WeakMap()), F(this, "iframeRemoteIdToIdMap", /* @__PURE__ */ new WeakMap()), this.generateIdFn = t;
  }
  getId(t, r, n, i) {
    const o = n || this.getIdToRemoteIdMap(t), l = i || this.getRemoteIdToIdMap(t);
    let c = o.get(r);
    return c || (c = this.generateIdFn(), o.set(r, c), l.set(c, r)), c;
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
class Km {
  constructor(t) {
    F(this, "iframes", /* @__PURE__ */ new WeakMap()), F(this, "crossOriginIframeMap", /* @__PURE__ */ new WeakMap()), F(this, "crossOriginIframeMirror", new tl(Xl)), F(this, "crossOriginIframeStyleMirror"), F(this, "crossOriginIframeRootIdMap", /* @__PURE__ */ new WeakMap()), F(this, "mirror"), F(this, "mutationCb"), F(this, "wrappedEmit"), F(this, "loadListener"), F(this, "stylesheetManager"), F(this, "recordCrossOriginIframes"), this.mutationCb = t.mutationCb, this.wrappedEmit = t.wrappedEmit, this.stylesheetManager = t.stylesheetManager, this.recordCrossOriginIframes = t.recordCrossOriginIframes, this.crossOriginIframeStyleMirror = new tl(
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
      case pe.FullSnapshot: {
        this.crossOriginIframeMirror.reset(t), this.crossOriginIframeStyleMirror.reset(t), this.replaceIdOnNode(r.data.node, t);
        const i = r.data.node.id;
        return this.crossOriginIframeRootIdMap.set(t, i), this.patchRootIdOnNode(r.data.node, i), {
          timestamp: r.timestamp,
          type: pe.IncrementalSnapshot,
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
      case pe.Meta:
      case pe.Load:
      case pe.DomContentLoaded:
        return !1;
      case pe.Plugin:
        return r;
      case pe.Custom:
        return this.replaceIds(
          r.data.payload,
          t,
          ["id", "parentId", "previousId", "nextId"]
        ), r;
      case pe.IncrementalSnapshot:
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
    t.type !== Rc.Document && !t.rootId && (t.rootId = r), "childNodes" in t && t.childNodes.forEach((n) => {
      this.patchRootIdOnNode(n, r);
    });
  }
}
class Xm {
  constructor(t) {
    F(this, "shadowDoms", /* @__PURE__ */ new WeakSet()), F(this, "mutationCb"), F(this, "scrollCb"), F(this, "bypassOptions"), F(this, "mirror"), F(this, "restoreHandlers", []), this.mutationCb = t.mutationCb, this.scrollCb = t.scrollCb, this.bypassOptions = t.bypassOptions, this.mirror = t.mirror, this.init();
  }
  init() {
    this.reset(), this.patchAttachShadow(Element, document);
  }
  addShadowRoot(t, r) {
    if (!Pr(t) || this.shadowDoms.has(t)) return;
    this.shadowDoms.add(t);
    const [n] = Tc(
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
      Ic({
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
        this.mirror.getId(ie.host(t))
      ), this.restoreHandlers.push(
        Lc(
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
      Zt(
        t.prototype,
        "attachShadow",
        function(i) {
          return function(o) {
            const l = i.call(this, o), c = ie.shadowRoot(this);
            return c && Mc(this) && n.addShadowRoot(c, r), l;
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
var mr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", Jm = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (var cn = 0; cn < mr.length; cn++)
  Jm[mr.charCodeAt(cn)] = cn;
var Zm = function(e) {
  var t = new Uint8Array(e), r, n = t.length, i = "";
  for (r = 0; r < n; r += 3)
    i += mr[t[r] >> 2], i += mr[(t[r] & 3) << 4 | t[r + 1] >> 4], i += mr[(t[r + 1] & 15) << 2 | t[r + 2] >> 6], i += mr[t[r + 2] & 63];
  return n % 3 === 2 ? i = i.substring(0, i.length - 1) + "=" : n % 3 === 1 && (i = i.substring(0, i.length - 2) + "=="), i;
};
const rl = /* @__PURE__ */ new Map();
function Qm(e, t) {
  let r = rl.get(e);
  return r || (r = /* @__PURE__ */ new Map(), rl.set(e, r)), r.has(t) || r.set(t, []), r.get(t);
}
const Oc = (e, t, r) => {
  if (!e || !(Nc(e, t) || typeof e == "object"))
    return;
  const n = e.constructor.name, i = Qm(r, n);
  let o = i.indexOf(e);
  return o === -1 && (o = i.length, i.push(e)), o;
};
function dn(e, t, r) {
  if (e instanceof Array)
    return e.map((n) => dn(n, t, r));
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
    const n = e.constructor.name, i = Zm(e);
    return {
      rr_type: n,
      base64: i
    };
  } else {
    if (e instanceof DataView)
      return {
        rr_type: e.constructor.name,
        args: [
          dn(e.buffer, t, r),
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
          args: [dn(e.data, t, r), e.width, e.height]
        };
      if (Nc(e, t) || typeof e == "object") {
        const n = e.constructor.name, i = Oc(e, t, r);
        return {
          rr_type: n,
          index: i
        };
      }
    }
  }
  return e;
}
const _c = (e, t, r) => e.map((n) => dn(n, t, r)), Nc = (e, t) => !![
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
function eg(e, t, r, n) {
  const i = [], o = Object.getOwnPropertyNames(
    t.CanvasRenderingContext2D.prototype
  );
  for (const l of o)
    try {
      if (typeof t.CanvasRenderingContext2D.prototype[l] != "function")
        continue;
      const c = Zt(
        t.CanvasRenderingContext2D.prototype,
        l,
        function(a) {
          return function(...p) {
            return He(this.canvas, r, n, !0) || setTimeout(() => {
              const s = _c(p, t, this);
              e(this.canvas, {
                type: Cr["2D"],
                property: l,
                args: s
              });
            }, 0), a.apply(this, p);
          };
        }
      );
      i.push(c);
    } catch {
      const c = Fn(
        t.CanvasRenderingContext2D.prototype,
        l,
        {
          set(a) {
            e(this.canvas, {
              type: Cr["2D"],
              property: l,
              args: [a],
              setter: !0
            });
          }
        }
      );
      i.push(c);
    }
  return () => {
    i.forEach((l) => l());
  };
}
function tg(e) {
  return e === "experimental-webgl" ? "webgl" : e;
}
function nl(e, t, r, n) {
  const i = [];
  try {
    const o = Zt(
      e.HTMLCanvasElement.prototype,
      "getContext",
      function(l) {
        return function(c, ...a) {
          if (!He(this, t, r, !0)) {
            const p = tg(c);
            if ("__context" in this || (this.__context = p), n && ["webgl", "webgl2"].includes(p))
              if (a[0] && typeof a[0] == "object") {
                const s = a[0];
                s.preserveDrawingBuffer || (s.preserveDrawingBuffer = !0);
              } else
                a.splice(0, 1, {
                  preserveDrawingBuffer: !0
                });
          }
          return l.apply(this, [c, ...a]);
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
function il(e, t, r, n, i, o) {
  const l = [], c = Object.getOwnPropertyNames(e);
  for (const a of c)
    if (
      //prop.startsWith('get') ||  // e.g. getProgramParameter, but too risky
      ![
        "isContextLost",
        "canvas",
        "drawingBufferWidth",
        "drawingBufferHeight"
      ].includes(a)
    )
      try {
        if (typeof e[a] != "function")
          continue;
        const p = Zt(
          e,
          a,
          function(s) {
            return function(...h) {
              const d = s.apply(this, h);
              if (Oc(d, o, this), "tagName" in this.canvas && !He(this.canvas, n, i, !0)) {
                const u = _c(h, o, this), m = {
                  type: t,
                  property: a,
                  args: u
                };
                r(this.canvas, m);
              }
              return d;
            };
          }
        );
        l.push(p);
      } catch {
        const p = Fn(e, a, {
          set(s) {
            r(this.canvas, {
              type: t,
              property: a,
              args: [s],
              setter: !0
            });
          }
        });
        l.push(p);
      }
  return l;
}
function rg(e, t, r, n) {
  const i = [];
  return typeof t.WebGLRenderingContext < "u" && i.push(
    ...il(
      t.WebGLRenderingContext.prototype,
      Cr.WebGL,
      e,
      r,
      n,
      t
    )
  ), typeof t.WebGL2RenderingContext < "u" && i.push(
    ...il(
      t.WebGL2RenderingContext.prototype,
      Cr.WebGL2,
      e,
      r,
      n,
      t
    )
  ), () => {
    i.forEach((o) => o());
  };
}
const Pc = `(function() {
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
`, sl = typeof self < "u" && self.Blob && new Blob([Pc], { type: "text/javascript;charset=utf-8" });
function ng(e) {
  let t;
  try {
    if (t = sl && (self.URL || self.webkitURL).createObjectURL(sl), !t) throw "";
    const r = new Worker(t, {
      name: e == null ? void 0 : e.name
    });
    return r.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(t);
    }), r;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(Pc),
      {
        name: e == null ? void 0 : e.name
      }
    );
  } finally {
    t && (self.URL || self.webkitURL).revokeObjectURL(t);
  }
}
class ig {
  constructor(t) {
    F(this, "pendingCanvasMutations", /* @__PURE__ */ new Map()), F(this, "rafStamps", { latestId: 0, invokeId: null }), F(this, "mirror"), F(this, "mutationCb"), F(this, "resetObservers"), F(this, "frozen", !1), F(this, "locked", !1), F(this, "processMutation", (a, p) => {
      (this.rafStamps.invokeId && this.rafStamps.latestId !== this.rafStamps.invokeId || !this.rafStamps.invokeId) && (this.rafStamps.invokeId = this.rafStamps.latestId), this.pendingCanvasMutations.has(a) || this.pendingCanvasMutations.set(a, []), this.pendingCanvasMutations.get(a).push(p);
    });
    const {
      sampling: r = "all",
      win: n,
      blockClass: i,
      blockSelector: o,
      recordCanvas: l,
      dataURLOptions: c
    } = t;
    this.mutationCb = t.mutationCb, this.mirror = t.mirror, l && r === "all" && this.initCanvasMutationObserver(n, i, o), l && typeof r == "number" && this.initCanvasFPSObserver(r, n, i, o, {
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
    const l = nl(
      r,
      n,
      i,
      !0
    ), c = /* @__PURE__ */ new Map(), a = new ng();
    a.onmessage = (m) => {
      const { id: f } = m.data;
      if (c.set(f, !1), !("base64" in m.data)) return;
      const { base64: g, type: x, width: b, height: y } = m.data;
      this.mutationCb({
        id: f,
        type: Cr["2D"],
        commands: [
          {
            property: "clearRect",
            // wipe canvas
            args: [0, 0, b, y]
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
        He(f, n, i, !0) || m.push(f);
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
          const y = f.getContext(f.__context);
          ((g = y == null ? void 0 : y.getContextAttributes()) == null ? void 0 : g.preserveDrawingBuffer) === !1 && y.clear(y.COLOR_BUFFER_BIT);
        }
        const b = await createImageBitmap(f);
        a.postMessage(
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
      l(), cancelAnimationFrame(h);
    };
  }
  initCanvasMutationObserver(t, r, n) {
    this.startRAFTimestamping(), this.startPendingCanvasMutationFlusher();
    const i = nl(
      t,
      r,
      n,
      !1
    ), o = eg(
      this.processMutation.bind(this),
      t,
      r,
      n
    ), l = rg(
      this.processMutation.bind(this),
      t,
      r,
      n
    );
    this.resetObservers = () => {
      i(), o(), l();
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
    const i = n.map((l) => {
      const { type: c, ...a } = l;
      return a;
    }), { type: o } = n[0];
    this.mutationCb({ id: r, type: o, commands: i }), this.pendingCanvasMutations.delete(t);
  }
}
class sg {
  constructor(t) {
    F(this, "trackedLinkElements", /* @__PURE__ */ new WeakSet()), F(this, "mutationCb"), F(this, "adoptedStyleSheetCb"), F(this, "styleMirror", new Rm()), this.mutationCb = t.mutationCb, this.adoptedStyleSheetCb = t.adoptedStyleSheetCb;
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
      let l;
      this.styleMirror.has(o) ? l = this.styleMirror.getId(o) : (l = this.styleMirror.add(o), i.push({
        styleId: l,
        rules: Array.from(o.rules || CSSRule, (c, a) => ({
          rule: Gl(c, o.href),
          index: a
        }))
      })), n.styleIds.push(l);
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
class og {
  constructor() {
    F(this, "nodeMap", /* @__PURE__ */ new WeakMap()), F(this, "active", !1);
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
let Ie, pn, os, wn = !1;
try {
  if (Array.from([1], (e) => e * 2)[0] !== 2) {
    const e = document.createElement("iframe");
    document.body.appendChild(e), Array.from = (($o = e.contentWindow) == null ? void 0 : $o.Array.from) || Array.from, document.body.removeChild(e);
  }
} catch (e) {
  console.debug("Unable to override Array.from", e);
}
const lt = hf();
function Nt(e = {}) {
  const {
    emit: t,
    checkoutEveryNms: r,
    checkoutEveryNth: n,
    blockClass: i = "rr-block",
    blockSelector: o = null,
    ignoreClass: l = "rr-ignore",
    ignoreSelector: c = null,
    maskTextClass: a = "rr-mask",
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
    dataURLOptions: y = {},
    mousemoveWait: C,
    recordDOM: w = !0,
    recordCanvas: k = !1,
    recordCrossOriginIframes: S = !1,
    recordAfter: L = e.recordAfter === "DOMContentLoaded" ? e.recordAfter : "load",
    userTriggeredOnInput: N = !1,
    collectFonts: O = !1,
    inlineImages: K = !1,
    plugins: H,
    keepIframeSrcFn: I = () => !1,
    ignoreCSSAttributes: $e = /* @__PURE__ */ new Set([]),
    errorHandler: ne
  } = e;
  Nm(ne);
  const Q = S ? window.parent === window : !0;
  let he = !1;
  if (!Q)
    try {
      window.parent.document && (he = !1);
    } catch {
      he = !0;
    }
  if (Q && !t)
    throw new Error("emit function is required");
  if (!Q && !he)
    return () => {
    };
  C !== void 0 && b.mousemove === void 0 && (b.mousemove = C), lt.reset();
  const ye = h === !0 ? {
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
  } : d !== void 0 ? d : { password: !0 }, fe = ec(u);
  Mm();
  let oe, le = 0;
  const nt = (X) => {
    for (const Te of H || [])
      Te.eventProcessor && (X = Te.eventProcessor(X));
    return x && // Disable packing events which will be emitted to parent frames.
    !he && (X = x(X)), X;
  };
  Ie = (X, Te) => {
    var ue;
    const ke = X;
    if (ke.timestamp = Br(), (ue = Vt[0]) != null && ue.isFrozen() && ke.type !== pe.FullSnapshot && !(ke.type === pe.IncrementalSnapshot && ke.data.source === ce.Mutation) && Vt.forEach((De) => De.unfreeze()), Q)
      t == null || t(nt(ke), Te);
    else if (he) {
      const De = {
        type: "rrweb",
        event: nt(ke),
        origin: window.location.origin,
        isCheckout: Te
      };
      window.parent.postMessage(De, "*");
    }
    if (ke.type === pe.FullSnapshot)
      oe = ke, le = 0;
    else if (ke.type === pe.IncrementalSnapshot) {
      if (ke.data.source === ce.Mutation && ke.data.isAttachIframe)
        return;
      le++;
      const De = n && le >= n, ge = r && ke.timestamp - oe.timestamp > r;
      (De || ge) && pn(!0);
    }
  };
  const P = (X) => {
    Ie({
      type: pe.IncrementalSnapshot,
      data: {
        source: ce.Mutation,
        ...X
      }
    });
  }, Ue = (X) => Ie({
    type: pe.IncrementalSnapshot,
    data: {
      source: ce.Scroll,
      ...X
    }
  }), Re = (X) => Ie({
    type: pe.IncrementalSnapshot,
    data: {
      source: ce.CanvasMutation,
      ...X
    }
  }), it = (X) => Ie({
    type: pe.IncrementalSnapshot,
    data: {
      source: ce.AdoptedStyleSheet,
      ...X
    }
  }), Pe = new sg({
    mutationCb: P,
    adoptedStyleSheetCb: it
  }), Xe = new Km({
    mirror: lt,
    mutationCb: P,
    stylesheetManager: Pe,
    recordCrossOriginIframes: S,
    wrappedEmit: Ie
  });
  for (const X of H || [])
    X.getMirror && X.getMirror({
      nodeMirror: lt,
      crossOriginIframeMirror: Xe.crossOriginIframeMirror,
      crossOriginIframeStyleMirror: Xe.crossOriginIframeStyleMirror
    });
  const be = new og();
  os = new ig({
    recordCanvas: k,
    mutationCb: Re,
    win: window,
    blockClass: i,
    blockSelector: o,
    mirror: lt,
    sampling: b.canvas,
    dataURLOptions: y
  });
  const Ae = new Xm({
    mutationCb: P,
    scrollCb: Ue,
    bypassOptions: {
      blockClass: i,
      blockSelector: o,
      maskTextClass: a,
      maskTextSelector: p,
      inlineStylesheet: s,
      maskInputOptions: ye,
      dataURLOptions: y,
      maskTextFn: f,
      maskInputFn: m,
      recordCanvas: k,
      inlineImages: K,
      sampling: b,
      slimDOMOptions: fe,
      iframeManager: Xe,
      stylesheetManager: Pe,
      canvasManager: os,
      keepIframeSrcFn: I,
      processedNodeManager: be
    },
    mirror: lt
  });
  pn = (X = !1) => {
    if (!w)
      return;
    Ie(
      {
        type: pe.Meta,
        data: {
          href: window.location.href,
          width: kc(),
          height: vc()
        }
      },
      X
    ), Pe.reset(), Ae.init(), Vt.forEach((ue) => ue.lock());
    const Te = Df(document, {
      mirror: lt,
      blockClass: i,
      blockSelector: o,
      maskTextClass: a,
      maskTextSelector: p,
      inlineStylesheet: s,
      maskAllInputs: ye,
      maskTextFn: f,
      maskInputFn: m,
      slimDOM: fe,
      dataURLOptions: y,
      recordCanvas: k,
      inlineImages: K,
      onSerialize: (ue) => {
        Sc(ue, lt) && Xe.addIframe(ue), Cc(ue, lt) && Pe.trackLinkElement(ue), ps(ue) && Ae.addShadowRoot(ie.shadowRoot(ue), document);
      },
      onIframeLoad: (ue, ke) => {
        Xe.attachIframe(ue, ke), Ae.observeAttachShadow(ue);
      },
      onStylesheetLoad: (ue, ke) => {
        Pe.attachLinkElement(ue, ke);
      },
      keepIframeSrcFn: I
    });
    if (!Te)
      return console.warn("Failed to snapshot the document");
    Ie(
      {
        type: pe.FullSnapshot,
        data: {
          node: Te,
          initialOffset: bc(window)
        }
      },
      X
    ), Vt.forEach((ue) => ue.unlock()), document.adoptedStyleSheets && document.adoptedStyleSheets.length > 0 && Pe.adoptStyleSheets(
      document.adoptedStyleSheets,
      lt.getId(document)
    );
  };
  try {
    const X = [], Te = (ke) => {
      var De;
      return de(Ym)(
        {
          mutationCb: P,
          mousemoveCb: (ge, Qt) => Ie({
            type: pe.IncrementalSnapshot,
            data: {
              source: Qt,
              positions: ge
            }
          }),
          mouseInteractionCb: (ge) => Ie({
            type: pe.IncrementalSnapshot,
            data: {
              source: ce.MouseInteraction,
              ...ge
            }
          }),
          scrollCb: Ue,
          viewportResizeCb: (ge) => Ie({
            type: pe.IncrementalSnapshot,
            data: {
              source: ce.ViewportResize,
              ...ge
            }
          }),
          inputCb: (ge) => Ie({
            type: pe.IncrementalSnapshot,
            data: {
              source: ce.Input,
              ...ge
            }
          }),
          mediaInteractionCb: (ge) => Ie({
            type: pe.IncrementalSnapshot,
            data: {
              source: ce.MediaInteraction,
              ...ge
            }
          }),
          styleSheetRuleCb: (ge) => Ie({
            type: pe.IncrementalSnapshot,
            data: {
              source: ce.StyleSheetRule,
              ...ge
            }
          }),
          styleDeclarationCb: (ge) => Ie({
            type: pe.IncrementalSnapshot,
            data: {
              source: ce.StyleDeclaration,
              ...ge
            }
          }),
          canvasMutationCb: Re,
          fontCb: (ge) => Ie({
            type: pe.IncrementalSnapshot,
            data: {
              source: ce.Font,
              ...ge
            }
          }),
          selectionCb: (ge) => {
            Ie({
              type: pe.IncrementalSnapshot,
              data: {
                source: ce.Selection,
                ...ge
              }
            });
          },
          customElementCb: (ge) => {
            Ie({
              type: pe.IncrementalSnapshot,
              data: {
                source: ce.CustomElement,
                ...ge
              }
            });
          },
          blockClass: i,
          ignoreClass: l,
          ignoreSelector: c,
          maskTextClass: a,
          maskTextSelector: p,
          maskInputOptions: ye,
          inlineStylesheet: s,
          sampling: b,
          recordDOM: w,
          recordCanvas: k,
          inlineImages: K,
          userTriggeredOnInput: N,
          collectFonts: O,
          doc: ke,
          maskInputFn: m,
          maskTextFn: f,
          keepIframeSrcFn: I,
          blockSelector: o,
          slimDOMOptions: fe,
          dataURLOptions: y,
          mirror: lt,
          iframeManager: Xe,
          stylesheetManager: Pe,
          shadowDomManager: Ae,
          processedNodeManager: be,
          canvasManager: os,
          ignoreCSSAttributes: $e,
          plugins: ((De = H == null ? void 0 : H.filter((ge) => ge.observer)) == null ? void 0 : De.map((ge) => ({
            observer: ge.observer,
            options: ge.options,
            callback: (Qt) => Ie({
              type: pe.Plugin,
              data: {
                plugin: ge.name,
                payload: Qt
              }
            })
          }))) || []
        },
        g
      );
    };
    Xe.addLoadListener((ke) => {
      try {
        X.push(Te(ke.contentDocument));
      } catch (De) {
        console.warn(De);
      }
    });
    const ue = () => {
      pn(), X.push(Te(document)), wn = !0;
    };
    return ["interactive", "complete"].includes(document.readyState) ? ue() : (X.push(
      je("DOMContentLoaded", () => {
        Ie({
          type: pe.DomContentLoaded,
          data: {}
        }), L === "DOMContentLoaded" && ue();
      })
    ), X.push(
      je(
        "load",
        () => {
          Ie({
            type: pe.Load,
            data: {}
          }), L === "load" && ue();
        },
        window
      )
    )), () => {
      X.forEach((ke) => {
        try {
          ke();
        } catch (De) {
          String(De).toLowerCase().includes("cross-origin") || console.warn(De);
        }
      }), be.destroy(), wn = !1, Pm();
    };
  } catch (X) {
    console.warn(X);
  }
}
Nt.addCustomEvent = (e, t) => {
  if (!wn)
    throw new Error("please add custom event after start recording");
  Ie({
    type: pe.Custom,
    data: {
      tag: e,
      payload: t
    }
  });
};
Nt.freezePage = () => {
  Vt.forEach((e) => e.freeze());
};
Nt.takeFullSnapshot = (e) => {
  if (!wn)
    throw new Error("please take full snapshot after start recording");
  pn(e);
};
Nt.mirror = lt;
var ol;
(function(e) {
  e[e.NotStarted = 0] = "NotStarted", e[e.Running = 1] = "Running", e[e.Stopped = 2] = "Stopped";
})(ol || (ol = {}));
const { addCustomEvent: Kg } = Nt, { freezePage: Xg } = Nt, { takeFullSnapshot: Jg } = Nt, as = 2, ag = 4;
class lg {
  constructor(t) {
    Kr(this, "events", []);
    Kr(this, "lastMeta", null);
    Kr(this, "lastFull", null);
    this.opts = t;
  }
  push(t) {
    t.type === ag && (this.lastMeta = t), t.type === as && (this.lastFull = t, this.events = []), this.events.push(t), this.prune();
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
    return !this.events.some((n) => n.type === as) && this.lastFull && (this.lastMeta && t.push(this.lastMeta), t.push(this.lastFull)), [...t, ...this.events];
  }
  /** True when the buffer can produce a scrubbable replay (a full snapshot + at least one more event). */
  isPlayable() {
    const t = this.snapshot();
    return t.some((n) => n.type === as) && t.length >= 2;
  }
  clear() {
    this.events = [], this.lastMeta = null, this.lastFull = null;
  }
}
function cg(e, t = {}) {
  const r = new lg({
    windowMs: t.windowMs ?? 6e4,
    maxEvents: t.maxEvents ?? 2e3
  }), n = t.maskAllInputs !== !1, i = t.maskText !== !1;
  let o;
  try {
    o = e({
      emit(l) {
        try {
          r.push(l);
        } catch {
        }
      },
      maskAllInputs: n,
      // Mask every text node by default. rrweb calls maskTextFn(text) per node; '*' keeps layout.
      maskTextFn: i ? (l) => "*".repeat(l.length) : void 0,
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
const $c = "klav-sims-live", Dc = "klav-sims-overlay", al = "klav-sims-ext-css";
let ut = null, Ht = null, et = null, gr = null;
const xn = /* @__PURE__ */ new Map(), rt = /* @__PURE__ */ new Map();
let zc = 0, St = !1, Gt = null, kr = null, Gr = !1, We = null, Or = null, Lt = null, Ot = null, dt = null, Yt = null, ct = null, wt = null, pt = null, yr = null;
const Sn = /* @__PURE__ */ new Set();
function ug(e) {
  return String(e || "").trim().toLowerCase().replace(/\s+/g, " ");
}
function Fc(e, t) {
  return `${e}::${ug(t.text)}`;
}
function Uc(e) {
  try {
    document.dispatchEvent(new CustomEvent("klavity:sims-live", { detail: { active: e } }));
  } catch {
  }
}
const dg = `
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
`, pg = `
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
function ll(e, t) {
  const r = e.replace("#", ""), n = (c) => parseInt(c, 16), [i, o, l] = r.length === 3 ? [n(r[0] + r[0]), n(r[1] + r[1]), n(r[2] + r[2])] : [n(r.slice(0, 2)), n(r.slice(2, 4)), n(r.slice(4, 6))];
  return `rgba(${i},${o},${l},${t})`;
}
function hg(e) {
  if (e.suggestedBug) return !0;
  const t = String(e.priority ?? "").trim().toLowerCase();
  if (t && t !== "none") return !0;
  const r = String(e.sentiment ?? "").trim().toLowerCase();
  return r ? !(/* @__PURE__ */ new Set(["positive", "satisfied", "delighted", "neutral", "none"])).has(r) : !1;
}
function fs() {
  var e, t;
  try {
    return ((t = (e = window.matchMedia) == null ? void 0 : e.call(window, "(prefers-reduced-motion: reduce)")) == null ? void 0 : t.matches) ?? !1;
  } catch {
    return !1;
  }
}
function fg(e) {
  return new Promise((t) => setTimeout(t, e));
}
function wr(e) {
  const t = String(e.priority ?? "").trim().toLowerCase();
  return t === "high" || t === "critical" || t === "urgent" ? "HIGH" : t === "medium" || t === "med" ? "MED" : t === "low" ? "LOW" : e.suggestedBug ? "HIGH" : null;
}
const Bc = { HIGH: "h", MED: "m", LOW: "l" }, cl = { HIGH: 0, MED: 1, LOW: 2 };
function mg(e) {
  if (!e) return !1;
  if (e === et || e === ut || e.id === Dc || e.id === $c || e.id === "klavity-widget-host") return !0;
  const t = e.classList;
  return !!t && t.contains("klav-halo");
}
function gg(e) {
  const t = [];
  for (const r of [et, ut])
    r && (t.push({ el: r, vis: r.style.visibility }), r.style.visibility = "hidden");
  try {
    return e();
  } finally {
    for (const { el: r, vis: n } of t) r.style.visibility = n;
  }
}
function qc(e) {
  const t = e.targetViewport;
  return {
    scrollX: Number.isFinite(t == null ? void 0 : t.scrollX) ? Number(t.scrollX) : window.scrollX,
    scrollY: Number.isFinite(t == null ? void 0 : t.scrollY) ? Number(t.scrollY) : window.scrollY,
    width: Math.max(1, Number.isFinite(t == null ? void 0 : t.width) ? Number(t.width) : window.innerWidth),
    height: Math.max(1, Number.isFinite(t == null ? void 0 : t.height) ? Number(t.height) : window.innerHeight)
  };
}
function Wc(e, t) {
  return new DOMRect(
    t.scrollX + e.x * t.width,
    t.scrollY + e.y * t.height,
    Math.max(1, e.w * t.width),
    Math.max(1, e.h * t.height)
  );
}
function ul(e) {
  return Math.max(0, e.width) * Math.max(0, e.height);
}
function yg(e, t) {
  const r = Math.max(e.left, t.left), n = Math.min(e.right, t.right), i = Math.max(e.top, t.top), o = Math.min(e.bottom, t.bottom);
  return Math.max(0, n - r) * Math.max(0, o - i);
}
function bg(e) {
  return new DOMRect(e.left + window.scrollX, e.top + window.scrollY, e.width, e.height);
}
function jc(e) {
  if (!e || !(e instanceof HTMLElement) || e === document.body || e === document.documentElement || mg(e)) return !1;
  const t = e.getBoundingClientRect();
  if (t.width < 8 || t.height < 8) return !1;
  try {
    const r = getComputedStyle(e);
    if (r.display === "none" || r.visibility === "hidden" || Number(r.opacity) === 0) return !1;
  } catch {
  }
  return !0;
}
function vg(e, t) {
  return gg(() => {
    const r = /* @__PURE__ */ new Set(), n = [], i = (l) => {
      let c = l;
      for (; c && c !== document.body && c !== document.documentElement; )
        !r.has(c) && jc(c) && (r.add(c), n.push(c)), c = c.parentElement;
    }, o = typeof document.elementsFromPoint == "function" ? document.elementsFromPoint(e, t) : [document.elementFromPoint(e, t)].filter(Boolean);
    for (const l of o) i(l);
    return n;
  });
}
function kg(e, t) {
  const r = qc(t), n = Wc(e, r), i = Math.max(2, Math.min(window.innerWidth - 2, n.left + n.width / 2 - window.scrollX)), o = Math.max(2, Math.min(window.innerHeight - 2, n.top + n.height / 2 - window.scrollY)), l = vg(i, o);
  if (!l.length) return null;
  const c = Math.max(1, ul(n));
  let a = null, p = -1 / 0;
  for (const s of l) {
    const h = bg(s.getBoundingClientRect()), d = yg(h, n);
    if (d <= 0) continue;
    const u = Math.max(1, ul(h)), m = d / c, f = Math.max(0, (u - d) / u), g = s.tagName.toLowerCase(), x = /^(button|a|input|textarea|select|label|section|article|nav|header|footer|main|form)$/.test(g) ? 0.18 : 0, b = u > window.innerWidth * window.innerHeight * 0.92 ? 0.8 : 0, y = m - f * 0.35 + x - b;
    y > p && (a = s, p = y);
  }
  return a ?? l[0] ?? null;
}
async function wg(e, t) {
  if (e >= window.scrollX + 80 && e <= window.scrollX + window.innerWidth - 80 && t >= window.scrollY + 80 && t <= window.scrollY + window.innerHeight - 80) return;
  const i = Math.max(0, document.documentElement.scrollHeight - window.innerHeight), o = Math.max(0, document.documentElement.scrollWidth - window.innerWidth), l = Math.max(0, Math.min(i, t - window.innerHeight * 0.38)), c = Math.max(0, Math.min(o, e - window.innerWidth * 0.45));
  try {
    window.scrollTo({ top: l, left: c, behavior: fs() ? "auto" : "smooth" });
  } catch {
    window.scrollTo(c, l);
  }
  await fg(fs() ? 80 : 520);
}
const xg = /* @__PURE__ */ new Set([
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
function Sg(e) {
  const t = /* @__PURE__ */ new Set();
  return String(e || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((r) => r.length < 4 || xg.has(r) || t.has(r) ? !1 : (t.add(r), !0));
}
function Cg(e) {
  const t = Sg(e.text);
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
  for (const l of o) {
    if (!jc(l)) continue;
    const c = l.getBoundingClientRect(), a = [
      l.textContent || "",
      l.getAttribute("aria-label") || "",
      l.getAttribute("title") || "",
      l.getAttribute("placeholder") || "",
      l.getAttribute("data-testid") || "",
      l.id || "",
      typeof l.className == "string" ? l.className : ""
    ].join(" ").toLowerCase();
    if (!a.trim()) continue;
    const p = t.reduce((f, g) => f + (a.includes(g) ? 1 : 0), 0);
    if (!p) continue;
    const s = l.tagName.toLowerCase(), h = /^(button|a|input|textarea|select|label|h1|h2|h3|section|article|nav|header|footer|main|form)$/.test(s) ? 0.6 : 0, u = Math.max(1, c.width * c.height) > window.innerWidth * window.innerHeight * 0.85 ? 1.1 : 0, m = p / t.length + h - u;
    m > i && (n = l, i = m);
  }
  return n;
}
async function Eg(e, t = {}) {
  if (e.region) {
    const r = qc(e), n = Wc(e.region, r);
    t.scroll !== !1 && await wg(n.left + n.width / 2, n.top + n.height / 2);
    const i = kg(e.region, e);
    if (i) return i;
  }
  return Cg(e);
}
function Mg() {
  if (ut && Ht) return Ht;
  ut = document.createElement("div"), ut.id = $c, ut.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;", Ht = ut.attachShadow({ mode: "open" }), Nh(Ht);
  const e = document.createElement("style");
  return e.textContent = dg, Ht.appendChild(e), document.body.appendChild(ut), Ht;
}
function Hc() {
  if (et) return et;
  if (!document.getElementById(al)) {
    const e = document.createElement("style");
    e.id = al, e.textContent = pg, document.head.appendChild(e);
  }
  return et = document.createElement("div"), et.id = Dc, et.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;z-index:2147483640;pointer-events:none;overflow:visible;", document.body.appendChild(et), et;
}
function Vc(e, t) {
  return Oh({
    name: e.name,
    initials: e.initials,
    photoUrl: e.photoUrl,
    color: e.accent,
    animate: !1,
    legs: !0,
    size: t
  });
}
function Rg(e, t = [], r = {}) {
  if (typeof document > "u") return;
  gs();
  const n = Mg();
  Hc(), gr = new AbortController();
  const i = e === "all" ? t : t.filter((h) => e.includes(h.id));
  if (!i.length) {
    console.warn("[KlavitySims] deploy(): no matching Sims — panel not mounted."), gs();
    return;
  }
  i.slice(0, 8).forEach((h) => {
    const d = h.accent || "#6366f1", u = h.initials || h.name.slice(0, 2).toUpperCase();
    xn.set(h.id, { simId: h.id, accent: d, initials: u, name: h.name, photoUrl: h.photoUrl });
  });
  const o = document.createElement("div");
  o.className = "ksl-root", n.appendChild(o), pt = document.createElement("div"), pt.className = "ksl-sr", pt.id = "ksl-announcer", pt.setAttribute("aria-live", "polite"), pt.setAttribute("aria-atomic", "true"), o.appendChild(pt), We = document.createElement("button"), We.type = "button", We.className = "ksl-launcher", We.setAttribute("aria-label", "Open Sims feedback panel"), We.addEventListener("click", () => Ag());
  const l = document.createElement("span");
  l.className = "ksl-pill", Or = document.createElement("span"), Or.className = "ksl-pill-avatars", Lt = document.createElement("span"), Lt.className = "ksl-pill-txt", l.append(Or, Lt), Ot = document.createElement("span"), Ot.className = "ksl-pill-badge", Ot.hidden = !0, We.append(l, Ot), o.appendChild(We), i.slice(0, 3).forEach((h) => {
    const d = xn.get(h.id);
    d && Or.appendChild(Vc(d, 26));
  }), dt = document.createElement("section"), dt.className = "ksl-panel", dt.setAttribute("aria-label", "Sims feedback"), dt.setAttribute("role", "dialog");
  const c = document.createElement("div");
  c.className = "ksl-head";
  const a = document.createElement("div");
  a.className = "ksl-title-row";
  const p = document.createElement("div");
  p.className = "ksl-title", p.textContent = "Sims feedback";
  const s = document.createElement("button");
  s.type = "button", s.className = "ksl-icon-btn", s.title = "Minimize", s.setAttribute("aria-label", "Minimize Sims feedback panel"), s.innerHTML = Y("x", { size: 15 }), s.addEventListener("click", () => dl()), a.append(p, s), Yt = document.createElement("div"), Yt.className = "ksl-count", ct = document.createElement("div"), ct.className = "ksl-chips", c.append(a, Yt, ct), wt = document.createElement("div"), wt.className = "ksl-list", wt.setAttribute("role", "list"), dt.append(c, wt), o.appendChild(dt), document.addEventListener("keydown", (h) => {
    h.key === "Escape" && St && dl();
  }, { signal: gr.signal }), Uc(!0), Mr();
}
function Gc(e) {
  Gr = e, We == null || We.classList.toggle("is-reviewing", e), Mr(), St && Er();
}
function Ag() {
  !dt || !We || (St = !0, dt.classList.add("is-open"), We.hidden = !0, Er());
}
function dl() {
  !dt || !We || (St = !1, dt.classList.remove("is-open"), We.hidden = !1, Mr());
}
function Yc() {
  const e = Array.from(rt.values()), t = new Set(e.map((n) => n.entry.simId)), r = e.filter((n) => wr(n.obs) === "HIGH").length;
  return { total: e.length, sims: t.size, high: r };
}
function Mr() {
  const e = Yc();
  Lt && (Gr && e.total === 0 ? Lt.innerHTML = "Your Sims are reviewing…" : e.total === 0 ? Lt.innerHTML = "Sims are watching this page" : Lt.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from your Sims`), Ot && (Ot.hidden = e.high === 0, Ot.textContent = `${e.high} high`), St && Kc(e);
}
function Kc(e) {
  Yt && (e.total === 0 ? Yt.innerHTML = Gr ? "Your Sims are reviewing this page…" : "No findings yet — your Sims are watching." : Yt.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from <b>${e.sims}</b> Sim${e.sims === 1 ? "" : "s"}` + (e.high > 0 ? ` · <span class="ksl-hi">${e.high} high</span>` : "")), Tg();
}
function Tg() {
  if (!ct) return;
  const e = Array.from(rt.values());
  if (ct.hidden = e.length === 0, ct.textContent = "", !e.length) return;
  const t = document.createElement("span");
  t.className = "ksl-chips-label", t.textContent = "Sim", ct.appendChild(t);
  const r = /* @__PURE__ */ new Map();
  e.forEach((i) => {
    const o = r.get(i.entry.simId) ?? { entry: i.entry, n: 0 };
    o.n += 1, r.set(i.entry.simId, o);
  }), r.forEach(({ entry: i, n: o }) => {
    const l = document.createElement("button");
    l.type = "button", l.className = "ksl-chip" + (Gt === i.simId ? " is-on" : ""), l.setAttribute("aria-pressed", String(Gt === i.simId));
    const c = document.createElement("span");
    c.className = "ksl-dot", c.style.background = i.accent, l.append(c, document.createTextNode(`${i.initials} · ${o}`)), l.addEventListener("click", () => {
      Gt = Gt === i.simId ? null : i.simId, Er();
    }), ct.appendChild(l);
  });
  const n = document.createElement("span");
  n.className = "ksl-chips-label", n.style.marginLeft = "6px", n.textContent = "Priority", ct.appendChild(n), ["HIGH", "MED", "LOW"].forEach((i) => {
    const o = e.filter((a) => wr(a.obs) === i).length;
    if (!o) return;
    const l = document.createElement("button");
    l.type = "button";
    const c = kr === i;
    l.className = "ksl-chip" + (c ? ` sev-on-${Bc[i]}` : ""), l.setAttribute("aria-pressed", String(c)), l.textContent = `${i} · ${o}`, l.addEventListener("click", () => {
      kr = kr === i ? null : i, Er();
    }), ct.appendChild(l);
  });
}
function Ig() {
  return Array.from(rt.values()).filter((e) => !Gt || e.entry.simId === Gt).filter((e) => !kr || wr(e.obs) === kr).sort((e, t) => {
    const r = wr(e.obs), n = wr(t.obs), i = r ? cl[r] : 3, o = n ? cl[n] : 3;
    return i - o;
  });
}
function Lg(e) {
  const { entry: t, obs: r } = e, n = wr(r), i = document.createElement("div");
  i.className = "ksl-row", i.setAttribute("role", "listitem"), i.dataset.id = e.id, i.style.borderLeftColor = t.accent;
  const o = document.createElement("div");
  o.className = "ksl-r-head", o.appendChild(Vc(t, 26));
  const l = document.createElement("span");
  l.className = "ksl-r-name", l.style.color = t.accent, l.textContent = t.name, o.appendChild(l);
  const c = String(r.sentiment ?? "").trim();
  if (c) {
    const m = document.createElement("span");
    m.className = "ksl-r-sent", m.textContent = c, o.appendChild(m);
  }
  if (n) {
    const m = document.createElement("span");
    m.className = `ksl-sev ${Bc[n]}`, m.setAttribute("aria-label", `Priority: ${n}`), m.textContent = n, o.appendChild(m);
  }
  i.appendChild(o);
  const a = document.createElement("div");
  a.className = "ksl-r-obs", a.textContent = r.text || "", i.appendChild(a);
  const p = document.createElement("button");
  p.type = "button", p.className = "ksl-r-expand", p.textContent = "Show more", p.addEventListener("click", () => {
    const m = i.classList.toggle("is-expanded");
    p.textContent = m ? "Show less" : "Show more";
  }), i.appendChild(p);
  const s = document.createElement("div");
  s.className = "ksl-r-actions";
  const h = document.createElement("button");
  h.type = "button", h.className = "ksl-r-act track", h.innerHTML = Y("bug", { size: 12 }) + " Track as Bug", h.setAttribute("aria-label", `Track feedback from ${t.name} as a bug`), h.addEventListener("click", () => {
    var m;
    (m = hn.onTriage) == null || m.call(hn, r, t.name), pl(e.id);
  });
  const d = document.createElement("button");
  d.type = "button", d.className = "ksl-r-act jump", d.innerHTML = Y("map-pin", { size: 12 }) + " Jump to on page", d.setAttribute("aria-label", `Jump to where ${t.name} flagged this`), d.addEventListener("click", () => {
    _g(e.id);
  });
  const u = document.createElement("button");
  return u.type = "button", u.className = "ksl-r-act dismiss", u.textContent = "Dismiss", u.setAttribute("aria-label", `Dismiss feedback from ${t.name}`), u.addEventListener("click", () => {
    pl(e.id);
  }), s.append(h, d, u), i.appendChild(s), i;
}
function Og(e) {
  e.querySelectorAll(".ksl-row").forEach((t) => {
    const r = t.querySelector(".ksl-r-obs");
    r && r.scrollHeight - r.clientHeight > 4 && t.classList.add("is-clamped");
  });
}
function Er() {
  if (!wt || !St) {
    Mr();
    return;
  }
  const e = Yc();
  Kc(e);
  const t = Ig();
  if (wt.textContent = "", !t.length) {
    const n = document.createElement("div");
    n.className = "ksl-empty";
    const i = rt.size > 0;
    if (Gr && !i) {
      const o = document.createElement("div");
      o.className = "ksl-empty-title", o.textContent = "Your Sims are reviewing this page…";
      const l = document.createElement("div");
      l.textContent = "Findings will appear here as they spot things.";
      const c = document.createElement("div");
      c.className = "ksl-shimmer", n.append(o, l, c);
    } else if (i)
      n.textContent = "No findings match these filters.";
    else {
      const o = document.createElement("div");
      o.className = "ksl-empty-title", o.textContent = "No findings yet";
      const l = document.createElement("div");
      l.textContent = "Your Sims are watching this page as a first-time customer would.", n.append(o, l);
    }
    wt.appendChild(n), rt.forEach((o) => {
      o.rowEl = null;
    });
    return;
  }
  t.forEach((n) => {
    const i = Lg(n);
    n.rowEl = i, wt.appendChild(i);
  });
  const r = new Set(t.map((n) => n.id));
  rt.forEach((n) => {
    r.has(n.id) || (n.rowEl = null);
  }), Og(wt);
}
function ms() {
  yr == null || yr(), yr = null;
}
async function _g(e) {
  const t = rt.get(e);
  if (!t) return;
  const r = await Eg(t.obs, { scroll: !0 });
  !r || !et || Ng(r, t.entry.accent);
}
function Ng(e, t) {
  ms();
  const r = Hc(), n = document.createElement("div");
  n.className = "klav-halo", n.style.borderColor = t, n.style.boxShadow = `0 0 0 4px ${ll(t, 0.16)},0 0 24px ${ll(t, 0.2)}`, r.appendChild(n);
  const i = new AbortController(), o = () => {
    const p = e.getBoundingClientRect(), s = p.width > 0 && p.height > 0 && p.bottom > 0 && p.right > 0 && p.top < window.innerHeight && p.left < window.innerWidth;
    n.style.display = s ? "" : "none", s && (n.style.left = `${p.left - 5}px`, n.style.top = `${p.top - 5}px`, n.style.width = `${p.width + 10}px`, n.style.height = `${p.height + 10}px`);
  }, l = () => requestAnimationFrame(o);
  o(), window.addEventListener("scroll", l, { passive: !0, signal: i.signal }), window.addEventListener("resize", l, { signal: i.signal });
  const c = setTimeout(() => {
    n.style.opacity = "0", n.style.transition = "opacity .3s ease", setTimeout(() => {
      yr === a && ms();
    }, 320);
  }, 3200), a = () => {
    clearTimeout(c), i.abort(), Le(n);
  };
  yr = a;
}
function Pg(e, t) {
  const r = `f_${e.simId}_${++zc}`;
  rt.set(r, { id: r, entry: e, obs: t, rowEl: null }), St ? Er() : Mr(), pt && (pt.textContent = "", requestAnimationFrame(() => {
    pt && (pt.textContent = `${e.name}: ${t.text || ""}`);
  }));
}
function $g(e) {
  const t = rt.get(e);
  if (!t) return;
  const r = () => {
    rt.delete(e), St ? Er() : Mr();
  };
  t.rowEl && St ? (t.rowEl.classList.add("is-removing"), setTimeout(r, fs() ? 0 : 300)) : r();
}
function pl(e) {
  const t = rt.get(e);
  t && (Sn.add(Fc(t.entry.simId, t.obs)), $g(e));
}
function Dg(e, t, r) {
  if (!ut) return;
  const n = xn.get(e);
  if (!n) {
    console.warn(`[KlavitySims] renderFeedback: simId "${e}" not registered`);
    return;
  }
  if (r.length) {
    Gc(!1);
    for (const i of r) {
      if (!hg(i)) continue;
      const o = Fc(e, i);
      Sn.has(o) || (Sn.add(o), Pg(n, i));
    }
  }
}
function gs() {
  ms(), rt.clear(), zc = 0, xn.clear(), Sn.clear(), St = !1, Gt = null, kr = null, Gr = !1, gr == null || gr.abort(), gr = null, We = null, Or = null, Lt = null, Ot = null, dt = null, Yt = null, ct = null, wt = null, pt = null, Le(et), et = null, Le(ut), ut = null, Ht = null, Uc(!1);
}
const hn = {
  deploy: Rg,
  setReviewing: Gc,
  renderFeedback: Dg,
  undeploy: gs,
  onTriage: null
};
function zg() {
  typeof window > "u" || window.KlavitySims || (window.KlavitySims = hn);
}
typeof window < "u" && zg();
const hl = "klav-ao-css", Fg = "klav-ao-overlay";
function Ug(e, t, r, n, i, o = 10) {
  const a = !(e.y - r - 14 >= o), p = a ? e.y + e.h + 14 : e.y - r - 14, s = Math.max(o, Math.min(p, i - r - o));
  return { left: Math.max(o, Math.min(e.x, n - t - o)), top: s, below: a };
}
const Bg = `
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
let jt = null, qg = 1;
const Cn = /* @__PURE__ */ new Map();
function fl(e, t) {
  const r = e.replace("#", ""), n = (c) => parseInt(c, 16), [i, o, l] = r.length === 3 ? [n(r[0] + r[0]), n(r[1] + r[1]), n(r[2] + r[2])] : [n(r.slice(0, 2)), n(r.slice(2, 4)), n(r.slice(4, 6))];
  return `rgba(${i},${o},${l},${t})`;
}
function Wg() {
  if (jt) return jt;
  if (!document.getElementById(hl)) {
    const e = document.createElement("style");
    e.id = hl, e.textContent = Bg, document.head.appendChild(e);
  }
  return jt = document.createElement("div"), jt.id = Fg, jt.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;pointer-events:none;overflow:visible;z-index:2147483640;", document.body.appendChild(jt), jt;
}
function Zg(e, t, r = {}) {
  const n = Wg(), i = r.color ?? "#6366f1", o = `klav-ao-${qg++}`, l = 5, c = document.createElement("div");
  c.className = "klav-ao-halo", c.dataset.aoId = o, c.style.left = e.x - l + "px", c.style.top = e.y - l + "px", c.style.width = e.w + l * 2 + "px", c.style.height = e.h + l * 2 + "px", c.style.borderColor = i, c.style.boxShadow = `0 0 0 4px ${fl(i, 0.14)},0 0 24px ${fl(i, 0.18)}`, n.appendChild(c);
  let a = null;
  if (t) {
    const h = { x: e.x - l, y: e.y - l, w: e.w + l * 2, h: e.h + l * 2 }, { left: d, top: u, below: m } = Ug(
      h,
      224,
      96,
      window.innerWidth,
      window.innerHeight
    );
    a = document.createElement("div"), a.className = "klav-ao-pin" + (m ? " tail-top" : ""), a.dataset.aoId = o, a.style.borderLeftColor = i, a.style.left = d + "px", a.style.top = u + "px", a.setAttribute("role", "status"), a.setAttribute("aria-label", `Annotation: ${t}`);
    const f = document.createElement("div");
    f.className = "klav-ao-hd";
    const g = document.createElement("span");
    g.className = "klav-ao-lbl", g.style.color = i, g.textContent = t, f.appendChild(g);
    const x = r.priority ?? r.severity;
    if (x) {
      const y = x === "medium" ? " sev-m" : x === "low" ? " sev-l" : "", C = document.createElement("span");
      C.className = `klav-ao-sev${y}`, C.textContent = x, f.appendChild(C);
    }
    const b = document.createElement("button");
    b.className = "klav-ao-dismiss", b.textContent = "Dismiss", b.addEventListener("click", () => Xc(o)), a.appendChild(f), a.appendChild(b), n.appendChild(a);
  }
  return Cn.set(o, { halo: c, pin: a }), o;
}
function Xc(e) {
  const t = Cn.get(e);
  if (!t) return;
  Cn.delete(e);
  const { halo: r, pin: n } = t;
  n ? (n.classList.add("is-out"), r.style.animation = "klav-ao-pin-out .22s ease-in forwards", setTimeout(() => {
    Le(n), Le(r);
  }, 240)) : Le(r);
}
function Qg() {
  for (const e of [...Cn.keys()]) Xc(e);
}
let Jc = ur;
const Zc = { consoleErrors: [], networkFailures: [] };
let Qc, eu, xr = null;
function tu(e) {
  const t = {};
  for (const [r, n] of Object.entries(e))
    n != null && (t[String(r).slice(0, 64)] = String(n).slice(0, 1e3));
  return t;
}
async function ml() {
  return Ip(document.body, {
    filter: (e) => e.id !== "klavity-sdk-host"
  });
}
function jg() {
  return Up(Zc, { identity: Qc, metadata: eu });
}
async function Hg(e) {
  return Np(
    { type: e.type, description: e.description, context: e.context, screenshots: e.screenshots, replayEvents: e.replayEvents },
    Jc,
    { jira: $h, linear: Dh, github: zh, plane: Fh, backend: Bh }
  );
}
function Fs(e = "bug") {
  const t = Eh(e, {
    onCaptureFull: ml,
    onSubmit: async (r) => Hg({
      type: r.type,
      description: r.description,
      context: jg(),
      screenshots: r.screenshots,
      replayEvents: (xr == null ? void 0 : xr.getEvents()) ?? []
    })
  });
  setTimeout(async () => {
    try {
      const r = await ml();
      t.addScreenshot(r);
    } catch {
    }
  }, 200);
}
function Vg() {
  Bp(Zc, { consoleLevels: !0 });
}
function ru(e) {
  Qc = e ? tu(e) : void 0;
}
function nu(e) {
  eu = e ? tu(e) : void 0;
}
function Gg() {
  document.addEventListener("contextmenu", (e) => {
    if (hh(e.target)) return;
    e.preventDefault();
    const t = document.createElement("div");
    t.style.cssText = `position:fixed;left:${Math.min(e.clientX, window.innerWidth - 200)}px;top:${Math.min(e.clientY, window.innerHeight - 80)}px;background:#1e1e2e;border:1px solid #45475a;border-radius:8px;padding:4px;z-index:2147483647;box-shadow:0 8px 24px rgba(0,0,0,.4);font-family:system-ui;`, t.innerHTML = `
      <div data-action="bug" style="padding:8px 16px;cursor:pointer;color:#cdd6f4;font-size:13px;border-radius:4px;">${Y("bug")} Report a Bug</div>
      <div data-action="feature" style="padding:8px 16px;cursor:pointer;color:#cdd6f4;font-size:13px;border-radius:4px;">${Y("lightbulb")} Request a Feature</div>
    `, document.body.appendChild(t);
    const r = (n) => {
      (!n || !t.contains(n.target)) && (Le(t), document.removeEventListener("click", r));
    };
    t.addEventListener("click", (n) => {
      var o;
      const i = (o = n.target.closest("[data-action]")) == null ? void 0 : o.getAttribute("data-action");
      Le(t), document.removeEventListener("click", r), i && Fs(i);
    }), setTimeout(() => document.addEventListener("click", r), 0);
  });
}
function iu(e = {}) {
  if (Jc = {
    ...ur,
    ...e,
    jira: { ...ur.jira, ...e.jira },
    linear: { ...ur.linear, ...e.linear },
    github: { ...ur.github, ...e.github },
    plane: { ...ur.plane, ...e.plane }
  }, Vg(), Gg(), !xr)
    try {
      xr = cg(Nt);
    } catch {
      xr = null;
    }
}
typeof window < "u" && (window.KlavitySnap = { init: iu, openModal: Fs, identify: ru, setMetadata: nu });
const ey = { init: iu, openModal: Fs, identify: ru, setMetadata: nu };
export {
  hn as KlavitySims,
  hn as SimsLive,
  Xc as clearAnnotation,
  Qg as clearAnnotations,
  ey as default,
  ru as identify,
  iu as init,
  zg as installKlavitySims,
  Fs as openModal,
  nu as setMetadata,
  Zg as showAnnotation
};
