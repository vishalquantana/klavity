var ru = Object.defineProperty;
var nu = (e, t, r) => t in e ? ru(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var qr = (e, t, r) => nu(e, typeof t != "symbol" ? t + "" : t, r);
function iu(e, t) {
  return e[13] = 1, e[14] = t >> 8, e[15] = t & 255, e[16] = t >> 8, e[17] = t & 255, e;
}
const Qa = 112, el = 72, tl = 89, rl = 115;
let Dn;
function su() {
  const e = new Int32Array(256);
  for (let t = 0; t < 256; t++) {
    let r = t;
    for (let n = 0; n < 8; n++)
      r = r & 1 ? 3988292384 ^ r >>> 1 : r >>> 1;
    e[t] = r;
  }
  return e;
}
function ou(e) {
  let t = -1;
  Dn || (Dn = su());
  for (let r = 0; r < e.length; r++)
    t = Dn[(t ^ e[r]) & 255] ^ t >>> 8;
  return t ^ -1;
}
function au(e) {
  const t = e.length - 1;
  for (let r = t; r >= 4; r--)
    if (e[r - 4] === 9 && e[r - 3] === Qa && e[r - 2] === el && e[r - 1] === tl && e[r] === rl)
      return r - 3;
  return 0;
}
function lu(e, t, r = !1) {
  const n = new Uint8Array(13);
  t *= 39.3701, n[0] = Qa, n[1] = el, n[2] = tl, n[3] = rl, n[4] = t >>> 24, n[5] = t >>> 16, n[6] = t >>> 8, n[7] = t & 255, n[8] = n[4], n[9] = n[5], n[10] = n[6], n[11] = n[7], n[12] = 1;
  const i = ou(n), o = new Uint8Array(4);
  if (o[0] = i >>> 24, o[1] = i >>> 16, o[2] = i >>> 8, o[3] = i & 255, r) {
    const l = au(e);
    return e.set(n, l), e.set(o, l + 13), e;
  } else {
    const l = new Uint8Array(4);
    l[0] = 0, l[1] = 0, l[2] = 0, l[3] = 9;
    const c = new Uint8Array(54);
    return c.set(e, 0), c.set(l, 33), c.set(n, 37), c.set(o, 50), c;
  }
}
const cu = "AAlwSFlz", uu = "AAAJcEhZ", du = "AAAACXBI";
function pu(e) {
  let t = e.indexOf(cu);
  return t === -1 && (t = e.indexOf(uu)), t === -1 && (t = e.indexOf(du)), t;
}
const nl = "[modern-screenshot]", Ot = typeof window < "u", hu = Ot && "Worker" in window, fu = Ot && "atob" in window, mu = Ot && "btoa" in window;
var Za;
const os = Ot ? (Za = window.navigator) == null ? void 0 : Za.userAgent : "", il = os.includes("Chrome"), sn = os.includes("AppleWebKit") && !il, as = os.includes("Firefox"), gu = (e) => e && "__CONTEXT__" in e, yu = (e) => e.constructor.name === "CSSFontFaceRule", bu = (e) => e.constructor.name === "CSSImportRule", vu = (e) => e.constructor.name === "CSSLayerBlockRule", yt = (e) => e.nodeType === 1, Nr = (e) => typeof e.className == "object", sl = (e) => e.tagName === "image", ku = (e) => e.tagName === "use", Rr = (e) => yt(e) && typeof e.style < "u" && !Nr(e), wu = (e) => e.nodeType === 8, xu = (e) => e.nodeType === 3, mr = (e) => e.tagName === "IMG", mn = (e) => e.tagName === "VIDEO", Su = (e) => e.tagName === "CANVAS", Cu = (e) => e.tagName === "TEXTAREA", Eu = (e) => e.tagName === "INPUT", Mu = (e) => e.tagName === "STYLE", Ru = (e) => e.tagName === "SCRIPT", Au = (e) => e.tagName === "SELECT", Iu = (e) => e.tagName === "SLOT", Lu = (e) => e.tagName === "IFRAME", Ou = (...e) => console.warn(nl, ...e);
function Tu(e) {
  var r;
  const t = (r = e == null ? void 0 : e.createElement) == null ? void 0 : r.call(e, "canvas");
  return t && (t.height = t.width = 1), !!t && "toDataURL" in t && !!t.toDataURL("image/webp").includes("image/webp");
}
const Ji = (e) => e.startsWith("data:");
function ol(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (Ot && e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i) || !Ot)
    return e;
  const r = gn().implementation.createHTMLDocument(), n = r.createElement("base"), i = r.createElement("a");
  return r.head.appendChild(n), r.body.appendChild(i), t && (n.href = t), i.href = e, i.href;
}
function gn(e) {
  return (e && yt(e) ? e == null ? void 0 : e.ownerDocument : e) ?? window.document;
}
const yn = "http://www.w3.org/2000/svg";
function Nu(e, t, r) {
  const n = gn(r).createElementNS(yn, "svg");
  return n.setAttributeNS(null, "width", e.toString()), n.setAttributeNS(null, "height", t.toString()), n.setAttributeNS(null, "viewBox", `0 0 ${e} ${t}`), n;
}
function _u(e, t) {
  let r = new XMLSerializer().serializeToString(e);
  return t && (r = r.replace(/[\u0000-\u0008\v\f\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/gu, "")), `data:image/svg+xml;charset=utf-8,${encodeURIComponent(r)}`;
}
function Pu(e, t) {
  return new Promise((r, n) => {
    const i = new FileReader();
    i.onload = () => r(i.result), i.onerror = () => n(i.error), i.onabort = () => n(new Error(`Failed read blob to ${t}`)), i.readAsDataURL(e);
  });
}
const $u = (e) => Pu(e, "dataUrl");
function dr(e, t) {
  const r = gn(t).createElement("img");
  return r.decoding = "sync", r.loading = "eager", r.src = e, r;
}
function Ar(e, t) {
  return new Promise((r) => {
    const { timeout: n, ownerDocument: i, onError: o, onWarn: l } = t ?? {}, c = typeof e == "string" ? dr(e, gn(i)) : e;
    let a = null, p = null;
    function s() {
      r(c), a && clearTimeout(a), p == null || p();
    }
    if (n && (a = setTimeout(s, n)), mn(c)) {
      const h = c.currentSrc || c.src;
      if (!h)
        return c.poster ? Ar(c.poster, t).then(r) : s();
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
      const h = sl(c) ? c.href.baseVal : c.currentSrc || c.src;
      if (!h)
        return s();
      const d = async () => {
        if (mr(c) && "decode" in c)
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
      if (mr(c) && c.complete)
        return d();
      p = () => {
        c.removeEventListener("load", d), c.removeEventListener("error", u);
      }, c.addEventListener("load", d, { once: !0 }), c.addEventListener("error", u, { once: !0 });
    }
  });
}
async function Du(e, t) {
  Rr(e) && (mr(e) || mn(e) ? await Ar(e, t) : await Promise.all(
    ["img", "video"].flatMap((r) => Array.from(e.querySelectorAll(r)).map((n) => Ar(n, t)))
  ));
}
const al = /* @__PURE__ */ (function() {
  let t = 0;
  const r = () => `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4);
  return () => (t += 1, `u${r()}${t}`);
})();
function ll(e) {
  return e == null ? void 0 : e.split(",").map((t) => t.trim().replace(/"|'/g, "").toLowerCase()).filter(Boolean);
}
let Qs = 0;
function zu(e) {
  const t = `${nl}[#${Qs}]`;
  return Qs++, {
    // eslint-disable-next-line no-console
    time: (r) => e && console.time(`${t} ${r}`),
    // eslint-disable-next-line no-console
    timeEnd: (r) => e && console.timeEnd(`${t} ${r}`),
    warn: (...r) => e && Ou(...r)
  };
}
function Fu(e) {
  return {
    cache: e ? "no-cache" : "force-cache"
  };
}
async function bn(e, t) {
  return gu(e) ? e : Uu(e, { ...t, autoDestruct: !0 });
}
async function Uu(e, t) {
  var u, m;
  const { scale: r = 1, workerUrl: n, workerNumber: i = 1 } = t || {}, o = !!(t != null && t.debug), l = (t == null ? void 0 : t.features) ?? !0, c = e.ownerDocument ?? (Ot ? window.document : void 0), a = ((u = e.ownerDocument) == null ? void 0 : u.defaultView) ?? (Ot ? window : void 0), p = /* @__PURE__ */ new Map(), s = {
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
      requestInit: Fu((m = t == null ? void 0 : t.fetch) == null ? void 0 : m.bypassingCache),
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
    log: zu(o),
    node: e,
    ownerDocument: c,
    ownerWindow: a,
    dpi: r === 1 ? null : 96 * r,
    svgStyleElement: cl(c),
    svgDefsElement: c == null ? void 0 : c.createElementNS(yn, "defs"),
    svgStyles: /* @__PURE__ */ new Map(),
    defaultComputedStyles: /* @__PURE__ */ new Map(),
    workers: [
      ...Array.from({
        length: hu && n && i ? i : 0
      })
    ].map(() => {
      try {
        const f = new Worker(n);
        return f.onmessage = async (g) => {
          var y, S, v, k;
          const { url: x, result: b } = g.data;
          b ? (S = (y = p.get(x)) == null ? void 0 : y.resolve) == null || S.call(y, b) : (k = (v = p.get(x)) == null ? void 0 : v.reject) == null || k.call(v, new Error(`Error receiving message from worker: ${x}`));
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
      Tu(c) && "image/webp",
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
  s.log.time("wait until load"), await Du(e, { timeout: s.timeout, onWarn: s.log.warn }), s.log.timeEnd("wait until load");
  const { width: h, height: d } = Bu(e, s);
  return s.width = h, s.height = d, s;
}
function cl(e) {
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
function Bu(e, t) {
  let { width: r, height: n } = t;
  if (yt(e) && (!r || !n)) {
    const i = e.getBoundingClientRect();
    r = r || i.width || Number(e.getAttribute("width")) || 0, n = n || i.height || Number(e.getAttribute("height")) || 0;
  }
  return { width: r, height: n };
}
async function qu(e, t) {
  const {
    log: r,
    timeout: n,
    drawImageCount: i,
    drawImageInterval: o
  } = t;
  r.time("image to canvas");
  const l = await Ar(e, { timeout: n, onWarn: t.log.warn }), { canvas: c, context2d: a } = Wu(e.ownerDocument, t), p = () => {
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
function Wu(e, t) {
  const { width: r, height: n, scale: i, backgroundColor: o, maximumCanvasSize: l } = t, c = e.createElement("canvas");
  c.width = Math.floor(r * i), c.height = Math.floor(n * i), c.style.width = `${r}px`, c.style.height = `${n}px`, l && (c.width > l || c.height > l) && (c.width > l && c.height > l ? c.width > c.height ? (c.height *= l / c.width, c.width = l) : (c.width *= l / c.height, c.height = l) : c.width > l ? (c.height *= l / c.width, c.width = l) : (c.width *= l / c.height, c.height = l));
  const a = c.getContext("2d");
  return a && o && (a.fillStyle = o, a.fillRect(0, 0, c.width, c.height)), { canvas: c, context2d: a };
}
function ul(e, t) {
  if (e.ownerDocument)
    try {
      const o = e.toDataURL();
      if (o !== "data:,")
        return dr(o, e.ownerDocument);
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
function ju(e, t) {
  var r;
  try {
    if ((r = e == null ? void 0 : e.contentDocument) != null && r.documentElement)
      return ls(e.contentDocument.documentElement, t);
  } catch (n) {
    t.log.warn("Failed to clone iframe", n);
  }
  return e.cloneNode(!1);
}
function Hu(e) {
  const t = e.cloneNode(!1);
  return e.currentSrc && e.currentSrc !== e.src && (t.src = e.currentSrc, t.srcset = ""), t.loading === "lazy" && (t.loading = "eager"), t;
}
async function Vu(e, t) {
  if (e.ownerDocument && !e.currentSrc && e.poster)
    return dr(e.poster, e.ownerDocument);
  const r = e.cloneNode(!1);
  r.crossOrigin = "anonymous", e.currentSrc && e.currentSrc !== e.src && (r.src = e.currentSrc);
  const n = r.ownerDocument;
  if (n) {
    let i = !0;
    if (await Ar(r, { onError: () => i = !1, onWarn: t.log.warn }), !i)
      return e.poster ? dr(e.poster, e.ownerDocument) : r;
    r.currentTime = e.currentTime, await new Promise((l) => {
      r.addEventListener("seeked", l, { once: !0 });
    });
    const o = n.createElement("canvas");
    o.width = e.offsetWidth, o.height = e.offsetHeight;
    try {
      const l = o.getContext("2d");
      l && l.drawImage(r, 0, 0, o.width, o.height);
    } catch (l) {
      return t.log.warn("Failed to clone video", l), e.poster ? dr(e.poster, e.ownerDocument) : r;
    }
    return ul(o, t);
  }
  return r;
}
function Yu(e, t) {
  return Su(e) ? ul(e, t) : Lu(e) ? ju(e, t) : mr(e) ? Hu(e) : mn(e) ? Vu(e, t) : e.cloneNode(!1);
}
function Gu(e) {
  let t = e.sandbox;
  if (!t) {
    const { ownerDocument: r } = e;
    try {
      r && (t = r.createElement("iframe"), t.id = `__SANDBOX__${al()}`, t.width = "0", t.height = "0", t.style.visibility = "hidden", t.style.position = "fixed", r.body.appendChild(t), t.srcdoc = '<!DOCTYPE html><meta charset="UTF-8"><title></title><body>', e.sandbox = t);
    } catch (n) {
      e.log.warn("Failed to getSandBox", n);
    }
  }
  return t;
}
const Xu = [
  "width",
  "height",
  "-webkit-text-fill-color"
], Ku = [
  "stroke",
  "fill"
];
function dl(e, t, r) {
  const { defaultComputedStyles: n } = r, i = e.nodeName.toLowerCase(), o = Nr(e) && i !== "svg", l = o ? Ku.map((f) => [f, e.getAttribute(f)]).filter(([, f]) => f !== null) : [], c = [
    o && "svg",
    i,
    l.map((f, g) => `${f}=${g}`).join(","),
    t
  ].filter(Boolean).join(":");
  if (n.has(c))
    return n.get(c);
  const a = Gu(r), p = a == null ? void 0 : a.contentWindow;
  if (!p)
    return /* @__PURE__ */ new Map();
  const s = p == null ? void 0 : p.document;
  let h, d;
  o ? (h = s.createElementNS(yn, "svg"), d = h.ownerDocument.createElementNS(h.namespaceURI, i), l.forEach(([f, g]) => {
    d.setAttributeNS(null, f, g);
  }), h.appendChild(d)) : h = d = s.createElement(i), d.textContent = " ", s.body.appendChild(h);
  const u = p.getComputedStyle(d, t), m = /* @__PURE__ */ new Map();
  for (let f = u.length, g = 0; g < f; g++) {
    const x = u.item(g);
    Xu.includes(x) || m.set(x, u.getPropertyValue(x));
  }
  return s.body.removeChild(h), n.set(c, m), m;
}
function pl(e, t, r) {
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
function Ju(e, t, r, n) {
  var h, d, u, m;
  const { ownerWindow: i, includeStyleProperties: o, currentParentNodeStyle: l } = n, c = t.style, a = i.getComputedStyle(e), p = dl(e, null, n);
  l == null || l.forEach((f, g) => {
    p.delete(g);
  });
  const s = pl(a, p, o);
  s.delete("transition-property"), s.delete("all"), s.delete("d"), s.delete("content"), r && (s.delete("position"), s.delete("margin-top"), s.delete("margin-right"), s.delete("margin-bottom"), s.delete("margin-left"), s.delete("margin-block-start"), s.delete("margin-block-end"), s.delete("margin-inline-start"), s.delete("margin-inline-end"), s.set("box-sizing", ["border-box", ""])), ((h = s.get("background-clip")) == null ? void 0 : h[0]) === "text" && t.classList.add("______background-clip--text"), il && (s.has("font-kerning") || s.set("font-kerning", ["normal", ""]), (((d = s.get("overflow-x")) == null ? void 0 : d[0]) === "hidden" || ((u = s.get("overflow-y")) == null ? void 0 : u[0]) === "hidden") && ((m = s.get("text-overflow")) == null ? void 0 : m[0]) === "ellipsis" && e.scrollWidth === e.clientWidth && s.set("text-overflow", ["clip", ""]));
  for (let f = c.length, g = 0; g < f; g++)
    c.removeProperty(c.item(g));
  return s.forEach(([f, g], x) => {
    c.setProperty(x, f, g);
  }), s;
}
function Zu(e, t) {
  (Cu(e) || Eu(e) || Au(e)) && t.setAttribute("value", e.value);
}
const Qu = [
  "::before",
  "::after"
  // '::placeholder', TODO
], ed = [
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
function td(e, t, r, n, i) {
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
    const u = [al()], m = dl(e, s, n);
    a == null || a.forEach((S, v) => {
      m.delete(v);
    });
    const f = pl(h, m, n.includeStyleProperties);
    f.delete("content"), f.delete("-webkit-locale"), ((y = f.get("background-clip")) == null ? void 0 : y[0]) === "text" && t.classList.add("______background-clip--text");
    const g = [
      `content: '${d}';`
    ];
    if (f.forEach(([S, v], k) => {
      g.push(`${k}: ${S}${v ? " !important" : ""};`);
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
  Qu.forEach(p), r && ed.forEach(p);
}
const eo = /* @__PURE__ */ new Set([
  "symbol"
  // test/fixtures/svg.symbol.html
]);
async function to(e, t, r, n, i) {
  if (yt(r) && (Mu(r) || Ru(r)) || n.filter && !n.filter(r))
    return;
  eo.has(t.nodeName) || eo.has(r.nodeName) ? n.currentParentNodeStyle = void 0 : n.currentParentNodeStyle = n.currentNodeStyle;
  const o = await ls(r, n, !1, i);
  n.isEnable("restoreScrollPosition") && rd(e, o), t.appendChild(o);
}
async function ro(e, t, r, n) {
  var o;
  let i = e.firstChild;
  yt(e) && e.shadowRoot && (i = (o = e.shadowRoot) == null ? void 0 : o.firstChild, r.shadowRoots.push(e.shadowRoot));
  for (let l = i; l; l = l.nextSibling)
    if (!wu(l))
      if (yt(l) && Iu(l) && typeof l.assignedNodes == "function") {
        const c = l.assignedNodes();
        for (let a = 0; a < c.length; a++)
          await to(e, t, c[a], r, n);
      } else
        await to(e, t, l, r, n);
}
function rd(e, t) {
  if (!Rr(e) || !Rr(t))
    return;
  const { scrollTop: r, scrollLeft: n } = e;
  if (!r && !n)
    return;
  const { transform: i } = t.style, o = new DOMMatrix(i), { a: l, b: c, c: a, d: p } = o;
  o.a = 1, o.b = 0, o.c = 0, o.d = 1, o.translateSelf(-n, -r), o.a = l, o.b = c, o.c = a, o.d = p, t.style.transform = o.toString();
}
function nd(e, t) {
  const { backgroundColor: r, width: n, height: i, style: o } = t, l = e.style;
  if (r && l.setProperty("background-color", r, "important"), n && l.setProperty("width", `${n}px`, "important"), i && l.setProperty("height", `${i}px`, "important"), o)
    for (const c in o) l[c] = o[c];
}
const id = /^[\w-:]+$/;
async function ls(e, t, r = !1, n) {
  var p, s, h, d;
  const { ownerDocument: i, ownerWindow: o, fontFamilies: l, onCloneEachNode: c } = t;
  if (i && xu(e))
    return n && /\S/.test(e.data) && n(e.data), i.createTextNode(e.data);
  if (i && o && yt(e) && (Rr(e) || Nr(e))) {
    const u = await Yu(e, t);
    if (t.isEnable("removeAbnormalAttributes")) {
      const y = u.getAttributeNames();
      for (let S = y.length, v = 0; v < S; v++) {
        const k = y[v];
        id.test(k) || u.removeAttribute(k);
      }
    }
    const m = t.currentNodeStyle = Ju(e, u, r, t);
    r && nd(u, t);
    let f = !1;
    if (t.isEnable("copyScrollbar")) {
      const y = [
        (p = m.get("overflow-x")) == null ? void 0 : p[0],
        (s = m.get("overflow-y")) == null ? void 0 : s[0]
      ];
      f = y.includes("scroll") || (y.includes("auto") || y.includes("overlay")) && (e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth);
    }
    const g = (h = m.get("text-transform")) == null ? void 0 : h[0], x = ll((d = m.get("font-family")) == null ? void 0 : d[0]), b = x ? (y) => {
      g === "uppercase" ? y = y.toUpperCase() : g === "lowercase" ? y = y.toLowerCase() : g === "capitalize" && (y = y[0].toUpperCase() + y.substring(1)), x.forEach((S) => {
        let v = l.get(S);
        v || l.set(S, v = /* @__PURE__ */ new Set()), y.split("").forEach((k) => v.add(k));
      });
    } : void 0;
    return td(
      e,
      u,
      f,
      t,
      b
    ), Zu(e, u), mn(e) || await ro(
      e,
      u,
      t,
      b
    ), await (c == null ? void 0 : c(u)), u;
  }
  const a = e.cloneNode(!1);
  return await ro(e, a, t), await (c == null ? void 0 : c(a)), a;
}
function sd(e) {
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
function od(e) {
  const { url: t, timeout: r, responseType: n, ...i } = e, o = new AbortController(), l = r ? setTimeout(() => o.abort(), r) : void 0;
  return fetch(t, { signal: o.signal, ...i }).then((c) => {
    if (!c.ok)
      throw new Error("Failed fetch, not 2xx response", { cause: c });
    switch (n) {
      case "arrayBuffer":
        return c.arrayBuffer();
      case "dataUrl":
        return c.blob().then($u);
      case "text":
      default:
        return c.text();
    }
  }).finally(() => clearTimeout(l));
}
function Ir(e, t) {
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
  n === "image" && (sn || as) && e.drawImageCount++;
  let x = p.get(r);
  if (!x) {
    d && d instanceof RegExp && d.test(l) && (l += (/\?/.test(l) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
    const b = n.startsWith("font") && m && m.minify, y = /* @__PURE__ */ new Set();
    b && n.split(";")[1].split(",").forEach((C) => {
      g.has(C) && g.get(C).forEach((L) => y.add(L));
    });
    const S = b && y.size, v = {
      url: l,
      timeout: c,
      responseType: S ? "arrayBuffer" : i,
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
      return !sn && r.startsWith("http") && f.length ? new Promise((k, C) => {
        f[p.size & f.length - 1].postMessage({ rawUrl: r, ...v }), x.resolve = k, x.reject = C;
      }) : od(v);
    })().catch((k) => {
      if (p.delete(r), n === "image" && u)
        return e.log.warn("Failed to fetch image base64, trying to use placeholder image", l), typeof u == "string" ? u : u(o);
      throw k;
    }), p.set(r, x);
  }
  return x.response;
}
async function hl(e, t, r, n) {
  if (!fl(e))
    return e;
  for (const [i, o] of ad(e, t))
    try {
      const l = await Ir(
        r,
        {
          url: o,
          requestType: n ? "image" : "text",
          responseType: "dataUrl"
        }
      );
      e = e.replace(ld(i), `$1${l}$3`);
    } catch (l) {
      r.log.warn("Failed to fetch css data url", i, l);
    }
  return e;
}
function fl(e) {
  return /url\((['"]?)([^'"]+?)\1\)/.test(e);
}
const ml = /url\((['"]?)([^'"]+?)\1\)/g;
function ad(e, t) {
  const r = [];
  return e.replace(ml, (n, i, o) => (r.push([o, ol(o, t)]), n)), r.filter(([n]) => !Ji(n));
}
function ld(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
const cd = [
  "background-image",
  "border-image-source",
  "-webkit-border-image",
  "-webkit-mask-image",
  "list-style-image"
];
function ud(e, t) {
  return cd.map((r) => {
    const n = e.getPropertyValue(r);
    return !n || n === "none" ? null : ((sn || as) && t.drawImageCount++, hl(n, null, t, !0).then((i) => {
      !i || n === i || e.setProperty(
        r,
        i,
        e.getPropertyPriority(r)
      );
    }));
  }).filter(Boolean);
}
function dd(e, t) {
  if (mr(e)) {
    const r = e.currentSrc || e.src;
    if (!Ji(r))
      return [
        Ir(t, {
          url: r,
          imageDom: e,
          requestType: "image",
          responseType: "dataUrl"
        }).then((n) => {
          n && (e.srcset = "", e.dataset.originalSrc = r, e.src = n || "");
        })
      ];
    (sn || as) && t.drawImageCount++;
  } else if (Nr(e) && !Ji(e.href.baseVal)) {
    const r = e.href.baseVal;
    return [
      Ir(t, {
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
function pd(e, t) {
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
        Ir(t, {
          url: o,
          responseType: "text"
        }).then((p) => {
          n == null || n.insertAdjacentHTML("beforeend", p);
        })
      ];
  }
  return [];
}
function gl(e, t) {
  const { tasks: r } = t;
  yt(e) && ((mr(e) || sl(e)) && r.push(...dd(e, t)), ku(e) && r.push(...pd(e, t))), Rr(e) && r.push(...ud(e.style, t)), e.childNodes.forEach((n) => {
    gl(n, t);
  });
}
async function hd(e, t) {
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
      const a = io(c.cssText, t);
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
          if (bu(m)) {
            const f = m.href;
            let g = "";
            try {
              g = await Ir(t, {
                url: f,
                requestType: "text",
                responseType: "text"
              });
            } catch (b) {
              t.log.warn(`Error fetch remote css import from ${f}`, b);
            }
            const x = g.replace(
              ml,
              (b, y, S) => b.replace(S, ol(S, f))
            );
            for (const b of md(x))
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
        Zi(u.cssRules, d);
      }), d.filter((u) => {
        var m;
        return yu(u) && fl(u.style.getPropertyValue("src")) && ((m = ll(u.style.getPropertyValue("font-family"))) == null ? void 0 : m.some((f) => i.has(f)));
      }).forEach((u) => {
        const m = u, f = o.get(m.cssText);
        f ? n.appendChild(r.createTextNode(`${f}
`)) : l.push(
          hl(
            m.cssText,
            m.parentStyleSheet ? m.parentStyleSheet.href : null,
            t
          ).then((g) => {
            g = io(g, t), o.set(m.cssText, g), n.appendChild(r.createTextNode(`${g}
`));
          })
        );
      });
    }
}
const fd = /(\/\*[\s\S]*?\*\/)/g, no = /((@.*?keyframes [\s\S]*?){([\s\S]*?}\s*?)})/gi;
function md(e) {
  if (e == null)
    return [];
  const t = [];
  let r = e.replace(fd, "");
  for (; ; ) {
    const o = no.exec(r);
    if (!o)
      break;
    t.push(o[0]);
  }
  r = r.replace(no, "");
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
const gd = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, yd = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function io(e, t) {
  const { font: r } = t, n = r ? r == null ? void 0 : r.preferredFormat : void 0;
  return n ? e.replace(yd, (i) => {
    for (; ; ) {
      const [o, , l] = gd.exec(i) || [];
      if (!l)
        return "";
      if (l === n)
        return `src: ${o};`;
    }
  }) : e;
}
function Zi(e, t = []) {
  for (const r of Array.from(e))
    vu(r) ? t.push(...Zi(r.cssRules)) : "cssRules" in r ? Zi(r.cssRules, t) : t.push(r);
  return t;
}
const bd = /\bx?link:?href\s*=\s*["'](?!data:)[^"']+["']/i;
function vd(e) {
  return bd.test(e.innerHTML);
}
async function kd(e, t) {
  const r = await bn(e, t);
  if (yt(r.node) && Nr(r.node) && !vd(r.node))
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
  const f = await ls(r.node, r, !0);
  if (l && n) {
    let S = "";
    a.forEach((v, k) => {
      S += `${v.join(`,
`)} {
  ${k}
}
`;
    }), l.appendChild(n.createTextNode(S));
  }
  i.timeEnd("clone node"), await (d == null ? void 0 : d(f)), p !== !1 && yt(f) && (i.time("embed web font"), await hd(f, r), i.timeEnd("embed web font")), i.time("embed node"), gl(f, r);
  const g = o.length;
  let x = 0;
  const b = async () => {
    for (; ; ) {
      const S = o.pop();
      if (!S)
        break;
      try {
        await S;
      } catch (v) {
        r.log.warn("Failed to run task", v);
      }
      s == null || s(++x, g);
    }
  };
  s == null || s(x, g), await Promise.all([...Array.from({ length: 4 })].map(b)), i.timeEnd("embed node"), await (u == null ? void 0 : u(f));
  const y = wd(f, r);
  return c && y.insertBefore(c, y.children[0]), l && y.insertBefore(l, y.children[0]), h && sd(r), await (m == null ? void 0 : m(y)), y;
}
function wd(e, t) {
  const { width: r, height: n } = t, i = Nu(r, n, e.ownerDocument), o = i.ownerDocument.createElementNS(i.namespaceURI, "foreignObject");
  return o.setAttributeNS(null, "x", "0%"), o.setAttributeNS(null, "y", "0%"), o.setAttributeNS(null, "width", "100%"), o.setAttributeNS(null, "height", "100%"), o.append(e), i.appendChild(o), i;
}
async function xd(e, t) {
  var l;
  const r = await bn(e, t), n = await kd(r), i = _u(n, r.isEnable("removeControlCharacter"));
  r.autoDestruct || (r.svgStyleElement = cl(r.ownerDocument), r.svgDefsElement = (l = r.ownerDocument) == null ? void 0 : l.createElementNS(yn, "defs"), r.svgStyles.clear());
  const o = dr(i, n.ownerDocument);
  return await qu(o, r);
}
async function Sd(e, t) {
  const r = await bn(e, t), { log: n, quality: i, type: o, dpi: l } = r, c = await xd(r);
  n.time("canvas to data url");
  let a = c.toDataURL(o, i);
  if (["image/png", "image/jpeg"].includes(o) && l && fu && mu) {
    const [p, s] = a.split(",");
    let h = 0, d = !1;
    if (o === "image/png") {
      const y = pu(s);
      y >= 0 ? (h = Math.ceil((y + 28) / 3) * 4, d = !0) : h = 33 / 3 * 4;
    } else o === "image/jpeg" && (h = 18 / 3 * 4);
    const u = s.substring(0, h), m = s.substring(h), f = window.atob(u), g = new Uint8Array(f.length);
    for (let y = 0; y < g.length; y++)
      g[y] = f.charCodeAt(y);
    const x = o === "image/png" ? lu(g, l, d) : iu(g, l), b = window.btoa(String.fromCharCode(...x));
    a = [p, ",", b, m].join("");
  }
  return n.timeEnd("canvas to data url"), a;
}
async function Cd(e, t) {
  return Sd(
    await bn(e, { ...t, type: "image/png" })
  );
}
const Ed = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", Md = 8e3, Rd = 16384, so = 4096, Ad = 16e6, Id = 500, Ld = 1e4, zn = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z4kwAAAAASUVORK5CYII=", yl = 600, Od = 1200, Td = 24, Nd = 1024, Ke = 32, _d = 4, bl = 400, Pd = 0.985, $d = 250;
function vl(e, t) {
  if (!e || e.startsWith("data:") || e.startsWith("blob:")) return !1;
  try {
    return new URL(e, t).origin !== t;
  } catch {
    return !1;
  }
}
function Dd(e) {
  const t = e;
  if (!t || t.tagName !== "IMG") return !1;
  const r = t.currentSrc || t.src || "";
  return vl(r, location.origin);
}
function zd(e) {
  const t = e;
  if (!t || t.nodeType !== 1) return !1;
  const r = t.tagName;
  if (r === "SCRIPT" || r === "STYLE" || r === "NOSCRIPT" || r === "TEMPLATE" || r === "IFRAME" && vl(t.src || "", location.origin)) return !0;
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
function Fn(e) {
  try {
    console.warn(e);
  } catch {
  }
}
function oo(e) {
  return !e || e === "transparent" || e === "rgba(0, 0, 0, 0)";
}
function Fd(e, t, r = 1) {
  try {
    const n = e.getBoundingClientRect(), i = Math.max(1, Math.ceil(Math.max(e.scrollWidth, e.clientWidth, n.width))), o = Math.max(1, Math.ceil(Math.max(e.scrollHeight, e.clientHeight, n.height))), l = Math.max(0.1, r), c = Math.min(so / i, so / o), a = Math.min(l, c, Math.sqrt(Ad / (i * o))), p = document.createElement("canvas");
    p.width = Math.max(1, Math.floor(i * a)), p.height = Math.max(1, Math.floor(o * a));
    const s = p.getContext("2d");
    if (!s) return { dataUrl: zn, scale: 1 };
    s.scale(a, a), s.fillStyle = "#ffffff", s.fillRect(0, 0, i, o);
    const h = Date.now() + Id;
    let d = 0;
    const u = () => d >= Ld || Date.now() >= h, m = (g, x = !1) => {
      var k;
      if (u() || (d++, !x && t && !t(g))) return;
      const b = getComputedStyle(g);
      if (b.display === "none" || b.visibility === "hidden" || Number(b.opacity) === 0) return;
      const y = g.getBoundingClientRect(), S = y.left - n.left, v = y.top - n.top;
      if (y.width > 0 && y.height > 0) {
        oo(b.backgroundColor) || (s.fillStyle = b.backgroundColor, s.fillRect(S, v, y.width, y.height));
        const C = parseFloat(b.borderTopWidth);
        C > 0 && b.borderTopStyle !== "none" && !oo(b.borderTopColor) && (s.strokeStyle = b.borderTopColor, s.lineWidth = C, s.strokeRect(S, v, y.width, y.height)), g.tagName === "IMG" && (s.fillStyle = "#f1f5f9", s.fillRect(S, v, y.width, y.height), s.strokeStyle = "#cbd5e1", s.lineWidth = 1, s.strokeRect(S, v, y.width, y.height));
      }
      for (const C of Array.from(g.childNodes)) {
        if (u()) break;
        if (C instanceof HTMLElement) {
          m(C);
          continue;
        }
        if (!(C.nodeType !== Node.TEXT_NODE || !((k = C.textContent) != null && k.trim())))
          try {
            const L = document.createRange();
            L.selectNodeContents(C);
            const N = L.getBoundingClientRect();
            if (N.width <= 0 || N.height <= 0) continue;
            s.save(), s.beginPath(), s.rect(N.left - n.left, N.top - n.top, N.width, N.height), s.clip(), s.fillStyle = b.color, s.font = `${b.fontStyle} ${b.fontWeight} ${b.fontSize} ${b.fontFamily}`, s.textBaseline = "top", s.fillText(C.textContent.trim(), N.left - n.left, N.top - n.top), s.restore();
          } catch {
          }
      }
    };
    m(e, !0);
    const f = p.toDataURL("image/png");
    return f.startsWith("data:image/png") ? { dataUrl: f, scale: a } : { dataUrl: zn, scale: 1 };
  } catch {
    return { dataUrl: zn, scale: 1 };
  }
}
function Ud() {
  return new Promise((e) => {
    typeof requestAnimationFrame == "function" ? requestAnimationFrame(() => e()) : setTimeout(e, 16);
  });
}
function Un(e, t) {
  return Promise.race([
    Promise.resolve(e).then(() => {
    }, () => {
    }),
    new Promise((r) => setTimeout(r, Math.max(0, t)))
  ]);
}
function Bd(e) {
  if (!e || typeof e.querySelectorAll != "function") return [];
  const t = typeof window < "u" && window.innerWidth || 0, r = typeof window < "u" && window.innerHeight || 0, n = [];
  let i;
  try {
    i = e.querySelectorAll("img");
  } catch {
    return [];
  }
  for (let o = 0; o < i.length && n.length < Td; o++) {
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
async function ao(e, t = yl) {
  if (typeof document > "u") return;
  const r = Date.now() + Math.max(0, t), n = () => Math.max(0, r - Date.now());
  try {
    const i = document.fonts;
    i && i.status !== "loaded" && i.ready && typeof i.ready.then == "function" && await Un(i.ready, n());
    const o = Bd(e);
    o.length && await Un(
      Promise.allSettled(o.map((l) => typeof l.decode == "function" ? l.decode() : Promise.resolve())),
      n()
    ), await Un(Ud(), Math.min(n(), 50));
  } catch {
  }
}
function kl(e, t) {
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
async function qd(e) {
  if (typeof document > "u") return null;
  const t = await kl(e, bl);
  if (!t) return null;
  let r;
  try {
    r = document.createElement("canvas");
  } catch {
    return null;
  }
  r.width = Ke, r.height = Ke;
  const n = r.getContext("2d");
  if (!n) return null;
  try {
    n.drawImage(t, 0, 0, Ke, Ke);
    const { data: i } = n.getImageData(0, 0, Ke, Ke);
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
async function Bn(e) {
  if (!e || !e.startsWith("data:image/png")) return !0;
  const t = e.indexOf(","), r = t >= 0 ? e.slice(t + 1) : "";
  if (Math.floor(r.length * 3 / 4) <= Nd) return !0;
  try {
    const i = await qd(e);
    if (i !== null && i <= _d) return !0;
  } catch {
  }
  return !1;
}
async function Wd(e) {
  if (typeof document > "u") return null;
  const t = await kl(e, bl);
  if (!t) return null;
  let r;
  try {
    r = document.createElement("canvas");
  } catch {
    return null;
  }
  r.width = Ke, r.height = Ke;
  const n = r.getContext("2d");
  if (!n) return null;
  try {
    n.drawImage(t, 0, 0, Ke, Ke);
    const { data: i } = n.getImageData(0, 0, Ke, Ke);
    let o = 0, l = 0;
    for (let c = 0; c < i.length; c += 4) {
      const a = i[c + 3] / 255, p = i[c] * a + 255 * (1 - a), s = i[c + 1] * a + 255 * (1 - a), h = i[c + 2] * a + 255 * (1 - a);
      0.299 * p + 0.587 * s + 0.114 * h >= $d && l++, o++;
    }
    return o ? l / o : null;
  } catch {
    return null;
  }
}
async function jd(e, t = {}) {
  if ((t.skippedImages ?? 0) > 0) return !0;
  try {
    const r = await Wd(e);
    if (r !== null && r >= Pd) return !0;
  } catch {
  }
  return !1;
}
function Hd(e, t) {
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
async function Vd(e, t = {}) {
  return (await Yd(e, t)).dataUrl;
}
async function Yd(e, t = {}) {
  let r = 0;
  const n = t.filter, i = t.pixelRatio ?? 1, o = t.width && t.height ? { width: t.width, height: t.height } : void 0, l = async () => {
    r = 0;
    const c = await Hd(Cd(e, {
      scale: i,
      ...o ?? {},
      font: !1,
      maximumCanvasSize: Rd,
      fetch: { placeholderImage: Ed },
      filter: (a) => n && !n(a) || zd(a) ? !1 : Dd(a) ? (r++, !1) : !0
    }), Md);
    if (!c.startsWith("data:image/png")) throw new Error("capture returned a non-PNG result");
    return c;
  };
  await ao(e, yl);
  try {
    let c = await l(), a = await Bn(c);
    if (a) {
      await ao(e, Od);
      try {
        const s = await l();
        await Bn(s) || (c = s, a = !1);
      } catch {
      }
    }
    r && Fn(`[Klavity] capture: omitted ${r} cross-origin image(s) the page's CSP/CORS blocks — captured the rest`), a && Fn("[Klavity] capture: DOM render came back blank after retry — caller may retake with the sharp path");
    const p = a ? !1 : await jd(c, { skippedImages: r });
    return { dataUrl: c, scale: i, quality: "rendered", blank: a, partial: p, skippedImages: r };
  } catch (c) {
    const a = c instanceof Error ? c.message : String(c);
    Fn(`[Klavity] capture: renderer unavailable (${a}); using fetch-free fallback`);
    const p = Fd(e, n, i), s = await Bn(p.dataUrl);
    return { ...p, quality: "wireframe", blank: s, partial: !1, skippedImages: 0 };
  }
}
const Gd = {
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
function Xd(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function Z(e, t = {}) {
  const r = Gd[e];
  if (!r)
    return console.warn("[Klavity] unknown icon: " + e), "";
  const n = t.size ?? 18, i = t.class ? `icon ${t.class}` : "icon", o = t.label ? 'role="img"' : 'aria-hidden="true"', l = t.label ? `<title>${Xd(t.label)}</title>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" class="${i}" width="${n}" height="${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" ${o}>${l}${r}</svg>`;
}
const nr = {
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
class lo {
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
      const n = Math.atan2(r.y2 - r.y1, r.x2 - r.x1), i = Math.max(12, this.computeLineWidth() * 4);
      t.beginPath(), t.moveTo(r.x1, r.y1), t.lineTo(r.x2, r.y2), t.lineTo(
        r.x2 - i * Math.cos(n - Math.PI / 6),
        r.y2 - i * Math.sin(n - Math.PI / 6)
      ), t.moveTo(r.x2, r.y2), t.lineTo(
        r.x2 - i * Math.cos(n + Math.PI / 6),
        r.y2 - i * Math.sin(n + Math.PI / 6)
      ), t.stroke();
    } else if (r.type === "line")
      t.beginPath(), t.moveTo(r.x1, r.y1), t.lineTo(r.x2, r.y2), t.stroke();
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
    }
  }
  async save() {
    const t = this.canvas.toDataURL("image/png");
    return t.length > 5 * 1024 * 1024 ? this.canvas.toDataURL("image/jpeg", 0.85) : t;
  }
}
async function Kd(e, t, r) {
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
const Jd = 50, Zd = 2e3, Qd = 1e3, ep = 500, co = /^(?:token|access_token|refresh_token|api[_-]?key|apikey|key|secret|password|passwd|pwd|auth|authorization|session|sid|jwt|code|otp)$/i;
function Wr(e, t) {
  e.push(t), e.length > Jd && e.shift();
}
function cs(e, t) {
  return e.length <= t ? e : e.slice(0, t) + "…[truncated]";
}
function qn(e) {
  let t = String(e || "");
  try {
    const r = new URL(t, typeof location < "u" ? location.href : "http://localhost");
    let n = !1;
    r.searchParams.forEach((i, o) => {
      co.test(o) && (r.searchParams.set(o, "REDACTED"), n = !0);
    }), n && (t = r.toString());
  } catch {
    t = t.replace(/([?&])([^=&]+)=([^&]*)/g, (r, n, i, o) => co.test(i) ? `${n}${i}=REDACTED` : r);
  }
  return cs(t, Qd);
}
function tp(e) {
  if (typeof e == "string") return e;
  if (e instanceof Error) return e.message;
  try {
    return cs(JSON.stringify(e), ep);
  } catch {
    return String(e);
  }
}
function rp(e, t = {}) {
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
function np(e, t = {}) {
  if (typeof window > "u") return e;
  const r = window;
  if (r.__klavityCaptureInstalled) return e;
  r.__klavityCaptureInstalled = !0;
  const n = () => t.isContextValid ? t.isContextValid() : !0, i = (a, p, s) => {
    Wr(e.consoleErrors, { message: cs(p, Zd), stack: s, timestamp: Date.now(), level: a });
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
          n() && i(p, h.map(tp).join(" "));
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
      return Wr(e.networkFailures, { url: qn(s), status: u.status, method: String(h).toUpperCase(), timestamp: p, durationMs: Date.now() - p }), u;
    } catch (u) {
      throw Wr(e.networkFailures, { url: qn(s), status: 0, method: String(h).toUpperCase(), timestamp: p, durationMs: Date.now() - p }), u;
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
            Wr(e.networkFailures, {
              url: qn(h.url),
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
const ip = ["light", "dark", "glass", "neon", "custom", "liquid"], sp = ["hidden", "icon", "full", "custom"], op = ["lightbulb", "bug"], ap = ["full", "reportOnly", "off"], lp = /^#[0-9a-fA-F]{3,8}$/, cp = /^[\w \-,'"().]+$/, uo = (e) => typeof e == "object" && e !== null, jr = (e) => typeof e == "string" && lp.test(e.trim()) ? e.trim() : void 0, Wn = (e, t) => typeof e == "string" && e.trim() ? e.trim().slice(0, t) : void 0, up = (e) => {
  if (typeof e != "string") return;
  const t = e.trim().slice(0, 120);
  return t && cp.test(t) ? t : void 0;
}, po = {
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
function ho(e) {
  let t = e.replace("#", "");
  t.length === 3 && (t = t.split("").map((l) => l + l).join(""));
  const r = parseInt(t.slice(0, 6), 16), n = r >> 16 & 255, i = r >> 8 & 255, o = r & 255;
  return 0.299 * n + 0.587 * i + 0.114 * o;
}
function wl(e) {
  const t = uo(e) ? e : {}, n = { theme: typeof t.theme == "string" && ip.includes(t.theme) ? t.theme : "light" }, i = jr(t.primary), o = jr(t.secondary), l = jr(t.background), c = Wn(t.thankYou, 140), a = up(t.font);
  i && (n.primary = i), o && (n.secondary = o), l && (n.background = l), a && (n.font = a), c && (n.thankYou = c), typeof t.launcherMode == "string" && sp.includes(t.launcherMode) && (n.launcherMode = t.launcherMode);
  const p = Wn(t.launcherText, 60);
  p && (n.launcherText = p);
  const s = jr(t.launcherIconColor);
  s && (n.launcherIconColor = s), typeof t.launcherIcon == "string" && op.includes(t.launcherIcon) && (n.launcherIcon = t.launcherIcon), typeof t.rightClickMode == "string" && ap.includes(t.rightClickMode) && (n.rightClickMode = t.rightClickMode), t.maskNumbers === !0 && (n.maskNumbers = !0), t.reportClarity === !0 ? n.reportClarity = !0 : t.reportClarity === !1 && (n.reportClarity = !1), t.preSubmitNudge === !1 ? n.preSubmitNudge = !1 : t.preSubmitNudge === !0 && (n.preSubmitNudge = !0);
  const h = uo(t.agency_branding) ? t.agency_branding : {};
  (t.whiteLabel === !0 || h.whiteLabel === !0) && (n.whiteLabel = !0);
  const d = Wn(t.projectId, 200);
  return d && (n.projectId = d), (t.attributionMedium === "extension" || t.attributionMedium === "widget") && (n.attributionMedium = t.attributionMedium), n;
}
function dp(e) {
  const t = wl(e), r = t.theme === "custom" ? { ...po.light } : { ...po[t.theme] };
  if (t.theme === "custom" && (t.primary && (r["--kl-accent"] = t.primary), t.secondary && (r["--kl-accent2"] = t.secondary), t.background)) {
    r["--kl-bg"] = t.background;
    const i = ho(t.background) < 140;
    r["--kl-fg"] = i ? "#f4f4f7" : "#1d1d24", r["--kl-muted"] = i ? "rgba(255,255,255,.6)" : "#706560", r["--kl-border"] = i ? "rgba(255,255,255,.16)" : "#e6e6ec", r["--kl-chip"] = i ? "rgba(255,255,255,.08)" : "#f4f4f7", r["--kl-input-bg"] = i ? "rgba(255,255,255,.05)" : "#fafafb";
  }
  return t.font && (r["--kl-font"] = t.font), t.theme === "dark" || t.theme === "neon" || t.theme === "glass" || t.theme === "liquid" || t.theme === "custom" && t.background && ho(t.background) < 140, r["--kl-img-outline"] = "var(--kl-img-outline-val, color-mix(in srgb, var(--kl-fg) 10%, transparent))", r["--kl-glow"] = "radial-gradient(120% 80% at 50% -10%, color-mix(in srgb, var(--kl-accent) 12%, transparent), transparent 60%), radial-gradient(80% 60% at 100% 110%, color-mix(in srgb, var(--kl-accent2) 6%, transparent), transparent 60%)", `:host{${Object.entries(r).map(([i, o]) => `${i}:${o};`).join("")}}`;
}
const Wt = class Wt {
  constructor() {
    this.onTranscript = (t) => {
    }, this.onError = (t, r) => {
    }, this.onStop = () => {
    }, this.onStatus = (t, r) => {
    }, this._recognition = null, this._timer = null, this._retryTimer = null, this._recording = !1, this._retries = 0, this._retrying = !1;
  }
  static isSupported() {
    return typeof window < "u" && !!(window.SpeechRecognition ?? window.webkitSpeechRecognition);
  }
  start() {
    this._recording || !Wt.isSupported() || (this._recording = !0, this._retries = 0, this._retrying = !1, this._timer = setTimeout(() => this.stop(), 18e4), this._begin());
  }
  // Spin up a fresh SpeechRecognition instance. Called on start() and again on each auto-retry so a
  // dropped connection reconnects transparently while _recording stays true.
  _begin() {
    if (!this._recording) return;
    const t = window.SpeechRecognition ?? window.webkitSpeechRecognition, r = new t();
    this._recognition = r, r.continuous = !0, r.interimResults = !1, r.lang = typeof document < "u" && document.documentElement.lang || "en-US", r.onresult = (n) => {
      this._retries > 0 && (this._retries = 0, this.onStatus("idle", ""));
      for (let i = n.resultIndex; i < n.results.length; i++)
        n.results[i].isFinal && this.onTranscript(n.results[i][0].transcript);
    }, r.onerror = (n) => {
      if (n.error === "no-speech") {
        this.stop();
        return;
      }
      if ((n.error === "network" || n.error === "aborted") && this._retries < Wt.MAX_RETRIES) {
        this._retries++, this._retrying = !0, this.onStatus("retrying", "Reconnecting voice…");
        return;
      }
      const i = {
        "not-allowed": "Microphone access was denied",
        network: "Voice disconnected — tap Voice to try again"
      };
      this.onError(n.error, i[n.error] ?? ""), this.stop();
    }, r.onend = () => {
      if (this._retrying) {
        this._retrying = !1, this._recognition = null, this._retryTimer = setTimeout(() => {
          this._retryTimer = null, this._begin();
        }, Wt.RETRY_DELAY_MS);
        return;
      }
      this._recording && (this._recording = !1, this._clearTimers(), this._recognition = null, this.onStop());
    }, r.start();
  }
  stop() {
    this._recording && (this._recording = !1, this._retrying = !1, this._clearTimers(), this._recognition && (this._recognition.onend = null, this._recognition.stop(), this._recognition = null), this.onStop());
  }
  _clearTimers() {
    this._timer !== null && (clearTimeout(this._timer), this._timer = null), this._retryTimer !== null && (clearTimeout(this._retryTimer), this._retryTimer = null);
  }
};
Wt.MAX_RETRIES = 2, Wt.RETRY_DELAY_MS = 500;
let Sr = Wt;
function xe(e) {
  try {
    e && e.parentNode && e.parentNode.removeChild(e);
  } catch {
  }
}
const pp = /* @__PURE__ */ new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"]);
function Ft(e) {
  const t = [], r = [], n = document.createTreeWalker(e, NodeFilter.SHOW_TEXT, {
    acceptNode(l) {
      let c = l.parentElement;
      for (; c && c !== e; ) {
        if (pp.has(c.tagName)) return NodeFilter.FILTER_REJECT;
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
    xe(l);
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
        for (const s of a) s.parentNode === l && xe(s);
      }
    }
    for (const { el: l, original: c } of r)
      l.value = c;
  };
}
const xl = [
  "not working",
  "doesn't work",
  "does not work",
  "doesnt work",
  "broken",
  "pls fix",
  "please fix",
  "fix it",
  "help"
], hp = /\b(when i|steps?|click|clicked|clicking|tap|tapped|then|go to|navigate|reload|refresh|press|select|enter)\b/i, fp = /(https?:\/\/|\s\/[a-z0-9]|^\/[a-z0-9])/i, mp = /\b(expected?|should|instead|supposed to|meant to|i wanted)\b/i, gp = /* @__PURE__ */ new Set([
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
]), yp = { needs: "Needs detail", good: "Good", great: "Great" };
function bp(e) {
  let t = e;
  for (const r of xl) t = t.split(r).join(" ");
  return t;
}
function vp(e) {
  const t = e.split(/[^a-z0-9]+/i).filter(Boolean);
  let r = 0;
  for (const n of t)
    n.length < 3 || gp.has(n) || r++;
  return r;
}
function Sl(e) {
  const t = (e || "").trim(), r = t.toLowerCase(), n = bp(r), i = vp(n), o = t.length > 0 && xl.some((d) => r.includes(d)) && i < 3, l = i >= 3 && t.length >= 12, c = mp.test(r), a = hp.test(r) || fp.test(t), p = { problem: l, expected: c, repro: a }, s = (l ? 1 : 0) + (c ? 1 : 0) + (a ? 1 : 0), h = s >= 3 ? "great" : s === 2 ? "good" : "needs";
  return { score: s, coverage: p, level: h, label: yp[h], vague: o };
}
function kp(e) {
  const t = (e || "").trim();
  return t.length <= 15 ? !1 : Sl(t).level !== "great";
}
function wp(e) {
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
function xp(e, t) {
  let r;
  try {
    r = new URL(e);
  } catch {
    return e;
  }
  const n = [
    ["utm_source", wp(t.source)],
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
function Sp(e) {
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
function Cp(e, t, r) {
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
function Ep(e) {
  return e === "attached" ? `${Z("play", { size: 12 })}<span>Replay &middot; 60s</span>${Z("check", { size: 12, label: "attached" })}` : `${Z("play", { size: 12 })}<span>Replay &middot; not available</span>`;
}
function fo(e) {
  const t = /^fb_([0-9a-f]{8})[0-9a-f-]+$/i.exec(e);
  return t ? "fb_" + t[1] : e;
}
function mo(e) {
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
const Mp = {
  "real-pixel": { label: "Sharp", iconName: "check-circle", degraded: !1 },
  rendered: { label: "Rendered", iconName: "image", degraded: !0 },
  wireframe: { label: "Wireframe", iconName: "triangle-alert", degraded: !0 }
};
function Cl(e) {
  return (e.type || "").toLowerCase().startsWith("video/") || /\.(mp4|m4v|mov|webm|avi|mkv|ogv|3gp)$/i.test(e.name || "");
}
function Rp(e, t) {
  return Cl(e) ? t.video : t.file;
}
function Ap(e, t, r = {}) {
  var Ws, js, Hs, Vs;
  const n = wl(r);
  let i = !!n.maskNumbers;
  const o = document.createElement("div");
  o.setAttribute("data-klavity-ui", "composer"), o.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;";
  const l = o.attachShadow({ mode: "open" });
  document.body.appendChild(o);
  let c = [], a = !1, p = [], s = [], h = [], d = !1;
  const u = !!t.onMinimize, m = u ? 8 : 5, f = 15e3, g = 10 * 1024 * 1024, x = !!t.allowFileAttachments, b = 5, y = 100 * 1024 * 1024, S = 120 * 1024 * 1024;
  let v = [];
  const k = !!(t.allowRecording && t.onRecord), C = 2;
  let L = [];
  const N = t.issueTypes && t.issueTypes.length ? t.issueTypes : null, I = {};
  let V = null;
  const W = () => {
    const w = Object.keys(I);
    if (!w.length && !V) return null;
    const E = {};
    if (w.length) {
      const A = {};
      for (const O of w) A[O] = I[O];
      const M = I[0] ?? I[Number(w[0])] ?? {};
      Object.assign(E, M, { byIndex: A });
    }
    return V && (E.selector = V.selector, E.selectorText = V.text), E;
  };
  let R = e, he = 0, Ce = null, ce = t.replayState === "attached", te = null, de = !1;
  const Ae = 4e3, be = 5e3, K = {}, ve = {}, _ = (w) => w ? JSON.parse(JSON.stringify(w)) : null, je = (w) => ({
    url: c[w],
    compressed: p[w],
    ann: _(I[w])
  }), Ie = (w) => {
    (K[w] ?? (K[w] = [])).push(je(w));
  }, Ct = (w, E) => {
    c[w] = E.url, p[w] = E.compressed, E.ann ? I[w] = _(E.ann) : delete I[w];
  }, Le = (w) => {
    const E = K[w];
    if (!E || !E.length) return !1;
    const A = E.pop(), M = ve[w];
    for (; M && M.length && M[M.length - 1].mark >= E.length; ) M.pop();
    return Ct(w, A), Ee(), !0;
  }, He = (w) => {
    const E = ve[w];
    if (!E || !E.length) return !1;
    const { snap: A, mark: M } = E.pop();
    return K[w] && (K[w].length = Math.min(K[w].length, M)), Ct(w, A), Ee(), !0;
  }, ct = document.createElement("style");
  ct.textContent = `
    ${dp(n)}
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
    /* margin-top:auto pins Submit to the bottom when the composer is short; position:sticky keeps it in
       view when the composer scrolls (long forms / small viewports) so Submit is ALWAYS reachable
       (KLAVITYKLA-402). The -12px top shadow gutter blends content scrolling up beneath the button. */
    .kl-side>.klavity-submit{margin-top:auto;position:sticky;bottom:0;box-shadow:0 -12px 14px -8px var(--kl-bg);}
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
    .kl-htool:focus-visible,.kl-htbtn:focus-visible,.kl-hcolor:focus-visible{outline:2px solid var(--kl-accent);outline-offset:2px;}
    .klavity-thumb.kl-thumb-active img{outline:2px solid var(--kl-accent);outline-offset:1px;}
    @media (max-width:760px){.kl-hhint{display:none;}}
    @media (prefers-reduced-motion:reduce){.kl-htool,.kl-htbtn,.kl-hcolor{transition:none;}.kl-htool:hover,.kl-htbtn:hover,.kl-hcolor:hover{transform:none;}}
    .klavity-modal::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;background:linear-gradient(to right,color-mix(in srgb,var(--kl-border) 58%,transparent) 1px,transparent 1px) 0 0/44px 44px,linear-gradient(to bottom,color-mix(in srgb,var(--kl-border) 58%,transparent) 1px,transparent 1px) 0 0/44px 44px;opacity:.36;}
    .klavity-modal>*{position:relative;z-index:1;}
    /* Staggered content reveal — the genie scales the panel in while its rows softly rise + fade so it feels
       alive (not a flat box). Subtle; zeroed under prefers-reduced-motion below. */
    @keyframes kl-rise{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
    .kl-side>.klavity-toggle,.kl-side>.klavity-page,.kl-side>.klavity-proof,.kl-hero>.klavity-strip,.kl-side>.klavity-actions,.kl-side>textarea.klavity-desc,.kl-side>input.klavity-remail,.kl-side>.klavity-submit{animation:kl-rise .5s cubic-bezier(.16,1,.3,1) both;}
    .kl-side>.klavity-toggle{animation-delay:.05s}.kl-side>.klavity-page{animation-delay:.09s}.kl-side>.klavity-proof{animation-delay:.11s}.kl-hero>.klavity-strip{animation-delay:.12s}.kl-side>.klavity-actions{animation-delay:.15s}.kl-side>textarea.klavity-desc{animation-delay:.18s}.kl-side>input.klavity-remail{animation-delay:.21s}.kl-side>.klavity-submit{animation-delay:.23s}
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
    .kl-file-chip{display:inline-flex;align-items:center;gap:6px;max-width:100%;padding:6px 8px 6px 9px;border-radius:8px;border:1px solid var(--kl-border);background:var(--kl-chip);color:var(--kl-fg);font-size:12px;}
    .kl-file-chip .kl-file-ic{display:inline-flex;flex:none;color:var(--kl-muted);}
    .kl-file-chip .kl-file-nm{max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600;}
    .kl-file-chip .kl-file-sz{color:var(--kl-muted);font-variant-numeric:tabular-nums;font-size:11px;}
    .kl-file-rm{flex:none;width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;border:none;border-radius:50%;background:color-mix(in srgb,var(--kl-fg) 12%,transparent);color:var(--kl-fg);cursor:pointer;padding:0;}
    .kl-file-rm:hover{background:color-mix(in srgb,var(--kl-fg) 22%,transparent);}
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
    .klavity-counter{font-size:11px;color:var(--kl-muted);margin-bottom:8px;font-variant-numeric:tabular-nums;}
    textarea.klavity-desc{width:100%;min-height:100px;resize:vertical;background:var(--kl-input-bg);color:var(--kl-fg);border:1px solid var(--kl-border);border-radius:8px;padding:10px;font-size:14px;margin-bottom:16px;box-sizing:border-box;box-shadow:0 1px 2px rgba(25,20,15,.04);}
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
    .klavity-toggle button,.klavity-actions button,.klavity-submit,.klavity-lead button,.klavity-cta,textarea.klavity-desc,input.klavity-remail,.klavity-lead input{transition:transform .15s cubic-bezier(.2,.7,.2,1),background .15s ease,border-color .15s ease,box-shadow .15s ease,color .15s ease,filter .15s ease;will-change:transform;}
    .klavity-rm,.klavity-mk{transition:transform .15s cubic-bezier(.2,.7,.2,1),background .15s ease,color .15s ease,box-shadow .15s ease;will-change:transform;}
    textarea.klavity-desc:hover,input.klavity-remail:hover,.klavity-lead input:hover{transform:var(--kl-lift);border-color:var(--kl-accent);box-shadow:0 7px 18px color-mix(in srgb,var(--kl-accent) 16%,transparent),0 0 0 1px color-mix(in srgb,var(--kl-accent) 14%,transparent);}
    textarea.klavity-desc:focus,input.klavity-remail:focus,.klavity-lead input:focus{outline:none;border-color:var(--kl-accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--kl-accent) 20%,transparent),0 8px 20px color-mix(in srgb,var(--kl-accent) 14%,transparent);}
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
    #klavity-sharp{flex:1.4;}
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
    .klavity-actions button.kl-active .kl-cap-ic,.klavity-toggle button.active .kl-cap-ic{color:var(--kl-accent);transform:scale(1.08) rotate(3deg);}
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
  `, l.appendChild(ct);
  const $e = document.createElement("div");
  $e.className = "klavity-overlay";
  const $ = document.createElement("div");
  $.className = "klavity-modal", $.innerHTML = `
    ${u ? '<button class="klavity-min" id="klavity-min" type="button" aria-label="Minimize" title="Minimize (keeps your evidence)"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>' : ""}
    <button class="klavity-x" id="klavity-x" type="button" aria-label="Close" title="Close (Esc)">${Z("x", { size: 16 })}</button>
    <div class="kl-hero" id="klavity-hero">
      <div class="kl-hero-tools" id="klavity-hero-tools"></div>
      <div class="kl-hero-stage" id="klavity-hero-stage">
        <div class="kl-hero-empty" id="klavity-hero-empty">${Z("image", { size: 34 })}<span>Capture or upload a screenshot to start marking it up</span></div>
      </div>
      <div class="klavity-strip" id="klavity-strip"></div>
      ${t.onCaptureSharp ? '<div class="klavity-sharphint" id="klavity-sharphint" role="status" aria-live="polite" hidden></div>' : ""}
    </div>
    <div class="kl-side" id="klavity-side">
      ${t.showTitleField ? '<label class="klavity-title-label" for="klavity-title">Title<input type="text" class="klavity-title" id="klavity-title" maxlength="200" placeholder="One line summarising the issue"></label>' : ""}
      ${N ? `<div class="klavity-types" id="klavity-types" role="radiogroup" aria-label="Issue type">${N.map((w) => `<button type="button" class="kl-type-chip${w.value === e ? " active" : ""}" data-kind="${vt(w.value)}" role="radio" aria-checked="${w.value === e ? "true" : "false"}">${vt(w.label)}${w.mappingLabel ? `<span class="kl-type-map">${vt(w.mappingLabel)}</span>` : ""}</button>`).join("")}</div>` : `<div class="klavity-toggle">
        <button class="bug ${e === "bug" ? "active" : ""}"><span class="kl-cap-ic">${Z("bug")}</span>Bug</button>
        <button class="feat ${e === "feature" ? "active" : ""}"><span class="kl-cap-ic">${Z("lightbulb")}</span>Feature</button>
      </div>`}
      
      
      <div class="klavity-actions">
        ${t.onCaptureSharp ? `<button id="klavity-sharp" aria-describedby="klavity-sharp-tip"><span class="kl-cap-ic">${Z("app-window")}</span><span class="kl-sharp-label">Screen</span><span class="kl-info-badge" aria-hidden="true"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></span><span id="klavity-sharp-tip" class="klavity-info-pop" role="tooltip">Screen grabs the <b>whole page — every image, pixel-perfect</b> using your browser's screen-share. Your browser will ask you to <b>share this tab</b>.</span></button>` : ""}
        <button id="klavity-full" title="Full Page — instant capture; may miss some cross-origin images"><span class="kl-cap-ic">${Z("camera")}</span><span class="kl-full-label">Full Page</span></button>
        <button id="klavity-upload"><span class="kl-cap-ic">${Z("image")}</span><span class="kl-upload-label">Upload</span></button>
        ${x ? `<button id="klavity-attach" title="Attach a video or file (MP4, PDF, .log, .har, ...)"><span class="kl-cap-ic">${Z("paperclip")}</span><span class="kl-attach-label">Attach file</span></button>` : ""}
        ${k ? `<button id="klavity-record" title="Record your screen, camera and narration"><span class="kl-cap-ic">${Z("monitor")}</span><span class="kl-record-label">Record me</span></button>` : ""}
        ${t.onRegionCapture ? `<button id="klavity-region"><span class="kl-cap-ic">${Z("scissors")}</span><span class="kl-region-label">Region</span></button>` : ""}
        ${t.onPickElement ? `<button id="klavity-pick" title="Pick the exact element that's broken"><span class="kl-cap-ic">${Z("mouse-pointer-2")}</span><span class="kl-pick-label">Pick element</span></button>` : ""}
        ${Sr.isSupported() ? `<button id="klavity-voice" title="Dictate description"><span class="kl-cap-ic">${Z("mic")}<span class="kl-vdot"></span></span><span class="kl-voice-label">Voice</span><svg class="kl-vring" viewBox="0 0 32 32" aria-hidden="true"><circle class="kl-vring-bg" cx="16" cy="16" r="13" fill="none" stroke-width="2"/><circle class="kl-vring-prog" cx="16" cy="16" r="13" fill="none" stroke-width="2" stroke-dasharray="81.68" stroke-dashoffset="81.68" stroke-linecap="round" transform="rotate(-90 16 16)"/></svg></button>` : ""}
      </div>
      ${t.onPickElement ? '<div class="klavity-pickinfo" id="klavity-pickinfo" role="status" aria-live="polite" hidden></div>' : ""}
      <label class="klav-mask-row"><input type="checkbox" id="klavity-mask-numbers"${i ? " checked" : ""}>${Z("eye-off", { size: 13 })}<span>Mask numbers</span></label>
      <input type="file" id="klavity-file" accept="image/*,.heic,.heif" multiple style="display:none">
      ${x ? '<input type="file" id="klavity-attach-input" accept="video/*,image/*,.pdf,.log,.har,.txt,.json,.csv,.zip" multiple style="display:none">' : ""}
      <div class="klavity-counter" id="klavity-counter">0/${m} images</div>
      ${x ? '<div class="klavity-files" id="klavity-files" hidden></div>' : ""}
      ${k ? '<div class="klavity-files klavity-recordings" id="klavity-recordings" hidden></div>' : ""}
      <div class="klavity-error" id="klavity-err"></div>
      <textarea class="klavity-desc" id="klavity-desc" placeholder="${e === "feature" ? "Describe the feature you'd like..." : "Describe the bug..."}"></textarea>
      <div class="klavity-desc-hint" id="klavity-desc-hint" hidden>${Z("sparkles", { size: 13 })}<span>No title needed — we'll auto-generate one for you</span></div>
      ${Sr.isSupported() ? '<div class="klavity-voice-status" id="klavity-voice-status" role="status" aria-live="polite" hidden></div>' : ""}
      ${n.reportClarity ? `<div class="klavity-clarity" id="klavity-clarity" role="status" aria-live="polite" hidden>
        <div class="kl-clr-bar"><i></i><i></i><i></i></div>
        <div class="kl-clr-row"><span>Report clarity</span><span class="kl-clr-st" id="klavity-clarity-status">Needs detail</span></div>
        <div class="kl-clr-chips">
          <span class="kl-clr-chip" id="klavity-clarity-problem"><span class="kl-clr-mark">○</span> What's broken</span>
          <span class="kl-clr-chip" id="klavity-clarity-expected"><span class="kl-clr-mark">○</span> What you expected</span>
          <span class="kl-clr-chip" id="klavity-clarity-repro"><span class="kl-clr-mark">○</span> How to reproduce</span>
        </div>
        <div class="kl-clr-tip" id="klavity-clarity-tip" hidden><span class="kl-clr-ai">${Z("lightbulb", { size: 14 })}</span><span id="klavity-clarity-tip-text"></span></div>
      </div>` : ""}
      ${t.onCheckKnown ? '<div class="klavity-known" id="klavity-known" role="status" aria-live="polite" hidden></div>' : ""}
      ${t.requireEmail ? '<input type="email" class="klavity-remail" id="klavity-remail" placeholder="your@email.com" autocomplete="email">' : ""}
      ${n.reportClarity && n.preSubmitNudge !== !1 ? `<div class="klavity-nudge" id="klavity-nudge" role="alert" hidden>
        <div class="kl-nudge-h">This might be hard for the team to act on</div>
        <div class="kl-nudge-d">Adding what you expected + one step to reproduce gets it fixed faster. Or send it as-is — your call.</div>
        <div class="kl-nudge-row"><button type="button" class="kl-nudge-add" id="klavity-nudge-add">Add detail</button><button type="button" class="kl-nudge-anyway" id="klavity-nudge-anyway">Submit anyway</button></div>
      </div>` : ""}
      <button type="button" class="klavity-submit" id="klavity-submit" title="Submit (S)" disabled>Submit</button>
      <div class="klavity-progress" id="klavity-progress" role="progressbar" aria-label="Uploading report"><div class="klavity-progress-fill" id="klavity-progress-fill"></div></div>
    </div>
  `, $e.appendChild($), l.appendChild($e);
  const ye = l.getElementById("klavity-mask-numbers");
  ye && ye.addEventListener("change", () => {
    i = ye.checked;
  });
  const X = l.getElementById("klavity-sharp"), fe = l.querySelector(".klavity-info-pop");
  if (X && fe) {
    const w = document.createElement("div");
    w.className = "kl-float-tip", w.setAttribute("role", "tooltip"), w.innerHTML = fe.innerHTML, l.appendChild(w);
    const E = () => {
      const M = X.getBoundingClientRect(), O = Math.min(228, window.innerWidth - 16), T = 8, D = window.innerWidth, U = window.innerHeight, B = M.left + M.width / 2 - O / 2, F = Math.max(T, Math.min(B, D - O - T));
      w.style.left = F + "px", w.style.top = "-9999px", w.style.visibility = "hidden", w.style.display = "block";
      const Y = w.offsetHeight;
      w.style.display = "", w.style.visibility = "";
      let j = M.bottom + 8;
      j + Y + T > U && (j = M.top - Y - 8), j = Math.max(T, Math.min(j, U - Y - T)), w.style.top = j + "px", w.classList.add("kl-show");
    }, A = () => w.classList.remove("kl-show");
    X.addEventListener("mouseenter", E), X.addEventListener("mouseleave", A), X.addEventListener("focus", E), X.addEventListener("blur", A);
  }
  function De(w) {
    ce = w === "attached", Et();
    const E = l.getElementById("klavity-replay-chip");
    E && (E.classList.toggle("kl-chip-on", w === "attached"), E.classList.toggle("kl-chip-off", w !== "attached"), E.innerHTML = Ep(w));
  }
  const ue = {
    shadowRoot: l,
    // Host seeds shots it already tracks (evidence-session restore, region-initial): fireAdded=false so
    // onShotAdded does NOT re-fire (which would double-persist). Page metadata is carried through as-is.
    addScreenshot: (w, E, A, M) => ut(w, E, A, !1, !!M),
    close: Jt,
    setReplayState: De
  };
  function Ee() {
    const w = l.getElementById("klavity-strip"), E = l.getElementById("klavity-counter");
    if (w.innerHTML = "", c.forEach((A, M) => {
      const O = document.createElement("div");
      O.className = "klavity-thumb", M === he && O.classList.add("kl-thumb-active");
      const T = document.createElement("img");
      T.src = A, T.title = "Click to select + mark up", T.addEventListener("load", () => {
        T.naturalHeight > T.naturalWidth * 1.4 && O.classList.add("kl-tall");
      }, { once: !0 }), T.addEventListener("click", () => {
        he = M, Ee();
      });
      const D = document.createElement("button");
      D.className = "klavity-rm", D.innerHTML = Z("x", { size: 13 }), D.title = "Remove", D.addEventListener("click", (F) => {
        var Y;
        F.stopPropagation(), c.splice(M, 1), p.splice(M, 1), s.splice(M, 1), h.splice(M, 1);
        try {
          (Y = t.onShotRemoved) == null || Y.call(t, M);
        } catch {
        }
        delete I[M];
        for (const j of Object.keys(I).map(Number).filter((H) => H > M).sort((H, G) => H - G))
          I[j - 1] = I[j], delete I[j];
        delete K[M], delete ve[M];
        for (const j of Object.keys(K).map(Number).filter((H) => H > M).sort((H, G) => H - G))
          K[j - 1] = K[j], delete K[j];
        for (const j of Object.keys(ve).map(Number).filter((H) => H > M).sort((H, G) => H - G))
          ve[j - 1] = ve[j], delete ve[j];
        c.length === 0 && pt(null), Ee();
      });
      const U = document.createElement("button");
      U.className = "klavity-mk", U.innerHTML = Z("pencil", { size: 13 }), U.title = "Mark up", U.addEventListener("click", (F) => {
        F.stopPropagation(), Jc(M);
      }), O.append(T, D, U);
      const B = s[M];
      if (B) {
        const F = Mp[B], Y = document.createElement("span");
        if (Y.className = "klavity-qb kl-q-" + B, Y.title = B === "real-pixel" ? "Pixel-perfect capture (every image included)" : B === "wireframe" ? "Wireframe fallback — layout only, images not captured. Retake for a sharp shot." : "Rendered capture — some cross-origin images may be missing. Retake for a sharp shot.", Y.innerHTML = Z(F.iconName, { size: 10 }) + '<span class="klavity-qb-t">' + vt(F.label) + "</span>", O.appendChild(Y), F.degraded && t.onRetakeSharp) {
          const j = document.createElement("button");
          j.type = "button", j.className = "klavity-retake", j.innerHTML = Z("zap", { size: 11 }) + "<span>Retake sharp</span>", j.title = "Recapture this shot at full pixel quality", j.addEventListener("click", (H) => {
            H.stopPropagation(), Bc(M, j);
          }), O.appendChild(j);
        }
      }
      if (Is.has(M)) {
        const F = document.createElement("div");
        F.className = "klavity-retake-note", F.textContent = "Markup cleared for the retake.", O.appendChild(F);
      }
      w.appendChild(O);
    }), a) {
      const A = document.createElement("div");
      A.className = "kl-thumb-skel kl-loading", A.setAttribute("role", "status"), A.setAttribute("aria-label", "Capturing screenshot"), A.innerHTML = '<span class="kl-skel-spin" aria-hidden="true"></span><span>Capturing…</span>', w.appendChild(A);
    }
    E.textContent = `${c.length}/${m} images`, Et(), zr(), qs();
  }
  function zr() {
    const w = l.getElementById("klavity-sharphint");
    if (!w) return;
    if (c.length > 0 && he >= 0 && he < c.length && !!h[he] && !d && !!t.onCaptureSharp && !Ze) {
      if (!w.dataset.built) {
        w.dataset.built = "1", w.innerHTML = "";
        const M = document.createElement("span");
        M.className = "kl-sh-ic", M.innerHTML = Z("triangle-alert", { size: 15 });
        const O = document.createElement("span");
        O.className = "kl-sh-txt", O.textContent = "Some areas didn't capture (cross-origin images render blank) - click Screen for a pixel-perfect shot.";
        const T = document.createElement("button");
        T.type = "button", T.className = "kl-sh-use", T.textContent = "Use Screen", T.addEventListener("click", () => {
          d = !0, zr(), X == null || X.click();
        });
        const D = document.createElement("button");
        D.type = "button", D.className = "kl-sh-x", D.setAttribute("aria-label", "Dismiss"), D.title = "Dismiss", D.innerHTML = Z("x", { size: 12 }), D.addEventListener("click", () => {
          d = !0, zr();
        }), w.append(M, O, T, D);
      }
      w.hidden = !1, X == null || X.classList.add("kl-suggest");
    } else
      w.hidden = !0, X == null || X.classList.remove("kl-suggest");
  }
  function Ve(w) {
    const E = l.getElementById("klavity-err");
    E && (E.textContent = w, E.style.display = "block");
  }
  function Ln() {
    const w = l.getElementById("klavity-err");
    w && (w.style.display = "none");
  }
  function ut(w, E, A, M = !0, O = !1) {
    var T;
    if (c.length >= m) {
      Ve(`You can attach up to ${m} images.`);
      return;
    }
    if (Ln(), c.push(w), p.push(t.compressImage ? t.compressImage(w) : Promise.resolve(w)), s.push(E), h.push(O && E !== "real-pixel"), M && (he = c.length - 1), Ee(), M)
      try {
        (T = t.onShotAdded) == null || T.call(t, w, E);
      } catch {
      }
  }
  const Is = /* @__PURE__ */ new Set();
  async function Bc(w, E) {
    if (!(Ze || !t.onRetakeSharp)) {
      ze(!0), E.classList.add("kl-loading"), o.style.display = "none";
      try {
        const A = i ? Ft(document.body) : null;
        let M;
        try {
          M = await t.onRetakeSharp();
        } finally {
          A == null || A();
        }
        if (M) {
          const { dataUrl: O, quality: T } = kt(M);
          O && (c[w] = O, p[w] = t.compressImage ? t.compressImage(O) : Promise.resolve(O), s[w] = T ?? "real-pixel", h[w] = !1, I[w] && (delete I[w], Is.add(w)), delete K[w], delete ve[w]);
        }
      } catch {
      } finally {
        o.style.display = "", ze(!1), Ee();
      }
    }
  }
  function Ls(w) {
    return w.type.startsWith("image/") || /\.(heic|heif|png|jpe?g|gif|webp|bmp|avif|svg)$/i.test(w.name);
  }
  async function On(w) {
    Ln();
    for (const E of w) {
      if (c.length >= m) {
        Ve(`You can attach up to ${m} images.`);
        break;
      }
      if (!Ls(E)) {
        Ve(`"${E.name}" isn't an image — only image files can be attached.`);
        continue;
      }
      if (E.size > g) {
        Ve(`"${E.name}" is too large — images must be under ${Math.round(g / 1024 / 1024)} MB.`);
        continue;
      }
      try {
        ut(await go(E));
      } catch {
        Ve(`Couldn't add "${E.name}". Please try a different image.`);
      }
    }
  }
  function Os() {
    const w = l.getElementById("klavity-files");
    w && (w.innerHTML = "", w.hidden = v.length === 0, v.forEach((E, A) => {
      const M = document.createElement("div");
      M.className = "kl-file-chip";
      const O = document.createElement("span");
      O.className = "kl-file-ic", O.innerHTML = Z("file-text", { size: 14 });
      const T = document.createElement("span");
      T.className = "kl-file-nm", T.textContent = E.name, T.title = E.name;
      const D = document.createElement("span");
      D.className = "kl-file-sz", D.textContent = E.size < 1024 ? `${E.size} B` : E.size < 1024 * 1024 ? `${Math.round(E.size / 1024)} KB` : `${(E.size / 1024 / 1024).toFixed(1)} MB`;
      const U = document.createElement("button");
      U.type = "button", U.className = "kl-file-rm", U.setAttribute("aria-label", `Remove ${E.name}`), U.title = "Remove", U.innerHTML = Z("x", { size: 11 }), U.addEventListener("click", () => {
        v.splice(A, 1), Os();
      }), M.append(O, T, D, U), w.appendChild(M);
    }), Et());
  }
  async function qc(w) {
    Ln();
    for (const E of w) {
      if (Ls(E)) {
        await On([E]);
        continue;
      }
      if (v.length >= b) {
        Ve(`You can attach up to ${b} files.`);
        break;
      }
      const A = Rp(E, { file: g, video: y });
      if (E.size > A) {
        Ve(`"${E.name}" is too large — ${Cl(E) ? "videos" : "files"} must be under ${Math.round(A / 1024 / 1024)} MB.`);
        continue;
      }
      if (v.reduce((O, T) => O + T.size, 0) + E.size > S) {
        Ve(`Attachments exceed the ${Math.round(S / 1024 / 1024)} MB total limit.`);
        break;
      }
      try {
        v.push({ name: E.name, type: E.type || "", size: E.size, dataUrl: await go(E) }), Os();
      } catch {
        Ve(`Couldn't add "${E.name}". Please try a different file.`);
      }
    }
  }
  function Ts() {
    const w = l.getElementById("klavity-recordings");
    w && (w.innerHTML = "", w.hidden = L.length === 0, L.forEach((E, A) => {
      const M = document.createElement("div");
      M.className = "kl-file-chip kl-rec-chip", M.setAttribute("data-kind", "recording");
      const O = document.createElement("span");
      O.className = "kl-file-ic", O.innerHTML = Z("play", { size: 14 });
      const T = document.createElement("span");
      T.className = "kl-file-nm";
      const D = Math.round(E.durationMs / 1e3), U = `Recording ${Math.floor(D / 60)}:${String(D % 60).padStart(2, "0")}${E.screenOnly ? " (screen only)" : ""}`;
      T.textContent = U, T.title = U;
      const B = document.createElement("span");
      B.className = "kl-file-sz", B.textContent = E.bytes < 1024 * 1024 ? `${Math.round(E.bytes / 1024)} KB` : `${(E.bytes / 1024 / 1024).toFixed(1)} MB`;
      const F = document.createElement("button");
      F.type = "button", F.className = "kl-file-rm", F.setAttribute("aria-label", `Remove ${U}`), F.title = "Remove", F.innerHTML = Z("x", { size: 11 }), F.addEventListener("click", () => {
        L.splice(A, 1), Ts();
      }), M.append(O, T, B, F), w.appendChild(M);
    }), Et());
  }
  let Nt = null;
  function Jt(w) {
    var M;
    if (de) return;
    de = !0, Nt == null || Nt(), te && (clearTimeout(te), te = null), document.removeEventListener("keydown", _t, { capture: !0 }), document.removeEventListener("paste", _s);
    try {
      (M = t.onClose) == null || M.call(t, w == null ? void 0 : w.reason);
    } catch {
    }
    const E = l.querySelector(".klavity-modal");
    if (w != null && w.immediate || !E) {
      xe(o);
      return;
    }
    E.classList.add("kl-closing");
    const A = () => xe(o);
    E.addEventListener("animationend", A, { once: !0 }), setTimeout(A, 700);
  }
  function Ns(w, E) {
    if (te || de) return;
    const A = document.createElement("div");
    A.className = "klavity-toast-progress", A.style.animationDuration = E + "ms", w.appendChild(A);
    let M = E, O = Date.now();
    const T = () => {
      O = Date.now(), te = setTimeout(() => {
        Jt();
      }, M);
    }, D = () => {
      te && (clearTimeout(te), te = null, M = Math.max(0, M - (Date.now() - O)), A.style.animationPlayState = "paused");
    }, U = () => {
      te || w.classList.contains("kl-closing") || (A.style.animationPlayState = "running", T());
    };
    w.addEventListener("mouseenter", D), w.addEventListener("mouseleave", U), w.addEventListener("focusin", D), w.addEventListener("focusout", (B) => {
      w.contains(B.relatedTarget) || U();
    }), T();
  }
  function _t(w) {
    if (w.key === "Escape") {
      w.stopPropagation(), Jt();
      return;
    }
    if ((w.key === "s" || w.key === "S") && !w.metaKey && !w.ctrlKey && !w.altKey) {
      const E = typeof w.composedPath == "function" && w.composedPath()[0] || w.target;
      if (E && (E.tagName === "INPUT" || E.tagName === "TEXTAREA" || E.tagName === "SELECT" || E.isContentEditable) || l.querySelector(".kl-edtb")) return;
      const A = l.getElementById("klavity-submit");
      A && !A.disabled && (w.preventDefault(), w.stopPropagation(), A.click());
    }
  }
  document.addEventListener("keydown", _t, { capture: !0 });
  const _s = (w) => {
    if (!w.clipboardData) return;
    const E = Array.from(w.clipboardData.items).filter((A) => A.type.startsWith("image/")).map((A) => A.getAsFile()).filter((A) => !!A);
    E.length && On(E);
  };
  document.addEventListener("paste", _s);
  const Tn = () => {
    const w = $.querySelector("#klavity-desc");
    w && (w.placeholder = R === "feature" ? "Describe the feature you'd like..." : R === "bug" ? "Describe the bug..." : "Describe the issue...");
  };
  if (N) {
    const w = Array.from($.querySelectorAll(".kl-type-chip"));
    w.forEach((E) => {
      E.addEventListener("click", () => {
        R = E.getAttribute("data-kind") || "bug", w.forEach((A) => {
          const M = A === E;
          A.classList.toggle("active", M), A.setAttribute("aria-checked", M ? "true" : "false");
        }), Tn();
      });
    });
  } else {
    const w = $.querySelector(".bug"), E = $.querySelector(".feat");
    w.addEventListener("click", () => {
      R = "bug", w.classList.add("active"), E.classList.remove("active"), Tn();
    }), E.addEventListener("click", () => {
      R = "feature", E.classList.add("active"), w.classList.remove("active"), Tn();
    });
  }
  const ke = $.querySelector("#klavity-desc"), Pt = $.querySelector("#klavity-submit"), dt = $.querySelector("#klavity-remail");
  dt && t.prefillEmail && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t.prefillEmail) && (dt.value = t.prefillEmail);
  const Ps = $.querySelector("#klavity-desc-hint"), Wc = () => !t.requireEmail || !!dt && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(dt.value.trim()), $s = () => c.length > 0 || ce || v.length > 0 || L.length > 0, jc = () => {
    ke.style.height = "auto";
    const w = ke.offsetHeight - ke.clientHeight;
    ke.style.height = Math.min(ke.scrollHeight + w, Math.round(window.innerHeight * 0.4)) + "px";
  }, Et = () => {
    const w = ke.value.trim() === "";
    Pt.disabled = w && !$s() || !Wc(), Ps && (Ps.hidden = !(w && $s()));
  };
  if (ke.addEventListener("input", jc), ke.addEventListener("input", Et), dt == null || dt.addEventListener("input", Et), t.onCheckKnown) {
    const w = $.querySelector("#klavity-known"), E = t.onCheckKnown;
    let A = null, M = 0, O = "";
    const T = () => {
      w && (w.hidden = !0, w.textContent = "");
    }, D = (B) => {
      var Y;
      if (!w) return;
      const F = B.headline ? vt(B.headline) : "Already reported";
      w.innerHTML = `<span class="kl-known-ic">${Z("check-circle", { size: 15 })}</span><div class="kl-known-body"><span class="kl-known-title">${F}</span> — status: <span class="kl-known-status">${vt(B.statusLabel)}</span>. We're already tracking "${vt(B.title)}". Add your note and submit anyway — it'll be linked.</div><button type="button" class="kl-known-dismiss" id="klavity-known-dismiss">Dismiss</button>`, w.hidden = !1, (Y = w.querySelector("#klavity-known-dismiss")) == null || Y.addEventListener("click", () => {
        O = ke.value.trim(), T();
      });
    }, U = async () => {
      const B = ke.value.trim();
      if (B.length < 12 || B === O) {
        T();
        return;
      }
      const F = ++M;
      try {
        const Y = await E(B);
        if (F !== M) return;
        if (ke.value.trim() === O) {
          T();
          return;
        }
        Y ? D(Y) : T();
      } catch {
      }
    };
    ke.addEventListener("input", () => {
      ke.value.trim() !== O && (O = ""), A && clearTimeout(A), A = setTimeout(U, 500);
    });
  }
  if (n.reportClarity) {
    const w = $.querySelector("#klavity-clarity"), E = $.querySelector("#klavity-clarity-status"), A = {
      problem: $.querySelector("#klavity-clarity-problem"),
      expected: $.querySelector("#klavity-clarity-expected"),
      repro: $.querySelector("#klavity-clarity-repro")
    }, M = $.querySelector("#klavity-clarity-tip"), O = $.querySelector("#klavity-clarity-tip-text"), T = $.querySelector("#klavity-nudge"), D = t.onClarityTip, U = /* @__PURE__ */ new Map();
    let B = null, F = 0;
    const Y = (ee, ie, Se) => {
      if (!ee) return;
      ee.classList.toggle("done", ie);
      const Ye = ee.querySelector(".kl-clr-mark");
      Ye && (Ye.innerHTML = ie ? Z("check", { size: 12 }) : "○"), ee.setAttribute("aria-label", (ie ? "covered: " : "missing: ") + Se);
    }, j = () => {
      M && (M.hidden = !0);
    }, H = (ee) => {
      !M || !O || (O.innerHTML = vt(ee) + '<span class="kl-clr-aitag">AI</span>', M.hidden = !1);
    }, G = () => {
      const ee = ke.value, ie = Sl(ee);
      w && (w.hidden = ee.trim().length === 0, w.classList.remove("l1", "l2", "l3"), w.classList.add(ie.level === "great" ? "l3" : ie.level === "good" ? "l2" : "l1")), E && (E.textContent = ie.label), Y(A.problem, ie.coverage.problem, "What's broken"), Y(A.expected, ie.coverage.expected, "What you expected"), Y(A.repro, ie.coverage.repro, "How to reproduce"), T && !T.hidden && (T.hidden = !0), ie.level === "great" && j();
    }, Q = () => {
      !D || !M || (B && clearTimeout(B), B = setTimeout(async () => {
        const ee = ke.value.trim();
        if (!kp(ee)) {
          j();
          return;
        }
        if (U.has(ee)) {
          H(U.get(ee));
          return;
        }
        const ie = ++F;
        try {
          const Se = await D(ee, { images: c.length });
          if (ie !== F || ke.value.trim() !== ee) return;
          Se && Se.tip && (U.set(ee, Se.tip), H(Se.tip));
        } catch {
        }
      }, 1e3));
    };
    ke.addEventListener("input", () => {
      G(), Q();
    }), G(), (Ws = $.querySelector("#klavity-nudge-add")) == null || Ws.addEventListener("click", () => {
      T && (T.hidden = !0);
      try {
        ke.focus();
      } catch {
      }
    }), (js = $.querySelector("#klavity-nudge-anyway")) == null || js.addEventListener("click", () => {
      T && (T.hidden = !0), Pt.click();
    });
  }
  $e.addEventListener("click", (w) => {
    w.target === $e && Jt();
  }), (Hs = $.querySelector("#klavity-x")) == null || Hs.addEventListener("click", () => Jt()), (Vs = $.querySelector("#klavity-min")) == null || Vs.addEventListener("click", () => {
    var w;
    try {
      (w = t.onMinimize) == null || w.call(t);
    } catch {
    }
  });
  const Ds = () => Array.from($.querySelectorAll(".klavity-actions button:not(#klavity-voice)"));
  let Ze = !1;
  const ze = (w) => {
    Ze = w, Ds().forEach((A) => {
      A.disabled = w;
    }), ke.disabled = w;
    const E = $.querySelector("#klavity-voice");
    E && (E.disabled = w), $.querySelectorAll(".kl-htool,.kl-htbtn,.kl-hopt,.kl-hcolor").forEach((A) => {
      A.disabled = w;
    }), l.querySelectorAll("#klavity-title,#klavity-remail,.kl-type-chip,.klavity-toggle button,#klavity-mask-numbers,.kl-file-rm,.klavity-rm,.klavity-mk,.klavity-retake").forEach((A) => {
      A.disabled = w;
    }), w ? (Nt == null || Nt(), Pt.disabled = !0) : (Et(), zr());
  }, pt = (w) => {
    Ds().forEach((E) => {
      E.classList.remove("kl-active"), E.removeAttribute("aria-pressed");
    }), w && (w.classList.add("kl-active"), w.setAttribute("aria-pressed", "true"));
  }, $t = $.querySelector("#klavity-voice");
  if ($t) {
    const w = new Sr(), E = 81.68, A = 15e3, M = $t.querySelector(".kl-vring-prog");
    let O = 0, T = 0, D = !1;
    const U = () => {
      T = Date.now();
      const G = () => {
        const Q = Date.now() - T, ee = Math.min(Q / 18e4, 1);
        if (M == null || M.setAttribute("stroke-dashoffset", String(ee * E)), Q >= 18e4 - A && $t.classList.add("kl-voice-warn"), Q >= 18e4) {
          w.stop();
          return;
        }
        O = requestAnimationFrame(G);
      };
      O = requestAnimationFrame(G);
    }, B = () => {
      cancelAnimationFrame(O), M == null || M.setAttribute("stroke-dashoffset", String(E)), $t.classList.remove("kl-voice-warn");
    }, F = $.querySelector("#klavity-voice-status");
    let Y = null;
    const j = () => {
      Y && (clearTimeout(Y), Y = null), F && (F.hidden = !0, F.textContent = "", F.classList.remove("kl-vs-info", "kl-vs-err"));
    }, H = (G, Q, ee) => {
      !F || !Q || (Y && (clearTimeout(Y), Y = null), F.classList.remove("kl-vs-info", "kl-vs-err"), F.classList.add(G === "err" ? "kl-vs-err" : "kl-vs-info"), F.textContent = Q, F.hidden = !1, ee && (Y = setTimeout(j, ee)));
    };
    w.onTranscript = (G) => {
      const Q = ke.value;
      ke.value = Q + (Q.length > 0 && !/\s$/.test(Q) ? " " : "") + G, Et();
    }, w.onStatus = (G, Q) => {
      G === "idle" ? j() : H("info", Q);
    }, w.onError = (G, Q) => {
      Q && H("err", Q, 4e3);
    }, w.onStop = () => {
      D = !1, $t.classList.remove("kl-voice-rec"), B();
    }, $t.addEventListener("click", () => {
      D ? w.stop() : (j(), D = !0, $t.classList.add("kl-voice-rec"), w.start(), U());
    }), Nt = () => {
      D && w.stop();
    };
  }
  Pt.addEventListener("click", async () => {
    if (Ze || Pt.disabled) return;
    const w = ke.value.trim(), E = $.querySelector("#klavity-title"), A = E ? E.value.trim() : "", M = R === "feature" ? "feature" : "bug", O = p.slice(), T = W(), D = v.slice(), U = L.slice(), B = R, F = (dt == null ? void 0 : dt.value.trim()) || void 0;
    ze(!0), Pt.textContent = "Uploading…";
    const Y = l.getElementById("klavity-err");
    Y.style.display = "none";
    const j = l.getElementById("klavity-progress"), H = l.getElementById("klavity-progress-fill");
    j && H && (j.classList.add("show"), H.style.transition = "none", H.style.width = "8%", H.offsetWidth, H.style.transition = "width 10s cubic-bezier(.05,.7,.2,1)", requestAnimationFrame(() => {
      H.style.width = "90%";
    }));
    const G = () => {
      H && (H.style.transition = "width .25s ease", H.style.width = "100%");
    }, Q = () => {
      j && H && (j.classList.remove("show"), H.style.transition = "none", H.style.width = "0");
    };
    try {
      const ee = await Promise.all(O), ie = {
        type: M,
        ...N ? { kind: B } : {},
        ...A ? { title: A } : {},
        description: w,
        screenshots: ee,
        ...D.length ? { files: D } : {},
        ...U.length ? { recordings: U } : {},
        annotations: T,
        reporterEmail: F
      };
      if (t.backgroundUpload) {
        t.onSubmit(ie), Jt({ immediate: !0, reason: "submitted" });
        return;
      }
      const Se = await t.onSubmit(ie);
      if (de) return;
      G(), t.success ? Qc(Se.issueKey, Se.issueUrl, t.success) : Zc(Se.issueKey, Se.issueUrl);
    } catch (ee) {
      Q(), Y.textContent = ee.message, Y.style.display = "block", Pt.textContent = "Submit", ze(!1);
    }
  });
  function Hc(w, E) {
    const { dataUrl: A, quality: M, suggestSharp: O } = kt(E);
    if (!A) return;
    const T = c.indexOf(w);
    T < 0 || (c[T] = A, p[T] = t.compressImage ? t.compressImage(A) : Promise.resolve(A), s[T] = M, h[T] = !!O && M !== "real-pixel", I[T] && delete I[T], delete K[T], delete ve[T], Ee());
  }
  async function Vc(w) {
    if (!t.onCaptureViewport) return !1;
    let E = null;
    const A = i ? Ft(document.body) : null;
    try {
      const { dataUrl: M } = kt(await t.onCaptureViewport());
      M && (E = M, a = !1, ut(M, "rendered", void 0, !0, !1), w && pt(w));
    } catch {
    } finally {
      A == null || A();
    }
    return (async () => {
      const M = i ? Ft(document.body) : null;
      try {
        const O = await t.onCaptureFull();
        if (E) Hc(E, O);
        else {
          a = !1;
          const { dataUrl: T, quality: D, suggestSharp: U } = kt(O);
          T && (ut(T, D, void 0, !0, !!U), w && pt(w));
        }
      } catch {
        a = !1, Ee();
      } finally {
        M == null || M();
      }
    })(), !0;
  }
  async function Yc(w) {
    if (!t.onCaptureViewport) return !1;
    const E = i ? Ft(document.body) : null;
    try {
      const { dataUrl: A } = kt(await t.onCaptureViewport());
      A ? (a = !1, ut(A, "rendered", void 0, !0, !1)) : (a = !1, Ee());
    } catch {
      a = !1, Ee();
    } finally {
      E == null || E();
    }
    return !0;
  }
  const Zt = $.querySelector("#klavity-full");
  if (Zt.addEventListener("click", async () => {
    if (!Ze) {
      ze(!0), Zt.classList.add("kl-loading");
      try {
        if (t.onCaptureViewport) {
          await Vc(Zt);
          return;
        }
        const w = i ? Ft(document.body) : null;
        try {
          const { dataUrl: E, quality: A, suggestSharp: M } = kt(await t.onCaptureFull());
          ut(E, A, void 0, !0, !!M), pt(Zt);
        } finally {
          w == null || w();
        }
      } catch {
      } finally {
        Zt.classList.remove("kl-loading"), ze(!1);
      }
    }
  }), X && t.onCaptureSharp) {
    const w = X.querySelector(".kl-sharp-label"), E = async () => {
      if (Ze) return;
      ze(!0), X.classList.add("kl-loading"), o.style.display = "none";
      const A = w ?? X, M = A.textContent;
      A.textContent = "Capturing…";
      try {
        const O = i ? Ft(document.body) : null;
        let T;
        try {
          T = await t.onCaptureSharp();
        } finally {
          O == null || O();
        }
        if (T) {
          const { dataUrl: D, quality: U } = kt(T);
          D && (ut(D, U ?? "real-pixel"), pt(X));
        }
      } catch {
      } finally {
        o.style.display = "", A.textContent = M, X.classList.remove("kl-loading"), ze(!1);
      }
    };
    X.addEventListener("click", () => {
      E();
    });
  }
  const zs = $.querySelector("#klavity-file"), Fs = $.querySelector("#klavity-upload");
  Fs.addEventListener("click", () => {
    if (Ze || c.length >= m) {
      c.length >= m && Ve(`You can attach up to ${m} images.`);
      return;
    }
    zs.click();
  }), zs.addEventListener("change", async (w) => {
    const E = w.target, A = E.files ? Array.from(E.files) : [];
    if (E.value = "", A.length) {
      const M = c.length;
      await On(A), c.length > M && pt(Fs);
    }
  });
  const Nn = l.getElementById("klavity-attach"), _n = l.getElementById("klavity-attach-input");
  Nn && _n && (Nn.addEventListener("click", () => {
    if (!Ze) {
      if (v.length >= b) {
        Ve(`You can attach up to ${b} files.`);
        return;
      }
      _n.click();
    }
  }), _n.addEventListener("change", async (w) => {
    const E = w.target, A = E.files ? Array.from(E.files) : [];
    if (E.value = "", A.length) {
      const M = v.length;
      await qc(A), v.length > M && pt(Nn);
    }
  }));
  const vr = l.getElementById("klavity-record");
  vr && t.onRecord && vr.addEventListener("click", async () => {
    if (Ze) return;
    if (L.length >= C) {
      Ve(`You can attach up to ${C} recordings.`);
      return;
    }
    ze(!0), vr.classList.add("kl-loading");
    const w = (E) => {
      o.style.display = E === "recording" ? "none" : "";
    };
    try {
      const E = await t.onRecord(w);
      E && (L.push(E), Ts(), pt(vr));
    } catch {
    } finally {
      o.style.display = "", vr.classList.remove("kl-loading"), ze(!1);
    }
  });
  const Pn = l.getElementById("klavity-region");
  Pn && t.onRegionCapture && (Pn.onclick = () => {
    Ze || (ze(!0), document.removeEventListener("keydown", _t, { capture: !0 }), o.style.display = "none", Ip(async (w) => {
      document.addEventListener("keydown", _t, { capture: !0 });
      try {
        const E = i ? Ft(document.body) : null;
        let A;
        try {
          A = await t.onRegionCapture(w);
        } finally {
          E == null || E();
        }
        if (A) {
          const { dataUrl: M, quality: O, suggestSharp: T } = kt(A);
          M && (ut(M, O, void 0, !0, !!T), pt(Pn));
        }
      } finally {
        o.style.display = "", ze(!1);
      }
    }, () => {
      document.addEventListener("keydown", _t, { capture: !0 }), o.style.display = "", ze(!1);
    }));
  });
  const Qt = l.getElementById("klavity-pick"), er = l.getElementById("klavity-pickinfo"), Us = () => {
    var A;
    if (Qt && (Qt.classList.toggle("kl-active", !!V), V ? Qt.setAttribute("aria-pressed", "true") : Qt.removeAttribute("aria-pressed")), !er) return;
    if (!V) {
      er.hidden = !0, er.innerHTML = "";
      return;
    }
    er.hidden = !1;
    const { text: w } = V, E = w ? `: <span class="kl-pick-txt">${vt(w)}</span>` : "";
    er.innerHTML = `<span class="kl-pick-ic">${Z("mouse-pointer-2", { size: 13 })}</span><span>Element pinned${E}</span><button type="button" class="kl-pick-clear" id="klavity-pick-clear">Clear</button>`, (A = er.querySelector("#klavity-pick-clear")) == null || A.addEventListener("click", () => {
      V = null, Us();
    });
  };
  Qt && t.onPickElement && (Qt.onclick = async () => {
    if (!Ze) {
      ze(!0), document.removeEventListener("keydown", _t, { capture: !0 }), o.style.display = "none";
      try {
        const w = await t.onPickElement();
        w && (V = w, Us(), w.shot && ut(w.shot, w.shotQuality, void 0, !0));
      } catch {
      } finally {
        document.addEventListener("keydown", _t, { capture: !0 }), o.style.display = "", ze(!1);
      }
    }
  });
  function Mt(w, E = 15) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${E}" height="${E}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em">${w}</svg>`;
  }
  function Gc(w) {
    const E = (M, O, T, D) => `<button type="button" class="kl-htool" data-tool="${M}" title="${O} (${D.toUpperCase()})" aria-label="${O}">${T}<span class="kl-hk">${D.toUpperCase()}</span></button>`, A = (M) => `<button type="button" class="kl-hcolor" data-color="${M}" style="background:${M}" title="${M}" aria-label="Colour ${M}"></button>`;
    return E("pen", "Pen", Z("pencil", { size: 15 }), "p") + E("line", "Line", Mt('<line x1="5" y1="19" x2="19" y2="5"/>'), "l") + E("rect", "Rectangle", Z("square", { size: 15 }), "r") + E("circle", "Circle", Mt('<circle cx="12" cy="12" r="9"/>'), "o") + E("arrow", "Arrow", Mt('<line x1="5" y1="19" x2="19" y2="5"/><polyline points="10 5 19 5 19 14"/>'), "a") + E("text", "Text", Mt('<path d="M5 6h14M12 6v13M9 19h6"/>'), "t") + E("count", "Numbers", Mt('<circle cx="12" cy="12" r="9"/><text x="12" y="16" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor" stroke="none">1</text>'), "c") + E("crop", "Crop", Mt('<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>'), "k") + '<span class="kl-hsep"></span>' + A("#ef4444") + A("#f97316") + A("#3b82f6") + A("#111827") + // Line-width control (applies to pen/line/rect/circle/arrow strokes via Annotator.strokeScale).
    `<span class="kl-hsep"></span><span class="kl-hlabel">Stroke</span><button type="button" class="kl-hopt" data-stroke="0.6" title="Thin stroke" aria-label="Thin stroke">S</button><button type="button" class="kl-hopt kl-on" data-stroke="1" title="Medium stroke" aria-label="Medium stroke">M</button><button type="button" class="kl-hopt" data-stroke="1.8" title="Thick stroke" aria-label="Thick stroke">L</button><button type="button" class="kl-hopt" data-stroke="2.8" title="Extra-thick stroke" aria-label="Extra-thick stroke">XL</button><span class="kl-htextopts" id="kl-hero-textopts" hidden><span class="kl-hsep"></span><span class="kl-hlabel">Outline</span><button type="button" class="kl-hopt kl-on" data-outline="black" title="Black outline"><span class="kl-osq" style="background:#111"></span></button><button type="button" class="kl-hopt" data-outline="white" title="White outline"><span class="kl-osq" style="background:#fff;border:1px solid #999"></span></button><button type="button" class="kl-hopt" data-outline="none" title="No outline">None</button><span class="kl-hlabel">Size</span><button type="button" class="kl-hopt" data-size="18" title="Small">S</button><button type="button" class="kl-hopt kl-on" data-size="26" title="Medium">M</button><button type="button" class="kl-hopt" data-size="40" title="Large">L</button></span><span class="kl-hsep"></span><button type="button" class="kl-htbtn" id="kl-hero-undo" title="Undo (Cmd+Z / Ctrl+Z)" aria-label="Undo">${Mt('<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>', 14)}</button>` + // #449: explicit "Revert crop" — shown only after a crop on this image (visibility driven by the
    // per-image crop stack). Reverts the most recent crop to its pre-crop image + original markup.
    (w ? `<button type="button" class="kl-htbtn kl-hrevert" id="kl-hero-revert" title="Revert crop to original" aria-label="Revert crop">${Mt('<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 5 5v2"/>', 14)}<span class="kl-hk kl-hrevert-lbl">Revert</span></button>` : "") + `<button type="button" class="kl-htbtn" id="kl-hero-clear" title="Clear" aria-label="Clear">${Z("trash-2", { size: 14 })}</button><span class="kl-hgrow"></span><span class="kl-hhint">P pen · L line · R rect · O circle · T text · C numbers · K crop · scroll to zoom · shift-drag to pan</span>`;
  }
  function Fr() {
    Ce && (document.removeEventListener("keydown", Ce, { capture: !0 }), Ce = null);
  }
  function Bs() {
    const w = l.getElementById("klavity-hero-stage"), E = l.getElementById("klavity-hero-tools");
    E && (E.innerHTML = ""), w && (w.innerHTML = `<div class="kl-hero-empty">${Z("image", { size: 34 })}<span>Capture or upload a screenshot to start marking it up</span></div>`), Fr();
  }
  function qs() {
    if (c.length === 0) {
      he = 0, Bs();
      return;
    }
    he >= c.length && (he = c.length - 1), he < 0 && (he = 0), Kc(he);
  }
  function Xc(w, E, A, M, O) {
    const T = c[w];
    if (!T) return;
    const D = new Image();
    D.onload = () => {
      var G, Q;
      if (c[w] !== T) return;
      const U = document.createElement("canvas");
      U.width = Math.max(1, Math.round(M)), U.height = Math.max(1, Math.round(O));
      const B = U.getContext("2d");
      if (!B) return;
      B.drawImage(D, E, A, M, O, 0, 0, U.width, U.height);
      let F;
      try {
        F = U.toDataURL("image/png");
      } catch {
        return;
      }
      const Y = ((G = K[w]) == null ? void 0 : G.length) ?? 0, j = je(w);
      c[w] = F, p[w] = t.compressImage ? t.compressImage(F) : Promise.resolve(F);
      const H = (Q = I[w]) == null ? void 0 : Q.shapes;
      Array.isArray(H) && H.length ? I[w] = { w: U.width, h: U.height, shapes: Cp(H, -E, -A) } : delete I[w], (K[w] ?? (K[w] = [])).push(j), (ve[w] ?? (ve[w] = [])).push({ snap: j, mark: Y }), Ee();
    }, D.src = T;
  }
  function Kc(w) {
    var B, F, Y, j, H;
    const E = l.getElementById("klavity-hero-stage"), A = l.getElementById("klavity-hero-tools");
    if (!E || !A) return;
    const M = c[w];
    if (!M) {
      Bs();
      return;
    }
    Fr(), E.innerHTML = "";
    const O = document.createElement("canvas");
    O.width = 1, O.height = 1, O.style.cssText = "display:block;max-width:100%;max-height:100%;object-fit:contain;cursor:crosshair;touch-action:none;background:#fff;border-radius:8px;box-shadow:0 12px 40px rgba(0,0,0,.5);";
    const T = new lo(O, M), D = (B = I[w]) == null ? void 0 : B.shapes;
    Array.isArray(D) && D.forEach((G) => T.shapes.push({ ...G })), E.appendChild(O);
    const U = new Image();
    U.onload = () => {
      !document.body.contains(o) || he !== w || c[w] !== M || (O.width = U.naturalWidth || 1, O.height = U.naturalHeight || 1, T.redraw());
    }, U.src = M, T.redraw();
    {
      A.innerHTML = Gc((((F = ve[w]) == null ? void 0 : F.length) ?? 0) > 0);
      let G = "pen", Q = "#ef4444", ee = 26, ie = "black";
      const Se = A.querySelector("#kl-hero-textopts"), Ye = () => {
        T.shapes.length ? I[w] = { w: O.width, h: O.height, shapes: T.shapes.map((P) => ({ ...P })) } : delete I[w];
      }, Qe = (P) => {
        G = P, A.querySelectorAll("[data-tool]").forEach((q) => q.classList.toggle("kl-on", q.dataset.tool === P)), Se && (Se.hidden = P !== "text");
      }, ht = (P, q) => {
        Q = P, A.querySelectorAll("[data-color]").forEach((ae) => ae.classList.toggle("kl-on", ae === q));
      };
      A.querySelectorAll("[data-tool]").forEach((P) => P.addEventListener("click", () => Qe(P.dataset.tool))), A.querySelectorAll("[data-color]").forEach((P) => P.addEventListener("click", () => ht(P.dataset.color, P))), A.querySelectorAll("[data-outline]").forEach((P) => P.addEventListener("click", () => {
        ie = P.dataset.outline, A.querySelectorAll("[data-outline]").forEach((q) => q.classList.toggle("kl-on", q === P));
      })), A.querySelectorAll("[data-size]").forEach((P) => P.addEventListener("click", () => {
        ee = Number(P.dataset.size), A.querySelectorAll("[data-size]").forEach((q) => q.classList.toggle("kl-on", q === P));
      })), A.querySelectorAll("[data-stroke]").forEach((P) => P.addEventListener("click", () => {
        T.strokeScale = Number(P.dataset.stroke) || 1, A.querySelectorAll("[data-stroke]").forEach((q) => q.classList.toggle("kl-on", q === P)), T.redraw();
      })), (Y = A.querySelector("#kl-hero-undo")) == null || Y.addEventListener("click", () => {
        Le(w);
      }), (j = A.querySelector("#kl-hero-revert")) == null || j.addEventListener("click", () => {
        He(w);
      }), (H = A.querySelector("#kl-hero-clear")) == null || H.addEventListener("click", () => {
        Ie(w), T.clearAll(), Ye();
      }), Qe(G), ht(Q, A.querySelector("[data-color]"));
      const Rt = (P) => {
        const q = O.getBoundingClientRect(), ae = Math.min(q.width / O.width, q.height / O.height) || 1, Me = O.width * ae, Ne = O.height * ae, _e = (q.width - Me) / 2, mt = (q.height - Ne) / 2;
        return { x: (P.clientX - q.left - _e) / ae, y: (P.clientY - q.top - mt) / ae };
      }, Ur = () => {
        const P = O.getBoundingClientRect();
        return Math.min(P.width / O.width, P.height / O.height) || 1;
      }, Br = (P, q, ae, Me, Ne, _e) => P === "line" ? { type: "line", color: _e, x1: q, y1: ae, x2: Me, y2: Ne } : P === "arrow" ? { type: "arrow", color: _e, x1: q, y1: ae, x2: Me, y2: Ne } : P === "rect" ? { type: "rect", color: _e, x: Math.min(q, Me), y: Math.min(ae, Ne), w: Math.abs(Me - q), h: Math.abs(Ne - ae) } : P === "circle" ? { type: "circle", color: _e, x: (q + Me) / 2, y: (ae + Ne) / 2, rx: Math.abs(Me - q) / 2, ry: Math.abs(Ne - ae) / 2 } : null;
      let Te = 1, ft = 0, J = 0, ne = null;
      const Oe = (P) => Math.min(6, Math.max(1, P)), kr = () => {
        if (Te === 1) {
          ft = 0, J = 0, O.style.transform = "", O.style.cursor = "crosshair";
          return;
        }
        O.style.transformOrigin = "0 0", O.style.transform = `translate(${ft}px,${J}px) scale(${Te})`, O.style.cursor = "grab";
      }, eu = (P, q, ae) => {
        if (Te === 1) {
          const mt = O.style.transform;
          O.style.transform = "", ne = O.getBoundingClientRect(), O.style.transform = mt;
        }
        if (!ne) return;
        const Me = Te;
        if (Te = Oe(Te * ae), Te === Me) return;
        const Ne = (P - ne.left - ft) / Me, _e = (q - ne.top - J) / Me;
        ft = P - ne.left - Te * Ne, J = q - ne.top - Te * _e, kr();
      };
      E.addEventListener("wheel", (P) => {
        G !== "crop" && (P.preventDefault(), eu(P.clientX, P.clientY, P.deltaY < 0 ? 1.18 : 1 / 1.18));
      }, { passive: !1 }), E.addEventListener("dblclick", () => {
        Te = 1, kr();
      });
      let tu = T.shapes.reduce((P, q) => q.type === "count" ? Math.max(P, q.n) : P, 0), Dt = !1, et = 0, tt = 0, zt = [], tr = !1, Ys = 0, Gs = 0, Xs = 0, Ks = 0, qe = null, wr = { x: 0, y: 0 };
      O.addEventListener("pointerdown", (P) => {
        if (P.shiftKey && Te > 1) {
          tr = !0, Ys = P.clientX, Gs = P.clientY, Xs = ft, Ks = J, O.style.cursor = "grabbing";
          try {
            O.setPointerCapture(P.pointerId);
          } catch {
          }
          P.preventDefault();
          return;
        }
        const q = Rt(P);
        if (et = q.x, tt = q.y, G === "crop") {
          Dt = !0;
          try {
            O.setPointerCapture(P.pointerId);
          } catch {
          }
          wr = { x: P.clientX, y: P.clientY }, qe = document.createElement("div"), qe.style.cssText = "position:absolute;border:2px dashed #6c63ff;background:rgba(108,99,255,.14);pointer-events:none;z-index:6;left:0;top:0;width:0;height:0;", E.appendChild(qe);
          return;
        }
        if (G === "text") {
          const ae = document.createElement("input"), Me = ie === "none" ? "none" : `0 0 2px ${ie}, 0 0 2px ${ie}`, Ne = Ur(), _e = Math.max(6, ee * Ne), mt = ee, $n = ie;
          ae.style.cssText = `position:fixed;left:${P.clientX}px;top:${P.clientY}px;padding:0;margin:0;line-height:1;box-sizing:content-box;background:transparent;border:0;color:${Q};font-size:${_e}px;font-family:sans-serif;font-weight:700;text-shadow:${Me};outline:1px dashed ${Q};z-index:2147483647;min-width:80px;`, document.body.appendChild(ae), ae.focus(), ae.addEventListener("blur", () => {
            ae.value.trim() && (Ie(w), T.addShape({ type: "text", color: Q, x: et, y: tt, text: ae.value.trim(), size: mt, outline: $n }), Ye()), xe(ae);
          }, { once: !0 }), ae.addEventListener("keydown", (Zs) => {
            Zs.key === "Enter" && ae.blur(), Zs.stopPropagation();
          });
          return;
        }
        if (G === "count") {
          Ie(w), T.addShape({ type: "count", color: Q, x: q.x, y: q.y, n: ++tu }), Ye();
          return;
        }
        Dt = !0;
        try {
          O.setPointerCapture(P.pointerId);
        } catch {
        }
        G === "pen" && (zt = [q]);
      }), O.addEventListener("pointermove", (P) => {
        if (tr) {
          ft = Xs + (P.clientX - Ys), J = Ks + (P.clientY - Gs), kr(), O.style.cursor = "grabbing";
          return;
        }
        if (!Dt) return;
        if (G === "pen") {
          zt.push(Rt(P)), zt.length > 1 && T.drawPreview({ type: "pen", color: Q, points: zt });
          return;
        }
        if (G === "crop" && qe) {
          const Me = E.getBoundingClientRect(), Ne = Math.min(wr.x, P.clientX), _e = Math.min(wr.y, P.clientY), mt = Math.max(wr.x, P.clientX), $n = Math.max(wr.y, P.clientY);
          qe.style.left = Ne - Me.left + "px", qe.style.top = _e - Me.top + "px", qe.style.width = mt - Ne + "px", qe.style.height = $n - _e + "px";
          return;
        }
        const q = Rt(P), ae = Br(G, et, tt, q.x, q.y, Q);
        ae && T.drawPreview(ae);
      }), O.addEventListener("pointerup", (P) => {
        if (tr) {
          tr = !1, O.style.cursor = Te > 1 ? "grab" : "crosshair";
          try {
            O.releasePointerCapture(P.pointerId);
          } catch {
          }
          return;
        }
        if (!Dt) return;
        Dt = !1;
        try {
          O.releasePointerCapture(P.pointerId);
        } catch {
        }
        const q = Rt(P);
        if (G === "crop") {
          qe && (xe(qe), qe = null);
          const Me = Math.max(0, Math.min(et, q.x)), Ne = Math.max(0, Math.min(tt, q.y)), _e = Math.abs(q.x - et), mt = Math.abs(q.y - tt);
          _e > 4 && mt > 4 && Xc(w, Me, Ne, _e, mt);
          return;
        }
        (G === "pen" && zt.length > 1 || G === "line" || G === "rect" || G === "circle" || G === "arrow") && Ie(w), G === "pen" && zt.length > 1 ? T.addShape({ type: "pen", color: Q, points: zt }) : G === "line" ? T.addShape({ type: "line", color: Q, x1: et, y1: tt, x2: q.x, y2: q.y }) : G === "rect" ? T.addShape({ type: "rect", color: Q, x: Math.min(et, q.x), y: Math.min(tt, q.y), w: Math.abs(q.x - et), h: Math.abs(q.y - tt) }) : G === "circle" ? T.addShape({ type: "circle", color: Q, x: (et + q.x) / 2, y: (tt + q.y) / 2, rx: Math.abs(q.x - et) / 2, ry: Math.abs(q.y - tt) / 2 }) : G === "arrow" && T.addShape({ type: "arrow", color: Q, x1: et, y1: tt, x2: q.x, y2: q.y }), Ye();
      }), O.addEventListener("pointercancel", (P) => {
        try {
          O.releasePointerCapture(P.pointerId);
        } catch {
        }
        qe && (xe(qe), qe = null), tr && (tr = !1, O.style.cursor = Te > 1 ? "grab" : "crosshair"), Dt && (Dt = !1, T.redraw());
      });
      const Js = { p: "pen", l: "line", r: "rect", o: "circle", a: "arrow", t: "text", c: "count", k: "crop" };
      Ce = (P) => {
        if (!document.body.contains(o)) {
          Fr();
          return;
        }
        const q = typeof P.composedPath == "function" && P.composedPath()[0] || P.target;
        if (q && (q.tagName === "INPUT" || q.tagName === "TEXTAREA" || q.tagName === "SELECT" || q.isContentEditable)) return;
        if ((P.metaKey || P.ctrlKey) && P.key.toLowerCase() === "z") {
          P.preventDefault(), Le(w);
          return;
        }
        if (P.metaKey || P.ctrlKey || P.altKey) return;
        const ae = P.key.toLowerCase();
        Js[ae] && (P.preventDefault(), Qe(Js[ae]));
      }, document.addEventListener("keydown", Ce, { capture: !0 });
    }
  }
  function Jc(w) {
    const E = c[w], A = new Image();
    A.onload = () => {
      const M = document.createElement("canvas");
      M.width = A.naturalWidth, M.height = A.naturalHeight;
      const O = new lo(M, E);
      O.redraw();
      const T = document.createElement("div");
      T.style.cssText = "position:fixed;inset:0;background:#000;z-index:2147483647;display:flex;flex-direction:column;pointer-events:all;";
      const D = document.createElement("div");
      D.className = "kl-edtb", D.style.cssText = "display:flex;align-items:center;gap:8px;padding:8px;background:#1e1e2e;flex-wrap:wrap;", D.innerHTML = `
        <button data-tool="pen" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${Z("pencil", { size: 14 })} Pen</button>
        <button data-tool="rect" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${Z("square", { size: 14 })} Rect</button>
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
        <button id="klavity-clear-ann" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${Z("trash-2", { size: 14 })} Clear</button>
        <button id="klavity-save-ann" style="padding:6px 10px;background:#89b4fa;color:#1e1e2e;border:none;border-radius:4px;cursor:pointer;font-weight:700;">${Z("check", { label: "Save", size: 14 })} Save</button>
        <button id="klavity-cancel-ann" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${Z("x", { size: 14 })}</button>
      `, M.style.cssText = "cursor:crosshair;display:block;margin:12px auto;touch-action:none;background:#fff;border-radius:4px;outline:1px solid rgba(255,255,255,.12);outline-offset:-1px;box-shadow:0 12px 44px rgba(0,0,0,.55);";
      const U = document.createElement("div");
      U.style.cssText = "flex:1;min-height:0;overflow:auto;display:block;box-shadow:inset 0 1px 0 rgba(255,255,255,.04);", U.appendChild(M);
      const B = document.createElement("style");
      B.textContent = ".kl-edtb button{transition:transform .15s cubic-bezier(.34,1.56,.64,1),background .15s ease;will-change:transform;}.kl-edtb button:hover{transform:translateY(-1px) scale(1.02);background:#45475a;}.kl-edtb button[data-color]:hover{transform:scale(1.14);background:initial;}.kl-edtb button:active{transform:scale(.96);}.kl-edtb button:focus-visible{outline:2px solid #89b4fa;outline-offset:2px;}.kl-edtb .kl-zb{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:34px;padding:0 9px;background:#313244;color:#cdd6f4;border:none;border-radius:8px;cursor:pointer;font-size:15px;font-weight:600;line-height:1;}.kl-edtb .kl-zb:hover{background:#45475a;}@media (prefers-reduced-motion:reduce){.kl-edtb button{transition:none;}.kl-edtb button:hover,.kl-edtb button:active,.kl-edtb button[data-color]:hover{transform:none;}}", T.append(B, D, U), l.appendChild(T), Fr();
      let F = 1;
      const Y = (J) => Math.max(0.05, Math.min(5, J || 1));
      function j(J) {
        F = Y(J), M.style.width = Math.round(M.width * F) + "px", M.style.height = Math.round(M.height * F) + "px";
        const ne = D.querySelector("#klavity-zoom-pct");
        ne && (ne.textContent = Math.round(F * 100) + "%");
      }
      const H = () => Math.max(1, U.clientWidth - 24) / M.width, G = () => Math.min(Math.max(1, U.clientWidth - 24) / M.width, Math.max(1, U.clientHeight - 24) / M.height), Q = M.height / M.width > Math.max(1, U.clientHeight) / Math.max(1, U.clientWidth);
      j(Q ? H() : G()), D.querySelector("#klavity-zoom-in").addEventListener("click", () => j(F * 1.25)), D.querySelector("#klavity-zoom-out").addEventListener("click", () => j(F / 1.25)), D.querySelector("#klavity-fit-width").addEventListener("click", () => j(H())), D.querySelector("#klavity-fit-page").addEventListener("click", () => j(G()));
      let ee = "rect", ie = "#ef4444", Se = !1, Ye = [], Qe = 0, ht = 0;
      function Rt(J) {
        ee = J, D.querySelectorAll("[data-tool]").forEach((ne) => {
          const Oe = ne.dataset.tool === J;
          ne.style.background = Oe ? "#585b70" : "#313244", ne.style.outline = Oe ? "2px solid #89b4fa" : "none";
        });
      }
      D.querySelectorAll("[data-tool]").forEach((J) => J.addEventListener("click", () => Rt(J.dataset.tool))), D.querySelectorAll("[data-color]").forEach((J) => J.addEventListener("click", () => {
        ie = J.dataset.color;
      })), D.querySelector("#klavity-undo").addEventListener("click", () => O.undo()), D.querySelector("#klavity-clear-ann").addEventListener("click", () => O.clearAll());
      const Ur = { p: "pen", r: "rect", c: "circle", a: "arrow", t: "text" };
      function Br(J) {
        const ne = J.target;
        if (ne && (ne.tagName === "INPUT" || ne.tagName === "TEXTAREA" || ne.isContentEditable)) return;
        if (J.key === "Escape") {
          J.stopPropagation(), Te();
          return;
        }
        if ((J.metaKey || J.ctrlKey) && J.key.toLowerCase() === "z") {
          J.preventDefault(), O.undo();
          return;
        }
        if (J.metaKey || J.ctrlKey || J.altKey) return;
        const Oe = J.key.toLowerCase();
        Ur[Oe] ? (J.preventDefault(), Rt(Ur[Oe])) : Oe === "u" && (J.preventDefault(), O.undo());
      }
      function Te() {
        document.removeEventListener("keydown", Br, { capture: !0 }), xe(T), qs();
      }
      document.addEventListener("keydown", Br, { capture: !0 }), Rt(ee), D.querySelector("#klavity-save-ann").addEventListener("click", async () => {
        Ie(w), O.shapes.length ? I[w] = { w: M.width, h: M.height, shapes: O.shapes.map((J) => ({ ...J })) } : delete I[w], Te(), Ee();
      }), D.querySelector("#klavity-cancel-ann").addEventListener("click", () => Te());
      function ft(J) {
        const ne = M.getBoundingClientRect();
        return { x: (J.clientX - ne.left) / ne.width * M.width, y: (J.clientY - ne.top) / ne.height * M.height };
      }
      M.addEventListener("pointerdown", (J) => {
        Se = !0;
        const ne = ft(J);
        if ({ x: Qe, y: ht } = ne, ee === "pen" && (Ye = [ne]), ee === "text") {
          Se = !1;
          const Oe = document.createElement("input");
          Oe.style.cssText = `position:fixed;left:${J.clientX}px;top:${J.clientY}px;background:transparent;border:1px dashed ${ie};color:${ie};font-size:16px;outline:none;z-index:9999999;min-width:80px;`, document.body.appendChild(Oe), Oe.focus(), Oe.addEventListener("blur", () => {
            Oe.value.trim() && O.addShape({ type: "text", color: ie, x: Qe, y: ht, text: Oe.value.trim() }), xe(Oe);
          }, { once: !0 }), Oe.addEventListener("keydown", (kr) => {
            kr.key === "Enter" && Oe.blur();
          });
        }
      }), M.addEventListener("pointermove", (J) => {
        Se && ee === "pen" && Ye.push(ft(J));
      }), M.addEventListener("pointerup", (J) => {
        if (!Se) return;
        Se = !1;
        const ne = ft(J);
        ee === "pen" && Ye.length > 1 ? O.addShape({ type: "pen", color: ie, points: Ye }) : ee === "rect" ? O.addShape({ type: "rect", color: ie, x: Math.min(Qe, ne.x), y: Math.min(ht, ne.y), w: Math.abs(ne.x - Qe), h: Math.abs(ne.y - ht) }) : ee === "circle" ? O.addShape({ type: "circle", color: ie, x: (Qe + ne.x) / 2, y: (ht + ne.y) / 2, rx: Math.abs(ne.x - Qe) / 2, ry: Math.abs(ne.y - ht) / 2 }) : ee === "arrow" && O.addShape({ type: "arrow", color: ie, x1: Qe, y1: ht, x2: ne.x, y2: ne.y });
      });
    }, A.src = E;
  }
  function Zc(w, E) {
    const A = document.createElement("div");
    A.style.cssText = "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:all;";
    const M = document.createElement("div");
    M.className = "klavity-sent";
    const O = document.createElement("div");
    O.className = "kl-sent-check", O.innerHTML = Z("check", { label: "Sent", size: 22 }), M.appendChild(O);
    const T = document.createElement("h2");
    T.textContent = "Report sent", M.appendChild(T);
    const D = document.createElement("p");
    if (D.textContent = n.thankYou || "We filed it and emailed you a copy.", M.appendChild(D), w) {
      const U = document.createElement("div");
      U.className = "klavity-ref";
      const B = document.createElement("span");
      B.textContent = "Filed as";
      const F = document.createElement("code");
      F.textContent = fo(w), U.append(B, F);
      const Y = mo(E);
      if (Y) {
        const j = document.createElement("a");
        j.href = Y, j.target = "_blank", j.rel = "noopener", j.textContent = "Open in Klavity", U.appendChild(j);
      }
      M.appendChild(U);
    }
    A.appendChild(M), xe($e), l.appendChild(A), Ns(M, Ae);
  }
  function Qc(w, E, A) {
    const { copy: M, onLead: O } = A;
    $.innerHTML = "";
    const T = document.createElement("div");
    T.className = "klavity-success";
    const D = document.createElement("h2");
    if (D.innerHTML = M.headline, T.appendChild(D), M.body) {
      const B = document.createElement("p");
      B.textContent = M.body, T.appendChild(B);
    }
    if (w) {
      const B = document.createElement("div");
      B.className = "klavity-ref";
      const F = document.createElement("span");
      F.textContent = "Filed as";
      const Y = document.createElement("code");
      Y.textContent = fo(w), B.append(F, Y);
      const j = mo(E);
      if (j) {
        const H = document.createElement("a");
        H.href = j, H.target = "_blank", H.rel = "noopener", H.textContent = "View in dashboard", B.appendChild(H);
      }
      T.appendChild(B);
    }
    const U = () => Ns($, be);
    if (M.showEmail) {
      const B = document.createElement("div");
      B.className = "klavity-lead";
      const F = document.createElement("input");
      F.type = "email", F.placeholder = "you@company.com";
      const Y = document.createElement("button"), j = M.emailLabel;
      Y.textContent = j;
      const H = document.createElement("div");
      H.className = "klavity-lead-err", H.setAttribute("role", "alert"), H.style.display = "none";
      const G = async () => {
        const Q = F.value.trim();
        if (!Q || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(Q)) {
          H.textContent = "Please enter a valid email so we can reach you.", H.style.display = "block", F.focus();
          return;
        }
        Y.disabled = !0, Y.textContent = "Saving…", H.style.display = "none";
        try {
          O && await O(w, Q);
        } catch (ie) {
          try {
            console.warn("[Klavity] lead capture failed:", (ie == null ? void 0 : ie.message) || ie);
          } catch {
          }
          H.textContent = "Couldn't save your email — please try again.", H.style.display = "block", Y.disabled = !1, Y.textContent = "Retry", F.focus();
          return;
        }
        const ee = document.createElement("div");
        ee.className = "klavity-thanks", ee.textContent = "Thanks — we'll be in touch.", xe(H), B.replaceWith(ee), M.showCta || U();
      };
      Y.addEventListener("click", G), F.addEventListener("keydown", (Q) => {
        Q.key === "Enter" && G();
      }), B.append(F, Y), T.appendChild(B), T.appendChild(H);
    }
    if (M.showCta && M.ctaUrl) {
      const B = document.createElement("a");
      B.className = "klavity-cta", B.href = M.ctaUrl, B.target = "_blank", B.rel = "noopener", B.textContent = M.ctaText, T.appendChild(B);
    }
    if ($.appendChild(T), !n.whiteLabel) {
      const B = document.createElement("div");
      B.className = "klavity-pb";
      const F = document.createElement("a");
      F.href = xp("https://klavity.in", {
        campaign: "powered_by",
        medium: n.attributionMedium,
        ref: n.projectId
      }), F.target = "_blank", F.rel = "noopener", F.textContent = "Klavity", B.append("Powered by ", F), $.appendChild(B);
    }
    !M.showEmail && !M.showCta && U();
  }
  if (t.autoCaptureOnOpen) {
    let w = 0;
    try {
      w = document.getElementsByTagName("*").length;
    } catch {
      w = 0;
    }
    if (w <= f) {
      a = !0, Ee();
      const E = () => {
        if (t.onCaptureViewport) {
          Yc(null).catch(() => {
            a = !1, Ee();
          });
          return;
        }
        t.onCaptureFull().then((M) => {
          const { dataUrl: O, quality: T, suggestSharp: D } = kt(M);
          a = !1, ut(O, T, void 0, !0, !!D), pt(Zt);
        }).catch(() => {
          a = !1, Ee();
        });
      }, A = window.requestIdleCallback;
      typeof A == "function" ? A(() => E(), { timeout: 1200 }) : requestAnimationFrame(() => setTimeout(E, 0));
    }
  }
  return ue;
}
function Ip(e, t) {
  const r = document.createElement("div");
  r.style.cssText = "position:fixed;inset:0;cursor:crosshair;z-index:2147483646;user-select:none;", r.setAttribute("data-klavity-region-overlay", ""), document.body.appendChild(r);
  const n = document.createElement("div");
  n.textContent = "Drag to select an area · Esc to cancel", n.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-family:system-ui;font-size:14px;background:rgba(0,0,0,.7);padding:8px 16px;border-radius:6px;pointer-events:none;z-index:2147483647;", document.body.appendChild(n);
  let i = 0, o = 0, l = !1;
  function c() {
    document.removeEventListener("keydown", a, { capture: !0 }), xe(r), xe(n);
  }
  function a(p) {
    p.key === "Escape" && (p.stopPropagation(), c(), t());
  }
  document.addEventListener("keydown", a, { capture: !0 }), r.addEventListener("pointerdown", (p) => {
    l = !0, i = p.clientX, o = p.clientY, xe(n);
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
async function go(e) {
  if (e.type === "image/heic" || e.type === "image/heif" || e.name.endsWith(".heic") || e.name.endsWith(".heif"))
    try {
      const t = (await import("./heic2any-D6xzzX7R.js").then((n) => n.h)).default, r = await t({ blob: e, toType: "image/jpeg", quality: 0.85 });
      return yo(r);
    } catch {
    }
  return yo(e);
}
function yo(e) {
  return new Promise((t, r) => {
    const n = new FileReader();
    n.onload = () => t(n.result), n.onerror = r, n.readAsDataURL(e);
  });
}
const Lp = {
  frustrated: { accent: "#e8849a", mark: "vein", label: "Frustrated" },
  confused: { accent: "#e8a24a", mark: "q", label: "Confused" },
  satisfied: { accent: "#7fd1c4", mark: "check", label: "Satisfied" },
  delighted: { accent: "#9fd6a0", mark: "spark", label: "Delighted" },
  neutral: { accent: "#8a8276", mark: "dots", label: "Neutral" },
  inspired: { accent: "#8b8bf5", mark: "bulb", label: "Inspired" },
  alarmed: { accent: "#ef6b6b", mark: "bang", label: "Alarmed" }
};
function Op(e) {
  const t = (e || "").trim().split(/\s+/).filter(Boolean);
  return t.length === 0 ? "?" : t.length === 1 ? t[0].slice(0, 2).toUpperCase() : (t[0][0] + t[t.length - 1][0]).toUpperCase();
}
function Tp(e) {
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
const Np = {
  vein: "ksim-m-vein",
  spark: "ksim-m-spark",
  bulb: "ksim-m-bulb",
  bang: "ksim-m-bang",
  q: "ksim-m-q",
  dots: "ksim-m-dots",
  check: "ksim-m-check"
};
function Ut(e) {
  return String(e).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function _p(e) {
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
  } = e, s = Ut(e.initials || Op(t)), h = i !== "none" ? Lp[i] : null, d = h ? `<span class="ksim-mark ${a ? Np[h.mark] : ""}" style="color:${Ut(h.accent)}">${Tp(h.mark)}</span>` : "", m = r ? `<span class="ksim-head ksim-photo"><img src="${Ut(r)}" alt="${Ut(t)}" loading="lazy" onerror="this.style.display='none';this.parentNode.classList.add('ksim-fallback')"><span class="ksim-ini">${s}</span></span>` : `<span class="ksim-head ksim-mono"><span class="ksim-ini">${s}</span>${l ? '<span class="ksim-eyes"><i></i><i></i></span>' : ""}</span>`, f = c ? '<span class="ksim-legs"><i></i><i></i></span>' : "", g = ["ksim", a ? "is-animated" : "", p].filter(Boolean).join(" "), x = `--ksim-persona:${Ut(n)};--ksim-size:${o}px;` + (h ? `--ksim-accent:${Ut(h.accent)};` : "");
  return `<span class="${g}" style="${x}" data-emotion="${i}" title="${Ut(t)}">${d}${m}${f}</span>`;
}
function Pp(e) {
  const t = document.createElement("template");
  return t.innerHTML = _p(e).trim(), t.content.firstElementChild;
}
const $p = `
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
function Dp(e = document) {
  var n;
  const t = e.head ?? e ?? null;
  if (!t || (n = t.querySelector) != null && n.call(t, "style[data-ksim]")) return;
  const r = document.createElement("style");
  r.setAttribute("data-ksim", ""), r.textContent = $p, t.appendChild(r);
}
function zp(e) {
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
async function Fp(e) {
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
        description: { version: 1, type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: zp(e) }] }] },
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
async function Up(e) {
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
async function Bp(e) {
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
async function qp(e) {
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
function Wp(e) {
  const t = new FormData();
  return t.set("type", e.type ?? "bug"), t.set("description", e.description), t.set("page_url", e.pageUrl), e.context && t.set("context", JSON.stringify(e.context)), e.projectId && t.set("project_id", e.projectId), e.replayEvents && e.replayEvents.length && t.set("replay_events", JSON.stringify(e.replayEvents)), t;
}
async function jp(e) {
  const { settings: t, type: r, description: n, context: i, screenshots: o, projectId: l, replayEvents: c } = e, a = Wp({ type: r, description: n, pageUrl: i.pageUrl, context: i, projectId: l, replayEvents: c }), p = t.connectionMode === "klavity" && !!t.klavToken;
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
var Hp = Object.defineProperty, Vp = (e, t, r) => t in e ? Hp(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, z = (e, t, r) => Vp(e, typeof t != "symbol" ? t + "" : t, r), bo, Yp = Object.defineProperty, Gp = (e, t, r) => t in e ? Yp(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, vo = (e, t, r) => Gp(e, typeof t != "symbol" ? t + "" : t, r), Re = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(Re || {});
const ko = {
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
}, wo = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, Hr = {}, El = {}, Xp = () => !!globalThis.Zone;
function us(e) {
  if (Hr[e])
    return Hr[e];
  const t = globalThis[e], r = t.prototype, n = e in ko ? ko[e] : void 0, i = !!(n && // @ts-expect-error 2345
  n.every(
    (c) => {
      var a, p;
      return !!((p = (a = Object.getOwnPropertyDescriptor(r, c)) == null ? void 0 : a.get) != null && p.toString().includes("[native code]"));
    }
  )), o = e in wo ? wo[e] : void 0, l = !!(o && o.every(
    // @ts-expect-error 2345
    (c) => {
      var a;
      return typeof r[c] == "function" && ((a = r[c]) == null ? void 0 : a.toString().includes("[native code]"));
    }
  ));
  if (i && l && !Xp())
    return Hr[e] = t.prototype, t.prototype;
  try {
    const c = document.createElement("iframe");
    c.style.display = "none", document.body.appendChild(c);
    const a = c.contentWindow;
    if (!a) return t.prototype;
    const p = a[e].prototype;
    if (!p)
      return c.remove(), r;
    const s = navigator.userAgent;
    return s.includes("Safari") && !s.includes("Chrome") ? (c.classList.add("rr-block"), c.setAttribute("__rrwebUntaintedMutationObserver", ""), El[e] = () => c.remove()) : c.remove(), Hr[e] = p;
  } catch {
    return r;
  }
}
const jn = {};
function xt(e, t, r) {
  var n;
  const i = `${e}.${String(r)}`;
  if (jn[i])
    return jn[i].call(
      t
    );
  const o = us(e), l = (n = Object.getOwnPropertyDescriptor(
    o,
    r
  )) == null ? void 0 : n.get;
  return l ? (jn[i] = l, l.call(t)) : t[r];
}
const Hn = {};
function Ml(e, t, r) {
  const n = `${e}.${String(r)}`;
  if (Hn[n])
    return Hn[n].bind(
      t
    );
  const o = us(e)[r];
  return typeof o != "function" ? t[r] : (Hn[n] = o, o.bind(t));
}
function Kp(e) {
  return xt("Node", e, "ownerDocument");
}
function Jp(e) {
  return xt("Node", e, "childNodes");
}
function Zp(e) {
  return xt("Node", e, "parentNode");
}
function Qp(e) {
  return xt("Node", e, "parentElement");
}
function eh(e) {
  return xt("Node", e, "textContent");
}
function th(e, t) {
  return Ml("Node", e, "contains")(t);
}
function rh(e) {
  return Ml("Node", e, "getRootNode")();
}
function nh(e) {
  return !e || !("host" in e) ? null : xt("ShadowRoot", e, "host");
}
function ih(e) {
  return e.styleSheets;
}
function sh(e) {
  return !e || !("shadowRoot" in e) ? null : xt("Element", e, "shadowRoot");
}
function oh(e, t) {
  return xt("Element", e, "querySelector")(t);
}
function ah(e, t) {
  return xt("Element", e, "querySelectorAll")(t);
}
function lh() {
  return [
    us("MutationObserver").constructor,
    El.MutationObserver ?? (() => {
    })
  ];
}
let Rl = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (Rl = () => (/* @__PURE__ */ new Date()).getTime());
function ch(e, t, r) {
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
const Pe = {
  ownerDocument: Kp,
  childNodes: Jp,
  parentNode: Zp,
  parentElement: Qp,
  textContent: eh,
  contains: th,
  getRootNode: rh,
  host: nh,
  styleSheets: ih,
  shadowRoot: sh,
  querySelector: oh,
  querySelectorAll: ah,
  nowTimestamp: Rl,
  mutationObserverCtor: lh,
  patch: ch
};
function Al(e) {
  return e.nodeType === e.ELEMENT_NODE;
}
function Cr(e) {
  const t = (
    // anchor and textarea elements also have a `host` property
    // but only shadow roots have a `mode` property
    e && "host" in e && "mode" in e && Pe.host(e) || null
  );
  return !!(t && "shadowRoot" in t && Pe.shadowRoot(t) === e);
}
function Er(e) {
  return Object.prototype.toString.call(e) === "[object ShadowRoot]";
}
function uh(e) {
  return e.includes(" background-clip: text;") && !e.includes(" -webkit-background-clip: text;") && (e = e.replace(
    /\sbackground-clip:\s*text;/g,
    " -webkit-background-clip: text; background-clip: text;"
  )), e;
}
function dh(e) {
  const { cssText: t } = e;
  if (t.split('"').length < 3) return t;
  const r = ["@import", `url(${JSON.stringify(e.href)})`];
  return e.layerName === "" ? r.push("layer") : e.layerName && r.push(`layer(${e.layerName})`), e.supportsText && r.push(`supports(${e.supportsText})`), e.media.length && r.push(e.media.mediaText), r.join(" ") + ";";
}
function Qi(e) {
  try {
    const t = e.rules || e.cssRules;
    if (!t)
      return null;
    let r = e.href;
    !r && e.ownerNode && (r = e.ownerNode.baseURI);
    const n = Array.from(
      t,
      (i) => Il(i, r)
    ).join("");
    return uh(n);
  } catch {
    return null;
  }
}
function Il(e, t) {
  if (hh(e)) {
    let r;
    try {
      r = // for same-origin stylesheets,
      // we can access the imported stylesheet rules directly
      Qi(e.styleSheet) || // work around browser issues with the raw string `@import url(...)` statement
      dh(e);
    } catch {
      r = e.cssText;
    }
    return e.styleSheet.href ? ln(r, e.styleSheet.href) : r;
  } else {
    let r = e.cssText;
    return fh(e) && e.selectorText.includes(":") && (r = ph(r)), t ? ln(r, t) : r;
  }
}
function ph(e) {
  const t = /(\[(?:[\w-]+)[^\\])(:(?:[\w-]+)\])/gm;
  return e.replace(t, "$1\\$2");
}
function hh(e) {
  return "styleSheet" in e;
}
function fh(e) {
  return "selectorText" in e;
}
class Ll {
  constructor() {
    vo(this, "idNodeMap", /* @__PURE__ */ new Map()), vo(this, "nodeMetaMap", /* @__PURE__ */ new WeakMap());
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
function mh() {
  return new Ll();
}
function on({
  element: e,
  maskInputOptions: t,
  tagName: r,
  type: n,
  value: i,
  maskInputFn: o
}) {
  let l = i || "";
  const c = n && Yt(n);
  return (t[r.toLowerCase()] || c && t[c]) && (o ? l = o(l, e) : l = "*".repeat(l.length)), l;
}
function Yt(e) {
  return e.toLowerCase();
}
const xo = "__rrweb_original__";
function gh(e) {
  const t = e.getContext("2d");
  if (!t) return !0;
  const r = 50;
  for (let n = 0; n < e.width; n += r)
    for (let i = 0; i < e.height; i += r) {
      const o = t.getImageData, l = xo in o ? o[xo] : o;
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
function an(e) {
  const t = e.type;
  return e.hasAttribute("data-rr-is-password") ? "password" : t ? (
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    Yt(t)
  ) : null;
}
function Ol(e, t) {
  let r;
  try {
    r = new URL(e, t ?? window.location.href);
  } catch {
    return null;
  }
  const n = /\.([0-9a-z]+)(?:$)/i, i = r.pathname.match(n);
  return (i == null ? void 0 : i[1]) ?? null;
}
function yh(e) {
  let t = "";
  return e.indexOf("//") > -1 ? t = e.split("/").slice(0, 3).join("/") : t = e.split("/")[0], t = t.split("?")[0], t;
}
const bh = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm, vh = /^(?:[a-z+]+:)?\/\//i, kh = /^www\..*/i, wh = /^(data:)([^,]*),(.*)/i;
function ln(e, t) {
  return (e || "").replace(
    bh,
    (r, n, i, o, l, c) => {
      const a = i || l || c, p = n || o || "";
      if (!a)
        return r;
      if (vh.test(a) || kh.test(a))
        return `url(${p}${a}${p})`;
      if (wh.test(a))
        return `url(${p}${a}${p})`;
      if (a[0] === "/")
        return `url(${p}${yh(t) + a}${p})`;
      const s = t.split("/"), h = a.split("/");
      s.pop();
      for (const d of h)
        d !== "." && (d === ".." ? s.pop() : s.push(d));
      return `url(${p}${s.join("/")}${p})`;
    }
  );
}
function Vr(e, t = !1) {
  return t ? e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "") : e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "").replace(/0px/g, "0");
}
function xh(e, t, r = !1) {
  const n = Array.from(t.childNodes), i = [];
  let o = 0;
  if (n.length > 1 && e && typeof e == "string") {
    let l = Vr(e, r);
    const c = l.length / e.length;
    for (let a = 1; a < n.length; a++)
      if (n[a].textContent && typeof n[a].textContent == "string") {
        const p = Vr(
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
              const g = Vr(f).length;
              m = l.indexOf(d, g);
            }
            m === -1 && (m = u[0].length);
          }
          if (m !== -1) {
            let f = Math.floor(m / c);
            for (; f > 0 && f < e.length; ) {
              if (o += 1, o > 50 * n.length)
                return i.push(e), i;
              const g = Vr(
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
function Sh(e, t) {
  return xh(e, t).join("/* rr_split */");
}
let Ch = 1;
const Eh = new RegExp("[^a-z0-9-_:]"), Lr = -2;
function Tl() {
  return Ch++;
}
function Mh(e) {
  if (e instanceof HTMLFormElement)
    return "form";
  const t = Yt(e.tagName);
  return Eh.test(t) ? "div" : t;
}
let rr, So;
const Rh = /^[^ \t\n\r\u000c]+/, Ah = /^[, \t\n\r\u000c]+/;
function Ih(e, t) {
  if (t.trim() === "")
    return t;
  let r = 0;
  function n(o) {
    let l;
    const c = o.exec(t.substring(r));
    return c ? (l = c[0], r += l.length, l) : "";
  }
  const i = [];
  for (; n(Ah), !(r >= t.length); ) {
    let o = n(Rh);
    if (o.slice(-1) === ",")
      o = or(e, o.substring(0, o.length - 1)), i.push(o);
    else {
      let l = "";
      o = or(e, o);
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
const Co = /* @__PURE__ */ new WeakMap();
function or(e, t) {
  return !t || t.trim() === "" ? t : ds(e, t);
}
function Lh(e) {
  return !!(e.tagName === "svg" || e.ownerSVGElement);
}
function ds(e, t) {
  let r = Co.get(e);
  if (r || (r = e.createElement("a"), Co.set(e, r)), !t)
    t = "";
  else if (t.startsWith("blob:") || t.startsWith("data:"))
    return t;
  return r.setAttribute("href", t), r.href;
}
function Nl(e, t, r, n) {
  return n && (r === "src" || r === "href" && !(t === "use" && n[0] === "#") || r === "xlink:href" && n[0] !== "#" || r === "background" && ["table", "td", "th"].includes(t) ? or(e, n) : r === "srcset" ? Ih(e, n) : r === "style" ? ln(n, ds(e)) : t === "object" && r === "data" ? or(e, n) : n);
}
function _l(e, t, r) {
  return ["video", "audio"].includes(e) && t === "autoplay";
}
function Oh(e, t, r) {
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
function cn(e, t, r) {
  if (!e) return !1;
  if (e.nodeType !== e.ELEMENT_NODE)
    return r ? cn(Pe.parentNode(e), t, r) : !1;
  for (let n = e.classList.length; n--; ) {
    const i = e.classList[n];
    if (t.test(i))
      return !0;
  }
  return r ? cn(Pe.parentNode(e), t, r) : !1;
}
function Pl(e, t, r, n) {
  let i;
  if (Al(e)) {
    if (i = e, !Pe.childNodes(i).length)
      return !1;
  } else {
    if (Pe.parentElement(e) === null)
      return !1;
    i = Pe.parentElement(e);
  }
  try {
    if (typeof t == "string") {
      if (n) {
        if (i.closest(`.${t}`)) return !0;
      } else if (i.classList.contains(t)) return !0;
    } else if (cn(i, t, n)) return !0;
    if (r) {
      if (n) {
        if (i.closest(r)) return !0;
      } else if (i.matches(r)) return !0;
    }
  } catch {
  }
  return !1;
}
function Th(e, t, r) {
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
function Nh(e, t, r) {
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
function _h(e, t) {
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
  } = t, x = Ph(r, n);
  switch (e.nodeType) {
    case e.DOCUMENT_NODE:
      return e.compatMode !== "CSS1Compat" ? {
        type: Re.Document,
        childNodes: [],
        compatMode: e.compatMode
        // probably "BackCompat"
      } : {
        type: Re.Document,
        childNodes: []
      };
    case e.DOCUMENT_TYPE_NODE:
      return {
        type: Re.DocumentType,
        name: e.name,
        publicId: e.publicId,
        systemId: e.systemId,
        rootId: x
      };
    case e.ELEMENT_NODE:
      return Dh(e, {
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
      return $h(e, {
        doc: r,
        needsMask: l,
        maskTextFn: p,
        rootId: x,
        cssCaptured: g
      });
    case e.CDATA_SECTION_NODE:
      return {
        type: Re.CDATA,
        textContent: "",
        rootId: x
      };
    case e.COMMENT_NODE:
      return {
        type: Re.Comment,
        textContent: Pe.textContent(e) || "",
        rootId: x
      };
    default:
      return !1;
  }
}
function Ph(e, t) {
  if (!t.hasNode(e)) return;
  const r = t.getId(e);
  return r === 1 ? void 0 : r;
}
function $h(e, t) {
  const { needsMask: r, maskTextFn: n, rootId: i, cssCaptured: o } = t, l = Pe.parentNode(e), c = l && l.tagName;
  let a = "";
  const p = c === "STYLE" ? !0 : void 0, s = c === "SCRIPT" ? !0 : void 0;
  return s ? a = "SCRIPT_PLACEHOLDER" : o || (a = Pe.textContent(e), p && a && (a = ln(a, ds(t.doc)))), !p && !s && a && r && (a = n ? n(a, Pe.parentElement(e)) : a.replace(/[\S]/g, "*")), {
    type: Re.Text,
    textContent: a || "",
    rootId: i
  };
}
function Dh(e, t) {
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
  } = t, m = Oh(e, n, i), f = Mh(e);
  let g = {};
  const x = e.attributes.length;
  for (let y = 0; y < x; y++) {
    const S = e.attributes[y];
    _l(f, S.name, S.value) || (g[S.name] = Nl(
      r,
      f,
      Yt(S.name),
      S.value
    ));
  }
  if (f === "link" && o) {
    const y = Array.from(r.styleSheets).find((v) => v.href === e.href);
    let S = null;
    y && (S = Qi(y)), S && (delete g.rel, delete g.href, g._cssText = S);
  }
  if (f === "style" && e.sheet) {
    let y = Qi(
      e.sheet
    );
    y && (e.childNodes.length > 1 && (y = Sh(y, e)), g._cssText = y);
  }
  if (["input", "textarea", "select"].includes(f)) {
    const y = e.value, S = e.checked;
    g.type !== "radio" && g.type !== "checkbox" && g.type !== "submit" && g.type !== "button" && y ? g.value = on({
      element: e,
      type: an(e),
      tagName: f,
      value: y,
      maskInputOptions: l,
      maskInputFn: c
    }) : S && (g.checked = S);
  }
  if (f === "option" && (e.selected && !l.select ? g.selected = !0 : delete g.selected), f === "dialog" && e.open && (g.rr_open_mode = e.matches("dialog:modal") ? "modal" : "non-modal"), f === "canvas" && s) {
    if (e.__context === "2d")
      gh(e) || (g.rr_dataURL = e.toDataURL(
        a.type,
        a.quality
      ));
    else if (!("__context" in e)) {
      const y = e.toDataURL(
        a.type,
        a.quality
      ), S = r.createElement("canvas");
      S.width = e.width, S.height = e.height;
      const v = S.toDataURL(
        a.type,
        a.quality
      );
      y !== v && (g.rr_dataURL = y);
    }
  }
  if (f === "img" && p) {
    rr || (rr = r.createElement("canvas"), So = rr.getContext("2d"));
    const y = e, S = y.currentSrc || y.getAttribute("src") || "<unknown-src>", v = y.crossOrigin, k = () => {
      y.removeEventListener("load", k);
      try {
        rr.width = y.naturalWidth, rr.height = y.naturalHeight, So.drawImage(y, 0, 0), g.rr_dataURL = rr.toDataURL(
          a.type,
          a.quality
        );
      } catch (C) {
        if (y.crossOrigin !== "anonymous") {
          y.crossOrigin = "anonymous", y.complete && y.naturalWidth !== 0 ? k() : y.addEventListener("load", k);
          return;
        } else
          console.warn(
            `Cannot inline img src=${S}! Error: ${C}`
          );
      }
      y.crossOrigin === "anonymous" && (v ? g.crossOrigin = v : y.removeAttribute("crossorigin"));
    };
    y.complete && y.naturalWidth !== 0 ? k() : y.addEventListener("load", k);
  }
  if (["audio", "video"].includes(f)) {
    const y = g;
    y.rr_mediaState = e.paused ? "paused" : "played", y.rr_mediaCurrentTime = e.currentTime, y.rr_mediaPlaybackRate = e.playbackRate, y.rr_mediaMuted = e.muted, y.rr_mediaLoop = e.loop, y.rr_mediaVolume = e.volume;
  }
  if (d || (e.scrollLeft && (g.rr_scrollLeft = e.scrollLeft), e.scrollTop && (g.rr_scrollTop = e.scrollTop)), m) {
    const { width: y, height: S } = e.getBoundingClientRect();
    g = {
      class: g.class,
      rr_width: `${y}px`,
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
    type: Re.Element,
    tagName: f,
    attributes: g,
    childNodes: [],
    isSVG: Lh(e) || void 0,
    needBlock: m,
    rootId: u,
    isCustom: b
  };
}
function pe(e) {
  return e == null ? "" : e.toLowerCase();
}
function $l(e) {
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
function zh(e, t) {
  if (t.comment && e.type === Re.Comment)
    return !0;
  if (e.type === Re.Element) {
    if (t.script && // script tag
    (e.tagName === "script" || // (module)preload link
    e.tagName === "link" && (e.attributes.rel === "preload" && e.attributes.as === "script" || e.attributes.rel === "modulepreload") || // prefetch link
    e.tagName === "link" && e.attributes.rel === "prefetch" && typeof e.attributes.href == "string" && Ol(e.attributes.href) === "js"))
      return !0;
    if (t.headFavicon && (e.tagName === "link" && e.attributes.rel === "shortcut icon" || e.tagName === "meta" && (pe(e.attributes.name).match(
      /^msapplication-tile(image|color)$/
    ) || pe(e.attributes.name) === "application-name" || pe(e.attributes.rel) === "icon" || pe(e.attributes.rel) === "apple-touch-icon" || pe(e.attributes.rel) === "shortcut icon")))
      return !0;
    if (e.tagName === "meta") {
      if (t.headMetaDescKeywords && pe(e.attributes.name).match(/^description|keywords$/))
        return !0;
      if (t.headMetaSocial && (pe(e.attributes.property).match(/^(og|twitter|fb):/) || // og = opengraph (facebook)
      pe(e.attributes.name).match(/^(og|twitter):/) || pe(e.attributes.name) === "pinterest"))
        return !0;
      if (t.headMetaRobots && (pe(e.attributes.name) === "robots" || pe(e.attributes.name) === "googlebot" || pe(e.attributes.name) === "bingbot"))
        return !0;
      if (t.headMetaHttpEquiv && e.attributes["http-equiv"] !== void 0)
        return !0;
      if (t.headMetaAuthorship && (pe(e.attributes.name) === "author" || pe(e.attributes.name) === "generator" || pe(e.attributes.name) === "framework" || pe(e.attributes.name) === "publisher" || pe(e.attributes.name) === "progid" || pe(e.attributes.property).match(/^article:/) || pe(e.attributes.property).match(/^product:/)))
        return !0;
      if (t.headMetaVerification && (pe(e.attributes.name) === "google-site-verification" || pe(e.attributes.name) === "yandex-verification" || pe(e.attributes.name) === "csrf-token" || pe(e.attributes.name) === "p:domain_verify" || pe(e.attributes.name) === "verify-v1" || pe(e.attributes.name) === "verification" || pe(e.attributes.name) === "shopify-checkout-api-token"))
        return !0;
    }
  }
  return !1;
}
function ar(e, t) {
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
    onStylesheetLoad: S,
    stylesheetLoadTimeout: v = 5e3,
    keepIframeSrcFn: k = () => !1,
    newlyAddedElement: C = !1,
    cssCaptured: L = !1
  } = t;
  let { needsMask: N } = t, { preserveWhiteSpace: I = !0 } = t;
  N || (N = Pl(
    e,
    l,
    c,
    N === void 0
  ));
  const V = _h(e, {
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
    newlyAddedElement: C,
    cssCaptured: L
  });
  if (!V)
    return console.warn(e, "not serialized"), null;
  let W;
  n.hasNode(e) ? W = n.getId(e) : zh(V, u) || !I && V.type === Re.Text && !V.textContent.replace(/^\s+|\s+$/gm, "").length ? W = Lr : W = Tl();
  const R = Object.assign(V, { id: W });
  if (n.add(e, R), W === Lr)
    return null;
  x && x(e);
  let he = !a;
  if (R.type === Re.Element) {
    he = he && !R.needBlock, delete R.needBlock;
    const ce = Pe.shadowRoot(e);
    ce && Er(ce) && (R.isShadowHost = !0);
  }
  if ((R.type === Re.Document || R.type === Re.Element) && he) {
    u.headWhitespace && R.type === Re.Element && R.tagName === "head" && (I = !1);
    const ce = {
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
      preserveWhiteSpace: I,
      onSerialize: x,
      onIframeLoad: b,
      iframeLoadTimeout: y,
      onStylesheetLoad: S,
      stylesheetLoadTimeout: v,
      keepIframeSrcFn: k,
      cssCaptured: !1
    };
    if (!(R.type === Re.Element && R.tagName === "textarea" && R.attributes.value !== void 0)) {
      R.type === Re.Element && R.attributes._cssText !== void 0 && typeof R.attributes._cssText == "string" && (ce.cssCaptured = !0);
      for (const de of Array.from(Pe.childNodes(e))) {
        const Ae = ar(de, ce);
        Ae && R.childNodes.push(Ae);
      }
    }
    let te = null;
    if (Al(e) && (te = Pe.shadowRoot(e)))
      for (const de of Array.from(Pe.childNodes(te))) {
        const Ae = ar(de, ce);
        Ae && (Er(te) && (Ae.isShadow = !0), R.childNodes.push(Ae));
      }
  }
  const Ce = Pe.parentNode(e);
  return Ce && Cr(Ce) && Er(Ce) && (R.isShadow = !0), R.type === Re.Element && R.tagName === "iframe" && Th(
    e,
    () => {
      const ce = e.contentDocument;
      if (ce && b) {
        const te = ar(ce, {
          doc: ce,
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
          preserveWhiteSpace: I,
          onSerialize: x,
          onIframeLoad: b,
          iframeLoadTimeout: y,
          onStylesheetLoad: S,
          stylesheetLoadTimeout: v,
          keepIframeSrcFn: k
        });
        te && b(
          e,
          te
        );
      }
    },
    y
  ), R.type === Re.Element && R.tagName === "link" && typeof R.attributes.rel == "string" && (R.attributes.rel === "stylesheet" || R.attributes.rel === "preload" && typeof R.attributes.href == "string" && Ol(R.attributes.href) === "css") && Nh(
    e,
    () => {
      if (S) {
        const ce = ar(e, {
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
          preserveWhiteSpace: I,
          onSerialize: x,
          onIframeLoad: b,
          iframeLoadTimeout: y,
          onStylesheetLoad: S,
          stylesheetLoadTimeout: v,
          keepIframeSrcFn: k
        });
        ce && S(
          e,
          ce
        );
      }
    },
    v
  ), R;
}
function Fh(e, t) {
  const {
    mirror: r = new Ll(),
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
    stylesheetLoadTimeout: S,
    keepIframeSrcFn: v = () => !1
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
  } : s, C = $l(u);
  return ar(e, {
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
    slimDOMOptions: C,
    dataURLOptions: m,
    inlineImages: a,
    recordCanvas: p,
    preserveWhiteSpace: f,
    onSerialize: g,
    onIframeLoad: x,
    iframeLoadTimeout: b,
    onStylesheetLoad: y,
    stylesheetLoadTimeout: S,
    keepIframeSrcFn: v,
    newlyAddedElement: !1
  });
}
function Uh(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function Bh(e) {
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
var Yr = { exports: {} }, Eo;
function qh() {
  if (Eo) return Yr.exports;
  Eo = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return Yr.exports = t(), Yr.exports.createColors = t, Yr.exports;
}
const Wh = {}, jh = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Wh
}, Symbol.toStringTag, { value: "Module" })), at = /* @__PURE__ */ Bh(jh);
var Vn, Mo;
function ps() {
  if (Mo) return Vn;
  Mo = 1;
  let e = /* @__PURE__ */ qh(), t = at;
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
  return Vn = r, r.default = r, Vn;
}
var Gr = {}, Ro;
function hs() {
  return Ro || (Ro = 1, Gr.isClean = Symbol("isClean"), Gr.my = Symbol("my")), Gr;
}
var Yn, Ao;
function Dl() {
  if (Ao) return Yn;
  Ao = 1;
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
  return Yn = r, r.default = r, Yn;
}
var Gn, Io;
function vn() {
  if (Io) return Gn;
  Io = 1;
  let e = Dl();
  function t(r, n) {
    new e(n).stringify(r);
  }
  return Gn = t, t.default = t, Gn;
}
var Xn, Lo;
function kn() {
  if (Lo) return Xn;
  Lo = 1;
  let { isClean: e, my: t } = hs(), r = ps(), n = Dl(), i = vn();
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
  return Xn = l, l.default = l, Xn;
}
var Kn, Oo;
function wn() {
  if (Oo) return Kn;
  Oo = 1;
  let e = kn();
  class t extends e {
    constructor(n) {
      n && typeof n.value < "u" && typeof n.value != "string" && (n = { ...n, value: String(n.value) }), super(n), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return Kn = t, t.default = t, Kn;
}
var Jn, To;
function Hh() {
  if (To) return Jn;
  To = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return Jn = { nanoid: (n = 21) => {
    let i = "", o = n;
    for (; o--; )
      i += e[Math.random() * 64 | 0];
    return i;
  }, customAlphabet: (n, i = 21) => (o = i) => {
    let l = "", c = o;
    for (; c--; )
      l += n[Math.random() * n.length | 0];
    return l;
  } }, Jn;
}
var Zn, No;
function zl() {
  if (No) return Zn;
  No = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = at, { existsSync: r, readFileSync: n } = at, { dirname: i, join: o } = at;
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
  return Zn = c, c.default = c, Zn;
}
var Qn, _o;
function xn() {
  if (_o) return Qn;
  _o = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = at, { fileURLToPath: r, pathToFileURL: n } = at, { isAbsolute: i, resolve: o } = at, { nanoid: l } = /* @__PURE__ */ Hh(), c = at, a = ps(), p = zl(), s = Symbol("fromOffsetCache"), h = !!(e && t), d = !!(o && i);
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
      let y, S, v;
      if (g && typeof g == "object") {
        let C = g, L = x;
        if (typeof C.offset == "number") {
          let N = this.fromOffset(C.offset);
          g = N.line, x = N.col;
        } else
          g = C.line, x = C.column;
        if (typeof L.offset == "number") {
          let N = this.fromOffset(L.offset);
          S = N.line, v = N.col;
        } else
          S = L.line, v = L.column;
      } else if (!x) {
        let C = this.fromOffset(g);
        g = C.line, x = C.col;
      }
      let k = this.origin(g, x, S, v);
      return k ? y = new a(
        f,
        k.endLine === void 0 ? k.line : { column: k.column, line: k.line },
        k.endLine === void 0 ? k.column : { column: k.endColumn, line: k.endLine },
        k.source,
        k.file,
        b.plugin
      ) : y = new a(
        f,
        S === void 0 ? g : { column: x, line: g },
        S === void 0 ? x : { column: v, line: S },
        this.css,
        this.file,
        b.plugin
      ), y.input = { column: x, endColumn: v, endLine: S, line: g, source: this.css }, this.file && (n && (y.input.url = n(this.file).toString()), y.input.file = this.file), y;
    }
    fromOffset(f) {
      let g, x;
      if (this[s])
        x = this[s];
      else {
        let y = this.css.split(`
`);
        x = new Array(y.length);
        let S = 0;
        for (let v = 0, k = y.length; v < k; v++)
          x[v] = S, S += y[v].length + 1;
        this[s] = x;
      }
      g = x[x.length - 1];
      let b = 0;
      if (f >= g)
        b = x.length - 1;
      else {
        let y = x.length - 2, S;
        for (; b < y; )
          if (S = b + (y - b >> 1), f < x[S])
            y = S - 1;
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
      let y = this.map.consumer(), S = y.originalPositionFor({ column: g, line: f });
      if (!S.source) return !1;
      let v;
      typeof x == "number" && (v = y.originalPositionFor({ column: b, line: x }));
      let k;
      i(S.source) ? k = n(S.source) : k = new URL(
        S.source,
        this.map.consumer().sourceRoot || n(this.map.mapFile)
      );
      let C = {
        column: S.column,
        endColumn: v && v.column,
        endLine: v && v.line,
        line: S.line,
        url: k.toString()
      };
      if (k.protocol === "file:")
        if (r)
          C.file = r(k);
        else
          throw new Error("file: protocol is not available in this PostCSS build");
      let L = y.sourceContentFor(S.source);
      return L && (C.source = L), C;
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
  return Qn = u, u.default = u, c && c.registerInput && c.registerInput(u), Qn;
}
var ei, Po;
function Fl() {
  if (Po) return ei;
  Po = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = at, { dirname: r, relative: n, resolve: i, sep: o } = at, { pathToFileURL: l } = at, c = xn(), a = !!(e && t), p = !!(r && i && n && o);
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
      this.stringify(this.root, (b, y, S) => {
        if (this.css += b, y && S !== "end" && (f.generated.line = d, f.generated.column = u - 1, y.source && y.source.start ? (f.source = this.sourcePath(y), f.original.line = y.source.start.line, f.original.column = y.source.start.column - 1, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, this.map.addMapping(f))), g = b.match(/\n/g), g ? (d += g.length, x = b.lastIndexOf(`
`), u = b.length - x) : u += b.length, y && S !== "start") {
          let v = y.parent || { raws: {} };
          (!(y.type === "decl" || y.type === "atrule" && !y.nodes) || y !== v.last || v.raws.semicolon) && (y.source && y.source.end ? (f.source = this.sourcePath(y), f.original.line = y.source.end.line, f.original.column = y.source.end.column - 1, f.generated.line = d, f.generated.column = u - 2, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, f.generated.line = d, f.generated.column = u - 1, this.map.addMapping(f)));
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
  return ei = s, ei;
}
var ti, $o;
function Sn() {
  if ($o) return ti;
  $o = 1;
  let e = kn();
  class t extends e {
    constructor(n) {
      super(n), this.type = "comment";
    }
  }
  return ti = t, t.default = t, ti;
}
var ri, Do;
function Gt() {
  if (Do) return ri;
  Do = 1;
  let { isClean: e, my: t } = hs(), r = wn(), n = Sn(), i = kn(), o, l, c, a;
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
  }, ri = h, h.default = h, h.rebuild = (d) => {
    d.type === "atrule" ? Object.setPrototypeOf(d, c.prototype) : d.type === "rule" ? Object.setPrototypeOf(d, l.prototype) : d.type === "decl" ? Object.setPrototypeOf(d, r.prototype) : d.type === "comment" ? Object.setPrototypeOf(d, n.prototype) : d.type === "root" && Object.setPrototypeOf(d, a.prototype), d[t] = !0, d.nodes && d.nodes.forEach((u) => {
      h.rebuild(u);
    });
  }, ri;
}
var ni, zo;
function fs() {
  if (zo) return ni;
  zo = 1;
  let e = Gt(), t, r;
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
  }, ni = n, n.default = n, ni;
}
var ii, Fo;
function Ul() {
  if (Fo) return ii;
  Fo = 1;
  let e = {};
  return ii = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, ii;
}
var si, Uo;
function Bl() {
  if (Uo) return si;
  Uo = 1;
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
  return si = e, e.default = e, si;
}
var oi, Bo;
function ms() {
  if (Bo) return oi;
  Bo = 1;
  let e = Bl();
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
  return oi = t, t.default = t, oi;
}
var ai, qo;
function Vh() {
  if (qo) return ai;
  qo = 1;
  const e = 39, t = 34, r = 92, n = 47, i = 10, o = 32, l = 12, c = 9, a = 13, p = 91, s = 93, h = 40, d = 41, u = 123, m = 125, f = 59, g = 42, x = 58, b = 64, y = /[\t\n\f\r "#'()/;[\\\]{}]/g, S = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, v = /.[\r\n"'(/\\]/, k = /[\da-f]/i;
  return ai = function(L, N = {}) {
    let I = L.css.valueOf(), V = N.ignoreErrors, W, R, he, Ce, ce, te, de, Ae, be, K, ve = I.length, _ = 0, je = [], Ie = [];
    function Ct() {
      return _;
    }
    function Le($) {
      throw L.error("Unclosed " + $, _);
    }
    function He() {
      return Ie.length === 0 && _ >= ve;
    }
    function ct($) {
      if (Ie.length) return Ie.pop();
      if (_ >= ve) return;
      let ye = $ ? $.ignoreUnclosed : !1;
      switch (W = I.charCodeAt(_), W) {
        case i:
        case o:
        case c:
        case a:
        case l: {
          R = _;
          do
            R += 1, W = I.charCodeAt(R);
          while (W === o || W === i || W === c || W === a || W === l);
          K = ["space", I.slice(_, R)], _ = R - 1;
          break;
        }
        case p:
        case s:
        case u:
        case m:
        case x:
        case f:
        case d: {
          let X = String.fromCharCode(W);
          K = [X, X, _];
          break;
        }
        case h: {
          if (Ae = je.length ? je.pop()[1] : "", be = I.charCodeAt(_ + 1), Ae === "url" && be !== e && be !== t && be !== o && be !== i && be !== c && be !== l && be !== a) {
            R = _;
            do {
              if (te = !1, R = I.indexOf(")", R + 1), R === -1)
                if (V || ye) {
                  R = _;
                  break;
                } else
                  Le("bracket");
              for (de = R; I.charCodeAt(de - 1) === r; )
                de -= 1, te = !te;
            } while (te);
            K = ["brackets", I.slice(_, R + 1), _, R], _ = R;
          } else
            R = I.indexOf(")", _ + 1), Ce = I.slice(_, R + 1), R === -1 || v.test(Ce) ? K = ["(", "(", _] : (K = ["brackets", Ce, _, R], _ = R);
          break;
        }
        case e:
        case t: {
          he = W === e ? "'" : '"', R = _;
          do {
            if (te = !1, R = I.indexOf(he, R + 1), R === -1)
              if (V || ye) {
                R = _ + 1;
                break;
              } else
                Le("string");
            for (de = R; I.charCodeAt(de - 1) === r; )
              de -= 1, te = !te;
          } while (te);
          K = ["string", I.slice(_, R + 1), _, R], _ = R;
          break;
        }
        case b: {
          y.lastIndex = _ + 1, y.test(I), y.lastIndex === 0 ? R = I.length - 1 : R = y.lastIndex - 2, K = ["at-word", I.slice(_, R + 1), _, R], _ = R;
          break;
        }
        case r: {
          for (R = _, ce = !0; I.charCodeAt(R + 1) === r; )
            R += 1, ce = !ce;
          if (W = I.charCodeAt(R + 1), ce && W !== n && W !== o && W !== i && W !== c && W !== a && W !== l && (R += 1, k.test(I.charAt(R)))) {
            for (; k.test(I.charAt(R + 1)); )
              R += 1;
            I.charCodeAt(R + 1) === o && (R += 1);
          }
          K = ["word", I.slice(_, R + 1), _, R], _ = R;
          break;
        }
        default: {
          W === n && I.charCodeAt(_ + 1) === g ? (R = I.indexOf("*/", _ + 2) + 1, R === 0 && (V || ye ? R = I.length : Le("comment")), K = ["comment", I.slice(_, R + 1), _, R], _ = R) : (S.lastIndex = _ + 1, S.test(I), S.lastIndex === 0 ? R = I.length - 1 : R = S.lastIndex - 2, K = ["word", I.slice(_, R + 1), _, R], je.push(K), _ = R);
          break;
        }
      }
      return _++, K;
    }
    function $e($) {
      Ie.push($);
    }
    return {
      back: $e,
      endOfFile: He,
      nextToken: ct,
      position: Ct
    };
  }, ai;
}
var li, Wo;
function gs() {
  if (Wo) return li;
  Wo = 1;
  let e = Gt();
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
  return li = t, t.default = t, e.registerAtRule(t), li;
}
var ci, jo;
function _r() {
  if (jo) return ci;
  jo = 1;
  let e = Gt(), t, r;
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
  }, ci = n, n.default = n, e.registerRoot(n), ci;
}
var ui, Ho;
function ql() {
  if (Ho) return ui;
  Ho = 1;
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
  return ui = e, e.default = e, ui;
}
var di, Vo;
function ys() {
  if (Vo) return di;
  Vo = 1;
  let e = Gt(), t = ql();
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
  return di = r, r.default = r, e.registerRule(r), di;
}
var pi, Yo;
function Yh() {
  if (Yo) return pi;
  Yo = 1;
  let e = wn(), t = Vh(), r = Sn(), n = gs(), i = _r(), o = ys();
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
          let y = s.slice(0), S = "";
          for (let v = b; v > 0; v--) {
            let k = y[v][0];
            if (S.trim().indexOf("!") === 0 && k !== "space")
              break;
            S = y.pop()[1] + S;
          }
          S.trim().indexOf("!") === 0 && (d.important = !0, d.raws.important = S, s = y);
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
      let m, f, g = d.length, x = "", b = !0, y, S;
      for (let v = 0; v < g; v += 1)
        m = d[v], f = m[0], f === "space" && v === g - 1 && !u ? b = !1 : f === "comment" ? (S = d[v - 1] ? d[v - 1][0] : "empty", y = d[v + 1] ? d[v + 1][0] : "empty", !l[S] && !l[y] ? x.slice(-1) === "," ? b = !1 : x += m[1] : b = !1) : x += m[1];
      if (!b) {
        let v = d.reduce((k, C) => k + C[1], "");
        s.raws[h] = { raw: v, value: x };
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
  return pi = a, pi;
}
var hi, Go;
function bs() {
  if (Go) return hi;
  Go = 1;
  let e = Gt(), t = Yh(), r = xn();
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
  return hi = n, n.default = n, e.registerParse(n), hi;
}
var fi, Xo;
function Wl() {
  if (Xo) return fi;
  Xo = 1;
  let { isClean: e, my: t } = hs(), r = Fl(), n = vn(), i = Gt(), o = fs(), l = Ul(), c = ms(), a = bs(), p = _r();
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
    let v = !1, k = s[S.type];
    return S.type === "decl" ? v = S.prop.toLowerCase() : S.type === "atrule" && (v = S.name.toLowerCase()), v && S.append ? [
      k,
      k + "-" + v,
      u,
      k + "Exit",
      k + "Exit-" + v
    ] : v ? [k, k + "-" + v, k + "Exit", k + "Exit-" + v] : S.append ? [k, u, k + "Exit"] : [k, k + "Exit"];
  }
  function g(S) {
    let v;
    return S.type === "document" ? v = ["Document", u, "DocumentExit"] : S.type === "root" ? v = ["Root", u, "RootExit"] : v = f(S), {
      eventIndex: 0,
      events: v,
      iterator: 0,
      node: S,
      visitorIndex: 0,
      visitors: []
    };
  }
  function x(S) {
    return S[e] = !1, S.nodes && S.nodes.forEach((v) => x(v)), S;
  }
  let b = {};
  class y {
    constructor(v, k, C) {
      this.stringified = !1, this.processed = !1;
      let L;
      if (typeof k == "object" && k !== null && (k.type === "root" || k.type === "document"))
        L = x(k);
      else if (k instanceof y || k instanceof c)
        L = x(k.root), k.map && (typeof C.map > "u" && (C.map = {}), C.map.inline || (C.map.inline = !1), C.map.prev = k.map);
      else {
        let N = a;
        C.syntax && (N = C.syntax.parse), C.parser && (N = C.parser), N.parse && (N = N.parse);
        try {
          L = N(k, C);
        } catch (I) {
          this.processed = !0, this.error = I;
        }
        L && !L[t] && i.rebuild(L);
      }
      this.result = new c(v, L, C), this.helpers = { ...b, postcss: b, result: this.result }, this.plugins = this.processor.plugins.map((N) => typeof N == "object" && N.prepare ? { ...N, ...N.prepare(this.result) } : N);
    }
    async() {
      return this.error ? Promise.reject(this.error) : this.processed ? Promise.resolve(this.result) : (this.processing || (this.processing = this.runAsync()), this.processing);
    }
    catch(v) {
      return this.async().catch(v);
    }
    finally(v) {
      return this.async().then(v, v);
    }
    getAsyncError() {
      throw new Error("Use process(css).then(cb) to work with async plugins");
    }
    handleError(v, k) {
      let C = this.result.lastPlugin;
      try {
        if (k && k.addToError(v), this.error = v, v.name === "CssSyntaxError" && !v.plugin)
          v.plugin = C.postcssPlugin, v.setMessage();
        else if (C.postcssVersion && process.env.NODE_ENV !== "production") {
          let L = C.postcssPlugin, N = C.postcssVersion, I = this.result.processor.version, V = N.split("."), W = I.split(".");
          (V[0] !== W[0] || parseInt(V[1]) > parseInt(W[1])) && console.error(
            "Unknown error from PostCSS plugin. Your current PostCSS version is " + I + ", but " + L + " uses " + N + ". Perhaps this is the source of the error below."
          );
        }
      } catch (L) {
        console && console.error && console.error(L);
      }
      return v;
    }
    prepareVisitors() {
      this.listeners = {};
      let v = (k, C, L) => {
        this.listeners[C] || (this.listeners[C] = []), this.listeners[C].push([k, L]);
      };
      for (let k of this.plugins)
        if (typeof k == "object")
          for (let C in k) {
            if (!h[C] && /^[A-Z]/.test(C))
              throw new Error(
                `Unknown event ${C} in ${k.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`
              );
            if (!d[C])
              if (typeof k[C] == "object")
                for (let L in k[C])
                  L === "*" ? v(k, C, k[C][L]) : v(
                    k,
                    C + "-" + L.toLowerCase(),
                    k[C][L]
                  );
              else typeof k[C] == "function" && v(k, C, k[C]);
          }
      this.hasListener = Object.keys(this.listeners).length > 0;
    }
    async runAsync() {
      this.plugin = 0;
      for (let v = 0; v < this.plugins.length; v++) {
        let k = this.plugins[v], C = this.runOnRoot(k);
        if (m(C))
          try {
            await C;
          } catch (L) {
            throw this.handleError(L);
          }
      }
      if (this.prepareVisitors(), this.hasListener) {
        let v = this.result.root;
        for (; !v[e]; ) {
          v[e] = !0;
          let k = [g(v)];
          for (; k.length > 0; ) {
            let C = this.visitTick(k);
            if (m(C))
              try {
                await C;
              } catch (L) {
                let N = k[k.length - 1].node;
                throw this.handleError(L, N);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [k, C] of this.listeners.OnceExit) {
            this.result.lastPlugin = k;
            try {
              if (v.type === "document") {
                let L = v.nodes.map(
                  (N) => C(N, this.helpers)
                );
                await Promise.all(L);
              } else
                await C(v, this.helpers);
            } catch (L) {
              throw this.handleError(L);
            }
          }
      }
      return this.processed = !0, this.stringify();
    }
    runOnRoot(v) {
      this.result.lastPlugin = v;
      try {
        if (typeof v == "object" && v.Once) {
          if (this.result.root.type === "document") {
            let k = this.result.root.nodes.map(
              (C) => v.Once(C, this.helpers)
            );
            return m(k[0]) ? Promise.all(k) : k;
          }
          return v.Once(this.result.root, this.helpers);
        } else if (typeof v == "function")
          return v(this.result.root, this.result);
      } catch (k) {
        throw this.handleError(k);
      }
    }
    stringify() {
      if (this.error) throw this.error;
      if (this.stringified) return this.result;
      this.stringified = !0, this.sync();
      let v = this.result.opts, k = n;
      v.syntax && (k = v.syntax.stringify), v.stringifier && (k = v.stringifier), k.stringify && (k = k.stringify);
      let L = new r(k, this.result.root, this.result.opts).generate();
      return this.result.css = L[0], this.result.map = L[1], this.result;
    }
    sync() {
      if (this.error) throw this.error;
      if (this.processed) return this.result;
      if (this.processed = !0, this.processing)
        throw this.getAsyncError();
      for (let v of this.plugins) {
        let k = this.runOnRoot(v);
        if (m(k))
          throw this.getAsyncError();
      }
      if (this.prepareVisitors(), this.hasListener) {
        let v = this.result.root;
        for (; !v[e]; )
          v[e] = !0, this.walkSync(v);
        if (this.listeners.OnceExit)
          if (v.type === "document")
            for (let k of v.nodes)
              this.visitSync(this.listeners.OnceExit, k);
          else
            this.visitSync(this.listeners.OnceExit, v);
      }
      return this.result;
    }
    then(v, k) {
      return process.env.NODE_ENV !== "production" && ("from" in this.opts || l(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(v, k);
    }
    toString() {
      return this.css;
    }
    visitSync(v, k) {
      for (let [C, L] of v) {
        this.result.lastPlugin = C;
        let N;
        try {
          N = L(k, this.helpers);
        } catch (I) {
          throw this.handleError(I, k.proxyOf);
        }
        if (k.type !== "root" && k.type !== "document" && !k.parent)
          return !0;
        if (m(N))
          throw this.getAsyncError();
      }
    }
    visitTick(v) {
      let k = v[v.length - 1], { node: C, visitors: L } = k;
      if (C.type !== "root" && C.type !== "document" && !C.parent) {
        v.pop();
        return;
      }
      if (L.length > 0 && k.visitorIndex < L.length) {
        let [I, V] = L[k.visitorIndex];
        k.visitorIndex += 1, k.visitorIndex === L.length && (k.visitors = [], k.visitorIndex = 0), this.result.lastPlugin = I;
        try {
          return V(C.toProxy(), this.helpers);
        } catch (W) {
          throw this.handleError(W, C);
        }
      }
      if (k.iterator !== 0) {
        let I = k.iterator, V;
        for (; V = C.nodes[C.indexes[I]]; )
          if (C.indexes[I] += 1, !V[e]) {
            V[e] = !0, v.push(g(V));
            return;
          }
        k.iterator = 0, delete C.indexes[I];
      }
      let N = k.events;
      for (; k.eventIndex < N.length; ) {
        let I = N[k.eventIndex];
        if (k.eventIndex += 1, I === u) {
          C.nodes && C.nodes.length && (C[e] = !0, k.iterator = C.getIterator());
          return;
        } else if (this.listeners[I]) {
          k.visitors = this.listeners[I];
          return;
        }
      }
      v.pop();
    }
    walkSync(v) {
      v[e] = !0;
      let k = f(v);
      for (let C of k)
        if (C === u)
          v.nodes && v.each((L) => {
            L[e] || this.walkSync(L);
          });
        else {
          let L = this.listeners[C];
          if (L && this.visitSync(L, v.toProxy()))
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
  return y.registerPostcss = (S) => {
    b = S;
  }, fi = y, y.default = y, p.registerLazyResult(y), o.registerLazyResult(y), fi;
}
var mi, Ko;
function Gh() {
  if (Ko) return mi;
  Ko = 1;
  let e = Fl(), t = vn(), r = Ul(), n = bs();
  const i = ms();
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
  return mi = o, o.default = o, mi;
}
var gi, Jo;
function Xh() {
  if (Jo) return gi;
  Jo = 1;
  let e = Gh(), t = Wl(), r = fs(), n = _r();
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
  return gi = i, i.default = i, n.registerProcessor(i), r.registerProcessor(i), gi;
}
var yi, Zo;
function Kh() {
  if (Zo) return yi;
  Zo = 1;
  let e = wn(), t = zl(), r = Sn(), n = gs(), i = xn(), o = _r(), l = ys();
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
  return yi = c, c.default = c, yi;
}
var bi, Qo;
function Jh() {
  if (Qo) return bi;
  Qo = 1;
  let e = ps(), t = wn(), r = Wl(), n = Gt(), i = Xh(), o = vn(), l = Kh(), c = fs(), a = Bl(), p = Sn(), s = gs(), h = ms(), d = xn(), u = bs(), m = ql(), f = ys(), g = _r(), x = kn();
  function b(...y) {
    return y.length === 1 && Array.isArray(y[0]) && (y = y[0]), new i(y);
  }
  return b.plugin = function(S, v) {
    let k = !1;
    function C(...N) {
      console && console.warn && !k && (k = !0, console.warn(
        S + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`
      ), process.env.LANG && process.env.LANG.startsWith("cn") && console.warn(
        S + `: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`
      ));
      let I = v(...N);
      return I.postcssPlugin = S, I.postcssVersion = new i().version, I;
    }
    let L;
    return Object.defineProperty(C, "postcss", {
      get() {
        return L || (L = C()), L;
      }
    }), C.process = function(N, I, V) {
      return b([C(V)]).process(N, I);
    }, C;
  }, b.stringify = o, b.parse = u, b.fromJSON = l, b.list = m, b.comment = (y) => new p(y), b.atRule = (y) => new s(y), b.decl = (y) => new t(y), b.rule = (y) => new f(y), b.root = (y) => new g(y), b.document = (y) => new c(y), b.CssSyntaxError = e, b.Declaration = t, b.Container = n, b.Processor = i, b.Document = c, b.Comment = p, b.Warning = a, b.AtRule = s, b.Result = h, b.Input = d, b.Rule = f, b.Root = g, b.Node = x, r.registerPostcss(b), bi = b, b.default = b, bi;
}
var Zh = Jh();
const me = /* @__PURE__ */ Uh(Zh);
me.stringify;
me.fromJSON;
me.plugin;
me.parse;
me.list;
me.document;
me.comment;
me.atRule;
me.rule;
me.decl;
me.root;
me.CssSyntaxError;
me.Declaration;
me.Container;
me.Processor;
me.Document;
me.Comment;
me.Warning;
me.AtRule;
me.Result;
me.Input;
me.Rule;
me.Root;
me.Node;
var Qh = Object.defineProperty, ef = (e, t, r) => t in e ? Qh(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, Ge = (e, t, r) => ef(e, typeof t != "symbol" ? t + "" : t, r);
Date.now().toString();
function tf(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function rf(e) {
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
var Xr = { exports: {} }, ea;
function nf() {
  if (ea) return Xr.exports;
  ea = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return Xr.exports = t(), Xr.exports.createColors = t, Xr.exports;
}
const sf = {}, of = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: sf
}, Symbol.toStringTag, { value: "Module" })), lt = /* @__PURE__ */ rf(of);
var vi, ta;
function vs() {
  if (ta) return vi;
  ta = 1;
  let e = /* @__PURE__ */ nf(), t = lt;
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
  return vi = r, r.default = r, vi;
}
var Kr = {}, ra;
function ks() {
  return ra || (ra = 1, Kr.isClean = Symbol("isClean"), Kr.my = Symbol("my")), Kr;
}
var ki, na;
function jl() {
  if (na) return ki;
  na = 1;
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
  return ki = r, r.default = r, ki;
}
var wi, ia;
function Cn() {
  if (ia) return wi;
  ia = 1;
  let e = jl();
  function t(r, n) {
    new e(n).stringify(r);
  }
  return wi = t, t.default = t, wi;
}
var xi, sa;
function En() {
  if (sa) return xi;
  sa = 1;
  let { isClean: e, my: t } = ks(), r = vs(), n = jl(), i = Cn();
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
  return xi = l, l.default = l, xi;
}
var Si, oa;
function Mn() {
  if (oa) return Si;
  oa = 1;
  let e = En();
  class t extends e {
    constructor(n) {
      n && typeof n.value < "u" && typeof n.value != "string" && (n = { ...n, value: String(n.value) }), super(n), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return Si = t, t.default = t, Si;
}
var Ci, aa;
function af() {
  if (aa) return Ci;
  aa = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return Ci = { nanoid: (n = 21) => {
    let i = "", o = n;
    for (; o--; )
      i += e[Math.random() * 64 | 0];
    return i;
  }, customAlphabet: (n, i = 21) => (o = i) => {
    let l = "", c = o;
    for (; c--; )
      l += n[Math.random() * n.length | 0];
    return l;
  } }, Ci;
}
var Ei, la;
function Hl() {
  if (la) return Ei;
  la = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = lt, { existsSync: r, readFileSync: n } = lt, { dirname: i, join: o } = lt;
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
  return Ei = c, c.default = c, Ei;
}
var Mi, ca;
function Rn() {
  if (ca) return Mi;
  ca = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = lt, { fileURLToPath: r, pathToFileURL: n } = lt, { isAbsolute: i, resolve: o } = lt, { nanoid: l } = /* @__PURE__ */ af(), c = lt, a = vs(), p = Hl(), s = Symbol("fromOffsetCache"), h = !!(e && t), d = !!(o && i);
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
      let y, S, v;
      if (g && typeof g == "object") {
        let C = g, L = x;
        if (typeof C.offset == "number") {
          let N = this.fromOffset(C.offset);
          g = N.line, x = N.col;
        } else
          g = C.line, x = C.column;
        if (typeof L.offset == "number") {
          let N = this.fromOffset(L.offset);
          S = N.line, v = N.col;
        } else
          S = L.line, v = L.column;
      } else if (!x) {
        let C = this.fromOffset(g);
        g = C.line, x = C.col;
      }
      let k = this.origin(g, x, S, v);
      return k ? y = new a(
        f,
        k.endLine === void 0 ? k.line : { column: k.column, line: k.line },
        k.endLine === void 0 ? k.column : { column: k.endColumn, line: k.endLine },
        k.source,
        k.file,
        b.plugin
      ) : y = new a(
        f,
        S === void 0 ? g : { column: x, line: g },
        S === void 0 ? x : { column: v, line: S },
        this.css,
        this.file,
        b.plugin
      ), y.input = { column: x, endColumn: v, endLine: S, line: g, source: this.css }, this.file && (n && (y.input.url = n(this.file).toString()), y.input.file = this.file), y;
    }
    fromOffset(f) {
      let g, x;
      if (this[s])
        x = this[s];
      else {
        let y = this.css.split(`
`);
        x = new Array(y.length);
        let S = 0;
        for (let v = 0, k = y.length; v < k; v++)
          x[v] = S, S += y[v].length + 1;
        this[s] = x;
      }
      g = x[x.length - 1];
      let b = 0;
      if (f >= g)
        b = x.length - 1;
      else {
        let y = x.length - 2, S;
        for (; b < y; )
          if (S = b + (y - b >> 1), f < x[S])
            y = S - 1;
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
      let y = this.map.consumer(), S = y.originalPositionFor({ column: g, line: f });
      if (!S.source) return !1;
      let v;
      typeof x == "number" && (v = y.originalPositionFor({ column: b, line: x }));
      let k;
      i(S.source) ? k = n(S.source) : k = new URL(
        S.source,
        this.map.consumer().sourceRoot || n(this.map.mapFile)
      );
      let C = {
        column: S.column,
        endColumn: v && v.column,
        endLine: v && v.line,
        line: S.line,
        url: k.toString()
      };
      if (k.protocol === "file:")
        if (r)
          C.file = r(k);
        else
          throw new Error("file: protocol is not available in this PostCSS build");
      let L = y.sourceContentFor(S.source);
      return L && (C.source = L), C;
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
  return Mi = u, u.default = u, c && c.registerInput && c.registerInput(u), Mi;
}
var Ri, ua;
function Vl() {
  if (ua) return Ri;
  ua = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = lt, { dirname: r, relative: n, resolve: i, sep: o } = lt, { pathToFileURL: l } = lt, c = Rn(), a = !!(e && t), p = !!(r && i && n && o);
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
      this.stringify(this.root, (b, y, S) => {
        if (this.css += b, y && S !== "end" && (f.generated.line = d, f.generated.column = u - 1, y.source && y.source.start ? (f.source = this.sourcePath(y), f.original.line = y.source.start.line, f.original.column = y.source.start.column - 1, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, this.map.addMapping(f))), g = b.match(/\n/g), g ? (d += g.length, x = b.lastIndexOf(`
`), u = b.length - x) : u += b.length, y && S !== "start") {
          let v = y.parent || { raws: {} };
          (!(y.type === "decl" || y.type === "atrule" && !y.nodes) || y !== v.last || v.raws.semicolon) && (y.source && y.source.end ? (f.source = this.sourcePath(y), f.original.line = y.source.end.line, f.original.column = y.source.end.column - 1, f.generated.line = d, f.generated.column = u - 2, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, f.generated.line = d, f.generated.column = u - 1, this.map.addMapping(f)));
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
  return Ri = s, Ri;
}
var Ai, da;
function An() {
  if (da) return Ai;
  da = 1;
  let e = En();
  class t extends e {
    constructor(n) {
      super(n), this.type = "comment";
    }
  }
  return Ai = t, t.default = t, Ai;
}
var Ii, pa;
function Xt() {
  if (pa) return Ii;
  pa = 1;
  let { isClean: e, my: t } = ks(), r = Mn(), n = An(), i = En(), o, l, c, a;
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
  }, Ii = h, h.default = h, h.rebuild = (d) => {
    d.type === "atrule" ? Object.setPrototypeOf(d, c.prototype) : d.type === "rule" ? Object.setPrototypeOf(d, l.prototype) : d.type === "decl" ? Object.setPrototypeOf(d, r.prototype) : d.type === "comment" ? Object.setPrototypeOf(d, n.prototype) : d.type === "root" && Object.setPrototypeOf(d, a.prototype), d[t] = !0, d.nodes && d.nodes.forEach((u) => {
      h.rebuild(u);
    });
  }, Ii;
}
var Li, ha;
function ws() {
  if (ha) return Li;
  ha = 1;
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
  }, Li = n, n.default = n, Li;
}
var Oi, fa;
function Yl() {
  if (fa) return Oi;
  fa = 1;
  let e = {};
  return Oi = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, Oi;
}
var Ti, ma;
function Gl() {
  if (ma) return Ti;
  ma = 1;
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
var Ni, ga;
function xs() {
  if (ga) return Ni;
  ga = 1;
  let e = Gl();
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
  return Ni = t, t.default = t, Ni;
}
var _i, ya;
function lf() {
  if (ya) return _i;
  ya = 1;
  const e = 39, t = 34, r = 92, n = 47, i = 10, o = 32, l = 12, c = 9, a = 13, p = 91, s = 93, h = 40, d = 41, u = 123, m = 125, f = 59, g = 42, x = 58, b = 64, y = /[\t\n\f\r "#'()/;[\\\]{}]/g, S = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, v = /.[\r\n"'(/\\]/, k = /[\da-f]/i;
  return _i = function(L, N = {}) {
    let I = L.css.valueOf(), V = N.ignoreErrors, W, R, he, Ce, ce, te, de, Ae, be, K, ve = I.length, _ = 0, je = [], Ie = [];
    function Ct() {
      return _;
    }
    function Le($) {
      throw L.error("Unclosed " + $, _);
    }
    function He() {
      return Ie.length === 0 && _ >= ve;
    }
    function ct($) {
      if (Ie.length) return Ie.pop();
      if (_ >= ve) return;
      let ye = $ ? $.ignoreUnclosed : !1;
      switch (W = I.charCodeAt(_), W) {
        case i:
        case o:
        case c:
        case a:
        case l: {
          R = _;
          do
            R += 1, W = I.charCodeAt(R);
          while (W === o || W === i || W === c || W === a || W === l);
          K = ["space", I.slice(_, R)], _ = R - 1;
          break;
        }
        case p:
        case s:
        case u:
        case m:
        case x:
        case f:
        case d: {
          let X = String.fromCharCode(W);
          K = [X, X, _];
          break;
        }
        case h: {
          if (Ae = je.length ? je.pop()[1] : "", be = I.charCodeAt(_ + 1), Ae === "url" && be !== e && be !== t && be !== o && be !== i && be !== c && be !== l && be !== a) {
            R = _;
            do {
              if (te = !1, R = I.indexOf(")", R + 1), R === -1)
                if (V || ye) {
                  R = _;
                  break;
                } else
                  Le("bracket");
              for (de = R; I.charCodeAt(de - 1) === r; )
                de -= 1, te = !te;
            } while (te);
            K = ["brackets", I.slice(_, R + 1), _, R], _ = R;
          } else
            R = I.indexOf(")", _ + 1), Ce = I.slice(_, R + 1), R === -1 || v.test(Ce) ? K = ["(", "(", _] : (K = ["brackets", Ce, _, R], _ = R);
          break;
        }
        case e:
        case t: {
          he = W === e ? "'" : '"', R = _;
          do {
            if (te = !1, R = I.indexOf(he, R + 1), R === -1)
              if (V || ye) {
                R = _ + 1;
                break;
              } else
                Le("string");
            for (de = R; I.charCodeAt(de - 1) === r; )
              de -= 1, te = !te;
          } while (te);
          K = ["string", I.slice(_, R + 1), _, R], _ = R;
          break;
        }
        case b: {
          y.lastIndex = _ + 1, y.test(I), y.lastIndex === 0 ? R = I.length - 1 : R = y.lastIndex - 2, K = ["at-word", I.slice(_, R + 1), _, R], _ = R;
          break;
        }
        case r: {
          for (R = _, ce = !0; I.charCodeAt(R + 1) === r; )
            R += 1, ce = !ce;
          if (W = I.charCodeAt(R + 1), ce && W !== n && W !== o && W !== i && W !== c && W !== a && W !== l && (R += 1, k.test(I.charAt(R)))) {
            for (; k.test(I.charAt(R + 1)); )
              R += 1;
            I.charCodeAt(R + 1) === o && (R += 1);
          }
          K = ["word", I.slice(_, R + 1), _, R], _ = R;
          break;
        }
        default: {
          W === n && I.charCodeAt(_ + 1) === g ? (R = I.indexOf("*/", _ + 2) + 1, R === 0 && (V || ye ? R = I.length : Le("comment")), K = ["comment", I.slice(_, R + 1), _, R], _ = R) : (S.lastIndex = _ + 1, S.test(I), S.lastIndex === 0 ? R = I.length - 1 : R = S.lastIndex - 2, K = ["word", I.slice(_, R + 1), _, R], je.push(K), _ = R);
          break;
        }
      }
      return _++, K;
    }
    function $e($) {
      Ie.push($);
    }
    return {
      back: $e,
      endOfFile: He,
      nextToken: ct,
      position: Ct
    };
  }, _i;
}
var Pi, ba;
function Ss() {
  if (ba) return Pi;
  ba = 1;
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
  return Pi = t, t.default = t, e.registerAtRule(t), Pi;
}
var $i, va;
function Pr() {
  if (va) return $i;
  va = 1;
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
  }, $i = n, n.default = n, e.registerRoot(n), $i;
}
var Di, ka;
function Xl() {
  if (ka) return Di;
  ka = 1;
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
  return Di = e, e.default = e, Di;
}
var zi, wa;
function Cs() {
  if (wa) return zi;
  wa = 1;
  let e = Xt(), t = Xl();
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
  return zi = r, r.default = r, e.registerRule(r), zi;
}
var Fi, xa;
function cf() {
  if (xa) return Fi;
  xa = 1;
  let e = Mn(), t = lf(), r = An(), n = Ss(), i = Pr(), o = Cs();
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
          let y = s.slice(0), S = "";
          for (let v = b; v > 0; v--) {
            let k = y[v][0];
            if (S.trim().indexOf("!") === 0 && k !== "space")
              break;
            S = y.pop()[1] + S;
          }
          S.trim().indexOf("!") === 0 && (d.important = !0, d.raws.important = S, s = y);
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
      let m, f, g = d.length, x = "", b = !0, y, S;
      for (let v = 0; v < g; v += 1)
        m = d[v], f = m[0], f === "space" && v === g - 1 && !u ? b = !1 : f === "comment" ? (S = d[v - 1] ? d[v - 1][0] : "empty", y = d[v + 1] ? d[v + 1][0] : "empty", !l[S] && !l[y] ? x.slice(-1) === "," ? b = !1 : x += m[1] : b = !1) : x += m[1];
      if (!b) {
        let v = d.reduce((k, C) => k + C[1], "");
        s.raws[h] = { raw: v, value: x };
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
  return Fi = a, Fi;
}
var Ui, Sa;
function Es() {
  if (Sa) return Ui;
  Sa = 1;
  let e = Xt(), t = cf(), r = Rn();
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
  return Ui = n, n.default = n, e.registerParse(n), Ui;
}
var Bi, Ca;
function Kl() {
  if (Ca) return Bi;
  Ca = 1;
  let { isClean: e, my: t } = ks(), r = Vl(), n = Cn(), i = Xt(), o = ws(), l = Yl(), c = xs(), a = Es(), p = Pr();
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
    let v = !1, k = s[S.type];
    return S.type === "decl" ? v = S.prop.toLowerCase() : S.type === "atrule" && (v = S.name.toLowerCase()), v && S.append ? [
      k,
      k + "-" + v,
      u,
      k + "Exit",
      k + "Exit-" + v
    ] : v ? [k, k + "-" + v, k + "Exit", k + "Exit-" + v] : S.append ? [k, u, k + "Exit"] : [k, k + "Exit"];
  }
  function g(S) {
    let v;
    return S.type === "document" ? v = ["Document", u, "DocumentExit"] : S.type === "root" ? v = ["Root", u, "RootExit"] : v = f(S), {
      eventIndex: 0,
      events: v,
      iterator: 0,
      node: S,
      visitorIndex: 0,
      visitors: []
    };
  }
  function x(S) {
    return S[e] = !1, S.nodes && S.nodes.forEach((v) => x(v)), S;
  }
  let b = {};
  class y {
    constructor(v, k, C) {
      this.stringified = !1, this.processed = !1;
      let L;
      if (typeof k == "object" && k !== null && (k.type === "root" || k.type === "document"))
        L = x(k);
      else if (k instanceof y || k instanceof c)
        L = x(k.root), k.map && (typeof C.map > "u" && (C.map = {}), C.map.inline || (C.map.inline = !1), C.map.prev = k.map);
      else {
        let N = a;
        C.syntax && (N = C.syntax.parse), C.parser && (N = C.parser), N.parse && (N = N.parse);
        try {
          L = N(k, C);
        } catch (I) {
          this.processed = !0, this.error = I;
        }
        L && !L[t] && i.rebuild(L);
      }
      this.result = new c(v, L, C), this.helpers = { ...b, postcss: b, result: this.result }, this.plugins = this.processor.plugins.map((N) => typeof N == "object" && N.prepare ? { ...N, ...N.prepare(this.result) } : N);
    }
    async() {
      return this.error ? Promise.reject(this.error) : this.processed ? Promise.resolve(this.result) : (this.processing || (this.processing = this.runAsync()), this.processing);
    }
    catch(v) {
      return this.async().catch(v);
    }
    finally(v) {
      return this.async().then(v, v);
    }
    getAsyncError() {
      throw new Error("Use process(css).then(cb) to work with async plugins");
    }
    handleError(v, k) {
      let C = this.result.lastPlugin;
      try {
        if (k && k.addToError(v), this.error = v, v.name === "CssSyntaxError" && !v.plugin)
          v.plugin = C.postcssPlugin, v.setMessage();
        else if (C.postcssVersion && process.env.NODE_ENV !== "production") {
          let L = C.postcssPlugin, N = C.postcssVersion, I = this.result.processor.version, V = N.split("."), W = I.split(".");
          (V[0] !== W[0] || parseInt(V[1]) > parseInt(W[1])) && console.error(
            "Unknown error from PostCSS plugin. Your current PostCSS version is " + I + ", but " + L + " uses " + N + ". Perhaps this is the source of the error below."
          );
        }
      } catch (L) {
        console && console.error && console.error(L);
      }
      return v;
    }
    prepareVisitors() {
      this.listeners = {};
      let v = (k, C, L) => {
        this.listeners[C] || (this.listeners[C] = []), this.listeners[C].push([k, L]);
      };
      for (let k of this.plugins)
        if (typeof k == "object")
          for (let C in k) {
            if (!h[C] && /^[A-Z]/.test(C))
              throw new Error(
                `Unknown event ${C} in ${k.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`
              );
            if (!d[C])
              if (typeof k[C] == "object")
                for (let L in k[C])
                  L === "*" ? v(k, C, k[C][L]) : v(
                    k,
                    C + "-" + L.toLowerCase(),
                    k[C][L]
                  );
              else typeof k[C] == "function" && v(k, C, k[C]);
          }
      this.hasListener = Object.keys(this.listeners).length > 0;
    }
    async runAsync() {
      this.plugin = 0;
      for (let v = 0; v < this.plugins.length; v++) {
        let k = this.plugins[v], C = this.runOnRoot(k);
        if (m(C))
          try {
            await C;
          } catch (L) {
            throw this.handleError(L);
          }
      }
      if (this.prepareVisitors(), this.hasListener) {
        let v = this.result.root;
        for (; !v[e]; ) {
          v[e] = !0;
          let k = [g(v)];
          for (; k.length > 0; ) {
            let C = this.visitTick(k);
            if (m(C))
              try {
                await C;
              } catch (L) {
                let N = k[k.length - 1].node;
                throw this.handleError(L, N);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [k, C] of this.listeners.OnceExit) {
            this.result.lastPlugin = k;
            try {
              if (v.type === "document") {
                let L = v.nodes.map(
                  (N) => C(N, this.helpers)
                );
                await Promise.all(L);
              } else
                await C(v, this.helpers);
            } catch (L) {
              throw this.handleError(L);
            }
          }
      }
      return this.processed = !0, this.stringify();
    }
    runOnRoot(v) {
      this.result.lastPlugin = v;
      try {
        if (typeof v == "object" && v.Once) {
          if (this.result.root.type === "document") {
            let k = this.result.root.nodes.map(
              (C) => v.Once(C, this.helpers)
            );
            return m(k[0]) ? Promise.all(k) : k;
          }
          return v.Once(this.result.root, this.helpers);
        } else if (typeof v == "function")
          return v(this.result.root, this.result);
      } catch (k) {
        throw this.handleError(k);
      }
    }
    stringify() {
      if (this.error) throw this.error;
      if (this.stringified) return this.result;
      this.stringified = !0, this.sync();
      let v = this.result.opts, k = n;
      v.syntax && (k = v.syntax.stringify), v.stringifier && (k = v.stringifier), k.stringify && (k = k.stringify);
      let L = new r(k, this.result.root, this.result.opts).generate();
      return this.result.css = L[0], this.result.map = L[1], this.result;
    }
    sync() {
      if (this.error) throw this.error;
      if (this.processed) return this.result;
      if (this.processed = !0, this.processing)
        throw this.getAsyncError();
      for (let v of this.plugins) {
        let k = this.runOnRoot(v);
        if (m(k))
          throw this.getAsyncError();
      }
      if (this.prepareVisitors(), this.hasListener) {
        let v = this.result.root;
        for (; !v[e]; )
          v[e] = !0, this.walkSync(v);
        if (this.listeners.OnceExit)
          if (v.type === "document")
            for (let k of v.nodes)
              this.visitSync(this.listeners.OnceExit, k);
          else
            this.visitSync(this.listeners.OnceExit, v);
      }
      return this.result;
    }
    then(v, k) {
      return process.env.NODE_ENV !== "production" && ("from" in this.opts || l(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(v, k);
    }
    toString() {
      return this.css;
    }
    visitSync(v, k) {
      for (let [C, L] of v) {
        this.result.lastPlugin = C;
        let N;
        try {
          N = L(k, this.helpers);
        } catch (I) {
          throw this.handleError(I, k.proxyOf);
        }
        if (k.type !== "root" && k.type !== "document" && !k.parent)
          return !0;
        if (m(N))
          throw this.getAsyncError();
      }
    }
    visitTick(v) {
      let k = v[v.length - 1], { node: C, visitors: L } = k;
      if (C.type !== "root" && C.type !== "document" && !C.parent) {
        v.pop();
        return;
      }
      if (L.length > 0 && k.visitorIndex < L.length) {
        let [I, V] = L[k.visitorIndex];
        k.visitorIndex += 1, k.visitorIndex === L.length && (k.visitors = [], k.visitorIndex = 0), this.result.lastPlugin = I;
        try {
          return V(C.toProxy(), this.helpers);
        } catch (W) {
          throw this.handleError(W, C);
        }
      }
      if (k.iterator !== 0) {
        let I = k.iterator, V;
        for (; V = C.nodes[C.indexes[I]]; )
          if (C.indexes[I] += 1, !V[e]) {
            V[e] = !0, v.push(g(V));
            return;
          }
        k.iterator = 0, delete C.indexes[I];
      }
      let N = k.events;
      for (; k.eventIndex < N.length; ) {
        let I = N[k.eventIndex];
        if (k.eventIndex += 1, I === u) {
          C.nodes && C.nodes.length && (C[e] = !0, k.iterator = C.getIterator());
          return;
        } else if (this.listeners[I]) {
          k.visitors = this.listeners[I];
          return;
        }
      }
      v.pop();
    }
    walkSync(v) {
      v[e] = !0;
      let k = f(v);
      for (let C of k)
        if (C === u)
          v.nodes && v.each((L) => {
            L[e] || this.walkSync(L);
          });
        else {
          let L = this.listeners[C];
          if (L && this.visitSync(L, v.toProxy()))
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
  return y.registerPostcss = (S) => {
    b = S;
  }, Bi = y, y.default = y, p.registerLazyResult(y), o.registerLazyResult(y), Bi;
}
var qi, Ea;
function uf() {
  if (Ea) return qi;
  Ea = 1;
  let e = Vl(), t = Cn(), r = Yl(), n = Es();
  const i = xs();
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
  return qi = o, o.default = o, qi;
}
var Wi, Ma;
function df() {
  if (Ma) return Wi;
  Ma = 1;
  let e = uf(), t = Kl(), r = ws(), n = Pr();
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
  return Wi = i, i.default = i, n.registerProcessor(i), r.registerProcessor(i), Wi;
}
var ji, Ra;
function pf() {
  if (Ra) return ji;
  Ra = 1;
  let e = Mn(), t = Hl(), r = An(), n = Ss(), i = Rn(), o = Pr(), l = Cs();
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
  return ji = c, c.default = c, ji;
}
var Hi, Aa;
function hf() {
  if (Aa) return Hi;
  Aa = 1;
  let e = vs(), t = Mn(), r = Kl(), n = Xt(), i = df(), o = Cn(), l = pf(), c = ws(), a = Gl(), p = An(), s = Ss(), h = xs(), d = Rn(), u = Es(), m = Xl(), f = Cs(), g = Pr(), x = En();
  function b(...y) {
    return y.length === 1 && Array.isArray(y[0]) && (y = y[0]), new i(y);
  }
  return b.plugin = function(S, v) {
    let k = !1;
    function C(...N) {
      console && console.warn && !k && (k = !0, console.warn(
        S + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`
      ), process.env.LANG && process.env.LANG.startsWith("cn") && console.warn(
        S + `: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`
      ));
      let I = v(...N);
      return I.postcssPlugin = S, I.postcssVersion = new i().version, I;
    }
    let L;
    return Object.defineProperty(C, "postcss", {
      get() {
        return L || (L = C()), L;
      }
    }), C.process = function(N, I, V) {
      return b([C(V)]).process(N, I);
    }, C;
  }, b.stringify = o, b.parse = u, b.fromJSON = l, b.list = m, b.comment = (y) => new p(y), b.atRule = (y) => new s(y), b.decl = (y) => new t(y), b.rule = (y) => new f(y), b.root = (y) => new g(y), b.document = (y) => new c(y), b.CssSyntaxError = e, b.Declaration = t, b.Container = n, b.Processor = i, b.Document = c, b.Comment = p, b.Warning = a, b.AtRule = s, b.Result = h, b.Input = d, b.Rule = f, b.Root = g, b.Node = x, r.registerPostcss(b), Hi = b, b.default = b, Hi;
}
var ff = hf();
const ge = /* @__PURE__ */ tf(ff);
ge.stringify;
ge.fromJSON;
ge.plugin;
ge.parse;
ge.list;
ge.document;
ge.comment;
ge.atRule;
ge.rule;
ge.decl;
ge.root;
ge.CssSyntaxError;
ge.Declaration;
ge.Container;
ge.Processor;
ge.Document;
ge.Comment;
ge.Warning;
ge.AtRule;
ge.Result;
ge.Input;
ge.Rule;
ge.Root;
ge.Node;
class Ms {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  constructor(...t) {
    Ge(this, "parentElement", null), Ge(this, "parentNode", null), Ge(this, "ownerDocument"), Ge(this, "firstChild", null), Ge(this, "lastChild", null), Ge(this, "previousSibling", null), Ge(this, "nextSibling", null), Ge(this, "ELEMENT_NODE", 1), Ge(this, "TEXT_NODE", 3), Ge(this, "nodeType"), Ge(this, "nodeName"), Ge(this, "RRNodeType");
  }
  get childNodes() {
    const t = [];
    let r = this.firstChild;
    for (; r; )
      t.push(r), r = r.nextSibling;
    return t;
  }
  contains(t) {
    if (t instanceof Ms) {
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
const Ia = {
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
}, La = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, Jr = {}, Jl = {}, mf = () => !!globalThis.Zone;
function Rs(e) {
  if (Jr[e])
    return Jr[e];
  const t = globalThis[e], r = t.prototype, n = e in Ia ? Ia[e] : void 0, i = !!(n && // @ts-expect-error 2345
  n.every(
    (c) => {
      var a, p;
      return !!((p = (a = Object.getOwnPropertyDescriptor(r, c)) == null ? void 0 : a.get) != null && p.toString().includes("[native code]"));
    }
  )), o = e in La ? La[e] : void 0, l = !!(o && o.every(
    // @ts-expect-error 2345
    (c) => {
      var a;
      return typeof r[c] == "function" && ((a = r[c]) == null ? void 0 : a.toString().includes("[native code]"));
    }
  ));
  if (i && l && !mf())
    return Jr[e] = t.prototype, t.prototype;
  try {
    const c = document.createElement("iframe");
    c.style.display = "none", document.body.appendChild(c);
    const a = c.contentWindow;
    if (!a) return t.prototype;
    const p = a[e].prototype;
    if (!p)
      return c.remove(), r;
    const s = navigator.userAgent;
    return s.includes("Safari") && !s.includes("Chrome") ? (c.classList.add("rr-block"), c.setAttribute("__rrwebUntaintedMutationObserver", ""), Jl[e] = () => c.remove()) : c.remove(), Jr[e] = p;
  } catch {
    return r;
  }
}
const Vi = {};
function St(e, t, r) {
  var n;
  const i = `${e}.${String(r)}`;
  if (Vi[i])
    return Vi[i].call(
      t
    );
  const o = Rs(e), l = (n = Object.getOwnPropertyDescriptor(
    o,
    r
  )) == null ? void 0 : n.get;
  return l ? (Vi[i] = l, l.call(t)) : t[r];
}
const Yi = {};
function Zl(e, t, r) {
  const n = `${e}.${String(r)}`;
  if (Yi[n])
    return Yi[n].bind(
      t
    );
  const o = Rs(e)[r];
  return typeof o != "function" ? t[r] : (Yi[n] = o, o.bind(t));
}
function gf(e) {
  return St("Node", e, "ownerDocument");
}
function yf(e) {
  return St("Node", e, "childNodes");
}
function bf(e) {
  return St("Node", e, "parentNode");
}
function vf(e) {
  return St("Node", e, "parentElement");
}
function kf(e) {
  return St("Node", e, "textContent");
}
function wf(e, t) {
  return Zl("Node", e, "contains")(t);
}
function xf(e) {
  return Zl("Node", e, "getRootNode")();
}
function Sf(e) {
  return !e || !("host" in e) ? null : St("ShadowRoot", e, "host");
}
function Cf(e) {
  return e.styleSheets;
}
function Ef(e) {
  return !e || !("shadowRoot" in e) ? null : St("Element", e, "shadowRoot");
}
function Mf(e, t) {
  return St("Element", e, "querySelector")(t);
}
function Rf(e, t) {
  return St("Element", e, "querySelectorAll")(t);
}
function Ql() {
  return [
    Rs("MutationObserver").constructor,
    Jl.MutationObserver ?? (() => {
    })
  ];
}
let Or = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (Or = () => (/* @__PURE__ */ new Date()).getTime());
function Kt(e, t, r) {
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
const re = {
  ownerDocument: gf,
  childNodes: yf,
  parentNode: bf,
  parentElement: vf,
  textContent: kf,
  contains: wf,
  getRootNode: xf,
  host: Sf,
  styleSheets: Cf,
  shadowRoot: Ef,
  querySelector: Mf,
  querySelectorAll: Rf,
  nowTimestamp: Or,
  mutationObserverCtor: Ql,
  patch: Kt
};
function Ue(e, t, r = document) {
  const n = { capture: !0, passive: !0 };
  return r.addEventListener(e, t, n), () => r.removeEventListener(e, t, n);
}
const ir = `Please stop import mirror directly. Instead of that,\r
now you can use replayer.getMirror() to access the mirror instance of a replayer,\r
or you can use record.mirror to access the mirror instance during recording.`;
let Oa = {
  map: {},
  getId() {
    return console.error(ir), -1;
  },
  getNode() {
    return console.error(ir), null;
  },
  removeNodeFromMap() {
    console.error(ir);
  },
  has() {
    return console.error(ir), !1;
  },
  reset() {
    console.error(ir);
  }
};
typeof window < "u" && window.Proxy && window.Reflect && (Oa = new Proxy(Oa, {
  get(e, t, r) {
    return t === "map" && console.error(ir), Reflect.get(e, t, r);
  }
}));
function Tr(e, t, r = {}) {
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
function In(e, t, r, n, i = window) {
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
  ), () => In(e, t, o || {}, !0);
}
function ec(e) {
  var t, r, n, i;
  const o = e.document;
  return {
    left: o.scrollingElement ? o.scrollingElement.scrollLeft : e.pageXOffset !== void 0 ? e.pageXOffset : o.documentElement.scrollLeft || (o == null ? void 0 : o.body) && ((t = re.parentElement(o.body)) == null ? void 0 : t.scrollLeft) || ((r = o == null ? void 0 : o.body) == null ? void 0 : r.scrollLeft) || 0,
    top: o.scrollingElement ? o.scrollingElement.scrollTop : e.pageYOffset !== void 0 ? e.pageYOffset : (o == null ? void 0 : o.documentElement.scrollTop) || (o == null ? void 0 : o.body) && ((n = re.parentElement(o.body)) == null ? void 0 : n.scrollTop) || ((i = o == null ? void 0 : o.body) == null ? void 0 : i.scrollTop) || 0
  };
}
function tc() {
  return window.innerHeight || document.documentElement && document.documentElement.clientHeight || document.body && document.body.clientHeight;
}
function rc() {
  return window.innerWidth || document.documentElement && document.documentElement.clientWidth || document.body && document.body.clientWidth;
}
function nc(e) {
  return e ? e.nodeType === e.ELEMENT_NODE ? e : re.parentElement(e) : null;
}
function Be(e, t, r, n) {
  if (!e)
    return !1;
  const i = nc(e);
  if (!i)
    return !1;
  try {
    if (typeof t == "string") {
      if (i.classList.contains(t) || n && i.closest("." + t) !== null) return !0;
    } else if (cn(i, t, n)) return !0;
  } catch {
  }
  return !!(r && (i.matches(r) || n && i.closest(r) !== null));
}
function Af(e, t) {
  return t.getId(e) !== -1;
}
function Gi(e, t, r) {
  return e.tagName === "TITLE" && r.headTitleMutations ? !0 : t.getId(e) === Lr;
}
function ic(e, t) {
  if (Cr(e))
    return !1;
  const r = t.getId(e);
  if (!t.has(r))
    return !0;
  const n = re.parentNode(e);
  return n && n.nodeType === e.DOCUMENT_NODE ? !1 : n ? ic(n, t) : !0;
}
function es(e) {
  return !!e.changedTouches;
}
function If(e = window) {
  "NodeList" in e && !e.NodeList.prototype.forEach && (e.NodeList.prototype.forEach = Array.prototype.forEach), "DOMTokenList" in e && !e.DOMTokenList.prototype.forEach && (e.DOMTokenList.prototype.forEach = Array.prototype.forEach);
}
function sc(e, t) {
  return !!(e.nodeName === "IFRAME" && t.getMeta(e));
}
function oc(e, t) {
  return !!(e.nodeName === "LINK" && e.nodeType === e.ELEMENT_NODE && e.getAttribute && e.getAttribute("rel") === "stylesheet" && t.getMeta(e));
}
function ts(e) {
  return e ? e instanceof Ms && "shadowRoot" in e ? !!e.shadowRoot : !!re.shadowRoot(e) : !1;
}
class Lf {
  constructor() {
    z(this, "id", 1), z(this, "styleIDMap", /* @__PURE__ */ new WeakMap()), z(this, "idStyleMap", /* @__PURE__ */ new Map());
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
function ac(e) {
  var t;
  let r = null;
  return "getRootNode" in e && ((t = re.getRootNode(e)) == null ? void 0 : t.nodeType) === Node.DOCUMENT_FRAGMENT_NODE && re.host(re.getRootNode(e)) && (r = re.host(re.getRootNode(e))), r;
}
function Of(e) {
  let t = e, r;
  for (; r = ac(t); )
    t = r;
  return t;
}
function Tf(e) {
  const t = re.ownerDocument(e);
  if (!t) return !1;
  const r = Of(e);
  return re.contains(t, r);
}
function lc(e) {
  const t = re.ownerDocument(e);
  return t ? re.contains(t, e) || Tf(e) : !1;
}
var le = /* @__PURE__ */ ((e) => (e[e.DomContentLoaded = 0] = "DomContentLoaded", e[e.Load = 1] = "Load", e[e.FullSnapshot = 2] = "FullSnapshot", e[e.IncrementalSnapshot = 3] = "IncrementalSnapshot", e[e.Meta = 4] = "Meta", e[e.Custom = 5] = "Custom", e[e.Plugin = 6] = "Plugin", e[e.Asset = 7] = "Asset", e))(le || {}), se = /* @__PURE__ */ ((e) => (e[e.Mutation = 0] = "Mutation", e[e.MouseMove = 1] = "MouseMove", e[e.MouseInteraction = 2] = "MouseInteraction", e[e.Scroll = 3] = "Scroll", e[e.ViewportResize = 4] = "ViewportResize", e[e.Input = 5] = "Input", e[e.TouchMove = 6] = "TouchMove", e[e.MediaInteraction = 7] = "MediaInteraction", e[e.StyleSheetRule = 8] = "StyleSheetRule", e[e.CanvasMutation = 9] = "CanvasMutation", e[e.Font = 10] = "Font", e[e.Log = 11] = "Log", e[e.Drag = 12] = "Drag", e[e.StyleDeclaration = 13] = "StyleDeclaration", e[e.Selection = 14] = "Selection", e[e.AdoptedStyleSheet = 15] = "AdoptedStyleSheet", e[e.CustomElement = 16] = "CustomElement", e))(se || {}), We = /* @__PURE__ */ ((e) => (e[e.MouseUp = 0] = "MouseUp", e[e.MouseDown = 1] = "MouseDown", e[e.Click = 2] = "Click", e[e.ContextMenu = 3] = "ContextMenu", e[e.DblClick = 4] = "DblClick", e[e.Focus = 5] = "Focus", e[e.Blur = 6] = "Blur", e[e.TouchStart = 7] = "TouchStart", e[e.TouchMove_Departed = 8] = "TouchMove_Departed", e[e.TouchEnd = 9] = "TouchEnd", e[e.TouchCancel = 10] = "TouchCancel", e))(We || {}), wt = /* @__PURE__ */ ((e) => (e[e.Mouse = 0] = "Mouse", e[e.Pen = 1] = "Pen", e[e.Touch = 2] = "Touch", e))(wt || {}), gr = /* @__PURE__ */ ((e) => (e[e["2D"] = 0] = "2D", e[e.WebGL = 1] = "WebGL", e[e.WebGL2 = 2] = "WebGL2", e))(gr || {}), sr = /* @__PURE__ */ ((e) => (e[e.Play = 0] = "Play", e[e.Pause = 1] = "Pause", e[e.Seeked = 2] = "Seeked", e[e.VolumeChange = 3] = "VolumeChange", e[e.RateChange = 4] = "RateChange", e))(sr || {}), cc = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(cc || {});
function Ta(e) {
  return "__ln" in e;
}
class Nf {
  constructor() {
    z(this, "length", 0), z(this, "head", null), z(this, "tail", null);
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
    if (t.__ln = r, t.previousSibling && Ta(t.previousSibling)) {
      const n = t.previousSibling.__ln.next;
      r.next = n, r.previous = t.previousSibling.__ln, t.previousSibling.__ln.next = r, n && (n.previous = r);
    } else if (t.nextSibling && Ta(t.nextSibling) && t.nextSibling.__ln.previous) {
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
const Na = (e, t) => `${e}@${t}`;
class _f {
  constructor() {
    z(this, "frozen", !1), z(this, "locked", !1), z(this, "texts", []), z(this, "attributes", []), z(this, "attributeMap", /* @__PURE__ */ new WeakMap()), z(this, "removes", []), z(this, "mapRemoves", []), z(this, "movedMap", {}), z(this, "addedSet", /* @__PURE__ */ new Set()), z(this, "movedSet", /* @__PURE__ */ new Set()), z(this, "droppedSet", /* @__PURE__ */ new Set()), z(this, "removesSubTreeCache", /* @__PURE__ */ new Set()), z(this, "mutationCb"), z(this, "blockClass"), z(this, "blockSelector"), z(this, "maskTextClass"), z(this, "maskTextSelector"), z(this, "inlineStylesheet"), z(this, "maskInputOptions"), z(this, "maskTextFn"), z(this, "maskInputFn"), z(this, "keepIframeSrcFn"), z(this, "recordCanvas"), z(this, "inlineImages"), z(this, "slimDOMOptions"), z(this, "dataURLOptions"), z(this, "doc"), z(this, "mirror"), z(this, "iframeManager"), z(this, "stylesheetManager"), z(this, "shadowDomManager"), z(this, "canvasManager"), z(this, "processedNodeManager"), z(this, "unattachedDoc"), z(this, "processMutations", (t) => {
      t.forEach(this.processMutation), this.emit();
    }), z(this, "emit", () => {
      if (this.frozen || this.locked)
        return;
      const t = [], r = /* @__PURE__ */ new Set(), n = new Nf(), i = (a) => {
        let p = a, s = Lr;
        for (; s === Lr; )
          p = p && p.nextSibling, s = p && this.mirror.getId(p);
        return s;
      }, o = (a) => {
        const p = re.parentNode(a);
        if (!p || !lc(a))
          return;
        let s = !1;
        if (a.nodeType === Node.TEXT_NODE) {
          const m = p.tagName;
          if (m === "TEXTAREA")
            return;
          m === "STYLE" && this.addedSet.has(p) && (s = !0);
        }
        const h = Cr(p) ? this.mirror.getId(ac(a)) : this.mirror.getId(p), d = i(a);
        if (h === -1 || d === -1)
          return n.addNode(a);
        const u = ar(a, {
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
            sc(m, this.mirror) && this.iframeManager.addIframe(m), oc(m, this.mirror) && this.stylesheetManager.trackLinkElement(
              m
            ), ts(a) && this.shadowDomManager.addShadowRoot(re.shadowRoot(a), this.doc);
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
        _a(this.removesSubTreeCache, a, this.mirror) && !this.movedSet.has(re.parentNode(a)) || o(a);
      for (const a of this.addedSet)
        !Pa(this.droppedSet, a) && !_a(this.removesSubTreeCache, a, this.mirror) || Pa(this.movedSet, a) ? o(a) : this.droppedSet.add(a);
      let l = null;
      for (; n.length; ) {
        let a = null;
        if (l) {
          const p = this.mirror.getId(re.parentNode(l.value)), s = i(l.value);
          p !== -1 && s !== -1 && (a = l);
        }
        if (!a) {
          let p = n.tail;
          for (; p; ) {
            const s = p;
            if (p = p.previous, s) {
              const h = this.mirror.getId(re.parentNode(s.value));
              if (i(s.value) === -1) continue;
              if (h !== -1) {
                a = s;
                break;
              } else {
                const u = s.value, m = re.parentNode(u);
                if (m && m.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                  const f = re.host(m);
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
          const p = a.node, s = re.parentNode(p);
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
    }), z(this, "genTextAreaValueMutation", (t) => {
      let r = this.attributeMap.get(t);
      r || (r = {
        node: t,
        attributes: {},
        styleDiff: {},
        _unchangedStyles: {}
      }, this.attributes.push(r), this.attributeMap.set(t, r));
      const n = Array.from(
        re.childNodes(t),
        (i) => re.textContent(i) || ""
      ).join("");
      r.attributes.value = on({
        element: t,
        maskInputOptions: this.maskInputOptions,
        tagName: t.tagName,
        type: an(t),
        value: n,
        maskInputFn: this.maskInputFn
      });
    }), z(this, "processMutation", (t) => {
      if (!Gi(t.target, this.mirror, this.slimDOMOptions))
        switch (t.type) {
          case "characterData": {
            const r = re.textContent(t.target);
            !Be(t.target, this.blockClass, this.blockSelector, !1) && r !== t.oldValue && this.texts.push({
              value: Pl(
                t.target,
                this.maskTextClass,
                this.maskTextSelector,
                !0
                // checkAncestors
              ) && r ? this.maskTextFn ? this.maskTextFn(r, nc(t.target)) : r.replace(/[\S]/g, "*") : r,
              node: t.target
            });
            break;
          }
          case "attributes": {
            const r = t.target;
            let n = t.attributeName, i = t.target.getAttribute(n);
            if (n === "value") {
              const l = an(r);
              i = on({
                element: r,
                maskInputOptions: this.maskInputOptions,
                tagName: r.tagName,
                type: l,
                value: i,
                maskInputFn: this.maskInputFn
              });
            }
            if (Be(t.target, this.blockClass, this.blockSelector, !1) || i === t.oldValue)
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
            }, this.attributes.push(o), this.attributeMap.set(t.target, o)), n === "type" && r.tagName === "INPUT" && (t.oldValue || "").toLowerCase() === "password" && r.setAttribute("data-rr-is-password", "true"), !_l(r.tagName, n))
              if (o.attributes[n] = Nl(
                this.doc,
                Yt(r.tagName),
                Yt(n),
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
            if (Be(t.target, this.blockClass, this.blockSelector, !0))
              return;
            if (t.target.tagName === "TEXTAREA") {
              this.genTextAreaValueMutation(t.target);
              return;
            }
            t.addedNodes.forEach((r) => this.genAdds(r, t.target)), t.removedNodes.forEach((r) => {
              const n = this.mirror.getId(r), i = Cr(t.target) ? this.mirror.getId(re.host(t.target)) : this.mirror.getId(t.target);
              Be(t.target, this.blockClass, this.blockSelector, !1) || Gi(r, this.mirror, this.slimDOMOptions) || !Af(r, this.mirror) || (this.addedSet.has(r) ? (rs(this.addedSet, r), this.droppedSet.add(r)) : this.addedSet.has(t.target) && n === -1 || ic(t.target, this.mirror) || (this.movedSet.has(r) && this.movedMap[Na(n, i)] ? rs(this.movedSet, r) : (this.removes.push({
                parentId: i,
                id: n,
                isShadow: Cr(t.target) && Er(t.target) ? !0 : void 0
              }), Pf(r, this.removesSubTreeCache))), this.mapRemoves.push(r));
            });
            break;
          }
        }
    }), z(this, "genAdds", (t, r) => {
      if (!this.processedNodeManager.inOtherBuffer(t, this) && !(this.addedSet.has(t) || this.movedSet.has(t))) {
        if (this.mirror.hasNode(t)) {
          if (Gi(t, this.mirror, this.slimDOMOptions))
            return;
          this.movedSet.add(t);
          let n = null;
          r && this.mirror.hasNode(r) && (n = this.mirror.getId(r)), n && n !== -1 && (this.movedMap[Na(this.mirror.getId(t), n)] = !0);
        } else
          this.addedSet.add(t), this.droppedSet.delete(t);
        Be(t, this.blockClass, this.blockSelector, !1) || (re.childNodes(t).forEach((n) => this.genAdds(n)), ts(t) && re.childNodes(re.shadowRoot(t)).forEach((n) => {
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
function rs(e, t) {
  e.delete(t), re.childNodes(t).forEach((r) => rs(e, r));
}
function Pf(e, t) {
  const r = [e];
  for (; r.length; ) {
    const n = r.pop();
    t.has(n) || (t.add(n), re.childNodes(n).forEach((i) => r.push(i)));
  }
}
function _a(e, t, r) {
  return e.size === 0 ? !1 : $f(e, t);
}
function $f(e, t, r) {
  const n = re.parentNode(t);
  return n ? e.has(n) : !1;
}
function Pa(e, t) {
  return e.size === 0 ? !1 : uc(e, t);
}
function uc(e, t) {
  const r = re.parentNode(t);
  return r ? e.has(r) ? !0 : uc(e, r) : !1;
}
let Mr;
function Df(e) {
  Mr = e;
}
function zf() {
  Mr = void 0;
}
const oe = (e) => Mr ? (...r) => {
  try {
    return e(...r);
  } catch (n) {
    if (Mr && Mr(n) === !0)
      return;
    throw n;
  }
} : e, jt = [];
function $r(e) {
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
function dc(e, t) {
  const r = new _f();
  jt.push(r), r.init(e);
  const [n, i] = Ql(), o = new n(
    oe(r.processMutations.bind(r))
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
function Ff({
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
  const a = Tr(
    oe(
      (h) => {
        const d = Date.now() - c;
        e(
          l.map((u) => (u.timeOffset -= d, u)),
          h
        ), l = [], c = null;
      }
    ),
    o
  ), p = oe(
    Tr(
      oe((h) => {
        const d = $r(h), { clientX: u, clientY: m } = es(h) ? h.changedTouches[0] : h;
        c || (c = Or()), l.push({
          x: u,
          y: m,
          id: n.getId(d),
          timeOffset: Or() - c
        }), a(
          typeof DragEvent < "u" && h instanceof DragEvent ? se.Drag : h instanceof MouseEvent ? se.MouseMove : se.TouchMove
        );
      }),
      i,
      {
        trailing: !1
      }
    )
  ), s = [
    Ue("mousemove", p, r),
    Ue("touchmove", p, r),
    Ue("drag", p, r)
  ];
  return oe(() => {
    s.forEach((h) => h());
  });
}
function Uf({
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
    const d = $r(h);
    if (Be(d, n, i, !0))
      return;
    let u = null, m = s;
    if ("pointerType" in h) {
      switch (h.pointerType) {
        case "mouse":
          u = wt.Mouse;
          break;
        case "touch":
          u = wt.Touch;
          break;
        case "pen":
          u = wt.Pen;
          break;
      }
      u === wt.Touch ? We[s] === We.MouseDown ? m = "TouchStart" : We[s] === We.MouseUp && (m = "TouchEnd") : wt.Pen;
    } else es(h) && (u = wt.Touch);
    u !== null ? (a = u, (m.startsWith("Touch") && u === wt.Touch || m.startsWith("Mouse") && u === wt.Mouse) && (u = null)) : We[s] === We.Click && (u = a, a = null);
    const f = es(h) ? h.changedTouches[0] : h;
    if (!f)
      return;
    const g = r.getId(d), { clientX: x, clientY: b } = f;
    oe(e)({
      type: We[m],
      id: g,
      x,
      y: b,
      ...u !== null && { pointerType: u }
    });
  };
  return Object.keys(We).filter(
    (s) => Number.isNaN(Number(s)) && !s.endsWith("_Departed") && l[s] !== !1
  ).forEach((s) => {
    let h = Yt(s);
    const d = p(s);
    if (window.PointerEvent)
      switch (We[s]) {
        case We.MouseDown:
        case We.MouseUp:
          h = h.replace(
            "mouse",
            "pointer"
          );
          break;
        case We.TouchStart:
        case We.TouchEnd:
          return;
      }
    c.push(Ue(h, d, t));
  }), oe(() => {
    c.forEach((s) => s());
  });
}
function pc({
  scrollCb: e,
  doc: t,
  mirror: r,
  blockClass: n,
  blockSelector: i,
  sampling: o
}) {
  const l = oe(
    Tr(
      oe((c) => {
        const a = $r(c);
        if (!a || Be(a, n, i, !0))
          return;
        const p = r.getId(a);
        if (a === t && t.defaultView) {
          const s = ec(t.defaultView);
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
  return Ue("scroll", l, t);
}
function Bf({ viewportResizeCb: e }, { win: t }) {
  let r = -1, n = -1;
  const i = oe(
    Tr(
      oe(() => {
        const o = tc(), l = rc();
        (r !== o || n !== l) && (e({
          width: Number(l),
          height: Number(o)
        }), r = o, n = l);
      }),
      200
    )
  );
  return Ue("resize", i, t);
}
const qf = ["INPUT", "TEXTAREA", "SELECT"], $a = /* @__PURE__ */ new WeakMap();
function Wf({
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
    let y = $r(b);
    const S = b.isTrusted, v = y && y.tagName;
    if (y && v === "OPTION" && (y = re.parentElement(y)), !y || !v || qf.indexOf(v) < 0 || Be(y, n, i, !0) || y.classList.contains(o) || l && y.matches(l))
      return;
    let k = y.value, C = !1;
    const L = an(y) || "";
    L === "radio" || L === "checkbox" ? C = y.checked : (c[v.toLowerCase()] || c[L]) && (k = on({
      element: y,
      maskInputOptions: c,
      tagName: v,
      type: L,
      value: k,
      maskInputFn: a
    })), d(
      y,
      s ? { text: k, isChecked: C, userTriggered: S } : { text: k, isChecked: C }
    );
    const N = y.name;
    L === "radio" && N && C && t.querySelectorAll(`input[type="radio"][name="${N}"]`).forEach((I) => {
      if (I !== y) {
        const V = I.value;
        d(
          I,
          s ? { text: V, isChecked: !C, userTriggered: !1 } : { text: V, isChecked: !C }
        );
      }
    });
  }
  function d(b, y) {
    const S = $a.get(b);
    if (!S || S.text !== y.text || S.isChecked !== y.isChecked) {
      $a.set(b, y);
      const v = r.getId(b);
      oe(e)({
        ...y,
        id: v
      });
    }
  }
  const m = (p.input === "last" ? ["change"] : ["input", "change"]).map(
    (b) => Ue(b, oe(h), t)
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
      (b) => In(
        b[0],
        b[1],
        {
          set() {
            oe(h)({
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
  ), oe(() => {
    m.forEach((b) => b());
  });
}
function un(e) {
  const t = [];
  function r(n, i) {
    if (Zr("CSSGroupingRule") && n.parentRule instanceof CSSGroupingRule || Zr("CSSMediaRule") && n.parentRule instanceof CSSMediaRule || Zr("CSSSupportsRule") && n.parentRule instanceof CSSSupportsRule || Zr("CSSConditionRule") && n.parentRule instanceof CSSConditionRule) {
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
function At(e, t, r) {
  let n, i;
  return e ? (e.ownerNode ? n = t.getId(e.ownerNode) : i = r.getId(e), {
    styleId: i,
    id: n
  }) : {};
}
function jf({ styleSheetRuleCb: e, mirror: t, stylesheetManager: r }, { win: n }) {
  if (!n.CSSStyleSheet || !n.CSSStyleSheet.prototype)
    return () => {
    };
  const i = n.CSSStyleSheet.prototype.insertRule;
  n.CSSStyleSheet.prototype.insertRule = new Proxy(i, {
    apply: oe(
      (s, h, d) => {
        const [u, m] = d, { id: f, styleId: g } = At(
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
    apply: oe(
      (s, h, d) => {
        const [u] = d, { id: m, styleId: f } = At(
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
    apply: oe(
      (s, h, d) => {
        const [u] = d, { id: m, styleId: f } = At(
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
    apply: oe(
      (s, h, d) => {
        const [u] = d, { id: m, styleId: f } = At(
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
  Qr("CSSGroupingRule") ? a.CSSGroupingRule = n.CSSGroupingRule : (Qr("CSSMediaRule") && (a.CSSMediaRule = n.CSSMediaRule), Qr("CSSConditionRule") && (a.CSSConditionRule = n.CSSConditionRule), Qr("CSSSupportsRule") && (a.CSSSupportsRule = n.CSSSupportsRule));
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
        apply: oe(
          (d, u, m) => {
            const [f, g] = m, { id: x, styleId: b } = At(
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
                    ...un(u),
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
        apply: oe(
          (d, u, m) => {
            const [f] = m, { id: g, styleId: x } = At(
              u.parentStyleSheet,
              t,
              r.styleMirror
            );
            return (g && g !== -1 || x && x !== -1) && e({
              id: g,
              styleId: x,
              removes: [
                { index: [...un(u), f] }
              ]
            }), d.apply(u, m);
          }
        )
      }
    );
  }), oe(() => {
    n.CSSStyleSheet.prototype.insertRule = i, n.CSSStyleSheet.prototype.deleteRule = o, l && (n.CSSStyleSheet.prototype.replace = l), c && (n.CSSStyleSheet.prototype.replaceSync = c), Object.entries(a).forEach(([s, h]) => {
      h.prototype.insertRule = p[s].insertRule, h.prototype.deleteRule = p[s].deleteRule;
    });
  });
}
function hc({
  mirror: e,
  stylesheetManager: t
}, r) {
  var n, i, o;
  let l = null;
  r.nodeName === "#document" ? l = e.getId(r) : l = e.getId(re.host(r));
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
  }), oe(() => {
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
function Hf({
  styleDeclarationCb: e,
  mirror: t,
  ignoreCSSAttributes: r,
  stylesheetManager: n
}, { win: i }) {
  const o = i.CSSStyleDeclaration.prototype.setProperty;
  i.CSSStyleDeclaration.prototype.setProperty = new Proxy(o, {
    apply: oe(
      (c, a, p) => {
        var s;
        const [h, d, u] = p;
        if (r.has(h))
          return o.apply(a, [h, d, u]);
        const { id: m, styleId: f } = At(
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
          index: un(a.parentRule)
        }), c.apply(a, p);
      }
    )
  });
  const l = i.CSSStyleDeclaration.prototype.removeProperty;
  return i.CSSStyleDeclaration.prototype.removeProperty = new Proxy(l, {
    apply: oe(
      (c, a, p) => {
        var s;
        const [h] = p;
        if (r.has(h))
          return l.apply(a, [h]);
        const { id: d, styleId: u } = At(
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
          index: un(a.parentRule)
        }), c.apply(a, p);
      }
    )
  }), oe(() => {
    i.CSSStyleDeclaration.prototype.setProperty = o, i.CSSStyleDeclaration.prototype.removeProperty = l;
  });
}
function Vf({
  mediaInteractionCb: e,
  blockClass: t,
  blockSelector: r,
  mirror: n,
  sampling: i,
  doc: o
}) {
  const l = oe(
    (a) => Tr(
      oe((p) => {
        const s = $r(p);
        if (!s || Be(s, t, r, !0))
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
    Ue("play", l(sr.Play), o),
    Ue("pause", l(sr.Pause), o),
    Ue("seeked", l(sr.Seeked), o),
    Ue("volumechange", l(sr.VolumeChange), o),
    Ue("ratechange", l(sr.RateChange), o)
  ];
  return oe(() => {
    c.forEach((a) => a());
  });
}
function Yf({ fontCb: e, doc: t }) {
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
  const l = Kt(
    t.fonts,
    "add",
    function(c) {
      return function(a) {
        return setTimeout(
          oe(() => {
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
  }), n.push(l), oe(() => {
    n.forEach((c) => c());
  });
}
function Gf(e) {
  const { doc: t, mirror: r, blockClass: n, blockSelector: i, selectionCb: o } = e;
  let l = !0;
  const c = oe(() => {
    const a = t.getSelection();
    if (!a || l && (a != null && a.isCollapsed)) return;
    l = a.isCollapsed || !1;
    const p = [], s = a.rangeCount || 0;
    for (let h = 0; h < s; h++) {
      const d = a.getRangeAt(h), { startContainer: u, startOffset: m, endContainer: f, endOffset: g } = d;
      Be(u, n, i, !0) || Be(f, n, i, !0) || p.push({
        start: r.getId(u),
        startOffset: m,
        end: r.getId(f),
        endOffset: g
      });
    }
    o({ ranges: p });
  });
  return c(), Ue("selectionchange", c);
}
function Xf({
  doc: e,
  customElementCb: t
}) {
  const r = e.defaultView;
  return !r || !r.customElements ? () => {
  } : Kt(
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
function Kf(e, t) {
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
function Jf(e, t = {}) {
  const r = e.doc.defaultView;
  if (!r)
    return () => {
    };
  Kf(e, t);
  let n, i = () => {
  };
  e.recordDOM && ([n, i] = dc(e, e.doc));
  const o = Ff(e), l = Uf(e), c = pc(e), a = Bf(e, {
    win: r
  }), p = Wf(e), s = Vf(e);
  let h = () => {
  }, d = () => {
  }, u = () => {
  }, m = () => {
  };
  e.recordDOM && (h = jf(e, { win: r }), d = hc(e, e.doc), u = Hf(e, {
    win: r
  }), e.collectFonts && (m = Yf(e)));
  const f = Gf(e), g = Xf(e), x = [];
  for (const b of e.plugins)
    x.push(
      b.observer(b.callback, r, b.options)
    );
  return oe(() => {
    jt.forEach((b) => b.reset()), n == null || n.disconnect(), i(), o(), l(), c(), a(), p(), s(), h(), d(), u(), m(), f(), g(), x.forEach((b) => b());
  });
}
function Zr(e) {
  return typeof window[e] < "u";
}
function Qr(e) {
  return !!(typeof window[e] < "u" && // Note: Generally, this check _shouldn't_ be necessary
  // However, in some scenarios (e.g. jsdom) this can sometimes fail, so we check for it here
  window[e].prototype && "insertRule" in window[e].prototype && "deleteRule" in window[e].prototype);
}
class Da {
  constructor(t) {
    z(this, "iframeIdToRemoteIdMap", /* @__PURE__ */ new WeakMap()), z(this, "iframeRemoteIdToIdMap", /* @__PURE__ */ new WeakMap()), this.generateIdFn = t;
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
class Zf {
  constructor(t) {
    z(this, "iframes", /* @__PURE__ */ new WeakMap()), z(this, "crossOriginIframeMap", /* @__PURE__ */ new WeakMap()), z(this, "crossOriginIframeMirror", new Da(Tl)), z(this, "crossOriginIframeStyleMirror"), z(this, "crossOriginIframeRootIdMap", /* @__PURE__ */ new WeakMap()), z(this, "mirror"), z(this, "mutationCb"), z(this, "wrappedEmit"), z(this, "loadListener"), z(this, "stylesheetManager"), z(this, "recordCrossOriginIframes"), this.mutationCb = t.mutationCb, this.wrappedEmit = t.wrappedEmit, this.stylesheetManager = t.stylesheetManager, this.recordCrossOriginIframes = t.recordCrossOriginIframes, this.crossOriginIframeStyleMirror = new Da(
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
      case le.FullSnapshot: {
        this.crossOriginIframeMirror.reset(t), this.crossOriginIframeStyleMirror.reset(t), this.replaceIdOnNode(r.data.node, t);
        const i = r.data.node.id;
        return this.crossOriginIframeRootIdMap.set(t, i), this.patchRootIdOnNode(r.data.node, i), {
          timestamp: r.timestamp,
          type: le.IncrementalSnapshot,
          data: {
            source: se.Mutation,
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
      case le.Meta:
      case le.Load:
      case le.DomContentLoaded:
        return !1;
      case le.Plugin:
        return r;
      case le.Custom:
        return this.replaceIds(
          r.data.payload,
          t,
          ["id", "parentId", "previousId", "nextId"]
        ), r;
      case le.IncrementalSnapshot:
        switch (r.data.source) {
          case se.Mutation:
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
          case se.Drag:
          case se.TouchMove:
          case se.MouseMove:
            return r.data.positions.forEach((i) => {
              this.replaceIds(i, t, ["id"]);
            }), r;
          case se.ViewportResize:
            return !1;
          case se.MediaInteraction:
          case se.MouseInteraction:
          case se.Scroll:
          case se.CanvasMutation:
          case se.Input:
            return this.replaceIds(r.data, t, ["id"]), r;
          case se.StyleSheetRule:
          case se.StyleDeclaration:
            return this.replaceIds(r.data, t, ["id"]), this.replaceStyleIds(r.data, t, ["styleId"]), r;
          case se.Font:
            return r;
          case se.Selection:
            return r.data.ranges.forEach((i) => {
              this.replaceIds(i, t, ["start", "end"]);
            }), r;
          case se.AdoptedStyleSheet:
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
    t.type !== cc.Document && !t.rootId && (t.rootId = r), "childNodes" in t && t.childNodes.forEach((n) => {
      this.patchRootIdOnNode(n, r);
    });
  }
}
class Qf {
  constructor(t) {
    z(this, "shadowDoms", /* @__PURE__ */ new WeakSet()), z(this, "mutationCb"), z(this, "scrollCb"), z(this, "bypassOptions"), z(this, "mirror"), z(this, "restoreHandlers", []), this.mutationCb = t.mutationCb, this.scrollCb = t.scrollCb, this.bypassOptions = t.bypassOptions, this.mirror = t.mirror, this.init();
  }
  init() {
    this.reset(), this.patchAttachShadow(Element, document);
  }
  addShadowRoot(t, r) {
    if (!Er(t) || this.shadowDoms.has(t)) return;
    this.shadowDoms.add(t);
    const [n] = dc(
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
      pc({
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
        this.mirror.getId(re.host(t))
      ), this.restoreHandlers.push(
        hc(
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
      Kt(
        t.prototype,
        "attachShadow",
        function(i) {
          return function(o) {
            const l = i.call(this, o), c = re.shadowRoot(this);
            return c && lc(this) && n.addShadowRoot(c, r), l;
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
var lr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", em = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (var en = 0; en < lr.length; en++)
  em[lr.charCodeAt(en)] = en;
var tm = function(e) {
  var t = new Uint8Array(e), r, n = t.length, i = "";
  for (r = 0; r < n; r += 3)
    i += lr[t[r] >> 2], i += lr[(t[r] & 3) << 4 | t[r + 1] >> 4], i += lr[(t[r + 1] & 15) << 2 | t[r + 2] >> 6], i += lr[t[r + 2] & 63];
  return n % 3 === 2 ? i = i.substring(0, i.length - 1) + "=" : n % 3 === 1 && (i = i.substring(0, i.length - 2) + "=="), i;
};
const za = /* @__PURE__ */ new Map();
function rm(e, t) {
  let r = za.get(e);
  return r || (r = /* @__PURE__ */ new Map(), za.set(e, r)), r.has(t) || r.set(t, []), r.get(t);
}
const fc = (e, t, r) => {
  if (!e || !(gc(e, t) || typeof e == "object"))
    return;
  const n = e.constructor.name, i = rm(r, n);
  let o = i.indexOf(e);
  return o === -1 && (o = i.length, i.push(e)), o;
};
function tn(e, t, r) {
  if (e instanceof Array)
    return e.map((n) => tn(n, t, r));
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
    const n = e.constructor.name, i = tm(e);
    return {
      rr_type: n,
      base64: i
    };
  } else {
    if (e instanceof DataView)
      return {
        rr_type: e.constructor.name,
        args: [
          tn(e.buffer, t, r),
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
          args: [tn(e.data, t, r), e.width, e.height]
        };
      if (gc(e, t) || typeof e == "object") {
        const n = e.constructor.name, i = fc(e, t, r);
        return {
          rr_type: n,
          index: i
        };
      }
    }
  }
  return e;
}
const mc = (e, t, r) => e.map((n) => tn(n, t, r)), gc = (e, t) => !![
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
function nm(e, t, r, n) {
  const i = [], o = Object.getOwnPropertyNames(
    t.CanvasRenderingContext2D.prototype
  );
  for (const l of o)
    try {
      if (typeof t.CanvasRenderingContext2D.prototype[l] != "function")
        continue;
      const c = Kt(
        t.CanvasRenderingContext2D.prototype,
        l,
        function(a) {
          return function(...p) {
            return Be(this.canvas, r, n, !0) || setTimeout(() => {
              const s = mc(p, t, this);
              e(this.canvas, {
                type: gr["2D"],
                property: l,
                args: s
              });
            }, 0), a.apply(this, p);
          };
        }
      );
      i.push(c);
    } catch {
      const c = In(
        t.CanvasRenderingContext2D.prototype,
        l,
        {
          set(a) {
            e(this.canvas, {
              type: gr["2D"],
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
function im(e) {
  return e === "experimental-webgl" ? "webgl" : e;
}
function Fa(e, t, r, n) {
  const i = [];
  try {
    const o = Kt(
      e.HTMLCanvasElement.prototype,
      "getContext",
      function(l) {
        return function(c, ...a) {
          if (!Be(this, t, r, !0)) {
            const p = im(c);
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
function Ua(e, t, r, n, i, o) {
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
        const p = Kt(
          e,
          a,
          function(s) {
            return function(...h) {
              const d = s.apply(this, h);
              if (fc(d, o, this), "tagName" in this.canvas && !Be(this.canvas, n, i, !0)) {
                const u = mc(h, o, this), m = {
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
        const p = In(e, a, {
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
function sm(e, t, r, n) {
  const i = [];
  return typeof t.WebGLRenderingContext < "u" && i.push(
    ...Ua(
      t.WebGLRenderingContext.prototype,
      gr.WebGL,
      e,
      r,
      n,
      t
    )
  ), typeof t.WebGL2RenderingContext < "u" && i.push(
    ...Ua(
      t.WebGL2RenderingContext.prototype,
      gr.WebGL2,
      e,
      r,
      n,
      t
    )
  ), () => {
    i.forEach((o) => o());
  };
}
const yc = `(function() {
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
`, Ba = typeof self < "u" && self.Blob && new Blob([yc], { type: "text/javascript;charset=utf-8" });
function om(e) {
  let t;
  try {
    if (t = Ba && (self.URL || self.webkitURL).createObjectURL(Ba), !t) throw "";
    const r = new Worker(t, {
      name: e == null ? void 0 : e.name
    });
    return r.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(t);
    }), r;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(yc),
      {
        name: e == null ? void 0 : e.name
      }
    );
  } finally {
    t && (self.URL || self.webkitURL).revokeObjectURL(t);
  }
}
class am {
  constructor(t) {
    z(this, "pendingCanvasMutations", /* @__PURE__ */ new Map()), z(this, "rafStamps", { latestId: 0, invokeId: null }), z(this, "mirror"), z(this, "mutationCb"), z(this, "resetObservers"), z(this, "frozen", !1), z(this, "locked", !1), z(this, "processMutation", (a, p) => {
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
    const l = Fa(
      r,
      n,
      i,
      !0
    ), c = /* @__PURE__ */ new Map(), a = new om();
    a.onmessage = (m) => {
      const { id: f } = m.data;
      if (c.set(f, !1), !("base64" in m.data)) return;
      const { base64: g, type: x, width: b, height: y } = m.data;
      this.mutationCb({
        id: f,
        type: gr["2D"],
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
        Be(f, n, i, !0) || m.push(f);
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
    const i = Fa(
      t,
      r,
      n,
      !1
    ), o = nm(
      this.processMutation.bind(this),
      t,
      r,
      n
    ), l = sm(
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
class lm {
  constructor(t) {
    z(this, "trackedLinkElements", /* @__PURE__ */ new WeakSet()), z(this, "mutationCb"), z(this, "adoptedStyleSheetCb"), z(this, "styleMirror", new Lf()), this.mutationCb = t.mutationCb, this.adoptedStyleSheetCb = t.adoptedStyleSheetCb;
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
          rule: Il(c, o.href),
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
class cm {
  constructor() {
    z(this, "nodeMap", /* @__PURE__ */ new WeakMap()), z(this, "active", !1);
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
let we, rn, Xi, dn = !1;
try {
  if (Array.from([1], (e) => e * 2)[0] !== 2) {
    const e = document.createElement("iframe");
    document.body.appendChild(e), Array.from = ((bo = e.contentWindow) == null ? void 0 : bo.Array.from) || Array.from, document.body.removeChild(e);
  }
} catch (e) {
  console.debug("Unable to override Array.from", e);
}
const rt = mh();
function Tt(e = {}) {
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
    mousemoveWait: S,
    recordDOM: v = !0,
    recordCanvas: k = !1,
    recordCrossOriginIframes: C = !1,
    recordAfter: L = e.recordAfter === "DOMContentLoaded" ? e.recordAfter : "load",
    userTriggeredOnInput: N = !1,
    collectFonts: I = !1,
    inlineImages: V = !1,
    plugins: W,
    keepIframeSrcFn: R = () => !1,
    ignoreCSSAttributes: he = /* @__PURE__ */ new Set([]),
    errorHandler: Ce
  } = e;
  Df(Ce);
  const ce = C ? window.parent === window : !0;
  let te = !1;
  if (!ce)
    try {
      window.parent.document && (te = !1);
    } catch {
      te = !0;
    }
  if (ce && !t)
    throw new Error("emit function is required");
  if (!ce && !te)
    return () => {
    };
  S !== void 0 && b.mousemove === void 0 && (b.mousemove = S), rt.reset();
  const de = h === !0 ? {
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
  } : d !== void 0 ? d : { password: !0 }, Ae = $l(u);
  If();
  let be, K = 0;
  const ve = ($) => {
    for (const ye of W || [])
      ye.eventProcessor && ($ = ye.eventProcessor($));
    return x && // Disable packing events which will be emitted to parent frames.
    !te && ($ = x($)), $;
  };
  we = ($, ye) => {
    var X;
    const fe = $;
    if (fe.timestamp = Or(), (X = jt[0]) != null && X.isFrozen() && fe.type !== le.FullSnapshot && !(fe.type === le.IncrementalSnapshot && fe.data.source === se.Mutation) && jt.forEach((De) => De.unfreeze()), ce)
      t == null || t(ve(fe), ye);
    else if (te) {
      const De = {
        type: "rrweb",
        event: ve(fe),
        origin: window.location.origin,
        isCheckout: ye
      };
      window.parent.postMessage(De, "*");
    }
    if (fe.type === le.FullSnapshot)
      be = fe, K = 0;
    else if (fe.type === le.IncrementalSnapshot) {
      if (fe.data.source === se.Mutation && fe.data.isAttachIframe)
        return;
      K++;
      const De = n && K >= n, ue = r && fe.timestamp - be.timestamp > r;
      (De || ue) && rn(!0);
    }
  };
  const _ = ($) => {
    we({
      type: le.IncrementalSnapshot,
      data: {
        source: se.Mutation,
        ...$
      }
    });
  }, je = ($) => we({
    type: le.IncrementalSnapshot,
    data: {
      source: se.Scroll,
      ...$
    }
  }), Ie = ($) => we({
    type: le.IncrementalSnapshot,
    data: {
      source: se.CanvasMutation,
      ...$
    }
  }), Ct = ($) => we({
    type: le.IncrementalSnapshot,
    data: {
      source: se.AdoptedStyleSheet,
      ...$
    }
  }), Le = new lm({
    mutationCb: _,
    adoptedStyleSheetCb: Ct
  }), He = new Zf({
    mirror: rt,
    mutationCb: _,
    stylesheetManager: Le,
    recordCrossOriginIframes: C,
    wrappedEmit: we
  });
  for (const $ of W || [])
    $.getMirror && $.getMirror({
      nodeMirror: rt,
      crossOriginIframeMirror: He.crossOriginIframeMirror,
      crossOriginIframeStyleMirror: He.crossOriginIframeStyleMirror
    });
  const ct = new cm();
  Xi = new am({
    recordCanvas: k,
    mutationCb: Ie,
    win: window,
    blockClass: i,
    blockSelector: o,
    mirror: rt,
    sampling: b.canvas,
    dataURLOptions: y
  });
  const $e = new Qf({
    mutationCb: _,
    scrollCb: je,
    bypassOptions: {
      blockClass: i,
      blockSelector: o,
      maskTextClass: a,
      maskTextSelector: p,
      inlineStylesheet: s,
      maskInputOptions: de,
      dataURLOptions: y,
      maskTextFn: f,
      maskInputFn: m,
      recordCanvas: k,
      inlineImages: V,
      sampling: b,
      slimDOMOptions: Ae,
      iframeManager: He,
      stylesheetManager: Le,
      canvasManager: Xi,
      keepIframeSrcFn: R,
      processedNodeManager: ct
    },
    mirror: rt
  });
  rn = ($ = !1) => {
    if (!v)
      return;
    we(
      {
        type: le.Meta,
        data: {
          href: window.location.href,
          width: rc(),
          height: tc()
        }
      },
      $
    ), Le.reset(), $e.init(), jt.forEach((X) => X.lock());
    const ye = Fh(document, {
      mirror: rt,
      blockClass: i,
      blockSelector: o,
      maskTextClass: a,
      maskTextSelector: p,
      inlineStylesheet: s,
      maskAllInputs: de,
      maskTextFn: f,
      maskInputFn: m,
      slimDOM: Ae,
      dataURLOptions: y,
      recordCanvas: k,
      inlineImages: V,
      onSerialize: (X) => {
        sc(X, rt) && He.addIframe(X), oc(X, rt) && Le.trackLinkElement(X), ts(X) && $e.addShadowRoot(re.shadowRoot(X), document);
      },
      onIframeLoad: (X, fe) => {
        He.attachIframe(X, fe), $e.observeAttachShadow(X);
      },
      onStylesheetLoad: (X, fe) => {
        Le.attachLinkElement(X, fe);
      },
      keepIframeSrcFn: R
    });
    if (!ye)
      return console.warn("Failed to snapshot the document");
    we(
      {
        type: le.FullSnapshot,
        data: {
          node: ye,
          initialOffset: ec(window)
        }
      },
      $
    ), jt.forEach((X) => X.unlock()), document.adoptedStyleSheets && document.adoptedStyleSheets.length > 0 && Le.adoptStyleSheets(
      document.adoptedStyleSheets,
      rt.getId(document)
    );
  };
  try {
    const $ = [], ye = (fe) => {
      var De;
      return oe(Jf)(
        {
          mutationCb: _,
          mousemoveCb: (ue, Ee) => we({
            type: le.IncrementalSnapshot,
            data: {
              source: Ee,
              positions: ue
            }
          }),
          mouseInteractionCb: (ue) => we({
            type: le.IncrementalSnapshot,
            data: {
              source: se.MouseInteraction,
              ...ue
            }
          }),
          scrollCb: je,
          viewportResizeCb: (ue) => we({
            type: le.IncrementalSnapshot,
            data: {
              source: se.ViewportResize,
              ...ue
            }
          }),
          inputCb: (ue) => we({
            type: le.IncrementalSnapshot,
            data: {
              source: se.Input,
              ...ue
            }
          }),
          mediaInteractionCb: (ue) => we({
            type: le.IncrementalSnapshot,
            data: {
              source: se.MediaInteraction,
              ...ue
            }
          }),
          styleSheetRuleCb: (ue) => we({
            type: le.IncrementalSnapshot,
            data: {
              source: se.StyleSheetRule,
              ...ue
            }
          }),
          styleDeclarationCb: (ue) => we({
            type: le.IncrementalSnapshot,
            data: {
              source: se.StyleDeclaration,
              ...ue
            }
          }),
          canvasMutationCb: Ie,
          fontCb: (ue) => we({
            type: le.IncrementalSnapshot,
            data: {
              source: se.Font,
              ...ue
            }
          }),
          selectionCb: (ue) => {
            we({
              type: le.IncrementalSnapshot,
              data: {
                source: se.Selection,
                ...ue
              }
            });
          },
          customElementCb: (ue) => {
            we({
              type: le.IncrementalSnapshot,
              data: {
                source: se.CustomElement,
                ...ue
              }
            });
          },
          blockClass: i,
          ignoreClass: l,
          ignoreSelector: c,
          maskTextClass: a,
          maskTextSelector: p,
          maskInputOptions: de,
          inlineStylesheet: s,
          sampling: b,
          recordDOM: v,
          recordCanvas: k,
          inlineImages: V,
          userTriggeredOnInput: N,
          collectFonts: I,
          doc: fe,
          maskInputFn: m,
          maskTextFn: f,
          keepIframeSrcFn: R,
          blockSelector: o,
          slimDOMOptions: Ae,
          dataURLOptions: y,
          mirror: rt,
          iframeManager: He,
          stylesheetManager: Le,
          shadowDomManager: $e,
          processedNodeManager: ct,
          canvasManager: Xi,
          ignoreCSSAttributes: he,
          plugins: ((De = W == null ? void 0 : W.filter((ue) => ue.observer)) == null ? void 0 : De.map((ue) => ({
            observer: ue.observer,
            options: ue.options,
            callback: (Ee) => we({
              type: le.Plugin,
              data: {
                plugin: ue.name,
                payload: Ee
              }
            })
          }))) || []
        },
        g
      );
    };
    He.addLoadListener((fe) => {
      try {
        $.push(ye(fe.contentDocument));
      } catch (De) {
        console.warn(De);
      }
    });
    const X = () => {
      rn(), $.push(ye(document)), dn = !0;
    };
    return ["interactive", "complete"].includes(document.readyState) ? X() : ($.push(
      Ue("DOMContentLoaded", () => {
        we({
          type: le.DomContentLoaded,
          data: {}
        }), L === "DOMContentLoaded" && X();
      })
    ), $.push(
      Ue(
        "load",
        () => {
          we({
            type: le.Load,
            data: {}
          }), L === "load" && X();
        },
        window
      )
    )), () => {
      $.forEach((fe) => {
        try {
          fe();
        } catch (De) {
          String(De).toLowerCase().includes("cross-origin") || console.warn(De);
        }
      }), ct.destroy(), dn = !1, zf();
    };
  } catch ($) {
    console.warn($);
  }
}
Tt.addCustomEvent = (e, t) => {
  if (!dn)
    throw new Error("please add custom event after start recording");
  we({
    type: le.Custom,
    data: {
      tag: e,
      payload: t
    }
  });
};
Tt.freezePage = () => {
  jt.forEach((e) => e.freeze());
};
Tt.takeFullSnapshot = (e) => {
  if (!dn)
    throw new Error("please take full snapshot after start recording");
  rn(e);
};
Tt.mirror = rt;
var qa;
(function(e) {
  e[e.NotStarted = 0] = "NotStarted", e[e.Running = 1] = "Running", e[e.Stopped = 2] = "Stopped";
})(qa || (qa = {}));
const { addCustomEvent: Zm } = Tt, { freezePage: Qm } = Tt, { takeFullSnapshot: eg } = Tt, Ki = 2, um = 4;
class dm {
  constructor(t) {
    qr(this, "events", []);
    qr(this, "lastMeta", null);
    qr(this, "lastFull", null);
    this.opts = t;
  }
  push(t) {
    t.type === um && (this.lastMeta = t), t.type === Ki && (this.lastFull = t, this.events = []), this.events.push(t), this.prune();
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
    return !this.events.some((n) => n.type === Ki) && this.lastFull && (this.lastMeta && t.push(this.lastMeta), t.push(this.lastFull)), [...t, ...this.events];
  }
  /** True when the buffer can produce a scrubbable replay (a full snapshot + at least one more event). */
  isPlayable() {
    const t = this.snapshot();
    return t.some((n) => n.type === Ki) && t.length >= 2;
  }
  clear() {
    this.events = [], this.lastMeta = null, this.lastFull = null;
  }
}
function pm(e, t = {}) {
  const r = new dm({
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
const bc = "klav-sims-live", vc = "klav-sims-overlay", Wa = "klav-sims-ext-css";
let it = null, qt = null, Xe = null, cr = null;
const pn = /* @__PURE__ */ new Map(), Je = /* @__PURE__ */ new Map();
let kc = 0, bt = !1, Ht = null, pr = null, Dr = !1, Fe = null, xr = null, It = null, Lt = null, st = null, Vt = null, nt = null, gt = null, ot = null, ur = null;
const hn = /* @__PURE__ */ new Set();
function hm(e) {
  return String(e || "").trim().toLowerCase().replace(/\s+/g, " ");
}
function wc(e, t) {
  return `${e}::${hm(t.text)}`;
}
function xc(e) {
  try {
    document.dispatchEvent(new CustomEvent("klavity:sims-live", { detail: { active: e } }));
  } catch {
  }
}
const fm = `
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
`, mm = `
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
function ja(e, t) {
  const r = e.replace("#", ""), n = (c) => parseInt(c, 16), [i, o, l] = r.length === 3 ? [n(r[0] + r[0]), n(r[1] + r[1]), n(r[2] + r[2])] : [n(r.slice(0, 2)), n(r.slice(2, 4)), n(r.slice(4, 6))];
  return `rgba(${i},${o},${l},${t})`;
}
function gm(e) {
  if (e.suggestedBug) return !0;
  const t = String(e.priority ?? "").trim().toLowerCase();
  if (t && t !== "none") return !0;
  const r = String(e.sentiment ?? "").trim().toLowerCase();
  return r ? !(/* @__PURE__ */ new Set(["positive", "satisfied", "delighted", "neutral", "none"])).has(r) : !1;
}
function ns() {
  var e, t;
  try {
    return ((t = (e = window.matchMedia) == null ? void 0 : e.call(window, "(prefers-reduced-motion: reduce)")) == null ? void 0 : t.matches) ?? !1;
  } catch {
    return !1;
  }
}
function ym(e) {
  return new Promise((t) => setTimeout(t, e));
}
function hr(e) {
  const t = String(e.priority ?? "").trim().toLowerCase();
  return t === "high" || t === "critical" || t === "urgent" ? "HIGH" : t === "medium" || t === "med" ? "MED" : t === "low" ? "LOW" : e.suggestedBug ? "HIGH" : null;
}
const Sc = { HIGH: "h", MED: "m", LOW: "l" }, Ha = { HIGH: 0, MED: 1, LOW: 2 };
function bm(e) {
  if (!e) return !1;
  if (e === Xe || e === it || e.id === vc || e.id === bc || e.id === "klavity-widget-host") return !0;
  const t = e.classList;
  return !!t && t.contains("klav-halo");
}
function vm(e) {
  const t = [];
  for (const r of [Xe, it])
    r && (t.push({ el: r, vis: r.style.visibility }), r.style.visibility = "hidden");
  try {
    return e();
  } finally {
    for (const { el: r, vis: n } of t) r.style.visibility = n;
  }
}
function Cc(e) {
  const t = e.targetViewport;
  return {
    scrollX: Number.isFinite(t == null ? void 0 : t.scrollX) ? Number(t.scrollX) : window.scrollX,
    scrollY: Number.isFinite(t == null ? void 0 : t.scrollY) ? Number(t.scrollY) : window.scrollY,
    width: Math.max(1, Number.isFinite(t == null ? void 0 : t.width) ? Number(t.width) : window.innerWidth),
    height: Math.max(1, Number.isFinite(t == null ? void 0 : t.height) ? Number(t.height) : window.innerHeight)
  };
}
function Ec(e, t) {
  return new DOMRect(
    t.scrollX + e.x * t.width,
    t.scrollY + e.y * t.height,
    Math.max(1, e.w * t.width),
    Math.max(1, e.h * t.height)
  );
}
function Va(e) {
  return Math.max(0, e.width) * Math.max(0, e.height);
}
function km(e, t) {
  const r = Math.max(e.left, t.left), n = Math.min(e.right, t.right), i = Math.max(e.top, t.top), o = Math.min(e.bottom, t.bottom);
  return Math.max(0, n - r) * Math.max(0, o - i);
}
function wm(e) {
  return new DOMRect(e.left + window.scrollX, e.top + window.scrollY, e.width, e.height);
}
function Mc(e) {
  if (!e || !(e instanceof HTMLElement) || e === document.body || e === document.documentElement || bm(e)) return !1;
  const t = e.getBoundingClientRect();
  if (t.width < 8 || t.height < 8) return !1;
  try {
    const r = getComputedStyle(e);
    if (r.display === "none" || r.visibility === "hidden" || Number(r.opacity) === 0) return !1;
  } catch {
  }
  return !0;
}
function xm(e, t) {
  return vm(() => {
    const r = /* @__PURE__ */ new Set(), n = [], i = (l) => {
      let c = l;
      for (; c && c !== document.body && c !== document.documentElement; )
        !r.has(c) && Mc(c) && (r.add(c), n.push(c)), c = c.parentElement;
    }, o = typeof document.elementsFromPoint == "function" ? document.elementsFromPoint(e, t) : [document.elementFromPoint(e, t)].filter(Boolean);
    for (const l of o) i(l);
    return n;
  });
}
function Sm(e, t) {
  const r = Cc(t), n = Ec(e, r), i = Math.max(2, Math.min(window.innerWidth - 2, n.left + n.width / 2 - window.scrollX)), o = Math.max(2, Math.min(window.innerHeight - 2, n.top + n.height / 2 - window.scrollY)), l = xm(i, o);
  if (!l.length) return null;
  const c = Math.max(1, Va(n));
  let a = null, p = -1 / 0;
  for (const s of l) {
    const h = wm(s.getBoundingClientRect()), d = km(h, n);
    if (d <= 0) continue;
    const u = Math.max(1, Va(h)), m = d / c, f = Math.max(0, (u - d) / u), g = s.tagName.toLowerCase(), x = /^(button|a|input|textarea|select|label|section|article|nav|header|footer|main|form)$/.test(g) ? 0.18 : 0, b = u > window.innerWidth * window.innerHeight * 0.92 ? 0.8 : 0, y = m - f * 0.35 + x - b;
    y > p && (a = s, p = y);
  }
  return a ?? l[0] ?? null;
}
async function Cm(e, t) {
  if (e >= window.scrollX + 80 && e <= window.scrollX + window.innerWidth - 80 && t >= window.scrollY + 80 && t <= window.scrollY + window.innerHeight - 80) return;
  const i = Math.max(0, document.documentElement.scrollHeight - window.innerHeight), o = Math.max(0, document.documentElement.scrollWidth - window.innerWidth), l = Math.max(0, Math.min(i, t - window.innerHeight * 0.38)), c = Math.max(0, Math.min(o, e - window.innerWidth * 0.45));
  try {
    window.scrollTo({ top: l, left: c, behavior: ns() ? "auto" : "smooth" });
  } catch {
    window.scrollTo(c, l);
  }
  await ym(ns() ? 80 : 520);
}
const Em = /* @__PURE__ */ new Set([
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
function Mm(e) {
  const t = /* @__PURE__ */ new Set();
  return String(e || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((r) => r.length < 4 || Em.has(r) || t.has(r) ? !1 : (t.add(r), !0));
}
function Rm(e) {
  const t = Mm(e.text);
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
    if (!Mc(l)) continue;
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
async function Am(e, t = {}) {
  if (e.region) {
    const r = Cc(e), n = Ec(e.region, r);
    t.scroll !== !1 && await Cm(n.left + n.width / 2, n.top + n.height / 2);
    const i = Sm(e.region, e);
    if (i) return i;
  }
  return Rm(e);
}
function Im() {
  if (it && qt) return qt;
  it = document.createElement("div"), it.id = bc, it.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;", qt = it.attachShadow({ mode: "open" }), Dp(qt);
  const e = document.createElement("style");
  return e.textContent = fm, qt.appendChild(e), document.body.appendChild(it), qt;
}
function Rc() {
  if (Xe) return Xe;
  if (!document.getElementById(Wa)) {
    const e = document.createElement("style");
    e.id = Wa, e.textContent = mm, document.head.appendChild(e);
  }
  return Xe = document.createElement("div"), Xe.id = vc, Xe.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;z-index:2147483640;pointer-events:none;overflow:visible;", document.body.appendChild(Xe), Xe;
}
function Ac(e, t) {
  return Pp({
    name: e.name,
    initials: e.initials,
    photoUrl: e.photoUrl,
    color: e.accent,
    animate: !1,
    legs: !0,
    size: t
  });
}
function Lm(e, t = [], r = {}) {
  if (typeof document > "u") return;
  ss();
  const n = Im();
  Rc(), cr = new AbortController();
  const i = e === "all" ? t : t.filter((h) => e.includes(h.id));
  if (!i.length) {
    console.warn("[KlavitySims] deploy(): no matching Sims — panel not mounted."), ss();
    return;
  }
  i.slice(0, 8).forEach((h) => {
    const d = h.accent || "#6366f1", u = h.initials || h.name.slice(0, 2).toUpperCase();
    pn.set(h.id, { simId: h.id, accent: d, initials: u, name: h.name, photoUrl: h.photoUrl });
  });
  const o = document.createElement("div");
  o.className = "ksl-root", n.appendChild(o), ot = document.createElement("div"), ot.className = "ksl-sr", ot.id = "ksl-announcer", ot.setAttribute("aria-live", "polite"), ot.setAttribute("aria-atomic", "true"), o.appendChild(ot), Fe = document.createElement("button"), Fe.type = "button", Fe.className = "ksl-launcher", Fe.setAttribute("aria-label", "Open Sims feedback panel"), Fe.addEventListener("click", () => Om());
  const l = document.createElement("span");
  l.className = "ksl-pill", xr = document.createElement("span"), xr.className = "ksl-pill-avatars", It = document.createElement("span"), It.className = "ksl-pill-txt", l.append(xr, It), Lt = document.createElement("span"), Lt.className = "ksl-pill-badge", Lt.hidden = !0, Fe.append(l, Lt), o.appendChild(Fe), i.slice(0, 3).forEach((h) => {
    const d = pn.get(h.id);
    d && xr.appendChild(Ac(d, 26));
  }), st = document.createElement("section"), st.className = "ksl-panel", st.setAttribute("aria-label", "Sims feedback"), st.setAttribute("role", "dialog");
  const c = document.createElement("div");
  c.className = "ksl-head";
  const a = document.createElement("div");
  a.className = "ksl-title-row";
  const p = document.createElement("div");
  p.className = "ksl-title", p.textContent = "Sims feedback";
  const s = document.createElement("button");
  s.type = "button", s.className = "ksl-icon-btn", s.title = "Minimize", s.setAttribute("aria-label", "Minimize Sims feedback panel"), s.innerHTML = Z("x", { size: 15 }), s.addEventListener("click", () => Ya()), a.append(p, s), Vt = document.createElement("div"), Vt.className = "ksl-count", nt = document.createElement("div"), nt.className = "ksl-chips", c.append(a, Vt, nt), gt = document.createElement("div"), gt.className = "ksl-list", gt.setAttribute("role", "list"), st.append(c, gt), o.appendChild(st), document.addEventListener("keydown", (h) => {
    h.key === "Escape" && bt && Ya();
  }, { signal: cr.signal }), xc(!0), br();
}
function Ic(e) {
  Dr = e, Fe == null || Fe.classList.toggle("is-reviewing", e), br(), bt && yr();
}
function Om() {
  !st || !Fe || (bt = !0, st.classList.add("is-open"), Fe.hidden = !0, yr());
}
function Ya() {
  !st || !Fe || (bt = !1, st.classList.remove("is-open"), Fe.hidden = !1, br());
}
function Lc() {
  const e = Array.from(Je.values()), t = new Set(e.map((n) => n.entry.simId)), r = e.filter((n) => hr(n.obs) === "HIGH").length;
  return { total: e.length, sims: t.size, high: r };
}
function br() {
  const e = Lc();
  It && (Dr && e.total === 0 ? It.innerHTML = "Your Sims are reviewing…" : e.total === 0 ? It.innerHTML = "Sims are watching this page" : It.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from your Sims`), Lt && (Lt.hidden = e.high === 0, Lt.textContent = `${e.high} high`), bt && Oc(e);
}
function Oc(e) {
  Vt && (e.total === 0 ? Vt.innerHTML = Dr ? "Your Sims are reviewing this page…" : "No findings yet — your Sims are watching." : Vt.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from <b>${e.sims}</b> Sim${e.sims === 1 ? "" : "s"}` + (e.high > 0 ? ` · <span class="ksl-hi">${e.high} high</span>` : "")), Tm();
}
function Tm() {
  if (!nt) return;
  const e = Array.from(Je.values());
  if (nt.hidden = e.length === 0, nt.textContent = "", !e.length) return;
  const t = document.createElement("span");
  t.className = "ksl-chips-label", t.textContent = "Sim", nt.appendChild(t);
  const r = /* @__PURE__ */ new Map();
  e.forEach((i) => {
    const o = r.get(i.entry.simId) ?? { entry: i.entry, n: 0 };
    o.n += 1, r.set(i.entry.simId, o);
  }), r.forEach(({ entry: i, n: o }) => {
    const l = document.createElement("button");
    l.type = "button", l.className = "ksl-chip" + (Ht === i.simId ? " is-on" : ""), l.setAttribute("aria-pressed", String(Ht === i.simId));
    const c = document.createElement("span");
    c.className = "ksl-dot", c.style.background = i.accent, l.append(c, document.createTextNode(`${i.initials} · ${o}`)), l.addEventListener("click", () => {
      Ht = Ht === i.simId ? null : i.simId, yr();
    }), nt.appendChild(l);
  });
  const n = document.createElement("span");
  n.className = "ksl-chips-label", n.style.marginLeft = "6px", n.textContent = "Priority", nt.appendChild(n), ["HIGH", "MED", "LOW"].forEach((i) => {
    const o = e.filter((a) => hr(a.obs) === i).length;
    if (!o) return;
    const l = document.createElement("button");
    l.type = "button";
    const c = pr === i;
    l.className = "ksl-chip" + (c ? ` sev-on-${Sc[i]}` : ""), l.setAttribute("aria-pressed", String(c)), l.textContent = `${i} · ${o}`, l.addEventListener("click", () => {
      pr = pr === i ? null : i, yr();
    }), nt.appendChild(l);
  });
}
function Nm() {
  return Array.from(Je.values()).filter((e) => !Ht || e.entry.simId === Ht).filter((e) => !pr || hr(e.obs) === pr).sort((e, t) => {
    const r = hr(e.obs), n = hr(t.obs), i = r ? Ha[r] : 3, o = n ? Ha[n] : 3;
    return i - o;
  });
}
function _m(e) {
  const { entry: t, obs: r } = e, n = hr(r), i = document.createElement("div");
  i.className = "ksl-row", i.setAttribute("role", "listitem"), i.dataset.id = e.id, i.style.borderLeftColor = t.accent;
  const o = document.createElement("div");
  o.className = "ksl-r-head", o.appendChild(Ac(t, 26));
  const l = document.createElement("span");
  l.className = "ksl-r-name", l.style.color = t.accent, l.textContent = t.name, o.appendChild(l);
  const c = String(r.sentiment ?? "").trim();
  if (c) {
    const m = document.createElement("span");
    m.className = "ksl-r-sent", m.textContent = c, o.appendChild(m);
  }
  if (n) {
    const m = document.createElement("span");
    m.className = `ksl-sev ${Sc[n]}`, m.setAttribute("aria-label", `Priority: ${n}`), m.textContent = n, o.appendChild(m);
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
  h.type = "button", h.className = "ksl-r-act track", h.innerHTML = Z("bug", { size: 12 }) + " Track as Bug", h.setAttribute("aria-label", `Track feedback from ${t.name} as a bug`), h.addEventListener("click", () => {
    var m;
    (m = nn.onTriage) == null || m.call(nn, r, t.name), Ga(e.id);
  });
  const d = document.createElement("button");
  d.type = "button", d.className = "ksl-r-act jump", d.innerHTML = Z("map-pin", { size: 12 }) + " Jump to on page", d.setAttribute("aria-label", `Jump to where ${t.name} flagged this`), d.addEventListener("click", () => {
    $m(e.id);
  });
  const u = document.createElement("button");
  return u.type = "button", u.className = "ksl-r-act dismiss", u.textContent = "Dismiss", u.setAttribute("aria-label", `Dismiss feedback from ${t.name}`), u.addEventListener("click", () => {
    Ga(e.id);
  }), s.append(h, d, u), i.appendChild(s), i;
}
function Pm(e) {
  e.querySelectorAll(".ksl-row").forEach((t) => {
    const r = t.querySelector(".ksl-r-obs");
    r && r.scrollHeight - r.clientHeight > 4 && t.classList.add("is-clamped");
  });
}
function yr() {
  if (!gt || !bt) {
    br();
    return;
  }
  const e = Lc();
  Oc(e);
  const t = Nm();
  if (gt.textContent = "", !t.length) {
    const n = document.createElement("div");
    n.className = "ksl-empty";
    const i = Je.size > 0;
    if (Dr && !i) {
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
    gt.appendChild(n), Je.forEach((o) => {
      o.rowEl = null;
    });
    return;
  }
  t.forEach((n) => {
    const i = _m(n);
    n.rowEl = i, gt.appendChild(i);
  });
  const r = new Set(t.map((n) => n.id));
  Je.forEach((n) => {
    r.has(n.id) || (n.rowEl = null);
  }), Pm(gt);
}
function is() {
  ur == null || ur(), ur = null;
}
async function $m(e) {
  const t = Je.get(e);
  if (!t) return;
  const r = await Am(t.obs, { scroll: !0 });
  !r || !Xe || Dm(r, t.entry.accent);
}
function Dm(e, t) {
  is();
  const r = Rc(), n = document.createElement("div");
  n.className = "klav-halo", n.style.borderColor = t, n.style.boxShadow = `0 0 0 4px ${ja(t, 0.16)},0 0 24px ${ja(t, 0.2)}`, r.appendChild(n);
  const i = new AbortController(), o = () => {
    const p = e.getBoundingClientRect(), s = p.width > 0 && p.height > 0 && p.bottom > 0 && p.right > 0 && p.top < window.innerHeight && p.left < window.innerWidth;
    n.style.display = s ? "" : "none", s && (n.style.left = `${p.left - 5}px`, n.style.top = `${p.top - 5}px`, n.style.width = `${p.width + 10}px`, n.style.height = `${p.height + 10}px`);
  }, l = () => requestAnimationFrame(o);
  o(), window.addEventListener("scroll", l, { passive: !0, signal: i.signal }), window.addEventListener("resize", l, { signal: i.signal });
  const c = setTimeout(() => {
    n.style.opacity = "0", n.style.transition = "opacity .3s ease", setTimeout(() => {
      ur === a && is();
    }, 320);
  }, 3200), a = () => {
    clearTimeout(c), i.abort(), xe(n);
  };
  ur = a;
}
function zm(e, t) {
  const r = `f_${e.simId}_${++kc}`;
  Je.set(r, { id: r, entry: e, obs: t, rowEl: null }), bt ? yr() : br(), ot && (ot.textContent = "", requestAnimationFrame(() => {
    ot && (ot.textContent = `${e.name}: ${t.text || ""}`);
  }));
}
function Fm(e) {
  const t = Je.get(e);
  if (!t) return;
  const r = () => {
    Je.delete(e), bt ? yr() : br();
  };
  t.rowEl && bt ? (t.rowEl.classList.add("is-removing"), setTimeout(r, ns() ? 0 : 300)) : r();
}
function Ga(e) {
  const t = Je.get(e);
  t && (hn.add(wc(t.entry.simId, t.obs)), Fm(e));
}
function Um(e, t, r) {
  if (!it) return;
  const n = pn.get(e);
  if (!n) {
    console.warn(`[KlavitySims] renderFeedback: simId "${e}" not registered`);
    return;
  }
  if (r.length) {
    Ic(!1);
    for (const i of r) {
      if (!gm(i)) continue;
      const o = wc(e, i);
      hn.has(o) || (hn.add(o), zm(n, i));
    }
  }
}
function ss() {
  is(), Je.clear(), kc = 0, pn.clear(), hn.clear(), bt = !1, Ht = null, pr = null, Dr = !1, cr == null || cr.abort(), cr = null, Fe = null, xr = null, It = null, Lt = null, st = null, Vt = null, nt = null, gt = null, ot = null, xe(Xe), Xe = null, xe(it), it = null, qt = null, xc(!1);
}
const nn = {
  deploy: Lm,
  setReviewing: Ic,
  renderFeedback: Um,
  undeploy: ss,
  onTriage: null
};
function Bm() {
  typeof window > "u" || window.KlavitySims || (window.KlavitySims = nn);
}
typeof window < "u" && Bm();
const Xa = "klav-ao-css", qm = "klav-ao-overlay";
function Wm(e, t, r, n, i, o = 10) {
  const a = !(e.y - r - 14 >= o), p = a ? e.y + e.h + 14 : e.y - r - 14, s = Math.max(o, Math.min(p, i - r - o));
  return { left: Math.max(o, Math.min(e.x, n - t - o)), top: s, below: a };
}
const jm = `
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
let Bt = null, Hm = 1;
const fn = /* @__PURE__ */ new Map();
function Ka(e, t) {
  const r = e.replace("#", ""), n = (c) => parseInt(c, 16), [i, o, l] = r.length === 3 ? [n(r[0] + r[0]), n(r[1] + r[1]), n(r[2] + r[2])] : [n(r.slice(0, 2)), n(r.slice(2, 4)), n(r.slice(4, 6))];
  return `rgba(${i},${o},${l},${t})`;
}
function Vm() {
  if (Bt) return Bt;
  if (!document.getElementById(Xa)) {
    const e = document.createElement("style");
    e.id = Xa, e.textContent = jm, document.head.appendChild(e);
  }
  return Bt = document.createElement("div"), Bt.id = qm, Bt.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;pointer-events:none;overflow:visible;z-index:2147483640;", document.body.appendChild(Bt), Bt;
}
function tg(e, t, r = {}) {
  const n = Vm(), i = r.color ?? "#6366f1", o = `klav-ao-${Hm++}`, l = 5, c = document.createElement("div");
  c.className = "klav-ao-halo", c.dataset.aoId = o, c.style.left = e.x - l + "px", c.style.top = e.y - l + "px", c.style.width = e.w + l * 2 + "px", c.style.height = e.h + l * 2 + "px", c.style.borderColor = i, c.style.boxShadow = `0 0 0 4px ${Ka(i, 0.14)},0 0 24px ${Ka(i, 0.18)}`, n.appendChild(c);
  let a = null;
  if (t) {
    const h = { x: e.x - l, y: e.y - l, w: e.w + l * 2, h: e.h + l * 2 }, { left: d, top: u, below: m } = Wm(
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
      const y = x === "medium" ? " sev-m" : x === "low" ? " sev-l" : "", S = document.createElement("span");
      S.className = `klav-ao-sev${y}`, S.textContent = x, f.appendChild(S);
    }
    const b = document.createElement("button");
    b.className = "klav-ao-dismiss", b.textContent = "Dismiss", b.addEventListener("click", () => Tc(o)), a.appendChild(f), a.appendChild(b), n.appendChild(a);
  }
  return fn.set(o, { halo: c, pin: a }), o;
}
function Tc(e) {
  const t = fn.get(e);
  if (!t) return;
  fn.delete(e);
  const { halo: r, pin: n } = t;
  n ? (n.classList.add("is-out"), r.style.animation = "klav-ao-pin-out .22s ease-in forwards", setTimeout(() => {
    xe(n), xe(r);
  }, 240)) : xe(r);
}
function rg() {
  for (const e of [...fn.keys()]) Tc(e);
}
let Nc = nr;
const _c = { consoleErrors: [], networkFailures: [] };
let Pc, $c, fr = null;
function Dc(e) {
  const t = {};
  for (const [r, n] of Object.entries(e))
    n != null && (t[String(r).slice(0, 64)] = String(n).slice(0, 1e3));
  return t;
}
async function Ja() {
  return Vd(document.body, {
    filter: (e) => e.id !== "klavity-sdk-host"
  });
}
function Ym() {
  return rp(_c, { identity: Pc, metadata: $c });
}
async function Gm(e) {
  return Kd(
    { type: e.type, description: e.description, context: e.context, screenshots: e.screenshots, replayEvents: e.replayEvents },
    Nc,
    { jira: Fp, linear: Up, github: Bp, plane: qp, backend: jp }
  );
}
function As(e = "bug") {
  const t = Ap(e, {
    onCaptureFull: Ja,
    onSubmit: async (r) => Gm({
      type: r.type,
      description: r.description,
      context: Ym(),
      screenshots: r.screenshots,
      replayEvents: (fr == null ? void 0 : fr.getEvents()) ?? []
    })
  });
  setTimeout(async () => {
    try {
      const r = await Ja();
      t.addScreenshot(r);
    } catch {
    }
  }, 200);
}
function Xm() {
  np(_c, { consoleLevels: !0 });
}
function zc(e) {
  Pc = e ? Dc(e) : void 0;
}
function Fc(e) {
  $c = e ? Dc(e) : void 0;
}
function Km() {
  document.addEventListener("contextmenu", (e) => {
    if (Sp(e.target)) return;
    e.preventDefault();
    const t = document.createElement("div");
    t.style.cssText = `position:fixed;left:${Math.min(e.clientX, window.innerWidth - 200)}px;top:${Math.min(e.clientY, window.innerHeight - 80)}px;background:#1e1e2e;border:1px solid #45475a;border-radius:8px;padding:4px;z-index:2147483647;box-shadow:0 8px 24px rgba(0,0,0,.4);font-family:system-ui;`, t.innerHTML = `
      <div data-action="bug" style="padding:8px 16px;cursor:pointer;color:#cdd6f4;font-size:13px;border-radius:4px;">${Z("bug")} Report a Bug</div>
      <div data-action="feature" style="padding:8px 16px;cursor:pointer;color:#cdd6f4;font-size:13px;border-radius:4px;">${Z("lightbulb")} Request a Feature</div>
    `, document.body.appendChild(t);
    const r = (n) => {
      (!n || !t.contains(n.target)) && (xe(t), document.removeEventListener("click", r));
    };
    t.addEventListener("click", (n) => {
      var o;
      const i = (o = n.target.closest("[data-action]")) == null ? void 0 : o.getAttribute("data-action");
      xe(t), document.removeEventListener("click", r), i && As(i);
    }), setTimeout(() => document.addEventListener("click", r), 0);
  });
}
function Uc(e = {}) {
  if (Nc = {
    ...nr,
    ...e,
    jira: { ...nr.jira, ...e.jira },
    linear: { ...nr.linear, ...e.linear },
    github: { ...nr.github, ...e.github },
    plane: { ...nr.plane, ...e.plane }
  }, Xm(), Km(), !fr)
    try {
      fr = pm(Tt);
    } catch {
      fr = null;
    }
}
typeof window < "u" && (window.KlavitySnap = { init: Uc, openModal: As, identify: zc, setMetadata: Fc });
const ng = { init: Uc, openModal: As, identify: zc, setMetadata: Fc };
export {
  nn as KlavitySims,
  nn as SimsLive,
  Tc as clearAnnotation,
  rg as clearAnnotations,
  ng as default,
  zc as identify,
  Uc as init,
  Bm as installKlavitySims,
  As as openModal,
  Fc as setMetadata,
  tg as showAnnotation
};
