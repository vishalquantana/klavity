var Lu = Object.defineProperty;
var Iu = (e, t, r) => t in e ? Lu(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var Xr = (e, t, r) => Iu(e, typeof t != "symbol" ? t + "" : t, r);
function Ou(e, t) {
  return e[13] = 1, e[14] = t >> 8, e[15] = t & 255, e[16] = t >> 8, e[17] = t & 255, e;
}
const xl = 112, Sl = 72, Cl = 89, El = 115;
let Zn;
function _u() {
  const e = new Int32Array(256);
  for (let t = 0; t < 256; t++) {
    let r = t;
    for (let n = 0; n < 8; n++)
      r = r & 1 ? 3988292384 ^ r >>> 1 : r >>> 1;
    e[t] = r;
  }
  return e;
}
function Nu(e) {
  let t = -1;
  Zn || (Zn = _u());
  for (let r = 0; r < e.length; r++)
    t = Zn[(t ^ e[r]) & 255] ^ t >>> 8;
  return t ^ -1;
}
function Pu(e) {
  const t = e.length - 1;
  for (let r = t; r >= 4; r--)
    if (e[r - 4] === 9 && e[r - 3] === xl && e[r - 2] === Sl && e[r - 1] === Cl && e[r] === El)
      return r - 3;
  return 0;
}
function $u(e, t, r = !1) {
  const n = new Uint8Array(13);
  t *= 39.3701, n[0] = xl, n[1] = Sl, n[2] = Cl, n[3] = El, n[4] = t >>> 24, n[5] = t >>> 16, n[6] = t >>> 8, n[7] = t & 255, n[8] = n[4], n[9] = n[5], n[10] = n[6], n[11] = n[7], n[12] = 1;
  const i = Nu(n), o = new Uint8Array(4);
  if (o[0] = i >>> 24, o[1] = i >>> 16, o[2] = i >>> 8, o[3] = i & 255, r) {
    const l = Pu(e);
    return e.set(n, l), e.set(o, l + 13), e;
  } else {
    const l = new Uint8Array(4);
    l[0] = 0, l[1] = 0, l[2] = 0, l[3] = 9;
    const c = new Uint8Array(54);
    return c.set(e, 0), c.set(l, 33), c.set(n, 37), c.set(o, 50), c;
  }
}
const Du = "AAlwSFlz", zu = "AAAJcEhZ", Fu = "AAAACXBI";
function Uu(e) {
  let t = e.indexOf(Du);
  return t === -1 && (t = e.indexOf(zu)), t === -1 && (t = e.indexOf(Fu)), t;
}
const Ml = "[modern-screenshot]", Nt = typeof window < "u", Bu = Nt && "Worker" in window, qu = Nt && "atob" in window, Wu = Nt && "btoa" in window;
var wl;
const ks = Nt ? (wl = window.navigator) == null ? void 0 : wl.userAgent : "", Rl = ks.includes("Chrome"), gn = ks.includes("AppleWebKit") && !Rl, ws = ks.includes("Firefox"), ju = (e) => e && "__CONTEXT__" in e, Hu = (e) => e.constructor.name === "CSSFontFaceRule", Vu = (e) => e.constructor.name === "CSSImportRule", Gu = (e) => e.constructor.name === "CSSLayerBlockRule", xt = (e) => e.nodeType === 1, jr = (e) => typeof e.className == "object", Al = (e) => e.tagName === "image", Yu = (e) => e.tagName === "use", zr = (e) => xt(e) && typeof e.style < "u" && !jr(e), Ku = (e) => e.nodeType === 8, Xu = (e) => e.nodeType === 3, xr = (e) => e.tagName === "IMG", Rn = (e) => e.tagName === "VIDEO", Ju = (e) => e.tagName === "CANVAS", Zu = (e) => e.tagName === "TEXTAREA", Qu = (e) => e.tagName === "INPUT", ed = (e) => e.tagName === "STYLE", td = (e) => e.tagName === "SCRIPT", rd = (e) => e.tagName === "SELECT", nd = (e) => e.tagName === "SLOT", id = (e) => e.tagName === "IFRAME", sd = (...e) => console.warn(Ml, ...e);
function od(e) {
  var r;
  const t = (r = e == null ? void 0 : e.createElement) == null ? void 0 : r.call(e, "canvas");
  return t && (t.height = t.width = 1), !!t && "toDataURL" in t && !!t.toDataURL("image/webp").includes("image/webp");
}
const ds = (e) => e.startsWith("data:");
function Tl(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (Nt && e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i) || !Nt)
    return e;
  const r = An().implementation.createHTMLDocument(), n = r.createElement("base"), i = r.createElement("a");
  return r.head.appendChild(n), r.body.appendChild(i), t && (n.href = t), i.href = e, i.href;
}
function An(e) {
  return (e && xt(e) ? e == null ? void 0 : e.ownerDocument : e) ?? window.document;
}
const Tn = "http://www.w3.org/2000/svg";
function ad(e, t, r) {
  const n = An(r).createElementNS(Tn, "svg");
  return n.setAttributeNS(null, "width", e.toString()), n.setAttributeNS(null, "height", t.toString()), n.setAttributeNS(null, "viewBox", `0 0 ${e} ${t}`), n;
}
function ld(e, t) {
  let r = new XMLSerializer().serializeToString(e);
  return t && (r = r.replace(/[\u0000-\u0008\v\f\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/gu, "")), `data:image/svg+xml;charset=utf-8,${encodeURIComponent(r)}`;
}
function cd(e, t) {
  return new Promise((r, n) => {
    const i = new FileReader();
    i.onload = () => r(i.result), i.onerror = () => n(i.error), i.onabort = () => n(new Error(`Failed read blob to ${t}`)), i.readAsDataURL(e);
  });
}
const ud = (e) => cd(e, "dataUrl");
function br(e, t) {
  const r = An(t).createElement("img");
  return r.decoding = "sync", r.loading = "eager", r.src = e, r;
}
function Fr(e, t) {
  return new Promise((r) => {
    const { timeout: n, ownerDocument: i, onError: o, onWarn: l } = t ?? {}, c = typeof e == "string" ? br(e, An(i)) : e;
    let a = null, p = null;
    function s() {
      r(c), a && clearTimeout(a), p == null || p();
    }
    if (n && (a = setTimeout(s, n)), Rn(c)) {
      const h = c.currentSrc || c.src;
      if (!h)
        return c.poster ? Fr(c.poster, t).then(r) : s();
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
      const h = Al(c) ? c.href.baseVal : c.currentSrc || c.src;
      if (!h)
        return s();
      const d = async () => {
        if (xr(c) && "decode" in c)
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
      if (xr(c) && c.complete)
        return d();
      p = () => {
        c.removeEventListener("load", d), c.removeEventListener("error", u);
      }, c.addEventListener("load", d, { once: !0 }), c.addEventListener("error", u, { once: !0 });
    }
  });
}
async function dd(e, t) {
  zr(e) && (xr(e) || Rn(e) ? await Fr(e, t) : await Promise.all(
    ["img", "video"].flatMap((r) => Array.from(e.querySelectorAll(r)).map((n) => Fr(n, t)))
  ));
}
const Ll = /* @__PURE__ */ (function() {
  let t = 0;
  const r = () => `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4);
  return () => (t += 1, `u${r()}${t}`);
})();
function Il(e) {
  return e == null ? void 0 : e.split(",").map((t) => t.trim().replace(/"|'/g, "").toLowerCase()).filter(Boolean);
}
let vo = 0;
function pd(e) {
  const t = `${Ml}[#${vo}]`;
  return vo++, {
    // eslint-disable-next-line no-console
    time: (r) => e && console.time(`${t} ${r}`),
    // eslint-disable-next-line no-console
    timeEnd: (r) => e && console.timeEnd(`${t} ${r}`),
    warn: (...r) => e && sd(...r)
  };
}
function hd(e) {
  return {
    cache: e ? "no-cache" : "force-cache"
  };
}
async function Ln(e, t) {
  return ju(e) ? e : fd(e, { ...t, autoDestruct: !0 });
}
async function fd(e, t) {
  var u, m;
  const { scale: r = 1, workerUrl: n, workerNumber: i = 1 } = t || {}, o = !!(t != null && t.debug), l = (t == null ? void 0 : t.features) ?? !0, c = e.ownerDocument ?? (Nt ? window.document : void 0), a = ((u = e.ownerDocument) == null ? void 0 : u.defaultView) ?? (Nt ? window : void 0), p = /* @__PURE__ */ new Map(), s = {
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
      requestInit: hd((m = t == null ? void 0 : t.fetch) == null ? void 0 : m.bypassingCache),
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
    log: pd(o),
    node: e,
    ownerDocument: c,
    ownerWindow: a,
    dpi: r === 1 ? null : 96 * r,
    svgStyleElement: Ol(c),
    svgDefsElement: c == null ? void 0 : c.createElementNS(Tn, "defs"),
    svgStyles: /* @__PURE__ */ new Map(),
    defaultComputedStyles: /* @__PURE__ */ new Map(),
    workers: [
      ...Array.from({
        length: Bu && n && i ? i : 0
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
      od(c) && "image/webp",
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
  s.log.time("wait until load"), await dd(e, { timeout: s.timeout, onWarn: s.log.warn }), s.log.timeEnd("wait until load");
  const { width: h, height: d } = md(e, s);
  return s.width = h, s.height = d, s;
}
function Ol(e) {
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
function md(e, t) {
  let { width: r, height: n } = t;
  if (xt(e) && (!r || !n)) {
    const i = e.getBoundingClientRect();
    r = r || i.width || Number(e.getAttribute("width")) || 0, n = n || i.height || Number(e.getAttribute("height")) || 0;
  }
  return { width: r, height: n };
}
async function gd(e, t) {
  const {
    log: r,
    timeout: n,
    drawImageCount: i,
    drawImageInterval: o
  } = t;
  r.time("image to canvas");
  const l = await Fr(e, { timeout: n, onWarn: t.log.warn }), { canvas: c, context2d: a } = yd(e.ownerDocument, t), p = () => {
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
function yd(e, t) {
  const { width: r, height: n, scale: i, backgroundColor: o, maximumCanvasSize: l } = t, c = e.createElement("canvas");
  c.width = Math.floor(r * i), c.height = Math.floor(n * i), c.style.width = `${r}px`, c.style.height = `${n}px`, l && (c.width > l || c.height > l) && (c.width > l && c.height > l ? c.width > c.height ? (c.height *= l / c.width, c.width = l) : (c.width *= l / c.height, c.height = l) : c.width > l ? (c.height *= l / c.width, c.width = l) : (c.width *= l / c.height, c.height = l));
  const a = c.getContext("2d");
  return a && o && (a.fillStyle = o, a.fillRect(0, 0, c.width, c.height)), { canvas: c, context2d: a };
}
function _l(e, t) {
  if (e.ownerDocument)
    try {
      const o = e.toDataURL();
      if (o !== "data:,")
        return br(o, e.ownerDocument);
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
function bd(e, t) {
  var r;
  try {
    if ((r = e == null ? void 0 : e.contentDocument) != null && r.documentElement)
      return xs(e.contentDocument.documentElement, t);
  } catch (n) {
    t.log.warn("Failed to clone iframe", n);
  }
  return e.cloneNode(!1);
}
function vd(e) {
  const t = e.cloneNode(!1);
  return e.currentSrc && e.currentSrc !== e.src && (t.src = e.currentSrc, t.srcset = ""), t.loading === "lazy" && (t.loading = "eager"), t;
}
async function kd(e, t) {
  if (e.ownerDocument && !e.currentSrc && e.poster)
    return br(e.poster, e.ownerDocument);
  const r = e.cloneNode(!1);
  r.crossOrigin = "anonymous", e.currentSrc && e.currentSrc !== e.src && (r.src = e.currentSrc);
  const n = r.ownerDocument;
  if (n) {
    let i = !0;
    if (await Fr(r, { onError: () => i = !1, onWarn: t.log.warn }), !i)
      return e.poster ? br(e.poster, e.ownerDocument) : r;
    r.currentTime = e.currentTime, await new Promise((l) => {
      r.addEventListener("seeked", l, { once: !0 });
    });
    const o = n.createElement("canvas");
    o.width = e.offsetWidth, o.height = e.offsetHeight;
    try {
      const l = o.getContext("2d");
      l && l.drawImage(r, 0, 0, o.width, o.height);
    } catch (l) {
      return t.log.warn("Failed to clone video", l), e.poster ? br(e.poster, e.ownerDocument) : r;
    }
    return _l(o, t);
  }
  return r;
}
function wd(e, t) {
  return Ju(e) ? _l(e, t) : id(e) ? bd(e, t) : xr(e) ? vd(e) : Rn(e) ? kd(e, t) : e.cloneNode(!1);
}
function xd(e) {
  let t = e.sandbox;
  if (!t) {
    const { ownerDocument: r } = e;
    try {
      r && (t = r.createElement("iframe"), t.id = `__SANDBOX__${Ll()}`, t.width = "0", t.height = "0", t.style.visibility = "hidden", t.style.position = "fixed", r.body.appendChild(t), t.srcdoc = '<!DOCTYPE html><meta charset="UTF-8"><title></title><body>', e.sandbox = t);
    } catch (n) {
      e.log.warn("Failed to getSandBox", n);
    }
  }
  return t;
}
const Sd = [
  "width",
  "height",
  "-webkit-text-fill-color"
], Cd = [
  "stroke",
  "fill"
];
function Nl(e, t, r) {
  const { defaultComputedStyles: n } = r, i = e.nodeName.toLowerCase(), o = jr(e) && i !== "svg", l = o ? Cd.map((f) => [f, e.getAttribute(f)]).filter(([, f]) => f !== null) : [], c = [
    o && "svg",
    i,
    l.map((f, g) => `${f}=${g}`).join(","),
    t
  ].filter(Boolean).join(":");
  if (n.has(c))
    return n.get(c);
  const a = xd(r), p = a == null ? void 0 : a.contentWindow;
  if (!p)
    return /* @__PURE__ */ new Map();
  const s = p == null ? void 0 : p.document;
  let h, d;
  o ? (h = s.createElementNS(Tn, "svg"), d = h.ownerDocument.createElementNS(h.namespaceURI, i), l.forEach(([f, g]) => {
    d.setAttributeNS(null, f, g);
  }), h.appendChild(d)) : h = d = s.createElement(i), d.textContent = " ", s.body.appendChild(h);
  const u = p.getComputedStyle(d, t), m = /* @__PURE__ */ new Map();
  for (let f = u.length, g = 0; g < f; g++) {
    const x = u.item(g);
    Sd.includes(x) || m.set(x, u.getPropertyValue(x));
  }
  return s.body.removeChild(h), n.set(c, m), m;
}
function Pl(e, t, r) {
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
function Ed(e, t, r, n) {
  var h, d, u, m;
  const { ownerWindow: i, includeStyleProperties: o, currentParentNodeStyle: l } = n, c = t.style, a = i.getComputedStyle(e), p = Nl(e, null, n);
  l == null || l.forEach((f, g) => {
    p.delete(g);
  });
  const s = Pl(a, p, o);
  s.delete("transition-property"), s.delete("all"), s.delete("d"), s.delete("content"), r && (s.delete("position"), s.delete("margin-top"), s.delete("margin-right"), s.delete("margin-bottom"), s.delete("margin-left"), s.delete("margin-block-start"), s.delete("margin-block-end"), s.delete("margin-inline-start"), s.delete("margin-inline-end"), s.set("box-sizing", ["border-box", ""])), ((h = s.get("background-clip")) == null ? void 0 : h[0]) === "text" && t.classList.add("______background-clip--text"), Rl && (s.has("font-kerning") || s.set("font-kerning", ["normal", ""]), (((d = s.get("overflow-x")) == null ? void 0 : d[0]) === "hidden" || ((u = s.get("overflow-y")) == null ? void 0 : u[0]) === "hidden") && ((m = s.get("text-overflow")) == null ? void 0 : m[0]) === "ellipsis" && e.scrollWidth === e.clientWidth && s.set("text-overflow", ["clip", ""]));
  for (let f = c.length, g = 0; g < f; g++)
    c.removeProperty(c.item(g));
  return s.forEach(([f, g], x) => {
    c.setProperty(x, f, g);
  }), s;
}
function Md(e, t) {
  (Zu(e) || Qu(e) || rd(e)) && t.setAttribute("value", e.value);
}
const Rd = [
  "::before",
  "::after"
  // '::placeholder', TODO
], Ad = [
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
function Td(e, t, r, n, i) {
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
    const u = [Ll()], m = Nl(e, s, n);
    a == null || a.forEach((C, w) => {
      m.delete(w);
    });
    const f = Pl(h, m, n.includeStyleProperties);
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
  Rd.forEach(p), r && Ad.forEach(p);
}
const ko = /* @__PURE__ */ new Set([
  "symbol"
  // test/fixtures/svg.symbol.html
]);
async function wo(e, t, r, n, i) {
  if (xt(r) && (ed(r) || td(r)) || n.filter && !n.filter(r))
    return;
  ko.has(t.nodeName) || ko.has(r.nodeName) ? n.currentParentNodeStyle = void 0 : n.currentParentNodeStyle = n.currentNodeStyle;
  const o = await xs(r, n, !1, i);
  n.isEnable("restoreScrollPosition") && Ld(e, o), t.appendChild(o);
}
async function xo(e, t, r, n) {
  var o;
  let i = e.firstChild;
  xt(e) && e.shadowRoot && (i = (o = e.shadowRoot) == null ? void 0 : o.firstChild, r.shadowRoots.push(e.shadowRoot));
  for (let l = i; l; l = l.nextSibling)
    if (!Ku(l))
      if (xt(l) && nd(l) && typeof l.assignedNodes == "function") {
        const c = l.assignedNodes();
        for (let a = 0; a < c.length; a++)
          await wo(e, t, c[a], r, n);
      } else
        await wo(e, t, l, r, n);
}
function Ld(e, t) {
  if (!zr(e) || !zr(t))
    return;
  const { scrollTop: r, scrollLeft: n } = e;
  if (!r && !n)
    return;
  const { transform: i } = t.style, o = new DOMMatrix(i), { a: l, b: c, c: a, d: p } = o;
  o.a = 1, o.b = 0, o.c = 0, o.d = 1, o.translateSelf(-n, -r), o.a = l, o.b = c, o.c = a, o.d = p, t.style.transform = o.toString();
}
function Id(e, t) {
  const { backgroundColor: r, width: n, height: i, style: o } = t, l = e.style;
  if (r && l.setProperty("background-color", r, "important"), n && l.setProperty("width", `${n}px`, "important"), i && l.setProperty("height", `${i}px`, "important"), o)
    for (const c in o) l[c] = o[c];
}
const Od = /^[\w-:]+$/;
async function xs(e, t, r = !1, n) {
  var p, s, h, d;
  const { ownerDocument: i, ownerWindow: o, fontFamilies: l, onCloneEachNode: c } = t;
  if (i && Xu(e))
    return n && /\S/.test(e.data) && n(e.data), i.createTextNode(e.data);
  if (i && o && xt(e) && (zr(e) || jr(e))) {
    const u = await wd(e, t);
    if (t.isEnable("removeAbnormalAttributes")) {
      const y = u.getAttributeNames();
      for (let C = y.length, w = 0; w < C; w++) {
        const k = y[w];
        Od.test(k) || u.removeAttribute(k);
      }
    }
    const m = t.currentNodeStyle = Ed(e, u, r, t);
    r && Id(u, t);
    let f = !1;
    if (t.isEnable("copyScrollbar")) {
      const y = [
        (p = m.get("overflow-x")) == null ? void 0 : p[0],
        (s = m.get("overflow-y")) == null ? void 0 : s[0]
      ];
      f = y.includes("scroll") || (y.includes("auto") || y.includes("overlay")) && (e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth);
    }
    const g = (h = m.get("text-transform")) == null ? void 0 : h[0], x = Il((d = m.get("font-family")) == null ? void 0 : d[0]), b = x ? (y) => {
      g === "uppercase" ? y = y.toUpperCase() : g === "lowercase" ? y = y.toLowerCase() : g === "capitalize" && (y = y[0].toUpperCase() + y.substring(1)), x.forEach((C) => {
        let w = l.get(C);
        w || l.set(C, w = /* @__PURE__ */ new Set()), y.split("").forEach((k) => w.add(k));
      });
    } : void 0;
    return Td(
      e,
      u,
      f,
      t,
      b
    ), Md(e, u), Rn(e) || await xo(
      e,
      u,
      t,
      b
    ), await (c == null ? void 0 : c(u)), u;
  }
  const a = e.cloneNode(!1);
  return await xo(e, a, t), await (c == null ? void 0 : c(a)), a;
}
function _d(e) {
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
function Nd(e) {
  const { url: t, timeout: r, responseType: n, ...i } = e, o = new AbortController(), l = r ? setTimeout(() => o.abort(), r) : void 0;
  return fetch(t, { signal: o.signal, ...i }).then((c) => {
    if (!c.ok)
      throw new Error("Failed fetch, not 2xx response", { cause: c });
    switch (n) {
      case "arrayBuffer":
        return c.arrayBuffer();
      case "dataUrl":
        return c.blob().then(ud);
      case "text":
      default:
        return c.text();
    }
  }).finally(() => clearTimeout(l));
}
function Ur(e, t) {
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
  n === "image" && (gn || ws) && e.drawImageCount++;
  let x = p.get(r);
  if (!x) {
    d && d instanceof RegExp && d.test(l) && (l += (/\?/.test(l) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
    const b = n.startsWith("font") && m && m.minify, y = /* @__PURE__ */ new Set();
    b && n.split(";")[1].split(",").forEach((S) => {
      g.has(S) && g.get(S).forEach((I) => y.add(I));
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
      return !gn && r.startsWith("http") && f.length ? new Promise((k, S) => {
        f[p.size & f.length - 1].postMessage({ rawUrl: r, ...w }), x.resolve = k, x.reject = S;
      }) : Nd(w);
    })().catch((k) => {
      if (p.delete(r), n === "image" && u)
        return e.log.warn("Failed to fetch image base64, trying to use placeholder image", l), typeof u == "string" ? u : u(o);
      throw k;
    }), p.set(r, x);
  }
  return x.response;
}
async function $l(e, t, r, n) {
  if (!Dl(e))
    return e;
  for (const [i, o] of Pd(e, t))
    try {
      const l = await Ur(
        r,
        {
          url: o,
          requestType: n ? "image" : "text",
          responseType: "dataUrl"
        }
      );
      e = e.replace($d(i), `$1${l}$3`);
    } catch (l) {
      r.log.warn("Failed to fetch css data url", i, l);
    }
  return e;
}
function Dl(e) {
  return /url\((['"]?)([^'"]+?)\1\)/.test(e);
}
const zl = /url\((['"]?)([^'"]+?)\1\)/g;
function Pd(e, t) {
  const r = [];
  return e.replace(zl, (n, i, o) => (r.push([o, Tl(o, t)]), n)), r.filter(([n]) => !ds(n));
}
function $d(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
const Dd = [
  "background-image",
  "border-image-source",
  "-webkit-border-image",
  "-webkit-mask-image",
  "list-style-image"
];
function zd(e, t) {
  return Dd.map((r) => {
    const n = e.getPropertyValue(r);
    return !n || n === "none" ? null : ((gn || ws) && t.drawImageCount++, $l(n, null, t, !0).then((i) => {
      !i || n === i || e.setProperty(
        r,
        i,
        e.getPropertyPriority(r)
      );
    }));
  }).filter(Boolean);
}
function Fd(e, t) {
  if (xr(e)) {
    const r = e.currentSrc || e.src;
    if (!ds(r))
      return [
        Ur(t, {
          url: r,
          imageDom: e,
          requestType: "image",
          responseType: "dataUrl"
        }).then((n) => {
          n && (e.srcset = "", e.dataset.originalSrc = r, e.src = n || "");
        })
      ];
    (gn || ws) && t.drawImageCount++;
  } else if (jr(e) && !ds(e.href.baseVal)) {
    const r = e.href.baseVal;
    return [
      Ur(t, {
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
function Ud(e, t) {
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
        Ur(t, {
          url: o,
          responseType: "text"
        }).then((p) => {
          n == null || n.insertAdjacentHTML("beforeend", p);
        })
      ];
  }
  return [];
}
function Fl(e, t) {
  const { tasks: r } = t;
  xt(e) && ((xr(e) || Al(e)) && r.push(...Fd(e, t)), Yu(e) && r.push(...Ud(e, t))), zr(e) && r.push(...zd(e.style, t)), e.childNodes.forEach((n) => {
    Fl(n, t);
  });
}
async function Bd(e, t) {
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
      const a = Co(c.cssText, t);
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
          if (Vu(m)) {
            const f = m.href;
            let g = "";
            try {
              g = await Ur(t, {
                url: f,
                requestType: "text",
                responseType: "text"
              });
            } catch (b) {
              t.log.warn(`Error fetch remote css import from ${f}`, b);
            }
            const x = g.replace(
              zl,
              (b, y, C) => b.replace(C, Tl(C, f))
            );
            for (const b of Wd(x))
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
        ps(u.cssRules, d);
      }), d.filter((u) => {
        var m;
        return Hu(u) && Dl(u.style.getPropertyValue("src")) && ((m = Il(u.style.getPropertyValue("font-family"))) == null ? void 0 : m.some((f) => i.has(f)));
      }).forEach((u) => {
        const m = u, f = o.get(m.cssText);
        f ? n.appendChild(r.createTextNode(`${f}
`)) : l.push(
          $l(
            m.cssText,
            m.parentStyleSheet ? m.parentStyleSheet.href : null,
            t
          ).then((g) => {
            g = Co(g, t), o.set(m.cssText, g), n.appendChild(r.createTextNode(`${g}
`));
          })
        );
      });
    }
}
const qd = /(\/\*[\s\S]*?\*\/)/g, So = /((@.*?keyframes [\s\S]*?){([\s\S]*?}\s*?)})/gi;
function Wd(e) {
  if (e == null)
    return [];
  const t = [];
  let r = e.replace(qd, "");
  for (; ; ) {
    const o = So.exec(r);
    if (!o)
      break;
    t.push(o[0]);
  }
  r = r.replace(So, "");
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
const jd = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, Hd = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function Co(e, t) {
  const { font: r } = t, n = r ? r == null ? void 0 : r.preferredFormat : void 0;
  return n ? e.replace(Hd, (i) => {
    for (; ; ) {
      const [o, , l] = jd.exec(i) || [];
      if (!l)
        return "";
      if (l === n)
        return `src: ${o};`;
    }
  }) : e;
}
function ps(e, t = []) {
  for (const r of Array.from(e))
    Gu(r) ? t.push(...ps(r.cssRules)) : "cssRules" in r ? ps(r.cssRules, t) : t.push(r);
  return t;
}
const Vd = /\bx?link:?href\s*=\s*["'](?!data:)[^"']+["']/i;
function Gd(e) {
  return Vd.test(e.innerHTML);
}
async function Yd(e, t) {
  const r = await Ln(e, t);
  if (xt(r.node) && jr(r.node) && !Gd(r.node))
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
  const f = await xs(r.node, r, !0);
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
  i.timeEnd("clone node"), await (d == null ? void 0 : d(f)), p !== !1 && xt(f) && (i.time("embed web font"), await Bd(f, r), i.timeEnd("embed web font")), i.time("embed node"), Fl(f, r);
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
  const y = Kd(f, r);
  return c && y.insertBefore(c, y.children[0]), l && y.insertBefore(l, y.children[0]), h && _d(r), await (m == null ? void 0 : m(y)), y;
}
function Kd(e, t) {
  const { width: r, height: n } = t, i = ad(r, n, e.ownerDocument), o = i.ownerDocument.createElementNS(i.namespaceURI, "foreignObject");
  return o.setAttributeNS(null, "x", "0%"), o.setAttributeNS(null, "y", "0%"), o.setAttributeNS(null, "width", "100%"), o.setAttributeNS(null, "height", "100%"), o.append(e), i.appendChild(o), i;
}
async function Xd(e, t) {
  var l;
  const r = await Ln(e, t), n = await Yd(r), i = ld(n, r.isEnable("removeControlCharacter"));
  r.autoDestruct || (r.svgStyleElement = Ol(r.ownerDocument), r.svgDefsElement = (l = r.ownerDocument) == null ? void 0 : l.createElementNS(Tn, "defs"), r.svgStyles.clear());
  const o = br(i, n.ownerDocument);
  return await gd(o, r);
}
async function Jd(e, t) {
  const r = await Ln(e, t), { log: n, quality: i, type: o, dpi: l } = r, c = await Xd(r);
  n.time("canvas to data url");
  let a = c.toDataURL(o, i);
  if (["image/png", "image/jpeg"].includes(o) && l && qu && Wu) {
    const [p, s] = a.split(",");
    let h = 0, d = !1;
    if (o === "image/png") {
      const y = Uu(s);
      y >= 0 ? (h = Math.ceil((y + 28) / 3) * 4, d = !0) : h = 33 / 3 * 4;
    } else o === "image/jpeg" && (h = 18 / 3 * 4);
    const u = s.substring(0, h), m = s.substring(h), f = window.atob(u), g = new Uint8Array(f.length);
    for (let y = 0; y < g.length; y++)
      g[y] = f.charCodeAt(y);
    const x = o === "image/png" ? $u(g, l, d) : Ou(g, l), b = window.btoa(String.fromCharCode(...x));
    a = [p, ",", b, m].join("");
  }
  return n.timeEnd("canvas to data url"), a;
}
async function Zd(e, t) {
  return Jd(
    await Ln(e, { ...t, type: "image/png" })
  );
}
const Qd = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", ep = 8e3, tp = 16384, Eo = 4096, rp = 16e6, np = 500, ip = 1e4, Qn = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z4kwAAAAASUVORK5CYII=", Ul = 600, sp = 1200, op = 24, ap = 1024, it = 32, lp = 4, Bl = 400, cp = 0.985, up = 250;
function ql(e, t) {
  if (!e || e.startsWith("data:") || e.startsWith("blob:")) return !1;
  try {
    return new URL(e, t).origin !== t;
  } catch {
    return !1;
  }
}
function dp(e) {
  const t = e;
  if (!t || t.tagName !== "IMG") return !1;
  const r = t.currentSrc || t.src || "";
  return ql(r, location.origin);
}
function pp(e) {
  const t = e;
  if (!t || t.nodeType !== 1) return !1;
  const r = t.tagName;
  if (r === "SCRIPT" || r === "STYLE" || r === "NOSCRIPT" || r === "TEMPLATE" || r === "IFRAME" && ql(t.src || "", location.origin)) return !0;
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
function ei(e) {
  try {
    console.warn(e);
  } catch {
  }
}
function Mo(e) {
  return !e || e === "transparent" || e === "rgba(0, 0, 0, 0)";
}
function hp(e, t, r = 1) {
  try {
    const n = e.getBoundingClientRect(), i = Math.max(1, Math.ceil(Math.max(e.scrollWidth, e.clientWidth, n.width))), o = Math.max(1, Math.ceil(Math.max(e.scrollHeight, e.clientHeight, n.height))), l = Math.max(0.1, r), c = Math.min(Eo / i, Eo / o), a = Math.min(l, c, Math.sqrt(rp / (i * o))), p = document.createElement("canvas");
    p.width = Math.max(1, Math.floor(i * a)), p.height = Math.max(1, Math.floor(o * a));
    const s = p.getContext("2d");
    if (!s) return { dataUrl: Qn, scale: 1 };
    s.scale(a, a), s.fillStyle = "#ffffff", s.fillRect(0, 0, i, o);
    const h = Date.now() + np;
    let d = 0;
    const u = () => d >= ip || Date.now() >= h, m = (g, x = !1) => {
      var k;
      if (u() || (d++, !x && t && !t(g))) return;
      const b = getComputedStyle(g);
      if (b.display === "none" || b.visibility === "hidden" || Number(b.opacity) === 0) return;
      const y = g.getBoundingClientRect(), C = y.left - n.left, w = y.top - n.top;
      if (y.width > 0 && y.height > 0) {
        Mo(b.backgroundColor) || (s.fillStyle = b.backgroundColor, s.fillRect(C, w, y.width, y.height));
        const S = parseFloat(b.borderTopWidth);
        S > 0 && b.borderTopStyle !== "none" && !Mo(b.borderTopColor) && (s.strokeStyle = b.borderTopColor, s.lineWidth = S, s.strokeRect(C, w, y.width, y.height)), g.tagName === "IMG" && (s.fillStyle = "#f1f5f9", s.fillRect(C, w, y.width, y.height), s.strokeStyle = "#cbd5e1", s.lineWidth = 1, s.strokeRect(C, w, y.width, y.height));
      }
      for (const S of Array.from(g.childNodes)) {
        if (u()) break;
        if (S instanceof HTMLElement) {
          m(S);
          continue;
        }
        if (!(S.nodeType !== Node.TEXT_NODE || !((k = S.textContent) != null && k.trim())))
          try {
            const I = document.createRange();
            I.selectNodeContents(S);
            const N = I.getBoundingClientRect();
            if (N.width <= 0 || N.height <= 0) continue;
            s.save(), s.beginPath(), s.rect(N.left - n.left, N.top - n.top, N.width, N.height), s.clip(), s.fillStyle = b.color, s.font = `${b.fontStyle} ${b.fontWeight} ${b.fontSize} ${b.fontFamily}`, s.textBaseline = "top", s.fillText(S.textContent.trim(), N.left - n.left, N.top - n.top), s.restore();
          } catch {
          }
      }
    };
    m(e, !0);
    const f = p.toDataURL("image/png");
    return f.startsWith("data:image/png") ? { dataUrl: f, scale: a } : { dataUrl: Qn, scale: 1 };
  } catch {
    return { dataUrl: Qn, scale: 1 };
  }
}
function fp() {
  return new Promise((e) => {
    typeof requestAnimationFrame == "function" ? requestAnimationFrame(() => e()) : setTimeout(e, 16);
  });
}
function ti(e, t) {
  return Promise.race([
    Promise.resolve(e).then(() => {
    }, () => {
    }),
    new Promise((r) => setTimeout(r, Math.max(0, t)))
  ]);
}
function mp(e) {
  if (!e || typeof e.querySelectorAll != "function") return [];
  const t = typeof window < "u" && window.innerWidth || 0, r = typeof window < "u" && window.innerHeight || 0, n = [];
  let i;
  try {
    i = e.querySelectorAll("img");
  } catch {
    return [];
  }
  for (let o = 0; o < i.length && n.length < op; o++) {
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
async function Ro(e, t = Ul) {
  if (typeof document > "u") return;
  const r = Date.now() + Math.max(0, t), n = () => Math.max(0, r - Date.now());
  try {
    const i = document.fonts;
    i && i.status !== "loaded" && i.ready && typeof i.ready.then == "function" && await ti(i.ready, n());
    const o = mp(e);
    o.length && await ti(
      Promise.allSettled(o.map((l) => typeof l.decode == "function" ? l.decode() : Promise.resolve())),
      n()
    ), await ti(fp(), Math.min(n(), 50));
  } catch {
  }
}
function Wl(e, t) {
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
async function gp(e) {
  if (typeof document > "u") return null;
  const t = await Wl(e, Bl);
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
async function ri(e) {
  if (!e || !e.startsWith("data:image/png")) return !0;
  const t = e.indexOf(","), r = t >= 0 ? e.slice(t + 1) : "";
  if (Math.floor(r.length * 3 / 4) <= ap) return !0;
  try {
    const i = await gp(e);
    if (i !== null && i <= lp) return !0;
  } catch {
  }
  return !1;
}
async function yp(e) {
  if (typeof document > "u") return null;
  const t = await Wl(e, Bl);
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
    let o = 0, l = 0;
    for (let c = 0; c < i.length; c += 4) {
      const a = i[c + 3] / 255, p = i[c] * a + 255 * (1 - a), s = i[c + 1] * a + 255 * (1 - a), h = i[c + 2] * a + 255 * (1 - a);
      0.299 * p + 0.587 * s + 0.114 * h >= up && l++, o++;
    }
    return o ? l / o : null;
  } catch {
    return null;
  }
}
async function bp(e, t = {}) {
  if ((t.skippedImages ?? 0) > 0) return !0;
  try {
    const r = await yp(e);
    if (r !== null && r >= cp) return !0;
  } catch {
  }
  return !1;
}
const vp = [
  "material icons",
  "material symbols",
  "fontawesome",
  "font awesome",
  "icomoon",
  "glyphicons",
  "ionicons"
], kp = /* @__PURE__ */ new Set([
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
function wp(e) {
  return ((e || "").split(",")[0] || "").trim().replace(/^['"]+|['"]+$/g, "").toLowerCase();
}
function xp(e) {
  const t = (e || "").toLowerCase();
  return vp.some((r) => t.includes(r));
}
const Sp = /^[a-z0-9]+(?:[_-][a-z0-9]+)+$/i;
function Cp(e) {
  const t = (e || "").trim();
  return !t || t.length > 40 || /\s/.test(t) ? !1 : Sp.test(t);
}
function Ep(e) {
  const t = (e.text || "").trim();
  if (!t) return !1;
  const r = e.fontFamily || "", n = wp(r);
  return e.embeddedFamilies && n && e.embeddedFamilies.has(n) ? !1 : !!(xp(r) || n && !kp.has(n) && t.includes("_") && Cp(t));
}
function Mp(e, t) {
  var r;
  try {
    if (!e || e.nodeType !== 1) return;
    const n = e;
    if (n.childElementCount > 0) return;
    const i = n.textContent || "";
    if (!i.trim()) return;
    const o = ((r = n.style) == null ? void 0 : r.fontFamily) || "";
    if (!o) return;
    Ep({ fontFamily: o, text: i, embeddedFamilies: t }) && (n.textContent = "");
  } catch {
  }
}
const pn = { cssText: "", embeddedFamilies: /* @__PURE__ */ new Set() }, Rp = 3e3, Ap = 4e3, Ao = 24, To = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
async function Tp(e, t = Ap) {
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
function Lp(e) {
  var n, i, o;
  const t = [];
  let r;
  try {
    r = e.styleSheets;
  } catch {
    return t;
  }
  for (let l = 0; l < r.length && t.length < Ao; l++) {
    let c = null;
    try {
      c = r[l].cssRules;
    } catch {
      continue;
    }
    if (c)
      for (let a = 0; a < c.length && t.length < Ao; a++) {
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
function Ip(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Op(e, t, r) {
  const n = new RegExp(`url\\(\\s*(['"]?)${Ip(t)}\\1\\s*\\)`, "g");
  return e.replace(n, `url("${r}")`);
}
async function _p(e = {}) {
  const t = /* @__PURE__ */ new Set(), r = e.doc ?? (typeof document < "u" ? document : null), n = e.faces ?? (r ? Lp(r) : []);
  if (!n.length) return { cssText: "", embeddedFamilies: t };
  const i = e.baseUrl ?? (typeof location < "u" ? location.href : ""), o = e.fetchAsDataUrl ?? ((c) => Tp(c)), l = [];
  for (const c of n) {
    const a = [];
    To.lastIndex = 0;
    let p;
    for (; (p = To.exec(c.src)) !== null; ) {
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
      m && (s = Op(s, u, m), h = !0);
    h && (l.push(s), t.add(c.family.toLowerCase()));
  }
  return { cssText: l.join(`
`), embeddedFamilies: t };
}
async function Np() {
  try {
    return await Promise.race([
      _p({}).catch(() => pn),
      new Promise((e) => setTimeout(() => e(pn), Rp))
    ]);
  } catch {
    return pn;
  }
}
function Pp(e, t) {
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
async function $p(e, t = {}) {
  return (await Dp(e, t)).dataUrl;
}
async function Dp(e, t = {}) {
  let r = 0;
  const n = t.filter, i = typeof window < "u" && Number(window.devicePixelRatio) || 1, o = t.skipFonts ? 1 : Math.min(Math.max(i, 1), 2), l = t.pixelRatio ?? o, c = t.skipFonts ? pn : await Np(), a = t.width && t.height ? { width: t.width, height: t.height } : void 0, p = async () => {
    r = 0;
    const s = !t.skipFonts && c.cssText ? { cssText: c.cssText } : !1, h = await Pp(Zd(e, {
      scale: l,
      ...a ?? {},
      font: s,
      onCloneEachNode: (d) => Mp(d, c.embeddedFamilies),
      maximumCanvasSize: tp,
      fetch: { placeholderImage: Qd },
      filter: (d) => n && !n(d) || pp(d) ? !1 : dp(d) ? (r++, !1) : !0
    }), ep);
    if (!h.startsWith("data:image/png")) throw new Error("capture returned a non-PNG result");
    return h;
  };
  await Ro(e, Ul);
  try {
    let s = await p(), h = await ri(s);
    if (h) {
      await Ro(e, sp);
      try {
        const u = await p();
        await ri(u) || (s = u, h = !1);
      } catch {
      }
    }
    r && ei(`[Klavity] capture: omitted ${r} cross-origin image(s) the page's CSP/CORS blocks — captured the rest`), h && ei("[Klavity] capture: DOM render came back blank after retry — caller may retake with the sharp path");
    const d = h ? !1 : await bp(s, { skippedImages: r });
    return { dataUrl: s, scale: l, quality: "rendered", blank: h, partial: d, skippedImages: r };
  } catch (s) {
    const h = s instanceof Error ? s.message : String(s);
    ei(`[Klavity] capture: renderer unavailable (${h}); using fetch-free fallback`);
    const d = hp(e, n, l), u = await ri(d.dataUrl);
    return { ...d, quality: "wireframe", blank: u, partial: !1, skippedImages: 0 };
  }
}
const zp = {
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
function Fp(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function K(e, t = {}) {
  const r = zp[e];
  if (!r)
    return console.warn("[Klavity] unknown icon: " + e), "";
  const n = t.size ?? 18, i = t.class ? `icon ${t.class}` : "icon", o = t.label ? 'role="img"' : 'aria-hidden="true"', l = t.label ? `<title>${Fp(t.label)}</title>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" class="${i}" width="${n}" height="${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" ${o}>${l}${r}</svg>`;
}
const cr = {
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
class Lo {
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
async function Up(e, t, r) {
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
const Bp = 50, qp = 2e3, Wp = 1e3, jp = 500, Io = /^(?:token|access_token|refresh_token|api[_-]?key|apikey|key|secret|password|passwd|pwd|auth|authorization|session|sid|jwt|code|otp)$/i;
function Jr(e, t) {
  e.push(t), e.length > Bp && e.shift();
}
function Ss(e, t) {
  return e.length <= t ? e : e.slice(0, t) + "…[truncated]";
}
function ni(e) {
  let t = String(e || "");
  try {
    const r = new URL(t, typeof location < "u" ? location.href : "http://localhost");
    let n = !1;
    r.searchParams.forEach((i, o) => {
      Io.test(o) && (r.searchParams.set(o, "REDACTED"), n = !0);
    }), n && (t = r.toString());
  } catch {
    t = t.replace(/([?&])([^=&]+)=([^&]*)/g, (r, n, i, o) => Io.test(i) ? `${n}${i}=REDACTED` : r);
  }
  return Ss(t, Wp);
}
function Hp(e) {
  if (typeof e == "string") return e;
  if (e instanceof Error) return e.message;
  try {
    return Ss(JSON.stringify(e), jp);
  } catch {
    return String(e);
  }
}
function Vp(e, t = {}) {
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
function Gp(e, t = {}) {
  if (typeof window > "u") return e;
  const r = window;
  if (r.__klavityCaptureInstalled) return e;
  r.__klavityCaptureInstalled = !0;
  const n = () => t.isContextValid ? t.isContextValid() : !0, i = (a, p, s) => {
    Jr(e.consoleErrors, { message: Ss(p, qp), stack: s, timestamp: Date.now(), level: a });
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
          n() && i(p, h.map(Hp).join(" "));
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
      return Jr(e.networkFailures, { url: ni(s), status: u.status, method: String(h).toUpperCase(), timestamp: p, durationMs: Date.now() - p }), u;
    } catch (u) {
      throw Jr(e.networkFailures, { url: ni(s), status: 0, method: String(h).toUpperCase(), timestamp: p, durationMs: Date.now() - p }), u;
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
            Jr(e.networkFailures, {
              url: ni(h.url),
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
const Yp = ["light", "dark", "glass", "neon", "custom", "liquid"], Kp = ["hidden", "icon", "full", "custom"], Xp = ["lightbulb", "bug"], Jp = ["full", "reportOnly", "off"], Zp = /^#[0-9a-fA-F]{3,8}$/, Qp = /^[\w \-,'"().]+$/, Oo = (e) => typeof e == "object" && e !== null, Zr = (e) => typeof e == "string" && Zp.test(e.trim()) ? e.trim() : void 0, Qr = (e, t) => typeof e == "string" && e.trim() ? e.trim().slice(0, t) : void 0, eh = (e) => {
  if (typeof e != "string") return;
  const t = e.trim().slice(0, 120);
  return t && Qp.test(t) ? t : void 0;
}, _o = {
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
function No(e) {
  let t = e.replace("#", "");
  t.length === 3 && (t = t.split("").map((l) => l + l).join(""));
  const r = parseInt(t.slice(0, 6), 16), n = r >> 16 & 255, i = r >> 8 & 255, o = r & 255;
  return 0.299 * n + 0.587 * i + 0.114 * o;
}
function jl(e) {
  const t = Oo(e) ? e : {}, n = { theme: typeof t.theme == "string" && Yp.includes(t.theme) ? t.theme : "light" }, i = Zr(t.primary), o = Zr(t.secondary), l = Zr(t.background), c = Qr(t.thankYou, 140), a = eh(t.font);
  i && (n.primary = i), o && (n.secondary = o), l && (n.background = l), a && (n.font = a), c && (n.thankYou = c), typeof t.launcherMode == "string" && Kp.includes(t.launcherMode) && (n.launcherMode = t.launcherMode);
  const p = Qr(t.launcherText, 60);
  p && (n.launcherText = p);
  const s = Zr(t.launcherIconColor);
  s && (n.launcherIconColor = s), typeof t.launcherIcon == "string" && Xp.includes(t.launcherIcon) && (n.launcherIcon = t.launcherIcon), typeof t.rightClickMode == "string" && Jp.includes(t.rightClickMode) && (n.rightClickMode = t.rightClickMode), t.maskNumbers === !0 && (n.maskNumbers = !0), t.reportClarity === !0 ? n.reportClarity = !0 : t.reportClarity === !1 && (n.reportClarity = !1), t.preSubmitNudge === !1 ? n.preSubmitNudge = !1 : t.preSubmitNudge === !0 && (n.preSubmitNudge = !0), t.debug === !0 && (n.debug = !0), t.submitTargetToggle === !1 ? n.submitTargetToggle = !1 : t.submitTargetToggle === !0 && (n.submitTargetToggle = !0);
  const h = Qr(t.projectDisplayName, 60);
  h && (n.projectDisplayName = h);
  const d = Oo(t.agency_branding) ? t.agency_branding : {};
  (t.whiteLabel === !0 || d.whiteLabel === !0) && (n.whiteLabel = !0);
  const u = Qr(t.projectId, 200);
  return u && (n.projectId = u), (t.attributionMedium === "extension" || t.attributionMedium === "widget") && (n.attributionMedium = t.attributionMedium), n;
}
function th(e) {
  const t = jl(e), r = t.theme === "custom" ? { ..._o.light } : { ..._o[t.theme] };
  if (t.theme === "custom" && (t.primary && (r["--kl-accent"] = t.primary), t.secondary && (r["--kl-accent2"] = t.secondary), t.background)) {
    r["--kl-bg"] = t.background;
    const i = No(t.background) < 140;
    r["--kl-fg"] = i ? "#f4f4f7" : "#1d1d24", r["--kl-muted"] = i ? "rgba(255,255,255,.6)" : "#706560", r["--kl-border"] = i ? "rgba(255,255,255,.16)" : "#e6e6ec", r["--kl-chip"] = i ? "rgba(255,255,255,.08)" : "#f4f4f7", r["--kl-input-bg"] = i ? "rgba(255,255,255,.05)" : "#fafafb";
  }
  return t.font && (r["--kl-font"] = t.font), t.theme === "dark" || t.theme === "neon" || t.theme === "glass" || t.theme === "liquid" || t.theme === "custom" && t.background && No(t.background) < 140, r["--kl-img-outline"] = "var(--kl-img-outline-val, color-mix(in srgb, var(--kl-fg) 10%, transparent))", r["--kl-glow"] = "radial-gradient(120% 80% at 50% -10%, color-mix(in srgb, var(--kl-accent) 12%, transparent), transparent 60%), radial-gradient(80% 60% at 100% 110%, color-mix(in srgb, var(--kl-accent2) 6%, transparent), transparent 60%)", `:host{${Object.entries(r).map(([i, o]) => `${i}:${o};`).join("")}}`;
}
const Fe = class Fe {
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
    this._recording || !Fe.isSupported() || (this._recording = !0, this._stopping = !1, this._stopFired = !1, this._showedReconnecting = !1, this._consecFailures = 0, this._timer = setTimeout(() => this.stop(), Fe.SESSION_MS), this._begin());
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
      if (i && i in Fe.TERMINAL_ERRORS) {
        this.onError(i, Fe.TERMINAL_ERRORS[i]), this._teardown();
        return;
      }
      i && i !== "no-speech" && (this._consecFailures++, this._showedReconnecting || (this._showedReconnecting = !0, this.onStatus("retrying", "Reconnecting voice…")));
    }, r.onend = () => {
      if (this._recognition = null, this._stopping || !this._recording) {
        this._emitStop();
        return;
      }
      if (this._consecFailures > Fe.MAX_CONSEC_FAILURES) {
        this.onError("network", "Voice disconnected — tap Voice to try again"), this._teardown();
        return;
      }
      const n = this._consecFailures === 0 ? Fe.BENIGN_RESTART_MS : Math.min(Fe.MAX_BACKOFF_MS, Fe.BASE_BACKOFF_MS * 2 ** (this._consecFailures - 1));
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
Fe.MAX_CONSEC_FAILURES = 6, Fe.BASE_BACKOFF_MS = 400, Fe.MAX_BACKOFF_MS = 8e3, Fe.BENIGN_RESTART_MS = 250, Fe.SESSION_MS = 18e4, Fe.TERMINAL_ERRORS = {
  "not-allowed": "Microphone access was denied",
  "service-not-allowed": "Microphone access was denied",
  "audio-capture": "No microphone was found"
};
let Nr = Fe;
function rh() {
  const t = globalThis.MediaRecorder;
  return {
    getUserMedia: (r) => navigator.mediaDevices.getUserMedia(r),
    MediaRecorder: t,
    isTypeSupported: (r) => !!(t && t.isTypeSupported && t.isTypeSupported(r)),
    setTimeout: (r, n) => setTimeout(r, n),
    clearTimeout: (r) => clearTimeout(r)
  };
}
const nh = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
function ih(e) {
  for (const t of nh)
    if (e.isTypeSupported(t)) return t;
  return null;
}
const yr = class yr {
  constructor(t) {
    this.onTranscript = (r) => {
    }, this.onError = (r, n) => {
    }, this.onStatus = (r, n) => {
    }, this.onStop = () => {
    }, this.onUnavailable = () => {
    }, this._recording = !1, this._stream = null, this._recorder = null, this._chunks = [], this._segTimer = null, this._sessTimer = null, this._mime = null, this._firstSegment = !0, this._transcribe = t.transcribe, this._deps = { ...rh(), ...t.deps || {} };
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
    this._stream = t, this._mime = ih(this._deps);
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
    }, this._sessTimer = this._deps.setTimeout(() => this.stop(), yr.MAX_SESSION_MS), this._beginSegment();
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
      }, yr.SEGMENT_MS);
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
yr.SEGMENT_MS = 5e3, yr.MAX_SESSION_MS = 18e4;
let yn = yr;
function sh(e) {
  return e.hasEndpoint && e.mediaRecorderSupported ? "server" : e.webSpeechSupported ? "webspeech" : "none";
}
function Ie(e) {
  try {
    e && e.parentNode && e.parentNode.removeChild(e);
  } catch {
  }
}
const oh = /* @__PURE__ */ new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"]);
function Wt(e) {
  const t = [], r = [], n = document.createTreeWalker(e, NodeFilter.SHOW_TEXT, {
    acceptNode(l) {
      let c = l.parentElement;
      for (; c && c !== e; ) {
        if (oh.has(c.tagName)) return NodeFilter.FILTER_REJECT;
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
    Ie(l);
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
        for (const s of a) s.parentNode === l && Ie(s);
      }
    }
    for (const { el: l, original: c } of r)
      l.value = c;
  };
}
const Hl = [
  "not working",
  "doesn't work",
  "does not work",
  "doesnt work",
  "broken",
  "pls fix",
  "please fix",
  "fix it",
  "help"
], ah = /\b(when i|steps?|click|clicked|clicking|tap|tapped|then|go to|navigate|reload|refresh|press|select|enter)\b/i, lh = /(https?:\/\/|\s\/[a-z0-9]|^\/[a-z0-9])/i, ch = /\b(expected?|should|instead|supposed to|meant to|i wanted)\b/i, uh = /* @__PURE__ */ new Set([
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
]), dh = { needs: "Needs detail", good: "Good", great: "Great" };
function ph(e) {
  let t = e;
  for (const r of Hl) t = t.split(r).join(" ");
  return t;
}
function hh(e) {
  const t = e.split(/[^a-z0-9]+/i).filter(Boolean);
  let r = 0;
  for (const n of t)
    n.length < 3 || uh.has(n) || r++;
  return r;
}
function Vl(e) {
  const t = (e || "").trim(), r = t.toLowerCase(), n = ph(r), i = hh(n), o = t.length > 0 && Hl.some((d) => r.includes(d)) && i < 3, l = i >= 3 && t.length >= 12, c = ch.test(r), a = ah.test(r) || lh.test(t), p = { problem: l, expected: c, repro: a }, s = (l ? 1 : 0) + (c ? 1 : 0) + (a ? 1 : 0), h = s >= 3 ? "great" : s === 2 ? "good" : "needs";
  return { score: s, coverage: p, level: h, label: dh[h], vague: o };
}
function fh(e) {
  const t = (e || "").trim();
  return t.length <= 15 ? !1 : Vl(t).level !== "great";
}
const mh = [
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
function gh(e) {
  const t = (e || "").toLowerCase();
  return t ? mh.some((r) => t.includes(r)) : !1;
}
function yh(e) {
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
function bh(e, t) {
  let r;
  try {
    r = new URL(e);
  } catch {
    return e;
  }
  const n = [
    ["utm_source", yh(t.source)],
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
function vh(e) {
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
function kh(e, t, r) {
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
function Po(e) {
  let t = at(String(e ?? ""));
  return t = t.replace(/`([^`\n]+)`/g, (r, n) => `<span class="kl-mk">\`</span><code>${n}</code><span class="kl-mk">\`</span>`), t = t.replace(/\*([^*\n]+)\*/g, (r, n) => `<span class="kl-mk">*</span><b>${n}</b><span class="kl-mk">*</span>`), t = t.replace(/_([^_\n]+)_/g, (r, n) => `<span class="kl-mk">_</span><i>${n}</i><span class="kl-mk">_</span>`), t = t.replace(/~([^~\n]+)~/g, (r, n) => `<span class="kl-mk">~</span><s>${n}</s><span class="kl-mk">~</span>`), t = t.replace(/\n/g, "<br>"), t;
}
function $o(e) {
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
function wh(e) {
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
function Do(e) {
  const t = /^fb_([0-9a-f]{8})[0-9a-f-]+$/i.exec(e);
  return t ? "fb_" + t[1] : e;
}
function zo(e) {
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
function xh(e) {
  return e.screenCaptureDefault && typeof e.onCaptureSharp == "function" ? "screen" : typeof e.onCaptureViewport == "function" ? "viewport" : typeof e.onCaptureFull == "function" ? "full" : "none";
}
function Sh(e) {
  const t = e && typeof e == "object" && "name" in e ? String(e.name) : "";
  return t === "NotAllowedError" || t === "AbortError" || t === "NotFoundError" || t === "InvalidStateError";
}
const Ch = {
  "real-pixel": { label: "Sharp", iconName: "check-circle", degraded: !1 },
  rendered: { label: "Rendered", iconName: "image", degraded: !0 },
  wireframe: { label: "Wireframe", iconName: "triangle-alert", degraded: !0 }
};
function Gl(e) {
  return (e.type || "").toLowerCase().startsWith("video/") || /\.(mp4|m4v|mov|webm|avi|mkv|ogv|3gp)$/i.test(e.name || "");
}
function Eh(e) {
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
const Mh = "image/*,.heic,.heif,video/*,.pdf,.log,.har,.txt,.json,.csv,.zip,.xml,.yml,.yaml", Rh = 100, Ah = Rh * 1024 * 1024;
function Th(e) {
  return (e.type || "").toLowerCase().startsWith("image/") || /\.(heic|heif|png|jpe?g|gif|webp|bmp|avif|svg)$/i.test(e.name || "");
}
function ar(e) {
  return Gl(e) ? "video" : Th(e) ? "image" : "file";
}
function Lh(e, t) {
  if (e.size <= t.capBytes) return { overCap: !1 };
  const r = Math.round(t.capBytes / 1024 / 1024), n = t.role === "owner" || t.role === "admin" || t.role === "member", o = `${e.name ? `"${e.name}"` : "This file"} is over the ${r}MB limit on your plan.`, l = n ? { kind: "upgrade", label: "Request upgrade", url: t.upgradeUrl, reason: "storage_over_cap", hint: "or attach a smaller file" } : { kind: "ask-team", label: "Request upgrade", reason: "storage_over_cap", hint: "or attach a smaller file" };
  return { overCap: !0, message: o, cta: l };
}
function en(e) {
  return e == null || typeof e != "number" || !isFinite(e) ? null : Math.max(0, Math.min(100, Math.round(e)));
}
function Ih(e, t, r = {}) {
  var co, uo, po, ho;
  const n = jl(r);
  let i = !!n.maskNumbers;
  const o = document.createElement("div");
  o.setAttribute("data-klavity-ui", "composer"), o.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;";
  const l = o.attachShadow({ mode: "open" });
  document.body.appendChild(o);
  let c = [], a = !1, p = [], s = [], h = [], d = !1;
  const u = !!t.onMinimize, m = u ? 8 : 5, f = 15e3, g = 10 * 1024 * 1024, x = !!t.allowFileAttachments, b = 5, y = t.maxFileBytes && t.maxFileBytes > 0 ? t.maxFileBytes : Ah, C = t.reporterRole ?? "anon", w = t.upgradeUrl, k = Math.max(120 * 1024 * 1024, y + 20 * 1024 * 1024);
  let S = [], I = null;
  const N = !!(t.allowRecording && t.onRecord), O = sh({
    hasEndpoint: !!t.onDictate,
    mediaRecorderSupported: yn.isSupported(),
    webSpeechSupported: Nr.isSupported()
  }), J = O !== "none", H = 2;
  let L = [];
  const De = t.issueTypes && t.issueTypes.length ? t.issueTypes : null, se = {};
  let Q = null;
  const pe = () => {
    const v = Object.keys(se);
    if (!v.length && !Q) return null;
    const R = {};
    if (v.length) {
      const E = {};
      for (const A of v) E[A] = se[A];
      const M = se[0] ?? se[Number(v[0])] ?? {};
      Object.assign(R, M, { byIndex: E });
    }
    return Q && (R.selector = Q.selector, R.selectorText = Q.text), R;
  };
  let be = e, he = 0, ie = null, X = null, Ye = null, $ = t.replayState === "attached", Be = null, $e = null, qe = null, Ae = !1;
  const Qe = 4e3, Ct = 5e3, ke = {}, V = {}, Te = (v) => v ? JSON.parse(JSON.stringify(v)) : null, me = (v) => ({
    url: c[v],
    compressed: p[v],
    ann: Te(se[v])
  }), ve = (v) => {
    (ke[v] ?? (ke[v] = [])).push(me(v));
  }, ze = (v, R) => {
    c[v] = R.url, p[v] = R.compressed, R.ann ? se[v] = Te(R.ann) : delete se[v];
  }, ge = (v) => {
    const R = ke[v];
    if (!R || !R.length) return !1;
    const E = R.pop(), M = V[v];
    for (; M && M.length && M[M.length - 1].mark >= R.length; ) M.pop();
    return ze(v, E), we(), !0;
  }, Mr = (v) => {
    const R = V[v];
    if (!R || !R.length) return !1;
    const { snap: E, mark: M } = R.pop();
    return ke[v] && (ke[v].length = Math.min(ke[v].length, M)), ze(v, E), we(), !0;
  }, Ws = document.createElement("style");
  Ws.textContent = `
    ${th(n)}
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
  `, l.appendChild(Ws);
  const er = document.createElement("div");
  er.className = "klavity-overlay";
  const ee = document.createElement("div");
  ee.className = "klavity-modal", ee.innerHTML = `
    ${u ? '<button class="klavity-min" id="klavity-min" type="button" aria-label="Minimize" title="Minimize (keeps your evidence)"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>' : ""}
    <button class="klavity-x" id="klavity-x" type="button" aria-label="Close" title="Close (Esc)">${K("x", { size: 16 })}</button>
    <div class="kl-hero" id="klavity-hero">
      <div class="kl-hero-tools" id="klavity-hero-tools"></div>
      <div class="kl-hero-stage" id="klavity-hero-stage">
        <div class="kl-hero-empty" id="klavity-hero-empty">${K("image", { size: 34 })}<span>Capture or upload a screenshot to start marking it up</span></div>
      </div>
      <div class="klavity-strip" id="klavity-strip"></div>
      ${t.onCaptureSharp ? '<div class="klavity-sharphint" id="klavity-sharphint" role="status" aria-live="polite" hidden></div>' : ""}
    </div>
    <div class="kl-side" id="klavity-side">
      ${t.showTitleField ? '<label class="klavity-title-label" for="klavity-title">Title<input type="text" class="klavity-title" id="klavity-title" maxlength="200" placeholder="One line summarising the issue"></label>' : ""}
      ${De ? `<div class="klavity-types" id="klavity-types" role="radiogroup" aria-label="Issue type">${De.map((v) => `<button type="button" class="kl-type-chip${v.value === e ? " active" : ""}" data-kind="${at(v.value)}" role="radio" aria-checked="${v.value === e ? "true" : "false"}">${at(v.label)}${v.mappingLabel ? `<span class="kl-type-map">${at(v.mappingLabel)}</span>` : ""}</button>`).join("")}</div>` : `<div class="klavity-toggle">
        <button class="bug ${e === "bug" ? "active" : ""}"><span class="kl-cap-ic">${K("bug")}</span>Bug</button>
        <button class="feat ${e === "feature" ? "active" : ""}"><span class="kl-cap-ic">${K("lightbulb")}</span>Feature</button>
      </div>`}
      
      
      <div class="klavity-actions">
        ${t.onCaptureSharp ? `<button id="klavity-sharp" class="kl-cap-primary" aria-label="Snap capture" title="Snap capture" aria-describedby="klavity-sharp-tip"><span class="kl-cap-main"><span class="kl-cap-ic">${K("app-window")}</span><span class="kl-sharp-label">Snap</span></span><span class="kl-info-badge" aria-hidden="true"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></span><span id="klavity-sharp-tip" class="klavity-info-pop" role="tooltip"><b>Snap</b> grabs the <b>whole page — every image, embedded frame, and web font, pixel-perfect</b> using your browser's screen-share. Your browser will ask you to <b>share this tab</b>.</span></button>` : ""}
        <button id="klavity-full" title="Full Page — instant, but re-renders the page (may miss cross-origin images or embedded frames). Use Screen for a pixel-perfect shot."><span class="kl-cap-ic">${K("camera")}</span><span class="kl-full-label">Full Page</span></button>
        
        <button id="klavity-upload" title="${x ? "Add a screenshot, video, or file (images, MP4, PDF, .log, .har, ...)" : "Upload a screenshot"}"><span class="kl-cap-ic">${K(x ? "paperclip" : "image")}</span><span class="kl-upload-label">${x ? "Attach" : "Upload"}</span></button>
        ${N ? `<button id="klavity-record" title="Record your screen, camera and narration"><span class="kl-cap-ic">${K("monitor")}</span><span class="kl-record-label">Record me</span></button>` : ""}
        ${t.onRegionCapture ? `<button id="klavity-region"><span class="kl-cap-ic">${K("scissors")}</span><span class="kl-region-label">Region</span></button>` : ""}
        ${t.onPickElement ? `<button id="klavity-pick" title="Pick the exact element that's broken"><span class="kl-cap-ic">${K("mouse-pointer-2")}</span><span class="kl-pick-label">Pick element</span></button>` : ""}
      </div>
      ${t.onPickElement ? '<div class="klavity-pickinfo" id="klavity-pickinfo" role="status" aria-live="polite" hidden></div>' : ""}
      
      
      <input type="file" id="klavity-file" accept="${x ? Mh : "image/*,.heic,.heif"}" multiple style="display:none">
      ${x ? `<div class="klavity-attach-hint" id="klavity-attach-hint"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg><span>Images, video, PDF or logs — up to ${Math.round(y / 1024 / 1024)}MB each</span></div>` : ""}
      
      <div class="klavity-descbar">
        <div class="klavity-counter" id="klavity-counter" hidden>0/${m} images</div>
        ${J ? `<button id="klavity-voice" class="kl-voice-circle" type="button" title="Voice dictation" aria-label="Voice dictation" aria-pressed="false"><span class="kl-cap-ic">${K("mic")}<span class="kl-vdot"></span><span class="kl-vstop" aria-hidden="true"></span></span><svg class="kl-vring" viewBox="0 0 32 32" aria-hidden="true"><circle class="kl-vring-bg" cx="16" cy="16" r="13" fill="none" stroke-width="2"/><circle class="kl-vring-prog" cx="16" cy="16" r="13" fill="none" stroke-width="2" stroke-dasharray="81.68" stroke-dashoffset="81.68" stroke-linecap="round" transform="rotate(-90 16 16)"/></svg></button>` : ""}
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
      ${J ? '<div class="klavity-voice-status" id="klavity-voice-status" role="status" aria-live="polite" hidden></div>' : ""}
      ${n.reportClarity ? `<div class="klavity-clarity" id="klavity-clarity" role="status" aria-live="polite" hidden>
        <div class="kl-clr-bar"><i></i><i></i><i></i></div>
        <div class="kl-clr-row"><span>Report clarity</span><span class="kl-clr-st" id="klavity-clarity-status">Needs detail</span></div>
        <div class="kl-clr-chips">
          <span class="kl-clr-chip" id="klavity-clarity-problem"><span class="kl-clr-mark">○</span> What's broken</span>
          <span class="kl-clr-chip" id="klavity-clarity-expected"><span class="kl-clr-mark">○</span> What you expected</span>
          <span class="kl-clr-chip" id="klavity-clarity-repro"><span class="kl-clr-mark">○</span> How to reproduce</span>
        </div>
        <div class="kl-clr-tip" id="klavity-clarity-tip" hidden><span class="kl-clr-ai">${K("lightbulb", { size: 14 })}</span><span id="klavity-clarity-tip-text"></span></div>
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
  const ye = l.getElementById("klavity-sharp"), js = l.querySelector(".klavity-info-pop");
  if (ye && js) {
    const v = document.createElement("div");
    v.className = "kl-float-tip", v.setAttribute("role", "tooltip"), v.innerHTML = js.innerHTML, l.appendChild(v);
    const R = () => {
      const M = ye.getBoundingClientRect(), A = Math.min(228, window.innerWidth - 16), T = 8, _ = window.innerWidth, F = window.innerHeight, P = M.left + M.width / 2 - A / 2, D = Math.max(T, Math.min(P, _ - A - T));
      v.style.left = D + "px", v.style.top = "-9999px", v.style.visibility = "hidden", v.style.display = "block";
      const B = v.offsetHeight;
      v.style.display = "", v.style.visibility = "";
      let q = M.bottom + 8;
      q + B + T > F && (q = M.top - B - 8), q = Math.max(T, Math.min(q, F - B - T)), v.style.top = q + "px", v.classList.add("kl-show");
    }, E = () => v.classList.remove("kl-show");
    ye.addEventListener("mouseenter", R), ye.addEventListener("mouseleave", E), ye.addEventListener("focus", R), ye.addEventListener("blur", E);
  }
  let Hs = !1, Rr = null;
  function qn() {
    try {
      Rr == null || Rr.remove();
    } catch {
    }
    Rr = null;
    try {
      ye == null || ye.classList.remove("kl-pulse");
    } catch {
    }
  }
  function uu() {
    var P;
    if (Hs || !ye || Ae) return;
    Hs = !0;
    const v = document.createElement("div");
    v.className = "kl-float-tip kl-nudge", v.setAttribute("role", "status"), v.setAttribute("aria-live", "polite"), v.innerHTML = `<div class="kl-nudge-row"><span><b>Get pixel-perfect screenshots by sharing</b> — try it now.</span><button type="button" class="kl-nudge-x" aria-label="Dismiss">${K("x", { size: 13 })}</button></div>`, l.appendChild(v), Rr = v;
    const R = ye.getBoundingClientRect(), E = Math.min(228, window.innerWidth - 16), M = 8, A = window.innerWidth, T = window.innerHeight;
    v.style.left = Math.max(M, Math.min(R.left + R.width / 2 - E / 2, A - E - M)) + "px", v.style.top = "-9999px", v.style.visibility = "hidden", v.style.display = "block";
    const _ = v.offsetHeight;
    v.style.display = "", v.style.visibility = "";
    let F = R.bottom + 8;
    F + _ + M > T && (F = R.top - _ - 8), v.style.top = Math.max(M, Math.min(F, T - _ - M)) + "px", v.classList.add("kl-show"), (P = v.querySelector(".kl-nudge-x")) == null || P.addEventListener("click", qn);
    try {
      ye.classList.add("kl-pulse");
    } catch {
    }
    try {
      setTimeout(() => qn(), 9e3);
    } catch {
    }
    ye.addEventListener("click", qn, { once: !0 });
  }
  function du(v) {
    $ = v === "attached", yt();
  }
  const Vs = {
    shadowRoot: l,
    // Host seeds shots it already tracks (evidence-session restore, region-initial): fireAdded=false so
    // onShotAdded does NOT re-fire (which would double-persist). Page metadata is carried through as-is.
    addScreenshot: (v, R, E, M) => tt(v, R, E, !1, !!M),
    // fireAdded=true: select the new shot as the active hero + fire onShotAdded (persist). See interface doc.
    addCapturedShot: (v, R, E, M) => tt(v, R, E, !0, !!M),
    close: tr,
    setReplayState: du,
    // KLA-591: mirror the aggregate upload percent onto every video tile + file chip while a submit is in
    // flight. Re-renders the strip + chips so the bars paint; passing null clears them.
    setUploadProgress: (v) => {
      if (I = en(v), !Ae)
        try {
          we(), Hn();
        } catch {
        }
    }
  };
  function we() {
    const v = l.getElementById("klavity-strip"), R = l.getElementById("klavity-counter");
    v.innerHTML = "", c.forEach((E, M) => {
      const A = document.createElement("div");
      A.className = "klavity-thumb", M === he && A.classList.add("kl-thumb-active");
      const T = document.createElement("img");
      T.src = E, T.title = "Click to select + mark up", T.addEventListener("load", () => {
        T.naturalHeight > T.naturalWidth * 1.4 && A.classList.add("kl-tall");
      }, { once: !0 }), T.addEventListener("click", () => {
        he = M, ie = null, X = null, we();
      });
      const _ = document.createElement("button");
      _.className = "klavity-rm", _.innerHTML = K("x", { size: 13 }), _.title = "Remove", _.addEventListener("click", (D) => {
        var B;
        D.stopPropagation(), c.splice(M, 1), p.splice(M, 1), s.splice(M, 1), h.splice(M, 1);
        try {
          (B = t.onShotRemoved) == null || B.call(t, M);
        } catch {
        }
        delete se[M];
        for (const q of Object.keys(se).map(Number).filter((W) => W > M).sort((W, Y) => W - Y))
          se[q - 1] = se[q], delete se[q];
        delete ke[M], delete V[M];
        for (const q of Object.keys(ke).map(Number).filter((W) => W > M).sort((W, Y) => W - Y))
          ke[q - 1] = ke[q], delete ke[q];
        for (const q of Object.keys(V).map(Number).filter((W) => W > M).sort((W, Y) => W - Y))
          V[q - 1] = V[q], delete V[q];
        c.length === 0 && bt(null), we();
      });
      const F = document.createElement("button");
      F.className = "klavity-mk", F.innerHTML = K("pencil", { size: 13 }), F.title = "Mark up", F.addEventListener("click", (D) => {
        D.stopPropagation(), Cu(M);
      }), A.append(T, _, F);
      const P = s[M];
      if (P) {
        const D = Ch[P], B = document.createElement("span");
        if (B.className = "klavity-qb kl-q-" + P, B.title = P === "real-pixel" ? "Pixel-perfect capture (every image included)" : P === "wireframe" ? "Wireframe fallback — layout only, images not captured. Retake for a sharp shot." : "Rendered capture — some cross-origin images may be missing. Retake for a sharp shot.", B.innerHTML = K(D.iconName, { size: 10 }) + '<span class="klavity-qb-t">' + at(D.label) + "</span>", A.appendChild(B), D.degraded && t.onRetakeSharp) {
          const q = document.createElement("button");
          q.type = "button", q.className = "klavity-retake", q.innerHTML = K("zap", { size: 11 }) + "<span>Retake sharp</span>", q.title = "Recapture this shot at full pixel quality", q.addEventListener("click", (W) => {
            W.stopPropagation(), pu(M, q);
          }), A.appendChild(q);
        }
      }
      if (Gs.has(M)) {
        const D = document.createElement("div");
        D.className = "klavity-retake-note", D.textContent = "Markup cleared for the retake.", A.appendChild(D);
      }
      v.appendChild(A);
    }), S.forEach((E, M) => {
      if (ar(E) !== "video") return;
      const A = document.createElement("div");
      A.className = "klavity-thumb kl-video-thumb", ie === M && A.classList.add("kl-thumb-active");
      const T = document.createElement("video");
      T.src = E.dataUrl, T.muted = !0, T.preload = "metadata", T.setAttribute("playsinline", ""), T.tabIndex = -1;
      const _ = document.createElement("span");
      _.className = "kl-video-play", _.setAttribute("aria-hidden", "true"), _.innerHTML = K("play", { size: 16 });
      const F = document.createElement("span");
      F.className = "kl-video-badge", F.innerHTML = K("play", { size: 9 }) + "<span>Video</span>", A.title = "Click to play " + E.name, A.addEventListener("click", () => {
        ie = M, X = null, we();
      });
      const P = document.createElement("button");
      P.className = "klavity-rm", P.innerHTML = K("x", { size: 13 }), P.title = "Remove", P.addEventListener("click", (B) => {
        B.stopPropagation(), Ks(M);
      }), A.append(T, _, F, P);
      const D = en(I);
      if (D != null) {
        const B = document.createElement("div");
        B.className = "kl-att-prog";
        const q = document.createElement("i");
        q.style.width = D + "%", B.appendChild(q), A.appendChild(B);
      }
      v.appendChild(A);
    }), L.forEach((E, M) => {
      const A = document.createElement("div");
      A.className = "klavity-thumb kl-video-thumb kl-rec-tile", X === M && A.classList.add("kl-thumb-active");
      const T = document.createElement("video");
      T.src = E.dataUrl, T.muted = !0, T.preload = "metadata", T.setAttribute("playsinline", ""), T.tabIndex = -1;
      const _ = document.createElement("span");
      _.className = "kl-video-play", _.setAttribute("aria-hidden", "true"), _.innerHTML = K("play", { size: 16 });
      const F = Math.round(E.durationMs / 1e3), P = document.createElement("span");
      P.className = "kl-video-badge", P.innerHTML = K("play", { size: 9 }) + `<span>${Math.floor(F / 60)}:${String(F % 60).padStart(2, "0")}${E.screenOnly ? " · screen" : ""}</span>`, A.title = "Click to play your recording", A.addEventListener("click", () => {
        X = M, ie = null, we();
      });
      const D = document.createElement("button");
      D.type = "button", D.className = "kl-rerec", D.innerHTML = K("refresh-cw", { size: 12 }), D.title = "Re-record", D.setAttribute("aria-label", "Re-record"), D.addEventListener("click", (W) => {
        var Y;
        W.stopPropagation(), L.splice(M, 1), X === M ? X = null : X != null && X > M && (X -= 1), Vn();
        try {
          (Y = l.getElementById("klavity-record")) == null || Y.click();
        } catch {
        }
      });
      const B = document.createElement("button");
      B.className = "klavity-rm", B.innerHTML = K("x", { size: 13 }), B.title = "Remove", B.addEventListener("click", (W) => {
        W.stopPropagation(), L.splice(M, 1), X === M ? X = null : X != null && X > M && (X -= 1), Vn();
      }), A.append(T, _, P, D, B);
      const q = en(I);
      if (q != null) {
        const W = document.createElement("div");
        W.className = "kl-att-prog";
        const Y = document.createElement("i");
        Y.style.width = q + "%", W.appendChild(Y), A.appendChild(W);
      }
      v.appendChild(A);
    });
    try {
      const E = v.children[he];
      E && typeof E.scrollIntoView == "function" && E.scrollIntoView({ block: "nearest", inline: "nearest" });
    } catch {
    }
    if (a) {
      const E = document.createElement("div");
      E.className = "kl-thumb-skel kl-loading", E.setAttribute("role", "status"), E.setAttribute("aria-label", "Capturing screenshot"), E.innerHTML = '<span class="kl-skel-spin" aria-hidden="true"></span><span>Capturing…</span>', v.appendChild(E);
    }
    R.textContent = `${c.length}/${m} images`, R instanceof HTMLElement && (R.hidden = c.length === 0), yt(), Kr(), ao();
  }
  function Kr() {
    const v = l.getElementById("klavity-sharphint");
    if (!v) return;
    if (c.length > 0 && he >= 0 && he < c.length && !!h[he] && !d && !!t.onCaptureSharp && !ot) {
      if (!v.dataset.built) {
        v.dataset.built = "1", v.innerHTML = "";
        const M = document.createElement("span");
        M.className = "kl-sh-ic", M.innerHTML = K("triangle-alert", { size: 15 });
        const A = document.createElement("span");
        A.className = "kl-sh-txt", A.textContent = "Some areas can't be captured this way (embedded frames or cross-origin images) - click Snap for a pixel-perfect shot.";
        const T = document.createElement("button");
        T.type = "button", T.className = "kl-sh-use", T.textContent = "Use Snap", T.addEventListener("click", () => {
          d = !0, Kr(), ye == null || ye.click();
        });
        const _ = document.createElement("button");
        _.type = "button", _.className = "kl-sh-x", _.setAttribute("aria-label", "Dismiss"), _.title = "Dismiss", _.innerHTML = K("x", { size: 12 }), _.addEventListener("click", () => {
          d = !0, Kr();
        }), v.append(M, A, T, _);
      }
      v.hidden = !1, ye == null || ye.classList.add("kl-suggest");
    } else
      v.hidden = !0, ye == null || ye.classList.remove("kl-suggest");
  }
  function mt(v) {
    const R = l.getElementById("klavity-err");
    R && (R.textContent = v, R.style.display = "block");
  }
  function Wn() {
    const v = l.getElementById("klavity-err");
    v && (v.style.display = "none");
  }
  function tt(v, R, E, M = !0, A = !1) {
    var T;
    if (c.length >= m) {
      mt(`You can attach up to ${m} images.`);
      return;
    }
    if (Wn(), c.push(v), p.push(t.compressImage ? t.compressImage(v) : Promise.resolve(v)), s.push(R), h.push(A && R !== "real-pixel"), M && (he = c.length - 1, ie = null, X = null), we(), M)
      try {
        (T = t.onShotAdded) == null || T.call(t, v, R);
      } catch {
      }
  }
  const Gs = /* @__PURE__ */ new Set();
  async function pu(v, R) {
    if (!(ot || !t.onRetakeSharp)) {
      We(!0), R.classList.add("kl-loading"), o.style.display = "none";
      try {
        const E = i ? Wt(document.body) : null;
        let M;
        try {
          M = await t.onRetakeSharp();
        } finally {
          E == null || E();
        }
        if (M) {
          const { dataUrl: A, quality: T } = kt(M);
          A && (c[v] = A, p[v] = t.compressImage ? t.compressImage(A) : Promise.resolve(A), s[v] = T ?? "real-pixel", h[v] = !1, se[v] && (delete se[v], Gs.add(v)), delete ke[v], delete V[v]);
        }
      } catch {
      } finally {
        o.style.display = "", We(!1), we();
      }
    }
  }
  function Ys(v) {
    return v.type.startsWith("image/") || /\.(heic|heif|png|jpe?g|gif|webp|bmp|avif|svg)$/i.test(v.name);
  }
  async function jn(v) {
    Wn();
    for (const R of v) {
      if (c.length >= m) {
        mt(`You can attach up to ${m} images.`);
        break;
      }
      if (!Ys(R)) {
        mt(`"${R.name}" isn't an image — only image files can be attached.`);
        continue;
      }
      if (R.size > g) {
        mt(`"${R.name}" is too large — images must be under ${Math.round(g / 1024 / 1024)} MB.`);
        continue;
      }
      try {
        tt(await Fo(R));
      } catch {
        mt(`Couldn't add "${R.name}". Please try a different image.`);
      }
    }
  }
  function Hn() {
    const v = l.getElementById("klavity-files");
    if (!v) return;
    v.innerHTML = "";
    const R = S.filter((E) => ar(E) === "file");
    v.hidden = R.length === 0, S.forEach((E, M) => {
      if (ar(E) !== "file") return;
      const A = document.createElement("div");
      A.className = "kl-file-chip";
      const T = document.createElement("span");
      T.className = "kl-file-ic", T.innerHTML = K("file-text", { size: 14 });
      const _ = document.createElement("span");
      _.className = "kl-file-nm", _.textContent = E.name, _.title = E.name;
      const F = document.createElement("span");
      F.className = "kl-file-sz", F.textContent = E.size < 1024 ? `${E.size} B` : E.size < 1024 * 1024 ? `${Math.round(E.size / 1024)} KB` : `${(E.size / 1024 / 1024).toFixed(1)} MB`;
      const P = document.createElement("button");
      P.type = "button", P.className = "kl-file-rm", P.setAttribute("aria-label", `Remove ${E.name}`), P.title = "Remove", P.innerHTML = K("x", { size: 11 }), P.addEventListener("click", () => {
        Ks(M);
      }), A.append(T, _, F, P);
      const D = en(I);
      if (D != null) {
        const B = document.createElement("div");
        B.className = "kl-att-prog";
        const q = document.createElement("i");
        q.style.width = D + "%", B.appendChild(q), A.appendChild(B);
      }
      v.appendChild(A);
    }), yt();
  }
  function Ks(v) {
    const R = S[v] && ar(S[v]) === "video";
    S.splice(v, 1), ie != null && (R && ie === v ? ie = null : ie > v && (ie -= 1)), Hn(), we();
  }
  function hu(v, R) {
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
        T.className = "kl-capmsg-sent", T.innerHTML = `<span class="kl-capmsg-sent-ic">${K("check")}</span>Request sent to your team`, E.replaceWith(T);
      } else
        E.disabled = !1, E.textContent = M;
    }), E;
  }
  function fu(v, R) {
    const E = l.getElementById("klavity-capmsg");
    if (!E || !v.overCap) return;
    E.innerHTML = "";
    const M = document.createElement("span");
    if (M.className = "kl-capmsg-t", M.textContent = v.message || "", E.appendChild(M), v.cta) {
      const A = hu(v.cta, R);
      if (A && E.appendChild(A), v.cta.hint) {
        const T = document.createElement("span");
        T.className = "kl-capmsg-hint", T.textContent = v.cta.hint, E.appendChild(T);
      }
    }
    E.hidden = !1;
  }
  function mu() {
    const v = l.getElementById("klavity-capmsg");
    v && (v.hidden = !0, v.innerHTML = "");
  }
  async function gu(v) {
    Wn(), mu();
    for (const R of v) {
      if (Ys(R)) {
        await jn([R]);
        continue;
      }
      if (S.length >= b) {
        mt(`You can attach up to ${b} files.`);
        break;
      }
      const E = Lh(R, { capBytes: y, role: C, upgradeUrl: w });
      if (E.overCap) {
        fu(E, {
          page: (typeof location < "u" ? location.href : "") || "",
          fileMeta: { name: R.name, sizeMb: Math.round(R.size / 1024 / 1024 * 10) / 10 }
        });
        continue;
      }
      if (S.reduce((A, T) => A + T.size, 0) + R.size > k) {
        mt(`Attachments exceed the ${Math.round(k / 1024 / 1024)} MB total limit.`);
        break;
      }
      try {
        const A = R.type || (Gl(R) ? Eh(R.name) : ""), T = S.push({ name: R.name, type: A, size: R.size, dataUrl: await Fo(R) }) - 1;
        Hn(), ar(S[T]) === "video" && (ie = T), we();
      } catch {
        mt(`Couldn't add "${R.name}". Please try a different file.`);
      }
    }
  }
  function Vn() {
    Ae || (we(), yt());
  }
  let $t = null;
  function tr(v) {
    var M;
    if (Ae) return;
    Ae = !0, $t == null || $t(), qe && (clearTimeout(qe), qe = null), document.removeEventListener("keydown", Dt, { capture: !0 }), document.removeEventListener("paste", Js);
    try {
      (M = t.onClose) == null || M.call(t, v == null ? void 0 : v.reason);
    } catch {
    }
    const R = l.querySelector(".klavity-modal");
    if (v != null && v.immediate || !R) {
      Ie(o);
      return;
    }
    R.classList.add("kl-closing");
    const E = () => Ie(o);
    R.addEventListener("animationend", E, { once: !0 }), setTimeout(E, 700);
  }
  function Xs(v, R) {
    if (qe || Ae) return;
    const E = document.createElement("div");
    E.className = "klavity-toast-progress", E.style.animationDuration = R + "ms", v.appendChild(E);
    let M = R, A = Date.now();
    const T = () => {
      A = Date.now(), qe = setTimeout(() => {
        tr();
      }, M);
    }, _ = () => {
      qe && (clearTimeout(qe), qe = null, M = Math.max(0, M - (Date.now() - A)), E.style.animationPlayState = "paused");
    }, F = () => {
      qe || v.classList.contains("kl-closing") || (E.style.animationPlayState = "running", T());
    };
    v.addEventListener("mouseenter", _), v.addEventListener("mouseleave", F), v.addEventListener("focusin", _), v.addEventListener("focusout", (P) => {
      v.contains(P.relatedTarget) || F();
    }), T();
  }
  function Dt(v) {
    var R;
    if (v.key === "Escape") {
      v.stopPropagation(), tr();
      return;
    }
    if ((v.key === "s" || v.key === "S") && !v.metaKey && !v.ctrlKey && !v.altKey) {
      const E = typeof v.composedPath == "function" && v.composedPath()[0] || v.target;
      if (E && (E.tagName === "INPUT" || E.tagName === "TEXTAREA" || E.tagName === "SELECT" || E.isContentEditable || ((R = E.getAttribute) == null ? void 0 : R.call(E, "contenteditable")) === "true") || l.querySelector(".kl-edtb")) return;
      const M = l.getElementById("klavity-submit");
      M && !M.disabled && (v.preventDefault(), v.stopPropagation(), M.click());
    }
  }
  document.addEventListener("keydown", Dt, { capture: !0 });
  const Js = (v) => {
    if (!v.clipboardData) return;
    const R = Array.from(v.clipboardData.items).filter((E) => E.type.startsWith("image/")).map((E) => E.getAsFile()).filter((E) => !!E);
    R.length && jn(R);
  };
  document.addEventListener("paste", Js);
  const Gn = () => {
    const v = ee.querySelector("#klavity-desc");
    v && (v.placeholder = be === "feature" ? "Describe the feature you'd like..." : be === "bug" ? "Describe the bug..." : "Describe the issue...");
  };
  if (De) {
    const v = Array.from(ee.querySelectorAll(".kl-type-chip"));
    v.forEach((R) => {
      R.addEventListener("click", () => {
        be = R.getAttribute("data-kind") || "bug", v.forEach((E) => {
          const M = E === R;
          E.classList.toggle("active", M), E.setAttribute("aria-checked", M ? "true" : "false");
        }), Gn();
      });
    });
  } else {
    const v = ee.querySelector(".bug"), R = ee.querySelector(".feat");
    v.addEventListener("click", () => {
      be = "bug", v.classList.add("active"), R.classList.remove("active"), Gn();
    }), R.addEventListener("click", () => {
      be = "feature", R.classList.add("active"), v.classList.remove("active"), Gn();
    });
  }
  let Zs = "project";
  {
    const v = ee.querySelector("#klavity-target");
    if (v) {
      const R = Array.from(v.querySelectorAll(".kl-tgt-opt"));
      for (const E of R)
        E.addEventListener("click", () => {
          Zs = E.dataset.target === "klavity" ? "klavity" : "project";
          for (const A of R) {
            const T = A === E;
            A.classList.toggle("on", T), A.setAttribute("aria-checked", T ? "true" : "false");
          }
        });
    }
  }
  const ne = ee.querySelector("#klavity-desc");
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
    }, R = () => {
      const A = v();
      if (!A || !A.rangeCount) return -1;
      try {
        const T = A.getRangeAt(0);
        if (!ne.contains(T.endContainer)) return -1;
        const _ = T.cloneRange();
        return _.selectNodeContents(ne), _.setEnd(T.endContainer, T.endOffset), _.toString().length;
      } catch {
        return -1;
      }
    }, E = (A) => {
      const T = v();
      if (T)
        try {
          const _ = document.createRange(), F = document.createTreeWalker(ne, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
          let P, D = A, B = !1;
          for (; P = F.nextNode(); ) {
            if (P.nodeName === "BR") {
              if (D === 0) {
                _.setStartBefore(P), B = !0;
                break;
              }
              D -= 1;
              continue;
            }
            if (P.nodeType === 3) {
              const q = (P.textContent || "").length;
              if (D <= q) {
                _.setStart(P, D), B = !0;
                break;
              }
              D -= q;
            }
          }
          B ? _.collapse(!0) : (_.selectNodeContents(ne), _.collapse(!1)), T.removeAllRanges(), T.addRange(_);
        } catch {
        }
    }, M = () => {
      const A = R(), T = $o(ne).replace(/\n$/, "");
      ne.innerHTML = T ? Po(T) : "", A >= 0 && E(A);
    };
    ne.addEventListener("input", M), Object.defineProperty(ne, "value", {
      configurable: !0,
      get() {
        return $o(ne);
      },
      set(A) {
        const T = String(A ?? "").replace(/\n$/, "");
        ne.innerHTML = T ? Po(T) : "";
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
  const zt = ee.querySelector("#klavity-submit"), gt = ee.querySelector("#klavity-remail");
  gt && t.prefillEmail && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t.prefillEmail) && (gt.value = t.prefillEmail);
  const Qs = ee.querySelector("#klavity-desc-hint"), yu = () => !t.requireEmail || !!gt && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(gt.value.trim()), eo = () => c.length > 0 || $ || S.length > 0 || L.length > 0, bu = () => {
  }, yt = () => {
    const v = ne.value.trim() === "";
    zt.disabled = v && !eo() || !yu(), Qs && (Qs.hidden = !(v && eo()));
  };
  if (ne.addEventListener("input", bu), ne.addEventListener("input", yt), gt == null || gt.addEventListener("input", yt), t.onEnhance) {
    const v = t.onEnhance, R = ee.querySelector("#klavity-enhance"), E = ee.querySelector("#klavity-enhance-undo"), M = ee.querySelector("#klavity-enhance-regen"), A = ee.querySelector("#klavity-enhance-spin");
    let T = 0, _ = null;
    const F = () => c[he] || c[0] || "", P = async () => {
      if (ot) return;
      const D = ne.value.trim();
      _ = ne.value;
      const B = ++T;
      R && (R.disabled = !0), A && (A.hidden = !1);
      try {
        const q = Q ? { selector: Q.selector, text: Q.text } : null, W = await v(D, { images: c.length, shot: F(), picked: q });
        if (B !== T || !W) return;
        ne.value = wh(W), Be = W.suggestedSeverity || null, $e = W.suggestedPriority || null, ne.classList.add("kl-just-enhanced"), setTimeout(() => ne.classList.remove("kl-just-enhanced"), 700), E && (E.hidden = !1), M && (M.hidden = !1), yt();
      } catch {
      } finally {
        B === T && (R && (R.disabled = !1), A && (A.hidden = !0));
      }
    };
    R == null || R.addEventListener("click", () => {
      P();
    }), M == null || M.addEventListener("click", () => {
      P();
    }), E == null || E.addEventListener("click", () => {
      _ !== null && (ne.value = _, yt()), _ = null, Be = null, $e = null, E && (E.hidden = !0), M && (M.hidden = !0);
    });
  }
  if (t.onCheckKnown) {
    const v = ee.querySelector("#klavity-known"), R = t.onCheckKnown;
    let E = null, M = 0, A = "";
    const T = () => {
      v && (v.hidden = !0, v.textContent = "");
    }, _ = (P) => {
      var B;
      if (!v) return;
      const D = P.headline ? at(P.headline) : "Already reported";
      v.innerHTML = `<span class="kl-known-ic">${K("check-circle", { size: 15 })}</span><div class="kl-known-body"><span class="kl-known-title">${D}</span> — status: <span class="kl-known-status">${at(P.statusLabel)}</span>. We're already tracking "${at(P.title)}". Add your note and submit anyway — it'll be linked.</div><button type="button" class="kl-known-dismiss" id="klavity-known-dismiss">Dismiss</button>`, v.hidden = !1, (B = v.querySelector("#klavity-known-dismiss")) == null || B.addEventListener("click", () => {
        A = ne.value.trim(), T();
      });
    }, F = async () => {
      const P = ne.value.trim();
      if (P.length < 12 || P === A) {
        T();
        return;
      }
      const D = ++M;
      try {
        const B = await R(P);
        if (D !== M) return;
        if (ne.value.trim() === A) {
          T();
          return;
        }
        B ? _(B) : T();
      } catch {
      }
    };
    ne.addEventListener("input", () => {
      ne.value.trim() !== A && (A = ""), E && clearTimeout(E), E = setTimeout(F, 500);
    });
  }
  if (n.reportClarity) {
    const v = ee.querySelector("#klavity-clarity"), R = ee.querySelector("#klavity-clarity-status"), E = {
      problem: ee.querySelector("#klavity-clarity-problem"),
      expected: ee.querySelector("#klavity-clarity-expected"),
      repro: ee.querySelector("#klavity-clarity-repro")
    }, M = ee.querySelector("#klavity-clarity-tip"), A = ee.querySelector("#klavity-clarity-tip-text"), T = ee.querySelector("#klavity-nudge"), _ = t.onClarityTip, F = /* @__PURE__ */ new Map();
    let P = null, D = 0;
    const B = (Z, te, Se) => {
      if (!Z) return;
      Z.classList.toggle("done", te);
      const et = Z.querySelector(".kl-clr-mark");
      et && (et.innerHTML = te ? K("check", { size: 12 }) : "○"), Z.setAttribute("aria-label", (te ? "covered: " : "missing: ") + Se);
    }, q = () => {
      M && (M.hidden = !0);
    }, W = (Z) => {
      !M || !A || gh(Z) || (A.innerHTML = at(Z) + '<span class="kl-clr-aitag">AI</span>', M.hidden = !1);
    }, Y = () => {
      const Z = ne.value, te = Vl(Z);
      v && (v.hidden = Z.trim().length === 0, v.classList.remove("l1", "l2", "l3"), v.classList.add(te.level === "great" ? "l3" : te.level === "good" ? "l2" : "l1")), R && (R.textContent = te.label), B(E.problem, te.coverage.problem, "What's broken"), B(E.expected, te.coverage.expected, "What you expected"), B(E.repro, te.coverage.repro, "How to reproduce"), T && !T.hidden && (T.hidden = !0), te.level === "great" && q();
    }, fe = () => {
      !_ || !M || (P && clearTimeout(P), P = setTimeout(async () => {
        const Z = ne.value.trim();
        if (!fh(Z)) {
          q();
          return;
        }
        if (F.has(Z)) {
          W(F.get(Z));
          return;
        }
        const te = ++D;
        try {
          const Se = await _(Z, { images: c.length });
          if (te !== D || ne.value.trim() !== Z) return;
          Se && Se.tip && (F.set(Z, Se.tip), W(Se.tip));
        } catch {
        }
      }, 1e3));
    };
    ne.addEventListener("input", () => {
      Y(), fe();
    }), Y(), (co = ee.querySelector("#klavity-nudge-add")) == null || co.addEventListener("click", () => {
      T && (T.hidden = !0);
      try {
        ne.focus();
      } catch {
      }
    }), (uo = ee.querySelector("#klavity-nudge-anyway")) == null || uo.addEventListener("click", () => {
      T && (T.hidden = !0), zt.click();
    });
  }
  er.addEventListener("click", (v) => {
    v.target === er && tr();
  }), (po = ee.querySelector("#klavity-x")) == null || po.addEventListener("click", () => tr()), (ho = ee.querySelector("#klavity-min")) == null || ho.addEventListener("click", () => {
    var v;
    try {
      (v = t.onMinimize) == null || v.call(t);
    } catch {
    }
  });
  const to = () => Array.from(ee.querySelectorAll(".klavity-actions button:not(#klavity-voice)"));
  let ot = !1;
  const We = (v) => {
    ot = v, to().forEach((E) => {
      E.disabled = v;
    }), ne.disabled = v;
    const R = ee.querySelector("#klavity-voice");
    R && (R.disabled = v), ee.querySelectorAll(".kl-htool,.kl-htbtn,.kl-hopt,.kl-hcolor").forEach((E) => {
      E.disabled = v;
    }), l.querySelectorAll("#klavity-title,#klavity-remail,.kl-type-chip,.klavity-toggle button,#klavity-mask-numbers,.kl-file-rm,.klavity-rm,.klavity-mk,.klavity-retake").forEach((E) => {
      E.disabled = v;
    }), v ? ($t == null || $t(), zt.disabled = !0) : (yt(), Kr());
  }, bt = (v) => {
    to().forEach((R) => {
      R.classList.remove("kl-active"), R.removeAttribute("aria-pressed");
    }), v && (v.classList.add("kl-active"), v.setAttribute("aria-pressed", "true"));
  }, Et = ee.querySelector("#klavity-voice");
  if (Et) {
    const E = Et.querySelector(".kl-vring-prog");
    let M = 0, A = 0, T = !1, _;
    const F = () => {
      A = Date.now();
      const ce = () => {
        const Ce = Date.now() - A, Oe = Math.min(Ce / 18e4, 1);
        if (E == null || E.setAttribute("stroke-dashoffset", String(Oe * 81.68)), Ce >= 165e3 && Et.classList.add("kl-voice-warn"), Ce >= 18e4) {
          _.stop();
          return;
        }
        M = requestAnimationFrame(ce);
      };
      M = requestAnimationFrame(ce);
    }, P = () => {
      cancelAnimationFrame(M), E == null || E.setAttribute("stroke-dashoffset", String(81.68)), Et.classList.remove("kl-voice-warn");
    }, D = ee.querySelector("#klavity-voice-status");
    let B = null;
    const q = () => {
      B && (clearTimeout(B), B = null), D && (D.hidden = !0, D.textContent = "", D.classList.remove("kl-vs-info", "kl-vs-err"));
    }, W = (ce, Ce, Oe) => {
      !D || !Ce || (B && (clearTimeout(B), B = null), D.classList.remove("kl-vs-info", "kl-vs-err"), D.classList.add(ce === "err" ? "kl-vs-err" : "kl-vs-info"), D.textContent = Ce, D.hidden = !1, Oe && (B = setTimeout(q, Oe)));
    }, Y = "Recording — tap to stop", fe = () => {
      D && D.classList.contains("kl-vs-info") && q();
    }, Z = (ce) => {
      Et.classList.toggle("kl-voice-rec", ce), Et.setAttribute("aria-pressed", ce ? "true" : "false"), Et.setAttribute("aria-label", ce ? "Stop recording" : "Voice dictation"), Et.title = ce ? Y : "Voice dictation";
    }, te = (ce) => {
      ce.onTranscript = (Ce) => {
        const Oe = ne.value;
        ne.value = Oe + (Oe.length > 0 && !/\s$/.test(Oe) ? " " : "") + Ce, yt();
      }, ce.onStatus = (Ce, Oe) => {
        Ce === "idle" ? fe() : W("info", Oe);
      }, ce.onError = (Ce, Oe) => {
        Oe && W("err", Oe, 4e3);
      }, ce.onStop = () => {
        T = !1, Z(!1), P(), fe();
      };
    }, Se = () => {
      const ce = new Nr();
      return te(ce), ce;
    }, et = () => {
      if (O === "server" && t.onDictate) {
        const ce = new yn({ transcribe: (Ce) => t.onDictate(Ce) });
        return te(ce), ce.onUnavailable = () => {
          if (!T) {
            Z(!1), P(), fe();
            return;
          }
          Nr.isSupported() ? (_ = Se(), W("info", "Reconnecting dictation…"), _.start()) : (T = !1, Z(!1), P(), W("err", "Voice dictation is unavailable right now", 4e3));
        }, ce;
      }
      return Se();
    };
    _ = et(), Et.addEventListener("click", () => {
      T ? _.stop() : (q(), _ = et(), T = !0, Z(!0), _.start(), F());
    }), $t = () => {
      T && _.stop();
    };
  }
  zt.addEventListener("click", async () => {
    if (ot || zt.disabled) return;
    const v = ne.value.trim(), R = ee.querySelector("#klavity-title"), E = R ? R.value.trim() : "", M = be === "feature" ? "feature" : "bug", A = p.slice(), T = pe(), _ = S.slice(), F = L.slice(), P = be, D = (gt == null ? void 0 : gt.value.trim()) || void 0;
    We(!0), zt.textContent = "Uploading…";
    const B = l.getElementById("klavity-err");
    B.style.display = "none";
    const q = l.getElementById("klavity-progress"), W = l.getElementById("klavity-progress-fill");
    q && W && (q.classList.add("show"), W.style.transition = "none", W.style.width = "8%", W.offsetWidth, W.style.transition = "width 10s cubic-bezier(.05,.7,.2,1)", requestAnimationFrame(() => {
      W.style.width = "90%";
    }));
    const Y = () => {
      W && (W.style.transition = "width .25s ease", W.style.width = "100%");
    }, fe = () => {
      q && W && (q.classList.remove("show"), W.style.transition = "none", W.style.width = "0");
    };
    try {
      const Z = await Promise.all(A), te = {
        type: M,
        ...De ? { kind: P } : {},
        ...E ? { title: E } : {},
        description: v,
        screenshots: Z,
        ..._.length ? { files: _ } : {},
        ...F.length ? { recordings: F } : {},
        annotations: T,
        reporterEmail: D,
        // KLA submit-target: ride the reporter's destination choice through onSubmit. Only present when the
        // segmented control was rendered (cfg.submitTargetToggle !== false); default 'project' (never surprise-
        // route to Klavity). The server resolves the real Klavity intake project — the client only says 'klavity'.
        ...n.submitTargetToggle !== !1 ? { feedbackTarget: Zs } : {},
        // KLA-586: ride the accepted AI-Enhance draft's severity/priority as structured fields (cleared on Undo).
        ...Be ? { suggestedSeverity: Be } : {},
        ...$e ? { suggestedPriority: $e } : {}
      };
      if (t.backgroundUpload) {
        t.onSubmit(te), tr({ immediate: !0, reason: "submitted" });
        return;
      }
      const Se = await t.onSubmit(te);
      if (Ae) return;
      Y(), t.success ? Mu(Se.issueKey, Se.issueUrl, t.success) : Eu(Se.issueKey, Se.issueUrl);
    } catch (Z) {
      fe();
      const te = (Z == null ? void 0 : Z.message) || "Unknown error";
      try {
        console.error("[Klavity] submit failed:", Z);
      } catch {
      }
      B.textContent = n.debug ? `Couldn't submit your report — ${te}` : "Couldn't submit your report. Please check your connection and try again.", B.style.display = "block", zt.textContent = "Submit", We(!1);
    }
  });
  function vu(v, R) {
    const { dataUrl: E, quality: M, suggestSharp: A } = kt(R);
    if (!E) return;
    const T = c.indexOf(v);
    T < 0 || (c[T] = E, p[T] = t.compressImage ? t.compressImage(E) : Promise.resolve(E), s[T] = M, h[T] = !!A && M !== "real-pixel", se[T] && delete se[T], delete ke[T], delete V[T], we());
  }
  async function ku(v) {
    if (!t.onCaptureViewport) return !1;
    let R = null;
    const E = i ? Wt(document.body) : null;
    try {
      const { dataUrl: M } = kt(await t.onCaptureViewport());
      M && (R = M, a = !1, tt(M, "rendered", void 0, !0, !1), v && bt(v));
    } catch {
    } finally {
      E == null || E();
    }
    return (async () => {
      const M = i ? Wt(document.body) : null;
      try {
        const A = await t.onCaptureFull();
        if (R) vu(R, A);
        else {
          a = !1;
          const { dataUrl: T, quality: _, suggestSharp: F } = kt(A);
          T && (tt(T, _, void 0, !0, !!F), v && bt(v));
        }
      } catch {
        a = !1, we();
      } finally {
        M == null || M();
      }
    })(), !0;
  }
  async function ro(v) {
    if (!t.onCaptureViewport) return !1;
    const R = i ? Wt(document.body) : null;
    try {
      const { dataUrl: E } = kt(await t.onCaptureViewport());
      E ? (a = !1, tt(E, "rendered", void 0, !0, !1)) : (a = !1, we());
    } catch {
      a = !1, we();
    } finally {
      R == null || R();
    }
    return !0;
  }
  const Ft = ee.querySelector("#klavity-full");
  Ft.addEventListener("click", async () => {
    if (!ot) {
      We(!0), Ft.classList.add("kl-loading");
      try {
        if (t.onCaptureViewport) {
          await ku(Ft);
          return;
        }
        const v = i ? Wt(document.body) : null;
        try {
          const { dataUrl: R, quality: E, suggestSharp: M } = kt(await t.onCaptureFull());
          tt(R, E, void 0, !0, !!M), bt(Ft);
        } finally {
          v == null || v();
        }
      } catch {
      } finally {
        Ft.classList.remove("kl-loading"), We(!1);
      }
    }
  });
  async function no(v) {
    const R = v != null && v.viewport && t.onCaptureSharpViewport ? t.onCaptureSharpViewport : t.onCaptureSharp;
    if (ot || !R || !ye) return !1;
    const E = ye.querySelector(".kl-sharp-label");
    We(!0), ye.classList.add("kl-loading"), o.style.display = "none";
    const M = E ?? ye, A = M.textContent;
    M.textContent = "Capturing…";
    let T = !1;
    try {
      const _ = i ? Wt(document.body) : null;
      let F;
      try {
        F = await R();
      } finally {
        _ == null || _();
      }
      if (F) {
        const { dataUrl: P, quality: D } = kt(F);
        P && (tt(P, D ?? "real-pixel"), bt(ye), T = !0);
      }
    } catch (_) {
      if (Sh(_))
        try {
          uu();
        } catch {
        }
      else
        try {
          console.warn("[Klavity] Screen capture failed; using rendered fallback:", _);
        } catch {
        }
    } finally {
      o.style.display = "", M.textContent = A, ye.classList.remove("kl-loading"), We(!1);
    }
    return T;
  }
  ye && t.onCaptureSharp && ye.addEventListener("click", () => {
    no();
  });
  const io = ee.querySelector("#klavity-file"), so = ee.querySelector("#klavity-upload");
  so.addEventListener("click", () => {
    if (!ot) {
      if (!x && c.length >= m) {
        mt(`You can attach up to ${m} images.`);
        return;
      }
      io.click();
    }
  }), io.addEventListener("change", async (v) => {
    const R = v.target, E = R.files ? Array.from(R.files) : [];
    if (R.value = "", !E.length) return;
    const M = c.length, A = S.length;
    x ? await gu(E) : await jn(E), (c.length > M || S.length > A) && bt(so);
  });
  const Ar = l.getElementById("klavity-record");
  Ar && t.onRecord && Ar.addEventListener("click", async () => {
    if (ot) return;
    if (L.length >= H) {
      mt(`You can attach up to ${H} recordings.`);
      return;
    }
    We(!0), Ar.classList.add("kl-loading");
    const v = (R) => {
      o.style.display = R === "recording" ? "none" : "";
    };
    try {
      const R = await t.onRecord(v);
      R && (L.push(R), X = L.length - 1, ie = null, Vn(), bt(Ar));
    } catch {
    } finally {
      o.style.display = "", Ar.classList.remove("kl-loading"), We(!1);
    }
  });
  const Yn = l.getElementById("klavity-region");
  Yn && t.onRegionCapture && (Yn.onclick = () => {
    ot || (We(!0), document.removeEventListener("keydown", Dt, { capture: !0 }), o.style.display = "none", Oh(async (v) => {
      document.addEventListener("keydown", Dt, { capture: !0 });
      try {
        const R = i ? Wt(document.body) : null;
        let E;
        try {
          E = await t.onRegionCapture(v);
        } finally {
          R == null || R();
        }
        if (E) {
          const { dataUrl: M, quality: A, suggestSharp: T } = kt(E);
          M && (tt(M, A, void 0, !0, !!T), bt(Yn));
        }
      } finally {
        o.style.display = "", We(!1);
      }
    }, () => {
      document.addEventListener("keydown", Dt, { capture: !0 }), o.style.display = "", We(!1);
    }));
  });
  const rr = l.getElementById("klavity-pick"), nr = l.getElementById("klavity-pickinfo"), oo = () => {
    var E;
    if (rr && (rr.classList.toggle("kl-active", !!Q), Q ? rr.setAttribute("aria-pressed", "true") : rr.removeAttribute("aria-pressed")), !nr) return;
    if (!Q) {
      nr.hidden = !0, nr.innerHTML = "";
      return;
    }
    nr.hidden = !1;
    const { text: v } = Q, R = v ? `: <span class="kl-pick-txt">${at(v)}</span>` : "";
    nr.innerHTML = `<span class="kl-pick-ic">${K("mouse-pointer-2", { size: 13 })}</span><span>Element pinned${R}</span><button type="button" class="kl-pick-clear" id="klavity-pick-clear">Clear</button>`, (E = nr.querySelector("#klavity-pick-clear")) == null || E.addEventListener("click", () => {
      Q = null, oo();
    });
  };
  rr && t.onPickElement && (rr.onclick = async () => {
    if (!ot) {
      We(!0), document.removeEventListener("keydown", Dt, { capture: !0 }), o.style.display = "none";
      try {
        const v = await t.onPickElement();
        v && (Q = v, oo(), v.shot && tt(v.shot, v.shotQuality, void 0, !0));
      } catch {
      } finally {
        document.addEventListener("keydown", Dt, { capture: !0 }), o.style.display = "", We(!1);
      }
    }
  });
  function Mt(v, R = 15) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${R}" height="${R}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em">${v}</svg>`;
  }
  function wu(v) {
    const R = (M, A, T, _) => `<button type="button" class="kl-htool" data-tool="${M}" title="${A} (${_.toUpperCase()})" aria-label="${A}">${T}<span class="kl-hk">${_.toUpperCase()}</span></button>`, E = (M) => `<button type="button" class="kl-hcolor" data-color="${M}" style="background:${M}" title="${M}" aria-label="Colour ${M}"></button>`;
    return (
      // Redaction controls grouped at the TOP of the editing toolbar: the "Mask numbers" toggle (masks digits
      // in fresh captures) sits alongside the Pixelate brush (drag to mosaic-redact a region of this image).
      `<label class="kl-hmask" title="Mask numbers in new screen captures"><input type="checkbox" class="kl-hmask-cb"${i ? " checked" : ""}>${K("eye-off", { size: 13 })}<span>Mask numbers</span></label><span class="kl-hsep"></span>` + R("pen", "Pen", K("pencil", { size: 15 }), "p") + R("line", "Line", Mt('<line x1="5" y1="19" x2="19" y2="5"/>'), "l") + R("rect", "Rectangle", K("square", { size: 15 }), "r") + R("circle", "Circle", Mt('<circle cx="12" cy="12" r="9"/>'), "o") + R("arrow", "Arrow", Mt('<line x1="5" y1="19" x2="19" y2="5"/><polyline points="10 5 19 5 19 14"/>'), "a") + R("text", "Text", Mt('<path d="M5 6h14M12 6v13M9 19h6"/>'), "t") + R("count", "Numbers", Mt('<circle cx="12" cy="12" r="9"/><text x="12" y="16" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor" stroke="none">1</text>'), "c") + R("pixelate", "Redact (pixelate)", Mt('<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>'), "b") + R("crop", "Crop", Mt('<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>'), "k") + '<span class="kl-hsep"></span>' + E("#ef4444") + E("#f97316") + E("#3b82f6") + E("#111827") + // Line-width control (applies to pen/line/rect/circle/arrow strokes via Annotator.strokeScale).
      // The "Stroke" label + S/M/L/XL sizes live in ONE non-wrapping group so the label always reads with
      // its options as a single control (never label-here / sizes-on-a-separate-row at the narrow width).
      `<span class="kl-hsep"></span><span class="kl-hgroup"><span class="kl-hlabel">Stroke</span><button type="button" class="kl-hopt" data-stroke="0.6" title="Thin stroke" aria-label="Thin stroke">S</button><button type="button" class="kl-hopt kl-on" data-stroke="1" title="Medium stroke" aria-label="Medium stroke">M</button><button type="button" class="kl-hopt" data-stroke="1.8" title="Thick stroke" aria-label="Thick stroke">L</button><button type="button" class="kl-hopt" data-stroke="2.8" title="Extra-thick stroke" aria-label="Extra-thick stroke">XL</button></span><span class="kl-htextopts" id="kl-hero-textopts" hidden><span class="kl-hsep"></span><span class="kl-hlabel">Outline</span><button type="button" class="kl-hopt kl-on" data-outline="black" title="Black outline"><span class="kl-osq" style="background:#111"></span></button><button type="button" class="kl-hopt" data-outline="white" title="White outline"><span class="kl-osq" style="background:#fff;border:1px solid #999"></span></button><button type="button" class="kl-hopt" data-outline="none" title="No outline">None</button><span class="kl-hlabel">Size</span><button type="button" class="kl-hopt" data-size="18" title="Small">S</button><button type="button" class="kl-hopt kl-on" data-size="26" title="Medium">M</button><button type="button" class="kl-hopt" data-size="40" title="Large">L</button></span><span class="kl-hsep"></span><button type="button" class="kl-htbtn" id="kl-hero-undo" title="Undo (Cmd+Z / Ctrl+Z)" aria-label="Undo">${Mt('<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>', 14)}</button>` + // #449: explicit "Revert crop" — shown only after a crop on this image (visibility driven by the
      // per-image crop stack). Reverts the most recent crop to its pre-crop image + original markup.
      (v ? `<button type="button" class="kl-htbtn kl-hrevert" id="kl-hero-revert" title="Revert crop to original" aria-label="Revert crop">${Mt('<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 5 5v2"/>', 14)}<span class="kl-hk kl-hrevert-lbl">Revert</span></button>` : "") + `<button type="button" class="kl-htbtn" id="kl-hero-clear" title="Clear" aria-label="Clear">${K("trash-2", { size: 14 })}</button><span class="kl-hgrow"></span><span class="kl-hhint">scroll to zoom · shift-drag to pan</span>`
    );
  }
  function Tr() {
    Ye && (document.removeEventListener("keydown", Ye, { capture: !0 }), Ye = null);
  }
  function Kn() {
    const v = l.getElementById("klavity-hero-stage"), R = l.getElementById("klavity-hero-tools");
    R && (R.innerHTML = ""), v && (v.innerHTML = `<div class="kl-hero-empty">${K("image", { size: 34 })}<span>Capture or upload a screenshot to start marking it up</span></div>`), Tr();
  }
  function ao() {
    var v;
    if (ie != null && !(S[ie] && ar(S[ie]) === "video") && (ie = null), X != null && !L[X] && (X = null), X != null) {
      lo(L[X].dataUrl);
      return;
    }
    if (ie != null) {
      lo((v = S[ie]) == null ? void 0 : v.dataUrl);
      return;
    }
    if (c.length === 0) {
      he = 0, Kn();
      return;
    }
    he >= c.length && (he = c.length - 1), he < 0 && (he = 0), Su(he);
  }
  function lo(v) {
    const R = l.getElementById("klavity-hero-stage"), E = l.getElementById("klavity-hero-tools");
    if (!R || !v) {
      Kn();
      return;
    }
    Tr(), E && (E.innerHTML = ""), R.innerHTML = "";
    const M = document.createElement("video");
    M.src = v, M.controls = !0, M.setAttribute("playsinline", ""), M.preload = "metadata", M.className = "kl-hero-video", M.style.cssText = "display:block;max-width:100%;max-height:100%;border-radius:8px;background:#000;box-shadow:0 12px 40px rgba(0,0,0,.5);", R.appendChild(M);
  }
  function xu(v, R, E, M, A) {
    const T = c[v];
    if (!T) return;
    const _ = new Image();
    _.onload = () => {
      var Y, fe;
      if (c[v] !== T) return;
      const F = document.createElement("canvas");
      F.width = Math.max(1, Math.round(M)), F.height = Math.max(1, Math.round(A));
      const P = F.getContext("2d");
      if (!P) return;
      P.drawImage(_, R, E, M, A, 0, 0, F.width, F.height);
      let D;
      try {
        D = F.toDataURL("image/png");
      } catch {
        return;
      }
      const B = ((Y = ke[v]) == null ? void 0 : Y.length) ?? 0, q = me(v);
      c[v] = D, p[v] = t.compressImage ? t.compressImage(D) : Promise.resolve(D);
      const W = (fe = se[v]) == null ? void 0 : fe.shapes;
      Array.isArray(W) && W.length ? se[v] = { w: F.width, h: F.height, shapes: kh(W, -R, -E) } : delete se[v], (ke[v] ?? (ke[v] = [])).push(q), (V[v] ?? (V[v] = [])).push({ snap: q, mark: B }), we();
    }, _.src = T;
  }
  function Su(v) {
    var P, D, B, q, W;
    const R = l.getElementById("klavity-hero-stage"), E = l.getElementById("klavity-hero-tools");
    if (!R || !E) return;
    const M = c[v];
    if (!M) {
      Kn();
      return;
    }
    Tr(), R.innerHTML = "";
    const A = document.createElement("canvas");
    A.width = 1, A.height = 1, A.style.cssText = "display:block;max-width:100%;max-height:100%;object-fit:contain;cursor:crosshair;touch-action:none;background:#fff;border-radius:8px;box-shadow:0 12px 40px rgba(0,0,0,.5);";
    const T = new Lo(A, M), _ = (P = se[v]) == null ? void 0 : P.shapes;
    Array.isArray(_) && _.forEach((Y) => T.shapes.push({ ...Y })), R.appendChild(A);
    const F = new Image();
    F.onload = () => {
      !document.body.contains(o) || he !== v || c[v] !== M || (A.width = F.naturalWidth || 1, A.height = F.naturalHeight || 1, T.redraw());
    }, F.src = M, T.redraw();
    {
      E.innerHTML = wu((((D = V[v]) == null ? void 0 : D.length) ?? 0) > 0);
      let Y = "pen", fe = "#ef4444", Z = 26, te = "black", Se = null;
      const et = E.querySelector("#kl-hero-textopts"), ce = () => {
        T.shapes.length ? se[v] = { w: A.width, h: A.height, shapes: T.shapes.map((z) => ({ ...z })) } : delete se[v];
      }, Ce = (z) => {
        Y = z, E.querySelectorAll("[data-tool]").forEach((j) => j.classList.toggle("kl-on", j.dataset.tool === z)), et && (et.hidden = z !== "text");
      }, Oe = (z, j) => {
        fe = z, E.querySelectorAll("[data-color]").forEach((re) => re.classList.toggle("kl-on", re === j));
      };
      E.querySelectorAll("[data-tool]").forEach((z) => z.addEventListener("click", () => Ce(z.dataset.tool))), E.querySelectorAll("[data-color]").forEach((z) => z.addEventListener("click", () => Oe(z.dataset.color, z)));
      const ir = E.querySelector(".kl-hmask-cb");
      ir && ir.addEventListener("change", () => {
        i = ir.checked;
      }), E.querySelectorAll("[data-outline]").forEach((z) => z.addEventListener("click", () => {
        te = z.dataset.outline, E.querySelectorAll("[data-outline]").forEach((j) => j.classList.toggle("kl-on", j === z));
      })), E.querySelectorAll("[data-size]").forEach((z) => z.addEventListener("click", () => {
        Z = Number(z.dataset.size), E.querySelectorAll("[data-size]").forEach((j) => j.classList.toggle("kl-on", j === z));
      })), E.querySelectorAll("[data-stroke]").forEach((z) => z.addEventListener("click", () => {
        T.strokeScale = Number(z.dataset.stroke) || 1, E.querySelectorAll("[data-stroke]").forEach((j) => j.classList.toggle("kl-on", j === z)), T.redraw();
      })), (B = E.querySelector("#kl-hero-undo")) == null || B.addEventListener("click", () => {
        ge(v);
      }), (q = E.querySelector("#kl-hero-revert")) == null || q.addEventListener("click", () => {
        Mr(v);
      }), (W = E.querySelector("#kl-hero-clear")) == null || W.addEventListener("click", () => {
        ve(v), T.clearAll(), ce();
      }), Ce(Y), Oe(fe, E.querySelector("[data-color]"));
      const Ut = (z) => {
        const j = A.getBoundingClientRect(), re = Math.min(j.width / A.width, j.height / A.height) || 1, _e = A.width * re, Ne = A.height * re, je = (j.width - _e) / 2, vt = (j.height - Ne) / 2;
        return { x: (z.clientX - j.left - je) / re, y: (z.clientY - j.top - vt) / re };
      }, Lr = () => {
        const z = A.getBoundingClientRect();
        return Math.min(z.width / A.width, z.height / A.height) || 1;
      }, Ir = (z, j, re, _e, Ne, je) => z === "line" ? { type: "line", color: je, x1: j, y1: re, x2: _e, y2: Ne } : z === "arrow" ? { type: "arrow", color: je, x1: j, y1: re, x2: _e, y2: Ne } : z === "rect" ? { type: "rect", color: je, x: Math.min(j, _e), y: Math.min(re, Ne), w: Math.abs(_e - j), h: Math.abs(Ne - re) } : z === "circle" ? { type: "circle", color: je, x: (j + _e) / 2, y: (re + Ne) / 2, rx: Math.abs(_e - j) / 2, ry: Math.abs(Ne - re) / 2 } : z === "pixelate" ? { type: "pixelate", x: Math.min(j, _e), y: Math.min(re, Ne), w: Math.abs(_e - j), h: Math.abs(Ne - re) } : null;
      let G = 1, ae = 0, Ee = 0, Rt = null;
      const Ru = (z) => Math.min(6, Math.max(1, z)), Xn = () => {
        if (G === 1) {
          ae = 0, Ee = 0, A.style.transform = "", A.style.cursor = "crosshair";
          return;
        }
        A.style.transformOrigin = "0 0", A.style.transform = `translate(${ae}px,${Ee}px) scale(${G})`, A.style.cursor = "grab";
      }, Au = (z, j, re) => {
        if (G === 1) {
          const vt = A.style.transform;
          A.style.transform = "", Rt = A.getBoundingClientRect(), A.style.transform = vt;
        }
        if (!Rt) return;
        const _e = G;
        if (G = Ru(G * re), G === _e) return;
        const Ne = (z - Rt.left - ae) / _e, je = (j - Rt.top - Ee) / _e;
        ae = z - Rt.left - G * Ne, Ee = j - Rt.top - G * je, Xn();
      };
      R.addEventListener("wheel", (z) => {
        Y !== "crop" && (z.preventDefault(), Au(z.clientX, z.clientY, z.deltaY < 0 ? 1.18 : 1 / 1.18));
      }, { passive: !1 }), R.addEventListener("dblclick", () => {
        G = 1, Xn();
      });
      let Tu = T.shapes.reduce((z, j) => j.type === "count" ? Math.max(z, j.n) : z, 0), Bt = !1, Ke = 0, Xe = 0, qt = [], sr = !1, fo = 0, mo = 0, go = 0, yo = 0, Je = null, Or = { x: 0, y: 0 };
      A.addEventListener("pointerdown", (z) => {
        if (z.shiftKey && G > 1) {
          sr = !0, fo = z.clientX, mo = z.clientY, go = ae, yo = Ee, A.style.cursor = "grabbing";
          try {
            A.setPointerCapture(z.pointerId);
          } catch {
          }
          z.preventDefault();
          return;
        }
        const j = Ut(z);
        if (Ke = j.x, Xe = j.y, Y === "crop") {
          Bt = !0;
          try {
            A.setPointerCapture(z.pointerId);
          } catch {
          }
          Or = { x: z.clientX, y: z.clientY }, Je = document.createElement("div"), Je.style.cssText = "position:absolute;border:2px dashed #6c63ff;background:rgba(108,99,255,.14);pointer-events:none;z-index:6;left:0;top:0;width:0;height:0;", R.appendChild(Je);
          return;
        }
        if (Y === "text") {
          const re = document.createElement("input"), _e = te === "none" ? "none" : `0 0 2px ${te}, 0 0 2px ${te}`, Ne = Lr(), je = Math.max(6, Z * Ne), vt = Z, or = te;
          re.style.cssText = `position:fixed;left:${z.clientX}px;top:${z.clientY}px;padding:0;margin:0;line-height:1;box-sizing:content-box;background:transparent;border:0;color:${fe};font-size:${je}px;font-family:sans-serif;font-weight:700;text-shadow:${_e};outline:1px dashed ${fe};z-index:2147483647;min-width:80px;`, document.body.appendChild(re), Se = re, requestAnimationFrame(() => {
            document.body.contains(re) && re.focus();
          }), re.addEventListener("blur", () => {
            Se = null, re.value.trim() && (ve(v), T.addShape({ type: "text", color: fe, x: Ke, y: Xe, text: re.value.trim(), size: vt, outline: or }), ce()), Ie(re);
          }, { once: !0 }), re.addEventListener("keydown", (Jn) => {
            Jn.key === "Enter" && re.blur(), Jn.key === "Escape" && (re.value = "", re.blur()), Jn.stopPropagation();
          });
          return;
        }
        if (Y === "count") {
          ve(v), T.addShape({ type: "count", color: fe, x: j.x, y: j.y, n: ++Tu }), ce();
          return;
        }
        Bt = !0;
        try {
          A.setPointerCapture(z.pointerId);
        } catch {
        }
        Y === "pen" && (qt = [j]);
      }), A.addEventListener("pointermove", (z) => {
        if (sr) {
          ae = go + (z.clientX - fo), Ee = yo + (z.clientY - mo), Xn(), A.style.cursor = "grabbing";
          return;
        }
        if (!Bt) return;
        if (Y === "pen") {
          qt.push(Ut(z)), qt.length > 1 && T.drawPreview({ type: "pen", color: fe, points: qt });
          return;
        }
        if (Y === "crop" && Je) {
          const _e = R.getBoundingClientRect(), Ne = Math.min(Or.x, z.clientX), je = Math.min(Or.y, z.clientY), vt = Math.max(Or.x, z.clientX), or = Math.max(Or.y, z.clientY);
          Je.style.left = Ne - _e.left + "px", Je.style.top = je - _e.top + "px", Je.style.width = vt - Ne + "px", Je.style.height = or - je + "px";
          return;
        }
        const j = Ut(z), re = Ir(Y, Ke, Xe, j.x, j.y, fe);
        re && T.drawPreview(re);
      }), A.addEventListener("pointerup", (z) => {
        if (sr) {
          sr = !1, A.style.cursor = G > 1 ? "grab" : "crosshair";
          try {
            A.releasePointerCapture(z.pointerId);
          } catch {
          }
          return;
        }
        if (!Bt) return;
        Bt = !1;
        try {
          A.releasePointerCapture(z.pointerId);
        } catch {
        }
        const j = Ut(z);
        if (Y === "crop") {
          Je && (Ie(Je), Je = null);
          const Ne = Math.max(0, Math.min(Ke, j.x)), je = Math.max(0, Math.min(Xe, j.y)), vt = Math.abs(j.x - Ke), or = Math.abs(j.y - Xe);
          vt > 4 && or > 4 && xu(v, Ne, je, vt, or);
          return;
        }
        const re = Y === "pixelate" && Math.abs(j.x - Ke) > 4 && Math.abs(j.y - Xe) > 4;
        (Y === "pen" && qt.length > 1 || Y === "line" || Y === "rect" || Y === "circle" || Y === "arrow" || re) && ve(v), Y === "pen" && qt.length > 1 ? T.addShape({ type: "pen", color: fe, points: qt }) : Y === "line" ? T.addShape({ type: "line", color: fe, x1: Ke, y1: Xe, x2: j.x, y2: j.y }) : Y === "rect" ? T.addShape({ type: "rect", color: fe, x: Math.min(Ke, j.x), y: Math.min(Xe, j.y), w: Math.abs(j.x - Ke), h: Math.abs(j.y - Xe) }) : Y === "circle" ? T.addShape({ type: "circle", color: fe, x: (Ke + j.x) / 2, y: (Xe + j.y) / 2, rx: Math.abs(j.x - Ke) / 2, ry: Math.abs(j.y - Xe) / 2 }) : Y === "arrow" ? T.addShape({ type: "arrow", color: fe, x1: Ke, y1: Xe, x2: j.x, y2: j.y }) : re && T.addShape({ type: "pixelate", x: Math.min(Ke, j.x), y: Math.min(Xe, j.y), w: Math.abs(j.x - Ke), h: Math.abs(j.y - Xe) }), ce();
      }), A.addEventListener("pointercancel", (z) => {
        try {
          A.releasePointerCapture(z.pointerId);
        } catch {
        }
        Je && (Ie(Je), Je = null), sr && (sr = !1, A.style.cursor = G > 1 ? "grab" : "crosshair"), Bt && (Bt = !1, T.redraw());
      });
      const bo = { p: "pen", l: "line", r: "rect", o: "circle", a: "arrow", t: "text", c: "count", b: "pixelate", k: "crop" };
      Ye = (z) => {
        if (!document.body.contains(o)) {
          Tr();
          return;
        }
        if (Se && document.body.contains(Se)) return;
        const j = typeof z.composedPath == "function" && z.composedPath()[0] || z.target;
        if (j && (j.tagName === "INPUT" || j.tagName === "TEXTAREA" || j.tagName === "SELECT" || j.isContentEditable)) return;
        if ((z.metaKey || z.ctrlKey) && z.key.toLowerCase() === "z") {
          z.preventDefault(), ge(v);
          return;
        }
        if (z.metaKey || z.ctrlKey || z.altKey) return;
        const re = z.key.toLowerCase();
        bo[re] && (z.preventDefault(), Ce(bo[re]));
      }, document.addEventListener("keydown", Ye, { capture: !0 });
    }
  }
  function Cu(v) {
    const R = c[v], E = new Image();
    E.onload = () => {
      const M = document.createElement("canvas");
      M.width = E.naturalWidth, M.height = E.naturalHeight;
      const A = new Lo(M, R);
      A.redraw();
      const T = document.createElement("div");
      T.style.cssText = "position:fixed;inset:0;background:#000;z-index:2147483647;display:flex;flex-direction:column;pointer-events:all;";
      const _ = document.createElement("div");
      _.className = "kl-edtb", _.style.cssText = "display:flex;align-items:center;gap:8px;padding:8px;background:#1e1e2e;flex-wrap:wrap;", _.innerHTML = `
        <button data-tool="pen" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${K("pencil", { size: 14 })} Pen</button>
        <button data-tool="rect" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${K("square", { size: 14 })} Rect</button>
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
        <button id="klavity-clear-ann" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${K("trash-2", { size: 14 })} Clear</button>
        <button id="klavity-save-ann" style="padding:6px 10px;background:#89b4fa;color:#1e1e2e;border:none;border-radius:4px;cursor:pointer;font-weight:700;">${K("check", { label: "Save", size: 14 })} Save</button>
        <button id="klavity-cancel-ann" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${K("x", { size: 14 })}</button>
      `, M.style.cssText = "cursor:crosshair;display:block;margin:12px auto;touch-action:none;background:#fff;border-radius:4px;outline:1px solid rgba(255,255,255,.12);outline-offset:-1px;box-shadow:0 12px 44px rgba(0,0,0,.55);";
      const F = document.createElement("div");
      F.style.cssText = "flex:1;min-height:0;overflow:auto;display:block;box-shadow:inset 0 1px 0 rgba(255,255,255,.04);", F.appendChild(M);
      const P = document.createElement("style");
      P.textContent = ".kl-edtb button{transition:transform .15s cubic-bezier(.34,1.56,.64,1),background .15s ease;will-change:transform;}.kl-edtb button:hover{transform:translateY(-1px) scale(1.02);background:#45475a;}.kl-edtb button[data-color]:hover{transform:scale(1.14);background:initial;}.kl-edtb button:active{transform:scale(.96);}.kl-edtb button:focus-visible{outline:2px solid #89b4fa;outline-offset:2px;}.kl-edtb .kl-zb{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:34px;padding:0 9px;background:#313244;color:#cdd6f4;border:none;border-radius:8px;cursor:pointer;font-size:15px;font-weight:600;line-height:1;}.kl-edtb .kl-zb:hover{background:#45475a;}@media (prefers-reduced-motion:reduce){.kl-edtb button{transition:none;}.kl-edtb button:hover,.kl-edtb button:active,.kl-edtb button[data-color]:hover{transform:none;}}", T.append(P, _, F), l.appendChild(T), Tr();
      let D = 1;
      const B = (G) => Math.max(0.05, Math.min(5, G || 1));
      function q(G) {
        D = B(G), M.style.width = Math.round(M.width * D) + "px", M.style.height = Math.round(M.height * D) + "px";
        const ae = _.querySelector("#klavity-zoom-pct");
        ae && (ae.textContent = Math.round(D * 100) + "%");
      }
      const W = () => Math.max(1, F.clientWidth - 24) / M.width, Y = () => Math.min(Math.max(1, F.clientWidth - 24) / M.width, Math.max(1, F.clientHeight - 24) / M.height), fe = M.height / M.width > Math.max(1, F.clientHeight) / Math.max(1, F.clientWidth);
      q(fe ? W() : Y()), _.querySelector("#klavity-zoom-in").addEventListener("click", () => q(D * 1.25)), _.querySelector("#klavity-zoom-out").addEventListener("click", () => q(D / 1.25)), _.querySelector("#klavity-fit-width").addEventListener("click", () => q(W())), _.querySelector("#klavity-fit-page").addEventListener("click", () => q(Y()));
      let Z = "rect", te = "#ef4444", Se = !1, et = [], ce = 0, Ce = 0;
      function Oe(G) {
        Z = G, _.querySelectorAll("[data-tool]").forEach((ae) => {
          const Ee = ae.dataset.tool === G;
          ae.style.background = Ee ? "#585b70" : "#313244", ae.style.outline = Ee ? "2px solid #89b4fa" : "none";
        });
      }
      _.querySelectorAll("[data-tool]").forEach((G) => G.addEventListener("click", () => Oe(G.dataset.tool))), _.querySelectorAll("[data-color]").forEach((G) => G.addEventListener("click", () => {
        te = G.dataset.color;
      })), _.querySelector("#klavity-undo").addEventListener("click", () => A.undo()), _.querySelector("#klavity-clear-ann").addEventListener("click", () => A.clearAll());
      const ir = { p: "pen", r: "rect", c: "circle", a: "arrow", t: "text" };
      function Ut(G) {
        const ae = G.target;
        if (ae && (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA" || ae.isContentEditable)) return;
        if (G.key === "Escape") {
          G.stopPropagation(), Lr();
          return;
        }
        if ((G.metaKey || G.ctrlKey) && G.key.toLowerCase() === "z") {
          G.preventDefault(), A.undo();
          return;
        }
        if (G.metaKey || G.ctrlKey || G.altKey) return;
        const Ee = G.key.toLowerCase();
        ir[Ee] ? (G.preventDefault(), Oe(ir[Ee])) : Ee === "u" && (G.preventDefault(), A.undo());
      }
      function Lr() {
        document.removeEventListener("keydown", Ut, { capture: !0 }), Ie(T), ao();
      }
      document.addEventListener("keydown", Ut, { capture: !0 }), Oe(Z), _.querySelector("#klavity-save-ann").addEventListener("click", async () => {
        ve(v), A.shapes.length ? se[v] = { w: M.width, h: M.height, shapes: A.shapes.map((G) => ({ ...G })) } : delete se[v], Lr(), we();
      }), _.querySelector("#klavity-cancel-ann").addEventListener("click", () => Lr());
      function Ir(G) {
        const ae = M.getBoundingClientRect();
        return { x: (G.clientX - ae.left) / ae.width * M.width, y: (G.clientY - ae.top) / ae.height * M.height };
      }
      M.addEventListener("pointerdown", (G) => {
        Se = !0;
        const ae = Ir(G);
        if ({ x: ce, y: Ce } = ae, Z === "pen" && (et = [ae]), Z === "text") {
          Se = !1;
          const Ee = document.createElement("input");
          Ee.style.cssText = `position:fixed;left:${G.clientX}px;top:${G.clientY}px;background:transparent;border:1px dashed ${te};color:${te};font-size:16px;outline:none;z-index:9999999;min-width:80px;`, document.body.appendChild(Ee), requestAnimationFrame(() => {
            document.body.contains(Ee) && Ee.focus();
          }), Ee.addEventListener("blur", () => {
            Ee.value.trim() && A.addShape({ type: "text", color: te, x: ce, y: Ce, text: Ee.value.trim() }), Ie(Ee);
          }, { once: !0 }), Ee.addEventListener("keydown", (Rt) => {
            Rt.key === "Enter" && Ee.blur(), Rt.stopPropagation();
          });
        }
      }), M.addEventListener("pointermove", (G) => {
        Se && Z === "pen" && et.push(Ir(G));
      }), M.addEventListener("pointerup", (G) => {
        if (!Se) return;
        Se = !1;
        const ae = Ir(G);
        Z === "pen" && et.length > 1 ? A.addShape({ type: "pen", color: te, points: et }) : Z === "rect" ? A.addShape({ type: "rect", color: te, x: Math.min(ce, ae.x), y: Math.min(Ce, ae.y), w: Math.abs(ae.x - ce), h: Math.abs(ae.y - Ce) }) : Z === "circle" ? A.addShape({ type: "circle", color: te, x: (ce + ae.x) / 2, y: (Ce + ae.y) / 2, rx: Math.abs(ae.x - ce) / 2, ry: Math.abs(ae.y - Ce) / 2 }) : Z === "arrow" && A.addShape({ type: "arrow", color: te, x1: ce, y1: Ce, x2: ae.x, y2: ae.y });
      });
    }, E.src = R;
  }
  function Eu(v, R) {
    const E = document.createElement("div");
    E.style.cssText = "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:all;";
    const M = document.createElement("div");
    M.className = "klavity-sent";
    const A = document.createElement("div");
    A.className = "kl-sent-check", A.innerHTML = K("check", { label: "Sent", size: 22 }), M.appendChild(A);
    const T = document.createElement("h2");
    T.textContent = "Report sent", M.appendChild(T);
    const _ = document.createElement("p");
    if (_.textContent = n.thankYou || "We filed it and emailed you a copy.", M.appendChild(_), v) {
      const F = document.createElement("div");
      F.className = "klavity-ref";
      const P = document.createElement("span");
      P.textContent = "Filed as";
      const D = document.createElement("code");
      D.textContent = Do(v), F.append(P, D);
      const B = zo(R);
      if (B) {
        const q = document.createElement("a");
        q.href = B, q.target = "_blank", q.rel = "noopener", q.textContent = "Open in Klavity", F.appendChild(q);
      }
      M.appendChild(F);
    }
    E.appendChild(M), Ie(er), l.appendChild(E), Xs(M, Qe);
  }
  function Mu(v, R, E) {
    const { copy: M, onLead: A } = E;
    ee.innerHTML = "";
    const T = document.createElement("div");
    T.className = "klavity-success";
    const _ = document.createElement("h2");
    if (_.innerHTML = M.headline, T.appendChild(_), M.body) {
      const P = document.createElement("p");
      P.textContent = M.body, T.appendChild(P);
    }
    if (v) {
      const P = document.createElement("div");
      P.className = "klavity-ref";
      const D = document.createElement("span");
      D.textContent = "Filed as";
      const B = document.createElement("code");
      B.textContent = Do(v), P.append(D, B);
      const q = zo(R);
      if (q) {
        const W = document.createElement("a");
        W.href = q, W.target = "_blank", W.rel = "noopener", W.textContent = "View in dashboard", P.appendChild(W);
      }
      T.appendChild(P);
    }
    const F = () => Xs(ee, Ct);
    if (M.showEmail) {
      const P = document.createElement("div");
      P.className = "klavity-lead";
      const D = document.createElement("input");
      D.type = "email", D.placeholder = "you@company.com";
      const B = document.createElement("button"), q = M.emailLabel;
      B.textContent = q;
      const W = document.createElement("div");
      W.className = "klavity-lead-err", W.setAttribute("role", "alert"), W.style.display = "none";
      const Y = async () => {
        const fe = D.value.trim();
        if (!fe || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fe)) {
          W.textContent = "Please enter a valid email so we can reach you.", W.style.display = "block", D.focus();
          return;
        }
        B.disabled = !0, B.textContent = "Saving…", W.style.display = "none";
        try {
          A && await A(v, fe);
        } catch (te) {
          try {
            console.warn("[Klavity] lead capture failed:", (te == null ? void 0 : te.message) || te);
          } catch {
          }
          W.textContent = "Couldn't save your email — please try again.", W.style.display = "block", B.disabled = !1, B.textContent = "Retry", D.focus();
          return;
        }
        const Z = document.createElement("div");
        Z.className = "klavity-thanks", Z.textContent = "Thanks — we'll be in touch.", Ie(W), P.replaceWith(Z), M.showCta || F();
      };
      B.addEventListener("click", Y), D.addEventListener("keydown", (fe) => {
        fe.key === "Enter" && Y();
      }), P.append(D, B), T.appendChild(P), T.appendChild(W);
    }
    if (M.showCta && M.ctaUrl) {
      const P = document.createElement("a");
      P.className = "klavity-cta", P.href = M.ctaUrl, P.target = "_blank", P.rel = "noopener", P.textContent = M.ctaText, T.appendChild(P);
    }
    if (ee.appendChild(T), !n.whiteLabel) {
      const P = document.createElement("div");
      P.className = "klavity-pb";
      const D = document.createElement("a");
      D.href = bh("https://klavity.in", {
        campaign: "powered_by",
        medium: n.attributionMedium,
        ref: n.projectId
      }), D.target = "_blank", D.rel = "noopener", D.textContent = "Klavity", P.append("Powered by ", D), ee.appendChild(P);
    }
    !M.showEmail && !M.showCta && F();
  }
  if (t.autoCaptureOnOpen) {
    let v = 0;
    try {
      v = document.getElementsByTagName("*").length;
    } catch {
      v = 0;
    }
    if (v <= f) {
      if (a = !0, we(), xh(t) === "screen")
        return (async () => {
          if (await no({ viewport: !0 })) {
            a = !1, we();
            return;
          }
          if (c.length) {
            a = !1, we();
            return;
          }
          if (a = !0, we(), t.onCaptureViewport) {
            ro(null).catch(() => {
              a = !1, we();
            });
            return;
          }
          t.onCaptureFull().then((A) => {
            const { dataUrl: T, quality: _, suggestSharp: F } = kt(A);
            a = !1, tt(T, _, void 0, !0, !!F), bt(Ft);
          }).catch(() => {
            a = !1, we();
          });
        })(), Vs;
      const R = () => {
        if (t.onCaptureViewport) {
          ro(null).catch(() => {
            a = !1, we();
          });
          return;
        }
        t.onCaptureFull().then((M) => {
          const { dataUrl: A, quality: T, suggestSharp: _ } = kt(M);
          a = !1, tt(A, T, void 0, !0, !!_), bt(Ft);
        }).catch(() => {
          a = !1, we();
        });
      }, E = window.requestIdleCallback;
      typeof E == "function" ? E(() => R(), { timeout: 1200 }) : requestAnimationFrame(() => setTimeout(R, 0));
    }
  }
  return Vs;
}
function Oh(e, t) {
  const r = document.createElement("div");
  r.style.cssText = "position:fixed;inset:0;cursor:crosshair;z-index:2147483646;user-select:none;", r.setAttribute("data-klavity-region-overlay", ""), document.body.appendChild(r);
  const n = document.createElement("div");
  n.textContent = "Drag to select an area · Esc to cancel", n.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-family:system-ui;font-size:14px;background:rgba(0,0,0,.7);padding:8px 16px;border-radius:6px;pointer-events:none;z-index:2147483647;", document.body.appendChild(n);
  let i = 0, o = 0, l = !1;
  function c() {
    document.removeEventListener("keydown", a, { capture: !0 }), Ie(r), Ie(n);
  }
  function a(p) {
    p.key === "Escape" && (p.stopPropagation(), c(), t());
  }
  document.addEventListener("keydown", a, { capture: !0 }), r.addEventListener("pointerdown", (p) => {
    l = !0, i = p.clientX, o = p.clientY, Ie(n);
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
async function Fo(e) {
  if (e.type === "image/heic" || e.type === "image/heif" || e.name.endsWith(".heic") || e.name.endsWith(".heif"))
    try {
      const t = (await import("./heic2any-D6xzzX7R.js").then((n) => n.h)).default, r = await t({ blob: e, toType: "image/jpeg", quality: 0.85 });
      return Uo(r);
    } catch {
    }
  return Uo(e);
}
function Uo(e) {
  return new Promise((t, r) => {
    const n = new FileReader();
    n.onload = () => t(n.result), n.onerror = r, n.readAsDataURL(e);
  });
}
const _h = {
  frustrated: { accent: "#e8849a", mark: "vein", label: "Frustrated" },
  confused: { accent: "#e8a24a", mark: "q", label: "Confused" },
  satisfied: { accent: "#7fd1c4", mark: "check", label: "Satisfied" },
  delighted: { accent: "#9fd6a0", mark: "spark", label: "Delighted" },
  neutral: { accent: "#8a8276", mark: "dots", label: "Neutral" },
  inspired: { accent: "#8b8bf5", mark: "bulb", label: "Inspired" },
  alarmed: { accent: "#ef6b6b", mark: "bang", label: "Alarmed" }
};
function Nh(e) {
  const t = (e || "").trim().split(/\s+/).filter(Boolean);
  return t.length === 0 ? "?" : t.length === 1 ? t[0].slice(0, 2).toUpperCase() : (t[0][0] + t[t.length - 1][0]).toUpperCase();
}
function Ph(e) {
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
const $h = {
  vein: "ksim-m-vein",
  spark: "ksim-m-spark",
  bulb: "ksim-m-bulb",
  bang: "ksim-m-bang",
  q: "ksim-m-q",
  dots: "ksim-m-dots",
  check: "ksim-m-check"
};
function jt(e) {
  return String(e).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function Dh(e) {
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
  } = e, s = jt(e.initials || Nh(t)), h = i !== "none" ? _h[i] : null, d = h ? `<span class="ksim-mark ${a ? $h[h.mark] : ""}" style="color:${jt(h.accent)}">${Ph(h.mark)}</span>` : "", m = r ? `<span class="ksim-head ksim-photo"><img src="${jt(r)}" alt="${jt(t)}" loading="lazy" onerror="this.style.display='none';this.parentNode.classList.add('ksim-fallback')"><span class="ksim-ini">${s}</span></span>` : `<span class="ksim-head ksim-mono"><span class="ksim-ini">${s}</span>${l ? '<span class="ksim-eyes"><i></i><i></i></span>' : ""}</span>`, f = c ? '<span class="ksim-legs"><i></i><i></i></span>' : "", g = ["ksim", a ? "is-animated" : "", p].filter(Boolean).join(" "), x = `--ksim-persona:${jt(n)};--ksim-size:${o}px;` + (h ? `--ksim-accent:${jt(h.accent)};` : "");
  return `<span class="${g}" style="${x}" data-emotion="${i}" title="${jt(t)}">${d}${m}${f}</span>`;
}
function zh(e) {
  const t = document.createElement("template");
  return t.innerHTML = Dh(e).trim(), t.content.firstElementChild;
}
const Fh = `
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
function Uh(e = document) {
  var n;
  const t = e.head ?? e ?? null;
  if (!t || (n = t.querySelector) != null && n.call(t, "style[data-ksim]")) return;
  const r = document.createElement("style");
  r.setAttribute("data-ksim", ""), r.textContent = Fh, t.appendChild(r);
}
function Bh(e) {
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
async function qh(e) {
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
        description: { version: 1, type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: Bh(e) }] }] },
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
async function Wh(e) {
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
async function jh(e) {
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
async function Hh(e) {
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
function Vh(e) {
  const t = new FormData();
  return t.set("type", e.type ?? "bug"), t.set("description", e.description), t.set("page_url", e.pageUrl), e.context && t.set("context", JSON.stringify(e.context)), e.projectId && t.set("project_id", e.projectId), e.replayEvents && e.replayEvents.length && t.set("replay_events", JSON.stringify(e.replayEvents)), t;
}
async function Gh(e) {
  const { settings: t, type: r, description: n, context: i, screenshots: o, projectId: l, replayEvents: c } = e, a = Vh({ type: r, description: n, pageUrl: i.pageUrl, context: i, projectId: l, replayEvents: c }), p = t.connectionMode === "klavity" && !!t.klavToken;
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
var Yh = Object.defineProperty, Kh = (e, t, r) => t in e ? Yh(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, U = (e, t, r) => Kh(e, typeof t != "symbol" ? t + "" : t, r), Bo, Xh = Object.defineProperty, Jh = (e, t, r) => t in e ? Xh(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, qo = (e, t, r) => Jh(e, typeof t != "symbol" ? t + "" : t, r), Pe = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(Pe || {});
const Wo = {
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
}, jo = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, tn = {}, Yl = {}, Zh = () => !!globalThis.Zone;
function Cs(e) {
  if (tn[e])
    return tn[e];
  const t = globalThis[e], r = t.prototype, n = e in Wo ? Wo[e] : void 0, i = !!(n && // @ts-expect-error 2345
  n.every(
    (c) => {
      var a, p;
      return !!((p = (a = Object.getOwnPropertyDescriptor(r, c)) == null ? void 0 : a.get) != null && p.toString().includes("[native code]"));
    }
  )), o = e in jo ? jo[e] : void 0, l = !!(o && o.every(
    // @ts-expect-error 2345
    (c) => {
      var a;
      return typeof r[c] == "function" && ((a = r[c]) == null ? void 0 : a.toString().includes("[native code]"));
    }
  ));
  if (i && l && !Zh())
    return tn[e] = t.prototype, t.prototype;
  try {
    const c = document.createElement("iframe");
    c.style.display = "none", document.body.appendChild(c);
    const a = c.contentWindow;
    if (!a) return t.prototype;
    const p = a[e].prototype;
    if (!p)
      return c.remove(), r;
    const s = navigator.userAgent;
    return s.includes("Safari") && !s.includes("Chrome") ? (c.classList.add("rr-block"), c.setAttribute("__rrwebUntaintedMutationObserver", ""), Yl[e] = () => c.remove()) : c.remove(), tn[e] = p;
  } catch {
    return r;
  }
}
const ii = {};
function Tt(e, t, r) {
  var n;
  const i = `${e}.${String(r)}`;
  if (ii[i])
    return ii[i].call(
      t
    );
  const o = Cs(e), l = (n = Object.getOwnPropertyDescriptor(
    o,
    r
  )) == null ? void 0 : n.get;
  return l ? (ii[i] = l, l.call(t)) : t[r];
}
const si = {};
function Kl(e, t, r) {
  const n = `${e}.${String(r)}`;
  if (si[n])
    return si[n].bind(
      t
    );
  const o = Cs(e)[r];
  return typeof o != "function" ? t[r] : (si[n] = o, o.bind(t));
}
function Qh(e) {
  return Tt("Node", e, "ownerDocument");
}
function ef(e) {
  return Tt("Node", e, "childNodes");
}
function tf(e) {
  return Tt("Node", e, "parentNode");
}
function rf(e) {
  return Tt("Node", e, "parentElement");
}
function nf(e) {
  return Tt("Node", e, "textContent");
}
function sf(e, t) {
  return Kl("Node", e, "contains")(t);
}
function of(e) {
  return Kl("Node", e, "getRootNode")();
}
function af(e) {
  return !e || !("host" in e) ? null : Tt("ShadowRoot", e, "host");
}
function lf(e) {
  return e.styleSheets;
}
function cf(e) {
  return !e || !("shadowRoot" in e) ? null : Tt("Element", e, "shadowRoot");
}
function uf(e, t) {
  return Tt("Element", e, "querySelector")(t);
}
function df(e, t) {
  return Tt("Element", e, "querySelectorAll")(t);
}
function pf() {
  return [
    Cs("MutationObserver").constructor,
    Yl.MutationObserver ?? (() => {
    })
  ];
}
let Xl = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (Xl = () => (/* @__PURE__ */ new Date()).getTime());
function hf(e, t, r) {
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
const Ue = {
  ownerDocument: Qh,
  childNodes: ef,
  parentNode: tf,
  parentElement: rf,
  textContent: nf,
  contains: sf,
  getRootNode: of,
  host: af,
  styleSheets: lf,
  shadowRoot: cf,
  querySelector: uf,
  querySelectorAll: df,
  nowTimestamp: Xl,
  mutationObserverCtor: pf,
  patch: hf
};
function Jl(e) {
  return e.nodeType === e.ELEMENT_NODE;
}
function Pr(e) {
  const t = (
    // anchor and textarea elements also have a `host` property
    // but only shadow roots have a `mode` property
    e && "host" in e && "mode" in e && Ue.host(e) || null
  );
  return !!(t && "shadowRoot" in t && Ue.shadowRoot(t) === e);
}
function $r(e) {
  return Object.prototype.toString.call(e) === "[object ShadowRoot]";
}
function ff(e) {
  return e.includes(" background-clip: text;") && !e.includes(" -webkit-background-clip: text;") && (e = e.replace(
    /\sbackground-clip:\s*text;/g,
    " -webkit-background-clip: text; background-clip: text;"
  )), e;
}
function mf(e) {
  const { cssText: t } = e;
  if (t.split('"').length < 3) return t;
  const r = ["@import", `url(${JSON.stringify(e.href)})`];
  return e.layerName === "" ? r.push("layer") : e.layerName && r.push(`layer(${e.layerName})`), e.supportsText && r.push(`supports(${e.supportsText})`), e.media.length && r.push(e.media.mediaText), r.join(" ") + ";";
}
function hs(e) {
  try {
    const t = e.rules || e.cssRules;
    if (!t)
      return null;
    let r = e.href;
    !r && e.ownerNode && (r = e.ownerNode.baseURI);
    const n = Array.from(
      t,
      (i) => Zl(i, r)
    ).join("");
    return ff(n);
  } catch {
    return null;
  }
}
function Zl(e, t) {
  if (yf(e)) {
    let r;
    try {
      r = // for same-origin stylesheets,
      // we can access the imported stylesheet rules directly
      hs(e.styleSheet) || // work around browser issues with the raw string `@import url(...)` statement
      mf(e);
    } catch {
      r = e.cssText;
    }
    return e.styleSheet.href ? kn(r, e.styleSheet.href) : r;
  } else {
    let r = e.cssText;
    return bf(e) && e.selectorText.includes(":") && (r = gf(r)), t ? kn(r, t) : r;
  }
}
function gf(e) {
  const t = /(\[(?:[\w-]+)[^\\])(:(?:[\w-]+)\])/gm;
  return e.replace(t, "$1\\$2");
}
function yf(e) {
  return "styleSheet" in e;
}
function bf(e) {
  return "selectorText" in e;
}
class Ql {
  constructor() {
    qo(this, "idNodeMap", /* @__PURE__ */ new Map()), qo(this, "nodeMetaMap", /* @__PURE__ */ new WeakMap());
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
function vf() {
  return new Ql();
}
function bn({
  element: e,
  maskInputOptions: t,
  tagName: r,
  type: n,
  value: i,
  maskInputFn: o
}) {
  let l = i || "";
  const c = n && Xt(n);
  return (t[r.toLowerCase()] || c && t[c]) && (o ? l = o(l, e) : l = "*".repeat(l.length)), l;
}
function Xt(e) {
  return e.toLowerCase();
}
const Ho = "__rrweb_original__";
function kf(e) {
  const t = e.getContext("2d");
  if (!t) return !0;
  const r = 50;
  for (let n = 0; n < e.width; n += r)
    for (let i = 0; i < e.height; i += r) {
      const o = t.getImageData, l = Ho in o ? o[Ho] : o;
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
function vn(e) {
  const t = e.type;
  return e.hasAttribute("data-rr-is-password") ? "password" : t ? (
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    Xt(t)
  ) : null;
}
function ec(e, t) {
  let r;
  try {
    r = new URL(e, t ?? window.location.href);
  } catch {
    return null;
  }
  const n = /\.([0-9a-z]+)(?:$)/i, i = r.pathname.match(n);
  return (i == null ? void 0 : i[1]) ?? null;
}
function wf(e) {
  let t = "";
  return e.indexOf("//") > -1 ? t = e.split("/").slice(0, 3).join("/") : t = e.split("/")[0], t = t.split("?")[0], t;
}
const xf = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm, Sf = /^(?:[a-z+]+:)?\/\//i, Cf = /^www\..*/i, Ef = /^(data:)([^,]*),(.*)/i;
function kn(e, t) {
  return (e || "").replace(
    xf,
    (r, n, i, o, l, c) => {
      const a = i || l || c, p = n || o || "";
      if (!a)
        return r;
      if (Sf.test(a) || Cf.test(a))
        return `url(${p}${a}${p})`;
      if (Ef.test(a))
        return `url(${p}${a}${p})`;
      if (a[0] === "/")
        return `url(${p}${wf(t) + a}${p})`;
      const s = t.split("/"), h = a.split("/");
      s.pop();
      for (const d of h)
        d !== "." && (d === ".." ? s.pop() : s.push(d));
      return `url(${p}${s.join("/")}${p})`;
    }
  );
}
function rn(e, t = !1) {
  return t ? e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "") : e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "").replace(/0px/g, "0");
}
function Mf(e, t, r = !1) {
  const n = Array.from(t.childNodes), i = [];
  let o = 0;
  if (n.length > 1 && e && typeof e == "string") {
    let l = rn(e, r);
    const c = l.length / e.length;
    for (let a = 1; a < n.length; a++)
      if (n[a].textContent && typeof n[a].textContent == "string") {
        const p = rn(
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
              const g = rn(f).length;
              m = l.indexOf(d, g);
            }
            m === -1 && (m = u[0].length);
          }
          if (m !== -1) {
            let f = Math.floor(m / c);
            for (; f > 0 && f < e.length; ) {
              if (o += 1, o > 50 * n.length)
                return i.push(e), i;
              const g = rn(
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
function Rf(e, t) {
  return Mf(e, t).join("/* rr_split */");
}
let Af = 1;
const Tf = new RegExp("[^a-z0-9-_:]"), Br = -2;
function tc() {
  return Af++;
}
function Lf(e) {
  if (e instanceof HTMLFormElement)
    return "form";
  const t = Xt(e.tagName);
  return Tf.test(t) ? "div" : t;
}
let lr, Vo;
const If = /^[^ \t\n\r\u000c]+/, Of = /^[, \t\n\r\u000c]+/;
function _f(e, t) {
  if (t.trim() === "")
    return t;
  let r = 0;
  function n(o) {
    let l;
    const c = o.exec(t.substring(r));
    return c ? (l = c[0], r += l.length, l) : "";
  }
  const i = [];
  for (; n(Of), !(r >= t.length); ) {
    let o = n(If);
    if (o.slice(-1) === ",")
      o = pr(e, o.substring(0, o.length - 1)), i.push(o);
    else {
      let l = "";
      o = pr(e, o);
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
const Go = /* @__PURE__ */ new WeakMap();
function pr(e, t) {
  return !t || t.trim() === "" ? t : Es(e, t);
}
function Nf(e) {
  return !!(e.tagName === "svg" || e.ownerSVGElement);
}
function Es(e, t) {
  let r = Go.get(e);
  if (r || (r = e.createElement("a"), Go.set(e, r)), !t)
    t = "";
  else if (t.startsWith("blob:") || t.startsWith("data:"))
    return t;
  return r.setAttribute("href", t), r.href;
}
function rc(e, t, r, n) {
  return n && (r === "src" || r === "href" && !(t === "use" && n[0] === "#") || r === "xlink:href" && n[0] !== "#" || r === "background" && ["table", "td", "th"].includes(t) ? pr(e, n) : r === "srcset" ? _f(e, n) : r === "style" ? kn(n, Es(e)) : t === "object" && r === "data" ? pr(e, n) : n);
}
function nc(e, t, r) {
  return ["video", "audio"].includes(e) && t === "autoplay";
}
function Pf(e, t, r) {
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
function wn(e, t, r) {
  if (!e) return !1;
  if (e.nodeType !== e.ELEMENT_NODE)
    return r ? wn(Ue.parentNode(e), t, r) : !1;
  for (let n = e.classList.length; n--; ) {
    const i = e.classList[n];
    if (t.test(i))
      return !0;
  }
  return r ? wn(Ue.parentNode(e), t, r) : !1;
}
function ic(e, t, r, n) {
  let i;
  if (Jl(e)) {
    if (i = e, !Ue.childNodes(i).length)
      return !1;
  } else {
    if (Ue.parentElement(e) === null)
      return !1;
    i = Ue.parentElement(e);
  }
  try {
    if (typeof t == "string") {
      if (n) {
        if (i.closest(`.${t}`)) return !0;
      } else if (i.classList.contains(t)) return !0;
    } else if (wn(i, t, n)) return !0;
    if (r) {
      if (n) {
        if (i.closest(r)) return !0;
      } else if (i.matches(r)) return !0;
    }
  } catch {
  }
  return !1;
}
function $f(e, t, r) {
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
function Df(e, t, r) {
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
function zf(e, t) {
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
  } = t, x = Ff(r, n);
  switch (e.nodeType) {
    case e.DOCUMENT_NODE:
      return e.compatMode !== "CSS1Compat" ? {
        type: Pe.Document,
        childNodes: [],
        compatMode: e.compatMode
        // probably "BackCompat"
      } : {
        type: Pe.Document,
        childNodes: []
      };
    case e.DOCUMENT_TYPE_NODE:
      return {
        type: Pe.DocumentType,
        name: e.name,
        publicId: e.publicId,
        systemId: e.systemId,
        rootId: x
      };
    case e.ELEMENT_NODE:
      return Bf(e, {
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
      return Uf(e, {
        doc: r,
        needsMask: l,
        maskTextFn: p,
        rootId: x,
        cssCaptured: g
      });
    case e.CDATA_SECTION_NODE:
      return {
        type: Pe.CDATA,
        textContent: "",
        rootId: x
      };
    case e.COMMENT_NODE:
      return {
        type: Pe.Comment,
        textContent: Ue.textContent(e) || "",
        rootId: x
      };
    default:
      return !1;
  }
}
function Ff(e, t) {
  if (!t.hasNode(e)) return;
  const r = t.getId(e);
  return r === 1 ? void 0 : r;
}
function Uf(e, t) {
  const { needsMask: r, maskTextFn: n, rootId: i, cssCaptured: o } = t, l = Ue.parentNode(e), c = l && l.tagName;
  let a = "";
  const p = c === "STYLE" ? !0 : void 0, s = c === "SCRIPT" ? !0 : void 0;
  return s ? a = "SCRIPT_PLACEHOLDER" : o || (a = Ue.textContent(e), p && a && (a = kn(a, Es(t.doc)))), !p && !s && a && r && (a = n ? n(a, Ue.parentElement(e)) : a.replace(/[\S]/g, "*")), {
    type: Pe.Text,
    textContent: a || "",
    rootId: i
  };
}
function Bf(e, t) {
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
  } = t, m = Pf(e, n, i), f = Lf(e);
  let g = {};
  const x = e.attributes.length;
  for (let y = 0; y < x; y++) {
    const C = e.attributes[y];
    nc(f, C.name, C.value) || (g[C.name] = rc(
      r,
      f,
      Xt(C.name),
      C.value
    ));
  }
  if (f === "link" && o) {
    const y = Array.from(r.styleSheets).find((w) => w.href === e.href);
    let C = null;
    y && (C = hs(y)), C && (delete g.rel, delete g.href, g._cssText = C);
  }
  if (f === "style" && e.sheet) {
    let y = hs(
      e.sheet
    );
    y && (e.childNodes.length > 1 && (y = Rf(y, e)), g._cssText = y);
  }
  if (["input", "textarea", "select"].includes(f)) {
    const y = e.value, C = e.checked;
    g.type !== "radio" && g.type !== "checkbox" && g.type !== "submit" && g.type !== "button" && y ? g.value = bn({
      element: e,
      type: vn(e),
      tagName: f,
      value: y,
      maskInputOptions: l,
      maskInputFn: c
    }) : C && (g.checked = C);
  }
  if (f === "option" && (e.selected && !l.select ? g.selected = !0 : delete g.selected), f === "dialog" && e.open && (g.rr_open_mode = e.matches("dialog:modal") ? "modal" : "non-modal"), f === "canvas" && s) {
    if (e.__context === "2d")
      kf(e) || (g.rr_dataURL = e.toDataURL(
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
    lr || (lr = r.createElement("canvas"), Vo = lr.getContext("2d"));
    const y = e, C = y.currentSrc || y.getAttribute("src") || "<unknown-src>", w = y.crossOrigin, k = () => {
      y.removeEventListener("load", k);
      try {
        lr.width = y.naturalWidth, lr.height = y.naturalHeight, Vo.drawImage(y, 0, 0), g.rr_dataURL = lr.toDataURL(
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
    type: Pe.Element,
    tagName: f,
    attributes: g,
    childNodes: [],
    isSVG: Nf(e) || void 0,
    needBlock: m,
    rootId: u,
    isCustom: b
  };
}
function xe(e) {
  return e == null ? "" : e.toLowerCase();
}
function sc(e) {
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
function qf(e, t) {
  if (t.comment && e.type === Pe.Comment)
    return !0;
  if (e.type === Pe.Element) {
    if (t.script && // script tag
    (e.tagName === "script" || // (module)preload link
    e.tagName === "link" && (e.attributes.rel === "preload" && e.attributes.as === "script" || e.attributes.rel === "modulepreload") || // prefetch link
    e.tagName === "link" && e.attributes.rel === "prefetch" && typeof e.attributes.href == "string" && ec(e.attributes.href) === "js"))
      return !0;
    if (t.headFavicon && (e.tagName === "link" && e.attributes.rel === "shortcut icon" || e.tagName === "meta" && (xe(e.attributes.name).match(
      /^msapplication-tile(image|color)$/
    ) || xe(e.attributes.name) === "application-name" || xe(e.attributes.rel) === "icon" || xe(e.attributes.rel) === "apple-touch-icon" || xe(e.attributes.rel) === "shortcut icon")))
      return !0;
    if (e.tagName === "meta") {
      if (t.headMetaDescKeywords && xe(e.attributes.name).match(/^description|keywords$/))
        return !0;
      if (t.headMetaSocial && (xe(e.attributes.property).match(/^(og|twitter|fb):/) || // og = opengraph (facebook)
      xe(e.attributes.name).match(/^(og|twitter):/) || xe(e.attributes.name) === "pinterest"))
        return !0;
      if (t.headMetaRobots && (xe(e.attributes.name) === "robots" || xe(e.attributes.name) === "googlebot" || xe(e.attributes.name) === "bingbot"))
        return !0;
      if (t.headMetaHttpEquiv && e.attributes["http-equiv"] !== void 0)
        return !0;
      if (t.headMetaAuthorship && (xe(e.attributes.name) === "author" || xe(e.attributes.name) === "generator" || xe(e.attributes.name) === "framework" || xe(e.attributes.name) === "publisher" || xe(e.attributes.name) === "progid" || xe(e.attributes.property).match(/^article:/) || xe(e.attributes.property).match(/^product:/)))
        return !0;
      if (t.headMetaVerification && (xe(e.attributes.name) === "google-site-verification" || xe(e.attributes.name) === "yandex-verification" || xe(e.attributes.name) === "csrf-token" || xe(e.attributes.name) === "p:domain_verify" || xe(e.attributes.name) === "verify-v1" || xe(e.attributes.name) === "verification" || xe(e.attributes.name) === "shopify-checkout-api-token"))
        return !0;
    }
  }
  return !1;
}
function hr(e, t) {
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
    cssCaptured: I = !1
  } = t;
  let { needsMask: N } = t, { preserveWhiteSpace: O = !0 } = t;
  N || (N = ic(
    e,
    l,
    c,
    N === void 0
  ));
  const J = zf(e, {
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
    cssCaptured: I
  });
  if (!J)
    return console.warn(e, "not serialized"), null;
  let H;
  n.hasNode(e) ? H = n.getId(e) : qf(J, u) || !O && J.type === Pe.Text && !J.textContent.replace(/^\s+|\s+$/gm, "").length ? H = Br : H = tc();
  const L = Object.assign(J, { id: H });
  if (n.add(e, L), H === Br)
    return null;
  x && x(e);
  let De = !a;
  if (L.type === Pe.Element) {
    De = De && !L.needBlock, delete L.needBlock;
    const Q = Ue.shadowRoot(e);
    Q && $r(Q) && (L.isShadowHost = !0);
  }
  if ((L.type === Pe.Document || L.type === Pe.Element) && De) {
    u.headWhitespace && L.type === Pe.Element && L.tagName === "head" && (O = !1);
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
    if (!(L.type === Pe.Element && L.tagName === "textarea" && L.attributes.value !== void 0)) {
      L.type === Pe.Element && L.attributes._cssText !== void 0 && typeof L.attributes._cssText == "string" && (Q.cssCaptured = !0);
      for (const be of Array.from(Ue.childNodes(e))) {
        const he = hr(be, Q);
        he && L.childNodes.push(he);
      }
    }
    let pe = null;
    if (Jl(e) && (pe = Ue.shadowRoot(e)))
      for (const be of Array.from(Ue.childNodes(pe))) {
        const he = hr(be, Q);
        he && ($r(pe) && (he.isShadow = !0), L.childNodes.push(he));
      }
  }
  const se = Ue.parentNode(e);
  return se && Pr(se) && $r(se) && (L.isShadow = !0), L.type === Pe.Element && L.tagName === "iframe" && $f(
    e,
    () => {
      const Q = e.contentDocument;
      if (Q && b) {
        const pe = hr(Q, {
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
        pe && b(
          e,
          pe
        );
      }
    },
    y
  ), L.type === Pe.Element && L.tagName === "link" && typeof L.attributes.rel == "string" && (L.attributes.rel === "stylesheet" || L.attributes.rel === "preload" && typeof L.attributes.href == "string" && ec(L.attributes.href) === "css") && Df(
    e,
    () => {
      if (C) {
        const Q = hr(e, {
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
  ), L;
}
function Wf(e, t) {
  const {
    mirror: r = new Ql(),
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
  } : s, S = sc(u);
  return hr(e, {
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
function jf(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function Hf(e) {
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
var nn = { exports: {} }, Yo;
function Vf() {
  if (Yo) return nn.exports;
  Yo = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return nn.exports = t(), nn.exports.createColors = t, nn.exports;
}
const Gf = {}, Yf = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Gf
}, Symbol.toStringTag, { value: "Module" })), ht = /* @__PURE__ */ Hf(Yf);
var oi, Ko;
function Ms() {
  if (Ko) return oi;
  Ko = 1;
  let e = /* @__PURE__ */ Vf(), t = ht;
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
  return oi = r, r.default = r, oi;
}
var sn = {}, Xo;
function Rs() {
  return Xo || (Xo = 1, sn.isClean = Symbol("isClean"), sn.my = Symbol("my")), sn;
}
var ai, Jo;
function oc() {
  if (Jo) return ai;
  Jo = 1;
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
  return ai = r, r.default = r, ai;
}
var li, Zo;
function In() {
  if (Zo) return li;
  Zo = 1;
  let e = oc();
  function t(r, n) {
    new e(n).stringify(r);
  }
  return li = t, t.default = t, li;
}
var ci, Qo;
function On() {
  if (Qo) return ci;
  Qo = 1;
  let { isClean: e, my: t } = Rs(), r = Ms(), n = oc(), i = In();
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
  return ci = l, l.default = l, ci;
}
var ui, ea;
function _n() {
  if (ea) return ui;
  ea = 1;
  let e = On();
  class t extends e {
    constructor(n) {
      n && typeof n.value < "u" && typeof n.value != "string" && (n = { ...n, value: String(n.value) }), super(n), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return ui = t, t.default = t, ui;
}
var di, ta;
function Kf() {
  if (ta) return di;
  ta = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return di = { nanoid: (n = 21) => {
    let i = "", o = n;
    for (; o--; )
      i += e[Math.random() * 64 | 0];
    return i;
  }, customAlphabet: (n, i = 21) => (o = i) => {
    let l = "", c = o;
    for (; c--; )
      l += n[Math.random() * n.length | 0];
    return l;
  } }, di;
}
var pi, ra;
function ac() {
  if (ra) return pi;
  ra = 1;
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
  return pi = c, c.default = c, pi;
}
var hi, na;
function Nn() {
  if (na) return hi;
  na = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = ht, { fileURLToPath: r, pathToFileURL: n } = ht, { isAbsolute: i, resolve: o } = ht, { nanoid: l } = /* @__PURE__ */ Kf(), c = ht, a = Ms(), p = ac(), s = Symbol("fromOffsetCache"), h = !!(e && t), d = !!(o && i);
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
        let S = g, I = x;
        if (typeof S.offset == "number") {
          let N = this.fromOffset(S.offset);
          g = N.line, x = N.col;
        } else
          g = S.line, x = S.column;
        if (typeof I.offset == "number") {
          let N = this.fromOffset(I.offset);
          C = N.line, w = N.col;
        } else
          C = I.line, w = I.column;
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
      let I = y.sourceContentFor(C.source);
      return I && (S.source = I), S;
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
  return hi = u, u.default = u, c && c.registerInput && c.registerInput(u), hi;
}
var fi, ia;
function lc() {
  if (ia) return fi;
  ia = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = ht, { dirname: r, relative: n, resolve: i, sep: o } = ht, { pathToFileURL: l } = ht, c = Nn(), a = !!(e && t), p = !!(r && i && n && o);
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
  return fi = s, fi;
}
var mi, sa;
function Pn() {
  if (sa) return mi;
  sa = 1;
  let e = On();
  class t extends e {
    constructor(n) {
      super(n), this.type = "comment";
    }
  }
  return mi = t, t.default = t, mi;
}
var gi, oa;
function Jt() {
  if (oa) return gi;
  oa = 1;
  let { isClean: e, my: t } = Rs(), r = _n(), n = Pn(), i = On(), o, l, c, a;
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
  }, gi = h, h.default = h, h.rebuild = (d) => {
    d.type === "atrule" ? Object.setPrototypeOf(d, c.prototype) : d.type === "rule" ? Object.setPrototypeOf(d, l.prototype) : d.type === "decl" ? Object.setPrototypeOf(d, r.prototype) : d.type === "comment" ? Object.setPrototypeOf(d, n.prototype) : d.type === "root" && Object.setPrototypeOf(d, a.prototype), d[t] = !0, d.nodes && d.nodes.forEach((u) => {
      h.rebuild(u);
    });
  }, gi;
}
var yi, aa;
function As() {
  if (aa) return yi;
  aa = 1;
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
  }, yi = n, n.default = n, yi;
}
var bi, la;
function cc() {
  if (la) return bi;
  la = 1;
  let e = {};
  return bi = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, bi;
}
var vi, ca;
function uc() {
  if (ca) return vi;
  ca = 1;
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
  return vi = e, e.default = e, vi;
}
var ki, ua;
function Ts() {
  if (ua) return ki;
  ua = 1;
  let e = uc();
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
  return ki = t, t.default = t, ki;
}
var wi, da;
function Xf() {
  if (da) return wi;
  da = 1;
  const e = 39, t = 34, r = 92, n = 47, i = 10, o = 32, l = 12, c = 9, a = 13, p = 91, s = 93, h = 40, d = 41, u = 123, m = 125, f = 59, g = 42, x = 58, b = 64, y = /[\t\n\f\r "#'()/;[\\\]{}]/g, C = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, w = /.[\r\n"'(/\\]/, k = /[\da-f]/i;
  return wi = function(I, N = {}) {
    let O = I.css.valueOf(), J = N.ignoreErrors, H, L, De, se, Q, pe, be, he, ie, X, Ye = O.length, $ = 0, Be = [], $e = [];
    function qe() {
      return $;
    }
    function Ae(V) {
      throw I.error("Unclosed " + V, $);
    }
    function Qe() {
      return $e.length === 0 && $ >= Ye;
    }
    function Ct(V) {
      if ($e.length) return $e.pop();
      if ($ >= Ye) return;
      let Te = V ? V.ignoreUnclosed : !1;
      switch (H = O.charCodeAt($), H) {
        case i:
        case o:
        case c:
        case a:
        case l: {
          L = $;
          do
            L += 1, H = O.charCodeAt(L);
          while (H === o || H === i || H === c || H === a || H === l);
          X = ["space", O.slice($, L)], $ = L - 1;
          break;
        }
        case p:
        case s:
        case u:
        case m:
        case x:
        case f:
        case d: {
          let me = String.fromCharCode(H);
          X = [me, me, $];
          break;
        }
        case h: {
          if (he = Be.length ? Be.pop()[1] : "", ie = O.charCodeAt($ + 1), he === "url" && ie !== e && ie !== t && ie !== o && ie !== i && ie !== c && ie !== l && ie !== a) {
            L = $;
            do {
              if (pe = !1, L = O.indexOf(")", L + 1), L === -1)
                if (J || Te) {
                  L = $;
                  break;
                } else
                  Ae("bracket");
              for (be = L; O.charCodeAt(be - 1) === r; )
                be -= 1, pe = !pe;
            } while (pe);
            X = ["brackets", O.slice($, L + 1), $, L], $ = L;
          } else
            L = O.indexOf(")", $ + 1), se = O.slice($, L + 1), L === -1 || w.test(se) ? X = ["(", "(", $] : (X = ["brackets", se, $, L], $ = L);
          break;
        }
        case e:
        case t: {
          De = H === e ? "'" : '"', L = $;
          do {
            if (pe = !1, L = O.indexOf(De, L + 1), L === -1)
              if (J || Te) {
                L = $ + 1;
                break;
              } else
                Ae("string");
            for (be = L; O.charCodeAt(be - 1) === r; )
              be -= 1, pe = !pe;
          } while (pe);
          X = ["string", O.slice($, L + 1), $, L], $ = L;
          break;
        }
        case b: {
          y.lastIndex = $ + 1, y.test(O), y.lastIndex === 0 ? L = O.length - 1 : L = y.lastIndex - 2, X = ["at-word", O.slice($, L + 1), $, L], $ = L;
          break;
        }
        case r: {
          for (L = $, Q = !0; O.charCodeAt(L + 1) === r; )
            L += 1, Q = !Q;
          if (H = O.charCodeAt(L + 1), Q && H !== n && H !== o && H !== i && H !== c && H !== a && H !== l && (L += 1, k.test(O.charAt(L)))) {
            for (; k.test(O.charAt(L + 1)); )
              L += 1;
            O.charCodeAt(L + 1) === o && (L += 1);
          }
          X = ["word", O.slice($, L + 1), $, L], $ = L;
          break;
        }
        default: {
          H === n && O.charCodeAt($ + 1) === g ? (L = O.indexOf("*/", $ + 2) + 1, L === 0 && (J || Te ? L = O.length : Ae("comment")), X = ["comment", O.slice($, L + 1), $, L], $ = L) : (C.lastIndex = $ + 1, C.test(O), C.lastIndex === 0 ? L = O.length - 1 : L = C.lastIndex - 2, X = ["word", O.slice($, L + 1), $, L], Be.push(X), $ = L);
          break;
        }
      }
      return $++, X;
    }
    function ke(V) {
      $e.push(V);
    }
    return {
      back: ke,
      endOfFile: Qe,
      nextToken: Ct,
      position: qe
    };
  }, wi;
}
var xi, pa;
function Ls() {
  if (pa) return xi;
  pa = 1;
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
  return xi = t, t.default = t, e.registerAtRule(t), xi;
}
var Si, ha;
function Hr() {
  if (ha) return Si;
  ha = 1;
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
  }, Si = n, n.default = n, e.registerRoot(n), Si;
}
var Ci, fa;
function dc() {
  if (fa) return Ci;
  fa = 1;
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
  return Ci = e, e.default = e, Ci;
}
var Ei, ma;
function Is() {
  if (ma) return Ei;
  ma = 1;
  let e = Jt(), t = dc();
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
  return Ei = r, r.default = r, e.registerRule(r), Ei;
}
var Mi, ga;
function Jf() {
  if (ga) return Mi;
  ga = 1;
  let e = _n(), t = Xf(), r = Pn(), n = Ls(), i = Hr(), o = Is();
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
  return Mi = a, Mi;
}
var Ri, ya;
function Os() {
  if (ya) return Ri;
  ya = 1;
  let e = Jt(), t = Jf(), r = Nn();
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
  return Ri = n, n.default = n, e.registerParse(n), Ri;
}
var Ai, ba;
function pc() {
  if (ba) return Ai;
  ba = 1;
  let { isClean: e, my: t } = Rs(), r = lc(), n = In(), i = Jt(), o = As(), l = cc(), c = Ts(), a = Os(), p = Hr();
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
      let I;
      if (typeof k == "object" && k !== null && (k.type === "root" || k.type === "document"))
        I = x(k);
      else if (k instanceof y || k instanceof c)
        I = x(k.root), k.map && (typeof S.map > "u" && (S.map = {}), S.map.inline || (S.map.inline = !1), S.map.prev = k.map);
      else {
        let N = a;
        S.syntax && (N = S.syntax.parse), S.parser && (N = S.parser), N.parse && (N = N.parse);
        try {
          I = N(k, S);
        } catch (O) {
          this.processed = !0, this.error = O;
        }
        I && !I[t] && i.rebuild(I);
      }
      this.result = new c(w, I, S), this.helpers = { ...b, postcss: b, result: this.result }, this.plugins = this.processor.plugins.map((N) => typeof N == "object" && N.prepare ? { ...N, ...N.prepare(this.result) } : N);
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
          let I = S.postcssPlugin, N = S.postcssVersion, O = this.result.processor.version, J = N.split("."), H = O.split(".");
          (J[0] !== H[0] || parseInt(J[1]) > parseInt(H[1])) && console.error(
            "Unknown error from PostCSS plugin. Your current PostCSS version is " + O + ", but " + I + " uses " + N + ". Perhaps this is the source of the error below."
          );
        }
      } catch (I) {
        console && console.error && console.error(I);
      }
      return w;
    }
    prepareVisitors() {
      this.listeners = {};
      let w = (k, S, I) => {
        this.listeners[S] || (this.listeners[S] = []), this.listeners[S].push([k, I]);
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
                for (let I in k[S])
                  I === "*" ? w(k, S, k[S][I]) : w(
                    k,
                    S + "-" + I.toLowerCase(),
                    k[S][I]
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
            let S = this.visitTick(k);
            if (m(S))
              try {
                await S;
              } catch (I) {
                let N = k[k.length - 1].node;
                throw this.handleError(I, N);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [k, S] of this.listeners.OnceExit) {
            this.result.lastPlugin = k;
            try {
              if (w.type === "document") {
                let I = w.nodes.map(
                  (N) => S(N, this.helpers)
                );
                await Promise.all(I);
              } else
                await S(w, this.helpers);
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
      return process.env.NODE_ENV !== "production" && ("from" in this.opts || l(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(w, k);
    }
    toString() {
      return this.css;
    }
    visitSync(w, k) {
      for (let [S, I] of w) {
        this.result.lastPlugin = S;
        let N;
        try {
          N = I(k, this.helpers);
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
      let k = w[w.length - 1], { node: S, visitors: I } = k;
      if (S.type !== "root" && S.type !== "document" && !S.parent) {
        w.pop();
        return;
      }
      if (I.length > 0 && k.visitorIndex < I.length) {
        let [O, J] = I[k.visitorIndex];
        k.visitorIndex += 1, k.visitorIndex === I.length && (k.visitors = [], k.visitorIndex = 0), this.result.lastPlugin = O;
        try {
          return J(S.toProxy(), this.helpers);
        } catch (H) {
          throw this.handleError(H, S);
        }
      }
      if (k.iterator !== 0) {
        let O = k.iterator, J;
        for (; J = S.nodes[S.indexes[O]]; )
          if (S.indexes[O] += 1, !J[e]) {
            J[e] = !0, w.push(g(J));
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
          w.nodes && w.each((I) => {
            I[e] || this.walkSync(I);
          });
        else {
          let I = this.listeners[S];
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
  return y.registerPostcss = (C) => {
    b = C;
  }, Ai = y, y.default = y, p.registerLazyResult(y), o.registerLazyResult(y), Ai;
}
var Ti, va;
function Zf() {
  if (va) return Ti;
  va = 1;
  let e = lc(), t = In(), r = cc(), n = Os();
  const i = Ts();
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
  return Ti = o, o.default = o, Ti;
}
var Li, ka;
function Qf() {
  if (ka) return Li;
  ka = 1;
  let e = Zf(), t = pc(), r = As(), n = Hr();
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
  return Li = i, i.default = i, n.registerProcessor(i), r.registerProcessor(i), Li;
}
var Ii, wa;
function em() {
  if (wa) return Ii;
  wa = 1;
  let e = _n(), t = ac(), r = Pn(), n = Ls(), i = Nn(), o = Hr(), l = Is();
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
  return Ii = c, c.default = c, Ii;
}
var Oi, xa;
function tm() {
  if (xa) return Oi;
  xa = 1;
  let e = Ms(), t = _n(), r = pc(), n = Jt(), i = Qf(), o = In(), l = em(), c = As(), a = uc(), p = Pn(), s = Ls(), h = Ts(), d = Nn(), u = Os(), m = dc(), f = Is(), g = Hr(), x = On();
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
    let I;
    return Object.defineProperty(S, "postcss", {
      get() {
        return I || (I = S()), I;
      }
    }), S.process = function(N, O, J) {
      return b([S(J)]).process(N, O);
    }, S;
  }, b.stringify = o, b.parse = u, b.fromJSON = l, b.list = m, b.comment = (y) => new p(y), b.atRule = (y) => new s(y), b.decl = (y) => new t(y), b.rule = (y) => new f(y), b.root = (y) => new g(y), b.document = (y) => new c(y), b.CssSyntaxError = e, b.Declaration = t, b.Container = n, b.Processor = i, b.Document = c, b.Comment = p, b.Warning = a, b.AtRule = s, b.Result = h, b.Input = d, b.Rule = f, b.Root = g, b.Node = x, r.registerPostcss(b), Oi = b, b.default = b, Oi;
}
var rm = tm();
const Me = /* @__PURE__ */ jf(rm);
Me.stringify;
Me.fromJSON;
Me.plugin;
Me.parse;
Me.list;
Me.document;
Me.comment;
Me.atRule;
Me.rule;
Me.decl;
Me.root;
Me.CssSyntaxError;
Me.Declaration;
Me.Container;
Me.Processor;
Me.Document;
Me.Comment;
Me.Warning;
Me.AtRule;
Me.Result;
Me.Input;
Me.Rule;
Me.Root;
Me.Node;
var nm = Object.defineProperty, im = (e, t, r) => t in e ? nm(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, rt = (e, t, r) => im(e, typeof t != "symbol" ? t + "" : t, r);
Date.now().toString();
function sm(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function om(e) {
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
var on = { exports: {} }, Sa;
function am() {
  if (Sa) return on.exports;
  Sa = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return on.exports = t(), on.exports.createColors = t, on.exports;
}
const lm = {}, cm = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: lm
}, Symbol.toStringTag, { value: "Module" })), ft = /* @__PURE__ */ om(cm);
var _i, Ca;
function _s() {
  if (Ca) return _i;
  Ca = 1;
  let e = /* @__PURE__ */ am(), t = ft;
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
  return _i = r, r.default = r, _i;
}
var an = {}, Ea;
function Ns() {
  return Ea || (Ea = 1, an.isClean = Symbol("isClean"), an.my = Symbol("my")), an;
}
var Ni, Ma;
function hc() {
  if (Ma) return Ni;
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
  return Ni = r, r.default = r, Ni;
}
var Pi, Ra;
function $n() {
  if (Ra) return Pi;
  Ra = 1;
  let e = hc();
  function t(r, n) {
    new e(n).stringify(r);
  }
  return Pi = t, t.default = t, Pi;
}
var $i, Aa;
function Dn() {
  if (Aa) return $i;
  Aa = 1;
  let { isClean: e, my: t } = Ns(), r = _s(), n = hc(), i = $n();
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
  return $i = l, l.default = l, $i;
}
var Di, Ta;
function zn() {
  if (Ta) return Di;
  Ta = 1;
  let e = Dn();
  class t extends e {
    constructor(n) {
      n && typeof n.value < "u" && typeof n.value != "string" && (n = { ...n, value: String(n.value) }), super(n), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return Di = t, t.default = t, Di;
}
var zi, La;
function um() {
  if (La) return zi;
  La = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return zi = { nanoid: (n = 21) => {
    let i = "", o = n;
    for (; o--; )
      i += e[Math.random() * 64 | 0];
    return i;
  }, customAlphabet: (n, i = 21) => (o = i) => {
    let l = "", c = o;
    for (; c--; )
      l += n[Math.random() * n.length | 0];
    return l;
  } }, zi;
}
var Fi, Ia;
function fc() {
  if (Ia) return Fi;
  Ia = 1;
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
  return Fi = c, c.default = c, Fi;
}
var Ui, Oa;
function Fn() {
  if (Oa) return Ui;
  Oa = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = ft, { fileURLToPath: r, pathToFileURL: n } = ft, { isAbsolute: i, resolve: o } = ft, { nanoid: l } = /* @__PURE__ */ um(), c = ft, a = _s(), p = fc(), s = Symbol("fromOffsetCache"), h = !!(e && t), d = !!(o && i);
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
        let S = g, I = x;
        if (typeof S.offset == "number") {
          let N = this.fromOffset(S.offset);
          g = N.line, x = N.col;
        } else
          g = S.line, x = S.column;
        if (typeof I.offset == "number") {
          let N = this.fromOffset(I.offset);
          C = N.line, w = N.col;
        } else
          C = I.line, w = I.column;
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
      let I = y.sourceContentFor(C.source);
      return I && (S.source = I), S;
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
  return Ui = u, u.default = u, c && c.registerInput && c.registerInput(u), Ui;
}
var Bi, _a;
function mc() {
  if (_a) return Bi;
  _a = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = ft, { dirname: r, relative: n, resolve: i, sep: o } = ft, { pathToFileURL: l } = ft, c = Fn(), a = !!(e && t), p = !!(r && i && n && o);
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
  return Bi = s, Bi;
}
var qi, Na;
function Un() {
  if (Na) return qi;
  Na = 1;
  let e = Dn();
  class t extends e {
    constructor(n) {
      super(n), this.type = "comment";
    }
  }
  return qi = t, t.default = t, qi;
}
var Wi, Pa;
function Zt() {
  if (Pa) return Wi;
  Pa = 1;
  let { isClean: e, my: t } = Ns(), r = zn(), n = Un(), i = Dn(), o, l, c, a;
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
  }, Wi = h, h.default = h, h.rebuild = (d) => {
    d.type === "atrule" ? Object.setPrototypeOf(d, c.prototype) : d.type === "rule" ? Object.setPrototypeOf(d, l.prototype) : d.type === "decl" ? Object.setPrototypeOf(d, r.prototype) : d.type === "comment" ? Object.setPrototypeOf(d, n.prototype) : d.type === "root" && Object.setPrototypeOf(d, a.prototype), d[t] = !0, d.nodes && d.nodes.forEach((u) => {
      h.rebuild(u);
    });
  }, Wi;
}
var ji, $a;
function Ps() {
  if ($a) return ji;
  $a = 1;
  let e = Zt(), t, r;
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
  }, ji = n, n.default = n, ji;
}
var Hi, Da;
function gc() {
  if (Da) return Hi;
  Da = 1;
  let e = {};
  return Hi = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, Hi;
}
var Vi, za;
function yc() {
  if (za) return Vi;
  za = 1;
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
  return Vi = e, e.default = e, Vi;
}
var Gi, Fa;
function $s() {
  if (Fa) return Gi;
  Fa = 1;
  let e = yc();
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
  return Gi = t, t.default = t, Gi;
}
var Yi, Ua;
function dm() {
  if (Ua) return Yi;
  Ua = 1;
  const e = 39, t = 34, r = 92, n = 47, i = 10, o = 32, l = 12, c = 9, a = 13, p = 91, s = 93, h = 40, d = 41, u = 123, m = 125, f = 59, g = 42, x = 58, b = 64, y = /[\t\n\f\r "#'()/;[\\\]{}]/g, C = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, w = /.[\r\n"'(/\\]/, k = /[\da-f]/i;
  return Yi = function(I, N = {}) {
    let O = I.css.valueOf(), J = N.ignoreErrors, H, L, De, se, Q, pe, be, he, ie, X, Ye = O.length, $ = 0, Be = [], $e = [];
    function qe() {
      return $;
    }
    function Ae(V) {
      throw I.error("Unclosed " + V, $);
    }
    function Qe() {
      return $e.length === 0 && $ >= Ye;
    }
    function Ct(V) {
      if ($e.length) return $e.pop();
      if ($ >= Ye) return;
      let Te = V ? V.ignoreUnclosed : !1;
      switch (H = O.charCodeAt($), H) {
        case i:
        case o:
        case c:
        case a:
        case l: {
          L = $;
          do
            L += 1, H = O.charCodeAt(L);
          while (H === o || H === i || H === c || H === a || H === l);
          X = ["space", O.slice($, L)], $ = L - 1;
          break;
        }
        case p:
        case s:
        case u:
        case m:
        case x:
        case f:
        case d: {
          let me = String.fromCharCode(H);
          X = [me, me, $];
          break;
        }
        case h: {
          if (he = Be.length ? Be.pop()[1] : "", ie = O.charCodeAt($ + 1), he === "url" && ie !== e && ie !== t && ie !== o && ie !== i && ie !== c && ie !== l && ie !== a) {
            L = $;
            do {
              if (pe = !1, L = O.indexOf(")", L + 1), L === -1)
                if (J || Te) {
                  L = $;
                  break;
                } else
                  Ae("bracket");
              for (be = L; O.charCodeAt(be - 1) === r; )
                be -= 1, pe = !pe;
            } while (pe);
            X = ["brackets", O.slice($, L + 1), $, L], $ = L;
          } else
            L = O.indexOf(")", $ + 1), se = O.slice($, L + 1), L === -1 || w.test(se) ? X = ["(", "(", $] : (X = ["brackets", se, $, L], $ = L);
          break;
        }
        case e:
        case t: {
          De = H === e ? "'" : '"', L = $;
          do {
            if (pe = !1, L = O.indexOf(De, L + 1), L === -1)
              if (J || Te) {
                L = $ + 1;
                break;
              } else
                Ae("string");
            for (be = L; O.charCodeAt(be - 1) === r; )
              be -= 1, pe = !pe;
          } while (pe);
          X = ["string", O.slice($, L + 1), $, L], $ = L;
          break;
        }
        case b: {
          y.lastIndex = $ + 1, y.test(O), y.lastIndex === 0 ? L = O.length - 1 : L = y.lastIndex - 2, X = ["at-word", O.slice($, L + 1), $, L], $ = L;
          break;
        }
        case r: {
          for (L = $, Q = !0; O.charCodeAt(L + 1) === r; )
            L += 1, Q = !Q;
          if (H = O.charCodeAt(L + 1), Q && H !== n && H !== o && H !== i && H !== c && H !== a && H !== l && (L += 1, k.test(O.charAt(L)))) {
            for (; k.test(O.charAt(L + 1)); )
              L += 1;
            O.charCodeAt(L + 1) === o && (L += 1);
          }
          X = ["word", O.slice($, L + 1), $, L], $ = L;
          break;
        }
        default: {
          H === n && O.charCodeAt($ + 1) === g ? (L = O.indexOf("*/", $ + 2) + 1, L === 0 && (J || Te ? L = O.length : Ae("comment")), X = ["comment", O.slice($, L + 1), $, L], $ = L) : (C.lastIndex = $ + 1, C.test(O), C.lastIndex === 0 ? L = O.length - 1 : L = C.lastIndex - 2, X = ["word", O.slice($, L + 1), $, L], Be.push(X), $ = L);
          break;
        }
      }
      return $++, X;
    }
    function ke(V) {
      $e.push(V);
    }
    return {
      back: ke,
      endOfFile: Qe,
      nextToken: Ct,
      position: qe
    };
  }, Yi;
}
var Ki, Ba;
function Ds() {
  if (Ba) return Ki;
  Ba = 1;
  let e = Zt();
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
  return Ki = t, t.default = t, e.registerAtRule(t), Ki;
}
var Xi, qa;
function Vr() {
  if (qa) return Xi;
  qa = 1;
  let e = Zt(), t, r;
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
  }, Xi = n, n.default = n, e.registerRoot(n), Xi;
}
var Ji, Wa;
function bc() {
  if (Wa) return Ji;
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
      let i = [], o = "", l = !1, c = 0, a = !1, p = "", s = !1;
      for (let h of t)
        s ? s = !1 : h === "\\" ? s = !0 : a ? h === p && (a = !1) : h === '"' || h === "'" ? (a = !0, p = h) : h === "(" ? c += 1 : h === ")" ? c > 0 && (c -= 1) : c === 0 && r.includes(h) && (l = !0), l ? (o !== "" && i.push(o.trim()), o = "", l = !1) : o += h;
      return (n || o !== "") && i.push(o.trim()), i;
    }
  };
  return Ji = e, e.default = e, Ji;
}
var Zi, ja;
function zs() {
  if (ja) return Zi;
  ja = 1;
  let e = Zt(), t = bc();
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
  return Zi = r, r.default = r, e.registerRule(r), Zi;
}
var Qi, Ha;
function pm() {
  if (Ha) return Qi;
  Ha = 1;
  let e = zn(), t = dm(), r = Un(), n = Ds(), i = Vr(), o = zs();
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
  return Qi = a, Qi;
}
var es, Va;
function Fs() {
  if (Va) return es;
  Va = 1;
  let e = Zt(), t = pm(), r = Fn();
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
  return es = n, n.default = n, e.registerParse(n), es;
}
var ts, Ga;
function vc() {
  if (Ga) return ts;
  Ga = 1;
  let { isClean: e, my: t } = Ns(), r = mc(), n = $n(), i = Zt(), o = Ps(), l = gc(), c = $s(), a = Fs(), p = Vr();
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
      let I;
      if (typeof k == "object" && k !== null && (k.type === "root" || k.type === "document"))
        I = x(k);
      else if (k instanceof y || k instanceof c)
        I = x(k.root), k.map && (typeof S.map > "u" && (S.map = {}), S.map.inline || (S.map.inline = !1), S.map.prev = k.map);
      else {
        let N = a;
        S.syntax && (N = S.syntax.parse), S.parser && (N = S.parser), N.parse && (N = N.parse);
        try {
          I = N(k, S);
        } catch (O) {
          this.processed = !0, this.error = O;
        }
        I && !I[t] && i.rebuild(I);
      }
      this.result = new c(w, I, S), this.helpers = { ...b, postcss: b, result: this.result }, this.plugins = this.processor.plugins.map((N) => typeof N == "object" && N.prepare ? { ...N, ...N.prepare(this.result) } : N);
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
          let I = S.postcssPlugin, N = S.postcssVersion, O = this.result.processor.version, J = N.split("."), H = O.split(".");
          (J[0] !== H[0] || parseInt(J[1]) > parseInt(H[1])) && console.error(
            "Unknown error from PostCSS plugin. Your current PostCSS version is " + O + ", but " + I + " uses " + N + ". Perhaps this is the source of the error below."
          );
        }
      } catch (I) {
        console && console.error && console.error(I);
      }
      return w;
    }
    prepareVisitors() {
      this.listeners = {};
      let w = (k, S, I) => {
        this.listeners[S] || (this.listeners[S] = []), this.listeners[S].push([k, I]);
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
                for (let I in k[S])
                  I === "*" ? w(k, S, k[S][I]) : w(
                    k,
                    S + "-" + I.toLowerCase(),
                    k[S][I]
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
            let S = this.visitTick(k);
            if (m(S))
              try {
                await S;
              } catch (I) {
                let N = k[k.length - 1].node;
                throw this.handleError(I, N);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [k, S] of this.listeners.OnceExit) {
            this.result.lastPlugin = k;
            try {
              if (w.type === "document") {
                let I = w.nodes.map(
                  (N) => S(N, this.helpers)
                );
                await Promise.all(I);
              } else
                await S(w, this.helpers);
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
      return process.env.NODE_ENV !== "production" && ("from" in this.opts || l(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(w, k);
    }
    toString() {
      return this.css;
    }
    visitSync(w, k) {
      for (let [S, I] of w) {
        this.result.lastPlugin = S;
        let N;
        try {
          N = I(k, this.helpers);
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
      let k = w[w.length - 1], { node: S, visitors: I } = k;
      if (S.type !== "root" && S.type !== "document" && !S.parent) {
        w.pop();
        return;
      }
      if (I.length > 0 && k.visitorIndex < I.length) {
        let [O, J] = I[k.visitorIndex];
        k.visitorIndex += 1, k.visitorIndex === I.length && (k.visitors = [], k.visitorIndex = 0), this.result.lastPlugin = O;
        try {
          return J(S.toProxy(), this.helpers);
        } catch (H) {
          throw this.handleError(H, S);
        }
      }
      if (k.iterator !== 0) {
        let O = k.iterator, J;
        for (; J = S.nodes[S.indexes[O]]; )
          if (S.indexes[O] += 1, !J[e]) {
            J[e] = !0, w.push(g(J));
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
          w.nodes && w.each((I) => {
            I[e] || this.walkSync(I);
          });
        else {
          let I = this.listeners[S];
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
  return y.registerPostcss = (C) => {
    b = C;
  }, ts = y, y.default = y, p.registerLazyResult(y), o.registerLazyResult(y), ts;
}
var rs, Ya;
function hm() {
  if (Ya) return rs;
  Ya = 1;
  let e = mc(), t = $n(), r = gc(), n = Fs();
  const i = $s();
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
  return rs = o, o.default = o, rs;
}
var ns, Ka;
function fm() {
  if (Ka) return ns;
  Ka = 1;
  let e = hm(), t = vc(), r = Ps(), n = Vr();
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
  return ns = i, i.default = i, n.registerProcessor(i), r.registerProcessor(i), ns;
}
var is, Xa;
function mm() {
  if (Xa) return is;
  Xa = 1;
  let e = zn(), t = fc(), r = Un(), n = Ds(), i = Fn(), o = Vr(), l = zs();
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
  return is = c, c.default = c, is;
}
var ss, Ja;
function gm() {
  if (Ja) return ss;
  Ja = 1;
  let e = _s(), t = zn(), r = vc(), n = Zt(), i = fm(), o = $n(), l = mm(), c = Ps(), a = yc(), p = Un(), s = Ds(), h = $s(), d = Fn(), u = Fs(), m = bc(), f = zs(), g = Vr(), x = Dn();
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
    let I;
    return Object.defineProperty(S, "postcss", {
      get() {
        return I || (I = S()), I;
      }
    }), S.process = function(N, O, J) {
      return b([S(J)]).process(N, O);
    }, S;
  }, b.stringify = o, b.parse = u, b.fromJSON = l, b.list = m, b.comment = (y) => new p(y), b.atRule = (y) => new s(y), b.decl = (y) => new t(y), b.rule = (y) => new f(y), b.root = (y) => new g(y), b.document = (y) => new c(y), b.CssSyntaxError = e, b.Declaration = t, b.Container = n, b.Processor = i, b.Document = c, b.Comment = p, b.Warning = a, b.AtRule = s, b.Result = h, b.Input = d, b.Rule = f, b.Root = g, b.Node = x, r.registerPostcss(b), ss = b, b.default = b, ss;
}
var ym = gm();
const Re = /* @__PURE__ */ sm(ym);
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
class Us {
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
    if (t instanceof Us) {
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
const Za = {
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
}, Qa = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, ln = {}, kc = {}, bm = () => !!globalThis.Zone;
function Bs(e) {
  if (ln[e])
    return ln[e];
  const t = globalThis[e], r = t.prototype, n = e in Za ? Za[e] : void 0, i = !!(n && // @ts-expect-error 2345
  n.every(
    (c) => {
      var a, p;
      return !!((p = (a = Object.getOwnPropertyDescriptor(r, c)) == null ? void 0 : a.get) != null && p.toString().includes("[native code]"));
    }
  )), o = e in Qa ? Qa[e] : void 0, l = !!(o && o.every(
    // @ts-expect-error 2345
    (c) => {
      var a;
      return typeof r[c] == "function" && ((a = r[c]) == null ? void 0 : a.toString().includes("[native code]"));
    }
  ));
  if (i && l && !bm())
    return ln[e] = t.prototype, t.prototype;
  try {
    const c = document.createElement("iframe");
    c.style.display = "none", document.body.appendChild(c);
    const a = c.contentWindow;
    if (!a) return t.prototype;
    const p = a[e].prototype;
    if (!p)
      return c.remove(), r;
    const s = navigator.userAgent;
    return s.includes("Safari") && !s.includes("Chrome") ? (c.classList.add("rr-block"), c.setAttribute("__rrwebUntaintedMutationObserver", ""), kc[e] = () => c.remove()) : c.remove(), ln[e] = p;
  } catch {
    return r;
  }
}
const os = {};
function Lt(e, t, r) {
  var n;
  const i = `${e}.${String(r)}`;
  if (os[i])
    return os[i].call(
      t
    );
  const o = Bs(e), l = (n = Object.getOwnPropertyDescriptor(
    o,
    r
  )) == null ? void 0 : n.get;
  return l ? (os[i] = l, l.call(t)) : t[r];
}
const as = {};
function wc(e, t, r) {
  const n = `${e}.${String(r)}`;
  if (as[n])
    return as[n].bind(
      t
    );
  const o = Bs(e)[r];
  return typeof o != "function" ? t[r] : (as[n] = o, o.bind(t));
}
function vm(e) {
  return Lt("Node", e, "ownerDocument");
}
function km(e) {
  return Lt("Node", e, "childNodes");
}
function wm(e) {
  return Lt("Node", e, "parentNode");
}
function xm(e) {
  return Lt("Node", e, "parentElement");
}
function Sm(e) {
  return Lt("Node", e, "textContent");
}
function Cm(e, t) {
  return wc("Node", e, "contains")(t);
}
function Em(e) {
  return wc("Node", e, "getRootNode")();
}
function Mm(e) {
  return !e || !("host" in e) ? null : Lt("ShadowRoot", e, "host");
}
function Rm(e) {
  return e.styleSheets;
}
function Am(e) {
  return !e || !("shadowRoot" in e) ? null : Lt("Element", e, "shadowRoot");
}
function Tm(e, t) {
  return Lt("Element", e, "querySelector")(t);
}
function Lm(e, t) {
  return Lt("Element", e, "querySelectorAll")(t);
}
function xc() {
  return [
    Bs("MutationObserver").constructor,
    kc.MutationObserver ?? (() => {
    })
  ];
}
let qr = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (qr = () => (/* @__PURE__ */ new Date()).getTime());
function Qt(e, t, r) {
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
  ownerDocument: vm,
  childNodes: km,
  parentNode: wm,
  parentElement: xm,
  textContent: Sm,
  contains: Cm,
  getRootNode: Em,
  host: Mm,
  styleSheets: Rm,
  shadowRoot: Am,
  querySelector: Tm,
  querySelectorAll: Lm,
  nowTimestamp: qr,
  mutationObserverCtor: xc,
  patch: Qt
};
function Ve(e, t, r = document) {
  const n = { capture: !0, passive: !0 };
  return r.addEventListener(e, t, n), () => r.removeEventListener(e, t, n);
}
const ur = `Please stop import mirror directly. Instead of that,\r
now you can use replayer.getMirror() to access the mirror instance of a replayer,\r
or you can use record.mirror to access the mirror instance during recording.`;
let el = {
  map: {},
  getId() {
    return console.error(ur), -1;
  },
  getNode() {
    return console.error(ur), null;
  },
  removeNodeFromMap() {
    console.error(ur);
  },
  has() {
    return console.error(ur), !1;
  },
  reset() {
    console.error(ur);
  }
};
typeof window < "u" && window.Proxy && window.Reflect && (el = new Proxy(el, {
  get(e, t, r) {
    return t === "map" && console.error(ur), Reflect.get(e, t, r);
  }
}));
function Wr(e, t, r = {}) {
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
function Bn(e, t, r, n, i = window) {
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
  ), () => Bn(e, t, o || {}, !0);
}
function Sc(e) {
  var t, r, n, i;
  const o = e.document;
  return {
    left: o.scrollingElement ? o.scrollingElement.scrollLeft : e.pageXOffset !== void 0 ? e.pageXOffset : o.documentElement.scrollLeft || (o == null ? void 0 : o.body) && ((t = oe.parentElement(o.body)) == null ? void 0 : t.scrollLeft) || ((r = o == null ? void 0 : o.body) == null ? void 0 : r.scrollLeft) || 0,
    top: o.scrollingElement ? o.scrollingElement.scrollTop : e.pageYOffset !== void 0 ? e.pageYOffset : (o == null ? void 0 : o.documentElement.scrollTop) || (o == null ? void 0 : o.body) && ((n = oe.parentElement(o.body)) == null ? void 0 : n.scrollTop) || ((i = o == null ? void 0 : o.body) == null ? void 0 : i.scrollTop) || 0
  };
}
function Cc() {
  return window.innerHeight || document.documentElement && document.documentElement.clientHeight || document.body && document.body.clientHeight;
}
function Ec() {
  return window.innerWidth || document.documentElement && document.documentElement.clientWidth || document.body && document.body.clientWidth;
}
function Mc(e) {
  return e ? e.nodeType === e.ELEMENT_NODE ? e : oe.parentElement(e) : null;
}
function Ge(e, t, r, n) {
  if (!e)
    return !1;
  const i = Mc(e);
  if (!i)
    return !1;
  try {
    if (typeof t == "string") {
      if (i.classList.contains(t) || n && i.closest("." + t) !== null) return !0;
    } else if (wn(i, t, n)) return !0;
  } catch {
  }
  return !!(r && (i.matches(r) || n && i.closest(r) !== null));
}
function Im(e, t) {
  return t.getId(e) !== -1;
}
function ls(e, t, r) {
  return e.tagName === "TITLE" && r.headTitleMutations ? !0 : t.getId(e) === Br;
}
function Rc(e, t) {
  if (Pr(e))
    return !1;
  const r = t.getId(e);
  if (!t.has(r))
    return !0;
  const n = oe.parentNode(e);
  return n && n.nodeType === e.DOCUMENT_NODE ? !1 : n ? Rc(n, t) : !0;
}
function fs(e) {
  return !!e.changedTouches;
}
function Om(e = window) {
  "NodeList" in e && !e.NodeList.prototype.forEach && (e.NodeList.prototype.forEach = Array.prototype.forEach), "DOMTokenList" in e && !e.DOMTokenList.prototype.forEach && (e.DOMTokenList.prototype.forEach = Array.prototype.forEach);
}
function Ac(e, t) {
  return !!(e.nodeName === "IFRAME" && t.getMeta(e));
}
function Tc(e, t) {
  return !!(e.nodeName === "LINK" && e.nodeType === e.ELEMENT_NODE && e.getAttribute && e.getAttribute("rel") === "stylesheet" && t.getMeta(e));
}
function ms(e) {
  return e ? e instanceof Us && "shadowRoot" in e ? !!e.shadowRoot : !!oe.shadowRoot(e) : !1;
}
class _m {
  constructor() {
    U(this, "id", 1), U(this, "styleIDMap", /* @__PURE__ */ new WeakMap()), U(this, "idStyleMap", /* @__PURE__ */ new Map());
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
function Lc(e) {
  var t;
  let r = null;
  return "getRootNode" in e && ((t = oe.getRootNode(e)) == null ? void 0 : t.nodeType) === Node.DOCUMENT_FRAGMENT_NODE && oe.host(oe.getRootNode(e)) && (r = oe.host(oe.getRootNode(e))), r;
}
function Nm(e) {
  let t = e, r;
  for (; r = Lc(t); )
    t = r;
  return t;
}
function Pm(e) {
  const t = oe.ownerDocument(e);
  if (!t) return !1;
  const r = Nm(e);
  return oe.contains(t, r);
}
function Ic(e) {
  const t = oe.ownerDocument(e);
  return t ? oe.contains(t, e) || Pm(e) : !1;
}
var de = /* @__PURE__ */ ((e) => (e[e.DomContentLoaded = 0] = "DomContentLoaded", e[e.Load = 1] = "Load", e[e.FullSnapshot = 2] = "FullSnapshot", e[e.IncrementalSnapshot = 3] = "IncrementalSnapshot", e[e.Meta = 4] = "Meta", e[e.Custom = 5] = "Custom", e[e.Plugin = 6] = "Plugin", e[e.Asset = 7] = "Asset", e))(de || {}), le = /* @__PURE__ */ ((e) => (e[e.Mutation = 0] = "Mutation", e[e.MouseMove = 1] = "MouseMove", e[e.MouseInteraction = 2] = "MouseInteraction", e[e.Scroll = 3] = "Scroll", e[e.ViewportResize = 4] = "ViewportResize", e[e.Input = 5] = "Input", e[e.TouchMove = 6] = "TouchMove", e[e.MediaInteraction = 7] = "MediaInteraction", e[e.StyleSheetRule = 8] = "StyleSheetRule", e[e.CanvasMutation = 9] = "CanvasMutation", e[e.Font = 10] = "Font", e[e.Log = 11] = "Log", e[e.Drag = 12] = "Drag", e[e.StyleDeclaration = 13] = "StyleDeclaration", e[e.Selection = 14] = "Selection", e[e.AdoptedStyleSheet = 15] = "AdoptedStyleSheet", e[e.CustomElement = 16] = "CustomElement", e))(le || {}), Ze = /* @__PURE__ */ ((e) => (e[e.MouseUp = 0] = "MouseUp", e[e.MouseDown = 1] = "MouseDown", e[e.Click = 2] = "Click", e[e.ContextMenu = 3] = "ContextMenu", e[e.DblClick = 4] = "DblClick", e[e.Focus = 5] = "Focus", e[e.Blur = 6] = "Blur", e[e.TouchStart = 7] = "TouchStart", e[e.TouchMove_Departed = 8] = "TouchMove_Departed", e[e.TouchEnd = 9] = "TouchEnd", e[e.TouchCancel = 10] = "TouchCancel", e))(Ze || {}), At = /* @__PURE__ */ ((e) => (e[e.Mouse = 0] = "Mouse", e[e.Pen = 1] = "Pen", e[e.Touch = 2] = "Touch", e))(At || {}), Sr = /* @__PURE__ */ ((e) => (e[e["2D"] = 0] = "2D", e[e.WebGL = 1] = "WebGL", e[e.WebGL2 = 2] = "WebGL2", e))(Sr || {}), dr = /* @__PURE__ */ ((e) => (e[e.Play = 0] = "Play", e[e.Pause = 1] = "Pause", e[e.Seeked = 2] = "Seeked", e[e.VolumeChange = 3] = "VolumeChange", e[e.RateChange = 4] = "RateChange", e))(dr || {}), Oc = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(Oc || {});
function tl(e) {
  return "__ln" in e;
}
class $m {
  constructor() {
    U(this, "length", 0), U(this, "head", null), U(this, "tail", null);
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
    if (t.__ln = r, t.previousSibling && tl(t.previousSibling)) {
      const n = t.previousSibling.__ln.next;
      r.next = n, r.previous = t.previousSibling.__ln, t.previousSibling.__ln.next = r, n && (n.previous = r);
    } else if (t.nextSibling && tl(t.nextSibling) && t.nextSibling.__ln.previous) {
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
const rl = (e, t) => `${e}@${t}`;
class Dm {
  constructor() {
    U(this, "frozen", !1), U(this, "locked", !1), U(this, "texts", []), U(this, "attributes", []), U(this, "attributeMap", /* @__PURE__ */ new WeakMap()), U(this, "removes", []), U(this, "mapRemoves", []), U(this, "movedMap", {}), U(this, "addedSet", /* @__PURE__ */ new Set()), U(this, "movedSet", /* @__PURE__ */ new Set()), U(this, "droppedSet", /* @__PURE__ */ new Set()), U(this, "removesSubTreeCache", /* @__PURE__ */ new Set()), U(this, "mutationCb"), U(this, "blockClass"), U(this, "blockSelector"), U(this, "maskTextClass"), U(this, "maskTextSelector"), U(this, "inlineStylesheet"), U(this, "maskInputOptions"), U(this, "maskTextFn"), U(this, "maskInputFn"), U(this, "keepIframeSrcFn"), U(this, "recordCanvas"), U(this, "inlineImages"), U(this, "slimDOMOptions"), U(this, "dataURLOptions"), U(this, "doc"), U(this, "mirror"), U(this, "iframeManager"), U(this, "stylesheetManager"), U(this, "shadowDomManager"), U(this, "canvasManager"), U(this, "processedNodeManager"), U(this, "unattachedDoc"), U(this, "processMutations", (t) => {
      t.forEach(this.processMutation), this.emit();
    }), U(this, "emit", () => {
      if (this.frozen || this.locked)
        return;
      const t = [], r = /* @__PURE__ */ new Set(), n = new $m(), i = (a) => {
        let p = a, s = Br;
        for (; s === Br; )
          p = p && p.nextSibling, s = p && this.mirror.getId(p);
        return s;
      }, o = (a) => {
        const p = oe.parentNode(a);
        if (!p || !Ic(a))
          return;
        let s = !1;
        if (a.nodeType === Node.TEXT_NODE) {
          const m = p.tagName;
          if (m === "TEXTAREA")
            return;
          m === "STYLE" && this.addedSet.has(p) && (s = !0);
        }
        const h = Pr(p) ? this.mirror.getId(Lc(a)) : this.mirror.getId(p), d = i(a);
        if (h === -1 || d === -1)
          return n.addNode(a);
        const u = hr(a, {
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
            Ac(m, this.mirror) && this.iframeManager.addIframe(m), Tc(m, this.mirror) && this.stylesheetManager.trackLinkElement(
              m
            ), ms(a) && this.shadowDomManager.addShadowRoot(oe.shadowRoot(a), this.doc);
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
        nl(this.removesSubTreeCache, a, this.mirror) && !this.movedSet.has(oe.parentNode(a)) || o(a);
      for (const a of this.addedSet)
        !il(this.droppedSet, a) && !nl(this.removesSubTreeCache, a, this.mirror) || il(this.movedSet, a) ? o(a) : this.droppedSet.add(a);
      let l = null;
      for (; n.length; ) {
        let a = null;
        if (l) {
          const p = this.mirror.getId(oe.parentNode(l.value)), s = i(l.value);
          p !== -1 && s !== -1 && (a = l);
        }
        if (!a) {
          let p = n.tail;
          for (; p; ) {
            const s = p;
            if (p = p.previous, s) {
              const h = this.mirror.getId(oe.parentNode(s.value));
              if (i(s.value) === -1) continue;
              if (h !== -1) {
                a = s;
                break;
              } else {
                const u = s.value, m = oe.parentNode(u);
                if (m && m.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                  const f = oe.host(m);
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
          const p = a.node, s = oe.parentNode(p);
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
    }), U(this, "genTextAreaValueMutation", (t) => {
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
      r.attributes.value = bn({
        element: t,
        maskInputOptions: this.maskInputOptions,
        tagName: t.tagName,
        type: vn(t),
        value: n,
        maskInputFn: this.maskInputFn
      });
    }), U(this, "processMutation", (t) => {
      if (!ls(t.target, this.mirror, this.slimDOMOptions))
        switch (t.type) {
          case "characterData": {
            const r = oe.textContent(t.target);
            !Ge(t.target, this.blockClass, this.blockSelector, !1) && r !== t.oldValue && this.texts.push({
              value: ic(
                t.target,
                this.maskTextClass,
                this.maskTextSelector,
                !0
                // checkAncestors
              ) && r ? this.maskTextFn ? this.maskTextFn(r, Mc(t.target)) : r.replace(/[\S]/g, "*") : r,
              node: t.target
            });
            break;
          }
          case "attributes": {
            const r = t.target;
            let n = t.attributeName, i = t.target.getAttribute(n);
            if (n === "value") {
              const l = vn(r);
              i = bn({
                element: r,
                maskInputOptions: this.maskInputOptions,
                tagName: r.tagName,
                type: l,
                value: i,
                maskInputFn: this.maskInputFn
              });
            }
            if (Ge(t.target, this.blockClass, this.blockSelector, !1) || i === t.oldValue)
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
            }, this.attributes.push(o), this.attributeMap.set(t.target, o)), n === "type" && r.tagName === "INPUT" && (t.oldValue || "").toLowerCase() === "password" && r.setAttribute("data-rr-is-password", "true"), !nc(r.tagName, n))
              if (o.attributes[n] = rc(
                this.doc,
                Xt(r.tagName),
                Xt(n),
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
            if (Ge(t.target, this.blockClass, this.blockSelector, !0))
              return;
            if (t.target.tagName === "TEXTAREA") {
              this.genTextAreaValueMutation(t.target);
              return;
            }
            t.addedNodes.forEach((r) => this.genAdds(r, t.target)), t.removedNodes.forEach((r) => {
              const n = this.mirror.getId(r), i = Pr(t.target) ? this.mirror.getId(oe.host(t.target)) : this.mirror.getId(t.target);
              Ge(t.target, this.blockClass, this.blockSelector, !1) || ls(r, this.mirror, this.slimDOMOptions) || !Im(r, this.mirror) || (this.addedSet.has(r) ? (gs(this.addedSet, r), this.droppedSet.add(r)) : this.addedSet.has(t.target) && n === -1 || Rc(t.target, this.mirror) || (this.movedSet.has(r) && this.movedMap[rl(n, i)] ? gs(this.movedSet, r) : (this.removes.push({
                parentId: i,
                id: n,
                isShadow: Pr(t.target) && $r(t.target) ? !0 : void 0
              }), zm(r, this.removesSubTreeCache))), this.mapRemoves.push(r));
            });
            break;
          }
        }
    }), U(this, "genAdds", (t, r) => {
      if (!this.processedNodeManager.inOtherBuffer(t, this) && !(this.addedSet.has(t) || this.movedSet.has(t))) {
        if (this.mirror.hasNode(t)) {
          if (ls(t, this.mirror, this.slimDOMOptions))
            return;
          this.movedSet.add(t);
          let n = null;
          r && this.mirror.hasNode(r) && (n = this.mirror.getId(r)), n && n !== -1 && (this.movedMap[rl(this.mirror.getId(t), n)] = !0);
        } else
          this.addedSet.add(t), this.droppedSet.delete(t);
        Ge(t, this.blockClass, this.blockSelector, !1) || (oe.childNodes(t).forEach((n) => this.genAdds(n)), ms(t) && oe.childNodes(oe.shadowRoot(t)).forEach((n) => {
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
function gs(e, t) {
  e.delete(t), oe.childNodes(t).forEach((r) => gs(e, r));
}
function zm(e, t) {
  const r = [e];
  for (; r.length; ) {
    const n = r.pop();
    t.has(n) || (t.add(n), oe.childNodes(n).forEach((i) => r.push(i)));
  }
}
function nl(e, t, r) {
  return e.size === 0 ? !1 : Fm(e, t);
}
function Fm(e, t, r) {
  const n = oe.parentNode(t);
  return n ? e.has(n) : !1;
}
function il(e, t) {
  return e.size === 0 ? !1 : _c(e, t);
}
function _c(e, t) {
  const r = oe.parentNode(t);
  return r ? e.has(r) ? !0 : _c(e, r) : !1;
}
let Dr;
function Um(e) {
  Dr = e;
}
function Bm() {
  Dr = void 0;
}
const ue = (e) => Dr ? (...r) => {
  try {
    return e(...r);
  } catch (n) {
    if (Dr && Dr(n) === !0)
      return;
    throw n;
  }
} : e, Gt = [];
function Gr(e) {
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
function Nc(e, t) {
  const r = new Dm();
  Gt.push(r), r.init(e);
  const [n, i] = xc(), o = new n(
    ue(r.processMutations.bind(r))
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
function qm({
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
  const a = Wr(
    ue(
      (h) => {
        const d = Date.now() - c;
        e(
          l.map((u) => (u.timeOffset -= d, u)),
          h
        ), l = [], c = null;
      }
    ),
    o
  ), p = ue(
    Wr(
      ue((h) => {
        const d = Gr(h), { clientX: u, clientY: m } = fs(h) ? h.changedTouches[0] : h;
        c || (c = qr()), l.push({
          x: u,
          y: m,
          id: n.getId(d),
          timeOffset: qr() - c
        }), a(
          typeof DragEvent < "u" && h instanceof DragEvent ? le.Drag : h instanceof MouseEvent ? le.MouseMove : le.TouchMove
        );
      }),
      i,
      {
        trailing: !1
      }
    )
  ), s = [
    Ve("mousemove", p, r),
    Ve("touchmove", p, r),
    Ve("drag", p, r)
  ];
  return ue(() => {
    s.forEach((h) => h());
  });
}
function Wm({
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
    const d = Gr(h);
    if (Ge(d, n, i, !0))
      return;
    let u = null, m = s;
    if ("pointerType" in h) {
      switch (h.pointerType) {
        case "mouse":
          u = At.Mouse;
          break;
        case "touch":
          u = At.Touch;
          break;
        case "pen":
          u = At.Pen;
          break;
      }
      u === At.Touch ? Ze[s] === Ze.MouseDown ? m = "TouchStart" : Ze[s] === Ze.MouseUp && (m = "TouchEnd") : At.Pen;
    } else fs(h) && (u = At.Touch);
    u !== null ? (a = u, (m.startsWith("Touch") && u === At.Touch || m.startsWith("Mouse") && u === At.Mouse) && (u = null)) : Ze[s] === Ze.Click && (u = a, a = null);
    const f = fs(h) ? h.changedTouches[0] : h;
    if (!f)
      return;
    const g = r.getId(d), { clientX: x, clientY: b } = f;
    ue(e)({
      type: Ze[m],
      id: g,
      x,
      y: b,
      ...u !== null && { pointerType: u }
    });
  };
  return Object.keys(Ze).filter(
    (s) => Number.isNaN(Number(s)) && !s.endsWith("_Departed") && l[s] !== !1
  ).forEach((s) => {
    let h = Xt(s);
    const d = p(s);
    if (window.PointerEvent)
      switch (Ze[s]) {
        case Ze.MouseDown:
        case Ze.MouseUp:
          h = h.replace(
            "mouse",
            "pointer"
          );
          break;
        case Ze.TouchStart:
        case Ze.TouchEnd:
          return;
      }
    c.push(Ve(h, d, t));
  }), ue(() => {
    c.forEach((s) => s());
  });
}
function Pc({
  scrollCb: e,
  doc: t,
  mirror: r,
  blockClass: n,
  blockSelector: i,
  sampling: o
}) {
  const l = ue(
    Wr(
      ue((c) => {
        const a = Gr(c);
        if (!a || Ge(a, n, i, !0))
          return;
        const p = r.getId(a);
        if (a === t && t.defaultView) {
          const s = Sc(t.defaultView);
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
  return Ve("scroll", l, t);
}
function jm({ viewportResizeCb: e }, { win: t }) {
  let r = -1, n = -1;
  const i = ue(
    Wr(
      ue(() => {
        const o = Cc(), l = Ec();
        (r !== o || n !== l) && (e({
          width: Number(l),
          height: Number(o)
        }), r = o, n = l);
      }),
      200
    )
  );
  return Ve("resize", i, t);
}
const Hm = ["INPUT", "TEXTAREA", "SELECT"], sl = /* @__PURE__ */ new WeakMap();
function Vm({
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
    let y = Gr(b);
    const C = b.isTrusted, w = y && y.tagName;
    if (y && w === "OPTION" && (y = oe.parentElement(y)), !y || !w || Hm.indexOf(w) < 0 || Ge(y, n, i, !0) || y.classList.contains(o) || l && y.matches(l))
      return;
    let k = y.value, S = !1;
    const I = vn(y) || "";
    I === "radio" || I === "checkbox" ? S = y.checked : (c[w.toLowerCase()] || c[I]) && (k = bn({
      element: y,
      maskInputOptions: c,
      tagName: w,
      type: I,
      value: k,
      maskInputFn: a
    })), d(
      y,
      s ? { text: k, isChecked: S, userTriggered: C } : { text: k, isChecked: S }
    );
    const N = y.name;
    I === "radio" && N && S && t.querySelectorAll(`input[type="radio"][name="${N}"]`).forEach((O) => {
      if (O !== y) {
        const J = O.value;
        d(
          O,
          s ? { text: J, isChecked: !S, userTriggered: !1 } : { text: J, isChecked: !S }
        );
      }
    });
  }
  function d(b, y) {
    const C = sl.get(b);
    if (!C || C.text !== y.text || C.isChecked !== y.isChecked) {
      sl.set(b, y);
      const w = r.getId(b);
      ue(e)({
        ...y,
        id: w
      });
    }
  }
  const m = (p.input === "last" ? ["change"] : ["input", "change"]).map(
    (b) => Ve(b, ue(h), t)
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
      (b) => Bn(
        b[0],
        b[1],
        {
          set() {
            ue(h)({
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
  ), ue(() => {
    m.forEach((b) => b());
  });
}
function xn(e) {
  const t = [];
  function r(n, i) {
    if (cn("CSSGroupingRule") && n.parentRule instanceof CSSGroupingRule || cn("CSSMediaRule") && n.parentRule instanceof CSSMediaRule || cn("CSSSupportsRule") && n.parentRule instanceof CSSSupportsRule || cn("CSSConditionRule") && n.parentRule instanceof CSSConditionRule) {
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
function Gm({ styleSheetRuleCb: e, mirror: t, stylesheetManager: r }, { win: n }) {
  if (!n.CSSStyleSheet || !n.CSSStyleSheet.prototype)
    return () => {
    };
  const i = n.CSSStyleSheet.prototype.insertRule;
  n.CSSStyleSheet.prototype.insertRule = new Proxy(i, {
    apply: ue(
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
    apply: ue(
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
    apply: ue(
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
    apply: ue(
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
  un("CSSGroupingRule") ? a.CSSGroupingRule = n.CSSGroupingRule : (un("CSSMediaRule") && (a.CSSMediaRule = n.CSSMediaRule), un("CSSConditionRule") && (a.CSSConditionRule = n.CSSConditionRule), un("CSSSupportsRule") && (a.CSSSupportsRule = n.CSSSupportsRule));
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
        apply: ue(
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
                    ...xn(u),
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
        apply: ue(
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
                { index: [...xn(u), f] }
              ]
            }), d.apply(u, m);
          }
        )
      }
    );
  }), ue(() => {
    n.CSSStyleSheet.prototype.insertRule = i, n.CSSStyleSheet.prototype.deleteRule = o, l && (n.CSSStyleSheet.prototype.replace = l), c && (n.CSSStyleSheet.prototype.replaceSync = c), Object.entries(a).forEach(([s, h]) => {
      h.prototype.insertRule = p[s].insertRule, h.prototype.deleteRule = p[s].deleteRule;
    });
  });
}
function $c({
  mirror: e,
  stylesheetManager: t
}, r) {
  var n, i, o;
  let l = null;
  r.nodeName === "#document" ? l = e.getId(r) : l = e.getId(oe.host(r));
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
  }), ue(() => {
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
function Ym({
  styleDeclarationCb: e,
  mirror: t,
  ignoreCSSAttributes: r,
  stylesheetManager: n
}, { win: i }) {
  const o = i.CSSStyleDeclaration.prototype.setProperty;
  i.CSSStyleDeclaration.prototype.setProperty = new Proxy(o, {
    apply: ue(
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
          index: xn(a.parentRule)
        }), c.apply(a, p);
      }
    )
  });
  const l = i.CSSStyleDeclaration.prototype.removeProperty;
  return i.CSSStyleDeclaration.prototype.removeProperty = new Proxy(l, {
    apply: ue(
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
          index: xn(a.parentRule)
        }), c.apply(a, p);
      }
    )
  }), ue(() => {
    i.CSSStyleDeclaration.prototype.setProperty = o, i.CSSStyleDeclaration.prototype.removeProperty = l;
  });
}
function Km({
  mediaInteractionCb: e,
  blockClass: t,
  blockSelector: r,
  mirror: n,
  sampling: i,
  doc: o
}) {
  const l = ue(
    (a) => Wr(
      ue((p) => {
        const s = Gr(p);
        if (!s || Ge(s, t, r, !0))
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
    Ve("play", l(dr.Play), o),
    Ve("pause", l(dr.Pause), o),
    Ve("seeked", l(dr.Seeked), o),
    Ve("volumechange", l(dr.VolumeChange), o),
    Ve("ratechange", l(dr.RateChange), o)
  ];
  return ue(() => {
    c.forEach((a) => a());
  });
}
function Xm({ fontCb: e, doc: t }) {
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
  const l = Qt(
    t.fonts,
    "add",
    function(c) {
      return function(a) {
        return setTimeout(
          ue(() => {
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
  }), n.push(l), ue(() => {
    n.forEach((c) => c());
  });
}
function Jm(e) {
  const { doc: t, mirror: r, blockClass: n, blockSelector: i, selectionCb: o } = e;
  let l = !0;
  const c = ue(() => {
    const a = t.getSelection();
    if (!a || l && (a != null && a.isCollapsed)) return;
    l = a.isCollapsed || !1;
    const p = [], s = a.rangeCount || 0;
    for (let h = 0; h < s; h++) {
      const d = a.getRangeAt(h), { startContainer: u, startOffset: m, endContainer: f, endOffset: g } = d;
      Ge(u, n, i, !0) || Ge(f, n, i, !0) || p.push({
        start: r.getId(u),
        startOffset: m,
        end: r.getId(f),
        endOffset: g
      });
    }
    o({ ranges: p });
  });
  return c(), Ve("selectionchange", c);
}
function Zm({
  doc: e,
  customElementCb: t
}) {
  const r = e.defaultView;
  return !r || !r.customElements ? () => {
  } : Qt(
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
function Qm(e, t) {
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
function eg(e, t = {}) {
  const r = e.doc.defaultView;
  if (!r)
    return () => {
    };
  Qm(e, t);
  let n, i = () => {
  };
  e.recordDOM && ([n, i] = Nc(e, e.doc));
  const o = qm(e), l = Wm(e), c = Pc(e), a = jm(e, {
    win: r
  }), p = Vm(e), s = Km(e);
  let h = () => {
  }, d = () => {
  }, u = () => {
  }, m = () => {
  };
  e.recordDOM && (h = Gm(e, { win: r }), d = $c(e, e.doc), u = Ym(e, {
    win: r
  }), e.collectFonts && (m = Xm(e)));
  const f = Jm(e), g = Zm(e), x = [];
  for (const b of e.plugins)
    x.push(
      b.observer(b.callback, r, b.options)
    );
  return ue(() => {
    Gt.forEach((b) => b.reset()), n == null || n.disconnect(), i(), o(), l(), c(), a(), p(), s(), h(), d(), u(), m(), f(), g(), x.forEach((b) => b());
  });
}
function cn(e) {
  return typeof window[e] < "u";
}
function un(e) {
  return !!(typeof window[e] < "u" && // Note: Generally, this check _shouldn't_ be necessary
  // However, in some scenarios (e.g. jsdom) this can sometimes fail, so we check for it here
  window[e].prototype && "insertRule" in window[e].prototype && "deleteRule" in window[e].prototype);
}
class ol {
  constructor(t) {
    U(this, "iframeIdToRemoteIdMap", /* @__PURE__ */ new WeakMap()), U(this, "iframeRemoteIdToIdMap", /* @__PURE__ */ new WeakMap()), this.generateIdFn = t;
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
class tg {
  constructor(t) {
    U(this, "iframes", /* @__PURE__ */ new WeakMap()), U(this, "crossOriginIframeMap", /* @__PURE__ */ new WeakMap()), U(this, "crossOriginIframeMirror", new ol(tc)), U(this, "crossOriginIframeStyleMirror"), U(this, "crossOriginIframeRootIdMap", /* @__PURE__ */ new WeakMap()), U(this, "mirror"), U(this, "mutationCb"), U(this, "wrappedEmit"), U(this, "loadListener"), U(this, "stylesheetManager"), U(this, "recordCrossOriginIframes"), this.mutationCb = t.mutationCb, this.wrappedEmit = t.wrappedEmit, this.stylesheetManager = t.stylesheetManager, this.recordCrossOriginIframes = t.recordCrossOriginIframes, this.crossOriginIframeStyleMirror = new ol(
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
    t.type !== Oc.Document && !t.rootId && (t.rootId = r), "childNodes" in t && t.childNodes.forEach((n) => {
      this.patchRootIdOnNode(n, r);
    });
  }
}
class rg {
  constructor(t) {
    U(this, "shadowDoms", /* @__PURE__ */ new WeakSet()), U(this, "mutationCb"), U(this, "scrollCb"), U(this, "bypassOptions"), U(this, "mirror"), U(this, "restoreHandlers", []), this.mutationCb = t.mutationCb, this.scrollCb = t.scrollCb, this.bypassOptions = t.bypassOptions, this.mirror = t.mirror, this.init();
  }
  init() {
    this.reset(), this.patchAttachShadow(Element, document);
  }
  addShadowRoot(t, r) {
    if (!$r(t) || this.shadowDoms.has(t)) return;
    this.shadowDoms.add(t);
    const [n] = Nc(
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
      Pc({
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
        $c(
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
      Qt(
        t.prototype,
        "attachShadow",
        function(i) {
          return function(o) {
            const l = i.call(this, o), c = oe.shadowRoot(this);
            return c && Ic(this) && n.addShadowRoot(c, r), l;
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
var fr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", ng = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (var dn = 0; dn < fr.length; dn++)
  ng[fr.charCodeAt(dn)] = dn;
var ig = function(e) {
  var t = new Uint8Array(e), r, n = t.length, i = "";
  for (r = 0; r < n; r += 3)
    i += fr[t[r] >> 2], i += fr[(t[r] & 3) << 4 | t[r + 1] >> 4], i += fr[(t[r + 1] & 15) << 2 | t[r + 2] >> 6], i += fr[t[r + 2] & 63];
  return n % 3 === 2 ? i = i.substring(0, i.length - 1) + "=" : n % 3 === 1 && (i = i.substring(0, i.length - 2) + "=="), i;
};
const al = /* @__PURE__ */ new Map();
function sg(e, t) {
  let r = al.get(e);
  return r || (r = /* @__PURE__ */ new Map(), al.set(e, r)), r.has(t) || r.set(t, []), r.get(t);
}
const Dc = (e, t, r) => {
  if (!e || !(Fc(e, t) || typeof e == "object"))
    return;
  const n = e.constructor.name, i = sg(r, n);
  let o = i.indexOf(e);
  return o === -1 && (o = i.length, i.push(e)), o;
};
function hn(e, t, r) {
  if (e instanceof Array)
    return e.map((n) => hn(n, t, r));
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
    const n = e.constructor.name, i = ig(e);
    return {
      rr_type: n,
      base64: i
    };
  } else {
    if (e instanceof DataView)
      return {
        rr_type: e.constructor.name,
        args: [
          hn(e.buffer, t, r),
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
          args: [hn(e.data, t, r), e.width, e.height]
        };
      if (Fc(e, t) || typeof e == "object") {
        const n = e.constructor.name, i = Dc(e, t, r);
        return {
          rr_type: n,
          index: i
        };
      }
    }
  }
  return e;
}
const zc = (e, t, r) => e.map((n) => hn(n, t, r)), Fc = (e, t) => !![
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
function og(e, t, r, n) {
  const i = [], o = Object.getOwnPropertyNames(
    t.CanvasRenderingContext2D.prototype
  );
  for (const l of o)
    try {
      if (typeof t.CanvasRenderingContext2D.prototype[l] != "function")
        continue;
      const c = Qt(
        t.CanvasRenderingContext2D.prototype,
        l,
        function(a) {
          return function(...p) {
            return Ge(this.canvas, r, n, !0) || setTimeout(() => {
              const s = zc(p, t, this);
              e(this.canvas, {
                type: Sr["2D"],
                property: l,
                args: s
              });
            }, 0), a.apply(this, p);
          };
        }
      );
      i.push(c);
    } catch {
      const c = Bn(
        t.CanvasRenderingContext2D.prototype,
        l,
        {
          set(a) {
            e(this.canvas, {
              type: Sr["2D"],
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
function ag(e) {
  return e === "experimental-webgl" ? "webgl" : e;
}
function ll(e, t, r, n) {
  const i = [];
  try {
    const o = Qt(
      e.HTMLCanvasElement.prototype,
      "getContext",
      function(l) {
        return function(c, ...a) {
          if (!Ge(this, t, r, !0)) {
            const p = ag(c);
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
function cl(e, t, r, n, i, o) {
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
        const p = Qt(
          e,
          a,
          function(s) {
            return function(...h) {
              const d = s.apply(this, h);
              if (Dc(d, o, this), "tagName" in this.canvas && !Ge(this.canvas, n, i, !0)) {
                const u = zc(h, o, this), m = {
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
        const p = Bn(e, a, {
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
function lg(e, t, r, n) {
  const i = [];
  return typeof t.WebGLRenderingContext < "u" && i.push(
    ...cl(
      t.WebGLRenderingContext.prototype,
      Sr.WebGL,
      e,
      r,
      n,
      t
    )
  ), typeof t.WebGL2RenderingContext < "u" && i.push(
    ...cl(
      t.WebGL2RenderingContext.prototype,
      Sr.WebGL2,
      e,
      r,
      n,
      t
    )
  ), () => {
    i.forEach((o) => o());
  };
}
const Uc = `(function() {
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
`, ul = typeof self < "u" && self.Blob && new Blob([Uc], { type: "text/javascript;charset=utf-8" });
function cg(e) {
  let t;
  try {
    if (t = ul && (self.URL || self.webkitURL).createObjectURL(ul), !t) throw "";
    const r = new Worker(t, {
      name: e == null ? void 0 : e.name
    });
    return r.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(t);
    }), r;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(Uc),
      {
        name: e == null ? void 0 : e.name
      }
    );
  } finally {
    t && (self.URL || self.webkitURL).revokeObjectURL(t);
  }
}
class ug {
  constructor(t) {
    U(this, "pendingCanvasMutations", /* @__PURE__ */ new Map()), U(this, "rafStamps", { latestId: 0, invokeId: null }), U(this, "mirror"), U(this, "mutationCb"), U(this, "resetObservers"), U(this, "frozen", !1), U(this, "locked", !1), U(this, "processMutation", (a, p) => {
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
    const l = ll(
      r,
      n,
      i,
      !0
    ), c = /* @__PURE__ */ new Map(), a = new cg();
    a.onmessage = (m) => {
      const { id: f } = m.data;
      if (c.set(f, !1), !("base64" in m.data)) return;
      const { base64: g, type: x, width: b, height: y } = m.data;
      this.mutationCb({
        id: f,
        type: Sr["2D"],
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
        Ge(f, n, i, !0) || m.push(f);
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
    const i = ll(
      t,
      r,
      n,
      !1
    ), o = og(
      this.processMutation.bind(this),
      t,
      r,
      n
    ), l = lg(
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
class dg {
  constructor(t) {
    U(this, "trackedLinkElements", /* @__PURE__ */ new WeakSet()), U(this, "mutationCb"), U(this, "adoptedStyleSheetCb"), U(this, "styleMirror", new _m()), this.mutationCb = t.mutationCb, this.adoptedStyleSheetCb = t.adoptedStyleSheetCb;
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
          rule: Zl(c, o.href),
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
class pg {
  constructor() {
    U(this, "nodeMap", /* @__PURE__ */ new WeakMap()), U(this, "active", !1);
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
let Le, fn, cs, Sn = !1;
try {
  if (Array.from([1], (e) => e * 2)[0] !== 2) {
    const e = document.createElement("iframe");
    document.body.appendChild(e), Array.from = ((Bo = e.contentWindow) == null ? void 0 : Bo.Array.from) || Array.from, document.body.removeChild(e);
  }
} catch (e) {
  console.debug("Unable to override Array.from", e);
}
const lt = vf();
function Pt(e = {}) {
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
    recordAfter: I = e.recordAfter === "DOMContentLoaded" ? e.recordAfter : "load",
    userTriggeredOnInput: N = !1,
    collectFonts: O = !1,
    inlineImages: J = !1,
    plugins: H,
    keepIframeSrcFn: L = () => !1,
    ignoreCSSAttributes: De = /* @__PURE__ */ new Set([]),
    errorHandler: se
  } = e;
  Um(se);
  const Q = S ? window.parent === window : !0;
  let pe = !1;
  if (!Q)
    try {
      window.parent.document && (pe = !1);
    } catch {
      pe = !0;
    }
  if (Q && !t)
    throw new Error("emit function is required");
  if (!Q && !pe)
    return () => {
    };
  C !== void 0 && b.mousemove === void 0 && (b.mousemove = C), lt.reset();
  const be = h === !0 ? {
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
  } : d !== void 0 ? d : { password: !0 }, he = sc(u);
  Om();
  let ie, X = 0;
  const Ye = (V) => {
    for (const Te of H || [])
      Te.eventProcessor && (V = Te.eventProcessor(V));
    return x && // Disable packing events which will be emitted to parent frames.
    !pe && (V = x(V)), V;
  };
  Le = (V, Te) => {
    var me;
    const ve = V;
    if (ve.timestamp = qr(), (me = Gt[0]) != null && me.isFrozen() && ve.type !== de.FullSnapshot && !(ve.type === de.IncrementalSnapshot && ve.data.source === le.Mutation) && Gt.forEach((ze) => ze.unfreeze()), Q)
      t == null || t(Ye(ve), Te);
    else if (pe) {
      const ze = {
        type: "rrweb",
        event: Ye(ve),
        origin: window.location.origin,
        isCheckout: Te
      };
      window.parent.postMessage(ze, "*");
    }
    if (ve.type === de.FullSnapshot)
      ie = ve, X = 0;
    else if (ve.type === de.IncrementalSnapshot) {
      if (ve.data.source === le.Mutation && ve.data.isAttachIframe)
        return;
      X++;
      const ze = n && X >= n, ge = r && ve.timestamp - ie.timestamp > r;
      (ze || ge) && fn(!0);
    }
  };
  const $ = (V) => {
    Le({
      type: de.IncrementalSnapshot,
      data: {
        source: le.Mutation,
        ...V
      }
    });
  }, Be = (V) => Le({
    type: de.IncrementalSnapshot,
    data: {
      source: le.Scroll,
      ...V
    }
  }), $e = (V) => Le({
    type: de.IncrementalSnapshot,
    data: {
      source: le.CanvasMutation,
      ...V
    }
  }), qe = (V) => Le({
    type: de.IncrementalSnapshot,
    data: {
      source: le.AdoptedStyleSheet,
      ...V
    }
  }), Ae = new dg({
    mutationCb: $,
    adoptedStyleSheetCb: qe
  }), Qe = new tg({
    mirror: lt,
    mutationCb: $,
    stylesheetManager: Ae,
    recordCrossOriginIframes: S,
    wrappedEmit: Le
  });
  for (const V of H || [])
    V.getMirror && V.getMirror({
      nodeMirror: lt,
      crossOriginIframeMirror: Qe.crossOriginIframeMirror,
      crossOriginIframeStyleMirror: Qe.crossOriginIframeStyleMirror
    });
  const Ct = new pg();
  cs = new ug({
    recordCanvas: k,
    mutationCb: $e,
    win: window,
    blockClass: i,
    blockSelector: o,
    mirror: lt,
    sampling: b.canvas,
    dataURLOptions: y
  });
  const ke = new rg({
    mutationCb: $,
    scrollCb: Be,
    bypassOptions: {
      blockClass: i,
      blockSelector: o,
      maskTextClass: a,
      maskTextSelector: p,
      inlineStylesheet: s,
      maskInputOptions: be,
      dataURLOptions: y,
      maskTextFn: f,
      maskInputFn: m,
      recordCanvas: k,
      inlineImages: J,
      sampling: b,
      slimDOMOptions: he,
      iframeManager: Qe,
      stylesheetManager: Ae,
      canvasManager: cs,
      keepIframeSrcFn: L,
      processedNodeManager: Ct
    },
    mirror: lt
  });
  fn = (V = !1) => {
    if (!w)
      return;
    Le(
      {
        type: de.Meta,
        data: {
          href: window.location.href,
          width: Ec(),
          height: Cc()
        }
      },
      V
    ), Ae.reset(), ke.init(), Gt.forEach((me) => me.lock());
    const Te = Wf(document, {
      mirror: lt,
      blockClass: i,
      blockSelector: o,
      maskTextClass: a,
      maskTextSelector: p,
      inlineStylesheet: s,
      maskAllInputs: be,
      maskTextFn: f,
      maskInputFn: m,
      slimDOM: he,
      dataURLOptions: y,
      recordCanvas: k,
      inlineImages: J,
      onSerialize: (me) => {
        Ac(me, lt) && Qe.addIframe(me), Tc(me, lt) && Ae.trackLinkElement(me), ms(me) && ke.addShadowRoot(oe.shadowRoot(me), document);
      },
      onIframeLoad: (me, ve) => {
        Qe.attachIframe(me, ve), ke.observeAttachShadow(me);
      },
      onStylesheetLoad: (me, ve) => {
        Ae.attachLinkElement(me, ve);
      },
      keepIframeSrcFn: L
    });
    if (!Te)
      return console.warn("Failed to snapshot the document");
    Le(
      {
        type: de.FullSnapshot,
        data: {
          node: Te,
          initialOffset: Sc(window)
        }
      },
      V
    ), Gt.forEach((me) => me.unlock()), document.adoptedStyleSheets && document.adoptedStyleSheets.length > 0 && Ae.adoptStyleSheets(
      document.adoptedStyleSheets,
      lt.getId(document)
    );
  };
  try {
    const V = [], Te = (ve) => {
      var ze;
      return ue(eg)(
        {
          mutationCb: $,
          mousemoveCb: (ge, Mr) => Le({
            type: de.IncrementalSnapshot,
            data: {
              source: Mr,
              positions: ge
            }
          }),
          mouseInteractionCb: (ge) => Le({
            type: de.IncrementalSnapshot,
            data: {
              source: le.MouseInteraction,
              ...ge
            }
          }),
          scrollCb: Be,
          viewportResizeCb: (ge) => Le({
            type: de.IncrementalSnapshot,
            data: {
              source: le.ViewportResize,
              ...ge
            }
          }),
          inputCb: (ge) => Le({
            type: de.IncrementalSnapshot,
            data: {
              source: le.Input,
              ...ge
            }
          }),
          mediaInteractionCb: (ge) => Le({
            type: de.IncrementalSnapshot,
            data: {
              source: le.MediaInteraction,
              ...ge
            }
          }),
          styleSheetRuleCb: (ge) => Le({
            type: de.IncrementalSnapshot,
            data: {
              source: le.StyleSheetRule,
              ...ge
            }
          }),
          styleDeclarationCb: (ge) => Le({
            type: de.IncrementalSnapshot,
            data: {
              source: le.StyleDeclaration,
              ...ge
            }
          }),
          canvasMutationCb: $e,
          fontCb: (ge) => Le({
            type: de.IncrementalSnapshot,
            data: {
              source: le.Font,
              ...ge
            }
          }),
          selectionCb: (ge) => {
            Le({
              type: de.IncrementalSnapshot,
              data: {
                source: le.Selection,
                ...ge
              }
            });
          },
          customElementCb: (ge) => {
            Le({
              type: de.IncrementalSnapshot,
              data: {
                source: le.CustomElement,
                ...ge
              }
            });
          },
          blockClass: i,
          ignoreClass: l,
          ignoreSelector: c,
          maskTextClass: a,
          maskTextSelector: p,
          maskInputOptions: be,
          inlineStylesheet: s,
          sampling: b,
          recordDOM: w,
          recordCanvas: k,
          inlineImages: J,
          userTriggeredOnInput: N,
          collectFonts: O,
          doc: ve,
          maskInputFn: m,
          maskTextFn: f,
          keepIframeSrcFn: L,
          blockSelector: o,
          slimDOMOptions: he,
          dataURLOptions: y,
          mirror: lt,
          iframeManager: Qe,
          stylesheetManager: Ae,
          shadowDomManager: ke,
          processedNodeManager: Ct,
          canvasManager: cs,
          ignoreCSSAttributes: De,
          plugins: ((ze = H == null ? void 0 : H.filter((ge) => ge.observer)) == null ? void 0 : ze.map((ge) => ({
            observer: ge.observer,
            options: ge.options,
            callback: (Mr) => Le({
              type: de.Plugin,
              data: {
                plugin: ge.name,
                payload: Mr
              }
            })
          }))) || []
        },
        g
      );
    };
    Qe.addLoadListener((ve) => {
      try {
        V.push(Te(ve.contentDocument));
      } catch (ze) {
        console.warn(ze);
      }
    });
    const me = () => {
      fn(), V.push(Te(document)), Sn = !0;
    };
    return ["interactive", "complete"].includes(document.readyState) ? me() : (V.push(
      Ve("DOMContentLoaded", () => {
        Le({
          type: de.DomContentLoaded,
          data: {}
        }), I === "DOMContentLoaded" && me();
      })
    ), V.push(
      Ve(
        "load",
        () => {
          Le({
            type: de.Load,
            data: {}
          }), I === "load" && me();
        },
        window
      )
    )), () => {
      V.forEach((ve) => {
        try {
          ve();
        } catch (ze) {
          String(ze).toLowerCase().includes("cross-origin") || console.warn(ze);
        }
      }), Ct.destroy(), Sn = !1, Bm();
    };
  } catch (V) {
    console.warn(V);
  }
}
Pt.addCustomEvent = (e, t) => {
  if (!Sn)
    throw new Error("please add custom event after start recording");
  Le({
    type: de.Custom,
    data: {
      tag: e,
      payload: t
    }
  });
};
Pt.freezePage = () => {
  Gt.forEach((e) => e.freeze());
};
Pt.takeFullSnapshot = (e) => {
  if (!Sn)
    throw new Error("please take full snapshot after start recording");
  fn(e);
};
Pt.mirror = lt;
var dl;
(function(e) {
  e[e.NotStarted = 0] = "NotStarted", e[e.Running = 1] = "Running", e[e.Stopped = 2] = "Stopped";
})(dl || (dl = {}));
const { addCustomEvent: ty } = Pt, { freezePage: ry } = Pt, { takeFullSnapshot: ny } = Pt, us = 2, hg = 4;
class fg {
  constructor(t) {
    Xr(this, "events", []);
    Xr(this, "lastMeta", null);
    Xr(this, "lastFull", null);
    this.opts = t;
  }
  push(t) {
    t.type === hg && (this.lastMeta = t), t.type === us && (this.lastFull = t, this.events = []), this.events.push(t), this.prune();
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
    return !this.events.some((n) => n.type === us) && this.lastFull && (this.lastMeta && t.push(this.lastMeta), t.push(this.lastFull)), [...t, ...this.events];
  }
  /** True when the buffer can produce a scrubbable replay (a full snapshot + at least one more event). */
  isPlayable() {
    const t = this.snapshot();
    return t.some((n) => n.type === us) && t.length >= 2;
  }
  clear() {
    this.events = [], this.lastMeta = null, this.lastFull = null;
  }
}
function mg(e, t = {}) {
  const r = new fg({
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
const Bc = "klav-sims-live", qc = "klav-sims-overlay", pl = "klav-sims-ext-css";
let ut = null, Vt = null, nt = null, mr = null;
const Cn = /* @__PURE__ */ new Map(), st = /* @__PURE__ */ new Map();
let Wc = 0, St = !1, Yt = null, vr = null, Yr = !1, He = null, _r = null, Ot = null, _t = null, dt = null, Kt = null, ct = null, wt = null, pt = null, gr = null;
const En = /* @__PURE__ */ new Set();
function gg(e) {
  return String(e || "").trim().toLowerCase().replace(/\s+/g, " ");
}
function jc(e, t) {
  return `${e}::${gg(t.text)}`;
}
function Hc(e) {
  try {
    document.dispatchEvent(new CustomEvent("klavity:sims-live", { detail: { active: e } }));
  } catch {
  }
}
const yg = `
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
`, bg = `
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
function hl(e, t) {
  const r = e.replace("#", ""), n = (c) => parseInt(c, 16), [i, o, l] = r.length === 3 ? [n(r[0] + r[0]), n(r[1] + r[1]), n(r[2] + r[2])] : [n(r.slice(0, 2)), n(r.slice(2, 4)), n(r.slice(4, 6))];
  return `rgba(${i},${o},${l},${t})`;
}
function vg(e) {
  if (e.suggestedBug) return !0;
  const t = String(e.priority ?? "").trim().toLowerCase();
  if (t && t !== "none") return !0;
  const r = String(e.sentiment ?? "").trim().toLowerCase();
  return r ? !(/* @__PURE__ */ new Set(["positive", "satisfied", "delighted", "neutral", "none"])).has(r) : !1;
}
function ys() {
  var e, t;
  try {
    return ((t = (e = window.matchMedia) == null ? void 0 : e.call(window, "(prefers-reduced-motion: reduce)")) == null ? void 0 : t.matches) ?? !1;
  } catch {
    return !1;
  }
}
function kg(e) {
  return new Promise((t) => setTimeout(t, e));
}
function kr(e) {
  const t = String(e.priority ?? "").trim().toLowerCase();
  return t === "high" || t === "critical" || t === "urgent" ? "HIGH" : t === "medium" || t === "med" ? "MED" : t === "low" ? "LOW" : e.suggestedBug ? "HIGH" : null;
}
const Vc = { HIGH: "h", MED: "m", LOW: "l" }, fl = { HIGH: 0, MED: 1, LOW: 2 };
function wg(e) {
  if (!e) return !1;
  if (e === nt || e === ut || e.id === qc || e.id === Bc || e.id === "klavity-widget-host") return !0;
  const t = e.classList;
  return !!t && t.contains("klav-halo");
}
function xg(e) {
  const t = [];
  for (const r of [nt, ut])
    r && (t.push({ el: r, vis: r.style.visibility }), r.style.visibility = "hidden");
  try {
    return e();
  } finally {
    for (const { el: r, vis: n } of t) r.style.visibility = n;
  }
}
function Gc(e) {
  const t = e.targetViewport;
  return {
    scrollX: Number.isFinite(t == null ? void 0 : t.scrollX) ? Number(t.scrollX) : window.scrollX,
    scrollY: Number.isFinite(t == null ? void 0 : t.scrollY) ? Number(t.scrollY) : window.scrollY,
    width: Math.max(1, Number.isFinite(t == null ? void 0 : t.width) ? Number(t.width) : window.innerWidth),
    height: Math.max(1, Number.isFinite(t == null ? void 0 : t.height) ? Number(t.height) : window.innerHeight)
  };
}
function Yc(e, t) {
  return new DOMRect(
    t.scrollX + e.x * t.width,
    t.scrollY + e.y * t.height,
    Math.max(1, e.w * t.width),
    Math.max(1, e.h * t.height)
  );
}
function ml(e) {
  return Math.max(0, e.width) * Math.max(0, e.height);
}
function Sg(e, t) {
  const r = Math.max(e.left, t.left), n = Math.min(e.right, t.right), i = Math.max(e.top, t.top), o = Math.min(e.bottom, t.bottom);
  return Math.max(0, n - r) * Math.max(0, o - i);
}
function Cg(e) {
  return new DOMRect(e.left + window.scrollX, e.top + window.scrollY, e.width, e.height);
}
function Kc(e) {
  if (!e || !(e instanceof HTMLElement) || e === document.body || e === document.documentElement || wg(e)) return !1;
  const t = e.getBoundingClientRect();
  if (t.width < 8 || t.height < 8) return !1;
  try {
    const r = getComputedStyle(e);
    if (r.display === "none" || r.visibility === "hidden" || Number(r.opacity) === 0) return !1;
  } catch {
  }
  return !0;
}
function Eg(e, t) {
  return xg(() => {
    const r = /* @__PURE__ */ new Set(), n = [], i = (l) => {
      let c = l;
      for (; c && c !== document.body && c !== document.documentElement; )
        !r.has(c) && Kc(c) && (r.add(c), n.push(c)), c = c.parentElement;
    }, o = typeof document.elementsFromPoint == "function" ? document.elementsFromPoint(e, t) : [document.elementFromPoint(e, t)].filter(Boolean);
    for (const l of o) i(l);
    return n;
  });
}
function Mg(e, t) {
  const r = Gc(t), n = Yc(e, r), i = Math.max(2, Math.min(window.innerWidth - 2, n.left + n.width / 2 - window.scrollX)), o = Math.max(2, Math.min(window.innerHeight - 2, n.top + n.height / 2 - window.scrollY)), l = Eg(i, o);
  if (!l.length) return null;
  const c = Math.max(1, ml(n));
  let a = null, p = -1 / 0;
  for (const s of l) {
    const h = Cg(s.getBoundingClientRect()), d = Sg(h, n);
    if (d <= 0) continue;
    const u = Math.max(1, ml(h)), m = d / c, f = Math.max(0, (u - d) / u), g = s.tagName.toLowerCase(), x = /^(button|a|input|textarea|select|label|section|article|nav|header|footer|main|form)$/.test(g) ? 0.18 : 0, b = u > window.innerWidth * window.innerHeight * 0.92 ? 0.8 : 0, y = m - f * 0.35 + x - b;
    y > p && (a = s, p = y);
  }
  return a ?? l[0] ?? null;
}
async function Rg(e, t) {
  if (e >= window.scrollX + 80 && e <= window.scrollX + window.innerWidth - 80 && t >= window.scrollY + 80 && t <= window.scrollY + window.innerHeight - 80) return;
  const i = Math.max(0, document.documentElement.scrollHeight - window.innerHeight), o = Math.max(0, document.documentElement.scrollWidth - window.innerWidth), l = Math.max(0, Math.min(i, t - window.innerHeight * 0.38)), c = Math.max(0, Math.min(o, e - window.innerWidth * 0.45));
  try {
    window.scrollTo({ top: l, left: c, behavior: ys() ? "auto" : "smooth" });
  } catch {
    window.scrollTo(c, l);
  }
  await kg(ys() ? 80 : 520);
}
const Ag = /* @__PURE__ */ new Set([
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
function Tg(e) {
  const t = /* @__PURE__ */ new Set();
  return String(e || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((r) => r.length < 4 || Ag.has(r) || t.has(r) ? !1 : (t.add(r), !0));
}
function Lg(e) {
  const t = Tg(e.text);
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
    if (!Kc(l)) continue;
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
async function Ig(e, t = {}) {
  if (e.region) {
    const r = Gc(e), n = Yc(e.region, r);
    t.scroll !== !1 && await Rg(n.left + n.width / 2, n.top + n.height / 2);
    const i = Mg(e.region, e);
    if (i) return i;
  }
  return Lg(e);
}
function Og() {
  if (ut && Vt) return Vt;
  ut = document.createElement("div"), ut.id = Bc, ut.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;", Vt = ut.attachShadow({ mode: "open" }), Uh(Vt);
  const e = document.createElement("style");
  return e.textContent = yg, Vt.appendChild(e), document.body.appendChild(ut), Vt;
}
function Xc() {
  if (nt) return nt;
  if (!document.getElementById(pl)) {
    const e = document.createElement("style");
    e.id = pl, e.textContent = bg, document.head.appendChild(e);
  }
  return nt = document.createElement("div"), nt.id = qc, nt.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;z-index:2147483640;pointer-events:none;overflow:visible;", document.body.appendChild(nt), nt;
}
function Jc(e, t) {
  return zh({
    name: e.name,
    initials: e.initials,
    photoUrl: e.photoUrl,
    color: e.accent,
    animate: !1,
    legs: !0,
    size: t
  });
}
function _g(e, t = [], r = {}) {
  if (typeof document > "u") return;
  vs();
  const n = Og();
  Xc(), mr = new AbortController();
  const i = e === "all" ? t : t.filter((h) => e.includes(h.id));
  if (!i.length) {
    console.warn("[KlavitySims] deploy(): no matching Sims — panel not mounted."), vs();
    return;
  }
  i.slice(0, 8).forEach((h) => {
    const d = h.accent || "#6366f1", u = h.initials || h.name.slice(0, 2).toUpperCase();
    Cn.set(h.id, { simId: h.id, accent: d, initials: u, name: h.name, photoUrl: h.photoUrl });
  });
  const o = document.createElement("div");
  o.className = "ksl-root", n.appendChild(o), pt = document.createElement("div"), pt.className = "ksl-sr", pt.id = "ksl-announcer", pt.setAttribute("aria-live", "polite"), pt.setAttribute("aria-atomic", "true"), o.appendChild(pt), He = document.createElement("button"), He.type = "button", He.className = "ksl-launcher", He.setAttribute("aria-label", "Open Sims feedback panel"), He.addEventListener("click", () => Ng());
  const l = document.createElement("span");
  l.className = "ksl-pill", _r = document.createElement("span"), _r.className = "ksl-pill-avatars", Ot = document.createElement("span"), Ot.className = "ksl-pill-txt", l.append(_r, Ot), _t = document.createElement("span"), _t.className = "ksl-pill-badge", _t.hidden = !0, He.append(l, _t), o.appendChild(He), i.slice(0, 3).forEach((h) => {
    const d = Cn.get(h.id);
    d && _r.appendChild(Jc(d, 26));
  }), dt = document.createElement("section"), dt.className = "ksl-panel", dt.setAttribute("aria-label", "Sims feedback"), dt.setAttribute("role", "dialog");
  const c = document.createElement("div");
  c.className = "ksl-head";
  const a = document.createElement("div");
  a.className = "ksl-title-row";
  const p = document.createElement("div");
  p.className = "ksl-title", p.textContent = "Sims feedback";
  const s = document.createElement("button");
  s.type = "button", s.className = "ksl-icon-btn", s.title = "Minimize", s.setAttribute("aria-label", "Minimize Sims feedback panel"), s.innerHTML = K("x", { size: 15 }), s.addEventListener("click", () => gl()), a.append(p, s), Kt = document.createElement("div"), Kt.className = "ksl-count", ct = document.createElement("div"), ct.className = "ksl-chips", c.append(a, Kt, ct), wt = document.createElement("div"), wt.className = "ksl-list", wt.setAttribute("role", "list"), dt.append(c, wt), o.appendChild(dt), document.addEventListener("keydown", (h) => {
    h.key === "Escape" && St && gl();
  }, { signal: mr.signal }), Hc(!0), Er();
}
function Zc(e) {
  Yr = e, He == null || He.classList.toggle("is-reviewing", e), Er(), St && Cr();
}
function Ng() {
  !dt || !He || (St = !0, dt.classList.add("is-open"), He.hidden = !0, Cr());
}
function gl() {
  !dt || !He || (St = !1, dt.classList.remove("is-open"), He.hidden = !1, Er());
}
function Qc() {
  const e = Array.from(st.values()), t = new Set(e.map((n) => n.entry.simId)), r = e.filter((n) => kr(n.obs) === "HIGH").length;
  return { total: e.length, sims: t.size, high: r };
}
function Er() {
  const e = Qc();
  Ot && (Yr && e.total === 0 ? Ot.innerHTML = "Your Sims are reviewing…" : e.total === 0 ? Ot.innerHTML = "Sims are watching this page" : Ot.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from your Sims`), _t && (_t.hidden = e.high === 0, _t.textContent = `${e.high} high`), St && eu(e);
}
function eu(e) {
  Kt && (e.total === 0 ? Kt.innerHTML = Yr ? "Your Sims are reviewing this page…" : "No findings yet — your Sims are watching." : Kt.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from <b>${e.sims}</b> Sim${e.sims === 1 ? "" : "s"}` + (e.high > 0 ? ` · <span class="ksl-hi">${e.high} high</span>` : "")), Pg();
}
function Pg() {
  if (!ct) return;
  const e = Array.from(st.values());
  if (ct.hidden = e.length === 0, ct.textContent = "", !e.length) return;
  const t = document.createElement("span");
  t.className = "ksl-chips-label", t.textContent = "Sim", ct.appendChild(t);
  const r = /* @__PURE__ */ new Map();
  e.forEach((i) => {
    const o = r.get(i.entry.simId) ?? { entry: i.entry, n: 0 };
    o.n += 1, r.set(i.entry.simId, o);
  }), r.forEach(({ entry: i, n: o }) => {
    const l = document.createElement("button");
    l.type = "button", l.className = "ksl-chip" + (Yt === i.simId ? " is-on" : ""), l.setAttribute("aria-pressed", String(Yt === i.simId));
    const c = document.createElement("span");
    c.className = "ksl-dot", c.style.background = i.accent, l.append(c, document.createTextNode(`${i.initials} · ${o}`)), l.addEventListener("click", () => {
      Yt = Yt === i.simId ? null : i.simId, Cr();
    }), ct.appendChild(l);
  });
  const n = document.createElement("span");
  n.className = "ksl-chips-label", n.style.marginLeft = "6px", n.textContent = "Priority", ct.appendChild(n), ["HIGH", "MED", "LOW"].forEach((i) => {
    const o = e.filter((a) => kr(a.obs) === i).length;
    if (!o) return;
    const l = document.createElement("button");
    l.type = "button";
    const c = vr === i;
    l.className = "ksl-chip" + (c ? ` sev-on-${Vc[i]}` : ""), l.setAttribute("aria-pressed", String(c)), l.textContent = `${i} · ${o}`, l.addEventListener("click", () => {
      vr = vr === i ? null : i, Cr();
    }), ct.appendChild(l);
  });
}
function $g() {
  return Array.from(st.values()).filter((e) => !Yt || e.entry.simId === Yt).filter((e) => !vr || kr(e.obs) === vr).sort((e, t) => {
    const r = kr(e.obs), n = kr(t.obs), i = r ? fl[r] : 3, o = n ? fl[n] : 3;
    return i - o;
  });
}
function Dg(e) {
  const { entry: t, obs: r } = e, n = kr(r), i = document.createElement("div");
  i.className = "ksl-row", i.setAttribute("role", "listitem"), i.dataset.id = e.id, i.style.borderLeftColor = t.accent;
  const o = document.createElement("div");
  o.className = "ksl-r-head", o.appendChild(Jc(t, 26));
  const l = document.createElement("span");
  l.className = "ksl-r-name", l.style.color = t.accent, l.textContent = t.name, o.appendChild(l);
  const c = String(r.sentiment ?? "").trim();
  if (c) {
    const m = document.createElement("span");
    m.className = "ksl-r-sent", m.textContent = c, o.appendChild(m);
  }
  if (n) {
    const m = document.createElement("span");
    m.className = `ksl-sev ${Vc[n]}`, m.setAttribute("aria-label", `Priority: ${n}`), m.textContent = n, o.appendChild(m);
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
  h.type = "button", h.className = "ksl-r-act track", h.innerHTML = K("bug", { size: 12 }) + " Track as Bug", h.setAttribute("aria-label", `Track feedback from ${t.name} as a bug`), h.addEventListener("click", () => {
    var m;
    (m = mn.onTriage) == null || m.call(mn, r, t.name), yl(e.id);
  });
  const d = document.createElement("button");
  d.type = "button", d.className = "ksl-r-act jump", d.innerHTML = K("map-pin", { size: 12 }) + " Jump to on page", d.setAttribute("aria-label", `Jump to where ${t.name} flagged this`), d.addEventListener("click", () => {
    Fg(e.id);
  });
  const u = document.createElement("button");
  return u.type = "button", u.className = "ksl-r-act dismiss", u.textContent = "Dismiss", u.setAttribute("aria-label", `Dismiss feedback from ${t.name}`), u.addEventListener("click", () => {
    yl(e.id);
  }), s.append(h, d, u), i.appendChild(s), i;
}
function zg(e) {
  e.querySelectorAll(".ksl-row").forEach((t) => {
    const r = t.querySelector(".ksl-r-obs");
    r && r.scrollHeight - r.clientHeight > 4 && t.classList.add("is-clamped");
  });
}
function Cr() {
  if (!wt || !St) {
    Er();
    return;
  }
  const e = Qc();
  eu(e);
  const t = $g();
  if (wt.textContent = "", !t.length) {
    const n = document.createElement("div");
    n.className = "ksl-empty";
    const i = st.size > 0;
    if (Yr && !i) {
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
    wt.appendChild(n), st.forEach((o) => {
      o.rowEl = null;
    });
    return;
  }
  t.forEach((n) => {
    const i = Dg(n);
    n.rowEl = i, wt.appendChild(i);
  });
  const r = new Set(t.map((n) => n.id));
  st.forEach((n) => {
    r.has(n.id) || (n.rowEl = null);
  }), zg(wt);
}
function bs() {
  gr == null || gr(), gr = null;
}
async function Fg(e) {
  const t = st.get(e);
  if (!t) return;
  const r = await Ig(t.obs, { scroll: !0 });
  !r || !nt || Ug(r, t.entry.accent);
}
function Ug(e, t) {
  bs();
  const r = Xc(), n = document.createElement("div");
  n.className = "klav-halo", n.style.borderColor = t, n.style.boxShadow = `0 0 0 4px ${hl(t, 0.16)},0 0 24px ${hl(t, 0.2)}`, r.appendChild(n);
  const i = new AbortController(), o = () => {
    const p = e.getBoundingClientRect(), s = p.width > 0 && p.height > 0 && p.bottom > 0 && p.right > 0 && p.top < window.innerHeight && p.left < window.innerWidth;
    n.style.display = s ? "" : "none", s && (n.style.left = `${p.left - 5}px`, n.style.top = `${p.top - 5}px`, n.style.width = `${p.width + 10}px`, n.style.height = `${p.height + 10}px`);
  }, l = () => requestAnimationFrame(o);
  o(), window.addEventListener("scroll", l, { passive: !0, signal: i.signal }), window.addEventListener("resize", l, { signal: i.signal });
  const c = setTimeout(() => {
    n.style.opacity = "0", n.style.transition = "opacity .3s ease", setTimeout(() => {
      gr === a && bs();
    }, 320);
  }, 3200), a = () => {
    clearTimeout(c), i.abort(), Ie(n);
  };
  gr = a;
}
function Bg(e, t) {
  const r = `f_${e.simId}_${++Wc}`;
  st.set(r, { id: r, entry: e, obs: t, rowEl: null }), St ? Cr() : Er(), pt && (pt.textContent = "", requestAnimationFrame(() => {
    pt && (pt.textContent = `${e.name}: ${t.text || ""}`);
  }));
}
function qg(e) {
  const t = st.get(e);
  if (!t) return;
  const r = () => {
    st.delete(e), St ? Cr() : Er();
  };
  t.rowEl && St ? (t.rowEl.classList.add("is-removing"), setTimeout(r, ys() ? 0 : 300)) : r();
}
function yl(e) {
  const t = st.get(e);
  t && (En.add(jc(t.entry.simId, t.obs)), qg(e));
}
function Wg(e, t, r) {
  if (!ut) return;
  const n = Cn.get(e);
  if (!n) {
    console.warn(`[KlavitySims] renderFeedback: simId "${e}" not registered`);
    return;
  }
  if (r.length) {
    Zc(!1);
    for (const i of r) {
      if (!vg(i)) continue;
      const o = jc(e, i);
      En.has(o) || (En.add(o), Bg(n, i));
    }
  }
}
function vs() {
  bs(), st.clear(), Wc = 0, Cn.clear(), En.clear(), St = !1, Yt = null, vr = null, Yr = !1, mr == null || mr.abort(), mr = null, He = null, _r = null, Ot = null, _t = null, dt = null, Kt = null, ct = null, wt = null, pt = null, Ie(nt), nt = null, Ie(ut), ut = null, Vt = null, Hc(!1);
}
const mn = {
  deploy: _g,
  setReviewing: Zc,
  renderFeedback: Wg,
  undeploy: vs,
  onTriage: null
};
function jg() {
  typeof window > "u" || window.KlavitySims || (window.KlavitySims = mn);
}
typeof window < "u" && jg();
const bl = "klav-ao-css", Hg = "klav-ao-overlay";
function Vg(e, t, r, n, i, o = 10) {
  const a = !(e.y - r - 14 >= o), p = a ? e.y + e.h + 14 : e.y - r - 14, s = Math.max(o, Math.min(p, i - r - o));
  return { left: Math.max(o, Math.min(e.x, n - t - o)), top: s, below: a };
}
const Gg = `
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
let Ht = null, Yg = 1;
const Mn = /* @__PURE__ */ new Map();
function vl(e, t) {
  const r = e.replace("#", ""), n = (c) => parseInt(c, 16), [i, o, l] = r.length === 3 ? [n(r[0] + r[0]), n(r[1] + r[1]), n(r[2] + r[2])] : [n(r.slice(0, 2)), n(r.slice(2, 4)), n(r.slice(4, 6))];
  return `rgba(${i},${o},${l},${t})`;
}
function Kg() {
  if (Ht) return Ht;
  if (!document.getElementById(bl)) {
    const e = document.createElement("style");
    e.id = bl, e.textContent = Gg, document.head.appendChild(e);
  }
  return Ht = document.createElement("div"), Ht.id = Hg, Ht.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;pointer-events:none;overflow:visible;z-index:2147483640;", document.body.appendChild(Ht), Ht;
}
function iy(e, t, r = {}) {
  const n = Kg(), i = r.color ?? "#6366f1", o = `klav-ao-${Yg++}`, l = 5, c = document.createElement("div");
  c.className = "klav-ao-halo", c.dataset.aoId = o, c.style.left = e.x - l + "px", c.style.top = e.y - l + "px", c.style.width = e.w + l * 2 + "px", c.style.height = e.h + l * 2 + "px", c.style.borderColor = i, c.style.boxShadow = `0 0 0 4px ${vl(i, 0.14)},0 0 24px ${vl(i, 0.18)}`, n.appendChild(c);
  let a = null;
  if (t) {
    const h = { x: e.x - l, y: e.y - l, w: e.w + l * 2, h: e.h + l * 2 }, { left: d, top: u, below: m } = Vg(
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
    b.className = "klav-ao-dismiss", b.textContent = "Dismiss", b.addEventListener("click", () => tu(o)), a.appendChild(f), a.appendChild(b), n.appendChild(a);
  }
  return Mn.set(o, { halo: c, pin: a }), o;
}
function tu(e) {
  const t = Mn.get(e);
  if (!t) return;
  Mn.delete(e);
  const { halo: r, pin: n } = t;
  n ? (n.classList.add("is-out"), r.style.animation = "klav-ao-pin-out .22s ease-in forwards", setTimeout(() => {
    Ie(n), Ie(r);
  }, 240)) : Ie(r);
}
function sy() {
  for (const e of [...Mn.keys()]) tu(e);
}
let ru = cr;
const nu = { consoleErrors: [], networkFailures: [] };
let iu, su, wr = null;
function ou(e) {
  const t = {};
  for (const [r, n] of Object.entries(e))
    n != null && (t[String(r).slice(0, 64)] = String(n).slice(0, 1e3));
  return t;
}
async function kl() {
  return $p(document.body, {
    filter: (e) => e.id !== "klavity-sdk-host"
  });
}
function Xg() {
  return Vp(nu, { identity: iu, metadata: su });
}
async function Jg(e) {
  return Up(
    { type: e.type, description: e.description, context: e.context, screenshots: e.screenshots, replayEvents: e.replayEvents },
    ru,
    { jira: qh, linear: Wh, github: jh, plane: Hh, backend: Gh }
  );
}
function qs(e = "bug") {
  const t = Ih(e, {
    onCaptureFull: kl,
    onSubmit: async (r) => Jg({
      type: r.type,
      description: r.description,
      context: Xg(),
      screenshots: r.screenshots,
      replayEvents: (wr == null ? void 0 : wr.getEvents()) ?? []
    })
  });
  setTimeout(async () => {
    try {
      const r = await kl();
      t.addScreenshot(r);
    } catch {
    }
  }, 200);
}
function Zg() {
  Gp(nu, { consoleLevels: !0 });
}
function au(e) {
  iu = e ? ou(e) : void 0;
}
function lu(e) {
  su = e ? ou(e) : void 0;
}
function Qg() {
  document.addEventListener("contextmenu", (e) => {
    if (vh(e.target)) return;
    e.preventDefault();
    const t = document.createElement("div");
    t.style.cssText = `position:fixed;left:${Math.min(e.clientX, window.innerWidth - 200)}px;top:${Math.min(e.clientY, window.innerHeight - 80)}px;background:#1e1e2e;border:1px solid #45475a;border-radius:8px;padding:4px;z-index:2147483647;box-shadow:0 8px 24px rgba(0,0,0,.4);font-family:system-ui;`, t.innerHTML = `
      <div data-action="bug" style="padding:8px 16px;cursor:pointer;color:#cdd6f4;font-size:13px;border-radius:4px;">${K("bug")} Report a Bug</div>
      <div data-action="feature" style="padding:8px 16px;cursor:pointer;color:#cdd6f4;font-size:13px;border-radius:4px;">${K("lightbulb")} Request a Feature</div>
    `, document.body.appendChild(t);
    const r = (n) => {
      (!n || !t.contains(n.target)) && (Ie(t), document.removeEventListener("click", r));
    };
    t.addEventListener("click", (n) => {
      var o;
      const i = (o = n.target.closest("[data-action]")) == null ? void 0 : o.getAttribute("data-action");
      Ie(t), document.removeEventListener("click", r), i && qs(i);
    }), setTimeout(() => document.addEventListener("click", r), 0);
  });
}
function cu(e = {}) {
  if (ru = {
    ...cr,
    ...e,
    jira: { ...cr.jira, ...e.jira },
    linear: { ...cr.linear, ...e.linear },
    github: { ...cr.github, ...e.github },
    plane: { ...cr.plane, ...e.plane }
  }, Zg(), Qg(), !wr)
    try {
      wr = mg(Pt);
    } catch {
      wr = null;
    }
}
typeof window < "u" && (window.KlavitySnap = { init: cu, openModal: qs, identify: au, setMetadata: lu });
const oy = { init: cu, openModal: qs, identify: au, setMetadata: lu };
export {
  mn as KlavitySims,
  mn as SimsLive,
  tu as clearAnnotation,
  sy as clearAnnotations,
  oy as default,
  au as identify,
  cu as init,
  jg as installKlavitySims,
  qs as openModal,
  lu as setMetadata,
  iy as showAnnotation
};
