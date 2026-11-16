var xh = Object.defineProperty;
var wh = (e, t, r) => t in e ? xh(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var mi = (e, t, r) => wh(e, typeof t != "symbol" ? t + "" : t, r);
function Sh(e, t) {
  return e[13] = 1, e[14] = t >> 8, e[15] = t & 255, e[16] = t >> 8, e[17] = t & 255, e;
}
const Bu = 112, qu = 72, Wu = 89, ju = 115;
let Is;
function Eh() {
  const e = new Int32Array(256);
  for (let t = 0; t < 256; t++) {
    let r = t;
    for (let n = 0; n < 8; n++)
      r = r & 1 ? 3988292384 ^ r >>> 1 : r >>> 1;
    e[t] = r;
  }
  return e;
}
function Ch(e) {
  let t = -1;
  Is || (Is = Eh());
  for (let r = 0; r < e.length; r++)
    t = Is[(t ^ e[r]) & 255] ^ t >>> 8;
  return t ^ -1;
}
function Mh(e) {
  const t = e.length - 1;
  for (let r = t; r >= 4; r--)
    if (e[r - 4] === 9 && e[r - 3] === Bu && e[r - 2] === qu && e[r - 1] === Wu && e[r] === ju)
      return r - 3;
  return 0;
}
function Rh(e, t, r = !1) {
  const n = new Uint8Array(13);
  t *= 39.3701, n[0] = Bu, n[1] = qu, n[2] = Wu, n[3] = ju, n[4] = t >>> 24, n[5] = t >>> 16, n[6] = t >>> 8, n[7] = t & 255, n[8] = n[4], n[9] = n[5], n[10] = n[6], n[11] = n[7], n[12] = 1;
  const i = Ch(n), s = new Uint8Array(4);
  if (s[0] = i >>> 24, s[1] = i >>> 16, s[2] = i >>> 8, s[3] = i & 255, r) {
    const o = Mh(e);
    return e.set(n, o), e.set(s, o + 13), e;
  } else {
    const o = new Uint8Array(4);
    o[0] = 0, o[1] = 0, o[2] = 0, o[3] = 9;
    const c = new Uint8Array(54);
    return c.set(e, 0), c.set(o, 33), c.set(n, 37), c.set(s, 50), c;
  }
}
const Th = "AAlwSFlz", Ah = "AAAJcEhZ", Lh = "AAAACXBI";
function _h(e) {
  let t = e.indexOf(Th);
  return t === -1 && (t = e.indexOf(Ah)), t === -1 && (t = e.indexOf(Lh)), t;
}
const Hu = "[modern-screenshot]", Ir = typeof window < "u", Ih = Ir && "Worker" in window, Oh = Ir && "atob" in window, Nh = Ir && "btoa" in window;
var Uu;
const ha = Ir ? (Uu = window.navigator) == null ? void 0 : Uu.userAgent : "", Yu = ha.includes("Chrome"), Fi = ha.includes("AppleWebKit") && !Yu, fa = ha.includes("Firefox"), Ph = (e) => e && "__CONTEXT__" in e, zh = (e) => e.constructor.name === "CSSFontFaceRule", $h = (e) => e.constructor.name === "CSSImportRule", Dh = (e) => e.constructor.name === "CSSLayerBlockRule", dr = (e) => e.nodeType === 1, ti = (e) => typeof e.className == "object", Vu = (e) => e.tagName === "image", Fh = (e) => e.tagName === "use", Kn = (e) => dr(e) && typeof e.style < "u" && !ti(e), Uh = (e) => e.nodeType === 8, Bh = (e) => e.nodeType === 3, On = (e) => e.tagName === "IMG", Xi = (e) => e.tagName === "VIDEO", qh = (e) => e.tagName === "CANVAS", Wh = (e) => e.tagName === "TEXTAREA", jh = (e) => e.tagName === "INPUT", Hh = (e) => e.tagName === "STYLE", Yh = (e) => e.tagName === "SCRIPT", Vh = (e) => e.tagName === "SELECT", Gh = (e) => e.tagName === "SLOT", Kh = (e) => e.tagName === "IFRAME", Xh = (...e) => console.warn(Hu, ...e);
function Jh(e) {
  var r;
  const t = (r = e == null ? void 0 : e.createElement) == null ? void 0 : r.call(e, "canvas");
  return t && (t.height = t.width = 1), !!t && "toDataURL" in t && !!t.toDataURL("image/webp").includes("image/webp");
}
const Zo = (e) => e.startsWith("data:");
function Gu(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (Ir && e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i) || !Ir)
    return e;
  const r = Ji().implementation.createHTMLDocument(), n = r.createElement("base"), i = r.createElement("a");
  return r.head.appendChild(n), r.body.appendChild(i), t && (n.href = t), i.href = e, i.href;
}
function Ji(e) {
  return (e && dr(e) ? e == null ? void 0 : e.ownerDocument : e) ?? window.document;
}
const Zi = "http://www.w3.org/2000/svg";
function Zh(e, t, r) {
  const n = Ji(r).createElementNS(Zi, "svg");
  return n.setAttributeNS(null, "width", e.toString()), n.setAttributeNS(null, "height", t.toString()), n.setAttributeNS(null, "viewBox", `0 0 ${e} ${t}`), n;
}
function Qh(e, t) {
  let r = new XMLSerializer().serializeToString(e);
  return t && (r = r.replace(/[\u0000-\u0008\v\f\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/gu, "")), `data:image/svg+xml;charset=utf-8,${encodeURIComponent(r)}`;
}
function ef(e, t) {
  return new Promise((r, n) => {
    const i = new FileReader();
    i.onload = () => r(i.result), i.onerror = () => n(i.error), i.onabort = () => n(new Error(`Failed read blob to ${t}`)), i.readAsDataURL(e);
  });
}
const tf = (e) => ef(e, "dataUrl");
function Tn(e, t) {
  const r = Ji(t).createElement("img");
  return r.decoding = "sync", r.loading = "eager", r.src = e, r;
}
function Xn(e, t) {
  return new Promise((r) => {
    const { timeout: n, ownerDocument: i, onError: s, onWarn: o } = t ?? {}, c = typeof e == "string" ? Tn(e, Ji(i)) : e;
    let l = null, p = null;
    function a() {
      r(c), l && clearTimeout(l), p == null || p();
    }
    if (n && (l = setTimeout(a, n)), Xi(c)) {
      const h = c.currentSrc || c.src;
      if (!h)
        return c.poster ? Xn(c.poster, t).then(r) : a();
      if (c.readyState >= 2)
        return a();
      const d = a, u = (m) => {
        o == null || o(
          "Failed video load",
          h,
          m
        ), s == null || s(m), a();
      };
      p = () => {
        c.removeEventListener("loadeddata", d), c.removeEventListener("error", u);
      }, c.addEventListener("loadeddata", d, { once: !0 }), c.addEventListener("error", u, { once: !0 });
    } else {
      const h = Vu(c) ? c.href.baseVal : c.currentSrc || c.src;
      if (!h)
        return a();
      const d = async () => {
        if (On(c) && "decode" in c)
          try {
            await c.decode();
          } catch (m) {
            o == null || o(
              "Failed to decode image, trying to render anyway",
              c.dataset.originalSrc || h,
              m
            );
          }
        a();
      }, u = (m) => {
        o == null || o(
          "Failed image load",
          c.dataset.originalSrc || h,
          m
        ), a();
      };
      if (On(c) && c.complete)
        return d();
      p = () => {
        c.removeEventListener("load", d), c.removeEventListener("error", u);
      }, c.addEventListener("load", d, { once: !0 }), c.addEventListener("error", u, { once: !0 });
    }
  });
}
async function rf(e, t) {
  Kn(e) && (On(e) || Xi(e) ? await Xn(e, t) : await Promise.all(
    ["img", "video"].flatMap((r) => Array.from(e.querySelectorAll(r)).map((n) => Xn(n, t)))
  ));
}
const Ku = /* @__PURE__ */ (function() {
  let t = 0;
  const r = () => `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4);
  return () => (t += 1, `u${r()}${t}`);
})();
function Xu(e) {
  return e == null ? void 0 : e.split(",").map((t) => t.trim().replace(/"|'/g, "").toLowerCase()).filter(Boolean);
}
let Nl = 0;
function nf(e) {
  const t = `${Hu}[#${Nl}]`;
  return Nl++, {
    // eslint-disable-next-line no-console
    time: (r) => e && console.time(`${t} ${r}`),
    // eslint-disable-next-line no-console
    timeEnd: (r) => e && console.timeEnd(`${t} ${r}`),
    warn: (...r) => e && Xh(...r)
  };
}
function sf(e) {
  return {
    cache: e ? "no-cache" : "force-cache"
  };
}
async function Qi(e, t) {
  return Ph(e) ? e : of(e, { ...t, autoDestruct: !0 });
}
async function of(e, t) {
  var u, m;
  const { scale: r = 1, workerUrl: n, workerNumber: i = 1 } = t || {}, s = !!(t != null && t.debug), o = (t == null ? void 0 : t.features) ?? !0, c = e.ownerDocument ?? (Ir ? window.document : void 0), l = ((u = e.ownerDocument) == null ? void 0 : u.defaultView) ?? (Ir ? window : void 0), p = /* @__PURE__ */ new Map(), a = {
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
      requestInit: sf((m = t == null ? void 0 : t.fetch) == null ? void 0 : m.bypassingCache),
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
    log: nf(s),
    node: e,
    ownerDocument: c,
    ownerWindow: l,
    dpi: r === 1 ? null : 96 * r,
    svgStyleElement: Ju(c),
    svgDefsElement: c == null ? void 0 : c.createElementNS(Zi, "defs"),
    svgStyles: /* @__PURE__ */ new Map(),
    defaultComputedStyles: /* @__PURE__ */ new Map(),
    workers: [
      ...Array.from({
        length: Ih && n && i ? i : 0
      })
    ].map(() => {
      try {
        const f = new Worker(n);
        return f.onmessage = async (y) => {
          var b, A, S, x;
          const { url: C, result: k } = y.data;
          k ? (A = (b = p.get(C)) == null ? void 0 : b.resolve) == null || A.call(b, k) : (x = (S = p.get(C)) == null ? void 0 : S.reject) == null || x.call(S, new Error(`Error receiving message from worker: ${C}`));
        }, f.onmessageerror = (y) => {
          var k, b;
          const { url: C } = y.data;
          (b = (k = p.get(C)) == null ? void 0 : k.reject) == null || b.call(k, new Error(`Error receiving message from worker: ${C}`));
        }, f;
      } catch (f) {
        return a.log.warn("Failed to new Worker", f), null;
      }
    }).filter(Boolean),
    fontFamilies: /* @__PURE__ */ new Map(),
    fontCssTexts: /* @__PURE__ */ new Map(),
    acceptOfImage: `${[
      Jh(c) && "image/webp",
      "image/svg+xml",
      "image/*",
      "*/*"
    ].filter(Boolean).join(",")};q=0.8`,
    requests: p,
    drawImageCount: 0,
    tasks: [],
    features: o,
    isEnable: (f) => f === "restoreScrollPosition" ? typeof o == "boolean" ? !1 : o[f] ?? !1 : typeof o == "boolean" ? o : o[f] ?? !0,
    shadowRoots: []
  };
  a.log.time("wait until load"), await rf(e, { timeout: a.timeout, onWarn: a.log.warn }), a.log.timeEnd("wait until load");
  const { width: h, height: d } = af(e, a);
  return a.width = h, a.height = d, a;
}
function Ju(e) {
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
function af(e, t) {
  let { width: r, height: n } = t;
  if (dr(e) && (!r || !n)) {
    const i = e.getBoundingClientRect();
    r = r || i.width || Number(e.getAttribute("width")) || 0, n = n || i.height || Number(e.getAttribute("height")) || 0;
  }
  return { width: r, height: n };
}
async function lf(e, t) {
  const {
    log: r,
    timeout: n,
    drawImageCount: i,
    drawImageInterval: s
  } = t;
  r.time("image to canvas");
  const o = await Xn(e, { timeout: n, onWarn: t.log.warn }), { canvas: c, context2d: l } = cf(e.ownerDocument, t), p = () => {
    try {
      l == null || l.drawImage(o, 0, 0, c.width, c.height);
    } catch (a) {
      t.log.warn("Failed to drawImage", a);
    }
  };
  if (p(), t.isEnable("fixSvgXmlDecode"))
    for (let a = 0; a < i; a++)
      await new Promise((h) => {
        setTimeout(() => {
          l == null || l.clearRect(0, 0, c.width, c.height), p(), h();
        }, a + s);
      });
  return t.drawImageCount = 0, r.timeEnd("image to canvas"), c;
}
function cf(e, t) {
  const { width: r, height: n, scale: i, backgroundColor: s, maximumCanvasSize: o } = t, c = e.createElement("canvas");
  c.width = Math.floor(r * i), c.height = Math.floor(n * i), c.style.width = `${r}px`, c.style.height = `${n}px`, o && (c.width > o || c.height > o) && (c.width > o && c.height > o ? c.width > c.height ? (c.height *= o / c.width, c.width = o) : (c.width *= o / c.height, c.height = o) : c.width > o ? (c.height *= o / c.width, c.width = o) : (c.width *= o / c.height, c.height = o));
  const l = c.getContext("2d");
  return l && s && (l.fillStyle = s, l.fillRect(0, 0, c.width, c.height)), { canvas: c, context2d: l };
}
function Zu(e, t) {
  if (e.ownerDocument)
    try {
      const s = e.toDataURL();
      if (s !== "data:,")
        return Tn(s, e.ownerDocument);
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
function uf(e, t) {
  var r;
  try {
    if ((r = e == null ? void 0 : e.contentDocument) != null && r.documentElement)
      return ma(e.contentDocument.documentElement, t);
  } catch (n) {
    t.log.warn("Failed to clone iframe", n);
  }
  return e.cloneNode(!1);
}
function df(e) {
  const t = e.cloneNode(!1);
  return e.currentSrc && e.currentSrc !== e.src && (t.src = e.currentSrc, t.srcset = ""), t.loading === "lazy" && (t.loading = "eager"), t;
}
async function pf(e, t) {
  if (e.ownerDocument && !e.currentSrc && e.poster)
    return Tn(e.poster, e.ownerDocument);
  const r = e.cloneNode(!1);
  r.crossOrigin = "anonymous", e.currentSrc && e.currentSrc !== e.src && (r.src = e.currentSrc);
  const n = r.ownerDocument;
  if (n) {
    let i = !0;
    if (await Xn(r, { onError: () => i = !1, onWarn: t.log.warn }), !i)
      return e.poster ? Tn(e.poster, e.ownerDocument) : r;
    r.currentTime = e.currentTime, await new Promise((o) => {
      r.addEventListener("seeked", o, { once: !0 });
    });
    const s = n.createElement("canvas");
    s.width = e.offsetWidth, s.height = e.offsetHeight;
    try {
      const o = s.getContext("2d");
      o && o.drawImage(r, 0, 0, s.width, s.height);
    } catch (o) {
      return t.log.warn("Failed to clone video", o), e.poster ? Tn(e.poster, e.ownerDocument) : r;
    }
    return Zu(s, t);
  }
  return r;
}
function hf(e, t) {
  return qh(e) ? Zu(e, t) : Kh(e) ? uf(e, t) : On(e) ? df(e) : Xi(e) ? pf(e, t) : e.cloneNode(!1);
}
function ff(e) {
  let t = e.sandbox;
  if (!t) {
    const { ownerDocument: r } = e;
    try {
      r && (t = r.createElement("iframe"), t.id = `__SANDBOX__${Ku()}`, t.width = "0", t.height = "0", t.style.visibility = "hidden", t.style.position = "fixed", r.body.appendChild(t), t.srcdoc = '<!DOCTYPE html><meta charset="UTF-8"><title></title><body>', e.sandbox = t);
    } catch (n) {
      e.log.warn("Failed to getSandBox", n);
    }
  }
  return t;
}
const mf = [
  "width",
  "height",
  "-webkit-text-fill-color"
], gf = [
  "stroke",
  "fill"
];
function Qu(e, t, r) {
  const { defaultComputedStyles: n } = r, i = e.nodeName.toLowerCase(), s = ti(e) && i !== "svg", o = s ? gf.map((f) => [f, e.getAttribute(f)]).filter(([, f]) => f !== null) : [], c = [
    s && "svg",
    i,
    o.map((f, y) => `${f}=${y}`).join(","),
    t
  ].filter(Boolean).join(":");
  if (n.has(c))
    return n.get(c);
  const l = ff(r), p = l == null ? void 0 : l.contentWindow;
  if (!p)
    return /* @__PURE__ */ new Map();
  const a = p == null ? void 0 : p.document;
  let h, d;
  s ? (h = a.createElementNS(Zi, "svg"), d = h.ownerDocument.createElementNS(h.namespaceURI, i), o.forEach(([f, y]) => {
    d.setAttributeNS(null, f, y);
  }), h.appendChild(d)) : h = d = a.createElement(i), d.textContent = " ", a.body.appendChild(h);
  const u = p.getComputedStyle(d, t), m = /* @__PURE__ */ new Map();
  for (let f = u.length, y = 0; y < f; y++) {
    const C = u.item(y);
    mf.includes(C) || m.set(C, u.getPropertyValue(C));
  }
  return a.body.removeChild(h), n.set(c, m), m;
}
function ed(e, t, r) {
  var c;
  const n = /* @__PURE__ */ new Map(), i = [], s = /* @__PURE__ */ new Map();
  if (r)
    for (const l of r)
      o(l);
  else
    for (let l = e.length, p = 0; p < l; p++) {
      const a = e.item(p);
      o(a);
    }
  for (let l = i.length, p = 0; p < l; p++)
    (c = s.get(i[p])) == null || c.forEach((a, h) => n.set(h, a));
  function o(l) {
    const p = e.getPropertyValue(l), a = e.getPropertyPriority(l), h = l.lastIndexOf("-"), d = h > -1 ? l.substring(0, h) : void 0;
    if (d) {
      let u = s.get(d);
      u || (u = /* @__PURE__ */ new Map(), s.set(d, u)), u.set(l, [p, a]);
    }
    t.get(l) === p && !a || (d ? i.push(d) : n.set(l, [p, a]));
  }
  return n;
}
function yf(e, t, r, n) {
  var h, d, u, m;
  const { ownerWindow: i, includeStyleProperties: s, currentParentNodeStyle: o } = n, c = t.style, l = i.getComputedStyle(e), p = Qu(e, null, n);
  o == null || o.forEach((f, y) => {
    p.delete(y);
  });
  const a = ed(l, p, s);
  a.delete("transition-property"), a.delete("all"), a.delete("d"), a.delete("content"), r && (a.delete("position"), a.delete("margin-top"), a.delete("margin-right"), a.delete("margin-bottom"), a.delete("margin-left"), a.delete("margin-block-start"), a.delete("margin-block-end"), a.delete("margin-inline-start"), a.delete("margin-inline-end"), a.set("box-sizing", ["border-box", ""])), ((h = a.get("background-clip")) == null ? void 0 : h[0]) === "text" && t.classList.add("______background-clip--text"), Yu && (a.has("font-kerning") || a.set("font-kerning", ["normal", ""]), (((d = a.get("overflow-x")) == null ? void 0 : d[0]) === "hidden" || ((u = a.get("overflow-y")) == null ? void 0 : u[0]) === "hidden") && ((m = a.get("text-overflow")) == null ? void 0 : m[0]) === "ellipsis" && e.scrollWidth === e.clientWidth && a.set("text-overflow", ["clip", ""]));
  for (let f = c.length, y = 0; y < f; y++)
    c.removeProperty(c.item(y));
  return a.forEach(([f, y], C) => {
    c.setProperty(C, f, y);
  }), a;
}
function bf(e, t) {
  (Wh(e) || jh(e) || Vh(e)) && t.setAttribute("value", e.value);
}
const kf = [
  "::before",
  "::after"
  // '::placeholder', TODO
], vf = [
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
function xf(e, t, r, n, i) {
  const { ownerWindow: s, svgStyleElement: o, svgStyles: c, currentNodeStyle: l } = n;
  if (!o || !s)
    return;
  function p(a) {
    var b;
    const h = s.getComputedStyle(e, a);
    let d = h.getPropertyValue("content");
    if (!d || d === "none")
      return;
    i == null || i(d), d = d.replace(/(')|(")|(counter\(.+\))/g, "");
    const u = [Ku()], m = Qu(e, a, n);
    l == null || l.forEach((A, S) => {
      m.delete(S);
    });
    const f = ed(h, m, n.includeStyleProperties);
    f.delete("content"), f.delete("-webkit-locale"), ((b = f.get("background-clip")) == null ? void 0 : b[0]) === "text" && t.classList.add("______background-clip--text");
    const y = [
      `content: '${d}';`
    ];
    if (f.forEach(([A, S], x) => {
      y.push(`${x}: ${A}${S ? " !important" : ""};`);
    }), y.length === 1)
      return;
    try {
      t.className = [t.className, ...u].join(" ");
    } catch (A) {
      n.log.warn("Failed to copyPseudoClass", A);
      return;
    }
    const C = y.join(`
  `);
    let k = c.get(C);
    k || (k = [], c.set(C, k)), k.push(`.${u[0]}${a}`);
  }
  kf.forEach(p), r && vf.forEach(p);
}
const Pl = /* @__PURE__ */ new Set([
  "symbol"
  // test/fixtures/svg.symbol.html
]);
async function zl(e, t, r, n, i) {
  if (dr(r) && (Hh(r) || Yh(r)) || n.filter && !n.filter(r))
    return;
  Pl.has(t.nodeName) || Pl.has(r.nodeName) ? n.currentParentNodeStyle = void 0 : n.currentParentNodeStyle = n.currentNodeStyle;
  const s = await ma(r, n, !1, i);
  n.isEnable("restoreScrollPosition") && wf(e, s), t.appendChild(s);
}
async function $l(e, t, r, n) {
  var s;
  let i = e.firstChild;
  dr(e) && e.shadowRoot && (i = (s = e.shadowRoot) == null ? void 0 : s.firstChild, r.shadowRoots.push(e.shadowRoot));
  for (let o = i; o; o = o.nextSibling)
    if (!Uh(o))
      if (dr(o) && Gh(o) && typeof o.assignedNodes == "function") {
        const c = o.assignedNodes();
        for (let l = 0; l < c.length; l++)
          await zl(e, t, c[l], r, n);
      } else
        await zl(e, t, o, r, n);
}
function wf(e, t) {
  if (!Kn(e) || !Kn(t))
    return;
  const { scrollTop: r, scrollLeft: n } = e;
  if (!r && !n)
    return;
  const { transform: i } = t.style, s = new DOMMatrix(i), { a: o, b: c, c: l, d: p } = s;
  s.a = 1, s.b = 0, s.c = 0, s.d = 1, s.translateSelf(-n, -r), s.a = o, s.b = c, s.c = l, s.d = p, t.style.transform = s.toString();
}
function Sf(e, t) {
  const { backgroundColor: r, width: n, height: i, style: s } = t, o = e.style;
  if (r && o.setProperty("background-color", r, "important"), n && o.setProperty("width", `${n}px`, "important"), i && o.setProperty("height", `${i}px`, "important"), s)
    for (const c in s) o[c] = s[c];
}
const Ef = /^[\w-:]+$/;
async function ma(e, t, r = !1, n) {
  var p, a, h, d;
  const { ownerDocument: i, ownerWindow: s, fontFamilies: o, onCloneEachNode: c } = t;
  if (i && Bh(e))
    return n && /\S/.test(e.data) && n(e.data), i.createTextNode(e.data);
  if (i && s && dr(e) && (Kn(e) || ti(e))) {
    const u = await hf(e, t);
    if (t.isEnable("removeAbnormalAttributes")) {
      const b = u.getAttributeNames();
      for (let A = b.length, S = 0; S < A; S++) {
        const x = b[S];
        Ef.test(x) || u.removeAttribute(x);
      }
    }
    const m = t.currentNodeStyle = yf(e, u, r, t);
    r && Sf(u, t);
    let f = !1;
    if (t.isEnable("copyScrollbar")) {
      const b = [
        (p = m.get("overflow-x")) == null ? void 0 : p[0],
        (a = m.get("overflow-y")) == null ? void 0 : a[0]
      ];
      f = b.includes("scroll") || (b.includes("auto") || b.includes("overlay")) && (e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth);
    }
    const y = (h = m.get("text-transform")) == null ? void 0 : h[0], C = Xu((d = m.get("font-family")) == null ? void 0 : d[0]), k = C ? (b) => {
      y === "uppercase" ? b = b.toUpperCase() : y === "lowercase" ? b = b.toLowerCase() : y === "capitalize" && (b = b[0].toUpperCase() + b.substring(1)), C.forEach((A) => {
        let S = o.get(A);
        S || o.set(A, S = /* @__PURE__ */ new Set()), b.split("").forEach((x) => S.add(x));
      });
    } : void 0;
    return xf(
      e,
      u,
      f,
      t,
      k
    ), bf(e, u), Xi(e) || await $l(
      e,
      u,
      t,
      k
    ), await (c == null ? void 0 : c(u)), u;
  }
  const l = e.cloneNode(!1);
  return await $l(e, l, t), await (c == null ? void 0 : c(l)), l;
}
function Cf(e) {
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
function Mf(e) {
  const { url: t, timeout: r, responseType: n, ...i } = e, s = new AbortController(), o = r ? setTimeout(() => s.abort(), r) : void 0;
  return fetch(t, { signal: s.signal, ...i }).then((c) => {
    if (!c.ok)
      throw new Error("Failed fetch, not 2xx response", { cause: c });
    switch (n) {
      case "arrayBuffer":
        return c.arrayBuffer();
      case "dataUrl":
        return c.blob().then(tf);
      case "text":
      default:
        return c.text();
    }
  }).finally(() => clearTimeout(o));
}
function Jn(e, t) {
  const { url: r, requestType: n = "text", responseType: i = "text", imageDom: s } = t;
  let o = r;
  const {
    timeout: c,
    acceptOfImage: l,
    requests: p,
    fetchFn: a,
    fetch: {
      requestInit: h,
      bypassingCache: d,
      placeholderImage: u
    },
    font: m,
    workers: f,
    fontFamilies: y
  } = e;
  n === "image" && (Fi || fa) && e.drawImageCount++;
  let C = p.get(r);
  if (!C) {
    d && d instanceof RegExp && d.test(o) && (o += (/\?/.test(o) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
    const k = n.startsWith("font") && m && m.minify, b = /* @__PURE__ */ new Set();
    k && n.split(";")[1].split(",").forEach((R) => {
      y.has(R) && y.get(R).forEach((I) => b.add(I));
    });
    const A = k && b.size, S = {
      url: o,
      timeout: c,
      responseType: A ? "arrayBuffer" : i,
      headers: n === "image" ? { accept: l } : void 0,
      ...h
    };
    C = {
      type: n,
      resolve: void 0,
      reject: void 0,
      response: null
    }, C.response = (async () => {
      if (a && n === "image") {
        const x = await a(r);
        if (x)
          return x;
      }
      return !Fi && r.startsWith("http") && f.length ? new Promise((x, R) => {
        f[p.size & f.length - 1].postMessage({ rawUrl: r, ...S }), C.resolve = x, C.reject = R;
      }) : Mf(S);
    })().catch((x) => {
      if (p.delete(r), n === "image" && u)
        return e.log.warn("Failed to fetch image base64, trying to use placeholder image", o), typeof u == "string" ? u : u(s);
      throw x;
    }), p.set(r, C);
  }
  return C.response;
}
async function td(e, t, r, n) {
  if (!rd(e))
    return e;
  for (const [i, s] of Rf(e, t))
    try {
      const o = await Jn(
        r,
        {
          url: s,
          requestType: n ? "image" : "text",
          responseType: "dataUrl"
        }
      );
      e = e.replace(Tf(i), `$1${o}$3`);
    } catch (o) {
      r.log.warn("Failed to fetch css data url", i, o);
    }
  return e;
}
function rd(e) {
  return /url\((['"]?)([^'"]+?)\1\)/.test(e);
}
const nd = /url\((['"]?)([^'"]+?)\1\)/g;
function Rf(e, t) {
  const r = [];
  return e.replace(nd, (n, i, s) => (r.push([s, Gu(s, t)]), n)), r.filter(([n]) => !Zo(n));
}
function Tf(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
const Af = [
  "background-image",
  "border-image-source",
  "-webkit-border-image",
  "-webkit-mask-image",
  "list-style-image"
];
function Lf(e, t) {
  return Af.map((r) => {
    const n = e.getPropertyValue(r);
    return !n || n === "none" ? null : ((Fi || fa) && t.drawImageCount++, td(n, null, t, !0).then((i) => {
      !i || n === i || e.setProperty(
        r,
        i,
        e.getPropertyPriority(r)
      );
    }));
  }).filter(Boolean);
}
function _f(e, t) {
  if (On(e)) {
    const r = e.currentSrc || e.src;
    if (!Zo(r))
      return [
        Jn(t, {
          url: r,
          imageDom: e,
          requestType: "image",
          responseType: "dataUrl"
        }).then((n) => {
          n && (e.srcset = "", e.dataset.originalSrc = r, e.src = n || "");
        })
      ];
    (Fi || fa) && t.drawImageCount++;
  } else if (ti(e) && !Zo(e.href.baseVal)) {
    const r = e.href.baseVal;
    return [
      Jn(t, {
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
function If(e, t) {
  const { ownerDocument: r, svgDefsElement: n } = t, i = e.getAttribute("href") ?? e.getAttribute("xlink:href");
  if (!i)
    return [];
  const [s, o] = i.split("#");
  if (o) {
    const c = `#${o}`, l = t.shadowRoots.reduce(
      (p, a) => p ?? a.querySelector(`svg ${c}`),
      r == null ? void 0 : r.querySelector(`svg ${c}`)
    );
    if (s && e.setAttribute("href", c), n != null && n.querySelector(c))
      return [];
    if (l)
      return n == null || n.appendChild(l.cloneNode(!0)), [];
    if (s)
      return [
        Jn(t, {
          url: s,
          responseType: "text"
        }).then((p) => {
          n == null || n.insertAdjacentHTML("beforeend", p);
        })
      ];
  }
  return [];
}
function id(e, t) {
  const { tasks: r } = t;
  dr(e) && ((On(e) || Vu(e)) && r.push(..._f(e, t)), Fh(e) && r.push(...If(e, t))), Kn(e) && r.push(...Lf(e.style, t)), e.childNodes.forEach((n) => {
    id(n, t);
  });
}
async function Of(e, t) {
  const {
    ownerDocument: r,
    svgStyleElement: n,
    fontFamilies: i,
    fontCssTexts: s,
    tasks: o,
    font: c
  } = t;
  if (!(!r || !n || !i.size))
    if (c && c.cssText) {
      const l = Fl(c.cssText, t);
      n.appendChild(r.createTextNode(`${l}
`));
    } else {
      const l = Array.from(r.styleSheets).filter((u) => {
        try {
          return "cssRules" in u && !!u.cssRules.length;
        } catch (m) {
          return t.log.warn(`Error while reading CSS rules from ${u.href}`, m), !1;
        }
      }), p = r.implementation.createHTMLDocument(""), a = p.createElement("style");
      p.head.appendChild(a);
      const h = a.sheet;
      await Promise.all(
        l.flatMap((u) => Array.from(u.cssRules).map(async (m) => {
          if ($h(m)) {
            const f = m.href;
            let y = "";
            try {
              y = await Jn(t, {
                url: f,
                requestType: "text",
                responseType: "text"
              });
            } catch (k) {
              t.log.warn(`Error fetch remote css import from ${f}`, k);
            }
            const C = y.replace(
              nd,
              (k, b, A) => k.replace(A, Gu(A, f))
            );
            for (const k of Pf(C))
              try {
                h.insertRule(k, h.cssRules.length);
              } catch (b) {
                t.log.warn("Error inserting rule from remote css import", { rule: k, error: b });
              }
          }
        }))
      ), h.cssRules.length && l.push(h);
      const d = [];
      l.forEach((u) => {
        Qo(u.cssRules, d);
      }), d.filter((u) => {
        var m;
        return zh(u) && rd(u.style.getPropertyValue("src")) && ((m = Xu(u.style.getPropertyValue("font-family"))) == null ? void 0 : m.some((f) => i.has(f)));
      }).forEach((u) => {
        const m = u, f = s.get(m.cssText);
        f ? n.appendChild(r.createTextNode(`${f}
`)) : o.push(
          td(
            m.cssText,
            m.parentStyleSheet ? m.parentStyleSheet.href : null,
            t
          ).then((y) => {
            y = Fl(y, t), s.set(m.cssText, y), n.appendChild(r.createTextNode(`${y}
`));
          })
        );
      });
    }
}
const Nf = /(\/\*[\s\S]*?\*\/)/g, Dl = /((@.*?keyframes [\s\S]*?){([\s\S]*?}\s*?)})/gi;
function Pf(e) {
  if (e == null)
    return [];
  const t = [];
  let r = e.replace(Nf, "");
  for (; ; ) {
    const s = Dl.exec(r);
    if (!s)
      break;
    t.push(s[0]);
  }
  r = r.replace(Dl, "");
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
const zf = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, $f = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function Fl(e, t) {
  const { font: r } = t, n = r ? r == null ? void 0 : r.preferredFormat : void 0;
  return n ? e.replace($f, (i) => {
    for (; ; ) {
      const [s, , o] = zf.exec(i) || [];
      if (!o)
        return "";
      if (o === n)
        return `src: ${s};`;
    }
  }) : e;
}
function Qo(e, t = []) {
  for (const r of Array.from(e))
    Dh(r) ? t.push(...Qo(r.cssRules)) : "cssRules" in r ? Qo(r.cssRules, t) : t.push(r);
  return t;
}
const Df = /\bx?link:?href\s*=\s*["'](?!data:)[^"']+["']/i;
function Ff(e) {
  return Df.test(e.innerHTML);
}
async function Uf(e, t) {
  const r = await Qi(e, t);
  if (dr(r.node) && ti(r.node) && !Ff(r.node))
    return r.node;
  const {
    ownerDocument: n,
    log: i,
    tasks: s,
    svgStyleElement: o,
    svgDefsElement: c,
    svgStyles: l,
    font: p,
    progress: a,
    autoDestruct: h,
    onCloneNode: d,
    onEmbedNode: u,
    onCreateForeignObjectSvg: m
  } = r;
  i.time("clone node");
  const f = await ma(r.node, r, !0);
  if (o && n) {
    let A = "";
    l.forEach((S, x) => {
      A += `${S.join(`,
`)} {
  ${x}
}
`;
    }), o.appendChild(n.createTextNode(A));
  }
  i.timeEnd("clone node"), await (d == null ? void 0 : d(f)), p !== !1 && dr(f) && (i.time("embed web font"), await Of(f, r), i.timeEnd("embed web font")), i.time("embed node"), id(f, r);
  const y = s.length;
  let C = 0;
  const k = async () => {
    for (; ; ) {
      const A = s.pop();
      if (!A)
        break;
      try {
        await A;
      } catch (S) {
        r.log.warn("Failed to run task", S);
      }
      a == null || a(++C, y);
    }
  };
  a == null || a(C, y), await Promise.all([...Array.from({ length: 4 })].map(k)), i.timeEnd("embed node"), await (u == null ? void 0 : u(f));
  const b = Bf(f, r);
  return c && b.insertBefore(c, b.children[0]), o && b.insertBefore(o, b.children[0]), h && Cf(r), await (m == null ? void 0 : m(b)), b;
}
function Bf(e, t) {
  const { width: r, height: n } = t, i = Zh(r, n, e.ownerDocument), s = i.ownerDocument.createElementNS(i.namespaceURI, "foreignObject");
  return s.setAttributeNS(null, "x", "0%"), s.setAttributeNS(null, "y", "0%"), s.setAttributeNS(null, "width", "100%"), s.setAttributeNS(null, "height", "100%"), s.append(e), i.appendChild(s), i;
}
async function qf(e, t) {
  var o;
  const r = await Qi(e, t), n = await Uf(r), i = Qh(n, r.isEnable("removeControlCharacter"));
  r.autoDestruct || (r.svgStyleElement = Ju(r.ownerDocument), r.svgDefsElement = (o = r.ownerDocument) == null ? void 0 : o.createElementNS(Zi, "defs"), r.svgStyles.clear());
  const s = Tn(i, n.ownerDocument);
  return await lf(s, r);
}
async function Wf(e, t) {
  const r = await Qi(e, t), { log: n, quality: i, type: s, dpi: o } = r, c = await qf(r);
  n.time("canvas to data url");
  let l = c.toDataURL(s, i);
  if (["image/png", "image/jpeg"].includes(s) && o && Oh && Nh) {
    const [p, a] = l.split(",");
    let h = 0, d = !1;
    if (s === "image/png") {
      const b = _h(a);
      b >= 0 ? (h = Math.ceil((b + 28) / 3) * 4, d = !0) : h = 33 / 3 * 4;
    } else s === "image/jpeg" && (h = 18 / 3 * 4);
    const u = a.substring(0, h), m = a.substring(h), f = window.atob(u), y = new Uint8Array(f.length);
    for (let b = 0; b < y.length; b++)
      y[b] = f.charCodeAt(b);
    const C = s === "image/png" ? Rh(y, o, d) : Sh(y, o), k = window.btoa(String.fromCharCode(...C));
    l = [p, ",", k, m].join("");
  }
  return n.timeEnd("canvas to data url"), l;
}
async function jf(e, t) {
  return Wf(
    await Qi(e, { ...t, type: "image/png" })
  );
}
const Hf = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", Yf = 8e3, Vf = 16384, Ul = 4096, Gf = 16e6, Kf = 500, Xf = 1e4, Os = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z4kwAAAAASUVORK5CYII=", sd = 600, Jf = 1200, Zf = 24, Qf = 1024, Bt = 32, em = 4, od = 400, tm = 0.985, rm = 250;
function ad(e, t) {
  if (!e || e.startsWith("data:") || e.startsWith("blob:")) return !1;
  try {
    return new URL(e, t).origin !== t;
  } catch {
    return !1;
  }
}
function nm(e) {
  const t = e;
  if (!t || t.tagName !== "IMG") return !1;
  const r = t.currentSrc || t.src || "";
  return ad(r, location.origin);
}
function im(e) {
  const t = e;
  if (!t || t.nodeType !== 1) return !1;
  const r = t.tagName;
  if (r === "SCRIPT" || r === "STYLE" || r === "NOSCRIPT" || r === "TEMPLATE" || r === "IFRAME" && ad(t.src || "", location.origin)) return !0;
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
  const s = window.scrollX || window.pageXOffset || 0, o = window.scrollY || window.pageYOffset || 0;
  return i.right + s <= 0 || i.bottom + o <= 0;
}
function Ns(e) {
  try {
    console.warn(e);
  } catch {
  }
}
function Bl(e) {
  return !e || e === "transparent" || e === "rgba(0, 0, 0, 0)";
}
function sm(e, t, r = 1) {
  try {
    const n = e.getBoundingClientRect(), i = Math.max(1, Math.ceil(Math.max(e.scrollWidth, e.clientWidth, n.width))), s = Math.max(1, Math.ceil(Math.max(e.scrollHeight, e.clientHeight, n.height))), o = Math.max(0.1, r), c = Math.min(Ul / i, Ul / s), l = Math.min(o, c, Math.sqrt(Gf / (i * s))), p = document.createElement("canvas");
    p.width = Math.max(1, Math.floor(i * l)), p.height = Math.max(1, Math.floor(s * l));
    const a = p.getContext("2d");
    if (!a) return { dataUrl: Os, scale: 1 };
    a.scale(l, l), a.fillStyle = "#ffffff", a.fillRect(0, 0, i, s);
    const h = Date.now() + Kf;
    let d = 0;
    const u = () => d >= Xf || Date.now() >= h, m = (y, C = !1) => {
      var x;
      if (u() || (d++, !C && t && !t(y))) return;
      const k = getComputedStyle(y);
      if (k.display === "none" || k.visibility === "hidden" || Number(k.opacity) === 0) return;
      const b = y.getBoundingClientRect(), A = b.left - n.left, S = b.top - n.top;
      if (b.width > 0 && b.height > 0) {
        Bl(k.backgroundColor) || (a.fillStyle = k.backgroundColor, a.fillRect(A, S, b.width, b.height));
        const R = parseFloat(k.borderTopWidth);
        R > 0 && k.borderTopStyle !== "none" && !Bl(k.borderTopColor) && (a.strokeStyle = k.borderTopColor, a.lineWidth = R, a.strokeRect(A, S, b.width, b.height)), y.tagName === "IMG" && (a.fillStyle = "#f1f5f9", a.fillRect(A, S, b.width, b.height), a.strokeStyle = "#cbd5e1", a.lineWidth = 1, a.strokeRect(A, S, b.width, b.height));
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
            a.save(), a.beginPath(), a.rect(F.left - n.left, F.top - n.top, F.width, F.height), a.clip(), a.fillStyle = k.color, a.font = `${k.fontStyle} ${k.fontWeight} ${k.fontSize} ${k.fontFamily}`, a.textBaseline = "top", a.fillText(R.textContent.trim(), F.left - n.left, F.top - n.top), a.restore();
          } catch {
          }
      }
    };
    m(e, !0);
    const f = p.toDataURL("image/png");
    return f.startsWith("data:image/png") ? { dataUrl: f, scale: l } : { dataUrl: Os, scale: 1 };
  } catch {
    return { dataUrl: Os, scale: 1 };
  }
}
function om() {
  return new Promise((e) => {
    typeof requestAnimationFrame == "function" ? requestAnimationFrame(() => e()) : setTimeout(e, 16);
  });
}
function Ps(e, t) {
  return Promise.race([
    Promise.resolve(e).then(() => {
    }, () => {
    }),
    new Promise((r) => setTimeout(r, Math.max(0, t)))
  ]);
}
function am(e) {
  if (!e || typeof e.querySelectorAll != "function") return [];
  const t = typeof window < "u" && window.innerWidth || 0, r = typeof window < "u" && window.innerHeight || 0, n = [];
  let i;
  try {
    i = e.querySelectorAll("img");
  } catch {
    return [];
  }
  for (let s = 0; s < i.length && n.length < Zf; s++) {
    const o = i[s];
    if (!o || o.complete) continue;
    let c;
    try {
      c = o.getBoundingClientRect();
    } catch {
      continue;
    }
    c.bottom < 0 || c.right < 0 || c.top > r || c.left > t || n.push(o);
  }
  return n;
}
async function ql(e, t = sd) {
  if (typeof document > "u") return;
  const r = Date.now() + Math.max(0, t), n = () => Math.max(0, r - Date.now());
  try {
    const i = document.fonts;
    i && i.status !== "loaded" && i.ready && typeof i.ready.then == "function" && await Ps(i.ready, n());
    const s = am(e);
    s.length && await Ps(
      Promise.allSettled(s.map((o) => typeof o.decode == "function" ? o.decode() : Promise.resolve())),
      n()
    ), await Ps(om(), Math.min(n(), 50));
  } catch {
  }
}
function ld(e, t) {
  return new Promise((r) => {
    if (typeof Image > "u") {
      r(null);
      return;
    }
    let n = !1;
    const i = new Image(), s = (c) => {
      n || (n = !0, r(c ? i : null));
    }, o = setTimeout(() => s(!1), Math.max(0, t));
    i.onload = () => {
      clearTimeout(o), s(!0);
    }, i.onerror = () => {
      clearTimeout(o), s(!1);
    };
    try {
      i.src = e;
    } catch {
      clearTimeout(o), s(!1);
    }
  });
}
async function lm(e) {
  if (typeof document > "u") return null;
  const t = await ld(e, od);
  if (!t) return null;
  let r;
  try {
    r = document.createElement("canvas");
  } catch {
    return null;
  }
  r.width = Bt, r.height = Bt;
  const n = r.getContext("2d");
  if (!n) return null;
  try {
    n.drawImage(t, 0, 0, Bt, Bt);
    const { data: i } = n.getImageData(0, 0, Bt, Bt);
    let s = 0, o = 0, c = 0;
    for (let p = 0; p < i.length; p += 4) {
      const a = i[p + 3] / 255, h = i[p] * a + 255 * (1 - a), d = i[p + 1] * a + 255 * (1 - a), u = i[p + 2] * a + 255 * (1 - a), m = 0.299 * h + 0.587 * d + 0.114 * u;
      o += m, c += m * m, s++;
    }
    if (!s) return null;
    const l = o / s;
    return c / s - l * l;
  } catch {
    return null;
  }
}
async function zs(e) {
  if (!e || !e.startsWith("data:image/png")) return !0;
  const t = e.indexOf(","), r = t >= 0 ? e.slice(t + 1) : "";
  if (Math.floor(r.length * 3 / 4) <= Qf) return !0;
  try {
    const i = await lm(e);
    if (i !== null && i <= em) return !0;
  } catch {
  }
  return !1;
}
async function cm(e) {
  if (typeof document > "u") return null;
  const t = await ld(e, od);
  if (!t) return null;
  let r;
  try {
    r = document.createElement("canvas");
  } catch {
    return null;
  }
  r.width = Bt, r.height = Bt;
  const n = r.getContext("2d");
  if (!n) return null;
  try {
    n.drawImage(t, 0, 0, Bt, Bt);
    const { data: i } = n.getImageData(0, 0, Bt, Bt);
    let s = 0, o = 0;
    for (let c = 0; c < i.length; c += 4) {
      const l = i[c + 3] / 255, p = i[c] * l + 255 * (1 - l), a = i[c + 1] * l + 255 * (1 - l), h = i[c + 2] * l + 255 * (1 - l);
      0.299 * p + 0.587 * a + 0.114 * h >= rm && o++, s++;
    }
    return s ? o / s : null;
  } catch {
    return null;
  }
}
async function um(e, t = {}) {
  if ((t.skippedImages ?? 0) > 0) return !0;
  try {
    const r = await cm(e);
    if (r !== null && r >= tm) return !0;
  } catch {
  }
  return !1;
}
const dm = [
  "material icons",
  "material symbols",
  "fontawesome",
  "font awesome",
  "icomoon",
  "glyphicons",
  "ionicons"
], pm = /* @__PURE__ */ new Set([
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
function hm(e) {
  return ((e || "").split(",")[0] || "").trim().replace(/^['"]+|['"]+$/g, "").toLowerCase();
}
function fm(e) {
  const t = (e || "").toLowerCase();
  return dm.some((r) => t.includes(r));
}
const mm = /^[a-z0-9]+(?:[_-][a-z0-9]+)+$/i;
function gm(e) {
  const t = (e || "").trim();
  return !t || t.length > 40 || /\s/.test(t) ? !1 : mm.test(t);
}
function ym(e) {
  const t = (e.text || "").trim();
  if (!t) return !1;
  const r = e.fontFamily || "", n = hm(r);
  return e.embeddedFamilies && n && e.embeddedFamilies.has(n) ? !1 : !!(fm(r) || n && !pm.has(n) && t.includes("_") && gm(t));
}
function bm(e, t) {
  var r;
  try {
    if (!e || e.nodeType !== 1) return;
    const n = e;
    if (n.childElementCount > 0) return;
    const i = n.textContent || "";
    if (!i.trim()) return;
    const s = ((r = n.style) == null ? void 0 : r.fontFamily) || "";
    if (!s) return;
    ym({ fontFamily: s, text: i, embeddedFamilies: t }) && (n.textContent = "");
  } catch {
  }
}
const Ni = { cssText: "", embeddedFamilies: /* @__PURE__ */ new Set() }, km = 3e3, vm = 4e3, Wl = 24, jl = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
async function xm(e, t = vm) {
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
    return await new Promise((o) => {
      try {
        const c = new FileReader();
        c.onload = () => o(typeof c.result == "string" ? c.result : null), c.onerror = () => o(null), c.readAsDataURL(s);
      } catch {
        o(null);
      }
    });
  } catch {
    return null;
  } finally {
    n && clearTimeout(n);
  }
}
function wm(e) {
  var n, i, s;
  const t = [];
  let r;
  try {
    r = e.styleSheets;
  } catch {
    return t;
  }
  for (let o = 0; o < r.length && t.length < Wl; o++) {
    let c = null;
    try {
      c = r[o].cssRules;
    } catch {
      continue;
    }
    if (c)
      for (let l = 0; l < c.length && t.length < Wl; l++) {
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
function Sm(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Em(e, t, r) {
  const n = new RegExp(`url\\(\\s*(['"]?)${Sm(t)}\\1\\s*\\)`, "g");
  return e.replace(n, `url("${r}")`);
}
async function Cm(e = {}) {
  const t = /* @__PURE__ */ new Set(), r = e.doc ?? (typeof document < "u" ? document : null), n = e.faces ?? (r ? wm(r) : []);
  if (!n.length) return { cssText: "", embeddedFamilies: t };
  const i = e.baseUrl ?? (typeof location < "u" ? location.href : ""), s = e.fetchAsDataUrl ?? ((c) => xm(c)), o = [];
  for (const c of n) {
    const l = [];
    jl.lastIndex = 0;
    let p;
    for (; (p = jl.exec(c.src)) !== null; ) {
      const u = p[2];
      u && !u.startsWith("data:") && l.push(u);
    }
    if (!l.length) {
      o.push(c.cssText), t.add(c.family.toLowerCase());
      continue;
    }
    let a = c.cssText, h = !1;
    const d = await Promise.all(l.map(async (u) => {
      let m = u;
      try {
        m = new URL(u, i).href;
      } catch {
      }
      return { rawUrl: u, dataUrl: await s(m) };
    }));
    for (const { rawUrl: u, dataUrl: m } of d)
      m && (a = Em(a, u, m), h = !0);
    h && (o.push(a), t.add(c.family.toLowerCase()));
  }
  return { cssText: o.join(`
`), embeddedFamilies: t };
}
async function Mm() {
  try {
    return await Promise.race([
      Cm({}).catch(() => Ni),
      new Promise((e) => setTimeout(() => e(Ni), km))
    ]);
  } catch {
    return Ni;
  }
}
function Rm(e, t) {
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
async function Tm(e, t = {}) {
  return (await Am(e, t)).dataUrl;
}
async function Am(e, t = {}) {
  let r = 0;
  const n = t.filter, i = typeof window < "u" && Number(window.devicePixelRatio) || 1, s = t.skipFonts ? 1 : Math.min(Math.max(i, 1), 2), o = t.pixelRatio ?? s, c = t.skipFonts ? Ni : await Mm(), l = t.width && t.height ? { width: t.width, height: t.height } : void 0, p = async () => {
    r = 0;
    const a = !t.skipFonts && c.cssText ? { cssText: c.cssText } : !1, h = await Rm(jf(e, {
      scale: o,
      ...l ?? {},
      font: a,
      onCloneEachNode: (d) => bm(d, c.embeddedFamilies),
      maximumCanvasSize: Vf,
      fetch: { placeholderImage: Hf },
      filter: (d) => n && !n(d) || im(d) ? !1 : nm(d) ? (r++, !1) : !0
    }), Yf);
    if (!h.startsWith("data:image/png")) throw new Error("capture returned a non-PNG result");
    return h;
  };
  await ql(e, sd);
  try {
    let a = await p(), h = await zs(a);
    if (h) {
      await ql(e, Jf);
      try {
        const u = await p();
        await zs(u) || (a = u, h = !1);
      } catch {
      }
    }
    r && Ns(`[Klavity] capture: omitted ${r} cross-origin image(s) the page's CSP/CORS blocks — captured the rest`), h && Ns("[Klavity] capture: DOM render came back blank after retry — caller may retake with the sharp path");
    const d = h ? !1 : await um(a, { skippedImages: r });
    return { dataUrl: a, scale: o, quality: "rendered", blank: h, partial: d, skippedImages: r };
  } catch (a) {
    const h = a instanceof Error ? a.message : String(a);
    Ns(`[Klavity] capture: renderer unavailable (${h}); using fetch-free fallback`);
    const d = sm(e, n, o), u = await zs(d.dataUrl);
    return { ...d, quality: "wireframe", blank: u, partial: !1, skippedImages: 0 };
  }
}
const Lm = {
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
function _m(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function H(e, t = {}) {
  const r = Lm[e];
  if (!r)
    return console.warn("[Klavity] unknown icon: " + e), "";
  const n = t.size ?? 18, i = t.class ? `icon ${t.class}` : "icon", s = t.label ? 'role="img"' : 'aria-hidden="true"', o = t.label ? `<title>${_m(t.label)}</title>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" class="${i}" width="${n}" height="${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" ${s}>${o}${r}</svg>`;
}
const cd = "https://klavity.in", kn = {
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
function $s(e, t, r) {
  const n = r > 0 && Number.isFinite(r) ? r : 1 / 0, i = [];
  for (const s of String(t ?? "").split(`
`)) {
    if (!s.length) {
      i.push("");
      continue;
    }
    let o = "";
    for (const c of s.split(" ")) {
      let l = c;
      const p = o ? " " : "";
      if (o && e(o + p + l) <= n) {
        o += p + l;
        continue;
      }
      for (o && (i.push(o), o = ""); l.length > 1 && e(l) > n; ) {
        let a = 1, h = l.length, d = 1;
        for (; a <= h; ) {
          const u = a + h >> 1;
          e(l.slice(0, u)) <= n ? (d = u, a = u + 1) : h = u - 1;
        }
        i.push(l.slice(0, d)), l = l.slice(d);
      }
      o = l;
    }
    i.push(o);
  }
  return i.length ? i : [""];
}
function gi(e, t) {
  try {
    if (typeof e.measureText != "function") return 0;
    const r = e.measureText(t), n = r && r.width;
    return typeof n == "number" && Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}
function Im(e) {
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
function Om(e) {
  const t = Im(e);
  if (!t) return 0;
  const [r, n, i] = t.map((s) => s / 255);
  return 0.2126 * r + 0.7152 * n + 0.0722 * i;
}
function Ds(e) {
  return Om(e) > 0.55 ? "rgba(17,17,17,0.92)" : "rgba(255,255,255,0.92)";
}
class ea {
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
    const s = Ds(r);
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
      t.lineWidth = n + this.haloPad(n), t.strokeStyle = Ds(r.color), t.strokeRect(r.x, r.y, r.w, r.h), t.lineWidth = n, t.strokeStyle = r.color, t.strokeRect(r.x, r.y, r.w, r.h);
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
      t.beginPath(), t.arc(r.x, r.y, n, 0, Math.PI * 2), t.fill(), t.lineWidth = this.haloPad(this.computeLineWidth()), t.strokeStyle = Ds(r.color), t.stroke(), t.fillStyle = "#fff", t.font = `bold ${Math.round(n * 1.05)}px sans-serif`, t.textAlign = "center", t.textBaseline = "middle", t.fillText(String(r.n), r.x, r.y), t.textAlign = "start", t.textBaseline = "alphabetic";
    } else if (r.type === "text") {
      const { x: n, y: i, size: s, maxW: o } = this.textAnchor(r, t);
      t.font = `bold ${s}px sans-serif`, t.textBaseline = "top";
      const c = $s((a) => gi(t, a), r.text, o), l = s * 1.25, p = r.outline ?? "none";
      c.forEach((a, h) => {
        const d = i + h * l;
        p !== "none" && (t.lineJoin = "round", t.lineWidth = Math.max(3, s * 0.18), t.strokeStyle = p === "white" ? "#ffffff" : "#111111", t.strokeText(a, n, d)), t.fillStyle = r.color, t.fillText(a, n, d);
      }), t.textBaseline = "alphabetic";
    } else r.type === "pixelate" && this.drawPixelate(t, r);
  }
  /** Redaction: replace the pixels inside the region with a coarse mosaic (block-averaged colours). Reads
   *  back what's already painted (base image + any earlier shapes) so the redaction bakes into save()/export.
   *  No-ops safely on headless/tainted canvases (getImageData throws) — the region just isn't redacted. */
  drawPixelate(t, r) {
    const n = Math.max(0, Math.floor(Math.min(r.x, r.x + r.w))), i = Math.max(0, Math.floor(Math.min(r.y, r.y + r.h))), s = Math.min(this.canvas.width - n, Math.ceil(Math.abs(r.w))), o = Math.min(this.canvas.height - i, Math.ceil(Math.abs(r.h)));
    if (s <= 0 || o <= 0) return;
    const c = Math.max(8, Math.round(this.canvas.width / 90));
    let l;
    try {
      l = t.getImageData(n, i, s, o);
    } catch {
      l = void 0;
    }
    if (!l || !l.data) {
      t.fillStyle = "rgba(30,30,40,1)", t.fillRect(n, i, s, o);
      return;
    }
    const p = l.data;
    for (let a = 0; a < o; a += c)
      for (let h = 0; h < s; h += c) {
        let d = 0, u = 0, m = 0, f = 0;
        const y = Math.min(a + c, o), C = Math.min(h + c, s);
        for (let k = a; k < y; k++)
          for (let b = h; b < C; b++) {
            const A = (k * s + b) * 4;
            d += p[A], u += p[A + 1], m += p[A + 2], f++;
          }
        f && (t.fillStyle = `rgb(${Math.round(d / f)},${Math.round(u / f)},${Math.round(m / f)})`, t.fillRect(n + h, i + a, C - h, y - a));
      }
  }
  /** KLA-770: the clamped top-left anchor + wrap width for a text shape. The anchor is kept inside the image
   *  (so a dragged label can't be parked off-canvas) and `maxW` is the room from the anchor to the right edge
   *  (so long text wraps rather than spilling past the bounds). Shared by drawShape + textBounds so the
   *  rendered glyphs and the hit-test box always agree. */
  textAnchor(t, r) {
    const n = t.size ?? this.computeFontSize(), i = Math.max(2, n * 0.15), s = Math.max(i, Math.min(t.x, Math.max(i, this.canvas.width - i))), o = Math.max(1, this.canvas.width - s - i), c = n * 1.25;
    let l = 1;
    r && typeof r.measureText == "function" && (r.font = `bold ${n}px sans-serif`, l = Math.max(1, $s((h) => gi(r, h), t.text, o).length));
    const p = l * c, a = Math.max(0, Math.min(t.y, Math.max(0, this.canvas.height - p)));
    return { x: s, y: a, size: n, maxW: o };
  }
  /** KLA-770: the image-pixel bounding box of a committed text shape (accounting for the clamp + wrap), used
   *  by the inline annotator to hit-test a click for drag/resize. Returns null for non-text shapes or when no
   *  2D context is available (headless envs). */
  textBounds(t) {
    if (t.type !== "text") return null;
    const r = this.canvas.getContext("2d");
    if (!r || typeof r.measureText != "function") return null;
    const { x: n, y: i, size: s, maxW: o } = this.textAnchor(t, r);
    r.font = `bold ${s}px sans-serif`;
    const c = $s((d) => gi(r, d), t.text, o);
    let l = 0;
    for (const d of c) l = Math.max(l, gi(r, d));
    const p = s * 1.25, a = Math.min(Math.max(s, l), Math.max(1, this.canvas.width - n)), h = Math.min(Math.max(p, c.length * p), Math.max(1, this.canvas.height - i));
    return { x: n, y: i, w: a, h };
  }
  async save() {
    const t = this.canvas.toDataURL("image/png");
    return t.length > 5 * 1024 * 1024 ? this.canvas.toDataURL("image/jpeg", 0.85) : t;
  }
}
function Nm(e) {
  if (!Array.isArray(e)) return [];
  const t = [];
  for (const r of e)
    r && r.type === "text" && typeof r.text == "string" && r.text.trim() && t.push(r.text.trim());
  return t;
}
async function Pm(e, t, r, n) {
  return !e || !e.startsWith("data:image/") ? e || "" : !Array.isArray(t) || t.length === 0 || typeof document > "u" || typeof Image > "u" ? e : new Promise((i) => {
    try {
      const s = new Image();
      s.onload = () => {
        try {
          const o = s.naturalWidth || r || 1, c = s.naturalHeight || n || 1, l = document.createElement("canvas");
          l.width = o, l.height = c;
          const p = l.getContext("2d");
          if (!p) {
            i(e);
            return;
          }
          const a = new ea(l, e);
          t.forEach((h) => a.shapes.push({ ...h })), p.drawImage(s, 0, 0), a.redraw(), a.save().then((h) => {
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
async function zm(e, t, r) {
  const n = t.backendUrl ? t : { ...t, backendUrl: cd }, i = {
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
const $m = 50, Dm = 2e3, Fm = 1e3, Um = 500, Hl = /^(?:token|access_token|refresh_token|api[_-]?key|apikey|key|secret|password|passwd|pwd|auth|authorization|session|sid|jwt|code|otp)$/i;
function yi(e, t) {
  e.push(t), e.length > $m && e.shift();
}
function ga(e, t) {
  return e.length <= t ? e : e.slice(0, t) + "…[truncated]";
}
function Fs(e) {
  let t = String(e || "");
  try {
    const r = new URL(t, typeof location < "u" ? location.href : "http://localhost");
    let n = !1;
    r.searchParams.forEach((i, s) => {
      Hl.test(s) && (r.searchParams.set(s, "REDACTED"), n = !0);
    }), n && (t = r.toString());
  } catch {
    t = t.replace(/([?&])([^=&]+)=([^&]*)/g, (r, n, i, s) => Hl.test(i) ? `${n}${i}=REDACTED` : r);
  }
  return ga(t, Fm);
}
function Bm(e) {
  if (typeof e == "string") return e;
  if (e instanceof Error) return e.message;
  try {
    return ga(JSON.stringify(e), Um);
  } catch {
    return String(e);
  }
}
function qm(e, t = {}) {
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
function Wm(e, t = {}) {
  if (typeof window > "u") return e;
  const r = window;
  if (r.__klavityCaptureInstalled) return e;
  r.__klavityCaptureInstalled = !0;
  const n = () => t.isContextValid ? t.isContextValid() : !0, i = (l, p, a) => {
    yi(e.consoleErrors, { message: ga(p, Dm), stack: a, timestamp: Date.now(), level: l });
  }, s = window.onerror;
  if (window.onerror = (l, p, a, h, d) => {
    var u;
    if (n()) {
      const m = String(l);
      i("error", m, d == null ? void 0 : d.stack), (u = t.onError) == null || u.call(t, m, d == null ? void 0 : d.stack);
    }
    return typeof s == "function" ? s.call(window, l, p, a, h, d) : !1;
  }, window.addEventListener("unhandledrejection", (l) => {
    var h;
    if (!n()) return;
    const p = l.reason, a = String((p == null ? void 0 : p.message) ?? p);
    i("error", a, p == null ? void 0 : p.stack), (h = t.onError) == null || h.call(t, a, p == null ? void 0 : p.stack);
  }), t.consoleLevels) {
    const l = ["log", "info", "warn", "error"];
    for (const p of l) {
      const a = console[p];
      typeof a == "function" && (console[p] = (...h) => {
        try {
          n() && i(p, h.map(Bm).join(" "));
        } catch {
        }
        return a.apply(console, h);
      });
    }
  }
  const o = window.fetch;
  window.fetch = async (...l) => {
    var d;
    if (!n()) return o(...l);
    const p = Date.now(), a = typeof l[0] == "string" ? l[0] : l[0] instanceof URL ? l[0].href : l[0].url, h = (typeof l[0] == "object" && l[0] && "method" in l[0] ? l[0].method : (d = l[1]) == null ? void 0 : d.method) || "GET";
    try {
      const u = await o(...l);
      return yi(e.networkFailures, { url: Fs(a), status: u.status, method: String(h).toUpperCase(), timestamp: p, durationMs: Date.now() - p }), u;
    } catch (u) {
      throw yi(e.networkFailures, { url: Fs(a), status: 0, method: String(h).toUpperCase(), timestamp: p, durationMs: Date.now() - p }), u;
    }
  };
  const c = window.XMLHttpRequest;
  if (c && c.prototype) {
    const l = c.prototype.open, p = c.prototype.send;
    c.prototype.open = function(a, h, ...d) {
      return this.__klav = { method: String(a || "GET").toUpperCase(), url: String(h || "") }, l.call(this, a, h, ...d);
    }, c.prototype.send = function(...a) {
      const h = this.__klav;
      if (h && n()) {
        const d = Date.now();
        this.addEventListener("loadend", () => {
          try {
            yi(e.networkFailures, {
              url: Fs(h.url),
              status: Number(this.status) || 0,
              method: h.method,
              timestamp: d,
              durationMs: Date.now() - d
            });
          } catch {
          }
        });
      }
      return p.apply(this, a);
    };
  }
  return e;
}
const jm = ["light", "dark", "glass", "neon", "custom", "liquid"], Hm = ["hidden", "icon", "full", "custom"], Ym = ["lightbulb", "bug"], Vm = ["full", "reportOnly", "off"], Gm = /^#[0-9a-fA-F]{3,8}$/, Km = /^[\w \-,'"().]+$/, Yl = (e) => typeof e == "object" && e !== null, bi = (e) => typeof e == "string" && Gm.test(e.trim()) ? e.trim() : void 0, ki = (e, t) => typeof e == "string" && e.trim() ? e.trim().slice(0, t) : void 0, Xm = (e) => {
  if (typeof e != "string") return;
  const t = e.trim().slice(0, 120);
  return t && Km.test(t) ? t : void 0;
}, Vl = {
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
function Gl(e) {
  let t = e.replace("#", "");
  t.length === 3 && (t = t.split("").map((o) => o + o).join(""));
  const r = parseInt(t.slice(0, 6), 16), n = r >> 16 & 255, i = r >> 8 & 255, s = r & 255;
  return 0.299 * n + 0.587 * i + 0.114 * s;
}
function ud(e) {
  const t = Yl(e) ? e : {}, n = { theme: typeof t.theme == "string" && jm.includes(t.theme) ? t.theme : "light" }, i = bi(t.primary), s = bi(t.secondary), o = bi(t.background), c = ki(t.thankYou, 140), l = Xm(t.font);
  i && (n.primary = i), s && (n.secondary = s), o && (n.background = o), l && (n.font = l), c && (n.thankYou = c), typeof t.launcherMode == "string" && Hm.includes(t.launcherMode) && (n.launcherMode = t.launcherMode);
  const p = ki(t.launcherText, 60);
  p && (n.launcherText = p);
  const a = bi(t.launcherIconColor);
  a && (n.launcherIconColor = a), typeof t.launcherIcon == "string" && Ym.includes(t.launcherIcon) && (n.launcherIcon = t.launcherIcon), typeof t.rightClickMode == "string" && Vm.includes(t.rightClickMode) && (n.rightClickMode = t.rightClickMode), t.maskNumbers === !0 && (n.maskNumbers = !0), t.reportClarity === !0 ? n.reportClarity = !0 : t.reportClarity === !1 && (n.reportClarity = !1), t.preSubmitNudge === !1 ? n.preSubmitNudge = !1 : t.preSubmitNudge === !0 && (n.preSubmitNudge = !0), t.debug === !0 && (n.debug = !0), t.submitTargetToggle === !1 ? n.submitTargetToggle = !1 : t.submitTargetToggle === !0 && (n.submitTargetToggle = !0);
  const h = ki(t.projectDisplayName, 60);
  h && (n.projectDisplayName = h);
  const d = Yl(t.agency_branding) ? t.agency_branding : {};
  (t.whiteLabel === !0 || d.whiteLabel === !0) && (n.whiteLabel = !0);
  const u = ki(t.projectId, 200);
  return u && (n.projectId = u), (t.attributionMedium === "extension" || t.attributionMedium === "widget") && (n.attributionMedium = t.attributionMedium), n;
}
function Jm(e) {
  const t = ud(e), r = t.theme === "custom" ? { ...Vl.light } : { ...Vl[t.theme] };
  if (t.theme === "custom" && (t.primary && (r["--kl-accent"] = t.primary), t.secondary && (r["--kl-accent2"] = t.secondary), t.background)) {
    r["--kl-bg"] = t.background;
    const i = Gl(t.background) < 140;
    r["--kl-fg"] = i ? "#f4f4f7" : "#1d1d24", r["--kl-muted"] = i ? "rgba(255,255,255,.6)" : "#706560", r["--kl-border"] = i ? "rgba(255,255,255,.16)" : "#e6e6ec", r["--kl-chip"] = i ? "rgba(255,255,255,.08)" : "#f4f4f7", r["--kl-input-bg"] = i ? "rgba(255,255,255,.05)" : "#fafafb";
  }
  return t.font && (r["--kl-font"] = t.font), t.theme === "dark" || t.theme === "neon" || t.theme === "glass" || t.theme === "liquid" || t.theme === "custom" && t.background && Gl(t.background) < 140, r["--kl-img-outline"] = "var(--kl-img-outline-val, color-mix(in srgb, var(--kl-fg) 10%, transparent))", r["--kl-glow"] = "radial-gradient(120% 80% at 50% -10%, color-mix(in srgb, var(--kl-accent) 12%, transparent), transparent 60%), radial-gradient(80% 60% at 100% 110%, color-mix(in srgb, var(--kl-accent2) 6%, transparent), transparent 60%)", `:host{${Object.entries(r).map(([i, s]) => `${i}:${s};`).join("")}}`;
}
function Zm(e, t = !1, r = !1) {
  if (!e) return "";
  let n = e;
  return n = n.replace(/\s*\b(?:new paragraph|next paragraph)\b\s*/gi, `

`), n = n.replace(/\s*\b(?:new line|next line)\b\s*/gi, `
`), n = n.replace(/\b(?:full stop|period)\b/gi, "."), n = n.replace(/\bquestion mark\b/gi, "?"), n = n.replace(/\b(?:exclamation mark|exclamation point)\b/gi, "!"), n = n.replace(/\bcomma\b/gi, ","), n = n.replace(/\bsemicolon\b/gi, ";"), n = n.replace(/\bcolon\b/gi, ":"), n = n.replace(/\s+([,.:;!?])/g, "$1"), n = n.replace(/([,.:;!?])[^\S\r\n]+/g, "$1 "), n = n.replace(/([,.:;!?])\1+/g, "$1"), n = n.replace(/([,.:;!?])([^\s\d\n,.:;!?])/g, "$1 $2"), n = n.replace(/\b(i)('m|'ve|'ll|'d)?\b/gi, (i, s, o) => "I" + (o ? o.toLowerCase() : "")), n = n.replace(/(^|[.!?\n]\s*)([a-z])/g, (i, s, o) => s + o.toUpperCase()), (r || t) && n.trim() && (n = n.trim(), r && !/[.!?:]$/.test(n) && (n += ".")), n;
}
function vi(e, t) {
  if (!e) return t;
  if (!t) return e;
  const r = e.trimEnd(), n = t.trimStart();
  return r ? n ? r + " " + n : r : n;
}
function Kl(e) {
  if (!e) return "";
  let t = e.trim();
  return t ? (t = Zm(t, !0, !0), t = t.replace(/^\s*([a-z])/, (r, n) => n.toUpperCase()), t = t.replace(/([.!?\n]\s*)([a-z])/g, (r, n, i) => n + i.toUpperCase()), /[.!?:]$/.test(t) || (t += "."), t) : "";
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
      for (let o = n.resultIndex; o < n.results.length; o++) {
        const c = n.results[o], l = ((s = c[0]) == null ? void 0 : s.transcript) || "";
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
let Hn = ht;
function Qm() {
  const t = globalThis.MediaRecorder;
  return {
    getUserMedia: (r) => navigator.mediaDevices.getUserMedia(r),
    MediaRecorder: t,
    isTypeSupported: (r) => !!(t && t.isTypeSupported && t.isTypeSupported(r)),
    setTimeout: (r, n) => setTimeout(r, n),
    clearTimeout: (r) => clearTimeout(r)
  };
}
const eg = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
function dd(e) {
  for (const t of eg)
    if (e.isTypeSupported(t)) return t;
  return null;
}
const Rn = class Rn {
  constructor(t) {
    this.onTranscript = (r) => {
    }, this.onError = (r, n) => {
    }, this.onStatus = (r, n) => {
    }, this.onStop = () => {
    }, this.onUnavailable = () => {
    }, this._recording = !1, this._stream = null, this._recorder = null, this._chunks = [], this._segTimer = null, this._sessTimer = null, this._mime = null, this._firstSegment = !0, this._transcribe = t.transcribe, this._deps = { ...Qm(), ...t.deps || {} };
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
    this._stream = t, this._mime = dd(this._deps);
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
    }, this._sessTimer = this._deps.setTimeout(() => this.stop(), Rn.MAX_SESSION_MS), this._beginSegment();
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
      }, Rn.SEGMENT_MS);
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
        const o = (s.text || "").trim();
        o && this.onTranscript(o);
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
Rn.SEGMENT_MS = 2500, Rn.MAX_SESSION_MS = 18e4;
let Ui = Rn;
function tg() {
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
const rt = class rt {
  constructor(t) {
    this.onTranscript = (r) => {
    }, this.onInterim = (r) => {
    }, this.onError = (r, n) => {
    }, this.onStatus = (r, n) => {
    }, this.onStop = () => {
    }, this.onUnavailable = () => {
    }, this._recording = !1, this._stream = null, this._recorder = null, this._ws = null, this._mime = null, this._connected = !1, this._everConnected = !1, this._connectTimer = null, this._sessTimer = null, this._reconnects = 0, this._stopped = !1, this._awaitingFinal = !1, this._graceTimer = null, this._flushFallbackTimer = null, this._torn = !1, this._statusShown = !1, this._stopFired = !1, this._url = t.url, this._deps = { ...tg(), ...t.deps || {} };
  }
  // Feature-detect: WebSocket + MediaRecorder + getUserMedia. False on anything missing one.
  static isSupported(t = {}) {
    const r = globalThis, n = typeof navigator < "u" ? navigator.mediaDevices : void 0, i = !!(t.getUserMedia || n && typeof n.getUserMedia == "function"), s = t.MediaRecorder ?? r.MediaRecorder, o = t.WebSocket ?? r.WebSocket;
    return i && typeof s < "u" && typeof o < "u";
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
    this._stream = t, this._mime = dd(this._deps), this._sessTimer = this._deps.setTimeout(() => this.stop(), rt.MAX_SESSION_MS), this._openSocket();
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
    }, rt.CONNECT_TIMEOUT_MS), t.onopen = () => {
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
    if (this._reconnects >= rt.MAX_RECONNECTS) {
      this.onError("network", "Voice disconnected — tap Voice to try again"), this._teardown(!0);
      return;
    }
    this._reconnects++, this._statusShown || (this._statusShown = !0, this.onStatus("retrying", "Reconnecting dictation…"));
    const t = Math.min(rt.MAX_BACKOFF_MS, rt.BASE_BACKOFF_MS * 2 ** (this._reconnects - 1));
    this._stopRecorder(), this._deps.setTimeout(() => {
      this._recording && this._openSocket();
    }, t);
  }
  _startRecorder() {
    if (!(!this._recording || !this._ws)) {
      if (this._recorder) {
        try {
          this._recorder.state === "inactive" && this._recorder.start(rt.TIMESLICE_MS);
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
        this._recorder.start(rt.TIMESLICE_MS);
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
      const s = t, o = () => {
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
          c.onstop = () => o();
        } catch {
        }
        this._stopRecorder(), this._flushFallbackTimer = this._deps.setTimeout(o, rt.STOP_FLUSH_FALLBACK_MS);
      } else
        this._stopRecorder(), o();
      this._graceTimer = this._deps.setTimeout(() => this._finishGrace(), rt.STOP_GRACE_MS);
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
rt.MAX_SESSION_MS = 18e4, rt.TIMESLICE_MS = 150, rt.CONNECT_TIMEOUT_MS = 4e3, rt.MAX_RECONNECTS = 3, rt.BASE_BACKOFF_MS = 500, rt.MAX_BACKOFF_MS = 4e3, rt.STOP_GRACE_MS = 2e3, rt.STOP_FLUSH_FALLBACK_MS = 1200;
let Bi = rt;
function rg(e) {
  return e.hasEndpoint && e.mediaRecorderSupported ? "server" : e.webSpeechSupported ? "webspeech" : "none";
}
function Xe(e) {
  try {
    e && e.parentNode && e.parentNode.removeChild(e);
  } catch {
  }
}
const ng = /* @__PURE__ */ new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"]);
function jr(e) {
  const t = [], r = [], n = document.createTreeWalker(e, NodeFilter.SHOW_TEXT, {
    acceptNode(o) {
      let c = o.parentElement;
      for (; c && c !== e; ) {
        if (ng.has(c.tagName)) return NodeFilter.FILTER_REJECT;
        c = c.parentElement;
      }
      return /\d/.test(o.textContent ?? "") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  }), i = [];
  let s;
  for (; s = n.nextNode(); ) i.push(s);
  for (const o of i) {
    const l = (o.textContent ?? "").split(/(\d+)/);
    if (l.length <= 1) continue;
    const p = o.parentNode, a = o.nextSibling, h = l.map((d, u) => {
      if (u % 2 === 1) {
        const m = document.createElement("span");
        return m.style.cssText = "background:#111;color:transparent;border-radius:2px;", m.textContent = d, m;
      }
      return document.createTextNode(d);
    });
    Xe(o);
    for (const d of h) p.insertBefore(d, a);
    t.push({ parent: p, original: o, replacements: h });
  }
  return e.querySelectorAll("input, select").forEach((o) => {
    const c = o.value;
    /\d/.test(c) && (r.push({ el: o, original: c }), o.value = "█".repeat(c.length));
  }), () => {
    for (const { parent: o, original: c, replacements: l } of t) {
      const p = l[0];
      if ((p == null ? void 0 : p.parentNode) === o) {
        o.insertBefore(c, p);
        for (const a of l) a.parentNode === o && Xe(a);
      }
    }
    for (const { el: o, original: c } of r)
      o.value = c;
  };
}
const pd = [
  "not working",
  "doesn't work",
  "does not work",
  "doesnt work",
  "broken",
  "pls fix",
  "please fix",
  "fix it",
  "help"
], ig = /\b(when i|steps?|click|clicked|clicking|tap|tapped|then|go to|navigate|reload|refresh|press|select|enter)\b/i, sg = /(https?:\/\/|\s\/[a-z0-9]|^\/[a-z0-9])/i, og = /\b(expected?|should|instead|supposed to|meant to|i wanted)\b/i, ag = /* @__PURE__ */ new Set([
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
]), lg = { needs: "Needs detail", good: "Good", great: "Great" };
function cg(e) {
  let t = e;
  for (const r of pd) t = t.split(r).join(" ");
  return t;
}
function ug(e) {
  const t = e.split(/[^a-z0-9]+/i).filter(Boolean);
  let r = 0;
  for (const n of t)
    n.length < 3 || ag.has(n) || r++;
  return r;
}
function hd(e) {
  const t = (e || "").trim(), r = t.toLowerCase(), n = cg(r), i = ug(n), s = t.length > 0 && pd.some((d) => r.includes(d)) && i < 3, o = i >= 3 && t.length >= 12, c = og.test(r), l = ig.test(r) || sg.test(t), p = { problem: o, expected: c, repro: l }, a = (o ? 1 : 0) + (c ? 1 : 0) + (l ? 1 : 0), h = a >= 3 ? "great" : a === 2 ? "good" : "needs";
  return { score: a, coverage: p, level: h, label: lg[h], vague: s };
}
function dg(e) {
  const t = (e || "").trim();
  return t.length <= 15 ? !1 : hd(t).level !== "great";
}
const pg = [
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
function hg(e) {
  const t = (e || "").toLowerCase();
  return t ? pg.some((r) => t.includes(r)) : !1;
}
function fd(e) {
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
function md(e, t) {
  let r;
  try {
    r = new URL(e);
  } catch {
    return e;
  }
  const n = [
    ["utm_source", fd(t.source)],
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
async function fg() {
  try {
    const e = navigator.permissions;
    if (!(e != null && e.query)) return !1;
    const t = await e.query({ name: "display-capture" });
    return (t == null ? void 0 : t.state) === "granted";
  } catch {
    return !1;
  }
}
function mg() {
  try {
    return location.host || location.hostname || "this site";
  } catch {
    return "this site";
  }
}
let gg = 0;
function yg(e) {
  const t = e.host || mg(), r = "kl-shp-" + ++gg, n = document.createElement("div");
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
  const o = document.createElement("span");
  o.className = "kl-shp-k", o.textContent = "K";
  const c = document.createElement("b");
  c.textContent = e.title, s.append(o, c);
  const l = document.createElement("div");
  l.className = "kl-shp-dlg";
  const p = document.createElement("div");
  p.className = "kl-shp-dh";
  const a = document.createElement("div");
  a.className = "kl-shp-dt", a.textContent = `Allow ${t} to see this tab?`;
  const h = document.createElement("div");
  h.className = "kl-shp-ds", h.textContent = "The site will be able to see the contents of this tab", p.append(a, h);
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
  const C = document.createElement("div");
  C.className = "kl-shp-foot";
  const k = document.createElement("span");
  k.className = "kl-shp-cancel", k.textContent = "Cancel", k.style.cursor = "pointer", k.addEventListener("click", (R) => {
    var I;
    R.stopPropagation(), n.classList.remove("kl-show");
    try {
      (I = e.onCancel) == null || I.call(e);
    } catch {
    }
  });
  const b = document.createElement("span");
  b.className = "kl-shp-allow", b.textContent = "Allow", C.append(k, b), l.append(p, d, C);
  const A = document.createElement("div");
  A.className = "kl-shp-steer";
  const S = document.createElement("span");
  S.className = "kl-shp-n", S.textContent = "1";
  const x = document.createElement("span");
  return x.textContent = e.steer, A.append(S, x), n.append(i, s, l, A), n;
}
const bg = 1, kg = 6, vg = 1.08;
function xg(e, t = bg, r = kg) {
  return Number.isFinite(e) ? Math.min(r, Math.max(t, e)) : t;
}
function wg(e, t = vg) {
  return e < 0 ? t : 1 / t;
}
function Sg(e) {
  return e ? "transform .1s ease-out" : "transform .34s cubic-bezier(.22,1.24,.32,1)";
}
function gd(e, t) {
  return t > 0 ? e.width / t : 1;
}
function Eg(e, t, r, n, i, s) {
  const o = (e - r.left - s.panX) / n, c = (t - r.top - s.panY) / n;
  return { panX: e - r.left - i * o, panY: t - r.top - i * c };
}
function Cg(e, t, r, n, i, s) {
  const o = gd(t, i) * n, c = (u) => Math.min(i, Math.max(0, u)), l = (u) => Math.min(s, Math.max(0, u)), p = o > 0 ? c((e.left - t.left - r.panX) / o) : 0, a = o > 0 ? c((e.right - t.left - r.panX) / o) : i, h = o > 0 ? l((e.top - t.top - r.panY) / o) : 0, d = o > 0 ? l((e.bottom - t.top - r.panY) / o) : s;
  return { x: p, y: h, w: Math.max(0, a - p), h: Math.max(0, d - h) };
}
function Mg(e, t, r, n, i, s) {
  const o = r > 0 ? e / r * i : 0, c = n > 0 ? t / n * s : 0;
  return { ix: Math.min(i, Math.max(0, o)), iy: Math.min(s, Math.max(0, c)) };
}
function Rg(e, t, r, n, i, s) {
  const o = gd(n, s) * i, c = (r.left + r.right) / 2, l = (r.top + r.bottom) / 2;
  return { panX: c - n.left - o * e, panY: l - n.top - o * t };
}
function Tg(e) {
  return md("https://klavity.in", {
    campaign: "powered-by",
    medium: "annotation-editor",
    source: "snap-widget",
    // utm_content = the customer project id, or (when we don't have one) the embedding host, so we can still
    // see who clicked.
    ref: e || fd()
  });
}
function Ag(e) {
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
function Lg(e, t, r) {
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
function Me(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function Xl(e) {
  let t = Me(String(e ?? ""));
  return t = t.replace(/`([^`\n]+)`/g, (r, n) => `<span class="kl-mk">\`</span><code>${n}</code><span class="kl-mk">\`</span>`), t = t.replace(/\*([^*\n]+)\*/g, (r, n) => `<span class="kl-mk">*</span><b>${n}</b><span class="kl-mk">*</span>`), t = t.replace(/_([^_\n]+)_/g, (r, n) => `<span class="kl-mk">_</span><i>${n}</i><span class="kl-mk">_</span>`), t = t.replace(/~([^~\n]+)~/g, (r, n) => `<span class="kl-mk">~</span><s>${n}</s><span class="kl-mk">~</span>`), t = t.replace(/\n/g, "<br>"), t;
}
function Jl(e) {
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
const ta = [
  { label: "High", priority: "P1", severity: "C1" },
  { label: "Medium", priority: "P2", severity: "C2" },
  { label: "Low", priority: "P3", severity: "C3" }
];
function _g(e) {
  var t;
  return ((t = ta.find((r) => r.priority === String(e || "").toUpperCase())) == null ? void 0 : t.label) || "";
}
function Ig(e) {
  const t = (o) => {
    const c = /^\s*(?:(\d+):)?(\d{1,2}):(\d{2})\s*$/.exec(o) || /^\s*()(\d+)\s*$/.exec(o);
    return c ? c[3] === void 0 ? Number(c[2]) : Number(c[1] || 0) * 3600 + Number(c[2]) * 60 + Number(c[3]) : null;
  }, [r, n] = String(e || "").split(/\s*[–—-]\s*/), i = r ? t(r) : null, s = n ? t(n) : null;
  return { startSec: i, endSec: i != null && s != null && s <= i ? null : s };
}
function Og(e, t) {
  const r = String(e || "").split(`
`).map((n) => n.replace(/\*/g, "").trim()).filter(Boolean);
  return r.length && r[0] === String(t || "").trim() && r.shift(), r.join(" ").replace(/\s+/g, " ").trim();
}
function Ng(e, t, r = 960, n = 6e3) {
  return new Promise((i) => {
    let s = !1;
    const o = document.createElement("video"), c = (p) => {
      if (!s) {
        s = !0, clearTimeout(l);
        try {
          o.removeAttribute("src"), o.load();
        } catch {
        }
        i(p);
      }
    }, l = setTimeout(() => c(null), n);
    o.muted = !0, o.preload = "auto", o.setAttribute("playsinline", ""), o.onerror = () => c(null), o.onloadedmetadata = () => {
      const p = isFinite(o.duration) && o.duration > 0 ? o.duration : t + 1;
      try {
        o.currentTime = Math.max(0, Math.min(t, p - 0.1));
      } catch {
        c(null);
      }
    }, o.onseeked = () => {
      try {
        const p = o.videoWidth, a = o.videoHeight;
        if (!p || !a) return c(null);
        const h = Math.min(1, r / p), d = document.createElement("canvas");
        d.width = Math.round(p * h), d.height = Math.round(a * h);
        const u = d.getContext("2d");
        if (!u) return c(null);
        u.drawImage(o, 0, 0, d.width, d.height), c(d.toDataURL("image/jpeg", 0.82));
      } catch {
        c(null);
      }
    };
    try {
      o.src = e;
    } catch {
      c(null);
    }
  });
}
function Zl(e) {
  const t = Array.isArray(e.stepsToReproduce) ? e.stepsToReproduce : [];
  return !e.actualResult && !e.expectedResult && !t.length ? String(e.description || "").trim() : yd({
    summary: String(e.title || "").trim(),
    actualResult: e.actualResult || "",
    expectedResult: e.expectedResult || "",
    stepsToReproduce: t,
    suggestedSeverity: e.suggestedSeverity || "",
    suggestedPriority: e.suggestedPriority || ""
  });
}
function ra(e, t) {
  const r = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`, n = typeof e == "number" && isFinite(e) && e >= 0 ? e : null, i = typeof t == "number" && isFinite(t) && t >= 0 ? t : null;
  return n == null ? i == null ? "" : r(i) : i == null || i <= n ? r(n) : `${r(n)}–${r(i)}`;
}
function Ql(e, t) {
  const r = String(e.description || "").trim(), n = String(t.reporterNote || "").trim();
  if (t.primary) return n && n !== r ? `${r}

Reporter note:
${n}` : r;
  const i = ra(e.startSec, e.endSec), s = t.videoKey ? `${t.videoKey}${t.videoTitle ? ` (“${t.videoTitle}”)` : ""}` : t.videoTitle ? `“${t.videoTitle}”` : "";
  return `${r}

—
Split from a Record me walkthrough${i ? ` — this issue is at ${i} of the attached recording` : ""}.${s ? ` Related: ${s}.` : ""}`;
}
function yd(e) {
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
function Pg(e) {
  const t = /^fb_([0-9a-f]{8})[0-9a-f-]+$/i.exec(e);
  return t ? "fb_" + t[1] : e;
}
const zg = /^[A-Za-z][A-Za-z0-9]{1,9}-\d+$/;
function $g(e) {
  if (!e) return "";
  try {
    const t = new URL(e);
    if (t.protocol !== "https:" && t.protocol !== "http:") return "";
    const r = t.pathname.split("/").filter(Boolean).pop() || "";
    return zg.test(r) ? r : "";
  } catch {
    return "";
  }
}
function Us(e, t) {
  return $g(t) || Pg(e);
}
function Bs(e) {
  if (!e) return "";
  try {
    const t = new URL(e);
    return t.protocol === "https:" || t.protocol === "http:" ? t.href : "";
  } catch {
    return "";
  }
}
function sr(e) {
  return typeof e == "string" ? { dataUrl: e } : { dataUrl: e.dataUrl, quality: e.quality, suggestSharp: e.suggestSharp, blank: e.blank };
}
function ec(e) {
  return e.screenCaptureDefault && typeof e.onCaptureSharp == "function" ? "screen" : typeof e.onCaptureViewport == "function" ? "viewport" : typeof e.onCaptureFull == "function" ? "full" : "none";
}
function Dg(e) {
  const t = e && typeof e == "object" && "name" in e ? String(e.name) : "";
  return t === "NotAllowedError" || t === "AbortError" || t === "NotFoundError" || t === "InvalidStateError";
}
const Fg = {
  "real-pixel": { label: "Sharp", iconName: "check-circle", degraded: !1 },
  rendered: { label: "Rendered", iconName: "image", degraded: !0 },
  wireframe: { label: "Wireframe", iconName: "triangle-alert", degraded: !0 }
};
function na(e) {
  return (e.type || "").toLowerCase().startsWith("video/") || /\.(mp4|m4v|mov|webm|avi|mkv|ogv|3gp)$/i.test(e.name || "");
}
function Ug(e) {
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
const Bg = "image/*,.heic,.heif,video/*,.pdf,.log,.har,.txt,.json,.csv,.zip,.xml,.yml,.yaml", qg = 100, Wg = qg * 1024 * 1024;
function jg(e) {
  return (e.type || "").toLowerCase().startsWith("image/") || /\.(heic|heif|png|jpe?g|gif|webp|bmp|avif|svg)$/i.test(e.name || "");
}
function gn(e) {
  return na(e) ? "video" : jg(e) ? "image" : "file";
}
function Hg(e, t) {
  if (e.size <= t.capBytes) return { overCap: !1 };
  const r = Math.round(t.capBytes / 1024 / 1024), n = t.role === "owner" || t.role === "admin" || t.role === "member", s = `${e.name ? `"${e.name}"` : "This file"} is over the ${r}MB limit on your plan.`, o = n ? { kind: "upgrade", label: "Request upgrade", url: t.upgradeUrl, reason: "storage_over_cap", hint: "or attach a smaller file" } : { kind: "ask-team", label: "Request upgrade", reason: "storage_over_cap", hint: "or attach a smaller file" };
  return { overCap: !0, message: s, cta: o };
}
function xi(e) {
  return e == null || typeof e != "number" || !isFinite(e) ? null : Math.max(0, Math.min(100, Math.round(e)));
}
function Yg(e, t, r = {}) {
  var vl, xl, wl, Sl, El;
  const n = ud(r);
  let i = !!n.maskNumbers;
  const s = document.createElement("div");
  s.setAttribute("data-klavity-ui", "composer"), s.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;";
  const o = s.attachShadow({ mode: "open" });
  document.body.appendChild(s);
  let c = [], l = !1, p = [], a = [], h = [], d = null, u = [], m = !1, f = !1, y = !1, C = !1;
  const k = !!t.onMinimize, b = k ? 8 : 5, A = 3e4, S = 10 * 1024 * 1024, x = !!t.allowFileAttachments, R = 5, I = t.maxFileBytes && t.maxFileBytes > 0 ? t.maxFileBytes : Wg, F = t.reporterRole ?? "anon", z = t.upgradeUrl, Q = Math.max(120 * 1024 * 1024, I + 20 * 1024 * 1024);
  let B = [];
  const N = /* @__PURE__ */ new WeakMap(), De = () => typeof URL < "u" && typeof URL.createObjectURL == "function", Je = (g) => N.get(g) || g.dataUrl, fe = (g) => {
    const v = N.get(g);
    if (v) {
      try {
        URL.revokeObjectURL(v);
      } catch {
      }
      N.delete(g);
    }
  };
  let pe = null;
  const Re = !!(t.allowRecording && t.onRecord), Ue = Re && !!t.onSplitRecording, Te = rg({
    hasEndpoint: !!t.onDictate,
    mediaRecorderSupported: Ui.isSupported(),
    webSpeechSupported: Hn.isSupported()
  }), ke = Te !== "none", Ge = 2;
  let P = t.initialRecordings && Array.isArray(t.initialRecordings) ? [...t.initialRecordings] : [], Y = P.map((g) => g.id || g.dataUrl).join("|");
  const oe = t.issueTypes && t.issueTypes.length ? t.issueTypes : null, re = {};
  let ce = null;
  const Ae = () => {
    const g = Object.keys(re);
    if (!g.length && !ce) return null;
    const v = {};
    if (g.length) {
      const w = {};
      for (const E of g) w[E] = re[E];
      const M = re[0] ?? re[Number(g[0])] ?? {};
      Object.assign(v, M, { byIndex: w });
    }
    return ce && (v.selector = ce.selector, v.selectorText = ce.text), v;
  };
  let Be = e, Se = 0, K = null, se = null, ge = null, Le = t.replayState === "attached", je = null, ve = null, qe = "idle", ut = null, Ee = null, lt = null, It = !1, Wt = "", Ot = 0, Pe = null, xt = !1, tr = "", Nt = null, Rt = null, wt = null, jt = null, tt = !1;
  const ue = [];
  function ze(g) {
    if (typeof window > "u") return;
    const v = () => {
      tt || g();
    };
    window.addEventListener("beforeunload", v), window.addEventListener("pagehide", v), ue.push(() => {
      window.removeEventListener("beforeunload", v), window.removeEventListener("pagehide", v);
    });
  }
  const et = 4e3, Pt = 5e3, _e = {}, st = {}, pr = (g) => g ? JSON.parse(JSON.stringify(g)) : null, rr = (g) => {
    var v;
    try {
      (v = t.onAnnotationsChanged) == null || v.call(t, g, pr(re[g]));
    } catch {
    }
  }, Pn = () => {
    const g = {};
    for (const v of Object.keys(re)) {
      const w = re[v];
      w && (g[Number(v)] = pr(w));
    }
    return g;
  }, on = (g) => ({
    url: c[g],
    compressed: p[g],
    ann: pr(re[g])
  }), an = (g) => {
    (_e[g] ?? (_e[g] = [])).push(on(g));
  }, ja = (g, v) => {
    c[g] = v.url, p[g] = v.compressed, v.ann ? re[g] = pr(v.ann) : delete re[g];
  }, Ha = (g) => {
    const v = _e[g];
    if (!v || !v.length) return !1;
    const w = v.pop(), M = st[g];
    for (; M && M.length && M[M.length - 1].mark >= v.length; ) M.pop();
    return ja(g, w), rr(g), Oe(), !0;
  }, Np = (g) => {
    const v = st[g];
    if (!v || !v.length) return !1;
    const { snap: w, mark: M } = v.pop();
    return _e[g] && (_e[g].length = Math.min(_e[g].length, M)), ja(g, w), rr(g), Oe(), !0;
  }, Ya = document.createElement("style");
  Ya.textContent = `
    ${Jm(n)}
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
  `, o.appendChild(Ya);
  const $r = document.createElement("div");
  $r.className = "klavity-overlay";
  const le = document.createElement("div");
  le.className = "klavity-modal", le.innerHTML = `
    ${k ? '<button class="klavity-min" id="klavity-min" type="button" aria-label="Minimize" title="Minimize (keeps your evidence)"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>' : ""}
    <button class="klavity-x" id="klavity-x" type="button" aria-label="Close" title="Close (Esc)">${H("x", { size: 16 })}</button>
    <div class="kl-hero" id="klavity-hero">
      <div class="kl-hero-tools" id="klavity-hero-tools"></div>
      <div class="kl-hero-stage" id="klavity-hero-stage">
        <div class="kl-hero-empty" id="klavity-hero-empty">${H("image", { size: 34 })}<span id="klavity-hero-empty-txt">Capture or upload a screenshot to start marking it up</span></div>
      </div>
      <div class="klavity-strip" id="klavity-strip"></div>
      ${t.onCaptureSharp ? '<div class="klavity-sharphint" id="klavity-sharphint" role="status" aria-live="polite" hidden></div>' : ""}
    </div>
    <div class="kl-side" id="klavity-side">
      ${t.showTitleField ? '<label class="klavity-title-label" for="klavity-title">Title<input type="text" class="klavity-title" id="klavity-title" maxlength="200" placeholder="One line summarising the issue"></label>' : ""}
      ${oe ? `<div class="klavity-types" id="klavity-types" role="radiogroup" aria-label="Issue type">${oe.map((g) => `<button type="button" class="kl-type-chip${g.value === e ? " active" : ""}" data-kind="${Me(g.value)}" role="radio" aria-checked="${g.value === e ? "true" : "false"}">${Me(g.label)}${g.mappingLabel ? `<span class="kl-type-map">${Me(g.mappingLabel)}</span>` : ""}</button>`).join("")}</div>` : `<div class="klavity-toggle">
        <button class="kl-toggle-bug ${e === "bug" ? "active" : ""}"><span class="kl-cap-ic">${H("bug")}</span>Bug</button>
        <button class="kl-toggle-feat ${e === "feature" ? "active" : ""}"><span class="kl-cap-ic">${H("lightbulb")}</span>Feature</button>
      </div>`}
      
      
      ${Ue ? `<div class="kl-multi" id="klavity-multi">
        <div class="kl-multi-head"><span class="kl-multi-ic">${H("monitor", { size: 18 })}</span><span class="kl-multi-name">Report Multiple Issues</span><span class="kl-multi-badge">${H("sparkles", { size: 10 })} AI Powered</span></div>
        <p class="kl-multi-copy">Record your screen with voice narration. AI will analyse it, identify multiple issues and create separate tickets for you.</p>
        <button type="button" class="kl-multi-start" id="klavity-multi-start"></button>
        <p class="kl-multi-status" id="klavity-multi-status" role="status" aria-live="polite" hidden></p>
      </div>` : ""}
      <div class="klavity-actions">
        ${t.onCaptureSharp ? `<button id="klavity-sharp" class="kl-cap-primary" aria-label="Snap capture" title="Snap capture" aria-describedby="klavity-sharp-tip"><span class="kl-cap-main"><span class="kl-cap-ic">${H("app-window")}</span><span class="kl-sharp-label">Snap</span></span><span class="kl-info-badge" aria-hidden="true"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></span><span id="klavity-sharp-tip" class="klavity-info-pop" role="tooltip"><b>Snap</b> grabs the <b>whole page — every image, embedded frame, and web font, pixel-perfect</b>${t.snapWithoutSharePrompt ? "." : " using your browser's screen-share. Your browser will ask you to <b>share this tab</b>."}</span></button>` : ""}
        <button id="klavity-full" title="Full Page — pixel-perfect capture of the whole page via tab share (captures embedded frames &amp; cross-origin images). Falls back to a fast render if you decline the share."><span class="kl-cap-ic">${H("camera")}</span><span class="kl-full-label">Full Page</span></button>
        
        <button id="klavity-upload" title="${x ? "Add a screenshot, video, or file (images, MP4, PDF, .log, .har, ...)" : "Upload a screenshot"}"><span class="kl-cap-ic">${H(x ? "paperclip" : "image")}</span><span class="kl-upload-label">${x ? "Attach" : "Upload"}</span></button>
        ${Re ? `<button id="klavity-record" title="Record your screen, camera and narration"><span class="kl-cap-ic">${H("monitor")}</span><span class="kl-record-label">Record me</span></button>` : ""}
        ${t.onRegionCapture ? `<button id="klavity-region"><span class="kl-cap-ic">${H("scissors")}</span><span class="kl-region-label">Region</span></button>` : ""}
        ${t.onPickElement ? `<button id="klavity-pick" title="Pick the exact element that's broken"><span class="kl-cap-ic">${H("mouse-pointer-2")}</span><span class="kl-pick-label">Pick element</span></button>` : ""}
      </div>
      ${t.onPickElement ? '<div class="klavity-pickinfo" id="klavity-pickinfo" role="status" aria-live="polite" hidden></div>' : ""}
      
      
      <input type="file" id="klavity-file" accept="${x ? Bg : "image/*,.heic,.heif"}" multiple style="display:none">
      ${x ? `<div class="klavity-attach-hint" id="klavity-attach-hint"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg><span>Images, video, PDF or logs — up to ${Math.round(I / 1024 / 1024)}MB each</span></div>` : ""}
      
      <div class="klavity-descbar">
        <div class="klavity-counter" id="klavity-counter" hidden>0/${b} images</div>
        ${ke ? `<button id="klavity-voice" class="kl-voice-circle" type="button" title="Voice dictation" aria-label="Voice dictation" aria-pressed="false"><span class="kl-cap-ic">${H("mic")}<span class="kl-vdot"></span><span class="kl-vstop" aria-hidden="true"></span></span><svg class="kl-vring" viewBox="0 0 32 32" aria-hidden="true"><circle class="kl-vring-bg" cx="16" cy="16" r="13" fill="none" stroke-width="2"/><circle class="kl-vring-prog" cx="16" cy="16" r="13" fill="none" stroke-width="2" stroke-dasharray="81.68" stroke-dashoffset="81.68" stroke-linecap="round" transform="rotate(-90 16 16)"/></svg></button>` : ""}
      </div>
      ${x ? '<div class="klavity-capmsg" id="klavity-capmsg" role="alert" hidden></div>' : ""}
      ${x ? '<div class="klavity-files" id="klavity-files" hidden></div>' : ""}
      
      <div class="klavity-error" id="klavity-err"></div>
      <div class="klavity-desc" id="klavity-desc" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Description" data-ph="${e === "feature" ? "Describe the feature you'd like..." : "Describe the bug..."}"></div>
      <div class="klavity-desc-hint" id="klavity-desc-hint" hidden>${H("sparkles", { size: 13 })}<span>No title needed — we'll auto-generate one for you</span></div>
      ${t.onEnhance ? `<div class="klavity-enhance-row" id="klavity-enhance-row">
        <button type="button" class="klavity-enhance-btn" id="klavity-enhance">${H("sparkles", { size: 14 })}<span>Enhance with AI</span></button>
        <button type="button" class="klavity-enhance-undo" id="klavity-enhance-undo" hidden>${H("rotate-cw", { size: 13 })}<span>Undo</span></button>
        <button type="button" class="klavity-enhance-regen" id="klavity-enhance-regen" hidden>${H("refresh-cw", { size: 13 })}<span>Regenerate</span></button>
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
          <span class="klavity-remail-sugg-check" aria-hidden="true" hidden>${H("check", { size: 13 })}</span>
        </button>
        <div class="klavity-remail-sugg-hint" id="klavity-remail-sugg-hint">Add it as a contact so the team can reply and tag you. Contacts don't get project access.</div>
      </div>
      
      </div>
      ${ke ? '<div class="klavity-voice-status" id="klavity-voice-status" role="status" aria-live="polite" hidden></div>' : ""}
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
          <button type="button" class="kl-tgt-opt on" id="klavity-target-project" role="radio" aria-checked="true" data-target="project">Your team<small>${Me(n.projectDisplayName || "your project")}</small></button>
          <button type="button" class="kl-tgt-opt" id="klavity-target-klavity" role="radio" aria-checked="false" data-target="klavity">Klavity<small>problem with this tool</small></button>
        </div>
      </div>` : ""}
      ${t.consoleAttachToggle ? `<div class="klavity-conlog" id="klavity-conlog">
        <label class="kl-conlog-lbl" title="Attach this page's captured console logs to the report">
          <input type="checkbox" id="klavity-conlog-cb" checked>${H("file-text", { size: 14 })}<span>Attach console logs</span>
        </label>
      </div>` : ""}
      <button type="button" class="klavity-submit" id="klavity-submit" disabled>Submit</button>
      <div class="klavity-progress" id="klavity-progress" role="progressbar" aria-label="Uploading report"><div class="klavity-progress-fill" id="klavity-progress-fill"></div></div>
    </div>
  `, $r.appendChild(le), o.appendChild($r);
  const Ie = o.getElementById("klavity-sharp"), Va = o.querySelector(".klavity-info-pop");
  if (Ie && Va) {
    const g = document.createElement("div");
    g.className = "kl-float-tip", g.setAttribute("role", "tooltip"), g.innerHTML = Va.innerHTML, o.appendChild(g);
    const v = yg({
      title: "One click to snap this tab",
      steer: "When the dialog appears, just click Allow — we'll grab a pixel-perfect screenshot of the issue."
    });
    v.style.position = "fixed", o.appendChild(v);
    let w = !1;
    fg().then((L) => {
      w = L;
    }).catch(() => {
    });
    const M = (L, O) => {
      const _ = Ie.getBoundingClientRect(), $ = Math.min(O, window.innerWidth - 16), U = 8, q = window.innerWidth, X = window.innerHeight;
      L.style.left = Math.max(U, Math.min(_.left + _.width / 2 - $ / 2, q - $ - U)) + "px", L.style.top = "-9999px", L.style.visibility = "hidden", L.style.display = "block";
      const Z = L.offsetHeight;
      L.style.display = "";
      let ne = _.bottom + 8;
      ne + Z + U > X && (ne = _.top - Z - 8), L.style.top = Math.max(U, Math.min(ne, X - Z - U)) + "px", L.style.visibility = "";
    }, E = () => {
      !t.snapWithoutSharePrompt && !C && !w ? (g.classList.remove("kl-show"), M(v, 288), v.classList.add("kl-show")) : (v.classList.remove("kl-show"), M(g, 228), g.classList.add("kl-show"));
    }, T = () => {
      g.classList.remove("kl-show"), v.classList.remove("kl-show");
    };
    Ie.addEventListener("mouseenter", E), Ie.addEventListener("mouseleave", T), Ie.addEventListener("focus", E), Ie.addEventListener("blur", T);
  }
  let Ga = !1, ln = null;
  function hs() {
    try {
      ln == null || ln.remove();
    } catch {
    }
    ln = null;
    try {
      Ie == null || Ie.classList.remove("kl-pulse");
    } catch {
    }
  }
  function Pp() {
    var T;
    if (Ga || !Ie || tt) return;
    Ga = !0;
    const g = document.createElement("div");
    g.className = "kl-float-tip kl-nudge", g.setAttribute("role", "status"), g.setAttribute("aria-live", "polite"), g.innerHTML = `<div class="kl-nudge-row"><span><b>This screenshot may be missing images or detail.</b> Share your screen for a pixel-perfect shot.</span><button type="button" class="kl-nudge-x" aria-label="Dismiss">${H("x", { size: 13 })}</button></div>`, o.appendChild(g), ln = g, g.style.visibility = "hidden", g.style.left = "-9999px", g.style.top = "-9999px", g.style.display = "block";
    const v = 8, w = Math.min(228, window.innerWidth - 16);
    let M = 0;
    const E = () => {
      if (!ln || tt) return;
      const L = Ie.getBoundingClientRect();
      if ((L.width === 0 || L.height === 0) && M++ < 20) {
        requestAnimationFrame(E);
        return;
      }
      const O = window.innerWidth, _ = window.innerHeight;
      g.style.visibility = "hidden", g.style.display = "block";
      const $ = g.offsetHeight;
      g.style.left = Math.max(v, Math.min(L.right - w, O - w - v)) + "px";
      let U = L.bottom + 8;
      U + $ + v > _ && (U = L.top - $ - 8), g.style.top = Math.max(v, Math.min(U, _ - $ - v)) + "px", g.style.visibility = "", g.classList.add("kl-show");
    };
    requestAnimationFrame(E), (T = g.querySelector(".kl-nudge-x")) == null || T.addEventListener("click", hs);
    try {
      Ie.classList.add("kl-pulse");
    } catch {
    }
    try {
      setTimeout(() => hs(), 9e3);
    } catch {
    }
    Ie.addEventListener("click", hs, { once: !0 });
  }
  function zp(g) {
    Le = g === "attached", ot();
  }
  const Ka = {
    shadowRoot: o,
    // Host seeds shots it already tracks (evidence-session restore, region-initial): fireAdded=false so
    // onShotAdded does NOT re-fire (which would double-persist). Page metadata is carried through as-is.
    addScreenshot: (g, v, w, M, E, T) => zt(g, v, w, !1, !!M, E, T),
    // fireAdded=true: select the new shot as the active hero + fire onShotAdded (persist). See interface doc.
    addCapturedShot: (g, v, w, M, E) => zt(g, v, w, !0, !!M, E),
    close: hr,
    // KLA-772: expose the full per-image overlay map so the host can persist it on minimize.
    getAnnotations: Pn,
    setReplayState: zp,
    // KLA-591: mirror the aggregate upload percent onto every video tile + file chip while a submit is in
    // flight. Re-renders the strip + chips so the bars paint; passing null clears them.
    setUploadProgress: (g) => {
      if (pe = xi(g), !tt)
        try {
          Oe(), ys();
        } catch {
        }
    },
    addRecording: (g) => {
      if (!g || tt) return;
      const v = P.findIndex((w) => w.id && g.id && w.id === g.id || w.dataUrl && g.dataUrl && w.dataUrl === g.dataUrl);
      v >= 0 ? (P[v] = g, se = v) : (P.push(g), se = P.length - 1), K = null, cn();
    }
  };
  function Oe() {
    const g = o.getElementById("klavity-strip"), v = o.getElementById("klavity-counter");
    g.innerHTML = "", c.forEach((w, M) => {
      const E = document.createElement("div");
      E.className = "klavity-thumb", M === Se && E.classList.add("kl-thumb-active");
      const T = document.createElement("img");
      T.src = w, T.title = "Click to select + mark up", T.addEventListener("load", () => {
        T.naturalHeight > T.naturalWidth * 1.4 && E.classList.add("kl-tall");
      }, { once: !0 }), T.addEventListener("click", () => {
        Se = M, K = null, se = null, Oe();
      });
      const L = document.createElement("button");
      L.className = "klavity-rm", L.innerHTML = H("x", { size: 13 }), L.title = "Remove", L.addEventListener("click", (U) => {
        U.stopPropagation(), Xa(M), Oe();
      });
      const O = document.createElement("button");
      O.className = "klavity-mk", O.innerHTML = H("pencil", { size: 13 }), O.title = "Mark up", O.addEventListener("click", (U) => {
        U.stopPropagation(), ph(M);
      });
      const _ = document.createElement("div");
      _.className = "klavity-thumb-media", _.append(T, L, O), E.append(_);
      const $ = a[M];
      if ($) {
        const U = Fg[$], q = document.createElement("span");
        if (q.className = "klavity-qb kl-q-" + $, q.title = $ === "real-pixel" ? "Pixel-perfect capture (every image included)" : $ === "wireframe" ? 'Wireframe fallback — layout only, images not captured. This shot may contain defects; share your screen with Snap (or "Retake sharp") for a pixel-perfect capture.' : 'Rendered screenshot — may be missing images or detail. This shot can contain defects; share your screen with Snap (or "Retake sharp") for a pixel-perfect capture.', q.innerHTML = H(U.iconName, { size: 10 }) + '<span class="klavity-qb-t">' + Me(U.label) + "</span>", _.appendChild(q), U.degraded && t.onRetakeSharp) {
          const X = document.createElement("button");
          X.type = "button", X.className = "klavity-retake", X.innerHTML = H("zap", { size: 11 }) + "<span>Retake sharp</span>", X.title = "Recapture this shot at full pixel quality", X.addEventListener("click", (Z) => {
            Z.stopPropagation(), Dp(M, X);
          }), E.appendChild(X);
        }
      }
      if (Ja.has(M)) {
        const U = document.createElement("div");
        U.className = "klavity-retake-note", U.textContent = "Markup cleared for the retake.", E.appendChild(U);
      }
      g.appendChild(E);
    }), B.forEach((w, M) => {
      if (gn(w) !== "video") return;
      const E = document.createElement("div");
      E.className = "klavity-thumb kl-video-thumb", K === M && E.classList.add("kl-thumb-active");
      const T = document.createElement("video");
      T.src = Je(w), T.muted = !0, T.preload = "metadata", T.setAttribute("playsinline", ""), T.tabIndex = -1;
      const L = document.createElement("span");
      L.className = "kl-video-play", L.setAttribute("aria-hidden", "true"), L.innerHTML = H("play", { size: 16 });
      const O = document.createElement("span");
      O.className = "kl-video-badge", O.innerHTML = H("play", { size: 9 }) + "<span>Video</span>", E.title = "Click to play " + w.name, E.addEventListener("click", () => {
        K = M, se = null, Oe();
      });
      const _ = document.createElement("button");
      _.className = "klavity-rm", _.innerHTML = H("x", { size: 13 }), _.title = "Remove", _.addEventListener("click", (U) => {
        U.stopPropagation(), Qa(M);
      }), E.append(T, L, O, _);
      const $ = xi(pe);
      if ($ != null) {
        const U = document.createElement("div");
        U.className = "kl-att-prog";
        const q = document.createElement("i");
        q.style.width = $ + "%", U.appendChild(q), E.appendChild(U);
      }
      g.appendChild(E);
    }), P.forEach((w, M) => {
      const E = document.createElement("div");
      E.className = "klavity-thumb kl-video-thumb kl-rec-tile", se === M && E.classList.add("kl-thumb-active");
      const T = document.createElement("video");
      let L = w.dataUrl;
      w.blob && typeof URL < "u" && typeof URL.createObjectURL == "function" && (L = w._previewUrl || (w._previewUrl = URL.createObjectURL(w.blob))), T.src = L, T.muted = !0, T.preload = "metadata", T.setAttribute("playsinline", ""), T.tabIndex = -1;
      const O = document.createElement("span");
      O.className = "kl-video-play", O.setAttribute("aria-hidden", "true"), O.innerHTML = H("play", { size: 16 });
      const _ = Math.round(w.durationMs / 1e3), $ = document.createElement("span");
      $.className = "kl-video-badge", $.innerHTML = H("play", { size: 9 }) + `<span>${Math.floor(_ / 60)}:${String(_ % 60).padStart(2, "0")}${w.screenOnly ? " · screen" : ""}</span>`, E.title = "Click to play your recording", E.addEventListener("click", () => {
        se = M, K = null, Oe();
      });
      const U = document.createElement("button");
      U.type = "button", U.className = "kl-rerec", U.innerHTML = H("refresh-cw", { size: 12 }), U.title = "Re-record", U.setAttribute("aria-label", "Re-record"), U.addEventListener("click", (Z) => {
        var J;
        Z.stopPropagation();
        const ne = P.splice(M, 1)[0];
        if (ne && ne._previewUrl)
          try {
            URL.revokeObjectURL(ne._previewUrl);
          } catch {
          }
        se === M ? se = null : se != null && se > M && (se -= 1), cn();
        try {
          (J = o.getElementById("klavity-record")) == null || J.click();
        } catch {
        }
      });
      const q = document.createElement("button");
      q.className = "klavity-rm", q.innerHTML = H("x", { size: 13 }), q.title = "Remove", q.addEventListener("click", (Z) => {
        Z.stopPropagation();
        const ne = P.splice(M, 1)[0];
        if (ne && ne._previewUrl)
          try {
            URL.revokeObjectURL(ne._previewUrl);
          } catch {
          }
        se === M ? se = null : se != null && se > M && (se -= 1), cn();
      }), E.append(T, O, $, U, q);
      const X = xi(pe);
      if (X != null) {
        const Z = document.createElement("div");
        Z.className = "kl-att-prog";
        const ne = document.createElement("i");
        ne.style.width = X + "%", Z.appendChild(ne), E.appendChild(Z);
      }
      g.appendChild(E);
    });
    try {
      const w = g.children[Se];
      w && typeof w.scrollIntoView == "function" && w.scrollIntoView({ block: "nearest", inline: "nearest" });
    } catch {
    }
    if (l) {
      const w = document.createElement("div");
      w.className = "kl-thumb-skel kl-loading", w.setAttribute("role", "status"), w.setAttribute("aria-label", "Capturing screenshot"), w.innerHTML = '<span class="kl-skel-spin" aria-hidden="true"></span><span>Capturing…</span>', g.appendChild(w);
    }
    v.textContent = `${c.length}/${b} images`, v instanceof HTMLElement && (v.hidden = c.length === 0), ot(), oi(), bl();
  }
  function oi() {
    const g = o.getElementById("klavity-sharphint");
    if (!g) return;
    if (c.length > 0 && Se >= 0 && Se < c.length && !!h[Se] && !m && !!t.onCaptureSharp && !$t) {
      if (!g.dataset.built) {
        g.dataset.built = "1", g.innerHTML = "";
        const M = document.createElement("span");
        M.className = "kl-sh-ic", M.innerHTML = H("triangle-alert", { size: 15 });
        const E = document.createElement("span");
        E.className = "kl-sh-txt", E.textContent = "This screenshot may be missing images or detail. Share your screen with Snap for a pixel-perfect shot.";
        const T = document.createElement("button");
        T.type = "button", T.className = "kl-sh-use", T.textContent = "Use Snap", T.addEventListener("click", () => {
          m = !0, oi(), Ie == null || Ie.click();
        });
        const L = document.createElement("button");
        L.type = "button", L.className = "kl-sh-x", L.setAttribute("aria-label", "Dismiss"), L.title = "Dismiss", L.innerHTML = H("x", { size: 12 }), L.addEventListener("click", () => {
          m = !0, oi();
        }), g.append(M, E, T, L);
      }
      g.hidden = !1, Ie == null || Ie.classList.add("kl-suggest");
    } else
      g.hidden = !0, Ie == null || Ie.classList.remove("kl-suggest");
  }
  function fs() {
    f = !0, l = !1, Oe();
  }
  function $p() {
    return f ? t.onCaptureSharp && t.snapWithoutSharePrompt ? "Couldn't grab this page automatically — click Snap for a pixel-perfect shot, or attach an image." : t.onCaptureSharp ? "Couldn't grab this page automatically — click Snap to share your tab for a pixel-perfect shot, or attach an image." : "Couldn't grab this page automatically — try Full Page, or attach an image." : y ? t.onCaptureSharp ? "This page is too large to capture automatically — click Snap for a pixel-perfect shot, or Full Page." : "This page is too large to capture automatically — click Full Page to capture it, or attach an image." : "Capture or upload a screenshot to start marking it up";
  }
  function Ht(g) {
    const v = o.getElementById("klavity-err");
    v && (v.textContent = g, v.style.display = "block");
  }
  function ms() {
    const g = o.getElementById("klavity-err");
    g && (g.style.display = "none");
  }
  function Xa(g) {
    var v;
    if (!(g < 0 || g >= c.length)) {
      c.splice(g, 1), p.splice(g, 1), a.splice(g, 1), h.splice(g, 1), u.splice(g, 1), delete re[g];
      for (const w of Object.keys(re).map(Number).filter((M) => M > g).sort((M, E) => M - E))
        re[w - 1] = re[w], delete re[w];
      try {
        (v = t.onShotRemoved) == null || v.call(t, g);
      } catch {
      }
      delete _e[g], delete st[g];
      for (const w of Object.keys(_e).map(Number).filter((M) => M > g).sort((M, E) => M - E))
        _e[w - 1] = _e[w], delete _e[w];
      for (const w of Object.keys(st).map(Number).filter((M) => M > g).sort((M, E) => M - E))
        st[w - 1] = st[w], delete st[w];
      c.length === 0 && ir(null);
    }
  }
  function zt(g, v, w, M = !0, E = !1, T, L) {
    var _;
    if (c.length >= b) {
      Ht(`You can attach up to ${b} images.`);
      return;
    }
    ms(), y = !1, f = !1, c.push(g);
    const O = c.length - 1;
    if (L && Array.isArray(L.shapes) && L.shapes.length && (re[O] = pr(L)), p.push(t.compressImage ? t.compressImage(g) : Promise.resolve(g)), a.push(v), h.push(E && v !== "real-pixel"), u.push(T), M && (Se = c.length - 1, K = null, se = null), Oe(), M)
      try {
        (_ = t.onShotAdded) == null || _.call(t, g, v);
      } catch {
      }
  }
  const Ja = /* @__PURE__ */ new Set();
  async function Dp(g, v) {
    if (!($t || !t.onRetakeSharp)) {
      ct(!0), v.classList.add("kl-loading"), s.style.display = "none";
      try {
        const w = i ? jr(document.body) : null;
        let M;
        try {
          M = await t.onRetakeSharp(u[g]);
        } finally {
          w == null || w();
        }
        if (M) {
          const { dataUrl: E, quality: T } = sr(M);
          E && (c[g] = E, p[g] = t.compressImage ? t.compressImage(E) : Promise.resolve(E), a[g] = T ?? "real-pixel", h[g] = !1, re[g] && (delete re[g], Ja.add(g), rr(g)), delete _e[g], delete st[g]);
        }
      } catch {
      } finally {
        s.style.display = "", ct(!1), Oe();
      }
    }
  }
  function Za(g) {
    return g.type.startsWith("image/") || /\.(heic|heif|png|jpe?g|gif|webp|bmp|avif|svg)$/i.test(g.name);
  }
  async function gs(g) {
    ms();
    for (const v of g) {
      if (c.length >= b) {
        Ht(`You can attach up to ${b} images.`);
        break;
      }
      if (!Za(v)) {
        Ht(`"${v.name}" isn't an image — only image files can be attached.`);
        continue;
      }
      if (v.size > S) {
        Ht(`"${v.name}" is too large — images must be under ${Math.round(S / 1024 / 1024)} MB.`);
        continue;
      }
      try {
        zt(await tc(v));
      } catch {
        Ht(`Couldn't add "${v.name}". Please try a different image.`);
      }
    }
  }
  function ys() {
    const g = o.getElementById("klavity-files");
    if (!g) return;
    g.innerHTML = "";
    const v = B.filter((w) => gn(w) === "file");
    g.hidden = v.length === 0, B.forEach((w, M) => {
      if (gn(w) !== "file") return;
      const E = document.createElement("div");
      E.className = "kl-file-chip";
      const T = document.createElement("span");
      T.className = "kl-file-ic", T.innerHTML = H("file-text", { size: 14 });
      const L = document.createElement("span");
      L.className = "kl-file-nm", L.textContent = w.name, L.title = w.name;
      const O = document.createElement("span");
      O.className = "kl-file-sz", O.textContent = w.size < 1024 ? `${w.size} B` : w.size < 1024 * 1024 ? `${Math.round(w.size / 1024)} KB` : `${(w.size / 1024 / 1024).toFixed(1)} MB`;
      const _ = document.createElement("button");
      _.type = "button", _.className = "kl-file-rm", _.setAttribute("aria-label", `Remove ${w.name}`), _.title = "Remove", _.innerHTML = H("x", { size: 11 }), _.addEventListener("click", () => {
        Qa(M);
      }), E.append(T, L, O, _);
      const $ = xi(pe);
      if ($ != null) {
        const U = document.createElement("div");
        U.className = "kl-att-prog";
        const q = document.createElement("i");
        q.style.width = $ + "%", U.appendChild(q), E.appendChild(U);
      }
      g.appendChild(E);
    }), ot();
  }
  function Qa(g) {
    const v = B[g] && gn(B[g]) === "video";
    B[g] && fe(B[g]), B.splice(g, 1), K != null && (v && K === g ? K = null : K > g && (K -= 1)), ys(), Oe();
  }
  function Fp(g, v) {
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
      let E = !1;
      try {
        E = await t.onRequestUpgrade({ reason: g.reason || "upgrade", context: v });
      } catch {
        E = !1;
      }
      if (E) {
        const T = document.createElement("span");
        T.className = "kl-capmsg-sent", T.innerHTML = `<span class="kl-capmsg-sent-ic">${H("check")}</span>Request sent to your team`, w.replaceWith(T);
      } else
        w.disabled = !1, w.textContent = M;
    }), w;
  }
  function Up(g, v) {
    const w = o.getElementById("klavity-capmsg");
    if (!w || !g.overCap) return;
    w.innerHTML = "";
    const M = document.createElement("span");
    if (M.className = "kl-capmsg-t", M.textContent = g.message || "", w.appendChild(M), g.cta) {
      const E = Fp(g.cta, v);
      if (E && w.appendChild(E), g.cta.hint) {
        const T = document.createElement("span");
        T.className = "kl-capmsg-hint", T.textContent = g.cta.hint, w.appendChild(T);
      }
    }
    w.hidden = !1;
  }
  function Bp() {
    const g = o.getElementById("klavity-capmsg");
    g && (g.hidden = !0, g.innerHTML = "");
  }
  async function qp(g) {
    ms(), Bp();
    for (const v of g) {
      if (Za(v)) {
        await gs([v]);
        continue;
      }
      if (B.length >= R) {
        Ht(`You can attach up to ${R} files.`);
        break;
      }
      const w = Hg(v, { capBytes: I, role: F, upgradeUrl: z });
      if (w.overCap) {
        Up(w, {
          page: (typeof location < "u" ? location.href : "") || "",
          fileMeta: { name: v.name, sizeMb: Math.round(v.size / 1024 / 1024 * 10) / 10 }
        });
        continue;
      }
      if (B.reduce((E, T) => E + T.size, 0) + v.size > Q) {
        Ht(`Attachments exceed the ${Math.round(Q / 1024 / 1024)} MB total limit.`);
        break;
      }
      try {
        const E = v.type || (na(v) ? Ug(v.name) : ""), T = na(v) && De(), L = T ? { name: v.name, type: E, size: v.size, dataUrl: "", blob: v } : { name: v.name, type: E, size: v.size, dataUrl: await tc(v) };
        if (T)
          try {
            N.set(L, URL.createObjectURL(v));
          } catch {
          }
        const O = B.push(L) - 1;
        ys(), gn(B[O]) === "video" && (K = O), Oe();
      } catch {
        Ht(`Couldn't add "${v.name}". Please try a different file.`);
      }
    }
  }
  function cn() {
    tt || (Oe(), ot(), Vp(), Wp());
  }
  function Wp() {
    var v;
    const g = P.map((w) => w.id || w.dataUrl).join("|");
    if (g !== Y) {
      Y = g;
      try {
        (v = t.onRecordingsChange) == null || v.call(t, P.slice());
      } catch {
      }
    }
  }
  function nr() {
    var M;
    const g = o.getElementById("klavity-multi-start"), v = o.getElementById("klavity-multi-status");
    if (!g || !v) return;
    const w = qe === "recording" ? "Stop &amp; analyse recording" : qe === "processing" ? "AI is analysing…" : qe === "done" ? "Record another walkthrough" : "Start Recording";
    if (g.innerHTML = `${qe === "processing" ? '<span class="kl-enh-loader"></span>' : H("monitor", { size: 15 })}<span>${w}</span>`, g.disabled = qe === "processing" || qe === "recording", v.classList.toggle("kl-rec", qe === "recording"), v.classList.toggle("kl-ok", qe === "done"), qe === "recording")
      v.hidden = !1, v.textContent = "Recording screen and microphone…";
    else if (qe === "done" && Ee) {
      const E = Ee.length;
      v.hidden = !1, v.innerHTML = `${E} issue${E === 1 ? "" : "s"} identified and ready for review.<button type="button" class="kl-multi-reopen" id="klavity-multi-reopen">Review</button>`, (M = v.querySelector("#klavity-multi-reopen")) == null || M.addEventListener("click", () => el());
    } else Wt ? (v.hidden = !1, v.textContent = Wt) : (v.hidden = !0, v.textContent = "");
  }
  async function jp() {
    var O, _;
    if ($t || qe === "processing" || qe === "recording" || !t.onRecord || !t.onSplitRecording) return;
    if (!!!(ut && P.includes(ut)) && P.length >= Ge) {
      Ht(`You can attach up to ${Ge} recordings.`);
      return;
    }
    const v = ++Ot;
    Wt = "", ct(!0);
    const w = ($) => {
      s.style.display = $ === "recording" ? "none" : "", $ === "recording" && v === Ot && (qe = "recording", nr());
    };
    let M = null;
    try {
      M = await t.onRecord(w);
    } catch {
      M = null;
    } finally {
      s.style.display = "", ct(!1);
    }
    if (v !== Ot || tt) return;
    if (!M) {
      qe = Ee ? "done" : "idle", nr();
      return;
    }
    for (let $ = c.length - 1; $ >= 0; $--)
      (_ = (O = re[$]) == null ? void 0 : O.shapes) != null && _.length || Xa($);
    const E = ut ? P.indexOf(ut) : -1;
    E >= 0 ? P[E] = M : P.push(M), se = E >= 0 ? E : P.length - 1, K = null, ut = M, Ee = null, lt = null, zn(), qe = "processing", cn(), nr();
    let T = null;
    try {
      const $ = M.blob || await (await fetch(M.dataUrl)).blob();
      T = await t.onSplitRecording($, { text: V.value.trim() });
    } catch {
      T = null;
    }
    if (v !== Ot || tt) return;
    const L = (T || []).filter(($) => $ && (String($.title || "").trim() || String($.description || "").trim()));
    if (!L.length) {
      ut = null, Ee = null, lt = null, qe = "idle", Wt = "We couldn't pick out separate issues in this recording — it's attached, so you can describe it and submit it as one report.", nr();
      return;
    }
    Ee = L.map(($, U) => ({
      ...$,
      id: `mi${v}_${U}`,
      title: String($.title || "").trim() || `Issue ${U + 1}`,
      kind: $.kind === "feature" ? "feature" : "bug",
      description: Zl($),
      selected: !0,
      thumb: null
    })), lt = Ee.map(($) => ({ ...$ })), It = !1, wt = null, tr = "", qe = "done", nr(), el(), Hp(v);
  }
  async function Hp(g) {
    const v = ut;
    if (!v || !Ee) return;
    let w = v.dataUrl, M = null;
    if (v.blob)
      try {
        M = URL.createObjectURL(v.blob), w = M;
      } catch {
      }
    try {
      for (const E of [...Ee]) {
        if (g !== Ot || tt) return;
        const T = typeof E.startSec == "number" ? E.startSec : 0, L = typeof E.endSec == "number" && E.endSec > T ? E.endSec : T + 2, O = w ? await Ng(w, T + Math.min(1, (L - T) / 2)) : null;
        if (g !== Ot) return;
        if (O) {
          for (const _ of [Ee, lt]) {
            const $ = _ == null ? void 0 : _.find((U) => U.id === E.id);
            $ && ($.thumb = O);
          }
          Tt();
        }
        Yp(E.id, O, g);
      }
    } finally {
      if (M)
        try {
          URL.revokeObjectURL(M);
        } catch {
        }
    }
  }
  async function Yp(g, v, w) {
    const M = t.onEnhance, E = Ee == null ? void 0 : Ee.find((_) => _.id === g);
    if (!M || !E) return;
    const T = String(E.narration || "").trim() || E.title, L = (_) => {
      for (const $ of [Ee, lt]) {
        const U = $ == null ? void 0 : $.find((q) => q.id === g);
        U && (U.enhancing = _);
      }
    };
    L(!0), Tt();
    let O = null;
    try {
      O = await M(T, { images: v ? 1 : 0, ...v ? { shot: v } : {} });
    } catch {
      O = null;
    }
    if (!(w !== Ot || tt)) {
      if (L(!1), O)
        for (const _ of [Ee, lt]) {
          const $ = _ == null ? void 0 : _.find((U) => U.id === g);
          !$ || _ === Ee && $.edited || ($.title = String(O.summary || "").trim() || $.title, $.actualResult = O.actualResult || "", $.expectedResult = O.expectedResult || "", $.stepsToReproduce = Array.isArray(O.stepsToReproduce) ? O.stepsToReproduce : [], O.suggestedSeverity && ($.suggestedSeverity = O.suggestedSeverity), O.suggestedPriority && ($.suggestedPriority = O.suggestedPriority), $.description = Zl($));
        }
      Tt();
    }
  }
  function el() {
    if (!Ee || tt) return;
    const g = o.getElementById("klavity-side");
    Pe || (Pe = document.createElement("div"), Pe.className = "kl-mr", Pe.id = "klavity-mr", Pe.setAttribute("role", "dialog"), Pe.setAttribute("aria-label", "AI Analysis Complete"), (g || le).appendChild(Pe)), g && (g.scrollTop = 0, g.classList.add("kl-mr-open")), Tt();
  }
  function zn() {
    var g;
    Nt = null, Rt = null, Pe == null || Pe.remove(), Pe = null, (g = o.getElementById("klavity-side")) == null || g.classList.remove("kl-mr-open");
  }
  function Vp() {
    !ut || P.includes(ut) || (Ot++, ut = null, Ee = null, lt = null, It = !1, qe = "idle", Wt = "", zn(), nr());
  }
  function Gp(g) {
    if (!ut) return;
    const v = P.indexOf(ut);
    if (v < 0) return;
    (se !== v || !o.querySelector(".kl-hero-video")) && (se = v, K = null, Oe());
    const w = o.querySelector(".kl-hero-video");
    if (!w) return;
    const M = () => {
      try {
        w.currentTime = Math.max(0, g);
        const E = w.play();
        E && typeof E.catch == "function" && E.catch(() => {
        });
      } catch {
      }
    };
    w.readyState >= 1 ? M() : w.addEventListener("loadedmetadata", M, { once: !0 });
  }
  function tl() {
    if (It && !wt && typeof window.confirm == "function") {
      let g = !0;
      try {
        g = window.confirm("Leave this review? Your ticket selections and edits will be discarded.");
      } catch {
        g = !0;
      }
      if (!g) return !1;
    }
    return lt && (Ee = lt.map((g) => ({ ...g }))), It = !1, !0;
  }
  function Kp(g) {
    return Og(g.description, g.title);
  }
  function Tt() {
    if (!Pe || !Ee) return;
    if (wt) {
      Qp();
      return;
    }
    const g = Ee, v = g.filter((L) => L.selected), w = g.length > 0 && v.length === g.length, M = g.length, E = v.length, T = g.map((L) => {
      const O = ra(L.startSec, L.endSec), _ = _g(L.suggestedPriority), $ = typeof L.confidence == "number" && isFinite(L.confidence) ? Math.round(L.confidence * 100) : null, U = L.kind === "feature";
      return `<div class="kl-mr-card${L.selected ? "" : " kl-off"}" data-id="${Me(L.id)}"><input type="checkbox" class="kl-mr-cb" ${L.selected ? "checked" : ""} aria-label="${L.selected ? "Deselect" : "Select"} ${Me(L.title)}"><div class="kl-mr-thumb">${L.thumb ? `<img src="${Me(L.thumb)}" alt="">` : H("play", { size: 18 })}</div><div class="kl-mr-main"><div class="kl-mr-row"><p class="kl-mr-t">${Me(L.title)}</p><button type="button" class="kl-mr-edit" aria-label="Edit ${Me(L.title)}">${H("pencil", { size: 15 })}</button></div><div class="kl-mr-badges"><span class="${U ? "kl-mr-feat" : "kl-mr-bug"}">${H(U ? "lightbulb" : "bug", { size: 10 })}${U ? "Feature" : "Bug"}</span>${_ ? `<span class="kl-mr-p${_ === "High" ? 1 : _ === "Medium" ? 2 : 3}">${_}</span>` : ""}${$ != null && $ < 85 ? `<span class="kl-mr-conf">${$}% · review</span>` : ""}${L.possibleDuplicate ? '<span class="kl-mr-dup">Possible duplicate</span>' : ""}${L.enhancing ? '<span class="kl-mr-enh"><span class="kl-enh-loader"></span>Enhancing…</span>' : ""}</div><p class="kl-mr-d">${Me(Kp(L))}</p>${O ? `<button type="button" class="kl-mr-ts" title="Open recording at this timestamp">${H("clock", { size: 11 })} ${Me(O)}</button>` : ""}</div></div>`;
    }).join("");
    Pe.innerHTML = `<div class="kl-mr-head"><button type="button" class="kl-mr-icon" id="kl-mr-back" aria-label="Back to new report">${H("chevron-left", { size: 20 })}</button><p class="kl-mr-title">AI Analysis Complete</p><button type="button" class="kl-mr-icon kl-mr-x" id="kl-mr-close" aria-label="Close">${H("x", { size: 18 })}</button></div><div class="kl-mr-body"><div class="kl-mr-inner"><div class="kl-mr-banner"><span class="kl-mr-ok">${H("check", { size: 14 })}</span><div><p class="kl-mr-b1">We've identified ${M} report${M === 1 ? "" : "s"} from your recording</p><p class="kl-mr-b2">Review, select and submit the tickets you want to create.</p></div></div><div class="kl-mr-counts"><p>${M} report${M === 1 ? "" : "s"} detected</p><p class="kl-mr-sel">${E} selected</p></div><label class="kl-mr-all"><input type="checkbox" id="kl-mr-all" ${w ? "checked" : ""} aria-label="${w ? "Deselect all tickets" : "Select all tickets"}"><span>Select all</span><span class="kl-mr-kept">Recording and transcript preserved</span></label><div class="kl-mr-list">${T}</div></div></div><div class="kl-mr-foot"><p>${E} of ${M} tickets selected</p>${tr ? `<p class="kl-mr-err" role="alert">${Me(tr)}</p>` : ""}<button type="button" class="kl-mr-submit" id="kl-mr-submit" ${E === 0 || xt ? "disabled" : ""}>${xt ? '<span class="kl-enh-loader"></span> Creating tickets…' : `Submit ${E} ${E === 1 ? "Ticket" : "Tickets"}`}</button></div>` + (Nt && Rt ? Xp() : ""), Jp();
  }
  function Xp() {
    const g = Rt, v = (w, M) => `<div class="kl-mr-seg" style="grid-template-columns:repeat(${M.length},1fr)">${M.map(([E, T, L]) => `<button type="button" class="${w}${(w === "kl-mr-kind" ? g.kind : g.priority) === E ? " kl-on" : ""}" data-v="${E}">${L}${T}</button>`).join("")}</div>`;
    return `<div class="kl-mr-layer" id="kl-mr-editor"><div class="kl-mr-dlg" role="dialog" aria-label="Edit generated ticket"><div class="kl-mr-dlg-h"><div><h3>Edit generated ticket</h3><p>Update the AI-generated details before submission.</p></div><button type="button" class="kl-mr-icon kl-mr-x" id="kl-mr-ed-x" aria-label="Close editor">${H("x", { size: 15 })}</button></div><label class="kl-mr-f"><span>Ticket title</span><input type="text" class="kl-mr-in" id="kl-mr-ed-title" maxlength="160" value="${Me(g.title)}"></label><div class="kl-mr-f"><span>Type</span>${v("kl-mr-kind", [["bug", "Bug", H("bug", { size: 13 })], ["feature", "Feature", H("lightbulb", { size: 13 })]])}</div><div class="kl-mr-f"><span>Priority</span>${v("kl-mr-pri", ta.map((w) => [w.priority, w.label, ""]))}</div><label class="kl-mr-f"><span>Description</span><textarea class="kl-mr-ta" id="kl-mr-ed-desc">${Me(g.description)}</textarea></label><label class="kl-mr-f"><span>Recording timestamp</span><input type="text" class="kl-mr-in" id="kl-mr-ed-ts" placeholder="0:42–1:10" value="${Me(g.ts)}"></label><div class="kl-mr-dlg-f"><button type="button" class="kl-mr-btn kl-danger" id="kl-mr-ed-rm">${H("trash-2", { size: 13 })} Remove</button><button type="button" class="kl-mr-btn kl-ghost" id="kl-mr-ed-cancel">Cancel</button><button type="button" class="kl-mr-btn kl-primary" id="kl-mr-ed-save" ${g.title.trim() && g.description.trim() ? "" : "disabled"}>Save changes</button></div></div></div>`;
  }
  function Jp() {
    var v, w, M, E;
    if (!Pe || !Ee) return;
    const g = (T) => Pe.querySelector(T);
    (v = g("#kl-mr-back")) == null || v.addEventListener("click", () => {
      xt || !tl() || (zn(), nr());
    }), (w = g("#kl-mr-close")) == null || w.addEventListener("click", () => {
      xt || !tl() || (zn(), hr());
    }), (M = g("#kl-mr-all")) == null || M.addEventListener("change", (T) => {
      const L = T.target.checked;
      Ee.forEach((O) => {
        O.selected = L;
      }), It = !0, Tt();
    }), (E = g("#kl-mr-submit")) == null || E.addEventListener("click", () => {
      eh();
    }), Pe.querySelectorAll(".kl-mr-card").forEach((T) => {
      var O, _, $;
      const L = Ee.find((U) => U.id === T.dataset.id);
      L && ((O = T.querySelector(".kl-mr-cb")) == null || O.addEventListener("change", (U) => {
        L.selected = U.target.checked, It = !0, Tt();
      }), (_ = T.querySelector(".kl-mr-edit")) == null || _.addEventListener("click", () => {
        var U;
        Nt = L.id, Rt = { title: L.title, kind: L.kind === "feature" ? "feature" : "bug", priority: String(L.suggestedPriority || "").toUpperCase(), description: L.description, ts: ra(L.startSec, L.endSec) }, Tt(), (U = Pe == null ? void 0 : Pe.querySelector("#kl-mr-ed-title")) == null || U.focus();
      }), ($ = T.querySelector(".kl-mr-ts")) == null || $.addEventListener("click", () => Gp(typeof L.startSec == "number" ? L.startSec : 0)));
    }), Nt && Rt && Zp();
  }
  function Zp() {
    var T, L, O, _, $, U;
    const g = Rt, v = (q) => Pe.querySelector(q), w = v("#kl-mr-ed-save"), M = () => {
      w && (w.disabled = !(g.title.trim() && g.description.trim()));
    }, E = () => {
      Nt = null, Rt = null, Tt();
    };
    (T = v("#kl-mr-ed-title")) == null || T.addEventListener("input", (q) => {
      g.title = q.target.value, M();
    }), (L = v("#kl-mr-ed-desc")) == null || L.addEventListener("input", (q) => {
      g.description = q.target.value, M();
    }), (O = v("#kl-mr-ed-ts")) == null || O.addEventListener("input", (q) => {
      g.ts = q.target.value;
    }), Pe.querySelectorAll(".kl-mr-kind,.kl-mr-pri").forEach((q) => q.addEventListener("click", () => {
      q.classList.contains("kl-mr-kind") ? g.kind = q.dataset.v === "feature" ? "feature" : "bug" : g.priority = q.dataset.v || "";
      const X = q.classList.contains("kl-mr-kind") ? ".kl-mr-kind" : ".kl-mr-pri";
      Pe.querySelectorAll(X).forEach((Z) => Z.classList.toggle("kl-on", Z === q));
    })), (_ = v("#kl-mr-ed-x")) == null || _.addEventListener("click", E), ($ = v("#kl-mr-ed-cancel")) == null || $.addEventListener("click", E), (U = v("#kl-mr-ed-rm")) == null || U.addEventListener("click", () => {
      if (Ee = Ee.filter((q) => q.id !== Nt), It = !0, Nt = null, Rt = null, !Ee.length) {
        Ee = null, qe = "idle", zn(), nr();
        return;
      }
      Tt(), nr();
    }), w == null || w.addEventListener("click", () => {
      const q = Ee.find((ne) => ne.id === Nt);
      if (!q || !g.title.trim() || !g.description.trim()) return;
      q.title = g.title.trim(), q.edited = !0, q.kind = g.kind, q.description = g.description.trim();
      const X = ta.find((ne) => ne.priority === g.priority);
      X && (q.suggestedPriority = X.priority, q.suggestedSeverity = X.severity);
      const Z = Ig(g.ts);
      q.startSec = Z.startSec, q.endSec = Z.endSec, It = !0, Nt = null, Rt = null, Tt();
    });
  }
  function Qp() {
    var M, E;
    if (!Pe || !wt) return;
    const g = wt.refs.length, v = wt.refs.filter((T) => T.key).map((T) => {
      const L = Bs(T.url), O = Me(Us(T.key, T.url));
      return L ? `<a href="${Me(L)}" target="_blank" rel="noopener">${O}</a>` : `<span>${O}</span>`;
    }).join("");
    Pe.innerHTML = `<div class="kl-mr-head"><p class="kl-mr-title" style="padding-left:6px">Tickets created</p><button type="button" class="kl-mr-icon kl-mr-x" id="kl-mr-close" aria-label="Close">${H("x", { size: 18 })}</button></div><div class="kl-mr-done"><span class="kl-mr-done-ic">${H("check", { size: 25 })}</span><h3>${g} ticket${g === 1 ? "" : "s"} created</h3><p>${Me(n.thankYou || "Your AI-generated reports have been filed.")}</p>${wt.failed ? `<p role="alert">${wt.failed} ticket${wt.failed === 1 ? "" : "s"} couldn't be created — please report ${wt.failed === 1 ? "it" : "them"} again.</p>` : ""}${v ? `<div class="kl-mr-keys">${v}</div>` : ""}<button type="button" class="kl-mr-btn kl-primary" id="kl-mr-done">Done</button></div>`;
    const w = () => hr({ reason: "submitted" });
    (M = Pe.querySelector("#kl-mr-close")) == null || M.addEventListener("click", w), (E = Pe.querySelector("#kl-mr-done")) == null || E.addEventListener("click", w);
  }
  async function eh() {
    var O;
    if (!Ee || !ut || xt) return;
    const g = Ee.filter((_) => _.selected).map((_) => ({ ..._, title: _.title.trim(), description: _.description.trim() }));
    if (!g.length) return;
    const v = hl(), w = n.submitTargetToggle !== !1 ? { feedbackTarget: ks } : {}, M = (_) => _.kind === "feature" ? "feature" : "bug", E = (_) => ({
      ..._.suggestedSeverity ? { suggestedSeverity: _.suggestedSeverity } : {},
      ..._.suggestedPriority ? { suggestedPriority: _.suggestedPriority } : {}
    }), T = g[0], L = g.slice(1);
    xt = !0, tr = "", Tt();
    try {
      const _ = await Promise.all(p.slice()), $ = ut, U = {
        type: M(T),
        ...oe ? { kind: M(T) } : {},
        title: T.title,
        description: Ql(T, { primary: !0, reporterNote: V.value.trim() }),
        screenshots: _.length ? _ : T.thumb ? [T.thumb] : [],
        ...B.length ? { files: B.slice() } : {},
        recordings: [$, ...P.filter((J) => J !== $)],
        ..._.length ? { annotations: Ae() } : {},
        reporterEmail: v.email,
        createContact: v.createContact,
        ...w,
        ...E(T),
        ...t.consoleAttachToggle ? { attachConsole: !!((O = o.getElementById("klavity-conlog-cb")) != null && O.checked) } : {}
      }, q = (J, G) => ({
        type: M(J),
        ...oe ? { kind: M(J) } : {},
        title: J.title,
        description: Ql(J, { primary: !1, videoTitle: T.title, videoKey: G }),
        screenshots: J.thumb ? [J.thumb] : [],
        recordings: [$],
        reporterEmail: v.email,
        createContact: !1,
        ...w,
        ...E(J)
      });
      if (t.backgroundUpload) {
        const J = t.onSubmit;
        J(U), (async () => {
          for (const G of L)
            try {
              await J(q(G));
            } catch (he) {
              try {
                console.error("[Klavity] multi-issue ticket failed:", he);
              } catch {
              }
            }
        })(), hr({ immediate: !0, reason: "submitted" });
        return;
      }
      const X = await t.onSubmit(U), Z = [{ key: X.issueKey, url: X.issueUrl }];
      let ne = 0;
      for (const J of L)
        try {
          const G = await t.onSubmit(q(J, X.issueKey || void 0));
          Z.push({ key: G.issueKey, url: G.issueUrl });
        } catch (G) {
          ne++;
          try {
            console.error("[Klavity] multi-issue ticket failed:", G);
          } catch {
          }
        }
      if (tt) return;
      xt = !1, wt = { refs: Z, failed: ne }, It = !1, Tt();
    } catch (_) {
      try {
        console.error("[Klavity] multi-issue submit failed:", _);
      } catch {
      }
      if (tt) return;
      xt = !1, tr = n.debug ? `Couldn't create the tickets — ${(_ == null ? void 0 : _.message) || "Unknown error"}` : "Couldn't create the tickets. Please check your connection and try again.", Tt();
    }
  }
  let Dr = null;
  function hr(g) {
    var M;
    if (tt) return;
    tt = !0;
    for (const E of ue.splice(0))
      try {
        E();
      } catch {
      }
    Ot++;
    for (const E of B) fe(E);
    for (const E of P)
      if (E._previewUrl)
        try {
          URL.revokeObjectURL(E._previewUrl);
        } catch {
        }
    if (Sr) {
      try {
        URL.revokeObjectURL(Sr);
      } catch {
      }
      Sr = null;
    }
    Dr == null || Dr(), jt && (clearTimeout(jt), jt = null), document.removeEventListener("keydown", Fr, { capture: !0 }), document.removeEventListener("paste", nl);
    try {
      (M = t.onClose) == null || M.call(t, g == null ? void 0 : g.reason);
    } catch {
    }
    const v = o.querySelector(".klavity-modal");
    if (g != null && g.immediate || !v) {
      Xe(s);
      return;
    }
    v.classList.add("kl-closing");
    const w = () => Xe(s);
    v.addEventListener("animationend", w, { once: !0 }), setTimeout(w, 700);
  }
  function rl(g, v) {
    if (jt || tt) return;
    const w = document.createElement("div");
    w.className = "klavity-toast-progress", w.style.animationDuration = v + "ms", g.appendChild(w);
    let M = v, E = Date.now();
    const T = () => {
      E = Date.now(), jt = setTimeout(() => {
        hr();
      }, M);
    }, L = () => {
      jt && (clearTimeout(jt), jt = null, M = Math.max(0, M - (Date.now() - E)), w.style.animationPlayState = "paused");
    }, O = () => {
      jt || g.classList.contains("kl-closing") || (w.style.animationPlayState = "running", T());
    };
    g.addEventListener("mouseenter", L), g.addEventListener("mouseleave", O), g.addEventListener("focusin", L), g.addEventListener("focusout", (_) => {
      g.contains(_.relatedTarget) || O();
    }), T();
  }
  function Fr(g) {
    var v;
    if (li) {
      g.key === "Escape" ? (g.stopPropagation(), li()) : (g.key === "s" || g.key === "S") && g.stopPropagation();
      return;
    }
    if (g.key === "Escape") {
      g.stopPropagation(), xs();
      return;
    }
    if ((g.key === "s" || g.key === "S") && !g.metaKey && !g.ctrlKey && !g.altKey) {
      const w = typeof g.composedPath == "function" && g.composedPath()[0] || g.target;
      if (w && (w.tagName === "INPUT" || w.tagName === "TEXTAREA" || w.tagName === "SELECT" || w.isContentEditable || ((v = w.getAttribute) == null ? void 0 : v.call(w, "contenteditable")) === "true") || o.querySelector(".kl-edtb")) return;
      const M = o.getElementById("klavity-submit");
      M && !M.disabled && (g.preventDefault(), g.stopPropagation(), M.click());
    }
  }
  document.addEventListener("keydown", Fr, { capture: !0 });
  const nl = (g) => {
    if (!g.clipboardData) return;
    const v = Array.from(g.clipboardData.items).filter((w) => w.type.startsWith("image/")).map((w) => w.getAsFile()).filter((w) => !!w);
    v.length && gs(v);
  };
  document.addEventListener("paste", nl);
  const bs = () => {
    const g = le.querySelector("#klavity-desc");
    g && (g.placeholder = Be === "feature" ? "Describe the feature you'd like..." : Be === "bug" ? "Describe the bug..." : "Describe the issue...");
  };
  if (oe) {
    const g = Array.from(le.querySelectorAll(".kl-type-chip"));
    g.forEach((v) => {
      v.addEventListener("click", () => {
        Be = v.getAttribute("data-kind") || "bug", g.forEach((w) => {
          const M = w === v;
          w.classList.toggle("active", M), w.setAttribute("aria-checked", M ? "true" : "false");
        }), bs();
      });
    });
  } else {
    const g = le.querySelector(".kl-toggle-bug"), v = le.querySelector(".kl-toggle-feat");
    g.addEventListener("click", () => {
      Be = "bug", g.classList.add("active"), v.classList.remove("active"), bs();
    }), v.addEventListener("click", () => {
      Be = "feature", v.classList.add("active"), g.classList.remove("active"), bs();
    });
  }
  let ks = "project";
  {
    const g = le.querySelector("#klavity-target");
    if (g) {
      const v = Array.from(g.querySelectorAll(".kl-tgt-opt"));
      for (const w of v)
        w.addEventListener("click", () => {
          ks = w.dataset.target === "klavity" ? "klavity" : "project";
          for (const E of v) {
            const T = E === w;
            E.classList.toggle("on", T), E.setAttribute("aria-checked", T ? "true" : "false");
          }
        });
    }
  }
  const V = le.querySelector("#klavity-desc");
  {
    const g = () => {
      try {
        return o.getSelection ? o.getSelection() : typeof window < "u" ? window.getSelection() : null;
      } catch {
        try {
          return typeof window < "u" ? window.getSelection() : null;
        } catch {
          return null;
        }
      }
    }, v = () => {
      const E = g();
      if (!E || !E.rangeCount) return -1;
      try {
        const T = E.getRangeAt(0);
        if (!V.contains(T.endContainer)) return -1;
        const L = T.cloneRange();
        return L.selectNodeContents(V), L.setEnd(T.endContainer, T.endOffset), L.toString().length;
      } catch {
        return -1;
      }
    }, w = (E) => {
      const T = g();
      if (T)
        try {
          const L = document.createRange(), O = document.createTreeWalker(V, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
          let _, $ = E, U = !1;
          for (; _ = O.nextNode(); ) {
            if (_.nodeName === "BR") {
              if ($ === 0) {
                L.setStartBefore(_), U = !0;
                break;
              }
              $ -= 1;
              continue;
            }
            if (_.nodeType === 3) {
              const q = (_.textContent || "").length;
              if ($ <= q) {
                L.setStart(_, $), U = !0;
                break;
              }
              $ -= q;
            }
          }
          U ? L.collapse(!0) : (L.selectNodeContents(V), L.collapse(!1)), T.removeAllRanges(), T.addRange(L);
        } catch {
        }
    }, M = () => {
      const E = v(), T = Jl(V).replace(/\n$/, "");
      V.innerHTML = T ? Xl(T) : "", E >= 0 && w(E);
    };
    V.addEventListener("input", M), Object.defineProperty(V, "value", {
      configurable: !0,
      get() {
        return Jl(V);
      },
      set(E) {
        const T = String(E ?? "").replace(/\n$/, "");
        V.innerHTML = T ? Xl(T) : "";
      }
    }), Object.defineProperty(V, "disabled", {
      configurable: !0,
      get() {
        return V.getAttribute("contenteditable") === "false";
      },
      set(E) {
        V.setAttribute("contenteditable", E ? "false" : "true"), V.classList.toggle("kl-desc-disabled", !!E);
      }
    }), Object.defineProperty(V, "placeholder", {
      configurable: !0,
      get() {
        return V.getAttribute("data-ph") || "";
      },
      set(E) {
        V.setAttribute("data-ph", String(E ?? ""));
      }
    });
  }
  const Ur = le.querySelector("#klavity-submit"), ye = le.querySelector("#klavity-remail");
  let vr = "", $n = !1;
  ye && t.prefillEmail && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t.prefillEmail) && (ye.value = t.prefillEmail), ye && ye.value.trim() && (vr = ye.value.trim().toLowerCase());
  const il = le.querySelector("#klavity-desc-hint"), th = () => !t.requireEmail || !!ye && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(ye.value.trim()), vs = () => {
    var g;
    return c.length > 0 || Le || B.length > 0 || P.length > 0 || V.value.trim().length > 0 || (((g = le.querySelector("#klavity-title")) == null ? void 0 : g.value.trim().length) ?? 0) > 0;
  };
  let ai = null, li = null;
  const xs = () => {
    var M, E, T;
    if (!vs()) {
      hr();
      return;
    }
    if (ai) return;
    const g = document.createElement("div");
    ai = g, g.setAttribute("role", "alertdialog"), g.setAttribute("aria-modal", "true"), g.setAttribute("aria-labelledby", "kl-cc-title"), g.style.cssText = "position:absolute;inset:0;z-index:30;display:flex;align-items:center;justify-content:center;background:rgba(12,10,8,.55);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)", g.innerHTML = '<div style="max-width:340px;background:var(--kl-bg,#1c1712);color:var(--kl-fg,#f5f3ee);border:1px solid var(--kl-border,#574f45);border-radius:14px;padding:20px 20px 16px;box-shadow:0 18px 48px rgba(0,0,0,.45);font-family:var(--kl-font,system-ui,sans-serif)"><div id="kl-cc-title" style="font-size:15px;font-weight:600;margin-bottom:6px">Discard this capture?</div><div style="font-size:13px;opacity:.8;line-height:1.45;margin-bottom:16px">Your screenshot and any annotations, recording or attached files will be lost.</div><div style="display:flex;gap:8px;justify-content:flex-end"><button id="kl-cc-keep" style="padding:8px 14px;border-radius:9px;border:1px solid var(--kl-border,#574f45);background:transparent;color:inherit;font-size:13px;font-weight:600;cursor:pointer">Keep editing</button><button id="kl-cc-discard" style="padding:8px 14px;border-radius:9px;border:none;background:#c0392b;color:#fff;font-size:13px;font-weight:600;cursor:pointer">Discard</button></div></div>';
    const v = () => {
      Xe(g), ai === g && (ai = null, li = null);
    };
    li = v, g.addEventListener("click", (L) => {
      L.target === g && v();
    }), (M = g.querySelector("#kl-cc-keep")) == null || M.addEventListener("click", v), (E = g.querySelector("#kl-cc-discard")) == null || E.addEventListener("click", () => {
      v(), hr({ reason: "discard" });
    }), (o.querySelector(".klavity-modal") || $r).appendChild(g);
    try {
      (T = g.querySelector("#kl-cc-keep")) == null || T.focus();
    } catch {
    }
  }, rh = () => {
  }, ot = () => {
    const g = V.value.trim() === "";
    Ur.disabled = g && !vs() || !th(), il && (il.hidden = !(g && vs()));
  };
  if (V.addEventListener("input", rh), V.addEventListener("input", ot), ye == null || ye.addEventListener("input", ot), t.onDescriptionChange) {
    const g = t.onDescriptionChange;
    let v = null;
    const w = () => {
      v && (clearTimeout(v), v = null);
      try {
        g(V.value);
      } catch {
      }
    };
    V.addEventListener("input", () => {
      v && clearTimeout(v), v = setTimeout(w, 600);
    }), V.addEventListener("blur", w), V.addEventListener("change", w), ze(w);
  }
  const Dn = le.querySelector("#klavity-title");
  if (Dn && t.onTitleChange) {
    const g = t.onTitleChange;
    let v = null;
    const w = () => {
      v && (clearTimeout(v), v = null);
      try {
        g(Dn.value);
      } catch {
      }
    };
    Dn.addEventListener("input", () => {
      v && clearTimeout(v), v = setTimeout(w, 600);
    }), Dn.addEventListener("blur", w), Dn.addEventListener("change", w), ze(w);
  }
  const Br = le.querySelector("#klavity-remail-sugg"), ws = le.querySelector("#klavity-remail-matches"), sl = le.querySelector("#klavity-remail-sugg-hint"), xr = le.querySelector("#klavity-remail-addcontact"), ol = le.querySelector(".klavity-remail-sugg-em"), al = le.querySelector(".klavity-remail-sugg-check");
  let Yt = !1, un = "", ci = [], Ss = "", Es = !1, ll = 0;
  const cl = (g) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(g), nh = (g) => {
    var M, E;
    const v = (g.name || g.email).trim(), w = v.split(/[\s._-]+/).filter(Boolean);
    return ((((M = w[0]) == null ? void 0 : M[0]) || "") + (((E = w[1]) == null ? void 0 : E[0]) || "")).toUpperCase() || v.slice(0, 1).toUpperCase();
  }, ih = (g) => {
    let v = 0;
    for (let w = 0; w < g.length; w++) v = v * 31 + g.charCodeAt(w) >>> 0;
    return `hsl(${v % 360} 58% 42%)`;
  };
  async function ul(g) {
    if (!t.onLookupPeople) {
      ci = [], Ss = g, Es = !0;
      return;
    }
    const v = ++ll;
    try {
      const w = await t.onLookupPeople(g);
      if (v !== ll) return;
      ci = Array.isArray(w) ? w : [];
    } catch {
      ci = [];
    }
    Ss = g, Es = !0, wr();
  }
  function wr() {
    if (!Br || !ye) return;
    const g = ye.value.trim(), v = g.toLowerCase();
    Yt && v !== un && (Yt = !1, un = "");
    const w = $n ? ci.filter((L) => !v || L.email.toLowerCase().includes(v)) : [], M = w.some((L) => L.email.toLowerCase() === v), E = $n && cl(g) && !M;
    ws && (ws.innerHTML = w.map((L) => `
        <button type="button" class="klavity-remail-person" role="option" data-email="${Me(L.email)}">
          <span class="klavity-remail-av" style="background:${Me(ih(L.email))}">${Me(nh(L))}</span>
          <span class="klavity-remail-who">${L.name ? `${Me(L.name)} <i>(${Me(L.email)})</i>` : Me(L.email)}</span>
        </button>`).join(""), ws.querySelectorAll(".klavity-remail-person").forEach((L) => {
      L.addEventListener("click", () => {
        var O;
        ye.value = L.getAttribute("data-email") || "", Yt = !1, un = "", vr = ye.value.trim().toLowerCase(), (O = t.onRememberEmail) == null || O.call(t, vr), wr(), ot();
      });
    }));
    const T = ye.parentElement;
    T && T.classList.contains("klavity-remail-wrap") && T.classList.toggle("is-open", !!(w.length || E)), ye.setAttribute("aria-expanded", w.length || E ? "true" : "false"), xr && (xr.hidden = !E), sl && (sl.hidden = !E), Br.hidden = !(w.length || E), ol && (ol.textContent = g), al && (al.hidden = !Yt), xr == null || xr.setAttribute("aria-selected", Yt ? "true" : "false");
  }
  xr == null || xr.addEventListener("click", () => {
    var v;
    const g = (ye == null ? void 0 : ye.value.trim()) || "";
    cl(g) && (Yt = !Yt, un = Yt ? g.toLowerCase() : "", vr = Yt ? g.toLowerCase() : "", vr && ((v = t.onRememberEmail) == null || v.call(t, vr)), wr(), ot());
  });
  function sh() {
    if (!ye || t.requireEmail) return;
    const g = ye.value.trim();
    g && g.toLowerCase() !== vr && (ye.value = "", Yt = !1, un = "", vr = "", wr(), ot());
  }
  function dl() {
    setTimeout(() => {
      var M;
      const v = le.getRootNode().activeElement;
      v === ye || Br && v && Br.contains(v) || ($n = !1, ye && !ye.value.trim() && ((M = t.onRememberEmail) == null || M.call(t, "")), sh(), wr());
    }, 0);
  }
  ye == null || ye.addEventListener("blur", dl), Br == null || Br.addEventListener("focusout", dl);
  let Cs = null;
  if (ye == null || ye.addEventListener("focus", () => {
    $n = !0, wr(), Es || ul("");
  }), ye == null || ye.addEventListener("input", () => {
    $n = !0, wr();
    const g = ye.value.trim().toLowerCase();
    g !== Ss && (Cs && clearTimeout(Cs), Cs = setTimeout(() => {
      ul(g);
    }, 180));
  }), wr(), t.onEnhance) {
    const g = t.onEnhance, v = le.querySelector("#klavity-enhance"), w = le.querySelector("#klavity-enhance-undo"), M = le.querySelector("#klavity-enhance-regen"), E = le.querySelector("#klavity-enhance-spin");
    let T = 0, L = null;
    const O = () => c[Se] || c[0] || "", _ = () => {
      const U = O();
      if (!U) return "";
      const q = Se >= 0 && Se < c.length ? Se : 0, X = re[q] ?? (q === 0 ? re[0] : null);
      if (!X || !Array.isArray(X.shapes) || !X.shapes.length) return U;
      const Z = o.getElementById("klavity-hero-stage"), ne = Z == null ? void 0 : Z.querySelector("canvas");
      if (ne && Se === q && ne.width > 1 && ne.height > 1)
        try {
          const J = ne.toDataURL("image/png");
          if (J && J.length > 64) return J;
        } catch {
        }
      return null;
    }, $ = async () => {
      if ($t) return;
      const U = V.value.trim();
      L = V.value;
      const q = ++T;
      v && (v.disabled = !0), E && (E.hidden = !1);
      try {
        const X = ce ? { selector: ce.selector, text: ce.text } : null, Z = Se >= 0 && Se < c.length ? Se : 0, ne = re[Z] ?? (Z === 0 ? re[0] : null), J = Nm(ne == null ? void 0 : ne.shapes), G = O();
        let he = _();
        he === null && (he = await Pm(G, ne.shapes, ne.w, ne.h));
        const He = await g(U, {
          images: c.length,
          shot: he,
          annotations: ne,
          annotationTexts: J,
          picked: X
        });
        if (q !== T || !He) return;
        V.value = yd(He), V.dispatchEvent(new Event("input", { bubbles: !0 })), je = He.suggestedSeverity || null, ve = He.suggestedPriority || null, V.classList.add("kl-just-enhanced"), setTimeout(() => V.classList.remove("kl-just-enhanced"), 700), w && (w.hidden = !1), M && (M.hidden = !1), ot();
      } catch {
      } finally {
        q === T && (v && (v.disabled = !1), E && (E.hidden = !0));
      }
    };
    v == null || v.addEventListener("click", () => {
      $();
    }), M == null || M.addEventListener("click", () => {
      $();
    }), w == null || w.addEventListener("click", () => {
      L !== null && (V.value = L, V.dispatchEvent(new Event("input", { bubbles: !0 })), ot()), L = null, je = null, ve = null, w && (w.hidden = !0), M && (M.hidden = !0);
    });
  }
  if (t.onCheckKnown) {
    const g = le.querySelector("#klavity-known"), v = t.onCheckKnown;
    let w = null, M = 0, E = "";
    const T = () => {
      g && (g.hidden = !0, g.textContent = "");
    }, L = (_) => {
      var U;
      if (!g) return;
      const $ = _.headline ? Me(_.headline) : "Already reported";
      g.innerHTML = `<span class="kl-known-ic">${H("check-circle", { size: 15 })}</span><div class="kl-known-body"><span class="kl-known-title">${$}</span> — status: <span class="kl-known-status">${Me(_.statusLabel)}</span>. We're already tracking "${Me(_.title)}". Add your note and submit anyway — it'll be linked.</div><button type="button" class="kl-known-dismiss" id="klavity-known-dismiss">Dismiss</button>`, g.hidden = !1, (U = g.querySelector("#klavity-known-dismiss")) == null || U.addEventListener("click", () => {
        E = V.value.trim(), T();
      });
    }, O = async () => {
      const _ = V.value.trim();
      if (_.length < 12 || _ === E) {
        T();
        return;
      }
      const $ = ++M;
      try {
        const U = await v(_);
        if ($ !== M) return;
        if (V.value.trim() === E) {
          T();
          return;
        }
        U ? L(U) : T();
      } catch {
      }
    };
    V.addEventListener("input", () => {
      V.value.trim() !== E && (E = ""), w && clearTimeout(w), w = setTimeout(O, 500);
    });
  }
  if (n.reportClarity) {
    const g = le.querySelector("#klavity-clarity"), v = le.querySelector("#klavity-clarity-status"), w = {
      problem: le.querySelector("#klavity-clarity-problem"),
      expected: le.querySelector("#klavity-clarity-expected"),
      repro: le.querySelector("#klavity-clarity-repro")
    }, M = le.querySelector("#klavity-clarity-tip"), E = le.querySelector("#klavity-clarity-tip-text"), T = le.querySelector("#klavity-nudge"), L = t.onClarityTip, O = /* @__PURE__ */ new Map();
    let _ = null, $ = 0;
    const U = (J, G, he) => {
      if (!J) return;
      J.classList.toggle("done", G);
      const He = J.querySelector(".kl-clr-mark");
      He && (He.innerHTML = G ? H("check", { size: 12 }) : "○"), J.setAttribute("aria-label", (G ? "covered: " : "missing: ") + he);
    }, q = () => {
      M && (M.hidden = !0);
    }, X = (J) => {
      !M || !E || hg(J) || (E.innerHTML = Me(J) + '<span class="kl-clr-aitag">AI</span>', M.hidden = !1);
    }, Z = () => {
      const J = V.value, G = hd(J);
      g && (g.hidden = J.trim().length === 0, g.classList.remove("l1", "l2", "l3"), g.classList.add(G.level === "great" ? "l3" : G.level === "good" ? "l2" : "l1")), v && (v.textContent = G.label), U(w.problem, G.coverage.problem, "What's broken"), U(w.expected, G.coverage.expected, "What you expected"), U(w.repro, G.coverage.repro, "How to reproduce"), T && !T.hidden && (T.hidden = !0), G.level === "great" && q();
    }, ne = () => {
      !L || !M || (_ && clearTimeout(_), _ = setTimeout(async () => {
        const J = V.value.trim();
        if (!dg(J)) {
          q();
          return;
        }
        if (O.has(J)) {
          X(O.get(J));
          return;
        }
        const G = ++$;
        try {
          const he = await L(J, { images: c.length });
          if (G !== $ || V.value.trim() !== J) return;
          he && he.tip && (O.set(J, he.tip), X(he.tip));
        } catch {
        }
      }, 1e3));
    };
    V.addEventListener("input", () => {
      Z(), ne();
    }), Z(), (vl = le.querySelector("#klavity-nudge-add")) == null || vl.addEventListener("click", () => {
      T && (T.hidden = !0);
      try {
        V.focus();
      } catch {
      }
    }), (xl = le.querySelector("#klavity-nudge-anyway")) == null || xl.addEventListener("click", () => {
      T && (T.hidden = !0), Ur.click();
    });
  }
  $r.addEventListener("click", (g) => {
    g.target === $r && xs();
  }), (wl = le.querySelector("#klavity-x")) == null || wl.addEventListener("click", () => xs()), (Sl = le.querySelector("#klavity-min")) == null || Sl.addEventListener("click", () => {
    var g;
    try {
      (g = t.onMinimize) == null || g.call(t);
    } catch {
    }
  });
  const pl = () => Array.from(le.querySelectorAll(".klavity-actions button:not(#klavity-voice)"));
  let $t = !1;
  const ct = (g) => {
    $t = g, pl().forEach((w) => {
      w.disabled = g;
    }), V.disabled = g;
    const v = le.querySelector("#klavity-voice");
    v && (v.disabled = g), le.querySelectorAll(".kl-htool,.kl-htbtn,.kl-hopt,.kl-hcolor").forEach((w) => {
      w.disabled = g;
    }), o.querySelectorAll("#klavity-title,#klavity-remail,.kl-type-chip,.klavity-toggle button,#klavity-mask-numbers,.kl-file-rm,.klavity-rm,.klavity-mk,.klavity-retake").forEach((w) => {
      w.disabled = g;
    }), g ? (Dr == null || Dr(), Ur.disabled = !0) : (ot(), oi());
  }, ir = (g) => {
    pl().forEach((v) => {
      v.classList.remove("kl-active"), v.removeAttribute("aria-pressed");
    }), g && (g.classList.add("kl-active"), g.setAttribute("aria-pressed", "true"));
  }, fr = le.querySelector("#klavity-voice");
  if (fr) {
    const w = fr.querySelector(".kl-vring-prog");
    let M = 0, E = 0, T = !1, L, O = "";
    const _ = () => {
      E = Date.now();
      const me = () => {
        const $e = Date.now() - E, Ne = Math.min($e / 18e4, 1);
        if (w == null || w.setAttribute("stroke-dashoffset", String(Ne * 81.68)), $e >= 165e3 && fr.classList.add("kl-voice-warn"), $e >= 18e4) {
          L.stop();
          return;
        }
        M = requestAnimationFrame(me);
      };
      M = requestAnimationFrame(me);
    }, $ = () => {
      cancelAnimationFrame(M), w == null || w.setAttribute("stroke-dashoffset", String(81.68)), fr.classList.remove("kl-voice-warn");
    }, U = le.querySelector("#klavity-voice-status");
    let q = null;
    const X = () => {
      q && (clearTimeout(q), q = null), U && (U.hidden = !0, U.textContent = "", U.classList.remove("kl-vs-info", "kl-vs-err"));
    }, Z = (me, $e, Ne) => {
      !U || !$e || (q && (clearTimeout(q), q = null), U.classList.remove("kl-vs-info", "kl-vs-err"), U.classList.add(me === "err" ? "kl-vs-err" : "kl-vs-info"), U.textContent = $e, U.hidden = !1, Ne && (q = setTimeout(X, Ne)));
    }, ne = "Recording — tap to stop", J = () => {
      U && U.classList.contains("kl-vs-info") && X();
    }, G = (me) => {
      fr.classList.toggle("kl-voice-rec", me), fr.setAttribute("aria-pressed", me ? "true" : "false"), fr.setAttribute("aria-label", me ? "Stop recording" : "Voice dictation"), fr.title = me ? ne : "Voice dictation";
    }, he = (me) => {
      let $e = "";
      me.onTranscript = (Ne) => {
        $e = "", O = vi(O, Ne), V.value = O;
        try {
          V.scrollTop = V.scrollHeight;
        } catch {
        }
        try {
          V.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        ot();
      }, me.onInterim = (Ne) => {
        $e = Ne || "";
        const ee = O.length > 0 && !/\s$/.test(O) ? " " : "";
        V.value = O + (Ne ? ee + Ne : "");
        try {
          V.scrollTop = V.scrollHeight;
        } catch {
        }
        try {
          V.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        ot();
      }, me.onStatus = (Ne, ee) => {
        Ne === "idle" ? J() : Z("info", ee);
      }, me.onError = (Ne, ee) => {
        ee && Z("err", ee, 4e3);
      }, me.onStop = () => {
        $e && (O = vi(O, $e), $e = ""), O && (O = Kl(O), V.value = O);
        try {
          V.scrollTop = V.scrollHeight;
        } catch {
        }
        try {
          V.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        T = !1, G(!1), $(), J(), ot();
      };
    }, He = () => {
      const me = new Hn();
      return he(me), me;
    }, Qe = () => {
      if (!T) {
        G(!1), $(), J();
        return;
      }
      Hn.isSupported() ? (O = V.value, L = He(), Z("info", "Reconnecting dictation…"), L.start()) : (T = !1, G(!1), $(), Z("err", "Voice dictation is unavailable right now", 4e3));
    }, gt = () => {
      if (!(Te === "server" && t.onDictate)) return null;
      const me = new Ui({ transcribe: ($e) => t.onDictate($e) });
      return he(me), me.onUnavailable = Qe, me;
    }, Er = (me) => {
      const $e = () => O.length > 0 && !/\s$/.test(O) ? " " : "";
      let Ne = "";
      me.onTranscript = (ee) => {
        Ne = "", O = vi(O, ee), V.value = O;
        try {
          V.scrollTop = V.scrollHeight;
        } catch {
        }
        try {
          V.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        ot();
      }, me.onInterim = (ee) => {
        Ne = ee || "", V.value = O + $e() + ee;
        try {
          V.scrollTop = V.scrollHeight;
        } catch {
        }
        try {
          V.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        ot();
      }, me.onStatus = (ee, de) => {
        ee === "idle" ? J() : Z("info", de);
      }, me.onError = (ee, de) => {
        de && Z("err", de, 4e3);
      }, me.onStop = () => {
        Ne && (O = vi(O, Ne), Ne = ""), O && (O = Kl(O)), V.value = O;
        try {
          V.scrollTop = V.scrollHeight;
        } catch {
        }
        try {
          V.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        T = !1, G(!1), $(), J(), ot();
      }, me.onUnavailable = () => {
        V.value = O;
        try {
          V.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        if (!T) {
          G(!1), $(), J();
          return;
        }
        const ee = gt();
        if (ee) {
          L = ee, Z("info", "Reconnecting dictation…"), L.start();
          return;
        }
        Qe();
      };
    }, Dt = () => {
      if (Te === "server" && t.dictationStreamUrl && Bi.isSupported()) {
        const me = new Bi({ url: t.dictationStreamUrl });
        return Er(me), me;
      }
      return gt() ?? He();
    };
    L = Dt(), fr.addEventListener("click", () => {
      T ? L.stop() : (X(), O = V.value, L = Dt(), T = !0, G(!0), L.start(), _());
    }), Dr = () => {
      T && L.stop();
    };
  }
  function hl() {
    var w;
    const g = (ye == null ? void 0 : ye.value.trim()) || "", v = g && (t.requireEmail || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(g)) ? g : void 0;
    return v && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) && ((w = t.onRememberEmail) == null || w.call(t, v.toLowerCase())), { email: v, createContact: !!(v && Yt && v.toLowerCase() === un) };
  }
  Ur.addEventListener("click", async () => {
    var G;
    if ($t || Ur.disabled) return;
    const g = V.value.trim(), v = le.querySelector("#klavity-title"), w = v ? v.value.trim() : "", M = Be === "feature" ? "feature" : "bug";
    d && await Promise.race([d, Promise.resolve()]);
    const E = p.slice(), T = Ae(), L = B.slice(), O = P.slice(), _ = Be, { email: $, createContact: U } = hl();
    ct(!0), Ur.textContent = "Uploading…";
    const q = o.getElementById("klavity-err");
    q.style.display = "none";
    const X = o.getElementById("klavity-progress"), Z = o.getElementById("klavity-progress-fill");
    X && Z && (X.classList.add("show"), Z.style.transition = "none", Z.style.width = "8%", Z.offsetWidth, Z.style.transition = "width 10s cubic-bezier(.05,.7,.2,1)", requestAnimationFrame(() => {
      Z.style.width = "90%";
    }));
    const ne = () => {
      Z && (Z.style.transition = "width .25s ease", Z.style.width = "100%");
    }, J = () => {
      X && Z && (X.classList.remove("show"), Z.style.transition = "none", Z.style.width = "0");
    };
    try {
      const he = await Promise.all(E), He = {
        type: M,
        ...oe ? { kind: _ } : {},
        ...w ? { title: w } : {},
        description: g,
        screenshots: he,
        ...L.length ? { files: L } : {},
        ...O.length ? { recordings: O } : {},
        annotations: T,
        reporterEmail: $,
        createContact: U,
        // KLA submit-target: ride the reporter's destination choice through onSubmit. Only present when the
        // segmented control was rendered (cfg.submitTargetToggle !== false); default 'project' (never surprise-
        // route to Klavity). The server resolves the real Klavity intake project — the client only says 'klavity'.
        ...n.submitTargetToggle !== !1 ? { feedbackTarget: ks } : {},
        // KLA-586: ride the accepted AI-Enhance draft's severity/priority as structured fields (cleared on Undo).
        ...je ? { suggestedSeverity: je } : {},
        ...ve ? { suggestedPriority: ve } : {},
        // #638: only when the toggle was rendered — the reporter's console-logs opt-in (DEFAULT false). Read
        // live from the checkbox so the current state travels; the host attaches console logs only when true.
        ...t.consoleAttachToggle ? { attachConsole: !!((G = o.getElementById("klavity-conlog-cb")) != null && G.checked) } : {}
      };
      if (t.backgroundUpload) {
        t.onSubmit(He), hr({ immediate: !0, reason: "submitted" });
        return;
      }
      const Qe = await t.onSubmit(He);
      if (tt) return;
      ne(), t.success ? fh(Qe.issueKey, Qe.issueUrl, t.success) : hh(Qe.issueKey, Qe.issueUrl);
    } catch (he) {
      J();
      const He = (he == null ? void 0 : he.message) || "Unknown error";
      try {
        console.error("[Klavity] submit failed:", he);
      } catch {
      }
      q.textContent = n.debug ? `Couldn't submit your report — ${He}` : "Couldn't submit your report. Please check your connection and try again.", q.style.display = "block", Ur.textContent = "Submit", ct(!1);
    }
  });
  function oh(g, v) {
    var L;
    const { dataUrl: w, quality: M, suggestSharp: E } = sr(v);
    if (!w) return;
    const T = c.indexOf(g);
    if (!(T < 0)) {
      c[T] = w, p[T] = t.compressImage ? t.compressImage(w) : Promise.resolve(w), a[T] = M, h[T] = !!E && M !== "real-pixel", re[T] && delete re[T], delete _e[T], delete st[T], Oe();
      try {
        (L = t.onShotReplaced) == null || L.call(t, T, w, M);
      } catch {
      }
    }
  }
  async function ah(g) {
    if (!t.onCaptureViewport) return !1;
    let v = null;
    const w = i ? jr(document.body) : null;
    try {
      const { dataUrl: E } = sr(await t.onCaptureViewport());
      E && (v = E, l = !1, zt(E, "rendered", void 0, !0, !1), g && ir(g));
    } catch {
    } finally {
      w == null || w();
    }
    const M = (async () => {
      const E = i ? jr(document.body) : null;
      try {
        const T = await t.onCaptureFull();
        if (v) oh(v, T);
        else {
          l = !1;
          const { dataUrl: L, quality: O, suggestSharp: _ } = sr(T);
          L && (zt(L, O, void 0, !0, !!_), g && ir(g));
        }
      } catch {
        l = !1, Oe();
      } finally {
        E == null || E(), d === M && (d = null);
      }
    })();
    return d = M, !0;
  }
  async function fl(g) {
    if (!t.onCaptureViewport) return !1;
    const v = i ? jr(document.body) : null;
    try {
      const { dataUrl: w, blank: M } = sr(await t.onCaptureViewport());
      M && c.length === 0 ? fs() : w ? (l = !1, zt(w, "rendered", void 0, !0, !1)) : (l = !1, Oe());
    } catch {
      l = !1, Oe();
    } finally {
      v == null || v();
    }
    return !0;
  }
  const qr = le.querySelector("#klavity-full");
  qr.addEventListener("click", async () => {
    if (!$t && !(t.onCaptureSharp && (await Ms()).ok)) {
      ct(!0), qr.classList.add("kl-loading");
      try {
        if (t.onCaptureViewport) {
          await ah(qr);
          return;
        }
        const g = i ? jr(document.body) : null;
        try {
          const { dataUrl: v, quality: w, suggestSharp: M } = sr(await t.onCaptureFull());
          zt(v, w, void 0, !0, !!M), ir(qr);
        } finally {
          g == null || g();
        }
      } catch {
      } finally {
        qr.classList.remove("kl-loading"), ct(!1);
      }
    }
  });
  async function Ms(g) {
    const v = g != null && g.viewport && t.onCaptureSharpViewport ? t.onCaptureSharpViewport : t.onCaptureSharp;
    if ($t || !v || !Ie) return { ok: !1, declined: !1 };
    const w = Ie.querySelector(".kl-sharp-label");
    ct(!0), Ie.classList.add("kl-loading"), s.style.display = "none";
    const M = w ?? Ie, E = M.textContent;
    M.textContent = "Capturing…";
    let T = !1, L = !1;
    try {
      const O = i ? jr(document.body) : null;
      let _;
      try {
        _ = await v();
      } finally {
        O == null || O();
      }
      if (_) {
        const { dataUrl: $, quality: U } = sr(_);
        $ && (zt($, U ?? "real-pixel", void 0, !0, !1, { kind: g != null && g.viewport ? "viewport" : "full" }), ir(Ie), T = !0, C = !0);
      }
    } catch (O) {
      if (Dg(O)) {
        if (L = !0, !(g != null && g.onOpen))
          try {
            Pp();
          } catch {
          }
      } else
        try {
          console.warn("[Klavity] Screen capture failed; using rendered fallback:", O);
        } catch {
        }
    } finally {
      g != null && g.onOpen && L || (s.style.display = "", M.textContent = E, Ie.classList.remove("kl-loading"), ct(!1));
    }
    return { ok: T, declined: L };
  }
  Ie && t.onCaptureSharp && Ie.addEventListener("click", () => {
    Ms();
  });
  const ml = le.querySelector("#klavity-file"), gl = le.querySelector("#klavity-upload");
  gl.addEventListener("click", () => {
    if (!$t) {
      if (!x && c.length >= b) {
        Ht(`You can attach up to ${b} images.`);
        return;
      }
      ml.click();
    }
  }), ml.addEventListener("change", async (g) => {
    const v = g.target, w = v.files ? Array.from(v.files) : [];
    if (v.value = "", !w.length) return;
    const M = c.length, E = B.length;
    x ? await qp(w) : await gs(w), (c.length > M || B.length > E) && ir(gl);
  });
  const Fn = o.getElementById("klavity-record");
  Fn && t.onRecord && Fn.addEventListener("click", async () => {
    if ($t) return;
    if (P.length >= Ge) {
      Ht(`You can attach up to ${Ge} recordings.`);
      return;
    }
    ct(!0), Fn.classList.add("kl-loading");
    const g = (v) => {
      s.style.display = v === "recording" ? "none" : "";
    };
    try {
      const v = await t.onRecord(g);
      if (v) {
        const w = P.findIndex((M) => M.id && v.id && M.id === v.id || M.dataUrl && v.dataUrl && M.dataUrl === v.dataUrl);
        w >= 0 ? (P[w] = v, se = w) : (P.push(v), se = P.length - 1), K = null, cn(), ir(Fn);
      }
    } catch {
    } finally {
      s.style.display = "", Fn.classList.remove("kl-loading"), ct(!1);
    }
  }), Ue && (nr(), (El = o.getElementById("klavity-multi-start")) == null || El.addEventListener("click", () => {
    jp();
  }));
  const Rs = o.getElementById("klavity-region");
  Rs && t.onRegionCapture && (Rs.onclick = () => {
    $t || (ct(!0), document.removeEventListener("keydown", Fr, { capture: !0 }), s.style.display = "none", Vg(async (g) => {
      document.addEventListener("keydown", Fr, { capture: !0 });
      try {
        const v = i ? jr(document.body) : null;
        let w;
        try {
          w = await t.onRegionCapture(g);
        } finally {
          v == null || v();
        }
        if (w) {
          const { dataUrl: M, quality: E, suggestSharp: T } = sr(w);
          M && (zt(M, E, void 0, !0, !!T, { kind: "region", rect: g }), ir(Rs));
        }
      } finally {
        s.style.display = "", ct(!1);
      }
    }, () => {
      document.addEventListener("keydown", Fr, { capture: !0 }), s.style.display = "", ct(!1);
    }));
  });
  const dn = o.getElementById("klavity-pick"), pn = o.getElementById("klavity-pickinfo"), yl = () => {
    var w;
    if (dn && (dn.classList.toggle("kl-active", !!ce), ce ? dn.setAttribute("aria-pressed", "true") : dn.removeAttribute("aria-pressed")), !pn) return;
    if (!ce) {
      pn.hidden = !0, pn.innerHTML = "";
      return;
    }
    pn.hidden = !1;
    const { text: g } = ce, v = g ? `: <span class="kl-pick-txt">${Me(g)}</span>` : "";
    pn.innerHTML = `<span class="kl-pick-ic">${H("mouse-pointer-2", { size: 13 })}</span><span>Element pinned${v}</span><button type="button" class="kl-pick-clear" id="klavity-pick-clear">Clear</button>`, (w = pn.querySelector("#klavity-pick-clear")) == null || w.addEventListener("click", () => {
      ce = null, yl();
    });
  };
  dn && t.onPickElement && (dn.onclick = async () => {
    if (!$t) {
      ct(!0), document.removeEventListener("keydown", Fr, { capture: !0 }), s.style.display = "none";
      try {
        const g = await t.onPickElement();
        g && (ce = g, yl(), g.shot && zt(g.shot, g.shotQuality, void 0, !0, !1, { kind: "element", selector: g.selector, rect: g.rect }));
      } catch {
      } finally {
        document.addEventListener("keydown", Fr, { capture: !0 }), s.style.display = "", ct(!1);
      }
    }
  });
  function Vt(g, v = 15) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${v}" height="${v}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em">${g}</svg>`;
  }
  function lh(g) {
    const v = (T, L, O, _) => `<button type="button" class="kl-htool" data-tool="${T}" title="${L} (${_.toUpperCase()})" aria-label="${L}">${O}<span class="kl-hk">${_.toUpperCase()}</span></button>`, w = (T) => {
      const L = T.replace("#", "");
      if (!/^[0-9a-fA-F]{6}$/.test(L)) return !1;
      const O = parseInt(L.slice(0, 2), 16), _ = parseInt(L.slice(2, 4), 16), $ = parseInt(L.slice(4, 6), 16);
      return (0.2126 * O + 0.7152 * _ + 0.0722 * $) / 255 > 0.7;
    }, M = (T) => `<button type="button" class="kl-hcolor${w(T) ? " kl-hcolor-light" : ""}" data-color="${T}" style="background:${T}" title="${T}" aria-label="Colour ${T}"></button>`;
    return (
      // Klavity logo, TOP-LEFT of the editor toolbar. It links to the homepage (UTM-stamped so clicks are
      // attributable to WHICH project/site) — the href is assigned in JS (never innerHTML) per this file's
      // XSS guards. See heroLogoHref + the #kl-hero-logo wiring in mountHeroAnnotator.
      '<a class="kl-hlogo" id="kl-hero-logo" target="_blank" rel="noopener" title="Powered by Klavity — visit klavity.in" aria-label="Klavity homepage (opens in a new tab)"><svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g fill="#818cf8"><circle cx="15" cy="9" r="2"/><circle cx="11" cy="16" r="2"/><circle cx="10" cy="24" r="2"/><circle cx="11" cy="32" r="2"/><circle cx="15" cy="39" r="2"/><circle cx="33" cy="9" r="2"/><circle cx="37" cy="16" r="2"/><circle cx="38" cy="24" r="2"/><circle cx="37" cy="32" r="2"/><circle cx="33" cy="39" r="2"/></g><g stroke="#818cf8" stroke-width="1.6" stroke-linecap="round" opacity="0.4"><line x1="15" y1="9" x2="33" y2="9"/><line x1="11" y1="16" x2="37" y2="16"/><line x1="10" y1="24" x2="38" y2="24"/><line x1="11" y1="32" x2="37" y2="32"/><line x1="15" y1="39" x2="33" y2="39"/></g></svg><span class="kl-hlogo-word">Klavity</span></a><span class="kl-hsep"></span>' + v("pen", "Pen", H("pencil", { size: 15 }), "p") + v("line", "Line", Vt('<line x1="5" y1="19" x2="19" y2="5"/>'), "l") + v("rect", "Rectangle", H("square", { size: 15 }), "r") + v("circle", "Circle", Vt('<circle cx="12" cy="12" r="9"/>'), "o") + v("arrow", "Arrow", Vt('<line x1="5" y1="19" x2="19" y2="5"/><polyline points="10 5 19 5 19 14"/>'), "a") + v("text", "Text", Vt('<path d="M5 6h14M12 6v13M9 19h6"/>'), "t") + v("count", "Numbers", Vt('<circle cx="12" cy="12" r="9"/><text x="12" y="16" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor" stroke="none">1</text>'), "c") + `<span class="kl-hsep"></span><label class="kl-hmask" title="Mask numbers in new screen captures"><input type="checkbox" class="kl-hmask-cb"${i ? " checked" : ""}>${H("eye-off", { size: 13 })}<span>Mask numbers</span></label>` + v("pixelate", "Redact (pixelate)", Vt('<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>'), "b") + v("crop", "Crop", Vt('<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>'), "k") + '<span class="kl-hsep"></span><span class="kl-hcolors">' + M("#ef4444") + M("#f97316") + M("#16a34a") + M("#3b82f6") + M("#ffffff") + M("#111827") + // Custom colour picker — a rainbow swatch that opens a native <input type="color">. The chosen colour
      // becomes the active colour and shows as the selected swatch. Input is visually hidden but focusable
      // via the button (kept inside the shadow root so its styling stays scoped).
      `<span class="kl-hcolor-cwrap"><button type="button" class="kl-hcolor kl-hcolor-custom" title="Custom colour" aria-label="Choose a custom colour"></button><input type="color" class="kl-hcolor-input" value="#ef4444" aria-label="Custom colour value" tabindex="-1"></span></span><span class="kl-hsep"></span><span class="kl-hgroup"><span class="kl-hlabel">Stroke</span><button type="button" class="kl-hopt" data-stroke="0.6" title="Thin stroke" aria-label="Thin stroke">S</button><button type="button" class="kl-hopt kl-on" data-stroke="1" title="Medium stroke" aria-label="Medium stroke">M</button><button type="button" class="kl-hopt" data-stroke="1.8" title="Thick stroke" aria-label="Thick stroke">L</button><button type="button" class="kl-hopt" data-stroke="2.8" title="Extra-thick stroke" aria-label="Extra-thick stroke">XL</button></span><span class="kl-htextopts" id="kl-hero-textopts" hidden><span class="kl-hsep"></span><span class="kl-hlabel">Outline</span><button type="button" class="kl-hopt kl-on" data-outline="black" title="Black outline"><span class="kl-osq" style="background:#111"></span></button><button type="button" class="kl-hopt" data-outline="white" title="White outline"><span class="kl-osq" style="background:#fff;border:1px solid #999"></span></button><button type="button" class="kl-hopt" data-outline="none" title="No outline">None</button><span class="kl-hlabel">Size</span><button type="button" class="kl-hopt" data-size="18" title="Small">S</button><button type="button" class="kl-hopt kl-on" data-size="26" title="Medium">M</button><button type="button" class="kl-hopt" data-size="40" title="Large">L</button></span><span class="kl-hsep"></span><button type="button" class="kl-htbtn" id="kl-hero-undo" title="Undo (Cmd+Z / Ctrl+Z)" aria-label="Undo">${Vt('<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>', 14)}</button>` + // #449: explicit "Revert crop" — shown only after a crop on this image (visibility driven by the
      // per-image crop stack). Reverts the most recent crop to its pre-crop image + original markup.
      (g ? `<button type="button" class="kl-htbtn kl-hrevert" id="kl-hero-revert" title="Revert crop to original" aria-label="Revert crop">${Vt('<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 5 5v2"/>', 14)}<span class="kl-hk kl-hrevert-lbl">Revert</span></button>` : "") + `<button type="button" class="kl-htbtn" id="kl-hero-clear" title="Clear" aria-label="Clear">${H("trash-2", { size: 14 })}</button><span class="kl-hgrow"></span><span class="kl-hgroup kl-hzoom"><button type="button" class="kl-htbtn" id="kl-hero-zoomout" title="Zoom out (Z toggles fit / 2×)" aria-label="Zoom out">${Vt('<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16" y2="16"/><line x1="8" y1="11" x2="14" y2="11"/>', 14)}</button><button type="button" class="kl-htbtn" id="kl-hero-zoomin" title="Zoom in (Z toggles fit / 2×)" aria-label="Zoom in">${Vt('<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16" y2="16"/><line x1="8" y1="11" x2="14" y2="11"/><line x1="11" y1="8" x2="11" y2="14"/>', 14)}</button></span>`
    );
  }
  function Un() {
    ge && (document.removeEventListener("keydown", ge, { capture: !0 }), ge = null);
  }
  function Ts() {
    const g = o.getElementById("klavity-hero-stage"), v = o.getElementById("klavity-hero-tools");
    v && (v.innerHTML = ""), g && (g.innerHTML = `<div class="kl-hero-empty" id="klavity-hero-empty"><span class="kl-hero-empty-ic">${H("image", { size: 34 })}</span><span id="klavity-hero-empty-txt">${Me($p())}</span></div>`), Un();
  }
  function bl() {
    if (K != null && !(B[K] && gn(B[K]) === "video") && (K = null), se != null && !P[se] && (se = null), se != null) {
      kl(P[se].dataUrl);
      return;
    }
    if (K != null) {
      kl(B[K] ? Je(B[K]) : void 0);
      return;
    }
    if (c.length === 0) {
      Se = 0, Ts();
      return;
    }
    Se >= c.length && (Se = c.length - 1), Se < 0 && (Se = 0), dh(Se);
  }
  let Sr = null;
  function kl(g) {
    const v = o.getElementById("klavity-hero-stage"), w = o.getElementById("klavity-hero-tools");
    if (!v || !g) {
      Ts();
      return;
    }
    if (Un(), w && (w.innerHTML = ""), v.innerHTML = "", Sr) {
      try {
        URL.revokeObjectURL(Sr);
      } catch {
      }
      Sr = null;
    }
    let M = g;
    const E = se != null && P[se] ? P[se] : null;
    if (E && E.blob instanceof Blob && typeof URL < "u" && typeof URL.createObjectURL == "function")
      try {
        M = URL.createObjectURL(E.blob), Sr = M;
      } catch {
      }
    else if (g.startsWith("data:") && typeof URL < "u" && typeof URL.createObjectURL == "function")
      try {
        const $ = g.split(",");
        if ($.length >= 2) {
          const U = $[0].match(/:(.*?);/), q = (U ? U[1] : "video/webm").split(";")[0], X = atob($[1]);
          let Z = X.length;
          const ne = new Uint8Array(Z);
          for (; Z--; )
            ne[Z] = X.charCodeAt(Z);
          const J = new Blob([ne], { type: q });
          M = URL.createObjectURL(J), Sr = M;
        }
      } catch {
      }
    const T = document.createElement("div");
    T.className = "kl-hero-vwrap", T.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;max-width:100%;max-height:100%;";
    const L = document.createElement("video");
    L.src = M, L.controls = !0, L.setAttribute("playsinline", ""), L.preload = "metadata", L.className = "kl-hero-video", L.style.cssText = "display:block;max-width:100%;max-height:100%;border-radius:8px;background:#000;box-shadow:0 12px 40px rgba(0,0,0,.5);";
    const O = document.createElement("div");
    O.className = "kl-hero-verror", O.style.cssText = "display:none;flex-direction:column;align-items:center;gap:6px;color:#fff;font-size:13px;text-align:center;";
    const _ = document.createElement("a");
    _.href = M || g, _.setAttribute("download", "recording.webm"), _.setAttribute("target", "_blank"), _.setAttribute("rel", "noopener"), _.textContent = "Download recording", _.style.cssText = "color:#a5b4fc;font-size:12px;text-decoration:underline;", O.innerHTML = "<span>This recording couldn’t play here.</span>", O.appendChild(_), T.appendChild(L), T.appendChild(O), v.appendChild(T), ch(L, O);
  }
  function ch(g, v) {
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
          g.currentTime = 0, g.style.display = "block", v && (v.style.display = "none");
          return;
        } catch {
        }
      }
      try {
        g.style.display = "none";
      } catch {
      }
      v && (v.style.display = "flex");
    });
  }
  function uh(g, v, w, M, E) {
    const T = c[g];
    if (!T) return;
    const L = new Image();
    L.onload = () => {
      var Z, ne;
      if (c[g] !== T) return;
      const O = document.createElement("canvas");
      O.width = Math.max(1, Math.round(M)), O.height = Math.max(1, Math.round(E));
      const _ = O.getContext("2d");
      if (!_) return;
      _.drawImage(L, v, w, M, E, 0, 0, O.width, O.height);
      let $;
      try {
        $ = O.toDataURL("image/png");
      } catch {
        return;
      }
      const U = ((Z = _e[g]) == null ? void 0 : Z.length) ?? 0, q = on(g);
      c[g] = $, p[g] = t.compressImage ? t.compressImage($) : Promise.resolve($);
      const X = (ne = re[g]) == null ? void 0 : ne.shapes;
      Array.isArray(X) && X.length ? re[g] = { w: O.width, h: O.height, shapes: Lg(X, -v, -w) } : delete re[g], (_e[g] ?? (_e[g] = [])).push(q), (st[g] ?? (st[g] = [])).push({ snap: q, mark: U }), rr(g), Oe();
    }, L.src = T;
  }
  function dh(g) {
    var _, $, U, q, X, Z, ne;
    const v = o.getElementById("klavity-hero-stage"), w = o.getElementById("klavity-hero-tools");
    if (!v || !w) return;
    const M = c[g];
    if (!M) {
      Ts();
      return;
    }
    Un(), v.innerHTML = "";
    const E = document.createElement("canvas");
    E.width = 1, E.height = 1, E.style.cssText = "display:block;max-width:100%;max-height:100%;object-fit:contain;cursor:crosshair;touch-action:none;background:#fff;border-radius:8px;box-shadow:0 12px 40px rgba(0,0,0,.5);";
    const T = new ea(E, M), L = (_ = re[g]) == null ? void 0 : _.shapes;
    Array.isArray(L) && L.forEach((J) => T.shapes.push({ ...J })), v.appendChild(E);
    const O = new Image();
    O.onload = () => {
      !document.body.contains(s) || Se !== g || c[g] !== M || (E.width = O.naturalWidth || 1, E.height = O.naturalHeight || 1, T.redraw());
    }, O.src = M, T.redraw();
    {
      w.innerHTML = lh(((($ = st[g]) == null ? void 0 : $.length) ?? 0) > 0);
      const J = w.querySelector("#kl-hero-logo");
      J && (J.href = Tg(n.projectId));
      let G = "pen", he = "#ef4444", He = 26, Qe = "black", gt = null;
      const Er = w.querySelector("#kl-hero-textopts"), Dt = () => {
        T.shapes.length ? re[g] = { w: E.width, h: E.height, shapes: T.shapes.map((D) => ({ ...D })) } : delete re[g], rr(g);
      }, me = (D) => {
        G = D, w.querySelectorAll("[data-tool]").forEach((W) => W.classList.toggle("kl-on", W.dataset.tool === D)), Er && (Er.hidden = D !== "text");
      }, $e = w.querySelector(".kl-hcolor-custom"), Ne = w.querySelector(".kl-hcolor-input"), ee = (D, W) => {
        he = D, w.querySelectorAll("[data-color]").forEach((ie) => ie.classList.toggle("kl-on", ie === W)), $e && $e.classList.toggle("kl-on", $e === W);
      };
      if (w.querySelectorAll("[data-tool]").forEach((D) => D.addEventListener("click", () => me(D.dataset.tool))), w.querySelectorAll("[data-color]").forEach((D) => D.addEventListener("click", () => ee(D.dataset.color, D))), $e && Ne) {
        $e.addEventListener("click", () => Ne.click());
        const D = () => {
          $e.style.background = Ne.value, ee(Ne.value, $e);
        };
        Ne.addEventListener("input", D), Ne.addEventListener("change", D);
      }
      const de = w.querySelector(".kl-hmask-cb");
      de && de.addEventListener("change", () => {
        i = de.checked;
      }), w.querySelectorAll("[data-outline]").forEach((D) => D.addEventListener("click", () => {
        Qe = D.dataset.outline, w.querySelectorAll("[data-outline]").forEach((W) => W.classList.toggle("kl-on", W === D));
      })), w.querySelectorAll("[data-size]").forEach((D) => D.addEventListener("click", () => {
        He = Number(D.dataset.size), w.querySelectorAll("[data-size]").forEach((W) => W.classList.toggle("kl-on", W === D));
      })), w.querySelectorAll("[data-stroke]").forEach((D) => D.addEventListener("click", () => {
        T.strokeScale = Number(D.dataset.stroke) || 1, w.querySelectorAll("[data-stroke]").forEach((W) => W.classList.toggle("kl-on", W === D)), T.redraw();
      })), (U = w.querySelector("#kl-hero-undo")) == null || U.addEventListener("click", () => {
        Ha(g);
      }), (q = w.querySelector("#kl-hero-revert")) == null || q.addEventListener("click", () => {
        Np(g);
      }), (X = w.querySelector("#kl-hero-clear")) == null || X.addEventListener("click", () => {
        an(g), T.clearAll(), Dt();
      }), me(G), ee(he, w.querySelector("[data-color]"));
      const Fe = (D) => {
        const W = E.getBoundingClientRect(), ie = Math.min(W.width / E.width, W.height / E.height) || 1, te = E.width * ie, ae = E.height * ie, Ke = (W.width - te) / 2, yt = (W.height - ae) / 2;
        return { x: (D.clientX - W.left - Ke) / ie, y: (D.clientY - W.top - yt) / ie };
      }, ui = () => {
        const D = E.getBoundingClientRect();
        return Math.min(D.width / E.width, D.height / E.height) || 1;
      }, mh = (D, W, ie, te, ae, Ke) => D === "line" ? { type: "line", color: Ke, x1: W, y1: ie, x2: te, y2: ae } : D === "arrow" ? { type: "arrow", color: Ke, x1: W, y1: ie, x2: te, y2: ae } : D === "rect" ? { type: "rect", color: Ke, x: Math.min(W, te), y: Math.min(ie, ae), w: Math.abs(te - W), h: Math.abs(ae - ie) } : D === "circle" ? { type: "circle", color: Ke, x: (W + te) / 2, y: (ie + ae) / 2, rx: Math.abs(te - W) / 2, ry: Math.abs(ae - ie) / 2 } : D === "pixelate" ? { type: "pixelate", x: Math.min(W, te), y: Math.min(ie, ae), w: Math.abs(te - W), h: Math.abs(ae - ie) } : null;
      let dt = 1, Cr = 0, Mr = 0, di = null;
      const gh = (() => {
        try {
          return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
        } catch {
          return !1;
        }
      })(), pi = Sg(gh), As = () => {
        if (di) return di;
        const D = E.style.transform;
        return E.style.transform = "", di = E.getBoundingClientRect(), E.style.transform = D, di;
      }, at = document.createElement("div");
      at.className = "kl-minimap", at.hidden = !0, at.setAttribute("role", "navigation"), at.setAttribute("aria-label", "Zoom navigator — click or drag to pan the image");
      const Bn = document.createElement("img");
      Bn.className = "kl-minimap-img", Bn.alt = "", Bn.draggable = !1, Bn.src = M;
      const hn = document.createElement("div");
      hn.className = "kl-minimap-vp", at.append(Bn, hn), v.appendChild(at);
      const Cl = () => {
        const D = E.width, W = E.height;
        if (dt <= 1 || D < 2 || W < 2) {
          at.hidden = !0;
          return;
        }
        const ie = As();
        if (!ie) {
          at.hidden = !0;
          return;
        }
        const te = 148, ae = Math.min(te / D, te / W), Ke = Math.max(1, Math.round(D * ae)), yt = Math.max(1, Math.round(W * ae));
        at.style.width = Ke + "px", at.style.height = yt + "px";
        const Gt = v.getBoundingClientRect(), mn = Cg(
          { left: Gt.left, top: Gt.top, right: Gt.right, bottom: Gt.bottom },
          { left: ie.left, top: ie.top, width: ie.width, height: ie.height },
          { panX: Cr, panY: Mr },
          dt,
          D,
          W
        );
        hn.style.left = mn.x * ae + "px", hn.style.top = mn.y * ae + "px", hn.style.width = Math.max(3, mn.w * ae) + "px", hn.style.height = Math.max(3, mn.h * ae) + "px", at.hidden = !1;
      }, qn = () => {
        if (dt === 1) {
          Cr = 0, Mr = 0, E.style.transform = "", E.style.cursor = "crosshair", Cl();
          return;
        }
        E.style.transformOrigin = "0 0", E.style.transform = `translate(${Cr}px,${Mr}px) scale(${dt})`, E.style.cursor = "grab", Cl();
      }, hi = (D, W, ie) => {
        const te = As();
        if (!te) return;
        const ae = dt;
        if (dt = xg(dt * ie), dt === ae) return;
        const Ke = Eg(D, W, { left: te.left, top: te.top, width: te.width, height: te.height }, ae, dt, { panX: Cr, panY: Mr });
        Cr = Ke.panX, Mr = Ke.panY, E.style.transition = pi, qn();
      }, Ls = () => {
        const D = v.getBoundingClientRect();
        return { cx: D.left + D.width / 2, cy: D.top + D.height / 2 };
      }, yh = () => {
        dt = 1, E.style.transition = pi, qn();
      };
      (Z = w.querySelector("#kl-hero-zoomin")) == null || Z.addEventListener("click", () => {
        const { cx: D, cy: W } = Ls();
        hi(D, W, 1.25);
      }), (ne = w.querySelector("#kl-hero-zoomout")) == null || ne.addEventListener("click", () => {
        const { cx: D, cy: W } = Ls();
        hi(D, W, 0.8);
      });
      const bh = (D, W) => {
        const ie = As();
        if (!ie) return;
        const te = v.getBoundingClientRect(), ae = Rg(D, W, { left: te.left, top: te.top, right: te.right, bottom: te.bottom }, { left: ie.left, top: ie.top, width: ie.width, height: ie.height }, dt, E.width);
        Cr = ae.panX, Mr = ae.panY, E.style.transition = pi, qn();
      };
      let fi = !1;
      const Ml = (D, W) => {
        const ie = at.getBoundingClientRect(), { ix: te, iy: ae } = Mg(D - ie.left, W - ie.top, ie.width, ie.height, E.width, E.height);
        bh(te, ae);
      };
      at.addEventListener("pointerdown", (D) => {
        fi = !0;
        try {
          at.setPointerCapture(D.pointerId);
        } catch {
        }
        Ml(D.clientX, D.clientY), D.preventDefault(), D.stopPropagation();
      }), at.addEventListener("pointermove", (D) => {
        fi && (Ml(D.clientX, D.clientY), D.preventDefault());
      });
      const Rl = (D) => {
        if (fi) {
          fi = !1;
          try {
            at.releasePointerCapture(D.pointerId);
          } catch {
          }
        }
      };
      at.addEventListener("pointerup", Rl), at.addEventListener("pointercancel", Rl), v.addEventListener("wheel", (D) => {
        G !== "crop" && (D.preventDefault(), hi(D.clientX, D.clientY, wg(D.deltaY)));
      }, { passive: !1 }), v.addEventListener("dblclick", () => {
        dt = 1, E.style.transition = pi, qn();
      });
      let kh = T.shapes.reduce((D, W) => W.type === "count" ? Math.max(D, W.n) : D, 0), Rr = !1, St = 0, Et = 0, Wr = [], fn = !1, Tl = 0, Al = 0, Ll = 0, _l = 0, Ct = null, Wn = { x: 0, y: 0 }, pt = null;
      const vh = () => Math.max(14, T.computeFontSize() * 0.6), Il = (D, W) => {
        for (let ie = T.shapes.length - 1; ie >= 0; ie--) {
          const te = T.shapes[ie];
          if (te.type !== "text") continue;
          const ae = T.textBounds(te);
          if (!ae) continue;
          const Ke = vh();
          if (D >= ae.x + ae.w - Ke && D <= ae.x + ae.w + Ke && W >= ae.y + ae.h - Ke && W <= ae.y + ae.h + Ke)
            return { shape: te, mode: "resize" };
          const yt = 6;
          if (D >= ae.x - yt && D <= ae.x + ae.w + yt && W >= ae.y - yt && W <= ae.y + ae.h + yt)
            return { shape: te, mode: "move" };
        }
        return null;
      };
      E.addEventListener("pointerdown", (D) => {
        if (D.shiftKey && dt > 1) {
          fn = !0, Tl = D.clientX, Al = D.clientY, Ll = Cr, _l = Mr, E.style.transition = "none", E.style.cursor = "grabbing";
          try {
            E.setPointerCapture(D.pointerId);
          } catch {
          }
          D.preventDefault();
          return;
        }
        const W = Fe(D);
        if (St = W.x, Et = W.y, G === "crop") {
          Rr = !0;
          try {
            E.setPointerCapture(D.pointerId);
          } catch {
          }
          Wn = { x: D.clientX, y: D.clientY }, Ct = document.createElement("div"), Ct.style.cssText = "position:absolute;border:2px dashed #6366f1;background:rgba(99,102,241,.14);pointer-events:none;z-index:6;left:0;top:0;width:0;height:0;", v.appendChild(Ct);
          return;
        }
        if (G === "text") {
          const ie = Il(W.x, W.y);
          if (ie) {
            an(g), pt = { shape: ie.shape, mode: ie.mode, grabX: W.x, grabY: W.y, origX: ie.shape.x, origY: ie.shape.y, origSize: ie.shape.size ?? T.computeFontSize() };
            try {
              E.setPointerCapture(D.pointerId);
            } catch {
            }
            E.style.cursor = ie.mode === "resize" ? "nwse-resize" : "move", D.preventDefault();
            return;
          }
          const te = document.createElement("input"), ae = Qe === "none" ? "none" : `0 0 2px ${Qe}, 0 0 2px ${Qe}`, Ke = ui(), yt = Math.max(6, He * Ke), Gt = He, mn = Qe;
          te.style.cssText = `position:fixed;left:${D.clientX}px;top:${D.clientY}px;padding:0;margin:0;line-height:1;box-sizing:content-box;background:transparent;border:0;color:${he};font-size:${yt}px;font-family:sans-serif;font-weight:700;text-shadow:${ae};outline:1px dashed ${he};z-index:2147483647;min-width:80px;`, document.body.appendChild(te), gt = te, requestAnimationFrame(() => {
            document.body.contains(te) && te.focus();
          }), te.addEventListener("blur", () => {
            gt = null, te.value.trim() && (an(g), T.addShape({ type: "text", color: he, x: St, y: Et, text: te.value.trim(), size: Gt, outline: mn }), Dt()), Xe(te);
          }, { once: !0 }), te.addEventListener("keydown", (_s) => {
            _s.key === "Enter" && te.blur(), _s.key === "Escape" && (te.value = "", te.blur()), _s.stopPropagation();
          });
          return;
        }
        if (G === "count") {
          an(g), T.addShape({ type: "count", color: he, x: W.x, y: W.y, n: ++kh }), Dt();
          return;
        }
        Rr = !0;
        try {
          E.setPointerCapture(D.pointerId);
        } catch {
        }
        G === "pen" && (Wr = [W]);
      }), E.addEventListener("pointermove", (D) => {
        if (fn) {
          E.style.transition = "none", Cr = Ll + (D.clientX - Tl), Mr = _l + (D.clientY - Al), qn(), E.style.cursor = "grabbing";
          return;
        }
        if (pt) {
          const te = Fe(D);
          pt.mode === "move" ? (pt.shape.x = pt.origX + (te.x - pt.grabX), pt.shape.y = pt.origY + (te.y - pt.grabY)) : pt.shape.size = Math.max(10, Math.min(240, pt.origSize + (te.y - pt.grabY))), T.redraw();
          return;
        }
        if (G === "text" && !Rr) {
          const te = Fe(D), ae = Il(te.x, te.y);
          E.style.cursor = ae ? ae.mode === "resize" ? "nwse-resize" : "move" : "crosshair";
        }
        if (!Rr) return;
        if (G === "pen") {
          Wr.push(Fe(D)), Wr.length > 1 && T.drawPreview({ type: "pen", color: he, points: Wr });
          return;
        }
        if (G === "crop" && Ct) {
          const te = v.getBoundingClientRect(), ae = Math.min(Wn.x, D.clientX), Ke = Math.min(Wn.y, D.clientY), yt = Math.max(Wn.x, D.clientX), Gt = Math.max(Wn.y, D.clientY);
          Ct.style.left = ae - te.left + "px", Ct.style.top = Ke - te.top + "px", Ct.style.width = yt - ae + "px", Ct.style.height = Gt - Ke + "px";
          return;
        }
        const W = Fe(D), ie = mh(G, St, Et, W.x, W.y, he);
        ie && T.drawPreview(ie);
      }), E.addEventListener("pointerup", (D) => {
        if (fn) {
          fn = !1, E.style.cursor = dt > 1 ? "grab" : "crosshair";
          try {
            E.releasePointerCapture(D.pointerId);
          } catch {
          }
          return;
        }
        if (pt) {
          pt = null;
          try {
            E.releasePointerCapture(D.pointerId);
          } catch {
          }
          E.style.cursor = "crosshair", T.redraw(), Dt();
          return;
        }
        if (!Rr) return;
        Rr = !1;
        try {
          E.releasePointerCapture(D.pointerId);
        } catch {
        }
        const W = Fe(D);
        if (G === "crop") {
          Ct && (Xe(Ct), Ct = null);
          const ae = Math.max(0, Math.min(St, W.x)), Ke = Math.max(0, Math.min(Et, W.y)), yt = Math.abs(W.x - St), Gt = Math.abs(W.y - Et);
          yt > 4 && Gt > 4 && uh(g, ae, Ke, yt, Gt);
          return;
        }
        const ie = G === "pixelate" && Math.abs(W.x - St) > 4 && Math.abs(W.y - Et) > 4;
        (G === "pen" && Wr.length > 1 || G === "line" || G === "rect" || G === "circle" || G === "arrow" || ie) && an(g), G === "pen" && Wr.length > 1 ? T.addShape({ type: "pen", color: he, points: Wr }) : G === "line" ? T.addShape({ type: "line", color: he, x1: St, y1: Et, x2: W.x, y2: W.y }) : G === "rect" ? T.addShape({ type: "rect", color: he, x: Math.min(St, W.x), y: Math.min(Et, W.y), w: Math.abs(W.x - St), h: Math.abs(W.y - Et) }) : G === "circle" ? T.addShape({ type: "circle", color: he, x: (St + W.x) / 2, y: (Et + W.y) / 2, rx: Math.abs(W.x - St) / 2, ry: Math.abs(W.y - Et) / 2 }) : G === "arrow" ? T.addShape({ type: "arrow", color: he, x1: St, y1: Et, x2: W.x, y2: W.y }) : ie && T.addShape({ type: "pixelate", x: Math.min(St, W.x), y: Math.min(Et, W.y), w: Math.abs(W.x - St), h: Math.abs(W.y - Et) }), Dt();
      }), E.addEventListener("pointercancel", (D) => {
        try {
          E.releasePointerCapture(D.pointerId);
        } catch {
        }
        Ct && (Xe(Ct), Ct = null), fn && (fn = !1, E.style.cursor = dt > 1 ? "grab" : "crosshair"), pt && (pt = null, E.style.cursor = "crosshair", T.redraw(), Dt()), Rr && (Rr = !1, T.redraw());
      });
      const Ol = { p: "pen", l: "line", r: "rect", o: "circle", a: "arrow", t: "text", c: "count", b: "pixelate", k: "crop" };
      ge = (D) => {
        if (!document.body.contains(s)) {
          Un();
          return;
        }
        if (gt && document.body.contains(gt)) return;
        const W = typeof D.composedPath == "function" && D.composedPath()[0] || D.target;
        if (W && (W.tagName === "INPUT" || W.tagName === "TEXTAREA" || W.tagName === "SELECT" || W.isContentEditable)) return;
        if ((D.metaKey || D.ctrlKey) && D.key.toLowerCase() === "z") {
          D.preventDefault(), Ha(g);
          return;
        }
        if (D.metaKey || D.ctrlKey || D.altKey) return;
        const ie = D.key.toLowerCase();
        if (ie === "z") {
          if (D.preventDefault(), dt > 1) yh();
          else {
            const { cx: te, cy: ae } = Ls();
            hi(te, ae, 2);
          }
          return;
        }
        Ol[ie] && (D.preventDefault(), me(Ol[ie]));
      }, document.addEventListener("keydown", ge, { capture: !0 });
    }
  }
  function ph(g) {
    const v = c[g], w = new Image();
    w.onload = () => {
      const M = document.createElement("canvas");
      M.width = w.naturalWidth, M.height = w.naturalHeight;
      const E = new ea(M, v);
      E.redraw();
      const T = document.createElement("div");
      T.style.cssText = "position:fixed;inset:0;background:#000;z-index:2147483647;display:flex;flex-direction:column;pointer-events:all;";
      const L = document.createElement("div");
      L.className = "kl-edtb", L.style.cssText = "display:flex;align-items:center;gap:8px;padding:8px;background:#1e1e2e;flex-wrap:wrap;", L.innerHTML = `
        <button data-tool="pen" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${H("pencil", { size: 14 })} Pen</button>
        <button data-tool="rect" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${H("square", { size: 14 })} Rect</button>
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
        <button id="klavity-clear-ann" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${H("trash-2", { size: 14 })} Clear</button>
        <button id="klavity-save-ann" style="padding:6px 10px;background:#89b4fa;color:#1e1e2e;border:none;border-radius:4px;cursor:pointer;font-weight:700;">${H("check", { label: "Save", size: 14 })} Save</button>
        <button id="klavity-cancel-ann" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${H("x", { size: 14 })}</button>
      `, M.style.cssText = "cursor:crosshair;display:block;margin:12px auto;touch-action:none;background:#fff;border-radius:4px;outline:1px solid rgba(255,255,255,.12);outline-offset:-1px;box-shadow:0 12px 44px rgba(0,0,0,.55);";
      const O = document.createElement("div");
      O.style.cssText = "flex:1;min-height:0;overflow:auto;display:block;box-shadow:inset 0 1px 0 rgba(255,255,255,.04);", O.appendChild(M);
      const _ = document.createElement("style");
      _.textContent = ".kl-edtb button{transition:transform .15s cubic-bezier(.34,1.56,.64,1),background .15s ease;will-change:transform;}.kl-edtb button:hover{transform:translateY(-1px) scale(1.02);background:#45475a;}.kl-edtb button[data-color]:hover{transform:scale(1.14);background:initial;}.kl-edtb button:active{transform:scale(.96);}.kl-edtb button:focus-visible{outline:2px solid #89b4fa;outline-offset:2px;}.kl-edtb .kl-zb{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:34px;padding:0 9px;background:#313244;color:#cdd6f4;border:none;border-radius:8px;cursor:pointer;font-size:15px;font-weight:600;line-height:1;}.kl-edtb .kl-zb:hover{background:#45475a;}@media (prefers-reduced-motion:reduce){.kl-edtb button{transition:none;}.kl-edtb button:hover,.kl-edtb button:active,.kl-edtb button[data-color]:hover{transform:none;}}", T.append(_, L, O), o.appendChild(T), Un();
      let $ = 1;
      const U = (ee) => Math.max(0.05, Math.min(5, ee || 1));
      function q(ee) {
        $ = U(ee), M.style.width = Math.round(M.width * $) + "px", M.style.height = Math.round(M.height * $) + "px";
        const de = L.querySelector("#klavity-zoom-pct");
        de && (de.textContent = Math.round($ * 100) + "%");
      }
      const X = () => Math.max(1, O.clientWidth - 24) / M.width, Z = () => Math.min(Math.max(1, O.clientWidth - 24) / M.width, Math.max(1, O.clientHeight - 24) / M.height), ne = M.height / M.width > Math.max(1, O.clientHeight) / Math.max(1, O.clientWidth);
      q(ne ? X() : Z()), L.querySelector("#klavity-zoom-in").addEventListener("click", () => q($ * 1.25)), L.querySelector("#klavity-zoom-out").addEventListener("click", () => q($ / 1.25)), L.querySelector("#klavity-fit-width").addEventListener("click", () => q(X())), L.querySelector("#klavity-fit-page").addEventListener("click", () => q(Z()));
      let J = "rect", G = "#ef4444", he = !1, He = [], Qe = 0, gt = 0;
      function Er(ee) {
        J = ee, L.querySelectorAll("[data-tool]").forEach((de) => {
          const Fe = de.dataset.tool === ee;
          de.style.background = Fe ? "#585b70" : "#313244", de.style.outline = Fe ? "2px solid #89b4fa" : "none";
        });
      }
      L.querySelectorAll("[data-tool]").forEach((ee) => ee.addEventListener("click", () => Er(ee.dataset.tool))), L.querySelectorAll("[data-color]").forEach((ee) => ee.addEventListener("click", () => {
        G = ee.dataset.color;
      }));
      {
        const ee = L.querySelector("#klavity-color-custom"), de = L.querySelector("#klavity-color-input");
        if (ee && de) {
          ee.addEventListener("click", () => de.click());
          const Fe = () => {
            ee.style.background = de.value, G = de.value;
          };
          de.addEventListener("input", Fe), de.addEventListener("change", Fe);
        }
      }
      L.querySelector("#klavity-undo").addEventListener("click", () => E.undo()), L.querySelector("#klavity-clear-ann").addEventListener("click", () => E.clearAll());
      const Dt = { p: "pen", r: "rect", c: "circle", a: "arrow", t: "text" };
      function me(ee) {
        const de = ee.target;
        if (de && (de.tagName === "INPUT" || de.tagName === "TEXTAREA" || de.isContentEditable)) return;
        if (ee.key === "Escape") {
          ee.stopPropagation(), $e();
          return;
        }
        if ((ee.metaKey || ee.ctrlKey) && ee.key.toLowerCase() === "z") {
          ee.preventDefault(), E.undo();
          return;
        }
        if (ee.metaKey || ee.ctrlKey || ee.altKey) return;
        const Fe = ee.key.toLowerCase();
        Dt[Fe] ? (ee.preventDefault(), Er(Dt[Fe])) : Fe === "u" && (ee.preventDefault(), E.undo());
      }
      function $e() {
        document.removeEventListener("keydown", me, { capture: !0 }), Xe(T), bl();
      }
      document.addEventListener("keydown", me, { capture: !0 }), Er(J), L.querySelector("#klavity-save-ann").addEventListener("click", async () => {
        an(g), E.shapes.length ? re[g] = { w: M.width, h: M.height, shapes: E.shapes.map((ee) => ({ ...ee })) } : delete re[g], rr(g), $e(), Oe();
      }), L.querySelector("#klavity-cancel-ann").addEventListener("click", () => $e());
      function Ne(ee) {
        const de = M.getBoundingClientRect();
        return { x: (ee.clientX - de.left) / de.width * M.width, y: (ee.clientY - de.top) / de.height * M.height };
      }
      M.addEventListener("pointerdown", (ee) => {
        he = !0;
        const de = Ne(ee);
        if ({ x: Qe, y: gt } = de, J === "pen" && (He = [de]), J === "text") {
          he = !1;
          const Fe = document.createElement("input");
          Fe.style.cssText = `position:fixed;left:${ee.clientX}px;top:${ee.clientY}px;background:transparent;border:1px dashed ${G};color:${G};font-size:16px;outline:none;z-index:9999999;min-width:80px;`, document.body.appendChild(Fe), requestAnimationFrame(() => {
            document.body.contains(Fe) && Fe.focus();
          }), Fe.addEventListener("blur", () => {
            Fe.value.trim() && E.addShape({ type: "text", color: G, x: Qe, y: gt, text: Fe.value.trim() }), Xe(Fe);
          }, { once: !0 }), Fe.addEventListener("keydown", (ui) => {
            ui.key === "Enter" && Fe.blur(), ui.stopPropagation();
          });
        }
      }), M.addEventListener("pointermove", (ee) => {
        he && J === "pen" && He.push(Ne(ee));
      }), M.addEventListener("pointerup", (ee) => {
        if (!he) return;
        he = !1;
        const de = Ne(ee);
        J === "pen" && He.length > 1 ? E.addShape({ type: "pen", color: G, points: He }) : J === "rect" ? E.addShape({ type: "rect", color: G, x: Math.min(Qe, de.x), y: Math.min(gt, de.y), w: Math.abs(de.x - Qe), h: Math.abs(de.y - gt) }) : J === "circle" ? E.addShape({ type: "circle", color: G, x: (Qe + de.x) / 2, y: (gt + de.y) / 2, rx: Math.abs(de.x - Qe) / 2, ry: Math.abs(de.y - gt) / 2 }) : J === "arrow" && E.addShape({ type: "arrow", color: G, x1: Qe, y1: gt, x2: de.x, y2: de.y });
      });
    }, w.src = v;
  }
  function hh(g, v) {
    const w = document.createElement("div");
    w.style.cssText = "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:all;";
    const M = document.createElement("div");
    M.className = "klavity-sent";
    const E = document.createElement("div");
    E.className = "kl-sent-check", E.innerHTML = H("check", { label: "Sent", size: 22 }), M.appendChild(E);
    const T = document.createElement("h2");
    T.textContent = "Report sent", M.appendChild(T);
    const L = document.createElement("p");
    if (L.textContent = n.thankYou || "We filed it and emailed you a copy.", M.appendChild(L), g) {
      const O = document.createElement("div");
      O.className = "klavity-ref";
      const _ = document.createElement("span");
      _.textContent = "Filed as";
      const $ = document.createElement("code");
      $.textContent = Us(g, v), O.append(_, $);
      const U = Bs(v);
      if (U) {
        const q = document.createElement("a");
        q.href = U, q.target = "_blank", q.rel = "noopener", q.textContent = "Open in Klavity", O.appendChild(q);
      }
      M.appendChild(O);
    }
    w.appendChild(M), Xe($r), o.appendChild(w), rl(M, et);
  }
  function fh(g, v, w) {
    const { copy: M, onLead: E } = w;
    le.innerHTML = "";
    const T = document.createElement("div");
    T.className = "klavity-success";
    const L = document.createElement("h2");
    if (L.innerHTML = M.headline, T.appendChild(L), M.body) {
      const _ = document.createElement("p");
      _.textContent = M.body, T.appendChild(_);
    }
    if (g) {
      const _ = document.createElement("div");
      _.className = "klavity-ref";
      const $ = document.createElement("span");
      $.textContent = "Filed as";
      const U = document.createElement("code");
      U.textContent = Us(g, v), _.append($, U);
      const q = Bs(v);
      if (q) {
        const X = document.createElement("a");
        X.href = q, X.target = "_blank", X.rel = "noopener", X.textContent = "Open in Klavity", _.appendChild(X);
      }
      T.appendChild(_);
    }
    const O = () => rl(le, Pt);
    if (M.showEmail) {
      const _ = document.createElement("div");
      _.className = "klavity-lead";
      const $ = document.createElement("input");
      $.type = "email", $.placeholder = "you@company.com";
      const U = document.createElement("button"), q = M.emailLabel;
      U.textContent = q;
      const X = document.createElement("div");
      X.className = "klavity-lead-err", X.setAttribute("role", "alert"), X.style.display = "none";
      const Z = async () => {
        const ne = $.value.trim();
        if (!ne || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(ne)) {
          X.textContent = "Please enter a valid email so we can reach you.", X.style.display = "block", $.focus();
          return;
        }
        U.disabled = !0, U.textContent = "Saving…", X.style.display = "none";
        try {
          E && await E(g, ne);
        } catch (G) {
          try {
            console.warn("[Klavity] lead capture failed:", (G == null ? void 0 : G.message) || G);
          } catch {
          }
          X.textContent = "Couldn't save your email — please try again.", X.style.display = "block", U.disabled = !1, U.textContent = "Retry", $.focus();
          return;
        }
        const J = document.createElement("div");
        J.className = "klavity-thanks", J.textContent = "Thanks — we'll be in touch.", Xe(X), _.replaceWith(J), M.showCta || O();
      };
      U.addEventListener("click", Z), $.addEventListener("keydown", (ne) => {
        ne.key === "Enter" && Z();
      }), _.append($, U), T.appendChild(_), T.appendChild(X);
    }
    if (M.showCta && M.ctaUrl) {
      const _ = document.createElement("a");
      _.className = "klavity-cta", _.href = M.ctaUrl, _.target = "_blank", _.rel = "noopener", _.textContent = M.ctaText, T.appendChild(_);
    }
    if (le.appendChild(T), !n.whiteLabel) {
      const _ = document.createElement("div");
      _.className = "klavity-pb";
      const $ = document.createElement("a");
      $.href = md("https://klavity.in", {
        campaign: "powered_by",
        medium: n.attributionMedium,
        ref: n.projectId
      }), $.target = "_blank", $.rel = "noopener", $.textContent = "Klavity", _.append("Powered by ", $), le.appendChild(_);
    }
    !M.showEmail && !M.showCta && O();
  }
  if (P.length && (se = P.length - 1, cn()), t.autoCaptureOnOpen) {
    let g = 0;
    try {
      g = document.getElementsByTagName("*").length;
    } catch {
      g = 0;
    }
    const v = g <= A;
    if (v || ec(t) === "screen") {
      if (l = !0, Oe(), ec(t) === "screen")
        return (async () => {
          const E = await Ms({ viewport: !0, onOpen: !0 });
          if (E.ok) {
            l = !1, Oe();
            return;
          }
          if (E.declined) {
            l = !1, hr({ immediate: !0, reason: "discard" });
            return;
          }
          if (c.length) {
            l = !1, Oe();
            return;
          }
          if (!v) {
            y = !0, l = !1, Oe();
            return;
          }
          if (l = !0, Oe(), t.onCaptureViewport) {
            fl(null).catch(() => {
              l = !1, Oe();
            });
            return;
          }
          t.onCaptureFull().then((T) => {
            const { dataUrl: L, quality: O, suggestSharp: _, blank: $ } = sr(T);
            if (l = !1, $ && c.length === 0) {
              fs();
              return;
            }
            zt(L, O, void 0, !0, !!_), ir(qr);
          }).catch(() => {
            l = !1, Oe();
          });
        })(), Ka;
      const w = () => {
        if (t.onCaptureViewport) {
          fl(null).catch(() => {
            l = !1, Oe();
          });
          return;
        }
        t.onCaptureFull().then((E) => {
          const { dataUrl: T, quality: L, suggestSharp: O, blank: _ } = sr(E);
          if (l = !1, _ && c.length === 0) {
            fs();
            return;
          }
          zt(T, L, void 0, !0, !!O), ir(qr);
        }).catch(() => {
          l = !1, Oe();
        });
      }, M = window.requestIdleCallback;
      typeof M == "function" ? M(() => w(), { timeout: 1200 }) : requestAnimationFrame(() => setTimeout(w, 0));
    } else
      y = !0, Oe();
  }
  return Ka;
}
function Vg(e, t) {
  const r = document.createElement("div");
  r.style.cssText = "position:fixed;inset:0;cursor:crosshair;z-index:2147483646;user-select:none;", r.setAttribute("data-klavity-region-overlay", ""), document.body.appendChild(r);
  const n = document.createElement("div");
  n.textContent = "Drag to select an area · Esc to cancel", n.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-family:system-ui;font-size:14px;background:rgba(0,0,0,.7);padding:8px 16px;border-radius:6px;pointer-events:none;z-index:2147483647;", document.body.appendChild(n);
  let i = 0, s = 0, o = !1;
  function c() {
    document.removeEventListener("keydown", l, { capture: !0 }), Xe(r), Xe(n);
  }
  function l(p) {
    p.key === "Escape" && (p.stopPropagation(), c(), t());
  }
  document.addEventListener("keydown", l, { capture: !0 }), r.addEventListener("pointerdown", (p) => {
    o = !0, i = p.clientX, s = p.clientY, Xe(n);
  }), r.addEventListener("pointermove", (p) => {
    if (!o) return;
    const a = Math.min(p.clientX, i), h = Math.min(p.clientY, s), d = Math.abs(p.clientX - i), u = Math.abs(p.clientY - s);
    r.style.background = `
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) 0 0/${a}px 100%,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${a + d}px 0/calc(100% - ${a + d}px) 100%,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${a}px 0/${d}px ${h}px,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${a}px ${h + u}px/${d}px calc(100% - ${h + u}px)
    `, r.style.backgroundRepeat = "no-repeat";
  }), r.addEventListener("pointerup", (p) => {
    if (!o) return;
    o = !1;
    const a = Math.abs(p.clientX - i), h = Math.abs(p.clientY - s);
    if (a < 8 || h < 8) {
      c(), t();
      return;
    }
    const d = { x: Math.min(p.clientX, i), y: Math.min(p.clientY, s), w: a, h };
    c(), e(d);
  });
}
const Gg = 2e4;
async function tc(e) {
  if (e.type === "image/heic" || e.type === "image/heif" || e.name.endsWith(".heic") || e.name.endsWith(".heif")) {
    let t;
    try {
      const r = await Promise.race([
        (async () => {
          const n = (await import("./heic2any-D6xzzX7R.js").then((i) => i.h)).default;
          return await n({ blob: e, toType: "image/jpeg", quality: 0.85 });
        })(),
        new Promise((n, i) => {
          t = setTimeout(() => i(new Error("heic-convert-timeout")), Gg);
        })
      ]);
      return rc(r);
    } catch {
    } finally {
      t && clearTimeout(t);
    }
  }
  return rc(e);
}
const Kg = 3e4;
function rc(e) {
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
    }, Kg), o = (c) => {
      i || (i = !0, clearTimeout(s), c());
    };
    n.onload = () => o(() => t(n.result)), n.onerror = () => o(() => r(n.error || new Error("file read failed"))), n.onabort = () => o(() => r(n.error || new Error("file read aborted")));
    try {
      n.readAsDataURL(e);
    } catch (c) {
      o(() => r(c instanceof Error ? c : new Error("file read failed")));
    }
  });
}
const Xg = {
  frustrated: { accent: "#e8849a", mark: "vein", label: "Frustrated" },
  confused: { accent: "#e8a24a", mark: "q", label: "Confused" },
  satisfied: { accent: "#7fd1c4", mark: "check", label: "Satisfied" },
  delighted: { accent: "#9fd6a0", mark: "spark", label: "Delighted" },
  neutral: { accent: "#8a8276", mark: "dots", label: "Neutral" },
  inspired: { accent: "#8b8bf5", mark: "bulb", label: "Inspired" },
  alarmed: { accent: "#ef6b6b", mark: "bang", label: "Alarmed" }
};
function Jg(e) {
  const t = (e || "").trim().split(/\s+/).filter(Boolean);
  return t.length === 0 ? "?" : t.length === 1 ? t[0].slice(0, 2).toUpperCase() : (t[0][0] + t[t.length - 1][0]).toUpperCase();
}
function Zg(e) {
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
const Qg = {
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
function ey(e) {
  const {
    name: t,
    photoUrl: r,
    color: n = "#6f6cf2",
    emotion: i = "none",
    size: s = 58,
    eyes: o = !0,
    legs: c = !0,
    animate: l = !0,
    className: p = ""
  } = e, a = Hr(e.initials || Jg(t)), h = i !== "none" ? Xg[i] : null, d = h ? `<span class="ksim-mark ${l ? Qg[h.mark] : ""}" style="color:${Hr(h.accent)}">${Zg(h.mark)}</span>` : "", m = r ? `<span class="ksim-head ksim-photo"><img src="${Hr(r)}" alt="${Hr(t)}" loading="lazy" onerror="this.style.display='none';this.parentNode.classList.add('ksim-fallback')"><span class="ksim-ini">${a}</span></span>` : `<span class="ksim-head ksim-mono"><span class="ksim-ini">${a}</span>${o ? '<span class="ksim-eyes"><i></i><i></i></span>' : ""}</span>`, f = c ? '<span class="ksim-legs"><i></i><i></i></span>' : "", y = ["ksim", l ? "is-animated" : "", p].filter(Boolean).join(" "), C = `--ksim-persona:${Hr(n)};--ksim-size:${s}px;` + (h ? `--ksim-accent:${Hr(h.accent)};` : "");
  return `<span class="${y}" style="${C}" data-emotion="${i}" title="${Hr(t)}">${d}${m}${f}</span>`;
}
function ty(e) {
  const t = document.createElement("template");
  return t.innerHTML = ey(e).trim(), t.content.firstElementChild;
}
const ry = `
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
function ny(e = document) {
  var n;
  const t = e.head ?? e ?? null;
  if (!t || (n = t.querySelector) != null && n.call(t, "style[data-ksim]")) return;
  const r = document.createElement("style");
  r.setAttribute("data-ksim", ""), r.textContent = ry, t.appendChild(r);
}
function ia(e, t) {
  const r = e.indexOf(","), n = e.slice(0, r), i = e.slice(r + 1), s = /data:([^;,]+)/.exec(n), o = t || (s ? s[1] : "application/octet-stream");
  if (/;base64/i.test(n)) {
    const c = atob(i), l = new Uint8Array(c.length);
    for (let p = 0; p < c.length; p++) l[p] = c.charCodeAt(p);
    return new Blob([l], { type: o });
  }
  return new Blob([decodeURIComponent(i)], { type: o });
}
function iy(e) {
  if (!e || typeof e != "object") return !1;
  if (typeof e.selector == "string" && e.selector.trim() !== "") return !0;
  const t = (r) => r && Array.isArray(r.shapes) && r.shapes.length > 0;
  if (t(e)) return !0;
  if (e.byIndex && typeof e.byIndex == "object") {
    for (const r of Object.keys(e.byIndex)) if (t(e.byIndex[r])) return !0;
  }
  return !1;
}
function sy(e) {
  const t = new FormData();
  if (t.set("type", e.type ?? "bug"), t.set("description", e.description), t.set("page_url", e.pageUrl), e.context && t.set("context", JSON.stringify(e.context)), e.projectId && t.set("project_id", e.projectId), e.replayEvents && e.replayEvents.length && t.set("replay_events", JSON.stringify(e.replayEvents)), e.title && t.set("title", e.title), e.referrer && t.set("referrer", e.referrer), e.reporter && Object.keys(e.reporter).length && t.set("reporter", JSON.stringify(e.reporter)), e.clientInfo && Object.keys(e.clientInfo).length && t.set("client_info", JSON.stringify(e.clientInfo)), e.files)
    for (const r of e.files)
      try {
        t.append("files", r.blob ?? ia(r.dataUrl, r.type), r.name);
      } catch {
      }
  if (e.recordings && e.recordings.length) {
    const r = [];
    for (const n of e.recordings)
      try {
        const i = (n.mime || "").includes("mp4") ? "mp4" : "webm", s = n.mime && /^video\//.test(n.mime) ? n.mime : `video/${i}`;
        t.append("recording", ia(n.dataUrl, s), `recording-${n.id}.${i}`), r.push({ id: n.id, durationMs: n.durationMs, width: n.width, height: n.height, bytes: n.bytes, mime: n.mime, screenOnly: n.screenOnly });
      } catch {
      }
    r.length && t.set("recording_meta", JSON.stringify(r));
  }
  return iy(e.annotations) && t.set("annotations_json", JSON.stringify(e.annotations)), t;
}
async function oy(e) {
  try {
    const t = e.get("replay_events");
    if (typeof t != "string" || !t || typeof CompressionStream != "function") return;
    const r = await new Response(new Blob([t]).stream().pipeThrough(new CompressionStream("gzip"))).blob();
    if (!r.size || r.size >= t.length) return;
    e.delete("replay_events"), e.set("replay_events_gz", new Blob([r], { type: "application/gzip" }), "replay.json.gz");
  } catch {
  }
}
async function ay(e) {
  const { settings: t, type: r, description: n, context: i, screenshots: s, projectId: o, replayEvents: c } = e, l = sy({
    type: e.kind ?? r,
    description: n,
    pageUrl: i.pageUrl,
    context: i,
    projectId: o,
    replayEvents: c,
    title: e.title,
    referrer: e.referrer,
    reporter: e.reporter,
    clientInfo: e.clientInfo,
    files: e.files,
    recordings: e.recordings,
    annotations: e.annotations
  });
  await oy(l), e.reporterEmail && l.set("reporter_email", e.reporterEmail);
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
        l.append("screenshot_thumbs", ia(u), "thumb.jpg");
      } catch {
      }
  const a = p ? { Authorization: `Bearer ${t.klavToken}` } : {}, h = await fetch(`${t.backendUrl}/api/feedback`, { method: "POST", headers: a, body: l });
  if (!h.ok) throw new Error(`Klavity backend error ${h.status}: ${await h.text()}`);
  const d = await h.json();
  return {
    issueKey: d.jira_key ?? d.id,
    issueUrl: d.issue_url ?? t.backendUrl
  };
}
const ly = (
  // entrance keyframes: spring scale-in from top-left (cursor anchor)
  "@keyframes klm-in{0%{opacity:0;transform:scale(.9) translateY(-6px)}100%{opacity:1;transform:scale(1) translateY(0)}}@keyframes klm-row-in{0%{opacity:0;transform:translateY(8px) scale(.97)}100%{opacity:1;transform:translateY(0) scale(1)}}@keyframes klm-shine{0%{transform:translateX(-130%)}100%{transform:translateX(240%)}}@keyframes klm-spin{to{transform:rotate(360deg)}}.klm-menu{animation:klm-in .34s cubic-bezier(.34,1.56,.64,1) both}.klm-card{position:relative;display:flex;align-items:center;gap:8px;width:100%;border:0;cursor:pointer;text-align:left;padding:8px 10px;border-radius:12px;color:#2a2342;font-family:inherit;background:linear-gradient(180deg,rgba(255,255,255,.72),rgba(252,250,246,.55));box-shadow:0 1px 2px rgba(40,25,70,.06),inset 0 0 0 1px rgba(99,102,241,.08);transition:scale .14s cubic-bezier(.2,0,0,1),box-shadow .2s ease,background .2s ease;animation:klm-row-in .42s cubic-bezier(.16,1,.3,1) both}.klm-card:hover{scale:1.015;box-shadow:0 5px 14px -3px rgba(99,102,241,.3),inset 0 0 0 1px rgba(99,102,241,.16)}.klm-card:active{scale:.96}.klm-card:focus-visible{outline:2px solid #6366f1;outline-offset:2px}.klm-chip{flex:none;width:32px;height:32px;border-radius:8px;display:grid;place-items:center;color:#5b51c9;background:rgba(99,102,241,.12);transition:transform .2s cubic-bezier(.34,1.56,.64,1)}.klm-chip svg{width:16px;height:16px;display:block}.klm-card:hover .klm-chip{transform:scale(1.1) rotate(-5deg)}.klm-body{display:flex;flex-direction:column;gap:2px;min-width:0}.klm-t{font-size:13px;font-weight:650;letter-spacing:-.01em;line-height:1.2}.klm-d{font-size:10.5px;line-height:1.35;color:#7c7793;text-wrap:pretty}.klm-go{margin-left:auto;flex:none;color:#b6afce;display:inline-flex;transition:transform .2s cubic-bezier(.2,0,0,1)}.klm-go svg{width:14px;height:14px;display:block}.klm-card:hover .klm-go{transform:translateX(3px)}.klm-hint{margin-left:auto;flex:none;font-family:ui-monospace,monospace;font-size:10px;color:#9a93a6;background:rgba(40,30,60,.06);padding:3px 8px;border-radius:12px;text-align:center;line-height:1.32}.klm-card.primary{background:linear-gradient(160deg,#6d6bf3,#5b51d8);color:#fff;box-shadow:0 6px 16px -4px rgba(79,70,229,.45),inset 0 1px 0 rgba(255,255,255,.3)}.klm-card.primary:hover{box-shadow:0 9px 22px -4px rgba(79,70,229,.55),inset 0 1px 0 rgba(255,255,255,.35)}.klm-card.primary .klm-chip{background:rgba(255,255,255,.22);color:#fff}.klm-card.primary .klm-d{color:rgba(255,255,255,.85)}.klm-card.primary .klm-go{color:rgba(255,255,255,.72)}.klm-card.muted{background:linear-gradient(180deg,rgba(250,248,244,.62),rgba(243,236,225,.5))}.klm-card.muted .klm-chip{background:rgba(40,30,60,.06);color:#8a8390}.klm-card.muted .klm-t{color:#5d5870}.klm-card.muted .klm-d{color:#9a93a6}.klm-sims-row{display:flex;align-items:center;justify-content:space-between;padding:2px 4px 4px;gap:6px;min-height:30px}.klm-sims-chips{display:flex;align-items:center;gap:0}.klm-sim-chip{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font-size:9px;font-weight:700;color:#fff;flex-shrink:0;border:1.5px solid rgba(255,255,255,.65);margin-left:-3px}.klm-sims-chips .klm-sim-chip:first-child{margin-left:0}.klm-issue-pill{font-size:10px;font-weight:650;color:#ef4444;background:rgba(239,68,68,.1);border-radius:20px;padding:2px 7px;white-space:nowrap;margin-left:auto}.klm-sims-label{font-size:10.5px;color:#9a93a6;margin-left:6px;white-space:nowrap}.klm-foot{text-align:center;font-size:11px;color:#8a8076;padding:4px 0 2px;border:0;background:transparent;width:100%;cursor:pointer;font-family:inherit;border-radius:8px;transition:color .18s ease;animation:klm-row-in .42s cubic-bezier(.16,1,.3,1) both}.klm-foot:hover{color:#5b51c9}.klm-foot:focus-visible{outline:2px solid #6366f1;outline-offset:2px}.klm-shine{position:absolute;top:0;left:0;width:42%;height:100%;pointer-events:none;background:linear-gradient(105deg,transparent,rgba(255,255,255,.6),transparent);transform:translateX(-130%);animation:klm-shine 1s ease-out .15s both}"
), cy = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
function uy(e, t) {
  const r = e.createElement("button");
  r.className = "klm-card" + (t.primary ? " primary" : "") + (t.muted ? " muted" : ""), t.animationDelayMs != null && (r.style.animationDelay = t.animationDelayMs + "ms");
  const n = t.hint ? '<span class="klm-hint">' + t.hint + "</span>" : '<span class="klm-go">' + cy + "</span>";
  return r.innerHTML = '<span class="klm-chip">' + t.iconHtml + '</span><span class="klm-body"><span class="klm-t">' + t.label + "</span>" + (t.desc ? '<span class="klm-d">' + t.desc + "</span>" : "") + "</span>" + n, r;
}
function dy(e) {
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
function py(e) {
  if (/Windows NT 10/.test(e)) return "Windows 10/11";
  if (/Windows NT/.test(e)) return "Windows";
  if (/iPhone|iPad|iPod/.test(e)) return "iOS";
  if (/Android/.test(e)) return "Android";
  if (/Mac OS X/.test(e)) return "macOS";
  if (/CrOS/.test(e)) return "ChromeOS";
  if (/Linux/.test(e)) return "Linux";
}
function qs(e = typeof window < "u" ? window : void 0, t = typeof navigator < "u" ? navigator : void 0) {
  const r = {}, n = t && t.userAgent || "";
  n && (r.userAgent = n.slice(0, 500));
  const i = dy(n);
  i.browser && (r.browser = i.browser), i.version && (r.browserVersion = i.version);
  const s = py(n);
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
    const o = Intl.DateTimeFormat().resolvedOptions().timeZone;
    o && (r.timezone = String(o).slice(0, 60));
  } catch {
  }
  return r;
}
function or(e, t) {
  if (t >= e.length) return null;
  const r = e[t];
  let n = 0;
  for (let o = 7; o >= 0; o--)
    if ((r & 1 << o) !== 0) {
      n = 8 - o;
      break;
    }
  if (n === 0 || t + n > e.length) return null;
  let i = r & (1 << 8 - n) - 1;
  for (let o = 1; o < n; o++)
    i = i * 256 + e[t + o];
  let s = 0;
  for (let o = 0; o < n; o++)
    s = s * 256 + e[t + o];
  return { width: n, value: i, rawId: s };
}
function nc(e, t = 0) {
  let r = t;
  if (!r)
    for (let s = 1; s <= 8; s++) {
      const o = (1 << 7 * s) - 2;
      if (e <= o) {
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
function ic(e) {
  const t = new ArrayBuffer(8);
  return new DataView(t).setFloat64(0, e, !1), new Uint8Array(t);
}
function hy(e, t) {
  if (e instanceof Uint8Array || (e = new Uint8Array(e)), e.length < 16 || t <= 0 || e[0] !== 26 || e[1] !== 69 || e[2] !== 223 || e[3] !== 163)
    return e;
  const r = or(e, 0);
  if (!r) return e;
  const n = or(e, r.width);
  if (!n) return e;
  const i = r.width + n.width + n.value;
  if (i >= e.length) return e;
  const s = or(e, i);
  if (!s || s.rawId !== 408125543) return e;
  const o = or(e, i + s.width);
  if (!o) return e;
  const c = i + s.width + o.width;
  let l = c;
  const p = o.width === 8 && o.value === 72057594037927940, a = p ? e.length : Math.min(e.length, c + o.value);
  let h = -1, d = null, u = 0;
  for (; l < a; ) {
    const Y = or(e, l);
    if (!Y) break;
    const oe = or(e, l + Y.width);
    if (!oe) break;
    if (Y.rawId === 357149030) {
      h = l, d = oe, u = Y.width + oe.width;
      break;
    }
    if (Y.rawId === 524531317) break;
    l += Y.width + oe.width + oe.value;
  }
  if (h === -1 || !d) return e;
  const m = h + u, f = m + d.value;
  let y = m, C = 1e6, k = -1, b = 0, A = 0, S = !1;
  for (; y < f; ) {
    const Y = or(e, y);
    if (!Y) break;
    const oe = or(e, y + Y.width);
    if (!oe) break;
    const re = y + Y.width + oe.width, ce = re + oe.value;
    if (Y.rawId === 2807729) {
      S = !0;
      let Ae = 0;
      for (let Be = 0; Be < oe.value; Be++)
        Ae = Ae * 256 + e[re + Be];
      Ae > 0 && (C = Ae);
    } else Y.rawId === 17545 && (k = y, b = ce - y, A = oe.value);
    y = ce;
  }
  const x = t * 1e6 / C;
  if (k !== -1 && A === 8) {
    const Y = or(e, k);
    if (Y) {
      const oe = or(e, k + Y.width);
      if (oe && oe.value === 8) {
        const re = k + Y.width + oe.width, ce = new Uint8Array(e);
        return ce.set(ic(x), re), ce;
      }
    }
  }
  const R = new Uint8Array(11);
  R[0] = 68, R[1] = 137, R[2] = 136, R.set(ic(x), 3);
  let I = null;
  S || (I = new Uint8Array([42, 215, 177, 131, 15, 66, 64]));
  let F;
  if (k === -1) {
    const Y = e.subarray(m, f), oe = R.length + (I ? I.length : 0);
    F = new Uint8Array(Y.length + oe);
    let re = 0;
    I && (F.set(I, re), re += I.length), F.set(Y, re), re += Y.length, F.set(R, re);
  } else {
    const Y = e.subarray(m, k), oe = e.subarray(k + b, f), re = R.length + (I ? I.length : 0);
    F = new Uint8Array(Y.length + re + oe.length);
    let ce = 0;
    I && (F.set(I, ce), ce += I.length), F.set(Y, ce), ce += Y.length, F.set(R, ce), ce += R.length, F.set(oe, ce);
  }
  const z = nc(F.length), Q = new Uint8Array(4 + z.length);
  Q[0] = 21, Q[1] = 73, Q[2] = 169, Q[3] = 102, Q.set(z, 4);
  const B = new Uint8Array(Q.length + F.length);
  B.set(Q, 0), B.set(F, Q.length);
  const N = u + d.value, De = B.length - N;
  let Je = null;
  p || (Je = nc(o.value + De, o.width));
  const fe = e.subarray(0, i + s.width), pe = Je || e.subarray(i + s.width, c), Re = e.subarray(c, h), Ue = B, Te = e.subarray(h + N), ke = fe.length + pe.length + Re.length + Ue.length + Te.length, Ge = new Uint8Array(ke);
  let P = 0;
  return Ge.set(fe, P), P += fe.length, Ge.set(pe, P), P += pe.length, Ge.set(Re, P), P += Re.length, Ge.set(Ue, P), P += Ue.length, Ge.set(Te, P), P += Te.length, Ge;
}
function fy(e) {
  return typeof e.arrayBuffer == "function" ? e.arrayBuffer() : new Promise((t, r) => {
    try {
      const n = new FileReader();
      n.onload = () => t(n.result), n.onerror = () => r(n.error || new Error("read failed")), n.readAsArrayBuffer(e);
    } catch (n) {
      r(n);
    }
  });
}
async function my(e, t) {
  if (!e || t <= 0) return e;
  try {
    const r = new Uint8Array(await fy(e)), n = hy(r, t);
    return n === r ? e : new Blob([n], { type: e.type || "video/webm" });
  } catch {
    return e;
  }
}
const gy = 180 * 1e3, yy = 50 * 1024 * 1024, by = 1e6, ky = 96e3, vy = 15, sc = 1280, bd = {
  maxDurationMs: gy,
  maxBytes: yy
}, xy = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm;codecs=h264,opus",
  "video/mp4;codecs=avc1,mp4a.40.2",
  "video/webm"
];
function ya() {
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
function wy(e, t = xy) {
  const r = e ?? ((n) => typeof MediaRecorder < "u" && !!MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(n));
  for (const n of t)
    if (r(n)) return n;
  return null;
}
function kd(e = ya()) {
  const t = e.mediaDevices, r = e.MediaRecorder ?? globalThis.MediaRecorder;
  return !!t && typeof t.getDisplayMedia == "function" && typeof r < "u";
}
function Sy() {
  return "rec_" + (typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));
}
async function Ey(e = {}, t = ya()) {
  var k, b, A, S, x, R, I, F, z, Q, B, N, De, Je, fe, pe, Re, Ue, Te, ke, Ge;
  const r = { ...bd, ...e.caps || {} }, n = e.wantCamera === !0, i = e.wantMic !== !1, s = Math.max(5, Math.min(60, e.fps ?? vy)), o = wy(
    (k = t.MediaRecorder) != null && k.isTypeSupported ? (P) => t.MediaRecorder.isTypeSupported(P) : void 0
  );
  if (!o) throw new Error("recording-unsupported: no MediaRecorder codec available in this browser");
  const c = Sy(), l = t.createElement("canvas"), p = l.getContext ? l.getContext("2d") : null, a = t.createElement("video");
  a.muted = !0, a.playsInline = !0, a.autoplay = !0;
  try {
    (b = a.setAttribute) == null || b.call(a, "playsinline", ""), (A = a.setAttribute) == null || A.call(a, "autoplay", ""), (S = a.setAttribute) == null || S.call(a, "muted", "");
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
    var Y;
    d = P;
    try {
      (Y = e.onState) == null || Y.call(e, P);
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
  const C = () => {
    var P;
    for (const Y of [f, y])
      try {
        (P = Y == null ? void 0 : Y.getTracks) == null || P.call(Y).forEach((oe) => {
          var re;
          return (re = oe.stop) == null ? void 0 : re.call(oe);
        });
      } catch {
      }
  };
  try {
    let P = function() {
      if (!Nt) {
        Nt = !0;
        try {
          lt.state !== "inactive" && lt.stop();
        } catch {
        }
      }
    };
    const Y = (z = f.getVideoTracks) == null ? void 0 : z.call(f)[0], oe = ((Q = Y == null ? void 0 : Y.getSettings) == null ? void 0 : Q.call(Y)) ?? {}, re = oe.width && oe.height ? oe.width / oe.height : 16 / 9;
    l.width = sc, l.height = Math.round(sc / re);
    let ce = null, Ae = !1, Be = !0;
    if (n || i)
      try {
        if (y = await t.mediaDevices.getUserMedia({
          video: n ? { width: 640, height: 480, facingMode: "user" } : !1,
          audio: i ? { echoCancellation: !0, noiseSuppression: !0 } : !1
        }), n && ((B = y.getVideoTracks) != null && B.call(y).length)) {
          Ae = !0, Be = !1;
          try {
            h.srcObject = y, await (((N = h.play) == null ? void 0 : N.call(h)) ?? Promise.resolve());
          } catch {
          }
        }
        i && (ce = ((De = y.getAudioTracks) == null ? void 0 : De.call(y)[0]) || null, ce && (Be = !1));
      } catch (ue) {
        let ze = !1;
        if (i && n)
          try {
            if (y = await t.mediaDevices.getUserMedia({ video: !1, audio: { echoCancellation: !0, noiseSuppression: !0 } }), ce = ((Je = y.getAudioTracks) == null ? void 0 : Je.call(y)[0]) || null, ce) {
              Be = !1, ze = !0;
              try {
                (fe = e.onFallback) == null || fe.call(e, "camera-blocked");
              } catch {
              }
            }
          } catch {
          }
        if (!ze) {
          try {
            (pe = e.onFallback) == null || pe.call(e, (ue == null ? void 0 : ue.name) === "NotAllowedError" ? "permissions-policy" : (ue == null ? void 0 : ue.name) || "camera-mic-blocked");
          } catch {
          }
          Be = !0;
        }
      }
    const Se = !!ce;
    if (Ae)
      try {
        a.srcObject = f, await (((Re = a.play) == null ? void 0 : Re.call(a)) ?? Promise.resolve());
      } catch {
      }
    let K = 0, se = 0;
    const ge = () => {
      if (!p) return;
      const ue = l.width, ze = l.height;
      if (a.videoWidth) {
        const et = a.videoWidth, Pt = a.videoHeight, _e = et / Pt, st = ue / ze;
        let pr = ue, rr = ze, Pn = 0, on = 0;
        _e > st ? (rr = ue / _e, on = (ze - rr) / 2) : (pr = ze * _e, Pn = (ue - pr) / 2), (Pn > 0 || on > 0) && (p.fillStyle = "#000", p.fillRect(0, 0, ue, ze)), p.drawImage(a, Pn, on, pr, rr);
      }
      if (Ae && h.videoWidth) {
        const et = Math.round(ue * 0.22), Pt = Math.round(et * (h.videoHeight / h.videoWidth)), _e = ue - et - 20, st = ze - Pt - 20;
        p.drawImage(h, _e, st, et, Pt), p.strokeStyle = "#7c3aed", p.lineWidth = 2, p.strokeRect(_e, st, et, Pt);
      }
      d === "recording" && (p.fillStyle = "#e11", p.beginPath(), p.arc(24, 24, 7, 0, Math.PI * 2), p.fill());
    };
    if (Ae) {
      let ue = 0;
      const ze = Math.floor(1e3 / s), et = () => {
        ue = t.now(), ge();
      }, Pt = () => {
        K = t.raf(Pt), et();
      };
      Pt(), se = t.setInterval(() => {
        var _e;
        if (a.paused && !(Y != null && Y.muted))
          try {
            (_e = a.play) == null || _e.call(a);
          } catch {
          }
        t.now() - ue >= ze && et();
      }, Math.max(16, ze));
    }
    const Le = [];
    let je = null;
    if (Ae) {
      try {
        je = l.captureStream ? l.captureStream(s) : null;
      } catch {
      }
      const ue = (Ue = je == null ? void 0 : je.getVideoTracks) == null ? void 0 : Ue.call(je)[0];
      ue ? Le.push(ue) : Y && Le.push(Y);
    } else Y && Le.push(Y);
    ce && Le.push(ce);
    const ve = new t.MediaStream(Le);
    try {
      (Te = Y == null ? void 0 : Y.addEventListener) == null || Te.call(Y, "ended", () => P()), (ke = Y == null ? void 0 : Y.addEventListener) == null || ke.call(Y, "mute", () => {
      }), (Ge = Y == null ? void 0 : Y.addEventListener) == null || Ge.call(Y, "unmute", () => {
        var ue;
        if (Ae) {
          try {
            (ue = a.play) == null || ue.call(a);
          } catch {
          }
          ge();
        }
      });
    } catch {
    }
    const qe = () => {
      var ue, ze;
      if (Ae && typeof document < "u" && !document.hidden) {
        try {
          (ue = a.play) == null || ue.call(a);
        } catch {
        }
        try {
          (ze = h.play) == null || ze.call(h);
        } catch {
        }
        ge();
      }
    };
    try {
      typeof document < "u" && document.addEventListener("visibilitychange", qe);
    } catch {
    }
    const ut = Math.max(15e4, Math.floor(e.videoBitsPerSecond ?? by)), Ee = Math.max(16e3, Math.floor(e.audioBitsPerSecond ?? ky)), lt = new t.MediaRecorder(ve, { mimeType: o, videoBitsPerSecond: ut, audioBitsPerSecond: Ee }), It = [];
    let Wt = 0, Ot = 0, Pe = 0, xt = 0, tr = 0, Nt = !1;
    const Rt = () => {
      if (d === "idle") return 0;
      const ue = t.now() - Ot - Pe;
      return Math.max(0, ue - (xt ? t.now() - xt : 0));
    };
    lt.ondataavailable = (ue) => {
      var ze, et;
      if (ue != null && ue.data && ue.data.size) {
        It.push(ue.data), Wt += ue.data.size;
        try {
          (ze = e.onChunk) == null || ze.call(e, ue.data);
        } catch {
        }
      }
      try {
        (et = e.onStats) == null || et.call(e, { elapsedMs: Rt(), bytes: Wt });
      } catch {
      }
      Wt >= r.maxBytes && P();
    };
    let wt;
    const jt = new Promise((ue) => {
      wt = ue;
    }), tt = C;
    return lt.onstop = async () => {
      K && t.caf(K), se && (t.clearInterval(se), se = 0), tr && (t.clearInterval(tr), tr = 0);
      try {
        typeof document < "u" && document.removeEventListener("visibilitychange", qe);
      } catch {
      }
      const ue = Rt();
      tt();
      try {
        a.srcObject = null;
      } catch {
      }
      try {
        h.srcObject = null;
      } catch {
      }
      u("stopped");
      const ze = new Blob(It, { type: o.split(";")[0] });
      let et = ze;
      if (ue > 0 && (ze.type.includes("webm") || o.includes("webm")))
        try {
          et = await my(ze, ue);
        } catch {
          et = ze;
        }
      const Pt = oe.width && oe.width > 0 ? oe.width : l.width, _e = oe.height && oe.height > 0 ? oe.height : l.height;
      wt({
        id: c,
        blob: et,
        mime: (et.type || o || "video/webm").split(";")[0],
        durationMs: ue,
        bytes: et.size || Wt,
        width: Ae ? l.width : Pt,
        height: Ae ? l.height : _e,
        screenOnly: Be,
        hadCamera: Ae,
        hadAudio: Se
      });
    }, lt.start(1e3), Ot = t.now(), u("recording"), tr = t.setInterval(() => {
      var ze;
      const ue = Rt();
      try {
        (ze = e.onStats) == null || ze.call(e, { elapsedMs: ue, bytes: Wt });
      } catch {
      }
      ue >= r.maxDurationMs && P();
    }, 200), {
      pause() {
        if (d === "recording") {
          try {
            lt.pause();
          } catch {
          }
          xt = t.now(), u("paused");
        }
      },
      resume() {
        if (d === "paused") {
          try {
            lt.resume();
          } catch {
          }
          Pe += t.now() - xt, xt = 0, u("recording");
        }
      },
      stop() {
        P();
      },
      state() {
        return d;
      },
      screenOnly() {
        return Be;
      },
      // KLA-602(b): expose the live camera stream ONLY when the camera is genuinely part of the capture, so the
      // overlay can mount a self-view bubble. Screen-only / audio-only(mic) fallbacks return null → no bubble.
      cameraStream() {
        return Ae && y ? y : null;
      },
      done: jt
    };
  } catch (P) {
    throw C(), P;
  }
}
function Cy(e) {
  return new Promise((t, r) => {
    try {
      const n = new FileReader();
      n.onload = () => t(String(n.result)), n.onerror = () => r(n.error || new Error("read failed")), n.readAsDataURL(e);
    } catch (n) {
      r(n);
    }
  });
}
async function My(e) {
  return {
    id: e.id,
    dataUrl: await Cy(e.blob),
    blob: e.blob,
    mime: (e.mime || "video/webm").split(";")[0],
    durationMs: Math.round(e.durationMs),
    bytes: e.bytes,
    width: e.width,
    height: e.height,
    screenOnly: e.screenOnly
  };
}
function Ry(e) {
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
  let n = !1, i = 0, s = 0, o = 0, c = 0;
  const l = (u) => {
    var f;
    n = !0, t.style.cursor = "grabbing";
    const m = t.getBoundingClientRect();
    o = m.left, c = m.top, i = u.clientX, s = u.clientY, t.style.right = "auto", t.style.bottom = "auto", t.style.left = o + "px", t.style.top = c + "px";
    try {
      (f = t.setPointerCapture) == null || f.call(t, u.pointerId);
    } catch {
    }
  }, p = (u) => {
    n && (t.style.left = Math.max(0, o + (u.clientX - i)) + "px", t.style.top = Math.max(0, c + (u.clientY - s)) + "px");
  }, a = () => {
    n = !1, t.style.cursor = "grab";
  };
  return t.addEventListener("pointerdown", l), t.addEventListener("pointermove", p), t.addEventListener("pointerup", a), t;
}
async function Ty(e = {}) {
  if (typeof document > "u") return null;
  const t = e.deps ?? ya();
  return kd(t) ? new Promise((r) => {
    const n = document.createElement("div");
    n.setAttribute("data-klavity-ui", "recorder");
    const i = document.createElement("div");
    n.appendChild(i), document.body.appendChild(n);
    const s = 'font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#19140f', o = (x) => {
      x === "bar" ? (n.style.cssText = `position:fixed;inset:0;z-index:2147483647;pointer-events:none;${s}`, i.style.cssText = "position:fixed;right:20px;top:50%;transform:translateY(-50%);pointer-events:auto;background:#f5f3ee;border:1px solid #e3ddd1;border-radius:14px;box-shadow:0 12px 40px rgba(28,22,40,.32);overflow:hidden;max-width:min(240px,80vw)") : (n.style.cssText = `position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;background:rgba(10,8,14,.55);${s}`, i.style.cssText = "width:360px;max-width:92vw;background:#f5f3ee;border:1px solid #e3ddd1;border-radius:12px;box-shadow:0 20px 60px rgba(28,22,40,.28);overflow:hidden");
    }, c = (x) => {
      var R;
      try {
        (R = e.onPhase) == null || R.call(e, x);
      } catch {
      }
    };
    o("modal");
    let l = !1, p = null, a = !1;
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
      a && x.target === n && (x.preventDefault(), x.stopPropagation(), f(null));
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
    }, C = (x) => `${(x / 1048576).toFixed(1)} MB`, k = { ...bd, ...e.caps || {} }, b = () => {
      o("modal"), c("consent"), a = !0, i.setAttribute("role", "dialog"), i.setAttribute("aria-modal", "true"), i.setAttribute("aria-label", "Record a walkthrough");
      const x = e.defaultCamera === !0 ? " checked" : "";
      i.innerHTML = `<div style="padding:14px;border-bottom:1px solid #e3ddd1;font-weight:600">Record a walkthrough</div><div style="padding:14px"><label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="klr-screen" checked disabled> Share my <b>screen</b></label><label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="klr-cam"${x}> Camera <span style="font-size:9px;font-weight:800;color:#fff;background:#6366f1;padding:1px 5px;border-radius:999px">optional</span></label><label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="klr-mic" checked> Microphone (narration)</label><div style="display:flex;gap:8px;margin-top:10px"><button id="klr-start" style="padding:8px 13px;border-radius:8px;border:1px solid #dc2626;background:#dc2626;color:#fff;font-weight:600;cursor:pointer">Start recording</button><button id="klr-cancel" style="padding:8px 13px;border-radius:8px;border:1px solid #e3ddd1;background:#fffdf8;font-weight:600;cursor:pointer">Cancel</button></div><p style="font-size:11px;color:#574f45;margin-top:8px;padding:8px;background:#efeadf;border-radius:8px;border:1px solid #e3ddd1">Tip: to capture steps across <b>multiple pages/tabs</b>, choose <b>&quot;Entire Screen&quot;</b> in the next dialog. Sharing a single tab will not follow you when you switch tabs.</p><p style="font-size:11px;color:#574f45;margin-top:8px">Your browser will ask to share a tab/screen. Max ${Math.round(k.maxDurationMs / 6e4)} min. Nothing uploads until you attach it.</p><div id="klr-hint"></div></div>`, i.querySelector("#klr-cancel").onclick = () => f(null), i.querySelector("#klr-start").onclick = () => {
        const R = i.querySelector("#klr-cam").checked, I = i.querySelector("#klr-mic").checked;
        A(R, I);
      };
    }, A = async (x, R) => {
      var F;
      let I = null;
      try {
        p = await Ey({
          wantCamera: x,
          wantMic: R,
          caps: e.caps,
          onFallback: (z) => {
            I = z;
          },
          onStats: ({ elapsedMs: z, bytes: Q }) => {
            const B = i.querySelector("#klr-timer");
            B && (B.textContent = "REC " + y(z));
            const N = i.querySelector("#klr-meta");
            N && (N.innerHTML = `${y(Math.max(0, k.maxDurationMs - z))} left<br>~${C(Q)}`);
          }
        }, t);
      } catch {
        f(null);
        return;
      }
      S(I);
      try {
        const z = Ry((F = p == null ? void 0 : p.cameraStream) == null ? void 0 : F.call(p));
        z && n.appendChild(z);
      } catch {
      }
      p.done.then(async (z) => {
        f(await My(z));
      });
    }, S = (x) => {
      const R = x === "camera-blocked", F = R ? '<div style="padding:0 14px 10px;font-size:11px;color:#574f45">Camera blocked by this site — recording <b>screen + mic narration</b>.</div>' : !!x && !R ? '<div style="padding:0 14px 10px;font-size:11px;color:#574f45">Camera/mic blocked — recording <b>screen only</b>. Narrate by typing, or use the extension.</div>' : "";
      o("bar"), c("recording"), a = !1, i.removeAttribute("role"), i.removeAttribute("aria-modal"), i.removeAttribute("aria-label"), i.innerHTML = '<div style="display:flex;flex-direction:column;gap:9px;padding:12px 14px;min-width:180px"><span style="display:inline-flex;align-items:center;gap:7px;font-weight:700;white-space:nowrap"><span aria-hidden="true" style="width:10px;height:10px;border-radius:50%;background:#e11;flex:none"></span><span id="klr-timer">REC 0:00</span></span><button id="klr-stop" aria-label="Stop recording" title="Stop recording" style="display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:12px 16px;border-radius:10px;border:1px solid #dc2626;background:#dc2626;color:#fff;font-weight:700;font-size:15px;cursor:pointer"><span aria-hidden="true" style="width:12px;height:12px;border-radius:2px;background:#fff;flex:none"></span>Stop recording</button><button id="klr-pause" style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid #e3ddd1;background:#fffdf8;font-weight:600;cursor:pointer">Pause</button><span id="klr-meta" style="font-size:11px;color:#574f45;text-align:center;white-space:nowrap"></span></div>' + F;
      const z = i.querySelector("#klr-pause");
      z.onclick = () => {
        p && (p.state() === "recording" ? (p.pause(), z.textContent = "Resume") : (p.resume(), z.textContent = "Pause"));
      }, i.querySelector("#klr-stop").onclick = () => p == null ? void 0 : p.stop();
    };
    b();
  }) : null;
}
async function oc(e, t = {}) {
  const r = t.maxWidth ?? 2e3, n = t.quality ?? 0.82;
  if (e.startsWith("data:image/jpeg") || typeof document > "u" || !e.startsWith("data:image/")) return e;
  try {
    const i = await new Promise((m, f) => {
      const y = new Image();
      y.onload = () => m(y), y.onerror = f, y.src = e;
    }), s = i.naturalWidth, o = i.naturalHeight, c = 16e3;
    let l = s > r ? r / s : 1;
    o * l > c && (l = c / o);
    const p = Math.round(s * l), a = Math.round(o * l), h = document.createElement("canvas");
    h.width = p, h.height = a;
    const d = h.getContext("2d");
    if (!d) return e;
    d.fillStyle = "#fff", d.fillRect(0, 0, p, a), d.drawImage(i, 0, 0, p, a);
    const u = h.toDataURL("image/jpeg", n);
    return u.length < e.length ? u : e;
  } catch {
    return e;
  }
}
async function Ay(e, t = {}) {
  const r = t.maxWidth ?? 320, n = t.quality ?? 0.6;
  if (typeof document > "u" || !e.startsWith("data:image/")) return e;
  try {
    const i = await new Promise((u, m) => {
      const f = new Image();
      f.onload = () => u(f), f.onerror = m, f.src = e;
    }), s = i.naturalWidth, o = i.naturalHeight;
    if (!s || !o) return e;
    const c = s > r ? r / s : 1, l = Math.round(s * c), p = Math.round(o * c), a = document.createElement("canvas");
    a.width = l, a.height = p;
    const h = a.getContext("2d");
    if (!h) return e;
    h.fillStyle = "#fff", h.fillRect(0, 0, l, p), h.drawImage(i, 0, 0, l, p);
    const d = a.toDataURL("image/jpeg", n);
    return d.length < e.length ? d : e;
  } catch {
    return e;
  }
}
var Ly = Object.defineProperty, _y = (e, t, r) => t in e ? Ly(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, j = (e, t, r) => _y(e, typeof t != "symbol" ? t + "" : t, r), ac, Iy = Object.defineProperty, Oy = (e, t, r) => t in e ? Iy(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, lc = (e, t, r) => Oy(e, typeof t != "symbol" ? t + "" : t, r), nt = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(nt || {});
const cc = {
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
}, uc = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, wi = {}, vd = {}, Ny = () => !!globalThis.Zone;
function ba(e) {
  if (wi[e])
    return wi[e];
  const t = globalThis[e], r = t.prototype, n = e in cc ? cc[e] : void 0, i = !!(n && // @ts-expect-error 2345
  n.every(
    (c) => {
      var l, p;
      return !!((p = (l = Object.getOwnPropertyDescriptor(r, c)) == null ? void 0 : l.get) != null && p.toString().includes("[native code]"));
    }
  )), s = e in uc ? uc[e] : void 0, o = !!(s && s.every(
    // @ts-expect-error 2345
    (c) => {
      var l;
      return typeof r[c] == "function" && ((l = r[c]) == null ? void 0 : l.toString().includes("[native code]"));
    }
  ));
  if (i && o && !Ny())
    return wi[e] = t.prototype, t.prototype;
  try {
    const c = document.createElement("iframe");
    c.style.display = "none", document.body.appendChild(c);
    const l = c.contentWindow;
    if (!l) return t.prototype;
    const p = l[e].prototype;
    if (!p)
      return c.remove(), r;
    const a = navigator.userAgent;
    return a.includes("Safari") && !a.includes("Chrome") ? (c.classList.add("rr-block"), c.setAttribute("__rrwebUntaintedMutationObserver", ""), vd[e] = () => c.remove()) : c.remove(), wi[e] = p;
  } catch {
    return r;
  }
}
const Ws = {};
function br(e, t, r) {
  var n;
  const i = `${e}.${String(r)}`;
  if (Ws[i])
    return Ws[i].call(
      t
    );
  const s = ba(e), o = (n = Object.getOwnPropertyDescriptor(
    s,
    r
  )) == null ? void 0 : n.get;
  return o ? (Ws[i] = o, o.call(t)) : t[r];
}
const js = {};
function xd(e, t, r) {
  const n = `${e}.${String(r)}`;
  if (js[n])
    return js[n].bind(
      t
    );
  const s = ba(e)[r];
  return typeof s != "function" ? t[r] : (js[n] = s, s.bind(t));
}
function Py(e) {
  return br("Node", e, "ownerDocument");
}
function zy(e) {
  return br("Node", e, "childNodes");
}
function $y(e) {
  return br("Node", e, "parentNode");
}
function Dy(e) {
  return br("Node", e, "parentElement");
}
function Fy(e) {
  return br("Node", e, "textContent");
}
function Uy(e, t) {
  return xd("Node", e, "contains")(t);
}
function By(e) {
  return xd("Node", e, "getRootNode")();
}
function qy(e) {
  return !e || !("host" in e) ? null : br("ShadowRoot", e, "host");
}
function Wy(e) {
  return e.styleSheets;
}
function jy(e) {
  return !e || !("shadowRoot" in e) ? null : br("Element", e, "shadowRoot");
}
function Hy(e, t) {
  return br("Element", e, "querySelector")(t);
}
function Yy(e, t) {
  return br("Element", e, "querySelectorAll")(t);
}
function Vy() {
  return [
    ba("MutationObserver").constructor,
    vd.MutationObserver ?? (() => {
    })
  ];
}
let wd = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (wd = () => (/* @__PURE__ */ new Date()).getTime());
function Gy(e, t, r) {
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
  ownerDocument: Py,
  childNodes: zy,
  parentNode: $y,
  parentElement: Dy,
  textContent: Fy,
  contains: Uy,
  getRootNode: By,
  host: qy,
  styleSheets: Wy,
  shadowRoot: jy,
  querySelector: Hy,
  querySelectorAll: Yy,
  nowTimestamp: wd,
  mutationObserverCtor: Vy,
  patch: Gy
};
function Sd(e) {
  return e.nodeType === e.ELEMENT_NODE;
}
function Yn(e) {
  const t = (
    // anchor and textarea elements also have a `host` property
    // but only shadow roots have a `mode` property
    e && "host" in e && "mode" in e && mt.host(e) || null
  );
  return !!(t && "shadowRoot" in t && mt.shadowRoot(t) === e);
}
function Vn(e) {
  return Object.prototype.toString.call(e) === "[object ShadowRoot]";
}
function Ky(e) {
  return e.includes(" background-clip: text;") && !e.includes(" -webkit-background-clip: text;") && (e = e.replace(
    /\sbackground-clip:\s*text;/g,
    " -webkit-background-clip: text; background-clip: text;"
  )), e;
}
function Xy(e) {
  const { cssText: t } = e;
  if (t.split('"').length < 3) return t;
  const r = ["@import", `url(${JSON.stringify(e.href)})`];
  return e.layerName === "" ? r.push("layer") : e.layerName && r.push(`layer(${e.layerName})`), e.supportsText && r.push(`supports(${e.supportsText})`), e.media.length && r.push(e.media.mediaText), r.join(" ") + ";";
}
function sa(e) {
  try {
    const t = e.rules || e.cssRules;
    if (!t)
      return null;
    let r = e.href;
    !r && e.ownerNode && (r = e.ownerNode.baseURI);
    const n = Array.from(
      t,
      (i) => Ed(i, r)
    ).join("");
    return Ky(n);
  } catch {
    return null;
  }
}
function Ed(e, t) {
  if (Zy(e)) {
    let r;
    try {
      r = // for same-origin stylesheets,
      // we can access the imported stylesheet rules directly
      sa(e.styleSheet) || // work around browser issues with the raw string `@import url(...)` statement
      Xy(e);
    } catch {
      r = e.cssText;
    }
    return e.styleSheet.href ? ji(r, e.styleSheet.href) : r;
  } else {
    let r = e.cssText;
    return Qy(e) && e.selectorText.includes(":") && (r = Jy(r)), t ? ji(r, t) : r;
  }
}
function Jy(e) {
  const t = /(\[(?:[\w-]+)[^\\])(:(?:[\w-]+)\])/gm;
  return e.replace(t, "$1\\$2");
}
function Zy(e) {
  return "styleSheet" in e;
}
function Qy(e) {
  return "selectorText" in e;
}
class Cd {
  constructor() {
    lc(this, "idNodeMap", /* @__PURE__ */ new Map()), lc(this, "nodeMetaMap", /* @__PURE__ */ new WeakMap());
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
function eb() {
  return new Cd();
}
function qi({
  element: e,
  maskInputOptions: t,
  tagName: r,
  type: n,
  value: i,
  maskInputFn: s
}) {
  let o = i || "";
  const c = n && Qr(n);
  return (t[r.toLowerCase()] || c && t[c]) && (s ? o = s(o, e) : o = "*".repeat(o.length)), o;
}
function Qr(e) {
  return e.toLowerCase();
}
const dc = "__rrweb_original__";
function tb(e) {
  const t = e.getContext("2d");
  if (!t) return !0;
  const r = 50;
  for (let n = 0; n < e.width; n += r)
    for (let i = 0; i < e.height; i += r) {
      const s = t.getImageData, o = dc in s ? s[dc] : s;
      if (new Uint32Array(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        o.call(
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
function Wi(e) {
  const t = e.type;
  return e.hasAttribute("data-rr-is-password") ? "password" : t ? (
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    Qr(t)
  ) : null;
}
function Md(e, t) {
  let r;
  try {
    r = new URL(e, t ?? window.location.href);
  } catch {
    return null;
  }
  const n = /\.([0-9a-z]+)(?:$)/i, i = r.pathname.match(n);
  return (i == null ? void 0 : i[1]) ?? null;
}
function rb(e) {
  let t = "";
  return e.indexOf("//") > -1 ? t = e.split("/").slice(0, 3).join("/") : t = e.split("/")[0], t = t.split("?")[0], t;
}
const nb = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm, ib = /^(?:[a-z+]+:)?\/\//i, sb = /^www\..*/i, ob = /^(data:)([^,]*),(.*)/i;
function ji(e, t) {
  return (e || "").replace(
    nb,
    (r, n, i, s, o, c) => {
      const l = i || o || c, p = n || s || "";
      if (!l)
        return r;
      if (ib.test(l) || sb.test(l))
        return `url(${p}${l}${p})`;
      if (ob.test(l))
        return `url(${p}${l}${p})`;
      if (l[0] === "/")
        return `url(${p}${rb(t) + l}${p})`;
      const a = t.split("/"), h = l.split("/");
      a.pop();
      for (const d of h)
        d !== "." && (d === ".." ? a.pop() : a.push(d));
      return `url(${p}${a.join("/")}${p})`;
    }
  );
}
function Si(e, t = !1) {
  return t ? e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "") : e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "").replace(/0px/g, "0");
}
function ab(e, t, r = !1) {
  const n = Array.from(t.childNodes), i = [];
  let s = 0;
  if (n.length > 1 && e && typeof e == "string") {
    let o = Si(e, r);
    const c = o.length / e.length;
    for (let l = 1; l < n.length; l++)
      if (n[l].textContent && typeof n[l].textContent == "string") {
        const p = Si(
          n[l].textContent,
          r
        ), a = 100;
        let h = 3;
        for (; h < p.length && // keep consuming css identifiers (to get a decent chunk more quickly)
        (p[h].match(/[a-zA-Z0-9]/) || // substring needs to be unique to this section
        p.indexOf(p.substring(0, h), 1) !== -1); h++)
          ;
        for (; h < p.length; h++) {
          let d = p.substring(0, h), u = o.split(d), m = -1;
          if (u.length === 2)
            m = u[0].length;
          else if (u.length > 2 && u[0] === "" && n[l - 1].textContent !== "")
            m = o.indexOf(d, 1);
          else if (u.length === 1) {
            if (d = d.substring(
              0,
              d.length - 1
            ), u = o.split(d), u.length <= 1)
              return i.push(e), i;
            h = a + 1;
          } else h === p.length - 1 && (m = o.indexOf(d));
          if (u.length >= 2 && h > a) {
            const f = n[l - 1].textContent;
            if (f && typeof f == "string") {
              const y = Si(f).length;
              m = o.indexOf(d, y);
            }
            m === -1 && (m = u[0].length);
          }
          if (m !== -1) {
            let f = Math.floor(m / c);
            for (; f > 0 && f < e.length; ) {
              if (s += 1, s > 50 * n.length)
                return i.push(e), i;
              const y = Si(
                e.substring(0, f),
                r
              );
              if (y.length === m) {
                i.push(e.substring(0, f)), e = e.substring(f), o = o.substring(m);
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
function lb(e, t) {
  return ab(e, t).join("/* rr_split */");
}
let cb = 1;
const ub = new RegExp("[^a-z0-9-_:]"), Zn = -2;
function Rd() {
  return cb++;
}
function db(e) {
  if (e instanceof HTMLFormElement)
    return "form";
  const t = Qr(e.tagName);
  return ub.test(t) ? "div" : t;
}
let yn, pc;
const pb = /^[^ \t\n\r\u000c]+/, hb = /^[, \t\n\r\u000c]+/;
function fb(e, t) {
  if (t.trim() === "")
    return t;
  let r = 0;
  function n(s) {
    let o;
    const c = s.exec(t.substring(r));
    return c ? (o = c[0], r += o.length, o) : "";
  }
  const i = [];
  for (; n(hb), !(r >= t.length); ) {
    let s = n(pb);
    if (s.slice(-1) === ",")
      s = wn(e, s.substring(0, s.length - 1)), i.push(s);
    else {
      let o = "";
      s = wn(e, s);
      let c = !1;
      for (; ; ) {
        const l = t.charAt(r);
        if (l === "") {
          i.push((s + o).trim());
          break;
        } else if (c)
          l === ")" && (c = !1);
        else if (l === ",") {
          r += 1, i.push((s + o).trim());
          break;
        } else l === "(" && (c = !0);
        o += l, r += 1;
      }
    }
  }
  return i.join(", ");
}
const hc = /* @__PURE__ */ new WeakMap();
function wn(e, t) {
  return !t || t.trim() === "" ? t : ka(e, t);
}
function mb(e) {
  return !!(e.tagName === "svg" || e.ownerSVGElement);
}
function ka(e, t) {
  let r = hc.get(e);
  if (r || (r = e.createElement("a"), hc.set(e, r)), !t)
    t = "";
  else if (t.startsWith("blob:") || t.startsWith("data:"))
    return t;
  return r.setAttribute("href", t), r.href;
}
function Td(e, t, r, n) {
  return n && (r === "src" || r === "href" && !(t === "use" && n[0] === "#") || r === "xlink:href" && n[0] !== "#" || r === "background" && ["table", "td", "th"].includes(t) ? wn(e, n) : r === "srcset" ? fb(e, n) : r === "style" ? ji(n, ka(e)) : t === "object" && r === "data" ? wn(e, n) : n);
}
function Ad(e, t, r) {
  return ["video", "audio"].includes(e) && t === "autoplay";
}
function gb(e, t, r) {
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
function Hi(e, t, r) {
  if (!e) return !1;
  if (e.nodeType !== e.ELEMENT_NODE)
    return r ? Hi(mt.parentNode(e), t, r) : !1;
  for (let n = e.classList.length; n--; ) {
    const i = e.classList[n];
    if (t.test(i))
      return !0;
  }
  return r ? Hi(mt.parentNode(e), t, r) : !1;
}
function Ld(e, t, r, n) {
  let i;
  if (Sd(e)) {
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
    } else if (Hi(i, t, n)) return !0;
    if (r) {
      if (n) {
        if (i.closest(r)) return !0;
      } else if (i.matches(r)) return !0;
    }
  } catch {
  }
  return !1;
}
function yb(e, t, r) {
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
  const o = "about:blank";
  if (n.location.href !== o || e.src === o || e.src === "")
    return setTimeout(t, 0), e.addEventListener("load", t);
  e.addEventListener("load", t);
}
function bb(e, t, r) {
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
function kb(e, t) {
  const {
    doc: r,
    mirror: n,
    blockClass: i,
    blockSelector: s,
    needsMask: o,
    inlineStylesheet: c,
    maskInputOptions: l = {},
    maskTextFn: p,
    maskInputFn: a,
    dataURLOptions: h = {},
    inlineImages: d,
    recordCanvas: u,
    keepIframeSrcFn: m,
    newlyAddedElement: f = !1,
    cssCaptured: y = !1
  } = t, C = vb(r, n);
  switch (e.nodeType) {
    case e.DOCUMENT_NODE:
      return e.compatMode !== "CSS1Compat" ? {
        type: nt.Document,
        childNodes: [],
        compatMode: e.compatMode
        // probably "BackCompat"
      } : {
        type: nt.Document,
        childNodes: []
      };
    case e.DOCUMENT_TYPE_NODE:
      return {
        type: nt.DocumentType,
        name: e.name,
        publicId: e.publicId,
        systemId: e.systemId,
        rootId: C
      };
    case e.ELEMENT_NODE:
      return wb(e, {
        doc: r,
        blockClass: i,
        blockSelector: s,
        inlineStylesheet: c,
        maskInputOptions: l,
        maskInputFn: a,
        dataURLOptions: h,
        inlineImages: d,
        recordCanvas: u,
        keepIframeSrcFn: m,
        newlyAddedElement: f,
        rootId: C
      });
    case e.TEXT_NODE:
      return xb(e, {
        doc: r,
        needsMask: o,
        maskTextFn: p,
        rootId: C,
        cssCaptured: y
      });
    case e.CDATA_SECTION_NODE:
      return {
        type: nt.CDATA,
        textContent: "",
        rootId: C
      };
    case e.COMMENT_NODE:
      return {
        type: nt.Comment,
        textContent: mt.textContent(e) || "",
        rootId: C
      };
    default:
      return !1;
  }
}
function vb(e, t) {
  if (!t.hasNode(e)) return;
  const r = t.getId(e);
  return r === 1 ? void 0 : r;
}
function xb(e, t) {
  const { needsMask: r, maskTextFn: n, rootId: i, cssCaptured: s } = t, o = mt.parentNode(e), c = o && o.tagName;
  let l = "";
  const p = c === "STYLE" ? !0 : void 0, a = c === "SCRIPT" ? !0 : void 0;
  return a ? l = "SCRIPT_PLACEHOLDER" : s || (l = mt.textContent(e), p && l && (l = ji(l, ka(t.doc)))), !p && !a && l && r && (l = n ? n(l, mt.parentElement(e)) : l.replace(/[\S]/g, "*")), {
    type: nt.Text,
    textContent: l || "",
    rootId: i
  };
}
function wb(e, t) {
  const {
    doc: r,
    blockClass: n,
    blockSelector: i,
    inlineStylesheet: s,
    maskInputOptions: o = {},
    maskInputFn: c,
    dataURLOptions: l = {},
    inlineImages: p,
    recordCanvas: a,
    keepIframeSrcFn: h,
    newlyAddedElement: d = !1,
    rootId: u
  } = t, m = gb(e, n, i), f = db(e);
  let y = {};
  const C = e.attributes.length;
  for (let b = 0; b < C; b++) {
    const A = e.attributes[b];
    Ad(f, A.name, A.value) || (y[A.name] = Td(
      r,
      f,
      Qr(A.name),
      A.value
    ));
  }
  if (f === "link" && s) {
    const b = Array.from(r.styleSheets).find((S) => S.href === e.href);
    let A = null;
    b && (A = sa(b)), A && (delete y.rel, delete y.href, y._cssText = A);
  }
  if (f === "style" && e.sheet) {
    let b = sa(
      e.sheet
    );
    b && (e.childNodes.length > 1 && (b = lb(b, e)), y._cssText = b);
  }
  if (["input", "textarea", "select"].includes(f)) {
    const b = e.value, A = e.checked;
    y.type !== "radio" && y.type !== "checkbox" && y.type !== "submit" && y.type !== "button" && b ? y.value = qi({
      element: e,
      type: Wi(e),
      tagName: f,
      value: b,
      maskInputOptions: o,
      maskInputFn: c
    }) : A && (y.checked = A);
  }
  if (f === "option" && (e.selected && !o.select ? y.selected = !0 : delete y.selected), f === "dialog" && e.open && (y.rr_open_mode = e.matches("dialog:modal") ? "modal" : "non-modal"), f === "canvas" && a) {
    if (e.__context === "2d")
      tb(e) || (y.rr_dataURL = e.toDataURL(
        l.type,
        l.quality
      ));
    else if (!("__context" in e)) {
      const b = e.toDataURL(
        l.type,
        l.quality
      ), A = r.createElement("canvas");
      A.width = e.width, A.height = e.height;
      const S = A.toDataURL(
        l.type,
        l.quality
      );
      b !== S && (y.rr_dataURL = b);
    }
  }
  if (f === "img" && p) {
    yn || (yn = r.createElement("canvas"), pc = yn.getContext("2d"));
    const b = e, A = b.currentSrc || b.getAttribute("src") || "<unknown-src>", S = b.crossOrigin, x = () => {
      b.removeEventListener("load", x);
      try {
        yn.width = b.naturalWidth, yn.height = b.naturalHeight, pc.drawImage(b, 0, 0), y.rr_dataURL = yn.toDataURL(
          l.type,
          l.quality
        );
      } catch (R) {
        if (b.crossOrigin !== "anonymous") {
          b.crossOrigin = "anonymous", b.complete && b.naturalWidth !== 0 ? x() : b.addEventListener("load", x);
          return;
        } else
          console.warn(
            `Cannot inline img src=${A}! Error: ${R}`
          );
      }
      b.crossOrigin === "anonymous" && (S ? y.crossOrigin = S : b.removeAttribute("crossorigin"));
    };
    b.complete && b.naturalWidth !== 0 ? x() : b.addEventListener("load", x);
  }
  if (["audio", "video"].includes(f)) {
    const b = y;
    b.rr_mediaState = e.paused ? "paused" : "played", b.rr_mediaCurrentTime = e.currentTime, b.rr_mediaPlaybackRate = e.playbackRate, b.rr_mediaMuted = e.muted, b.rr_mediaLoop = e.loop, b.rr_mediaVolume = e.volume;
  }
  if (d || (e.scrollLeft && (y.rr_scrollLeft = e.scrollLeft), e.scrollTop && (y.rr_scrollTop = e.scrollTop)), m) {
    const { width: b, height: A } = e.getBoundingClientRect();
    y = {
      class: y.class,
      rr_width: `${b}px`,
      rr_height: `${A}px`
    };
  }
  f === "iframe" && !h(y.src) && (e.contentDocument || (y.rr_src = y.src), delete y.src);
  let k;
  try {
    customElements.get(f) && (k = !0);
  } catch {
  }
  return {
    type: nt.Element,
    tagName: f,
    attributes: y,
    childNodes: [],
    isSVG: mb(e) || void 0,
    needBlock: m,
    rootId: u,
    isCustom: k
  };
}
function We(e) {
  return e == null ? "" : e.toLowerCase();
}
function _d(e) {
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
function Sb(e, t) {
  if (t.comment && e.type === nt.Comment)
    return !0;
  if (e.type === nt.Element) {
    if (t.script && // script tag
    (e.tagName === "script" || // (module)preload link
    e.tagName === "link" && (e.attributes.rel === "preload" && e.attributes.as === "script" || e.attributes.rel === "modulepreload") || // prefetch link
    e.tagName === "link" && e.attributes.rel === "prefetch" && typeof e.attributes.href == "string" && Md(e.attributes.href) === "js"))
      return !0;
    if (t.headFavicon && (e.tagName === "link" && e.attributes.rel === "shortcut icon" || e.tagName === "meta" && (We(e.attributes.name).match(
      /^msapplication-tile(image|color)$/
    ) || We(e.attributes.name) === "application-name" || We(e.attributes.rel) === "icon" || We(e.attributes.rel) === "apple-touch-icon" || We(e.attributes.rel) === "shortcut icon")))
      return !0;
    if (e.tagName === "meta") {
      if (t.headMetaDescKeywords && We(e.attributes.name).match(/^description|keywords$/))
        return !0;
      if (t.headMetaSocial && (We(e.attributes.property).match(/^(og|twitter|fb):/) || // og = opengraph (facebook)
      We(e.attributes.name).match(/^(og|twitter):/) || We(e.attributes.name) === "pinterest"))
        return !0;
      if (t.headMetaRobots && (We(e.attributes.name) === "robots" || We(e.attributes.name) === "googlebot" || We(e.attributes.name) === "bingbot"))
        return !0;
      if (t.headMetaHttpEquiv && e.attributes["http-equiv"] !== void 0)
        return !0;
      if (t.headMetaAuthorship && (We(e.attributes.name) === "author" || We(e.attributes.name) === "generator" || We(e.attributes.name) === "framework" || We(e.attributes.name) === "publisher" || We(e.attributes.name) === "progid" || We(e.attributes.property).match(/^article:/) || We(e.attributes.property).match(/^product:/)))
        return !0;
      if (t.headMetaVerification && (We(e.attributes.name) === "google-site-verification" || We(e.attributes.name) === "yandex-verification" || We(e.attributes.name) === "csrf-token" || We(e.attributes.name) === "p:domain_verify" || We(e.attributes.name) === "verify-v1" || We(e.attributes.name) === "verification" || We(e.attributes.name) === "shopify-checkout-api-token"))
        return !0;
    }
  }
  return !1;
}
function Sn(e, t) {
  const {
    doc: r,
    mirror: n,
    blockClass: i,
    blockSelector: s,
    maskTextClass: o,
    maskTextSelector: c,
    skipChild: l = !1,
    inlineStylesheet: p = !0,
    maskInputOptions: a = {},
    maskTextFn: h,
    maskInputFn: d,
    slimDOMOptions: u,
    dataURLOptions: m = {},
    inlineImages: f = !1,
    recordCanvas: y = !1,
    onSerialize: C,
    onIframeLoad: k,
    iframeLoadTimeout: b = 5e3,
    onStylesheetLoad: A,
    stylesheetLoadTimeout: S = 5e3,
    keepIframeSrcFn: x = () => !1,
    newlyAddedElement: R = !1,
    cssCaptured: I = !1
  } = t;
  let { needsMask: F } = t, { preserveWhiteSpace: z = !0 } = t;
  F || (F = Ld(
    e,
    o,
    c,
    F === void 0
  ));
  const Q = kb(e, {
    doc: r,
    mirror: n,
    blockClass: i,
    blockSelector: s,
    needsMask: F,
    inlineStylesheet: p,
    maskInputOptions: a,
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
  let B;
  n.hasNode(e) ? B = n.getId(e) : Sb(Q, u) || !z && Q.type === nt.Text && !Q.textContent.replace(/^\s+|\s+$/gm, "").length ? B = Zn : B = Rd();
  const N = Object.assign(Q, { id: B });
  if (n.add(e, N), B === Zn)
    return null;
  C && C(e);
  let De = !l;
  if (N.type === nt.Element) {
    De = De && !N.needBlock, delete N.needBlock;
    const fe = mt.shadowRoot(e);
    fe && Vn(fe) && (N.isShadowHost = !0);
  }
  if ((N.type === nt.Document || N.type === nt.Element) && De) {
    u.headWhitespace && N.type === nt.Element && N.tagName === "head" && (z = !1);
    const fe = {
      doc: r,
      mirror: n,
      blockClass: i,
      blockSelector: s,
      needsMask: F,
      maskTextClass: o,
      maskTextSelector: c,
      skipChild: l,
      inlineStylesheet: p,
      maskInputOptions: a,
      maskTextFn: h,
      maskInputFn: d,
      slimDOMOptions: u,
      dataURLOptions: m,
      inlineImages: f,
      recordCanvas: y,
      preserveWhiteSpace: z,
      onSerialize: C,
      onIframeLoad: k,
      iframeLoadTimeout: b,
      onStylesheetLoad: A,
      stylesheetLoadTimeout: S,
      keepIframeSrcFn: x,
      cssCaptured: !1
    };
    if (!(N.type === nt.Element && N.tagName === "textarea" && N.attributes.value !== void 0)) {
      N.type === nt.Element && N.attributes._cssText !== void 0 && typeof N.attributes._cssText == "string" && (fe.cssCaptured = !0);
      for (const Re of Array.from(mt.childNodes(e))) {
        const Ue = Sn(Re, fe);
        Ue && N.childNodes.push(Ue);
      }
    }
    let pe = null;
    if (Sd(e) && (pe = mt.shadowRoot(e)))
      for (const Re of Array.from(mt.childNodes(pe))) {
        const Ue = Sn(Re, fe);
        Ue && (Vn(pe) && (Ue.isShadow = !0), N.childNodes.push(Ue));
      }
  }
  const Je = mt.parentNode(e);
  return Je && Yn(Je) && Vn(Je) && (N.isShadow = !0), N.type === nt.Element && N.tagName === "iframe" && yb(
    e,
    () => {
      const fe = e.contentDocument;
      if (fe && k) {
        const pe = Sn(fe, {
          doc: fe,
          mirror: n,
          blockClass: i,
          blockSelector: s,
          needsMask: F,
          maskTextClass: o,
          maskTextSelector: c,
          skipChild: !1,
          inlineStylesheet: p,
          maskInputOptions: a,
          maskTextFn: h,
          maskInputFn: d,
          slimDOMOptions: u,
          dataURLOptions: m,
          inlineImages: f,
          recordCanvas: y,
          preserveWhiteSpace: z,
          onSerialize: C,
          onIframeLoad: k,
          iframeLoadTimeout: b,
          onStylesheetLoad: A,
          stylesheetLoadTimeout: S,
          keepIframeSrcFn: x
        });
        pe && k(
          e,
          pe
        );
      }
    },
    b
  ), N.type === nt.Element && N.tagName === "link" && typeof N.attributes.rel == "string" && (N.attributes.rel === "stylesheet" || N.attributes.rel === "preload" && typeof N.attributes.href == "string" && Md(N.attributes.href) === "css") && bb(
    e,
    () => {
      if (A) {
        const fe = Sn(e, {
          doc: r,
          mirror: n,
          blockClass: i,
          blockSelector: s,
          needsMask: F,
          maskTextClass: o,
          maskTextSelector: c,
          skipChild: !1,
          inlineStylesheet: p,
          maskInputOptions: a,
          maskTextFn: h,
          maskInputFn: d,
          slimDOMOptions: u,
          dataURLOptions: m,
          inlineImages: f,
          recordCanvas: y,
          preserveWhiteSpace: z,
          onSerialize: C,
          onIframeLoad: k,
          iframeLoadTimeout: b,
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
  ), N;
}
function Eb(e, t) {
  const {
    mirror: r = new Cd(),
    blockClass: n = "rr-block",
    blockSelector: i = null,
    maskTextClass: s = "rr-mask",
    maskTextSelector: o = null,
    inlineStylesheet: c = !0,
    inlineImages: l = !1,
    recordCanvas: p = !1,
    maskAllInputs: a = !1,
    maskTextFn: h,
    maskInputFn: d,
    slimDOM: u = !1,
    dataURLOptions: m,
    preserveWhiteSpace: f,
    onSerialize: y,
    onIframeLoad: C,
    iframeLoadTimeout: k,
    onStylesheetLoad: b,
    stylesheetLoadTimeout: A,
    keepIframeSrcFn: S = () => !1
  } = t, x = a === !0 ? {
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
  } : a === !1 ? {
    password: !0
  } : a, R = _d(u);
  return Sn(e, {
    doc: e,
    mirror: r,
    blockClass: n,
    blockSelector: i,
    maskTextClass: s,
    maskTextSelector: o,
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
    onIframeLoad: C,
    iframeLoadTimeout: k,
    onStylesheetLoad: b,
    stylesheetLoadTimeout: A,
    keepIframeSrcFn: S,
    newlyAddedElement: !1
  });
}
function Cb(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function Mb(e) {
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
var Ei = { exports: {} }, fc;
function Rb() {
  if (fc) return Ei.exports;
  fc = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return Ei.exports = t(), Ei.exports.createColors = t, Ei.exports;
}
const Tb = {}, Ab = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Tb
}, Symbol.toStringTag, { value: "Module" })), Zt = /* @__PURE__ */ Mb(Ab);
var Hs, mc;
function va() {
  if (mc) return Hs;
  mc = 1;
  let e = /* @__PURE__ */ Rb(), t = Zt;
  class r extends Error {
    constructor(i, s, o, c, l, p) {
      super(i), this.name = "CssSyntaxError", this.reason = i, l && (this.file = l), c && (this.source = c), p && (this.plugin = p), typeof s < "u" && typeof o < "u" && (typeof s == "number" ? (this.line = s, this.column = o) : (this.line = s.line, this.column = s.column, this.endLine = o.line, this.endColumn = o.column)), this.setMessage(), Error.captureStackTrace && Error.captureStackTrace(this, r);
    }
    setMessage() {
      this.message = this.plugin ? this.plugin + ": " : "", this.message += this.file ? this.file : "<css input>", typeof this.line < "u" && (this.message += ":" + this.line + ":" + this.column), this.message += ": " + this.reason;
    }
    showSourceCode(i) {
      if (!this.source) return "";
      let s = this.source;
      i == null && (i = e.isColorSupported), t && i && (s = t(s));
      let o = s.split(/\r?\n/), c = Math.max(this.line - 3, 0), l = Math.min(this.line + 2, o.length), p = String(l).length, a, h;
      if (i) {
        let { bold: d, gray: u, red: m } = e.createColors(!0);
        a = (f) => d(m(f)), h = (f) => u(f);
      } else
        a = h = (d) => d;
      return o.slice(c, l).map((d, u) => {
        let m = c + 1 + u, f = " " + (" " + m).slice(-p) + " | ";
        if (m === this.line) {
          let y = h(f.replace(/\d/g, " ")) + d.slice(0, this.column - 1).replace(/[^\t]/g, " ");
          return a(">") + h(f) + d + `
 ` + y + a("^");
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
  return Hs = r, r.default = r, Hs;
}
var Ci = {}, gc;
function xa() {
  return gc || (gc = 1, Ci.isClean = Symbol("isClean"), Ci.my = Symbol("my")), Ci;
}
var Ys, yc;
function Id() {
  if (yc) return Ys;
  yc = 1;
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
      let o = "@" + i.name, c = i.params ? this.rawValue(i, "params") : "";
      if (typeof i.raws.afterName < "u" ? o += i.raws.afterName : c && (o += " "), i.nodes)
        this.block(i, o + c);
      else {
        let l = (i.raws.between || "") + (s ? ";" : "");
        this.builder(o + c + l, i);
      }
    }
    beforeAfter(i, s) {
      let o;
      i.type === "decl" ? o = this.raw(i, null, "beforeDecl") : i.type === "comment" ? o = this.raw(i, null, "beforeComment") : s === "before" ? o = this.raw(i, null, "beforeRule") : o = this.raw(i, null, "beforeClose");
      let c = i.parent, l = 0;
      for (; c && c.type !== "root"; )
        l += 1, c = c.parent;
      if (o.includes(`
`)) {
        let p = this.raw(i, null, "indent");
        if (p.length)
          for (let a = 0; a < l; a++) o += p;
      }
      return o;
    }
    block(i, s) {
      let o = this.raw(i, "between", "beforeOpen");
      this.builder(s + o + "{", i, "start");
      let c;
      i.nodes && i.nodes.length ? (this.body(i), c = this.raw(i, "after")) : c = this.raw(i, "after", "emptyBody"), c && this.builder(c), this.builder("}", i, "end");
    }
    body(i) {
      let s = i.nodes.length - 1;
      for (; s > 0 && i.nodes[s].type === "comment"; )
        s -= 1;
      let o = this.raw(i, "semicolon");
      for (let c = 0; c < i.nodes.length; c++) {
        let l = i.nodes[c], p = this.raw(l, "before");
        p && this.builder(p), this.stringify(l, s !== c || o);
      }
    }
    comment(i) {
      let s = this.raw(i, "left", "commentLeft"), o = this.raw(i, "right", "commentRight");
      this.builder("/*" + s + i.text + o + "*/", i);
    }
    decl(i, s) {
      let o = this.raw(i, "between", "colon"), c = i.prop + o + this.rawValue(i, "value");
      i.important && (c += i.raws.important || " !important"), s && (c += ";"), this.builder(c, i);
    }
    document(i) {
      this.body(i);
    }
    raw(i, s, o) {
      let c;
      if (o || (o = s), s && (c = i.raws[s], typeof c < "u"))
        return c;
      let l = i.parent;
      if (o === "before" && (!l || l.type === "root" && l.first === i || l && l.type === "document"))
        return "";
      if (!l) return e[o];
      let p = i.root();
      if (p.rawCache || (p.rawCache = {}), typeof p.rawCache[o] < "u")
        return p.rawCache[o];
      if (o === "before" || o === "after")
        return this.beforeAfter(i, o);
      {
        let a = "raw" + t(o);
        this[a] ? c = this[a](p, i) : p.walk((h) => {
          if (c = h.raws[s], typeof c < "u") return !1;
        });
      }
      return typeof c > "u" && (c = e[o]), p.rawCache[o] = c, c;
    }
    rawBeforeClose(i) {
      let s;
      return i.walk((o) => {
        if (o.nodes && o.nodes.length > 0 && typeof o.raws.after < "u")
          return s = o.raws.after, s.includes(`
`) && (s = s.replace(/[^\n]+$/, "")), !1;
      }), s && (s = s.replace(/\S/g, "")), s;
    }
    rawBeforeComment(i, s) {
      let o;
      return i.walkComments((c) => {
        if (typeof c.raws.before < "u")
          return o = c.raws.before, o.includes(`
`) && (o = o.replace(/[^\n]+$/, "")), !1;
      }), typeof o > "u" ? o = this.raw(s, null, "beforeDecl") : o && (o = o.replace(/\S/g, "")), o;
    }
    rawBeforeDecl(i, s) {
      let o;
      return i.walkDecls((c) => {
        if (typeof c.raws.before < "u")
          return o = c.raws.before, o.includes(`
`) && (o = o.replace(/[^\n]+$/, "")), !1;
      }), typeof o > "u" ? o = this.raw(s, null, "beforeRule") : o && (o = o.replace(/\S/g, "")), o;
    }
    rawBeforeOpen(i) {
      let s;
      return i.walk((o) => {
        if (o.type !== "decl" && (s = o.raws.between, typeof s < "u"))
          return !1;
      }), s;
    }
    rawBeforeRule(i) {
      let s;
      return i.walk((o) => {
        if (o.nodes && (o.parent !== i || i.first !== o) && typeof o.raws.before < "u")
          return s = o.raws.before, s.includes(`
`) && (s = s.replace(/[^\n]+$/, "")), !1;
      }), s && (s = s.replace(/\S/g, "")), s;
    }
    rawColon(i) {
      let s;
      return i.walkDecls((o) => {
        if (typeof o.raws.between < "u")
          return s = o.raws.between.replace(/[^\s:]/g, ""), !1;
      }), s;
    }
    rawEmptyBody(i) {
      let s;
      return i.walk((o) => {
        if (o.nodes && o.nodes.length === 0 && (s = o.raws.after, typeof s < "u"))
          return !1;
      }), s;
    }
    rawIndent(i) {
      if (i.raws.indent) return i.raws.indent;
      let s;
      return i.walk((o) => {
        let c = o.parent;
        if (c && c !== i && c.parent && c.parent === i && typeof o.raws.before < "u") {
          let l = o.raws.before.split(`
`);
          return s = l[l.length - 1], s = s.replace(/\S/g, ""), !1;
        }
      }), s;
    }
    rawSemicolon(i) {
      let s;
      return i.walk((o) => {
        if (o.nodes && o.nodes.length && o.last.type === "decl" && (s = o.raws.semicolon, typeof s < "u"))
          return !1;
      }), s;
    }
    rawValue(i, s) {
      let o = i[s], c = i.raws[s];
      return c && c.value === o ? c.raw : o;
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
  return Ys = r, r.default = r, Ys;
}
var Vs, bc;
function es() {
  if (bc) return Vs;
  bc = 1;
  let e = Id();
  function t(r, n) {
    new e(n).stringify(r);
  }
  return Vs = t, t.default = t, Vs;
}
var Gs, kc;
function ts() {
  if (kc) return Gs;
  kc = 1;
  let { isClean: e, my: t } = xa(), r = va(), n = Id(), i = es();
  function s(c, l) {
    let p = new c.constructor();
    for (let a in c) {
      if (!Object.prototype.hasOwnProperty.call(c, a) || a === "proxyCache") continue;
      let h = c[a], d = typeof h;
      a === "parent" && d === "object" ? l && (p[a] = l) : a === "source" ? p[a] = h : Array.isArray(h) ? p[a] = h.map((u) => s(u, p)) : (d === "object" && h !== null && (h = s(h)), p[a] = h);
    }
    return p;
  }
  class o {
    constructor(l = {}) {
      this.raws = {}, this[e] = !1, this[t] = !0;
      for (let p in l)
        if (p === "nodes") {
          this.nodes = [];
          for (let a of l[p])
            typeof a.clone == "function" ? this.append(a.clone()) : this.append(a);
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
      for (let a in l)
        p[a] = l[a];
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
        let { end: a, start: h } = this.rangeBy(p);
        return this.source.input.error(
          l,
          { column: h.column, line: h.line },
          { column: a.column, line: a.line },
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
        set(l, p, a) {
          return l[p] === a || (l[p] = a, (p === "prop" || p === "value" || p === "name" || p === "params" || p === "important" || /* c8 ignore next */
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
      let a = this.source.start;
      if (l.index)
        a = this.positionInside(l.index, p);
      else if (l.word) {
        p = this.toString();
        let h = p.indexOf(l.word);
        h !== -1 && (a = this.positionInside(h, p));
      }
      return a;
    }
    positionInside(l, p) {
      let a = p || this.toString(), h = this.source.start.column, d = this.source.start.line;
      for (let u = 0; u < l; u++)
        a[u] === `
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
      }, a = this.source.end ? {
        column: this.source.end.column + 1,
        line: this.source.end.line
      } : {
        column: p.column + 1,
        line: p.line
      };
      if (l.word) {
        let h = this.toString(), d = h.indexOf(l.word);
        d !== -1 && (p = this.positionInside(d, h), a = this.positionInside(d + l.word.length, h));
      } else
        l.start ? p = {
          column: l.start.column,
          line: l.start.line
        } : l.index && (p = this.positionInside(l.index)), l.end ? a = {
          column: l.end.column,
          line: l.end.line
        } : typeof l.endIndex == "number" ? a = this.positionInside(l.endIndex) : l.index && (a = this.positionInside(l.index + 1));
      return (a.line < p.line || a.line === p.line && a.column <= p.column) && (a = { column: p.column + 1, line: p.line }), { end: a, start: p };
    }
    raw(l, p) {
      return new n().raw(this, l, p);
    }
    remove() {
      return this.parent && this.parent.removeChild(this), this.parent = void 0, this;
    }
    replaceWith(...l) {
      if (this.parent) {
        let p = this, a = !1;
        for (let h of l)
          h === this ? a = !0 : a ? (this.parent.insertAfter(p, h), p = h) : this.parent.insertBefore(p, h);
        a || this.remove();
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
      let a = {}, h = p == null;
      p = p || /* @__PURE__ */ new Map();
      let d = 0;
      for (let u in this) {
        if (!Object.prototype.hasOwnProperty.call(this, u) || u === "parent" || u === "proxyCache") continue;
        let m = this[u];
        if (Array.isArray(m))
          a[u] = m.map((f) => typeof f == "object" && f.toJSON ? f.toJSON(null, p) : f);
        else if (typeof m == "object" && m.toJSON)
          a[u] = m.toJSON(null, p);
        else if (u === "source") {
          let f = p.get(m.input);
          f == null && (f = d, p.set(m.input, d), d++), a[u] = {
            end: m.end,
            inputId: f,
            start: m.start
          };
        } else
          a[u] = m;
      }
      return h && (a.inputs = [...p.keys()].map((u) => u.toJSON())), a;
    }
    toProxy() {
      return this.proxyCache || (this.proxyCache = new Proxy(this, this.getProxyProcessor())), this.proxyCache;
    }
    toString(l = i) {
      l.stringify && (l = l.stringify);
      let p = "";
      return l(this, (a) => {
        p += a;
      }), p;
    }
    warn(l, p, a) {
      let h = { node: this };
      for (let d in a) h[d] = a[d];
      return l.warn(p, h);
    }
    get proxyOf() {
      return this;
    }
  }
  return Gs = o, o.default = o, Gs;
}
var Ks, vc;
function rs() {
  if (vc) return Ks;
  vc = 1;
  let e = ts();
  class t extends e {
    constructor(n) {
      n && typeof n.value < "u" && typeof n.value != "string" && (n = { ...n, value: String(n.value) }), super(n), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return Ks = t, t.default = t, Ks;
}
var Xs, xc;
function Lb() {
  if (xc) return Xs;
  xc = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return Xs = { nanoid: (n = 21) => {
    let i = "", s = n;
    for (; s--; )
      i += e[Math.random() * 64 | 0];
    return i;
  }, customAlphabet: (n, i = 21) => (s = i) => {
    let o = "", c = s;
    for (; c--; )
      o += n[Math.random() * n.length | 0];
    return o;
  } }, Xs;
}
var Js, wc;
function Od() {
  if (wc) return Js;
  wc = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Zt, { existsSync: r, readFileSync: n } = Zt, { dirname: i, join: s } = Zt;
  function o(l) {
    return Buffer ? Buffer.from(l, "base64").toString() : window.atob(l);
  }
  class c {
    constructor(p, a) {
      if (a.map === !1) return;
      this.loadAnnotation(p), this.inline = this.startWith(this.annotation, "data:");
      let h = a.map ? a.map.prev : void 0, d = this.loadMap(a.from, h);
      !this.mapFile && a.from && (this.mapFile = a.from), this.mapFile && (this.root = i(this.mapFile)), d && (this.text = d);
    }
    consumer() {
      return this.consumerCache || (this.consumerCache = new e(this.text)), this.consumerCache;
    }
    decodeInline(p) {
      let a = /^data:application\/json;charset=utf-?8;base64,/, h = /^data:application\/json;base64,/, d = /^data:application\/json;charset=utf-?8,/, u = /^data:application\/json,/;
      if (d.test(p) || u.test(p))
        return decodeURIComponent(p.substr(RegExp.lastMatch.length));
      if (a.test(p) || h.test(p))
        return o(p.substr(RegExp.lastMatch.length));
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
      let a = p.match(/\/\*\s*# sourceMappingURL=/gm);
      if (!a) return;
      let h = p.lastIndexOf(a.pop()), d = p.indexOf("*/", h);
      h > -1 && d > -1 && (this.annotation = this.getAnnotationURL(p.substring(h, d)));
    }
    loadFile(p) {
      if (this.root = i(p), r(p))
        return this.mapFile = p, n(p, "utf-8").toString().trim();
    }
    loadMap(p, a) {
      if (a === !1) return !1;
      if (a) {
        if (typeof a == "string")
          return a;
        if (typeof a == "function") {
          let h = a(p);
          if (h) {
            let d = this.loadFile(h);
            if (!d)
              throw new Error(
                "Unable to load previous source map: " + h.toString()
              );
            return d;
          }
        } else {
          if (a instanceof e)
            return t.fromSourceMap(a).toString();
          if (a instanceof t)
            return a.toString();
          if (this.isMap(a))
            return JSON.stringify(a);
          throw new Error(
            "Unsupported previous source map format: " + a.toString()
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
    startWith(p, a) {
      return p ? p.substr(0, a.length) === a : !1;
    }
    withContent() {
      return !!(this.consumer().sourcesContent && this.consumer().sourcesContent.length > 0);
    }
  }
  return Js = c, c.default = c, Js;
}
var Zs, Sc;
function ns() {
  if (Sc) return Zs;
  Sc = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Zt, { fileURLToPath: r, pathToFileURL: n } = Zt, { isAbsolute: i, resolve: s } = Zt, { nanoid: o } = /* @__PURE__ */ Lb(), c = Zt, l = va(), p = Od(), a = Symbol("fromOffsetCache"), h = !!(e && t), d = !!(s && i);
  class u {
    constructor(f, y = {}) {
      if (f === null || typeof f > "u" || typeof f == "object" && !f.toString)
        throw new Error(`PostCSS received ${f} instead of CSS string`);
      if (this.css = f.toString(), this.css[0] === "\uFEFF" || this.css[0] === "￾" ? (this.hasBOM = !0, this.css = this.css.slice(1)) : this.hasBOM = !1, y.from && (!d || /^\w+:\/\//.test(y.from) || i(y.from) ? this.file = y.from : this.file = s(y.from)), d && h) {
        let C = new p(this.css, y);
        if (C.text) {
          this.map = C;
          let k = C.consumer().file;
          !this.file && k && (this.file = this.mapResolve(k));
        }
      }
      this.file || (this.id = "<input css " + o(6) + ">"), this.map && (this.map.file = this.from);
    }
    error(f, y, C, k = {}) {
      let b, A, S;
      if (y && typeof y == "object") {
        let R = y, I = C;
        if (typeof R.offset == "number") {
          let F = this.fromOffset(R.offset);
          y = F.line, C = F.col;
        } else
          y = R.line, C = R.column;
        if (typeof I.offset == "number") {
          let F = this.fromOffset(I.offset);
          A = F.line, S = F.col;
        } else
          A = I.line, S = I.column;
      } else if (!C) {
        let R = this.fromOffset(y);
        y = R.line, C = R.col;
      }
      let x = this.origin(y, C, A, S);
      return x ? b = new l(
        f,
        x.endLine === void 0 ? x.line : { column: x.column, line: x.line },
        x.endLine === void 0 ? x.column : { column: x.endColumn, line: x.endLine },
        x.source,
        x.file,
        k.plugin
      ) : b = new l(
        f,
        A === void 0 ? y : { column: C, line: y },
        A === void 0 ? C : { column: S, line: A },
        this.css,
        this.file,
        k.plugin
      ), b.input = { column: C, endColumn: S, endLine: A, line: y, source: this.css }, this.file && (n && (b.input.url = n(this.file).toString()), b.input.file = this.file), b;
    }
    fromOffset(f) {
      let y, C;
      if (this[a])
        C = this[a];
      else {
        let b = this.css.split(`
`);
        C = new Array(b.length);
        let A = 0;
        for (let S = 0, x = b.length; S < x; S++)
          C[S] = A, A += b[S].length + 1;
        this[a] = C;
      }
      y = C[C.length - 1];
      let k = 0;
      if (f >= y)
        k = C.length - 1;
      else {
        let b = C.length - 2, A;
        for (; k < b; )
          if (A = k + (b - k >> 1), f < C[A])
            b = A - 1;
          else if (f >= C[A + 1])
            k = A + 1;
          else {
            k = A;
            break;
          }
      }
      return {
        col: f - C[k] + 1,
        line: k + 1
      };
    }
    mapResolve(f) {
      return /^\w+:\/\//.test(f) ? f : s(this.map.consumer().sourceRoot || this.map.root || ".", f);
    }
    origin(f, y, C, k) {
      if (!this.map) return !1;
      let b = this.map.consumer(), A = b.originalPositionFor({ column: y, line: f });
      if (!A.source) return !1;
      let S;
      typeof C == "number" && (S = b.originalPositionFor({ column: k, line: C }));
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
      let I = b.sourceContentFor(A.source);
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
  return Zs = u, u.default = u, c && c.registerInput && c.registerInput(u), Zs;
}
var Qs, Ec;
function Nd() {
  if (Ec) return Qs;
  Ec = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Zt, { dirname: r, relative: n, resolve: i, sep: s } = Zt, { pathToFileURL: o } = Zt, c = ns(), l = !!(e && t), p = !!(r && i && n && s);
  class a {
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
      }, y, C;
      this.stringify(this.root, (k, b, A) => {
        if (this.css += k, b && A !== "end" && (f.generated.line = d, f.generated.column = u - 1, b.source && b.source.start ? (f.source = this.sourcePath(b), f.original.line = b.source.start.line, f.original.column = b.source.start.column - 1, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, this.map.addMapping(f))), y = k.match(/\n/g), y ? (d += y.length, C = k.lastIndexOf(`
`), u = k.length - C) : u += k.length, b && A !== "start") {
          let S = b.parent || { raws: {} };
          (!(b.type === "decl" || b.type === "atrule" && !b.nodes) || b !== S.last || S.raws.semicolon) && (b.source && b.source.end ? (f.source = this.sourcePath(b), f.original.line = b.source.end.line, f.original.column = b.source.end.column - 1, f.generated.line = d, f.generated.column = u - 2, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, f.generated.line = d, f.generated.column = u - 1, this.map.addMapping(f)));
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
      if (o) {
        let m = o(d).toString();
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
  return Qs = a, Qs;
}
var eo, Cc;
function is() {
  if (Cc) return eo;
  Cc = 1;
  let e = ts();
  class t extends e {
    constructor(n) {
      super(n), this.type = "comment";
    }
  }
  return eo = t, t.default = t, eo;
}
var to, Mc;
function tn() {
  if (Mc) return to;
  Mc = 1;
  let { isClean: e, my: t } = xa(), r = rs(), n = is(), i = ts(), s, o, c, l;
  function p(d) {
    return d.map((u) => (u.nodes && (u.nodes = p(u.nodes)), delete u.source, u));
  }
  function a(d) {
    if (d[e] = !1, d.proxyOf.nodes)
      for (let u of d.proxyOf.nodes)
        a(u);
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
            ...f.map((y) => typeof y == "function" ? (C, k) => y(C.toProxy(), k) : y)
          ) : m === "every" || m === "some" ? (f) => u[m](
            (y, ...C) => f(y.toProxy(), ...C)
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
      for (let k of y) this.proxyOf.nodes.splice(f + 1, 0, k);
      let C;
      for (let k in this.indexes)
        C = this.indexes[k], f < C && (this.indexes[k] = C + y.length);
      return this.markDirty(), this;
    }
    insertBefore(u, m) {
      let f = this.index(u), y = f === 0 ? "prepend" : !1, C = this.normalize(m, this.proxyOf.nodes[f], y).reverse();
      f = this.index(u);
      for (let b of C) this.proxyOf.nodes.splice(f, 0, b);
      let k;
      for (let b in this.indexes)
        k = this.indexes[b], f <= k && (this.indexes[b] = k + C.length);
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
        u = [new o(u)];
      else if (u.name)
        u = [new c(u)];
      else if (u.text)
        u = [new n(u)];
      else
        throw new Error("Unknown node type in node creation");
      return u.map((y) => (y[t] || h.rebuild(y), y = y.proxyOf, y.parent && y.parent.removeChild(y), y[e] && a(y), typeof y.raws.before > "u" && m && typeof m.raws.before < "u" && (y.raws.before = m.raws.before.replace(/\S/g, "")), y.parent = this.proxyOf, y));
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
        } catch (C) {
          throw m.addToError(C);
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
    o = d;
  }, h.registerAtRule = (d) => {
    c = d;
  }, h.registerRoot = (d) => {
    l = d;
  }, to = h, h.default = h, h.rebuild = (d) => {
    d.type === "atrule" ? Object.setPrototypeOf(d, c.prototype) : d.type === "rule" ? Object.setPrototypeOf(d, o.prototype) : d.type === "decl" ? Object.setPrototypeOf(d, r.prototype) : d.type === "comment" ? Object.setPrototypeOf(d, n.prototype) : d.type === "root" && Object.setPrototypeOf(d, l.prototype), d[t] = !0, d.nodes && d.nodes.forEach((u) => {
      h.rebuild(u);
    });
  }, to;
}
var ro, Rc;
function wa() {
  if (Rc) return ro;
  Rc = 1;
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
  }, ro = n, n.default = n, ro;
}
var no, Tc;
function Pd() {
  if (Tc) return no;
  Tc = 1;
  let e = {};
  return no = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, no;
}
var io, Ac;
function zd() {
  if (Ac) return io;
  Ac = 1;
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
  return io = e, e.default = e, io;
}
var so, Lc;
function Sa() {
  if (Lc) return so;
  Lc = 1;
  let e = zd();
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
  return so = t, t.default = t, so;
}
var oo, _c;
function _b() {
  if (_c) return oo;
  _c = 1;
  const e = 39, t = 34, r = 92, n = 47, i = 10, s = 32, o = 12, c = 9, l = 13, p = 91, a = 93, h = 40, d = 41, u = 123, m = 125, f = 59, y = 42, C = 58, k = 64, b = /[\t\n\f\r "#'()/;[\\\]{}]/g, A = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, S = /.[\r\n"'(/\\]/, x = /[\da-f]/i;
  return oo = function(I, F = {}) {
    let z = I.css.valueOf(), Q = F.ignoreErrors, B, N, De, Je, fe, pe, Re, Ue, Te, ke, Ge = z.length, P = 0, Y = [], oe = [];
    function re() {
      return P;
    }
    function ce(K) {
      throw I.error("Unclosed " + K, P);
    }
    function Ae() {
      return oe.length === 0 && P >= Ge;
    }
    function Be(K) {
      if (oe.length) return oe.pop();
      if (P >= Ge) return;
      let se = K ? K.ignoreUnclosed : !1;
      switch (B = z.charCodeAt(P), B) {
        case i:
        case s:
        case c:
        case l:
        case o: {
          N = P;
          do
            N += 1, B = z.charCodeAt(N);
          while (B === s || B === i || B === c || B === l || B === o);
          ke = ["space", z.slice(P, N)], P = N - 1;
          break;
        }
        case p:
        case a:
        case u:
        case m:
        case C:
        case f:
        case d: {
          let ge = String.fromCharCode(B);
          ke = [ge, ge, P];
          break;
        }
        case h: {
          if (Ue = Y.length ? Y.pop()[1] : "", Te = z.charCodeAt(P + 1), Ue === "url" && Te !== e && Te !== t && Te !== s && Te !== i && Te !== c && Te !== o && Te !== l) {
            N = P;
            do {
              if (pe = !1, N = z.indexOf(")", N + 1), N === -1)
                if (Q || se) {
                  N = P;
                  break;
                } else
                  ce("bracket");
              for (Re = N; z.charCodeAt(Re - 1) === r; )
                Re -= 1, pe = !pe;
            } while (pe);
            ke = ["brackets", z.slice(P, N + 1), P, N], P = N;
          } else
            N = z.indexOf(")", P + 1), Je = z.slice(P, N + 1), N === -1 || S.test(Je) ? ke = ["(", "(", P] : (ke = ["brackets", Je, P, N], P = N);
          break;
        }
        case e:
        case t: {
          De = B === e ? "'" : '"', N = P;
          do {
            if (pe = !1, N = z.indexOf(De, N + 1), N === -1)
              if (Q || se) {
                N = P + 1;
                break;
              } else
                ce("string");
            for (Re = N; z.charCodeAt(Re - 1) === r; )
              Re -= 1, pe = !pe;
          } while (pe);
          ke = ["string", z.slice(P, N + 1), P, N], P = N;
          break;
        }
        case k: {
          b.lastIndex = P + 1, b.test(z), b.lastIndex === 0 ? N = z.length - 1 : N = b.lastIndex - 2, ke = ["at-word", z.slice(P, N + 1), P, N], P = N;
          break;
        }
        case r: {
          for (N = P, fe = !0; z.charCodeAt(N + 1) === r; )
            N += 1, fe = !fe;
          if (B = z.charCodeAt(N + 1), fe && B !== n && B !== s && B !== i && B !== c && B !== l && B !== o && (N += 1, x.test(z.charAt(N)))) {
            for (; x.test(z.charAt(N + 1)); )
              N += 1;
            z.charCodeAt(N + 1) === s && (N += 1);
          }
          ke = ["word", z.slice(P, N + 1), P, N], P = N;
          break;
        }
        default: {
          B === n && z.charCodeAt(P + 1) === y ? (N = z.indexOf("*/", P + 2) + 1, N === 0 && (Q || se ? N = z.length : ce("comment")), ke = ["comment", z.slice(P, N + 1), P, N], P = N) : (A.lastIndex = P + 1, A.test(z), A.lastIndex === 0 ? N = z.length - 1 : N = A.lastIndex - 2, ke = ["word", z.slice(P, N + 1), P, N], Y.push(ke), P = N);
          break;
        }
      }
      return P++, ke;
    }
    function Se(K) {
      oe.push(K);
    }
    return {
      back: Se,
      endOfFile: Ae,
      nextToken: Be,
      position: re
    };
  }, oo;
}
var ao, Ic;
function Ea() {
  if (Ic) return ao;
  Ic = 1;
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
  return ao = t, t.default = t, e.registerAtRule(t), ao;
}
var lo, Oc;
function ri() {
  if (Oc) return lo;
  Oc = 1;
  let e = tn(), t, r;
  class n extends e {
    constructor(s) {
      super(s), this.type = "root", this.nodes || (this.nodes = []);
    }
    normalize(s, o, c) {
      let l = super.normalize(s);
      if (o) {
        if (c === "prepend")
          this.nodes.length > 1 ? o.raws.before = this.nodes[1].raws.before : delete o.raws.before;
        else if (this.first !== o)
          for (let p of l)
            p.raws.before = o.raws.before;
      }
      return l;
    }
    removeChild(s, o) {
      let c = this.index(s);
      return !o && c === 0 && this.nodes.length > 1 && (this.nodes[1].raws.before = this.nodes[c].raws.before), super.removeChild(s);
    }
    toResult(s = {}) {
      return new t(new r(), this, s).stringify();
    }
  }
  return n.registerLazyResult = (i) => {
    t = i;
  }, n.registerProcessor = (i) => {
    r = i;
  }, lo = n, n.default = n, e.registerRoot(n), lo;
}
var co, Nc;
function $d() {
  if (Nc) return co;
  Nc = 1;
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
      let i = [], s = "", o = !1, c = 0, l = !1, p = "", a = !1;
      for (let h of t)
        a ? a = !1 : h === "\\" ? a = !0 : l ? h === p && (l = !1) : h === '"' || h === "'" ? (l = !0, p = h) : h === "(" ? c += 1 : h === ")" ? c > 0 && (c -= 1) : c === 0 && r.includes(h) && (o = !0), o ? (s !== "" && i.push(s.trim()), s = "", o = !1) : s += h;
      return (n || s !== "") && i.push(s.trim()), i;
    }
  };
  return co = e, e.default = e, co;
}
var uo, Pc;
function Ca() {
  if (Pc) return uo;
  Pc = 1;
  let e = tn(), t = $d();
  class r extends e {
    constructor(i) {
      super(i), this.type = "rule", this.nodes || (this.nodes = []);
    }
    get selectors() {
      return t.comma(this.selector);
    }
    set selectors(i) {
      let s = this.selector ? this.selector.match(/,\s*/) : null, o = s ? s[0] : "," + this.raw("between", "beforeOpen");
      this.selector = i.join(o);
    }
  }
  return uo = r, r.default = r, e.registerRule(r), uo;
}
var po, zc;
function Ib() {
  if (zc) return po;
  zc = 1;
  let e = rs(), t = _b(), r = is(), n = Ea(), i = ri(), s = Ca();
  const o = {
    empty: !0,
    space: !0
  };
  function c(p) {
    for (let a = p.length - 1; a >= 0; a--) {
      let h = p[a], d = h[3] || h[2];
      if (d) return d;
    }
  }
  class l {
    constructor(a) {
      this.input = a, this.root = new i(), this.current = this.root, this.spaces = "", this.semicolon = !1, this.createTokenizer(), this.root.source = { input: a, start: { column: 1, line: 1, offset: 0 } };
    }
    atrule(a) {
      let h = new n();
      h.name = a[1].slice(1), h.name === "" && this.unnamedAtrule(h, a), this.init(h, a[2]);
      let d, u, m, f = !1, y = !1, C = [], k = [];
      for (; !this.tokenizer.endOfFile(); ) {
        if (a = this.tokenizer.nextToken(), d = a[0], d === "(" || d === "[" ? k.push(d === "(" ? ")" : "]") : d === "{" && k.length > 0 ? k.push("}") : d === k[k.length - 1] && k.pop(), k.length === 0)
          if (d === ";") {
            h.source.end = this.getPosition(a[2]), h.source.end.offset++, this.semicolon = !0;
            break;
          } else if (d === "{") {
            y = !0;
            break;
          } else if (d === "}") {
            if (C.length > 0) {
              for (m = C.length - 1, u = C[m]; u && u[0] === "space"; )
                u = C[--m];
              u && (h.source.end = this.getPosition(u[3] || u[2]), h.source.end.offset++);
            }
            this.end(a);
            break;
          } else
            C.push(a);
        else
          C.push(a);
        if (this.tokenizer.endOfFile()) {
          f = !0;
          break;
        }
      }
      h.raws.between = this.spacesAndCommentsFromEnd(C), C.length ? (h.raws.afterName = this.spacesAndCommentsFromStart(C), this.raw(h, "params", C), f && (a = C[C.length - 1], h.source.end = this.getPosition(a[3] || a[2]), h.source.end.offset++, this.spaces = h.raws.between, h.raws.between = "")) : (h.raws.afterName = "", h.params = ""), y && (h.nodes = [], this.current = h);
    }
    checkMissedSemicolon(a) {
      let h = this.colon(a);
      if (h === !1) return;
      let d = 0, u;
      for (let m = h - 1; m >= 0 && (u = a[m], !(u[0] !== "space" && (d += 1, d === 2))); m--)
        ;
      throw this.input.error(
        "Missed semicolon",
        u[0] === "word" ? u[3] + 1 : u[2]
      );
    }
    colon(a) {
      let h = 0, d, u, m;
      for (let [f, y] of a.entries()) {
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
    comment(a) {
      let h = new r();
      this.init(h, a[2]), h.source.end = this.getPosition(a[3] || a[2]), h.source.end.offset++;
      let d = a[1].slice(2, -2);
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
    decl(a, h) {
      let d = new e();
      this.init(d, a[0][2]);
      let u = a[a.length - 1];
      for (u[0] === ";" && (this.semicolon = !0, a.pop()), d.source.end = this.getPosition(
        u[3] || u[2] || c(a)
      ), d.source.end.offset++; a[0][0] !== "word"; )
        a.length === 1 && this.unknownWord(a), d.raws.before += a.shift()[1];
      for (d.source.start = this.getPosition(a[0][2]), d.prop = ""; a.length; ) {
        let k = a[0][0];
        if (k === ":" || k === "space" || k === "comment")
          break;
        d.prop += a.shift()[1];
      }
      d.raws.between = "";
      let m;
      for (; a.length; )
        if (m = a.shift(), m[0] === ":") {
          d.raws.between += m[1];
          break;
        } else
          m[0] === "word" && /\w/.test(m[1]) && this.unknownWord([m]), d.raws.between += m[1];
      (d.prop[0] === "_" || d.prop[0] === "*") && (d.raws.before += d.prop[0], d.prop = d.prop.slice(1));
      let f = [], y;
      for (; a.length && (y = a[0][0], !(y !== "space" && y !== "comment")); )
        f.push(a.shift());
      this.precheckMissedSemicolon(a);
      for (let k = a.length - 1; k >= 0; k--) {
        if (m = a[k], m[1].toLowerCase() === "!important") {
          d.important = !0;
          let b = this.stringFrom(a, k);
          b = this.spacesFromEnd(a) + b, b !== " !important" && (d.raws.important = b);
          break;
        } else if (m[1].toLowerCase() === "important") {
          let b = a.slice(0), A = "";
          for (let S = k; S > 0; S--) {
            let x = b[S][0];
            if (A.trim().indexOf("!") === 0 && x !== "space")
              break;
            A = b.pop()[1] + A;
          }
          A.trim().indexOf("!") === 0 && (d.important = !0, d.raws.important = A, a = b);
        }
        if (m[0] !== "space" && m[0] !== "comment")
          break;
      }
      a.some((k) => k[0] !== "space" && k[0] !== "comment") && (d.raws.between += f.map((k) => k[1]).join(""), f = []), this.raw(d, "value", f.concat(a), h), d.value.includes(":") && !h && this.checkMissedSemicolon(a);
    }
    doubleColon(a) {
      throw this.input.error(
        "Double colon",
        { offset: a[2] },
        { offset: a[2] + a[1].length }
      );
    }
    emptyRule(a) {
      let h = new s();
      this.init(h, a[2]), h.selector = "", h.raws.between = "", this.current = h;
    }
    end(a) {
      this.current.nodes && this.current.nodes.length && (this.current.raws.semicolon = this.semicolon), this.semicolon = !1, this.current.raws.after = (this.current.raws.after || "") + this.spaces, this.spaces = "", this.current.parent ? (this.current.source.end = this.getPosition(a[2]), this.current.source.end.offset++, this.current = this.current.parent) : this.unexpectedClose(a);
    }
    endFile() {
      this.current.parent && this.unclosedBlock(), this.current.nodes && this.current.nodes.length && (this.current.raws.semicolon = this.semicolon), this.current.raws.after = (this.current.raws.after || "") + this.spaces, this.root.source.end = this.getPosition(this.tokenizer.position());
    }
    freeSemicolon(a) {
      if (this.spaces += a[1], this.current.nodes) {
        let h = this.current.nodes[this.current.nodes.length - 1];
        h && h.type === "rule" && !h.raws.ownSemicolon && (h.raws.ownSemicolon = this.spaces, this.spaces = "");
      }
    }
    // Helpers
    getPosition(a) {
      let h = this.input.fromOffset(a);
      return {
        column: h.col,
        line: h.line,
        offset: a
      };
    }
    init(a, h) {
      this.current.push(a), a.source = {
        input: this.input,
        start: this.getPosition(h)
      }, a.raws.before = this.spaces, this.spaces = "", a.type !== "comment" && (this.semicolon = !1);
    }
    other(a) {
      let h = !1, d = null, u = !1, m = null, f = [], y = a[1].startsWith("--"), C = [], k = a;
      for (; k; ) {
        if (d = k[0], C.push(k), d === "(" || d === "[")
          m || (m = k), f.push(d === "(" ? ")" : "]");
        else if (y && u && d === "{")
          m || (m = k), f.push("}");
        else if (f.length === 0)
          if (d === ";")
            if (u) {
              this.decl(C, y);
              return;
            } else
              break;
          else if (d === "{") {
            this.rule(C);
            return;
          } else if (d === "}") {
            this.tokenizer.back(C.pop()), h = !0;
            break;
          } else d === ":" && (u = !0);
        else d === f[f.length - 1] && (f.pop(), f.length === 0 && (m = null));
        k = this.tokenizer.nextToken();
      }
      if (this.tokenizer.endOfFile() && (h = !0), f.length > 0 && this.unclosedBracket(m), h && u) {
        if (!y)
          for (; C.length && (k = C[C.length - 1][0], !(k !== "space" && k !== "comment")); )
            this.tokenizer.back(C.pop());
        this.decl(C, y);
      } else
        this.unknownWord(C);
    }
    parse() {
      let a;
      for (; !this.tokenizer.endOfFile(); )
        switch (a = this.tokenizer.nextToken(), a[0]) {
          case "space":
            this.spaces += a[1];
            break;
          case ";":
            this.freeSemicolon(a);
            break;
          case "}":
            this.end(a);
            break;
          case "comment":
            this.comment(a);
            break;
          case "at-word":
            this.atrule(a);
            break;
          case "{":
            this.emptyRule(a);
            break;
          default:
            this.other(a);
            break;
        }
      this.endFile();
    }
    precheckMissedSemicolon() {
    }
    raw(a, h, d, u) {
      let m, f, y = d.length, C = "", k = !0, b, A;
      for (let S = 0; S < y; S += 1)
        m = d[S], f = m[0], f === "space" && S === y - 1 && !u ? k = !1 : f === "comment" ? (A = d[S - 1] ? d[S - 1][0] : "empty", b = d[S + 1] ? d[S + 1][0] : "empty", !o[A] && !o[b] ? C.slice(-1) === "," ? k = !1 : C += m[1] : k = !1) : C += m[1];
      if (!k) {
        let S = d.reduce((x, R) => x + R[1], "");
        a.raws[h] = { raw: S, value: C };
      }
      a[h] = C;
    }
    rule(a) {
      a.pop();
      let h = new s();
      this.init(h, a[0][2]), h.raws.between = this.spacesAndCommentsFromEnd(a), this.raw(h, "selector", a), this.current = h;
    }
    spacesAndCommentsFromEnd(a) {
      let h, d = "";
      for (; a.length && (h = a[a.length - 1][0], !(h !== "space" && h !== "comment")); )
        d = a.pop()[1] + d;
      return d;
    }
    // Errors
    spacesAndCommentsFromStart(a) {
      let h, d = "";
      for (; a.length && (h = a[0][0], !(h !== "space" && h !== "comment")); )
        d += a.shift()[1];
      return d;
    }
    spacesFromEnd(a) {
      let h, d = "";
      for (; a.length && (h = a[a.length - 1][0], h === "space"); )
        d = a.pop()[1] + d;
      return d;
    }
    stringFrom(a, h) {
      let d = "";
      for (let u = h; u < a.length; u++)
        d += a[u][1];
      return a.splice(h, a.length - h), d;
    }
    unclosedBlock() {
      let a = this.current.source.start;
      throw this.input.error("Unclosed block", a.line, a.column);
    }
    unclosedBracket(a) {
      throw this.input.error(
        "Unclosed bracket",
        { offset: a[2] },
        { offset: a[2] + 1 }
      );
    }
    unexpectedClose(a) {
      throw this.input.error(
        "Unexpected }",
        { offset: a[2] },
        { offset: a[2] + 1 }
      );
    }
    unknownWord(a) {
      throw this.input.error(
        "Unknown word",
        { offset: a[0][2] },
        { offset: a[0][2] + a[0][1].length }
      );
    }
    unnamedAtrule(a, h) {
      throw this.input.error(
        "At-rule without name",
        { offset: h[2] },
        { offset: h[2] + h[1].length }
      );
    }
  }
  return po = l, po;
}
var ho, $c;
function Ma() {
  if ($c) return ho;
  $c = 1;
  let e = tn(), t = Ib(), r = ns();
  function n(i, s) {
    let o = new r(i, s), c = new t(o);
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
  return ho = n, n.default = n, e.registerParse(n), ho;
}
var fo, Dc;
function Dd() {
  if (Dc) return fo;
  Dc = 1;
  let { isClean: e, my: t } = xa(), r = Nd(), n = es(), i = tn(), s = wa(), o = Pd(), c = Sa(), l = Ma(), p = ri();
  const a = {
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
  function m(A) {
    return typeof A == "object" && typeof A.then == "function";
  }
  function f(A) {
    let S = !1, x = a[A.type];
    return A.type === "decl" ? S = A.prop.toLowerCase() : A.type === "atrule" && (S = A.name.toLowerCase()), S && A.append ? [
      x,
      x + "-" + S,
      u,
      x + "Exit",
      x + "Exit-" + S
    ] : S ? [x, x + "-" + S, x + "Exit", x + "Exit-" + S] : A.append ? [x, u, x + "Exit"] : [x, x + "Exit"];
  }
  function y(A) {
    let S;
    return A.type === "document" ? S = ["Document", u, "DocumentExit"] : A.type === "root" ? S = ["Root", u, "RootExit"] : S = f(A), {
      eventIndex: 0,
      events: S,
      iterator: 0,
      node: A,
      visitorIndex: 0,
      visitors: []
    };
  }
  function C(A) {
    return A[e] = !1, A.nodes && A.nodes.forEach((S) => C(S)), A;
  }
  let k = {};
  class b {
    constructor(S, x, R) {
      this.stringified = !1, this.processed = !1;
      let I;
      if (typeof x == "object" && x !== null && (x.type === "root" || x.type === "document"))
        I = C(x);
      else if (x instanceof b || x instanceof c)
        I = C(x.root), x.map && (typeof R.map > "u" && (R.map = {}), R.map.inline || (R.map.inline = !1), R.map.prev = x.map);
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
      this.result = new c(S, I, R), this.helpers = { ...k, postcss: k, result: this.result }, this.plugins = this.processor.plugins.map((F) => typeof F == "object" && F.prepare ? { ...F, ...F.prepare(this.result) } : F);
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
          let I = R.postcssPlugin, F = R.postcssVersion, z = this.result.processor.version, Q = F.split("."), B = z.split(".");
          (Q[0] !== B[0] || parseInt(Q[1]) > parseInt(B[1])) && console.error(
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
      return process.env.NODE_ENV !== "production" && ("from" in this.opts || o(
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
        } catch (B) {
          throw this.handleError(B, R);
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
  return b.registerPostcss = (A) => {
    k = A;
  }, fo = b, b.default = b, p.registerLazyResult(b), s.registerLazyResult(b), fo;
}
var mo, Fc;
function Ob() {
  if (Fc) return mo;
  Fc = 1;
  let e = Nd(), t = es(), r = Pd(), n = Ma();
  const i = Sa();
  class s {
    constructor(c, l, p) {
      l = l.toString(), this.stringified = !1, this._processor = c, this._css = l, this._opts = p, this._map = void 0;
      let a, h = t;
      this.result = new i(this._processor, a, this._opts), this.result.css = l;
      let d = this;
      Object.defineProperty(this.result, "root", {
        get() {
          return d.root;
        }
      });
      let u = new e(h, a, this._opts, l);
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
  return mo = s, s.default = s, mo;
}
var go, Uc;
function Nb() {
  if (Uc) return go;
  Uc = 1;
  let e = Ob(), t = Dd(), r = wa(), n = ri();
  class i {
    constructor(o = []) {
      this.version = "8.4.38", this.plugins = this.normalize(o);
    }
    normalize(o) {
      let c = [];
      for (let l of o)
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
    process(o, c = {}) {
      return !this.plugins.length && !c.parser && !c.stringifier && !c.syntax ? new e(this, o, c) : new t(this, o, c);
    }
    use(o) {
      return this.plugins = this.plugins.concat(this.normalize([o])), this;
    }
  }
  return go = i, i.default = i, n.registerProcessor(i), r.registerProcessor(i), go;
}
var yo, Bc;
function Pb() {
  if (Bc) return yo;
  Bc = 1;
  let e = rs(), t = Od(), r = is(), n = Ea(), i = ns(), s = ri(), o = Ca();
  function c(l, p) {
    if (Array.isArray(l)) return l.map((d) => c(d));
    let { inputs: a, ...h } = l;
    if (a) {
      p = [];
      for (let d of a) {
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
      return new o(h);
    if (h.type === "comment")
      return new r(h);
    if (h.type === "atrule")
      return new n(h);
    throw new Error("Unknown node type: " + l.type);
  }
  return yo = c, c.default = c, yo;
}
var bo, qc;
function zb() {
  if (qc) return bo;
  qc = 1;
  let e = va(), t = rs(), r = Dd(), n = tn(), i = Nb(), s = es(), o = Pb(), c = wa(), l = zd(), p = is(), a = Ea(), h = Sa(), d = ns(), u = Ma(), m = $d(), f = Ca(), y = ri(), C = ts();
  function k(...b) {
    return b.length === 1 && Array.isArray(b[0]) && (b = b[0]), new i(b);
  }
  return k.plugin = function(A, S) {
    let x = !1;
    function R(...F) {
      console && console.warn && !x && (x = !0, console.warn(
        A + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`
      ), process.env.LANG && process.env.LANG.startsWith("cn") && console.warn(
        A + `: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`
      ));
      let z = S(...F);
      return z.postcssPlugin = A, z.postcssVersion = new i().version, z;
    }
    let I;
    return Object.defineProperty(R, "postcss", {
      get() {
        return I || (I = R()), I;
      }
    }), R.process = function(F, z, Q) {
      return k([R(Q)]).process(F, z);
    }, R;
  }, k.stringify = s, k.parse = u, k.fromJSON = o, k.list = m, k.comment = (b) => new p(b), k.atRule = (b) => new a(b), k.decl = (b) => new t(b), k.rule = (b) => new f(b), k.root = (b) => new y(b), k.document = (b) => new c(b), k.CssSyntaxError = e, k.Declaration = t, k.Container = n, k.Processor = i, k.Document = c, k.Comment = p, k.Warning = l, k.AtRule = a, k.Result = h, k.Input = d, k.Rule = f, k.Root = y, k.Node = C, r.registerPostcss(k), bo = k, k.default = k, bo;
}
var $b = zb();
const Ye = /* @__PURE__ */ Cb($b);
Ye.stringify;
Ye.fromJSON;
Ye.plugin;
Ye.parse;
Ye.list;
Ye.document;
Ye.comment;
Ye.atRule;
Ye.rule;
Ye.decl;
Ye.root;
Ye.CssSyntaxError;
Ye.Declaration;
Ye.Container;
Ye.Processor;
Ye.Document;
Ye.Comment;
Ye.Warning;
Ye.AtRule;
Ye.Result;
Ye.Input;
Ye.Rule;
Ye.Root;
Ye.Node;
var Db = Object.defineProperty, Fb = (e, t, r) => t in e ? Db(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, Ft = (e, t, r) => Fb(e, typeof t != "symbol" ? t + "" : t, r);
Date.now().toString();
function Ub(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function Bb(e) {
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
var Mi = { exports: {} }, Wc;
function qb() {
  if (Wc) return Mi.exports;
  Wc = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return Mi.exports = t(), Mi.exports.createColors = t, Mi.exports;
}
const Wb = {}, jb = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Wb
}, Symbol.toStringTag, { value: "Module" })), Qt = /* @__PURE__ */ Bb(jb);
var ko, jc;
function Ra() {
  if (jc) return ko;
  jc = 1;
  let e = /* @__PURE__ */ qb(), t = Qt;
  class r extends Error {
    constructor(i, s, o, c, l, p) {
      super(i), this.name = "CssSyntaxError", this.reason = i, l && (this.file = l), c && (this.source = c), p && (this.plugin = p), typeof s < "u" && typeof o < "u" && (typeof s == "number" ? (this.line = s, this.column = o) : (this.line = s.line, this.column = s.column, this.endLine = o.line, this.endColumn = o.column)), this.setMessage(), Error.captureStackTrace && Error.captureStackTrace(this, r);
    }
    setMessage() {
      this.message = this.plugin ? this.plugin + ": " : "", this.message += this.file ? this.file : "<css input>", typeof this.line < "u" && (this.message += ":" + this.line + ":" + this.column), this.message += ": " + this.reason;
    }
    showSourceCode(i) {
      if (!this.source) return "";
      let s = this.source;
      i == null && (i = e.isColorSupported), t && i && (s = t(s));
      let o = s.split(/\r?\n/), c = Math.max(this.line - 3, 0), l = Math.min(this.line + 2, o.length), p = String(l).length, a, h;
      if (i) {
        let { bold: d, gray: u, red: m } = e.createColors(!0);
        a = (f) => d(m(f)), h = (f) => u(f);
      } else
        a = h = (d) => d;
      return o.slice(c, l).map((d, u) => {
        let m = c + 1 + u, f = " " + (" " + m).slice(-p) + " | ";
        if (m === this.line) {
          let y = h(f.replace(/\d/g, " ")) + d.slice(0, this.column - 1).replace(/[^\t]/g, " ");
          return a(">") + h(f) + d + `
 ` + y + a("^");
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
  return ko = r, r.default = r, ko;
}
var Ri = {}, Hc;
function Ta() {
  return Hc || (Hc = 1, Ri.isClean = Symbol("isClean"), Ri.my = Symbol("my")), Ri;
}
var vo, Yc;
function Fd() {
  if (Yc) return vo;
  Yc = 1;
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
      let o = "@" + i.name, c = i.params ? this.rawValue(i, "params") : "";
      if (typeof i.raws.afterName < "u" ? o += i.raws.afterName : c && (o += " "), i.nodes)
        this.block(i, o + c);
      else {
        let l = (i.raws.between || "") + (s ? ";" : "");
        this.builder(o + c + l, i);
      }
    }
    beforeAfter(i, s) {
      let o;
      i.type === "decl" ? o = this.raw(i, null, "beforeDecl") : i.type === "comment" ? o = this.raw(i, null, "beforeComment") : s === "before" ? o = this.raw(i, null, "beforeRule") : o = this.raw(i, null, "beforeClose");
      let c = i.parent, l = 0;
      for (; c && c.type !== "root"; )
        l += 1, c = c.parent;
      if (o.includes(`
`)) {
        let p = this.raw(i, null, "indent");
        if (p.length)
          for (let a = 0; a < l; a++) o += p;
      }
      return o;
    }
    block(i, s) {
      let o = this.raw(i, "between", "beforeOpen");
      this.builder(s + o + "{", i, "start");
      let c;
      i.nodes && i.nodes.length ? (this.body(i), c = this.raw(i, "after")) : c = this.raw(i, "after", "emptyBody"), c && this.builder(c), this.builder("}", i, "end");
    }
    body(i) {
      let s = i.nodes.length - 1;
      for (; s > 0 && i.nodes[s].type === "comment"; )
        s -= 1;
      let o = this.raw(i, "semicolon");
      for (let c = 0; c < i.nodes.length; c++) {
        let l = i.nodes[c], p = this.raw(l, "before");
        p && this.builder(p), this.stringify(l, s !== c || o);
      }
    }
    comment(i) {
      let s = this.raw(i, "left", "commentLeft"), o = this.raw(i, "right", "commentRight");
      this.builder("/*" + s + i.text + o + "*/", i);
    }
    decl(i, s) {
      let o = this.raw(i, "between", "colon"), c = i.prop + o + this.rawValue(i, "value");
      i.important && (c += i.raws.important || " !important"), s && (c += ";"), this.builder(c, i);
    }
    document(i) {
      this.body(i);
    }
    raw(i, s, o) {
      let c;
      if (o || (o = s), s && (c = i.raws[s], typeof c < "u"))
        return c;
      let l = i.parent;
      if (o === "before" && (!l || l.type === "root" && l.first === i || l && l.type === "document"))
        return "";
      if (!l) return e[o];
      let p = i.root();
      if (p.rawCache || (p.rawCache = {}), typeof p.rawCache[o] < "u")
        return p.rawCache[o];
      if (o === "before" || o === "after")
        return this.beforeAfter(i, o);
      {
        let a = "raw" + t(o);
        this[a] ? c = this[a](p, i) : p.walk((h) => {
          if (c = h.raws[s], typeof c < "u") return !1;
        });
      }
      return typeof c > "u" && (c = e[o]), p.rawCache[o] = c, c;
    }
    rawBeforeClose(i) {
      let s;
      return i.walk((o) => {
        if (o.nodes && o.nodes.length > 0 && typeof o.raws.after < "u")
          return s = o.raws.after, s.includes(`
`) && (s = s.replace(/[^\n]+$/, "")), !1;
      }), s && (s = s.replace(/\S/g, "")), s;
    }
    rawBeforeComment(i, s) {
      let o;
      return i.walkComments((c) => {
        if (typeof c.raws.before < "u")
          return o = c.raws.before, o.includes(`
`) && (o = o.replace(/[^\n]+$/, "")), !1;
      }), typeof o > "u" ? o = this.raw(s, null, "beforeDecl") : o && (o = o.replace(/\S/g, "")), o;
    }
    rawBeforeDecl(i, s) {
      let o;
      return i.walkDecls((c) => {
        if (typeof c.raws.before < "u")
          return o = c.raws.before, o.includes(`
`) && (o = o.replace(/[^\n]+$/, "")), !1;
      }), typeof o > "u" ? o = this.raw(s, null, "beforeRule") : o && (o = o.replace(/\S/g, "")), o;
    }
    rawBeforeOpen(i) {
      let s;
      return i.walk((o) => {
        if (o.type !== "decl" && (s = o.raws.between, typeof s < "u"))
          return !1;
      }), s;
    }
    rawBeforeRule(i) {
      let s;
      return i.walk((o) => {
        if (o.nodes && (o.parent !== i || i.first !== o) && typeof o.raws.before < "u")
          return s = o.raws.before, s.includes(`
`) && (s = s.replace(/[^\n]+$/, "")), !1;
      }), s && (s = s.replace(/\S/g, "")), s;
    }
    rawColon(i) {
      let s;
      return i.walkDecls((o) => {
        if (typeof o.raws.between < "u")
          return s = o.raws.between.replace(/[^\s:]/g, ""), !1;
      }), s;
    }
    rawEmptyBody(i) {
      let s;
      return i.walk((o) => {
        if (o.nodes && o.nodes.length === 0 && (s = o.raws.after, typeof s < "u"))
          return !1;
      }), s;
    }
    rawIndent(i) {
      if (i.raws.indent) return i.raws.indent;
      let s;
      return i.walk((o) => {
        let c = o.parent;
        if (c && c !== i && c.parent && c.parent === i && typeof o.raws.before < "u") {
          let l = o.raws.before.split(`
`);
          return s = l[l.length - 1], s = s.replace(/\S/g, ""), !1;
        }
      }), s;
    }
    rawSemicolon(i) {
      let s;
      return i.walk((o) => {
        if (o.nodes && o.nodes.length && o.last.type === "decl" && (s = o.raws.semicolon, typeof s < "u"))
          return !1;
      }), s;
    }
    rawValue(i, s) {
      let o = i[s], c = i.raws[s];
      return c && c.value === o ? c.raw : o;
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
  return vo = r, r.default = r, vo;
}
var xo, Vc;
function ss() {
  if (Vc) return xo;
  Vc = 1;
  let e = Fd();
  function t(r, n) {
    new e(n).stringify(r);
  }
  return xo = t, t.default = t, xo;
}
var wo, Gc;
function os() {
  if (Gc) return wo;
  Gc = 1;
  let { isClean: e, my: t } = Ta(), r = Ra(), n = Fd(), i = ss();
  function s(c, l) {
    let p = new c.constructor();
    for (let a in c) {
      if (!Object.prototype.hasOwnProperty.call(c, a) || a === "proxyCache") continue;
      let h = c[a], d = typeof h;
      a === "parent" && d === "object" ? l && (p[a] = l) : a === "source" ? p[a] = h : Array.isArray(h) ? p[a] = h.map((u) => s(u, p)) : (d === "object" && h !== null && (h = s(h)), p[a] = h);
    }
    return p;
  }
  class o {
    constructor(l = {}) {
      this.raws = {}, this[e] = !1, this[t] = !0;
      for (let p in l)
        if (p === "nodes") {
          this.nodes = [];
          for (let a of l[p])
            typeof a.clone == "function" ? this.append(a.clone()) : this.append(a);
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
      for (let a in l)
        p[a] = l[a];
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
        let { end: a, start: h } = this.rangeBy(p);
        return this.source.input.error(
          l,
          { column: h.column, line: h.line },
          { column: a.column, line: a.line },
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
        set(l, p, a) {
          return l[p] === a || (l[p] = a, (p === "prop" || p === "value" || p === "name" || p === "params" || p === "important" || /* c8 ignore next */
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
      let a = this.source.start;
      if (l.index)
        a = this.positionInside(l.index, p);
      else if (l.word) {
        p = this.toString();
        let h = p.indexOf(l.word);
        h !== -1 && (a = this.positionInside(h, p));
      }
      return a;
    }
    positionInside(l, p) {
      let a = p || this.toString(), h = this.source.start.column, d = this.source.start.line;
      for (let u = 0; u < l; u++)
        a[u] === `
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
      }, a = this.source.end ? {
        column: this.source.end.column + 1,
        line: this.source.end.line
      } : {
        column: p.column + 1,
        line: p.line
      };
      if (l.word) {
        let h = this.toString(), d = h.indexOf(l.word);
        d !== -1 && (p = this.positionInside(d, h), a = this.positionInside(d + l.word.length, h));
      } else
        l.start ? p = {
          column: l.start.column,
          line: l.start.line
        } : l.index && (p = this.positionInside(l.index)), l.end ? a = {
          column: l.end.column,
          line: l.end.line
        } : typeof l.endIndex == "number" ? a = this.positionInside(l.endIndex) : l.index && (a = this.positionInside(l.index + 1));
      return (a.line < p.line || a.line === p.line && a.column <= p.column) && (a = { column: p.column + 1, line: p.line }), { end: a, start: p };
    }
    raw(l, p) {
      return new n().raw(this, l, p);
    }
    remove() {
      return this.parent && this.parent.removeChild(this), this.parent = void 0, this;
    }
    replaceWith(...l) {
      if (this.parent) {
        let p = this, a = !1;
        for (let h of l)
          h === this ? a = !0 : a ? (this.parent.insertAfter(p, h), p = h) : this.parent.insertBefore(p, h);
        a || this.remove();
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
      let a = {}, h = p == null;
      p = p || /* @__PURE__ */ new Map();
      let d = 0;
      for (let u in this) {
        if (!Object.prototype.hasOwnProperty.call(this, u) || u === "parent" || u === "proxyCache") continue;
        let m = this[u];
        if (Array.isArray(m))
          a[u] = m.map((f) => typeof f == "object" && f.toJSON ? f.toJSON(null, p) : f);
        else if (typeof m == "object" && m.toJSON)
          a[u] = m.toJSON(null, p);
        else if (u === "source") {
          let f = p.get(m.input);
          f == null && (f = d, p.set(m.input, d), d++), a[u] = {
            end: m.end,
            inputId: f,
            start: m.start
          };
        } else
          a[u] = m;
      }
      return h && (a.inputs = [...p.keys()].map((u) => u.toJSON())), a;
    }
    toProxy() {
      return this.proxyCache || (this.proxyCache = new Proxy(this, this.getProxyProcessor())), this.proxyCache;
    }
    toString(l = i) {
      l.stringify && (l = l.stringify);
      let p = "";
      return l(this, (a) => {
        p += a;
      }), p;
    }
    warn(l, p, a) {
      let h = { node: this };
      for (let d in a) h[d] = a[d];
      return l.warn(p, h);
    }
    get proxyOf() {
      return this;
    }
  }
  return wo = o, o.default = o, wo;
}
var So, Kc;
function as() {
  if (Kc) return So;
  Kc = 1;
  let e = os();
  class t extends e {
    constructor(n) {
      n && typeof n.value < "u" && typeof n.value != "string" && (n = { ...n, value: String(n.value) }), super(n), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return So = t, t.default = t, So;
}
var Eo, Xc;
function Hb() {
  if (Xc) return Eo;
  Xc = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return Eo = { nanoid: (n = 21) => {
    let i = "", s = n;
    for (; s--; )
      i += e[Math.random() * 64 | 0];
    return i;
  }, customAlphabet: (n, i = 21) => (s = i) => {
    let o = "", c = s;
    for (; c--; )
      o += n[Math.random() * n.length | 0];
    return o;
  } }, Eo;
}
var Co, Jc;
function Ud() {
  if (Jc) return Co;
  Jc = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Qt, { existsSync: r, readFileSync: n } = Qt, { dirname: i, join: s } = Qt;
  function o(l) {
    return Buffer ? Buffer.from(l, "base64").toString() : window.atob(l);
  }
  class c {
    constructor(p, a) {
      if (a.map === !1) return;
      this.loadAnnotation(p), this.inline = this.startWith(this.annotation, "data:");
      let h = a.map ? a.map.prev : void 0, d = this.loadMap(a.from, h);
      !this.mapFile && a.from && (this.mapFile = a.from), this.mapFile && (this.root = i(this.mapFile)), d && (this.text = d);
    }
    consumer() {
      return this.consumerCache || (this.consumerCache = new e(this.text)), this.consumerCache;
    }
    decodeInline(p) {
      let a = /^data:application\/json;charset=utf-?8;base64,/, h = /^data:application\/json;base64,/, d = /^data:application\/json;charset=utf-?8,/, u = /^data:application\/json,/;
      if (d.test(p) || u.test(p))
        return decodeURIComponent(p.substr(RegExp.lastMatch.length));
      if (a.test(p) || h.test(p))
        return o(p.substr(RegExp.lastMatch.length));
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
      let a = p.match(/\/\*\s*# sourceMappingURL=/gm);
      if (!a) return;
      let h = p.lastIndexOf(a.pop()), d = p.indexOf("*/", h);
      h > -1 && d > -1 && (this.annotation = this.getAnnotationURL(p.substring(h, d)));
    }
    loadFile(p) {
      if (this.root = i(p), r(p))
        return this.mapFile = p, n(p, "utf-8").toString().trim();
    }
    loadMap(p, a) {
      if (a === !1) return !1;
      if (a) {
        if (typeof a == "string")
          return a;
        if (typeof a == "function") {
          let h = a(p);
          if (h) {
            let d = this.loadFile(h);
            if (!d)
              throw new Error(
                "Unable to load previous source map: " + h.toString()
              );
            return d;
          }
        } else {
          if (a instanceof e)
            return t.fromSourceMap(a).toString();
          if (a instanceof t)
            return a.toString();
          if (this.isMap(a))
            return JSON.stringify(a);
          throw new Error(
            "Unsupported previous source map format: " + a.toString()
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
    startWith(p, a) {
      return p ? p.substr(0, a.length) === a : !1;
    }
    withContent() {
      return !!(this.consumer().sourcesContent && this.consumer().sourcesContent.length > 0);
    }
  }
  return Co = c, c.default = c, Co;
}
var Mo, Zc;
function ls() {
  if (Zc) return Mo;
  Zc = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Qt, { fileURLToPath: r, pathToFileURL: n } = Qt, { isAbsolute: i, resolve: s } = Qt, { nanoid: o } = /* @__PURE__ */ Hb(), c = Qt, l = Ra(), p = Ud(), a = Symbol("fromOffsetCache"), h = !!(e && t), d = !!(s && i);
  class u {
    constructor(f, y = {}) {
      if (f === null || typeof f > "u" || typeof f == "object" && !f.toString)
        throw new Error(`PostCSS received ${f} instead of CSS string`);
      if (this.css = f.toString(), this.css[0] === "\uFEFF" || this.css[0] === "￾" ? (this.hasBOM = !0, this.css = this.css.slice(1)) : this.hasBOM = !1, y.from && (!d || /^\w+:\/\//.test(y.from) || i(y.from) ? this.file = y.from : this.file = s(y.from)), d && h) {
        let C = new p(this.css, y);
        if (C.text) {
          this.map = C;
          let k = C.consumer().file;
          !this.file && k && (this.file = this.mapResolve(k));
        }
      }
      this.file || (this.id = "<input css " + o(6) + ">"), this.map && (this.map.file = this.from);
    }
    error(f, y, C, k = {}) {
      let b, A, S;
      if (y && typeof y == "object") {
        let R = y, I = C;
        if (typeof R.offset == "number") {
          let F = this.fromOffset(R.offset);
          y = F.line, C = F.col;
        } else
          y = R.line, C = R.column;
        if (typeof I.offset == "number") {
          let F = this.fromOffset(I.offset);
          A = F.line, S = F.col;
        } else
          A = I.line, S = I.column;
      } else if (!C) {
        let R = this.fromOffset(y);
        y = R.line, C = R.col;
      }
      let x = this.origin(y, C, A, S);
      return x ? b = new l(
        f,
        x.endLine === void 0 ? x.line : { column: x.column, line: x.line },
        x.endLine === void 0 ? x.column : { column: x.endColumn, line: x.endLine },
        x.source,
        x.file,
        k.plugin
      ) : b = new l(
        f,
        A === void 0 ? y : { column: C, line: y },
        A === void 0 ? C : { column: S, line: A },
        this.css,
        this.file,
        k.plugin
      ), b.input = { column: C, endColumn: S, endLine: A, line: y, source: this.css }, this.file && (n && (b.input.url = n(this.file).toString()), b.input.file = this.file), b;
    }
    fromOffset(f) {
      let y, C;
      if (this[a])
        C = this[a];
      else {
        let b = this.css.split(`
`);
        C = new Array(b.length);
        let A = 0;
        for (let S = 0, x = b.length; S < x; S++)
          C[S] = A, A += b[S].length + 1;
        this[a] = C;
      }
      y = C[C.length - 1];
      let k = 0;
      if (f >= y)
        k = C.length - 1;
      else {
        let b = C.length - 2, A;
        for (; k < b; )
          if (A = k + (b - k >> 1), f < C[A])
            b = A - 1;
          else if (f >= C[A + 1])
            k = A + 1;
          else {
            k = A;
            break;
          }
      }
      return {
        col: f - C[k] + 1,
        line: k + 1
      };
    }
    mapResolve(f) {
      return /^\w+:\/\//.test(f) ? f : s(this.map.consumer().sourceRoot || this.map.root || ".", f);
    }
    origin(f, y, C, k) {
      if (!this.map) return !1;
      let b = this.map.consumer(), A = b.originalPositionFor({ column: y, line: f });
      if (!A.source) return !1;
      let S;
      typeof C == "number" && (S = b.originalPositionFor({ column: k, line: C }));
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
      let I = b.sourceContentFor(A.source);
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
  return Mo = u, u.default = u, c && c.registerInput && c.registerInput(u), Mo;
}
var Ro, Qc;
function Bd() {
  if (Qc) return Ro;
  Qc = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Qt, { dirname: r, relative: n, resolve: i, sep: s } = Qt, { pathToFileURL: o } = Qt, c = ls(), l = !!(e && t), p = !!(r && i && n && s);
  class a {
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
      }, y, C;
      this.stringify(this.root, (k, b, A) => {
        if (this.css += k, b && A !== "end" && (f.generated.line = d, f.generated.column = u - 1, b.source && b.source.start ? (f.source = this.sourcePath(b), f.original.line = b.source.start.line, f.original.column = b.source.start.column - 1, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, this.map.addMapping(f))), y = k.match(/\n/g), y ? (d += y.length, C = k.lastIndexOf(`
`), u = k.length - C) : u += k.length, b && A !== "start") {
          let S = b.parent || { raws: {} };
          (!(b.type === "decl" || b.type === "atrule" && !b.nodes) || b !== S.last || S.raws.semicolon) && (b.source && b.source.end ? (f.source = this.sourcePath(b), f.original.line = b.source.end.line, f.original.column = b.source.end.column - 1, f.generated.line = d, f.generated.column = u - 2, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, f.generated.line = d, f.generated.column = u - 1, this.map.addMapping(f)));
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
      if (o) {
        let m = o(d).toString();
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
  return Ro = a, Ro;
}
var To, eu;
function cs() {
  if (eu) return To;
  eu = 1;
  let e = os();
  class t extends e {
    constructor(n) {
      super(n), this.type = "comment";
    }
  }
  return To = t, t.default = t, To;
}
var Ao, tu;
function rn() {
  if (tu) return Ao;
  tu = 1;
  let { isClean: e, my: t } = Ta(), r = as(), n = cs(), i = os(), s, o, c, l;
  function p(d) {
    return d.map((u) => (u.nodes && (u.nodes = p(u.nodes)), delete u.source, u));
  }
  function a(d) {
    if (d[e] = !1, d.proxyOf.nodes)
      for (let u of d.proxyOf.nodes)
        a(u);
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
            ...f.map((y) => typeof y == "function" ? (C, k) => y(C.toProxy(), k) : y)
          ) : m === "every" || m === "some" ? (f) => u[m](
            (y, ...C) => f(y.toProxy(), ...C)
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
      for (let k of y) this.proxyOf.nodes.splice(f + 1, 0, k);
      let C;
      for (let k in this.indexes)
        C = this.indexes[k], f < C && (this.indexes[k] = C + y.length);
      return this.markDirty(), this;
    }
    insertBefore(u, m) {
      let f = this.index(u), y = f === 0 ? "prepend" : !1, C = this.normalize(m, this.proxyOf.nodes[f], y).reverse();
      f = this.index(u);
      for (let b of C) this.proxyOf.nodes.splice(f, 0, b);
      let k;
      for (let b in this.indexes)
        k = this.indexes[b], f <= k && (this.indexes[b] = k + C.length);
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
        u = [new o(u)];
      else if (u.name)
        u = [new c(u)];
      else if (u.text)
        u = [new n(u)];
      else
        throw new Error("Unknown node type in node creation");
      return u.map((y) => (y[t] || h.rebuild(y), y = y.proxyOf, y.parent && y.parent.removeChild(y), y[e] && a(y), typeof y.raws.before > "u" && m && typeof m.raws.before < "u" && (y.raws.before = m.raws.before.replace(/\S/g, "")), y.parent = this.proxyOf, y));
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
        } catch (C) {
          throw m.addToError(C);
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
    o = d;
  }, h.registerAtRule = (d) => {
    c = d;
  }, h.registerRoot = (d) => {
    l = d;
  }, Ao = h, h.default = h, h.rebuild = (d) => {
    d.type === "atrule" ? Object.setPrototypeOf(d, c.prototype) : d.type === "rule" ? Object.setPrototypeOf(d, o.prototype) : d.type === "decl" ? Object.setPrototypeOf(d, r.prototype) : d.type === "comment" ? Object.setPrototypeOf(d, n.prototype) : d.type === "root" && Object.setPrototypeOf(d, l.prototype), d[t] = !0, d.nodes && d.nodes.forEach((u) => {
      h.rebuild(u);
    });
  }, Ao;
}
var Lo, ru;
function Aa() {
  if (ru) return Lo;
  ru = 1;
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
  }, Lo = n, n.default = n, Lo;
}
var _o, nu;
function qd() {
  if (nu) return _o;
  nu = 1;
  let e = {};
  return _o = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, _o;
}
var Io, iu;
function Wd() {
  if (iu) return Io;
  iu = 1;
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
  return Io = e, e.default = e, Io;
}
var Oo, su;
function La() {
  if (su) return Oo;
  su = 1;
  let e = Wd();
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
  return Oo = t, t.default = t, Oo;
}
var No, ou;
function Yb() {
  if (ou) return No;
  ou = 1;
  const e = 39, t = 34, r = 92, n = 47, i = 10, s = 32, o = 12, c = 9, l = 13, p = 91, a = 93, h = 40, d = 41, u = 123, m = 125, f = 59, y = 42, C = 58, k = 64, b = /[\t\n\f\r "#'()/;[\\\]{}]/g, A = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, S = /.[\r\n"'(/\\]/, x = /[\da-f]/i;
  return No = function(I, F = {}) {
    let z = I.css.valueOf(), Q = F.ignoreErrors, B, N, De, Je, fe, pe, Re, Ue, Te, ke, Ge = z.length, P = 0, Y = [], oe = [];
    function re() {
      return P;
    }
    function ce(K) {
      throw I.error("Unclosed " + K, P);
    }
    function Ae() {
      return oe.length === 0 && P >= Ge;
    }
    function Be(K) {
      if (oe.length) return oe.pop();
      if (P >= Ge) return;
      let se = K ? K.ignoreUnclosed : !1;
      switch (B = z.charCodeAt(P), B) {
        case i:
        case s:
        case c:
        case l:
        case o: {
          N = P;
          do
            N += 1, B = z.charCodeAt(N);
          while (B === s || B === i || B === c || B === l || B === o);
          ke = ["space", z.slice(P, N)], P = N - 1;
          break;
        }
        case p:
        case a:
        case u:
        case m:
        case C:
        case f:
        case d: {
          let ge = String.fromCharCode(B);
          ke = [ge, ge, P];
          break;
        }
        case h: {
          if (Ue = Y.length ? Y.pop()[1] : "", Te = z.charCodeAt(P + 1), Ue === "url" && Te !== e && Te !== t && Te !== s && Te !== i && Te !== c && Te !== o && Te !== l) {
            N = P;
            do {
              if (pe = !1, N = z.indexOf(")", N + 1), N === -1)
                if (Q || se) {
                  N = P;
                  break;
                } else
                  ce("bracket");
              for (Re = N; z.charCodeAt(Re - 1) === r; )
                Re -= 1, pe = !pe;
            } while (pe);
            ke = ["brackets", z.slice(P, N + 1), P, N], P = N;
          } else
            N = z.indexOf(")", P + 1), Je = z.slice(P, N + 1), N === -1 || S.test(Je) ? ke = ["(", "(", P] : (ke = ["brackets", Je, P, N], P = N);
          break;
        }
        case e:
        case t: {
          De = B === e ? "'" : '"', N = P;
          do {
            if (pe = !1, N = z.indexOf(De, N + 1), N === -1)
              if (Q || se) {
                N = P + 1;
                break;
              } else
                ce("string");
            for (Re = N; z.charCodeAt(Re - 1) === r; )
              Re -= 1, pe = !pe;
          } while (pe);
          ke = ["string", z.slice(P, N + 1), P, N], P = N;
          break;
        }
        case k: {
          b.lastIndex = P + 1, b.test(z), b.lastIndex === 0 ? N = z.length - 1 : N = b.lastIndex - 2, ke = ["at-word", z.slice(P, N + 1), P, N], P = N;
          break;
        }
        case r: {
          for (N = P, fe = !0; z.charCodeAt(N + 1) === r; )
            N += 1, fe = !fe;
          if (B = z.charCodeAt(N + 1), fe && B !== n && B !== s && B !== i && B !== c && B !== l && B !== o && (N += 1, x.test(z.charAt(N)))) {
            for (; x.test(z.charAt(N + 1)); )
              N += 1;
            z.charCodeAt(N + 1) === s && (N += 1);
          }
          ke = ["word", z.slice(P, N + 1), P, N], P = N;
          break;
        }
        default: {
          B === n && z.charCodeAt(P + 1) === y ? (N = z.indexOf("*/", P + 2) + 1, N === 0 && (Q || se ? N = z.length : ce("comment")), ke = ["comment", z.slice(P, N + 1), P, N], P = N) : (A.lastIndex = P + 1, A.test(z), A.lastIndex === 0 ? N = z.length - 1 : N = A.lastIndex - 2, ke = ["word", z.slice(P, N + 1), P, N], Y.push(ke), P = N);
          break;
        }
      }
      return P++, ke;
    }
    function Se(K) {
      oe.push(K);
    }
    return {
      back: Se,
      endOfFile: Ae,
      nextToken: Be,
      position: re
    };
  }, No;
}
var Po, au;
function _a() {
  if (au) return Po;
  au = 1;
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
  return Po = t, t.default = t, e.registerAtRule(t), Po;
}
var zo, lu;
function ni() {
  if (lu) return zo;
  lu = 1;
  let e = rn(), t, r;
  class n extends e {
    constructor(s) {
      super(s), this.type = "root", this.nodes || (this.nodes = []);
    }
    normalize(s, o, c) {
      let l = super.normalize(s);
      if (o) {
        if (c === "prepend")
          this.nodes.length > 1 ? o.raws.before = this.nodes[1].raws.before : delete o.raws.before;
        else if (this.first !== o)
          for (let p of l)
            p.raws.before = o.raws.before;
      }
      return l;
    }
    removeChild(s, o) {
      let c = this.index(s);
      return !o && c === 0 && this.nodes.length > 1 && (this.nodes[1].raws.before = this.nodes[c].raws.before), super.removeChild(s);
    }
    toResult(s = {}) {
      return new t(new r(), this, s).stringify();
    }
  }
  return n.registerLazyResult = (i) => {
    t = i;
  }, n.registerProcessor = (i) => {
    r = i;
  }, zo = n, n.default = n, e.registerRoot(n), zo;
}
var $o, cu;
function jd() {
  if (cu) return $o;
  cu = 1;
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
      let i = [], s = "", o = !1, c = 0, l = !1, p = "", a = !1;
      for (let h of t)
        a ? a = !1 : h === "\\" ? a = !0 : l ? h === p && (l = !1) : h === '"' || h === "'" ? (l = !0, p = h) : h === "(" ? c += 1 : h === ")" ? c > 0 && (c -= 1) : c === 0 && r.includes(h) && (o = !0), o ? (s !== "" && i.push(s.trim()), s = "", o = !1) : s += h;
      return (n || s !== "") && i.push(s.trim()), i;
    }
  };
  return $o = e, e.default = e, $o;
}
var Do, uu;
function Ia() {
  if (uu) return Do;
  uu = 1;
  let e = rn(), t = jd();
  class r extends e {
    constructor(i) {
      super(i), this.type = "rule", this.nodes || (this.nodes = []);
    }
    get selectors() {
      return t.comma(this.selector);
    }
    set selectors(i) {
      let s = this.selector ? this.selector.match(/,\s*/) : null, o = s ? s[0] : "," + this.raw("between", "beforeOpen");
      this.selector = i.join(o);
    }
  }
  return Do = r, r.default = r, e.registerRule(r), Do;
}
var Fo, du;
function Vb() {
  if (du) return Fo;
  du = 1;
  let e = as(), t = Yb(), r = cs(), n = _a(), i = ni(), s = Ia();
  const o = {
    empty: !0,
    space: !0
  };
  function c(p) {
    for (let a = p.length - 1; a >= 0; a--) {
      let h = p[a], d = h[3] || h[2];
      if (d) return d;
    }
  }
  class l {
    constructor(a) {
      this.input = a, this.root = new i(), this.current = this.root, this.spaces = "", this.semicolon = !1, this.createTokenizer(), this.root.source = { input: a, start: { column: 1, line: 1, offset: 0 } };
    }
    atrule(a) {
      let h = new n();
      h.name = a[1].slice(1), h.name === "" && this.unnamedAtrule(h, a), this.init(h, a[2]);
      let d, u, m, f = !1, y = !1, C = [], k = [];
      for (; !this.tokenizer.endOfFile(); ) {
        if (a = this.tokenizer.nextToken(), d = a[0], d === "(" || d === "[" ? k.push(d === "(" ? ")" : "]") : d === "{" && k.length > 0 ? k.push("}") : d === k[k.length - 1] && k.pop(), k.length === 0)
          if (d === ";") {
            h.source.end = this.getPosition(a[2]), h.source.end.offset++, this.semicolon = !0;
            break;
          } else if (d === "{") {
            y = !0;
            break;
          } else if (d === "}") {
            if (C.length > 0) {
              for (m = C.length - 1, u = C[m]; u && u[0] === "space"; )
                u = C[--m];
              u && (h.source.end = this.getPosition(u[3] || u[2]), h.source.end.offset++);
            }
            this.end(a);
            break;
          } else
            C.push(a);
        else
          C.push(a);
        if (this.tokenizer.endOfFile()) {
          f = !0;
          break;
        }
      }
      h.raws.between = this.spacesAndCommentsFromEnd(C), C.length ? (h.raws.afterName = this.spacesAndCommentsFromStart(C), this.raw(h, "params", C), f && (a = C[C.length - 1], h.source.end = this.getPosition(a[3] || a[2]), h.source.end.offset++, this.spaces = h.raws.between, h.raws.between = "")) : (h.raws.afterName = "", h.params = ""), y && (h.nodes = [], this.current = h);
    }
    checkMissedSemicolon(a) {
      let h = this.colon(a);
      if (h === !1) return;
      let d = 0, u;
      for (let m = h - 1; m >= 0 && (u = a[m], !(u[0] !== "space" && (d += 1, d === 2))); m--)
        ;
      throw this.input.error(
        "Missed semicolon",
        u[0] === "word" ? u[3] + 1 : u[2]
      );
    }
    colon(a) {
      let h = 0, d, u, m;
      for (let [f, y] of a.entries()) {
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
    comment(a) {
      let h = new r();
      this.init(h, a[2]), h.source.end = this.getPosition(a[3] || a[2]), h.source.end.offset++;
      let d = a[1].slice(2, -2);
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
    decl(a, h) {
      let d = new e();
      this.init(d, a[0][2]);
      let u = a[a.length - 1];
      for (u[0] === ";" && (this.semicolon = !0, a.pop()), d.source.end = this.getPosition(
        u[3] || u[2] || c(a)
      ), d.source.end.offset++; a[0][0] !== "word"; )
        a.length === 1 && this.unknownWord(a), d.raws.before += a.shift()[1];
      for (d.source.start = this.getPosition(a[0][2]), d.prop = ""; a.length; ) {
        let k = a[0][0];
        if (k === ":" || k === "space" || k === "comment")
          break;
        d.prop += a.shift()[1];
      }
      d.raws.between = "";
      let m;
      for (; a.length; )
        if (m = a.shift(), m[0] === ":") {
          d.raws.between += m[1];
          break;
        } else
          m[0] === "word" && /\w/.test(m[1]) && this.unknownWord([m]), d.raws.between += m[1];
      (d.prop[0] === "_" || d.prop[0] === "*") && (d.raws.before += d.prop[0], d.prop = d.prop.slice(1));
      let f = [], y;
      for (; a.length && (y = a[0][0], !(y !== "space" && y !== "comment")); )
        f.push(a.shift());
      this.precheckMissedSemicolon(a);
      for (let k = a.length - 1; k >= 0; k--) {
        if (m = a[k], m[1].toLowerCase() === "!important") {
          d.important = !0;
          let b = this.stringFrom(a, k);
          b = this.spacesFromEnd(a) + b, b !== " !important" && (d.raws.important = b);
          break;
        } else if (m[1].toLowerCase() === "important") {
          let b = a.slice(0), A = "";
          for (let S = k; S > 0; S--) {
            let x = b[S][0];
            if (A.trim().indexOf("!") === 0 && x !== "space")
              break;
            A = b.pop()[1] + A;
          }
          A.trim().indexOf("!") === 0 && (d.important = !0, d.raws.important = A, a = b);
        }
        if (m[0] !== "space" && m[0] !== "comment")
          break;
      }
      a.some((k) => k[0] !== "space" && k[0] !== "comment") && (d.raws.between += f.map((k) => k[1]).join(""), f = []), this.raw(d, "value", f.concat(a), h), d.value.includes(":") && !h && this.checkMissedSemicolon(a);
    }
    doubleColon(a) {
      throw this.input.error(
        "Double colon",
        { offset: a[2] },
        { offset: a[2] + a[1].length }
      );
    }
    emptyRule(a) {
      let h = new s();
      this.init(h, a[2]), h.selector = "", h.raws.between = "", this.current = h;
    }
    end(a) {
      this.current.nodes && this.current.nodes.length && (this.current.raws.semicolon = this.semicolon), this.semicolon = !1, this.current.raws.after = (this.current.raws.after || "") + this.spaces, this.spaces = "", this.current.parent ? (this.current.source.end = this.getPosition(a[2]), this.current.source.end.offset++, this.current = this.current.parent) : this.unexpectedClose(a);
    }
    endFile() {
      this.current.parent && this.unclosedBlock(), this.current.nodes && this.current.nodes.length && (this.current.raws.semicolon = this.semicolon), this.current.raws.after = (this.current.raws.after || "") + this.spaces, this.root.source.end = this.getPosition(this.tokenizer.position());
    }
    freeSemicolon(a) {
      if (this.spaces += a[1], this.current.nodes) {
        let h = this.current.nodes[this.current.nodes.length - 1];
        h && h.type === "rule" && !h.raws.ownSemicolon && (h.raws.ownSemicolon = this.spaces, this.spaces = "");
      }
    }
    // Helpers
    getPosition(a) {
      let h = this.input.fromOffset(a);
      return {
        column: h.col,
        line: h.line,
        offset: a
      };
    }
    init(a, h) {
      this.current.push(a), a.source = {
        input: this.input,
        start: this.getPosition(h)
      }, a.raws.before = this.spaces, this.spaces = "", a.type !== "comment" && (this.semicolon = !1);
    }
    other(a) {
      let h = !1, d = null, u = !1, m = null, f = [], y = a[1].startsWith("--"), C = [], k = a;
      for (; k; ) {
        if (d = k[0], C.push(k), d === "(" || d === "[")
          m || (m = k), f.push(d === "(" ? ")" : "]");
        else if (y && u && d === "{")
          m || (m = k), f.push("}");
        else if (f.length === 0)
          if (d === ";")
            if (u) {
              this.decl(C, y);
              return;
            } else
              break;
          else if (d === "{") {
            this.rule(C);
            return;
          } else if (d === "}") {
            this.tokenizer.back(C.pop()), h = !0;
            break;
          } else d === ":" && (u = !0);
        else d === f[f.length - 1] && (f.pop(), f.length === 0 && (m = null));
        k = this.tokenizer.nextToken();
      }
      if (this.tokenizer.endOfFile() && (h = !0), f.length > 0 && this.unclosedBracket(m), h && u) {
        if (!y)
          for (; C.length && (k = C[C.length - 1][0], !(k !== "space" && k !== "comment")); )
            this.tokenizer.back(C.pop());
        this.decl(C, y);
      } else
        this.unknownWord(C);
    }
    parse() {
      let a;
      for (; !this.tokenizer.endOfFile(); )
        switch (a = this.tokenizer.nextToken(), a[0]) {
          case "space":
            this.spaces += a[1];
            break;
          case ";":
            this.freeSemicolon(a);
            break;
          case "}":
            this.end(a);
            break;
          case "comment":
            this.comment(a);
            break;
          case "at-word":
            this.atrule(a);
            break;
          case "{":
            this.emptyRule(a);
            break;
          default:
            this.other(a);
            break;
        }
      this.endFile();
    }
    precheckMissedSemicolon() {
    }
    raw(a, h, d, u) {
      let m, f, y = d.length, C = "", k = !0, b, A;
      for (let S = 0; S < y; S += 1)
        m = d[S], f = m[0], f === "space" && S === y - 1 && !u ? k = !1 : f === "comment" ? (A = d[S - 1] ? d[S - 1][0] : "empty", b = d[S + 1] ? d[S + 1][0] : "empty", !o[A] && !o[b] ? C.slice(-1) === "," ? k = !1 : C += m[1] : k = !1) : C += m[1];
      if (!k) {
        let S = d.reduce((x, R) => x + R[1], "");
        a.raws[h] = { raw: S, value: C };
      }
      a[h] = C;
    }
    rule(a) {
      a.pop();
      let h = new s();
      this.init(h, a[0][2]), h.raws.between = this.spacesAndCommentsFromEnd(a), this.raw(h, "selector", a), this.current = h;
    }
    spacesAndCommentsFromEnd(a) {
      let h, d = "";
      for (; a.length && (h = a[a.length - 1][0], !(h !== "space" && h !== "comment")); )
        d = a.pop()[1] + d;
      return d;
    }
    // Errors
    spacesAndCommentsFromStart(a) {
      let h, d = "";
      for (; a.length && (h = a[0][0], !(h !== "space" && h !== "comment")); )
        d += a.shift()[1];
      return d;
    }
    spacesFromEnd(a) {
      let h, d = "";
      for (; a.length && (h = a[a.length - 1][0], h === "space"); )
        d = a.pop()[1] + d;
      return d;
    }
    stringFrom(a, h) {
      let d = "";
      for (let u = h; u < a.length; u++)
        d += a[u][1];
      return a.splice(h, a.length - h), d;
    }
    unclosedBlock() {
      let a = this.current.source.start;
      throw this.input.error("Unclosed block", a.line, a.column);
    }
    unclosedBracket(a) {
      throw this.input.error(
        "Unclosed bracket",
        { offset: a[2] },
        { offset: a[2] + 1 }
      );
    }
    unexpectedClose(a) {
      throw this.input.error(
        "Unexpected }",
        { offset: a[2] },
        { offset: a[2] + 1 }
      );
    }
    unknownWord(a) {
      throw this.input.error(
        "Unknown word",
        { offset: a[0][2] },
        { offset: a[0][2] + a[0][1].length }
      );
    }
    unnamedAtrule(a, h) {
      throw this.input.error(
        "At-rule without name",
        { offset: h[2] },
        { offset: h[2] + h[1].length }
      );
    }
  }
  return Fo = l, Fo;
}
var Uo, pu;
function Oa() {
  if (pu) return Uo;
  pu = 1;
  let e = rn(), t = Vb(), r = ls();
  function n(i, s) {
    let o = new r(i, s), c = new t(o);
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
  return Uo = n, n.default = n, e.registerParse(n), Uo;
}
var Bo, hu;
function Hd() {
  if (hu) return Bo;
  hu = 1;
  let { isClean: e, my: t } = Ta(), r = Bd(), n = ss(), i = rn(), s = Aa(), o = qd(), c = La(), l = Oa(), p = ni();
  const a = {
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
  function m(A) {
    return typeof A == "object" && typeof A.then == "function";
  }
  function f(A) {
    let S = !1, x = a[A.type];
    return A.type === "decl" ? S = A.prop.toLowerCase() : A.type === "atrule" && (S = A.name.toLowerCase()), S && A.append ? [
      x,
      x + "-" + S,
      u,
      x + "Exit",
      x + "Exit-" + S
    ] : S ? [x, x + "-" + S, x + "Exit", x + "Exit-" + S] : A.append ? [x, u, x + "Exit"] : [x, x + "Exit"];
  }
  function y(A) {
    let S;
    return A.type === "document" ? S = ["Document", u, "DocumentExit"] : A.type === "root" ? S = ["Root", u, "RootExit"] : S = f(A), {
      eventIndex: 0,
      events: S,
      iterator: 0,
      node: A,
      visitorIndex: 0,
      visitors: []
    };
  }
  function C(A) {
    return A[e] = !1, A.nodes && A.nodes.forEach((S) => C(S)), A;
  }
  let k = {};
  class b {
    constructor(S, x, R) {
      this.stringified = !1, this.processed = !1;
      let I;
      if (typeof x == "object" && x !== null && (x.type === "root" || x.type === "document"))
        I = C(x);
      else if (x instanceof b || x instanceof c)
        I = C(x.root), x.map && (typeof R.map > "u" && (R.map = {}), R.map.inline || (R.map.inline = !1), R.map.prev = x.map);
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
      this.result = new c(S, I, R), this.helpers = { ...k, postcss: k, result: this.result }, this.plugins = this.processor.plugins.map((F) => typeof F == "object" && F.prepare ? { ...F, ...F.prepare(this.result) } : F);
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
          let I = R.postcssPlugin, F = R.postcssVersion, z = this.result.processor.version, Q = F.split("."), B = z.split(".");
          (Q[0] !== B[0] || parseInt(Q[1]) > parseInt(B[1])) && console.error(
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
      return process.env.NODE_ENV !== "production" && ("from" in this.opts || o(
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
        } catch (B) {
          throw this.handleError(B, R);
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
  return b.registerPostcss = (A) => {
    k = A;
  }, Bo = b, b.default = b, p.registerLazyResult(b), s.registerLazyResult(b), Bo;
}
var qo, fu;
function Gb() {
  if (fu) return qo;
  fu = 1;
  let e = Bd(), t = ss(), r = qd(), n = Oa();
  const i = La();
  class s {
    constructor(c, l, p) {
      l = l.toString(), this.stringified = !1, this._processor = c, this._css = l, this._opts = p, this._map = void 0;
      let a, h = t;
      this.result = new i(this._processor, a, this._opts), this.result.css = l;
      let d = this;
      Object.defineProperty(this.result, "root", {
        get() {
          return d.root;
        }
      });
      let u = new e(h, a, this._opts, l);
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
  return qo = s, s.default = s, qo;
}
var Wo, mu;
function Kb() {
  if (mu) return Wo;
  mu = 1;
  let e = Gb(), t = Hd(), r = Aa(), n = ni();
  class i {
    constructor(o = []) {
      this.version = "8.4.38", this.plugins = this.normalize(o);
    }
    normalize(o) {
      let c = [];
      for (let l of o)
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
    process(o, c = {}) {
      return !this.plugins.length && !c.parser && !c.stringifier && !c.syntax ? new e(this, o, c) : new t(this, o, c);
    }
    use(o) {
      return this.plugins = this.plugins.concat(this.normalize([o])), this;
    }
  }
  return Wo = i, i.default = i, n.registerProcessor(i), r.registerProcessor(i), Wo;
}
var jo, gu;
function Xb() {
  if (gu) return jo;
  gu = 1;
  let e = as(), t = Ud(), r = cs(), n = _a(), i = ls(), s = ni(), o = Ia();
  function c(l, p) {
    if (Array.isArray(l)) return l.map((d) => c(d));
    let { inputs: a, ...h } = l;
    if (a) {
      p = [];
      for (let d of a) {
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
      return new o(h);
    if (h.type === "comment")
      return new r(h);
    if (h.type === "atrule")
      return new n(h);
    throw new Error("Unknown node type: " + l.type);
  }
  return jo = c, c.default = c, jo;
}
var Ho, yu;
function Jb() {
  if (yu) return Ho;
  yu = 1;
  let e = Ra(), t = as(), r = Hd(), n = rn(), i = Kb(), s = ss(), o = Xb(), c = Aa(), l = Wd(), p = cs(), a = _a(), h = La(), d = ls(), u = Oa(), m = jd(), f = Ia(), y = ni(), C = os();
  function k(...b) {
    return b.length === 1 && Array.isArray(b[0]) && (b = b[0]), new i(b);
  }
  return k.plugin = function(A, S) {
    let x = !1;
    function R(...F) {
      console && console.warn && !x && (x = !0, console.warn(
        A + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`
      ), process.env.LANG && process.env.LANG.startsWith("cn") && console.warn(
        A + `: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`
      ));
      let z = S(...F);
      return z.postcssPlugin = A, z.postcssVersion = new i().version, z;
    }
    let I;
    return Object.defineProperty(R, "postcss", {
      get() {
        return I || (I = R()), I;
      }
    }), R.process = function(F, z, Q) {
      return k([R(Q)]).process(F, z);
    }, R;
  }, k.stringify = s, k.parse = u, k.fromJSON = o, k.list = m, k.comment = (b) => new p(b), k.atRule = (b) => new a(b), k.decl = (b) => new t(b), k.rule = (b) => new f(b), k.root = (b) => new y(b), k.document = (b) => new c(b), k.CssSyntaxError = e, k.Declaration = t, k.Container = n, k.Processor = i, k.Document = c, k.Comment = p, k.Warning = l, k.AtRule = a, k.Result = h, k.Input = d, k.Rule = f, k.Root = y, k.Node = C, r.registerPostcss(k), Ho = k, k.default = k, Ho;
}
var Zb = Jb();
const Ve = /* @__PURE__ */ Ub(Zb);
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
class Na {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  constructor(...t) {
    Ft(this, "parentElement", null), Ft(this, "parentNode", null), Ft(this, "ownerDocument"), Ft(this, "firstChild", null), Ft(this, "lastChild", null), Ft(this, "previousSibling", null), Ft(this, "nextSibling", null), Ft(this, "ELEMENT_NODE", 1), Ft(this, "TEXT_NODE", 3), Ft(this, "nodeType"), Ft(this, "nodeName"), Ft(this, "RRNodeType");
  }
  get childNodes() {
    const t = [];
    let r = this.firstChild;
    for (; r; )
      t.push(r), r = r.nextSibling;
    return t;
  }
  contains(t) {
    if (t instanceof Na) {
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
const bu = {
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
}, ku = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, Ti = {}, Yd = {}, Qb = () => !!globalThis.Zone;
function Pa(e) {
  if (Ti[e])
    return Ti[e];
  const t = globalThis[e], r = t.prototype, n = e in bu ? bu[e] : void 0, i = !!(n && // @ts-expect-error 2345
  n.every(
    (c) => {
      var l, p;
      return !!((p = (l = Object.getOwnPropertyDescriptor(r, c)) == null ? void 0 : l.get) != null && p.toString().includes("[native code]"));
    }
  )), s = e in ku ? ku[e] : void 0, o = !!(s && s.every(
    // @ts-expect-error 2345
    (c) => {
      var l;
      return typeof r[c] == "function" && ((l = r[c]) == null ? void 0 : l.toString().includes("[native code]"));
    }
  ));
  if (i && o && !Qb())
    return Ti[e] = t.prototype, t.prototype;
  try {
    const c = document.createElement("iframe");
    c.style.display = "none", document.body.appendChild(c);
    const l = c.contentWindow;
    if (!l) return t.prototype;
    const p = l[e].prototype;
    if (!p)
      return c.remove(), r;
    const a = navigator.userAgent;
    return a.includes("Safari") && !a.includes("Chrome") ? (c.classList.add("rr-block"), c.setAttribute("__rrwebUntaintedMutationObserver", ""), Yd[e] = () => c.remove()) : c.remove(), Ti[e] = p;
  } catch {
    return r;
  }
}
const Yo = {};
function kr(e, t, r) {
  var n;
  const i = `${e}.${String(r)}`;
  if (Yo[i])
    return Yo[i].call(
      t
    );
  const s = Pa(e), o = (n = Object.getOwnPropertyDescriptor(
    s,
    r
  )) == null ? void 0 : n.get;
  return o ? (Yo[i] = o, o.call(t)) : t[r];
}
const Vo = {};
function Vd(e, t, r) {
  const n = `${e}.${String(r)}`;
  if (Vo[n])
    return Vo[n].bind(
      t
    );
  const s = Pa(e)[r];
  return typeof s != "function" ? t[r] : (Vo[n] = s, s.bind(t));
}
function ek(e) {
  return kr("Node", e, "ownerDocument");
}
function tk(e) {
  return kr("Node", e, "childNodes");
}
function rk(e) {
  return kr("Node", e, "parentNode");
}
function nk(e) {
  return kr("Node", e, "parentElement");
}
function ik(e) {
  return kr("Node", e, "textContent");
}
function sk(e, t) {
  return Vd("Node", e, "contains")(t);
}
function ok(e) {
  return Vd("Node", e, "getRootNode")();
}
function ak(e) {
  return !e || !("host" in e) ? null : kr("ShadowRoot", e, "host");
}
function lk(e) {
  return e.styleSheets;
}
function ck(e) {
  return !e || !("shadowRoot" in e) ? null : kr("Element", e, "shadowRoot");
}
function uk(e, t) {
  return kr("Element", e, "querySelector")(t);
}
function dk(e, t) {
  return kr("Element", e, "querySelectorAll")(t);
}
function Gd() {
  return [
    Pa("MutationObserver").constructor,
    Yd.MutationObserver ?? (() => {
    })
  ];
}
let Qn = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (Qn = () => (/* @__PURE__ */ new Date()).getTime());
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
const be = {
  ownerDocument: ek,
  childNodes: tk,
  parentNode: rk,
  parentElement: nk,
  textContent: ik,
  contains: sk,
  getRootNode: ok,
  host: ak,
  styleSheets: lk,
  shadowRoot: ck,
  querySelector: uk,
  querySelectorAll: dk,
  nowTimestamp: Qn,
  mutationObserverCtor: Gd,
  patch: nn
};
function kt(e, t, r = document) {
  const n = { capture: !0, passive: !0 };
  return r.addEventListener(e, t, n), () => r.removeEventListener(e, t, n);
}
const vn = `Please stop import mirror directly. Instead of that,\r
now you can use replayer.getMirror() to access the mirror instance of a replayer,\r
or you can use record.mirror to access the mirror instance during recording.`;
let vu = {
  map: {},
  getId() {
    return console.error(vn), -1;
  },
  getNode() {
    return console.error(vn), null;
  },
  removeNodeFromMap() {
    console.error(vn);
  },
  has() {
    return console.error(vn), !1;
  },
  reset() {
    console.error(vn);
  }
};
typeof window < "u" && window.Proxy && window.Reflect && (vu = new Proxy(vu, {
  get(e, t, r) {
    return t === "map" && console.error(vn), Reflect.get(e, t, r);
  }
}));
function ei(e, t, r = {}) {
  let n = null, i = 0;
  return function(...s) {
    const o = Date.now();
    !i && r.leading === !1 && (i = o);
    const c = t - (o - i), l = this;
    c <= 0 || c > t ? (n && (clearTimeout(n), n = null), i = o, e.apply(l, s)) : !n && r.trailing !== !1 && (n = setTimeout(() => {
      i = r.leading === !1 ? 0 : Date.now(), n = null, e.apply(l, s);
    }, c));
  };
}
function us(e, t, r, n, i = window) {
  const s = i.Object.getOwnPropertyDescriptor(e, t);
  return i.Object.defineProperty(
    e,
    t,
    n ? r : {
      set(o) {
        setTimeout(() => {
          r.set.call(this, o);
        }, 0), s && s.set && s.set.call(this, o);
      }
    }
  ), () => us(e, t, s || {}, !0);
}
function Kd(e) {
  var t, r, n, i;
  const s = e.document;
  return {
    left: s.scrollingElement ? s.scrollingElement.scrollLeft : e.pageXOffset !== void 0 ? e.pageXOffset : s.documentElement.scrollLeft || (s == null ? void 0 : s.body) && ((t = be.parentElement(s.body)) == null ? void 0 : t.scrollLeft) || ((r = s == null ? void 0 : s.body) == null ? void 0 : r.scrollLeft) || 0,
    top: s.scrollingElement ? s.scrollingElement.scrollTop : e.pageYOffset !== void 0 ? e.pageYOffset : (s == null ? void 0 : s.documentElement.scrollTop) || (s == null ? void 0 : s.body) && ((n = be.parentElement(s.body)) == null ? void 0 : n.scrollTop) || ((i = s == null ? void 0 : s.body) == null ? void 0 : i.scrollTop) || 0
  };
}
function Xd() {
  return window.innerHeight || document.documentElement && document.documentElement.clientHeight || document.body && document.body.clientHeight;
}
function Jd() {
  return window.innerWidth || document.documentElement && document.documentElement.clientWidth || document.body && document.body.clientWidth;
}
function Zd(e) {
  return e ? e.nodeType === e.ELEMENT_NODE ? e : be.parentElement(e) : null;
}
function vt(e, t, r, n) {
  if (!e)
    return !1;
  const i = Zd(e);
  if (!i)
    return !1;
  try {
    if (typeof t == "string") {
      if (i.classList.contains(t) || n && i.closest("." + t) !== null) return !0;
    } else if (Hi(i, t, n)) return !0;
  } catch {
  }
  return !!(r && (i.matches(r) || n && i.closest(r) !== null));
}
function pk(e, t) {
  return t.getId(e) !== -1;
}
function Go(e, t, r) {
  return e.tagName === "TITLE" && r.headTitleMutations ? !0 : t.getId(e) === Zn;
}
function Qd(e, t) {
  if (Yn(e))
    return !1;
  const r = t.getId(e);
  if (!t.has(r))
    return !0;
  const n = be.parentNode(e);
  return n && n.nodeType === e.DOCUMENT_NODE ? !1 : n ? Qd(n, t) : !0;
}
function oa(e) {
  return !!e.changedTouches;
}
function hk(e = window) {
  "NodeList" in e && !e.NodeList.prototype.forEach && (e.NodeList.prototype.forEach = Array.prototype.forEach), "DOMTokenList" in e && !e.DOMTokenList.prototype.forEach && (e.DOMTokenList.prototype.forEach = Array.prototype.forEach);
}
function ep(e, t) {
  return !!(e.nodeName === "IFRAME" && t.getMeta(e));
}
function tp(e, t) {
  return !!(e.nodeName === "LINK" && e.nodeType === e.ELEMENT_NODE && e.getAttribute && e.getAttribute("rel") === "stylesheet" && t.getMeta(e));
}
function aa(e) {
  return e ? e instanceof Na && "shadowRoot" in e ? !!e.shadowRoot : !!be.shadowRoot(e) : !1;
}
class fk {
  constructor() {
    j(this, "id", 1), j(this, "styleIDMap", /* @__PURE__ */ new WeakMap()), j(this, "idStyleMap", /* @__PURE__ */ new Map());
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
function rp(e) {
  var t;
  let r = null;
  return "getRootNode" in e && ((t = be.getRootNode(e)) == null ? void 0 : t.nodeType) === Node.DOCUMENT_FRAGMENT_NODE && be.host(be.getRootNode(e)) && (r = be.host(be.getRootNode(e))), r;
}
function mk(e) {
  let t = e, r;
  for (; r = rp(t); )
    t = r;
  return t;
}
function gk(e) {
  const t = be.ownerDocument(e);
  if (!t) return !1;
  const r = mk(e);
  return be.contains(t, r);
}
function np(e) {
  const t = be.ownerDocument(e);
  return t ? be.contains(t, e) || gk(e) : !1;
}
var Ce = /* @__PURE__ */ ((e) => (e[e.DomContentLoaded = 0] = "DomContentLoaded", e[e.Load = 1] = "Load", e[e.FullSnapshot = 2] = "FullSnapshot", e[e.IncrementalSnapshot = 3] = "IncrementalSnapshot", e[e.Meta = 4] = "Meta", e[e.Custom = 5] = "Custom", e[e.Plugin = 6] = "Plugin", e[e.Asset = 7] = "Asset", e))(Ce || {}), xe = /* @__PURE__ */ ((e) => (e[e.Mutation = 0] = "Mutation", e[e.MouseMove = 1] = "MouseMove", e[e.MouseInteraction = 2] = "MouseInteraction", e[e.Scroll = 3] = "Scroll", e[e.ViewportResize = 4] = "ViewportResize", e[e.Input = 5] = "Input", e[e.TouchMove = 6] = "TouchMove", e[e.MediaInteraction = 7] = "MediaInteraction", e[e.StyleSheetRule = 8] = "StyleSheetRule", e[e.CanvasMutation = 9] = "CanvasMutation", e[e.Font = 10] = "Font", e[e.Log = 11] = "Log", e[e.Drag = 12] = "Drag", e[e.StyleDeclaration = 13] = "StyleDeclaration", e[e.Selection = 14] = "Selection", e[e.AdoptedStyleSheet = 15] = "AdoptedStyleSheet", e[e.CustomElement = 16] = "CustomElement", e))(xe || {}), Mt = /* @__PURE__ */ ((e) => (e[e.MouseUp = 0] = "MouseUp", e[e.MouseDown = 1] = "MouseDown", e[e.Click = 2] = "Click", e[e.ContextMenu = 3] = "ContextMenu", e[e.DblClick = 4] = "DblClick", e[e.Focus = 5] = "Focus", e[e.Blur = 6] = "Blur", e[e.TouchStart = 7] = "TouchStart", e[e.TouchMove_Departed = 8] = "TouchMove_Departed", e[e.TouchEnd = 9] = "TouchEnd", e[e.TouchCancel = 10] = "TouchCancel", e))(Mt || {}), mr = /* @__PURE__ */ ((e) => (e[e.Mouse = 0] = "Mouse", e[e.Pen = 1] = "Pen", e[e.Touch = 2] = "Touch", e))(mr || {}), Nn = /* @__PURE__ */ ((e) => (e[e["2D"] = 0] = "2D", e[e.WebGL = 1] = "WebGL", e[e.WebGL2 = 2] = "WebGL2", e))(Nn || {}), xn = /* @__PURE__ */ ((e) => (e[e.Play = 0] = "Play", e[e.Pause = 1] = "Pause", e[e.Seeked = 2] = "Seeked", e[e.VolumeChange = 3] = "VolumeChange", e[e.RateChange = 4] = "RateChange", e))(xn || {}), ip = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(ip || {});
function xu(e) {
  return "__ln" in e;
}
class yk {
  constructor() {
    j(this, "length", 0), j(this, "head", null), j(this, "tail", null);
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
    if (t.__ln = r, t.previousSibling && xu(t.previousSibling)) {
      const n = t.previousSibling.__ln.next;
      r.next = n, r.previous = t.previousSibling.__ln, t.previousSibling.__ln.next = r, n && (n.previous = r);
    } else if (t.nextSibling && xu(t.nextSibling) && t.nextSibling.__ln.previous) {
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
const wu = (e, t) => `${e}@${t}`;
class bk {
  constructor() {
    j(this, "frozen", !1), j(this, "locked", !1), j(this, "texts", []), j(this, "attributes", []), j(this, "attributeMap", /* @__PURE__ */ new WeakMap()), j(this, "removes", []), j(this, "mapRemoves", []), j(this, "movedMap", {}), j(this, "addedSet", /* @__PURE__ */ new Set()), j(this, "movedSet", /* @__PURE__ */ new Set()), j(this, "droppedSet", /* @__PURE__ */ new Set()), j(this, "removesSubTreeCache", /* @__PURE__ */ new Set()), j(this, "mutationCb"), j(this, "blockClass"), j(this, "blockSelector"), j(this, "maskTextClass"), j(this, "maskTextSelector"), j(this, "inlineStylesheet"), j(this, "maskInputOptions"), j(this, "maskTextFn"), j(this, "maskInputFn"), j(this, "keepIframeSrcFn"), j(this, "recordCanvas"), j(this, "inlineImages"), j(this, "slimDOMOptions"), j(this, "dataURLOptions"), j(this, "doc"), j(this, "mirror"), j(this, "iframeManager"), j(this, "stylesheetManager"), j(this, "shadowDomManager"), j(this, "canvasManager"), j(this, "processedNodeManager"), j(this, "unattachedDoc"), j(this, "processMutations", (t) => {
      t.forEach(this.processMutation), this.emit();
    }), j(this, "emit", () => {
      if (this.frozen || this.locked)
        return;
      const t = [], r = /* @__PURE__ */ new Set(), n = new yk(), i = (l) => {
        let p = l, a = Zn;
        for (; a === Zn; )
          p = p && p.nextSibling, a = p && this.mirror.getId(p);
        return a;
      }, s = (l) => {
        const p = be.parentNode(l);
        if (!p || !np(l))
          return;
        let a = !1;
        if (l.nodeType === Node.TEXT_NODE) {
          const m = p.tagName;
          if (m === "TEXTAREA")
            return;
          m === "STYLE" && this.addedSet.has(p) && (a = !0);
        }
        const h = Yn(p) ? this.mirror.getId(rp(l)) : this.mirror.getId(p), d = i(l);
        if (h === -1 || d === -1)
          return n.addNode(l);
        const u = Sn(l, {
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
            ep(m, this.mirror) && this.iframeManager.addIframe(m), tp(m, this.mirror) && this.stylesheetManager.trackLinkElement(
              m
            ), aa(l) && this.shadowDomManager.addShadowRoot(be.shadowRoot(l), this.doc);
          },
          onIframeLoad: (m, f) => {
            this.iframeManager.attachIframe(m, f), this.shadowDomManager.observeAttachShadow(m);
          },
          onStylesheetLoad: (m, f) => {
            this.stylesheetManager.attachLinkElement(m, f);
          },
          cssCaptured: a
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
        Su(this.removesSubTreeCache, l, this.mirror) && !this.movedSet.has(be.parentNode(l)) || s(l);
      for (const l of this.addedSet)
        !Eu(this.droppedSet, l) && !Su(this.removesSubTreeCache, l, this.mirror) || Eu(this.movedSet, l) ? s(l) : this.droppedSet.add(l);
      let o = null;
      for (; n.length; ) {
        let l = null;
        if (o) {
          const p = this.mirror.getId(be.parentNode(o.value)), a = i(o.value);
          p !== -1 && a !== -1 && (l = o);
        }
        if (!l) {
          let p = n.tail;
          for (; p; ) {
            const a = p;
            if (p = p.previous, a) {
              const h = this.mirror.getId(be.parentNode(a.value));
              if (i(a.value) === -1) continue;
              if (h !== -1) {
                l = a;
                break;
              } else {
                const u = a.value, m = be.parentNode(u);
                if (m && m.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                  const f = be.host(m);
                  if (this.mirror.getId(f) !== -1) {
                    l = a;
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
        o = l.previous, n.removeNode(l.value), s(l.value);
      }
      const c = {
        texts: this.texts.map((l) => {
          const p = l.node, a = be.parentNode(p);
          return a && a.tagName === "TEXTAREA" && this.genTextAreaValueMutation(a), {
            id: this.mirror.getId(p),
            value: l.value
          };
        }).filter((l) => !r.has(l.id)).filter((l) => this.mirror.has(l.id)),
        attributes: this.attributes.map((l) => {
          const { attributes: p } = l;
          if (typeof p.style == "string") {
            const a = JSON.stringify(l.styleDiff), h = JSON.stringify(l._unchangedStyles);
            a.length < p.style.length && (a + h).split("var(").length === p.style.split("var(").length && (p.style = l.styleDiff);
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
    }), j(this, "genTextAreaValueMutation", (t) => {
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
      r.attributes.value = qi({
        element: t,
        maskInputOptions: this.maskInputOptions,
        tagName: t.tagName,
        type: Wi(t),
        value: n,
        maskInputFn: this.maskInputFn
      });
    }), j(this, "processMutation", (t) => {
      if (!Go(t.target, this.mirror, this.slimDOMOptions))
        switch (t.type) {
          case "characterData": {
            const r = be.textContent(t.target);
            !vt(t.target, this.blockClass, this.blockSelector, !1) && r !== t.oldValue && this.texts.push({
              value: Ld(
                t.target,
                this.maskTextClass,
                this.maskTextSelector,
                !0
                // checkAncestors
              ) && r ? this.maskTextFn ? this.maskTextFn(r, Zd(t.target)) : r.replace(/[\S]/g, "*") : r,
              node: t.target
            });
            break;
          }
          case "attributes": {
            const r = t.target;
            let n = t.attributeName, i = t.target.getAttribute(n);
            if (n === "value") {
              const o = Wi(r);
              i = qi({
                element: r,
                maskInputOptions: this.maskInputOptions,
                tagName: r.tagName,
                type: o,
                value: i,
                maskInputFn: this.maskInputFn
              });
            }
            if (vt(t.target, this.blockClass, this.blockSelector, !1) || i === t.oldValue)
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
            }, this.attributes.push(s), this.attributeMap.set(t.target, s)), n === "type" && r.tagName === "INPUT" && (t.oldValue || "").toLowerCase() === "password" && r.setAttribute("data-rr-is-password", "true"), !Ad(r.tagName, n))
              if (s.attributes[n] = Td(
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
                const o = this.unattachedDoc.createElement("span");
                t.oldValue && o.setAttribute("style", t.oldValue);
                for (const c of Array.from(r.style)) {
                  const l = r.style.getPropertyValue(c), p = r.style.getPropertyPriority(c);
                  l !== o.style.getPropertyValue(c) || p !== o.style.getPropertyPriority(c) ? p === "" ? s.styleDiff[c] = l : s.styleDiff[c] = [l, p] : s._unchangedStyles[c] = [l, p];
                }
                for (const c of Array.from(o.style))
                  r.style.getPropertyValue(c) === "" && (s.styleDiff[c] = !1);
              } else n === "open" && r.tagName === "DIALOG" && (r.matches("dialog:modal") ? s.attributes.rr_open_mode = "modal" : s.attributes.rr_open_mode = "non-modal");
            break;
          }
          case "childList": {
            if (vt(t.target, this.blockClass, this.blockSelector, !0))
              return;
            if (t.target.tagName === "TEXTAREA") {
              this.genTextAreaValueMutation(t.target);
              return;
            }
            t.addedNodes.forEach((r) => this.genAdds(r, t.target)), t.removedNodes.forEach((r) => {
              const n = this.mirror.getId(r), i = Yn(t.target) ? this.mirror.getId(be.host(t.target)) : this.mirror.getId(t.target);
              vt(t.target, this.blockClass, this.blockSelector, !1) || Go(r, this.mirror, this.slimDOMOptions) || !pk(r, this.mirror) || (this.addedSet.has(r) ? (la(this.addedSet, r), this.droppedSet.add(r)) : this.addedSet.has(t.target) && n === -1 || Qd(t.target, this.mirror) || (this.movedSet.has(r) && this.movedMap[wu(n, i)] ? la(this.movedSet, r) : (this.removes.push({
                parentId: i,
                id: n,
                isShadow: Yn(t.target) && Vn(t.target) ? !0 : void 0
              }), kk(r, this.removesSubTreeCache))), this.mapRemoves.push(r));
            });
            break;
          }
        }
    }), j(this, "genAdds", (t, r) => {
      if (!this.processedNodeManager.inOtherBuffer(t, this) && !(this.addedSet.has(t) || this.movedSet.has(t))) {
        if (this.mirror.hasNode(t)) {
          if (Go(t, this.mirror, this.slimDOMOptions))
            return;
          this.movedSet.add(t);
          let n = null;
          r && this.mirror.hasNode(r) && (n = this.mirror.getId(r)), n && n !== -1 && (this.movedMap[wu(this.mirror.getId(t), n)] = !0);
        } else
          this.addedSet.add(t), this.droppedSet.delete(t);
        vt(t, this.blockClass, this.blockSelector, !1) || (be.childNodes(t).forEach((n) => this.genAdds(n)), aa(t) && be.childNodes(be.shadowRoot(t)).forEach((n) => {
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
function la(e, t) {
  e.delete(t), be.childNodes(t).forEach((r) => la(e, r));
}
function kk(e, t) {
  const r = [e];
  for (; r.length; ) {
    const n = r.pop();
    t.has(n) || (t.add(n), be.childNodes(n).forEach((i) => r.push(i)));
  }
}
function Su(e, t, r) {
  return e.size === 0 ? !1 : vk(e, t);
}
function vk(e, t, r) {
  const n = be.parentNode(t);
  return n ? e.has(n) : !1;
}
function Eu(e, t) {
  return e.size === 0 ? !1 : sp(e, t);
}
function sp(e, t) {
  const r = be.parentNode(t);
  return r ? e.has(r) ? !0 : sp(e, r) : !1;
}
let Gn;
function xk(e) {
  Gn = e;
}
function wk() {
  Gn = void 0;
}
const we = (e) => Gn ? (...r) => {
  try {
    return e(...r);
  } catch (n) {
    if (Gn && Gn(n) === !0)
      return;
    throw n;
  }
} : e, Kr = [];
function ii(e) {
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
function op(e, t) {
  const r = new bk();
  Kr.push(r), r.init(e);
  const [n, i] = Gd(), s = new n(
    we(r.processMutations.bind(r))
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
function Sk({
  mousemoveCb: e,
  sampling: t,
  doc: r,
  mirror: n
}) {
  if (t.mousemove === !1)
    return () => {
    };
  const i = typeof t.mousemove == "number" ? t.mousemove : 50, s = typeof t.mousemoveCallback == "number" ? t.mousemoveCallback : 500;
  let o = [], c;
  const l = ei(
    we(
      (h) => {
        const d = Date.now() - c;
        e(
          o.map((u) => (u.timeOffset -= d, u)),
          h
        ), o = [], c = null;
      }
    ),
    s
  ), p = we(
    ei(
      we((h) => {
        const d = ii(h), { clientX: u, clientY: m } = oa(h) ? h.changedTouches[0] : h;
        c || (c = Qn()), o.push({
          x: u,
          y: m,
          id: n.getId(d),
          timeOffset: Qn() - c
        }), l(
          typeof DragEvent < "u" && h instanceof DragEvent ? xe.Drag : h instanceof MouseEvent ? xe.MouseMove : xe.TouchMove
        );
      }),
      i,
      {
        trailing: !1
      }
    )
  ), a = [
    kt("mousemove", p, r),
    kt("touchmove", p, r),
    kt("drag", p, r)
  ];
  return we(() => {
    a.forEach((h) => h());
  });
}
function Ek({
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
  const o = s.mouseInteraction === !0 || s.mouseInteraction === void 0 ? {} : s.mouseInteraction, c = [];
  let l = null;
  const p = (a) => (h) => {
    const d = ii(h);
    if (vt(d, n, i, !0))
      return;
    let u = null, m = a;
    if ("pointerType" in h) {
      switch (h.pointerType) {
        case "mouse":
          u = mr.Mouse;
          break;
        case "touch":
          u = mr.Touch;
          break;
        case "pen":
          u = mr.Pen;
          break;
      }
      u === mr.Touch ? Mt[a] === Mt.MouseDown ? m = "TouchStart" : Mt[a] === Mt.MouseUp && (m = "TouchEnd") : mr.Pen;
    } else oa(h) && (u = mr.Touch);
    u !== null ? (l = u, (m.startsWith("Touch") && u === mr.Touch || m.startsWith("Mouse") && u === mr.Mouse) && (u = null)) : Mt[a] === Mt.Click && (u = l, l = null);
    const f = oa(h) ? h.changedTouches[0] : h;
    if (!f)
      return;
    const y = r.getId(d), { clientX: C, clientY: k } = f;
    we(e)({
      type: Mt[m],
      id: y,
      x: C,
      y: k,
      ...u !== null && { pointerType: u }
    });
  };
  return Object.keys(Mt).filter(
    (a) => Number.isNaN(Number(a)) && !a.endsWith("_Departed") && o[a] !== !1
  ).forEach((a) => {
    let h = Qr(a);
    const d = p(a);
    if (window.PointerEvent)
      switch (Mt[a]) {
        case Mt.MouseDown:
        case Mt.MouseUp:
          h = h.replace(
            "mouse",
            "pointer"
          );
          break;
        case Mt.TouchStart:
        case Mt.TouchEnd:
          return;
      }
    c.push(kt(h, d, t));
  }), we(() => {
    c.forEach((a) => a());
  });
}
function ap({
  scrollCb: e,
  doc: t,
  mirror: r,
  blockClass: n,
  blockSelector: i,
  sampling: s
}) {
  const o = we(
    ei(
      we((c) => {
        const l = ii(c);
        if (!l || vt(l, n, i, !0))
          return;
        const p = r.getId(l);
        if (l === t && t.defaultView) {
          const a = Kd(t.defaultView);
          e({
            id: p,
            x: a.left,
            y: a.top
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
  return kt("scroll", o, t);
}
function Ck({ viewportResizeCb: e }, { win: t }) {
  let r = -1, n = -1;
  const i = we(
    ei(
      we(() => {
        const s = Xd(), o = Jd();
        (r !== s || n !== o) && (e({
          width: Number(o),
          height: Number(s)
        }), r = s, n = o);
      }),
      200
    )
  );
  return kt("resize", i, t);
}
const Mk = ["INPUT", "TEXTAREA", "SELECT"], Cu = /* @__PURE__ */ new WeakMap();
function Rk({
  inputCb: e,
  doc: t,
  mirror: r,
  blockClass: n,
  blockSelector: i,
  ignoreClass: s,
  ignoreSelector: o,
  maskInputOptions: c,
  maskInputFn: l,
  sampling: p,
  userTriggeredOnInput: a
}) {
  function h(k) {
    let b = ii(k);
    const A = k.isTrusted, S = b && b.tagName;
    if (b && S === "OPTION" && (b = be.parentElement(b)), !b || !S || Mk.indexOf(S) < 0 || vt(b, n, i, !0) || b.classList.contains(s) || o && b.matches(o))
      return;
    let x = b.value, R = !1;
    const I = Wi(b) || "";
    I === "radio" || I === "checkbox" ? R = b.checked : (c[S.toLowerCase()] || c[I]) && (x = qi({
      element: b,
      maskInputOptions: c,
      tagName: S,
      type: I,
      value: x,
      maskInputFn: l
    })), d(
      b,
      a ? { text: x, isChecked: R, userTriggered: A } : { text: x, isChecked: R }
    );
    const F = b.name;
    I === "radio" && F && R && t.querySelectorAll(`input[type="radio"][name="${F}"]`).forEach((z) => {
      if (z !== b) {
        const Q = z.value;
        d(
          z,
          a ? { text: Q, isChecked: !R, userTriggered: !1 } : { text: Q, isChecked: !R }
        );
      }
    });
  }
  function d(k, b) {
    const A = Cu.get(k);
    if (!A || A.text !== b.text || A.isChecked !== b.isChecked) {
      Cu.set(k, b);
      const S = r.getId(k);
      we(e)({
        ...b,
        id: S
      });
    }
  }
  const m = (p.input === "last" ? ["change"] : ["input", "change"]).map(
    (k) => kt(k, we(h), t)
  ), f = t.defaultView;
  if (!f)
    return () => {
      m.forEach((k) => k());
    };
  const y = f.Object.getOwnPropertyDescriptor(
    f.HTMLInputElement.prototype,
    "value"
  ), C = [
    [f.HTMLInputElement.prototype, "value"],
    [f.HTMLInputElement.prototype, "checked"],
    [f.HTMLSelectElement.prototype, "value"],
    [f.HTMLTextAreaElement.prototype, "value"],
    // Some UI library use selectedIndex to set select value
    [f.HTMLSelectElement.prototype, "selectedIndex"],
    [f.HTMLOptionElement.prototype, "selected"]
  ];
  return y && y.set && m.push(
    ...C.map(
      (k) => us(
        k[0],
        k[1],
        {
          set() {
            we(h)({
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
  ), we(() => {
    m.forEach((k) => k());
  });
}
function Yi(e) {
  const t = [];
  function r(n, i) {
    if (Ai("CSSGroupingRule") && n.parentRule instanceof CSSGroupingRule || Ai("CSSMediaRule") && n.parentRule instanceof CSSMediaRule || Ai("CSSSupportsRule") && n.parentRule instanceof CSSSupportsRule || Ai("CSSConditionRule") && n.parentRule instanceof CSSConditionRule) {
      const o = Array.from(
        n.parentRule.cssRules
      ).indexOf(n);
      return i.unshift(o), r(n.parentRule, i);
    } else if (n.parentStyleSheet) {
      const o = Array.from(n.parentStyleSheet.cssRules).indexOf(n);
      i.unshift(o);
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
function Tk({ styleSheetRuleCb: e, mirror: t, stylesheetManager: r }, { win: n }) {
  if (!n.CSSStyleSheet || !n.CSSStyleSheet.prototype)
    return () => {
    };
  const i = n.CSSStyleSheet.prototype.insertRule;
  n.CSSStyleSheet.prototype.insertRule = new Proxy(i, {
    apply: we(
      (a, h, d) => {
        const [u, m] = d, { id: f, styleId: y } = Tr(
          h,
          t,
          r.styleMirror
        );
        return (f && f !== -1 || y && y !== -1) && e({
          id: f,
          styleId: y,
          adds: [{ rule: u, index: m }]
        }), a.apply(h, d);
      }
    )
  }), n.CSSStyleSheet.prototype.addRule = function(a, h, d = this.cssRules.length) {
    const u = `${a} { ${h} }`;
    return n.CSSStyleSheet.prototype.insertRule.apply(this, [u, d]);
  };
  const s = n.CSSStyleSheet.prototype.deleteRule;
  n.CSSStyleSheet.prototype.deleteRule = new Proxy(s, {
    apply: we(
      (a, h, d) => {
        const [u] = d, { id: m, styleId: f } = Tr(
          h,
          t,
          r.styleMirror
        );
        return (m && m !== -1 || f && f !== -1) && e({
          id: m,
          styleId: f,
          removes: [{ index: u }]
        }), a.apply(h, d);
      }
    )
  }), n.CSSStyleSheet.prototype.removeRule = function(a) {
    return n.CSSStyleSheet.prototype.deleteRule.apply(this, [a]);
  };
  let o;
  n.CSSStyleSheet.prototype.replace && (o = n.CSSStyleSheet.prototype.replace, n.CSSStyleSheet.prototype.replace = new Proxy(o, {
    apply: we(
      (a, h, d) => {
        const [u] = d, { id: m, styleId: f } = Tr(
          h,
          t,
          r.styleMirror
        );
        return (m && m !== -1 || f && f !== -1) && e({
          id: m,
          styleId: f,
          replace: u
        }), a.apply(h, d);
      }
    )
  }));
  let c;
  n.CSSStyleSheet.prototype.replaceSync && (c = n.CSSStyleSheet.prototype.replaceSync, n.CSSStyleSheet.prototype.replaceSync = new Proxy(c, {
    apply: we(
      (a, h, d) => {
        const [u] = d, { id: m, styleId: f } = Tr(
          h,
          t,
          r.styleMirror
        );
        return (m && m !== -1 || f && f !== -1) && e({
          id: m,
          styleId: f,
          replaceSync: u
        }), a.apply(h, d);
      }
    )
  }));
  const l = {};
  Li("CSSGroupingRule") ? l.CSSGroupingRule = n.CSSGroupingRule : (Li("CSSMediaRule") && (l.CSSMediaRule = n.CSSMediaRule), Li("CSSConditionRule") && (l.CSSConditionRule = n.CSSConditionRule), Li("CSSSupportsRule") && (l.CSSSupportsRule = n.CSSSupportsRule));
  const p = {};
  return Object.entries(l).forEach(([a, h]) => {
    p[a] = {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      insertRule: h.prototype.insertRule,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      deleteRule: h.prototype.deleteRule
    }, h.prototype.insertRule = new Proxy(
      p[a].insertRule,
      {
        apply: we(
          (d, u, m) => {
            const [f, y] = m, { id: C, styleId: k } = Tr(
              u.parentStyleSheet,
              t,
              r.styleMirror
            );
            return (C && C !== -1 || k && k !== -1) && e({
              id: C,
              styleId: k,
              adds: [
                {
                  rule: f,
                  index: [
                    ...Yi(u),
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
      p[a].deleteRule,
      {
        apply: we(
          (d, u, m) => {
            const [f] = m, { id: y, styleId: C } = Tr(
              u.parentStyleSheet,
              t,
              r.styleMirror
            );
            return (y && y !== -1 || C && C !== -1) && e({
              id: y,
              styleId: C,
              removes: [
                { index: [...Yi(u), f] }
              ]
            }), d.apply(u, m);
          }
        )
      }
    );
  }), we(() => {
    n.CSSStyleSheet.prototype.insertRule = i, n.CSSStyleSheet.prototype.deleteRule = s, o && (n.CSSStyleSheet.prototype.replace = o), c && (n.CSSStyleSheet.prototype.replaceSync = c), Object.entries(l).forEach(([a, h]) => {
      h.prototype.insertRule = p[a].insertRule, h.prototype.deleteRule = p[a].deleteRule;
    });
  });
}
function lp({
  mirror: e,
  stylesheetManager: t
}, r) {
  var n, i, s;
  let o = null;
  r.nodeName === "#document" ? o = e.getId(r) : o = e.getId(be.host(r));
  const c = r.nodeName === "#document" ? (n = r.defaultView) == null ? void 0 : n.Document : (s = (i = r.ownerDocument) == null ? void 0 : i.defaultView) == null ? void 0 : s.ShadowRoot, l = c != null && c.prototype ? Object.getOwnPropertyDescriptor(
    c == null ? void 0 : c.prototype,
    "adoptedStyleSheets"
  ) : void 0;
  return o === null || o === -1 || !c || !l ? () => {
  } : (Object.defineProperty(r, "adoptedStyleSheets", {
    configurable: l.configurable,
    enumerable: l.enumerable,
    get() {
      var p;
      return (p = l.get) == null ? void 0 : p.call(this);
    },
    set(p) {
      var a;
      const h = (a = l.set) == null ? void 0 : a.call(this, p);
      if (o !== null && o !== -1)
        try {
          t.adoptStyleSheets(p, o);
        } catch {
        }
      return h;
    }
  }), we(() => {
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
function Ak({
  styleDeclarationCb: e,
  mirror: t,
  ignoreCSSAttributes: r,
  stylesheetManager: n
}, { win: i }) {
  const s = i.CSSStyleDeclaration.prototype.setProperty;
  i.CSSStyleDeclaration.prototype.setProperty = new Proxy(s, {
    apply: we(
      (c, l, p) => {
        var a;
        const [h, d, u] = p;
        if (r.has(h))
          return s.apply(l, [h, d, u]);
        const { id: m, styleId: f } = Tr(
          (a = l.parentRule) == null ? void 0 : a.parentStyleSheet,
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
          index: Yi(l.parentRule)
        }), c.apply(l, p);
      }
    )
  });
  const o = i.CSSStyleDeclaration.prototype.removeProperty;
  return i.CSSStyleDeclaration.prototype.removeProperty = new Proxy(o, {
    apply: we(
      (c, l, p) => {
        var a;
        const [h] = p;
        if (r.has(h))
          return o.apply(l, [h]);
        const { id: d, styleId: u } = Tr(
          (a = l.parentRule) == null ? void 0 : a.parentStyleSheet,
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
          index: Yi(l.parentRule)
        }), c.apply(l, p);
      }
    )
  }), we(() => {
    i.CSSStyleDeclaration.prototype.setProperty = s, i.CSSStyleDeclaration.prototype.removeProperty = o;
  });
}
function Lk({
  mediaInteractionCb: e,
  blockClass: t,
  blockSelector: r,
  mirror: n,
  sampling: i,
  doc: s
}) {
  const o = we(
    (l) => ei(
      we((p) => {
        const a = ii(p);
        if (!a || vt(a, t, r, !0))
          return;
        const { currentTime: h, volume: d, muted: u, playbackRate: m, loop: f } = a;
        e({
          type: l,
          id: n.getId(a),
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
    kt("play", o(xn.Play), s),
    kt("pause", o(xn.Pause), s),
    kt("seeked", o(xn.Seeked), s),
    kt("volumechange", o(xn.VolumeChange), s),
    kt("ratechange", o(xn.RateChange), s)
  ];
  return we(() => {
    c.forEach((l) => l());
  });
}
function _k({ fontCb: e, doc: t }) {
  const r = t.defaultView;
  if (!r)
    return () => {
    };
  const n = [], i = /* @__PURE__ */ new WeakMap(), s = r.FontFace;
  r.FontFace = function(l, p, a) {
    const h = new s(l, p, a);
    return i.set(h, {
      family: l,
      buffer: typeof p != "string",
      descriptors: a,
      fontSource: typeof p == "string" ? p : JSON.stringify(Array.from(new Uint8Array(p)))
    }), h;
  };
  const o = nn(
    t.fonts,
    "add",
    function(c) {
      return function(l) {
        return setTimeout(
          we(() => {
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
  }), n.push(o), we(() => {
    n.forEach((c) => c());
  });
}
function Ik(e) {
  const { doc: t, mirror: r, blockClass: n, blockSelector: i, selectionCb: s } = e;
  let o = !0;
  const c = we(() => {
    const l = t.getSelection();
    if (!l || o && (l != null && l.isCollapsed)) return;
    o = l.isCollapsed || !1;
    const p = [], a = l.rangeCount || 0;
    for (let h = 0; h < a; h++) {
      const d = l.getRangeAt(h), { startContainer: u, startOffset: m, endContainer: f, endOffset: y } = d;
      vt(u, n, i, !0) || vt(f, n, i, !0) || p.push({
        start: r.getId(u),
        startOffset: m,
        end: r.getId(f),
        endOffset: y
      });
    }
    s({ ranges: p });
  });
  return c(), kt("selectionchange", c);
}
function Ok({
  doc: e,
  customElementCb: t
}) {
  const r = e.defaultView;
  return !r || !r.customElements ? () => {
  } : nn(
    r.customElements,
    "define",
    function(i) {
      return function(s, o, c) {
        try {
          t({
            define: {
              name: s
            }
          });
        } catch {
          console.warn(`Custom element callback failed for ${s}`);
        }
        return i.apply(this, [s, o, c]);
      };
    }
  );
}
function Nk(e, t) {
  const {
    mutationCb: r,
    mousemoveCb: n,
    mouseInteractionCb: i,
    scrollCb: s,
    viewportResizeCb: o,
    inputCb: c,
    mediaInteractionCb: l,
    styleSheetRuleCb: p,
    styleDeclarationCb: a,
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
    t.viewportResize && t.viewportResize(...f), o(...f);
  }, e.inputCb = (...f) => {
    t.input && t.input(...f), c(...f);
  }, e.mediaInteractionCb = (...f) => {
    t.mediaInteaction && t.mediaInteaction(...f), l(...f);
  }, e.styleSheetRuleCb = (...f) => {
    t.styleSheetRule && t.styleSheetRule(...f), p(...f);
  }, e.styleDeclarationCb = (...f) => {
    t.styleDeclaration && t.styleDeclaration(...f), a(...f);
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
function Pk(e, t = {}) {
  const r = e.doc.defaultView;
  if (!r)
    return () => {
    };
  Nk(e, t);
  let n, i = () => {
  };
  e.recordDOM && ([n, i] = op(e, e.doc));
  const s = Sk(e), o = Ek(e), c = ap(e), l = Ck(e, {
    win: r
  }), p = Rk(e), a = Lk(e);
  let h = () => {
  }, d = () => {
  }, u = () => {
  }, m = () => {
  };
  e.recordDOM && (h = Tk(e, { win: r }), d = lp(e, e.doc), u = Ak(e, {
    win: r
  }), e.collectFonts && (m = _k(e)));
  const f = Ik(e), y = Ok(e), C = [];
  for (const k of e.plugins)
    C.push(
      k.observer(k.callback, r, k.options)
    );
  return we(() => {
    Kr.forEach((k) => k.reset()), n == null || n.disconnect(), i(), s(), o(), c(), l(), p(), a(), h(), d(), u(), m(), f(), y(), C.forEach((k) => k());
  });
}
function Ai(e) {
  return typeof window[e] < "u";
}
function Li(e) {
  return !!(typeof window[e] < "u" && // Note: Generally, this check _shouldn't_ be necessary
  // However, in some scenarios (e.g. jsdom) this can sometimes fail, so we check for it here
  window[e].prototype && "insertRule" in window[e].prototype && "deleteRule" in window[e].prototype);
}
class Mu {
  constructor(t) {
    j(this, "iframeIdToRemoteIdMap", /* @__PURE__ */ new WeakMap()), j(this, "iframeRemoteIdToIdMap", /* @__PURE__ */ new WeakMap()), this.generateIdFn = t;
  }
  getId(t, r, n, i) {
    const s = n || this.getIdToRemoteIdMap(t), o = i || this.getRemoteIdToIdMap(t);
    let c = s.get(r);
    return c || (c = this.generateIdFn(), s.set(r, c), o.set(c, r)), c;
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
class zk {
  constructor(t) {
    j(this, "iframes", /* @__PURE__ */ new WeakMap()), j(this, "crossOriginIframeMap", /* @__PURE__ */ new WeakMap()), j(this, "crossOriginIframeMirror", new Mu(Rd)), j(this, "crossOriginIframeStyleMirror"), j(this, "crossOriginIframeRootIdMap", /* @__PURE__ */ new WeakMap()), j(this, "mirror"), j(this, "mutationCb"), j(this, "wrappedEmit"), j(this, "loadListener"), j(this, "stylesheetManager"), j(this, "recordCrossOriginIframes"), this.mutationCb = t.mutationCb, this.wrappedEmit = t.wrappedEmit, this.stylesheetManager = t.stylesheetManager, this.recordCrossOriginIframes = t.recordCrossOriginIframes, this.crossOriginIframeStyleMirror = new Mu(
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
    t.type !== ip.Document && !t.rootId && (t.rootId = r), "childNodes" in t && t.childNodes.forEach((n) => {
      this.patchRootIdOnNode(n, r);
    });
  }
}
class $k {
  constructor(t) {
    j(this, "shadowDoms", /* @__PURE__ */ new WeakSet()), j(this, "mutationCb"), j(this, "scrollCb"), j(this, "bypassOptions"), j(this, "mirror"), j(this, "restoreHandlers", []), this.mutationCb = t.mutationCb, this.scrollCb = t.scrollCb, this.bypassOptions = t.bypassOptions, this.mirror = t.mirror, this.init();
  }
  init() {
    this.reset(), this.patchAttachShadow(Element, document);
  }
  addShadowRoot(t, r) {
    if (!Vn(t) || this.shadowDoms.has(t)) return;
    this.shadowDoms.add(t);
    const [n] = op(
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
      ap({
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
        lp(
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
            const o = i.call(this, s), c = be.shadowRoot(this);
            return c && np(this) && n.addShadowRoot(c, r), o;
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
var En = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", Dk = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (var _i = 0; _i < En.length; _i++)
  Dk[En.charCodeAt(_i)] = _i;
var Fk = function(e) {
  var t = new Uint8Array(e), r, n = t.length, i = "";
  for (r = 0; r < n; r += 3)
    i += En[t[r] >> 2], i += En[(t[r] & 3) << 4 | t[r + 1] >> 4], i += En[(t[r + 1] & 15) << 2 | t[r + 2] >> 6], i += En[t[r + 2] & 63];
  return n % 3 === 2 ? i = i.substring(0, i.length - 1) + "=" : n % 3 === 1 && (i = i.substring(0, i.length - 2) + "=="), i;
};
const Ru = /* @__PURE__ */ new Map();
function Uk(e, t) {
  let r = Ru.get(e);
  return r || (r = /* @__PURE__ */ new Map(), Ru.set(e, r)), r.has(t) || r.set(t, []), r.get(t);
}
const cp = (e, t, r) => {
  if (!e || !(dp(e, t) || typeof e == "object"))
    return;
  const n = e.constructor.name, i = Uk(r, n);
  let s = i.indexOf(e);
  return s === -1 && (s = i.length, i.push(e)), s;
};
function Pi(e, t, r) {
  if (e instanceof Array)
    return e.map((n) => Pi(n, t, r));
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
    const n = e.constructor.name, i = Fk(e);
    return {
      rr_type: n,
      base64: i
    };
  } else {
    if (e instanceof DataView)
      return {
        rr_type: e.constructor.name,
        args: [
          Pi(e.buffer, t, r),
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
          args: [Pi(e.data, t, r), e.width, e.height]
        };
      if (dp(e, t) || typeof e == "object") {
        const n = e.constructor.name, i = cp(e, t, r);
        return {
          rr_type: n,
          index: i
        };
      }
    }
  }
  return e;
}
const up = (e, t, r) => e.map((n) => Pi(n, t, r)), dp = (e, t) => !![
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
function Bk(e, t, r, n) {
  const i = [], s = Object.getOwnPropertyNames(
    t.CanvasRenderingContext2D.prototype
  );
  for (const o of s)
    try {
      if (typeof t.CanvasRenderingContext2D.prototype[o] != "function")
        continue;
      const c = nn(
        t.CanvasRenderingContext2D.prototype,
        o,
        function(l) {
          return function(...p) {
            return vt(this.canvas, r, n, !0) || setTimeout(() => {
              const a = up(p, t, this);
              e(this.canvas, {
                type: Nn["2D"],
                property: o,
                args: a
              });
            }, 0), l.apply(this, p);
          };
        }
      );
      i.push(c);
    } catch {
      const c = us(
        t.CanvasRenderingContext2D.prototype,
        o,
        {
          set(l) {
            e(this.canvas, {
              type: Nn["2D"],
              property: o,
              args: [l],
              setter: !0
            });
          }
        }
      );
      i.push(c);
    }
  return () => {
    i.forEach((o) => o());
  };
}
function qk(e) {
  return e === "experimental-webgl" ? "webgl" : e;
}
function Tu(e, t, r, n) {
  const i = [];
  try {
    const s = nn(
      e.HTMLCanvasElement.prototype,
      "getContext",
      function(o) {
        return function(c, ...l) {
          if (!vt(this, t, r, !0)) {
            const p = qk(c);
            if ("__context" in this || (this.__context = p), n && ["webgl", "webgl2"].includes(p))
              if (l[0] && typeof l[0] == "object") {
                const a = l[0];
                a.preserveDrawingBuffer || (a.preserveDrawingBuffer = !0);
              } else
                l.splice(0, 1, {
                  preserveDrawingBuffer: !0
                });
          }
          return o.apply(this, [c, ...l]);
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
function Au(e, t, r, n, i, s) {
  const o = [], c = Object.getOwnPropertyNames(e);
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
          function(a) {
            return function(...h) {
              const d = a.apply(this, h);
              if (cp(d, s, this), "tagName" in this.canvas && !vt(this.canvas, n, i, !0)) {
                const u = up(h, s, this), m = {
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
        o.push(p);
      } catch {
        const p = us(e, l, {
          set(a) {
            r(this.canvas, {
              type: t,
              property: l,
              args: [a],
              setter: !0
            });
          }
        });
        o.push(p);
      }
  return o;
}
function Wk(e, t, r, n) {
  const i = [];
  return typeof t.WebGLRenderingContext < "u" && i.push(
    ...Au(
      t.WebGLRenderingContext.prototype,
      Nn.WebGL,
      e,
      r,
      n,
      t
    )
  ), typeof t.WebGL2RenderingContext < "u" && i.push(
    ...Au(
      t.WebGL2RenderingContext.prototype,
      Nn.WebGL2,
      e,
      r,
      n,
      t
    )
  ), () => {
    i.forEach((s) => s());
  };
}
const pp = `(function() {
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
`, Lu = typeof self < "u" && self.Blob && new Blob([pp], { type: "text/javascript;charset=utf-8" });
function jk(e) {
  let t;
  try {
    if (t = Lu && (self.URL || self.webkitURL).createObjectURL(Lu), !t) throw "";
    const r = new Worker(t, {
      name: e == null ? void 0 : e.name
    });
    return r.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(t);
    }), r;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(pp),
      {
        name: e == null ? void 0 : e.name
      }
    );
  } finally {
    t && (self.URL || self.webkitURL).revokeObjectURL(t);
  }
}
class Hk {
  constructor(t) {
    j(this, "pendingCanvasMutations", /* @__PURE__ */ new Map()), j(this, "rafStamps", { latestId: 0, invokeId: null }), j(this, "mirror"), j(this, "mutationCb"), j(this, "resetObservers"), j(this, "frozen", !1), j(this, "locked", !1), j(this, "processMutation", (l, p) => {
      (this.rafStamps.invokeId && this.rafStamps.latestId !== this.rafStamps.invokeId || !this.rafStamps.invokeId) && (this.rafStamps.invokeId = this.rafStamps.latestId), this.pendingCanvasMutations.has(l) || this.pendingCanvasMutations.set(l, []), this.pendingCanvasMutations.get(l).push(p);
    });
    const {
      sampling: r = "all",
      win: n,
      blockClass: i,
      blockSelector: s,
      recordCanvas: o,
      dataURLOptions: c
    } = t;
    this.mutationCb = t.mutationCb, this.mirror = t.mirror, o && r === "all" && this.initCanvasMutationObserver(n, i, s), o && typeof r == "number" && this.initCanvasFPSObserver(r, n, i, s, {
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
    const o = Tu(
      r,
      n,
      i,
      !0
    ), c = /* @__PURE__ */ new Map(), l = new jk();
    l.onmessage = (m) => {
      const { id: f } = m.data;
      if (c.set(f, !1), !("base64" in m.data)) return;
      const { base64: y, type: C, width: k, height: b } = m.data;
      this.mutationCb({
        id: f,
        type: Nn["2D"],
        commands: [
          {
            property: "clearRect",
            // wipe canvas
            args: [0, 0, k, b]
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
                    type: C
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
    let a = 0, h;
    const d = () => {
      const m = [];
      return r.document.querySelectorAll("canvas").forEach((f) => {
        vt(f, n, i, !0) || m.push(f);
      }), m;
    }, u = (m) => {
      if (a && m - a < p) {
        h = requestAnimationFrame(u);
        return;
      }
      a = m, d().forEach(async (f) => {
        var y;
        const C = this.mirror.getId(f);
        if (c.get(C) || f.width === 0 || f.height === 0) return;
        if (c.set(C, !0), ["webgl", "webgl2"].includes(f.__context)) {
          const b = f.getContext(f.__context);
          ((y = b == null ? void 0 : b.getContextAttributes()) == null ? void 0 : y.preserveDrawingBuffer) === !1 && b.clear(b.COLOR_BUFFER_BIT);
        }
        const k = await createImageBitmap(f);
        l.postMessage(
          {
            id: C,
            bitmap: k,
            width: f.width,
            height: f.height,
            dataURLOptions: s.dataURLOptions
          },
          [k]
        );
      }), h = requestAnimationFrame(u);
    };
    h = requestAnimationFrame(u), this.resetObservers = () => {
      o(), cancelAnimationFrame(h);
    };
  }
  initCanvasMutationObserver(t, r, n) {
    this.startRAFTimestamping(), this.startPendingCanvasMutationFlusher();
    const i = Tu(
      t,
      r,
      n,
      !1
    ), s = Bk(
      this.processMutation.bind(this),
      t,
      r,
      n
    ), o = Wk(
      this.processMutation.bind(this),
      t,
      r,
      n
    );
    this.resetObservers = () => {
      i(), s(), o();
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
    const i = n.map((o) => {
      const { type: c, ...l } = o;
      return l;
    }), { type: s } = n[0];
    this.mutationCb({ id: r, type: s, commands: i }), this.pendingCanvasMutations.delete(t);
  }
}
class Yk {
  constructor(t) {
    j(this, "trackedLinkElements", /* @__PURE__ */ new WeakSet()), j(this, "mutationCb"), j(this, "adoptedStyleSheetCb"), j(this, "styleMirror", new fk()), this.mutationCb = t.mutationCb, this.adoptedStyleSheetCb = t.adoptedStyleSheetCb;
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
      let o;
      this.styleMirror.has(s) ? o = this.styleMirror.getId(s) : (o = this.styleMirror.add(s), i.push({
        styleId: o,
        rules: Array.from(s.rules || CSSRule, (c, l) => ({
          rule: Ed(c, s.href),
          index: l
        }))
      })), n.styleIds.push(o);
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
class Vk {
  constructor() {
    j(this, "nodeMap", /* @__PURE__ */ new WeakMap()), j(this, "active", !1);
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
let Ze, zi, Ko, Vi = !1;
try {
  if (Array.from([1], (e) => e * 2)[0] !== 2) {
    const e = document.createElement("iframe");
    document.body.appendChild(e), Array.from = ((ac = e.contentWindow) == null ? void 0 : ac.Array.from) || Array.from, document.body.removeChild(e);
  }
} catch (e) {
  console.debug("Unable to override Array.from", e);
}
const Kt = eb();
function zr(e = {}) {
  const {
    emit: t,
    checkoutEveryNms: r,
    checkoutEveryNth: n,
    blockClass: i = "rr-block",
    blockSelector: s = null,
    ignoreClass: o = "rr-ignore",
    ignoreSelector: c = null,
    maskTextClass: l = "rr-mask",
    maskTextSelector: p = null,
    inlineStylesheet: a = !0,
    maskAllInputs: h,
    maskInputOptions: d,
    slimDOMOptions: u,
    maskInputFn: m,
    maskTextFn: f,
    hooks: y,
    packFn: C,
    sampling: k = {},
    dataURLOptions: b = {},
    mousemoveWait: A,
    recordDOM: S = !0,
    recordCanvas: x = !1,
    recordCrossOriginIframes: R = !1,
    recordAfter: I = e.recordAfter === "DOMContentLoaded" ? e.recordAfter : "load",
    userTriggeredOnInput: F = !1,
    collectFonts: z = !1,
    inlineImages: Q = !1,
    plugins: B,
    keepIframeSrcFn: N = () => !1,
    ignoreCSSAttributes: De = /* @__PURE__ */ new Set([]),
    errorHandler: Je
  } = e;
  xk(Je);
  const fe = R ? window.parent === window : !0;
  let pe = !1;
  if (!fe)
    try {
      window.parent.document && (pe = !1);
    } catch {
      pe = !0;
    }
  if (fe && !t)
    throw new Error("emit function is required");
  if (!fe && !pe)
    return () => {
    };
  A !== void 0 && k.mousemove === void 0 && (k.mousemove = A), Kt.reset();
  const Re = h === !0 ? {
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
  } : d !== void 0 ? d : { password: !0 }, Ue = _d(u);
  hk();
  let Te, ke = 0;
  const Ge = (K) => {
    for (const se of B || [])
      se.eventProcessor && (K = se.eventProcessor(K));
    return C && // Disable packing events which will be emitted to parent frames.
    !pe && (K = C(K)), K;
  };
  Ze = (K, se) => {
    var ge;
    const Le = K;
    if (Le.timestamp = Qn(), (ge = Kr[0]) != null && ge.isFrozen() && Le.type !== Ce.FullSnapshot && !(Le.type === Ce.IncrementalSnapshot && Le.data.source === xe.Mutation) && Kr.forEach((je) => je.unfreeze()), fe)
      t == null || t(Ge(Le), se);
    else if (pe) {
      const je = {
        type: "rrweb",
        event: Ge(Le),
        origin: window.location.origin,
        isCheckout: se
      };
      window.parent.postMessage(je, "*");
    }
    if (Le.type === Ce.FullSnapshot)
      Te = Le, ke = 0;
    else if (Le.type === Ce.IncrementalSnapshot) {
      if (Le.data.source === xe.Mutation && Le.data.isAttachIframe)
        return;
      ke++;
      const je = n && ke >= n, ve = r && Le.timestamp - Te.timestamp > r;
      (je || ve) && zi(!0);
    }
  };
  const P = (K) => {
    Ze({
      type: Ce.IncrementalSnapshot,
      data: {
        source: xe.Mutation,
        ...K
      }
    });
  }, Y = (K) => Ze({
    type: Ce.IncrementalSnapshot,
    data: {
      source: xe.Scroll,
      ...K
    }
  }), oe = (K) => Ze({
    type: Ce.IncrementalSnapshot,
    data: {
      source: xe.CanvasMutation,
      ...K
    }
  }), re = (K) => Ze({
    type: Ce.IncrementalSnapshot,
    data: {
      source: xe.AdoptedStyleSheet,
      ...K
    }
  }), ce = new Yk({
    mutationCb: P,
    adoptedStyleSheetCb: re
  }), Ae = new zk({
    mirror: Kt,
    mutationCb: P,
    stylesheetManager: ce,
    recordCrossOriginIframes: R,
    wrappedEmit: Ze
  });
  for (const K of B || [])
    K.getMirror && K.getMirror({
      nodeMirror: Kt,
      crossOriginIframeMirror: Ae.crossOriginIframeMirror,
      crossOriginIframeStyleMirror: Ae.crossOriginIframeStyleMirror
    });
  const Be = new Vk();
  Ko = new Hk({
    recordCanvas: x,
    mutationCb: oe,
    win: window,
    blockClass: i,
    blockSelector: s,
    mirror: Kt,
    sampling: k.canvas,
    dataURLOptions: b
  });
  const Se = new $k({
    mutationCb: P,
    scrollCb: Y,
    bypassOptions: {
      blockClass: i,
      blockSelector: s,
      maskTextClass: l,
      maskTextSelector: p,
      inlineStylesheet: a,
      maskInputOptions: Re,
      dataURLOptions: b,
      maskTextFn: f,
      maskInputFn: m,
      recordCanvas: x,
      inlineImages: Q,
      sampling: k,
      slimDOMOptions: Ue,
      iframeManager: Ae,
      stylesheetManager: ce,
      canvasManager: Ko,
      keepIframeSrcFn: N,
      processedNodeManager: Be
    },
    mirror: Kt
  });
  zi = (K = !1) => {
    if (!S)
      return;
    Ze(
      {
        type: Ce.Meta,
        data: {
          href: window.location.href,
          width: Jd(),
          height: Xd()
        }
      },
      K
    ), ce.reset(), Se.init(), Kr.forEach((ge) => ge.lock());
    const se = Eb(document, {
      mirror: Kt,
      blockClass: i,
      blockSelector: s,
      maskTextClass: l,
      maskTextSelector: p,
      inlineStylesheet: a,
      maskAllInputs: Re,
      maskTextFn: f,
      maskInputFn: m,
      slimDOM: Ue,
      dataURLOptions: b,
      recordCanvas: x,
      inlineImages: Q,
      onSerialize: (ge) => {
        ep(ge, Kt) && Ae.addIframe(ge), tp(ge, Kt) && ce.trackLinkElement(ge), aa(ge) && Se.addShadowRoot(be.shadowRoot(ge), document);
      },
      onIframeLoad: (ge, Le) => {
        Ae.attachIframe(ge, Le), Se.observeAttachShadow(ge);
      },
      onStylesheetLoad: (ge, Le) => {
        ce.attachLinkElement(ge, Le);
      },
      keepIframeSrcFn: N
    });
    if (!se)
      return console.warn("Failed to snapshot the document");
    Ze(
      {
        type: Ce.FullSnapshot,
        data: {
          node: se,
          initialOffset: Kd(window)
        }
      },
      K
    ), Kr.forEach((ge) => ge.unlock()), document.adoptedStyleSheets && document.adoptedStyleSheets.length > 0 && ce.adoptStyleSheets(
      document.adoptedStyleSheets,
      Kt.getId(document)
    );
  };
  try {
    const K = [], se = (Le) => {
      var je;
      return we(Pk)(
        {
          mutationCb: P,
          mousemoveCb: (ve, qe) => Ze({
            type: Ce.IncrementalSnapshot,
            data: {
              source: qe,
              positions: ve
            }
          }),
          mouseInteractionCb: (ve) => Ze({
            type: Ce.IncrementalSnapshot,
            data: {
              source: xe.MouseInteraction,
              ...ve
            }
          }),
          scrollCb: Y,
          viewportResizeCb: (ve) => Ze({
            type: Ce.IncrementalSnapshot,
            data: {
              source: xe.ViewportResize,
              ...ve
            }
          }),
          inputCb: (ve) => Ze({
            type: Ce.IncrementalSnapshot,
            data: {
              source: xe.Input,
              ...ve
            }
          }),
          mediaInteractionCb: (ve) => Ze({
            type: Ce.IncrementalSnapshot,
            data: {
              source: xe.MediaInteraction,
              ...ve
            }
          }),
          styleSheetRuleCb: (ve) => Ze({
            type: Ce.IncrementalSnapshot,
            data: {
              source: xe.StyleSheetRule,
              ...ve
            }
          }),
          styleDeclarationCb: (ve) => Ze({
            type: Ce.IncrementalSnapshot,
            data: {
              source: xe.StyleDeclaration,
              ...ve
            }
          }),
          canvasMutationCb: oe,
          fontCb: (ve) => Ze({
            type: Ce.IncrementalSnapshot,
            data: {
              source: xe.Font,
              ...ve
            }
          }),
          selectionCb: (ve) => {
            Ze({
              type: Ce.IncrementalSnapshot,
              data: {
                source: xe.Selection,
                ...ve
              }
            });
          },
          customElementCb: (ve) => {
            Ze({
              type: Ce.IncrementalSnapshot,
              data: {
                source: xe.CustomElement,
                ...ve
              }
            });
          },
          blockClass: i,
          ignoreClass: o,
          ignoreSelector: c,
          maskTextClass: l,
          maskTextSelector: p,
          maskInputOptions: Re,
          inlineStylesheet: a,
          sampling: k,
          recordDOM: S,
          recordCanvas: x,
          inlineImages: Q,
          userTriggeredOnInput: F,
          collectFonts: z,
          doc: Le,
          maskInputFn: m,
          maskTextFn: f,
          keepIframeSrcFn: N,
          blockSelector: s,
          slimDOMOptions: Ue,
          dataURLOptions: b,
          mirror: Kt,
          iframeManager: Ae,
          stylesheetManager: ce,
          shadowDomManager: Se,
          processedNodeManager: Be,
          canvasManager: Ko,
          ignoreCSSAttributes: De,
          plugins: ((je = B == null ? void 0 : B.filter((ve) => ve.observer)) == null ? void 0 : je.map((ve) => ({
            observer: ve.observer,
            options: ve.options,
            callback: (qe) => Ze({
              type: Ce.Plugin,
              data: {
                plugin: ve.name,
                payload: qe
              }
            })
          }))) || []
        },
        y
      );
    };
    Ae.addLoadListener((Le) => {
      try {
        K.push(se(Le.contentDocument));
      } catch (je) {
        console.warn(je);
      }
    });
    const ge = () => {
      zi(), K.push(se(document)), Vi = !0;
    };
    return ["interactive", "complete"].includes(document.readyState) ? ge() : (K.push(
      kt("DOMContentLoaded", () => {
        Ze({
          type: Ce.DomContentLoaded,
          data: {}
        }), I === "DOMContentLoaded" && ge();
      })
    ), K.push(
      kt(
        "load",
        () => {
          Ze({
            type: Ce.Load,
            data: {}
          }), I === "load" && ge();
        },
        window
      )
    )), () => {
      K.forEach((Le) => {
        try {
          Le();
        } catch (je) {
          String(je).toLowerCase().includes("cross-origin") || console.warn(je);
        }
      }), Be.destroy(), Vi = !1, wk();
    };
  } catch (K) {
    console.warn(K);
  }
}
zr.addCustomEvent = (e, t) => {
  if (!Vi)
    throw new Error("please add custom event after start recording");
  Ze({
    type: Ce.Custom,
    data: {
      tag: e,
      payload: t
    }
  });
};
zr.freezePage = () => {
  Kr.forEach((e) => e.freeze());
};
zr.takeFullSnapshot = (e) => {
  if (!Vi)
    throw new Error("please take full snapshot after start recording");
  zi(e);
};
zr.mirror = Kt;
var _u;
(function(e) {
  e[e.NotStarted = 0] = "NotStarted", e[e.Running = 1] = "Running", e[e.Stopped = 2] = "Stopped";
})(_u || (_u = {}));
const { addCustomEvent: Gv } = zr, { freezePage: Kv } = zr, { takeFullSnapshot: Xv } = zr, Ii = 2, Xo = 4;
class Gk {
  constructor(t) {
    mi(this, "events", []);
    mi(this, "lastMeta", null);
    mi(this, "lastFull", null);
    this.opts = t;
  }
  push(t) {
    t.type === Xo && (this.lastMeta = t), t.type === Ii && (this.lastFull = t, this.events = []), this.events.push(t), this.prune();
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
    const t = [], r = this.events.some((i) => i.type === Ii), n = this.events.some((i) => i.type === Xo);
    return !r && this.lastFull ? (this.lastMeta && t.push(this.lastMeta), t.push(this.lastFull)) : r && !n && this.lastMeta && t.push(this.lastMeta), [...t, ...this.events];
  }
  /** True when the buffer can produce a scrubbable replay: a full snapshot + at least one event to
   *  play beyond the meta+full pair (a lone meta+full renders a single static frame, not a replay). */
  isPlayable() {
    const t = this.snapshot(), r = t.some((i) => i.type === Ii), n = t.some((i) => i.type !== Ii && i.type !== Xo);
    return r && n;
  }
  clear() {
    this.events = [], this.lastMeta = null, this.lastFull = null;
  }
}
function Kk(e, t = {}) {
  const r = t.windowMs ?? 6e4, n = new Gk({
    windowMs: r,
    maxEvents: t.maxEvents ?? 2e3
  }), i = t.maskAllInputs !== !1, s = t.maskText !== !1, o = Math.max(15e3, Math.round(r / 2));
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
      checkoutEveryNms: o,
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
const hp = "klav-sims-live", fp = "klav-sims-overlay", Iu = "klav-sims-ext-css";
let At = null, Vr = null, Ut = null, Cn = null;
const Or = /* @__PURE__ */ new Map(), qt = /* @__PURE__ */ new Map();
let ds = 0, er = !1, Xr = null, An = null, si = !1, yr = null, za = 0, Gr = 0, Nr = /* @__PURE__ */ new Set(), bt = null, Pr = null, Lt = null, lr = [];
const cr = /* @__PURE__ */ new Set();
let Ln = !1, ur = "", it = null, Jr = null, gr = null, Lr = null, ft = null, Zr = null, Jt = null, Xt = null, ar = null, _t = null, Mn = null;
const ps = /* @__PURE__ */ new Set();
function Xk(e) {
  return String(e || "").trim().toLowerCase().replace(/\s+/g, " ");
}
function $a(e, t) {
  return `${e}::${Xk(t.text)}`;
}
const Jk = 0.55, Zk = 0.8, Da = [];
function mp(e) {
  const t = String(e || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim(), r = /* @__PURE__ */ new Set();
  if (!t) return r;
  const n = `  ${t} `;
  for (let i = 0; i < n.length - 2; i++) r.add(n.slice(i, i + 3));
  return r;
}
function Qk(e, t) {
  if (e.size === 0 || t.size === 0) return 0;
  let r = 0;
  for (const n of e) t.has(n) && r++;
  return r / Math.sqrt(e.size * t.size);
}
function ev(e, t) {
  const r = mp(t.text);
  return Da.some((n) => Qk(r, n.grams) >= (n.simId === e ? Jk : Zk));
}
function tv(e, t) {
  ps.add($a(e, t)), Da.push({ simId: e, grams: mp(t.text) });
}
function gp(e) {
  try {
    document.dispatchEvent(new CustomEvent("klavity:sims-live", { detail: { active: e } }));
  } catch {
  }
}
const rv = `
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
`, nv = `
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
function Ou(e, t) {
  const r = e.replace("#", ""), n = (c) => parseInt(c, 16), [i, s, o] = r.length === 3 ? [n(r[0] + r[0]), n(r[1] + r[1]), n(r[2] + r[2])] : [n(r.slice(0, 2)), n(r.slice(2, 4)), n(r.slice(4, 6))];
  return `rgba(${i},${s},${o},${t})`;
}
function iv(e) {
  if (e.suggestedBug) return !0;
  const t = String(e.priority ?? "").trim().toLowerCase();
  if (t && t !== "none") return !0;
  const r = String(e.sentiment ?? "").trim().toLowerCase();
  return r ? !(/* @__PURE__ */ new Set(["positive", "satisfied", "delighted", "neutral", "none"])).has(r) : !1;
}
function ca() {
  var e, t;
  try {
    return ((t = (e = window.matchMedia) == null ? void 0 : e.call(window, "(prefers-reduced-motion: reduce)")) == null ? void 0 : t.matches) ?? !1;
  } catch {
    return !1;
  }
}
function sv(e) {
  return new Promise((t) => setTimeout(t, e));
}
function _n(e) {
  const t = String(e.priority ?? "").trim().toLowerCase();
  return t === "high" || t === "critical" || t === "urgent" ? "HIGH" : t === "medium" || t === "med" ? "MED" : t === "low" ? "LOW" : e.suggestedBug ? "HIGH" : null;
}
const yp = { HIGH: "h", MED: "m", LOW: "l" }, Nu = { HIGH: 0, MED: 1, LOW: 2 };
function ov(e) {
  if (!e) return !1;
  if (e === Ut || e === At || e.id === fp || e.id === hp || e.id === "klavity-widget-host") return !0;
  const t = e.classList;
  return !!t && t.contains("klav-halo");
}
function av(e) {
  const t = [];
  for (const r of [Ut, At])
    r && (t.push({ el: r, vis: r.style.visibility }), r.style.visibility = "hidden");
  try {
    return e();
  } finally {
    for (const { el: r, vis: n } of t) r.style.visibility = n;
  }
}
function bp(e) {
  const t = e.targetViewport;
  return {
    scrollX: Number.isFinite(t == null ? void 0 : t.scrollX) ? Number(t.scrollX) : window.scrollX,
    scrollY: Number.isFinite(t == null ? void 0 : t.scrollY) ? Number(t.scrollY) : window.scrollY,
    width: Math.max(1, Number.isFinite(t == null ? void 0 : t.width) ? Number(t.width) : window.innerWidth),
    height: Math.max(1, Number.isFinite(t == null ? void 0 : t.height) ? Number(t.height) : window.innerHeight)
  };
}
function kp(e, t) {
  return new DOMRect(
    t.scrollX + e.x * t.width,
    t.scrollY + e.y * t.height,
    Math.max(1, e.w * t.width),
    Math.max(1, e.h * t.height)
  );
}
function Pu(e) {
  return Math.max(0, e.width) * Math.max(0, e.height);
}
function lv(e, t) {
  const r = Math.max(e.left, t.left), n = Math.min(e.right, t.right), i = Math.max(e.top, t.top), s = Math.min(e.bottom, t.bottom);
  return Math.max(0, n - r) * Math.max(0, s - i);
}
function cv(e) {
  return new DOMRect(e.left + window.scrollX, e.top + window.scrollY, e.width, e.height);
}
function vp(e) {
  if (!e || !(e instanceof HTMLElement) || e === document.body || e === document.documentElement || ov(e)) return !1;
  const t = e.getBoundingClientRect();
  if (t.width < 8 || t.height < 8) return !1;
  try {
    const r = getComputedStyle(e);
    if (r.display === "none" || r.visibility === "hidden" || Number(r.opacity) === 0) return !1;
  } catch {
  }
  return !0;
}
function uv(e, t) {
  return av(() => {
    const r = /* @__PURE__ */ new Set(), n = [], i = (o) => {
      let c = o;
      for (; c && c !== document.body && c !== document.documentElement; )
        !r.has(c) && vp(c) && (r.add(c), n.push(c)), c = c.parentElement;
    }, s = typeof document.elementsFromPoint == "function" ? document.elementsFromPoint(e, t) : [document.elementFromPoint(e, t)].filter(Boolean);
    for (const o of s) i(o);
    return n;
  });
}
function dv(e, t) {
  const r = bp(t), n = kp(e, r), i = Math.max(2, Math.min(window.innerWidth - 2, n.left + n.width / 2 - window.scrollX)), s = Math.max(2, Math.min(window.innerHeight - 2, n.top + n.height / 2 - window.scrollY)), o = uv(i, s);
  if (!o.length) return null;
  const c = Math.max(1, Pu(n));
  let l = null, p = -1 / 0;
  for (const a of o) {
    const h = cv(a.getBoundingClientRect()), d = lv(h, n);
    if (d <= 0) continue;
    const u = Math.max(1, Pu(h)), m = d / c, f = Math.max(0, (u - d) / u), y = a.tagName.toLowerCase(), C = /^(button|a|input|textarea|select|label|section|article|nav|header|footer|main|form)$/.test(y) ? 0.18 : 0, k = u > window.innerWidth * window.innerHeight * 0.92 ? 0.8 : 0, b = m - f * 0.35 + C - k;
    b > p && (l = a, p = b);
  }
  return l ?? o[0] ?? null;
}
async function pv(e, t) {
  if (e >= window.scrollX + 80 && e <= window.scrollX + window.innerWidth - 80 && t >= window.scrollY + 80 && t <= window.scrollY + window.innerHeight - 80) return;
  const i = Math.max(0, document.documentElement.scrollHeight - window.innerHeight), s = Math.max(0, document.documentElement.scrollWidth - window.innerWidth), o = Math.max(0, Math.min(i, t - window.innerHeight * 0.38)), c = Math.max(0, Math.min(s, e - window.innerWidth * 0.45));
  try {
    window.scrollTo({ top: o, left: c, behavior: ca() ? "auto" : "smooth" });
  } catch {
    window.scrollTo(c, o);
  }
  await sv(ca() ? 80 : 520);
}
const hv = /* @__PURE__ */ new Set([
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
function fv(e) {
  const t = /* @__PURE__ */ new Set();
  return String(e || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((r) => r.length < 4 || hv.has(r) || t.has(r) ? !1 : (t.add(r), !0));
}
function mv(e) {
  const t = fv(e.text);
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
  for (const o of s) {
    if (!vp(o)) continue;
    const c = o.getBoundingClientRect(), l = [
      o.textContent || "",
      o.getAttribute("aria-label") || "",
      o.getAttribute("title") || "",
      o.getAttribute("placeholder") || "",
      o.getAttribute("data-testid") || "",
      o.id || "",
      typeof o.className == "string" ? o.className : ""
    ].join(" ").toLowerCase();
    if (!l.trim()) continue;
    const p = t.reduce((f, y) => f + (l.includes(y) ? 1 : 0), 0);
    if (!p) continue;
    const a = o.tagName.toLowerCase(), h = /^(button|a|input|textarea|select|label|h1|h2|h3|section|article|nav|header|footer|main|form)$/.test(a) ? 0.6 : 0, u = Math.max(1, c.width * c.height) > window.innerWidth * window.innerHeight * 0.85 ? 1.1 : 0, m = p / t.length + h - u;
    m > i && (n = o, i = m);
  }
  return n;
}
async function gv(e, t = {}) {
  if (e.region) {
    const r = bp(e), n = kp(e.region, r);
    t.scroll !== !1 && await pv(n.left + n.width / 2, n.top + n.height / 2);
    const i = dv(e.region, e);
    if (i) return i;
  }
  return mv(e);
}
function yv() {
  if (At && Vr) return Vr;
  At = document.createElement("div"), At.id = hp, At.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;", Vr = At.attachShadow({ mode: "open" }), ny(Vr);
  const e = document.createElement("style");
  return e.textContent = rv, Vr.appendChild(e), document.body.appendChild(At), Vr;
}
function xp() {
  if (Ut) return Ut;
  if (!document.getElementById(Iu)) {
    const e = document.createElement("style");
    e.id = Iu, e.textContent = nv, document.head.appendChild(e);
  }
  return Ut = document.createElement("div"), Ut.id = fp, Ut.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;z-index:2147483640;pointer-events:none;overflow:visible;", document.body.appendChild(Ut), Ut;
}
function wp(e, t) {
  return ty({
    name: e.name,
    initials: e.initials,
    photoUrl: e.photoUrl,
    color: e.accent,
    animate: !1,
    legs: !0,
    size: t
  });
}
function Sp() {
  Jr && (Jr.textContent = "", [...Nr].slice(0, 3).forEach((e) => {
    const t = Or.get(e);
    t && Jr.appendChild(wp(t, 26));
  }));
}
function bv(e, t = {}) {
  if (!(typeof document > "u")) {
    if (!At || !At.isConnected) {
      Ep(e.map((r) => r.id), e, t);
      return;
    }
    t.onClose && (bt = t.onClose), t.simControls && (Pr = t.simControls);
    for (const r of e.slice(0, 8))
      Or.has(r.id) || Or.set(r.id, { simId: r.id, accent: r.accent || "#6366f1", initials: r.initials || r.name.slice(0, 2).toUpperCase(), name: r.name, photoUrl: r.photoUrl });
    Nr = new Set(e.slice(0, 8).map((r) => r.id)), Sp(), sn(), er && en();
  }
}
function Gi() {
  var e;
  Xe(Lt), Lt = null, cr.clear(), ur = "", (e = ft == null ? void 0 : ft.querySelector(".ksl-sims-btn")) == null || e.setAttribute("aria-expanded", "false");
}
function kv(e) {
  if (Lt) {
    Gi();
    return;
  }
  !ft || !Pr || (Lt = document.createElement("div"), Lt.className = "ksl-simmenu", Lt.setAttribute("role", "dialog"), Lt.setAttribute("aria-label", "Run or stop Sims"), ft.appendChild(Lt), e.setAttribute("aria-expanded", "true"), lr = [], _r(!0), Pr.list().then((t) => {
    lr = t, _r();
  }).catch((t) => {
    ur = (t == null ? void 0 : t.message) || "Couldn't load your Sims.", _r();
  }));
}
function vv(e) {
  const t = document.createElement("div"), r = cr.has(e.id);
  t.className = "ksl-sm-row" + (e.active ? e.running ? " is-running" : "" : " is-off") + (r ? " is-sel" : ""), t.dataset.simId = e.id;
  const n = document.createElement("span");
  n.className = "ksl-sm-av", n.style.background = xv(e.accent) || "#6366f1", n.textContent = (e.initials || e.name.slice(0, 2)).slice(0, 2).toUpperCase();
  const i = document.createElement("div");
  i.className = "ksl-sm-meta";
  const s = document.createElement("div");
  s.className = "ksl-sm-name", s.textContent = e.name;
  const o = document.createElement("div");
  if (o.className = "ksl-sm-st", o.textContent = e.active ? e.running ? "Running" : "Not running" : "Deactivated", o.dataset.kind = "run", i.append(s, o), !e.active) {
    t.setAttribute("aria-disabled", "true"), t.tabIndex = 0;
    const a = () => {
      ur = `${e.name} is deactivated. Activate this Sim on the Sims tab to run it.`, _r();
    };
    return t.addEventListener("click", a), t.addEventListener("keydown", (h) => {
      (h.key === " " || h.key === "Enter") && (h.preventDefault(), a());
    }), t.append(n, i), t;
  }
  const c = document.createElement("span");
  c.className = "ksl-sm-chk" + (r ? " on" : ""), c.innerHTML = r ? H("check", { size: 11 }) : "", t.setAttribute("role", "checkbox"), t.setAttribute("aria-checked", String(r)), t.tabIndex = 0;
  const l = () => {
    Ln || (r ? cr.delete(e.id) : cr.add(e.id), ur = "", _r());
  };
  t.addEventListener("click", l), t.addEventListener("keydown", (a) => {
    a.target === t && (a.key === " " || a.key === "Enter") && (a.preventDefault(), l());
  });
  const p = document.createElement("button");
  return p.type = "button", p.className = "ksl-sm-act" + (e.running ? " is-stop" : ""), p.dataset.action = e.running ? "stop" : "run", p.disabled = Ln, p.setAttribute("aria-label", `${e.running ? "Stop" : "Run"} ${e.name}`), p.innerHTML = H(e.running ? "square" : "play", { size: 11 }) + `<span>${e.running ? "Stop" : "Run"}</span>`, p.addEventListener("click", (a) => {
    a.stopPropagation(), ua(e.running ? "stop" : "run", [e.id]);
  }), p.addEventListener("keydown", (a) => a.stopPropagation()), t.append(c, n, i, p), t;
}
function _r(e = !1) {
  var x;
  const t = Lt;
  if (!t) return;
  const r = ((x = t.querySelector(".ksl-sm-list")) == null ? void 0 : x.scrollTop) ?? 0;
  t.textContent = "";
  const n = lr.filter((R) => R.active), i = n.filter((R) => R.running), s = n.filter((R) => !R.running), o = lr.filter((R) => !R.active), c = document.createElement("div");
  c.className = "ksl-sm-head";
  const l = document.createElement("button");
  l.type = "button", l.className = "ksl-sm-back", l.setAttribute("aria-label", "Back to findings"), l.title = "Back to findings", l.innerHTML = H("chevron-left", { size: 16 }), l.addEventListener("click", () => Gi());
  const p = document.createElement("div");
  p.className = "ksl-sm-titles";
  const a = document.createElement("div");
  a.className = "ksl-sm-title", a.textContent = "Sims on this page";
  const h = document.createElement("div");
  h.className = "ksl-sm-sub", h.textContent = e ? "Loading…" : n.length ? `${i.length} of ${n.length} running` : "No activated Sims yet", p.append(a, h);
  const d = document.createElement("span");
  d.className = "ksl-head-btns";
  const u = document.createElement("button");
  if (u.type = "button", u.className = "ksl-icon-btn ksl-sm-min", u.title = "Minimize", u.setAttribute("aria-label", "Minimize Sims feedback panel"), u.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>', u.addEventListener("click", () => {
    Gi(), $i();
  }), d.appendChild(u), bt) {
    const R = document.createElement("button");
    R.type = "button", R.className = "ksl-icon-btn ksl-close-btn ksl-sm-close", R.title = "Close and stop all Sims", R.setAttribute("aria-label", "Close Sims feedback and stop all Sims"), R.innerHTML = H("x", { size: 15 }), R.addEventListener("click", () => {
      try {
        bt == null || bt();
      } catch {
      }
    }), d.appendChild(R);
  }
  c.append(l, p, d), t.appendChild(c);
  const m = document.createElement("div");
  if (m.className = "ksl-sm-list", e) m.innerHTML = '<div class="ksl-sm-empty">Loading Sims…</div>';
  else if (!lr.length) m.innerHTML = '<div class="ksl-sm-empty">No Sims in this project yet.</div>';
  else {
    if (n.length > 1) {
      const I = n.filter((De) => cr.has(De.id)).length, F = I === n.length, z = document.createElement("div");
      z.className = "ksl-sm-all", z.setAttribute("role", "checkbox"), z.setAttribute("aria-checked", F ? "true" : I ? "mixed" : "false"), z.tabIndex = 0;
      const Q = document.createElement("span");
      Q.className = "ksl-sm-chk" + (F ? " on" : I ? " mixed" : ""), Q.innerHTML = F ? H("check", { size: 11 }) : I ? '<span style="width:8px;height:2px;background:#fff;border-radius:2px"></span>' : "";
      const B = document.createElement("span");
      B.textContent = "Select all", z.append(Q, B);
      const N = () => {
        Ln || (n.forEach((De) => F ? cr.delete(De.id) : cr.add(De.id)), ur = "", _r());
      };
      z.addEventListener("click", N), z.addEventListener("keydown", (De) => {
        (De.key === " " || De.key === "Enter") && (De.preventDefault(), N());
      }), m.appendChild(z);
    }
    const R = (I, F, z) => {
      if (!F.length) return;
      const Q = document.createElement("div");
      if (Q.className = "ksl-sm-group", Q.textContent = `${I} · ${F.length}`, m.appendChild(Q), z) {
        const B = document.createElement("div");
        B.className = "ksl-sm-group-note", B.textContent = z, m.appendChild(B);
      }
      for (const B of F) m.appendChild(vv(B));
    };
    R("Running", i), R("Not running", s), R("Deactivated", o, "Activate these on the Sims tab to run them here.");
  }
  if (t.appendChild(m), m.scrollTop = r, ur) {
    const R = document.createElement("div");
    R.className = "ksl-sm-note", R.setAttribute("role", "status"), R.textContent = ur, t.appendChild(R);
  }
  const f = n.filter((R) => cr.has(R.id)), y = f.filter((R) => !R.running).map((R) => R.id), C = f.filter((R) => R.running).map((R) => R.id), k = document.createElement("div");
  k.className = "ksl-sm-foot";
  const b = document.createElement("span");
  b.className = "ksl-sm-cnt", b.textContent = f.length ? `${f.length} selected` : "Tick Sims to run or stop several";
  const A = document.createElement("button");
  A.type = "button", A.className = "ksl-sm-bulk", A.dataset.action = "run-selected", A.disabled = Ln || !y.length, A.innerHTML = H("play", { size: 11 }) + `<span>Run${y.length ? " " + y.length : ""}</span>`, A.addEventListener("click", () => void ua("run", y));
  const S = document.createElement("button");
  S.type = "button", S.className = "ksl-sm-bulk is-stop", S.dataset.action = "stop-selected", S.disabled = Ln || !C.length, S.innerHTML = H("square", { size: 11 }) + `<span>Stop${C.length ? " " + C.length : ""}</span>`, S.addEventListener("click", () => void ua("stop", C)), k.append(b, A, S), t.appendChild(k);
}
let Jo = Promise.resolve(), Oi = 0;
async function ua(e, t) {
  if (!Pr || !t.length) return;
  const r = Pr, n = new Set(t);
  lr = lr.map((s) => s.active && n.has(s.id) ? { ...s, running: e === "run" } : s);
  for (const s of t) cr.delete(s);
  const i = t.length;
  ur = e === "run" ? `${i === 1 ? "Sim is" : `${i} Sims are`} running.` : `${i === 1 ? "Sim" : `${i} Sims`} stopped. Reported issues stay here and in Sim Reports.`, _r(), Oi++, Jo = Jo.then(async () => {
    try {
      const s = await (e === "run" ? r.run(t) : r.stop(t));
      Oi--, Oi || (lr = s);
    } catch (s) {
      Oi--, ur = (s == null ? void 0 : s.message) || "Couldn't update the Sims — please try again.";
      try {
        lr = await r.list();
      } catch {
      }
    }
    Lt && Lt.isConnected && _r();
  }), await Jo;
}
function xv(e) {
  return /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(String(e || "")) ? String(e) : null;
}
function Ep(e, t = [], r = {}) {
  if (typeof document > "u") return;
  pa(), bt = r.onClose ?? null, Pr = r.simControls ?? null;
  const n = yv();
  xp(), Cn = new AbortController();
  const i = e === "all" ? t : t.filter((d) => e.includes(d.id));
  if (!i.length) {
    console.warn("[KlavitySims] deploy(): no matching Sims — panel not mounted."), pa();
    return;
  }
  i.slice(0, 8).forEach((d) => {
    const u = d.accent || "#6366f1", m = d.initials || d.name.slice(0, 2).toUpperCase();
    Or.set(d.id, { simId: d.id, accent: u, initials: m, name: d.name, photoUrl: d.photoUrl });
  });
  const s = document.createElement("div");
  s.className = "ksl-root", n.appendChild(s), _t = document.createElement("div"), _t.className = "ksl-sr", _t.id = "ksl-announcer", _t.setAttribute("aria-live", "polite"), _t.setAttribute("aria-atomic", "true"), s.appendChild(_t), it = document.createElement("button"), it.type = "button", it.className = "ksl-launcher", it.setAttribute("aria-label", "Open Sims feedback panel"), it.addEventListener("click", () => Ev());
  const o = document.createElement("span");
  o.className = "ksl-pill", Jr = document.createElement("span"), Jr.className = "ksl-pill-avatars", gr = document.createElement("span"), gr.className = "ksl-pill-txt", o.append(Jr, gr), Lr = document.createElement("span"), Lr.className = "ksl-pill-badge", Lr.hidden = !0, it.append(o, Lr);
  const c = document.createElement("div");
  if (c.className = "ksl-launch-group", c.appendChild(it), bt) {
    const d = document.createElement("button");
    d.type = "button", d.className = "ksl-stop-all", d.title = "Stop all Sims", d.setAttribute("aria-label", "Stop all Sims"), d.textContent = "Stop", d.addEventListener("click", (u) => {
      u.stopPropagation();
      try {
        bt == null || bt();
      } catch {
      }
    }), c.appendChild(d);
  }
  s.appendChild(c), Nr = new Set(i.slice(0, 8).map((d) => d.id)), Sp(), ft = document.createElement("section"), ft.className = "ksl-panel", ft.setAttribute("aria-label", "Sims feedback"), ft.setAttribute("role", "dialog");
  const l = document.createElement("div");
  l.className = "ksl-head";
  const p = document.createElement("div");
  p.className = "ksl-title-row";
  const a = document.createElement("div");
  a.className = "ksl-title", a.textContent = "Sims feedback";
  const h = document.createElement("button");
  if (h.type = "button", h.className = "ksl-icon-btn", h.title = "Minimize", h.setAttribute("aria-label", "Minimize Sims feedback panel"), bt) {
    h.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>', h.addEventListener("click", () => $i());
    const d = document.createElement("button");
    d.type = "button", d.className = "ksl-icon-btn ksl-close-btn", d.title = "Close and stop all Sims", d.setAttribute("aria-label", "Close Sims feedback and stop all Sims"), d.innerHTML = H("x", { size: 15 }), d.addEventListener("click", () => {
      try {
        bt == null || bt();
      } catch {
      }
    });
    const u = document.createElement("span");
    if (u.className = "ksl-head-btns", Pr) {
      const m = document.createElement("button");
      m.type = "button", m.className = "ksl-sims-btn", m.setAttribute("aria-haspopup", "dialog"), m.setAttribute("aria-expanded", "false"), m.title = "Run or stop Sims", m.innerHTML = H("users", { size: 14 }) + "<span>Sims</span>", m.addEventListener("click", () => kv(m)), u.append(m);
    }
    u.append(h, d), p.append(a, u);
  } else
    h.innerHTML = H("x", { size: 15 }), h.addEventListener("click", () => $i()), p.append(a, h);
  Zr = document.createElement("div"), Zr.className = "ksl-count", Jt = document.createElement("div"), Jt.className = "ksl-status", Jt.hidden = !0, Jt.setAttribute("role", "status"), Xt = document.createElement("div"), Xt.className = "ksl-chips", l.append(p, Zr, Jt, Xt), ar = document.createElement("div"), ar.className = "ksl-list", ar.setAttribute("role", "list"), ft.append(l, ar), s.appendChild(ft), document.addEventListener("keydown", (d) => {
    if (d.key === "Escape" && Lt) {
      Gi();
      return;
    }
    d.key === "Escape" && er && $i();
  }, { signal: Cn.signal }), gp(!0), sn();
}
function Fa(e) {
  si = e, it == null || it.classList.toggle("is-reviewing", e), sn(), er && en();
}
function Ua() {
  const e = Nr.size || Or.size, t = e === 1 ? "Sim is" : "Sims are";
  switch (yr) {
    case "analysing":
      return `${e === 1 ? "Sim is" : `${e} Sims are`} analysing this page…`;
    case "running":
      return `${t} running on this page…`;
    case "completed": {
      const r = ds - za;
      return `Sim run completed · ${r ? `${r} new finding${r === 1 ? "" : "s"}` : "no new findings"}`;
    }
    case "failed":
      return "Sim run didn't finish — it will retry on the next change.";
    default:
      return "";
  }
}
function wv(e) {
  e === "analysing" ? (Gr === 0 && (za = ds), Gr++) : e === "completed" || e === "failed" ? (Gr = Math.max(0, Gr - 1), Gr > 0 && (e = "running")) : e === null && (Gr = 0), yr = e, Fa(e === "analysing" || e === "running"), _t && e && (_t.textContent = Ua());
}
function Sv() {
  if (!Jt || (Jt.hidden = !yr, Jt.className = "ksl-status" + (yr ? ` is-${yr}` : ""), Jt.textContent = "", !yr)) return;
  const e = document.createElement("span");
  e.className = "ksl-status-dot";
  const t = document.createElement("span");
  t.className = "ksl-status-txt", t.textContent = Ua(), Jt.append(e, t);
}
function Ev() {
  !ft || !it || (er = !0, ft.classList.add("is-open"), it.hidden = !0, it.parentElement && (it.parentElement.hidden = !0), en());
}
function $i() {
  !ft || !it || (er = !1, ft.classList.remove("is-open"), it.hidden = !1, it.parentElement && (it.parentElement.hidden = !1), sn());
}
function Cp() {
  const e = Array.from(qt.values()), t = new Set(e.map((n) => n.entry.simId)), r = e.filter((n) => _n(n.obs) === "HIGH").length;
  return { total: e.length, sims: t.size, high: r };
}
function sn() {
  const e = Cp();
  if (gr)
    if (yr === "analysing" || yr === "running")
      gr.textContent = Ua();
    else if (si && e.total === 0)
      gr.innerHTML = "Your Sims are reviewing…";
    else if (e.total === 0) {
      const t = Nr.size || Or.size;
      gr.innerHTML = `${t} Sim${t === 1 ? " is" : "s are"} running on this page`;
    } else
      gr.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from your Sims`;
  Lr && (Lr.hidden = e.high === 0, Lr.textContent = `${e.high} high`), Sv(), er && Mp(e);
}
function Mp(e) {
  Zr && (e.total === 0 ? Zr.innerHTML = si ? "Your Sims are reviewing this page…" : "No findings yet — your Sims are watching." : Zr.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from <b>${e.sims}</b> Sim${e.sims === 1 ? "" : "s"}` + (e.high > 0 ? ` · <span class="ksl-hi">${e.high} high</span>` : "")), Cv();
}
function Cv() {
  if (!Xt) return;
  const e = Array.from(qt.values());
  if (Xt.hidden = e.length === 0, Xt.textContent = "", !e.length) return;
  const t = document.createElement("span");
  t.className = "ksl-chips-label", t.textContent = "Sim", Xt.appendChild(t);
  const r = /* @__PURE__ */ new Map();
  e.forEach((i) => {
    const s = r.get(i.entry.simId) ?? { entry: i.entry, n: 0 };
    s.n += 1, r.set(i.entry.simId, s);
  }), r.forEach(({ entry: i, n: s }) => {
    const o = document.createElement("button");
    o.type = "button", o.className = "ksl-chip" + (Xr === i.simId ? " is-on" : ""), o.setAttribute("aria-pressed", String(Xr === i.simId));
    const c = document.createElement("span");
    c.className = "ksl-dot", c.style.background = i.accent, o.append(c, document.createTextNode(`${i.initials} · ${s}`)), o.addEventListener("click", () => {
      Xr = Xr === i.simId ? null : i.simId, en();
    }), Xt.appendChild(o);
  });
  const n = document.createElement("span");
  n.className = "ksl-chips-label", n.style.marginLeft = "6px", n.textContent = "Priority", Xt.appendChild(n), ["HIGH", "MED", "LOW"].forEach((i) => {
    const s = e.filter((l) => _n(l.obs) === i).length;
    if (!s) return;
    const o = document.createElement("button");
    o.type = "button";
    const c = An === i;
    o.className = "ksl-chip" + (c ? ` sev-on-${yp[i]}` : ""), o.setAttribute("aria-pressed", String(c)), o.textContent = `${i} · ${s}`, o.addEventListener("click", () => {
      An = An === i ? null : i, en();
    }), Xt.appendChild(o);
  });
}
function Mv() {
  return Array.from(qt.values()).filter((e) => !Xr || e.entry.simId === Xr).filter((e) => !An || _n(e.obs) === An).sort((e, t) => {
    const r = _n(e.obs), n = _n(t.obs), i = r ? Nu[r] : 3, s = n ? Nu[n] : 3;
    return i - s;
  });
}
function Rv(e) {
  const { entry: t, obs: r } = e, n = _n(r), i = document.createElement("div");
  i.className = "ksl-row", i.setAttribute("role", "listitem"), i.dataset.id = e.id, i.style.borderLeftColor = t.accent;
  const s = document.createElement("div");
  s.className = "ksl-r-head", s.appendChild(wp(t, 26));
  const o = document.createElement("span");
  o.className = "ksl-r-name", o.style.color = t.accent, o.textContent = t.name, s.appendChild(o);
  const c = String(r.sentiment ?? "").trim();
  if (c) {
    const m = document.createElement("span");
    m.className = "ksl-r-sent", m.textContent = c, s.appendChild(m);
  }
  if (n) {
    const m = document.createElement("span");
    m.className = `ksl-sev ${yp[n]}`, m.setAttribute("aria-label", `Priority: ${n}`), m.textContent = n, s.appendChild(m);
  }
  i.appendChild(s);
  const l = document.createElement("div");
  l.className = "ksl-r-obs", l.textContent = r.text || "", i.appendChild(l);
  const p = document.createElement("button");
  p.type = "button", p.className = "ksl-r-expand", p.textContent = "Show more", p.addEventListener("click", () => {
    const m = i.classList.toggle("is-expanded");
    p.textContent = m ? "Show less" : "Show more";
  }), i.appendChild(p);
  const a = document.createElement("div");
  a.className = "ksl-r-actions";
  const h = document.createElement("button");
  h.type = "button", h.className = "ksl-r-act track", h.innerHTML = H("bug", { size: 12 }) + " Track as Bug", h.setAttribute("aria-label", `Track feedback from ${t.name} as a bug`), h.addEventListener("click", () => {
    var m;
    (m = Di.onTriage) == null || m.call(Di, r, t.name), zu(e.id);
  });
  const d = document.createElement("button");
  d.type = "button", d.className = "ksl-r-act jump", d.innerHTML = H("map-pin", { size: 12 }) + " Jump to on page", d.setAttribute("aria-label", `Jump to where ${t.name} flagged this`), d.addEventListener("click", () => {
    Av(e.id);
  });
  const u = document.createElement("button");
  return u.type = "button", u.className = "ksl-r-act dismiss", u.textContent = "Dismiss", u.setAttribute("aria-label", `Dismiss feedback from ${t.name}`), u.addEventListener("click", () => {
    zu(e.id);
  }), a.append(h, d, u), i.appendChild(a), i;
}
function Tv(e) {
  e.querySelectorAll(".ksl-row").forEach((t) => {
    const r = t.querySelector(".ksl-r-obs");
    r && r.scrollHeight - r.clientHeight > 4 && t.classList.add("is-clamped");
  });
}
function en() {
  if (!ar || !er) {
    sn();
    return;
  }
  const e = Cp();
  Mp(e);
  const t = Mv();
  if (ar.textContent = "", !t.length) {
    const n = document.createElement("div");
    n.className = "ksl-empty";
    const i = qt.size > 0;
    if (si && !i) {
      const s = document.createElement("div");
      s.className = "ksl-empty-title", s.textContent = "Your Sims are reviewing this page…";
      const o = document.createElement("div");
      o.textContent = "Findings will appear here as they spot things.";
      const c = document.createElement("div");
      c.className = "ksl-shimmer", n.append(s, o, c);
    } else if (i)
      n.textContent = "No findings match these filters.";
    else {
      const s = document.createElement("div");
      s.className = "ksl-empty-title", s.textContent = "No findings yet";
      const o = document.createElement("div");
      o.textContent = "Your Sims are watching this page as a first-time customer would.", n.append(s, o);
    }
    ar.appendChild(n), qt.forEach((s) => {
      s.rowEl = null;
    });
    return;
  }
  t.forEach((n) => {
    const i = Rv(n);
    n.rowEl = i, ar.appendChild(i);
  });
  const r = new Set(t.map((n) => n.id));
  qt.forEach((n) => {
    r.has(n.id) || (n.rowEl = null);
  }), Tv(ar);
}
function da() {
  Mn == null || Mn(), Mn = null;
}
async function Av(e) {
  const t = qt.get(e);
  if (!t) return;
  const r = await gv(t.obs, { scroll: !0 });
  !r || !Ut || Lv(r, t.entry.accent);
}
function Lv(e, t) {
  da();
  const r = xp(), n = document.createElement("div");
  n.className = "klav-halo", n.style.borderColor = t, n.style.boxShadow = `0 0 0 4px ${Ou(t, 0.16)},0 0 24px ${Ou(t, 0.2)}`, r.appendChild(n);
  const i = new AbortController(), s = () => {
    const p = e.getBoundingClientRect(), a = p.width > 0 && p.height > 0 && p.bottom > 0 && p.right > 0 && p.top < window.innerHeight && p.left < window.innerWidth;
    n.style.display = a ? "" : "none", a && (n.style.left = `${p.left - 5}px`, n.style.top = `${p.top - 5}px`, n.style.width = `${p.width + 10}px`, n.style.height = `${p.height + 10}px`);
  }, o = () => requestAnimationFrame(s);
  s(), window.addEventListener("scroll", o, { passive: !0, signal: i.signal }), window.addEventListener("resize", o, { signal: i.signal });
  const c = setTimeout(() => {
    n.style.opacity = "0", n.style.transition = "opacity .3s ease", setTimeout(() => {
      Mn === l && da();
    }, 320);
  }, 3200), l = () => {
    clearTimeout(c), i.abort(), Xe(n);
  };
  Mn = l;
}
function _v(e, t) {
  const r = `f_${e.simId}_${++ds}`;
  qt.set(r, { id: r, entry: e, obs: t, rowEl: null }), er ? en() : sn(), _t && (_t.textContent = "", requestAnimationFrame(() => {
    _t && (_t.textContent = `${e.name}: ${t.text || ""}`);
  }));
}
function Iv(e) {
  const t = qt.get(e);
  if (!t) return;
  const r = () => {
    qt.delete(e), er ? en() : sn();
  };
  t.rowEl && er ? (t.rowEl.classList.add("is-removing"), setTimeout(r, ca() ? 0 : 300)) : r();
}
function zu(e) {
  const t = qt.get(e);
  t && (ps.add($a(t.entry.simId, t.obs)), Iv(e));
}
function Ov(e, t, r) {
  if (!At) return;
  const n = Or.get(e);
  if (!n) {
    console.warn(`[KlavitySims] renderFeedback: simId "${e}" not registered`);
    return;
  }
  if (r.length && !(Nr.size && !Nr.has(e))) {
    Fa(!1);
    for (const i of r) {
      if (!iv(i)) continue;
      const s = $a(e, i);
      ps.has(s) || ev(e, i) || (tv(e, i), _v(n, i));
    }
  }
}
function pa() {
  da(), qt.clear(), ds = 0, Or.clear(), ps.clear(), Da.length = 0, er = !1, Xr = null, An = null, si = !1, yr = null, za = 0, Gr = 0, Nr = /* @__PURE__ */ new Set(), bt = null, Pr = null, Lt = null, lr = [], cr.clear(), Ln = !1, ur = "", Cn == null || Cn.abort(), Cn = null, it = null, Jr = null, gr = null, Lr = null, ft = null, Zr = null, Jt = null, Xt = null, ar = null, _t = null, Xe(Ut), Ut = null, Xe(At), At = null, Vr = null, gp(!1);
}
const Di = {
  deploy: Ep,
  updateSims: bv,
  setReviewing: Fa,
  setRunStatus: wv,
  renderFeedback: Ov,
  undeploy: pa,
  onTriage: null
};
function Nv() {
  typeof window > "u" || window.KlavitySims || (window.KlavitySims = Di);
}
typeof window < "u" && Nv();
const $u = "klav-ao-css", Pv = "klav-ao-overlay";
function zv(e, t, r, n, i, s = 10) {
  const l = !(e.y - r - 14 >= s), p = l ? e.y + e.h + 14 : e.y - r - 14, a = Math.max(s, Math.min(p, i - r - s));
  return { left: Math.max(s, Math.min(e.x, n - t - s)), top: a, below: l };
}
const $v = `
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
let Yr = null, Dv = 1;
const Ki = /* @__PURE__ */ new Map();
function Du(e, t) {
  const r = e.replace("#", ""), n = (c) => parseInt(c, 16), [i, s, o] = r.length === 3 ? [n(r[0] + r[0]), n(r[1] + r[1]), n(r[2] + r[2])] : [n(r.slice(0, 2)), n(r.slice(2, 4)), n(r.slice(4, 6))];
  return `rgba(${i},${s},${o},${t})`;
}
function Fv() {
  if (Yr) return Yr;
  if (!document.getElementById($u)) {
    const e = document.createElement("style");
    e.id = $u, e.textContent = $v, document.head.appendChild(e);
  }
  return Yr = document.createElement("div"), Yr.id = Pv, Yr.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;pointer-events:none;overflow:visible;z-index:2147483640;", document.body.appendChild(Yr), Yr;
}
function Jv(e, t, r = {}) {
  const n = Fv(), i = r.color ?? "#6366f1", s = `klav-ao-${Dv++}`, o = 5, c = document.createElement("div");
  c.className = "klav-ao-halo", c.dataset.aoId = s, c.style.left = e.x - o + "px", c.style.top = e.y - o + "px", c.style.width = e.w + o * 2 + "px", c.style.height = e.h + o * 2 + "px", c.style.borderColor = i, c.style.boxShadow = `0 0 0 4px ${Du(i, 0.14)},0 0 24px ${Du(i, 0.18)}`, n.appendChild(c);
  let l = null;
  if (t) {
    const h = { x: e.x - o, y: e.y - o, w: e.w + o * 2, h: e.h + o * 2 }, { left: d, top: u, below: m } = zv(
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
    const C = r.priority ?? r.severity;
    if (C) {
      const b = C === "medium" ? " sev-m" : C === "low" ? " sev-l" : "", A = document.createElement("span");
      A.className = `klav-ao-sev${b}`, A.textContent = C, f.appendChild(A);
    }
    const k = document.createElement("button");
    k.className = "klav-ao-dismiss", k.textContent = "Dismiss", k.addEventListener("click", () => Rp(s)), l.appendChild(f), l.appendChild(k), n.appendChild(l);
  }
  return Ki.set(s, { halo: c, pin: l }), s;
}
function Rp(e) {
  const t = Ki.get(e);
  if (!t) return;
  Ki.delete(e);
  const { halo: r, pin: n } = t;
  n ? (n.classList.add("is-out"), r.style.animation = "klav-ao-pin-out .22s ease-in forwards", setTimeout(() => {
    Xe(n), Xe(r);
  }, 240)) : Xe(r);
}
function Zv() {
  for (const e of [...Ki.keys()]) Rp(e);
}
let Ba = kn, Ar = "";
const Tp = { consoleErrors: [], networkFailures: [] };
let qa, Ap, In = null;
function bn() {
  return Ba.backendUrl || cd;
}
const Uv = 15e3;
function jn(e, t = {}, r = Uv) {
  const n = new AbortController(), i = setTimeout(() => n.abort(), r);
  return fetch(e, { ...t, signal: n.signal }).finally(() => clearTimeout(i));
}
function Lp(e) {
  const t = {};
  for (const [r, n] of Object.entries(e))
    n != null && (t[String(r).slice(0, 64)] = String(n).slice(0, 1e3));
  return t;
}
async function Fu() {
  return Tm(document.body, {
    filter: (e) => e.id !== "klavity-sdk-host"
  });
}
function Bv() {
  return qm(Tp, { identity: qa, metadata: Ap });
}
async function qv(e) {
  return zm(
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
    Ba,
    { backend: ay }
  );
}
function Wa(e = "bug") {
  const t = Yg(e, {
    onCaptureFull: Fu,
    // #638: render the "Attach console logs" toggle (default OFF). Console errors ride the report only when
    // the reporter opts in (p.attachConsole) — parity with the widget's privacy-preserving default.
    consoleAttachToggle: !0,
    // Pre-compress each screenshot as it's captured (runs while the reporter types), same as the widget —
    // by submit time the promise is settled so there's zero compression delay before upload.
    compressImage: oc,
    // ── KLA-729 composer AI-assist (parity with widget.ts) — all best-effort, all resolve null on failure ──
    // KLAVITYKLA-241 pre-submit known-issue check: as the reporter types, ask the backend whether this
    // project already tracks a matching issue so they don't file a blind duplicate.
    onCheckKnown: async (r) => {
      try {
        const n = await jn(bn() + "/api/widget/known-check", {
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
        const i = await jn(bn() + "/api/report/clarity", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ projectId: Ar, text: r, pageUrl: location.href, images: (n == null ? void 0 : n.images) ?? 0, client: qs() })
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
        const i = await jn(bn() + "/api/report/enhance", {
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
            client: qs()
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
      try {
        const i = new FormData();
        i.append("projectId", Ar), i.append("audio", r, "recording.webm"), r.type && i.append("mime", r.type), i.append("pageUrl", location.href), n != null && n.text && i.append("text", n.text);
        const s = await jn(bn() + "/api/report/split", { method: "POST", body: i }, 9e4);
        if (!s.ok) return null;
        const o = await s.json().catch(() => null);
        return o && Array.isArray(o.issues) ? o.issues : null;
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
        const i = await jn(bn() + "/api/voice/transcribe", { method: "POST", body: n });
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
        const r = new URL(bn() + "/api/voice/stream");
        return r.protocol = r.protocol === "https:" ? "wss:" : "ws:", r.searchParams.set("project", Ar), r.toString();
      } catch {
        return;
      }
    })(),
    // KLAVITYKLA-438 "Record me": expose the button when the browser can screen-record, driving the
    // consent → record overlay from the shared sdk recorder (same as the widget).
    allowRecording: (() => {
      try {
        return kd();
      } catch {
        return !1;
      }
    })(),
    onRecord: (r) => Ty({ onPhase: r }),
    // PX4 #425: allow non-image file attachments through the unified attach control (parity with widget).
    allowFileAttachments: !0,
    onSubmit: async (r) => {
      const n = await Promise.all(r.screenshots.map((o) => oc(o))), i = await Promise.all(n.map((o) => Ay(o))), s = Bv();
      return r.attachConsole !== !0 && (s.consoleErrors = []), qv({
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
        reporter: qa,
        clientInfo: qs(),
        referrer: typeof document < "u" && document.referrer || void 0,
        replayEvents: (In == null ? void 0 : In.getEvents()) ?? []
      });
    }
  });
  setTimeout(async () => {
    try {
      const r = await Fu();
      t.addScreenshot(r);
    } catch {
    }
  }, 200);
}
function Wv() {
  if (typeof document > "u" || !document.body) return;
  let e = document.getElementById("klavity-sdk-host");
  e || (e = document.createElement("div"), e.id = "klavity-sdk-host", e.style.cssText = "display:none!important;position:fixed;width:0;height:0;pointer-events:none;", document.body.appendChild(e)), e.setAttribute("data-klavity-ui", "sdk");
}
function jv() {
  Wm(Tp, { consoleLevels: !0 });
}
function _p(e) {
  qa = e ? Lp(e) : void 0;
}
function Ip(e) {
  Ap = e ? Lp(e) : void 0;
}
function Hv() {
  if (typeof document > "u" || document.getElementById("klavity-sdk-menu-anim")) return;
  const e = document.createElement("style");
  e.id = "klavity-sdk-menu-anim", e.textContent = ly, (document.head || document.documentElement).appendChild(e);
}
function Yv() {
  document.addEventListener("contextmenu", (e) => {
    if (Ag(e.target)) return;
    e.preventDefault(), Hv();
    const t = document.createElement("div");
    t.className = "klm-menu", t.style.cssText = "position:fixed;z-index:2147483647;width:200px;max-width:calc(100vw - 16px);border-radius:20px;overflow:hidden;font-family:system-ui,-apple-system,sans-serif;transform-origin:top left;padding:8px;display:flex;flex-direction:column;gap:7px;box-sizing:border-box;pointer-events:auto;background:radial-gradient(135% 90% at 50% -12%, rgba(139,92,246,.18), rgba(139,92,246,0) 55%), linear-gradient(180deg, rgba(250,247,240,.95), rgba(243,236,225,.96));border:1px solid rgba(255,255,255,.55);box-shadow:0 24px 60px -12px rgba(76,40,130,.32), 0 8px 22px rgba(99,102,241,.16), 0 1.5px 4px rgba(25,20,15,.10), inset 0 1px 0 rgba(255,255,255,.75);";
    const r = (p, a, h, d, u = {}) => {
      const m = uy(document, { iconHtml: H(p), label: a, desc: h, primary: u.primary });
      return m.addEventListener("click", () => {
        o(), Wa(d);
      }), m;
    };
    t.appendChild(r("zap", "Report a Bug", "Snap the page and tell us what broke.", "bug", { primary: !0 })), t.appendChild(r("lightbulb", "Request a Feature", "Suggest something you'd love to see.", "feature")), t.style.left = e.clientX + "px", t.style.top = "-9999px", document.body.appendChild(t);
    const n = 8, i = Math.max(n, Math.min(e.clientX, window.innerWidth - t.offsetWidth - n)), s = Math.max(n, Math.min(e.clientY, window.innerHeight - t.offsetHeight - n));
    t.style.left = i + "px", t.style.top = s + "px";
    const o = () => {
      Xe(t), document.removeEventListener("click", c), document.removeEventListener("keydown", l, !0);
    }, c = (p) => {
      (!p || !t.contains(p.target)) && o();
    }, l = (p) => {
      p.key === "Escape" && o();
    };
    setTimeout(() => {
      document.addEventListener("click", c), document.addEventListener("keydown", l, !0);
    }, 0);
  });
}
function Op(e = {}) {
  if (Ba = {
    ...kn,
    ...e,
    jira: { ...kn.jira, ...e.jira },
    linear: { ...kn.linear, ...e.linear },
    github: { ...kn.github, ...e.github },
    plane: { ...kn.plane, ...e.plane }
  }, typeof e.projectId == "string" && (Ar = e.projectId), jv(), Wv(), Yv(), !In)
    try {
      In = Kk(zr);
    } catch {
      In = null;
    }
}
typeof window < "u" && (window.KlavitySnap = { init: Op, openModal: Wa, identify: _p, setMetadata: Ip });
const Qv = { init: Op, openModal: Wa, identify: _p, setMetadata: Ip };
export {
  Di as KlavitySims,
  Di as SimsLive,
  Rp as clearAnnotation,
  Zv as clearAnnotations,
  Qv as default,
  _p as identify,
  Op as init,
  Nv as installKlavitySims,
  Wa as openModal,
  Ip as setMetadata,
  Jv as showAnnotation
};
