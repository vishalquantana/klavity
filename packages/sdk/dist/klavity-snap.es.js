var ml = Object.defineProperty;
var gl = (e, t, r) => t in e ? ml(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var or = (e, t, r) => gl(e, typeof t != "symbol" ? t + "" : t, r);
function yl(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i))
    return e;
  const r = document.implementation.createHTMLDocument(), n = r.createElement("base"), i = r.createElement("a");
  return r.head.appendChild(n), r.body.appendChild(i), t && (n.href = t), i.href = e, i.href;
}
const bl = /* @__PURE__ */ (() => {
  let e = 0;
  const t = () => (
    // eslint-disable-next-line no-bitwise
    `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4)
  );
  return () => (e += 1, `u${t()}${e}`);
})();
function mt(e) {
  const t = [];
  for (let r = 0, n = e.length; r < n; r++)
    t.push(e[r]);
  return t;
}
let It = null;
function Do(e = {}) {
  return It || (e.includeStyleProperties ? (It = e.includeStyleProperties, It) : (It = mt(window.getComputedStyle(document.documentElement)), It));
}
function Sr(e, t) {
  const n = (e.ownerDocument.defaultView || window).getComputedStyle(e).getPropertyValue(t);
  return n ? parseFloat(n.replace("px", "")) : 0;
}
function vl(e) {
  const t = Sr(e, "border-left-width"), r = Sr(e, "border-right-width");
  return e.clientWidth + t + r;
}
function wl(e) {
  const t = Sr(e, "border-top-width"), r = Sr(e, "border-bottom-width");
  return e.clientHeight + t + r;
}
function zo(e, t = {}) {
  const r = t.width || vl(e), n = t.height || wl(e);
  return { width: r, height: n };
}
function kl() {
  let e, t;
  try {
    t = process;
  } catch {
  }
  const r = t && t.env ? t.env.devicePixelRatio : null;
  return r && (e = parseInt(r, 10), Number.isNaN(e) && (e = 1)), e || window.devicePixelRatio || 1;
}
const ze = 16384;
function xl(e) {
  (e.width > ze || e.height > ze) && (e.width > ze && e.height > ze ? e.width > e.height ? (e.height *= ze / e.width, e.width = ze) : (e.width *= ze / e.height, e.height = ze) : e.width > ze ? (e.height *= ze / e.width, e.width = ze) : (e.width *= ze / e.height, e.height = ze));
}
function Cr(e) {
  return new Promise((t, r) => {
    const n = new Image();
    n.onload = () => {
      n.decode().then(() => {
        requestAnimationFrame(() => t(n));
      });
    }, n.onerror = r, n.crossOrigin = "anonymous", n.decoding = "async", n.src = e;
  });
}
async function Sl(e) {
  return Promise.resolve().then(() => new XMLSerializer().serializeToString(e)).then(encodeURIComponent).then((t) => `data:image/svg+xml;charset=utf-8,${t}`);
}
async function Cl(e, t, r) {
  const n = "http://www.w3.org/2000/svg", i = document.createElementNS(n, "svg"), s = document.createElementNS(n, "foreignObject");
  return i.setAttribute("width", `${t}`), i.setAttribute("height", `${r}`), i.setAttribute("viewBox", `0 0 ${t} ${r}`), s.setAttribute("width", "100%"), s.setAttribute("height", "100%"), s.setAttribute("x", "0"), s.setAttribute("y", "0"), s.setAttribute("externalResourcesRequired", "true"), i.appendChild(s), s.appendChild(e), Sl(i);
}
const _e = (e, t) => {
  if (e instanceof t)
    return !0;
  const r = Object.getPrototypeOf(e);
  return r === null ? !1 : r.constructor.name === t.name || _e(r, t);
};
function El(e) {
  const t = e.getPropertyValue("content");
  return `${e.cssText} content: '${t.replace(/'|"/g, "")}';`;
}
function Ml(e, t) {
  return Do(t).map((r) => {
    const n = e.getPropertyValue(r), i = e.getPropertyPriority(r);
    return `${r}: ${n}${i ? " !important" : ""};`;
  }).join(" ");
}
function Rl(e, t, r, n) {
  const i = `.${e}:${t}`, s = r.cssText ? El(r) : Ml(r, n);
  return document.createTextNode(`${i}{${s}}`);
}
function Fi(e, t, r, n) {
  const i = window.getComputedStyle(e, r), s = i.getPropertyValue("content");
  if (s === "" || s === "none")
    return;
  const l = bl();
  try {
    t.className = `${t.className} ${l}`;
  } catch {
    return;
  }
  const d = document.createElement("style");
  d.appendChild(Rl(l, r, i, n)), t.appendChild(d);
}
function Ol(e, t, r) {
  Fi(e, t, ":before", r), Fi(e, t, ":after", r);
}
const Ui = "application/font-woff", Bi = "image/jpeg", Il = {
  woff: Ui,
  woff2: Ui,
  ttf: "application/font-truetype",
  eot: "application/vnd.ms-fontobject",
  png: "image/png",
  jpg: Bi,
  jpeg: Bi,
  gif: "image/gif",
  tiff: "image/tiff",
  svg: "image/svg+xml",
  webp: "image/webp"
};
function Ll(e) {
  const t = /\.([^./]*?)$/g.exec(e);
  return t ? t[1] : "";
}
function pi(e) {
  const t = Ll(e).toLowerCase();
  return Il[t] || "";
}
function Al(e) {
  return e.split(/,/)[1];
}
function si(e) {
  return e.search(/^(data:)/) !== -1;
}
function Tl(e, t) {
  return `data:${t};base64,${e}`;
}
async function Fo(e, t, r) {
  const n = await fetch(e, t);
  if (n.status === 404)
    throw new Error(`Resource "${n.url}" not found`);
  const i = await n.blob();
  return new Promise((s, l) => {
    const d = new FileReader();
    d.onerror = l, d.onloadend = () => {
      try {
        s(r({ res: n, result: d.result }));
      } catch (o) {
        l(o);
      }
    }, d.readAsDataURL(i);
  });
}
const Xr = {};
function Nl(e, t, r) {
  let n = e.replace(/\?.*/, "");
  return r && (n = e), /ttf|otf|eot|woff2?/i.test(n) && (n = n.replace(/.*\//, "")), t ? `[${t}]${n}` : n;
}
async function fi(e, t, r) {
  const n = Nl(e, t, r.includeQueryParams);
  if (Xr[n] != null)
    return Xr[n];
  r.cacheBust && (e += (/\?/.test(e) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
  let i;
  try {
    const s = await Fo(e, r.fetchRequestInit, ({ res: l, result: d }) => (t || (t = l.headers.get("Content-Type") || ""), Al(d)));
    i = Tl(s, t);
  } catch (s) {
    i = r.imagePlaceholder || "";
    let l = `Failed to fetch resource: ${e}`;
    s && (l = typeof s == "string" ? s : s.message), l && console.warn(l);
  }
  return Xr[n] = i, i;
}
async function Pl(e) {
  const t = e.toDataURL();
  return t === "data:," ? e.cloneNode(!1) : Cr(t);
}
async function _l(e, t) {
  if (e.currentSrc) {
    const s = document.createElement("canvas"), l = s.getContext("2d");
    s.width = e.clientWidth, s.height = e.clientHeight, l == null || l.drawImage(e, 0, 0, s.width, s.height);
    const d = s.toDataURL();
    return Cr(d);
  }
  const r = e.poster, n = pi(r), i = await fi(r, n, t);
  return Cr(i);
}
async function $l(e, t) {
  var r;
  try {
    if (!((r = e == null ? void 0 : e.contentDocument) === null || r === void 0) && r.body)
      return await _r(e.contentDocument.body, t, !0);
  } catch {
  }
  return e.cloneNode(!1);
}
async function Dl(e, t) {
  return _e(e, HTMLCanvasElement) ? Pl(e) : _e(e, HTMLVideoElement) ? _l(e, t) : _e(e, HTMLIFrameElement) ? $l(e, t) : e.cloneNode(Uo(e));
}
const zl = (e) => e.tagName != null && e.tagName.toUpperCase() === "SLOT", Uo = (e) => e.tagName != null && e.tagName.toUpperCase() === "SVG";
async function Fl(e, t, r) {
  var n, i;
  if (Uo(t))
    return t;
  let s = [];
  return zl(e) && e.assignedNodes ? s = mt(e.assignedNodes()) : _e(e, HTMLIFrameElement) && (!((n = e.contentDocument) === null || n === void 0) && n.body) ? s = mt(e.contentDocument.body.childNodes) : s = mt(((i = e.shadowRoot) !== null && i !== void 0 ? i : e).childNodes), s.length === 0 || _e(e, HTMLVideoElement) || await s.reduce((l, d) => l.then(() => _r(d, r)).then((o) => {
    o && t.appendChild(o);
  }), Promise.resolve()), t;
}
function Ul(e, t, r) {
  const n = t.style;
  if (!n)
    return;
  const i = window.getComputedStyle(e);
  i.cssText ? (n.cssText = i.cssText, n.transformOrigin = i.transformOrigin) : Do(r).forEach((s) => {
    let l = i.getPropertyValue(s);
    s === "font-size" && l.endsWith("px") && (l = `${Math.floor(parseFloat(l.substring(0, l.length - 2))) - 0.1}px`), _e(e, HTMLIFrameElement) && s === "display" && l === "inline" && (l = "block"), s === "d" && t.getAttribute("d") && (l = `path(${t.getAttribute("d")})`), n.setProperty(s, l, i.getPropertyPriority(s));
  });
}
function Bl(e, t) {
  _e(e, HTMLTextAreaElement) && (t.innerHTML = e.value), _e(e, HTMLInputElement) && t.setAttribute("value", e.value);
}
function ql(e, t) {
  if (_e(e, HTMLSelectElement)) {
    const n = Array.from(t.children).find((i) => e.value === i.getAttribute("value"));
    n && n.setAttribute("selected", "");
  }
}
function Wl(e, t, r) {
  return _e(t, Element) && (Ul(e, t, r), Ol(e, t, r), Bl(e, t), ql(e, t)), t;
}
async function jl(e, t) {
  const r = e.querySelectorAll ? e.querySelectorAll("use") : [];
  if (r.length === 0)
    return e;
  const n = {};
  for (let s = 0; s < r.length; s++) {
    const d = r[s].getAttribute("xlink:href");
    if (d) {
      const o = e.querySelector(d), h = document.querySelector(d);
      !o && h && !n[d] && (n[d] = await _r(h, t, !0));
    }
  }
  const i = Object.values(n);
  if (i.length) {
    const s = "http://www.w3.org/1999/xhtml", l = document.createElementNS(s, "svg");
    l.setAttribute("xmlns", s), l.style.position = "absolute", l.style.width = "0", l.style.height = "0", l.style.overflow = "hidden", l.style.display = "none";
    const d = document.createElementNS(s, "defs");
    l.appendChild(d);
    for (let o = 0; o < i.length; o++)
      d.appendChild(i[o]);
    e.appendChild(l);
  }
  return e;
}
async function _r(e, t, r) {
  return !r && t.filter && !t.filter(e) ? null : Promise.resolve(e).then((n) => Dl(n, t)).then((n) => Fl(e, n, t)).then((n) => Wl(e, n, t)).then((n) => jl(n, t));
}
const Bo = /url\((['"]?)([^'"]+?)\1\)/g, Hl = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, Vl = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function Gl(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
function Yl(e) {
  const t = [];
  return e.replace(Bo, (r, n, i) => (t.push(i), r)), t.filter((r) => !si(r));
}
async function Xl(e, t, r, n, i) {
  try {
    const s = r ? yl(t, r) : t, l = pi(t);
    let d;
    return i || (d = await fi(s, l, n)), e.replace(Gl(t), `$1${d}$3`);
  } catch {
  }
  return e;
}
function Kl(e, { preferredFontFormat: t }) {
  return t ? e.replace(Vl, (r) => {
    for (; ; ) {
      const [n, , i] = Hl.exec(r) || [];
      if (!i)
        return "";
      if (i === t)
        return `src: ${n};`;
    }
  }) : e;
}
function qo(e) {
  return e.search(Bo) !== -1;
}
async function Wo(e, t, r) {
  if (!qo(e))
    return e;
  const n = Kl(e, r);
  return Yl(n).reduce((s, l) => s.then((d) => Xl(d, l, t, r)), Promise.resolve(n));
}
async function Lt(e, t, r) {
  var n;
  const i = (n = t.style) === null || n === void 0 ? void 0 : n.getPropertyValue(e);
  if (i) {
    const s = await Wo(i, null, r);
    return t.style.setProperty(e, s, t.style.getPropertyPriority(e)), !0;
  }
  return !1;
}
async function Jl(e, t) {
  await Lt("background", e, t) || await Lt("background-image", e, t), await Lt("mask", e, t) || await Lt("-webkit-mask", e, t) || await Lt("mask-image", e, t) || await Lt("-webkit-mask-image", e, t);
}
async function Zl(e, t) {
  const r = _e(e, HTMLImageElement);
  if (!(r && !si(e.src)) && !(_e(e, SVGImageElement) && !si(e.href.baseVal)))
    return;
  const n = r ? e.src : e.href.baseVal, i = await fi(n, pi(n), t);
  await new Promise((s, l) => {
    e.onload = s, e.onerror = t.onImageErrorHandler ? (...o) => {
      try {
        s(t.onImageErrorHandler(...o));
      } catch (h) {
        l(h);
      }
    } : l;
    const d = e;
    d.decode && (d.decode = s), d.loading === "lazy" && (d.loading = "eager"), r ? (e.srcset = "", e.src = i) : e.href.baseVal = i;
  });
}
async function Ql(e, t) {
  const n = mt(e.childNodes).map((i) => jo(i, t));
  await Promise.all(n).then(() => e);
}
async function jo(e, t) {
  _e(e, Element) && (await Jl(e, t), await Zl(e, t), await Ql(e, t));
}
function ec(e, t) {
  const { style: r } = e;
  t.backgroundColor && (r.backgroundColor = t.backgroundColor), t.width && (r.width = `${t.width}px`), t.height && (r.height = `${t.height}px`);
  const n = t.style;
  return n != null && Object.keys(n).forEach((i) => {
    r[i] = n[i];
  }), e;
}
const qi = {};
async function Wi(e) {
  let t = qi[e];
  if (t != null)
    return t;
  const n = await (await fetch(e)).text();
  return t = { url: e, cssText: n }, qi[e] = t, t;
}
async function ji(e, t) {
  let r = e.cssText;
  const n = /url\(["']?([^"')]+)["']?\)/g, s = (r.match(/url\([^)]+\)/g) || []).map(async (l) => {
    let d = l.replace(n, "$1");
    return d.startsWith("https://") || (d = new URL(d, e.url).href), Fo(d, t.fetchRequestInit, ({ result: o }) => (r = r.replace(l, `url(${o})`), [l, o]));
  });
  return Promise.all(s).then(() => r);
}
function Hi(e) {
  if (e == null)
    return [];
  const t = [], r = /(\/\*[\s\S]*?\*\/)/gi;
  let n = e.replace(r, "");
  const i = new RegExp("((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})", "gi");
  for (; ; ) {
    const o = i.exec(n);
    if (o === null)
      break;
    t.push(o[0]);
  }
  n = n.replace(i, "");
  const s = /@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi, l = "((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})", d = new RegExp(l, "gi");
  for (; ; ) {
    let o = s.exec(n);
    if (o === null) {
      if (o = d.exec(n), o === null)
        break;
      s.lastIndex = d.lastIndex;
    } else
      d.lastIndex = s.lastIndex;
    t.push(o[0]);
  }
  return t;
}
async function tc(e, t) {
  const r = [], n = [];
  return e.forEach((i) => {
    if ("cssRules" in i)
      try {
        mt(i.cssRules || []).forEach((s, l) => {
          if (s.type === CSSRule.IMPORT_RULE) {
            let d = l + 1;
            const o = s.href, h = Wi(o).then((a) => ji(a, t)).then((a) => Hi(a).forEach((p) => {
              try {
                i.insertRule(p, p.startsWith("@import") ? d += 1 : i.cssRules.length);
              } catch (u) {
                console.error("Error inserting rule from remote css", {
                  rule: p,
                  error: u
                });
              }
            })).catch((a) => {
              console.error("Error loading remote css", a.toString());
            });
            n.push(h);
          }
        });
      } catch (s) {
        const l = e.find((d) => d.href == null) || document.styleSheets[0];
        i.href != null && n.push(Wi(i.href).then((d) => ji(d, t)).then((d) => Hi(d).forEach((o) => {
          l.insertRule(o, l.cssRules.length);
        })).catch((d) => {
          console.error("Error loading remote stylesheet", d);
        })), console.error("Error inlining remote css file", s);
      }
  }), Promise.all(n).then(() => (e.forEach((i) => {
    if ("cssRules" in i)
      try {
        mt(i.cssRules || []).forEach((s) => {
          r.push(s);
        });
      } catch (s) {
        console.error(`Error while reading CSS rules from ${i.href}`, s);
      }
  }), r));
}
function rc(e) {
  return e.filter((t) => t.type === CSSRule.FONT_FACE_RULE).filter((t) => qo(t.style.getPropertyValue("src")));
}
async function nc(e, t) {
  if (e.ownerDocument == null)
    throw new Error("Provided element is not within a Document");
  const r = mt(e.ownerDocument.styleSheets), n = await tc(r, t);
  return rc(n);
}
function Ho(e) {
  return e.trim().replace(/["']/g, "");
}
function ic(e) {
  const t = /* @__PURE__ */ new Set();
  function r(n) {
    (n.style.fontFamily || getComputedStyle(n).fontFamily).split(",").forEach((s) => {
      t.add(Ho(s));
    }), Array.from(n.children).forEach((s) => {
      s instanceof HTMLElement && r(s);
    });
  }
  return r(e), t;
}
async function sc(e, t) {
  const r = await nc(e, t), n = ic(e);
  return (await Promise.all(r.filter((s) => n.has(Ho(s.style.fontFamily))).map((s) => {
    const l = s.parentStyleSheet ? s.parentStyleSheet.href : null;
    return Wo(s.cssText, l, t);
  }))).join(`
`);
}
async function oc(e, t) {
  const r = t.fontEmbedCSS != null ? t.fontEmbedCSS : t.skipFonts ? null : await sc(e, t);
  if (r) {
    const n = document.createElement("style"), i = document.createTextNode(r);
    n.appendChild(i), e.firstChild ? e.insertBefore(n, e.firstChild) : e.appendChild(n);
  }
}
async function ac(e, t = {}) {
  const { width: r, height: n } = zo(e, t), i = await _r(e, t, !0);
  return await oc(i, t), await jo(i, t), ec(i, t), await Cl(i, r, n);
}
async function lc(e, t = {}) {
  const { width: r, height: n } = zo(e, t), i = await ac(e, t), s = await Cr(i), l = document.createElement("canvas"), d = l.getContext("2d"), o = t.pixelRatio || kl(), h = t.canvasWidth || r, a = t.canvasHeight || n;
  return l.width = h * o, l.height = a * o, t.skipAutoScale || xl(l), l.style.width = `${h}`, l.style.height = `${a}`, t.backgroundColor && (d.fillStyle = t.backgroundColor, d.fillRect(0, 0, l.width, l.height)), d.drawImage(s, 0, 0, l.width, l.height), l;
}
async function cc(e, t = {}) {
  return (await lc(e, t)).toDataURL();
}
const uc = {
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
  loader: '<path d="M12 2v4" /> <path d="m16.2 7.8 2.9-2.9" /> <path d="M18 12h4" /> <path d="m16.2 16.2 2.9 2.9" /> <path d="M12 18v4" /> <path d="m4.9 19.1 2.9-2.9" /> <path d="M2 12h4" /> <path d="m4.9 4.9 2.9 2.9" />'
};
function dc(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function J(e, t = {}) {
  const r = uc[e];
  if (!r)
    return console.warn("[Klavity] unknown icon: " + e), "";
  const n = t.size ?? 18, i = t.class ? `icon ${t.class}` : "icon", s = t.label ? 'role="img"' : 'aria-hidden="true"', l = t.label ? `<title>${dc(t.label)}</title>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" class="${i}" width="${n}" height="${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" ${s}>${l}${r}</svg>`;
}
const Tt = {
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
class Vi {
  constructor(t, r) {
    this.shapes = [], this.canvas = t, this.imageDataUrl = r;
  }
  computeLineWidth() {
    return Math.max(3, this.canvas.width / 400);
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
async function hc(e, t, r) {
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
const pc = 50, fc = 2e3, mc = 1e3, gc = 500, Gi = /^(?:token|access_token|refresh_token|api[_-]?key|apikey|key|secret|password|passwd|pwd|auth|authorization|session|sid|jwt|code|otp)$/i;
function ar(e, t) {
  e.push(t), e.length > pc && e.shift();
}
function mi(e, t) {
  return e.length <= t ? e : e.slice(0, t) + "…[truncated]";
}
function Kr(e) {
  let t = String(e || "");
  try {
    const r = new URL(t, typeof location < "u" ? location.href : "http://localhost");
    let n = !1;
    r.searchParams.forEach((i, s) => {
      Gi.test(s) && (r.searchParams.set(s, "REDACTED"), n = !0);
    }), n && (t = r.toString());
  } catch {
    t = t.replace(/([?&])([^=&]+)=([^&]*)/g, (r, n, i, s) => Gi.test(i) ? `${n}${i}=REDACTED` : r);
  }
  return mi(t, mc);
}
function yc(e) {
  if (typeof e == "string") return e;
  if (e instanceof Error) return e.message;
  try {
    return mi(JSON.stringify(e), gc);
  } catch {
    return String(e);
  }
}
function bc(e, t = {}) {
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
function vc(e, t = {}) {
  if (typeof window > "u") return e;
  const r = window;
  if (r.__klavityCaptureInstalled) return e;
  r.__klavityCaptureInstalled = !0;
  const n = () => t.isContextValid ? t.isContextValid() : !0, i = (o, h, a) => {
    ar(e.consoleErrors, { message: mi(h, fc), stack: a, timestamp: Date.now(), level: o });
  }, s = window.onerror;
  if (window.onerror = (o, h, a, p, u) => {
    var c;
    if (n()) {
      const m = String(o);
      i("error", m, u == null ? void 0 : u.stack), (c = t.onError) == null || c.call(t, m, u == null ? void 0 : u.stack);
    }
    return typeof s == "function" ? s.call(window, o, h, a, p, u) : !1;
  }, window.addEventListener("unhandledrejection", (o) => {
    var p;
    if (!n()) return;
    const h = o.reason, a = String((h == null ? void 0 : h.message) ?? h);
    i("error", a, h == null ? void 0 : h.stack), (p = t.onError) == null || p.call(t, a, h == null ? void 0 : h.stack);
  }), t.consoleLevels) {
    const o = ["log", "info", "warn", "error"];
    for (const h of o) {
      const a = console[h];
      typeof a == "function" && (console[h] = (...p) => {
        try {
          n() && i(h, p.map(yc).join(" "));
        } catch {
        }
        return a.apply(console, p);
      });
    }
  }
  const l = window.fetch;
  window.fetch = async (...o) => {
    var u;
    if (!n()) return l(...o);
    const h = Date.now(), a = typeof o[0] == "string" ? o[0] : o[0] instanceof URL ? o[0].href : o[0].url, p = (typeof o[0] == "object" && o[0] && "method" in o[0] ? o[0].method : (u = o[1]) == null ? void 0 : u.method) || "GET";
    try {
      const c = await l(...o);
      return ar(e.networkFailures, { url: Kr(a), status: c.status, method: String(p).toUpperCase(), timestamp: h, durationMs: Date.now() - h }), c;
    } catch (c) {
      throw ar(e.networkFailures, { url: Kr(a), status: 0, method: String(p).toUpperCase(), timestamp: h, durationMs: Date.now() - h }), c;
    }
  };
  const d = window.XMLHttpRequest;
  if (d && d.prototype) {
    const o = d.prototype.open, h = d.prototype.send;
    d.prototype.open = function(a, p, ...u) {
      return this.__klav = { method: String(a || "GET").toUpperCase(), url: String(p || "") }, o.call(this, a, p, ...u);
    }, d.prototype.send = function(...a) {
      const p = this.__klav;
      if (p && n()) {
        const u = Date.now();
        this.addEventListener("loadend", () => {
          try {
            ar(e.networkFailures, {
              url: Kr(p.url),
              status: Number(this.status) || 0,
              method: p.method,
              timestamp: u,
              durationMs: Date.now() - u
            });
          } catch {
          }
        });
      }
      return h.apply(this, a);
    };
  }
  return e;
}
const wc = ["light", "dark", "glass", "neon", "custom", "liquid"], kc = ["hidden", "icon", "full", "custom"], xc = ["full", "reportOnly", "off"], Sc = /^#[0-9a-fA-F]{3,8}$/, Cc = /^[\w \-,'"().]+$/, Ec = (e) => typeof e == "object" && e !== null, lr = (e) => typeof e == "string" && Sc.test(e.trim()) ? e.trim() : void 0, Yi = (e, t) => typeof e == "string" && e.trim() ? e.trim().slice(0, t) : void 0, Mc = (e) => {
  if (typeof e != "string") return;
  const t = e.trim().slice(0, 120);
  return t && Cc.test(t) ? t : void 0;
}, Xi = {
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
function Ki(e) {
  let t = e.replace("#", "");
  t.length === 3 && (t = t.split("").map((l) => l + l).join(""));
  const r = parseInt(t.slice(0, 6), 16), n = r >> 16 & 255, i = r >> 8 & 255, s = r & 255;
  return 0.299 * n + 0.587 * i + 0.114 * s;
}
function Vo(e) {
  const t = Ec(e) ? e : {}, n = { theme: typeof t.theme == "string" && wc.includes(t.theme) ? t.theme : "light" }, i = lr(t.primary), s = lr(t.secondary), l = lr(t.background), d = Yi(t.thankYou, 140), o = Mc(t.font);
  i && (n.primary = i), s && (n.secondary = s), l && (n.background = l), o && (n.font = o), d && (n.thankYou = d), typeof t.launcherMode == "string" && kc.includes(t.launcherMode) && (n.launcherMode = t.launcherMode);
  const h = Yi(t.launcherText, 60);
  h && (n.launcherText = h);
  const a = lr(t.launcherIconColor);
  return a && (n.launcherIconColor = a), typeof t.rightClickMode == "string" && xc.includes(t.rightClickMode) && (n.rightClickMode = t.rightClickMode), t.maskNumbers === !0 && (n.maskNumbers = !0), n;
}
function Rc(e) {
  const t = Vo(e), r = t.theme === "custom" ? { ...Xi.light } : { ...Xi[t.theme] };
  if (t.theme === "custom" && (t.primary && (r["--kl-accent"] = t.primary), t.secondary && (r["--kl-accent2"] = t.secondary), t.background)) {
    r["--kl-bg"] = t.background;
    const i = Ki(t.background) < 140;
    r["--kl-fg"] = i ? "#f4f4f7" : "#1d1d24", r["--kl-muted"] = i ? "rgba(255,255,255,.6)" : "#706560", r["--kl-border"] = i ? "rgba(255,255,255,.16)" : "#e6e6ec", r["--kl-chip"] = i ? "rgba(255,255,255,.08)" : "#f4f4f7", r["--kl-input-bg"] = i ? "rgba(255,255,255,.05)" : "#fafafb";
  }
  return t.font && (r["--kl-font"] = t.font), t.theme === "dark" || t.theme === "neon" || t.theme === "glass" || t.theme === "liquid" || t.theme === "custom" && t.background && Ki(t.background) < 140, r["--kl-img-outline"] = "var(--kl-img-outline-val, color-mix(in srgb, var(--kl-fg) 10%, transparent))", r["--kl-glow"] = "radial-gradient(120% 80% at 50% -10%, color-mix(in srgb, var(--kl-accent) 12%, transparent), transparent 60%), radial-gradient(80% 60% at 100% 110%, color-mix(in srgb, var(--kl-accent2) 6%, transparent), transparent 60%)", `:host{${Object.entries(r).map(([i, s]) => `${i}:${s};`).join("")}}`;
}
class Er {
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
    if (this._recording || !Er.isSupported()) return;
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
const Oc = /* @__PURE__ */ new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"]);
function cr(e) {
  const t = [], r = [], n = document.createTreeWalker(e, NodeFilter.SHOW_TEXT, {
    acceptNode(l) {
      let d = l.parentElement;
      for (; d && d !== e; ) {
        if (Oc.has(d.tagName)) return NodeFilter.FILTER_REJECT;
        d = d.parentElement;
      }
      return /\d/.test(l.textContent ?? "") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  }), i = [];
  let s;
  for (; s = n.nextNode(); ) i.push(s);
  for (const l of i) {
    const o = (l.textContent ?? "").split(/(\d+)/);
    if (o.length <= 1) continue;
    const h = l.parentNode, a = l.nextSibling, p = o.map((u, c) => {
      if (c % 2 === 1) {
        const m = document.createElement("span");
        return m.style.cssText = "background:#111;color:transparent;border-radius:2px;", m.textContent = u, m;
      }
      return document.createTextNode(u);
    });
    h.removeChild(l);
    for (const u of p) h.insertBefore(u, a);
    t.push({ parent: h, original: l, replacements: p });
  }
  return e.querySelectorAll("input, select").forEach((l) => {
    const d = l.value;
    /\d/.test(d) && (r.push({ el: l, original: d }), l.value = "█".repeat(d.length));
  }), () => {
    for (const { parent: l, original: d, replacements: o } of t) {
      const h = o[0];
      if ((h == null ? void 0 : h.parentNode) === l) {
        l.insertBefore(d, h);
        for (const a of o) a.parentNode === l && l.removeChild(a);
      }
    }
    for (const { el: l, original: d } of r)
      l.value = d;
  };
}
function Ic(e, t, r) {
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
function Ji(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function Zi(e) {
  return e === "attached" ? `${J("play", { size: 12 })}<span>Replay &middot; 60s</span>${J("check", { size: 12, label: "attached" })}` : `${J("play", { size: 12 })}<span>Replay &middot; not available</span>`;
}
function Qi(e) {
  const t = /^fb_([0-9a-f]{8})[0-9a-f-]+$/i.exec(e);
  return t ? "fb_" + t[1] : e;
}
function es(e) {
  if (!e) return "";
  try {
    const t = new URL(e);
    return t.protocol === "https:" || t.protocol === "http:" ? t.href : "";
  } catch {
    return "";
  }
}
function Gt(e) {
  return typeof e == "string" ? { dataUrl: e } : { dataUrl: e.dataUrl, quality: e.quality };
}
const Lc = {
  "real-pixel": { label: "Sharp", iconName: "check-circle", degraded: !1 },
  rendered: { label: "Rendered", iconName: "image", degraded: !0 },
  wireframe: { label: "Wireframe", iconName: "triangle-alert", degraded: !0 }
};
function Ac(e, t, r = {}) {
  var zi;
  const n = Vo(r);
  let i = !!n.maskNumbers;
  const s = document.createElement("div");
  s.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;";
  const l = s.attachShadow({ mode: "open" });
  document.body.appendChild(s);
  let d = [], o = [], h = [];
  const a = 5, p = 10 * 1024 * 1024, u = {}, c = () => {
    const E = Object.keys(u);
    if (!E.length) return null;
    const A = {};
    for (const O of E) A[O] = u[O];
    return { ...u[0] ?? u[Number(E[0])] ?? {}, byIndex: A };
  };
  let m = e, f = 0, g = null, k = t.replayState === "attached", b = null;
  const w = document.createElement("style");
  w.textContent = `
    ${Rc(n)}
    @keyframes kl-genie-in{from{opacity:0;transform:translateY(180px) scaleX(.04) scaleY(.06)}to{opacity:1;transform:translateY(0) scaleX(1) scaleY(1)}}
    @keyframes kl-genie-out{from{opacity:1;transform:translateY(0) scaleX(1) scaleY(1)}to{opacity:0;transform:translateY(180px) scaleX(.04) scaleY(.06)}}
    @keyframes kl-ov{from{opacity:0}to{opacity:1}}
    .klavity-overlay{position:fixed;inset:0;background:var(--kl-overlay);display:flex;align-items:center;justify-content:center;pointer-events:all;animation:kl-ov .3s ease both;}
    .klavity-modal{position:relative;overflow:hidden;isolation:isolate;background:var(--kl-glow,transparent),var(--kl-bg);color:var(--kl-fg);border-radius:var(--kl-radius);padding:0;width:92vw;max-width:min(1160px,92vw);max-height:94vh;box-shadow:0 0 0 1px var(--kl-border),var(--kl-shadow);font-family:var(--kl-font,system-ui,sans-serif);-webkit-font-smoothing:antialiased;-webkit-backdrop-filter:var(--kl-backdrop);backdrop-filter:var(--kl-backdrop);transform-origin:bottom center;animation:kl-genie-in .6s cubic-bezier(.16,1,.3,1) both;display:grid;grid-template-columns:minmax(0,1fr) 384px;}
    /* Image-hero two-pane layout: big annotatable screenshot on the left, controls on the right. */
    .kl-hero{display:flex;flex-direction:column;min-width:0;min-height:0;background:var(--kl-hero-bg,#0e1424);}
    .kl-hero-tools{display:flex;align-items:center;flex-wrap:wrap;gap:6px;padding:8px 14px;min-height:48px;border-bottom:1px solid rgba(255,255,255,.06);}
    .kl-hero-stage{flex:1;min-height:0;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:14px;}
    .kl-hero-empty{display:flex;flex-direction:column;align-items:center;gap:12px;color:#7d879f;font-size:13.5px;font-weight:500;text-align:center;max-width:260px;line-height:1.5;}
    .kl-hero-empty svg{opacity:.6;}
    .kl-side{display:flex;flex-direction:column;min-width:0;border-left:1px solid var(--kl-border);padding:22px 20px;overflow-y:auto;}
    .kl-side>.klavity-submit{margin-top:auto;}
    @media (max-width:760px){.klavity-modal{grid-template-columns:1fr;width:96vw;max-height:96vh;}.kl-hero{max-height:44vh;}.kl-side{overflow-y:visible;border-left:none;border-top:1px solid var(--kl-border);}}
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
    .klavity-actions{display:flex;gap:8px;margin-bottom:12px;}
    .klavity-actions button{flex:1;min-height:40px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:8px;background:var(--kl-chip);color:var(--kl-fg);border:none;border-radius:8px;cursor:pointer;font-size:12px;line-height:1;}
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
    .kl-info-badge{display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;flex:none;opacity:0.4;transition:opacity .15s ease;}
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
  `, l.appendChild(w);
  const S = document.createElement("div");
  S.className = "klavity-overlay";
  const y = document.createElement("div");
  y.className = "klavity-modal", y.innerHTML = `
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
      <div class="klavity-page">${J("map-pin")} ${typeof window < "u" ? Ji(window.location.pathname) : ""}</div>
      ${t.replayState ? `<div class="klavity-proof"><span class="klavity-chip ${t.replayState === "attached" ? "kl-chip-on" : "kl-chip-off"}" id="klavity-replay-chip">${Zi(t.replayState)}</span></div>` : ""}
      <div class="klavity-actions">
        ${t.onCaptureSharp ? `<button id="klavity-sharp" aria-describedby="klavity-sharp-tip"><span class="kl-cap-ic">${J("app-window")}</span><span class="kl-sharp-label">Screen</span><span class="kl-info-badge" aria-hidden="true"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></span><span id="klavity-sharp-tip" class="klavity-info-pop" role="tooltip">Screen grabs the <b>whole page — every image, pixel-perfect</b> using your browser's screen-share. Your browser will ask you to <b>share this tab</b>.</span></button>` : ""}
        <button id="klavity-full" title="Full Page — instant capture; may miss some cross-origin images"><span class="kl-cap-ic">${J("camera")}</span><span class="kl-full-label">Full Page</span></button>
        <button id="klavity-upload"><span class="kl-cap-ic">${J("image")}</span><span class="kl-upload-label">Upload</span></button>
        ${t.onRegionCapture ? `<button id="klavity-region"><span class="kl-cap-ic">${J("scissors")}</span><span class="kl-region-label">Region</span></button>` : ""}
        ${Er.isSupported() ? `<button id="klavity-voice" title="Dictate description"><span class="kl-cap-ic">${J("mic")}<span class="kl-vdot"></span></span><span class="kl-voice-label">Voice</span><svg class="kl-vring" viewBox="0 0 32 32" aria-hidden="true"><circle class="kl-vring-bg" cx="16" cy="16" r="13" fill="none" stroke-width="2"/><circle class="kl-vring-prog" cx="16" cy="16" r="13" fill="none" stroke-width="2" stroke-dasharray="81.68" stroke-dashoffset="81.68" stroke-linecap="round" transform="rotate(-90 16 16)"/></svg></button>` : ""}
      </div>
      <label class="klav-mask-row"><input type="checkbox" id="klavity-mask-numbers"${i ? " checked" : ""}>${J("eye-off", { size: 13 })}<span>Mask numbers</span></label>
      <input type="file" id="klavity-file" accept="image/*,.heic,.heif" multiple style="display:none">
      <div class="klavity-counter" id="klavity-counter">0/5 images</div>
      <div class="klavity-error" id="klavity-err"></div>
      <textarea class="klavity-desc" id="klavity-desc" placeholder="${e === "feature" ? "Describe the feature you'd like..." : "Describe the bug..."}"></textarea>
      <div class="klavity-desc-hint" id="klavity-desc-hint" hidden>${J("sparkles", { size: 13 })}<span>No title needed — we'll auto-generate one for you</span></div>
      ${t.requireEmail ? '<input type="email" class="klavity-remail" id="klavity-remail" placeholder="your@email.com" autocomplete="email">' : ""}
      <button class="klavity-submit" id="klavity-submit" title="Submit (S)" disabled>Submit</button>
      <div class="klavity-progress" id="klavity-progress" role="progressbar" aria-label="Uploading report"><div class="klavity-progress-fill" id="klavity-progress-fill"></div></div>
    </div>
  `, S.appendChild(y), l.appendChild(S);
  const v = l.getElementById("klavity-mask-numbers");
  v && v.addEventListener("change", () => {
    i = v.checked;
  });
  const x = l.getElementById("klavity-sharp"), M = l.querySelector(".klavity-info-pop");
  if (x && M) {
    const E = document.createElement("div");
    E.className = "kl-float-tip", E.setAttribute("role", "tooltip"), E.innerHTML = M.innerHTML, l.appendChild(E);
    const A = () => {
      const O = x.getBoundingClientRect(), $ = Math.min(228, window.innerWidth - 16), F = 8, j = window.innerWidth, V = window.innerHeight, le = O.left + O.width / 2 - $ / 2, D = Math.max(F, Math.min(le, j - $ - F));
      E.style.left = D + "px", E.style.top = "-9999px", E.style.visibility = "hidden", E.style.display = "block";
      const q = E.offsetHeight;
      E.style.display = "", E.style.visibility = "";
      let T = O.bottom + 8;
      T + q + F > V && (T = O.top - q - 8), T = Math.max(F, Math.min(T, V - q - F)), E.style.top = T + "px", E.classList.add("kl-show");
    }, P = () => E.classList.remove("kl-show");
    x.addEventListener("mouseenter", A), x.addEventListener("mouseleave", P), x.addEventListener("focus", A), x.addEventListener("blur", P);
  }
  function L(E) {
    k = E === "attached", ae();
    const A = l.getElementById("klavity-replay-chip");
    A && (A.classList.toggle("kl-chip-on", E === "attached"), A.classList.toggle("kl-chip-off", E !== "attached"), A.innerHTML = Zi(E));
  }
  const R = {
    shadowRoot: l,
    addScreenshot: ke,
    close: se,
    setReplayState: L
  };
  function B() {
    const E = l.getElementById("klavity-strip"), A = l.getElementById("klavity-counter");
    E.innerHTML = "", d.forEach((P, O) => {
      const $ = document.createElement("div");
      $.className = "klavity-thumb", O === f && $.classList.add("kl-thumb-active");
      const F = document.createElement("img");
      F.src = P, F.title = "Click to select + mark up", F.addEventListener("load", () => {
        F.naturalHeight > F.naturalWidth * 1.4 && $.classList.add("kl-tall");
      }, { once: !0 }), F.addEventListener("click", () => {
        f = O, B();
      });
      const j = document.createElement("button");
      j.className = "klavity-rm", j.innerHTML = J("x", { size: 13 }), j.title = "Remove", j.addEventListener("click", (D) => {
        D.stopPropagation(), d.splice(O, 1), o.splice(O, 1), h.splice(O, 1), delete u[O];
        for (const q of Object.keys(u).map(Number).filter((T) => T > O).sort((T, oe) => T - oe))
          u[q - 1] = u[q], delete u[q];
        d.length === 0 && X(null), B();
      });
      const V = document.createElement("button");
      V.className = "klavity-mk", V.innerHTML = J("pencil", { size: 13 }), V.title = "Mark up", V.addEventListener("click", (D) => {
        D.stopPropagation(), pl(O);
      }), $.append(F, j, V);
      const le = h[O];
      if (le) {
        const D = Lc[le], q = document.createElement("span");
        if (q.className = "klavity-qb kl-q-" + le, q.title = le === "real-pixel" ? "Pixel-perfect capture (every image included)" : le === "wireframe" ? "Wireframe fallback — layout only, images not captured. Retake for a sharp shot." : "Rendered capture — some cross-origin images may be missing. Retake for a sharp shot.", q.innerHTML = J(D.iconName, { size: 10 }) + '<span class="klavity-qb-t">' + Ji(D.label) + "</span>", $.appendChild(q), D.degraded && t.onRetakeSharp) {
          const T = document.createElement("button");
          T.type = "button", T.className = "klavity-retake", T.innerHTML = J("zap", { size: 11 }) + "<span>Retake sharp</span>", T.title = "Recapture this shot at full pixel quality", T.addEventListener("click", (oe) => {
            oe.stopPropagation(), re(O, T);
          }), $.appendChild(T);
        }
      }
      if (xe.has(O)) {
        const D = document.createElement("div");
        D.className = "klavity-retake-note", D.textContent = "Markup cleared for the retake.", $.appendChild(D);
      }
      E.appendChild($);
    }), A.textContent = `${d.length}/5 images`, ae(), ul();
  }
  function z(E) {
    const A = l.getElementById("klavity-err");
    A && (A.textContent = E, A.style.display = "block");
  }
  function C() {
    const E = l.getElementById("klavity-err");
    E && (E.style.display = "none");
  }
  function ke(E, A) {
    if (d.length >= a) {
      z(`You can attach up to ${a} images.`);
      return;
    }
    C(), d.push(E), o.push(t.compressImage ? t.compressImage(E) : Promise.resolve(E)), h.push(A), B();
  }
  const xe = /* @__PURE__ */ new Set();
  async function re(E, A) {
    if (!(ie || !t.onRetakeSharp)) {
      ue(!0), A.classList.add("kl-loading"), s.style.display = "none";
      try {
        const P = i ? cr(document.body) : null;
        let O;
        try {
          O = await t.onRetakeSharp();
        } finally {
          P == null || P();
        }
        if (O) {
          const { dataUrl: $, quality: F } = Gt(O);
          $ && (d[E] = $, o[E] = t.compressImage ? t.compressImage($) : Promise.resolve($), h[E] = F ?? "real-pixel", u[E] && (delete u[E], xe.add(E)));
        }
      } catch {
      } finally {
        s.style.display = "", ue(!1), B();
      }
    }
  }
  function te(E) {
    return E.type.startsWith("image/") || /\.(heic|heif|png|jpe?g|gif|webp|bmp|avif|svg)$/i.test(E.name);
  }
  async function he(E) {
    C();
    for (const A of E) {
      if (d.length >= a) {
        z(`You can attach up to ${a} images.`);
        break;
      }
      if (!te(A)) {
        z(`"${A.name}" isn't an image — only image files can be attached.`);
        continue;
      }
      if (A.size > p) {
        z(`"${A.name}" is too large — images must be under ${Math.round(p / 1024 / 1024)} MB.`);
        continue;
      }
      try {
        ke(await Nc(A));
      } catch {
        z(`Couldn't add "${A.name}". Please try a different image.`);
      }
    }
  }
  let ye = null;
  function se() {
    var P;
    ye == null || ye(), b && (clearTimeout(b), b = null), document.removeEventListener("keydown", Y, { capture: !0 }), document.removeEventListener("paste", We);
    try {
      (P = t.onClose) == null || P.call(t);
    } catch {
    }
    const E = l.querySelector(".klavity-modal");
    if (!E) {
      s.remove();
      return;
    }
    E.classList.add("kl-closing");
    const A = () => s.remove();
    E.addEventListener("animationend", A, { once: !0 }), setTimeout(A, 700);
  }
  function Y(E) {
    if (E.key === "Escape") {
      E.stopPropagation(), se();
      return;
    }
    if ((E.key === "s" || E.key === "S") && !E.metaKey && !E.ctrlKey && !E.altKey) {
      const A = E.target;
      if (A && (A.tagName === "INPUT" || A.tagName === "TEXTAREA" || A.isContentEditable) || l.querySelector(".kl-edtb")) return;
      const P = l.getElementById("klavity-submit");
      P && !P.disabled && (E.preventDefault(), E.stopPropagation(), P.click());
    }
  }
  document.addEventListener("keydown", Y, { capture: !0 });
  const We = (E) => {
    if (!E.clipboardData) return;
    const A = Array.from(E.clipboardData.items).filter((P) => P.type.startsWith("image/")).map((P) => P.getAsFile()).filter((P) => !!P);
    A.length && he(A);
  };
  document.addEventListener("paste", We);
  const I = y.querySelector(".bug"), Le = y.querySelector(".feat"), Ce = () => {
    const E = y.querySelector("#klavity-desc");
    E && (E.placeholder = m === "feature" ? "Describe the feature you'd like..." : "Describe the bug...");
  };
  I.addEventListener("click", () => {
    m = "bug", I.classList.add("active"), Le.classList.remove("active"), Ce();
  }), Le.addEventListener("click", () => {
    m = "feature", Le.classList.add("active"), I.classList.remove("active"), Ce();
  });
  const Ue = y.querySelector("#klavity-desc"), me = y.querySelector("#klavity-submit"), be = y.querySelector("#klavity-remail"), Ze = y.querySelector("#klavity-desc-hint"), Qe = () => !t.requireEmail || !!be && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(be.value.trim()), W = () => d.length > 0 || k, ae = () => {
    const E = Ue.value.trim() === "";
    me.disabled = E && !W() || !Qe(), Ze && (Ze.hidden = !(E && W()));
  };
  Ue.addEventListener("input", ae), be == null || be.addEventListener("input", ae), S.addEventListener("click", (E) => {
    E.target === S && se();
  }), (zi = y.querySelector("#klavity-x")) == null || zi.addEventListener("click", () => se());
  const ne = () => Array.from(y.querySelectorAll(".klavity-actions button:not(#klavity-voice)"));
  let ie = !1;
  const ue = (E) => {
    ie = E, ne().forEach((A) => {
      A.disabled = E;
    }), E ? me.disabled = !0 : ae();
  }, X = (E) => {
    ne().forEach((A) => {
      A.classList.remove("kl-active"), A.removeAttribute("aria-pressed");
    }), E && (E.classList.add("kl-active"), E.setAttribute("aria-pressed", "true"));
  }, je = y.querySelector("#klavity-voice");
  if (je) {
    const E = new Er(), A = 81.68, P = 15e3, O = je.querySelector(".kl-vring-prog");
    let $ = 0, F = 0, j = !1;
    const V = () => {
      F = Date.now();
      const D = () => {
        const q = Date.now() - F, T = Math.min(q / 18e4, 1);
        if (O == null || O.setAttribute("stroke-dashoffset", String(T * A)), q >= 18e4 - P && je.classList.add("kl-voice-warn"), q >= 18e4) {
          E.stop();
          return;
        }
        $ = requestAnimationFrame(D);
      };
      $ = requestAnimationFrame(D);
    }, le = () => {
      cancelAnimationFrame($), O == null || O.setAttribute("stroke-dashoffset", String(A)), je.classList.remove("kl-voice-warn");
    };
    E.onTranscript = (D) => {
      const q = Ue.value;
      Ue.value = q + (q.length > 0 && !/\s$/.test(q) ? " " : "") + D, ae();
    }, E.onError = (D, q) => {
      if (!q) return;
      let T = l.getElementById("klavity-voice-err");
      T || (T = document.createElement("div"), T.id = "klavity-voice-err", T.style.cssText = "color:rgb(220 38 38);font-size:12px;margin-top:4px;opacity:1;", Ue.insertAdjacentElement("afterend", T)), T.style.opacity = "1", T.style.transition = "", T.textContent = q, T.style.transition = "opacity .3s ease", setTimeout(() => {
        T && (T.style.opacity = "0");
      }, 3700), setTimeout(() => {
        T && (T.textContent = "", T.style.opacity = "1", T.style.transition = "");
      }, 4e3);
    }, E.onStop = () => {
      j = !1, je.classList.remove("kl-voice-rec"), le();
    }, je.addEventListener("click", () => {
      j ? E.stop() : (j = !0, je.classList.add("kl-voice-rec"), E.start(), V());
    }), ye = () => {
      j && E.stop();
    };
  }
  me.addEventListener("click", async () => {
    if (ie || me.disabled) return;
    const E = Ue.value.trim();
    ue(!0), me.textContent = "Uploading…";
    const A = l.getElementById("klavity-err");
    A.style.display = "none";
    const P = l.getElementById("klavity-progress"), O = l.getElementById("klavity-progress-fill");
    P && O && (P.classList.add("show"), O.style.transition = "none", O.style.width = "8%", O.offsetWidth, O.style.transition = "width 10s cubic-bezier(.05,.7,.2,1)", requestAnimationFrame(() => {
      O.style.width = "90%";
    }));
    const $ = () => {
      O && (O.style.transition = "width .25s ease", O.style.width = "100%");
    }, F = () => {
      P && O && (P.classList.remove("show"), O.style.transition = "none", O.style.width = "0");
    };
    try {
      const j = await Promise.all(o), V = await t.onSubmit({ type: m, description: E, screenshots: j, annotations: c(), reporterEmail: (be == null ? void 0 : be.value.trim()) || void 0 });
      if ($(), t.success)
        fl(V.issueKey, V.issueUrl, t.success);
      else {
        const le = document.createElement("div");
        le.style.cssText = "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:all;";
        const D = document.createElement("div");
        D.style.cssText = "background:var(--kl-bg);color:var(--kl-fg);border:1px solid var(--kl-border);border-radius:var(--kl-radius);padding:32px;font-family:var(--kl-font,system-ui),sans-serif;font-size:16px;text-align:center;box-shadow:var(--kl-shadow);";
        let q = "";
        if (n.thankYou)
          D.textContent = n.thankYou;
        else if (D.innerHTML = `${J("check-circle", { label: "Filed", size: 20 })} Filed as `, D.appendChild(document.createTextNode(Qi(V.issueKey))), q = es(V.issueUrl), q) {
          const T = document.createElement("a");
          T.href = q, T.target = "_blank", T.rel = "noopener", T.textContent = "View in dashboard", T.style.cssText = "display:block;margin-top:12px;font-size:14px;font-weight:600;color:var(--kl-accent);text-decoration:underline;text-underline-offset:2px;", D.appendChild(T);
        }
        le.appendChild(D), S.remove(), l.appendChild(le), setTimeout(se, n.thankYou ? 2600 : q ? 4e3 : 1500);
      }
    } catch (j) {
      F(), A.textContent = j.message, A.style.display = "block", me.textContent = "Submit", ue(!1);
    }
  });
  const Vt = y.querySelector("#klavity-full");
  if (Vt.addEventListener("click", async () => {
    if (!ie) {
      ue(!0), Vt.classList.add("kl-loading");
      try {
        const E = i ? cr(document.body) : null;
        try {
          const { dataUrl: A, quality: P } = Gt(await t.onCaptureFull());
          ke(A, P), X(Vt);
        } finally {
          E == null || E();
        }
      } catch {
      } finally {
        Vt.classList.remove("kl-loading"), ue(!1);
      }
    }
  }), x && t.onCaptureSharp) {
    const E = x.querySelector(".kl-sharp-label"), A = async () => {
      if (ie) return;
      ue(!0), x.classList.add("kl-loading"), s.style.display = "none";
      const P = E ?? x, O = P.textContent;
      P.textContent = "Capturing…";
      try {
        const $ = i ? cr(document.body) : null;
        let F;
        try {
          F = await t.onCaptureSharp();
        } finally {
          $ == null || $();
        }
        if (F) {
          const { dataUrl: j, quality: V } = Gt(F);
          j && (ke(j, V ?? "real-pixel"), X(x));
        }
      } catch {
      } finally {
        s.style.display = "", P.textContent = O, x.classList.remove("kl-loading"), ue(!1);
      }
    };
    x.addEventListener("click", () => {
      A();
    });
  }
  const _i = y.querySelector("#klavity-file"), $i = y.querySelector("#klavity-upload");
  $i.addEventListener("click", () => {
    if (ie || d.length >= a) {
      d.length >= a && z(`You can attach up to ${a} images.`);
      return;
    }
    _i.click();
  }), _i.addEventListener("change", async (E) => {
    const A = E.target, P = A.files ? Array.from(A.files) : [];
    if (A.value = "", P.length) {
      const O = d.length;
      await he(P), d.length > O && X($i);
    }
  });
  const Gr = l.getElementById("klavity-region");
  Gr && t.onRegionCapture && (Gr.onclick = () => {
    ie || (ue(!0), document.removeEventListener("keydown", Y, { capture: !0 }), s.style.display = "none", Tc(async (E) => {
      document.addEventListener("keydown", Y, { capture: !0 });
      try {
        const A = i ? cr(document.body) : null;
        let P;
        try {
          P = await t.onRegionCapture(E);
        } finally {
          A == null || A();
        }
        if (P) {
          const { dataUrl: O, quality: $ } = Gt(P);
          O && (ke(O, $), X(Gr));
        }
      } finally {
        s.style.display = "", ue(!1);
      }
    }, () => {
      document.addEventListener("keydown", Y, { capture: !0 }), s.style.display = "", ue(!1);
    }));
  });
  function yt(E, A = 15) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${A}" height="${A}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em">${E}</svg>`;
  }
  function cl() {
    const E = (P, O, $, F) => `<button type="button" class="kl-htool" data-tool="${P}" title="${O} (${F.toUpperCase()})" aria-label="${O}">${$}<span class="kl-hk">${F.toUpperCase()}</span></button>`, A = (P) => `<button type="button" class="kl-hcolor" data-color="${P}" style="background:${P}" title="${P}" aria-label="Colour ${P}"></button>`;
    return E("pen", "Pen", J("pencil", { size: 15 }), "p") + E("line", "Line", yt('<line x1="5" y1="19" x2="19" y2="5"/>'), "l") + E("rect", "Rectangle", J("square", { size: 15 }), "r") + E("circle", "Circle", yt('<circle cx="12" cy="12" r="9"/>'), "o") + E("arrow", "Arrow", yt('<line x1="5" y1="19" x2="19" y2="5"/><polyline points="10 5 19 5 19 14"/>'), "a") + E("text", "Text", yt('<path d="M5 6h14M12 6v13M9 19h6"/>'), "t") + E("count", "Numbers", yt('<circle cx="12" cy="12" r="9"/><text x="12" y="16" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor" stroke="none">1</text>'), "c") + E("crop", "Crop", yt('<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>'), "k") + '<span class="kl-hsep"></span>' + A("#ef4444") + A("#f97316") + A("#3b82f6") + A("#111827") + // Contextual text options — shown only while the Text tool is active (toggled in selectTool).
    `<span class="kl-htextopts" id="kl-hero-textopts" hidden><span class="kl-hsep"></span><span class="kl-hlabel">Outline</span><button type="button" class="kl-hopt kl-on" data-outline="black" title="Black outline"><span class="kl-osq" style="background:#111"></span></button><button type="button" class="kl-hopt" data-outline="white" title="White outline"><span class="kl-osq" style="background:#fff;border:1px solid #999"></span></button><button type="button" class="kl-hopt" data-outline="none" title="No outline">None</button><span class="kl-hlabel">Size</span><button type="button" class="kl-hopt" data-size="18" title="Small">S</button><button type="button" class="kl-hopt kl-on" data-size="26" title="Medium">M</button><button type="button" class="kl-hopt" data-size="40" title="Large">L</button></span><span class="kl-hsep"></span><button type="button" class="kl-htbtn" id="kl-hero-undo" title="Undo (⌘Z)" aria-label="Undo">${yt('<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>', 14)}</button><button type="button" class="kl-htbtn" id="kl-hero-clear" title="Clear" aria-label="Clear">${J("trash-2", { size: 14 })}</button><span class="kl-hgrow"></span><span class="kl-hhint">P pen · L line · R rect · O circle · T text · C numbers · K crop</span>`;
  }
  function Yr() {
    g && (document.removeEventListener("keydown", g, { capture: !0 }), g = null);
  }
  function Di() {
    const E = l.getElementById("klavity-hero-stage"), A = l.getElementById("klavity-hero-tools");
    A && (A.innerHTML = ""), E && (E.innerHTML = `<div class="kl-hero-empty">${J("image", { size: 34 })}<span>Capture or upload a screenshot to start marking it up</span></div>`), Yr();
  }
  function ul() {
    if (d.length === 0) {
      f = 0, Di();
      return;
    }
    f >= d.length && (f = d.length - 1), f < 0 && (f = 0), hl(f);
  }
  function dl(E, A, P, O, $) {
    const F = d[E];
    if (!F) return;
    const j = new Image();
    j.onload = () => {
      var T;
      if (d[E] !== F) return;
      const V = document.createElement("canvas");
      V.width = Math.max(1, Math.round(O)), V.height = Math.max(1, Math.round($));
      const le = V.getContext("2d");
      if (!le) return;
      le.drawImage(j, A, P, O, $, 0, 0, V.width, V.height);
      let D;
      try {
        D = V.toDataURL("image/png");
      } catch {
        return;
      }
      d[E] = D, o[E] = t.compressImage ? t.compressImage(D) : Promise.resolve(D);
      const q = (T = u[E]) == null ? void 0 : T.shapes;
      Array.isArray(q) && q.length ? u[E] = { w: V.width, h: V.height, shapes: Ic(q, -A, -P) } : delete u[E], B();
    }, j.src = F;
  }
  function hl(E) {
    var le, D, q;
    const A = l.getElementById("klavity-hero-stage"), P = l.getElementById("klavity-hero-tools");
    if (!A || !P) return;
    const O = d[E];
    if (!O) {
      Di();
      return;
    }
    Yr(), A.innerHTML = "";
    const $ = document.createElement("canvas");
    $.width = 1, $.height = 1, $.style.cssText = "display:block;max-width:100%;max-height:100%;object-fit:contain;cursor:crosshair;touch-action:none;background:#fff;border-radius:8px;box-shadow:0 12px 40px rgba(0,0,0,.5);";
    const F = new Vi($, O), j = (le = u[E]) == null ? void 0 : le.shapes;
    Array.isArray(j) && j.forEach((T) => F.shapes.push({ ...T })), A.appendChild($);
    const V = new Image();
    V.onload = () => {
      !document.body.contains(s) || f !== E || d[E] !== O || ($.width = V.naturalWidth || 1, $.height = V.naturalHeight || 1, F.redraw());
    }, V.src = O, F.redraw();
    {
      P.innerHTML = cl();
      let T = "pen", oe = "#ef4444", ve = 26, Ae = "black";
      const Te = P.querySelector("#kl-hero-textopts"), Ee = () => {
        F.shapes.length ? u[E] = { w: $.width, h: $.height, shapes: F.shapes.map((_) => ({ ..._ })) } : delete u[E];
      }, rt = (_) => {
        T = _, P.querySelectorAll("[data-tool]").forEach((U) => U.classList.toggle("kl-on", U.dataset.tool === _)), Te && (Te.hidden = _ !== "text");
      }, bt = (_, U) => {
        oe = _, P.querySelectorAll("[data-color]").forEach((de) => de.classList.toggle("kl-on", de === U));
      };
      P.querySelectorAll("[data-tool]").forEach((_) => _.addEventListener("click", () => rt(_.dataset.tool))), P.querySelectorAll("[data-color]").forEach((_) => _.addEventListener("click", () => bt(_.dataset.color, _))), P.querySelectorAll("[data-outline]").forEach((_) => _.addEventListener("click", () => {
        Ae = _.dataset.outline, P.querySelectorAll("[data-outline]").forEach((U) => U.classList.toggle("kl-on", U === _));
      })), P.querySelectorAll("[data-size]").forEach((_) => _.addEventListener("click", () => {
        ve = Number(_.dataset.size), P.querySelectorAll("[data-size]").forEach((U) => U.classList.toggle("kl-on", U === _));
      })), (D = P.querySelector("#kl-hero-undo")) == null || D.addEventListener("click", () => {
        F.undo(), Ee();
      }), (q = P.querySelector("#kl-hero-clear")) == null || q.addEventListener("click", () => {
        F.clearAll(), Ee();
      }), rt(T), bt(oe, P.querySelector("[data-color]"));
      const He = (_) => {
        const U = $.getBoundingClientRect(), de = Math.min(U.width / $.width, U.height / $.height) || 1, ct = $.width * de, ut = $.height * de, dt = (U.width - ct) / 2, sr = (U.height - ut) / 2;
        return { x: (_.clientX - U.left - dt) / de, y: (_.clientY - U.top - sr) / de };
      };
      let nt = F.shapes.reduce((_, U) => U.type === "count" ? Math.max(_, U.n) : _, 0), it = !1, $e = 0, De = 0, lt = [], Me = null, H = { x: 0, y: 0 };
      $.addEventListener("pointerdown", (_) => {
        const U = He(_);
        if ($e = U.x, De = U.y, T === "crop") {
          it = !0, H = { x: _.clientX, y: _.clientY }, Me = document.createElement("div"), Me.style.cssText = "position:absolute;border:2px dashed #6c63ff;background:rgba(108,99,255,.14);pointer-events:none;z-index:6;left:0;top:0;width:0;height:0;", A.appendChild(Me);
          return;
        }
        if (T === "text") {
          const de = document.createElement("input"), ct = Ae === "none" ? "none" : `0 0 2px ${Ae}, 0 0 2px ${Ae}`;
          de.style.cssText = `position:fixed;left:${_.clientX}px;top:${_.clientY}px;background:transparent;border:1px dashed ${oe};color:${oe};font-size:${ve}px;font-weight:700;text-shadow:${ct};outline:none;z-index:2147483647;min-width:80px;`;
          const ut = ve, dt = Ae;
          document.body.appendChild(de), de.focus(), de.addEventListener("blur", () => {
            de.value.trim() && (F.addShape({ type: "text", color: oe, x: $e, y: De, text: de.value.trim(), size: ut, outline: dt }), Ee()), de.remove();
          }, { once: !0 }), de.addEventListener("keydown", (sr) => {
            sr.key === "Enter" && de.blur(), sr.stopPropagation();
          });
          return;
        }
        if (T === "count") {
          F.addShape({ type: "count", color: oe, x: U.x, y: U.y, n: ++nt }), Ee();
          return;
        }
        it = !0, T === "pen" && (lt = [U]);
      }), $.addEventListener("pointermove", (_) => {
        if (it) {
          if (T === "pen") {
            lt.push(He(_));
            return;
          }
          if (T === "crop" && Me) {
            const U = A.getBoundingClientRect(), de = Math.min(H.x, _.clientX), ct = Math.min(H.y, _.clientY), ut = Math.max(H.x, _.clientX), dt = Math.max(H.y, _.clientY);
            Me.style.left = de - U.left + "px", Me.style.top = ct - U.top + "px", Me.style.width = ut - de + "px", Me.style.height = dt - ct + "px";
          }
        }
      }), $.addEventListener("pointerup", (_) => {
        if (!it) return;
        it = !1;
        const U = He(_);
        if (T === "crop") {
          Me && (Me.remove(), Me = null);
          const de = Math.max(0, Math.min($e, U.x)), ct = Math.max(0, Math.min(De, U.y)), ut = Math.abs(U.x - $e), dt = Math.abs(U.y - De);
          ut > 4 && dt > 4 && dl(E, de, ct, ut, dt);
          return;
        }
        T === "pen" && lt.length > 1 ? F.addShape({ type: "pen", color: oe, points: lt }) : T === "line" ? F.addShape({ type: "line", color: oe, x1: $e, y1: De, x2: U.x, y2: U.y }) : T === "rect" ? F.addShape({ type: "rect", color: oe, x: Math.min($e, U.x), y: Math.min(De, U.y), w: Math.abs(U.x - $e), h: Math.abs(U.y - De) }) : T === "circle" ? F.addShape({ type: "circle", color: oe, x: ($e + U.x) / 2, y: (De + U.y) / 2, rx: Math.abs(U.x - $e) / 2, ry: Math.abs(U.y - De) / 2 }) : T === "arrow" && F.addShape({ type: "arrow", color: oe, x1: $e, y1: De, x2: U.x, y2: U.y }), Ee();
      });
      const Q = { p: "pen", l: "line", r: "rect", o: "circle", a: "arrow", t: "text", c: "count", k: "crop" };
      g = (_) => {
        if (!document.body.contains(s)) {
          Yr();
          return;
        }
        const U = _.target;
        if (U && (U.tagName === "INPUT" || U.tagName === "TEXTAREA" || U.isContentEditable)) return;
        if ((_.metaKey || _.ctrlKey) && _.key.toLowerCase() === "z") {
          _.preventDefault(), F.undo(), Ee();
          return;
        }
        if (_.metaKey || _.ctrlKey || _.altKey) return;
        const de = _.key.toLowerCase();
        Q[de] && (_.preventDefault(), rt(Q[de]));
      }, document.addEventListener("keydown", g, { capture: !0 });
    }
  }
  function pl(E) {
    const A = d[E], P = new Image();
    P.onload = () => {
      const O = document.createElement("canvas");
      O.width = P.naturalWidth, O.height = P.naturalHeight;
      const $ = new Vi(O, A);
      $.redraw();
      const F = document.createElement("div");
      F.style.cssText = "position:fixed;inset:0;background:#000;z-index:2147483647;display:flex;flex-direction:column;pointer-events:all;";
      const j = document.createElement("div");
      j.className = "kl-edtb", j.style.cssText = "display:flex;align-items:center;gap:8px;padding:8px;background:#1e1e2e;flex-wrap:wrap;", j.innerHTML = `
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
      `, O.style.cssText = "cursor:crosshair;display:block;margin:12px auto;touch-action:none;background:#fff;border-radius:4px;outline:1px solid rgba(255,255,255,.12);outline-offset:-1px;box-shadow:0 12px 44px rgba(0,0,0,.55);";
      const V = document.createElement("div");
      V.style.cssText = "flex:1;min-height:0;overflow:auto;display:block;box-shadow:inset 0 1px 0 rgba(255,255,255,.04);", V.appendChild(O);
      const le = document.createElement("style");
      le.textContent = ".kl-edtb button{transition:transform .15s cubic-bezier(.34,1.56,.64,1),background .15s ease;will-change:transform;}.kl-edtb button:hover{transform:translateY(-1px) scale(1.02);background:#45475a;}.kl-edtb button[data-color]:hover{transform:scale(1.14);background:initial;}.kl-edtb button:active{transform:scale(.96);}.kl-edtb button:focus-visible{outline:2px solid #89b4fa;outline-offset:2px;}.kl-edtb .kl-zb{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:34px;padding:0 9px;background:#313244;color:#cdd6f4;border:none;border-radius:8px;cursor:pointer;font-size:15px;font-weight:600;line-height:1;}.kl-edtb .kl-zb:hover{background:#45475a;}@media (prefers-reduced-motion:reduce){.kl-edtb button{transition:none;}.kl-edtb button:hover,.kl-edtb button:active,.kl-edtb button[data-color]:hover{transform:none;}}", F.append(le, j, V), l.appendChild(F);
      let D = 1;
      const q = (H) => Math.max(0.05, Math.min(5, H || 1));
      function T(H) {
        D = q(H), O.style.width = Math.round(O.width * D) + "px", O.style.height = Math.round(O.height * D) + "px";
        const Q = j.querySelector("#klavity-zoom-pct");
        Q && (Q.textContent = Math.round(D * 100) + "%");
      }
      const oe = () => Math.max(1, V.clientWidth - 24) / O.width, ve = () => Math.min(Math.max(1, V.clientWidth - 24) / O.width, Math.max(1, V.clientHeight - 24) / O.height), Ae = O.height / O.width > Math.max(1, V.clientHeight) / Math.max(1, V.clientWidth);
      T(Ae ? oe() : ve()), j.querySelector("#klavity-zoom-in").addEventListener("click", () => T(D * 1.25)), j.querySelector("#klavity-zoom-out").addEventListener("click", () => T(D / 1.25)), j.querySelector("#klavity-fit-width").addEventListener("click", () => T(oe())), j.querySelector("#klavity-fit-page").addEventListener("click", () => T(ve()));
      let Te = "rect", Ee = "#ef4444", rt = !1, bt = [], He = 0, nt = 0;
      function it(H) {
        Te = H, j.querySelectorAll("[data-tool]").forEach((Q) => {
          const _ = Q.dataset.tool === H;
          Q.style.background = _ ? "#585b70" : "#313244", Q.style.outline = _ ? "2px solid #89b4fa" : "none";
        });
      }
      j.querySelectorAll("[data-tool]").forEach((H) => H.addEventListener("click", () => it(H.dataset.tool))), j.querySelectorAll("[data-color]").forEach((H) => H.addEventListener("click", () => {
        Ee = H.dataset.color;
      })), j.querySelector("#klavity-undo").addEventListener("click", () => $.undo()), j.querySelector("#klavity-clear-ann").addEventListener("click", () => $.clearAll());
      const $e = { p: "pen", r: "rect", c: "circle", a: "arrow", t: "text" };
      function De(H) {
        const Q = H.target;
        if (Q && (Q.tagName === "INPUT" || Q.tagName === "TEXTAREA" || Q.isContentEditable)) return;
        if (H.key === "Escape") {
          H.stopPropagation(), lt();
          return;
        }
        if ((H.metaKey || H.ctrlKey) && H.key.toLowerCase() === "z") {
          H.preventDefault(), $.undo();
          return;
        }
        if (H.metaKey || H.ctrlKey || H.altKey) return;
        const _ = H.key.toLowerCase();
        $e[_] ? (H.preventDefault(), it($e[_])) : _ === "u" && (H.preventDefault(), $.undo());
      }
      function lt() {
        document.removeEventListener("keydown", De, { capture: !0 }), F.remove();
      }
      document.addEventListener("keydown", De, { capture: !0 }), it(Te), j.querySelector("#klavity-save-ann").addEventListener("click", async () => {
        $.shapes.length ? (u[E] = { w: O.width, h: O.height, shapes: $.shapes.map((H) => ({ ...H })) }, d[E] = A) : delete u[E], lt(), B();
      }), j.querySelector("#klavity-cancel-ann").addEventListener("click", () => lt());
      function Me(H) {
        const Q = O.getBoundingClientRect();
        return { x: (H.clientX - Q.left) / Q.width * O.width, y: (H.clientY - Q.top) / Q.height * O.height };
      }
      O.addEventListener("pointerdown", (H) => {
        rt = !0;
        const Q = Me(H);
        if ({ x: He, y: nt } = Q, Te === "pen" && (bt = [Q]), Te === "text") {
          rt = !1;
          const _ = document.createElement("input");
          _.style.cssText = `position:fixed;left:${H.clientX}px;top:${H.clientY}px;background:transparent;border:1px dashed ${Ee};color:${Ee};font-size:16px;outline:none;z-index:9999999;min-width:80px;`, document.body.appendChild(_), _.focus(), _.addEventListener("blur", () => {
            _.value.trim() && $.addShape({ type: "text", color: Ee, x: He, y: nt, text: _.value.trim() }), _.remove();
          }, { once: !0 }), _.addEventListener("keydown", (U) => {
            U.key === "Enter" && _.blur();
          });
        }
      }), O.addEventListener("pointermove", (H) => {
        rt && Te === "pen" && bt.push(Me(H));
      }), O.addEventListener("pointerup", (H) => {
        if (!rt) return;
        rt = !1;
        const Q = Me(H);
        Te === "pen" && bt.length > 1 ? $.addShape({ type: "pen", color: Ee, points: bt }) : Te === "rect" ? $.addShape({ type: "rect", color: Ee, x: Math.min(He, Q.x), y: Math.min(nt, Q.y), w: Math.abs(Q.x - He), h: Math.abs(Q.y - nt) }) : Te === "circle" ? $.addShape({ type: "circle", color: Ee, x: (He + Q.x) / 2, y: (nt + Q.y) / 2, rx: Math.abs(Q.x - He) / 2, ry: Math.abs(Q.y - nt) / 2 }) : Te === "arrow" && $.addShape({ type: "arrow", color: Ee, x1: He, y1: nt, x2: Q.x, y2: Q.y });
      });
    }, P.src = A;
  }
  function fl(E, A, P) {
    const { copy: O, onLead: $ } = P;
    y.innerHTML = "";
    const F = document.createElement("div");
    F.className = "klavity-success";
    const j = document.createElement("h2");
    if (j.innerHTML = O.headline, F.appendChild(j), O.body) {
      const D = document.createElement("p");
      D.textContent = O.body, F.appendChild(D);
    }
    if (E) {
      const D = document.createElement("div");
      D.className = "klavity-ref";
      const q = document.createElement("span");
      q.textContent = "Filed as";
      const T = document.createElement("code");
      T.textContent = Qi(E), D.append(q, T);
      const oe = es(A);
      if (oe) {
        const ve = document.createElement("a");
        ve.href = oe, ve.target = "_blank", ve.rel = "noopener", ve.textContent = "View in dashboard", D.appendChild(ve);
      }
      F.appendChild(D);
    }
    const V = () => {
      if (b) return;
      const D = document.createElement("div");
      D.className = "klavity-toast-progress", y.appendChild(D);
      let q = 5e3, T = Date.now();
      const oe = () => {
        T = Date.now(), b = setTimeout(() => {
          se();
        }, q);
      }, ve = () => {
        b && (clearTimeout(b), b = null, q = Math.max(0, q - (Date.now() - T)), D.style.animationPlayState = "paused");
      }, Ae = () => {
        b || y.classList.contains("kl-closing") || (D.style.animationPlayState = "running", oe());
      };
      y.addEventListener("mouseenter", ve), y.addEventListener("mouseleave", Ae), y.addEventListener("focusin", ve), y.addEventListener("focusout", (Te) => {
        y.contains(Te.relatedTarget) || Ae();
      }), oe();
    };
    if (O.showEmail) {
      const D = document.createElement("div");
      D.className = "klavity-lead";
      const q = document.createElement("input");
      q.type = "email", q.placeholder = "you@company.com";
      const T = document.createElement("button");
      T.textContent = O.emailLabel;
      const oe = async () => {
        const ve = q.value.trim();
        if (!ve) return;
        T.disabled = !0;
        try {
          $ && await $(E, ve);
        } catch {
        }
        const Ae = document.createElement("div");
        Ae.className = "klavity-thanks", Ae.textContent = "Thanks — we'll be in touch.", D.replaceWith(Ae), O.showCta || V();
      };
      T.addEventListener("click", oe), q.addEventListener("keydown", (ve) => {
        ve.key === "Enter" && oe();
      }), D.append(q, T), F.appendChild(D);
    }
    if (O.showCta && O.ctaUrl) {
      const D = document.createElement("a");
      D.className = "klavity-cta", D.href = O.ctaUrl, D.target = "_blank", D.rel = "noopener", D.textContent = O.ctaText, F.appendChild(D);
    }
    y.appendChild(F);
    const le = document.createElement("div");
    le.className = "klavity-pb", le.innerHTML = 'Powered by <a href="https://klavity.in" target="_blank" rel="noopener">Klavity</a>', y.appendChild(le), !O.showEmail && !O.showCta && V();
  }
  return t.autoCaptureOnOpen && setTimeout(() => {
    t.onCaptureFull().then((E) => {
      const { dataUrl: A, quality: P } = Gt(E);
      ke(A, P), X(Vt);
    }).catch(() => {
    });
  }, 200), R;
}
function Tc(e, t) {
  const r = document.createElement("div");
  r.style.cssText = "position:fixed;inset:0;cursor:crosshair;z-index:2147483646;user-select:none;", r.setAttribute("data-klavity-region-overlay", ""), document.body.appendChild(r);
  const n = document.createElement("div");
  n.textContent = "Drag to select an area · Esc to cancel", n.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-family:system-ui;font-size:14px;background:rgba(0,0,0,.7);padding:8px 16px;border-radius:6px;pointer-events:none;z-index:2147483647;", document.body.appendChild(n);
  let i = 0, s = 0, l = !1;
  function d() {
    document.removeEventListener("keydown", o, { capture: !0 }), r.remove(), n.remove();
  }
  function o(h) {
    h.key === "Escape" && (h.stopPropagation(), d(), t());
  }
  document.addEventListener("keydown", o, { capture: !0 }), r.addEventListener("pointerdown", (h) => {
    l = !0, i = h.clientX, s = h.clientY, n.remove();
  }), r.addEventListener("pointermove", (h) => {
    if (!l) return;
    const a = Math.min(h.clientX, i), p = Math.min(h.clientY, s), u = Math.abs(h.clientX - i), c = Math.abs(h.clientY - s);
    r.style.background = `
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) 0 0/${a}px 100%,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${a + u}px 0/calc(100% - ${a + u}px) 100%,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${a}px 0/${u}px ${p}px,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${a}px ${p + c}px/${u}px calc(100% - ${p + c}px)
    `, r.style.backgroundRepeat = "no-repeat";
  }), r.addEventListener("pointerup", (h) => {
    if (!l) return;
    l = !1;
    const a = Math.abs(h.clientX - i), p = Math.abs(h.clientY - s);
    if (a < 8 || p < 8) {
      d(), t();
      return;
    }
    const u = { x: Math.min(h.clientX, i), y: Math.min(h.clientY, s), w: a, h: p };
    d(), e(u);
  });
}
async function Nc(e) {
  if (e.type === "image/heic" || e.type === "image/heif" || e.name.endsWith(".heic") || e.name.endsWith(".heif"))
    try {
      const t = (await import("./heic2any-D6xzzX7R.js").then((n) => n.h)).default, r = await t({ blob: e, toType: "image/jpeg", quality: 0.85 });
      return ts(r);
    } catch {
    }
  return ts(e);
}
function ts(e) {
  return new Promise((t, r) => {
    const n = new FileReader();
    n.onload = () => t(n.result), n.onerror = r, n.readAsDataURL(e);
  });
}
const Pc = {
  frustrated: { accent: "#e8849a", mark: "vein", label: "Frustrated" },
  confused: { accent: "#e8a24a", mark: "q", label: "Confused" },
  satisfied: { accent: "#7fd1c4", mark: "check", label: "Satisfied" },
  delighted: { accent: "#9fd6a0", mark: "spark", label: "Delighted" },
  neutral: { accent: "#8a8276", mark: "dots", label: "Neutral" },
  inspired: { accent: "#8b8bf5", mark: "bulb", label: "Inspired" },
  alarmed: { accent: "#ef6b6b", mark: "bang", label: "Alarmed" }
};
function _c(e) {
  const t = (e || "").trim().split(/\s+/).filter(Boolean);
  return t.length === 0 ? "?" : t.length === 1 ? t[0].slice(0, 2).toUpperCase() : (t[0][0] + t[t.length - 1][0]).toUpperCase();
}
function $c(e) {
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
const Dc = {
  vein: "ksim-m-vein",
  spark: "ksim-m-spark",
  bulb: "ksim-m-bulb",
  bang: "ksim-m-bang",
  q: "ksim-m-q",
  dots: "ksim-m-dots",
  check: "ksim-m-check"
};
function vt(e) {
  return String(e).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function zc(e) {
  const {
    name: t,
    photoUrl: r,
    color: n = "#6f6cf2",
    emotion: i = "none",
    size: s = 58,
    eyes: l = !0,
    legs: d = !0,
    animate: o = !0,
    className: h = ""
  } = e, a = vt(e.initials || _c(t)), p = i !== "none" ? Pc[i] : null, u = p ? `<span class="ksim-mark ${o ? Dc[p.mark] : ""}" style="color:${vt(p.accent)}">${$c(p.mark)}</span>` : "", m = r ? `<span class="ksim-head ksim-photo"><img src="${vt(r)}" alt="${vt(t)}" loading="lazy" onerror="this.style.display='none';this.parentNode.classList.add('ksim-fallback')"><span class="ksim-ini">${a}</span></span>` : `<span class="ksim-head ksim-mono"><span class="ksim-ini">${a}</span>${l ? '<span class="ksim-eyes"><i></i><i></i></span>' : ""}</span>`, f = d ? '<span class="ksim-legs"><i></i><i></i></span>' : "", g = ["ksim", o ? "is-animated" : "", h].filter(Boolean).join(" "), k = `--ksim-persona:${vt(n)};--ksim-size:${s}px;` + (p ? `--ksim-accent:${vt(p.accent)};` : "");
  return `<span class="${g}" style="${k}" data-emotion="${i}" title="${vt(t)}">${u}${m}${f}</span>`;
}
function Fc(e) {
  const t = document.createElement("template");
  return t.innerHTML = zc(e).trim(), t.content.firstElementChild;
}
const Uc = `
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
function Bc(e = document) {
  var n;
  const t = e.head ?? e ?? null;
  if (!t || (n = t.querySelector) != null && n.call(t, "style[data-ksim]")) return;
  const r = document.createElement("style");
  r.setAttribute("data-ksim", ""), r.textContent = Uc, t.appendChild(r);
}
function qc(e) {
  const { context: t, description: r } = e, n = t.consoleErrors.map((o) => `- [${o.level ?? "error"}] \`${o.message}\``).join(`
`) || "_none_", i = t.networkFailures.map((o) => `- ${o.method} ${o.url} → ${o.status}${o.durationMs != null ? ` (${o.durationMs}ms)` : ""}`).join(`
`) || "_none_", s = [
    `*Page:* ${t.pageUrl}`,
    `*Browser:* ${t.userAgent}`,
    `*Screen:* ${t.screenSize}  |  *Viewport:* ${t.viewportSize}`
  ], l = t.identity ? Object.entries(t.identity).filter(([, o]) => o != null) : [], d = t.metadata ? Object.entries(t.metadata) : [];
  return (l.length || d.length) && s.push(`*User / metadata:* ${[...l, ...d].map(([o, h]) => `${o}=${h}`).join(", ")}`), [
    ...s,
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
async function Wc(e) {
  const { settings: t, type: r, description: n } = e, { baseUrl: i, email: s, token: l, projectKey: d } = t.jira, o = btoa(`${s}:${l}`), h = r === "bug" ? "Bug" : "Story", a = r === "bug" ? ["klavity", "klavity-bug"] : ["klavity", "klavity-feature"], p = `[Klavity] ${n.slice(0, 180)}`, u = await fetch(`${i}/rest/api/3/issue`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${o}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      fields: {
        project: { key: d },
        summary: p,
        description: { version: 1, type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: qc(e) }] }] },
        issuetype: { name: h },
        labels: a
      }
    })
  });
  if (!u.ok) {
    const g = await u.text();
    throw new Error(`Jira API error ${u.status}: ${g}`);
  }
  const m = (await u.json()).key, f = `${i}/browse/${m}`;
  for (const g of e.screenshots) {
    const k = await (await fetch(g)).blob(), b = new FormData();
    b.append("file", k, `klavity-screenshot-${Date.now()}.png`), await fetch(`${i}/rest/api/3/issue/${m}/attachments`, {
      method: "POST",
      headers: { Authorization: `Basic ${o}`, "X-Atlassian-Token": "no-check" },
      body: b
    });
  }
  return { issueKey: m, issueUrl: f };
}
async function jc(e) {
  var p, u, c;
  const { settings: t, type: r, description: n, context: i } = e, { apiKey: s, teamId: l } = t.linear, d = [
    n,
    "",
    `**Page:** ${i.pageUrl}`,
    `**Browser:** ${i.userAgent}`
  ].join(`
`), h = await (await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      Authorization: s,
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
  if ((p = h.errors) != null && p.length)
    throw new Error(`Linear API error: ${h.errors[0].message}`);
  const a = (c = (u = h.data) == null ? void 0 : u.issueCreate) == null ? void 0 : c.issue;
  if (!a) throw new Error("Linear: no issue returned");
  return { issueKey: a.identifier, issueUrl: a.url };
}
async function Hc(e) {
  const { settings: t, type: r, description: n, context: i, screenshots: s } = e, { token: l, repo: d } = t.github, o = r === "bug" ? ["klavity", "klavity-bug"] : ["klavity", "klavity-feature"], h = s.length ? `

<details><summary>Screenshots (${s.length})</summary>

${s.map((c, m) => `![screenshot-${m + 1}](${c})`).join(`
`)}

</details>` : "", a = [
    n,
    "",
    `**Page:** ${i.pageUrl}`,
    `**Browser:** ${i.userAgent}`,
    `**Screen:** ${i.screenSize} | **Viewport:** ${i.viewportSize}`,
    h
  ].join(`
`), p = await fetch(`https://api.github.com/repos/${d}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${l}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: `[Klavity] ${n.slice(0, 180)}`,
      body: a,
      labels: o
    })
  });
  if (!p.ok)
    throw new Error(`GitHub API error ${p.status}: ${await p.text()}`);
  const u = await p.json();
  return { issueKey: `#${u.number}`, issueUrl: u.html_url };
}
async function Vc(e) {
  const { settings: t, description: r, context: n } = e, { token: i, workspace: s, projectId: l } = t.plane, d = (t.plane.host || "https://api.plane.so").replace(/\/+$/, ""), o = d === "https://api.plane.so" ? "https://app.plane.so" : d, h = await fetch(
    `${d}/api/v1/workspaces/${s}/projects/${l}/issues/`,
    {
      method: "POST",
      headers: { "X-API-Key": i, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `[Klavity] ${r.slice(0, 180)}`,
        description_html: `<p>${r}</p><p><strong>Page:</strong> ${n.pageUrl}</p>`
      })
    }
  );
  if (!h.ok) throw new Error(`Plane API error ${h.status}: ${await h.text()}`);
  const a = await h.json();
  return {
    issueKey: String(a.sequence_id),
    issueUrl: `${o}/${s}/projects/${l}/issues/`
  };
}
function Gc(e) {
  const t = new FormData();
  return t.set("type", e.type ?? "bug"), t.set("description", e.description), t.set("page_url", e.pageUrl), e.context && t.set("context", JSON.stringify(e.context)), e.projectId && t.set("project_id", e.projectId), e.replayEvents && e.replayEvents.length && t.set("replay_events", JSON.stringify(e.replayEvents)), t;
}
async function Yc(e) {
  const { settings: t, type: r, description: n, context: i, screenshots: s, projectId: l, replayEvents: d } = e, o = Gc({ type: r, description: n, pageUrl: i.pageUrl, context: i, projectId: l, replayEvents: d }), h = t.connectionMode === "klavity" && !!t.klavToken;
  if (!h) {
    const { plane: c } = t;
    o.append("plane_token", c.token), o.append("plane_workspace", c.workspace), o.append("plane_project_id", c.projectId), o.append("plane_host", c.host);
  }
  for (let c = 0; c < s.length; c++) {
    const m = await (await fetch(s[c])).blob();
    o.append("screenshots", m, `screenshot-${c}.png`);
  }
  const a = h ? { Authorization: `Bearer ${t.klavToken}` } : {}, p = await fetch(`${t.backendUrl}/api/feedback`, { method: "POST", headers: a, body: o });
  if (!p.ok) throw new Error(`Klavity backend error ${p.status}: ${await p.text()}`);
  const u = await p.json();
  return {
    issueKey: u.jira_key ?? u.id,
    issueUrl: u.issue_url ?? t.backendUrl
  };
}
var Xc = Object.defineProperty, Kc = (e, t, r) => t in e ? Xc(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, N = (e, t, r) => Kc(e, typeof t != "symbol" ? t + "" : t, r), rs, Jc = Object.defineProperty, Zc = (e, t, r) => t in e ? Jc(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, ns = (e, t, r) => Zc(e, typeof t != "symbol" ? t + "" : t, r), we = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(we || {});
const is = {
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
}, ss = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, ur = {}, Go = {}, Qc = () => !!globalThis.Zone;
function gi(e) {
  if (ur[e])
    return ur[e];
  const t = globalThis[e], r = t.prototype, n = e in is ? is[e] : void 0, i = !!(n && // @ts-expect-error 2345
  n.every(
    (d) => {
      var o, h;
      return !!((h = (o = Object.getOwnPropertyDescriptor(r, d)) == null ? void 0 : o.get) != null && h.toString().includes("[native code]"));
    }
  )), s = e in ss ? ss[e] : void 0, l = !!(s && s.every(
    // @ts-expect-error 2345
    (d) => {
      var o;
      return typeof r[d] == "function" && ((o = r[d]) == null ? void 0 : o.toString().includes("[native code]"));
    }
  ));
  if (i && l && !Qc())
    return ur[e] = t.prototype, t.prototype;
  try {
    const d = document.createElement("iframe");
    d.style.display = "none", document.body.appendChild(d);
    const o = d.contentWindow;
    if (!o) return t.prototype;
    const h = o[e].prototype;
    if (!h)
      return d.remove(), r;
    const a = navigator.userAgent;
    return a.includes("Safari") && !a.includes("Chrome") ? (d.classList.add("rr-block"), d.setAttribute("__rrwebUntaintedMutationObserver", ""), Go[e] = () => d.remove()) : d.remove(), ur[e] = h;
  } catch {
    return r;
  }
}
const Jr = {};
function ot(e, t, r) {
  var n;
  const i = `${e}.${String(r)}`;
  if (Jr[i])
    return Jr[i].call(
      t
    );
  const s = gi(e), l = (n = Object.getOwnPropertyDescriptor(
    s,
    r
  )) == null ? void 0 : n.get;
  return l ? (Jr[i] = l, l.call(t)) : t[r];
}
const Zr = {};
function Yo(e, t, r) {
  const n = `${e}.${String(r)}`;
  if (Zr[n])
    return Zr[n].bind(
      t
    );
  const s = gi(e)[r];
  return typeof s != "function" ? t[r] : (Zr[n] = s, s.bind(t));
}
function eu(e) {
  return ot("Node", e, "ownerDocument");
}
function tu(e) {
  return ot("Node", e, "childNodes");
}
function ru(e) {
  return ot("Node", e, "parentNode");
}
function nu(e) {
  return ot("Node", e, "parentElement");
}
function iu(e) {
  return ot("Node", e, "textContent");
}
function su(e, t) {
  return Yo("Node", e, "contains")(t);
}
function ou(e) {
  return Yo("Node", e, "getRootNode")();
}
function au(e) {
  return !e || !("host" in e) ? null : ot("ShadowRoot", e, "host");
}
function lu(e) {
  return e.styleSheets;
}
function cu(e) {
  return !e || !("shadowRoot" in e) ? null : ot("Element", e, "shadowRoot");
}
function uu(e, t) {
  return ot("Element", e, "querySelector")(t);
}
function du(e, t) {
  return ot("Element", e, "querySelectorAll")(t);
}
function hu() {
  return [
    gi("MutationObserver").constructor,
    Go.MutationObserver ?? (() => {
    })
  ];
}
let Xo = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (Xo = () => (/* @__PURE__ */ new Date()).getTime());
function pu(e, t, r) {
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
const Se = {
  ownerDocument: eu,
  childNodes: tu,
  parentNode: ru,
  parentElement: nu,
  textContent: iu,
  contains: su,
  getRootNode: ou,
  host: au,
  styleSheets: lu,
  shadowRoot: cu,
  querySelector: uu,
  querySelectorAll: du,
  nowTimestamp: Xo,
  mutationObserverCtor: hu,
  patch: pu
};
function Ko(e) {
  return e.nodeType === e.ELEMENT_NODE;
}
function Xt(e) {
  const t = (
    // anchor and textarea elements also have a `host` property
    // but only shadow roots have a `mode` property
    e && "host" in e && "mode" in e && Se.host(e) || null
  );
  return !!(t && "shadowRoot" in t && Se.shadowRoot(t) === e);
}
function Kt(e) {
  return Object.prototype.toString.call(e) === "[object ShadowRoot]";
}
function fu(e) {
  return e.includes(" background-clip: text;") && !e.includes(" -webkit-background-clip: text;") && (e = e.replace(
    /\sbackground-clip:\s*text;/g,
    " -webkit-background-clip: text; background-clip: text;"
  )), e;
}
function mu(e) {
  const { cssText: t } = e;
  if (t.split('"').length < 3) return t;
  const r = ["@import", `url(${JSON.stringify(e.href)})`];
  return e.layerName === "" ? r.push("layer") : e.layerName && r.push(`layer(${e.layerName})`), e.supportsText && r.push(`supports(${e.supportsText})`), e.media.length && r.push(e.media.mediaText), r.join(" ") + ";";
}
function oi(e) {
  try {
    const t = e.rules || e.cssRules;
    if (!t)
      return null;
    let r = e.href;
    !r && e.ownerNode && (r = e.ownerNode.baseURI);
    const n = Array.from(
      t,
      (i) => Jo(i, r)
    ).join("");
    return fu(n);
  } catch {
    return null;
  }
}
function Jo(e, t) {
  if (yu(e)) {
    let r;
    try {
      r = // for same-origin stylesheets,
      // we can access the imported stylesheet rules directly
      oi(e.styleSheet) || // work around browser issues with the raw string `@import url(...)` statement
      mu(e);
    } catch {
      r = e.cssText;
    }
    return e.styleSheet.href ? Or(r, e.styleSheet.href) : r;
  } else {
    let r = e.cssText;
    return bu(e) && e.selectorText.includes(":") && (r = gu(r)), t ? Or(r, t) : r;
  }
}
function gu(e) {
  const t = /(\[(?:[\w-]+)[^\\])(:(?:[\w-]+)\])/gm;
  return e.replace(t, "$1\\$2");
}
function yu(e) {
  return "styleSheet" in e;
}
function bu(e) {
  return "selectorText" in e;
}
class Zo {
  constructor() {
    ns(this, "idNodeMap", /* @__PURE__ */ new Map()), ns(this, "nodeMetaMap", /* @__PURE__ */ new WeakMap());
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
function vu() {
  return new Zo();
}
function Mr({
  element: e,
  maskInputOptions: t,
  tagName: r,
  type: n,
  value: i,
  maskInputFn: s
}) {
  let l = i || "";
  const d = n && Et(n);
  return (t[r.toLowerCase()] || d && t[d]) && (s ? l = s(l, e) : l = "*".repeat(l.length)), l;
}
function Et(e) {
  return e.toLowerCase();
}
const os = "__rrweb_original__";
function wu(e) {
  const t = e.getContext("2d");
  if (!t) return !0;
  const r = 50;
  for (let n = 0; n < e.width; n += r)
    for (let i = 0; i < e.height; i += r) {
      const s = t.getImageData, l = os in s ? s[os] : s;
      if (new Uint32Array(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        l.call(
          t,
          n,
          i,
          Math.min(r, e.width - n),
          Math.min(r, e.height - i)
        ).data.buffer
      ).some((o) => o !== 0)) return !1;
    }
  return !0;
}
function Rr(e) {
  const t = e.type;
  return e.hasAttribute("data-rr-is-password") ? "password" : t ? (
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    Et(t)
  ) : null;
}
function Qo(e, t) {
  let r;
  try {
    r = new URL(e, t ?? window.location.href);
  } catch {
    return null;
  }
  const n = /\.([0-9a-z]+)(?:$)/i, i = r.pathname.match(n);
  return (i == null ? void 0 : i[1]) ?? null;
}
function ku(e) {
  let t = "";
  return e.indexOf("//") > -1 ? t = e.split("/").slice(0, 3).join("/") : t = e.split("/")[0], t = t.split("?")[0], t;
}
const xu = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm, Su = /^(?:[a-z+]+:)?\/\//i, Cu = /^www\..*/i, Eu = /^(data:)([^,]*),(.*)/i;
function Or(e, t) {
  return (e || "").replace(
    xu,
    (r, n, i, s, l, d) => {
      const o = i || l || d, h = n || s || "";
      if (!o)
        return r;
      if (Su.test(o) || Cu.test(o))
        return `url(${h}${o}${h})`;
      if (Eu.test(o))
        return `url(${h}${o}${h})`;
      if (o[0] === "/")
        return `url(${h}${ku(t) + o}${h})`;
      const a = t.split("/"), p = o.split("/");
      a.pop();
      for (const u of p)
        u !== "." && (u === ".." ? a.pop() : a.push(u));
      return `url(${h}${a.join("/")}${h})`;
    }
  );
}
function dr(e, t = !1) {
  return t ? e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "") : e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "").replace(/0px/g, "0");
}
function Mu(e, t, r = !1) {
  const n = Array.from(t.childNodes), i = [];
  let s = 0;
  if (n.length > 1 && e && typeof e == "string") {
    let l = dr(e, r);
    const d = l.length / e.length;
    for (let o = 1; o < n.length; o++)
      if (n[o].textContent && typeof n[o].textContent == "string") {
        const h = dr(
          n[o].textContent,
          r
        ), a = 100;
        let p = 3;
        for (; p < h.length && // keep consuming css identifiers (to get a decent chunk more quickly)
        (h[p].match(/[a-zA-Z0-9]/) || // substring needs to be unique to this section
        h.indexOf(h.substring(0, p), 1) !== -1); p++)
          ;
        for (; p < h.length; p++) {
          let u = h.substring(0, p), c = l.split(u), m = -1;
          if (c.length === 2)
            m = c[0].length;
          else if (c.length > 2 && c[0] === "" && n[o - 1].textContent !== "")
            m = l.indexOf(u, 1);
          else if (c.length === 1) {
            if (u = u.substring(
              0,
              u.length - 1
            ), c = l.split(u), c.length <= 1)
              return i.push(e), i;
            p = a + 1;
          } else p === h.length - 1 && (m = l.indexOf(u));
          if (c.length >= 2 && p > a) {
            const f = n[o - 1].textContent;
            if (f && typeof f == "string") {
              const g = dr(f).length;
              m = l.indexOf(u, g);
            }
            m === -1 && (m = c[0].length);
          }
          if (m !== -1) {
            let f = Math.floor(m / d);
            for (; f > 0 && f < e.length; ) {
              if (s += 1, s > 50 * n.length)
                return i.push(e), i;
              const g = dr(
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
function Ru(e, t) {
  return Mu(e, t).join("/* rr_split */");
}
let Ou = 1;
const Iu = new RegExp("[^a-z0-9-_:]"), Zt = -2;
function ea() {
  return Ou++;
}
function Lu(e) {
  if (e instanceof HTMLFormElement)
    return "form";
  const t = Et(e.tagName);
  return Iu.test(t) ? "div" : t;
}
let At, as;
const Au = /^[^ \t\n\r\u000c]+/, Tu = /^[, \t\n\r\u000c]+/;
function Nu(e, t) {
  if (t.trim() === "")
    return t;
  let r = 0;
  function n(s) {
    let l;
    const d = s.exec(t.substring(r));
    return d ? (l = d[0], r += l.length, l) : "";
  }
  const i = [];
  for (; n(Tu), !(r >= t.length); ) {
    let s = n(Au);
    if (s.slice(-1) === ",")
      s = _t(e, s.substring(0, s.length - 1)), i.push(s);
    else {
      let l = "";
      s = _t(e, s);
      let d = !1;
      for (; ; ) {
        const o = t.charAt(r);
        if (o === "") {
          i.push((s + l).trim());
          break;
        } else if (d)
          o === ")" && (d = !1);
        else if (o === ",") {
          r += 1, i.push((s + l).trim());
          break;
        } else o === "(" && (d = !0);
        l += o, r += 1;
      }
    }
  }
  return i.join(", ");
}
const ls = /* @__PURE__ */ new WeakMap();
function _t(e, t) {
  return !t || t.trim() === "" ? t : yi(e, t);
}
function Pu(e) {
  return !!(e.tagName === "svg" || e.ownerSVGElement);
}
function yi(e, t) {
  let r = ls.get(e);
  if (r || (r = e.createElement("a"), ls.set(e, r)), !t)
    t = "";
  else if (t.startsWith("blob:") || t.startsWith("data:"))
    return t;
  return r.setAttribute("href", t), r.href;
}
function ta(e, t, r, n) {
  return n && (r === "src" || r === "href" && !(t === "use" && n[0] === "#") || r === "xlink:href" && n[0] !== "#" || r === "background" && ["table", "td", "th"].includes(t) ? _t(e, n) : r === "srcset" ? Nu(e, n) : r === "style" ? Or(n, yi(e)) : t === "object" && r === "data" ? _t(e, n) : n);
}
function ra(e, t, r) {
  return ["video", "audio"].includes(e) && t === "autoplay";
}
function _u(e, t, r) {
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
function Ir(e, t, r) {
  if (!e) return !1;
  if (e.nodeType !== e.ELEMENT_NODE)
    return r ? Ir(Se.parentNode(e), t, r) : !1;
  for (let n = e.classList.length; n--; ) {
    const i = e.classList[n];
    if (t.test(i))
      return !0;
  }
  return r ? Ir(Se.parentNode(e), t, r) : !1;
}
function na(e, t, r, n) {
  let i;
  if (Ko(e)) {
    if (i = e, !Se.childNodes(i).length)
      return !1;
  } else {
    if (Se.parentElement(e) === null)
      return !1;
    i = Se.parentElement(e);
  }
  try {
    if (typeof t == "string") {
      if (n) {
        if (i.closest(`.${t}`)) return !0;
      } else if (i.classList.contains(t)) return !0;
    } else if (Ir(i, t, n)) return !0;
    if (r) {
      if (n) {
        if (i.closest(r)) return !0;
      } else if (i.matches(r)) return !0;
    }
  } catch {
  }
  return !1;
}
function $u(e, t, r) {
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
function Du(e, t, r) {
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
function zu(e, t) {
  const {
    doc: r,
    mirror: n,
    blockClass: i,
    blockSelector: s,
    needsMask: l,
    inlineStylesheet: d,
    maskInputOptions: o = {},
    maskTextFn: h,
    maskInputFn: a,
    dataURLOptions: p = {},
    inlineImages: u,
    recordCanvas: c,
    keepIframeSrcFn: m,
    newlyAddedElement: f = !1,
    cssCaptured: g = !1
  } = t, k = Fu(r, n);
  switch (e.nodeType) {
    case e.DOCUMENT_NODE:
      return e.compatMode !== "CSS1Compat" ? {
        type: we.Document,
        childNodes: [],
        compatMode: e.compatMode
        // probably "BackCompat"
      } : {
        type: we.Document,
        childNodes: []
      };
    case e.DOCUMENT_TYPE_NODE:
      return {
        type: we.DocumentType,
        name: e.name,
        publicId: e.publicId,
        systemId: e.systemId,
        rootId: k
      };
    case e.ELEMENT_NODE:
      return Bu(e, {
        doc: r,
        blockClass: i,
        blockSelector: s,
        inlineStylesheet: d,
        maskInputOptions: o,
        maskInputFn: a,
        dataURLOptions: p,
        inlineImages: u,
        recordCanvas: c,
        keepIframeSrcFn: m,
        newlyAddedElement: f,
        rootId: k
      });
    case e.TEXT_NODE:
      return Uu(e, {
        doc: r,
        needsMask: l,
        maskTextFn: h,
        rootId: k,
        cssCaptured: g
      });
    case e.CDATA_SECTION_NODE:
      return {
        type: we.CDATA,
        textContent: "",
        rootId: k
      };
    case e.COMMENT_NODE:
      return {
        type: we.Comment,
        textContent: Se.textContent(e) || "",
        rootId: k
      };
    default:
      return !1;
  }
}
function Fu(e, t) {
  if (!t.hasNode(e)) return;
  const r = t.getId(e);
  return r === 1 ? void 0 : r;
}
function Uu(e, t) {
  const { needsMask: r, maskTextFn: n, rootId: i, cssCaptured: s } = t, l = Se.parentNode(e), d = l && l.tagName;
  let o = "";
  const h = d === "STYLE" ? !0 : void 0, a = d === "SCRIPT" ? !0 : void 0;
  return a ? o = "SCRIPT_PLACEHOLDER" : s || (o = Se.textContent(e), h && o && (o = Or(o, yi(t.doc)))), !h && !a && o && r && (o = n ? n(o, Se.parentElement(e)) : o.replace(/[\S]/g, "*")), {
    type: we.Text,
    textContent: o || "",
    rootId: i
  };
}
function Bu(e, t) {
  const {
    doc: r,
    blockClass: n,
    blockSelector: i,
    inlineStylesheet: s,
    maskInputOptions: l = {},
    maskInputFn: d,
    dataURLOptions: o = {},
    inlineImages: h,
    recordCanvas: a,
    keepIframeSrcFn: p,
    newlyAddedElement: u = !1,
    rootId: c
  } = t, m = _u(e, n, i), f = Lu(e);
  let g = {};
  const k = e.attributes.length;
  for (let w = 0; w < k; w++) {
    const S = e.attributes[w];
    ra(f, S.name, S.value) || (g[S.name] = ta(
      r,
      f,
      Et(S.name),
      S.value
    ));
  }
  if (f === "link" && s) {
    const w = Array.from(r.styleSheets).find((y) => y.href === e.href);
    let S = null;
    w && (S = oi(w)), S && (delete g.rel, delete g.href, g._cssText = S);
  }
  if (f === "style" && e.sheet) {
    let w = oi(
      e.sheet
    );
    w && (e.childNodes.length > 1 && (w = Ru(w, e)), g._cssText = w);
  }
  if (["input", "textarea", "select"].includes(f)) {
    const w = e.value, S = e.checked;
    g.type !== "radio" && g.type !== "checkbox" && g.type !== "submit" && g.type !== "button" && w ? g.value = Mr({
      element: e,
      type: Rr(e),
      tagName: f,
      value: w,
      maskInputOptions: l,
      maskInputFn: d
    }) : S && (g.checked = S);
  }
  if (f === "option" && (e.selected && !l.select ? g.selected = !0 : delete g.selected), f === "dialog" && e.open && (g.rr_open_mode = e.matches("dialog:modal") ? "modal" : "non-modal"), f === "canvas" && a) {
    if (e.__context === "2d")
      wu(e) || (g.rr_dataURL = e.toDataURL(
        o.type,
        o.quality
      ));
    else if (!("__context" in e)) {
      const w = e.toDataURL(
        o.type,
        o.quality
      ), S = r.createElement("canvas");
      S.width = e.width, S.height = e.height;
      const y = S.toDataURL(
        o.type,
        o.quality
      );
      w !== y && (g.rr_dataURL = w);
    }
  }
  if (f === "img" && h) {
    At || (At = r.createElement("canvas"), as = At.getContext("2d"));
    const w = e, S = w.currentSrc || w.getAttribute("src") || "<unknown-src>", y = w.crossOrigin, v = () => {
      w.removeEventListener("load", v);
      try {
        At.width = w.naturalWidth, At.height = w.naturalHeight, as.drawImage(w, 0, 0), g.rr_dataURL = At.toDataURL(
          o.type,
          o.quality
        );
      } catch (x) {
        if (w.crossOrigin !== "anonymous") {
          w.crossOrigin = "anonymous", w.complete && w.naturalWidth !== 0 ? v() : w.addEventListener("load", v);
          return;
        } else
          console.warn(
            `Cannot inline img src=${S}! Error: ${x}`
          );
      }
      w.crossOrigin === "anonymous" && (y ? g.crossOrigin = y : w.removeAttribute("crossorigin"));
    };
    w.complete && w.naturalWidth !== 0 ? v() : w.addEventListener("load", v);
  }
  if (["audio", "video"].includes(f)) {
    const w = g;
    w.rr_mediaState = e.paused ? "paused" : "played", w.rr_mediaCurrentTime = e.currentTime, w.rr_mediaPlaybackRate = e.playbackRate, w.rr_mediaMuted = e.muted, w.rr_mediaLoop = e.loop, w.rr_mediaVolume = e.volume;
  }
  if (u || (e.scrollLeft && (g.rr_scrollLeft = e.scrollLeft), e.scrollTop && (g.rr_scrollTop = e.scrollTop)), m) {
    const { width: w, height: S } = e.getBoundingClientRect();
    g = {
      class: g.class,
      rr_width: `${w}px`,
      rr_height: `${S}px`
    };
  }
  f === "iframe" && !p(g.src) && (e.contentDocument || (g.rr_src = g.src), delete g.src);
  let b;
  try {
    customElements.get(f) && (b = !0);
  } catch {
  }
  return {
    type: we.Element,
    tagName: f,
    attributes: g,
    childNodes: [],
    isSVG: Pu(e) || void 0,
    needBlock: m,
    rootId: c,
    isCustom: b
  };
}
function ce(e) {
  return e == null ? "" : e.toLowerCase();
}
function ia(e) {
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
function qu(e, t) {
  if (t.comment && e.type === we.Comment)
    return !0;
  if (e.type === we.Element) {
    if (t.script && // script tag
    (e.tagName === "script" || // (module)preload link
    e.tagName === "link" && (e.attributes.rel === "preload" && e.attributes.as === "script" || e.attributes.rel === "modulepreload") || // prefetch link
    e.tagName === "link" && e.attributes.rel === "prefetch" && typeof e.attributes.href == "string" && Qo(e.attributes.href) === "js"))
      return !0;
    if (t.headFavicon && (e.tagName === "link" && e.attributes.rel === "shortcut icon" || e.tagName === "meta" && (ce(e.attributes.name).match(
      /^msapplication-tile(image|color)$/
    ) || ce(e.attributes.name) === "application-name" || ce(e.attributes.rel) === "icon" || ce(e.attributes.rel) === "apple-touch-icon" || ce(e.attributes.rel) === "shortcut icon")))
      return !0;
    if (e.tagName === "meta") {
      if (t.headMetaDescKeywords && ce(e.attributes.name).match(/^description|keywords$/))
        return !0;
      if (t.headMetaSocial && (ce(e.attributes.property).match(/^(og|twitter|fb):/) || // og = opengraph (facebook)
      ce(e.attributes.name).match(/^(og|twitter):/) || ce(e.attributes.name) === "pinterest"))
        return !0;
      if (t.headMetaRobots && (ce(e.attributes.name) === "robots" || ce(e.attributes.name) === "googlebot" || ce(e.attributes.name) === "bingbot"))
        return !0;
      if (t.headMetaHttpEquiv && e.attributes["http-equiv"] !== void 0)
        return !0;
      if (t.headMetaAuthorship && (ce(e.attributes.name) === "author" || ce(e.attributes.name) === "generator" || ce(e.attributes.name) === "framework" || ce(e.attributes.name) === "publisher" || ce(e.attributes.name) === "progid" || ce(e.attributes.property).match(/^article:/) || ce(e.attributes.property).match(/^product:/)))
        return !0;
      if (t.headMetaVerification && (ce(e.attributes.name) === "google-site-verification" || ce(e.attributes.name) === "yandex-verification" || ce(e.attributes.name) === "csrf-token" || ce(e.attributes.name) === "p:domain_verify" || ce(e.attributes.name) === "verify-v1" || ce(e.attributes.name) === "verification" || ce(e.attributes.name) === "shopify-checkout-api-token"))
        return !0;
    }
  }
  return !1;
}
function $t(e, t) {
  const {
    doc: r,
    mirror: n,
    blockClass: i,
    blockSelector: s,
    maskTextClass: l,
    maskTextSelector: d,
    skipChild: o = !1,
    inlineStylesheet: h = !0,
    maskInputOptions: a = {},
    maskTextFn: p,
    maskInputFn: u,
    slimDOMOptions: c,
    dataURLOptions: m = {},
    inlineImages: f = !1,
    recordCanvas: g = !1,
    onSerialize: k,
    onIframeLoad: b,
    iframeLoadTimeout: w = 5e3,
    onStylesheetLoad: S,
    stylesheetLoadTimeout: y = 5e3,
    keepIframeSrcFn: v = () => !1,
    newlyAddedElement: x = !1,
    cssCaptured: M = !1
  } = t;
  let { needsMask: L } = t, { preserveWhiteSpace: R = !0 } = t;
  L || (L = na(
    e,
    l,
    d,
    L === void 0
  ));
  const B = zu(e, {
    doc: r,
    mirror: n,
    blockClass: i,
    blockSelector: s,
    needsMask: L,
    inlineStylesheet: h,
    maskInputOptions: a,
    maskTextFn: p,
    maskInputFn: u,
    dataURLOptions: m,
    inlineImages: f,
    recordCanvas: g,
    keepIframeSrcFn: v,
    newlyAddedElement: x,
    cssCaptured: M
  });
  if (!B)
    return console.warn(e, "not serialized"), null;
  let z;
  n.hasNode(e) ? z = n.getId(e) : qu(B, c) || !R && B.type === we.Text && !B.textContent.replace(/^\s+|\s+$/gm, "").length ? z = Zt : z = ea();
  const C = Object.assign(B, { id: z });
  if (n.add(e, C), z === Zt)
    return null;
  k && k(e);
  let ke = !o;
  if (C.type === we.Element) {
    ke = ke && !C.needBlock, delete C.needBlock;
    const re = Se.shadowRoot(e);
    re && Kt(re) && (C.isShadowHost = !0);
  }
  if ((C.type === we.Document || C.type === we.Element) && ke) {
    c.headWhitespace && C.type === we.Element && C.tagName === "head" && (R = !1);
    const re = {
      doc: r,
      mirror: n,
      blockClass: i,
      blockSelector: s,
      needsMask: L,
      maskTextClass: l,
      maskTextSelector: d,
      skipChild: o,
      inlineStylesheet: h,
      maskInputOptions: a,
      maskTextFn: p,
      maskInputFn: u,
      slimDOMOptions: c,
      dataURLOptions: m,
      inlineImages: f,
      recordCanvas: g,
      preserveWhiteSpace: R,
      onSerialize: k,
      onIframeLoad: b,
      iframeLoadTimeout: w,
      onStylesheetLoad: S,
      stylesheetLoadTimeout: y,
      keepIframeSrcFn: v,
      cssCaptured: !1
    };
    if (!(C.type === we.Element && C.tagName === "textarea" && C.attributes.value !== void 0)) {
      C.type === we.Element && C.attributes._cssText !== void 0 && typeof C.attributes._cssText == "string" && (re.cssCaptured = !0);
      for (const he of Array.from(Se.childNodes(e))) {
        const ye = $t(he, re);
        ye && C.childNodes.push(ye);
      }
    }
    let te = null;
    if (Ko(e) && (te = Se.shadowRoot(e)))
      for (const he of Array.from(Se.childNodes(te))) {
        const ye = $t(he, re);
        ye && (Kt(te) && (ye.isShadow = !0), C.childNodes.push(ye));
      }
  }
  const xe = Se.parentNode(e);
  return xe && Xt(xe) && Kt(xe) && (C.isShadow = !0), C.type === we.Element && C.tagName === "iframe" && $u(
    e,
    () => {
      const re = e.contentDocument;
      if (re && b) {
        const te = $t(re, {
          doc: re,
          mirror: n,
          blockClass: i,
          blockSelector: s,
          needsMask: L,
          maskTextClass: l,
          maskTextSelector: d,
          skipChild: !1,
          inlineStylesheet: h,
          maskInputOptions: a,
          maskTextFn: p,
          maskInputFn: u,
          slimDOMOptions: c,
          dataURLOptions: m,
          inlineImages: f,
          recordCanvas: g,
          preserveWhiteSpace: R,
          onSerialize: k,
          onIframeLoad: b,
          iframeLoadTimeout: w,
          onStylesheetLoad: S,
          stylesheetLoadTimeout: y,
          keepIframeSrcFn: v
        });
        te && b(
          e,
          te
        );
      }
    },
    w
  ), C.type === we.Element && C.tagName === "link" && typeof C.attributes.rel == "string" && (C.attributes.rel === "stylesheet" || C.attributes.rel === "preload" && typeof C.attributes.href == "string" && Qo(C.attributes.href) === "css") && Du(
    e,
    () => {
      if (S) {
        const re = $t(e, {
          doc: r,
          mirror: n,
          blockClass: i,
          blockSelector: s,
          needsMask: L,
          maskTextClass: l,
          maskTextSelector: d,
          skipChild: !1,
          inlineStylesheet: h,
          maskInputOptions: a,
          maskTextFn: p,
          maskInputFn: u,
          slimDOMOptions: c,
          dataURLOptions: m,
          inlineImages: f,
          recordCanvas: g,
          preserveWhiteSpace: R,
          onSerialize: k,
          onIframeLoad: b,
          iframeLoadTimeout: w,
          onStylesheetLoad: S,
          stylesheetLoadTimeout: y,
          keepIframeSrcFn: v
        });
        re && S(
          e,
          re
        );
      }
    },
    y
  ), C;
}
function Wu(e, t) {
  const {
    mirror: r = new Zo(),
    blockClass: n = "rr-block",
    blockSelector: i = null,
    maskTextClass: s = "rr-mask",
    maskTextSelector: l = null,
    inlineStylesheet: d = !0,
    inlineImages: o = !1,
    recordCanvas: h = !1,
    maskAllInputs: a = !1,
    maskTextFn: p,
    maskInputFn: u,
    slimDOM: c = !1,
    dataURLOptions: m,
    preserveWhiteSpace: f,
    onSerialize: g,
    onIframeLoad: k,
    iframeLoadTimeout: b,
    onStylesheetLoad: w,
    stylesheetLoadTimeout: S,
    keepIframeSrcFn: y = () => !1
  } = t, v = a === !0 ? {
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
  } : a, x = ia(c);
  return $t(e, {
    doc: e,
    mirror: r,
    blockClass: n,
    blockSelector: i,
    maskTextClass: s,
    maskTextSelector: l,
    skipChild: !1,
    inlineStylesheet: d,
    maskInputOptions: v,
    maskTextFn: p,
    maskInputFn: u,
    slimDOMOptions: x,
    dataURLOptions: m,
    inlineImages: o,
    recordCanvas: h,
    preserveWhiteSpace: f,
    onSerialize: g,
    onIframeLoad: k,
    iframeLoadTimeout: b,
    onStylesheetLoad: w,
    stylesheetLoadTimeout: S,
    keepIframeSrcFn: y,
    newlyAddedElement: !1
  });
}
function ju(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function Hu(e) {
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
var hr = { exports: {} }, cs;
function Vu() {
  if (cs) return hr.exports;
  cs = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return hr.exports = t(), hr.exports.createColors = t, hr.exports;
}
const Gu = {}, Yu = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Gu
}, Symbol.toStringTag, { value: "Module" })), Ke = /* @__PURE__ */ Hu(Yu);
var Qr, us;
function bi() {
  if (us) return Qr;
  us = 1;
  let e = /* @__PURE__ */ Vu(), t = Ke;
  class r extends Error {
    constructor(i, s, l, d, o, h) {
      super(i), this.name = "CssSyntaxError", this.reason = i, o && (this.file = o), d && (this.source = d), h && (this.plugin = h), typeof s < "u" && typeof l < "u" && (typeof s == "number" ? (this.line = s, this.column = l) : (this.line = s.line, this.column = s.column, this.endLine = l.line, this.endColumn = l.column)), this.setMessage(), Error.captureStackTrace && Error.captureStackTrace(this, r);
    }
    setMessage() {
      this.message = this.plugin ? this.plugin + ": " : "", this.message += this.file ? this.file : "<css input>", typeof this.line < "u" && (this.message += ":" + this.line + ":" + this.column), this.message += ": " + this.reason;
    }
    showSourceCode(i) {
      if (!this.source) return "";
      let s = this.source;
      i == null && (i = e.isColorSupported), t && i && (s = t(s));
      let l = s.split(/\r?\n/), d = Math.max(this.line - 3, 0), o = Math.min(this.line + 2, l.length), h = String(o).length, a, p;
      if (i) {
        let { bold: u, gray: c, red: m } = e.createColors(!0);
        a = (f) => u(m(f)), p = (f) => c(f);
      } else
        a = p = (u) => u;
      return l.slice(d, o).map((u, c) => {
        let m = d + 1 + c, f = " " + (" " + m).slice(-h) + " | ";
        if (m === this.line) {
          let g = p(f.replace(/\d/g, " ")) + u.slice(0, this.column - 1).replace(/[^\t]/g, " ");
          return a(">") + p(f) + u + `
 ` + g + a("^");
        }
        return " " + p(f) + u;
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
  return Qr = r, r.default = r, Qr;
}
var pr = {}, ds;
function vi() {
  return ds || (ds = 1, pr.isClean = Symbol("isClean"), pr.my = Symbol("my")), pr;
}
var en, hs;
function sa() {
  if (hs) return en;
  hs = 1;
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
      let l = "@" + i.name, d = i.params ? this.rawValue(i, "params") : "";
      if (typeof i.raws.afterName < "u" ? l += i.raws.afterName : d && (l += " "), i.nodes)
        this.block(i, l + d);
      else {
        let o = (i.raws.between || "") + (s ? ";" : "");
        this.builder(l + d + o, i);
      }
    }
    beforeAfter(i, s) {
      let l;
      i.type === "decl" ? l = this.raw(i, null, "beforeDecl") : i.type === "comment" ? l = this.raw(i, null, "beforeComment") : s === "before" ? l = this.raw(i, null, "beforeRule") : l = this.raw(i, null, "beforeClose");
      let d = i.parent, o = 0;
      for (; d && d.type !== "root"; )
        o += 1, d = d.parent;
      if (l.includes(`
`)) {
        let h = this.raw(i, null, "indent");
        if (h.length)
          for (let a = 0; a < o; a++) l += h;
      }
      return l;
    }
    block(i, s) {
      let l = this.raw(i, "between", "beforeOpen");
      this.builder(s + l + "{", i, "start");
      let d;
      i.nodes && i.nodes.length ? (this.body(i), d = this.raw(i, "after")) : d = this.raw(i, "after", "emptyBody"), d && this.builder(d), this.builder("}", i, "end");
    }
    body(i) {
      let s = i.nodes.length - 1;
      for (; s > 0 && i.nodes[s].type === "comment"; )
        s -= 1;
      let l = this.raw(i, "semicolon");
      for (let d = 0; d < i.nodes.length; d++) {
        let o = i.nodes[d], h = this.raw(o, "before");
        h && this.builder(h), this.stringify(o, s !== d || l);
      }
    }
    comment(i) {
      let s = this.raw(i, "left", "commentLeft"), l = this.raw(i, "right", "commentRight");
      this.builder("/*" + s + i.text + l + "*/", i);
    }
    decl(i, s) {
      let l = this.raw(i, "between", "colon"), d = i.prop + l + this.rawValue(i, "value");
      i.important && (d += i.raws.important || " !important"), s && (d += ";"), this.builder(d, i);
    }
    document(i) {
      this.body(i);
    }
    raw(i, s, l) {
      let d;
      if (l || (l = s), s && (d = i.raws[s], typeof d < "u"))
        return d;
      let o = i.parent;
      if (l === "before" && (!o || o.type === "root" && o.first === i || o && o.type === "document"))
        return "";
      if (!o) return e[l];
      let h = i.root();
      if (h.rawCache || (h.rawCache = {}), typeof h.rawCache[l] < "u")
        return h.rawCache[l];
      if (l === "before" || l === "after")
        return this.beforeAfter(i, l);
      {
        let a = "raw" + t(l);
        this[a] ? d = this[a](h, i) : h.walk((p) => {
          if (d = p.raws[s], typeof d < "u") return !1;
        });
      }
      return typeof d > "u" && (d = e[l]), h.rawCache[l] = d, d;
    }
    rawBeforeClose(i) {
      let s;
      return i.walk((l) => {
        if (l.nodes && l.nodes.length > 0 && typeof l.raws.after < "u")
          return s = l.raws.after, s.includes(`
`) && (s = s.replace(/[^\n]+$/, "")), !1;
      }), s && (s = s.replace(/\S/g, "")), s;
    }
    rawBeforeComment(i, s) {
      let l;
      return i.walkComments((d) => {
        if (typeof d.raws.before < "u")
          return l = d.raws.before, l.includes(`
`) && (l = l.replace(/[^\n]+$/, "")), !1;
      }), typeof l > "u" ? l = this.raw(s, null, "beforeDecl") : l && (l = l.replace(/\S/g, "")), l;
    }
    rawBeforeDecl(i, s) {
      let l;
      return i.walkDecls((d) => {
        if (typeof d.raws.before < "u")
          return l = d.raws.before, l.includes(`
`) && (l = l.replace(/[^\n]+$/, "")), !1;
      }), typeof l > "u" ? l = this.raw(s, null, "beforeRule") : l && (l = l.replace(/\S/g, "")), l;
    }
    rawBeforeOpen(i) {
      let s;
      return i.walk((l) => {
        if (l.type !== "decl" && (s = l.raws.between, typeof s < "u"))
          return !1;
      }), s;
    }
    rawBeforeRule(i) {
      let s;
      return i.walk((l) => {
        if (l.nodes && (l.parent !== i || i.first !== l) && typeof l.raws.before < "u")
          return s = l.raws.before, s.includes(`
`) && (s = s.replace(/[^\n]+$/, "")), !1;
      }), s && (s = s.replace(/\S/g, "")), s;
    }
    rawColon(i) {
      let s;
      return i.walkDecls((l) => {
        if (typeof l.raws.between < "u")
          return s = l.raws.between.replace(/[^\s:]/g, ""), !1;
      }), s;
    }
    rawEmptyBody(i) {
      let s;
      return i.walk((l) => {
        if (l.nodes && l.nodes.length === 0 && (s = l.raws.after, typeof s < "u"))
          return !1;
      }), s;
    }
    rawIndent(i) {
      if (i.raws.indent) return i.raws.indent;
      let s;
      return i.walk((l) => {
        let d = l.parent;
        if (d && d !== i && d.parent && d.parent === i && typeof l.raws.before < "u") {
          let o = l.raws.before.split(`
`);
          return s = o[o.length - 1], s = s.replace(/\S/g, ""), !1;
        }
      }), s;
    }
    rawSemicolon(i) {
      let s;
      return i.walk((l) => {
        if (l.nodes && l.nodes.length && l.last.type === "decl" && (s = l.raws.semicolon, typeof s < "u"))
          return !1;
      }), s;
    }
    rawValue(i, s) {
      let l = i[s], d = i.raws[s];
      return d && d.value === l ? d.raw : l;
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
  return en = r, r.default = r, en;
}
var tn, ps;
function $r() {
  if (ps) return tn;
  ps = 1;
  let e = sa();
  function t(r, n) {
    new e(n).stringify(r);
  }
  return tn = t, t.default = t, tn;
}
var rn, fs;
function Dr() {
  if (fs) return rn;
  fs = 1;
  let { isClean: e, my: t } = vi(), r = bi(), n = sa(), i = $r();
  function s(d, o) {
    let h = new d.constructor();
    for (let a in d) {
      if (!Object.prototype.hasOwnProperty.call(d, a) || a === "proxyCache") continue;
      let p = d[a], u = typeof p;
      a === "parent" && u === "object" ? o && (h[a] = o) : a === "source" ? h[a] = p : Array.isArray(p) ? h[a] = p.map((c) => s(c, h)) : (u === "object" && p !== null && (p = s(p)), h[a] = p);
    }
    return h;
  }
  class l {
    constructor(o = {}) {
      this.raws = {}, this[e] = !1, this[t] = !0;
      for (let h in o)
        if (h === "nodes") {
          this.nodes = [];
          for (let a of o[h])
            typeof a.clone == "function" ? this.append(a.clone()) : this.append(a);
        } else
          this[h] = o[h];
    }
    addToError(o) {
      if (o.postcssNode = this, o.stack && this.source && /\n\s{4}at /.test(o.stack)) {
        let h = this.source;
        o.stack = o.stack.replace(
          /\n\s{4}at /,
          `$&${h.input.from}:${h.start.line}:${h.start.column}$&`
        );
      }
      return o;
    }
    after(o) {
      return this.parent.insertAfter(this, o), this;
    }
    assign(o = {}) {
      for (let h in o)
        this[h] = o[h];
      return this;
    }
    before(o) {
      return this.parent.insertBefore(this, o), this;
    }
    cleanRaws(o) {
      delete this.raws.before, delete this.raws.after, o || delete this.raws.between;
    }
    clone(o = {}) {
      let h = s(this);
      for (let a in o)
        h[a] = o[a];
      return h;
    }
    cloneAfter(o = {}) {
      let h = this.clone(o);
      return this.parent.insertAfter(this, h), h;
    }
    cloneBefore(o = {}) {
      let h = this.clone(o);
      return this.parent.insertBefore(this, h), h;
    }
    error(o, h = {}) {
      if (this.source) {
        let { end: a, start: p } = this.rangeBy(h);
        return this.source.input.error(
          o,
          { column: p.column, line: p.line },
          { column: a.column, line: a.line },
          h
        );
      }
      return new r(o);
    }
    getProxyProcessor() {
      return {
        get(o, h) {
          return h === "proxyOf" ? o : h === "root" ? () => o.root().toProxy() : o[h];
        },
        set(o, h, a) {
          return o[h] === a || (o[h] = a, (h === "prop" || h === "value" || h === "name" || h === "params" || h === "important" || /* c8 ignore next */
          h === "text") && o.markDirty()), !0;
        }
      };
    }
    markDirty() {
      if (this[e]) {
        this[e] = !1;
        let o = this;
        for (; o = o.parent; )
          o[e] = !1;
      }
    }
    next() {
      if (!this.parent) return;
      let o = this.parent.index(this);
      return this.parent.nodes[o + 1];
    }
    positionBy(o, h) {
      let a = this.source.start;
      if (o.index)
        a = this.positionInside(o.index, h);
      else if (o.word) {
        h = this.toString();
        let p = h.indexOf(o.word);
        p !== -1 && (a = this.positionInside(p, h));
      }
      return a;
    }
    positionInside(o, h) {
      let a = h || this.toString(), p = this.source.start.column, u = this.source.start.line;
      for (let c = 0; c < o; c++)
        a[c] === `
` ? (p = 1, u += 1) : p += 1;
      return { column: p, line: u };
    }
    prev() {
      if (!this.parent) return;
      let o = this.parent.index(this);
      return this.parent.nodes[o - 1];
    }
    rangeBy(o) {
      let h = {
        column: this.source.start.column,
        line: this.source.start.line
      }, a = this.source.end ? {
        column: this.source.end.column + 1,
        line: this.source.end.line
      } : {
        column: h.column + 1,
        line: h.line
      };
      if (o.word) {
        let p = this.toString(), u = p.indexOf(o.word);
        u !== -1 && (h = this.positionInside(u, p), a = this.positionInside(u + o.word.length, p));
      } else
        o.start ? h = {
          column: o.start.column,
          line: o.start.line
        } : o.index && (h = this.positionInside(o.index)), o.end ? a = {
          column: o.end.column,
          line: o.end.line
        } : typeof o.endIndex == "number" ? a = this.positionInside(o.endIndex) : o.index && (a = this.positionInside(o.index + 1));
      return (a.line < h.line || a.line === h.line && a.column <= h.column) && (a = { column: h.column + 1, line: h.line }), { end: a, start: h };
    }
    raw(o, h) {
      return new n().raw(this, o, h);
    }
    remove() {
      return this.parent && this.parent.removeChild(this), this.parent = void 0, this;
    }
    replaceWith(...o) {
      if (this.parent) {
        let h = this, a = !1;
        for (let p of o)
          p === this ? a = !0 : a ? (this.parent.insertAfter(h, p), h = p) : this.parent.insertBefore(h, p);
        a || this.remove();
      }
      return this;
    }
    root() {
      let o = this;
      for (; o.parent && o.parent.type !== "document"; )
        o = o.parent;
      return o;
    }
    toJSON(o, h) {
      let a = {}, p = h == null;
      h = h || /* @__PURE__ */ new Map();
      let u = 0;
      for (let c in this) {
        if (!Object.prototype.hasOwnProperty.call(this, c) || c === "parent" || c === "proxyCache") continue;
        let m = this[c];
        if (Array.isArray(m))
          a[c] = m.map((f) => typeof f == "object" && f.toJSON ? f.toJSON(null, h) : f);
        else if (typeof m == "object" && m.toJSON)
          a[c] = m.toJSON(null, h);
        else if (c === "source") {
          let f = h.get(m.input);
          f == null && (f = u, h.set(m.input, u), u++), a[c] = {
            end: m.end,
            inputId: f,
            start: m.start
          };
        } else
          a[c] = m;
      }
      return p && (a.inputs = [...h.keys()].map((c) => c.toJSON())), a;
    }
    toProxy() {
      return this.proxyCache || (this.proxyCache = new Proxy(this, this.getProxyProcessor())), this.proxyCache;
    }
    toString(o = i) {
      o.stringify && (o = o.stringify);
      let h = "";
      return o(this, (a) => {
        h += a;
      }), h;
    }
    warn(o, h, a) {
      let p = { node: this };
      for (let u in a) p[u] = a[u];
      return o.warn(h, p);
    }
    get proxyOf() {
      return this;
    }
  }
  return rn = l, l.default = l, rn;
}
var nn, ms;
function zr() {
  if (ms) return nn;
  ms = 1;
  let e = Dr();
  class t extends e {
    constructor(n) {
      n && typeof n.value < "u" && typeof n.value != "string" && (n = { ...n, value: String(n.value) }), super(n), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return nn = t, t.default = t, nn;
}
var sn, gs;
function Xu() {
  if (gs) return sn;
  gs = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return sn = { nanoid: (n = 21) => {
    let i = "", s = n;
    for (; s--; )
      i += e[Math.random() * 64 | 0];
    return i;
  }, customAlphabet: (n, i = 21) => (s = i) => {
    let l = "", d = s;
    for (; d--; )
      l += n[Math.random() * n.length | 0];
    return l;
  } }, sn;
}
var on, ys;
function oa() {
  if (ys) return on;
  ys = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Ke, { existsSync: r, readFileSync: n } = Ke, { dirname: i, join: s } = Ke;
  function l(o) {
    return Buffer ? Buffer.from(o, "base64").toString() : window.atob(o);
  }
  class d {
    constructor(h, a) {
      if (a.map === !1) return;
      this.loadAnnotation(h), this.inline = this.startWith(this.annotation, "data:");
      let p = a.map ? a.map.prev : void 0, u = this.loadMap(a.from, p);
      !this.mapFile && a.from && (this.mapFile = a.from), this.mapFile && (this.root = i(this.mapFile)), u && (this.text = u);
    }
    consumer() {
      return this.consumerCache || (this.consumerCache = new e(this.text)), this.consumerCache;
    }
    decodeInline(h) {
      let a = /^data:application\/json;charset=utf-?8;base64,/, p = /^data:application\/json;base64,/, u = /^data:application\/json;charset=utf-?8,/, c = /^data:application\/json,/;
      if (u.test(h) || c.test(h))
        return decodeURIComponent(h.substr(RegExp.lastMatch.length));
      if (a.test(h) || p.test(h))
        return l(h.substr(RegExp.lastMatch.length));
      let m = h.match(/data:application\/json;([^,]+),/)[1];
      throw new Error("Unsupported source map encoding " + m);
    }
    getAnnotationURL(h) {
      return h.replace(/^\/\*\s*# sourceMappingURL=/, "").trim();
    }
    isMap(h) {
      return typeof h != "object" ? !1 : typeof h.mappings == "string" || typeof h._mappings == "string" || Array.isArray(h.sections);
    }
    loadAnnotation(h) {
      let a = h.match(/\/\*\s*# sourceMappingURL=/gm);
      if (!a) return;
      let p = h.lastIndexOf(a.pop()), u = h.indexOf("*/", p);
      p > -1 && u > -1 && (this.annotation = this.getAnnotationURL(h.substring(p, u)));
    }
    loadFile(h) {
      if (this.root = i(h), r(h))
        return this.mapFile = h, n(h, "utf-8").toString().trim();
    }
    loadMap(h, a) {
      if (a === !1) return !1;
      if (a) {
        if (typeof a == "string")
          return a;
        if (typeof a == "function") {
          let p = a(h);
          if (p) {
            let u = this.loadFile(p);
            if (!u)
              throw new Error(
                "Unable to load previous source map: " + p.toString()
              );
            return u;
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
          let p = this.annotation;
          return h && (p = s(i(h), p)), this.loadFile(p);
        }
      }
    }
    startWith(h, a) {
      return h ? h.substr(0, a.length) === a : !1;
    }
    withContent() {
      return !!(this.consumer().sourcesContent && this.consumer().sourcesContent.length > 0);
    }
  }
  return on = d, d.default = d, on;
}
var an, bs;
function Fr() {
  if (bs) return an;
  bs = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Ke, { fileURLToPath: r, pathToFileURL: n } = Ke, { isAbsolute: i, resolve: s } = Ke, { nanoid: l } = /* @__PURE__ */ Xu(), d = Ke, o = bi(), h = oa(), a = Symbol("fromOffsetCache"), p = !!(e && t), u = !!(s && i);
  class c {
    constructor(f, g = {}) {
      if (f === null || typeof f > "u" || typeof f == "object" && !f.toString)
        throw new Error(`PostCSS received ${f} instead of CSS string`);
      if (this.css = f.toString(), this.css[0] === "\uFEFF" || this.css[0] === "￾" ? (this.hasBOM = !0, this.css = this.css.slice(1)) : this.hasBOM = !1, g.from && (!u || /^\w+:\/\//.test(g.from) || i(g.from) ? this.file = g.from : this.file = s(g.from)), u && p) {
        let k = new h(this.css, g);
        if (k.text) {
          this.map = k;
          let b = k.consumer().file;
          !this.file && b && (this.file = this.mapResolve(b));
        }
      }
      this.file || (this.id = "<input css " + l(6) + ">"), this.map && (this.map.file = this.from);
    }
    error(f, g, k, b = {}) {
      let w, S, y;
      if (g && typeof g == "object") {
        let x = g, M = k;
        if (typeof x.offset == "number") {
          let L = this.fromOffset(x.offset);
          g = L.line, k = L.col;
        } else
          g = x.line, k = x.column;
        if (typeof M.offset == "number") {
          let L = this.fromOffset(M.offset);
          S = L.line, y = L.col;
        } else
          S = M.line, y = M.column;
      } else if (!k) {
        let x = this.fromOffset(g);
        g = x.line, k = x.col;
      }
      let v = this.origin(g, k, S, y);
      return v ? w = new o(
        f,
        v.endLine === void 0 ? v.line : { column: v.column, line: v.line },
        v.endLine === void 0 ? v.column : { column: v.endColumn, line: v.endLine },
        v.source,
        v.file,
        b.plugin
      ) : w = new o(
        f,
        S === void 0 ? g : { column: k, line: g },
        S === void 0 ? k : { column: y, line: S },
        this.css,
        this.file,
        b.plugin
      ), w.input = { column: k, endColumn: y, endLine: S, line: g, source: this.css }, this.file && (n && (w.input.url = n(this.file).toString()), w.input.file = this.file), w;
    }
    fromOffset(f) {
      let g, k;
      if (this[a])
        k = this[a];
      else {
        let w = this.css.split(`
`);
        k = new Array(w.length);
        let S = 0;
        for (let y = 0, v = w.length; y < v; y++)
          k[y] = S, S += w[y].length + 1;
        this[a] = k;
      }
      g = k[k.length - 1];
      let b = 0;
      if (f >= g)
        b = k.length - 1;
      else {
        let w = k.length - 2, S;
        for (; b < w; )
          if (S = b + (w - b >> 1), f < k[S])
            w = S - 1;
          else if (f >= k[S + 1])
            b = S + 1;
          else {
            b = S;
            break;
          }
      }
      return {
        col: f - k[b] + 1,
        line: b + 1
      };
    }
    mapResolve(f) {
      return /^\w+:\/\//.test(f) ? f : s(this.map.consumer().sourceRoot || this.map.root || ".", f);
    }
    origin(f, g, k, b) {
      if (!this.map) return !1;
      let w = this.map.consumer(), S = w.originalPositionFor({ column: g, line: f });
      if (!S.source) return !1;
      let y;
      typeof k == "number" && (y = w.originalPositionFor({ column: b, line: k }));
      let v;
      i(S.source) ? v = n(S.source) : v = new URL(
        S.source,
        this.map.consumer().sourceRoot || n(this.map.mapFile)
      );
      let x = {
        column: S.column,
        endColumn: y && y.column,
        endLine: y && y.line,
        line: S.line,
        url: v.toString()
      };
      if (v.protocol === "file:")
        if (r)
          x.file = r(v);
        else
          throw new Error("file: protocol is not available in this PostCSS build");
      let M = w.sourceContentFor(S.source);
      return M && (x.source = M), x;
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
  return an = c, c.default = c, d && d.registerInput && d.registerInput(c), an;
}
var ln, vs;
function aa() {
  if (vs) return ln;
  vs = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Ke, { dirname: r, relative: n, resolve: i, sep: s } = Ke, { pathToFileURL: l } = Ke, d = Fr(), o = !!(e && t), h = !!(r && i && n && s);
  class a {
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
      if (this.clearAnnotation(), h && o && this.isMap())
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
      this.stringify(this.root, (b, w, S) => {
        if (this.css += b, w && S !== "end" && (f.generated.line = u, f.generated.column = c - 1, w.source && w.source.start ? (f.source = this.sourcePath(w), f.original.line = w.source.start.line, f.original.column = w.source.start.column - 1, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, this.map.addMapping(f))), g = b.match(/\n/g), g ? (u += g.length, k = b.lastIndexOf(`
`), c = b.length - k) : c += b.length, w && S !== "start") {
          let y = w.parent || { raws: {} };
          (!(w.type === "decl" || w.type === "atrule" && !w.nodes) || w !== y.last || y.raws.semicolon) && (w.source && w.source.end ? (f.source = this.sourcePath(w), f.original.line = w.source.end.line, f.original.column = w.source.end.column - 1, f.generated.line = u, f.generated.column = c - 2, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, f.generated.line = u, f.generated.column = c - 1, this.map.addMapping(f)));
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
      s === "\\" && (u = u.replace(/\\/g, "/"));
      let m = encodeURI(u).replace(/[#?]/g, encodeURIComponent);
      return this.memoizedURLs.set(u, m), m;
    }
  }
  return ln = a, ln;
}
var cn, ws;
function Ur() {
  if (ws) return cn;
  ws = 1;
  let e = Dr();
  class t extends e {
    constructor(n) {
      super(n), this.type = "comment";
    }
  }
  return cn = t, t.default = t, cn;
}
var un, ks;
function Mt() {
  if (ks) return un;
  ks = 1;
  let { isClean: e, my: t } = vi(), r = zr(), n = Ur(), i = Dr(), s, l, d, o;
  function h(u) {
    return u.map((c) => (c.nodes && (c.nodes = h(c.nodes)), delete c.source, c));
  }
  function a(u) {
    if (u[e] = !1, u.proxyOf.nodes)
      for (let c of u.proxyOf.nodes)
        a(c);
  }
  class p extends i {
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
            ...f.map((g) => typeof g == "function" ? (k, b) => g(k.toProxy(), b) : g)
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
      for (let b of g) this.proxyOf.nodes.splice(f + 1, 0, b);
      let k;
      for (let b in this.indexes)
        k = this.indexes[b], f < k && (this.indexes[b] = k + g.length);
      return this.markDirty(), this;
    }
    insertBefore(c, m) {
      let f = this.index(c), g = f === 0 ? "prepend" : !1, k = this.normalize(m, this.proxyOf.nodes[f], g).reverse();
      f = this.index(c);
      for (let w of k) this.proxyOf.nodes.splice(f, 0, w);
      let b;
      for (let w in this.indexes)
        b = this.indexes[w], f <= b && (this.indexes[w] = b + k.length);
      return this.markDirty(), this;
    }
    normalize(c, m) {
      if (typeof c == "string")
        c = h(s(c).nodes);
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
      return c.map((g) => (g[t] || p.rebuild(g), g = g.proxyOf, g.parent && g.parent.removeChild(g), g[e] && a(g), typeof g.raws.before > "u" && m && typeof m.raws.before < "u" && (g.raws.before = m.raws.before.replace(/\S/g, "")), g.parent = this.proxyOf, g));
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
  return p.registerParse = (u) => {
    s = u;
  }, p.registerRule = (u) => {
    l = u;
  }, p.registerAtRule = (u) => {
    d = u;
  }, p.registerRoot = (u) => {
    o = u;
  }, un = p, p.default = p, p.rebuild = (u) => {
    u.type === "atrule" ? Object.setPrototypeOf(u, d.prototype) : u.type === "rule" ? Object.setPrototypeOf(u, l.prototype) : u.type === "decl" ? Object.setPrototypeOf(u, r.prototype) : u.type === "comment" ? Object.setPrototypeOf(u, n.prototype) : u.type === "root" && Object.setPrototypeOf(u, o.prototype), u[t] = !0, u.nodes && u.nodes.forEach((c) => {
      p.rebuild(c);
    });
  }, un;
}
var dn, xs;
function wi() {
  if (xs) return dn;
  xs = 1;
  let e = Mt(), t, r;
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
  }, dn = n, n.default = n, dn;
}
var hn, Ss;
function la() {
  if (Ss) return hn;
  Ss = 1;
  let e = {};
  return hn = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, hn;
}
var pn, Cs;
function ca() {
  if (Cs) return pn;
  Cs = 1;
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
  return pn = e, e.default = e, pn;
}
var fn, Es;
function ki() {
  if (Es) return fn;
  Es = 1;
  let e = ca();
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
  return fn = t, t.default = t, fn;
}
var mn, Ms;
function Ku() {
  if (Ms) return mn;
  Ms = 1;
  const e = 39, t = 34, r = 92, n = 47, i = 10, s = 32, l = 12, d = 9, o = 13, h = 91, a = 93, p = 40, u = 41, c = 123, m = 125, f = 59, g = 42, k = 58, b = 64, w = /[\t\n\f\r "#'()/;[\\\]{}]/g, S = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, y = /.[\r\n"'(/\\]/, v = /[\da-f]/i;
  return mn = function(M, L = {}) {
    let R = M.css.valueOf(), B = L.ignoreErrors, z, C, ke, xe, re, te, he, ye, se, Y, We = R.length, I = 0, Le = [], Ce = [];
    function Ue() {
      return I;
    }
    function me(W) {
      throw M.error("Unclosed " + W, I);
    }
    function be() {
      return Ce.length === 0 && I >= We;
    }
    function Ze(W) {
      if (Ce.length) return Ce.pop();
      if (I >= We) return;
      let ae = W ? W.ignoreUnclosed : !1;
      switch (z = R.charCodeAt(I), z) {
        case i:
        case s:
        case d:
        case o:
        case l: {
          C = I;
          do
            C += 1, z = R.charCodeAt(C);
          while (z === s || z === i || z === d || z === o || z === l);
          Y = ["space", R.slice(I, C)], I = C - 1;
          break;
        }
        case h:
        case a:
        case c:
        case m:
        case k:
        case f:
        case u: {
          let ne = String.fromCharCode(z);
          Y = [ne, ne, I];
          break;
        }
        case p: {
          if (ye = Le.length ? Le.pop()[1] : "", se = R.charCodeAt(I + 1), ye === "url" && se !== e && se !== t && se !== s && se !== i && se !== d && se !== l && se !== o) {
            C = I;
            do {
              if (te = !1, C = R.indexOf(")", C + 1), C === -1)
                if (B || ae) {
                  C = I;
                  break;
                } else
                  me("bracket");
              for (he = C; R.charCodeAt(he - 1) === r; )
                he -= 1, te = !te;
            } while (te);
            Y = ["brackets", R.slice(I, C + 1), I, C], I = C;
          } else
            C = R.indexOf(")", I + 1), xe = R.slice(I, C + 1), C === -1 || y.test(xe) ? Y = ["(", "(", I] : (Y = ["brackets", xe, I, C], I = C);
          break;
        }
        case e:
        case t: {
          ke = z === e ? "'" : '"', C = I;
          do {
            if (te = !1, C = R.indexOf(ke, C + 1), C === -1)
              if (B || ae) {
                C = I + 1;
                break;
              } else
                me("string");
            for (he = C; R.charCodeAt(he - 1) === r; )
              he -= 1, te = !te;
          } while (te);
          Y = ["string", R.slice(I, C + 1), I, C], I = C;
          break;
        }
        case b: {
          w.lastIndex = I + 1, w.test(R), w.lastIndex === 0 ? C = R.length - 1 : C = w.lastIndex - 2, Y = ["at-word", R.slice(I, C + 1), I, C], I = C;
          break;
        }
        case r: {
          for (C = I, re = !0; R.charCodeAt(C + 1) === r; )
            C += 1, re = !re;
          if (z = R.charCodeAt(C + 1), re && z !== n && z !== s && z !== i && z !== d && z !== o && z !== l && (C += 1, v.test(R.charAt(C)))) {
            for (; v.test(R.charAt(C + 1)); )
              C += 1;
            R.charCodeAt(C + 1) === s && (C += 1);
          }
          Y = ["word", R.slice(I, C + 1), I, C], I = C;
          break;
        }
        default: {
          z === n && R.charCodeAt(I + 1) === g ? (C = R.indexOf("*/", I + 2) + 1, C === 0 && (B || ae ? C = R.length : me("comment")), Y = ["comment", R.slice(I, C + 1), I, C], I = C) : (S.lastIndex = I + 1, S.test(R), S.lastIndex === 0 ? C = R.length - 1 : C = S.lastIndex - 2, Y = ["word", R.slice(I, C + 1), I, C], Le.push(Y), I = C);
          break;
        }
      }
      return I++, Y;
    }
    function Qe(W) {
      Ce.push(W);
    }
    return {
      back: Qe,
      endOfFile: be,
      nextToken: Ze,
      position: Ue
    };
  }, mn;
}
var gn, Rs;
function xi() {
  if (Rs) return gn;
  Rs = 1;
  let e = Mt();
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
  return gn = t, t.default = t, e.registerAtRule(t), gn;
}
var yn, Os;
function tr() {
  if (Os) return yn;
  Os = 1;
  let e = Mt(), t, r;
  class n extends e {
    constructor(s) {
      super(s), this.type = "root", this.nodes || (this.nodes = []);
    }
    normalize(s, l, d) {
      let o = super.normalize(s);
      if (l) {
        if (d === "prepend")
          this.nodes.length > 1 ? l.raws.before = this.nodes[1].raws.before : delete l.raws.before;
        else if (this.first !== l)
          for (let h of o)
            h.raws.before = l.raws.before;
      }
      return o;
    }
    removeChild(s, l) {
      let d = this.index(s);
      return !l && d === 0 && this.nodes.length > 1 && (this.nodes[1].raws.before = this.nodes[d].raws.before), super.removeChild(s);
    }
    toResult(s = {}) {
      return new t(new r(), this, s).stringify();
    }
  }
  return n.registerLazyResult = (i) => {
    t = i;
  }, n.registerProcessor = (i) => {
    r = i;
  }, yn = n, n.default = n, e.registerRoot(n), yn;
}
var bn, Is;
function ua() {
  if (Is) return bn;
  Is = 1;
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
      let i = [], s = "", l = !1, d = 0, o = !1, h = "", a = !1;
      for (let p of t)
        a ? a = !1 : p === "\\" ? a = !0 : o ? p === h && (o = !1) : p === '"' || p === "'" ? (o = !0, h = p) : p === "(" ? d += 1 : p === ")" ? d > 0 && (d -= 1) : d === 0 && r.includes(p) && (l = !0), l ? (s !== "" && i.push(s.trim()), s = "", l = !1) : s += p;
      return (n || s !== "") && i.push(s.trim()), i;
    }
  };
  return bn = e, e.default = e, bn;
}
var vn, Ls;
function Si() {
  if (Ls) return vn;
  Ls = 1;
  let e = Mt(), t = ua();
  class r extends e {
    constructor(i) {
      super(i), this.type = "rule", this.nodes || (this.nodes = []);
    }
    get selectors() {
      return t.comma(this.selector);
    }
    set selectors(i) {
      let s = this.selector ? this.selector.match(/,\s*/) : null, l = s ? s[0] : "," + this.raw("between", "beforeOpen");
      this.selector = i.join(l);
    }
  }
  return vn = r, r.default = r, e.registerRule(r), vn;
}
var wn, As;
function Ju() {
  if (As) return wn;
  As = 1;
  let e = zr(), t = Ku(), r = Ur(), n = xi(), i = tr(), s = Si();
  const l = {
    empty: !0,
    space: !0
  };
  function d(h) {
    for (let a = h.length - 1; a >= 0; a--) {
      let p = h[a], u = p[3] || p[2];
      if (u) return u;
    }
  }
  class o {
    constructor(a) {
      this.input = a, this.root = new i(), this.current = this.root, this.spaces = "", this.semicolon = !1, this.createTokenizer(), this.root.source = { input: a, start: { column: 1, line: 1, offset: 0 } };
    }
    atrule(a) {
      let p = new n();
      p.name = a[1].slice(1), p.name === "" && this.unnamedAtrule(p, a), this.init(p, a[2]);
      let u, c, m, f = !1, g = !1, k = [], b = [];
      for (; !this.tokenizer.endOfFile(); ) {
        if (a = this.tokenizer.nextToken(), u = a[0], u === "(" || u === "[" ? b.push(u === "(" ? ")" : "]") : u === "{" && b.length > 0 ? b.push("}") : u === b[b.length - 1] && b.pop(), b.length === 0)
          if (u === ";") {
            p.source.end = this.getPosition(a[2]), p.source.end.offset++, this.semicolon = !0;
            break;
          } else if (u === "{") {
            g = !0;
            break;
          } else if (u === "}") {
            if (k.length > 0) {
              for (m = k.length - 1, c = k[m]; c && c[0] === "space"; )
                c = k[--m];
              c && (p.source.end = this.getPosition(c[3] || c[2]), p.source.end.offset++);
            }
            this.end(a);
            break;
          } else
            k.push(a);
        else
          k.push(a);
        if (this.tokenizer.endOfFile()) {
          f = !0;
          break;
        }
      }
      p.raws.between = this.spacesAndCommentsFromEnd(k), k.length ? (p.raws.afterName = this.spacesAndCommentsFromStart(k), this.raw(p, "params", k), f && (a = k[k.length - 1], p.source.end = this.getPosition(a[3] || a[2]), p.source.end.offset++, this.spaces = p.raws.between, p.raws.between = "")) : (p.raws.afterName = "", p.params = ""), g && (p.nodes = [], this.current = p);
    }
    checkMissedSemicolon(a) {
      let p = this.colon(a);
      if (p === !1) return;
      let u = 0, c;
      for (let m = p - 1; m >= 0 && (c = a[m], !(c[0] !== "space" && (u += 1, u === 2))); m--)
        ;
      throw this.input.error(
        "Missed semicolon",
        c[0] === "word" ? c[3] + 1 : c[2]
      );
    }
    colon(a) {
      let p = 0, u, c, m;
      for (let [f, g] of a.entries()) {
        if (u = g, c = u[0], c === "(" && (p += 1), c === ")" && (p -= 1), p === 0 && c === ":")
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
    comment(a) {
      let p = new r();
      this.init(p, a[2]), p.source.end = this.getPosition(a[3] || a[2]), p.source.end.offset++;
      let u = a[1].slice(2, -2);
      if (/^\s*$/.test(u))
        p.text = "", p.raws.left = u, p.raws.right = "";
      else {
        let c = u.match(/^(\s*)([^]*\S)(\s*)$/);
        p.text = c[2], p.raws.left = c[1], p.raws.right = c[3];
      }
    }
    createTokenizer() {
      this.tokenizer = t(this.input);
    }
    decl(a, p) {
      let u = new e();
      this.init(u, a[0][2]);
      let c = a[a.length - 1];
      for (c[0] === ";" && (this.semicolon = !0, a.pop()), u.source.end = this.getPosition(
        c[3] || c[2] || d(a)
      ), u.source.end.offset++; a[0][0] !== "word"; )
        a.length === 1 && this.unknownWord(a), u.raws.before += a.shift()[1];
      for (u.source.start = this.getPosition(a[0][2]), u.prop = ""; a.length; ) {
        let b = a[0][0];
        if (b === ":" || b === "space" || b === "comment")
          break;
        u.prop += a.shift()[1];
      }
      u.raws.between = "";
      let m;
      for (; a.length; )
        if (m = a.shift(), m[0] === ":") {
          u.raws.between += m[1];
          break;
        } else
          m[0] === "word" && /\w/.test(m[1]) && this.unknownWord([m]), u.raws.between += m[1];
      (u.prop[0] === "_" || u.prop[0] === "*") && (u.raws.before += u.prop[0], u.prop = u.prop.slice(1));
      let f = [], g;
      for (; a.length && (g = a[0][0], !(g !== "space" && g !== "comment")); )
        f.push(a.shift());
      this.precheckMissedSemicolon(a);
      for (let b = a.length - 1; b >= 0; b--) {
        if (m = a[b], m[1].toLowerCase() === "!important") {
          u.important = !0;
          let w = this.stringFrom(a, b);
          w = this.spacesFromEnd(a) + w, w !== " !important" && (u.raws.important = w);
          break;
        } else if (m[1].toLowerCase() === "important") {
          let w = a.slice(0), S = "";
          for (let y = b; y > 0; y--) {
            let v = w[y][0];
            if (S.trim().indexOf("!") === 0 && v !== "space")
              break;
            S = w.pop()[1] + S;
          }
          S.trim().indexOf("!") === 0 && (u.important = !0, u.raws.important = S, a = w);
        }
        if (m[0] !== "space" && m[0] !== "comment")
          break;
      }
      a.some((b) => b[0] !== "space" && b[0] !== "comment") && (u.raws.between += f.map((b) => b[1]).join(""), f = []), this.raw(u, "value", f.concat(a), p), u.value.includes(":") && !p && this.checkMissedSemicolon(a);
    }
    doubleColon(a) {
      throw this.input.error(
        "Double colon",
        { offset: a[2] },
        { offset: a[2] + a[1].length }
      );
    }
    emptyRule(a) {
      let p = new s();
      this.init(p, a[2]), p.selector = "", p.raws.between = "", this.current = p;
    }
    end(a) {
      this.current.nodes && this.current.nodes.length && (this.current.raws.semicolon = this.semicolon), this.semicolon = !1, this.current.raws.after = (this.current.raws.after || "") + this.spaces, this.spaces = "", this.current.parent ? (this.current.source.end = this.getPosition(a[2]), this.current.source.end.offset++, this.current = this.current.parent) : this.unexpectedClose(a);
    }
    endFile() {
      this.current.parent && this.unclosedBlock(), this.current.nodes && this.current.nodes.length && (this.current.raws.semicolon = this.semicolon), this.current.raws.after = (this.current.raws.after || "") + this.spaces, this.root.source.end = this.getPosition(this.tokenizer.position());
    }
    freeSemicolon(a) {
      if (this.spaces += a[1], this.current.nodes) {
        let p = this.current.nodes[this.current.nodes.length - 1];
        p && p.type === "rule" && !p.raws.ownSemicolon && (p.raws.ownSemicolon = this.spaces, this.spaces = "");
      }
    }
    // Helpers
    getPosition(a) {
      let p = this.input.fromOffset(a);
      return {
        column: p.col,
        line: p.line,
        offset: a
      };
    }
    init(a, p) {
      this.current.push(a), a.source = {
        input: this.input,
        start: this.getPosition(p)
      }, a.raws.before = this.spaces, this.spaces = "", a.type !== "comment" && (this.semicolon = !1);
    }
    other(a) {
      let p = !1, u = null, c = !1, m = null, f = [], g = a[1].startsWith("--"), k = [], b = a;
      for (; b; ) {
        if (u = b[0], k.push(b), u === "(" || u === "[")
          m || (m = b), f.push(u === "(" ? ")" : "]");
        else if (g && c && u === "{")
          m || (m = b), f.push("}");
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
            this.tokenizer.back(k.pop()), p = !0;
            break;
          } else u === ":" && (c = !0);
        else u === f[f.length - 1] && (f.pop(), f.length === 0 && (m = null));
        b = this.tokenizer.nextToken();
      }
      if (this.tokenizer.endOfFile() && (p = !0), f.length > 0 && this.unclosedBracket(m), p && c) {
        if (!g)
          for (; k.length && (b = k[k.length - 1][0], !(b !== "space" && b !== "comment")); )
            this.tokenizer.back(k.pop());
        this.decl(k, g);
      } else
        this.unknownWord(k);
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
    raw(a, p, u, c) {
      let m, f, g = u.length, k = "", b = !0, w, S;
      for (let y = 0; y < g; y += 1)
        m = u[y], f = m[0], f === "space" && y === g - 1 && !c ? b = !1 : f === "comment" ? (S = u[y - 1] ? u[y - 1][0] : "empty", w = u[y + 1] ? u[y + 1][0] : "empty", !l[S] && !l[w] ? k.slice(-1) === "," ? b = !1 : k += m[1] : b = !1) : k += m[1];
      if (!b) {
        let y = u.reduce((v, x) => v + x[1], "");
        a.raws[p] = { raw: y, value: k };
      }
      a[p] = k;
    }
    rule(a) {
      a.pop();
      let p = new s();
      this.init(p, a[0][2]), p.raws.between = this.spacesAndCommentsFromEnd(a), this.raw(p, "selector", a), this.current = p;
    }
    spacesAndCommentsFromEnd(a) {
      let p, u = "";
      for (; a.length && (p = a[a.length - 1][0], !(p !== "space" && p !== "comment")); )
        u = a.pop()[1] + u;
      return u;
    }
    // Errors
    spacesAndCommentsFromStart(a) {
      let p, u = "";
      for (; a.length && (p = a[0][0], !(p !== "space" && p !== "comment")); )
        u += a.shift()[1];
      return u;
    }
    spacesFromEnd(a) {
      let p, u = "";
      for (; a.length && (p = a[a.length - 1][0], p === "space"); )
        u = a.pop()[1] + u;
      return u;
    }
    stringFrom(a, p) {
      let u = "";
      for (let c = p; c < a.length; c++)
        u += a[c][1];
      return a.splice(p, a.length - p), u;
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
    unnamedAtrule(a, p) {
      throw this.input.error(
        "At-rule without name",
        { offset: p[2] },
        { offset: p[2] + p[1].length }
      );
    }
  }
  return wn = o, wn;
}
var kn, Ts;
function Ci() {
  if (Ts) return kn;
  Ts = 1;
  let e = Mt(), t = Ju(), r = Fr();
  function n(i, s) {
    let l = new r(i, s), d = new t(l);
    try {
      d.parse();
    } catch (o) {
      throw process.env.NODE_ENV !== "production" && o.name === "CssSyntaxError" && s && s.from && (/\.scss$/i.test(s.from) ? o.message += `
You tried to parse SCSS with the standard CSS parser; try again with the postcss-scss parser` : /\.sass/i.test(s.from) ? o.message += `
You tried to parse Sass with the standard CSS parser; try again with the postcss-sass parser` : /\.less$/i.test(s.from) && (o.message += `
You tried to parse Less with the standard CSS parser; try again with the postcss-less parser`)), o;
    }
    return d.root;
  }
  return kn = n, n.default = n, e.registerParse(n), kn;
}
var xn, Ns;
function da() {
  if (Ns) return xn;
  Ns = 1;
  let { isClean: e, my: t } = vi(), r = aa(), n = $r(), i = Mt(), s = wi(), l = la(), d = ki(), o = Ci(), h = tr();
  const a = {
    atrule: "AtRule",
    comment: "Comment",
    decl: "Declaration",
    document: "Document",
    root: "Root",
    rule: "Rule"
  }, p = {
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
  function m(S) {
    return typeof S == "object" && typeof S.then == "function";
  }
  function f(S) {
    let y = !1, v = a[S.type];
    return S.type === "decl" ? y = S.prop.toLowerCase() : S.type === "atrule" && (y = S.name.toLowerCase()), y && S.append ? [
      v,
      v + "-" + y,
      c,
      v + "Exit",
      v + "Exit-" + y
    ] : y ? [v, v + "-" + y, v + "Exit", v + "Exit-" + y] : S.append ? [v, c, v + "Exit"] : [v, v + "Exit"];
  }
  function g(S) {
    let y;
    return S.type === "document" ? y = ["Document", c, "DocumentExit"] : S.type === "root" ? y = ["Root", c, "RootExit"] : y = f(S), {
      eventIndex: 0,
      events: y,
      iterator: 0,
      node: S,
      visitorIndex: 0,
      visitors: []
    };
  }
  function k(S) {
    return S[e] = !1, S.nodes && S.nodes.forEach((y) => k(y)), S;
  }
  let b = {};
  class w {
    constructor(y, v, x) {
      this.stringified = !1, this.processed = !1;
      let M;
      if (typeof v == "object" && v !== null && (v.type === "root" || v.type === "document"))
        M = k(v);
      else if (v instanceof w || v instanceof d)
        M = k(v.root), v.map && (typeof x.map > "u" && (x.map = {}), x.map.inline || (x.map.inline = !1), x.map.prev = v.map);
      else {
        let L = o;
        x.syntax && (L = x.syntax.parse), x.parser && (L = x.parser), L.parse && (L = L.parse);
        try {
          M = L(v, x);
        } catch (R) {
          this.processed = !0, this.error = R;
        }
        M && !M[t] && i.rebuild(M);
      }
      this.result = new d(y, M, x), this.helpers = { ...b, postcss: b, result: this.result }, this.plugins = this.processor.plugins.map((L) => typeof L == "object" && L.prepare ? { ...L, ...L.prepare(this.result) } : L);
    }
    async() {
      return this.error ? Promise.reject(this.error) : this.processed ? Promise.resolve(this.result) : (this.processing || (this.processing = this.runAsync()), this.processing);
    }
    catch(y) {
      return this.async().catch(y);
    }
    finally(y) {
      return this.async().then(y, y);
    }
    getAsyncError() {
      throw new Error("Use process(css).then(cb) to work with async plugins");
    }
    handleError(y, v) {
      let x = this.result.lastPlugin;
      try {
        if (v && v.addToError(y), this.error = y, y.name === "CssSyntaxError" && !y.plugin)
          y.plugin = x.postcssPlugin, y.setMessage();
        else if (x.postcssVersion && process.env.NODE_ENV !== "production") {
          let M = x.postcssPlugin, L = x.postcssVersion, R = this.result.processor.version, B = L.split("."), z = R.split(".");
          (B[0] !== z[0] || parseInt(B[1]) > parseInt(z[1])) && console.error(
            "Unknown error from PostCSS plugin. Your current PostCSS version is " + R + ", but " + M + " uses " + L + ". Perhaps this is the source of the error below."
          );
        }
      } catch (M) {
        console && console.error && console.error(M);
      }
      return y;
    }
    prepareVisitors() {
      this.listeners = {};
      let y = (v, x, M) => {
        this.listeners[x] || (this.listeners[x] = []), this.listeners[x].push([v, M]);
      };
      for (let v of this.plugins)
        if (typeof v == "object")
          for (let x in v) {
            if (!p[x] && /^[A-Z]/.test(x))
              throw new Error(
                `Unknown event ${x} in ${v.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`
              );
            if (!u[x])
              if (typeof v[x] == "object")
                for (let M in v[x])
                  M === "*" ? y(v, x, v[x][M]) : y(
                    v,
                    x + "-" + M.toLowerCase(),
                    v[x][M]
                  );
              else typeof v[x] == "function" && y(v, x, v[x]);
          }
      this.hasListener = Object.keys(this.listeners).length > 0;
    }
    async runAsync() {
      this.plugin = 0;
      for (let y = 0; y < this.plugins.length; y++) {
        let v = this.plugins[y], x = this.runOnRoot(v);
        if (m(x))
          try {
            await x;
          } catch (M) {
            throw this.handleError(M);
          }
      }
      if (this.prepareVisitors(), this.hasListener) {
        let y = this.result.root;
        for (; !y[e]; ) {
          y[e] = !0;
          let v = [g(y)];
          for (; v.length > 0; ) {
            let x = this.visitTick(v);
            if (m(x))
              try {
                await x;
              } catch (M) {
                let L = v[v.length - 1].node;
                throw this.handleError(M, L);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [v, x] of this.listeners.OnceExit) {
            this.result.lastPlugin = v;
            try {
              if (y.type === "document") {
                let M = y.nodes.map(
                  (L) => x(L, this.helpers)
                );
                await Promise.all(M);
              } else
                await x(y, this.helpers);
            } catch (M) {
              throw this.handleError(M);
            }
          }
      }
      return this.processed = !0, this.stringify();
    }
    runOnRoot(y) {
      this.result.lastPlugin = y;
      try {
        if (typeof y == "object" && y.Once) {
          if (this.result.root.type === "document") {
            let v = this.result.root.nodes.map(
              (x) => y.Once(x, this.helpers)
            );
            return m(v[0]) ? Promise.all(v) : v;
          }
          return y.Once(this.result.root, this.helpers);
        } else if (typeof y == "function")
          return y(this.result.root, this.result);
      } catch (v) {
        throw this.handleError(v);
      }
    }
    stringify() {
      if (this.error) throw this.error;
      if (this.stringified) return this.result;
      this.stringified = !0, this.sync();
      let y = this.result.opts, v = n;
      y.syntax && (v = y.syntax.stringify), y.stringifier && (v = y.stringifier), v.stringify && (v = v.stringify);
      let M = new r(v, this.result.root, this.result.opts).generate();
      return this.result.css = M[0], this.result.map = M[1], this.result;
    }
    sync() {
      if (this.error) throw this.error;
      if (this.processed) return this.result;
      if (this.processed = !0, this.processing)
        throw this.getAsyncError();
      for (let y of this.plugins) {
        let v = this.runOnRoot(y);
        if (m(v))
          throw this.getAsyncError();
      }
      if (this.prepareVisitors(), this.hasListener) {
        let y = this.result.root;
        for (; !y[e]; )
          y[e] = !0, this.walkSync(y);
        if (this.listeners.OnceExit)
          if (y.type === "document")
            for (let v of y.nodes)
              this.visitSync(this.listeners.OnceExit, v);
          else
            this.visitSync(this.listeners.OnceExit, y);
      }
      return this.result;
    }
    then(y, v) {
      return process.env.NODE_ENV !== "production" && ("from" in this.opts || l(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(y, v);
    }
    toString() {
      return this.css;
    }
    visitSync(y, v) {
      for (let [x, M] of y) {
        this.result.lastPlugin = x;
        let L;
        try {
          L = M(v, this.helpers);
        } catch (R) {
          throw this.handleError(R, v.proxyOf);
        }
        if (v.type !== "root" && v.type !== "document" && !v.parent)
          return !0;
        if (m(L))
          throw this.getAsyncError();
      }
    }
    visitTick(y) {
      let v = y[y.length - 1], { node: x, visitors: M } = v;
      if (x.type !== "root" && x.type !== "document" && !x.parent) {
        y.pop();
        return;
      }
      if (M.length > 0 && v.visitorIndex < M.length) {
        let [R, B] = M[v.visitorIndex];
        v.visitorIndex += 1, v.visitorIndex === M.length && (v.visitors = [], v.visitorIndex = 0), this.result.lastPlugin = R;
        try {
          return B(x.toProxy(), this.helpers);
        } catch (z) {
          throw this.handleError(z, x);
        }
      }
      if (v.iterator !== 0) {
        let R = v.iterator, B;
        for (; B = x.nodes[x.indexes[R]]; )
          if (x.indexes[R] += 1, !B[e]) {
            B[e] = !0, y.push(g(B));
            return;
          }
        v.iterator = 0, delete x.indexes[R];
      }
      let L = v.events;
      for (; v.eventIndex < L.length; ) {
        let R = L[v.eventIndex];
        if (v.eventIndex += 1, R === c) {
          x.nodes && x.nodes.length && (x[e] = !0, v.iterator = x.getIterator());
          return;
        } else if (this.listeners[R]) {
          v.visitors = this.listeners[R];
          return;
        }
      }
      y.pop();
    }
    walkSync(y) {
      y[e] = !0;
      let v = f(y);
      for (let x of v)
        if (x === c)
          y.nodes && y.each((M) => {
            M[e] || this.walkSync(M);
          });
        else {
          let M = this.listeners[x];
          if (M && this.visitSync(M, y.toProxy()))
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
  return w.registerPostcss = (S) => {
    b = S;
  }, xn = w, w.default = w, h.registerLazyResult(w), s.registerLazyResult(w), xn;
}
var Sn, Ps;
function Zu() {
  if (Ps) return Sn;
  Ps = 1;
  let e = aa(), t = $r(), r = la(), n = Ci();
  const i = ki();
  class s {
    constructor(d, o, h) {
      o = o.toString(), this.stringified = !1, this._processor = d, this._css = o, this._opts = h, this._map = void 0;
      let a, p = t;
      this.result = new i(this._processor, a, this._opts), this.result.css = o;
      let u = this;
      Object.defineProperty(this.result, "root", {
        get() {
          return u.root;
        }
      });
      let c = new e(p, a, this._opts, o);
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
    then(d, o) {
      return process.env.NODE_ENV !== "production" && ("from" in this._opts || r(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(d, o);
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
      let d, o = n;
      try {
        d = o(this._css, this._opts);
      } catch (h) {
        this.error = h;
      }
      if (this.error)
        throw this.error;
      return this._root = d, d;
    }
    get [Symbol.toStringTag]() {
      return "NoWorkResult";
    }
  }
  return Sn = s, s.default = s, Sn;
}
var Cn, _s;
function Qu() {
  if (_s) return Cn;
  _s = 1;
  let e = Zu(), t = da(), r = wi(), n = tr();
  class i {
    constructor(l = []) {
      this.version = "8.4.38", this.plugins = this.normalize(l);
    }
    normalize(l) {
      let d = [];
      for (let o of l)
        if (o.postcss === !0 ? o = o() : o.postcss && (o = o.postcss), typeof o == "object" && Array.isArray(o.plugins))
          d = d.concat(o.plugins);
        else if (typeof o == "object" && o.postcssPlugin)
          d.push(o);
        else if (typeof o == "function")
          d.push(o);
        else if (typeof o == "object" && (o.parse || o.stringify)) {
          if (process.env.NODE_ENV !== "production")
            throw new Error(
              "PostCSS syntaxes cannot be used as plugins. Instead, please use one of the syntax/parser/stringifier options as outlined in your PostCSS runner documentation."
            );
        } else
          throw new Error(o + " is not a PostCSS plugin");
      return d;
    }
    process(l, d = {}) {
      return !this.plugins.length && !d.parser && !d.stringifier && !d.syntax ? new e(this, l, d) : new t(this, l, d);
    }
    use(l) {
      return this.plugins = this.plugins.concat(this.normalize([l])), this;
    }
  }
  return Cn = i, i.default = i, n.registerProcessor(i), r.registerProcessor(i), Cn;
}
var En, $s;
function ed() {
  if ($s) return En;
  $s = 1;
  let e = zr(), t = oa(), r = Ur(), n = xi(), i = Fr(), s = tr(), l = Si();
  function d(o, h) {
    if (Array.isArray(o)) return o.map((u) => d(u));
    let { inputs: a, ...p } = o;
    if (a) {
      h = [];
      for (let u of a) {
        let c = { ...u, __proto__: i.prototype };
        c.map && (c.map = {
          ...c.map,
          __proto__: t.prototype
        }), h.push(c);
      }
    }
    if (p.nodes && (p.nodes = o.nodes.map((u) => d(u, h))), p.source) {
      let { inputId: u, ...c } = p.source;
      p.source = c, u != null && (p.source.input = h[u]);
    }
    if (p.type === "root")
      return new s(p);
    if (p.type === "decl")
      return new e(p);
    if (p.type === "rule")
      return new l(p);
    if (p.type === "comment")
      return new r(p);
    if (p.type === "atrule")
      return new n(p);
    throw new Error("Unknown node type: " + o.type);
  }
  return En = d, d.default = d, En;
}
var Mn, Ds;
function td() {
  if (Ds) return Mn;
  Ds = 1;
  let e = bi(), t = zr(), r = da(), n = Mt(), i = Qu(), s = $r(), l = ed(), d = wi(), o = ca(), h = Ur(), a = xi(), p = ki(), u = Fr(), c = Ci(), m = ua(), f = Si(), g = tr(), k = Dr();
  function b(...w) {
    return w.length === 1 && Array.isArray(w[0]) && (w = w[0]), new i(w);
  }
  return b.plugin = function(S, y) {
    let v = !1;
    function x(...L) {
      console && console.warn && !v && (v = !0, console.warn(
        S + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`
      ), process.env.LANG && process.env.LANG.startsWith("cn") && console.warn(
        S + `: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`
      ));
      let R = y(...L);
      return R.postcssPlugin = S, R.postcssVersion = new i().version, R;
    }
    let M;
    return Object.defineProperty(x, "postcss", {
      get() {
        return M || (M = x()), M;
      }
    }), x.process = function(L, R, B) {
      return b([x(B)]).process(L, R);
    }, x;
  }, b.stringify = s, b.parse = c, b.fromJSON = l, b.list = m, b.comment = (w) => new h(w), b.atRule = (w) => new a(w), b.decl = (w) => new t(w), b.rule = (w) => new f(w), b.root = (w) => new g(w), b.document = (w) => new d(w), b.CssSyntaxError = e, b.Declaration = t, b.Container = n, b.Processor = i, b.Document = d, b.Comment = h, b.Warning = o, b.AtRule = a, b.Result = p, b.Input = u, b.Rule = f, b.Root = g, b.Node = k, r.registerPostcss(b), Mn = b, b.default = b, Mn;
}
var rd = td();
const pe = /* @__PURE__ */ ju(rd);
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
var nd = Object.defineProperty, id = (e, t, r) => t in e ? nd(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, Be = (e, t, r) => id(e, typeof t != "symbol" ? t + "" : t, r);
Date.now().toString();
function sd(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function od(e) {
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
var fr = { exports: {} }, zs;
function ad() {
  if (zs) return fr.exports;
  zs = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return fr.exports = t(), fr.exports.createColors = t, fr.exports;
}
const ld = {}, cd = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ld
}, Symbol.toStringTag, { value: "Module" })), Je = /* @__PURE__ */ od(cd);
var Rn, Fs;
function Ei() {
  if (Fs) return Rn;
  Fs = 1;
  let e = /* @__PURE__ */ ad(), t = Je;
  class r extends Error {
    constructor(i, s, l, d, o, h) {
      super(i), this.name = "CssSyntaxError", this.reason = i, o && (this.file = o), d && (this.source = d), h && (this.plugin = h), typeof s < "u" && typeof l < "u" && (typeof s == "number" ? (this.line = s, this.column = l) : (this.line = s.line, this.column = s.column, this.endLine = l.line, this.endColumn = l.column)), this.setMessage(), Error.captureStackTrace && Error.captureStackTrace(this, r);
    }
    setMessage() {
      this.message = this.plugin ? this.plugin + ": " : "", this.message += this.file ? this.file : "<css input>", typeof this.line < "u" && (this.message += ":" + this.line + ":" + this.column), this.message += ": " + this.reason;
    }
    showSourceCode(i) {
      if (!this.source) return "";
      let s = this.source;
      i == null && (i = e.isColorSupported), t && i && (s = t(s));
      let l = s.split(/\r?\n/), d = Math.max(this.line - 3, 0), o = Math.min(this.line + 2, l.length), h = String(o).length, a, p;
      if (i) {
        let { bold: u, gray: c, red: m } = e.createColors(!0);
        a = (f) => u(m(f)), p = (f) => c(f);
      } else
        a = p = (u) => u;
      return l.slice(d, o).map((u, c) => {
        let m = d + 1 + c, f = " " + (" " + m).slice(-h) + " | ";
        if (m === this.line) {
          let g = p(f.replace(/\d/g, " ")) + u.slice(0, this.column - 1).replace(/[^\t]/g, " ");
          return a(">") + p(f) + u + `
 ` + g + a("^");
        }
        return " " + p(f) + u;
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
  return Rn = r, r.default = r, Rn;
}
var mr = {}, Us;
function Mi() {
  return Us || (Us = 1, mr.isClean = Symbol("isClean"), mr.my = Symbol("my")), mr;
}
var On, Bs;
function ha() {
  if (Bs) return On;
  Bs = 1;
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
      let l = "@" + i.name, d = i.params ? this.rawValue(i, "params") : "";
      if (typeof i.raws.afterName < "u" ? l += i.raws.afterName : d && (l += " "), i.nodes)
        this.block(i, l + d);
      else {
        let o = (i.raws.between || "") + (s ? ";" : "");
        this.builder(l + d + o, i);
      }
    }
    beforeAfter(i, s) {
      let l;
      i.type === "decl" ? l = this.raw(i, null, "beforeDecl") : i.type === "comment" ? l = this.raw(i, null, "beforeComment") : s === "before" ? l = this.raw(i, null, "beforeRule") : l = this.raw(i, null, "beforeClose");
      let d = i.parent, o = 0;
      for (; d && d.type !== "root"; )
        o += 1, d = d.parent;
      if (l.includes(`
`)) {
        let h = this.raw(i, null, "indent");
        if (h.length)
          for (let a = 0; a < o; a++) l += h;
      }
      return l;
    }
    block(i, s) {
      let l = this.raw(i, "between", "beforeOpen");
      this.builder(s + l + "{", i, "start");
      let d;
      i.nodes && i.nodes.length ? (this.body(i), d = this.raw(i, "after")) : d = this.raw(i, "after", "emptyBody"), d && this.builder(d), this.builder("}", i, "end");
    }
    body(i) {
      let s = i.nodes.length - 1;
      for (; s > 0 && i.nodes[s].type === "comment"; )
        s -= 1;
      let l = this.raw(i, "semicolon");
      for (let d = 0; d < i.nodes.length; d++) {
        let o = i.nodes[d], h = this.raw(o, "before");
        h && this.builder(h), this.stringify(o, s !== d || l);
      }
    }
    comment(i) {
      let s = this.raw(i, "left", "commentLeft"), l = this.raw(i, "right", "commentRight");
      this.builder("/*" + s + i.text + l + "*/", i);
    }
    decl(i, s) {
      let l = this.raw(i, "between", "colon"), d = i.prop + l + this.rawValue(i, "value");
      i.important && (d += i.raws.important || " !important"), s && (d += ";"), this.builder(d, i);
    }
    document(i) {
      this.body(i);
    }
    raw(i, s, l) {
      let d;
      if (l || (l = s), s && (d = i.raws[s], typeof d < "u"))
        return d;
      let o = i.parent;
      if (l === "before" && (!o || o.type === "root" && o.first === i || o && o.type === "document"))
        return "";
      if (!o) return e[l];
      let h = i.root();
      if (h.rawCache || (h.rawCache = {}), typeof h.rawCache[l] < "u")
        return h.rawCache[l];
      if (l === "before" || l === "after")
        return this.beforeAfter(i, l);
      {
        let a = "raw" + t(l);
        this[a] ? d = this[a](h, i) : h.walk((p) => {
          if (d = p.raws[s], typeof d < "u") return !1;
        });
      }
      return typeof d > "u" && (d = e[l]), h.rawCache[l] = d, d;
    }
    rawBeforeClose(i) {
      let s;
      return i.walk((l) => {
        if (l.nodes && l.nodes.length > 0 && typeof l.raws.after < "u")
          return s = l.raws.after, s.includes(`
`) && (s = s.replace(/[^\n]+$/, "")), !1;
      }), s && (s = s.replace(/\S/g, "")), s;
    }
    rawBeforeComment(i, s) {
      let l;
      return i.walkComments((d) => {
        if (typeof d.raws.before < "u")
          return l = d.raws.before, l.includes(`
`) && (l = l.replace(/[^\n]+$/, "")), !1;
      }), typeof l > "u" ? l = this.raw(s, null, "beforeDecl") : l && (l = l.replace(/\S/g, "")), l;
    }
    rawBeforeDecl(i, s) {
      let l;
      return i.walkDecls((d) => {
        if (typeof d.raws.before < "u")
          return l = d.raws.before, l.includes(`
`) && (l = l.replace(/[^\n]+$/, "")), !1;
      }), typeof l > "u" ? l = this.raw(s, null, "beforeRule") : l && (l = l.replace(/\S/g, "")), l;
    }
    rawBeforeOpen(i) {
      let s;
      return i.walk((l) => {
        if (l.type !== "decl" && (s = l.raws.between, typeof s < "u"))
          return !1;
      }), s;
    }
    rawBeforeRule(i) {
      let s;
      return i.walk((l) => {
        if (l.nodes && (l.parent !== i || i.first !== l) && typeof l.raws.before < "u")
          return s = l.raws.before, s.includes(`
`) && (s = s.replace(/[^\n]+$/, "")), !1;
      }), s && (s = s.replace(/\S/g, "")), s;
    }
    rawColon(i) {
      let s;
      return i.walkDecls((l) => {
        if (typeof l.raws.between < "u")
          return s = l.raws.between.replace(/[^\s:]/g, ""), !1;
      }), s;
    }
    rawEmptyBody(i) {
      let s;
      return i.walk((l) => {
        if (l.nodes && l.nodes.length === 0 && (s = l.raws.after, typeof s < "u"))
          return !1;
      }), s;
    }
    rawIndent(i) {
      if (i.raws.indent) return i.raws.indent;
      let s;
      return i.walk((l) => {
        let d = l.parent;
        if (d && d !== i && d.parent && d.parent === i && typeof l.raws.before < "u") {
          let o = l.raws.before.split(`
`);
          return s = o[o.length - 1], s = s.replace(/\S/g, ""), !1;
        }
      }), s;
    }
    rawSemicolon(i) {
      let s;
      return i.walk((l) => {
        if (l.nodes && l.nodes.length && l.last.type === "decl" && (s = l.raws.semicolon, typeof s < "u"))
          return !1;
      }), s;
    }
    rawValue(i, s) {
      let l = i[s], d = i.raws[s];
      return d && d.value === l ? d.raw : l;
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
  return On = r, r.default = r, On;
}
var In, qs;
function Br() {
  if (qs) return In;
  qs = 1;
  let e = ha();
  function t(r, n) {
    new e(n).stringify(r);
  }
  return In = t, t.default = t, In;
}
var Ln, Ws;
function qr() {
  if (Ws) return Ln;
  Ws = 1;
  let { isClean: e, my: t } = Mi(), r = Ei(), n = ha(), i = Br();
  function s(d, o) {
    let h = new d.constructor();
    for (let a in d) {
      if (!Object.prototype.hasOwnProperty.call(d, a) || a === "proxyCache") continue;
      let p = d[a], u = typeof p;
      a === "parent" && u === "object" ? o && (h[a] = o) : a === "source" ? h[a] = p : Array.isArray(p) ? h[a] = p.map((c) => s(c, h)) : (u === "object" && p !== null && (p = s(p)), h[a] = p);
    }
    return h;
  }
  class l {
    constructor(o = {}) {
      this.raws = {}, this[e] = !1, this[t] = !0;
      for (let h in o)
        if (h === "nodes") {
          this.nodes = [];
          for (let a of o[h])
            typeof a.clone == "function" ? this.append(a.clone()) : this.append(a);
        } else
          this[h] = o[h];
    }
    addToError(o) {
      if (o.postcssNode = this, o.stack && this.source && /\n\s{4}at /.test(o.stack)) {
        let h = this.source;
        o.stack = o.stack.replace(
          /\n\s{4}at /,
          `$&${h.input.from}:${h.start.line}:${h.start.column}$&`
        );
      }
      return o;
    }
    after(o) {
      return this.parent.insertAfter(this, o), this;
    }
    assign(o = {}) {
      for (let h in o)
        this[h] = o[h];
      return this;
    }
    before(o) {
      return this.parent.insertBefore(this, o), this;
    }
    cleanRaws(o) {
      delete this.raws.before, delete this.raws.after, o || delete this.raws.between;
    }
    clone(o = {}) {
      let h = s(this);
      for (let a in o)
        h[a] = o[a];
      return h;
    }
    cloneAfter(o = {}) {
      let h = this.clone(o);
      return this.parent.insertAfter(this, h), h;
    }
    cloneBefore(o = {}) {
      let h = this.clone(o);
      return this.parent.insertBefore(this, h), h;
    }
    error(o, h = {}) {
      if (this.source) {
        let { end: a, start: p } = this.rangeBy(h);
        return this.source.input.error(
          o,
          { column: p.column, line: p.line },
          { column: a.column, line: a.line },
          h
        );
      }
      return new r(o);
    }
    getProxyProcessor() {
      return {
        get(o, h) {
          return h === "proxyOf" ? o : h === "root" ? () => o.root().toProxy() : o[h];
        },
        set(o, h, a) {
          return o[h] === a || (o[h] = a, (h === "prop" || h === "value" || h === "name" || h === "params" || h === "important" || /* c8 ignore next */
          h === "text") && o.markDirty()), !0;
        }
      };
    }
    markDirty() {
      if (this[e]) {
        this[e] = !1;
        let o = this;
        for (; o = o.parent; )
          o[e] = !1;
      }
    }
    next() {
      if (!this.parent) return;
      let o = this.parent.index(this);
      return this.parent.nodes[o + 1];
    }
    positionBy(o, h) {
      let a = this.source.start;
      if (o.index)
        a = this.positionInside(o.index, h);
      else if (o.word) {
        h = this.toString();
        let p = h.indexOf(o.word);
        p !== -1 && (a = this.positionInside(p, h));
      }
      return a;
    }
    positionInside(o, h) {
      let a = h || this.toString(), p = this.source.start.column, u = this.source.start.line;
      for (let c = 0; c < o; c++)
        a[c] === `
` ? (p = 1, u += 1) : p += 1;
      return { column: p, line: u };
    }
    prev() {
      if (!this.parent) return;
      let o = this.parent.index(this);
      return this.parent.nodes[o - 1];
    }
    rangeBy(o) {
      let h = {
        column: this.source.start.column,
        line: this.source.start.line
      }, a = this.source.end ? {
        column: this.source.end.column + 1,
        line: this.source.end.line
      } : {
        column: h.column + 1,
        line: h.line
      };
      if (o.word) {
        let p = this.toString(), u = p.indexOf(o.word);
        u !== -1 && (h = this.positionInside(u, p), a = this.positionInside(u + o.word.length, p));
      } else
        o.start ? h = {
          column: o.start.column,
          line: o.start.line
        } : o.index && (h = this.positionInside(o.index)), o.end ? a = {
          column: o.end.column,
          line: o.end.line
        } : typeof o.endIndex == "number" ? a = this.positionInside(o.endIndex) : o.index && (a = this.positionInside(o.index + 1));
      return (a.line < h.line || a.line === h.line && a.column <= h.column) && (a = { column: h.column + 1, line: h.line }), { end: a, start: h };
    }
    raw(o, h) {
      return new n().raw(this, o, h);
    }
    remove() {
      return this.parent && this.parent.removeChild(this), this.parent = void 0, this;
    }
    replaceWith(...o) {
      if (this.parent) {
        let h = this, a = !1;
        for (let p of o)
          p === this ? a = !0 : a ? (this.parent.insertAfter(h, p), h = p) : this.parent.insertBefore(h, p);
        a || this.remove();
      }
      return this;
    }
    root() {
      let o = this;
      for (; o.parent && o.parent.type !== "document"; )
        o = o.parent;
      return o;
    }
    toJSON(o, h) {
      let a = {}, p = h == null;
      h = h || /* @__PURE__ */ new Map();
      let u = 0;
      for (let c in this) {
        if (!Object.prototype.hasOwnProperty.call(this, c) || c === "parent" || c === "proxyCache") continue;
        let m = this[c];
        if (Array.isArray(m))
          a[c] = m.map((f) => typeof f == "object" && f.toJSON ? f.toJSON(null, h) : f);
        else if (typeof m == "object" && m.toJSON)
          a[c] = m.toJSON(null, h);
        else if (c === "source") {
          let f = h.get(m.input);
          f == null && (f = u, h.set(m.input, u), u++), a[c] = {
            end: m.end,
            inputId: f,
            start: m.start
          };
        } else
          a[c] = m;
      }
      return p && (a.inputs = [...h.keys()].map((c) => c.toJSON())), a;
    }
    toProxy() {
      return this.proxyCache || (this.proxyCache = new Proxy(this, this.getProxyProcessor())), this.proxyCache;
    }
    toString(o = i) {
      o.stringify && (o = o.stringify);
      let h = "";
      return o(this, (a) => {
        h += a;
      }), h;
    }
    warn(o, h, a) {
      let p = { node: this };
      for (let u in a) p[u] = a[u];
      return o.warn(h, p);
    }
    get proxyOf() {
      return this;
    }
  }
  return Ln = l, l.default = l, Ln;
}
var An, js;
function Wr() {
  if (js) return An;
  js = 1;
  let e = qr();
  class t extends e {
    constructor(n) {
      n && typeof n.value < "u" && typeof n.value != "string" && (n = { ...n, value: String(n.value) }), super(n), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return An = t, t.default = t, An;
}
var Tn, Hs;
function ud() {
  if (Hs) return Tn;
  Hs = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return Tn = { nanoid: (n = 21) => {
    let i = "", s = n;
    for (; s--; )
      i += e[Math.random() * 64 | 0];
    return i;
  }, customAlphabet: (n, i = 21) => (s = i) => {
    let l = "", d = s;
    for (; d--; )
      l += n[Math.random() * n.length | 0];
    return l;
  } }, Tn;
}
var Nn, Vs;
function pa() {
  if (Vs) return Nn;
  Vs = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Je, { existsSync: r, readFileSync: n } = Je, { dirname: i, join: s } = Je;
  function l(o) {
    return Buffer ? Buffer.from(o, "base64").toString() : window.atob(o);
  }
  class d {
    constructor(h, a) {
      if (a.map === !1) return;
      this.loadAnnotation(h), this.inline = this.startWith(this.annotation, "data:");
      let p = a.map ? a.map.prev : void 0, u = this.loadMap(a.from, p);
      !this.mapFile && a.from && (this.mapFile = a.from), this.mapFile && (this.root = i(this.mapFile)), u && (this.text = u);
    }
    consumer() {
      return this.consumerCache || (this.consumerCache = new e(this.text)), this.consumerCache;
    }
    decodeInline(h) {
      let a = /^data:application\/json;charset=utf-?8;base64,/, p = /^data:application\/json;base64,/, u = /^data:application\/json;charset=utf-?8,/, c = /^data:application\/json,/;
      if (u.test(h) || c.test(h))
        return decodeURIComponent(h.substr(RegExp.lastMatch.length));
      if (a.test(h) || p.test(h))
        return l(h.substr(RegExp.lastMatch.length));
      let m = h.match(/data:application\/json;([^,]+),/)[1];
      throw new Error("Unsupported source map encoding " + m);
    }
    getAnnotationURL(h) {
      return h.replace(/^\/\*\s*# sourceMappingURL=/, "").trim();
    }
    isMap(h) {
      return typeof h != "object" ? !1 : typeof h.mappings == "string" || typeof h._mappings == "string" || Array.isArray(h.sections);
    }
    loadAnnotation(h) {
      let a = h.match(/\/\*\s*# sourceMappingURL=/gm);
      if (!a) return;
      let p = h.lastIndexOf(a.pop()), u = h.indexOf("*/", p);
      p > -1 && u > -1 && (this.annotation = this.getAnnotationURL(h.substring(p, u)));
    }
    loadFile(h) {
      if (this.root = i(h), r(h))
        return this.mapFile = h, n(h, "utf-8").toString().trim();
    }
    loadMap(h, a) {
      if (a === !1) return !1;
      if (a) {
        if (typeof a == "string")
          return a;
        if (typeof a == "function") {
          let p = a(h);
          if (p) {
            let u = this.loadFile(p);
            if (!u)
              throw new Error(
                "Unable to load previous source map: " + p.toString()
              );
            return u;
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
          let p = this.annotation;
          return h && (p = s(i(h), p)), this.loadFile(p);
        }
      }
    }
    startWith(h, a) {
      return h ? h.substr(0, a.length) === a : !1;
    }
    withContent() {
      return !!(this.consumer().sourcesContent && this.consumer().sourcesContent.length > 0);
    }
  }
  return Nn = d, d.default = d, Nn;
}
var Pn, Gs;
function jr() {
  if (Gs) return Pn;
  Gs = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Je, { fileURLToPath: r, pathToFileURL: n } = Je, { isAbsolute: i, resolve: s } = Je, { nanoid: l } = /* @__PURE__ */ ud(), d = Je, o = Ei(), h = pa(), a = Symbol("fromOffsetCache"), p = !!(e && t), u = !!(s && i);
  class c {
    constructor(f, g = {}) {
      if (f === null || typeof f > "u" || typeof f == "object" && !f.toString)
        throw new Error(`PostCSS received ${f} instead of CSS string`);
      if (this.css = f.toString(), this.css[0] === "\uFEFF" || this.css[0] === "￾" ? (this.hasBOM = !0, this.css = this.css.slice(1)) : this.hasBOM = !1, g.from && (!u || /^\w+:\/\//.test(g.from) || i(g.from) ? this.file = g.from : this.file = s(g.from)), u && p) {
        let k = new h(this.css, g);
        if (k.text) {
          this.map = k;
          let b = k.consumer().file;
          !this.file && b && (this.file = this.mapResolve(b));
        }
      }
      this.file || (this.id = "<input css " + l(6) + ">"), this.map && (this.map.file = this.from);
    }
    error(f, g, k, b = {}) {
      let w, S, y;
      if (g && typeof g == "object") {
        let x = g, M = k;
        if (typeof x.offset == "number") {
          let L = this.fromOffset(x.offset);
          g = L.line, k = L.col;
        } else
          g = x.line, k = x.column;
        if (typeof M.offset == "number") {
          let L = this.fromOffset(M.offset);
          S = L.line, y = L.col;
        } else
          S = M.line, y = M.column;
      } else if (!k) {
        let x = this.fromOffset(g);
        g = x.line, k = x.col;
      }
      let v = this.origin(g, k, S, y);
      return v ? w = new o(
        f,
        v.endLine === void 0 ? v.line : { column: v.column, line: v.line },
        v.endLine === void 0 ? v.column : { column: v.endColumn, line: v.endLine },
        v.source,
        v.file,
        b.plugin
      ) : w = new o(
        f,
        S === void 0 ? g : { column: k, line: g },
        S === void 0 ? k : { column: y, line: S },
        this.css,
        this.file,
        b.plugin
      ), w.input = { column: k, endColumn: y, endLine: S, line: g, source: this.css }, this.file && (n && (w.input.url = n(this.file).toString()), w.input.file = this.file), w;
    }
    fromOffset(f) {
      let g, k;
      if (this[a])
        k = this[a];
      else {
        let w = this.css.split(`
`);
        k = new Array(w.length);
        let S = 0;
        for (let y = 0, v = w.length; y < v; y++)
          k[y] = S, S += w[y].length + 1;
        this[a] = k;
      }
      g = k[k.length - 1];
      let b = 0;
      if (f >= g)
        b = k.length - 1;
      else {
        let w = k.length - 2, S;
        for (; b < w; )
          if (S = b + (w - b >> 1), f < k[S])
            w = S - 1;
          else if (f >= k[S + 1])
            b = S + 1;
          else {
            b = S;
            break;
          }
      }
      return {
        col: f - k[b] + 1,
        line: b + 1
      };
    }
    mapResolve(f) {
      return /^\w+:\/\//.test(f) ? f : s(this.map.consumer().sourceRoot || this.map.root || ".", f);
    }
    origin(f, g, k, b) {
      if (!this.map) return !1;
      let w = this.map.consumer(), S = w.originalPositionFor({ column: g, line: f });
      if (!S.source) return !1;
      let y;
      typeof k == "number" && (y = w.originalPositionFor({ column: b, line: k }));
      let v;
      i(S.source) ? v = n(S.source) : v = new URL(
        S.source,
        this.map.consumer().sourceRoot || n(this.map.mapFile)
      );
      let x = {
        column: S.column,
        endColumn: y && y.column,
        endLine: y && y.line,
        line: S.line,
        url: v.toString()
      };
      if (v.protocol === "file:")
        if (r)
          x.file = r(v);
        else
          throw new Error("file: protocol is not available in this PostCSS build");
      let M = w.sourceContentFor(S.source);
      return M && (x.source = M), x;
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
  return Pn = c, c.default = c, d && d.registerInput && d.registerInput(c), Pn;
}
var _n, Ys;
function fa() {
  if (Ys) return _n;
  Ys = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Je, { dirname: r, relative: n, resolve: i, sep: s } = Je, { pathToFileURL: l } = Je, d = jr(), o = !!(e && t), h = !!(r && i && n && s);
  class a {
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
      if (this.clearAnnotation(), h && o && this.isMap())
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
      this.stringify(this.root, (b, w, S) => {
        if (this.css += b, w && S !== "end" && (f.generated.line = u, f.generated.column = c - 1, w.source && w.source.start ? (f.source = this.sourcePath(w), f.original.line = w.source.start.line, f.original.column = w.source.start.column - 1, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, this.map.addMapping(f))), g = b.match(/\n/g), g ? (u += g.length, k = b.lastIndexOf(`
`), c = b.length - k) : c += b.length, w && S !== "start") {
          let y = w.parent || { raws: {} };
          (!(w.type === "decl" || w.type === "atrule" && !w.nodes) || w !== y.last || y.raws.semicolon) && (w.source && w.source.end ? (f.source = this.sourcePath(w), f.original.line = w.source.end.line, f.original.column = w.source.end.column - 1, f.generated.line = u, f.generated.column = c - 2, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, f.generated.line = u, f.generated.column = c - 1, this.map.addMapping(f)));
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
      s === "\\" && (u = u.replace(/\\/g, "/"));
      let m = encodeURI(u).replace(/[#?]/g, encodeURIComponent);
      return this.memoizedURLs.set(u, m), m;
    }
  }
  return _n = a, _n;
}
var $n, Xs;
function Hr() {
  if (Xs) return $n;
  Xs = 1;
  let e = qr();
  class t extends e {
    constructor(n) {
      super(n), this.type = "comment";
    }
  }
  return $n = t, t.default = t, $n;
}
var Dn, Ks;
function Rt() {
  if (Ks) return Dn;
  Ks = 1;
  let { isClean: e, my: t } = Mi(), r = Wr(), n = Hr(), i = qr(), s, l, d, o;
  function h(u) {
    return u.map((c) => (c.nodes && (c.nodes = h(c.nodes)), delete c.source, c));
  }
  function a(u) {
    if (u[e] = !1, u.proxyOf.nodes)
      for (let c of u.proxyOf.nodes)
        a(c);
  }
  class p extends i {
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
            ...f.map((g) => typeof g == "function" ? (k, b) => g(k.toProxy(), b) : g)
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
      for (let b of g) this.proxyOf.nodes.splice(f + 1, 0, b);
      let k;
      for (let b in this.indexes)
        k = this.indexes[b], f < k && (this.indexes[b] = k + g.length);
      return this.markDirty(), this;
    }
    insertBefore(c, m) {
      let f = this.index(c), g = f === 0 ? "prepend" : !1, k = this.normalize(m, this.proxyOf.nodes[f], g).reverse();
      f = this.index(c);
      for (let w of k) this.proxyOf.nodes.splice(f, 0, w);
      let b;
      for (let w in this.indexes)
        b = this.indexes[w], f <= b && (this.indexes[w] = b + k.length);
      return this.markDirty(), this;
    }
    normalize(c, m) {
      if (typeof c == "string")
        c = h(s(c).nodes);
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
      return c.map((g) => (g[t] || p.rebuild(g), g = g.proxyOf, g.parent && g.parent.removeChild(g), g[e] && a(g), typeof g.raws.before > "u" && m && typeof m.raws.before < "u" && (g.raws.before = m.raws.before.replace(/\S/g, "")), g.parent = this.proxyOf, g));
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
  return p.registerParse = (u) => {
    s = u;
  }, p.registerRule = (u) => {
    l = u;
  }, p.registerAtRule = (u) => {
    d = u;
  }, p.registerRoot = (u) => {
    o = u;
  }, Dn = p, p.default = p, p.rebuild = (u) => {
    u.type === "atrule" ? Object.setPrototypeOf(u, d.prototype) : u.type === "rule" ? Object.setPrototypeOf(u, l.prototype) : u.type === "decl" ? Object.setPrototypeOf(u, r.prototype) : u.type === "comment" ? Object.setPrototypeOf(u, n.prototype) : u.type === "root" && Object.setPrototypeOf(u, o.prototype), u[t] = !0, u.nodes && u.nodes.forEach((c) => {
      p.rebuild(c);
    });
  }, Dn;
}
var zn, Js;
function Ri() {
  if (Js) return zn;
  Js = 1;
  let e = Rt(), t, r;
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
  }, zn = n, n.default = n, zn;
}
var Fn, Zs;
function ma() {
  if (Zs) return Fn;
  Zs = 1;
  let e = {};
  return Fn = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, Fn;
}
var Un, Qs;
function ga() {
  if (Qs) return Un;
  Qs = 1;
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
  return Un = e, e.default = e, Un;
}
var Bn, eo;
function Oi() {
  if (eo) return Bn;
  eo = 1;
  let e = ga();
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
  return Bn = t, t.default = t, Bn;
}
var qn, to;
function dd() {
  if (to) return qn;
  to = 1;
  const e = 39, t = 34, r = 92, n = 47, i = 10, s = 32, l = 12, d = 9, o = 13, h = 91, a = 93, p = 40, u = 41, c = 123, m = 125, f = 59, g = 42, k = 58, b = 64, w = /[\t\n\f\r "#'()/;[\\\]{}]/g, S = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, y = /.[\r\n"'(/\\]/, v = /[\da-f]/i;
  return qn = function(M, L = {}) {
    let R = M.css.valueOf(), B = L.ignoreErrors, z, C, ke, xe, re, te, he, ye, se, Y, We = R.length, I = 0, Le = [], Ce = [];
    function Ue() {
      return I;
    }
    function me(W) {
      throw M.error("Unclosed " + W, I);
    }
    function be() {
      return Ce.length === 0 && I >= We;
    }
    function Ze(W) {
      if (Ce.length) return Ce.pop();
      if (I >= We) return;
      let ae = W ? W.ignoreUnclosed : !1;
      switch (z = R.charCodeAt(I), z) {
        case i:
        case s:
        case d:
        case o:
        case l: {
          C = I;
          do
            C += 1, z = R.charCodeAt(C);
          while (z === s || z === i || z === d || z === o || z === l);
          Y = ["space", R.slice(I, C)], I = C - 1;
          break;
        }
        case h:
        case a:
        case c:
        case m:
        case k:
        case f:
        case u: {
          let ne = String.fromCharCode(z);
          Y = [ne, ne, I];
          break;
        }
        case p: {
          if (ye = Le.length ? Le.pop()[1] : "", se = R.charCodeAt(I + 1), ye === "url" && se !== e && se !== t && se !== s && se !== i && se !== d && se !== l && se !== o) {
            C = I;
            do {
              if (te = !1, C = R.indexOf(")", C + 1), C === -1)
                if (B || ae) {
                  C = I;
                  break;
                } else
                  me("bracket");
              for (he = C; R.charCodeAt(he - 1) === r; )
                he -= 1, te = !te;
            } while (te);
            Y = ["brackets", R.slice(I, C + 1), I, C], I = C;
          } else
            C = R.indexOf(")", I + 1), xe = R.slice(I, C + 1), C === -1 || y.test(xe) ? Y = ["(", "(", I] : (Y = ["brackets", xe, I, C], I = C);
          break;
        }
        case e:
        case t: {
          ke = z === e ? "'" : '"', C = I;
          do {
            if (te = !1, C = R.indexOf(ke, C + 1), C === -1)
              if (B || ae) {
                C = I + 1;
                break;
              } else
                me("string");
            for (he = C; R.charCodeAt(he - 1) === r; )
              he -= 1, te = !te;
          } while (te);
          Y = ["string", R.slice(I, C + 1), I, C], I = C;
          break;
        }
        case b: {
          w.lastIndex = I + 1, w.test(R), w.lastIndex === 0 ? C = R.length - 1 : C = w.lastIndex - 2, Y = ["at-word", R.slice(I, C + 1), I, C], I = C;
          break;
        }
        case r: {
          for (C = I, re = !0; R.charCodeAt(C + 1) === r; )
            C += 1, re = !re;
          if (z = R.charCodeAt(C + 1), re && z !== n && z !== s && z !== i && z !== d && z !== o && z !== l && (C += 1, v.test(R.charAt(C)))) {
            for (; v.test(R.charAt(C + 1)); )
              C += 1;
            R.charCodeAt(C + 1) === s && (C += 1);
          }
          Y = ["word", R.slice(I, C + 1), I, C], I = C;
          break;
        }
        default: {
          z === n && R.charCodeAt(I + 1) === g ? (C = R.indexOf("*/", I + 2) + 1, C === 0 && (B || ae ? C = R.length : me("comment")), Y = ["comment", R.slice(I, C + 1), I, C], I = C) : (S.lastIndex = I + 1, S.test(R), S.lastIndex === 0 ? C = R.length - 1 : C = S.lastIndex - 2, Y = ["word", R.slice(I, C + 1), I, C], Le.push(Y), I = C);
          break;
        }
      }
      return I++, Y;
    }
    function Qe(W) {
      Ce.push(W);
    }
    return {
      back: Qe,
      endOfFile: be,
      nextToken: Ze,
      position: Ue
    };
  }, qn;
}
var Wn, ro;
function Ii() {
  if (ro) return Wn;
  ro = 1;
  let e = Rt();
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
  return Wn = t, t.default = t, e.registerAtRule(t), Wn;
}
var jn, no;
function rr() {
  if (no) return jn;
  no = 1;
  let e = Rt(), t, r;
  class n extends e {
    constructor(s) {
      super(s), this.type = "root", this.nodes || (this.nodes = []);
    }
    normalize(s, l, d) {
      let o = super.normalize(s);
      if (l) {
        if (d === "prepend")
          this.nodes.length > 1 ? l.raws.before = this.nodes[1].raws.before : delete l.raws.before;
        else if (this.first !== l)
          for (let h of o)
            h.raws.before = l.raws.before;
      }
      return o;
    }
    removeChild(s, l) {
      let d = this.index(s);
      return !l && d === 0 && this.nodes.length > 1 && (this.nodes[1].raws.before = this.nodes[d].raws.before), super.removeChild(s);
    }
    toResult(s = {}) {
      return new t(new r(), this, s).stringify();
    }
  }
  return n.registerLazyResult = (i) => {
    t = i;
  }, n.registerProcessor = (i) => {
    r = i;
  }, jn = n, n.default = n, e.registerRoot(n), jn;
}
var Hn, io;
function ya() {
  if (io) return Hn;
  io = 1;
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
      let i = [], s = "", l = !1, d = 0, o = !1, h = "", a = !1;
      for (let p of t)
        a ? a = !1 : p === "\\" ? a = !0 : o ? p === h && (o = !1) : p === '"' || p === "'" ? (o = !0, h = p) : p === "(" ? d += 1 : p === ")" ? d > 0 && (d -= 1) : d === 0 && r.includes(p) && (l = !0), l ? (s !== "" && i.push(s.trim()), s = "", l = !1) : s += p;
      return (n || s !== "") && i.push(s.trim()), i;
    }
  };
  return Hn = e, e.default = e, Hn;
}
var Vn, so;
function Li() {
  if (so) return Vn;
  so = 1;
  let e = Rt(), t = ya();
  class r extends e {
    constructor(i) {
      super(i), this.type = "rule", this.nodes || (this.nodes = []);
    }
    get selectors() {
      return t.comma(this.selector);
    }
    set selectors(i) {
      let s = this.selector ? this.selector.match(/,\s*/) : null, l = s ? s[0] : "," + this.raw("between", "beforeOpen");
      this.selector = i.join(l);
    }
  }
  return Vn = r, r.default = r, e.registerRule(r), Vn;
}
var Gn, oo;
function hd() {
  if (oo) return Gn;
  oo = 1;
  let e = Wr(), t = dd(), r = Hr(), n = Ii(), i = rr(), s = Li();
  const l = {
    empty: !0,
    space: !0
  };
  function d(h) {
    for (let a = h.length - 1; a >= 0; a--) {
      let p = h[a], u = p[3] || p[2];
      if (u) return u;
    }
  }
  class o {
    constructor(a) {
      this.input = a, this.root = new i(), this.current = this.root, this.spaces = "", this.semicolon = !1, this.createTokenizer(), this.root.source = { input: a, start: { column: 1, line: 1, offset: 0 } };
    }
    atrule(a) {
      let p = new n();
      p.name = a[1].slice(1), p.name === "" && this.unnamedAtrule(p, a), this.init(p, a[2]);
      let u, c, m, f = !1, g = !1, k = [], b = [];
      for (; !this.tokenizer.endOfFile(); ) {
        if (a = this.tokenizer.nextToken(), u = a[0], u === "(" || u === "[" ? b.push(u === "(" ? ")" : "]") : u === "{" && b.length > 0 ? b.push("}") : u === b[b.length - 1] && b.pop(), b.length === 0)
          if (u === ";") {
            p.source.end = this.getPosition(a[2]), p.source.end.offset++, this.semicolon = !0;
            break;
          } else if (u === "{") {
            g = !0;
            break;
          } else if (u === "}") {
            if (k.length > 0) {
              for (m = k.length - 1, c = k[m]; c && c[0] === "space"; )
                c = k[--m];
              c && (p.source.end = this.getPosition(c[3] || c[2]), p.source.end.offset++);
            }
            this.end(a);
            break;
          } else
            k.push(a);
        else
          k.push(a);
        if (this.tokenizer.endOfFile()) {
          f = !0;
          break;
        }
      }
      p.raws.between = this.spacesAndCommentsFromEnd(k), k.length ? (p.raws.afterName = this.spacesAndCommentsFromStart(k), this.raw(p, "params", k), f && (a = k[k.length - 1], p.source.end = this.getPosition(a[3] || a[2]), p.source.end.offset++, this.spaces = p.raws.between, p.raws.between = "")) : (p.raws.afterName = "", p.params = ""), g && (p.nodes = [], this.current = p);
    }
    checkMissedSemicolon(a) {
      let p = this.colon(a);
      if (p === !1) return;
      let u = 0, c;
      for (let m = p - 1; m >= 0 && (c = a[m], !(c[0] !== "space" && (u += 1, u === 2))); m--)
        ;
      throw this.input.error(
        "Missed semicolon",
        c[0] === "word" ? c[3] + 1 : c[2]
      );
    }
    colon(a) {
      let p = 0, u, c, m;
      for (let [f, g] of a.entries()) {
        if (u = g, c = u[0], c === "(" && (p += 1), c === ")" && (p -= 1), p === 0 && c === ":")
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
    comment(a) {
      let p = new r();
      this.init(p, a[2]), p.source.end = this.getPosition(a[3] || a[2]), p.source.end.offset++;
      let u = a[1].slice(2, -2);
      if (/^\s*$/.test(u))
        p.text = "", p.raws.left = u, p.raws.right = "";
      else {
        let c = u.match(/^(\s*)([^]*\S)(\s*)$/);
        p.text = c[2], p.raws.left = c[1], p.raws.right = c[3];
      }
    }
    createTokenizer() {
      this.tokenizer = t(this.input);
    }
    decl(a, p) {
      let u = new e();
      this.init(u, a[0][2]);
      let c = a[a.length - 1];
      for (c[0] === ";" && (this.semicolon = !0, a.pop()), u.source.end = this.getPosition(
        c[3] || c[2] || d(a)
      ), u.source.end.offset++; a[0][0] !== "word"; )
        a.length === 1 && this.unknownWord(a), u.raws.before += a.shift()[1];
      for (u.source.start = this.getPosition(a[0][2]), u.prop = ""; a.length; ) {
        let b = a[0][0];
        if (b === ":" || b === "space" || b === "comment")
          break;
        u.prop += a.shift()[1];
      }
      u.raws.between = "";
      let m;
      for (; a.length; )
        if (m = a.shift(), m[0] === ":") {
          u.raws.between += m[1];
          break;
        } else
          m[0] === "word" && /\w/.test(m[1]) && this.unknownWord([m]), u.raws.between += m[1];
      (u.prop[0] === "_" || u.prop[0] === "*") && (u.raws.before += u.prop[0], u.prop = u.prop.slice(1));
      let f = [], g;
      for (; a.length && (g = a[0][0], !(g !== "space" && g !== "comment")); )
        f.push(a.shift());
      this.precheckMissedSemicolon(a);
      for (let b = a.length - 1; b >= 0; b--) {
        if (m = a[b], m[1].toLowerCase() === "!important") {
          u.important = !0;
          let w = this.stringFrom(a, b);
          w = this.spacesFromEnd(a) + w, w !== " !important" && (u.raws.important = w);
          break;
        } else if (m[1].toLowerCase() === "important") {
          let w = a.slice(0), S = "";
          for (let y = b; y > 0; y--) {
            let v = w[y][0];
            if (S.trim().indexOf("!") === 0 && v !== "space")
              break;
            S = w.pop()[1] + S;
          }
          S.trim().indexOf("!") === 0 && (u.important = !0, u.raws.important = S, a = w);
        }
        if (m[0] !== "space" && m[0] !== "comment")
          break;
      }
      a.some((b) => b[0] !== "space" && b[0] !== "comment") && (u.raws.between += f.map((b) => b[1]).join(""), f = []), this.raw(u, "value", f.concat(a), p), u.value.includes(":") && !p && this.checkMissedSemicolon(a);
    }
    doubleColon(a) {
      throw this.input.error(
        "Double colon",
        { offset: a[2] },
        { offset: a[2] + a[1].length }
      );
    }
    emptyRule(a) {
      let p = new s();
      this.init(p, a[2]), p.selector = "", p.raws.between = "", this.current = p;
    }
    end(a) {
      this.current.nodes && this.current.nodes.length && (this.current.raws.semicolon = this.semicolon), this.semicolon = !1, this.current.raws.after = (this.current.raws.after || "") + this.spaces, this.spaces = "", this.current.parent ? (this.current.source.end = this.getPosition(a[2]), this.current.source.end.offset++, this.current = this.current.parent) : this.unexpectedClose(a);
    }
    endFile() {
      this.current.parent && this.unclosedBlock(), this.current.nodes && this.current.nodes.length && (this.current.raws.semicolon = this.semicolon), this.current.raws.after = (this.current.raws.after || "") + this.spaces, this.root.source.end = this.getPosition(this.tokenizer.position());
    }
    freeSemicolon(a) {
      if (this.spaces += a[1], this.current.nodes) {
        let p = this.current.nodes[this.current.nodes.length - 1];
        p && p.type === "rule" && !p.raws.ownSemicolon && (p.raws.ownSemicolon = this.spaces, this.spaces = "");
      }
    }
    // Helpers
    getPosition(a) {
      let p = this.input.fromOffset(a);
      return {
        column: p.col,
        line: p.line,
        offset: a
      };
    }
    init(a, p) {
      this.current.push(a), a.source = {
        input: this.input,
        start: this.getPosition(p)
      }, a.raws.before = this.spaces, this.spaces = "", a.type !== "comment" && (this.semicolon = !1);
    }
    other(a) {
      let p = !1, u = null, c = !1, m = null, f = [], g = a[1].startsWith("--"), k = [], b = a;
      for (; b; ) {
        if (u = b[0], k.push(b), u === "(" || u === "[")
          m || (m = b), f.push(u === "(" ? ")" : "]");
        else if (g && c && u === "{")
          m || (m = b), f.push("}");
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
            this.tokenizer.back(k.pop()), p = !0;
            break;
          } else u === ":" && (c = !0);
        else u === f[f.length - 1] && (f.pop(), f.length === 0 && (m = null));
        b = this.tokenizer.nextToken();
      }
      if (this.tokenizer.endOfFile() && (p = !0), f.length > 0 && this.unclosedBracket(m), p && c) {
        if (!g)
          for (; k.length && (b = k[k.length - 1][0], !(b !== "space" && b !== "comment")); )
            this.tokenizer.back(k.pop());
        this.decl(k, g);
      } else
        this.unknownWord(k);
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
    raw(a, p, u, c) {
      let m, f, g = u.length, k = "", b = !0, w, S;
      for (let y = 0; y < g; y += 1)
        m = u[y], f = m[0], f === "space" && y === g - 1 && !c ? b = !1 : f === "comment" ? (S = u[y - 1] ? u[y - 1][0] : "empty", w = u[y + 1] ? u[y + 1][0] : "empty", !l[S] && !l[w] ? k.slice(-1) === "," ? b = !1 : k += m[1] : b = !1) : k += m[1];
      if (!b) {
        let y = u.reduce((v, x) => v + x[1], "");
        a.raws[p] = { raw: y, value: k };
      }
      a[p] = k;
    }
    rule(a) {
      a.pop();
      let p = new s();
      this.init(p, a[0][2]), p.raws.between = this.spacesAndCommentsFromEnd(a), this.raw(p, "selector", a), this.current = p;
    }
    spacesAndCommentsFromEnd(a) {
      let p, u = "";
      for (; a.length && (p = a[a.length - 1][0], !(p !== "space" && p !== "comment")); )
        u = a.pop()[1] + u;
      return u;
    }
    // Errors
    spacesAndCommentsFromStart(a) {
      let p, u = "";
      for (; a.length && (p = a[0][0], !(p !== "space" && p !== "comment")); )
        u += a.shift()[1];
      return u;
    }
    spacesFromEnd(a) {
      let p, u = "";
      for (; a.length && (p = a[a.length - 1][0], p === "space"); )
        u = a.pop()[1] + u;
      return u;
    }
    stringFrom(a, p) {
      let u = "";
      for (let c = p; c < a.length; c++)
        u += a[c][1];
      return a.splice(p, a.length - p), u;
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
    unnamedAtrule(a, p) {
      throw this.input.error(
        "At-rule without name",
        { offset: p[2] },
        { offset: p[2] + p[1].length }
      );
    }
  }
  return Gn = o, Gn;
}
var Yn, ao;
function Ai() {
  if (ao) return Yn;
  ao = 1;
  let e = Rt(), t = hd(), r = jr();
  function n(i, s) {
    let l = new r(i, s), d = new t(l);
    try {
      d.parse();
    } catch (o) {
      throw process.env.NODE_ENV !== "production" && o.name === "CssSyntaxError" && s && s.from && (/\.scss$/i.test(s.from) ? o.message += `
You tried to parse SCSS with the standard CSS parser; try again with the postcss-scss parser` : /\.sass/i.test(s.from) ? o.message += `
You tried to parse Sass with the standard CSS parser; try again with the postcss-sass parser` : /\.less$/i.test(s.from) && (o.message += `
You tried to parse Less with the standard CSS parser; try again with the postcss-less parser`)), o;
    }
    return d.root;
  }
  return Yn = n, n.default = n, e.registerParse(n), Yn;
}
var Xn, lo;
function ba() {
  if (lo) return Xn;
  lo = 1;
  let { isClean: e, my: t } = Mi(), r = fa(), n = Br(), i = Rt(), s = Ri(), l = ma(), d = Oi(), o = Ai(), h = rr();
  const a = {
    atrule: "AtRule",
    comment: "Comment",
    decl: "Declaration",
    document: "Document",
    root: "Root",
    rule: "Rule"
  }, p = {
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
  function m(S) {
    return typeof S == "object" && typeof S.then == "function";
  }
  function f(S) {
    let y = !1, v = a[S.type];
    return S.type === "decl" ? y = S.prop.toLowerCase() : S.type === "atrule" && (y = S.name.toLowerCase()), y && S.append ? [
      v,
      v + "-" + y,
      c,
      v + "Exit",
      v + "Exit-" + y
    ] : y ? [v, v + "-" + y, v + "Exit", v + "Exit-" + y] : S.append ? [v, c, v + "Exit"] : [v, v + "Exit"];
  }
  function g(S) {
    let y;
    return S.type === "document" ? y = ["Document", c, "DocumentExit"] : S.type === "root" ? y = ["Root", c, "RootExit"] : y = f(S), {
      eventIndex: 0,
      events: y,
      iterator: 0,
      node: S,
      visitorIndex: 0,
      visitors: []
    };
  }
  function k(S) {
    return S[e] = !1, S.nodes && S.nodes.forEach((y) => k(y)), S;
  }
  let b = {};
  class w {
    constructor(y, v, x) {
      this.stringified = !1, this.processed = !1;
      let M;
      if (typeof v == "object" && v !== null && (v.type === "root" || v.type === "document"))
        M = k(v);
      else if (v instanceof w || v instanceof d)
        M = k(v.root), v.map && (typeof x.map > "u" && (x.map = {}), x.map.inline || (x.map.inline = !1), x.map.prev = v.map);
      else {
        let L = o;
        x.syntax && (L = x.syntax.parse), x.parser && (L = x.parser), L.parse && (L = L.parse);
        try {
          M = L(v, x);
        } catch (R) {
          this.processed = !0, this.error = R;
        }
        M && !M[t] && i.rebuild(M);
      }
      this.result = new d(y, M, x), this.helpers = { ...b, postcss: b, result: this.result }, this.plugins = this.processor.plugins.map((L) => typeof L == "object" && L.prepare ? { ...L, ...L.prepare(this.result) } : L);
    }
    async() {
      return this.error ? Promise.reject(this.error) : this.processed ? Promise.resolve(this.result) : (this.processing || (this.processing = this.runAsync()), this.processing);
    }
    catch(y) {
      return this.async().catch(y);
    }
    finally(y) {
      return this.async().then(y, y);
    }
    getAsyncError() {
      throw new Error("Use process(css).then(cb) to work with async plugins");
    }
    handleError(y, v) {
      let x = this.result.lastPlugin;
      try {
        if (v && v.addToError(y), this.error = y, y.name === "CssSyntaxError" && !y.plugin)
          y.plugin = x.postcssPlugin, y.setMessage();
        else if (x.postcssVersion && process.env.NODE_ENV !== "production") {
          let M = x.postcssPlugin, L = x.postcssVersion, R = this.result.processor.version, B = L.split("."), z = R.split(".");
          (B[0] !== z[0] || parseInt(B[1]) > parseInt(z[1])) && console.error(
            "Unknown error from PostCSS plugin. Your current PostCSS version is " + R + ", but " + M + " uses " + L + ". Perhaps this is the source of the error below."
          );
        }
      } catch (M) {
        console && console.error && console.error(M);
      }
      return y;
    }
    prepareVisitors() {
      this.listeners = {};
      let y = (v, x, M) => {
        this.listeners[x] || (this.listeners[x] = []), this.listeners[x].push([v, M]);
      };
      for (let v of this.plugins)
        if (typeof v == "object")
          for (let x in v) {
            if (!p[x] && /^[A-Z]/.test(x))
              throw new Error(
                `Unknown event ${x} in ${v.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`
              );
            if (!u[x])
              if (typeof v[x] == "object")
                for (let M in v[x])
                  M === "*" ? y(v, x, v[x][M]) : y(
                    v,
                    x + "-" + M.toLowerCase(),
                    v[x][M]
                  );
              else typeof v[x] == "function" && y(v, x, v[x]);
          }
      this.hasListener = Object.keys(this.listeners).length > 0;
    }
    async runAsync() {
      this.plugin = 0;
      for (let y = 0; y < this.plugins.length; y++) {
        let v = this.plugins[y], x = this.runOnRoot(v);
        if (m(x))
          try {
            await x;
          } catch (M) {
            throw this.handleError(M);
          }
      }
      if (this.prepareVisitors(), this.hasListener) {
        let y = this.result.root;
        for (; !y[e]; ) {
          y[e] = !0;
          let v = [g(y)];
          for (; v.length > 0; ) {
            let x = this.visitTick(v);
            if (m(x))
              try {
                await x;
              } catch (M) {
                let L = v[v.length - 1].node;
                throw this.handleError(M, L);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [v, x] of this.listeners.OnceExit) {
            this.result.lastPlugin = v;
            try {
              if (y.type === "document") {
                let M = y.nodes.map(
                  (L) => x(L, this.helpers)
                );
                await Promise.all(M);
              } else
                await x(y, this.helpers);
            } catch (M) {
              throw this.handleError(M);
            }
          }
      }
      return this.processed = !0, this.stringify();
    }
    runOnRoot(y) {
      this.result.lastPlugin = y;
      try {
        if (typeof y == "object" && y.Once) {
          if (this.result.root.type === "document") {
            let v = this.result.root.nodes.map(
              (x) => y.Once(x, this.helpers)
            );
            return m(v[0]) ? Promise.all(v) : v;
          }
          return y.Once(this.result.root, this.helpers);
        } else if (typeof y == "function")
          return y(this.result.root, this.result);
      } catch (v) {
        throw this.handleError(v);
      }
    }
    stringify() {
      if (this.error) throw this.error;
      if (this.stringified) return this.result;
      this.stringified = !0, this.sync();
      let y = this.result.opts, v = n;
      y.syntax && (v = y.syntax.stringify), y.stringifier && (v = y.stringifier), v.stringify && (v = v.stringify);
      let M = new r(v, this.result.root, this.result.opts).generate();
      return this.result.css = M[0], this.result.map = M[1], this.result;
    }
    sync() {
      if (this.error) throw this.error;
      if (this.processed) return this.result;
      if (this.processed = !0, this.processing)
        throw this.getAsyncError();
      for (let y of this.plugins) {
        let v = this.runOnRoot(y);
        if (m(v))
          throw this.getAsyncError();
      }
      if (this.prepareVisitors(), this.hasListener) {
        let y = this.result.root;
        for (; !y[e]; )
          y[e] = !0, this.walkSync(y);
        if (this.listeners.OnceExit)
          if (y.type === "document")
            for (let v of y.nodes)
              this.visitSync(this.listeners.OnceExit, v);
          else
            this.visitSync(this.listeners.OnceExit, y);
      }
      return this.result;
    }
    then(y, v) {
      return process.env.NODE_ENV !== "production" && ("from" in this.opts || l(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(y, v);
    }
    toString() {
      return this.css;
    }
    visitSync(y, v) {
      for (let [x, M] of y) {
        this.result.lastPlugin = x;
        let L;
        try {
          L = M(v, this.helpers);
        } catch (R) {
          throw this.handleError(R, v.proxyOf);
        }
        if (v.type !== "root" && v.type !== "document" && !v.parent)
          return !0;
        if (m(L))
          throw this.getAsyncError();
      }
    }
    visitTick(y) {
      let v = y[y.length - 1], { node: x, visitors: M } = v;
      if (x.type !== "root" && x.type !== "document" && !x.parent) {
        y.pop();
        return;
      }
      if (M.length > 0 && v.visitorIndex < M.length) {
        let [R, B] = M[v.visitorIndex];
        v.visitorIndex += 1, v.visitorIndex === M.length && (v.visitors = [], v.visitorIndex = 0), this.result.lastPlugin = R;
        try {
          return B(x.toProxy(), this.helpers);
        } catch (z) {
          throw this.handleError(z, x);
        }
      }
      if (v.iterator !== 0) {
        let R = v.iterator, B;
        for (; B = x.nodes[x.indexes[R]]; )
          if (x.indexes[R] += 1, !B[e]) {
            B[e] = !0, y.push(g(B));
            return;
          }
        v.iterator = 0, delete x.indexes[R];
      }
      let L = v.events;
      for (; v.eventIndex < L.length; ) {
        let R = L[v.eventIndex];
        if (v.eventIndex += 1, R === c) {
          x.nodes && x.nodes.length && (x[e] = !0, v.iterator = x.getIterator());
          return;
        } else if (this.listeners[R]) {
          v.visitors = this.listeners[R];
          return;
        }
      }
      y.pop();
    }
    walkSync(y) {
      y[e] = !0;
      let v = f(y);
      for (let x of v)
        if (x === c)
          y.nodes && y.each((M) => {
            M[e] || this.walkSync(M);
          });
        else {
          let M = this.listeners[x];
          if (M && this.visitSync(M, y.toProxy()))
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
  return w.registerPostcss = (S) => {
    b = S;
  }, Xn = w, w.default = w, h.registerLazyResult(w), s.registerLazyResult(w), Xn;
}
var Kn, co;
function pd() {
  if (co) return Kn;
  co = 1;
  let e = fa(), t = Br(), r = ma(), n = Ai();
  const i = Oi();
  class s {
    constructor(d, o, h) {
      o = o.toString(), this.stringified = !1, this._processor = d, this._css = o, this._opts = h, this._map = void 0;
      let a, p = t;
      this.result = new i(this._processor, a, this._opts), this.result.css = o;
      let u = this;
      Object.defineProperty(this.result, "root", {
        get() {
          return u.root;
        }
      });
      let c = new e(p, a, this._opts, o);
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
    then(d, o) {
      return process.env.NODE_ENV !== "production" && ("from" in this._opts || r(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(d, o);
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
      let d, o = n;
      try {
        d = o(this._css, this._opts);
      } catch (h) {
        this.error = h;
      }
      if (this.error)
        throw this.error;
      return this._root = d, d;
    }
    get [Symbol.toStringTag]() {
      return "NoWorkResult";
    }
  }
  return Kn = s, s.default = s, Kn;
}
var Jn, uo;
function fd() {
  if (uo) return Jn;
  uo = 1;
  let e = pd(), t = ba(), r = Ri(), n = rr();
  class i {
    constructor(l = []) {
      this.version = "8.4.38", this.plugins = this.normalize(l);
    }
    normalize(l) {
      let d = [];
      for (let o of l)
        if (o.postcss === !0 ? o = o() : o.postcss && (o = o.postcss), typeof o == "object" && Array.isArray(o.plugins))
          d = d.concat(o.plugins);
        else if (typeof o == "object" && o.postcssPlugin)
          d.push(o);
        else if (typeof o == "function")
          d.push(o);
        else if (typeof o == "object" && (o.parse || o.stringify)) {
          if (process.env.NODE_ENV !== "production")
            throw new Error(
              "PostCSS syntaxes cannot be used as plugins. Instead, please use one of the syntax/parser/stringifier options as outlined in your PostCSS runner documentation."
            );
        } else
          throw new Error(o + " is not a PostCSS plugin");
      return d;
    }
    process(l, d = {}) {
      return !this.plugins.length && !d.parser && !d.stringifier && !d.syntax ? new e(this, l, d) : new t(this, l, d);
    }
    use(l) {
      return this.plugins = this.plugins.concat(this.normalize([l])), this;
    }
  }
  return Jn = i, i.default = i, n.registerProcessor(i), r.registerProcessor(i), Jn;
}
var Zn, ho;
function md() {
  if (ho) return Zn;
  ho = 1;
  let e = Wr(), t = pa(), r = Hr(), n = Ii(), i = jr(), s = rr(), l = Li();
  function d(o, h) {
    if (Array.isArray(o)) return o.map((u) => d(u));
    let { inputs: a, ...p } = o;
    if (a) {
      h = [];
      for (let u of a) {
        let c = { ...u, __proto__: i.prototype };
        c.map && (c.map = {
          ...c.map,
          __proto__: t.prototype
        }), h.push(c);
      }
    }
    if (p.nodes && (p.nodes = o.nodes.map((u) => d(u, h))), p.source) {
      let { inputId: u, ...c } = p.source;
      p.source = c, u != null && (p.source.input = h[u]);
    }
    if (p.type === "root")
      return new s(p);
    if (p.type === "decl")
      return new e(p);
    if (p.type === "rule")
      return new l(p);
    if (p.type === "comment")
      return new r(p);
    if (p.type === "atrule")
      return new n(p);
    throw new Error("Unknown node type: " + o.type);
  }
  return Zn = d, d.default = d, Zn;
}
var Qn, po;
function gd() {
  if (po) return Qn;
  po = 1;
  let e = Ei(), t = Wr(), r = ba(), n = Rt(), i = fd(), s = Br(), l = md(), d = Ri(), o = ga(), h = Hr(), a = Ii(), p = Oi(), u = jr(), c = Ai(), m = ya(), f = Li(), g = rr(), k = qr();
  function b(...w) {
    return w.length === 1 && Array.isArray(w[0]) && (w = w[0]), new i(w);
  }
  return b.plugin = function(S, y) {
    let v = !1;
    function x(...L) {
      console && console.warn && !v && (v = !0, console.warn(
        S + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`
      ), process.env.LANG && process.env.LANG.startsWith("cn") && console.warn(
        S + `: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`
      ));
      let R = y(...L);
      return R.postcssPlugin = S, R.postcssVersion = new i().version, R;
    }
    let M;
    return Object.defineProperty(x, "postcss", {
      get() {
        return M || (M = x()), M;
      }
    }), x.process = function(L, R, B) {
      return b([x(B)]).process(L, R);
    }, x;
  }, b.stringify = s, b.parse = c, b.fromJSON = l, b.list = m, b.comment = (w) => new h(w), b.atRule = (w) => new a(w), b.decl = (w) => new t(w), b.rule = (w) => new f(w), b.root = (w) => new g(w), b.document = (w) => new d(w), b.CssSyntaxError = e, b.Declaration = t, b.Container = n, b.Processor = i, b.Document = d, b.Comment = h, b.Warning = o, b.AtRule = a, b.Result = p, b.Input = u, b.Rule = f, b.Root = g, b.Node = k, r.registerPostcss(b), Qn = b, b.default = b, Qn;
}
var yd = gd();
const fe = /* @__PURE__ */ sd(yd);
fe.stringify;
fe.fromJSON;
fe.plugin;
fe.parse;
fe.list;
fe.document;
fe.comment;
fe.atRule;
fe.rule;
fe.decl;
fe.root;
fe.CssSyntaxError;
fe.Declaration;
fe.Container;
fe.Processor;
fe.Document;
fe.Comment;
fe.Warning;
fe.AtRule;
fe.Result;
fe.Input;
fe.Rule;
fe.Root;
fe.Node;
class Ti {
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
    if (t instanceof Ti) {
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
const fo = {
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
}, mo = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, gr = {}, va = {}, bd = () => !!globalThis.Zone;
function Ni(e) {
  if (gr[e])
    return gr[e];
  const t = globalThis[e], r = t.prototype, n = e in fo ? fo[e] : void 0, i = !!(n && // @ts-expect-error 2345
  n.every(
    (d) => {
      var o, h;
      return !!((h = (o = Object.getOwnPropertyDescriptor(r, d)) == null ? void 0 : o.get) != null && h.toString().includes("[native code]"));
    }
  )), s = e in mo ? mo[e] : void 0, l = !!(s && s.every(
    // @ts-expect-error 2345
    (d) => {
      var o;
      return typeof r[d] == "function" && ((o = r[d]) == null ? void 0 : o.toString().includes("[native code]"));
    }
  ));
  if (i && l && !bd())
    return gr[e] = t.prototype, t.prototype;
  try {
    const d = document.createElement("iframe");
    d.style.display = "none", document.body.appendChild(d);
    const o = d.contentWindow;
    if (!o) return t.prototype;
    const h = o[e].prototype;
    if (!h)
      return d.remove(), r;
    const a = navigator.userAgent;
    return a.includes("Safari") && !a.includes("Chrome") ? (d.classList.add("rr-block"), d.setAttribute("__rrwebUntaintedMutationObserver", ""), va[e] = () => d.remove()) : d.remove(), gr[e] = h;
  } catch {
    return r;
  }
}
const ei = {};
function at(e, t, r) {
  var n;
  const i = `${e}.${String(r)}`;
  if (ei[i])
    return ei[i].call(
      t
    );
  const s = Ni(e), l = (n = Object.getOwnPropertyDescriptor(
    s,
    r
  )) == null ? void 0 : n.get;
  return l ? (ei[i] = l, l.call(t)) : t[r];
}
const ti = {};
function wa(e, t, r) {
  const n = `${e}.${String(r)}`;
  if (ti[n])
    return ti[n].bind(
      t
    );
  const s = Ni(e)[r];
  return typeof s != "function" ? t[r] : (ti[n] = s, s.bind(t));
}
function vd(e) {
  return at("Node", e, "ownerDocument");
}
function wd(e) {
  return at("Node", e, "childNodes");
}
function kd(e) {
  return at("Node", e, "parentNode");
}
function xd(e) {
  return at("Node", e, "parentElement");
}
function Sd(e) {
  return at("Node", e, "textContent");
}
function Cd(e, t) {
  return wa("Node", e, "contains")(t);
}
function Ed(e) {
  return wa("Node", e, "getRootNode")();
}
function Md(e) {
  return !e || !("host" in e) ? null : at("ShadowRoot", e, "host");
}
function Rd(e) {
  return e.styleSheets;
}
function Od(e) {
  return !e || !("shadowRoot" in e) ? null : at("Element", e, "shadowRoot");
}
function Id(e, t) {
  return at("Element", e, "querySelector")(t);
}
function Ld(e, t) {
  return at("Element", e, "querySelectorAll")(t);
}
function ka() {
  return [
    Ni("MutationObserver").constructor,
    va.MutationObserver ?? (() => {
    })
  ];
}
let Qt = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (Qt = () => (/* @__PURE__ */ new Date()).getTime());
function Ot(e, t, r) {
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
const G = {
  ownerDocument: vd,
  childNodes: wd,
  parentNode: kd,
  parentElement: xd,
  textContent: Sd,
  contains: Cd,
  getRootNode: Ed,
  host: Md,
  styleSheets: Rd,
  shadowRoot: Od,
  querySelector: Id,
  querySelectorAll: Ld,
  nowTimestamp: Qt,
  mutationObserverCtor: ka,
  patch: Ot
};
function Oe(e, t, r = document) {
  const n = { capture: !0, passive: !0 };
  return r.addEventListener(e, t, n), () => r.removeEventListener(e, t, n);
}
const Nt = `Please stop import mirror directly. Instead of that,\r
now you can use replayer.getMirror() to access the mirror instance of a replayer,\r
or you can use record.mirror to access the mirror instance during recording.`;
let go = {
  map: {},
  getId() {
    return console.error(Nt), -1;
  },
  getNode() {
    return console.error(Nt), null;
  },
  removeNodeFromMap() {
    console.error(Nt);
  },
  has() {
    return console.error(Nt), !1;
  },
  reset() {
    console.error(Nt);
  }
};
typeof window < "u" && window.Proxy && window.Reflect && (go = new Proxy(go, {
  get(e, t, r) {
    return t === "map" && console.error(Nt), Reflect.get(e, t, r);
  }
}));
function er(e, t, r = {}) {
  let n = null, i = 0;
  return function(...s) {
    const l = Date.now();
    !i && r.leading === !1 && (i = l);
    const d = t - (l - i), o = this;
    d <= 0 || d > t ? (n && (clearTimeout(n), n = null), i = l, e.apply(o, s)) : !n && r.trailing !== !1 && (n = setTimeout(() => {
      i = r.leading === !1 ? 0 : Date.now(), n = null, e.apply(o, s);
    }, d));
  };
}
function Vr(e, t, r, n, i = window) {
  const s = i.Object.getOwnPropertyDescriptor(e, t);
  return i.Object.defineProperty(
    e,
    t,
    n ? r : {
      set(l) {
        setTimeout(() => {
          r.set.call(this, l);
        }, 0), s && s.set && s.set.call(this, l);
      }
    }
  ), () => Vr(e, t, s || {}, !0);
}
function xa(e) {
  var t, r, n, i;
  const s = e.document;
  return {
    left: s.scrollingElement ? s.scrollingElement.scrollLeft : e.pageXOffset !== void 0 ? e.pageXOffset : s.documentElement.scrollLeft || (s == null ? void 0 : s.body) && ((t = G.parentElement(s.body)) == null ? void 0 : t.scrollLeft) || ((r = s == null ? void 0 : s.body) == null ? void 0 : r.scrollLeft) || 0,
    top: s.scrollingElement ? s.scrollingElement.scrollTop : e.pageYOffset !== void 0 ? e.pageYOffset : (s == null ? void 0 : s.documentElement.scrollTop) || (s == null ? void 0 : s.body) && ((n = G.parentElement(s.body)) == null ? void 0 : n.scrollTop) || ((i = s == null ? void 0 : s.body) == null ? void 0 : i.scrollTop) || 0
  };
}
function Sa() {
  return window.innerHeight || document.documentElement && document.documentElement.clientHeight || document.body && document.body.clientHeight;
}
function Ca() {
  return window.innerWidth || document.documentElement && document.documentElement.clientWidth || document.body && document.body.clientWidth;
}
function Ea(e) {
  return e ? e.nodeType === e.ELEMENT_NODE ? e : G.parentElement(e) : null;
}
function Ie(e, t, r, n) {
  if (!e)
    return !1;
  const i = Ea(e);
  if (!i)
    return !1;
  try {
    if (typeof t == "string") {
      if (i.classList.contains(t) || n && i.closest("." + t) !== null) return !0;
    } else if (Ir(i, t, n)) return !0;
  } catch {
  }
  return !!(r && (i.matches(r) || n && i.closest(r) !== null));
}
function Ad(e, t) {
  return t.getId(e) !== -1;
}
function ri(e, t, r) {
  return e.tagName === "TITLE" && r.headTitleMutations ? !0 : t.getId(e) === Zt;
}
function Ma(e, t) {
  if (Xt(e))
    return !1;
  const r = t.getId(e);
  if (!t.has(r))
    return !0;
  const n = G.parentNode(e);
  return n && n.nodeType === e.DOCUMENT_NODE ? !1 : n ? Ma(n, t) : !0;
}
function ai(e) {
  return !!e.changedTouches;
}
function Td(e = window) {
  "NodeList" in e && !e.NodeList.prototype.forEach && (e.NodeList.prototype.forEach = Array.prototype.forEach), "DOMTokenList" in e && !e.DOMTokenList.prototype.forEach && (e.DOMTokenList.prototype.forEach = Array.prototype.forEach);
}
function Ra(e, t) {
  return !!(e.nodeName === "IFRAME" && t.getMeta(e));
}
function Oa(e, t) {
  return !!(e.nodeName === "LINK" && e.nodeType === e.ELEMENT_NODE && e.getAttribute && e.getAttribute("rel") === "stylesheet" && t.getMeta(e));
}
function li(e) {
  return e ? e instanceof Ti && "shadowRoot" in e ? !!e.shadowRoot : !!G.shadowRoot(e) : !1;
}
class Nd {
  constructor() {
    N(this, "id", 1), N(this, "styleIDMap", /* @__PURE__ */ new WeakMap()), N(this, "idStyleMap", /* @__PURE__ */ new Map());
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
function Ia(e) {
  var t;
  let r = null;
  return "getRootNode" in e && ((t = G.getRootNode(e)) == null ? void 0 : t.nodeType) === Node.DOCUMENT_FRAGMENT_NODE && G.host(G.getRootNode(e)) && (r = G.host(G.getRootNode(e))), r;
}
function Pd(e) {
  let t = e, r;
  for (; r = Ia(t); )
    t = r;
  return t;
}
function _d(e) {
  const t = G.ownerDocument(e);
  if (!t) return !1;
  const r = Pd(e);
  return G.contains(t, r);
}
function La(e) {
  const t = G.ownerDocument(e);
  return t ? G.contains(t, e) || _d(e) : !1;
}
var ee = /* @__PURE__ */ ((e) => (e[e.DomContentLoaded = 0] = "DomContentLoaded", e[e.Load = 1] = "Load", e[e.FullSnapshot = 2] = "FullSnapshot", e[e.IncrementalSnapshot = 3] = "IncrementalSnapshot", e[e.Meta = 4] = "Meta", e[e.Custom = 5] = "Custom", e[e.Plugin = 6] = "Plugin", e[e.Asset = 7] = "Asset", e))(ee || {}), K = /* @__PURE__ */ ((e) => (e[e.Mutation = 0] = "Mutation", e[e.MouseMove = 1] = "MouseMove", e[e.MouseInteraction = 2] = "MouseInteraction", e[e.Scroll = 3] = "Scroll", e[e.ViewportResize = 4] = "ViewportResize", e[e.Input = 5] = "Input", e[e.TouchMove = 6] = "TouchMove", e[e.MediaInteraction = 7] = "MediaInteraction", e[e.StyleSheetRule = 8] = "StyleSheetRule", e[e.CanvasMutation = 9] = "CanvasMutation", e[e.Font = 10] = "Font", e[e.Log = 11] = "Log", e[e.Drag = 12] = "Drag", e[e.StyleDeclaration = 13] = "StyleDeclaration", e[e.Selection = 14] = "Selection", e[e.AdoptedStyleSheet = 15] = "AdoptedStyleSheet", e[e.CustomElement = 16] = "CustomElement", e))(K || {}), Ne = /* @__PURE__ */ ((e) => (e[e.MouseUp = 0] = "MouseUp", e[e.MouseDown = 1] = "MouseDown", e[e.Click = 2] = "Click", e[e.ContextMenu = 3] = "ContextMenu", e[e.DblClick = 4] = "DblClick", e[e.Focus = 5] = "Focus", e[e.Blur = 6] = "Blur", e[e.TouchStart = 7] = "TouchStart", e[e.TouchMove_Departed = 8] = "TouchMove_Departed", e[e.TouchEnd = 9] = "TouchEnd", e[e.TouchCancel = 10] = "TouchCancel", e))(Ne || {}), st = /* @__PURE__ */ ((e) => (e[e.Mouse = 0] = "Mouse", e[e.Pen = 1] = "Pen", e[e.Touch = 2] = "Touch", e))(st || {}), Wt = /* @__PURE__ */ ((e) => (e[e["2D"] = 0] = "2D", e[e.WebGL = 1] = "WebGL", e[e.WebGL2 = 2] = "WebGL2", e))(Wt || {}), Pt = /* @__PURE__ */ ((e) => (e[e.Play = 0] = "Play", e[e.Pause = 1] = "Pause", e[e.Seeked = 2] = "Seeked", e[e.VolumeChange = 3] = "VolumeChange", e[e.RateChange = 4] = "RateChange", e))(Pt || {}), Aa = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(Aa || {});
function yo(e) {
  return "__ln" in e;
}
class $d {
  constructor() {
    N(this, "length", 0), N(this, "head", null), N(this, "tail", null);
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
    if (t.__ln = r, t.previousSibling && yo(t.previousSibling)) {
      const n = t.previousSibling.__ln.next;
      r.next = n, r.previous = t.previousSibling.__ln, t.previousSibling.__ln.next = r, n && (n.previous = r);
    } else if (t.nextSibling && yo(t.nextSibling) && t.nextSibling.__ln.previous) {
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
const bo = (e, t) => `${e}@${t}`;
class Dd {
  constructor() {
    N(this, "frozen", !1), N(this, "locked", !1), N(this, "texts", []), N(this, "attributes", []), N(this, "attributeMap", /* @__PURE__ */ new WeakMap()), N(this, "removes", []), N(this, "mapRemoves", []), N(this, "movedMap", {}), N(this, "addedSet", /* @__PURE__ */ new Set()), N(this, "movedSet", /* @__PURE__ */ new Set()), N(this, "droppedSet", /* @__PURE__ */ new Set()), N(this, "removesSubTreeCache", /* @__PURE__ */ new Set()), N(this, "mutationCb"), N(this, "blockClass"), N(this, "blockSelector"), N(this, "maskTextClass"), N(this, "maskTextSelector"), N(this, "inlineStylesheet"), N(this, "maskInputOptions"), N(this, "maskTextFn"), N(this, "maskInputFn"), N(this, "keepIframeSrcFn"), N(this, "recordCanvas"), N(this, "inlineImages"), N(this, "slimDOMOptions"), N(this, "dataURLOptions"), N(this, "doc"), N(this, "mirror"), N(this, "iframeManager"), N(this, "stylesheetManager"), N(this, "shadowDomManager"), N(this, "canvasManager"), N(this, "processedNodeManager"), N(this, "unattachedDoc"), N(this, "processMutations", (t) => {
      t.forEach(this.processMutation), this.emit();
    }), N(this, "emit", () => {
      if (this.frozen || this.locked)
        return;
      const t = [], r = /* @__PURE__ */ new Set(), n = new $d(), i = (o) => {
        let h = o, a = Zt;
        for (; a === Zt; )
          h = h && h.nextSibling, a = h && this.mirror.getId(h);
        return a;
      }, s = (o) => {
        const h = G.parentNode(o);
        if (!h || !La(o))
          return;
        let a = !1;
        if (o.nodeType === Node.TEXT_NODE) {
          const m = h.tagName;
          if (m === "TEXTAREA")
            return;
          m === "STYLE" && this.addedSet.has(h) && (a = !0);
        }
        const p = Xt(h) ? this.mirror.getId(Ia(o)) : this.mirror.getId(h), u = i(o);
        if (p === -1 || u === -1)
          return n.addNode(o);
        const c = $t(o, {
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
            Ra(m, this.mirror) && this.iframeManager.addIframe(m), Oa(m, this.mirror) && this.stylesheetManager.trackLinkElement(
              m
            ), li(o) && this.shadowDomManager.addShadowRoot(G.shadowRoot(o), this.doc);
          },
          onIframeLoad: (m, f) => {
            this.iframeManager.attachIframe(m, f), this.shadowDomManager.observeAttachShadow(m);
          },
          onStylesheetLoad: (m, f) => {
            this.stylesheetManager.attachLinkElement(m, f);
          },
          cssCaptured: a
        });
        c && (t.push({
          parentId: p,
          nextId: u,
          node: c
        }), r.add(c.id));
      };
      for (; this.mapRemoves.length; )
        this.mirror.removeNodeFromMap(this.mapRemoves.shift());
      for (const o of this.movedSet)
        vo(this.removesSubTreeCache, o, this.mirror) && !this.movedSet.has(G.parentNode(o)) || s(o);
      for (const o of this.addedSet)
        !wo(this.droppedSet, o) && !vo(this.removesSubTreeCache, o, this.mirror) || wo(this.movedSet, o) ? s(o) : this.droppedSet.add(o);
      let l = null;
      for (; n.length; ) {
        let o = null;
        if (l) {
          const h = this.mirror.getId(G.parentNode(l.value)), a = i(l.value);
          h !== -1 && a !== -1 && (o = l);
        }
        if (!o) {
          let h = n.tail;
          for (; h; ) {
            const a = h;
            if (h = h.previous, a) {
              const p = this.mirror.getId(G.parentNode(a.value));
              if (i(a.value) === -1) continue;
              if (p !== -1) {
                o = a;
                break;
              } else {
                const c = a.value, m = G.parentNode(c);
                if (m && m.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                  const f = G.host(m);
                  if (this.mirror.getId(f) !== -1) {
                    o = a;
                    break;
                  }
                }
              }
            }
          }
        }
        if (!o) {
          for (; n.head; )
            n.removeNode(n.head.value);
          break;
        }
        l = o.previous, n.removeNode(o.value), s(o.value);
      }
      const d = {
        texts: this.texts.map((o) => {
          const h = o.node, a = G.parentNode(h);
          return a && a.tagName === "TEXTAREA" && this.genTextAreaValueMutation(a), {
            id: this.mirror.getId(h),
            value: o.value
          };
        }).filter((o) => !r.has(o.id)).filter((o) => this.mirror.has(o.id)),
        attributes: this.attributes.map((o) => {
          const { attributes: h } = o;
          if (typeof h.style == "string") {
            const a = JSON.stringify(o.styleDiff), p = JSON.stringify(o._unchangedStyles);
            a.length < h.style.length && (a + p).split("var(").length === h.style.split("var(").length && (h.style = o.styleDiff);
          }
          return {
            id: this.mirror.getId(o.node),
            attributes: h
          };
        }).filter((o) => !r.has(o.id)).filter((o) => this.mirror.has(o.id)),
        removes: this.removes,
        adds: t
      };
      !d.texts.length && !d.attributes.length && !d.removes.length && !d.adds.length || (this.texts = [], this.attributes = [], this.attributeMap = /* @__PURE__ */ new WeakMap(), this.removes = [], this.addedSet = /* @__PURE__ */ new Set(), this.movedSet = /* @__PURE__ */ new Set(), this.droppedSet = /* @__PURE__ */ new Set(), this.removesSubTreeCache = /* @__PURE__ */ new Set(), this.movedMap = {}, this.mutationCb(d));
    }), N(this, "genTextAreaValueMutation", (t) => {
      let r = this.attributeMap.get(t);
      r || (r = {
        node: t,
        attributes: {},
        styleDiff: {},
        _unchangedStyles: {}
      }, this.attributes.push(r), this.attributeMap.set(t, r));
      const n = Array.from(
        G.childNodes(t),
        (i) => G.textContent(i) || ""
      ).join("");
      r.attributes.value = Mr({
        element: t,
        maskInputOptions: this.maskInputOptions,
        tagName: t.tagName,
        type: Rr(t),
        value: n,
        maskInputFn: this.maskInputFn
      });
    }), N(this, "processMutation", (t) => {
      if (!ri(t.target, this.mirror, this.slimDOMOptions))
        switch (t.type) {
          case "characterData": {
            const r = G.textContent(t.target);
            !Ie(t.target, this.blockClass, this.blockSelector, !1) && r !== t.oldValue && this.texts.push({
              value: na(
                t.target,
                this.maskTextClass,
                this.maskTextSelector,
                !0
                // checkAncestors
              ) && r ? this.maskTextFn ? this.maskTextFn(r, Ea(t.target)) : r.replace(/[\S]/g, "*") : r,
              node: t.target
            });
            break;
          }
          case "attributes": {
            const r = t.target;
            let n = t.attributeName, i = t.target.getAttribute(n);
            if (n === "value") {
              const l = Rr(r);
              i = Mr({
                element: r,
                maskInputOptions: this.maskInputOptions,
                tagName: r.tagName,
                type: l,
                value: i,
                maskInputFn: this.maskInputFn
              });
            }
            if (Ie(t.target, this.blockClass, this.blockSelector, !1) || i === t.oldValue)
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
            }, this.attributes.push(s), this.attributeMap.set(t.target, s)), n === "type" && r.tagName === "INPUT" && (t.oldValue || "").toLowerCase() === "password" && r.setAttribute("data-rr-is-password", "true"), !ra(r.tagName, n))
              if (s.attributes[n] = ta(
                this.doc,
                Et(r.tagName),
                Et(n),
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
                  const o = r.style.getPropertyValue(d), h = r.style.getPropertyPriority(d);
                  o !== l.style.getPropertyValue(d) || h !== l.style.getPropertyPriority(d) ? h === "" ? s.styleDiff[d] = o : s.styleDiff[d] = [o, h] : s._unchangedStyles[d] = [o, h];
                }
                for (const d of Array.from(l.style))
                  r.style.getPropertyValue(d) === "" && (s.styleDiff[d] = !1);
              } else n === "open" && r.tagName === "DIALOG" && (r.matches("dialog:modal") ? s.attributes.rr_open_mode = "modal" : s.attributes.rr_open_mode = "non-modal");
            break;
          }
          case "childList": {
            if (Ie(t.target, this.blockClass, this.blockSelector, !0))
              return;
            if (t.target.tagName === "TEXTAREA") {
              this.genTextAreaValueMutation(t.target);
              return;
            }
            t.addedNodes.forEach((r) => this.genAdds(r, t.target)), t.removedNodes.forEach((r) => {
              const n = this.mirror.getId(r), i = Xt(t.target) ? this.mirror.getId(G.host(t.target)) : this.mirror.getId(t.target);
              Ie(t.target, this.blockClass, this.blockSelector, !1) || ri(r, this.mirror, this.slimDOMOptions) || !Ad(r, this.mirror) || (this.addedSet.has(r) ? (ci(this.addedSet, r), this.droppedSet.add(r)) : this.addedSet.has(t.target) && n === -1 || Ma(t.target, this.mirror) || (this.movedSet.has(r) && this.movedMap[bo(n, i)] ? ci(this.movedSet, r) : (this.removes.push({
                parentId: i,
                id: n,
                isShadow: Xt(t.target) && Kt(t.target) ? !0 : void 0
              }), zd(r, this.removesSubTreeCache))), this.mapRemoves.push(r));
            });
            break;
          }
        }
    }), N(this, "genAdds", (t, r) => {
      if (!this.processedNodeManager.inOtherBuffer(t, this) && !(this.addedSet.has(t) || this.movedSet.has(t))) {
        if (this.mirror.hasNode(t)) {
          if (ri(t, this.mirror, this.slimDOMOptions))
            return;
          this.movedSet.add(t);
          let n = null;
          r && this.mirror.hasNode(r) && (n = this.mirror.getId(r)), n && n !== -1 && (this.movedMap[bo(this.mirror.getId(t), n)] = !0);
        } else
          this.addedSet.add(t), this.droppedSet.delete(t);
        Ie(t, this.blockClass, this.blockSelector, !1) || (G.childNodes(t).forEach((n) => this.genAdds(n)), li(t) && G.childNodes(G.shadowRoot(t)).forEach((n) => {
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
function ci(e, t) {
  e.delete(t), G.childNodes(t).forEach((r) => ci(e, r));
}
function zd(e, t) {
  const r = [e];
  for (; r.length; ) {
    const n = r.pop();
    t.has(n) || (t.add(n), G.childNodes(n).forEach((i) => r.push(i)));
  }
}
function vo(e, t, r) {
  return e.size === 0 ? !1 : Fd(e, t);
}
function Fd(e, t, r) {
  const n = G.parentNode(t);
  return n ? e.has(n) : !1;
}
function wo(e, t) {
  return e.size === 0 ? !1 : Ta(e, t);
}
function Ta(e, t) {
  const r = G.parentNode(t);
  return r ? e.has(r) ? !0 : Ta(e, r) : !1;
}
let Jt;
function Ud(e) {
  Jt = e;
}
function Bd() {
  Jt = void 0;
}
const Z = (e) => Jt ? (...r) => {
  try {
    return e(...r);
  } catch (n) {
    if (Jt && Jt(n) === !0)
      return;
    throw n;
  }
} : e, xt = [];
function nr(e) {
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
function Na(e, t) {
  const r = new Dd();
  xt.push(r), r.init(e);
  const [n, i] = ka(), s = new n(
    Z(r.processMutations.bind(r))
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
function qd({
  mousemoveCb: e,
  sampling: t,
  doc: r,
  mirror: n
}) {
  if (t.mousemove === !1)
    return () => {
    };
  const i = typeof t.mousemove == "number" ? t.mousemove : 50, s = typeof t.mousemoveCallback == "number" ? t.mousemoveCallback : 500;
  let l = [], d;
  const o = er(
    Z(
      (p) => {
        const u = Date.now() - d;
        e(
          l.map((c) => (c.timeOffset -= u, c)),
          p
        ), l = [], d = null;
      }
    ),
    s
  ), h = Z(
    er(
      Z((p) => {
        const u = nr(p), { clientX: c, clientY: m } = ai(p) ? p.changedTouches[0] : p;
        d || (d = Qt()), l.push({
          x: c,
          y: m,
          id: n.getId(u),
          timeOffset: Qt() - d
        }), o(
          typeof DragEvent < "u" && p instanceof DragEvent ? K.Drag : p instanceof MouseEvent ? K.MouseMove : K.TouchMove
        );
      }),
      i,
      {
        trailing: !1
      }
    )
  ), a = [
    Oe("mousemove", h, r),
    Oe("touchmove", h, r),
    Oe("drag", h, r)
  ];
  return Z(() => {
    a.forEach((p) => p());
  });
}
function Wd({
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
  const l = s.mouseInteraction === !0 || s.mouseInteraction === void 0 ? {} : s.mouseInteraction, d = [];
  let o = null;
  const h = (a) => (p) => {
    const u = nr(p);
    if (Ie(u, n, i, !0))
      return;
    let c = null, m = a;
    if ("pointerType" in p) {
      switch (p.pointerType) {
        case "mouse":
          c = st.Mouse;
          break;
        case "touch":
          c = st.Touch;
          break;
        case "pen":
          c = st.Pen;
          break;
      }
      c === st.Touch ? Ne[a] === Ne.MouseDown ? m = "TouchStart" : Ne[a] === Ne.MouseUp && (m = "TouchEnd") : st.Pen;
    } else ai(p) && (c = st.Touch);
    c !== null ? (o = c, (m.startsWith("Touch") && c === st.Touch || m.startsWith("Mouse") && c === st.Mouse) && (c = null)) : Ne[a] === Ne.Click && (c = o, o = null);
    const f = ai(p) ? p.changedTouches[0] : p;
    if (!f)
      return;
    const g = r.getId(u), { clientX: k, clientY: b } = f;
    Z(e)({
      type: Ne[m],
      id: g,
      x: k,
      y: b,
      ...c !== null && { pointerType: c }
    });
  };
  return Object.keys(Ne).filter(
    (a) => Number.isNaN(Number(a)) && !a.endsWith("_Departed") && l[a] !== !1
  ).forEach((a) => {
    let p = Et(a);
    const u = h(a);
    if (window.PointerEvent)
      switch (Ne[a]) {
        case Ne.MouseDown:
        case Ne.MouseUp:
          p = p.replace(
            "mouse",
            "pointer"
          );
          break;
        case Ne.TouchStart:
        case Ne.TouchEnd:
          return;
      }
    d.push(Oe(p, u, t));
  }), Z(() => {
    d.forEach((a) => a());
  });
}
function Pa({
  scrollCb: e,
  doc: t,
  mirror: r,
  blockClass: n,
  blockSelector: i,
  sampling: s
}) {
  const l = Z(
    er(
      Z((d) => {
        const o = nr(d);
        if (!o || Ie(o, n, i, !0))
          return;
        const h = r.getId(o);
        if (o === t && t.defaultView) {
          const a = xa(t.defaultView);
          e({
            id: h,
            x: a.left,
            y: a.top
          });
        } else
          e({
            id: h,
            x: o.scrollLeft,
            y: o.scrollTop
          });
      }),
      s.scroll || 100
    )
  );
  return Oe("scroll", l, t);
}
function jd({ viewportResizeCb: e }, { win: t }) {
  let r = -1, n = -1;
  const i = Z(
    er(
      Z(() => {
        const s = Sa(), l = Ca();
        (r !== s || n !== l) && (e({
          width: Number(l),
          height: Number(s)
        }), r = s, n = l);
      }),
      200
    )
  );
  return Oe("resize", i, t);
}
const Hd = ["INPUT", "TEXTAREA", "SELECT"], ko = /* @__PURE__ */ new WeakMap();
function Vd({
  inputCb: e,
  doc: t,
  mirror: r,
  blockClass: n,
  blockSelector: i,
  ignoreClass: s,
  ignoreSelector: l,
  maskInputOptions: d,
  maskInputFn: o,
  sampling: h,
  userTriggeredOnInput: a
}) {
  function p(b) {
    let w = nr(b);
    const S = b.isTrusted, y = w && w.tagName;
    if (w && y === "OPTION" && (w = G.parentElement(w)), !w || !y || Hd.indexOf(y) < 0 || Ie(w, n, i, !0) || w.classList.contains(s) || l && w.matches(l))
      return;
    let v = w.value, x = !1;
    const M = Rr(w) || "";
    M === "radio" || M === "checkbox" ? x = w.checked : (d[y.toLowerCase()] || d[M]) && (v = Mr({
      element: w,
      maskInputOptions: d,
      tagName: y,
      type: M,
      value: v,
      maskInputFn: o
    })), u(
      w,
      a ? { text: v, isChecked: x, userTriggered: S } : { text: v, isChecked: x }
    );
    const L = w.name;
    M === "radio" && L && x && t.querySelectorAll(`input[type="radio"][name="${L}"]`).forEach((R) => {
      if (R !== w) {
        const B = R.value;
        u(
          R,
          a ? { text: B, isChecked: !x, userTriggered: !1 } : { text: B, isChecked: !x }
        );
      }
    });
  }
  function u(b, w) {
    const S = ko.get(b);
    if (!S || S.text !== w.text || S.isChecked !== w.isChecked) {
      ko.set(b, w);
      const y = r.getId(b);
      Z(e)({
        ...w,
        id: y
      });
    }
  }
  const m = (h.input === "last" ? ["change"] : ["input", "change"]).map(
    (b) => Oe(b, Z(p), t)
  ), f = t.defaultView;
  if (!f)
    return () => {
      m.forEach((b) => b());
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
      (b) => Vr(
        b[0],
        b[1],
        {
          set() {
            Z(p)({
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
  ), Z(() => {
    m.forEach((b) => b());
  });
}
function Lr(e) {
  const t = [];
  function r(n, i) {
    if (yr("CSSGroupingRule") && n.parentRule instanceof CSSGroupingRule || yr("CSSMediaRule") && n.parentRule instanceof CSSMediaRule || yr("CSSSupportsRule") && n.parentRule instanceof CSSSupportsRule || yr("CSSConditionRule") && n.parentRule instanceof CSSConditionRule) {
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
function ht(e, t, r) {
  let n, i;
  return e ? (e.ownerNode ? n = t.getId(e.ownerNode) : i = r.getId(e), {
    styleId: i,
    id: n
  }) : {};
}
function Gd({ styleSheetRuleCb: e, mirror: t, stylesheetManager: r }, { win: n }) {
  if (!n.CSSStyleSheet || !n.CSSStyleSheet.prototype)
    return () => {
    };
  const i = n.CSSStyleSheet.prototype.insertRule;
  n.CSSStyleSheet.prototype.insertRule = new Proxy(i, {
    apply: Z(
      (a, p, u) => {
        const [c, m] = u, { id: f, styleId: g } = ht(
          p,
          t,
          r.styleMirror
        );
        return (f && f !== -1 || g && g !== -1) && e({
          id: f,
          styleId: g,
          adds: [{ rule: c, index: m }]
        }), a.apply(p, u);
      }
    )
  }), n.CSSStyleSheet.prototype.addRule = function(a, p, u = this.cssRules.length) {
    const c = `${a} { ${p} }`;
    return n.CSSStyleSheet.prototype.insertRule.apply(this, [c, u]);
  };
  const s = n.CSSStyleSheet.prototype.deleteRule;
  n.CSSStyleSheet.prototype.deleteRule = new Proxy(s, {
    apply: Z(
      (a, p, u) => {
        const [c] = u, { id: m, styleId: f } = ht(
          p,
          t,
          r.styleMirror
        );
        return (m && m !== -1 || f && f !== -1) && e({
          id: m,
          styleId: f,
          removes: [{ index: c }]
        }), a.apply(p, u);
      }
    )
  }), n.CSSStyleSheet.prototype.removeRule = function(a) {
    return n.CSSStyleSheet.prototype.deleteRule.apply(this, [a]);
  };
  let l;
  n.CSSStyleSheet.prototype.replace && (l = n.CSSStyleSheet.prototype.replace, n.CSSStyleSheet.prototype.replace = new Proxy(l, {
    apply: Z(
      (a, p, u) => {
        const [c] = u, { id: m, styleId: f } = ht(
          p,
          t,
          r.styleMirror
        );
        return (m && m !== -1 || f && f !== -1) && e({
          id: m,
          styleId: f,
          replace: c
        }), a.apply(p, u);
      }
    )
  }));
  let d;
  n.CSSStyleSheet.prototype.replaceSync && (d = n.CSSStyleSheet.prototype.replaceSync, n.CSSStyleSheet.prototype.replaceSync = new Proxy(d, {
    apply: Z(
      (a, p, u) => {
        const [c] = u, { id: m, styleId: f } = ht(
          p,
          t,
          r.styleMirror
        );
        return (m && m !== -1 || f && f !== -1) && e({
          id: m,
          styleId: f,
          replaceSync: c
        }), a.apply(p, u);
      }
    )
  }));
  const o = {};
  br("CSSGroupingRule") ? o.CSSGroupingRule = n.CSSGroupingRule : (br("CSSMediaRule") && (o.CSSMediaRule = n.CSSMediaRule), br("CSSConditionRule") && (o.CSSConditionRule = n.CSSConditionRule), br("CSSSupportsRule") && (o.CSSSupportsRule = n.CSSSupportsRule));
  const h = {};
  return Object.entries(o).forEach(([a, p]) => {
    h[a] = {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      insertRule: p.prototype.insertRule,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      deleteRule: p.prototype.deleteRule
    }, p.prototype.insertRule = new Proxy(
      h[a].insertRule,
      {
        apply: Z(
          (u, c, m) => {
            const [f, g] = m, { id: k, styleId: b } = ht(
              c.parentStyleSheet,
              t,
              r.styleMirror
            );
            return (k && k !== -1 || b && b !== -1) && e({
              id: k,
              styleId: b,
              adds: [
                {
                  rule: f,
                  index: [
                    ...Lr(c),
                    g || 0
                    // defaults to 0
                  ]
                }
              ]
            }), u.apply(c, m);
          }
        )
      }
    ), p.prototype.deleteRule = new Proxy(
      h[a].deleteRule,
      {
        apply: Z(
          (u, c, m) => {
            const [f] = m, { id: g, styleId: k } = ht(
              c.parentStyleSheet,
              t,
              r.styleMirror
            );
            return (g && g !== -1 || k && k !== -1) && e({
              id: g,
              styleId: k,
              removes: [
                { index: [...Lr(c), f] }
              ]
            }), u.apply(c, m);
          }
        )
      }
    );
  }), Z(() => {
    n.CSSStyleSheet.prototype.insertRule = i, n.CSSStyleSheet.prototype.deleteRule = s, l && (n.CSSStyleSheet.prototype.replace = l), d && (n.CSSStyleSheet.prototype.replaceSync = d), Object.entries(o).forEach(([a, p]) => {
      p.prototype.insertRule = h[a].insertRule, p.prototype.deleteRule = h[a].deleteRule;
    });
  });
}
function _a({
  mirror: e,
  stylesheetManager: t
}, r) {
  var n, i, s;
  let l = null;
  r.nodeName === "#document" ? l = e.getId(r) : l = e.getId(G.host(r));
  const d = r.nodeName === "#document" ? (n = r.defaultView) == null ? void 0 : n.Document : (s = (i = r.ownerDocument) == null ? void 0 : i.defaultView) == null ? void 0 : s.ShadowRoot, o = d != null && d.prototype ? Object.getOwnPropertyDescriptor(
    d == null ? void 0 : d.prototype,
    "adoptedStyleSheets"
  ) : void 0;
  return l === null || l === -1 || !d || !o ? () => {
  } : (Object.defineProperty(r, "adoptedStyleSheets", {
    configurable: o.configurable,
    enumerable: o.enumerable,
    get() {
      var h;
      return (h = o.get) == null ? void 0 : h.call(this);
    },
    set(h) {
      var a;
      const p = (a = o.set) == null ? void 0 : a.call(this, h);
      if (l !== null && l !== -1)
        try {
          t.adoptStyleSheets(h, l);
        } catch {
        }
      return p;
    }
  }), Z(() => {
    Object.defineProperty(r, "adoptedStyleSheets", {
      configurable: o.configurable,
      enumerable: o.enumerable,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      get: o.get,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      set: o.set
    });
  }));
}
function Yd({
  styleDeclarationCb: e,
  mirror: t,
  ignoreCSSAttributes: r,
  stylesheetManager: n
}, { win: i }) {
  const s = i.CSSStyleDeclaration.prototype.setProperty;
  i.CSSStyleDeclaration.prototype.setProperty = new Proxy(s, {
    apply: Z(
      (d, o, h) => {
        var a;
        const [p, u, c] = h;
        if (r.has(p))
          return s.apply(o, [p, u, c]);
        const { id: m, styleId: f } = ht(
          (a = o.parentRule) == null ? void 0 : a.parentStyleSheet,
          t,
          n.styleMirror
        );
        return (m && m !== -1 || f && f !== -1) && e({
          id: m,
          styleId: f,
          set: {
            property: p,
            value: u,
            priority: c
          },
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          index: Lr(o.parentRule)
        }), d.apply(o, h);
      }
    )
  });
  const l = i.CSSStyleDeclaration.prototype.removeProperty;
  return i.CSSStyleDeclaration.prototype.removeProperty = new Proxy(l, {
    apply: Z(
      (d, o, h) => {
        var a;
        const [p] = h;
        if (r.has(p))
          return l.apply(o, [p]);
        const { id: u, styleId: c } = ht(
          (a = o.parentRule) == null ? void 0 : a.parentStyleSheet,
          t,
          n.styleMirror
        );
        return (u && u !== -1 || c && c !== -1) && e({
          id: u,
          styleId: c,
          remove: {
            property: p
          },
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          index: Lr(o.parentRule)
        }), d.apply(o, h);
      }
    )
  }), Z(() => {
    i.CSSStyleDeclaration.prototype.setProperty = s, i.CSSStyleDeclaration.prototype.removeProperty = l;
  });
}
function Xd({
  mediaInteractionCb: e,
  blockClass: t,
  blockSelector: r,
  mirror: n,
  sampling: i,
  doc: s
}) {
  const l = Z(
    (o) => er(
      Z((h) => {
        const a = nr(h);
        if (!a || Ie(a, t, r, !0))
          return;
        const { currentTime: p, volume: u, muted: c, playbackRate: m, loop: f } = a;
        e({
          type: o,
          id: n.getId(a),
          currentTime: p,
          volume: u,
          muted: c,
          playbackRate: m,
          loop: f
        });
      }),
      i.media || 500
    )
  ), d = [
    Oe("play", l(Pt.Play), s),
    Oe("pause", l(Pt.Pause), s),
    Oe("seeked", l(Pt.Seeked), s),
    Oe("volumechange", l(Pt.VolumeChange), s),
    Oe("ratechange", l(Pt.RateChange), s)
  ];
  return Z(() => {
    d.forEach((o) => o());
  });
}
function Kd({ fontCb: e, doc: t }) {
  const r = t.defaultView;
  if (!r)
    return () => {
    };
  const n = [], i = /* @__PURE__ */ new WeakMap(), s = r.FontFace;
  r.FontFace = function(o, h, a) {
    const p = new s(o, h, a);
    return i.set(p, {
      family: o,
      buffer: typeof h != "string",
      descriptors: a,
      fontSource: typeof h == "string" ? h : JSON.stringify(Array.from(new Uint8Array(h)))
    }), p;
  };
  const l = Ot(
    t.fonts,
    "add",
    function(d) {
      return function(o) {
        return setTimeout(
          Z(() => {
            const h = i.get(o);
            h && (e(h), i.delete(o));
          }),
          0
        ), d.apply(this, [o]);
      };
    }
  );
  return n.push(() => {
    r.FontFace = s;
  }), n.push(l), Z(() => {
    n.forEach((d) => d());
  });
}
function Jd(e) {
  const { doc: t, mirror: r, blockClass: n, blockSelector: i, selectionCb: s } = e;
  let l = !0;
  const d = Z(() => {
    const o = t.getSelection();
    if (!o || l && (o != null && o.isCollapsed)) return;
    l = o.isCollapsed || !1;
    const h = [], a = o.rangeCount || 0;
    for (let p = 0; p < a; p++) {
      const u = o.getRangeAt(p), { startContainer: c, startOffset: m, endContainer: f, endOffset: g } = u;
      Ie(c, n, i, !0) || Ie(f, n, i, !0) || h.push({
        start: r.getId(c),
        startOffset: m,
        end: r.getId(f),
        endOffset: g
      });
    }
    s({ ranges: h });
  });
  return d(), Oe("selectionchange", d);
}
function Zd({
  doc: e,
  customElementCb: t
}) {
  const r = e.defaultView;
  return !r || !r.customElements ? () => {
  } : Ot(
    r.customElements,
    "define",
    function(i) {
      return function(s, l, d) {
        try {
          t({
            define: {
              name: s
            }
          });
        } catch {
          console.warn(`Custom element callback failed for ${s}`);
        }
        return i.apply(this, [s, l, d]);
      };
    }
  );
}
function Qd(e, t) {
  const {
    mutationCb: r,
    mousemoveCb: n,
    mouseInteractionCb: i,
    scrollCb: s,
    viewportResizeCb: l,
    inputCb: d,
    mediaInteractionCb: o,
    styleSheetRuleCb: h,
    styleDeclarationCb: a,
    canvasMutationCb: p,
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
    t.scroll && t.scroll(...f), s(...f);
  }, e.viewportResizeCb = (...f) => {
    t.viewportResize && t.viewportResize(...f), l(...f);
  }, e.inputCb = (...f) => {
    t.input && t.input(...f), d(...f);
  }, e.mediaInteractionCb = (...f) => {
    t.mediaInteaction && t.mediaInteaction(...f), o(...f);
  }, e.styleSheetRuleCb = (...f) => {
    t.styleSheetRule && t.styleSheetRule(...f), h(...f);
  }, e.styleDeclarationCb = (...f) => {
    t.styleDeclaration && t.styleDeclaration(...f), a(...f);
  }, e.canvasMutationCb = (...f) => {
    t.canvasMutation && t.canvasMutation(...f), p(...f);
  }, e.fontCb = (...f) => {
    t.font && t.font(...f), u(...f);
  }, e.selectionCb = (...f) => {
    t.selection && t.selection(...f), c(...f);
  }, e.customElementCb = (...f) => {
    t.customElement && t.customElement(...f), m(...f);
  };
}
function eh(e, t = {}) {
  const r = e.doc.defaultView;
  if (!r)
    return () => {
    };
  Qd(e, t);
  let n, i = () => {
  };
  e.recordDOM && ([n, i] = Na(e, e.doc));
  const s = qd(e), l = Wd(e), d = Pa(e), o = jd(e, {
    win: r
  }), h = Vd(e), a = Xd(e);
  let p = () => {
  }, u = () => {
  }, c = () => {
  }, m = () => {
  };
  e.recordDOM && (p = Gd(e, { win: r }), u = _a(e, e.doc), c = Yd(e, {
    win: r
  }), e.collectFonts && (m = Kd(e)));
  const f = Jd(e), g = Zd(e), k = [];
  for (const b of e.plugins)
    k.push(
      b.observer(b.callback, r, b.options)
    );
  return Z(() => {
    xt.forEach((b) => b.reset()), n == null || n.disconnect(), i(), s(), l(), d(), o(), h(), a(), p(), u(), c(), m(), f(), g(), k.forEach((b) => b());
  });
}
function yr(e) {
  return typeof window[e] < "u";
}
function br(e) {
  return !!(typeof window[e] < "u" && // Note: Generally, this check _shouldn't_ be necessary
  // However, in some scenarios (e.g. jsdom) this can sometimes fail, so we check for it here
  window[e].prototype && "insertRule" in window[e].prototype && "deleteRule" in window[e].prototype);
}
class xo {
  constructor(t) {
    N(this, "iframeIdToRemoteIdMap", /* @__PURE__ */ new WeakMap()), N(this, "iframeRemoteIdToIdMap", /* @__PURE__ */ new WeakMap()), this.generateIdFn = t;
  }
  getId(t, r, n, i) {
    const s = n || this.getIdToRemoteIdMap(t), l = i || this.getRemoteIdToIdMap(t);
    let d = s.get(r);
    return d || (d = this.generateIdFn(), s.set(r, d), l.set(d, r)), d;
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
class th {
  constructor(t) {
    N(this, "iframes", /* @__PURE__ */ new WeakMap()), N(this, "crossOriginIframeMap", /* @__PURE__ */ new WeakMap()), N(this, "crossOriginIframeMirror", new xo(ea)), N(this, "crossOriginIframeStyleMirror"), N(this, "crossOriginIframeRootIdMap", /* @__PURE__ */ new WeakMap()), N(this, "mirror"), N(this, "mutationCb"), N(this, "wrappedEmit"), N(this, "loadListener"), N(this, "stylesheetManager"), N(this, "recordCrossOriginIframes"), this.mutationCb = t.mutationCb, this.wrappedEmit = t.wrappedEmit, this.stylesheetManager = t.stylesheetManager, this.recordCrossOriginIframes = t.recordCrossOriginIframes, this.crossOriginIframeStyleMirror = new xo(
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
      case ee.FullSnapshot: {
        this.crossOriginIframeMirror.reset(t), this.crossOriginIframeStyleMirror.reset(t), this.replaceIdOnNode(r.data.node, t);
        const i = r.data.node.id;
        return this.crossOriginIframeRootIdMap.set(t, i), this.patchRootIdOnNode(r.data.node, i), {
          timestamp: r.timestamp,
          type: ee.IncrementalSnapshot,
          data: {
            source: K.Mutation,
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
      case ee.Meta:
      case ee.Load:
      case ee.DomContentLoaded:
        return !1;
      case ee.Plugin:
        return r;
      case ee.Custom:
        return this.replaceIds(
          r.data.payload,
          t,
          ["id", "parentId", "previousId", "nextId"]
        ), r;
      case ee.IncrementalSnapshot:
        switch (r.data.source) {
          case K.Mutation:
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
          case K.Drag:
          case K.TouchMove:
          case K.MouseMove:
            return r.data.positions.forEach((i) => {
              this.replaceIds(i, t, ["id"]);
            }), r;
          case K.ViewportResize:
            return !1;
          case K.MediaInteraction:
          case K.MouseInteraction:
          case K.Scroll:
          case K.CanvasMutation:
          case K.Input:
            return this.replaceIds(r.data, t, ["id"]), r;
          case K.StyleSheetRule:
          case K.StyleDeclaration:
            return this.replaceIds(r.data, t, ["id"]), this.replaceStyleIds(r.data, t, ["styleId"]), r;
          case K.Font:
            return r;
          case K.Selection:
            return r.data.ranges.forEach((i) => {
              this.replaceIds(i, t, ["start", "end"]);
            }), r;
          case K.AdoptedStyleSheet:
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
    t.type !== Aa.Document && !t.rootId && (t.rootId = r), "childNodes" in t && t.childNodes.forEach((n) => {
      this.patchRootIdOnNode(n, r);
    });
  }
}
class rh {
  constructor(t) {
    N(this, "shadowDoms", /* @__PURE__ */ new WeakSet()), N(this, "mutationCb"), N(this, "scrollCb"), N(this, "bypassOptions"), N(this, "mirror"), N(this, "restoreHandlers", []), this.mutationCb = t.mutationCb, this.scrollCb = t.scrollCb, this.bypassOptions = t.bypassOptions, this.mirror = t.mirror, this.init();
  }
  init() {
    this.reset(), this.patchAttachShadow(Element, document);
  }
  addShadowRoot(t, r) {
    if (!Kt(t) || this.shadowDoms.has(t)) return;
    this.shadowDoms.add(t);
    const [n] = Na(
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
      Pa({
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
        this.mirror.getId(G.host(t))
      ), this.restoreHandlers.push(
        _a(
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
      Ot(
        t.prototype,
        "attachShadow",
        function(i) {
          return function(s) {
            const l = i.call(this, s), d = G.shadowRoot(this);
            return d && La(this) && n.addShadowRoot(d, r), l;
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
var Dt = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", nh = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (var vr = 0; vr < Dt.length; vr++)
  nh[Dt.charCodeAt(vr)] = vr;
var ih = function(e) {
  var t = new Uint8Array(e), r, n = t.length, i = "";
  for (r = 0; r < n; r += 3)
    i += Dt[t[r] >> 2], i += Dt[(t[r] & 3) << 4 | t[r + 1] >> 4], i += Dt[(t[r + 1] & 15) << 2 | t[r + 2] >> 6], i += Dt[t[r + 2] & 63];
  return n % 3 === 2 ? i = i.substring(0, i.length - 1) + "=" : n % 3 === 1 && (i = i.substring(0, i.length - 2) + "=="), i;
};
const So = /* @__PURE__ */ new Map();
function sh(e, t) {
  let r = So.get(e);
  return r || (r = /* @__PURE__ */ new Map(), So.set(e, r)), r.has(t) || r.set(t, []), r.get(t);
}
const $a = (e, t, r) => {
  if (!e || !(za(e, t) || typeof e == "object"))
    return;
  const n = e.constructor.name, i = sh(r, n);
  let s = i.indexOf(e);
  return s === -1 && (s = i.length, i.push(e)), s;
};
function wr(e, t, r) {
  if (e instanceof Array)
    return e.map((n) => wr(n, t, r));
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
    const n = e.constructor.name, i = ih(e);
    return {
      rr_type: n,
      base64: i
    };
  } else {
    if (e instanceof DataView)
      return {
        rr_type: e.constructor.name,
        args: [
          wr(e.buffer, t, r),
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
          args: [wr(e.data, t, r), e.width, e.height]
        };
      if (za(e, t) || typeof e == "object") {
        const n = e.constructor.name, i = $a(e, t, r);
        return {
          rr_type: n,
          index: i
        };
      }
    }
  }
  return e;
}
const Da = (e, t, r) => e.map((n) => wr(n, t, r)), za = (e, t) => !![
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
function oh(e, t, r, n) {
  const i = [], s = Object.getOwnPropertyNames(
    t.CanvasRenderingContext2D.prototype
  );
  for (const l of s)
    try {
      if (typeof t.CanvasRenderingContext2D.prototype[l] != "function")
        continue;
      const d = Ot(
        t.CanvasRenderingContext2D.prototype,
        l,
        function(o) {
          return function(...h) {
            return Ie(this.canvas, r, n, !0) || setTimeout(() => {
              const a = Da(h, t, this);
              e(this.canvas, {
                type: Wt["2D"],
                property: l,
                args: a
              });
            }, 0), o.apply(this, h);
          };
        }
      );
      i.push(d);
    } catch {
      const d = Vr(
        t.CanvasRenderingContext2D.prototype,
        l,
        {
          set(o) {
            e(this.canvas, {
              type: Wt["2D"],
              property: l,
              args: [o],
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
function ah(e) {
  return e === "experimental-webgl" ? "webgl" : e;
}
function Co(e, t, r, n) {
  const i = [];
  try {
    const s = Ot(
      e.HTMLCanvasElement.prototype,
      "getContext",
      function(l) {
        return function(d, ...o) {
          if (!Ie(this, t, r, !0)) {
            const h = ah(d);
            if ("__context" in this || (this.__context = h), n && ["webgl", "webgl2"].includes(h))
              if (o[0] && typeof o[0] == "object") {
                const a = o[0];
                a.preserveDrawingBuffer || (a.preserveDrawingBuffer = !0);
              } else
                o.splice(0, 1, {
                  preserveDrawingBuffer: !0
                });
          }
          return l.apply(this, [d, ...o]);
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
function Eo(e, t, r, n, i, s) {
  const l = [], d = Object.getOwnPropertyNames(e);
  for (const o of d)
    if (
      //prop.startsWith('get') ||  // e.g. getProgramParameter, but too risky
      ![
        "isContextLost",
        "canvas",
        "drawingBufferWidth",
        "drawingBufferHeight"
      ].includes(o)
    )
      try {
        if (typeof e[o] != "function")
          continue;
        const h = Ot(
          e,
          o,
          function(a) {
            return function(...p) {
              const u = a.apply(this, p);
              if ($a(u, s, this), "tagName" in this.canvas && !Ie(this.canvas, n, i, !0)) {
                const c = Da(p, s, this), m = {
                  type: t,
                  property: o,
                  args: c
                };
                r(this.canvas, m);
              }
              return u;
            };
          }
        );
        l.push(h);
      } catch {
        const h = Vr(e, o, {
          set(a) {
            r(this.canvas, {
              type: t,
              property: o,
              args: [a],
              setter: !0
            });
          }
        });
        l.push(h);
      }
  return l;
}
function lh(e, t, r, n) {
  const i = [];
  return typeof t.WebGLRenderingContext < "u" && i.push(
    ...Eo(
      t.WebGLRenderingContext.prototype,
      Wt.WebGL,
      e,
      r,
      n,
      t
    )
  ), typeof t.WebGL2RenderingContext < "u" && i.push(
    ...Eo(
      t.WebGL2RenderingContext.prototype,
      Wt.WebGL2,
      e,
      r,
      n,
      t
    )
  ), () => {
    i.forEach((s) => s());
  };
}
const Fa = `(function() {
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
`, Mo = typeof self < "u" && self.Blob && new Blob([Fa], { type: "text/javascript;charset=utf-8" });
function ch(e) {
  let t;
  try {
    if (t = Mo && (self.URL || self.webkitURL).createObjectURL(Mo), !t) throw "";
    const r = new Worker(t, {
      name: e == null ? void 0 : e.name
    });
    return r.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(t);
    }), r;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(Fa),
      {
        name: e == null ? void 0 : e.name
      }
    );
  } finally {
    t && (self.URL || self.webkitURL).revokeObjectURL(t);
  }
}
class uh {
  constructor(t) {
    N(this, "pendingCanvasMutations", /* @__PURE__ */ new Map()), N(this, "rafStamps", { latestId: 0, invokeId: null }), N(this, "mirror"), N(this, "mutationCb"), N(this, "resetObservers"), N(this, "frozen", !1), N(this, "locked", !1), N(this, "processMutation", (o, h) => {
      (this.rafStamps.invokeId && this.rafStamps.latestId !== this.rafStamps.invokeId || !this.rafStamps.invokeId) && (this.rafStamps.invokeId = this.rafStamps.latestId), this.pendingCanvasMutations.has(o) || this.pendingCanvasMutations.set(o, []), this.pendingCanvasMutations.get(o).push(h);
    });
    const {
      sampling: r = "all",
      win: n,
      blockClass: i,
      blockSelector: s,
      recordCanvas: l,
      dataURLOptions: d
    } = t;
    this.mutationCb = t.mutationCb, this.mirror = t.mirror, l && r === "all" && this.initCanvasMutationObserver(n, i, s), l && typeof r == "number" && this.initCanvasFPSObserver(r, n, i, s, {
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
  initCanvasFPSObserver(t, r, n, i, s) {
    const l = Co(
      r,
      n,
      i,
      !0
    ), d = /* @__PURE__ */ new Map(), o = new ch();
    o.onmessage = (m) => {
      const { id: f } = m.data;
      if (d.set(f, !1), !("base64" in m.data)) return;
      const { base64: g, type: k, width: b, height: w } = m.data;
      this.mutationCb({
        id: f,
        type: Wt["2D"],
        commands: [
          {
            property: "clearRect",
            // wipe canvas
            args: [0, 0, b, w]
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
    const h = 1e3 / t;
    let a = 0, p;
    const u = () => {
      const m = [];
      return r.document.querySelectorAll("canvas").forEach((f) => {
        Ie(f, n, i, !0) || m.push(f);
      }), m;
    }, c = (m) => {
      if (a && m - a < h) {
        p = requestAnimationFrame(c);
        return;
      }
      a = m, u().forEach(async (f) => {
        var g;
        const k = this.mirror.getId(f);
        if (d.get(k) || f.width === 0 || f.height === 0) return;
        if (d.set(k, !0), ["webgl", "webgl2"].includes(f.__context)) {
          const w = f.getContext(f.__context);
          ((g = w == null ? void 0 : w.getContextAttributes()) == null ? void 0 : g.preserveDrawingBuffer) === !1 && w.clear(w.COLOR_BUFFER_BIT);
        }
        const b = await createImageBitmap(f);
        o.postMessage(
          {
            id: k,
            bitmap: b,
            width: f.width,
            height: f.height,
            dataURLOptions: s.dataURLOptions
          },
          [b]
        );
      }), p = requestAnimationFrame(c);
    };
    p = requestAnimationFrame(c), this.resetObservers = () => {
      l(), cancelAnimationFrame(p);
    };
  }
  initCanvasMutationObserver(t, r, n) {
    this.startRAFTimestamping(), this.startPendingCanvasMutationFlusher();
    const i = Co(
      t,
      r,
      n,
      !1
    ), s = oh(
      this.processMutation.bind(this),
      t,
      r,
      n
    ), l = lh(
      this.processMutation.bind(this),
      t,
      r,
      n
    );
    this.resetObservers = () => {
      i(), s(), l();
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
      const { type: d, ...o } = l;
      return o;
    }), { type: s } = n[0];
    this.mutationCb({ id: r, type: s, commands: i }), this.pendingCanvasMutations.delete(t);
  }
}
class dh {
  constructor(t) {
    N(this, "trackedLinkElements", /* @__PURE__ */ new WeakSet()), N(this, "mutationCb"), N(this, "adoptedStyleSheetCb"), N(this, "styleMirror", new Nd()), this.mutationCb = t.mutationCb, this.adoptedStyleSheetCb = t.adoptedStyleSheetCb;
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
      let l;
      this.styleMirror.has(s) ? l = this.styleMirror.getId(s) : (l = this.styleMirror.add(s), i.push({
        styleId: l,
        rules: Array.from(s.rules || CSSRule, (d, o) => ({
          rule: Jo(d, s.href),
          index: o
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
class hh {
  constructor() {
    N(this, "nodeMap", /* @__PURE__ */ new WeakMap()), N(this, "active", !1);
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
let ge, kr, ni, Ar = !1;
try {
  if (Array.from([1], (e) => e * 2)[0] !== 2) {
    const e = document.createElement("iframe");
    document.body.appendChild(e), Array.from = ((rs = e.contentWindow) == null ? void 0 : rs.Array.from) || Array.from, document.body.removeChild(e);
  }
} catch (e) {
  console.debug("Unable to override Array.from", e);
}
const Ve = vu();
function gt(e = {}) {
  const {
    emit: t,
    checkoutEveryNms: r,
    checkoutEveryNth: n,
    blockClass: i = "rr-block",
    blockSelector: s = null,
    ignoreClass: l = "rr-ignore",
    ignoreSelector: d = null,
    maskTextClass: o = "rr-mask",
    maskTextSelector: h = null,
    inlineStylesheet: a = !0,
    maskAllInputs: p,
    maskInputOptions: u,
    slimDOMOptions: c,
    maskInputFn: m,
    maskTextFn: f,
    hooks: g,
    packFn: k,
    sampling: b = {},
    dataURLOptions: w = {},
    mousemoveWait: S,
    recordDOM: y = !0,
    recordCanvas: v = !1,
    recordCrossOriginIframes: x = !1,
    recordAfter: M = e.recordAfter === "DOMContentLoaded" ? e.recordAfter : "load",
    userTriggeredOnInput: L = !1,
    collectFonts: R = !1,
    inlineImages: B = !1,
    plugins: z,
    keepIframeSrcFn: C = () => !1,
    ignoreCSSAttributes: ke = /* @__PURE__ */ new Set([]),
    errorHandler: xe
  } = e;
  Ud(xe);
  const re = x ? window.parent === window : !0;
  let te = !1;
  if (!re)
    try {
      window.parent.document && (te = !1);
    } catch {
      te = !0;
    }
  if (re && !t)
    throw new Error("emit function is required");
  if (!re && !te)
    return () => {
    };
  S !== void 0 && b.mousemove === void 0 && (b.mousemove = S), Ve.reset();
  const he = p === !0 ? {
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
  } : u !== void 0 ? u : { password: !0 }, ye = ia(c);
  Td();
  let se, Y = 0;
  const We = (W) => {
    for (const ae of z || [])
      ae.eventProcessor && (W = ae.eventProcessor(W));
    return k && // Disable packing events which will be emitted to parent frames.
    !te && (W = k(W)), W;
  };
  ge = (W, ae) => {
    var ne;
    const ie = W;
    if (ie.timestamp = Qt(), (ne = xt[0]) != null && ne.isFrozen() && ie.type !== ee.FullSnapshot && !(ie.type === ee.IncrementalSnapshot && ie.data.source === K.Mutation) && xt.forEach((ue) => ue.unfreeze()), re)
      t == null || t(We(ie), ae);
    else if (te) {
      const ue = {
        type: "rrweb",
        event: We(ie),
        origin: window.location.origin,
        isCheckout: ae
      };
      window.parent.postMessage(ue, "*");
    }
    if (ie.type === ee.FullSnapshot)
      se = ie, Y = 0;
    else if (ie.type === ee.IncrementalSnapshot) {
      if (ie.data.source === K.Mutation && ie.data.isAttachIframe)
        return;
      Y++;
      const ue = n && Y >= n, X = r && ie.timestamp - se.timestamp > r;
      (ue || X) && kr(!0);
    }
  };
  const I = (W) => {
    ge({
      type: ee.IncrementalSnapshot,
      data: {
        source: K.Mutation,
        ...W
      }
    });
  }, Le = (W) => ge({
    type: ee.IncrementalSnapshot,
    data: {
      source: K.Scroll,
      ...W
    }
  }), Ce = (W) => ge({
    type: ee.IncrementalSnapshot,
    data: {
      source: K.CanvasMutation,
      ...W
    }
  }), Ue = (W) => ge({
    type: ee.IncrementalSnapshot,
    data: {
      source: K.AdoptedStyleSheet,
      ...W
    }
  }), me = new dh({
    mutationCb: I,
    adoptedStyleSheetCb: Ue
  }), be = new th({
    mirror: Ve,
    mutationCb: I,
    stylesheetManager: me,
    recordCrossOriginIframes: x,
    wrappedEmit: ge
  });
  for (const W of z || [])
    W.getMirror && W.getMirror({
      nodeMirror: Ve,
      crossOriginIframeMirror: be.crossOriginIframeMirror,
      crossOriginIframeStyleMirror: be.crossOriginIframeStyleMirror
    });
  const Ze = new hh();
  ni = new uh({
    recordCanvas: v,
    mutationCb: Ce,
    win: window,
    blockClass: i,
    blockSelector: s,
    mirror: Ve,
    sampling: b.canvas,
    dataURLOptions: w
  });
  const Qe = new rh({
    mutationCb: I,
    scrollCb: Le,
    bypassOptions: {
      blockClass: i,
      blockSelector: s,
      maskTextClass: o,
      maskTextSelector: h,
      inlineStylesheet: a,
      maskInputOptions: he,
      dataURLOptions: w,
      maskTextFn: f,
      maskInputFn: m,
      recordCanvas: v,
      inlineImages: B,
      sampling: b,
      slimDOMOptions: ye,
      iframeManager: be,
      stylesheetManager: me,
      canvasManager: ni,
      keepIframeSrcFn: C,
      processedNodeManager: Ze
    },
    mirror: Ve
  });
  kr = (W = !1) => {
    if (!y)
      return;
    ge(
      {
        type: ee.Meta,
        data: {
          href: window.location.href,
          width: Ca(),
          height: Sa()
        }
      },
      W
    ), me.reset(), Qe.init(), xt.forEach((ne) => ne.lock());
    const ae = Wu(document, {
      mirror: Ve,
      blockClass: i,
      blockSelector: s,
      maskTextClass: o,
      maskTextSelector: h,
      inlineStylesheet: a,
      maskAllInputs: he,
      maskTextFn: f,
      maskInputFn: m,
      slimDOM: ye,
      dataURLOptions: w,
      recordCanvas: v,
      inlineImages: B,
      onSerialize: (ne) => {
        Ra(ne, Ve) && be.addIframe(ne), Oa(ne, Ve) && me.trackLinkElement(ne), li(ne) && Qe.addShadowRoot(G.shadowRoot(ne), document);
      },
      onIframeLoad: (ne, ie) => {
        be.attachIframe(ne, ie), Qe.observeAttachShadow(ne);
      },
      onStylesheetLoad: (ne, ie) => {
        me.attachLinkElement(ne, ie);
      },
      keepIframeSrcFn: C
    });
    if (!ae)
      return console.warn("Failed to snapshot the document");
    ge(
      {
        type: ee.FullSnapshot,
        data: {
          node: ae,
          initialOffset: xa(window)
        }
      },
      W
    ), xt.forEach((ne) => ne.unlock()), document.adoptedStyleSheets && document.adoptedStyleSheets.length > 0 && me.adoptStyleSheets(
      document.adoptedStyleSheets,
      Ve.getId(document)
    );
  };
  try {
    const W = [], ae = (ie) => {
      var ue;
      return Z(eh)(
        {
          mutationCb: I,
          mousemoveCb: (X, je) => ge({
            type: ee.IncrementalSnapshot,
            data: {
              source: je,
              positions: X
            }
          }),
          mouseInteractionCb: (X) => ge({
            type: ee.IncrementalSnapshot,
            data: {
              source: K.MouseInteraction,
              ...X
            }
          }),
          scrollCb: Le,
          viewportResizeCb: (X) => ge({
            type: ee.IncrementalSnapshot,
            data: {
              source: K.ViewportResize,
              ...X
            }
          }),
          inputCb: (X) => ge({
            type: ee.IncrementalSnapshot,
            data: {
              source: K.Input,
              ...X
            }
          }),
          mediaInteractionCb: (X) => ge({
            type: ee.IncrementalSnapshot,
            data: {
              source: K.MediaInteraction,
              ...X
            }
          }),
          styleSheetRuleCb: (X) => ge({
            type: ee.IncrementalSnapshot,
            data: {
              source: K.StyleSheetRule,
              ...X
            }
          }),
          styleDeclarationCb: (X) => ge({
            type: ee.IncrementalSnapshot,
            data: {
              source: K.StyleDeclaration,
              ...X
            }
          }),
          canvasMutationCb: Ce,
          fontCb: (X) => ge({
            type: ee.IncrementalSnapshot,
            data: {
              source: K.Font,
              ...X
            }
          }),
          selectionCb: (X) => {
            ge({
              type: ee.IncrementalSnapshot,
              data: {
                source: K.Selection,
                ...X
              }
            });
          },
          customElementCb: (X) => {
            ge({
              type: ee.IncrementalSnapshot,
              data: {
                source: K.CustomElement,
                ...X
              }
            });
          },
          blockClass: i,
          ignoreClass: l,
          ignoreSelector: d,
          maskTextClass: o,
          maskTextSelector: h,
          maskInputOptions: he,
          inlineStylesheet: a,
          sampling: b,
          recordDOM: y,
          recordCanvas: v,
          inlineImages: B,
          userTriggeredOnInput: L,
          collectFonts: R,
          doc: ie,
          maskInputFn: m,
          maskTextFn: f,
          keepIframeSrcFn: C,
          blockSelector: s,
          slimDOMOptions: ye,
          dataURLOptions: w,
          mirror: Ve,
          iframeManager: be,
          stylesheetManager: me,
          shadowDomManager: Qe,
          processedNodeManager: Ze,
          canvasManager: ni,
          ignoreCSSAttributes: ke,
          plugins: ((ue = z == null ? void 0 : z.filter((X) => X.observer)) == null ? void 0 : ue.map((X) => ({
            observer: X.observer,
            options: X.options,
            callback: (je) => ge({
              type: ee.Plugin,
              data: {
                plugin: X.name,
                payload: je
              }
            })
          }))) || []
        },
        g
      );
    };
    be.addLoadListener((ie) => {
      try {
        W.push(ae(ie.contentDocument));
      } catch (ue) {
        console.warn(ue);
      }
    });
    const ne = () => {
      kr(), W.push(ae(document)), Ar = !0;
    };
    return ["interactive", "complete"].includes(document.readyState) ? ne() : (W.push(
      Oe("DOMContentLoaded", () => {
        ge({
          type: ee.DomContentLoaded,
          data: {}
        }), M === "DOMContentLoaded" && ne();
      })
    ), W.push(
      Oe(
        "load",
        () => {
          ge({
            type: ee.Load,
            data: {}
          }), M === "load" && ne();
        },
        window
      )
    )), () => {
      W.forEach((ie) => {
        try {
          ie();
        } catch (ue) {
          String(ue).toLowerCase().includes("cross-origin") || console.warn(ue);
        }
      }), Ze.destroy(), Ar = !1, Bd();
    };
  } catch (W) {
    console.warn(W);
  }
}
gt.addCustomEvent = (e, t) => {
  if (!Ar)
    throw new Error("please add custom event after start recording");
  ge({
    type: ee.Custom,
    data: {
      tag: e,
      payload: t
    }
  });
};
gt.freezePage = () => {
  xt.forEach((e) => e.freeze());
};
gt.takeFullSnapshot = (e) => {
  if (!Ar)
    throw new Error("please take full snapshot after start recording");
  kr(e);
};
gt.mirror = Ve;
var Ro;
(function(e) {
  e[e.NotStarted = 0] = "NotStarted", e[e.Running = 1] = "Running", e[e.Stopped = 2] = "Stopped";
})(Ro || (Ro = {}));
const { addCustomEvent: tp } = gt, { freezePage: rp } = gt, { takeFullSnapshot: np } = gt, ii = 2, ph = 4;
class fh {
  constructor(t) {
    or(this, "events", []);
    or(this, "lastMeta", null);
    or(this, "lastFull", null);
    this.opts = t;
  }
  push(t) {
    t.type === ph && (this.lastMeta = t), t.type === ii && (this.lastFull = t, this.events = []), this.events.push(t), this.prune();
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
    return !this.events.some((n) => n.type === ii) && this.lastFull && (this.lastMeta && t.push(this.lastMeta), t.push(this.lastFull)), [...t, ...this.events];
  }
  /** True when the buffer can produce a scrubbable replay (a full snapshot + at least one more event). */
  isPlayable() {
    const t = this.snapshot();
    return t.some((n) => n.type === ii) && t.length >= 2;
  }
  clear() {
    this.events = [], this.lastMeta = null, this.lastFull = null;
  }
}
function mh(e, t = {}) {
  const r = new fh({
    windowMs: t.windowMs ?? 6e4,
    maxEvents: t.maxEvents ?? 2e3
  }), n = t.maskAllInputs !== !1, i = t.maskText !== !1;
  let s;
  try {
    s = e({
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
        s == null || s();
      } catch {
      }
      r.clear();
    }
  };
}
const Ua = "klav-sims-live", Ba = "klav-sims-overlay", Oo = "klav-sims-ext-css";
let Fe = null, kt = null, Pe = null, zt = null;
const Tr = /* @__PURE__ */ new Map(), qe = /* @__PURE__ */ new Map();
let qa = 0, tt = !1, St = null, Ut = null, ir = !1, Re = null, Yt = null, pt = null, ft = null, Ye = null, Ct = null, Ge = null, et = null, Xe = null, Ft = null;
const Nr = /* @__PURE__ */ new Set();
function gh(e) {
  return String(e || "").trim().toLowerCase().replace(/\s+/g, " ");
}
function Wa(e, t) {
  return `${e}::${gh(t.text)}`;
}
function ja(e) {
  try {
    document.dispatchEvent(new CustomEvent("klavity:sims-live", { detail: { active: e } }));
  } catch {
  }
}
const yh = `
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
`, bh = `
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
function Io(e, t) {
  const r = e.replace("#", ""), n = (d) => parseInt(d, 16), [i, s, l] = r.length === 3 ? [n(r[0] + r[0]), n(r[1] + r[1]), n(r[2] + r[2])] : [n(r.slice(0, 2)), n(r.slice(2, 4)), n(r.slice(4, 6))];
  return `rgba(${i},${s},${l},${t})`;
}
function vh(e) {
  if (e.suggestedBug) return !0;
  const t = String(e.priority ?? "").trim().toLowerCase();
  if (t && t !== "none") return !0;
  const r = String(e.sentiment ?? "").trim().toLowerCase();
  return r ? !(/* @__PURE__ */ new Set(["positive", "satisfied", "delighted", "neutral", "none"])).has(r) : !1;
}
function ui() {
  var e, t;
  try {
    return ((t = (e = window.matchMedia) == null ? void 0 : e.call(window, "(prefers-reduced-motion: reduce)")) == null ? void 0 : t.matches) ?? !1;
  } catch {
    return !1;
  }
}
function wh(e) {
  return new Promise((t) => setTimeout(t, e));
}
function Bt(e) {
  const t = String(e.priority ?? "").trim().toLowerCase();
  return t === "high" || t === "critical" || t === "urgent" ? "HIGH" : t === "medium" || t === "med" ? "MED" : t === "low" ? "LOW" : e.suggestedBug ? "HIGH" : null;
}
const Ha = { HIGH: "h", MED: "m", LOW: "l" }, Lo = { HIGH: 0, MED: 1, LOW: 2 };
function kh(e) {
  if (!e) return !1;
  if (e === Pe || e === Fe || e.id === Ba || e.id === Ua || e.id === "klavity-widget-host") return !0;
  const t = e.classList;
  return !!t && t.contains("klav-halo");
}
function xh(e) {
  const t = [];
  for (const r of [Pe, Fe])
    r && (t.push({ el: r, vis: r.style.visibility }), r.style.visibility = "hidden");
  try {
    return e();
  } finally {
    for (const { el: r, vis: n } of t) r.style.visibility = n;
  }
}
function Va(e) {
  const t = e.targetViewport;
  return {
    scrollX: Number.isFinite(t == null ? void 0 : t.scrollX) ? Number(t.scrollX) : window.scrollX,
    scrollY: Number.isFinite(t == null ? void 0 : t.scrollY) ? Number(t.scrollY) : window.scrollY,
    width: Math.max(1, Number.isFinite(t == null ? void 0 : t.width) ? Number(t.width) : window.innerWidth),
    height: Math.max(1, Number.isFinite(t == null ? void 0 : t.height) ? Number(t.height) : window.innerHeight)
  };
}
function Ga(e, t) {
  return new DOMRect(
    t.scrollX + e.x * t.width,
    t.scrollY + e.y * t.height,
    Math.max(1, e.w * t.width),
    Math.max(1, e.h * t.height)
  );
}
function Ao(e) {
  return Math.max(0, e.width) * Math.max(0, e.height);
}
function Sh(e, t) {
  const r = Math.max(e.left, t.left), n = Math.min(e.right, t.right), i = Math.max(e.top, t.top), s = Math.min(e.bottom, t.bottom);
  return Math.max(0, n - r) * Math.max(0, s - i);
}
function Ch(e) {
  return new DOMRect(e.left + window.scrollX, e.top + window.scrollY, e.width, e.height);
}
function Ya(e) {
  if (!e || !(e instanceof HTMLElement) || e === document.body || e === document.documentElement || kh(e)) return !1;
  const t = e.getBoundingClientRect();
  if (t.width < 8 || t.height < 8) return !1;
  try {
    const r = getComputedStyle(e);
    if (r.display === "none" || r.visibility === "hidden" || Number(r.opacity) === 0) return !1;
  } catch {
  }
  return !0;
}
function Eh(e, t) {
  return xh(() => {
    const r = /* @__PURE__ */ new Set(), n = [], i = (l) => {
      let d = l;
      for (; d && d !== document.body && d !== document.documentElement; )
        !r.has(d) && Ya(d) && (r.add(d), n.push(d)), d = d.parentElement;
    }, s = typeof document.elementsFromPoint == "function" ? document.elementsFromPoint(e, t) : [document.elementFromPoint(e, t)].filter(Boolean);
    for (const l of s) i(l);
    return n;
  });
}
function Mh(e, t) {
  const r = Va(t), n = Ga(e, r), i = Math.max(2, Math.min(window.innerWidth - 2, n.left + n.width / 2 - window.scrollX)), s = Math.max(2, Math.min(window.innerHeight - 2, n.top + n.height / 2 - window.scrollY)), l = Eh(i, s);
  if (!l.length) return null;
  const d = Math.max(1, Ao(n));
  let o = null, h = -1 / 0;
  for (const a of l) {
    const p = Ch(a.getBoundingClientRect()), u = Sh(p, n);
    if (u <= 0) continue;
    const c = Math.max(1, Ao(p)), m = u / d, f = Math.max(0, (c - u) / c), g = a.tagName.toLowerCase(), k = /^(button|a|input|textarea|select|label|section|article|nav|header|footer|main|form)$/.test(g) ? 0.18 : 0, b = c > window.innerWidth * window.innerHeight * 0.92 ? 0.8 : 0, w = m - f * 0.35 + k - b;
    w > h && (o = a, h = w);
  }
  return o ?? l[0] ?? null;
}
async function Rh(e, t) {
  if (e >= window.scrollX + 80 && e <= window.scrollX + window.innerWidth - 80 && t >= window.scrollY + 80 && t <= window.scrollY + window.innerHeight - 80) return;
  const i = Math.max(0, document.documentElement.scrollHeight - window.innerHeight), s = Math.max(0, document.documentElement.scrollWidth - window.innerWidth), l = Math.max(0, Math.min(i, t - window.innerHeight * 0.38)), d = Math.max(0, Math.min(s, e - window.innerWidth * 0.45));
  try {
    window.scrollTo({ top: l, left: d, behavior: ui() ? "auto" : "smooth" });
  } catch {
    window.scrollTo(d, l);
  }
  await wh(ui() ? 80 : 520);
}
const Oh = /* @__PURE__ */ new Set([
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
function Ih(e) {
  const t = /* @__PURE__ */ new Set();
  return String(e || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((r) => r.length < 4 || Oh.has(r) || t.has(r) ? !1 : (t.add(r), !0));
}
function Lh(e) {
  const t = Ih(e.text);
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
  for (const l of s) {
    if (!Ya(l)) continue;
    const d = l.getBoundingClientRect(), o = [
      l.textContent || "",
      l.getAttribute("aria-label") || "",
      l.getAttribute("title") || "",
      l.getAttribute("placeholder") || "",
      l.getAttribute("data-testid") || "",
      l.id || "",
      typeof l.className == "string" ? l.className : ""
    ].join(" ").toLowerCase();
    if (!o.trim()) continue;
    const h = t.reduce((f, g) => f + (o.includes(g) ? 1 : 0), 0);
    if (!h) continue;
    const a = l.tagName.toLowerCase(), p = /^(button|a|input|textarea|select|label|h1|h2|h3|section|article|nav|header|footer|main|form)$/.test(a) ? 0.6 : 0, c = Math.max(1, d.width * d.height) > window.innerWidth * window.innerHeight * 0.85 ? 1.1 : 0, m = h / t.length + p - c;
    m > i && (n = l, i = m);
  }
  return n;
}
async function Ah(e, t = {}) {
  if (e.region) {
    const r = Va(e), n = Ga(e.region, r);
    t.scroll !== !1 && await Rh(n.left + n.width / 2, n.top + n.height / 2);
    const i = Mh(e.region, e);
    if (i) return i;
  }
  return Lh(e);
}
function Th() {
  if (Fe && kt) return kt;
  Fe = document.createElement("div"), Fe.id = Ua, Fe.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;", kt = Fe.attachShadow({ mode: "open" }), Bc(kt);
  const e = document.createElement("style");
  return e.textContent = yh, kt.appendChild(e), document.body.appendChild(Fe), kt;
}
function Xa() {
  if (Pe) return Pe;
  if (!document.getElementById(Oo)) {
    const e = document.createElement("style");
    e.id = Oo, e.textContent = bh, document.head.appendChild(e);
  }
  return Pe = document.createElement("div"), Pe.id = Ba, Pe.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;z-index:2147483640;pointer-events:none;overflow:visible;", document.body.appendChild(Pe), Pe;
}
function Ka(e, t) {
  return Fc({
    name: e.name,
    initials: e.initials,
    photoUrl: e.photoUrl,
    color: e.accent,
    animate: !1,
    legs: !0,
    size: t
  });
}
function Nh(e, t = [], r = {}) {
  if (typeof document > "u") return;
  hi();
  const n = Th();
  Xa(), zt = new AbortController();
  const i = e === "all" ? t : t.filter((p) => e.includes(p.id));
  if (!i.length) {
    console.warn("[KlavitySims] deploy(): no matching Sims — panel not mounted."), hi();
    return;
  }
  i.slice(0, 8).forEach((p) => {
    const u = p.accent || "#6366f1", c = p.initials || p.name.slice(0, 2).toUpperCase();
    Tr.set(p.id, { simId: p.id, accent: u, initials: c, name: p.name, photoUrl: p.photoUrl });
  });
  const s = document.createElement("div");
  s.className = "ksl-root", n.appendChild(s), Xe = document.createElement("div"), Xe.className = "ksl-sr", Xe.id = "ksl-announcer", Xe.setAttribute("aria-live", "polite"), Xe.setAttribute("aria-atomic", "true"), s.appendChild(Xe), Re = document.createElement("button"), Re.type = "button", Re.className = "ksl-launcher", Re.setAttribute("aria-label", "Open Sims feedback panel"), Re.addEventListener("click", () => Ph());
  const l = document.createElement("span");
  l.className = "ksl-pill", Yt = document.createElement("span"), Yt.className = "ksl-pill-avatars", pt = document.createElement("span"), pt.className = "ksl-pill-txt", l.append(Yt, pt), ft = document.createElement("span"), ft.className = "ksl-pill-badge", ft.hidden = !0, Re.append(l, ft), s.appendChild(Re), i.slice(0, 3).forEach((p) => {
    const u = Tr.get(p.id);
    u && Yt.appendChild(Ka(u, 26));
  }), Ye = document.createElement("section"), Ye.className = "ksl-panel", Ye.setAttribute("aria-label", "Sims feedback"), Ye.setAttribute("role", "dialog");
  const d = document.createElement("div");
  d.className = "ksl-head";
  const o = document.createElement("div");
  o.className = "ksl-title-row";
  const h = document.createElement("div");
  h.className = "ksl-title", h.textContent = "Sims feedback";
  const a = document.createElement("button");
  a.type = "button", a.className = "ksl-icon-btn", a.title = "Minimize", a.setAttribute("aria-label", "Minimize Sims feedback panel"), a.innerHTML = J("x", { size: 15 }), a.addEventListener("click", () => To()), o.append(h, a), Ct = document.createElement("div"), Ct.className = "ksl-count", Ge = document.createElement("div"), Ge.className = "ksl-chips", d.append(o, Ct, Ge), et = document.createElement("div"), et.className = "ksl-list", et.setAttribute("role", "list"), Ye.append(d, et), s.appendChild(Ye), document.addEventListener("keydown", (p) => {
    p.key === "Escape" && tt && To();
  }, { signal: zt.signal }), ja(!0), Ht();
}
function Ja(e) {
  ir = e, Re == null || Re.classList.toggle("is-reviewing", e), Ht(), tt && jt();
}
function Ph() {
  !Ye || !Re || (tt = !0, Ye.classList.add("is-open"), Re.hidden = !0, jt());
}
function To() {
  !Ye || !Re || (tt = !1, Ye.classList.remove("is-open"), Re.hidden = !1, Ht());
}
function Za() {
  const e = Array.from(qe.values()), t = new Set(e.map((n) => n.entry.simId)), r = e.filter((n) => Bt(n.obs) === "HIGH").length;
  return { total: e.length, sims: t.size, high: r };
}
function Ht() {
  const e = Za();
  pt && (ir && e.total === 0 ? pt.innerHTML = "Your Sims are reviewing…" : e.total === 0 ? pt.innerHTML = "Sims are watching this page" : pt.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from your Sims`), ft && (ft.hidden = e.high === 0, ft.textContent = `${e.high} high`), tt && Qa(e);
}
function Qa(e) {
  Ct && (e.total === 0 ? Ct.innerHTML = ir ? "Your Sims are reviewing this page…" : "No findings yet — your Sims are watching." : Ct.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from <b>${e.sims}</b> Sim${e.sims === 1 ? "" : "s"}` + (e.high > 0 ? ` · <span class="ksl-hi">${e.high} high</span>` : "")), _h();
}
function _h() {
  if (!Ge) return;
  const e = Array.from(qe.values());
  if (Ge.hidden = e.length === 0, Ge.textContent = "", !e.length) return;
  const t = document.createElement("span");
  t.className = "ksl-chips-label", t.textContent = "Sim", Ge.appendChild(t);
  const r = /* @__PURE__ */ new Map();
  e.forEach((i) => {
    const s = r.get(i.entry.simId) ?? { entry: i.entry, n: 0 };
    s.n += 1, r.set(i.entry.simId, s);
  }), r.forEach(({ entry: i, n: s }) => {
    const l = document.createElement("button");
    l.type = "button", l.className = "ksl-chip" + (St === i.simId ? " is-on" : ""), l.setAttribute("aria-pressed", String(St === i.simId));
    const d = document.createElement("span");
    d.className = "ksl-dot", d.style.background = i.accent, l.append(d, document.createTextNode(`${i.initials} · ${s}`)), l.addEventListener("click", () => {
      St = St === i.simId ? null : i.simId, jt();
    }), Ge.appendChild(l);
  });
  const n = document.createElement("span");
  n.className = "ksl-chips-label", n.style.marginLeft = "6px", n.textContent = "Priority", Ge.appendChild(n), ["HIGH", "MED", "LOW"].forEach((i) => {
    const s = e.filter((o) => Bt(o.obs) === i).length;
    if (!s) return;
    const l = document.createElement("button");
    l.type = "button";
    const d = Ut === i;
    l.className = "ksl-chip" + (d ? ` sev-on-${Ha[i]}` : ""), l.setAttribute("aria-pressed", String(d)), l.textContent = `${i} · ${s}`, l.addEventListener("click", () => {
      Ut = Ut === i ? null : i, jt();
    }), Ge.appendChild(l);
  });
}
function $h() {
  return Array.from(qe.values()).filter((e) => !St || e.entry.simId === St).filter((e) => !Ut || Bt(e.obs) === Ut).sort((e, t) => {
    const r = Bt(e.obs), n = Bt(t.obs), i = r ? Lo[r] : 3, s = n ? Lo[n] : 3;
    return i - s;
  });
}
function Dh(e) {
  const { entry: t, obs: r } = e, n = Bt(r), i = document.createElement("div");
  i.className = "ksl-row", i.setAttribute("role", "listitem"), i.dataset.id = e.id, i.style.borderLeftColor = t.accent;
  const s = document.createElement("div");
  s.className = "ksl-r-head", s.appendChild(Ka(t, 26));
  const l = document.createElement("span");
  l.className = "ksl-r-name", l.style.color = t.accent, l.textContent = t.name, s.appendChild(l);
  const d = String(r.sentiment ?? "").trim();
  if (d) {
    const m = document.createElement("span");
    m.className = "ksl-r-sent", m.textContent = d, s.appendChild(m);
  }
  if (n) {
    const m = document.createElement("span");
    m.className = `ksl-sev ${Ha[n]}`, m.setAttribute("aria-label", `Priority: ${n}`), m.textContent = n, s.appendChild(m);
  }
  i.appendChild(s);
  const o = document.createElement("div");
  o.className = "ksl-r-obs", o.textContent = r.text || "", i.appendChild(o);
  const h = document.createElement("button");
  h.type = "button", h.className = "ksl-r-expand", h.textContent = "Show more", h.addEventListener("click", () => {
    const m = i.classList.toggle("is-expanded");
    h.textContent = m ? "Show less" : "Show more";
  }), i.appendChild(h);
  const a = document.createElement("div");
  a.className = "ksl-r-actions";
  const p = document.createElement("button");
  p.type = "button", p.className = "ksl-r-act track", p.innerHTML = J("bug", { size: 12 }) + " Track as Bug", p.setAttribute("aria-label", `Track feedback from ${t.name} as a bug`), p.addEventListener("click", () => {
    var m;
    (m = xr.onTriage) == null || m.call(xr, r, t.name), No(e.id);
  });
  const u = document.createElement("button");
  u.type = "button", u.className = "ksl-r-act jump", u.innerHTML = J("map-pin", { size: 12 }) + " Jump to on page", u.setAttribute("aria-label", `Jump to where ${t.name} flagged this`), u.addEventListener("click", () => {
    Fh(e.id);
  });
  const c = document.createElement("button");
  return c.type = "button", c.className = "ksl-r-act dismiss", c.textContent = "Dismiss", c.setAttribute("aria-label", `Dismiss feedback from ${t.name}`), c.addEventListener("click", () => {
    No(e.id);
  }), a.append(p, u, c), i.appendChild(a), i;
}
function zh(e) {
  e.querySelectorAll(".ksl-row").forEach((t) => {
    const r = t.querySelector(".ksl-r-obs");
    r && r.scrollHeight - r.clientHeight > 4 && t.classList.add("is-clamped");
  });
}
function jt() {
  if (!et || !tt) {
    Ht();
    return;
  }
  const e = Za();
  Qa(e);
  const t = $h();
  if (et.textContent = "", !t.length) {
    const n = document.createElement("div");
    n.className = "ksl-empty";
    const i = qe.size > 0;
    if (ir && !i) {
      const s = document.createElement("div");
      s.className = "ksl-empty-title", s.textContent = "Your Sims are reviewing this page…";
      const l = document.createElement("div");
      l.textContent = "Findings will appear here as they spot things.";
      const d = document.createElement("div");
      d.className = "ksl-shimmer", n.append(s, l, d);
    } else if (i)
      n.textContent = "No findings match these filters.";
    else {
      const s = document.createElement("div");
      s.className = "ksl-empty-title", s.textContent = "No findings yet";
      const l = document.createElement("div");
      l.textContent = "Your Sims are watching this page as a first-time customer would.", n.append(s, l);
    }
    et.appendChild(n), qe.forEach((s) => {
      s.rowEl = null;
    });
    return;
  }
  t.forEach((n) => {
    const i = Dh(n);
    n.rowEl = i, et.appendChild(i);
  });
  const r = new Set(t.map((n) => n.id));
  qe.forEach((n) => {
    r.has(n.id) || (n.rowEl = null);
  }), zh(et);
}
function di() {
  Ft == null || Ft(), Ft = null;
}
async function Fh(e) {
  const t = qe.get(e);
  if (!t) return;
  const r = await Ah(t.obs, { scroll: !0 });
  !r || !Pe || Uh(r, t.entry.accent);
}
function Uh(e, t) {
  di();
  const r = Xa(), n = document.createElement("div");
  n.className = "klav-halo", n.style.borderColor = t, n.style.boxShadow = `0 0 0 4px ${Io(t, 0.16)},0 0 24px ${Io(t, 0.2)}`, r.appendChild(n);
  const i = new AbortController(), s = () => {
    const h = e.getBoundingClientRect(), a = h.width > 0 && h.height > 0 && h.bottom > 0 && h.right > 0 && h.top < window.innerHeight && h.left < window.innerWidth;
    n.style.display = a ? "" : "none", a && (n.style.left = `${h.left - 5}px`, n.style.top = `${h.top - 5}px`, n.style.width = `${h.width + 10}px`, n.style.height = `${h.height + 10}px`);
  }, l = () => requestAnimationFrame(s);
  s(), window.addEventListener("scroll", l, { passive: !0, signal: i.signal }), window.addEventListener("resize", l, { signal: i.signal });
  const d = setTimeout(() => {
    n.style.opacity = "0", n.style.transition = "opacity .3s ease", setTimeout(() => {
      Ft === o && di();
    }, 320);
  }, 3200), o = () => {
    clearTimeout(d), i.abort(), n.remove();
  };
  Ft = o;
}
function Bh(e, t) {
  const r = `f_${e.simId}_${++qa}`;
  qe.set(r, { id: r, entry: e, obs: t, rowEl: null }), tt ? jt() : Ht(), Xe && (Xe.textContent = "", requestAnimationFrame(() => {
    Xe && (Xe.textContent = `${e.name}: ${t.text || ""}`);
  }));
}
function qh(e) {
  const t = qe.get(e);
  if (!t) return;
  const r = () => {
    qe.delete(e), tt ? jt() : Ht();
  };
  t.rowEl && tt ? (t.rowEl.classList.add("is-removing"), setTimeout(r, ui() ? 0 : 300)) : r();
}
function No(e) {
  const t = qe.get(e);
  t && (Nr.add(Wa(t.entry.simId, t.obs)), qh(e));
}
function Wh(e, t, r) {
  if (!Fe) return;
  const n = Tr.get(e);
  if (!n) {
    console.warn(`[KlavitySims] renderFeedback: simId "${e}" not registered`);
    return;
  }
  if (r.length) {
    Ja(!1);
    for (const i of r) {
      if (!vh(i)) continue;
      const s = Wa(e, i);
      Nr.has(s) || (Nr.add(s), Bh(n, i));
    }
  }
}
function hi() {
  di(), qe.clear(), qa = 0, Tr.clear(), Nr.clear(), tt = !1, St = null, Ut = null, ir = !1, zt == null || zt.abort(), zt = null, Re = null, Yt = null, pt = null, ft = null, Ye = null, Ct = null, Ge = null, et = null, Xe = null, Pe == null || Pe.remove(), Pe = null, Fe == null || Fe.remove(), Fe = null, kt = null, ja(!1);
}
const xr = {
  deploy: Nh,
  setReviewing: Ja,
  renderFeedback: Wh,
  undeploy: hi,
  onTriage: null
};
function jh() {
  typeof window > "u" || window.KlavitySims || (window.KlavitySims = xr);
}
typeof window < "u" && jh();
const Po = "klav-ao-css", Hh = "klav-ao-overlay";
function Vh(e, t, r, n, i, s = 10) {
  const o = !(e.y - r - 14 >= s), h = o ? e.y + e.h + 14 : e.y - r - 14, a = Math.max(s, Math.min(h, i - r - s));
  return { left: Math.max(s, Math.min(e.x, n - t - s)), top: a, below: o };
}
const Gh = `
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
let wt = null, Yh = 1;
const Pr = /* @__PURE__ */ new Map();
function _o(e, t) {
  const r = e.replace("#", ""), n = (d) => parseInt(d, 16), [i, s, l] = r.length === 3 ? [n(r[0] + r[0]), n(r[1] + r[1]), n(r[2] + r[2])] : [n(r.slice(0, 2)), n(r.slice(2, 4)), n(r.slice(4, 6))];
  return `rgba(${i},${s},${l},${t})`;
}
function Xh() {
  if (wt) return wt;
  if (!document.getElementById(Po)) {
    const e = document.createElement("style");
    e.id = Po, e.textContent = Gh, document.head.appendChild(e);
  }
  return wt = document.createElement("div"), wt.id = Hh, wt.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;pointer-events:none;overflow:visible;z-index:2147483640;", document.body.appendChild(wt), wt;
}
function ip(e, t, r = {}) {
  const n = Xh(), i = r.color ?? "#6366f1", s = `klav-ao-${Yh++}`, l = 5, d = document.createElement("div");
  d.className = "klav-ao-halo", d.dataset.aoId = s, d.style.left = e.x - l + "px", d.style.top = e.y - l + "px", d.style.width = e.w + l * 2 + "px", d.style.height = e.h + l * 2 + "px", d.style.borderColor = i, d.style.boxShadow = `0 0 0 4px ${_o(i, 0.14)},0 0 24px ${_o(i, 0.18)}`, n.appendChild(d);
  let o = null;
  if (t) {
    const p = { x: e.x - l, y: e.y - l, w: e.w + l * 2, h: e.h + l * 2 }, { left: u, top: c, below: m } = Vh(
      p,
      224,
      96,
      window.innerWidth,
      window.innerHeight
    );
    o = document.createElement("div"), o.className = "klav-ao-pin" + (m ? " tail-top" : ""), o.dataset.aoId = s, o.style.borderLeftColor = i, o.style.left = u + "px", o.style.top = c + "px", o.setAttribute("role", "status"), o.setAttribute("aria-label", `Annotation: ${t}`);
    const f = document.createElement("div");
    f.className = "klav-ao-hd";
    const g = document.createElement("span");
    g.className = "klav-ao-lbl", g.style.color = i, g.textContent = t, f.appendChild(g);
    const k = r.priority ?? r.severity;
    if (k) {
      const w = k === "medium" ? " sev-m" : k === "low" ? " sev-l" : "", S = document.createElement("span");
      S.className = `klav-ao-sev${w}`, S.textContent = k, f.appendChild(S);
    }
    const b = document.createElement("button");
    b.className = "klav-ao-dismiss", b.textContent = "Dismiss", b.addEventListener("click", () => el(s)), o.appendChild(f), o.appendChild(b), n.appendChild(o);
  }
  return Pr.set(s, { halo: d, pin: o }), s;
}
function el(e) {
  const t = Pr.get(e);
  if (!t) return;
  Pr.delete(e);
  const { halo: r, pin: n } = t;
  n ? (n.classList.add("is-out"), r.style.animation = "klav-ao-pin-out .22s ease-in forwards", setTimeout(() => {
    n.remove(), r.remove();
  }, 240)) : r.remove();
}
function sp() {
  for (const e of [...Pr.keys()]) el(e);
}
let tl = Tt;
const rl = { consoleErrors: [], networkFailures: [] };
let nl, il, qt = null;
function sl(e) {
  const t = {};
  for (const [r, n] of Object.entries(e))
    n != null && (t[String(r).slice(0, 64)] = String(n).slice(0, 1e3));
  return t;
}
async function $o() {
  return cc(document.body, {
    cacheBust: !0,
    pixelRatio: 1,
    skipFonts: !0,
    filter: (e) => {
      if (e.id === "klavity-sdk-host") return !1;
      if (e.nodeName === "IMG") {
        const t = e.src ?? "";
        if (t && !t.startsWith(window.location.origin) && !t.startsWith("data:")) return !1;
      }
      return !0;
    }
  });
}
function Kh() {
  return bc(rl, { identity: nl, metadata: il });
}
async function Jh(e) {
  return hc(
    { type: e.type, description: e.description, context: e.context, screenshots: e.screenshots, replayEvents: e.replayEvents },
    tl,
    { jira: Wc, linear: jc, github: Hc, plane: Vc, backend: Yc }
  );
}
function Pi(e = "bug") {
  const t = Ac(e, {
    onCaptureFull: $o,
    onSubmit: async (r) => Jh({
      type: r.type,
      description: r.description,
      context: Kh(),
      screenshots: r.screenshots,
      replayEvents: (qt == null ? void 0 : qt.getEvents()) ?? []
    })
  });
  setTimeout(async () => {
    try {
      const r = await $o();
      t.addScreenshot(r);
    } catch {
    }
  }, 200);
}
function Zh() {
  vc(rl, { consoleLevels: !0 });
}
function ol(e) {
  nl = e ? sl(e) : void 0;
}
function al(e) {
  il = e ? sl(e) : void 0;
}
function Qh() {
  document.addEventListener("contextmenu", (e) => {
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
      var s;
      const i = (s = n.target.closest("[data-action]")) == null ? void 0 : s.getAttribute("data-action");
      t.remove(), document.removeEventListener("click", r), i && Pi(i);
    }), setTimeout(() => document.addEventListener("click", r), 0);
  });
}
function ll(e = {}) {
  if (tl = {
    ...Tt,
    ...e,
    jira: { ...Tt.jira, ...e.jira },
    linear: { ...Tt.linear, ...e.linear },
    github: { ...Tt.github, ...e.github },
    plane: { ...Tt.plane, ...e.plane }
  }, Zh(), Qh(), !qt)
    try {
      qt = mh(gt);
    } catch {
      qt = null;
    }
}
typeof window < "u" && (window.KlavitySnap = { init: ll, openModal: Pi, identify: ol, setMetadata: al });
const op = { init: ll, openModal: Pi, identify: ol, setMetadata: al };
export {
  xr as KlavitySims,
  xr as SimsLive,
  el as clearAnnotation,
  sp as clearAnnotations,
  op as default,
  ol as identify,
  ll as init,
  jh as installKlavitySims,
  Pi as openModal,
  al as setMetadata,
  ip as showAnnotation
};
