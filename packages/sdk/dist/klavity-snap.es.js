var Ql = Object.defineProperty;
var ec = (e, t, r) => t in e ? Ql(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var wr = (e, t, r) => ec(e, typeof t != "symbol" ? t + "" : t, r);
function tc(e, t) {
  return e[13] = 1, e[14] = t >> 8, e[15] = t & 255, e[16] = t >> 8, e[17] = t & 255, e;
}
const da = 112, pa = 72, ha = 89, fa = 115;
let pn;
function rc() {
  const e = new Int32Array(256);
  for (let t = 0; t < 256; t++) {
    let r = t;
    for (let n = 0; n < 8; n++)
      r = r & 1 ? 3988292384 ^ r >>> 1 : r >>> 1;
    e[t] = r;
  }
  return e;
}
function nc(e) {
  let t = -1;
  pn || (pn = rc());
  for (let r = 0; r < e.length; r++)
    t = pn[(t ^ e[r]) & 255] ^ t >>> 8;
  return t ^ -1;
}
function ic(e) {
  const t = e.length - 1;
  for (let r = t; r >= 4; r--)
    if (e[r - 4] === 9 && e[r - 3] === da && e[r - 2] === pa && e[r - 1] === ha && e[r] === fa)
      return r - 3;
  return 0;
}
function sc(e, t, r = !1) {
  const n = new Uint8Array(13);
  t *= 39.3701, n[0] = da, n[1] = pa, n[2] = ha, n[3] = fa, n[4] = t >>> 24, n[5] = t >>> 16, n[6] = t >>> 8, n[7] = t & 255, n[8] = n[4], n[9] = n[5], n[10] = n[6], n[11] = n[7], n[12] = 1;
  const i = nc(n), o = new Uint8Array(4);
  if (o[0] = i >>> 24, o[1] = i >>> 16, o[2] = i >>> 8, o[3] = i & 255, r) {
    const l = ic(e);
    return e.set(n, l), e.set(o, l + 13), e;
  } else {
    const l = new Uint8Array(4);
    l[0] = 0, l[1] = 0, l[2] = 0, l[3] = 9;
    const d = new Uint8Array(54);
    return d.set(e, 0), d.set(l, 33), d.set(n, 37), d.set(o, 50), d;
  }
}
const oc = "AAlwSFlz", ac = "AAAJcEhZ", lc = "AAAACXBI";
function cc(e) {
  let t = e.indexOf(oc);
  return t === -1 && (t = e.indexOf(ac)), t === -1 && (t = e.indexOf(lc)), t;
}
const ma = "[modern-screenshot]", yt = typeof window < "u", uc = yt && "Worker" in window, dc = yt && "atob" in window, pc = yt && "btoa" in window;
var ua;
const Li = yt ? (ua = window.navigator) == null ? void 0 : ua.userAgent : "", ga = Li.includes("Chrome"), Dr = Li.includes("AppleWebKit") && !ga, Ti = Li.includes("Firefox"), hc = (e) => e && "__CONTEXT__" in e, fc = (e) => e.constructor.name === "CSSFontFaceRule", mc = (e) => e.constructor.name === "CSSImportRule", gc = (e) => e.constructor.name === "CSSLayerBlockRule", it = (e) => e.nodeType === 1, hr = (e) => typeof e.className == "object", ya = (e) => e.tagName === "image", yc = (e) => e.tagName === "use", ar = (e) => it(e) && typeof e.style < "u" && !hr(e), bc = (e) => e.nodeType === 8, vc = (e) => e.nodeType === 3, Xt = (e) => e.tagName === "IMG", Gr = (e) => e.tagName === "VIDEO", wc = (e) => e.tagName === "CANVAS", kc = (e) => e.tagName === "TEXTAREA", xc = (e) => e.tagName === "INPUT", Sc = (e) => e.tagName === "STYLE", Cc = (e) => e.tagName === "SCRIPT", Ec = (e) => e.tagName === "SELECT", Mc = (e) => e.tagName === "SLOT", Rc = (e) => e.tagName === "IFRAME", Ac = (...e) => console.warn(ma, ...e);
function Ic(e) {
  var r;
  const t = (r = e == null ? void 0 : e.createElement) == null ? void 0 : r.call(e, "canvas");
  return t && (t.height = t.width = 1), !!t && "toDataURL" in t && !!t.toDataURL("image/webp").includes("image/webp");
}
const xi = (e) => e.startsWith("data:");
function ba(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (yt && e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i) || !yt)
    return e;
  const r = Xr().implementation.createHTMLDocument(), n = r.createElement("base"), i = r.createElement("a");
  return r.head.appendChild(n), r.body.appendChild(i), t && (n.href = t), i.href = e, i.href;
}
function Xr(e) {
  return (e && it(e) ? e == null ? void 0 : e.ownerDocument : e) ?? window.document;
}
const Kr = "http://www.w3.org/2000/svg";
function Oc(e, t, r) {
  const n = Xr(r).createElementNS(Kr, "svg");
  return n.setAttributeNS(null, "width", e.toString()), n.setAttributeNS(null, "height", t.toString()), n.setAttributeNS(null, "viewBox", `0 0 ${e} ${t}`), n;
}
function Lc(e, t) {
  let r = new XMLSerializer().serializeToString(e);
  return t && (r = r.replace(/[\u0000-\u0008\v\f\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/gu, "")), `data:image/svg+xml;charset=utf-8,${encodeURIComponent(r)}`;
}
function Tc(e, t) {
  return new Promise((r, n) => {
    const i = new FileReader();
    i.onload = () => r(i.result), i.onerror = () => n(i.error), i.onabort = () => n(new Error(`Failed read blob to ${t}`)), i.readAsDataURL(e);
  });
}
const Nc = (e) => Tc(e, "dataUrl");
function Ht(e, t) {
  const r = Xr(t).createElement("img");
  return r.decoding = "sync", r.loading = "eager", r.src = e, r;
}
function lr(e, t) {
  return new Promise((r) => {
    const { timeout: n, ownerDocument: i, onError: o, onWarn: l } = t ?? {}, d = typeof e == "string" ? Ht(e, Xr(i)) : e;
    let a = null, p = null;
    function s() {
      r(d), a && clearTimeout(a), p == null || p();
    }
    if (n && (a = setTimeout(s, n)), Gr(d)) {
      const h = d.currentSrc || d.src;
      if (!h)
        return d.poster ? lr(d.poster, t).then(r) : s();
      if (d.readyState >= 2)
        return s();
      const u = s, c = (m) => {
        l == null || l(
          "Failed video load",
          h,
          m
        ), o == null || o(m), s();
      };
      p = () => {
        d.removeEventListener("loadeddata", u), d.removeEventListener("error", c);
      }, d.addEventListener("loadeddata", u, { once: !0 }), d.addEventListener("error", c, { once: !0 });
    } else {
      const h = ya(d) ? d.href.baseVal : d.currentSrc || d.src;
      if (!h)
        return s();
      const u = async () => {
        if (Xt(d) && "decode" in d)
          try {
            await d.decode();
          } catch (m) {
            l == null || l(
              "Failed to decode image, trying to render anyway",
              d.dataset.originalSrc || h,
              m
            );
          }
        s();
      }, c = (m) => {
        l == null || l(
          "Failed image load",
          d.dataset.originalSrc || h,
          m
        ), s();
      };
      if (Xt(d) && d.complete)
        return u();
      p = () => {
        d.removeEventListener("load", u), d.removeEventListener("error", c);
      }, d.addEventListener("load", u, { once: !0 }), d.addEventListener("error", c, { once: !0 });
    }
  });
}
async function Pc(e, t) {
  ar(e) && (Xt(e) || Gr(e) ? await lr(e, t) : await Promise.all(
    ["img", "video"].flatMap((r) => Array.from(e.querySelectorAll(r)).map((n) => lr(n, t)))
  ));
}
const va = /* @__PURE__ */ (function() {
  let t = 0;
  const r = () => `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4);
  return () => (t += 1, `u${r()}${t}`);
})();
function wa(e) {
  return e == null ? void 0 : e.split(",").map((t) => t.trim().replace(/"|'/g, "").toLowerCase()).filter(Boolean);
}
let us = 0;
function _c(e) {
  const t = `${ma}[#${us}]`;
  return us++, {
    // eslint-disable-next-line no-console
    time: (r) => e && console.time(`${t} ${r}`),
    // eslint-disable-next-line no-console
    timeEnd: (r) => e && console.timeEnd(`${t} ${r}`),
    warn: (...r) => e && Ac(...r)
  };
}
function $c(e) {
  return {
    cache: e ? "no-cache" : "force-cache"
  };
}
async function Jr(e, t) {
  return hc(e) ? e : Dc(e, { ...t, autoDestruct: !0 });
}
async function Dc(e, t) {
  var c, m;
  const { scale: r = 1, workerUrl: n, workerNumber: i = 1 } = t || {}, o = !!(t != null && t.debug), l = (t == null ? void 0 : t.features) ?? !0, d = e.ownerDocument ?? (yt ? window.document : void 0), a = ((c = e.ownerDocument) == null ? void 0 : c.defaultView) ?? (yt ? window : void 0), p = /* @__PURE__ */ new Map(), s = {
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
      requestInit: $c((m = t == null ? void 0 : t.fetch) == null ? void 0 : m.bypassingCache),
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
    log: _c(o),
    node: e,
    ownerDocument: d,
    ownerWindow: a,
    dpi: r === 1 ? null : 96 * r,
    svgStyleElement: ka(d),
    svgDefsElement: d == null ? void 0 : d.createElementNS(Kr, "defs"),
    svgStyles: /* @__PURE__ */ new Map(),
    defaultComputedStyles: /* @__PURE__ */ new Map(),
    workers: [
      ...Array.from({
        length: uc && n && i ? i : 0
      })
    ].map(() => {
      try {
        const f = new Worker(n);
        return f.onmessage = async (g) => {
          var y, x, w, b;
          const { url: k, result: v } = g.data;
          v ? (x = (y = p.get(k)) == null ? void 0 : y.resolve) == null || x.call(y, v) : (b = (w = p.get(k)) == null ? void 0 : w.reject) == null || b.call(w, new Error(`Error receiving message from worker: ${k}`));
        }, f.onmessageerror = (g) => {
          var v, y;
          const { url: k } = g.data;
          (y = (v = p.get(k)) == null ? void 0 : v.reject) == null || y.call(v, new Error(`Error receiving message from worker: ${k}`));
        }, f;
      } catch (f) {
        return s.log.warn("Failed to new Worker", f), null;
      }
    }).filter(Boolean),
    fontFamilies: /* @__PURE__ */ new Map(),
    fontCssTexts: /* @__PURE__ */ new Map(),
    acceptOfImage: `${[
      Ic(d) && "image/webp",
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
  s.log.time("wait until load"), await Pc(e, { timeout: s.timeout, onWarn: s.log.warn }), s.log.timeEnd("wait until load");
  const { width: h, height: u } = zc(e, s);
  return s.width = h, s.height = u, s;
}
function ka(e) {
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
function zc(e, t) {
  let { width: r, height: n } = t;
  if (it(e) && (!r || !n)) {
    const i = e.getBoundingClientRect();
    r = r || i.width || Number(e.getAttribute("width")) || 0, n = n || i.height || Number(e.getAttribute("height")) || 0;
  }
  return { width: r, height: n };
}
async function Fc(e, t) {
  const {
    log: r,
    timeout: n,
    drawImageCount: i,
    drawImageInterval: o
  } = t;
  r.time("image to canvas");
  const l = await lr(e, { timeout: n, onWarn: t.log.warn }), { canvas: d, context2d: a } = Uc(e.ownerDocument, t), p = () => {
    try {
      a == null || a.drawImage(l, 0, 0, d.width, d.height);
    } catch (s) {
      t.log.warn("Failed to drawImage", s);
    }
  };
  if (p(), t.isEnable("fixSvgXmlDecode"))
    for (let s = 0; s < i; s++)
      await new Promise((h) => {
        setTimeout(() => {
          a == null || a.clearRect(0, 0, d.width, d.height), p(), h();
        }, s + o);
      });
  return t.drawImageCount = 0, r.timeEnd("image to canvas"), d;
}
function Uc(e, t) {
  const { width: r, height: n, scale: i, backgroundColor: o, maximumCanvasSize: l } = t, d = e.createElement("canvas");
  d.width = Math.floor(r * i), d.height = Math.floor(n * i), d.style.width = `${r}px`, d.style.height = `${n}px`, l && (d.width > l || d.height > l) && (d.width > l && d.height > l ? d.width > d.height ? (d.height *= l / d.width, d.width = l) : (d.width *= l / d.height, d.height = l) : d.width > l ? (d.height *= l / d.width, d.width = l) : (d.width *= l / d.height, d.height = l));
  const a = d.getContext("2d");
  return a && o && (a.fillStyle = o, a.fillRect(0, 0, d.width, d.height)), { canvas: d, context2d: a };
}
function xa(e, t) {
  if (e.ownerDocument)
    try {
      const o = e.toDataURL();
      if (o !== "data:,")
        return Ht(o, e.ownerDocument);
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
function Bc(e, t) {
  var r;
  try {
    if ((r = e == null ? void 0 : e.contentDocument) != null && r.documentElement)
      return Ni(e.contentDocument.documentElement, t);
  } catch (n) {
    t.log.warn("Failed to clone iframe", n);
  }
  return e.cloneNode(!1);
}
function qc(e) {
  const t = e.cloneNode(!1);
  return e.currentSrc && e.currentSrc !== e.src && (t.src = e.currentSrc, t.srcset = ""), t.loading === "lazy" && (t.loading = "eager"), t;
}
async function Wc(e, t) {
  if (e.ownerDocument && !e.currentSrc && e.poster)
    return Ht(e.poster, e.ownerDocument);
  const r = e.cloneNode(!1);
  r.crossOrigin = "anonymous", e.currentSrc && e.currentSrc !== e.src && (r.src = e.currentSrc);
  const n = r.ownerDocument;
  if (n) {
    let i = !0;
    if (await lr(r, { onError: () => i = !1, onWarn: t.log.warn }), !i)
      return e.poster ? Ht(e.poster, e.ownerDocument) : r;
    r.currentTime = e.currentTime, await new Promise((l) => {
      r.addEventListener("seeked", l, { once: !0 });
    });
    const o = n.createElement("canvas");
    o.width = e.offsetWidth, o.height = e.offsetHeight;
    try {
      const l = o.getContext("2d");
      l && l.drawImage(r, 0, 0, o.width, o.height);
    } catch (l) {
      return t.log.warn("Failed to clone video", l), e.poster ? Ht(e.poster, e.ownerDocument) : r;
    }
    return xa(o, t);
  }
  return r;
}
function jc(e, t) {
  return wc(e) ? xa(e, t) : Rc(e) ? Bc(e, t) : Xt(e) ? qc(e) : Gr(e) ? Wc(e, t) : e.cloneNode(!1);
}
function Hc(e) {
  let t = e.sandbox;
  if (!t) {
    const { ownerDocument: r } = e;
    try {
      r && (t = r.createElement("iframe"), t.id = `__SANDBOX__${va()}`, t.width = "0", t.height = "0", t.style.visibility = "hidden", t.style.position = "fixed", r.body.appendChild(t), t.srcdoc = '<!DOCTYPE html><meta charset="UTF-8"><title></title><body>', e.sandbox = t);
    } catch (n) {
      e.log.warn("Failed to getSandBox", n);
    }
  }
  return t;
}
const Vc = [
  "width",
  "height",
  "-webkit-text-fill-color"
], Yc = [
  "stroke",
  "fill"
];
function Sa(e, t, r) {
  const { defaultComputedStyles: n } = r, i = e.nodeName.toLowerCase(), o = hr(e) && i !== "svg", l = o ? Yc.map((f) => [f, e.getAttribute(f)]).filter(([, f]) => f !== null) : [], d = [
    o && "svg",
    i,
    l.map((f, g) => `${f}=${g}`).join(","),
    t
  ].filter(Boolean).join(":");
  if (n.has(d))
    return n.get(d);
  const a = Hc(r), p = a == null ? void 0 : a.contentWindow;
  if (!p)
    return /* @__PURE__ */ new Map();
  const s = p == null ? void 0 : p.document;
  let h, u;
  o ? (h = s.createElementNS(Kr, "svg"), u = h.ownerDocument.createElementNS(h.namespaceURI, i), l.forEach(([f, g]) => {
    u.setAttributeNS(null, f, g);
  }), h.appendChild(u)) : h = u = s.createElement(i), u.textContent = " ", s.body.appendChild(h);
  const c = p.getComputedStyle(u, t), m = /* @__PURE__ */ new Map();
  for (let f = c.length, g = 0; g < f; g++) {
    const k = c.item(g);
    Vc.includes(k) || m.set(k, c.getPropertyValue(k));
  }
  return s.body.removeChild(h), n.set(d, m), m;
}
function Ca(e, t, r) {
  var d;
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
    (d = o.get(i[p])) == null || d.forEach((s, h) => n.set(h, s));
  function l(a) {
    const p = e.getPropertyValue(a), s = e.getPropertyPriority(a), h = a.lastIndexOf("-"), u = h > -1 ? a.substring(0, h) : void 0;
    if (u) {
      let c = o.get(u);
      c || (c = /* @__PURE__ */ new Map(), o.set(u, c)), c.set(a, [p, s]);
    }
    t.get(a) === p && !s || (u ? i.push(u) : n.set(a, [p, s]));
  }
  return n;
}
function Gc(e, t, r, n) {
  var h, u, c, m;
  const { ownerWindow: i, includeStyleProperties: o, currentParentNodeStyle: l } = n, d = t.style, a = i.getComputedStyle(e), p = Sa(e, null, n);
  l == null || l.forEach((f, g) => {
    p.delete(g);
  });
  const s = Ca(a, p, o);
  s.delete("transition-property"), s.delete("all"), s.delete("d"), s.delete("content"), r && (s.delete("position"), s.delete("margin-top"), s.delete("margin-right"), s.delete("margin-bottom"), s.delete("margin-left"), s.delete("margin-block-start"), s.delete("margin-block-end"), s.delete("margin-inline-start"), s.delete("margin-inline-end"), s.set("box-sizing", ["border-box", ""])), ((h = s.get("background-clip")) == null ? void 0 : h[0]) === "text" && t.classList.add("______background-clip--text"), ga && (s.has("font-kerning") || s.set("font-kerning", ["normal", ""]), (((u = s.get("overflow-x")) == null ? void 0 : u[0]) === "hidden" || ((c = s.get("overflow-y")) == null ? void 0 : c[0]) === "hidden") && ((m = s.get("text-overflow")) == null ? void 0 : m[0]) === "ellipsis" && e.scrollWidth === e.clientWidth && s.set("text-overflow", ["clip", ""]));
  for (let f = d.length, g = 0; g < f; g++)
    d.removeProperty(d.item(g));
  return s.forEach(([f, g], k) => {
    d.setProperty(k, f, g);
  }), s;
}
function Xc(e, t) {
  (kc(e) || xc(e) || Ec(e)) && t.setAttribute("value", e.value);
}
const Kc = [
  "::before",
  "::after"
  // '::placeholder', TODO
], Jc = [
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
function Zc(e, t, r, n, i) {
  const { ownerWindow: o, svgStyleElement: l, svgStyles: d, currentNodeStyle: a } = n;
  if (!l || !o)
    return;
  function p(s) {
    var y;
    const h = o.getComputedStyle(e, s);
    let u = h.getPropertyValue("content");
    if (!u || u === "none")
      return;
    i == null || i(u), u = u.replace(/(')|(")|(counter\(.+\))/g, "");
    const c = [va()], m = Sa(e, s, n);
    a == null || a.forEach((x, w) => {
      m.delete(w);
    });
    const f = Ca(h, m, n.includeStyleProperties);
    f.delete("content"), f.delete("-webkit-locale"), ((y = f.get("background-clip")) == null ? void 0 : y[0]) === "text" && t.classList.add("______background-clip--text");
    const g = [
      `content: '${u}';`
    ];
    if (f.forEach(([x, w], b) => {
      g.push(`${b}: ${x}${w ? " !important" : ""};`);
    }), g.length === 1)
      return;
    try {
      t.className = [t.className, ...c].join(" ");
    } catch (x) {
      n.log.warn("Failed to copyPseudoClass", x);
      return;
    }
    const k = g.join(`
  `);
    let v = d.get(k);
    v || (v = [], d.set(k, v)), v.push(`.${c[0]}${s}`);
  }
  Kc.forEach(p), r && Jc.forEach(p);
}
const ds = /* @__PURE__ */ new Set([
  "symbol"
  // test/fixtures/svg.symbol.html
]);
async function ps(e, t, r, n, i) {
  if (it(r) && (Sc(r) || Cc(r)) || n.filter && !n.filter(r))
    return;
  ds.has(t.nodeName) || ds.has(r.nodeName) ? n.currentParentNodeStyle = void 0 : n.currentParentNodeStyle = n.currentNodeStyle;
  const o = await Ni(r, n, !1, i);
  n.isEnable("restoreScrollPosition") && Qc(e, o), t.appendChild(o);
}
async function hs(e, t, r, n) {
  var o;
  let i = e.firstChild;
  it(e) && e.shadowRoot && (i = (o = e.shadowRoot) == null ? void 0 : o.firstChild, r.shadowRoots.push(e.shadowRoot));
  for (let l = i; l; l = l.nextSibling)
    if (!bc(l))
      if (it(l) && Mc(l) && typeof l.assignedNodes == "function") {
        const d = l.assignedNodes();
        for (let a = 0; a < d.length; a++)
          await ps(e, t, d[a], r, n);
      } else
        await ps(e, t, l, r, n);
}
function Qc(e, t) {
  if (!ar(e) || !ar(t))
    return;
  const { scrollTop: r, scrollLeft: n } = e;
  if (!r && !n)
    return;
  const { transform: i } = t.style, o = new DOMMatrix(i), { a: l, b: d, c: a, d: p } = o;
  o.a = 1, o.b = 0, o.c = 0, o.d = 1, o.translateSelf(-n, -r), o.a = l, o.b = d, o.c = a, o.d = p, t.style.transform = o.toString();
}
function eu(e, t) {
  const { backgroundColor: r, width: n, height: i, style: o } = t, l = e.style;
  if (r && l.setProperty("background-color", r, "important"), n && l.setProperty("width", `${n}px`, "important"), i && l.setProperty("height", `${i}px`, "important"), o)
    for (const d in o) l[d] = o[d];
}
const tu = /^[\w-:]+$/;
async function Ni(e, t, r = !1, n) {
  var p, s, h, u;
  const { ownerDocument: i, ownerWindow: o, fontFamilies: l, onCloneEachNode: d } = t;
  if (i && vc(e))
    return n && /\S/.test(e.data) && n(e.data), i.createTextNode(e.data);
  if (i && o && it(e) && (ar(e) || hr(e))) {
    const c = await jc(e, t);
    if (t.isEnable("removeAbnormalAttributes")) {
      const y = c.getAttributeNames();
      for (let x = y.length, w = 0; w < x; w++) {
        const b = y[w];
        tu.test(b) || c.removeAttribute(b);
      }
    }
    const m = t.currentNodeStyle = Gc(e, c, r, t);
    r && eu(c, t);
    let f = !1;
    if (t.isEnable("copyScrollbar")) {
      const y = [
        (p = m.get("overflow-x")) == null ? void 0 : p[0],
        (s = m.get("overflow-y")) == null ? void 0 : s[0]
      ];
      f = y.includes("scroll") || (y.includes("auto") || y.includes("overlay")) && (e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth);
    }
    const g = (h = m.get("text-transform")) == null ? void 0 : h[0], k = wa((u = m.get("font-family")) == null ? void 0 : u[0]), v = k ? (y) => {
      g === "uppercase" ? y = y.toUpperCase() : g === "lowercase" ? y = y.toLowerCase() : g === "capitalize" && (y = y[0].toUpperCase() + y.substring(1)), k.forEach((x) => {
        let w = l.get(x);
        w || l.set(x, w = /* @__PURE__ */ new Set()), y.split("").forEach((b) => w.add(b));
      });
    } : void 0;
    return Zc(
      e,
      c,
      f,
      t,
      v
    ), Xc(e, c), Gr(e) || await hs(
      e,
      c,
      t,
      v
    ), await (d == null ? void 0 : d(c)), c;
  }
  const a = e.cloneNode(!1);
  return await hs(e, a, t), await (d == null ? void 0 : d(a)), a;
}
function ru(e) {
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
function nu(e) {
  const { url: t, timeout: r, responseType: n, ...i } = e, o = new AbortController(), l = r ? setTimeout(() => o.abort(), r) : void 0;
  return fetch(t, { signal: o.signal, ...i }).then((d) => {
    if (!d.ok)
      throw new Error("Failed fetch, not 2xx response", { cause: d });
    switch (n) {
      case "arrayBuffer":
        return d.arrayBuffer();
      case "dataUrl":
        return d.blob().then(Nc);
      case "text":
      default:
        return d.text();
    }
  }).finally(() => clearTimeout(l));
}
function cr(e, t) {
  const { url: r, requestType: n = "text", responseType: i = "text", imageDom: o } = t;
  let l = r;
  const {
    timeout: d,
    acceptOfImage: a,
    requests: p,
    fetchFn: s,
    fetch: {
      requestInit: h,
      bypassingCache: u,
      placeholderImage: c
    },
    font: m,
    workers: f,
    fontFamilies: g
  } = e;
  n === "image" && (Dr || Ti) && e.drawImageCount++;
  let k = p.get(r);
  if (!k) {
    u && u instanceof RegExp && u.test(l) && (l += (/\?/.test(l) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
    const v = n.startsWith("font") && m && m.minify, y = /* @__PURE__ */ new Set();
    v && n.split(";")[1].split(",").forEach((S) => {
      g.has(S) && g.get(S).forEach((M) => y.add(M));
    });
    const x = v && y.size, w = {
      url: l,
      timeout: d,
      responseType: x ? "arrayBuffer" : i,
      headers: n === "image" ? { accept: a } : void 0,
      ...h
    };
    k = {
      type: n,
      resolve: void 0,
      reject: void 0,
      response: null
    }, k.response = (async () => {
      if (s && n === "image") {
        const b = await s(r);
        if (b)
          return b;
      }
      return !Dr && r.startsWith("http") && f.length ? new Promise((b, S) => {
        f[p.size & f.length - 1].postMessage({ rawUrl: r, ...w }), k.resolve = b, k.reject = S;
      }) : nu(w);
    })().catch((b) => {
      if (p.delete(r), n === "image" && c)
        return e.log.warn("Failed to fetch image base64, trying to use placeholder image", l), typeof c == "string" ? c : c(o);
      throw b;
    }), p.set(r, k);
  }
  return k.response;
}
async function Ea(e, t, r, n) {
  if (!Ma(e))
    return e;
  for (const [i, o] of iu(e, t))
    try {
      const l = await cr(
        r,
        {
          url: o,
          requestType: n ? "image" : "text",
          responseType: "dataUrl"
        }
      );
      e = e.replace(su(i), `$1${l}$3`);
    } catch (l) {
      r.log.warn("Failed to fetch css data url", i, l);
    }
  return e;
}
function Ma(e) {
  return /url\((['"]?)([^'"]+?)\1\)/.test(e);
}
const Ra = /url\((['"]?)([^'"]+?)\1\)/g;
function iu(e, t) {
  const r = [];
  return e.replace(Ra, (n, i, o) => (r.push([o, ba(o, t)]), n)), r.filter(([n]) => !xi(n));
}
function su(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
const ou = [
  "background-image",
  "border-image-source",
  "-webkit-border-image",
  "-webkit-mask-image",
  "list-style-image"
];
function au(e, t) {
  return ou.map((r) => {
    const n = e.getPropertyValue(r);
    return !n || n === "none" ? null : ((Dr || Ti) && t.drawImageCount++, Ea(n, null, t, !0).then((i) => {
      !i || n === i || e.setProperty(
        r,
        i,
        e.getPropertyPriority(r)
      );
    }));
  }).filter(Boolean);
}
function lu(e, t) {
  if (Xt(e)) {
    const r = e.currentSrc || e.src;
    if (!xi(r))
      return [
        cr(t, {
          url: r,
          imageDom: e,
          requestType: "image",
          responseType: "dataUrl"
        }).then((n) => {
          n && (e.srcset = "", e.dataset.originalSrc = r, e.src = n || "");
        })
      ];
    (Dr || Ti) && t.drawImageCount++;
  } else if (hr(e) && !xi(e.href.baseVal)) {
    const r = e.href.baseVal;
    return [
      cr(t, {
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
function cu(e, t) {
  const { ownerDocument: r, svgDefsElement: n } = t, i = e.getAttribute("href") ?? e.getAttribute("xlink:href");
  if (!i)
    return [];
  const [o, l] = i.split("#");
  if (l) {
    const d = `#${l}`, a = t.shadowRoots.reduce(
      (p, s) => p ?? s.querySelector(`svg ${d}`),
      r == null ? void 0 : r.querySelector(`svg ${d}`)
    );
    if (o && e.setAttribute("href", d), n != null && n.querySelector(d))
      return [];
    if (a)
      return n == null || n.appendChild(a.cloneNode(!0)), [];
    if (o)
      return [
        cr(t, {
          url: o,
          responseType: "text"
        }).then((p) => {
          n == null || n.insertAdjacentHTML("beforeend", p);
        })
      ];
  }
  return [];
}
function Aa(e, t) {
  const { tasks: r } = t;
  it(e) && ((Xt(e) || ya(e)) && r.push(...lu(e, t)), yc(e) && r.push(...cu(e, t))), ar(e) && r.push(...au(e.style, t)), e.childNodes.forEach((n) => {
    Aa(n, t);
  });
}
async function uu(e, t) {
  const {
    ownerDocument: r,
    svgStyleElement: n,
    fontFamilies: i,
    fontCssTexts: o,
    tasks: l,
    font: d
  } = t;
  if (!(!r || !n || !i.size))
    if (d && d.cssText) {
      const a = ms(d.cssText, t);
      n.appendChild(r.createTextNode(`${a}
`));
    } else {
      const a = Array.from(r.styleSheets).filter((c) => {
        try {
          return "cssRules" in c && !!c.cssRules.length;
        } catch (m) {
          return t.log.warn(`Error while reading CSS rules from ${c.href}`, m), !1;
        }
      }), p = r.implementation.createHTMLDocument(""), s = p.createElement("style");
      p.head.appendChild(s);
      const h = s.sheet;
      await Promise.all(
        a.flatMap((c) => Array.from(c.cssRules).map(async (m) => {
          if (mc(m)) {
            const f = m.href;
            let g = "";
            try {
              g = await cr(t, {
                url: f,
                requestType: "text",
                responseType: "text"
              });
            } catch (v) {
              t.log.warn(`Error fetch remote css import from ${f}`, v);
            }
            const k = g.replace(
              Ra,
              (v, y, x) => v.replace(x, ba(x, f))
            );
            for (const v of pu(k))
              try {
                h.insertRule(v, h.cssRules.length);
              } catch (y) {
                t.log.warn("Error inserting rule from remote css import", { rule: v, error: y });
              }
          }
        }))
      ), h.cssRules.length && a.push(h);
      const u = [];
      a.forEach((c) => {
        Si(c.cssRules, u);
      }), u.filter((c) => {
        var m;
        return fc(c) && Ma(c.style.getPropertyValue("src")) && ((m = wa(c.style.getPropertyValue("font-family"))) == null ? void 0 : m.some((f) => i.has(f)));
      }).forEach((c) => {
        const m = c, f = o.get(m.cssText);
        f ? n.appendChild(r.createTextNode(`${f}
`)) : l.push(
          Ea(
            m.cssText,
            m.parentStyleSheet ? m.parentStyleSheet.href : null,
            t
          ).then((g) => {
            g = ms(g, t), o.set(m.cssText, g), n.appendChild(r.createTextNode(`${g}
`));
          })
        );
      });
    }
}
const du = /(\/\*[\s\S]*?\*\/)/g, fs = /((@.*?keyframes [\s\S]*?){([\s\S]*?}\s*?)})/gi;
function pu(e) {
  if (e == null)
    return [];
  const t = [];
  let r = e.replace(du, "");
  for (; ; ) {
    const o = fs.exec(r);
    if (!o)
      break;
    t.push(o[0]);
  }
  r = r.replace(fs, "");
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
const hu = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, fu = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function ms(e, t) {
  const { font: r } = t, n = r ? r == null ? void 0 : r.preferredFormat : void 0;
  return n ? e.replace(fu, (i) => {
    for (; ; ) {
      const [o, , l] = hu.exec(i) || [];
      if (!l)
        return "";
      if (l === n)
        return `src: ${o};`;
    }
  }) : e;
}
function Si(e, t = []) {
  for (const r of Array.from(e))
    gc(r) ? t.push(...Si(r.cssRules)) : "cssRules" in r ? Si(r.cssRules, t) : t.push(r);
  return t;
}
const mu = /\bx?link:?href\s*=\s*["'](?!data:)[^"']+["']/i;
function gu(e) {
  return mu.test(e.innerHTML);
}
async function yu(e, t) {
  const r = await Jr(e, t);
  if (it(r.node) && hr(r.node) && !gu(r.node))
    return r.node;
  const {
    ownerDocument: n,
    log: i,
    tasks: o,
    svgStyleElement: l,
    svgDefsElement: d,
    svgStyles: a,
    font: p,
    progress: s,
    autoDestruct: h,
    onCloneNode: u,
    onEmbedNode: c,
    onCreateForeignObjectSvg: m
  } = r;
  i.time("clone node");
  const f = await Ni(r.node, r, !0);
  if (l && n) {
    let x = "";
    a.forEach((w, b) => {
      x += `${w.join(`,
`)} {
  ${b}
}
`;
    }), l.appendChild(n.createTextNode(x));
  }
  i.timeEnd("clone node"), await (u == null ? void 0 : u(f)), p !== !1 && it(f) && (i.time("embed web font"), await uu(f, r), i.timeEnd("embed web font")), i.time("embed node"), Aa(f, r);
  const g = o.length;
  let k = 0;
  const v = async () => {
    for (; ; ) {
      const x = o.pop();
      if (!x)
        break;
      try {
        await x;
      } catch (w) {
        r.log.warn("Failed to run task", w);
      }
      s == null || s(++k, g);
    }
  };
  s == null || s(k, g), await Promise.all([...Array.from({ length: 4 })].map(v)), i.timeEnd("embed node"), await (c == null ? void 0 : c(f));
  const y = bu(f, r);
  return d && y.insertBefore(d, y.children[0]), l && y.insertBefore(l, y.children[0]), h && ru(r), await (m == null ? void 0 : m(y)), y;
}
function bu(e, t) {
  const { width: r, height: n } = t, i = Oc(r, n, e.ownerDocument), o = i.ownerDocument.createElementNS(i.namespaceURI, "foreignObject");
  return o.setAttributeNS(null, "x", "0%"), o.setAttributeNS(null, "y", "0%"), o.setAttributeNS(null, "width", "100%"), o.setAttributeNS(null, "height", "100%"), o.append(e), i.appendChild(o), i;
}
async function vu(e, t) {
  var l;
  const r = await Jr(e, t), n = await yu(r), i = Lc(n, r.isEnable("removeControlCharacter"));
  r.autoDestruct || (r.svgStyleElement = ka(r.ownerDocument), r.svgDefsElement = (l = r.ownerDocument) == null ? void 0 : l.createElementNS(Kr, "defs"), r.svgStyles.clear());
  const o = Ht(i, n.ownerDocument);
  return await Fc(o, r);
}
async function wu(e, t) {
  const r = await Jr(e, t), { log: n, quality: i, type: o, dpi: l } = r, d = await vu(r);
  n.time("canvas to data url");
  let a = d.toDataURL(o, i);
  if (["image/png", "image/jpeg"].includes(o) && l && dc && pc) {
    const [p, s] = a.split(",");
    let h = 0, u = !1;
    if (o === "image/png") {
      const y = cc(s);
      y >= 0 ? (h = Math.ceil((y + 28) / 3) * 4, u = !0) : h = 33 / 3 * 4;
    } else o === "image/jpeg" && (h = 18 / 3 * 4);
    const c = s.substring(0, h), m = s.substring(h), f = window.atob(c), g = new Uint8Array(f.length);
    for (let y = 0; y < g.length; y++)
      g[y] = f.charCodeAt(y);
    const k = o === "image/png" ? sc(g, l, u) : tc(g, l), v = window.btoa(String.fromCharCode(...k));
    a = [p, ",", v, m].join("");
  }
  return n.timeEnd("canvas to data url"), a;
}
async function ku(e, t) {
  return wu(
    await Jr(e, { ...t, type: "image/png" })
  );
}
const xu = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", Su = 8e3, Cu = 16384, gs = 4096, Eu = 16e6, Mu = 500, Ru = 1e4, hn = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z4kwAAAAASUVORK5CYII=";
function Ia(e, t) {
  if (!e || e.startsWith("data:") || e.startsWith("blob:")) return !1;
  try {
    return new URL(e, t).origin !== t;
  } catch {
    return !1;
  }
}
function Au(e) {
  const t = e;
  if (!t || t.tagName !== "IMG") return !1;
  const r = t.currentSrc || t.src || "";
  return Ia(r, location.origin);
}
function Iu(e) {
  const t = e;
  if (!t || t.nodeType !== 1) return !1;
  const r = t.tagName;
  if (r === "SCRIPT" || r === "STYLE" || r === "NOSCRIPT" || r === "TEMPLATE" || r === "IFRAME" && Ia(t.src || "", location.origin)) return !0;
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
function ys(e) {
  try {
    console.warn(e);
  } catch {
  }
}
function bs(e) {
  return !e || e === "transparent" || e === "rgba(0, 0, 0, 0)";
}
function Ou(e, t, r = 1) {
  try {
    const n = e.getBoundingClientRect(), i = Math.max(1, Math.ceil(Math.max(e.scrollWidth, e.clientWidth, n.width))), o = Math.max(1, Math.ceil(Math.max(e.scrollHeight, e.clientHeight, n.height))), l = Math.max(0.1, r), d = Math.min(gs / i, gs / o), a = Math.min(l, d, Math.sqrt(Eu / (i * o))), p = document.createElement("canvas");
    p.width = Math.max(1, Math.floor(i * a)), p.height = Math.max(1, Math.floor(o * a));
    const s = p.getContext("2d");
    if (!s) return { dataUrl: hn, scale: 1 };
    s.scale(a, a), s.fillStyle = "#ffffff", s.fillRect(0, 0, i, o);
    const h = Date.now() + Mu;
    let u = 0;
    const c = () => u >= Ru || Date.now() >= h, m = (g, k = !1) => {
      var b;
      if (c() || (u++, !k && t && !t(g))) return;
      const v = getComputedStyle(g);
      if (v.display === "none" || v.visibility === "hidden" || Number(v.opacity) === 0) return;
      const y = g.getBoundingClientRect(), x = y.left - n.left, w = y.top - n.top;
      if (y.width > 0 && y.height > 0) {
        bs(v.backgroundColor) || (s.fillStyle = v.backgroundColor, s.fillRect(x, w, y.width, y.height));
        const S = parseFloat(v.borderTopWidth);
        S > 0 && v.borderTopStyle !== "none" && !bs(v.borderTopColor) && (s.strokeStyle = v.borderTopColor, s.lineWidth = S, s.strokeRect(x, w, y.width, y.height)), g.tagName === "IMG" && (s.fillStyle = "#f1f5f9", s.fillRect(x, w, y.width, y.height), s.strokeStyle = "#cbd5e1", s.lineWidth = 1, s.strokeRect(x, w, y.width, y.height));
      }
      for (const S of Array.from(g.childNodes)) {
        if (c()) break;
        if (S instanceof HTMLElement) {
          m(S);
          continue;
        }
        if (!(S.nodeType !== Node.TEXT_NODE || !((b = S.textContent) != null && b.trim())))
          try {
            const M = document.createRange();
            M.selectNodeContents(S);
            const I = M.getBoundingClientRect();
            if (I.width <= 0 || I.height <= 0) continue;
            s.save(), s.beginPath(), s.rect(I.left - n.left, I.top - n.top, I.width, I.height), s.clip(), s.fillStyle = v.color, s.font = `${v.fontStyle} ${v.fontWeight} ${v.fontSize} ${v.fontFamily}`, s.textBaseline = "top", s.fillText(S.textContent.trim(), I.left - n.left, I.top - n.top), s.restore();
          } catch {
          }
      }
    };
    m(e, !0);
    const f = p.toDataURL("image/png");
    return f.startsWith("data:image/png") ? { dataUrl: f, scale: a } : { dataUrl: hn, scale: 1 };
  } catch {
    return { dataUrl: hn, scale: 1 };
  }
}
function Lu(e, t) {
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
async function Tu(e, t = {}) {
  return (await Nu(e, t)).dataUrl;
}
async function Nu(e, t = {}) {
  let r = 0;
  const n = t.filter, i = t.pixelRatio ?? 1;
  try {
    const o = await Lu(ku(e, {
      scale: i,
      font: !1,
      maximumCanvasSize: Cu,
      fetch: { placeholderImage: xu },
      filter: (l) => n && !n(l) || Iu(l) ? !1 : Au(l) ? (r++, !1) : !0
    }), Su);
    if (!o.startsWith("data:image/png")) throw new Error("capture returned a non-PNG result");
    return r && ys(`[Klavity] capture: omitted ${r} cross-origin image(s) the page's CSP/CORS blocks — captured the rest`), { dataUrl: o, scale: i, quality: "rendered" };
  } catch (o) {
    const l = o instanceof Error ? o.message : String(o);
    return ys(`[Klavity] capture: renderer unavailable (${l}); using fetch-free fallback`), { ...Ou(e, n, i), quality: "wireframe" };
  }
}
const Pu = {
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
function _u(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function J(e, t = {}) {
  const r = Pu[e];
  if (!r)
    return console.warn("[Klavity] unknown icon: " + e), "";
  const n = t.size ?? 18, i = t.class ? `icon ${t.class}` : "icon", o = t.label ? 'role="img"' : 'aria-hidden="true"', l = t.label ? `<title>${_u(t.label)}</title>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" class="${i}" width="${n}" height="${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" ${o}>${l}${r}</svg>`;
}
const Dt = {
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
class vs {
  constructor(t, r) {
    this.shapes = [], this.strokeScale = 1, this.canvas = t, this.imageDataUrl = r;
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
    const r = new Image();
    r.onload = () => {
      t.clearRect(0, 0, this.canvas.width, this.canvas.height), t.drawImage(r, 0, 0), this.shapes.forEach((n) => this.drawShape(t, n));
    }, r.src = this.imageDataUrl;
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
      t.font = `bold ${n}px sans-serif`;
      const i = r.outline ?? "none";
      i !== "none" && (t.lineJoin = "round", t.lineWidth = Math.max(3, n * 0.18), t.strokeStyle = i === "white" ? "#ffffff" : "#111111", t.strokeText(r.text, r.x, r.y), t.fillStyle = r.color), t.fillText(r.text, r.x, r.y);
    }
  }
  async save() {
    const t = this.canvas.toDataURL("image/png");
    return t.length > 5 * 1024 * 1024 ? this.canvas.toDataURL("image/jpeg", 0.85) : t;
  }
}
async function $u(e, t, r) {
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
const Du = 50, zu = 2e3, Fu = 1e3, Uu = 500, ws = /^(?:token|access_token|refresh_token|api[_-]?key|apikey|key|secret|password|passwd|pwd|auth|authorization|session|sid|jwt|code|otp)$/i;
function kr(e, t) {
  e.push(t), e.length > Du && e.shift();
}
function Pi(e, t) {
  return e.length <= t ? e : e.slice(0, t) + "…[truncated]";
}
function fn(e) {
  let t = String(e || "");
  try {
    const r = new URL(t, typeof location < "u" ? location.href : "http://localhost");
    let n = !1;
    r.searchParams.forEach((i, o) => {
      ws.test(o) && (r.searchParams.set(o, "REDACTED"), n = !0);
    }), n && (t = r.toString());
  } catch {
    t = t.replace(/([?&])([^=&]+)=([^&]*)/g, (r, n, i, o) => ws.test(i) ? `${n}${i}=REDACTED` : r);
  }
  return Pi(t, Fu);
}
function Bu(e) {
  if (typeof e == "string") return e;
  if (e instanceof Error) return e.message;
  try {
    return Pi(JSON.stringify(e), Uu);
  } catch {
    return String(e);
  }
}
function qu(e, t = {}) {
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
function Wu(e, t = {}) {
  if (typeof window > "u") return e;
  const r = window;
  if (r.__klavityCaptureInstalled) return e;
  r.__klavityCaptureInstalled = !0;
  const n = () => t.isContextValid ? t.isContextValid() : !0, i = (a, p, s) => {
    kr(e.consoleErrors, { message: Pi(p, zu), stack: s, timestamp: Date.now(), level: a });
  }, o = window.onerror;
  if (window.onerror = (a, p, s, h, u) => {
    var c;
    if (n()) {
      const m = String(a);
      i("error", m, u == null ? void 0 : u.stack), (c = t.onError) == null || c.call(t, m, u == null ? void 0 : u.stack);
    }
    return typeof o == "function" ? o.call(window, a, p, s, h, u) : !1;
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
          n() && i(p, h.map(Bu).join(" "));
        } catch {
        }
        return s.apply(console, h);
      });
    }
  }
  const l = window.fetch;
  window.fetch = async (...a) => {
    var u;
    if (!n()) return l(...a);
    const p = Date.now(), s = typeof a[0] == "string" ? a[0] : a[0] instanceof URL ? a[0].href : a[0].url, h = (typeof a[0] == "object" && a[0] && "method" in a[0] ? a[0].method : (u = a[1]) == null ? void 0 : u.method) || "GET";
    try {
      const c = await l(...a);
      return kr(e.networkFailures, { url: fn(s), status: c.status, method: String(h).toUpperCase(), timestamp: p, durationMs: Date.now() - p }), c;
    } catch (c) {
      throw kr(e.networkFailures, { url: fn(s), status: 0, method: String(h).toUpperCase(), timestamp: p, durationMs: Date.now() - p }), c;
    }
  };
  const d = window.XMLHttpRequest;
  if (d && d.prototype) {
    const a = d.prototype.open, p = d.prototype.send;
    d.prototype.open = function(s, h, ...u) {
      return this.__klav = { method: String(s || "GET").toUpperCase(), url: String(h || "") }, a.call(this, s, h, ...u);
    }, d.prototype.send = function(...s) {
      const h = this.__klav;
      if (h && n()) {
        const u = Date.now();
        this.addEventListener("loadend", () => {
          try {
            kr(e.networkFailures, {
              url: fn(h.url),
              status: Number(this.status) || 0,
              method: h.method,
              timestamp: u,
              durationMs: Date.now() - u
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
const ju = ["light", "dark", "glass", "neon", "custom", "liquid"], Hu = ["hidden", "icon", "full", "custom"], Vu = ["lightbulb", "bug"], Yu = ["full", "reportOnly", "off"], Gu = /^#[0-9a-fA-F]{3,8}$/, Xu = /^[\w \-,'"().]+$/, ks = (e) => typeof e == "object" && e !== null, xr = (e) => typeof e == "string" && Gu.test(e.trim()) ? e.trim() : void 0, xs = (e, t) => typeof e == "string" && e.trim() ? e.trim().slice(0, t) : void 0, Ku = (e) => {
  if (typeof e != "string") return;
  const t = e.trim().slice(0, 120);
  return t && Xu.test(t) ? t : void 0;
}, Ss = {
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
function Cs(e) {
  let t = e.replace("#", "");
  t.length === 3 && (t = t.split("").map((l) => l + l).join(""));
  const r = parseInt(t.slice(0, 6), 16), n = r >> 16 & 255, i = r >> 8 & 255, o = r & 255;
  return 0.299 * n + 0.587 * i + 0.114 * o;
}
function Oa(e) {
  const t = ks(e) ? e : {}, n = { theme: typeof t.theme == "string" && ju.includes(t.theme) ? t.theme : "light" }, i = xr(t.primary), o = xr(t.secondary), l = xr(t.background), d = xs(t.thankYou, 140), a = Ku(t.font);
  i && (n.primary = i), o && (n.secondary = o), l && (n.background = l), a && (n.font = a), d && (n.thankYou = d), typeof t.launcherMode == "string" && Hu.includes(t.launcherMode) && (n.launcherMode = t.launcherMode);
  const p = xs(t.launcherText, 60);
  p && (n.launcherText = p);
  const s = xr(t.launcherIconColor);
  s && (n.launcherIconColor = s), typeof t.launcherIcon == "string" && Vu.includes(t.launcherIcon) && (n.launcherIcon = t.launcherIcon), typeof t.rightClickMode == "string" && Yu.includes(t.rightClickMode) && (n.rightClickMode = t.rightClickMode), t.maskNumbers === !0 && (n.maskNumbers = !0);
  const h = ks(t.agency_branding) ? t.agency_branding : {};
  return (t.whiteLabel === !0 || h.whiteLabel === !0) && (n.whiteLabel = !0), n;
}
function Ju(e) {
  const t = Oa(e), r = t.theme === "custom" ? { ...Ss.light } : { ...Ss[t.theme] };
  if (t.theme === "custom" && (t.primary && (r["--kl-accent"] = t.primary), t.secondary && (r["--kl-accent2"] = t.secondary), t.background)) {
    r["--kl-bg"] = t.background;
    const i = Cs(t.background) < 140;
    r["--kl-fg"] = i ? "#f4f4f7" : "#1d1d24", r["--kl-muted"] = i ? "rgba(255,255,255,.6)" : "#706560", r["--kl-border"] = i ? "rgba(255,255,255,.16)" : "#e6e6ec", r["--kl-chip"] = i ? "rgba(255,255,255,.08)" : "#f4f4f7", r["--kl-input-bg"] = i ? "rgba(255,255,255,.05)" : "#fafafb";
  }
  return t.font && (r["--kl-font"] = t.font), t.theme === "dark" || t.theme === "neon" || t.theme === "glass" || t.theme === "liquid" || t.theme === "custom" && t.background && Cs(t.background) < 140, r["--kl-img-outline"] = "var(--kl-img-outline-val, color-mix(in srgb, var(--kl-fg) 10%, transparent))", r["--kl-glow"] = "radial-gradient(120% 80% at 50% -10%, color-mix(in srgb, var(--kl-accent) 12%, transparent), transparent 60%), radial-gradient(80% 60% at 100% 110%, color-mix(in srgb, var(--kl-accent2) 6%, transparent), transparent 60%)", `:host{${Object.entries(r).map(([i, o]) => `${i}:${o};`).join("")}}`;
}
class zr {
  constructor() {
    this.onTranscript = (t) => {
    }, this.onError = (t, r) => {
    }, this.onStop = () => {
    }, this._recognition = null, this._timer = null, this._recording = !1;
  }
  static isSupported() {
    return typeof window < "u" && !!(window.SpeechRecognition ?? window.webkitSpeechRecognition);
  }
  start() {
    if (this._recording || !zr.isSupported()) return;
    this._recording = !0;
    const t = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    this._recognition = new t(), this._recognition.continuous = !0, this._recognition.interimResults = !1, this._recognition.lang = typeof document < "u" && document.documentElement.lang || "en-US", this._recognition.onresult = (r) => {
      for (let n = r.resultIndex; n < r.results.length; n++)
        r.results[n].isFinal && this.onTranscript(r.results[n][0].transcript);
    }, this._recognition.onerror = (r) => {
      if (r.error === "no-speech") {
        this.stop();
        return;
      }
      const n = {
        "not-allowed": "Microphone access was denied",
        network: "Voice recognition lost connection"
      };
      this.onError(r.error, n[r.error] ?? ""), this.stop();
    }, this._recognition.onend = () => {
      this._recording && (this._recording = !1, this._clearTimer(), this._recognition = null, this.onStop());
    }, this._recognition.start(), this._timer = setTimeout(() => this.stop(), 18e4);
  }
  stop() {
    this._recording && (this._recording = !1, this._clearTimer(), this._recognition && (this._recognition.onend = null, this._recognition.stop(), this._recognition = null), this.onStop());
  }
  _clearTimer() {
    this._timer !== null && (clearTimeout(this._timer), this._timer = null);
  }
}
const Zu = /* @__PURE__ */ new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"]);
function Sr(e) {
  const t = [], r = [], n = document.createTreeWalker(e, NodeFilter.SHOW_TEXT, {
    acceptNode(l) {
      let d = l.parentElement;
      for (; d && d !== e; ) {
        if (Zu.has(d.tagName)) return NodeFilter.FILTER_REJECT;
        d = d.parentElement;
      }
      return /\d/.test(l.textContent ?? "") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  }), i = [];
  let o;
  for (; o = n.nextNode(); ) i.push(o);
  for (const l of i) {
    const a = (l.textContent ?? "").split(/(\d+)/);
    if (a.length <= 1) continue;
    const p = l.parentNode, s = l.nextSibling, h = a.map((u, c) => {
      if (c % 2 === 1) {
        const m = document.createElement("span");
        return m.style.cssText = "background:#111;color:transparent;border-radius:2px;", m.textContent = u, m;
      }
      return document.createTextNode(u);
    });
    p.removeChild(l);
    for (const u of h) p.insertBefore(u, s);
    t.push({ parent: p, original: l, replacements: h });
  }
  return e.querySelectorAll("input, select").forEach((l) => {
    const d = l.value;
    /\d/.test(d) && (r.push({ el: l, original: d }), l.value = "█".repeat(d.length));
  }), () => {
    for (const { parent: l, original: d, replacements: a } of t) {
      const p = a[0];
      if ((p == null ? void 0 : p.parentNode) === l) {
        l.insertBefore(d, p);
        for (const s of a) s.parentNode === l && l.removeChild(s);
      }
    }
    for (const { el: l, original: d } of r)
      l.value = d;
  };
}
function Qu(e) {
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
function ed(e, t, r) {
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
function Es(e) {
  return e === "attached" ? `${J("play", { size: 12 })}<span>Replay &middot; 60s</span>${J("check", { size: 12, label: "attached" })}` : `${J("play", { size: 12 })}<span>Replay &middot; not available</span>`;
}
function Ms(e) {
  const t = /^fb_([0-9a-f]{8})[0-9a-f-]+$/i.exec(e);
  return t ? "fb_" + t[1] : e;
}
function Rs(e) {
  if (!e) return "";
  try {
    const t = new URL(e);
    return t.protocol === "https:" || t.protocol === "http:" ? t.href : "";
  } catch {
    return "";
  }
}
function rr(e) {
  return typeof e == "string" ? { dataUrl: e } : { dataUrl: e.dataUrl, quality: e.quality };
}
const td = {
  "real-pixel": { label: "Sharp", iconName: "check-circle", degraded: !1 },
  rendered: { label: "Rendered", iconName: "image", degraded: !0 },
  wireframe: { label: "Wireframe", iconName: "triangle-alert", degraded: !0 }
};
function rd(e, t, r = {}) {
  var is;
  const n = Oa(r);
  let i = !!n.maskNumbers;
  const o = document.createElement("div");
  o.setAttribute("data-klavity-ui", "composer"), o.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;";
  const l = o.attachShadow({ mode: "open" });
  document.body.appendChild(o);
  let d = [], a = [], p = [];
  const s = 5, h = 10 * 1024 * 1024, u = {};
  let c = null;
  const m = () => {
    const C = Object.keys(u);
    if (!C.length && !c) return null;
    const O = {};
    if (C.length) {
      const N = {};
      for (const T of C) N[T] = u[T];
      const A = u[0] ?? u[Number(C[0])] ?? {};
      Object.assign(O, A, { byIndex: N });
    }
    return c && (O.selector = c.selector, O.selectorText = c.text), O;
  };
  let f = e, g = 0, k = null, v = t.replayState === "attached", y = null;
  const x = document.createElement("style");
  x.textContent = `
    ${Ju(n)}
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
    .klavity-thumb{position:relative;flex-shrink:0;}
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
    @media (prefers-reduced-motion: reduce){.klavity-overlay,.klavity-modal,.klavity-modal.kl-closing,.klavity-modal>*, .klavity-toast-progress{animation-duration:.01ms!important;}.klavity-modal{--kl-lift:none;--kl-press:none;--kl-bhover:none;--kl-bpress:none;}.klavity-info,.klavity-rm,.klavity-mk{transition:none!important;}.klavity-actions button.kl-loading{animation:none;}.klavity-actions .kl-cap-ic,.klavity-toggle .kl-cap-ic{transition:none;transform:none!important;}}
  `, l.appendChild(x);
  const w = document.createElement("div");
  w.className = "klavity-overlay";
  const b = document.createElement("div");
  b.className = "klavity-modal", b.innerHTML = `
    <button class="klavity-x" id="klavity-x" type="button" aria-label="Close" title="Close (Esc)">${J("x", { size: 16 })}</button>
    <div class="kl-hero" id="klavity-hero">
      <div class="kl-hero-tools" id="klavity-hero-tools"></div>
      <div class="kl-hero-stage" id="klavity-hero-stage">
        <div class="kl-hero-empty" id="klavity-hero-empty">${J("image", { size: 34 })}<span>Capture or upload a screenshot to start marking it up</span></div>
      </div>
      <div class="klavity-strip" id="klavity-strip"></div>
    </div>
    <div class="kl-side" id="klavity-side">
      <div class="klavity-toggle">
        <button class="bug ${e === "bug" ? "active" : ""}"><span class="kl-cap-ic">${J("bug")}</span>Bug</button>
        <button class="feat ${e === "feature" ? "active" : ""}"><span class="kl-cap-ic">${J("lightbulb")}</span>Feature</button>
      </div>
      <div class="klavity-page">${J("map-pin")} ${typeof window < "u" ? ht(window.location.pathname) : ""}</div>
      ${t.replayState ? `<div class="klavity-proof"><span class="klavity-chip ${t.replayState === "attached" ? "kl-chip-on" : "kl-chip-off"}" id="klavity-replay-chip">${Es(t.replayState)}</span></div>` : ""}
      <div class="klavity-actions">
        ${t.onCaptureSharp ? `<button id="klavity-sharp" aria-describedby="klavity-sharp-tip"><span class="kl-cap-ic">${J("app-window")}</span><span class="kl-sharp-label">Screen</span><span class="kl-info-badge" aria-hidden="true"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></span><span id="klavity-sharp-tip" class="klavity-info-pop" role="tooltip">Screen grabs the <b>whole page — every image, pixel-perfect</b> using your browser's screen-share. Your browser will ask you to <b>share this tab</b>.</span></button>` : ""}
        <button id="klavity-full" title="Full Page — instant capture; may miss some cross-origin images"><span class="kl-cap-ic">${J("camera")}</span><span class="kl-full-label">Full Page</span></button>
        <button id="klavity-upload"><span class="kl-cap-ic">${J("image")}</span><span class="kl-upload-label">Upload</span></button>
        ${t.onRegionCapture ? `<button id="klavity-region"><span class="kl-cap-ic">${J("scissors")}</span><span class="kl-region-label">Region</span></button>` : ""}
        ${t.onPickElement ? `<button id="klavity-pick" title="Pick the exact element that's broken"><span class="kl-cap-ic">${J("mouse-pointer-2")}</span><span class="kl-pick-label">Pick element</span></button>` : ""}
        ${zr.isSupported() ? `<button id="klavity-voice" title="Dictate description"><span class="kl-cap-ic">${J("mic")}<span class="kl-vdot"></span></span><span class="kl-voice-label">Voice</span><svg class="kl-vring" viewBox="0 0 32 32" aria-hidden="true"><circle class="kl-vring-bg" cx="16" cy="16" r="13" fill="none" stroke-width="2"/><circle class="kl-vring-prog" cx="16" cy="16" r="13" fill="none" stroke-width="2" stroke-dasharray="81.68" stroke-dashoffset="81.68" stroke-linecap="round" transform="rotate(-90 16 16)"/></svg></button>` : ""}
      </div>
      ${t.onPickElement ? '<div class="klavity-pickinfo" id="klavity-pickinfo" role="status" aria-live="polite" hidden></div>' : ""}
      <label class="klav-mask-row"><input type="checkbox" id="klavity-mask-numbers"${i ? " checked" : ""}>${J("eye-off", { size: 13 })}<span>Mask numbers</span></label>
      <input type="file" id="klavity-file" accept="image/*,.heic,.heif" multiple style="display:none">
      <div class="klavity-counter" id="klavity-counter">0/5 images</div>
      <div class="klavity-error" id="klavity-err"></div>
      <textarea class="klavity-desc" id="klavity-desc" placeholder="${e === "feature" ? "Describe the feature you'd like..." : "Describe the bug..."}"></textarea>
      <div class="klavity-desc-hint" id="klavity-desc-hint" hidden>${J("sparkles", { size: 13 })}<span>No title needed — we'll auto-generate one for you</span></div>
      ${t.onCheckKnown ? '<div class="klavity-known" id="klavity-known" role="status" aria-live="polite" hidden></div>' : ""}
      ${t.requireEmail ? '<input type="email" class="klavity-remail" id="klavity-remail" placeholder="your@email.com" autocomplete="email">' : ""}
      <button class="klavity-submit" id="klavity-submit" title="Submit (S)" disabled>Submit</button>
      <div class="klavity-progress" id="klavity-progress" role="progressbar" aria-label="Uploading report"><div class="klavity-progress-fill" id="klavity-progress-fill"></div></div>
    </div>
  `, w.appendChild(b), l.appendChild(w);
  const S = l.getElementById("klavity-mask-numbers");
  S && S.addEventListener("change", () => {
    i = S.checked;
  });
  const M = l.getElementById("klavity-sharp"), I = l.querySelector(".klavity-info-pop");
  if (M && I) {
    const C = document.createElement("div");
    C.className = "kl-float-tip", C.setAttribute("role", "tooltip"), C.innerHTML = I.innerHTML, l.appendChild(C);
    const O = () => {
      const A = M.getBoundingClientRect(), T = Math.min(228, window.innerWidth - 16), D = 8, W = window.innerWidth, V = window.innerHeight, F = A.left + A.width / 2 - T / 2, U = Math.max(D, Math.min(F, W - T - D));
      C.style.left = U + "px", C.style.top = "-9999px", C.style.visibility = "hidden", C.style.display = "block";
      const q = C.offsetHeight;
      C.style.display = "", C.style.visibility = "";
      let _ = A.bottom + 8;
      _ + q + D > V && (_ = A.top - q - 8), _ = Math.max(D, Math.min(_, V - q - D)), C.style.top = _ + "px", C.classList.add("kl-show");
    }, N = () => C.classList.remove("kl-show");
    M.addEventListener("mouseenter", O), M.addEventListener("mouseleave", N), M.addEventListener("focus", O), M.addEventListener("blur", N);
  }
  function R(C) {
    v = C === "attached", Q();
    const O = l.getElementById("klavity-replay-chip");
    O && (O.classList.toggle("kl-chip-on", C === "attached"), O.classList.toggle("kl-chip-off", C !== "attached"), O.innerHTML = Es(C));
  }
  const j = {
    shadowRoot: l,
    addScreenshot: be,
    close: Z,
    setReplayState: R
  };
  function z() {
    const C = l.getElementById("klavity-strip"), O = l.getElementById("klavity-counter");
    C.innerHTML = "", d.forEach((N, A) => {
      const T = document.createElement("div");
      T.className = "klavity-thumb", A === g && T.classList.add("kl-thumb-active");
      const D = document.createElement("img");
      D.src = N, D.title = "Click to select + mark up", D.addEventListener("load", () => {
        D.naturalHeight > D.naturalWidth * 1.4 && T.classList.add("kl-tall");
      }, { once: !0 }), D.addEventListener("click", () => {
        g = A, z();
      });
      const W = document.createElement("button");
      W.className = "klavity-rm", W.innerHTML = J("x", { size: 13 }), W.title = "Remove", W.addEventListener("click", (U) => {
        U.stopPropagation(), d.splice(A, 1), a.splice(A, 1), p.splice(A, 1), delete u[A];
        for (const q of Object.keys(u).map(Number).filter((_) => _ > A).sort((_, X) => _ - X))
          u[q - 1] = u[q], delete u[q];
        d.length === 0 && Ze(null), z();
      });
      const V = document.createElement("button");
      V.className = "klavity-mk", V.innerHTML = J("pencil", { size: 13 }), V.title = "Mark up", V.addEventListener("click", (U) => {
        U.stopPropagation(), Jl(A);
      }), T.append(D, W, V);
      const F = p[A];
      if (F) {
        const U = td[F], q = document.createElement("span");
        if (q.className = "klavity-qb kl-q-" + F, q.title = F === "real-pixel" ? "Pixel-perfect capture (every image included)" : F === "wireframe" ? "Wireframe fallback — layout only, images not captured. Retake for a sharp shot." : "Rendered capture — some cross-origin images may be missing. Retake for a sharp shot.", q.innerHTML = J(U.iconName, { size: 10 }) + '<span class="klavity-qb-t">' + ht(U.label) + "</span>", T.appendChild(q), U.degraded && t.onRetakeSharp) {
          const _ = document.createElement("button");
          _.type = "button", _.className = "klavity-retake", _.innerHTML = J("zap", { size: 11 }) + "<span>Retake sharp</span>", _.title = "Recapture this shot at full pixel quality", _.addEventListener("click", (X) => {
            X.stopPropagation(), ie(A, _);
          }), T.appendChild(_);
        }
      }
      if (ne.has(A)) {
        const U = document.createElement("div");
        U.className = "klavity-retake-note", U.textContent = "Markup cleared for the retake.", T.appendChild(U);
      }
      C.appendChild(T);
    }), O.textContent = `${d.length}/5 images`, Q(), Gl();
  }
  function E(C) {
    const O = l.getElementById("klavity-err");
    O && (O.textContent = C, O.style.display = "block");
  }
  function Ne() {
    const C = l.getElementById("klavity-err");
    C && (C.style.display = "none");
  }
  function be(C, O) {
    if (d.length >= s) {
      E(`You can attach up to ${s} images.`);
      return;
    }
    Ne(), d.push(C), a.push(t.compressImage ? t.compressImage(C) : Promise.resolve(C)), p.push(O), z();
  }
  const ne = /* @__PURE__ */ new Set();
  async function ie(C, O) {
    if (!(me || !t.onRetakeSharp)) {
      Y(!0), O.classList.add("kl-loading"), o.style.display = "none";
      try {
        const N = i ? Sr(document.body) : null;
        let A;
        try {
          A = await t.onRetakeSharp();
        } finally {
          N == null || N();
        }
        if (A) {
          const { dataUrl: T, quality: D } = rr(A);
          T && (d[C] = T, a[C] = t.compressImage ? t.compressImage(T) : Promise.resolve(T), p[C] = D ?? "real-pixel", u[C] && (delete u[C], ne.add(C)));
        }
      } catch {
      } finally {
        o.style.display = "", Y(!1), z();
      }
    }
  }
  function he(C) {
    return C.type.startsWith("image/") || /\.(heic|heif|png|jpe?g|gif|webp|bmp|avif|svg)$/i.test(C.name);
  }
  async function ke(C) {
    Ne();
    for (const O of C) {
      if (d.length >= s) {
        E(`You can attach up to ${s} images.`);
        break;
      }
      if (!he(O)) {
        E(`"${O.name}" isn't an image — only image files can be attached.`);
        continue;
      }
      if (O.size > h) {
        E(`"${O.name}" is too large — images must be under ${Math.round(h / 1024 / 1024)} MB.`);
        continue;
      }
      try {
        be(await id(O));
      } catch {
        E(`Couldn't add "${O.name}". Please try a different image.`);
      }
    }
  }
  let ce = null;
  function Z() {
    var N;
    ce == null || ce(), y && (clearTimeout(y), y = null), document.removeEventListener("keydown", Ce, { capture: !0 }), document.removeEventListener("paste", L);
    try {
      (N = t.onClose) == null || N.call(t);
    } catch {
    }
    const C = l.querySelector(".klavity-modal");
    if (!C) {
      o.remove();
      return;
    }
    C.classList.add("kl-closing");
    const O = () => o.remove();
    C.addEventListener("animationend", O, { once: !0 }), setTimeout(O, 700);
  }
  function Ce(C) {
    if (C.key === "Escape") {
      C.stopPropagation(), Z();
      return;
    }
    if ((C.key === "s" || C.key === "S") && !C.metaKey && !C.ctrlKey && !C.altKey) {
      const O = C.target;
      if (O && (O.tagName === "INPUT" || O.tagName === "TEXTAREA" || O.isContentEditable) || l.querySelector(".kl-edtb")) return;
      const N = l.getElementById("klavity-submit");
      N && !N.disabled && (C.preventDefault(), C.stopPropagation(), N.click());
    }
  }
  document.addEventListener("keydown", Ce, { capture: !0 });
  const L = (C) => {
    if (!C.clipboardData) return;
    const O = Array.from(C.clipboardData.items).filter((N) => N.type.startsWith("image/")).map((N) => N.getAsFile()).filter((N) => !!N);
    O.length && ke(O);
  };
  document.addEventListener("paste", L);
  const Pe = b.querySelector(".bug"), Ee = b.querySelector(".feat"), pt = () => {
    const C = b.querySelector("#klavity-desc");
    C && (C.placeholder = f === "feature" ? "Describe the feature you'd like..." : "Describe the bug...");
  };
  Pe.addEventListener("click", () => {
    f = "bug", Pe.classList.add("active"), Ee.classList.remove("active"), pt();
  }), Ee.addEventListener("click", () => {
    f = "feature", Ee.classList.add("active"), Pe.classList.remove("active"), pt();
  });
  const oe = b.querySelector("#klavity-desc"), Se = b.querySelector("#klavity-submit"), Me = b.querySelector("#klavity-remail"), We = b.querySelector("#klavity-desc-hint"), H = () => !t.requireEmail || !!Me && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(Me.value.trim()), fe = () => d.length > 0 || v, Q = () => {
    const C = oe.value.trim() === "";
    Se.disabled = C && !fe() || !H(), We && (We.hidden = !(C && fe()));
  };
  if (oe.addEventListener("input", Q), Me == null || Me.addEventListener("input", Q), t.onCheckKnown) {
    const C = b.querySelector("#klavity-known"), O = t.onCheckKnown;
    let N = null, A = 0, T = "";
    const D = () => {
      C && (C.hidden = !0, C.textContent = "");
    }, W = (F) => {
      var q;
      if (!C) return;
      const U = F.headline ? ht(F.headline) : "Already reported";
      C.innerHTML = `<span class="kl-known-ic">${J("check-circle", { size: 15 })}</span><div class="kl-known-body"><span class="kl-known-title">${U}</span> — status: <span class="kl-known-status">${ht(F.statusLabel)}</span>. We're already tracking "${ht(F.title)}". Add your note and submit anyway — it'll be linked.</div><button type="button" class="kl-known-dismiss" id="klavity-known-dismiss">Dismiss</button>`, C.hidden = !1, (q = C.querySelector("#klavity-known-dismiss")) == null || q.addEventListener("click", () => {
        T = oe.value.trim(), D();
      });
    }, V = async () => {
      const F = oe.value.trim();
      if (F.length < 12 || F === T) {
        D();
        return;
      }
      const U = ++A;
      try {
        const q = await O(F);
        if (U !== A) return;
        if (oe.value.trim() === T) {
          D();
          return;
        }
        q ? W(q) : D();
      } catch {
      }
    };
    oe.addEventListener("input", () => {
      oe.value.trim() !== T && (T = ""), N && clearTimeout(N), N = setTimeout(V, 500);
    });
  }
  w.addEventListener("click", (C) => {
    C.target === w && Z();
  }), (is = b.querySelector("#klavity-x")) == null || is.addEventListener("click", () => Z());
  const ue = () => Array.from(b.querySelectorAll(".klavity-actions button:not(#klavity-voice)"));
  let me = !1;
  const Y = (C) => {
    me = C, ue().forEach((O) => {
      O.disabled = C;
    }), C ? Se.disabled = !0 : Q();
  }, Ze = (C) => {
    ue().forEach((O) => {
      O.classList.remove("kl-active"), O.removeAttribute("aria-pressed");
    }), C && (C.classList.add("kl-active"), C.setAttribute("aria-pressed", "true"));
  }, vt = b.querySelector("#klavity-voice");
  if (vt) {
    const C = new zr(), O = 81.68, N = 15e3, A = vt.querySelector(".kl-vring-prog");
    let T = 0, D = 0, W = !1;
    const V = () => {
      D = Date.now();
      const U = () => {
        const q = Date.now() - D, _ = Math.min(q / 18e4, 1);
        if (A == null || A.setAttribute("stroke-dashoffset", String(_ * O)), q >= 18e4 - N && vt.classList.add("kl-voice-warn"), q >= 18e4) {
          C.stop();
          return;
        }
        T = requestAnimationFrame(U);
      };
      T = requestAnimationFrame(U);
    }, F = () => {
      cancelAnimationFrame(T), A == null || A.setAttribute("stroke-dashoffset", String(O)), vt.classList.remove("kl-voice-warn");
    };
    C.onTranscript = (U) => {
      const q = oe.value;
      oe.value = q + (q.length > 0 && !/\s$/.test(q) ? " " : "") + U, Q();
    }, C.onError = (U, q) => {
      if (!q) return;
      let _ = l.getElementById("klavity-voice-err");
      _ || (_ = document.createElement("div"), _.id = "klavity-voice-err", _.style.cssText = "color:rgb(220 38 38);font-size:12px;margin-top:4px;opacity:1;", oe.insertAdjacentElement("afterend", _)), _.style.opacity = "1", _.style.transition = "", _.textContent = q, _.style.transition = "opacity .3s ease", setTimeout(() => {
        _ && (_.style.opacity = "0");
      }, 3700), setTimeout(() => {
        _ && (_.textContent = "", _.style.opacity = "1", _.style.transition = "");
      }, 4e3);
    }, C.onStop = () => {
      W = !1, vt.classList.remove("kl-voice-rec"), F();
    }, vt.addEventListener("click", () => {
      W ? C.stop() : (W = !0, vt.classList.add("kl-voice-rec"), C.start(), V());
    }), ce = () => {
      W && C.stop();
    };
  }
  Se.addEventListener("click", async () => {
    if (me || Se.disabled) return;
    const C = oe.value.trim();
    Y(!0), Se.textContent = "Uploading…";
    const O = l.getElementById("klavity-err");
    O.style.display = "none";
    const N = l.getElementById("klavity-progress"), A = l.getElementById("klavity-progress-fill");
    N && A && (N.classList.add("show"), A.style.transition = "none", A.style.width = "8%", A.offsetWidth, A.style.transition = "width 10s cubic-bezier(.05,.7,.2,1)", requestAnimationFrame(() => {
      A.style.width = "90%";
    }));
    const T = () => {
      A && (A.style.transition = "width .25s ease", A.style.width = "100%");
    }, D = () => {
      N && A && (N.classList.remove("show"), A.style.transition = "none", A.style.width = "0");
    };
    try {
      const W = await Promise.all(a), V = await t.onSubmit({ type: f, description: C, screenshots: W, annotations: m(), reporterEmail: (Me == null ? void 0 : Me.value.trim()) || void 0 });
      if (T(), t.success)
        Zl(V.issueKey, V.issueUrl, t.success);
      else {
        const F = document.createElement("div");
        F.style.cssText = "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:all;";
        const U = document.createElement("div");
        U.style.cssText = "background:var(--kl-bg);color:var(--kl-fg);border:1px solid var(--kl-border);border-radius:var(--kl-radius);padding:32px;font-family:var(--kl-font,system-ui),sans-serif;font-size:16px;text-align:center;box-shadow:var(--kl-shadow);";
        let q = "";
        if (n.thankYou)
          U.textContent = n.thankYou;
        else if (U.innerHTML = `${J("check-circle", { label: "Filed", size: 20 })} Filed as `, U.appendChild(document.createTextNode(Ms(V.issueKey))), q = Rs(V.issueUrl), q) {
          const _ = document.createElement("a");
          _.href = q, _.target = "_blank", _.rel = "noopener", _.textContent = "View in dashboard", _.style.cssText = "display:block;margin-top:12px;font-size:14px;font-weight:600;color:var(--kl-accent);text-decoration:underline;text-underline-offset:2px;", U.appendChild(_);
        }
        F.appendChild(U), w.remove(), l.appendChild(F), setTimeout(Z, n.thankYou ? 2600 : q ? 4e3 : 1500);
      }
    } catch (W) {
      D(), O.textContent = W.message, O.style.display = "block", Se.textContent = "Submit", Y(!1);
    }
  });
  const Qt = b.querySelector("#klavity-full");
  if (Qt.addEventListener("click", async () => {
    if (!me) {
      Y(!0), Qt.classList.add("kl-loading");
      try {
        const C = i ? Sr(document.body) : null;
        try {
          const { dataUrl: O, quality: N } = rr(await t.onCaptureFull());
          be(O, N), Ze(Qt);
        } finally {
          C == null || C();
        }
      } catch {
      } finally {
        Qt.classList.remove("kl-loading"), Y(!1);
      }
    }
  }), M && t.onCaptureSharp) {
    const C = M.querySelector(".kl-sharp-label"), O = async () => {
      if (me) return;
      Y(!0), M.classList.add("kl-loading"), o.style.display = "none";
      const N = C ?? M, A = N.textContent;
      N.textContent = "Capturing…";
      try {
        const T = i ? Sr(document.body) : null;
        let D;
        try {
          D = await t.onCaptureSharp();
        } finally {
          T == null || T();
        }
        if (D) {
          const { dataUrl: W, quality: V } = rr(D);
          W && (be(W, V ?? "real-pixel"), Ze(M));
        }
      } catch {
      } finally {
        o.style.display = "", N.textContent = A, M.classList.remove("kl-loading"), Y(!1);
      }
    };
    M.addEventListener("click", () => {
      O();
    });
  }
  const es = b.querySelector("#klavity-file"), ts = b.querySelector("#klavity-upload");
  ts.addEventListener("click", () => {
    if (me || d.length >= s) {
      d.length >= s && E(`You can attach up to ${s} images.`);
      return;
    }
    es.click();
  }), es.addEventListener("change", async (C) => {
    const O = C.target, N = O.files ? Array.from(O.files) : [];
    if (O.value = "", N.length) {
      const A = d.length;
      await ke(N), d.length > A && Ze(ts);
    }
  });
  const un = l.getElementById("klavity-region");
  un && t.onRegionCapture && (un.onclick = () => {
    me || (Y(!0), document.removeEventListener("keydown", Ce, { capture: !0 }), o.style.display = "none", nd(async (C) => {
      document.addEventListener("keydown", Ce, { capture: !0 });
      try {
        const O = i ? Sr(document.body) : null;
        let N;
        try {
          N = await t.onRegionCapture(C);
        } finally {
          O == null || O();
        }
        if (N) {
          const { dataUrl: A, quality: T } = rr(N);
          A && (be(A, T), Ze(un));
        }
      } finally {
        o.style.display = "", Y(!1);
      }
    }, () => {
      document.addEventListener("keydown", Ce, { capture: !0 }), o.style.display = "", Y(!1);
    }));
  });
  const Nt = l.getElementById("klavity-pick"), Pt = l.getElementById("klavity-pickinfo"), rs = () => {
    var A;
    if (Nt && (Nt.classList.toggle("kl-active", !!c), c ? Nt.setAttribute("aria-pressed", "true") : Nt.removeAttribute("aria-pressed")), !Pt) return;
    if (!c) {
      Pt.hidden = !0, Pt.innerHTML = "";
      return;
    }
    Pt.hidden = !1;
    const { selector: C, text: O } = c, N = O ? `<span class="kl-pick-txt">${ht(O)}</span>` : "";
    Pt.innerHTML = `<span class="kl-pick-ic">${J("mouse-pointer-2", { size: 13 })}</span><span>Element pinned:</span><code title="${ht(C)}">${ht(C)}</code>${N}<button type="button" class="kl-pick-clear" id="klavity-pick-clear">Clear</button>`, (A = Pt.querySelector("#klavity-pick-clear")) == null || A.addEventListener("click", () => {
      c = null, rs();
    });
  };
  Nt && t.onPickElement && (Nt.onclick = async () => {
    if (!me) {
      Y(!0), document.removeEventListener("keydown", Ce, { capture: !0 }), o.style.display = "none";
      try {
        const C = await t.onPickElement();
        C && (c = C, rs());
      } catch {
      } finally {
        document.addEventListener("keydown", Ce, { capture: !0 }), o.style.display = "", Y(!1);
      }
    }
  });
  function wt(C, O = 15) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${O}" height="${O}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em">${C}</svg>`;
  }
  function Yl() {
    const C = (N, A, T, D) => `<button type="button" class="kl-htool" data-tool="${N}" title="${A} (${D.toUpperCase()})" aria-label="${A}">${T}<span class="kl-hk">${D.toUpperCase()}</span></button>`, O = (N) => `<button type="button" class="kl-hcolor" data-color="${N}" style="background:${N}" title="${N}" aria-label="Colour ${N}"></button>`;
    return C("pen", "Pen", J("pencil", { size: 15 }), "p") + C("line", "Line", wt('<line x1="5" y1="19" x2="19" y2="5"/>'), "l") + C("rect", "Rectangle", J("square", { size: 15 }), "r") + C("circle", "Circle", wt('<circle cx="12" cy="12" r="9"/>'), "o") + C("arrow", "Arrow", wt('<line x1="5" y1="19" x2="19" y2="5"/><polyline points="10 5 19 5 19 14"/>'), "a") + C("text", "Text", wt('<path d="M5 6h14M12 6v13M9 19h6"/>'), "t") + C("count", "Numbers", wt('<circle cx="12" cy="12" r="9"/><text x="12" y="16" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor" stroke="none">1</text>'), "c") + C("crop", "Crop", wt('<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>'), "k") + '<span class="kl-hsep"></span>' + O("#ef4444") + O("#f97316") + O("#3b82f6") + O("#111827") + // Line-width control (applies to pen/line/rect/circle/arrow strokes via Annotator.strokeScale).
    `<span class="kl-hsep"></span><span class="kl-hlabel">Width</span><button type="button" class="kl-hopt" data-stroke="0.6" title="Thin stroke" aria-label="Thin stroke">S</button><button type="button" class="kl-hopt kl-on" data-stroke="1" title="Medium stroke" aria-label="Medium stroke">M</button><button type="button" class="kl-hopt" data-stroke="1.8" title="Thick stroke" aria-label="Thick stroke">L</button><button type="button" class="kl-hopt" data-stroke="2.8" title="Extra-thick stroke" aria-label="Extra-thick stroke">XL</button><span class="kl-htextopts" id="kl-hero-textopts" hidden><span class="kl-hsep"></span><span class="kl-hlabel">Outline</span><button type="button" class="kl-hopt kl-on" data-outline="black" title="Black outline"><span class="kl-osq" style="background:#111"></span></button><button type="button" class="kl-hopt" data-outline="white" title="White outline"><span class="kl-osq" style="background:#fff;border:1px solid #999"></span></button><button type="button" class="kl-hopt" data-outline="none" title="No outline">None</button><span class="kl-hlabel">Size</span><button type="button" class="kl-hopt" data-size="18" title="Small">S</button><button type="button" class="kl-hopt kl-on" data-size="26" title="Medium">M</button><button type="button" class="kl-hopt" data-size="40" title="Large">L</button></span><span class="kl-hsep"></span><button type="button" class="kl-htbtn" id="kl-hero-undo" title="Undo (⌘Z)" aria-label="Undo">${wt('<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>', 14)}</button><button type="button" class="kl-htbtn" id="kl-hero-clear" title="Clear" aria-label="Clear">${J("trash-2", { size: 14 })}</button><span class="kl-hgrow"></span><span class="kl-hhint">P pen · L line · R rect · O circle · T text · C numbers · K crop · scroll to zoom · shift-drag to pan</span>`;
  }
  function dn() {
    k && (document.removeEventListener("keydown", k, { capture: !0 }), k = null);
  }
  function ns() {
    const C = l.getElementById("klavity-hero-stage"), O = l.getElementById("klavity-hero-tools");
    O && (O.innerHTML = ""), C && (C.innerHTML = `<div class="kl-hero-empty">${J("image", { size: 34 })}<span>Capture or upload a screenshot to start marking it up</span></div>`), dn();
  }
  function Gl() {
    if (d.length === 0) {
      g = 0, ns();
      return;
    }
    g >= d.length && (g = d.length - 1), g < 0 && (g = 0), Kl(g);
  }
  function Xl(C, O, N, A, T) {
    const D = d[C];
    if (!D) return;
    const W = new Image();
    W.onload = () => {
      var _;
      if (d[C] !== D) return;
      const V = document.createElement("canvas");
      V.width = Math.max(1, Math.round(A)), V.height = Math.max(1, Math.round(T));
      const F = V.getContext("2d");
      if (!F) return;
      F.drawImage(W, O, N, A, T, 0, 0, V.width, V.height);
      let U;
      try {
        U = V.toDataURL("image/png");
      } catch {
        return;
      }
      d[C] = U, a[C] = t.compressImage ? t.compressImage(U) : Promise.resolve(U);
      const q = (_ = u[C]) == null ? void 0 : _.shapes;
      Array.isArray(q) && q.length ? u[C] = { w: V.width, h: V.height, shapes: ed(q, -O, -N) } : delete u[C], z();
    }, W.src = D;
  }
  function Kl(C) {
    var F, U, q;
    const O = l.getElementById("klavity-hero-stage"), N = l.getElementById("klavity-hero-tools");
    if (!O || !N) return;
    const A = d[C];
    if (!A) {
      ns();
      return;
    }
    dn(), O.innerHTML = "";
    const T = document.createElement("canvas");
    T.width = 1, T.height = 1, T.style.cssText = "display:block;max-width:100%;max-height:100%;object-fit:contain;cursor:crosshair;touch-action:none;background:#fff;border-radius:8px;box-shadow:0 12px 40px rgba(0,0,0,.5);";
    const D = new vs(T, A), W = (F = u[C]) == null ? void 0 : F.shapes;
    Array.isArray(W) && W.forEach((_) => D.shapes.push({ ..._ })), O.appendChild(T);
    const V = new Image();
    V.onload = () => {
      !document.body.contains(o) || g !== C || d[C] !== A || (T.width = V.naturalWidth || 1, T.height = V.naturalHeight || 1, D.redraw());
    }, V.src = A, D.redraw();
    {
      N.innerHTML = Yl();
      let _ = "pen", X = "#ef4444", ze = 26, Ie = "black";
      const Re = N.querySelector("#kl-hero-textopts"), ve = () => {
        D.shapes.length ? u[C] = { w: T.width, h: T.height, shapes: D.shapes.map(($) => ({ ...$ })) } : delete u[C];
      }, ot = ($) => {
        _ = $, N.querySelectorAll("[data-tool]").forEach((B) => B.classList.toggle("kl-on", B.dataset.tool === $)), Re && (Re.hidden = $ !== "text");
      }, kt = ($, B) => {
        X = $, N.querySelectorAll("[data-color]").forEach((ae) => ae.classList.toggle("kl-on", ae === B));
      };
      N.querySelectorAll("[data-tool]").forEach(($) => $.addEventListener("click", () => ot($.dataset.tool))), N.querySelectorAll("[data-color]").forEach(($) => $.addEventListener("click", () => kt($.dataset.color, $))), N.querySelectorAll("[data-outline]").forEach(($) => $.addEventListener("click", () => {
        Ie = $.dataset.outline, N.querySelectorAll("[data-outline]").forEach((B) => B.classList.toggle("kl-on", B === $));
      })), N.querySelectorAll("[data-size]").forEach(($) => $.addEventListener("click", () => {
        ze = Number($.dataset.size), N.querySelectorAll("[data-size]").forEach((B) => B.classList.toggle("kl-on", B === $));
      })), N.querySelectorAll("[data-stroke]").forEach(($) => $.addEventListener("click", () => {
        D.strokeScale = Number($.dataset.stroke) || 1, N.querySelectorAll("[data-stroke]").forEach((B) => B.classList.toggle("kl-on", B === $)), D.redraw();
      })), (U = N.querySelector("#kl-hero-undo")) == null || U.addEventListener("click", () => {
        D.undo(), ve();
      }), (q = N.querySelector("#kl-hero-clear")) == null || q.addEventListener("click", () => {
        D.clearAll(), ve();
      }), ot(_), kt(X, N.querySelector("[data-color]"));
      const je = ($) => {
        const B = T.getBoundingClientRect(), ae = Math.min(B.width / T.width, B.height / T.height) || 1, Ue = T.width * ae, tt = T.height * ae, rt = (B.width - Ue) / 2, _t = (B.height - tt) / 2;
        return { x: ($.clientX - B.left - rt) / ae, y: ($.clientY - B.top - _t) / ae };
      };
      let we = 1, Qe = 0, at = 0, lt = null;
      const er = ($) => Math.min(6, Math.max(1, $)), xt = () => {
        if (we === 1) {
          Qe = 0, at = 0, T.style.transform = "", T.style.cursor = "crosshair";
          return;
        }
        T.style.transformOrigin = "0 0", T.style.transform = `translate(${Qe}px,${at}px) scale(${we})`, T.style.cursor = "grab";
      }, G = ($, B, ae) => {
        if (we === 1) {
          const _t = T.style.transform;
          T.style.transform = "", lt = T.getBoundingClientRect(), T.style.transform = _t;
        }
        if (!lt) return;
        const Ue = we;
        if (we = er(we * ae), we === Ue) return;
        const tt = ($ - lt.left - Qe) / Ue, rt = (B - lt.top - at) / Ue;
        Qe = $ - lt.left - we * tt, at = B - lt.top - we * rt, xt();
      };
      O.addEventListener("wheel", ($) => {
        _ !== "crop" && ($.preventDefault(), G($.clientX, $.clientY, $.deltaY < 0 ? 1.18 : 1 / 1.18));
      }, { passive: !1 }), O.addEventListener("dblclick", () => {
        we = 1, xt();
      });
      let se = D.shapes.reduce(($, B) => B.type === "count" ? Math.max($, B.n) : $, 0), ge = !1, Fe = 0, et = 0, br = [], vr = !1, ss = 0, os = 0, as = 0, ls = 0, He = null, tr = { x: 0, y: 0 };
      T.addEventListener("pointerdown", ($) => {
        if ($.shiftKey && we > 1) {
          vr = !0, ss = $.clientX, os = $.clientY, as = Qe, ls = at, T.style.cursor = "grabbing";
          try {
            T.setPointerCapture($.pointerId);
          } catch {
          }
          $.preventDefault();
          return;
        }
        const B = je($);
        if (Fe = B.x, et = B.y, _ === "crop") {
          ge = !0, tr = { x: $.clientX, y: $.clientY }, He = document.createElement("div"), He.style.cssText = "position:absolute;border:2px dashed #6c63ff;background:rgba(108,99,255,.14);pointer-events:none;z-index:6;left:0;top:0;width:0;height:0;", O.appendChild(He);
          return;
        }
        if (_ === "text") {
          const ae = document.createElement("input"), Ue = Ie === "none" ? "none" : `0 0 2px ${Ie}, 0 0 2px ${Ie}`;
          ae.style.cssText = `position:fixed;left:${$.clientX}px;top:${$.clientY}px;background:transparent;border:1px dashed ${X};color:${X};font-size:${ze}px;font-weight:700;text-shadow:${Ue};outline:none;z-index:2147483647;min-width:80px;`;
          const tt = ze, rt = Ie;
          document.body.appendChild(ae), ae.focus(), ae.addEventListener("blur", () => {
            ae.value.trim() && (D.addShape({ type: "text", color: X, x: Fe, y: et, text: ae.value.trim(), size: tt, outline: rt }), ve()), ae.remove();
          }, { once: !0 }), ae.addEventListener("keydown", (_t) => {
            _t.key === "Enter" && ae.blur(), _t.stopPropagation();
          });
          return;
        }
        if (_ === "count") {
          D.addShape({ type: "count", color: X, x: B.x, y: B.y, n: ++se }), ve();
          return;
        }
        ge = !0, _ === "pen" && (br = [B]);
      }), T.addEventListener("pointermove", ($) => {
        if (vr) {
          Qe = as + ($.clientX - ss), at = ls + ($.clientY - os), xt(), T.style.cursor = "grabbing";
          return;
        }
        if (ge) {
          if (_ === "pen") {
            br.push(je($));
            return;
          }
          if (_ === "crop" && He) {
            const B = O.getBoundingClientRect(), ae = Math.min(tr.x, $.clientX), Ue = Math.min(tr.y, $.clientY), tt = Math.max(tr.x, $.clientX), rt = Math.max(tr.y, $.clientY);
            He.style.left = ae - B.left + "px", He.style.top = Ue - B.top + "px", He.style.width = tt - ae + "px", He.style.height = rt - Ue + "px";
          }
        }
      }), T.addEventListener("pointerup", ($) => {
        if (vr) {
          vr = !1, T.style.cursor = we > 1 ? "grab" : "crosshair";
          try {
            T.releasePointerCapture($.pointerId);
          } catch {
          }
          return;
        }
        if (!ge) return;
        ge = !1;
        const B = je($);
        if (_ === "crop") {
          He && (He.remove(), He = null);
          const ae = Math.max(0, Math.min(Fe, B.x)), Ue = Math.max(0, Math.min(et, B.y)), tt = Math.abs(B.x - Fe), rt = Math.abs(B.y - et);
          tt > 4 && rt > 4 && Xl(C, ae, Ue, tt, rt);
          return;
        }
        _ === "pen" && br.length > 1 ? D.addShape({ type: "pen", color: X, points: br }) : _ === "line" ? D.addShape({ type: "line", color: X, x1: Fe, y1: et, x2: B.x, y2: B.y }) : _ === "rect" ? D.addShape({ type: "rect", color: X, x: Math.min(Fe, B.x), y: Math.min(et, B.y), w: Math.abs(B.x - Fe), h: Math.abs(B.y - et) }) : _ === "circle" ? D.addShape({ type: "circle", color: X, x: (Fe + B.x) / 2, y: (et + B.y) / 2, rx: Math.abs(B.x - Fe) / 2, ry: Math.abs(B.y - et) / 2 }) : _ === "arrow" && D.addShape({ type: "arrow", color: X, x1: Fe, y1: et, x2: B.x, y2: B.y }), ve();
      });
      const cs = { p: "pen", l: "line", r: "rect", o: "circle", a: "arrow", t: "text", c: "count", k: "crop" };
      k = ($) => {
        if (!document.body.contains(o)) {
          dn();
          return;
        }
        const B = typeof $.composedPath == "function" && $.composedPath()[0] || $.target;
        if (B && (B.tagName === "INPUT" || B.tagName === "TEXTAREA" || B.tagName === "SELECT" || B.isContentEditable)) return;
        if (($.metaKey || $.ctrlKey) && $.key.toLowerCase() === "z") {
          $.preventDefault(), D.undo(), ve();
          return;
        }
        if ($.metaKey || $.ctrlKey || $.altKey) return;
        const ae = $.key.toLowerCase();
        cs[ae] && ($.preventDefault(), ot(cs[ae]));
      }, document.addEventListener("keydown", k, { capture: !0 });
    }
  }
  function Jl(C) {
    const O = d[C], N = new Image();
    N.onload = () => {
      const A = document.createElement("canvas");
      A.width = N.naturalWidth, A.height = N.naturalHeight;
      const T = new vs(A, O);
      T.redraw();
      const D = document.createElement("div");
      D.style.cssText = "position:fixed;inset:0;background:#000;z-index:2147483647;display:flex;flex-direction:column;pointer-events:all;";
      const W = document.createElement("div");
      W.className = "kl-edtb", W.style.cssText = "display:flex;align-items:center;gap:8px;padding:8px;background:#1e1e2e;flex-wrap:wrap;", W.innerHTML = `
        <button data-tool="pen" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${J("pencil", { size: 14 })} Pen</button>
        <button data-tool="rect" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${J("square", { size: 14 })} Rect</button>
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
        <button id="klavity-clear-ann" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${J("trash-2", { size: 14 })} Clear</button>
        <button id="klavity-save-ann" style="padding:6px 10px;background:#89b4fa;color:#1e1e2e;border:none;border-radius:4px;cursor:pointer;font-weight:700;">${J("check", { label: "Save", size: 14 })} Save</button>
        <button id="klavity-cancel-ann" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${J("x", { size: 14 })}</button>
      `, A.style.cssText = "cursor:crosshair;display:block;margin:12px auto;touch-action:none;background:#fff;border-radius:4px;outline:1px solid rgba(255,255,255,.12);outline-offset:-1px;box-shadow:0 12px 44px rgba(0,0,0,.55);";
      const V = document.createElement("div");
      V.style.cssText = "flex:1;min-height:0;overflow:auto;display:block;box-shadow:inset 0 1px 0 rgba(255,255,255,.04);", V.appendChild(A);
      const F = document.createElement("style");
      F.textContent = ".kl-edtb button{transition:transform .15s cubic-bezier(.34,1.56,.64,1),background .15s ease;will-change:transform;}.kl-edtb button:hover{transform:translateY(-1px) scale(1.02);background:#45475a;}.kl-edtb button[data-color]:hover{transform:scale(1.14);background:initial;}.kl-edtb button:active{transform:scale(.96);}.kl-edtb button:focus-visible{outline:2px solid #89b4fa;outline-offset:2px;}.kl-edtb .kl-zb{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:34px;padding:0 9px;background:#313244;color:#cdd6f4;border:none;border-radius:8px;cursor:pointer;font-size:15px;font-weight:600;line-height:1;}.kl-edtb .kl-zb:hover{background:#45475a;}@media (prefers-reduced-motion:reduce){.kl-edtb button{transition:none;}.kl-edtb button:hover,.kl-edtb button:active,.kl-edtb button[data-color]:hover{transform:none;}}", D.append(F, W, V), l.appendChild(D);
      let U = 1;
      const q = (G) => Math.max(0.05, Math.min(5, G || 1));
      function _(G) {
        U = q(G), A.style.width = Math.round(A.width * U) + "px", A.style.height = Math.round(A.height * U) + "px";
        const se = W.querySelector("#klavity-zoom-pct");
        se && (se.textContent = Math.round(U * 100) + "%");
      }
      const X = () => Math.max(1, V.clientWidth - 24) / A.width, ze = () => Math.min(Math.max(1, V.clientWidth - 24) / A.width, Math.max(1, V.clientHeight - 24) / A.height), Ie = A.height / A.width > Math.max(1, V.clientHeight) / Math.max(1, V.clientWidth);
      _(Ie ? X() : ze()), W.querySelector("#klavity-zoom-in").addEventListener("click", () => _(U * 1.25)), W.querySelector("#klavity-zoom-out").addEventListener("click", () => _(U / 1.25)), W.querySelector("#klavity-fit-width").addEventListener("click", () => _(X())), W.querySelector("#klavity-fit-page").addEventListener("click", () => _(ze()));
      let Re = "rect", ve = "#ef4444", ot = !1, kt = [], je = 0, we = 0;
      function Qe(G) {
        Re = G, W.querySelectorAll("[data-tool]").forEach((se) => {
          const ge = se.dataset.tool === G;
          se.style.background = ge ? "#585b70" : "#313244", se.style.outline = ge ? "2px solid #89b4fa" : "none";
        });
      }
      W.querySelectorAll("[data-tool]").forEach((G) => G.addEventListener("click", () => Qe(G.dataset.tool))), W.querySelectorAll("[data-color]").forEach((G) => G.addEventListener("click", () => {
        ve = G.dataset.color;
      })), W.querySelector("#klavity-undo").addEventListener("click", () => T.undo()), W.querySelector("#klavity-clear-ann").addEventListener("click", () => T.clearAll());
      const at = { p: "pen", r: "rect", c: "circle", a: "arrow", t: "text" };
      function lt(G) {
        const se = G.target;
        if (se && (se.tagName === "INPUT" || se.tagName === "TEXTAREA" || se.isContentEditable)) return;
        if (G.key === "Escape") {
          G.stopPropagation(), er();
          return;
        }
        if ((G.metaKey || G.ctrlKey) && G.key.toLowerCase() === "z") {
          G.preventDefault(), T.undo();
          return;
        }
        if (G.metaKey || G.ctrlKey || G.altKey) return;
        const ge = G.key.toLowerCase();
        at[ge] ? (G.preventDefault(), Qe(at[ge])) : ge === "u" && (G.preventDefault(), T.undo());
      }
      function er() {
        document.removeEventListener("keydown", lt, { capture: !0 }), D.remove();
      }
      document.addEventListener("keydown", lt, { capture: !0 }), Qe(Re), W.querySelector("#klavity-save-ann").addEventListener("click", async () => {
        T.shapes.length ? (u[C] = { w: A.width, h: A.height, shapes: T.shapes.map((G) => ({ ...G })) }, d[C] = O) : delete u[C], er(), z();
      }), W.querySelector("#klavity-cancel-ann").addEventListener("click", () => er());
      function xt(G) {
        const se = A.getBoundingClientRect();
        return { x: (G.clientX - se.left) / se.width * A.width, y: (G.clientY - se.top) / se.height * A.height };
      }
      A.addEventListener("pointerdown", (G) => {
        ot = !0;
        const se = xt(G);
        if ({ x: je, y: we } = se, Re === "pen" && (kt = [se]), Re === "text") {
          ot = !1;
          const ge = document.createElement("input");
          ge.style.cssText = `position:fixed;left:${G.clientX}px;top:${G.clientY}px;background:transparent;border:1px dashed ${ve};color:${ve};font-size:16px;outline:none;z-index:9999999;min-width:80px;`, document.body.appendChild(ge), ge.focus(), ge.addEventListener("blur", () => {
            ge.value.trim() && T.addShape({ type: "text", color: ve, x: je, y: we, text: ge.value.trim() }), ge.remove();
          }, { once: !0 }), ge.addEventListener("keydown", (Fe) => {
            Fe.key === "Enter" && ge.blur();
          });
        }
      }), A.addEventListener("pointermove", (G) => {
        ot && Re === "pen" && kt.push(xt(G));
      }), A.addEventListener("pointerup", (G) => {
        if (!ot) return;
        ot = !1;
        const se = xt(G);
        Re === "pen" && kt.length > 1 ? T.addShape({ type: "pen", color: ve, points: kt }) : Re === "rect" ? T.addShape({ type: "rect", color: ve, x: Math.min(je, se.x), y: Math.min(we, se.y), w: Math.abs(se.x - je), h: Math.abs(se.y - we) }) : Re === "circle" ? T.addShape({ type: "circle", color: ve, x: (je + se.x) / 2, y: (we + se.y) / 2, rx: Math.abs(se.x - je) / 2, ry: Math.abs(se.y - we) / 2 }) : Re === "arrow" && T.addShape({ type: "arrow", color: ve, x1: je, y1: we, x2: se.x, y2: se.y });
      });
    }, N.src = O;
  }
  function Zl(C, O, N) {
    const { copy: A, onLead: T } = N;
    b.innerHTML = "";
    const D = document.createElement("div");
    D.className = "klavity-success";
    const W = document.createElement("h2");
    if (W.innerHTML = A.headline, D.appendChild(W), A.body) {
      const F = document.createElement("p");
      F.textContent = A.body, D.appendChild(F);
    }
    if (C) {
      const F = document.createElement("div");
      F.className = "klavity-ref";
      const U = document.createElement("span");
      U.textContent = "Filed as";
      const q = document.createElement("code");
      q.textContent = Ms(C), F.append(U, q);
      const _ = Rs(O);
      if (_) {
        const X = document.createElement("a");
        X.href = _, X.target = "_blank", X.rel = "noopener", X.textContent = "View in dashboard", F.appendChild(X);
      }
      D.appendChild(F);
    }
    const V = () => {
      if (y) return;
      const F = document.createElement("div");
      F.className = "klavity-toast-progress", b.appendChild(F);
      let U = 5e3, q = Date.now();
      const _ = () => {
        q = Date.now(), y = setTimeout(() => {
          Z();
        }, U);
      }, X = () => {
        y && (clearTimeout(y), y = null, U = Math.max(0, U - (Date.now() - q)), F.style.animationPlayState = "paused");
      }, ze = () => {
        y || b.classList.contains("kl-closing") || (F.style.animationPlayState = "running", _());
      };
      b.addEventListener("mouseenter", X), b.addEventListener("mouseleave", ze), b.addEventListener("focusin", X), b.addEventListener("focusout", (Ie) => {
        b.contains(Ie.relatedTarget) || ze();
      }), _();
    };
    if (A.showEmail) {
      const F = document.createElement("div");
      F.className = "klavity-lead";
      const U = document.createElement("input");
      U.type = "email", U.placeholder = "you@company.com";
      const q = document.createElement("button"), _ = A.emailLabel;
      q.textContent = _;
      const X = document.createElement("div");
      X.className = "klavity-lead-err", X.setAttribute("role", "alert"), X.style.display = "none";
      const ze = async () => {
        const Ie = U.value.trim();
        if (!Ie || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(Ie)) {
          X.textContent = "Please enter a valid email so we can reach you.", X.style.display = "block", U.focus();
          return;
        }
        q.disabled = !0, q.textContent = "Saving…", X.style.display = "none";
        try {
          T && await T(C, Ie);
        } catch (ve) {
          try {
            console.warn("[Klavity] lead capture failed:", (ve == null ? void 0 : ve.message) || ve);
          } catch {
          }
          X.textContent = "Couldn't save your email — please try again.", X.style.display = "block", q.disabled = !1, q.textContent = "Retry", U.focus();
          return;
        }
        const Re = document.createElement("div");
        Re.className = "klavity-thanks", Re.textContent = "Thanks — we'll be in touch.", X.remove(), F.replaceWith(Re), A.showCta || V();
      };
      q.addEventListener("click", ze), U.addEventListener("keydown", (Ie) => {
        Ie.key === "Enter" && ze();
      }), F.append(U, q), D.appendChild(F), D.appendChild(X);
    }
    if (A.showCta && A.ctaUrl) {
      const F = document.createElement("a");
      F.className = "klavity-cta", F.href = A.ctaUrl, F.target = "_blank", F.rel = "noopener", F.textContent = A.ctaText, D.appendChild(F);
    }
    if (b.appendChild(D), !n.whiteLabel) {
      const F = document.createElement("div");
      F.className = "klavity-pb", F.innerHTML = 'Powered by <a href="https://klavity.in" target="_blank" rel="noopener">Klavity</a>', b.appendChild(F);
    }
    !A.showEmail && !A.showCta && V();
  }
  return t.autoCaptureOnOpen && setTimeout(() => {
    t.onCaptureFull().then((C) => {
      const { dataUrl: O, quality: N } = rr(C);
      be(O, N), Ze(Qt);
    }).catch(() => {
    });
  }, 200), j;
}
function nd(e, t) {
  const r = document.createElement("div");
  r.style.cssText = "position:fixed;inset:0;cursor:crosshair;z-index:2147483646;user-select:none;", r.setAttribute("data-klavity-region-overlay", ""), document.body.appendChild(r);
  const n = document.createElement("div");
  n.textContent = "Drag to select an area · Esc to cancel", n.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-family:system-ui;font-size:14px;background:rgba(0,0,0,.7);padding:8px 16px;border-radius:6px;pointer-events:none;z-index:2147483647;", document.body.appendChild(n);
  let i = 0, o = 0, l = !1;
  function d() {
    document.removeEventListener("keydown", a, { capture: !0 }), r.remove(), n.remove();
  }
  function a(p) {
    p.key === "Escape" && (p.stopPropagation(), d(), t());
  }
  document.addEventListener("keydown", a, { capture: !0 }), r.addEventListener("pointerdown", (p) => {
    l = !0, i = p.clientX, o = p.clientY, n.remove();
  }), r.addEventListener("pointermove", (p) => {
    if (!l) return;
    const s = Math.min(p.clientX, i), h = Math.min(p.clientY, o), u = Math.abs(p.clientX - i), c = Math.abs(p.clientY - o);
    r.style.background = `
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) 0 0/${s}px 100%,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${s + u}px 0/calc(100% - ${s + u}px) 100%,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${s}px 0/${u}px ${h}px,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${s}px ${h + c}px/${u}px calc(100% - ${h + c}px)
    `, r.style.backgroundRepeat = "no-repeat";
  }), r.addEventListener("pointerup", (p) => {
    if (!l) return;
    l = !1;
    const s = Math.abs(p.clientX - i), h = Math.abs(p.clientY - o);
    if (s < 8 || h < 8) {
      d(), t();
      return;
    }
    const u = { x: Math.min(p.clientX, i), y: Math.min(p.clientY, o), w: s, h };
    d(), e(u);
  });
}
async function id(e) {
  if (e.type === "image/heic" || e.type === "image/heif" || e.name.endsWith(".heic") || e.name.endsWith(".heif"))
    try {
      const t = (await import("./heic2any-D6xzzX7R.js").then((n) => n.h)).default, r = await t({ blob: e, toType: "image/jpeg", quality: 0.85 });
      return As(r);
    } catch {
    }
  return As(e);
}
function As(e) {
  return new Promise((t, r) => {
    const n = new FileReader();
    n.onload = () => t(n.result), n.onerror = r, n.readAsDataURL(e);
  });
}
const sd = {
  frustrated: { accent: "#e8849a", mark: "vein", label: "Frustrated" },
  confused: { accent: "#e8a24a", mark: "q", label: "Confused" },
  satisfied: { accent: "#7fd1c4", mark: "check", label: "Satisfied" },
  delighted: { accent: "#9fd6a0", mark: "spark", label: "Delighted" },
  neutral: { accent: "#8a8276", mark: "dots", label: "Neutral" },
  inspired: { accent: "#8b8bf5", mark: "bulb", label: "Inspired" },
  alarmed: { accent: "#ef6b6b", mark: "bang", label: "Alarmed" }
};
function od(e) {
  const t = (e || "").trim().split(/\s+/).filter(Boolean);
  return t.length === 0 ? "?" : t.length === 1 ? t[0].slice(0, 2).toUpperCase() : (t[0][0] + t[t.length - 1][0]).toUpperCase();
}
function ad(e) {
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
const ld = {
  vein: "ksim-m-vein",
  spark: "ksim-m-spark",
  bulb: "ksim-m-bulb",
  bang: "ksim-m-bang",
  q: "ksim-m-q",
  dots: "ksim-m-dots",
  check: "ksim-m-check"
};
function St(e) {
  return String(e).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function cd(e) {
  const {
    name: t,
    photoUrl: r,
    color: n = "#6f6cf2",
    emotion: i = "none",
    size: o = 58,
    eyes: l = !0,
    legs: d = !0,
    animate: a = !0,
    className: p = ""
  } = e, s = St(e.initials || od(t)), h = i !== "none" ? sd[i] : null, u = h ? `<span class="ksim-mark ${a ? ld[h.mark] : ""}" style="color:${St(h.accent)}">${ad(h.mark)}</span>` : "", m = r ? `<span class="ksim-head ksim-photo"><img src="${St(r)}" alt="${St(t)}" loading="lazy" onerror="this.style.display='none';this.parentNode.classList.add('ksim-fallback')"><span class="ksim-ini">${s}</span></span>` : `<span class="ksim-head ksim-mono"><span class="ksim-ini">${s}</span>${l ? '<span class="ksim-eyes"><i></i><i></i></span>' : ""}</span>`, f = d ? '<span class="ksim-legs"><i></i><i></i></span>' : "", g = ["ksim", a ? "is-animated" : "", p].filter(Boolean).join(" "), k = `--ksim-persona:${St(n)};--ksim-size:${o}px;` + (h ? `--ksim-accent:${St(h.accent)};` : "");
  return `<span class="${g}" style="${k}" data-emotion="${i}" title="${St(t)}">${u}${m}${f}</span>`;
}
function ud(e) {
  const t = document.createElement("template");
  return t.innerHTML = cd(e).trim(), t.content.firstElementChild;
}
const dd = `
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
function pd(e = document) {
  var n;
  const t = e.head ?? e ?? null;
  if (!t || (n = t.querySelector) != null && n.call(t, "style[data-ksim]")) return;
  const r = document.createElement("style");
  r.setAttribute("data-ksim", ""), r.textContent = dd, t.appendChild(r);
}
function hd(e) {
  const { context: t, description: r } = e, n = t.consoleErrors.map((a) => `- [${a.level ?? "error"}] \`${a.message}\``).join(`
`) || "_none_", i = t.networkFailures.map((a) => `- ${a.method} ${a.url} → ${a.status}${a.durationMs != null ? ` (${a.durationMs}ms)` : ""}`).join(`
`) || "_none_", o = [
    `*Page:* ${t.pageUrl}`,
    `*Browser:* ${t.userAgent}`,
    `*Screen:* ${t.screenSize}  |  *Viewport:* ${t.viewportSize}`
  ], l = t.identity ? Object.entries(t.identity).filter(([, a]) => a != null) : [], d = t.metadata ? Object.entries(t.metadata) : [];
  return (l.length || d.length) && o.push(`*User / metadata:* ${[...l, ...d].map(([a, p]) => `${a}=${p}`).join(", ")}`), [
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
async function fd(e) {
  const { settings: t, type: r, description: n } = e, { baseUrl: i, email: o, token: l, projectKey: d } = t.jira, a = btoa(`${o}:${l}`), p = r === "bug" ? "Bug" : "Story", s = r === "bug" ? ["klavity", "klavity-bug"] : ["klavity", "klavity-feature"], h = `[Klavity] ${n.slice(0, 180)}`, u = await fetch(`${i}/rest/api/3/issue`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${a}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      fields: {
        project: { key: d },
        summary: h,
        description: { version: 1, type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: hd(e) }] }] },
        issuetype: { name: p },
        labels: s
      }
    })
  });
  if (!u.ok) {
    const g = await u.text();
    throw new Error(`Jira API error ${u.status}: ${g}`);
  }
  const m = (await u.json()).key, f = `${i}/browse/${m}`;
  for (const g of e.screenshots) {
    const k = await (await fetch(g)).blob(), v = new FormData();
    v.append("file", k, `klavity-screenshot-${Date.now()}.png`), await fetch(`${i}/rest/api/3/issue/${m}/attachments`, {
      method: "POST",
      headers: { Authorization: `Basic ${a}`, "X-Atlassian-Token": "no-check" },
      body: v
    });
  }
  return { issueKey: m, issueUrl: f };
}
async function md(e) {
  var h, u, c;
  const { settings: t, type: r, description: n, context: i } = e, { apiKey: o, teamId: l } = t.linear, d = [
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
          description: d,
          labelNames: r === "bug" ? ["Bug"] : []
        }
      }
    })
  })).json();
  if ((h = p.errors) != null && h.length)
    throw new Error(`Linear API error: ${p.errors[0].message}`);
  const s = (c = (u = p.data) == null ? void 0 : u.issueCreate) == null ? void 0 : c.issue;
  if (!s) throw new Error("Linear: no issue returned");
  return { issueKey: s.identifier, issueUrl: s.url };
}
async function gd(e) {
  const { settings: t, type: r, description: n, context: i, screenshots: o } = e, { token: l, repo: d } = t.github, a = r === "bug" ? ["klavity", "klavity-bug"] : ["klavity", "klavity-feature"], p = o.length ? `

<details><summary>Screenshots (${o.length})</summary>

${o.map((c, m) => `![screenshot-${m + 1}](${c})`).join(`
`)}

</details>` : "", s = [
    n,
    "",
    `**Page:** ${i.pageUrl}`,
    `**Browser:** ${i.userAgent}`,
    `**Screen:** ${i.screenSize} | **Viewport:** ${i.viewportSize}`,
    p
  ].join(`
`), h = await fetch(`https://api.github.com/repos/${d}/issues`, {
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
  const u = await h.json();
  return { issueKey: `#${u.number}`, issueUrl: u.html_url };
}
async function yd(e) {
  const { settings: t, description: r, context: n } = e, { token: i, workspace: o, projectId: l } = t.plane, d = (t.plane.host || "https://api.plane.so").replace(/\/+$/, ""), a = d === "https://api.plane.so" ? "https://app.plane.so" : d, p = await fetch(
    `${d}/api/v1/workspaces/${o}/projects/${l}/issues/`,
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
function bd(e) {
  const t = new FormData();
  return t.set("type", e.type ?? "bug"), t.set("description", e.description), t.set("page_url", e.pageUrl), e.context && t.set("context", JSON.stringify(e.context)), e.projectId && t.set("project_id", e.projectId), e.replayEvents && e.replayEvents.length && t.set("replay_events", JSON.stringify(e.replayEvents)), t;
}
async function vd(e) {
  const { settings: t, type: r, description: n, context: i, screenshots: o, projectId: l, replayEvents: d } = e, a = bd({ type: r, description: n, pageUrl: i.pageUrl, context: i, projectId: l, replayEvents: d }), p = t.connectionMode === "klavity" && !!t.klavToken;
  if (!p) {
    const { plane: c } = t;
    a.append("plane_token", c.token), a.append("plane_workspace", c.workspace), a.append("plane_project_id", c.projectId), a.append("plane_host", c.host);
  }
  for (let c = 0; c < o.length; c++) {
    const m = await (await fetch(o[c])).blob();
    a.append("screenshots", m, `screenshot-${c}.png`);
  }
  const s = p ? { Authorization: `Bearer ${t.klavToken}` } : {}, h = await fetch(`${t.backendUrl}/api/feedback`, { method: "POST", headers: s, body: a });
  if (!h.ok) throw new Error(`Klavity backend error ${h.status}: ${await h.text()}`);
  const u = await h.json();
  return {
    issueKey: u.jira_key ?? u.id,
    issueUrl: u.issue_url ?? t.backendUrl
  };
}
var wd = Object.defineProperty, kd = (e, t, r) => t in e ? wd(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, P = (e, t, r) => kd(e, typeof t != "symbol" ? t + "" : t, r), Is, xd = Object.defineProperty, Sd = (e, t, r) => t in e ? xd(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, Os = (e, t, r) => Sd(e, typeof t != "symbol" ? t + "" : t, r), xe = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(xe || {});
const Ls = {
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
}, Ts = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, Cr = {}, La = {}, Cd = () => !!globalThis.Zone;
function _i(e) {
  if (Cr[e])
    return Cr[e];
  const t = globalThis[e], r = t.prototype, n = e in Ls ? Ls[e] : void 0, i = !!(n && // @ts-expect-error 2345
  n.every(
    (d) => {
      var a, p;
      return !!((p = (a = Object.getOwnPropertyDescriptor(r, d)) == null ? void 0 : a.get) != null && p.toString().includes("[native code]"));
    }
  )), o = e in Ts ? Ts[e] : void 0, l = !!(o && o.every(
    // @ts-expect-error 2345
    (d) => {
      var a;
      return typeof r[d] == "function" && ((a = r[d]) == null ? void 0 : a.toString().includes("[native code]"));
    }
  ));
  if (i && l && !Cd())
    return Cr[e] = t.prototype, t.prototype;
  try {
    const d = document.createElement("iframe");
    d.style.display = "none", document.body.appendChild(d);
    const a = d.contentWindow;
    if (!a) return t.prototype;
    const p = a[e].prototype;
    if (!p)
      return d.remove(), r;
    const s = navigator.userAgent;
    return s.includes("Safari") && !s.includes("Chrome") ? (d.classList.add("rr-block"), d.setAttribute("__rrwebUntaintedMutationObserver", ""), La[e] = () => d.remove()) : d.remove(), Cr[e] = p;
  } catch {
    return r;
  }
}
const mn = {};
function ut(e, t, r) {
  var n;
  const i = `${e}.${String(r)}`;
  if (mn[i])
    return mn[i].call(
      t
    );
  const o = _i(e), l = (n = Object.getOwnPropertyDescriptor(
    o,
    r
  )) == null ? void 0 : n.get;
  return l ? (mn[i] = l, l.call(t)) : t[r];
}
const gn = {};
function Ta(e, t, r) {
  const n = `${e}.${String(r)}`;
  if (gn[n])
    return gn[n].bind(
      t
    );
  const o = _i(e)[r];
  return typeof o != "function" ? t[r] : (gn[n] = o, o.bind(t));
}
function Ed(e) {
  return ut("Node", e, "ownerDocument");
}
function Md(e) {
  return ut("Node", e, "childNodes");
}
function Rd(e) {
  return ut("Node", e, "parentNode");
}
function Ad(e) {
  return ut("Node", e, "parentElement");
}
function Id(e) {
  return ut("Node", e, "textContent");
}
function Od(e, t) {
  return Ta("Node", e, "contains")(t);
}
function Ld(e) {
  return Ta("Node", e, "getRootNode")();
}
function Td(e) {
  return !e || !("host" in e) ? null : ut("ShadowRoot", e, "host");
}
function Nd(e) {
  return e.styleSheets;
}
function Pd(e) {
  return !e || !("shadowRoot" in e) ? null : ut("Element", e, "shadowRoot");
}
function _d(e, t) {
  return ut("Element", e, "querySelector")(t);
}
function $d(e, t) {
  return ut("Element", e, "querySelectorAll")(t);
}
function Dd() {
  return [
    _i("MutationObserver").constructor,
    La.MutationObserver ?? (() => {
    })
  ];
}
let Na = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (Na = () => (/* @__PURE__ */ new Date()).getTime());
function zd(e, t, r) {
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
const Ae = {
  ownerDocument: Ed,
  childNodes: Md,
  parentNode: Rd,
  parentElement: Ad,
  textContent: Id,
  contains: Od,
  getRootNode: Ld,
  host: Td,
  styleSheets: Nd,
  shadowRoot: Pd,
  querySelector: _d,
  querySelectorAll: $d,
  nowTimestamp: Na,
  mutationObserverCtor: Dd,
  patch: zd
};
function Pa(e) {
  return e.nodeType === e.ELEMENT_NODE;
}
function ir(e) {
  const t = (
    // anchor and textarea elements also have a `host` property
    // but only shadow roots have a `mode` property
    e && "host" in e && "mode" in e && Ae.host(e) || null
  );
  return !!(t && "shadowRoot" in t && Ae.shadowRoot(t) === e);
}
function sr(e) {
  return Object.prototype.toString.call(e) === "[object ShadowRoot]";
}
function Fd(e) {
  return e.includes(" background-clip: text;") && !e.includes(" -webkit-background-clip: text;") && (e = e.replace(
    /\sbackground-clip:\s*text;/g,
    " -webkit-background-clip: text; background-clip: text;"
  )), e;
}
function Ud(e) {
  const { cssText: t } = e;
  if (t.split('"').length < 3) return t;
  const r = ["@import", `url(${JSON.stringify(e.href)})`];
  return e.layerName === "" ? r.push("layer") : e.layerName && r.push(`layer(${e.layerName})`), e.supportsText && r.push(`supports(${e.supportsText})`), e.media.length && r.push(e.media.mediaText), r.join(" ") + ";";
}
function Ci(e) {
  try {
    const t = e.rules || e.cssRules;
    if (!t)
      return null;
    let r = e.href;
    !r && e.ownerNode && (r = e.ownerNode.baseURI);
    const n = Array.from(
      t,
      (i) => _a(i, r)
    ).join("");
    return Fd(n);
  } catch {
    return null;
  }
}
function _a(e, t) {
  if (qd(e)) {
    let r;
    try {
      r = // for same-origin stylesheets,
      // we can access the imported stylesheet rules directly
      Ci(e.styleSheet) || // work around browser issues with the raw string `@import url(...)` statement
      Ud(e);
    } catch {
      r = e.cssText;
    }
    return e.styleSheet.href ? Br(r, e.styleSheet.href) : r;
  } else {
    let r = e.cssText;
    return Wd(e) && e.selectorText.includes(":") && (r = Bd(r)), t ? Br(r, t) : r;
  }
}
function Bd(e) {
  const t = /(\[(?:[\w-]+)[^\\])(:(?:[\w-]+)\])/gm;
  return e.replace(t, "$1\\$2");
}
function qd(e) {
  return "styleSheet" in e;
}
function Wd(e) {
  return "selectorText" in e;
}
class $a {
  constructor() {
    Os(this, "idNodeMap", /* @__PURE__ */ new Map()), Os(this, "nodeMetaMap", /* @__PURE__ */ new WeakMap());
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
function jd() {
  return new $a();
}
function Fr({
  element: e,
  maskInputOptions: t,
  tagName: r,
  type: n,
  value: i,
  maskInputFn: o
}) {
  let l = i || "";
  const d = n && It(n);
  return (t[r.toLowerCase()] || d && t[d]) && (o ? l = o(l, e) : l = "*".repeat(l.length)), l;
}
function It(e) {
  return e.toLowerCase();
}
const Ns = "__rrweb_original__";
function Hd(e) {
  const t = e.getContext("2d");
  if (!t) return !0;
  const r = 50;
  for (let n = 0; n < e.width; n += r)
    for (let i = 0; i < e.height; i += r) {
      const o = t.getImageData, l = Ns in o ? o[Ns] : o;
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
function Ur(e) {
  const t = e.type;
  return e.hasAttribute("data-rr-is-password") ? "password" : t ? (
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    It(t)
  ) : null;
}
function Da(e, t) {
  let r;
  try {
    r = new URL(e, t ?? window.location.href);
  } catch {
    return null;
  }
  const n = /\.([0-9a-z]+)(?:$)/i, i = r.pathname.match(n);
  return (i == null ? void 0 : i[1]) ?? null;
}
function Vd(e) {
  let t = "";
  return e.indexOf("//") > -1 ? t = e.split("/").slice(0, 3).join("/") : t = e.split("/")[0], t = t.split("?")[0], t;
}
const Yd = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm, Gd = /^(?:[a-z+]+:)?\/\//i, Xd = /^www\..*/i, Kd = /^(data:)([^,]*),(.*)/i;
function Br(e, t) {
  return (e || "").replace(
    Yd,
    (r, n, i, o, l, d) => {
      const a = i || l || d, p = n || o || "";
      if (!a)
        return r;
      if (Gd.test(a) || Xd.test(a))
        return `url(${p}${a}${p})`;
      if (Kd.test(a))
        return `url(${p}${a}${p})`;
      if (a[0] === "/")
        return `url(${p}${Vd(t) + a}${p})`;
      const s = t.split("/"), h = a.split("/");
      s.pop();
      for (const u of h)
        u !== "." && (u === ".." ? s.pop() : s.push(u));
      return `url(${p}${s.join("/")}${p})`;
    }
  );
}
function Er(e, t = !1) {
  return t ? e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "") : e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "").replace(/0px/g, "0");
}
function Jd(e, t, r = !1) {
  const n = Array.from(t.childNodes), i = [];
  let o = 0;
  if (n.length > 1 && e && typeof e == "string") {
    let l = Er(e, r);
    const d = l.length / e.length;
    for (let a = 1; a < n.length; a++)
      if (n[a].textContent && typeof n[a].textContent == "string") {
        const p = Er(
          n[a].textContent,
          r
        ), s = 100;
        let h = 3;
        for (; h < p.length && // keep consuming css identifiers (to get a decent chunk more quickly)
        (p[h].match(/[a-zA-Z0-9]/) || // substring needs to be unique to this section
        p.indexOf(p.substring(0, h), 1) !== -1); h++)
          ;
        for (; h < p.length; h++) {
          let u = p.substring(0, h), c = l.split(u), m = -1;
          if (c.length === 2)
            m = c[0].length;
          else if (c.length > 2 && c[0] === "" && n[a - 1].textContent !== "")
            m = l.indexOf(u, 1);
          else if (c.length === 1) {
            if (u = u.substring(
              0,
              u.length - 1
            ), c = l.split(u), c.length <= 1)
              return i.push(e), i;
            h = s + 1;
          } else h === p.length - 1 && (m = l.indexOf(u));
          if (c.length >= 2 && h > s) {
            const f = n[a - 1].textContent;
            if (f && typeof f == "string") {
              const g = Er(f).length;
              m = l.indexOf(u, g);
            }
            m === -1 && (m = c[0].length);
          }
          if (m !== -1) {
            let f = Math.floor(m / d);
            for (; f > 0 && f < e.length; ) {
              if (o += 1, o > 50 * n.length)
                return i.push(e), i;
              const g = Er(
                e.substring(0, f),
                r
              );
              if (g.length === m) {
                i.push(e.substring(0, f)), e = e.substring(f), l = l.substring(m);
                break;
              } else g.length < m ? f += Math.max(
                1,
                Math.floor((m - g.length) / d)
              ) : f -= Math.max(
                1,
                Math.floor((g.length - m) * d)
              );
            }
            break;
          }
        }
      }
  }
  return i.push(e), i;
}
function Zd(e, t) {
  return Jd(e, t).join("/* rr_split */");
}
let Qd = 1;
const ep = new RegExp("[^a-z0-9-_:]"), ur = -2;
function za() {
  return Qd++;
}
function tp(e) {
  if (e instanceof HTMLFormElement)
    return "form";
  const t = It(e.tagName);
  return ep.test(t) ? "div" : t;
}
let $t, Ps;
const rp = /^[^ \t\n\r\u000c]+/, np = /^[, \t\n\r\u000c]+/;
function ip(e, t) {
  if (t.trim() === "")
    return t;
  let r = 0;
  function n(o) {
    let l;
    const d = o.exec(t.substring(r));
    return d ? (l = d[0], r += l.length, l) : "";
  }
  const i = [];
  for (; n(np), !(r >= t.length); ) {
    let o = n(rp);
    if (o.slice(-1) === ",")
      o = Ut(e, o.substring(0, o.length - 1)), i.push(o);
    else {
      let l = "";
      o = Ut(e, o);
      let d = !1;
      for (; ; ) {
        const a = t.charAt(r);
        if (a === "") {
          i.push((o + l).trim());
          break;
        } else if (d)
          a === ")" && (d = !1);
        else if (a === ",") {
          r += 1, i.push((o + l).trim());
          break;
        } else a === "(" && (d = !0);
        l += a, r += 1;
      }
    }
  }
  return i.join(", ");
}
const _s = /* @__PURE__ */ new WeakMap();
function Ut(e, t) {
  return !t || t.trim() === "" ? t : $i(e, t);
}
function sp(e) {
  return !!(e.tagName === "svg" || e.ownerSVGElement);
}
function $i(e, t) {
  let r = _s.get(e);
  if (r || (r = e.createElement("a"), _s.set(e, r)), !t)
    t = "";
  else if (t.startsWith("blob:") || t.startsWith("data:"))
    return t;
  return r.setAttribute("href", t), r.href;
}
function Fa(e, t, r, n) {
  return n && (r === "src" || r === "href" && !(t === "use" && n[0] === "#") || r === "xlink:href" && n[0] !== "#" || r === "background" && ["table", "td", "th"].includes(t) ? Ut(e, n) : r === "srcset" ? ip(e, n) : r === "style" ? Br(n, $i(e)) : t === "object" && r === "data" ? Ut(e, n) : n);
}
function Ua(e, t, r) {
  return ["video", "audio"].includes(e) && t === "autoplay";
}
function op(e, t, r) {
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
function qr(e, t, r) {
  if (!e) return !1;
  if (e.nodeType !== e.ELEMENT_NODE)
    return r ? qr(Ae.parentNode(e), t, r) : !1;
  for (let n = e.classList.length; n--; ) {
    const i = e.classList[n];
    if (t.test(i))
      return !0;
  }
  return r ? qr(Ae.parentNode(e), t, r) : !1;
}
function Ba(e, t, r, n) {
  let i;
  if (Pa(e)) {
    if (i = e, !Ae.childNodes(i).length)
      return !1;
  } else {
    if (Ae.parentElement(e) === null)
      return !1;
    i = Ae.parentElement(e);
  }
  try {
    if (typeof t == "string") {
      if (n) {
        if (i.closest(`.${t}`)) return !0;
      } else if (i.classList.contains(t)) return !0;
    } else if (qr(i, t, n)) return !0;
    if (r) {
      if (n) {
        if (i.closest(r)) return !0;
      } else if (i.matches(r)) return !0;
    }
  } catch {
  }
  return !1;
}
function ap(e, t, r) {
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
    const d = setTimeout(() => {
      i || (t(), i = !0);
    }, r);
    e.addEventListener("load", () => {
      clearTimeout(d), i = !0, t();
    });
    return;
  }
  const l = "about:blank";
  if (n.location.href !== l || e.src === l || e.src === "")
    return setTimeout(t, 0), e.addEventListener("load", t);
  e.addEventListener("load", t);
}
function lp(e, t, r) {
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
function cp(e, t) {
  const {
    doc: r,
    mirror: n,
    blockClass: i,
    blockSelector: o,
    needsMask: l,
    inlineStylesheet: d,
    maskInputOptions: a = {},
    maskTextFn: p,
    maskInputFn: s,
    dataURLOptions: h = {},
    inlineImages: u,
    recordCanvas: c,
    keepIframeSrcFn: m,
    newlyAddedElement: f = !1,
    cssCaptured: g = !1
  } = t, k = up(r, n);
  switch (e.nodeType) {
    case e.DOCUMENT_NODE:
      return e.compatMode !== "CSS1Compat" ? {
        type: xe.Document,
        childNodes: [],
        compatMode: e.compatMode
        // probably "BackCompat"
      } : {
        type: xe.Document,
        childNodes: []
      };
    case e.DOCUMENT_TYPE_NODE:
      return {
        type: xe.DocumentType,
        name: e.name,
        publicId: e.publicId,
        systemId: e.systemId,
        rootId: k
      };
    case e.ELEMENT_NODE:
      return pp(e, {
        doc: r,
        blockClass: i,
        blockSelector: o,
        inlineStylesheet: d,
        maskInputOptions: a,
        maskInputFn: s,
        dataURLOptions: h,
        inlineImages: u,
        recordCanvas: c,
        keepIframeSrcFn: m,
        newlyAddedElement: f,
        rootId: k
      });
    case e.TEXT_NODE:
      return dp(e, {
        doc: r,
        needsMask: l,
        maskTextFn: p,
        rootId: k,
        cssCaptured: g
      });
    case e.CDATA_SECTION_NODE:
      return {
        type: xe.CDATA,
        textContent: "",
        rootId: k
      };
    case e.COMMENT_NODE:
      return {
        type: xe.Comment,
        textContent: Ae.textContent(e) || "",
        rootId: k
      };
    default:
      return !1;
  }
}
function up(e, t) {
  if (!t.hasNode(e)) return;
  const r = t.getId(e);
  return r === 1 ? void 0 : r;
}
function dp(e, t) {
  const { needsMask: r, maskTextFn: n, rootId: i, cssCaptured: o } = t, l = Ae.parentNode(e), d = l && l.tagName;
  let a = "";
  const p = d === "STYLE" ? !0 : void 0, s = d === "SCRIPT" ? !0 : void 0;
  return s ? a = "SCRIPT_PLACEHOLDER" : o || (a = Ae.textContent(e), p && a && (a = Br(a, $i(t.doc)))), !p && !s && a && r && (a = n ? n(a, Ae.parentElement(e)) : a.replace(/[\S]/g, "*")), {
    type: xe.Text,
    textContent: a || "",
    rootId: i
  };
}
function pp(e, t) {
  const {
    doc: r,
    blockClass: n,
    blockSelector: i,
    inlineStylesheet: o,
    maskInputOptions: l = {},
    maskInputFn: d,
    dataURLOptions: a = {},
    inlineImages: p,
    recordCanvas: s,
    keepIframeSrcFn: h,
    newlyAddedElement: u = !1,
    rootId: c
  } = t, m = op(e, n, i), f = tp(e);
  let g = {};
  const k = e.attributes.length;
  for (let y = 0; y < k; y++) {
    const x = e.attributes[y];
    Ua(f, x.name, x.value) || (g[x.name] = Fa(
      r,
      f,
      It(x.name),
      x.value
    ));
  }
  if (f === "link" && o) {
    const y = Array.from(r.styleSheets).find((w) => w.href === e.href);
    let x = null;
    y && (x = Ci(y)), x && (delete g.rel, delete g.href, g._cssText = x);
  }
  if (f === "style" && e.sheet) {
    let y = Ci(
      e.sheet
    );
    y && (e.childNodes.length > 1 && (y = Zd(y, e)), g._cssText = y);
  }
  if (["input", "textarea", "select"].includes(f)) {
    const y = e.value, x = e.checked;
    g.type !== "radio" && g.type !== "checkbox" && g.type !== "submit" && g.type !== "button" && y ? g.value = Fr({
      element: e,
      type: Ur(e),
      tagName: f,
      value: y,
      maskInputOptions: l,
      maskInputFn: d
    }) : x && (g.checked = x);
  }
  if (f === "option" && (e.selected && !l.select ? g.selected = !0 : delete g.selected), f === "dialog" && e.open && (g.rr_open_mode = e.matches("dialog:modal") ? "modal" : "non-modal"), f === "canvas" && s) {
    if (e.__context === "2d")
      Hd(e) || (g.rr_dataURL = e.toDataURL(
        a.type,
        a.quality
      ));
    else if (!("__context" in e)) {
      const y = e.toDataURL(
        a.type,
        a.quality
      ), x = r.createElement("canvas");
      x.width = e.width, x.height = e.height;
      const w = x.toDataURL(
        a.type,
        a.quality
      );
      y !== w && (g.rr_dataURL = y);
    }
  }
  if (f === "img" && p) {
    $t || ($t = r.createElement("canvas"), Ps = $t.getContext("2d"));
    const y = e, x = y.currentSrc || y.getAttribute("src") || "<unknown-src>", w = y.crossOrigin, b = () => {
      y.removeEventListener("load", b);
      try {
        $t.width = y.naturalWidth, $t.height = y.naturalHeight, Ps.drawImage(y, 0, 0), g.rr_dataURL = $t.toDataURL(
          a.type,
          a.quality
        );
      } catch (S) {
        if (y.crossOrigin !== "anonymous") {
          y.crossOrigin = "anonymous", y.complete && y.naturalWidth !== 0 ? b() : y.addEventListener("load", b);
          return;
        } else
          console.warn(
            `Cannot inline img src=${x}! Error: ${S}`
          );
      }
      y.crossOrigin === "anonymous" && (w ? g.crossOrigin = w : y.removeAttribute("crossorigin"));
    };
    y.complete && y.naturalWidth !== 0 ? b() : y.addEventListener("load", b);
  }
  if (["audio", "video"].includes(f)) {
    const y = g;
    y.rr_mediaState = e.paused ? "paused" : "played", y.rr_mediaCurrentTime = e.currentTime, y.rr_mediaPlaybackRate = e.playbackRate, y.rr_mediaMuted = e.muted, y.rr_mediaLoop = e.loop, y.rr_mediaVolume = e.volume;
  }
  if (u || (e.scrollLeft && (g.rr_scrollLeft = e.scrollLeft), e.scrollTop && (g.rr_scrollTop = e.scrollTop)), m) {
    const { width: y, height: x } = e.getBoundingClientRect();
    g = {
      class: g.class,
      rr_width: `${y}px`,
      rr_height: `${x}px`
    };
  }
  f === "iframe" && !h(g.src) && (e.contentDocument || (g.rr_src = g.src), delete g.src);
  let v;
  try {
    customElements.get(f) && (v = !0);
  } catch {
  }
  return {
    type: xe.Element,
    tagName: f,
    attributes: g,
    childNodes: [],
    isSVG: sp(e) || void 0,
    needBlock: m,
    rootId: c,
    isCustom: v
  };
}
function le(e) {
  return e == null ? "" : e.toLowerCase();
}
function qa(e) {
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
function hp(e, t) {
  if (t.comment && e.type === xe.Comment)
    return !0;
  if (e.type === xe.Element) {
    if (t.script && // script tag
    (e.tagName === "script" || // (module)preload link
    e.tagName === "link" && (e.attributes.rel === "preload" && e.attributes.as === "script" || e.attributes.rel === "modulepreload") || // prefetch link
    e.tagName === "link" && e.attributes.rel === "prefetch" && typeof e.attributes.href == "string" && Da(e.attributes.href) === "js"))
      return !0;
    if (t.headFavicon && (e.tagName === "link" && e.attributes.rel === "shortcut icon" || e.tagName === "meta" && (le(e.attributes.name).match(
      /^msapplication-tile(image|color)$/
    ) || le(e.attributes.name) === "application-name" || le(e.attributes.rel) === "icon" || le(e.attributes.rel) === "apple-touch-icon" || le(e.attributes.rel) === "shortcut icon")))
      return !0;
    if (e.tagName === "meta") {
      if (t.headMetaDescKeywords && le(e.attributes.name).match(/^description|keywords$/))
        return !0;
      if (t.headMetaSocial && (le(e.attributes.property).match(/^(og|twitter|fb):/) || // og = opengraph (facebook)
      le(e.attributes.name).match(/^(og|twitter):/) || le(e.attributes.name) === "pinterest"))
        return !0;
      if (t.headMetaRobots && (le(e.attributes.name) === "robots" || le(e.attributes.name) === "googlebot" || le(e.attributes.name) === "bingbot"))
        return !0;
      if (t.headMetaHttpEquiv && e.attributes["http-equiv"] !== void 0)
        return !0;
      if (t.headMetaAuthorship && (le(e.attributes.name) === "author" || le(e.attributes.name) === "generator" || le(e.attributes.name) === "framework" || le(e.attributes.name) === "publisher" || le(e.attributes.name) === "progid" || le(e.attributes.property).match(/^article:/) || le(e.attributes.property).match(/^product:/)))
        return !0;
      if (t.headMetaVerification && (le(e.attributes.name) === "google-site-verification" || le(e.attributes.name) === "yandex-verification" || le(e.attributes.name) === "csrf-token" || le(e.attributes.name) === "p:domain_verify" || le(e.attributes.name) === "verify-v1" || le(e.attributes.name) === "verification" || le(e.attributes.name) === "shopify-checkout-api-token"))
        return !0;
    }
  }
  return !1;
}
function Bt(e, t) {
  const {
    doc: r,
    mirror: n,
    blockClass: i,
    blockSelector: o,
    maskTextClass: l,
    maskTextSelector: d,
    skipChild: a = !1,
    inlineStylesheet: p = !0,
    maskInputOptions: s = {},
    maskTextFn: h,
    maskInputFn: u,
    slimDOMOptions: c,
    dataURLOptions: m = {},
    inlineImages: f = !1,
    recordCanvas: g = !1,
    onSerialize: k,
    onIframeLoad: v,
    iframeLoadTimeout: y = 5e3,
    onStylesheetLoad: x,
    stylesheetLoadTimeout: w = 5e3,
    keepIframeSrcFn: b = () => !1,
    newlyAddedElement: S = !1,
    cssCaptured: M = !1
  } = t;
  let { needsMask: I } = t, { preserveWhiteSpace: R = !0 } = t;
  I || (I = Ba(
    e,
    l,
    d,
    I === void 0
  ));
  const j = cp(e, {
    doc: r,
    mirror: n,
    blockClass: i,
    blockSelector: o,
    needsMask: I,
    inlineStylesheet: p,
    maskInputOptions: s,
    maskTextFn: h,
    maskInputFn: u,
    dataURLOptions: m,
    inlineImages: f,
    recordCanvas: g,
    keepIframeSrcFn: b,
    newlyAddedElement: S,
    cssCaptured: M
  });
  if (!j)
    return console.warn(e, "not serialized"), null;
  let z;
  n.hasNode(e) ? z = n.getId(e) : hp(j, c) || !R && j.type === xe.Text && !j.textContent.replace(/^\s+|\s+$/gm, "").length ? z = ur : z = za();
  const E = Object.assign(j, { id: z });
  if (n.add(e, E), z === ur)
    return null;
  k && k(e);
  let Ne = !a;
  if (E.type === xe.Element) {
    Ne = Ne && !E.needBlock, delete E.needBlock;
    const ne = Ae.shadowRoot(e);
    ne && sr(ne) && (E.isShadowHost = !0);
  }
  if ((E.type === xe.Document || E.type === xe.Element) && Ne) {
    c.headWhitespace && E.type === xe.Element && E.tagName === "head" && (R = !1);
    const ne = {
      doc: r,
      mirror: n,
      blockClass: i,
      blockSelector: o,
      needsMask: I,
      maskTextClass: l,
      maskTextSelector: d,
      skipChild: a,
      inlineStylesheet: p,
      maskInputOptions: s,
      maskTextFn: h,
      maskInputFn: u,
      slimDOMOptions: c,
      dataURLOptions: m,
      inlineImages: f,
      recordCanvas: g,
      preserveWhiteSpace: R,
      onSerialize: k,
      onIframeLoad: v,
      iframeLoadTimeout: y,
      onStylesheetLoad: x,
      stylesheetLoadTimeout: w,
      keepIframeSrcFn: b,
      cssCaptured: !1
    };
    if (!(E.type === xe.Element && E.tagName === "textarea" && E.attributes.value !== void 0)) {
      E.type === xe.Element && E.attributes._cssText !== void 0 && typeof E.attributes._cssText == "string" && (ne.cssCaptured = !0);
      for (const he of Array.from(Ae.childNodes(e))) {
        const ke = Bt(he, ne);
        ke && E.childNodes.push(ke);
      }
    }
    let ie = null;
    if (Pa(e) && (ie = Ae.shadowRoot(e)))
      for (const he of Array.from(Ae.childNodes(ie))) {
        const ke = Bt(he, ne);
        ke && (sr(ie) && (ke.isShadow = !0), E.childNodes.push(ke));
      }
  }
  const be = Ae.parentNode(e);
  return be && ir(be) && sr(be) && (E.isShadow = !0), E.type === xe.Element && E.tagName === "iframe" && ap(
    e,
    () => {
      const ne = e.contentDocument;
      if (ne && v) {
        const ie = Bt(ne, {
          doc: ne,
          mirror: n,
          blockClass: i,
          blockSelector: o,
          needsMask: I,
          maskTextClass: l,
          maskTextSelector: d,
          skipChild: !1,
          inlineStylesheet: p,
          maskInputOptions: s,
          maskTextFn: h,
          maskInputFn: u,
          slimDOMOptions: c,
          dataURLOptions: m,
          inlineImages: f,
          recordCanvas: g,
          preserveWhiteSpace: R,
          onSerialize: k,
          onIframeLoad: v,
          iframeLoadTimeout: y,
          onStylesheetLoad: x,
          stylesheetLoadTimeout: w,
          keepIframeSrcFn: b
        });
        ie && v(
          e,
          ie
        );
      }
    },
    y
  ), E.type === xe.Element && E.tagName === "link" && typeof E.attributes.rel == "string" && (E.attributes.rel === "stylesheet" || E.attributes.rel === "preload" && typeof E.attributes.href == "string" && Da(E.attributes.href) === "css") && lp(
    e,
    () => {
      if (x) {
        const ne = Bt(e, {
          doc: r,
          mirror: n,
          blockClass: i,
          blockSelector: o,
          needsMask: I,
          maskTextClass: l,
          maskTextSelector: d,
          skipChild: !1,
          inlineStylesheet: p,
          maskInputOptions: s,
          maskTextFn: h,
          maskInputFn: u,
          slimDOMOptions: c,
          dataURLOptions: m,
          inlineImages: f,
          recordCanvas: g,
          preserveWhiteSpace: R,
          onSerialize: k,
          onIframeLoad: v,
          iframeLoadTimeout: y,
          onStylesheetLoad: x,
          stylesheetLoadTimeout: w,
          keepIframeSrcFn: b
        });
        ne && x(
          e,
          ne
        );
      }
    },
    w
  ), E;
}
function fp(e, t) {
  const {
    mirror: r = new $a(),
    blockClass: n = "rr-block",
    blockSelector: i = null,
    maskTextClass: o = "rr-mask",
    maskTextSelector: l = null,
    inlineStylesheet: d = !0,
    inlineImages: a = !1,
    recordCanvas: p = !1,
    maskAllInputs: s = !1,
    maskTextFn: h,
    maskInputFn: u,
    slimDOM: c = !1,
    dataURLOptions: m,
    preserveWhiteSpace: f,
    onSerialize: g,
    onIframeLoad: k,
    iframeLoadTimeout: v,
    onStylesheetLoad: y,
    stylesheetLoadTimeout: x,
    keepIframeSrcFn: w = () => !1
  } = t, b = s === !0 ? {
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
  } : s, S = qa(c);
  return Bt(e, {
    doc: e,
    mirror: r,
    blockClass: n,
    blockSelector: i,
    maskTextClass: o,
    maskTextSelector: l,
    skipChild: !1,
    inlineStylesheet: d,
    maskInputOptions: b,
    maskTextFn: h,
    maskInputFn: u,
    slimDOMOptions: S,
    dataURLOptions: m,
    inlineImages: a,
    recordCanvas: p,
    preserveWhiteSpace: f,
    onSerialize: g,
    onIframeLoad: k,
    iframeLoadTimeout: v,
    onStylesheetLoad: y,
    stylesheetLoadTimeout: x,
    keepIframeSrcFn: w,
    newlyAddedElement: !1
  });
}
function mp(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function gp(e) {
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
var Mr = { exports: {} }, $s;
function yp() {
  if ($s) return Mr.exports;
  $s = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return Mr.exports = t(), Mr.exports.createColors = t, Mr.exports;
}
const bp = {}, vp = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: bp
}, Symbol.toStringTag, { value: "Module" })), Ke = /* @__PURE__ */ gp(vp);
var yn, Ds;
function Di() {
  if (Ds) return yn;
  Ds = 1;
  let e = /* @__PURE__ */ yp(), t = Ke;
  class r extends Error {
    constructor(i, o, l, d, a, p) {
      super(i), this.name = "CssSyntaxError", this.reason = i, a && (this.file = a), d && (this.source = d), p && (this.plugin = p), typeof o < "u" && typeof l < "u" && (typeof o == "number" ? (this.line = o, this.column = l) : (this.line = o.line, this.column = o.column, this.endLine = l.line, this.endColumn = l.column)), this.setMessage(), Error.captureStackTrace && Error.captureStackTrace(this, r);
    }
    setMessage() {
      this.message = this.plugin ? this.plugin + ": " : "", this.message += this.file ? this.file : "<css input>", typeof this.line < "u" && (this.message += ":" + this.line + ":" + this.column), this.message += ": " + this.reason;
    }
    showSourceCode(i) {
      if (!this.source) return "";
      let o = this.source;
      i == null && (i = e.isColorSupported), t && i && (o = t(o));
      let l = o.split(/\r?\n/), d = Math.max(this.line - 3, 0), a = Math.min(this.line + 2, l.length), p = String(a).length, s, h;
      if (i) {
        let { bold: u, gray: c, red: m } = e.createColors(!0);
        s = (f) => u(m(f)), h = (f) => c(f);
      } else
        s = h = (u) => u;
      return l.slice(d, a).map((u, c) => {
        let m = d + 1 + c, f = " " + (" " + m).slice(-p) + " | ";
        if (m === this.line) {
          let g = h(f.replace(/\d/g, " ")) + u.slice(0, this.column - 1).replace(/[^\t]/g, " ");
          return s(">") + h(f) + u + `
 ` + g + s("^");
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
  return yn = r, r.default = r, yn;
}
var Rr = {}, zs;
function zi() {
  return zs || (zs = 1, Rr.isClean = Symbol("isClean"), Rr.my = Symbol("my")), Rr;
}
var bn, Fs;
function Wa() {
  if (Fs) return bn;
  Fs = 1;
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
      let l = "@" + i.name, d = i.params ? this.rawValue(i, "params") : "";
      if (typeof i.raws.afterName < "u" ? l += i.raws.afterName : d && (l += " "), i.nodes)
        this.block(i, l + d);
      else {
        let a = (i.raws.between || "") + (o ? ";" : "");
        this.builder(l + d + a, i);
      }
    }
    beforeAfter(i, o) {
      let l;
      i.type === "decl" ? l = this.raw(i, null, "beforeDecl") : i.type === "comment" ? l = this.raw(i, null, "beforeComment") : o === "before" ? l = this.raw(i, null, "beforeRule") : l = this.raw(i, null, "beforeClose");
      let d = i.parent, a = 0;
      for (; d && d.type !== "root"; )
        a += 1, d = d.parent;
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
      let d;
      i.nodes && i.nodes.length ? (this.body(i), d = this.raw(i, "after")) : d = this.raw(i, "after", "emptyBody"), d && this.builder(d), this.builder("}", i, "end");
    }
    body(i) {
      let o = i.nodes.length - 1;
      for (; o > 0 && i.nodes[o].type === "comment"; )
        o -= 1;
      let l = this.raw(i, "semicolon");
      for (let d = 0; d < i.nodes.length; d++) {
        let a = i.nodes[d], p = this.raw(a, "before");
        p && this.builder(p), this.stringify(a, o !== d || l);
      }
    }
    comment(i) {
      let o = this.raw(i, "left", "commentLeft"), l = this.raw(i, "right", "commentRight");
      this.builder("/*" + o + i.text + l + "*/", i);
    }
    decl(i, o) {
      let l = this.raw(i, "between", "colon"), d = i.prop + l + this.rawValue(i, "value");
      i.important && (d += i.raws.important || " !important"), o && (d += ";"), this.builder(d, i);
    }
    document(i) {
      this.body(i);
    }
    raw(i, o, l) {
      let d;
      if (l || (l = o), o && (d = i.raws[o], typeof d < "u"))
        return d;
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
        this[s] ? d = this[s](p, i) : p.walk((h) => {
          if (d = h.raws[o], typeof d < "u") return !1;
        });
      }
      return typeof d > "u" && (d = e[l]), p.rawCache[l] = d, d;
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
      return i.walkComments((d) => {
        if (typeof d.raws.before < "u")
          return l = d.raws.before, l.includes(`
`) && (l = l.replace(/[^\n]+$/, "")), !1;
      }), typeof l > "u" ? l = this.raw(o, null, "beforeDecl") : l && (l = l.replace(/\S/g, "")), l;
    }
    rawBeforeDecl(i, o) {
      let l;
      return i.walkDecls((d) => {
        if (typeof d.raws.before < "u")
          return l = d.raws.before, l.includes(`
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
        let d = l.parent;
        if (d && d !== i && d.parent && d.parent === i && typeof l.raws.before < "u") {
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
      let l = i[o], d = i.raws[o];
      return d && d.value === l ? d.raw : l;
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
  return bn = r, r.default = r, bn;
}
var vn, Us;
function Zr() {
  if (Us) return vn;
  Us = 1;
  let e = Wa();
  function t(r, n) {
    new e(n).stringify(r);
  }
  return vn = t, t.default = t, vn;
}
var wn, Bs;
function Qr() {
  if (Bs) return wn;
  Bs = 1;
  let { isClean: e, my: t } = zi(), r = Di(), n = Wa(), i = Zr();
  function o(d, a) {
    let p = new d.constructor();
    for (let s in d) {
      if (!Object.prototype.hasOwnProperty.call(d, s) || s === "proxyCache") continue;
      let h = d[s], u = typeof h;
      s === "parent" && u === "object" ? a && (p[s] = a) : s === "source" ? p[s] = h : Array.isArray(h) ? p[s] = h.map((c) => o(c, p)) : (u === "object" && h !== null && (h = o(h)), p[s] = h);
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
      let s = p || this.toString(), h = this.source.start.column, u = this.source.start.line;
      for (let c = 0; c < a; c++)
        s[c] === `
` ? (h = 1, u += 1) : h += 1;
      return { column: h, line: u };
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
        let h = this.toString(), u = h.indexOf(a.word);
        u !== -1 && (p = this.positionInside(u, h), s = this.positionInside(u + a.word.length, h));
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
      let u = 0;
      for (let c in this) {
        if (!Object.prototype.hasOwnProperty.call(this, c) || c === "parent" || c === "proxyCache") continue;
        let m = this[c];
        if (Array.isArray(m))
          s[c] = m.map((f) => typeof f == "object" && f.toJSON ? f.toJSON(null, p) : f);
        else if (typeof m == "object" && m.toJSON)
          s[c] = m.toJSON(null, p);
        else if (c === "source") {
          let f = p.get(m.input);
          f == null && (f = u, p.set(m.input, u), u++), s[c] = {
            end: m.end,
            inputId: f,
            start: m.start
          };
        } else
          s[c] = m;
      }
      return h && (s.inputs = [...p.keys()].map((c) => c.toJSON())), s;
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
      for (let u in s) h[u] = s[u];
      return a.warn(p, h);
    }
    get proxyOf() {
      return this;
    }
  }
  return wn = l, l.default = l, wn;
}
var kn, qs;
function en() {
  if (qs) return kn;
  qs = 1;
  let e = Qr();
  class t extends e {
    constructor(n) {
      n && typeof n.value < "u" && typeof n.value != "string" && (n = { ...n, value: String(n.value) }), super(n), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return kn = t, t.default = t, kn;
}
var xn, Ws;
function wp() {
  if (Ws) return xn;
  Ws = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return xn = { nanoid: (n = 21) => {
    let i = "", o = n;
    for (; o--; )
      i += e[Math.random() * 64 | 0];
    return i;
  }, customAlphabet: (n, i = 21) => (o = i) => {
    let l = "", d = o;
    for (; d--; )
      l += n[Math.random() * n.length | 0];
    return l;
  } }, xn;
}
var Sn, js;
function ja() {
  if (js) return Sn;
  js = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Ke, { existsSync: r, readFileSync: n } = Ke, { dirname: i, join: o } = Ke;
  function l(a) {
    return Buffer ? Buffer.from(a, "base64").toString() : window.atob(a);
  }
  class d {
    constructor(p, s) {
      if (s.map === !1) return;
      this.loadAnnotation(p), this.inline = this.startWith(this.annotation, "data:");
      let h = s.map ? s.map.prev : void 0, u = this.loadMap(s.from, h);
      !this.mapFile && s.from && (this.mapFile = s.from), this.mapFile && (this.root = i(this.mapFile)), u && (this.text = u);
    }
    consumer() {
      return this.consumerCache || (this.consumerCache = new e(this.text)), this.consumerCache;
    }
    decodeInline(p) {
      let s = /^data:application\/json;charset=utf-?8;base64,/, h = /^data:application\/json;base64,/, u = /^data:application\/json;charset=utf-?8,/, c = /^data:application\/json,/;
      if (u.test(p) || c.test(p))
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
      let h = p.lastIndexOf(s.pop()), u = p.indexOf("*/", h);
      h > -1 && u > -1 && (this.annotation = this.getAnnotationURL(p.substring(h, u)));
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
            let u = this.loadFile(h);
            if (!u)
              throw new Error(
                "Unable to load previous source map: " + h.toString()
              );
            return u;
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
  return Sn = d, d.default = d, Sn;
}
var Cn, Hs;
function tn() {
  if (Hs) return Cn;
  Hs = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Ke, { fileURLToPath: r, pathToFileURL: n } = Ke, { isAbsolute: i, resolve: o } = Ke, { nanoid: l } = /* @__PURE__ */ wp(), d = Ke, a = Di(), p = ja(), s = Symbol("fromOffsetCache"), h = !!(e && t), u = !!(o && i);
  class c {
    constructor(f, g = {}) {
      if (f === null || typeof f > "u" || typeof f == "object" && !f.toString)
        throw new Error(`PostCSS received ${f} instead of CSS string`);
      if (this.css = f.toString(), this.css[0] === "\uFEFF" || this.css[0] === "￾" ? (this.hasBOM = !0, this.css = this.css.slice(1)) : this.hasBOM = !1, g.from && (!u || /^\w+:\/\//.test(g.from) || i(g.from) ? this.file = g.from : this.file = o(g.from)), u && h) {
        let k = new p(this.css, g);
        if (k.text) {
          this.map = k;
          let v = k.consumer().file;
          !this.file && v && (this.file = this.mapResolve(v));
        }
      }
      this.file || (this.id = "<input css " + l(6) + ">"), this.map && (this.map.file = this.from);
    }
    error(f, g, k, v = {}) {
      let y, x, w;
      if (g && typeof g == "object") {
        let S = g, M = k;
        if (typeof S.offset == "number") {
          let I = this.fromOffset(S.offset);
          g = I.line, k = I.col;
        } else
          g = S.line, k = S.column;
        if (typeof M.offset == "number") {
          let I = this.fromOffset(M.offset);
          x = I.line, w = I.col;
        } else
          x = M.line, w = M.column;
      } else if (!k) {
        let S = this.fromOffset(g);
        g = S.line, k = S.col;
      }
      let b = this.origin(g, k, x, w);
      return b ? y = new a(
        f,
        b.endLine === void 0 ? b.line : { column: b.column, line: b.line },
        b.endLine === void 0 ? b.column : { column: b.endColumn, line: b.endLine },
        b.source,
        b.file,
        v.plugin
      ) : y = new a(
        f,
        x === void 0 ? g : { column: k, line: g },
        x === void 0 ? k : { column: w, line: x },
        this.css,
        this.file,
        v.plugin
      ), y.input = { column: k, endColumn: w, endLine: x, line: g, source: this.css }, this.file && (n && (y.input.url = n(this.file).toString()), y.input.file = this.file), y;
    }
    fromOffset(f) {
      let g, k;
      if (this[s])
        k = this[s];
      else {
        let y = this.css.split(`
`);
        k = new Array(y.length);
        let x = 0;
        for (let w = 0, b = y.length; w < b; w++)
          k[w] = x, x += y[w].length + 1;
        this[s] = k;
      }
      g = k[k.length - 1];
      let v = 0;
      if (f >= g)
        v = k.length - 1;
      else {
        let y = k.length - 2, x;
        for (; v < y; )
          if (x = v + (y - v >> 1), f < k[x])
            y = x - 1;
          else if (f >= k[x + 1])
            v = x + 1;
          else {
            v = x;
            break;
          }
      }
      return {
        col: f - k[v] + 1,
        line: v + 1
      };
    }
    mapResolve(f) {
      return /^\w+:\/\//.test(f) ? f : o(this.map.consumer().sourceRoot || this.map.root || ".", f);
    }
    origin(f, g, k, v) {
      if (!this.map) return !1;
      let y = this.map.consumer(), x = y.originalPositionFor({ column: g, line: f });
      if (!x.source) return !1;
      let w;
      typeof k == "number" && (w = y.originalPositionFor({ column: v, line: k }));
      let b;
      i(x.source) ? b = n(x.source) : b = new URL(
        x.source,
        this.map.consumer().sourceRoot || n(this.map.mapFile)
      );
      let S = {
        column: x.column,
        endColumn: w && w.column,
        endLine: w && w.line,
        line: x.line,
        url: b.toString()
      };
      if (b.protocol === "file:")
        if (r)
          S.file = r(b);
        else
          throw new Error("file: protocol is not available in this PostCSS build");
      let M = y.sourceContentFor(x.source);
      return M && (S.source = M), S;
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
  return Cn = c, c.default = c, d && d.registerInput && d.registerInput(c), Cn;
}
var En, Vs;
function Ha() {
  if (Vs) return En;
  Vs = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Ke, { dirname: r, relative: n, resolve: i, sep: o } = Ke, { pathToFileURL: l } = Ke, d = tn(), a = !!(e && t), p = !!(r && i && n && o);
  class s {
    constructor(u, c, m, f) {
      this.stringify = u, this.mapOpts = m.map || {}, this.root = c, this.opts = m, this.css = f, this.originalCSS = f, this.usesFileUrls = !this.mapOpts.from && this.mapOpts.absolute, this.memoizedFileURLs = /* @__PURE__ */ new Map(), this.memoizedPaths = /* @__PURE__ */ new Map(), this.memoizedURLs = /* @__PURE__ */ new Map();
    }
    addAnnotation() {
      let u;
      this.isInline() ? u = "data:application/json;base64," + this.toBase64(this.map.toString()) : typeof this.mapOpts.annotation == "string" ? u = this.mapOpts.annotation : typeof this.mapOpts.annotation == "function" ? u = this.mapOpts.annotation(this.opts.to, this.root) : u = this.outputFile() + ".map";
      let c = `
`;
      this.css.includes(`\r
`) && (c = `\r
`), this.css += c + "/*# sourceMappingURL=" + u + " */";
    }
    applyPrevMaps() {
      for (let u of this.previous()) {
        let c = this.toUrl(this.path(u.file)), m = u.root || r(u.file), f;
        this.mapOpts.sourcesContent === !1 ? (f = new e(u.text), f.sourcesContent && (f.sourcesContent = null)) : f = u.consumer(), this.map.applySourceMap(f, c, this.toUrl(this.path(m)));
      }
    }
    clearAnnotation() {
      if (this.mapOpts.annotation !== !1)
        if (this.root) {
          let u;
          for (let c = this.root.nodes.length - 1; c >= 0; c--)
            u = this.root.nodes[c], u.type === "comment" && u.text.indexOf("# sourceMappingURL=") === 0 && this.root.removeChild(c);
        } else this.css && (this.css = this.css.replace(/\n*?\/\*#[\S\s]*?\*\/$/gm, ""));
    }
    generate() {
      if (this.clearAnnotation(), p && a && this.isMap())
        return this.generateMap();
      {
        let u = "";
        return this.stringify(this.root, (c) => {
          u += c;
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
      let u = 1, c = 1, m = "<no source>", f = {
        generated: { column: 0, line: 0 },
        original: { column: 0, line: 0 },
        source: ""
      }, g, k;
      this.stringify(this.root, (v, y, x) => {
        if (this.css += v, y && x !== "end" && (f.generated.line = u, f.generated.column = c - 1, y.source && y.source.start ? (f.source = this.sourcePath(y), f.original.line = y.source.start.line, f.original.column = y.source.start.column - 1, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, this.map.addMapping(f))), g = v.match(/\n/g), g ? (u += g.length, k = v.lastIndexOf(`
`), c = v.length - k) : c += v.length, y && x !== "start") {
          let w = y.parent || { raws: {} };
          (!(y.type === "decl" || y.type === "atrule" && !y.nodes) || y !== w.last || w.raws.semicolon) && (y.source && y.source.end ? (f.source = this.sourcePath(y), f.original.line = y.source.end.line, f.original.column = y.source.end.column - 1, f.generated.line = u, f.generated.column = c - 2, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, f.generated.line = u, f.generated.column = c - 1, this.map.addMapping(f)));
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
      return typeof u < "u" && u !== !0 ? !1 : this.previous().length ? this.previous().some((c) => c.inline) : !0;
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
      let c = this.memoizedPaths.get(u);
      if (c) return c;
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
              let c = u.source.input.map;
              this.previousMaps.includes(c) || this.previousMaps.push(c);
            }
          });
        else {
          let u = new d(this.originalCSS, this.opts);
          u.map && this.previousMaps.push(u.map);
        }
      return this.previousMaps;
    }
    setSourcesContent() {
      let u = {};
      if (this.root)
        this.root.walk((c) => {
          if (c.source) {
            let m = c.source.input.from;
            if (m && !u[m]) {
              u[m] = !0;
              let f = this.usesFileUrls ? this.toFileUrl(m) : this.toUrl(this.path(m));
              this.map.setSourceContent(f, c.source.input.css);
            }
          }
        });
      else if (this.css) {
        let c = this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>";
        this.map.setSourceContent(c, this.css);
      }
    }
    sourcePath(u) {
      return this.mapOpts.from ? this.toUrl(this.mapOpts.from) : this.usesFileUrls ? this.toFileUrl(u.source.input.from) : this.toUrl(this.path(u.source.input.from));
    }
    toBase64(u) {
      return Buffer ? Buffer.from(u).toString("base64") : window.btoa(unescape(encodeURIComponent(u)));
    }
    toFileUrl(u) {
      let c = this.memoizedFileURLs.get(u);
      if (c) return c;
      if (l) {
        let m = l(u).toString();
        return this.memoizedFileURLs.set(u, m), m;
      } else
        throw new Error(
          "`map.absolute` option is not available in this PostCSS build"
        );
    }
    toUrl(u) {
      let c = this.memoizedURLs.get(u);
      if (c) return c;
      o === "\\" && (u = u.replace(/\\/g, "/"));
      let m = encodeURI(u).replace(/[#?]/g, encodeURIComponent);
      return this.memoizedURLs.set(u, m), m;
    }
  }
  return En = s, En;
}
var Mn, Ys;
function rn() {
  if (Ys) return Mn;
  Ys = 1;
  let e = Qr();
  class t extends e {
    constructor(n) {
      super(n), this.type = "comment";
    }
  }
  return Mn = t, t.default = t, Mn;
}
var Rn, Gs;
function Ot() {
  if (Gs) return Rn;
  Gs = 1;
  let { isClean: e, my: t } = zi(), r = en(), n = rn(), i = Qr(), o, l, d, a;
  function p(u) {
    return u.map((c) => (c.nodes && (c.nodes = p(c.nodes)), delete c.source, c));
  }
  function s(u) {
    if (u[e] = !1, u.proxyOf.nodes)
      for (let c of u.proxyOf.nodes)
        s(c);
  }
  class h extends i {
    append(...c) {
      for (let m of c) {
        let f = this.normalize(m, this.last);
        for (let g of f) this.proxyOf.nodes.push(g);
      }
      return this.markDirty(), this;
    }
    cleanRaws(c) {
      if (super.cleanRaws(c), this.nodes)
        for (let m of this.nodes) m.cleanRaws(c);
    }
    each(c) {
      if (!this.proxyOf.nodes) return;
      let m = this.getIterator(), f, g;
      for (; this.indexes[m] < this.proxyOf.nodes.length && (f = this.indexes[m], g = c(this.proxyOf.nodes[f], f), g !== !1); )
        this.indexes[m] += 1;
      return delete this.indexes[m], g;
    }
    every(c) {
      return this.nodes.every(c);
    }
    getIterator() {
      this.lastEach || (this.lastEach = 0), this.indexes || (this.indexes = {}), this.lastEach += 1;
      let c = this.lastEach;
      return this.indexes[c] = 0, c;
    }
    getProxyProcessor() {
      return {
        get(c, m) {
          return m === "proxyOf" ? c : c[m] ? m === "each" || typeof m == "string" && m.startsWith("walk") ? (...f) => c[m](
            ...f.map((g) => typeof g == "function" ? (k, v) => g(k.toProxy(), v) : g)
          ) : m === "every" || m === "some" ? (f) => c[m](
            (g, ...k) => f(g.toProxy(), ...k)
          ) : m === "root" ? () => c.root().toProxy() : m === "nodes" ? c.nodes.map((f) => f.toProxy()) : m === "first" || m === "last" ? c[m].toProxy() : c[m] : c[m];
        },
        set(c, m, f) {
          return c[m] === f || (c[m] = f, (m === "name" || m === "params" || m === "selector") && c.markDirty()), !0;
        }
      };
    }
    index(c) {
      return typeof c == "number" ? c : (c.proxyOf && (c = c.proxyOf), this.proxyOf.nodes.indexOf(c));
    }
    insertAfter(c, m) {
      let f = this.index(c), g = this.normalize(m, this.proxyOf.nodes[f]).reverse();
      f = this.index(c);
      for (let v of g) this.proxyOf.nodes.splice(f + 1, 0, v);
      let k;
      for (let v in this.indexes)
        k = this.indexes[v], f < k && (this.indexes[v] = k + g.length);
      return this.markDirty(), this;
    }
    insertBefore(c, m) {
      let f = this.index(c), g = f === 0 ? "prepend" : !1, k = this.normalize(m, this.proxyOf.nodes[f], g).reverse();
      f = this.index(c);
      for (let y of k) this.proxyOf.nodes.splice(f, 0, y);
      let v;
      for (let y in this.indexes)
        v = this.indexes[y], f <= v && (this.indexes[y] = v + k.length);
      return this.markDirty(), this;
    }
    normalize(c, m) {
      if (typeof c == "string")
        c = p(o(c).nodes);
      else if (typeof c > "u")
        c = [];
      else if (Array.isArray(c)) {
        c = c.slice(0);
        for (let g of c)
          g.parent && g.parent.removeChild(g, "ignore");
      } else if (c.type === "root" && this.type !== "document") {
        c = c.nodes.slice(0);
        for (let g of c)
          g.parent && g.parent.removeChild(g, "ignore");
      } else if (c.type)
        c = [c];
      else if (c.prop) {
        if (typeof c.value > "u")
          throw new Error("Value field is missed in node creation");
        typeof c.value != "string" && (c.value = String(c.value)), c = [new r(c)];
      } else if (c.selector)
        c = [new l(c)];
      else if (c.name)
        c = [new d(c)];
      else if (c.text)
        c = [new n(c)];
      else
        throw new Error("Unknown node type in node creation");
      return c.map((g) => (g[t] || h.rebuild(g), g = g.proxyOf, g.parent && g.parent.removeChild(g), g[e] && s(g), typeof g.raws.before > "u" && m && typeof m.raws.before < "u" && (g.raws.before = m.raws.before.replace(/\S/g, "")), g.parent = this.proxyOf, g));
    }
    prepend(...c) {
      c = c.reverse();
      for (let m of c) {
        let f = this.normalize(m, this.first, "prepend").reverse();
        for (let g of f) this.proxyOf.nodes.unshift(g);
        for (let g in this.indexes)
          this.indexes[g] = this.indexes[g] + f.length;
      }
      return this.markDirty(), this;
    }
    push(c) {
      return c.parent = this, this.proxyOf.nodes.push(c), this;
    }
    removeAll() {
      for (let c of this.proxyOf.nodes) c.parent = void 0;
      return this.proxyOf.nodes = [], this.markDirty(), this;
    }
    removeChild(c) {
      c = this.index(c), this.proxyOf.nodes[c].parent = void 0, this.proxyOf.nodes.splice(c, 1);
      let m;
      for (let f in this.indexes)
        m = this.indexes[f], m >= c && (this.indexes[f] = m - 1);
      return this.markDirty(), this;
    }
    replaceValues(c, m, f) {
      return f || (f = m, m = {}), this.walkDecls((g) => {
        m.props && !m.props.includes(g.prop) || m.fast && !g.value.includes(m.fast) || (g.value = g.value.replace(c, f));
      }), this.markDirty(), this;
    }
    some(c) {
      return this.nodes.some(c);
    }
    walk(c) {
      return this.each((m, f) => {
        let g;
        try {
          g = c(m, f);
        } catch (k) {
          throw m.addToError(k);
        }
        return g !== !1 && m.walk && (g = m.walk(c)), g;
      });
    }
    walkAtRules(c, m) {
      return m ? c instanceof RegExp ? this.walk((f, g) => {
        if (f.type === "atrule" && c.test(f.name))
          return m(f, g);
      }) : this.walk((f, g) => {
        if (f.type === "atrule" && f.name === c)
          return m(f, g);
      }) : (m = c, this.walk((f, g) => {
        if (f.type === "atrule")
          return m(f, g);
      }));
    }
    walkComments(c) {
      return this.walk((m, f) => {
        if (m.type === "comment")
          return c(m, f);
      });
    }
    walkDecls(c, m) {
      return m ? c instanceof RegExp ? this.walk((f, g) => {
        if (f.type === "decl" && c.test(f.prop))
          return m(f, g);
      }) : this.walk((f, g) => {
        if (f.type === "decl" && f.prop === c)
          return m(f, g);
      }) : (m = c, this.walk((f, g) => {
        if (f.type === "decl")
          return m(f, g);
      }));
    }
    walkRules(c, m) {
      return m ? c instanceof RegExp ? this.walk((f, g) => {
        if (f.type === "rule" && c.test(f.selector))
          return m(f, g);
      }) : this.walk((f, g) => {
        if (f.type === "rule" && f.selector === c)
          return m(f, g);
      }) : (m = c, this.walk((f, g) => {
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
  return h.registerParse = (u) => {
    o = u;
  }, h.registerRule = (u) => {
    l = u;
  }, h.registerAtRule = (u) => {
    d = u;
  }, h.registerRoot = (u) => {
    a = u;
  }, Rn = h, h.default = h, h.rebuild = (u) => {
    u.type === "atrule" ? Object.setPrototypeOf(u, d.prototype) : u.type === "rule" ? Object.setPrototypeOf(u, l.prototype) : u.type === "decl" ? Object.setPrototypeOf(u, r.prototype) : u.type === "comment" ? Object.setPrototypeOf(u, n.prototype) : u.type === "root" && Object.setPrototypeOf(u, a.prototype), u[t] = !0, u.nodes && u.nodes.forEach((c) => {
      h.rebuild(c);
    });
  }, Rn;
}
var An, Xs;
function Fi() {
  if (Xs) return An;
  Xs = 1;
  let e = Ot(), t, r;
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
  }, An = n, n.default = n, An;
}
var In, Ks;
function Va() {
  if (Ks) return In;
  Ks = 1;
  let e = {};
  return In = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, In;
}
var On, Js;
function Ya() {
  if (Js) return On;
  Js = 1;
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
  return On = e, e.default = e, On;
}
var Ln, Zs;
function Ui() {
  if (Zs) return Ln;
  Zs = 1;
  let e = Ya();
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
  return Ln = t, t.default = t, Ln;
}
var Tn, Qs;
function kp() {
  if (Qs) return Tn;
  Qs = 1;
  const e = 39, t = 34, r = 92, n = 47, i = 10, o = 32, l = 12, d = 9, a = 13, p = 91, s = 93, h = 40, u = 41, c = 123, m = 125, f = 59, g = 42, k = 58, v = 64, y = /[\t\n\f\r "#'()/;[\\\]{}]/g, x = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, w = /.[\r\n"'(/\\]/, b = /[\da-f]/i;
  return Tn = function(M, I = {}) {
    let R = M.css.valueOf(), j = I.ignoreErrors, z, E, Ne, be, ne, ie, he, ke, ce, Z, Ce = R.length, L = 0, Pe = [], Ee = [];
    function pt() {
      return L;
    }
    function oe(H) {
      throw M.error("Unclosed " + H, L);
    }
    function Se() {
      return Ee.length === 0 && L >= Ce;
    }
    function Me(H) {
      if (Ee.length) return Ee.pop();
      if (L >= Ce) return;
      let fe = H ? H.ignoreUnclosed : !1;
      switch (z = R.charCodeAt(L), z) {
        case i:
        case o:
        case d:
        case a:
        case l: {
          E = L;
          do
            E += 1, z = R.charCodeAt(E);
          while (z === o || z === i || z === d || z === a || z === l);
          Z = ["space", R.slice(L, E)], L = E - 1;
          break;
        }
        case p:
        case s:
        case c:
        case m:
        case k:
        case f:
        case u: {
          let Q = String.fromCharCode(z);
          Z = [Q, Q, L];
          break;
        }
        case h: {
          if (ke = Pe.length ? Pe.pop()[1] : "", ce = R.charCodeAt(L + 1), ke === "url" && ce !== e && ce !== t && ce !== o && ce !== i && ce !== d && ce !== l && ce !== a) {
            E = L;
            do {
              if (ie = !1, E = R.indexOf(")", E + 1), E === -1)
                if (j || fe) {
                  E = L;
                  break;
                } else
                  oe("bracket");
              for (he = E; R.charCodeAt(he - 1) === r; )
                he -= 1, ie = !ie;
            } while (ie);
            Z = ["brackets", R.slice(L, E + 1), L, E], L = E;
          } else
            E = R.indexOf(")", L + 1), be = R.slice(L, E + 1), E === -1 || w.test(be) ? Z = ["(", "(", L] : (Z = ["brackets", be, L, E], L = E);
          break;
        }
        case e:
        case t: {
          Ne = z === e ? "'" : '"', E = L;
          do {
            if (ie = !1, E = R.indexOf(Ne, E + 1), E === -1)
              if (j || fe) {
                E = L + 1;
                break;
              } else
                oe("string");
            for (he = E; R.charCodeAt(he - 1) === r; )
              he -= 1, ie = !ie;
          } while (ie);
          Z = ["string", R.slice(L, E + 1), L, E], L = E;
          break;
        }
        case v: {
          y.lastIndex = L + 1, y.test(R), y.lastIndex === 0 ? E = R.length - 1 : E = y.lastIndex - 2, Z = ["at-word", R.slice(L, E + 1), L, E], L = E;
          break;
        }
        case r: {
          for (E = L, ne = !0; R.charCodeAt(E + 1) === r; )
            E += 1, ne = !ne;
          if (z = R.charCodeAt(E + 1), ne && z !== n && z !== o && z !== i && z !== d && z !== a && z !== l && (E += 1, b.test(R.charAt(E)))) {
            for (; b.test(R.charAt(E + 1)); )
              E += 1;
            R.charCodeAt(E + 1) === o && (E += 1);
          }
          Z = ["word", R.slice(L, E + 1), L, E], L = E;
          break;
        }
        default: {
          z === n && R.charCodeAt(L + 1) === g ? (E = R.indexOf("*/", L + 2) + 1, E === 0 && (j || fe ? E = R.length : oe("comment")), Z = ["comment", R.slice(L, E + 1), L, E], L = E) : (x.lastIndex = L + 1, x.test(R), x.lastIndex === 0 ? E = R.length - 1 : E = x.lastIndex - 2, Z = ["word", R.slice(L, E + 1), L, E], Pe.push(Z), L = E);
          break;
        }
      }
      return L++, Z;
    }
    function We(H) {
      Ee.push(H);
    }
    return {
      back: We,
      endOfFile: Se,
      nextToken: Me,
      position: pt
    };
  }, Tn;
}
var Nn, eo;
function Bi() {
  if (eo) return Nn;
  eo = 1;
  let e = Ot();
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
  return Nn = t, t.default = t, e.registerAtRule(t), Nn;
}
var Pn, to;
function fr() {
  if (to) return Pn;
  to = 1;
  let e = Ot(), t, r;
  class n extends e {
    constructor(o) {
      super(o), this.type = "root", this.nodes || (this.nodes = []);
    }
    normalize(o, l, d) {
      let a = super.normalize(o);
      if (l) {
        if (d === "prepend")
          this.nodes.length > 1 ? l.raws.before = this.nodes[1].raws.before : delete l.raws.before;
        else if (this.first !== l)
          for (let p of a)
            p.raws.before = l.raws.before;
      }
      return a;
    }
    removeChild(o, l) {
      let d = this.index(o);
      return !l && d === 0 && this.nodes.length > 1 && (this.nodes[1].raws.before = this.nodes[d].raws.before), super.removeChild(o);
    }
    toResult(o = {}) {
      return new t(new r(), this, o).stringify();
    }
  }
  return n.registerLazyResult = (i) => {
    t = i;
  }, n.registerProcessor = (i) => {
    r = i;
  }, Pn = n, n.default = n, e.registerRoot(n), Pn;
}
var _n, ro;
function Ga() {
  if (ro) return _n;
  ro = 1;
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
      let i = [], o = "", l = !1, d = 0, a = !1, p = "", s = !1;
      for (let h of t)
        s ? s = !1 : h === "\\" ? s = !0 : a ? h === p && (a = !1) : h === '"' || h === "'" ? (a = !0, p = h) : h === "(" ? d += 1 : h === ")" ? d > 0 && (d -= 1) : d === 0 && r.includes(h) && (l = !0), l ? (o !== "" && i.push(o.trim()), o = "", l = !1) : o += h;
      return (n || o !== "") && i.push(o.trim()), i;
    }
  };
  return _n = e, e.default = e, _n;
}
var $n, no;
function qi() {
  if (no) return $n;
  no = 1;
  let e = Ot(), t = Ga();
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
  return $n = r, r.default = r, e.registerRule(r), $n;
}
var Dn, io;
function xp() {
  if (io) return Dn;
  io = 1;
  let e = en(), t = kp(), r = rn(), n = Bi(), i = fr(), o = qi();
  const l = {
    empty: !0,
    space: !0
  };
  function d(p) {
    for (let s = p.length - 1; s >= 0; s--) {
      let h = p[s], u = h[3] || h[2];
      if (u) return u;
    }
  }
  class a {
    constructor(s) {
      this.input = s, this.root = new i(), this.current = this.root, this.spaces = "", this.semicolon = !1, this.createTokenizer(), this.root.source = { input: s, start: { column: 1, line: 1, offset: 0 } };
    }
    atrule(s) {
      let h = new n();
      h.name = s[1].slice(1), h.name === "" && this.unnamedAtrule(h, s), this.init(h, s[2]);
      let u, c, m, f = !1, g = !1, k = [], v = [];
      for (; !this.tokenizer.endOfFile(); ) {
        if (s = this.tokenizer.nextToken(), u = s[0], u === "(" || u === "[" ? v.push(u === "(" ? ")" : "]") : u === "{" && v.length > 0 ? v.push("}") : u === v[v.length - 1] && v.pop(), v.length === 0)
          if (u === ";") {
            h.source.end = this.getPosition(s[2]), h.source.end.offset++, this.semicolon = !0;
            break;
          } else if (u === "{") {
            g = !0;
            break;
          } else if (u === "}") {
            if (k.length > 0) {
              for (m = k.length - 1, c = k[m]; c && c[0] === "space"; )
                c = k[--m];
              c && (h.source.end = this.getPosition(c[3] || c[2]), h.source.end.offset++);
            }
            this.end(s);
            break;
          } else
            k.push(s);
        else
          k.push(s);
        if (this.tokenizer.endOfFile()) {
          f = !0;
          break;
        }
      }
      h.raws.between = this.spacesAndCommentsFromEnd(k), k.length ? (h.raws.afterName = this.spacesAndCommentsFromStart(k), this.raw(h, "params", k), f && (s = k[k.length - 1], h.source.end = this.getPosition(s[3] || s[2]), h.source.end.offset++, this.spaces = h.raws.between, h.raws.between = "")) : (h.raws.afterName = "", h.params = ""), g && (h.nodes = [], this.current = h);
    }
    checkMissedSemicolon(s) {
      let h = this.colon(s);
      if (h === !1) return;
      let u = 0, c;
      for (let m = h - 1; m >= 0 && (c = s[m], !(c[0] !== "space" && (u += 1, u === 2))); m--)
        ;
      throw this.input.error(
        "Missed semicolon",
        c[0] === "word" ? c[3] + 1 : c[2]
      );
    }
    colon(s) {
      let h = 0, u, c, m;
      for (let [f, g] of s.entries()) {
        if (u = g, c = u[0], c === "(" && (h += 1), c === ")" && (h -= 1), h === 0 && c === ":")
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
    comment(s) {
      let h = new r();
      this.init(h, s[2]), h.source.end = this.getPosition(s[3] || s[2]), h.source.end.offset++;
      let u = s[1].slice(2, -2);
      if (/^\s*$/.test(u))
        h.text = "", h.raws.left = u, h.raws.right = "";
      else {
        let c = u.match(/^(\s*)([^]*\S)(\s*)$/);
        h.text = c[2], h.raws.left = c[1], h.raws.right = c[3];
      }
    }
    createTokenizer() {
      this.tokenizer = t(this.input);
    }
    decl(s, h) {
      let u = new e();
      this.init(u, s[0][2]);
      let c = s[s.length - 1];
      for (c[0] === ";" && (this.semicolon = !0, s.pop()), u.source.end = this.getPosition(
        c[3] || c[2] || d(s)
      ), u.source.end.offset++; s[0][0] !== "word"; )
        s.length === 1 && this.unknownWord(s), u.raws.before += s.shift()[1];
      for (u.source.start = this.getPosition(s[0][2]), u.prop = ""; s.length; ) {
        let v = s[0][0];
        if (v === ":" || v === "space" || v === "comment")
          break;
        u.prop += s.shift()[1];
      }
      u.raws.between = "";
      let m;
      for (; s.length; )
        if (m = s.shift(), m[0] === ":") {
          u.raws.between += m[1];
          break;
        } else
          m[0] === "word" && /\w/.test(m[1]) && this.unknownWord([m]), u.raws.between += m[1];
      (u.prop[0] === "_" || u.prop[0] === "*") && (u.raws.before += u.prop[0], u.prop = u.prop.slice(1));
      let f = [], g;
      for (; s.length && (g = s[0][0], !(g !== "space" && g !== "comment")); )
        f.push(s.shift());
      this.precheckMissedSemicolon(s);
      for (let v = s.length - 1; v >= 0; v--) {
        if (m = s[v], m[1].toLowerCase() === "!important") {
          u.important = !0;
          let y = this.stringFrom(s, v);
          y = this.spacesFromEnd(s) + y, y !== " !important" && (u.raws.important = y);
          break;
        } else if (m[1].toLowerCase() === "important") {
          let y = s.slice(0), x = "";
          for (let w = v; w > 0; w--) {
            let b = y[w][0];
            if (x.trim().indexOf("!") === 0 && b !== "space")
              break;
            x = y.pop()[1] + x;
          }
          x.trim().indexOf("!") === 0 && (u.important = !0, u.raws.important = x, s = y);
        }
        if (m[0] !== "space" && m[0] !== "comment")
          break;
      }
      s.some((v) => v[0] !== "space" && v[0] !== "comment") && (u.raws.between += f.map((v) => v[1]).join(""), f = []), this.raw(u, "value", f.concat(s), h), u.value.includes(":") && !h && this.checkMissedSemicolon(s);
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
      let h = !1, u = null, c = !1, m = null, f = [], g = s[1].startsWith("--"), k = [], v = s;
      for (; v; ) {
        if (u = v[0], k.push(v), u === "(" || u === "[")
          m || (m = v), f.push(u === "(" ? ")" : "]");
        else if (g && c && u === "{")
          m || (m = v), f.push("}");
        else if (f.length === 0)
          if (u === ";")
            if (c) {
              this.decl(k, g);
              return;
            } else
              break;
          else if (u === "{") {
            this.rule(k);
            return;
          } else if (u === "}") {
            this.tokenizer.back(k.pop()), h = !0;
            break;
          } else u === ":" && (c = !0);
        else u === f[f.length - 1] && (f.pop(), f.length === 0 && (m = null));
        v = this.tokenizer.nextToken();
      }
      if (this.tokenizer.endOfFile() && (h = !0), f.length > 0 && this.unclosedBracket(m), h && c) {
        if (!g)
          for (; k.length && (v = k[k.length - 1][0], !(v !== "space" && v !== "comment")); )
            this.tokenizer.back(k.pop());
        this.decl(k, g);
      } else
        this.unknownWord(k);
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
    raw(s, h, u, c) {
      let m, f, g = u.length, k = "", v = !0, y, x;
      for (let w = 0; w < g; w += 1)
        m = u[w], f = m[0], f === "space" && w === g - 1 && !c ? v = !1 : f === "comment" ? (x = u[w - 1] ? u[w - 1][0] : "empty", y = u[w + 1] ? u[w + 1][0] : "empty", !l[x] && !l[y] ? k.slice(-1) === "," ? v = !1 : k += m[1] : v = !1) : k += m[1];
      if (!v) {
        let w = u.reduce((b, S) => b + S[1], "");
        s.raws[h] = { raw: w, value: k };
      }
      s[h] = k;
    }
    rule(s) {
      s.pop();
      let h = new o();
      this.init(h, s[0][2]), h.raws.between = this.spacesAndCommentsFromEnd(s), this.raw(h, "selector", s), this.current = h;
    }
    spacesAndCommentsFromEnd(s) {
      let h, u = "";
      for (; s.length && (h = s[s.length - 1][0], !(h !== "space" && h !== "comment")); )
        u = s.pop()[1] + u;
      return u;
    }
    // Errors
    spacesAndCommentsFromStart(s) {
      let h, u = "";
      for (; s.length && (h = s[0][0], !(h !== "space" && h !== "comment")); )
        u += s.shift()[1];
      return u;
    }
    spacesFromEnd(s) {
      let h, u = "";
      for (; s.length && (h = s[s.length - 1][0], h === "space"); )
        u = s.pop()[1] + u;
      return u;
    }
    stringFrom(s, h) {
      let u = "";
      for (let c = h; c < s.length; c++)
        u += s[c][1];
      return s.splice(h, s.length - h), u;
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
  return Dn = a, Dn;
}
var zn, so;
function Wi() {
  if (so) return zn;
  so = 1;
  let e = Ot(), t = xp(), r = tn();
  function n(i, o) {
    let l = new r(i, o), d = new t(l);
    try {
      d.parse();
    } catch (a) {
      throw process.env.NODE_ENV !== "production" && a.name === "CssSyntaxError" && o && o.from && (/\.scss$/i.test(o.from) ? a.message += `
You tried to parse SCSS with the standard CSS parser; try again with the postcss-scss parser` : /\.sass/i.test(o.from) ? a.message += `
You tried to parse Sass with the standard CSS parser; try again with the postcss-sass parser` : /\.less$/i.test(o.from) && (a.message += `
You tried to parse Less with the standard CSS parser; try again with the postcss-less parser`)), a;
    }
    return d.root;
  }
  return zn = n, n.default = n, e.registerParse(n), zn;
}
var Fn, oo;
function Xa() {
  if (oo) return Fn;
  oo = 1;
  let { isClean: e, my: t } = zi(), r = Ha(), n = Zr(), i = Ot(), o = Fi(), l = Va(), d = Ui(), a = Wi(), p = fr();
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
  }, u = {
    Once: !0,
    postcssPlugin: !0,
    prepare: !0
  }, c = 0;
  function m(x) {
    return typeof x == "object" && typeof x.then == "function";
  }
  function f(x) {
    let w = !1, b = s[x.type];
    return x.type === "decl" ? w = x.prop.toLowerCase() : x.type === "atrule" && (w = x.name.toLowerCase()), w && x.append ? [
      b,
      b + "-" + w,
      c,
      b + "Exit",
      b + "Exit-" + w
    ] : w ? [b, b + "-" + w, b + "Exit", b + "Exit-" + w] : x.append ? [b, c, b + "Exit"] : [b, b + "Exit"];
  }
  function g(x) {
    let w;
    return x.type === "document" ? w = ["Document", c, "DocumentExit"] : x.type === "root" ? w = ["Root", c, "RootExit"] : w = f(x), {
      eventIndex: 0,
      events: w,
      iterator: 0,
      node: x,
      visitorIndex: 0,
      visitors: []
    };
  }
  function k(x) {
    return x[e] = !1, x.nodes && x.nodes.forEach((w) => k(w)), x;
  }
  let v = {};
  class y {
    constructor(w, b, S) {
      this.stringified = !1, this.processed = !1;
      let M;
      if (typeof b == "object" && b !== null && (b.type === "root" || b.type === "document"))
        M = k(b);
      else if (b instanceof y || b instanceof d)
        M = k(b.root), b.map && (typeof S.map > "u" && (S.map = {}), S.map.inline || (S.map.inline = !1), S.map.prev = b.map);
      else {
        let I = a;
        S.syntax && (I = S.syntax.parse), S.parser && (I = S.parser), I.parse && (I = I.parse);
        try {
          M = I(b, S);
        } catch (R) {
          this.processed = !0, this.error = R;
        }
        M && !M[t] && i.rebuild(M);
      }
      this.result = new d(w, M, S), this.helpers = { ...v, postcss: v, result: this.result }, this.plugins = this.processor.plugins.map((I) => typeof I == "object" && I.prepare ? { ...I, ...I.prepare(this.result) } : I);
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
    handleError(w, b) {
      let S = this.result.lastPlugin;
      try {
        if (b && b.addToError(w), this.error = w, w.name === "CssSyntaxError" && !w.plugin)
          w.plugin = S.postcssPlugin, w.setMessage();
        else if (S.postcssVersion && process.env.NODE_ENV !== "production") {
          let M = S.postcssPlugin, I = S.postcssVersion, R = this.result.processor.version, j = I.split("."), z = R.split(".");
          (j[0] !== z[0] || parseInt(j[1]) > parseInt(z[1])) && console.error(
            "Unknown error from PostCSS plugin. Your current PostCSS version is " + R + ", but " + M + " uses " + I + ". Perhaps this is the source of the error below."
          );
        }
      } catch (M) {
        console && console.error && console.error(M);
      }
      return w;
    }
    prepareVisitors() {
      this.listeners = {};
      let w = (b, S, M) => {
        this.listeners[S] || (this.listeners[S] = []), this.listeners[S].push([b, M]);
      };
      for (let b of this.plugins)
        if (typeof b == "object")
          for (let S in b) {
            if (!h[S] && /^[A-Z]/.test(S))
              throw new Error(
                `Unknown event ${S} in ${b.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`
              );
            if (!u[S])
              if (typeof b[S] == "object")
                for (let M in b[S])
                  M === "*" ? w(b, S, b[S][M]) : w(
                    b,
                    S + "-" + M.toLowerCase(),
                    b[S][M]
                  );
              else typeof b[S] == "function" && w(b, S, b[S]);
          }
      this.hasListener = Object.keys(this.listeners).length > 0;
    }
    async runAsync() {
      this.plugin = 0;
      for (let w = 0; w < this.plugins.length; w++) {
        let b = this.plugins[w], S = this.runOnRoot(b);
        if (m(S))
          try {
            await S;
          } catch (M) {
            throw this.handleError(M);
          }
      }
      if (this.prepareVisitors(), this.hasListener) {
        let w = this.result.root;
        for (; !w[e]; ) {
          w[e] = !0;
          let b = [g(w)];
          for (; b.length > 0; ) {
            let S = this.visitTick(b);
            if (m(S))
              try {
                await S;
              } catch (M) {
                let I = b[b.length - 1].node;
                throw this.handleError(M, I);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [b, S] of this.listeners.OnceExit) {
            this.result.lastPlugin = b;
            try {
              if (w.type === "document") {
                let M = w.nodes.map(
                  (I) => S(I, this.helpers)
                );
                await Promise.all(M);
              } else
                await S(w, this.helpers);
            } catch (M) {
              throw this.handleError(M);
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
            let b = this.result.root.nodes.map(
              (S) => w.Once(S, this.helpers)
            );
            return m(b[0]) ? Promise.all(b) : b;
          }
          return w.Once(this.result.root, this.helpers);
        } else if (typeof w == "function")
          return w(this.result.root, this.result);
      } catch (b) {
        throw this.handleError(b);
      }
    }
    stringify() {
      if (this.error) throw this.error;
      if (this.stringified) return this.result;
      this.stringified = !0, this.sync();
      let w = this.result.opts, b = n;
      w.syntax && (b = w.syntax.stringify), w.stringifier && (b = w.stringifier), b.stringify && (b = b.stringify);
      let M = new r(b, this.result.root, this.result.opts).generate();
      return this.result.css = M[0], this.result.map = M[1], this.result;
    }
    sync() {
      if (this.error) throw this.error;
      if (this.processed) return this.result;
      if (this.processed = !0, this.processing)
        throw this.getAsyncError();
      for (let w of this.plugins) {
        let b = this.runOnRoot(w);
        if (m(b))
          throw this.getAsyncError();
      }
      if (this.prepareVisitors(), this.hasListener) {
        let w = this.result.root;
        for (; !w[e]; )
          w[e] = !0, this.walkSync(w);
        if (this.listeners.OnceExit)
          if (w.type === "document")
            for (let b of w.nodes)
              this.visitSync(this.listeners.OnceExit, b);
          else
            this.visitSync(this.listeners.OnceExit, w);
      }
      return this.result;
    }
    then(w, b) {
      return process.env.NODE_ENV !== "production" && ("from" in this.opts || l(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(w, b);
    }
    toString() {
      return this.css;
    }
    visitSync(w, b) {
      for (let [S, M] of w) {
        this.result.lastPlugin = S;
        let I;
        try {
          I = M(b, this.helpers);
        } catch (R) {
          throw this.handleError(R, b.proxyOf);
        }
        if (b.type !== "root" && b.type !== "document" && !b.parent)
          return !0;
        if (m(I))
          throw this.getAsyncError();
      }
    }
    visitTick(w) {
      let b = w[w.length - 1], { node: S, visitors: M } = b;
      if (S.type !== "root" && S.type !== "document" && !S.parent) {
        w.pop();
        return;
      }
      if (M.length > 0 && b.visitorIndex < M.length) {
        let [R, j] = M[b.visitorIndex];
        b.visitorIndex += 1, b.visitorIndex === M.length && (b.visitors = [], b.visitorIndex = 0), this.result.lastPlugin = R;
        try {
          return j(S.toProxy(), this.helpers);
        } catch (z) {
          throw this.handleError(z, S);
        }
      }
      if (b.iterator !== 0) {
        let R = b.iterator, j;
        for (; j = S.nodes[S.indexes[R]]; )
          if (S.indexes[R] += 1, !j[e]) {
            j[e] = !0, w.push(g(j));
            return;
          }
        b.iterator = 0, delete S.indexes[R];
      }
      let I = b.events;
      for (; b.eventIndex < I.length; ) {
        let R = I[b.eventIndex];
        if (b.eventIndex += 1, R === c) {
          S.nodes && S.nodes.length && (S[e] = !0, b.iterator = S.getIterator());
          return;
        } else if (this.listeners[R]) {
          b.visitors = this.listeners[R];
          return;
        }
      }
      w.pop();
    }
    walkSync(w) {
      w[e] = !0;
      let b = f(w);
      for (let S of b)
        if (S === c)
          w.nodes && w.each((M) => {
            M[e] || this.walkSync(M);
          });
        else {
          let M = this.listeners[S];
          if (M && this.visitSync(M, w.toProxy()))
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
  return y.registerPostcss = (x) => {
    v = x;
  }, Fn = y, y.default = y, p.registerLazyResult(y), o.registerLazyResult(y), Fn;
}
var Un, ao;
function Sp() {
  if (ao) return Un;
  ao = 1;
  let e = Ha(), t = Zr(), r = Va(), n = Wi();
  const i = Ui();
  class o {
    constructor(d, a, p) {
      a = a.toString(), this.stringified = !1, this._processor = d, this._css = a, this._opts = p, this._map = void 0;
      let s, h = t;
      this.result = new i(this._processor, s, this._opts), this.result.css = a;
      let u = this;
      Object.defineProperty(this.result, "root", {
        get() {
          return u.root;
        }
      });
      let c = new e(h, s, this._opts, a);
      if (c.isMap()) {
        let [m, f] = c.generate();
        m && (this.result.css = m), f && (this.result.map = f);
      } else
        c.clearAnnotation(), this.result.css = c.css;
    }
    async() {
      return this.error ? Promise.reject(this.error) : Promise.resolve(this.result);
    }
    catch(d) {
      return this.async().catch(d);
    }
    finally(d) {
      return this.async().then(d, d);
    }
    sync() {
      if (this.error) throw this.error;
      return this.result;
    }
    then(d, a) {
      return process.env.NODE_ENV !== "production" && ("from" in this._opts || r(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(d, a);
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
      let d, a = n;
      try {
        d = a(this._css, this._opts);
      } catch (p) {
        this.error = p;
      }
      if (this.error)
        throw this.error;
      return this._root = d, d;
    }
    get [Symbol.toStringTag]() {
      return "NoWorkResult";
    }
  }
  return Un = o, o.default = o, Un;
}
var Bn, lo;
function Cp() {
  if (lo) return Bn;
  lo = 1;
  let e = Sp(), t = Xa(), r = Fi(), n = fr();
  class i {
    constructor(l = []) {
      this.version = "8.4.38", this.plugins = this.normalize(l);
    }
    normalize(l) {
      let d = [];
      for (let a of l)
        if (a.postcss === !0 ? a = a() : a.postcss && (a = a.postcss), typeof a == "object" && Array.isArray(a.plugins))
          d = d.concat(a.plugins);
        else if (typeof a == "object" && a.postcssPlugin)
          d.push(a);
        else if (typeof a == "function")
          d.push(a);
        else if (typeof a == "object" && (a.parse || a.stringify)) {
          if (process.env.NODE_ENV !== "production")
            throw new Error(
              "PostCSS syntaxes cannot be used as plugins. Instead, please use one of the syntax/parser/stringifier options as outlined in your PostCSS runner documentation."
            );
        } else
          throw new Error(a + " is not a PostCSS plugin");
      return d;
    }
    process(l, d = {}) {
      return !this.plugins.length && !d.parser && !d.stringifier && !d.syntax ? new e(this, l, d) : new t(this, l, d);
    }
    use(l) {
      return this.plugins = this.plugins.concat(this.normalize([l])), this;
    }
  }
  return Bn = i, i.default = i, n.registerProcessor(i), r.registerProcessor(i), Bn;
}
var qn, co;
function Ep() {
  if (co) return qn;
  co = 1;
  let e = en(), t = ja(), r = rn(), n = Bi(), i = tn(), o = fr(), l = qi();
  function d(a, p) {
    if (Array.isArray(a)) return a.map((u) => d(u));
    let { inputs: s, ...h } = a;
    if (s) {
      p = [];
      for (let u of s) {
        let c = { ...u, __proto__: i.prototype };
        c.map && (c.map = {
          ...c.map,
          __proto__: t.prototype
        }), p.push(c);
      }
    }
    if (h.nodes && (h.nodes = a.nodes.map((u) => d(u, p))), h.source) {
      let { inputId: u, ...c } = h.source;
      h.source = c, u != null && (h.source.input = p[u]);
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
  return qn = d, d.default = d, qn;
}
var Wn, uo;
function Mp() {
  if (uo) return Wn;
  uo = 1;
  let e = Di(), t = en(), r = Xa(), n = Ot(), i = Cp(), o = Zr(), l = Ep(), d = Fi(), a = Ya(), p = rn(), s = Bi(), h = Ui(), u = tn(), c = Wi(), m = Ga(), f = qi(), g = fr(), k = Qr();
  function v(...y) {
    return y.length === 1 && Array.isArray(y[0]) && (y = y[0]), new i(y);
  }
  return v.plugin = function(x, w) {
    let b = !1;
    function S(...I) {
      console && console.warn && !b && (b = !0, console.warn(
        x + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`
      ), process.env.LANG && process.env.LANG.startsWith("cn") && console.warn(
        x + `: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`
      ));
      let R = w(...I);
      return R.postcssPlugin = x, R.postcssVersion = new i().version, R;
    }
    let M;
    return Object.defineProperty(S, "postcss", {
      get() {
        return M || (M = S()), M;
      }
    }), S.process = function(I, R, j) {
      return v([S(j)]).process(I, R);
    }, S;
  }, v.stringify = o, v.parse = c, v.fromJSON = l, v.list = m, v.comment = (y) => new p(y), v.atRule = (y) => new s(y), v.decl = (y) => new t(y), v.rule = (y) => new f(y), v.root = (y) => new g(y), v.document = (y) => new d(y), v.CssSyntaxError = e, v.Declaration = t, v.Container = n, v.Processor = i, v.Document = d, v.Comment = p, v.Warning = a, v.AtRule = s, v.Result = h, v.Input = u, v.Rule = f, v.Root = g, v.Node = k, r.registerPostcss(v), Wn = v, v.default = v, Wn;
}
var Rp = Mp();
const de = /* @__PURE__ */ mp(Rp);
de.stringify;
de.fromJSON;
de.plugin;
de.parse;
de.list;
de.document;
de.comment;
de.atRule;
de.rule;
de.decl;
de.root;
de.CssSyntaxError;
de.Declaration;
de.Container;
de.Processor;
de.Document;
de.Comment;
de.Warning;
de.AtRule;
de.Result;
de.Input;
de.Rule;
de.Root;
de.Node;
var Ap = Object.defineProperty, Ip = (e, t, r) => t in e ? Ap(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, Be = (e, t, r) => Ip(e, typeof t != "symbol" ? t + "" : t, r);
Date.now().toString();
function Op(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function Lp(e) {
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
var Ar = { exports: {} }, po;
function Tp() {
  if (po) return Ar.exports;
  po = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return Ar.exports = t(), Ar.exports.createColors = t, Ar.exports;
}
const Np = {}, Pp = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Np
}, Symbol.toStringTag, { value: "Module" })), Je = /* @__PURE__ */ Lp(Pp);
var jn, ho;
function ji() {
  if (ho) return jn;
  ho = 1;
  let e = /* @__PURE__ */ Tp(), t = Je;
  class r extends Error {
    constructor(i, o, l, d, a, p) {
      super(i), this.name = "CssSyntaxError", this.reason = i, a && (this.file = a), d && (this.source = d), p && (this.plugin = p), typeof o < "u" && typeof l < "u" && (typeof o == "number" ? (this.line = o, this.column = l) : (this.line = o.line, this.column = o.column, this.endLine = l.line, this.endColumn = l.column)), this.setMessage(), Error.captureStackTrace && Error.captureStackTrace(this, r);
    }
    setMessage() {
      this.message = this.plugin ? this.plugin + ": " : "", this.message += this.file ? this.file : "<css input>", typeof this.line < "u" && (this.message += ":" + this.line + ":" + this.column), this.message += ": " + this.reason;
    }
    showSourceCode(i) {
      if (!this.source) return "";
      let o = this.source;
      i == null && (i = e.isColorSupported), t && i && (o = t(o));
      let l = o.split(/\r?\n/), d = Math.max(this.line - 3, 0), a = Math.min(this.line + 2, l.length), p = String(a).length, s, h;
      if (i) {
        let { bold: u, gray: c, red: m } = e.createColors(!0);
        s = (f) => u(m(f)), h = (f) => c(f);
      } else
        s = h = (u) => u;
      return l.slice(d, a).map((u, c) => {
        let m = d + 1 + c, f = " " + (" " + m).slice(-p) + " | ";
        if (m === this.line) {
          let g = h(f.replace(/\d/g, " ")) + u.slice(0, this.column - 1).replace(/[^\t]/g, " ");
          return s(">") + h(f) + u + `
 ` + g + s("^");
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
  return jn = r, r.default = r, jn;
}
var Ir = {}, fo;
function Hi() {
  return fo || (fo = 1, Ir.isClean = Symbol("isClean"), Ir.my = Symbol("my")), Ir;
}
var Hn, mo;
function Ka() {
  if (mo) return Hn;
  mo = 1;
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
      let l = "@" + i.name, d = i.params ? this.rawValue(i, "params") : "";
      if (typeof i.raws.afterName < "u" ? l += i.raws.afterName : d && (l += " "), i.nodes)
        this.block(i, l + d);
      else {
        let a = (i.raws.between || "") + (o ? ";" : "");
        this.builder(l + d + a, i);
      }
    }
    beforeAfter(i, o) {
      let l;
      i.type === "decl" ? l = this.raw(i, null, "beforeDecl") : i.type === "comment" ? l = this.raw(i, null, "beforeComment") : o === "before" ? l = this.raw(i, null, "beforeRule") : l = this.raw(i, null, "beforeClose");
      let d = i.parent, a = 0;
      for (; d && d.type !== "root"; )
        a += 1, d = d.parent;
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
      let d;
      i.nodes && i.nodes.length ? (this.body(i), d = this.raw(i, "after")) : d = this.raw(i, "after", "emptyBody"), d && this.builder(d), this.builder("}", i, "end");
    }
    body(i) {
      let o = i.nodes.length - 1;
      for (; o > 0 && i.nodes[o].type === "comment"; )
        o -= 1;
      let l = this.raw(i, "semicolon");
      for (let d = 0; d < i.nodes.length; d++) {
        let a = i.nodes[d], p = this.raw(a, "before");
        p && this.builder(p), this.stringify(a, o !== d || l);
      }
    }
    comment(i) {
      let o = this.raw(i, "left", "commentLeft"), l = this.raw(i, "right", "commentRight");
      this.builder("/*" + o + i.text + l + "*/", i);
    }
    decl(i, o) {
      let l = this.raw(i, "between", "colon"), d = i.prop + l + this.rawValue(i, "value");
      i.important && (d += i.raws.important || " !important"), o && (d += ";"), this.builder(d, i);
    }
    document(i) {
      this.body(i);
    }
    raw(i, o, l) {
      let d;
      if (l || (l = o), o && (d = i.raws[o], typeof d < "u"))
        return d;
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
        this[s] ? d = this[s](p, i) : p.walk((h) => {
          if (d = h.raws[o], typeof d < "u") return !1;
        });
      }
      return typeof d > "u" && (d = e[l]), p.rawCache[l] = d, d;
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
      return i.walkComments((d) => {
        if (typeof d.raws.before < "u")
          return l = d.raws.before, l.includes(`
`) && (l = l.replace(/[^\n]+$/, "")), !1;
      }), typeof l > "u" ? l = this.raw(o, null, "beforeDecl") : l && (l = l.replace(/\S/g, "")), l;
    }
    rawBeforeDecl(i, o) {
      let l;
      return i.walkDecls((d) => {
        if (typeof d.raws.before < "u")
          return l = d.raws.before, l.includes(`
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
        let d = l.parent;
        if (d && d !== i && d.parent && d.parent === i && typeof l.raws.before < "u") {
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
      let l = i[o], d = i.raws[o];
      return d && d.value === l ? d.raw : l;
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
  return Hn = r, r.default = r, Hn;
}
var Vn, go;
function nn() {
  if (go) return Vn;
  go = 1;
  let e = Ka();
  function t(r, n) {
    new e(n).stringify(r);
  }
  return Vn = t, t.default = t, Vn;
}
var Yn, yo;
function sn() {
  if (yo) return Yn;
  yo = 1;
  let { isClean: e, my: t } = Hi(), r = ji(), n = Ka(), i = nn();
  function o(d, a) {
    let p = new d.constructor();
    for (let s in d) {
      if (!Object.prototype.hasOwnProperty.call(d, s) || s === "proxyCache") continue;
      let h = d[s], u = typeof h;
      s === "parent" && u === "object" ? a && (p[s] = a) : s === "source" ? p[s] = h : Array.isArray(h) ? p[s] = h.map((c) => o(c, p)) : (u === "object" && h !== null && (h = o(h)), p[s] = h);
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
      let s = p || this.toString(), h = this.source.start.column, u = this.source.start.line;
      for (let c = 0; c < a; c++)
        s[c] === `
` ? (h = 1, u += 1) : h += 1;
      return { column: h, line: u };
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
        let h = this.toString(), u = h.indexOf(a.word);
        u !== -1 && (p = this.positionInside(u, h), s = this.positionInside(u + a.word.length, h));
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
      let u = 0;
      for (let c in this) {
        if (!Object.prototype.hasOwnProperty.call(this, c) || c === "parent" || c === "proxyCache") continue;
        let m = this[c];
        if (Array.isArray(m))
          s[c] = m.map((f) => typeof f == "object" && f.toJSON ? f.toJSON(null, p) : f);
        else if (typeof m == "object" && m.toJSON)
          s[c] = m.toJSON(null, p);
        else if (c === "source") {
          let f = p.get(m.input);
          f == null && (f = u, p.set(m.input, u), u++), s[c] = {
            end: m.end,
            inputId: f,
            start: m.start
          };
        } else
          s[c] = m;
      }
      return h && (s.inputs = [...p.keys()].map((c) => c.toJSON())), s;
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
      for (let u in s) h[u] = s[u];
      return a.warn(p, h);
    }
    get proxyOf() {
      return this;
    }
  }
  return Yn = l, l.default = l, Yn;
}
var Gn, bo;
function on() {
  if (bo) return Gn;
  bo = 1;
  let e = sn();
  class t extends e {
    constructor(n) {
      n && typeof n.value < "u" && typeof n.value != "string" && (n = { ...n, value: String(n.value) }), super(n), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return Gn = t, t.default = t, Gn;
}
var Xn, vo;
function _p() {
  if (vo) return Xn;
  vo = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return Xn = { nanoid: (n = 21) => {
    let i = "", o = n;
    for (; o--; )
      i += e[Math.random() * 64 | 0];
    return i;
  }, customAlphabet: (n, i = 21) => (o = i) => {
    let l = "", d = o;
    for (; d--; )
      l += n[Math.random() * n.length | 0];
    return l;
  } }, Xn;
}
var Kn, wo;
function Ja() {
  if (wo) return Kn;
  wo = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Je, { existsSync: r, readFileSync: n } = Je, { dirname: i, join: o } = Je;
  function l(a) {
    return Buffer ? Buffer.from(a, "base64").toString() : window.atob(a);
  }
  class d {
    constructor(p, s) {
      if (s.map === !1) return;
      this.loadAnnotation(p), this.inline = this.startWith(this.annotation, "data:");
      let h = s.map ? s.map.prev : void 0, u = this.loadMap(s.from, h);
      !this.mapFile && s.from && (this.mapFile = s.from), this.mapFile && (this.root = i(this.mapFile)), u && (this.text = u);
    }
    consumer() {
      return this.consumerCache || (this.consumerCache = new e(this.text)), this.consumerCache;
    }
    decodeInline(p) {
      let s = /^data:application\/json;charset=utf-?8;base64,/, h = /^data:application\/json;base64,/, u = /^data:application\/json;charset=utf-?8,/, c = /^data:application\/json,/;
      if (u.test(p) || c.test(p))
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
      let h = p.lastIndexOf(s.pop()), u = p.indexOf("*/", h);
      h > -1 && u > -1 && (this.annotation = this.getAnnotationURL(p.substring(h, u)));
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
            let u = this.loadFile(h);
            if (!u)
              throw new Error(
                "Unable to load previous source map: " + h.toString()
              );
            return u;
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
  return Kn = d, d.default = d, Kn;
}
var Jn, ko;
function an() {
  if (ko) return Jn;
  ko = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Je, { fileURLToPath: r, pathToFileURL: n } = Je, { isAbsolute: i, resolve: o } = Je, { nanoid: l } = /* @__PURE__ */ _p(), d = Je, a = ji(), p = Ja(), s = Symbol("fromOffsetCache"), h = !!(e && t), u = !!(o && i);
  class c {
    constructor(f, g = {}) {
      if (f === null || typeof f > "u" || typeof f == "object" && !f.toString)
        throw new Error(`PostCSS received ${f} instead of CSS string`);
      if (this.css = f.toString(), this.css[0] === "\uFEFF" || this.css[0] === "￾" ? (this.hasBOM = !0, this.css = this.css.slice(1)) : this.hasBOM = !1, g.from && (!u || /^\w+:\/\//.test(g.from) || i(g.from) ? this.file = g.from : this.file = o(g.from)), u && h) {
        let k = new p(this.css, g);
        if (k.text) {
          this.map = k;
          let v = k.consumer().file;
          !this.file && v && (this.file = this.mapResolve(v));
        }
      }
      this.file || (this.id = "<input css " + l(6) + ">"), this.map && (this.map.file = this.from);
    }
    error(f, g, k, v = {}) {
      let y, x, w;
      if (g && typeof g == "object") {
        let S = g, M = k;
        if (typeof S.offset == "number") {
          let I = this.fromOffset(S.offset);
          g = I.line, k = I.col;
        } else
          g = S.line, k = S.column;
        if (typeof M.offset == "number") {
          let I = this.fromOffset(M.offset);
          x = I.line, w = I.col;
        } else
          x = M.line, w = M.column;
      } else if (!k) {
        let S = this.fromOffset(g);
        g = S.line, k = S.col;
      }
      let b = this.origin(g, k, x, w);
      return b ? y = new a(
        f,
        b.endLine === void 0 ? b.line : { column: b.column, line: b.line },
        b.endLine === void 0 ? b.column : { column: b.endColumn, line: b.endLine },
        b.source,
        b.file,
        v.plugin
      ) : y = new a(
        f,
        x === void 0 ? g : { column: k, line: g },
        x === void 0 ? k : { column: w, line: x },
        this.css,
        this.file,
        v.plugin
      ), y.input = { column: k, endColumn: w, endLine: x, line: g, source: this.css }, this.file && (n && (y.input.url = n(this.file).toString()), y.input.file = this.file), y;
    }
    fromOffset(f) {
      let g, k;
      if (this[s])
        k = this[s];
      else {
        let y = this.css.split(`
`);
        k = new Array(y.length);
        let x = 0;
        for (let w = 0, b = y.length; w < b; w++)
          k[w] = x, x += y[w].length + 1;
        this[s] = k;
      }
      g = k[k.length - 1];
      let v = 0;
      if (f >= g)
        v = k.length - 1;
      else {
        let y = k.length - 2, x;
        for (; v < y; )
          if (x = v + (y - v >> 1), f < k[x])
            y = x - 1;
          else if (f >= k[x + 1])
            v = x + 1;
          else {
            v = x;
            break;
          }
      }
      return {
        col: f - k[v] + 1,
        line: v + 1
      };
    }
    mapResolve(f) {
      return /^\w+:\/\//.test(f) ? f : o(this.map.consumer().sourceRoot || this.map.root || ".", f);
    }
    origin(f, g, k, v) {
      if (!this.map) return !1;
      let y = this.map.consumer(), x = y.originalPositionFor({ column: g, line: f });
      if (!x.source) return !1;
      let w;
      typeof k == "number" && (w = y.originalPositionFor({ column: v, line: k }));
      let b;
      i(x.source) ? b = n(x.source) : b = new URL(
        x.source,
        this.map.consumer().sourceRoot || n(this.map.mapFile)
      );
      let S = {
        column: x.column,
        endColumn: w && w.column,
        endLine: w && w.line,
        line: x.line,
        url: b.toString()
      };
      if (b.protocol === "file:")
        if (r)
          S.file = r(b);
        else
          throw new Error("file: protocol is not available in this PostCSS build");
      let M = y.sourceContentFor(x.source);
      return M && (S.source = M), S;
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
  return Jn = c, c.default = c, d && d.registerInput && d.registerInput(c), Jn;
}
var Zn, xo;
function Za() {
  if (xo) return Zn;
  xo = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Je, { dirname: r, relative: n, resolve: i, sep: o } = Je, { pathToFileURL: l } = Je, d = an(), a = !!(e && t), p = !!(r && i && n && o);
  class s {
    constructor(u, c, m, f) {
      this.stringify = u, this.mapOpts = m.map || {}, this.root = c, this.opts = m, this.css = f, this.originalCSS = f, this.usesFileUrls = !this.mapOpts.from && this.mapOpts.absolute, this.memoizedFileURLs = /* @__PURE__ */ new Map(), this.memoizedPaths = /* @__PURE__ */ new Map(), this.memoizedURLs = /* @__PURE__ */ new Map();
    }
    addAnnotation() {
      let u;
      this.isInline() ? u = "data:application/json;base64," + this.toBase64(this.map.toString()) : typeof this.mapOpts.annotation == "string" ? u = this.mapOpts.annotation : typeof this.mapOpts.annotation == "function" ? u = this.mapOpts.annotation(this.opts.to, this.root) : u = this.outputFile() + ".map";
      let c = `
`;
      this.css.includes(`\r
`) && (c = `\r
`), this.css += c + "/*# sourceMappingURL=" + u + " */";
    }
    applyPrevMaps() {
      for (let u of this.previous()) {
        let c = this.toUrl(this.path(u.file)), m = u.root || r(u.file), f;
        this.mapOpts.sourcesContent === !1 ? (f = new e(u.text), f.sourcesContent && (f.sourcesContent = null)) : f = u.consumer(), this.map.applySourceMap(f, c, this.toUrl(this.path(m)));
      }
    }
    clearAnnotation() {
      if (this.mapOpts.annotation !== !1)
        if (this.root) {
          let u;
          for (let c = this.root.nodes.length - 1; c >= 0; c--)
            u = this.root.nodes[c], u.type === "comment" && u.text.indexOf("# sourceMappingURL=") === 0 && this.root.removeChild(c);
        } else this.css && (this.css = this.css.replace(/\n*?\/\*#[\S\s]*?\*\/$/gm, ""));
    }
    generate() {
      if (this.clearAnnotation(), p && a && this.isMap())
        return this.generateMap();
      {
        let u = "";
        return this.stringify(this.root, (c) => {
          u += c;
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
      let u = 1, c = 1, m = "<no source>", f = {
        generated: { column: 0, line: 0 },
        original: { column: 0, line: 0 },
        source: ""
      }, g, k;
      this.stringify(this.root, (v, y, x) => {
        if (this.css += v, y && x !== "end" && (f.generated.line = u, f.generated.column = c - 1, y.source && y.source.start ? (f.source = this.sourcePath(y), f.original.line = y.source.start.line, f.original.column = y.source.start.column - 1, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, this.map.addMapping(f))), g = v.match(/\n/g), g ? (u += g.length, k = v.lastIndexOf(`
`), c = v.length - k) : c += v.length, y && x !== "start") {
          let w = y.parent || { raws: {} };
          (!(y.type === "decl" || y.type === "atrule" && !y.nodes) || y !== w.last || w.raws.semicolon) && (y.source && y.source.end ? (f.source = this.sourcePath(y), f.original.line = y.source.end.line, f.original.column = y.source.end.column - 1, f.generated.line = u, f.generated.column = c - 2, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, f.generated.line = u, f.generated.column = c - 1, this.map.addMapping(f)));
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
      return typeof u < "u" && u !== !0 ? !1 : this.previous().length ? this.previous().some((c) => c.inline) : !0;
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
      let c = this.memoizedPaths.get(u);
      if (c) return c;
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
              let c = u.source.input.map;
              this.previousMaps.includes(c) || this.previousMaps.push(c);
            }
          });
        else {
          let u = new d(this.originalCSS, this.opts);
          u.map && this.previousMaps.push(u.map);
        }
      return this.previousMaps;
    }
    setSourcesContent() {
      let u = {};
      if (this.root)
        this.root.walk((c) => {
          if (c.source) {
            let m = c.source.input.from;
            if (m && !u[m]) {
              u[m] = !0;
              let f = this.usesFileUrls ? this.toFileUrl(m) : this.toUrl(this.path(m));
              this.map.setSourceContent(f, c.source.input.css);
            }
          }
        });
      else if (this.css) {
        let c = this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>";
        this.map.setSourceContent(c, this.css);
      }
    }
    sourcePath(u) {
      return this.mapOpts.from ? this.toUrl(this.mapOpts.from) : this.usesFileUrls ? this.toFileUrl(u.source.input.from) : this.toUrl(this.path(u.source.input.from));
    }
    toBase64(u) {
      return Buffer ? Buffer.from(u).toString("base64") : window.btoa(unescape(encodeURIComponent(u)));
    }
    toFileUrl(u) {
      let c = this.memoizedFileURLs.get(u);
      if (c) return c;
      if (l) {
        let m = l(u).toString();
        return this.memoizedFileURLs.set(u, m), m;
      } else
        throw new Error(
          "`map.absolute` option is not available in this PostCSS build"
        );
    }
    toUrl(u) {
      let c = this.memoizedURLs.get(u);
      if (c) return c;
      o === "\\" && (u = u.replace(/\\/g, "/"));
      let m = encodeURI(u).replace(/[#?]/g, encodeURIComponent);
      return this.memoizedURLs.set(u, m), m;
    }
  }
  return Zn = s, Zn;
}
var Qn, So;
function ln() {
  if (So) return Qn;
  So = 1;
  let e = sn();
  class t extends e {
    constructor(n) {
      super(n), this.type = "comment";
    }
  }
  return Qn = t, t.default = t, Qn;
}
var ei, Co;
function Lt() {
  if (Co) return ei;
  Co = 1;
  let { isClean: e, my: t } = Hi(), r = on(), n = ln(), i = sn(), o, l, d, a;
  function p(u) {
    return u.map((c) => (c.nodes && (c.nodes = p(c.nodes)), delete c.source, c));
  }
  function s(u) {
    if (u[e] = !1, u.proxyOf.nodes)
      for (let c of u.proxyOf.nodes)
        s(c);
  }
  class h extends i {
    append(...c) {
      for (let m of c) {
        let f = this.normalize(m, this.last);
        for (let g of f) this.proxyOf.nodes.push(g);
      }
      return this.markDirty(), this;
    }
    cleanRaws(c) {
      if (super.cleanRaws(c), this.nodes)
        for (let m of this.nodes) m.cleanRaws(c);
    }
    each(c) {
      if (!this.proxyOf.nodes) return;
      let m = this.getIterator(), f, g;
      for (; this.indexes[m] < this.proxyOf.nodes.length && (f = this.indexes[m], g = c(this.proxyOf.nodes[f], f), g !== !1); )
        this.indexes[m] += 1;
      return delete this.indexes[m], g;
    }
    every(c) {
      return this.nodes.every(c);
    }
    getIterator() {
      this.lastEach || (this.lastEach = 0), this.indexes || (this.indexes = {}), this.lastEach += 1;
      let c = this.lastEach;
      return this.indexes[c] = 0, c;
    }
    getProxyProcessor() {
      return {
        get(c, m) {
          return m === "proxyOf" ? c : c[m] ? m === "each" || typeof m == "string" && m.startsWith("walk") ? (...f) => c[m](
            ...f.map((g) => typeof g == "function" ? (k, v) => g(k.toProxy(), v) : g)
          ) : m === "every" || m === "some" ? (f) => c[m](
            (g, ...k) => f(g.toProxy(), ...k)
          ) : m === "root" ? () => c.root().toProxy() : m === "nodes" ? c.nodes.map((f) => f.toProxy()) : m === "first" || m === "last" ? c[m].toProxy() : c[m] : c[m];
        },
        set(c, m, f) {
          return c[m] === f || (c[m] = f, (m === "name" || m === "params" || m === "selector") && c.markDirty()), !0;
        }
      };
    }
    index(c) {
      return typeof c == "number" ? c : (c.proxyOf && (c = c.proxyOf), this.proxyOf.nodes.indexOf(c));
    }
    insertAfter(c, m) {
      let f = this.index(c), g = this.normalize(m, this.proxyOf.nodes[f]).reverse();
      f = this.index(c);
      for (let v of g) this.proxyOf.nodes.splice(f + 1, 0, v);
      let k;
      for (let v in this.indexes)
        k = this.indexes[v], f < k && (this.indexes[v] = k + g.length);
      return this.markDirty(), this;
    }
    insertBefore(c, m) {
      let f = this.index(c), g = f === 0 ? "prepend" : !1, k = this.normalize(m, this.proxyOf.nodes[f], g).reverse();
      f = this.index(c);
      for (let y of k) this.proxyOf.nodes.splice(f, 0, y);
      let v;
      for (let y in this.indexes)
        v = this.indexes[y], f <= v && (this.indexes[y] = v + k.length);
      return this.markDirty(), this;
    }
    normalize(c, m) {
      if (typeof c == "string")
        c = p(o(c).nodes);
      else if (typeof c > "u")
        c = [];
      else if (Array.isArray(c)) {
        c = c.slice(0);
        for (let g of c)
          g.parent && g.parent.removeChild(g, "ignore");
      } else if (c.type === "root" && this.type !== "document") {
        c = c.nodes.slice(0);
        for (let g of c)
          g.parent && g.parent.removeChild(g, "ignore");
      } else if (c.type)
        c = [c];
      else if (c.prop) {
        if (typeof c.value > "u")
          throw new Error("Value field is missed in node creation");
        typeof c.value != "string" && (c.value = String(c.value)), c = [new r(c)];
      } else if (c.selector)
        c = [new l(c)];
      else if (c.name)
        c = [new d(c)];
      else if (c.text)
        c = [new n(c)];
      else
        throw new Error("Unknown node type in node creation");
      return c.map((g) => (g[t] || h.rebuild(g), g = g.proxyOf, g.parent && g.parent.removeChild(g), g[e] && s(g), typeof g.raws.before > "u" && m && typeof m.raws.before < "u" && (g.raws.before = m.raws.before.replace(/\S/g, "")), g.parent = this.proxyOf, g));
    }
    prepend(...c) {
      c = c.reverse();
      for (let m of c) {
        let f = this.normalize(m, this.first, "prepend").reverse();
        for (let g of f) this.proxyOf.nodes.unshift(g);
        for (let g in this.indexes)
          this.indexes[g] = this.indexes[g] + f.length;
      }
      return this.markDirty(), this;
    }
    push(c) {
      return c.parent = this, this.proxyOf.nodes.push(c), this;
    }
    removeAll() {
      for (let c of this.proxyOf.nodes) c.parent = void 0;
      return this.proxyOf.nodes = [], this.markDirty(), this;
    }
    removeChild(c) {
      c = this.index(c), this.proxyOf.nodes[c].parent = void 0, this.proxyOf.nodes.splice(c, 1);
      let m;
      for (let f in this.indexes)
        m = this.indexes[f], m >= c && (this.indexes[f] = m - 1);
      return this.markDirty(), this;
    }
    replaceValues(c, m, f) {
      return f || (f = m, m = {}), this.walkDecls((g) => {
        m.props && !m.props.includes(g.prop) || m.fast && !g.value.includes(m.fast) || (g.value = g.value.replace(c, f));
      }), this.markDirty(), this;
    }
    some(c) {
      return this.nodes.some(c);
    }
    walk(c) {
      return this.each((m, f) => {
        let g;
        try {
          g = c(m, f);
        } catch (k) {
          throw m.addToError(k);
        }
        return g !== !1 && m.walk && (g = m.walk(c)), g;
      });
    }
    walkAtRules(c, m) {
      return m ? c instanceof RegExp ? this.walk((f, g) => {
        if (f.type === "atrule" && c.test(f.name))
          return m(f, g);
      }) : this.walk((f, g) => {
        if (f.type === "atrule" && f.name === c)
          return m(f, g);
      }) : (m = c, this.walk((f, g) => {
        if (f.type === "atrule")
          return m(f, g);
      }));
    }
    walkComments(c) {
      return this.walk((m, f) => {
        if (m.type === "comment")
          return c(m, f);
      });
    }
    walkDecls(c, m) {
      return m ? c instanceof RegExp ? this.walk((f, g) => {
        if (f.type === "decl" && c.test(f.prop))
          return m(f, g);
      }) : this.walk((f, g) => {
        if (f.type === "decl" && f.prop === c)
          return m(f, g);
      }) : (m = c, this.walk((f, g) => {
        if (f.type === "decl")
          return m(f, g);
      }));
    }
    walkRules(c, m) {
      return m ? c instanceof RegExp ? this.walk((f, g) => {
        if (f.type === "rule" && c.test(f.selector))
          return m(f, g);
      }) : this.walk((f, g) => {
        if (f.type === "rule" && f.selector === c)
          return m(f, g);
      }) : (m = c, this.walk((f, g) => {
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
  return h.registerParse = (u) => {
    o = u;
  }, h.registerRule = (u) => {
    l = u;
  }, h.registerAtRule = (u) => {
    d = u;
  }, h.registerRoot = (u) => {
    a = u;
  }, ei = h, h.default = h, h.rebuild = (u) => {
    u.type === "atrule" ? Object.setPrototypeOf(u, d.prototype) : u.type === "rule" ? Object.setPrototypeOf(u, l.prototype) : u.type === "decl" ? Object.setPrototypeOf(u, r.prototype) : u.type === "comment" ? Object.setPrototypeOf(u, n.prototype) : u.type === "root" && Object.setPrototypeOf(u, a.prototype), u[t] = !0, u.nodes && u.nodes.forEach((c) => {
      h.rebuild(c);
    });
  }, ei;
}
var ti, Eo;
function Vi() {
  if (Eo) return ti;
  Eo = 1;
  let e = Lt(), t, r;
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
  }, ti = n, n.default = n, ti;
}
var ri, Mo;
function Qa() {
  if (Mo) return ri;
  Mo = 1;
  let e = {};
  return ri = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, ri;
}
var ni, Ro;
function el() {
  if (Ro) return ni;
  Ro = 1;
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
  return ni = e, e.default = e, ni;
}
var ii, Ao;
function Yi() {
  if (Ao) return ii;
  Ao = 1;
  let e = el();
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
  return ii = t, t.default = t, ii;
}
var si, Io;
function $p() {
  if (Io) return si;
  Io = 1;
  const e = 39, t = 34, r = 92, n = 47, i = 10, o = 32, l = 12, d = 9, a = 13, p = 91, s = 93, h = 40, u = 41, c = 123, m = 125, f = 59, g = 42, k = 58, v = 64, y = /[\t\n\f\r "#'()/;[\\\]{}]/g, x = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, w = /.[\r\n"'(/\\]/, b = /[\da-f]/i;
  return si = function(M, I = {}) {
    let R = M.css.valueOf(), j = I.ignoreErrors, z, E, Ne, be, ne, ie, he, ke, ce, Z, Ce = R.length, L = 0, Pe = [], Ee = [];
    function pt() {
      return L;
    }
    function oe(H) {
      throw M.error("Unclosed " + H, L);
    }
    function Se() {
      return Ee.length === 0 && L >= Ce;
    }
    function Me(H) {
      if (Ee.length) return Ee.pop();
      if (L >= Ce) return;
      let fe = H ? H.ignoreUnclosed : !1;
      switch (z = R.charCodeAt(L), z) {
        case i:
        case o:
        case d:
        case a:
        case l: {
          E = L;
          do
            E += 1, z = R.charCodeAt(E);
          while (z === o || z === i || z === d || z === a || z === l);
          Z = ["space", R.slice(L, E)], L = E - 1;
          break;
        }
        case p:
        case s:
        case c:
        case m:
        case k:
        case f:
        case u: {
          let Q = String.fromCharCode(z);
          Z = [Q, Q, L];
          break;
        }
        case h: {
          if (ke = Pe.length ? Pe.pop()[1] : "", ce = R.charCodeAt(L + 1), ke === "url" && ce !== e && ce !== t && ce !== o && ce !== i && ce !== d && ce !== l && ce !== a) {
            E = L;
            do {
              if (ie = !1, E = R.indexOf(")", E + 1), E === -1)
                if (j || fe) {
                  E = L;
                  break;
                } else
                  oe("bracket");
              for (he = E; R.charCodeAt(he - 1) === r; )
                he -= 1, ie = !ie;
            } while (ie);
            Z = ["brackets", R.slice(L, E + 1), L, E], L = E;
          } else
            E = R.indexOf(")", L + 1), be = R.slice(L, E + 1), E === -1 || w.test(be) ? Z = ["(", "(", L] : (Z = ["brackets", be, L, E], L = E);
          break;
        }
        case e:
        case t: {
          Ne = z === e ? "'" : '"', E = L;
          do {
            if (ie = !1, E = R.indexOf(Ne, E + 1), E === -1)
              if (j || fe) {
                E = L + 1;
                break;
              } else
                oe("string");
            for (he = E; R.charCodeAt(he - 1) === r; )
              he -= 1, ie = !ie;
          } while (ie);
          Z = ["string", R.slice(L, E + 1), L, E], L = E;
          break;
        }
        case v: {
          y.lastIndex = L + 1, y.test(R), y.lastIndex === 0 ? E = R.length - 1 : E = y.lastIndex - 2, Z = ["at-word", R.slice(L, E + 1), L, E], L = E;
          break;
        }
        case r: {
          for (E = L, ne = !0; R.charCodeAt(E + 1) === r; )
            E += 1, ne = !ne;
          if (z = R.charCodeAt(E + 1), ne && z !== n && z !== o && z !== i && z !== d && z !== a && z !== l && (E += 1, b.test(R.charAt(E)))) {
            for (; b.test(R.charAt(E + 1)); )
              E += 1;
            R.charCodeAt(E + 1) === o && (E += 1);
          }
          Z = ["word", R.slice(L, E + 1), L, E], L = E;
          break;
        }
        default: {
          z === n && R.charCodeAt(L + 1) === g ? (E = R.indexOf("*/", L + 2) + 1, E === 0 && (j || fe ? E = R.length : oe("comment")), Z = ["comment", R.slice(L, E + 1), L, E], L = E) : (x.lastIndex = L + 1, x.test(R), x.lastIndex === 0 ? E = R.length - 1 : E = x.lastIndex - 2, Z = ["word", R.slice(L, E + 1), L, E], Pe.push(Z), L = E);
          break;
        }
      }
      return L++, Z;
    }
    function We(H) {
      Ee.push(H);
    }
    return {
      back: We,
      endOfFile: Se,
      nextToken: Me,
      position: pt
    };
  }, si;
}
var oi, Oo;
function Gi() {
  if (Oo) return oi;
  Oo = 1;
  let e = Lt();
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
  return oi = t, t.default = t, e.registerAtRule(t), oi;
}
var ai, Lo;
function mr() {
  if (Lo) return ai;
  Lo = 1;
  let e = Lt(), t, r;
  class n extends e {
    constructor(o) {
      super(o), this.type = "root", this.nodes || (this.nodes = []);
    }
    normalize(o, l, d) {
      let a = super.normalize(o);
      if (l) {
        if (d === "prepend")
          this.nodes.length > 1 ? l.raws.before = this.nodes[1].raws.before : delete l.raws.before;
        else if (this.first !== l)
          for (let p of a)
            p.raws.before = l.raws.before;
      }
      return a;
    }
    removeChild(o, l) {
      let d = this.index(o);
      return !l && d === 0 && this.nodes.length > 1 && (this.nodes[1].raws.before = this.nodes[d].raws.before), super.removeChild(o);
    }
    toResult(o = {}) {
      return new t(new r(), this, o).stringify();
    }
  }
  return n.registerLazyResult = (i) => {
    t = i;
  }, n.registerProcessor = (i) => {
    r = i;
  }, ai = n, n.default = n, e.registerRoot(n), ai;
}
var li, To;
function tl() {
  if (To) return li;
  To = 1;
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
      let i = [], o = "", l = !1, d = 0, a = !1, p = "", s = !1;
      for (let h of t)
        s ? s = !1 : h === "\\" ? s = !0 : a ? h === p && (a = !1) : h === '"' || h === "'" ? (a = !0, p = h) : h === "(" ? d += 1 : h === ")" ? d > 0 && (d -= 1) : d === 0 && r.includes(h) && (l = !0), l ? (o !== "" && i.push(o.trim()), o = "", l = !1) : o += h;
      return (n || o !== "") && i.push(o.trim()), i;
    }
  };
  return li = e, e.default = e, li;
}
var ci, No;
function Xi() {
  if (No) return ci;
  No = 1;
  let e = Lt(), t = tl();
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
  return ci = r, r.default = r, e.registerRule(r), ci;
}
var ui, Po;
function Dp() {
  if (Po) return ui;
  Po = 1;
  let e = on(), t = $p(), r = ln(), n = Gi(), i = mr(), o = Xi();
  const l = {
    empty: !0,
    space: !0
  };
  function d(p) {
    for (let s = p.length - 1; s >= 0; s--) {
      let h = p[s], u = h[3] || h[2];
      if (u) return u;
    }
  }
  class a {
    constructor(s) {
      this.input = s, this.root = new i(), this.current = this.root, this.spaces = "", this.semicolon = !1, this.createTokenizer(), this.root.source = { input: s, start: { column: 1, line: 1, offset: 0 } };
    }
    atrule(s) {
      let h = new n();
      h.name = s[1].slice(1), h.name === "" && this.unnamedAtrule(h, s), this.init(h, s[2]);
      let u, c, m, f = !1, g = !1, k = [], v = [];
      for (; !this.tokenizer.endOfFile(); ) {
        if (s = this.tokenizer.nextToken(), u = s[0], u === "(" || u === "[" ? v.push(u === "(" ? ")" : "]") : u === "{" && v.length > 0 ? v.push("}") : u === v[v.length - 1] && v.pop(), v.length === 0)
          if (u === ";") {
            h.source.end = this.getPosition(s[2]), h.source.end.offset++, this.semicolon = !0;
            break;
          } else if (u === "{") {
            g = !0;
            break;
          } else if (u === "}") {
            if (k.length > 0) {
              for (m = k.length - 1, c = k[m]; c && c[0] === "space"; )
                c = k[--m];
              c && (h.source.end = this.getPosition(c[3] || c[2]), h.source.end.offset++);
            }
            this.end(s);
            break;
          } else
            k.push(s);
        else
          k.push(s);
        if (this.tokenizer.endOfFile()) {
          f = !0;
          break;
        }
      }
      h.raws.between = this.spacesAndCommentsFromEnd(k), k.length ? (h.raws.afterName = this.spacesAndCommentsFromStart(k), this.raw(h, "params", k), f && (s = k[k.length - 1], h.source.end = this.getPosition(s[3] || s[2]), h.source.end.offset++, this.spaces = h.raws.between, h.raws.between = "")) : (h.raws.afterName = "", h.params = ""), g && (h.nodes = [], this.current = h);
    }
    checkMissedSemicolon(s) {
      let h = this.colon(s);
      if (h === !1) return;
      let u = 0, c;
      for (let m = h - 1; m >= 0 && (c = s[m], !(c[0] !== "space" && (u += 1, u === 2))); m--)
        ;
      throw this.input.error(
        "Missed semicolon",
        c[0] === "word" ? c[3] + 1 : c[2]
      );
    }
    colon(s) {
      let h = 0, u, c, m;
      for (let [f, g] of s.entries()) {
        if (u = g, c = u[0], c === "(" && (h += 1), c === ")" && (h -= 1), h === 0 && c === ":")
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
    comment(s) {
      let h = new r();
      this.init(h, s[2]), h.source.end = this.getPosition(s[3] || s[2]), h.source.end.offset++;
      let u = s[1].slice(2, -2);
      if (/^\s*$/.test(u))
        h.text = "", h.raws.left = u, h.raws.right = "";
      else {
        let c = u.match(/^(\s*)([^]*\S)(\s*)$/);
        h.text = c[2], h.raws.left = c[1], h.raws.right = c[3];
      }
    }
    createTokenizer() {
      this.tokenizer = t(this.input);
    }
    decl(s, h) {
      let u = new e();
      this.init(u, s[0][2]);
      let c = s[s.length - 1];
      for (c[0] === ";" && (this.semicolon = !0, s.pop()), u.source.end = this.getPosition(
        c[3] || c[2] || d(s)
      ), u.source.end.offset++; s[0][0] !== "word"; )
        s.length === 1 && this.unknownWord(s), u.raws.before += s.shift()[1];
      for (u.source.start = this.getPosition(s[0][2]), u.prop = ""; s.length; ) {
        let v = s[0][0];
        if (v === ":" || v === "space" || v === "comment")
          break;
        u.prop += s.shift()[1];
      }
      u.raws.between = "";
      let m;
      for (; s.length; )
        if (m = s.shift(), m[0] === ":") {
          u.raws.between += m[1];
          break;
        } else
          m[0] === "word" && /\w/.test(m[1]) && this.unknownWord([m]), u.raws.between += m[1];
      (u.prop[0] === "_" || u.prop[0] === "*") && (u.raws.before += u.prop[0], u.prop = u.prop.slice(1));
      let f = [], g;
      for (; s.length && (g = s[0][0], !(g !== "space" && g !== "comment")); )
        f.push(s.shift());
      this.precheckMissedSemicolon(s);
      for (let v = s.length - 1; v >= 0; v--) {
        if (m = s[v], m[1].toLowerCase() === "!important") {
          u.important = !0;
          let y = this.stringFrom(s, v);
          y = this.spacesFromEnd(s) + y, y !== " !important" && (u.raws.important = y);
          break;
        } else if (m[1].toLowerCase() === "important") {
          let y = s.slice(0), x = "";
          for (let w = v; w > 0; w--) {
            let b = y[w][0];
            if (x.trim().indexOf("!") === 0 && b !== "space")
              break;
            x = y.pop()[1] + x;
          }
          x.trim().indexOf("!") === 0 && (u.important = !0, u.raws.important = x, s = y);
        }
        if (m[0] !== "space" && m[0] !== "comment")
          break;
      }
      s.some((v) => v[0] !== "space" && v[0] !== "comment") && (u.raws.between += f.map((v) => v[1]).join(""), f = []), this.raw(u, "value", f.concat(s), h), u.value.includes(":") && !h && this.checkMissedSemicolon(s);
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
      let h = !1, u = null, c = !1, m = null, f = [], g = s[1].startsWith("--"), k = [], v = s;
      for (; v; ) {
        if (u = v[0], k.push(v), u === "(" || u === "[")
          m || (m = v), f.push(u === "(" ? ")" : "]");
        else if (g && c && u === "{")
          m || (m = v), f.push("}");
        else if (f.length === 0)
          if (u === ";")
            if (c) {
              this.decl(k, g);
              return;
            } else
              break;
          else if (u === "{") {
            this.rule(k);
            return;
          } else if (u === "}") {
            this.tokenizer.back(k.pop()), h = !0;
            break;
          } else u === ":" && (c = !0);
        else u === f[f.length - 1] && (f.pop(), f.length === 0 && (m = null));
        v = this.tokenizer.nextToken();
      }
      if (this.tokenizer.endOfFile() && (h = !0), f.length > 0 && this.unclosedBracket(m), h && c) {
        if (!g)
          for (; k.length && (v = k[k.length - 1][0], !(v !== "space" && v !== "comment")); )
            this.tokenizer.back(k.pop());
        this.decl(k, g);
      } else
        this.unknownWord(k);
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
    raw(s, h, u, c) {
      let m, f, g = u.length, k = "", v = !0, y, x;
      for (let w = 0; w < g; w += 1)
        m = u[w], f = m[0], f === "space" && w === g - 1 && !c ? v = !1 : f === "comment" ? (x = u[w - 1] ? u[w - 1][0] : "empty", y = u[w + 1] ? u[w + 1][0] : "empty", !l[x] && !l[y] ? k.slice(-1) === "," ? v = !1 : k += m[1] : v = !1) : k += m[1];
      if (!v) {
        let w = u.reduce((b, S) => b + S[1], "");
        s.raws[h] = { raw: w, value: k };
      }
      s[h] = k;
    }
    rule(s) {
      s.pop();
      let h = new o();
      this.init(h, s[0][2]), h.raws.between = this.spacesAndCommentsFromEnd(s), this.raw(h, "selector", s), this.current = h;
    }
    spacesAndCommentsFromEnd(s) {
      let h, u = "";
      for (; s.length && (h = s[s.length - 1][0], !(h !== "space" && h !== "comment")); )
        u = s.pop()[1] + u;
      return u;
    }
    // Errors
    spacesAndCommentsFromStart(s) {
      let h, u = "";
      for (; s.length && (h = s[0][0], !(h !== "space" && h !== "comment")); )
        u += s.shift()[1];
      return u;
    }
    spacesFromEnd(s) {
      let h, u = "";
      for (; s.length && (h = s[s.length - 1][0], h === "space"); )
        u = s.pop()[1] + u;
      return u;
    }
    stringFrom(s, h) {
      let u = "";
      for (let c = h; c < s.length; c++)
        u += s[c][1];
      return s.splice(h, s.length - h), u;
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
  return ui = a, ui;
}
var di, _o;
function Ki() {
  if (_o) return di;
  _o = 1;
  let e = Lt(), t = Dp(), r = an();
  function n(i, o) {
    let l = new r(i, o), d = new t(l);
    try {
      d.parse();
    } catch (a) {
      throw process.env.NODE_ENV !== "production" && a.name === "CssSyntaxError" && o && o.from && (/\.scss$/i.test(o.from) ? a.message += `
You tried to parse SCSS with the standard CSS parser; try again with the postcss-scss parser` : /\.sass/i.test(o.from) ? a.message += `
You tried to parse Sass with the standard CSS parser; try again with the postcss-sass parser` : /\.less$/i.test(o.from) && (a.message += `
You tried to parse Less with the standard CSS parser; try again with the postcss-less parser`)), a;
    }
    return d.root;
  }
  return di = n, n.default = n, e.registerParse(n), di;
}
var pi, $o;
function rl() {
  if ($o) return pi;
  $o = 1;
  let { isClean: e, my: t } = Hi(), r = Za(), n = nn(), i = Lt(), o = Vi(), l = Qa(), d = Yi(), a = Ki(), p = mr();
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
  }, u = {
    Once: !0,
    postcssPlugin: !0,
    prepare: !0
  }, c = 0;
  function m(x) {
    return typeof x == "object" && typeof x.then == "function";
  }
  function f(x) {
    let w = !1, b = s[x.type];
    return x.type === "decl" ? w = x.prop.toLowerCase() : x.type === "atrule" && (w = x.name.toLowerCase()), w && x.append ? [
      b,
      b + "-" + w,
      c,
      b + "Exit",
      b + "Exit-" + w
    ] : w ? [b, b + "-" + w, b + "Exit", b + "Exit-" + w] : x.append ? [b, c, b + "Exit"] : [b, b + "Exit"];
  }
  function g(x) {
    let w;
    return x.type === "document" ? w = ["Document", c, "DocumentExit"] : x.type === "root" ? w = ["Root", c, "RootExit"] : w = f(x), {
      eventIndex: 0,
      events: w,
      iterator: 0,
      node: x,
      visitorIndex: 0,
      visitors: []
    };
  }
  function k(x) {
    return x[e] = !1, x.nodes && x.nodes.forEach((w) => k(w)), x;
  }
  let v = {};
  class y {
    constructor(w, b, S) {
      this.stringified = !1, this.processed = !1;
      let M;
      if (typeof b == "object" && b !== null && (b.type === "root" || b.type === "document"))
        M = k(b);
      else if (b instanceof y || b instanceof d)
        M = k(b.root), b.map && (typeof S.map > "u" && (S.map = {}), S.map.inline || (S.map.inline = !1), S.map.prev = b.map);
      else {
        let I = a;
        S.syntax && (I = S.syntax.parse), S.parser && (I = S.parser), I.parse && (I = I.parse);
        try {
          M = I(b, S);
        } catch (R) {
          this.processed = !0, this.error = R;
        }
        M && !M[t] && i.rebuild(M);
      }
      this.result = new d(w, M, S), this.helpers = { ...v, postcss: v, result: this.result }, this.plugins = this.processor.plugins.map((I) => typeof I == "object" && I.prepare ? { ...I, ...I.prepare(this.result) } : I);
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
    handleError(w, b) {
      let S = this.result.lastPlugin;
      try {
        if (b && b.addToError(w), this.error = w, w.name === "CssSyntaxError" && !w.plugin)
          w.plugin = S.postcssPlugin, w.setMessage();
        else if (S.postcssVersion && process.env.NODE_ENV !== "production") {
          let M = S.postcssPlugin, I = S.postcssVersion, R = this.result.processor.version, j = I.split("."), z = R.split(".");
          (j[0] !== z[0] || parseInt(j[1]) > parseInt(z[1])) && console.error(
            "Unknown error from PostCSS plugin. Your current PostCSS version is " + R + ", but " + M + " uses " + I + ". Perhaps this is the source of the error below."
          );
        }
      } catch (M) {
        console && console.error && console.error(M);
      }
      return w;
    }
    prepareVisitors() {
      this.listeners = {};
      let w = (b, S, M) => {
        this.listeners[S] || (this.listeners[S] = []), this.listeners[S].push([b, M]);
      };
      for (let b of this.plugins)
        if (typeof b == "object")
          for (let S in b) {
            if (!h[S] && /^[A-Z]/.test(S))
              throw new Error(
                `Unknown event ${S} in ${b.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`
              );
            if (!u[S])
              if (typeof b[S] == "object")
                for (let M in b[S])
                  M === "*" ? w(b, S, b[S][M]) : w(
                    b,
                    S + "-" + M.toLowerCase(),
                    b[S][M]
                  );
              else typeof b[S] == "function" && w(b, S, b[S]);
          }
      this.hasListener = Object.keys(this.listeners).length > 0;
    }
    async runAsync() {
      this.plugin = 0;
      for (let w = 0; w < this.plugins.length; w++) {
        let b = this.plugins[w], S = this.runOnRoot(b);
        if (m(S))
          try {
            await S;
          } catch (M) {
            throw this.handleError(M);
          }
      }
      if (this.prepareVisitors(), this.hasListener) {
        let w = this.result.root;
        for (; !w[e]; ) {
          w[e] = !0;
          let b = [g(w)];
          for (; b.length > 0; ) {
            let S = this.visitTick(b);
            if (m(S))
              try {
                await S;
              } catch (M) {
                let I = b[b.length - 1].node;
                throw this.handleError(M, I);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [b, S] of this.listeners.OnceExit) {
            this.result.lastPlugin = b;
            try {
              if (w.type === "document") {
                let M = w.nodes.map(
                  (I) => S(I, this.helpers)
                );
                await Promise.all(M);
              } else
                await S(w, this.helpers);
            } catch (M) {
              throw this.handleError(M);
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
            let b = this.result.root.nodes.map(
              (S) => w.Once(S, this.helpers)
            );
            return m(b[0]) ? Promise.all(b) : b;
          }
          return w.Once(this.result.root, this.helpers);
        } else if (typeof w == "function")
          return w(this.result.root, this.result);
      } catch (b) {
        throw this.handleError(b);
      }
    }
    stringify() {
      if (this.error) throw this.error;
      if (this.stringified) return this.result;
      this.stringified = !0, this.sync();
      let w = this.result.opts, b = n;
      w.syntax && (b = w.syntax.stringify), w.stringifier && (b = w.stringifier), b.stringify && (b = b.stringify);
      let M = new r(b, this.result.root, this.result.opts).generate();
      return this.result.css = M[0], this.result.map = M[1], this.result;
    }
    sync() {
      if (this.error) throw this.error;
      if (this.processed) return this.result;
      if (this.processed = !0, this.processing)
        throw this.getAsyncError();
      for (let w of this.plugins) {
        let b = this.runOnRoot(w);
        if (m(b))
          throw this.getAsyncError();
      }
      if (this.prepareVisitors(), this.hasListener) {
        let w = this.result.root;
        for (; !w[e]; )
          w[e] = !0, this.walkSync(w);
        if (this.listeners.OnceExit)
          if (w.type === "document")
            for (let b of w.nodes)
              this.visitSync(this.listeners.OnceExit, b);
          else
            this.visitSync(this.listeners.OnceExit, w);
      }
      return this.result;
    }
    then(w, b) {
      return process.env.NODE_ENV !== "production" && ("from" in this.opts || l(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(w, b);
    }
    toString() {
      return this.css;
    }
    visitSync(w, b) {
      for (let [S, M] of w) {
        this.result.lastPlugin = S;
        let I;
        try {
          I = M(b, this.helpers);
        } catch (R) {
          throw this.handleError(R, b.proxyOf);
        }
        if (b.type !== "root" && b.type !== "document" && !b.parent)
          return !0;
        if (m(I))
          throw this.getAsyncError();
      }
    }
    visitTick(w) {
      let b = w[w.length - 1], { node: S, visitors: M } = b;
      if (S.type !== "root" && S.type !== "document" && !S.parent) {
        w.pop();
        return;
      }
      if (M.length > 0 && b.visitorIndex < M.length) {
        let [R, j] = M[b.visitorIndex];
        b.visitorIndex += 1, b.visitorIndex === M.length && (b.visitors = [], b.visitorIndex = 0), this.result.lastPlugin = R;
        try {
          return j(S.toProxy(), this.helpers);
        } catch (z) {
          throw this.handleError(z, S);
        }
      }
      if (b.iterator !== 0) {
        let R = b.iterator, j;
        for (; j = S.nodes[S.indexes[R]]; )
          if (S.indexes[R] += 1, !j[e]) {
            j[e] = !0, w.push(g(j));
            return;
          }
        b.iterator = 0, delete S.indexes[R];
      }
      let I = b.events;
      for (; b.eventIndex < I.length; ) {
        let R = I[b.eventIndex];
        if (b.eventIndex += 1, R === c) {
          S.nodes && S.nodes.length && (S[e] = !0, b.iterator = S.getIterator());
          return;
        } else if (this.listeners[R]) {
          b.visitors = this.listeners[R];
          return;
        }
      }
      w.pop();
    }
    walkSync(w) {
      w[e] = !0;
      let b = f(w);
      for (let S of b)
        if (S === c)
          w.nodes && w.each((M) => {
            M[e] || this.walkSync(M);
          });
        else {
          let M = this.listeners[S];
          if (M && this.visitSync(M, w.toProxy()))
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
  return y.registerPostcss = (x) => {
    v = x;
  }, pi = y, y.default = y, p.registerLazyResult(y), o.registerLazyResult(y), pi;
}
var hi, Do;
function zp() {
  if (Do) return hi;
  Do = 1;
  let e = Za(), t = nn(), r = Qa(), n = Ki();
  const i = Yi();
  class o {
    constructor(d, a, p) {
      a = a.toString(), this.stringified = !1, this._processor = d, this._css = a, this._opts = p, this._map = void 0;
      let s, h = t;
      this.result = new i(this._processor, s, this._opts), this.result.css = a;
      let u = this;
      Object.defineProperty(this.result, "root", {
        get() {
          return u.root;
        }
      });
      let c = new e(h, s, this._opts, a);
      if (c.isMap()) {
        let [m, f] = c.generate();
        m && (this.result.css = m), f && (this.result.map = f);
      } else
        c.clearAnnotation(), this.result.css = c.css;
    }
    async() {
      return this.error ? Promise.reject(this.error) : Promise.resolve(this.result);
    }
    catch(d) {
      return this.async().catch(d);
    }
    finally(d) {
      return this.async().then(d, d);
    }
    sync() {
      if (this.error) throw this.error;
      return this.result;
    }
    then(d, a) {
      return process.env.NODE_ENV !== "production" && ("from" in this._opts || r(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(d, a);
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
      let d, a = n;
      try {
        d = a(this._css, this._opts);
      } catch (p) {
        this.error = p;
      }
      if (this.error)
        throw this.error;
      return this._root = d, d;
    }
    get [Symbol.toStringTag]() {
      return "NoWorkResult";
    }
  }
  return hi = o, o.default = o, hi;
}
var fi, zo;
function Fp() {
  if (zo) return fi;
  zo = 1;
  let e = zp(), t = rl(), r = Vi(), n = mr();
  class i {
    constructor(l = []) {
      this.version = "8.4.38", this.plugins = this.normalize(l);
    }
    normalize(l) {
      let d = [];
      for (let a of l)
        if (a.postcss === !0 ? a = a() : a.postcss && (a = a.postcss), typeof a == "object" && Array.isArray(a.plugins))
          d = d.concat(a.plugins);
        else if (typeof a == "object" && a.postcssPlugin)
          d.push(a);
        else if (typeof a == "function")
          d.push(a);
        else if (typeof a == "object" && (a.parse || a.stringify)) {
          if (process.env.NODE_ENV !== "production")
            throw new Error(
              "PostCSS syntaxes cannot be used as plugins. Instead, please use one of the syntax/parser/stringifier options as outlined in your PostCSS runner documentation."
            );
        } else
          throw new Error(a + " is not a PostCSS plugin");
      return d;
    }
    process(l, d = {}) {
      return !this.plugins.length && !d.parser && !d.stringifier && !d.syntax ? new e(this, l, d) : new t(this, l, d);
    }
    use(l) {
      return this.plugins = this.plugins.concat(this.normalize([l])), this;
    }
  }
  return fi = i, i.default = i, n.registerProcessor(i), r.registerProcessor(i), fi;
}
var mi, Fo;
function Up() {
  if (Fo) return mi;
  Fo = 1;
  let e = on(), t = Ja(), r = ln(), n = Gi(), i = an(), o = mr(), l = Xi();
  function d(a, p) {
    if (Array.isArray(a)) return a.map((u) => d(u));
    let { inputs: s, ...h } = a;
    if (s) {
      p = [];
      for (let u of s) {
        let c = { ...u, __proto__: i.prototype };
        c.map && (c.map = {
          ...c.map,
          __proto__: t.prototype
        }), p.push(c);
      }
    }
    if (h.nodes && (h.nodes = a.nodes.map((u) => d(u, p))), h.source) {
      let { inputId: u, ...c } = h.source;
      h.source = c, u != null && (h.source.input = p[u]);
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
  return mi = d, d.default = d, mi;
}
var gi, Uo;
function Bp() {
  if (Uo) return gi;
  Uo = 1;
  let e = ji(), t = on(), r = rl(), n = Lt(), i = Fp(), o = nn(), l = Up(), d = Vi(), a = el(), p = ln(), s = Gi(), h = Yi(), u = an(), c = Ki(), m = tl(), f = Xi(), g = mr(), k = sn();
  function v(...y) {
    return y.length === 1 && Array.isArray(y[0]) && (y = y[0]), new i(y);
  }
  return v.plugin = function(x, w) {
    let b = !1;
    function S(...I) {
      console && console.warn && !b && (b = !0, console.warn(
        x + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`
      ), process.env.LANG && process.env.LANG.startsWith("cn") && console.warn(
        x + `: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`
      ));
      let R = w(...I);
      return R.postcssPlugin = x, R.postcssVersion = new i().version, R;
    }
    let M;
    return Object.defineProperty(S, "postcss", {
      get() {
        return M || (M = S()), M;
      }
    }), S.process = function(I, R, j) {
      return v([S(j)]).process(I, R);
    }, S;
  }, v.stringify = o, v.parse = c, v.fromJSON = l, v.list = m, v.comment = (y) => new p(y), v.atRule = (y) => new s(y), v.decl = (y) => new t(y), v.rule = (y) => new f(y), v.root = (y) => new g(y), v.document = (y) => new d(y), v.CssSyntaxError = e, v.Declaration = t, v.Container = n, v.Processor = i, v.Document = d, v.Comment = p, v.Warning = a, v.AtRule = s, v.Result = h, v.Input = u, v.Rule = f, v.Root = g, v.Node = k, r.registerPostcss(v), gi = v, v.default = v, gi;
}
var qp = Bp();
const pe = /* @__PURE__ */ Op(qp);
pe.stringify;
pe.fromJSON;
pe.plugin;
pe.parse;
pe.list;
pe.document;
pe.comment;
pe.atRule;
pe.rule;
pe.decl;
pe.root;
pe.CssSyntaxError;
pe.Declaration;
pe.Container;
pe.Processor;
pe.Document;
pe.Comment;
pe.Warning;
pe.AtRule;
pe.Result;
pe.Input;
pe.Rule;
pe.Root;
pe.Node;
class Ji {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  constructor(...t) {
    Be(this, "parentElement", null), Be(this, "parentNode", null), Be(this, "ownerDocument"), Be(this, "firstChild", null), Be(this, "lastChild", null), Be(this, "previousSibling", null), Be(this, "nextSibling", null), Be(this, "ELEMENT_NODE", 1), Be(this, "TEXT_NODE", 3), Be(this, "nodeType"), Be(this, "nodeName"), Be(this, "RRNodeType");
  }
  get childNodes() {
    const t = [];
    let r = this.firstChild;
    for (; r; )
      t.push(r), r = r.nextSibling;
    return t;
  }
  contains(t) {
    if (t instanceof Ji) {
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
const Bo = {
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
}, qo = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, Or = {}, nl = {}, Wp = () => !!globalThis.Zone;
function Zi(e) {
  if (Or[e])
    return Or[e];
  const t = globalThis[e], r = t.prototype, n = e in Bo ? Bo[e] : void 0, i = !!(n && // @ts-expect-error 2345
  n.every(
    (d) => {
      var a, p;
      return !!((p = (a = Object.getOwnPropertyDescriptor(r, d)) == null ? void 0 : a.get) != null && p.toString().includes("[native code]"));
    }
  )), o = e in qo ? qo[e] : void 0, l = !!(o && o.every(
    // @ts-expect-error 2345
    (d) => {
      var a;
      return typeof r[d] == "function" && ((a = r[d]) == null ? void 0 : a.toString().includes("[native code]"));
    }
  ));
  if (i && l && !Wp())
    return Or[e] = t.prototype, t.prototype;
  try {
    const d = document.createElement("iframe");
    d.style.display = "none", document.body.appendChild(d);
    const a = d.contentWindow;
    if (!a) return t.prototype;
    const p = a[e].prototype;
    if (!p)
      return d.remove(), r;
    const s = navigator.userAgent;
    return s.includes("Safari") && !s.includes("Chrome") ? (d.classList.add("rr-block"), d.setAttribute("__rrwebUntaintedMutationObserver", ""), nl[e] = () => d.remove()) : d.remove(), Or[e] = p;
  } catch {
    return r;
  }
}
const yi = {};
function dt(e, t, r) {
  var n;
  const i = `${e}.${String(r)}`;
  if (yi[i])
    return yi[i].call(
      t
    );
  const o = Zi(e), l = (n = Object.getOwnPropertyDescriptor(
    o,
    r
  )) == null ? void 0 : n.get;
  return l ? (yi[i] = l, l.call(t)) : t[r];
}
const bi = {};
function il(e, t, r) {
  const n = `${e}.${String(r)}`;
  if (bi[n])
    return bi[n].bind(
      t
    );
  const o = Zi(e)[r];
  return typeof o != "function" ? t[r] : (bi[n] = o, o.bind(t));
}
function jp(e) {
  return dt("Node", e, "ownerDocument");
}
function Hp(e) {
  return dt("Node", e, "childNodes");
}
function Vp(e) {
  return dt("Node", e, "parentNode");
}
function Yp(e) {
  return dt("Node", e, "parentElement");
}
function Gp(e) {
  return dt("Node", e, "textContent");
}
function Xp(e, t) {
  return il("Node", e, "contains")(t);
}
function Kp(e) {
  return il("Node", e, "getRootNode")();
}
function Jp(e) {
  return !e || !("host" in e) ? null : dt("ShadowRoot", e, "host");
}
function Zp(e) {
  return e.styleSheets;
}
function Qp(e) {
  return !e || !("shadowRoot" in e) ? null : dt("Element", e, "shadowRoot");
}
function eh(e, t) {
  return dt("Element", e, "querySelector")(t);
}
function th(e, t) {
  return dt("Element", e, "querySelectorAll")(t);
}
function sl() {
  return [
    Zi("MutationObserver").constructor,
    nl.MutationObserver ?? (() => {
    })
  ];
}
let dr = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (dr = () => (/* @__PURE__ */ new Date()).getTime());
function Tt(e, t, r) {
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
const K = {
  ownerDocument: jp,
  childNodes: Hp,
  parentNode: Vp,
  parentElement: Yp,
  textContent: Gp,
  contains: Xp,
  getRootNode: Kp,
  host: Jp,
  styleSheets: Zp,
  shadowRoot: Qp,
  querySelector: eh,
  querySelectorAll: th,
  nowTimestamp: dr,
  mutationObserverCtor: sl,
  patch: Tt
};
function Le(e, t, r = document) {
  const n = { capture: !0, passive: !0 };
  return r.addEventListener(e, t, n), () => r.removeEventListener(e, t, n);
}
const zt = `Please stop import mirror directly. Instead of that,\r
now you can use replayer.getMirror() to access the mirror instance of a replayer,\r
or you can use record.mirror to access the mirror instance during recording.`;
let Wo = {
  map: {},
  getId() {
    return console.error(zt), -1;
  },
  getNode() {
    return console.error(zt), null;
  },
  removeNodeFromMap() {
    console.error(zt);
  },
  has() {
    return console.error(zt), !1;
  },
  reset() {
    console.error(zt);
  }
};
typeof window < "u" && window.Proxy && window.Reflect && (Wo = new Proxy(Wo, {
  get(e, t, r) {
    return t === "map" && console.error(zt), Reflect.get(e, t, r);
  }
}));
function pr(e, t, r = {}) {
  let n = null, i = 0;
  return function(...o) {
    const l = Date.now();
    !i && r.leading === !1 && (i = l);
    const d = t - (l - i), a = this;
    d <= 0 || d > t ? (n && (clearTimeout(n), n = null), i = l, e.apply(a, o)) : !n && r.trailing !== !1 && (n = setTimeout(() => {
      i = r.leading === !1 ? 0 : Date.now(), n = null, e.apply(a, o);
    }, d));
  };
}
function cn(e, t, r, n, i = window) {
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
  ), () => cn(e, t, o || {}, !0);
}
function ol(e) {
  var t, r, n, i;
  const o = e.document;
  return {
    left: o.scrollingElement ? o.scrollingElement.scrollLeft : e.pageXOffset !== void 0 ? e.pageXOffset : o.documentElement.scrollLeft || (o == null ? void 0 : o.body) && ((t = K.parentElement(o.body)) == null ? void 0 : t.scrollLeft) || ((r = o == null ? void 0 : o.body) == null ? void 0 : r.scrollLeft) || 0,
    top: o.scrollingElement ? o.scrollingElement.scrollTop : e.pageYOffset !== void 0 ? e.pageYOffset : (o == null ? void 0 : o.documentElement.scrollTop) || (o == null ? void 0 : o.body) && ((n = K.parentElement(o.body)) == null ? void 0 : n.scrollTop) || ((i = o == null ? void 0 : o.body) == null ? void 0 : i.scrollTop) || 0
  };
}
function al() {
  return window.innerHeight || document.documentElement && document.documentElement.clientHeight || document.body && document.body.clientHeight;
}
function ll() {
  return window.innerWidth || document.documentElement && document.documentElement.clientWidth || document.body && document.body.clientWidth;
}
function cl(e) {
  return e ? e.nodeType === e.ELEMENT_NODE ? e : K.parentElement(e) : null;
}
function Te(e, t, r, n) {
  if (!e)
    return !1;
  const i = cl(e);
  if (!i)
    return !1;
  try {
    if (typeof t == "string") {
      if (i.classList.contains(t) || n && i.closest("." + t) !== null) return !0;
    } else if (qr(i, t, n)) return !0;
  } catch {
  }
  return !!(r && (i.matches(r) || n && i.closest(r) !== null));
}
function rh(e, t) {
  return t.getId(e) !== -1;
}
function vi(e, t, r) {
  return e.tagName === "TITLE" && r.headTitleMutations ? !0 : t.getId(e) === ur;
}
function ul(e, t) {
  if (ir(e))
    return !1;
  const r = t.getId(e);
  if (!t.has(r))
    return !0;
  const n = K.parentNode(e);
  return n && n.nodeType === e.DOCUMENT_NODE ? !1 : n ? ul(n, t) : !0;
}
function Ei(e) {
  return !!e.changedTouches;
}
function nh(e = window) {
  "NodeList" in e && !e.NodeList.prototype.forEach && (e.NodeList.prototype.forEach = Array.prototype.forEach), "DOMTokenList" in e && !e.DOMTokenList.prototype.forEach && (e.DOMTokenList.prototype.forEach = Array.prototype.forEach);
}
function dl(e, t) {
  return !!(e.nodeName === "IFRAME" && t.getMeta(e));
}
function pl(e, t) {
  return !!(e.nodeName === "LINK" && e.nodeType === e.ELEMENT_NODE && e.getAttribute && e.getAttribute("rel") === "stylesheet" && t.getMeta(e));
}
function Mi(e) {
  return e ? e instanceof Ji && "shadowRoot" in e ? !!e.shadowRoot : !!K.shadowRoot(e) : !1;
}
class ih {
  constructor() {
    P(this, "id", 1), P(this, "styleIDMap", /* @__PURE__ */ new WeakMap()), P(this, "idStyleMap", /* @__PURE__ */ new Map());
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
function hl(e) {
  var t;
  let r = null;
  return "getRootNode" in e && ((t = K.getRootNode(e)) == null ? void 0 : t.nodeType) === Node.DOCUMENT_FRAGMENT_NODE && K.host(K.getRootNode(e)) && (r = K.host(K.getRootNode(e))), r;
}
function sh(e) {
  let t = e, r;
  for (; r = hl(t); )
    t = r;
  return t;
}
function oh(e) {
  const t = K.ownerDocument(e);
  if (!t) return !1;
  const r = sh(e);
  return K.contains(t, r);
}
function fl(e) {
  const t = K.ownerDocument(e);
  return t ? K.contains(t, e) || oh(e) : !1;
}
var re = /* @__PURE__ */ ((e) => (e[e.DomContentLoaded = 0] = "DomContentLoaded", e[e.Load = 1] = "Load", e[e.FullSnapshot = 2] = "FullSnapshot", e[e.IncrementalSnapshot = 3] = "IncrementalSnapshot", e[e.Meta = 4] = "Meta", e[e.Custom = 5] = "Custom", e[e.Plugin = 6] = "Plugin", e[e.Asset = 7] = "Asset", e))(re || {}), ee = /* @__PURE__ */ ((e) => (e[e.Mutation = 0] = "Mutation", e[e.MouseMove = 1] = "MouseMove", e[e.MouseInteraction = 2] = "MouseInteraction", e[e.Scroll = 3] = "Scroll", e[e.ViewportResize = 4] = "ViewportResize", e[e.Input = 5] = "Input", e[e.TouchMove = 6] = "TouchMove", e[e.MediaInteraction = 7] = "MediaInteraction", e[e.StyleSheetRule = 8] = "StyleSheetRule", e[e.CanvasMutation = 9] = "CanvasMutation", e[e.Font = 10] = "Font", e[e.Log = 11] = "Log", e[e.Drag = 12] = "Drag", e[e.StyleDeclaration = 13] = "StyleDeclaration", e[e.Selection = 14] = "Selection", e[e.AdoptedStyleSheet = 15] = "AdoptedStyleSheet", e[e.CustomElement = 16] = "CustomElement", e))(ee || {}), _e = /* @__PURE__ */ ((e) => (e[e.MouseUp = 0] = "MouseUp", e[e.MouseDown = 1] = "MouseDown", e[e.Click = 2] = "Click", e[e.ContextMenu = 3] = "ContextMenu", e[e.DblClick = 4] = "DblClick", e[e.Focus = 5] = "Focus", e[e.Blur = 6] = "Blur", e[e.TouchStart = 7] = "TouchStart", e[e.TouchMove_Departed = 8] = "TouchMove_Departed", e[e.TouchEnd = 9] = "TouchEnd", e[e.TouchCancel = 10] = "TouchCancel", e))(_e || {}), ct = /* @__PURE__ */ ((e) => (e[e.Mouse = 0] = "Mouse", e[e.Pen = 1] = "Pen", e[e.Touch = 2] = "Touch", e))(ct || {}), Kt = /* @__PURE__ */ ((e) => (e[e["2D"] = 0] = "2D", e[e.WebGL = 1] = "WebGL", e[e.WebGL2 = 2] = "WebGL2", e))(Kt || {}), Ft = /* @__PURE__ */ ((e) => (e[e.Play = 0] = "Play", e[e.Pause = 1] = "Pause", e[e.Seeked = 2] = "Seeked", e[e.VolumeChange = 3] = "VolumeChange", e[e.RateChange = 4] = "RateChange", e))(Ft || {}), ml = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(ml || {});
function jo(e) {
  return "__ln" in e;
}
class ah {
  constructor() {
    P(this, "length", 0), P(this, "head", null), P(this, "tail", null);
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
    if (t.__ln = r, t.previousSibling && jo(t.previousSibling)) {
      const n = t.previousSibling.__ln.next;
      r.next = n, r.previous = t.previousSibling.__ln, t.previousSibling.__ln.next = r, n && (n.previous = r);
    } else if (t.nextSibling && jo(t.nextSibling) && t.nextSibling.__ln.previous) {
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
const Ho = (e, t) => `${e}@${t}`;
class lh {
  constructor() {
    P(this, "frozen", !1), P(this, "locked", !1), P(this, "texts", []), P(this, "attributes", []), P(this, "attributeMap", /* @__PURE__ */ new WeakMap()), P(this, "removes", []), P(this, "mapRemoves", []), P(this, "movedMap", {}), P(this, "addedSet", /* @__PURE__ */ new Set()), P(this, "movedSet", /* @__PURE__ */ new Set()), P(this, "droppedSet", /* @__PURE__ */ new Set()), P(this, "removesSubTreeCache", /* @__PURE__ */ new Set()), P(this, "mutationCb"), P(this, "blockClass"), P(this, "blockSelector"), P(this, "maskTextClass"), P(this, "maskTextSelector"), P(this, "inlineStylesheet"), P(this, "maskInputOptions"), P(this, "maskTextFn"), P(this, "maskInputFn"), P(this, "keepIframeSrcFn"), P(this, "recordCanvas"), P(this, "inlineImages"), P(this, "slimDOMOptions"), P(this, "dataURLOptions"), P(this, "doc"), P(this, "mirror"), P(this, "iframeManager"), P(this, "stylesheetManager"), P(this, "shadowDomManager"), P(this, "canvasManager"), P(this, "processedNodeManager"), P(this, "unattachedDoc"), P(this, "processMutations", (t) => {
      t.forEach(this.processMutation), this.emit();
    }), P(this, "emit", () => {
      if (this.frozen || this.locked)
        return;
      const t = [], r = /* @__PURE__ */ new Set(), n = new ah(), i = (a) => {
        let p = a, s = ur;
        for (; s === ur; )
          p = p && p.nextSibling, s = p && this.mirror.getId(p);
        return s;
      }, o = (a) => {
        const p = K.parentNode(a);
        if (!p || !fl(a))
          return;
        let s = !1;
        if (a.nodeType === Node.TEXT_NODE) {
          const m = p.tagName;
          if (m === "TEXTAREA")
            return;
          m === "STYLE" && this.addedSet.has(p) && (s = !0);
        }
        const h = ir(p) ? this.mirror.getId(hl(a)) : this.mirror.getId(p), u = i(a);
        if (h === -1 || u === -1)
          return n.addNode(a);
        const c = Bt(a, {
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
            dl(m, this.mirror) && this.iframeManager.addIframe(m), pl(m, this.mirror) && this.stylesheetManager.trackLinkElement(
              m
            ), Mi(a) && this.shadowDomManager.addShadowRoot(K.shadowRoot(a), this.doc);
          },
          onIframeLoad: (m, f) => {
            this.iframeManager.attachIframe(m, f), this.shadowDomManager.observeAttachShadow(m);
          },
          onStylesheetLoad: (m, f) => {
            this.stylesheetManager.attachLinkElement(m, f);
          },
          cssCaptured: s
        });
        c && (t.push({
          parentId: h,
          nextId: u,
          node: c
        }), r.add(c.id));
      };
      for (; this.mapRemoves.length; )
        this.mirror.removeNodeFromMap(this.mapRemoves.shift());
      for (const a of this.movedSet)
        Vo(this.removesSubTreeCache, a, this.mirror) && !this.movedSet.has(K.parentNode(a)) || o(a);
      for (const a of this.addedSet)
        !Yo(this.droppedSet, a) && !Vo(this.removesSubTreeCache, a, this.mirror) || Yo(this.movedSet, a) ? o(a) : this.droppedSet.add(a);
      let l = null;
      for (; n.length; ) {
        let a = null;
        if (l) {
          const p = this.mirror.getId(K.parentNode(l.value)), s = i(l.value);
          p !== -1 && s !== -1 && (a = l);
        }
        if (!a) {
          let p = n.tail;
          for (; p; ) {
            const s = p;
            if (p = p.previous, s) {
              const h = this.mirror.getId(K.parentNode(s.value));
              if (i(s.value) === -1) continue;
              if (h !== -1) {
                a = s;
                break;
              } else {
                const c = s.value, m = K.parentNode(c);
                if (m && m.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                  const f = K.host(m);
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
      const d = {
        texts: this.texts.map((a) => {
          const p = a.node, s = K.parentNode(p);
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
      !d.texts.length && !d.attributes.length && !d.removes.length && !d.adds.length || (this.texts = [], this.attributes = [], this.attributeMap = /* @__PURE__ */ new WeakMap(), this.removes = [], this.addedSet = /* @__PURE__ */ new Set(), this.movedSet = /* @__PURE__ */ new Set(), this.droppedSet = /* @__PURE__ */ new Set(), this.removesSubTreeCache = /* @__PURE__ */ new Set(), this.movedMap = {}, this.mutationCb(d));
    }), P(this, "genTextAreaValueMutation", (t) => {
      let r = this.attributeMap.get(t);
      r || (r = {
        node: t,
        attributes: {},
        styleDiff: {},
        _unchangedStyles: {}
      }, this.attributes.push(r), this.attributeMap.set(t, r));
      const n = Array.from(
        K.childNodes(t),
        (i) => K.textContent(i) || ""
      ).join("");
      r.attributes.value = Fr({
        element: t,
        maskInputOptions: this.maskInputOptions,
        tagName: t.tagName,
        type: Ur(t),
        value: n,
        maskInputFn: this.maskInputFn
      });
    }), P(this, "processMutation", (t) => {
      if (!vi(t.target, this.mirror, this.slimDOMOptions))
        switch (t.type) {
          case "characterData": {
            const r = K.textContent(t.target);
            !Te(t.target, this.blockClass, this.blockSelector, !1) && r !== t.oldValue && this.texts.push({
              value: Ba(
                t.target,
                this.maskTextClass,
                this.maskTextSelector,
                !0
                // checkAncestors
              ) && r ? this.maskTextFn ? this.maskTextFn(r, cl(t.target)) : r.replace(/[\S]/g, "*") : r,
              node: t.target
            });
            break;
          }
          case "attributes": {
            const r = t.target;
            let n = t.attributeName, i = t.target.getAttribute(n);
            if (n === "value") {
              const l = Ur(r);
              i = Fr({
                element: r,
                maskInputOptions: this.maskInputOptions,
                tagName: r.tagName,
                type: l,
                value: i,
                maskInputFn: this.maskInputFn
              });
            }
            if (Te(t.target, this.blockClass, this.blockSelector, !1) || i === t.oldValue)
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
            }, this.attributes.push(o), this.attributeMap.set(t.target, o)), n === "type" && r.tagName === "INPUT" && (t.oldValue || "").toLowerCase() === "password" && r.setAttribute("data-rr-is-password", "true"), !Ua(r.tagName, n))
              if (o.attributes[n] = Fa(
                this.doc,
                It(r.tagName),
                It(n),
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
                for (const d of Array.from(r.style)) {
                  const a = r.style.getPropertyValue(d), p = r.style.getPropertyPriority(d);
                  a !== l.style.getPropertyValue(d) || p !== l.style.getPropertyPriority(d) ? p === "" ? o.styleDiff[d] = a : o.styleDiff[d] = [a, p] : o._unchangedStyles[d] = [a, p];
                }
                for (const d of Array.from(l.style))
                  r.style.getPropertyValue(d) === "" && (o.styleDiff[d] = !1);
              } else n === "open" && r.tagName === "DIALOG" && (r.matches("dialog:modal") ? o.attributes.rr_open_mode = "modal" : o.attributes.rr_open_mode = "non-modal");
            break;
          }
          case "childList": {
            if (Te(t.target, this.blockClass, this.blockSelector, !0))
              return;
            if (t.target.tagName === "TEXTAREA") {
              this.genTextAreaValueMutation(t.target);
              return;
            }
            t.addedNodes.forEach((r) => this.genAdds(r, t.target)), t.removedNodes.forEach((r) => {
              const n = this.mirror.getId(r), i = ir(t.target) ? this.mirror.getId(K.host(t.target)) : this.mirror.getId(t.target);
              Te(t.target, this.blockClass, this.blockSelector, !1) || vi(r, this.mirror, this.slimDOMOptions) || !rh(r, this.mirror) || (this.addedSet.has(r) ? (Ri(this.addedSet, r), this.droppedSet.add(r)) : this.addedSet.has(t.target) && n === -1 || ul(t.target, this.mirror) || (this.movedSet.has(r) && this.movedMap[Ho(n, i)] ? Ri(this.movedSet, r) : (this.removes.push({
                parentId: i,
                id: n,
                isShadow: ir(t.target) && sr(t.target) ? !0 : void 0
              }), ch(r, this.removesSubTreeCache))), this.mapRemoves.push(r));
            });
            break;
          }
        }
    }), P(this, "genAdds", (t, r) => {
      if (!this.processedNodeManager.inOtherBuffer(t, this) && !(this.addedSet.has(t) || this.movedSet.has(t))) {
        if (this.mirror.hasNode(t)) {
          if (vi(t, this.mirror, this.slimDOMOptions))
            return;
          this.movedSet.add(t);
          let n = null;
          r && this.mirror.hasNode(r) && (n = this.mirror.getId(r)), n && n !== -1 && (this.movedMap[Ho(this.mirror.getId(t), n)] = !0);
        } else
          this.addedSet.add(t), this.droppedSet.delete(t);
        Te(t, this.blockClass, this.blockSelector, !1) || (K.childNodes(t).forEach((n) => this.genAdds(n)), Mi(t) && K.childNodes(K.shadowRoot(t)).forEach((n) => {
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
function Ri(e, t) {
  e.delete(t), K.childNodes(t).forEach((r) => Ri(e, r));
}
function ch(e, t) {
  const r = [e];
  for (; r.length; ) {
    const n = r.pop();
    t.has(n) || (t.add(n), K.childNodes(n).forEach((i) => r.push(i)));
  }
}
function Vo(e, t, r) {
  return e.size === 0 ? !1 : uh(e, t);
}
function uh(e, t, r) {
  const n = K.parentNode(t);
  return n ? e.has(n) : !1;
}
function Yo(e, t) {
  return e.size === 0 ? !1 : gl(e, t);
}
function gl(e, t) {
  const r = K.parentNode(t);
  return r ? e.has(r) ? !0 : gl(e, r) : !1;
}
let or;
function dh(e) {
  or = e;
}
function ph() {
  or = void 0;
}
const te = (e) => or ? (...r) => {
  try {
    return e(...r);
  } catch (n) {
    if (or && or(n) === !0)
      return;
    throw n;
  }
} : e, Mt = [];
function gr(e) {
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
function yl(e, t) {
  const r = new lh();
  Mt.push(r), r.init(e);
  const [n, i] = sl(), o = new n(
    te(r.processMutations.bind(r))
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
function hh({
  mousemoveCb: e,
  sampling: t,
  doc: r,
  mirror: n
}) {
  if (t.mousemove === !1)
    return () => {
    };
  const i = typeof t.mousemove == "number" ? t.mousemove : 50, o = typeof t.mousemoveCallback == "number" ? t.mousemoveCallback : 500;
  let l = [], d;
  const a = pr(
    te(
      (h) => {
        const u = Date.now() - d;
        e(
          l.map((c) => (c.timeOffset -= u, c)),
          h
        ), l = [], d = null;
      }
    ),
    o
  ), p = te(
    pr(
      te((h) => {
        const u = gr(h), { clientX: c, clientY: m } = Ei(h) ? h.changedTouches[0] : h;
        d || (d = dr()), l.push({
          x: c,
          y: m,
          id: n.getId(u),
          timeOffset: dr() - d
        }), a(
          typeof DragEvent < "u" && h instanceof DragEvent ? ee.Drag : h instanceof MouseEvent ? ee.MouseMove : ee.TouchMove
        );
      }),
      i,
      {
        trailing: !1
      }
    )
  ), s = [
    Le("mousemove", p, r),
    Le("touchmove", p, r),
    Le("drag", p, r)
  ];
  return te(() => {
    s.forEach((h) => h());
  });
}
function fh({
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
  const l = o.mouseInteraction === !0 || o.mouseInteraction === void 0 ? {} : o.mouseInteraction, d = [];
  let a = null;
  const p = (s) => (h) => {
    const u = gr(h);
    if (Te(u, n, i, !0))
      return;
    let c = null, m = s;
    if ("pointerType" in h) {
      switch (h.pointerType) {
        case "mouse":
          c = ct.Mouse;
          break;
        case "touch":
          c = ct.Touch;
          break;
        case "pen":
          c = ct.Pen;
          break;
      }
      c === ct.Touch ? _e[s] === _e.MouseDown ? m = "TouchStart" : _e[s] === _e.MouseUp && (m = "TouchEnd") : ct.Pen;
    } else Ei(h) && (c = ct.Touch);
    c !== null ? (a = c, (m.startsWith("Touch") && c === ct.Touch || m.startsWith("Mouse") && c === ct.Mouse) && (c = null)) : _e[s] === _e.Click && (c = a, a = null);
    const f = Ei(h) ? h.changedTouches[0] : h;
    if (!f)
      return;
    const g = r.getId(u), { clientX: k, clientY: v } = f;
    te(e)({
      type: _e[m],
      id: g,
      x: k,
      y: v,
      ...c !== null && { pointerType: c }
    });
  };
  return Object.keys(_e).filter(
    (s) => Number.isNaN(Number(s)) && !s.endsWith("_Departed") && l[s] !== !1
  ).forEach((s) => {
    let h = It(s);
    const u = p(s);
    if (window.PointerEvent)
      switch (_e[s]) {
        case _e.MouseDown:
        case _e.MouseUp:
          h = h.replace(
            "mouse",
            "pointer"
          );
          break;
        case _e.TouchStart:
        case _e.TouchEnd:
          return;
      }
    d.push(Le(h, u, t));
  }), te(() => {
    d.forEach((s) => s());
  });
}
function bl({
  scrollCb: e,
  doc: t,
  mirror: r,
  blockClass: n,
  blockSelector: i,
  sampling: o
}) {
  const l = te(
    pr(
      te((d) => {
        const a = gr(d);
        if (!a || Te(a, n, i, !0))
          return;
        const p = r.getId(a);
        if (a === t && t.defaultView) {
          const s = ol(t.defaultView);
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
  return Le("scroll", l, t);
}
function mh({ viewportResizeCb: e }, { win: t }) {
  let r = -1, n = -1;
  const i = te(
    pr(
      te(() => {
        const o = al(), l = ll();
        (r !== o || n !== l) && (e({
          width: Number(l),
          height: Number(o)
        }), r = o, n = l);
      }),
      200
    )
  );
  return Le("resize", i, t);
}
const gh = ["INPUT", "TEXTAREA", "SELECT"], Go = /* @__PURE__ */ new WeakMap();
function yh({
  inputCb: e,
  doc: t,
  mirror: r,
  blockClass: n,
  blockSelector: i,
  ignoreClass: o,
  ignoreSelector: l,
  maskInputOptions: d,
  maskInputFn: a,
  sampling: p,
  userTriggeredOnInput: s
}) {
  function h(v) {
    let y = gr(v);
    const x = v.isTrusted, w = y && y.tagName;
    if (y && w === "OPTION" && (y = K.parentElement(y)), !y || !w || gh.indexOf(w) < 0 || Te(y, n, i, !0) || y.classList.contains(o) || l && y.matches(l))
      return;
    let b = y.value, S = !1;
    const M = Ur(y) || "";
    M === "radio" || M === "checkbox" ? S = y.checked : (d[w.toLowerCase()] || d[M]) && (b = Fr({
      element: y,
      maskInputOptions: d,
      tagName: w,
      type: M,
      value: b,
      maskInputFn: a
    })), u(
      y,
      s ? { text: b, isChecked: S, userTriggered: x } : { text: b, isChecked: S }
    );
    const I = y.name;
    M === "radio" && I && S && t.querySelectorAll(`input[type="radio"][name="${I}"]`).forEach((R) => {
      if (R !== y) {
        const j = R.value;
        u(
          R,
          s ? { text: j, isChecked: !S, userTriggered: !1 } : { text: j, isChecked: !S }
        );
      }
    });
  }
  function u(v, y) {
    const x = Go.get(v);
    if (!x || x.text !== y.text || x.isChecked !== y.isChecked) {
      Go.set(v, y);
      const w = r.getId(v);
      te(e)({
        ...y,
        id: w
      });
    }
  }
  const m = (p.input === "last" ? ["change"] : ["input", "change"]).map(
    (v) => Le(v, te(h), t)
  ), f = t.defaultView;
  if (!f)
    return () => {
      m.forEach((v) => v());
    };
  const g = f.Object.getOwnPropertyDescriptor(
    f.HTMLInputElement.prototype,
    "value"
  ), k = [
    [f.HTMLInputElement.prototype, "value"],
    [f.HTMLInputElement.prototype, "checked"],
    [f.HTMLSelectElement.prototype, "value"],
    [f.HTMLTextAreaElement.prototype, "value"],
    // Some UI library use selectedIndex to set select value
    [f.HTMLSelectElement.prototype, "selectedIndex"],
    [f.HTMLOptionElement.prototype, "selected"]
  ];
  return g && g.set && m.push(
    ...k.map(
      (v) => cn(
        v[0],
        v[1],
        {
          set() {
            te(h)({
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
  ), te(() => {
    m.forEach((v) => v());
  });
}
function Wr(e) {
  const t = [];
  function r(n, i) {
    if (Lr("CSSGroupingRule") && n.parentRule instanceof CSSGroupingRule || Lr("CSSMediaRule") && n.parentRule instanceof CSSMediaRule || Lr("CSSSupportsRule") && n.parentRule instanceof CSSSupportsRule || Lr("CSSConditionRule") && n.parentRule instanceof CSSConditionRule) {
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
function ft(e, t, r) {
  let n, i;
  return e ? (e.ownerNode ? n = t.getId(e.ownerNode) : i = r.getId(e), {
    styleId: i,
    id: n
  }) : {};
}
function bh({ styleSheetRuleCb: e, mirror: t, stylesheetManager: r }, { win: n }) {
  if (!n.CSSStyleSheet || !n.CSSStyleSheet.prototype)
    return () => {
    };
  const i = n.CSSStyleSheet.prototype.insertRule;
  n.CSSStyleSheet.prototype.insertRule = new Proxy(i, {
    apply: te(
      (s, h, u) => {
        const [c, m] = u, { id: f, styleId: g } = ft(
          h,
          t,
          r.styleMirror
        );
        return (f && f !== -1 || g && g !== -1) && e({
          id: f,
          styleId: g,
          adds: [{ rule: c, index: m }]
        }), s.apply(h, u);
      }
    )
  }), n.CSSStyleSheet.prototype.addRule = function(s, h, u = this.cssRules.length) {
    const c = `${s} { ${h} }`;
    return n.CSSStyleSheet.prototype.insertRule.apply(this, [c, u]);
  };
  const o = n.CSSStyleSheet.prototype.deleteRule;
  n.CSSStyleSheet.prototype.deleteRule = new Proxy(o, {
    apply: te(
      (s, h, u) => {
        const [c] = u, { id: m, styleId: f } = ft(
          h,
          t,
          r.styleMirror
        );
        return (m && m !== -1 || f && f !== -1) && e({
          id: m,
          styleId: f,
          removes: [{ index: c }]
        }), s.apply(h, u);
      }
    )
  }), n.CSSStyleSheet.prototype.removeRule = function(s) {
    return n.CSSStyleSheet.prototype.deleteRule.apply(this, [s]);
  };
  let l;
  n.CSSStyleSheet.prototype.replace && (l = n.CSSStyleSheet.prototype.replace, n.CSSStyleSheet.prototype.replace = new Proxy(l, {
    apply: te(
      (s, h, u) => {
        const [c] = u, { id: m, styleId: f } = ft(
          h,
          t,
          r.styleMirror
        );
        return (m && m !== -1 || f && f !== -1) && e({
          id: m,
          styleId: f,
          replace: c
        }), s.apply(h, u);
      }
    )
  }));
  let d;
  n.CSSStyleSheet.prototype.replaceSync && (d = n.CSSStyleSheet.prototype.replaceSync, n.CSSStyleSheet.prototype.replaceSync = new Proxy(d, {
    apply: te(
      (s, h, u) => {
        const [c] = u, { id: m, styleId: f } = ft(
          h,
          t,
          r.styleMirror
        );
        return (m && m !== -1 || f && f !== -1) && e({
          id: m,
          styleId: f,
          replaceSync: c
        }), s.apply(h, u);
      }
    )
  }));
  const a = {};
  Tr("CSSGroupingRule") ? a.CSSGroupingRule = n.CSSGroupingRule : (Tr("CSSMediaRule") && (a.CSSMediaRule = n.CSSMediaRule), Tr("CSSConditionRule") && (a.CSSConditionRule = n.CSSConditionRule), Tr("CSSSupportsRule") && (a.CSSSupportsRule = n.CSSSupportsRule));
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
        apply: te(
          (u, c, m) => {
            const [f, g] = m, { id: k, styleId: v } = ft(
              c.parentStyleSheet,
              t,
              r.styleMirror
            );
            return (k && k !== -1 || v && v !== -1) && e({
              id: k,
              styleId: v,
              adds: [
                {
                  rule: f,
                  index: [
                    ...Wr(c),
                    g || 0
                    // defaults to 0
                  ]
                }
              ]
            }), u.apply(c, m);
          }
        )
      }
    ), h.prototype.deleteRule = new Proxy(
      p[s].deleteRule,
      {
        apply: te(
          (u, c, m) => {
            const [f] = m, { id: g, styleId: k } = ft(
              c.parentStyleSheet,
              t,
              r.styleMirror
            );
            return (g && g !== -1 || k && k !== -1) && e({
              id: g,
              styleId: k,
              removes: [
                { index: [...Wr(c), f] }
              ]
            }), u.apply(c, m);
          }
        )
      }
    );
  }), te(() => {
    n.CSSStyleSheet.prototype.insertRule = i, n.CSSStyleSheet.prototype.deleteRule = o, l && (n.CSSStyleSheet.prototype.replace = l), d && (n.CSSStyleSheet.prototype.replaceSync = d), Object.entries(a).forEach(([s, h]) => {
      h.prototype.insertRule = p[s].insertRule, h.prototype.deleteRule = p[s].deleteRule;
    });
  });
}
function vl({
  mirror: e,
  stylesheetManager: t
}, r) {
  var n, i, o;
  let l = null;
  r.nodeName === "#document" ? l = e.getId(r) : l = e.getId(K.host(r));
  const d = r.nodeName === "#document" ? (n = r.defaultView) == null ? void 0 : n.Document : (o = (i = r.ownerDocument) == null ? void 0 : i.defaultView) == null ? void 0 : o.ShadowRoot, a = d != null && d.prototype ? Object.getOwnPropertyDescriptor(
    d == null ? void 0 : d.prototype,
    "adoptedStyleSheets"
  ) : void 0;
  return l === null || l === -1 || !d || !a ? () => {
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
  }), te(() => {
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
function vh({
  styleDeclarationCb: e,
  mirror: t,
  ignoreCSSAttributes: r,
  stylesheetManager: n
}, { win: i }) {
  const o = i.CSSStyleDeclaration.prototype.setProperty;
  i.CSSStyleDeclaration.prototype.setProperty = new Proxy(o, {
    apply: te(
      (d, a, p) => {
        var s;
        const [h, u, c] = p;
        if (r.has(h))
          return o.apply(a, [h, u, c]);
        const { id: m, styleId: f } = ft(
          (s = a.parentRule) == null ? void 0 : s.parentStyleSheet,
          t,
          n.styleMirror
        );
        return (m && m !== -1 || f && f !== -1) && e({
          id: m,
          styleId: f,
          set: {
            property: h,
            value: u,
            priority: c
          },
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          index: Wr(a.parentRule)
        }), d.apply(a, p);
      }
    )
  });
  const l = i.CSSStyleDeclaration.prototype.removeProperty;
  return i.CSSStyleDeclaration.prototype.removeProperty = new Proxy(l, {
    apply: te(
      (d, a, p) => {
        var s;
        const [h] = p;
        if (r.has(h))
          return l.apply(a, [h]);
        const { id: u, styleId: c } = ft(
          (s = a.parentRule) == null ? void 0 : s.parentStyleSheet,
          t,
          n.styleMirror
        );
        return (u && u !== -1 || c && c !== -1) && e({
          id: u,
          styleId: c,
          remove: {
            property: h
          },
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          index: Wr(a.parentRule)
        }), d.apply(a, p);
      }
    )
  }), te(() => {
    i.CSSStyleDeclaration.prototype.setProperty = o, i.CSSStyleDeclaration.prototype.removeProperty = l;
  });
}
function wh({
  mediaInteractionCb: e,
  blockClass: t,
  blockSelector: r,
  mirror: n,
  sampling: i,
  doc: o
}) {
  const l = te(
    (a) => pr(
      te((p) => {
        const s = gr(p);
        if (!s || Te(s, t, r, !0))
          return;
        const { currentTime: h, volume: u, muted: c, playbackRate: m, loop: f } = s;
        e({
          type: a,
          id: n.getId(s),
          currentTime: h,
          volume: u,
          muted: c,
          playbackRate: m,
          loop: f
        });
      }),
      i.media || 500
    )
  ), d = [
    Le("play", l(Ft.Play), o),
    Le("pause", l(Ft.Pause), o),
    Le("seeked", l(Ft.Seeked), o),
    Le("volumechange", l(Ft.VolumeChange), o),
    Le("ratechange", l(Ft.RateChange), o)
  ];
  return te(() => {
    d.forEach((a) => a());
  });
}
function kh({ fontCb: e, doc: t }) {
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
  const l = Tt(
    t.fonts,
    "add",
    function(d) {
      return function(a) {
        return setTimeout(
          te(() => {
            const p = i.get(a);
            p && (e(p), i.delete(a));
          }),
          0
        ), d.apply(this, [a]);
      };
    }
  );
  return n.push(() => {
    r.FontFace = o;
  }), n.push(l), te(() => {
    n.forEach((d) => d());
  });
}
function xh(e) {
  const { doc: t, mirror: r, blockClass: n, blockSelector: i, selectionCb: o } = e;
  let l = !0;
  const d = te(() => {
    const a = t.getSelection();
    if (!a || l && (a != null && a.isCollapsed)) return;
    l = a.isCollapsed || !1;
    const p = [], s = a.rangeCount || 0;
    for (let h = 0; h < s; h++) {
      const u = a.getRangeAt(h), { startContainer: c, startOffset: m, endContainer: f, endOffset: g } = u;
      Te(c, n, i, !0) || Te(f, n, i, !0) || p.push({
        start: r.getId(c),
        startOffset: m,
        end: r.getId(f),
        endOffset: g
      });
    }
    o({ ranges: p });
  });
  return d(), Le("selectionchange", d);
}
function Sh({
  doc: e,
  customElementCb: t
}) {
  const r = e.defaultView;
  return !r || !r.customElements ? () => {
  } : Tt(
    r.customElements,
    "define",
    function(i) {
      return function(o, l, d) {
        try {
          t({
            define: {
              name: o
            }
          });
        } catch {
          console.warn(`Custom element callback failed for ${o}`);
        }
        return i.apply(this, [o, l, d]);
      };
    }
  );
}
function Ch(e, t) {
  const {
    mutationCb: r,
    mousemoveCb: n,
    mouseInteractionCb: i,
    scrollCb: o,
    viewportResizeCb: l,
    inputCb: d,
    mediaInteractionCb: a,
    styleSheetRuleCb: p,
    styleDeclarationCb: s,
    canvasMutationCb: h,
    fontCb: u,
    selectionCb: c,
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
    t.input && t.input(...f), d(...f);
  }, e.mediaInteractionCb = (...f) => {
    t.mediaInteaction && t.mediaInteaction(...f), a(...f);
  }, e.styleSheetRuleCb = (...f) => {
    t.styleSheetRule && t.styleSheetRule(...f), p(...f);
  }, e.styleDeclarationCb = (...f) => {
    t.styleDeclaration && t.styleDeclaration(...f), s(...f);
  }, e.canvasMutationCb = (...f) => {
    t.canvasMutation && t.canvasMutation(...f), h(...f);
  }, e.fontCb = (...f) => {
    t.font && t.font(...f), u(...f);
  }, e.selectionCb = (...f) => {
    t.selection && t.selection(...f), c(...f);
  }, e.customElementCb = (...f) => {
    t.customElement && t.customElement(...f), m(...f);
  };
}
function Eh(e, t = {}) {
  const r = e.doc.defaultView;
  if (!r)
    return () => {
    };
  Ch(e, t);
  let n, i = () => {
  };
  e.recordDOM && ([n, i] = yl(e, e.doc));
  const o = hh(e), l = fh(e), d = bl(e), a = mh(e, {
    win: r
  }), p = yh(e), s = wh(e);
  let h = () => {
  }, u = () => {
  }, c = () => {
  }, m = () => {
  };
  e.recordDOM && (h = bh(e, { win: r }), u = vl(e, e.doc), c = vh(e, {
    win: r
  }), e.collectFonts && (m = kh(e)));
  const f = xh(e), g = Sh(e), k = [];
  for (const v of e.plugins)
    k.push(
      v.observer(v.callback, r, v.options)
    );
  return te(() => {
    Mt.forEach((v) => v.reset()), n == null || n.disconnect(), i(), o(), l(), d(), a(), p(), s(), h(), u(), c(), m(), f(), g(), k.forEach((v) => v());
  });
}
function Lr(e) {
  return typeof window[e] < "u";
}
function Tr(e) {
  return !!(typeof window[e] < "u" && // Note: Generally, this check _shouldn't_ be necessary
  // However, in some scenarios (e.g. jsdom) this can sometimes fail, so we check for it here
  window[e].prototype && "insertRule" in window[e].prototype && "deleteRule" in window[e].prototype);
}
class Xo {
  constructor(t) {
    P(this, "iframeIdToRemoteIdMap", /* @__PURE__ */ new WeakMap()), P(this, "iframeRemoteIdToIdMap", /* @__PURE__ */ new WeakMap()), this.generateIdFn = t;
  }
  getId(t, r, n, i) {
    const o = n || this.getIdToRemoteIdMap(t), l = i || this.getRemoteIdToIdMap(t);
    let d = o.get(r);
    return d || (d = this.generateIdFn(), o.set(r, d), l.set(d, r)), d;
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
class Mh {
  constructor(t) {
    P(this, "iframes", /* @__PURE__ */ new WeakMap()), P(this, "crossOriginIframeMap", /* @__PURE__ */ new WeakMap()), P(this, "crossOriginIframeMirror", new Xo(za)), P(this, "crossOriginIframeStyleMirror"), P(this, "crossOriginIframeRootIdMap", /* @__PURE__ */ new WeakMap()), P(this, "mirror"), P(this, "mutationCb"), P(this, "wrappedEmit"), P(this, "loadListener"), P(this, "stylesheetManager"), P(this, "recordCrossOriginIframes"), this.mutationCb = t.mutationCb, this.wrappedEmit = t.wrappedEmit, this.stylesheetManager = t.stylesheetManager, this.recordCrossOriginIframes = t.recordCrossOriginIframes, this.crossOriginIframeStyleMirror = new Xo(
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
      case re.FullSnapshot: {
        this.crossOriginIframeMirror.reset(t), this.crossOriginIframeStyleMirror.reset(t), this.replaceIdOnNode(r.data.node, t);
        const i = r.data.node.id;
        return this.crossOriginIframeRootIdMap.set(t, i), this.patchRootIdOnNode(r.data.node, i), {
          timestamp: r.timestamp,
          type: re.IncrementalSnapshot,
          data: {
            source: ee.Mutation,
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
      case re.Meta:
      case re.Load:
      case re.DomContentLoaded:
        return !1;
      case re.Plugin:
        return r;
      case re.Custom:
        return this.replaceIds(
          r.data.payload,
          t,
          ["id", "parentId", "previousId", "nextId"]
        ), r;
      case re.IncrementalSnapshot:
        switch (r.data.source) {
          case ee.Mutation:
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
          case ee.Drag:
          case ee.TouchMove:
          case ee.MouseMove:
            return r.data.positions.forEach((i) => {
              this.replaceIds(i, t, ["id"]);
            }), r;
          case ee.ViewportResize:
            return !1;
          case ee.MediaInteraction:
          case ee.MouseInteraction:
          case ee.Scroll:
          case ee.CanvasMutation:
          case ee.Input:
            return this.replaceIds(r.data, t, ["id"]), r;
          case ee.StyleSheetRule:
          case ee.StyleDeclaration:
            return this.replaceIds(r.data, t, ["id"]), this.replaceStyleIds(r.data, t, ["styleId"]), r;
          case ee.Font:
            return r;
          case ee.Selection:
            return r.data.ranges.forEach((i) => {
              this.replaceIds(i, t, ["start", "end"]);
            }), r;
          case ee.AdoptedStyleSheet:
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
    t.type !== ml.Document && !t.rootId && (t.rootId = r), "childNodes" in t && t.childNodes.forEach((n) => {
      this.patchRootIdOnNode(n, r);
    });
  }
}
class Rh {
  constructor(t) {
    P(this, "shadowDoms", /* @__PURE__ */ new WeakSet()), P(this, "mutationCb"), P(this, "scrollCb"), P(this, "bypassOptions"), P(this, "mirror"), P(this, "restoreHandlers", []), this.mutationCb = t.mutationCb, this.scrollCb = t.scrollCb, this.bypassOptions = t.bypassOptions, this.mirror = t.mirror, this.init();
  }
  init() {
    this.reset(), this.patchAttachShadow(Element, document);
  }
  addShadowRoot(t, r) {
    if (!sr(t) || this.shadowDoms.has(t)) return;
    this.shadowDoms.add(t);
    const [n] = yl(
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
      bl({
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
        this.mirror.getId(K.host(t))
      ), this.restoreHandlers.push(
        vl(
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
      Tt(
        t.prototype,
        "attachShadow",
        function(i) {
          return function(o) {
            const l = i.call(this, o), d = K.shadowRoot(this);
            return d && fl(this) && n.addShadowRoot(d, r), l;
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
var qt = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", Ah = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (var Nr = 0; Nr < qt.length; Nr++)
  Ah[qt.charCodeAt(Nr)] = Nr;
var Ih = function(e) {
  var t = new Uint8Array(e), r, n = t.length, i = "";
  for (r = 0; r < n; r += 3)
    i += qt[t[r] >> 2], i += qt[(t[r] & 3) << 4 | t[r + 1] >> 4], i += qt[(t[r + 1] & 15) << 2 | t[r + 2] >> 6], i += qt[t[r + 2] & 63];
  return n % 3 === 2 ? i = i.substring(0, i.length - 1) + "=" : n % 3 === 1 && (i = i.substring(0, i.length - 2) + "=="), i;
};
const Ko = /* @__PURE__ */ new Map();
function Oh(e, t) {
  let r = Ko.get(e);
  return r || (r = /* @__PURE__ */ new Map(), Ko.set(e, r)), r.has(t) || r.set(t, []), r.get(t);
}
const wl = (e, t, r) => {
  if (!e || !(xl(e, t) || typeof e == "object"))
    return;
  const n = e.constructor.name, i = Oh(r, n);
  let o = i.indexOf(e);
  return o === -1 && (o = i.length, i.push(e)), o;
};
function Pr(e, t, r) {
  if (e instanceof Array)
    return e.map((n) => Pr(n, t, r));
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
    const n = e.constructor.name, i = Ih(e);
    return {
      rr_type: n,
      base64: i
    };
  } else {
    if (e instanceof DataView)
      return {
        rr_type: e.constructor.name,
        args: [
          Pr(e.buffer, t, r),
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
          args: [Pr(e.data, t, r), e.width, e.height]
        };
      if (xl(e, t) || typeof e == "object") {
        const n = e.constructor.name, i = wl(e, t, r);
        return {
          rr_type: n,
          index: i
        };
      }
    }
  }
  return e;
}
const kl = (e, t, r) => e.map((n) => Pr(n, t, r)), xl = (e, t) => !![
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
function Lh(e, t, r, n) {
  const i = [], o = Object.getOwnPropertyNames(
    t.CanvasRenderingContext2D.prototype
  );
  for (const l of o)
    try {
      if (typeof t.CanvasRenderingContext2D.prototype[l] != "function")
        continue;
      const d = Tt(
        t.CanvasRenderingContext2D.prototype,
        l,
        function(a) {
          return function(...p) {
            return Te(this.canvas, r, n, !0) || setTimeout(() => {
              const s = kl(p, t, this);
              e(this.canvas, {
                type: Kt["2D"],
                property: l,
                args: s
              });
            }, 0), a.apply(this, p);
          };
        }
      );
      i.push(d);
    } catch {
      const d = cn(
        t.CanvasRenderingContext2D.prototype,
        l,
        {
          set(a) {
            e(this.canvas, {
              type: Kt["2D"],
              property: l,
              args: [a],
              setter: !0
            });
          }
        }
      );
      i.push(d);
    }
  return () => {
    i.forEach((l) => l());
  };
}
function Th(e) {
  return e === "experimental-webgl" ? "webgl" : e;
}
function Jo(e, t, r, n) {
  const i = [];
  try {
    const o = Tt(
      e.HTMLCanvasElement.prototype,
      "getContext",
      function(l) {
        return function(d, ...a) {
          if (!Te(this, t, r, !0)) {
            const p = Th(d);
            if ("__context" in this || (this.__context = p), n && ["webgl", "webgl2"].includes(p))
              if (a[0] && typeof a[0] == "object") {
                const s = a[0];
                s.preserveDrawingBuffer || (s.preserveDrawingBuffer = !0);
              } else
                a.splice(0, 1, {
                  preserveDrawingBuffer: !0
                });
          }
          return l.apply(this, [d, ...a]);
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
function Zo(e, t, r, n, i, o) {
  const l = [], d = Object.getOwnPropertyNames(e);
  for (const a of d)
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
        const p = Tt(
          e,
          a,
          function(s) {
            return function(...h) {
              const u = s.apply(this, h);
              if (wl(u, o, this), "tagName" in this.canvas && !Te(this.canvas, n, i, !0)) {
                const c = kl(h, o, this), m = {
                  type: t,
                  property: a,
                  args: c
                };
                r(this.canvas, m);
              }
              return u;
            };
          }
        );
        l.push(p);
      } catch {
        const p = cn(e, a, {
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
function Nh(e, t, r, n) {
  const i = [];
  return typeof t.WebGLRenderingContext < "u" && i.push(
    ...Zo(
      t.WebGLRenderingContext.prototype,
      Kt.WebGL,
      e,
      r,
      n,
      t
    )
  ), typeof t.WebGL2RenderingContext < "u" && i.push(
    ...Zo(
      t.WebGL2RenderingContext.prototype,
      Kt.WebGL2,
      e,
      r,
      n,
      t
    )
  ), () => {
    i.forEach((o) => o());
  };
}
const Sl = `(function() {
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
`, Qo = typeof self < "u" && self.Blob && new Blob([Sl], { type: "text/javascript;charset=utf-8" });
function Ph(e) {
  let t;
  try {
    if (t = Qo && (self.URL || self.webkitURL).createObjectURL(Qo), !t) throw "";
    const r = new Worker(t, {
      name: e == null ? void 0 : e.name
    });
    return r.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(t);
    }), r;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(Sl),
      {
        name: e == null ? void 0 : e.name
      }
    );
  } finally {
    t && (self.URL || self.webkitURL).revokeObjectURL(t);
  }
}
class _h {
  constructor(t) {
    P(this, "pendingCanvasMutations", /* @__PURE__ */ new Map()), P(this, "rafStamps", { latestId: 0, invokeId: null }), P(this, "mirror"), P(this, "mutationCb"), P(this, "resetObservers"), P(this, "frozen", !1), P(this, "locked", !1), P(this, "processMutation", (a, p) => {
      (this.rafStamps.invokeId && this.rafStamps.latestId !== this.rafStamps.invokeId || !this.rafStamps.invokeId) && (this.rafStamps.invokeId = this.rafStamps.latestId), this.pendingCanvasMutations.has(a) || this.pendingCanvasMutations.set(a, []), this.pendingCanvasMutations.get(a).push(p);
    });
    const {
      sampling: r = "all",
      win: n,
      blockClass: i,
      blockSelector: o,
      recordCanvas: l,
      dataURLOptions: d
    } = t;
    this.mutationCb = t.mutationCb, this.mirror = t.mirror, l && r === "all" && this.initCanvasMutationObserver(n, i, o), l && typeof r == "number" && this.initCanvasFPSObserver(r, n, i, o, {
      dataURLOptions: d
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
    const l = Jo(
      r,
      n,
      i,
      !0
    ), d = /* @__PURE__ */ new Map(), a = new Ph();
    a.onmessage = (m) => {
      const { id: f } = m.data;
      if (d.set(f, !1), !("base64" in m.data)) return;
      const { base64: g, type: k, width: v, height: y } = m.data;
      this.mutationCb({
        id: f,
        type: Kt["2D"],
        commands: [
          {
            property: "clearRect",
            // wipe canvas
            args: [0, 0, v, y]
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
                    type: k
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
    const u = () => {
      const m = [];
      return r.document.querySelectorAll("canvas").forEach((f) => {
        Te(f, n, i, !0) || m.push(f);
      }), m;
    }, c = (m) => {
      if (s && m - s < p) {
        h = requestAnimationFrame(c);
        return;
      }
      s = m, u().forEach(async (f) => {
        var g;
        const k = this.mirror.getId(f);
        if (d.get(k) || f.width === 0 || f.height === 0) return;
        if (d.set(k, !0), ["webgl", "webgl2"].includes(f.__context)) {
          const y = f.getContext(f.__context);
          ((g = y == null ? void 0 : y.getContextAttributes()) == null ? void 0 : g.preserveDrawingBuffer) === !1 && y.clear(y.COLOR_BUFFER_BIT);
        }
        const v = await createImageBitmap(f);
        a.postMessage(
          {
            id: k,
            bitmap: v,
            width: f.width,
            height: f.height,
            dataURLOptions: o.dataURLOptions
          },
          [v]
        );
      }), h = requestAnimationFrame(c);
    };
    h = requestAnimationFrame(c), this.resetObservers = () => {
      l(), cancelAnimationFrame(h);
    };
  }
  initCanvasMutationObserver(t, r, n) {
    this.startRAFTimestamping(), this.startPendingCanvasMutationFlusher();
    const i = Jo(
      t,
      r,
      n,
      !1
    ), o = Lh(
      this.processMutation.bind(this),
      t,
      r,
      n
    ), l = Nh(
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
      const { type: d, ...a } = l;
      return a;
    }), { type: o } = n[0];
    this.mutationCb({ id: r, type: o, commands: i }), this.pendingCanvasMutations.delete(t);
  }
}
class $h {
  constructor(t) {
    P(this, "trackedLinkElements", /* @__PURE__ */ new WeakSet()), P(this, "mutationCb"), P(this, "adoptedStyleSheetCb"), P(this, "styleMirror", new ih()), this.mutationCb = t.mutationCb, this.adoptedStyleSheetCb = t.adoptedStyleSheetCb;
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
        rules: Array.from(o.rules || CSSRule, (d, a) => ({
          rule: _a(d, o.href),
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
class Dh {
  constructor() {
    P(this, "nodeMap", /* @__PURE__ */ new WeakMap()), P(this, "active", !1);
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
let ye, _r, wi, jr = !1;
try {
  if (Array.from([1], (e) => e * 2)[0] !== 2) {
    const e = document.createElement("iframe");
    document.body.appendChild(e), Array.from = ((Is = e.contentWindow) == null ? void 0 : Is.Array.from) || Array.from, document.body.removeChild(e);
  }
} catch (e) {
  console.debug("Unable to override Array.from", e);
}
const Ve = jd();
function bt(e = {}) {
  const {
    emit: t,
    checkoutEveryNms: r,
    checkoutEveryNth: n,
    blockClass: i = "rr-block",
    blockSelector: o = null,
    ignoreClass: l = "rr-ignore",
    ignoreSelector: d = null,
    maskTextClass: a = "rr-mask",
    maskTextSelector: p = null,
    inlineStylesheet: s = !0,
    maskAllInputs: h,
    maskInputOptions: u,
    slimDOMOptions: c,
    maskInputFn: m,
    maskTextFn: f,
    hooks: g,
    packFn: k,
    sampling: v = {},
    dataURLOptions: y = {},
    mousemoveWait: x,
    recordDOM: w = !0,
    recordCanvas: b = !1,
    recordCrossOriginIframes: S = !1,
    recordAfter: M = e.recordAfter === "DOMContentLoaded" ? e.recordAfter : "load",
    userTriggeredOnInput: I = !1,
    collectFonts: R = !1,
    inlineImages: j = !1,
    plugins: z,
    keepIframeSrcFn: E = () => !1,
    ignoreCSSAttributes: Ne = /* @__PURE__ */ new Set([]),
    errorHandler: be
  } = e;
  dh(be);
  const ne = S ? window.parent === window : !0;
  let ie = !1;
  if (!ne)
    try {
      window.parent.document && (ie = !1);
    } catch {
      ie = !0;
    }
  if (ne && !t)
    throw new Error("emit function is required");
  if (!ne && !ie)
    return () => {
    };
  x !== void 0 && v.mousemove === void 0 && (v.mousemove = x), Ve.reset();
  const he = h === !0 ? {
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
  } : u !== void 0 ? u : { password: !0 }, ke = qa(c);
  nh();
  let ce, Z = 0;
  const Ce = (H) => {
    for (const fe of z || [])
      fe.eventProcessor && (H = fe.eventProcessor(H));
    return k && // Disable packing events which will be emitted to parent frames.
    !ie && (H = k(H)), H;
  };
  ye = (H, fe) => {
    var Q;
    const ue = H;
    if (ue.timestamp = dr(), (Q = Mt[0]) != null && Q.isFrozen() && ue.type !== re.FullSnapshot && !(ue.type === re.IncrementalSnapshot && ue.data.source === ee.Mutation) && Mt.forEach((me) => me.unfreeze()), ne)
      t == null || t(Ce(ue), fe);
    else if (ie) {
      const me = {
        type: "rrweb",
        event: Ce(ue),
        origin: window.location.origin,
        isCheckout: fe
      };
      window.parent.postMessage(me, "*");
    }
    if (ue.type === re.FullSnapshot)
      ce = ue, Z = 0;
    else if (ue.type === re.IncrementalSnapshot) {
      if (ue.data.source === ee.Mutation && ue.data.isAttachIframe)
        return;
      Z++;
      const me = n && Z >= n, Y = r && ue.timestamp - ce.timestamp > r;
      (me || Y) && _r(!0);
    }
  };
  const L = (H) => {
    ye({
      type: re.IncrementalSnapshot,
      data: {
        source: ee.Mutation,
        ...H
      }
    });
  }, Pe = (H) => ye({
    type: re.IncrementalSnapshot,
    data: {
      source: ee.Scroll,
      ...H
    }
  }), Ee = (H) => ye({
    type: re.IncrementalSnapshot,
    data: {
      source: ee.CanvasMutation,
      ...H
    }
  }), pt = (H) => ye({
    type: re.IncrementalSnapshot,
    data: {
      source: ee.AdoptedStyleSheet,
      ...H
    }
  }), oe = new $h({
    mutationCb: L,
    adoptedStyleSheetCb: pt
  }), Se = new Mh({
    mirror: Ve,
    mutationCb: L,
    stylesheetManager: oe,
    recordCrossOriginIframes: S,
    wrappedEmit: ye
  });
  for (const H of z || [])
    H.getMirror && H.getMirror({
      nodeMirror: Ve,
      crossOriginIframeMirror: Se.crossOriginIframeMirror,
      crossOriginIframeStyleMirror: Se.crossOriginIframeStyleMirror
    });
  const Me = new Dh();
  wi = new _h({
    recordCanvas: b,
    mutationCb: Ee,
    win: window,
    blockClass: i,
    blockSelector: o,
    mirror: Ve,
    sampling: v.canvas,
    dataURLOptions: y
  });
  const We = new Rh({
    mutationCb: L,
    scrollCb: Pe,
    bypassOptions: {
      blockClass: i,
      blockSelector: o,
      maskTextClass: a,
      maskTextSelector: p,
      inlineStylesheet: s,
      maskInputOptions: he,
      dataURLOptions: y,
      maskTextFn: f,
      maskInputFn: m,
      recordCanvas: b,
      inlineImages: j,
      sampling: v,
      slimDOMOptions: ke,
      iframeManager: Se,
      stylesheetManager: oe,
      canvasManager: wi,
      keepIframeSrcFn: E,
      processedNodeManager: Me
    },
    mirror: Ve
  });
  _r = (H = !1) => {
    if (!w)
      return;
    ye(
      {
        type: re.Meta,
        data: {
          href: window.location.href,
          width: ll(),
          height: al()
        }
      },
      H
    ), oe.reset(), We.init(), Mt.forEach((Q) => Q.lock());
    const fe = fp(document, {
      mirror: Ve,
      blockClass: i,
      blockSelector: o,
      maskTextClass: a,
      maskTextSelector: p,
      inlineStylesheet: s,
      maskAllInputs: he,
      maskTextFn: f,
      maskInputFn: m,
      slimDOM: ke,
      dataURLOptions: y,
      recordCanvas: b,
      inlineImages: j,
      onSerialize: (Q) => {
        dl(Q, Ve) && Se.addIframe(Q), pl(Q, Ve) && oe.trackLinkElement(Q), Mi(Q) && We.addShadowRoot(K.shadowRoot(Q), document);
      },
      onIframeLoad: (Q, ue) => {
        Se.attachIframe(Q, ue), We.observeAttachShadow(Q);
      },
      onStylesheetLoad: (Q, ue) => {
        oe.attachLinkElement(Q, ue);
      },
      keepIframeSrcFn: E
    });
    if (!fe)
      return console.warn("Failed to snapshot the document");
    ye(
      {
        type: re.FullSnapshot,
        data: {
          node: fe,
          initialOffset: ol(window)
        }
      },
      H
    ), Mt.forEach((Q) => Q.unlock()), document.adoptedStyleSheets && document.adoptedStyleSheets.length > 0 && oe.adoptStyleSheets(
      document.adoptedStyleSheets,
      Ve.getId(document)
    );
  };
  try {
    const H = [], fe = (ue) => {
      var me;
      return te(Eh)(
        {
          mutationCb: L,
          mousemoveCb: (Y, Ze) => ye({
            type: re.IncrementalSnapshot,
            data: {
              source: Ze,
              positions: Y
            }
          }),
          mouseInteractionCb: (Y) => ye({
            type: re.IncrementalSnapshot,
            data: {
              source: ee.MouseInteraction,
              ...Y
            }
          }),
          scrollCb: Pe,
          viewportResizeCb: (Y) => ye({
            type: re.IncrementalSnapshot,
            data: {
              source: ee.ViewportResize,
              ...Y
            }
          }),
          inputCb: (Y) => ye({
            type: re.IncrementalSnapshot,
            data: {
              source: ee.Input,
              ...Y
            }
          }),
          mediaInteractionCb: (Y) => ye({
            type: re.IncrementalSnapshot,
            data: {
              source: ee.MediaInteraction,
              ...Y
            }
          }),
          styleSheetRuleCb: (Y) => ye({
            type: re.IncrementalSnapshot,
            data: {
              source: ee.StyleSheetRule,
              ...Y
            }
          }),
          styleDeclarationCb: (Y) => ye({
            type: re.IncrementalSnapshot,
            data: {
              source: ee.StyleDeclaration,
              ...Y
            }
          }),
          canvasMutationCb: Ee,
          fontCb: (Y) => ye({
            type: re.IncrementalSnapshot,
            data: {
              source: ee.Font,
              ...Y
            }
          }),
          selectionCb: (Y) => {
            ye({
              type: re.IncrementalSnapshot,
              data: {
                source: ee.Selection,
                ...Y
              }
            });
          },
          customElementCb: (Y) => {
            ye({
              type: re.IncrementalSnapshot,
              data: {
                source: ee.CustomElement,
                ...Y
              }
            });
          },
          blockClass: i,
          ignoreClass: l,
          ignoreSelector: d,
          maskTextClass: a,
          maskTextSelector: p,
          maskInputOptions: he,
          inlineStylesheet: s,
          sampling: v,
          recordDOM: w,
          recordCanvas: b,
          inlineImages: j,
          userTriggeredOnInput: I,
          collectFonts: R,
          doc: ue,
          maskInputFn: m,
          maskTextFn: f,
          keepIframeSrcFn: E,
          blockSelector: o,
          slimDOMOptions: ke,
          dataURLOptions: y,
          mirror: Ve,
          iframeManager: Se,
          stylesheetManager: oe,
          shadowDomManager: We,
          processedNodeManager: Me,
          canvasManager: wi,
          ignoreCSSAttributes: Ne,
          plugins: ((me = z == null ? void 0 : z.filter((Y) => Y.observer)) == null ? void 0 : me.map((Y) => ({
            observer: Y.observer,
            options: Y.options,
            callback: (Ze) => ye({
              type: re.Plugin,
              data: {
                plugin: Y.name,
                payload: Ze
              }
            })
          }))) || []
        },
        g
      );
    };
    Se.addLoadListener((ue) => {
      try {
        H.push(fe(ue.contentDocument));
      } catch (me) {
        console.warn(me);
      }
    });
    const Q = () => {
      _r(), H.push(fe(document)), jr = !0;
    };
    return ["interactive", "complete"].includes(document.readyState) ? Q() : (H.push(
      Le("DOMContentLoaded", () => {
        ye({
          type: re.DomContentLoaded,
          data: {}
        }), M === "DOMContentLoaded" && Q();
      })
    ), H.push(
      Le(
        "load",
        () => {
          ye({
            type: re.Load,
            data: {}
          }), M === "load" && Q();
        },
        window
      )
    )), () => {
      H.forEach((ue) => {
        try {
          ue();
        } catch (me) {
          String(me).toLowerCase().includes("cross-origin") || console.warn(me);
        }
      }), Me.destroy(), jr = !1, ph();
    };
  } catch (H) {
    console.warn(H);
  }
}
bt.addCustomEvent = (e, t) => {
  if (!jr)
    throw new Error("please add custom event after start recording");
  ye({
    type: re.Custom,
    data: {
      tag: e,
      payload: t
    }
  });
};
bt.freezePage = () => {
  Mt.forEach((e) => e.freeze());
};
bt.takeFullSnapshot = (e) => {
  if (!jr)
    throw new Error("please take full snapshot after start recording");
  _r(e);
};
bt.mirror = Ve;
var ea;
(function(e) {
  e[e.NotStarted = 0] = "NotStarted", e[e.Running = 1] = "Running", e[e.Stopped = 2] = "Stopped";
})(ea || (ea = {}));
const { addCustomEvent: Rf } = bt, { freezePage: Af } = bt, { takeFullSnapshot: If } = bt, ki = 2, zh = 4;
class Fh {
  constructor(t) {
    wr(this, "events", []);
    wr(this, "lastMeta", null);
    wr(this, "lastFull", null);
    this.opts = t;
  }
  push(t) {
    t.type === zh && (this.lastMeta = t), t.type === ki && (this.lastFull = t, this.events = []), this.events.push(t), this.prune();
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
    return !this.events.some((n) => n.type === ki) && this.lastFull && (this.lastMeta && t.push(this.lastMeta), t.push(this.lastFull)), [...t, ...this.events];
  }
  /** True when the buffer can produce a scrubbable replay (a full snapshot + at least one more event). */
  isPlayable() {
    const t = this.snapshot();
    return t.some((n) => n.type === ki) && t.length >= 2;
  }
  clear() {
    this.events = [], this.lastMeta = null, this.lastFull = null;
  }
}
function Uh(e, t = {}) {
  const r = new Fh({
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
const Cl = "klav-sims-live", El = "klav-sims-overlay", ta = "klav-sims-ext-css";
let De = null, Et = null, $e = null, Wt = null;
const Hr = /* @__PURE__ */ new Map(), qe = /* @__PURE__ */ new Map();
let Ml = 0, st = !1, Rt = null, Vt = null, yr = !1, Oe = null, nr = null, mt = null, gt = null, Ge = null, At = null, Ye = null, nt = null, Xe = null, jt = null;
const Vr = /* @__PURE__ */ new Set();
function Bh(e) {
  return String(e || "").trim().toLowerCase().replace(/\s+/g, " ");
}
function Rl(e, t) {
  return `${e}::${Bh(t.text)}`;
}
function Al(e) {
  try {
    document.dispatchEvent(new CustomEvent("klavity:sims-live", { detail: { active: e } }));
  } catch {
  }
}
const qh = `
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
`, Wh = `
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
function ra(e, t) {
  const r = e.replace("#", ""), n = (d) => parseInt(d, 16), [i, o, l] = r.length === 3 ? [n(r[0] + r[0]), n(r[1] + r[1]), n(r[2] + r[2])] : [n(r.slice(0, 2)), n(r.slice(2, 4)), n(r.slice(4, 6))];
  return `rgba(${i},${o},${l},${t})`;
}
function jh(e) {
  if (e.suggestedBug) return !0;
  const t = String(e.priority ?? "").trim().toLowerCase();
  if (t && t !== "none") return !0;
  const r = String(e.sentiment ?? "").trim().toLowerCase();
  return r ? !(/* @__PURE__ */ new Set(["positive", "satisfied", "delighted", "neutral", "none"])).has(r) : !1;
}
function Ai() {
  var e, t;
  try {
    return ((t = (e = window.matchMedia) == null ? void 0 : e.call(window, "(prefers-reduced-motion: reduce)")) == null ? void 0 : t.matches) ?? !1;
  } catch {
    return !1;
  }
}
function Hh(e) {
  return new Promise((t) => setTimeout(t, e));
}
function Yt(e) {
  const t = String(e.priority ?? "").trim().toLowerCase();
  return t === "high" || t === "critical" || t === "urgent" ? "HIGH" : t === "medium" || t === "med" ? "MED" : t === "low" ? "LOW" : e.suggestedBug ? "HIGH" : null;
}
const Il = { HIGH: "h", MED: "m", LOW: "l" }, na = { HIGH: 0, MED: 1, LOW: 2 };
function Vh(e) {
  if (!e) return !1;
  if (e === $e || e === De || e.id === El || e.id === Cl || e.id === "klavity-widget-host") return !0;
  const t = e.classList;
  return !!t && t.contains("klav-halo");
}
function Yh(e) {
  const t = [];
  for (const r of [$e, De])
    r && (t.push({ el: r, vis: r.style.visibility }), r.style.visibility = "hidden");
  try {
    return e();
  } finally {
    for (const { el: r, vis: n } of t) r.style.visibility = n;
  }
}
function Ol(e) {
  const t = e.targetViewport;
  return {
    scrollX: Number.isFinite(t == null ? void 0 : t.scrollX) ? Number(t.scrollX) : window.scrollX,
    scrollY: Number.isFinite(t == null ? void 0 : t.scrollY) ? Number(t.scrollY) : window.scrollY,
    width: Math.max(1, Number.isFinite(t == null ? void 0 : t.width) ? Number(t.width) : window.innerWidth),
    height: Math.max(1, Number.isFinite(t == null ? void 0 : t.height) ? Number(t.height) : window.innerHeight)
  };
}
function Ll(e, t) {
  return new DOMRect(
    t.scrollX + e.x * t.width,
    t.scrollY + e.y * t.height,
    Math.max(1, e.w * t.width),
    Math.max(1, e.h * t.height)
  );
}
function ia(e) {
  return Math.max(0, e.width) * Math.max(0, e.height);
}
function Gh(e, t) {
  const r = Math.max(e.left, t.left), n = Math.min(e.right, t.right), i = Math.max(e.top, t.top), o = Math.min(e.bottom, t.bottom);
  return Math.max(0, n - r) * Math.max(0, o - i);
}
function Xh(e) {
  return new DOMRect(e.left + window.scrollX, e.top + window.scrollY, e.width, e.height);
}
function Tl(e) {
  if (!e || !(e instanceof HTMLElement) || e === document.body || e === document.documentElement || Vh(e)) return !1;
  const t = e.getBoundingClientRect();
  if (t.width < 8 || t.height < 8) return !1;
  try {
    const r = getComputedStyle(e);
    if (r.display === "none" || r.visibility === "hidden" || Number(r.opacity) === 0) return !1;
  } catch {
  }
  return !0;
}
function Kh(e, t) {
  return Yh(() => {
    const r = /* @__PURE__ */ new Set(), n = [], i = (l) => {
      let d = l;
      for (; d && d !== document.body && d !== document.documentElement; )
        !r.has(d) && Tl(d) && (r.add(d), n.push(d)), d = d.parentElement;
    }, o = typeof document.elementsFromPoint == "function" ? document.elementsFromPoint(e, t) : [document.elementFromPoint(e, t)].filter(Boolean);
    for (const l of o) i(l);
    return n;
  });
}
function Jh(e, t) {
  const r = Ol(t), n = Ll(e, r), i = Math.max(2, Math.min(window.innerWidth - 2, n.left + n.width / 2 - window.scrollX)), o = Math.max(2, Math.min(window.innerHeight - 2, n.top + n.height / 2 - window.scrollY)), l = Kh(i, o);
  if (!l.length) return null;
  const d = Math.max(1, ia(n));
  let a = null, p = -1 / 0;
  for (const s of l) {
    const h = Xh(s.getBoundingClientRect()), u = Gh(h, n);
    if (u <= 0) continue;
    const c = Math.max(1, ia(h)), m = u / d, f = Math.max(0, (c - u) / c), g = s.tagName.toLowerCase(), k = /^(button|a|input|textarea|select|label|section|article|nav|header|footer|main|form)$/.test(g) ? 0.18 : 0, v = c > window.innerWidth * window.innerHeight * 0.92 ? 0.8 : 0, y = m - f * 0.35 + k - v;
    y > p && (a = s, p = y);
  }
  return a ?? l[0] ?? null;
}
async function Zh(e, t) {
  if (e >= window.scrollX + 80 && e <= window.scrollX + window.innerWidth - 80 && t >= window.scrollY + 80 && t <= window.scrollY + window.innerHeight - 80) return;
  const i = Math.max(0, document.documentElement.scrollHeight - window.innerHeight), o = Math.max(0, document.documentElement.scrollWidth - window.innerWidth), l = Math.max(0, Math.min(i, t - window.innerHeight * 0.38)), d = Math.max(0, Math.min(o, e - window.innerWidth * 0.45));
  try {
    window.scrollTo({ top: l, left: d, behavior: Ai() ? "auto" : "smooth" });
  } catch {
    window.scrollTo(d, l);
  }
  await Hh(Ai() ? 80 : 520);
}
const Qh = /* @__PURE__ */ new Set([
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
function ef(e) {
  const t = /* @__PURE__ */ new Set();
  return String(e || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((r) => r.length < 4 || Qh.has(r) || t.has(r) ? !1 : (t.add(r), !0));
}
function tf(e) {
  const t = ef(e.text);
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
    if (!Tl(l)) continue;
    const d = l.getBoundingClientRect(), a = [
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
    const s = l.tagName.toLowerCase(), h = /^(button|a|input|textarea|select|label|h1|h2|h3|section|article|nav|header|footer|main|form)$/.test(s) ? 0.6 : 0, c = Math.max(1, d.width * d.height) > window.innerWidth * window.innerHeight * 0.85 ? 1.1 : 0, m = p / t.length + h - c;
    m > i && (n = l, i = m);
  }
  return n;
}
async function rf(e, t = {}) {
  if (e.region) {
    const r = Ol(e), n = Ll(e.region, r);
    t.scroll !== !1 && await Zh(n.left + n.width / 2, n.top + n.height / 2);
    const i = Jh(e.region, e);
    if (i) return i;
  }
  return tf(e);
}
function nf() {
  if (De && Et) return Et;
  De = document.createElement("div"), De.id = Cl, De.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;", Et = De.attachShadow({ mode: "open" }), pd(Et);
  const e = document.createElement("style");
  return e.textContent = qh, Et.appendChild(e), document.body.appendChild(De), Et;
}
function Nl() {
  if ($e) return $e;
  if (!document.getElementById(ta)) {
    const e = document.createElement("style");
    e.id = ta, e.textContent = Wh, document.head.appendChild(e);
  }
  return $e = document.createElement("div"), $e.id = El, $e.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;z-index:2147483640;pointer-events:none;overflow:visible;", document.body.appendChild($e), $e;
}
function Pl(e, t) {
  return ud({
    name: e.name,
    initials: e.initials,
    photoUrl: e.photoUrl,
    color: e.accent,
    animate: !1,
    legs: !0,
    size: t
  });
}
function sf(e, t = [], r = {}) {
  if (typeof document > "u") return;
  Oi();
  const n = nf();
  Nl(), Wt = new AbortController();
  const i = e === "all" ? t : t.filter((h) => e.includes(h.id));
  if (!i.length) {
    console.warn("[KlavitySims] deploy(): no matching Sims — panel not mounted."), Oi();
    return;
  }
  i.slice(0, 8).forEach((h) => {
    const u = h.accent || "#6366f1", c = h.initials || h.name.slice(0, 2).toUpperCase();
    Hr.set(h.id, { simId: h.id, accent: u, initials: c, name: h.name, photoUrl: h.photoUrl });
  });
  const o = document.createElement("div");
  o.className = "ksl-root", n.appendChild(o), Xe = document.createElement("div"), Xe.className = "ksl-sr", Xe.id = "ksl-announcer", Xe.setAttribute("aria-live", "polite"), Xe.setAttribute("aria-atomic", "true"), o.appendChild(Xe), Oe = document.createElement("button"), Oe.type = "button", Oe.className = "ksl-launcher", Oe.setAttribute("aria-label", "Open Sims feedback panel"), Oe.addEventListener("click", () => of());
  const l = document.createElement("span");
  l.className = "ksl-pill", nr = document.createElement("span"), nr.className = "ksl-pill-avatars", mt = document.createElement("span"), mt.className = "ksl-pill-txt", l.append(nr, mt), gt = document.createElement("span"), gt.className = "ksl-pill-badge", gt.hidden = !0, Oe.append(l, gt), o.appendChild(Oe), i.slice(0, 3).forEach((h) => {
    const u = Hr.get(h.id);
    u && nr.appendChild(Pl(u, 26));
  }), Ge = document.createElement("section"), Ge.className = "ksl-panel", Ge.setAttribute("aria-label", "Sims feedback"), Ge.setAttribute("role", "dialog");
  const d = document.createElement("div");
  d.className = "ksl-head";
  const a = document.createElement("div");
  a.className = "ksl-title-row";
  const p = document.createElement("div");
  p.className = "ksl-title", p.textContent = "Sims feedback";
  const s = document.createElement("button");
  s.type = "button", s.className = "ksl-icon-btn", s.title = "Minimize", s.setAttribute("aria-label", "Minimize Sims feedback panel"), s.innerHTML = J("x", { size: 15 }), s.addEventListener("click", () => sa()), a.append(p, s), At = document.createElement("div"), At.className = "ksl-count", Ye = document.createElement("div"), Ye.className = "ksl-chips", d.append(a, At, Ye), nt = document.createElement("div"), nt.className = "ksl-list", nt.setAttribute("role", "list"), Ge.append(d, nt), o.appendChild(Ge), document.addEventListener("keydown", (h) => {
    h.key === "Escape" && st && sa();
  }, { signal: Wt.signal }), Al(!0), Zt();
}
function _l(e) {
  yr = e, Oe == null || Oe.classList.toggle("is-reviewing", e), Zt(), st && Jt();
}
function of() {
  !Ge || !Oe || (st = !0, Ge.classList.add("is-open"), Oe.hidden = !0, Jt());
}
function sa() {
  !Ge || !Oe || (st = !1, Ge.classList.remove("is-open"), Oe.hidden = !1, Zt());
}
function $l() {
  const e = Array.from(qe.values()), t = new Set(e.map((n) => n.entry.simId)), r = e.filter((n) => Yt(n.obs) === "HIGH").length;
  return { total: e.length, sims: t.size, high: r };
}
function Zt() {
  const e = $l();
  mt && (yr && e.total === 0 ? mt.innerHTML = "Your Sims are reviewing…" : e.total === 0 ? mt.innerHTML = "Sims are watching this page" : mt.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from your Sims`), gt && (gt.hidden = e.high === 0, gt.textContent = `${e.high} high`), st && Dl(e);
}
function Dl(e) {
  At && (e.total === 0 ? At.innerHTML = yr ? "Your Sims are reviewing this page…" : "No findings yet — your Sims are watching." : At.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from <b>${e.sims}</b> Sim${e.sims === 1 ? "" : "s"}` + (e.high > 0 ? ` · <span class="ksl-hi">${e.high} high</span>` : "")), af();
}
function af() {
  if (!Ye) return;
  const e = Array.from(qe.values());
  if (Ye.hidden = e.length === 0, Ye.textContent = "", !e.length) return;
  const t = document.createElement("span");
  t.className = "ksl-chips-label", t.textContent = "Sim", Ye.appendChild(t);
  const r = /* @__PURE__ */ new Map();
  e.forEach((i) => {
    const o = r.get(i.entry.simId) ?? { entry: i.entry, n: 0 };
    o.n += 1, r.set(i.entry.simId, o);
  }), r.forEach(({ entry: i, n: o }) => {
    const l = document.createElement("button");
    l.type = "button", l.className = "ksl-chip" + (Rt === i.simId ? " is-on" : ""), l.setAttribute("aria-pressed", String(Rt === i.simId));
    const d = document.createElement("span");
    d.className = "ksl-dot", d.style.background = i.accent, l.append(d, document.createTextNode(`${i.initials} · ${o}`)), l.addEventListener("click", () => {
      Rt = Rt === i.simId ? null : i.simId, Jt();
    }), Ye.appendChild(l);
  });
  const n = document.createElement("span");
  n.className = "ksl-chips-label", n.style.marginLeft = "6px", n.textContent = "Priority", Ye.appendChild(n), ["HIGH", "MED", "LOW"].forEach((i) => {
    const o = e.filter((a) => Yt(a.obs) === i).length;
    if (!o) return;
    const l = document.createElement("button");
    l.type = "button";
    const d = Vt === i;
    l.className = "ksl-chip" + (d ? ` sev-on-${Il[i]}` : ""), l.setAttribute("aria-pressed", String(d)), l.textContent = `${i} · ${o}`, l.addEventListener("click", () => {
      Vt = Vt === i ? null : i, Jt();
    }), Ye.appendChild(l);
  });
}
function lf() {
  return Array.from(qe.values()).filter((e) => !Rt || e.entry.simId === Rt).filter((e) => !Vt || Yt(e.obs) === Vt).sort((e, t) => {
    const r = Yt(e.obs), n = Yt(t.obs), i = r ? na[r] : 3, o = n ? na[n] : 3;
    return i - o;
  });
}
function cf(e) {
  const { entry: t, obs: r } = e, n = Yt(r), i = document.createElement("div");
  i.className = "ksl-row", i.setAttribute("role", "listitem"), i.dataset.id = e.id, i.style.borderLeftColor = t.accent;
  const o = document.createElement("div");
  o.className = "ksl-r-head", o.appendChild(Pl(t, 26));
  const l = document.createElement("span");
  l.className = "ksl-r-name", l.style.color = t.accent, l.textContent = t.name, o.appendChild(l);
  const d = String(r.sentiment ?? "").trim();
  if (d) {
    const m = document.createElement("span");
    m.className = "ksl-r-sent", m.textContent = d, o.appendChild(m);
  }
  if (n) {
    const m = document.createElement("span");
    m.className = `ksl-sev ${Il[n]}`, m.setAttribute("aria-label", `Priority: ${n}`), m.textContent = n, o.appendChild(m);
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
  h.type = "button", h.className = "ksl-r-act track", h.innerHTML = J("bug", { size: 12 }) + " Track as Bug", h.setAttribute("aria-label", `Track feedback from ${t.name} as a bug`), h.addEventListener("click", () => {
    var m;
    (m = $r.onTriage) == null || m.call($r, r, t.name), oa(e.id);
  });
  const u = document.createElement("button");
  u.type = "button", u.className = "ksl-r-act jump", u.innerHTML = J("map-pin", { size: 12 }) + " Jump to on page", u.setAttribute("aria-label", `Jump to where ${t.name} flagged this`), u.addEventListener("click", () => {
    df(e.id);
  });
  const c = document.createElement("button");
  return c.type = "button", c.className = "ksl-r-act dismiss", c.textContent = "Dismiss", c.setAttribute("aria-label", `Dismiss feedback from ${t.name}`), c.addEventListener("click", () => {
    oa(e.id);
  }), s.append(h, u, c), i.appendChild(s), i;
}
function uf(e) {
  e.querySelectorAll(".ksl-row").forEach((t) => {
    const r = t.querySelector(".ksl-r-obs");
    r && r.scrollHeight - r.clientHeight > 4 && t.classList.add("is-clamped");
  });
}
function Jt() {
  if (!nt || !st) {
    Zt();
    return;
  }
  const e = $l();
  Dl(e);
  const t = lf();
  if (nt.textContent = "", !t.length) {
    const n = document.createElement("div");
    n.className = "ksl-empty";
    const i = qe.size > 0;
    if (yr && !i) {
      const o = document.createElement("div");
      o.className = "ksl-empty-title", o.textContent = "Your Sims are reviewing this page…";
      const l = document.createElement("div");
      l.textContent = "Findings will appear here as they spot things.";
      const d = document.createElement("div");
      d.className = "ksl-shimmer", n.append(o, l, d);
    } else if (i)
      n.textContent = "No findings match these filters.";
    else {
      const o = document.createElement("div");
      o.className = "ksl-empty-title", o.textContent = "No findings yet";
      const l = document.createElement("div");
      l.textContent = "Your Sims are watching this page as a first-time customer would.", n.append(o, l);
    }
    nt.appendChild(n), qe.forEach((o) => {
      o.rowEl = null;
    });
    return;
  }
  t.forEach((n) => {
    const i = cf(n);
    n.rowEl = i, nt.appendChild(i);
  });
  const r = new Set(t.map((n) => n.id));
  qe.forEach((n) => {
    r.has(n.id) || (n.rowEl = null);
  }), uf(nt);
}
function Ii() {
  jt == null || jt(), jt = null;
}
async function df(e) {
  const t = qe.get(e);
  if (!t) return;
  const r = await rf(t.obs, { scroll: !0 });
  !r || !$e || pf(r, t.entry.accent);
}
function pf(e, t) {
  Ii();
  const r = Nl(), n = document.createElement("div");
  n.className = "klav-halo", n.style.borderColor = t, n.style.boxShadow = `0 0 0 4px ${ra(t, 0.16)},0 0 24px ${ra(t, 0.2)}`, r.appendChild(n);
  const i = new AbortController(), o = () => {
    const p = e.getBoundingClientRect(), s = p.width > 0 && p.height > 0 && p.bottom > 0 && p.right > 0 && p.top < window.innerHeight && p.left < window.innerWidth;
    n.style.display = s ? "" : "none", s && (n.style.left = `${p.left - 5}px`, n.style.top = `${p.top - 5}px`, n.style.width = `${p.width + 10}px`, n.style.height = `${p.height + 10}px`);
  }, l = () => requestAnimationFrame(o);
  o(), window.addEventListener("scroll", l, { passive: !0, signal: i.signal }), window.addEventListener("resize", l, { signal: i.signal });
  const d = setTimeout(() => {
    n.style.opacity = "0", n.style.transition = "opacity .3s ease", setTimeout(() => {
      jt === a && Ii();
    }, 320);
  }, 3200), a = () => {
    clearTimeout(d), i.abort(), n.remove();
  };
  jt = a;
}
function hf(e, t) {
  const r = `f_${e.simId}_${++Ml}`;
  qe.set(r, { id: r, entry: e, obs: t, rowEl: null }), st ? Jt() : Zt(), Xe && (Xe.textContent = "", requestAnimationFrame(() => {
    Xe && (Xe.textContent = `${e.name}: ${t.text || ""}`);
  }));
}
function ff(e) {
  const t = qe.get(e);
  if (!t) return;
  const r = () => {
    qe.delete(e), st ? Jt() : Zt();
  };
  t.rowEl && st ? (t.rowEl.classList.add("is-removing"), setTimeout(r, Ai() ? 0 : 300)) : r();
}
function oa(e) {
  const t = qe.get(e);
  t && (Vr.add(Rl(t.entry.simId, t.obs)), ff(e));
}
function mf(e, t, r) {
  if (!De) return;
  const n = Hr.get(e);
  if (!n) {
    console.warn(`[KlavitySims] renderFeedback: simId "${e}" not registered`);
    return;
  }
  if (r.length) {
    _l(!1);
    for (const i of r) {
      if (!jh(i)) continue;
      const o = Rl(e, i);
      Vr.has(o) || (Vr.add(o), hf(n, i));
    }
  }
}
function Oi() {
  Ii(), qe.clear(), Ml = 0, Hr.clear(), Vr.clear(), st = !1, Rt = null, Vt = null, yr = !1, Wt == null || Wt.abort(), Wt = null, Oe = null, nr = null, mt = null, gt = null, Ge = null, At = null, Ye = null, nt = null, Xe = null, $e == null || $e.remove(), $e = null, De == null || De.remove(), De = null, Et = null, Al(!1);
}
const $r = {
  deploy: sf,
  setReviewing: _l,
  renderFeedback: mf,
  undeploy: Oi,
  onTriage: null
};
function gf() {
  typeof window > "u" || window.KlavitySims || (window.KlavitySims = $r);
}
typeof window < "u" && gf();
const aa = "klav-ao-css", yf = "klav-ao-overlay";
function bf(e, t, r, n, i, o = 10) {
  const a = !(e.y - r - 14 >= o), p = a ? e.y + e.h + 14 : e.y - r - 14, s = Math.max(o, Math.min(p, i - r - o));
  return { left: Math.max(o, Math.min(e.x, n - t - o)), top: s, below: a };
}
const vf = `
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
let Ct = null, wf = 1;
const Yr = /* @__PURE__ */ new Map();
function la(e, t) {
  const r = e.replace("#", ""), n = (d) => parseInt(d, 16), [i, o, l] = r.length === 3 ? [n(r[0] + r[0]), n(r[1] + r[1]), n(r[2] + r[2])] : [n(r.slice(0, 2)), n(r.slice(2, 4)), n(r.slice(4, 6))];
  return `rgba(${i},${o},${l},${t})`;
}
function kf() {
  if (Ct) return Ct;
  if (!document.getElementById(aa)) {
    const e = document.createElement("style");
    e.id = aa, e.textContent = vf, document.head.appendChild(e);
  }
  return Ct = document.createElement("div"), Ct.id = yf, Ct.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;pointer-events:none;overflow:visible;z-index:2147483640;", document.body.appendChild(Ct), Ct;
}
function Of(e, t, r = {}) {
  const n = kf(), i = r.color ?? "#6366f1", o = `klav-ao-${wf++}`, l = 5, d = document.createElement("div");
  d.className = "klav-ao-halo", d.dataset.aoId = o, d.style.left = e.x - l + "px", d.style.top = e.y - l + "px", d.style.width = e.w + l * 2 + "px", d.style.height = e.h + l * 2 + "px", d.style.borderColor = i, d.style.boxShadow = `0 0 0 4px ${la(i, 0.14)},0 0 24px ${la(i, 0.18)}`, n.appendChild(d);
  let a = null;
  if (t) {
    const h = { x: e.x - l, y: e.y - l, w: e.w + l * 2, h: e.h + l * 2 }, { left: u, top: c, below: m } = bf(
      h,
      224,
      96,
      window.innerWidth,
      window.innerHeight
    );
    a = document.createElement("div"), a.className = "klav-ao-pin" + (m ? " tail-top" : ""), a.dataset.aoId = o, a.style.borderLeftColor = i, a.style.left = u + "px", a.style.top = c + "px", a.setAttribute("role", "status"), a.setAttribute("aria-label", `Annotation: ${t}`);
    const f = document.createElement("div");
    f.className = "klav-ao-hd";
    const g = document.createElement("span");
    g.className = "klav-ao-lbl", g.style.color = i, g.textContent = t, f.appendChild(g);
    const k = r.priority ?? r.severity;
    if (k) {
      const y = k === "medium" ? " sev-m" : k === "low" ? " sev-l" : "", x = document.createElement("span");
      x.className = `klav-ao-sev${y}`, x.textContent = k, f.appendChild(x);
    }
    const v = document.createElement("button");
    v.className = "klav-ao-dismiss", v.textContent = "Dismiss", v.addEventListener("click", () => zl(o)), a.appendChild(f), a.appendChild(v), n.appendChild(a);
  }
  return Yr.set(o, { halo: d, pin: a }), o;
}
function zl(e) {
  const t = Yr.get(e);
  if (!t) return;
  Yr.delete(e);
  const { halo: r, pin: n } = t;
  n ? (n.classList.add("is-out"), r.style.animation = "klav-ao-pin-out .22s ease-in forwards", setTimeout(() => {
    n.remove(), r.remove();
  }, 240)) : r.remove();
}
function Lf() {
  for (const e of [...Yr.keys()]) zl(e);
}
let Fl = Dt;
const Ul = { consoleErrors: [], networkFailures: [] };
let Bl, ql, Gt = null;
function Wl(e) {
  const t = {};
  for (const [r, n] of Object.entries(e))
    n != null && (t[String(r).slice(0, 64)] = String(n).slice(0, 1e3));
  return t;
}
async function ca() {
  return Tu(document.body, {
    filter: (e) => e.id !== "klavity-sdk-host"
  });
}
function xf() {
  return qu(Ul, { identity: Bl, metadata: ql });
}
async function Sf(e) {
  return $u(
    { type: e.type, description: e.description, context: e.context, screenshots: e.screenshots, replayEvents: e.replayEvents },
    Fl,
    { jira: fd, linear: md, github: gd, plane: yd, backend: vd }
  );
}
function Qi(e = "bug") {
  const t = rd(e, {
    onCaptureFull: ca,
    onSubmit: async (r) => Sf({
      type: r.type,
      description: r.description,
      context: xf(),
      screenshots: r.screenshots,
      replayEvents: (Gt == null ? void 0 : Gt.getEvents()) ?? []
    })
  });
  setTimeout(async () => {
    try {
      const r = await ca();
      t.addScreenshot(r);
    } catch {
    }
  }, 200);
}
function Cf() {
  Wu(Ul, { consoleLevels: !0 });
}
function jl(e) {
  Bl = e ? Wl(e) : void 0;
}
function Hl(e) {
  ql = e ? Wl(e) : void 0;
}
function Ef() {
  document.addEventListener("contextmenu", (e) => {
    if (Qu(e.target)) return;
    e.preventDefault();
    const t = document.createElement("div");
    t.style.cssText = `position:fixed;left:${Math.min(e.clientX, window.innerWidth - 200)}px;top:${Math.min(e.clientY, window.innerHeight - 80)}px;background:#1e1e2e;border:1px solid #45475a;border-radius:8px;padding:4px;z-index:2147483647;box-shadow:0 8px 24px rgba(0,0,0,.4);font-family:system-ui;`, t.innerHTML = `
      <div data-action="bug" style="padding:8px 16px;cursor:pointer;color:#cdd6f4;font-size:13px;border-radius:4px;">${J("bug")} Report a Bug</div>
      <div data-action="feature" style="padding:8px 16px;cursor:pointer;color:#cdd6f4;font-size:13px;border-radius:4px;">${J("lightbulb")} Request a Feature</div>
    `, document.body.appendChild(t);
    const r = (n) => {
      (!n || !t.contains(n.target)) && (t.remove(), document.removeEventListener("click", r));
    };
    t.addEventListener("click", (n) => {
      var o;
      const i = (o = n.target.closest("[data-action]")) == null ? void 0 : o.getAttribute("data-action");
      t.remove(), document.removeEventListener("click", r), i && Qi(i);
    }), setTimeout(() => document.addEventListener("click", r), 0);
  });
}
function Vl(e = {}) {
  if (Fl = {
    ...Dt,
    ...e,
    jira: { ...Dt.jira, ...e.jira },
    linear: { ...Dt.linear, ...e.linear },
    github: { ...Dt.github, ...e.github },
    plane: { ...Dt.plane, ...e.plane }
  }, Cf(), Ef(), !Gt)
    try {
      Gt = Uh(bt);
    } catch {
      Gt = null;
    }
}
typeof window < "u" && (window.KlavitySnap = { init: Vl, openModal: Qi, identify: jl, setMetadata: Hl });
const Tf = { init: Vl, openModal: Qi, identify: jl, setMetadata: Hl };
export {
  $r as KlavitySims,
  $r as SimsLive,
  zl as clearAnnotation,
  Lf as clearAnnotations,
  Tf as default,
  jl as identify,
  Vl as init,
  gf as installKlavitySims,
  Qi as openModal,
  Hl as setMetadata,
  Of as showAnnotation
};
