var Ep = Object.defineProperty;
var Cp = (e, t, r) => t in e ? Ep(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var Gn = (e, t, r) => Cp(e, typeof t != "symbol" ? t + "" : t, r);
function Mp(e, t) {
  return e[13] = 1, e[14] = t >> 8, e[15] = t & 255, e[16] = t >> 8, e[17] = t & 255, e;
}
const eu = 112, tu = 72, ru = 89, nu = 115;
let cs;
function Rp() {
  const e = new Int32Array(256);
  for (let t = 0; t < 256; t++) {
    let r = t;
    for (let n = 0; n < 8; n++)
      r = r & 1 ? 3988292384 ^ r >>> 1 : r >>> 1;
    e[t] = r;
  }
  return e;
}
function Tp(e) {
  let t = -1;
  cs || (cs = Rp());
  for (let r = 0; r < e.length; r++)
    t = cs[(t ^ e[r]) & 255] ^ t >>> 8;
  return t ^ -1;
}
function Ap(e) {
  const t = e.length - 1;
  for (let r = t; r >= 4; r--)
    if (e[r - 4] === 9 && e[r - 3] === eu && e[r - 2] === tu && e[r - 1] === ru && e[r] === nu)
      return r - 3;
  return 0;
}
function _p(e, t, r = !1) {
  const n = new Uint8Array(13);
  t *= 39.3701, n[0] = eu, n[1] = tu, n[2] = ru, n[3] = nu, n[4] = t >>> 24, n[5] = t >>> 16, n[6] = t >>> 8, n[7] = t & 255, n[8] = n[4], n[9] = n[5], n[10] = n[6], n[11] = n[7], n[12] = 1;
  const i = Tp(n), s = new Uint8Array(4);
  if (s[0] = i >>> 24, s[1] = i >>> 16, s[2] = i >>> 8, s[3] = i & 255, r) {
    const a = Ap(e);
    return e.set(n, a), e.set(s, a + 13), e;
  } else {
    const a = new Uint8Array(4);
    a[0] = 0, a[1] = 0, a[2] = 0, a[3] = 9;
    const c = new Uint8Array(54);
    return c.set(e, 0), c.set(a, 33), c.set(n, 37), c.set(s, 50), c;
  }
}
const Lp = "AAlwSFlz", Ip = "AAAJcEhZ", Op = "AAAACXBI";
function Np(e) {
  let t = e.indexOf(Lp);
  return t === -1 && (t = e.indexOf(Ip)), t === -1 && (t = e.indexOf(Op)), t;
}
const iu = "[modern-screenshot]", pr = typeof window < "u", Pp = pr && "Worker" in window, zp = pr && "atob" in window, Dp = pr && "btoa" in window;
var Qc;
const $o = pr ? (Qc = window.navigator) == null ? void 0 : Qc.userAgent : "", su = $o.includes("Chrome"), gi = $o.includes("AppleWebKit") && !su, Fo = $o.includes("Firefox"), $p = (e) => e && "__CONTEXT__" in e, Fp = (e) => e.constructor.name === "CSSFontFaceRule", Up = (e) => e.constructor.name === "CSSImportRule", Bp = (e) => e.constructor.name === "CSSLayerBlockRule", Vt = (e) => e.nodeType === 1, Ln = (e) => typeof e.className == "object", ou = (e) => e.tagName === "image", qp = (e) => e.tagName === "use", Cn = (e) => Vt(e) && typeof e.style < "u" && !Ln(e), Wp = (e) => e.nodeType === 8, Hp = (e) => e.nodeType === 3, nn = (e) => e.tagName === "IMG", Ti = (e) => e.tagName === "VIDEO", jp = (e) => e.tagName === "CANVAS", Yp = (e) => e.tagName === "TEXTAREA", Vp = (e) => e.tagName === "INPUT", Gp = (e) => e.tagName === "STYLE", Xp = (e) => e.tagName === "SCRIPT", Kp = (e) => e.tagName === "SELECT", Jp = (e) => e.tagName === "SLOT", Zp = (e) => e.tagName === "IFRAME", Qp = (...e) => console.warn(iu, ...e);
function eh(e) {
  var r;
  const t = (r = e == null ? void 0 : e.createElement) == null ? void 0 : r.call(e, "canvas");
  return t && (t.height = t.width = 1), !!t && "toDataURL" in t && !!t.toDataURL("image/webp").includes("image/webp");
}
const Mo = (e) => e.startsWith("data:");
function au(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (pr && e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i) || !pr)
    return e;
  const r = Ai().implementation.createHTMLDocument(), n = r.createElement("base"), i = r.createElement("a");
  return r.head.appendChild(n), r.body.appendChild(i), t && (n.href = t), i.href = e, i.href;
}
function Ai(e) {
  return (e && Vt(e) ? e == null ? void 0 : e.ownerDocument : e) ?? window.document;
}
const _i = "http://www.w3.org/2000/svg";
function th(e, t, r) {
  const n = Ai(r).createElementNS(_i, "svg");
  return n.setAttributeNS(null, "width", e.toString()), n.setAttributeNS(null, "height", t.toString()), n.setAttributeNS(null, "viewBox", `0 0 ${e} ${t}`), n;
}
function rh(e, t) {
  let r = new XMLSerializer().serializeToString(e);
  return t && (r = r.replace(/[\u0000-\u0008\v\f\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/gu, "")), `data:image/svg+xml;charset=utf-8,${encodeURIComponent(r)}`;
}
function nh(e, t) {
  return new Promise((r, n) => {
    const i = new FileReader();
    i.onload = () => r(i.result), i.onerror = () => n(i.error), i.onabort = () => n(new Error(`Failed read blob to ${t}`)), i.readAsDataURL(e);
  });
}
const ih = (e) => nh(e, "dataUrl");
function Qr(e, t) {
  const r = Ai(t).createElement("img");
  return r.decoding = "sync", r.loading = "eager", r.src = e, r;
}
function Mn(e, t) {
  return new Promise((r) => {
    const { timeout: n, ownerDocument: i, onError: s, onWarn: a } = t ?? {}, c = typeof e == "string" ? Qr(e, Ai(i)) : e;
    let l = null, d = null;
    function o() {
      r(c), l && clearTimeout(l), d == null || d();
    }
    if (n && (l = setTimeout(o, n)), Ti(c)) {
      const h = c.currentSrc || c.src;
      if (!h)
        return c.poster ? Mn(c.poster, t).then(r) : o();
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
      const h = ou(c) ? c.href.baseVal : c.currentSrc || c.src;
      if (!h)
        return o();
      const p = async () => {
        if (nn(c) && "decode" in c)
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
      if (nn(c) && c.complete)
        return p();
      d = () => {
        c.removeEventListener("load", p), c.removeEventListener("error", u);
      }, c.addEventListener("load", p, { once: !0 }), c.addEventListener("error", u, { once: !0 });
    }
  });
}
async function sh(e, t) {
  Cn(e) && (nn(e) || Ti(e) ? await Mn(e, t) : await Promise.all(
    ["img", "video"].flatMap((r) => Array.from(e.querySelectorAll(r)).map((n) => Mn(n, t)))
  ));
}
const lu = /* @__PURE__ */ (function() {
  let t = 0;
  const r = () => `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4);
  return () => (t += 1, `u${r()}${t}`);
})();
function cu(e) {
  return e == null ? void 0 : e.split(",").map((t) => t.trim().replace(/"|'/g, "").toLowerCase()).filter(Boolean);
}
let ja = 0;
function oh(e) {
  const t = `${iu}[#${ja}]`;
  return ja++, {
    // eslint-disable-next-line no-console
    time: (r) => e && console.time(`${t} ${r}`),
    // eslint-disable-next-line no-console
    timeEnd: (r) => e && console.timeEnd(`${t} ${r}`),
    warn: (...r) => e && Qp(...r)
  };
}
function ah(e) {
  return {
    cache: e ? "no-cache" : "force-cache"
  };
}
async function Li(e, t) {
  return $p(e) ? e : lh(e, { ...t, autoDestruct: !0 });
}
async function lh(e, t) {
  var u, m;
  const { scale: r = 1, workerUrl: n, workerNumber: i = 1 } = t || {}, s = !!(t != null && t.debug), a = (t == null ? void 0 : t.features) ?? !0, c = e.ownerDocument ?? (pr ? window.document : void 0), l = ((u = e.ownerDocument) == null ? void 0 : u.defaultView) ?? (pr ? window : void 0), d = /* @__PURE__ */ new Map(), o = {
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
      requestInit: ah((m = t == null ? void 0 : t.fetch) == null ? void 0 : m.bypassingCache),
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
    log: oh(s),
    node: e,
    ownerDocument: c,
    ownerWindow: l,
    dpi: r === 1 ? null : 96 * r,
    svgStyleElement: uu(c),
    svgDefsElement: c == null ? void 0 : c.createElementNS(_i, "defs"),
    svgStyles: /* @__PURE__ */ new Map(),
    defaultComputedStyles: /* @__PURE__ */ new Map(),
    workers: [
      ...Array.from({
        length: Pp && n && i ? i : 0
      })
    ].map(() => {
      try {
        const f = new Worker(n);
        return f.onmessage = async (y) => {
          var b, T, w, k;
          const { url: E, result: v } = y.data;
          v ? (T = (b = d.get(E)) == null ? void 0 : b.resolve) == null || T.call(b, v) : (k = (w = d.get(E)) == null ? void 0 : w.reject) == null || k.call(w, new Error(`Error receiving message from worker: ${E}`));
        }, f.onmessageerror = (y) => {
          var v, b;
          const { url: E } = y.data;
          (b = (v = d.get(E)) == null ? void 0 : v.reject) == null || b.call(v, new Error(`Error receiving message from worker: ${E}`));
        }, f;
      } catch (f) {
        return o.log.warn("Failed to new Worker", f), null;
      }
    }).filter(Boolean),
    fontFamilies: /* @__PURE__ */ new Map(),
    fontCssTexts: /* @__PURE__ */ new Map(),
    acceptOfImage: `${[
      eh(c) && "image/webp",
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
  o.log.time("wait until load"), await sh(e, { timeout: o.timeout, onWarn: o.log.warn }), o.log.timeEnd("wait until load");
  const { width: h, height: p } = ch(e, o);
  return o.width = h, o.height = p, o;
}
function uu(e) {
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
function ch(e, t) {
  let { width: r, height: n } = t;
  if (Vt(e) && (!r || !n)) {
    const i = e.getBoundingClientRect();
    r = r || i.width || Number(e.getAttribute("width")) || 0, n = n || i.height || Number(e.getAttribute("height")) || 0;
  }
  return { width: r, height: n };
}
async function uh(e, t) {
  const {
    log: r,
    timeout: n,
    drawImageCount: i,
    drawImageInterval: s
  } = t;
  r.time("image to canvas");
  const a = await Mn(e, { timeout: n, onWarn: t.log.warn }), { canvas: c, context2d: l } = dh(e.ownerDocument, t), d = () => {
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
function dh(e, t) {
  const { width: r, height: n, scale: i, backgroundColor: s, maximumCanvasSize: a } = t, c = e.createElement("canvas");
  c.width = Math.floor(r * i), c.height = Math.floor(n * i), c.style.width = `${r}px`, c.style.height = `${n}px`, a && (c.width > a || c.height > a) && (c.width > a && c.height > a ? c.width > c.height ? (c.height *= a / c.width, c.width = a) : (c.width *= a / c.height, c.height = a) : c.width > a ? (c.height *= a / c.width, c.width = a) : (c.width *= a / c.height, c.height = a));
  const l = c.getContext("2d");
  return l && s && (l.fillStyle = s, l.fillRect(0, 0, c.width, c.height)), { canvas: c, context2d: l };
}
function du(e, t) {
  if (e.ownerDocument)
    try {
      const s = e.toDataURL();
      if (s !== "data:,")
        return Qr(s, e.ownerDocument);
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
function ph(e, t) {
  var r;
  try {
    if ((r = e == null ? void 0 : e.contentDocument) != null && r.documentElement)
      return Uo(e.contentDocument.documentElement, t);
  } catch (n) {
    t.log.warn("Failed to clone iframe", n);
  }
  return e.cloneNode(!1);
}
function hh(e) {
  const t = e.cloneNode(!1);
  return e.currentSrc && e.currentSrc !== e.src && (t.src = e.currentSrc, t.srcset = ""), t.loading === "lazy" && (t.loading = "eager"), t;
}
async function fh(e, t) {
  if (e.ownerDocument && !e.currentSrc && e.poster)
    return Qr(e.poster, e.ownerDocument);
  const r = e.cloneNode(!1);
  r.crossOrigin = "anonymous", e.currentSrc && e.currentSrc !== e.src && (r.src = e.currentSrc);
  const n = r.ownerDocument;
  if (n) {
    let i = !0;
    if (await Mn(r, { onError: () => i = !1, onWarn: t.log.warn }), !i)
      return e.poster ? Qr(e.poster, e.ownerDocument) : r;
    r.currentTime = e.currentTime, await new Promise((a) => {
      r.addEventListener("seeked", a, { once: !0 });
    });
    const s = n.createElement("canvas");
    s.width = e.offsetWidth, s.height = e.offsetHeight;
    try {
      const a = s.getContext("2d");
      a && a.drawImage(r, 0, 0, s.width, s.height);
    } catch (a) {
      return t.log.warn("Failed to clone video", a), e.poster ? Qr(e.poster, e.ownerDocument) : r;
    }
    return du(s, t);
  }
  return r;
}
function mh(e, t) {
  return jp(e) ? du(e, t) : Zp(e) ? ph(e, t) : nn(e) ? hh(e) : Ti(e) ? fh(e, t) : e.cloneNode(!1);
}
function gh(e) {
  let t = e.sandbox;
  if (!t) {
    const { ownerDocument: r } = e;
    try {
      r && (t = r.createElement("iframe"), t.id = `__SANDBOX__${lu()}`, t.width = "0", t.height = "0", t.style.visibility = "hidden", t.style.position = "fixed", r.body.appendChild(t), t.srcdoc = '<!DOCTYPE html><meta charset="UTF-8"><title></title><body>', e.sandbox = t);
    } catch (n) {
      e.log.warn("Failed to getSandBox", n);
    }
  }
  return t;
}
const yh = [
  "width",
  "height",
  "-webkit-text-fill-color"
], bh = [
  "stroke",
  "fill"
];
function pu(e, t, r) {
  const { defaultComputedStyles: n } = r, i = e.nodeName.toLowerCase(), s = Ln(e) && i !== "svg", a = s ? bh.map((f) => [f, e.getAttribute(f)]).filter(([, f]) => f !== null) : [], c = [
    s && "svg",
    i,
    a.map((f, y) => `${f}=${y}`).join(","),
    t
  ].filter(Boolean).join(":");
  if (n.has(c))
    return n.get(c);
  const l = gh(r), d = l == null ? void 0 : l.contentWindow;
  if (!d)
    return /* @__PURE__ */ new Map();
  const o = d == null ? void 0 : d.document;
  let h, p;
  s ? (h = o.createElementNS(_i, "svg"), p = h.ownerDocument.createElementNS(h.namespaceURI, i), a.forEach(([f, y]) => {
    p.setAttributeNS(null, f, y);
  }), h.appendChild(p)) : h = p = o.createElement(i), p.textContent = " ", o.body.appendChild(h);
  const u = d.getComputedStyle(p, t), m = /* @__PURE__ */ new Map();
  for (let f = u.length, y = 0; y < f; y++) {
    const E = u.item(y);
    yh.includes(E) || m.set(E, u.getPropertyValue(E));
  }
  return o.body.removeChild(h), n.set(c, m), m;
}
function hu(e, t, r) {
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
function vh(e, t, r, n) {
  var h, p, u, m;
  const { ownerWindow: i, includeStyleProperties: s, currentParentNodeStyle: a } = n, c = t.style, l = i.getComputedStyle(e), d = pu(e, null, n);
  a == null || a.forEach((f, y) => {
    d.delete(y);
  });
  const o = hu(l, d, s);
  o.delete("transition-property"), o.delete("all"), o.delete("d"), o.delete("content"), r && (o.delete("position"), o.delete("margin-top"), o.delete("margin-right"), o.delete("margin-bottom"), o.delete("margin-left"), o.delete("margin-block-start"), o.delete("margin-block-end"), o.delete("margin-inline-start"), o.delete("margin-inline-end"), o.set("box-sizing", ["border-box", ""])), ((h = o.get("background-clip")) == null ? void 0 : h[0]) === "text" && t.classList.add("______background-clip--text"), su && (o.has("font-kerning") || o.set("font-kerning", ["normal", ""]), (((p = o.get("overflow-x")) == null ? void 0 : p[0]) === "hidden" || ((u = o.get("overflow-y")) == null ? void 0 : u[0]) === "hidden") && ((m = o.get("text-overflow")) == null ? void 0 : m[0]) === "ellipsis" && e.scrollWidth === e.clientWidth && o.set("text-overflow", ["clip", ""]));
  for (let f = c.length, y = 0; y < f; y++)
    c.removeProperty(c.item(y));
  return o.forEach(([f, y], E) => {
    c.setProperty(E, f, y);
  }), o;
}
function kh(e, t) {
  (Yp(e) || Vp(e) || Kp(e)) && t.setAttribute("value", e.value);
}
const wh = [
  "::before",
  "::after"
  // '::placeholder', TODO
], xh = [
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
function Sh(e, t, r, n, i) {
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
    const u = [lu()], m = pu(e, o, n);
    l == null || l.forEach((T, w) => {
      m.delete(w);
    });
    const f = hu(h, m, n.includeStyleProperties);
    f.delete("content"), f.delete("-webkit-locale"), ((b = f.get("background-clip")) == null ? void 0 : b[0]) === "text" && t.classList.add("______background-clip--text");
    const y = [
      `content: '${p}';`
    ];
    if (f.forEach(([T, w], k) => {
      y.push(`${k}: ${T}${w ? " !important" : ""};`);
    }), y.length === 1)
      return;
    try {
      t.className = [t.className, ...u].join(" ");
    } catch (T) {
      n.log.warn("Failed to copyPseudoClass", T);
      return;
    }
    const E = y.join(`
  `);
    let v = c.get(E);
    v || (v = [], c.set(E, v)), v.push(`.${u[0]}${o}`);
  }
  wh.forEach(d), r && xh.forEach(d);
}
const Ya = /* @__PURE__ */ new Set([
  "symbol"
  // test/fixtures/svg.symbol.html
]);
async function Va(e, t, r, n, i) {
  if (Vt(r) && (Gp(r) || Xp(r)) || n.filter && !n.filter(r))
    return;
  Ya.has(t.nodeName) || Ya.has(r.nodeName) ? n.currentParentNodeStyle = void 0 : n.currentParentNodeStyle = n.currentNodeStyle;
  const s = await Uo(r, n, !1, i);
  n.isEnable("restoreScrollPosition") && Eh(e, s), t.appendChild(s);
}
async function Ga(e, t, r, n) {
  var s;
  let i = e.firstChild;
  Vt(e) && e.shadowRoot && (i = (s = e.shadowRoot) == null ? void 0 : s.firstChild, r.shadowRoots.push(e.shadowRoot));
  for (let a = i; a; a = a.nextSibling)
    if (!Wp(a))
      if (Vt(a) && Jp(a) && typeof a.assignedNodes == "function") {
        const c = a.assignedNodes();
        for (let l = 0; l < c.length; l++)
          await Va(e, t, c[l], r, n);
      } else
        await Va(e, t, a, r, n);
}
function Eh(e, t) {
  if (!Cn(e) || !Cn(t))
    return;
  const { scrollTop: r, scrollLeft: n } = e;
  if (!r && !n)
    return;
  const { transform: i } = t.style, s = new DOMMatrix(i), { a, b: c, c: l, d } = s;
  s.a = 1, s.b = 0, s.c = 0, s.d = 1, s.translateSelf(-n, -r), s.a = a, s.b = c, s.c = l, s.d = d, t.style.transform = s.toString();
}
function Ch(e, t) {
  const { backgroundColor: r, width: n, height: i, style: s } = t, a = e.style;
  if (r && a.setProperty("background-color", r, "important"), n && a.setProperty("width", `${n}px`, "important"), i && a.setProperty("height", `${i}px`, "important"), s)
    for (const c in s) a[c] = s[c];
}
const Mh = /^[\w-:]+$/;
async function Uo(e, t, r = !1, n) {
  var d, o, h, p;
  const { ownerDocument: i, ownerWindow: s, fontFamilies: a, onCloneEachNode: c } = t;
  if (i && Hp(e))
    return n && /\S/.test(e.data) && n(e.data), i.createTextNode(e.data);
  if (i && s && Vt(e) && (Cn(e) || Ln(e))) {
    const u = await mh(e, t);
    if (t.isEnable("removeAbnormalAttributes")) {
      const b = u.getAttributeNames();
      for (let T = b.length, w = 0; w < T; w++) {
        const k = b[w];
        Mh.test(k) || u.removeAttribute(k);
      }
    }
    const m = t.currentNodeStyle = vh(e, u, r, t);
    r && Ch(u, t);
    let f = !1;
    if (t.isEnable("copyScrollbar")) {
      const b = [
        (d = m.get("overflow-x")) == null ? void 0 : d[0],
        (o = m.get("overflow-y")) == null ? void 0 : o[0]
      ];
      f = b.includes("scroll") || (b.includes("auto") || b.includes("overlay")) && (e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth);
    }
    const y = (h = m.get("text-transform")) == null ? void 0 : h[0], E = cu((p = m.get("font-family")) == null ? void 0 : p[0]), v = E ? (b) => {
      y === "uppercase" ? b = b.toUpperCase() : y === "lowercase" ? b = b.toLowerCase() : y === "capitalize" && (b = b[0].toUpperCase() + b.substring(1)), E.forEach((T) => {
        let w = a.get(T);
        w || a.set(T, w = /* @__PURE__ */ new Set()), b.split("").forEach((k) => w.add(k));
      });
    } : void 0;
    return Sh(
      e,
      u,
      f,
      t,
      v
    ), kh(e, u), Ti(e) || await Ga(
      e,
      u,
      t,
      v
    ), await (c == null ? void 0 : c(u)), u;
  }
  const l = e.cloneNode(!1);
  return await Ga(e, l, t), await (c == null ? void 0 : c(l)), l;
}
function Rh(e) {
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
function Th(e) {
  const { url: t, timeout: r, responseType: n, ...i } = e, s = new AbortController(), a = r ? setTimeout(() => s.abort(), r) : void 0;
  return fetch(t, { signal: s.signal, ...i }).then((c) => {
    if (!c.ok)
      throw new Error("Failed fetch, not 2xx response", { cause: c });
    switch (n) {
      case "arrayBuffer":
        return c.arrayBuffer();
      case "dataUrl":
        return c.blob().then(ih);
      case "text":
      default:
        return c.text();
    }
  }).finally(() => clearTimeout(a));
}
function Rn(e, t) {
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
    fontFamilies: y
  } = e;
  n === "image" && (gi || Fo) && e.drawImageCount++;
  let E = d.get(r);
  if (!E) {
    p && p instanceof RegExp && p.test(a) && (a += (/\?/.test(a) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
    const v = n.startsWith("font") && m && m.minify, b = /* @__PURE__ */ new Set();
    v && n.split(";")[1].split(",").forEach((R) => {
      y.has(R) && y.get(R).forEach((I) => b.add(I));
    });
    const T = v && b.size, w = {
      url: a,
      timeout: c,
      responseType: T ? "arrayBuffer" : i,
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
        const k = await o(r);
        if (k)
          return k;
      }
      return !gi && r.startsWith("http") && f.length ? new Promise((k, R) => {
        f[d.size & f.length - 1].postMessage({ rawUrl: r, ...w }), E.resolve = k, E.reject = R;
      }) : Th(w);
    })().catch((k) => {
      if (d.delete(r), n === "image" && u)
        return e.log.warn("Failed to fetch image base64, trying to use placeholder image", a), typeof u == "string" ? u : u(s);
      throw k;
    }), d.set(r, E);
  }
  return E.response;
}
async function fu(e, t, r, n) {
  if (!mu(e))
    return e;
  for (const [i, s] of Ah(e, t))
    try {
      const a = await Rn(
        r,
        {
          url: s,
          requestType: n ? "image" : "text",
          responseType: "dataUrl"
        }
      );
      e = e.replace(_h(i), `$1${a}$3`);
    } catch (a) {
      r.log.warn("Failed to fetch css data url", i, a);
    }
  return e;
}
function mu(e) {
  return /url\((['"]?)([^'"]+?)\1\)/.test(e);
}
const gu = /url\((['"]?)([^'"]+?)\1\)/g;
function Ah(e, t) {
  const r = [];
  return e.replace(gu, (n, i, s) => (r.push([s, au(s, t)]), n)), r.filter(([n]) => !Mo(n));
}
function _h(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
const Lh = [
  "background-image",
  "border-image-source",
  "-webkit-border-image",
  "-webkit-mask-image",
  "list-style-image"
];
function Ih(e, t) {
  return Lh.map((r) => {
    const n = e.getPropertyValue(r);
    return !n || n === "none" ? null : ((gi || Fo) && t.drawImageCount++, fu(n, null, t, !0).then((i) => {
      !i || n === i || e.setProperty(
        r,
        i,
        e.getPropertyPriority(r)
      );
    }));
  }).filter(Boolean);
}
function Oh(e, t) {
  if (nn(e)) {
    const r = e.currentSrc || e.src;
    if (!Mo(r))
      return [
        Rn(t, {
          url: r,
          imageDom: e,
          requestType: "image",
          responseType: "dataUrl"
        }).then((n) => {
          n && (e.srcset = "", e.dataset.originalSrc = r, e.src = n || "");
        })
      ];
    (gi || Fo) && t.drawImageCount++;
  } else if (Ln(e) && !Mo(e.href.baseVal)) {
    const r = e.href.baseVal;
    return [
      Rn(t, {
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
function Nh(e, t) {
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
        Rn(t, {
          url: s,
          responseType: "text"
        }).then((d) => {
          n == null || n.insertAdjacentHTML("beforeend", d);
        })
      ];
  }
  return [];
}
function yu(e, t) {
  const { tasks: r } = t;
  Vt(e) && ((nn(e) || ou(e)) && r.push(...Oh(e, t)), qp(e) && r.push(...Nh(e, t))), Cn(e) && r.push(...Ih(e.style, t)), e.childNodes.forEach((n) => {
    yu(n, t);
  });
}
async function Ph(e, t) {
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
      const l = Ka(c.cssText, t);
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
          if (Up(m)) {
            const f = m.href;
            let y = "";
            try {
              y = await Rn(t, {
                url: f,
                requestType: "text",
                responseType: "text"
              });
            } catch (v) {
              t.log.warn(`Error fetch remote css import from ${f}`, v);
            }
            const E = y.replace(
              gu,
              (v, b, T) => v.replace(T, au(T, f))
            );
            for (const v of Dh(E))
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
        Ro(u.cssRules, p);
      }), p.filter((u) => {
        var m;
        return Fp(u) && mu(u.style.getPropertyValue("src")) && ((m = cu(u.style.getPropertyValue("font-family"))) == null ? void 0 : m.some((f) => i.has(f)));
      }).forEach((u) => {
        const m = u, f = s.get(m.cssText);
        f ? n.appendChild(r.createTextNode(`${f}
`)) : a.push(
          fu(
            m.cssText,
            m.parentStyleSheet ? m.parentStyleSheet.href : null,
            t
          ).then((y) => {
            y = Ka(y, t), s.set(m.cssText, y), n.appendChild(r.createTextNode(`${y}
`));
          })
        );
      });
    }
}
const zh = /(\/\*[\s\S]*?\*\/)/g, Xa = /((@.*?keyframes [\s\S]*?){([\s\S]*?}\s*?)})/gi;
function Dh(e) {
  if (e == null)
    return [];
  const t = [];
  let r = e.replace(zh, "");
  for (; ; ) {
    const s = Xa.exec(r);
    if (!s)
      break;
    t.push(s[0]);
  }
  r = r.replace(Xa, "");
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
const $h = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, Fh = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function Ka(e, t) {
  const { font: r } = t, n = r ? r == null ? void 0 : r.preferredFormat : void 0;
  return n ? e.replace(Fh, (i) => {
    for (; ; ) {
      const [s, , a] = $h.exec(i) || [];
      if (!a)
        return "";
      if (a === n)
        return `src: ${s};`;
    }
  }) : e;
}
function Ro(e, t = []) {
  for (const r of Array.from(e))
    Bp(r) ? t.push(...Ro(r.cssRules)) : "cssRules" in r ? Ro(r.cssRules, t) : t.push(r);
  return t;
}
const Uh = /\bx?link:?href\s*=\s*["'](?!data:)[^"']+["']/i;
function Bh(e) {
  return Uh.test(e.innerHTML);
}
async function qh(e, t) {
  const r = await Li(e, t);
  if (Vt(r.node) && Ln(r.node) && !Bh(r.node))
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
  const f = await Uo(r.node, r, !0);
  if (a && n) {
    let T = "";
    l.forEach((w, k) => {
      T += `${w.join(`,
`)} {
  ${k}
}
`;
    }), a.appendChild(n.createTextNode(T));
  }
  i.timeEnd("clone node"), await (p == null ? void 0 : p(f)), d !== !1 && Vt(f) && (i.time("embed web font"), await Ph(f, r), i.timeEnd("embed web font")), i.time("embed node"), yu(f, r);
  const y = s.length;
  let E = 0;
  const v = async () => {
    for (; ; ) {
      const T = s.pop();
      if (!T)
        break;
      try {
        await T;
      } catch (w) {
        r.log.warn("Failed to run task", w);
      }
      o == null || o(++E, y);
    }
  };
  o == null || o(E, y), await Promise.all([...Array.from({ length: 4 })].map(v)), i.timeEnd("embed node"), await (u == null ? void 0 : u(f));
  const b = Wh(f, r);
  return c && b.insertBefore(c, b.children[0]), a && b.insertBefore(a, b.children[0]), h && Rh(r), await (m == null ? void 0 : m(b)), b;
}
function Wh(e, t) {
  const { width: r, height: n } = t, i = th(r, n, e.ownerDocument), s = i.ownerDocument.createElementNS(i.namespaceURI, "foreignObject");
  return s.setAttributeNS(null, "x", "0%"), s.setAttributeNS(null, "y", "0%"), s.setAttributeNS(null, "width", "100%"), s.setAttributeNS(null, "height", "100%"), s.append(e), i.appendChild(s), i;
}
async function Hh(e, t) {
  var a;
  const r = await Li(e, t), n = await qh(r), i = rh(n, r.isEnable("removeControlCharacter"));
  r.autoDestruct || (r.svgStyleElement = uu(r.ownerDocument), r.svgDefsElement = (a = r.ownerDocument) == null ? void 0 : a.createElementNS(_i, "defs"), r.svgStyles.clear());
  const s = Qr(i, n.ownerDocument);
  return await uh(s, r);
}
async function jh(e, t) {
  const r = await Li(e, t), { log: n, quality: i, type: s, dpi: a } = r, c = await Hh(r);
  n.time("canvas to data url");
  let l = c.toDataURL(s, i);
  if (["image/png", "image/jpeg"].includes(s) && a && zp && Dp) {
    const [d, o] = l.split(",");
    let h = 0, p = !1;
    if (s === "image/png") {
      const b = Np(o);
      b >= 0 ? (h = Math.ceil((b + 28) / 3) * 4, p = !0) : h = 33 / 3 * 4;
    } else s === "image/jpeg" && (h = 18 / 3 * 4);
    const u = o.substring(0, h), m = o.substring(h), f = window.atob(u), y = new Uint8Array(f.length);
    for (let b = 0; b < y.length; b++)
      y[b] = f.charCodeAt(b);
    const E = s === "image/png" ? _p(y, a, p) : Mp(y, a), v = window.btoa(String.fromCharCode(...E));
    l = [d, ",", v, m].join("");
  }
  return n.timeEnd("canvas to data url"), l;
}
async function Yh(e, t) {
  return jh(
    await Li(e, { ...t, type: "image/png" })
  );
}
const Vh = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", Gh = 8e3, Xh = 16384, Ja = 4096, Kh = 16e6, Jh = 500, Zh = 1e4, us = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z4kwAAAAASUVORK5CYII=", bu = 600, Qh = 1200, ef = 24, tf = 1024, Rt = 32, rf = 4, vu = 400, nf = 0.985, sf = 250;
function ku(e, t) {
  if (!e || e.startsWith("data:") || e.startsWith("blob:")) return !1;
  try {
    return new URL(e, t).origin !== t;
  } catch {
    return !1;
  }
}
function of(e) {
  const t = e;
  if (!t || t.tagName !== "IMG") return !1;
  const r = t.currentSrc || t.src || "";
  return ku(r, location.origin);
}
function af(e) {
  const t = e;
  if (!t || t.nodeType !== 1) return !1;
  const r = t.tagName;
  if (r === "SCRIPT" || r === "STYLE" || r === "NOSCRIPT" || r === "TEMPLATE" || r === "IFRAME" && ku(t.src || "", location.origin)) return !0;
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
function ds(e) {
  try {
    console.warn(e);
  } catch {
  }
}
function Za(e) {
  return !e || e === "transparent" || e === "rgba(0, 0, 0, 0)";
}
function lf(e, t, r = 1) {
  try {
    const n = e.getBoundingClientRect(), i = Math.max(1, Math.ceil(Math.max(e.scrollWidth, e.clientWidth, n.width))), s = Math.max(1, Math.ceil(Math.max(e.scrollHeight, e.clientHeight, n.height))), a = Math.max(0.1, r), c = Math.min(Ja / i, Ja / s), l = Math.min(a, c, Math.sqrt(Kh / (i * s))), d = document.createElement("canvas");
    d.width = Math.max(1, Math.floor(i * l)), d.height = Math.max(1, Math.floor(s * l));
    const o = d.getContext("2d");
    if (!o) return { dataUrl: us, scale: 1 };
    o.scale(l, l), o.fillStyle = "#ffffff", o.fillRect(0, 0, i, s);
    const h = Date.now() + Jh;
    let p = 0;
    const u = () => p >= Zh || Date.now() >= h, m = (y, E = !1) => {
      var k;
      if (u() || (p++, !E && t && !t(y))) return;
      const v = getComputedStyle(y);
      if (v.display === "none" || v.visibility === "hidden" || Number(v.opacity) === 0) return;
      const b = y.getBoundingClientRect(), T = b.left - n.left, w = b.top - n.top;
      if (b.width > 0 && b.height > 0) {
        Za(v.backgroundColor) || (o.fillStyle = v.backgroundColor, o.fillRect(T, w, b.width, b.height));
        const R = parseFloat(v.borderTopWidth);
        R > 0 && v.borderTopStyle !== "none" && !Za(v.borderTopColor) && (o.strokeStyle = v.borderTopColor, o.lineWidth = R, o.strokeRect(T, w, b.width, b.height)), y.tagName === "IMG" && (o.fillStyle = "#f1f5f9", o.fillRect(T, w, b.width, b.height), o.strokeStyle = "#cbd5e1", o.lineWidth = 1, o.strokeRect(T, w, b.width, b.height));
      }
      for (const R of Array.from(y.childNodes)) {
        if (u()) break;
        if (R instanceof HTMLElement) {
          m(R);
          continue;
        }
        if (!(R.nodeType !== Node.TEXT_NODE || !((k = R.textContent) != null && k.trim())))
          try {
            const I = document.createRange();
            I.selectNodeContents(R);
            const $ = I.getBoundingClientRect();
            if ($.width <= 0 || $.height <= 0) continue;
            o.save(), o.beginPath(), o.rect($.left - n.left, $.top - n.top, $.width, $.height), o.clip(), o.fillStyle = v.color, o.font = `${v.fontStyle} ${v.fontWeight} ${v.fontSize} ${v.fontFamily}`, o.textBaseline = "top", o.fillText(R.textContent.trim(), $.left - n.left, $.top - n.top), o.restore();
          } catch {
          }
      }
    };
    m(e, !0);
    const f = d.toDataURL("image/png");
    return f.startsWith("data:image/png") ? { dataUrl: f, scale: l } : { dataUrl: us, scale: 1 };
  } catch {
    return { dataUrl: us, scale: 1 };
  }
}
function cf() {
  return new Promise((e) => {
    typeof requestAnimationFrame == "function" ? requestAnimationFrame(() => e()) : setTimeout(e, 16);
  });
}
function ps(e, t) {
  return Promise.race([
    Promise.resolve(e).then(() => {
    }, () => {
    }),
    new Promise((r) => setTimeout(r, Math.max(0, t)))
  ]);
}
function uf(e) {
  if (!e || typeof e.querySelectorAll != "function") return [];
  const t = typeof window < "u" && window.innerWidth || 0, r = typeof window < "u" && window.innerHeight || 0, n = [];
  let i;
  try {
    i = e.querySelectorAll("img");
  } catch {
    return [];
  }
  for (let s = 0; s < i.length && n.length < ef; s++) {
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
async function Qa(e, t = bu) {
  if (typeof document > "u") return;
  const r = Date.now() + Math.max(0, t), n = () => Math.max(0, r - Date.now());
  try {
    const i = document.fonts;
    i && i.status !== "loaded" && i.ready && typeof i.ready.then == "function" && await ps(i.ready, n());
    const s = uf(e);
    s.length && await ps(
      Promise.allSettled(s.map((a) => typeof a.decode == "function" ? a.decode() : Promise.resolve())),
      n()
    ), await ps(cf(), Math.min(n(), 50));
  } catch {
  }
}
function wu(e, t) {
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
async function df(e) {
  if (typeof document > "u") return null;
  const t = await wu(e, vu);
  if (!t) return null;
  let r;
  try {
    r = document.createElement("canvas");
  } catch {
    return null;
  }
  r.width = Rt, r.height = Rt;
  const n = r.getContext("2d");
  if (!n) return null;
  try {
    n.drawImage(t, 0, 0, Rt, Rt);
    const { data: i } = n.getImageData(0, 0, Rt, Rt);
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
async function hs(e) {
  if (!e || !e.startsWith("data:image/png")) return !0;
  const t = e.indexOf(","), r = t >= 0 ? e.slice(t + 1) : "";
  if (Math.floor(r.length * 3 / 4) <= tf) return !0;
  try {
    const i = await df(e);
    if (i !== null && i <= rf) return !0;
  } catch {
  }
  return !1;
}
async function pf(e) {
  if (typeof document > "u") return null;
  const t = await wu(e, vu);
  if (!t) return null;
  let r;
  try {
    r = document.createElement("canvas");
  } catch {
    return null;
  }
  r.width = Rt, r.height = Rt;
  const n = r.getContext("2d");
  if (!n) return null;
  try {
    n.drawImage(t, 0, 0, Rt, Rt);
    const { data: i } = n.getImageData(0, 0, Rt, Rt);
    let s = 0, a = 0;
    for (let c = 0; c < i.length; c += 4) {
      const l = i[c + 3] / 255, d = i[c] * l + 255 * (1 - l), o = i[c + 1] * l + 255 * (1 - l), h = i[c + 2] * l + 255 * (1 - l);
      0.299 * d + 0.587 * o + 0.114 * h >= sf && a++, s++;
    }
    return s ? a / s : null;
  } catch {
    return null;
  }
}
async function hf(e, t = {}) {
  if ((t.skippedImages ?? 0) > 0) return !0;
  try {
    const r = await pf(e);
    if (r !== null && r >= nf) return !0;
  } catch {
  }
  return !1;
}
const ff = [
  "material icons",
  "material symbols",
  "fontawesome",
  "font awesome",
  "icomoon",
  "glyphicons",
  "ionicons"
], mf = /* @__PURE__ */ new Set([
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
function gf(e) {
  return ((e || "").split(",")[0] || "").trim().replace(/^['"]+|['"]+$/g, "").toLowerCase();
}
function yf(e) {
  const t = (e || "").toLowerCase();
  return ff.some((r) => t.includes(r));
}
const bf = /^[a-z0-9]+(?:[_-][a-z0-9]+)+$/i;
function vf(e) {
  const t = (e || "").trim();
  return !t || t.length > 40 || /\s/.test(t) ? !1 : bf.test(t);
}
function kf(e) {
  const t = (e.text || "").trim();
  if (!t) return !1;
  const r = e.fontFamily || "", n = gf(r);
  return e.embeddedFamilies && n && e.embeddedFamilies.has(n) ? !1 : !!(yf(r) || n && !mf.has(n) && t.includes("_") && vf(t));
}
function wf(e, t) {
  var r;
  try {
    if (!e || e.nodeType !== 1) return;
    const n = e;
    if (n.childElementCount > 0) return;
    const i = n.textContent || "";
    if (!i.trim()) return;
    const s = ((r = n.style) == null ? void 0 : r.fontFamily) || "";
    if (!s) return;
    kf({ fontFamily: s, text: i, embeddedFamilies: t }) && (n.textContent = "");
  } catch {
  }
}
const pi = { cssText: "", embeddedFamilies: /* @__PURE__ */ new Set() }, xf = 3e3, Sf = 4e3, el = 24, tl = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
async function Ef(e, t = Sf) {
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
function Cf(e) {
  var n, i, s;
  const t = [];
  let r;
  try {
    r = e.styleSheets;
  } catch {
    return t;
  }
  for (let a = 0; a < r.length && t.length < el; a++) {
    let c = null;
    try {
      c = r[a].cssRules;
    } catch {
      continue;
    }
    if (c)
      for (let l = 0; l < c.length && t.length < el; l++) {
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
function Mf(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Rf(e, t, r) {
  const n = new RegExp(`url\\(\\s*(['"]?)${Mf(t)}\\1\\s*\\)`, "g");
  return e.replace(n, `url("${r}")`);
}
async function Tf(e = {}) {
  const t = /* @__PURE__ */ new Set(), r = e.doc ?? (typeof document < "u" ? document : null), n = e.faces ?? (r ? Cf(r) : []);
  if (!n.length) return { cssText: "", embeddedFamilies: t };
  const i = e.baseUrl ?? (typeof location < "u" ? location.href : ""), s = e.fetchAsDataUrl ?? ((c) => Ef(c)), a = [];
  for (const c of n) {
    const l = [];
    tl.lastIndex = 0;
    let d;
    for (; (d = tl.exec(c.src)) !== null; ) {
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
      m && (o = Rf(o, u, m), h = !0);
    h && (a.push(o), t.add(c.family.toLowerCase()));
  }
  return { cssText: a.join(`
`), embeddedFamilies: t };
}
async function Af() {
  try {
    return await Promise.race([
      Tf({}).catch(() => pi),
      new Promise((e) => setTimeout(() => e(pi), xf))
    ]);
  } catch {
    return pi;
  }
}
function _f(e, t) {
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
async function Lf(e, t = {}) {
  return (await If(e, t)).dataUrl;
}
async function If(e, t = {}) {
  let r = 0;
  const n = t.filter, i = typeof window < "u" && Number(window.devicePixelRatio) || 1, s = t.skipFonts ? 1 : Math.min(Math.max(i, 1), 2), a = t.pixelRatio ?? s, c = t.skipFonts ? pi : await Af(), l = t.width && t.height ? { width: t.width, height: t.height } : void 0, d = async () => {
    r = 0;
    const o = !t.skipFonts && c.cssText ? { cssText: c.cssText } : !1, h = await _f(Yh(e, {
      scale: a,
      ...l ?? {},
      font: o,
      onCloneEachNode: (p) => wf(p, c.embeddedFamilies),
      maximumCanvasSize: Xh,
      fetch: { placeholderImage: Vh },
      filter: (p) => n && !n(p) || af(p) ? !1 : of(p) ? (r++, !1) : !0
    }), Gh);
    if (!h.startsWith("data:image/png")) throw new Error("capture returned a non-PNG result");
    return h;
  };
  await Qa(e, bu);
  try {
    let o = await d(), h = await hs(o);
    if (h) {
      await Qa(e, Qh);
      try {
        const u = await d();
        await hs(u) || (o = u, h = !1);
      } catch {
      }
    }
    r && ds(`[Klavity] capture: omitted ${r} cross-origin image(s) the page's CSP/CORS blocks — captured the rest`), h && ds("[Klavity] capture: DOM render came back blank after retry — caller may retake with the sharp path");
    const p = h ? !1 : await hf(o, { skippedImages: r });
    return { dataUrl: o, scale: a, quality: "rendered", blank: h, partial: p, skippedImages: r };
  } catch (o) {
    const h = o instanceof Error ? o.message : String(o);
    ds(`[Klavity] capture: renderer unavailable (${h}); using fetch-free fallback`);
    const p = lf(e, n, a), u = await hs(p.dataUrl);
    return { ...p, quality: "wireframe", blank: u, partial: !1, skippedImages: 0 };
  }
}
const Of = {
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
function Nf(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function le(e, t = {}) {
  const r = Of[e];
  if (!r)
    return console.warn("[Klavity] unknown icon: " + e), "";
  const n = t.size ?? 18, i = t.class ? `icon ${t.class}` : "icon", s = t.label ? 'role="img"' : 'aria-hidden="true"', a = t.label ? `<title>${Nf(t.label)}</title>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" class="${i}" width="${n}" height="${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" ${s}>${a}${r}</svg>`;
}
const xu = "https://klavity.in", Hr = {
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
function fs(e, t, r) {
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
function Xn(e, t) {
  try {
    if (typeof e.measureText != "function") return 0;
    const r = e.measureText(t), n = r && r.width;
    return typeof n == "number" && Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}
function Pf(e) {
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
function zf(e) {
  const t = Pf(e);
  if (!t) return 0;
  const [r, n, i] = t.map((s) => s / 255);
  return 0.2126 * r + 0.7152 * n + 0.0722 * i;
}
function ms(e) {
  return zf(e) > 0.55 ? "rgba(17,17,17,0.92)" : "rgba(255,255,255,0.92)";
}
class To {
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
    const s = ms(r);
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
      t.lineWidth = n + this.haloPad(n), t.strokeStyle = ms(r.color), t.strokeRect(r.x, r.y, r.w, r.h), t.lineWidth = n, t.strokeStyle = r.color, t.strokeRect(r.x, r.y, r.w, r.h);
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
      t.beginPath(), t.arc(r.x, r.y, n, 0, Math.PI * 2), t.fill(), t.lineWidth = this.haloPad(this.computeLineWidth()), t.strokeStyle = ms(r.color), t.stroke(), t.fillStyle = "#fff", t.font = `bold ${Math.round(n * 1.05)}px sans-serif`, t.textAlign = "center", t.textBaseline = "middle", t.fillText(String(r.n), r.x, r.y), t.textAlign = "start", t.textBaseline = "alphabetic";
    } else if (r.type === "text") {
      const { x: n, y: i, size: s, maxW: a } = this.textAnchor(r, t);
      t.font = `bold ${s}px sans-serif`, t.textBaseline = "top";
      const c = fs((o) => Xn(t, o), r.text, a), l = s * 1.25, d = r.outline ?? "none";
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
        const y = Math.min(o + c, a), E = Math.min(h + c, s);
        for (let v = o; v < y; v++)
          for (let b = h; b < E; b++) {
            const T = (v * s + b) * 4;
            p += d[T], u += d[T + 1], m += d[T + 2], f++;
          }
        f && (t.fillStyle = `rgb(${Math.round(p / f)},${Math.round(u / f)},${Math.round(m / f)})`, t.fillRect(n + h, i + o, E - h, y - o));
      }
  }
  /** KLA-770: the clamped top-left anchor + wrap width for a text shape. The anchor is kept inside the image
   *  (so a dragged label can't be parked off-canvas) and `maxW` is the room from the anchor to the right edge
   *  (so long text wraps rather than spilling past the bounds). Shared by drawShape + textBounds so the
   *  rendered glyphs and the hit-test box always agree. */
  textAnchor(t, r) {
    const n = t.size ?? this.computeFontSize(), i = Math.max(2, n * 0.15), s = Math.max(i, Math.min(t.x, Math.max(i, this.canvas.width - i))), a = Math.max(1, this.canvas.width - s - i), c = n * 1.25;
    let l = 1;
    r && typeof r.measureText == "function" && (r.font = `bold ${n}px sans-serif`, l = Math.max(1, fs((h) => Xn(r, h), t.text, a).length));
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
    const c = fs((p) => Xn(r, p), t.text, a);
    let l = 0;
    for (const p of c) l = Math.max(l, Xn(r, p));
    const d = s * 1.25, o = Math.min(Math.max(s, l), Math.max(1, this.canvas.width - n)), h = Math.min(Math.max(d, c.length * d), Math.max(1, this.canvas.height - i));
    return { x: n, y: i, w: o, h };
  }
  async save() {
    const t = this.canvas.toDataURL("image/png");
    return t.length > 5 * 1024 * 1024 ? this.canvas.toDataURL("image/jpeg", 0.85) : t;
  }
}
function Df(e) {
  if (!Array.isArray(e)) return [];
  const t = [];
  for (const r of e)
    r && r.type === "text" && typeof r.text == "string" && r.text.trim() && t.push(r.text.trim());
  return t;
}
async function $f(e, t, r, n) {
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
          const o = new To(l, e);
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
async function Ff(e, t, r) {
  const n = t.backendUrl ? t : { ...t, backendUrl: xu }, i = {
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
const Uf = 50, Bf = 2e3, qf = 1e3, Wf = 500, rl = /^(?:token|access_token|refresh_token|api[_-]?key|apikey|key|secret|password|passwd|pwd|auth|authorization|session|sid|jwt|code|otp)$/i;
function Kn(e, t) {
  e.push(t), e.length > Uf && e.shift();
}
function Bo(e, t) {
  return e.length <= t ? e : e.slice(0, t) + "…[truncated]";
}
function gs(e) {
  let t = String(e || "");
  try {
    const r = new URL(t, typeof location < "u" ? location.href : "http://localhost");
    let n = !1;
    r.searchParams.forEach((i, s) => {
      rl.test(s) && (r.searchParams.set(s, "REDACTED"), n = !0);
    }), n && (t = r.toString());
  } catch {
    t = t.replace(/([?&])([^=&]+)=([^&]*)/g, (r, n, i, s) => rl.test(i) ? `${n}${i}=REDACTED` : r);
  }
  return Bo(t, qf);
}
function Hf(e) {
  if (typeof e == "string") return e;
  if (e instanceof Error) return e.message;
  try {
    return Bo(JSON.stringify(e), Wf);
  } catch {
    return String(e);
  }
}
function jf(e, t = {}) {
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
function Yf(e, t = {}) {
  if (typeof window > "u") return e;
  const r = window;
  if (r.__klavityCaptureInstalled) return e;
  r.__klavityCaptureInstalled = !0;
  const n = () => t.isContextValid ? t.isContextValid() : !0, i = (l, d, o) => {
    Kn(e.consoleErrors, { message: Bo(d, Bf), stack: o, timestamp: Date.now(), level: l });
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
          n() && i(d, h.map(Hf).join(" "));
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
      return Kn(e.networkFailures, { url: gs(o), status: u.status, method: String(h).toUpperCase(), timestamp: d, durationMs: Date.now() - d }), u;
    } catch (u) {
      throw Kn(e.networkFailures, { url: gs(o), status: 0, method: String(h).toUpperCase(), timestamp: d, durationMs: Date.now() - d }), u;
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
            Kn(e.networkFailures, {
              url: gs(h.url),
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
const Vf = ["light", "dark", "glass", "neon", "custom", "liquid"], Gf = ["hidden", "icon", "full", "custom"], Xf = ["lightbulb", "bug"], Kf = ["full", "reportOnly", "off"], Jf = /^#[0-9a-fA-F]{3,8}$/, Zf = /^[\w \-,'"().]+$/, nl = (e) => typeof e == "object" && e !== null, Jn = (e) => typeof e == "string" && Jf.test(e.trim()) ? e.trim() : void 0, Zn = (e, t) => typeof e == "string" && e.trim() ? e.trim().slice(0, t) : void 0, Qf = (e) => {
  if (typeof e != "string") return;
  const t = e.trim().slice(0, 120);
  return t && Zf.test(t) ? t : void 0;
}, il = {
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
function sl(e) {
  let t = e.replace("#", "");
  t.length === 3 && (t = t.split("").map((a) => a + a).join(""));
  const r = parseInt(t.slice(0, 6), 16), n = r >> 16 & 255, i = r >> 8 & 255, s = r & 255;
  return 0.299 * n + 0.587 * i + 0.114 * s;
}
function Su(e) {
  const t = nl(e) ? e : {}, n = { theme: typeof t.theme == "string" && Vf.includes(t.theme) ? t.theme : "light" }, i = Jn(t.primary), s = Jn(t.secondary), a = Jn(t.background), c = Zn(t.thankYou, 140), l = Qf(t.font);
  i && (n.primary = i), s && (n.secondary = s), a && (n.background = a), l && (n.font = l), c && (n.thankYou = c), typeof t.launcherMode == "string" && Gf.includes(t.launcherMode) && (n.launcherMode = t.launcherMode);
  const d = Zn(t.launcherText, 60);
  d && (n.launcherText = d);
  const o = Jn(t.launcherIconColor);
  o && (n.launcherIconColor = o), typeof t.launcherIcon == "string" && Xf.includes(t.launcherIcon) && (n.launcherIcon = t.launcherIcon), typeof t.rightClickMode == "string" && Kf.includes(t.rightClickMode) && (n.rightClickMode = t.rightClickMode), t.maskNumbers === !0 && (n.maskNumbers = !0), t.reportClarity === !0 ? n.reportClarity = !0 : t.reportClarity === !1 && (n.reportClarity = !1), t.preSubmitNudge === !1 ? n.preSubmitNudge = !1 : t.preSubmitNudge === !0 && (n.preSubmitNudge = !0), t.debug === !0 && (n.debug = !0), t.submitTargetToggle === !1 ? n.submitTargetToggle = !1 : t.submitTargetToggle === !0 && (n.submitTargetToggle = !0);
  const h = Zn(t.projectDisplayName, 60);
  h && (n.projectDisplayName = h);
  const p = nl(t.agency_branding) ? t.agency_branding : {};
  (t.whiteLabel === !0 || p.whiteLabel === !0) && (n.whiteLabel = !0);
  const u = Zn(t.projectId, 200);
  return u && (n.projectId = u), (t.attributionMedium === "extension" || t.attributionMedium === "widget") && (n.attributionMedium = t.attributionMedium), n;
}
function em(e) {
  const t = Su(e), r = t.theme === "custom" ? { ...il.light } : { ...il[t.theme] };
  if (t.theme === "custom" && (t.primary && (r["--kl-accent"] = t.primary), t.secondary && (r["--kl-accent2"] = t.secondary), t.background)) {
    r["--kl-bg"] = t.background;
    const i = sl(t.background) < 140;
    r["--kl-fg"] = i ? "#f4f4f7" : "#1d1d24", r["--kl-muted"] = i ? "rgba(255,255,255,.6)" : "#706560", r["--kl-border"] = i ? "rgba(255,255,255,.16)" : "#e6e6ec", r["--kl-chip"] = i ? "rgba(255,255,255,.08)" : "#f4f4f7", r["--kl-input-bg"] = i ? "rgba(255,255,255,.05)" : "#fafafb";
  }
  return t.font && (r["--kl-font"] = t.font), t.theme === "dark" || t.theme === "neon" || t.theme === "glass" || t.theme === "liquid" || t.theme === "custom" && t.background && sl(t.background) < 140, r["--kl-img-outline"] = "var(--kl-img-outline-val, color-mix(in srgb, var(--kl-fg) 10%, transparent))", r["--kl-glow"] = "radial-gradient(120% 80% at 50% -10%, color-mix(in srgb, var(--kl-accent) 12%, transparent), transparent 60%), radial-gradient(80% 60% at 100% 110%, color-mix(in srgb, var(--kl-accent2) 6%, transparent), transparent 60%)", `:host{${Object.entries(r).map(([i, s]) => `${i}:${s};`).join("")}}`;
}
function tm(e, t = !1, r = !1) {
  if (!e) return "";
  let n = e;
  return n = n.replace(/\s*\b(?:new paragraph|next paragraph)\b\s*/gi, `

`), n = n.replace(/\s*\b(?:new line|next line)\b\s*/gi, `
`), n = n.replace(/\b(?:full stop|period)\b/gi, "."), n = n.replace(/\bquestion mark\b/gi, "?"), n = n.replace(/\b(?:exclamation mark|exclamation point)\b/gi, "!"), n = n.replace(/\bcomma\b/gi, ","), n = n.replace(/\bsemicolon\b/gi, ";"), n = n.replace(/\bcolon\b/gi, ":"), n = n.replace(/\s+([,.:;!?])/g, "$1"), n = n.replace(/([,.:;!?])[^\S\r\n]+/g, "$1 "), n = n.replace(/([,.:;!?])\1+/g, "$1"), n = n.replace(/([,.:;!?])([^\s\d\n,.:;!?])/g, "$1 $2"), n = n.replace(/\b(i)('m|'ve|'ll|'d)?\b/gi, (i, s, a) => "I" + (a ? a.toLowerCase() : "")), n = n.replace(/(^|[.!?\n]\s*)([a-z])/g, (i, s, a) => s + a.toUpperCase()), (r || t) && n.trim() && (n = n.trim(), r && !/[.!?:]$/.test(n) && (n += ".")), n;
}
function Qn(e, t) {
  if (!e) return t;
  if (!t) return e;
  const r = e.trimEnd(), n = t.trimStart();
  return r ? n ? r + " " + n : r : n;
}
function ol(e) {
  if (!e) return "";
  let t = e.trim();
  return t ? (t = tm(t, !0, !0), t = t.replace(/^\s*([a-z])/, (r, n) => n.toUpperCase()), t = t.replace(/([.!?\n]\s*)([a-z])/g, (r, n, i) => n + i.toUpperCase()), /[.!?:]$/.test(t) || (t += "."), t) : "";
}
const ot = class ot {
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
    this._recording || !ot.isSupported() || (this._recording = !0, this._stopping = !1, this._stopFired = !1, this._showedReconnecting = !1, this._consecFailures = 0, this._timer = setTimeout(() => this.stop(), ot.SESSION_MS), this._begin());
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
      if (i && i in ot.TERMINAL_ERRORS) {
        this.onError(i, ot.TERMINAL_ERRORS[i]), this._teardown();
        return;
      }
      i && i !== "no-speech" && (this._consecFailures++, this._showedReconnecting || (this._showedReconnecting = !0, this.onStatus("retrying", "Reconnecting voice…")));
    }, r.onend = () => {
      if (this._recognition = null, this._stopping || !this._recording) {
        this._emitStop();
        return;
      }
      if (this._consecFailures > ot.MAX_CONSEC_FAILURES) {
        this.onError("network", "Voice disconnected — tap Voice to try again"), this._teardown();
        return;
      }
      const n = this._consecFailures === 0 ? ot.BENIGN_RESTART_MS : Math.min(ot.MAX_BACKOFF_MS, ot.BASE_BACKOFF_MS * 2 ** (this._consecFailures - 1));
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
ot.MAX_CONSEC_FAILURES = 6, ot.BASE_BACKOFF_MS = 400, ot.MAX_BACKOFF_MS = 8e3, ot.BENIGN_RESTART_MS = 250, ot.SESSION_MS = 18e4, ot.TERMINAL_ERRORS = {
  "not-allowed": "Microphone access was denied",
  "service-not-allowed": "Microphone access was denied",
  "audio-capture": "No microphone was found"
};
let wn = ot;
function rm() {
  const t = globalThis.MediaRecorder;
  return {
    getUserMedia: (r) => navigator.mediaDevices.getUserMedia(r),
    MediaRecorder: t,
    isTypeSupported: (r) => !!(t && t.isTypeSupported && t.isTypeSupported(r)),
    setTimeout: (r, n) => setTimeout(r, n),
    clearTimeout: (r) => clearTimeout(r)
  };
}
const nm = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
function Eu(e) {
  for (const t of nm)
    if (e.isTypeSupported(t)) return t;
  return null;
}
const Zr = class Zr {
  constructor(t) {
    this.onTranscript = (r) => {
    }, this.onError = (r, n) => {
    }, this.onStatus = (r, n) => {
    }, this.onStop = () => {
    }, this.onUnavailable = () => {
    }, this._recording = !1, this._stream = null, this._recorder = null, this._chunks = [], this._segTimer = null, this._sessTimer = null, this._mime = null, this._firstSegment = !0, this._transcribe = t.transcribe, this._deps = { ...rm(), ...t.deps || {} };
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
    this._stream = t, this._mime = Eu(this._deps);
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
    }, this._sessTimer = this._deps.setTimeout(() => this.stop(), Zr.MAX_SESSION_MS), this._beginSegment();
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
      }, Zr.SEGMENT_MS);
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
Zr.SEGMENT_MS = 2500, Zr.MAX_SESSION_MS = 18e4;
let yi = Zr;
function im() {
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
const Ke = class Ke {
  constructor(t) {
    this.onTranscript = (r) => {
    }, this.onInterim = (r) => {
    }, this.onError = (r, n) => {
    }, this.onStatus = (r, n) => {
    }, this.onStop = () => {
    }, this.onUnavailable = () => {
    }, this._recording = !1, this._stream = null, this._recorder = null, this._ws = null, this._mime = null, this._connected = !1, this._everConnected = !1, this._connectTimer = null, this._sessTimer = null, this._reconnects = 0, this._stopped = !1, this._awaitingFinal = !1, this._graceTimer = null, this._flushFallbackTimer = null, this._torn = !1, this._statusShown = !1, this._stopFired = !1, this._url = t.url, this._deps = { ...im(), ...t.deps || {} };
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
    this._stream = t, this._mime = Eu(this._deps), this._sessTimer = this._deps.setTimeout(() => this.stop(), Ke.MAX_SESSION_MS), this._openSocket();
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
    }, Ke.CONNECT_TIMEOUT_MS), t.onopen = () => {
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
    if (this._reconnects >= Ke.MAX_RECONNECTS) {
      this.onError("network", "Voice disconnected — tap Voice to try again"), this._teardown(!0);
      return;
    }
    this._reconnects++, this._statusShown || (this._statusShown = !0, this.onStatus("retrying", "Reconnecting dictation…"));
    const t = Math.min(Ke.MAX_BACKOFF_MS, Ke.BASE_BACKOFF_MS * 2 ** (this._reconnects - 1));
    this._stopRecorder(), this._deps.setTimeout(() => {
      this._recording && this._openSocket();
    }, t);
  }
  _startRecorder() {
    if (!(!this._recording || !this._ws)) {
      if (this._recorder) {
        try {
          this._recorder.state === "inactive" && this._recorder.start(Ke.TIMESLICE_MS);
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
        this._recorder.start(Ke.TIMESLICE_MS);
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
        this._stopRecorder(), this._flushFallbackTimer = this._deps.setTimeout(a, Ke.STOP_FLUSH_FALLBACK_MS);
      } else
        this._stopRecorder(), a();
      this._graceTimer = this._deps.setTimeout(() => this._finishGrace(), Ke.STOP_GRACE_MS);
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
Ke.MAX_SESSION_MS = 18e4, Ke.TIMESLICE_MS = 150, Ke.CONNECT_TIMEOUT_MS = 4e3, Ke.MAX_RECONNECTS = 3, Ke.BASE_BACKOFF_MS = 500, Ke.MAX_BACKOFF_MS = 4e3, Ke.STOP_GRACE_MS = 2e3, Ke.STOP_FLUSH_FALLBACK_MS = 1200;
let bi = Ke;
function sm(e) {
  return e.hasEndpoint && e.mediaRecorderSupported ? "server" : e.webSpeechSupported ? "webspeech" : "none";
}
function Ge(e) {
  try {
    e && e.parentNode && e.parentNode.removeChild(e);
  } catch {
  }
}
const om = /* @__PURE__ */ new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"]);
function kr(e) {
  const t = [], r = [], n = document.createTreeWalker(e, NodeFilter.SHOW_TEXT, {
    acceptNode(a) {
      let c = a.parentElement;
      for (; c && c !== e; ) {
        if (om.has(c.tagName)) return NodeFilter.FILTER_REJECT;
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
    Ge(a);
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
        for (const o of l) o.parentNode === a && Ge(o);
      }
    }
    for (const { el: a, original: c } of r)
      a.value = c;
  };
}
const Cu = [
  "not working",
  "doesn't work",
  "does not work",
  "doesnt work",
  "broken",
  "pls fix",
  "please fix",
  "fix it",
  "help"
], am = /\b(when i|steps?|click|clicked|clicking|tap|tapped|then|go to|navigate|reload|refresh|press|select|enter)\b/i, lm = /(https?:\/\/|\s\/[a-z0-9]|^\/[a-z0-9])/i, cm = /\b(expected?|should|instead|supposed to|meant to|i wanted)\b/i, um = /* @__PURE__ */ new Set([
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
]), dm = { needs: "Needs detail", good: "Good", great: "Great" };
function pm(e) {
  let t = e;
  for (const r of Cu) t = t.split(r).join(" ");
  return t;
}
function hm(e) {
  const t = e.split(/[^a-z0-9]+/i).filter(Boolean);
  let r = 0;
  for (const n of t)
    n.length < 3 || um.has(n) || r++;
  return r;
}
function Mu(e) {
  const t = (e || "").trim(), r = t.toLowerCase(), n = pm(r), i = hm(n), s = t.length > 0 && Cu.some((p) => r.includes(p)) && i < 3, a = i >= 3 && t.length >= 12, c = cm.test(r), l = am.test(r) || lm.test(t), d = { problem: a, expected: c, repro: l }, o = (a ? 1 : 0) + (c ? 1 : 0) + (l ? 1 : 0), h = o >= 3 ? "great" : o === 2 ? "good" : "needs";
  return { score: o, coverage: d, level: h, label: dm[h], vague: s };
}
function fm(e) {
  const t = (e || "").trim();
  return t.length <= 15 ? !1 : Mu(t).level !== "great";
}
const mm = [
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
function gm(e) {
  const t = (e || "").toLowerCase();
  return t ? mm.some((r) => t.includes(r)) : !1;
}
function Ru(e) {
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
function Tu(e, t) {
  let r;
  try {
    r = new URL(e);
  } catch {
    return e;
  }
  const n = [
    ["utm_source", Ru(t.source)],
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
async function ym() {
  try {
    const e = navigator.permissions;
    if (!(e != null && e.query)) return !1;
    const t = await e.query({ name: "display-capture" });
    return (t == null ? void 0 : t.state) === "granted";
  } catch {
    return !1;
  }
}
function bm() {
  try {
    return location.host || location.hostname || "this site";
  } catch {
    return "this site";
  }
}
let vm = 0;
function km(e) {
  const t = e.host || bm(), r = "kl-shp-" + ++vm, n = document.createElement("div");
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
  const y = document.createElement("span");
  y.className = "kl-shp-rt", y.textContent = "This tab", m.append(f, y), p.append(u, m);
  const E = document.createElement("div");
  E.className = "kl-shp-foot";
  const v = document.createElement("span");
  v.className = "kl-shp-cancel", v.textContent = "Cancel";
  const b = document.createElement("span");
  b.className = "kl-shp-allow", b.textContent = "Allow", E.append(v, b), l.append(d, p, E);
  const T = document.createElement("div");
  T.className = "kl-shp-steer";
  const w = document.createElement("span");
  w.className = "kl-shp-n", w.textContent = "1";
  const k = document.createElement("span");
  return k.textContent = e.steer, T.append(w, k), n.append(i, s, l, T), n;
}
const wm = 1, xm = 6, Sm = 1.08;
function Em(e, t = wm, r = xm) {
  return Number.isFinite(e) ? Math.min(r, Math.max(t, e)) : t;
}
function Cm(e, t = Sm) {
  return e < 0 ? t : 1 / t;
}
function Mm(e) {
  return e ? "transform .1s ease-out" : "transform .34s cubic-bezier(.22,1.24,.32,1)";
}
function Au(e, t) {
  return t > 0 ? e.width / t : 1;
}
function Rm(e, t, r, n, i, s) {
  const a = (e - r.left - s.panX) / n, c = (t - r.top - s.panY) / n;
  return { panX: e - r.left - i * a, panY: t - r.top - i * c };
}
function Tm(e, t, r, n, i, s) {
  const a = Au(t, i) * n, c = (u) => Math.min(i, Math.max(0, u)), l = (u) => Math.min(s, Math.max(0, u)), d = a > 0 ? c((e.left - t.left - r.panX) / a) : 0, o = a > 0 ? c((e.right - t.left - r.panX) / a) : i, h = a > 0 ? l((e.top - t.top - r.panY) / a) : 0, p = a > 0 ? l((e.bottom - t.top - r.panY) / a) : s;
  return { x: d, y: h, w: Math.max(0, o - d), h: Math.max(0, p - h) };
}
function Am(e, t, r, n, i, s) {
  const a = r > 0 ? e / r * i : 0, c = n > 0 ? t / n * s : 0;
  return { ix: Math.min(i, Math.max(0, a)), iy: Math.min(s, Math.max(0, c)) };
}
function _m(e, t, r, n, i, s) {
  const a = Au(n, s) * i, c = (r.left + r.right) / 2, l = (r.top + r.bottom) / 2;
  return { panX: c - n.left - a * e, panY: l - n.top - a * t };
}
function Lm(e) {
  return Tu("https://klavity.in", {
    campaign: "powered-by",
    medium: "annotation-editor",
    source: "snap-widget",
    // utm_content = the customer project id, or (when we don't have one) the embedding host, so we can still
    // see who clicked.
    ref: e || Ru()
  });
}
function Im(e) {
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
function Om(e, t, r) {
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
function Xe(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function al(e) {
  let t = Xe(String(e ?? ""));
  return t = t.replace(/`([^`\n]+)`/g, (r, n) => `<span class="kl-mk">\`</span><code>${n}</code><span class="kl-mk">\`</span>`), t = t.replace(/\*([^*\n]+)\*/g, (r, n) => `<span class="kl-mk">*</span><b>${n}</b><span class="kl-mk">*</span>`), t = t.replace(/_([^_\n]+)_/g, (r, n) => `<span class="kl-mk">_</span><i>${n}</i><span class="kl-mk">_</span>`), t = t.replace(/~([^~\n]+)~/g, (r, n) => `<span class="kl-mk">~</span><s>${n}</s><span class="kl-mk">~</span>`), t = t.replace(/\n/g, "<br>"), t;
}
function ll(e) {
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
function Nm(e) {
  const t = Array.isArray(e.stepsToReproduce) ? e.stepsToReproduce : [];
  return !e.actualResult && !e.expectedResult && !t.length ? String(e.description || "").trim() : Lu({
    summary: String(e.title || "").trim(),
    actualResult: e.actualResult || "",
    expectedResult: e.expectedResult || "",
    stepsToReproduce: t,
    suggestedSeverity: e.suggestedSeverity || "",
    suggestedPriority: e.suggestedPriority || ""
  });
}
function _u(e, t) {
  const r = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`, n = typeof e == "number" && isFinite(e) && e >= 0 ? e : null, i = typeof t == "number" && isFinite(t) && t >= 0 ? t : null;
  return n == null ? i == null ? "" : r(i) : i == null || i <= n ? r(n) : `${r(n)}–${r(i)}`;
}
function cl(e, t) {
  const r = String(e.description || "").trim(), n = String(t.reporterNote || "").trim();
  if (t.primary) return n && n !== r ? `${r}

Reporter note:
${n}` : r;
  const i = _u(e.startSec, e.endSec), s = t.videoKey ? `${t.videoKey}${t.videoTitle ? ` (“${t.videoTitle}”)` : ""}` : t.videoTitle ? `“${t.videoTitle}”` : "the related ticket";
  return `${r}

—
Split from a Record me video${i ? ` (at ${i})` : ""}. The video is attached to ${s}.`;
}
function Lu(e) {
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
function Pm(e) {
  const t = /^fb_([0-9a-f]{8})[0-9a-f-]+$/i.exec(e);
  return t ? "fb_" + t[1] : e;
}
const zm = /^[A-Za-z][A-Za-z0-9]{1,9}-\d+$/;
function Dm(e) {
  if (!e) return "";
  try {
    const t = new URL(e);
    if (t.protocol !== "https:" && t.protocol !== "http:") return "";
    const r = t.pathname.split("/").filter(Boolean).pop() || "";
    return zm.test(r) ? r : "";
  } catch {
    return "";
  }
}
function ul(e, t) {
  return Dm(t) || Pm(e);
}
function dl(e) {
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
function pl(e) {
  return e.screenCaptureDefault && typeof e.onCaptureSharp == "function" ? "screen" : typeof e.onCaptureViewport == "function" ? "viewport" : typeof e.onCaptureFull == "function" ? "full" : "none";
}
function $m(e) {
  const t = e && typeof e == "object" && "name" in e ? String(e.name) : "";
  return t === "NotAllowedError" || t === "AbortError" || t === "NotFoundError" || t === "InvalidStateError";
}
const Fm = {
  "real-pixel": { label: "Sharp", iconName: "check-circle", degraded: !1 },
  rendered: { label: "Rendered", iconName: "image", degraded: !0 },
  wireframe: { label: "Wireframe", iconName: "triangle-alert", degraded: !0 }
};
function Ao(e) {
  return (e.type || "").toLowerCase().startsWith("video/") || /\.(mp4|m4v|mov|webm|avi|mkv|ogv|3gp)$/i.test(e.name || "");
}
function Um(e) {
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
const Bm = "image/*,.heic,.heif,video/*,.pdf,.log,.har,.txt,.json,.csv,.zip,.xml,.yml,.yaml", qm = 100, Wm = qm * 1024 * 1024;
function Hm(e) {
  return (e.type || "").toLowerCase().startsWith("image/") || /\.(heic|heif|png|jpe?g|gif|webp|bmp|avif|svg)$/i.test(e.name || "");
}
function Br(e) {
  return Ao(e) ? "video" : Hm(e) ? "image" : "file";
}
function jm(e, t) {
  if (e.size <= t.capBytes) return { overCap: !1 };
  const r = Math.round(t.capBytes / 1024 / 1024), n = t.role === "owner" || t.role === "admin" || t.role === "member", s = `${e.name ? `"${e.name}"` : "This file"} is over the ${r}MB limit on your plan.`, a = n ? { kind: "upgrade", label: "Request upgrade", url: t.upgradeUrl, reason: "storage_over_cap", hint: "or attach a smaller file" } : { kind: "ask-team", label: "Request upgrade", reason: "storage_over_cap", hint: "or attach a smaller file" };
  return { overCap: !0, message: s, cta: a };
}
function ei(e) {
  return e == null || typeof e != "number" || !isFinite(e) ? null : Math.max(0, Math.min(100, Math.round(e)));
}
function Ym(e, t, r = {}) {
  var Ia, Oa, Na, Pa;
  const n = Su(r);
  let i = !!n.maskNumbers;
  const s = document.createElement("div");
  s.setAttribute("data-klavity-ui", "composer"), s.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;";
  const a = s.attachShadow({ mode: "open" });
  document.body.appendChild(s);
  let c = [], l = !1, d = [], o = [], h = [], p = null, u = [], m = !1, f = !1, y = !1, E = !1;
  const v = !!t.onMinimize, b = v ? 8 : 5, T = 3e4, w = 10 * 1024 * 1024, k = !!t.allowFileAttachments, R = 5, I = t.maxFileBytes && t.maxFileBytes > 0 ? t.maxFileBytes : Wm, $ = t.reporterRole ?? "anon", O = t.upgradeUrl, Z = Math.max(120 * 1024 * 1024, I + 20 * 1024 * 1024);
  let q = [];
  const L = /* @__PURE__ */ new WeakMap(), Ze = () => typeof URL < "u" && typeof URL.createObjectURL == "function", Ye = (g) => L.get(g) || g.dataUrl, ye = (g) => {
    const x = L.get(g);
    if (x) {
      try {
        URL.revokeObjectURL(x);
      } catch {
      }
      L.delete(g);
    }
  };
  let he = null;
  const Ie = !!(t.allowRecording && t.onRecord), Fe = sm({
    hasEndpoint: !!t.onDictate,
    mediaRecorderSupported: yi.isSupported(),
    webSpeechSupported: wn.isSupported()
  }), Oe = Fe !== "none", de = 2;
  let j = t.initialRecordings && Array.isArray(t.initialRecordings) ? [...t.initialRecordings] : [];
  const D = t.issueTypes && t.issueTypes.length ? t.issueTypes : null, G = {};
  let ie = null;
  const _e = () => {
    const g = Object.keys(G);
    if (!g.length && !ie) return null;
    const x = {};
    if (g.length) {
      const S = {};
      for (const C of g) S[C] = G[C];
      const M = G[0] ?? G[Number(g[0])] ?? {};
      Object.assign(x, M, { byIndex: S });
    }
    return ie && (x.selector = ie.selector, x.selectorText = ie.text), x;
  };
  let pe = e, fe = 0, Se = null, me = null, oe = null, $e = t.replayState === "attached", ge = null, Ne = null, Me = null, ke = null, At = !1, _t = 0;
  const ln = /* @__PURE__ */ new Set();
  let lt = null, kt = !1;
  const zn = 4e3, fr = 5e3, He = {}, nt = {}, Xt = (g) => g ? JSON.parse(JSON.stringify(g)) : null, Kt = (g) => {
    var x;
    try {
      (x = t.onAnnotationsChanged) == null || x.call(t, g, Xt(G[g]));
    } catch {
    }
  }, Wi = () => {
    const g = {};
    for (const x of Object.keys(G)) {
      const S = G[x];
      S && (g[Number(x)] = Xt(S));
    }
    return g;
  }, Dn = (g) => ({
    url: c[g],
    compressed: d[g],
    ann: Xt(G[g])
  }), ce = (g) => {
    (He[g] ?? (He[g] = [])).push(Dn(g));
  }, Pe = (g, x) => {
    c[g] = x.url, d[g] = x.compressed, x.ann ? G[g] = Xt(x.ann) : delete G[g];
  }, Qe = (g) => {
    const x = He[g];
    if (!x || !x.length) return !1;
    const S = x.pop(), M = nt[g];
    for (; M && M.length && M[M.length - 1].mark >= x.length; ) M.pop();
    return Pe(g, S), Kt(g), ze(), !0;
  }, wt = (g) => {
    const x = nt[g];
    if (!x || !x.length) return !1;
    const { snap: S, mark: M } = x.pop();
    return He[g] && (He[g].length = Math.min(He[g].length, M)), Pe(g, S), Kt(g), ze(), !0;
  }, mt = document.createElement("style");
  mt.textContent = `
    ${em(n)}
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
    /* KD-995: Record-me split review — one editable card per issue the walkthrough narrated. */
    .klavity-split{margin:0 0 12px;border:1px solid color-mix(in srgb,var(--kl-accent) 35%,var(--kl-border));border-radius:11px;background:color-mix(in srgb,var(--kl-accent) 5%,var(--kl-input-bg));padding:10px 11px;}
    .klavity-split[hidden]{display:none;}
    .kl-split-status{display:flex;align-items:center;gap:9px;font-size:12px;color:var(--kl-accent);font-weight:600;}
    .kl-split-head{display:flex;align-items:flex-start;gap:8px;font-size:12.5px;color:var(--kl-fg);line-height:1.4;margin:0 0 9px;}
    .kl-split-head b{color:var(--kl-accent);}
    .kl-split-card{border:1px solid var(--kl-border);border-radius:9px;background:var(--kl-input-bg);padding:8px 9px;margin:0 0 7px;}
    .kl-split-card.kl-off{opacity:.55;}
    .kl-split-top{display:flex;align-items:center;gap:7px;margin:0 0 6px;font-size:11.5px;color:var(--kl-muted);font-weight:650;}
    .kl-split-top input[type=checkbox]{accent-color:var(--kl-accent);margin:0;}
    .kl-split-span{margin-left:auto;font-variant-numeric:tabular-nums;}
    .kl-split-title,.kl-split-desc{width:100%;box-sizing:border-box;border:1px solid var(--kl-border);border-radius:7px;background:transparent;color:var(--kl-fg);font:inherit;font-size:12.5px;padding:6px 8px;}
    .kl-split-title{font-weight:650;margin:0 0 5px;}
    .kl-split-desc{min-height:52px;resize:vertical;line-height:1.4;}
    .kl-split-title:focus,.kl-split-desc:focus{outline:none;border-color:var(--kl-accent);}
    .kl-split-keep{border:1px solid var(--kl-border);background:var(--kl-input-bg);color:var(--kl-muted);font-weight:650;font-size:12px;border-radius:9px;padding:7px 11px;cursor:pointer;}
    .kl-split-keep:hover{color:var(--kl-accent);}
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
  `, a.appendChild(mt);
  const xt = document.createElement("div");
  xt.className = "klavity-overlay";
  const se = document.createElement("div");
  se.className = "klavity-modal", se.innerHTML = `
    ${v ? '<button class="klavity-min" id="klavity-min" type="button" aria-label="Minimize" title="Minimize (keeps your evidence)"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>' : ""}
    <button class="klavity-x" id="klavity-x" type="button" aria-label="Close" title="Close (Esc)">${le("x", { size: 16 })}</button>
    <div class="kl-hero" id="klavity-hero">
      <div class="kl-hero-tools" id="klavity-hero-tools"></div>
      <div class="kl-hero-stage" id="klavity-hero-stage">
        <div class="kl-hero-empty" id="klavity-hero-empty">${le("image", { size: 34 })}<span id="klavity-hero-empty-txt">Capture or upload a screenshot to start marking it up</span></div>
      </div>
      <div class="klavity-strip" id="klavity-strip"></div>
      ${t.onCaptureSharp ? '<div class="klavity-sharphint" id="klavity-sharphint" role="status" aria-live="polite" hidden></div>' : ""}
    </div>
    <div class="kl-side" id="klavity-side">
      ${t.showTitleField ? '<label class="klavity-title-label" for="klavity-title">Title<input type="text" class="klavity-title" id="klavity-title" maxlength="200" placeholder="One line summarising the issue"></label>' : ""}
      ${D ? `<div class="klavity-types" id="klavity-types" role="radiogroup" aria-label="Issue type">${D.map((g) => `<button type="button" class="kl-type-chip${g.value === e ? " active" : ""}" data-kind="${Xe(g.value)}" role="radio" aria-checked="${g.value === e ? "true" : "false"}">${Xe(g.label)}${g.mappingLabel ? `<span class="kl-type-map">${Xe(g.mappingLabel)}</span>` : ""}</button>`).join("")}</div>` : `<div class="klavity-toggle">
        <button class="kl-toggle-bug ${e === "bug" ? "active" : ""}"><span class="kl-cap-ic">${le("bug")}</span>Bug</button>
        <button class="kl-toggle-feat ${e === "feature" ? "active" : ""}"><span class="kl-cap-ic">${le("lightbulb")}</span>Feature</button>
      </div>`}
      
      
      <div class="klavity-actions">
        ${t.onCaptureSharp ? `<button id="klavity-sharp" class="kl-cap-primary" aria-label="Snap capture" title="Snap capture" aria-describedby="klavity-sharp-tip"><span class="kl-cap-main"><span class="kl-cap-ic">${le("app-window")}</span><span class="kl-sharp-label">Snap</span></span><span class="kl-info-badge" aria-hidden="true"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></span><span id="klavity-sharp-tip" class="klavity-info-pop" role="tooltip"><b>Snap</b> grabs the <b>whole page — every image, embedded frame, and web font, pixel-perfect</b>${t.snapWithoutSharePrompt ? "." : " using your browser's screen-share. Your browser will ask you to <b>share this tab</b>."}</span></button>` : ""}
        <button id="klavity-full" title="Full Page — pixel-perfect capture of the whole page via tab share (captures embedded frames &amp; cross-origin images). Falls back to a fast render if you decline the share."><span class="kl-cap-ic">${le("camera")}</span><span class="kl-full-label">Full Page</span></button>
        
        <button id="klavity-upload" title="${k ? "Add a screenshot, video, or file (images, MP4, PDF, .log, .har, ...)" : "Upload a screenshot"}"><span class="kl-cap-ic">${le(k ? "paperclip" : "image")}</span><span class="kl-upload-label">${k ? "Attach" : "Upload"}</span></button>
        ${Ie ? `<button id="klavity-record" title="Record your screen, camera and narration"><span class="kl-cap-ic">${le("monitor")}</span><span class="kl-record-label">Record me</span></button>` : ""}
        ${t.onRegionCapture ? `<button id="klavity-region"><span class="kl-cap-ic">${le("scissors")}</span><span class="kl-region-label">Region</span></button>` : ""}
        ${t.onPickElement ? `<button id="klavity-pick" title="Pick the exact element that's broken"><span class="kl-cap-ic">${le("mouse-pointer-2")}</span><span class="kl-pick-label">Pick element</span></button>` : ""}
      </div>
      ${t.onPickElement ? '<div class="klavity-pickinfo" id="klavity-pickinfo" role="status" aria-live="polite" hidden></div>' : ""}
      
      
      <input type="file" id="klavity-file" accept="${k ? Bm : "image/*,.heic,.heif"}" multiple style="display:none">
      ${k ? `<div class="klavity-attach-hint" id="klavity-attach-hint"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg><span>Images, video, PDF or logs — up to ${Math.round(I / 1024 / 1024)}MB each</span></div>` : ""}
      
      <div class="klavity-descbar">
        <div class="klavity-counter" id="klavity-counter" hidden>0/${b} images</div>
        ${Oe ? `<button id="klavity-voice" class="kl-voice-circle" type="button" title="Voice dictation" aria-label="Voice dictation" aria-pressed="false"><span class="kl-cap-ic">${le("mic")}<span class="kl-vdot"></span><span class="kl-vstop" aria-hidden="true"></span></span><svg class="kl-vring" viewBox="0 0 32 32" aria-hidden="true"><circle class="kl-vring-bg" cx="16" cy="16" r="13" fill="none" stroke-width="2"/><circle class="kl-vring-prog" cx="16" cy="16" r="13" fill="none" stroke-width="2" stroke-dasharray="81.68" stroke-dashoffset="81.68" stroke-linecap="round" transform="rotate(-90 16 16)"/></svg></button>` : ""}
      </div>
      ${k ? '<div class="klavity-capmsg" id="klavity-capmsg" role="alert" hidden></div>' : ""}
      ${k ? '<div class="klavity-files" id="klavity-files" hidden></div>' : ""}
      
      <div class="klavity-error" id="klavity-err"></div>
      <div class="klavity-desc" id="klavity-desc" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Description" data-ph="${e === "feature" ? "Describe the feature you'd like..." : "Describe the bug..."}"></div>
      <div class="klavity-desc-hint" id="klavity-desc-hint" hidden>${le("sparkles", { size: 13 })}<span>No title needed — we'll auto-generate one for you</span></div>
      ${t.onEnhance ? `<div class="klavity-enhance-row" id="klavity-enhance-row">
        <button type="button" class="klavity-enhance-btn" id="klavity-enhance">${le("sparkles", { size: 14 })}<span>Enhance with AI</span></button>
        <button type="button" class="klavity-enhance-undo" id="klavity-enhance-undo" hidden>${le("rotate-cw", { size: 13 })}<span>Undo</span></button>
        <button type="button" class="klavity-enhance-regen" id="klavity-enhance-regen" hidden>${le("refresh-cw", { size: 13 })}<span>Regenerate</span></button>
      </div>
      <div class="klavity-enhance-spin" id="klavity-enhance-spin" hidden><span class="kl-enh-loader"></span><span>Drafting from your screenshot…</span></div>` : ""}
      ${t.onSplitRecording ? '<div class="klavity-split" id="klavity-split" aria-live="polite" hidden></div>' : ""}
      
      <label class="klavity-remail-label" for="klavity-remail">Email${t.requireEmail ? "" : " (optional)"}</label>
      <div class="klavity-remail-wrap">
        <input type="email" class="klavity-remail" id="klavity-remail" placeholder="name@company.com" autocomplete="klavity-off" autocapitalize="off" autocorrect="off" spellcheck="false" data-lpignore="true" data-1p-ignore data-form-type="other" role="combobox" aria-expanded="false" aria-autocomplete="list" aria-controls="klavity-remail-sugg">
        <span class="klavity-remail-caret" id="klavity-remail-caret" aria-hidden="true"></span>
      <div class="klavity-remail-sugg" id="klavity-remail-sugg" role="listbox" aria-label="People" hidden>
        <div class="klavity-remail-matches" id="klavity-remail-matches"></div>
        <button type="button" class="klavity-remail-sugg-opt klavity-remail-create" id="klavity-remail-addcontact" role="option" aria-selected="false" hidden>
          <span class="klavity-remail-sugg-av" aria-hidden="true">+</span>
          <span class="klavity-remail-sugg-txt">Create "<b class="klavity-remail-sugg-em"></b>"</span>
          <span class="klavity-remail-sugg-check" aria-hidden="true" hidden>${le("check", { size: 13 })}</span>
        </button>
        <div class="klavity-remail-sugg-hint" id="klavity-remail-sugg-hint">So the team can reply and tag you on this report.</div>
      </div>
      
      </div>
      ${Oe ? '<div class="klavity-voice-status" id="klavity-voice-status" role="status" aria-live="polite" hidden></div>' : ""}
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
          <button type="button" class="kl-tgt-opt on" id="klavity-target-project" role="radio" aria-checked="true" data-target="project">Your team<small>${Xe(n.projectDisplayName || "your project")}</small></button>
          <button type="button" class="kl-tgt-opt" id="klavity-target-klavity" role="radio" aria-checked="false" data-target="klavity">Klavity<small>problem with this tool</small></button>
        </div>
      </div>` : ""}
      ${t.consoleAttachToggle ? `<div class="klavity-conlog" id="klavity-conlog">
        <label class="kl-conlog-lbl" title="Attach this page's captured console logs to the report">
          <input type="checkbox" id="klavity-conlog-cb" checked>${le("file-text", { size: 14 })}<span>Attach console logs</span>
        </label>
      </div>` : ""}
      <button type="button" class="klavity-submit" id="klavity-submit" disabled>Submit</button>
      <div class="klavity-progress" id="klavity-progress" role="progressbar" aria-label="Uploading report"><div class="klavity-progress-fill" id="klavity-progress-fill"></div></div>
    </div>
  `, xt.appendChild(se), a.appendChild(xt);
  const Re = a.getElementById("klavity-sharp"), Lr = a.querySelector(".klavity-info-pop");
  if (Re && Lr) {
    const g = document.createElement("div");
    g.className = "kl-float-tip", g.setAttribute("role", "tooltip"), g.innerHTML = Lr.innerHTML, a.appendChild(g);
    const x = km({
      title: "One click to snap this tab",
      steer: "When the dialog appears, just click Allow — we'll grab a pixel-perfect screenshot of the issue."
    });
    x.style.position = "fixed", a.appendChild(x);
    let S = !1;
    ym().then((_) => {
      S = _;
    }).catch(() => {
    });
    const M = (_, z) => {
      const P = Re.getBoundingClientRect(), F = Math.min(z, window.innerWidth - 16), U = 8, K = window.innerWidth, W = window.innerHeight;
      _.style.left = Math.max(U, Math.min(P.left + P.width / 2 - F / 2, K - F - U)) + "px", _.style.top = "-9999px", _.style.visibility = "hidden", _.style.display = "block";
      const V = _.offsetHeight;
      _.style.display = "";
      let ee = P.bottom + 8;
      ee + V + U > W && (ee = P.top - V - 8), _.style.top = Math.max(U, Math.min(ee, W - V - U)) + "px", _.style.visibility = "";
    }, C = () => {
      !t.snapWithoutSharePrompt && !E && !S ? (g.classList.remove("kl-show"), M(x, 288), x.classList.add("kl-show")) : (x.classList.remove("kl-show"), M(g, 228), g.classList.add("kl-show"));
    }, A = () => {
      g.classList.remove("kl-show"), x.classList.remove("kl-show");
    };
    Re.addEventListener("mouseenter", C), Re.addEventListener("mouseleave", A), Re.addEventListener("focus", C), Re.addEventListener("blur", A);
  }
  let Ir = !1, Or = null;
  function Hi() {
    try {
      Or == null || Or.remove();
    } catch {
    }
    Or = null;
    try {
      Re == null || Re.classList.remove("kl-pulse");
    } catch {
    }
  }
  function Gd() {
    var A;
    if (Ir || !Re || kt) return;
    Ir = !0;
    const g = document.createElement("div");
    g.className = "kl-float-tip kl-nudge", g.setAttribute("role", "status"), g.setAttribute("aria-live", "polite"), g.innerHTML = `<div class="kl-nudge-row"><span><b>This screenshot may be missing images or detail.</b> Share your screen for a pixel-perfect shot.</span><button type="button" class="kl-nudge-x" aria-label="Dismiss">${le("x", { size: 13 })}</button></div>`, a.appendChild(g), Or = g, g.style.visibility = "hidden", g.style.left = "-9999px", g.style.top = "-9999px", g.style.display = "block";
    const x = 8, S = Math.min(228, window.innerWidth - 16);
    let M = 0;
    const C = () => {
      if (!Or || kt) return;
      const _ = Re.getBoundingClientRect();
      if ((_.width === 0 || _.height === 0) && M++ < 20) {
        requestAnimationFrame(C);
        return;
      }
      const z = window.innerWidth, P = window.innerHeight;
      g.style.visibility = "hidden", g.style.display = "block";
      const F = g.offsetHeight;
      g.style.left = Math.max(x, Math.min(_.right - S, z - S - x)) + "px";
      let U = _.bottom + 8;
      U + F + x > P && (U = _.top - F - 8), g.style.top = Math.max(x, Math.min(U, P - F - x)) + "px", g.style.visibility = "", g.classList.add("kl-show");
    };
    requestAnimationFrame(C), (A = g.querySelector(".kl-nudge-x")) == null || A.addEventListener("click", Hi);
    try {
      Re.classList.add("kl-pulse");
    } catch {
    }
    try {
      setTimeout(() => Hi(), 9e3);
    } catch {
    }
    Re.addEventListener("click", Hi, { once: !0 });
  }
  function Xd(g) {
    $e = g === "attached", et();
  }
  const ua = {
    shadowRoot: a,
    // Host seeds shots it already tracks (evidence-session restore, region-initial): fireAdded=false so
    // onShotAdded does NOT re-fire (which would double-persist). Page metadata is carried through as-is.
    addScreenshot: (g, x, S, M, C, A) => St(g, x, S, !1, !!M, C, A),
    // fireAdded=true: select the new shot as the active hero + fire onShotAdded (persist). See interface doc.
    addCapturedShot: (g, x, S, M, C) => St(g, x, S, !0, !!M, C),
    close: un,
    // KLA-772: expose the full per-image overlay map so the host can persist it on minimize.
    getAnnotations: Wi,
    setReplayState: Xd,
    // KLA-591: mirror the aggregate upload percent onto every video tile + file chip while a submit is in
    // flight. Re-renders the strip + chips so the bars paint; passing null clears them.
    setUploadProgress: (g) => {
      if (he = ei(g), !kt)
        try {
          ze(), Gi();
        } catch {
        }
    },
    addRecording: (g) => {
      if (!g || kt) return;
      const x = j.findIndex((S) => S.id && g.id && S.id === g.id || S.dataUrl && g.dataUrl && S.dataUrl === g.dataUrl);
      x >= 0 ? (j[x] = g, me = x) : (j.push(g), me = j.length - 1), Se = null, Fn();
    }
  };
  function ze() {
    const g = a.getElementById("klavity-strip"), x = a.getElementById("klavity-counter");
    g.innerHTML = "", c.forEach((S, M) => {
      const C = document.createElement("div");
      C.className = "klavity-thumb", M === fe && C.classList.add("kl-thumb-active");
      const A = document.createElement("img");
      A.src = S, A.title = "Click to select + mark up", A.addEventListener("load", () => {
        A.naturalHeight > A.naturalWidth * 1.4 && C.classList.add("kl-tall");
      }, { once: !0 }), A.addEventListener("click", () => {
        fe = M, Se = null, me = null, ze();
      });
      const _ = document.createElement("button");
      _.className = "klavity-rm", _.innerHTML = le("x", { size: 13 }), _.title = "Remove", _.addEventListener("click", (U) => {
        var K;
        U.stopPropagation(), c.splice(M, 1), d.splice(M, 1), o.splice(M, 1), h.splice(M, 1), u.splice(M, 1), delete G[M];
        for (const W of Object.keys(G).map(Number).filter((V) => V > M).sort((V, ee) => V - ee))
          G[W - 1] = G[W], delete G[W];
        try {
          (K = t.onShotRemoved) == null || K.call(t, M);
        } catch {
        }
        delete He[M], delete nt[M];
        for (const W of Object.keys(He).map(Number).filter((V) => V > M).sort((V, ee) => V - ee))
          He[W - 1] = He[W], delete He[W];
        for (const W of Object.keys(nt).map(Number).filter((V) => V > M).sort((V, ee) => V - ee))
          nt[W - 1] = nt[W], delete nt[W];
        c.length === 0 && qt(null), ze();
      });
      const z = document.createElement("button");
      z.className = "klavity-mk", z.innerHTML = le("pencil", { size: 13 }), z.title = "Mark up", z.addEventListener("click", (U) => {
        U.stopPropagation(), mp(M);
      });
      const P = document.createElement("div");
      P.className = "klavity-thumb-media", P.append(A, _, z), C.append(P);
      const F = o[M];
      if (F) {
        const U = Fm[F], K = document.createElement("span");
        if (K.className = "klavity-qb kl-q-" + F, K.title = F === "real-pixel" ? "Pixel-perfect capture (every image included)" : F === "wireframe" ? 'Wireframe fallback — layout only, images not captured. This shot may contain defects; share your screen with Snap (or "Retake sharp") for a pixel-perfect capture.' : 'Rendered screenshot — may be missing images or detail. This shot can contain defects; share your screen with Snap (or "Retake sharp") for a pixel-perfect capture.', K.innerHTML = le(U.iconName, { size: 10 }) + '<span class="klavity-qb-t">' + Xe(U.label) + "</span>", P.appendChild(K), U.degraded && t.onRetakeSharp) {
          const W = document.createElement("button");
          W.type = "button", W.className = "klavity-retake", W.innerHTML = le("zap", { size: 11 }) + "<span>Retake sharp</span>", W.title = "Recapture this shot at full pixel quality", W.addEventListener("click", (V) => {
            V.stopPropagation(), Jd(M, W);
          }), C.appendChild(W);
        }
      }
      if (da.has(M)) {
        const U = document.createElement("div");
        U.className = "klavity-retake-note", U.textContent = "Markup cleared for the retake.", C.appendChild(U);
      }
      g.appendChild(C);
    }), q.forEach((S, M) => {
      if (Br(S) !== "video") return;
      const C = document.createElement("div");
      C.className = "klavity-thumb kl-video-thumb", Se === M && C.classList.add("kl-thumb-active");
      const A = document.createElement("video");
      A.src = Ye(S), A.muted = !0, A.preload = "metadata", A.setAttribute("playsinline", ""), A.tabIndex = -1;
      const _ = document.createElement("span");
      _.className = "kl-video-play", _.setAttribute("aria-hidden", "true"), _.innerHTML = le("play", { size: 16 });
      const z = document.createElement("span");
      z.className = "kl-video-badge", z.innerHTML = le("play", { size: 9 }) + "<span>Video</span>", C.title = "Click to play " + S.name, C.addEventListener("click", () => {
        Se = M, me = null, ze();
      });
      const P = document.createElement("button");
      P.className = "klavity-rm", P.innerHTML = le("x", { size: 13 }), P.title = "Remove", P.addEventListener("click", (U) => {
        U.stopPropagation(), ha(M);
      }), C.append(A, _, z, P);
      const F = ei(he);
      if (F != null) {
        const U = document.createElement("div");
        U.className = "kl-att-prog";
        const K = document.createElement("i");
        K.style.width = F + "%", U.appendChild(K), C.appendChild(U);
      }
      g.appendChild(C);
    }), j.forEach((S, M) => {
      const C = document.createElement("div");
      C.className = "klavity-thumb kl-video-thumb kl-rec-tile", me === M && C.classList.add("kl-thumb-active");
      const A = document.createElement("video");
      let _ = S.dataUrl;
      S.blob && typeof URL < "u" && typeof URL.createObjectURL == "function" && (_ = S._previewUrl || (S._previewUrl = URL.createObjectURL(S.blob))), A.src = _, A.muted = !0, A.preload = "metadata", A.setAttribute("playsinline", ""), A.tabIndex = -1;
      const z = document.createElement("span");
      z.className = "kl-video-play", z.setAttribute("aria-hidden", "true"), z.innerHTML = le("play", { size: 16 });
      const P = Math.round(S.durationMs / 1e3), F = document.createElement("span");
      F.className = "kl-video-badge", F.innerHTML = le("play", { size: 9 }) + `<span>${Math.floor(P / 60)}:${String(P % 60).padStart(2, "0")}${S.screenOnly ? " · screen" : ""}</span>`, C.title = "Click to play your recording", C.addEventListener("click", () => {
        me = M, Se = null, ze();
      });
      const U = document.createElement("button");
      U.type = "button", U.className = "kl-rerec", U.innerHTML = le("refresh-cw", { size: 12 }), U.title = "Re-record", U.setAttribute("aria-label", "Re-record"), U.addEventListener("click", (V) => {
        var te;
        V.stopPropagation();
        const ee = j.splice(M, 1)[0];
        if (ee && ee._previewUrl)
          try {
            URL.revokeObjectURL(ee._previewUrl);
          } catch {
          }
        me === M ? me = null : me != null && me > M && (me -= 1), Fn();
        try {
          (te = a.getElementById("klavity-record")) == null || te.click();
        } catch {
        }
      });
      const K = document.createElement("button");
      K.className = "klavity-rm", K.innerHTML = le("x", { size: 13 }), K.title = "Remove", K.addEventListener("click", (V) => {
        V.stopPropagation();
        const ee = j.splice(M, 1)[0];
        if (ee && ee._previewUrl)
          try {
            URL.revokeObjectURL(ee._previewUrl);
          } catch {
          }
        me === M ? me = null : me != null && me > M && (me -= 1), Fn();
      }), C.append(A, z, F, U, K);
      const W = ei(he);
      if (W != null) {
        const V = document.createElement("div");
        V.className = "kl-att-prog";
        const ee = document.createElement("i");
        ee.style.width = W + "%", V.appendChild(ee), C.appendChild(V);
      }
      g.appendChild(C);
    });
    try {
      const S = g.children[fe];
      S && typeof S.scrollIntoView == "function" && S.scrollIntoView({ block: "nearest", inline: "nearest" });
    } catch {
    }
    if (l) {
      const S = document.createElement("div");
      S.className = "kl-thumb-skel kl-loading", S.setAttribute("role", "status"), S.setAttribute("aria-label", "Capturing screenshot"), S.innerHTML = '<span class="kl-skel-spin" aria-hidden="true"></span><span>Capturing…</span>', g.appendChild(S);
    }
    x.textContent = `${c.length}/${b} images`, x instanceof HTMLElement && (x.hidden = c.length === 0), et(), $n(), _a();
  }
  function $n() {
    const g = a.getElementById("klavity-sharphint");
    if (!g) return;
    if (c.length > 0 && fe >= 0 && fe < c.length && !!h[fe] && !m && !!t.onCaptureSharp && !Et) {
      if (!g.dataset.built) {
        g.dataset.built = "1", g.innerHTML = "";
        const M = document.createElement("span");
        M.className = "kl-sh-ic", M.innerHTML = le("triangle-alert", { size: 15 });
        const C = document.createElement("span");
        C.className = "kl-sh-txt", C.textContent = "This screenshot may be missing images or detail. Share your screen with Snap for a pixel-perfect shot.";
        const A = document.createElement("button");
        A.type = "button", A.className = "kl-sh-use", A.textContent = "Use Snap", A.addEventListener("click", () => {
          m = !0, $n(), Re == null || Re.click();
        });
        const _ = document.createElement("button");
        _.type = "button", _.className = "kl-sh-x", _.setAttribute("aria-label", "Dismiss"), _.title = "Dismiss", _.innerHTML = le("x", { size: 12 }), _.addEventListener("click", () => {
          m = !0, $n();
        }), g.append(M, C, A, _);
      }
      g.hidden = !1, Re == null || Re.classList.add("kl-suggest");
    } else
      g.hidden = !0, Re == null || Re.classList.remove("kl-suggest");
  }
  function ji() {
    f = !0, l = !1, ze();
  }
  function Kd() {
    return f ? t.onCaptureSharp && t.snapWithoutSharePrompt ? "Couldn't grab this page automatically — click Snap for a pixel-perfect shot, or attach an image." : t.onCaptureSharp ? "Couldn't grab this page automatically — click Snap to share your tab for a pixel-perfect shot, or attach an image." : "Couldn't grab this page automatically — try Full Page, or attach an image." : y ? t.onCaptureSharp ? "This page is too large to capture automatically — click Snap for a pixel-perfect shot, or Full Page." : "This page is too large to capture automatically — click Full Page to capture it, or attach an image." : "Capture or upload a screenshot to start marking it up";
  }
  function Bt(g) {
    const x = a.getElementById("klavity-err");
    x && (x.textContent = g, x.style.display = "block");
  }
  function Yi() {
    const g = a.getElementById("klavity-err");
    g && (g.style.display = "none");
  }
  function St(g, x, S, M = !0, C = !1, A, _) {
    var P;
    if (c.length >= b) {
      Bt(`You can attach up to ${b} images.`);
      return;
    }
    Yi(), y = !1, f = !1, c.push(g);
    const z = c.length - 1;
    if (_ && Array.isArray(_.shapes) && _.shapes.length && (G[z] = Xt(_)), d.push(t.compressImage ? t.compressImage(g) : Promise.resolve(g)), o.push(x), h.push(C && x !== "real-pixel"), u.push(A), M && (fe = c.length - 1, Se = null, me = null), ze(), M)
      try {
        (P = t.onShotAdded) == null || P.call(t, g, x);
      } catch {
      }
  }
  const da = /* @__PURE__ */ new Set();
  async function Jd(g, x) {
    if (!(Et || !t.onRetakeSharp)) {
      ct(!0), x.classList.add("kl-loading"), s.style.display = "none";
      try {
        const S = i ? kr(document.body) : null;
        let M;
        try {
          M = await t.onRetakeSharp(u[g]);
        } finally {
          S == null || S();
        }
        if (M) {
          const { dataUrl: C, quality: A } = Ht(M);
          C && (c[g] = C, d[g] = t.compressImage ? t.compressImage(C) : Promise.resolve(C), o[g] = A ?? "real-pixel", h[g] = !1, G[g] && (delete G[g], da.add(g), Kt(g)), delete He[g], delete nt[g]);
        }
      } catch {
      } finally {
        s.style.display = "", ct(!1), ze();
      }
    }
  }
  function pa(g) {
    return g.type.startsWith("image/") || /\.(heic|heif|png|jpe?g|gif|webp|bmp|avif|svg)$/i.test(g.name);
  }
  async function Vi(g) {
    Yi();
    for (const x of g) {
      if (c.length >= b) {
        Bt(`You can attach up to ${b} images.`);
        break;
      }
      if (!pa(x)) {
        Bt(`"${x.name}" isn't an image — only image files can be attached.`);
        continue;
      }
      if (x.size > w) {
        Bt(`"${x.name}" is too large — images must be under ${Math.round(w / 1024 / 1024)} MB.`);
        continue;
      }
      try {
        St(await hl(x));
      } catch {
        Bt(`Couldn't add "${x.name}". Please try a different image.`);
      }
    }
  }
  function Gi() {
    const g = a.getElementById("klavity-files");
    if (!g) return;
    g.innerHTML = "";
    const x = q.filter((S) => Br(S) === "file");
    g.hidden = x.length === 0, q.forEach((S, M) => {
      if (Br(S) !== "file") return;
      const C = document.createElement("div");
      C.className = "kl-file-chip";
      const A = document.createElement("span");
      A.className = "kl-file-ic", A.innerHTML = le("file-text", { size: 14 });
      const _ = document.createElement("span");
      _.className = "kl-file-nm", _.textContent = S.name, _.title = S.name;
      const z = document.createElement("span");
      z.className = "kl-file-sz", z.textContent = S.size < 1024 ? `${S.size} B` : S.size < 1024 * 1024 ? `${Math.round(S.size / 1024)} KB` : `${(S.size / 1024 / 1024).toFixed(1)} MB`;
      const P = document.createElement("button");
      P.type = "button", P.className = "kl-file-rm", P.setAttribute("aria-label", `Remove ${S.name}`), P.title = "Remove", P.innerHTML = le("x", { size: 11 }), P.addEventListener("click", () => {
        ha(M);
      }), C.append(A, _, z, P);
      const F = ei(he);
      if (F != null) {
        const U = document.createElement("div");
        U.className = "kl-att-prog";
        const K = document.createElement("i");
        K.style.width = F + "%", U.appendChild(K), C.appendChild(U);
      }
      g.appendChild(C);
    }), et();
  }
  function ha(g) {
    const x = q[g] && Br(q[g]) === "video";
    q[g] && ye(q[g]), q.splice(g, 1), Se != null && (x && Se === g ? Se = null : Se > g && (Se -= 1)), Gi(), ze();
  }
  function Zd(g, x) {
    if (g.kind === "upgrade") {
      if (!g.url) return null;
      const M = document.createElement("a");
      return M.className = "kl-capmsg-cta", M.href = g.url, M.target = "_blank", M.rel = "noopener noreferrer", M.textContent = g.label, M;
    }
    if (!t.onRequestUpgrade) return null;
    const S = document.createElement("button");
    return S.type = "button", S.className = "kl-capmsg-cta kl-capmsg-req", S.textContent = g.label, S.addEventListener("click", async () => {
      if (S.disabled) return;
      const M = S.textContent || g.label;
      S.disabled = !0, S.textContent = "Requesting…";
      let C = !1;
      try {
        C = await t.onRequestUpgrade({ reason: g.reason || "upgrade", context: x });
      } catch {
        C = !1;
      }
      if (C) {
        const A = document.createElement("span");
        A.className = "kl-capmsg-sent", A.innerHTML = `<span class="kl-capmsg-sent-ic">${le("check")}</span>Request sent to your team`, S.replaceWith(A);
      } else
        S.disabled = !1, S.textContent = M;
    }), S;
  }
  function Qd(g, x) {
    const S = a.getElementById("klavity-capmsg");
    if (!S || !g.overCap) return;
    S.innerHTML = "";
    const M = document.createElement("span");
    if (M.className = "kl-capmsg-t", M.textContent = g.message || "", S.appendChild(M), g.cta) {
      const C = Zd(g.cta, x);
      if (C && S.appendChild(C), g.cta.hint) {
        const A = document.createElement("span");
        A.className = "kl-capmsg-hint", A.textContent = g.cta.hint, S.appendChild(A);
      }
    }
    S.hidden = !1;
  }
  function ep() {
    const g = a.getElementById("klavity-capmsg");
    g && (g.hidden = !0, g.innerHTML = "");
  }
  async function tp(g) {
    Yi(), ep();
    for (const x of g) {
      if (pa(x)) {
        await Vi([x]);
        continue;
      }
      if (q.length >= R) {
        Bt(`You can attach up to ${R} files.`);
        break;
      }
      const S = jm(x, { capBytes: I, role: $, upgradeUrl: O });
      if (S.overCap) {
        Qd(S, {
          page: (typeof location < "u" ? location.href : "") || "",
          fileMeta: { name: x.name, sizeMb: Math.round(x.size / 1024 / 1024 * 10) / 10 }
        });
        continue;
      }
      if (q.reduce((C, A) => C + A.size, 0) + x.size > Z) {
        Bt(`Attachments exceed the ${Math.round(Z / 1024 / 1024)} MB total limit.`);
        break;
      }
      try {
        const C = x.type || (Ao(x) ? Um(x.name) : ""), A = Ao(x) && Ze(), _ = A ? { name: x.name, type: C, size: x.size, dataUrl: "", blob: x } : { name: x.name, type: C, size: x.size, dataUrl: await hl(x) };
        if (A)
          try {
            L.set(_, URL.createObjectURL(x));
          } catch {
          }
        const z = q.push(_) - 1;
        Gi(), Br(q[z]) === "video" && (Se = z), ze();
      } catch {
        Bt(`Couldn't add "${x.name}". Please try a different file.`);
      }
    }
  }
  function Fn() {
    kt || (ze(), et(), rp());
  }
  function rp() {
    if (!t.onSplitRecording) return;
    ke && !j.some((x) => x.id === ke) && (ke = null, Me = null, At = !1, _t++);
    const g = [...j].reverse().find((x) => x.id && !ln.has(x.id));
    g && !At && !(Me && Me.length >= 2) && np(g), cn();
  }
  async function np(g) {
    const x = t.onSplitRecording;
    if (!x) return;
    ln.add(g.id);
    const S = ++_t;
    ke = g.id, At = !0, cn();
    let M = null;
    try {
      const A = g.blob || await (await fetch(g.dataUrl)).blob();
      M = await x(A, { text: Y.value.trim() });
    } catch {
      M = null;
    }
    if (S !== _t || kt) return;
    At = !1;
    const C = (M || []).filter((A) => A && (String(A.title || "").trim() || String(A.description || "").trim()));
    C.length >= 2 ? Me = C.map((A) => ({ ...A, title: String(A.title || "").trim(), description: Nm(A), include: !0 })) : (Me = null, ke = null), cn();
  }
  function fa() {
    return Me && Me.length >= 2 ? Me.filter((g, x) => x === 0 || g.include).length : 1;
  }
  function Un() {
    if (Et) return;
    const g = fa();
    tr.textContent = g > 1 ? `Submit ${g} tickets` : "Submit";
  }
  function cn() {
    var S;
    const g = a.getElementById("klavity-split");
    if (!g) return;
    if (At) {
      g.hidden = !1, g.innerHTML = '<div class="kl-split-status"><span class="kl-enh-loader"></span><span>Checking your recording for separate issues…</span></div>', Un();
      return;
    }
    if (!Me || Me.length < 2) {
      g.hidden = !0, g.innerHTML = "", Un();
      return;
    }
    const x = fa();
    g.hidden = !1, g.innerHTML = `<div class="kl-split-head">${le("sparkles", { size: 14 })}<span>We found <b>${Me.length} issues</b> in your recording. They'll be filed as <b>${x} separate ticket${x === 1 ? "" : "s"}</b> — edit or untick any before submitting.</span></div>` + Me.map((M, C) => {
      const A = _u(M.startSec, M.endSec);
      return `<div class="kl-split-card${M.include || C === 0 ? "" : " kl-off"}" data-i="${C}"><label class="kl-split-top"><input type="checkbox" class="kl-split-inc" ${M.include || C === 0 ? "checked" : ""} ${C === 0 ? "disabled" : ""}><span>Ticket ${C + 1}${C === 0 ? " · keeps the video" : ""}${M.kind === "feature" ? " · feature" : ""}</span>${A ? `<span class="kl-split-span">${Xe(A)}</span>` : ""}</label><input type="text" class="kl-split-title" maxlength="160" aria-label="Ticket ${C + 1} title" value="${Xe(M.title)}"><textarea class="kl-split-desc" rows="7" aria-label="Ticket ${C + 1} description">${Xe(M.description)}</textarea></div>`;
    }).join("") + '<button type="button" class="kl-split-keep" id="klavity-split-keep">Keep as one ticket</button>', g.querySelectorAll(".kl-split-card").forEach((M) => {
      var _, z, P;
      const C = Number(M.dataset.i), A = Me[C];
      (_ = M.querySelector(".kl-split-title")) == null || _.addEventListener("input", (F) => {
        A.title = F.target.value;
      }), (z = M.querySelector(".kl-split-desc")) == null || z.addEventListener("input", (F) => {
        A.description = F.target.value;
      }), (P = M.querySelector(".kl-split-inc")) == null || P.addEventListener("change", (F) => {
        A.include = F.target.checked, cn();
      });
    }), (S = g.querySelector("#klavity-split-keep")) == null || S.addEventListener("click", () => {
      Me = null, ke = null, cn();
    }), Un();
  }
  let mr = null;
  function un(g) {
    var M;
    if (kt) return;
    kt = !0;
    for (const C of q) ye(C);
    for (const C of j)
      if (C._previewUrl)
        try {
          URL.revokeObjectURL(C._previewUrl);
        } catch {
        }
    if (ir) {
      try {
        URL.revokeObjectURL(ir);
      } catch {
      }
      ir = null;
    }
    mr == null || mr(), lt && (clearTimeout(lt), lt = null), document.removeEventListener("keydown", gr, { capture: !0 }), document.removeEventListener("paste", ga);
    try {
      (M = t.onClose) == null || M.call(t, g == null ? void 0 : g.reason);
    } catch {
    }
    const x = a.querySelector(".klavity-modal");
    if (g != null && g.immediate || !x) {
      Ge(s);
      return;
    }
    x.classList.add("kl-closing");
    const S = () => Ge(s);
    x.addEventListener("animationend", S, { once: !0 }), setTimeout(S, 700);
  }
  function ma(g, x) {
    if (lt || kt) return;
    const S = document.createElement("div");
    S.className = "klavity-toast-progress", S.style.animationDuration = x + "ms", g.appendChild(S);
    let M = x, C = Date.now();
    const A = () => {
      C = Date.now(), lt = setTimeout(() => {
        un();
      }, M);
    }, _ = () => {
      lt && (clearTimeout(lt), lt = null, M = Math.max(0, M - (Date.now() - C)), S.style.animationPlayState = "paused");
    }, z = () => {
      lt || g.classList.contains("kl-closing") || (S.style.animationPlayState = "running", A());
    };
    g.addEventListener("mouseenter", _), g.addEventListener("mouseleave", z), g.addEventListener("focusin", _), g.addEventListener("focusout", (P) => {
      g.contains(P.relatedTarget) || z();
    }), A();
  }
  function gr(g) {
    var x;
    if (qn) {
      g.key === "Escape" ? (g.stopPropagation(), qn()) : (g.key === "s" || g.key === "S") && g.stopPropagation();
      return;
    }
    if (g.key === "Escape") {
      g.stopPropagation(), Zi();
      return;
    }
    if ((g.key === "s" || g.key === "S") && !g.metaKey && !g.ctrlKey && !g.altKey) {
      const S = typeof g.composedPath == "function" && g.composedPath()[0] || g.target;
      if (S && (S.tagName === "INPUT" || S.tagName === "TEXTAREA" || S.tagName === "SELECT" || S.isContentEditable || ((x = S.getAttribute) == null ? void 0 : x.call(S, "contenteditable")) === "true") || a.querySelector(".kl-edtb")) return;
      const M = a.getElementById("klavity-submit");
      M && !M.disabled && (g.preventDefault(), g.stopPropagation(), M.click());
    }
  }
  document.addEventListener("keydown", gr, { capture: !0 });
  const ga = (g) => {
    if (!g.clipboardData) return;
    const x = Array.from(g.clipboardData.items).filter((S) => S.type.startsWith("image/")).map((S) => S.getAsFile()).filter((S) => !!S);
    x.length && Vi(x);
  };
  document.addEventListener("paste", ga);
  const Xi = () => {
    const g = se.querySelector("#klavity-desc");
    g && (g.placeholder = pe === "feature" ? "Describe the feature you'd like..." : pe === "bug" ? "Describe the bug..." : "Describe the issue...");
  };
  if (D) {
    const g = Array.from(se.querySelectorAll(".kl-type-chip"));
    g.forEach((x) => {
      x.addEventListener("click", () => {
        pe = x.getAttribute("data-kind") || "bug", g.forEach((S) => {
          const M = S === x;
          S.classList.toggle("active", M), S.setAttribute("aria-checked", M ? "true" : "false");
        }), Xi();
      });
    });
  } else {
    const g = se.querySelector(".kl-toggle-bug"), x = se.querySelector(".kl-toggle-feat");
    g.addEventListener("click", () => {
      pe = "bug", g.classList.add("active"), x.classList.remove("active"), Xi();
    }), x.addEventListener("click", () => {
      pe = "feature", x.classList.add("active"), g.classList.remove("active"), Xi();
    });
  }
  let Ki = "project";
  {
    const g = se.querySelector("#klavity-target");
    if (g) {
      const x = Array.from(g.querySelectorAll(".kl-tgt-opt"));
      for (const S of x)
        S.addEventListener("click", () => {
          Ki = S.dataset.target === "klavity" ? "klavity" : "project";
          for (const C of x) {
            const A = C === S;
            C.classList.toggle("on", A), C.setAttribute("aria-checked", A ? "true" : "false");
          }
        });
    }
  }
  const Y = se.querySelector("#klavity-desc");
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
    }, x = () => {
      const C = g();
      if (!C || !C.rangeCount) return -1;
      try {
        const A = C.getRangeAt(0);
        if (!Y.contains(A.endContainer)) return -1;
        const _ = A.cloneRange();
        return _.selectNodeContents(Y), _.setEnd(A.endContainer, A.endOffset), _.toString().length;
      } catch {
        return -1;
      }
    }, S = (C) => {
      const A = g();
      if (A)
        try {
          const _ = document.createRange(), z = document.createTreeWalker(Y, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
          let P, F = C, U = !1;
          for (; P = z.nextNode(); ) {
            if (P.nodeName === "BR") {
              if (F === 0) {
                _.setStartBefore(P), U = !0;
                break;
              }
              F -= 1;
              continue;
            }
            if (P.nodeType === 3) {
              const K = (P.textContent || "").length;
              if (F <= K) {
                _.setStart(P, F), U = !0;
                break;
              }
              F -= K;
            }
          }
          U ? _.collapse(!0) : (_.selectNodeContents(Y), _.collapse(!1)), A.removeAllRanges(), A.addRange(_);
        } catch {
        }
    }, M = () => {
      const C = x(), A = ll(Y).replace(/\n$/, "");
      Y.innerHTML = A ? al(A) : "", C >= 0 && S(C);
    };
    Y.addEventListener("input", M), Object.defineProperty(Y, "value", {
      configurable: !0,
      get() {
        return ll(Y);
      },
      set(C) {
        const A = String(C ?? "").replace(/\n$/, "");
        Y.innerHTML = A ? al(A) : "";
      }
    }), Object.defineProperty(Y, "disabled", {
      configurable: !0,
      get() {
        return Y.getAttribute("contenteditable") === "false";
      },
      set(C) {
        Y.setAttribute("contenteditable", C ? "false" : "true"), Y.classList.toggle("kl-desc-disabled", !!C);
      }
    }), Object.defineProperty(Y, "placeholder", {
      configurable: !0,
      get() {
        return Y.getAttribute("data-ph") || "";
      },
      set(C) {
        Y.setAttribute("data-ph", String(C ?? ""));
      }
    });
  }
  const tr = se.querySelector("#klavity-submit"), Ee = se.querySelector("#klavity-remail");
  let dn = "", pn = !1;
  Ee && t.prefillEmail && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t.prefillEmail) && (Ee.value = t.prefillEmail), Ee && Ee.value.trim() && (dn = Ee.value.trim().toLowerCase());
  const ya = se.querySelector("#klavity-desc-hint"), ip = () => !t.requireEmail || !!Ee && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(Ee.value.trim()), Ji = () => {
    var g;
    return c.length > 0 || $e || q.length > 0 || j.length > 0 || Y.value.trim().length > 0 || (((g = se.querySelector("#klavity-title")) == null ? void 0 : g.value.trim().length) ?? 0) > 0;
  };
  let Bn = null, qn = null;
  const Zi = () => {
    var M, C, A;
    if (!Ji()) {
      un();
      return;
    }
    if (Bn) return;
    const g = document.createElement("div");
    Bn = g, g.setAttribute("role", "alertdialog"), g.setAttribute("aria-modal", "true"), g.setAttribute("aria-labelledby", "kl-cc-title"), g.style.cssText = "position:absolute;inset:0;z-index:30;display:flex;align-items:center;justify-content:center;background:rgba(12,10,8,.55);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)", g.innerHTML = '<div style="max-width:340px;background:var(--kl-bg,#1c1712);color:var(--kl-fg,#f5f3ee);border:1px solid var(--kl-border,#574f45);border-radius:14px;padding:20px 20px 16px;box-shadow:0 18px 48px rgba(0,0,0,.45);font-family:var(--kl-font,system-ui,sans-serif)"><div id="kl-cc-title" style="font-size:15px;font-weight:600;margin-bottom:6px">Discard this capture?</div><div style="font-size:13px;opacity:.8;line-height:1.45;margin-bottom:16px">Your screenshot and any annotations, recording or attached files will be lost.</div><div style="display:flex;gap:8px;justify-content:flex-end"><button id="kl-cc-keep" style="padding:8px 14px;border-radius:9px;border:1px solid var(--kl-border,#574f45);background:transparent;color:inherit;font-size:13px;font-weight:600;cursor:pointer">Keep editing</button><button id="kl-cc-discard" style="padding:8px 14px;border-radius:9px;border:none;background:#c0392b;color:#fff;font-size:13px;font-weight:600;cursor:pointer">Discard</button></div></div>';
    const x = () => {
      Ge(g), Bn === g && (Bn = null, qn = null);
    };
    qn = x, g.addEventListener("click", (_) => {
      _.target === g && x();
    }), (M = g.querySelector("#kl-cc-keep")) == null || M.addEventListener("click", x), (C = g.querySelector("#kl-cc-discard")) == null || C.addEventListener("click", () => {
      x(), un({ reason: "discard" });
    }), (a.querySelector(".klavity-modal") || xt).appendChild(g);
    try {
      (A = g.querySelector("#kl-cc-keep")) == null || A.focus();
    } catch {
    }
  }, sp = () => {
  }, et = () => {
    const g = Y.value.trim() === "";
    tr.disabled = g && !Ji() || !ip(), ya && (ya.hidden = !(g && Ji()));
  };
  if (Y.addEventListener("input", sp), Y.addEventListener("input", et), Ee == null || Ee.addEventListener("input", et), t.onDescriptionChange) {
    const g = t.onDescriptionChange;
    let x = null;
    const S = () => {
      x && (clearTimeout(x), x = null);
      try {
        g(Y.value);
      } catch {
      }
    };
    Y.addEventListener("input", () => {
      x && clearTimeout(x), x = setTimeout(S, 600);
    }), Y.addEventListener("blur", S), Y.addEventListener("change", S), typeof window < "u" && (window.addEventListener("beforeunload", S), window.addEventListener("pagehide", S));
  }
  const hn = se.querySelector("#klavity-title");
  if (hn && t.onTitleChange) {
    const g = t.onTitleChange;
    let x = null;
    const S = () => {
      x && (clearTimeout(x), x = null);
      try {
        g(hn.value);
      } catch {
      }
    };
    hn.addEventListener("input", () => {
      x && clearTimeout(x), x = setTimeout(S, 600);
    }), hn.addEventListener("blur", S), hn.addEventListener("change", S), typeof window < "u" && (window.addEventListener("beforeunload", S), window.addEventListener("pagehide", S));
  }
  const yr = se.querySelector("#klavity-remail-sugg"), Qi = se.querySelector("#klavity-remail-matches"), ba = se.querySelector("#klavity-remail-sugg-hint"), rr = se.querySelector("#klavity-remail-addcontact"), va = se.querySelector(".klavity-remail-sugg-em"), ka = se.querySelector(".klavity-remail-sugg-check");
  let Lt = !1, Nr = "", Wn = [], es = "", ts = !1, wa = 0;
  const xa = (g) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(g), op = (g) => {
    var M, C;
    const x = (g.name || g.email).trim(), S = x.split(/[\s._-]+/).filter(Boolean);
    return ((((M = S[0]) == null ? void 0 : M[0]) || "") + (((C = S[1]) == null ? void 0 : C[0]) || "")).toUpperCase() || x.slice(0, 1).toUpperCase();
  }, ap = (g) => {
    let x = 0;
    for (let S = 0; S < g.length; S++) x = x * 31 + g.charCodeAt(S) >>> 0;
    return `hsl(${x % 360} 58% 42%)`;
  };
  async function Sa(g) {
    if (!t.onLookupPeople) {
      Wn = [], es = g, ts = !0;
      return;
    }
    const x = ++wa;
    try {
      const S = await t.onLookupPeople(g);
      if (x !== wa) return;
      Wn = Array.isArray(S) ? S : [];
    } catch {
      Wn = [];
    }
    es = g, ts = !0, nr();
  }
  function nr() {
    if (!yr || !Ee) return;
    const g = Ee.value.trim(), x = g.toLowerCase();
    Lt && x !== Nr && (Lt = !1, Nr = "");
    const S = pn ? Wn.filter((_) => !x || _.email.toLowerCase().includes(x) || (_.name || "").toLowerCase().includes(x)) : [], M = S.some((_) => _.email.toLowerCase() === x), C = pn && xa(g) && !M;
    Qi && (Qi.innerHTML = S.map((_) => `
        <button type="button" class="klavity-remail-person" role="option" data-email="${Xe(_.email)}">
          <span class="klavity-remail-av" style="background:${Xe(ap(_.email))}">${Xe(op(_))}</span>
          <span class="klavity-remail-who">${_.name ? `${Xe(_.name)} <i>(${Xe(_.email)})</i>` : Xe(_.email)}</span>
        </button>`).join(""), Qi.querySelectorAll(".klavity-remail-person").forEach((_) => {
      _.addEventListener("click", () => {
        Ee.value = _.getAttribute("data-email") || "", Lt = !1, Nr = "", dn = Ee.value.trim().toLowerCase(), nr(), et();
      });
    }));
    const A = Ee.parentElement;
    A && A.classList.contains("klavity-remail-wrap") && A.classList.toggle("is-open", !!(S.length || C)), Ee.setAttribute("aria-expanded", S.length || C ? "true" : "false"), rr && (rr.hidden = !C), ba && (ba.hidden = !C), yr.hidden = !(S.length || C), va && (va.textContent = g), ka && (ka.hidden = !Lt), rr == null || rr.setAttribute("aria-selected", Lt ? "true" : "false");
  }
  rr == null || rr.addEventListener("click", () => {
    const g = (Ee == null ? void 0 : Ee.value.trim()) || "";
    xa(g) && (Lt = !Lt, Nr = Lt ? g.toLowerCase() : "", dn = Lt ? g.toLowerCase() : "", nr(), et());
  });
  function lp() {
    if (!Ee || t.requireEmail) return;
    const g = Ee.value.trim();
    g && g.toLowerCase() !== dn && (Ee.value = "", Lt = !1, Nr = "", dn = "", nr(), et());
  }
  function Ea() {
    setTimeout(() => {
      const x = se.getRootNode().activeElement;
      x === Ee || yr && x && yr.contains(x) || (pn = !1, lp(), nr());
    }, 0);
  }
  Ee == null || Ee.addEventListener("blur", Ea), yr == null || yr.addEventListener("focusout", Ea);
  let rs = null;
  if (Ee == null || Ee.addEventListener("focus", () => {
    pn = !0, nr(), ts || Sa("");
  }), Ee == null || Ee.addEventListener("input", () => {
    pn = !0, nr();
    const g = Ee.value.trim().toLowerCase();
    g !== es && (rs && clearTimeout(rs), rs = setTimeout(() => {
      Sa(g);
    }, 180));
  }), nr(), t.onEnhance) {
    const g = t.onEnhance, x = se.querySelector("#klavity-enhance"), S = se.querySelector("#klavity-enhance-undo"), M = se.querySelector("#klavity-enhance-regen"), C = se.querySelector("#klavity-enhance-spin");
    let A = 0, _ = null;
    const z = () => c[fe] || c[0] || "", P = () => {
      const U = z();
      if (!U) return "";
      const K = fe >= 0 && fe < c.length ? fe : 0, W = G[K] ?? (K === 0 ? G[0] : null);
      if (!W || !Array.isArray(W.shapes) || !W.shapes.length) return U;
      const V = a.getElementById("klavity-hero-stage"), ee = V == null ? void 0 : V.querySelector("canvas");
      if (ee && fe === K && ee.width > 1 && ee.height > 1)
        try {
          const te = ee.toDataURL("image/png");
          if (te && te.length > 64) return te;
        } catch {
        }
      return null;
    }, F = async () => {
      if (Et) return;
      const U = Y.value.trim();
      _ = Y.value;
      const K = ++A;
      x && (x.disabled = !0), C && (C.hidden = !1);
      try {
        const W = ie ? { selector: ie.selector, text: ie.text } : null, V = fe >= 0 && fe < c.length ? fe : 0, ee = G[V] ?? (V === 0 ? G[0] : null), te = Df(ee == null ? void 0 : ee.shapes), J = z();
        let we = P();
        we === null && (we = await $f(J, ee.shapes, ee.w, ee.h));
        const Be = await g(U, {
          images: c.length,
          shot: we,
          annotations: ee,
          annotationTexts: te,
          picked: W
        });
        if (K !== A || !Be) return;
        Y.value = Lu(Be), Y.dispatchEvent(new Event("input", { bubbles: !0 })), ge = Be.suggestedSeverity || null, Ne = Be.suggestedPriority || null, Y.classList.add("kl-just-enhanced"), setTimeout(() => Y.classList.remove("kl-just-enhanced"), 700), S && (S.hidden = !1), M && (M.hidden = !1), et();
      } catch {
      } finally {
        K === A && (x && (x.disabled = !1), C && (C.hidden = !0));
      }
    };
    x == null || x.addEventListener("click", () => {
      F();
    }), M == null || M.addEventListener("click", () => {
      F();
    }), S == null || S.addEventListener("click", () => {
      _ !== null && (Y.value = _, Y.dispatchEvent(new Event("input", { bubbles: !0 })), et()), _ = null, ge = null, Ne = null, S && (S.hidden = !0), M && (M.hidden = !0);
    });
  }
  if (t.onCheckKnown) {
    const g = se.querySelector("#klavity-known"), x = t.onCheckKnown;
    let S = null, M = 0, C = "";
    const A = () => {
      g && (g.hidden = !0, g.textContent = "");
    }, _ = (P) => {
      var U;
      if (!g) return;
      const F = P.headline ? Xe(P.headline) : "Already reported";
      g.innerHTML = `<span class="kl-known-ic">${le("check-circle", { size: 15 })}</span><div class="kl-known-body"><span class="kl-known-title">${F}</span> — status: <span class="kl-known-status">${Xe(P.statusLabel)}</span>. We're already tracking "${Xe(P.title)}". Add your note and submit anyway — it'll be linked.</div><button type="button" class="kl-known-dismiss" id="klavity-known-dismiss">Dismiss</button>`, g.hidden = !1, (U = g.querySelector("#klavity-known-dismiss")) == null || U.addEventListener("click", () => {
        C = Y.value.trim(), A();
      });
    }, z = async () => {
      const P = Y.value.trim();
      if (P.length < 12 || P === C) {
        A();
        return;
      }
      const F = ++M;
      try {
        const U = await x(P);
        if (F !== M) return;
        if (Y.value.trim() === C) {
          A();
          return;
        }
        U ? _(U) : A();
      } catch {
      }
    };
    Y.addEventListener("input", () => {
      Y.value.trim() !== C && (C = ""), S && clearTimeout(S), S = setTimeout(z, 500);
    });
  }
  if (n.reportClarity) {
    const g = se.querySelector("#klavity-clarity"), x = se.querySelector("#klavity-clarity-status"), S = {
      problem: se.querySelector("#klavity-clarity-problem"),
      expected: se.querySelector("#klavity-clarity-expected"),
      repro: se.querySelector("#klavity-clarity-repro")
    }, M = se.querySelector("#klavity-clarity-tip"), C = se.querySelector("#klavity-clarity-tip-text"), A = se.querySelector("#klavity-nudge"), _ = t.onClarityTip, z = /* @__PURE__ */ new Map();
    let P = null, F = 0;
    const U = (te, J, we) => {
      if (!te) return;
      te.classList.toggle("done", J);
      const Be = te.querySelector(".kl-clr-mark");
      Be && (Be.innerHTML = J ? le("check", { size: 12 }) : "○"), te.setAttribute("aria-label", (J ? "covered: " : "missing: ") + we);
    }, K = () => {
      M && (M.hidden = !0);
    }, W = (te) => {
      !M || !C || gm(te) || (C.innerHTML = Xe(te) + '<span class="kl-clr-aitag">AI</span>', M.hidden = !1);
    }, V = () => {
      const te = Y.value, J = Mu(te);
      g && (g.hidden = te.trim().length === 0, g.classList.remove("l1", "l2", "l3"), g.classList.add(J.level === "great" ? "l3" : J.level === "good" ? "l2" : "l1")), x && (x.textContent = J.label), U(S.problem, J.coverage.problem, "What's broken"), U(S.expected, J.coverage.expected, "What you expected"), U(S.repro, J.coverage.repro, "How to reproduce"), A && !A.hidden && (A.hidden = !0), J.level === "great" && K();
    }, ee = () => {
      !_ || !M || (P && clearTimeout(P), P = setTimeout(async () => {
        const te = Y.value.trim();
        if (!fm(te)) {
          K();
          return;
        }
        if (z.has(te)) {
          W(z.get(te));
          return;
        }
        const J = ++F;
        try {
          const we = await _(te, { images: c.length });
          if (J !== F || Y.value.trim() !== te) return;
          we && we.tip && (z.set(te, we.tip), W(we.tip));
        } catch {
        }
      }, 1e3));
    };
    Y.addEventListener("input", () => {
      V(), ee();
    }), V(), (Ia = se.querySelector("#klavity-nudge-add")) == null || Ia.addEventListener("click", () => {
      A && (A.hidden = !0);
      try {
        Y.focus();
      } catch {
      }
    }), (Oa = se.querySelector("#klavity-nudge-anyway")) == null || Oa.addEventListener("click", () => {
      A && (A.hidden = !0), tr.click();
    });
  }
  xt.addEventListener("click", (g) => {
    g.target === xt && Zi();
  }), (Na = se.querySelector("#klavity-x")) == null || Na.addEventListener("click", () => Zi()), (Pa = se.querySelector("#klavity-min")) == null || Pa.addEventListener("click", () => {
    var g;
    try {
      (g = t.onMinimize) == null || g.call(t);
    } catch {
    }
  });
  const Ca = () => Array.from(se.querySelectorAll(".klavity-actions button:not(#klavity-voice)"));
  let Et = !1;
  const ct = (g) => {
    Et = g, Ca().forEach((S) => {
      S.disabled = g;
    }), Y.disabled = g;
    const x = se.querySelector("#klavity-voice");
    x && (x.disabled = g), se.querySelectorAll(".kl-htool,.kl-htbtn,.kl-hopt,.kl-hcolor").forEach((S) => {
      S.disabled = g;
    }), a.querySelectorAll("#klavity-title,#klavity-remail,.kl-type-chip,.klavity-toggle button,#klavity-mask-numbers,.kl-file-rm,.klavity-rm,.klavity-mk,.klavity-retake").forEach((S) => {
      S.disabled = g;
    }), g ? (mr == null || mr(), tr.disabled = !0) : (et(), $n());
  }, qt = (g) => {
    Ca().forEach((x) => {
      x.classList.remove("kl-active"), x.removeAttribute("aria-pressed");
    }), g && (g.classList.add("kl-active"), g.setAttribute("aria-pressed", "true"));
  }, Jt = se.querySelector("#klavity-voice");
  if (Jt) {
    const S = Jt.querySelector(".kl-vring-prog");
    let M = 0, C = 0, A = !1, _, z = "";
    const P = () => {
      C = Date.now();
      const Q = () => {
        const xe = Date.now() - C, be = Math.min(xe / 18e4, 1);
        if (S == null || S.setAttribute("stroke-dashoffset", String(be * 81.68)), xe >= 165e3 && Jt.classList.add("kl-voice-warn"), xe >= 18e4) {
          _.stop();
          return;
        }
        M = requestAnimationFrame(Q);
      };
      M = requestAnimationFrame(Q);
    }, F = () => {
      cancelAnimationFrame(M), S == null || S.setAttribute("stroke-dashoffset", String(81.68)), Jt.classList.remove("kl-voice-warn");
    }, U = se.querySelector("#klavity-voice-status");
    let K = null;
    const W = () => {
      K && (clearTimeout(K), K = null), U && (U.hidden = !0, U.textContent = "", U.classList.remove("kl-vs-info", "kl-vs-err"));
    }, V = (Q, xe, be) => {
      !U || !xe || (K && (clearTimeout(K), K = null), U.classList.remove("kl-vs-info", "kl-vs-err"), U.classList.add(Q === "err" ? "kl-vs-err" : "kl-vs-info"), U.textContent = xe, U.hidden = !1, be && (K = setTimeout(W, be)));
    }, ee = "Recording — tap to stop", te = () => {
      U && U.classList.contains("kl-vs-info") && W();
    }, J = (Q) => {
      Jt.classList.toggle("kl-voice-rec", Q), Jt.setAttribute("aria-pressed", Q ? "true" : "false"), Jt.setAttribute("aria-label", Q ? "Stop recording" : "Voice dictation"), Jt.title = Q ? ee : "Voice dictation";
    }, we = (Q) => {
      let xe = "";
      Q.onTranscript = (be) => {
        xe = "", z = Qn(z, be), Y.value = z;
        try {
          Y.scrollTop = Y.scrollHeight;
        } catch {
        }
        try {
          Y.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        et();
      }, Q.onInterim = (be) => {
        xe = be || "";
        const X = z.length > 0 && !/\s$/.test(z) ? " " : "";
        Y.value = z + (be ? X + be : "");
        try {
          Y.scrollTop = Y.scrollHeight;
        } catch {
        }
        try {
          Y.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        et();
      }, Q.onStatus = (be, X) => {
        be === "idle" ? te() : V("info", X);
      }, Q.onError = (be, X) => {
        X && V("err", X, 4e3);
      }, Q.onStop = () => {
        xe && (z = Qn(z, xe), xe = ""), z && (z = ol(z), Y.value = z);
        try {
          Y.scrollTop = Y.scrollHeight;
        } catch {
        }
        try {
          Y.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        A = !1, J(!1), F(), te(), et();
      };
    }, Be = () => {
      const Q = new wn();
      return we(Q), Q;
    }, De = () => {
      if (!A) {
        J(!1), F(), te();
        return;
      }
      wn.isSupported() ? (z = Y.value, _ = Be(), V("info", "Reconnecting dictation…"), _.start()) : (A = !1, J(!1), F(), V("err", "Voice dictation is unavailable right now", 4e3));
    }, rt = () => {
      if (!(Fe === "server" && t.onDictate)) return null;
      const Q = new yi({ transcribe: (xe) => t.onDictate(xe) });
      return we(Q), Q.onUnavailable = De, Q;
    }, Wt = (Q) => {
      const xe = () => z.length > 0 && !/\s$/.test(z) ? " " : "";
      let be = "";
      Q.onTranscript = (X) => {
        be = "", z = Qn(z, X), Y.value = z;
        try {
          Y.scrollTop = Y.scrollHeight;
        } catch {
        }
        try {
          Y.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        et();
      }, Q.onInterim = (X) => {
        be = X || "", Y.value = z + xe() + X;
        try {
          Y.scrollTop = Y.scrollHeight;
        } catch {
        }
        try {
          Y.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        et();
      }, Q.onStatus = (X, ue) => {
        X === "idle" ? te() : V("info", ue);
      }, Q.onError = (X, ue) => {
        ue && V("err", ue, 4e3);
      }, Q.onStop = () => {
        be && (z = Qn(z, be), be = ""), z && (z = ol(z)), Y.value = z;
        try {
          Y.scrollTop = Y.scrollHeight;
        } catch {
        }
        try {
          Y.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        A = !1, J(!1), F(), te(), et();
      }, Q.onUnavailable = () => {
        Y.value = z;
        try {
          Y.dispatchEvent(new Event("input", { bubbles: !0 }));
        } catch {
        }
        if (!A) {
          J(!1), F(), te();
          return;
        }
        const X = rt();
        if (X) {
          _ = X, V("info", "Reconnecting dictation…"), _.start();
          return;
        }
        De();
      };
    }, ut = () => {
      if (Fe === "server" && t.dictationStreamUrl && bi.isSupported()) {
        const Q = new bi({ url: t.dictationStreamUrl });
        return Wt(Q), Q;
      }
      return rt() ?? Be();
    };
    _ = ut(), Jt.addEventListener("click", () => {
      A ? _.stop() : (W(), z = Y.value, _ = ut(), A = !0, J(!0), _.start(), P());
    }), mr = () => {
      A && _.stop();
    };
  }
  tr.addEventListener("click", async () => {
    var ut;
    if (Et || tr.disabled) return;
    const g = Y.value.trim(), x = se.querySelector("#klavity-title"), S = x ? x.value.trim() : "", M = pe === "feature" ? "feature" : "bug";
    p && await Promise.race([p, Promise.resolve()]);
    const C = d.slice(), A = _e(), _ = q.slice(), z = j.slice(), P = pe, F = (Ee == null ? void 0 : Ee.value.trim()) || "", U = F && (t.requireEmail || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(F)) ? F : void 0, K = !!(U && Lt && U.toLowerCase() === Nr), W = Me && Me.length >= 2 ? Me.filter((Q, xe) => xe === 0 || Q.include).map((Q) => ({ ...Q, title: Q.title.trim(), description: Q.description.trim() })) : null, V = W ? W[0] : null, ee = W ? W.slice(1) : [], te = (V == null ? void 0 : V.title) || S, J = (Q, xe) => {
      const be = Q.kind === "feature" ? "feature" : "bug";
      return {
        type: be,
        ...D ? { kind: be } : {},
        ...Q.title ? { title: Q.title } : {},
        description: cl(Q, { primary: !1, videoTitle: te, videoKey: xe }),
        screenshots: [],
        reporterEmail: U,
        createContact: !1,
        ...Q.suggestedSeverity ? { suggestedSeverity: Q.suggestedSeverity } : {},
        ...Q.suggestedPriority ? { suggestedPriority: Q.suggestedPriority } : {},
        ...n.submitTargetToggle !== !1 ? { feedbackTarget: Ki } : {}
      };
    };
    ct(!0), tr.textContent = "Uploading…";
    const we = a.getElementById("klavity-err");
    we.style.display = "none";
    const Be = a.getElementById("klavity-progress"), De = a.getElementById("klavity-progress-fill");
    Be && De && (Be.classList.add("show"), De.style.transition = "none", De.style.width = "8%", De.offsetWidth, De.style.transition = "width 10s cubic-bezier(.05,.7,.2,1)", requestAnimationFrame(() => {
      De.style.width = "90%";
    }));
    const rt = () => {
      De && (De.style.transition = "width .25s ease", De.style.width = "100%");
    }, Wt = () => {
      Be && De && (Be.classList.remove("show"), De.style.transition = "none", De.style.width = "0");
    };
    try {
      const Q = await Promise.all(C), xe = {
        type: M,
        ...D ? { kind: P } : {},
        ...te ? { title: te } : {},
        description: V ? cl(V, { primary: !0, reporterNote: g }) : g,
        screenshots: Q,
        ..._.length ? { files: _ } : {},
        ...z.length ? { recordings: z } : {},
        annotations: A,
        reporterEmail: U,
        createContact: K,
        // KLA submit-target: ride the reporter's destination choice through onSubmit. Only present when the
        // segmented control was rendered (cfg.submitTargetToggle !== false); default 'project' (never surprise-
        // route to Klavity). The server resolves the real Klavity intake project — the client only says 'klavity'.
        ...n.submitTargetToggle !== !1 ? { feedbackTarget: Ki } : {},
        // KLA-586: ride the accepted AI-Enhance draft's severity/priority as structured fields (cleared on Undo).
        // KD-995: when split, ticket #1's severity/priority come from its own card (its body replaced the field).
        ...(V ? V.suggestedSeverity : ge) ? { suggestedSeverity: V ? V.suggestedSeverity : ge } : {},
        ...(V ? V.suggestedPriority : Ne) ? { suggestedPriority: V ? V.suggestedPriority : Ne } : {},
        // #638: only when the toggle was rendered — the reporter's console-logs opt-in (DEFAULT false). Read
        // live from the checkbox so the current state travels; the host attaches console logs only when true.
        ...t.consoleAttachToggle ? { attachConsole: !!((ut = a.getElementById("klavity-conlog-cb")) != null && ut.checked) } : {}
      };
      if (t.backgroundUpload) {
        if (t.onSubmit(xe), ee.length) {
          const ue = t.onSubmit;
          (async () => {
            for (const Le of ee)
              try {
                await ue(J(Le));
              } catch (Dr) {
                try {
                  console.error("[Klavity] split ticket failed:", Dr);
                } catch {
                }
              }
          })();
        }
        un({ immediate: !0, reason: "submitted" });
        return;
      }
      const be = await t.onSubmit(xe);
      let X;
      if (ee.length) {
        X = { filed: 1, failed: 0 };
        for (const ue of ee)
          try {
            await t.onSubmit(J(ue, be.issueKey || void 0)), X.filed++;
          } catch (Le) {
            X.failed++;
            try {
              console.error("[Klavity] split ticket failed:", Le);
            } catch {
            }
          }
      }
      if (kt) return;
      rt(), t.success ? yp(be.issueKey, be.issueUrl, t.success) : gp(be.issueKey, be.issueUrl, X);
    } catch (Q) {
      Wt();
      const xe = (Q == null ? void 0 : Q.message) || "Unknown error";
      try {
        console.error("[Klavity] submit failed:", Q);
      } catch {
      }
      we.textContent = n.debug ? `Couldn't submit your report — ${xe}` : "Couldn't submit your report. Please check your connection and try again.", we.style.display = "block", tr.textContent = "Submit", ct(!1), Un();
    }
  });
  function cp(g, x) {
    var _;
    const { dataUrl: S, quality: M, suggestSharp: C } = Ht(x);
    if (!S) return;
    const A = c.indexOf(g);
    if (!(A < 0)) {
      c[A] = S, d[A] = t.compressImage ? t.compressImage(S) : Promise.resolve(S), o[A] = M, h[A] = !!C && M !== "real-pixel", G[A] && delete G[A], delete He[A], delete nt[A], ze();
      try {
        (_ = t.onShotReplaced) == null || _.call(t, A, S, M);
      } catch {
      }
    }
  }
  async function up(g) {
    if (!t.onCaptureViewport) return !1;
    let x = null;
    const S = i ? kr(document.body) : null;
    try {
      const { dataUrl: C } = Ht(await t.onCaptureViewport());
      C && (x = C, l = !1, St(C, "rendered", void 0, !0, !1), g && qt(g));
    } catch {
    } finally {
      S == null || S();
    }
    const M = (async () => {
      const C = i ? kr(document.body) : null;
      try {
        const A = await t.onCaptureFull();
        if (x) cp(x, A);
        else {
          l = !1;
          const { dataUrl: _, quality: z, suggestSharp: P } = Ht(A);
          _ && (St(_, z, void 0, !0, !!P), g && qt(g));
        }
      } catch {
        l = !1, ze();
      } finally {
        C == null || C(), p === M && (p = null);
      }
    })();
    return p = M, !0;
  }
  async function Ma(g) {
    if (!t.onCaptureViewport) return !1;
    const x = i ? kr(document.body) : null;
    try {
      const { dataUrl: S, blank: M } = Ht(await t.onCaptureViewport());
      M && c.length === 0 ? ji() : S ? (l = !1, St(S, "rendered", void 0, !0, !1)) : (l = !1, ze());
    } catch {
      l = !1, ze();
    } finally {
      x == null || x();
    }
    return !0;
  }
  const br = se.querySelector("#klavity-full");
  br.addEventListener("click", async () => {
    if (!Et && !(t.onCaptureSharp && await ns())) {
      ct(!0), br.classList.add("kl-loading");
      try {
        if (t.onCaptureViewport) {
          await up(br);
          return;
        }
        const g = i ? kr(document.body) : null;
        try {
          const { dataUrl: x, quality: S, suggestSharp: M } = Ht(await t.onCaptureFull());
          St(x, S, void 0, !0, !!M), qt(br);
        } finally {
          g == null || g();
        }
      } catch {
      } finally {
        br.classList.remove("kl-loading"), ct(!1);
      }
    }
  });
  async function ns(g) {
    const x = g != null && g.viewport && t.onCaptureSharpViewport ? t.onCaptureSharpViewport : t.onCaptureSharp;
    if (Et || !x || !Re) return !1;
    const S = Re.querySelector(".kl-sharp-label");
    ct(!0), Re.classList.add("kl-loading"), s.style.display = "none";
    const M = S ?? Re, C = M.textContent;
    M.textContent = "Capturing…";
    let A = !1;
    try {
      const _ = i ? kr(document.body) : null;
      let z;
      try {
        z = await x();
      } finally {
        _ == null || _();
      }
      if (z) {
        const { dataUrl: P, quality: F } = Ht(z);
        P && (St(P, F ?? "real-pixel", void 0, !0, !1, { kind: g != null && g.viewport ? "viewport" : "full" }), qt(Re), A = !0, E = !0);
      }
    } catch (_) {
      if ($m(_))
        try {
          Gd();
        } catch {
        }
      else
        try {
          console.warn("[Klavity] Screen capture failed; using rendered fallback:", _);
        } catch {
        }
    } finally {
      s.style.display = "", M.textContent = C, Re.classList.remove("kl-loading"), ct(!1);
    }
    return A;
  }
  Re && t.onCaptureSharp && Re.addEventListener("click", () => {
    ns();
  });
  const Ra = se.querySelector("#klavity-file"), Ta = se.querySelector("#klavity-upload");
  Ta.addEventListener("click", () => {
    if (!Et) {
      if (!k && c.length >= b) {
        Bt(`You can attach up to ${b} images.`);
        return;
      }
      Ra.click();
    }
  }), Ra.addEventListener("change", async (g) => {
    const x = g.target, S = x.files ? Array.from(x.files) : [];
    if (x.value = "", !S.length) return;
    const M = c.length, C = q.length;
    k ? await tp(S) : await Vi(S), (c.length > M || q.length > C) && qt(Ta);
  });
  const fn = a.getElementById("klavity-record");
  fn && t.onRecord && fn.addEventListener("click", async () => {
    if (Et) return;
    if (j.length >= de) {
      Bt(`You can attach up to ${de} recordings.`);
      return;
    }
    ct(!0), fn.classList.add("kl-loading");
    const g = (x) => {
      s.style.display = x === "recording" ? "none" : "";
    };
    try {
      const x = await t.onRecord(g);
      if (x) {
        const S = j.findIndex((M) => M.id && x.id && M.id === x.id || M.dataUrl && x.dataUrl && M.dataUrl === x.dataUrl);
        S >= 0 ? (j[S] = x, me = S) : (j.push(x), me = j.length - 1), Se = null, Fn(), qt(fn);
      }
    } catch {
    } finally {
      s.style.display = "", fn.classList.remove("kl-loading"), ct(!1);
    }
  });
  const is = a.getElementById("klavity-region");
  is && t.onRegionCapture && (is.onclick = () => {
    Et || (ct(!0), document.removeEventListener("keydown", gr, { capture: !0 }), s.style.display = "none", Vm(async (g) => {
      document.addEventListener("keydown", gr, { capture: !0 });
      try {
        const x = i ? kr(document.body) : null;
        let S;
        try {
          S = await t.onRegionCapture(g);
        } finally {
          x == null || x();
        }
        if (S) {
          const { dataUrl: M, quality: C, suggestSharp: A } = Ht(S);
          M && (St(M, C, void 0, !0, !!A, { kind: "region", rect: g }), qt(is));
        }
      } finally {
        s.style.display = "", ct(!1);
      }
    }, () => {
      document.addEventListener("keydown", gr, { capture: !0 }), s.style.display = "", ct(!1);
    }));
  });
  const Pr = a.getElementById("klavity-pick"), zr = a.getElementById("klavity-pickinfo"), Aa = () => {
    var S;
    if (Pr && (Pr.classList.toggle("kl-active", !!ie), ie ? Pr.setAttribute("aria-pressed", "true") : Pr.removeAttribute("aria-pressed")), !zr) return;
    if (!ie) {
      zr.hidden = !0, zr.innerHTML = "";
      return;
    }
    zr.hidden = !1;
    const { text: g } = ie, x = g ? `: <span class="kl-pick-txt">${Xe(g)}</span>` : "";
    zr.innerHTML = `<span class="kl-pick-ic">${le("mouse-pointer-2", { size: 13 })}</span><span>Element pinned${x}</span><button type="button" class="kl-pick-clear" id="klavity-pick-clear">Clear</button>`, (S = zr.querySelector("#klavity-pick-clear")) == null || S.addEventListener("click", () => {
      ie = null, Aa();
    });
  };
  Pr && t.onPickElement && (Pr.onclick = async () => {
    if (!Et) {
      ct(!0), document.removeEventListener("keydown", gr, { capture: !0 }), s.style.display = "none";
      try {
        const g = await t.onPickElement();
        g && (ie = g, Aa(), g.shot && St(g.shot, g.shotQuality, void 0, !0, !1, { kind: "element", selector: g.selector, rect: g.rect }));
      } catch {
      } finally {
        document.addEventListener("keydown", gr, { capture: !0 }), s.style.display = "", ct(!1);
      }
    }
  });
  function It(g, x = 15) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${x}" height="${x}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em">${g}</svg>`;
  }
  function dp(g) {
    const x = (A, _, z, P) => `<button type="button" class="kl-htool" data-tool="${A}" title="${_} (${P.toUpperCase()})" aria-label="${_}">${z}<span class="kl-hk">${P.toUpperCase()}</span></button>`, S = (A) => {
      const _ = A.replace("#", "");
      if (!/^[0-9a-fA-F]{6}$/.test(_)) return !1;
      const z = parseInt(_.slice(0, 2), 16), P = parseInt(_.slice(2, 4), 16), F = parseInt(_.slice(4, 6), 16);
      return (0.2126 * z + 0.7152 * P + 0.0722 * F) / 255 > 0.7;
    }, M = (A) => `<button type="button" class="kl-hcolor${S(A) ? " kl-hcolor-light" : ""}" data-color="${A}" style="background:${A}" title="${A}" aria-label="Colour ${A}"></button>`;
    return (
      // Klavity logo, TOP-LEFT of the editor toolbar. It links to the homepage (UTM-stamped so clicks are
      // attributable to WHICH project/site) — the href is assigned in JS (never innerHTML) per this file's
      // XSS guards. See heroLogoHref + the #kl-hero-logo wiring in mountHeroAnnotator.
      '<a class="kl-hlogo" id="kl-hero-logo" target="_blank" rel="noopener" title="Powered by Klavity — visit klavity.in" aria-label="Klavity homepage (opens in a new tab)"><svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g fill="#818cf8"><circle cx="15" cy="9" r="2"/><circle cx="11" cy="16" r="2"/><circle cx="10" cy="24" r="2"/><circle cx="11" cy="32" r="2"/><circle cx="15" cy="39" r="2"/><circle cx="33" cy="9" r="2"/><circle cx="37" cy="16" r="2"/><circle cx="38" cy="24" r="2"/><circle cx="37" cy="32" r="2"/><circle cx="33" cy="39" r="2"/></g><g stroke="#818cf8" stroke-width="1.6" stroke-linecap="round" opacity="0.4"><line x1="15" y1="9" x2="33" y2="9"/><line x1="11" y1="16" x2="37" y2="16"/><line x1="10" y1="24" x2="38" y2="24"/><line x1="11" y1="32" x2="37" y2="32"/><line x1="15" y1="39" x2="33" y2="39"/></g></svg><span class="kl-hlogo-word">Klavity</span></a><span class="kl-hsep"></span>' + x("pen", "Pen", le("pencil", { size: 15 }), "p") + x("line", "Line", It('<line x1="5" y1="19" x2="19" y2="5"/>'), "l") + x("rect", "Rectangle", le("square", { size: 15 }), "r") + x("circle", "Circle", It('<circle cx="12" cy="12" r="9"/>'), "o") + x("arrow", "Arrow", It('<line x1="5" y1="19" x2="19" y2="5"/><polyline points="10 5 19 5 19 14"/>'), "a") + x("text", "Text", It('<path d="M5 6h14M12 6v13M9 19h6"/>'), "t") + x("count", "Numbers", It('<circle cx="12" cy="12" r="9"/><text x="12" y="16" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor" stroke="none">1</text>'), "c") + `<span class="kl-hsep"></span><label class="kl-hmask" title="Mask numbers in new screen captures"><input type="checkbox" class="kl-hmask-cb"${i ? " checked" : ""}>${le("eye-off", { size: 13 })}<span>Mask numbers</span></label>` + x("pixelate", "Redact (pixelate)", It('<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>'), "b") + x("crop", "Crop", It('<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>'), "k") + '<span class="kl-hsep"></span><span class="kl-hcolors">' + M("#ef4444") + M("#f97316") + M("#16a34a") + M("#3b82f6") + M("#ffffff") + M("#111827") + // Custom colour picker — a rainbow swatch that opens a native <input type="color">. The chosen colour
      // becomes the active colour and shows as the selected swatch. Input is visually hidden but focusable
      // via the button (kept inside the shadow root so its styling stays scoped).
      `<span class="kl-hcolor-cwrap"><button type="button" class="kl-hcolor kl-hcolor-custom" title="Custom colour" aria-label="Choose a custom colour"></button><input type="color" class="kl-hcolor-input" value="#ef4444" aria-label="Custom colour value" tabindex="-1"></span></span><span class="kl-hsep"></span><span class="kl-hgroup"><span class="kl-hlabel">Stroke</span><button type="button" class="kl-hopt" data-stroke="0.6" title="Thin stroke" aria-label="Thin stroke">S</button><button type="button" class="kl-hopt kl-on" data-stroke="1" title="Medium stroke" aria-label="Medium stroke">M</button><button type="button" class="kl-hopt" data-stroke="1.8" title="Thick stroke" aria-label="Thick stroke">L</button><button type="button" class="kl-hopt" data-stroke="2.8" title="Extra-thick stroke" aria-label="Extra-thick stroke">XL</button></span><span class="kl-htextopts" id="kl-hero-textopts" hidden><span class="kl-hsep"></span><span class="kl-hlabel">Outline</span><button type="button" class="kl-hopt kl-on" data-outline="black" title="Black outline"><span class="kl-osq" style="background:#111"></span></button><button type="button" class="kl-hopt" data-outline="white" title="White outline"><span class="kl-osq" style="background:#fff;border:1px solid #999"></span></button><button type="button" class="kl-hopt" data-outline="none" title="No outline">None</button><span class="kl-hlabel">Size</span><button type="button" class="kl-hopt" data-size="18" title="Small">S</button><button type="button" class="kl-hopt kl-on" data-size="26" title="Medium">M</button><button type="button" class="kl-hopt" data-size="40" title="Large">L</button></span><span class="kl-hsep"></span><button type="button" class="kl-htbtn" id="kl-hero-undo" title="Undo (Cmd+Z / Ctrl+Z)" aria-label="Undo">${It('<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>', 14)}</button>` + // #449: explicit "Revert crop" — shown only after a crop on this image (visibility driven by the
      // per-image crop stack). Reverts the most recent crop to its pre-crop image + original markup.
      (g ? `<button type="button" class="kl-htbtn kl-hrevert" id="kl-hero-revert" title="Revert crop to original" aria-label="Revert crop">${It('<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 5 5v2"/>', 14)}<span class="kl-hk kl-hrevert-lbl">Revert</span></button>` : "") + `<button type="button" class="kl-htbtn" id="kl-hero-clear" title="Clear" aria-label="Clear">${le("trash-2", { size: 14 })}</button><span class="kl-hgrow"></span><span class="kl-hgroup kl-hzoom"><button type="button" class="kl-htbtn" id="kl-hero-zoomout" title="Zoom out (Z toggles fit / 2×)" aria-label="Zoom out">${It('<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16" y2="16"/><line x1="8" y1="11" x2="14" y2="11"/>', 14)}</button><button type="button" class="kl-htbtn" id="kl-hero-zoomin" title="Zoom in (Z toggles fit / 2×)" aria-label="Zoom in">${It('<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16" y2="16"/><line x1="8" y1="11" x2="14" y2="11"/><line x1="11" y1="8" x2="11" y2="14"/>', 14)}</button></span>`
    );
  }
  function mn() {
    oe && (document.removeEventListener("keydown", oe, { capture: !0 }), oe = null);
  }
  function ss() {
    const g = a.getElementById("klavity-hero-stage"), x = a.getElementById("klavity-hero-tools");
    x && (x.innerHTML = ""), g && (g.innerHTML = `<div class="kl-hero-empty" id="klavity-hero-empty"><span class="kl-hero-empty-ic">${le("image", { size: 34 })}</span><span id="klavity-hero-empty-txt">${Xe(Kd())}</span></div>`), mn();
  }
  function _a() {
    if (Se != null && !(q[Se] && Br(q[Se]) === "video") && (Se = null), me != null && !j[me] && (me = null), me != null) {
      La(j[me].dataUrl);
      return;
    }
    if (Se != null) {
      La(q[Se] ? Ye(q[Se]) : void 0);
      return;
    }
    if (c.length === 0) {
      fe = 0, ss();
      return;
    }
    fe >= c.length && (fe = c.length - 1), fe < 0 && (fe = 0), fp(fe);
  }
  let ir = null;
  function La(g) {
    const x = a.getElementById("klavity-hero-stage"), S = a.getElementById("klavity-hero-tools");
    if (!x || !g) {
      ss();
      return;
    }
    if (mn(), S && (S.innerHTML = ""), x.innerHTML = "", ir) {
      try {
        URL.revokeObjectURL(ir);
      } catch {
      }
      ir = null;
    }
    let M = g;
    const C = me != null && j[me] ? j[me] : null;
    if (C && C.blob instanceof Blob && typeof URL < "u" && typeof URL.createObjectURL == "function")
      try {
        M = URL.createObjectURL(C.blob), ir = M;
      } catch {
      }
    else if (g.startsWith("data:") && typeof URL < "u" && typeof URL.createObjectURL == "function")
      try {
        const F = g.split(",");
        if (F.length >= 2) {
          const U = F[0].match(/:(.*?);/), K = (U ? U[1] : "video/webm").split(";")[0], W = atob(F[1]);
          let V = W.length;
          const ee = new Uint8Array(V);
          for (; V--; )
            ee[V] = W.charCodeAt(V);
          const te = new Blob([ee], { type: K });
          M = URL.createObjectURL(te), ir = M;
        }
      } catch {
      }
    const A = document.createElement("div");
    A.className = "kl-hero-vwrap", A.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;max-width:100%;max-height:100%;";
    const _ = document.createElement("video");
    _.src = M, _.controls = !0, _.setAttribute("playsinline", ""), _.preload = "metadata", _.className = "kl-hero-video", _.style.cssText = "display:block;max-width:100%;max-height:100%;border-radius:8px;background:#000;box-shadow:0 12px 40px rgba(0,0,0,.5);";
    const z = document.createElement("div");
    z.className = "kl-hero-verror", z.style.cssText = "display:none;flex-direction:column;align-items:center;gap:6px;color:#fff;font-size:13px;text-align:center;";
    const P = document.createElement("a");
    P.href = M || g, P.setAttribute("download", "recording.webm"), P.setAttribute("target", "_blank"), P.setAttribute("rel", "noopener"), P.textContent = "Download recording", P.style.cssText = "color:#a5b4fc;font-size:12px;text-decoration:underline;", z.innerHTML = "<span>This recording couldn’t play here.</span>", z.appendChild(P), A.appendChild(_), A.appendChild(z), x.appendChild(A), pp(_, z);
  }
  function pp(g, x) {
    let S = !1, M = null;
    g.addEventListener("loadedmetadata", () => {
      if (!isFinite(g.duration) || isNaN(g.duration) || g.duration <= 0) {
        S = !0;
        try {
          g.currentTime = 1e101;
        } catch {
        }
        M = setTimeout(() => {
          if (S) {
            S = !1;
            try {
              g.currentTime = 0;
            } catch {
            }
          }
        }, 400);
      }
    }), g.addEventListener("durationchange", () => {
      if (S && isFinite(g.duration) && g.duration > 0) {
        S = !1, M && clearTimeout(M);
        try {
          g.currentTime = 0;
        } catch {
        }
      }
    }), g.addEventListener("error", () => {
      if (S) {
        S = !1, M && clearTimeout(M);
        try {
          g.currentTime = 0, g.style.display = "block", x && (x.style.display = "none");
          return;
        } catch {
        }
      }
      try {
        g.style.display = "none";
      } catch {
      }
      x && (x.style.display = "flex");
    });
  }
  function hp(g, x, S, M, C) {
    const A = c[g];
    if (!A) return;
    const _ = new Image();
    _.onload = () => {
      var V, ee;
      if (c[g] !== A) return;
      const z = document.createElement("canvas");
      z.width = Math.max(1, Math.round(M)), z.height = Math.max(1, Math.round(C));
      const P = z.getContext("2d");
      if (!P) return;
      P.drawImage(_, x, S, M, C, 0, 0, z.width, z.height);
      let F;
      try {
        F = z.toDataURL("image/png");
      } catch {
        return;
      }
      const U = ((V = He[g]) == null ? void 0 : V.length) ?? 0, K = Dn(g);
      c[g] = F, d[g] = t.compressImage ? t.compressImage(F) : Promise.resolve(F);
      const W = (ee = G[g]) == null ? void 0 : ee.shapes;
      Array.isArray(W) && W.length ? G[g] = { w: z.width, h: z.height, shapes: Om(W, -x, -S) } : delete G[g], (He[g] ?? (He[g] = [])).push(K), (nt[g] ?? (nt[g] = [])).push({ snap: K, mark: U }), Kt(g), ze();
    }, _.src = A;
  }
  function fp(g) {
    var P, F, U, K, W, V, ee;
    const x = a.getElementById("klavity-hero-stage"), S = a.getElementById("klavity-hero-tools");
    if (!x || !S) return;
    const M = c[g];
    if (!M) {
      ss();
      return;
    }
    mn(), x.innerHTML = "";
    const C = document.createElement("canvas");
    C.width = 1, C.height = 1, C.style.cssText = "display:block;max-width:100%;max-height:100%;object-fit:contain;cursor:crosshair;touch-action:none;background:#fff;border-radius:8px;box-shadow:0 12px 40px rgba(0,0,0,.5);";
    const A = new To(C, M), _ = (P = G[g]) == null ? void 0 : P.shapes;
    Array.isArray(_) && _.forEach((te) => A.shapes.push({ ...te })), x.appendChild(C);
    const z = new Image();
    z.onload = () => {
      !document.body.contains(s) || fe !== g || c[g] !== M || (C.width = z.naturalWidth || 1, C.height = z.naturalHeight || 1, A.redraw());
    }, z.src = M, A.redraw();
    {
      S.innerHTML = dp((((F = nt[g]) == null ? void 0 : F.length) ?? 0) > 0);
      const te = S.querySelector("#kl-hero-logo");
      te && (te.href = Lm(n.projectId));
      let J = "pen", we = "#ef4444", Be = 26, De = "black", rt = null;
      const Wt = S.querySelector("#kl-hero-textopts"), ut = () => {
        A.shapes.length ? G[g] = { w: C.width, h: C.height, shapes: A.shapes.map((N) => ({ ...N })) } : delete G[g], Kt(g);
      }, Q = (N) => {
        J = N, S.querySelectorAll("[data-tool]").forEach((B) => B.classList.toggle("kl-on", B.dataset.tool === N)), Wt && (Wt.hidden = N !== "text");
      }, xe = S.querySelector(".kl-hcolor-custom"), be = S.querySelector(".kl-hcolor-input"), X = (N, B) => {
        we = N, S.querySelectorAll("[data-color]").forEach((ne) => ne.classList.toggle("kl-on", ne === B)), xe && xe.classList.toggle("kl-on", xe === B);
      };
      if (S.querySelectorAll("[data-tool]").forEach((N) => N.addEventListener("click", () => Q(N.dataset.tool))), S.querySelectorAll("[data-color]").forEach((N) => N.addEventListener("click", () => X(N.dataset.color, N))), xe && be) {
        xe.addEventListener("click", () => be.click());
        const N = () => {
          xe.style.background = be.value, X(be.value, xe);
        };
        be.addEventListener("input", N), be.addEventListener("change", N);
      }
      const ue = S.querySelector(".kl-hmask-cb");
      ue && ue.addEventListener("change", () => {
        i = ue.checked;
      }), S.querySelectorAll("[data-outline]").forEach((N) => N.addEventListener("click", () => {
        De = N.dataset.outline, S.querySelectorAll("[data-outline]").forEach((B) => B.classList.toggle("kl-on", B === N));
      })), S.querySelectorAll("[data-size]").forEach((N) => N.addEventListener("click", () => {
        Be = Number(N.dataset.size), S.querySelectorAll("[data-size]").forEach((B) => B.classList.toggle("kl-on", B === N));
      })), S.querySelectorAll("[data-stroke]").forEach((N) => N.addEventListener("click", () => {
        A.strokeScale = Number(N.dataset.stroke) || 1, S.querySelectorAll("[data-stroke]").forEach((B) => B.classList.toggle("kl-on", B === N)), A.redraw();
      })), (U = S.querySelector("#kl-hero-undo")) == null || U.addEventListener("click", () => {
        Qe(g);
      }), (K = S.querySelector("#kl-hero-revert")) == null || K.addEventListener("click", () => {
        wt(g);
      }), (W = S.querySelector("#kl-hero-clear")) == null || W.addEventListener("click", () => {
        ce(g), A.clearAll(), ut();
      }), Q(J), X(we, S.querySelector("[data-color]"));
      const Le = (N) => {
        const B = C.getBoundingClientRect(), ne = Math.min(B.width / C.width, B.height / C.height) || 1, re = C.width * ne, ae = C.height * ne, je = (B.width - re) / 2, dt = (B.height - ae) / 2;
        return { x: (N.clientX - B.left - je) / ne, y: (N.clientY - B.top - dt) / ne };
      }, Dr = () => {
        const N = C.getBoundingClientRect();
        return Math.min(N.width / C.width, N.height / C.height) || 1;
      }, bp = (N, B, ne, re, ae, je) => N === "line" ? { type: "line", color: je, x1: B, y1: ne, x2: re, y2: ae } : N === "arrow" ? { type: "arrow", color: je, x1: B, y1: ne, x2: re, y2: ae } : N === "rect" ? { type: "rect", color: je, x: Math.min(B, re), y: Math.min(ne, ae), w: Math.abs(re - B), h: Math.abs(ae - ne) } : N === "circle" ? { type: "circle", color: je, x: (B + re) / 2, y: (ne + ae) / 2, rx: Math.abs(re - B) / 2, ry: Math.abs(ae - ne) / 2 } : N === "pixelate" ? { type: "pixelate", x: Math.min(B, re), y: Math.min(ne, ae), w: Math.abs(re - B), h: Math.abs(ae - ne) } : null;
      let it = 1, sr = 0, or = 0, Hn = null;
      const vp = (() => {
        try {
          return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
        } catch {
          return !1;
        }
      })(), jn = Mm(vp), os = () => {
        if (Hn) return Hn;
        const N = C.style.transform;
        return C.style.transform = "", Hn = C.getBoundingClientRect(), C.style.transform = N, Hn;
      }, tt = document.createElement("div");
      tt.className = "kl-minimap", tt.hidden = !0, tt.setAttribute("role", "navigation"), tt.setAttribute("aria-label", "Zoom navigator — click or drag to pan the image");
      const gn = document.createElement("img");
      gn.className = "kl-minimap-img", gn.alt = "", gn.draggable = !1, gn.src = M;
      const $r = document.createElement("div");
      $r.className = "kl-minimap-vp", tt.append(gn, $r), x.appendChild(tt);
      const za = () => {
        const N = C.width, B = C.height;
        if (it <= 1 || N < 2 || B < 2) {
          tt.hidden = !0;
          return;
        }
        const ne = os();
        if (!ne) {
          tt.hidden = !0;
          return;
        }
        const re = 148, ae = Math.min(re / N, re / B), je = Math.max(1, Math.round(N * ae)), dt = Math.max(1, Math.round(B * ae));
        tt.style.width = je + "px", tt.style.height = dt + "px";
        const Ot = x.getBoundingClientRect(), Ur = Tm(
          { left: Ot.left, top: Ot.top, right: Ot.right, bottom: Ot.bottom },
          { left: ne.left, top: ne.top, width: ne.width, height: ne.height },
          { panX: sr, panY: or },
          it,
          N,
          B
        );
        $r.style.left = Ur.x * ae + "px", $r.style.top = Ur.y * ae + "px", $r.style.width = Math.max(3, Ur.w * ae) + "px", $r.style.height = Math.max(3, Ur.h * ae) + "px", tt.hidden = !1;
      }, yn = () => {
        if (it === 1) {
          sr = 0, or = 0, C.style.transform = "", C.style.cursor = "crosshair", za();
          return;
        }
        C.style.transformOrigin = "0 0", C.style.transform = `translate(${sr}px,${or}px) scale(${it})`, C.style.cursor = "grab", za();
      }, Yn = (N, B, ne) => {
        const re = os();
        if (!re) return;
        const ae = it;
        if (it = Em(it * ne), it === ae) return;
        const je = Rm(N, B, { left: re.left, top: re.top, width: re.width, height: re.height }, ae, it, { panX: sr, panY: or });
        sr = je.panX, or = je.panY, C.style.transition = jn, yn();
      }, as = () => {
        const N = x.getBoundingClientRect();
        return { cx: N.left + N.width / 2, cy: N.top + N.height / 2 };
      }, kp = () => {
        it = 1, C.style.transition = jn, yn();
      };
      (V = S.querySelector("#kl-hero-zoomin")) == null || V.addEventListener("click", () => {
        const { cx: N, cy: B } = as();
        Yn(N, B, 1.25);
      }), (ee = S.querySelector("#kl-hero-zoomout")) == null || ee.addEventListener("click", () => {
        const { cx: N, cy: B } = as();
        Yn(N, B, 0.8);
      });
      const wp = (N, B) => {
        const ne = os();
        if (!ne) return;
        const re = x.getBoundingClientRect(), ae = _m(N, B, { left: re.left, top: re.top, right: re.right, bottom: re.bottom }, { left: ne.left, top: ne.top, width: ne.width, height: ne.height }, it, C.width);
        sr = ae.panX, or = ae.panY, C.style.transition = jn, yn();
      };
      let Vn = !1;
      const Da = (N, B) => {
        const ne = tt.getBoundingClientRect(), { ix: re, iy: ae } = Am(N - ne.left, B - ne.top, ne.width, ne.height, C.width, C.height);
        wp(re, ae);
      };
      tt.addEventListener("pointerdown", (N) => {
        Vn = !0;
        try {
          tt.setPointerCapture(N.pointerId);
        } catch {
        }
        Da(N.clientX, N.clientY), N.preventDefault(), N.stopPropagation();
      }), tt.addEventListener("pointermove", (N) => {
        Vn && (Da(N.clientX, N.clientY), N.preventDefault());
      });
      const $a = (N) => {
        if (Vn) {
          Vn = !1;
          try {
            tt.releasePointerCapture(N.pointerId);
          } catch {
          }
        }
      };
      tt.addEventListener("pointerup", $a), tt.addEventListener("pointercancel", $a), x.addEventListener("wheel", (N) => {
        J !== "crop" && (N.preventDefault(), Yn(N.clientX, N.clientY, Cm(N.deltaY)));
      }, { passive: !1 }), x.addEventListener("dblclick", () => {
        it = 1, C.style.transition = jn, yn();
      });
      let xp = A.shapes.reduce((N, B) => B.type === "count" ? Math.max(N, B.n) : N, 0), ar = !1, gt = 0, yt = 0, vr = [], Fr = !1, Fa = 0, Ua = 0, Ba = 0, qa = 0, bt = null, bn = { x: 0, y: 0 }, st = null;
      const Sp = () => Math.max(14, A.computeFontSize() * 0.6), Wa = (N, B) => {
        for (let ne = A.shapes.length - 1; ne >= 0; ne--) {
          const re = A.shapes[ne];
          if (re.type !== "text") continue;
          const ae = A.textBounds(re);
          if (!ae) continue;
          const je = Sp();
          if (N >= ae.x + ae.w - je && N <= ae.x + ae.w + je && B >= ae.y + ae.h - je && B <= ae.y + ae.h + je)
            return { shape: re, mode: "resize" };
          const dt = 6;
          if (N >= ae.x - dt && N <= ae.x + ae.w + dt && B >= ae.y - dt && B <= ae.y + ae.h + dt)
            return { shape: re, mode: "move" };
        }
        return null;
      };
      C.addEventListener("pointerdown", (N) => {
        if (N.shiftKey && it > 1) {
          Fr = !0, Fa = N.clientX, Ua = N.clientY, Ba = sr, qa = or, C.style.transition = "none", C.style.cursor = "grabbing";
          try {
            C.setPointerCapture(N.pointerId);
          } catch {
          }
          N.preventDefault();
          return;
        }
        const B = Le(N);
        if (gt = B.x, yt = B.y, J === "crop") {
          ar = !0;
          try {
            C.setPointerCapture(N.pointerId);
          } catch {
          }
          bn = { x: N.clientX, y: N.clientY }, bt = document.createElement("div"), bt.style.cssText = "position:absolute;border:2px dashed #6366f1;background:rgba(99,102,241,.14);pointer-events:none;z-index:6;left:0;top:0;width:0;height:0;", x.appendChild(bt);
          return;
        }
        if (J === "text") {
          const ne = Wa(B.x, B.y);
          if (ne) {
            ce(g), st = { shape: ne.shape, mode: ne.mode, grabX: B.x, grabY: B.y, origX: ne.shape.x, origY: ne.shape.y, origSize: ne.shape.size ?? A.computeFontSize() };
            try {
              C.setPointerCapture(N.pointerId);
            } catch {
            }
            C.style.cursor = ne.mode === "resize" ? "nwse-resize" : "move", N.preventDefault();
            return;
          }
          const re = document.createElement("input"), ae = De === "none" ? "none" : `0 0 2px ${De}, 0 0 2px ${De}`, je = Dr(), dt = Math.max(6, Be * je), Ot = Be, Ur = De;
          re.style.cssText = `position:fixed;left:${N.clientX}px;top:${N.clientY}px;padding:0;margin:0;line-height:1;box-sizing:content-box;background:transparent;border:0;color:${we};font-size:${dt}px;font-family:sans-serif;font-weight:700;text-shadow:${ae};outline:1px dashed ${we};z-index:2147483647;min-width:80px;`, document.body.appendChild(re), rt = re, requestAnimationFrame(() => {
            document.body.contains(re) && re.focus();
          }), re.addEventListener("blur", () => {
            rt = null, re.value.trim() && (ce(g), A.addShape({ type: "text", color: we, x: gt, y: yt, text: re.value.trim(), size: Ot, outline: Ur }), ut()), Ge(re);
          }, { once: !0 }), re.addEventListener("keydown", (ls) => {
            ls.key === "Enter" && re.blur(), ls.key === "Escape" && (re.value = "", re.blur()), ls.stopPropagation();
          });
          return;
        }
        if (J === "count") {
          ce(g), A.addShape({ type: "count", color: we, x: B.x, y: B.y, n: ++xp }), ut();
          return;
        }
        ar = !0;
        try {
          C.setPointerCapture(N.pointerId);
        } catch {
        }
        J === "pen" && (vr = [B]);
      }), C.addEventListener("pointermove", (N) => {
        if (Fr) {
          C.style.transition = "none", sr = Ba + (N.clientX - Fa), or = qa + (N.clientY - Ua), yn(), C.style.cursor = "grabbing";
          return;
        }
        if (st) {
          const re = Le(N);
          st.mode === "move" ? (st.shape.x = st.origX + (re.x - st.grabX), st.shape.y = st.origY + (re.y - st.grabY)) : st.shape.size = Math.max(10, Math.min(240, st.origSize + (re.y - st.grabY))), A.redraw();
          return;
        }
        if (J === "text" && !ar) {
          const re = Le(N), ae = Wa(re.x, re.y);
          C.style.cursor = ae ? ae.mode === "resize" ? "nwse-resize" : "move" : "crosshair";
        }
        if (!ar) return;
        if (J === "pen") {
          vr.push(Le(N)), vr.length > 1 && A.drawPreview({ type: "pen", color: we, points: vr });
          return;
        }
        if (J === "crop" && bt) {
          const re = x.getBoundingClientRect(), ae = Math.min(bn.x, N.clientX), je = Math.min(bn.y, N.clientY), dt = Math.max(bn.x, N.clientX), Ot = Math.max(bn.y, N.clientY);
          bt.style.left = ae - re.left + "px", bt.style.top = je - re.top + "px", bt.style.width = dt - ae + "px", bt.style.height = Ot - je + "px";
          return;
        }
        const B = Le(N), ne = bp(J, gt, yt, B.x, B.y, we);
        ne && A.drawPreview(ne);
      }), C.addEventListener("pointerup", (N) => {
        if (Fr) {
          Fr = !1, C.style.cursor = it > 1 ? "grab" : "crosshair";
          try {
            C.releasePointerCapture(N.pointerId);
          } catch {
          }
          return;
        }
        if (st) {
          st = null;
          try {
            C.releasePointerCapture(N.pointerId);
          } catch {
          }
          C.style.cursor = "crosshair", A.redraw(), ut();
          return;
        }
        if (!ar) return;
        ar = !1;
        try {
          C.releasePointerCapture(N.pointerId);
        } catch {
        }
        const B = Le(N);
        if (J === "crop") {
          bt && (Ge(bt), bt = null);
          const ae = Math.max(0, Math.min(gt, B.x)), je = Math.max(0, Math.min(yt, B.y)), dt = Math.abs(B.x - gt), Ot = Math.abs(B.y - yt);
          dt > 4 && Ot > 4 && hp(g, ae, je, dt, Ot);
          return;
        }
        const ne = J === "pixelate" && Math.abs(B.x - gt) > 4 && Math.abs(B.y - yt) > 4;
        (J === "pen" && vr.length > 1 || J === "line" || J === "rect" || J === "circle" || J === "arrow" || ne) && ce(g), J === "pen" && vr.length > 1 ? A.addShape({ type: "pen", color: we, points: vr }) : J === "line" ? A.addShape({ type: "line", color: we, x1: gt, y1: yt, x2: B.x, y2: B.y }) : J === "rect" ? A.addShape({ type: "rect", color: we, x: Math.min(gt, B.x), y: Math.min(yt, B.y), w: Math.abs(B.x - gt), h: Math.abs(B.y - yt) }) : J === "circle" ? A.addShape({ type: "circle", color: we, x: (gt + B.x) / 2, y: (yt + B.y) / 2, rx: Math.abs(B.x - gt) / 2, ry: Math.abs(B.y - yt) / 2 }) : J === "arrow" ? A.addShape({ type: "arrow", color: we, x1: gt, y1: yt, x2: B.x, y2: B.y }) : ne && A.addShape({ type: "pixelate", x: Math.min(gt, B.x), y: Math.min(yt, B.y), w: Math.abs(B.x - gt), h: Math.abs(B.y - yt) }), ut();
      }), C.addEventListener("pointercancel", (N) => {
        try {
          C.releasePointerCapture(N.pointerId);
        } catch {
        }
        bt && (Ge(bt), bt = null), Fr && (Fr = !1, C.style.cursor = it > 1 ? "grab" : "crosshair"), st && (st = null, C.style.cursor = "crosshair", A.redraw(), ut()), ar && (ar = !1, A.redraw());
      });
      const Ha = { p: "pen", l: "line", r: "rect", o: "circle", a: "arrow", t: "text", c: "count", b: "pixelate", k: "crop" };
      oe = (N) => {
        if (!document.body.contains(s)) {
          mn();
          return;
        }
        if (rt && document.body.contains(rt)) return;
        const B = typeof N.composedPath == "function" && N.composedPath()[0] || N.target;
        if (B && (B.tagName === "INPUT" || B.tagName === "TEXTAREA" || B.tagName === "SELECT" || B.isContentEditable)) return;
        if ((N.metaKey || N.ctrlKey) && N.key.toLowerCase() === "z") {
          N.preventDefault(), Qe(g);
          return;
        }
        if (N.metaKey || N.ctrlKey || N.altKey) return;
        const ne = N.key.toLowerCase();
        if (ne === "z") {
          if (N.preventDefault(), it > 1) kp();
          else {
            const { cx: re, cy: ae } = as();
            Yn(re, ae, 2);
          }
          return;
        }
        Ha[ne] && (N.preventDefault(), Q(Ha[ne]));
      }, document.addEventListener("keydown", oe, { capture: !0 });
    }
  }
  function mp(g) {
    const x = c[g], S = new Image();
    S.onload = () => {
      const M = document.createElement("canvas");
      M.width = S.naturalWidth, M.height = S.naturalHeight;
      const C = new To(M, x);
      C.redraw();
      const A = document.createElement("div");
      A.style.cssText = "position:fixed;inset:0;background:#000;z-index:2147483647;display:flex;flex-direction:column;pointer-events:all;";
      const _ = document.createElement("div");
      _.className = "kl-edtb", _.style.cssText = "display:flex;align-items:center;gap:8px;padding:8px;background:#1e1e2e;flex-wrap:wrap;", _.innerHTML = `
        <button data-tool="pen" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${le("pencil", { size: 14 })} Pen</button>
        <button data-tool="rect" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${le("square", { size: 14 })} Rect</button>
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
        <button id="klavity-clear-ann" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${le("trash-2", { size: 14 })} Clear</button>
        <button id="klavity-save-ann" style="padding:6px 10px;background:#89b4fa;color:#1e1e2e;border:none;border-radius:4px;cursor:pointer;font-weight:700;">${le("check", { label: "Save", size: 14 })} Save</button>
        <button id="klavity-cancel-ann" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${le("x", { size: 14 })}</button>
      `, M.style.cssText = "cursor:crosshair;display:block;margin:12px auto;touch-action:none;background:#fff;border-radius:4px;outline:1px solid rgba(255,255,255,.12);outline-offset:-1px;box-shadow:0 12px 44px rgba(0,0,0,.55);";
      const z = document.createElement("div");
      z.style.cssText = "flex:1;min-height:0;overflow:auto;display:block;box-shadow:inset 0 1px 0 rgba(255,255,255,.04);", z.appendChild(M);
      const P = document.createElement("style");
      P.textContent = ".kl-edtb button{transition:transform .15s cubic-bezier(.34,1.56,.64,1),background .15s ease;will-change:transform;}.kl-edtb button:hover{transform:translateY(-1px) scale(1.02);background:#45475a;}.kl-edtb button[data-color]:hover{transform:scale(1.14);background:initial;}.kl-edtb button:active{transform:scale(.96);}.kl-edtb button:focus-visible{outline:2px solid #89b4fa;outline-offset:2px;}.kl-edtb .kl-zb{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:34px;padding:0 9px;background:#313244;color:#cdd6f4;border:none;border-radius:8px;cursor:pointer;font-size:15px;font-weight:600;line-height:1;}.kl-edtb .kl-zb:hover{background:#45475a;}@media (prefers-reduced-motion:reduce){.kl-edtb button{transition:none;}.kl-edtb button:hover,.kl-edtb button:active,.kl-edtb button[data-color]:hover{transform:none;}}", A.append(P, _, z), a.appendChild(A), mn();
      let F = 1;
      const U = (X) => Math.max(0.05, Math.min(5, X || 1));
      function K(X) {
        F = U(X), M.style.width = Math.round(M.width * F) + "px", M.style.height = Math.round(M.height * F) + "px";
        const ue = _.querySelector("#klavity-zoom-pct");
        ue && (ue.textContent = Math.round(F * 100) + "%");
      }
      const W = () => Math.max(1, z.clientWidth - 24) / M.width, V = () => Math.min(Math.max(1, z.clientWidth - 24) / M.width, Math.max(1, z.clientHeight - 24) / M.height), ee = M.height / M.width > Math.max(1, z.clientHeight) / Math.max(1, z.clientWidth);
      K(ee ? W() : V()), _.querySelector("#klavity-zoom-in").addEventListener("click", () => K(F * 1.25)), _.querySelector("#klavity-zoom-out").addEventListener("click", () => K(F / 1.25)), _.querySelector("#klavity-fit-width").addEventListener("click", () => K(W())), _.querySelector("#klavity-fit-page").addEventListener("click", () => K(V()));
      let te = "rect", J = "#ef4444", we = !1, Be = [], De = 0, rt = 0;
      function Wt(X) {
        te = X, _.querySelectorAll("[data-tool]").forEach((ue) => {
          const Le = ue.dataset.tool === X;
          ue.style.background = Le ? "#585b70" : "#313244", ue.style.outline = Le ? "2px solid #89b4fa" : "none";
        });
      }
      _.querySelectorAll("[data-tool]").forEach((X) => X.addEventListener("click", () => Wt(X.dataset.tool))), _.querySelectorAll("[data-color]").forEach((X) => X.addEventListener("click", () => {
        J = X.dataset.color;
      }));
      {
        const X = _.querySelector("#klavity-color-custom"), ue = _.querySelector("#klavity-color-input");
        if (X && ue) {
          X.addEventListener("click", () => ue.click());
          const Le = () => {
            X.style.background = ue.value, J = ue.value;
          };
          ue.addEventListener("input", Le), ue.addEventListener("change", Le);
        }
      }
      _.querySelector("#klavity-undo").addEventListener("click", () => C.undo()), _.querySelector("#klavity-clear-ann").addEventListener("click", () => C.clearAll());
      const ut = { p: "pen", r: "rect", c: "circle", a: "arrow", t: "text" };
      function Q(X) {
        const ue = X.target;
        if (ue && (ue.tagName === "INPUT" || ue.tagName === "TEXTAREA" || ue.isContentEditable)) return;
        if (X.key === "Escape") {
          X.stopPropagation(), xe();
          return;
        }
        if ((X.metaKey || X.ctrlKey) && X.key.toLowerCase() === "z") {
          X.preventDefault(), C.undo();
          return;
        }
        if (X.metaKey || X.ctrlKey || X.altKey) return;
        const Le = X.key.toLowerCase();
        ut[Le] ? (X.preventDefault(), Wt(ut[Le])) : Le === "u" && (X.preventDefault(), C.undo());
      }
      function xe() {
        document.removeEventListener("keydown", Q, { capture: !0 }), Ge(A), _a();
      }
      document.addEventListener("keydown", Q, { capture: !0 }), Wt(te), _.querySelector("#klavity-save-ann").addEventListener("click", async () => {
        ce(g), C.shapes.length ? G[g] = { w: M.width, h: M.height, shapes: C.shapes.map((X) => ({ ...X })) } : delete G[g], Kt(g), xe(), ze();
      }), _.querySelector("#klavity-cancel-ann").addEventListener("click", () => xe());
      function be(X) {
        const ue = M.getBoundingClientRect();
        return { x: (X.clientX - ue.left) / ue.width * M.width, y: (X.clientY - ue.top) / ue.height * M.height };
      }
      M.addEventListener("pointerdown", (X) => {
        we = !0;
        const ue = be(X);
        if ({ x: De, y: rt } = ue, te === "pen" && (Be = [ue]), te === "text") {
          we = !1;
          const Le = document.createElement("input");
          Le.style.cssText = `position:fixed;left:${X.clientX}px;top:${X.clientY}px;background:transparent;border:1px dashed ${J};color:${J};font-size:16px;outline:none;z-index:9999999;min-width:80px;`, document.body.appendChild(Le), requestAnimationFrame(() => {
            document.body.contains(Le) && Le.focus();
          }), Le.addEventListener("blur", () => {
            Le.value.trim() && C.addShape({ type: "text", color: J, x: De, y: rt, text: Le.value.trim() }), Ge(Le);
          }, { once: !0 }), Le.addEventListener("keydown", (Dr) => {
            Dr.key === "Enter" && Le.blur(), Dr.stopPropagation();
          });
        }
      }), M.addEventListener("pointermove", (X) => {
        we && te === "pen" && Be.push(be(X));
      }), M.addEventListener("pointerup", (X) => {
        if (!we) return;
        we = !1;
        const ue = be(X);
        te === "pen" && Be.length > 1 ? C.addShape({ type: "pen", color: J, points: Be }) : te === "rect" ? C.addShape({ type: "rect", color: J, x: Math.min(De, ue.x), y: Math.min(rt, ue.y), w: Math.abs(ue.x - De), h: Math.abs(ue.y - rt) }) : te === "circle" ? C.addShape({ type: "circle", color: J, x: (De + ue.x) / 2, y: (rt + ue.y) / 2, rx: Math.abs(ue.x - De) / 2, ry: Math.abs(ue.y - rt) / 2 }) : te === "arrow" && C.addShape({ type: "arrow", color: J, x1: De, y1: rt, x2: ue.x, y2: ue.y });
      });
    }, S.src = x;
  }
  function gp(g, x, S) {
    const M = document.createElement("div");
    M.style.cssText = "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:all;";
    const C = document.createElement("div");
    C.className = "klavity-sent";
    const A = document.createElement("div");
    A.className = "kl-sent-check", A.innerHTML = le("check", { label: "Sent", size: 22 }), C.appendChild(A);
    const _ = document.createElement("h2");
    _.textContent = S && S.filed > 1 ? `${S.filed} reports sent` : "Report sent", C.appendChild(_);
    const z = document.createElement("p");
    if (z.textContent = n.thankYou || "We filed it and emailed you a copy.", C.appendChild(z), S && S.failed > 0) {
      const P = document.createElement("p");
      P.textContent = `${S.failed} of the split tickets couldn't be sent — please report ${S.failed === 1 ? "it" : "them"} again.`, C.appendChild(P);
    }
    if (g) {
      const P = document.createElement("div");
      P.className = "klavity-ref";
      const F = document.createElement("span");
      F.textContent = "Filed as";
      const U = document.createElement("code");
      U.textContent = ul(g, x), P.append(F, U);
      const K = dl(x);
      if (K) {
        const W = document.createElement("a");
        W.href = K, W.target = "_blank", W.rel = "noopener", W.textContent = "Open in Klavity", P.appendChild(W);
      }
      C.appendChild(P);
    }
    M.appendChild(C), Ge(xt), a.appendChild(M), ma(C, zn);
  }
  function yp(g, x, S) {
    const { copy: M, onLead: C } = S;
    se.innerHTML = "";
    const A = document.createElement("div");
    A.className = "klavity-success";
    const _ = document.createElement("h2");
    if (_.innerHTML = M.headline, A.appendChild(_), M.body) {
      const P = document.createElement("p");
      P.textContent = M.body, A.appendChild(P);
    }
    if (g) {
      const P = document.createElement("div");
      P.className = "klavity-ref";
      const F = document.createElement("span");
      F.textContent = "Filed as";
      const U = document.createElement("code");
      U.textContent = ul(g, x), P.append(F, U);
      const K = dl(x);
      if (K) {
        const W = document.createElement("a");
        W.href = K, W.target = "_blank", W.rel = "noopener", W.textContent = "Open in Klavity", P.appendChild(W);
      }
      A.appendChild(P);
    }
    const z = () => ma(se, fr);
    if (M.showEmail) {
      const P = document.createElement("div");
      P.className = "klavity-lead";
      const F = document.createElement("input");
      F.type = "email", F.placeholder = "you@company.com";
      const U = document.createElement("button"), K = M.emailLabel;
      U.textContent = K;
      const W = document.createElement("div");
      W.className = "klavity-lead-err", W.setAttribute("role", "alert"), W.style.display = "none";
      const V = async () => {
        const ee = F.value.trim();
        if (!ee || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(ee)) {
          W.textContent = "Please enter a valid email so we can reach you.", W.style.display = "block", F.focus();
          return;
        }
        U.disabled = !0, U.textContent = "Saving…", W.style.display = "none";
        try {
          C && await C(g, ee);
        } catch (J) {
          try {
            console.warn("[Klavity] lead capture failed:", (J == null ? void 0 : J.message) || J);
          } catch {
          }
          W.textContent = "Couldn't save your email — please try again.", W.style.display = "block", U.disabled = !1, U.textContent = "Retry", F.focus();
          return;
        }
        const te = document.createElement("div");
        te.className = "klavity-thanks", te.textContent = "Thanks — we'll be in touch.", Ge(W), P.replaceWith(te), M.showCta || z();
      };
      U.addEventListener("click", V), F.addEventListener("keydown", (ee) => {
        ee.key === "Enter" && V();
      }), P.append(F, U), A.appendChild(P), A.appendChild(W);
    }
    if (M.showCta && M.ctaUrl) {
      const P = document.createElement("a");
      P.className = "klavity-cta", P.href = M.ctaUrl, P.target = "_blank", P.rel = "noopener", P.textContent = M.ctaText, A.appendChild(P);
    }
    if (se.appendChild(A), !n.whiteLabel) {
      const P = document.createElement("div");
      P.className = "klavity-pb";
      const F = document.createElement("a");
      F.href = Tu("https://klavity.in", {
        campaign: "powered_by",
        medium: n.attributionMedium,
        ref: n.projectId
      }), F.target = "_blank", F.rel = "noopener", F.textContent = "Klavity", P.append("Powered by ", F), se.appendChild(P);
    }
    !M.showEmail && !M.showCta && z();
  }
  if (t.autoCaptureOnOpen) {
    let g = 0;
    try {
      g = document.getElementsByTagName("*").length;
    } catch {
      g = 0;
    }
    const x = g <= T;
    if (x || pl(t) === "screen") {
      if (l = !0, ze(), pl(t) === "screen")
        return (async () => {
          if (await ns({ viewport: !0 })) {
            l = !1, ze();
            return;
          }
          if (c.length) {
            l = !1, ze();
            return;
          }
          if (!x) {
            y = !0, l = !1, ze();
            return;
          }
          if (l = !0, ze(), t.onCaptureViewport) {
            Ma(null).catch(() => {
              l = !1, ze();
            });
            return;
          }
          t.onCaptureFull().then((A) => {
            const { dataUrl: _, quality: z, suggestSharp: P, blank: F } = Ht(A);
            if (l = !1, F && c.length === 0) {
              ji();
              return;
            }
            St(_, z, void 0, !0, !!P), qt(br);
          }).catch(() => {
            l = !1, ze();
          });
        })(), ua;
      const S = () => {
        if (t.onCaptureViewport) {
          Ma(null).catch(() => {
            l = !1, ze();
          });
          return;
        }
        t.onCaptureFull().then((C) => {
          const { dataUrl: A, quality: _, suggestSharp: z, blank: P } = Ht(C);
          if (l = !1, P && c.length === 0) {
            ji();
            return;
          }
          St(A, _, void 0, !0, !!z), qt(br);
        }).catch(() => {
          l = !1, ze();
        });
      }, M = window.requestIdleCallback;
      typeof M == "function" ? M(() => S(), { timeout: 1200 }) : requestAnimationFrame(() => setTimeout(S, 0));
    } else
      y = !0, ze();
  }
  return ua;
}
function Vm(e, t) {
  const r = document.createElement("div");
  r.style.cssText = "position:fixed;inset:0;cursor:crosshair;z-index:2147483646;user-select:none;", r.setAttribute("data-klavity-region-overlay", ""), document.body.appendChild(r);
  const n = document.createElement("div");
  n.textContent = "Drag to select an area · Esc to cancel", n.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-family:system-ui;font-size:14px;background:rgba(0,0,0,.7);padding:8px 16px;border-radius:6px;pointer-events:none;z-index:2147483647;", document.body.appendChild(n);
  let i = 0, s = 0, a = !1;
  function c() {
    document.removeEventListener("keydown", l, { capture: !0 }), Ge(r), Ge(n);
  }
  function l(d) {
    d.key === "Escape" && (d.stopPropagation(), c(), t());
  }
  document.addEventListener("keydown", l, { capture: !0 }), r.addEventListener("pointerdown", (d) => {
    a = !0, i = d.clientX, s = d.clientY, Ge(n);
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
const Gm = 2e4;
async function hl(e) {
  if (e.type === "image/heic" || e.type === "image/heif" || e.name.endsWith(".heic") || e.name.endsWith(".heif")) {
    let t;
    try {
      const r = await Promise.race([
        (async () => {
          const n = (await import("./heic2any-D6xzzX7R.js").then((i) => i.h)).default;
          return await n({ blob: e, toType: "image/jpeg", quality: 0.85 });
        })(),
        new Promise((n, i) => {
          t = setTimeout(() => i(new Error("heic-convert-timeout")), Gm);
        })
      ]);
      return fl(r);
    } catch {
    } finally {
      t && clearTimeout(t);
    }
  }
  return fl(e);
}
const Xm = 3e4;
function fl(e) {
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
    }, Xm), a = (c) => {
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
const Km = {
  frustrated: { accent: "#e8849a", mark: "vein", label: "Frustrated" },
  confused: { accent: "#e8a24a", mark: "q", label: "Confused" },
  satisfied: { accent: "#7fd1c4", mark: "check", label: "Satisfied" },
  delighted: { accent: "#9fd6a0", mark: "spark", label: "Delighted" },
  neutral: { accent: "#8a8276", mark: "dots", label: "Neutral" },
  inspired: { accent: "#8b8bf5", mark: "bulb", label: "Inspired" },
  alarmed: { accent: "#ef6b6b", mark: "bang", label: "Alarmed" }
};
function Jm(e) {
  const t = (e || "").trim().split(/\s+/).filter(Boolean);
  return t.length === 0 ? "?" : t.length === 1 ? t[0].slice(0, 2).toUpperCase() : (t[0][0] + t[t.length - 1][0]).toUpperCase();
}
function Zm(e) {
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
const Qm = {
  vein: "ksim-m-vein",
  spark: "ksim-m-spark",
  bulb: "ksim-m-bulb",
  bang: "ksim-m-bang",
  q: "ksim-m-q",
  dots: "ksim-m-dots",
  check: "ksim-m-check"
};
function wr(e) {
  return String(e).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function eg(e) {
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
  } = e, o = wr(e.initials || Jm(t)), h = i !== "none" ? Km[i] : null, p = h ? `<span class="ksim-mark ${l ? Qm[h.mark] : ""}" style="color:${wr(h.accent)}">${Zm(h.mark)}</span>` : "", m = r ? `<span class="ksim-head ksim-photo"><img src="${wr(r)}" alt="${wr(t)}" loading="lazy" onerror="this.style.display='none';this.parentNode.classList.add('ksim-fallback')"><span class="ksim-ini">${o}</span></span>` : `<span class="ksim-head ksim-mono"><span class="ksim-ini">${o}</span>${a ? '<span class="ksim-eyes"><i></i><i></i></span>' : ""}</span>`, f = c ? '<span class="ksim-legs"><i></i><i></i></span>' : "", y = ["ksim", l ? "is-animated" : "", d].filter(Boolean).join(" "), E = `--ksim-persona:${wr(n)};--ksim-size:${s}px;` + (h ? `--ksim-accent:${wr(h.accent)};` : "");
  return `<span class="${y}" style="${E}" data-emotion="${i}" title="${wr(t)}">${p}${m}${f}</span>`;
}
function tg(e) {
  const t = document.createElement("template");
  return t.innerHTML = eg(e).trim(), t.content.firstElementChild;
}
const rg = `
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
function ng(e = document) {
  var n;
  const t = e.head ?? e ?? null;
  if (!t || (n = t.querySelector) != null && n.call(t, "style[data-ksim]")) return;
  const r = document.createElement("style");
  r.setAttribute("data-ksim", ""), r.textContent = rg, t.appendChild(r);
}
function _o(e, t) {
  const r = e.indexOf(","), n = e.slice(0, r), i = e.slice(r + 1), s = /data:([^;,]+)/.exec(n), a = t || (s ? s[1] : "application/octet-stream");
  if (/;base64/i.test(n)) {
    const c = atob(i), l = new Uint8Array(c.length);
    for (let d = 0; d < c.length; d++) l[d] = c.charCodeAt(d);
    return new Blob([l], { type: a });
  }
  return new Blob([decodeURIComponent(i)], { type: a });
}
function ig(e) {
  if (!e || typeof e != "object") return !1;
  if (typeof e.selector == "string" && e.selector.trim() !== "") return !0;
  const t = (r) => r && Array.isArray(r.shapes) && r.shapes.length > 0;
  if (t(e)) return !0;
  if (e.byIndex && typeof e.byIndex == "object") {
    for (const r of Object.keys(e.byIndex)) if (t(e.byIndex[r])) return !0;
  }
  return !1;
}
function sg(e) {
  const t = new FormData();
  if (t.set("type", e.type ?? "bug"), t.set("description", e.description), t.set("page_url", e.pageUrl), e.context && t.set("context", JSON.stringify(e.context)), e.projectId && t.set("project_id", e.projectId), e.replayEvents && e.replayEvents.length && t.set("replay_events", JSON.stringify(e.replayEvents)), e.title && t.set("title", e.title), e.referrer && t.set("referrer", e.referrer), e.reporter && Object.keys(e.reporter).length && t.set("reporter", JSON.stringify(e.reporter)), e.clientInfo && Object.keys(e.clientInfo).length && t.set("client_info", JSON.stringify(e.clientInfo)), e.files)
    for (const r of e.files)
      try {
        t.append("files", r.blob ?? _o(r.dataUrl, r.type), r.name);
      } catch {
      }
  if (e.recordings && e.recordings.length) {
    const r = [];
    for (const n of e.recordings)
      try {
        const i = (n.mime || "").includes("mp4") ? "mp4" : "webm", s = n.mime && /^video\//.test(n.mime) ? n.mime : `video/${i}`;
        t.append("recording", _o(n.dataUrl, s), `recording-${n.id}.${i}`), r.push({ id: n.id, durationMs: n.durationMs, width: n.width, height: n.height, bytes: n.bytes, mime: n.mime, screenOnly: n.screenOnly });
      } catch {
      }
    r.length && t.set("recording_meta", JSON.stringify(r));
  }
  return ig(e.annotations) && t.set("annotations_json", JSON.stringify(e.annotations)), t;
}
async function og(e) {
  try {
    const t = e.get("replay_events");
    if (typeof t != "string" || !t || typeof CompressionStream != "function") return;
    const r = await new Response(new Blob([t]).stream().pipeThrough(new CompressionStream("gzip"))).blob();
    if (!r.size || r.size >= t.length) return;
    e.delete("replay_events"), e.set("replay_events_gz", new Blob([r], { type: "application/gzip" }), "replay.json.gz");
  } catch {
  }
}
async function ag(e) {
  const { settings: t, type: r, description: n, context: i, screenshots: s, projectId: a, replayEvents: c } = e, l = sg({
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
  await og(l), e.reporterEmail && l.set("reporter_email", e.reporterEmail);
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
        l.append("screenshot_thumbs", _o(u), "thumb.jpg");
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
const lg = (
  // entrance keyframes: spring scale-in from top-left (cursor anchor)
  "@keyframes klm-in{0%{opacity:0;transform:scale(.9) translateY(-6px)}100%{opacity:1;transform:scale(1) translateY(0)}}@keyframes klm-row-in{0%{opacity:0;transform:translateY(8px) scale(.97)}100%{opacity:1;transform:translateY(0) scale(1)}}@keyframes klm-shine{0%{transform:translateX(-130%)}100%{transform:translateX(240%)}}@keyframes klm-spin{to{transform:rotate(360deg)}}.klm-menu{animation:klm-in .34s cubic-bezier(.34,1.56,.64,1) both}.klm-card{position:relative;display:flex;align-items:center;gap:8px;width:100%;border:0;cursor:pointer;text-align:left;padding:8px 10px;border-radius:12px;color:#2a2342;font-family:inherit;background:linear-gradient(180deg,rgba(255,255,255,.72),rgba(252,250,246,.55));box-shadow:0 1px 2px rgba(40,25,70,.06),inset 0 0 0 1px rgba(99,102,241,.08);transition:scale .14s cubic-bezier(.2,0,0,1),box-shadow .2s ease,background .2s ease;animation:klm-row-in .42s cubic-bezier(.16,1,.3,1) both}.klm-card:hover{scale:1.015;box-shadow:0 5px 14px -3px rgba(99,102,241,.3),inset 0 0 0 1px rgba(99,102,241,.16)}.klm-card:active{scale:.96}.klm-card:focus-visible{outline:2px solid #6366f1;outline-offset:2px}.klm-chip{flex:none;width:32px;height:32px;border-radius:8px;display:grid;place-items:center;color:#5b51c9;background:rgba(99,102,241,.12);transition:transform .2s cubic-bezier(.34,1.56,.64,1)}.klm-chip svg{width:16px;height:16px;display:block}.klm-card:hover .klm-chip{transform:scale(1.1) rotate(-5deg)}.klm-body{display:flex;flex-direction:column;gap:2px;min-width:0}.klm-t{font-size:13px;font-weight:650;letter-spacing:-.01em;line-height:1.2}.klm-d{font-size:10.5px;line-height:1.35;color:#7c7793;text-wrap:pretty}.klm-go{margin-left:auto;flex:none;color:#b6afce;display:inline-flex;transition:transform .2s cubic-bezier(.2,0,0,1)}.klm-go svg{width:14px;height:14px;display:block}.klm-card:hover .klm-go{transform:translateX(3px)}.klm-hint{margin-left:auto;flex:none;font-family:ui-monospace,monospace;font-size:10px;color:#9a93a6;background:rgba(40,30,60,.06);padding:3px 8px;border-radius:12px;text-align:center;line-height:1.32}.klm-card.primary{background:linear-gradient(160deg,#6d6bf3,#5b51d8);color:#fff;box-shadow:0 6px 16px -4px rgba(79,70,229,.45),inset 0 1px 0 rgba(255,255,255,.3)}.klm-card.primary:hover{box-shadow:0 9px 22px -4px rgba(79,70,229,.55),inset 0 1px 0 rgba(255,255,255,.35)}.klm-card.primary .klm-chip{background:rgba(255,255,255,.22);color:#fff}.klm-card.primary .klm-d{color:rgba(255,255,255,.85)}.klm-card.primary .klm-go{color:rgba(255,255,255,.72)}.klm-card.muted{background:linear-gradient(180deg,rgba(250,248,244,.62),rgba(243,236,225,.5))}.klm-card.muted .klm-chip{background:rgba(40,30,60,.06);color:#8a8390}.klm-card.muted .klm-t{color:#5d5870}.klm-card.muted .klm-d{color:#9a93a6}.klm-sims-row{display:flex;align-items:center;justify-content:space-between;padding:2px 4px 4px;gap:6px;min-height:30px}.klm-sims-chips{display:flex;align-items:center;gap:0}.klm-sim-chip{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font-size:9px;font-weight:700;color:#fff;flex-shrink:0;border:1.5px solid rgba(255,255,255,.65);margin-left:-3px}.klm-sims-chips .klm-sim-chip:first-child{margin-left:0}.klm-issue-pill{font-size:10px;font-weight:650;color:#ef4444;background:rgba(239,68,68,.1);border-radius:20px;padding:2px 7px;white-space:nowrap;margin-left:auto}.klm-sims-label{font-size:10.5px;color:#9a93a6;margin-left:6px;white-space:nowrap}.klm-foot{text-align:center;font-size:11px;color:#8a8076;padding:4px 0 2px;border:0;background:transparent;width:100%;cursor:pointer;font-family:inherit;border-radius:8px;transition:color .18s ease;animation:klm-row-in .42s cubic-bezier(.16,1,.3,1) both}.klm-foot:hover{color:#5b51c9}.klm-foot:focus-visible{outline:2px solid #6366f1;outline-offset:2px}.klm-shine{position:absolute;top:0;left:0;width:42%;height:100%;pointer-events:none;background:linear-gradient(105deg,transparent,rgba(255,255,255,.6),transparent);transform:translateX(-130%);animation:klm-shine 1s ease-out .15s both}"
), cg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
function ug(e, t) {
  const r = e.createElement("button");
  r.className = "klm-card" + (t.primary ? " primary" : "") + (t.muted ? " muted" : ""), t.animationDelayMs != null && (r.style.animationDelay = t.animationDelayMs + "ms");
  const n = t.hint ? '<span class="klm-hint">' + t.hint + "</span>" : '<span class="klm-go">' + cg + "</span>";
  return r.innerHTML = '<span class="klm-chip">' + t.iconHtml + '</span><span class="klm-body"><span class="klm-t">' + t.label + "</span>" + (t.desc ? '<span class="klm-d">' + t.desc + "</span>" : "") + "</span>" + n, r;
}
function dg(e) {
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
function pg(e) {
  if (/Windows NT 10/.test(e)) return "Windows 10/11";
  if (/Windows NT/.test(e)) return "Windows";
  if (/iPhone|iPad|iPod/.test(e)) return "iOS";
  if (/Android/.test(e)) return "Android";
  if (/Mac OS X/.test(e)) return "macOS";
  if (/CrOS/.test(e)) return "ChromeOS";
  if (/Linux/.test(e)) return "Linux";
}
function ys(e = typeof window < "u" ? window : void 0, t = typeof navigator < "u" ? navigator : void 0) {
  const r = {}, n = t && t.userAgent || "";
  n && (r.userAgent = n.slice(0, 500));
  const i = dg(n);
  i.browser && (r.browser = i.browser), i.version && (r.browserVersion = i.version);
  const s = pg(n);
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
function jt(e, t) {
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
function ml(e, t = 0) {
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
function gl(e) {
  const t = new ArrayBuffer(8);
  return new DataView(t).setFloat64(0, e, !1), new Uint8Array(t);
}
function hg(e, t) {
  if (e instanceof Uint8Array || (e = new Uint8Array(e)), e.length < 16 || t <= 0 || e[0] !== 26 || e[1] !== 69 || e[2] !== 223 || e[3] !== 163)
    return e;
  const r = jt(e, 0);
  if (!r) return e;
  const n = jt(e, r.width);
  if (!n) return e;
  const i = r.width + n.width + n.value;
  if (i >= e.length) return e;
  const s = jt(e, i);
  if (!s || s.rawId !== 408125543) return e;
  const a = jt(e, i + s.width);
  if (!a) return e;
  const c = i + s.width + a.width;
  let l = c;
  const d = a.width === 8 && a.value === 72057594037927940, o = d ? e.length : Math.min(e.length, c + a.value);
  let h = -1, p = null, u = 0;
  for (; l < o; ) {
    const G = jt(e, l);
    if (!G) break;
    const ie = jt(e, l + G.width);
    if (!ie) break;
    if (G.rawId === 357149030) {
      h = l, p = ie, u = G.width + ie.width;
      break;
    }
    if (G.rawId === 524531317) break;
    l += G.width + ie.width + ie.value;
  }
  if (h === -1 || !p) return e;
  const m = h + u, f = m + p.value;
  let y = m, E = 1e6, v = -1, b = 0, T = 0, w = !1;
  for (; y < f; ) {
    const G = jt(e, y);
    if (!G) break;
    const ie = jt(e, y + G.width);
    if (!ie) break;
    const _e = y + G.width + ie.width, pe = _e + ie.value;
    if (G.rawId === 2807729) {
      w = !0;
      let fe = 0;
      for (let Se = 0; Se < ie.value; Se++)
        fe = fe * 256 + e[_e + Se];
      fe > 0 && (E = fe);
    } else G.rawId === 17545 && (v = y, b = pe - y, T = ie.value);
    y = pe;
  }
  const k = t * 1e6 / E;
  if (v !== -1 && T === 8) {
    const G = jt(e, v);
    if (G) {
      const ie = jt(e, v + G.width);
      if (ie && ie.value === 8) {
        const _e = v + G.width + ie.width, pe = new Uint8Array(e);
        return pe.set(gl(k), _e), pe;
      }
    }
  }
  const R = new Uint8Array(11);
  R[0] = 68, R[1] = 137, R[2] = 136, R.set(gl(k), 3);
  let I = null;
  w || (I = new Uint8Array([42, 215, 177, 131, 15, 66, 64]));
  let $;
  if (v === -1) {
    const G = e.subarray(m, f), ie = R.length + (I ? I.length : 0);
    $ = new Uint8Array(G.length + ie);
    let _e = 0;
    I && ($.set(I, _e), _e += I.length), $.set(G, _e), _e += G.length, $.set(R, _e);
  } else {
    const G = e.subarray(m, v), ie = e.subarray(v + b, f), _e = R.length + (I ? I.length : 0);
    $ = new Uint8Array(G.length + _e + ie.length);
    let pe = 0;
    I && ($.set(I, pe), pe += I.length), $.set(G, pe), pe += G.length, $.set(R, pe), pe += R.length, $.set(ie, pe);
  }
  const O = ml($.length), Z = new Uint8Array(4 + O.length);
  Z[0] = 21, Z[1] = 73, Z[2] = 169, Z[3] = 102, Z.set(O, 4);
  const q = new Uint8Array(Z.length + $.length);
  q.set(Z, 0), q.set($, Z.length);
  const L = u + p.value, Ze = q.length - L;
  let Ye = null;
  d || (Ye = ml(a.value + Ze, a.width));
  const ye = e.subarray(0, i + s.width), he = Ye || e.subarray(i + s.width, c), Ie = e.subarray(c, h), Fe = q, Oe = e.subarray(h + L), de = ye.length + he.length + Ie.length + Fe.length + Oe.length, j = new Uint8Array(de);
  let D = 0;
  return j.set(ye, D), D += ye.length, j.set(he, D), D += he.length, j.set(Ie, D), D += Ie.length, j.set(Fe, D), D += Fe.length, j.set(Oe, D), D += Oe.length, j;
}
function fg(e) {
  return typeof e.arrayBuffer == "function" ? e.arrayBuffer() : new Promise((t, r) => {
    try {
      const n = new FileReader();
      n.onload = () => t(n.result), n.onerror = () => r(n.error || new Error("read failed")), n.readAsArrayBuffer(e);
    } catch (n) {
      r(n);
    }
  });
}
async function mg(e, t) {
  if (!e || t <= 0) return e;
  try {
    const r = new Uint8Array(await fg(e)), n = hg(r, t);
    return n === r ? e : new Blob([n], { type: e.type || "video/webm" });
  } catch {
    return e;
  }
}
const gg = 180 * 1e3, yg = 50 * 1024 * 1024, bg = 1e6, vg = 96e3, kg = 15, yl = 1280, Iu = {
  maxDurationMs: gg,
  maxBytes: yg
}, wg = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm;codecs=h264,opus",
  "video/mp4;codecs=avc1,mp4a.40.2",
  "video/webm"
];
function qo() {
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
function xg(e, t = wg) {
  const r = e ?? ((n) => typeof MediaRecorder < "u" && !!MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(n));
  for (const n of t)
    if (r(n)) return n;
  return null;
}
function Ou(e = qo()) {
  const t = e.mediaDevices, r = e.MediaRecorder ?? globalThis.MediaRecorder;
  return !!t && typeof t.getDisplayMedia == "function" && typeof r < "u";
}
function Sg() {
  return "rec_" + (typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));
}
async function Eg(e = {}, t = qo()) {
  var E, v, b, T, w, k, R, I, $, O, Z, q, L, Ze, Ye, ye, he, Ie, Fe, Oe;
  const r = { ...Iu, ...e.caps || {} }, n = e.wantCamera === !0, i = e.wantMic !== !1, s = Math.max(5, Math.min(60, e.fps ?? kg)), a = xg(
    (E = t.MediaRecorder) != null && E.isTypeSupported ? (de) => t.MediaRecorder.isTypeSupported(de) : void 0
  );
  if (!a) throw new Error("recording-unsupported: no MediaRecorder codec available in this browser");
  const c = Sg(), l = t.createElement("canvas"), d = l.getContext ? l.getContext("2d") : null, o = t.createElement("video");
  o.muted = !0, o.playsInline = !0, o.autoplay = !0;
  try {
    (v = o.setAttribute) == null || v.call(o, "playsinline", ""), (b = o.setAttribute) == null || b.call(o, "autoplay", ""), (T = o.setAttribute) == null || T.call(o, "muted", "");
  } catch {
  }
  const h = t.createElement("video");
  h.muted = !0, h.playsInline = !0, h.autoplay = !0;
  try {
    (w = h.setAttribute) == null || w.call(h, "playsinline", ""), (k = h.setAttribute) == null || k.call(h, "autoplay", ""), (R = h.setAttribute) == null || R.call(h, "muted", "");
  } catch {
  }
  let p = "idle";
  const u = (de) => {
    var j;
    p = de;
    try {
      (j = e.onState) == null || j.call(e, de);
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
  const y = () => {
    var de;
    for (const j of [m, f])
      try {
        (de = j == null ? void 0 : j.getTracks) == null || de.call(j).forEach((D) => {
          var G;
          return (G = D.stop) == null ? void 0 : G.call(D);
        });
      } catch {
      }
  };
  try {
    let de = function() {
      if (!nt) {
        nt = !0;
        try {
          _t.state !== "inactive" && _t.stop();
        } catch {
        }
      }
    };
    const j = (I = m.getVideoTracks) == null ? void 0 : I.call(m)[0], D = (($ = j == null ? void 0 : j.getSettings) == null ? void 0 : $.call(j)) ?? {}, G = D.width && D.height ? D.width / D.height : 16 / 9;
    l.width = yl, l.height = Math.round(yl / G);
    let ie = null, _e = !1, pe = !0;
    if (n || i)
      try {
        if (f = await t.mediaDevices.getUserMedia({
          video: n ? { width: 640, height: 480, facingMode: "user" } : !1,
          audio: i ? { echoCancellation: !0, noiseSuppression: !0 } : !1
        }), n && ((O = f.getVideoTracks) != null && O.call(f).length)) {
          _e = !0, pe = !1;
          try {
            h.srcObject = f, await (((Z = h.play) == null ? void 0 : Z.call(h)) ?? Promise.resolve());
          } catch {
          }
        }
        i && (ie = ((q = f.getAudioTracks) == null ? void 0 : q.call(f)[0]) || null, ie && (pe = !1));
      } catch (ce) {
        let Pe = !1;
        if (i && n)
          try {
            if (f = await t.mediaDevices.getUserMedia({ video: !1, audio: { echoCancellation: !0, noiseSuppression: !0 } }), ie = ((L = f.getAudioTracks) == null ? void 0 : L.call(f)[0]) || null, ie) {
              pe = !1, Pe = !0;
              try {
                (Ze = e.onFallback) == null || Ze.call(e, "camera-blocked");
              } catch {
              }
            }
          } catch {
          }
        if (!Pe) {
          try {
            (Ye = e.onFallback) == null || Ye.call(e, (ce == null ? void 0 : ce.name) === "NotAllowedError" ? "permissions-policy" : (ce == null ? void 0 : ce.name) || "camera-mic-blocked");
          } catch {
          }
          pe = !0;
        }
      }
    const fe = !!ie;
    if (_e)
      try {
        o.srcObject = m, await (((ye = o.play) == null ? void 0 : ye.call(o)) ?? Promise.resolve());
      } catch {
      }
    let Se = 0, me = 0;
    const oe = () => {
      if (!d) return;
      const ce = l.width, Pe = l.height;
      if (o.videoWidth) {
        const Qe = o.videoWidth, wt = o.videoHeight, mt = Qe / wt, xt = ce / Pe;
        let se = ce, Re = Pe, Lr = 0, Ir = 0;
        mt > xt ? (Re = ce / mt, Ir = (Pe - Re) / 2) : (se = Pe * mt, Lr = (ce - se) / 2), (Lr > 0 || Ir > 0) && (d.fillStyle = "#000", d.fillRect(0, 0, ce, Pe)), d.drawImage(o, Lr, Ir, se, Re);
      }
      if (_e && h.videoWidth) {
        const Qe = Math.round(ce * 0.22), wt = Math.round(Qe * (h.videoHeight / h.videoWidth)), mt = ce - Qe - 20, xt = Pe - wt - 20;
        d.drawImage(h, mt, xt, Qe, wt), d.strokeStyle = "#7c3aed", d.lineWidth = 2, d.strokeRect(mt, xt, Qe, wt);
      }
      p === "recording" && (d.fillStyle = "#e11", d.beginPath(), d.arc(24, 24, 7, 0, Math.PI * 2), d.fill());
    };
    if (_e) {
      let ce = 0;
      const Pe = Math.floor(1e3 / s), Qe = () => {
        ce = t.now(), oe();
      }, wt = () => {
        Se = t.raf(wt), Qe();
      };
      wt(), me = t.setInterval(() => {
        var mt;
        if (o.paused && !(j != null && j.muted))
          try {
            (mt = o.play) == null || mt.call(o);
          } catch {
          }
        t.now() - ce >= Pe && Qe();
      }, Math.max(16, Pe));
    }
    const $e = [];
    let ge = null;
    if (_e) {
      try {
        ge = l.captureStream ? l.captureStream(s) : null;
      } catch {
      }
      const ce = (he = ge == null ? void 0 : ge.getVideoTracks) == null ? void 0 : he.call(ge)[0];
      ce ? $e.push(ce) : j && $e.push(j);
    } else j && $e.push(j);
    ie && $e.push(ie);
    const Ne = new t.MediaStream($e);
    try {
      (Ie = j == null ? void 0 : j.addEventListener) == null || Ie.call(j, "ended", () => de()), (Fe = j == null ? void 0 : j.addEventListener) == null || Fe.call(j, "mute", () => {
      }), (Oe = j == null ? void 0 : j.addEventListener) == null || Oe.call(j, "unmute", () => {
        var ce;
        if (_e) {
          try {
            (ce = o.play) == null || ce.call(o);
          } catch {
          }
          oe();
        }
      });
    } catch {
    }
    const Me = () => {
      var ce, Pe;
      if (_e && typeof document < "u" && !document.hidden) {
        try {
          (ce = o.play) == null || ce.call(o);
        } catch {
        }
        try {
          (Pe = h.play) == null || Pe.call(h);
        } catch {
        }
        oe();
      }
    };
    try {
      typeof document < "u" && document.addEventListener("visibilitychange", Me);
    } catch {
    }
    const ke = Math.max(15e4, Math.floor(e.videoBitsPerSecond ?? bg)), At = Math.max(16e3, Math.floor(e.audioBitsPerSecond ?? vg)), _t = new t.MediaRecorder(Ne, { mimeType: a, videoBitsPerSecond: ke, audioBitsPerSecond: At }), ln = [];
    let lt = 0, kt = 0, zn = 0, fr = 0, He = 0, nt = !1;
    const Xt = () => {
      if (p === "idle") return 0;
      const ce = t.now() - kt - zn;
      return Math.max(0, ce - (fr ? t.now() - fr : 0));
    };
    _t.ondataavailable = (ce) => {
      var Pe;
      ce != null && ce.data && ce.data.size && (ln.push(ce.data), lt += ce.data.size);
      try {
        (Pe = e.onStats) == null || Pe.call(e, { elapsedMs: Xt(), bytes: lt });
      } catch {
      }
      lt >= r.maxBytes && de();
    };
    let Kt;
    const Wi = new Promise((ce) => {
      Kt = ce;
    }), Dn = y;
    return _t.onstop = async () => {
      Se && t.caf(Se), me && (t.clearInterval(me), me = 0), He && (t.clearInterval(He), He = 0);
      try {
        typeof document < "u" && document.removeEventListener("visibilitychange", Me);
      } catch {
      }
      const ce = Xt();
      Dn();
      try {
        o.srcObject = null;
      } catch {
      }
      try {
        h.srcObject = null;
      } catch {
      }
      u("stopped");
      const Pe = new Blob(ln, { type: a.split(";")[0] });
      let Qe = Pe;
      if (ce > 0 && (Pe.type.includes("webm") || a.includes("webm")))
        try {
          Qe = await mg(Pe, ce);
        } catch {
          Qe = Pe;
        }
      const wt = D.width && D.width > 0 ? D.width : l.width, mt = D.height && D.height > 0 ? D.height : l.height;
      Kt({
        id: c,
        blob: Qe,
        mime: (Qe.type || a || "video/webm").split(";")[0],
        durationMs: ce,
        bytes: Qe.size || lt,
        width: _e ? l.width : wt,
        height: _e ? l.height : mt,
        screenOnly: pe,
        hadCamera: _e,
        hadAudio: fe
      });
    }, _t.start(1e3), kt = t.now(), u("recording"), He = t.setInterval(() => {
      var Pe;
      const ce = Xt();
      try {
        (Pe = e.onStats) == null || Pe.call(e, { elapsedMs: ce, bytes: lt });
      } catch {
      }
      ce >= r.maxDurationMs && de();
    }, 200), {
      pause() {
        if (p === "recording") {
          try {
            _t.pause();
          } catch {
          }
          fr = t.now(), u("paused");
        }
      },
      resume() {
        if (p === "paused") {
          try {
            _t.resume();
          } catch {
          }
          zn += t.now() - fr, fr = 0, u("recording");
        }
      },
      stop() {
        de();
      },
      state() {
        return p;
      },
      screenOnly() {
        return pe;
      },
      // KLA-602(b): expose the live camera stream ONLY when the camera is genuinely part of the capture, so the
      // overlay can mount a self-view bubble. Screen-only / audio-only(mic) fallbacks return null → no bubble.
      cameraStream() {
        return _e && f ? f : null;
      },
      done: Wi
    };
  } catch (de) {
    throw y(), de;
  }
}
function Cg(e) {
  return new Promise((t, r) => {
    try {
      const n = new FileReader();
      n.onload = () => t(String(n.result)), n.onerror = () => r(n.error || new Error("read failed")), n.readAsDataURL(e);
    } catch (n) {
      r(n);
    }
  });
}
async function Mg(e) {
  return {
    id: e.id,
    dataUrl: await Cg(e.blob),
    blob: e.blob,
    mime: (e.mime || "video/webm").split(";")[0],
    durationMs: Math.round(e.durationMs),
    bytes: e.bytes,
    width: e.width,
    height: e.height,
    screenOnly: e.screenOnly
  };
}
function Rg(e) {
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
async function Tg(e = {}) {
  if (typeof document > "u") return null;
  const t = e.deps ?? qo();
  return Ou(t) ? new Promise((r) => {
    const n = document.createElement("div");
    n.setAttribute("data-klavity-ui", "recorder");
    const i = document.createElement("div");
    n.appendChild(i), document.body.appendChild(n);
    const s = 'font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#19140f', a = (k) => {
      k === "bar" ? (n.style.cssText = `position:fixed;inset:0;z-index:2147483647;pointer-events:none;${s}`, i.style.cssText = "position:fixed;right:20px;top:50%;transform:translateY(-50%);pointer-events:auto;background:#f5f3ee;border:1px solid #e3ddd1;border-radius:14px;box-shadow:0 12px 40px rgba(28,22,40,.32);overflow:hidden;max-width:min(240px,80vw)") : (n.style.cssText = `position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;background:rgba(10,8,14,.55);${s}`, i.style.cssText = "width:360px;max-width:92vw;background:#f5f3ee;border:1px solid #e3ddd1;border-radius:12px;box-shadow:0 20px 60px rgba(28,22,40,.28);overflow:hidden");
    }, c = (k) => {
      var R;
      try {
        (R = e.onPhase) == null || R.call(e, k);
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
    }, y = (k) => {
      const R = Math.max(0, Math.round(k / 1e3));
      return `${Math.floor(R / 60)}:${String(R % 60).padStart(2, "0")}`;
    }, E = (k) => `${(k / 1048576).toFixed(1)} MB`, v = { ...Iu, ...e.caps || {} }, b = () => {
      a("modal"), c("consent"), o = !0, i.setAttribute("role", "dialog"), i.setAttribute("aria-modal", "true"), i.setAttribute("aria-label", "Record a walkthrough");
      const k = e.defaultCamera === !0 ? " checked" : "";
      i.innerHTML = `<div style="padding:14px;border-bottom:1px solid #e3ddd1;font-weight:600">Record a walkthrough</div><div style="padding:14px"><label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="klr-screen" checked disabled> Share my <b>screen</b></label><label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="klr-cam"${k}> Camera <span style="font-size:9px;font-weight:800;color:#fff;background:#6366f1;padding:1px 5px;border-radius:999px">optional</span></label><label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="klr-mic" checked> Microphone (narration)</label><div style="display:flex;gap:8px;margin-top:10px"><button id="klr-start" style="padding:8px 13px;border-radius:8px;border:1px solid #dc2626;background:#dc2626;color:#fff;font-weight:600;cursor:pointer">Start recording</button><button id="klr-cancel" style="padding:8px 13px;border-radius:8px;border:1px solid #e3ddd1;background:#fffdf8;font-weight:600;cursor:pointer">Cancel</button></div><p style="font-size:11px;color:#574f45;margin-top:8px;padding:8px;background:#efeadf;border-radius:8px;border:1px solid #e3ddd1">Tip: to capture steps across <b>multiple pages/tabs</b>, choose <b>&quot;Entire Screen&quot;</b> in the next dialog. Sharing a single tab will not follow you when you switch tabs.</p><p style="font-size:11px;color:#574f45;margin-top:8px">Your browser will ask to share a tab/screen. Max ${Math.round(v.maxDurationMs / 6e4)} min. Nothing uploads until you attach it.</p><div id="klr-hint"></div></div>`, i.querySelector("#klr-cancel").onclick = () => f(null), i.querySelector("#klr-start").onclick = () => {
        const R = i.querySelector("#klr-cam").checked, I = i.querySelector("#klr-mic").checked;
        T(R, I);
      };
    }, T = async (k, R) => {
      var $;
      let I = null;
      try {
        d = await Eg({
          wantCamera: k,
          wantMic: R,
          caps: e.caps,
          onFallback: (O) => {
            I = O;
          },
          onStats: ({ elapsedMs: O, bytes: Z }) => {
            const q = i.querySelector("#klr-timer");
            q && (q.textContent = "REC " + y(O));
            const L = i.querySelector("#klr-meta");
            L && (L.innerHTML = `${y(Math.max(0, v.maxDurationMs - O))} left<br>~${E(Z)}`);
          }
        }, t);
      } catch {
        f(null);
        return;
      }
      w(I);
      try {
        const O = Rg(($ = d == null ? void 0 : d.cameraStream) == null ? void 0 : $.call(d));
        O && n.appendChild(O);
      } catch {
      }
      d.done.then(async (O) => {
        f(await Mg(O));
      });
    }, w = (k) => {
      const R = k === "camera-blocked", $ = R ? '<div style="padding:0 14px 10px;font-size:11px;color:#574f45">Camera blocked by this site — recording <b>screen + mic narration</b>.</div>' : !!k && !R ? '<div style="padding:0 14px 10px;font-size:11px;color:#574f45">Camera/mic blocked — recording <b>screen only</b>. Narrate by typing, or use the extension.</div>' : "";
      a("bar"), c("recording"), o = !1, i.removeAttribute("role"), i.removeAttribute("aria-modal"), i.removeAttribute("aria-label"), i.innerHTML = '<div style="display:flex;flex-direction:column;gap:9px;padding:12px 14px;min-width:180px"><span style="display:inline-flex;align-items:center;gap:7px;font-weight:700;white-space:nowrap"><span aria-hidden="true" style="width:10px;height:10px;border-radius:50%;background:#e11;flex:none"></span><span id="klr-timer">REC 0:00</span></span><button id="klr-stop" aria-label="Stop recording" title="Stop recording" style="display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:12px 16px;border-radius:10px;border:1px solid #dc2626;background:#dc2626;color:#fff;font-weight:700;font-size:15px;cursor:pointer"><span aria-hidden="true" style="width:12px;height:12px;border-radius:2px;background:#fff;flex:none"></span>Stop recording</button><button id="klr-pause" style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid #e3ddd1;background:#fffdf8;font-weight:600;cursor:pointer">Pause</button><span id="klr-meta" style="font-size:11px;color:#574f45;text-align:center;white-space:nowrap"></span></div>' + $;
      const O = i.querySelector("#klr-pause");
      O.onclick = () => {
        d && (d.state() === "recording" ? (d.pause(), O.textContent = "Resume") : (d.resume(), O.textContent = "Pause"));
      }, i.querySelector("#klr-stop").onclick = () => d == null ? void 0 : d.stop();
    };
    b();
  }) : null;
}
async function bl(e, t = {}) {
  const r = t.maxWidth ?? 2e3, n = t.quality ?? 0.82;
  if (e.startsWith("data:image/jpeg") || typeof document > "u" || !e.startsWith("data:image/")) return e;
  try {
    const i = await new Promise((m, f) => {
      const y = new Image();
      y.onload = () => m(y), y.onerror = f, y.src = e;
    }), s = i.naturalWidth, a = i.naturalHeight, c = 16e3;
    let l = s > r ? r / s : 1;
    a * l > c && (l = c / a);
    const d = Math.round(s * l), o = Math.round(a * l), h = document.createElement("canvas");
    h.width = d, h.height = o;
    const p = h.getContext("2d");
    if (!p) return e;
    p.fillStyle = "#fff", p.fillRect(0, 0, d, o), p.drawImage(i, 0, 0, d, o);
    const u = h.toDataURL("image/jpeg", n);
    return u.length < e.length ? u : e;
  } catch {
    return e;
  }
}
async function Ag(e, t = {}) {
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
var _g = Object.defineProperty, Lg = (e, t, r) => t in e ? _g(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, H = (e, t, r) => Lg(e, typeof t != "symbol" ? t + "" : t, r), vl, Ig = Object.defineProperty, Og = (e, t, r) => t in e ? Ig(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, kl = (e, t, r) => Og(e, typeof t != "symbol" ? t + "" : t, r), Je = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(Je || {});
const wl = {
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
}, xl = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, ti = {}, Nu = {}, Ng = () => !!globalThis.Zone;
function Wo(e) {
  if (ti[e])
    return ti[e];
  const t = globalThis[e], r = t.prototype, n = e in wl ? wl[e] : void 0, i = !!(n && // @ts-expect-error 2345
  n.every(
    (c) => {
      var l, d;
      return !!((d = (l = Object.getOwnPropertyDescriptor(r, c)) == null ? void 0 : l.get) != null && d.toString().includes("[native code]"));
    }
  )), s = e in xl ? xl[e] : void 0, a = !!(s && s.every(
    // @ts-expect-error 2345
    (c) => {
      var l;
      return typeof r[c] == "function" && ((l = r[c]) == null ? void 0 : l.toString().includes("[native code]"));
    }
  ));
  if (i && a && !Ng())
    return ti[e] = t.prototype, t.prototype;
  try {
    const c = document.createElement("iframe");
    c.style.display = "none", document.body.appendChild(c);
    const l = c.contentWindow;
    if (!l) return t.prototype;
    const d = l[e].prototype;
    if (!d)
      return c.remove(), r;
    const o = navigator.userAgent;
    return o.includes("Safari") && !o.includes("Chrome") ? (c.classList.add("rr-block"), c.setAttribute("__rrwebUntaintedMutationObserver", ""), Nu[e] = () => c.remove()) : c.remove(), ti[e] = d;
  } catch {
    return r;
  }
}
const bs = {};
function Qt(e, t, r) {
  var n;
  const i = `${e}.${String(r)}`;
  if (bs[i])
    return bs[i].call(
      t
    );
  const s = Wo(e), a = (n = Object.getOwnPropertyDescriptor(
    s,
    r
  )) == null ? void 0 : n.get;
  return a ? (bs[i] = a, a.call(t)) : t[r];
}
const vs = {};
function Pu(e, t, r) {
  const n = `${e}.${String(r)}`;
  if (vs[n])
    return vs[n].bind(
      t
    );
  const s = Wo(e)[r];
  return typeof s != "function" ? t[r] : (vs[n] = s, s.bind(t));
}
function Pg(e) {
  return Qt("Node", e, "ownerDocument");
}
function zg(e) {
  return Qt("Node", e, "childNodes");
}
function Dg(e) {
  return Qt("Node", e, "parentNode");
}
function $g(e) {
  return Qt("Node", e, "parentElement");
}
function Fg(e) {
  return Qt("Node", e, "textContent");
}
function Ug(e, t) {
  return Pu("Node", e, "contains")(t);
}
function Bg(e) {
  return Pu("Node", e, "getRootNode")();
}
function qg(e) {
  return !e || !("host" in e) ? null : Qt("ShadowRoot", e, "host");
}
function Wg(e) {
  return e.styleSheets;
}
function Hg(e) {
  return !e || !("shadowRoot" in e) ? null : Qt("Element", e, "shadowRoot");
}
function jg(e, t) {
  return Qt("Element", e, "querySelector")(t);
}
function Yg(e, t) {
  return Qt("Element", e, "querySelectorAll")(t);
}
function Vg() {
  return [
    Wo("MutationObserver").constructor,
    Nu.MutationObserver ?? (() => {
    })
  ];
}
let zu = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (zu = () => (/* @__PURE__ */ new Date()).getTime());
function Gg(e, t, r) {
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
const at = {
  ownerDocument: Pg,
  childNodes: zg,
  parentNode: Dg,
  parentElement: $g,
  textContent: Fg,
  contains: Ug,
  getRootNode: Bg,
  host: qg,
  styleSheets: Wg,
  shadowRoot: Hg,
  querySelector: jg,
  querySelectorAll: Yg,
  nowTimestamp: zu,
  mutationObserverCtor: Vg,
  patch: Gg
};
function Du(e) {
  return e.nodeType === e.ELEMENT_NODE;
}
function xn(e) {
  const t = (
    // anchor and textarea elements also have a `host` property
    // but only shadow roots have a `mode` property
    e && "host" in e && "mode" in e && at.host(e) || null
  );
  return !!(t && "shadowRoot" in t && at.shadowRoot(t) === e);
}
function Sn(e) {
  return Object.prototype.toString.call(e) === "[object ShadowRoot]";
}
function Xg(e) {
  return e.includes(" background-clip: text;") && !e.includes(" -webkit-background-clip: text;") && (e = e.replace(
    /\sbackground-clip:\s*text;/g,
    " -webkit-background-clip: text; background-clip: text;"
  )), e;
}
function Kg(e) {
  const { cssText: t } = e;
  if (t.split('"').length < 3) return t;
  const r = ["@import", `url(${JSON.stringify(e.href)})`];
  return e.layerName === "" ? r.push("layer") : e.layerName && r.push(`layer(${e.layerName})`), e.supportsText && r.push(`supports(${e.supportsText})`), e.media.length && r.push(e.media.mediaText), r.join(" ") + ";";
}
function Lo(e) {
  try {
    const t = e.rules || e.cssRules;
    if (!t)
      return null;
    let r = e.href;
    !r && e.ownerNode && (r = e.ownerNode.baseURI);
    const n = Array.from(
      t,
      (i) => $u(i, r)
    ).join("");
    return Xg(n);
  } catch {
    return null;
  }
}
function $u(e, t) {
  if (Zg(e)) {
    let r;
    try {
      r = // for same-origin stylesheets,
      // we can access the imported stylesheet rules directly
      Lo(e.styleSheet) || // work around browser issues with the raw string `@import url(...)` statement
      Kg(e);
    } catch {
      r = e.cssText;
    }
    return e.styleSheet.href ? wi(r, e.styleSheet.href) : r;
  } else {
    let r = e.cssText;
    return Qg(e) && e.selectorText.includes(":") && (r = Jg(r)), t ? wi(r, t) : r;
  }
}
function Jg(e) {
  const t = /(\[(?:[\w-]+)[^\\])(:(?:[\w-]+)\])/gm;
  return e.replace(t, "$1\\$2");
}
function Zg(e) {
  return "styleSheet" in e;
}
function Qg(e) {
  return "selectorText" in e;
}
class Fu {
  constructor() {
    kl(this, "idNodeMap", /* @__PURE__ */ new Map()), kl(this, "nodeMetaMap", /* @__PURE__ */ new WeakMap());
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
function ey() {
  return new Fu();
}
function vi({
  element: e,
  maskInputOptions: t,
  tagName: r,
  type: n,
  value: i,
  maskInputFn: s
}) {
  let a = i || "";
  const c = n && Rr(n);
  return (t[r.toLowerCase()] || c && t[c]) && (s ? a = s(a, e) : a = "*".repeat(a.length)), a;
}
function Rr(e) {
  return e.toLowerCase();
}
const Sl = "__rrweb_original__";
function ty(e) {
  const t = e.getContext("2d");
  if (!t) return !0;
  const r = 50;
  for (let n = 0; n < e.width; n += r)
    for (let i = 0; i < e.height; i += r) {
      const s = t.getImageData, a = Sl in s ? s[Sl] : s;
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
function ki(e) {
  const t = e.type;
  return e.hasAttribute("data-rr-is-password") ? "password" : t ? (
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    Rr(t)
  ) : null;
}
function Uu(e, t) {
  let r;
  try {
    r = new URL(e, t ?? window.location.href);
  } catch {
    return null;
  }
  const n = /\.([0-9a-z]+)(?:$)/i, i = r.pathname.match(n);
  return (i == null ? void 0 : i[1]) ?? null;
}
function ry(e) {
  let t = "";
  return e.indexOf("//") > -1 ? t = e.split("/").slice(0, 3).join("/") : t = e.split("/")[0], t = t.split("?")[0], t;
}
const ny = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm, iy = /^(?:[a-z+]+:)?\/\//i, sy = /^www\..*/i, oy = /^(data:)([^,]*),(.*)/i;
function wi(e, t) {
  return (e || "").replace(
    ny,
    (r, n, i, s, a, c) => {
      const l = i || a || c, d = n || s || "";
      if (!l)
        return r;
      if (iy.test(l) || sy.test(l))
        return `url(${d}${l}${d})`;
      if (oy.test(l))
        return `url(${d}${l}${d})`;
      if (l[0] === "/")
        return `url(${d}${ry(t) + l}${d})`;
      const o = t.split("/"), h = l.split("/");
      o.pop();
      for (const p of h)
        p !== "." && (p === ".." ? o.pop() : o.push(p));
      return `url(${d}${o.join("/")}${d})`;
    }
  );
}
function ri(e, t = !1) {
  return t ? e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "") : e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "").replace(/0px/g, "0");
}
function ay(e, t, r = !1) {
  const n = Array.from(t.childNodes), i = [];
  let s = 0;
  if (n.length > 1 && e && typeof e == "string") {
    let a = ri(e, r);
    const c = a.length / e.length;
    for (let l = 1; l < n.length; l++)
      if (n[l].textContent && typeof n[l].textContent == "string") {
        const d = ri(
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
              const y = ri(f).length;
              m = a.indexOf(p, y);
            }
            m === -1 && (m = u[0].length);
          }
          if (m !== -1) {
            let f = Math.floor(m / c);
            for (; f > 0 && f < e.length; ) {
              if (s += 1, s > 50 * n.length)
                return i.push(e), i;
              const y = ri(
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
function ly(e, t) {
  return ay(e, t).join("/* rr_split */");
}
let cy = 1;
const uy = new RegExp("[^a-z0-9-_:]"), Tn = -2;
function Bu() {
  return cy++;
}
function dy(e) {
  if (e instanceof HTMLFormElement)
    return "form";
  const t = Rr(e.tagName);
  return uy.test(t) ? "div" : t;
}
let qr, El;
const py = /^[^ \t\n\r\u000c]+/, hy = /^[, \t\n\r\u000c]+/;
function fy(e, t) {
  if (t.trim() === "")
    return t;
  let r = 0;
  function n(s) {
    let a;
    const c = s.exec(t.substring(r));
    return c ? (a = c[0], r += a.length, a) : "";
  }
  const i = [];
  for (; n(hy), !(r >= t.length); ) {
    let s = n(py);
    if (s.slice(-1) === ",")
      s = Vr(e, s.substring(0, s.length - 1)), i.push(s);
    else {
      let a = "";
      s = Vr(e, s);
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
const Cl = /* @__PURE__ */ new WeakMap();
function Vr(e, t) {
  return !t || t.trim() === "" ? t : Ho(e, t);
}
function my(e) {
  return !!(e.tagName === "svg" || e.ownerSVGElement);
}
function Ho(e, t) {
  let r = Cl.get(e);
  if (r || (r = e.createElement("a"), Cl.set(e, r)), !t)
    t = "";
  else if (t.startsWith("blob:") || t.startsWith("data:"))
    return t;
  return r.setAttribute("href", t), r.href;
}
function qu(e, t, r, n) {
  return n && (r === "src" || r === "href" && !(t === "use" && n[0] === "#") || r === "xlink:href" && n[0] !== "#" || r === "background" && ["table", "td", "th"].includes(t) ? Vr(e, n) : r === "srcset" ? fy(e, n) : r === "style" ? wi(n, Ho(e)) : t === "object" && r === "data" ? Vr(e, n) : n);
}
function Wu(e, t, r) {
  return ["video", "audio"].includes(e) && t === "autoplay";
}
function gy(e, t, r) {
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
function xi(e, t, r) {
  if (!e) return !1;
  if (e.nodeType !== e.ELEMENT_NODE)
    return r ? xi(at.parentNode(e), t, r) : !1;
  for (let n = e.classList.length; n--; ) {
    const i = e.classList[n];
    if (t.test(i))
      return !0;
  }
  return r ? xi(at.parentNode(e), t, r) : !1;
}
function Hu(e, t, r, n) {
  let i;
  if (Du(e)) {
    if (i = e, !at.childNodes(i).length)
      return !1;
  } else {
    if (at.parentElement(e) === null)
      return !1;
    i = at.parentElement(e);
  }
  try {
    if (typeof t == "string") {
      if (n) {
        if (i.closest(`.${t}`)) return !0;
      } else if (i.classList.contains(t)) return !0;
    } else if (xi(i, t, n)) return !0;
    if (r) {
      if (n) {
        if (i.closest(r)) return !0;
      } else if (i.matches(r)) return !0;
    }
  } catch {
  }
  return !1;
}
function yy(e, t, r) {
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
function by(e, t, r) {
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
function vy(e, t) {
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
    cssCaptured: y = !1
  } = t, E = ky(r, n);
  switch (e.nodeType) {
    case e.DOCUMENT_NODE:
      return e.compatMode !== "CSS1Compat" ? {
        type: Je.Document,
        childNodes: [],
        compatMode: e.compatMode
        // probably "BackCompat"
      } : {
        type: Je.Document,
        childNodes: []
      };
    case e.DOCUMENT_TYPE_NODE:
      return {
        type: Je.DocumentType,
        name: e.name,
        publicId: e.publicId,
        systemId: e.systemId,
        rootId: E
      };
    case e.ELEMENT_NODE:
      return xy(e, {
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
        rootId: E
      });
    case e.TEXT_NODE:
      return wy(e, {
        doc: r,
        needsMask: a,
        maskTextFn: d,
        rootId: E,
        cssCaptured: y
      });
    case e.CDATA_SECTION_NODE:
      return {
        type: Je.CDATA,
        textContent: "",
        rootId: E
      };
    case e.COMMENT_NODE:
      return {
        type: Je.Comment,
        textContent: at.textContent(e) || "",
        rootId: E
      };
    default:
      return !1;
  }
}
function ky(e, t) {
  if (!t.hasNode(e)) return;
  const r = t.getId(e);
  return r === 1 ? void 0 : r;
}
function wy(e, t) {
  const { needsMask: r, maskTextFn: n, rootId: i, cssCaptured: s } = t, a = at.parentNode(e), c = a && a.tagName;
  let l = "";
  const d = c === "STYLE" ? !0 : void 0, o = c === "SCRIPT" ? !0 : void 0;
  return o ? l = "SCRIPT_PLACEHOLDER" : s || (l = at.textContent(e), d && l && (l = wi(l, Ho(t.doc)))), !d && !o && l && r && (l = n ? n(l, at.parentElement(e)) : l.replace(/[\S]/g, "*")), {
    type: Je.Text,
    textContent: l || "",
    rootId: i
  };
}
function xy(e, t) {
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
  } = t, m = gy(e, n, i), f = dy(e);
  let y = {};
  const E = e.attributes.length;
  for (let b = 0; b < E; b++) {
    const T = e.attributes[b];
    Wu(f, T.name, T.value) || (y[T.name] = qu(
      r,
      f,
      Rr(T.name),
      T.value
    ));
  }
  if (f === "link" && s) {
    const b = Array.from(r.styleSheets).find((w) => w.href === e.href);
    let T = null;
    b && (T = Lo(b)), T && (delete y.rel, delete y.href, y._cssText = T);
  }
  if (f === "style" && e.sheet) {
    let b = Lo(
      e.sheet
    );
    b && (e.childNodes.length > 1 && (b = ly(b, e)), y._cssText = b);
  }
  if (["input", "textarea", "select"].includes(f)) {
    const b = e.value, T = e.checked;
    y.type !== "radio" && y.type !== "checkbox" && y.type !== "submit" && y.type !== "button" && b ? y.value = vi({
      element: e,
      type: ki(e),
      tagName: f,
      value: b,
      maskInputOptions: a,
      maskInputFn: c
    }) : T && (y.checked = T);
  }
  if (f === "option" && (e.selected && !a.select ? y.selected = !0 : delete y.selected), f === "dialog" && e.open && (y.rr_open_mode = e.matches("dialog:modal") ? "modal" : "non-modal"), f === "canvas" && o) {
    if (e.__context === "2d")
      ty(e) || (y.rr_dataURL = e.toDataURL(
        l.type,
        l.quality
      ));
    else if (!("__context" in e)) {
      const b = e.toDataURL(
        l.type,
        l.quality
      ), T = r.createElement("canvas");
      T.width = e.width, T.height = e.height;
      const w = T.toDataURL(
        l.type,
        l.quality
      );
      b !== w && (y.rr_dataURL = b);
    }
  }
  if (f === "img" && d) {
    qr || (qr = r.createElement("canvas"), El = qr.getContext("2d"));
    const b = e, T = b.currentSrc || b.getAttribute("src") || "<unknown-src>", w = b.crossOrigin, k = () => {
      b.removeEventListener("load", k);
      try {
        qr.width = b.naturalWidth, qr.height = b.naturalHeight, El.drawImage(b, 0, 0), y.rr_dataURL = qr.toDataURL(
          l.type,
          l.quality
        );
      } catch (R) {
        if (b.crossOrigin !== "anonymous") {
          b.crossOrigin = "anonymous", b.complete && b.naturalWidth !== 0 ? k() : b.addEventListener("load", k);
          return;
        } else
          console.warn(
            `Cannot inline img src=${T}! Error: ${R}`
          );
      }
      b.crossOrigin === "anonymous" && (w ? y.crossOrigin = w : b.removeAttribute("crossorigin"));
    };
    b.complete && b.naturalWidth !== 0 ? k() : b.addEventListener("load", k);
  }
  if (["audio", "video"].includes(f)) {
    const b = y;
    b.rr_mediaState = e.paused ? "paused" : "played", b.rr_mediaCurrentTime = e.currentTime, b.rr_mediaPlaybackRate = e.playbackRate, b.rr_mediaMuted = e.muted, b.rr_mediaLoop = e.loop, b.rr_mediaVolume = e.volume;
  }
  if (p || (e.scrollLeft && (y.rr_scrollLeft = e.scrollLeft), e.scrollTop && (y.rr_scrollTop = e.scrollTop)), m) {
    const { width: b, height: T } = e.getBoundingClientRect();
    y = {
      class: y.class,
      rr_width: `${b}px`,
      rr_height: `${T}px`
    };
  }
  f === "iframe" && !h(y.src) && (e.contentDocument || (y.rr_src = y.src), delete y.src);
  let v;
  try {
    customElements.get(f) && (v = !0);
  } catch {
  }
  return {
    type: Je.Element,
    tagName: f,
    attributes: y,
    childNodes: [],
    isSVG: my(e) || void 0,
    needBlock: m,
    rootId: u,
    isCustom: v
  };
}
function Ue(e) {
  return e == null ? "" : e.toLowerCase();
}
function ju(e) {
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
function Sy(e, t) {
  if (t.comment && e.type === Je.Comment)
    return !0;
  if (e.type === Je.Element) {
    if (t.script && // script tag
    (e.tagName === "script" || // (module)preload link
    e.tagName === "link" && (e.attributes.rel === "preload" && e.attributes.as === "script" || e.attributes.rel === "modulepreload") || // prefetch link
    e.tagName === "link" && e.attributes.rel === "prefetch" && typeof e.attributes.href == "string" && Uu(e.attributes.href) === "js"))
      return !0;
    if (t.headFavicon && (e.tagName === "link" && e.attributes.rel === "shortcut icon" || e.tagName === "meta" && (Ue(e.attributes.name).match(
      /^msapplication-tile(image|color)$/
    ) || Ue(e.attributes.name) === "application-name" || Ue(e.attributes.rel) === "icon" || Ue(e.attributes.rel) === "apple-touch-icon" || Ue(e.attributes.rel) === "shortcut icon")))
      return !0;
    if (e.tagName === "meta") {
      if (t.headMetaDescKeywords && Ue(e.attributes.name).match(/^description|keywords$/))
        return !0;
      if (t.headMetaSocial && (Ue(e.attributes.property).match(/^(og|twitter|fb):/) || // og = opengraph (facebook)
      Ue(e.attributes.name).match(/^(og|twitter):/) || Ue(e.attributes.name) === "pinterest"))
        return !0;
      if (t.headMetaRobots && (Ue(e.attributes.name) === "robots" || Ue(e.attributes.name) === "googlebot" || Ue(e.attributes.name) === "bingbot"))
        return !0;
      if (t.headMetaHttpEquiv && e.attributes["http-equiv"] !== void 0)
        return !0;
      if (t.headMetaAuthorship && (Ue(e.attributes.name) === "author" || Ue(e.attributes.name) === "generator" || Ue(e.attributes.name) === "framework" || Ue(e.attributes.name) === "publisher" || Ue(e.attributes.name) === "progid" || Ue(e.attributes.property).match(/^article:/) || Ue(e.attributes.property).match(/^product:/)))
        return !0;
      if (t.headMetaVerification && (Ue(e.attributes.name) === "google-site-verification" || Ue(e.attributes.name) === "yandex-verification" || Ue(e.attributes.name) === "csrf-token" || Ue(e.attributes.name) === "p:domain_verify" || Ue(e.attributes.name) === "verify-v1" || Ue(e.attributes.name) === "verification" || Ue(e.attributes.name) === "shopify-checkout-api-token"))
        return !0;
    }
  }
  return !1;
}
function Gr(e, t) {
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
    recordCanvas: y = !1,
    onSerialize: E,
    onIframeLoad: v,
    iframeLoadTimeout: b = 5e3,
    onStylesheetLoad: T,
    stylesheetLoadTimeout: w = 5e3,
    keepIframeSrcFn: k = () => !1,
    newlyAddedElement: R = !1,
    cssCaptured: I = !1
  } = t;
  let { needsMask: $ } = t, { preserveWhiteSpace: O = !0 } = t;
  $ || ($ = Hu(
    e,
    a,
    c,
    $ === void 0
  ));
  const Z = vy(e, {
    doc: r,
    mirror: n,
    blockClass: i,
    blockSelector: s,
    needsMask: $,
    inlineStylesheet: d,
    maskInputOptions: o,
    maskTextFn: h,
    maskInputFn: p,
    dataURLOptions: m,
    inlineImages: f,
    recordCanvas: y,
    keepIframeSrcFn: k,
    newlyAddedElement: R,
    cssCaptured: I
  });
  if (!Z)
    return console.warn(e, "not serialized"), null;
  let q;
  n.hasNode(e) ? q = n.getId(e) : Sy(Z, u) || !O && Z.type === Je.Text && !Z.textContent.replace(/^\s+|\s+$/gm, "").length ? q = Tn : q = Bu();
  const L = Object.assign(Z, { id: q });
  if (n.add(e, L), q === Tn)
    return null;
  E && E(e);
  let Ze = !l;
  if (L.type === Je.Element) {
    Ze = Ze && !L.needBlock, delete L.needBlock;
    const ye = at.shadowRoot(e);
    ye && Sn(ye) && (L.isShadowHost = !0);
  }
  if ((L.type === Je.Document || L.type === Je.Element) && Ze) {
    u.headWhitespace && L.type === Je.Element && L.tagName === "head" && (O = !1);
    const ye = {
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
      maskInputFn: p,
      slimDOMOptions: u,
      dataURLOptions: m,
      inlineImages: f,
      recordCanvas: y,
      preserveWhiteSpace: O,
      onSerialize: E,
      onIframeLoad: v,
      iframeLoadTimeout: b,
      onStylesheetLoad: T,
      stylesheetLoadTimeout: w,
      keepIframeSrcFn: k,
      cssCaptured: !1
    };
    if (!(L.type === Je.Element && L.tagName === "textarea" && L.attributes.value !== void 0)) {
      L.type === Je.Element && L.attributes._cssText !== void 0 && typeof L.attributes._cssText == "string" && (ye.cssCaptured = !0);
      for (const Ie of Array.from(at.childNodes(e))) {
        const Fe = Gr(Ie, ye);
        Fe && L.childNodes.push(Fe);
      }
    }
    let he = null;
    if (Du(e) && (he = at.shadowRoot(e)))
      for (const Ie of Array.from(at.childNodes(he))) {
        const Fe = Gr(Ie, ye);
        Fe && (Sn(he) && (Fe.isShadow = !0), L.childNodes.push(Fe));
      }
  }
  const Ye = at.parentNode(e);
  return Ye && xn(Ye) && Sn(Ye) && (L.isShadow = !0), L.type === Je.Element && L.tagName === "iframe" && yy(
    e,
    () => {
      const ye = e.contentDocument;
      if (ye && v) {
        const he = Gr(ye, {
          doc: ye,
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
          maskInputFn: p,
          slimDOMOptions: u,
          dataURLOptions: m,
          inlineImages: f,
          recordCanvas: y,
          preserveWhiteSpace: O,
          onSerialize: E,
          onIframeLoad: v,
          iframeLoadTimeout: b,
          onStylesheetLoad: T,
          stylesheetLoadTimeout: w,
          keepIframeSrcFn: k
        });
        he && v(
          e,
          he
        );
      }
    },
    b
  ), L.type === Je.Element && L.tagName === "link" && typeof L.attributes.rel == "string" && (L.attributes.rel === "stylesheet" || L.attributes.rel === "preload" && typeof L.attributes.href == "string" && Uu(L.attributes.href) === "css") && by(
    e,
    () => {
      if (T) {
        const ye = Gr(e, {
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
          maskInputFn: p,
          slimDOMOptions: u,
          dataURLOptions: m,
          inlineImages: f,
          recordCanvas: y,
          preserveWhiteSpace: O,
          onSerialize: E,
          onIframeLoad: v,
          iframeLoadTimeout: b,
          onStylesheetLoad: T,
          stylesheetLoadTimeout: w,
          keepIframeSrcFn: k
        });
        ye && T(
          e,
          ye
        );
      }
    },
    w
  ), L;
}
function Ey(e, t) {
  const {
    mirror: r = new Fu(),
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
    onSerialize: y,
    onIframeLoad: E,
    iframeLoadTimeout: v,
    onStylesheetLoad: b,
    stylesheetLoadTimeout: T,
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
  } : o, R = ju(u);
  return Gr(e, {
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
    slimDOMOptions: R,
    dataURLOptions: m,
    inlineImages: l,
    recordCanvas: d,
    preserveWhiteSpace: f,
    onSerialize: y,
    onIframeLoad: E,
    iframeLoadTimeout: v,
    onStylesheetLoad: b,
    stylesheetLoadTimeout: T,
    keepIframeSrcFn: w,
    newlyAddedElement: !1
  });
}
function Cy(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function My(e) {
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
var ni = { exports: {} }, Ml;
function Ry() {
  if (Ml) return ni.exports;
  Ml = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return ni.exports = t(), ni.exports.createColors = t, ni.exports;
}
const Ty = {}, Ay = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Ty
}, Symbol.toStringTag, { value: "Module" })), Ft = /* @__PURE__ */ My(Ay);
var ks, Rl;
function jo() {
  if (Rl) return ks;
  Rl = 1;
  let e = /* @__PURE__ */ Ry(), t = Ft;
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
          let y = h(f.replace(/\d/g, " ")) + p.slice(0, this.column - 1).replace(/[^\t]/g, " ");
          return o(">") + h(f) + p + `
 ` + y + o("^");
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
  return ks = r, r.default = r, ks;
}
var ii = {}, Tl;
function Yo() {
  return Tl || (Tl = 1, ii.isClean = Symbol("isClean"), ii.my = Symbol("my")), ii;
}
var ws, Al;
function Yu() {
  if (Al) return ws;
  Al = 1;
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
  return ws = r, r.default = r, ws;
}
var xs, _l;
function Ii() {
  if (_l) return xs;
  _l = 1;
  let e = Yu();
  function t(r, n) {
    new e(n).stringify(r);
  }
  return xs = t, t.default = t, xs;
}
var Ss, Ll;
function Oi() {
  if (Ll) return Ss;
  Ll = 1;
  let { isClean: e, my: t } = Yo(), r = jo(), n = Yu(), i = Ii();
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
  return Ss = a, a.default = a, Ss;
}
var Es, Il;
function Ni() {
  if (Il) return Es;
  Il = 1;
  let e = Oi();
  class t extends e {
    constructor(n) {
      n && typeof n.value < "u" && typeof n.value != "string" && (n = { ...n, value: String(n.value) }), super(n), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return Es = t, t.default = t, Es;
}
var Cs, Ol;
function _y() {
  if (Ol) return Cs;
  Ol = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return Cs = { nanoid: (n = 21) => {
    let i = "", s = n;
    for (; s--; )
      i += e[Math.random() * 64 | 0];
    return i;
  }, customAlphabet: (n, i = 21) => (s = i) => {
    let a = "", c = s;
    for (; c--; )
      a += n[Math.random() * n.length | 0];
    return a;
  } }, Cs;
}
var Ms, Nl;
function Vu() {
  if (Nl) return Ms;
  Nl = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Ft, { existsSync: r, readFileSync: n } = Ft, { dirname: i, join: s } = Ft;
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
  return Ms = c, c.default = c, Ms;
}
var Rs, Pl;
function Pi() {
  if (Pl) return Rs;
  Pl = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Ft, { fileURLToPath: r, pathToFileURL: n } = Ft, { isAbsolute: i, resolve: s } = Ft, { nanoid: a } = /* @__PURE__ */ _y(), c = Ft, l = jo(), d = Vu(), o = Symbol("fromOffsetCache"), h = !!(e && t), p = !!(s && i);
  class u {
    constructor(f, y = {}) {
      if (f === null || typeof f > "u" || typeof f == "object" && !f.toString)
        throw new Error(`PostCSS received ${f} instead of CSS string`);
      if (this.css = f.toString(), this.css[0] === "\uFEFF" || this.css[0] === "￾" ? (this.hasBOM = !0, this.css = this.css.slice(1)) : this.hasBOM = !1, y.from && (!p || /^\w+:\/\//.test(y.from) || i(y.from) ? this.file = y.from : this.file = s(y.from)), p && h) {
        let E = new d(this.css, y);
        if (E.text) {
          this.map = E;
          let v = E.consumer().file;
          !this.file && v && (this.file = this.mapResolve(v));
        }
      }
      this.file || (this.id = "<input css " + a(6) + ">"), this.map && (this.map.file = this.from);
    }
    error(f, y, E, v = {}) {
      let b, T, w;
      if (y && typeof y == "object") {
        let R = y, I = E;
        if (typeof R.offset == "number") {
          let $ = this.fromOffset(R.offset);
          y = $.line, E = $.col;
        } else
          y = R.line, E = R.column;
        if (typeof I.offset == "number") {
          let $ = this.fromOffset(I.offset);
          T = $.line, w = $.col;
        } else
          T = I.line, w = I.column;
      } else if (!E) {
        let R = this.fromOffset(y);
        y = R.line, E = R.col;
      }
      let k = this.origin(y, E, T, w);
      return k ? b = new l(
        f,
        k.endLine === void 0 ? k.line : { column: k.column, line: k.line },
        k.endLine === void 0 ? k.column : { column: k.endColumn, line: k.endLine },
        k.source,
        k.file,
        v.plugin
      ) : b = new l(
        f,
        T === void 0 ? y : { column: E, line: y },
        T === void 0 ? E : { column: w, line: T },
        this.css,
        this.file,
        v.plugin
      ), b.input = { column: E, endColumn: w, endLine: T, line: y, source: this.css }, this.file && (n && (b.input.url = n(this.file).toString()), b.input.file = this.file), b;
    }
    fromOffset(f) {
      let y, E;
      if (this[o])
        E = this[o];
      else {
        let b = this.css.split(`
`);
        E = new Array(b.length);
        let T = 0;
        for (let w = 0, k = b.length; w < k; w++)
          E[w] = T, T += b[w].length + 1;
        this[o] = E;
      }
      y = E[E.length - 1];
      let v = 0;
      if (f >= y)
        v = E.length - 1;
      else {
        let b = E.length - 2, T;
        for (; v < b; )
          if (T = v + (b - v >> 1), f < E[T])
            b = T - 1;
          else if (f >= E[T + 1])
            v = T + 1;
          else {
            v = T;
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
      let b = this.map.consumer(), T = b.originalPositionFor({ column: y, line: f });
      if (!T.source) return !1;
      let w;
      typeof E == "number" && (w = b.originalPositionFor({ column: v, line: E }));
      let k;
      i(T.source) ? k = n(T.source) : k = new URL(
        T.source,
        this.map.consumer().sourceRoot || n(this.map.mapFile)
      );
      let R = {
        column: T.column,
        endColumn: w && w.column,
        endLine: w && w.line,
        line: T.line,
        url: k.toString()
      };
      if (k.protocol === "file:")
        if (r)
          R.file = r(k);
        else
          throw new Error("file: protocol is not available in this PostCSS build");
      let I = b.sourceContentFor(T.source);
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
  return Rs = u, u.default = u, c && c.registerInput && c.registerInput(u), Rs;
}
var Ts, zl;
function Gu() {
  if (zl) return Ts;
  zl = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Ft, { dirname: r, relative: n, resolve: i, sep: s } = Ft, { pathToFileURL: a } = Ft, c = Pi(), l = !!(e && t), d = !!(r && i && n && s);
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
      }, y, E;
      this.stringify(this.root, (v, b, T) => {
        if (this.css += v, b && T !== "end" && (f.generated.line = p, f.generated.column = u - 1, b.source && b.source.start ? (f.source = this.sourcePath(b), f.original.line = b.source.start.line, f.original.column = b.source.start.column - 1, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, this.map.addMapping(f))), y = v.match(/\n/g), y ? (p += y.length, E = v.lastIndexOf(`
`), u = v.length - E) : u += v.length, b && T !== "start") {
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
  return Ts = o, Ts;
}
var As, Dl;
function zi() {
  if (Dl) return As;
  Dl = 1;
  let e = Oi();
  class t extends e {
    constructor(n) {
      super(n), this.type = "comment";
    }
  }
  return As = t, t.default = t, As;
}
var _s, $l;
function Tr() {
  if ($l) return _s;
  $l = 1;
  let { isClean: e, my: t } = Yo(), r = Ni(), n = zi(), i = Oi(), s, a, c, l;
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
            ...f.map((y) => typeof y == "function" ? (E, v) => y(E.toProxy(), v) : y)
          ) : m === "every" || m === "some" ? (f) => u[m](
            (y, ...E) => f(y.toProxy(), ...E)
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
      let E;
      for (let v in this.indexes)
        E = this.indexes[v], f < E && (this.indexes[v] = E + y.length);
      return this.markDirty(), this;
    }
    insertBefore(u, m) {
      let f = this.index(u), y = f === 0 ? "prepend" : !1, E = this.normalize(m, this.proxyOf.nodes[f], y).reverse();
      f = this.index(u);
      for (let b of E) this.proxyOf.nodes.splice(f, 0, b);
      let v;
      for (let b in this.indexes)
        v = this.indexes[b], f <= v && (this.indexes[b] = v + E.length);
      return this.markDirty(), this;
    }
    normalize(u, m) {
      if (typeof u == "string")
        u = d(s(u).nodes);
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
        } catch (E) {
          throw m.addToError(E);
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
    s = p;
  }, h.registerRule = (p) => {
    a = p;
  }, h.registerAtRule = (p) => {
    c = p;
  }, h.registerRoot = (p) => {
    l = p;
  }, _s = h, h.default = h, h.rebuild = (p) => {
    p.type === "atrule" ? Object.setPrototypeOf(p, c.prototype) : p.type === "rule" ? Object.setPrototypeOf(p, a.prototype) : p.type === "decl" ? Object.setPrototypeOf(p, r.prototype) : p.type === "comment" ? Object.setPrototypeOf(p, n.prototype) : p.type === "root" && Object.setPrototypeOf(p, l.prototype), p[t] = !0, p.nodes && p.nodes.forEach((u) => {
      h.rebuild(u);
    });
  }, _s;
}
var Ls, Fl;
function Vo() {
  if (Fl) return Ls;
  Fl = 1;
  let e = Tr(), t, r;
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
  }, Ls = n, n.default = n, Ls;
}
var Is, Ul;
function Xu() {
  if (Ul) return Is;
  Ul = 1;
  let e = {};
  return Is = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, Is;
}
var Os, Bl;
function Ku() {
  if (Bl) return Os;
  Bl = 1;
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
  return Os = e, e.default = e, Os;
}
var Ns, ql;
function Go() {
  if (ql) return Ns;
  ql = 1;
  let e = Ku();
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
  return Ns = t, t.default = t, Ns;
}
var Ps, Wl;
function Ly() {
  if (Wl) return Ps;
  Wl = 1;
  const e = 39, t = 34, r = 92, n = 47, i = 10, s = 32, a = 12, c = 9, l = 13, d = 91, o = 93, h = 40, p = 41, u = 123, m = 125, f = 59, y = 42, E = 58, v = 64, b = /[\t\n\f\r "#'()/;[\\\]{}]/g, T = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, w = /.[\r\n"'(/\\]/, k = /[\da-f]/i;
  return Ps = function(I, $ = {}) {
    let O = I.css.valueOf(), Z = $.ignoreErrors, q, L, Ze, Ye, ye, he, Ie, Fe, Oe, de, j = O.length, D = 0, G = [], ie = [];
    function _e() {
      return D;
    }
    function pe(oe) {
      throw I.error("Unclosed " + oe, D);
    }
    function fe() {
      return ie.length === 0 && D >= j;
    }
    function Se(oe) {
      if (ie.length) return ie.pop();
      if (D >= j) return;
      let $e = oe ? oe.ignoreUnclosed : !1;
      switch (q = O.charCodeAt(D), q) {
        case i:
        case s:
        case c:
        case l:
        case a: {
          L = D;
          do
            L += 1, q = O.charCodeAt(L);
          while (q === s || q === i || q === c || q === l || q === a);
          de = ["space", O.slice(D, L)], D = L - 1;
          break;
        }
        case d:
        case o:
        case u:
        case m:
        case E:
        case f:
        case p: {
          let ge = String.fromCharCode(q);
          de = [ge, ge, D];
          break;
        }
        case h: {
          if (Fe = G.length ? G.pop()[1] : "", Oe = O.charCodeAt(D + 1), Fe === "url" && Oe !== e && Oe !== t && Oe !== s && Oe !== i && Oe !== c && Oe !== a && Oe !== l) {
            L = D;
            do {
              if (he = !1, L = O.indexOf(")", L + 1), L === -1)
                if (Z || $e) {
                  L = D;
                  break;
                } else
                  pe("bracket");
              for (Ie = L; O.charCodeAt(Ie - 1) === r; )
                Ie -= 1, he = !he;
            } while (he);
            de = ["brackets", O.slice(D, L + 1), D, L], D = L;
          } else
            L = O.indexOf(")", D + 1), Ye = O.slice(D, L + 1), L === -1 || w.test(Ye) ? de = ["(", "(", D] : (de = ["brackets", Ye, D, L], D = L);
          break;
        }
        case e:
        case t: {
          Ze = q === e ? "'" : '"', L = D;
          do {
            if (he = !1, L = O.indexOf(Ze, L + 1), L === -1)
              if (Z || $e) {
                L = D + 1;
                break;
              } else
                pe("string");
            for (Ie = L; O.charCodeAt(Ie - 1) === r; )
              Ie -= 1, he = !he;
          } while (he);
          de = ["string", O.slice(D, L + 1), D, L], D = L;
          break;
        }
        case v: {
          b.lastIndex = D + 1, b.test(O), b.lastIndex === 0 ? L = O.length - 1 : L = b.lastIndex - 2, de = ["at-word", O.slice(D, L + 1), D, L], D = L;
          break;
        }
        case r: {
          for (L = D, ye = !0; O.charCodeAt(L + 1) === r; )
            L += 1, ye = !ye;
          if (q = O.charCodeAt(L + 1), ye && q !== n && q !== s && q !== i && q !== c && q !== l && q !== a && (L += 1, k.test(O.charAt(L)))) {
            for (; k.test(O.charAt(L + 1)); )
              L += 1;
            O.charCodeAt(L + 1) === s && (L += 1);
          }
          de = ["word", O.slice(D, L + 1), D, L], D = L;
          break;
        }
        default: {
          q === n && O.charCodeAt(D + 1) === y ? (L = O.indexOf("*/", D + 2) + 1, L === 0 && (Z || $e ? L = O.length : pe("comment")), de = ["comment", O.slice(D, L + 1), D, L], D = L) : (T.lastIndex = D + 1, T.test(O), T.lastIndex === 0 ? L = O.length - 1 : L = T.lastIndex - 2, de = ["word", O.slice(D, L + 1), D, L], G.push(de), D = L);
          break;
        }
      }
      return D++, de;
    }
    function me(oe) {
      ie.push(oe);
    }
    return {
      back: me,
      endOfFile: fe,
      nextToken: Se,
      position: _e
    };
  }, Ps;
}
var zs, Hl;
function Xo() {
  if (Hl) return zs;
  Hl = 1;
  let e = Tr();
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
  return zs = t, t.default = t, e.registerAtRule(t), zs;
}
var Ds, jl;
function In() {
  if (jl) return Ds;
  jl = 1;
  let e = Tr(), t, r;
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
  }, Ds = n, n.default = n, e.registerRoot(n), Ds;
}
var $s, Yl;
function Ju() {
  if (Yl) return $s;
  Yl = 1;
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
  return $s = e, e.default = e, $s;
}
var Fs, Vl;
function Ko() {
  if (Vl) return Fs;
  Vl = 1;
  let e = Tr(), t = Ju();
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
  return Fs = r, r.default = r, e.registerRule(r), Fs;
}
var Us, Gl;
function Iy() {
  if (Gl) return Us;
  Gl = 1;
  let e = Ni(), t = Ly(), r = zi(), n = Xo(), i = In(), s = Ko();
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
      let p, u, m, f = !1, y = !1, E = [], v = [];
      for (; !this.tokenizer.endOfFile(); ) {
        if (o = this.tokenizer.nextToken(), p = o[0], p === "(" || p === "[" ? v.push(p === "(" ? ")" : "]") : p === "{" && v.length > 0 ? v.push("}") : p === v[v.length - 1] && v.pop(), v.length === 0)
          if (p === ";") {
            h.source.end = this.getPosition(o[2]), h.source.end.offset++, this.semicolon = !0;
            break;
          } else if (p === "{") {
            y = !0;
            break;
          } else if (p === "}") {
            if (E.length > 0) {
              for (m = E.length - 1, u = E[m]; u && u[0] === "space"; )
                u = E[--m];
              u && (h.source.end = this.getPosition(u[3] || u[2]), h.source.end.offset++);
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
      for (let [f, y] of o.entries()) {
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
      let f = [], y;
      for (; o.length && (y = o[0][0], !(y !== "space" && y !== "comment")); )
        f.push(o.shift());
      this.precheckMissedSemicolon(o);
      for (let v = o.length - 1; v >= 0; v--) {
        if (m = o[v], m[1].toLowerCase() === "!important") {
          p.important = !0;
          let b = this.stringFrom(o, v);
          b = this.spacesFromEnd(o) + b, b !== " !important" && (p.raws.important = b);
          break;
        } else if (m[1].toLowerCase() === "important") {
          let b = o.slice(0), T = "";
          for (let w = v; w > 0; w--) {
            let k = b[w][0];
            if (T.trim().indexOf("!") === 0 && k !== "space")
              break;
            T = b.pop()[1] + T;
          }
          T.trim().indexOf("!") === 0 && (p.important = !0, p.raws.important = T, o = b);
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
      let h = !1, p = null, u = !1, m = null, f = [], y = o[1].startsWith("--"), E = [], v = o;
      for (; v; ) {
        if (p = v[0], E.push(v), p === "(" || p === "[")
          m || (m = v), f.push(p === "(" ? ")" : "]");
        else if (y && u && p === "{")
          m || (m = v), f.push("}");
        else if (f.length === 0)
          if (p === ";")
            if (u) {
              this.decl(E, y);
              return;
            } else
              break;
          else if (p === "{") {
            this.rule(E);
            return;
          } else if (p === "}") {
            this.tokenizer.back(E.pop()), h = !0;
            break;
          } else p === ":" && (u = !0);
        else p === f[f.length - 1] && (f.pop(), f.length === 0 && (m = null));
        v = this.tokenizer.nextToken();
      }
      if (this.tokenizer.endOfFile() && (h = !0), f.length > 0 && this.unclosedBracket(m), h && u) {
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
    raw(o, h, p, u) {
      let m, f, y = p.length, E = "", v = !0, b, T;
      for (let w = 0; w < y; w += 1)
        m = p[w], f = m[0], f === "space" && w === y - 1 && !u ? v = !1 : f === "comment" ? (T = p[w - 1] ? p[w - 1][0] : "empty", b = p[w + 1] ? p[w + 1][0] : "empty", !a[T] && !a[b] ? E.slice(-1) === "," ? v = !1 : E += m[1] : v = !1) : E += m[1];
      if (!v) {
        let w = p.reduce((k, R) => k + R[1], "");
        o.raws[h] = { raw: w, value: E };
      }
      o[h] = E;
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
  return Us = l, Us;
}
var Bs, Xl;
function Jo() {
  if (Xl) return Bs;
  Xl = 1;
  let e = Tr(), t = Iy(), r = Pi();
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
  return Bs = n, n.default = n, e.registerParse(n), Bs;
}
var qs, Kl;
function Zu() {
  if (Kl) return qs;
  Kl = 1;
  let { isClean: e, my: t } = Yo(), r = Gu(), n = Ii(), i = Tr(), s = Vo(), a = Xu(), c = Go(), l = Jo(), d = In();
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
  function m(T) {
    return typeof T == "object" && typeof T.then == "function";
  }
  function f(T) {
    let w = !1, k = o[T.type];
    return T.type === "decl" ? w = T.prop.toLowerCase() : T.type === "atrule" && (w = T.name.toLowerCase()), w && T.append ? [
      k,
      k + "-" + w,
      u,
      k + "Exit",
      k + "Exit-" + w
    ] : w ? [k, k + "-" + w, k + "Exit", k + "Exit-" + w] : T.append ? [k, u, k + "Exit"] : [k, k + "Exit"];
  }
  function y(T) {
    let w;
    return T.type === "document" ? w = ["Document", u, "DocumentExit"] : T.type === "root" ? w = ["Root", u, "RootExit"] : w = f(T), {
      eventIndex: 0,
      events: w,
      iterator: 0,
      node: T,
      visitorIndex: 0,
      visitors: []
    };
  }
  function E(T) {
    return T[e] = !1, T.nodes && T.nodes.forEach((w) => E(w)), T;
  }
  let v = {};
  class b {
    constructor(w, k, R) {
      this.stringified = !1, this.processed = !1;
      let I;
      if (typeof k == "object" && k !== null && (k.type === "root" || k.type === "document"))
        I = E(k);
      else if (k instanceof b || k instanceof c)
        I = E(k.root), k.map && (typeof R.map > "u" && (R.map = {}), R.map.inline || (R.map.inline = !1), R.map.prev = k.map);
      else {
        let $ = l;
        R.syntax && ($ = R.syntax.parse), R.parser && ($ = R.parser), $.parse && ($ = $.parse);
        try {
          I = $(k, R);
        } catch (O) {
          this.processed = !0, this.error = O;
        }
        I && !I[t] && i.rebuild(I);
      }
      this.result = new c(w, I, R), this.helpers = { ...v, postcss: v, result: this.result }, this.plugins = this.processor.plugins.map(($) => typeof $ == "object" && $.prepare ? { ...$, ...$.prepare(this.result) } : $);
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
      let R = this.result.lastPlugin;
      try {
        if (k && k.addToError(w), this.error = w, w.name === "CssSyntaxError" && !w.plugin)
          w.plugin = R.postcssPlugin, w.setMessage();
        else if (R.postcssVersion && process.env.NODE_ENV !== "production") {
          let I = R.postcssPlugin, $ = R.postcssVersion, O = this.result.processor.version, Z = $.split("."), q = O.split(".");
          (Z[0] !== q[0] || parseInt(Z[1]) > parseInt(q[1])) && console.error(
            "Unknown error from PostCSS plugin. Your current PostCSS version is " + O + ", but " + I + " uses " + $ + ". Perhaps this is the source of the error below."
          );
        }
      } catch (I) {
        console && console.error && console.error(I);
      }
      return w;
    }
    prepareVisitors() {
      this.listeners = {};
      let w = (k, R, I) => {
        this.listeners[R] || (this.listeners[R] = []), this.listeners[R].push([k, I]);
      };
      for (let k of this.plugins)
        if (typeof k == "object")
          for (let R in k) {
            if (!h[R] && /^[A-Z]/.test(R))
              throw new Error(
                `Unknown event ${R} in ${k.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`
              );
            if (!p[R])
              if (typeof k[R] == "object")
                for (let I in k[R])
                  I === "*" ? w(k, R, k[R][I]) : w(
                    k,
                    R + "-" + I.toLowerCase(),
                    k[R][I]
                  );
              else typeof k[R] == "function" && w(k, R, k[R]);
          }
      this.hasListener = Object.keys(this.listeners).length > 0;
    }
    async runAsync() {
      this.plugin = 0;
      for (let w = 0; w < this.plugins.length; w++) {
        let k = this.plugins[w], R = this.runOnRoot(k);
        if (m(R))
          try {
            await R;
          } catch (I) {
            throw this.handleError(I);
          }
      }
      if (this.prepareVisitors(), this.hasListener) {
        let w = this.result.root;
        for (; !w[e]; ) {
          w[e] = !0;
          let k = [y(w)];
          for (; k.length > 0; ) {
            let R = this.visitTick(k);
            if (m(R))
              try {
                await R;
              } catch (I) {
                let $ = k[k.length - 1].node;
                throw this.handleError(I, $);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [k, R] of this.listeners.OnceExit) {
            this.result.lastPlugin = k;
            try {
              if (w.type === "document") {
                let I = w.nodes.map(
                  ($) => R($, this.helpers)
                );
                await Promise.all(I);
              } else
                await R(w, this.helpers);
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
              (R) => w.Once(R, this.helpers)
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
      return process.env.NODE_ENV !== "production" && ("from" in this.opts || a(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(w, k);
    }
    toString() {
      return this.css;
    }
    visitSync(w, k) {
      for (let [R, I] of w) {
        this.result.lastPlugin = R;
        let $;
        try {
          $ = I(k, this.helpers);
        } catch (O) {
          throw this.handleError(O, k.proxyOf);
        }
        if (k.type !== "root" && k.type !== "document" && !k.parent)
          return !0;
        if (m($))
          throw this.getAsyncError();
      }
    }
    visitTick(w) {
      let k = w[w.length - 1], { node: R, visitors: I } = k;
      if (R.type !== "root" && R.type !== "document" && !R.parent) {
        w.pop();
        return;
      }
      if (I.length > 0 && k.visitorIndex < I.length) {
        let [O, Z] = I[k.visitorIndex];
        k.visitorIndex += 1, k.visitorIndex === I.length && (k.visitors = [], k.visitorIndex = 0), this.result.lastPlugin = O;
        try {
          return Z(R.toProxy(), this.helpers);
        } catch (q) {
          throw this.handleError(q, R);
        }
      }
      if (k.iterator !== 0) {
        let O = k.iterator, Z;
        for (; Z = R.nodes[R.indexes[O]]; )
          if (R.indexes[O] += 1, !Z[e]) {
            Z[e] = !0, w.push(y(Z));
            return;
          }
        k.iterator = 0, delete R.indexes[O];
      }
      let $ = k.events;
      for (; k.eventIndex < $.length; ) {
        let O = $[k.eventIndex];
        if (k.eventIndex += 1, O === u) {
          R.nodes && R.nodes.length && (R[e] = !0, k.iterator = R.getIterator());
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
      for (let R of k)
        if (R === u)
          w.nodes && w.each((I) => {
            I[e] || this.walkSync(I);
          });
        else {
          let I = this.listeners[R];
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
  return b.registerPostcss = (T) => {
    v = T;
  }, qs = b, b.default = b, d.registerLazyResult(b), s.registerLazyResult(b), qs;
}
var Ws, Jl;
function Oy() {
  if (Jl) return Ws;
  Jl = 1;
  let e = Gu(), t = Ii(), r = Xu(), n = Jo();
  const i = Go();
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
  return Ws = s, s.default = s, Ws;
}
var Hs, Zl;
function Ny() {
  if (Zl) return Hs;
  Zl = 1;
  let e = Oy(), t = Zu(), r = Vo(), n = In();
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
  return Hs = i, i.default = i, n.registerProcessor(i), r.registerProcessor(i), Hs;
}
var js, Ql;
function Py() {
  if (Ql) return js;
  Ql = 1;
  let e = Ni(), t = Vu(), r = zi(), n = Xo(), i = Pi(), s = In(), a = Ko();
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
  return js = c, c.default = c, js;
}
var Ys, ec;
function zy() {
  if (ec) return Ys;
  ec = 1;
  let e = jo(), t = Ni(), r = Zu(), n = Tr(), i = Ny(), s = Ii(), a = Py(), c = Vo(), l = Ku(), d = zi(), o = Xo(), h = Go(), p = Pi(), u = Jo(), m = Ju(), f = Ko(), y = In(), E = Oi();
  function v(...b) {
    return b.length === 1 && Array.isArray(b[0]) && (b = b[0]), new i(b);
  }
  return v.plugin = function(T, w) {
    let k = !1;
    function R(...$) {
      console && console.warn && !k && (k = !0, console.warn(
        T + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`
      ), process.env.LANG && process.env.LANG.startsWith("cn") && console.warn(
        T + `: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`
      ));
      let O = w(...$);
      return O.postcssPlugin = T, O.postcssVersion = new i().version, O;
    }
    let I;
    return Object.defineProperty(R, "postcss", {
      get() {
        return I || (I = R()), I;
      }
    }), R.process = function($, O, Z) {
      return v([R(Z)]).process($, O);
    }, R;
  }, v.stringify = s, v.parse = u, v.fromJSON = a, v.list = m, v.comment = (b) => new d(b), v.atRule = (b) => new o(b), v.decl = (b) => new t(b), v.rule = (b) => new f(b), v.root = (b) => new y(b), v.document = (b) => new c(b), v.CssSyntaxError = e, v.Declaration = t, v.Container = n, v.Processor = i, v.Document = c, v.Comment = d, v.Warning = l, v.AtRule = o, v.Result = h, v.Input = p, v.Rule = f, v.Root = y, v.Node = E, r.registerPostcss(v), Ys = v, v.default = v, Ys;
}
var Dy = zy();
const qe = /* @__PURE__ */ Cy(Dy);
qe.stringify;
qe.fromJSON;
qe.plugin;
qe.parse;
qe.list;
qe.document;
qe.comment;
qe.atRule;
qe.rule;
qe.decl;
qe.root;
qe.CssSyntaxError;
qe.Declaration;
qe.Container;
qe.Processor;
qe.Document;
qe.Comment;
qe.Warning;
qe.AtRule;
qe.Result;
qe.Input;
qe.Rule;
qe.Root;
qe.Node;
var $y = Object.defineProperty, Fy = (e, t, r) => t in e ? $y(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, Ct = (e, t, r) => Fy(e, typeof t != "symbol" ? t + "" : t, r);
Date.now().toString();
function Uy(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function By(e) {
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
var si = { exports: {} }, tc;
function qy() {
  if (tc) return si.exports;
  tc = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return si.exports = t(), si.exports.createColors = t, si.exports;
}
const Wy = {}, Hy = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Wy
}, Symbol.toStringTag, { value: "Module" })), Ut = /* @__PURE__ */ By(Hy);
var Vs, rc;
function Zo() {
  if (rc) return Vs;
  rc = 1;
  let e = /* @__PURE__ */ qy(), t = Ut;
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
          let y = h(f.replace(/\d/g, " ")) + p.slice(0, this.column - 1).replace(/[^\t]/g, " ");
          return o(">") + h(f) + p + `
 ` + y + o("^");
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
  return Vs = r, r.default = r, Vs;
}
var oi = {}, nc;
function Qo() {
  return nc || (nc = 1, oi.isClean = Symbol("isClean"), oi.my = Symbol("my")), oi;
}
var Gs, ic;
function Qu() {
  if (ic) return Gs;
  ic = 1;
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
  return Gs = r, r.default = r, Gs;
}
var Xs, sc;
function Di() {
  if (sc) return Xs;
  sc = 1;
  let e = Qu();
  function t(r, n) {
    new e(n).stringify(r);
  }
  return Xs = t, t.default = t, Xs;
}
var Ks, oc;
function $i() {
  if (oc) return Ks;
  oc = 1;
  let { isClean: e, my: t } = Qo(), r = Zo(), n = Qu(), i = Di();
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
  return Ks = a, a.default = a, Ks;
}
var Js, ac;
function Fi() {
  if (ac) return Js;
  ac = 1;
  let e = $i();
  class t extends e {
    constructor(n) {
      n && typeof n.value < "u" && typeof n.value != "string" && (n = { ...n, value: String(n.value) }), super(n), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return Js = t, t.default = t, Js;
}
var Zs, lc;
function jy() {
  if (lc) return Zs;
  lc = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return Zs = { nanoid: (n = 21) => {
    let i = "", s = n;
    for (; s--; )
      i += e[Math.random() * 64 | 0];
    return i;
  }, customAlphabet: (n, i = 21) => (s = i) => {
    let a = "", c = s;
    for (; c--; )
      a += n[Math.random() * n.length | 0];
    return a;
  } }, Zs;
}
var Qs, cc;
function ed() {
  if (cc) return Qs;
  cc = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Ut, { existsSync: r, readFileSync: n } = Ut, { dirname: i, join: s } = Ut;
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
  return Qs = c, c.default = c, Qs;
}
var eo, uc;
function Ui() {
  if (uc) return eo;
  uc = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Ut, { fileURLToPath: r, pathToFileURL: n } = Ut, { isAbsolute: i, resolve: s } = Ut, { nanoid: a } = /* @__PURE__ */ jy(), c = Ut, l = Zo(), d = ed(), o = Symbol("fromOffsetCache"), h = !!(e && t), p = !!(s && i);
  class u {
    constructor(f, y = {}) {
      if (f === null || typeof f > "u" || typeof f == "object" && !f.toString)
        throw new Error(`PostCSS received ${f} instead of CSS string`);
      if (this.css = f.toString(), this.css[0] === "\uFEFF" || this.css[0] === "￾" ? (this.hasBOM = !0, this.css = this.css.slice(1)) : this.hasBOM = !1, y.from && (!p || /^\w+:\/\//.test(y.from) || i(y.from) ? this.file = y.from : this.file = s(y.from)), p && h) {
        let E = new d(this.css, y);
        if (E.text) {
          this.map = E;
          let v = E.consumer().file;
          !this.file && v && (this.file = this.mapResolve(v));
        }
      }
      this.file || (this.id = "<input css " + a(6) + ">"), this.map && (this.map.file = this.from);
    }
    error(f, y, E, v = {}) {
      let b, T, w;
      if (y && typeof y == "object") {
        let R = y, I = E;
        if (typeof R.offset == "number") {
          let $ = this.fromOffset(R.offset);
          y = $.line, E = $.col;
        } else
          y = R.line, E = R.column;
        if (typeof I.offset == "number") {
          let $ = this.fromOffset(I.offset);
          T = $.line, w = $.col;
        } else
          T = I.line, w = I.column;
      } else if (!E) {
        let R = this.fromOffset(y);
        y = R.line, E = R.col;
      }
      let k = this.origin(y, E, T, w);
      return k ? b = new l(
        f,
        k.endLine === void 0 ? k.line : { column: k.column, line: k.line },
        k.endLine === void 0 ? k.column : { column: k.endColumn, line: k.endLine },
        k.source,
        k.file,
        v.plugin
      ) : b = new l(
        f,
        T === void 0 ? y : { column: E, line: y },
        T === void 0 ? E : { column: w, line: T },
        this.css,
        this.file,
        v.plugin
      ), b.input = { column: E, endColumn: w, endLine: T, line: y, source: this.css }, this.file && (n && (b.input.url = n(this.file).toString()), b.input.file = this.file), b;
    }
    fromOffset(f) {
      let y, E;
      if (this[o])
        E = this[o];
      else {
        let b = this.css.split(`
`);
        E = new Array(b.length);
        let T = 0;
        for (let w = 0, k = b.length; w < k; w++)
          E[w] = T, T += b[w].length + 1;
        this[o] = E;
      }
      y = E[E.length - 1];
      let v = 0;
      if (f >= y)
        v = E.length - 1;
      else {
        let b = E.length - 2, T;
        for (; v < b; )
          if (T = v + (b - v >> 1), f < E[T])
            b = T - 1;
          else if (f >= E[T + 1])
            v = T + 1;
          else {
            v = T;
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
      let b = this.map.consumer(), T = b.originalPositionFor({ column: y, line: f });
      if (!T.source) return !1;
      let w;
      typeof E == "number" && (w = b.originalPositionFor({ column: v, line: E }));
      let k;
      i(T.source) ? k = n(T.source) : k = new URL(
        T.source,
        this.map.consumer().sourceRoot || n(this.map.mapFile)
      );
      let R = {
        column: T.column,
        endColumn: w && w.column,
        endLine: w && w.line,
        line: T.line,
        url: k.toString()
      };
      if (k.protocol === "file:")
        if (r)
          R.file = r(k);
        else
          throw new Error("file: protocol is not available in this PostCSS build");
      let I = b.sourceContentFor(T.source);
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
  return eo = u, u.default = u, c && c.registerInput && c.registerInput(u), eo;
}
var to, dc;
function td() {
  if (dc) return to;
  dc = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Ut, { dirname: r, relative: n, resolve: i, sep: s } = Ut, { pathToFileURL: a } = Ut, c = Ui(), l = !!(e && t), d = !!(r && i && n && s);
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
      }, y, E;
      this.stringify(this.root, (v, b, T) => {
        if (this.css += v, b && T !== "end" && (f.generated.line = p, f.generated.column = u - 1, b.source && b.source.start ? (f.source = this.sourcePath(b), f.original.line = b.source.start.line, f.original.column = b.source.start.column - 1, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, this.map.addMapping(f))), y = v.match(/\n/g), y ? (p += y.length, E = v.lastIndexOf(`
`), u = v.length - E) : u += v.length, b && T !== "start") {
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
  return to = o, to;
}
var ro, pc;
function Bi() {
  if (pc) return ro;
  pc = 1;
  let e = $i();
  class t extends e {
    constructor(n) {
      super(n), this.type = "comment";
    }
  }
  return ro = t, t.default = t, ro;
}
var no, hc;
function Ar() {
  if (hc) return no;
  hc = 1;
  let { isClean: e, my: t } = Qo(), r = Fi(), n = Bi(), i = $i(), s, a, c, l;
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
            ...f.map((y) => typeof y == "function" ? (E, v) => y(E.toProxy(), v) : y)
          ) : m === "every" || m === "some" ? (f) => u[m](
            (y, ...E) => f(y.toProxy(), ...E)
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
      let E;
      for (let v in this.indexes)
        E = this.indexes[v], f < E && (this.indexes[v] = E + y.length);
      return this.markDirty(), this;
    }
    insertBefore(u, m) {
      let f = this.index(u), y = f === 0 ? "prepend" : !1, E = this.normalize(m, this.proxyOf.nodes[f], y).reverse();
      f = this.index(u);
      for (let b of E) this.proxyOf.nodes.splice(f, 0, b);
      let v;
      for (let b in this.indexes)
        v = this.indexes[b], f <= v && (this.indexes[b] = v + E.length);
      return this.markDirty(), this;
    }
    normalize(u, m) {
      if (typeof u == "string")
        u = d(s(u).nodes);
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
        } catch (E) {
          throw m.addToError(E);
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
    s = p;
  }, h.registerRule = (p) => {
    a = p;
  }, h.registerAtRule = (p) => {
    c = p;
  }, h.registerRoot = (p) => {
    l = p;
  }, no = h, h.default = h, h.rebuild = (p) => {
    p.type === "atrule" ? Object.setPrototypeOf(p, c.prototype) : p.type === "rule" ? Object.setPrototypeOf(p, a.prototype) : p.type === "decl" ? Object.setPrototypeOf(p, r.prototype) : p.type === "comment" ? Object.setPrototypeOf(p, n.prototype) : p.type === "root" && Object.setPrototypeOf(p, l.prototype), p[t] = !0, p.nodes && p.nodes.forEach((u) => {
      h.rebuild(u);
    });
  }, no;
}
var io, fc;
function ea() {
  if (fc) return io;
  fc = 1;
  let e = Ar(), t, r;
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
  }, io = n, n.default = n, io;
}
var so, mc;
function rd() {
  if (mc) return so;
  mc = 1;
  let e = {};
  return so = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, so;
}
var oo, gc;
function nd() {
  if (gc) return oo;
  gc = 1;
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
  return oo = e, e.default = e, oo;
}
var ao, yc;
function ta() {
  if (yc) return ao;
  yc = 1;
  let e = nd();
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
  return ao = t, t.default = t, ao;
}
var lo, bc;
function Yy() {
  if (bc) return lo;
  bc = 1;
  const e = 39, t = 34, r = 92, n = 47, i = 10, s = 32, a = 12, c = 9, l = 13, d = 91, o = 93, h = 40, p = 41, u = 123, m = 125, f = 59, y = 42, E = 58, v = 64, b = /[\t\n\f\r "#'()/;[\\\]{}]/g, T = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, w = /.[\r\n"'(/\\]/, k = /[\da-f]/i;
  return lo = function(I, $ = {}) {
    let O = I.css.valueOf(), Z = $.ignoreErrors, q, L, Ze, Ye, ye, he, Ie, Fe, Oe, de, j = O.length, D = 0, G = [], ie = [];
    function _e() {
      return D;
    }
    function pe(oe) {
      throw I.error("Unclosed " + oe, D);
    }
    function fe() {
      return ie.length === 0 && D >= j;
    }
    function Se(oe) {
      if (ie.length) return ie.pop();
      if (D >= j) return;
      let $e = oe ? oe.ignoreUnclosed : !1;
      switch (q = O.charCodeAt(D), q) {
        case i:
        case s:
        case c:
        case l:
        case a: {
          L = D;
          do
            L += 1, q = O.charCodeAt(L);
          while (q === s || q === i || q === c || q === l || q === a);
          de = ["space", O.slice(D, L)], D = L - 1;
          break;
        }
        case d:
        case o:
        case u:
        case m:
        case E:
        case f:
        case p: {
          let ge = String.fromCharCode(q);
          de = [ge, ge, D];
          break;
        }
        case h: {
          if (Fe = G.length ? G.pop()[1] : "", Oe = O.charCodeAt(D + 1), Fe === "url" && Oe !== e && Oe !== t && Oe !== s && Oe !== i && Oe !== c && Oe !== a && Oe !== l) {
            L = D;
            do {
              if (he = !1, L = O.indexOf(")", L + 1), L === -1)
                if (Z || $e) {
                  L = D;
                  break;
                } else
                  pe("bracket");
              for (Ie = L; O.charCodeAt(Ie - 1) === r; )
                Ie -= 1, he = !he;
            } while (he);
            de = ["brackets", O.slice(D, L + 1), D, L], D = L;
          } else
            L = O.indexOf(")", D + 1), Ye = O.slice(D, L + 1), L === -1 || w.test(Ye) ? de = ["(", "(", D] : (de = ["brackets", Ye, D, L], D = L);
          break;
        }
        case e:
        case t: {
          Ze = q === e ? "'" : '"', L = D;
          do {
            if (he = !1, L = O.indexOf(Ze, L + 1), L === -1)
              if (Z || $e) {
                L = D + 1;
                break;
              } else
                pe("string");
            for (Ie = L; O.charCodeAt(Ie - 1) === r; )
              Ie -= 1, he = !he;
          } while (he);
          de = ["string", O.slice(D, L + 1), D, L], D = L;
          break;
        }
        case v: {
          b.lastIndex = D + 1, b.test(O), b.lastIndex === 0 ? L = O.length - 1 : L = b.lastIndex - 2, de = ["at-word", O.slice(D, L + 1), D, L], D = L;
          break;
        }
        case r: {
          for (L = D, ye = !0; O.charCodeAt(L + 1) === r; )
            L += 1, ye = !ye;
          if (q = O.charCodeAt(L + 1), ye && q !== n && q !== s && q !== i && q !== c && q !== l && q !== a && (L += 1, k.test(O.charAt(L)))) {
            for (; k.test(O.charAt(L + 1)); )
              L += 1;
            O.charCodeAt(L + 1) === s && (L += 1);
          }
          de = ["word", O.slice(D, L + 1), D, L], D = L;
          break;
        }
        default: {
          q === n && O.charCodeAt(D + 1) === y ? (L = O.indexOf("*/", D + 2) + 1, L === 0 && (Z || $e ? L = O.length : pe("comment")), de = ["comment", O.slice(D, L + 1), D, L], D = L) : (T.lastIndex = D + 1, T.test(O), T.lastIndex === 0 ? L = O.length - 1 : L = T.lastIndex - 2, de = ["word", O.slice(D, L + 1), D, L], G.push(de), D = L);
          break;
        }
      }
      return D++, de;
    }
    function me(oe) {
      ie.push(oe);
    }
    return {
      back: me,
      endOfFile: fe,
      nextToken: Se,
      position: _e
    };
  }, lo;
}
var co, vc;
function ra() {
  if (vc) return co;
  vc = 1;
  let e = Ar();
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
  return co = t, t.default = t, e.registerAtRule(t), co;
}
var uo, kc;
function On() {
  if (kc) return uo;
  kc = 1;
  let e = Ar(), t, r;
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
  }, uo = n, n.default = n, e.registerRoot(n), uo;
}
var po, wc;
function id() {
  if (wc) return po;
  wc = 1;
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
  return po = e, e.default = e, po;
}
var ho, xc;
function na() {
  if (xc) return ho;
  xc = 1;
  let e = Ar(), t = id();
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
  return ho = r, r.default = r, e.registerRule(r), ho;
}
var fo, Sc;
function Vy() {
  if (Sc) return fo;
  Sc = 1;
  let e = Fi(), t = Yy(), r = Bi(), n = ra(), i = On(), s = na();
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
      let p, u, m, f = !1, y = !1, E = [], v = [];
      for (; !this.tokenizer.endOfFile(); ) {
        if (o = this.tokenizer.nextToken(), p = o[0], p === "(" || p === "[" ? v.push(p === "(" ? ")" : "]") : p === "{" && v.length > 0 ? v.push("}") : p === v[v.length - 1] && v.pop(), v.length === 0)
          if (p === ";") {
            h.source.end = this.getPosition(o[2]), h.source.end.offset++, this.semicolon = !0;
            break;
          } else if (p === "{") {
            y = !0;
            break;
          } else if (p === "}") {
            if (E.length > 0) {
              for (m = E.length - 1, u = E[m]; u && u[0] === "space"; )
                u = E[--m];
              u && (h.source.end = this.getPosition(u[3] || u[2]), h.source.end.offset++);
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
      for (let [f, y] of o.entries()) {
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
      let f = [], y;
      for (; o.length && (y = o[0][0], !(y !== "space" && y !== "comment")); )
        f.push(o.shift());
      this.precheckMissedSemicolon(o);
      for (let v = o.length - 1; v >= 0; v--) {
        if (m = o[v], m[1].toLowerCase() === "!important") {
          p.important = !0;
          let b = this.stringFrom(o, v);
          b = this.spacesFromEnd(o) + b, b !== " !important" && (p.raws.important = b);
          break;
        } else if (m[1].toLowerCase() === "important") {
          let b = o.slice(0), T = "";
          for (let w = v; w > 0; w--) {
            let k = b[w][0];
            if (T.trim().indexOf("!") === 0 && k !== "space")
              break;
            T = b.pop()[1] + T;
          }
          T.trim().indexOf("!") === 0 && (p.important = !0, p.raws.important = T, o = b);
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
      let h = !1, p = null, u = !1, m = null, f = [], y = o[1].startsWith("--"), E = [], v = o;
      for (; v; ) {
        if (p = v[0], E.push(v), p === "(" || p === "[")
          m || (m = v), f.push(p === "(" ? ")" : "]");
        else if (y && u && p === "{")
          m || (m = v), f.push("}");
        else if (f.length === 0)
          if (p === ";")
            if (u) {
              this.decl(E, y);
              return;
            } else
              break;
          else if (p === "{") {
            this.rule(E);
            return;
          } else if (p === "}") {
            this.tokenizer.back(E.pop()), h = !0;
            break;
          } else p === ":" && (u = !0);
        else p === f[f.length - 1] && (f.pop(), f.length === 0 && (m = null));
        v = this.tokenizer.nextToken();
      }
      if (this.tokenizer.endOfFile() && (h = !0), f.length > 0 && this.unclosedBracket(m), h && u) {
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
    raw(o, h, p, u) {
      let m, f, y = p.length, E = "", v = !0, b, T;
      for (let w = 0; w < y; w += 1)
        m = p[w], f = m[0], f === "space" && w === y - 1 && !u ? v = !1 : f === "comment" ? (T = p[w - 1] ? p[w - 1][0] : "empty", b = p[w + 1] ? p[w + 1][0] : "empty", !a[T] && !a[b] ? E.slice(-1) === "," ? v = !1 : E += m[1] : v = !1) : E += m[1];
      if (!v) {
        let w = p.reduce((k, R) => k + R[1], "");
        o.raws[h] = { raw: w, value: E };
      }
      o[h] = E;
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
  return fo = l, fo;
}
var mo, Ec;
function ia() {
  if (Ec) return mo;
  Ec = 1;
  let e = Ar(), t = Vy(), r = Ui();
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
  return mo = n, n.default = n, e.registerParse(n), mo;
}
var go, Cc;
function sd() {
  if (Cc) return go;
  Cc = 1;
  let { isClean: e, my: t } = Qo(), r = td(), n = Di(), i = Ar(), s = ea(), a = rd(), c = ta(), l = ia(), d = On();
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
  function m(T) {
    return typeof T == "object" && typeof T.then == "function";
  }
  function f(T) {
    let w = !1, k = o[T.type];
    return T.type === "decl" ? w = T.prop.toLowerCase() : T.type === "atrule" && (w = T.name.toLowerCase()), w && T.append ? [
      k,
      k + "-" + w,
      u,
      k + "Exit",
      k + "Exit-" + w
    ] : w ? [k, k + "-" + w, k + "Exit", k + "Exit-" + w] : T.append ? [k, u, k + "Exit"] : [k, k + "Exit"];
  }
  function y(T) {
    let w;
    return T.type === "document" ? w = ["Document", u, "DocumentExit"] : T.type === "root" ? w = ["Root", u, "RootExit"] : w = f(T), {
      eventIndex: 0,
      events: w,
      iterator: 0,
      node: T,
      visitorIndex: 0,
      visitors: []
    };
  }
  function E(T) {
    return T[e] = !1, T.nodes && T.nodes.forEach((w) => E(w)), T;
  }
  let v = {};
  class b {
    constructor(w, k, R) {
      this.stringified = !1, this.processed = !1;
      let I;
      if (typeof k == "object" && k !== null && (k.type === "root" || k.type === "document"))
        I = E(k);
      else if (k instanceof b || k instanceof c)
        I = E(k.root), k.map && (typeof R.map > "u" && (R.map = {}), R.map.inline || (R.map.inline = !1), R.map.prev = k.map);
      else {
        let $ = l;
        R.syntax && ($ = R.syntax.parse), R.parser && ($ = R.parser), $.parse && ($ = $.parse);
        try {
          I = $(k, R);
        } catch (O) {
          this.processed = !0, this.error = O;
        }
        I && !I[t] && i.rebuild(I);
      }
      this.result = new c(w, I, R), this.helpers = { ...v, postcss: v, result: this.result }, this.plugins = this.processor.plugins.map(($) => typeof $ == "object" && $.prepare ? { ...$, ...$.prepare(this.result) } : $);
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
      let R = this.result.lastPlugin;
      try {
        if (k && k.addToError(w), this.error = w, w.name === "CssSyntaxError" && !w.plugin)
          w.plugin = R.postcssPlugin, w.setMessage();
        else if (R.postcssVersion && process.env.NODE_ENV !== "production") {
          let I = R.postcssPlugin, $ = R.postcssVersion, O = this.result.processor.version, Z = $.split("."), q = O.split(".");
          (Z[0] !== q[0] || parseInt(Z[1]) > parseInt(q[1])) && console.error(
            "Unknown error from PostCSS plugin. Your current PostCSS version is " + O + ", but " + I + " uses " + $ + ". Perhaps this is the source of the error below."
          );
        }
      } catch (I) {
        console && console.error && console.error(I);
      }
      return w;
    }
    prepareVisitors() {
      this.listeners = {};
      let w = (k, R, I) => {
        this.listeners[R] || (this.listeners[R] = []), this.listeners[R].push([k, I]);
      };
      for (let k of this.plugins)
        if (typeof k == "object")
          for (let R in k) {
            if (!h[R] && /^[A-Z]/.test(R))
              throw new Error(
                `Unknown event ${R} in ${k.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`
              );
            if (!p[R])
              if (typeof k[R] == "object")
                for (let I in k[R])
                  I === "*" ? w(k, R, k[R][I]) : w(
                    k,
                    R + "-" + I.toLowerCase(),
                    k[R][I]
                  );
              else typeof k[R] == "function" && w(k, R, k[R]);
          }
      this.hasListener = Object.keys(this.listeners).length > 0;
    }
    async runAsync() {
      this.plugin = 0;
      for (let w = 0; w < this.plugins.length; w++) {
        let k = this.plugins[w], R = this.runOnRoot(k);
        if (m(R))
          try {
            await R;
          } catch (I) {
            throw this.handleError(I);
          }
      }
      if (this.prepareVisitors(), this.hasListener) {
        let w = this.result.root;
        for (; !w[e]; ) {
          w[e] = !0;
          let k = [y(w)];
          for (; k.length > 0; ) {
            let R = this.visitTick(k);
            if (m(R))
              try {
                await R;
              } catch (I) {
                let $ = k[k.length - 1].node;
                throw this.handleError(I, $);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [k, R] of this.listeners.OnceExit) {
            this.result.lastPlugin = k;
            try {
              if (w.type === "document") {
                let I = w.nodes.map(
                  ($) => R($, this.helpers)
                );
                await Promise.all(I);
              } else
                await R(w, this.helpers);
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
              (R) => w.Once(R, this.helpers)
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
      return process.env.NODE_ENV !== "production" && ("from" in this.opts || a(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(w, k);
    }
    toString() {
      return this.css;
    }
    visitSync(w, k) {
      for (let [R, I] of w) {
        this.result.lastPlugin = R;
        let $;
        try {
          $ = I(k, this.helpers);
        } catch (O) {
          throw this.handleError(O, k.proxyOf);
        }
        if (k.type !== "root" && k.type !== "document" && !k.parent)
          return !0;
        if (m($))
          throw this.getAsyncError();
      }
    }
    visitTick(w) {
      let k = w[w.length - 1], { node: R, visitors: I } = k;
      if (R.type !== "root" && R.type !== "document" && !R.parent) {
        w.pop();
        return;
      }
      if (I.length > 0 && k.visitorIndex < I.length) {
        let [O, Z] = I[k.visitorIndex];
        k.visitorIndex += 1, k.visitorIndex === I.length && (k.visitors = [], k.visitorIndex = 0), this.result.lastPlugin = O;
        try {
          return Z(R.toProxy(), this.helpers);
        } catch (q) {
          throw this.handleError(q, R);
        }
      }
      if (k.iterator !== 0) {
        let O = k.iterator, Z;
        for (; Z = R.nodes[R.indexes[O]]; )
          if (R.indexes[O] += 1, !Z[e]) {
            Z[e] = !0, w.push(y(Z));
            return;
          }
        k.iterator = 0, delete R.indexes[O];
      }
      let $ = k.events;
      for (; k.eventIndex < $.length; ) {
        let O = $[k.eventIndex];
        if (k.eventIndex += 1, O === u) {
          R.nodes && R.nodes.length && (R[e] = !0, k.iterator = R.getIterator());
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
      for (let R of k)
        if (R === u)
          w.nodes && w.each((I) => {
            I[e] || this.walkSync(I);
          });
        else {
          let I = this.listeners[R];
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
  return b.registerPostcss = (T) => {
    v = T;
  }, go = b, b.default = b, d.registerLazyResult(b), s.registerLazyResult(b), go;
}
var yo, Mc;
function Gy() {
  if (Mc) return yo;
  Mc = 1;
  let e = td(), t = Di(), r = rd(), n = ia();
  const i = ta();
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
  return yo = s, s.default = s, yo;
}
var bo, Rc;
function Xy() {
  if (Rc) return bo;
  Rc = 1;
  let e = Gy(), t = sd(), r = ea(), n = On();
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
  return bo = i, i.default = i, n.registerProcessor(i), r.registerProcessor(i), bo;
}
var vo, Tc;
function Ky() {
  if (Tc) return vo;
  Tc = 1;
  let e = Fi(), t = ed(), r = Bi(), n = ra(), i = Ui(), s = On(), a = na();
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
  return vo = c, c.default = c, vo;
}
var ko, Ac;
function Jy() {
  if (Ac) return ko;
  Ac = 1;
  let e = Zo(), t = Fi(), r = sd(), n = Ar(), i = Xy(), s = Di(), a = Ky(), c = ea(), l = nd(), d = Bi(), o = ra(), h = ta(), p = Ui(), u = ia(), m = id(), f = na(), y = On(), E = $i();
  function v(...b) {
    return b.length === 1 && Array.isArray(b[0]) && (b = b[0]), new i(b);
  }
  return v.plugin = function(T, w) {
    let k = !1;
    function R(...$) {
      console && console.warn && !k && (k = !0, console.warn(
        T + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`
      ), process.env.LANG && process.env.LANG.startsWith("cn") && console.warn(
        T + `: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`
      ));
      let O = w(...$);
      return O.postcssPlugin = T, O.postcssVersion = new i().version, O;
    }
    let I;
    return Object.defineProperty(R, "postcss", {
      get() {
        return I || (I = R()), I;
      }
    }), R.process = function($, O, Z) {
      return v([R(Z)]).process($, O);
    }, R;
  }, v.stringify = s, v.parse = u, v.fromJSON = a, v.list = m, v.comment = (b) => new d(b), v.atRule = (b) => new o(b), v.decl = (b) => new t(b), v.rule = (b) => new f(b), v.root = (b) => new y(b), v.document = (b) => new c(b), v.CssSyntaxError = e, v.Declaration = t, v.Container = n, v.Processor = i, v.Document = c, v.Comment = d, v.Warning = l, v.AtRule = o, v.Result = h, v.Input = p, v.Rule = f, v.Root = y, v.Node = E, r.registerPostcss(v), ko = v, v.default = v, ko;
}
var Zy = Jy();
const We = /* @__PURE__ */ Uy(Zy);
We.stringify;
We.fromJSON;
We.plugin;
We.parse;
We.list;
We.document;
We.comment;
We.atRule;
We.rule;
We.decl;
We.root;
We.CssSyntaxError;
We.Declaration;
We.Container;
We.Processor;
We.Document;
We.Comment;
We.Warning;
We.AtRule;
We.Result;
We.Input;
We.Rule;
We.Root;
We.Node;
class sa {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  constructor(...t) {
    Ct(this, "parentElement", null), Ct(this, "parentNode", null), Ct(this, "ownerDocument"), Ct(this, "firstChild", null), Ct(this, "lastChild", null), Ct(this, "previousSibling", null), Ct(this, "nextSibling", null), Ct(this, "ELEMENT_NODE", 1), Ct(this, "TEXT_NODE", 3), Ct(this, "nodeType"), Ct(this, "nodeName"), Ct(this, "RRNodeType");
  }
  get childNodes() {
    const t = [];
    let r = this.firstChild;
    for (; r; )
      t.push(r), r = r.nextSibling;
    return t;
  }
  contains(t) {
    if (t instanceof sa) {
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
const _c = {
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
}, Lc = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, ai = {}, od = {}, Qy = () => !!globalThis.Zone;
function oa(e) {
  if (ai[e])
    return ai[e];
  const t = globalThis[e], r = t.prototype, n = e in _c ? _c[e] : void 0, i = !!(n && // @ts-expect-error 2345
  n.every(
    (c) => {
      var l, d;
      return !!((d = (l = Object.getOwnPropertyDescriptor(r, c)) == null ? void 0 : l.get) != null && d.toString().includes("[native code]"));
    }
  )), s = e in Lc ? Lc[e] : void 0, a = !!(s && s.every(
    // @ts-expect-error 2345
    (c) => {
      var l;
      return typeof r[c] == "function" && ((l = r[c]) == null ? void 0 : l.toString().includes("[native code]"));
    }
  ));
  if (i && a && !Qy())
    return ai[e] = t.prototype, t.prototype;
  try {
    const c = document.createElement("iframe");
    c.style.display = "none", document.body.appendChild(c);
    const l = c.contentWindow;
    if (!l) return t.prototype;
    const d = l[e].prototype;
    if (!d)
      return c.remove(), r;
    const o = navigator.userAgent;
    return o.includes("Safari") && !o.includes("Chrome") ? (c.classList.add("rr-block"), c.setAttribute("__rrwebUntaintedMutationObserver", ""), od[e] = () => c.remove()) : c.remove(), ai[e] = d;
  } catch {
    return r;
  }
}
const wo = {};
function er(e, t, r) {
  var n;
  const i = `${e}.${String(r)}`;
  if (wo[i])
    return wo[i].call(
      t
    );
  const s = oa(e), a = (n = Object.getOwnPropertyDescriptor(
    s,
    r
  )) == null ? void 0 : n.get;
  return a ? (wo[i] = a, a.call(t)) : t[r];
}
const xo = {};
function ad(e, t, r) {
  const n = `${e}.${String(r)}`;
  if (xo[n])
    return xo[n].bind(
      t
    );
  const s = oa(e)[r];
  return typeof s != "function" ? t[r] : (xo[n] = s, s.bind(t));
}
function eb(e) {
  return er("Node", e, "ownerDocument");
}
function tb(e) {
  return er("Node", e, "childNodes");
}
function rb(e) {
  return er("Node", e, "parentNode");
}
function nb(e) {
  return er("Node", e, "parentElement");
}
function ib(e) {
  return er("Node", e, "textContent");
}
function sb(e, t) {
  return ad("Node", e, "contains")(t);
}
function ob(e) {
  return ad("Node", e, "getRootNode")();
}
function ab(e) {
  return !e || !("host" in e) ? null : er("ShadowRoot", e, "host");
}
function lb(e) {
  return e.styleSheets;
}
function cb(e) {
  return !e || !("shadowRoot" in e) ? null : er("Element", e, "shadowRoot");
}
function ub(e, t) {
  return er("Element", e, "querySelector")(t);
}
function db(e, t) {
  return er("Element", e, "querySelectorAll")(t);
}
function ld() {
  return [
    oa("MutationObserver").constructor,
    od.MutationObserver ?? (() => {
    })
  ];
}
let An = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (An = () => (/* @__PURE__ */ new Date()).getTime());
function _r(e, t, r) {
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
  ownerDocument: eb,
  childNodes: tb,
  parentNode: rb,
  parentElement: nb,
  textContent: ib,
  contains: sb,
  getRootNode: ob,
  host: ab,
  styleSheets: lb,
  shadowRoot: cb,
  querySelector: ub,
  querySelectorAll: db,
  nowTimestamp: An,
  mutationObserverCtor: ld,
  patch: _r
};
function ht(e, t, r = document) {
  const n = { capture: !0, passive: !0 };
  return r.addEventListener(e, t, n), () => r.removeEventListener(e, t, n);
}
const jr = `Please stop import mirror directly. Instead of that,\r
now you can use replayer.getMirror() to access the mirror instance of a replayer,\r
or you can use record.mirror to access the mirror instance during recording.`;
let Ic = {
  map: {},
  getId() {
    return console.error(jr), -1;
  },
  getNode() {
    return console.error(jr), null;
  },
  removeNodeFromMap() {
    console.error(jr);
  },
  has() {
    return console.error(jr), !1;
  },
  reset() {
    console.error(jr);
  }
};
typeof window < "u" && window.Proxy && window.Reflect && (Ic = new Proxy(Ic, {
  get(e, t, r) {
    return t === "map" && console.error(jr), Reflect.get(e, t, r);
  }
}));
function _n(e, t, r = {}) {
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
function qi(e, t, r, n, i = window) {
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
  ), () => qi(e, t, s || {}, !0);
}
function cd(e) {
  var t, r, n, i;
  const s = e.document;
  return {
    left: s.scrollingElement ? s.scrollingElement.scrollLeft : e.pageXOffset !== void 0 ? e.pageXOffset : s.documentElement.scrollLeft || (s == null ? void 0 : s.body) && ((t = ve.parentElement(s.body)) == null ? void 0 : t.scrollLeft) || ((r = s == null ? void 0 : s.body) == null ? void 0 : r.scrollLeft) || 0,
    top: s.scrollingElement ? s.scrollingElement.scrollTop : e.pageYOffset !== void 0 ? e.pageYOffset : (s == null ? void 0 : s.documentElement.scrollTop) || (s == null ? void 0 : s.body) && ((n = ve.parentElement(s.body)) == null ? void 0 : n.scrollTop) || ((i = s == null ? void 0 : s.body) == null ? void 0 : i.scrollTop) || 0
  };
}
function ud() {
  return window.innerHeight || document.documentElement && document.documentElement.clientHeight || document.body && document.body.clientHeight;
}
function dd() {
  return window.innerWidth || document.documentElement && document.documentElement.clientWidth || document.body && document.body.clientWidth;
}
function pd(e) {
  return e ? e.nodeType === e.ELEMENT_NODE ? e : ve.parentElement(e) : null;
}
function ft(e, t, r, n) {
  if (!e)
    return !1;
  const i = pd(e);
  if (!i)
    return !1;
  try {
    if (typeof t == "string") {
      if (i.classList.contains(t) || n && i.closest("." + t) !== null) return !0;
    } else if (xi(i, t, n)) return !0;
  } catch {
  }
  return !!(r && (i.matches(r) || n && i.closest(r) !== null));
}
function pb(e, t) {
  return t.getId(e) !== -1;
}
function So(e, t, r) {
  return e.tagName === "TITLE" && r.headTitleMutations ? !0 : t.getId(e) === Tn;
}
function hd(e, t) {
  if (xn(e))
    return !1;
  const r = t.getId(e);
  if (!t.has(r))
    return !0;
  const n = ve.parentNode(e);
  return n && n.nodeType === e.DOCUMENT_NODE ? !1 : n ? hd(n, t) : !0;
}
function Io(e) {
  return !!e.changedTouches;
}
function hb(e = window) {
  "NodeList" in e && !e.NodeList.prototype.forEach && (e.NodeList.prototype.forEach = Array.prototype.forEach), "DOMTokenList" in e && !e.DOMTokenList.prototype.forEach && (e.DOMTokenList.prototype.forEach = Array.prototype.forEach);
}
function fd(e, t) {
  return !!(e.nodeName === "IFRAME" && t.getMeta(e));
}
function md(e, t) {
  return !!(e.nodeName === "LINK" && e.nodeType === e.ELEMENT_NODE && e.getAttribute && e.getAttribute("rel") === "stylesheet" && t.getMeta(e));
}
function Oo(e) {
  return e ? e instanceof sa && "shadowRoot" in e ? !!e.shadowRoot : !!ve.shadowRoot(e) : !1;
}
class fb {
  constructor() {
    H(this, "id", 1), H(this, "styleIDMap", /* @__PURE__ */ new WeakMap()), H(this, "idStyleMap", /* @__PURE__ */ new Map());
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
function gd(e) {
  var t;
  let r = null;
  return "getRootNode" in e && ((t = ve.getRootNode(e)) == null ? void 0 : t.nodeType) === Node.DOCUMENT_FRAGMENT_NODE && ve.host(ve.getRootNode(e)) && (r = ve.host(ve.getRootNode(e))), r;
}
function mb(e) {
  let t = e, r;
  for (; r = gd(t); )
    t = r;
  return t;
}
function gb(e) {
  const t = ve.ownerDocument(e);
  if (!t) return !1;
  const r = mb(e);
  return ve.contains(t, r);
}
function yd(e) {
  const t = ve.ownerDocument(e);
  return t ? ve.contains(t, e) || gb(e) : !1;
}
var Ae = /* @__PURE__ */ ((e) => (e[e.DomContentLoaded = 0] = "DomContentLoaded", e[e.Load = 1] = "Load", e[e.FullSnapshot = 2] = "FullSnapshot", e[e.IncrementalSnapshot = 3] = "IncrementalSnapshot", e[e.Meta = 4] = "Meta", e[e.Custom = 5] = "Custom", e[e.Plugin = 6] = "Plugin", e[e.Asset = 7] = "Asset", e))(Ae || {}), Ce = /* @__PURE__ */ ((e) => (e[e.Mutation = 0] = "Mutation", e[e.MouseMove = 1] = "MouseMove", e[e.MouseInteraction = 2] = "MouseInteraction", e[e.Scroll = 3] = "Scroll", e[e.ViewportResize = 4] = "ViewportResize", e[e.Input = 5] = "Input", e[e.TouchMove = 6] = "TouchMove", e[e.MediaInteraction = 7] = "MediaInteraction", e[e.StyleSheetRule = 8] = "StyleSheetRule", e[e.CanvasMutation = 9] = "CanvasMutation", e[e.Font = 10] = "Font", e[e.Log = 11] = "Log", e[e.Drag = 12] = "Drag", e[e.StyleDeclaration = 13] = "StyleDeclaration", e[e.Selection = 14] = "Selection", e[e.AdoptedStyleSheet = 15] = "AdoptedStyleSheet", e[e.CustomElement = 16] = "CustomElement", e))(Ce || {}), vt = /* @__PURE__ */ ((e) => (e[e.MouseUp = 0] = "MouseUp", e[e.MouseDown = 1] = "MouseDown", e[e.Click = 2] = "Click", e[e.ContextMenu = 3] = "ContextMenu", e[e.DblClick = 4] = "DblClick", e[e.Focus = 5] = "Focus", e[e.Blur = 6] = "Blur", e[e.TouchStart = 7] = "TouchStart", e[e.TouchMove_Departed = 8] = "TouchMove_Departed", e[e.TouchEnd = 9] = "TouchEnd", e[e.TouchCancel = 10] = "TouchCancel", e))(vt || {}), Zt = /* @__PURE__ */ ((e) => (e[e.Mouse = 0] = "Mouse", e[e.Pen = 1] = "Pen", e[e.Touch = 2] = "Touch", e))(Zt || {}), sn = /* @__PURE__ */ ((e) => (e[e["2D"] = 0] = "2D", e[e.WebGL = 1] = "WebGL", e[e.WebGL2 = 2] = "WebGL2", e))(sn || {}), Yr = /* @__PURE__ */ ((e) => (e[e.Play = 0] = "Play", e[e.Pause = 1] = "Pause", e[e.Seeked = 2] = "Seeked", e[e.VolumeChange = 3] = "VolumeChange", e[e.RateChange = 4] = "RateChange", e))(Yr || {}), bd = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(bd || {});
function Oc(e) {
  return "__ln" in e;
}
class yb {
  constructor() {
    H(this, "length", 0), H(this, "head", null), H(this, "tail", null);
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
    if (t.__ln = r, t.previousSibling && Oc(t.previousSibling)) {
      const n = t.previousSibling.__ln.next;
      r.next = n, r.previous = t.previousSibling.__ln, t.previousSibling.__ln.next = r, n && (n.previous = r);
    } else if (t.nextSibling && Oc(t.nextSibling) && t.nextSibling.__ln.previous) {
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
const Nc = (e, t) => `${e}@${t}`;
class bb {
  constructor() {
    H(this, "frozen", !1), H(this, "locked", !1), H(this, "texts", []), H(this, "attributes", []), H(this, "attributeMap", /* @__PURE__ */ new WeakMap()), H(this, "removes", []), H(this, "mapRemoves", []), H(this, "movedMap", {}), H(this, "addedSet", /* @__PURE__ */ new Set()), H(this, "movedSet", /* @__PURE__ */ new Set()), H(this, "droppedSet", /* @__PURE__ */ new Set()), H(this, "removesSubTreeCache", /* @__PURE__ */ new Set()), H(this, "mutationCb"), H(this, "blockClass"), H(this, "blockSelector"), H(this, "maskTextClass"), H(this, "maskTextSelector"), H(this, "inlineStylesheet"), H(this, "maskInputOptions"), H(this, "maskTextFn"), H(this, "maskInputFn"), H(this, "keepIframeSrcFn"), H(this, "recordCanvas"), H(this, "inlineImages"), H(this, "slimDOMOptions"), H(this, "dataURLOptions"), H(this, "doc"), H(this, "mirror"), H(this, "iframeManager"), H(this, "stylesheetManager"), H(this, "shadowDomManager"), H(this, "canvasManager"), H(this, "processedNodeManager"), H(this, "unattachedDoc"), H(this, "processMutations", (t) => {
      t.forEach(this.processMutation), this.emit();
    }), H(this, "emit", () => {
      if (this.frozen || this.locked)
        return;
      const t = [], r = /* @__PURE__ */ new Set(), n = new yb(), i = (l) => {
        let d = l, o = Tn;
        for (; o === Tn; )
          d = d && d.nextSibling, o = d && this.mirror.getId(d);
        return o;
      }, s = (l) => {
        const d = ve.parentNode(l);
        if (!d || !yd(l))
          return;
        let o = !1;
        if (l.nodeType === Node.TEXT_NODE) {
          const m = d.tagName;
          if (m === "TEXTAREA")
            return;
          m === "STYLE" && this.addedSet.has(d) && (o = !0);
        }
        const h = xn(d) ? this.mirror.getId(gd(l)) : this.mirror.getId(d), p = i(l);
        if (h === -1 || p === -1)
          return n.addNode(l);
        const u = Gr(l, {
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
            fd(m, this.mirror) && this.iframeManager.addIframe(m), md(m, this.mirror) && this.stylesheetManager.trackLinkElement(
              m
            ), Oo(l) && this.shadowDomManager.addShadowRoot(ve.shadowRoot(l), this.doc);
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
        Pc(this.removesSubTreeCache, l, this.mirror) && !this.movedSet.has(ve.parentNode(l)) || s(l);
      for (const l of this.addedSet)
        !zc(this.droppedSet, l) && !Pc(this.removesSubTreeCache, l, this.mirror) || zc(this.movedSet, l) ? s(l) : this.droppedSet.add(l);
      let a = null;
      for (; n.length; ) {
        let l = null;
        if (a) {
          const d = this.mirror.getId(ve.parentNode(a.value)), o = i(a.value);
          d !== -1 && o !== -1 && (l = a);
        }
        if (!l) {
          let d = n.tail;
          for (; d; ) {
            const o = d;
            if (d = d.previous, o) {
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
          const d = l.node, o = ve.parentNode(d);
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
    }), H(this, "genTextAreaValueMutation", (t) => {
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
      r.attributes.value = vi({
        element: t,
        maskInputOptions: this.maskInputOptions,
        tagName: t.tagName,
        type: ki(t),
        value: n,
        maskInputFn: this.maskInputFn
      });
    }), H(this, "processMutation", (t) => {
      if (!So(t.target, this.mirror, this.slimDOMOptions))
        switch (t.type) {
          case "characterData": {
            const r = ve.textContent(t.target);
            !ft(t.target, this.blockClass, this.blockSelector, !1) && r !== t.oldValue && this.texts.push({
              value: Hu(
                t.target,
                this.maskTextClass,
                this.maskTextSelector,
                !0
                // checkAncestors
              ) && r ? this.maskTextFn ? this.maskTextFn(r, pd(t.target)) : r.replace(/[\S]/g, "*") : r,
              node: t.target
            });
            break;
          }
          case "attributes": {
            const r = t.target;
            let n = t.attributeName, i = t.target.getAttribute(n);
            if (n === "value") {
              const a = ki(r);
              i = vi({
                element: r,
                maskInputOptions: this.maskInputOptions,
                tagName: r.tagName,
                type: a,
                value: i,
                maskInputFn: this.maskInputFn
              });
            }
            if (ft(t.target, this.blockClass, this.blockSelector, !1) || i === t.oldValue)
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
            }, this.attributes.push(s), this.attributeMap.set(t.target, s)), n === "type" && r.tagName === "INPUT" && (t.oldValue || "").toLowerCase() === "password" && r.setAttribute("data-rr-is-password", "true"), !Wu(r.tagName, n))
              if (s.attributes[n] = qu(
                this.doc,
                Rr(r.tagName),
                Rr(n),
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
            if (ft(t.target, this.blockClass, this.blockSelector, !0))
              return;
            if (t.target.tagName === "TEXTAREA") {
              this.genTextAreaValueMutation(t.target);
              return;
            }
            t.addedNodes.forEach((r) => this.genAdds(r, t.target)), t.removedNodes.forEach((r) => {
              const n = this.mirror.getId(r), i = xn(t.target) ? this.mirror.getId(ve.host(t.target)) : this.mirror.getId(t.target);
              ft(t.target, this.blockClass, this.blockSelector, !1) || So(r, this.mirror, this.slimDOMOptions) || !pb(r, this.mirror) || (this.addedSet.has(r) ? (No(this.addedSet, r), this.droppedSet.add(r)) : this.addedSet.has(t.target) && n === -1 || hd(t.target, this.mirror) || (this.movedSet.has(r) && this.movedMap[Nc(n, i)] ? No(this.movedSet, r) : (this.removes.push({
                parentId: i,
                id: n,
                isShadow: xn(t.target) && Sn(t.target) ? !0 : void 0
              }), vb(r, this.removesSubTreeCache))), this.mapRemoves.push(r));
            });
            break;
          }
        }
    }), H(this, "genAdds", (t, r) => {
      if (!this.processedNodeManager.inOtherBuffer(t, this) && !(this.addedSet.has(t) || this.movedSet.has(t))) {
        if (this.mirror.hasNode(t)) {
          if (So(t, this.mirror, this.slimDOMOptions))
            return;
          this.movedSet.add(t);
          let n = null;
          r && this.mirror.hasNode(r) && (n = this.mirror.getId(r)), n && n !== -1 && (this.movedMap[Nc(this.mirror.getId(t), n)] = !0);
        } else
          this.addedSet.add(t), this.droppedSet.delete(t);
        ft(t, this.blockClass, this.blockSelector, !1) || (ve.childNodes(t).forEach((n) => this.genAdds(n)), Oo(t) && ve.childNodes(ve.shadowRoot(t)).forEach((n) => {
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
function No(e, t) {
  e.delete(t), ve.childNodes(t).forEach((r) => No(e, r));
}
function vb(e, t) {
  const r = [e];
  for (; r.length; ) {
    const n = r.pop();
    t.has(n) || (t.add(n), ve.childNodes(n).forEach((i) => r.push(i)));
  }
}
function Pc(e, t, r) {
  return e.size === 0 ? !1 : kb(e, t);
}
function kb(e, t, r) {
  const n = ve.parentNode(t);
  return n ? e.has(n) : !1;
}
function zc(e, t) {
  return e.size === 0 ? !1 : vd(e, t);
}
function vd(e, t) {
  const r = ve.parentNode(t);
  return r ? e.has(r) ? !0 : vd(e, r) : !1;
}
let En;
function wb(e) {
  En = e;
}
function xb() {
  En = void 0;
}
const Te = (e) => En ? (...r) => {
  try {
    return e(...r);
  } catch (n) {
    if (En && En(n) === !0)
      return;
    throw n;
  }
} : e, Er = [];
function Nn(e) {
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
function kd(e, t) {
  const r = new bb();
  Er.push(r), r.init(e);
  const [n, i] = ld(), s = new n(
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
function Sb({
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
  const l = _n(
    Te(
      (h) => {
        const p = Date.now() - c;
        e(
          a.map((u) => (u.timeOffset -= p, u)),
          h
        ), a = [], c = null;
      }
    ),
    s
  ), d = Te(
    _n(
      Te((h) => {
        const p = Nn(h), { clientX: u, clientY: m } = Io(h) ? h.changedTouches[0] : h;
        c || (c = An()), a.push({
          x: u,
          y: m,
          id: n.getId(p),
          timeOffset: An() - c
        }), l(
          typeof DragEvent < "u" && h instanceof DragEvent ? Ce.Drag : h instanceof MouseEvent ? Ce.MouseMove : Ce.TouchMove
        );
      }),
      i,
      {
        trailing: !1
      }
    )
  ), o = [
    ht("mousemove", d, r),
    ht("touchmove", d, r),
    ht("drag", d, r)
  ];
  return Te(() => {
    o.forEach((h) => h());
  });
}
function Eb({
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
    const p = Nn(h);
    if (ft(p, n, i, !0))
      return;
    let u = null, m = o;
    if ("pointerType" in h) {
      switch (h.pointerType) {
        case "mouse":
          u = Zt.Mouse;
          break;
        case "touch":
          u = Zt.Touch;
          break;
        case "pen":
          u = Zt.Pen;
          break;
      }
      u === Zt.Touch ? vt[o] === vt.MouseDown ? m = "TouchStart" : vt[o] === vt.MouseUp && (m = "TouchEnd") : Zt.Pen;
    } else Io(h) && (u = Zt.Touch);
    u !== null ? (l = u, (m.startsWith("Touch") && u === Zt.Touch || m.startsWith("Mouse") && u === Zt.Mouse) && (u = null)) : vt[o] === vt.Click && (u = l, l = null);
    const f = Io(h) ? h.changedTouches[0] : h;
    if (!f)
      return;
    const y = r.getId(p), { clientX: E, clientY: v } = f;
    Te(e)({
      type: vt[m],
      id: y,
      x: E,
      y: v,
      ...u !== null && { pointerType: u }
    });
  };
  return Object.keys(vt).filter(
    (o) => Number.isNaN(Number(o)) && !o.endsWith("_Departed") && a[o] !== !1
  ).forEach((o) => {
    let h = Rr(o);
    const p = d(o);
    if (window.PointerEvent)
      switch (vt[o]) {
        case vt.MouseDown:
        case vt.MouseUp:
          h = h.replace(
            "mouse",
            "pointer"
          );
          break;
        case vt.TouchStart:
        case vt.TouchEnd:
          return;
      }
    c.push(ht(h, p, t));
  }), Te(() => {
    c.forEach((o) => o());
  });
}
function wd({
  scrollCb: e,
  doc: t,
  mirror: r,
  blockClass: n,
  blockSelector: i,
  sampling: s
}) {
  const a = Te(
    _n(
      Te((c) => {
        const l = Nn(c);
        if (!l || ft(l, n, i, !0))
          return;
        const d = r.getId(l);
        if (l === t && t.defaultView) {
          const o = cd(t.defaultView);
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
  return ht("scroll", a, t);
}
function Cb({ viewportResizeCb: e }, { win: t }) {
  let r = -1, n = -1;
  const i = Te(
    _n(
      Te(() => {
        const s = ud(), a = dd();
        (r !== s || n !== a) && (e({
          width: Number(a),
          height: Number(s)
        }), r = s, n = a);
      }),
      200
    )
  );
  return ht("resize", i, t);
}
const Mb = ["INPUT", "TEXTAREA", "SELECT"], Dc = /* @__PURE__ */ new WeakMap();
function Rb({
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
    let b = Nn(v);
    const T = v.isTrusted, w = b && b.tagName;
    if (b && w === "OPTION" && (b = ve.parentElement(b)), !b || !w || Mb.indexOf(w) < 0 || ft(b, n, i, !0) || b.classList.contains(s) || a && b.matches(a))
      return;
    let k = b.value, R = !1;
    const I = ki(b) || "";
    I === "radio" || I === "checkbox" ? R = b.checked : (c[w.toLowerCase()] || c[I]) && (k = vi({
      element: b,
      maskInputOptions: c,
      tagName: w,
      type: I,
      value: k,
      maskInputFn: l
    })), p(
      b,
      o ? { text: k, isChecked: R, userTriggered: T } : { text: k, isChecked: R }
    );
    const $ = b.name;
    I === "radio" && $ && R && t.querySelectorAll(`input[type="radio"][name="${$}"]`).forEach((O) => {
      if (O !== b) {
        const Z = O.value;
        p(
          O,
          o ? { text: Z, isChecked: !R, userTriggered: !1 } : { text: Z, isChecked: !R }
        );
      }
    });
  }
  function p(v, b) {
    const T = Dc.get(v);
    if (!T || T.text !== b.text || T.isChecked !== b.isChecked) {
      Dc.set(v, b);
      const w = r.getId(v);
      Te(e)({
        ...b,
        id: w
      });
    }
  }
  const m = (d.input === "last" ? ["change"] : ["input", "change"]).map(
    (v) => ht(v, Te(h), t)
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
      (v) => qi(
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
function Si(e) {
  const t = [];
  function r(n, i) {
    if (li("CSSGroupingRule") && n.parentRule instanceof CSSGroupingRule || li("CSSMediaRule") && n.parentRule instanceof CSSMediaRule || li("CSSSupportsRule") && n.parentRule instanceof CSSSupportsRule || li("CSSConditionRule") && n.parentRule instanceof CSSConditionRule) {
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
function lr(e, t, r) {
  let n, i;
  return e ? (e.ownerNode ? n = t.getId(e.ownerNode) : i = r.getId(e), {
    styleId: i,
    id: n
  }) : {};
}
function Tb({ styleSheetRuleCb: e, mirror: t, stylesheetManager: r }, { win: n }) {
  if (!n.CSSStyleSheet || !n.CSSStyleSheet.prototype)
    return () => {
    };
  const i = n.CSSStyleSheet.prototype.insertRule;
  n.CSSStyleSheet.prototype.insertRule = new Proxy(i, {
    apply: Te(
      (o, h, p) => {
        const [u, m] = p, { id: f, styleId: y } = lr(
          h,
          t,
          r.styleMirror
        );
        return (f && f !== -1 || y && y !== -1) && e({
          id: f,
          styleId: y,
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
    apply: Te(
      (o, h, p) => {
        const [u] = p, { id: m, styleId: f } = lr(
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
    apply: Te(
      (o, h, p) => {
        const [u] = p, { id: m, styleId: f } = lr(
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
    apply: Te(
      (o, h, p) => {
        const [u] = p, { id: m, styleId: f } = lr(
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
  ci("CSSGroupingRule") ? l.CSSGroupingRule = n.CSSGroupingRule : (ci("CSSMediaRule") && (l.CSSMediaRule = n.CSSMediaRule), ci("CSSConditionRule") && (l.CSSConditionRule = n.CSSConditionRule), ci("CSSSupportsRule") && (l.CSSSupportsRule = n.CSSSupportsRule));
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
        apply: Te(
          (p, u, m) => {
            const [f, y] = m, { id: E, styleId: v } = lr(
              u.parentStyleSheet,
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
                    ...Si(u),
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
      d[o].deleteRule,
      {
        apply: Te(
          (p, u, m) => {
            const [f] = m, { id: y, styleId: E } = lr(
              u.parentStyleSheet,
              t,
              r.styleMirror
            );
            return (y && y !== -1 || E && E !== -1) && e({
              id: y,
              styleId: E,
              removes: [
                { index: [...Si(u), f] }
              ]
            }), p.apply(u, m);
          }
        )
      }
    );
  }), Te(() => {
    n.CSSStyleSheet.prototype.insertRule = i, n.CSSStyleSheet.prototype.deleteRule = s, a && (n.CSSStyleSheet.prototype.replace = a), c && (n.CSSStyleSheet.prototype.replaceSync = c), Object.entries(l).forEach(([o, h]) => {
      h.prototype.insertRule = d[o].insertRule, h.prototype.deleteRule = d[o].deleteRule;
    });
  });
}
function xd({
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
function Ab({
  styleDeclarationCb: e,
  mirror: t,
  ignoreCSSAttributes: r,
  stylesheetManager: n
}, { win: i }) {
  const s = i.CSSStyleDeclaration.prototype.setProperty;
  i.CSSStyleDeclaration.prototype.setProperty = new Proxy(s, {
    apply: Te(
      (c, l, d) => {
        var o;
        const [h, p, u] = d;
        if (r.has(h))
          return s.apply(l, [h, p, u]);
        const { id: m, styleId: f } = lr(
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
          index: Si(l.parentRule)
        }), c.apply(l, d);
      }
    )
  });
  const a = i.CSSStyleDeclaration.prototype.removeProperty;
  return i.CSSStyleDeclaration.prototype.removeProperty = new Proxy(a, {
    apply: Te(
      (c, l, d) => {
        var o;
        const [h] = d;
        if (r.has(h))
          return a.apply(l, [h]);
        const { id: p, styleId: u } = lr(
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
          index: Si(l.parentRule)
        }), c.apply(l, d);
      }
    )
  }), Te(() => {
    i.CSSStyleDeclaration.prototype.setProperty = s, i.CSSStyleDeclaration.prototype.removeProperty = a;
  });
}
function _b({
  mediaInteractionCb: e,
  blockClass: t,
  blockSelector: r,
  mirror: n,
  sampling: i,
  doc: s
}) {
  const a = Te(
    (l) => _n(
      Te((d) => {
        const o = Nn(d);
        if (!o || ft(o, t, r, !0))
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
    ht("play", a(Yr.Play), s),
    ht("pause", a(Yr.Pause), s),
    ht("seeked", a(Yr.Seeked), s),
    ht("volumechange", a(Yr.VolumeChange), s),
    ht("ratechange", a(Yr.RateChange), s)
  ];
  return Te(() => {
    c.forEach((l) => l());
  });
}
function Lb({ fontCb: e, doc: t }) {
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
  const a = _r(
    t.fonts,
    "add",
    function(c) {
      return function(l) {
        return setTimeout(
          Te(() => {
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
  }), n.push(a), Te(() => {
    n.forEach((c) => c());
  });
}
function Ib(e) {
  const { doc: t, mirror: r, blockClass: n, blockSelector: i, selectionCb: s } = e;
  let a = !0;
  const c = Te(() => {
    const l = t.getSelection();
    if (!l || a && (l != null && l.isCollapsed)) return;
    a = l.isCollapsed || !1;
    const d = [], o = l.rangeCount || 0;
    for (let h = 0; h < o; h++) {
      const p = l.getRangeAt(h), { startContainer: u, startOffset: m, endContainer: f, endOffset: y } = p;
      ft(u, n, i, !0) || ft(f, n, i, !0) || d.push({
        start: r.getId(u),
        startOffset: m,
        end: r.getId(f),
        endOffset: y
      });
    }
    s({ ranges: d });
  });
  return c(), ht("selectionchange", c);
}
function Ob({
  doc: e,
  customElementCb: t
}) {
  const r = e.defaultView;
  return !r || !r.customElements ? () => {
  } : _r(
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
function Nb(e, t) {
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
function Pb(e, t = {}) {
  const r = e.doc.defaultView;
  if (!r)
    return () => {
    };
  Nb(e, t);
  let n, i = () => {
  };
  e.recordDOM && ([n, i] = kd(e, e.doc));
  const s = Sb(e), a = Eb(e), c = wd(e), l = Cb(e, {
    win: r
  }), d = Rb(e), o = _b(e);
  let h = () => {
  }, p = () => {
  }, u = () => {
  }, m = () => {
  };
  e.recordDOM && (h = Tb(e, { win: r }), p = xd(e, e.doc), u = Ab(e, {
    win: r
  }), e.collectFonts && (m = Lb(e)));
  const f = Ib(e), y = Ob(e), E = [];
  for (const v of e.plugins)
    E.push(
      v.observer(v.callback, r, v.options)
    );
  return Te(() => {
    Er.forEach((v) => v.reset()), n == null || n.disconnect(), i(), s(), a(), c(), l(), d(), o(), h(), p(), u(), m(), f(), y(), E.forEach((v) => v());
  });
}
function li(e) {
  return typeof window[e] < "u";
}
function ci(e) {
  return !!(typeof window[e] < "u" && // Note: Generally, this check _shouldn't_ be necessary
  // However, in some scenarios (e.g. jsdom) this can sometimes fail, so we check for it here
  window[e].prototype && "insertRule" in window[e].prototype && "deleteRule" in window[e].prototype);
}
class $c {
  constructor(t) {
    H(this, "iframeIdToRemoteIdMap", /* @__PURE__ */ new WeakMap()), H(this, "iframeRemoteIdToIdMap", /* @__PURE__ */ new WeakMap()), this.generateIdFn = t;
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
class zb {
  constructor(t) {
    H(this, "iframes", /* @__PURE__ */ new WeakMap()), H(this, "crossOriginIframeMap", /* @__PURE__ */ new WeakMap()), H(this, "crossOriginIframeMirror", new $c(Bu)), H(this, "crossOriginIframeStyleMirror"), H(this, "crossOriginIframeRootIdMap", /* @__PURE__ */ new WeakMap()), H(this, "mirror"), H(this, "mutationCb"), H(this, "wrappedEmit"), H(this, "loadListener"), H(this, "stylesheetManager"), H(this, "recordCrossOriginIframes"), this.mutationCb = t.mutationCb, this.wrappedEmit = t.wrappedEmit, this.stylesheetManager = t.stylesheetManager, this.recordCrossOriginIframes = t.recordCrossOriginIframes, this.crossOriginIframeStyleMirror = new $c(
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
            source: Ce.Mutation,
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
          case Ce.Mutation:
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
          case Ce.Drag:
          case Ce.TouchMove:
          case Ce.MouseMove:
            return r.data.positions.forEach((i) => {
              this.replaceIds(i, t, ["id"]);
            }), r;
          case Ce.ViewportResize:
            return !1;
          case Ce.MediaInteraction:
          case Ce.MouseInteraction:
          case Ce.Scroll:
          case Ce.CanvasMutation:
          case Ce.Input:
            return this.replaceIds(r.data, t, ["id"]), r;
          case Ce.StyleSheetRule:
          case Ce.StyleDeclaration:
            return this.replaceIds(r.data, t, ["id"]), this.replaceStyleIds(r.data, t, ["styleId"]), r;
          case Ce.Font:
            return r;
          case Ce.Selection:
            return r.data.ranges.forEach((i) => {
              this.replaceIds(i, t, ["start", "end"]);
            }), r;
          case Ce.AdoptedStyleSheet:
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
    t.type !== bd.Document && !t.rootId && (t.rootId = r), "childNodes" in t && t.childNodes.forEach((n) => {
      this.patchRootIdOnNode(n, r);
    });
  }
}
class Db {
  constructor(t) {
    H(this, "shadowDoms", /* @__PURE__ */ new WeakSet()), H(this, "mutationCb"), H(this, "scrollCb"), H(this, "bypassOptions"), H(this, "mirror"), H(this, "restoreHandlers", []), this.mutationCb = t.mutationCb, this.scrollCb = t.scrollCb, this.bypassOptions = t.bypassOptions, this.mirror = t.mirror, this.init();
  }
  init() {
    this.reset(), this.patchAttachShadow(Element, document);
  }
  addShadowRoot(t, r) {
    if (!Sn(t) || this.shadowDoms.has(t)) return;
    this.shadowDoms.add(t);
    const [n] = kd(
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
      wd({
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
        xd(
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
      _r(
        t.prototype,
        "attachShadow",
        function(i) {
          return function(s) {
            const a = i.call(this, s), c = ve.shadowRoot(this);
            return c && yd(this) && n.addShadowRoot(c, r), a;
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
var Xr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", $b = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (var ui = 0; ui < Xr.length; ui++)
  $b[Xr.charCodeAt(ui)] = ui;
var Fb = function(e) {
  var t = new Uint8Array(e), r, n = t.length, i = "";
  for (r = 0; r < n; r += 3)
    i += Xr[t[r] >> 2], i += Xr[(t[r] & 3) << 4 | t[r + 1] >> 4], i += Xr[(t[r + 1] & 15) << 2 | t[r + 2] >> 6], i += Xr[t[r + 2] & 63];
  return n % 3 === 2 ? i = i.substring(0, i.length - 1) + "=" : n % 3 === 1 && (i = i.substring(0, i.length - 2) + "=="), i;
};
const Fc = /* @__PURE__ */ new Map();
function Ub(e, t) {
  let r = Fc.get(e);
  return r || (r = /* @__PURE__ */ new Map(), Fc.set(e, r)), r.has(t) || r.set(t, []), r.get(t);
}
const Sd = (e, t, r) => {
  if (!e || !(Cd(e, t) || typeof e == "object"))
    return;
  const n = e.constructor.name, i = Ub(r, n);
  let s = i.indexOf(e);
  return s === -1 && (s = i.length, i.push(e)), s;
};
function hi(e, t, r) {
  if (e instanceof Array)
    return e.map((n) => hi(n, t, r));
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
    const n = e.constructor.name, i = Fb(e);
    return {
      rr_type: n,
      base64: i
    };
  } else {
    if (e instanceof DataView)
      return {
        rr_type: e.constructor.name,
        args: [
          hi(e.buffer, t, r),
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
          args: [hi(e.data, t, r), e.width, e.height]
        };
      if (Cd(e, t) || typeof e == "object") {
        const n = e.constructor.name, i = Sd(e, t, r);
        return {
          rr_type: n,
          index: i
        };
      }
    }
  }
  return e;
}
const Ed = (e, t, r) => e.map((n) => hi(n, t, r)), Cd = (e, t) => !![
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
function Bb(e, t, r, n) {
  const i = [], s = Object.getOwnPropertyNames(
    t.CanvasRenderingContext2D.prototype
  );
  for (const a of s)
    try {
      if (typeof t.CanvasRenderingContext2D.prototype[a] != "function")
        continue;
      const c = _r(
        t.CanvasRenderingContext2D.prototype,
        a,
        function(l) {
          return function(...d) {
            return ft(this.canvas, r, n, !0) || setTimeout(() => {
              const o = Ed(d, t, this);
              e(this.canvas, {
                type: sn["2D"],
                property: a,
                args: o
              });
            }, 0), l.apply(this, d);
          };
        }
      );
      i.push(c);
    } catch {
      const c = qi(
        t.CanvasRenderingContext2D.prototype,
        a,
        {
          set(l) {
            e(this.canvas, {
              type: sn["2D"],
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
function qb(e) {
  return e === "experimental-webgl" ? "webgl" : e;
}
function Uc(e, t, r, n) {
  const i = [];
  try {
    const s = _r(
      e.HTMLCanvasElement.prototype,
      "getContext",
      function(a) {
        return function(c, ...l) {
          if (!ft(this, t, r, !0)) {
            const d = qb(c);
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
function Bc(e, t, r, n, i, s) {
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
        const d = _r(
          e,
          l,
          function(o) {
            return function(...h) {
              const p = o.apply(this, h);
              if (Sd(p, s, this), "tagName" in this.canvas && !ft(this.canvas, n, i, !0)) {
                const u = Ed(h, s, this), m = {
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
        const d = qi(e, l, {
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
function Wb(e, t, r, n) {
  const i = [];
  return typeof t.WebGLRenderingContext < "u" && i.push(
    ...Bc(
      t.WebGLRenderingContext.prototype,
      sn.WebGL,
      e,
      r,
      n,
      t
    )
  ), typeof t.WebGL2RenderingContext < "u" && i.push(
    ...Bc(
      t.WebGL2RenderingContext.prototype,
      sn.WebGL2,
      e,
      r,
      n,
      t
    )
  ), () => {
    i.forEach((s) => s());
  };
}
const Md = `(function() {
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
`, qc = typeof self < "u" && self.Blob && new Blob([Md], { type: "text/javascript;charset=utf-8" });
function Hb(e) {
  let t;
  try {
    if (t = qc && (self.URL || self.webkitURL).createObjectURL(qc), !t) throw "";
    const r = new Worker(t, {
      name: e == null ? void 0 : e.name
    });
    return r.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(t);
    }), r;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(Md),
      {
        name: e == null ? void 0 : e.name
      }
    );
  } finally {
    t && (self.URL || self.webkitURL).revokeObjectURL(t);
  }
}
class jb {
  constructor(t) {
    H(this, "pendingCanvasMutations", /* @__PURE__ */ new Map()), H(this, "rafStamps", { latestId: 0, invokeId: null }), H(this, "mirror"), H(this, "mutationCb"), H(this, "resetObservers"), H(this, "frozen", !1), H(this, "locked", !1), H(this, "processMutation", (l, d) => {
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
    const a = Uc(
      r,
      n,
      i,
      !0
    ), c = /* @__PURE__ */ new Map(), l = new Hb();
    l.onmessage = (m) => {
      const { id: f } = m.data;
      if (c.set(f, !1), !("base64" in m.data)) return;
      const { base64: y, type: E, width: v, height: b } = m.data;
      this.mutationCb({
        id: f,
        type: sn["2D"],
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
    const d = 1e3 / t;
    let o = 0, h;
    const p = () => {
      const m = [];
      return r.document.querySelectorAll("canvas").forEach((f) => {
        ft(f, n, i, !0) || m.push(f);
      }), m;
    }, u = (m) => {
      if (o && m - o < d) {
        h = requestAnimationFrame(u);
        return;
      }
      o = m, p().forEach(async (f) => {
        var y;
        const E = this.mirror.getId(f);
        if (c.get(E) || f.width === 0 || f.height === 0) return;
        if (c.set(E, !0), ["webgl", "webgl2"].includes(f.__context)) {
          const b = f.getContext(f.__context);
          ((y = b == null ? void 0 : b.getContextAttributes()) == null ? void 0 : y.preserveDrawingBuffer) === !1 && b.clear(b.COLOR_BUFFER_BIT);
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
      }), h = requestAnimationFrame(u);
    };
    h = requestAnimationFrame(u), this.resetObservers = () => {
      a(), cancelAnimationFrame(h);
    };
  }
  initCanvasMutationObserver(t, r, n) {
    this.startRAFTimestamping(), this.startPendingCanvasMutationFlusher();
    const i = Uc(
      t,
      r,
      n,
      !1
    ), s = Bb(
      this.processMutation.bind(this),
      t,
      r,
      n
    ), a = Wb(
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
class Yb {
  constructor(t) {
    H(this, "trackedLinkElements", /* @__PURE__ */ new WeakSet()), H(this, "mutationCb"), H(this, "adoptedStyleSheetCb"), H(this, "styleMirror", new fb()), this.mutationCb = t.mutationCb, this.adoptedStyleSheetCb = t.adoptedStyleSheetCb;
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
          rule: $u(c, s.href),
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
class Vb {
  constructor() {
    H(this, "nodeMap", /* @__PURE__ */ new WeakMap()), H(this, "active", !1);
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
let Ve, fi, Eo, Ei = !1;
try {
  if (Array.from([1], (e) => e * 2)[0] !== 2) {
    const e = document.createElement("iframe");
    document.body.appendChild(e), Array.from = ((vl = e.contentWindow) == null ? void 0 : vl.Array.from) || Array.from, document.body.removeChild(e);
  }
} catch (e) {
  console.debug("Unable to override Array.from", e);
}
const Nt = ey();
function hr(e = {}) {
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
    hooks: y,
    packFn: E,
    sampling: v = {},
    dataURLOptions: b = {},
    mousemoveWait: T,
    recordDOM: w = !0,
    recordCanvas: k = !1,
    recordCrossOriginIframes: R = !1,
    recordAfter: I = e.recordAfter === "DOMContentLoaded" ? e.recordAfter : "load",
    userTriggeredOnInput: $ = !1,
    collectFonts: O = !1,
    inlineImages: Z = !1,
    plugins: q,
    keepIframeSrcFn: L = () => !1,
    ignoreCSSAttributes: Ze = /* @__PURE__ */ new Set([]),
    errorHandler: Ye
  } = e;
  wb(Ye);
  const ye = R ? window.parent === window : !0;
  let he = !1;
  if (!ye)
    try {
      window.parent.document && (he = !1);
    } catch {
      he = !0;
    }
  if (ye && !t)
    throw new Error("emit function is required");
  if (!ye && !he)
    return () => {
    };
  T !== void 0 && v.mousemove === void 0 && (v.mousemove = T), Nt.reset();
  const Ie = h === !0 ? {
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
  } : p !== void 0 ? p : { password: !0 }, Fe = ju(u);
  hb();
  let Oe, de = 0;
  const j = (oe) => {
    for (const $e of q || [])
      $e.eventProcessor && (oe = $e.eventProcessor(oe));
    return E && // Disable packing events which will be emitted to parent frames.
    !he && (oe = E(oe)), oe;
  };
  Ve = (oe, $e) => {
    var ge;
    const Ne = oe;
    if (Ne.timestamp = An(), (ge = Er[0]) != null && ge.isFrozen() && Ne.type !== Ae.FullSnapshot && !(Ne.type === Ae.IncrementalSnapshot && Ne.data.source === Ce.Mutation) && Er.forEach((Me) => Me.unfreeze()), ye)
      t == null || t(j(Ne), $e);
    else if (he) {
      const Me = {
        type: "rrweb",
        event: j(Ne),
        origin: window.location.origin,
        isCheckout: $e
      };
      window.parent.postMessage(Me, "*");
    }
    if (Ne.type === Ae.FullSnapshot)
      Oe = Ne, de = 0;
    else if (Ne.type === Ae.IncrementalSnapshot) {
      if (Ne.data.source === Ce.Mutation && Ne.data.isAttachIframe)
        return;
      de++;
      const Me = n && de >= n, ke = r && Ne.timestamp - Oe.timestamp > r;
      (Me || ke) && fi(!0);
    }
  };
  const D = (oe) => {
    Ve({
      type: Ae.IncrementalSnapshot,
      data: {
        source: Ce.Mutation,
        ...oe
      }
    });
  }, G = (oe) => Ve({
    type: Ae.IncrementalSnapshot,
    data: {
      source: Ce.Scroll,
      ...oe
    }
  }), ie = (oe) => Ve({
    type: Ae.IncrementalSnapshot,
    data: {
      source: Ce.CanvasMutation,
      ...oe
    }
  }), _e = (oe) => Ve({
    type: Ae.IncrementalSnapshot,
    data: {
      source: Ce.AdoptedStyleSheet,
      ...oe
    }
  }), pe = new Yb({
    mutationCb: D,
    adoptedStyleSheetCb: _e
  }), fe = new zb({
    mirror: Nt,
    mutationCb: D,
    stylesheetManager: pe,
    recordCrossOriginIframes: R,
    wrappedEmit: Ve
  });
  for (const oe of q || [])
    oe.getMirror && oe.getMirror({
      nodeMirror: Nt,
      crossOriginIframeMirror: fe.crossOriginIframeMirror,
      crossOriginIframeStyleMirror: fe.crossOriginIframeStyleMirror
    });
  const Se = new Vb();
  Eo = new jb({
    recordCanvas: k,
    mutationCb: ie,
    win: window,
    blockClass: i,
    blockSelector: s,
    mirror: Nt,
    sampling: v.canvas,
    dataURLOptions: b
  });
  const me = new Db({
    mutationCb: D,
    scrollCb: G,
    bypassOptions: {
      blockClass: i,
      blockSelector: s,
      maskTextClass: l,
      maskTextSelector: d,
      inlineStylesheet: o,
      maskInputOptions: Ie,
      dataURLOptions: b,
      maskTextFn: f,
      maskInputFn: m,
      recordCanvas: k,
      inlineImages: Z,
      sampling: v,
      slimDOMOptions: Fe,
      iframeManager: fe,
      stylesheetManager: pe,
      canvasManager: Eo,
      keepIframeSrcFn: L,
      processedNodeManager: Se
    },
    mirror: Nt
  });
  fi = (oe = !1) => {
    if (!w)
      return;
    Ve(
      {
        type: Ae.Meta,
        data: {
          href: window.location.href,
          width: dd(),
          height: ud()
        }
      },
      oe
    ), pe.reset(), me.init(), Er.forEach((ge) => ge.lock());
    const $e = Ey(document, {
      mirror: Nt,
      blockClass: i,
      blockSelector: s,
      maskTextClass: l,
      maskTextSelector: d,
      inlineStylesheet: o,
      maskAllInputs: Ie,
      maskTextFn: f,
      maskInputFn: m,
      slimDOM: Fe,
      dataURLOptions: b,
      recordCanvas: k,
      inlineImages: Z,
      onSerialize: (ge) => {
        fd(ge, Nt) && fe.addIframe(ge), md(ge, Nt) && pe.trackLinkElement(ge), Oo(ge) && me.addShadowRoot(ve.shadowRoot(ge), document);
      },
      onIframeLoad: (ge, Ne) => {
        fe.attachIframe(ge, Ne), me.observeAttachShadow(ge);
      },
      onStylesheetLoad: (ge, Ne) => {
        pe.attachLinkElement(ge, Ne);
      },
      keepIframeSrcFn: L
    });
    if (!$e)
      return console.warn("Failed to snapshot the document");
    Ve(
      {
        type: Ae.FullSnapshot,
        data: {
          node: $e,
          initialOffset: cd(window)
        }
      },
      oe
    ), Er.forEach((ge) => ge.unlock()), document.adoptedStyleSheets && document.adoptedStyleSheets.length > 0 && pe.adoptStyleSheets(
      document.adoptedStyleSheets,
      Nt.getId(document)
    );
  };
  try {
    const oe = [], $e = (Ne) => {
      var Me;
      return Te(Pb)(
        {
          mutationCb: D,
          mousemoveCb: (ke, At) => Ve({
            type: Ae.IncrementalSnapshot,
            data: {
              source: At,
              positions: ke
            }
          }),
          mouseInteractionCb: (ke) => Ve({
            type: Ae.IncrementalSnapshot,
            data: {
              source: Ce.MouseInteraction,
              ...ke
            }
          }),
          scrollCb: G,
          viewportResizeCb: (ke) => Ve({
            type: Ae.IncrementalSnapshot,
            data: {
              source: Ce.ViewportResize,
              ...ke
            }
          }),
          inputCb: (ke) => Ve({
            type: Ae.IncrementalSnapshot,
            data: {
              source: Ce.Input,
              ...ke
            }
          }),
          mediaInteractionCb: (ke) => Ve({
            type: Ae.IncrementalSnapshot,
            data: {
              source: Ce.MediaInteraction,
              ...ke
            }
          }),
          styleSheetRuleCb: (ke) => Ve({
            type: Ae.IncrementalSnapshot,
            data: {
              source: Ce.StyleSheetRule,
              ...ke
            }
          }),
          styleDeclarationCb: (ke) => Ve({
            type: Ae.IncrementalSnapshot,
            data: {
              source: Ce.StyleDeclaration,
              ...ke
            }
          }),
          canvasMutationCb: ie,
          fontCb: (ke) => Ve({
            type: Ae.IncrementalSnapshot,
            data: {
              source: Ce.Font,
              ...ke
            }
          }),
          selectionCb: (ke) => {
            Ve({
              type: Ae.IncrementalSnapshot,
              data: {
                source: Ce.Selection,
                ...ke
              }
            });
          },
          customElementCb: (ke) => {
            Ve({
              type: Ae.IncrementalSnapshot,
              data: {
                source: Ce.CustomElement,
                ...ke
              }
            });
          },
          blockClass: i,
          ignoreClass: a,
          ignoreSelector: c,
          maskTextClass: l,
          maskTextSelector: d,
          maskInputOptions: Ie,
          inlineStylesheet: o,
          sampling: v,
          recordDOM: w,
          recordCanvas: k,
          inlineImages: Z,
          userTriggeredOnInput: $,
          collectFonts: O,
          doc: Ne,
          maskInputFn: m,
          maskTextFn: f,
          keepIframeSrcFn: L,
          blockSelector: s,
          slimDOMOptions: Fe,
          dataURLOptions: b,
          mirror: Nt,
          iframeManager: fe,
          stylesheetManager: pe,
          shadowDomManager: me,
          processedNodeManager: Se,
          canvasManager: Eo,
          ignoreCSSAttributes: Ze,
          plugins: ((Me = q == null ? void 0 : q.filter((ke) => ke.observer)) == null ? void 0 : Me.map((ke) => ({
            observer: ke.observer,
            options: ke.options,
            callback: (At) => Ve({
              type: Ae.Plugin,
              data: {
                plugin: ke.name,
                payload: At
              }
            })
          }))) || []
        },
        y
      );
    };
    fe.addLoadListener((Ne) => {
      try {
        oe.push($e(Ne.contentDocument));
      } catch (Me) {
        console.warn(Me);
      }
    });
    const ge = () => {
      fi(), oe.push($e(document)), Ei = !0;
    };
    return ["interactive", "complete"].includes(document.readyState) ? ge() : (oe.push(
      ht("DOMContentLoaded", () => {
        Ve({
          type: Ae.DomContentLoaded,
          data: {}
        }), I === "DOMContentLoaded" && ge();
      })
    ), oe.push(
      ht(
        "load",
        () => {
          Ve({
            type: Ae.Load,
            data: {}
          }), I === "load" && ge();
        },
        window
      )
    )), () => {
      oe.forEach((Ne) => {
        try {
          Ne();
        } catch (Me) {
          String(Me).toLowerCase().includes("cross-origin") || console.warn(Me);
        }
      }), Se.destroy(), Ei = !1, xb();
    };
  } catch (oe) {
    console.warn(oe);
  }
}
hr.addCustomEvent = (e, t) => {
  if (!Ei)
    throw new Error("please add custom event after start recording");
  Ve({
    type: Ae.Custom,
    data: {
      tag: e,
      payload: t
    }
  });
};
hr.freezePage = () => {
  Er.forEach((e) => e.freeze());
};
hr.takeFullSnapshot = (e) => {
  if (!Ei)
    throw new Error("please take full snapshot after start recording");
  fi(e);
};
hr.mirror = Nt;
var Wc;
(function(e) {
  e[e.NotStarted = 0] = "NotStarted", e[e.Running = 1] = "Running", e[e.Stopped = 2] = "Stopped";
})(Wc || (Wc = {}));
const { addCustomEvent: $v } = hr, { freezePage: Fv } = hr, { takeFullSnapshot: Uv } = hr, di = 2, Co = 4;
class Gb {
  constructor(t) {
    Gn(this, "events", []);
    Gn(this, "lastMeta", null);
    Gn(this, "lastFull", null);
    this.opts = t;
  }
  push(t) {
    t.type === Co && (this.lastMeta = t), t.type === di && (this.lastFull = t, this.events = []), this.events.push(t), this.prune();
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
    const t = [], r = this.events.some((i) => i.type === di), n = this.events.some((i) => i.type === Co);
    return !r && this.lastFull ? (this.lastMeta && t.push(this.lastMeta), t.push(this.lastFull)) : r && !n && this.lastMeta && t.push(this.lastMeta), [...t, ...this.events];
  }
  /** True when the buffer can produce a scrubbable replay: a full snapshot + at least one event to
   *  play beyond the meta+full pair (a lone meta+full renders a single static frame, not a replay). */
  isPlayable() {
    const t = this.snapshot(), r = t.some((i) => i.type === di), n = t.some((i) => i.type !== di && i.type !== Co);
    return r && n;
  }
  clear() {
    this.events = [], this.lastMeta = null, this.lastFull = null;
  }
}
function Xb(e, t = {}) {
  const r = t.windowMs ?? 6e4, n = new Gb({
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
const Rd = "klav-sims-live", Td = "klav-sims-overlay", Hc = "klav-sims-ext-css";
let zt = null, Sr = null, Mt = null, Kr = null;
const Ci = /* @__PURE__ */ new Map(), Tt = /* @__PURE__ */ new Map();
let Ad = 0, Gt = !1, Cr = null, en = null, Pn = !1, pt = null, kn = null, ur = null, dr = null, Dt = null, Mr = null, Pt = null, Yt = null, $t = null, Jr = null;
const Mi = /* @__PURE__ */ new Set();
function Kb(e) {
  return String(e || "").trim().toLowerCase().replace(/\s+/g, " ");
}
function _d(e, t) {
  return `${e}::${Kb(t.text)}`;
}
function Ld(e) {
  try {
    document.dispatchEvent(new CustomEvent("klavity:sims-live", { detail: { active: e } }));
  } catch {
  }
}
const Jb = `
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
`, Zb = `
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
function jc(e, t) {
  const r = e.replace("#", ""), n = (c) => parseInt(c, 16), [i, s, a] = r.length === 3 ? [n(r[0] + r[0]), n(r[1] + r[1]), n(r[2] + r[2])] : [n(r.slice(0, 2)), n(r.slice(2, 4)), n(r.slice(4, 6))];
  return `rgba(${i},${s},${a},${t})`;
}
function Qb(e) {
  if (e.suggestedBug) return !0;
  const t = String(e.priority ?? "").trim().toLowerCase();
  if (t && t !== "none") return !0;
  const r = String(e.sentiment ?? "").trim().toLowerCase();
  return r ? !(/* @__PURE__ */ new Set(["positive", "satisfied", "delighted", "neutral", "none"])).has(r) : !1;
}
function Po() {
  var e, t;
  try {
    return ((t = (e = window.matchMedia) == null ? void 0 : e.call(window, "(prefers-reduced-motion: reduce)")) == null ? void 0 : t.matches) ?? !1;
  } catch {
    return !1;
  }
}
function ev(e) {
  return new Promise((t) => setTimeout(t, e));
}
function tn(e) {
  const t = String(e.priority ?? "").trim().toLowerCase();
  return t === "high" || t === "critical" || t === "urgent" ? "HIGH" : t === "medium" || t === "med" ? "MED" : t === "low" ? "LOW" : e.suggestedBug ? "HIGH" : null;
}
const Id = { HIGH: "h", MED: "m", LOW: "l" }, Yc = { HIGH: 0, MED: 1, LOW: 2 };
function tv(e) {
  if (!e) return !1;
  if (e === Mt || e === zt || e.id === Td || e.id === Rd || e.id === "klavity-widget-host") return !0;
  const t = e.classList;
  return !!t && t.contains("klav-halo");
}
function rv(e) {
  const t = [];
  for (const r of [Mt, zt])
    r && (t.push({ el: r, vis: r.style.visibility }), r.style.visibility = "hidden");
  try {
    return e();
  } finally {
    for (const { el: r, vis: n } of t) r.style.visibility = n;
  }
}
function Od(e) {
  const t = e.targetViewport;
  return {
    scrollX: Number.isFinite(t == null ? void 0 : t.scrollX) ? Number(t.scrollX) : window.scrollX,
    scrollY: Number.isFinite(t == null ? void 0 : t.scrollY) ? Number(t.scrollY) : window.scrollY,
    width: Math.max(1, Number.isFinite(t == null ? void 0 : t.width) ? Number(t.width) : window.innerWidth),
    height: Math.max(1, Number.isFinite(t == null ? void 0 : t.height) ? Number(t.height) : window.innerHeight)
  };
}
function Nd(e, t) {
  return new DOMRect(
    t.scrollX + e.x * t.width,
    t.scrollY + e.y * t.height,
    Math.max(1, e.w * t.width),
    Math.max(1, e.h * t.height)
  );
}
function Vc(e) {
  return Math.max(0, e.width) * Math.max(0, e.height);
}
function nv(e, t) {
  const r = Math.max(e.left, t.left), n = Math.min(e.right, t.right), i = Math.max(e.top, t.top), s = Math.min(e.bottom, t.bottom);
  return Math.max(0, n - r) * Math.max(0, s - i);
}
function iv(e) {
  return new DOMRect(e.left + window.scrollX, e.top + window.scrollY, e.width, e.height);
}
function Pd(e) {
  if (!e || !(e instanceof HTMLElement) || e === document.body || e === document.documentElement || tv(e)) return !1;
  const t = e.getBoundingClientRect();
  if (t.width < 8 || t.height < 8) return !1;
  try {
    const r = getComputedStyle(e);
    if (r.display === "none" || r.visibility === "hidden" || Number(r.opacity) === 0) return !1;
  } catch {
  }
  return !0;
}
function sv(e, t) {
  return rv(() => {
    const r = /* @__PURE__ */ new Set(), n = [], i = (a) => {
      let c = a;
      for (; c && c !== document.body && c !== document.documentElement; )
        !r.has(c) && Pd(c) && (r.add(c), n.push(c)), c = c.parentElement;
    }, s = typeof document.elementsFromPoint == "function" ? document.elementsFromPoint(e, t) : [document.elementFromPoint(e, t)].filter(Boolean);
    for (const a of s) i(a);
    return n;
  });
}
function ov(e, t) {
  const r = Od(t), n = Nd(e, r), i = Math.max(2, Math.min(window.innerWidth - 2, n.left + n.width / 2 - window.scrollX)), s = Math.max(2, Math.min(window.innerHeight - 2, n.top + n.height / 2 - window.scrollY)), a = sv(i, s);
  if (!a.length) return null;
  const c = Math.max(1, Vc(n));
  let l = null, d = -1 / 0;
  for (const o of a) {
    const h = iv(o.getBoundingClientRect()), p = nv(h, n);
    if (p <= 0) continue;
    const u = Math.max(1, Vc(h)), m = p / c, f = Math.max(0, (u - p) / u), y = o.tagName.toLowerCase(), E = /^(button|a|input|textarea|select|label|section|article|nav|header|footer|main|form)$/.test(y) ? 0.18 : 0, v = u > window.innerWidth * window.innerHeight * 0.92 ? 0.8 : 0, b = m - f * 0.35 + E - v;
    b > d && (l = o, d = b);
  }
  return l ?? a[0] ?? null;
}
async function av(e, t) {
  if (e >= window.scrollX + 80 && e <= window.scrollX + window.innerWidth - 80 && t >= window.scrollY + 80 && t <= window.scrollY + window.innerHeight - 80) return;
  const i = Math.max(0, document.documentElement.scrollHeight - window.innerHeight), s = Math.max(0, document.documentElement.scrollWidth - window.innerWidth), a = Math.max(0, Math.min(i, t - window.innerHeight * 0.38)), c = Math.max(0, Math.min(s, e - window.innerWidth * 0.45));
  try {
    window.scrollTo({ top: a, left: c, behavior: Po() ? "auto" : "smooth" });
  } catch {
    window.scrollTo(c, a);
  }
  await ev(Po() ? 80 : 520);
}
const lv = /* @__PURE__ */ new Set([
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
function cv(e) {
  const t = /* @__PURE__ */ new Set();
  return String(e || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((r) => r.length < 4 || lv.has(r) || t.has(r) ? !1 : (t.add(r), !0));
}
function uv(e) {
  const t = cv(e.text);
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
    if (!Pd(a)) continue;
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
    const o = a.tagName.toLowerCase(), h = /^(button|a|input|textarea|select|label|h1|h2|h3|section|article|nav|header|footer|main|form)$/.test(o) ? 0.6 : 0, u = Math.max(1, c.width * c.height) > window.innerWidth * window.innerHeight * 0.85 ? 1.1 : 0, m = d / t.length + h - u;
    m > i && (n = a, i = m);
  }
  return n;
}
async function dv(e, t = {}) {
  if (e.region) {
    const r = Od(e), n = Nd(e.region, r);
    t.scroll !== !1 && await av(n.left + n.width / 2, n.top + n.height / 2);
    const i = ov(e.region, e);
    if (i) return i;
  }
  return uv(e);
}
function pv() {
  if (zt && Sr) return Sr;
  zt = document.createElement("div"), zt.id = Rd, zt.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;", Sr = zt.attachShadow({ mode: "open" }), ng(Sr);
  const e = document.createElement("style");
  return e.textContent = Jb, Sr.appendChild(e), document.body.appendChild(zt), Sr;
}
function zd() {
  if (Mt) return Mt;
  if (!document.getElementById(Hc)) {
    const e = document.createElement("style");
    e.id = Hc, e.textContent = Zb, document.head.appendChild(e);
  }
  return Mt = document.createElement("div"), Mt.id = Td, Mt.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;z-index:2147483640;pointer-events:none;overflow:visible;", document.body.appendChild(Mt), Mt;
}
function Dd(e, t) {
  return tg({
    name: e.name,
    initials: e.initials,
    photoUrl: e.photoUrl,
    color: e.accent,
    animate: !1,
    legs: !0,
    size: t
  });
}
function hv(e, t = [], r = {}) {
  if (typeof document > "u") return;
  Do();
  const n = pv();
  zd(), Kr = new AbortController();
  const i = e === "all" ? t : t.filter((h) => e.includes(h.id));
  if (!i.length) {
    console.warn("[KlavitySims] deploy(): no matching Sims — panel not mounted."), Do();
    return;
  }
  i.slice(0, 8).forEach((h) => {
    const p = h.accent || "#6366f1", u = h.initials || h.name.slice(0, 2).toUpperCase();
    Ci.set(h.id, { simId: h.id, accent: p, initials: u, name: h.name, photoUrl: h.photoUrl });
  });
  const s = document.createElement("div");
  s.className = "ksl-root", n.appendChild(s), $t = document.createElement("div"), $t.className = "ksl-sr", $t.id = "ksl-announcer", $t.setAttribute("aria-live", "polite"), $t.setAttribute("aria-atomic", "true"), s.appendChild($t), pt = document.createElement("button"), pt.type = "button", pt.className = "ksl-launcher", pt.setAttribute("aria-label", "Open Sims feedback panel"), pt.addEventListener("click", () => fv());
  const a = document.createElement("span");
  a.className = "ksl-pill", kn = document.createElement("span"), kn.className = "ksl-pill-avatars", ur = document.createElement("span"), ur.className = "ksl-pill-txt", a.append(kn, ur), dr = document.createElement("span"), dr.className = "ksl-pill-badge", dr.hidden = !0, pt.append(a, dr), s.appendChild(pt), i.slice(0, 3).forEach((h) => {
    const p = Ci.get(h.id);
    p && kn.appendChild(Dd(p, 26));
  }), Dt = document.createElement("section"), Dt.className = "ksl-panel", Dt.setAttribute("aria-label", "Sims feedback"), Dt.setAttribute("role", "dialog");
  const c = document.createElement("div");
  c.className = "ksl-head";
  const l = document.createElement("div");
  l.className = "ksl-title-row";
  const d = document.createElement("div");
  d.className = "ksl-title", d.textContent = "Sims feedback";
  const o = document.createElement("button");
  o.type = "button", o.className = "ksl-icon-btn", o.title = "Minimize", o.setAttribute("aria-label", "Minimize Sims feedback panel"), o.innerHTML = le("x", { size: 15 }), o.addEventListener("click", () => Gc()), l.append(d, o), Mr = document.createElement("div"), Mr.className = "ksl-count", Pt = document.createElement("div"), Pt.className = "ksl-chips", c.append(l, Mr, Pt), Yt = document.createElement("div"), Yt.className = "ksl-list", Yt.setAttribute("role", "list"), Dt.append(c, Yt), s.appendChild(Dt), document.addEventListener("keydown", (h) => {
    h.key === "Escape" && Gt && Gc();
  }, { signal: Kr.signal }), Ld(!0), an();
}
function $d(e) {
  Pn = e, pt == null || pt.classList.toggle("is-reviewing", e), an(), Gt && on();
}
function fv() {
  !Dt || !pt || (Gt = !0, Dt.classList.add("is-open"), pt.hidden = !0, on());
}
function Gc() {
  !Dt || !pt || (Gt = !1, Dt.classList.remove("is-open"), pt.hidden = !1, an());
}
function Fd() {
  const e = Array.from(Tt.values()), t = new Set(e.map((n) => n.entry.simId)), r = e.filter((n) => tn(n.obs) === "HIGH").length;
  return { total: e.length, sims: t.size, high: r };
}
function an() {
  const e = Fd();
  ur && (Pn && e.total === 0 ? ur.innerHTML = "Your Sims are reviewing…" : e.total === 0 ? ur.innerHTML = "Sims are watching this page" : ur.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from your Sims`), dr && (dr.hidden = e.high === 0, dr.textContent = `${e.high} high`), Gt && Ud(e);
}
function Ud(e) {
  Mr && (e.total === 0 ? Mr.innerHTML = Pn ? "Your Sims are reviewing this page…" : "No findings yet — your Sims are watching." : Mr.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from <b>${e.sims}</b> Sim${e.sims === 1 ? "" : "s"}` + (e.high > 0 ? ` · <span class="ksl-hi">${e.high} high</span>` : "")), mv();
}
function mv() {
  if (!Pt) return;
  const e = Array.from(Tt.values());
  if (Pt.hidden = e.length === 0, Pt.textContent = "", !e.length) return;
  const t = document.createElement("span");
  t.className = "ksl-chips-label", t.textContent = "Sim", Pt.appendChild(t);
  const r = /* @__PURE__ */ new Map();
  e.forEach((i) => {
    const s = r.get(i.entry.simId) ?? { entry: i.entry, n: 0 };
    s.n += 1, r.set(i.entry.simId, s);
  }), r.forEach(({ entry: i, n: s }) => {
    const a = document.createElement("button");
    a.type = "button", a.className = "ksl-chip" + (Cr === i.simId ? " is-on" : ""), a.setAttribute("aria-pressed", String(Cr === i.simId));
    const c = document.createElement("span");
    c.className = "ksl-dot", c.style.background = i.accent, a.append(c, document.createTextNode(`${i.initials} · ${s}`)), a.addEventListener("click", () => {
      Cr = Cr === i.simId ? null : i.simId, on();
    }), Pt.appendChild(a);
  });
  const n = document.createElement("span");
  n.className = "ksl-chips-label", n.style.marginLeft = "6px", n.textContent = "Priority", Pt.appendChild(n), ["HIGH", "MED", "LOW"].forEach((i) => {
    const s = e.filter((l) => tn(l.obs) === i).length;
    if (!s) return;
    const a = document.createElement("button");
    a.type = "button";
    const c = en === i;
    a.className = "ksl-chip" + (c ? ` sev-on-${Id[i]}` : ""), a.setAttribute("aria-pressed", String(c)), a.textContent = `${i} · ${s}`, a.addEventListener("click", () => {
      en = en === i ? null : i, on();
    }), Pt.appendChild(a);
  });
}
function gv() {
  return Array.from(Tt.values()).filter((e) => !Cr || e.entry.simId === Cr).filter((e) => !en || tn(e.obs) === en).sort((e, t) => {
    const r = tn(e.obs), n = tn(t.obs), i = r ? Yc[r] : 3, s = n ? Yc[n] : 3;
    return i - s;
  });
}
function yv(e) {
  const { entry: t, obs: r } = e, n = tn(r), i = document.createElement("div");
  i.className = "ksl-row", i.setAttribute("role", "listitem"), i.dataset.id = e.id, i.style.borderLeftColor = t.accent;
  const s = document.createElement("div");
  s.className = "ksl-r-head", s.appendChild(Dd(t, 26));
  const a = document.createElement("span");
  a.className = "ksl-r-name", a.style.color = t.accent, a.textContent = t.name, s.appendChild(a);
  const c = String(r.sentiment ?? "").trim();
  if (c) {
    const m = document.createElement("span");
    m.className = "ksl-r-sent", m.textContent = c, s.appendChild(m);
  }
  if (n) {
    const m = document.createElement("span");
    m.className = `ksl-sev ${Id[n]}`, m.setAttribute("aria-label", `Priority: ${n}`), m.textContent = n, s.appendChild(m);
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
  h.type = "button", h.className = "ksl-r-act track", h.innerHTML = le("bug", { size: 12 }) + " Track as Bug", h.setAttribute("aria-label", `Track feedback from ${t.name} as a bug`), h.addEventListener("click", () => {
    var m;
    (m = mi.onTriage) == null || m.call(mi, r, t.name), Xc(e.id);
  });
  const p = document.createElement("button");
  p.type = "button", p.className = "ksl-r-act jump", p.innerHTML = le("map-pin", { size: 12 }) + " Jump to on page", p.setAttribute("aria-label", `Jump to where ${t.name} flagged this`), p.addEventListener("click", () => {
    vv(e.id);
  });
  const u = document.createElement("button");
  return u.type = "button", u.className = "ksl-r-act dismiss", u.textContent = "Dismiss", u.setAttribute("aria-label", `Dismiss feedback from ${t.name}`), u.addEventListener("click", () => {
    Xc(e.id);
  }), o.append(h, p, u), i.appendChild(o), i;
}
function bv(e) {
  e.querySelectorAll(".ksl-row").forEach((t) => {
    const r = t.querySelector(".ksl-r-obs");
    r && r.scrollHeight - r.clientHeight > 4 && t.classList.add("is-clamped");
  });
}
function on() {
  if (!Yt || !Gt) {
    an();
    return;
  }
  const e = Fd();
  Ud(e);
  const t = gv();
  if (Yt.textContent = "", !t.length) {
    const n = document.createElement("div");
    n.className = "ksl-empty";
    const i = Tt.size > 0;
    if (Pn && !i) {
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
    Yt.appendChild(n), Tt.forEach((s) => {
      s.rowEl = null;
    });
    return;
  }
  t.forEach((n) => {
    const i = yv(n);
    n.rowEl = i, Yt.appendChild(i);
  });
  const r = new Set(t.map((n) => n.id));
  Tt.forEach((n) => {
    r.has(n.id) || (n.rowEl = null);
  }), bv(Yt);
}
function zo() {
  Jr == null || Jr(), Jr = null;
}
async function vv(e) {
  const t = Tt.get(e);
  if (!t) return;
  const r = await dv(t.obs, { scroll: !0 });
  !r || !Mt || kv(r, t.entry.accent);
}
function kv(e, t) {
  zo();
  const r = zd(), n = document.createElement("div");
  n.className = "klav-halo", n.style.borderColor = t, n.style.boxShadow = `0 0 0 4px ${jc(t, 0.16)},0 0 24px ${jc(t, 0.2)}`, r.appendChild(n);
  const i = new AbortController(), s = () => {
    const d = e.getBoundingClientRect(), o = d.width > 0 && d.height > 0 && d.bottom > 0 && d.right > 0 && d.top < window.innerHeight && d.left < window.innerWidth;
    n.style.display = o ? "" : "none", o && (n.style.left = `${d.left - 5}px`, n.style.top = `${d.top - 5}px`, n.style.width = `${d.width + 10}px`, n.style.height = `${d.height + 10}px`);
  }, a = () => requestAnimationFrame(s);
  s(), window.addEventListener("scroll", a, { passive: !0, signal: i.signal }), window.addEventListener("resize", a, { signal: i.signal });
  const c = setTimeout(() => {
    n.style.opacity = "0", n.style.transition = "opacity .3s ease", setTimeout(() => {
      Jr === l && zo();
    }, 320);
  }, 3200), l = () => {
    clearTimeout(c), i.abort(), Ge(n);
  };
  Jr = l;
}
function wv(e, t) {
  const r = `f_${e.simId}_${++Ad}`;
  Tt.set(r, { id: r, entry: e, obs: t, rowEl: null }), Gt ? on() : an(), $t && ($t.textContent = "", requestAnimationFrame(() => {
    $t && ($t.textContent = `${e.name}: ${t.text || ""}`);
  }));
}
function xv(e) {
  const t = Tt.get(e);
  if (!t) return;
  const r = () => {
    Tt.delete(e), Gt ? on() : an();
  };
  t.rowEl && Gt ? (t.rowEl.classList.add("is-removing"), setTimeout(r, Po() ? 0 : 300)) : r();
}
function Xc(e) {
  const t = Tt.get(e);
  t && (Mi.add(_d(t.entry.simId, t.obs)), xv(e));
}
function Sv(e, t, r) {
  if (!zt) return;
  const n = Ci.get(e);
  if (!n) {
    console.warn(`[KlavitySims] renderFeedback: simId "${e}" not registered`);
    return;
  }
  if (r.length) {
    $d(!1);
    for (const i of r) {
      if (!Qb(i)) continue;
      const s = _d(e, i);
      Mi.has(s) || (Mi.add(s), wv(n, i));
    }
  }
}
function Do() {
  zo(), Tt.clear(), Ad = 0, Ci.clear(), Mi.clear(), Gt = !1, Cr = null, en = null, Pn = !1, Kr == null || Kr.abort(), Kr = null, pt = null, kn = null, ur = null, dr = null, Dt = null, Mr = null, Pt = null, Yt = null, $t = null, Ge(Mt), Mt = null, Ge(zt), zt = null, Sr = null, Ld(!1);
}
const mi = {
  deploy: hv,
  setReviewing: $d,
  renderFeedback: Sv,
  undeploy: Do,
  onTriage: null
};
function Ev() {
  typeof window > "u" || window.KlavitySims || (window.KlavitySims = mi);
}
typeof window < "u" && Ev();
const Kc = "klav-ao-css", Cv = "klav-ao-overlay";
function Mv(e, t, r, n, i, s = 10) {
  const l = !(e.y - r - 14 >= s), d = l ? e.y + e.h + 14 : e.y - r - 14, o = Math.max(s, Math.min(d, i - r - s));
  return { left: Math.max(s, Math.min(e.x, n - t - s)), top: o, below: l };
}
const Rv = `
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
let xr = null, Tv = 1;
const Ri = /* @__PURE__ */ new Map();
function Jc(e, t) {
  const r = e.replace("#", ""), n = (c) => parseInt(c, 16), [i, s, a] = r.length === 3 ? [n(r[0] + r[0]), n(r[1] + r[1]), n(r[2] + r[2])] : [n(r.slice(0, 2)), n(r.slice(2, 4)), n(r.slice(4, 6))];
  return `rgba(${i},${s},${a},${t})`;
}
function Av() {
  if (xr) return xr;
  if (!document.getElementById(Kc)) {
    const e = document.createElement("style");
    e.id = Kc, e.textContent = Rv, document.head.appendChild(e);
  }
  return xr = document.createElement("div"), xr.id = Cv, xr.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;pointer-events:none;overflow:visible;z-index:2147483640;", document.body.appendChild(xr), xr;
}
function Bv(e, t, r = {}) {
  const n = Av(), i = r.color ?? "#6366f1", s = `klav-ao-${Tv++}`, a = 5, c = document.createElement("div");
  c.className = "klav-ao-halo", c.dataset.aoId = s, c.style.left = e.x - a + "px", c.style.top = e.y - a + "px", c.style.width = e.w + a * 2 + "px", c.style.height = e.h + a * 2 + "px", c.style.borderColor = i, c.style.boxShadow = `0 0 0 4px ${Jc(i, 0.14)},0 0 24px ${Jc(i, 0.18)}`, n.appendChild(c);
  let l = null;
  if (t) {
    const h = { x: e.x - a, y: e.y - a, w: e.w + a * 2, h: e.h + a * 2 }, { left: p, top: u, below: m } = Mv(
      h,
      224,
      96,
      window.innerWidth,
      window.innerHeight
    );
    l = document.createElement("div"), l.className = "klav-ao-pin" + (m ? " tail-top" : ""), l.dataset.aoId = s, l.style.borderLeftColor = i, l.style.left = p + "px", l.style.top = u + "px", l.setAttribute("role", "status"), l.setAttribute("aria-label", `Annotation: ${t}`);
    const f = document.createElement("div");
    f.className = "klav-ao-hd";
    const y = document.createElement("span");
    y.className = "klav-ao-lbl", y.style.color = i, y.textContent = t, f.appendChild(y);
    const E = r.priority ?? r.severity;
    if (E) {
      const b = E === "medium" ? " sev-m" : E === "low" ? " sev-l" : "", T = document.createElement("span");
      T.className = `klav-ao-sev${b}`, T.textContent = E, f.appendChild(T);
    }
    const v = document.createElement("button");
    v.className = "klav-ao-dismiss", v.textContent = "Dismiss", v.addEventListener("click", () => Bd(s)), l.appendChild(f), l.appendChild(v), n.appendChild(l);
  }
  return Ri.set(s, { halo: c, pin: l }), s;
}
function Bd(e) {
  const t = Ri.get(e);
  if (!t) return;
  Ri.delete(e);
  const { halo: r, pin: n } = t;
  n ? (n.classList.add("is-out"), r.style.animation = "klav-ao-pin-out .22s ease-in forwards", setTimeout(() => {
    Ge(n), Ge(r);
  }, 240)) : Ge(r);
}
function qv() {
  for (const e of [...Ri.keys()]) Bd(e);
}
let aa = Hr, cr = "";
const qd = { consoleErrors: [], networkFailures: [] };
let la, Wd, rn = null;
function Wr() {
  return aa.backendUrl || xu;
}
const _v = 15e3;
function vn(e, t = {}, r = _v) {
  const n = new AbortController(), i = setTimeout(() => n.abort(), r);
  return fetch(e, { ...t, signal: n.signal }).finally(() => clearTimeout(i));
}
function Hd(e) {
  const t = {};
  for (const [r, n] of Object.entries(e))
    n != null && (t[String(r).slice(0, 64)] = String(n).slice(0, 1e3));
  return t;
}
async function Zc() {
  return Lf(document.body, {
    filter: (e) => e.id !== "klavity-sdk-host"
  });
}
function Lv() {
  return jf(qd, { identity: la, metadata: Wd });
}
async function Iv(e) {
  return Ff(
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
      projectId: cr || void 0,
      replayEvents: e.replayEvents
    },
    aa,
    { backend: ag }
  );
}
function ca(e = "bug") {
  const t = Ym(e, {
    onCaptureFull: Zc,
    // #638: render the "Attach console logs" toggle (default OFF). Console errors ride the report only when
    // the reporter opts in (p.attachConsole) — parity with the widget's privacy-preserving default.
    consoleAttachToggle: !0,
    // Pre-compress each screenshot as it's captured (runs while the reporter types), same as the widget —
    // by submit time the promise is settled so there's zero compression delay before upload.
    compressImage: bl,
    // ── KLA-729 composer AI-assist (parity with widget.ts) — all best-effort, all resolve null on failure ──
    // KLAVITYKLA-241 pre-submit known-issue check: as the reporter types, ask the backend whether this
    // project already tracks a matching issue so they don't file a blind duplicate.
    onCheckKnown: async (r) => {
      try {
        const n = await vn(Wr() + "/api/widget/known-check", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ project: cr, text: r, url: location.href })
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
        const i = await vn(Wr() + "/api/report/clarity", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ projectId: cr, text: r, pageUrl: location.href, images: (n == null ? void 0 : n.images) ?? 0, client: ys() })
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
        const i = await vn(Wr() + "/api/report/enhance", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            projectId: cr,
            text: r,
            pageUrl: location.href,
            shot: (n == null ? void 0 : n.shot) || "",
            annotations: (n == null ? void 0 : n.annotations) || null,
            annotationTexts: (n == null ? void 0 : n.annotationTexts) || [],
            picked: (n == null ? void 0 : n.picked) || null,
            images: (n == null ? void 0 : n.images) ?? 0,
            client: ys()
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
        i.append("projectId", cr), i.append("audio", r, "recording.webm"), r.type && i.append("mime", r.type), i.append("pageUrl", location.href), n != null && n.text && i.append("text", n.text);
        const s = await vn(Wr() + "/api/report/split", { method: "POST", body: i }, 9e4);
        if (!s.ok) return null;
        const a = await s.json().catch(() => null);
        return a && Array.isArray(a.issues) ? a.issues : null;
      } catch {
        return null;
      }
    },
    // KLA-505 server-side dictation (POST /api/voice/transcribe): the Voice button hands each mic clip here;
    // resolve null on any failure so the composer falls back to Web Speech.
    onDictate: async (r) => {
      try {
        const n = new FormData();
        n.append("projectId", cr), n.append("audio", r, "dictation.webm"), r.type && n.append("mime", r.type);
        const i = await vn(Wr() + "/api/voice/transcribe", { method: "POST", body: n });
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
        const r = new URL(Wr() + "/api/voice/stream");
        return r.protocol = r.protocol === "https:" ? "wss:" : "ws:", r.searchParams.set("project", cr), r.toString();
      } catch {
        return;
      }
    })(),
    // KLAVITYKLA-438 "Record me": expose the button when the browser can screen-record, driving the
    // consent → record overlay from the shared sdk recorder (same as the widget).
    allowRecording: (() => {
      try {
        return Ou();
      } catch {
        return !1;
      }
    })(),
    onRecord: (r) => Tg({ onPhase: r }),
    // PX4 #425: allow non-image file attachments through the unified attach control (parity with widget).
    allowFileAttachments: !0,
    onSubmit: async (r) => {
      const n = await Promise.all(r.screenshots.map((a) => bl(a))), i = await Promise.all(n.map((a) => Ag(a))), s = Lv();
      return r.attachConsole !== !0 && (s.consoleErrors = []), Iv({
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
        reporter: la,
        clientInfo: ys(),
        referrer: typeof document < "u" && document.referrer || void 0,
        replayEvents: (rn == null ? void 0 : rn.getEvents()) ?? []
      });
    }
  });
  setTimeout(async () => {
    try {
      const r = await Zc();
      t.addScreenshot(r);
    } catch {
    }
  }, 200);
}
function Ov() {
  if (typeof document > "u" || !document.body) return;
  let e = document.getElementById("klavity-sdk-host");
  e || (e = document.createElement("div"), e.id = "klavity-sdk-host", e.style.cssText = "display:none!important;position:fixed;width:0;height:0;pointer-events:none;", document.body.appendChild(e)), e.setAttribute("data-klavity-ui", "sdk");
}
function Nv() {
  Yf(qd, { consoleLevels: !0 });
}
function jd(e) {
  la = e ? Hd(e) : void 0;
}
function Yd(e) {
  Wd = e ? Hd(e) : void 0;
}
function Pv() {
  if (typeof document > "u" || document.getElementById("klavity-sdk-menu-anim")) return;
  const e = document.createElement("style");
  e.id = "klavity-sdk-menu-anim", e.textContent = lg, (document.head || document.documentElement).appendChild(e);
}
function zv() {
  document.addEventListener("contextmenu", (e) => {
    if (Im(e.target)) return;
    e.preventDefault(), Pv();
    const t = document.createElement("div");
    t.className = "klm-menu", t.style.cssText = "position:fixed;z-index:2147483647;width:200px;max-width:calc(100vw - 16px);border-radius:20px;overflow:hidden;font-family:system-ui,-apple-system,sans-serif;transform-origin:top left;padding:8px;display:flex;flex-direction:column;gap:7px;box-sizing:border-box;pointer-events:auto;background:radial-gradient(135% 90% at 50% -12%, rgba(139,92,246,.18), rgba(139,92,246,0) 55%), linear-gradient(180deg, rgba(250,247,240,.95), rgba(243,236,225,.96));border:1px solid rgba(255,255,255,.55);box-shadow:0 24px 60px -12px rgba(76,40,130,.32), 0 8px 22px rgba(99,102,241,.16), 0 1.5px 4px rgba(25,20,15,.10), inset 0 1px 0 rgba(255,255,255,.75);";
    const r = (d, o, h, p, u = {}) => {
      const m = ug(document, { iconHtml: le(d), label: o, desc: h, primary: u.primary });
      return m.addEventListener("click", () => {
        a(), ca(p);
      }), m;
    };
    t.appendChild(r("zap", "Report a Bug", "Snap the page and tell us what broke.", "bug", { primary: !0 })), t.appendChild(r("lightbulb", "Request a Feature", "Suggest something you'd love to see.", "feature")), t.style.left = e.clientX + "px", t.style.top = "-9999px", document.body.appendChild(t);
    const n = 8, i = Math.max(n, Math.min(e.clientX, window.innerWidth - t.offsetWidth - n)), s = Math.max(n, Math.min(e.clientY, window.innerHeight - t.offsetHeight - n));
    t.style.left = i + "px", t.style.top = s + "px";
    const a = () => {
      Ge(t), document.removeEventListener("click", c), document.removeEventListener("keydown", l, !0);
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
function Vd(e = {}) {
  if (aa = {
    ...Hr,
    ...e,
    jira: { ...Hr.jira, ...e.jira },
    linear: { ...Hr.linear, ...e.linear },
    github: { ...Hr.github, ...e.github },
    plane: { ...Hr.plane, ...e.plane }
  }, typeof e.projectId == "string" && (cr = e.projectId), Nv(), Ov(), zv(), !rn)
    try {
      rn = Xb(hr);
    } catch {
      rn = null;
    }
}
typeof window < "u" && (window.KlavitySnap = { init: Vd, openModal: ca, identify: jd, setMetadata: Yd });
const Wv = { init: Vd, openModal: ca, identify: jd, setMetadata: Yd };
export {
  mi as KlavitySims,
  mi as SimsLive,
  Bd as clearAnnotation,
  qv as clearAnnotations,
  Wv as default,
  jd as identify,
  Vd as init,
  Ev as installKlavitySims,
  ca as openModal,
  Yd as setMetadata,
  Bv as showAnnotation
};
