var Qp = Object.defineProperty;
var eh = (e, t, r) => t in e ? Qp(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var ri = (e, t, r) => eh(e, typeof t != "symbol" ? t + "" : t, r);
function th(e, t) {
  return e[13] = 1, e[14] = t >> 8, e[15] = t & 255, e[16] = t >> 8, e[17] = t & 255, e;
}
const ku = 112, vu = 72, wu = 89, xu = 115;
let yo;
function rh() {
  const e = new Int32Array(256);
  for (let t = 0; t < 256; t++) {
    let r = t;
    for (let n = 0; n < 8; n++)
      r = r & 1 ? 3988292384 ^ r >>> 1 : r >>> 1;
    e[t] = r;
  }
  return e;
}
function nh(e) {
  let t = -1;
  yo || (yo = rh());
  for (let r = 0; r < e.length; r++)
    t = yo[(t ^ e[r]) & 255] ^ t >>> 8;
  return t ^ -1;
}
function ih(e) {
  const t = e.length - 1;
  for (let r = t; r >= 4; r--)
    if (e[r - 4] === 9 && e[r - 3] === ku && e[r - 2] === vu && e[r - 1] === wu && e[r] === xu)
      return r - 3;
  return 0;
}
function oh(e, t, r = !1) {
  const n = new Uint8Array(13);
  t *= 39.3701, n[0] = ku, n[1] = vu, n[2] = wu, n[3] = xu, n[4] = t >>> 24, n[5] = t >>> 16, n[6] = t >>> 8, n[7] = t & 255, n[8] = n[4], n[9] = n[5], n[10] = n[6], n[11] = n[7], n[12] = 1;
  const i = nh(n), o = new Uint8Array(4);
  if (o[0] = i >>> 24, o[1] = i >>> 16, o[2] = i >>> 8, o[3] = i & 255, r) {
    const s = ih(e);
    return e.set(n, s), e.set(o, s + 13), e;
  } else {
    const s = new Uint8Array(4);
    s[0] = 0, s[1] = 0, s[2] = 0, s[3] = 9;
    const c = new Uint8Array(54);
    return c.set(e, 0), c.set(s, 33), c.set(n, 37), c.set(o, 50), c;
  }
}
const sh = "AAlwSFlz", ah = "AAAJcEhZ", lh = "AAAACXBI";
function ch(e) {
  let t = e.indexOf(sh);
  return t === -1 && (t = e.indexOf(ah)), t === -1 && (t = e.indexOf(lh)), t;
}
const Su = "[modern-screenshot]", Er = typeof window < "u", uh = Er && "Worker" in window, dh = Er && "atob" in window, ph = Er && "btoa" in window;
var bu;
const Ks = Er ? (bu = window.navigator) == null ? void 0 : bu.userAgent : "", Eu = Ks.includes("Chrome"), Ei = Ks.includes("AppleWebKit") && !Eu, Xs = Ks.includes("Firefox"), hh = (e) => e && "__CONTEXT__" in e, fh = (e) => e.constructor.name === "CSSFontFaceRule", mh = (e) => e.constructor.name === "CSSImportRule", gh = (e) => e.constructor.name === "CSSLayerBlockRule", ir = (e) => e.nodeType === 1, qn = (e) => typeof e.className == "object", Cu = (e) => e.tagName === "image", yh = (e) => e.tagName === "use", $n = (e) => ir(e) && typeof e.style < "u" && !qn(e), bh = (e) => e.nodeType === 8, kh = (e) => e.nodeType === 3, yn = (e) => e.tagName === "IMG", $i = (e) => e.tagName === "VIDEO", vh = (e) => e.tagName === "CANVAS", wh = (e) => e.tagName === "TEXTAREA", xh = (e) => e.tagName === "INPUT", Sh = (e) => e.tagName === "STYLE", Eh = (e) => e.tagName === "SCRIPT", Ch = (e) => e.tagName === "SELECT", Mh = (e) => e.tagName === "SLOT", Rh = (e) => e.tagName === "IFRAME", Th = (...e) => console.warn(Su, ...e);
function Ah(e) {
  var r;
  const t = (r = e == null ? void 0 : e.createElement) == null ? void 0 : r.call(e, "canvas");
  return t && (t.height = t.width = 1), !!t && "toDataURL" in t && !!t.toDataURL("image/webp").includes("image/webp");
}
const Ps = (e) => e.startsWith("data:");
function Mu(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (Er && e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i) || !Er)
    return e;
  const r = zi().implementation.createHTMLDocument(), n = r.createElement("base"), i = r.createElement("a");
  return r.head.appendChild(n), r.body.appendChild(i), t && (n.href = t), i.href = e, i.href;
}
function zi(e) {
  return (e && ir(e) ? e == null ? void 0 : e.ownerDocument : e) ?? window.document;
}
const Di = "http://www.w3.org/2000/svg";
function _h(e, t, r) {
  const n = zi(r).createElementNS(Di, "svg");
  return n.setAttributeNS(null, "width", e.toString()), n.setAttributeNS(null, "height", t.toString()), n.setAttributeNS(null, "viewBox", `0 0 ${e} ${t}`), n;
}
function Lh(e, t) {
  let r = new XMLSerializer().serializeToString(e);
  return t && (r = r.replace(/[\u0000-\u0008\v\f\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/gu, "")), `data:image/svg+xml;charset=utf-8,${encodeURIComponent(r)}`;
}
function Ih(e, t) {
  return new Promise((r, n) => {
    const i = new FileReader();
    i.onload = () => r(i.result), i.onerror = () => n(i.error), i.onabort = () => n(new Error(`Failed read blob to ${t}`)), i.readAsDataURL(e);
  });
}
const Oh = (e) => Ih(e, "dataUrl");
function hn(e, t) {
  const r = zi(t).createElement("img");
  return r.decoding = "sync", r.loading = "eager", r.src = e, r;
}
function zn(e, t) {
  return new Promise((r) => {
    const { timeout: n, ownerDocument: i, onError: o, onWarn: s } = t ?? {}, c = typeof e == "string" ? hn(e, zi(i)) : e;
    let l = null, d = null;
    function a() {
      r(c), l && clearTimeout(l), d == null || d();
    }
    if (n && (l = setTimeout(a, n)), $i(c)) {
      const h = c.currentSrc || c.src;
      if (!h)
        return c.poster ? zn(c.poster, t).then(r) : a();
      if (c.readyState >= 2)
        return a();
      const p = a, u = (m) => {
        s == null || s(
          "Failed video load",
          h,
          m
        ), o == null || o(m), a();
      };
      d = () => {
        c.removeEventListener("loadeddata", p), c.removeEventListener("error", u);
      }, c.addEventListener("loadeddata", p, { once: !0 }), c.addEventListener("error", u, { once: !0 });
    } else {
      const h = Cu(c) ? c.href.baseVal : c.currentSrc || c.src;
      if (!h)
        return a();
      const p = async () => {
        if (yn(c) && "decode" in c)
          try {
            await c.decode();
          } catch (m) {
            s == null || s(
              "Failed to decode image, trying to render anyway",
              c.dataset.originalSrc || h,
              m
            );
          }
        a();
      }, u = (m) => {
        s == null || s(
          "Failed image load",
          c.dataset.originalSrc || h,
          m
        ), a();
      };
      if (yn(c) && c.complete)
        return p();
      d = () => {
        c.removeEventListener("load", p), c.removeEventListener("error", u);
      }, c.addEventListener("load", p, { once: !0 }), c.addEventListener("error", u, { once: !0 });
    }
  });
}
async function Nh(e, t) {
  $n(e) && (yn(e) || $i(e) ? await zn(e, t) : await Promise.all(
    ["img", "video"].flatMap((r) => Array.from(e.querySelectorAll(r)).map((n) => zn(n, t)))
  ));
}
const Ru = /* @__PURE__ */ (function() {
  let t = 0;
  const r = () => `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4);
  return () => (t += 1, `u${r()}${t}`);
})();
function Tu(e) {
  return e == null ? void 0 : e.split(",").map((t) => t.trim().replace(/"|'/g, "").toLowerCase()).filter(Boolean);
}
let dl = 0;
function Ph(e) {
  const t = `${Su}[#${dl}]`;
  return dl++, {
    // eslint-disable-next-line no-console
    time: (r) => e && console.time(`${t} ${r}`),
    // eslint-disable-next-line no-console
    timeEnd: (r) => e && console.timeEnd(`${t} ${r}`),
    warn: (...r) => e && Th(...r)
  };
}
function $h(e) {
  return {
    cache: e ? "no-cache" : "force-cache"
  };
}
async function Fi(e, t) {
  return hh(e) ? e : zh(e, { ...t, autoDestruct: !0 });
}
async function zh(e, t) {
  var u, m;
  const { scale: r = 1, workerUrl: n, workerNumber: i = 1 } = t || {}, o = !!(t != null && t.debug), s = (t == null ? void 0 : t.features) ?? !0, c = e.ownerDocument ?? (Er ? window.document : void 0), l = ((u = e.ownerDocument) == null ? void 0 : u.defaultView) ?? (Er ? window : void 0), d = /* @__PURE__ */ new Map(), a = {
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
      requestInit: $h((m = t == null ? void 0 : t.fetch) == null ? void 0 : m.bypassingCache),
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
    log: Ph(o),
    node: e,
    ownerDocument: c,
    ownerWindow: l,
    dpi: r === 1 ? null : 96 * r,
    svgStyleElement: Au(c),
    svgDefsElement: c == null ? void 0 : c.createElementNS(Di, "defs"),
    svgStyles: /* @__PURE__ */ new Map(),
    defaultComputedStyles: /* @__PURE__ */ new Map(),
    workers: [
      ...Array.from({
        length: uh && n && i ? i : 0
      })
    ].map(() => {
      try {
        const f = new Worker(n);
        return f.onmessage = async (y) => {
          var b, A, S, w;
          const { url: M, result: v } = y.data;
          v ? (A = (b = d.get(M)) == null ? void 0 : b.resolve) == null || A.call(b, v) : (w = (S = d.get(M)) == null ? void 0 : S.reject) == null || w.call(S, new Error(`Error receiving message from worker: ${M}`));
        }, f.onmessageerror = (y) => {
          var v, b;
          const { url: M } = y.data;
          (b = (v = d.get(M)) == null ? void 0 : v.reject) == null || b.call(v, new Error(`Error receiving message from worker: ${M}`));
        }, f;
      } catch (f) {
        return a.log.warn("Failed to new Worker", f), null;
      }
    }).filter(Boolean),
    fontFamilies: /* @__PURE__ */ new Map(),
    fontCssTexts: /* @__PURE__ */ new Map(),
    acceptOfImage: `${[
      Ah(c) && "image/webp",
      "image/svg+xml",
      "image/*",
      "*/*"
    ].filter(Boolean).join(",")};q=0.8`,
    requests: d,
    drawImageCount: 0,
    tasks: [],
    features: s,
    isEnable: (f) => f === "restoreScrollPosition" ? typeof s == "boolean" ? !1 : s[f] ?? !1 : typeof s == "boolean" ? s : s[f] ?? !0,
    shadowRoots: []
  };
  a.log.time("wait until load"), await Nh(e, { timeout: a.timeout, onWarn: a.log.warn }), a.log.timeEnd("wait until load");
  const { width: h, height: p } = Dh(e, a);
  return a.width = h, a.height = p, a;
}
function Au(e) {
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
function Dh(e, t) {
  let { width: r, height: n } = t;
  if (ir(e) && (!r || !n)) {
    const i = e.getBoundingClientRect();
    r = r || i.width || Number(e.getAttribute("width")) || 0, n = n || i.height || Number(e.getAttribute("height")) || 0;
  }
  return { width: r, height: n };
}
async function Fh(e, t) {
  const {
    log: r,
    timeout: n,
    drawImageCount: i,
    drawImageInterval: o
  } = t;
  r.time("image to canvas");
  const s = await zn(e, { timeout: n, onWarn: t.log.warn }), { canvas: c, context2d: l } = Uh(e.ownerDocument, t), d = () => {
    try {
      l == null || l.drawImage(s, 0, 0, c.width, c.height);
    } catch (a) {
      t.log.warn("Failed to drawImage", a);
    }
  };
  if (d(), t.isEnable("fixSvgXmlDecode"))
    for (let a = 0; a < i; a++)
      await new Promise((h) => {
        setTimeout(() => {
          l == null || l.clearRect(0, 0, c.width, c.height), d(), h();
        }, a + o);
      });
  return t.drawImageCount = 0, r.timeEnd("image to canvas"), c;
}
function Uh(e, t) {
  const { width: r, height: n, scale: i, backgroundColor: o, maximumCanvasSize: s } = t, c = e.createElement("canvas");
  c.width = Math.floor(r * i), c.height = Math.floor(n * i), c.style.width = `${r}px`, c.style.height = `${n}px`, s && (c.width > s || c.height > s) && (c.width > s && c.height > s ? c.width > c.height ? (c.height *= s / c.width, c.width = s) : (c.width *= s / c.height, c.height = s) : c.width > s ? (c.height *= s / c.width, c.width = s) : (c.width *= s / c.height, c.height = s));
  const l = c.getContext("2d");
  return l && o && (l.fillStyle = o, l.fillRect(0, 0, c.width, c.height)), { canvas: c, context2d: l };
}
function _u(e, t) {
  if (e.ownerDocument)
    try {
      const o = e.toDataURL();
      if (o !== "data:,")
        return hn(o, e.ownerDocument);
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
function Bh(e, t) {
  var r;
  try {
    if ((r = e == null ? void 0 : e.contentDocument) != null && r.documentElement)
      return Js(e.contentDocument.documentElement, t);
  } catch (n) {
    t.log.warn("Failed to clone iframe", n);
  }
  return e.cloneNode(!1);
}
function qh(e) {
  const t = e.cloneNode(!1);
  return e.currentSrc && e.currentSrc !== e.src && (t.src = e.currentSrc, t.srcset = ""), t.loading === "lazy" && (t.loading = "eager"), t;
}
async function Wh(e, t) {
  if (e.ownerDocument && !e.currentSrc && e.poster)
    return hn(e.poster, e.ownerDocument);
  const r = e.cloneNode(!1);
  r.crossOrigin = "anonymous", e.currentSrc && e.currentSrc !== e.src && (r.src = e.currentSrc);
  const n = r.ownerDocument;
  if (n) {
    let i = !0;
    if (await zn(r, { onError: () => i = !1, onWarn: t.log.warn }), !i)
      return e.poster ? hn(e.poster, e.ownerDocument) : r;
    r.currentTime = e.currentTime, await new Promise((s) => {
      r.addEventListener("seeked", s, { once: !0 });
    });
    const o = n.createElement("canvas");
    o.width = e.offsetWidth, o.height = e.offsetHeight;
    try {
      const s = o.getContext("2d");
      s && s.drawImage(r, 0, 0, o.width, o.height);
    } catch (s) {
      return t.log.warn("Failed to clone video", s), e.poster ? hn(e.poster, e.ownerDocument) : r;
    }
    return _u(o, t);
  }
  return r;
}
function jh(e, t) {
  return vh(e) ? _u(e, t) : Rh(e) ? Bh(e, t) : yn(e) ? qh(e) : $i(e) ? Wh(e, t) : e.cloneNode(!1);
}
function Hh(e) {
  let t = e.sandbox;
  if (!t) {
    const { ownerDocument: r } = e;
    try {
      r && (t = r.createElement("iframe"), t.id = `__SANDBOX__${Ru()}`, t.width = "0", t.height = "0", t.style.visibility = "hidden", t.style.position = "fixed", r.body.appendChild(t), t.srcdoc = '<!DOCTYPE html><meta charset="UTF-8"><title></title><body>', e.sandbox = t);
    } catch (n) {
      e.log.warn("Failed to getSandBox", n);
    }
  }
  return t;
}
const Yh = [
  "width",
  "height",
  "-webkit-text-fill-color"
], Vh = [
  "stroke",
  "fill"
];
function Lu(e, t, r) {
  const { defaultComputedStyles: n } = r, i = e.nodeName.toLowerCase(), o = qn(e) && i !== "svg", s = o ? Vh.map((f) => [f, e.getAttribute(f)]).filter(([, f]) => f !== null) : [], c = [
    o && "svg",
    i,
    s.map((f, y) => `${f}=${y}`).join(","),
    t
  ].filter(Boolean).join(":");
  if (n.has(c))
    return n.get(c);
  const l = Hh(r), d = l == null ? void 0 : l.contentWindow;
  if (!d)
    return /* @__PURE__ */ new Map();
  const a = d == null ? void 0 : d.document;
  let h, p;
  o ? (h = a.createElementNS(Di, "svg"), p = h.ownerDocument.createElementNS(h.namespaceURI, i), s.forEach(([f, y]) => {
    p.setAttributeNS(null, f, y);
  }), h.appendChild(p)) : h = p = a.createElement(i), p.textContent = " ", a.body.appendChild(h);
  const u = d.getComputedStyle(p, t), m = /* @__PURE__ */ new Map();
  for (let f = u.length, y = 0; y < f; y++) {
    const M = u.item(y);
    Yh.includes(M) || m.set(M, u.getPropertyValue(M));
  }
  return a.body.removeChild(h), n.set(c, m), m;
}
function Iu(e, t, r) {
  var c;
  const n = /* @__PURE__ */ new Map(), i = [], o = /* @__PURE__ */ new Map();
  if (r)
    for (const l of r)
      s(l);
  else
    for (let l = e.length, d = 0; d < l; d++) {
      const a = e.item(d);
      s(a);
    }
  for (let l = i.length, d = 0; d < l; d++)
    (c = o.get(i[d])) == null || c.forEach((a, h) => n.set(h, a));
  function s(l) {
    const d = e.getPropertyValue(l), a = e.getPropertyPriority(l), h = l.lastIndexOf("-"), p = h > -1 ? l.substring(0, h) : void 0;
    if (p) {
      let u = o.get(p);
      u || (u = /* @__PURE__ */ new Map(), o.set(p, u)), u.set(l, [d, a]);
    }
    t.get(l) === d && !a || (p ? i.push(p) : n.set(l, [d, a]));
  }
  return n;
}
function Gh(e, t, r, n) {
  var h, p, u, m;
  const { ownerWindow: i, includeStyleProperties: o, currentParentNodeStyle: s } = n, c = t.style, l = i.getComputedStyle(e), d = Lu(e, null, n);
  s == null || s.forEach((f, y) => {
    d.delete(y);
  });
  const a = Iu(l, d, o);
  a.delete("transition-property"), a.delete("all"), a.delete("d"), a.delete("content"), r && (a.delete("position"), a.delete("margin-top"), a.delete("margin-right"), a.delete("margin-bottom"), a.delete("margin-left"), a.delete("margin-block-start"), a.delete("margin-block-end"), a.delete("margin-inline-start"), a.delete("margin-inline-end"), a.set("box-sizing", ["border-box", ""])), ((h = a.get("background-clip")) == null ? void 0 : h[0]) === "text" && t.classList.add("______background-clip--text"), Eu && (a.has("font-kerning") || a.set("font-kerning", ["normal", ""]), (((p = a.get("overflow-x")) == null ? void 0 : p[0]) === "hidden" || ((u = a.get("overflow-y")) == null ? void 0 : u[0]) === "hidden") && ((m = a.get("text-overflow")) == null ? void 0 : m[0]) === "ellipsis" && e.scrollWidth === e.clientWidth && a.set("text-overflow", ["clip", ""]));
  for (let f = c.length, y = 0; y < f; y++)
    c.removeProperty(c.item(y));
  return a.forEach(([f, y], M) => {
    c.setProperty(M, f, y);
  }), a;
}
function Kh(e, t) {
  (wh(e) || xh(e) || Ch(e)) && t.setAttribute("value", e.value);
}
const Xh = [
  "::before",
  "::after"
  // '::placeholder', TODO
], Jh = [
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
function Zh(e, t, r, n, i) {
  const { ownerWindow: o, svgStyleElement: s, svgStyles: c, currentNodeStyle: l } = n;
  if (!s || !o)
    return;
  function d(a) {
    var b;
    const h = o.getComputedStyle(e, a);
    let p = h.getPropertyValue("content");
    if (!p || p === "none")
      return;
    i == null || i(p), p = p.replace(/(')|(")|(counter\(.+\))/g, "");
    const u = [Ru()], m = Lu(e, a, n);
    l == null || l.forEach((A, S) => {
      m.delete(S);
    });
    const f = Iu(h, m, n.includeStyleProperties);
    f.delete("content"), f.delete("-webkit-locale"), ((b = f.get("background-clip")) == null ? void 0 : b[0]) === "text" && t.classList.add("______background-clip--text");
    const y = [
      `content: '${p}';`
    ];
    if (f.forEach(([A, S], w) => {
      y.push(`${w}: ${A}${S ? " !important" : ""};`);
    }), y.length === 1)
      return;
    try {
      t.className = [t.className, ...u].join(" ");
    } catch (A) {
      n.log.warn("Failed to copyPseudoClass", A);
      return;
    }
    const M = y.join(`
  `);
    let v = c.get(M);
    v || (v = [], c.set(M, v)), v.push(`.${u[0]}${a}`);
  }
  Xh.forEach(d), r && Jh.forEach(d);
}
const pl = /* @__PURE__ */ new Set([
  "symbol"
  // test/fixtures/svg.symbol.html
]);
async function hl(e, t, r, n, i) {
  if (ir(r) && (Sh(r) || Eh(r)) || n.filter && !n.filter(r))
    return;
  pl.has(t.nodeName) || pl.has(r.nodeName) ? n.currentParentNodeStyle = void 0 : n.currentParentNodeStyle = n.currentNodeStyle;
  const o = await Js(r, n, !1, i);
  n.isEnable("restoreScrollPosition") && Qh(e, o), t.appendChild(o);
}
async function fl(e, t, r, n) {
  var o;
  let i = e.firstChild;
  ir(e) && e.shadowRoot && (i = (o = e.shadowRoot) == null ? void 0 : o.firstChild, r.shadowRoots.push(e.shadowRoot));
  for (let s = i; s; s = s.nextSibling)
    if (!bh(s))
      if (ir(s) && Mh(s) && typeof s.assignedNodes == "function") {
        const c = s.assignedNodes();
        for (let l = 0; l < c.length; l++)
          await hl(e, t, c[l], r, n);
      } else
        await hl(e, t, s, r, n);
}
function Qh(e, t) {
  if (!$n(e) || !$n(t))
    return;
  const { scrollTop: r, scrollLeft: n } = e;
  if (!r && !n)
    return;
  const { transform: i } = t.style, o = new DOMMatrix(i), { a: s, b: c, c: l, d } = o;
  o.a = 1, o.b = 0, o.c = 0, o.d = 1, o.translateSelf(-n, -r), o.a = s, o.b = c, o.c = l, o.d = d, t.style.transform = o.toString();
}
function ef(e, t) {
  const { backgroundColor: r, width: n, height: i, style: o } = t, s = e.style;
  if (r && s.setProperty("background-color", r, "important"), n && s.setProperty("width", `${n}px`, "important"), i && s.setProperty("height", `${i}px`, "important"), o)
    for (const c in o) s[c] = o[c];
}
const tf = /^[\w-:]+$/;
async function Js(e, t, r = !1, n) {
  var d, a, h, p;
  const { ownerDocument: i, ownerWindow: o, fontFamilies: s, onCloneEachNode: c } = t;
  if (i && kh(e))
    return n && /\S/.test(e.data) && n(e.data), i.createTextNode(e.data);
  if (i && o && ir(e) && ($n(e) || qn(e))) {
    const u = await jh(e, t);
    if (t.isEnable("removeAbnormalAttributes")) {
      const b = u.getAttributeNames();
      for (let A = b.length, S = 0; S < A; S++) {
        const w = b[S];
        tf.test(w) || u.removeAttribute(w);
      }
    }
    const m = t.currentNodeStyle = Gh(e, u, r, t);
    r && ef(u, t);
    let f = !1;
    if (t.isEnable("copyScrollbar")) {
      const b = [
        (d = m.get("overflow-x")) == null ? void 0 : d[0],
        (a = m.get("overflow-y")) == null ? void 0 : a[0]
      ];
      f = b.includes("scroll") || (b.includes("auto") || b.includes("overlay")) && (e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth);
    }
    const y = (h = m.get("text-transform")) == null ? void 0 : h[0], M = Tu((p = m.get("font-family")) == null ? void 0 : p[0]), v = M ? (b) => {
      y === "uppercase" ? b = b.toUpperCase() : y === "lowercase" ? b = b.toLowerCase() : y === "capitalize" && (b = b[0].toUpperCase() + b.substring(1)), M.forEach((A) => {
        let S = s.get(A);
        S || s.set(A, S = /* @__PURE__ */ new Set()), b.split("").forEach((w) => S.add(w));
      });
    } : void 0;
    return Zh(
      e,
      u,
      f,
      t,
      v
    ), Kh(e, u), $i(e) || await fl(
      e,
      u,
      t,
      v
    ), await (c == null ? void 0 : c(u)), u;
  }
  const l = e.cloneNode(!1);
  return await fl(e, l, t), await (c == null ? void 0 : c(l)), l;
}
function rf(e) {
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
function nf(e) {
  const { url: t, timeout: r, responseType: n, ...i } = e, o = new AbortController(), s = r ? setTimeout(() => o.abort(), r) : void 0;
  return fetch(t, { signal: o.signal, ...i }).then((c) => {
    if (!c.ok)
      throw new Error("Failed fetch, not 2xx response", { cause: c });
    switch (n) {
      case "arrayBuffer":
        return c.arrayBuffer();
      case "dataUrl":
        return c.blob().then(Oh);
      case "text":
      default:
        return c.text();
    }
  }).finally(() => clearTimeout(s));
}
function Dn(e, t) {
  const { url: r, requestType: n = "text", responseType: i = "text", imageDom: o } = t;
  let s = r;
  const {
    timeout: c,
    acceptOfImage: l,
    requests: d,
    fetchFn: a,
    fetch: {
      requestInit: h,
      bypassingCache: p,
      placeholderImage: u
    },
    font: m,
    workers: f,
    fontFamilies: y
  } = e;
  n === "image" && (Ei || Xs) && e.drawImageCount++;
  let M = d.get(r);
  if (!M) {
    p && p instanceof RegExp && p.test(s) && (s += (/\?/.test(s) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
    const v = n.startsWith("font") && m && m.minify, b = /* @__PURE__ */ new Set();
    v && n.split(";")[1].split(",").forEach((T) => {
      y.has(T) && y.get(T).forEach((N) => b.add(N));
    });
    const A = v && b.size, S = {
      url: s,
      timeout: c,
      responseType: A ? "arrayBuffer" : i,
      headers: n === "image" ? { accept: l } : void 0,
      ...h
    };
    M = {
      type: n,
      resolve: void 0,
      reject: void 0,
      response: null
    }, M.response = (async () => {
      if (a && n === "image") {
        const w = await a(r);
        if (w)
          return w;
      }
      return !Ei && r.startsWith("http") && f.length ? new Promise((w, T) => {
        f[d.size & f.length - 1].postMessage({ rawUrl: r, ...S }), M.resolve = w, M.reject = T;
      }) : nf(S);
    })().catch((w) => {
      if (d.delete(r), n === "image" && u)
        return e.log.warn("Failed to fetch image base64, trying to use placeholder image", s), typeof u == "string" ? u : u(o);
      throw w;
    }), d.set(r, M);
  }
  return M.response;
}
async function Ou(e, t, r, n) {
  if (!Nu(e))
    return e;
  for (const [i, o] of of(e, t))
    try {
      const s = await Dn(
        r,
        {
          url: o,
          requestType: n ? "image" : "text",
          responseType: "dataUrl"
        }
      );
      e = e.replace(sf(i), `$1${s}$3`);
    } catch (s) {
      r.log.warn("Failed to fetch css data url", i, s);
    }
  return e;
}
function Nu(e) {
  return /url\((['"]?)([^'"]+?)\1\)/.test(e);
}
const Pu = /url\((['"]?)([^'"]+?)\1\)/g;
function of(e, t) {
  const r = [];
  return e.replace(Pu, (n, i, o) => (r.push([o, Mu(o, t)]), n)), r.filter(([n]) => !Ps(n));
}
function sf(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
const af = [
  "background-image",
  "border-image-source",
  "-webkit-border-image",
  "-webkit-mask-image",
  "list-style-image"
];
function lf(e, t) {
  return af.map((r) => {
    const n = e.getPropertyValue(r);
    return !n || n === "none" ? null : ((Ei || Xs) && t.drawImageCount++, Ou(n, null, t, !0).then((i) => {
      !i || n === i || e.setProperty(
        r,
        i,
        e.getPropertyPriority(r)
      );
    }));
  }).filter(Boolean);
}
function cf(e, t) {
  if (yn(e)) {
    const r = e.currentSrc || e.src;
    if (!Ps(r))
      return [
        Dn(t, {
          url: r,
          imageDom: e,
          requestType: "image",
          responseType: "dataUrl"
        }).then((n) => {
          n && (e.srcset = "", e.dataset.originalSrc = r, e.src = n || "");
        })
      ];
    (Ei || Xs) && t.drawImageCount++;
  } else if (qn(e) && !Ps(e.href.baseVal)) {
    const r = e.href.baseVal;
    return [
      Dn(t, {
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
function uf(e, t) {
  const { ownerDocument: r, svgDefsElement: n } = t, i = e.getAttribute("href") ?? e.getAttribute("xlink:href");
  if (!i)
    return [];
  const [o, s] = i.split("#");
  if (s) {
    const c = `#${s}`, l = t.shadowRoots.reduce(
      (d, a) => d ?? a.querySelector(`svg ${c}`),
      r == null ? void 0 : r.querySelector(`svg ${c}`)
    );
    if (o && e.setAttribute("href", c), n != null && n.querySelector(c))
      return [];
    if (l)
      return n == null || n.appendChild(l.cloneNode(!0)), [];
    if (o)
      return [
        Dn(t, {
          url: o,
          responseType: "text"
        }).then((d) => {
          n == null || n.insertAdjacentHTML("beforeend", d);
        })
      ];
  }
  return [];
}
function $u(e, t) {
  const { tasks: r } = t;
  ir(e) && ((yn(e) || Cu(e)) && r.push(...cf(e, t)), yh(e) && r.push(...uf(e, t))), $n(e) && r.push(...lf(e.style, t)), e.childNodes.forEach((n) => {
    $u(n, t);
  });
}
async function df(e, t) {
  const {
    ownerDocument: r,
    svgStyleElement: n,
    fontFamilies: i,
    fontCssTexts: o,
    tasks: s,
    font: c
  } = t;
  if (!(!r || !n || !i.size))
    if (c && c.cssText) {
      const l = gl(c.cssText, t);
      n.appendChild(r.createTextNode(`${l}
`));
    } else {
      const l = Array.from(r.styleSheets).filter((u) => {
        try {
          return "cssRules" in u && !!u.cssRules.length;
        } catch (m) {
          return t.log.warn(`Error while reading CSS rules from ${u.href}`, m), !1;
        }
      }), d = r.implementation.createHTMLDocument(""), a = d.createElement("style");
      d.head.appendChild(a);
      const h = a.sheet;
      await Promise.all(
        l.flatMap((u) => Array.from(u.cssRules).map(async (m) => {
          if (mh(m)) {
            const f = m.href;
            let y = "";
            try {
              y = await Dn(t, {
                url: f,
                requestType: "text",
                responseType: "text"
              });
            } catch (v) {
              t.log.warn(`Error fetch remote css import from ${f}`, v);
            }
            const M = y.replace(
              Pu,
              (v, b, A) => v.replace(A, Mu(A, f))
            );
            for (const v of hf(M))
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
        $s(u.cssRules, p);
      }), p.filter((u) => {
        var m;
        return fh(u) && Nu(u.style.getPropertyValue("src")) && ((m = Tu(u.style.getPropertyValue("font-family"))) == null ? void 0 : m.some((f) => i.has(f)));
      }).forEach((u) => {
        const m = u, f = o.get(m.cssText);
        f ? n.appendChild(r.createTextNode(`${f}
`)) : s.push(
          Ou(
            m.cssText,
            m.parentStyleSheet ? m.parentStyleSheet.href : null,
            t
          ).then((y) => {
            y = gl(y, t), o.set(m.cssText, y), n.appendChild(r.createTextNode(`${y}
`));
          })
        );
      });
    }
}
const pf = /(\/\*[\s\S]*?\*\/)/g, ml = /((@.*?keyframes [\s\S]*?){([\s\S]*?}\s*?)})/gi;
function hf(e) {
  if (e == null)
    return [];
  const t = [];
  let r = e.replace(pf, "");
  for (; ; ) {
    const o = ml.exec(r);
    if (!o)
      break;
    t.push(o[0]);
  }
  r = r.replace(ml, "");
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
const ff = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, mf = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function gl(e, t) {
  const { font: r } = t, n = r ? r == null ? void 0 : r.preferredFormat : void 0;
  return n ? e.replace(mf, (i) => {
    for (; ; ) {
      const [o, , s] = ff.exec(i) || [];
      if (!s)
        return "";
      if (s === n)
        return `src: ${o};`;
    }
  }) : e;
}
function $s(e, t = []) {
  for (const r of Array.from(e))
    gh(r) ? t.push(...$s(r.cssRules)) : "cssRules" in r ? $s(r.cssRules, t) : t.push(r);
  return t;
}
const gf = /\bx?link:?href\s*=\s*["'](?!data:)[^"']+["']/i;
function yf(e) {
  return gf.test(e.innerHTML);
}
async function bf(e, t) {
  const r = await Fi(e, t);
  if (ir(r.node) && qn(r.node) && !yf(r.node))
    return r.node;
  const {
    ownerDocument: n,
    log: i,
    tasks: o,
    svgStyleElement: s,
    svgDefsElement: c,
    svgStyles: l,
    font: d,
    progress: a,
    autoDestruct: h,
    onCloneNode: p,
    onEmbedNode: u,
    onCreateForeignObjectSvg: m
  } = r;
  i.time("clone node");
  const f = await Js(r.node, r, !0);
  if (s && n) {
    let A = "";
    l.forEach((S, w) => {
      A += `${S.join(`,
`)} {
  ${w}
}
`;
    }), s.appendChild(n.createTextNode(A));
  }
  i.timeEnd("clone node"), await (p == null ? void 0 : p(f)), d !== !1 && ir(f) && (i.time("embed web font"), await df(f, r), i.timeEnd("embed web font")), i.time("embed node"), $u(f, r);
  const y = o.length;
  let M = 0;
  const v = async () => {
    for (; ; ) {
      const A = o.pop();
      if (!A)
        break;
      try {
        await A;
      } catch (S) {
        r.log.warn("Failed to run task", S);
      }
      a == null || a(++M, y);
    }
  };
  a == null || a(M, y), await Promise.all([...Array.from({ length: 4 })].map(v)), i.timeEnd("embed node"), await (u == null ? void 0 : u(f));
  const b = kf(f, r);
  return c && b.insertBefore(c, b.children[0]), s && b.insertBefore(s, b.children[0]), h && rf(r), await (m == null ? void 0 : m(b)), b;
}
function kf(e, t) {
  const { width: r, height: n } = t, i = _h(r, n, e.ownerDocument), o = i.ownerDocument.createElementNS(i.namespaceURI, "foreignObject");
  return o.setAttributeNS(null, "x", "0%"), o.setAttributeNS(null, "y", "0%"), o.setAttributeNS(null, "width", "100%"), o.setAttributeNS(null, "height", "100%"), o.append(e), i.appendChild(o), i;
}
async function vf(e, t) {
  var s;
  const r = await Fi(e, t), n = await bf(r), i = Lh(n, r.isEnable("removeControlCharacter"));
  r.autoDestruct || (r.svgStyleElement = Au(r.ownerDocument), r.svgDefsElement = (s = r.ownerDocument) == null ? void 0 : s.createElementNS(Di, "defs"), r.svgStyles.clear());
  const o = hn(i, n.ownerDocument);
  return await Fh(o, r);
}
async function wf(e, t) {
  const r = await Fi(e, t), { log: n, quality: i, type: o, dpi: s } = r, c = await vf(r);
  n.time("canvas to data url");
  let l = c.toDataURL(o, i);
  if (["image/png", "image/jpeg"].includes(o) && s && dh && ph) {
    const [d, a] = l.split(",");
    let h = 0, p = !1;
    if (o === "image/png") {
      const b = ch(a);
      b >= 0 ? (h = Math.ceil((b + 28) / 3) * 4, p = !0) : h = 33 / 3 * 4;
    } else o === "image/jpeg" && (h = 18 / 3 * 4);
    const u = a.substring(0, h), m = a.substring(h), f = window.atob(u), y = new Uint8Array(f.length);
    for (let b = 0; b < y.length; b++)
      y[b] = f.charCodeAt(b);
    const M = o === "image/png" ? oh(y, s, p) : th(y, s), v = window.btoa(String.fromCharCode(...M));
    l = [d, ",", v, m].join("");
  }
  return n.timeEnd("canvas to data url"), l;
}
async function xf(e, t) {
  return wf(
    await Fi(e, { ...t, type: "image/png" })
  );
}
const Sf = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", Ef = 8e3, Cf = 16384, yl = 4096, Mf = 16e6, Rf = 500, Tf = 1e4, bo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z4kwAAAAASUVORK5CYII=", zu = 600, Af = 1200, _f = 24, Lf = 1024, $t = 32, If = 4, Du = 400, Of = 0.985, Nf = 250;
function Fu(e, t) {
  if (!e || e.startsWith("data:") || e.startsWith("blob:")) return !1;
  try {
    return new URL(e, t).origin !== t;
  } catch {
    return !1;
  }
}
function Pf(e) {
  const t = e;
  if (!t || t.tagName !== "IMG") return !1;
  const r = t.currentSrc || t.src || "";
  return Fu(r, location.origin);
}
function $f(e) {
  const t = e;
  if (!t || t.nodeType !== 1) return !1;
  const r = t.tagName;
  if (r === "SCRIPT" || r === "STYLE" || r === "NOSCRIPT" || r === "TEMPLATE" || r === "IFRAME" && Fu(t.src || "", location.origin)) return !0;
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
  const o = window.scrollX || window.pageXOffset || 0, s = window.scrollY || window.pageYOffset || 0;
  return i.right + o <= 0 || i.bottom + s <= 0;
}
function ko(e) {
  try {
    console.warn(e);
  } catch {
  }
}
function bl(e) {
  return !e || e === "transparent" || e === "rgba(0, 0, 0, 0)";
}
function zf(e, t, r = 1) {
  try {
    const n = e.getBoundingClientRect(), i = Math.max(1, Math.ceil(Math.max(e.scrollWidth, e.clientWidth, n.width))), o = Math.max(1, Math.ceil(Math.max(e.scrollHeight, e.clientHeight, n.height))), s = Math.max(0.1, r), c = Math.min(yl / i, yl / o), l = Math.min(s, c, Math.sqrt(Mf / (i * o))), d = document.createElement("canvas");
    d.width = Math.max(1, Math.floor(i * l)), d.height = Math.max(1, Math.floor(o * l));
    const a = d.getContext("2d");
    if (!a) return { dataUrl: bo, scale: 1 };
    a.scale(l, l), a.fillStyle = "#ffffff", a.fillRect(0, 0, i, o);
    const h = Date.now() + Rf;
    let p = 0;
    const u = () => p >= Tf || Date.now() >= h, m = (y, M = !1) => {
      var w;
      if (u() || (p++, !M && t && !t(y))) return;
      const v = getComputedStyle(y);
      if (v.display === "none" || v.visibility === "hidden" || Number(v.opacity) === 0) return;
      const b = y.getBoundingClientRect(), A = b.left - n.left, S = b.top - n.top;
      if (b.width > 0 && b.height > 0) {
        bl(v.backgroundColor) || (a.fillStyle = v.backgroundColor, a.fillRect(A, S, b.width, b.height));
        const T = parseFloat(v.borderTopWidth);
        T > 0 && v.borderTopStyle !== "none" && !bl(v.borderTopColor) && (a.strokeStyle = v.borderTopColor, a.lineWidth = T, a.strokeRect(A, S, b.width, b.height)), y.tagName === "IMG" && (a.fillStyle = "#f1f5f9", a.fillRect(A, S, b.width, b.height), a.strokeStyle = "#cbd5e1", a.lineWidth = 1, a.strokeRect(A, S, b.width, b.height));
      }
      for (const T of Array.from(y.childNodes)) {
        if (u()) break;
        if (T instanceof HTMLElement) {
          m(T);
          continue;
        }
        if (!(T.nodeType !== Node.TEXT_NODE || !((w = T.textContent) != null && w.trim())))
          try {
            const N = document.createRange();
            N.selectNodeContents(T);
            const U = N.getBoundingClientRect();
            if (U.width <= 0 || U.height <= 0) continue;
            a.save(), a.beginPath(), a.rect(U.left - n.left, U.top - n.top, U.width, U.height), a.clip(), a.fillStyle = v.color, a.font = `${v.fontStyle} ${v.fontWeight} ${v.fontSize} ${v.fontFamily}`, a.textBaseline = "top", a.fillText(T.textContent.trim(), U.left - n.left, U.top - n.top), a.restore();
          } catch {
          }
      }
    };
    m(e, !0);
    const f = d.toDataURL("image/png");
    return f.startsWith("data:image/png") ? { dataUrl: f, scale: l } : { dataUrl: bo, scale: 1 };
  } catch {
    return { dataUrl: bo, scale: 1 };
  }
}
function Df() {
  return new Promise((e) => {
    typeof requestAnimationFrame == "function" ? requestAnimationFrame(() => e()) : setTimeout(e, 16);
  });
}
function vo(e, t) {
  return Promise.race([
    Promise.resolve(e).then(() => {
    }, () => {
    }),
    new Promise((r) => setTimeout(r, Math.max(0, t)))
  ]);
}
function Ff(e) {
  if (!e || typeof e.querySelectorAll != "function") return [];
  const t = typeof window < "u" && window.innerWidth || 0, r = typeof window < "u" && window.innerHeight || 0, n = [];
  let i;
  try {
    i = e.querySelectorAll("img");
  } catch {
    return [];
  }
  for (let o = 0; o < i.length && n.length < _f; o++) {
    const s = i[o];
    if (!s || s.complete) continue;
    let c;
    try {
      c = s.getBoundingClientRect();
    } catch {
      continue;
    }
    c.bottom < 0 || c.right < 0 || c.top > r || c.left > t || n.push(s);
  }
  return n;
}
async function kl(e, t = zu) {
  if (typeof document > "u") return;
  const r = Date.now() + Math.max(0, t), n = () => Math.max(0, r - Date.now());
  try {
    const i = document.fonts;
    i && i.status !== "loaded" && i.ready && typeof i.ready.then == "function" && await vo(i.ready, n());
    const o = Ff(e);
    o.length && await vo(
      Promise.allSettled(o.map((s) => typeof s.decode == "function" ? s.decode() : Promise.resolve())),
      n()
    ), await vo(Df(), Math.min(n(), 50));
  } catch {
  }
}
function Uu(e, t) {
  return new Promise((r) => {
    if (typeof Image > "u") {
      r(null);
      return;
    }
    let n = !1;
    const i = new Image(), o = (c) => {
      n || (n = !0, r(c ? i : null));
    }, s = setTimeout(() => o(!1), Math.max(0, t));
    i.onload = () => {
      clearTimeout(s), o(!0);
    }, i.onerror = () => {
      clearTimeout(s), o(!1);
    };
    try {
      i.src = e;
    } catch {
      clearTimeout(s), o(!1);
    }
  });
}
async function Uf(e) {
  if (typeof document > "u") return null;
  const t = await Uu(e, Du);
  if (!t) return null;
  let r;
  try {
    r = document.createElement("canvas");
  } catch {
    return null;
  }
  r.width = $t, r.height = $t;
  const n = r.getContext("2d");
  if (!n) return null;
  try {
    n.drawImage(t, 0, 0, $t, $t);
    const { data: i } = n.getImageData(0, 0, $t, $t);
    let o = 0, s = 0, c = 0;
    for (let d = 0; d < i.length; d += 4) {
      const a = i[d + 3] / 255, h = i[d] * a + 255 * (1 - a), p = i[d + 1] * a + 255 * (1 - a), u = i[d + 2] * a + 255 * (1 - a), m = 0.299 * h + 0.587 * p + 0.114 * u;
      s += m, c += m * m, o++;
    }
    if (!o) return null;
    const l = s / o;
    return c / o - l * l;
  } catch {
    return null;
  }
}
async function wo(e) {
  if (!e || !e.startsWith("data:image/png")) return !0;
  const t = e.indexOf(","), r = t >= 0 ? e.slice(t + 1) : "";
  if (Math.floor(r.length * 3 / 4) <= Lf) return !0;
  try {
    const i = await Uf(e);
    if (i !== null && i <= If) return !0;
  } catch {
  }
  return !1;
}
async function Bf(e) {
  if (typeof document > "u") return null;
  const t = await Uu(e, Du);
  if (!t) return null;
  let r;
  try {
    r = document.createElement("canvas");
  } catch {
    return null;
  }
  r.width = $t, r.height = $t;
  const n = r.getContext("2d");
  if (!n) return null;
  try {
    n.drawImage(t, 0, 0, $t, $t);
    const { data: i } = n.getImageData(0, 0, $t, $t);
    let o = 0, s = 0;
    for (let c = 0; c < i.length; c += 4) {
      const l = i[c + 3] / 255, d = i[c] * l + 255 * (1 - l), a = i[c + 1] * l + 255 * (1 - l), h = i[c + 2] * l + 255 * (1 - l);
      0.299 * d + 0.587 * a + 0.114 * h >= Nf && s++, o++;
    }
    return o ? s / o : null;
  } catch {
    return null;
  }
}
async function qf(e, t = {}) {
  if ((t.skippedImages ?? 0) > 0) return !0;
  try {
    const r = await Bf(e);
    if (r !== null && r >= Of) return !0;
  } catch {
  }
  return !1;
}
const Wf = [
  "material icons",
  "material symbols",
  "fontawesome",
  "font awesome",
  "icomoon",
  "glyphicons",
  "ionicons"
], jf = /* @__PURE__ */ new Set([
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
function Hf(e) {
  return ((e || "").split(",")[0] || "").trim().replace(/^['"]+|['"]+$/g, "").toLowerCase();
}
function Yf(e) {
  const t = (e || "").toLowerCase();
  return Wf.some((r) => t.includes(r));
}
const Vf = /^[a-z0-9]+(?:[_-][a-z0-9]+)+$/i;
function Gf(e) {
  const t = (e || "").trim();
  return !t || t.length > 40 || /\s/.test(t) ? !1 : Vf.test(t);
}
function Kf(e) {
  const t = (e.text || "").trim();
  if (!t) return !1;
  const r = e.fontFamily || "", n = Hf(r);
  return e.embeddedFamilies && n && e.embeddedFamilies.has(n) ? !1 : !!(Yf(r) || n && !jf.has(n) && t.includes("_") && Gf(t));
}
function Xf(e, t) {
  var r;
  try {
    if (!e || e.nodeType !== 1) return;
    const n = e;
    if (n.childElementCount > 0) return;
    const i = n.textContent || "";
    if (!i.trim()) return;
    const o = ((r = n.style) == null ? void 0 : r.fontFamily) || "";
    if (!o) return;
    Kf({ fontFamily: o, text: i, embeddedFamilies: t }) && (n.textContent = "");
  } catch {
  }
}
const vi = { cssText: "", embeddedFamilies: /* @__PURE__ */ new Set() }, Jf = 3e3, Zf = 4e3, vl = 24, wl = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
async function Qf(e, t = Zf) {
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
    return await new Promise((s) => {
      try {
        const c = new FileReader();
        c.onload = () => s(typeof c.result == "string" ? c.result : null), c.onerror = () => s(null), c.readAsDataURL(o);
      } catch {
        s(null);
      }
    });
  } catch {
    return null;
  } finally {
    n && clearTimeout(n);
  }
}
function em(e) {
  var n, i, o;
  const t = [];
  let r;
  try {
    r = e.styleSheets;
  } catch {
    return t;
  }
  for (let s = 0; s < r.length && t.length < vl; s++) {
    let c = null;
    try {
      c = r[s].cssRules;
    } catch {
      continue;
    }
    if (c)
      for (let l = 0; l < c.length && t.length < vl; l++) {
        const d = c[l];
        if (!(d && (((n = d.constructor) == null ? void 0 : n.name) === "CSSFontFaceRule" || d.type === 5))) continue;
        let h = "", p = "";
        try {
          h = (((i = d.style) == null ? void 0 : i.getPropertyValue("font-family")) || "").trim().replace(/^['"]+|['"]+$/g, ""), p = ((o = d.style) == null ? void 0 : o.getPropertyValue("src")) || "";
        } catch {
          continue;
        }
        !h || !p || t.push({ cssText: d.cssText, family: h, src: p });
      }
  }
  return t;
}
function tm(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function rm(e, t, r) {
  const n = new RegExp(`url\\(\\s*(['"]?)${tm(t)}\\1\\s*\\)`, "g");
  return e.replace(n, `url("${r}")`);
}
async function nm(e = {}) {
  const t = /* @__PURE__ */ new Set(), r = e.doc ?? (typeof document < "u" ? document : null), n = e.faces ?? (r ? em(r) : []);
  if (!n.length) return { cssText: "", embeddedFamilies: t };
  const i = e.baseUrl ?? (typeof location < "u" ? location.href : ""), o = e.fetchAsDataUrl ?? ((c) => Qf(c)), s = [];
  for (const c of n) {
    const l = [];
    wl.lastIndex = 0;
    let d;
    for (; (d = wl.exec(c.src)) !== null; ) {
      const u = d[2];
      u && !u.startsWith("data:") && l.push(u);
    }
    if (!l.length) {
      s.push(c.cssText), t.add(c.family.toLowerCase());
      continue;
    }
    let a = c.cssText, h = !1;
    const p = await Promise.all(l.map(async (u) => {
      let m = u;
      try {
        m = new URL(u, i).href;
      } catch {
      }
      return { rawUrl: u, dataUrl: await o(m) };
    }));
    for (const { rawUrl: u, dataUrl: m } of p)
      m && (a = rm(a, u, m), h = !0);
    h && (s.push(a), t.add(c.family.toLowerCase()));
  }
  return { cssText: s.join(`
`), embeddedFamilies: t };
}
async function im() {
  try {
    return await Promise.race([
      nm({}).catch(() => vi),
      new Promise((e) => setTimeout(() => e(vi), Jf))
    ]);
  } catch {
    return vi;
  }
}
function om(e, t) {
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
async function sm(e, t = {}) {
  return (await am(e, t)).dataUrl;
}
async function am(e, t = {}) {
  let r = 0;
  const n = t.filter, i = typeof window < "u" && Number(window.devicePixelRatio) || 1, o = t.skipFonts ? 1 : Math.min(Math.max(i, 1), 2), s = t.pixelRatio ?? o, c = t.skipFonts ? vi : await im(), l = t.width && t.height ? { width: t.width, height: t.height } : void 0, d = async () => {
    r = 0;
    const a = !t.skipFonts && c.cssText ? { cssText: c.cssText } : !1, h = await om(xf(e, {
      scale: s,
      ...l ?? {},
      font: a,
      onCloneEachNode: (p) => Xf(p, c.embeddedFamilies),
      maximumCanvasSize: Cf,
      fetch: { placeholderImage: Sf },
      filter: (p) => n && !n(p) || $f(p) ? !1 : Pf(p) ? (r++, !1) : !0
    }), Ef);
    if (!h.startsWith("data:image/png")) throw new Error("capture returned a non-PNG result");
    return h;
  };
  await kl(e, zu);
  try {
    let a = await d(), h = await wo(a);
    if (h) {
      await kl(e, Af);
      try {
        const u = await d();
        await wo(u) || (a = u, h = !1);
      } catch {
      }
    }
    r && ko(`[Klavity] capture: omitted ${r} cross-origin image(s) the page's CSP/CORS blocks — captured the rest`), h && ko("[Klavity] capture: DOM render came back blank after retry — caller may retake with the sharp path");
    const p = h ? !1 : await qf(a, { skippedImages: r });
    return { dataUrl: a, scale: s, quality: "rendered", blank: h, partial: p, skippedImages: r };
  } catch (a) {
    const h = a instanceof Error ? a.message : String(a);
    ko(`[Klavity] capture: renderer unavailable (${h}); using fetch-free fallback`);
    const p = zf(e, n, s), u = await wo(p.dataUrl);
    return { ...p, quality: "wireframe", blank: u, partial: !1, skippedImages: 0 };
  }
}
const lm = {
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
function cm(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function Z(e, t = {}) {
  const r = lm[e];
  if (!r)
    return console.warn("[Klavity] unknown icon: " + e), "";
  const n = t.size ?? 18, i = t.class ? `icon ${t.class}` : "icon", o = t.label ? 'role="img"' : 'aria-hidden="true"', s = t.label ? `<title>${cm(t.label)}</title>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" class="${i}" width="${n}" height="${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" ${o}>${s}${r}</svg>`;
}
const Bu = "https://klavity.in", nn = {
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
function xo(e, t, r) {
  const n = r > 0 && Number.isFinite(r) ? r : 1 / 0, i = [];
  for (const o of String(t ?? "").split(`
`)) {
    if (!o.length) {
      i.push("");
      continue;
    }
    let s = "";
    for (const c of o.split(" ")) {
      let l = c;
      const d = s ? " " : "";
      if (s && e(s + d + l) <= n) {
        s += d + l;
        continue;
      }
      for (s && (i.push(s), s = ""); l.length > 1 && e(l) > n; ) {
        let a = 1, h = l.length, p = 1;
        for (; a <= h; ) {
          const u = a + h >> 1;
          e(l.slice(0, u)) <= n ? (p = u, a = u + 1) : h = u - 1;
        }
        i.push(l.slice(0, p)), l = l.slice(p);
      }
      s = l;
    }
    i.push(s);
  }
  return i.length ? i : [""];
}
function ni(e, t) {
  try {
    if (typeof e.measureText != "function") return 0;
    const r = e.measureText(t), n = r && r.width;
    return typeof n == "number" && Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}
function um(e) {
  const t = (e || "").trim(), r = t.replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(r))
    return [parseInt(r[0] + r[0], 16), parseInt(r[1] + r[1], 16), parseInt(r[2] + r[2], 16)];
  if (/^[0-9a-fA-F]{6}$/.test(r))
    return [parseInt(r.slice(0, 2), 16), parseInt(r.slice(2, 4), 16), parseInt(r.slice(4, 6), 16)];
  const n = t.match(/rgba?\(([^)]+)\)/i);
  if (n) {
    const i = n[1].split(",").map((o) => parseFloat(o));
    if (i.length >= 3 && i.every((o) => !Number.isNaN(o))) return [i[0], i[1], i[2]];
  }
  return null;
}
function dm(e) {
  const t = um(e);
  if (!t) return 0;
  const [r, n, i] = t.map((o) => o / 255);
  return 0.2126 * r + 0.7152 * n + 0.0722 * i;
}
function So(e) {
  return dm(e) > 0.55 ? "rgba(17,17,17,0.92)" : "rgba(255,255,255,0.92)";
}
class zs {
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
    const o = So(r);
    t.lineWidth = n + this.haloPad(n), t.strokeStyle = o, i(), t.stroke(), t.lineWidth = n, t.strokeStyle = r, i(), t.stroke();
  }
  drawShape(t, r) {
    if (t.strokeStyle = r.color, t.fillStyle = r.color, t.lineWidth = this.computeLineWidth(), t.lineCap = "round", t.lineJoin = "round", r.type === "pen") {
      const n = this.computeLineWidth();
      this.strokeWithHalo(t, r.color, n, () => {
        t.beginPath(), r.points.forEach(
          (i, o) => o === 0 ? t.moveTo(i.x, i.y) : t.lineTo(i.x, i.y)
        );
      });
    } else if (r.type === "rect") {
      const n = this.computeLineWidth();
      t.lineWidth = n + this.haloPad(n), t.strokeStyle = So(r.color), t.strokeRect(r.x, r.y, r.w, r.h), t.lineWidth = n, t.strokeStyle = r.color, t.strokeRect(r.x, r.y, r.w, r.h);
    } else if (r.type === "arrow") {
      const n = this.computeLineWidth() * 1.7, i = Math.atan2(r.y2 - r.y1, r.x2 - r.x1), o = Math.max(16, n * 4);
      this.strokeWithHalo(t, r.color, n, () => {
        t.beginPath(), t.moveTo(r.x1, r.y1), t.lineTo(r.x2, r.y2), t.lineTo(
          r.x2 - o * Math.cos(i - Math.PI / 6),
          r.y2 - o * Math.sin(i - Math.PI / 6)
        ), t.moveTo(r.x2, r.y2), t.lineTo(
          r.x2 - o * Math.cos(i + Math.PI / 6),
          r.y2 - o * Math.sin(i + Math.PI / 6)
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
      t.beginPath(), t.arc(r.x, r.y, n, 0, Math.PI * 2), t.fill(), t.lineWidth = this.haloPad(this.computeLineWidth()), t.strokeStyle = So(r.color), t.stroke(), t.fillStyle = "#fff", t.font = `bold ${Math.round(n * 1.05)}px sans-serif`, t.textAlign = "center", t.textBaseline = "middle", t.fillText(String(r.n), r.x, r.y), t.textAlign = "start", t.textBaseline = "alphabetic";
    } else if (r.type === "text") {
      const { x: n, y: i, size: o, maxW: s } = this.textAnchor(r, t);
      t.font = `bold ${o}px sans-serif`, t.textBaseline = "top";
      const c = xo((a) => ni(t, a), r.text, s), l = o * 1.25, d = r.outline ?? "none";
      c.forEach((a, h) => {
        const p = i + h * l;
        d !== "none" && (t.lineJoin = "round", t.lineWidth = Math.max(3, o * 0.18), t.strokeStyle = d === "white" ? "#ffffff" : "#111111", t.strokeText(a, n, p)), t.fillStyle = r.color, t.fillText(a, n, p);
      }), t.textBaseline = "alphabetic";
    } else r.type === "pixelate" && this.drawPixelate(t, r);
  }
  /** Redaction: replace the pixels inside the region with a coarse mosaic (block-averaged colours). Reads
   *  back what's already painted (base image + any earlier shapes) so the redaction bakes into save()/export.
   *  No-ops safely on headless/tainted canvases (getImageData throws) — the region just isn't redacted. */
  drawPixelate(t, r) {
    const n = Math.max(0, Math.floor(Math.min(r.x, r.x + r.w))), i = Math.max(0, Math.floor(Math.min(r.y, r.y + r.h))), o = Math.min(this.canvas.width - n, Math.ceil(Math.abs(r.w))), s = Math.min(this.canvas.height - i, Math.ceil(Math.abs(r.h)));
    if (o <= 0 || s <= 0) return;
    const c = Math.max(8, Math.round(this.canvas.width / 90));
    let l;
    try {
      l = t.getImageData(n, i, o, s);
    } catch {
      l = void 0;
    }
    if (!l || !l.data) {
      t.fillStyle = "rgba(30,30,40,1)", t.fillRect(n, i, o, s);
      return;
    }
    const d = l.data;
    for (let a = 0; a < s; a += c)
      for (let h = 0; h < o; h += c) {
        let p = 0, u = 0, m = 0, f = 0;
        const y = Math.min(a + c, s), M = Math.min(h + c, o);
        for (let v = a; v < y; v++)
          for (let b = h; b < M; b++) {
            const A = (v * o + b) * 4;
            p += d[A], u += d[A + 1], m += d[A + 2], f++;
          }
        f && (t.fillStyle = `rgb(${Math.round(p / f)},${Math.round(u / f)},${Math.round(m / f)})`, t.fillRect(n + h, i + a, M - h, y - a));
      }
  }
  /** KLA-770: the clamped top-left anchor + wrap width for a text shape. The anchor is kept inside the image
   *  (so a dragged label can't be parked off-canvas) and `maxW` is the room from the anchor to the right edge
   *  (so long text wraps rather than spilling past the bounds). Shared by drawShape + textBounds so the
   *  rendered glyphs and the hit-test box always agree. */
  textAnchor(t, r) {
    const n = t.size ?? this.computeFontSize(), i = Math.max(2, n * 0.15), o = Math.max(i, Math.min(t.x, Math.max(i, this.canvas.width - i))), s = Math.max(1, this.canvas.width - o - i), c = n * 1.25;
    let l = 1;
    r && typeof r.measureText == "function" && (r.font = `bold ${n}px sans-serif`, l = Math.max(1, xo((h) => ni(r, h), t.text, s).length));
    const d = l * c, a = Math.max(0, Math.min(t.y, Math.max(0, this.canvas.height - d)));
    return { x: o, y: a, size: n, maxW: s };
  }
  /** KLA-770: the image-pixel bounding box of a committed text shape (accounting for the clamp + wrap), used
   *  by the inline annotator to hit-test a click for drag/resize. Returns null for non-text shapes or when no
   *  2D context is available (headless envs). */
  textBounds(t) {
    if (t.type !== "text") return null;
    const r = this.canvas.getContext("2d");
    if (!r || typeof r.measureText != "function") return null;
    const { x: n, y: i, size: o, maxW: s } = this.textAnchor(t, r);
    r.font = `bold ${o}px sans-serif`;
    const c = xo((p) => ni(r, p), t.text, s);
    let l = 0;
    for (const p of c) l = Math.max(l, ni(r, p));
    const d = o * 1.25, a = Math.min(Math.max(o, l), Math.max(1, this.canvas.width - n)), h = Math.min(Math.max(d, c.length * d), Math.max(1, this.canvas.height - i));
    return { x: n, y: i, w: a, h };
  }
  async save() {
    const t = this.canvas.toDataURL("image/png");
    return t.length > 5 * 1024 * 1024 ? this.canvas.toDataURL("image/jpeg", 0.85) : t;
  }
}
function pm(e) {
  if (!Array.isArray(e)) return [];
  const t = [];
  for (const r of e)
    r && r.type === "text" && typeof r.text == "string" && r.text.trim() && t.push(r.text.trim());
  return t;
}
async function hm(e, t, r, n) {
  return !e || !e.startsWith("data:image/") ? e || "" : !Array.isArray(t) || t.length === 0 || typeof document > "u" || typeof Image > "u" ? e : new Promise((i) => {
    try {
      const o = new Image();
      o.onload = () => {
        try {
          const s = o.naturalWidth || r || 1, c = o.naturalHeight || n || 1, l = document.createElement("canvas");
          l.width = s, l.height = c;
          const d = l.getContext("2d");
          if (!d) {
            i(e);
            return;
          }
          const a = new zs(l, e);
          t.forEach((h) => a.shapes.push({ ...h })), d.drawImage(o, 0, 0), a.redraw(), a.save().then((h) => {
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
      }, o.onerror = () => i(e), o.src = e;
    } catch {
      i(e);
    }
  });
}
async function fm(e, t, r) {
  const n = t.backendUrl ? t : { ...t, backendUrl: Bu }, i = {
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
const mm = 50, gm = 2e3, ym = 1e3, bm = 500, xl = /^(?:token|access_token|refresh_token|api[_-]?key|apikey|key|secret|password|passwd|pwd|auth|authorization|session|sid|jwt|code|otp)$/i;
function ii(e, t) {
  e.push(t), e.length > mm && e.shift();
}
function Zs(e, t) {
  return e.length <= t ? e : e.slice(0, t) + "…[truncated]";
}
function Eo(e) {
  let t = String(e || "");
  try {
    const r = new URL(t, typeof location < "u" ? location.href : "http://localhost");
    let n = !1;
    r.searchParams.forEach((i, o) => {
      xl.test(o) && (r.searchParams.set(o, "REDACTED"), n = !0);
    }), n && (t = r.toString());
  } catch {
    t = t.replace(/([?&])([^=&]+)=([^&]*)/g, (r, n, i, o) => xl.test(i) ? `${n}${i}=REDACTED` : r);
  }
  return Zs(t, ym);
}
function km(e) {
  if (typeof e == "string") return e;
  if (e instanceof Error) return e.message;
  try {
    return Zs(JSON.stringify(e), bm);
  } catch {
    return String(e);
  }
}
function vm(e, t = {}) {
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
function wm(e, t = {}) {
  if (typeof window > "u") return e;
  const r = window;
  if (r.__klavityCaptureInstalled) return e;
  r.__klavityCaptureInstalled = !0;
  const n = () => t.isContextValid ? t.isContextValid() : !0, i = (l, d, a) => {
    ii(e.consoleErrors, { message: Zs(d, gm), stack: a, timestamp: Date.now(), level: l });
  }, o = window.onerror;
  if (window.onerror = (l, d, a, h, p) => {
    var u;
    if (n()) {
      const m = String(l);
      i("error", m, p == null ? void 0 : p.stack), (u = t.onError) == null || u.call(t, m, p == null ? void 0 : p.stack);
    }
    return typeof o == "function" ? o.call(window, l, d, a, h, p) : !1;
  }, window.addEventListener("unhandledrejection", (l) => {
    var h;
    if (!n()) return;
    const d = l.reason, a = String((d == null ? void 0 : d.message) ?? d);
    i("error", a, d == null ? void 0 : d.stack), (h = t.onError) == null || h.call(t, a, d == null ? void 0 : d.stack);
  }), t.consoleLevels) {
    const l = ["log", "info", "warn", "error"];
    for (const d of l) {
      const a = console[d];
      typeof a == "function" && (console[d] = (...h) => {
        try {
          n() && i(d, h.map(km).join(" "));
        } catch {
        }
        return a.apply(console, h);
      });
    }
  }
  const s = window.fetch;
  window.fetch = async (...l) => {
    var p;
    if (!n()) return s(...l);
    const d = Date.now(), a = typeof l[0] == "string" ? l[0] : l[0] instanceof URL ? l[0].href : l[0].url, h = (typeof l[0] == "object" && l[0] && "method" in l[0] ? l[0].method : (p = l[1]) == null ? void 0 : p.method) || "GET";
    try {
      const u = await s(...l);
      return ii(e.networkFailures, { url: Eo(a), status: u.status, method: String(h).toUpperCase(), timestamp: d, durationMs: Date.now() - d }), u;
    } catch (u) {
      throw ii(e.networkFailures, { url: Eo(a), status: 0, method: String(h).toUpperCase(), timestamp: d, durationMs: Date.now() - d }), u;
    }
  };
  const c = window.XMLHttpRequest;
  if (c && c.prototype) {
    const l = c.prototype.open, d = c.prototype.send;
    c.prototype.open = function(a, h, ...p) {
      return this.__klav = { method: String(a || "GET").toUpperCase(), url: String(h || "") }, l.call(this, a, h, ...p);
    }, c.prototype.send = function(...a) {
      const h = this.__klav;
      if (h && n()) {
        const p = Date.now();
        this.addEventListener("loadend", () => {
          try {
            ii(e.networkFailures, {
              url: Eo(h.url),
              status: Number(this.status) || 0,
              method: h.method,
              timestamp: p,
              durationMs: Date.now() - p
            });
          } catch {
          }
        });
      }
      return d.apply(this, a);
    };
  }
  return e;
}
const xm = ["light", "dark", "glass", "neon", "custom", "liquid"], Sm = ["hidden", "icon", "full", "custom"], Em = ["lightbulb", "bug"], Cm = ["full", "reportOnly", "off"], Mm = /^#[0-9a-fA-F]{3,8}$/, Rm = /^[\w \-,'"().]+$/, Sl = (e) => typeof e == "object" && e !== null, oi = (e) => typeof e == "string" && Mm.test(e.trim()) ? e.trim() : void 0, si = (e, t) => typeof e == "string" && e.trim() ? e.trim().slice(0, t) : void 0, Tm = (e) => {
  if (typeof e != "string") return;
  const t = e.trim().slice(0, 120);
  return t && Rm.test(t) ? t : void 0;
}, El = {
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
function Cl(e) {
  let t = e.replace("#", "");
  t.length === 3 && (t = t.split("").map((s) => s + s).join(""));
  const r = parseInt(t.slice(0, 6), 16), n = r >> 16 & 255, i = r >> 8 & 255, o = r & 255;
  return 0.299 * n + 0.587 * i + 0.114 * o;
}
function qu(e) {
  const t = Sl(e) ? e : {}, n = { theme: typeof t.theme == "string" && xm.includes(t.theme) ? t.theme : "light" }, i = oi(t.primary), o = oi(t.secondary), s = oi(t.background), c = si(t.thankYou, 140), l = Tm(t.font);
  i && (n.primary = i), o && (n.secondary = o), s && (n.background = s), l && (n.font = l), c && (n.thankYou = c), typeof t.launcherMode == "string" && Sm.includes(t.launcherMode) && (n.launcherMode = t.launcherMode);
  const d = si(t.launcherText, 60);
  d && (n.launcherText = d);
  const a = oi(t.launcherIconColor);
  a && (n.launcherIconColor = a), typeof t.launcherIcon == "string" && Em.includes(t.launcherIcon) && (n.launcherIcon = t.launcherIcon), typeof t.rightClickMode == "string" && Cm.includes(t.rightClickMode) && (n.rightClickMode = t.rightClickMode), t.maskNumbers === !0 && (n.maskNumbers = !0), t.reportClarity === !0 ? n.reportClarity = !0 : t.reportClarity === !1 && (n.reportClarity = !1), t.preSubmitNudge === !1 ? n.preSubmitNudge = !1 : t.preSubmitNudge === !0 && (n.preSubmitNudge = !0), t.debug === !0 && (n.debug = !0), t.submitTargetToggle === !1 ? n.submitTargetToggle = !1 : t.submitTargetToggle === !0 && (n.submitTargetToggle = !0);
  const h = si(t.projectDisplayName, 60);
  h && (n.projectDisplayName = h);
  const p = Sl(t.agency_branding) ? t.agency_branding : {};
  (t.whiteLabel === !0 || p.whiteLabel === !0) && (n.whiteLabel = !0);
  const u = si(t.projectId, 200);
  return u && (n.projectId = u), (t.attributionMedium === "extension" || t.attributionMedium === "widget") && (n.attributionMedium = t.attributionMedium), n;
}
function Am(e) {
  const t = qu(e), r = t.theme === "custom" ? { ...El.light } : { ...El[t.theme] };
  if (t.theme === "custom" && (t.primary && (r["--kl-accent"] = t.primary), t.secondary && (r["--kl-accent2"] = t.secondary), t.background)) {
    r["--kl-bg"] = t.background;
    const i = Cl(t.background) < 140;
    r["--kl-fg"] = i ? "#f4f4f7" : "#1d1d24", r["--kl-muted"] = i ? "rgba(255,255,255,.6)" : "#706560", r["--kl-border"] = i ? "rgba(255,255,255,.16)" : "#e6e6ec", r["--kl-chip"] = i ? "rgba(255,255,255,.08)" : "#f4f4f7", r["--kl-input-bg"] = i ? "rgba(255,255,255,.05)" : "#fafafb";
  }
  return t.font && (r["--kl-font"] = t.font), t.theme === "dark" || t.theme === "neon" || t.theme === "glass" || t.theme === "liquid" || t.theme === "custom" && t.background && Cl(t.background) < 140, r["--kl-img-outline"] = "var(--kl-img-outline-val, color-mix(in srgb, var(--kl-fg) 10%, transparent))", r["--kl-glow"] = "radial-gradient(120% 80% at 50% -10%, color-mix(in srgb, var(--kl-accent) 12%, transparent), transparent 60%), radial-gradient(80% 60% at 100% 110%, color-mix(in srgb, var(--kl-accent2) 6%, transparent), transparent 60%)", `:host{${Object.entries(r).map(([i, o]) => `${i}:${o};`).join("")}}`;
}
function _m(e, t = !1, r = !1) {
  if (!e) return "";
  let n = e;
  return n = n.replace(/\s*\b(?:new paragraph|next paragraph)\b\s*/gi, `

`), n = n.replace(/\s*\b(?:new line|next line)\b\s*/gi, `
`), n = n.replace(/\b(?:full stop|period)\b/gi, "."), n = n.replace(/\bquestion mark\b/gi, "?"), n = n.replace(/\b(?:exclamation mark|exclamation point)\b/gi, "!"), n = n.replace(/\bcomma\b/gi, ","), n = n.replace(/\bsemicolon\b/gi, ";"), n = n.replace(/\bcolon\b/gi, ":"), n = n.replace(/\s+([,.:;!?])/g, "$1"), n = n.replace(/([,.:;!?])[^\S\r\n]+/g, "$1 "), n = n.replace(/([,.:;!?])\1+/g, "$1"), n = n.replace(/([,.:;!?])([^\s\d\n,.:;!?])/g, "$1 $2"), n = n.replace(/\b(i)('m|'ve|'ll|'d)?\b/gi, (i, o, s) => "I" + (s ? s.toLowerCase() : "")), n = n.replace(/(^|[.!?\n]\s*)([a-z])/g, (i, o, s) => o + s.toUpperCase()), (r || t) && n.trim() && (n = n.trim(), r && !/[.!?:]$/.test(n) && (n += ".")), n;
}
function ai(e, t) {
  if (!e) return t;
  if (!t) return e;
  const r = e.trimEnd(), n = t.trimStart();
  return r ? n ? r + " " + n : r : n;
}
function Ml(e) {
  if (!e) return "";
  let t = e.trim();
  return t ? (t = _m(t, !0, !0), t = t.replace(/^\s*([a-z])/, (r, n) => n.toUpperCase()), t = t.replace(/([.!?\n]\s*)([a-z])/g, (r, n, i) => n + i.toUpperCase()), /[.!?:]$/.test(t) || (t += "."), t) : "";
}
const pt = class pt {
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
    this._recording || !pt.isSupported() || (this._recording = !0, this._stopping = !1, this._stopFired = !1, this._showedReconnecting = !1, this._consecFailures = 0, this._timer = setTimeout(() => this.stop(), pt.SESSION_MS), this._begin());
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
      var o;
      this._recovered();
      let i = "";
      for (let s = n.resultIndex; s < n.results.length; s++) {
        const c = n.results[s], l = ((o = c[0]) == null ? void 0 : o.transcript) || "";
        c.isFinal ? l && this.onTranscript(l) : i += l;
      }
      i && this.onInterim && this.onInterim(i);
    }, r.onerror = (n) => {
      if (this._stopping || !this._recording) return;
      const i = n == null ? void 0 : n.error;
      if (i && i in pt.TERMINAL_ERRORS) {
        this.onError(i, pt.TERMINAL_ERRORS[i]), this._teardown();
        return;
      }
      i && i !== "no-speech" && (this._consecFailures++, this._showedReconnecting || (this._showedReconnecting = !0, this.onStatus("retrying", "Reconnecting voice…")));
    }, r.onend = () => {
      if (this._recognition = null, this._stopping || !this._recording) {
        this._emitStop();
        return;
      }
      if (this._consecFailures > pt.MAX_CONSEC_FAILURES) {
        this.onError("network", "Voice disconnected — tap Voice to try again"), this._teardown();
        return;
      }
      const n = this._consecFailures === 0 ? pt.BENIGN_RESTART_MS : Math.min(pt.MAX_BACKOFF_MS, pt.BASE_BACKOFF_MS * 2 ** (this._consecFailures - 1));
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
pt.MAX_CONSEC_FAILURES = 6, pt.BASE_BACKOFF_MS = 400, pt.MAX_BACKOFF_MS = 8e3, pt.BENIGN_RESTART_MS = 250, pt.SESSION_MS = 18e4, pt.TERMINAL_ERRORS = {
  "not-allowed": "Microphone access was denied",
  "service-not-allowed": "Microphone access was denied",
  "audio-capture": "No microphone was found"
};
let In = pt;
function Lm() {
  const t = globalThis.MediaRecorder;
  return {
    getUserMedia: (r) => navigator.mediaDevices.getUserMedia(r),
    MediaRecorder: t,
    isTypeSupported: (r) => !!(t && t.isTypeSupported && t.isTypeSupported(r)),
    setTimeout: (r, n) => setTimeout(r, n),
    clearTimeout: (r) => clearTimeout(r)
  };
}
const Im = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
function Wu(e) {
  for (const t of Im)
    if (e.isTypeSupported(t)) return t;
  return null;
}
const pn = class pn {
  constructor(t) {
    this.onTranscript = (r) => {
    }, this.onError = (r, n) => {
    }, this.onStatus = (r, n) => {
    }, this.onStop = () => {
    }, this.onUnavailable = () => {
    }, this._recording = !1, this._stream = null, this._recorder = null, this._chunks = [], this._segTimer = null, this._sessTimer = null, this._mime = null, this._firstSegment = !0, this._transcribe = t.transcribe, this._deps = { ...Lm(), ...t.deps || {} };
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
    this._stream = t, this._mime = Wu(this._deps);
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
    }, this._sessTimer = this._deps.setTimeout(() => this.stop(), pn.MAX_SESSION_MS), this._beginSegment();
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
      }, pn.SEGMENT_MS);
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
        const s = (o.text || "").trim();
        s && this.onTranscript(s);
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
pn.SEGMENT_MS = 2500, pn.MAX_SESSION_MS = 18e4;
let Ci = pn;
function Om() {
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
const tt = class tt {
  constructor(t) {
    this.onTranscript = (r) => {
    }, this.onInterim = (r) => {
    }, this.onError = (r, n) => {
    }, this.onStatus = (r, n) => {
    }, this.onStop = () => {
    }, this.onUnavailable = () => {
    }, this._recording = !1, this._stream = null, this._recorder = null, this._ws = null, this._mime = null, this._connected = !1, this._everConnected = !1, this._connectTimer = null, this._sessTimer = null, this._reconnects = 0, this._stopped = !1, this._awaitingFinal = !1, this._graceTimer = null, this._flushFallbackTimer = null, this._torn = !1, this._statusShown = !1, this._stopFired = !1, this._url = t.url, this._deps = { ...Om(), ...t.deps || {} };
  }
  // Feature-detect: WebSocket + MediaRecorder + getUserMedia. False on anything missing one.
  static isSupported(t = {}) {
    const r = globalThis, n = typeof navigator < "u" ? navigator.mediaDevices : void 0, i = !!(t.getUserMedia || n && typeof n.getUserMedia == "function"), o = t.MediaRecorder ?? r.MediaRecorder, s = t.WebSocket ?? r.WebSocket;
    return i && typeof o < "u" && typeof s < "u";
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
    this._stream = t, this._mime = Wu(this._deps), this._sessTimer = this._deps.setTimeout(() => this.stop(), tt.MAX_SESSION_MS), this._openSocket();
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
    }, tt.CONNECT_TIMEOUT_MS), t.onopen = () => {
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
    if (this._reconnects >= tt.MAX_RECONNECTS) {
      this.onError("network", "Voice disconnected — tap Voice to try again"), this._teardown(!0);
      return;
    }
    this._reconnects++, this._statusShown || (this._statusShown = !0, this.onStatus("retrying", "Reconnecting dictation…"));
    const t = Math.min(tt.MAX_BACKOFF_MS, tt.BASE_BACKOFF_MS * 2 ** (this._reconnects - 1));
    this._stopRecorder(), this._deps.setTimeout(() => {
      this._recording && this._openSocket();
    }, t);
  }
  _startRecorder() {
    if (!(!this._recording || !this._ws)) {
      if (this._recorder) {
        try {
          this._recorder.state === "inactive" && this._recorder.start(tt.TIMESLICE_MS);
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
        this._recorder.start(tt.TIMESLICE_MS);
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
      const o = t, s = () => {
        if (!(i || this._torn || this._ws !== o)) {
          i = !0, this._flushFallbackTimer != null && (this._deps.clearTimeout(this._flushFallbackTimer), this._flushFallbackTimer = null);
          try {
            o.send(JSON.stringify({ type: "stop" }));
          } catch {
          }
          this._awaitingFinal = !0;
        }
      }, c = this._recorder;
      if (c && c.state !== "inactive") {
        try {
          c.onstop = () => s();
        } catch {
        }
        this._stopRecorder(), this._flushFallbackTimer = this._deps.setTimeout(s, tt.STOP_FLUSH_FALLBACK_MS);
      } else
        this._stopRecorder(), s();
      this._graceTimer = this._deps.setTimeout(() => this._finishGrace(), tt.STOP_GRACE_MS);
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
        var o;
        return (o = i.stop) == null ? void 0 : o.call(i);
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
tt.MAX_SESSION_MS = 18e4, tt.TIMESLICE_MS = 150, tt.CONNECT_TIMEOUT_MS = 4e3, tt.MAX_RECONNECTS = 3, tt.BASE_BACKOFF_MS = 500, tt.MAX_BACKOFF_MS = 4e3, tt.STOP_GRACE_MS = 2e3, tt.STOP_FLUSH_FALLBACK_MS = 1200;
let Mi = tt;
function Nm(e) {
  return e.hasEndpoint && e.mediaRecorderSupported ? "server" : e.webSpeechSupported ? "webspeech" : "none";
}
function Je(e) {
  try {
    e && e.parentNode && e.parentNode.removeChild(e);
  } catch {
  }
}
const Pm = /* @__PURE__ */ new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"]);
function Or(e) {
  const t = [], r = [], n = document.createTreeWalker(e, NodeFilter.SHOW_TEXT, {
    acceptNode(s) {
      let c = s.parentElement;
      for (; c && c !== e; ) {
        if (Pm.has(c.tagName)) return NodeFilter.FILTER_REJECT;
        c = c.parentElement;
      }
      return /\d/.test(s.textContent ?? "") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  }), i = [];
  let o;
  for (; o = n.nextNode(); ) i.push(o);
  for (const s of i) {
    const l = (s.textContent ?? "").split(/(\d+)/);
    if (l.length <= 1) continue;
    const d = s.parentNode, a = s.nextSibling, h = l.map((p, u) => {
      if (u % 2 === 1) {
        const m = document.createElement("span");
        return m.style.cssText = "background:#111;color:transparent;border-radius:2px;", m.textContent = p, m;
      }
      return document.createTextNode(p);
    });
    Je(s);
    for (const p of h) d.insertBefore(p, a);
    t.push({ parent: d, original: s, replacements: h });
  }
  return e.querySelectorAll("input, select").forEach((s) => {
    const c = s.value;
    /\d/.test(c) && (r.push({ el: s, original: c }), s.value = "█".repeat(c.length));
  }), () => {
    for (const { parent: s, original: c, replacements: l } of t) {
      const d = l[0];
      if ((d == null ? void 0 : d.parentNode) === s) {
        s.insertBefore(c, d);
        for (const a of l) a.parentNode === s && Je(a);
      }
    }
    for (const { el: s, original: c } of r)
      s.value = c;
  };
}
const ju = [
  "not working",
  "doesn't work",
  "does not work",
  "doesnt work",
  "broken",
  "pls fix",
  "please fix",
  "fix it",
  "help"
], $m = /\b(when i|steps?|click|clicked|clicking|tap|tapped|then|go to|navigate|reload|refresh|press|select|enter)\b/i, zm = /(https?:\/\/|\s\/[a-z0-9]|^\/[a-z0-9])/i, Dm = /\b(expected?|should|instead|supposed to|meant to|i wanted)\b/i, Fm = /* @__PURE__ */ new Set([
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
]), Um = { needs: "Needs detail", good: "Good", great: "Great" };
function Bm(e) {
  let t = e;
  for (const r of ju) t = t.split(r).join(" ");
  return t;
}
function qm(e) {
  const t = e.split(/[^a-z0-9]+/i).filter(Boolean);
  let r = 0;
  for (const n of t)
    n.length < 3 || Fm.has(n) || r++;
  return r;
}
function Hu(e) {
  const t = (e || "").trim(), r = t.toLowerCase(), n = Bm(r), i = qm(n), o = t.length > 0 && ju.some((p) => r.includes(p)) && i < 3, s = i >= 3 && t.length >= 12, c = Dm.test(r), l = $m.test(r) || zm.test(t), d = { problem: s, expected: c, repro: l }, a = (s ? 1 : 0) + (c ? 1 : 0) + (l ? 1 : 0), h = a >= 3 ? "great" : a === 2 ? "good" : "needs";
  return { score: a, coverage: d, level: h, label: Um[h], vague: o };
}
function Wm(e) {
  const t = (e || "").trim();
  return t.length <= 15 ? !1 : Hu(t).level !== "great";
}
const jm = [
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
function Hm(e) {
  const t = (e || "").toLowerCase();
  return t ? jm.some((r) => t.includes(r)) : !1;
}
function Yu(e) {
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
function Vu(e, t) {
  let r;
  try {
    r = new URL(e);
  } catch {
    return e;
  }
  const n = [
    ["utm_source", Yu(t.source)],
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
async function Ym() {
  try {
    const e = navigator.permissions;
    if (!(e != null && e.query)) return !1;
    const t = await e.query({ name: "display-capture" });
    return (t == null ? void 0 : t.state) === "granted";
  } catch {
    return !1;
  }
}
function Vm() {
  try {
    return location.host || location.hostname || "this site";
  } catch {
    return "this site";
  }
}
let Gm = 0;
function Km(e) {
  const t = e.host || Vm(), r = "kl-shp-" + ++Gm, n = document.createElement("div");
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
  const o = document.createElement("div");
  o.className = "kl-shp-hd";
  const s = document.createElement("span");
  s.className = "kl-shp-k", s.textContent = "K";
  const c = document.createElement("b");
  c.textContent = e.title, o.append(s, c);
  const l = document.createElement("div");
  l.className = "kl-shp-dlg";
  const d = document.createElement("div");
  d.className = "kl-shp-dh";
  const a = document.createElement("div");
  a.className = "kl-shp-dt", a.textContent = `Allow ${t} to see this tab?`;
  const h = document.createElement("div");
  h.className = "kl-shp-ds", h.textContent = "The site will be able to see the contents of this tab", d.append(a, h);
  const p = document.createElement("div");
  p.className = "kl-shp-prev";
  const u = document.createElement("div");
  u.className = "kl-shp-shot";
  const m = document.createElement("div");
  m.className = "kl-shp-cap";
  const f = document.createElement("span");
  f.className = "kl-shp-fav", f.textContent = (t[0] || "K").toUpperCase();
  const y = document.createElement("span");
  y.className = "kl-shp-rt", y.textContent = "This tab", m.append(f, y), p.append(u, m);
  const M = document.createElement("div");
  M.className = "kl-shp-foot";
  const v = document.createElement("span");
  v.className = "kl-shp-cancel", v.textContent = "Cancel", v.style.cursor = "pointer", v.addEventListener("click", (T) => {
    var N;
    T.stopPropagation(), n.classList.remove("kl-show");
    try {
      (N = e.onCancel) == null || N.call(e);
    } catch {
    }
  });
  const b = document.createElement("span");
  b.className = "kl-shp-allow", b.textContent = "Allow", M.append(v, b), l.append(d, p, M);
  const A = document.createElement("div");
  A.className = "kl-shp-steer";
  const S = document.createElement("span");
  S.className = "kl-shp-n", S.textContent = "1";
  const w = document.createElement("span");
  return w.textContent = e.steer, A.append(S, w), n.append(i, o, l, A), n;
}
const Xm = 1, Jm = 6, Zm = 1.08;
function Qm(e, t = Xm, r = Jm) {
  return Number.isFinite(e) ? Math.min(r, Math.max(t, e)) : t;
}
function eg(e, t = Zm) {
  return e < 0 ? t : 1 / t;
}
function tg(e) {
  return e ? "transform .1s ease-out" : "transform .34s cubic-bezier(.22,1.24,.32,1)";
}
function Gu(e, t) {
  return t > 0 ? e.width / t : 1;
}
function rg(e, t, r, n, i, o) {
  const s = (e - r.left - o.panX) / n, c = (t - r.top - o.panY) / n;
  return { panX: e - r.left - i * s, panY: t - r.top - i * c };
}
function ng(e, t, r, n, i, o) {
  const s = Gu(t, i) * n, c = (u) => Math.min(i, Math.max(0, u)), l = (u) => Math.min(o, Math.max(0, u)), d = s > 0 ? c((e.left - t.left - r.panX) / s) : 0, a = s > 0 ? c((e.right - t.left - r.panX) / s) : i, h = s > 0 ? l((e.top - t.top - r.panY) / s) : 0, p = s > 0 ? l((e.bottom - t.top - r.panY) / s) : o;
  return { x: d, y: h, w: Math.max(0, a - d), h: Math.max(0, p - h) };
}
function ig(e, t, r, n, i, o) {
  const s = r > 0 ? e / r * i : 0, c = n > 0 ? t / n * o : 0;
  return { ix: Math.min(i, Math.max(0, s)), iy: Math.min(o, Math.max(0, c)) };
}
function og(e, t, r, n, i, o) {
  const s = Gu(n, o) * i, c = (r.left + r.right) / 2, l = (r.top + r.bottom) / 2;
  return { panX: c - n.left - s * e, panY: l - n.top - s * t };
}
function sg(e) {
  return Vu("https://klavity.in", {
    campaign: "powered-by",
    medium: "annotation-editor",
    source: "snap-widget",
    // utm_content = the customer project id, or (when we don't have one) the embedding host, so we can still
    // see who clicked.
    ref: e || Yu()
  });
}
function ag(e) {
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
function lg(e, t, r) {
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
function Rl(e) {
  let t = Me(String(e ?? ""));
  return t = t.replace(/`([^`\n]+)`/g, (r, n) => `<span class="kl-mk">\`</span><code>${n}</code><span class="kl-mk">\`</span>`), t = t.replace(/\*([^*\n]+)\*/g, (r, n) => `<span class="kl-mk">*</span><b>${n}</b><span class="kl-mk">*</span>`), t = t.replace(/_([^_\n]+)_/g, (r, n) => `<span class="kl-mk">_</span><i>${n}</i><span class="kl-mk">_</span>`), t = t.replace(/~([^~\n]+)~/g, (r, n) => `<span class="kl-mk">~</span><s>${n}</s><span class="kl-mk">~</span>`), t = t.replace(/\n/g, "<br>"), t;
}
function Tl(e) {
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
const Ds = [
  { label: "High", priority: "P1", severity: "C1" },
  { label: "Medium", priority: "P2", severity: "C2" },
  { label: "Low", priority: "P3", severity: "C3" }
];
function cg(e) {
  var t;
  return ((t = Ds.find((r) => r.priority === String(e || "").toUpperCase())) == null ? void 0 : t.label) || "";
}
function ug(e) {
  const t = (s) => {
    const c = /^\s*(?:(\d+):)?(\d{1,2}):(\d{2})\s*$/.exec(s) || /^\s*()(\d+)\s*$/.exec(s);
    return c ? c[3] === void 0 ? Number(c[2]) : Number(c[1] || 0) * 3600 + Number(c[2]) * 60 + Number(c[3]) : null;
  }, [r, n] = String(e || "").split(/\s*[–—-]\s*/), i = r ? t(r) : null, o = n ? t(n) : null;
  return { startSec: i, endSec: i != null && o != null && o <= i ? null : o };
}
function dg(e, t) {
  const r = String(e || "").split(`
`).map((n) => n.replace(/\*/g, "").trim()).filter(Boolean);
  return r.length && r[0] === String(t || "").trim() && r.shift(), r.join(" ").replace(/\s+/g, " ").trim();
}
function pg(e, t, r = 960, n = 6e3) {
  return new Promise((i) => {
    let o = !1;
    const s = document.createElement("video"), c = (d) => {
      if (!o) {
        o = !0, clearTimeout(l);
        try {
          s.removeAttribute("src"), s.load();
        } catch {
        }
        i(d);
      }
    }, l = setTimeout(() => c(null), n);
    s.muted = !0, s.preload = "auto", s.setAttribute("playsinline", ""), s.onerror = () => c(null), s.onloadedmetadata = () => {
      const d = isFinite(s.duration) && s.duration > 0 ? s.duration : t + 1;
      try {
        s.currentTime = Math.max(0, Math.min(t, d - 0.1));
      } catch {
        c(null);
      }
    }, s.onseeked = () => {
      try {
        const d = s.videoWidth, a = s.videoHeight;
        if (!d || !a) return c(null);
        const h = Math.min(1, r / d), p = document.createElement("canvas");
        p.width = Math.round(d * h), p.height = Math.round(a * h);
        const u = p.getContext("2d");
        if (!u) return c(null);
        u.drawImage(s, 0, 0, p.width, p.height), c(p.toDataURL("image/jpeg", 0.82));
      } catch {
        c(null);
      }
    };
    try {
      s.src = e;
    } catch {
      c(null);
    }
  });
}
function Al(e) {
  const t = Array.isArray(e.stepsToReproduce) ? e.stepsToReproduce : [];
  return !e.actualResult && !e.expectedResult && !t.length ? String(e.description || "").trim() : Ku({
    summary: String(e.title || "").trim(),
    actualResult: e.actualResult || "",
    expectedResult: e.expectedResult || "",
    stepsToReproduce: t,
    suggestedSeverity: e.suggestedSeverity || "",
    suggestedPriority: e.suggestedPriority || ""
  });
}
function Fs(e, t) {
  const r = (o) => `${Math.floor(o / 60)}:${String(Math.floor(o % 60)).padStart(2, "0")}`, n = typeof e == "number" && isFinite(e) && e >= 0 ? e : null, i = typeof t == "number" && isFinite(t) && t >= 0 ? t : null;
  return n == null ? i == null ? "" : r(i) : i == null || i <= n ? r(n) : `${r(n)}–${r(i)}`;
}
function _l(e, t) {
  const r = String(e.description || "").trim(), n = String(t.reporterNote || "").trim();
  if (t.primary) return n && n !== r ? `${r}

Reporter note:
${n}` : r;
  const i = Fs(e.startSec, e.endSec), o = t.videoKey ? `${t.videoKey}${t.videoTitle ? ` (“${t.videoTitle}”)` : ""}` : t.videoTitle ? `“${t.videoTitle}”` : "";
  return `${r}

—
Split from a Record me walkthrough${i ? ` — this issue is at ${i} of the attached recording` : ""}.${o ? ` Related: ${o}.` : ""}`;
}
function Ku(e) {
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
function hg(e) {
  const t = /^fb_([0-9a-f]{8})[0-9a-f-]+$/i.exec(e);
  return t ? "fb_" + t[1] : e;
}
const fg = /^[A-Za-z][A-Za-z0-9]{1,9}-\d+$/;
function mg(e) {
  if (!e) return "";
  try {
    const t = new URL(e);
    if (t.protocol !== "https:" && t.protocol !== "http:") return "";
    const r = t.pathname.split("/").filter(Boolean).pop() || "";
    return fg.test(r) ? r : "";
  } catch {
    return "";
  }
}
function Co(e, t) {
  return mg(t) || hg(e);
}
function Mo(e) {
  if (!e) return "";
  try {
    const t = new URL(e);
    return t.protocol === "https:" || t.protocol === "http:" ? t.href : "";
  } catch {
    return "";
  }
}
function tr(e) {
  return typeof e == "string" ? { dataUrl: e } : { dataUrl: e.dataUrl, quality: e.quality, suggestSharp: e.suggestSharp, blank: e.blank };
}
function Ll(e) {
  return e.screenCaptureDefault && typeof e.onCaptureSharp == "function" ? "screen" : typeof e.onCaptureViewport == "function" ? "viewport" : typeof e.onCaptureFull == "function" ? "full" : "none";
}
function gg(e) {
  const t = e && typeof e == "object" && "name" in e ? String(e.name) : "";
  return t === "NotAllowedError" || t === "AbortError" || t === "NotFoundError" || t === "InvalidStateError";
}
const yg = {
  "real-pixel": { label: "Sharp", iconName: "check-circle", degraded: !1 },
  rendered: { label: "Rendered", iconName: "image", degraded: !0 },
  wireframe: { label: "Wireframe", iconName: "triangle-alert", degraded: !0 }
};
function Us(e) {
  return (e.type || "").toLowerCase().startsWith("video/") || /\.(mp4|m4v|mov|webm|avi|mkv|ogv|3gp)$/i.test(e.name || "");
}
function bg(e) {
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
const kg = "image/*,.heic,.heif,video/*,.pdf,.log,.har,.txt,.json,.csv,.zip,.xml,.yml,.yaml", vg = 100, wg = vg * 1024 * 1024;
function xg(e) {
  return (e.type || "").toLowerCase().startsWith("image/") || /\.(heic|heif|png|jpe?g|gif|webp|bmp|avif|svg)$/i.test(e.name || "");
}
function en(e) {
  return Us(e) ? "video" : xg(e) ? "image" : "file";
}
function Sg(e, t) {
  if (e.size <= t.capBytes) return { overCap: !1 };
  const r = Math.round(t.capBytes / 1024 / 1024), n = t.role === "owner" || t.role === "admin" || t.role === "member", o = `${e.name ? `"${e.name}"` : "This file"} is over the ${r}MB limit on your plan.`, s = n ? { kind: "upgrade", label: "Request upgrade", url: t.upgradeUrl, reason: "storage_over_cap", hint: "or attach a smaller file" } : { kind: "ask-team", label: "Request upgrade", reason: "storage_over_cap", hint: "or attach a smaller file" };
  return { overCap: !0, message: o, cta: s };
}
function li(e) {
  return e == null || typeof e != "number" || !isFinite(e) ? null : Math.max(0, Math.min(100, Math.round(e)));
}
function Eg(e, t, r = {}) {
  var Ja, Za, Qa, el, tl;
  const n = qu(r);
  let i = !!n.maskNumbers;
  const o = document.createElement("div");
  o.setAttribute("data-klavity-ui", "composer"), o.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;";
  const s = o.attachShadow({ mode: "open" });
  document.body.appendChild(o);
  let c = [], l = !1, d = [], a = [], h = [], p = null, u = [], m = !1, f = !1, y = !1, M = !1;
  const v = !!t.onMinimize, b = v ? 8 : 5, A = 3e4, S = 10 * 1024 * 1024, w = !!t.allowFileAttachments, T = 5, N = t.maxFileBytes && t.maxFileBytes > 0 ? t.maxFileBytes : wg, U = t.reporterRole ?? "anon", z = t.upgradeUrl, ee = Math.max(120 * 1024 * 1024, N + 20 * 1024 * 1024);
  let W = [];
  const O = /* @__PURE__ */ new WeakMap(), nt = () => typeof URL < "u" && typeof URL.createObjectURL == "function", Ke = (g) => O.get(g) || g.dataUrl, fe = (g) => {
    const k = O.get(g);
    if (k) {
      try {
        URL.revokeObjectURL(k);
      } catch {
      }
      O.delete(g);
    }
  };
  let pe = null;
  const Re = !!(t.allowRecording && t.onRecord), Fe = Re && !!t.onSplitRecording, Te = Nm({
    hasEndpoint: !!t.onDictate,
    mediaRecorderSupported: Ci.isSupported(),
    webSpeechSupported: In.isSupported()
  }), ke = Te !== "none", Ve = 2;
  let P = t.initialRecordings && Array.isArray(t.initialRecordings) ? [...t.initialRecordings] : [], H = P.map((g) => g.id || g.dataUrl).join("|");
  const se = t.issueTypes && t.issueTypes.length ? t.issueTypes : null, re = {};
  let ce = null;
  const Ae = () => {
    const g = Object.keys(re);
    if (!g.length && !ce) return null;
    const k = {};
    if (g.length) {
      const x = {};
      for (const E of g) x[E] = re[E];
      const C = re[0] ?? re[Number(g[0])] ?? {};
      Object.assign(k, C, { byIndex: x });
    }
    return ce && (k.selector = ce.selector, k.selectorText = ce.text), k;
  };
  let Ue = e, Se = 0, G = null, oe = null, ge = null, _e = t.replayState === "attached", We = null, ve = null, Be = "idle", ct = null, Ee = null, at = null, Rt = !1, Dt = "", Tt = 0, Pe = null, kt = !1, Jt = "", At = null, Ct = null, vt = null, Ft = null, et = !1;
  const ue = [];
  function $e(g) {
    if (typeof window > "u") return;
    const k = () => {
      et || g();
    };
    window.addEventListener("beforeunload", k), window.addEventListener("pagehide", k), ue.push(() => {
      window.removeEventListener("beforeunload", k), window.removeEventListener("pagehide", k);
    });
  }
  const Qe = 4e3, _t = 5e3, Le = {}, it = {}, sr = (g) => g ? JSON.parse(JSON.stringify(g)) : null, Zt = (g) => {
    var k;
    try {
      (k = t.onAnnotationsChanged) == null || k.call(t, g, sr(re[g]));
    } catch {
    }
  }, wn = () => {
    const g = {};
    for (const k of Object.keys(re)) {
      const x = re[k];
      x && (g[Number(k)] = sr(x));
    }
    return g;
  }, jr = (g) => ({
    url: c[g],
    compressed: d[g],
    ann: sr(re[g])
  }), Hr = (g) => {
    (Le[g] ?? (Le[g] = [])).push(jr(g));
  }, wa = (g, k) => {
    c[g] = k.url, d[g] = k.compressed, k.ann ? re[g] = sr(k.ann) : delete re[g];
  }, xa = (g) => {
    const k = Le[g];
    if (!k || !k.length) return !1;
    const x = k.pop(), C = it[g];
    for (; C && C.length && C[C.length - 1].mark >= k.length; ) C.pop();
    return wa(g, x), Zt(g), Oe(), !0;
  }, pp = (g) => {
    const k = it[g];
    if (!k || !k.length) return !1;
    const { snap: x, mark: C } = k.pop();
    return Le[g] && (Le[g].length = Math.min(Le[g].length, C)), wa(g, x), Zt(g), Oe(), !0;
  }, Sa = document.createElement("style");
  Sa.textContent = `
    ${Am(n)}
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
  `, s.appendChild(Sa);
  const Mr = document.createElement("div");
  Mr.className = "klavity-overlay";
  const le = document.createElement("div");
  le.className = "klavity-modal", le.innerHTML = `
    ${v ? '<button class="klavity-min" id="klavity-min" type="button" aria-label="Minimize" title="Minimize (keeps your evidence)"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>' : ""}
    <button class="klavity-x" id="klavity-x" type="button" aria-label="Close" title="Close (Esc)">${Z("x", { size: 16 })}</button>
    <div class="kl-hero" id="klavity-hero">
      <div class="kl-hero-tools" id="klavity-hero-tools"></div>
      <div class="kl-hero-stage" id="klavity-hero-stage">
        <div class="kl-hero-empty" id="klavity-hero-empty">${Z("image", { size: 34 })}<span id="klavity-hero-empty-txt">Capture or upload a screenshot to start marking it up</span></div>
      </div>
      <div class="klavity-strip" id="klavity-strip"></div>
      ${t.onCaptureSharp ? '<div class="klavity-sharphint" id="klavity-sharphint" role="status" aria-live="polite" hidden></div>' : ""}
    </div>
    <div class="kl-side" id="klavity-side">
      ${t.showTitleField ? '<label class="klavity-title-label" for="klavity-title">Title<input type="text" class="klavity-title" id="klavity-title" maxlength="200" placeholder="One line summarising the issue"></label>' : ""}
      ${se ? `<div class="klavity-types" id="klavity-types" role="radiogroup" aria-label="Issue type">${se.map((g) => `<button type="button" class="kl-type-chip${g.value === e ? " active" : ""}" data-kind="${Me(g.value)}" role="radio" aria-checked="${g.value === e ? "true" : "false"}">${Me(g.label)}${g.mappingLabel ? `<span class="kl-type-map">${Me(g.mappingLabel)}</span>` : ""}</button>`).join("")}</div>` : `<div class="klavity-toggle">
        <button class="kl-toggle-bug ${e === "bug" ? "active" : ""}"><span class="kl-cap-ic">${Z("bug")}</span>Bug</button>
        <button class="kl-toggle-feat ${e === "feature" ? "active" : ""}"><span class="kl-cap-ic">${Z("lightbulb")}</span>Feature</button>
      </div>`}
      
      
      ${Fe ? `<div class="kl-multi" id="klavity-multi">
        <div class="kl-multi-head"><span class="kl-multi-ic">${Z("monitor", { size: 18 })}</span><span class="kl-multi-name">Report Multiple Issues</span><span class="kl-multi-badge">${Z("sparkles", { size: 10 })} AI Powered</span></div>
        <p class="kl-multi-copy">Record your screen with voice narration. AI will analyse it, identify multiple issues and create separate tickets for you.</p>
        <button type="button" class="kl-multi-start" id="klavity-multi-start"></button>
        <p class="kl-multi-status" id="klavity-multi-status" role="status" aria-live="polite" hidden></p>
      </div>` : ""}
      <div class="klavity-actions">
        ${t.onCaptureSharp ? `<button id="klavity-sharp" class="kl-cap-primary" aria-label="Snap capture" title="Snap capture" aria-describedby="klavity-sharp-tip"><span class="kl-cap-main"><span class="kl-cap-ic">${Z("app-window")}</span><span class="kl-sharp-label">Snap</span></span><span class="kl-info-badge" aria-hidden="true"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></span><span id="klavity-sharp-tip" class="klavity-info-pop" role="tooltip"><b>Snap</b> grabs the <b>whole page — every image, embedded frame, and web font, pixel-perfect</b>${t.snapWithoutSharePrompt ? "." : " using your browser's screen-share. Your browser will ask you to <b>share this tab</b>."}</span></button>` : ""}
        <button id="klavity-full" title="Full Page — pixel-perfect capture of the whole page via tab share (captures embedded frames &amp; cross-origin images). Falls back to a fast render if you decline the share."><span class="kl-cap-ic">${Z("camera")}</span><span class="kl-full-label">Full Page</span></button>
        
        <button id="klavity-upload" title="${w ? "Add a screenshot, video, or file (images, MP4, PDF, .log, .har, ...)" : "Upload a screenshot"}"><span class="kl-cap-ic">${Z(w ? "paperclip" : "image")}</span><span class="kl-upload-label">${w ? "Attach" : "Upload"}</span></button>
        ${Re ? `<button id="klavity-record" title="Record your screen, camera and narration"><span class="kl-cap-ic">${Z("monitor")}</span><span class="kl-record-label">Record me</span></button>` : ""}
        ${t.onRegionCapture ? `<button id="klavity-region"><span class="kl-cap-ic">${Z("scissors")}</span><span class="kl-region-label">Region</span></button>` : ""}
        ${t.onPickElement ? `<button id="klavity-pick" title="Pick the exact element that's broken"><span class="kl-cap-ic">${Z("mouse-pointer-2")}</span><span class="kl-pick-label">Pick element</span></button>` : ""}
      </div>
      ${t.onPickElement ? '<div class="klavity-pickinfo" id="klavity-pickinfo" role="status" aria-live="polite" hidden></div>' : ""}
      
      
      <input type="file" id="klavity-file" accept="${w ? kg : "image/*,.heic,.heif"}" multiple style="display:none">
      ${w ? `<div class="klavity-attach-hint" id="klavity-attach-hint"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg><span>Images, video, PDF or logs — up to ${Math.round(N / 1024 / 1024)}MB each</span></div>` : ""}
      
      <div class="klavity-descbar">
        <div class="klavity-counter" id="klavity-counter" hidden>0/${b} images</div>
        ${ke ? `<button id="klavity-voice" class="kl-voice-circle" type="button" title="Voice dictation" aria-label="Voice dictation" aria-pressed="false"><span class="kl-cap-ic">${Z("mic")}<span class="kl-vdot"></span><span class="kl-vstop" aria-hidden="true"></span></span><svg class="kl-vring" viewBox="0 0 32 32" aria-hidden="true"><circle class="kl-vring-bg" cx="16" cy="16" r="13" fill="none" stroke-width="2"/><circle class="kl-vring-prog" cx="16" cy="16" r="13" fill="none" stroke-width="2" stroke-dasharray="81.68" stroke-dashoffset="81.68" stroke-linecap="round" transform="rotate(-90 16 16)"/></svg></button>` : ""}
      </div>
      ${w ? '<div class="klavity-capmsg" id="klavity-capmsg" role="alert" hidden></div>' : ""}
      ${w ? '<div class="klavity-files" id="klavity-files" hidden></div>' : ""}
      
      <div class="klavity-error" id="klavity-err"></div>
      <div class="klavity-desc" id="klavity-desc" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Description" data-ph="${e === "feature" ? "Describe the feature you'd like..." : "Describe the bug..."}"></div>
      <div class="klavity-desc-hint" id="klavity-desc-hint" hidden>${Z("sparkles", { size: 13 })}<span>No title needed — we'll auto-generate one for you</span></div>
      ${t.onEnhance ? `<div class="klavity-enhance-row" id="klavity-enhance-row">
        <button type="button" class="klavity-enhance-btn" id="klavity-enhance">${Z("sparkles", { size: 14 })}<span>Enhance with AI</span></button>
        <button type="button" class="klavity-enhance-undo" id="klavity-enhance-undo" hidden>${Z("rotate-cw", { size: 13 })}<span>Undo</span></button>
        <button type="button" class="klavity-enhance-regen" id="klavity-enhance-regen" hidden>${Z("refresh-cw", { size: 13 })}<span>Regenerate</span></button>
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
          <span class="klavity-remail-sugg-check" aria-hidden="true" hidden>${Z("check", { size: 13 })}</span>
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
          <input type="checkbox" id="klavity-conlog-cb" checked>${Z("file-text", { size: 14 })}<span>Attach console logs</span>
        </label>
      </div>` : ""}
      <button type="button" class="klavity-submit" id="klavity-submit" disabled>Submit</button>
      <div class="klavity-progress" id="klavity-progress" role="progressbar" aria-label="Uploading report"><div class="klavity-progress-fill" id="klavity-progress-fill"></div></div>
    </div>
  `, Mr.appendChild(le), s.appendChild(Mr);
  const Ie = s.getElementById("klavity-sharp"), Ea = s.querySelector(".klavity-info-pop");
  if (Ie && Ea) {
    const g = document.createElement("div");
    g.className = "kl-float-tip", g.setAttribute("role", "tooltip"), g.innerHTML = Ea.innerHTML, s.appendChild(g);
    const k = Km({
      title: "One click to snap this tab",
      steer: "When the dialog appears, just click Allow — we'll grab a pixel-perfect screenshot of the issue."
    });
    k.style.position = "fixed", s.appendChild(k);
    let x = !1;
    Ym().then((_) => {
      x = _;
    }).catch(() => {
    });
    const C = (_, I) => {
      const L = Ie.getBoundingClientRect(), $ = Math.min(I, window.innerWidth - 16), F = 8, B = window.innerWidth, K = window.innerHeight;
      _.style.left = Math.max(F, Math.min(L.left + L.width / 2 - $ / 2, B - $ - F)) + "px", _.style.top = "-9999px", _.style.visibility = "hidden", _.style.display = "block";
      const J = _.offsetHeight;
      _.style.display = "";
      let ne = L.bottom + 8;
      ne + J + F > K && (ne = L.top - J - 8), _.style.top = Math.max(F, Math.min(ne, K - J - F)) + "px", _.style.visibility = "";
    }, E = () => {
      !t.snapWithoutSharePrompt && !M && !x ? (g.classList.remove("kl-show"), C(k, 288), k.classList.add("kl-show")) : (k.classList.remove("kl-show"), C(g, 228), g.classList.add("kl-show"));
    }, R = () => {
      g.classList.remove("kl-show"), k.classList.remove("kl-show");
    };
    Ie.addEventListener("mouseenter", E), Ie.addEventListener("mouseleave", R), Ie.addEventListener("focus", E), Ie.addEventListener("blur", R);
  }
  let Ca = !1, Yr = null;
  function Ji() {
    try {
      Yr == null || Yr.remove();
    } catch {
    }
    Yr = null;
    try {
      Ie == null || Ie.classList.remove("kl-pulse");
    } catch {
    }
  }
  function hp() {
    var R;
    if (Ca || !Ie || et) return;
    Ca = !0;
    const g = document.createElement("div");
    g.className = "kl-float-tip kl-nudge", g.setAttribute("role", "status"), g.setAttribute("aria-live", "polite"), g.innerHTML = `<div class="kl-nudge-row"><span><b>This screenshot may be missing images or detail.</b> Share your screen for a pixel-perfect shot.</span><button type="button" class="kl-nudge-x" aria-label="Dismiss">${Z("x", { size: 13 })}</button></div>`, s.appendChild(g), Yr = g, g.style.visibility = "hidden", g.style.left = "-9999px", g.style.top = "-9999px", g.style.display = "block";
    const k = 8, x = Math.min(228, window.innerWidth - 16);
    let C = 0;
    const E = () => {
      if (!Yr || et) return;
      const _ = Ie.getBoundingClientRect();
      if ((_.width === 0 || _.height === 0) && C++ < 20) {
        requestAnimationFrame(E);
        return;
      }
      const I = window.innerWidth, L = window.innerHeight;
      g.style.visibility = "hidden", g.style.display = "block";
      const $ = g.offsetHeight;
      g.style.left = Math.max(k, Math.min(_.right - x, I - x - k)) + "px";
      let F = _.bottom + 8;
      F + $ + k > L && (F = _.top - $ - 8), g.style.top = Math.max(k, Math.min(F, L - $ - k)) + "px", g.style.visibility = "", g.classList.add("kl-show");
    };
    requestAnimationFrame(E), (R = g.querySelector(".kl-nudge-x")) == null || R.addEventListener("click", Ji);
    try {
      Ie.classList.add("kl-pulse");
    } catch {
    }
    try {
      setTimeout(() => Ji(), 9e3);
    } catch {
    }
    Ie.addEventListener("click", Ji, { once: !0 });
  }
  function fp(g) {
    _e = g === "attached", ot();
  }
  const Ma = {
    shadowRoot: s,
    // Host seeds shots it already tracks (evidence-session restore, region-initial): fireAdded=false so
    // onShotAdded does NOT re-fire (which would double-persist). Page metadata is carried through as-is.
    addScreenshot: (g, k, x, C, E, R) => Lt(g, k, x, !1, !!C, E, R),
    // fireAdded=true: select the new shot as the active hero + fire onShotAdded (persist). See interface doc.
    addCapturedShot: (g, k, x, C, E) => Lt(g, k, x, !0, !!C, E),
    close: ar,
    // KLA-772: expose the full per-image overlay map so the host can persist it on minimize.
    getAnnotations: wn,
    setReplayState: fp,
    // KLA-591: mirror the aggregate upload percent onto every video tile + file chip while a submit is in
    // flight. Re-renders the strip + chips so the bars paint; passing null clears them.
    setUploadProgress: (g) => {
      if (pe = li(g), !et)
        try {
          Oe(), to();
        } catch {
        }
    },
    addRecording: (g) => {
      if (!g || et) return;
      const k = P.findIndex((x) => x.id && g.id && x.id === g.id || x.dataUrl && g.dataUrl && x.dataUrl === g.dataUrl);
      k >= 0 ? (P[k] = g, oe = k) : (P.push(g), oe = P.length - 1), G = null, Vr();
    }
  };
  function Oe() {
    const g = s.getElementById("klavity-strip"), k = s.getElementById("klavity-counter");
    g.innerHTML = "", c.forEach((x, C) => {
      const E = document.createElement("div");
      E.className = "klavity-thumb", C === Se && E.classList.add("kl-thumb-active");
      const R = document.createElement("img");
      R.src = x, R.title = "Click to select + mark up", R.addEventListener("load", () => {
        R.naturalHeight > R.naturalWidth * 1.4 && E.classList.add("kl-tall");
      }, { once: !0 }), R.addEventListener("click", () => {
        Se = C, G = null, oe = null, Oe();
      });
      const _ = document.createElement("button");
      _.className = "klavity-rm", _.innerHTML = Z("x", { size: 13 }), _.title = "Remove", _.addEventListener("click", (F) => {
        F.stopPropagation(), Ra(C), Oe();
      });
      const I = document.createElement("button");
      I.className = "klavity-mk", I.innerHTML = Z("pencil", { size: 13 }), I.title = "Mark up", I.addEventListener("click", (F) => {
        F.stopPropagation(), jp(C);
      });
      const L = document.createElement("div");
      L.className = "klavity-thumb-media", L.append(R, _, I), E.append(L);
      const $ = a[C];
      if ($) {
        const F = yg[$], B = document.createElement("span");
        if (B.className = "klavity-qb kl-q-" + $, B.title = $ === "real-pixel" ? "Pixel-perfect capture (every image included)" : $ === "wireframe" ? 'Wireframe fallback — layout only, images not captured. This shot may contain defects; share your screen with Snap (or "Retake sharp") for a pixel-perfect capture.' : 'Rendered screenshot — may be missing images or detail. This shot can contain defects; share your screen with Snap (or "Retake sharp") for a pixel-perfect capture.', B.innerHTML = Z(F.iconName, { size: 10 }) + '<span class="klavity-qb-t">' + Me(F.label) + "</span>", L.appendChild(B), F.degraded && t.onRetakeSharp) {
          const K = document.createElement("button");
          K.type = "button", K.className = "klavity-retake", K.innerHTML = Z("zap", { size: 11 }) + "<span>Retake sharp</span>", K.title = "Recapture this shot at full pixel quality", K.addEventListener("click", (J) => {
            J.stopPropagation(), gp(C, K);
          }), E.appendChild(K);
        }
      }
      if (Ta.has(C)) {
        const F = document.createElement("div");
        F.className = "klavity-retake-note", F.textContent = "Markup cleared for the retake.", E.appendChild(F);
      }
      g.appendChild(E);
    }), W.forEach((x, C) => {
      if (en(x) !== "video") return;
      const E = document.createElement("div");
      E.className = "klavity-thumb kl-video-thumb", G === C && E.classList.add("kl-thumb-active");
      const R = document.createElement("video");
      R.src = Ke(x), R.muted = !0, R.preload = "metadata", R.setAttribute("playsinline", ""), R.tabIndex = -1;
      const _ = document.createElement("span");
      _.className = "kl-video-play", _.setAttribute("aria-hidden", "true"), _.innerHTML = Z("play", { size: 16 });
      const I = document.createElement("span");
      I.className = "kl-video-badge", I.innerHTML = Z("play", { size: 9 }) + "<span>Video</span>", E.title = "Click to play " + x.name, E.addEventListener("click", () => {
        G = C, oe = null, Oe();
      });
      const L = document.createElement("button");
      L.className = "klavity-rm", L.innerHTML = Z("x", { size: 13 }), L.title = "Remove", L.addEventListener("click", (F) => {
        F.stopPropagation(), _a(C);
      }), E.append(R, _, I, L);
      const $ = li(pe);
      if ($ != null) {
        const F = document.createElement("div");
        F.className = "kl-att-prog";
        const B = document.createElement("i");
        B.style.width = $ + "%", F.appendChild(B), E.appendChild(F);
      }
      g.appendChild(E);
    }), P.forEach((x, C) => {
      const E = document.createElement("div");
      E.className = "klavity-thumb kl-video-thumb kl-rec-tile", oe === C && E.classList.add("kl-thumb-active");
      const R = document.createElement("video");
      let _ = x.dataUrl;
      x.blob && typeof URL < "u" && typeof URL.createObjectURL == "function" && (_ = x._previewUrl || (x._previewUrl = URL.createObjectURL(x.blob))), R.src = _, R.muted = !0, R.preload = "metadata", R.setAttribute("playsinline", ""), R.tabIndex = -1;
      const I = document.createElement("span");
      I.className = "kl-video-play", I.setAttribute("aria-hidden", "true"), I.innerHTML = Z("play", { size: 16 });
      const L = Math.round(x.durationMs / 1e3), $ = document.createElement("span");
      $.className = "kl-video-badge", $.innerHTML = Z("play", { size: 9 }) + `<span>${Math.floor(L / 60)}:${String(L % 60).padStart(2, "0")}${x.screenOnly ? " · screen" : ""}</span>`, E.title = "Click to play your recording", E.addEventListener("click", () => {
        oe = C, G = null, Oe();
      });
      const F = document.createElement("button");
      F.type = "button", F.className = "kl-rerec", F.innerHTML = Z("refresh-cw", { size: 12 }), F.title = "Re-record", F.setAttribute("aria-label", "Re-record"), F.addEventListener("click", (J) => {
        var X;
        J.stopPropagation();
        const ne = P.splice(C, 1)[0];
        if (ne && ne._previewUrl)
          try {
            URL.revokeObjectURL(ne._previewUrl);
          } catch {
          }
        oe === C ? oe = null : oe != null && oe > C && (oe -= 1), Vr();
        try {
          (X = s.getElementById("klavity-record")) == null || X.click();
        } catch {
        }
      });
      const B = document.createElement("button");
      B.className = "klavity-rm", B.innerHTML = Z("x", { size: 13 }), B.title = "Remove", B.addEventListener("click", (J) => {
        J.stopPropagation();
        const ne = P.splice(C, 1)[0];
        if (ne && ne._previewUrl)
          try {
            URL.revokeObjectURL(ne._previewUrl);
          } catch {
          }
        oe === C ? oe = null : oe != null && oe > C && (oe -= 1), Vr();
      }), E.append(R, I, $, F, B);
      const K = li(pe);
      if (K != null) {
        const J = document.createElement("div");
        J.className = "kl-att-prog";
        const ne = document.createElement("i");
        ne.style.width = K + "%", J.appendChild(ne), E.appendChild(J);
      }
      g.appendChild(E);
    });
    try {
      const x = g.children[Se];
      x && typeof x.scrollIntoView == "function" && x.scrollIntoView({ block: "nearest", inline: "nearest" });
    } catch {
    }
    if (l) {
      const x = document.createElement("div");
      x.className = "kl-thumb-skel kl-loading", x.setAttribute("role", "status"), x.setAttribute("aria-label", "Capturing screenshot"), x.innerHTML = '<span class="kl-skel-spin" aria-hidden="true"></span><span>Capturing…</span>', g.appendChild(x);
    }
    k.textContent = `${c.length}/${b} images`, k instanceof HTMLElement && (k.hidden = c.length === 0), ot(), Vn(), Ka();
  }
  function Vn() {
    const g = s.getElementById("klavity-sharphint");
    if (!g) return;
    if (c.length > 0 && Se >= 0 && Se < c.length && !!h[Se] && !m && !!t.onCaptureSharp && !It) {
      if (!g.dataset.built) {
        g.dataset.built = "1", g.innerHTML = "";
        const C = document.createElement("span");
        C.className = "kl-sh-ic", C.innerHTML = Z("triangle-alert", { size: 15 });
        const E = document.createElement("span");
        E.className = "kl-sh-txt", E.textContent = "This screenshot may be missing images or detail. Share your screen with Snap for a pixel-perfect shot.";
        const R = document.createElement("button");
        R.type = "button", R.className = "kl-sh-use", R.textContent = "Use Snap", R.addEventListener("click", () => {
          m = !0, Vn(), Ie == null || Ie.click();
        });
        const _ = document.createElement("button");
        _.type = "button", _.className = "kl-sh-x", _.setAttribute("aria-label", "Dismiss"), _.title = "Dismiss", _.innerHTML = Z("x", { size: 12 }), _.addEventListener("click", () => {
          m = !0, Vn();
        }), g.append(C, E, R, _);
      }
      g.hidden = !1, Ie == null || Ie.classList.add("kl-suggest");
    } else
      g.hidden = !0, Ie == null || Ie.classList.remove("kl-suggest");
  }
  function Zi() {
    f = !0, l = !1, Oe();
  }
  function mp() {
    return f ? t.onCaptureSharp && t.snapWithoutSharePrompt ? "Couldn't grab this page automatically — click Snap for a pixel-perfect shot, or attach an image." : t.onCaptureSharp ? "Couldn't grab this page automatically — click Snap to share your tab for a pixel-perfect shot, or attach an image." : "Couldn't grab this page automatically — try Full Page, or attach an image." : y ? t.onCaptureSharp ? "This page is too large to capture automatically — click Snap for a pixel-perfect shot, or Full Page." : "This page is too large to capture automatically — click Full Page to capture it, or attach an image." : "Capture or upload a screenshot to start marking it up";
  }
  function Ut(g) {
    const k = s.getElementById("klavity-err");
    k && (k.textContent = g, k.style.display = "block");
  }
  function Qi() {
    const g = s.getElementById("klavity-err");
    g && (g.style.display = "none");
  }
  function Ra(g) {
    var k;
    if (!(g < 0 || g >= c.length)) {
      c.splice(g, 1), d.splice(g, 1), a.splice(g, 1), h.splice(g, 1), u.splice(g, 1), delete re[g];
      for (const x of Object.keys(re).map(Number).filter((C) => C > g).sort((C, E) => C - E))
        re[x - 1] = re[x], delete re[x];
      try {
        (k = t.onShotRemoved) == null || k.call(t, g);
      } catch {
      }
      delete Le[g], delete it[g];
      for (const x of Object.keys(Le).map(Number).filter((C) => C > g).sort((C, E) => C - E))
        Le[x - 1] = Le[x], delete Le[x];
      for (const x of Object.keys(it).map(Number).filter((C) => C > g).sort((C, E) => C - E))
        it[x - 1] = it[x], delete it[x];
      c.length === 0 && er(null);
    }
  }
  function Lt(g, k, x, C = !0, E = !1, R, _) {
    var L;
    if (c.length >= b) {
      Ut(`You can attach up to ${b} images.`);
      return;
    }
    Qi(), y = !1, f = !1, c.push(g);
    const I = c.length - 1;
    if (_ && Array.isArray(_.shapes) && _.shapes.length && (re[I] = sr(_)), d.push(t.compressImage ? t.compressImage(g) : Promise.resolve(g)), a.push(k), h.push(E && k !== "real-pixel"), u.push(R), C && (Se = c.length - 1, G = null, oe = null), Oe(), C)
      try {
        (L = t.onShotAdded) == null || L.call(t, g, k);
      } catch {
      }
  }
  const Ta = /* @__PURE__ */ new Set();
  async function gp(g, k) {
    if (!(It || !t.onRetakeSharp)) {
      lt(!0), k.classList.add("kl-loading"), o.style.display = "none";
      try {
        const x = i ? Or(document.body) : null;
        let C;
        try {
          C = await t.onRetakeSharp(u[g]);
        } finally {
          x == null || x();
        }
        if (C) {
          const { dataUrl: E, quality: R } = tr(C);
          E && (c[g] = E, d[g] = t.compressImage ? t.compressImage(E) : Promise.resolve(E), a[g] = R ?? "real-pixel", h[g] = !1, re[g] && (delete re[g], Ta.add(g), Zt(g)), delete Le[g], delete it[g]);
        }
      } catch {
      } finally {
        o.style.display = "", lt(!1), Oe();
      }
    }
  }
  function Aa(g) {
    return g.type.startsWith("image/") || /\.(heic|heif|png|jpe?g|gif|webp|bmp|avif|svg)$/i.test(g.name);
  }
  async function eo(g) {
    Qi();
    for (const k of g) {
      if (c.length >= b) {
        Ut(`You can attach up to ${b} images.`);
        break;
      }
      if (!Aa(k)) {
        Ut(`"${k.name}" isn't an image — only image files can be attached.`);
        continue;
      }
      if (k.size > S) {
        Ut(`"${k.name}" is too large — images must be under ${Math.round(S / 1024 / 1024)} MB.`);
        continue;
      }
      try {
        Lt(await Il(k));
      } catch {
        Ut(`Couldn't add "${k.name}". Please try a different image.`);
      }
    }
  }
  function to() {
    const g = s.getElementById("klavity-files");
    if (!g) return;
    g.innerHTML = "";
    const k = W.filter((x) => en(x) === "file");
    g.hidden = k.length === 0, W.forEach((x, C) => {
      if (en(x) !== "file") return;
      const E = document.createElement("div");
      E.className = "kl-file-chip";
      const R = document.createElement("span");
      R.className = "kl-file-ic", R.innerHTML = Z("file-text", { size: 14 });
      const _ = document.createElement("span");
      _.className = "kl-file-nm", _.textContent = x.name, _.title = x.name;
      const I = document.createElement("span");
      I.className = "kl-file-sz", I.textContent = x.size < 1024 ? `${x.size} B` : x.size < 1024 * 1024 ? `${Math.round(x.size / 1024)} KB` : `${(x.size / 1024 / 1024).toFixed(1)} MB`;
      const L = document.createElement("button");
      L.type = "button", L.className = "kl-file-rm", L.setAttribute("aria-label", `Remove ${x.name}`), L.title = "Remove", L.innerHTML = Z("x", { size: 11 }), L.addEventListener("click", () => {
        _a(C);
      }), E.append(R, _, I, L);
      const $ = li(pe);
      if ($ != null) {
        const F = document.createElement("div");
        F.className = "kl-att-prog";
        const B = document.createElement("i");
        B.style.width = $ + "%", F.appendChild(B), E.appendChild(F);
      }
      g.appendChild(E);
    }), ot();
  }
  function _a(g) {
    const k = W[g] && en(W[g]) === "video";
    W[g] && fe(W[g]), W.splice(g, 1), G != null && (k && G === g ? G = null : G > g && (G -= 1)), to(), Oe();
  }
  function yp(g, k) {
    if (g.kind === "upgrade") {
      if (!g.url) return null;
      const C = document.createElement("a");
      return C.className = "kl-capmsg-cta", C.href = g.url, C.target = "_blank", C.rel = "noopener noreferrer", C.textContent = g.label, C;
    }
    if (!t.onRequestUpgrade) return null;
    const x = document.createElement("button");
    return x.type = "button", x.className = "kl-capmsg-cta kl-capmsg-req", x.textContent = g.label, x.addEventListener("click", async () => {
      if (x.disabled) return;
      const C = x.textContent || g.label;
      x.disabled = !0, x.textContent = "Requesting…";
      let E = !1;
      try {
        E = await t.onRequestUpgrade({ reason: g.reason || "upgrade", context: k });
      } catch {
        E = !1;
      }
      if (E) {
        const R = document.createElement("span");
        R.className = "kl-capmsg-sent", R.innerHTML = `<span class="kl-capmsg-sent-ic">${Z("check")}</span>Request sent to your team`, x.replaceWith(R);
      } else
        x.disabled = !1, x.textContent = C;
    }), x;
  }
  function bp(g, k) {
    const x = s.getElementById("klavity-capmsg");
    if (!x || !g.overCap) return;
    x.innerHTML = "";
    const C = document.createElement("span");
    if (C.className = "kl-capmsg-t", C.textContent = g.message || "", x.appendChild(C), g.cta) {
      const E = yp(g.cta, k);
      if (E && x.appendChild(E), g.cta.hint) {
        const R = document.createElement("span");
        R.className = "kl-capmsg-hint", R.textContent = g.cta.hint, x.appendChild(R);
      }
    }
    x.hidden = !1;
  }
  function kp() {
    const g = s.getElementById("klavity-capmsg");
    g && (g.hidden = !0, g.innerHTML = "");
  }
  async function vp(g) {
    Qi(), kp();
    for (const k of g) {
      if (Aa(k)) {
        await eo([k]);
        continue;
      }
      if (W.length >= T) {
        Ut(`You can attach up to ${T} files.`);
        break;
      }
      const x = Sg(k, { capBytes: N, role: U, upgradeUrl: z });
      if (x.overCap) {
        bp(x, {
          page: (typeof location < "u" ? location.href : "") || "",
          fileMeta: { name: k.name, sizeMb: Math.round(k.size / 1024 / 1024 * 10) / 10 }
        });
        continue;
      }
      if (W.reduce((E, R) => E + R.size, 0) + k.size > ee) {
        Ut(`Attachments exceed the ${Math.round(ee / 1024 / 1024)} MB total limit.`);
        break;
      }
      try {
        const E = k.type || (Us(k) ? bg(k.name) : ""), R = Us(k) && nt(), _ = R ? { name: k.name, type: E, size: k.size, dataUrl: "", blob: k } : { name: k.name, type: E, size: k.size, dataUrl: await Il(k) };
        if (R)
          try {
            O.set(_, URL.createObjectURL(k));
          } catch {
          }
        const I = W.push(_) - 1;
        to(), en(W[I]) === "video" && (G = I), Oe();
      } catch {
        Ut(`Couldn't add "${k.name}". Please try a different file.`);
      }
    }
  }
  function Vr() {
    et || (Oe(), ot(), Cp(), wp());
  }
  function wp() {
    var k;
    const g = P.map((x) => x.id || x.dataUrl).join("|");
    if (g !== H) {
      H = g;
      try {
        (k = t.onRecordingsChange) == null || k.call(t, P.slice());
      } catch {
      }
    }
  }
  function Qt() {
    var C;
    const g = s.getElementById("klavity-multi-start"), k = s.getElementById("klavity-multi-status");
    if (!g || !k) return;
    const x = Be === "recording" ? "Stop &amp; analyse recording" : Be === "processing" ? "AI is analysing…" : Be === "done" ? "Record another walkthrough" : "Start Recording";
    if (g.innerHTML = `${Be === "processing" ? '<span class="kl-enh-loader"></span>' : Z("monitor", { size: 15 })}<span>${x}</span>`, g.disabled = Be === "processing" || Be === "recording", k.classList.toggle("kl-rec", Be === "recording"), k.classList.toggle("kl-ok", Be === "done"), Be === "recording")
      k.hidden = !1, k.textContent = "Recording screen and microphone…";
    else if (Be === "done" && Ee) {
      const E = Ee.length;
      k.hidden = !1, k.innerHTML = `${E} issue${E === 1 ? "" : "s"} identified and ready for review.<button type="button" class="kl-multi-reopen" id="klavity-multi-reopen">Review</button>`, (C = k.querySelector("#klavity-multi-reopen")) == null || C.addEventListener("click", () => La());
    } else Dt ? (k.hidden = !1, k.textContent = Dt) : (k.hidden = !0, k.textContent = "");
  }
  async function xp() {
    var I, L;
    if (It || Be === "processing" || Be === "recording" || !t.onRecord || !t.onSplitRecording) return;
    if (!!!(ct && P.includes(ct)) && P.length >= Ve) {
      Ut(`You can attach up to ${Ve} recordings.`);
      return;
    }
    const k = ++Tt;
    Dt = "", lt(!0);
    const x = ($) => {
      o.style.display = $ === "recording" ? "none" : "", $ === "recording" && k === Tt && (Be = "recording", Qt());
    };
    let C = null;
    try {
      C = await t.onRecord(x);
    } catch {
      C = null;
    } finally {
      o.style.display = "", lt(!1);
    }
    if (k !== Tt || et) return;
    if (!C) {
      Be = Ee ? "done" : "idle", Qt();
      return;
    }
    for (let $ = c.length - 1; $ >= 0; $--)
      (L = (I = re[$]) == null ? void 0 : I.shapes) != null && L.length || Ra($);
    const E = ct ? P.indexOf(ct) : -1;
    E >= 0 ? P[E] = C : P.push(C), oe = E >= 0 ? E : P.length - 1, G = null, ct = C, Ee = null, at = null, xn(), Be = "processing", Vr(), Qt();
    let R = null;
    try {
      const $ = C.blob || await (await fetch(C.dataUrl)).blob();
      R = await t.onSplitRecording($, { text: Y.value.trim() });
    } catch {
      R = null;
    }
    if (k !== Tt || et) return;
    const _ = (R || []).filter(($) => $ && (String($.title || "").trim() || String($.description || "").trim()));
    if (!_.length) {
      ct = null, Ee = null, at = null, Be = "idle", Dt = "We couldn't pick out separate issues in this recording — it's attached, so you can describe it and submit it as one report.", Qt();
      return;
    }
    Ee = _.map(($, F) => ({
      ...$,
      id: `mi${k}_${F}`,
      title: String($.title || "").trim() || `Issue ${F + 1}`,
      kind: $.kind === "feature" ? "feature" : "bug",
      description: Al($),
      selected: !0,
      thumb: null
    })), at = Ee.map(($) => ({ ...$ })), Rt = !1, vt = null, Jt = "", Be = "done", Qt(), La(), Sp(k);
  }
  async function Sp(g) {
    const k = ct;
    if (!k || !Ee) return;
    let x = k.dataUrl, C = null;
    if (k.blob)
      try {
        C = URL.createObjectURL(k.blob), x = C;
      } catch {
      }
    try {
      for (const E of [...Ee]) {
        if (g !== Tt || et) return;
        const R = typeof E.startSec == "number" ? E.startSec : 0, _ = typeof E.endSec == "number" && E.endSec > R ? E.endSec : R + 2, I = x ? await pg(x, R + Math.min(1, (_ - R) / 2)) : null;
        if (g !== Tt) return;
        if (I) {
          for (const L of [Ee, at]) {
            const $ = L == null ? void 0 : L.find((F) => F.id === E.id);
            $ && ($.thumb = I);
          }
          Mt();
        }
        Ep(E.id, I, g);
      }
    } finally {
      if (C)
        try {
          URL.revokeObjectURL(C);
        } catch {
        }
    }
  }
  async function Ep(g, k, x) {
    const C = t.onEnhance, E = Ee == null ? void 0 : Ee.find((L) => L.id === g);
    if (!C || !E) return;
    const R = String(E.narration || "").trim() || E.title, _ = (L) => {
      for (const $ of [Ee, at]) {
        const F = $ == null ? void 0 : $.find((B) => B.id === g);
        F && (F.enhancing = L);
      }
    };
    _(!0), Mt();
    let I = null;
    try {
      I = await C(R, { images: k ? 1 : 0, ...k ? { shot: k } : {} });
    } catch {
      I = null;
    }
    if (!(x !== Tt || et)) {
      if (_(!1), I)
        for (const L of [Ee, at]) {
          const $ = L == null ? void 0 : L.find((F) => F.id === g);
          !$ || L === Ee && $.edited || ($.title = String(I.summary || "").trim() || $.title, $.actualResult = I.actualResult || "", $.expectedResult = I.expectedResult || "", $.stepsToReproduce = Array.isArray(I.stepsToReproduce) ? I.stepsToReproduce : [], I.suggestedSeverity && ($.suggestedSeverity = I.suggestedSeverity), I.suggestedPriority && ($.suggestedPriority = I.suggestedPriority), $.description = Al($));
        }
      Mt();
    }
  }
  function La() {
    if (!Ee || et) return;
    const g = s.getElementById("klavity-side");
    Pe || (Pe = document.createElement("div"), Pe.className = "kl-mr", Pe.id = "klavity-mr", Pe.setAttribute("role", "dialog"), Pe.setAttribute("aria-label", "AI Analysis Complete"), (g || le).appendChild(Pe)), g && (g.scrollTop = 0, g.classList.add("kl-mr-open")), Mt();
  }
  function xn() {
    var g;
    At = null, Ct = null, Pe == null || Pe.remove(), Pe = null, (g = s.getElementById("klavity-side")) == null || g.classList.remove("kl-mr-open");
  }
  function Cp() {
    !ct || P.includes(ct) || (Tt++, ct = null, Ee = null, at = null, Rt = !1, Be = "idle", Dt = "", xn(), Qt());
  }
  function Mp(g) {
    if (!ct) return;
    const k = P.indexOf(ct);
    if (k < 0) return;
    (oe !== k || !s.querySelector(".kl-hero-video")) && (oe = k, G = null, Oe());
    const x = s.querySelector(".kl-hero-video");
    if (!x) return;
    const C = () => {
      try {
        x.currentTime = Math.max(0, g);
        const E = x.play();
        E && typeof E.catch == "function" && E.catch(() => {
        });
      } catch {
      }
    };
    x.readyState >= 1 ? C() : x.addEventListener("loadedmetadata", C, { once: !0 });
  }
  function Ia() {
    if (Rt && !vt && typeof window.confirm == "function") {
      let g = !0;
      try {
        g = window.confirm("Leave this review? Your ticket selections and edits will be discarded.");
      } catch {
        g = !0;
      }
      if (!g) return !1;
    }
    return at && (Ee = at.map((g) => ({ ...g }))), Rt = !1, !0;
  }
  function Rp(g) {
    return dg(g.description, g.title);
  }
  function Mt() {
    if (!Pe || !Ee) return;
    if (vt) {
      Lp();
      return;
    }
    const g = Ee, k = g.filter((_) => _.selected), x = g.length > 0 && k.length === g.length, C = g.length, E = k.length, R = g.map((_) => {
      const I = Fs(_.startSec, _.endSec), L = cg(_.suggestedPriority), $ = typeof _.confidence == "number" && isFinite(_.confidence) ? Math.round(_.confidence * 100) : null, F = _.kind === "feature";
      return `<div class="kl-mr-card${_.selected ? "" : " kl-off"}" data-id="${Me(_.id)}"><input type="checkbox" class="kl-mr-cb" ${_.selected ? "checked" : ""} aria-label="${_.selected ? "Deselect" : "Select"} ${Me(_.title)}"><div class="kl-mr-thumb">${_.thumb ? `<img src="${Me(_.thumb)}" alt="">` : Z("play", { size: 18 })}</div><div class="kl-mr-main"><div class="kl-mr-row"><p class="kl-mr-t">${Me(_.title)}</p><button type="button" class="kl-mr-edit" aria-label="Edit ${Me(_.title)}">${Z("pencil", { size: 15 })}</button></div><div class="kl-mr-badges"><span class="${F ? "kl-mr-feat" : "kl-mr-bug"}">${Z(F ? "lightbulb" : "bug", { size: 10 })}${F ? "Feature" : "Bug"}</span>${L ? `<span class="kl-mr-p${L === "High" ? 1 : L === "Medium" ? 2 : 3}">${L}</span>` : ""}${$ != null && $ < 85 ? `<span class="kl-mr-conf">${$}% · review</span>` : ""}${_.possibleDuplicate ? '<span class="kl-mr-dup">Possible duplicate</span>' : ""}${_.enhancing ? '<span class="kl-mr-enh"><span class="kl-enh-loader"></span>Enhancing…</span>' : ""}</div><p class="kl-mr-d">${Me(Rp(_))}</p>${I ? `<button type="button" class="kl-mr-ts" title="Open recording at this timestamp">${Z("clock", { size: 11 })} ${Me(I)}</button>` : ""}</div></div>`;
    }).join("");
    Pe.innerHTML = `<div class="kl-mr-head"><button type="button" class="kl-mr-icon" id="kl-mr-back" aria-label="Back to new report">${Z("chevron-left", { size: 20 })}</button><p class="kl-mr-title">AI Analysis Complete</p><button type="button" class="kl-mr-icon kl-mr-x" id="kl-mr-close" aria-label="Close">${Z("x", { size: 18 })}</button></div><div class="kl-mr-body"><div class="kl-mr-inner"><div class="kl-mr-banner"><span class="kl-mr-ok">${Z("check", { size: 14 })}</span><div><p class="kl-mr-b1">We've identified ${C} report${C === 1 ? "" : "s"} from your recording</p><p class="kl-mr-b2">Review, select and submit the tickets you want to create.</p></div></div><div class="kl-mr-counts"><p>${C} report${C === 1 ? "" : "s"} detected</p><p class="kl-mr-sel">${E} selected</p></div><label class="kl-mr-all"><input type="checkbox" id="kl-mr-all" ${x ? "checked" : ""} aria-label="${x ? "Deselect all tickets" : "Select all tickets"}"><span>Select all</span><span class="kl-mr-kept">Recording and transcript preserved</span></label><div class="kl-mr-list">${R}</div></div></div><div class="kl-mr-foot"><p>${E} of ${C} tickets selected</p>${Jt ? `<p class="kl-mr-err" role="alert">${Me(Jt)}</p>` : ""}<button type="button" class="kl-mr-submit" id="kl-mr-submit" ${E === 0 || kt ? "disabled" : ""}>${kt ? '<span class="kl-enh-loader"></span> Creating tickets…' : `Submit ${E} ${E === 1 ? "Ticket" : "Tickets"}`}</button></div>` + (At && Ct ? Tp() : ""), Ap();
  }
  function Tp() {
    const g = Ct, k = (x, C) => `<div class="kl-mr-seg" style="grid-template-columns:repeat(${C.length},1fr)">${C.map(([E, R, _]) => `<button type="button" class="${x}${(x === "kl-mr-kind" ? g.kind : g.priority) === E ? " kl-on" : ""}" data-v="${E}">${_}${R}</button>`).join("")}</div>`;
    return `<div class="kl-mr-layer" id="kl-mr-editor"><div class="kl-mr-dlg" role="dialog" aria-label="Edit generated ticket"><div class="kl-mr-dlg-h"><div><h3>Edit generated ticket</h3><p>Update the AI-generated details before submission.</p></div><button type="button" class="kl-mr-icon kl-mr-x" id="kl-mr-ed-x" aria-label="Close editor">${Z("x", { size: 15 })}</button></div><label class="kl-mr-f"><span>Ticket title</span><input type="text" class="kl-mr-in" id="kl-mr-ed-title" maxlength="160" value="${Me(g.title)}"></label><div class="kl-mr-f"><span>Type</span>${k("kl-mr-kind", [["bug", "Bug", Z("bug", { size: 13 })], ["feature", "Feature", Z("lightbulb", { size: 13 })]])}</div><div class="kl-mr-f"><span>Priority</span>${k("kl-mr-pri", Ds.map((x) => [x.priority, x.label, ""]))}</div><label class="kl-mr-f"><span>Description</span><textarea class="kl-mr-ta" id="kl-mr-ed-desc">${Me(g.description)}</textarea></label><label class="kl-mr-f"><span>Recording timestamp</span><input type="text" class="kl-mr-in" id="kl-mr-ed-ts" placeholder="0:42–1:10" value="${Me(g.ts)}"></label><div class="kl-mr-dlg-f"><button type="button" class="kl-mr-btn kl-danger" id="kl-mr-ed-rm">${Z("trash-2", { size: 13 })} Remove</button><button type="button" class="kl-mr-btn kl-ghost" id="kl-mr-ed-cancel">Cancel</button><button type="button" class="kl-mr-btn kl-primary" id="kl-mr-ed-save" ${g.title.trim() && g.description.trim() ? "" : "disabled"}>Save changes</button></div></div></div>`;
  }
  function Ap() {
    var k, x, C, E;
    if (!Pe || !Ee) return;
    const g = (R) => Pe.querySelector(R);
    (k = g("#kl-mr-back")) == null || k.addEventListener("click", () => {
      kt || !Ia() || (xn(), Qt());
    }), (x = g("#kl-mr-close")) == null || x.addEventListener("click", () => {
      kt || !Ia() || (xn(), ar());
    }), (C = g("#kl-mr-all")) == null || C.addEventListener("change", (R) => {
      const _ = R.target.checked;
      Ee.forEach((I) => {
        I.selected = _;
      }), Rt = !0, Mt();
    }), (E = g("#kl-mr-submit")) == null || E.addEventListener("click", () => {
      Ip();
    }), Pe.querySelectorAll(".kl-mr-card").forEach((R) => {
      var I, L, $;
      const _ = Ee.find((F) => F.id === R.dataset.id);
      _ && ((I = R.querySelector(".kl-mr-cb")) == null || I.addEventListener("change", (F) => {
        _.selected = F.target.checked, Rt = !0, Mt();
      }), (L = R.querySelector(".kl-mr-edit")) == null || L.addEventListener("click", () => {
        var F;
        At = _.id, Ct = { title: _.title, kind: _.kind === "feature" ? "feature" : "bug", priority: String(_.suggestedPriority || "").toUpperCase(), description: _.description, ts: Fs(_.startSec, _.endSec) }, Mt(), (F = Pe == null ? void 0 : Pe.querySelector("#kl-mr-ed-title")) == null || F.focus();
      }), ($ = R.querySelector(".kl-mr-ts")) == null || $.addEventListener("click", () => Mp(typeof _.startSec == "number" ? _.startSec : 0)));
    }), At && Ct && _p();
  }
  function _p() {
    var R, _, I, L, $, F;
    const g = Ct, k = (B) => Pe.querySelector(B), x = k("#kl-mr-ed-save"), C = () => {
      x && (x.disabled = !(g.title.trim() && g.description.trim()));
    }, E = () => {
      At = null, Ct = null, Mt();
    };
    (R = k("#kl-mr-ed-title")) == null || R.addEventListener("input", (B) => {
      g.title = B.target.value, C();
    }), (_ = k("#kl-mr-ed-desc")) == null || _.addEventListener("input", (B) => {
      g.description = B.target.value, C();
    }), (I = k("#kl-mr-ed-ts")) == null || I.addEventListener("input", (B) => {
      g.ts = B.target.value;
    }), Pe.querySelectorAll(".kl-mr-kind,.kl-mr-pri").forEach((B) => B.addEventListener("click", () => {
      B.classList.contains("kl-mr-kind") ? g.kind = B.dataset.v === "feature" ? "feature" : "bug" : g.priority = B.dataset.v || "";
      const K = B.classList.contains("kl-mr-kind") ? ".kl-mr-kind" : ".kl-mr-pri";
      Pe.querySelectorAll(K).forEach((J) => J.classList.toggle("kl-on", J === B));
    })), (L = k("#kl-mr-ed-x")) == null || L.addEventListener("click", E), ($ = k("#kl-mr-ed-cancel")) == null || $.addEventListener("click", E), (F = k("#kl-mr-ed-rm")) == null || F.addEventListener("click", () => {
      if (Ee = Ee.filter((B) => B.id !== At), Rt = !0, At = null, Ct = null, !Ee.length) {
        Ee = null, Be = "idle", xn(), Qt();
        return;
      }
      Mt(), Qt();
    }), x == null || x.addEventListener("click", () => {
      const B = Ee.find((ne) => ne.id === At);
      if (!B || !g.title.trim() || !g.description.trim()) return;
      B.title = g.title.trim(), B.edited = !0, B.kind = g.kind, B.description = g.description.trim();
      const K = Ds.find((ne) => ne.priority === g.priority);
      K && (B.suggestedPriority = K.priority, B.suggestedSeverity = K.severity);
      const J = ug(g.ts);
      B.startSec = J.startSec, B.endSec = J.endSec, Rt = !0, At = null, Ct = null, Mt();
    });
  }
  function Lp() {
    var C, E;
    if (!Pe || !vt) return;
    const g = vt.refs.length, k = vt.refs.filter((R) => R.key).map((R) => {
      const _ = Mo(R.url), I = Me(Co(R.key, R.url));
      return _ ? `<a href="${Me(_)}" target="_blank" rel="noopener">${I}</a>` : `<span>${I}</span>`;
    }).join("");
    Pe.innerHTML = `<div class="kl-mr-head"><p class="kl-mr-title" style="padding-left:6px">Tickets created</p><button type="button" class="kl-mr-icon kl-mr-x" id="kl-mr-close" aria-label="Close">${Z("x", { size: 18 })}</button></div><div class="kl-mr-done"><span class="kl-mr-done-ic">${Z("check", { size: 25 })}</span><h3>${g} ticket${g === 1 ? "" : "s"} created</h3><p>${Me(n.thankYou || "Your AI-generated reports have been filed.")}</p>${vt.failed ? `<p role="alert">${vt.failed} ticket${vt.failed === 1 ? "" : "s"} couldn't be created — please report ${vt.failed === 1 ? "it" : "them"} again.</p>` : ""}${k ? `<div class="kl-mr-keys">${k}</div>` : ""}<button type="button" class="kl-mr-btn kl-primary" id="kl-mr-done">Done</button></div>`;
    const x = () => ar({ reason: "submitted" });
    (C = Pe.querySelector("#kl-mr-close")) == null || C.addEventListener("click", x), (E = Pe.querySelector("#kl-mr-done")) == null || E.addEventListener("click", x);
  }
  async function Ip() {
    var I;
    if (!Ee || !ct || kt) return;
    const g = Ee.filter((L) => L.selected).map((L) => ({ ...L, title: L.title.trim(), description: L.description.trim() }));
    if (!g.length) return;
    const k = ja(), x = n.submitTargetToggle !== !1 ? { feedbackTarget: no } : {}, C = (L) => L.kind === "feature" ? "feature" : "bug", E = (L) => ({
      ...L.suggestedSeverity ? { suggestedSeverity: L.suggestedSeverity } : {},
      ...L.suggestedPriority ? { suggestedPriority: L.suggestedPriority } : {}
    }), R = g[0], _ = g.slice(1);
    kt = !0, Jt = "", Mt();
    try {
      const L = await Promise.all(d.slice()), $ = ct, F = {
        type: C(R),
        ...se ? { kind: C(R) } : {},
        title: R.title,
        description: _l(R, { primary: !0, reporterNote: Y.value.trim() }),
        screenshots: L.length ? L : R.thumb ? [R.thumb] : [],
        ...W.length ? { files: W.slice() } : {},
        recordings: [$, ...P.filter((X) => X !== $)],
        ...L.length ? { annotations: Ae() } : {},
        reporterEmail: k.email,
        createContact: k.createContact,
        ...x,
        ...E(R),
        ...t.consoleAttachToggle ? { attachConsole: !!((I = s.getElementById("klavity-conlog-cb")) != null && I.checked) } : {}
      }, B = (X, V) => ({
        type: C(X),
        ...se ? { kind: C(X) } : {},
        title: X.title,
        description: _l(X, { primary: !1, videoTitle: R.title, videoKey: V }),
        screenshots: X.thumb ? [X.thumb] : [],
        recordings: [$],
        reporterEmail: k.email,
        createContact: !1,
        ...x,
        ...E(X)
      });
      if (t.backgroundUpload) {
        const X = t.onSubmit;
        X(F), (async () => {
          for (const V of _)
            try {
              await X(B(V));
            } catch (he) {
              try {
                console.error("[Klavity] multi-issue ticket failed:", he);
              } catch {
              }
            }
        })(), ar({ immediate: !0, reason: "submitted" });
        return;
      }
      const K = await t.onSubmit(F), J = [{ key: K.issueKey, url: K.issueUrl }];
      let ne = 0;
      for (const X of _)
        try {
          const V = await t.onSubmit(B(X, K.issueKey || void 0));
          J.push({ key: V.issueKey, url: V.issueUrl });
        } catch (V) {
          ne++;
          try {
            console.error("[Klavity] multi-issue ticket failed:", V);
          } catch {
          }
        }
      if (et) return;
      kt = !1, vt = { refs: J, failed: ne }, Rt = !1, Mt();
    } catch (L) {
      try {
        console.error("[Klavity] multi-issue submit failed:", L);
      } catch {
      }
      if (et) return;
      kt = !1, Jt = n.debug ? `Couldn't create the tickets — ${(L == null ? void 0 : L.message) || "Unknown error"}` : "Couldn't create the tickets. Please check your connection and try again.", Mt();
    }
  }
  let Rr = null;
  function ar(g) {
    var C;
    if (et) return;
    et = !0;
    for (const E of ue.splice(0))
      try {
        E();
      } catch {
      }
    Tt++;
    for (const E of W) fe(E);
    for (const E of P)
      if (E._previewUrl)
        try {
          URL.revokeObjectURL(E._previewUrl);
        } catch {
        }
    if (mr) {
      try {
        URL.revokeObjectURL(mr);
      } catch {
      }
      mr = null;
    }
    Rr == null || Rr(), Ft && (clearTimeout(Ft), Ft = null), document.removeEventListener("keydown", Tr, { capture: !0 }), document.removeEventListener("paste", Na);
    try {
      (C = t.onClose) == null || C.call(t, g == null ? void 0 : g.reason);
    } catch {
    }
    const k = s.querySelector(".klavity-modal");
    if (g != null && g.immediate || !k) {
      Je(o);
      return;
    }
    k.classList.add("kl-closing");
    const x = () => Je(o);
    k.addEventListener("animationend", x, { once: !0 }), setTimeout(x, 700);
  }
  function Oa(g, k) {
    if (Ft || et) return;
    const x = document.createElement("div");
    x.className = "klavity-toast-progress", x.style.animationDuration = k + "ms", g.appendChild(x);
    let C = k, E = Date.now();
    const R = () => {
      E = Date.now(), Ft = setTimeout(() => {
        ar();
      }, C);
    }, _ = () => {
      Ft && (clearTimeout(Ft), Ft = null, C = Math.max(0, C - (Date.now() - E)), x.style.animationPlayState = "paused");
    }, I = () => {
      Ft || g.classList.contains("kl-closing") || (x.style.animationPlayState = "running", R());
    };
    g.addEventListener("mouseenter", _), g.addEventListener("mouseleave", I), g.addEventListener("focusin", _), g.addEventListener("focusout", (L) => {
      g.contains(L.relatedTarget) || I();
    }), R();
  }
  function Tr(g) {
    var k;
    if (Kn) {
      g.key === "Escape" ? (g.stopPropagation(), Kn()) : (g.key === "s" || g.key === "S") && g.stopPropagation();
      return;
    }
    if (g.key === "Escape") {
      g.stopPropagation(), oo();
      return;
    }
    if ((g.key === "s" || g.key === "S") && !g.metaKey && !g.ctrlKey && !g.altKey) {
      const x = typeof g.composedPath == "function" && g.composedPath()[0] || g.target;
      if (x && (x.tagName === "INPUT" || x.tagName === "TEXTAREA" || x.tagName === "SELECT" || x.isContentEditable || ((k = x.getAttribute) == null ? void 0 : k.call(x, "contenteditable")) === "true") || s.querySelector(".kl-edtb")) return;
      const C = s.getElementById("klavity-submit");
      C && !C.disabled && (g.preventDefault(), g.stopPropagation(), C.click());
    }
  }
  document.addEventListener("keydown", Tr, { capture: !0 });
  const Na = (g) => {
    if (!g.clipboardData) return;
    const k = Array.from(g.clipboardData.items).filter((x) => x.type.startsWith("image/")).map((x) => x.getAsFile()).filter((x) => !!x);
    k.length && eo(k);
  };
  document.addEventListener("paste", Na);
  const ro = () => {
    const g = le.querySelector("#klavity-desc");
    g && (g.placeholder = Ue === "feature" ? "Describe the feature you'd like..." : Ue === "bug" ? "Describe the bug..." : "Describe the issue...");
  };
  if (se) {
    const g = Array.from(le.querySelectorAll(".kl-type-chip"));
    g.forEach((k) => {
      k.addEventListener("click", () => {
        Ue = k.getAttribute("data-kind") || "bug", g.forEach((x) => {
          const C = x === k;
          x.classList.toggle("active", C), x.setAttribute("aria-checked", C ? "true" : "false");
        }), ro();
      });
    });
  } else {
    const g = le.querySelector(".kl-toggle-bug"), k = le.querySelector(".kl-toggle-feat");
    g.addEventListener("click", () => {
      Ue = "bug", g.classList.add("active"), k.classList.remove("active"), ro();
    }), k.addEventListener("click", () => {
      Ue = "feature", k.classList.add("active"), g.classList.remove("active"), ro();
    });
  }
  let no = "project";
  {
    const g = le.querySelector("#klavity-target");
    if (g) {
      const k = Array.from(g.querySelectorAll(".kl-tgt-opt"));
      for (const x of k)
        x.addEventListener("click", () => {
          no = x.dataset.target === "klavity" ? "klavity" : "project";
          for (const E of k) {
            const R = E === x;
            E.classList.toggle("on", R), E.setAttribute("aria-checked", R ? "true" : "false");
          }
        });
    }
  }
  const Y = le.querySelector("#klavity-desc");
  {
    const g = () => {
      try {
        return s.getSelection ? s.getSelection() : typeof window < "u" ? window.getSelection() : null;
      } catch {
        try {
          return typeof window < "u" ? window.getSelection() : null;
        } catch {
          return null;
        }
      }
    }, k = () => {
      const E = g();
      if (!E || !E.rangeCount) return -1;
      try {
        const R = E.getRangeAt(0);
        if (!Y.contains(R.endContainer)) return -1;
        const _ = R.cloneRange();
        return _.selectNodeContents(Y), _.setEnd(R.endContainer, R.endOffset), _.toString().length;
      } catch {
        return -1;
      }
    }, x = (E) => {
      const R = g();
      if (R)
        try {
          const _ = document.createRange(), I = document.createTreeWalker(Y, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
          let L, $ = E, F = !1;
          for (; L = I.nextNode(); ) {
            if (L.nodeName === "BR") {
              if ($ === 0) {
                _.setStartBefore(L), F = !0;
                break;
              }
              $ -= 1;
              continue;
            }
            if (L.nodeType === 3) {
              const B = (L.textContent || "").length;
              if ($ <= B) {
                _.setStart(L, $), F = !0;
                break;
              }
              $ -= B;
            }
          }
          F ? _.collapse(!0) : (_.selectNodeContents(Y), _.collapse(!1)), R.removeAllRanges(), R.addRange(_);
        } catch {
        }
    }, C = () => {
      const E = k(), R = Tl(Y).replace(/\n$/, "");
      Y.innerHTML = R ? Rl(R) : "", E >= 0 && x(E);
    };
    Y.addEventListener("input", C), Object.defineProperty(Y, "value", {
      configurable: !0,
      get() {
        return Tl(Y);
      },
      set(E) {
        const R = String(E ?? "").replace(/\n$/, "");
        Y.innerHTML = R ? Rl(R) : "";
      }
    }), Object.defineProperty(Y, "disabled", {
      configurable: !0,
      get() {
        return Y.getAttribute("contenteditable") === "false";
      },
      set(E) {
        Y.setAttribute("contenteditable", E ? "false" : "true"), Y.classList.toggle("kl-desc-disabled", !!E);
      }
    }), Object.defineProperty(Y, "placeholder", {
      configurable: !0,
      get() {
        return Y.getAttribute("data-ph") || "";
      },
      set(E) {
        Y.setAttribute("data-ph", String(E ?? ""));
      }
    });
  }
  const Ar = le.querySelector("#klavity-submit"), ye = le.querySelector("#klavity-remail");
  let pr = "", Sn = !1;
  ye && t.prefillEmail && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t.prefillEmail) && (ye.value = t.prefillEmail), ye && ye.value.trim() && (pr = ye.value.trim().toLowerCase());
  const Pa = le.querySelector("#klavity-desc-hint"), Op = () => !t.requireEmail || !!ye && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(ye.value.trim()), io = () => {
    var g;
    return c.length > 0 || _e || W.length > 0 || P.length > 0 || Y.value.trim().length > 0 || (((g = le.querySelector("#klavity-title")) == null ? void 0 : g.value.trim().length) ?? 0) > 0;
  };
  let Gn = null, Kn = null;
  const oo = () => {
    var C, E, R;
    if (!io()) {
      ar();
      return;
    }
    if (Gn) return;
    const g = document.createElement("div");
    Gn = g, g.setAttribute("role", "alertdialog"), g.setAttribute("aria-modal", "true"), g.setAttribute("aria-labelledby", "kl-cc-title"), g.style.cssText = "position:absolute;inset:0;z-index:30;display:flex;align-items:center;justify-content:center;background:rgba(12,10,8,.55);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)", g.innerHTML = '<div style="max-width:340px;background:var(--kl-bg,#1c1712);color:var(--kl-fg,#f5f3ee);border:1px solid var(--kl-border,#574f45);border-radius:14px;padding:20px 20px 16px;box-shadow:0 18px 48px rgba(0,0,0,.45);font-family:var(--kl-font,system-ui,sans-serif)"><div id="kl-cc-title" style="font-size:15px;font-weight:600;margin-bottom:6px">Discard this capture?</div><div style="font-size:13px;opacity:.8;line-height:1.45;margin-bottom:16px">Your screenshot and any annotations, recording or attached files will be lost.</div><div style="display:flex;gap:8px;justify-content:flex-end"><button id="kl-cc-keep" style="padding:8px 14px;border-radius:9px;border:1px solid var(--kl-border,#574f45);background:transparent;color:inherit;font-size:13px;font-weight:600;cursor:pointer">Keep editing</button><button id="kl-cc-discard" style="padding:8px 14px;border-radius:9px;border:none;background:#c0392b;color:#fff;font-size:13px;font-weight:600;cursor:pointer">Discard</button></div></div>';
    const k = () => {
      Je(g), Gn === g && (Gn = null, Kn = null);
    };
    Kn = k, g.addEventListener("click", (_) => {
      _.target === g && k();
    }), (C = g.querySelector("#kl-cc-keep")) == null || C.addEventListener("click", k), (E = g.querySelector("#kl-cc-discard")) == null || E.addEventListener("click", () => {
      k(), ar({ reason: "discard" });
    }), (s.querySelector(".klavity-modal") || Mr).appendChild(g);
    try {
      (R = g.querySelector("#kl-cc-keep")) == null || R.focus();
    } catch {
    }
  }, Np = () => {
  }, ot = () => {
    const g = Y.value.trim() === "";
    Ar.disabled = g && !io() || !Op(), Pa && (Pa.hidden = !(g && io()));
  };
  if (Y.addEventListener("input", Np), Y.addEventListener("input", ot), ye == null || ye.addEventListener("input", ot), t.onDescriptionChange) {
    const g = t.onDescriptionChange;
    let k = null;
    const x = () => {
      k && (clearTimeout(k), k = null);
      try {
        g(Y.value);
      } catch {
      }
    };
    Y.addEventListener("input", () => {
      k && clearTimeout(k), k = setTimeout(x, 600);
    }), Y.addEventListener("blur", x), Y.addEventListener("change", x), $e(x);
  }
  const En = le.querySelector("#klavity-title");
  if (En && t.onTitleChange) {
    const g = t.onTitleChange;
    let k = null;
    const x = () => {
      k && (clearTimeout(k), k = null);
      try {
        g(En.value);
      } catch {
      }
    };
    En.addEventListener("input", () => {
      k && clearTimeout(k), k = setTimeout(x, 600);
    }), En.addEventListener("blur", x), En.addEventListener("change", x), $e(x);
  }
  const _r = le.querySelector("#klavity-remail-sugg"), so = le.querySelector("#klavity-remail-matches"), $a = le.querySelector("#klavity-remail-sugg-hint"), hr = le.querySelector("#klavity-remail-addcontact"), za = le.querySelector(".klavity-remail-sugg-em"), Da = le.querySelector(".klavity-remail-sugg-check");
  let Bt = !1, Gr = "", Xn = [], ao = "", lo = !1, Fa = 0;
  const Ua = (g) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(g), Pp = (g) => {
    var C, E;
    const k = (g.name || g.email).trim(), x = k.split(/[\s._-]+/).filter(Boolean);
    return ((((C = x[0]) == null ? void 0 : C[0]) || "") + (((E = x[1]) == null ? void 0 : E[0]) || "")).toUpperCase() || k.slice(0, 1).toUpperCase();
  }, $p = (g) => {
    let k = 0;
    for (let x = 0; x < g.length; x++) k = k * 31 + g.charCodeAt(x) >>> 0;
    return `hsl(${k % 360} 58% 42%)`;
  };
  async function Ba(g) {
    if (!t.onLookupPeople) {
      Xn = [], ao = g, lo = !0;
      return;
    }
    const k = ++Fa;
    try {
      const x = await t.onLookupPeople(g);
      if (k !== Fa) return;
      Xn = Array.isArray(x) ? x : [];
    } catch {
      Xn = [];
    }
    ao = g, lo = !0, fr();
  }
  function fr() {
    if (!_r || !ye) return;
    const g = ye.value.trim(), k = g.toLowerCase();
    Bt && k !== Gr && (Bt = !1, Gr = "");
    const x = Sn ? Xn.filter((_) => !k || _.email.toLowerCase().includes(k) || (_.name || "").toLowerCase().includes(k)) : [], C = x.some((_) => _.email.toLowerCase() === k), E = Sn && Ua(g) && !C;
    so && (so.innerHTML = x.map((_) => `
        <button type="button" class="klavity-remail-person" role="option" data-email="${Me(_.email)}">
          <span class="klavity-remail-av" style="background:${Me($p(_.email))}">${Me(Pp(_))}</span>
          <span class="klavity-remail-who">${_.name ? `${Me(_.name)} <i>(${Me(_.email)})</i>` : Me(_.email)}</span>
        </button>`).join(""), so.querySelectorAll(".klavity-remail-person").forEach((_) => {
      _.addEventListener("click", () => {
        var I;
        ye.value = _.getAttribute("data-email") || "", Bt = !1, Gr = "", pr = ye.value.trim().toLowerCase(), (I = t.onRememberEmail) == null || I.call(t, pr), fr(), ot();
      });
    }));
    const R = ye.parentElement;
    R && R.classList.contains("klavity-remail-wrap") && R.classList.toggle("is-open", !!(x.length || E)), ye.setAttribute("aria-expanded", x.length || E ? "true" : "false"), hr && (hr.hidden = !E), $a && ($a.hidden = !E), _r.hidden = !(x.length || E), za && (za.textContent = g), Da && (Da.hidden = !Bt), hr == null || hr.setAttribute("aria-selected", Bt ? "true" : "false");
  }
  hr == null || hr.addEventListener("click", () => {
    var k;
    const g = (ye == null ? void 0 : ye.value.trim()) || "";
    Ua(g) && (Bt = !Bt, Gr = Bt ? g.toLowerCase() : "", pr = Bt ? g.toLowerCase() : "", pr && ((k = t.onRememberEmail) == null || k.call(t, pr)), fr(), ot());
  });
  function zp() {
    if (!ye || t.requireEmail) return;
    const g = ye.value.trim();
    g && g.toLowerCase() !== pr && (ye.value = "", Bt = !1, Gr = "", pr = "", fr(), ot());
  }
  function qa() {
    setTimeout(() => {
      var C;
      const k = le.getRootNode().activeElement;
      k === ye || _r && k && _r.contains(k) || (Sn = !1, ye && !ye.value.trim() && ((C = t.onRememberEmail) == null || C.call(t, "")), zp(), fr());
    }, 0);
  }
  ye == null || ye.addEventListener("blur", qa), _r == null || _r.addEventListener("focusout", qa);
  let co = null;
  if (ye == null || ye.addEventListener("focus", () => {
    Sn = !0, fr(), lo || Ba("");
  }), ye == null || ye.addEventListener("input", () => {
    Sn = !0, fr();
    const g = ye.value.trim().toLowerCase();
    g !== ao && (co && clearTimeout(co), co = setTimeout(() => {
      Ba(g);
    }, 180));
  }), fr(), t.onEnhance) {
    const g = t.onEnhance, k = le.querySelector("#klavity-enhance"), x = le.querySelector("#klavity-enhance-undo"), C = le.querySelector("#klavity-enhance-regen"), E = le.querySelector("#klavity-enhance-spin");
    let R = 0, _ = null;
    const I = () => c[Se] || c[0] || "", L = () => {
      const F = I();
      if (!F) return "";
      const B = Se >= 0 && Se < c.length ? Se : 0, K = re[B] ?? (B === 0 ? re[0] : null);
      if (!K || !Array.isArray(K.shapes) || !K.shapes.length) return F;
      const J = s.getElementById("klavity-hero-stage"), ne = J == null ? void 0 : J.querySelector("canvas");
      if (ne && Se === B && ne.width > 1 && ne.height > 1)
        try {
          const X = ne.toDataURL("image/png");
          if (X && X.length > 64) return X;
        } catch {
        }
      return null;
    }, $ = async () => {
      if (It) return;
      const F = Y.value.trim();
      _ = Y.value;
      const B = ++R;
      k && (k.disabled = !0), E && (E.hidden = !1);
      try {
        const K = ce ? { selector: ce.selector, text: ce.text } : null, J = Se >= 0 && Se < c.length ? Se : 0, ne = re[J] ?? (J === 0 ? re[0] : null), X = pm(ne == null ? void 0 : ne.shapes), V = I();
        let he = L();
        he === null && (he = await hm(V, ne.shapes, ne.w, ne.h));
        const je = await g(F, {
          images: c.length,
          shot: he,
          annotations: ne,
          annotationTexts: X,
          picked: K
        });
        if (B !== R || !je) return;
        Y.value = Ku(je), Y.dispatchEvent(new Event("input", { bubbles: !0 })), We = je.suggestedSeverity || null, ve = je.suggestedPriority || null, Y.classList.add("kl-just-enhanced"), setTimeout(() => Y.classList.remove("kl-just-enhanced"), 700), x && (x.hidden = !1), C && (C.hidden = !1), ot();
      } catch {
      } finally {
        B === R && (k && (k.disabled = !1), E && (E.hidden = !0));
      }
    };
    k == null || k.addEventListener("click", () => {
      $();
    }), C == null || C.addEventListener("click", () => {
      $();
    }), x == null || x.addEventListener("click", () => {
      _ !== null && (Y.value = _, Y.dispatchEvent(new Event("input", { bubbles: !0 })), ot()), _ = null, We = null, ve = null, x && (x.hidden = !0), C && (C.hidden = !0);
    });
  }
  if (t.onCheckKnown) {
    const g = le.querySelector("#klavity-known"), k = t.onCheckKnown;
    let x = null, C = 0, E = "";
    const R = () => {
      g && (g.hidden = !0, g.textContent = "");
    }, _ = (L) => {
      var F;
      if (!g) return;
      const $ = L.headline ? Me(L.headline) : "Already reported";
      g.innerHTML = `<span class="kl-known-ic">${Z("check-circle", { size: 15 })}</span><div class="kl-known-body"><span class="kl-known-title">${$}</span> — status: <span class="kl-known-status">${Me(L.statusLabel)}</span>. We're already tracking "${Me(L.title)}". Add your note and submit anyway — it'll be linked.</div><button type="button" class="kl-known-dismiss" id="klavity-known-dismiss">Dismiss</button>`, g.hidden = !1, (F = g.querySelector("#klavity-known-dismiss")) == null || F.addEventListener("click", () => {
        E = Y.value.trim(), R();
      });
    }, I = async () => {
      const L = Y.value.trim();
      if (L.length < 12 || L === E) {
        R();
        return;
      }
      const $ = ++C;
      try {
        const F = await k(L);
        if ($ !== C) return;
        if (Y.value.trim() === E) {
          R();
          return;
        }
        F ? _(F) : R();
      } catch {
      }
    };
    Y.addEventListener("input", () => {
      Y.value.trim() !== E && (E = ""), x && clearTimeout(x), x = setTimeout(I, 500);
    });
  }
  if (n.reportClarity) {
    const g = le.querySelector("#klavity-clarity"), k = le.querySelector("#klavity-clarity-status"), x = {
      problem: le.querySelector("#klavity-clarity-problem"),
      expected: le.querySelector("#klavity-clarity-expected"),
      repro: le.querySelector("#klavity-clarity-repro")
    }, C = le.querySelector("#klavity-clarity-tip"), E = le.querySelector("#klavity-clarity-tip-text"), R = le.querySelector("#klavity-nudge"), _ = t.onClarityTip, I = /* @__PURE__ */ new Map();
    let L = null, $ = 0;
    const F = (X, V, he) => {
      if (!X) return;
      X.classList.toggle("done", V);
      const je = X.querySelector(".kl-clr-mark");
      je && (je.innerHTML = V ? Z("check", { size: 12 }) : "○"), X.setAttribute("aria-label", (V ? "covered: " : "missing: ") + he);
    }, B = () => {
      C && (C.hidden = !0);
    }, K = (X) => {
      !C || !E || Hm(X) || (E.innerHTML = Me(X) + '<span class="kl-clr-aitag">AI</span>', C.hidden = !1);
    }, J = () => {
      const X = Y.value, V = Hu(X);
      g && (g.hidden = X.trim().length === 0, g.classList.remove("l1", "l2", "l3"), g.classList.add(V.level === "great" ? "l3" : V.level === "good" ? "l2" : "l1")), k && (k.textContent = V.label), F(x.problem, V.coverage.problem, "What's broken"), F(x.expected, V.coverage.expected, "What you expected"), F(x.repro, V.coverage.repro, "How to reproduce"), R && !R.hidden && (R.hidden = !0), V.level === "great" && B();
    }, ne = () => {
      !_ || !C || (L && clearTimeout(L), L = setTimeout(async () => {
        const X = Y.value.trim();
        if (!Wm(X)) {
          B();
          return;
        }
        if (I.has(X)) {
          K(I.get(X));
          return;
        }
        const V = ++$;
        try {
          const he = await _(X, { images: c.length });
          if (V !== $ || Y.value.trim() !== X) return;
          he && he.tip && (I.set(X, he.tip), K(he.tip));
        } catch {
        }
      }, 1e3));
    };
    Y.addEventListener("input", () => {
      J(), ne();
    }), J(), (Ja = le.querySelector("#klavity-nudge-add")) == null || Ja.addEventListener("click", () => {
      R && (R.hidden = !0);
      try {
        Y.focus();
      } catch {
      }
    }), (Za = le.querySelector("#klavity-nudge-anyway")) == null || Za.addEventListener("click", () => {
      R && (R.hidden = !0), Ar.click();
    });
  }
  Mr.addEventListener("click", (g) => {
    g.target === Mr && oo();
  }), (Qa = le.querySelector("#klavity-x")) == null || Qa.addEventListener("click", () => oo()), (el = le.querySelector("#klavity-min")) == null || el.addEventListener("click", () => {
    var g;
    try {
      (g = t.onMinimize) == null || g.call(t);
    } catch {
    }
  });
  const Wa = () => Array.from(le.querySelectorAll(".klavity-actions button:not(#klavity-voice)"));
  let It = !1;
  const lt = (g) => {
    It = g, Wa().forEach((x) => {
      x.disabled = g;
    }), Y.disabled = g;
    const k = le.querySelector("#klavity-voice");
    k && (k.disabled = g), le.querySelectorAll(".kl-htool,.kl-htbtn,.kl-hopt,.kl-hcolor").forEach((x) => {
      x.disabled = g;
    }), s.querySelectorAll("#klavity-title,#klavity-remail,.kl-type-chip,.klavity-toggle button,#klavity-mask-numbers,.kl-file-rm,.klavity-rm,.klavity-mk,.klavity-retake").forEach((x) => {
      x.disabled = g;
    }), g ? (Rr == null || Rr(), Ar.disabled = !0) : (ot(), Vn());
  }, er = (g) => {
    Wa().forEach((k) => {
      k.classList.remove("kl-active"), k.removeAttribute("aria-pressed");
    }), g && (g.classList.add("kl-active"), g.setAttribute("aria-pressed", "true"));
  }, lr = le.querySelector("#klavity-voice");
  if (lr) {
    const x = lr.querySelector(".kl-vring-prog");
    let C = 0, E = 0, R = !1, _, I = "";
    const L = () => {
      E = Date.now();
      const me = () => {
        const ze = Date.now() - E, Ne = Math.min(ze / 18e4, 1);
        if (x == null || x.setAttribute("stroke-dashoffset", String(Ne * 81.68)), ze >= 165e3 && lr.classList.add("kl-voice-warn"), ze >= 18e4) {
          _.stop();
          return;
        }
        C = requestAnimationFrame(me);
      };
      C = requestAnimationFrame(me);
    }, $ = () => {
      cancelAnimationFrame(C), x == null || x.setAttribute("stroke-dashoffset", String(81.68)), lr.classList.remove("kl-voice-warn");
    }, F = le.querySelector("#klavity-voice-status");
    let B = null;
    const K = () => {
      B && (clearTimeout(B), B = null), F && (F.hidden = !0, F.textContent = "", F.classList.remove("kl-vs-info", "kl-vs-err"));
    }, J = (me, ze, Ne) => {
      !F || !ze || (B && (clearTimeout(B), B = null), F.classList.remove("kl-vs-info", "kl-vs-err"), F.classList.add(me === "err" ? "kl-vs-err" : "kl-vs-info"), F.textContent = ze, F.hidden = !1, Ne && (B = setTimeout(K, Ne)));
    }, ne = "Recording — tap to stop", X = () => {
      F && F.classList.contains("kl-vs-info") && K();
    }, V = (me) => {
      lr.classList.toggle("kl-voice-rec", me), lr.setAttribute("aria-pressed", me ? "true" : "false"), lr.setAttribute("aria-label", me ? "Stop recording" : "Voice dictation"), lr.title = me ? ne : "Voice dictation";
    }, he = (me) => {
      let ze = "";
      me.onTranscript = (Ne) => {
        ze = "", I = ai(I, Ne), Y.value = I;
        try {
          Y.scrollTop = Y.scrollHeight;
        } catch {
        }
        try {
          Y.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        ot();
      }, me.onInterim = (Ne) => {
        ze = Ne || "";
        const Q = I.length > 0 && !/\s$/.test(I) ? " " : "";
        Y.value = I + (Ne ? Q + Ne : "");
        try {
          Y.scrollTop = Y.scrollHeight;
        } catch {
        }
        try {
          Y.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        ot();
      }, me.onStatus = (Ne, Q) => {
        Ne === "idle" ? X() : J("info", Q);
      }, me.onError = (Ne, Q) => {
        Q && J("err", Q, 4e3);
      }, me.onStop = () => {
        ze && (I = ai(I, ze), ze = ""), I && (I = Ml(I), Y.value = I);
        try {
          Y.scrollTop = Y.scrollHeight;
        } catch {
        }
        try {
          Y.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        R = !1, V(!1), $(), X(), ot();
      };
    }, je = () => {
      const me = new In();
      return he(me), me;
    }, Ze = () => {
      if (!R) {
        V(!1), $(), X();
        return;
      }
      In.isSupported() ? (I = Y.value, _ = je(), J("info", "Reconnecting dictation…"), _.start()) : (R = !1, V(!1), $(), J("err", "Voice dictation is unavailable right now", 4e3));
    }, ft = () => {
      if (!(Te === "server" && t.onDictate)) return null;
      const me = new Ci({ transcribe: (ze) => t.onDictate(ze) });
      return he(me), me.onUnavailable = Ze, me;
    }, gr = (me) => {
      const ze = () => I.length > 0 && !/\s$/.test(I) ? " " : "";
      let Ne = "";
      me.onTranscript = (Q) => {
        Ne = "", I = ai(I, Q), Y.value = I;
        try {
          Y.scrollTop = Y.scrollHeight;
        } catch {
        }
        try {
          Y.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        ot();
      }, me.onInterim = (Q) => {
        Ne = Q || "", Y.value = I + ze() + Q;
        try {
          Y.scrollTop = Y.scrollHeight;
        } catch {
        }
        try {
          Y.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        ot();
      }, me.onStatus = (Q, de) => {
        Q === "idle" ? X() : J("info", de);
      }, me.onError = (Q, de) => {
        de && J("err", de, 4e3);
      }, me.onStop = () => {
        Ne && (I = ai(I, Ne), Ne = ""), I && (I = Ml(I)), Y.value = I;
        try {
          Y.scrollTop = Y.scrollHeight;
        } catch {
        }
        try {
          Y.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        R = !1, V(!1), $(), X(), ot();
      }, me.onUnavailable = () => {
        Y.value = I;
        try {
          Y.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        if (!R) {
          V(!1), $(), X();
          return;
        }
        const Q = ft();
        if (Q) {
          _ = Q, J("info", "Reconnecting dictation…"), _.start();
          return;
        }
        Ze();
      };
    }, Ot = () => {
      if (Te === "server" && t.dictationStreamUrl && Mi.isSupported()) {
        const me = new Mi({ url: t.dictationStreamUrl });
        return gr(me), me;
      }
      return ft() ?? je();
    };
    _ = Ot(), lr.addEventListener("click", () => {
      R ? _.stop() : (K(), I = Y.value, _ = Ot(), R = !0, V(!0), _.start(), L());
    }), Rr = () => {
      R && _.stop();
    };
  }
  function ja() {
    var x;
    const g = (ye == null ? void 0 : ye.value.trim()) || "", k = g && (t.requireEmail || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(g)) ? g : void 0;
    return k && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(k) && ((x = t.onRememberEmail) == null || x.call(t, k.toLowerCase())), { email: k, createContact: !!(k && Bt && k.toLowerCase() === Gr) };
  }
  Ar.addEventListener("click", async () => {
    var V;
    if (It || Ar.disabled) return;
    const g = Y.value.trim(), k = le.querySelector("#klavity-title"), x = k ? k.value.trim() : "", C = Ue === "feature" ? "feature" : "bug";
    p && await Promise.race([p, Promise.resolve()]);
    const E = d.slice(), R = Ae(), _ = W.slice(), I = P.slice(), L = Ue, { email: $, createContact: F } = ja();
    lt(!0), Ar.textContent = "Uploading…";
    const B = s.getElementById("klavity-err");
    B.style.display = "none";
    const K = s.getElementById("klavity-progress"), J = s.getElementById("klavity-progress-fill");
    K && J && (K.classList.add("show"), J.style.transition = "none", J.style.width = "8%", J.offsetWidth, J.style.transition = "width 10s cubic-bezier(.05,.7,.2,1)", requestAnimationFrame(() => {
      J.style.width = "90%";
    }));
    const ne = () => {
      J && (J.style.transition = "width .25s ease", J.style.width = "100%");
    }, X = () => {
      K && J && (K.classList.remove("show"), J.style.transition = "none", J.style.width = "0");
    };
    try {
      const he = await Promise.all(E), je = {
        type: C,
        ...se ? { kind: L } : {},
        ...x ? { title: x } : {},
        description: g,
        screenshots: he,
        ..._.length ? { files: _ } : {},
        ...I.length ? { recordings: I } : {},
        annotations: R,
        reporterEmail: $,
        createContact: F,
        // KLA submit-target: ride the reporter's destination choice through onSubmit. Only present when the
        // segmented control was rendered (cfg.submitTargetToggle !== false); default 'project' (never surprise-
        // route to Klavity). The server resolves the real Klavity intake project — the client only says 'klavity'.
        ...n.submitTargetToggle !== !1 ? { feedbackTarget: no } : {},
        // KLA-586: ride the accepted AI-Enhance draft's severity/priority as structured fields (cleared on Undo).
        ...We ? { suggestedSeverity: We } : {},
        ...ve ? { suggestedPriority: ve } : {},
        // #638: only when the toggle was rendered — the reporter's console-logs opt-in (DEFAULT false). Read
        // live from the checkbox so the current state travels; the host attaches console logs only when true.
        ...t.consoleAttachToggle ? { attachConsole: !!((V = s.getElementById("klavity-conlog-cb")) != null && V.checked) } : {}
      };
      if (t.backgroundUpload) {
        t.onSubmit(je), ar({ immediate: !0, reason: "submitted" });
        return;
      }
      const Ze = await t.onSubmit(je);
      if (et) return;
      ne(), t.success ? Yp(Ze.issueKey, Ze.issueUrl, t.success) : Hp(Ze.issueKey, Ze.issueUrl);
    } catch (he) {
      X();
      const je = (he == null ? void 0 : he.message) || "Unknown error";
      try {
        console.error("[Klavity] submit failed:", he);
      } catch {
      }
      B.textContent = n.debug ? `Couldn't submit your report — ${je}` : "Couldn't submit your report. Please check your connection and try again.", B.style.display = "block", Ar.textContent = "Submit", lt(!1);
    }
  });
  function Dp(g, k) {
    var _;
    const { dataUrl: x, quality: C, suggestSharp: E } = tr(k);
    if (!x) return;
    const R = c.indexOf(g);
    if (!(R < 0)) {
      c[R] = x, d[R] = t.compressImage ? t.compressImage(x) : Promise.resolve(x), a[R] = C, h[R] = !!E && C !== "real-pixel", re[R] && delete re[R], delete Le[R], delete it[R], Oe();
      try {
        (_ = t.onShotReplaced) == null || _.call(t, R, x, C);
      } catch {
      }
    }
  }
  async function Fp(g) {
    if (!t.onCaptureViewport) return !1;
    let k = null;
    const x = i ? Or(document.body) : null;
    try {
      const { dataUrl: E } = tr(await t.onCaptureViewport());
      E && (k = E, l = !1, Lt(E, "rendered", void 0, !0, !1), g && er(g));
    } catch {
    } finally {
      x == null || x();
    }
    const C = (async () => {
      const E = i ? Or(document.body) : null;
      try {
        const R = await t.onCaptureFull();
        if (k) Dp(k, R);
        else {
          l = !1;
          const { dataUrl: _, quality: I, suggestSharp: L } = tr(R);
          _ && (Lt(_, I, void 0, !0, !!L), g && er(g));
        }
      } catch {
        l = !1, Oe();
      } finally {
        E == null || E(), p === C && (p = null);
      }
    })();
    return p = C, !0;
  }
  async function Ha(g) {
    if (!t.onCaptureViewport) return !1;
    const k = i ? Or(document.body) : null;
    try {
      const { dataUrl: x, blank: C } = tr(await t.onCaptureViewport());
      C && c.length === 0 ? Zi() : x ? (l = !1, Lt(x, "rendered", void 0, !0, !1)) : (l = !1, Oe());
    } catch {
      l = !1, Oe();
    } finally {
      k == null || k();
    }
    return !0;
  }
  const Lr = le.querySelector("#klavity-full");
  Lr.addEventListener("click", async () => {
    if (!It && !(t.onCaptureSharp && (await uo()).ok)) {
      lt(!0), Lr.classList.add("kl-loading");
      try {
        if (t.onCaptureViewport) {
          await Fp(Lr);
          return;
        }
        const g = i ? Or(document.body) : null;
        try {
          const { dataUrl: k, quality: x, suggestSharp: C } = tr(await t.onCaptureFull());
          Lt(k, x, void 0, !0, !!C), er(Lr);
        } finally {
          g == null || g();
        }
      } catch {
      } finally {
        Lr.classList.remove("kl-loading"), lt(!1);
      }
    }
  });
  async function uo(g) {
    const k = g != null && g.viewport && t.onCaptureSharpViewport ? t.onCaptureSharpViewport : t.onCaptureSharp;
    if (It || !k || !Ie) return { ok: !1, declined: !1 };
    const x = Ie.querySelector(".kl-sharp-label");
    lt(!0), Ie.classList.add("kl-loading"), o.style.display = "none";
    const C = x ?? Ie, E = C.textContent;
    C.textContent = "Capturing…";
    let R = !1, _ = !1;
    try {
      const I = i ? Or(document.body) : null;
      let L;
      try {
        L = await k();
      } finally {
        I == null || I();
      }
      if (L) {
        const { dataUrl: $, quality: F } = tr(L);
        $ && (Lt($, F ?? "real-pixel", void 0, !0, !1, { kind: g != null && g.viewport ? "viewport" : "full" }), er(Ie), R = !0, M = !0);
      }
    } catch (I) {
      if (gg(I)) {
        if (_ = !0, !(g != null && g.onOpen))
          try {
            hp();
          } catch {
          }
      } else
        try {
          console.warn("[Klavity] Screen capture failed; using rendered fallback:", I);
        } catch {
        }
    } finally {
      g != null && g.onOpen && _ || (o.style.display = "", C.textContent = E, Ie.classList.remove("kl-loading"), lt(!1));
    }
    return { ok: R, declined: _ };
  }
  Ie && t.onCaptureSharp && Ie.addEventListener("click", () => {
    uo();
  });
  const Ya = le.querySelector("#klavity-file"), Va = le.querySelector("#klavity-upload");
  Va.addEventListener("click", () => {
    if (!It) {
      if (!w && c.length >= b) {
        Ut(`You can attach up to ${b} images.`);
        return;
      }
      Ya.click();
    }
  }), Ya.addEventListener("change", async (g) => {
    const k = g.target, x = k.files ? Array.from(k.files) : [];
    if (k.value = "", !x.length) return;
    const C = c.length, E = W.length;
    w ? await vp(x) : await eo(x), (c.length > C || W.length > E) && er(Va);
  });
  const Cn = s.getElementById("klavity-record");
  Cn && t.onRecord && Cn.addEventListener("click", async () => {
    if (It) return;
    if (P.length >= Ve) {
      Ut(`You can attach up to ${Ve} recordings.`);
      return;
    }
    lt(!0), Cn.classList.add("kl-loading");
    const g = (k) => {
      o.style.display = k === "recording" ? "none" : "";
    };
    try {
      const k = await t.onRecord(g);
      if (k) {
        const x = P.findIndex((C) => C.id && k.id && C.id === k.id || C.dataUrl && k.dataUrl && C.dataUrl === k.dataUrl);
        x >= 0 ? (P[x] = k, oe = x) : (P.push(k), oe = P.length - 1), G = null, Vr(), er(Cn);
      }
    } catch {
    } finally {
      o.style.display = "", Cn.classList.remove("kl-loading"), lt(!1);
    }
  }), Fe && (Qt(), (tl = s.getElementById("klavity-multi-start")) == null || tl.addEventListener("click", () => {
    xp();
  }));
  const po = s.getElementById("klavity-region");
  po && t.onRegionCapture && (po.onclick = () => {
    It || (lt(!0), document.removeEventListener("keydown", Tr, { capture: !0 }), o.style.display = "none", Cg(async (g) => {
      document.addEventListener("keydown", Tr, { capture: !0 });
      try {
        const k = i ? Or(document.body) : null;
        let x;
        try {
          x = await t.onRegionCapture(g);
        } finally {
          k == null || k();
        }
        if (x) {
          const { dataUrl: C, quality: E, suggestSharp: R } = tr(x);
          C && (Lt(C, E, void 0, !0, !!R, { kind: "region", rect: g }), er(po));
        }
      } finally {
        o.style.display = "", lt(!1);
      }
    }, () => {
      document.addEventListener("keydown", Tr, { capture: !0 }), o.style.display = "", lt(!1);
    }));
  });
  const Kr = s.getElementById("klavity-pick"), Xr = s.getElementById("klavity-pickinfo"), Ga = () => {
    var x;
    if (Kr && (Kr.classList.toggle("kl-active", !!ce), ce ? Kr.setAttribute("aria-pressed", "true") : Kr.removeAttribute("aria-pressed")), !Xr) return;
    if (!ce) {
      Xr.hidden = !0, Xr.innerHTML = "";
      return;
    }
    Xr.hidden = !1;
    const { text: g } = ce, k = g ? `: <span class="kl-pick-txt">${Me(g)}</span>` : "";
    Xr.innerHTML = `<span class="kl-pick-ic">${Z("mouse-pointer-2", { size: 13 })}</span><span>Element pinned${k}</span><button type="button" class="kl-pick-clear" id="klavity-pick-clear">Clear</button>`, (x = Xr.querySelector("#klavity-pick-clear")) == null || x.addEventListener("click", () => {
      ce = null, Ga();
    });
  };
  Kr && t.onPickElement && (Kr.onclick = async () => {
    if (!It) {
      lt(!0), document.removeEventListener("keydown", Tr, { capture: !0 }), o.style.display = "none";
      try {
        const g = await t.onPickElement();
        g && (ce = g, Ga(), g.shot && Lt(g.shot, g.shotQuality, void 0, !0, !1, { kind: "element", selector: g.selector, rect: g.rect }));
      } catch {
      } finally {
        document.addEventListener("keydown", Tr, { capture: !0 }), o.style.display = "", lt(!1);
      }
    }
  });
  function qt(g, k = 15) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${k}" height="${k}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em">${g}</svg>`;
  }
  function Up(g) {
    const k = (R, _, I, L) => `<button type="button" class="kl-htool" data-tool="${R}" title="${_} (${L.toUpperCase()})" aria-label="${_}">${I}<span class="kl-hk">${L.toUpperCase()}</span></button>`, x = (R) => {
      const _ = R.replace("#", "");
      if (!/^[0-9a-fA-F]{6}$/.test(_)) return !1;
      const I = parseInt(_.slice(0, 2), 16), L = parseInt(_.slice(2, 4), 16), $ = parseInt(_.slice(4, 6), 16);
      return (0.2126 * I + 0.7152 * L + 0.0722 * $) / 255 > 0.7;
    }, C = (R) => `<button type="button" class="kl-hcolor${x(R) ? " kl-hcolor-light" : ""}" data-color="${R}" style="background:${R}" title="${R}" aria-label="Colour ${R}"></button>`;
    return (
      // Klavity logo, TOP-LEFT of the editor toolbar. It links to the homepage (UTM-stamped so clicks are
      // attributable to WHICH project/site) — the href is assigned in JS (never innerHTML) per this file's
      // XSS guards. See heroLogoHref + the #kl-hero-logo wiring in mountHeroAnnotator.
      '<a class="kl-hlogo" id="kl-hero-logo" target="_blank" rel="noopener" title="Powered by Klavity — visit klavity.in" aria-label="Klavity homepage (opens in a new tab)"><svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g fill="#818cf8"><circle cx="15" cy="9" r="2"/><circle cx="11" cy="16" r="2"/><circle cx="10" cy="24" r="2"/><circle cx="11" cy="32" r="2"/><circle cx="15" cy="39" r="2"/><circle cx="33" cy="9" r="2"/><circle cx="37" cy="16" r="2"/><circle cx="38" cy="24" r="2"/><circle cx="37" cy="32" r="2"/><circle cx="33" cy="39" r="2"/></g><g stroke="#818cf8" stroke-width="1.6" stroke-linecap="round" opacity="0.4"><line x1="15" y1="9" x2="33" y2="9"/><line x1="11" y1="16" x2="37" y2="16"/><line x1="10" y1="24" x2="38" y2="24"/><line x1="11" y1="32" x2="37" y2="32"/><line x1="15" y1="39" x2="33" y2="39"/></g></svg><span class="kl-hlogo-word">Klavity</span></a><span class="kl-hsep"></span>' + k("pen", "Pen", Z("pencil", { size: 15 }), "p") + k("line", "Line", qt('<line x1="5" y1="19" x2="19" y2="5"/>'), "l") + k("rect", "Rectangle", Z("square", { size: 15 }), "r") + k("circle", "Circle", qt('<circle cx="12" cy="12" r="9"/>'), "o") + k("arrow", "Arrow", qt('<line x1="5" y1="19" x2="19" y2="5"/><polyline points="10 5 19 5 19 14"/>'), "a") + k("text", "Text", qt('<path d="M5 6h14M12 6v13M9 19h6"/>'), "t") + k("count", "Numbers", qt('<circle cx="12" cy="12" r="9"/><text x="12" y="16" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor" stroke="none">1</text>'), "c") + `<span class="kl-hsep"></span><label class="kl-hmask" title="Mask numbers in new screen captures"><input type="checkbox" class="kl-hmask-cb"${i ? " checked" : ""}>${Z("eye-off", { size: 13 })}<span>Mask numbers</span></label>` + k("pixelate", "Redact (pixelate)", qt('<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>'), "b") + k("crop", "Crop", qt('<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>'), "k") + '<span class="kl-hsep"></span><span class="kl-hcolors">' + C("#ef4444") + C("#f97316") + C("#16a34a") + C("#3b82f6") + C("#ffffff") + C("#111827") + // Custom colour picker — a rainbow swatch that opens a native <input type="color">. The chosen colour
      // becomes the active colour and shows as the selected swatch. Input is visually hidden but focusable
      // via the button (kept inside the shadow root so its styling stays scoped).
      `<span class="kl-hcolor-cwrap"><button type="button" class="kl-hcolor kl-hcolor-custom" title="Custom colour" aria-label="Choose a custom colour"></button><input type="color" class="kl-hcolor-input" value="#ef4444" aria-label="Custom colour value" tabindex="-1"></span></span><span class="kl-hsep"></span><span class="kl-hgroup"><span class="kl-hlabel">Stroke</span><button type="button" class="kl-hopt" data-stroke="0.6" title="Thin stroke" aria-label="Thin stroke">S</button><button type="button" class="kl-hopt kl-on" data-stroke="1" title="Medium stroke" aria-label="Medium stroke">M</button><button type="button" class="kl-hopt" data-stroke="1.8" title="Thick stroke" aria-label="Thick stroke">L</button><button type="button" class="kl-hopt" data-stroke="2.8" title="Extra-thick stroke" aria-label="Extra-thick stroke">XL</button></span><span class="kl-htextopts" id="kl-hero-textopts" hidden><span class="kl-hsep"></span><span class="kl-hlabel">Outline</span><button type="button" class="kl-hopt kl-on" data-outline="black" title="Black outline"><span class="kl-osq" style="background:#111"></span></button><button type="button" class="kl-hopt" data-outline="white" title="White outline"><span class="kl-osq" style="background:#fff;border:1px solid #999"></span></button><button type="button" class="kl-hopt" data-outline="none" title="No outline">None</button><span class="kl-hlabel">Size</span><button type="button" class="kl-hopt" data-size="18" title="Small">S</button><button type="button" class="kl-hopt kl-on" data-size="26" title="Medium">M</button><button type="button" class="kl-hopt" data-size="40" title="Large">L</button></span><span class="kl-hsep"></span><button type="button" class="kl-htbtn" id="kl-hero-undo" title="Undo (Cmd+Z / Ctrl+Z)" aria-label="Undo">${qt('<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>', 14)}</button>` + // #449: explicit "Revert crop" — shown only after a crop on this image (visibility driven by the
      // per-image crop stack). Reverts the most recent crop to its pre-crop image + original markup.
      (g ? `<button type="button" class="kl-htbtn kl-hrevert" id="kl-hero-revert" title="Revert crop to original" aria-label="Revert crop">${qt('<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 5 5v2"/>', 14)}<span class="kl-hk kl-hrevert-lbl">Revert</span></button>` : "") + `<button type="button" class="kl-htbtn" id="kl-hero-clear" title="Clear" aria-label="Clear">${Z("trash-2", { size: 14 })}</button><span class="kl-hgrow"></span><span class="kl-hgroup kl-hzoom"><button type="button" class="kl-htbtn" id="kl-hero-zoomout" title="Zoom out (Z toggles fit / 2×)" aria-label="Zoom out">${qt('<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16" y2="16"/><line x1="8" y1="11" x2="14" y2="11"/>', 14)}</button><button type="button" class="kl-htbtn" id="kl-hero-zoomin" title="Zoom in (Z toggles fit / 2×)" aria-label="Zoom in">${qt('<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16" y2="16"/><line x1="8" y1="11" x2="14" y2="11"/><line x1="11" y1="8" x2="11" y2="14"/>', 14)}</button></span>`
    );
  }
  function Mn() {
    ge && (document.removeEventListener("keydown", ge, { capture: !0 }), ge = null);
  }
  function ho() {
    const g = s.getElementById("klavity-hero-stage"), k = s.getElementById("klavity-hero-tools");
    k && (k.innerHTML = ""), g && (g.innerHTML = `<div class="kl-hero-empty" id="klavity-hero-empty"><span class="kl-hero-empty-ic">${Z("image", { size: 34 })}</span><span id="klavity-hero-empty-txt">${Me(mp())}</span></div>`), Mn();
  }
  function Ka() {
    if (G != null && !(W[G] && en(W[G]) === "video") && (G = null), oe != null && !P[oe] && (oe = null), oe != null) {
      Xa(P[oe].dataUrl);
      return;
    }
    if (G != null) {
      Xa(W[G] ? Ke(W[G]) : void 0);
      return;
    }
    if (c.length === 0) {
      Se = 0, ho();
      return;
    }
    Se >= c.length && (Se = c.length - 1), Se < 0 && (Se = 0), Wp(Se);
  }
  let mr = null;
  function Xa(g) {
    const k = s.getElementById("klavity-hero-stage"), x = s.getElementById("klavity-hero-tools");
    if (!k || !g) {
      ho();
      return;
    }
    if (Mn(), x && (x.innerHTML = ""), k.innerHTML = "", mr) {
      try {
        URL.revokeObjectURL(mr);
      } catch {
      }
      mr = null;
    }
    let C = g;
    const E = oe != null && P[oe] ? P[oe] : null;
    if (E && E.blob instanceof Blob && typeof URL < "u" && typeof URL.createObjectURL == "function")
      try {
        C = URL.createObjectURL(E.blob), mr = C;
      } catch {
      }
    else if (g.startsWith("data:") && typeof URL < "u" && typeof URL.createObjectURL == "function")
      try {
        const $ = g.split(",");
        if ($.length >= 2) {
          const F = $[0].match(/:(.*?);/), B = (F ? F[1] : "video/webm").split(";")[0], K = atob($[1]);
          let J = K.length;
          const ne = new Uint8Array(J);
          for (; J--; )
            ne[J] = K.charCodeAt(J);
          const X = new Blob([ne], { type: B });
          C = URL.createObjectURL(X), mr = C;
        }
      } catch {
      }
    const R = document.createElement("div");
    R.className = "kl-hero-vwrap", R.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;max-width:100%;max-height:100%;";
    const _ = document.createElement("video");
    _.src = C, _.controls = !0, _.setAttribute("playsinline", ""), _.preload = "metadata", _.className = "kl-hero-video", _.style.cssText = "display:block;max-width:100%;max-height:100%;border-radius:8px;background:#000;box-shadow:0 12px 40px rgba(0,0,0,.5);";
    const I = document.createElement("div");
    I.className = "kl-hero-verror", I.style.cssText = "display:none;flex-direction:column;align-items:center;gap:6px;color:#fff;font-size:13px;text-align:center;";
    const L = document.createElement("a");
    L.href = C || g, L.setAttribute("download", "recording.webm"), L.setAttribute("target", "_blank"), L.setAttribute("rel", "noopener"), L.textContent = "Download recording", L.style.cssText = "color:#a5b4fc;font-size:12px;text-decoration:underline;", I.innerHTML = "<span>This recording couldn’t play here.</span>", I.appendChild(L), R.appendChild(_), R.appendChild(I), k.appendChild(R), Bp(_, I);
  }
  function Bp(g, k) {
    let x = !1, C = null;
    g.addEventListener("loadedmetadata", () => {
      if (!isFinite(g.duration) || isNaN(g.duration) || g.duration <= 0) {
        x = !0;
        try {
          g.currentTime = 1e101;
        } catch {
        }
        C = setTimeout(() => {
          if (x) {
            x = !1;
            try {
              g.currentTime = 0;
            } catch {
            }
          }
        }, 400);
      }
    }), g.addEventListener("durationchange", () => {
      if (x && isFinite(g.duration) && g.duration > 0) {
        x = !1, C && clearTimeout(C);
        try {
          g.currentTime = 0;
        } catch {
        }
      }
    }), g.addEventListener("error", () => {
      if (x) {
        x = !1, C && clearTimeout(C);
        try {
          g.currentTime = 0, g.style.display = "block", k && (k.style.display = "none");
          return;
        } catch {
        }
      }
      try {
        g.style.display = "none";
      } catch {
      }
      k && (k.style.display = "flex");
    });
  }
  function qp(g, k, x, C, E) {
    const R = c[g];
    if (!R) return;
    const _ = new Image();
    _.onload = () => {
      var J, ne;
      if (c[g] !== R) return;
      const I = document.createElement("canvas");
      I.width = Math.max(1, Math.round(C)), I.height = Math.max(1, Math.round(E));
      const L = I.getContext("2d");
      if (!L) return;
      L.drawImage(_, k, x, C, E, 0, 0, I.width, I.height);
      let $;
      try {
        $ = I.toDataURL("image/png");
      } catch {
        return;
      }
      const F = ((J = Le[g]) == null ? void 0 : J.length) ?? 0, B = jr(g);
      c[g] = $, d[g] = t.compressImage ? t.compressImage($) : Promise.resolve($);
      const K = (ne = re[g]) == null ? void 0 : ne.shapes;
      Array.isArray(K) && K.length ? re[g] = { w: I.width, h: I.height, shapes: lg(K, -k, -x) } : delete re[g], (Le[g] ?? (Le[g] = [])).push(B), (it[g] ?? (it[g] = [])).push({ snap: B, mark: F }), Zt(g), Oe();
    }, _.src = R;
  }
  function Wp(g) {
    var L, $, F, B, K, J, ne;
    const k = s.getElementById("klavity-hero-stage"), x = s.getElementById("klavity-hero-tools");
    if (!k || !x) return;
    const C = c[g];
    if (!C) {
      ho();
      return;
    }
    Mn(), k.innerHTML = "";
    const E = document.createElement("canvas");
    E.width = 1, E.height = 1, E.style.cssText = "display:block;max-width:100%;max-height:100%;object-fit:contain;cursor:crosshair;touch-action:none;background:#fff;border-radius:8px;box-shadow:0 12px 40px rgba(0,0,0,.5);";
    const R = new zs(E, C), _ = (L = re[g]) == null ? void 0 : L.shapes;
    Array.isArray(_) && _.forEach((X) => R.shapes.push({ ...X })), k.appendChild(E);
    const I = new Image();
    I.onload = () => {
      !document.body.contains(o) || Se !== g || c[g] !== C || (E.width = I.naturalWidth || 1, E.height = I.naturalHeight || 1, R.redraw());
    }, I.src = C, R.redraw();
    {
      x.innerHTML = Up(((($ = it[g]) == null ? void 0 : $.length) ?? 0) > 0);
      const X = x.querySelector("#kl-hero-logo");
      X && (X.href = sg(n.projectId));
      let V = "pen", he = "#ef4444", je = 26, Ze = "black", ft = null;
      const gr = x.querySelector("#kl-hero-textopts"), Ot = () => {
        R.shapes.length ? re[g] = { w: E.width, h: E.height, shapes: R.shapes.map((D) => ({ ...D })) } : delete re[g], Zt(g);
      }, me = (D) => {
        V = D, x.querySelectorAll("[data-tool]").forEach((q) => q.classList.toggle("kl-on", q.dataset.tool === D)), gr && (gr.hidden = D !== "text");
      }, ze = x.querySelector(".kl-hcolor-custom"), Ne = x.querySelector(".kl-hcolor-input"), Q = (D, q) => {
        he = D, x.querySelectorAll("[data-color]").forEach((ie) => ie.classList.toggle("kl-on", ie === q)), ze && ze.classList.toggle("kl-on", ze === q);
      };
      if (x.querySelectorAll("[data-tool]").forEach((D) => D.addEventListener("click", () => me(D.dataset.tool))), x.querySelectorAll("[data-color]").forEach((D) => D.addEventListener("click", () => Q(D.dataset.color, D))), ze && Ne) {
        ze.addEventListener("click", () => Ne.click());
        const D = () => {
          ze.style.background = Ne.value, Q(Ne.value, ze);
        };
        Ne.addEventListener("input", D), Ne.addEventListener("change", D);
      }
      const de = x.querySelector(".kl-hmask-cb");
      de && de.addEventListener("change", () => {
        i = de.checked;
      }), x.querySelectorAll("[data-outline]").forEach((D) => D.addEventListener("click", () => {
        Ze = D.dataset.outline, x.querySelectorAll("[data-outline]").forEach((q) => q.classList.toggle("kl-on", q === D));
      })), x.querySelectorAll("[data-size]").forEach((D) => D.addEventListener("click", () => {
        je = Number(D.dataset.size), x.querySelectorAll("[data-size]").forEach((q) => q.classList.toggle("kl-on", q === D));
      })), x.querySelectorAll("[data-stroke]").forEach((D) => D.addEventListener("click", () => {
        R.strokeScale = Number(D.dataset.stroke) || 1, x.querySelectorAll("[data-stroke]").forEach((q) => q.classList.toggle("kl-on", q === D)), R.redraw();
      })), (F = x.querySelector("#kl-hero-undo")) == null || F.addEventListener("click", () => {
        xa(g);
      }), (B = x.querySelector("#kl-hero-revert")) == null || B.addEventListener("click", () => {
        pp(g);
      }), (K = x.querySelector("#kl-hero-clear")) == null || K.addEventListener("click", () => {
        Hr(g), R.clearAll(), Ot();
      }), me(V), Q(he, x.querySelector("[data-color]"));
      const De = (D) => {
        const q = E.getBoundingClientRect(), ie = Math.min(q.width / E.width, q.height / E.height) || 1, te = E.width * ie, ae = E.height * ie, Ge = (q.width - te) / 2, mt = (q.height - ae) / 2;
        return { x: (D.clientX - q.left - Ge) / ie, y: (D.clientY - q.top - mt) / ie };
      }, Jn = () => {
        const D = E.getBoundingClientRect();
        return Math.min(D.width / E.width, D.height / E.height) || 1;
      }, Vp = (D, q, ie, te, ae, Ge) => D === "line" ? { type: "line", color: Ge, x1: q, y1: ie, x2: te, y2: ae } : D === "arrow" ? { type: "arrow", color: Ge, x1: q, y1: ie, x2: te, y2: ae } : D === "rect" ? { type: "rect", color: Ge, x: Math.min(q, te), y: Math.min(ie, ae), w: Math.abs(te - q), h: Math.abs(ae - ie) } : D === "circle" ? { type: "circle", color: Ge, x: (q + te) / 2, y: (ie + ae) / 2, rx: Math.abs(te - q) / 2, ry: Math.abs(ae - ie) / 2 } : D === "pixelate" ? { type: "pixelate", x: Math.min(q, te), y: Math.min(ie, ae), w: Math.abs(te - q), h: Math.abs(ae - ie) } : null;
      let ut = 1, yr = 0, br = 0, Zn = null;
      const Gp = (() => {
        try {
          return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
        } catch {
          return !1;
        }
      })(), Qn = tg(Gp), fo = () => {
        if (Zn) return Zn;
        const D = E.style.transform;
        return E.style.transform = "", Zn = E.getBoundingClientRect(), E.style.transform = D, Zn;
      }, st = document.createElement("div");
      st.className = "kl-minimap", st.hidden = !0, st.setAttribute("role", "navigation"), st.setAttribute("aria-label", "Zoom navigator — click or drag to pan the image");
      const Rn = document.createElement("img");
      Rn.className = "kl-minimap-img", Rn.alt = "", Rn.draggable = !1, Rn.src = C;
      const Jr = document.createElement("div");
      Jr.className = "kl-minimap-vp", st.append(Rn, Jr), k.appendChild(st);
      const rl = () => {
        const D = E.width, q = E.height;
        if (ut <= 1 || D < 2 || q < 2) {
          st.hidden = !0;
          return;
        }
        const ie = fo();
        if (!ie) {
          st.hidden = !0;
          return;
        }
        const te = 148, ae = Math.min(te / D, te / q), Ge = Math.max(1, Math.round(D * ae)), mt = Math.max(1, Math.round(q * ae));
        st.style.width = Ge + "px", st.style.height = mt + "px";
        const Wt = k.getBoundingClientRect(), Qr = ng(
          { left: Wt.left, top: Wt.top, right: Wt.right, bottom: Wt.bottom },
          { left: ie.left, top: ie.top, width: ie.width, height: ie.height },
          { panX: yr, panY: br },
          ut,
          D,
          q
        );
        Jr.style.left = Qr.x * ae + "px", Jr.style.top = Qr.y * ae + "px", Jr.style.width = Math.max(3, Qr.w * ae) + "px", Jr.style.height = Math.max(3, Qr.h * ae) + "px", st.hidden = !1;
      }, Tn = () => {
        if (ut === 1) {
          yr = 0, br = 0, E.style.transform = "", E.style.cursor = "crosshair", rl();
          return;
        }
        E.style.transformOrigin = "0 0", E.style.transform = `translate(${yr}px,${br}px) scale(${ut})`, E.style.cursor = "grab", rl();
      }, ei = (D, q, ie) => {
        const te = fo();
        if (!te) return;
        const ae = ut;
        if (ut = Qm(ut * ie), ut === ae) return;
        const Ge = rg(D, q, { left: te.left, top: te.top, width: te.width, height: te.height }, ae, ut, { panX: yr, panY: br });
        yr = Ge.panX, br = Ge.panY, E.style.transition = Qn, Tn();
      }, mo = () => {
        const D = k.getBoundingClientRect();
        return { cx: D.left + D.width / 2, cy: D.top + D.height / 2 };
      }, Kp = () => {
        ut = 1, E.style.transition = Qn, Tn();
      };
      (J = x.querySelector("#kl-hero-zoomin")) == null || J.addEventListener("click", () => {
        const { cx: D, cy: q } = mo();
        ei(D, q, 1.25);
      }), (ne = x.querySelector("#kl-hero-zoomout")) == null || ne.addEventListener("click", () => {
        const { cx: D, cy: q } = mo();
        ei(D, q, 0.8);
      });
      const Xp = (D, q) => {
        const ie = fo();
        if (!ie) return;
        const te = k.getBoundingClientRect(), ae = og(D, q, { left: te.left, top: te.top, right: te.right, bottom: te.bottom }, { left: ie.left, top: ie.top, width: ie.width, height: ie.height }, ut, E.width);
        yr = ae.panX, br = ae.panY, E.style.transition = Qn, Tn();
      };
      let ti = !1;
      const nl = (D, q) => {
        const ie = st.getBoundingClientRect(), { ix: te, iy: ae } = ig(D - ie.left, q - ie.top, ie.width, ie.height, E.width, E.height);
        Xp(te, ae);
      };
      st.addEventListener("pointerdown", (D) => {
        ti = !0;
        try {
          st.setPointerCapture(D.pointerId);
        } catch {
        }
        nl(D.clientX, D.clientY), D.preventDefault(), D.stopPropagation();
      }), st.addEventListener("pointermove", (D) => {
        ti && (nl(D.clientX, D.clientY), D.preventDefault());
      });
      const il = (D) => {
        if (ti) {
          ti = !1;
          try {
            st.releasePointerCapture(D.pointerId);
          } catch {
          }
        }
      };
      st.addEventListener("pointerup", il), st.addEventListener("pointercancel", il), k.addEventListener("wheel", (D) => {
        V !== "crop" && (D.preventDefault(), ei(D.clientX, D.clientY, eg(D.deltaY)));
      }, { passive: !1 }), k.addEventListener("dblclick", () => {
        ut = 1, E.style.transition = Qn, Tn();
      });
      let Jp = R.shapes.reduce((D, q) => q.type === "count" ? Math.max(D, q.n) : D, 0), kr = !1, wt = 0, xt = 0, Ir = [], Zr = !1, ol = 0, sl = 0, al = 0, ll = 0, St = null, An = { x: 0, y: 0 }, dt = null;
      const Zp = () => Math.max(14, R.computeFontSize() * 0.6), cl = (D, q) => {
        for (let ie = R.shapes.length - 1; ie >= 0; ie--) {
          const te = R.shapes[ie];
          if (te.type !== "text") continue;
          const ae = R.textBounds(te);
          if (!ae) continue;
          const Ge = Zp();
          if (D >= ae.x + ae.w - Ge && D <= ae.x + ae.w + Ge && q >= ae.y + ae.h - Ge && q <= ae.y + ae.h + Ge)
            return { shape: te, mode: "resize" };
          const mt = 6;
          if (D >= ae.x - mt && D <= ae.x + ae.w + mt && q >= ae.y - mt && q <= ae.y + ae.h + mt)
            return { shape: te, mode: "move" };
        }
        return null;
      };
      E.addEventListener("pointerdown", (D) => {
        if (D.shiftKey && ut > 1) {
          Zr = !0, ol = D.clientX, sl = D.clientY, al = yr, ll = br, E.style.transition = "none", E.style.cursor = "grabbing";
          try {
            E.setPointerCapture(D.pointerId);
          } catch {
          }
          D.preventDefault();
          return;
        }
        const q = De(D);
        if (wt = q.x, xt = q.y, V === "crop") {
          kr = !0;
          try {
            E.setPointerCapture(D.pointerId);
          } catch {
          }
          An = { x: D.clientX, y: D.clientY }, St = document.createElement("div"), St.style.cssText = "position:absolute;border:2px dashed #6366f1;background:rgba(99,102,241,.14);pointer-events:none;z-index:6;left:0;top:0;width:0;height:0;", k.appendChild(St);
          return;
        }
        if (V === "text") {
          const ie = cl(q.x, q.y);
          if (ie) {
            Hr(g), dt = { shape: ie.shape, mode: ie.mode, grabX: q.x, grabY: q.y, origX: ie.shape.x, origY: ie.shape.y, origSize: ie.shape.size ?? R.computeFontSize() };
            try {
              E.setPointerCapture(D.pointerId);
            } catch {
            }
            E.style.cursor = ie.mode === "resize" ? "nwse-resize" : "move", D.preventDefault();
            return;
          }
          const te = document.createElement("input"), ae = Ze === "none" ? "none" : `0 0 2px ${Ze}, 0 0 2px ${Ze}`, Ge = Jn(), mt = Math.max(6, je * Ge), Wt = je, Qr = Ze;
          te.style.cssText = `position:fixed;left:${D.clientX}px;top:${D.clientY}px;padding:0;margin:0;line-height:1;box-sizing:content-box;background:transparent;border:0;color:${he};font-size:${mt}px;font-family:sans-serif;font-weight:700;text-shadow:${ae};outline:1px dashed ${he};z-index:2147483647;min-width:80px;`, document.body.appendChild(te), ft = te, requestAnimationFrame(() => {
            document.body.contains(te) && te.focus();
          }), te.addEventListener("blur", () => {
            ft = null, te.value.trim() && (Hr(g), R.addShape({ type: "text", color: he, x: wt, y: xt, text: te.value.trim(), size: Wt, outline: Qr }), Ot()), Je(te);
          }, { once: !0 }), te.addEventListener("keydown", (go) => {
            go.key === "Enter" && te.blur(), go.key === "Escape" && (te.value = "", te.blur()), go.stopPropagation();
          });
          return;
        }
        if (V === "count") {
          Hr(g), R.addShape({ type: "count", color: he, x: q.x, y: q.y, n: ++Jp }), Ot();
          return;
        }
        kr = !0;
        try {
          E.setPointerCapture(D.pointerId);
        } catch {
        }
        V === "pen" && (Ir = [q]);
      }), E.addEventListener("pointermove", (D) => {
        if (Zr) {
          E.style.transition = "none", yr = al + (D.clientX - ol), br = ll + (D.clientY - sl), Tn(), E.style.cursor = "grabbing";
          return;
        }
        if (dt) {
          const te = De(D);
          dt.mode === "move" ? (dt.shape.x = dt.origX + (te.x - dt.grabX), dt.shape.y = dt.origY + (te.y - dt.grabY)) : dt.shape.size = Math.max(10, Math.min(240, dt.origSize + (te.y - dt.grabY))), R.redraw();
          return;
        }
        if (V === "text" && !kr) {
          const te = De(D), ae = cl(te.x, te.y);
          E.style.cursor = ae ? ae.mode === "resize" ? "nwse-resize" : "move" : "crosshair";
        }
        if (!kr) return;
        if (V === "pen") {
          Ir.push(De(D)), Ir.length > 1 && R.drawPreview({ type: "pen", color: he, points: Ir });
          return;
        }
        if (V === "crop" && St) {
          const te = k.getBoundingClientRect(), ae = Math.min(An.x, D.clientX), Ge = Math.min(An.y, D.clientY), mt = Math.max(An.x, D.clientX), Wt = Math.max(An.y, D.clientY);
          St.style.left = ae - te.left + "px", St.style.top = Ge - te.top + "px", St.style.width = mt - ae + "px", St.style.height = Wt - Ge + "px";
          return;
        }
        const q = De(D), ie = Vp(V, wt, xt, q.x, q.y, he);
        ie && R.drawPreview(ie);
      }), E.addEventListener("pointerup", (D) => {
        if (Zr) {
          Zr = !1, E.style.cursor = ut > 1 ? "grab" : "crosshair";
          try {
            E.releasePointerCapture(D.pointerId);
          } catch {
          }
          return;
        }
        if (dt) {
          dt = null;
          try {
            E.releasePointerCapture(D.pointerId);
          } catch {
          }
          E.style.cursor = "crosshair", R.redraw(), Ot();
          return;
        }
        if (!kr) return;
        kr = !1;
        try {
          E.releasePointerCapture(D.pointerId);
        } catch {
        }
        const q = De(D);
        if (V === "crop") {
          St && (Je(St), St = null);
          const ae = Math.max(0, Math.min(wt, q.x)), Ge = Math.max(0, Math.min(xt, q.y)), mt = Math.abs(q.x - wt), Wt = Math.abs(q.y - xt);
          mt > 4 && Wt > 4 && qp(g, ae, Ge, mt, Wt);
          return;
        }
        const ie = V === "pixelate" && Math.abs(q.x - wt) > 4 && Math.abs(q.y - xt) > 4;
        (V === "pen" && Ir.length > 1 || V === "line" || V === "rect" || V === "circle" || V === "arrow" || ie) && Hr(g), V === "pen" && Ir.length > 1 ? R.addShape({ type: "pen", color: he, points: Ir }) : V === "line" ? R.addShape({ type: "line", color: he, x1: wt, y1: xt, x2: q.x, y2: q.y }) : V === "rect" ? R.addShape({ type: "rect", color: he, x: Math.min(wt, q.x), y: Math.min(xt, q.y), w: Math.abs(q.x - wt), h: Math.abs(q.y - xt) }) : V === "circle" ? R.addShape({ type: "circle", color: he, x: (wt + q.x) / 2, y: (xt + q.y) / 2, rx: Math.abs(q.x - wt) / 2, ry: Math.abs(q.y - xt) / 2 }) : V === "arrow" ? R.addShape({ type: "arrow", color: he, x1: wt, y1: xt, x2: q.x, y2: q.y }) : ie && R.addShape({ type: "pixelate", x: Math.min(wt, q.x), y: Math.min(xt, q.y), w: Math.abs(q.x - wt), h: Math.abs(q.y - xt) }), Ot();
      }), E.addEventListener("pointercancel", (D) => {
        try {
          E.releasePointerCapture(D.pointerId);
        } catch {
        }
        St && (Je(St), St = null), Zr && (Zr = !1, E.style.cursor = ut > 1 ? "grab" : "crosshair"), dt && (dt = null, E.style.cursor = "crosshair", R.redraw(), Ot()), kr && (kr = !1, R.redraw());
      });
      const ul = { p: "pen", l: "line", r: "rect", o: "circle", a: "arrow", t: "text", c: "count", b: "pixelate", k: "crop" };
      ge = (D) => {
        if (!document.body.contains(o)) {
          Mn();
          return;
        }
        if (ft && document.body.contains(ft)) return;
        const q = typeof D.composedPath == "function" && D.composedPath()[0] || D.target;
        if (q && (q.tagName === "INPUT" || q.tagName === "TEXTAREA" || q.tagName === "SELECT" || q.isContentEditable)) return;
        if ((D.metaKey || D.ctrlKey) && D.key.toLowerCase() === "z") {
          D.preventDefault(), xa(g);
          return;
        }
        if (D.metaKey || D.ctrlKey || D.altKey) return;
        const ie = D.key.toLowerCase();
        if (ie === "z") {
          if (D.preventDefault(), ut > 1) Kp();
          else {
            const { cx: te, cy: ae } = mo();
            ei(te, ae, 2);
          }
          return;
        }
        ul[ie] && (D.preventDefault(), me(ul[ie]));
      }, document.addEventListener("keydown", ge, { capture: !0 });
    }
  }
  function jp(g) {
    const k = c[g], x = new Image();
    x.onload = () => {
      const C = document.createElement("canvas");
      C.width = x.naturalWidth, C.height = x.naturalHeight;
      const E = new zs(C, k);
      E.redraw();
      const R = document.createElement("div");
      R.style.cssText = "position:fixed;inset:0;background:#000;z-index:2147483647;display:flex;flex-direction:column;pointer-events:all;";
      const _ = document.createElement("div");
      _.className = "kl-edtb", _.style.cssText = "display:flex;align-items:center;gap:8px;padding:8px;background:#1e1e2e;flex-wrap:wrap;", _.innerHTML = `
        <button data-tool="pen" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${Z("pencil", { size: 14 })} Pen</button>
        <button data-tool="rect" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${Z("square", { size: 14 })} Rect</button>
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
        <button id="klavity-clear-ann" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${Z("trash-2", { size: 14 })} Clear</button>
        <button id="klavity-save-ann" style="padding:6px 10px;background:#89b4fa;color:#1e1e2e;border:none;border-radius:4px;cursor:pointer;font-weight:700;">${Z("check", { label: "Save", size: 14 })} Save</button>
        <button id="klavity-cancel-ann" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${Z("x", { size: 14 })}</button>
      `, C.style.cssText = "cursor:crosshair;display:block;margin:12px auto;touch-action:none;background:#fff;border-radius:4px;outline:1px solid rgba(255,255,255,.12);outline-offset:-1px;box-shadow:0 12px 44px rgba(0,0,0,.55);";
      const I = document.createElement("div");
      I.style.cssText = "flex:1;min-height:0;overflow:auto;display:block;box-shadow:inset 0 1px 0 rgba(255,255,255,.04);", I.appendChild(C);
      const L = document.createElement("style");
      L.textContent = ".kl-edtb button{transition:transform .15s cubic-bezier(.34,1.56,.64,1),background .15s ease;will-change:transform;}.kl-edtb button:hover{transform:translateY(-1px) scale(1.02);background:#45475a;}.kl-edtb button[data-color]:hover{transform:scale(1.14);background:initial;}.kl-edtb button:active{transform:scale(.96);}.kl-edtb button:focus-visible{outline:2px solid #89b4fa;outline-offset:2px;}.kl-edtb .kl-zb{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:34px;padding:0 9px;background:#313244;color:#cdd6f4;border:none;border-radius:8px;cursor:pointer;font-size:15px;font-weight:600;line-height:1;}.kl-edtb .kl-zb:hover{background:#45475a;}@media (prefers-reduced-motion:reduce){.kl-edtb button{transition:none;}.kl-edtb button:hover,.kl-edtb button:active,.kl-edtb button[data-color]:hover{transform:none;}}", R.append(L, _, I), s.appendChild(R), Mn();
      let $ = 1;
      const F = (Q) => Math.max(0.05, Math.min(5, Q || 1));
      function B(Q) {
        $ = F(Q), C.style.width = Math.round(C.width * $) + "px", C.style.height = Math.round(C.height * $) + "px";
        const de = _.querySelector("#klavity-zoom-pct");
        de && (de.textContent = Math.round($ * 100) + "%");
      }
      const K = () => Math.max(1, I.clientWidth - 24) / C.width, J = () => Math.min(Math.max(1, I.clientWidth - 24) / C.width, Math.max(1, I.clientHeight - 24) / C.height), ne = C.height / C.width > Math.max(1, I.clientHeight) / Math.max(1, I.clientWidth);
      B(ne ? K() : J()), _.querySelector("#klavity-zoom-in").addEventListener("click", () => B($ * 1.25)), _.querySelector("#klavity-zoom-out").addEventListener("click", () => B($ / 1.25)), _.querySelector("#klavity-fit-width").addEventListener("click", () => B(K())), _.querySelector("#klavity-fit-page").addEventListener("click", () => B(J()));
      let X = "rect", V = "#ef4444", he = !1, je = [], Ze = 0, ft = 0;
      function gr(Q) {
        X = Q, _.querySelectorAll("[data-tool]").forEach((de) => {
          const De = de.dataset.tool === Q;
          de.style.background = De ? "#585b70" : "#313244", de.style.outline = De ? "2px solid #89b4fa" : "none";
        });
      }
      _.querySelectorAll("[data-tool]").forEach((Q) => Q.addEventListener("click", () => gr(Q.dataset.tool))), _.querySelectorAll("[data-color]").forEach((Q) => Q.addEventListener("click", () => {
        V = Q.dataset.color;
      }));
      {
        const Q = _.querySelector("#klavity-color-custom"), de = _.querySelector("#klavity-color-input");
        if (Q && de) {
          Q.addEventListener("click", () => de.click());
          const De = () => {
            Q.style.background = de.value, V = de.value;
          };
          de.addEventListener("input", De), de.addEventListener("change", De);
        }
      }
      _.querySelector("#klavity-undo").addEventListener("click", () => E.undo()), _.querySelector("#klavity-clear-ann").addEventListener("click", () => E.clearAll());
      const Ot = { p: "pen", r: "rect", c: "circle", a: "arrow", t: "text" };
      function me(Q) {
        const de = Q.target;
        if (de && (de.tagName === "INPUT" || de.tagName === "TEXTAREA" || de.isContentEditable)) return;
        if (Q.key === "Escape") {
          Q.stopPropagation(), ze();
          return;
        }
        if ((Q.metaKey || Q.ctrlKey) && Q.key.toLowerCase() === "z") {
          Q.preventDefault(), E.undo();
          return;
        }
        if (Q.metaKey || Q.ctrlKey || Q.altKey) return;
        const De = Q.key.toLowerCase();
        Ot[De] ? (Q.preventDefault(), gr(Ot[De])) : De === "u" && (Q.preventDefault(), E.undo());
      }
      function ze() {
        document.removeEventListener("keydown", me, { capture: !0 }), Je(R), Ka();
      }
      document.addEventListener("keydown", me, { capture: !0 }), gr(X), _.querySelector("#klavity-save-ann").addEventListener("click", async () => {
        Hr(g), E.shapes.length ? re[g] = { w: C.width, h: C.height, shapes: E.shapes.map((Q) => ({ ...Q })) } : delete re[g], Zt(g), ze(), Oe();
      }), _.querySelector("#klavity-cancel-ann").addEventListener("click", () => ze());
      function Ne(Q) {
        const de = C.getBoundingClientRect();
        return { x: (Q.clientX - de.left) / de.width * C.width, y: (Q.clientY - de.top) / de.height * C.height };
      }
      C.addEventListener("pointerdown", (Q) => {
        he = !0;
        const de = Ne(Q);
        if ({ x: Ze, y: ft } = de, X === "pen" && (je = [de]), X === "text") {
          he = !1;
          const De = document.createElement("input");
          De.style.cssText = `position:fixed;left:${Q.clientX}px;top:${Q.clientY}px;background:transparent;border:1px dashed ${V};color:${V};font-size:16px;outline:none;z-index:9999999;min-width:80px;`, document.body.appendChild(De), requestAnimationFrame(() => {
            document.body.contains(De) && De.focus();
          }), De.addEventListener("blur", () => {
            De.value.trim() && E.addShape({ type: "text", color: V, x: Ze, y: ft, text: De.value.trim() }), Je(De);
          }, { once: !0 }), De.addEventListener("keydown", (Jn) => {
            Jn.key === "Enter" && De.blur(), Jn.stopPropagation();
          });
        }
      }), C.addEventListener("pointermove", (Q) => {
        he && X === "pen" && je.push(Ne(Q));
      }), C.addEventListener("pointerup", (Q) => {
        if (!he) return;
        he = !1;
        const de = Ne(Q);
        X === "pen" && je.length > 1 ? E.addShape({ type: "pen", color: V, points: je }) : X === "rect" ? E.addShape({ type: "rect", color: V, x: Math.min(Ze, de.x), y: Math.min(ft, de.y), w: Math.abs(de.x - Ze), h: Math.abs(de.y - ft) }) : X === "circle" ? E.addShape({ type: "circle", color: V, x: (Ze + de.x) / 2, y: (ft + de.y) / 2, rx: Math.abs(de.x - Ze) / 2, ry: Math.abs(de.y - ft) / 2 }) : X === "arrow" && E.addShape({ type: "arrow", color: V, x1: Ze, y1: ft, x2: de.x, y2: de.y });
      });
    }, x.src = k;
  }
  function Hp(g, k) {
    const x = document.createElement("div");
    x.style.cssText = "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:all;";
    const C = document.createElement("div");
    C.className = "klavity-sent";
    const E = document.createElement("div");
    E.className = "kl-sent-check", E.innerHTML = Z("check", { label: "Sent", size: 22 }), C.appendChild(E);
    const R = document.createElement("h2");
    R.textContent = "Report sent", C.appendChild(R);
    const _ = document.createElement("p");
    if (_.textContent = n.thankYou || "We filed it and emailed you a copy.", C.appendChild(_), g) {
      const I = document.createElement("div");
      I.className = "klavity-ref";
      const L = document.createElement("span");
      L.textContent = "Filed as";
      const $ = document.createElement("code");
      $.textContent = Co(g, k), I.append(L, $);
      const F = Mo(k);
      if (F) {
        const B = document.createElement("a");
        B.href = F, B.target = "_blank", B.rel = "noopener", B.textContent = "Open in Klavity", I.appendChild(B);
      }
      C.appendChild(I);
    }
    x.appendChild(C), Je(Mr), s.appendChild(x), Oa(C, Qe);
  }
  function Yp(g, k, x) {
    const { copy: C, onLead: E } = x;
    le.innerHTML = "";
    const R = document.createElement("div");
    R.className = "klavity-success";
    const _ = document.createElement("h2");
    if (_.innerHTML = C.headline, R.appendChild(_), C.body) {
      const L = document.createElement("p");
      L.textContent = C.body, R.appendChild(L);
    }
    if (g) {
      const L = document.createElement("div");
      L.className = "klavity-ref";
      const $ = document.createElement("span");
      $.textContent = "Filed as";
      const F = document.createElement("code");
      F.textContent = Co(g, k), L.append($, F);
      const B = Mo(k);
      if (B) {
        const K = document.createElement("a");
        K.href = B, K.target = "_blank", K.rel = "noopener", K.textContent = "Open in Klavity", L.appendChild(K);
      }
      R.appendChild(L);
    }
    const I = () => Oa(le, _t);
    if (C.showEmail) {
      const L = document.createElement("div");
      L.className = "klavity-lead";
      const $ = document.createElement("input");
      $.type = "email", $.placeholder = "you@company.com";
      const F = document.createElement("button"), B = C.emailLabel;
      F.textContent = B;
      const K = document.createElement("div");
      K.className = "klavity-lead-err", K.setAttribute("role", "alert"), K.style.display = "none";
      const J = async () => {
        const ne = $.value.trim();
        if (!ne || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(ne)) {
          K.textContent = "Please enter a valid email so we can reach you.", K.style.display = "block", $.focus();
          return;
        }
        F.disabled = !0, F.textContent = "Saving…", K.style.display = "none";
        try {
          E && await E(g, ne);
        } catch (V) {
          try {
            console.warn("[Klavity] lead capture failed:", (V == null ? void 0 : V.message) || V);
          } catch {
          }
          K.textContent = "Couldn't save your email — please try again.", K.style.display = "block", F.disabled = !1, F.textContent = "Retry", $.focus();
          return;
        }
        const X = document.createElement("div");
        X.className = "klavity-thanks", X.textContent = "Thanks — we'll be in touch.", Je(K), L.replaceWith(X), C.showCta || I();
      };
      F.addEventListener("click", J), $.addEventListener("keydown", (ne) => {
        ne.key === "Enter" && J();
      }), L.append($, F), R.appendChild(L), R.appendChild(K);
    }
    if (C.showCta && C.ctaUrl) {
      const L = document.createElement("a");
      L.className = "klavity-cta", L.href = C.ctaUrl, L.target = "_blank", L.rel = "noopener", L.textContent = C.ctaText, R.appendChild(L);
    }
    if (le.appendChild(R), !n.whiteLabel) {
      const L = document.createElement("div");
      L.className = "klavity-pb";
      const $ = document.createElement("a");
      $.href = Vu("https://klavity.in", {
        campaign: "powered_by",
        medium: n.attributionMedium,
        ref: n.projectId
      }), $.target = "_blank", $.rel = "noopener", $.textContent = "Klavity", L.append("Powered by ", $), le.appendChild(L);
    }
    !C.showEmail && !C.showCta && I();
  }
  if (P.length && (oe = P.length - 1, Vr()), t.autoCaptureOnOpen) {
    let g = 0;
    try {
      g = document.getElementsByTagName("*").length;
    } catch {
      g = 0;
    }
    const k = g <= A;
    if (k || Ll(t) === "screen") {
      if (l = !0, Oe(), Ll(t) === "screen")
        return (async () => {
          const E = await uo({ viewport: !0, onOpen: !0 });
          if (E.ok) {
            l = !1, Oe();
            return;
          }
          if (E.declined) {
            l = !1, ar({ immediate: !0, reason: "discard" });
            return;
          }
          if (c.length) {
            l = !1, Oe();
            return;
          }
          if (!k) {
            y = !0, l = !1, Oe();
            return;
          }
          if (l = !0, Oe(), t.onCaptureViewport) {
            Ha(null).catch(() => {
              l = !1, Oe();
            });
            return;
          }
          t.onCaptureFull().then((R) => {
            const { dataUrl: _, quality: I, suggestSharp: L, blank: $ } = tr(R);
            if (l = !1, $ && c.length === 0) {
              Zi();
              return;
            }
            Lt(_, I, void 0, !0, !!L), er(Lr);
          }).catch(() => {
            l = !1, Oe();
          });
        })(), Ma;
      const x = () => {
        if (t.onCaptureViewport) {
          Ha(null).catch(() => {
            l = !1, Oe();
          });
          return;
        }
        t.onCaptureFull().then((E) => {
          const { dataUrl: R, quality: _, suggestSharp: I, blank: L } = tr(E);
          if (l = !1, L && c.length === 0) {
            Zi();
            return;
          }
          Lt(R, _, void 0, !0, !!I), er(Lr);
        }).catch(() => {
          l = !1, Oe();
        });
      }, C = window.requestIdleCallback;
      typeof C == "function" ? C(() => x(), { timeout: 1200 }) : requestAnimationFrame(() => setTimeout(x, 0));
    } else
      y = !0, Oe();
  }
  return Ma;
}
function Cg(e, t) {
  const r = document.createElement("div");
  r.style.cssText = "position:fixed;inset:0;cursor:crosshair;z-index:2147483646;user-select:none;", r.setAttribute("data-klavity-region-overlay", ""), document.body.appendChild(r);
  const n = document.createElement("div");
  n.textContent = "Drag to select an area · Esc to cancel", n.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-family:system-ui;font-size:14px;background:rgba(0,0,0,.7);padding:8px 16px;border-radius:6px;pointer-events:none;z-index:2147483647;", document.body.appendChild(n);
  let i = 0, o = 0, s = !1;
  function c() {
    document.removeEventListener("keydown", l, { capture: !0 }), Je(r), Je(n);
  }
  function l(d) {
    d.key === "Escape" && (d.stopPropagation(), c(), t());
  }
  document.addEventListener("keydown", l, { capture: !0 }), r.addEventListener("pointerdown", (d) => {
    s = !0, i = d.clientX, o = d.clientY, Je(n);
  }), r.addEventListener("pointermove", (d) => {
    if (!s) return;
    const a = Math.min(d.clientX, i), h = Math.min(d.clientY, o), p = Math.abs(d.clientX - i), u = Math.abs(d.clientY - o);
    r.style.background = `
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) 0 0/${a}px 100%,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${a + p}px 0/calc(100% - ${a + p}px) 100%,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${a}px 0/${p}px ${h}px,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${a}px ${h + u}px/${p}px calc(100% - ${h + u}px)
    `, r.style.backgroundRepeat = "no-repeat";
  }), r.addEventListener("pointerup", (d) => {
    if (!s) return;
    s = !1;
    const a = Math.abs(d.clientX - i), h = Math.abs(d.clientY - o);
    if (a < 8 || h < 8) {
      c(), t();
      return;
    }
    const p = { x: Math.min(d.clientX, i), y: Math.min(d.clientY, o), w: a, h };
    c(), e(p);
  });
}
const Mg = 2e4;
async function Il(e) {
  if (e.type === "image/heic" || e.type === "image/heif" || e.name.endsWith(".heic") || e.name.endsWith(".heif")) {
    let t;
    try {
      const r = await Promise.race([
        (async () => {
          const n = (await import("./heic2any-D6xzzX7R.js").then((i) => i.h)).default;
          return await n({ blob: e, toType: "image/jpeg", quality: 0.85 });
        })(),
        new Promise((n, i) => {
          t = setTimeout(() => i(new Error("heic-convert-timeout")), Mg);
        })
      ]);
      return Ol(r);
    } catch {
    } finally {
      t && clearTimeout(t);
    }
  }
  return Ol(e);
}
const Rg = 3e4;
function Ol(e) {
  return new Promise((t, r) => {
    const n = new FileReader();
    let i = !1;
    const o = setTimeout(() => {
      if (!i) {
        i = !0;
        try {
          n.abort();
        } catch {
        }
        r(new Error("file read timed out"));
      }
    }, Rg), s = (c) => {
      i || (i = !0, clearTimeout(o), c());
    };
    n.onload = () => s(() => t(n.result)), n.onerror = () => s(() => r(n.error || new Error("file read failed"))), n.onabort = () => s(() => r(n.error || new Error("file read aborted")));
    try {
      n.readAsDataURL(e);
    } catch (c) {
      s(() => r(c instanceof Error ? c : new Error("file read failed")));
    }
  });
}
const Tg = {
  frustrated: { accent: "#e8849a", mark: "vein", label: "Frustrated" },
  confused: { accent: "#e8a24a", mark: "q", label: "Confused" },
  satisfied: { accent: "#7fd1c4", mark: "check", label: "Satisfied" },
  delighted: { accent: "#9fd6a0", mark: "spark", label: "Delighted" },
  neutral: { accent: "#8a8276", mark: "dots", label: "Neutral" },
  inspired: { accent: "#8b8bf5", mark: "bulb", label: "Inspired" },
  alarmed: { accent: "#ef6b6b", mark: "bang", label: "Alarmed" }
};
function Ag(e) {
  const t = (e || "").trim().split(/\s+/).filter(Boolean);
  return t.length === 0 ? "?" : t.length === 1 ? t[0].slice(0, 2).toUpperCase() : (t[0][0] + t[t.length - 1][0]).toUpperCase();
}
function _g(e) {
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
const Lg = {
  vein: "ksim-m-vein",
  spark: "ksim-m-spark",
  bulb: "ksim-m-bulb",
  bang: "ksim-m-bang",
  q: "ksim-m-q",
  dots: "ksim-m-dots",
  check: "ksim-m-check"
};
function Nr(e) {
  return String(e).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function Ig(e) {
  const {
    name: t,
    photoUrl: r,
    color: n = "#6f6cf2",
    emotion: i = "none",
    size: o = 58,
    eyes: s = !0,
    legs: c = !0,
    animate: l = !0,
    className: d = ""
  } = e, a = Nr(e.initials || Ag(t)), h = i !== "none" ? Tg[i] : null, p = h ? `<span class="ksim-mark ${l ? Lg[h.mark] : ""}" style="color:${Nr(h.accent)}">${_g(h.mark)}</span>` : "", m = r ? `<span class="ksim-head ksim-photo"><img src="${Nr(r)}" alt="${Nr(t)}" loading="lazy" onerror="this.style.display='none';this.parentNode.classList.add('ksim-fallback')"><span class="ksim-ini">${a}</span></span>` : `<span class="ksim-head ksim-mono"><span class="ksim-ini">${a}</span>${s ? '<span class="ksim-eyes"><i></i><i></i></span>' : ""}</span>`, f = c ? '<span class="ksim-legs"><i></i><i></i></span>' : "", y = ["ksim", l ? "is-animated" : "", d].filter(Boolean).join(" "), M = `--ksim-persona:${Nr(n)};--ksim-size:${o}px;` + (h ? `--ksim-accent:${Nr(h.accent)};` : "");
  return `<span class="${y}" style="${M}" data-emotion="${i}" title="${Nr(t)}">${p}${m}${f}</span>`;
}
function Og(e) {
  const t = document.createElement("template");
  return t.innerHTML = Ig(e).trim(), t.content.firstElementChild;
}
const Ng = `
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
function Pg(e = document) {
  var n;
  const t = e.head ?? e ?? null;
  if (!t || (n = t.querySelector) != null && n.call(t, "style[data-ksim]")) return;
  const r = document.createElement("style");
  r.setAttribute("data-ksim", ""), r.textContent = Ng, t.appendChild(r);
}
function Bs(e, t) {
  const r = e.indexOf(","), n = e.slice(0, r), i = e.slice(r + 1), o = /data:([^;,]+)/.exec(n), s = t || (o ? o[1] : "application/octet-stream");
  if (/;base64/i.test(n)) {
    const c = atob(i), l = new Uint8Array(c.length);
    for (let d = 0; d < c.length; d++) l[d] = c.charCodeAt(d);
    return new Blob([l], { type: s });
  }
  return new Blob([decodeURIComponent(i)], { type: s });
}
function $g(e) {
  if (!e || typeof e != "object") return !1;
  if (typeof e.selector == "string" && e.selector.trim() !== "") return !0;
  const t = (r) => r && Array.isArray(r.shapes) && r.shapes.length > 0;
  if (t(e)) return !0;
  if (e.byIndex && typeof e.byIndex == "object") {
    for (const r of Object.keys(e.byIndex)) if (t(e.byIndex[r])) return !0;
  }
  return !1;
}
function zg(e) {
  const t = new FormData();
  if (t.set("type", e.type ?? "bug"), t.set("description", e.description), t.set("page_url", e.pageUrl), e.context && t.set("context", JSON.stringify(e.context)), e.projectId && t.set("project_id", e.projectId), e.replayEvents && e.replayEvents.length && t.set("replay_events", JSON.stringify(e.replayEvents)), e.title && t.set("title", e.title), e.referrer && t.set("referrer", e.referrer), e.reporter && Object.keys(e.reporter).length && t.set("reporter", JSON.stringify(e.reporter)), e.clientInfo && Object.keys(e.clientInfo).length && t.set("client_info", JSON.stringify(e.clientInfo)), e.files)
    for (const r of e.files)
      try {
        t.append("files", r.blob ?? Bs(r.dataUrl, r.type), r.name);
      } catch {
      }
  if (e.recordings && e.recordings.length) {
    const r = [];
    for (const n of e.recordings)
      try {
        const i = (n.mime || "").includes("mp4") ? "mp4" : "webm", o = n.mime && /^video\//.test(n.mime) ? n.mime : `video/${i}`;
        t.append("recording", Bs(n.dataUrl, o), `recording-${n.id}.${i}`), r.push({ id: n.id, durationMs: n.durationMs, width: n.width, height: n.height, bytes: n.bytes, mime: n.mime, screenOnly: n.screenOnly });
      } catch {
      }
    r.length && t.set("recording_meta", JSON.stringify(r));
  }
  return $g(e.annotations) && t.set("annotations_json", JSON.stringify(e.annotations)), t;
}
async function Dg(e) {
  try {
    const t = e.get("replay_events");
    if (typeof t != "string" || !t || typeof CompressionStream != "function") return;
    const r = await new Response(new Blob([t]).stream().pipeThrough(new CompressionStream("gzip"))).blob();
    if (!r.size || r.size >= t.length) return;
    e.delete("replay_events"), e.set("replay_events_gz", new Blob([r], { type: "application/gzip" }), "replay.json.gz");
  } catch {
  }
}
async function Fg(e) {
  const { settings: t, type: r, description: n, context: i, screenshots: o, projectId: s, replayEvents: c } = e, l = zg({
    type: e.kind ?? r,
    description: n,
    pageUrl: i.pageUrl,
    context: i,
    projectId: s,
    replayEvents: c,
    title: e.title,
    referrer: e.referrer,
    reporter: e.reporter,
    clientInfo: e.clientInfo,
    files: e.files,
    recordings: e.recordings,
    annotations: e.annotations
  });
  await Dg(l), e.reporterEmail && l.set("reporter_email", e.reporterEmail);
  const d = t.connectionMode === "klavity" && !!t.klavToken;
  if (!d) {
    const { plane: u } = t;
    l.append("plane_token", u.token), l.append("plane_workspace", u.workspace), l.append("plane_project_id", u.projectId), l.append("plane_host", u.host);
  }
  for (let u = 0; u < o.length; u++) {
    const m = await (await fetch(o[u])).blob();
    l.append("screenshots", m, `screenshot-${u}.png`);
  }
  if (e.screenshotThumbs)
    for (const u of e.screenshotThumbs)
      try {
        l.append("screenshot_thumbs", Bs(u), "thumb.jpg");
      } catch {
      }
  const a = d ? { Authorization: `Bearer ${t.klavToken}` } : {}, h = await fetch(`${t.backendUrl}/api/feedback`, { method: "POST", headers: a, body: l });
  if (!h.ok) throw new Error(`Klavity backend error ${h.status}: ${await h.text()}`);
  const p = await h.json();
  return {
    issueKey: p.jira_key ?? p.id,
    issueUrl: p.issue_url ?? t.backendUrl
  };
}
const Ug = (
  // entrance keyframes: spring scale-in from top-left (cursor anchor)
  "@keyframes klm-in{0%{opacity:0;transform:scale(.9) translateY(-6px)}100%{opacity:1;transform:scale(1) translateY(0)}}@keyframes klm-row-in{0%{opacity:0;transform:translateY(8px) scale(.97)}100%{opacity:1;transform:translateY(0) scale(1)}}@keyframes klm-shine{0%{transform:translateX(-130%)}100%{transform:translateX(240%)}}@keyframes klm-spin{to{transform:rotate(360deg)}}.klm-menu{animation:klm-in .34s cubic-bezier(.34,1.56,.64,1) both}.klm-card{position:relative;display:flex;align-items:center;gap:8px;width:100%;border:0;cursor:pointer;text-align:left;padding:8px 10px;border-radius:12px;color:#2a2342;font-family:inherit;background:linear-gradient(180deg,rgba(255,255,255,.72),rgba(252,250,246,.55));box-shadow:0 1px 2px rgba(40,25,70,.06),inset 0 0 0 1px rgba(99,102,241,.08);transition:scale .14s cubic-bezier(.2,0,0,1),box-shadow .2s ease,background .2s ease;animation:klm-row-in .42s cubic-bezier(.16,1,.3,1) both}.klm-card:hover{scale:1.015;box-shadow:0 5px 14px -3px rgba(99,102,241,.3),inset 0 0 0 1px rgba(99,102,241,.16)}.klm-card:active{scale:.96}.klm-card:focus-visible{outline:2px solid #6366f1;outline-offset:2px}.klm-chip{flex:none;width:32px;height:32px;border-radius:8px;display:grid;place-items:center;color:#5b51c9;background:rgba(99,102,241,.12);transition:transform .2s cubic-bezier(.34,1.56,.64,1)}.klm-chip svg{width:16px;height:16px;display:block}.klm-card:hover .klm-chip{transform:scale(1.1) rotate(-5deg)}.klm-body{display:flex;flex-direction:column;gap:2px;min-width:0}.klm-t{font-size:13px;font-weight:650;letter-spacing:-.01em;line-height:1.2}.klm-d{font-size:10.5px;line-height:1.35;color:#7c7793;text-wrap:pretty}.klm-go{margin-left:auto;flex:none;color:#b6afce;display:inline-flex;transition:transform .2s cubic-bezier(.2,0,0,1)}.klm-go svg{width:14px;height:14px;display:block}.klm-card:hover .klm-go{transform:translateX(3px)}.klm-hint{margin-left:auto;flex:none;font-family:ui-monospace,monospace;font-size:10px;color:#9a93a6;background:rgba(40,30,60,.06);padding:3px 8px;border-radius:12px;text-align:center;line-height:1.32}.klm-card.primary{background:linear-gradient(160deg,#6d6bf3,#5b51d8);color:#fff;box-shadow:0 6px 16px -4px rgba(79,70,229,.45),inset 0 1px 0 rgba(255,255,255,.3)}.klm-card.primary:hover{box-shadow:0 9px 22px -4px rgba(79,70,229,.55),inset 0 1px 0 rgba(255,255,255,.35)}.klm-card.primary .klm-chip{background:rgba(255,255,255,.22);color:#fff}.klm-card.primary .klm-d{color:rgba(255,255,255,.85)}.klm-card.primary .klm-go{color:rgba(255,255,255,.72)}.klm-card.muted{background:linear-gradient(180deg,rgba(250,248,244,.62),rgba(243,236,225,.5))}.klm-card.muted .klm-chip{background:rgba(40,30,60,.06);color:#8a8390}.klm-card.muted .klm-t{color:#5d5870}.klm-card.muted .klm-d{color:#9a93a6}.klm-sims-row{display:flex;align-items:center;justify-content:space-between;padding:2px 4px 4px;gap:6px;min-height:30px}.klm-sims-chips{display:flex;align-items:center;gap:0}.klm-sim-chip{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font-size:9px;font-weight:700;color:#fff;flex-shrink:0;border:1.5px solid rgba(255,255,255,.65);margin-left:-3px}.klm-sims-chips .klm-sim-chip:first-child{margin-left:0}.klm-issue-pill{font-size:10px;font-weight:650;color:#ef4444;background:rgba(239,68,68,.1);border-radius:20px;padding:2px 7px;white-space:nowrap;margin-left:auto}.klm-sims-label{font-size:10.5px;color:#9a93a6;margin-left:6px;white-space:nowrap}.klm-foot{text-align:center;font-size:11px;color:#8a8076;padding:4px 0 2px;border:0;background:transparent;width:100%;cursor:pointer;font-family:inherit;border-radius:8px;transition:color .18s ease;animation:klm-row-in .42s cubic-bezier(.16,1,.3,1) both}.klm-foot:hover{color:#5b51c9}.klm-foot:focus-visible{outline:2px solid #6366f1;outline-offset:2px}.klm-shine{position:absolute;top:0;left:0;width:42%;height:100%;pointer-events:none;background:linear-gradient(105deg,transparent,rgba(255,255,255,.6),transparent);transform:translateX(-130%);animation:klm-shine 1s ease-out .15s both}"
), Bg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
function qg(e, t) {
  const r = e.createElement("button");
  r.className = "klm-card" + (t.primary ? " primary" : "") + (t.muted ? " muted" : ""), t.animationDelayMs != null && (r.style.animationDelay = t.animationDelayMs + "ms");
  const n = t.hint ? '<span class="klm-hint">' + t.hint + "</span>" : '<span class="klm-go">' + Bg + "</span>";
  return r.innerHTML = '<span class="klm-chip">' + t.iconHtml + '</span><span class="klm-body"><span class="klm-t">' + t.label + "</span>" + (t.desc ? '<span class="klm-d">' + t.desc + "</span>" : "") + "</span>" + n, r;
}
function Wg(e) {
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
function jg(e) {
  if (/Windows NT 10/.test(e)) return "Windows 10/11";
  if (/Windows NT/.test(e)) return "Windows";
  if (/iPhone|iPad|iPod/.test(e)) return "iOS";
  if (/Android/.test(e)) return "Android";
  if (/Mac OS X/.test(e)) return "macOS";
  if (/CrOS/.test(e)) return "ChromeOS";
  if (/Linux/.test(e)) return "Linux";
}
function Ro(e = typeof window < "u" ? window : void 0, t = typeof navigator < "u" ? navigator : void 0) {
  const r = {}, n = t && t.userAgent || "";
  n && (r.userAgent = n.slice(0, 500));
  const i = Wg(n);
  i.browser && (r.browser = i.browser), i.version && (r.browserVersion = i.version);
  const o = jg(n);
  o && (r.os = o), r.deviceType = /Mobi|Android|iPhone|iPod/i.test(n) && !/iPad|Tablet/i.test(n) ? "mobile" : /iPad|Tablet/i.test(n) ? "tablet" : "desktop";
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
    const s = Intl.DateTimeFormat().resolvedOptions().timeZone;
    s && (r.timezone = String(s).slice(0, 60));
  } catch {
  }
  return r;
}
function rr(e, t) {
  if (t >= e.length) return null;
  const r = e[t];
  let n = 0;
  for (let s = 7; s >= 0; s--)
    if ((r & 1 << s) !== 0) {
      n = 8 - s;
      break;
    }
  if (n === 0 || t + n > e.length) return null;
  let i = r & (1 << 8 - n) - 1;
  for (let s = 1; s < n; s++)
    i = i * 256 + e[t + s];
  let o = 0;
  for (let s = 0; s < n; s++)
    o = o * 256 + e[t + s];
  return { width: n, value: i, rawId: o };
}
function Nl(e, t = 0) {
  let r = t;
  if (!r)
    for (let o = 1; o <= 8; o++) {
      const s = (1 << 7 * o) - 2;
      if (e <= s) {
        r = o;
        break;
      }
    }
  r || (r = 8);
  const n = new Uint8Array(r);
  let i = e;
  for (let o = r - 1; o > 0; o--)
    n[o] = i & 255, i = Math.floor(i / 256);
  return n[0] = i & 255 | 1 << 8 - r, n;
}
function Pl(e) {
  const t = new ArrayBuffer(8);
  return new DataView(t).setFloat64(0, e, !1), new Uint8Array(t);
}
function Hg(e, t) {
  if (e instanceof Uint8Array || (e = new Uint8Array(e)), e.length < 16 || t <= 0 || e[0] !== 26 || e[1] !== 69 || e[2] !== 223 || e[3] !== 163)
    return e;
  const r = rr(e, 0);
  if (!r) return e;
  const n = rr(e, r.width);
  if (!n) return e;
  const i = r.width + n.width + n.value;
  if (i >= e.length) return e;
  const o = rr(e, i);
  if (!o || o.rawId !== 408125543) return e;
  const s = rr(e, i + o.width);
  if (!s) return e;
  const c = i + o.width + s.width;
  let l = c;
  const d = s.width === 8 && s.value === 72057594037927940, a = d ? e.length : Math.min(e.length, c + s.value);
  let h = -1, p = null, u = 0;
  for (; l < a; ) {
    const H = rr(e, l);
    if (!H) break;
    const se = rr(e, l + H.width);
    if (!se) break;
    if (H.rawId === 357149030) {
      h = l, p = se, u = H.width + se.width;
      break;
    }
    if (H.rawId === 524531317) break;
    l += H.width + se.width + se.value;
  }
  if (h === -1 || !p) return e;
  const m = h + u, f = m + p.value;
  let y = m, M = 1e6, v = -1, b = 0, A = 0, S = !1;
  for (; y < f; ) {
    const H = rr(e, y);
    if (!H) break;
    const se = rr(e, y + H.width);
    if (!se) break;
    const re = y + H.width + se.width, ce = re + se.value;
    if (H.rawId === 2807729) {
      S = !0;
      let Ae = 0;
      for (let Ue = 0; Ue < se.value; Ue++)
        Ae = Ae * 256 + e[re + Ue];
      Ae > 0 && (M = Ae);
    } else H.rawId === 17545 && (v = y, b = ce - y, A = se.value);
    y = ce;
  }
  const w = t * 1e6 / M;
  if (v !== -1 && A === 8) {
    const H = rr(e, v);
    if (H) {
      const se = rr(e, v + H.width);
      if (se && se.value === 8) {
        const re = v + H.width + se.width, ce = new Uint8Array(e);
        return ce.set(Pl(w), re), ce;
      }
    }
  }
  const T = new Uint8Array(11);
  T[0] = 68, T[1] = 137, T[2] = 136, T.set(Pl(w), 3);
  let N = null;
  S || (N = new Uint8Array([42, 215, 177, 131, 15, 66, 64]));
  let U;
  if (v === -1) {
    const H = e.subarray(m, f), se = T.length + (N ? N.length : 0);
    U = new Uint8Array(H.length + se);
    let re = 0;
    N && (U.set(N, re), re += N.length), U.set(H, re), re += H.length, U.set(T, re);
  } else {
    const H = e.subarray(m, v), se = e.subarray(v + b, f), re = T.length + (N ? N.length : 0);
    U = new Uint8Array(H.length + re + se.length);
    let ce = 0;
    N && (U.set(N, ce), ce += N.length), U.set(H, ce), ce += H.length, U.set(T, ce), ce += T.length, U.set(se, ce);
  }
  const z = Nl(U.length), ee = new Uint8Array(4 + z.length);
  ee[0] = 21, ee[1] = 73, ee[2] = 169, ee[3] = 102, ee.set(z, 4);
  const W = new Uint8Array(ee.length + U.length);
  W.set(ee, 0), W.set(U, ee.length);
  const O = u + p.value, nt = W.length - O;
  let Ke = null;
  d || (Ke = Nl(s.value + nt, s.width));
  const fe = e.subarray(0, i + o.width), pe = Ke || e.subarray(i + o.width, c), Re = e.subarray(c, h), Fe = W, Te = e.subarray(h + O), ke = fe.length + pe.length + Re.length + Fe.length + Te.length, Ve = new Uint8Array(ke);
  let P = 0;
  return Ve.set(fe, P), P += fe.length, Ve.set(pe, P), P += pe.length, Ve.set(Re, P), P += Re.length, Ve.set(Fe, P), P += Fe.length, Ve.set(Te, P), P += Te.length, Ve;
}
function Yg(e) {
  return typeof e.arrayBuffer == "function" ? e.arrayBuffer() : new Promise((t, r) => {
    try {
      const n = new FileReader();
      n.onload = () => t(n.result), n.onerror = () => r(n.error || new Error("read failed")), n.readAsArrayBuffer(e);
    } catch (n) {
      r(n);
    }
  });
}
async function Vg(e, t) {
  if (!e || t <= 0) return e;
  try {
    const r = new Uint8Array(await Yg(e)), n = Hg(r, t);
    return n === r ? e : new Blob([n], { type: e.type || "video/webm" });
  } catch {
    return e;
  }
}
const Gg = 180 * 1e3, Kg = 50 * 1024 * 1024, Xg = 1e6, Jg = 96e3, Zg = 15, $l = 1280, Xu = {
  maxDurationMs: Gg,
  maxBytes: Kg
}, Qg = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm;codecs=h264,opus",
  "video/mp4;codecs=avc1,mp4a.40.2",
  "video/webm"
];
function Qs() {
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
function ey(e, t = Qg) {
  const r = e ?? ((n) => typeof MediaRecorder < "u" && !!MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(n));
  for (const n of t)
    if (r(n)) return n;
  return null;
}
function Ju(e = Qs()) {
  const t = e.mediaDevices, r = e.MediaRecorder ?? globalThis.MediaRecorder;
  return !!t && typeof t.getDisplayMedia == "function" && typeof r < "u";
}
function ty() {
  return "rec_" + (typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));
}
async function ry(e = {}, t = Qs()) {
  var v, b, A, S, w, T, N, U, z, ee, W, O, nt, Ke, fe, pe, Re, Fe, Te, ke, Ve;
  const r = { ...Xu, ...e.caps || {} }, n = e.wantCamera === !0, i = e.wantMic !== !1, o = Math.max(5, Math.min(60, e.fps ?? Zg)), s = ey(
    (v = t.MediaRecorder) != null && v.isTypeSupported ? (P) => t.MediaRecorder.isTypeSupported(P) : void 0
  );
  if (!s) throw new Error("recording-unsupported: no MediaRecorder codec available in this browser");
  const c = ty(), l = t.createElement("canvas"), d = l.getContext ? l.getContext("2d") : null, a = t.createElement("video");
  a.muted = !0, a.playsInline = !0, a.autoplay = !0;
  try {
    (b = a.setAttribute) == null || b.call(a, "playsinline", ""), (A = a.setAttribute) == null || A.call(a, "autoplay", ""), (S = a.setAttribute) == null || S.call(a, "muted", "");
  } catch {
  }
  const h = t.createElement("video");
  h.muted = !0, h.playsInline = !0, h.autoplay = !0;
  try {
    (w = h.setAttribute) == null || w.call(h, "playsinline", ""), (T = h.setAttribute) == null || T.call(h, "autoplay", ""), (N = h.setAttribute) == null || N.call(h, "muted", "");
  } catch {
  }
  let p = "idle";
  const u = (P) => {
    var H;
    p = P;
    try {
      (H = e.onState) == null || H.call(e, P);
    } catch {
    }
  };
  let m = null;
  if (e.focusCapturedSurface)
    try {
      const P = globalThis.CaptureController;
      typeof P == "function" && (m = new P(), (U = m.setFocusBehavior) == null || U.call(m, "focus-captured-surface"));
    } catch {
      m = null;
    }
  const f = await t.mediaDevices.getDisplayMedia({
    video: { frameRate: o, displaySurface: e.preferSurface ?? "monitor" },
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
    for (const H of [f, y])
      try {
        (P = H == null ? void 0 : H.getTracks) == null || P.call(H).forEach((se) => {
          var re;
          return (re = se.stop) == null ? void 0 : re.call(se);
        });
      } catch {
      }
  };
  try {
    let P = function() {
      if (!At) {
        At = !0;
        try {
          at.state !== "inactive" && at.stop();
        } catch {
        }
      }
    };
    const H = (z = f.getVideoTracks) == null ? void 0 : z.call(f)[0], se = ((ee = H == null ? void 0 : H.getSettings) == null ? void 0 : ee.call(H)) ?? {}, re = se.width && se.height ? se.width / se.height : 16 / 9;
    l.width = $l, l.height = Math.round($l / re);
    let ce = null, Ae = !1, Ue = !0;
    if (n || i)
      try {
        if (y = await t.mediaDevices.getUserMedia({
          video: n ? { width: 640, height: 480, facingMode: "user" } : !1,
          audio: i ? { echoCancellation: !0, noiseSuppression: !0 } : !1
        }), n && ((W = y.getVideoTracks) != null && W.call(y).length)) {
          Ae = !0, Ue = !1;
          try {
            h.srcObject = y, await (((O = h.play) == null ? void 0 : O.call(h)) ?? Promise.resolve());
          } catch {
          }
        }
        i && (ce = ((nt = y.getAudioTracks) == null ? void 0 : nt.call(y)[0]) || null, ce && (Ue = !1));
      } catch (ue) {
        let $e = !1;
        if (i && n)
          try {
            if (y = await t.mediaDevices.getUserMedia({ video: !1, audio: { echoCancellation: !0, noiseSuppression: !0 } }), ce = ((Ke = y.getAudioTracks) == null ? void 0 : Ke.call(y)[0]) || null, ce) {
              Ue = !1, $e = !0;
              try {
                (fe = e.onFallback) == null || fe.call(e, "camera-blocked");
              } catch {
              }
            }
          } catch {
          }
        if (!$e) {
          try {
            (pe = e.onFallback) == null || pe.call(e, (ue == null ? void 0 : ue.name) === "NotAllowedError" ? "permissions-policy" : (ue == null ? void 0 : ue.name) || "camera-mic-blocked");
          } catch {
          }
          Ue = !0;
        }
      }
    const Se = !!ce;
    if (Ae)
      try {
        a.srcObject = f, await (((Re = a.play) == null ? void 0 : Re.call(a)) ?? Promise.resolve());
      } catch {
      }
    let G = 0, oe = 0;
    const ge = () => {
      if (!d) return;
      const ue = l.width, $e = l.height;
      if (a.videoWidth) {
        const Qe = a.videoWidth, _t = a.videoHeight, Le = Qe / _t, it = ue / $e;
        let sr = ue, Zt = $e, wn = 0, jr = 0;
        Le > it ? (Zt = ue / Le, jr = ($e - Zt) / 2) : (sr = $e * Le, wn = (ue - sr) / 2), (wn > 0 || jr > 0) && (d.fillStyle = "#000", d.fillRect(0, 0, ue, $e)), d.drawImage(a, wn, jr, sr, Zt);
      }
      if (Ae && h.videoWidth) {
        const Qe = Math.round(ue * 0.22), _t = Math.round(Qe * (h.videoHeight / h.videoWidth)), Le = ue - Qe - 20, it = $e - _t - 20;
        d.drawImage(h, Le, it, Qe, _t), d.strokeStyle = "#7c3aed", d.lineWidth = 2, d.strokeRect(Le, it, Qe, _t);
      }
      p === "recording" && (d.fillStyle = "#e11", d.beginPath(), d.arc(24, 24, 7, 0, Math.PI * 2), d.fill());
    };
    if (Ae) {
      let ue = 0;
      const $e = Math.floor(1e3 / o), Qe = () => {
        ue = t.now(), ge();
      }, _t = () => {
        G = t.raf(_t), Qe();
      };
      _t(), oe = t.setInterval(() => {
        var Le;
        if (a.paused && !(H != null && H.muted))
          try {
            (Le = a.play) == null || Le.call(a);
          } catch {
          }
        t.now() - ue >= $e && Qe();
      }, Math.max(16, $e));
    }
    const _e = [];
    let We = null;
    if (Ae) {
      try {
        We = l.captureStream ? l.captureStream(o) : null;
      } catch {
      }
      const ue = (Fe = We == null ? void 0 : We.getVideoTracks) == null ? void 0 : Fe.call(We)[0];
      ue ? _e.push(ue) : H && _e.push(H);
    } else H && _e.push(H);
    ce && _e.push(ce);
    const ve = new t.MediaStream(_e);
    try {
      (Te = H == null ? void 0 : H.addEventListener) == null || Te.call(H, "ended", () => P()), (ke = H == null ? void 0 : H.addEventListener) == null || ke.call(H, "mute", () => {
      }), (Ve = H == null ? void 0 : H.addEventListener) == null || Ve.call(H, "unmute", () => {
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
    const Be = () => {
      var ue, $e;
      if (Ae && typeof document < "u" && !document.hidden) {
        try {
          (ue = a.play) == null || ue.call(a);
        } catch {
        }
        try {
          ($e = h.play) == null || $e.call(h);
        } catch {
        }
        ge();
      }
    };
    try {
      typeof document < "u" && document.addEventListener("visibilitychange", Be);
    } catch {
    }
    const ct = Math.max(15e4, Math.floor(e.videoBitsPerSecond ?? Xg)), Ee = Math.max(16e3, Math.floor(e.audioBitsPerSecond ?? Jg)), at = new t.MediaRecorder(ve, { mimeType: s, videoBitsPerSecond: ct, audioBitsPerSecond: Ee }), Rt = [];
    let Dt = 0, Tt = 0, Pe = 0, kt = 0, Jt = 0, At = !1;
    const Ct = () => {
      if (p === "idle") return 0;
      const ue = t.now() - Tt - Pe;
      return Math.max(0, ue - (kt ? t.now() - kt : 0));
    };
    at.ondataavailable = (ue) => {
      var $e, Qe;
      if (ue != null && ue.data && ue.data.size) {
        Rt.push(ue.data), Dt += ue.data.size;
        try {
          ($e = e.onChunk) == null || $e.call(e, ue.data);
        } catch {
        }
      }
      try {
        (Qe = e.onStats) == null || Qe.call(e, { elapsedMs: Ct(), bytes: Dt });
      } catch {
      }
      Dt >= r.maxBytes && P();
    };
    let vt;
    const Ft = new Promise((ue) => {
      vt = ue;
    }), et = M;
    return at.onstop = async () => {
      G && t.caf(G), oe && (t.clearInterval(oe), oe = 0), Jt && (t.clearInterval(Jt), Jt = 0);
      try {
        typeof document < "u" && document.removeEventListener("visibilitychange", Be);
      } catch {
      }
      const ue = Ct();
      et();
      try {
        a.srcObject = null;
      } catch {
      }
      try {
        h.srcObject = null;
      } catch {
      }
      u("stopped");
      const $e = new Blob(Rt, { type: s.split(";")[0] });
      let Qe = $e;
      if (ue > 0 && ($e.type.includes("webm") || s.includes("webm")))
        try {
          Qe = await Vg($e, ue);
        } catch {
          Qe = $e;
        }
      const _t = se.width && se.width > 0 ? se.width : l.width, Le = se.height && se.height > 0 ? se.height : l.height;
      vt({
        id: c,
        blob: Qe,
        mime: (Qe.type || s || "video/webm").split(";")[0],
        durationMs: ue,
        bytes: Qe.size || Dt,
        width: Ae ? l.width : _t,
        height: Ae ? l.height : Le,
        screenOnly: Ue,
        hadCamera: Ae,
        hadAudio: Se
      });
    }, at.start(1e3), Tt = t.now(), u("recording"), Jt = t.setInterval(() => {
      var $e;
      const ue = Ct();
      try {
        ($e = e.onStats) == null || $e.call(e, { elapsedMs: ue, bytes: Dt });
      } catch {
      }
      ue >= r.maxDurationMs && P();
    }, 200), {
      pause() {
        if (p === "recording") {
          try {
            at.pause();
          } catch {
          }
          kt = t.now(), u("paused");
        }
      },
      resume() {
        if (p === "paused") {
          try {
            at.resume();
          } catch {
          }
          Pe += t.now() - kt, kt = 0, u("recording");
        }
      },
      stop() {
        P();
      },
      state() {
        return p;
      },
      screenOnly() {
        return Ue;
      },
      // KLA-602(b): expose the live camera stream ONLY when the camera is genuinely part of the capture, so the
      // overlay can mount a self-view bubble. Screen-only / audio-only(mic) fallbacks return null → no bubble.
      cameraStream() {
        return Ae && y ? y : null;
      },
      done: Ft
    };
  } catch (P) {
    throw M(), P;
  }
}
function ny(e) {
  return new Promise((t, r) => {
    try {
      const n = new FileReader();
      n.onload = () => t(String(n.result)), n.onerror = () => r(n.error || new Error("read failed")), n.readAsDataURL(e);
    } catch (n) {
      r(n);
    }
  });
}
async function iy(e) {
  return {
    id: e.id,
    dataUrl: await ny(e.blob),
    blob: e.blob,
    mime: (e.mime || "video/webm").split(";")[0],
    durationMs: Math.round(e.durationMs),
    bytes: e.bytes,
    width: e.width,
    height: e.height,
    screenOnly: e.screenOnly
  };
}
function oy(e) {
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
  let n = !1, i = 0, o = 0, s = 0, c = 0;
  const l = (u) => {
    var f;
    n = !0, t.style.cursor = "grabbing";
    const m = t.getBoundingClientRect();
    s = m.left, c = m.top, i = u.clientX, o = u.clientY, t.style.right = "auto", t.style.bottom = "auto", t.style.left = s + "px", t.style.top = c + "px";
    try {
      (f = t.setPointerCapture) == null || f.call(t, u.pointerId);
    } catch {
    }
  }, d = (u) => {
    n && (t.style.left = Math.max(0, s + (u.clientX - i)) + "px", t.style.top = Math.max(0, c + (u.clientY - o)) + "px");
  }, a = () => {
    n = !1, t.style.cursor = "grab";
  };
  return t.addEventListener("pointerdown", l), t.addEventListener("pointermove", d), t.addEventListener("pointerup", a), t;
}
async function sy(e = {}) {
  if (typeof document > "u") return null;
  const t = e.deps ?? Qs();
  return Ju(t) ? new Promise((r) => {
    const n = document.createElement("div");
    n.setAttribute("data-klavity-ui", "recorder");
    const i = document.createElement("div");
    n.appendChild(i), document.body.appendChild(n);
    const o = 'font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#19140f', s = (w) => {
      w === "bar" ? (n.style.cssText = `position:fixed;inset:0;z-index:2147483647;pointer-events:none;${o}`, i.style.cssText = "position:fixed;right:20px;top:50%;transform:translateY(-50%);pointer-events:auto;background:#f5f3ee;border:1px solid #e3ddd1;border-radius:14px;box-shadow:0 12px 40px rgba(28,22,40,.32);overflow:hidden;max-width:min(240px,80vw)") : (n.style.cssText = `position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;background:rgba(10,8,14,.55);${o}`, i.style.cssText = "width:360px;max-width:92vw;background:#f5f3ee;border:1px solid #e3ddd1;border-radius:12px;box-shadow:0 20px 60px rgba(28,22,40,.28);overflow:hidden");
    }, c = (w) => {
      var T;
      try {
        (T = e.onPhase) == null || T.call(e, w);
      } catch {
      }
    };
    s("modal");
    let l = !1, d = null, a = !1;
    const h = () => {
      try {
        d == null || d.stop();
      } catch {
      }
    }, p = (w) => {
      w.key === "Escape" && (w.stopPropagation(), w.preventDefault(), f(null));
    }, u = () => {
      h();
    }, m = (w) => {
      a && w.target === n && (w.preventDefault(), w.stopPropagation(), f(null));
    };
    n.addEventListener("pointerdown", m), document.addEventListener("keydown", p, { capture: !0 }), typeof window < "u" && (window.addEventListener("pagehide", u), window.addEventListener("beforeunload", u));
    const f = (w) => {
      if (!l) {
        l = !0, h(), n.removeEventListener("pointerdown", m), document.removeEventListener("keydown", p, { capture: !0 }), typeof window < "u" && (window.removeEventListener("pagehide", u), window.removeEventListener("beforeunload", u));
        try {
          n.remove();
        } catch {
        }
        r(w);
      }
    }, y = (w) => {
      const T = Math.max(0, Math.round(w / 1e3));
      return `${Math.floor(T / 60)}:${String(T % 60).padStart(2, "0")}`;
    }, M = (w) => `${(w / 1048576).toFixed(1)} MB`, v = { ...Xu, ...e.caps || {} }, b = () => {
      s("modal"), c("consent"), a = !0, i.setAttribute("role", "dialog"), i.setAttribute("aria-modal", "true"), i.setAttribute("aria-label", "Record a walkthrough");
      const w = e.defaultCamera === !0 ? " checked" : "";
      i.innerHTML = `<div style="padding:14px;border-bottom:1px solid #e3ddd1;font-weight:600">Record a walkthrough</div><div style="padding:14px"><label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="klr-screen" checked disabled> Share my <b>screen</b></label><label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="klr-cam"${w}> Camera <span style="font-size:9px;font-weight:800;color:#fff;background:#6366f1;padding:1px 5px;border-radius:999px">optional</span></label><label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="klr-mic" checked> Microphone (narration)</label><div style="display:flex;gap:8px;margin-top:10px"><button id="klr-start" style="padding:8px 13px;border-radius:8px;border:1px solid #dc2626;background:#dc2626;color:#fff;font-weight:600;cursor:pointer">Start recording</button><button id="klr-cancel" style="padding:8px 13px;border-radius:8px;border:1px solid #e3ddd1;background:#fffdf8;font-weight:600;cursor:pointer">Cancel</button></div><p style="font-size:11px;color:#574f45;margin-top:8px;padding:8px;background:#efeadf;border-radius:8px;border:1px solid #e3ddd1">Tip: to capture steps across <b>multiple pages/tabs</b>, choose <b>&quot;Entire Screen&quot;</b> in the next dialog. Sharing a single tab will not follow you when you switch tabs.</p><p style="font-size:11px;color:#574f45;margin-top:8px">Your browser will ask to share a tab/screen. Max ${Math.round(v.maxDurationMs / 6e4)} min. Nothing uploads until you attach it.</p><div id="klr-hint"></div></div>`, i.querySelector("#klr-cancel").onclick = () => f(null), i.querySelector("#klr-start").onclick = () => {
        const T = i.querySelector("#klr-cam").checked, N = i.querySelector("#klr-mic").checked;
        A(T, N);
      };
    }, A = async (w, T) => {
      var U;
      let N = null;
      try {
        d = await ry({
          wantCamera: w,
          wantMic: T,
          caps: e.caps,
          onFallback: (z) => {
            N = z;
          },
          onStats: ({ elapsedMs: z, bytes: ee }) => {
            const W = i.querySelector("#klr-timer");
            W && (W.textContent = "REC " + y(z));
            const O = i.querySelector("#klr-meta");
            O && (O.innerHTML = `${y(Math.max(0, v.maxDurationMs - z))} left<br>~${M(ee)}`);
          }
        }, t);
      } catch {
        f(null);
        return;
      }
      S(N);
      try {
        const z = oy((U = d == null ? void 0 : d.cameraStream) == null ? void 0 : U.call(d));
        z && n.appendChild(z);
      } catch {
      }
      d.done.then(async (z) => {
        f(await iy(z));
      });
    }, S = (w) => {
      const T = w === "camera-blocked", U = T ? '<div style="padding:0 14px 10px;font-size:11px;color:#574f45">Camera blocked by this site — recording <b>screen + mic narration</b>.</div>' : !!w && !T ? '<div style="padding:0 14px 10px;font-size:11px;color:#574f45">Camera/mic blocked — recording <b>screen only</b>. Narrate by typing, or use the extension.</div>' : "";
      s("bar"), c("recording"), a = !1, i.removeAttribute("role"), i.removeAttribute("aria-modal"), i.removeAttribute("aria-label"), i.innerHTML = '<div style="display:flex;flex-direction:column;gap:9px;padding:12px 14px;min-width:180px"><span style="display:inline-flex;align-items:center;gap:7px;font-weight:700;white-space:nowrap"><span aria-hidden="true" style="width:10px;height:10px;border-radius:50%;background:#e11;flex:none"></span><span id="klr-timer">REC 0:00</span></span><button id="klr-stop" aria-label="Stop recording" title="Stop recording" style="display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:12px 16px;border-radius:10px;border:1px solid #dc2626;background:#dc2626;color:#fff;font-weight:700;font-size:15px;cursor:pointer"><span aria-hidden="true" style="width:12px;height:12px;border-radius:2px;background:#fff;flex:none"></span>Stop recording</button><button id="klr-pause" style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid #e3ddd1;background:#fffdf8;font-weight:600;cursor:pointer">Pause</button><span id="klr-meta" style="font-size:11px;color:#574f45;text-align:center;white-space:nowrap"></span></div>' + U;
      const z = i.querySelector("#klr-pause");
      z.onclick = () => {
        d && (d.state() === "recording" ? (d.pause(), z.textContent = "Resume") : (d.resume(), z.textContent = "Pause"));
      }, i.querySelector("#klr-stop").onclick = () => d == null ? void 0 : d.stop();
    };
    b();
  }) : null;
}
async function zl(e, t = {}) {
  const r = t.maxWidth ?? 2e3, n = t.quality ?? 0.82;
  if (e.startsWith("data:image/jpeg") || typeof document > "u" || !e.startsWith("data:image/")) return e;
  try {
    const i = await new Promise((m, f) => {
      const y = new Image();
      y.onload = () => m(y), y.onerror = f, y.src = e;
    }), o = i.naturalWidth, s = i.naturalHeight, c = 16e3;
    let l = o > r ? r / o : 1;
    s * l > c && (l = c / s);
    const d = Math.round(o * l), a = Math.round(s * l), h = document.createElement("canvas");
    h.width = d, h.height = a;
    const p = h.getContext("2d");
    if (!p) return e;
    p.fillStyle = "#fff", p.fillRect(0, 0, d, a), p.drawImage(i, 0, 0, d, a);
    const u = h.toDataURL("image/jpeg", n);
    return u.length < e.length ? u : e;
  } catch {
    return e;
  }
}
async function ay(e, t = {}) {
  const r = t.maxWidth ?? 320, n = t.quality ?? 0.6;
  if (typeof document > "u" || !e.startsWith("data:image/")) return e;
  try {
    const i = await new Promise((u, m) => {
      const f = new Image();
      f.onload = () => u(f), f.onerror = m, f.src = e;
    }), o = i.naturalWidth, s = i.naturalHeight;
    if (!o || !s) return e;
    const c = o > r ? r / o : 1, l = Math.round(o * c), d = Math.round(s * c), a = document.createElement("canvas");
    a.width = l, a.height = d;
    const h = a.getContext("2d");
    if (!h) return e;
    h.fillStyle = "#fff", h.fillRect(0, 0, l, d), h.drawImage(i, 0, 0, l, d);
    const p = a.toDataURL("image/jpeg", n);
    return p.length < e.length ? p : e;
  } catch {
    return e;
  }
}
var ly = Object.defineProperty, cy = (e, t, r) => t in e ? ly(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, j = (e, t, r) => cy(e, typeof t != "symbol" ? t + "" : t, r), Dl, uy = Object.defineProperty, dy = (e, t, r) => t in e ? uy(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, Fl = (e, t, r) => dy(e, typeof t != "symbol" ? t + "" : t, r), rt = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(rt || {});
const Ul = {
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
}, Bl = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, ci = {}, Zu = {}, py = () => !!globalThis.Zone;
function ea(e) {
  if (ci[e])
    return ci[e];
  const t = globalThis[e], r = t.prototype, n = e in Ul ? Ul[e] : void 0, i = !!(n && // @ts-expect-error 2345
  n.every(
    (c) => {
      var l, d;
      return !!((d = (l = Object.getOwnPropertyDescriptor(r, c)) == null ? void 0 : l.get) != null && d.toString().includes("[native code]"));
    }
  )), o = e in Bl ? Bl[e] : void 0, s = !!(o && o.every(
    // @ts-expect-error 2345
    (c) => {
      var l;
      return typeof r[c] == "function" && ((l = r[c]) == null ? void 0 : l.toString().includes("[native code]"));
    }
  ));
  if (i && s && !py())
    return ci[e] = t.prototype, t.prototype;
  try {
    const c = document.createElement("iframe");
    c.style.display = "none", document.body.appendChild(c);
    const l = c.contentWindow;
    if (!l) return t.prototype;
    const d = l[e].prototype;
    if (!d)
      return c.remove(), r;
    const a = navigator.userAgent;
    return a.includes("Safari") && !a.includes("Chrome") ? (c.classList.add("rr-block"), c.setAttribute("__rrwebUntaintedMutationObserver", ""), Zu[e] = () => c.remove()) : c.remove(), ci[e] = d;
  } catch {
    return r;
  }
}
const To = {};
function ur(e, t, r) {
  var n;
  const i = `${e}.${String(r)}`;
  if (To[i])
    return To[i].call(
      t
    );
  const o = ea(e), s = (n = Object.getOwnPropertyDescriptor(
    o,
    r
  )) == null ? void 0 : n.get;
  return s ? (To[i] = s, s.call(t)) : t[r];
}
const Ao = {};
function Qu(e, t, r) {
  const n = `${e}.${String(r)}`;
  if (Ao[n])
    return Ao[n].bind(
      t
    );
  const o = ea(e)[r];
  return typeof o != "function" ? t[r] : (Ao[n] = o, o.bind(t));
}
function hy(e) {
  return ur("Node", e, "ownerDocument");
}
function fy(e) {
  return ur("Node", e, "childNodes");
}
function my(e) {
  return ur("Node", e, "parentNode");
}
function gy(e) {
  return ur("Node", e, "parentElement");
}
function yy(e) {
  return ur("Node", e, "textContent");
}
function by(e, t) {
  return Qu("Node", e, "contains")(t);
}
function ky(e) {
  return Qu("Node", e, "getRootNode")();
}
function vy(e) {
  return !e || !("host" in e) ? null : ur("ShadowRoot", e, "host");
}
function wy(e) {
  return e.styleSheets;
}
function xy(e) {
  return !e || !("shadowRoot" in e) ? null : ur("Element", e, "shadowRoot");
}
function Sy(e, t) {
  return ur("Element", e, "querySelector")(t);
}
function Ey(e, t) {
  return ur("Element", e, "querySelectorAll")(t);
}
function Cy() {
  return [
    ea("MutationObserver").constructor,
    Zu.MutationObserver ?? (() => {
    })
  ];
}
let ed = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (ed = () => (/* @__PURE__ */ new Date()).getTime());
function My(e, t, r) {
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
const ht = {
  ownerDocument: hy,
  childNodes: fy,
  parentNode: my,
  parentElement: gy,
  textContent: yy,
  contains: by,
  getRootNode: ky,
  host: vy,
  styleSheets: wy,
  shadowRoot: xy,
  querySelector: Sy,
  querySelectorAll: Ey,
  nowTimestamp: ed,
  mutationObserverCtor: Cy,
  patch: My
};
function td(e) {
  return e.nodeType === e.ELEMENT_NODE;
}
function On(e) {
  const t = (
    // anchor and textarea elements also have a `host` property
    // but only shadow roots have a `mode` property
    e && "host" in e && "mode" in e && ht.host(e) || null
  );
  return !!(t && "shadowRoot" in t && ht.shadowRoot(t) === e);
}
function Nn(e) {
  return Object.prototype.toString.call(e) === "[object ShadowRoot]";
}
function Ry(e) {
  return e.includes(" background-clip: text;") && !e.includes(" -webkit-background-clip: text;") && (e = e.replace(
    /\sbackground-clip:\s*text;/g,
    " -webkit-background-clip: text; background-clip: text;"
  )), e;
}
function Ty(e) {
  const { cssText: t } = e;
  if (t.split('"').length < 3) return t;
  const r = ["@import", `url(${JSON.stringify(e.href)})`];
  return e.layerName === "" ? r.push("layer") : e.layerName && r.push(`layer(${e.layerName})`), e.supportsText && r.push(`supports(${e.supportsText})`), e.media.length && r.push(e.media.mediaText), r.join(" ") + ";";
}
function qs(e) {
  try {
    const t = e.rules || e.cssRules;
    if (!t)
      return null;
    let r = e.href;
    !r && e.ownerNode && (r = e.ownerNode.baseURI);
    const n = Array.from(
      t,
      (i) => rd(i, r)
    ).join("");
    return Ry(n);
  } catch {
    return null;
  }
}
function rd(e, t) {
  if (_y(e)) {
    let r;
    try {
      r = // for same-origin stylesheets,
      // we can access the imported stylesheet rules directly
      qs(e.styleSheet) || // work around browser issues with the raw string `@import url(...)` statement
      Ty(e);
    } catch {
      r = e.cssText;
    }
    return e.styleSheet.href ? Ai(r, e.styleSheet.href) : r;
  } else {
    let r = e.cssText;
    return Ly(e) && e.selectorText.includes(":") && (r = Ay(r)), t ? Ai(r, t) : r;
  }
}
function Ay(e) {
  const t = /(\[(?:[\w-]+)[^\\])(:(?:[\w-]+)\])/gm;
  return e.replace(t, "$1\\$2");
}
function _y(e) {
  return "styleSheet" in e;
}
function Ly(e) {
  return "selectorText" in e;
}
class nd {
  constructor() {
    Fl(this, "idNodeMap", /* @__PURE__ */ new Map()), Fl(this, "nodeMetaMap", /* @__PURE__ */ new WeakMap());
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
function Iy() {
  return new nd();
}
function Ri({
  element: e,
  maskInputOptions: t,
  tagName: r,
  type: n,
  value: i,
  maskInputFn: o
}) {
  let s = i || "";
  const c = n && Ur(n);
  return (t[r.toLowerCase()] || c && t[c]) && (o ? s = o(s, e) : s = "*".repeat(s.length)), s;
}
function Ur(e) {
  return e.toLowerCase();
}
const ql = "__rrweb_original__";
function Oy(e) {
  const t = e.getContext("2d");
  if (!t) return !0;
  const r = 50;
  for (let n = 0; n < e.width; n += r)
    for (let i = 0; i < e.height; i += r) {
      const o = t.getImageData, s = ql in o ? o[ql] : o;
      if (new Uint32Array(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        s.call(
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
function Ti(e) {
  const t = e.type;
  return e.hasAttribute("data-rr-is-password") ? "password" : t ? (
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    Ur(t)
  ) : null;
}
function id(e, t) {
  let r;
  try {
    r = new URL(e, t ?? window.location.href);
  } catch {
    return null;
  }
  const n = /\.([0-9a-z]+)(?:$)/i, i = r.pathname.match(n);
  return (i == null ? void 0 : i[1]) ?? null;
}
function Ny(e) {
  let t = "";
  return e.indexOf("//") > -1 ? t = e.split("/").slice(0, 3).join("/") : t = e.split("/")[0], t = t.split("?")[0], t;
}
const Py = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm, $y = /^(?:[a-z+]+:)?\/\//i, zy = /^www\..*/i, Dy = /^(data:)([^,]*),(.*)/i;
function Ai(e, t) {
  return (e || "").replace(
    Py,
    (r, n, i, o, s, c) => {
      const l = i || s || c, d = n || o || "";
      if (!l)
        return r;
      if ($y.test(l) || zy.test(l))
        return `url(${d}${l}${d})`;
      if (Dy.test(l))
        return `url(${d}${l}${d})`;
      if (l[0] === "/")
        return `url(${d}${Ny(t) + l}${d})`;
      const a = t.split("/"), h = l.split("/");
      a.pop();
      for (const p of h)
        p !== "." && (p === ".." ? a.pop() : a.push(p));
      return `url(${d}${a.join("/")}${d})`;
    }
  );
}
function ui(e, t = !1) {
  return t ? e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "") : e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "").replace(/0px/g, "0");
}
function Fy(e, t, r = !1) {
  const n = Array.from(t.childNodes), i = [];
  let o = 0;
  if (n.length > 1 && e && typeof e == "string") {
    let s = ui(e, r);
    const c = s.length / e.length;
    for (let l = 1; l < n.length; l++)
      if (n[l].textContent && typeof n[l].textContent == "string") {
        const d = ui(
          n[l].textContent,
          r
        ), a = 100;
        let h = 3;
        for (; h < d.length && // keep consuming css identifiers (to get a decent chunk more quickly)
        (d[h].match(/[a-zA-Z0-9]/) || // substring needs to be unique to this section
        d.indexOf(d.substring(0, h), 1) !== -1); h++)
          ;
        for (; h < d.length; h++) {
          let p = d.substring(0, h), u = s.split(p), m = -1;
          if (u.length === 2)
            m = u[0].length;
          else if (u.length > 2 && u[0] === "" && n[l - 1].textContent !== "")
            m = s.indexOf(p, 1);
          else if (u.length === 1) {
            if (p = p.substring(
              0,
              p.length - 1
            ), u = s.split(p), u.length <= 1)
              return i.push(e), i;
            h = a + 1;
          } else h === d.length - 1 && (m = s.indexOf(p));
          if (u.length >= 2 && h > a) {
            const f = n[l - 1].textContent;
            if (f && typeof f == "string") {
              const y = ui(f).length;
              m = s.indexOf(p, y);
            }
            m === -1 && (m = u[0].length);
          }
          if (m !== -1) {
            let f = Math.floor(m / c);
            for (; f > 0 && f < e.length; ) {
              if (o += 1, o > 50 * n.length)
                return i.push(e), i;
              const y = ui(
                e.substring(0, f),
                r
              );
              if (y.length === m) {
                i.push(e.substring(0, f)), e = e.substring(f), s = s.substring(m);
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
function Uy(e, t) {
  return Fy(e, t).join("/* rr_split */");
}
let By = 1;
const qy = new RegExp("[^a-z0-9-_:]"), Fn = -2;
function od() {
  return By++;
}
function Wy(e) {
  if (e instanceof HTMLFormElement)
    return "form";
  const t = Ur(e.tagName);
  return qy.test(t) ? "div" : t;
}
let tn, Wl;
const jy = /^[^ \t\n\r\u000c]+/, Hy = /^[, \t\n\r\u000c]+/;
function Yy(e, t) {
  if (t.trim() === "")
    return t;
  let r = 0;
  function n(o) {
    let s;
    const c = o.exec(t.substring(r));
    return c ? (s = c[0], r += s.length, s) : "";
  }
  const i = [];
  for (; n(Hy), !(r >= t.length); ) {
    let o = n(jy);
    if (o.slice(-1) === ",")
      o = an(e, o.substring(0, o.length - 1)), i.push(o);
    else {
      let s = "";
      o = an(e, o);
      let c = !1;
      for (; ; ) {
        const l = t.charAt(r);
        if (l === "") {
          i.push((o + s).trim());
          break;
        } else if (c)
          l === ")" && (c = !1);
        else if (l === ",") {
          r += 1, i.push((o + s).trim());
          break;
        } else l === "(" && (c = !0);
        s += l, r += 1;
      }
    }
  }
  return i.join(", ");
}
const jl = /* @__PURE__ */ new WeakMap();
function an(e, t) {
  return !t || t.trim() === "" ? t : ta(e, t);
}
function Vy(e) {
  return !!(e.tagName === "svg" || e.ownerSVGElement);
}
function ta(e, t) {
  let r = jl.get(e);
  if (r || (r = e.createElement("a"), jl.set(e, r)), !t)
    t = "";
  else if (t.startsWith("blob:") || t.startsWith("data:"))
    return t;
  return r.setAttribute("href", t), r.href;
}
function sd(e, t, r, n) {
  return n && (r === "src" || r === "href" && !(t === "use" && n[0] === "#") || r === "xlink:href" && n[0] !== "#" || r === "background" && ["table", "td", "th"].includes(t) ? an(e, n) : r === "srcset" ? Yy(e, n) : r === "style" ? Ai(n, ta(e)) : t === "object" && r === "data" ? an(e, n) : n);
}
function ad(e, t, r) {
  return ["video", "audio"].includes(e) && t === "autoplay";
}
function Gy(e, t, r) {
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
function _i(e, t, r) {
  if (!e) return !1;
  if (e.nodeType !== e.ELEMENT_NODE)
    return r ? _i(ht.parentNode(e), t, r) : !1;
  for (let n = e.classList.length; n--; ) {
    const i = e.classList[n];
    if (t.test(i))
      return !0;
  }
  return r ? _i(ht.parentNode(e), t, r) : !1;
}
function ld(e, t, r, n) {
  let i;
  if (td(e)) {
    if (i = e, !ht.childNodes(i).length)
      return !1;
  } else {
    if (ht.parentElement(e) === null)
      return !1;
    i = ht.parentElement(e);
  }
  try {
    if (typeof t == "string") {
      if (n) {
        if (i.closest(`.${t}`)) return !0;
      } else if (i.classList.contains(t)) return !0;
    } else if (_i(i, t, n)) return !0;
    if (r) {
      if (n) {
        if (i.closest(r)) return !0;
      } else if (i.matches(r)) return !0;
    }
  } catch {
  }
  return !1;
}
function Ky(e, t, r) {
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
  const s = "about:blank";
  if (n.location.href !== s || e.src === s || e.src === "")
    return setTimeout(t, 0), e.addEventListener("load", t);
  e.addEventListener("load", t);
}
function Xy(e, t, r) {
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
function Jy(e, t) {
  const {
    doc: r,
    mirror: n,
    blockClass: i,
    blockSelector: o,
    needsMask: s,
    inlineStylesheet: c,
    maskInputOptions: l = {},
    maskTextFn: d,
    maskInputFn: a,
    dataURLOptions: h = {},
    inlineImages: p,
    recordCanvas: u,
    keepIframeSrcFn: m,
    newlyAddedElement: f = !1,
    cssCaptured: y = !1
  } = t, M = Zy(r, n);
  switch (e.nodeType) {
    case e.DOCUMENT_NODE:
      return e.compatMode !== "CSS1Compat" ? {
        type: rt.Document,
        childNodes: [],
        compatMode: e.compatMode
        // probably "BackCompat"
      } : {
        type: rt.Document,
        childNodes: []
      };
    case e.DOCUMENT_TYPE_NODE:
      return {
        type: rt.DocumentType,
        name: e.name,
        publicId: e.publicId,
        systemId: e.systemId,
        rootId: M
      };
    case e.ELEMENT_NODE:
      return eb(e, {
        doc: r,
        blockClass: i,
        blockSelector: o,
        inlineStylesheet: c,
        maskInputOptions: l,
        maskInputFn: a,
        dataURLOptions: h,
        inlineImages: p,
        recordCanvas: u,
        keepIframeSrcFn: m,
        newlyAddedElement: f,
        rootId: M
      });
    case e.TEXT_NODE:
      return Qy(e, {
        doc: r,
        needsMask: s,
        maskTextFn: d,
        rootId: M,
        cssCaptured: y
      });
    case e.CDATA_SECTION_NODE:
      return {
        type: rt.CDATA,
        textContent: "",
        rootId: M
      };
    case e.COMMENT_NODE:
      return {
        type: rt.Comment,
        textContent: ht.textContent(e) || "",
        rootId: M
      };
    default:
      return !1;
  }
}
function Zy(e, t) {
  if (!t.hasNode(e)) return;
  const r = t.getId(e);
  return r === 1 ? void 0 : r;
}
function Qy(e, t) {
  const { needsMask: r, maskTextFn: n, rootId: i, cssCaptured: o } = t, s = ht.parentNode(e), c = s && s.tagName;
  let l = "";
  const d = c === "STYLE" ? !0 : void 0, a = c === "SCRIPT" ? !0 : void 0;
  return a ? l = "SCRIPT_PLACEHOLDER" : o || (l = ht.textContent(e), d && l && (l = Ai(l, ta(t.doc)))), !d && !a && l && r && (l = n ? n(l, ht.parentElement(e)) : l.replace(/[\S]/g, "*")), {
    type: rt.Text,
    textContent: l || "",
    rootId: i
  };
}
function eb(e, t) {
  const {
    doc: r,
    blockClass: n,
    blockSelector: i,
    inlineStylesheet: o,
    maskInputOptions: s = {},
    maskInputFn: c,
    dataURLOptions: l = {},
    inlineImages: d,
    recordCanvas: a,
    keepIframeSrcFn: h,
    newlyAddedElement: p = !1,
    rootId: u
  } = t, m = Gy(e, n, i), f = Wy(e);
  let y = {};
  const M = e.attributes.length;
  for (let b = 0; b < M; b++) {
    const A = e.attributes[b];
    ad(f, A.name, A.value) || (y[A.name] = sd(
      r,
      f,
      Ur(A.name),
      A.value
    ));
  }
  if (f === "link" && o) {
    const b = Array.from(r.styleSheets).find((S) => S.href === e.href);
    let A = null;
    b && (A = qs(b)), A && (delete y.rel, delete y.href, y._cssText = A);
  }
  if (f === "style" && e.sheet) {
    let b = qs(
      e.sheet
    );
    b && (e.childNodes.length > 1 && (b = Uy(b, e)), y._cssText = b);
  }
  if (["input", "textarea", "select"].includes(f)) {
    const b = e.value, A = e.checked;
    y.type !== "radio" && y.type !== "checkbox" && y.type !== "submit" && y.type !== "button" && b ? y.value = Ri({
      element: e,
      type: Ti(e),
      tagName: f,
      value: b,
      maskInputOptions: s,
      maskInputFn: c
    }) : A && (y.checked = A);
  }
  if (f === "option" && (e.selected && !s.select ? y.selected = !0 : delete y.selected), f === "dialog" && e.open && (y.rr_open_mode = e.matches("dialog:modal") ? "modal" : "non-modal"), f === "canvas" && a) {
    if (e.__context === "2d")
      Oy(e) || (y.rr_dataURL = e.toDataURL(
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
  if (f === "img" && d) {
    tn || (tn = r.createElement("canvas"), Wl = tn.getContext("2d"));
    const b = e, A = b.currentSrc || b.getAttribute("src") || "<unknown-src>", S = b.crossOrigin, w = () => {
      b.removeEventListener("load", w);
      try {
        tn.width = b.naturalWidth, tn.height = b.naturalHeight, Wl.drawImage(b, 0, 0), y.rr_dataURL = tn.toDataURL(
          l.type,
          l.quality
        );
      } catch (T) {
        if (b.crossOrigin !== "anonymous") {
          b.crossOrigin = "anonymous", b.complete && b.naturalWidth !== 0 ? w() : b.addEventListener("load", w);
          return;
        } else
          console.warn(
            `Cannot inline img src=${A}! Error: ${T}`
          );
      }
      b.crossOrigin === "anonymous" && (S ? y.crossOrigin = S : b.removeAttribute("crossorigin"));
    };
    b.complete && b.naturalWidth !== 0 ? w() : b.addEventListener("load", w);
  }
  if (["audio", "video"].includes(f)) {
    const b = y;
    b.rr_mediaState = e.paused ? "paused" : "played", b.rr_mediaCurrentTime = e.currentTime, b.rr_mediaPlaybackRate = e.playbackRate, b.rr_mediaMuted = e.muted, b.rr_mediaLoop = e.loop, b.rr_mediaVolume = e.volume;
  }
  if (p || (e.scrollLeft && (y.rr_scrollLeft = e.scrollLeft), e.scrollTop && (y.rr_scrollTop = e.scrollTop)), m) {
    const { width: b, height: A } = e.getBoundingClientRect();
    y = {
      class: y.class,
      rr_width: `${b}px`,
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
    type: rt.Element,
    tagName: f,
    attributes: y,
    childNodes: [],
    isSVG: Vy(e) || void 0,
    needBlock: m,
    rootId: u,
    isCustom: v
  };
}
function qe(e) {
  return e == null ? "" : e.toLowerCase();
}
function cd(e) {
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
function tb(e, t) {
  if (t.comment && e.type === rt.Comment)
    return !0;
  if (e.type === rt.Element) {
    if (t.script && // script tag
    (e.tagName === "script" || // (module)preload link
    e.tagName === "link" && (e.attributes.rel === "preload" && e.attributes.as === "script" || e.attributes.rel === "modulepreload") || // prefetch link
    e.tagName === "link" && e.attributes.rel === "prefetch" && typeof e.attributes.href == "string" && id(e.attributes.href) === "js"))
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
function ln(e, t) {
  const {
    doc: r,
    mirror: n,
    blockClass: i,
    blockSelector: o,
    maskTextClass: s,
    maskTextSelector: c,
    skipChild: l = !1,
    inlineStylesheet: d = !0,
    maskInputOptions: a = {},
    maskTextFn: h,
    maskInputFn: p,
    slimDOMOptions: u,
    dataURLOptions: m = {},
    inlineImages: f = !1,
    recordCanvas: y = !1,
    onSerialize: M,
    onIframeLoad: v,
    iframeLoadTimeout: b = 5e3,
    onStylesheetLoad: A,
    stylesheetLoadTimeout: S = 5e3,
    keepIframeSrcFn: w = () => !1,
    newlyAddedElement: T = !1,
    cssCaptured: N = !1
  } = t;
  let { needsMask: U } = t, { preserveWhiteSpace: z = !0 } = t;
  U || (U = ld(
    e,
    s,
    c,
    U === void 0
  ));
  const ee = Jy(e, {
    doc: r,
    mirror: n,
    blockClass: i,
    blockSelector: o,
    needsMask: U,
    inlineStylesheet: d,
    maskInputOptions: a,
    maskTextFn: h,
    maskInputFn: p,
    dataURLOptions: m,
    inlineImages: f,
    recordCanvas: y,
    keepIframeSrcFn: w,
    newlyAddedElement: T,
    cssCaptured: N
  });
  if (!ee)
    return console.warn(e, "not serialized"), null;
  let W;
  n.hasNode(e) ? W = n.getId(e) : tb(ee, u) || !z && ee.type === rt.Text && !ee.textContent.replace(/^\s+|\s+$/gm, "").length ? W = Fn : W = od();
  const O = Object.assign(ee, { id: W });
  if (n.add(e, O), W === Fn)
    return null;
  M && M(e);
  let nt = !l;
  if (O.type === rt.Element) {
    nt = nt && !O.needBlock, delete O.needBlock;
    const fe = ht.shadowRoot(e);
    fe && Nn(fe) && (O.isShadowHost = !0);
  }
  if ((O.type === rt.Document || O.type === rt.Element) && nt) {
    u.headWhitespace && O.type === rt.Element && O.tagName === "head" && (z = !1);
    const fe = {
      doc: r,
      mirror: n,
      blockClass: i,
      blockSelector: o,
      needsMask: U,
      maskTextClass: s,
      maskTextSelector: c,
      skipChild: l,
      inlineStylesheet: d,
      maskInputOptions: a,
      maskTextFn: h,
      maskInputFn: p,
      slimDOMOptions: u,
      dataURLOptions: m,
      inlineImages: f,
      recordCanvas: y,
      preserveWhiteSpace: z,
      onSerialize: M,
      onIframeLoad: v,
      iframeLoadTimeout: b,
      onStylesheetLoad: A,
      stylesheetLoadTimeout: S,
      keepIframeSrcFn: w,
      cssCaptured: !1
    };
    if (!(O.type === rt.Element && O.tagName === "textarea" && O.attributes.value !== void 0)) {
      O.type === rt.Element && O.attributes._cssText !== void 0 && typeof O.attributes._cssText == "string" && (fe.cssCaptured = !0);
      for (const Re of Array.from(ht.childNodes(e))) {
        const Fe = ln(Re, fe);
        Fe && O.childNodes.push(Fe);
      }
    }
    let pe = null;
    if (td(e) && (pe = ht.shadowRoot(e)))
      for (const Re of Array.from(ht.childNodes(pe))) {
        const Fe = ln(Re, fe);
        Fe && (Nn(pe) && (Fe.isShadow = !0), O.childNodes.push(Fe));
      }
  }
  const Ke = ht.parentNode(e);
  return Ke && On(Ke) && Nn(Ke) && (O.isShadow = !0), O.type === rt.Element && O.tagName === "iframe" && Ky(
    e,
    () => {
      const fe = e.contentDocument;
      if (fe && v) {
        const pe = ln(fe, {
          doc: fe,
          mirror: n,
          blockClass: i,
          blockSelector: o,
          needsMask: U,
          maskTextClass: s,
          maskTextSelector: c,
          skipChild: !1,
          inlineStylesheet: d,
          maskInputOptions: a,
          maskTextFn: h,
          maskInputFn: p,
          slimDOMOptions: u,
          dataURLOptions: m,
          inlineImages: f,
          recordCanvas: y,
          preserveWhiteSpace: z,
          onSerialize: M,
          onIframeLoad: v,
          iframeLoadTimeout: b,
          onStylesheetLoad: A,
          stylesheetLoadTimeout: S,
          keepIframeSrcFn: w
        });
        pe && v(
          e,
          pe
        );
      }
    },
    b
  ), O.type === rt.Element && O.tagName === "link" && typeof O.attributes.rel == "string" && (O.attributes.rel === "stylesheet" || O.attributes.rel === "preload" && typeof O.attributes.href == "string" && id(O.attributes.href) === "css") && Xy(
    e,
    () => {
      if (A) {
        const fe = ln(e, {
          doc: r,
          mirror: n,
          blockClass: i,
          blockSelector: o,
          needsMask: U,
          maskTextClass: s,
          maskTextSelector: c,
          skipChild: !1,
          inlineStylesheet: d,
          maskInputOptions: a,
          maskTextFn: h,
          maskInputFn: p,
          slimDOMOptions: u,
          dataURLOptions: m,
          inlineImages: f,
          recordCanvas: y,
          preserveWhiteSpace: z,
          onSerialize: M,
          onIframeLoad: v,
          iframeLoadTimeout: b,
          onStylesheetLoad: A,
          stylesheetLoadTimeout: S,
          keepIframeSrcFn: w
        });
        fe && A(
          e,
          fe
        );
      }
    },
    S
  ), O;
}
function rb(e, t) {
  const {
    mirror: r = new nd(),
    blockClass: n = "rr-block",
    blockSelector: i = null,
    maskTextClass: o = "rr-mask",
    maskTextSelector: s = null,
    inlineStylesheet: c = !0,
    inlineImages: l = !1,
    recordCanvas: d = !1,
    maskAllInputs: a = !1,
    maskTextFn: h,
    maskInputFn: p,
    slimDOM: u = !1,
    dataURLOptions: m,
    preserveWhiteSpace: f,
    onSerialize: y,
    onIframeLoad: M,
    iframeLoadTimeout: v,
    onStylesheetLoad: b,
    stylesheetLoadTimeout: A,
    keepIframeSrcFn: S = () => !1
  } = t, w = a === !0 ? {
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
  } : a, T = cd(u);
  return ln(e, {
    doc: e,
    mirror: r,
    blockClass: n,
    blockSelector: i,
    maskTextClass: o,
    maskTextSelector: s,
    skipChild: !1,
    inlineStylesheet: c,
    maskInputOptions: w,
    maskTextFn: h,
    maskInputFn: p,
    slimDOMOptions: T,
    dataURLOptions: m,
    inlineImages: l,
    recordCanvas: d,
    preserveWhiteSpace: f,
    onSerialize: y,
    onIframeLoad: M,
    iframeLoadTimeout: v,
    onStylesheetLoad: b,
    stylesheetLoadTimeout: A,
    keepIframeSrcFn: S,
    newlyAddedElement: !1
  });
}
function nb(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function ib(e) {
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
var di = { exports: {} }, Hl;
function ob() {
  if (Hl) return di.exports;
  Hl = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return di.exports = t(), di.exports.createColors = t, di.exports;
}
const sb = {}, ab = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: sb
}, Symbol.toStringTag, { value: "Module" })), Kt = /* @__PURE__ */ ib(ab);
var _o, Yl;
function ra() {
  if (Yl) return _o;
  Yl = 1;
  let e = /* @__PURE__ */ ob(), t = Kt;
  class r extends Error {
    constructor(i, o, s, c, l, d) {
      super(i), this.name = "CssSyntaxError", this.reason = i, l && (this.file = l), c && (this.source = c), d && (this.plugin = d), typeof o < "u" && typeof s < "u" && (typeof o == "number" ? (this.line = o, this.column = s) : (this.line = o.line, this.column = o.column, this.endLine = s.line, this.endColumn = s.column)), this.setMessage(), Error.captureStackTrace && Error.captureStackTrace(this, r);
    }
    setMessage() {
      this.message = this.plugin ? this.plugin + ": " : "", this.message += this.file ? this.file : "<css input>", typeof this.line < "u" && (this.message += ":" + this.line + ":" + this.column), this.message += ": " + this.reason;
    }
    showSourceCode(i) {
      if (!this.source) return "";
      let o = this.source;
      i == null && (i = e.isColorSupported), t && i && (o = t(o));
      let s = o.split(/\r?\n/), c = Math.max(this.line - 3, 0), l = Math.min(this.line + 2, s.length), d = String(l).length, a, h;
      if (i) {
        let { bold: p, gray: u, red: m } = e.createColors(!0);
        a = (f) => p(m(f)), h = (f) => u(f);
      } else
        a = h = (p) => p;
      return s.slice(c, l).map((p, u) => {
        let m = c + 1 + u, f = " " + (" " + m).slice(-d) + " | ";
        if (m === this.line) {
          let y = h(f.replace(/\d/g, " ")) + p.slice(0, this.column - 1).replace(/[^\t]/g, " ");
          return a(">") + h(f) + p + `
 ` + y + a("^");
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
  return _o = r, r.default = r, _o;
}
var pi = {}, Vl;
function na() {
  return Vl || (Vl = 1, pi.isClean = Symbol("isClean"), pi.my = Symbol("my")), pi;
}
var Lo, Gl;
function ud() {
  if (Gl) return Lo;
  Gl = 1;
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
      let s = "@" + i.name, c = i.params ? this.rawValue(i, "params") : "";
      if (typeof i.raws.afterName < "u" ? s += i.raws.afterName : c && (s += " "), i.nodes)
        this.block(i, s + c);
      else {
        let l = (i.raws.between || "") + (o ? ";" : "");
        this.builder(s + c + l, i);
      }
    }
    beforeAfter(i, o) {
      let s;
      i.type === "decl" ? s = this.raw(i, null, "beforeDecl") : i.type === "comment" ? s = this.raw(i, null, "beforeComment") : o === "before" ? s = this.raw(i, null, "beforeRule") : s = this.raw(i, null, "beforeClose");
      let c = i.parent, l = 0;
      for (; c && c.type !== "root"; )
        l += 1, c = c.parent;
      if (s.includes(`
`)) {
        let d = this.raw(i, null, "indent");
        if (d.length)
          for (let a = 0; a < l; a++) s += d;
      }
      return s;
    }
    block(i, o) {
      let s = this.raw(i, "between", "beforeOpen");
      this.builder(o + s + "{", i, "start");
      let c;
      i.nodes && i.nodes.length ? (this.body(i), c = this.raw(i, "after")) : c = this.raw(i, "after", "emptyBody"), c && this.builder(c), this.builder("}", i, "end");
    }
    body(i) {
      let o = i.nodes.length - 1;
      for (; o > 0 && i.nodes[o].type === "comment"; )
        o -= 1;
      let s = this.raw(i, "semicolon");
      for (let c = 0; c < i.nodes.length; c++) {
        let l = i.nodes[c], d = this.raw(l, "before");
        d && this.builder(d), this.stringify(l, o !== c || s);
      }
    }
    comment(i) {
      let o = this.raw(i, "left", "commentLeft"), s = this.raw(i, "right", "commentRight");
      this.builder("/*" + o + i.text + s + "*/", i);
    }
    decl(i, o) {
      let s = this.raw(i, "between", "colon"), c = i.prop + s + this.rawValue(i, "value");
      i.important && (c += i.raws.important || " !important"), o && (c += ";"), this.builder(c, i);
    }
    document(i) {
      this.body(i);
    }
    raw(i, o, s) {
      let c;
      if (s || (s = o), o && (c = i.raws[o], typeof c < "u"))
        return c;
      let l = i.parent;
      if (s === "before" && (!l || l.type === "root" && l.first === i || l && l.type === "document"))
        return "";
      if (!l) return e[s];
      let d = i.root();
      if (d.rawCache || (d.rawCache = {}), typeof d.rawCache[s] < "u")
        return d.rawCache[s];
      if (s === "before" || s === "after")
        return this.beforeAfter(i, s);
      {
        let a = "raw" + t(s);
        this[a] ? c = this[a](d, i) : d.walk((h) => {
          if (c = h.raws[o], typeof c < "u") return !1;
        });
      }
      return typeof c > "u" && (c = e[s]), d.rawCache[s] = c, c;
    }
    rawBeforeClose(i) {
      let o;
      return i.walk((s) => {
        if (s.nodes && s.nodes.length > 0 && typeof s.raws.after < "u")
          return o = s.raws.after, o.includes(`
`) && (o = o.replace(/[^\n]+$/, "")), !1;
      }), o && (o = o.replace(/\S/g, "")), o;
    }
    rawBeforeComment(i, o) {
      let s;
      return i.walkComments((c) => {
        if (typeof c.raws.before < "u")
          return s = c.raws.before, s.includes(`
`) && (s = s.replace(/[^\n]+$/, "")), !1;
      }), typeof s > "u" ? s = this.raw(o, null, "beforeDecl") : s && (s = s.replace(/\S/g, "")), s;
    }
    rawBeforeDecl(i, o) {
      let s;
      return i.walkDecls((c) => {
        if (typeof c.raws.before < "u")
          return s = c.raws.before, s.includes(`
`) && (s = s.replace(/[^\n]+$/, "")), !1;
      }), typeof s > "u" ? s = this.raw(o, null, "beforeRule") : s && (s = s.replace(/\S/g, "")), s;
    }
    rawBeforeOpen(i) {
      let o;
      return i.walk((s) => {
        if (s.type !== "decl" && (o = s.raws.between, typeof o < "u"))
          return !1;
      }), o;
    }
    rawBeforeRule(i) {
      let o;
      return i.walk((s) => {
        if (s.nodes && (s.parent !== i || i.first !== s) && typeof s.raws.before < "u")
          return o = s.raws.before, o.includes(`
`) && (o = o.replace(/[^\n]+$/, "")), !1;
      }), o && (o = o.replace(/\S/g, "")), o;
    }
    rawColon(i) {
      let o;
      return i.walkDecls((s) => {
        if (typeof s.raws.between < "u")
          return o = s.raws.between.replace(/[^\s:]/g, ""), !1;
      }), o;
    }
    rawEmptyBody(i) {
      let o;
      return i.walk((s) => {
        if (s.nodes && s.nodes.length === 0 && (o = s.raws.after, typeof o < "u"))
          return !1;
      }), o;
    }
    rawIndent(i) {
      if (i.raws.indent) return i.raws.indent;
      let o;
      return i.walk((s) => {
        let c = s.parent;
        if (c && c !== i && c.parent && c.parent === i && typeof s.raws.before < "u") {
          let l = s.raws.before.split(`
`);
          return o = l[l.length - 1], o = o.replace(/\S/g, ""), !1;
        }
      }), o;
    }
    rawSemicolon(i) {
      let o;
      return i.walk((s) => {
        if (s.nodes && s.nodes.length && s.last.type === "decl" && (o = s.raws.semicolon, typeof o < "u"))
          return !1;
      }), o;
    }
    rawValue(i, o) {
      let s = i[o], c = i.raws[o];
      return c && c.value === s ? c.raw : s;
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
  return Lo = r, r.default = r, Lo;
}
var Io, Kl;
function Ui() {
  if (Kl) return Io;
  Kl = 1;
  let e = ud();
  function t(r, n) {
    new e(n).stringify(r);
  }
  return Io = t, t.default = t, Io;
}
var Oo, Xl;
function Bi() {
  if (Xl) return Oo;
  Xl = 1;
  let { isClean: e, my: t } = na(), r = ra(), n = ud(), i = Ui();
  function o(c, l) {
    let d = new c.constructor();
    for (let a in c) {
      if (!Object.prototype.hasOwnProperty.call(c, a) || a === "proxyCache") continue;
      let h = c[a], p = typeof h;
      a === "parent" && p === "object" ? l && (d[a] = l) : a === "source" ? d[a] = h : Array.isArray(h) ? d[a] = h.map((u) => o(u, d)) : (p === "object" && h !== null && (h = o(h)), d[a] = h);
    }
    return d;
  }
  class s {
    constructor(l = {}) {
      this.raws = {}, this[e] = !1, this[t] = !0;
      for (let d in l)
        if (d === "nodes") {
          this.nodes = [];
          for (let a of l[d])
            typeof a.clone == "function" ? this.append(a.clone()) : this.append(a);
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
      let d = o(this);
      for (let a in l)
        d[a] = l[a];
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
        let { end: a, start: h } = this.rangeBy(d);
        return this.source.input.error(
          l,
          { column: h.column, line: h.line },
          { column: a.column, line: a.line },
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
        set(l, d, a) {
          return l[d] === a || (l[d] = a, (d === "prop" || d === "value" || d === "name" || d === "params" || d === "important" || /* c8 ignore next */
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
      let a = this.source.start;
      if (l.index)
        a = this.positionInside(l.index, d);
      else if (l.word) {
        d = this.toString();
        let h = d.indexOf(l.word);
        h !== -1 && (a = this.positionInside(h, d));
      }
      return a;
    }
    positionInside(l, d) {
      let a = d || this.toString(), h = this.source.start.column, p = this.source.start.line;
      for (let u = 0; u < l; u++)
        a[u] === `
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
      }, a = this.source.end ? {
        column: this.source.end.column + 1,
        line: this.source.end.line
      } : {
        column: d.column + 1,
        line: d.line
      };
      if (l.word) {
        let h = this.toString(), p = h.indexOf(l.word);
        p !== -1 && (d = this.positionInside(p, h), a = this.positionInside(p + l.word.length, h));
      } else
        l.start ? d = {
          column: l.start.column,
          line: l.start.line
        } : l.index && (d = this.positionInside(l.index)), l.end ? a = {
          column: l.end.column,
          line: l.end.line
        } : typeof l.endIndex == "number" ? a = this.positionInside(l.endIndex) : l.index && (a = this.positionInside(l.index + 1));
      return (a.line < d.line || a.line === d.line && a.column <= d.column) && (a = { column: d.column + 1, line: d.line }), { end: a, start: d };
    }
    raw(l, d) {
      return new n().raw(this, l, d);
    }
    remove() {
      return this.parent && this.parent.removeChild(this), this.parent = void 0, this;
    }
    replaceWith(...l) {
      if (this.parent) {
        let d = this, a = !1;
        for (let h of l)
          h === this ? a = !0 : a ? (this.parent.insertAfter(d, h), d = h) : this.parent.insertBefore(d, h);
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
    toJSON(l, d) {
      let a = {}, h = d == null;
      d = d || /* @__PURE__ */ new Map();
      let p = 0;
      for (let u in this) {
        if (!Object.prototype.hasOwnProperty.call(this, u) || u === "parent" || u === "proxyCache") continue;
        let m = this[u];
        if (Array.isArray(m))
          a[u] = m.map((f) => typeof f == "object" && f.toJSON ? f.toJSON(null, d) : f);
        else if (typeof m == "object" && m.toJSON)
          a[u] = m.toJSON(null, d);
        else if (u === "source") {
          let f = d.get(m.input);
          f == null && (f = p, d.set(m.input, p), p++), a[u] = {
            end: m.end,
            inputId: f,
            start: m.start
          };
        } else
          a[u] = m;
      }
      return h && (a.inputs = [...d.keys()].map((u) => u.toJSON())), a;
    }
    toProxy() {
      return this.proxyCache || (this.proxyCache = new Proxy(this, this.getProxyProcessor())), this.proxyCache;
    }
    toString(l = i) {
      l.stringify && (l = l.stringify);
      let d = "";
      return l(this, (a) => {
        d += a;
      }), d;
    }
    warn(l, d, a) {
      let h = { node: this };
      for (let p in a) h[p] = a[p];
      return l.warn(d, h);
    }
    get proxyOf() {
      return this;
    }
  }
  return Oo = s, s.default = s, Oo;
}
var No, Jl;
function qi() {
  if (Jl) return No;
  Jl = 1;
  let e = Bi();
  class t extends e {
    constructor(n) {
      n && typeof n.value < "u" && typeof n.value != "string" && (n = { ...n, value: String(n.value) }), super(n), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return No = t, t.default = t, No;
}
var Po, Zl;
function lb() {
  if (Zl) return Po;
  Zl = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return Po = { nanoid: (n = 21) => {
    let i = "", o = n;
    for (; o--; )
      i += e[Math.random() * 64 | 0];
    return i;
  }, customAlphabet: (n, i = 21) => (o = i) => {
    let s = "", c = o;
    for (; c--; )
      s += n[Math.random() * n.length | 0];
    return s;
  } }, Po;
}
var $o, Ql;
function dd() {
  if (Ql) return $o;
  Ql = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Kt, { existsSync: r, readFileSync: n } = Kt, { dirname: i, join: o } = Kt;
  function s(l) {
    return Buffer ? Buffer.from(l, "base64").toString() : window.atob(l);
  }
  class c {
    constructor(d, a) {
      if (a.map === !1) return;
      this.loadAnnotation(d), this.inline = this.startWith(this.annotation, "data:");
      let h = a.map ? a.map.prev : void 0, p = this.loadMap(a.from, h);
      !this.mapFile && a.from && (this.mapFile = a.from), this.mapFile && (this.root = i(this.mapFile)), p && (this.text = p);
    }
    consumer() {
      return this.consumerCache || (this.consumerCache = new e(this.text)), this.consumerCache;
    }
    decodeInline(d) {
      let a = /^data:application\/json;charset=utf-?8;base64,/, h = /^data:application\/json;base64,/, p = /^data:application\/json;charset=utf-?8,/, u = /^data:application\/json,/;
      if (p.test(d) || u.test(d))
        return decodeURIComponent(d.substr(RegExp.lastMatch.length));
      if (a.test(d) || h.test(d))
        return s(d.substr(RegExp.lastMatch.length));
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
      let a = d.match(/\/\*\s*# sourceMappingURL=/gm);
      if (!a) return;
      let h = d.lastIndexOf(a.pop()), p = d.indexOf("*/", h);
      h > -1 && p > -1 && (this.annotation = this.getAnnotationURL(d.substring(h, p)));
    }
    loadFile(d) {
      if (this.root = i(d), r(d))
        return this.mapFile = d, n(d, "utf-8").toString().trim();
    }
    loadMap(d, a) {
      if (a === !1) return !1;
      if (a) {
        if (typeof a == "string")
          return a;
        if (typeof a == "function") {
          let h = a(d);
          if (h) {
            let p = this.loadFile(h);
            if (!p)
              throw new Error(
                "Unable to load previous source map: " + h.toString()
              );
            return p;
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
          return d && (h = o(i(d), h)), this.loadFile(h);
        }
      }
    }
    startWith(d, a) {
      return d ? d.substr(0, a.length) === a : !1;
    }
    withContent() {
      return !!(this.consumer().sourcesContent && this.consumer().sourcesContent.length > 0);
    }
  }
  return $o = c, c.default = c, $o;
}
var zo, ec;
function Wi() {
  if (ec) return zo;
  ec = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Kt, { fileURLToPath: r, pathToFileURL: n } = Kt, { isAbsolute: i, resolve: o } = Kt, { nanoid: s } = /* @__PURE__ */ lb(), c = Kt, l = ra(), d = dd(), a = Symbol("fromOffsetCache"), h = !!(e && t), p = !!(o && i);
  class u {
    constructor(f, y = {}) {
      if (f === null || typeof f > "u" || typeof f == "object" && !f.toString)
        throw new Error(`PostCSS received ${f} instead of CSS string`);
      if (this.css = f.toString(), this.css[0] === "\uFEFF" || this.css[0] === "￾" ? (this.hasBOM = !0, this.css = this.css.slice(1)) : this.hasBOM = !1, y.from && (!p || /^\w+:\/\//.test(y.from) || i(y.from) ? this.file = y.from : this.file = o(y.from)), p && h) {
        let M = new d(this.css, y);
        if (M.text) {
          this.map = M;
          let v = M.consumer().file;
          !this.file && v && (this.file = this.mapResolve(v));
        }
      }
      this.file || (this.id = "<input css " + s(6) + ">"), this.map && (this.map.file = this.from);
    }
    error(f, y, M, v = {}) {
      let b, A, S;
      if (y && typeof y == "object") {
        let T = y, N = M;
        if (typeof T.offset == "number") {
          let U = this.fromOffset(T.offset);
          y = U.line, M = U.col;
        } else
          y = T.line, M = T.column;
        if (typeof N.offset == "number") {
          let U = this.fromOffset(N.offset);
          A = U.line, S = U.col;
        } else
          A = N.line, S = N.column;
      } else if (!M) {
        let T = this.fromOffset(y);
        y = T.line, M = T.col;
      }
      let w = this.origin(y, M, A, S);
      return w ? b = new l(
        f,
        w.endLine === void 0 ? w.line : { column: w.column, line: w.line },
        w.endLine === void 0 ? w.column : { column: w.endColumn, line: w.endLine },
        w.source,
        w.file,
        v.plugin
      ) : b = new l(
        f,
        A === void 0 ? y : { column: M, line: y },
        A === void 0 ? M : { column: S, line: A },
        this.css,
        this.file,
        v.plugin
      ), b.input = { column: M, endColumn: S, endLine: A, line: y, source: this.css }, this.file && (n && (b.input.url = n(this.file).toString()), b.input.file = this.file), b;
    }
    fromOffset(f) {
      let y, M;
      if (this[a])
        M = this[a];
      else {
        let b = this.css.split(`
`);
        M = new Array(b.length);
        let A = 0;
        for (let S = 0, w = b.length; S < w; S++)
          M[S] = A, A += b[S].length + 1;
        this[a] = M;
      }
      y = M[M.length - 1];
      let v = 0;
      if (f >= y)
        v = M.length - 1;
      else {
        let b = M.length - 2, A;
        for (; v < b; )
          if (A = v + (b - v >> 1), f < M[A])
            b = A - 1;
          else if (f >= M[A + 1])
            v = A + 1;
          else {
            v = A;
            break;
          }
      }
      return {
        col: f - M[v] + 1,
        line: v + 1
      };
    }
    mapResolve(f) {
      return /^\w+:\/\//.test(f) ? f : o(this.map.consumer().sourceRoot || this.map.root || ".", f);
    }
    origin(f, y, M, v) {
      if (!this.map) return !1;
      let b = this.map.consumer(), A = b.originalPositionFor({ column: y, line: f });
      if (!A.source) return !1;
      let S;
      typeof M == "number" && (S = b.originalPositionFor({ column: v, line: M }));
      let w;
      i(A.source) ? w = n(A.source) : w = new URL(
        A.source,
        this.map.consumer().sourceRoot || n(this.map.mapFile)
      );
      let T = {
        column: A.column,
        endColumn: S && S.column,
        endLine: S && S.line,
        line: A.line,
        url: w.toString()
      };
      if (w.protocol === "file:")
        if (r)
          T.file = r(w);
        else
          throw new Error("file: protocol is not available in this PostCSS build");
      let N = b.sourceContentFor(A.source);
      return N && (T.source = N), T;
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
  return zo = u, u.default = u, c && c.registerInput && c.registerInput(u), zo;
}
var Do, tc;
function pd() {
  if (tc) return Do;
  tc = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Kt, { dirname: r, relative: n, resolve: i, sep: o } = Kt, { pathToFileURL: s } = Kt, c = Wi(), l = !!(e && t), d = !!(r && i && n && o);
  class a {
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
      }, y, M;
      this.stringify(this.root, (v, b, A) => {
        if (this.css += v, b && A !== "end" && (f.generated.line = p, f.generated.column = u - 1, b.source && b.source.start ? (f.source = this.sourcePath(b), f.original.line = b.source.start.line, f.original.column = b.source.start.column - 1, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, this.map.addMapping(f))), y = v.match(/\n/g), y ? (p += y.length, M = v.lastIndexOf(`
`), u = v.length - M) : u += v.length, b && A !== "start") {
          let S = b.parent || { raws: {} };
          (!(b.type === "decl" || b.type === "atrule" && !b.nodes) || b !== S.last || S.raws.semicolon) && (b.source && b.source.end ? (f.source = this.sourcePath(b), f.original.line = b.source.end.line, f.original.column = b.source.end.column - 1, f.generated.line = p, f.generated.column = u - 2, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, f.generated.line = p, f.generated.column = u - 1, this.map.addMapping(f)));
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
      if (s) {
        let m = s(p).toString();
        return this.memoizedFileURLs.set(p, m), m;
      } else
        throw new Error(
          "`map.absolute` option is not available in this PostCSS build"
        );
    }
    toUrl(p) {
      let u = this.memoizedURLs.get(p);
      if (u) return u;
      o === "\\" && (p = p.replace(/\\/g, "/"));
      let m = encodeURI(p).replace(/[#?]/g, encodeURIComponent);
      return this.memoizedURLs.set(p, m), m;
    }
  }
  return Do = a, Do;
}
var Fo, rc;
function ji() {
  if (rc) return Fo;
  rc = 1;
  let e = Bi();
  class t extends e {
    constructor(n) {
      super(n), this.type = "comment";
    }
  }
  return Fo = t, t.default = t, Fo;
}
var Uo, nc;
function Br() {
  if (nc) return Uo;
  nc = 1;
  let { isClean: e, my: t } = na(), r = qi(), n = ji(), i = Bi(), o, s, c, l;
  function d(p) {
    return p.map((u) => (u.nodes && (u.nodes = d(u.nodes)), delete u.source, u));
  }
  function a(p) {
    if (p[e] = !1, p.proxyOf.nodes)
      for (let u of p.proxyOf.nodes)
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
      for (let b of M) this.proxyOf.nodes.splice(f, 0, b);
      let v;
      for (let b in this.indexes)
        v = this.indexes[b], f <= v && (this.indexes[b] = v + M.length);
      return this.markDirty(), this;
    }
    normalize(u, m) {
      if (typeof u == "string")
        u = d(o(u).nodes);
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
        u = [new s(u)];
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
  return h.registerParse = (p) => {
    o = p;
  }, h.registerRule = (p) => {
    s = p;
  }, h.registerAtRule = (p) => {
    c = p;
  }, h.registerRoot = (p) => {
    l = p;
  }, Uo = h, h.default = h, h.rebuild = (p) => {
    p.type === "atrule" ? Object.setPrototypeOf(p, c.prototype) : p.type === "rule" ? Object.setPrototypeOf(p, s.prototype) : p.type === "decl" ? Object.setPrototypeOf(p, r.prototype) : p.type === "comment" ? Object.setPrototypeOf(p, n.prototype) : p.type === "root" && Object.setPrototypeOf(p, l.prototype), p[t] = !0, p.nodes && p.nodes.forEach((u) => {
      h.rebuild(u);
    });
  }, Uo;
}
var Bo, ic;
function ia() {
  if (ic) return Bo;
  ic = 1;
  let e = Br(), t, r;
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
  }, Bo = n, n.default = n, Bo;
}
var qo, oc;
function hd() {
  if (oc) return qo;
  oc = 1;
  let e = {};
  return qo = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, qo;
}
var Wo, sc;
function fd() {
  if (sc) return Wo;
  sc = 1;
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
  return Wo = e, e.default = e, Wo;
}
var jo, ac;
function oa() {
  if (ac) return jo;
  ac = 1;
  let e = fd();
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
  return jo = t, t.default = t, jo;
}
var Ho, lc;
function cb() {
  if (lc) return Ho;
  lc = 1;
  const e = 39, t = 34, r = 92, n = 47, i = 10, o = 32, s = 12, c = 9, l = 13, d = 91, a = 93, h = 40, p = 41, u = 123, m = 125, f = 59, y = 42, M = 58, v = 64, b = /[\t\n\f\r "#'()/;[\\\]{}]/g, A = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, S = /.[\r\n"'(/\\]/, w = /[\da-f]/i;
  return Ho = function(N, U = {}) {
    let z = N.css.valueOf(), ee = U.ignoreErrors, W, O, nt, Ke, fe, pe, Re, Fe, Te, ke, Ve = z.length, P = 0, H = [], se = [];
    function re() {
      return P;
    }
    function ce(G) {
      throw N.error("Unclosed " + G, P);
    }
    function Ae() {
      return se.length === 0 && P >= Ve;
    }
    function Ue(G) {
      if (se.length) return se.pop();
      if (P >= Ve) return;
      let oe = G ? G.ignoreUnclosed : !1;
      switch (W = z.charCodeAt(P), W) {
        case i:
        case o:
        case c:
        case l:
        case s: {
          O = P;
          do
            O += 1, W = z.charCodeAt(O);
          while (W === o || W === i || W === c || W === l || W === s);
          ke = ["space", z.slice(P, O)], P = O - 1;
          break;
        }
        case d:
        case a:
        case u:
        case m:
        case M:
        case f:
        case p: {
          let ge = String.fromCharCode(W);
          ke = [ge, ge, P];
          break;
        }
        case h: {
          if (Fe = H.length ? H.pop()[1] : "", Te = z.charCodeAt(P + 1), Fe === "url" && Te !== e && Te !== t && Te !== o && Te !== i && Te !== c && Te !== s && Te !== l) {
            O = P;
            do {
              if (pe = !1, O = z.indexOf(")", O + 1), O === -1)
                if (ee || oe) {
                  O = P;
                  break;
                } else
                  ce("bracket");
              for (Re = O; z.charCodeAt(Re - 1) === r; )
                Re -= 1, pe = !pe;
            } while (pe);
            ke = ["brackets", z.slice(P, O + 1), P, O], P = O;
          } else
            O = z.indexOf(")", P + 1), Ke = z.slice(P, O + 1), O === -1 || S.test(Ke) ? ke = ["(", "(", P] : (ke = ["brackets", Ke, P, O], P = O);
          break;
        }
        case e:
        case t: {
          nt = W === e ? "'" : '"', O = P;
          do {
            if (pe = !1, O = z.indexOf(nt, O + 1), O === -1)
              if (ee || oe) {
                O = P + 1;
                break;
              } else
                ce("string");
            for (Re = O; z.charCodeAt(Re - 1) === r; )
              Re -= 1, pe = !pe;
          } while (pe);
          ke = ["string", z.slice(P, O + 1), P, O], P = O;
          break;
        }
        case v: {
          b.lastIndex = P + 1, b.test(z), b.lastIndex === 0 ? O = z.length - 1 : O = b.lastIndex - 2, ke = ["at-word", z.slice(P, O + 1), P, O], P = O;
          break;
        }
        case r: {
          for (O = P, fe = !0; z.charCodeAt(O + 1) === r; )
            O += 1, fe = !fe;
          if (W = z.charCodeAt(O + 1), fe && W !== n && W !== o && W !== i && W !== c && W !== l && W !== s && (O += 1, w.test(z.charAt(O)))) {
            for (; w.test(z.charAt(O + 1)); )
              O += 1;
            z.charCodeAt(O + 1) === o && (O += 1);
          }
          ke = ["word", z.slice(P, O + 1), P, O], P = O;
          break;
        }
        default: {
          W === n && z.charCodeAt(P + 1) === y ? (O = z.indexOf("*/", P + 2) + 1, O === 0 && (ee || oe ? O = z.length : ce("comment")), ke = ["comment", z.slice(P, O + 1), P, O], P = O) : (A.lastIndex = P + 1, A.test(z), A.lastIndex === 0 ? O = z.length - 1 : O = A.lastIndex - 2, ke = ["word", z.slice(P, O + 1), P, O], H.push(ke), P = O);
          break;
        }
      }
      return P++, ke;
    }
    function Se(G) {
      se.push(G);
    }
    return {
      back: Se,
      endOfFile: Ae,
      nextToken: Ue,
      position: re
    };
  }, Ho;
}
var Yo, cc;
function sa() {
  if (cc) return Yo;
  cc = 1;
  let e = Br();
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
  return Yo = t, t.default = t, e.registerAtRule(t), Yo;
}
var Vo, uc;
function Wn() {
  if (uc) return Vo;
  uc = 1;
  let e = Br(), t, r;
  class n extends e {
    constructor(o) {
      super(o), this.type = "root", this.nodes || (this.nodes = []);
    }
    normalize(o, s, c) {
      let l = super.normalize(o);
      if (s) {
        if (c === "prepend")
          this.nodes.length > 1 ? s.raws.before = this.nodes[1].raws.before : delete s.raws.before;
        else if (this.first !== s)
          for (let d of l)
            d.raws.before = s.raws.before;
      }
      return l;
    }
    removeChild(o, s) {
      let c = this.index(o);
      return !s && c === 0 && this.nodes.length > 1 && (this.nodes[1].raws.before = this.nodes[c].raws.before), super.removeChild(o);
    }
    toResult(o = {}) {
      return new t(new r(), this, o).stringify();
    }
  }
  return n.registerLazyResult = (i) => {
    t = i;
  }, n.registerProcessor = (i) => {
    r = i;
  }, Vo = n, n.default = n, e.registerRoot(n), Vo;
}
var Go, dc;
function md() {
  if (dc) return Go;
  dc = 1;
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
      let i = [], o = "", s = !1, c = 0, l = !1, d = "", a = !1;
      for (let h of t)
        a ? a = !1 : h === "\\" ? a = !0 : l ? h === d && (l = !1) : h === '"' || h === "'" ? (l = !0, d = h) : h === "(" ? c += 1 : h === ")" ? c > 0 && (c -= 1) : c === 0 && r.includes(h) && (s = !0), s ? (o !== "" && i.push(o.trim()), o = "", s = !1) : o += h;
      return (n || o !== "") && i.push(o.trim()), i;
    }
  };
  return Go = e, e.default = e, Go;
}
var Ko, pc;
function aa() {
  if (pc) return Ko;
  pc = 1;
  let e = Br(), t = md();
  class r extends e {
    constructor(i) {
      super(i), this.type = "rule", this.nodes || (this.nodes = []);
    }
    get selectors() {
      return t.comma(this.selector);
    }
    set selectors(i) {
      let o = this.selector ? this.selector.match(/,\s*/) : null, s = o ? o[0] : "," + this.raw("between", "beforeOpen");
      this.selector = i.join(s);
    }
  }
  return Ko = r, r.default = r, e.registerRule(r), Ko;
}
var Xo, hc;
function ub() {
  if (hc) return Xo;
  hc = 1;
  let e = qi(), t = cb(), r = ji(), n = sa(), i = Wn(), o = aa();
  const s = {
    empty: !0,
    space: !0
  };
  function c(d) {
    for (let a = d.length - 1; a >= 0; a--) {
      let h = d[a], p = h[3] || h[2];
      if (p) return p;
    }
  }
  class l {
    constructor(a) {
      this.input = a, this.root = new i(), this.current = this.root, this.spaces = "", this.semicolon = !1, this.createTokenizer(), this.root.source = { input: a, start: { column: 1, line: 1, offset: 0 } };
    }
    atrule(a) {
      let h = new n();
      h.name = a[1].slice(1), h.name === "" && this.unnamedAtrule(h, a), this.init(h, a[2]);
      let p, u, m, f = !1, y = !1, M = [], v = [];
      for (; !this.tokenizer.endOfFile(); ) {
        if (a = this.tokenizer.nextToken(), p = a[0], p === "(" || p === "[" ? v.push(p === "(" ? ")" : "]") : p === "{" && v.length > 0 ? v.push("}") : p === v[v.length - 1] && v.pop(), v.length === 0)
          if (p === ";") {
            h.source.end = this.getPosition(a[2]), h.source.end.offset++, this.semicolon = !0;
            break;
          } else if (p === "{") {
            y = !0;
            break;
          } else if (p === "}") {
            if (M.length > 0) {
              for (m = M.length - 1, u = M[m]; u && u[0] === "space"; )
                u = M[--m];
              u && (h.source.end = this.getPosition(u[3] || u[2]), h.source.end.offset++);
            }
            this.end(a);
            break;
          } else
            M.push(a);
        else
          M.push(a);
        if (this.tokenizer.endOfFile()) {
          f = !0;
          break;
        }
      }
      h.raws.between = this.spacesAndCommentsFromEnd(M), M.length ? (h.raws.afterName = this.spacesAndCommentsFromStart(M), this.raw(h, "params", M), f && (a = M[M.length - 1], h.source.end = this.getPosition(a[3] || a[2]), h.source.end.offset++, this.spaces = h.raws.between, h.raws.between = "")) : (h.raws.afterName = "", h.params = ""), y && (h.nodes = [], this.current = h);
    }
    checkMissedSemicolon(a) {
      let h = this.colon(a);
      if (h === !1) return;
      let p = 0, u;
      for (let m = h - 1; m >= 0 && (u = a[m], !(u[0] !== "space" && (p += 1, p === 2))); m--)
        ;
      throw this.input.error(
        "Missed semicolon",
        u[0] === "word" ? u[3] + 1 : u[2]
      );
    }
    colon(a) {
      let h = 0, p, u, m;
      for (let [f, y] of a.entries()) {
        if (p = y, u = p[0], u === "(" && (h += 1), u === ")" && (h -= 1), h === 0 && u === ":")
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
    comment(a) {
      let h = new r();
      this.init(h, a[2]), h.source.end = this.getPosition(a[3] || a[2]), h.source.end.offset++;
      let p = a[1].slice(2, -2);
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
    decl(a, h) {
      let p = new e();
      this.init(p, a[0][2]);
      let u = a[a.length - 1];
      for (u[0] === ";" && (this.semicolon = !0, a.pop()), p.source.end = this.getPosition(
        u[3] || u[2] || c(a)
      ), p.source.end.offset++; a[0][0] !== "word"; )
        a.length === 1 && this.unknownWord(a), p.raws.before += a.shift()[1];
      for (p.source.start = this.getPosition(a[0][2]), p.prop = ""; a.length; ) {
        let v = a[0][0];
        if (v === ":" || v === "space" || v === "comment")
          break;
        p.prop += a.shift()[1];
      }
      p.raws.between = "";
      let m;
      for (; a.length; )
        if (m = a.shift(), m[0] === ":") {
          p.raws.between += m[1];
          break;
        } else
          m[0] === "word" && /\w/.test(m[1]) && this.unknownWord([m]), p.raws.between += m[1];
      (p.prop[0] === "_" || p.prop[0] === "*") && (p.raws.before += p.prop[0], p.prop = p.prop.slice(1));
      let f = [], y;
      for (; a.length && (y = a[0][0], !(y !== "space" && y !== "comment")); )
        f.push(a.shift());
      this.precheckMissedSemicolon(a);
      for (let v = a.length - 1; v >= 0; v--) {
        if (m = a[v], m[1].toLowerCase() === "!important") {
          p.important = !0;
          let b = this.stringFrom(a, v);
          b = this.spacesFromEnd(a) + b, b !== " !important" && (p.raws.important = b);
          break;
        } else if (m[1].toLowerCase() === "important") {
          let b = a.slice(0), A = "";
          for (let S = v; S > 0; S--) {
            let w = b[S][0];
            if (A.trim().indexOf("!") === 0 && w !== "space")
              break;
            A = b.pop()[1] + A;
          }
          A.trim().indexOf("!") === 0 && (p.important = !0, p.raws.important = A, a = b);
        }
        if (m[0] !== "space" && m[0] !== "comment")
          break;
      }
      a.some((v) => v[0] !== "space" && v[0] !== "comment") && (p.raws.between += f.map((v) => v[1]).join(""), f = []), this.raw(p, "value", f.concat(a), h), p.value.includes(":") && !h && this.checkMissedSemicolon(a);
    }
    doubleColon(a) {
      throw this.input.error(
        "Double colon",
        { offset: a[2] },
        { offset: a[2] + a[1].length }
      );
    }
    emptyRule(a) {
      let h = new o();
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
      let h = !1, p = null, u = !1, m = null, f = [], y = a[1].startsWith("--"), M = [], v = a;
      for (; v; ) {
        if (p = v[0], M.push(v), p === "(" || p === "[")
          m || (m = v), f.push(p === "(" ? ")" : "]");
        else if (y && u && p === "{")
          m || (m = v), f.push("}");
        else if (f.length === 0)
          if (p === ";")
            if (u) {
              this.decl(M, y);
              return;
            } else
              break;
          else if (p === "{") {
            this.rule(M);
            return;
          } else if (p === "}") {
            this.tokenizer.back(M.pop()), h = !0;
            break;
          } else p === ":" && (u = !0);
        else p === f[f.length - 1] && (f.pop(), f.length === 0 && (m = null));
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
    raw(a, h, p, u) {
      let m, f, y = p.length, M = "", v = !0, b, A;
      for (let S = 0; S < y; S += 1)
        m = p[S], f = m[0], f === "space" && S === y - 1 && !u ? v = !1 : f === "comment" ? (A = p[S - 1] ? p[S - 1][0] : "empty", b = p[S + 1] ? p[S + 1][0] : "empty", !s[A] && !s[b] ? M.slice(-1) === "," ? v = !1 : M += m[1] : v = !1) : M += m[1];
      if (!v) {
        let S = p.reduce((w, T) => w + T[1], "");
        a.raws[h] = { raw: S, value: M };
      }
      a[h] = M;
    }
    rule(a) {
      a.pop();
      let h = new o();
      this.init(h, a[0][2]), h.raws.between = this.spacesAndCommentsFromEnd(a), this.raw(h, "selector", a), this.current = h;
    }
    spacesAndCommentsFromEnd(a) {
      let h, p = "";
      for (; a.length && (h = a[a.length - 1][0], !(h !== "space" && h !== "comment")); )
        p = a.pop()[1] + p;
      return p;
    }
    // Errors
    spacesAndCommentsFromStart(a) {
      let h, p = "";
      for (; a.length && (h = a[0][0], !(h !== "space" && h !== "comment")); )
        p += a.shift()[1];
      return p;
    }
    spacesFromEnd(a) {
      let h, p = "";
      for (; a.length && (h = a[a.length - 1][0], h === "space"); )
        p = a.pop()[1] + p;
      return p;
    }
    stringFrom(a, h) {
      let p = "";
      for (let u = h; u < a.length; u++)
        p += a[u][1];
      return a.splice(h, a.length - h), p;
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
  return Xo = l, Xo;
}
var Jo, fc;
function la() {
  if (fc) return Jo;
  fc = 1;
  let e = Br(), t = ub(), r = Wi();
  function n(i, o) {
    let s = new r(i, o), c = new t(s);
    try {
      c.parse();
    } catch (l) {
      throw process.env.NODE_ENV !== "production" && l.name === "CssSyntaxError" && o && o.from && (/\.scss$/i.test(o.from) ? l.message += `
You tried to parse SCSS with the standard CSS parser; try again with the postcss-scss parser` : /\.sass/i.test(o.from) ? l.message += `
You tried to parse Sass with the standard CSS parser; try again with the postcss-sass parser` : /\.less$/i.test(o.from) && (l.message += `
You tried to parse Less with the standard CSS parser; try again with the postcss-less parser`)), l;
    }
    return c.root;
  }
  return Jo = n, n.default = n, e.registerParse(n), Jo;
}
var Zo, mc;
function gd() {
  if (mc) return Zo;
  mc = 1;
  let { isClean: e, my: t } = na(), r = pd(), n = Ui(), i = Br(), o = ia(), s = hd(), c = oa(), l = la(), d = Wn();
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
  }, p = {
    Once: !0,
    postcssPlugin: !0,
    prepare: !0
  }, u = 0;
  function m(A) {
    return typeof A == "object" && typeof A.then == "function";
  }
  function f(A) {
    let S = !1, w = a[A.type];
    return A.type === "decl" ? S = A.prop.toLowerCase() : A.type === "atrule" && (S = A.name.toLowerCase()), S && A.append ? [
      w,
      w + "-" + S,
      u,
      w + "Exit",
      w + "Exit-" + S
    ] : S ? [w, w + "-" + S, w + "Exit", w + "Exit-" + S] : A.append ? [w, u, w + "Exit"] : [w, w + "Exit"];
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
  function M(A) {
    return A[e] = !1, A.nodes && A.nodes.forEach((S) => M(S)), A;
  }
  let v = {};
  class b {
    constructor(S, w, T) {
      this.stringified = !1, this.processed = !1;
      let N;
      if (typeof w == "object" && w !== null && (w.type === "root" || w.type === "document"))
        N = M(w);
      else if (w instanceof b || w instanceof c)
        N = M(w.root), w.map && (typeof T.map > "u" && (T.map = {}), T.map.inline || (T.map.inline = !1), T.map.prev = w.map);
      else {
        let U = l;
        T.syntax && (U = T.syntax.parse), T.parser && (U = T.parser), U.parse && (U = U.parse);
        try {
          N = U(w, T);
        } catch (z) {
          this.processed = !0, this.error = z;
        }
        N && !N[t] && i.rebuild(N);
      }
      this.result = new c(S, N, T), this.helpers = { ...v, postcss: v, result: this.result }, this.plugins = this.processor.plugins.map((U) => typeof U == "object" && U.prepare ? { ...U, ...U.prepare(this.result) } : U);
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
    handleError(S, w) {
      let T = this.result.lastPlugin;
      try {
        if (w && w.addToError(S), this.error = S, S.name === "CssSyntaxError" && !S.plugin)
          S.plugin = T.postcssPlugin, S.setMessage();
        else if (T.postcssVersion && process.env.NODE_ENV !== "production") {
          let N = T.postcssPlugin, U = T.postcssVersion, z = this.result.processor.version, ee = U.split("."), W = z.split(".");
          (ee[0] !== W[0] || parseInt(ee[1]) > parseInt(W[1])) && console.error(
            "Unknown error from PostCSS plugin. Your current PostCSS version is " + z + ", but " + N + " uses " + U + ". Perhaps this is the source of the error below."
          );
        }
      } catch (N) {
        console && console.error && console.error(N);
      }
      return S;
    }
    prepareVisitors() {
      this.listeners = {};
      let S = (w, T, N) => {
        this.listeners[T] || (this.listeners[T] = []), this.listeners[T].push([w, N]);
      };
      for (let w of this.plugins)
        if (typeof w == "object")
          for (let T in w) {
            if (!h[T] && /^[A-Z]/.test(T))
              throw new Error(
                `Unknown event ${T} in ${w.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`
              );
            if (!p[T])
              if (typeof w[T] == "object")
                for (let N in w[T])
                  N === "*" ? S(w, T, w[T][N]) : S(
                    w,
                    T + "-" + N.toLowerCase(),
                    w[T][N]
                  );
              else typeof w[T] == "function" && S(w, T, w[T]);
          }
      this.hasListener = Object.keys(this.listeners).length > 0;
    }
    async runAsync() {
      this.plugin = 0;
      for (let S = 0; S < this.plugins.length; S++) {
        let w = this.plugins[S], T = this.runOnRoot(w);
        if (m(T))
          try {
            await T;
          } catch (N) {
            throw this.handleError(N);
          }
      }
      if (this.prepareVisitors(), this.hasListener) {
        let S = this.result.root;
        for (; !S[e]; ) {
          S[e] = !0;
          let w = [y(S)];
          for (; w.length > 0; ) {
            let T = this.visitTick(w);
            if (m(T))
              try {
                await T;
              } catch (N) {
                let U = w[w.length - 1].node;
                throw this.handleError(N, U);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [w, T] of this.listeners.OnceExit) {
            this.result.lastPlugin = w;
            try {
              if (S.type === "document") {
                let N = S.nodes.map(
                  (U) => T(U, this.helpers)
                );
                await Promise.all(N);
              } else
                await T(S, this.helpers);
            } catch (N) {
              throw this.handleError(N);
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
            let w = this.result.root.nodes.map(
              (T) => S.Once(T, this.helpers)
            );
            return m(w[0]) ? Promise.all(w) : w;
          }
          return S.Once(this.result.root, this.helpers);
        } else if (typeof S == "function")
          return S(this.result.root, this.result);
      } catch (w) {
        throw this.handleError(w);
      }
    }
    stringify() {
      if (this.error) throw this.error;
      if (this.stringified) return this.result;
      this.stringified = !0, this.sync();
      let S = this.result.opts, w = n;
      S.syntax && (w = S.syntax.stringify), S.stringifier && (w = S.stringifier), w.stringify && (w = w.stringify);
      let N = new r(w, this.result.root, this.result.opts).generate();
      return this.result.css = N[0], this.result.map = N[1], this.result;
    }
    sync() {
      if (this.error) throw this.error;
      if (this.processed) return this.result;
      if (this.processed = !0, this.processing)
        throw this.getAsyncError();
      for (let S of this.plugins) {
        let w = this.runOnRoot(S);
        if (m(w))
          throw this.getAsyncError();
      }
      if (this.prepareVisitors(), this.hasListener) {
        let S = this.result.root;
        for (; !S[e]; )
          S[e] = !0, this.walkSync(S);
        if (this.listeners.OnceExit)
          if (S.type === "document")
            for (let w of S.nodes)
              this.visitSync(this.listeners.OnceExit, w);
          else
            this.visitSync(this.listeners.OnceExit, S);
      }
      return this.result;
    }
    then(S, w) {
      return process.env.NODE_ENV !== "production" && ("from" in this.opts || s(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(S, w);
    }
    toString() {
      return this.css;
    }
    visitSync(S, w) {
      for (let [T, N] of S) {
        this.result.lastPlugin = T;
        let U;
        try {
          U = N(w, this.helpers);
        } catch (z) {
          throw this.handleError(z, w.proxyOf);
        }
        if (w.type !== "root" && w.type !== "document" && !w.parent)
          return !0;
        if (m(U))
          throw this.getAsyncError();
      }
    }
    visitTick(S) {
      let w = S[S.length - 1], { node: T, visitors: N } = w;
      if (T.type !== "root" && T.type !== "document" && !T.parent) {
        S.pop();
        return;
      }
      if (N.length > 0 && w.visitorIndex < N.length) {
        let [z, ee] = N[w.visitorIndex];
        w.visitorIndex += 1, w.visitorIndex === N.length && (w.visitors = [], w.visitorIndex = 0), this.result.lastPlugin = z;
        try {
          return ee(T.toProxy(), this.helpers);
        } catch (W) {
          throw this.handleError(W, T);
        }
      }
      if (w.iterator !== 0) {
        let z = w.iterator, ee;
        for (; ee = T.nodes[T.indexes[z]]; )
          if (T.indexes[z] += 1, !ee[e]) {
            ee[e] = !0, S.push(y(ee));
            return;
          }
        w.iterator = 0, delete T.indexes[z];
      }
      let U = w.events;
      for (; w.eventIndex < U.length; ) {
        let z = U[w.eventIndex];
        if (w.eventIndex += 1, z === u) {
          T.nodes && T.nodes.length && (T[e] = !0, w.iterator = T.getIterator());
          return;
        } else if (this.listeners[z]) {
          w.visitors = this.listeners[z];
          return;
        }
      }
      S.pop();
    }
    walkSync(S) {
      S[e] = !0;
      let w = f(S);
      for (let T of w)
        if (T === u)
          S.nodes && S.each((N) => {
            N[e] || this.walkSync(N);
          });
        else {
          let N = this.listeners[T];
          if (N && this.visitSync(N, S.toProxy()))
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
    v = A;
  }, Zo = b, b.default = b, d.registerLazyResult(b), o.registerLazyResult(b), Zo;
}
var Qo, gc;
function db() {
  if (gc) return Qo;
  gc = 1;
  let e = pd(), t = Ui(), r = hd(), n = la();
  const i = oa();
  class o {
    constructor(c, l, d) {
      l = l.toString(), this.stringified = !1, this._processor = c, this._css = l, this._opts = d, this._map = void 0;
      let a, h = t;
      this.result = new i(this._processor, a, this._opts), this.result.css = l;
      let p = this;
      Object.defineProperty(this.result, "root", {
        get() {
          return p.root;
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
  return Qo = o, o.default = o, Qo;
}
var es, yc;
function pb() {
  if (yc) return es;
  yc = 1;
  let e = db(), t = gd(), r = ia(), n = Wn();
  class i {
    constructor(s = []) {
      this.version = "8.4.38", this.plugins = this.normalize(s);
    }
    normalize(s) {
      let c = [];
      for (let l of s)
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
    process(s, c = {}) {
      return !this.plugins.length && !c.parser && !c.stringifier && !c.syntax ? new e(this, s, c) : new t(this, s, c);
    }
    use(s) {
      return this.plugins = this.plugins.concat(this.normalize([s])), this;
    }
  }
  return es = i, i.default = i, n.registerProcessor(i), r.registerProcessor(i), es;
}
var ts, bc;
function hb() {
  if (bc) return ts;
  bc = 1;
  let e = qi(), t = dd(), r = ji(), n = sa(), i = Wi(), o = Wn(), s = aa();
  function c(l, d) {
    if (Array.isArray(l)) return l.map((p) => c(p));
    let { inputs: a, ...h } = l;
    if (a) {
      d = [];
      for (let p of a) {
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
      return new o(h);
    if (h.type === "decl")
      return new e(h);
    if (h.type === "rule")
      return new s(h);
    if (h.type === "comment")
      return new r(h);
    if (h.type === "atrule")
      return new n(h);
    throw new Error("Unknown node type: " + l.type);
  }
  return ts = c, c.default = c, ts;
}
var rs, kc;
function fb() {
  if (kc) return rs;
  kc = 1;
  let e = ra(), t = qi(), r = gd(), n = Br(), i = pb(), o = Ui(), s = hb(), c = ia(), l = fd(), d = ji(), a = sa(), h = oa(), p = Wi(), u = la(), m = md(), f = aa(), y = Wn(), M = Bi();
  function v(...b) {
    return b.length === 1 && Array.isArray(b[0]) && (b = b[0]), new i(b);
  }
  return v.plugin = function(A, S) {
    let w = !1;
    function T(...U) {
      console && console.warn && !w && (w = !0, console.warn(
        A + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`
      ), process.env.LANG && process.env.LANG.startsWith("cn") && console.warn(
        A + `: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`
      ));
      let z = S(...U);
      return z.postcssPlugin = A, z.postcssVersion = new i().version, z;
    }
    let N;
    return Object.defineProperty(T, "postcss", {
      get() {
        return N || (N = T()), N;
      }
    }), T.process = function(U, z, ee) {
      return v([T(ee)]).process(U, z);
    }, T;
  }, v.stringify = o, v.parse = u, v.fromJSON = s, v.list = m, v.comment = (b) => new d(b), v.atRule = (b) => new a(b), v.decl = (b) => new t(b), v.rule = (b) => new f(b), v.root = (b) => new y(b), v.document = (b) => new c(b), v.CssSyntaxError = e, v.Declaration = t, v.Container = n, v.Processor = i, v.Document = c, v.Comment = d, v.Warning = l, v.AtRule = a, v.Result = h, v.Input = p, v.Rule = f, v.Root = y, v.Node = M, r.registerPostcss(v), rs = v, v.default = v, rs;
}
var mb = fb();
const He = /* @__PURE__ */ nb(mb);
He.stringify;
He.fromJSON;
He.plugin;
He.parse;
He.list;
He.document;
He.comment;
He.atRule;
He.rule;
He.decl;
He.root;
He.CssSyntaxError;
He.Declaration;
He.Container;
He.Processor;
He.Document;
He.Comment;
He.Warning;
He.AtRule;
He.Result;
He.Input;
He.Rule;
He.Root;
He.Node;
var gb = Object.defineProperty, yb = (e, t, r) => t in e ? gb(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, Nt = (e, t, r) => yb(e, typeof t != "symbol" ? t + "" : t, r);
Date.now().toString();
function bb(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function kb(e) {
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
var hi = { exports: {} }, vc;
function vb() {
  if (vc) return hi.exports;
  vc = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return hi.exports = t(), hi.exports.createColors = t, hi.exports;
}
const wb = {}, xb = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: wb
}, Symbol.toStringTag, { value: "Module" })), Xt = /* @__PURE__ */ kb(xb);
var ns, wc;
function ca() {
  if (wc) return ns;
  wc = 1;
  let e = /* @__PURE__ */ vb(), t = Xt;
  class r extends Error {
    constructor(i, o, s, c, l, d) {
      super(i), this.name = "CssSyntaxError", this.reason = i, l && (this.file = l), c && (this.source = c), d && (this.plugin = d), typeof o < "u" && typeof s < "u" && (typeof o == "number" ? (this.line = o, this.column = s) : (this.line = o.line, this.column = o.column, this.endLine = s.line, this.endColumn = s.column)), this.setMessage(), Error.captureStackTrace && Error.captureStackTrace(this, r);
    }
    setMessage() {
      this.message = this.plugin ? this.plugin + ": " : "", this.message += this.file ? this.file : "<css input>", typeof this.line < "u" && (this.message += ":" + this.line + ":" + this.column), this.message += ": " + this.reason;
    }
    showSourceCode(i) {
      if (!this.source) return "";
      let o = this.source;
      i == null && (i = e.isColorSupported), t && i && (o = t(o));
      let s = o.split(/\r?\n/), c = Math.max(this.line - 3, 0), l = Math.min(this.line + 2, s.length), d = String(l).length, a, h;
      if (i) {
        let { bold: p, gray: u, red: m } = e.createColors(!0);
        a = (f) => p(m(f)), h = (f) => u(f);
      } else
        a = h = (p) => p;
      return s.slice(c, l).map((p, u) => {
        let m = c + 1 + u, f = " " + (" " + m).slice(-d) + " | ";
        if (m === this.line) {
          let y = h(f.replace(/\d/g, " ")) + p.slice(0, this.column - 1).replace(/[^\t]/g, " ");
          return a(">") + h(f) + p + `
 ` + y + a("^");
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
  return ns = r, r.default = r, ns;
}
var fi = {}, xc;
function ua() {
  return xc || (xc = 1, fi.isClean = Symbol("isClean"), fi.my = Symbol("my")), fi;
}
var is, Sc;
function yd() {
  if (Sc) return is;
  Sc = 1;
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
      let s = "@" + i.name, c = i.params ? this.rawValue(i, "params") : "";
      if (typeof i.raws.afterName < "u" ? s += i.raws.afterName : c && (s += " "), i.nodes)
        this.block(i, s + c);
      else {
        let l = (i.raws.between || "") + (o ? ";" : "");
        this.builder(s + c + l, i);
      }
    }
    beforeAfter(i, o) {
      let s;
      i.type === "decl" ? s = this.raw(i, null, "beforeDecl") : i.type === "comment" ? s = this.raw(i, null, "beforeComment") : o === "before" ? s = this.raw(i, null, "beforeRule") : s = this.raw(i, null, "beforeClose");
      let c = i.parent, l = 0;
      for (; c && c.type !== "root"; )
        l += 1, c = c.parent;
      if (s.includes(`
`)) {
        let d = this.raw(i, null, "indent");
        if (d.length)
          for (let a = 0; a < l; a++) s += d;
      }
      return s;
    }
    block(i, o) {
      let s = this.raw(i, "between", "beforeOpen");
      this.builder(o + s + "{", i, "start");
      let c;
      i.nodes && i.nodes.length ? (this.body(i), c = this.raw(i, "after")) : c = this.raw(i, "after", "emptyBody"), c && this.builder(c), this.builder("}", i, "end");
    }
    body(i) {
      let o = i.nodes.length - 1;
      for (; o > 0 && i.nodes[o].type === "comment"; )
        o -= 1;
      let s = this.raw(i, "semicolon");
      for (let c = 0; c < i.nodes.length; c++) {
        let l = i.nodes[c], d = this.raw(l, "before");
        d && this.builder(d), this.stringify(l, o !== c || s);
      }
    }
    comment(i) {
      let o = this.raw(i, "left", "commentLeft"), s = this.raw(i, "right", "commentRight");
      this.builder("/*" + o + i.text + s + "*/", i);
    }
    decl(i, o) {
      let s = this.raw(i, "between", "colon"), c = i.prop + s + this.rawValue(i, "value");
      i.important && (c += i.raws.important || " !important"), o && (c += ";"), this.builder(c, i);
    }
    document(i) {
      this.body(i);
    }
    raw(i, o, s) {
      let c;
      if (s || (s = o), o && (c = i.raws[o], typeof c < "u"))
        return c;
      let l = i.parent;
      if (s === "before" && (!l || l.type === "root" && l.first === i || l && l.type === "document"))
        return "";
      if (!l) return e[s];
      let d = i.root();
      if (d.rawCache || (d.rawCache = {}), typeof d.rawCache[s] < "u")
        return d.rawCache[s];
      if (s === "before" || s === "after")
        return this.beforeAfter(i, s);
      {
        let a = "raw" + t(s);
        this[a] ? c = this[a](d, i) : d.walk((h) => {
          if (c = h.raws[o], typeof c < "u") return !1;
        });
      }
      return typeof c > "u" && (c = e[s]), d.rawCache[s] = c, c;
    }
    rawBeforeClose(i) {
      let o;
      return i.walk((s) => {
        if (s.nodes && s.nodes.length > 0 && typeof s.raws.after < "u")
          return o = s.raws.after, o.includes(`
`) && (o = o.replace(/[^\n]+$/, "")), !1;
      }), o && (o = o.replace(/\S/g, "")), o;
    }
    rawBeforeComment(i, o) {
      let s;
      return i.walkComments((c) => {
        if (typeof c.raws.before < "u")
          return s = c.raws.before, s.includes(`
`) && (s = s.replace(/[^\n]+$/, "")), !1;
      }), typeof s > "u" ? s = this.raw(o, null, "beforeDecl") : s && (s = s.replace(/\S/g, "")), s;
    }
    rawBeforeDecl(i, o) {
      let s;
      return i.walkDecls((c) => {
        if (typeof c.raws.before < "u")
          return s = c.raws.before, s.includes(`
`) && (s = s.replace(/[^\n]+$/, "")), !1;
      }), typeof s > "u" ? s = this.raw(o, null, "beforeRule") : s && (s = s.replace(/\S/g, "")), s;
    }
    rawBeforeOpen(i) {
      let o;
      return i.walk((s) => {
        if (s.type !== "decl" && (o = s.raws.between, typeof o < "u"))
          return !1;
      }), o;
    }
    rawBeforeRule(i) {
      let o;
      return i.walk((s) => {
        if (s.nodes && (s.parent !== i || i.first !== s) && typeof s.raws.before < "u")
          return o = s.raws.before, o.includes(`
`) && (o = o.replace(/[^\n]+$/, "")), !1;
      }), o && (o = o.replace(/\S/g, "")), o;
    }
    rawColon(i) {
      let o;
      return i.walkDecls((s) => {
        if (typeof s.raws.between < "u")
          return o = s.raws.between.replace(/[^\s:]/g, ""), !1;
      }), o;
    }
    rawEmptyBody(i) {
      let o;
      return i.walk((s) => {
        if (s.nodes && s.nodes.length === 0 && (o = s.raws.after, typeof o < "u"))
          return !1;
      }), o;
    }
    rawIndent(i) {
      if (i.raws.indent) return i.raws.indent;
      let o;
      return i.walk((s) => {
        let c = s.parent;
        if (c && c !== i && c.parent && c.parent === i && typeof s.raws.before < "u") {
          let l = s.raws.before.split(`
`);
          return o = l[l.length - 1], o = o.replace(/\S/g, ""), !1;
        }
      }), o;
    }
    rawSemicolon(i) {
      let o;
      return i.walk((s) => {
        if (s.nodes && s.nodes.length && s.last.type === "decl" && (o = s.raws.semicolon, typeof o < "u"))
          return !1;
      }), o;
    }
    rawValue(i, o) {
      let s = i[o], c = i.raws[o];
      return c && c.value === s ? c.raw : s;
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
  return is = r, r.default = r, is;
}
var os, Ec;
function Hi() {
  if (Ec) return os;
  Ec = 1;
  let e = yd();
  function t(r, n) {
    new e(n).stringify(r);
  }
  return os = t, t.default = t, os;
}
var ss, Cc;
function Yi() {
  if (Cc) return ss;
  Cc = 1;
  let { isClean: e, my: t } = ua(), r = ca(), n = yd(), i = Hi();
  function o(c, l) {
    let d = new c.constructor();
    for (let a in c) {
      if (!Object.prototype.hasOwnProperty.call(c, a) || a === "proxyCache") continue;
      let h = c[a], p = typeof h;
      a === "parent" && p === "object" ? l && (d[a] = l) : a === "source" ? d[a] = h : Array.isArray(h) ? d[a] = h.map((u) => o(u, d)) : (p === "object" && h !== null && (h = o(h)), d[a] = h);
    }
    return d;
  }
  class s {
    constructor(l = {}) {
      this.raws = {}, this[e] = !1, this[t] = !0;
      for (let d in l)
        if (d === "nodes") {
          this.nodes = [];
          for (let a of l[d])
            typeof a.clone == "function" ? this.append(a.clone()) : this.append(a);
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
      let d = o(this);
      for (let a in l)
        d[a] = l[a];
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
        let { end: a, start: h } = this.rangeBy(d);
        return this.source.input.error(
          l,
          { column: h.column, line: h.line },
          { column: a.column, line: a.line },
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
        set(l, d, a) {
          return l[d] === a || (l[d] = a, (d === "prop" || d === "value" || d === "name" || d === "params" || d === "important" || /* c8 ignore next */
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
      let a = this.source.start;
      if (l.index)
        a = this.positionInside(l.index, d);
      else if (l.word) {
        d = this.toString();
        let h = d.indexOf(l.word);
        h !== -1 && (a = this.positionInside(h, d));
      }
      return a;
    }
    positionInside(l, d) {
      let a = d || this.toString(), h = this.source.start.column, p = this.source.start.line;
      for (let u = 0; u < l; u++)
        a[u] === `
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
      }, a = this.source.end ? {
        column: this.source.end.column + 1,
        line: this.source.end.line
      } : {
        column: d.column + 1,
        line: d.line
      };
      if (l.word) {
        let h = this.toString(), p = h.indexOf(l.word);
        p !== -1 && (d = this.positionInside(p, h), a = this.positionInside(p + l.word.length, h));
      } else
        l.start ? d = {
          column: l.start.column,
          line: l.start.line
        } : l.index && (d = this.positionInside(l.index)), l.end ? a = {
          column: l.end.column,
          line: l.end.line
        } : typeof l.endIndex == "number" ? a = this.positionInside(l.endIndex) : l.index && (a = this.positionInside(l.index + 1));
      return (a.line < d.line || a.line === d.line && a.column <= d.column) && (a = { column: d.column + 1, line: d.line }), { end: a, start: d };
    }
    raw(l, d) {
      return new n().raw(this, l, d);
    }
    remove() {
      return this.parent && this.parent.removeChild(this), this.parent = void 0, this;
    }
    replaceWith(...l) {
      if (this.parent) {
        let d = this, a = !1;
        for (let h of l)
          h === this ? a = !0 : a ? (this.parent.insertAfter(d, h), d = h) : this.parent.insertBefore(d, h);
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
    toJSON(l, d) {
      let a = {}, h = d == null;
      d = d || /* @__PURE__ */ new Map();
      let p = 0;
      for (let u in this) {
        if (!Object.prototype.hasOwnProperty.call(this, u) || u === "parent" || u === "proxyCache") continue;
        let m = this[u];
        if (Array.isArray(m))
          a[u] = m.map((f) => typeof f == "object" && f.toJSON ? f.toJSON(null, d) : f);
        else if (typeof m == "object" && m.toJSON)
          a[u] = m.toJSON(null, d);
        else if (u === "source") {
          let f = d.get(m.input);
          f == null && (f = p, d.set(m.input, p), p++), a[u] = {
            end: m.end,
            inputId: f,
            start: m.start
          };
        } else
          a[u] = m;
      }
      return h && (a.inputs = [...d.keys()].map((u) => u.toJSON())), a;
    }
    toProxy() {
      return this.proxyCache || (this.proxyCache = new Proxy(this, this.getProxyProcessor())), this.proxyCache;
    }
    toString(l = i) {
      l.stringify && (l = l.stringify);
      let d = "";
      return l(this, (a) => {
        d += a;
      }), d;
    }
    warn(l, d, a) {
      let h = { node: this };
      for (let p in a) h[p] = a[p];
      return l.warn(d, h);
    }
    get proxyOf() {
      return this;
    }
  }
  return ss = s, s.default = s, ss;
}
var as, Mc;
function Vi() {
  if (Mc) return as;
  Mc = 1;
  let e = Yi();
  class t extends e {
    constructor(n) {
      n && typeof n.value < "u" && typeof n.value != "string" && (n = { ...n, value: String(n.value) }), super(n), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return as = t, t.default = t, as;
}
var ls, Rc;
function Sb() {
  if (Rc) return ls;
  Rc = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return ls = { nanoid: (n = 21) => {
    let i = "", o = n;
    for (; o--; )
      i += e[Math.random() * 64 | 0];
    return i;
  }, customAlphabet: (n, i = 21) => (o = i) => {
    let s = "", c = o;
    for (; c--; )
      s += n[Math.random() * n.length | 0];
    return s;
  } }, ls;
}
var cs, Tc;
function bd() {
  if (Tc) return cs;
  Tc = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Xt, { existsSync: r, readFileSync: n } = Xt, { dirname: i, join: o } = Xt;
  function s(l) {
    return Buffer ? Buffer.from(l, "base64").toString() : window.atob(l);
  }
  class c {
    constructor(d, a) {
      if (a.map === !1) return;
      this.loadAnnotation(d), this.inline = this.startWith(this.annotation, "data:");
      let h = a.map ? a.map.prev : void 0, p = this.loadMap(a.from, h);
      !this.mapFile && a.from && (this.mapFile = a.from), this.mapFile && (this.root = i(this.mapFile)), p && (this.text = p);
    }
    consumer() {
      return this.consumerCache || (this.consumerCache = new e(this.text)), this.consumerCache;
    }
    decodeInline(d) {
      let a = /^data:application\/json;charset=utf-?8;base64,/, h = /^data:application\/json;base64,/, p = /^data:application\/json;charset=utf-?8,/, u = /^data:application\/json,/;
      if (p.test(d) || u.test(d))
        return decodeURIComponent(d.substr(RegExp.lastMatch.length));
      if (a.test(d) || h.test(d))
        return s(d.substr(RegExp.lastMatch.length));
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
      let a = d.match(/\/\*\s*# sourceMappingURL=/gm);
      if (!a) return;
      let h = d.lastIndexOf(a.pop()), p = d.indexOf("*/", h);
      h > -1 && p > -1 && (this.annotation = this.getAnnotationURL(d.substring(h, p)));
    }
    loadFile(d) {
      if (this.root = i(d), r(d))
        return this.mapFile = d, n(d, "utf-8").toString().trim();
    }
    loadMap(d, a) {
      if (a === !1) return !1;
      if (a) {
        if (typeof a == "string")
          return a;
        if (typeof a == "function") {
          let h = a(d);
          if (h) {
            let p = this.loadFile(h);
            if (!p)
              throw new Error(
                "Unable to load previous source map: " + h.toString()
              );
            return p;
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
          return d && (h = o(i(d), h)), this.loadFile(h);
        }
      }
    }
    startWith(d, a) {
      return d ? d.substr(0, a.length) === a : !1;
    }
    withContent() {
      return !!(this.consumer().sourcesContent && this.consumer().sourcesContent.length > 0);
    }
  }
  return cs = c, c.default = c, cs;
}
var us, Ac;
function Gi() {
  if (Ac) return us;
  Ac = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Xt, { fileURLToPath: r, pathToFileURL: n } = Xt, { isAbsolute: i, resolve: o } = Xt, { nanoid: s } = /* @__PURE__ */ Sb(), c = Xt, l = ca(), d = bd(), a = Symbol("fromOffsetCache"), h = !!(e && t), p = !!(o && i);
  class u {
    constructor(f, y = {}) {
      if (f === null || typeof f > "u" || typeof f == "object" && !f.toString)
        throw new Error(`PostCSS received ${f} instead of CSS string`);
      if (this.css = f.toString(), this.css[0] === "\uFEFF" || this.css[0] === "￾" ? (this.hasBOM = !0, this.css = this.css.slice(1)) : this.hasBOM = !1, y.from && (!p || /^\w+:\/\//.test(y.from) || i(y.from) ? this.file = y.from : this.file = o(y.from)), p && h) {
        let M = new d(this.css, y);
        if (M.text) {
          this.map = M;
          let v = M.consumer().file;
          !this.file && v && (this.file = this.mapResolve(v));
        }
      }
      this.file || (this.id = "<input css " + s(6) + ">"), this.map && (this.map.file = this.from);
    }
    error(f, y, M, v = {}) {
      let b, A, S;
      if (y && typeof y == "object") {
        let T = y, N = M;
        if (typeof T.offset == "number") {
          let U = this.fromOffset(T.offset);
          y = U.line, M = U.col;
        } else
          y = T.line, M = T.column;
        if (typeof N.offset == "number") {
          let U = this.fromOffset(N.offset);
          A = U.line, S = U.col;
        } else
          A = N.line, S = N.column;
      } else if (!M) {
        let T = this.fromOffset(y);
        y = T.line, M = T.col;
      }
      let w = this.origin(y, M, A, S);
      return w ? b = new l(
        f,
        w.endLine === void 0 ? w.line : { column: w.column, line: w.line },
        w.endLine === void 0 ? w.column : { column: w.endColumn, line: w.endLine },
        w.source,
        w.file,
        v.plugin
      ) : b = new l(
        f,
        A === void 0 ? y : { column: M, line: y },
        A === void 0 ? M : { column: S, line: A },
        this.css,
        this.file,
        v.plugin
      ), b.input = { column: M, endColumn: S, endLine: A, line: y, source: this.css }, this.file && (n && (b.input.url = n(this.file).toString()), b.input.file = this.file), b;
    }
    fromOffset(f) {
      let y, M;
      if (this[a])
        M = this[a];
      else {
        let b = this.css.split(`
`);
        M = new Array(b.length);
        let A = 0;
        for (let S = 0, w = b.length; S < w; S++)
          M[S] = A, A += b[S].length + 1;
        this[a] = M;
      }
      y = M[M.length - 1];
      let v = 0;
      if (f >= y)
        v = M.length - 1;
      else {
        let b = M.length - 2, A;
        for (; v < b; )
          if (A = v + (b - v >> 1), f < M[A])
            b = A - 1;
          else if (f >= M[A + 1])
            v = A + 1;
          else {
            v = A;
            break;
          }
      }
      return {
        col: f - M[v] + 1,
        line: v + 1
      };
    }
    mapResolve(f) {
      return /^\w+:\/\//.test(f) ? f : o(this.map.consumer().sourceRoot || this.map.root || ".", f);
    }
    origin(f, y, M, v) {
      if (!this.map) return !1;
      let b = this.map.consumer(), A = b.originalPositionFor({ column: y, line: f });
      if (!A.source) return !1;
      let S;
      typeof M == "number" && (S = b.originalPositionFor({ column: v, line: M }));
      let w;
      i(A.source) ? w = n(A.source) : w = new URL(
        A.source,
        this.map.consumer().sourceRoot || n(this.map.mapFile)
      );
      let T = {
        column: A.column,
        endColumn: S && S.column,
        endLine: S && S.line,
        line: A.line,
        url: w.toString()
      };
      if (w.protocol === "file:")
        if (r)
          T.file = r(w);
        else
          throw new Error("file: protocol is not available in this PostCSS build");
      let N = b.sourceContentFor(A.source);
      return N && (T.source = N), T;
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
  return us = u, u.default = u, c && c.registerInput && c.registerInput(u), us;
}
var ds, _c;
function kd() {
  if (_c) return ds;
  _c = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Xt, { dirname: r, relative: n, resolve: i, sep: o } = Xt, { pathToFileURL: s } = Xt, c = Gi(), l = !!(e && t), d = !!(r && i && n && o);
  class a {
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
      }, y, M;
      this.stringify(this.root, (v, b, A) => {
        if (this.css += v, b && A !== "end" && (f.generated.line = p, f.generated.column = u - 1, b.source && b.source.start ? (f.source = this.sourcePath(b), f.original.line = b.source.start.line, f.original.column = b.source.start.column - 1, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, this.map.addMapping(f))), y = v.match(/\n/g), y ? (p += y.length, M = v.lastIndexOf(`
`), u = v.length - M) : u += v.length, b && A !== "start") {
          let S = b.parent || { raws: {} };
          (!(b.type === "decl" || b.type === "atrule" && !b.nodes) || b !== S.last || S.raws.semicolon) && (b.source && b.source.end ? (f.source = this.sourcePath(b), f.original.line = b.source.end.line, f.original.column = b.source.end.column - 1, f.generated.line = p, f.generated.column = u - 2, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, f.generated.line = p, f.generated.column = u - 1, this.map.addMapping(f)));
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
      if (s) {
        let m = s(p).toString();
        return this.memoizedFileURLs.set(p, m), m;
      } else
        throw new Error(
          "`map.absolute` option is not available in this PostCSS build"
        );
    }
    toUrl(p) {
      let u = this.memoizedURLs.get(p);
      if (u) return u;
      o === "\\" && (p = p.replace(/\\/g, "/"));
      let m = encodeURI(p).replace(/[#?]/g, encodeURIComponent);
      return this.memoizedURLs.set(p, m), m;
    }
  }
  return ds = a, ds;
}
var ps, Lc;
function Ki() {
  if (Lc) return ps;
  Lc = 1;
  let e = Yi();
  class t extends e {
    constructor(n) {
      super(n), this.type = "comment";
    }
  }
  return ps = t, t.default = t, ps;
}
var hs, Ic;
function qr() {
  if (Ic) return hs;
  Ic = 1;
  let { isClean: e, my: t } = ua(), r = Vi(), n = Ki(), i = Yi(), o, s, c, l;
  function d(p) {
    return p.map((u) => (u.nodes && (u.nodes = d(u.nodes)), delete u.source, u));
  }
  function a(p) {
    if (p[e] = !1, p.proxyOf.nodes)
      for (let u of p.proxyOf.nodes)
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
      for (let b of M) this.proxyOf.nodes.splice(f, 0, b);
      let v;
      for (let b in this.indexes)
        v = this.indexes[b], f <= v && (this.indexes[b] = v + M.length);
      return this.markDirty(), this;
    }
    normalize(u, m) {
      if (typeof u == "string")
        u = d(o(u).nodes);
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
        u = [new s(u)];
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
  return h.registerParse = (p) => {
    o = p;
  }, h.registerRule = (p) => {
    s = p;
  }, h.registerAtRule = (p) => {
    c = p;
  }, h.registerRoot = (p) => {
    l = p;
  }, hs = h, h.default = h, h.rebuild = (p) => {
    p.type === "atrule" ? Object.setPrototypeOf(p, c.prototype) : p.type === "rule" ? Object.setPrototypeOf(p, s.prototype) : p.type === "decl" ? Object.setPrototypeOf(p, r.prototype) : p.type === "comment" ? Object.setPrototypeOf(p, n.prototype) : p.type === "root" && Object.setPrototypeOf(p, l.prototype), p[t] = !0, p.nodes && p.nodes.forEach((u) => {
      h.rebuild(u);
    });
  }, hs;
}
var fs, Oc;
function da() {
  if (Oc) return fs;
  Oc = 1;
  let e = qr(), t, r;
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
  }, fs = n, n.default = n, fs;
}
var ms, Nc;
function vd() {
  if (Nc) return ms;
  Nc = 1;
  let e = {};
  return ms = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, ms;
}
var gs, Pc;
function wd() {
  if (Pc) return gs;
  Pc = 1;
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
  return gs = e, e.default = e, gs;
}
var ys, $c;
function pa() {
  if ($c) return ys;
  $c = 1;
  let e = wd();
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
  return ys = t, t.default = t, ys;
}
var bs, zc;
function Eb() {
  if (zc) return bs;
  zc = 1;
  const e = 39, t = 34, r = 92, n = 47, i = 10, o = 32, s = 12, c = 9, l = 13, d = 91, a = 93, h = 40, p = 41, u = 123, m = 125, f = 59, y = 42, M = 58, v = 64, b = /[\t\n\f\r "#'()/;[\\\]{}]/g, A = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, S = /.[\r\n"'(/\\]/, w = /[\da-f]/i;
  return bs = function(N, U = {}) {
    let z = N.css.valueOf(), ee = U.ignoreErrors, W, O, nt, Ke, fe, pe, Re, Fe, Te, ke, Ve = z.length, P = 0, H = [], se = [];
    function re() {
      return P;
    }
    function ce(G) {
      throw N.error("Unclosed " + G, P);
    }
    function Ae() {
      return se.length === 0 && P >= Ve;
    }
    function Ue(G) {
      if (se.length) return se.pop();
      if (P >= Ve) return;
      let oe = G ? G.ignoreUnclosed : !1;
      switch (W = z.charCodeAt(P), W) {
        case i:
        case o:
        case c:
        case l:
        case s: {
          O = P;
          do
            O += 1, W = z.charCodeAt(O);
          while (W === o || W === i || W === c || W === l || W === s);
          ke = ["space", z.slice(P, O)], P = O - 1;
          break;
        }
        case d:
        case a:
        case u:
        case m:
        case M:
        case f:
        case p: {
          let ge = String.fromCharCode(W);
          ke = [ge, ge, P];
          break;
        }
        case h: {
          if (Fe = H.length ? H.pop()[1] : "", Te = z.charCodeAt(P + 1), Fe === "url" && Te !== e && Te !== t && Te !== o && Te !== i && Te !== c && Te !== s && Te !== l) {
            O = P;
            do {
              if (pe = !1, O = z.indexOf(")", O + 1), O === -1)
                if (ee || oe) {
                  O = P;
                  break;
                } else
                  ce("bracket");
              for (Re = O; z.charCodeAt(Re - 1) === r; )
                Re -= 1, pe = !pe;
            } while (pe);
            ke = ["brackets", z.slice(P, O + 1), P, O], P = O;
          } else
            O = z.indexOf(")", P + 1), Ke = z.slice(P, O + 1), O === -1 || S.test(Ke) ? ke = ["(", "(", P] : (ke = ["brackets", Ke, P, O], P = O);
          break;
        }
        case e:
        case t: {
          nt = W === e ? "'" : '"', O = P;
          do {
            if (pe = !1, O = z.indexOf(nt, O + 1), O === -1)
              if (ee || oe) {
                O = P + 1;
                break;
              } else
                ce("string");
            for (Re = O; z.charCodeAt(Re - 1) === r; )
              Re -= 1, pe = !pe;
          } while (pe);
          ke = ["string", z.slice(P, O + 1), P, O], P = O;
          break;
        }
        case v: {
          b.lastIndex = P + 1, b.test(z), b.lastIndex === 0 ? O = z.length - 1 : O = b.lastIndex - 2, ke = ["at-word", z.slice(P, O + 1), P, O], P = O;
          break;
        }
        case r: {
          for (O = P, fe = !0; z.charCodeAt(O + 1) === r; )
            O += 1, fe = !fe;
          if (W = z.charCodeAt(O + 1), fe && W !== n && W !== o && W !== i && W !== c && W !== l && W !== s && (O += 1, w.test(z.charAt(O)))) {
            for (; w.test(z.charAt(O + 1)); )
              O += 1;
            z.charCodeAt(O + 1) === o && (O += 1);
          }
          ke = ["word", z.slice(P, O + 1), P, O], P = O;
          break;
        }
        default: {
          W === n && z.charCodeAt(P + 1) === y ? (O = z.indexOf("*/", P + 2) + 1, O === 0 && (ee || oe ? O = z.length : ce("comment")), ke = ["comment", z.slice(P, O + 1), P, O], P = O) : (A.lastIndex = P + 1, A.test(z), A.lastIndex === 0 ? O = z.length - 1 : O = A.lastIndex - 2, ke = ["word", z.slice(P, O + 1), P, O], H.push(ke), P = O);
          break;
        }
      }
      return P++, ke;
    }
    function Se(G) {
      se.push(G);
    }
    return {
      back: Se,
      endOfFile: Ae,
      nextToken: Ue,
      position: re
    };
  }, bs;
}
var ks, Dc;
function ha() {
  if (Dc) return ks;
  Dc = 1;
  let e = qr();
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
  return ks = t, t.default = t, e.registerAtRule(t), ks;
}
var vs, Fc;
function jn() {
  if (Fc) return vs;
  Fc = 1;
  let e = qr(), t, r;
  class n extends e {
    constructor(o) {
      super(o), this.type = "root", this.nodes || (this.nodes = []);
    }
    normalize(o, s, c) {
      let l = super.normalize(o);
      if (s) {
        if (c === "prepend")
          this.nodes.length > 1 ? s.raws.before = this.nodes[1].raws.before : delete s.raws.before;
        else if (this.first !== s)
          for (let d of l)
            d.raws.before = s.raws.before;
      }
      return l;
    }
    removeChild(o, s) {
      let c = this.index(o);
      return !s && c === 0 && this.nodes.length > 1 && (this.nodes[1].raws.before = this.nodes[c].raws.before), super.removeChild(o);
    }
    toResult(o = {}) {
      return new t(new r(), this, o).stringify();
    }
  }
  return n.registerLazyResult = (i) => {
    t = i;
  }, n.registerProcessor = (i) => {
    r = i;
  }, vs = n, n.default = n, e.registerRoot(n), vs;
}
var ws, Uc;
function xd() {
  if (Uc) return ws;
  Uc = 1;
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
      let i = [], o = "", s = !1, c = 0, l = !1, d = "", a = !1;
      for (let h of t)
        a ? a = !1 : h === "\\" ? a = !0 : l ? h === d && (l = !1) : h === '"' || h === "'" ? (l = !0, d = h) : h === "(" ? c += 1 : h === ")" ? c > 0 && (c -= 1) : c === 0 && r.includes(h) && (s = !0), s ? (o !== "" && i.push(o.trim()), o = "", s = !1) : o += h;
      return (n || o !== "") && i.push(o.trim()), i;
    }
  };
  return ws = e, e.default = e, ws;
}
var xs, Bc;
function fa() {
  if (Bc) return xs;
  Bc = 1;
  let e = qr(), t = xd();
  class r extends e {
    constructor(i) {
      super(i), this.type = "rule", this.nodes || (this.nodes = []);
    }
    get selectors() {
      return t.comma(this.selector);
    }
    set selectors(i) {
      let o = this.selector ? this.selector.match(/,\s*/) : null, s = o ? o[0] : "," + this.raw("between", "beforeOpen");
      this.selector = i.join(s);
    }
  }
  return xs = r, r.default = r, e.registerRule(r), xs;
}
var Ss, qc;
function Cb() {
  if (qc) return Ss;
  qc = 1;
  let e = Vi(), t = Eb(), r = Ki(), n = ha(), i = jn(), o = fa();
  const s = {
    empty: !0,
    space: !0
  };
  function c(d) {
    for (let a = d.length - 1; a >= 0; a--) {
      let h = d[a], p = h[3] || h[2];
      if (p) return p;
    }
  }
  class l {
    constructor(a) {
      this.input = a, this.root = new i(), this.current = this.root, this.spaces = "", this.semicolon = !1, this.createTokenizer(), this.root.source = { input: a, start: { column: 1, line: 1, offset: 0 } };
    }
    atrule(a) {
      let h = new n();
      h.name = a[1].slice(1), h.name === "" && this.unnamedAtrule(h, a), this.init(h, a[2]);
      let p, u, m, f = !1, y = !1, M = [], v = [];
      for (; !this.tokenizer.endOfFile(); ) {
        if (a = this.tokenizer.nextToken(), p = a[0], p === "(" || p === "[" ? v.push(p === "(" ? ")" : "]") : p === "{" && v.length > 0 ? v.push("}") : p === v[v.length - 1] && v.pop(), v.length === 0)
          if (p === ";") {
            h.source.end = this.getPosition(a[2]), h.source.end.offset++, this.semicolon = !0;
            break;
          } else if (p === "{") {
            y = !0;
            break;
          } else if (p === "}") {
            if (M.length > 0) {
              for (m = M.length - 1, u = M[m]; u && u[0] === "space"; )
                u = M[--m];
              u && (h.source.end = this.getPosition(u[3] || u[2]), h.source.end.offset++);
            }
            this.end(a);
            break;
          } else
            M.push(a);
        else
          M.push(a);
        if (this.tokenizer.endOfFile()) {
          f = !0;
          break;
        }
      }
      h.raws.between = this.spacesAndCommentsFromEnd(M), M.length ? (h.raws.afterName = this.spacesAndCommentsFromStart(M), this.raw(h, "params", M), f && (a = M[M.length - 1], h.source.end = this.getPosition(a[3] || a[2]), h.source.end.offset++, this.spaces = h.raws.between, h.raws.between = "")) : (h.raws.afterName = "", h.params = ""), y && (h.nodes = [], this.current = h);
    }
    checkMissedSemicolon(a) {
      let h = this.colon(a);
      if (h === !1) return;
      let p = 0, u;
      for (let m = h - 1; m >= 0 && (u = a[m], !(u[0] !== "space" && (p += 1, p === 2))); m--)
        ;
      throw this.input.error(
        "Missed semicolon",
        u[0] === "word" ? u[3] + 1 : u[2]
      );
    }
    colon(a) {
      let h = 0, p, u, m;
      for (let [f, y] of a.entries()) {
        if (p = y, u = p[0], u === "(" && (h += 1), u === ")" && (h -= 1), h === 0 && u === ":")
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
    comment(a) {
      let h = new r();
      this.init(h, a[2]), h.source.end = this.getPosition(a[3] || a[2]), h.source.end.offset++;
      let p = a[1].slice(2, -2);
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
    decl(a, h) {
      let p = new e();
      this.init(p, a[0][2]);
      let u = a[a.length - 1];
      for (u[0] === ";" && (this.semicolon = !0, a.pop()), p.source.end = this.getPosition(
        u[3] || u[2] || c(a)
      ), p.source.end.offset++; a[0][0] !== "word"; )
        a.length === 1 && this.unknownWord(a), p.raws.before += a.shift()[1];
      for (p.source.start = this.getPosition(a[0][2]), p.prop = ""; a.length; ) {
        let v = a[0][0];
        if (v === ":" || v === "space" || v === "comment")
          break;
        p.prop += a.shift()[1];
      }
      p.raws.between = "";
      let m;
      for (; a.length; )
        if (m = a.shift(), m[0] === ":") {
          p.raws.between += m[1];
          break;
        } else
          m[0] === "word" && /\w/.test(m[1]) && this.unknownWord([m]), p.raws.between += m[1];
      (p.prop[0] === "_" || p.prop[0] === "*") && (p.raws.before += p.prop[0], p.prop = p.prop.slice(1));
      let f = [], y;
      for (; a.length && (y = a[0][0], !(y !== "space" && y !== "comment")); )
        f.push(a.shift());
      this.precheckMissedSemicolon(a);
      for (let v = a.length - 1; v >= 0; v--) {
        if (m = a[v], m[1].toLowerCase() === "!important") {
          p.important = !0;
          let b = this.stringFrom(a, v);
          b = this.spacesFromEnd(a) + b, b !== " !important" && (p.raws.important = b);
          break;
        } else if (m[1].toLowerCase() === "important") {
          let b = a.slice(0), A = "";
          for (let S = v; S > 0; S--) {
            let w = b[S][0];
            if (A.trim().indexOf("!") === 0 && w !== "space")
              break;
            A = b.pop()[1] + A;
          }
          A.trim().indexOf("!") === 0 && (p.important = !0, p.raws.important = A, a = b);
        }
        if (m[0] !== "space" && m[0] !== "comment")
          break;
      }
      a.some((v) => v[0] !== "space" && v[0] !== "comment") && (p.raws.between += f.map((v) => v[1]).join(""), f = []), this.raw(p, "value", f.concat(a), h), p.value.includes(":") && !h && this.checkMissedSemicolon(a);
    }
    doubleColon(a) {
      throw this.input.error(
        "Double colon",
        { offset: a[2] },
        { offset: a[2] + a[1].length }
      );
    }
    emptyRule(a) {
      let h = new o();
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
      let h = !1, p = null, u = !1, m = null, f = [], y = a[1].startsWith("--"), M = [], v = a;
      for (; v; ) {
        if (p = v[0], M.push(v), p === "(" || p === "[")
          m || (m = v), f.push(p === "(" ? ")" : "]");
        else if (y && u && p === "{")
          m || (m = v), f.push("}");
        else if (f.length === 0)
          if (p === ";")
            if (u) {
              this.decl(M, y);
              return;
            } else
              break;
          else if (p === "{") {
            this.rule(M);
            return;
          } else if (p === "}") {
            this.tokenizer.back(M.pop()), h = !0;
            break;
          } else p === ":" && (u = !0);
        else p === f[f.length - 1] && (f.pop(), f.length === 0 && (m = null));
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
    raw(a, h, p, u) {
      let m, f, y = p.length, M = "", v = !0, b, A;
      for (let S = 0; S < y; S += 1)
        m = p[S], f = m[0], f === "space" && S === y - 1 && !u ? v = !1 : f === "comment" ? (A = p[S - 1] ? p[S - 1][0] : "empty", b = p[S + 1] ? p[S + 1][0] : "empty", !s[A] && !s[b] ? M.slice(-1) === "," ? v = !1 : M += m[1] : v = !1) : M += m[1];
      if (!v) {
        let S = p.reduce((w, T) => w + T[1], "");
        a.raws[h] = { raw: S, value: M };
      }
      a[h] = M;
    }
    rule(a) {
      a.pop();
      let h = new o();
      this.init(h, a[0][2]), h.raws.between = this.spacesAndCommentsFromEnd(a), this.raw(h, "selector", a), this.current = h;
    }
    spacesAndCommentsFromEnd(a) {
      let h, p = "";
      for (; a.length && (h = a[a.length - 1][0], !(h !== "space" && h !== "comment")); )
        p = a.pop()[1] + p;
      return p;
    }
    // Errors
    spacesAndCommentsFromStart(a) {
      let h, p = "";
      for (; a.length && (h = a[0][0], !(h !== "space" && h !== "comment")); )
        p += a.shift()[1];
      return p;
    }
    spacesFromEnd(a) {
      let h, p = "";
      for (; a.length && (h = a[a.length - 1][0], h === "space"); )
        p = a.pop()[1] + p;
      return p;
    }
    stringFrom(a, h) {
      let p = "";
      for (let u = h; u < a.length; u++)
        p += a[u][1];
      return a.splice(h, a.length - h), p;
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
  return Ss = l, Ss;
}
var Es, Wc;
function ma() {
  if (Wc) return Es;
  Wc = 1;
  let e = qr(), t = Cb(), r = Gi();
  function n(i, o) {
    let s = new r(i, o), c = new t(s);
    try {
      c.parse();
    } catch (l) {
      throw process.env.NODE_ENV !== "production" && l.name === "CssSyntaxError" && o && o.from && (/\.scss$/i.test(o.from) ? l.message += `
You tried to parse SCSS with the standard CSS parser; try again with the postcss-scss parser` : /\.sass/i.test(o.from) ? l.message += `
You tried to parse Sass with the standard CSS parser; try again with the postcss-sass parser` : /\.less$/i.test(o.from) && (l.message += `
You tried to parse Less with the standard CSS parser; try again with the postcss-less parser`)), l;
    }
    return c.root;
  }
  return Es = n, n.default = n, e.registerParse(n), Es;
}
var Cs, jc;
function Sd() {
  if (jc) return Cs;
  jc = 1;
  let { isClean: e, my: t } = ua(), r = kd(), n = Hi(), i = qr(), o = da(), s = vd(), c = pa(), l = ma(), d = jn();
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
  }, p = {
    Once: !0,
    postcssPlugin: !0,
    prepare: !0
  }, u = 0;
  function m(A) {
    return typeof A == "object" && typeof A.then == "function";
  }
  function f(A) {
    let S = !1, w = a[A.type];
    return A.type === "decl" ? S = A.prop.toLowerCase() : A.type === "atrule" && (S = A.name.toLowerCase()), S && A.append ? [
      w,
      w + "-" + S,
      u,
      w + "Exit",
      w + "Exit-" + S
    ] : S ? [w, w + "-" + S, w + "Exit", w + "Exit-" + S] : A.append ? [w, u, w + "Exit"] : [w, w + "Exit"];
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
  function M(A) {
    return A[e] = !1, A.nodes && A.nodes.forEach((S) => M(S)), A;
  }
  let v = {};
  class b {
    constructor(S, w, T) {
      this.stringified = !1, this.processed = !1;
      let N;
      if (typeof w == "object" && w !== null && (w.type === "root" || w.type === "document"))
        N = M(w);
      else if (w instanceof b || w instanceof c)
        N = M(w.root), w.map && (typeof T.map > "u" && (T.map = {}), T.map.inline || (T.map.inline = !1), T.map.prev = w.map);
      else {
        let U = l;
        T.syntax && (U = T.syntax.parse), T.parser && (U = T.parser), U.parse && (U = U.parse);
        try {
          N = U(w, T);
        } catch (z) {
          this.processed = !0, this.error = z;
        }
        N && !N[t] && i.rebuild(N);
      }
      this.result = new c(S, N, T), this.helpers = { ...v, postcss: v, result: this.result }, this.plugins = this.processor.plugins.map((U) => typeof U == "object" && U.prepare ? { ...U, ...U.prepare(this.result) } : U);
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
    handleError(S, w) {
      let T = this.result.lastPlugin;
      try {
        if (w && w.addToError(S), this.error = S, S.name === "CssSyntaxError" && !S.plugin)
          S.plugin = T.postcssPlugin, S.setMessage();
        else if (T.postcssVersion && process.env.NODE_ENV !== "production") {
          let N = T.postcssPlugin, U = T.postcssVersion, z = this.result.processor.version, ee = U.split("."), W = z.split(".");
          (ee[0] !== W[0] || parseInt(ee[1]) > parseInt(W[1])) && console.error(
            "Unknown error from PostCSS plugin. Your current PostCSS version is " + z + ", but " + N + " uses " + U + ". Perhaps this is the source of the error below."
          );
        }
      } catch (N) {
        console && console.error && console.error(N);
      }
      return S;
    }
    prepareVisitors() {
      this.listeners = {};
      let S = (w, T, N) => {
        this.listeners[T] || (this.listeners[T] = []), this.listeners[T].push([w, N]);
      };
      for (let w of this.plugins)
        if (typeof w == "object")
          for (let T in w) {
            if (!h[T] && /^[A-Z]/.test(T))
              throw new Error(
                `Unknown event ${T} in ${w.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`
              );
            if (!p[T])
              if (typeof w[T] == "object")
                for (let N in w[T])
                  N === "*" ? S(w, T, w[T][N]) : S(
                    w,
                    T + "-" + N.toLowerCase(),
                    w[T][N]
                  );
              else typeof w[T] == "function" && S(w, T, w[T]);
          }
      this.hasListener = Object.keys(this.listeners).length > 0;
    }
    async runAsync() {
      this.plugin = 0;
      for (let S = 0; S < this.plugins.length; S++) {
        let w = this.plugins[S], T = this.runOnRoot(w);
        if (m(T))
          try {
            await T;
          } catch (N) {
            throw this.handleError(N);
          }
      }
      if (this.prepareVisitors(), this.hasListener) {
        let S = this.result.root;
        for (; !S[e]; ) {
          S[e] = !0;
          let w = [y(S)];
          for (; w.length > 0; ) {
            let T = this.visitTick(w);
            if (m(T))
              try {
                await T;
              } catch (N) {
                let U = w[w.length - 1].node;
                throw this.handleError(N, U);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [w, T] of this.listeners.OnceExit) {
            this.result.lastPlugin = w;
            try {
              if (S.type === "document") {
                let N = S.nodes.map(
                  (U) => T(U, this.helpers)
                );
                await Promise.all(N);
              } else
                await T(S, this.helpers);
            } catch (N) {
              throw this.handleError(N);
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
            let w = this.result.root.nodes.map(
              (T) => S.Once(T, this.helpers)
            );
            return m(w[0]) ? Promise.all(w) : w;
          }
          return S.Once(this.result.root, this.helpers);
        } else if (typeof S == "function")
          return S(this.result.root, this.result);
      } catch (w) {
        throw this.handleError(w);
      }
    }
    stringify() {
      if (this.error) throw this.error;
      if (this.stringified) return this.result;
      this.stringified = !0, this.sync();
      let S = this.result.opts, w = n;
      S.syntax && (w = S.syntax.stringify), S.stringifier && (w = S.stringifier), w.stringify && (w = w.stringify);
      let N = new r(w, this.result.root, this.result.opts).generate();
      return this.result.css = N[0], this.result.map = N[1], this.result;
    }
    sync() {
      if (this.error) throw this.error;
      if (this.processed) return this.result;
      if (this.processed = !0, this.processing)
        throw this.getAsyncError();
      for (let S of this.plugins) {
        let w = this.runOnRoot(S);
        if (m(w))
          throw this.getAsyncError();
      }
      if (this.prepareVisitors(), this.hasListener) {
        let S = this.result.root;
        for (; !S[e]; )
          S[e] = !0, this.walkSync(S);
        if (this.listeners.OnceExit)
          if (S.type === "document")
            for (let w of S.nodes)
              this.visitSync(this.listeners.OnceExit, w);
          else
            this.visitSync(this.listeners.OnceExit, S);
      }
      return this.result;
    }
    then(S, w) {
      return process.env.NODE_ENV !== "production" && ("from" in this.opts || s(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(S, w);
    }
    toString() {
      return this.css;
    }
    visitSync(S, w) {
      for (let [T, N] of S) {
        this.result.lastPlugin = T;
        let U;
        try {
          U = N(w, this.helpers);
        } catch (z) {
          throw this.handleError(z, w.proxyOf);
        }
        if (w.type !== "root" && w.type !== "document" && !w.parent)
          return !0;
        if (m(U))
          throw this.getAsyncError();
      }
    }
    visitTick(S) {
      let w = S[S.length - 1], { node: T, visitors: N } = w;
      if (T.type !== "root" && T.type !== "document" && !T.parent) {
        S.pop();
        return;
      }
      if (N.length > 0 && w.visitorIndex < N.length) {
        let [z, ee] = N[w.visitorIndex];
        w.visitorIndex += 1, w.visitorIndex === N.length && (w.visitors = [], w.visitorIndex = 0), this.result.lastPlugin = z;
        try {
          return ee(T.toProxy(), this.helpers);
        } catch (W) {
          throw this.handleError(W, T);
        }
      }
      if (w.iterator !== 0) {
        let z = w.iterator, ee;
        for (; ee = T.nodes[T.indexes[z]]; )
          if (T.indexes[z] += 1, !ee[e]) {
            ee[e] = !0, S.push(y(ee));
            return;
          }
        w.iterator = 0, delete T.indexes[z];
      }
      let U = w.events;
      for (; w.eventIndex < U.length; ) {
        let z = U[w.eventIndex];
        if (w.eventIndex += 1, z === u) {
          T.nodes && T.nodes.length && (T[e] = !0, w.iterator = T.getIterator());
          return;
        } else if (this.listeners[z]) {
          w.visitors = this.listeners[z];
          return;
        }
      }
      S.pop();
    }
    walkSync(S) {
      S[e] = !0;
      let w = f(S);
      for (let T of w)
        if (T === u)
          S.nodes && S.each((N) => {
            N[e] || this.walkSync(N);
          });
        else {
          let N = this.listeners[T];
          if (N && this.visitSync(N, S.toProxy()))
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
    v = A;
  }, Cs = b, b.default = b, d.registerLazyResult(b), o.registerLazyResult(b), Cs;
}
var Ms, Hc;
function Mb() {
  if (Hc) return Ms;
  Hc = 1;
  let e = kd(), t = Hi(), r = vd(), n = ma();
  const i = pa();
  class o {
    constructor(c, l, d) {
      l = l.toString(), this.stringified = !1, this._processor = c, this._css = l, this._opts = d, this._map = void 0;
      let a, h = t;
      this.result = new i(this._processor, a, this._opts), this.result.css = l;
      let p = this;
      Object.defineProperty(this.result, "root", {
        get() {
          return p.root;
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
  return Ms = o, o.default = o, Ms;
}
var Rs, Yc;
function Rb() {
  if (Yc) return Rs;
  Yc = 1;
  let e = Mb(), t = Sd(), r = da(), n = jn();
  class i {
    constructor(s = []) {
      this.version = "8.4.38", this.plugins = this.normalize(s);
    }
    normalize(s) {
      let c = [];
      for (let l of s)
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
    process(s, c = {}) {
      return !this.plugins.length && !c.parser && !c.stringifier && !c.syntax ? new e(this, s, c) : new t(this, s, c);
    }
    use(s) {
      return this.plugins = this.plugins.concat(this.normalize([s])), this;
    }
  }
  return Rs = i, i.default = i, n.registerProcessor(i), r.registerProcessor(i), Rs;
}
var Ts, Vc;
function Tb() {
  if (Vc) return Ts;
  Vc = 1;
  let e = Vi(), t = bd(), r = Ki(), n = ha(), i = Gi(), o = jn(), s = fa();
  function c(l, d) {
    if (Array.isArray(l)) return l.map((p) => c(p));
    let { inputs: a, ...h } = l;
    if (a) {
      d = [];
      for (let p of a) {
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
      return new o(h);
    if (h.type === "decl")
      return new e(h);
    if (h.type === "rule")
      return new s(h);
    if (h.type === "comment")
      return new r(h);
    if (h.type === "atrule")
      return new n(h);
    throw new Error("Unknown node type: " + l.type);
  }
  return Ts = c, c.default = c, Ts;
}
var As, Gc;
function Ab() {
  if (Gc) return As;
  Gc = 1;
  let e = ca(), t = Vi(), r = Sd(), n = qr(), i = Rb(), o = Hi(), s = Tb(), c = da(), l = wd(), d = Ki(), a = ha(), h = pa(), p = Gi(), u = ma(), m = xd(), f = fa(), y = jn(), M = Yi();
  function v(...b) {
    return b.length === 1 && Array.isArray(b[0]) && (b = b[0]), new i(b);
  }
  return v.plugin = function(A, S) {
    let w = !1;
    function T(...U) {
      console && console.warn && !w && (w = !0, console.warn(
        A + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`
      ), process.env.LANG && process.env.LANG.startsWith("cn") && console.warn(
        A + `: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`
      ));
      let z = S(...U);
      return z.postcssPlugin = A, z.postcssVersion = new i().version, z;
    }
    let N;
    return Object.defineProperty(T, "postcss", {
      get() {
        return N || (N = T()), N;
      }
    }), T.process = function(U, z, ee) {
      return v([T(ee)]).process(U, z);
    }, T;
  }, v.stringify = o, v.parse = u, v.fromJSON = s, v.list = m, v.comment = (b) => new d(b), v.atRule = (b) => new a(b), v.decl = (b) => new t(b), v.rule = (b) => new f(b), v.root = (b) => new y(b), v.document = (b) => new c(b), v.CssSyntaxError = e, v.Declaration = t, v.Container = n, v.Processor = i, v.Document = c, v.Comment = d, v.Warning = l, v.AtRule = a, v.Result = h, v.Input = p, v.Rule = f, v.Root = y, v.Node = M, r.registerPostcss(v), As = v, v.default = v, As;
}
var _b = Ab();
const Ye = /* @__PURE__ */ bb(_b);
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
class ga {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  constructor(...t) {
    Nt(this, "parentElement", null), Nt(this, "parentNode", null), Nt(this, "ownerDocument"), Nt(this, "firstChild", null), Nt(this, "lastChild", null), Nt(this, "previousSibling", null), Nt(this, "nextSibling", null), Nt(this, "ELEMENT_NODE", 1), Nt(this, "TEXT_NODE", 3), Nt(this, "nodeType"), Nt(this, "nodeName"), Nt(this, "RRNodeType");
  }
  get childNodes() {
    const t = [];
    let r = this.firstChild;
    for (; r; )
      t.push(r), r = r.nextSibling;
    return t;
  }
  contains(t) {
    if (t instanceof ga) {
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
const Kc = {
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
}, Xc = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, mi = {}, Ed = {}, Lb = () => !!globalThis.Zone;
function ya(e) {
  if (mi[e])
    return mi[e];
  const t = globalThis[e], r = t.prototype, n = e in Kc ? Kc[e] : void 0, i = !!(n && // @ts-expect-error 2345
  n.every(
    (c) => {
      var l, d;
      return !!((d = (l = Object.getOwnPropertyDescriptor(r, c)) == null ? void 0 : l.get) != null && d.toString().includes("[native code]"));
    }
  )), o = e in Xc ? Xc[e] : void 0, s = !!(o && o.every(
    // @ts-expect-error 2345
    (c) => {
      var l;
      return typeof r[c] == "function" && ((l = r[c]) == null ? void 0 : l.toString().includes("[native code]"));
    }
  ));
  if (i && s && !Lb())
    return mi[e] = t.prototype, t.prototype;
  try {
    const c = document.createElement("iframe");
    c.style.display = "none", document.body.appendChild(c);
    const l = c.contentWindow;
    if (!l) return t.prototype;
    const d = l[e].prototype;
    if (!d)
      return c.remove(), r;
    const a = navigator.userAgent;
    return a.includes("Safari") && !a.includes("Chrome") ? (c.classList.add("rr-block"), c.setAttribute("__rrwebUntaintedMutationObserver", ""), Ed[e] = () => c.remove()) : c.remove(), mi[e] = d;
  } catch {
    return r;
  }
}
const _s = {};
function dr(e, t, r) {
  var n;
  const i = `${e}.${String(r)}`;
  if (_s[i])
    return _s[i].call(
      t
    );
  const o = ya(e), s = (n = Object.getOwnPropertyDescriptor(
    o,
    r
  )) == null ? void 0 : n.get;
  return s ? (_s[i] = s, s.call(t)) : t[r];
}
const Ls = {};
function Cd(e, t, r) {
  const n = `${e}.${String(r)}`;
  if (Ls[n])
    return Ls[n].bind(
      t
    );
  const o = ya(e)[r];
  return typeof o != "function" ? t[r] : (Ls[n] = o, o.bind(t));
}
function Ib(e) {
  return dr("Node", e, "ownerDocument");
}
function Ob(e) {
  return dr("Node", e, "childNodes");
}
function Nb(e) {
  return dr("Node", e, "parentNode");
}
function Pb(e) {
  return dr("Node", e, "parentElement");
}
function $b(e) {
  return dr("Node", e, "textContent");
}
function zb(e, t) {
  return Cd("Node", e, "contains")(t);
}
function Db(e) {
  return Cd("Node", e, "getRootNode")();
}
function Fb(e) {
  return !e || !("host" in e) ? null : dr("ShadowRoot", e, "host");
}
function Ub(e) {
  return e.styleSheets;
}
function Bb(e) {
  return !e || !("shadowRoot" in e) ? null : dr("Element", e, "shadowRoot");
}
function qb(e, t) {
  return dr("Element", e, "querySelector")(t);
}
function Wb(e, t) {
  return dr("Element", e, "querySelectorAll")(t);
}
function Md() {
  return [
    ya("MutationObserver").constructor,
    Ed.MutationObserver ?? (() => {
    })
  ];
}
let Un = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (Un = () => (/* @__PURE__ */ new Date()).getTime());
function Wr(e, t, r) {
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
  ownerDocument: Ib,
  childNodes: Ob,
  parentNode: Nb,
  parentElement: Pb,
  textContent: $b,
  contains: zb,
  getRootNode: Db,
  host: Fb,
  styleSheets: Ub,
  shadowRoot: Bb,
  querySelector: qb,
  querySelectorAll: Wb,
  nowTimestamp: Un,
  mutationObserverCtor: Md,
  patch: Wr
};
function yt(e, t, r = document) {
  const n = { capture: !0, passive: !0 };
  return r.addEventListener(e, t, n), () => r.removeEventListener(e, t, n);
}
const on = `Please stop import mirror directly. Instead of that,\r
now you can use replayer.getMirror() to access the mirror instance of a replayer,\r
or you can use record.mirror to access the mirror instance during recording.`;
let Jc = {
  map: {},
  getId() {
    return console.error(on), -1;
  },
  getNode() {
    return console.error(on), null;
  },
  removeNodeFromMap() {
    console.error(on);
  },
  has() {
    return console.error(on), !1;
  },
  reset() {
    console.error(on);
  }
};
typeof window < "u" && window.Proxy && window.Reflect && (Jc = new Proxy(Jc, {
  get(e, t, r) {
    return t === "map" && console.error(on), Reflect.get(e, t, r);
  }
}));
function Bn(e, t, r = {}) {
  let n = null, i = 0;
  return function(...o) {
    const s = Date.now();
    !i && r.leading === !1 && (i = s);
    const c = t - (s - i), l = this;
    c <= 0 || c > t ? (n && (clearTimeout(n), n = null), i = s, e.apply(l, o)) : !n && r.trailing !== !1 && (n = setTimeout(() => {
      i = r.leading === !1 ? 0 : Date.now(), n = null, e.apply(l, o);
    }, c));
  };
}
function Xi(e, t, r, n, i = window) {
  const o = i.Object.getOwnPropertyDescriptor(e, t);
  return i.Object.defineProperty(
    e,
    t,
    n ? r : {
      set(s) {
        setTimeout(() => {
          r.set.call(this, s);
        }, 0), o && o.set && o.set.call(this, s);
      }
    }
  ), () => Xi(e, t, o || {}, !0);
}
function Rd(e) {
  var t, r, n, i;
  const o = e.document;
  return {
    left: o.scrollingElement ? o.scrollingElement.scrollLeft : e.pageXOffset !== void 0 ? e.pageXOffset : o.documentElement.scrollLeft || (o == null ? void 0 : o.body) && ((t = be.parentElement(o.body)) == null ? void 0 : t.scrollLeft) || ((r = o == null ? void 0 : o.body) == null ? void 0 : r.scrollLeft) || 0,
    top: o.scrollingElement ? o.scrollingElement.scrollTop : e.pageYOffset !== void 0 ? e.pageYOffset : (o == null ? void 0 : o.documentElement.scrollTop) || (o == null ? void 0 : o.body) && ((n = be.parentElement(o.body)) == null ? void 0 : n.scrollTop) || ((i = o == null ? void 0 : o.body) == null ? void 0 : i.scrollTop) || 0
  };
}
function Td() {
  return window.innerHeight || document.documentElement && document.documentElement.clientHeight || document.body && document.body.clientHeight;
}
function Ad() {
  return window.innerWidth || document.documentElement && document.documentElement.clientWidth || document.body && document.body.clientWidth;
}
function _d(e) {
  return e ? e.nodeType === e.ELEMENT_NODE ? e : be.parentElement(e) : null;
}
function bt(e, t, r, n) {
  if (!e)
    return !1;
  const i = _d(e);
  if (!i)
    return !1;
  try {
    if (typeof t == "string") {
      if (i.classList.contains(t) || n && i.closest("." + t) !== null) return !0;
    } else if (_i(i, t, n)) return !0;
  } catch {
  }
  return !!(r && (i.matches(r) || n && i.closest(r) !== null));
}
function jb(e, t) {
  return t.getId(e) !== -1;
}
function Is(e, t, r) {
  return e.tagName === "TITLE" && r.headTitleMutations ? !0 : t.getId(e) === Fn;
}
function Ld(e, t) {
  if (On(e))
    return !1;
  const r = t.getId(e);
  if (!t.has(r))
    return !0;
  const n = be.parentNode(e);
  return n && n.nodeType === e.DOCUMENT_NODE ? !1 : n ? Ld(n, t) : !0;
}
function Ws(e) {
  return !!e.changedTouches;
}
function Hb(e = window) {
  "NodeList" in e && !e.NodeList.prototype.forEach && (e.NodeList.prototype.forEach = Array.prototype.forEach), "DOMTokenList" in e && !e.DOMTokenList.prototype.forEach && (e.DOMTokenList.prototype.forEach = Array.prototype.forEach);
}
function Id(e, t) {
  return !!(e.nodeName === "IFRAME" && t.getMeta(e));
}
function Od(e, t) {
  return !!(e.nodeName === "LINK" && e.nodeType === e.ELEMENT_NODE && e.getAttribute && e.getAttribute("rel") === "stylesheet" && t.getMeta(e));
}
function js(e) {
  return e ? e instanceof ga && "shadowRoot" in e ? !!e.shadowRoot : !!be.shadowRoot(e) : !1;
}
class Yb {
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
function Nd(e) {
  var t;
  let r = null;
  return "getRootNode" in e && ((t = be.getRootNode(e)) == null ? void 0 : t.nodeType) === Node.DOCUMENT_FRAGMENT_NODE && be.host(be.getRootNode(e)) && (r = be.host(be.getRootNode(e))), r;
}
function Vb(e) {
  let t = e, r;
  for (; r = Nd(t); )
    t = r;
  return t;
}
function Gb(e) {
  const t = be.ownerDocument(e);
  if (!t) return !1;
  const r = Vb(e);
  return be.contains(t, r);
}
function Pd(e) {
  const t = be.ownerDocument(e);
  return t ? be.contains(t, e) || Gb(e) : !1;
}
var Ce = /* @__PURE__ */ ((e) => (e[e.DomContentLoaded = 0] = "DomContentLoaded", e[e.Load = 1] = "Load", e[e.FullSnapshot = 2] = "FullSnapshot", e[e.IncrementalSnapshot = 3] = "IncrementalSnapshot", e[e.Meta = 4] = "Meta", e[e.Custom = 5] = "Custom", e[e.Plugin = 6] = "Plugin", e[e.Asset = 7] = "Asset", e))(Ce || {}), we = /* @__PURE__ */ ((e) => (e[e.Mutation = 0] = "Mutation", e[e.MouseMove = 1] = "MouseMove", e[e.MouseInteraction = 2] = "MouseInteraction", e[e.Scroll = 3] = "Scroll", e[e.ViewportResize = 4] = "ViewportResize", e[e.Input = 5] = "Input", e[e.TouchMove = 6] = "TouchMove", e[e.MediaInteraction = 7] = "MediaInteraction", e[e.StyleSheetRule = 8] = "StyleSheetRule", e[e.CanvasMutation = 9] = "CanvasMutation", e[e.Font = 10] = "Font", e[e.Log = 11] = "Log", e[e.Drag = 12] = "Drag", e[e.StyleDeclaration = 13] = "StyleDeclaration", e[e.Selection = 14] = "Selection", e[e.AdoptedStyleSheet = 15] = "AdoptedStyleSheet", e[e.CustomElement = 16] = "CustomElement", e))(we || {}), Et = /* @__PURE__ */ ((e) => (e[e.MouseUp = 0] = "MouseUp", e[e.MouseDown = 1] = "MouseDown", e[e.Click = 2] = "Click", e[e.ContextMenu = 3] = "ContextMenu", e[e.DblClick = 4] = "DblClick", e[e.Focus = 5] = "Focus", e[e.Blur = 6] = "Blur", e[e.TouchStart = 7] = "TouchStart", e[e.TouchMove_Departed = 8] = "TouchMove_Departed", e[e.TouchEnd = 9] = "TouchEnd", e[e.TouchCancel = 10] = "TouchCancel", e))(Et || {}), cr = /* @__PURE__ */ ((e) => (e[e.Mouse = 0] = "Mouse", e[e.Pen = 1] = "Pen", e[e.Touch = 2] = "Touch", e))(cr || {}), bn = /* @__PURE__ */ ((e) => (e[e["2D"] = 0] = "2D", e[e.WebGL = 1] = "WebGL", e[e.WebGL2 = 2] = "WebGL2", e))(bn || {}), sn = /* @__PURE__ */ ((e) => (e[e.Play = 0] = "Play", e[e.Pause = 1] = "Pause", e[e.Seeked = 2] = "Seeked", e[e.VolumeChange = 3] = "VolumeChange", e[e.RateChange = 4] = "RateChange", e))(sn || {}), $d = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))($d || {});
function Zc(e) {
  return "__ln" in e;
}
class Kb {
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
    if (t.__ln = r, t.previousSibling && Zc(t.previousSibling)) {
      const n = t.previousSibling.__ln.next;
      r.next = n, r.previous = t.previousSibling.__ln, t.previousSibling.__ln.next = r, n && (n.previous = r);
    } else if (t.nextSibling && Zc(t.nextSibling) && t.nextSibling.__ln.previous) {
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
const Qc = (e, t) => `${e}@${t}`;
class Xb {
  constructor() {
    j(this, "frozen", !1), j(this, "locked", !1), j(this, "texts", []), j(this, "attributes", []), j(this, "attributeMap", /* @__PURE__ */ new WeakMap()), j(this, "removes", []), j(this, "mapRemoves", []), j(this, "movedMap", {}), j(this, "addedSet", /* @__PURE__ */ new Set()), j(this, "movedSet", /* @__PURE__ */ new Set()), j(this, "droppedSet", /* @__PURE__ */ new Set()), j(this, "removesSubTreeCache", /* @__PURE__ */ new Set()), j(this, "mutationCb"), j(this, "blockClass"), j(this, "blockSelector"), j(this, "maskTextClass"), j(this, "maskTextSelector"), j(this, "inlineStylesheet"), j(this, "maskInputOptions"), j(this, "maskTextFn"), j(this, "maskInputFn"), j(this, "keepIframeSrcFn"), j(this, "recordCanvas"), j(this, "inlineImages"), j(this, "slimDOMOptions"), j(this, "dataURLOptions"), j(this, "doc"), j(this, "mirror"), j(this, "iframeManager"), j(this, "stylesheetManager"), j(this, "shadowDomManager"), j(this, "canvasManager"), j(this, "processedNodeManager"), j(this, "unattachedDoc"), j(this, "processMutations", (t) => {
      t.forEach(this.processMutation), this.emit();
    }), j(this, "emit", () => {
      if (this.frozen || this.locked)
        return;
      const t = [], r = /* @__PURE__ */ new Set(), n = new Kb(), i = (l) => {
        let d = l, a = Fn;
        for (; a === Fn; )
          d = d && d.nextSibling, a = d && this.mirror.getId(d);
        return a;
      }, o = (l) => {
        const d = be.parentNode(l);
        if (!d || !Pd(l))
          return;
        let a = !1;
        if (l.nodeType === Node.TEXT_NODE) {
          const m = d.tagName;
          if (m === "TEXTAREA")
            return;
          m === "STYLE" && this.addedSet.has(d) && (a = !0);
        }
        const h = On(d) ? this.mirror.getId(Nd(l)) : this.mirror.getId(d), p = i(l);
        if (h === -1 || p === -1)
          return n.addNode(l);
        const u = ln(l, {
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
            Id(m, this.mirror) && this.iframeManager.addIframe(m), Od(m, this.mirror) && this.stylesheetManager.trackLinkElement(
              m
            ), js(l) && this.shadowDomManager.addShadowRoot(be.shadowRoot(l), this.doc);
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
          nextId: p,
          node: u
        }), r.add(u.id));
      };
      for (; this.mapRemoves.length; )
        this.mirror.removeNodeFromMap(this.mapRemoves.shift());
      for (const l of this.movedSet)
        eu(this.removesSubTreeCache, l, this.mirror) && !this.movedSet.has(be.parentNode(l)) || o(l);
      for (const l of this.addedSet)
        !tu(this.droppedSet, l) && !eu(this.removesSubTreeCache, l, this.mirror) || tu(this.movedSet, l) ? o(l) : this.droppedSet.add(l);
      let s = null;
      for (; n.length; ) {
        let l = null;
        if (s) {
          const d = this.mirror.getId(be.parentNode(s.value)), a = i(s.value);
          d !== -1 && a !== -1 && (l = s);
        }
        if (!l) {
          let d = n.tail;
          for (; d; ) {
            const a = d;
            if (d = d.previous, a) {
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
        s = l.previous, n.removeNode(l.value), o(l.value);
      }
      const c = {
        texts: this.texts.map((l) => {
          const d = l.node, a = be.parentNode(d);
          return a && a.tagName === "TEXTAREA" && this.genTextAreaValueMutation(a), {
            id: this.mirror.getId(d),
            value: l.value
          };
        }).filter((l) => !r.has(l.id)).filter((l) => this.mirror.has(l.id)),
        attributes: this.attributes.map((l) => {
          const { attributes: d } = l;
          if (typeof d.style == "string") {
            const a = JSON.stringify(l.styleDiff), h = JSON.stringify(l._unchangedStyles);
            a.length < d.style.length && (a + h).split("var(").length === d.style.split("var(").length && (d.style = l.styleDiff);
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
      r.attributes.value = Ri({
        element: t,
        maskInputOptions: this.maskInputOptions,
        tagName: t.tagName,
        type: Ti(t),
        value: n,
        maskInputFn: this.maskInputFn
      });
    }), j(this, "processMutation", (t) => {
      if (!Is(t.target, this.mirror, this.slimDOMOptions))
        switch (t.type) {
          case "characterData": {
            const r = be.textContent(t.target);
            !bt(t.target, this.blockClass, this.blockSelector, !1) && r !== t.oldValue && this.texts.push({
              value: ld(
                t.target,
                this.maskTextClass,
                this.maskTextSelector,
                !0
                // checkAncestors
              ) && r ? this.maskTextFn ? this.maskTextFn(r, _d(t.target)) : r.replace(/[\S]/g, "*") : r,
              node: t.target
            });
            break;
          }
          case "attributes": {
            const r = t.target;
            let n = t.attributeName, i = t.target.getAttribute(n);
            if (n === "value") {
              const s = Ti(r);
              i = Ri({
                element: r,
                maskInputOptions: this.maskInputOptions,
                tagName: r.tagName,
                type: s,
                value: i,
                maskInputFn: this.maskInputFn
              });
            }
            if (bt(t.target, this.blockClass, this.blockSelector, !1) || i === t.oldValue)
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
            }, this.attributes.push(o), this.attributeMap.set(t.target, o)), n === "type" && r.tagName === "INPUT" && (t.oldValue || "").toLowerCase() === "password" && r.setAttribute("data-rr-is-password", "true"), !ad(r.tagName, n))
              if (o.attributes[n] = sd(
                this.doc,
                Ur(r.tagName),
                Ur(n),
                i
              ), n === "style") {
                if (!this.unattachedDoc)
                  try {
                    this.unattachedDoc = document.implementation.createHTMLDocument();
                  } catch {
                    this.unattachedDoc = this.doc;
                  }
                const s = this.unattachedDoc.createElement("span");
                t.oldValue && s.setAttribute("style", t.oldValue);
                for (const c of Array.from(r.style)) {
                  const l = r.style.getPropertyValue(c), d = r.style.getPropertyPriority(c);
                  l !== s.style.getPropertyValue(c) || d !== s.style.getPropertyPriority(c) ? d === "" ? o.styleDiff[c] = l : o.styleDiff[c] = [l, d] : o._unchangedStyles[c] = [l, d];
                }
                for (const c of Array.from(s.style))
                  r.style.getPropertyValue(c) === "" && (o.styleDiff[c] = !1);
              } else n === "open" && r.tagName === "DIALOG" && (r.matches("dialog:modal") ? o.attributes.rr_open_mode = "modal" : o.attributes.rr_open_mode = "non-modal");
            break;
          }
          case "childList": {
            if (bt(t.target, this.blockClass, this.blockSelector, !0))
              return;
            if (t.target.tagName === "TEXTAREA") {
              this.genTextAreaValueMutation(t.target);
              return;
            }
            t.addedNodes.forEach((r) => this.genAdds(r, t.target)), t.removedNodes.forEach((r) => {
              const n = this.mirror.getId(r), i = On(t.target) ? this.mirror.getId(be.host(t.target)) : this.mirror.getId(t.target);
              bt(t.target, this.blockClass, this.blockSelector, !1) || Is(r, this.mirror, this.slimDOMOptions) || !jb(r, this.mirror) || (this.addedSet.has(r) ? (Hs(this.addedSet, r), this.droppedSet.add(r)) : this.addedSet.has(t.target) && n === -1 || Ld(t.target, this.mirror) || (this.movedSet.has(r) && this.movedMap[Qc(n, i)] ? Hs(this.movedSet, r) : (this.removes.push({
                parentId: i,
                id: n,
                isShadow: On(t.target) && Nn(t.target) ? !0 : void 0
              }), Jb(r, this.removesSubTreeCache))), this.mapRemoves.push(r));
            });
            break;
          }
        }
    }), j(this, "genAdds", (t, r) => {
      if (!this.processedNodeManager.inOtherBuffer(t, this) && !(this.addedSet.has(t) || this.movedSet.has(t))) {
        if (this.mirror.hasNode(t)) {
          if (Is(t, this.mirror, this.slimDOMOptions))
            return;
          this.movedSet.add(t);
          let n = null;
          r && this.mirror.hasNode(r) && (n = this.mirror.getId(r)), n && n !== -1 && (this.movedMap[Qc(this.mirror.getId(t), n)] = !0);
        } else
          this.addedSet.add(t), this.droppedSet.delete(t);
        bt(t, this.blockClass, this.blockSelector, !1) || (be.childNodes(t).forEach((n) => this.genAdds(n)), js(t) && be.childNodes(be.shadowRoot(t)).forEach((n) => {
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
function Hs(e, t) {
  e.delete(t), be.childNodes(t).forEach((r) => Hs(e, r));
}
function Jb(e, t) {
  const r = [e];
  for (; r.length; ) {
    const n = r.pop();
    t.has(n) || (t.add(n), be.childNodes(n).forEach((i) => r.push(i)));
  }
}
function eu(e, t, r) {
  return e.size === 0 ? !1 : Zb(e, t);
}
function Zb(e, t, r) {
  const n = be.parentNode(t);
  return n ? e.has(n) : !1;
}
function tu(e, t) {
  return e.size === 0 ? !1 : zd(e, t);
}
function zd(e, t) {
  const r = be.parentNode(t);
  return r ? e.has(r) ? !0 : zd(e, r) : !1;
}
let Pn;
function Qb(e) {
  Pn = e;
}
function ek() {
  Pn = void 0;
}
const xe = (e) => Pn ? (...r) => {
  try {
    return e(...r);
  } catch (n) {
    if (Pn && Pn(n) === !0)
      return;
    throw n;
  }
} : e, zr = [];
function Hn(e) {
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
function Dd(e, t) {
  const r = new Xb();
  zr.push(r), r.init(e);
  const [n, i] = Md(), o = new n(
    xe(r.processMutations.bind(r))
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
function tk({
  mousemoveCb: e,
  sampling: t,
  doc: r,
  mirror: n
}) {
  if (t.mousemove === !1)
    return () => {
    };
  const i = typeof t.mousemove == "number" ? t.mousemove : 50, o = typeof t.mousemoveCallback == "number" ? t.mousemoveCallback : 500;
  let s = [], c;
  const l = Bn(
    xe(
      (h) => {
        const p = Date.now() - c;
        e(
          s.map((u) => (u.timeOffset -= p, u)),
          h
        ), s = [], c = null;
      }
    ),
    o
  ), d = xe(
    Bn(
      xe((h) => {
        const p = Hn(h), { clientX: u, clientY: m } = Ws(h) ? h.changedTouches[0] : h;
        c || (c = Un()), s.push({
          x: u,
          y: m,
          id: n.getId(p),
          timeOffset: Un() - c
        }), l(
          typeof DragEvent < "u" && h instanceof DragEvent ? we.Drag : h instanceof MouseEvent ? we.MouseMove : we.TouchMove
        );
      }),
      i,
      {
        trailing: !1
      }
    )
  ), a = [
    yt("mousemove", d, r),
    yt("touchmove", d, r),
    yt("drag", d, r)
  ];
  return xe(() => {
    a.forEach((h) => h());
  });
}
function rk({
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
  const s = o.mouseInteraction === !0 || o.mouseInteraction === void 0 ? {} : o.mouseInteraction, c = [];
  let l = null;
  const d = (a) => (h) => {
    const p = Hn(h);
    if (bt(p, n, i, !0))
      return;
    let u = null, m = a;
    if ("pointerType" in h) {
      switch (h.pointerType) {
        case "mouse":
          u = cr.Mouse;
          break;
        case "touch":
          u = cr.Touch;
          break;
        case "pen":
          u = cr.Pen;
          break;
      }
      u === cr.Touch ? Et[a] === Et.MouseDown ? m = "TouchStart" : Et[a] === Et.MouseUp && (m = "TouchEnd") : cr.Pen;
    } else Ws(h) && (u = cr.Touch);
    u !== null ? (l = u, (m.startsWith("Touch") && u === cr.Touch || m.startsWith("Mouse") && u === cr.Mouse) && (u = null)) : Et[a] === Et.Click && (u = l, l = null);
    const f = Ws(h) ? h.changedTouches[0] : h;
    if (!f)
      return;
    const y = r.getId(p), { clientX: M, clientY: v } = f;
    xe(e)({
      type: Et[m],
      id: y,
      x: M,
      y: v,
      ...u !== null && { pointerType: u }
    });
  };
  return Object.keys(Et).filter(
    (a) => Number.isNaN(Number(a)) && !a.endsWith("_Departed") && s[a] !== !1
  ).forEach((a) => {
    let h = Ur(a);
    const p = d(a);
    if (window.PointerEvent)
      switch (Et[a]) {
        case Et.MouseDown:
        case Et.MouseUp:
          h = h.replace(
            "mouse",
            "pointer"
          );
          break;
        case Et.TouchStart:
        case Et.TouchEnd:
          return;
      }
    c.push(yt(h, p, t));
  }), xe(() => {
    c.forEach((a) => a());
  });
}
function Fd({
  scrollCb: e,
  doc: t,
  mirror: r,
  blockClass: n,
  blockSelector: i,
  sampling: o
}) {
  const s = xe(
    Bn(
      xe((c) => {
        const l = Hn(c);
        if (!l || bt(l, n, i, !0))
          return;
        const d = r.getId(l);
        if (l === t && t.defaultView) {
          const a = Rd(t.defaultView);
          e({
            id: d,
            x: a.left,
            y: a.top
          });
        } else
          e({
            id: d,
            x: l.scrollLeft,
            y: l.scrollTop
          });
      }),
      o.scroll || 100
    )
  );
  return yt("scroll", s, t);
}
function nk({ viewportResizeCb: e }, { win: t }) {
  let r = -1, n = -1;
  const i = xe(
    Bn(
      xe(() => {
        const o = Td(), s = Ad();
        (r !== o || n !== s) && (e({
          width: Number(s),
          height: Number(o)
        }), r = o, n = s);
      }),
      200
    )
  );
  return yt("resize", i, t);
}
const ik = ["INPUT", "TEXTAREA", "SELECT"], ru = /* @__PURE__ */ new WeakMap();
function ok({
  inputCb: e,
  doc: t,
  mirror: r,
  blockClass: n,
  blockSelector: i,
  ignoreClass: o,
  ignoreSelector: s,
  maskInputOptions: c,
  maskInputFn: l,
  sampling: d,
  userTriggeredOnInput: a
}) {
  function h(v) {
    let b = Hn(v);
    const A = v.isTrusted, S = b && b.tagName;
    if (b && S === "OPTION" && (b = be.parentElement(b)), !b || !S || ik.indexOf(S) < 0 || bt(b, n, i, !0) || b.classList.contains(o) || s && b.matches(s))
      return;
    let w = b.value, T = !1;
    const N = Ti(b) || "";
    N === "radio" || N === "checkbox" ? T = b.checked : (c[S.toLowerCase()] || c[N]) && (w = Ri({
      element: b,
      maskInputOptions: c,
      tagName: S,
      type: N,
      value: w,
      maskInputFn: l
    })), p(
      b,
      a ? { text: w, isChecked: T, userTriggered: A } : { text: w, isChecked: T }
    );
    const U = b.name;
    N === "radio" && U && T && t.querySelectorAll(`input[type="radio"][name="${U}"]`).forEach((z) => {
      if (z !== b) {
        const ee = z.value;
        p(
          z,
          a ? { text: ee, isChecked: !T, userTriggered: !1 } : { text: ee, isChecked: !T }
        );
      }
    });
  }
  function p(v, b) {
    const A = ru.get(v);
    if (!A || A.text !== b.text || A.isChecked !== b.isChecked) {
      ru.set(v, b);
      const S = r.getId(v);
      xe(e)({
        ...b,
        id: S
      });
    }
  }
  const m = (d.input === "last" ? ["change"] : ["input", "change"]).map(
    (v) => yt(v, xe(h), t)
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
      (v) => Xi(
        v[0],
        v[1],
        {
          set() {
            xe(h)({
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
  ), xe(() => {
    m.forEach((v) => v());
  });
}
function Li(e) {
  const t = [];
  function r(n, i) {
    if (gi("CSSGroupingRule") && n.parentRule instanceof CSSGroupingRule || gi("CSSMediaRule") && n.parentRule instanceof CSSMediaRule || gi("CSSSupportsRule") && n.parentRule instanceof CSSSupportsRule || gi("CSSConditionRule") && n.parentRule instanceof CSSConditionRule) {
      const s = Array.from(
        n.parentRule.cssRules
      ).indexOf(n);
      return i.unshift(s), r(n.parentRule, i);
    } else if (n.parentStyleSheet) {
      const s = Array.from(n.parentStyleSheet.cssRules).indexOf(n);
      i.unshift(s);
    }
    return i;
  }
  return r(e, t);
}
function vr(e, t, r) {
  let n, i;
  return e ? (e.ownerNode ? n = t.getId(e.ownerNode) : i = r.getId(e), {
    styleId: i,
    id: n
  }) : {};
}
function sk({ styleSheetRuleCb: e, mirror: t, stylesheetManager: r }, { win: n }) {
  if (!n.CSSStyleSheet || !n.CSSStyleSheet.prototype)
    return () => {
    };
  const i = n.CSSStyleSheet.prototype.insertRule;
  n.CSSStyleSheet.prototype.insertRule = new Proxy(i, {
    apply: xe(
      (a, h, p) => {
        const [u, m] = p, { id: f, styleId: y } = vr(
          h,
          t,
          r.styleMirror
        );
        return (f && f !== -1 || y && y !== -1) && e({
          id: f,
          styleId: y,
          adds: [{ rule: u, index: m }]
        }), a.apply(h, p);
      }
    )
  }), n.CSSStyleSheet.prototype.addRule = function(a, h, p = this.cssRules.length) {
    const u = `${a} { ${h} }`;
    return n.CSSStyleSheet.prototype.insertRule.apply(this, [u, p]);
  };
  const o = n.CSSStyleSheet.prototype.deleteRule;
  n.CSSStyleSheet.prototype.deleteRule = new Proxy(o, {
    apply: xe(
      (a, h, p) => {
        const [u] = p, { id: m, styleId: f } = vr(
          h,
          t,
          r.styleMirror
        );
        return (m && m !== -1 || f && f !== -1) && e({
          id: m,
          styleId: f,
          removes: [{ index: u }]
        }), a.apply(h, p);
      }
    )
  }), n.CSSStyleSheet.prototype.removeRule = function(a) {
    return n.CSSStyleSheet.prototype.deleteRule.apply(this, [a]);
  };
  let s;
  n.CSSStyleSheet.prototype.replace && (s = n.CSSStyleSheet.prototype.replace, n.CSSStyleSheet.prototype.replace = new Proxy(s, {
    apply: xe(
      (a, h, p) => {
        const [u] = p, { id: m, styleId: f } = vr(
          h,
          t,
          r.styleMirror
        );
        return (m && m !== -1 || f && f !== -1) && e({
          id: m,
          styleId: f,
          replace: u
        }), a.apply(h, p);
      }
    )
  }));
  let c;
  n.CSSStyleSheet.prototype.replaceSync && (c = n.CSSStyleSheet.prototype.replaceSync, n.CSSStyleSheet.prototype.replaceSync = new Proxy(c, {
    apply: xe(
      (a, h, p) => {
        const [u] = p, { id: m, styleId: f } = vr(
          h,
          t,
          r.styleMirror
        );
        return (m && m !== -1 || f && f !== -1) && e({
          id: m,
          styleId: f,
          replaceSync: u
        }), a.apply(h, p);
      }
    )
  }));
  const l = {};
  yi("CSSGroupingRule") ? l.CSSGroupingRule = n.CSSGroupingRule : (yi("CSSMediaRule") && (l.CSSMediaRule = n.CSSMediaRule), yi("CSSConditionRule") && (l.CSSConditionRule = n.CSSConditionRule), yi("CSSSupportsRule") && (l.CSSSupportsRule = n.CSSSupportsRule));
  const d = {};
  return Object.entries(l).forEach(([a, h]) => {
    d[a] = {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      insertRule: h.prototype.insertRule,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      deleteRule: h.prototype.deleteRule
    }, h.prototype.insertRule = new Proxy(
      d[a].insertRule,
      {
        apply: xe(
          (p, u, m) => {
            const [f, y] = m, { id: M, styleId: v } = vr(
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
                    ...Li(u),
                    y || 0
                    // defaults to 0
                  ]
                }
              ]
            }), p.apply(u, m);
          }
        )
      }
    ), h.prototype.deleteRule = new Proxy(
      d[a].deleteRule,
      {
        apply: xe(
          (p, u, m) => {
            const [f] = m, { id: y, styleId: M } = vr(
              u.parentStyleSheet,
              t,
              r.styleMirror
            );
            return (y && y !== -1 || M && M !== -1) && e({
              id: y,
              styleId: M,
              removes: [
                { index: [...Li(u), f] }
              ]
            }), p.apply(u, m);
          }
        )
      }
    );
  }), xe(() => {
    n.CSSStyleSheet.prototype.insertRule = i, n.CSSStyleSheet.prototype.deleteRule = o, s && (n.CSSStyleSheet.prototype.replace = s), c && (n.CSSStyleSheet.prototype.replaceSync = c), Object.entries(l).forEach(([a, h]) => {
      h.prototype.insertRule = d[a].insertRule, h.prototype.deleteRule = d[a].deleteRule;
    });
  });
}
function Ud({
  mirror: e,
  stylesheetManager: t
}, r) {
  var n, i, o;
  let s = null;
  r.nodeName === "#document" ? s = e.getId(r) : s = e.getId(be.host(r));
  const c = r.nodeName === "#document" ? (n = r.defaultView) == null ? void 0 : n.Document : (o = (i = r.ownerDocument) == null ? void 0 : i.defaultView) == null ? void 0 : o.ShadowRoot, l = c != null && c.prototype ? Object.getOwnPropertyDescriptor(
    c == null ? void 0 : c.prototype,
    "adoptedStyleSheets"
  ) : void 0;
  return s === null || s === -1 || !c || !l ? () => {
  } : (Object.defineProperty(r, "adoptedStyleSheets", {
    configurable: l.configurable,
    enumerable: l.enumerable,
    get() {
      var d;
      return (d = l.get) == null ? void 0 : d.call(this);
    },
    set(d) {
      var a;
      const h = (a = l.set) == null ? void 0 : a.call(this, d);
      if (s !== null && s !== -1)
        try {
          t.adoptStyleSheets(d, s);
        } catch {
        }
      return h;
    }
  }), xe(() => {
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
function ak({
  styleDeclarationCb: e,
  mirror: t,
  ignoreCSSAttributes: r,
  stylesheetManager: n
}, { win: i }) {
  const o = i.CSSStyleDeclaration.prototype.setProperty;
  i.CSSStyleDeclaration.prototype.setProperty = new Proxy(o, {
    apply: xe(
      (c, l, d) => {
        var a;
        const [h, p, u] = d;
        if (r.has(h))
          return o.apply(l, [h, p, u]);
        const { id: m, styleId: f } = vr(
          (a = l.parentRule) == null ? void 0 : a.parentStyleSheet,
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
          index: Li(l.parentRule)
        }), c.apply(l, d);
      }
    )
  });
  const s = i.CSSStyleDeclaration.prototype.removeProperty;
  return i.CSSStyleDeclaration.prototype.removeProperty = new Proxy(s, {
    apply: xe(
      (c, l, d) => {
        var a;
        const [h] = d;
        if (r.has(h))
          return s.apply(l, [h]);
        const { id: p, styleId: u } = vr(
          (a = l.parentRule) == null ? void 0 : a.parentStyleSheet,
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
          index: Li(l.parentRule)
        }), c.apply(l, d);
      }
    )
  }), xe(() => {
    i.CSSStyleDeclaration.prototype.setProperty = o, i.CSSStyleDeclaration.prototype.removeProperty = s;
  });
}
function lk({
  mediaInteractionCb: e,
  blockClass: t,
  blockSelector: r,
  mirror: n,
  sampling: i,
  doc: o
}) {
  const s = xe(
    (l) => Bn(
      xe((d) => {
        const a = Hn(d);
        if (!a || bt(a, t, r, !0))
          return;
        const { currentTime: h, volume: p, muted: u, playbackRate: m, loop: f } = a;
        e({
          type: l,
          id: n.getId(a),
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
    yt("play", s(sn.Play), o),
    yt("pause", s(sn.Pause), o),
    yt("seeked", s(sn.Seeked), o),
    yt("volumechange", s(sn.VolumeChange), o),
    yt("ratechange", s(sn.RateChange), o)
  ];
  return xe(() => {
    c.forEach((l) => l());
  });
}
function ck({ fontCb: e, doc: t }) {
  const r = t.defaultView;
  if (!r)
    return () => {
    };
  const n = [], i = /* @__PURE__ */ new WeakMap(), o = r.FontFace;
  r.FontFace = function(l, d, a) {
    const h = new o(l, d, a);
    return i.set(h, {
      family: l,
      buffer: typeof d != "string",
      descriptors: a,
      fontSource: typeof d == "string" ? d : JSON.stringify(Array.from(new Uint8Array(d)))
    }), h;
  };
  const s = Wr(
    t.fonts,
    "add",
    function(c) {
      return function(l) {
        return setTimeout(
          xe(() => {
            const d = i.get(l);
            d && (e(d), i.delete(l));
          }),
          0
        ), c.apply(this, [l]);
      };
    }
  );
  return n.push(() => {
    r.FontFace = o;
  }), n.push(s), xe(() => {
    n.forEach((c) => c());
  });
}
function uk(e) {
  const { doc: t, mirror: r, blockClass: n, blockSelector: i, selectionCb: o } = e;
  let s = !0;
  const c = xe(() => {
    const l = t.getSelection();
    if (!l || s && (l != null && l.isCollapsed)) return;
    s = l.isCollapsed || !1;
    const d = [], a = l.rangeCount || 0;
    for (let h = 0; h < a; h++) {
      const p = l.getRangeAt(h), { startContainer: u, startOffset: m, endContainer: f, endOffset: y } = p;
      bt(u, n, i, !0) || bt(f, n, i, !0) || d.push({
        start: r.getId(u),
        startOffset: m,
        end: r.getId(f),
        endOffset: y
      });
    }
    o({ ranges: d });
  });
  return c(), yt("selectionchange", c);
}
function dk({
  doc: e,
  customElementCb: t
}) {
  const r = e.defaultView;
  return !r || !r.customElements ? () => {
  } : Wr(
    r.customElements,
    "define",
    function(i) {
      return function(o, s, c) {
        try {
          t({
            define: {
              name: o
            }
          });
        } catch {
          console.warn(`Custom element callback failed for ${o}`);
        }
        return i.apply(this, [o, s, c]);
      };
    }
  );
}
function pk(e, t) {
  const {
    mutationCb: r,
    mousemoveCb: n,
    mouseInteractionCb: i,
    scrollCb: o,
    viewportResizeCb: s,
    inputCb: c,
    mediaInteractionCb: l,
    styleSheetRuleCb: d,
    styleDeclarationCb: a,
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
    t.scroll && t.scroll(...f), o(...f);
  }, e.viewportResizeCb = (...f) => {
    t.viewportResize && t.viewportResize(...f), s(...f);
  }, e.inputCb = (...f) => {
    t.input && t.input(...f), c(...f);
  }, e.mediaInteractionCb = (...f) => {
    t.mediaInteaction && t.mediaInteaction(...f), l(...f);
  }, e.styleSheetRuleCb = (...f) => {
    t.styleSheetRule && t.styleSheetRule(...f), d(...f);
  }, e.styleDeclarationCb = (...f) => {
    t.styleDeclaration && t.styleDeclaration(...f), a(...f);
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
function hk(e, t = {}) {
  const r = e.doc.defaultView;
  if (!r)
    return () => {
    };
  pk(e, t);
  let n, i = () => {
  };
  e.recordDOM && ([n, i] = Dd(e, e.doc));
  const o = tk(e), s = rk(e), c = Fd(e), l = nk(e, {
    win: r
  }), d = ok(e), a = lk(e);
  let h = () => {
  }, p = () => {
  }, u = () => {
  }, m = () => {
  };
  e.recordDOM && (h = sk(e, { win: r }), p = Ud(e, e.doc), u = ak(e, {
    win: r
  }), e.collectFonts && (m = ck(e)));
  const f = uk(e), y = dk(e), M = [];
  for (const v of e.plugins)
    M.push(
      v.observer(v.callback, r, v.options)
    );
  return xe(() => {
    zr.forEach((v) => v.reset()), n == null || n.disconnect(), i(), o(), s(), c(), l(), d(), a(), h(), p(), u(), m(), f(), y(), M.forEach((v) => v());
  });
}
function gi(e) {
  return typeof window[e] < "u";
}
function yi(e) {
  return !!(typeof window[e] < "u" && // Note: Generally, this check _shouldn't_ be necessary
  // However, in some scenarios (e.g. jsdom) this can sometimes fail, so we check for it here
  window[e].prototype && "insertRule" in window[e].prototype && "deleteRule" in window[e].prototype);
}
class nu {
  constructor(t) {
    j(this, "iframeIdToRemoteIdMap", /* @__PURE__ */ new WeakMap()), j(this, "iframeRemoteIdToIdMap", /* @__PURE__ */ new WeakMap()), this.generateIdFn = t;
  }
  getId(t, r, n, i) {
    const o = n || this.getIdToRemoteIdMap(t), s = i || this.getRemoteIdToIdMap(t);
    let c = o.get(r);
    return c || (c = this.generateIdFn(), o.set(r, c), s.set(c, r)), c;
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
class fk {
  constructor(t) {
    j(this, "iframes", /* @__PURE__ */ new WeakMap()), j(this, "crossOriginIframeMap", /* @__PURE__ */ new WeakMap()), j(this, "crossOriginIframeMirror", new nu(od)), j(this, "crossOriginIframeStyleMirror"), j(this, "crossOriginIframeRootIdMap", /* @__PURE__ */ new WeakMap()), j(this, "mirror"), j(this, "mutationCb"), j(this, "wrappedEmit"), j(this, "loadListener"), j(this, "stylesheetManager"), j(this, "recordCrossOriginIframes"), this.mutationCb = t.mutationCb, this.wrappedEmit = t.wrappedEmit, this.stylesheetManager = t.stylesheetManager, this.recordCrossOriginIframes = t.recordCrossOriginIframes, this.crossOriginIframeStyleMirror = new nu(
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
      case Ce.FullSnapshot: {
        this.crossOriginIframeMirror.reset(t), this.crossOriginIframeStyleMirror.reset(t), this.replaceIdOnNode(r.data.node, t);
        const i = r.data.node.id;
        return this.crossOriginIframeRootIdMap.set(t, i), this.patchRootIdOnNode(r.data.node, i), {
          timestamp: r.timestamp,
          type: Ce.IncrementalSnapshot,
          data: {
            source: we.Mutation,
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
          case we.Mutation:
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
          case we.Drag:
          case we.TouchMove:
          case we.MouseMove:
            return r.data.positions.forEach((i) => {
              this.replaceIds(i, t, ["id"]);
            }), r;
          case we.ViewportResize:
            return !1;
          case we.MediaInteraction:
          case we.MouseInteraction:
          case we.Scroll:
          case we.CanvasMutation:
          case we.Input:
            return this.replaceIds(r.data, t, ["id"]), r;
          case we.StyleSheetRule:
          case we.StyleDeclaration:
            return this.replaceIds(r.data, t, ["id"]), this.replaceStyleIds(r.data, t, ["styleId"]), r;
          case we.Font:
            return r;
          case we.Selection:
            return r.data.ranges.forEach((i) => {
              this.replaceIds(i, t, ["start", "end"]);
            }), r;
          case we.AdoptedStyleSheet:
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
    t.type !== $d.Document && !t.rootId && (t.rootId = r), "childNodes" in t && t.childNodes.forEach((n) => {
      this.patchRootIdOnNode(n, r);
    });
  }
}
class mk {
  constructor(t) {
    j(this, "shadowDoms", /* @__PURE__ */ new WeakSet()), j(this, "mutationCb"), j(this, "scrollCb"), j(this, "bypassOptions"), j(this, "mirror"), j(this, "restoreHandlers", []), this.mutationCb = t.mutationCb, this.scrollCb = t.scrollCb, this.bypassOptions = t.bypassOptions, this.mirror = t.mirror, this.init();
  }
  init() {
    this.reset(), this.patchAttachShadow(Element, document);
  }
  addShadowRoot(t, r) {
    if (!Nn(t) || this.shadowDoms.has(t)) return;
    this.shadowDoms.add(t);
    const [n] = Dd(
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
      Fd({
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
        Ud(
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
      Wr(
        t.prototype,
        "attachShadow",
        function(i) {
          return function(o) {
            const s = i.call(this, o), c = be.shadowRoot(this);
            return c && Pd(this) && n.addShadowRoot(c, r), s;
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
var cn = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", gk = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (var bi = 0; bi < cn.length; bi++)
  gk[cn.charCodeAt(bi)] = bi;
var yk = function(e) {
  var t = new Uint8Array(e), r, n = t.length, i = "";
  for (r = 0; r < n; r += 3)
    i += cn[t[r] >> 2], i += cn[(t[r] & 3) << 4 | t[r + 1] >> 4], i += cn[(t[r + 1] & 15) << 2 | t[r + 2] >> 6], i += cn[t[r + 2] & 63];
  return n % 3 === 2 ? i = i.substring(0, i.length - 1) + "=" : n % 3 === 1 && (i = i.substring(0, i.length - 2) + "=="), i;
};
const iu = /* @__PURE__ */ new Map();
function bk(e, t) {
  let r = iu.get(e);
  return r || (r = /* @__PURE__ */ new Map(), iu.set(e, r)), r.has(t) || r.set(t, []), r.get(t);
}
const Bd = (e, t, r) => {
  if (!e || !(Wd(e, t) || typeof e == "object"))
    return;
  const n = e.constructor.name, i = bk(r, n);
  let o = i.indexOf(e);
  return o === -1 && (o = i.length, i.push(e)), o;
};
function wi(e, t, r) {
  if (e instanceof Array)
    return e.map((n) => wi(n, t, r));
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
    const n = e.constructor.name, i = yk(e);
    return {
      rr_type: n,
      base64: i
    };
  } else {
    if (e instanceof DataView)
      return {
        rr_type: e.constructor.name,
        args: [
          wi(e.buffer, t, r),
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
          args: [wi(e.data, t, r), e.width, e.height]
        };
      if (Wd(e, t) || typeof e == "object") {
        const n = e.constructor.name, i = Bd(e, t, r);
        return {
          rr_type: n,
          index: i
        };
      }
    }
  }
  return e;
}
const qd = (e, t, r) => e.map((n) => wi(n, t, r)), Wd = (e, t) => !![
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
function kk(e, t, r, n) {
  const i = [], o = Object.getOwnPropertyNames(
    t.CanvasRenderingContext2D.prototype
  );
  for (const s of o)
    try {
      if (typeof t.CanvasRenderingContext2D.prototype[s] != "function")
        continue;
      const c = Wr(
        t.CanvasRenderingContext2D.prototype,
        s,
        function(l) {
          return function(...d) {
            return bt(this.canvas, r, n, !0) || setTimeout(() => {
              const a = qd(d, t, this);
              e(this.canvas, {
                type: bn["2D"],
                property: s,
                args: a
              });
            }, 0), l.apply(this, d);
          };
        }
      );
      i.push(c);
    } catch {
      const c = Xi(
        t.CanvasRenderingContext2D.prototype,
        s,
        {
          set(l) {
            e(this.canvas, {
              type: bn["2D"],
              property: s,
              args: [l],
              setter: !0
            });
          }
        }
      );
      i.push(c);
    }
  return () => {
    i.forEach((s) => s());
  };
}
function vk(e) {
  return e === "experimental-webgl" ? "webgl" : e;
}
function ou(e, t, r, n) {
  const i = [];
  try {
    const o = Wr(
      e.HTMLCanvasElement.prototype,
      "getContext",
      function(s) {
        return function(c, ...l) {
          if (!bt(this, t, r, !0)) {
            const d = vk(c);
            if ("__context" in this || (this.__context = d), n && ["webgl", "webgl2"].includes(d))
              if (l[0] && typeof l[0] == "object") {
                const a = l[0];
                a.preserveDrawingBuffer || (a.preserveDrawingBuffer = !0);
              } else
                l.splice(0, 1, {
                  preserveDrawingBuffer: !0
                });
          }
          return s.apply(this, [c, ...l]);
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
function su(e, t, r, n, i, o) {
  const s = [], c = Object.getOwnPropertyNames(e);
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
        const d = Wr(
          e,
          l,
          function(a) {
            return function(...h) {
              const p = a.apply(this, h);
              if (Bd(p, o, this), "tagName" in this.canvas && !bt(this.canvas, n, i, !0)) {
                const u = qd(h, o, this), m = {
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
        s.push(d);
      } catch {
        const d = Xi(e, l, {
          set(a) {
            r(this.canvas, {
              type: t,
              property: l,
              args: [a],
              setter: !0
            });
          }
        });
        s.push(d);
      }
  return s;
}
function wk(e, t, r, n) {
  const i = [];
  return typeof t.WebGLRenderingContext < "u" && i.push(
    ...su(
      t.WebGLRenderingContext.prototype,
      bn.WebGL,
      e,
      r,
      n,
      t
    )
  ), typeof t.WebGL2RenderingContext < "u" && i.push(
    ...su(
      t.WebGL2RenderingContext.prototype,
      bn.WebGL2,
      e,
      r,
      n,
      t
    )
  ), () => {
    i.forEach((o) => o());
  };
}
const jd = `(function() {
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
`, au = typeof self < "u" && self.Blob && new Blob([jd], { type: "text/javascript;charset=utf-8" });
function xk(e) {
  let t;
  try {
    if (t = au && (self.URL || self.webkitURL).createObjectURL(au), !t) throw "";
    const r = new Worker(t, {
      name: e == null ? void 0 : e.name
    });
    return r.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(t);
    }), r;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(jd),
      {
        name: e == null ? void 0 : e.name
      }
    );
  } finally {
    t && (self.URL || self.webkitURL).revokeObjectURL(t);
  }
}
class Sk {
  constructor(t) {
    j(this, "pendingCanvasMutations", /* @__PURE__ */ new Map()), j(this, "rafStamps", { latestId: 0, invokeId: null }), j(this, "mirror"), j(this, "mutationCb"), j(this, "resetObservers"), j(this, "frozen", !1), j(this, "locked", !1), j(this, "processMutation", (l, d) => {
      (this.rafStamps.invokeId && this.rafStamps.latestId !== this.rafStamps.invokeId || !this.rafStamps.invokeId) && (this.rafStamps.invokeId = this.rafStamps.latestId), this.pendingCanvasMutations.has(l) || this.pendingCanvasMutations.set(l, []), this.pendingCanvasMutations.get(l).push(d);
    });
    const {
      sampling: r = "all",
      win: n,
      blockClass: i,
      blockSelector: o,
      recordCanvas: s,
      dataURLOptions: c
    } = t;
    this.mutationCb = t.mutationCb, this.mirror = t.mirror, s && r === "all" && this.initCanvasMutationObserver(n, i, o), s && typeof r == "number" && this.initCanvasFPSObserver(r, n, i, o, {
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
    const s = ou(
      r,
      n,
      i,
      !0
    ), c = /* @__PURE__ */ new Map(), l = new xk();
    l.onmessage = (m) => {
      const { id: f } = m.data;
      if (c.set(f, !1), !("base64" in m.data)) return;
      const { base64: y, type: M, width: v, height: b } = m.data;
      this.mutationCb({
        id: f,
        type: bn["2D"],
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
    let a = 0, h;
    const p = () => {
      const m = [];
      return r.document.querySelectorAll("canvas").forEach((f) => {
        bt(f, n, i, !0) || m.push(f);
      }), m;
    }, u = (m) => {
      if (a && m - a < d) {
        h = requestAnimationFrame(u);
        return;
      }
      a = m, p().forEach(async (f) => {
        var y;
        const M = this.mirror.getId(f);
        if (c.get(M) || f.width === 0 || f.height === 0) return;
        if (c.set(M, !0), ["webgl", "webgl2"].includes(f.__context)) {
          const b = f.getContext(f.__context);
          ((y = b == null ? void 0 : b.getContextAttributes()) == null ? void 0 : y.preserveDrawingBuffer) === !1 && b.clear(b.COLOR_BUFFER_BIT);
        }
        const v = await createImageBitmap(f);
        l.postMessage(
          {
            id: M,
            bitmap: v,
            width: f.width,
            height: f.height,
            dataURLOptions: o.dataURLOptions
          },
          [v]
        );
      }), h = requestAnimationFrame(u);
    };
    h = requestAnimationFrame(u), this.resetObservers = () => {
      s(), cancelAnimationFrame(h);
    };
  }
  initCanvasMutationObserver(t, r, n) {
    this.startRAFTimestamping(), this.startPendingCanvasMutationFlusher();
    const i = ou(
      t,
      r,
      n,
      !1
    ), o = kk(
      this.processMutation.bind(this),
      t,
      r,
      n
    ), s = wk(
      this.processMutation.bind(this),
      t,
      r,
      n
    );
    this.resetObservers = () => {
      i(), o(), s();
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
    const i = n.map((s) => {
      const { type: c, ...l } = s;
      return l;
    }), { type: o } = n[0];
    this.mutationCb({ id: r, type: o, commands: i }), this.pendingCanvasMutations.delete(t);
  }
}
class Ek {
  constructor(t) {
    j(this, "trackedLinkElements", /* @__PURE__ */ new WeakSet()), j(this, "mutationCb"), j(this, "adoptedStyleSheetCb"), j(this, "styleMirror", new Yb()), this.mutationCb = t.mutationCb, this.adoptedStyleSheetCb = t.adoptedStyleSheetCb;
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
      let s;
      this.styleMirror.has(o) ? s = this.styleMirror.getId(o) : (s = this.styleMirror.add(o), i.push({
        styleId: s,
        rules: Array.from(o.rules || CSSRule, (c, l) => ({
          rule: rd(c, o.href),
          index: l
        }))
      })), n.styleIds.push(s);
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
class Ck {
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
let Xe, xi, Os, Ii = !1;
try {
  if (Array.from([1], (e) => e * 2)[0] !== 2) {
    const e = document.createElement("iframe");
    document.body.appendChild(e), Array.from = ((Dl = e.contentWindow) == null ? void 0 : Dl.Array.from) || Array.from, document.body.removeChild(e);
  }
} catch (e) {
  console.debug("Unable to override Array.from", e);
}
const jt = Iy();
function Cr(e = {}) {
  const {
    emit: t,
    checkoutEveryNms: r,
    checkoutEveryNth: n,
    blockClass: i = "rr-block",
    blockSelector: o = null,
    ignoreClass: s = "rr-ignore",
    ignoreSelector: c = null,
    maskTextClass: l = "rr-mask",
    maskTextSelector: d = null,
    inlineStylesheet: a = !0,
    maskAllInputs: h,
    maskInputOptions: p,
    slimDOMOptions: u,
    maskInputFn: m,
    maskTextFn: f,
    hooks: y,
    packFn: M,
    sampling: v = {},
    dataURLOptions: b = {},
    mousemoveWait: A,
    recordDOM: S = !0,
    recordCanvas: w = !1,
    recordCrossOriginIframes: T = !1,
    recordAfter: N = e.recordAfter === "DOMContentLoaded" ? e.recordAfter : "load",
    userTriggeredOnInput: U = !1,
    collectFonts: z = !1,
    inlineImages: ee = !1,
    plugins: W,
    keepIframeSrcFn: O = () => !1,
    ignoreCSSAttributes: nt = /* @__PURE__ */ new Set([]),
    errorHandler: Ke
  } = e;
  Qb(Ke);
  const fe = T ? window.parent === window : !0;
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
  A !== void 0 && v.mousemove === void 0 && (v.mousemove = A), jt.reset();
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
  } : p !== void 0 ? p : { password: !0 }, Fe = cd(u);
  Hb();
  let Te, ke = 0;
  const Ve = (G) => {
    for (const oe of W || [])
      oe.eventProcessor && (G = oe.eventProcessor(G));
    return M && // Disable packing events which will be emitted to parent frames.
    !pe && (G = M(G)), G;
  };
  Xe = (G, oe) => {
    var ge;
    const _e = G;
    if (_e.timestamp = Un(), (ge = zr[0]) != null && ge.isFrozen() && _e.type !== Ce.FullSnapshot && !(_e.type === Ce.IncrementalSnapshot && _e.data.source === we.Mutation) && zr.forEach((We) => We.unfreeze()), fe)
      t == null || t(Ve(_e), oe);
    else if (pe) {
      const We = {
        type: "rrweb",
        event: Ve(_e),
        origin: window.location.origin,
        isCheckout: oe
      };
      window.parent.postMessage(We, "*");
    }
    if (_e.type === Ce.FullSnapshot)
      Te = _e, ke = 0;
    else if (_e.type === Ce.IncrementalSnapshot) {
      if (_e.data.source === we.Mutation && _e.data.isAttachIframe)
        return;
      ke++;
      const We = n && ke >= n, ve = r && _e.timestamp - Te.timestamp > r;
      (We || ve) && xi(!0);
    }
  };
  const P = (G) => {
    Xe({
      type: Ce.IncrementalSnapshot,
      data: {
        source: we.Mutation,
        ...G
      }
    });
  }, H = (G) => Xe({
    type: Ce.IncrementalSnapshot,
    data: {
      source: we.Scroll,
      ...G
    }
  }), se = (G) => Xe({
    type: Ce.IncrementalSnapshot,
    data: {
      source: we.CanvasMutation,
      ...G
    }
  }), re = (G) => Xe({
    type: Ce.IncrementalSnapshot,
    data: {
      source: we.AdoptedStyleSheet,
      ...G
    }
  }), ce = new Ek({
    mutationCb: P,
    adoptedStyleSheetCb: re
  }), Ae = new fk({
    mirror: jt,
    mutationCb: P,
    stylesheetManager: ce,
    recordCrossOriginIframes: T,
    wrappedEmit: Xe
  });
  for (const G of W || [])
    G.getMirror && G.getMirror({
      nodeMirror: jt,
      crossOriginIframeMirror: Ae.crossOriginIframeMirror,
      crossOriginIframeStyleMirror: Ae.crossOriginIframeStyleMirror
    });
  const Ue = new Ck();
  Os = new Sk({
    recordCanvas: w,
    mutationCb: se,
    win: window,
    blockClass: i,
    blockSelector: o,
    mirror: jt,
    sampling: v.canvas,
    dataURLOptions: b
  });
  const Se = new mk({
    mutationCb: P,
    scrollCb: H,
    bypassOptions: {
      blockClass: i,
      blockSelector: o,
      maskTextClass: l,
      maskTextSelector: d,
      inlineStylesheet: a,
      maskInputOptions: Re,
      dataURLOptions: b,
      maskTextFn: f,
      maskInputFn: m,
      recordCanvas: w,
      inlineImages: ee,
      sampling: v,
      slimDOMOptions: Fe,
      iframeManager: Ae,
      stylesheetManager: ce,
      canvasManager: Os,
      keepIframeSrcFn: O,
      processedNodeManager: Ue
    },
    mirror: jt
  });
  xi = (G = !1) => {
    if (!S)
      return;
    Xe(
      {
        type: Ce.Meta,
        data: {
          href: window.location.href,
          width: Ad(),
          height: Td()
        }
      },
      G
    ), ce.reset(), Se.init(), zr.forEach((ge) => ge.lock());
    const oe = rb(document, {
      mirror: jt,
      blockClass: i,
      blockSelector: o,
      maskTextClass: l,
      maskTextSelector: d,
      inlineStylesheet: a,
      maskAllInputs: Re,
      maskTextFn: f,
      maskInputFn: m,
      slimDOM: Fe,
      dataURLOptions: b,
      recordCanvas: w,
      inlineImages: ee,
      onSerialize: (ge) => {
        Id(ge, jt) && Ae.addIframe(ge), Od(ge, jt) && ce.trackLinkElement(ge), js(ge) && Se.addShadowRoot(be.shadowRoot(ge), document);
      },
      onIframeLoad: (ge, _e) => {
        Ae.attachIframe(ge, _e), Se.observeAttachShadow(ge);
      },
      onStylesheetLoad: (ge, _e) => {
        ce.attachLinkElement(ge, _e);
      },
      keepIframeSrcFn: O
    });
    if (!oe)
      return console.warn("Failed to snapshot the document");
    Xe(
      {
        type: Ce.FullSnapshot,
        data: {
          node: oe,
          initialOffset: Rd(window)
        }
      },
      G
    ), zr.forEach((ge) => ge.unlock()), document.adoptedStyleSheets && document.adoptedStyleSheets.length > 0 && ce.adoptStyleSheets(
      document.adoptedStyleSheets,
      jt.getId(document)
    );
  };
  try {
    const G = [], oe = (_e) => {
      var We;
      return xe(hk)(
        {
          mutationCb: P,
          mousemoveCb: (ve, Be) => Xe({
            type: Ce.IncrementalSnapshot,
            data: {
              source: Be,
              positions: ve
            }
          }),
          mouseInteractionCb: (ve) => Xe({
            type: Ce.IncrementalSnapshot,
            data: {
              source: we.MouseInteraction,
              ...ve
            }
          }),
          scrollCb: H,
          viewportResizeCb: (ve) => Xe({
            type: Ce.IncrementalSnapshot,
            data: {
              source: we.ViewportResize,
              ...ve
            }
          }),
          inputCb: (ve) => Xe({
            type: Ce.IncrementalSnapshot,
            data: {
              source: we.Input,
              ...ve
            }
          }),
          mediaInteractionCb: (ve) => Xe({
            type: Ce.IncrementalSnapshot,
            data: {
              source: we.MediaInteraction,
              ...ve
            }
          }),
          styleSheetRuleCb: (ve) => Xe({
            type: Ce.IncrementalSnapshot,
            data: {
              source: we.StyleSheetRule,
              ...ve
            }
          }),
          styleDeclarationCb: (ve) => Xe({
            type: Ce.IncrementalSnapshot,
            data: {
              source: we.StyleDeclaration,
              ...ve
            }
          }),
          canvasMutationCb: se,
          fontCb: (ve) => Xe({
            type: Ce.IncrementalSnapshot,
            data: {
              source: we.Font,
              ...ve
            }
          }),
          selectionCb: (ve) => {
            Xe({
              type: Ce.IncrementalSnapshot,
              data: {
                source: we.Selection,
                ...ve
              }
            });
          },
          customElementCb: (ve) => {
            Xe({
              type: Ce.IncrementalSnapshot,
              data: {
                source: we.CustomElement,
                ...ve
              }
            });
          },
          blockClass: i,
          ignoreClass: s,
          ignoreSelector: c,
          maskTextClass: l,
          maskTextSelector: d,
          maskInputOptions: Re,
          inlineStylesheet: a,
          sampling: v,
          recordDOM: S,
          recordCanvas: w,
          inlineImages: ee,
          userTriggeredOnInput: U,
          collectFonts: z,
          doc: _e,
          maskInputFn: m,
          maskTextFn: f,
          keepIframeSrcFn: O,
          blockSelector: o,
          slimDOMOptions: Fe,
          dataURLOptions: b,
          mirror: jt,
          iframeManager: Ae,
          stylesheetManager: ce,
          shadowDomManager: Se,
          processedNodeManager: Ue,
          canvasManager: Os,
          ignoreCSSAttributes: nt,
          plugins: ((We = W == null ? void 0 : W.filter((ve) => ve.observer)) == null ? void 0 : We.map((ve) => ({
            observer: ve.observer,
            options: ve.options,
            callback: (Be) => Xe({
              type: Ce.Plugin,
              data: {
                plugin: ve.name,
                payload: Be
              }
            })
          }))) || []
        },
        y
      );
    };
    Ae.addLoadListener((_e) => {
      try {
        G.push(oe(_e.contentDocument));
      } catch (We) {
        console.warn(We);
      }
    });
    const ge = () => {
      xi(), G.push(oe(document)), Ii = !0;
    };
    return ["interactive", "complete"].includes(document.readyState) ? ge() : (G.push(
      yt("DOMContentLoaded", () => {
        Xe({
          type: Ce.DomContentLoaded,
          data: {}
        }), N === "DOMContentLoaded" && ge();
      })
    ), G.push(
      yt(
        "load",
        () => {
          Xe({
            type: Ce.Load,
            data: {}
          }), N === "load" && ge();
        },
        window
      )
    )), () => {
      G.forEach((_e) => {
        try {
          _e();
        } catch (We) {
          String(We).toLowerCase().includes("cross-origin") || console.warn(We);
        }
      }), Ue.destroy(), Ii = !1, ek();
    };
  } catch (G) {
    console.warn(G);
  }
}
Cr.addCustomEvent = (e, t) => {
  if (!Ii)
    throw new Error("please add custom event after start recording");
  Xe({
    type: Ce.Custom,
    data: {
      tag: e,
      payload: t
    }
  });
};
Cr.freezePage = () => {
  zr.forEach((e) => e.freeze());
};
Cr.takeFullSnapshot = (e) => {
  if (!Ii)
    throw new Error("please take full snapshot after start recording");
  xi(e);
};
Cr.mirror = jt;
var lu;
(function(e) {
  e[e.NotStarted = 0] = "NotStarted", e[e.Running = 1] = "Running", e[e.Stopped = 2] = "Stopped";
})(lu || (lu = {}));
const { addCustomEvent: gv } = Cr, { freezePage: yv } = Cr, { takeFullSnapshot: bv } = Cr, ki = 2, Ns = 4;
class Mk {
  constructor(t) {
    ri(this, "events", []);
    ri(this, "lastMeta", null);
    ri(this, "lastFull", null);
    this.opts = t;
  }
  push(t) {
    t.type === Ns && (this.lastMeta = t), t.type === ki && (this.lastFull = t, this.events = []), this.events.push(t), this.prune();
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
    const t = [], r = this.events.some((i) => i.type === ki), n = this.events.some((i) => i.type === Ns);
    return !r && this.lastFull ? (this.lastMeta && t.push(this.lastMeta), t.push(this.lastFull)) : r && !n && this.lastMeta && t.push(this.lastMeta), [...t, ...this.events];
  }
  /** True when the buffer can produce a scrubbable replay: a full snapshot + at least one event to
   *  play beyond the meta+full pair (a lone meta+full renders a single static frame, not a replay). */
  isPlayable() {
    const t = this.snapshot(), r = t.some((i) => i.type === ki), n = t.some((i) => i.type !== ki && i.type !== Ns);
    return r && n;
  }
  clear() {
    this.events = [], this.lastMeta = null, this.lastFull = null;
  }
}
function Rk(e, t = {}) {
  const r = t.windowMs ?? 6e4, n = new Mk({
    windowMs: r,
    maxEvents: t.maxEvents ?? 2e3
  }), i = t.maskAllInputs !== !1, o = t.maskText !== !1, s = Math.max(15e3, Math.round(r / 2));
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
      checkoutEveryNms: s,
      maskAllInputs: i,
      // Mask every text node by default. rrweb calls maskTextFn(text) per node; '*' keeps layout.
      maskTextFn: o ? (l) => "*".repeat(l.length) : void 0,
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
const Hd = "klav-sims-live", Yd = "klav-sims-overlay", cu = "klav-sims-ext-css";
let Yt = null, $r = null, Pt = null, un = null;
const Oi = /* @__PURE__ */ new Map(), zt = /* @__PURE__ */ new Map();
let Vd = 0, or = !1, Dr = null, fn = null, Yn = !1, gt = null, Ln = null, xr = null, Sr = null, Vt = null, Fr = null, Ht = null, nr = null, Gt = null, dn = null;
const Ni = /* @__PURE__ */ new Set();
function Tk(e) {
  return String(e || "").trim().toLowerCase().replace(/\s+/g, " ");
}
function Gd(e, t) {
  return `${e}::${Tk(t.text)}`;
}
function Kd(e) {
  try {
    document.dispatchEvent(new CustomEvent("klavity:sims-live", { detail: { active: e } }));
  } catch {
  }
}
const Ak = `
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
`, _k = `
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
function uu(e, t) {
  const r = e.replace("#", ""), n = (c) => parseInt(c, 16), [i, o, s] = r.length === 3 ? [n(r[0] + r[0]), n(r[1] + r[1]), n(r[2] + r[2])] : [n(r.slice(0, 2)), n(r.slice(2, 4)), n(r.slice(4, 6))];
  return `rgba(${i},${o},${s},${t})`;
}
function Lk(e) {
  if (e.suggestedBug) return !0;
  const t = String(e.priority ?? "").trim().toLowerCase();
  if (t && t !== "none") return !0;
  const r = String(e.sentiment ?? "").trim().toLowerCase();
  return r ? !(/* @__PURE__ */ new Set(["positive", "satisfied", "delighted", "neutral", "none"])).has(r) : !1;
}
function Ys() {
  var e, t;
  try {
    return ((t = (e = window.matchMedia) == null ? void 0 : e.call(window, "(prefers-reduced-motion: reduce)")) == null ? void 0 : t.matches) ?? !1;
  } catch {
    return !1;
  }
}
function Ik(e) {
  return new Promise((t) => setTimeout(t, e));
}
function mn(e) {
  const t = String(e.priority ?? "").trim().toLowerCase();
  return t === "high" || t === "critical" || t === "urgent" ? "HIGH" : t === "medium" || t === "med" ? "MED" : t === "low" ? "LOW" : e.suggestedBug ? "HIGH" : null;
}
const Xd = { HIGH: "h", MED: "m", LOW: "l" }, du = { HIGH: 0, MED: 1, LOW: 2 };
function Ok(e) {
  if (!e) return !1;
  if (e === Pt || e === Yt || e.id === Yd || e.id === Hd || e.id === "klavity-widget-host") return !0;
  const t = e.classList;
  return !!t && t.contains("klav-halo");
}
function Nk(e) {
  const t = [];
  for (const r of [Pt, Yt])
    r && (t.push({ el: r, vis: r.style.visibility }), r.style.visibility = "hidden");
  try {
    return e();
  } finally {
    for (const { el: r, vis: n } of t) r.style.visibility = n;
  }
}
function Jd(e) {
  const t = e.targetViewport;
  return {
    scrollX: Number.isFinite(t == null ? void 0 : t.scrollX) ? Number(t.scrollX) : window.scrollX,
    scrollY: Number.isFinite(t == null ? void 0 : t.scrollY) ? Number(t.scrollY) : window.scrollY,
    width: Math.max(1, Number.isFinite(t == null ? void 0 : t.width) ? Number(t.width) : window.innerWidth),
    height: Math.max(1, Number.isFinite(t == null ? void 0 : t.height) ? Number(t.height) : window.innerHeight)
  };
}
function Zd(e, t) {
  return new DOMRect(
    t.scrollX + e.x * t.width,
    t.scrollY + e.y * t.height,
    Math.max(1, e.w * t.width),
    Math.max(1, e.h * t.height)
  );
}
function pu(e) {
  return Math.max(0, e.width) * Math.max(0, e.height);
}
function Pk(e, t) {
  const r = Math.max(e.left, t.left), n = Math.min(e.right, t.right), i = Math.max(e.top, t.top), o = Math.min(e.bottom, t.bottom);
  return Math.max(0, n - r) * Math.max(0, o - i);
}
function $k(e) {
  return new DOMRect(e.left + window.scrollX, e.top + window.scrollY, e.width, e.height);
}
function Qd(e) {
  if (!e || !(e instanceof HTMLElement) || e === document.body || e === document.documentElement || Ok(e)) return !1;
  const t = e.getBoundingClientRect();
  if (t.width < 8 || t.height < 8) return !1;
  try {
    const r = getComputedStyle(e);
    if (r.display === "none" || r.visibility === "hidden" || Number(r.opacity) === 0) return !1;
  } catch {
  }
  return !0;
}
function zk(e, t) {
  return Nk(() => {
    const r = /* @__PURE__ */ new Set(), n = [], i = (s) => {
      let c = s;
      for (; c && c !== document.body && c !== document.documentElement; )
        !r.has(c) && Qd(c) && (r.add(c), n.push(c)), c = c.parentElement;
    }, o = typeof document.elementsFromPoint == "function" ? document.elementsFromPoint(e, t) : [document.elementFromPoint(e, t)].filter(Boolean);
    for (const s of o) i(s);
    return n;
  });
}
function Dk(e, t) {
  const r = Jd(t), n = Zd(e, r), i = Math.max(2, Math.min(window.innerWidth - 2, n.left + n.width / 2 - window.scrollX)), o = Math.max(2, Math.min(window.innerHeight - 2, n.top + n.height / 2 - window.scrollY)), s = zk(i, o);
  if (!s.length) return null;
  const c = Math.max(1, pu(n));
  let l = null, d = -1 / 0;
  for (const a of s) {
    const h = $k(a.getBoundingClientRect()), p = Pk(h, n);
    if (p <= 0) continue;
    const u = Math.max(1, pu(h)), m = p / c, f = Math.max(0, (u - p) / u), y = a.tagName.toLowerCase(), M = /^(button|a|input|textarea|select|label|section|article|nav|header|footer|main|form)$/.test(y) ? 0.18 : 0, v = u > window.innerWidth * window.innerHeight * 0.92 ? 0.8 : 0, b = m - f * 0.35 + M - v;
    b > d && (l = a, d = b);
  }
  return l ?? s[0] ?? null;
}
async function Fk(e, t) {
  if (e >= window.scrollX + 80 && e <= window.scrollX + window.innerWidth - 80 && t >= window.scrollY + 80 && t <= window.scrollY + window.innerHeight - 80) return;
  const i = Math.max(0, document.documentElement.scrollHeight - window.innerHeight), o = Math.max(0, document.documentElement.scrollWidth - window.innerWidth), s = Math.max(0, Math.min(i, t - window.innerHeight * 0.38)), c = Math.max(0, Math.min(o, e - window.innerWidth * 0.45));
  try {
    window.scrollTo({ top: s, left: c, behavior: Ys() ? "auto" : "smooth" });
  } catch {
    window.scrollTo(c, s);
  }
  await Ik(Ys() ? 80 : 520);
}
const Uk = /* @__PURE__ */ new Set([
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
function Bk(e) {
  const t = /* @__PURE__ */ new Set();
  return String(e || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((r) => r.length < 4 || Uk.has(r) || t.has(r) ? !1 : (t.add(r), !0));
}
function qk(e) {
  const t = Bk(e.text);
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
  for (const s of o) {
    if (!Qd(s)) continue;
    const c = s.getBoundingClientRect(), l = [
      s.textContent || "",
      s.getAttribute("aria-label") || "",
      s.getAttribute("title") || "",
      s.getAttribute("placeholder") || "",
      s.getAttribute("data-testid") || "",
      s.id || "",
      typeof s.className == "string" ? s.className : ""
    ].join(" ").toLowerCase();
    if (!l.trim()) continue;
    const d = t.reduce((f, y) => f + (l.includes(y) ? 1 : 0), 0);
    if (!d) continue;
    const a = s.tagName.toLowerCase(), h = /^(button|a|input|textarea|select|label|h1|h2|h3|section|article|nav|header|footer|main|form)$/.test(a) ? 0.6 : 0, u = Math.max(1, c.width * c.height) > window.innerWidth * window.innerHeight * 0.85 ? 1.1 : 0, m = d / t.length + h - u;
    m > i && (n = s, i = m);
  }
  return n;
}
async function Wk(e, t = {}) {
  if (e.region) {
    const r = Jd(e), n = Zd(e.region, r);
    t.scroll !== !1 && await Fk(n.left + n.width / 2, n.top + n.height / 2);
    const i = Dk(e.region, e);
    if (i) return i;
  }
  return qk(e);
}
function jk() {
  if (Yt && $r) return $r;
  Yt = document.createElement("div"), Yt.id = Hd, Yt.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;", $r = Yt.attachShadow({ mode: "open" }), Pg($r);
  const e = document.createElement("style");
  return e.textContent = Ak, $r.appendChild(e), document.body.appendChild(Yt), $r;
}
function ep() {
  if (Pt) return Pt;
  if (!document.getElementById(cu)) {
    const e = document.createElement("style");
    e.id = cu, e.textContent = _k, document.head.appendChild(e);
  }
  return Pt = document.createElement("div"), Pt.id = Yd, Pt.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;z-index:2147483640;pointer-events:none;overflow:visible;", document.body.appendChild(Pt), Pt;
}
function tp(e, t) {
  return Og({
    name: e.name,
    initials: e.initials,
    photoUrl: e.photoUrl,
    color: e.accent,
    animate: !1,
    legs: !0,
    size: t
  });
}
function Hk(e, t = [], r = {}) {
  if (typeof document > "u") return;
  Gs();
  const n = jk();
  ep(), un = new AbortController();
  const i = e === "all" ? t : t.filter((h) => e.includes(h.id));
  if (!i.length) {
    console.warn("[KlavitySims] deploy(): no matching Sims — panel not mounted."), Gs();
    return;
  }
  i.slice(0, 8).forEach((h) => {
    const p = h.accent || "#6366f1", u = h.initials || h.name.slice(0, 2).toUpperCase();
    Oi.set(h.id, { simId: h.id, accent: p, initials: u, name: h.name, photoUrl: h.photoUrl });
  });
  const o = document.createElement("div");
  o.className = "ksl-root", n.appendChild(o), Gt = document.createElement("div"), Gt.className = "ksl-sr", Gt.id = "ksl-announcer", Gt.setAttribute("aria-live", "polite"), Gt.setAttribute("aria-atomic", "true"), o.appendChild(Gt), gt = document.createElement("button"), gt.type = "button", gt.className = "ksl-launcher", gt.setAttribute("aria-label", "Open Sims feedback panel"), gt.addEventListener("click", () => Yk());
  const s = document.createElement("span");
  s.className = "ksl-pill", Ln = document.createElement("span"), Ln.className = "ksl-pill-avatars", xr = document.createElement("span"), xr.className = "ksl-pill-txt", s.append(Ln, xr), Sr = document.createElement("span"), Sr.className = "ksl-pill-badge", Sr.hidden = !0, gt.append(s, Sr), o.appendChild(gt), i.slice(0, 3).forEach((h) => {
    const p = Oi.get(h.id);
    p && Ln.appendChild(tp(p, 26));
  }), Vt = document.createElement("section"), Vt.className = "ksl-panel", Vt.setAttribute("aria-label", "Sims feedback"), Vt.setAttribute("role", "dialog");
  const c = document.createElement("div");
  c.className = "ksl-head";
  const l = document.createElement("div");
  l.className = "ksl-title-row";
  const d = document.createElement("div");
  d.className = "ksl-title", d.textContent = "Sims feedback";
  const a = document.createElement("button");
  a.type = "button", a.className = "ksl-icon-btn", a.title = "Minimize", a.setAttribute("aria-label", "Minimize Sims feedback panel"), a.innerHTML = Z("x", { size: 15 }), a.addEventListener("click", () => hu()), l.append(d, a), Fr = document.createElement("div"), Fr.className = "ksl-count", Ht = document.createElement("div"), Ht.className = "ksl-chips", c.append(l, Fr, Ht), nr = document.createElement("div"), nr.className = "ksl-list", nr.setAttribute("role", "list"), Vt.append(c, nr), o.appendChild(Vt), document.addEventListener("keydown", (h) => {
    h.key === "Escape" && or && hu();
  }, { signal: un.signal }), Kd(!0), vn();
}
function rp(e) {
  Yn = e, gt == null || gt.classList.toggle("is-reviewing", e), vn(), or && kn();
}
function Yk() {
  !Vt || !gt || (or = !0, Vt.classList.add("is-open"), gt.hidden = !0, kn());
}
function hu() {
  !Vt || !gt || (or = !1, Vt.classList.remove("is-open"), gt.hidden = !1, vn());
}
function np() {
  const e = Array.from(zt.values()), t = new Set(e.map((n) => n.entry.simId)), r = e.filter((n) => mn(n.obs) === "HIGH").length;
  return { total: e.length, sims: t.size, high: r };
}
function vn() {
  const e = np();
  xr && (Yn && e.total === 0 ? xr.innerHTML = "Your Sims are reviewing…" : e.total === 0 ? xr.innerHTML = "Sims are watching this page" : xr.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from your Sims`), Sr && (Sr.hidden = e.high === 0, Sr.textContent = `${e.high} high`), or && ip(e);
}
function ip(e) {
  Fr && (e.total === 0 ? Fr.innerHTML = Yn ? "Your Sims are reviewing this page…" : "No findings yet — your Sims are watching." : Fr.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from <b>${e.sims}</b> Sim${e.sims === 1 ? "" : "s"}` + (e.high > 0 ? ` · <span class="ksl-hi">${e.high} high</span>` : "")), Vk();
}
function Vk() {
  if (!Ht) return;
  const e = Array.from(zt.values());
  if (Ht.hidden = e.length === 0, Ht.textContent = "", !e.length) return;
  const t = document.createElement("span");
  t.className = "ksl-chips-label", t.textContent = "Sim", Ht.appendChild(t);
  const r = /* @__PURE__ */ new Map();
  e.forEach((i) => {
    const o = r.get(i.entry.simId) ?? { entry: i.entry, n: 0 };
    o.n += 1, r.set(i.entry.simId, o);
  }), r.forEach(({ entry: i, n: o }) => {
    const s = document.createElement("button");
    s.type = "button", s.className = "ksl-chip" + (Dr === i.simId ? " is-on" : ""), s.setAttribute("aria-pressed", String(Dr === i.simId));
    const c = document.createElement("span");
    c.className = "ksl-dot", c.style.background = i.accent, s.append(c, document.createTextNode(`${i.initials} · ${o}`)), s.addEventListener("click", () => {
      Dr = Dr === i.simId ? null : i.simId, kn();
    }), Ht.appendChild(s);
  });
  const n = document.createElement("span");
  n.className = "ksl-chips-label", n.style.marginLeft = "6px", n.textContent = "Priority", Ht.appendChild(n), ["HIGH", "MED", "LOW"].forEach((i) => {
    const o = e.filter((l) => mn(l.obs) === i).length;
    if (!o) return;
    const s = document.createElement("button");
    s.type = "button";
    const c = fn === i;
    s.className = "ksl-chip" + (c ? ` sev-on-${Xd[i]}` : ""), s.setAttribute("aria-pressed", String(c)), s.textContent = `${i} · ${o}`, s.addEventListener("click", () => {
      fn = fn === i ? null : i, kn();
    }), Ht.appendChild(s);
  });
}
function Gk() {
  return Array.from(zt.values()).filter((e) => !Dr || e.entry.simId === Dr).filter((e) => !fn || mn(e.obs) === fn).sort((e, t) => {
    const r = mn(e.obs), n = mn(t.obs), i = r ? du[r] : 3, o = n ? du[n] : 3;
    return i - o;
  });
}
function Kk(e) {
  const { entry: t, obs: r } = e, n = mn(r), i = document.createElement("div");
  i.className = "ksl-row", i.setAttribute("role", "listitem"), i.dataset.id = e.id, i.style.borderLeftColor = t.accent;
  const o = document.createElement("div");
  o.className = "ksl-r-head", o.appendChild(tp(t, 26));
  const s = document.createElement("span");
  s.className = "ksl-r-name", s.style.color = t.accent, s.textContent = t.name, o.appendChild(s);
  const c = String(r.sentiment ?? "").trim();
  if (c) {
    const m = document.createElement("span");
    m.className = "ksl-r-sent", m.textContent = c, o.appendChild(m);
  }
  if (n) {
    const m = document.createElement("span");
    m.className = `ksl-sev ${Xd[n]}`, m.setAttribute("aria-label", `Priority: ${n}`), m.textContent = n, o.appendChild(m);
  }
  i.appendChild(o);
  const l = document.createElement("div");
  l.className = "ksl-r-obs", l.textContent = r.text || "", i.appendChild(l);
  const d = document.createElement("button");
  d.type = "button", d.className = "ksl-r-expand", d.textContent = "Show more", d.addEventListener("click", () => {
    const m = i.classList.toggle("is-expanded");
    d.textContent = m ? "Show less" : "Show more";
  }), i.appendChild(d);
  const a = document.createElement("div");
  a.className = "ksl-r-actions";
  const h = document.createElement("button");
  h.type = "button", h.className = "ksl-r-act track", h.innerHTML = Z("bug", { size: 12 }) + " Track as Bug", h.setAttribute("aria-label", `Track feedback from ${t.name} as a bug`), h.addEventListener("click", () => {
    var m;
    (m = Si.onTriage) == null || m.call(Si, r, t.name), fu(e.id);
  });
  const p = document.createElement("button");
  p.type = "button", p.className = "ksl-r-act jump", p.innerHTML = Z("map-pin", { size: 12 }) + " Jump to on page", p.setAttribute("aria-label", `Jump to where ${t.name} flagged this`), p.addEventListener("click", () => {
    Jk(e.id);
  });
  const u = document.createElement("button");
  return u.type = "button", u.className = "ksl-r-act dismiss", u.textContent = "Dismiss", u.setAttribute("aria-label", `Dismiss feedback from ${t.name}`), u.addEventListener("click", () => {
    fu(e.id);
  }), a.append(h, p, u), i.appendChild(a), i;
}
function Xk(e) {
  e.querySelectorAll(".ksl-row").forEach((t) => {
    const r = t.querySelector(".ksl-r-obs");
    r && r.scrollHeight - r.clientHeight > 4 && t.classList.add("is-clamped");
  });
}
function kn() {
  if (!nr || !or) {
    vn();
    return;
  }
  const e = np();
  ip(e);
  const t = Gk();
  if (nr.textContent = "", !t.length) {
    const n = document.createElement("div");
    n.className = "ksl-empty";
    const i = zt.size > 0;
    if (Yn && !i) {
      const o = document.createElement("div");
      o.className = "ksl-empty-title", o.textContent = "Your Sims are reviewing this page…";
      const s = document.createElement("div");
      s.textContent = "Findings will appear here as they spot things.";
      const c = document.createElement("div");
      c.className = "ksl-shimmer", n.append(o, s, c);
    } else if (i)
      n.textContent = "No findings match these filters.";
    else {
      const o = document.createElement("div");
      o.className = "ksl-empty-title", o.textContent = "No findings yet";
      const s = document.createElement("div");
      s.textContent = "Your Sims are watching this page as a first-time customer would.", n.append(o, s);
    }
    nr.appendChild(n), zt.forEach((o) => {
      o.rowEl = null;
    });
    return;
  }
  t.forEach((n) => {
    const i = Kk(n);
    n.rowEl = i, nr.appendChild(i);
  });
  const r = new Set(t.map((n) => n.id));
  zt.forEach((n) => {
    r.has(n.id) || (n.rowEl = null);
  }), Xk(nr);
}
function Vs() {
  dn == null || dn(), dn = null;
}
async function Jk(e) {
  const t = zt.get(e);
  if (!t) return;
  const r = await Wk(t.obs, { scroll: !0 });
  !r || !Pt || Zk(r, t.entry.accent);
}
function Zk(e, t) {
  Vs();
  const r = ep(), n = document.createElement("div");
  n.className = "klav-halo", n.style.borderColor = t, n.style.boxShadow = `0 0 0 4px ${uu(t, 0.16)},0 0 24px ${uu(t, 0.2)}`, r.appendChild(n);
  const i = new AbortController(), o = () => {
    const d = e.getBoundingClientRect(), a = d.width > 0 && d.height > 0 && d.bottom > 0 && d.right > 0 && d.top < window.innerHeight && d.left < window.innerWidth;
    n.style.display = a ? "" : "none", a && (n.style.left = `${d.left - 5}px`, n.style.top = `${d.top - 5}px`, n.style.width = `${d.width + 10}px`, n.style.height = `${d.height + 10}px`);
  }, s = () => requestAnimationFrame(o);
  o(), window.addEventListener("scroll", s, { passive: !0, signal: i.signal }), window.addEventListener("resize", s, { signal: i.signal });
  const c = setTimeout(() => {
    n.style.opacity = "0", n.style.transition = "opacity .3s ease", setTimeout(() => {
      dn === l && Vs();
    }, 320);
  }, 3200), l = () => {
    clearTimeout(c), i.abort(), Je(n);
  };
  dn = l;
}
function Qk(e, t) {
  const r = `f_${e.simId}_${++Vd}`;
  zt.set(r, { id: r, entry: e, obs: t, rowEl: null }), or ? kn() : vn(), Gt && (Gt.textContent = "", requestAnimationFrame(() => {
    Gt && (Gt.textContent = `${e.name}: ${t.text || ""}`);
  }));
}
function ev(e) {
  const t = zt.get(e);
  if (!t) return;
  const r = () => {
    zt.delete(e), or ? kn() : vn();
  };
  t.rowEl && or ? (t.rowEl.classList.add("is-removing"), setTimeout(r, Ys() ? 0 : 300)) : r();
}
function fu(e) {
  const t = zt.get(e);
  t && (Ni.add(Gd(t.entry.simId, t.obs)), ev(e));
}
function tv(e, t, r) {
  if (!Yt) return;
  const n = Oi.get(e);
  if (!n) {
    console.warn(`[KlavitySims] renderFeedback: simId "${e}" not registered`);
    return;
  }
  if (r.length) {
    rp(!1);
    for (const i of r) {
      if (!Lk(i)) continue;
      const o = Gd(e, i);
      Ni.has(o) || (Ni.add(o), Qk(n, i));
    }
  }
}
function Gs() {
  Vs(), zt.clear(), Vd = 0, Oi.clear(), Ni.clear(), or = !1, Dr = null, fn = null, Yn = !1, un == null || un.abort(), un = null, gt = null, Ln = null, xr = null, Sr = null, Vt = null, Fr = null, Ht = null, nr = null, Gt = null, Je(Pt), Pt = null, Je(Yt), Yt = null, $r = null, Kd(!1);
}
const Si = {
  deploy: Hk,
  setReviewing: rp,
  renderFeedback: tv,
  undeploy: Gs,
  onTriage: null
};
function rv() {
  typeof window > "u" || window.KlavitySims || (window.KlavitySims = Si);
}
typeof window < "u" && rv();
const mu = "klav-ao-css", nv = "klav-ao-overlay";
function iv(e, t, r, n, i, o = 10) {
  const l = !(e.y - r - 14 >= o), d = l ? e.y + e.h + 14 : e.y - r - 14, a = Math.max(o, Math.min(d, i - r - o));
  return { left: Math.max(o, Math.min(e.x, n - t - o)), top: a, below: l };
}
const ov = `
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
let Pr = null, sv = 1;
const Pi = /* @__PURE__ */ new Map();
function gu(e, t) {
  const r = e.replace("#", ""), n = (c) => parseInt(c, 16), [i, o, s] = r.length === 3 ? [n(r[0] + r[0]), n(r[1] + r[1]), n(r[2] + r[2])] : [n(r.slice(0, 2)), n(r.slice(2, 4)), n(r.slice(4, 6))];
  return `rgba(${i},${o},${s},${t})`;
}
function av() {
  if (Pr) return Pr;
  if (!document.getElementById(mu)) {
    const e = document.createElement("style");
    e.id = mu, e.textContent = ov, document.head.appendChild(e);
  }
  return Pr = document.createElement("div"), Pr.id = nv, Pr.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;pointer-events:none;overflow:visible;z-index:2147483640;", document.body.appendChild(Pr), Pr;
}
function kv(e, t, r = {}) {
  const n = av(), i = r.color ?? "#6366f1", o = `klav-ao-${sv++}`, s = 5, c = document.createElement("div");
  c.className = "klav-ao-halo", c.dataset.aoId = o, c.style.left = e.x - s + "px", c.style.top = e.y - s + "px", c.style.width = e.w + s * 2 + "px", c.style.height = e.h + s * 2 + "px", c.style.borderColor = i, c.style.boxShadow = `0 0 0 4px ${gu(i, 0.14)},0 0 24px ${gu(i, 0.18)}`, n.appendChild(c);
  let l = null;
  if (t) {
    const h = { x: e.x - s, y: e.y - s, w: e.w + s * 2, h: e.h + s * 2 }, { left: p, top: u, below: m } = iv(
      h,
      224,
      96,
      window.innerWidth,
      window.innerHeight
    );
    l = document.createElement("div"), l.className = "klav-ao-pin" + (m ? " tail-top" : ""), l.dataset.aoId = o, l.style.borderLeftColor = i, l.style.left = p + "px", l.style.top = u + "px", l.setAttribute("role", "status"), l.setAttribute("aria-label", `Annotation: ${t}`);
    const f = document.createElement("div");
    f.className = "klav-ao-hd";
    const y = document.createElement("span");
    y.className = "klav-ao-lbl", y.style.color = i, y.textContent = t, f.appendChild(y);
    const M = r.priority ?? r.severity;
    if (M) {
      const b = M === "medium" ? " sev-m" : M === "low" ? " sev-l" : "", A = document.createElement("span");
      A.className = `klav-ao-sev${b}`, A.textContent = M, f.appendChild(A);
    }
    const v = document.createElement("button");
    v.className = "klav-ao-dismiss", v.textContent = "Dismiss", v.addEventListener("click", () => op(o)), l.appendChild(f), l.appendChild(v), n.appendChild(l);
  }
  return Pi.set(o, { halo: c, pin: l }), o;
}
function op(e) {
  const t = Pi.get(e);
  if (!t) return;
  Pi.delete(e);
  const { halo: r, pin: n } = t;
  n ? (n.classList.add("is-out"), r.style.animation = "klav-ao-pin-out .22s ease-in forwards", setTimeout(() => {
    Je(n), Je(r);
  }, 240)) : Je(r);
}
function vv() {
  for (const e of [...Pi.keys()]) op(e);
}
let ba = nn, wr = "";
const sp = { consoleErrors: [], networkFailures: [] };
let ka, ap, gn = null;
function rn() {
  return ba.backendUrl || Bu;
}
const lv = 15e3;
function _n(e, t = {}, r = lv) {
  const n = new AbortController(), i = setTimeout(() => n.abort(), r);
  return fetch(e, { ...t, signal: n.signal }).finally(() => clearTimeout(i));
}
function lp(e) {
  const t = {};
  for (const [r, n] of Object.entries(e))
    n != null && (t[String(r).slice(0, 64)] = String(n).slice(0, 1e3));
  return t;
}
async function yu() {
  return sm(document.body, {
    filter: (e) => e.id !== "klavity-sdk-host"
  });
}
function cv() {
  return vm(sp, { identity: ka, metadata: ap });
}
async function uv(e) {
  return fm(
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
      projectId: wr || void 0,
      replayEvents: e.replayEvents
    },
    ba,
    { backend: Fg }
  );
}
function va(e = "bug") {
  const t = Eg(e, {
    onCaptureFull: yu,
    // #638: render the "Attach console logs" toggle (default OFF). Console errors ride the report only when
    // the reporter opts in (p.attachConsole) — parity with the widget's privacy-preserving default.
    consoleAttachToggle: !0,
    // Pre-compress each screenshot as it's captured (runs while the reporter types), same as the widget —
    // by submit time the promise is settled so there's zero compression delay before upload.
    compressImage: zl,
    // ── KLA-729 composer AI-assist (parity with widget.ts) — all best-effort, all resolve null on failure ──
    // KLAVITYKLA-241 pre-submit known-issue check: as the reporter types, ask the backend whether this
    // project already tracks a matching issue so they don't file a blind duplicate.
    onCheckKnown: async (r) => {
      try {
        const n = await _n(rn() + "/api/widget/known-check", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ project: wr, text: r, url: location.href })
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
        const i = await _n(rn() + "/api/report/clarity", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ projectId: wr, text: r, pageUrl: location.href, images: (n == null ? void 0 : n.images) ?? 0, client: Ro() })
        });
        if (!i.ok) return null;
        const o = await i.json().catch(() => null);
        return o && typeof o.tip == "string" && o.tip ? { tip: o.tip } : null;
      } catch {
        return null;
      }
    },
    // KLA-586 AI "Enhance" (POST /api/report/enhance): the reporter's one-liner + the primary shot + picked
    onEnhance: async (r, n) => {
      try {
        const i = await _n(rn() + "/api/report/enhance", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            projectId: wr,
            text: r,
            pageUrl: location.href,
            shot: (n == null ? void 0 : n.shot) || "",
            annotations: (n == null ? void 0 : n.annotations) || null,
            annotationTexts: (n == null ? void 0 : n.annotationTexts) || [],
            picked: (n == null ? void 0 : n.picked) || null,
            images: (n == null ? void 0 : n.images) ?? 0,
            client: Ro()
          })
        }, 3e4);
        if (!i.ok) return null;
        const o = await i.json().catch(() => null);
        return o && o.draft ? o.draft : null;
      } catch {
        return null;
      }
    },
    // KD-995: split a "Record me" walkthrough into separate tickets (POST /api/report/split → the issues the
    // reporter narrated). Resolve null on any failure so the composer keeps the single ticket.
    onSplitRecording: async (r, n) => {
      try {
        const i = new FormData();
        i.append("projectId", wr), i.append("audio", r, "recording.webm"), r.type && i.append("mime", r.type), i.append("pageUrl", location.href), n != null && n.text && i.append("text", n.text);
        const o = await _n(rn() + "/api/report/split", { method: "POST", body: i }, 9e4);
        if (!o.ok) return null;
        const s = await o.json().catch(() => null);
        return s && Array.isArray(s.issues) ? s.issues : null;
      } catch {
        return null;
      }
    },
    // KLA-505 server-side dictation (POST /api/voice/transcribe): the Voice button hands each mic clip here;
    // resolve null on any failure so the composer falls back to Web Speech.
    onDictate: async (r) => {
      try {
        const n = new FormData();
        n.append("projectId", wr), n.append("audio", r, "dictation.webm"), r.type && n.append("mime", r.type);
        const i = await _n(rn() + "/api/voice/transcribe", { method: "POST", body: n });
        if (!i.ok) return null;
        const o = await i.json().catch(() => null);
        return o && typeof o.text == "string" ? { text: o.text } : null;
      } catch {
        return null;
      }
    },
    // #647 LIVE streaming dictation: ws(s)://…/api/voice/stream?project=… — the composer PREFERS this and
    // falls back to onDictate then Web Speech on any connect failure.
    dictationStreamUrl: (() => {
      try {
        const r = new URL(rn() + "/api/voice/stream");
        return r.protocol = r.protocol === "https:" ? "wss:" : "ws:", r.searchParams.set("project", wr), r.toString();
      } catch {
        return;
      }
    })(),
    // KLAVITYKLA-438 "Record me": expose the button when the browser can screen-record, driving the
    // consent → record overlay from the shared sdk recorder (same as the widget).
    allowRecording: (() => {
      try {
        return Ju();
      } catch {
        return !1;
      }
    })(),
    onRecord: (r) => sy({ onPhase: r }),
    // PX4 #425: allow non-image file attachments through the unified attach control (parity with widget).
    allowFileAttachments: !0,
    onSubmit: async (r) => {
      const n = await Promise.all(r.screenshots.map((s) => zl(s))), i = await Promise.all(n.map((s) => ay(s))), o = cv();
      return r.attachConsole !== !0 && (o.consoleErrors = []), uv({
        type: r.type,
        kind: r.kind,
        title: r.title,
        description: r.description,
        context: o,
        screenshots: n,
        screenshotThumbs: i,
        files: r.files,
        recordings: r.recordings,
        annotations: r.annotations,
        reporterEmail: r.reporterEmail,
        reporter: ka,
        clientInfo: Ro(),
        referrer: typeof document < "u" && document.referrer || void 0,
        replayEvents: (gn == null ? void 0 : gn.getEvents()) ?? []
      });
    }
  });
  setTimeout(async () => {
    try {
      const r = await yu();
      t.addScreenshot(r);
    } catch {
    }
  }, 200);
}
function dv() {
  if (typeof document > "u" || !document.body) return;
  let e = document.getElementById("klavity-sdk-host");
  e || (e = document.createElement("div"), e.id = "klavity-sdk-host", e.style.cssText = "display:none!important;position:fixed;width:0;height:0;pointer-events:none;", document.body.appendChild(e)), e.setAttribute("data-klavity-ui", "sdk");
}
function pv() {
  wm(sp, { consoleLevels: !0 });
}
function cp(e) {
  ka = e ? lp(e) : void 0;
}
function up(e) {
  ap = e ? lp(e) : void 0;
}
function hv() {
  if (typeof document > "u" || document.getElementById("klavity-sdk-menu-anim")) return;
  const e = document.createElement("style");
  e.id = "klavity-sdk-menu-anim", e.textContent = Ug, (document.head || document.documentElement).appendChild(e);
}
function fv() {
  document.addEventListener("contextmenu", (e) => {
    if (ag(e.target)) return;
    e.preventDefault(), hv();
    const t = document.createElement("div");
    t.className = "klm-menu", t.style.cssText = "position:fixed;z-index:2147483647;width:200px;max-width:calc(100vw - 16px);border-radius:20px;overflow:hidden;font-family:system-ui,-apple-system,sans-serif;transform-origin:top left;padding:8px;display:flex;flex-direction:column;gap:7px;box-sizing:border-box;pointer-events:auto;background:radial-gradient(135% 90% at 50% -12%, rgba(139,92,246,.18), rgba(139,92,246,0) 55%), linear-gradient(180deg, rgba(250,247,240,.95), rgba(243,236,225,.96));border:1px solid rgba(255,255,255,.55);box-shadow:0 24px 60px -12px rgba(76,40,130,.32), 0 8px 22px rgba(99,102,241,.16), 0 1.5px 4px rgba(25,20,15,.10), inset 0 1px 0 rgba(255,255,255,.75);";
    const r = (d, a, h, p, u = {}) => {
      const m = qg(document, { iconHtml: Z(d), label: a, desc: h, primary: u.primary });
      return m.addEventListener("click", () => {
        s(), va(p);
      }), m;
    };
    t.appendChild(r("zap", "Report a Bug", "Snap the page and tell us what broke.", "bug", { primary: !0 })), t.appendChild(r("lightbulb", "Request a Feature", "Suggest something you'd love to see.", "feature")), t.style.left = e.clientX + "px", t.style.top = "-9999px", document.body.appendChild(t);
    const n = 8, i = Math.max(n, Math.min(e.clientX, window.innerWidth - t.offsetWidth - n)), o = Math.max(n, Math.min(e.clientY, window.innerHeight - t.offsetHeight - n));
    t.style.left = i + "px", t.style.top = o + "px";
    const s = () => {
      Je(t), document.removeEventListener("click", c), document.removeEventListener("keydown", l, !0);
    }, c = (d) => {
      (!d || !t.contains(d.target)) && s();
    }, l = (d) => {
      d.key === "Escape" && s();
    };
    setTimeout(() => {
      document.addEventListener("click", c), document.addEventListener("keydown", l, !0);
    }, 0);
  });
}
function dp(e = {}) {
  if (ba = {
    ...nn,
    ...e,
    jira: { ...nn.jira, ...e.jira },
    linear: { ...nn.linear, ...e.linear },
    github: { ...nn.github, ...e.github },
    plane: { ...nn.plane, ...e.plane }
  }, typeof e.projectId == "string" && (wr = e.projectId), pv(), dv(), fv(), !gn)
    try {
      gn = Rk(Cr);
    } catch {
      gn = null;
    }
}
typeof window < "u" && (window.KlavitySnap = { init: dp, openModal: va, identify: cp, setMetadata: up });
const wv = { init: dp, openModal: va, identify: cp, setMetadata: up };
export {
  Si as KlavitySims,
  Si as SimsLive,
  op as clearAnnotation,
  vv as clearAnnotations,
  wv as default,
  cp as identify,
  dp as init,
  rv as installKlavitySims,
  va as openModal,
  up as setMetadata,
  kv as showAnnotation
};
