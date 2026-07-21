var wl = Object.defineProperty;
var kl = (e, t, r) => t in e ? wl(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var ur = (e, t, r) => kl(e, typeof t != "symbol" ? t + "" : t, r);
function xl(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i))
    return e;
  const r = document.implementation.createHTMLDocument(), n = r.createElement("base"), i = r.createElement("a");
  return r.head.appendChild(n), r.body.appendChild(i), t && (n.href = t), i.href = e, i.href;
}
const Sl = /* @__PURE__ */ (() => {
  let e = 0;
  const t = () => (
    // eslint-disable-next-line no-bitwise
    `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4)
  );
  return () => (e += 1, `u${t()}${e}`);
})();
function gt(e) {
  const t = [];
  for (let r = 0, n = e.length; r < n; r++)
    t.push(e[r]);
  return t;
}
let Pt = null;
function qo(e = {}) {
  return Pt || (e.includeStyleProperties ? (Pt = e.includeStyleProperties, Pt) : (Pt = gt(window.getComputedStyle(document.documentElement)), Pt));
}
function Rr(e, t) {
  const n = (e.ownerDocument.defaultView || window).getComputedStyle(e).getPropertyValue(t);
  return n ? parseFloat(n.replace("px", "")) : 0;
}
function Cl(e) {
  const t = Rr(e, "border-left-width"), r = Rr(e, "border-right-width");
  return e.clientWidth + t + r;
}
function El(e) {
  const t = Rr(e, "border-top-width"), r = Rr(e, "border-bottom-width");
  return e.clientHeight + t + r;
}
function Wo(e, t = {}) {
  const r = t.width || Cl(e), n = t.height || El(e);
  return { width: r, height: n };
}
function Ml() {
  let e, t;
  try {
    t = process;
  } catch {
  }
  const r = t && t.env ? t.env.devicePixelRatio : null;
  return r && (e = parseInt(r, 10), Number.isNaN(e) && (e = 1)), e || window.devicePixelRatio || 1;
}
const Fe = 16384;
function Rl(e) {
  (e.width > Fe || e.height > Fe) && (e.width > Fe && e.height > Fe ? e.width > e.height ? (e.height *= Fe / e.width, e.width = Fe) : (e.width *= Fe / e.height, e.height = Fe) : e.width > Fe ? (e.height *= Fe / e.width, e.width = Fe) : (e.width *= Fe / e.height, e.height = Fe));
}
function Or(e) {
  return new Promise((t, r) => {
    const n = new Image();
    n.onload = () => {
      n.decode().then(() => {
        requestAnimationFrame(() => t(n));
      });
    }, n.onerror = r, n.crossOrigin = "anonymous", n.decoding = "async", n.src = e;
  });
}
async function Ol(e) {
  return Promise.resolve().then(() => new XMLSerializer().serializeToString(e)).then(encodeURIComponent).then((t) => `data:image/svg+xml;charset=utf-8,${t}`);
}
async function Il(e, t, r) {
  const n = "http://www.w3.org/2000/svg", i = document.createElementNS(n, "svg"), s = document.createElementNS(n, "foreignObject");
  return i.setAttribute("width", `${t}`), i.setAttribute("height", `${r}`), i.setAttribute("viewBox", `0 0 ${t} ${r}`), s.setAttribute("width", "100%"), s.setAttribute("height", "100%"), s.setAttribute("x", "0"), s.setAttribute("y", "0"), s.setAttribute("externalResourcesRequired", "true"), i.appendChild(s), s.appendChild(e), Ol(i);
}
const _e = (e, t) => {
  if (e instanceof t)
    return !0;
  const r = Object.getPrototypeOf(e);
  return r === null ? !1 : r.constructor.name === t.name || _e(r, t);
};
function Ll(e) {
  const t = e.getPropertyValue("content");
  return `${e.cssText} content: '${t.replace(/'|"/g, "")}';`;
}
function Al(e, t) {
  return qo(t).map((r) => {
    const n = e.getPropertyValue(r), i = e.getPropertyPriority(r);
    return `${r}: ${n}${i ? " !important" : ""};`;
  }).join(" ");
}
function Tl(e, t, r, n) {
  const i = `.${e}:${t}`, s = r.cssText ? Ll(r) : Al(r, n);
  return document.createTextNode(`${i}{${s}}`);
}
function ji(e, t, r, n) {
  const i = window.getComputedStyle(e, r), s = i.getPropertyValue("content");
  if (s === "" || s === "none")
    return;
  const l = Sl();
  try {
    t.className = `${t.className} ${l}`;
  } catch {
    return;
  }
  const d = document.createElement("style");
  d.appendChild(Tl(l, r, i, n)), t.appendChild(d);
}
function Pl(e, t, r) {
  ji(e, t, ":before", r), ji(e, t, ":after", r);
}
const Hi = "application/font-woff", Vi = "image/jpeg", Nl = {
  woff: Hi,
  woff2: Hi,
  ttf: "application/font-truetype",
  eot: "application/vnd.ms-fontobject",
  png: "image/png",
  jpg: Vi,
  jpeg: Vi,
  gif: "image/gif",
  tiff: "image/tiff",
  svg: "image/svg+xml",
  webp: "image/webp"
};
function $l(e) {
  const t = /\.([^./]*?)$/g.exec(e);
  return t ? t[1] : "";
}
function yi(e) {
  const t = $l(e).toLowerCase();
  return Nl[t] || "";
}
function _l(e) {
  return e.split(/,/)[1];
}
function ci(e) {
  return e.search(/^(data:)/) !== -1;
}
function Dl(e, t) {
  return `data:${t};base64,${e}`;
}
async function jo(e, t, r) {
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
const Qr = {};
function zl(e, t, r) {
  let n = e.replace(/\?.*/, "");
  return r && (n = e), /ttf|otf|eot|woff2?/i.test(n) && (n = n.replace(/.*\//, "")), t ? `[${t}]${n}` : n;
}
async function bi(e, t, r) {
  const n = zl(e, t, r.includeQueryParams);
  if (Qr[n] != null)
    return Qr[n];
  r.cacheBust && (e += (/\?/.test(e) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
  let i;
  try {
    const s = await jo(e, r.fetchRequestInit, ({ res: l, result: d }) => (t || (t = l.headers.get("Content-Type") || ""), _l(d)));
    i = Dl(s, t);
  } catch (s) {
    i = r.imagePlaceholder || "";
    let l = `Failed to fetch resource: ${e}`;
    s && (l = typeof s == "string" ? s : s.message), l && console.warn(l);
  }
  return Qr[n] = i, i;
}
async function Fl(e) {
  const t = e.toDataURL();
  return t === "data:," ? e.cloneNode(!1) : Or(t);
}
async function Ul(e, t) {
  if (e.currentSrc) {
    const s = document.createElement("canvas"), l = s.getContext("2d");
    s.width = e.clientWidth, s.height = e.clientHeight, l == null || l.drawImage(e, 0, 0, s.width, s.height);
    const d = s.toDataURL();
    return Or(d);
  }
  const r = e.poster, n = yi(r), i = await bi(r, n, t);
  return Or(i);
}
async function Bl(e, t) {
  var r;
  try {
    if (!((r = e == null ? void 0 : e.contentDocument) === null || r === void 0) && r.body)
      return await Fr(e.contentDocument.body, t, !0);
  } catch {
  }
  return e.cloneNode(!1);
}
async function ql(e, t) {
  return _e(e, HTMLCanvasElement) ? Fl(e) : _e(e, HTMLVideoElement) ? Ul(e, t) : _e(e, HTMLIFrameElement) ? Bl(e, t) : e.cloneNode(Ho(e));
}
const Wl = (e) => e.tagName != null && e.tagName.toUpperCase() === "SLOT", Ho = (e) => e.tagName != null && e.tagName.toUpperCase() === "SVG";
async function jl(e, t, r) {
  var n, i;
  if (Ho(t))
    return t;
  let s = [];
  return Wl(e) && e.assignedNodes ? s = gt(e.assignedNodes()) : _e(e, HTMLIFrameElement) && (!((n = e.contentDocument) === null || n === void 0) && n.body) ? s = gt(e.contentDocument.body.childNodes) : s = gt(((i = e.shadowRoot) !== null && i !== void 0 ? i : e).childNodes), s.length === 0 || _e(e, HTMLVideoElement) || await s.reduce((l, d) => l.then(() => Fr(d, r)).then((o) => {
    o && t.appendChild(o);
  }), Promise.resolve()), t;
}
function Hl(e, t, r) {
  const n = t.style;
  if (!n)
    return;
  const i = window.getComputedStyle(e);
  i.cssText ? (n.cssText = i.cssText, n.transformOrigin = i.transformOrigin) : qo(r).forEach((s) => {
    let l = i.getPropertyValue(s);
    s === "font-size" && l.endsWith("px") && (l = `${Math.floor(parseFloat(l.substring(0, l.length - 2))) - 0.1}px`), _e(e, HTMLIFrameElement) && s === "display" && l === "inline" && (l = "block"), s === "d" && t.getAttribute("d") && (l = `path(${t.getAttribute("d")})`), n.setProperty(s, l, i.getPropertyPriority(s));
  });
}
function Vl(e, t) {
  _e(e, HTMLTextAreaElement) && (t.innerHTML = e.value), _e(e, HTMLInputElement) && t.setAttribute("value", e.value);
}
function Gl(e, t) {
  if (_e(e, HTMLSelectElement)) {
    const n = Array.from(t.children).find((i) => e.value === i.getAttribute("value"));
    n && n.setAttribute("selected", "");
  }
}
function Yl(e, t, r) {
  return _e(t, Element) && (Hl(e, t, r), Pl(e, t, r), Vl(e, t), Gl(e, t)), t;
}
async function Kl(e, t) {
  const r = e.querySelectorAll ? e.querySelectorAll("use") : [];
  if (r.length === 0)
    return e;
  const n = {};
  for (let s = 0; s < r.length; s++) {
    const d = r[s].getAttribute("xlink:href");
    if (d) {
      const o = e.querySelector(d), p = document.querySelector(d);
      !o && p && !n[d] && (n[d] = await Fr(p, t, !0));
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
async function Fr(e, t, r) {
  return !r && t.filter && !t.filter(e) ? null : Promise.resolve(e).then((n) => ql(n, t)).then((n) => jl(e, n, t)).then((n) => Yl(e, n, t)).then((n) => Kl(n, t));
}
const Vo = /url\((['"]?)([^'"]+?)\1\)/g, Xl = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, Jl = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function Zl(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
function Ql(e) {
  const t = [];
  return e.replace(Vo, (r, n, i) => (t.push(i), r)), t.filter((r) => !ci(r));
}
async function ec(e, t, r, n, i) {
  try {
    const s = r ? xl(t, r) : t, l = yi(t);
    let d;
    return i || (d = await bi(s, l, n)), e.replace(Zl(t), `$1${d}$3`);
  } catch {
  }
  return e;
}
function tc(e, { preferredFontFormat: t }) {
  return t ? e.replace(Jl, (r) => {
    for (; ; ) {
      const [n, , i] = Xl.exec(r) || [];
      if (!i)
        return "";
      if (i === t)
        return `src: ${n};`;
    }
  }) : e;
}
function Go(e) {
  return e.search(Vo) !== -1;
}
async function Yo(e, t, r) {
  if (!Go(e))
    return e;
  const n = tc(e, r);
  return Ql(n).reduce((s, l) => s.then((d) => ec(d, l, t, r)), Promise.resolve(n));
}
async function Nt(e, t, r) {
  var n;
  const i = (n = t.style) === null || n === void 0 ? void 0 : n.getPropertyValue(e);
  if (i) {
    const s = await Yo(i, null, r);
    return t.style.setProperty(e, s, t.style.getPropertyPriority(e)), !0;
  }
  return !1;
}
async function rc(e, t) {
  await Nt("background", e, t) || await Nt("background-image", e, t), await Nt("mask", e, t) || await Nt("-webkit-mask", e, t) || await Nt("mask-image", e, t) || await Nt("-webkit-mask-image", e, t);
}
async function nc(e, t) {
  const r = _e(e, HTMLImageElement);
  if (!(r && !ci(e.src)) && !(_e(e, SVGImageElement) && !ci(e.href.baseVal)))
    return;
  const n = r ? e.src : e.href.baseVal, i = await bi(n, yi(n), t);
  await new Promise((s, l) => {
    e.onload = s, e.onerror = t.onImageErrorHandler ? (...o) => {
      try {
        s(t.onImageErrorHandler(...o));
      } catch (p) {
        l(p);
      }
    } : l;
    const d = e;
    d.decode && (d.decode = s), d.loading === "lazy" && (d.loading = "eager"), r ? (e.srcset = "", e.src = i) : e.href.baseVal = i;
  });
}
async function ic(e, t) {
  const n = gt(e.childNodes).map((i) => Ko(i, t));
  await Promise.all(n).then(() => e);
}
async function Ko(e, t) {
  _e(e, Element) && (await rc(e, t), await nc(e, t), await ic(e, t));
}
function sc(e, t) {
  const { style: r } = e;
  t.backgroundColor && (r.backgroundColor = t.backgroundColor), t.width && (r.width = `${t.width}px`), t.height && (r.height = `${t.height}px`);
  const n = t.style;
  return n != null && Object.keys(n).forEach((i) => {
    r[i] = n[i];
  }), e;
}
const Gi = {};
async function Yi(e) {
  let t = Gi[e];
  if (t != null)
    return t;
  const n = await (await fetch(e)).text();
  return t = { url: e, cssText: n }, Gi[e] = t, t;
}
async function Ki(e, t) {
  let r = e.cssText;
  const n = /url\(["']?([^"')]+)["']?\)/g, s = (r.match(/url\([^)]+\)/g) || []).map(async (l) => {
    let d = l.replace(n, "$1");
    return d.startsWith("https://") || (d = new URL(d, e.url).href), jo(d, t.fetchRequestInit, ({ result: o }) => (r = r.replace(l, `url(${o})`), [l, o]));
  });
  return Promise.all(s).then(() => r);
}
function Xi(e) {
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
async function oc(e, t) {
  const r = [], n = [];
  return e.forEach((i) => {
    if ("cssRules" in i)
      try {
        gt(i.cssRules || []).forEach((s, l) => {
          if (s.type === CSSRule.IMPORT_RULE) {
            let d = l + 1;
            const o = s.href, p = Yi(o).then((a) => Ki(a, t)).then((a) => Xi(a).forEach((h) => {
              try {
                i.insertRule(h, h.startsWith("@import") ? d += 1 : i.cssRules.length);
              } catch (u) {
                console.error("Error inserting rule from remote css", {
                  rule: h,
                  error: u
                });
              }
            })).catch((a) => {
              console.error("Error loading remote css", a.toString());
            });
            n.push(p);
          }
        });
      } catch (s) {
        const l = e.find((d) => d.href == null) || document.styleSheets[0];
        i.href != null && n.push(Yi(i.href).then((d) => Ki(d, t)).then((d) => Xi(d).forEach((o) => {
          l.insertRule(o, l.cssRules.length);
        })).catch((d) => {
          console.error("Error loading remote stylesheet", d);
        })), console.error("Error inlining remote css file", s);
      }
  }), Promise.all(n).then(() => (e.forEach((i) => {
    if ("cssRules" in i)
      try {
        gt(i.cssRules || []).forEach((s) => {
          r.push(s);
        });
      } catch (s) {
        console.error(`Error while reading CSS rules from ${i.href}`, s);
      }
  }), r));
}
function ac(e) {
  return e.filter((t) => t.type === CSSRule.FONT_FACE_RULE).filter((t) => Go(t.style.getPropertyValue("src")));
}
async function lc(e, t) {
  if (e.ownerDocument == null)
    throw new Error("Provided element is not within a Document");
  const r = gt(e.ownerDocument.styleSheets), n = await oc(r, t);
  return ac(n);
}
function Xo(e) {
  return e.trim().replace(/["']/g, "");
}
function cc(e) {
  const t = /* @__PURE__ */ new Set();
  function r(n) {
    (n.style.fontFamily || getComputedStyle(n).fontFamily).split(",").forEach((s) => {
      t.add(Xo(s));
    }), Array.from(n.children).forEach((s) => {
      s instanceof HTMLElement && r(s);
    });
  }
  return r(e), t;
}
async function uc(e, t) {
  const r = await lc(e, t), n = cc(e);
  return (await Promise.all(r.filter((s) => n.has(Xo(s.style.fontFamily))).map((s) => {
    const l = s.parentStyleSheet ? s.parentStyleSheet.href : null;
    return Yo(s.cssText, l, t);
  }))).join(`
`);
}
async function dc(e, t) {
  const r = t.fontEmbedCSS != null ? t.fontEmbedCSS : t.skipFonts ? null : await uc(e, t);
  if (r) {
    const n = document.createElement("style"), i = document.createTextNode(r);
    n.appendChild(i), e.firstChild ? e.insertBefore(n, e.firstChild) : e.appendChild(n);
  }
}
async function pc(e, t = {}) {
  const { width: r, height: n } = Wo(e, t), i = await Fr(e, t, !0);
  return await dc(i, t), await Ko(i, t), sc(i, t), await Il(i, r, n);
}
async function hc(e, t = {}) {
  const { width: r, height: n } = Wo(e, t), i = await pc(e, t), s = await Or(i), l = document.createElement("canvas"), d = l.getContext("2d"), o = t.pixelRatio || Ml(), p = t.canvasWidth || r, a = t.canvasHeight || n;
  return l.width = p * o, l.height = a * o, t.skipAutoScale || Rl(l), l.style.width = `${p}`, l.style.height = `${a}`, t.backgroundColor && (d.fillStyle = t.backgroundColor, d.fillRect(0, 0, l.width, l.height)), d.drawImage(s, 0, 0, l.width, l.height), l;
}
async function fc(e, t = {}) {
  return (await hc(e, t)).toDataURL();
}
const mc = {
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
function gc(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function J(e, t = {}) {
  const r = mc[e];
  if (!r)
    return console.warn("[Klavity] unknown icon: " + e), "";
  const n = t.size ?? 18, i = t.class ? `icon ${t.class}` : "icon", s = t.label ? 'role="img"' : 'aria-hidden="true"', l = t.label ? `<title>${gc(t.label)}</title>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" class="${i}" width="${n}" height="${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" ${s}>${l}${r}</svg>`;
}
const _t = {
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
class Ji {
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
async function yc(e, t, r) {
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
const bc = 50, vc = 2e3, wc = 1e3, kc = 500, Zi = /^(?:token|access_token|refresh_token|api[_-]?key|apikey|key|secret|password|passwd|pwd|auth|authorization|session|sid|jwt|code|otp)$/i;
function dr(e, t) {
  e.push(t), e.length > bc && e.shift();
}
function vi(e, t) {
  return e.length <= t ? e : e.slice(0, t) + "…[truncated]";
}
function en(e) {
  let t = String(e || "");
  try {
    const r = new URL(t, typeof location < "u" ? location.href : "http://localhost");
    let n = !1;
    r.searchParams.forEach((i, s) => {
      Zi.test(s) && (r.searchParams.set(s, "REDACTED"), n = !0);
    }), n && (t = r.toString());
  } catch {
    t = t.replace(/([?&])([^=&]+)=([^&]*)/g, (r, n, i, s) => Zi.test(i) ? `${n}${i}=REDACTED` : r);
  }
  return vi(t, wc);
}
function xc(e) {
  if (typeof e == "string") return e;
  if (e instanceof Error) return e.message;
  try {
    return vi(JSON.stringify(e), kc);
  } catch {
    return String(e);
  }
}
function Sc(e, t = {}) {
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
function Cc(e, t = {}) {
  if (typeof window > "u") return e;
  const r = window;
  if (r.__klavityCaptureInstalled) return e;
  r.__klavityCaptureInstalled = !0;
  const n = () => t.isContextValid ? t.isContextValid() : !0, i = (o, p, a) => {
    dr(e.consoleErrors, { message: vi(p, vc), stack: a, timestamp: Date.now(), level: o });
  }, s = window.onerror;
  if (window.onerror = (o, p, a, h, u) => {
    var c;
    if (n()) {
      const m = String(o);
      i("error", m, u == null ? void 0 : u.stack), (c = t.onError) == null || c.call(t, m, u == null ? void 0 : u.stack);
    }
    return typeof s == "function" ? s.call(window, o, p, a, h, u) : !1;
  }, window.addEventListener("unhandledrejection", (o) => {
    var h;
    if (!n()) return;
    const p = o.reason, a = String((p == null ? void 0 : p.message) ?? p);
    i("error", a, p == null ? void 0 : p.stack), (h = t.onError) == null || h.call(t, a, p == null ? void 0 : p.stack);
  }), t.consoleLevels) {
    const o = ["log", "info", "warn", "error"];
    for (const p of o) {
      const a = console[p];
      typeof a == "function" && (console[p] = (...h) => {
        try {
          n() && i(p, h.map(xc).join(" "));
        } catch {
        }
        return a.apply(console, h);
      });
    }
  }
  const l = window.fetch;
  window.fetch = async (...o) => {
    var u;
    if (!n()) return l(...o);
    const p = Date.now(), a = typeof o[0] == "string" ? o[0] : o[0] instanceof URL ? o[0].href : o[0].url, h = (typeof o[0] == "object" && o[0] && "method" in o[0] ? o[0].method : (u = o[1]) == null ? void 0 : u.method) || "GET";
    try {
      const c = await l(...o);
      return dr(e.networkFailures, { url: en(a), status: c.status, method: String(h).toUpperCase(), timestamp: p, durationMs: Date.now() - p }), c;
    } catch (c) {
      throw dr(e.networkFailures, { url: en(a), status: 0, method: String(h).toUpperCase(), timestamp: p, durationMs: Date.now() - p }), c;
    }
  };
  const d = window.XMLHttpRequest;
  if (d && d.prototype) {
    const o = d.prototype.open, p = d.prototype.send;
    d.prototype.open = function(a, h, ...u) {
      return this.__klav = { method: String(a || "GET").toUpperCase(), url: String(h || "") }, o.call(this, a, h, ...u);
    }, d.prototype.send = function(...a) {
      const h = this.__klav;
      if (h && n()) {
        const u = Date.now();
        this.addEventListener("loadend", () => {
          try {
            dr(e.networkFailures, {
              url: en(h.url),
              status: Number(this.status) || 0,
              method: h.method,
              timestamp: u,
              durationMs: Date.now() - u
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
const Ec = ["light", "dark", "glass", "neon", "custom", "liquid"], Mc = ["hidden", "icon", "full", "custom"], Rc = ["full", "reportOnly", "off"], Oc = /^#[0-9a-fA-F]{3,8}$/, Ic = /^[\w \-,'"().]+$/, Qi = (e) => typeof e == "object" && e !== null, pr = (e) => typeof e == "string" && Oc.test(e.trim()) ? e.trim() : void 0, es = (e, t) => typeof e == "string" && e.trim() ? e.trim().slice(0, t) : void 0, Lc = (e) => {
  if (typeof e != "string") return;
  const t = e.trim().slice(0, 120);
  return t && Ic.test(t) ? t : void 0;
}, ts = {
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
function rs(e) {
  let t = e.replace("#", "");
  t.length === 3 && (t = t.split("").map((l) => l + l).join(""));
  const r = parseInt(t.slice(0, 6), 16), n = r >> 16 & 255, i = r >> 8 & 255, s = r & 255;
  return 0.299 * n + 0.587 * i + 0.114 * s;
}
function Jo(e) {
  const t = Qi(e) ? e : {}, n = { theme: typeof t.theme == "string" && Ec.includes(t.theme) ? t.theme : "light" }, i = pr(t.primary), s = pr(t.secondary), l = pr(t.background), d = es(t.thankYou, 140), o = Lc(t.font);
  i && (n.primary = i), s && (n.secondary = s), l && (n.background = l), o && (n.font = o), d && (n.thankYou = d), typeof t.launcherMode == "string" && Mc.includes(t.launcherMode) && (n.launcherMode = t.launcherMode);
  const p = es(t.launcherText, 60);
  p && (n.launcherText = p);
  const a = pr(t.launcherIconColor);
  a && (n.launcherIconColor = a), typeof t.rightClickMode == "string" && Rc.includes(t.rightClickMode) && (n.rightClickMode = t.rightClickMode), t.maskNumbers === !0 && (n.maskNumbers = !0);
  const h = Qi(t.agency_branding) ? t.agency_branding : {};
  return (t.whiteLabel === !0 || h.whiteLabel === !0) && (n.whiteLabel = !0), n;
}
function Ac(e) {
  const t = Jo(e), r = t.theme === "custom" ? { ...ts.light } : { ...ts[t.theme] };
  if (t.theme === "custom" && (t.primary && (r["--kl-accent"] = t.primary), t.secondary && (r["--kl-accent2"] = t.secondary), t.background)) {
    r["--kl-bg"] = t.background;
    const i = rs(t.background) < 140;
    r["--kl-fg"] = i ? "#f4f4f7" : "#1d1d24", r["--kl-muted"] = i ? "rgba(255,255,255,.6)" : "#706560", r["--kl-border"] = i ? "rgba(255,255,255,.16)" : "#e6e6ec", r["--kl-chip"] = i ? "rgba(255,255,255,.08)" : "#f4f4f7", r["--kl-input-bg"] = i ? "rgba(255,255,255,.05)" : "#fafafb";
  }
  return t.font && (r["--kl-font"] = t.font), t.theme === "dark" || t.theme === "neon" || t.theme === "glass" || t.theme === "liquid" || t.theme === "custom" && t.background && rs(t.background) < 140, r["--kl-img-outline"] = "var(--kl-img-outline-val, color-mix(in srgb, var(--kl-fg) 10%, transparent))", r["--kl-glow"] = "radial-gradient(120% 80% at 50% -10%, color-mix(in srgb, var(--kl-accent) 12%, transparent), transparent 60%), radial-gradient(80% 60% at 100% 110%, color-mix(in srgb, var(--kl-accent2) 6%, transparent), transparent 60%)", `:host{${Object.entries(r).map(([i, s]) => `${i}:${s};`).join("")}}`;
}
class Ir {
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
    if (this._recording || !Ir.isSupported()) return;
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
const Tc = /* @__PURE__ */ new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"]);
function hr(e) {
  const t = [], r = [], n = document.createTreeWalker(e, NodeFilter.SHOW_TEXT, {
    acceptNode(l) {
      let d = l.parentElement;
      for (; d && d !== e; ) {
        if (Tc.has(d.tagName)) return NodeFilter.FILTER_REJECT;
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
    const p = l.parentNode, a = l.nextSibling, h = o.map((u, c) => {
      if (c % 2 === 1) {
        const m = document.createElement("span");
        return m.style.cssText = "background:#111;color:transparent;border-radius:2px;", m.textContent = u, m;
      }
      return document.createTextNode(u);
    });
    p.removeChild(l);
    for (const u of h) p.insertBefore(u, a);
    t.push({ parent: p, original: l, replacements: h });
  }
  return e.querySelectorAll("input, select").forEach((l) => {
    const d = l.value;
    /\d/.test(d) && (r.push({ el: l, original: d }), l.value = "█".repeat(d.length));
  }), () => {
    for (const { parent: l, original: d, replacements: o } of t) {
      const p = o[0];
      if ((p == null ? void 0 : p.parentNode) === l) {
        l.insertBefore(d, p);
        for (const a of o) a.parentNode === l && l.removeChild(a);
      }
    }
    for (const { el: l, original: d } of r)
      l.value = d;
  };
}
function Pc(e, t, r) {
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
function pt(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function ns(e) {
  return e === "attached" ? `${J("play", { size: 12 })}<span>Replay &middot; 60s</span>${J("check", { size: 12, label: "attached" })}` : `${J("play", { size: 12 })}<span>Replay &middot; not available</span>`;
}
function is(e) {
  const t = /^fb_([0-9a-f]{8})[0-9a-f-]+$/i.exec(e);
  return t ? "fb_" + t[1] : e;
}
function ss(e) {
  if (!e) return "";
  try {
    const t = new URL(e);
    return t.protocol === "https:" || t.protocol === "http:" ? t.href : "";
  } catch {
    return "";
  }
}
function Jt(e) {
  return typeof e == "string" ? { dataUrl: e } : { dataUrl: e.dataUrl, quality: e.quality };
}
const Nc = {
  "real-pixel": { label: "Sharp", iconName: "check-circle", degraded: !1 },
  rendered: { label: "Rendered", iconName: "image", degraded: !0 },
  wireframe: { label: "Wireframe", iconName: "triangle-alert", degraded: !0 }
};
function $c(e, t, r = {}) {
  var Wi;
  const n = Jo(r);
  let i = !!n.maskNumbers;
  const s = document.createElement("div");
  s.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;";
  const l = s.attachShadow({ mode: "open" });
  document.body.appendChild(s);
  let d = [], o = [], p = [];
  const a = 5, h = 10 * 1024 * 1024, u = {};
  let c = null;
  const m = () => {
    const C = Object.keys(u);
    if (!C.length && !c) return null;
    const I = {};
    if (C.length) {
      const T = {};
      for (const N of C) T[N] = u[N];
      const O = u[0] ?? u[Number(C[0])] ?? {};
      Object.assign(I, O, { byIndex: T });
    }
    return c && (I.selector = c.selector, I.selectorText = c.text), I;
  };
  let f = e, g = 0, k = null, b = t.replayState === "attached", w = null;
  const S = document.createElement("style");
  S.textContent = `
    ${Ac(n)}
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
  `, l.appendChild(S);
  const v = document.createElement("div");
  v.className = "klavity-overlay";
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
      <div class="klavity-page">${J("map-pin")} ${typeof window < "u" ? pt(window.location.pathname) : ""}</div>
      ${t.replayState ? `<div class="klavity-proof"><span class="klavity-chip ${t.replayState === "attached" ? "kl-chip-on" : "kl-chip-off"}" id="klavity-replay-chip">${ns(t.replayState)}</span></div>` : ""}
      <div class="klavity-actions">
        ${t.onCaptureSharp ? `<button id="klavity-sharp" aria-describedby="klavity-sharp-tip"><span class="kl-cap-ic">${J("app-window")}</span><span class="kl-sharp-label">Screen</span><span class="kl-info-badge" aria-hidden="true"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></span><span id="klavity-sharp-tip" class="klavity-info-pop" role="tooltip">Screen grabs the <b>whole page — every image, pixel-perfect</b> using your browser's screen-share. Your browser will ask you to <b>share this tab</b>.</span></button>` : ""}
        <button id="klavity-full" title="Full Page — instant capture; may miss some cross-origin images"><span class="kl-cap-ic">${J("camera")}</span><span class="kl-full-label">Full Page</span></button>
        <button id="klavity-upload"><span class="kl-cap-ic">${J("image")}</span><span class="kl-upload-label">Upload</span></button>
        ${t.onRegionCapture ? `<button id="klavity-region"><span class="kl-cap-ic">${J("scissors")}</span><span class="kl-region-label">Region</span></button>` : ""}
        ${t.onPickElement ? `<button id="klavity-pick" title="Pick the exact element that's broken"><span class="kl-cap-ic">${J("mouse-pointer-2")}</span><span class="kl-pick-label">Pick element</span></button>` : ""}
        ${Ir.isSupported() ? `<button id="klavity-voice" title="Dictate description"><span class="kl-cap-ic">${J("mic")}<span class="kl-vdot"></span></span><span class="kl-voice-label">Voice</span><svg class="kl-vring" viewBox="0 0 32 32" aria-hidden="true"><circle class="kl-vring-bg" cx="16" cy="16" r="13" fill="none" stroke-width="2"/><circle class="kl-vring-prog" cx="16" cy="16" r="13" fill="none" stroke-width="2" stroke-dasharray="81.68" stroke-dashoffset="81.68" stroke-linecap="round" transform="rotate(-90 16 16)"/></svg></button>` : ""}
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
  `, v.appendChild(y), l.appendChild(v);
  const x = l.getElementById("klavity-mask-numbers");
  x && x.addEventListener("change", () => {
    i = x.checked;
  });
  const M = l.getElementById("klavity-sharp"), A = l.querySelector(".klavity-info-pop");
  if (M && A) {
    const C = document.createElement("div");
    C.className = "kl-float-tip", C.setAttribute("role", "tooltip"), C.innerHTML = A.innerHTML, l.appendChild(C);
    const I = () => {
      const O = M.getBoundingClientRect(), N = Math.min(228, window.innerWidth - 16), D = 8, W = window.innerWidth, V = window.innerHeight, F = O.left + O.width / 2 - N / 2, U = Math.max(D, Math.min(F, W - N - D));
      C.style.left = U + "px", C.style.top = "-9999px", C.style.visibility = "hidden", C.style.display = "block";
      const B = C.offsetHeight;
      C.style.display = "", C.style.visibility = "";
      let $ = O.bottom + 8;
      $ + B + D > V && ($ = O.top - B - 8), $ = Math.max(D, Math.min($, V - B - D)), C.style.top = $ + "px", C.classList.add("kl-show");
    }, T = () => C.classList.remove("kl-show");
    M.addEventListener("mouseenter", I), M.addEventListener("mouseleave", T), M.addEventListener("focus", I), M.addEventListener("blur", T);
  }
  function R(C) {
    b = C === "attached", Q();
    const I = l.getElementById("klavity-replay-chip");
    I && (I.classList.toggle("kl-chip-on", C === "attached"), I.classList.toggle("kl-chip-off", C !== "attached"), I.innerHTML = ns(C));
  }
  const j = {
    shadowRoot: l,
    addScreenshot: ye,
    close: Z,
    setReplayState: R
  };
  function z() {
    const C = l.getElementById("klavity-strip"), I = l.getElementById("klavity-counter");
    C.innerHTML = "", d.forEach((T, O) => {
      const N = document.createElement("div");
      N.className = "klavity-thumb", O === g && N.classList.add("kl-thumb-active");
      const D = document.createElement("img");
      D.src = T, D.title = "Click to select + mark up", D.addEventListener("load", () => {
        D.naturalHeight > D.naturalWidth * 1.4 && N.classList.add("kl-tall");
      }, { once: !0 }), D.addEventListener("click", () => {
        g = O, z();
      });
      const W = document.createElement("button");
      W.className = "klavity-rm", W.innerHTML = J("x", { size: 13 }), W.title = "Remove", W.addEventListener("click", (U) => {
        U.stopPropagation(), d.splice(O, 1), o.splice(O, 1), p.splice(O, 1), delete u[O];
        for (const B of Object.keys(u).map(Number).filter(($) => $ > O).sort(($, K) => $ - K))
          u[B - 1] = u[B], delete u[B];
        d.length === 0 && Ze(null), z();
      });
      const V = document.createElement("button");
      V.className = "klavity-mk", V.innerHTML = J("pencil", { size: 13 }), V.title = "Mark up", V.addEventListener("click", (U) => {
        U.stopPropagation(), bl(O);
      }), N.append(D, W, V);
      const F = p[O];
      if (F) {
        const U = Nc[F], B = document.createElement("span");
        if (B.className = "klavity-qb kl-q-" + F, B.title = F === "real-pixel" ? "Pixel-perfect capture (every image included)" : F === "wireframe" ? "Wireframe fallback — layout only, images not captured. Retake for a sharp shot." : "Rendered capture — some cross-origin images may be missing. Retake for a sharp shot.", B.innerHTML = J(U.iconName, { size: 10 }) + '<span class="klavity-qb-t">' + pt(U.label) + "</span>", N.appendChild(B), U.degraded && t.onRetakeSharp) {
          const $ = document.createElement("button");
          $.type = "button", $.className = "klavity-retake", $.innerHTML = J("zap", { size: 11 }) + "<span>Retake sharp</span>", $.title = "Recapture this shot at full pixel quality", $.addEventListener("click", (K) => {
            K.stopPropagation(), se(O, $);
          }), N.appendChild($);
        }
      }
      if (ie.has(O)) {
        const U = document.createElement("div");
        U.className = "klavity-retake-note", U.textContent = "Markup cleared for the retake.", N.appendChild(U);
      }
      C.appendChild(N);
    }), I.textContent = `${d.length}/5 images`, Q(), ml();
  }
  function E(C) {
    const I = l.getElementById("klavity-err");
    I && (I.textContent = C, I.style.display = "block");
  }
  function Te() {
    const C = l.getElementById("klavity-err");
    C && (C.style.display = "none");
  }
  function ye(C, I) {
    if (d.length >= a) {
      E(`You can attach up to ${a} images.`);
      return;
    }
    Te(), d.push(C), o.push(t.compressImage ? t.compressImage(C) : Promise.resolve(C)), p.push(I), z();
  }
  const ie = /* @__PURE__ */ new Set();
  async function se(C, I) {
    if (!(me || !t.onRetakeSharp)) {
      Y(!0), I.classList.add("kl-loading"), s.style.display = "none";
      try {
        const T = i ? hr(document.body) : null;
        let O;
        try {
          O = await t.onRetakeSharp();
        } finally {
          T == null || T();
        }
        if (O) {
          const { dataUrl: N, quality: D } = Jt(O);
          N && (d[C] = N, o[C] = t.compressImage ? t.compressImage(N) : Promise.resolve(N), p[C] = D ?? "real-pixel", u[C] && (delete u[C], ie.add(C)));
        }
      } catch {
      } finally {
        s.style.display = "", Y(!1), z();
      }
    }
  }
  function he(C) {
    return C.type.startsWith("image/") || /\.(heic|heif|png|jpe?g|gif|webp|bmp|avif|svg)$/i.test(C.name);
  }
  async function ve(C) {
    Te();
    for (const I of C) {
      if (d.length >= a) {
        E(`You can attach up to ${a} images.`);
        break;
      }
      if (!he(I)) {
        E(`"${I.name}" isn't an image — only image files can be attached.`);
        continue;
      }
      if (I.size > h) {
        E(`"${I.name}" is too large — images must be under ${Math.round(h / 1024 / 1024)} MB.`);
        continue;
      }
      try {
        ye(await Dc(I));
      } catch {
        E(`Couldn't add "${I.name}". Please try a different image.`);
      }
    }
  }
  let le = null;
  function Z() {
    var T;
    le == null || le(), w && (clearTimeout(w), w = null), document.removeEventListener("keydown", xe, { capture: !0 }), document.removeEventListener("paste", L);
    try {
      (T = t.onClose) == null || T.call(t);
    } catch {
    }
    const C = l.querySelector(".klavity-modal");
    if (!C) {
      s.remove();
      return;
    }
    C.classList.add("kl-closing");
    const I = () => s.remove();
    C.addEventListener("animationend", I, { once: !0 }), setTimeout(I, 700);
  }
  function xe(C) {
    if (C.key === "Escape") {
      C.stopPropagation(), Z();
      return;
    }
    if ((C.key === "s" || C.key === "S") && !C.metaKey && !C.ctrlKey && !C.altKey) {
      const I = C.target;
      if (I && (I.tagName === "INPUT" || I.tagName === "TEXTAREA" || I.isContentEditable) || l.querySelector(".kl-edtb")) return;
      const T = l.getElementById("klavity-submit");
      T && !T.disabled && (C.preventDefault(), C.stopPropagation(), T.click());
    }
  }
  document.addEventListener("keydown", xe, { capture: !0 });
  const L = (C) => {
    if (!C.clipboardData) return;
    const I = Array.from(C.clipboardData.items).filter((T) => T.type.startsWith("image/")).map((T) => T.getAsFile()).filter((T) => !!T);
    I.length && ve(I);
  };
  document.addEventListener("paste", L);
  const Pe = y.querySelector(".bug"), Se = y.querySelector(".feat"), at = () => {
    const C = y.querySelector("#klavity-desc");
    C && (C.placeholder = f === "feature" ? "Describe the feature you'd like..." : "Describe the bug...");
  };
  Pe.addEventListener("click", () => {
    f = "bug", Pe.classList.add("active"), Se.classList.remove("active"), at();
  }), Se.addEventListener("click", () => {
    f = "feature", Se.classList.add("active"), Pe.classList.remove("active"), at();
  });
  const oe = y.querySelector("#klavity-desc"), ke = y.querySelector("#klavity-submit"), Ce = y.querySelector("#klavity-remail"), je = y.querySelector("#klavity-desc-hint"), H = () => !t.requireEmail || !!Ce && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(Ce.value.trim()), fe = () => d.length > 0 || b, Q = () => {
    const C = oe.value.trim() === "";
    ke.disabled = C && !fe() || !H(), je && (je.hidden = !(C && fe()));
  };
  if (oe.addEventListener("input", Q), Ce == null || Ce.addEventListener("input", Q), t.onCheckKnown) {
    const C = y.querySelector("#klavity-known"), I = t.onCheckKnown;
    let T = null, O = 0, N = "";
    const D = () => {
      C && (C.hidden = !0, C.textContent = "");
    }, W = (F) => {
      var B;
      if (!C) return;
      const U = F.headline ? pt(F.headline) : "Already reported";
      C.innerHTML = `<span class="kl-known-ic">${J("check-circle", { size: 15 })}</span><div class="kl-known-body"><span class="kl-known-title">${U}</span> — status: <span class="kl-known-status">${pt(F.statusLabel)}</span>. We're already tracking "${pt(F.title)}". Add your note and submit anyway — it'll be linked.</div><button type="button" class="kl-known-dismiss" id="klavity-known-dismiss">Dismiss</button>`, C.hidden = !1, (B = C.querySelector("#klavity-known-dismiss")) == null || B.addEventListener("click", () => {
        N = oe.value.trim(), D();
      });
    }, V = async () => {
      const F = oe.value.trim();
      if (F.length < 12 || F === N) {
        D();
        return;
      }
      const U = ++O;
      try {
        const B = await I(F);
        if (U !== O) return;
        if (oe.value.trim() === N) {
          D();
          return;
        }
        B ? W(B) : D();
      } catch {
      }
    };
    oe.addEventListener("input", () => {
      oe.value.trim() !== N && (N = ""), T && clearTimeout(T), T = setTimeout(V, 500);
    });
  }
  v.addEventListener("click", (C) => {
    C.target === v && Z();
  }), (Wi = y.querySelector("#klavity-x")) == null || Wi.addEventListener("click", () => Z());
  const ce = () => Array.from(y.querySelectorAll(".klavity-actions button:not(#klavity-voice)"));
  let me = !1;
  const Y = (C) => {
    me = C, ce().forEach((I) => {
      I.disabled = C;
    }), C ? ke.disabled = !0 : Q();
  }, Ze = (C) => {
    ce().forEach((I) => {
      I.classList.remove("kl-active"), I.removeAttribute("aria-pressed");
    }), C && (C.classList.add("kl-active"), C.setAttribute("aria-pressed", "true"));
  }, bt = y.querySelector("#klavity-voice");
  if (bt) {
    const C = new Ir(), I = 81.68, T = 15e3, O = bt.querySelector(".kl-vring-prog");
    let N = 0, D = 0, W = !1;
    const V = () => {
      D = Date.now();
      const U = () => {
        const B = Date.now() - D, $ = Math.min(B / 18e4, 1);
        if (O == null || O.setAttribute("stroke-dashoffset", String($ * I)), B >= 18e4 - T && bt.classList.add("kl-voice-warn"), B >= 18e4) {
          C.stop();
          return;
        }
        N = requestAnimationFrame(U);
      };
      N = requestAnimationFrame(U);
    }, F = () => {
      cancelAnimationFrame(N), O == null || O.setAttribute("stroke-dashoffset", String(I)), bt.classList.remove("kl-voice-warn");
    };
    C.onTranscript = (U) => {
      const B = oe.value;
      oe.value = B + (B.length > 0 && !/\s$/.test(B) ? " " : "") + U, Q();
    }, C.onError = (U, B) => {
      if (!B) return;
      let $ = l.getElementById("klavity-voice-err");
      $ || ($ = document.createElement("div"), $.id = "klavity-voice-err", $.style.cssText = "color:rgb(220 38 38);font-size:12px;margin-top:4px;opacity:1;", oe.insertAdjacentElement("afterend", $)), $.style.opacity = "1", $.style.transition = "", $.textContent = B, $.style.transition = "opacity .3s ease", setTimeout(() => {
        $ && ($.style.opacity = "0");
      }, 3700), setTimeout(() => {
        $ && ($.textContent = "", $.style.opacity = "1", $.style.transition = "");
      }, 4e3);
    }, C.onStop = () => {
      W = !1, bt.classList.remove("kl-voice-rec"), F();
    }, bt.addEventListener("click", () => {
      W ? C.stop() : (W = !0, bt.classList.add("kl-voice-rec"), C.start(), V());
    }), le = () => {
      W && C.stop();
    };
  }
  ke.addEventListener("click", async () => {
    if (me || ke.disabled) return;
    const C = oe.value.trim();
    Y(!0), ke.textContent = "Uploading…";
    const I = l.getElementById("klavity-err");
    I.style.display = "none";
    const T = l.getElementById("klavity-progress"), O = l.getElementById("klavity-progress-fill");
    T && O && (T.classList.add("show"), O.style.transition = "none", O.style.width = "8%", O.offsetWidth, O.style.transition = "width 10s cubic-bezier(.05,.7,.2,1)", requestAnimationFrame(() => {
      O.style.width = "90%";
    }));
    const N = () => {
      O && (O.style.transition = "width .25s ease", O.style.width = "100%");
    }, D = () => {
      T && O && (T.classList.remove("show"), O.style.transition = "none", O.style.width = "0");
    };
    try {
      const W = await Promise.all(o), V = await t.onSubmit({ type: f, description: C, screenshots: W, annotations: m(), reporterEmail: (Ce == null ? void 0 : Ce.value.trim()) || void 0 });
      if (N(), t.success)
        vl(V.issueKey, V.issueUrl, t.success);
      else {
        const F = document.createElement("div");
        F.style.cssText = "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:all;";
        const U = document.createElement("div");
        U.style.cssText = "background:var(--kl-bg);color:var(--kl-fg);border:1px solid var(--kl-border);border-radius:var(--kl-radius);padding:32px;font-family:var(--kl-font,system-ui),sans-serif;font-size:16px;text-align:center;box-shadow:var(--kl-shadow);";
        let B = "";
        if (n.thankYou)
          U.textContent = n.thankYou;
        else if (U.innerHTML = `${J("check-circle", { label: "Filed", size: 20 })} Filed as `, U.appendChild(document.createTextNode(is(V.issueKey))), B = ss(V.issueUrl), B) {
          const $ = document.createElement("a");
          $.href = B, $.target = "_blank", $.rel = "noopener", $.textContent = "View in dashboard", $.style.cssText = "display:block;margin-top:12px;font-size:14px;font-weight:600;color:var(--kl-accent);text-decoration:underline;text-underline-offset:2px;", U.appendChild($);
        }
        F.appendChild(U), v.remove(), l.appendChild(F), setTimeout(Z, n.thankYou ? 2600 : B ? 4e3 : 1500);
      }
    } catch (W) {
      D(), I.textContent = W.message, I.style.display = "block", ke.textContent = "Submit", Y(!1);
    }
  });
  const Xt = y.querySelector("#klavity-full");
  if (Xt.addEventListener("click", async () => {
    if (!me) {
      Y(!0), Xt.classList.add("kl-loading");
      try {
        const C = i ? hr(document.body) : null;
        try {
          const { dataUrl: I, quality: T } = Jt(await t.onCaptureFull());
          ye(I, T), Ze(Xt);
        } finally {
          C == null || C();
        }
      } catch {
      } finally {
        Xt.classList.remove("kl-loading"), Y(!1);
      }
    }
  }), M && t.onCaptureSharp) {
    const C = M.querySelector(".kl-sharp-label"), I = async () => {
      if (me) return;
      Y(!0), M.classList.add("kl-loading"), s.style.display = "none";
      const T = C ?? M, O = T.textContent;
      T.textContent = "Capturing…";
      try {
        const N = i ? hr(document.body) : null;
        let D;
        try {
          D = await t.onCaptureSharp();
        } finally {
          N == null || N();
        }
        if (D) {
          const { dataUrl: W, quality: V } = Jt(D);
          W && (ye(W, V ?? "real-pixel"), Ze(M));
        }
      } catch {
      } finally {
        s.style.display = "", T.textContent = O, M.classList.remove("kl-loading"), Y(!1);
      }
    };
    M.addEventListener("click", () => {
      I();
    });
  }
  const Fi = y.querySelector("#klavity-file"), Ui = y.querySelector("#klavity-upload");
  Ui.addEventListener("click", () => {
    if (me || d.length >= a) {
      d.length >= a && E(`You can attach up to ${a} images.`);
      return;
    }
    Fi.click();
  }), Fi.addEventListener("change", async (C) => {
    const I = C.target, T = I.files ? Array.from(I.files) : [];
    if (I.value = "", T.length) {
      const O = d.length;
      await ve(T), d.length > O && Ze(Ui);
    }
  });
  const Jr = l.getElementById("klavity-region");
  Jr && t.onRegionCapture && (Jr.onclick = () => {
    me || (Y(!0), document.removeEventListener("keydown", xe, { capture: !0 }), s.style.display = "none", _c(async (C) => {
      document.addEventListener("keydown", xe, { capture: !0 });
      try {
        const I = i ? hr(document.body) : null;
        let T;
        try {
          T = await t.onRegionCapture(C);
        } finally {
          I == null || I();
        }
        if (T) {
          const { dataUrl: O, quality: N } = Jt(T);
          O && (ye(O, N), Ze(Jr));
        }
      } finally {
        s.style.display = "", Y(!1);
      }
    }, () => {
      document.addEventListener("keydown", xe, { capture: !0 }), s.style.display = "", Y(!1);
    }));
  });
  const At = l.getElementById("klavity-pick"), Tt = l.getElementById("klavity-pickinfo"), Bi = () => {
    var O;
    if (At && (At.classList.toggle("kl-active", !!c), c ? At.setAttribute("aria-pressed", "true") : At.removeAttribute("aria-pressed")), !Tt) return;
    if (!c) {
      Tt.hidden = !0, Tt.innerHTML = "";
      return;
    }
    Tt.hidden = !1;
    const { selector: C, text: I } = c, T = I ? `<span class="kl-pick-txt">${pt(I)}</span>` : "";
    Tt.innerHTML = `<span class="kl-pick-ic">${J("mouse-pointer-2", { size: 13 })}</span><span>Element pinned:</span><code title="${pt(C)}">${pt(C)}</code>${T}<button type="button" class="kl-pick-clear" id="klavity-pick-clear">Clear</button>`, (O = Tt.querySelector("#klavity-pick-clear")) == null || O.addEventListener("click", () => {
      c = null, Bi();
    });
  };
  At && t.onPickElement && (At.onclick = async () => {
    if (!me) {
      Y(!0), document.removeEventListener("keydown", xe, { capture: !0 }), s.style.display = "none";
      try {
        const C = await t.onPickElement();
        C && (c = C, Bi());
      } catch {
      } finally {
        document.addEventListener("keydown", xe, { capture: !0 }), s.style.display = "", Y(!1);
      }
    }
  });
  function vt(C, I = 15) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${I}" height="${I}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em">${C}</svg>`;
  }
  function fl() {
    const C = (T, O, N, D) => `<button type="button" class="kl-htool" data-tool="${T}" title="${O} (${D.toUpperCase()})" aria-label="${O}">${N}<span class="kl-hk">${D.toUpperCase()}</span></button>`, I = (T) => `<button type="button" class="kl-hcolor" data-color="${T}" style="background:${T}" title="${T}" aria-label="Colour ${T}"></button>`;
    return C("pen", "Pen", J("pencil", { size: 15 }), "p") + C("line", "Line", vt('<line x1="5" y1="19" x2="19" y2="5"/>'), "l") + C("rect", "Rectangle", J("square", { size: 15 }), "r") + C("circle", "Circle", vt('<circle cx="12" cy="12" r="9"/>'), "o") + C("arrow", "Arrow", vt('<line x1="5" y1="19" x2="19" y2="5"/><polyline points="10 5 19 5 19 14"/>'), "a") + C("text", "Text", vt('<path d="M5 6h14M12 6v13M9 19h6"/>'), "t") + C("count", "Numbers", vt('<circle cx="12" cy="12" r="9"/><text x="12" y="16" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor" stroke="none">1</text>'), "c") + C("crop", "Crop", vt('<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>'), "k") + '<span class="kl-hsep"></span>' + I("#ef4444") + I("#f97316") + I("#3b82f6") + I("#111827") + // Contextual text options — shown only while the Text tool is active (toggled in selectTool).
    `<span class="kl-htextopts" id="kl-hero-textopts" hidden><span class="kl-hsep"></span><span class="kl-hlabel">Outline</span><button type="button" class="kl-hopt kl-on" data-outline="black" title="Black outline"><span class="kl-osq" style="background:#111"></span></button><button type="button" class="kl-hopt" data-outline="white" title="White outline"><span class="kl-osq" style="background:#fff;border:1px solid #999"></span></button><button type="button" class="kl-hopt" data-outline="none" title="No outline">None</button><span class="kl-hlabel">Size</span><button type="button" class="kl-hopt" data-size="18" title="Small">S</button><button type="button" class="kl-hopt kl-on" data-size="26" title="Medium">M</button><button type="button" class="kl-hopt" data-size="40" title="Large">L</button></span><span class="kl-hsep"></span><button type="button" class="kl-htbtn" id="kl-hero-undo" title="Undo (⌘Z)" aria-label="Undo">${vt('<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>', 14)}</button><button type="button" class="kl-htbtn" id="kl-hero-clear" title="Clear" aria-label="Clear">${J("trash-2", { size: 14 })}</button><span class="kl-hgrow"></span><span class="kl-hhint">P pen · L line · R rect · O circle · T text · C numbers · K crop</span>`;
  }
  function Zr() {
    k && (document.removeEventListener("keydown", k, { capture: !0 }), k = null);
  }
  function qi() {
    const C = l.getElementById("klavity-hero-stage"), I = l.getElementById("klavity-hero-tools");
    I && (I.innerHTML = ""), C && (C.innerHTML = `<div class="kl-hero-empty">${J("image", { size: 34 })}<span>Capture or upload a screenshot to start marking it up</span></div>`), Zr();
  }
  function ml() {
    if (d.length === 0) {
      g = 0, qi();
      return;
    }
    g >= d.length && (g = d.length - 1), g < 0 && (g = 0), yl(g);
  }
  function gl(C, I, T, O, N) {
    const D = d[C];
    if (!D) return;
    const W = new Image();
    W.onload = () => {
      var $;
      if (d[C] !== D) return;
      const V = document.createElement("canvas");
      V.width = Math.max(1, Math.round(O)), V.height = Math.max(1, Math.round(N));
      const F = V.getContext("2d");
      if (!F) return;
      F.drawImage(W, I, T, O, N, 0, 0, V.width, V.height);
      let U;
      try {
        U = V.toDataURL("image/png");
      } catch {
        return;
      }
      d[C] = U, o[C] = t.compressImage ? t.compressImage(U) : Promise.resolve(U);
      const B = ($ = u[C]) == null ? void 0 : $.shapes;
      Array.isArray(B) && B.length ? u[C] = { w: V.width, h: V.height, shapes: Pc(B, -I, -T) } : delete u[C], z();
    }, W.src = D;
  }
  function yl(C) {
    var F, U, B;
    const I = l.getElementById("klavity-hero-stage"), T = l.getElementById("klavity-hero-tools");
    if (!I || !T) return;
    const O = d[C];
    if (!O) {
      qi();
      return;
    }
    Zr(), I.innerHTML = "";
    const N = document.createElement("canvas");
    N.width = 1, N.height = 1, N.style.cssText = "display:block;max-width:100%;max-height:100%;object-fit:contain;cursor:crosshair;touch-action:none;background:#fff;border-radius:8px;box-shadow:0 12px 40px rgba(0,0,0,.5);";
    const D = new Ji(N, O), W = (F = u[C]) == null ? void 0 : F.shapes;
    Array.isArray(W) && W.forEach(($) => D.shapes.push({ ...$ })), I.appendChild(N);
    const V = new Image();
    V.onload = () => {
      !document.body.contains(s) || g !== C || d[C] !== O || (N.width = V.naturalWidth || 1, N.height = V.naturalHeight || 1, D.redraw());
    }, V.src = O, D.redraw();
    {
      T.innerHTML = fl();
      let $ = "pen", K = "#ef4444", Be = 26, Re = "black";
      const Ee = T.querySelector("#kl-hero-textopts"), be = () => {
        D.shapes.length ? u[C] = { w: N.width, h: N.height, shapes: D.shapes.map((_) => ({ ..._ })) } : delete u[C];
      }, tt = (_) => {
        $ = _, T.querySelectorAll("[data-tool]").forEach((q) => q.classList.toggle("kl-on", q.dataset.tool === _)), Ee && (Ee.hidden = _ !== "text");
      }, wt = (_, q) => {
        K = _, T.querySelectorAll("[data-color]").forEach((ue) => ue.classList.toggle("kl-on", ue === q));
      };
      T.querySelectorAll("[data-tool]").forEach((_) => _.addEventListener("click", () => tt(_.dataset.tool))), T.querySelectorAll("[data-color]").forEach((_) => _.addEventListener("click", () => wt(_.dataset.color, _))), T.querySelectorAll("[data-outline]").forEach((_) => _.addEventListener("click", () => {
        Re = _.dataset.outline, T.querySelectorAll("[data-outline]").forEach((q) => q.classList.toggle("kl-on", q === _));
      })), T.querySelectorAll("[data-size]").forEach((_) => _.addEventListener("click", () => {
        Be = Number(_.dataset.size), T.querySelectorAll("[data-size]").forEach((q) => q.classList.toggle("kl-on", q === _));
      })), (U = T.querySelector("#kl-hero-undo")) == null || U.addEventListener("click", () => {
        D.undo(), be();
      }), (B = T.querySelector("#kl-hero-clear")) == null || B.addEventListener("click", () => {
        D.clearAll(), be();
      }), tt($), wt(K, T.querySelector("[data-color]"));
      const He = (_) => {
        const q = N.getBoundingClientRect(), ue = Math.min(q.width / N.width, q.height / N.height) || 1, ct = N.width * ue, ut = N.height * ue, dt = (q.width - ct) / 2, cr = (q.height - ut) / 2;
        return { x: (_.clientX - q.left - dt) / ue, y: (_.clientY - q.top - cr) / ue };
      };
      let rt = D.shapes.reduce((_, q) => q.type === "count" ? Math.max(_, q.n) : _, 0), nt = !1, De = 0, ze = 0, lt = [], Oe = null, G = { x: 0, y: 0 };
      N.addEventListener("pointerdown", (_) => {
        const q = He(_);
        if (De = q.x, ze = q.y, $ === "crop") {
          nt = !0, G = { x: _.clientX, y: _.clientY }, Oe = document.createElement("div"), Oe.style.cssText = "position:absolute;border:2px dashed #6c63ff;background:rgba(108,99,255,.14);pointer-events:none;z-index:6;left:0;top:0;width:0;height:0;", I.appendChild(Oe);
          return;
        }
        if ($ === "text") {
          const ue = document.createElement("input"), ct = Re === "none" ? "none" : `0 0 2px ${Re}, 0 0 2px ${Re}`;
          ue.style.cssText = `position:fixed;left:${_.clientX}px;top:${_.clientY}px;background:transparent;border:1px dashed ${K};color:${K};font-size:${Be}px;font-weight:700;text-shadow:${ct};outline:none;z-index:2147483647;min-width:80px;`;
          const ut = Be, dt = Re;
          document.body.appendChild(ue), ue.focus(), ue.addEventListener("blur", () => {
            ue.value.trim() && (D.addShape({ type: "text", color: K, x: De, y: ze, text: ue.value.trim(), size: ut, outline: dt }), be()), ue.remove();
          }, { once: !0 }), ue.addEventListener("keydown", (cr) => {
            cr.key === "Enter" && ue.blur(), cr.stopPropagation();
          });
          return;
        }
        if ($ === "count") {
          D.addShape({ type: "count", color: K, x: q.x, y: q.y, n: ++rt }), be();
          return;
        }
        nt = !0, $ === "pen" && (lt = [q]);
      }), N.addEventListener("pointermove", (_) => {
        if (nt) {
          if ($ === "pen") {
            lt.push(He(_));
            return;
          }
          if ($ === "crop" && Oe) {
            const q = I.getBoundingClientRect(), ue = Math.min(G.x, _.clientX), ct = Math.min(G.y, _.clientY), ut = Math.max(G.x, _.clientX), dt = Math.max(G.y, _.clientY);
            Oe.style.left = ue - q.left + "px", Oe.style.top = ct - q.top + "px", Oe.style.width = ut - ue + "px", Oe.style.height = dt - ct + "px";
          }
        }
      }), N.addEventListener("pointerup", (_) => {
        if (!nt) return;
        nt = !1;
        const q = He(_);
        if ($ === "crop") {
          Oe && (Oe.remove(), Oe = null);
          const ue = Math.max(0, Math.min(De, q.x)), ct = Math.max(0, Math.min(ze, q.y)), ut = Math.abs(q.x - De), dt = Math.abs(q.y - ze);
          ut > 4 && dt > 4 && gl(C, ue, ct, ut, dt);
          return;
        }
        $ === "pen" && lt.length > 1 ? D.addShape({ type: "pen", color: K, points: lt }) : $ === "line" ? D.addShape({ type: "line", color: K, x1: De, y1: ze, x2: q.x, y2: q.y }) : $ === "rect" ? D.addShape({ type: "rect", color: K, x: Math.min(De, q.x), y: Math.min(ze, q.y), w: Math.abs(q.x - De), h: Math.abs(q.y - ze) }) : $ === "circle" ? D.addShape({ type: "circle", color: K, x: (De + q.x) / 2, y: (ze + q.y) / 2, rx: Math.abs(q.x - De) / 2, ry: Math.abs(q.y - ze) / 2 }) : $ === "arrow" && D.addShape({ type: "arrow", color: K, x1: De, y1: ze, x2: q.x, y2: q.y }), be();
      });
      const re = { p: "pen", l: "line", r: "rect", o: "circle", a: "arrow", t: "text", c: "count", k: "crop" };
      k = (_) => {
        if (!document.body.contains(s)) {
          Zr();
          return;
        }
        const q = _.target;
        if (q && (q.tagName === "INPUT" || q.tagName === "TEXTAREA" || q.isContentEditable)) return;
        if ((_.metaKey || _.ctrlKey) && _.key.toLowerCase() === "z") {
          _.preventDefault(), D.undo(), be();
          return;
        }
        if (_.metaKey || _.ctrlKey || _.altKey) return;
        const ue = _.key.toLowerCase();
        re[ue] && (_.preventDefault(), tt(re[ue]));
      }, document.addEventListener("keydown", k, { capture: !0 });
    }
  }
  function bl(C) {
    const I = d[C], T = new Image();
    T.onload = () => {
      const O = document.createElement("canvas");
      O.width = T.naturalWidth, O.height = T.naturalHeight;
      const N = new Ji(O, I);
      N.redraw();
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
      `, O.style.cssText = "cursor:crosshair;display:block;margin:12px auto;touch-action:none;background:#fff;border-radius:4px;outline:1px solid rgba(255,255,255,.12);outline-offset:-1px;box-shadow:0 12px 44px rgba(0,0,0,.55);";
      const V = document.createElement("div");
      V.style.cssText = "flex:1;min-height:0;overflow:auto;display:block;box-shadow:inset 0 1px 0 rgba(255,255,255,.04);", V.appendChild(O);
      const F = document.createElement("style");
      F.textContent = ".kl-edtb button{transition:transform .15s cubic-bezier(.34,1.56,.64,1),background .15s ease;will-change:transform;}.kl-edtb button:hover{transform:translateY(-1px) scale(1.02);background:#45475a;}.kl-edtb button[data-color]:hover{transform:scale(1.14);background:initial;}.kl-edtb button:active{transform:scale(.96);}.kl-edtb button:focus-visible{outline:2px solid #89b4fa;outline-offset:2px;}.kl-edtb .kl-zb{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:34px;padding:0 9px;background:#313244;color:#cdd6f4;border:none;border-radius:8px;cursor:pointer;font-size:15px;font-weight:600;line-height:1;}.kl-edtb .kl-zb:hover{background:#45475a;}@media (prefers-reduced-motion:reduce){.kl-edtb button{transition:none;}.kl-edtb button:hover,.kl-edtb button:active,.kl-edtb button[data-color]:hover{transform:none;}}", D.append(F, W, V), l.appendChild(D);
      let U = 1;
      const B = (G) => Math.max(0.05, Math.min(5, G || 1));
      function $(G) {
        U = B(G), O.style.width = Math.round(O.width * U) + "px", O.style.height = Math.round(O.height * U) + "px";
        const re = W.querySelector("#klavity-zoom-pct");
        re && (re.textContent = Math.round(U * 100) + "%");
      }
      const K = () => Math.max(1, V.clientWidth - 24) / O.width, Be = () => Math.min(Math.max(1, V.clientWidth - 24) / O.width, Math.max(1, V.clientHeight - 24) / O.height), Re = O.height / O.width > Math.max(1, V.clientHeight) / Math.max(1, V.clientWidth);
      $(Re ? K() : Be()), W.querySelector("#klavity-zoom-in").addEventListener("click", () => $(U * 1.25)), W.querySelector("#klavity-zoom-out").addEventListener("click", () => $(U / 1.25)), W.querySelector("#klavity-fit-width").addEventListener("click", () => $(K())), W.querySelector("#klavity-fit-page").addEventListener("click", () => $(Be()));
      let Ee = "rect", be = "#ef4444", tt = !1, wt = [], He = 0, rt = 0;
      function nt(G) {
        Ee = G, W.querySelectorAll("[data-tool]").forEach((re) => {
          const _ = re.dataset.tool === G;
          re.style.background = _ ? "#585b70" : "#313244", re.style.outline = _ ? "2px solid #89b4fa" : "none";
        });
      }
      W.querySelectorAll("[data-tool]").forEach((G) => G.addEventListener("click", () => nt(G.dataset.tool))), W.querySelectorAll("[data-color]").forEach((G) => G.addEventListener("click", () => {
        be = G.dataset.color;
      })), W.querySelector("#klavity-undo").addEventListener("click", () => N.undo()), W.querySelector("#klavity-clear-ann").addEventListener("click", () => N.clearAll());
      const De = { p: "pen", r: "rect", c: "circle", a: "arrow", t: "text" };
      function ze(G) {
        const re = G.target;
        if (re && (re.tagName === "INPUT" || re.tagName === "TEXTAREA" || re.isContentEditable)) return;
        if (G.key === "Escape") {
          G.stopPropagation(), lt();
          return;
        }
        if ((G.metaKey || G.ctrlKey) && G.key.toLowerCase() === "z") {
          G.preventDefault(), N.undo();
          return;
        }
        if (G.metaKey || G.ctrlKey || G.altKey) return;
        const _ = G.key.toLowerCase();
        De[_] ? (G.preventDefault(), nt(De[_])) : _ === "u" && (G.preventDefault(), N.undo());
      }
      function lt() {
        document.removeEventListener("keydown", ze, { capture: !0 }), D.remove();
      }
      document.addEventListener("keydown", ze, { capture: !0 }), nt(Ee), W.querySelector("#klavity-save-ann").addEventListener("click", async () => {
        N.shapes.length ? (u[C] = { w: O.width, h: O.height, shapes: N.shapes.map((G) => ({ ...G })) }, d[C] = I) : delete u[C], lt(), z();
      }), W.querySelector("#klavity-cancel-ann").addEventListener("click", () => lt());
      function Oe(G) {
        const re = O.getBoundingClientRect();
        return { x: (G.clientX - re.left) / re.width * O.width, y: (G.clientY - re.top) / re.height * O.height };
      }
      O.addEventListener("pointerdown", (G) => {
        tt = !0;
        const re = Oe(G);
        if ({ x: He, y: rt } = re, Ee === "pen" && (wt = [re]), Ee === "text") {
          tt = !1;
          const _ = document.createElement("input");
          _.style.cssText = `position:fixed;left:${G.clientX}px;top:${G.clientY}px;background:transparent;border:1px dashed ${be};color:${be};font-size:16px;outline:none;z-index:9999999;min-width:80px;`, document.body.appendChild(_), _.focus(), _.addEventListener("blur", () => {
            _.value.trim() && N.addShape({ type: "text", color: be, x: He, y: rt, text: _.value.trim() }), _.remove();
          }, { once: !0 }), _.addEventListener("keydown", (q) => {
            q.key === "Enter" && _.blur();
          });
        }
      }), O.addEventListener("pointermove", (G) => {
        tt && Ee === "pen" && wt.push(Oe(G));
      }), O.addEventListener("pointerup", (G) => {
        if (!tt) return;
        tt = !1;
        const re = Oe(G);
        Ee === "pen" && wt.length > 1 ? N.addShape({ type: "pen", color: be, points: wt }) : Ee === "rect" ? N.addShape({ type: "rect", color: be, x: Math.min(He, re.x), y: Math.min(rt, re.y), w: Math.abs(re.x - He), h: Math.abs(re.y - rt) }) : Ee === "circle" ? N.addShape({ type: "circle", color: be, x: (He + re.x) / 2, y: (rt + re.y) / 2, rx: Math.abs(re.x - He) / 2, ry: Math.abs(re.y - rt) / 2 }) : Ee === "arrow" && N.addShape({ type: "arrow", color: be, x1: He, y1: rt, x2: re.x, y2: re.y });
      });
    }, T.src = I;
  }
  function vl(C, I, T) {
    const { copy: O, onLead: N } = T;
    y.innerHTML = "";
    const D = document.createElement("div");
    D.className = "klavity-success";
    const W = document.createElement("h2");
    if (W.innerHTML = O.headline, D.appendChild(W), O.body) {
      const F = document.createElement("p");
      F.textContent = O.body, D.appendChild(F);
    }
    if (C) {
      const F = document.createElement("div");
      F.className = "klavity-ref";
      const U = document.createElement("span");
      U.textContent = "Filed as";
      const B = document.createElement("code");
      B.textContent = is(C), F.append(U, B);
      const $ = ss(I);
      if ($) {
        const K = document.createElement("a");
        K.href = $, K.target = "_blank", K.rel = "noopener", K.textContent = "View in dashboard", F.appendChild(K);
      }
      D.appendChild(F);
    }
    const V = () => {
      if (w) return;
      const F = document.createElement("div");
      F.className = "klavity-toast-progress", y.appendChild(F);
      let U = 5e3, B = Date.now();
      const $ = () => {
        B = Date.now(), w = setTimeout(() => {
          Z();
        }, U);
      }, K = () => {
        w && (clearTimeout(w), w = null, U = Math.max(0, U - (Date.now() - B)), F.style.animationPlayState = "paused");
      }, Be = () => {
        w || y.classList.contains("kl-closing") || (F.style.animationPlayState = "running", $());
      };
      y.addEventListener("mouseenter", K), y.addEventListener("mouseleave", Be), y.addEventListener("focusin", K), y.addEventListener("focusout", (Re) => {
        y.contains(Re.relatedTarget) || Be();
      }), $();
    };
    if (O.showEmail) {
      const F = document.createElement("div");
      F.className = "klavity-lead";
      const U = document.createElement("input");
      U.type = "email", U.placeholder = "you@company.com";
      const B = document.createElement("button"), $ = O.emailLabel;
      B.textContent = $;
      const K = document.createElement("div");
      K.className = "klavity-lead-err", K.setAttribute("role", "alert"), K.style.display = "none";
      const Be = async () => {
        const Re = U.value.trim();
        if (!Re || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(Re)) {
          K.textContent = "Please enter a valid email so we can reach you.", K.style.display = "block", U.focus();
          return;
        }
        B.disabled = !0, B.textContent = "Saving…", K.style.display = "none";
        try {
          N && await N(C, Re);
        } catch (be) {
          try {
            console.warn("[Klavity] lead capture failed:", (be == null ? void 0 : be.message) || be);
          } catch {
          }
          K.textContent = "Couldn't save your email — please try again.", K.style.display = "block", B.disabled = !1, B.textContent = "Retry", U.focus();
          return;
        }
        const Ee = document.createElement("div");
        Ee.className = "klavity-thanks", Ee.textContent = "Thanks — we'll be in touch.", K.remove(), F.replaceWith(Ee), O.showCta || V();
      };
      B.addEventListener("click", Be), U.addEventListener("keydown", (Re) => {
        Re.key === "Enter" && Be();
      }), F.append(U, B), D.appendChild(F), D.appendChild(K);
    }
    if (O.showCta && O.ctaUrl) {
      const F = document.createElement("a");
      F.className = "klavity-cta", F.href = O.ctaUrl, F.target = "_blank", F.rel = "noopener", F.textContent = O.ctaText, D.appendChild(F);
    }
    if (y.appendChild(D), !n.whiteLabel) {
      const F = document.createElement("div");
      F.className = "klavity-pb", F.innerHTML = 'Powered by <a href="https://klavity.in" target="_blank" rel="noopener">Klavity</a>', y.appendChild(F);
    }
    !O.showEmail && !O.showCta && V();
  }
  return t.autoCaptureOnOpen && setTimeout(() => {
    t.onCaptureFull().then((C) => {
      const { dataUrl: I, quality: T } = Jt(C);
      ye(I, T), Ze(Xt);
    }).catch(() => {
    });
  }, 200), j;
}
function _c(e, t) {
  const r = document.createElement("div");
  r.style.cssText = "position:fixed;inset:0;cursor:crosshair;z-index:2147483646;user-select:none;", r.setAttribute("data-klavity-region-overlay", ""), document.body.appendChild(r);
  const n = document.createElement("div");
  n.textContent = "Drag to select an area · Esc to cancel", n.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-family:system-ui;font-size:14px;background:rgba(0,0,0,.7);padding:8px 16px;border-radius:6px;pointer-events:none;z-index:2147483647;", document.body.appendChild(n);
  let i = 0, s = 0, l = !1;
  function d() {
    document.removeEventListener("keydown", o, { capture: !0 }), r.remove(), n.remove();
  }
  function o(p) {
    p.key === "Escape" && (p.stopPropagation(), d(), t());
  }
  document.addEventListener("keydown", o, { capture: !0 }), r.addEventListener("pointerdown", (p) => {
    l = !0, i = p.clientX, s = p.clientY, n.remove();
  }), r.addEventListener("pointermove", (p) => {
    if (!l) return;
    const a = Math.min(p.clientX, i), h = Math.min(p.clientY, s), u = Math.abs(p.clientX - i), c = Math.abs(p.clientY - s);
    r.style.background = `
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) 0 0/${a}px 100%,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${a + u}px 0/calc(100% - ${a + u}px) 100%,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${a}px 0/${u}px ${h}px,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${a}px ${h + c}px/${u}px calc(100% - ${h + c}px)
    `, r.style.backgroundRepeat = "no-repeat";
  }), r.addEventListener("pointerup", (p) => {
    if (!l) return;
    l = !1;
    const a = Math.abs(p.clientX - i), h = Math.abs(p.clientY - s);
    if (a < 8 || h < 8) {
      d(), t();
      return;
    }
    const u = { x: Math.min(p.clientX, i), y: Math.min(p.clientY, s), w: a, h };
    d(), e(u);
  });
}
async function Dc(e) {
  if (e.type === "image/heic" || e.type === "image/heif" || e.name.endsWith(".heic") || e.name.endsWith(".heif"))
    try {
      const t = (await import("./heic2any-D6xzzX7R.js").then((n) => n.h)).default, r = await t({ blob: e, toType: "image/jpeg", quality: 0.85 });
      return os(r);
    } catch {
    }
  return os(e);
}
function os(e) {
  return new Promise((t, r) => {
    const n = new FileReader();
    n.onload = () => t(n.result), n.onerror = r, n.readAsDataURL(e);
  });
}
const zc = {
  frustrated: { accent: "#e8849a", mark: "vein", label: "Frustrated" },
  confused: { accent: "#e8a24a", mark: "q", label: "Confused" },
  satisfied: { accent: "#7fd1c4", mark: "check", label: "Satisfied" },
  delighted: { accent: "#9fd6a0", mark: "spark", label: "Delighted" },
  neutral: { accent: "#8a8276", mark: "dots", label: "Neutral" },
  inspired: { accent: "#8b8bf5", mark: "bulb", label: "Inspired" },
  alarmed: { accent: "#ef6b6b", mark: "bang", label: "Alarmed" }
};
function Fc(e) {
  const t = (e || "").trim().split(/\s+/).filter(Boolean);
  return t.length === 0 ? "?" : t.length === 1 ? t[0].slice(0, 2).toUpperCase() : (t[0][0] + t[t.length - 1][0]).toUpperCase();
}
function Uc(e) {
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
const Bc = {
  vein: "ksim-m-vein",
  spark: "ksim-m-spark",
  bulb: "ksim-m-bulb",
  bang: "ksim-m-bang",
  q: "ksim-m-q",
  dots: "ksim-m-dots",
  check: "ksim-m-check"
};
function kt(e) {
  return String(e).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function qc(e) {
  const {
    name: t,
    photoUrl: r,
    color: n = "#6f6cf2",
    emotion: i = "none",
    size: s = 58,
    eyes: l = !0,
    legs: d = !0,
    animate: o = !0,
    className: p = ""
  } = e, a = kt(e.initials || Fc(t)), h = i !== "none" ? zc[i] : null, u = h ? `<span class="ksim-mark ${o ? Bc[h.mark] : ""}" style="color:${kt(h.accent)}">${Uc(h.mark)}</span>` : "", m = r ? `<span class="ksim-head ksim-photo"><img src="${kt(r)}" alt="${kt(t)}" loading="lazy" onerror="this.style.display='none';this.parentNode.classList.add('ksim-fallback')"><span class="ksim-ini">${a}</span></span>` : `<span class="ksim-head ksim-mono"><span class="ksim-ini">${a}</span>${l ? '<span class="ksim-eyes"><i></i><i></i></span>' : ""}</span>`, f = d ? '<span class="ksim-legs"><i></i><i></i></span>' : "", g = ["ksim", o ? "is-animated" : "", p].filter(Boolean).join(" "), k = `--ksim-persona:${kt(n)};--ksim-size:${s}px;` + (h ? `--ksim-accent:${kt(h.accent)};` : "");
  return `<span class="${g}" style="${k}" data-emotion="${i}" title="${kt(t)}">${u}${m}${f}</span>`;
}
function Wc(e) {
  const t = document.createElement("template");
  return t.innerHTML = qc(e).trim(), t.content.firstElementChild;
}
const jc = `
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
function Hc(e = document) {
  var n;
  const t = e.head ?? e ?? null;
  if (!t || (n = t.querySelector) != null && n.call(t, "style[data-ksim]")) return;
  const r = document.createElement("style");
  r.setAttribute("data-ksim", ""), r.textContent = jc, t.appendChild(r);
}
function Vc(e) {
  const { context: t, description: r } = e, n = t.consoleErrors.map((o) => `- [${o.level ?? "error"}] \`${o.message}\``).join(`
`) || "_none_", i = t.networkFailures.map((o) => `- ${o.method} ${o.url} → ${o.status}${o.durationMs != null ? ` (${o.durationMs}ms)` : ""}`).join(`
`) || "_none_", s = [
    `*Page:* ${t.pageUrl}`,
    `*Browser:* ${t.userAgent}`,
    `*Screen:* ${t.screenSize}  |  *Viewport:* ${t.viewportSize}`
  ], l = t.identity ? Object.entries(t.identity).filter(([, o]) => o != null) : [], d = t.metadata ? Object.entries(t.metadata) : [];
  return (l.length || d.length) && s.push(`*User / metadata:* ${[...l, ...d].map(([o, p]) => `${o}=${p}`).join(", ")}`), [
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
async function Gc(e) {
  const { settings: t, type: r, description: n } = e, { baseUrl: i, email: s, token: l, projectKey: d } = t.jira, o = btoa(`${s}:${l}`), p = r === "bug" ? "Bug" : "Story", a = r === "bug" ? ["klavity", "klavity-bug"] : ["klavity", "klavity-feature"], h = `[Klavity] ${n.slice(0, 180)}`, u = await fetch(`${i}/rest/api/3/issue`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${o}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      fields: {
        project: { key: d },
        summary: h,
        description: { version: 1, type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: Vc(e) }] }] },
        issuetype: { name: p },
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
async function Yc(e) {
  var h, u, c;
  const { settings: t, type: r, description: n, context: i } = e, { apiKey: s, teamId: l } = t.linear, d = [
    n,
    "",
    `**Page:** ${i.pageUrl}`,
    `**Browser:** ${i.userAgent}`
  ].join(`
`), p = await (await fetch("https://api.linear.app/graphql", {
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
  if ((h = p.errors) != null && h.length)
    throw new Error(`Linear API error: ${p.errors[0].message}`);
  const a = (c = (u = p.data) == null ? void 0 : u.issueCreate) == null ? void 0 : c.issue;
  if (!a) throw new Error("Linear: no issue returned");
  return { issueKey: a.identifier, issueUrl: a.url };
}
async function Kc(e) {
  const { settings: t, type: r, description: n, context: i, screenshots: s } = e, { token: l, repo: d } = t.github, o = r === "bug" ? ["klavity", "klavity-bug"] : ["klavity", "klavity-feature"], p = s.length ? `

<details><summary>Screenshots (${s.length})</summary>

${s.map((c, m) => `![screenshot-${m + 1}](${c})`).join(`
`)}

</details>` : "", a = [
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
      body: a,
      labels: o
    })
  });
  if (!h.ok)
    throw new Error(`GitHub API error ${h.status}: ${await h.text()}`);
  const u = await h.json();
  return { issueKey: `#${u.number}`, issueUrl: u.html_url };
}
async function Xc(e) {
  const { settings: t, description: r, context: n } = e, { token: i, workspace: s, projectId: l } = t.plane, d = (t.plane.host || "https://api.plane.so").replace(/\/+$/, ""), o = d === "https://api.plane.so" ? "https://app.plane.so" : d, p = await fetch(
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
  if (!p.ok) throw new Error(`Plane API error ${p.status}: ${await p.text()}`);
  const a = await p.json();
  return {
    issueKey: String(a.sequence_id),
    issueUrl: `${o}/${s}/projects/${l}/issues/`
  };
}
function Jc(e) {
  const t = new FormData();
  return t.set("type", e.type ?? "bug"), t.set("description", e.description), t.set("page_url", e.pageUrl), e.context && t.set("context", JSON.stringify(e.context)), e.projectId && t.set("project_id", e.projectId), e.replayEvents && e.replayEvents.length && t.set("replay_events", JSON.stringify(e.replayEvents)), t;
}
async function Zc(e) {
  const { settings: t, type: r, description: n, context: i, screenshots: s, projectId: l, replayEvents: d } = e, o = Jc({ type: r, description: n, pageUrl: i.pageUrl, context: i, projectId: l, replayEvents: d }), p = t.connectionMode === "klavity" && !!t.klavToken;
  if (!p) {
    const { plane: c } = t;
    o.append("plane_token", c.token), o.append("plane_workspace", c.workspace), o.append("plane_project_id", c.projectId), o.append("plane_host", c.host);
  }
  for (let c = 0; c < s.length; c++) {
    const m = await (await fetch(s[c])).blob();
    o.append("screenshots", m, `screenshot-${c}.png`);
  }
  const a = p ? { Authorization: `Bearer ${t.klavToken}` } : {}, h = await fetch(`${t.backendUrl}/api/feedback`, { method: "POST", headers: a, body: o });
  if (!h.ok) throw new Error(`Klavity backend error ${h.status}: ${await h.text()}`);
  const u = await h.json();
  return {
    issueKey: u.jira_key ?? u.id,
    issueUrl: u.issue_url ?? t.backendUrl
  };
}
var Qc = Object.defineProperty, eu = (e, t, r) => t in e ? Qc(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, P = (e, t, r) => eu(e, typeof t != "symbol" ? t + "" : t, r), as, tu = Object.defineProperty, ru = (e, t, r) => t in e ? tu(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, ls = (e, t, r) => ru(e, typeof t != "symbol" ? t + "" : t, r), we = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(we || {});
const cs = {
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
}, us = {
  Node: ["contains", "getRootNode"],
  ShadowRoot: ["getSelection"],
  Element: [],
  MutationObserver: ["constructor"]
}, fr = {}, Zo = {}, nu = () => !!globalThis.Zone;
function wi(e) {
  if (fr[e])
    return fr[e];
  const t = globalThis[e], r = t.prototype, n = e in cs ? cs[e] : void 0, i = !!(n && // @ts-expect-error 2345
  n.every(
    (d) => {
      var o, p;
      return !!((p = (o = Object.getOwnPropertyDescriptor(r, d)) == null ? void 0 : o.get) != null && p.toString().includes("[native code]"));
    }
  )), s = e in us ? us[e] : void 0, l = !!(s && s.every(
    // @ts-expect-error 2345
    (d) => {
      var o;
      return typeof r[d] == "function" && ((o = r[d]) == null ? void 0 : o.toString().includes("[native code]"));
    }
  ));
  if (i && l && !nu())
    return fr[e] = t.prototype, t.prototype;
  try {
    const d = document.createElement("iframe");
    d.style.display = "none", document.body.appendChild(d);
    const o = d.contentWindow;
    if (!o) return t.prototype;
    const p = o[e].prototype;
    if (!p)
      return d.remove(), r;
    const a = navigator.userAgent;
    return a.includes("Safari") && !a.includes("Chrome") ? (d.classList.add("rr-block"), d.setAttribute("__rrwebUntaintedMutationObserver", ""), Zo[e] = () => d.remove()) : d.remove(), fr[e] = p;
  } catch {
    return r;
  }
}
const tn = {};
function st(e, t, r) {
  var n;
  const i = `${e}.${String(r)}`;
  if (tn[i])
    return tn[i].call(
      t
    );
  const s = wi(e), l = (n = Object.getOwnPropertyDescriptor(
    s,
    r
  )) == null ? void 0 : n.get;
  return l ? (tn[i] = l, l.call(t)) : t[r];
}
const rn = {};
function Qo(e, t, r) {
  const n = `${e}.${String(r)}`;
  if (rn[n])
    return rn[n].bind(
      t
    );
  const s = wi(e)[r];
  return typeof s != "function" ? t[r] : (rn[n] = s, s.bind(t));
}
function iu(e) {
  return st("Node", e, "ownerDocument");
}
function su(e) {
  return st("Node", e, "childNodes");
}
function ou(e) {
  return st("Node", e, "parentNode");
}
function au(e) {
  return st("Node", e, "parentElement");
}
function lu(e) {
  return st("Node", e, "textContent");
}
function cu(e, t) {
  return Qo("Node", e, "contains")(t);
}
function uu(e) {
  return Qo("Node", e, "getRootNode")();
}
function du(e) {
  return !e || !("host" in e) ? null : st("ShadowRoot", e, "host");
}
function pu(e) {
  return e.styleSheets;
}
function hu(e) {
  return !e || !("shadowRoot" in e) ? null : st("Element", e, "shadowRoot");
}
function fu(e, t) {
  return st("Element", e, "querySelector")(t);
}
function mu(e, t) {
  return st("Element", e, "querySelectorAll")(t);
}
function gu() {
  return [
    wi("MutationObserver").constructor,
    Zo.MutationObserver ?? (() => {
    })
  ];
}
let ea = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (ea = () => (/* @__PURE__ */ new Date()).getTime());
function yu(e, t, r) {
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
const Me = {
  ownerDocument: iu,
  childNodes: su,
  parentNode: ou,
  parentElement: au,
  textContent: lu,
  contains: cu,
  getRootNode: uu,
  host: du,
  styleSheets: pu,
  shadowRoot: hu,
  querySelector: fu,
  querySelectorAll: mu,
  nowTimestamp: ea,
  mutationObserverCtor: gu,
  patch: yu
};
function ta(e) {
  return e.nodeType === e.ELEMENT_NODE;
}
function Qt(e) {
  const t = (
    // anchor and textarea elements also have a `host` property
    // but only shadow roots have a `mode` property
    e && "host" in e && "mode" in e && Me.host(e) || null
  );
  return !!(t && "shadowRoot" in t && Me.shadowRoot(t) === e);
}
function er(e) {
  return Object.prototype.toString.call(e) === "[object ShadowRoot]";
}
function bu(e) {
  return e.includes(" background-clip: text;") && !e.includes(" -webkit-background-clip: text;") && (e = e.replace(
    /\sbackground-clip:\s*text;/g,
    " -webkit-background-clip: text; background-clip: text;"
  )), e;
}
function vu(e) {
  const { cssText: t } = e;
  if (t.split('"').length < 3) return t;
  const r = ["@import", `url(${JSON.stringify(e.href)})`];
  return e.layerName === "" ? r.push("layer") : e.layerName && r.push(`layer(${e.layerName})`), e.supportsText && r.push(`supports(${e.supportsText})`), e.media.length && r.push(e.media.mediaText), r.join(" ") + ";";
}
function ui(e) {
  try {
    const t = e.rules || e.cssRules;
    if (!t)
      return null;
    let r = e.href;
    !r && e.ownerNode && (r = e.ownerNode.baseURI);
    const n = Array.from(
      t,
      (i) => ra(i, r)
    ).join("");
    return bu(n);
  } catch {
    return null;
  }
}
function ra(e, t) {
  if (ku(e)) {
    let r;
    try {
      r = // for same-origin stylesheets,
      // we can access the imported stylesheet rules directly
      ui(e.styleSheet) || // work around browser issues with the raw string `@import url(...)` statement
      vu(e);
    } catch {
      r = e.cssText;
    }
    return e.styleSheet.href ? Tr(r, e.styleSheet.href) : r;
  } else {
    let r = e.cssText;
    return xu(e) && e.selectorText.includes(":") && (r = wu(r)), t ? Tr(r, t) : r;
  }
}
function wu(e) {
  const t = /(\[(?:[\w-]+)[^\\])(:(?:[\w-]+)\])/gm;
  return e.replace(t, "$1\\$2");
}
function ku(e) {
  return "styleSheet" in e;
}
function xu(e) {
  return "selectorText" in e;
}
class na {
  constructor() {
    ls(this, "idNodeMap", /* @__PURE__ */ new Map()), ls(this, "nodeMetaMap", /* @__PURE__ */ new WeakMap());
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
function Su() {
  return new na();
}
function Lr({
  element: e,
  maskInputOptions: t,
  tagName: r,
  type: n,
  value: i,
  maskInputFn: s
}) {
  let l = i || "";
  const d = n && Rt(n);
  return (t[r.toLowerCase()] || d && t[d]) && (s ? l = s(l, e) : l = "*".repeat(l.length)), l;
}
function Rt(e) {
  return e.toLowerCase();
}
const ds = "__rrweb_original__";
function Cu(e) {
  const t = e.getContext("2d");
  if (!t) return !0;
  const r = 50;
  for (let n = 0; n < e.width; n += r)
    for (let i = 0; i < e.height; i += r) {
      const s = t.getImageData, l = ds in s ? s[ds] : s;
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
function Ar(e) {
  const t = e.type;
  return e.hasAttribute("data-rr-is-password") ? "password" : t ? (
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    Rt(t)
  ) : null;
}
function ia(e, t) {
  let r;
  try {
    r = new URL(e, t ?? window.location.href);
  } catch {
    return null;
  }
  const n = /\.([0-9a-z]+)(?:$)/i, i = r.pathname.match(n);
  return (i == null ? void 0 : i[1]) ?? null;
}
function Eu(e) {
  let t = "";
  return e.indexOf("//") > -1 ? t = e.split("/").slice(0, 3).join("/") : t = e.split("/")[0], t = t.split("?")[0], t;
}
const Mu = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm, Ru = /^(?:[a-z+]+:)?\/\//i, Ou = /^www\..*/i, Iu = /^(data:)([^,]*),(.*)/i;
function Tr(e, t) {
  return (e || "").replace(
    Mu,
    (r, n, i, s, l, d) => {
      const o = i || l || d, p = n || s || "";
      if (!o)
        return r;
      if (Ru.test(o) || Ou.test(o))
        return `url(${p}${o}${p})`;
      if (Iu.test(o))
        return `url(${p}${o}${p})`;
      if (o[0] === "/")
        return `url(${p}${Eu(t) + o}${p})`;
      const a = t.split("/"), h = o.split("/");
      a.pop();
      for (const u of h)
        u !== "." && (u === ".." ? a.pop() : a.push(u));
      return `url(${p}${a.join("/")}${p})`;
    }
  );
}
function mr(e, t = !1) {
  return t ? e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "") : e.replace(/(\/\*[^*]*\*\/)|[\s;]/g, "").replace(/0px/g, "0");
}
function Lu(e, t, r = !1) {
  const n = Array.from(t.childNodes), i = [];
  let s = 0;
  if (n.length > 1 && e && typeof e == "string") {
    let l = mr(e, r);
    const d = l.length / e.length;
    for (let o = 1; o < n.length; o++)
      if (n[o].textContent && typeof n[o].textContent == "string") {
        const p = mr(
          n[o].textContent,
          r
        ), a = 100;
        let h = 3;
        for (; h < p.length && // keep consuming css identifiers (to get a decent chunk more quickly)
        (p[h].match(/[a-zA-Z0-9]/) || // substring needs to be unique to this section
        p.indexOf(p.substring(0, h), 1) !== -1); h++)
          ;
        for (; h < p.length; h++) {
          let u = p.substring(0, h), c = l.split(u), m = -1;
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
            h = a + 1;
          } else h === p.length - 1 && (m = l.indexOf(u));
          if (c.length >= 2 && h > a) {
            const f = n[o - 1].textContent;
            if (f && typeof f == "string") {
              const g = mr(f).length;
              m = l.indexOf(u, g);
            }
            m === -1 && (m = c[0].length);
          }
          if (m !== -1) {
            let f = Math.floor(m / d);
            for (; f > 0 && f < e.length; ) {
              if (s += 1, s > 50 * n.length)
                return i.push(e), i;
              const g = mr(
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
function Au(e, t) {
  return Lu(e, t).join("/* rr_split */");
}
let Tu = 1;
const Pu = new RegExp("[^a-z0-9-_:]"), rr = -2;
function sa() {
  return Tu++;
}
function Nu(e) {
  if (e instanceof HTMLFormElement)
    return "form";
  const t = Rt(e.tagName);
  return Pu.test(t) ? "div" : t;
}
let $t, ps;
const $u = /^[^ \t\n\r\u000c]+/, _u = /^[, \t\n\r\u000c]+/;
function Du(e, t) {
  if (t.trim() === "")
    return t;
  let r = 0;
  function n(s) {
    let l;
    const d = s.exec(t.substring(r));
    return d ? (l = d[0], r += l.length, l) : "";
  }
  const i = [];
  for (; n(_u), !(r >= t.length); ) {
    let s = n($u);
    if (s.slice(-1) === ",")
      s = Ft(e, s.substring(0, s.length - 1)), i.push(s);
    else {
      let l = "";
      s = Ft(e, s);
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
const hs = /* @__PURE__ */ new WeakMap();
function Ft(e, t) {
  return !t || t.trim() === "" ? t : ki(e, t);
}
function zu(e) {
  return !!(e.tagName === "svg" || e.ownerSVGElement);
}
function ki(e, t) {
  let r = hs.get(e);
  if (r || (r = e.createElement("a"), hs.set(e, r)), !t)
    t = "";
  else if (t.startsWith("blob:") || t.startsWith("data:"))
    return t;
  return r.setAttribute("href", t), r.href;
}
function oa(e, t, r, n) {
  return n && (r === "src" || r === "href" && !(t === "use" && n[0] === "#") || r === "xlink:href" && n[0] !== "#" || r === "background" && ["table", "td", "th"].includes(t) ? Ft(e, n) : r === "srcset" ? Du(e, n) : r === "style" ? Tr(n, ki(e)) : t === "object" && r === "data" ? Ft(e, n) : n);
}
function aa(e, t, r) {
  return ["video", "audio"].includes(e) && t === "autoplay";
}
function Fu(e, t, r) {
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
function Pr(e, t, r) {
  if (!e) return !1;
  if (e.nodeType !== e.ELEMENT_NODE)
    return r ? Pr(Me.parentNode(e), t, r) : !1;
  for (let n = e.classList.length; n--; ) {
    const i = e.classList[n];
    if (t.test(i))
      return !0;
  }
  return r ? Pr(Me.parentNode(e), t, r) : !1;
}
function la(e, t, r, n) {
  let i;
  if (ta(e)) {
    if (i = e, !Me.childNodes(i).length)
      return !1;
  } else {
    if (Me.parentElement(e) === null)
      return !1;
    i = Me.parentElement(e);
  }
  try {
    if (typeof t == "string") {
      if (n) {
        if (i.closest(`.${t}`)) return !0;
      } else if (i.classList.contains(t)) return !0;
    } else if (Pr(i, t, n)) return !0;
    if (r) {
      if (n) {
        if (i.closest(r)) return !0;
      } else if (i.matches(r)) return !0;
    }
  } catch {
  }
  return !1;
}
function Uu(e, t, r) {
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
function Bu(e, t, r) {
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
function qu(e, t) {
  const {
    doc: r,
    mirror: n,
    blockClass: i,
    blockSelector: s,
    needsMask: l,
    inlineStylesheet: d,
    maskInputOptions: o = {},
    maskTextFn: p,
    maskInputFn: a,
    dataURLOptions: h = {},
    inlineImages: u,
    recordCanvas: c,
    keepIframeSrcFn: m,
    newlyAddedElement: f = !1,
    cssCaptured: g = !1
  } = t, k = Wu(r, n);
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
      return Hu(e, {
        doc: r,
        blockClass: i,
        blockSelector: s,
        inlineStylesheet: d,
        maskInputOptions: o,
        maskInputFn: a,
        dataURLOptions: h,
        inlineImages: u,
        recordCanvas: c,
        keepIframeSrcFn: m,
        newlyAddedElement: f,
        rootId: k
      });
    case e.TEXT_NODE:
      return ju(e, {
        doc: r,
        needsMask: l,
        maskTextFn: p,
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
        textContent: Me.textContent(e) || "",
        rootId: k
      };
    default:
      return !1;
  }
}
function Wu(e, t) {
  if (!t.hasNode(e)) return;
  const r = t.getId(e);
  return r === 1 ? void 0 : r;
}
function ju(e, t) {
  const { needsMask: r, maskTextFn: n, rootId: i, cssCaptured: s } = t, l = Me.parentNode(e), d = l && l.tagName;
  let o = "";
  const p = d === "STYLE" ? !0 : void 0, a = d === "SCRIPT" ? !0 : void 0;
  return a ? o = "SCRIPT_PLACEHOLDER" : s || (o = Me.textContent(e), p && o && (o = Tr(o, ki(t.doc)))), !p && !a && o && r && (o = n ? n(o, Me.parentElement(e)) : o.replace(/[\S]/g, "*")), {
    type: we.Text,
    textContent: o || "",
    rootId: i
  };
}
function Hu(e, t) {
  const {
    doc: r,
    blockClass: n,
    blockSelector: i,
    inlineStylesheet: s,
    maskInputOptions: l = {},
    maskInputFn: d,
    dataURLOptions: o = {},
    inlineImages: p,
    recordCanvas: a,
    keepIframeSrcFn: h,
    newlyAddedElement: u = !1,
    rootId: c
  } = t, m = Fu(e, n, i), f = Nu(e);
  let g = {};
  const k = e.attributes.length;
  for (let w = 0; w < k; w++) {
    const S = e.attributes[w];
    aa(f, S.name, S.value) || (g[S.name] = oa(
      r,
      f,
      Rt(S.name),
      S.value
    ));
  }
  if (f === "link" && s) {
    const w = Array.from(r.styleSheets).find((v) => v.href === e.href);
    let S = null;
    w && (S = ui(w)), S && (delete g.rel, delete g.href, g._cssText = S);
  }
  if (f === "style" && e.sheet) {
    let w = ui(
      e.sheet
    );
    w && (e.childNodes.length > 1 && (w = Au(w, e)), g._cssText = w);
  }
  if (["input", "textarea", "select"].includes(f)) {
    const w = e.value, S = e.checked;
    g.type !== "radio" && g.type !== "checkbox" && g.type !== "submit" && g.type !== "button" && w ? g.value = Lr({
      element: e,
      type: Ar(e),
      tagName: f,
      value: w,
      maskInputOptions: l,
      maskInputFn: d
    }) : S && (g.checked = S);
  }
  if (f === "option" && (e.selected && !l.select ? g.selected = !0 : delete g.selected), f === "dialog" && e.open && (g.rr_open_mode = e.matches("dialog:modal") ? "modal" : "non-modal"), f === "canvas" && a) {
    if (e.__context === "2d")
      Cu(e) || (g.rr_dataURL = e.toDataURL(
        o.type,
        o.quality
      ));
    else if (!("__context" in e)) {
      const w = e.toDataURL(
        o.type,
        o.quality
      ), S = r.createElement("canvas");
      S.width = e.width, S.height = e.height;
      const v = S.toDataURL(
        o.type,
        o.quality
      );
      w !== v && (g.rr_dataURL = w);
    }
  }
  if (f === "img" && p) {
    $t || ($t = r.createElement("canvas"), ps = $t.getContext("2d"));
    const w = e, S = w.currentSrc || w.getAttribute("src") || "<unknown-src>", v = w.crossOrigin, y = () => {
      w.removeEventListener("load", y);
      try {
        $t.width = w.naturalWidth, $t.height = w.naturalHeight, ps.drawImage(w, 0, 0), g.rr_dataURL = $t.toDataURL(
          o.type,
          o.quality
        );
      } catch (x) {
        if (w.crossOrigin !== "anonymous") {
          w.crossOrigin = "anonymous", w.complete && w.naturalWidth !== 0 ? y() : w.addEventListener("load", y);
          return;
        } else
          console.warn(
            `Cannot inline img src=${S}! Error: ${x}`
          );
      }
      w.crossOrigin === "anonymous" && (v ? g.crossOrigin = v : w.removeAttribute("crossorigin"));
    };
    w.complete && w.naturalWidth !== 0 ? y() : w.addEventListener("load", y);
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
  f === "iframe" && !h(g.src) && (e.contentDocument || (g.rr_src = g.src), delete g.src);
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
    isSVG: zu(e) || void 0,
    needBlock: m,
    rootId: c,
    isCustom: b
  };
}
function ae(e) {
  return e == null ? "" : e.toLowerCase();
}
function ca(e) {
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
function Vu(e, t) {
  if (t.comment && e.type === we.Comment)
    return !0;
  if (e.type === we.Element) {
    if (t.script && // script tag
    (e.tagName === "script" || // (module)preload link
    e.tagName === "link" && (e.attributes.rel === "preload" && e.attributes.as === "script" || e.attributes.rel === "modulepreload") || // prefetch link
    e.tagName === "link" && e.attributes.rel === "prefetch" && typeof e.attributes.href == "string" && ia(e.attributes.href) === "js"))
      return !0;
    if (t.headFavicon && (e.tagName === "link" && e.attributes.rel === "shortcut icon" || e.tagName === "meta" && (ae(e.attributes.name).match(
      /^msapplication-tile(image|color)$/
    ) || ae(e.attributes.name) === "application-name" || ae(e.attributes.rel) === "icon" || ae(e.attributes.rel) === "apple-touch-icon" || ae(e.attributes.rel) === "shortcut icon")))
      return !0;
    if (e.tagName === "meta") {
      if (t.headMetaDescKeywords && ae(e.attributes.name).match(/^description|keywords$/))
        return !0;
      if (t.headMetaSocial && (ae(e.attributes.property).match(/^(og|twitter|fb):/) || // og = opengraph (facebook)
      ae(e.attributes.name).match(/^(og|twitter):/) || ae(e.attributes.name) === "pinterest"))
        return !0;
      if (t.headMetaRobots && (ae(e.attributes.name) === "robots" || ae(e.attributes.name) === "googlebot" || ae(e.attributes.name) === "bingbot"))
        return !0;
      if (t.headMetaHttpEquiv && e.attributes["http-equiv"] !== void 0)
        return !0;
      if (t.headMetaAuthorship && (ae(e.attributes.name) === "author" || ae(e.attributes.name) === "generator" || ae(e.attributes.name) === "framework" || ae(e.attributes.name) === "publisher" || ae(e.attributes.name) === "progid" || ae(e.attributes.property).match(/^article:/) || ae(e.attributes.property).match(/^product:/)))
        return !0;
      if (t.headMetaVerification && (ae(e.attributes.name) === "google-site-verification" || ae(e.attributes.name) === "yandex-verification" || ae(e.attributes.name) === "csrf-token" || ae(e.attributes.name) === "p:domain_verify" || ae(e.attributes.name) === "verify-v1" || ae(e.attributes.name) === "verification" || ae(e.attributes.name) === "shopify-checkout-api-token"))
        return !0;
    }
  }
  return !1;
}
function Ut(e, t) {
  const {
    doc: r,
    mirror: n,
    blockClass: i,
    blockSelector: s,
    maskTextClass: l,
    maskTextSelector: d,
    skipChild: o = !1,
    inlineStylesheet: p = !0,
    maskInputOptions: a = {},
    maskTextFn: h,
    maskInputFn: u,
    slimDOMOptions: c,
    dataURLOptions: m = {},
    inlineImages: f = !1,
    recordCanvas: g = !1,
    onSerialize: k,
    onIframeLoad: b,
    iframeLoadTimeout: w = 5e3,
    onStylesheetLoad: S,
    stylesheetLoadTimeout: v = 5e3,
    keepIframeSrcFn: y = () => !1,
    newlyAddedElement: x = !1,
    cssCaptured: M = !1
  } = t;
  let { needsMask: A } = t, { preserveWhiteSpace: R = !0 } = t;
  A || (A = la(
    e,
    l,
    d,
    A === void 0
  ));
  const j = qu(e, {
    doc: r,
    mirror: n,
    blockClass: i,
    blockSelector: s,
    needsMask: A,
    inlineStylesheet: p,
    maskInputOptions: a,
    maskTextFn: h,
    maskInputFn: u,
    dataURLOptions: m,
    inlineImages: f,
    recordCanvas: g,
    keepIframeSrcFn: y,
    newlyAddedElement: x,
    cssCaptured: M
  });
  if (!j)
    return console.warn(e, "not serialized"), null;
  let z;
  n.hasNode(e) ? z = n.getId(e) : Vu(j, c) || !R && j.type === we.Text && !j.textContent.replace(/^\s+|\s+$/gm, "").length ? z = rr : z = sa();
  const E = Object.assign(j, { id: z });
  if (n.add(e, E), z === rr)
    return null;
  k && k(e);
  let Te = !o;
  if (E.type === we.Element) {
    Te = Te && !E.needBlock, delete E.needBlock;
    const ie = Me.shadowRoot(e);
    ie && er(ie) && (E.isShadowHost = !0);
  }
  if ((E.type === we.Document || E.type === we.Element) && Te) {
    c.headWhitespace && E.type === we.Element && E.tagName === "head" && (R = !1);
    const ie = {
      doc: r,
      mirror: n,
      blockClass: i,
      blockSelector: s,
      needsMask: A,
      maskTextClass: l,
      maskTextSelector: d,
      skipChild: o,
      inlineStylesheet: p,
      maskInputOptions: a,
      maskTextFn: h,
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
      stylesheetLoadTimeout: v,
      keepIframeSrcFn: y,
      cssCaptured: !1
    };
    if (!(E.type === we.Element && E.tagName === "textarea" && E.attributes.value !== void 0)) {
      E.type === we.Element && E.attributes._cssText !== void 0 && typeof E.attributes._cssText == "string" && (ie.cssCaptured = !0);
      for (const he of Array.from(Me.childNodes(e))) {
        const ve = Ut(he, ie);
        ve && E.childNodes.push(ve);
      }
    }
    let se = null;
    if (ta(e) && (se = Me.shadowRoot(e)))
      for (const he of Array.from(Me.childNodes(se))) {
        const ve = Ut(he, ie);
        ve && (er(se) && (ve.isShadow = !0), E.childNodes.push(ve));
      }
  }
  const ye = Me.parentNode(e);
  return ye && Qt(ye) && er(ye) && (E.isShadow = !0), E.type === we.Element && E.tagName === "iframe" && Uu(
    e,
    () => {
      const ie = e.contentDocument;
      if (ie && b) {
        const se = Ut(ie, {
          doc: ie,
          mirror: n,
          blockClass: i,
          blockSelector: s,
          needsMask: A,
          maskTextClass: l,
          maskTextSelector: d,
          skipChild: !1,
          inlineStylesheet: p,
          maskInputOptions: a,
          maskTextFn: h,
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
          stylesheetLoadTimeout: v,
          keepIframeSrcFn: y
        });
        se && b(
          e,
          se
        );
      }
    },
    w
  ), E.type === we.Element && E.tagName === "link" && typeof E.attributes.rel == "string" && (E.attributes.rel === "stylesheet" || E.attributes.rel === "preload" && typeof E.attributes.href == "string" && ia(E.attributes.href) === "css") && Bu(
    e,
    () => {
      if (S) {
        const ie = Ut(e, {
          doc: r,
          mirror: n,
          blockClass: i,
          blockSelector: s,
          needsMask: A,
          maskTextClass: l,
          maskTextSelector: d,
          skipChild: !1,
          inlineStylesheet: p,
          maskInputOptions: a,
          maskTextFn: h,
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
          stylesheetLoadTimeout: v,
          keepIframeSrcFn: y
        });
        ie && S(
          e,
          ie
        );
      }
    },
    v
  ), E;
}
function Gu(e, t) {
  const {
    mirror: r = new na(),
    blockClass: n = "rr-block",
    blockSelector: i = null,
    maskTextClass: s = "rr-mask",
    maskTextSelector: l = null,
    inlineStylesheet: d = !0,
    inlineImages: o = !1,
    recordCanvas: p = !1,
    maskAllInputs: a = !1,
    maskTextFn: h,
    maskInputFn: u,
    slimDOM: c = !1,
    dataURLOptions: m,
    preserveWhiteSpace: f,
    onSerialize: g,
    onIframeLoad: k,
    iframeLoadTimeout: b,
    onStylesheetLoad: w,
    stylesheetLoadTimeout: S,
    keepIframeSrcFn: v = () => !1
  } = t, y = a === !0 ? {
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
  } : a, x = ca(c);
  return Ut(e, {
    doc: e,
    mirror: r,
    blockClass: n,
    blockSelector: i,
    maskTextClass: s,
    maskTextSelector: l,
    skipChild: !1,
    inlineStylesheet: d,
    maskInputOptions: y,
    maskTextFn: h,
    maskInputFn: u,
    slimDOMOptions: x,
    dataURLOptions: m,
    inlineImages: o,
    recordCanvas: p,
    preserveWhiteSpace: f,
    onSerialize: g,
    onIframeLoad: k,
    iframeLoadTimeout: b,
    onStylesheetLoad: w,
    stylesheetLoadTimeout: S,
    keepIframeSrcFn: v,
    newlyAddedElement: !1
  });
}
function Yu(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function Ku(e) {
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
var gr = { exports: {} }, fs;
function Xu() {
  if (fs) return gr.exports;
  fs = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return gr.exports = t(), gr.exports.createColors = t, gr.exports;
}
const Ju = {}, Zu = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Ju
}, Symbol.toStringTag, { value: "Module" })), Xe = /* @__PURE__ */ Ku(Zu);
var nn, ms;
function xi() {
  if (ms) return nn;
  ms = 1;
  let e = /* @__PURE__ */ Xu(), t = Xe;
  class r extends Error {
    constructor(i, s, l, d, o, p) {
      super(i), this.name = "CssSyntaxError", this.reason = i, o && (this.file = o), d && (this.source = d), p && (this.plugin = p), typeof s < "u" && typeof l < "u" && (typeof s == "number" ? (this.line = s, this.column = l) : (this.line = s.line, this.column = s.column, this.endLine = l.line, this.endColumn = l.column)), this.setMessage(), Error.captureStackTrace && Error.captureStackTrace(this, r);
    }
    setMessage() {
      this.message = this.plugin ? this.plugin + ": " : "", this.message += this.file ? this.file : "<css input>", typeof this.line < "u" && (this.message += ":" + this.line + ":" + this.column), this.message += ": " + this.reason;
    }
    showSourceCode(i) {
      if (!this.source) return "";
      let s = this.source;
      i == null && (i = e.isColorSupported), t && i && (s = t(s));
      let l = s.split(/\r?\n/), d = Math.max(this.line - 3, 0), o = Math.min(this.line + 2, l.length), p = String(o).length, a, h;
      if (i) {
        let { bold: u, gray: c, red: m } = e.createColors(!0);
        a = (f) => u(m(f)), h = (f) => c(f);
      } else
        a = h = (u) => u;
      return l.slice(d, o).map((u, c) => {
        let m = d + 1 + c, f = " " + (" " + m).slice(-p) + " | ";
        if (m === this.line) {
          let g = h(f.replace(/\d/g, " ")) + u.slice(0, this.column - 1).replace(/[^\t]/g, " ");
          return a(">") + h(f) + u + `
 ` + g + a("^");
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
  return nn = r, r.default = r, nn;
}
var yr = {}, gs;
function Si() {
  return gs || (gs = 1, yr.isClean = Symbol("isClean"), yr.my = Symbol("my")), yr;
}
var sn, ys;
function ua() {
  if (ys) return sn;
  ys = 1;
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
        let p = this.raw(i, null, "indent");
        if (p.length)
          for (let a = 0; a < o; a++) l += p;
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
        let o = i.nodes[d], p = this.raw(o, "before");
        p && this.builder(p), this.stringify(o, s !== d || l);
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
      let p = i.root();
      if (p.rawCache || (p.rawCache = {}), typeof p.rawCache[l] < "u")
        return p.rawCache[l];
      if (l === "before" || l === "after")
        return this.beforeAfter(i, l);
      {
        let a = "raw" + t(l);
        this[a] ? d = this[a](p, i) : p.walk((h) => {
          if (d = h.raws[s], typeof d < "u") return !1;
        });
      }
      return typeof d > "u" && (d = e[l]), p.rawCache[l] = d, d;
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
  return sn = r, r.default = r, sn;
}
var on, bs;
function Ur() {
  if (bs) return on;
  bs = 1;
  let e = ua();
  function t(r, n) {
    new e(n).stringify(r);
  }
  return on = t, t.default = t, on;
}
var an, vs;
function Br() {
  if (vs) return an;
  vs = 1;
  let { isClean: e, my: t } = Si(), r = xi(), n = ua(), i = Ur();
  function s(d, o) {
    let p = new d.constructor();
    for (let a in d) {
      if (!Object.prototype.hasOwnProperty.call(d, a) || a === "proxyCache") continue;
      let h = d[a], u = typeof h;
      a === "parent" && u === "object" ? o && (p[a] = o) : a === "source" ? p[a] = h : Array.isArray(h) ? p[a] = h.map((c) => s(c, p)) : (u === "object" && h !== null && (h = s(h)), p[a] = h);
    }
    return p;
  }
  class l {
    constructor(o = {}) {
      this.raws = {}, this[e] = !1, this[t] = !0;
      for (let p in o)
        if (p === "nodes") {
          this.nodes = [];
          for (let a of o[p])
            typeof a.clone == "function" ? this.append(a.clone()) : this.append(a);
        } else
          this[p] = o[p];
    }
    addToError(o) {
      if (o.postcssNode = this, o.stack && this.source && /\n\s{4}at /.test(o.stack)) {
        let p = this.source;
        o.stack = o.stack.replace(
          /\n\s{4}at /,
          `$&${p.input.from}:${p.start.line}:${p.start.column}$&`
        );
      }
      return o;
    }
    after(o) {
      return this.parent.insertAfter(this, o), this;
    }
    assign(o = {}) {
      for (let p in o)
        this[p] = o[p];
      return this;
    }
    before(o) {
      return this.parent.insertBefore(this, o), this;
    }
    cleanRaws(o) {
      delete this.raws.before, delete this.raws.after, o || delete this.raws.between;
    }
    clone(o = {}) {
      let p = s(this);
      for (let a in o)
        p[a] = o[a];
      return p;
    }
    cloneAfter(o = {}) {
      let p = this.clone(o);
      return this.parent.insertAfter(this, p), p;
    }
    cloneBefore(o = {}) {
      let p = this.clone(o);
      return this.parent.insertBefore(this, p), p;
    }
    error(o, p = {}) {
      if (this.source) {
        let { end: a, start: h } = this.rangeBy(p);
        return this.source.input.error(
          o,
          { column: h.column, line: h.line },
          { column: a.column, line: a.line },
          p
        );
      }
      return new r(o);
    }
    getProxyProcessor() {
      return {
        get(o, p) {
          return p === "proxyOf" ? o : p === "root" ? () => o.root().toProxy() : o[p];
        },
        set(o, p, a) {
          return o[p] === a || (o[p] = a, (p === "prop" || p === "value" || p === "name" || p === "params" || p === "important" || /* c8 ignore next */
          p === "text") && o.markDirty()), !0;
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
    positionBy(o, p) {
      let a = this.source.start;
      if (o.index)
        a = this.positionInside(o.index, p);
      else if (o.word) {
        p = this.toString();
        let h = p.indexOf(o.word);
        h !== -1 && (a = this.positionInside(h, p));
      }
      return a;
    }
    positionInside(o, p) {
      let a = p || this.toString(), h = this.source.start.column, u = this.source.start.line;
      for (let c = 0; c < o; c++)
        a[c] === `
` ? (h = 1, u += 1) : h += 1;
      return { column: h, line: u };
    }
    prev() {
      if (!this.parent) return;
      let o = this.parent.index(this);
      return this.parent.nodes[o - 1];
    }
    rangeBy(o) {
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
      if (o.word) {
        let h = this.toString(), u = h.indexOf(o.word);
        u !== -1 && (p = this.positionInside(u, h), a = this.positionInside(u + o.word.length, h));
      } else
        o.start ? p = {
          column: o.start.column,
          line: o.start.line
        } : o.index && (p = this.positionInside(o.index)), o.end ? a = {
          column: o.end.column,
          line: o.end.line
        } : typeof o.endIndex == "number" ? a = this.positionInside(o.endIndex) : o.index && (a = this.positionInside(o.index + 1));
      return (a.line < p.line || a.line === p.line && a.column <= p.column) && (a = { column: p.column + 1, line: p.line }), { end: a, start: p };
    }
    raw(o, p) {
      return new n().raw(this, o, p);
    }
    remove() {
      return this.parent && this.parent.removeChild(this), this.parent = void 0, this;
    }
    replaceWith(...o) {
      if (this.parent) {
        let p = this, a = !1;
        for (let h of o)
          h === this ? a = !0 : a ? (this.parent.insertAfter(p, h), p = h) : this.parent.insertBefore(p, h);
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
    toJSON(o, p) {
      let a = {}, h = p == null;
      p = p || /* @__PURE__ */ new Map();
      let u = 0;
      for (let c in this) {
        if (!Object.prototype.hasOwnProperty.call(this, c) || c === "parent" || c === "proxyCache") continue;
        let m = this[c];
        if (Array.isArray(m))
          a[c] = m.map((f) => typeof f == "object" && f.toJSON ? f.toJSON(null, p) : f);
        else if (typeof m == "object" && m.toJSON)
          a[c] = m.toJSON(null, p);
        else if (c === "source") {
          let f = p.get(m.input);
          f == null && (f = u, p.set(m.input, u), u++), a[c] = {
            end: m.end,
            inputId: f,
            start: m.start
          };
        } else
          a[c] = m;
      }
      return h && (a.inputs = [...p.keys()].map((c) => c.toJSON())), a;
    }
    toProxy() {
      return this.proxyCache || (this.proxyCache = new Proxy(this, this.getProxyProcessor())), this.proxyCache;
    }
    toString(o = i) {
      o.stringify && (o = o.stringify);
      let p = "";
      return o(this, (a) => {
        p += a;
      }), p;
    }
    warn(o, p, a) {
      let h = { node: this };
      for (let u in a) h[u] = a[u];
      return o.warn(p, h);
    }
    get proxyOf() {
      return this;
    }
  }
  return an = l, l.default = l, an;
}
var ln, ws;
function qr() {
  if (ws) return ln;
  ws = 1;
  let e = Br();
  class t extends e {
    constructor(n) {
      n && typeof n.value < "u" && typeof n.value != "string" && (n = { ...n, value: String(n.value) }), super(n), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return ln = t, t.default = t, ln;
}
var cn, ks;
function Qu() {
  if (ks) return cn;
  ks = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return cn = { nanoid: (n = 21) => {
    let i = "", s = n;
    for (; s--; )
      i += e[Math.random() * 64 | 0];
    return i;
  }, customAlphabet: (n, i = 21) => (s = i) => {
    let l = "", d = s;
    for (; d--; )
      l += n[Math.random() * n.length | 0];
    return l;
  } }, cn;
}
var un, xs;
function da() {
  if (xs) return un;
  xs = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Xe, { existsSync: r, readFileSync: n } = Xe, { dirname: i, join: s } = Xe;
  function l(o) {
    return Buffer ? Buffer.from(o, "base64").toString() : window.atob(o);
  }
  class d {
    constructor(p, a) {
      if (a.map === !1) return;
      this.loadAnnotation(p), this.inline = this.startWith(this.annotation, "data:");
      let h = a.map ? a.map.prev : void 0, u = this.loadMap(a.from, h);
      !this.mapFile && a.from && (this.mapFile = a.from), this.mapFile && (this.root = i(this.mapFile)), u && (this.text = u);
    }
    consumer() {
      return this.consumerCache || (this.consumerCache = new e(this.text)), this.consumerCache;
    }
    decodeInline(p) {
      let a = /^data:application\/json;charset=utf-?8;base64,/, h = /^data:application\/json;base64,/, u = /^data:application\/json;charset=utf-?8,/, c = /^data:application\/json,/;
      if (u.test(p) || c.test(p))
        return decodeURIComponent(p.substr(RegExp.lastMatch.length));
      if (a.test(p) || h.test(p))
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
      let a = p.match(/\/\*\s*# sourceMappingURL=/gm);
      if (!a) return;
      let h = p.lastIndexOf(a.pop()), u = p.indexOf("*/", h);
      h > -1 && u > -1 && (this.annotation = this.getAnnotationURL(p.substring(h, u)));
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
            let u = this.loadFile(h);
            if (!u)
              throw new Error(
                "Unable to load previous source map: " + h.toString()
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
  return un = d, d.default = d, un;
}
var dn, Ss;
function Wr() {
  if (Ss) return dn;
  Ss = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Xe, { fileURLToPath: r, pathToFileURL: n } = Xe, { isAbsolute: i, resolve: s } = Xe, { nanoid: l } = /* @__PURE__ */ Qu(), d = Xe, o = xi(), p = da(), a = Symbol("fromOffsetCache"), h = !!(e && t), u = !!(s && i);
  class c {
    constructor(f, g = {}) {
      if (f === null || typeof f > "u" || typeof f == "object" && !f.toString)
        throw new Error(`PostCSS received ${f} instead of CSS string`);
      if (this.css = f.toString(), this.css[0] === "\uFEFF" || this.css[0] === "￾" ? (this.hasBOM = !0, this.css = this.css.slice(1)) : this.hasBOM = !1, g.from && (!u || /^\w+:\/\//.test(g.from) || i(g.from) ? this.file = g.from : this.file = s(g.from)), u && h) {
        let k = new p(this.css, g);
        if (k.text) {
          this.map = k;
          let b = k.consumer().file;
          !this.file && b && (this.file = this.mapResolve(b));
        }
      }
      this.file || (this.id = "<input css " + l(6) + ">"), this.map && (this.map.file = this.from);
    }
    error(f, g, k, b = {}) {
      let w, S, v;
      if (g && typeof g == "object") {
        let x = g, M = k;
        if (typeof x.offset == "number") {
          let A = this.fromOffset(x.offset);
          g = A.line, k = A.col;
        } else
          g = x.line, k = x.column;
        if (typeof M.offset == "number") {
          let A = this.fromOffset(M.offset);
          S = A.line, v = A.col;
        } else
          S = M.line, v = M.column;
      } else if (!k) {
        let x = this.fromOffset(g);
        g = x.line, k = x.col;
      }
      let y = this.origin(g, k, S, v);
      return y ? w = new o(
        f,
        y.endLine === void 0 ? y.line : { column: y.column, line: y.line },
        y.endLine === void 0 ? y.column : { column: y.endColumn, line: y.endLine },
        y.source,
        y.file,
        b.plugin
      ) : w = new o(
        f,
        S === void 0 ? g : { column: k, line: g },
        S === void 0 ? k : { column: v, line: S },
        this.css,
        this.file,
        b.plugin
      ), w.input = { column: k, endColumn: v, endLine: S, line: g, source: this.css }, this.file && (n && (w.input.url = n(this.file).toString()), w.input.file = this.file), w;
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
        for (let v = 0, y = w.length; v < y; v++)
          k[v] = S, S += w[v].length + 1;
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
      let v;
      typeof k == "number" && (v = w.originalPositionFor({ column: b, line: k }));
      let y;
      i(S.source) ? y = n(S.source) : y = new URL(
        S.source,
        this.map.consumer().sourceRoot || n(this.map.mapFile)
      );
      let x = {
        column: S.column,
        endColumn: v && v.column,
        endLine: v && v.line,
        line: S.line,
        url: y.toString()
      };
      if (y.protocol === "file:")
        if (r)
          x.file = r(y);
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
  return dn = c, c.default = c, d && d.registerInput && d.registerInput(c), dn;
}
var pn, Cs;
function pa() {
  if (Cs) return pn;
  Cs = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Xe, { dirname: r, relative: n, resolve: i, sep: s } = Xe, { pathToFileURL: l } = Xe, d = Wr(), o = !!(e && t), p = !!(r && i && n && s);
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
      if (this.clearAnnotation(), p && o && this.isMap())
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
          let v = w.parent || { raws: {} };
          (!(w.type === "decl" || w.type === "atrule" && !w.nodes) || w !== v.last || v.raws.semicolon) && (w.source && w.source.end ? (f.source = this.sourcePath(w), f.original.line = w.source.end.line, f.original.column = w.source.end.column - 1, f.generated.line = u, f.generated.column = c - 2, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, f.generated.line = u, f.generated.column = c - 1, this.map.addMapping(f)));
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
  return pn = a, pn;
}
var hn, Es;
function jr() {
  if (Es) return hn;
  Es = 1;
  let e = Br();
  class t extends e {
    constructor(n) {
      super(n), this.type = "comment";
    }
  }
  return hn = t, t.default = t, hn;
}
var fn, Ms;
function Ot() {
  if (Ms) return fn;
  Ms = 1;
  let { isClean: e, my: t } = Si(), r = qr(), n = jr(), i = Br(), s, l, d, o;
  function p(u) {
    return u.map((c) => (c.nodes && (c.nodes = p(c.nodes)), delete c.source, c));
  }
  function a(u) {
    if (u[e] = !1, u.proxyOf.nodes)
      for (let c of u.proxyOf.nodes)
        a(c);
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
        c = p(s(c).nodes);
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
      return c.map((g) => (g[t] || h.rebuild(g), g = g.proxyOf, g.parent && g.parent.removeChild(g), g[e] && a(g), typeof g.raws.before > "u" && m && typeof m.raws.before < "u" && (g.raws.before = m.raws.before.replace(/\S/g, "")), g.parent = this.proxyOf, g));
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
    s = u;
  }, h.registerRule = (u) => {
    l = u;
  }, h.registerAtRule = (u) => {
    d = u;
  }, h.registerRoot = (u) => {
    o = u;
  }, fn = h, h.default = h, h.rebuild = (u) => {
    u.type === "atrule" ? Object.setPrototypeOf(u, d.prototype) : u.type === "rule" ? Object.setPrototypeOf(u, l.prototype) : u.type === "decl" ? Object.setPrototypeOf(u, r.prototype) : u.type === "comment" ? Object.setPrototypeOf(u, n.prototype) : u.type === "root" && Object.setPrototypeOf(u, o.prototype), u[t] = !0, u.nodes && u.nodes.forEach((c) => {
      h.rebuild(c);
    });
  }, fn;
}
var mn, Rs;
function Ci() {
  if (Rs) return mn;
  Rs = 1;
  let e = Ot(), t, r;
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
  }, mn = n, n.default = n, mn;
}
var gn, Os;
function ha() {
  if (Os) return gn;
  Os = 1;
  let e = {};
  return gn = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, gn;
}
var yn, Is;
function fa() {
  if (Is) return yn;
  Is = 1;
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
  return yn = e, e.default = e, yn;
}
var bn, Ls;
function Ei() {
  if (Ls) return bn;
  Ls = 1;
  let e = fa();
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
  return bn = t, t.default = t, bn;
}
var vn, As;
function ed() {
  if (As) return vn;
  As = 1;
  const e = 39, t = 34, r = 92, n = 47, i = 10, s = 32, l = 12, d = 9, o = 13, p = 91, a = 93, h = 40, u = 41, c = 123, m = 125, f = 59, g = 42, k = 58, b = 64, w = /[\t\n\f\r "#'()/;[\\\]{}]/g, S = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, v = /.[\r\n"'(/\\]/, y = /[\da-f]/i;
  return vn = function(M, A = {}) {
    let R = M.css.valueOf(), j = A.ignoreErrors, z, E, Te, ye, ie, se, he, ve, le, Z, xe = R.length, L = 0, Pe = [], Se = [];
    function at() {
      return L;
    }
    function oe(H) {
      throw M.error("Unclosed " + H, L);
    }
    function ke() {
      return Se.length === 0 && L >= xe;
    }
    function Ce(H) {
      if (Se.length) return Se.pop();
      if (L >= xe) return;
      let fe = H ? H.ignoreUnclosed : !1;
      switch (z = R.charCodeAt(L), z) {
        case i:
        case s:
        case d:
        case o:
        case l: {
          E = L;
          do
            E += 1, z = R.charCodeAt(E);
          while (z === s || z === i || z === d || z === o || z === l);
          Z = ["space", R.slice(L, E)], L = E - 1;
          break;
        }
        case p:
        case a:
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
          if (ve = Pe.length ? Pe.pop()[1] : "", le = R.charCodeAt(L + 1), ve === "url" && le !== e && le !== t && le !== s && le !== i && le !== d && le !== l && le !== o) {
            E = L;
            do {
              if (se = !1, E = R.indexOf(")", E + 1), E === -1)
                if (j || fe) {
                  E = L;
                  break;
                } else
                  oe("bracket");
              for (he = E; R.charCodeAt(he - 1) === r; )
                he -= 1, se = !se;
            } while (se);
            Z = ["brackets", R.slice(L, E + 1), L, E], L = E;
          } else
            E = R.indexOf(")", L + 1), ye = R.slice(L, E + 1), E === -1 || v.test(ye) ? Z = ["(", "(", L] : (Z = ["brackets", ye, L, E], L = E);
          break;
        }
        case e:
        case t: {
          Te = z === e ? "'" : '"', E = L;
          do {
            if (se = !1, E = R.indexOf(Te, E + 1), E === -1)
              if (j || fe) {
                E = L + 1;
                break;
              } else
                oe("string");
            for (he = E; R.charCodeAt(he - 1) === r; )
              he -= 1, se = !se;
          } while (se);
          Z = ["string", R.slice(L, E + 1), L, E], L = E;
          break;
        }
        case b: {
          w.lastIndex = L + 1, w.test(R), w.lastIndex === 0 ? E = R.length - 1 : E = w.lastIndex - 2, Z = ["at-word", R.slice(L, E + 1), L, E], L = E;
          break;
        }
        case r: {
          for (E = L, ie = !0; R.charCodeAt(E + 1) === r; )
            E += 1, ie = !ie;
          if (z = R.charCodeAt(E + 1), ie && z !== n && z !== s && z !== i && z !== d && z !== o && z !== l && (E += 1, y.test(R.charAt(E)))) {
            for (; y.test(R.charAt(E + 1)); )
              E += 1;
            R.charCodeAt(E + 1) === s && (E += 1);
          }
          Z = ["word", R.slice(L, E + 1), L, E], L = E;
          break;
        }
        default: {
          z === n && R.charCodeAt(L + 1) === g ? (E = R.indexOf("*/", L + 2) + 1, E === 0 && (j || fe ? E = R.length : oe("comment")), Z = ["comment", R.slice(L, E + 1), L, E], L = E) : (S.lastIndex = L + 1, S.test(R), S.lastIndex === 0 ? E = R.length - 1 : E = S.lastIndex - 2, Z = ["word", R.slice(L, E + 1), L, E], Pe.push(Z), L = E);
          break;
        }
      }
      return L++, Z;
    }
    function je(H) {
      Se.push(H);
    }
    return {
      back: je,
      endOfFile: ke,
      nextToken: Ce,
      position: at
    };
  }, vn;
}
var wn, Ts;
function Mi() {
  if (Ts) return wn;
  Ts = 1;
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
  return wn = t, t.default = t, e.registerAtRule(t), wn;
}
var kn, Ps;
function sr() {
  if (Ps) return kn;
  Ps = 1;
  let e = Ot(), t, r;
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
          for (let p of o)
            p.raws.before = l.raws.before;
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
  }, kn = n, n.default = n, e.registerRoot(n), kn;
}
var xn, Ns;
function ma() {
  if (Ns) return xn;
  Ns = 1;
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
      let i = [], s = "", l = !1, d = 0, o = !1, p = "", a = !1;
      for (let h of t)
        a ? a = !1 : h === "\\" ? a = !0 : o ? h === p && (o = !1) : h === '"' || h === "'" ? (o = !0, p = h) : h === "(" ? d += 1 : h === ")" ? d > 0 && (d -= 1) : d === 0 && r.includes(h) && (l = !0), l ? (s !== "" && i.push(s.trim()), s = "", l = !1) : s += h;
      return (n || s !== "") && i.push(s.trim()), i;
    }
  };
  return xn = e, e.default = e, xn;
}
var Sn, $s;
function Ri() {
  if ($s) return Sn;
  $s = 1;
  let e = Ot(), t = ma();
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
  return Sn = r, r.default = r, e.registerRule(r), Sn;
}
var Cn, _s;
function td() {
  if (_s) return Cn;
  _s = 1;
  let e = qr(), t = ed(), r = jr(), n = Mi(), i = sr(), s = Ri();
  const l = {
    empty: !0,
    space: !0
  };
  function d(p) {
    for (let a = p.length - 1; a >= 0; a--) {
      let h = p[a], u = h[3] || h[2];
      if (u) return u;
    }
  }
  class o {
    constructor(a) {
      this.input = a, this.root = new i(), this.current = this.root, this.spaces = "", this.semicolon = !1, this.createTokenizer(), this.root.source = { input: a, start: { column: 1, line: 1, offset: 0 } };
    }
    atrule(a) {
      let h = new n();
      h.name = a[1].slice(1), h.name === "" && this.unnamedAtrule(h, a), this.init(h, a[2]);
      let u, c, m, f = !1, g = !1, k = [], b = [];
      for (; !this.tokenizer.endOfFile(); ) {
        if (a = this.tokenizer.nextToken(), u = a[0], u === "(" || u === "[" ? b.push(u === "(" ? ")" : "]") : u === "{" && b.length > 0 ? b.push("}") : u === b[b.length - 1] && b.pop(), b.length === 0)
          if (u === ";") {
            h.source.end = this.getPosition(a[2]), h.source.end.offset++, this.semicolon = !0;
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
      h.raws.between = this.spacesAndCommentsFromEnd(k), k.length ? (h.raws.afterName = this.spacesAndCommentsFromStart(k), this.raw(h, "params", k), f && (a = k[k.length - 1], h.source.end = this.getPosition(a[3] || a[2]), h.source.end.offset++, this.spaces = h.raws.between, h.raws.between = "")) : (h.raws.afterName = "", h.params = ""), g && (h.nodes = [], this.current = h);
    }
    checkMissedSemicolon(a) {
      let h = this.colon(a);
      if (h === !1) return;
      let u = 0, c;
      for (let m = h - 1; m >= 0 && (c = a[m], !(c[0] !== "space" && (u += 1, u === 2))); m--)
        ;
      throw this.input.error(
        "Missed semicolon",
        c[0] === "word" ? c[3] + 1 : c[2]
      );
    }
    colon(a) {
      let h = 0, u, c, m;
      for (let [f, g] of a.entries()) {
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
    comment(a) {
      let h = new r();
      this.init(h, a[2]), h.source.end = this.getPosition(a[3] || a[2]), h.source.end.offset++;
      let u = a[1].slice(2, -2);
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
    decl(a, h) {
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
          for (let v = b; v > 0; v--) {
            let y = w[v][0];
            if (S.trim().indexOf("!") === 0 && y !== "space")
              break;
            S = w.pop()[1] + S;
          }
          S.trim().indexOf("!") === 0 && (u.important = !0, u.raws.important = S, a = w);
        }
        if (m[0] !== "space" && m[0] !== "comment")
          break;
      }
      a.some((b) => b[0] !== "space" && b[0] !== "comment") && (u.raws.between += f.map((b) => b[1]).join(""), f = []), this.raw(u, "value", f.concat(a), h), u.value.includes(":") && !h && this.checkMissedSemicolon(a);
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
      let h = !1, u = null, c = !1, m = null, f = [], g = a[1].startsWith("--"), k = [], b = a;
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
            this.tokenizer.back(k.pop()), h = !0;
            break;
          } else u === ":" && (c = !0);
        else u === f[f.length - 1] && (f.pop(), f.length === 0 && (m = null));
        b = this.tokenizer.nextToken();
      }
      if (this.tokenizer.endOfFile() && (h = !0), f.length > 0 && this.unclosedBracket(m), h && c) {
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
    raw(a, h, u, c) {
      let m, f, g = u.length, k = "", b = !0, w, S;
      for (let v = 0; v < g; v += 1)
        m = u[v], f = m[0], f === "space" && v === g - 1 && !c ? b = !1 : f === "comment" ? (S = u[v - 1] ? u[v - 1][0] : "empty", w = u[v + 1] ? u[v + 1][0] : "empty", !l[S] && !l[w] ? k.slice(-1) === "," ? b = !1 : k += m[1] : b = !1) : k += m[1];
      if (!b) {
        let v = u.reduce((y, x) => y + x[1], "");
        a.raws[h] = { raw: v, value: k };
      }
      a[h] = k;
    }
    rule(a) {
      a.pop();
      let h = new s();
      this.init(h, a[0][2]), h.raws.between = this.spacesAndCommentsFromEnd(a), this.raw(h, "selector", a), this.current = h;
    }
    spacesAndCommentsFromEnd(a) {
      let h, u = "";
      for (; a.length && (h = a[a.length - 1][0], !(h !== "space" && h !== "comment")); )
        u = a.pop()[1] + u;
      return u;
    }
    // Errors
    spacesAndCommentsFromStart(a) {
      let h, u = "";
      for (; a.length && (h = a[0][0], !(h !== "space" && h !== "comment")); )
        u += a.shift()[1];
      return u;
    }
    spacesFromEnd(a) {
      let h, u = "";
      for (; a.length && (h = a[a.length - 1][0], h === "space"); )
        u = a.pop()[1] + u;
      return u;
    }
    stringFrom(a, h) {
      let u = "";
      for (let c = h; c < a.length; c++)
        u += a[c][1];
      return a.splice(h, a.length - h), u;
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
  return Cn = o, Cn;
}
var En, Ds;
function Oi() {
  if (Ds) return En;
  Ds = 1;
  let e = Ot(), t = td(), r = Wr();
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
  return En = n, n.default = n, e.registerParse(n), En;
}
var Mn, zs;
function ga() {
  if (zs) return Mn;
  zs = 1;
  let { isClean: e, my: t } = Si(), r = pa(), n = Ur(), i = Ot(), s = Ci(), l = ha(), d = Ei(), o = Oi(), p = sr();
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
  }, u = {
    Once: !0,
    postcssPlugin: !0,
    prepare: !0
  }, c = 0;
  function m(S) {
    return typeof S == "object" && typeof S.then == "function";
  }
  function f(S) {
    let v = !1, y = a[S.type];
    return S.type === "decl" ? v = S.prop.toLowerCase() : S.type === "atrule" && (v = S.name.toLowerCase()), v && S.append ? [
      y,
      y + "-" + v,
      c,
      y + "Exit",
      y + "Exit-" + v
    ] : v ? [y, y + "-" + v, y + "Exit", y + "Exit-" + v] : S.append ? [y, c, y + "Exit"] : [y, y + "Exit"];
  }
  function g(S) {
    let v;
    return S.type === "document" ? v = ["Document", c, "DocumentExit"] : S.type === "root" ? v = ["Root", c, "RootExit"] : v = f(S), {
      eventIndex: 0,
      events: v,
      iterator: 0,
      node: S,
      visitorIndex: 0,
      visitors: []
    };
  }
  function k(S) {
    return S[e] = !1, S.nodes && S.nodes.forEach((v) => k(v)), S;
  }
  let b = {};
  class w {
    constructor(v, y, x) {
      this.stringified = !1, this.processed = !1;
      let M;
      if (typeof y == "object" && y !== null && (y.type === "root" || y.type === "document"))
        M = k(y);
      else if (y instanceof w || y instanceof d)
        M = k(y.root), y.map && (typeof x.map > "u" && (x.map = {}), x.map.inline || (x.map.inline = !1), x.map.prev = y.map);
      else {
        let A = o;
        x.syntax && (A = x.syntax.parse), x.parser && (A = x.parser), A.parse && (A = A.parse);
        try {
          M = A(y, x);
        } catch (R) {
          this.processed = !0, this.error = R;
        }
        M && !M[t] && i.rebuild(M);
      }
      this.result = new d(v, M, x), this.helpers = { ...b, postcss: b, result: this.result }, this.plugins = this.processor.plugins.map((A) => typeof A == "object" && A.prepare ? { ...A, ...A.prepare(this.result) } : A);
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
    handleError(v, y) {
      let x = this.result.lastPlugin;
      try {
        if (y && y.addToError(v), this.error = v, v.name === "CssSyntaxError" && !v.plugin)
          v.plugin = x.postcssPlugin, v.setMessage();
        else if (x.postcssVersion && process.env.NODE_ENV !== "production") {
          let M = x.postcssPlugin, A = x.postcssVersion, R = this.result.processor.version, j = A.split("."), z = R.split(".");
          (j[0] !== z[0] || parseInt(j[1]) > parseInt(z[1])) && console.error(
            "Unknown error from PostCSS plugin. Your current PostCSS version is " + R + ", but " + M + " uses " + A + ". Perhaps this is the source of the error below."
          );
        }
      } catch (M) {
        console && console.error && console.error(M);
      }
      return v;
    }
    prepareVisitors() {
      this.listeners = {};
      let v = (y, x, M) => {
        this.listeners[x] || (this.listeners[x] = []), this.listeners[x].push([y, M]);
      };
      for (let y of this.plugins)
        if (typeof y == "object")
          for (let x in y) {
            if (!h[x] && /^[A-Z]/.test(x))
              throw new Error(
                `Unknown event ${x} in ${y.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`
              );
            if (!u[x])
              if (typeof y[x] == "object")
                for (let M in y[x])
                  M === "*" ? v(y, x, y[x][M]) : v(
                    y,
                    x + "-" + M.toLowerCase(),
                    y[x][M]
                  );
              else typeof y[x] == "function" && v(y, x, y[x]);
          }
      this.hasListener = Object.keys(this.listeners).length > 0;
    }
    async runAsync() {
      this.plugin = 0;
      for (let v = 0; v < this.plugins.length; v++) {
        let y = this.plugins[v], x = this.runOnRoot(y);
        if (m(x))
          try {
            await x;
          } catch (M) {
            throw this.handleError(M);
          }
      }
      if (this.prepareVisitors(), this.hasListener) {
        let v = this.result.root;
        for (; !v[e]; ) {
          v[e] = !0;
          let y = [g(v)];
          for (; y.length > 0; ) {
            let x = this.visitTick(y);
            if (m(x))
              try {
                await x;
              } catch (M) {
                let A = y[y.length - 1].node;
                throw this.handleError(M, A);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [y, x] of this.listeners.OnceExit) {
            this.result.lastPlugin = y;
            try {
              if (v.type === "document") {
                let M = v.nodes.map(
                  (A) => x(A, this.helpers)
                );
                await Promise.all(M);
              } else
                await x(v, this.helpers);
            } catch (M) {
              throw this.handleError(M);
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
            let y = this.result.root.nodes.map(
              (x) => v.Once(x, this.helpers)
            );
            return m(y[0]) ? Promise.all(y) : y;
          }
          return v.Once(this.result.root, this.helpers);
        } else if (typeof v == "function")
          return v(this.result.root, this.result);
      } catch (y) {
        throw this.handleError(y);
      }
    }
    stringify() {
      if (this.error) throw this.error;
      if (this.stringified) return this.result;
      this.stringified = !0, this.sync();
      let v = this.result.opts, y = n;
      v.syntax && (y = v.syntax.stringify), v.stringifier && (y = v.stringifier), y.stringify && (y = y.stringify);
      let M = new r(y, this.result.root, this.result.opts).generate();
      return this.result.css = M[0], this.result.map = M[1], this.result;
    }
    sync() {
      if (this.error) throw this.error;
      if (this.processed) return this.result;
      if (this.processed = !0, this.processing)
        throw this.getAsyncError();
      for (let v of this.plugins) {
        let y = this.runOnRoot(v);
        if (m(y))
          throw this.getAsyncError();
      }
      if (this.prepareVisitors(), this.hasListener) {
        let v = this.result.root;
        for (; !v[e]; )
          v[e] = !0, this.walkSync(v);
        if (this.listeners.OnceExit)
          if (v.type === "document")
            for (let y of v.nodes)
              this.visitSync(this.listeners.OnceExit, y);
          else
            this.visitSync(this.listeners.OnceExit, v);
      }
      return this.result;
    }
    then(v, y) {
      return process.env.NODE_ENV !== "production" && ("from" in this.opts || l(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(v, y);
    }
    toString() {
      return this.css;
    }
    visitSync(v, y) {
      for (let [x, M] of v) {
        this.result.lastPlugin = x;
        let A;
        try {
          A = M(y, this.helpers);
        } catch (R) {
          throw this.handleError(R, y.proxyOf);
        }
        if (y.type !== "root" && y.type !== "document" && !y.parent)
          return !0;
        if (m(A))
          throw this.getAsyncError();
      }
    }
    visitTick(v) {
      let y = v[v.length - 1], { node: x, visitors: M } = y;
      if (x.type !== "root" && x.type !== "document" && !x.parent) {
        v.pop();
        return;
      }
      if (M.length > 0 && y.visitorIndex < M.length) {
        let [R, j] = M[y.visitorIndex];
        y.visitorIndex += 1, y.visitorIndex === M.length && (y.visitors = [], y.visitorIndex = 0), this.result.lastPlugin = R;
        try {
          return j(x.toProxy(), this.helpers);
        } catch (z) {
          throw this.handleError(z, x);
        }
      }
      if (y.iterator !== 0) {
        let R = y.iterator, j;
        for (; j = x.nodes[x.indexes[R]]; )
          if (x.indexes[R] += 1, !j[e]) {
            j[e] = !0, v.push(g(j));
            return;
          }
        y.iterator = 0, delete x.indexes[R];
      }
      let A = y.events;
      for (; y.eventIndex < A.length; ) {
        let R = A[y.eventIndex];
        if (y.eventIndex += 1, R === c) {
          x.nodes && x.nodes.length && (x[e] = !0, y.iterator = x.getIterator());
          return;
        } else if (this.listeners[R]) {
          y.visitors = this.listeners[R];
          return;
        }
      }
      v.pop();
    }
    walkSync(v) {
      v[e] = !0;
      let y = f(v);
      for (let x of y)
        if (x === c)
          v.nodes && v.each((M) => {
            M[e] || this.walkSync(M);
          });
        else {
          let M = this.listeners[x];
          if (M && this.visitSync(M, v.toProxy()))
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
  }, Mn = w, w.default = w, p.registerLazyResult(w), s.registerLazyResult(w), Mn;
}
var Rn, Fs;
function rd() {
  if (Fs) return Rn;
  Fs = 1;
  let e = pa(), t = Ur(), r = ha(), n = Oi();
  const i = Ei();
  class s {
    constructor(d, o, p) {
      o = o.toString(), this.stringified = !1, this._processor = d, this._css = o, this._opts = p, this._map = void 0;
      let a, h = t;
      this.result = new i(this._processor, a, this._opts), this.result.css = o;
      let u = this;
      Object.defineProperty(this.result, "root", {
        get() {
          return u.root;
        }
      });
      let c = new e(h, a, this._opts, o);
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
  return Rn = s, s.default = s, Rn;
}
var On, Us;
function nd() {
  if (Us) return On;
  Us = 1;
  let e = rd(), t = ga(), r = Ci(), n = sr();
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
  return On = i, i.default = i, n.registerProcessor(i), r.registerProcessor(i), On;
}
var In, Bs;
function id() {
  if (Bs) return In;
  Bs = 1;
  let e = qr(), t = da(), r = jr(), n = Mi(), i = Wr(), s = sr(), l = Ri();
  function d(o, p) {
    if (Array.isArray(o)) return o.map((u) => d(u));
    let { inputs: a, ...h } = o;
    if (a) {
      p = [];
      for (let u of a) {
        let c = { ...u, __proto__: i.prototype };
        c.map && (c.map = {
          ...c.map,
          __proto__: t.prototype
        }), p.push(c);
      }
    }
    if (h.nodes && (h.nodes = o.nodes.map((u) => d(u, p))), h.source) {
      let { inputId: u, ...c } = h.source;
      h.source = c, u != null && (h.source.input = p[u]);
    }
    if (h.type === "root")
      return new s(h);
    if (h.type === "decl")
      return new e(h);
    if (h.type === "rule")
      return new l(h);
    if (h.type === "comment")
      return new r(h);
    if (h.type === "atrule")
      return new n(h);
    throw new Error("Unknown node type: " + o.type);
  }
  return In = d, d.default = d, In;
}
var Ln, qs;
function sd() {
  if (qs) return Ln;
  qs = 1;
  let e = xi(), t = qr(), r = ga(), n = Ot(), i = nd(), s = Ur(), l = id(), d = Ci(), o = fa(), p = jr(), a = Mi(), h = Ei(), u = Wr(), c = Oi(), m = ma(), f = Ri(), g = sr(), k = Br();
  function b(...w) {
    return w.length === 1 && Array.isArray(w[0]) && (w = w[0]), new i(w);
  }
  return b.plugin = function(S, v) {
    let y = !1;
    function x(...A) {
      console && console.warn && !y && (y = !0, console.warn(
        S + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`
      ), process.env.LANG && process.env.LANG.startsWith("cn") && console.warn(
        S + `: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`
      ));
      let R = v(...A);
      return R.postcssPlugin = S, R.postcssVersion = new i().version, R;
    }
    let M;
    return Object.defineProperty(x, "postcss", {
      get() {
        return M || (M = x()), M;
      }
    }), x.process = function(A, R, j) {
      return b([x(j)]).process(A, R);
    }, x;
  }, b.stringify = s, b.parse = c, b.fromJSON = l, b.list = m, b.comment = (w) => new p(w), b.atRule = (w) => new a(w), b.decl = (w) => new t(w), b.rule = (w) => new f(w), b.root = (w) => new g(w), b.document = (w) => new d(w), b.CssSyntaxError = e, b.Declaration = t, b.Container = n, b.Processor = i, b.Document = d, b.Comment = p, b.Warning = o, b.AtRule = a, b.Result = h, b.Input = u, b.Rule = f, b.Root = g, b.Node = k, r.registerPostcss(b), Ln = b, b.default = b, Ln;
}
var od = sd();
const de = /* @__PURE__ */ Yu(od);
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
var ad = Object.defineProperty, ld = (e, t, r) => t in e ? ad(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, qe = (e, t, r) => ld(e, typeof t != "symbol" ? t + "" : t, r);
Date.now().toString();
function cd(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function ud(e) {
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
var br = { exports: {} }, Ws;
function dd() {
  if (Ws) return br.exports;
  Ws = 1;
  var e = String, t = function() {
    return { isColorSupported: !1, reset: e, bold: e, dim: e, italic: e, underline: e, inverse: e, hidden: e, strikethrough: e, black: e, red: e, green: e, yellow: e, blue: e, magenta: e, cyan: e, white: e, gray: e, bgBlack: e, bgRed: e, bgGreen: e, bgYellow: e, bgBlue: e, bgMagenta: e, bgCyan: e, bgWhite: e };
  };
  return br.exports = t(), br.exports.createColors = t, br.exports;
}
const pd = {}, hd = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: pd
}, Symbol.toStringTag, { value: "Module" })), Je = /* @__PURE__ */ ud(hd);
var An, js;
function Ii() {
  if (js) return An;
  js = 1;
  let e = /* @__PURE__ */ dd(), t = Je;
  class r extends Error {
    constructor(i, s, l, d, o, p) {
      super(i), this.name = "CssSyntaxError", this.reason = i, o && (this.file = o), d && (this.source = d), p && (this.plugin = p), typeof s < "u" && typeof l < "u" && (typeof s == "number" ? (this.line = s, this.column = l) : (this.line = s.line, this.column = s.column, this.endLine = l.line, this.endColumn = l.column)), this.setMessage(), Error.captureStackTrace && Error.captureStackTrace(this, r);
    }
    setMessage() {
      this.message = this.plugin ? this.plugin + ": " : "", this.message += this.file ? this.file : "<css input>", typeof this.line < "u" && (this.message += ":" + this.line + ":" + this.column), this.message += ": " + this.reason;
    }
    showSourceCode(i) {
      if (!this.source) return "";
      let s = this.source;
      i == null && (i = e.isColorSupported), t && i && (s = t(s));
      let l = s.split(/\r?\n/), d = Math.max(this.line - 3, 0), o = Math.min(this.line + 2, l.length), p = String(o).length, a, h;
      if (i) {
        let { bold: u, gray: c, red: m } = e.createColors(!0);
        a = (f) => u(m(f)), h = (f) => c(f);
      } else
        a = h = (u) => u;
      return l.slice(d, o).map((u, c) => {
        let m = d + 1 + c, f = " " + (" " + m).slice(-p) + " | ";
        if (m === this.line) {
          let g = h(f.replace(/\d/g, " ")) + u.slice(0, this.column - 1).replace(/[^\t]/g, " ");
          return a(">") + h(f) + u + `
 ` + g + a("^");
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
  return An = r, r.default = r, An;
}
var vr = {}, Hs;
function Li() {
  return Hs || (Hs = 1, vr.isClean = Symbol("isClean"), vr.my = Symbol("my")), vr;
}
var Tn, Vs;
function ya() {
  if (Vs) return Tn;
  Vs = 1;
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
        let p = this.raw(i, null, "indent");
        if (p.length)
          for (let a = 0; a < o; a++) l += p;
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
        let o = i.nodes[d], p = this.raw(o, "before");
        p && this.builder(p), this.stringify(o, s !== d || l);
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
      let p = i.root();
      if (p.rawCache || (p.rawCache = {}), typeof p.rawCache[l] < "u")
        return p.rawCache[l];
      if (l === "before" || l === "after")
        return this.beforeAfter(i, l);
      {
        let a = "raw" + t(l);
        this[a] ? d = this[a](p, i) : p.walk((h) => {
          if (d = h.raws[s], typeof d < "u") return !1;
        });
      }
      return typeof d > "u" && (d = e[l]), p.rawCache[l] = d, d;
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
  return Tn = r, r.default = r, Tn;
}
var Pn, Gs;
function Hr() {
  if (Gs) return Pn;
  Gs = 1;
  let e = ya();
  function t(r, n) {
    new e(n).stringify(r);
  }
  return Pn = t, t.default = t, Pn;
}
var Nn, Ys;
function Vr() {
  if (Ys) return Nn;
  Ys = 1;
  let { isClean: e, my: t } = Li(), r = Ii(), n = ya(), i = Hr();
  function s(d, o) {
    let p = new d.constructor();
    for (let a in d) {
      if (!Object.prototype.hasOwnProperty.call(d, a) || a === "proxyCache") continue;
      let h = d[a], u = typeof h;
      a === "parent" && u === "object" ? o && (p[a] = o) : a === "source" ? p[a] = h : Array.isArray(h) ? p[a] = h.map((c) => s(c, p)) : (u === "object" && h !== null && (h = s(h)), p[a] = h);
    }
    return p;
  }
  class l {
    constructor(o = {}) {
      this.raws = {}, this[e] = !1, this[t] = !0;
      for (let p in o)
        if (p === "nodes") {
          this.nodes = [];
          for (let a of o[p])
            typeof a.clone == "function" ? this.append(a.clone()) : this.append(a);
        } else
          this[p] = o[p];
    }
    addToError(o) {
      if (o.postcssNode = this, o.stack && this.source && /\n\s{4}at /.test(o.stack)) {
        let p = this.source;
        o.stack = o.stack.replace(
          /\n\s{4}at /,
          `$&${p.input.from}:${p.start.line}:${p.start.column}$&`
        );
      }
      return o;
    }
    after(o) {
      return this.parent.insertAfter(this, o), this;
    }
    assign(o = {}) {
      for (let p in o)
        this[p] = o[p];
      return this;
    }
    before(o) {
      return this.parent.insertBefore(this, o), this;
    }
    cleanRaws(o) {
      delete this.raws.before, delete this.raws.after, o || delete this.raws.between;
    }
    clone(o = {}) {
      let p = s(this);
      for (let a in o)
        p[a] = o[a];
      return p;
    }
    cloneAfter(o = {}) {
      let p = this.clone(o);
      return this.parent.insertAfter(this, p), p;
    }
    cloneBefore(o = {}) {
      let p = this.clone(o);
      return this.parent.insertBefore(this, p), p;
    }
    error(o, p = {}) {
      if (this.source) {
        let { end: a, start: h } = this.rangeBy(p);
        return this.source.input.error(
          o,
          { column: h.column, line: h.line },
          { column: a.column, line: a.line },
          p
        );
      }
      return new r(o);
    }
    getProxyProcessor() {
      return {
        get(o, p) {
          return p === "proxyOf" ? o : p === "root" ? () => o.root().toProxy() : o[p];
        },
        set(o, p, a) {
          return o[p] === a || (o[p] = a, (p === "prop" || p === "value" || p === "name" || p === "params" || p === "important" || /* c8 ignore next */
          p === "text") && o.markDirty()), !0;
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
    positionBy(o, p) {
      let a = this.source.start;
      if (o.index)
        a = this.positionInside(o.index, p);
      else if (o.word) {
        p = this.toString();
        let h = p.indexOf(o.word);
        h !== -1 && (a = this.positionInside(h, p));
      }
      return a;
    }
    positionInside(o, p) {
      let a = p || this.toString(), h = this.source.start.column, u = this.source.start.line;
      for (let c = 0; c < o; c++)
        a[c] === `
` ? (h = 1, u += 1) : h += 1;
      return { column: h, line: u };
    }
    prev() {
      if (!this.parent) return;
      let o = this.parent.index(this);
      return this.parent.nodes[o - 1];
    }
    rangeBy(o) {
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
      if (o.word) {
        let h = this.toString(), u = h.indexOf(o.word);
        u !== -1 && (p = this.positionInside(u, h), a = this.positionInside(u + o.word.length, h));
      } else
        o.start ? p = {
          column: o.start.column,
          line: o.start.line
        } : o.index && (p = this.positionInside(o.index)), o.end ? a = {
          column: o.end.column,
          line: o.end.line
        } : typeof o.endIndex == "number" ? a = this.positionInside(o.endIndex) : o.index && (a = this.positionInside(o.index + 1));
      return (a.line < p.line || a.line === p.line && a.column <= p.column) && (a = { column: p.column + 1, line: p.line }), { end: a, start: p };
    }
    raw(o, p) {
      return new n().raw(this, o, p);
    }
    remove() {
      return this.parent && this.parent.removeChild(this), this.parent = void 0, this;
    }
    replaceWith(...o) {
      if (this.parent) {
        let p = this, a = !1;
        for (let h of o)
          h === this ? a = !0 : a ? (this.parent.insertAfter(p, h), p = h) : this.parent.insertBefore(p, h);
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
    toJSON(o, p) {
      let a = {}, h = p == null;
      p = p || /* @__PURE__ */ new Map();
      let u = 0;
      for (let c in this) {
        if (!Object.prototype.hasOwnProperty.call(this, c) || c === "parent" || c === "proxyCache") continue;
        let m = this[c];
        if (Array.isArray(m))
          a[c] = m.map((f) => typeof f == "object" && f.toJSON ? f.toJSON(null, p) : f);
        else if (typeof m == "object" && m.toJSON)
          a[c] = m.toJSON(null, p);
        else if (c === "source") {
          let f = p.get(m.input);
          f == null && (f = u, p.set(m.input, u), u++), a[c] = {
            end: m.end,
            inputId: f,
            start: m.start
          };
        } else
          a[c] = m;
      }
      return h && (a.inputs = [...p.keys()].map((c) => c.toJSON())), a;
    }
    toProxy() {
      return this.proxyCache || (this.proxyCache = new Proxy(this, this.getProxyProcessor())), this.proxyCache;
    }
    toString(o = i) {
      o.stringify && (o = o.stringify);
      let p = "";
      return o(this, (a) => {
        p += a;
      }), p;
    }
    warn(o, p, a) {
      let h = { node: this };
      for (let u in a) h[u] = a[u];
      return o.warn(p, h);
    }
    get proxyOf() {
      return this;
    }
  }
  return Nn = l, l.default = l, Nn;
}
var $n, Ks;
function Gr() {
  if (Ks) return $n;
  Ks = 1;
  let e = Vr();
  class t extends e {
    constructor(n) {
      n && typeof n.value < "u" && typeof n.value != "string" && (n = { ...n, value: String(n.value) }), super(n), this.type = "decl";
    }
    get variable() {
      return this.prop.startsWith("--") || this.prop[0] === "$";
    }
  }
  return $n = t, t.default = t, $n;
}
var _n, Xs;
function fd() {
  if (Xs) return _n;
  Xs = 1;
  let e = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
  return _n = { nanoid: (n = 21) => {
    let i = "", s = n;
    for (; s--; )
      i += e[Math.random() * 64 | 0];
    return i;
  }, customAlphabet: (n, i = 21) => (s = i) => {
    let l = "", d = s;
    for (; d--; )
      l += n[Math.random() * n.length | 0];
    return l;
  } }, _n;
}
var Dn, Js;
function ba() {
  if (Js) return Dn;
  Js = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Je, { existsSync: r, readFileSync: n } = Je, { dirname: i, join: s } = Je;
  function l(o) {
    return Buffer ? Buffer.from(o, "base64").toString() : window.atob(o);
  }
  class d {
    constructor(p, a) {
      if (a.map === !1) return;
      this.loadAnnotation(p), this.inline = this.startWith(this.annotation, "data:");
      let h = a.map ? a.map.prev : void 0, u = this.loadMap(a.from, h);
      !this.mapFile && a.from && (this.mapFile = a.from), this.mapFile && (this.root = i(this.mapFile)), u && (this.text = u);
    }
    consumer() {
      return this.consumerCache || (this.consumerCache = new e(this.text)), this.consumerCache;
    }
    decodeInline(p) {
      let a = /^data:application\/json;charset=utf-?8;base64,/, h = /^data:application\/json;base64,/, u = /^data:application\/json;charset=utf-?8,/, c = /^data:application\/json,/;
      if (u.test(p) || c.test(p))
        return decodeURIComponent(p.substr(RegExp.lastMatch.length));
      if (a.test(p) || h.test(p))
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
      let a = p.match(/\/\*\s*# sourceMappingURL=/gm);
      if (!a) return;
      let h = p.lastIndexOf(a.pop()), u = p.indexOf("*/", h);
      h > -1 && u > -1 && (this.annotation = this.getAnnotationURL(p.substring(h, u)));
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
            let u = this.loadFile(h);
            if (!u)
              throw new Error(
                "Unable to load previous source map: " + h.toString()
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
  return Dn = d, d.default = d, Dn;
}
var zn, Zs;
function Yr() {
  if (Zs) return zn;
  Zs = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Je, { fileURLToPath: r, pathToFileURL: n } = Je, { isAbsolute: i, resolve: s } = Je, { nanoid: l } = /* @__PURE__ */ fd(), d = Je, o = Ii(), p = ba(), a = Symbol("fromOffsetCache"), h = !!(e && t), u = !!(s && i);
  class c {
    constructor(f, g = {}) {
      if (f === null || typeof f > "u" || typeof f == "object" && !f.toString)
        throw new Error(`PostCSS received ${f} instead of CSS string`);
      if (this.css = f.toString(), this.css[0] === "\uFEFF" || this.css[0] === "￾" ? (this.hasBOM = !0, this.css = this.css.slice(1)) : this.hasBOM = !1, g.from && (!u || /^\w+:\/\//.test(g.from) || i(g.from) ? this.file = g.from : this.file = s(g.from)), u && h) {
        let k = new p(this.css, g);
        if (k.text) {
          this.map = k;
          let b = k.consumer().file;
          !this.file && b && (this.file = this.mapResolve(b));
        }
      }
      this.file || (this.id = "<input css " + l(6) + ">"), this.map && (this.map.file = this.from);
    }
    error(f, g, k, b = {}) {
      let w, S, v;
      if (g && typeof g == "object") {
        let x = g, M = k;
        if (typeof x.offset == "number") {
          let A = this.fromOffset(x.offset);
          g = A.line, k = A.col;
        } else
          g = x.line, k = x.column;
        if (typeof M.offset == "number") {
          let A = this.fromOffset(M.offset);
          S = A.line, v = A.col;
        } else
          S = M.line, v = M.column;
      } else if (!k) {
        let x = this.fromOffset(g);
        g = x.line, k = x.col;
      }
      let y = this.origin(g, k, S, v);
      return y ? w = new o(
        f,
        y.endLine === void 0 ? y.line : { column: y.column, line: y.line },
        y.endLine === void 0 ? y.column : { column: y.endColumn, line: y.endLine },
        y.source,
        y.file,
        b.plugin
      ) : w = new o(
        f,
        S === void 0 ? g : { column: k, line: g },
        S === void 0 ? k : { column: v, line: S },
        this.css,
        this.file,
        b.plugin
      ), w.input = { column: k, endColumn: v, endLine: S, line: g, source: this.css }, this.file && (n && (w.input.url = n(this.file).toString()), w.input.file = this.file), w;
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
        for (let v = 0, y = w.length; v < y; v++)
          k[v] = S, S += w[v].length + 1;
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
      let v;
      typeof k == "number" && (v = w.originalPositionFor({ column: b, line: k }));
      let y;
      i(S.source) ? y = n(S.source) : y = new URL(
        S.source,
        this.map.consumer().sourceRoot || n(this.map.mapFile)
      );
      let x = {
        column: S.column,
        endColumn: v && v.column,
        endLine: v && v.line,
        line: S.line,
        url: y.toString()
      };
      if (y.protocol === "file:")
        if (r)
          x.file = r(y);
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
  return zn = c, c.default = c, d && d.registerInput && d.registerInput(c), zn;
}
var Fn, Qs;
function va() {
  if (Qs) return Fn;
  Qs = 1;
  let { SourceMapConsumer: e, SourceMapGenerator: t } = Je, { dirname: r, relative: n, resolve: i, sep: s } = Je, { pathToFileURL: l } = Je, d = Yr(), o = !!(e && t), p = !!(r && i && n && s);
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
      if (this.clearAnnotation(), p && o && this.isMap())
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
          let v = w.parent || { raws: {} };
          (!(w.type === "decl" || w.type === "atrule" && !w.nodes) || w !== v.last || v.raws.semicolon) && (w.source && w.source.end ? (f.source = this.sourcePath(w), f.original.line = w.source.end.line, f.original.column = w.source.end.column - 1, f.generated.line = u, f.generated.column = c - 2, this.map.addMapping(f)) : (f.source = m, f.original.line = 1, f.original.column = 0, f.generated.line = u, f.generated.column = c - 1, this.map.addMapping(f)));
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
  return Fn = a, Fn;
}
var Un, eo;
function Kr() {
  if (eo) return Un;
  eo = 1;
  let e = Vr();
  class t extends e {
    constructor(n) {
      super(n), this.type = "comment";
    }
  }
  return Un = t, t.default = t, Un;
}
var Bn, to;
function It() {
  if (to) return Bn;
  to = 1;
  let { isClean: e, my: t } = Li(), r = Gr(), n = Kr(), i = Vr(), s, l, d, o;
  function p(u) {
    return u.map((c) => (c.nodes && (c.nodes = p(c.nodes)), delete c.source, c));
  }
  function a(u) {
    if (u[e] = !1, u.proxyOf.nodes)
      for (let c of u.proxyOf.nodes)
        a(c);
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
        c = p(s(c).nodes);
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
      return c.map((g) => (g[t] || h.rebuild(g), g = g.proxyOf, g.parent && g.parent.removeChild(g), g[e] && a(g), typeof g.raws.before > "u" && m && typeof m.raws.before < "u" && (g.raws.before = m.raws.before.replace(/\S/g, "")), g.parent = this.proxyOf, g));
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
    s = u;
  }, h.registerRule = (u) => {
    l = u;
  }, h.registerAtRule = (u) => {
    d = u;
  }, h.registerRoot = (u) => {
    o = u;
  }, Bn = h, h.default = h, h.rebuild = (u) => {
    u.type === "atrule" ? Object.setPrototypeOf(u, d.prototype) : u.type === "rule" ? Object.setPrototypeOf(u, l.prototype) : u.type === "decl" ? Object.setPrototypeOf(u, r.prototype) : u.type === "comment" ? Object.setPrototypeOf(u, n.prototype) : u.type === "root" && Object.setPrototypeOf(u, o.prototype), u[t] = !0, u.nodes && u.nodes.forEach((c) => {
      h.rebuild(c);
    });
  }, Bn;
}
var qn, ro;
function Ai() {
  if (ro) return qn;
  ro = 1;
  let e = It(), t, r;
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
  }, qn = n, n.default = n, qn;
}
var Wn, no;
function wa() {
  if (no) return Wn;
  no = 1;
  let e = {};
  return Wn = function(r) {
    e[r] || (e[r] = !0, typeof console < "u" && console.warn && console.warn(r));
  }, Wn;
}
var jn, io;
function ka() {
  if (io) return jn;
  io = 1;
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
  return jn = e, e.default = e, jn;
}
var Hn, so;
function Ti() {
  if (so) return Hn;
  so = 1;
  let e = ka();
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
  return Hn = t, t.default = t, Hn;
}
var Vn, oo;
function md() {
  if (oo) return Vn;
  oo = 1;
  const e = 39, t = 34, r = 92, n = 47, i = 10, s = 32, l = 12, d = 9, o = 13, p = 91, a = 93, h = 40, u = 41, c = 123, m = 125, f = 59, g = 42, k = 58, b = 64, w = /[\t\n\f\r "#'()/;[\\\]{}]/g, S = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, v = /.[\r\n"'(/\\]/, y = /[\da-f]/i;
  return Vn = function(M, A = {}) {
    let R = M.css.valueOf(), j = A.ignoreErrors, z, E, Te, ye, ie, se, he, ve, le, Z, xe = R.length, L = 0, Pe = [], Se = [];
    function at() {
      return L;
    }
    function oe(H) {
      throw M.error("Unclosed " + H, L);
    }
    function ke() {
      return Se.length === 0 && L >= xe;
    }
    function Ce(H) {
      if (Se.length) return Se.pop();
      if (L >= xe) return;
      let fe = H ? H.ignoreUnclosed : !1;
      switch (z = R.charCodeAt(L), z) {
        case i:
        case s:
        case d:
        case o:
        case l: {
          E = L;
          do
            E += 1, z = R.charCodeAt(E);
          while (z === s || z === i || z === d || z === o || z === l);
          Z = ["space", R.slice(L, E)], L = E - 1;
          break;
        }
        case p:
        case a:
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
          if (ve = Pe.length ? Pe.pop()[1] : "", le = R.charCodeAt(L + 1), ve === "url" && le !== e && le !== t && le !== s && le !== i && le !== d && le !== l && le !== o) {
            E = L;
            do {
              if (se = !1, E = R.indexOf(")", E + 1), E === -1)
                if (j || fe) {
                  E = L;
                  break;
                } else
                  oe("bracket");
              for (he = E; R.charCodeAt(he - 1) === r; )
                he -= 1, se = !se;
            } while (se);
            Z = ["brackets", R.slice(L, E + 1), L, E], L = E;
          } else
            E = R.indexOf(")", L + 1), ye = R.slice(L, E + 1), E === -1 || v.test(ye) ? Z = ["(", "(", L] : (Z = ["brackets", ye, L, E], L = E);
          break;
        }
        case e:
        case t: {
          Te = z === e ? "'" : '"', E = L;
          do {
            if (se = !1, E = R.indexOf(Te, E + 1), E === -1)
              if (j || fe) {
                E = L + 1;
                break;
              } else
                oe("string");
            for (he = E; R.charCodeAt(he - 1) === r; )
              he -= 1, se = !se;
          } while (se);
          Z = ["string", R.slice(L, E + 1), L, E], L = E;
          break;
        }
        case b: {
          w.lastIndex = L + 1, w.test(R), w.lastIndex === 0 ? E = R.length - 1 : E = w.lastIndex - 2, Z = ["at-word", R.slice(L, E + 1), L, E], L = E;
          break;
        }
        case r: {
          for (E = L, ie = !0; R.charCodeAt(E + 1) === r; )
            E += 1, ie = !ie;
          if (z = R.charCodeAt(E + 1), ie && z !== n && z !== s && z !== i && z !== d && z !== o && z !== l && (E += 1, y.test(R.charAt(E)))) {
            for (; y.test(R.charAt(E + 1)); )
              E += 1;
            R.charCodeAt(E + 1) === s && (E += 1);
          }
          Z = ["word", R.slice(L, E + 1), L, E], L = E;
          break;
        }
        default: {
          z === n && R.charCodeAt(L + 1) === g ? (E = R.indexOf("*/", L + 2) + 1, E === 0 && (j || fe ? E = R.length : oe("comment")), Z = ["comment", R.slice(L, E + 1), L, E], L = E) : (S.lastIndex = L + 1, S.test(R), S.lastIndex === 0 ? E = R.length - 1 : E = S.lastIndex - 2, Z = ["word", R.slice(L, E + 1), L, E], Pe.push(Z), L = E);
          break;
        }
      }
      return L++, Z;
    }
    function je(H) {
      Se.push(H);
    }
    return {
      back: je,
      endOfFile: ke,
      nextToken: Ce,
      position: at
    };
  }, Vn;
}
var Gn, ao;
function Pi() {
  if (ao) return Gn;
  ao = 1;
  let e = It();
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
  return Gn = t, t.default = t, e.registerAtRule(t), Gn;
}
var Yn, lo;
function or() {
  if (lo) return Yn;
  lo = 1;
  let e = It(), t, r;
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
          for (let p of o)
            p.raws.before = l.raws.before;
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
  }, Yn = n, n.default = n, e.registerRoot(n), Yn;
}
var Kn, co;
function xa() {
  if (co) return Kn;
  co = 1;
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
      let i = [], s = "", l = !1, d = 0, o = !1, p = "", a = !1;
      for (let h of t)
        a ? a = !1 : h === "\\" ? a = !0 : o ? h === p && (o = !1) : h === '"' || h === "'" ? (o = !0, p = h) : h === "(" ? d += 1 : h === ")" ? d > 0 && (d -= 1) : d === 0 && r.includes(h) && (l = !0), l ? (s !== "" && i.push(s.trim()), s = "", l = !1) : s += h;
      return (n || s !== "") && i.push(s.trim()), i;
    }
  };
  return Kn = e, e.default = e, Kn;
}
var Xn, uo;
function Ni() {
  if (uo) return Xn;
  uo = 1;
  let e = It(), t = xa();
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
  return Xn = r, r.default = r, e.registerRule(r), Xn;
}
var Jn, po;
function gd() {
  if (po) return Jn;
  po = 1;
  let e = Gr(), t = md(), r = Kr(), n = Pi(), i = or(), s = Ni();
  const l = {
    empty: !0,
    space: !0
  };
  function d(p) {
    for (let a = p.length - 1; a >= 0; a--) {
      let h = p[a], u = h[3] || h[2];
      if (u) return u;
    }
  }
  class o {
    constructor(a) {
      this.input = a, this.root = new i(), this.current = this.root, this.spaces = "", this.semicolon = !1, this.createTokenizer(), this.root.source = { input: a, start: { column: 1, line: 1, offset: 0 } };
    }
    atrule(a) {
      let h = new n();
      h.name = a[1].slice(1), h.name === "" && this.unnamedAtrule(h, a), this.init(h, a[2]);
      let u, c, m, f = !1, g = !1, k = [], b = [];
      for (; !this.tokenizer.endOfFile(); ) {
        if (a = this.tokenizer.nextToken(), u = a[0], u === "(" || u === "[" ? b.push(u === "(" ? ")" : "]") : u === "{" && b.length > 0 ? b.push("}") : u === b[b.length - 1] && b.pop(), b.length === 0)
          if (u === ";") {
            h.source.end = this.getPosition(a[2]), h.source.end.offset++, this.semicolon = !0;
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
      h.raws.between = this.spacesAndCommentsFromEnd(k), k.length ? (h.raws.afterName = this.spacesAndCommentsFromStart(k), this.raw(h, "params", k), f && (a = k[k.length - 1], h.source.end = this.getPosition(a[3] || a[2]), h.source.end.offset++, this.spaces = h.raws.between, h.raws.between = "")) : (h.raws.afterName = "", h.params = ""), g && (h.nodes = [], this.current = h);
    }
    checkMissedSemicolon(a) {
      let h = this.colon(a);
      if (h === !1) return;
      let u = 0, c;
      for (let m = h - 1; m >= 0 && (c = a[m], !(c[0] !== "space" && (u += 1, u === 2))); m--)
        ;
      throw this.input.error(
        "Missed semicolon",
        c[0] === "word" ? c[3] + 1 : c[2]
      );
    }
    colon(a) {
      let h = 0, u, c, m;
      for (let [f, g] of a.entries()) {
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
    comment(a) {
      let h = new r();
      this.init(h, a[2]), h.source.end = this.getPosition(a[3] || a[2]), h.source.end.offset++;
      let u = a[1].slice(2, -2);
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
    decl(a, h) {
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
          for (let v = b; v > 0; v--) {
            let y = w[v][0];
            if (S.trim().indexOf("!") === 0 && y !== "space")
              break;
            S = w.pop()[1] + S;
          }
          S.trim().indexOf("!") === 0 && (u.important = !0, u.raws.important = S, a = w);
        }
        if (m[0] !== "space" && m[0] !== "comment")
          break;
      }
      a.some((b) => b[0] !== "space" && b[0] !== "comment") && (u.raws.between += f.map((b) => b[1]).join(""), f = []), this.raw(u, "value", f.concat(a), h), u.value.includes(":") && !h && this.checkMissedSemicolon(a);
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
      let h = !1, u = null, c = !1, m = null, f = [], g = a[1].startsWith("--"), k = [], b = a;
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
            this.tokenizer.back(k.pop()), h = !0;
            break;
          } else u === ":" && (c = !0);
        else u === f[f.length - 1] && (f.pop(), f.length === 0 && (m = null));
        b = this.tokenizer.nextToken();
      }
      if (this.tokenizer.endOfFile() && (h = !0), f.length > 0 && this.unclosedBracket(m), h && c) {
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
    raw(a, h, u, c) {
      let m, f, g = u.length, k = "", b = !0, w, S;
      for (let v = 0; v < g; v += 1)
        m = u[v], f = m[0], f === "space" && v === g - 1 && !c ? b = !1 : f === "comment" ? (S = u[v - 1] ? u[v - 1][0] : "empty", w = u[v + 1] ? u[v + 1][0] : "empty", !l[S] && !l[w] ? k.slice(-1) === "," ? b = !1 : k += m[1] : b = !1) : k += m[1];
      if (!b) {
        let v = u.reduce((y, x) => y + x[1], "");
        a.raws[h] = { raw: v, value: k };
      }
      a[h] = k;
    }
    rule(a) {
      a.pop();
      let h = new s();
      this.init(h, a[0][2]), h.raws.between = this.spacesAndCommentsFromEnd(a), this.raw(h, "selector", a), this.current = h;
    }
    spacesAndCommentsFromEnd(a) {
      let h, u = "";
      for (; a.length && (h = a[a.length - 1][0], !(h !== "space" && h !== "comment")); )
        u = a.pop()[1] + u;
      return u;
    }
    // Errors
    spacesAndCommentsFromStart(a) {
      let h, u = "";
      for (; a.length && (h = a[0][0], !(h !== "space" && h !== "comment")); )
        u += a.shift()[1];
      return u;
    }
    spacesFromEnd(a) {
      let h, u = "";
      for (; a.length && (h = a[a.length - 1][0], h === "space"); )
        u = a.pop()[1] + u;
      return u;
    }
    stringFrom(a, h) {
      let u = "";
      for (let c = h; c < a.length; c++)
        u += a[c][1];
      return a.splice(h, a.length - h), u;
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
  return Jn = o, Jn;
}
var Zn, ho;
function $i() {
  if (ho) return Zn;
  ho = 1;
  let e = It(), t = gd(), r = Yr();
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
  return Zn = n, n.default = n, e.registerParse(n), Zn;
}
var Qn, fo;
function Sa() {
  if (fo) return Qn;
  fo = 1;
  let { isClean: e, my: t } = Li(), r = va(), n = Hr(), i = It(), s = Ai(), l = wa(), d = Ti(), o = $i(), p = or();
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
  }, u = {
    Once: !0,
    postcssPlugin: !0,
    prepare: !0
  }, c = 0;
  function m(S) {
    return typeof S == "object" && typeof S.then == "function";
  }
  function f(S) {
    let v = !1, y = a[S.type];
    return S.type === "decl" ? v = S.prop.toLowerCase() : S.type === "atrule" && (v = S.name.toLowerCase()), v && S.append ? [
      y,
      y + "-" + v,
      c,
      y + "Exit",
      y + "Exit-" + v
    ] : v ? [y, y + "-" + v, y + "Exit", y + "Exit-" + v] : S.append ? [y, c, y + "Exit"] : [y, y + "Exit"];
  }
  function g(S) {
    let v;
    return S.type === "document" ? v = ["Document", c, "DocumentExit"] : S.type === "root" ? v = ["Root", c, "RootExit"] : v = f(S), {
      eventIndex: 0,
      events: v,
      iterator: 0,
      node: S,
      visitorIndex: 0,
      visitors: []
    };
  }
  function k(S) {
    return S[e] = !1, S.nodes && S.nodes.forEach((v) => k(v)), S;
  }
  let b = {};
  class w {
    constructor(v, y, x) {
      this.stringified = !1, this.processed = !1;
      let M;
      if (typeof y == "object" && y !== null && (y.type === "root" || y.type === "document"))
        M = k(y);
      else if (y instanceof w || y instanceof d)
        M = k(y.root), y.map && (typeof x.map > "u" && (x.map = {}), x.map.inline || (x.map.inline = !1), x.map.prev = y.map);
      else {
        let A = o;
        x.syntax && (A = x.syntax.parse), x.parser && (A = x.parser), A.parse && (A = A.parse);
        try {
          M = A(y, x);
        } catch (R) {
          this.processed = !0, this.error = R;
        }
        M && !M[t] && i.rebuild(M);
      }
      this.result = new d(v, M, x), this.helpers = { ...b, postcss: b, result: this.result }, this.plugins = this.processor.plugins.map((A) => typeof A == "object" && A.prepare ? { ...A, ...A.prepare(this.result) } : A);
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
    handleError(v, y) {
      let x = this.result.lastPlugin;
      try {
        if (y && y.addToError(v), this.error = v, v.name === "CssSyntaxError" && !v.plugin)
          v.plugin = x.postcssPlugin, v.setMessage();
        else if (x.postcssVersion && process.env.NODE_ENV !== "production") {
          let M = x.postcssPlugin, A = x.postcssVersion, R = this.result.processor.version, j = A.split("."), z = R.split(".");
          (j[0] !== z[0] || parseInt(j[1]) > parseInt(z[1])) && console.error(
            "Unknown error from PostCSS plugin. Your current PostCSS version is " + R + ", but " + M + " uses " + A + ". Perhaps this is the source of the error below."
          );
        }
      } catch (M) {
        console && console.error && console.error(M);
      }
      return v;
    }
    prepareVisitors() {
      this.listeners = {};
      let v = (y, x, M) => {
        this.listeners[x] || (this.listeners[x] = []), this.listeners[x].push([y, M]);
      };
      for (let y of this.plugins)
        if (typeof y == "object")
          for (let x in y) {
            if (!h[x] && /^[A-Z]/.test(x))
              throw new Error(
                `Unknown event ${x} in ${y.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`
              );
            if (!u[x])
              if (typeof y[x] == "object")
                for (let M in y[x])
                  M === "*" ? v(y, x, y[x][M]) : v(
                    y,
                    x + "-" + M.toLowerCase(),
                    y[x][M]
                  );
              else typeof y[x] == "function" && v(y, x, y[x]);
          }
      this.hasListener = Object.keys(this.listeners).length > 0;
    }
    async runAsync() {
      this.plugin = 0;
      for (let v = 0; v < this.plugins.length; v++) {
        let y = this.plugins[v], x = this.runOnRoot(y);
        if (m(x))
          try {
            await x;
          } catch (M) {
            throw this.handleError(M);
          }
      }
      if (this.prepareVisitors(), this.hasListener) {
        let v = this.result.root;
        for (; !v[e]; ) {
          v[e] = !0;
          let y = [g(v)];
          for (; y.length > 0; ) {
            let x = this.visitTick(y);
            if (m(x))
              try {
                await x;
              } catch (M) {
                let A = y[y.length - 1].node;
                throw this.handleError(M, A);
              }
          }
        }
        if (this.listeners.OnceExit)
          for (let [y, x] of this.listeners.OnceExit) {
            this.result.lastPlugin = y;
            try {
              if (v.type === "document") {
                let M = v.nodes.map(
                  (A) => x(A, this.helpers)
                );
                await Promise.all(M);
              } else
                await x(v, this.helpers);
            } catch (M) {
              throw this.handleError(M);
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
            let y = this.result.root.nodes.map(
              (x) => v.Once(x, this.helpers)
            );
            return m(y[0]) ? Promise.all(y) : y;
          }
          return v.Once(this.result.root, this.helpers);
        } else if (typeof v == "function")
          return v(this.result.root, this.result);
      } catch (y) {
        throw this.handleError(y);
      }
    }
    stringify() {
      if (this.error) throw this.error;
      if (this.stringified) return this.result;
      this.stringified = !0, this.sync();
      let v = this.result.opts, y = n;
      v.syntax && (y = v.syntax.stringify), v.stringifier && (y = v.stringifier), y.stringify && (y = y.stringify);
      let M = new r(y, this.result.root, this.result.opts).generate();
      return this.result.css = M[0], this.result.map = M[1], this.result;
    }
    sync() {
      if (this.error) throw this.error;
      if (this.processed) return this.result;
      if (this.processed = !0, this.processing)
        throw this.getAsyncError();
      for (let v of this.plugins) {
        let y = this.runOnRoot(v);
        if (m(y))
          throw this.getAsyncError();
      }
      if (this.prepareVisitors(), this.hasListener) {
        let v = this.result.root;
        for (; !v[e]; )
          v[e] = !0, this.walkSync(v);
        if (this.listeners.OnceExit)
          if (v.type === "document")
            for (let y of v.nodes)
              this.visitSync(this.listeners.OnceExit, y);
          else
            this.visitSync(this.listeners.OnceExit, v);
      }
      return this.result;
    }
    then(v, y) {
      return process.env.NODE_ENV !== "production" && ("from" in this.opts || l(
        "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
      )), this.async().then(v, y);
    }
    toString() {
      return this.css;
    }
    visitSync(v, y) {
      for (let [x, M] of v) {
        this.result.lastPlugin = x;
        let A;
        try {
          A = M(y, this.helpers);
        } catch (R) {
          throw this.handleError(R, y.proxyOf);
        }
        if (y.type !== "root" && y.type !== "document" && !y.parent)
          return !0;
        if (m(A))
          throw this.getAsyncError();
      }
    }
    visitTick(v) {
      let y = v[v.length - 1], { node: x, visitors: M } = y;
      if (x.type !== "root" && x.type !== "document" && !x.parent) {
        v.pop();
        return;
      }
      if (M.length > 0 && y.visitorIndex < M.length) {
        let [R, j] = M[y.visitorIndex];
        y.visitorIndex += 1, y.visitorIndex === M.length && (y.visitors = [], y.visitorIndex = 0), this.result.lastPlugin = R;
        try {
          return j(x.toProxy(), this.helpers);
        } catch (z) {
          throw this.handleError(z, x);
        }
      }
      if (y.iterator !== 0) {
        let R = y.iterator, j;
        for (; j = x.nodes[x.indexes[R]]; )
          if (x.indexes[R] += 1, !j[e]) {
            j[e] = !0, v.push(g(j));
            return;
          }
        y.iterator = 0, delete x.indexes[R];
      }
      let A = y.events;
      for (; y.eventIndex < A.length; ) {
        let R = A[y.eventIndex];
        if (y.eventIndex += 1, R === c) {
          x.nodes && x.nodes.length && (x[e] = !0, y.iterator = x.getIterator());
          return;
        } else if (this.listeners[R]) {
          y.visitors = this.listeners[R];
          return;
        }
      }
      v.pop();
    }
    walkSync(v) {
      v[e] = !0;
      let y = f(v);
      for (let x of y)
        if (x === c)
          v.nodes && v.each((M) => {
            M[e] || this.walkSync(M);
          });
        else {
          let M = this.listeners[x];
          if (M && this.visitSync(M, v.toProxy()))
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
  }, Qn = w, w.default = w, p.registerLazyResult(w), s.registerLazyResult(w), Qn;
}
var ei, mo;
function yd() {
  if (mo) return ei;
  mo = 1;
  let e = va(), t = Hr(), r = wa(), n = $i();
  const i = Ti();
  class s {
    constructor(d, o, p) {
      o = o.toString(), this.stringified = !1, this._processor = d, this._css = o, this._opts = p, this._map = void 0;
      let a, h = t;
      this.result = new i(this._processor, a, this._opts), this.result.css = o;
      let u = this;
      Object.defineProperty(this.result, "root", {
        get() {
          return u.root;
        }
      });
      let c = new e(h, a, this._opts, o);
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
  return ei = s, s.default = s, ei;
}
var ti, go;
function bd() {
  if (go) return ti;
  go = 1;
  let e = yd(), t = Sa(), r = Ai(), n = or();
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
  return ti = i, i.default = i, n.registerProcessor(i), r.registerProcessor(i), ti;
}
var ri, yo;
function vd() {
  if (yo) return ri;
  yo = 1;
  let e = Gr(), t = ba(), r = Kr(), n = Pi(), i = Yr(), s = or(), l = Ni();
  function d(o, p) {
    if (Array.isArray(o)) return o.map((u) => d(u));
    let { inputs: a, ...h } = o;
    if (a) {
      p = [];
      for (let u of a) {
        let c = { ...u, __proto__: i.prototype };
        c.map && (c.map = {
          ...c.map,
          __proto__: t.prototype
        }), p.push(c);
      }
    }
    if (h.nodes && (h.nodes = o.nodes.map((u) => d(u, p))), h.source) {
      let { inputId: u, ...c } = h.source;
      h.source = c, u != null && (h.source.input = p[u]);
    }
    if (h.type === "root")
      return new s(h);
    if (h.type === "decl")
      return new e(h);
    if (h.type === "rule")
      return new l(h);
    if (h.type === "comment")
      return new r(h);
    if (h.type === "atrule")
      return new n(h);
    throw new Error("Unknown node type: " + o.type);
  }
  return ri = d, d.default = d, ri;
}
var ni, bo;
function wd() {
  if (bo) return ni;
  bo = 1;
  let e = Ii(), t = Gr(), r = Sa(), n = It(), i = bd(), s = Hr(), l = vd(), d = Ai(), o = ka(), p = Kr(), a = Pi(), h = Ti(), u = Yr(), c = $i(), m = xa(), f = Ni(), g = or(), k = Vr();
  function b(...w) {
    return w.length === 1 && Array.isArray(w[0]) && (w = w[0]), new i(w);
  }
  return b.plugin = function(S, v) {
    let y = !1;
    function x(...A) {
      console && console.warn && !y && (y = !0, console.warn(
        S + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`
      ), process.env.LANG && process.env.LANG.startsWith("cn") && console.warn(
        S + `: 里面 postcss.plugin 被弃用. 迁移指南:
https://www.w3ctech.com/topic/2226`
      ));
      let R = v(...A);
      return R.postcssPlugin = S, R.postcssVersion = new i().version, R;
    }
    let M;
    return Object.defineProperty(x, "postcss", {
      get() {
        return M || (M = x()), M;
      }
    }), x.process = function(A, R, j) {
      return b([x(j)]).process(A, R);
    }, x;
  }, b.stringify = s, b.parse = c, b.fromJSON = l, b.list = m, b.comment = (w) => new p(w), b.atRule = (w) => new a(w), b.decl = (w) => new t(w), b.rule = (w) => new f(w), b.root = (w) => new g(w), b.document = (w) => new d(w), b.CssSyntaxError = e, b.Declaration = t, b.Container = n, b.Processor = i, b.Document = d, b.Comment = p, b.Warning = o, b.AtRule = a, b.Result = h, b.Input = u, b.Rule = f, b.Root = g, b.Node = k, r.registerPostcss(b), ni = b, b.default = b, ni;
}
var kd = wd();
const pe = /* @__PURE__ */ cd(kd);
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
class _i {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  constructor(...t) {
    qe(this, "parentElement", null), qe(this, "parentNode", null), qe(this, "ownerDocument"), qe(this, "firstChild", null), qe(this, "lastChild", null), qe(this, "previousSibling", null), qe(this, "nextSibling", null), qe(this, "ELEMENT_NODE", 1), qe(this, "TEXT_NODE", 3), qe(this, "nodeType"), qe(this, "nodeName"), qe(this, "RRNodeType");
  }
  get childNodes() {
    const t = [];
    let r = this.firstChild;
    for (; r; )
      t.push(r), r = r.nextSibling;
    return t;
  }
  contains(t) {
    if (t instanceof _i) {
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
const vo = {
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
}, wr = {}, Ca = {}, xd = () => !!globalThis.Zone;
function Di(e) {
  if (wr[e])
    return wr[e];
  const t = globalThis[e], r = t.prototype, n = e in vo ? vo[e] : void 0, i = !!(n && // @ts-expect-error 2345
  n.every(
    (d) => {
      var o, p;
      return !!((p = (o = Object.getOwnPropertyDescriptor(r, d)) == null ? void 0 : o.get) != null && p.toString().includes("[native code]"));
    }
  )), s = e in wo ? wo[e] : void 0, l = !!(s && s.every(
    // @ts-expect-error 2345
    (d) => {
      var o;
      return typeof r[d] == "function" && ((o = r[d]) == null ? void 0 : o.toString().includes("[native code]"));
    }
  ));
  if (i && l && !xd())
    return wr[e] = t.prototype, t.prototype;
  try {
    const d = document.createElement("iframe");
    d.style.display = "none", document.body.appendChild(d);
    const o = d.contentWindow;
    if (!o) return t.prototype;
    const p = o[e].prototype;
    if (!p)
      return d.remove(), r;
    const a = navigator.userAgent;
    return a.includes("Safari") && !a.includes("Chrome") ? (d.classList.add("rr-block"), d.setAttribute("__rrwebUntaintedMutationObserver", ""), Ca[e] = () => d.remove()) : d.remove(), wr[e] = p;
  } catch {
    return r;
  }
}
const ii = {};
function ot(e, t, r) {
  var n;
  const i = `${e}.${String(r)}`;
  if (ii[i])
    return ii[i].call(
      t
    );
  const s = Di(e), l = (n = Object.getOwnPropertyDescriptor(
    s,
    r
  )) == null ? void 0 : n.get;
  return l ? (ii[i] = l, l.call(t)) : t[r];
}
const si = {};
function Ea(e, t, r) {
  const n = `${e}.${String(r)}`;
  if (si[n])
    return si[n].bind(
      t
    );
  const s = Di(e)[r];
  return typeof s != "function" ? t[r] : (si[n] = s, s.bind(t));
}
function Sd(e) {
  return ot("Node", e, "ownerDocument");
}
function Cd(e) {
  return ot("Node", e, "childNodes");
}
function Ed(e) {
  return ot("Node", e, "parentNode");
}
function Md(e) {
  return ot("Node", e, "parentElement");
}
function Rd(e) {
  return ot("Node", e, "textContent");
}
function Od(e, t) {
  return Ea("Node", e, "contains")(t);
}
function Id(e) {
  return Ea("Node", e, "getRootNode")();
}
function Ld(e) {
  return !e || !("host" in e) ? null : ot("ShadowRoot", e, "host");
}
function Ad(e) {
  return e.styleSheets;
}
function Td(e) {
  return !e || !("shadowRoot" in e) ? null : ot("Element", e, "shadowRoot");
}
function Pd(e, t) {
  return ot("Element", e, "querySelector")(t);
}
function Nd(e, t) {
  return ot("Element", e, "querySelectorAll")(t);
}
function Ma() {
  return [
    Di("MutationObserver").constructor,
    Ca.MutationObserver ?? (() => {
    })
  ];
}
let nr = Date.now;
/* @__PURE__ */ /[1-9][0-9]{12}/.test(Date.now().toString()) || (nr = () => (/* @__PURE__ */ new Date()).getTime());
function Lt(e, t, r) {
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
const X = {
  ownerDocument: Sd,
  childNodes: Cd,
  parentNode: Ed,
  parentElement: Md,
  textContent: Rd,
  contains: Od,
  getRootNode: Id,
  host: Ld,
  styleSheets: Ad,
  shadowRoot: Td,
  querySelector: Pd,
  querySelectorAll: Nd,
  nowTimestamp: nr,
  mutationObserverCtor: Ma,
  patch: Lt
};
function Le(e, t, r = document) {
  const n = { capture: !0, passive: !0 };
  return r.addEventListener(e, t, n), () => r.removeEventListener(e, t, n);
}
const Dt = `Please stop import mirror directly. Instead of that,\r
now you can use replayer.getMirror() to access the mirror instance of a replayer,\r
or you can use record.mirror to access the mirror instance during recording.`;
let ko = {
  map: {},
  getId() {
    return console.error(Dt), -1;
  },
  getNode() {
    return console.error(Dt), null;
  },
  removeNodeFromMap() {
    console.error(Dt);
  },
  has() {
    return console.error(Dt), !1;
  },
  reset() {
    console.error(Dt);
  }
};
typeof window < "u" && window.Proxy && window.Reflect && (ko = new Proxy(ko, {
  get(e, t, r) {
    return t === "map" && console.error(Dt), Reflect.get(e, t, r);
  }
}));
function ir(e, t, r = {}) {
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
function Xr(e, t, r, n, i = window) {
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
  ), () => Xr(e, t, s || {}, !0);
}
function Ra(e) {
  var t, r, n, i;
  const s = e.document;
  return {
    left: s.scrollingElement ? s.scrollingElement.scrollLeft : e.pageXOffset !== void 0 ? e.pageXOffset : s.documentElement.scrollLeft || (s == null ? void 0 : s.body) && ((t = X.parentElement(s.body)) == null ? void 0 : t.scrollLeft) || ((r = s == null ? void 0 : s.body) == null ? void 0 : r.scrollLeft) || 0,
    top: s.scrollingElement ? s.scrollingElement.scrollTop : e.pageYOffset !== void 0 ? e.pageYOffset : (s == null ? void 0 : s.documentElement.scrollTop) || (s == null ? void 0 : s.body) && ((n = X.parentElement(s.body)) == null ? void 0 : n.scrollTop) || ((i = s == null ? void 0 : s.body) == null ? void 0 : i.scrollTop) || 0
  };
}
function Oa() {
  return window.innerHeight || document.documentElement && document.documentElement.clientHeight || document.body && document.body.clientHeight;
}
function Ia() {
  return window.innerWidth || document.documentElement && document.documentElement.clientWidth || document.body && document.body.clientWidth;
}
function La(e) {
  return e ? e.nodeType === e.ELEMENT_NODE ? e : X.parentElement(e) : null;
}
function Ae(e, t, r, n) {
  if (!e)
    return !1;
  const i = La(e);
  if (!i)
    return !1;
  try {
    if (typeof t == "string") {
      if (i.classList.contains(t) || n && i.closest("." + t) !== null) return !0;
    } else if (Pr(i, t, n)) return !0;
  } catch {
  }
  return !!(r && (i.matches(r) || n && i.closest(r) !== null));
}
function $d(e, t) {
  return t.getId(e) !== -1;
}
function oi(e, t, r) {
  return e.tagName === "TITLE" && r.headTitleMutations ? !0 : t.getId(e) === rr;
}
function Aa(e, t) {
  if (Qt(e))
    return !1;
  const r = t.getId(e);
  if (!t.has(r))
    return !0;
  const n = X.parentNode(e);
  return n && n.nodeType === e.DOCUMENT_NODE ? !1 : n ? Aa(n, t) : !0;
}
function di(e) {
  return !!e.changedTouches;
}
function _d(e = window) {
  "NodeList" in e && !e.NodeList.prototype.forEach && (e.NodeList.prototype.forEach = Array.prototype.forEach), "DOMTokenList" in e && !e.DOMTokenList.prototype.forEach && (e.DOMTokenList.prototype.forEach = Array.prototype.forEach);
}
function Ta(e, t) {
  return !!(e.nodeName === "IFRAME" && t.getMeta(e));
}
function Pa(e, t) {
  return !!(e.nodeName === "LINK" && e.nodeType === e.ELEMENT_NODE && e.getAttribute && e.getAttribute("rel") === "stylesheet" && t.getMeta(e));
}
function pi(e) {
  return e ? e instanceof _i && "shadowRoot" in e ? !!e.shadowRoot : !!X.shadowRoot(e) : !1;
}
class Dd {
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
function Na(e) {
  var t;
  let r = null;
  return "getRootNode" in e && ((t = X.getRootNode(e)) == null ? void 0 : t.nodeType) === Node.DOCUMENT_FRAGMENT_NODE && X.host(X.getRootNode(e)) && (r = X.host(X.getRootNode(e))), r;
}
function zd(e) {
  let t = e, r;
  for (; r = Na(t); )
    t = r;
  return t;
}
function Fd(e) {
  const t = X.ownerDocument(e);
  if (!t) return !1;
  const r = zd(e);
  return X.contains(t, r);
}
function $a(e) {
  const t = X.ownerDocument(e);
  return t ? X.contains(t, e) || Fd(e) : !1;
}
var ne = /* @__PURE__ */ ((e) => (e[e.DomContentLoaded = 0] = "DomContentLoaded", e[e.Load = 1] = "Load", e[e.FullSnapshot = 2] = "FullSnapshot", e[e.IncrementalSnapshot = 3] = "IncrementalSnapshot", e[e.Meta = 4] = "Meta", e[e.Custom = 5] = "Custom", e[e.Plugin = 6] = "Plugin", e[e.Asset = 7] = "Asset", e))(ne || {}), ee = /* @__PURE__ */ ((e) => (e[e.Mutation = 0] = "Mutation", e[e.MouseMove = 1] = "MouseMove", e[e.MouseInteraction = 2] = "MouseInteraction", e[e.Scroll = 3] = "Scroll", e[e.ViewportResize = 4] = "ViewportResize", e[e.Input = 5] = "Input", e[e.TouchMove = 6] = "TouchMove", e[e.MediaInteraction = 7] = "MediaInteraction", e[e.StyleSheetRule = 8] = "StyleSheetRule", e[e.CanvasMutation = 9] = "CanvasMutation", e[e.Font = 10] = "Font", e[e.Log = 11] = "Log", e[e.Drag = 12] = "Drag", e[e.StyleDeclaration = 13] = "StyleDeclaration", e[e.Selection = 14] = "Selection", e[e.AdoptedStyleSheet = 15] = "AdoptedStyleSheet", e[e.CustomElement = 16] = "CustomElement", e))(ee || {}), Ne = /* @__PURE__ */ ((e) => (e[e.MouseUp = 0] = "MouseUp", e[e.MouseDown = 1] = "MouseDown", e[e.Click = 2] = "Click", e[e.ContextMenu = 3] = "ContextMenu", e[e.DblClick = 4] = "DblClick", e[e.Focus = 5] = "Focus", e[e.Blur = 6] = "Blur", e[e.TouchStart = 7] = "TouchStart", e[e.TouchMove_Departed = 8] = "TouchMove_Departed", e[e.TouchEnd = 9] = "TouchEnd", e[e.TouchCancel = 10] = "TouchCancel", e))(Ne || {}), it = /* @__PURE__ */ ((e) => (e[e.Mouse = 0] = "Mouse", e[e.Pen = 1] = "Pen", e[e.Touch = 2] = "Touch", e))(it || {}), Gt = /* @__PURE__ */ ((e) => (e[e["2D"] = 0] = "2D", e[e.WebGL = 1] = "WebGL", e[e.WebGL2 = 2] = "WebGL2", e))(Gt || {}), zt = /* @__PURE__ */ ((e) => (e[e.Play = 0] = "Play", e[e.Pause = 1] = "Pause", e[e.Seeked = 2] = "Seeked", e[e.VolumeChange = 3] = "VolumeChange", e[e.RateChange = 4] = "RateChange", e))(zt || {}), _a = /* @__PURE__ */ ((e) => (e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment", e))(_a || {});
function xo(e) {
  return "__ln" in e;
}
class Ud {
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
    if (t.__ln = r, t.previousSibling && xo(t.previousSibling)) {
      const n = t.previousSibling.__ln.next;
      r.next = n, r.previous = t.previousSibling.__ln, t.previousSibling.__ln.next = r, n && (n.previous = r);
    } else if (t.nextSibling && xo(t.nextSibling) && t.nextSibling.__ln.previous) {
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
const So = (e, t) => `${e}@${t}`;
class Bd {
  constructor() {
    P(this, "frozen", !1), P(this, "locked", !1), P(this, "texts", []), P(this, "attributes", []), P(this, "attributeMap", /* @__PURE__ */ new WeakMap()), P(this, "removes", []), P(this, "mapRemoves", []), P(this, "movedMap", {}), P(this, "addedSet", /* @__PURE__ */ new Set()), P(this, "movedSet", /* @__PURE__ */ new Set()), P(this, "droppedSet", /* @__PURE__ */ new Set()), P(this, "removesSubTreeCache", /* @__PURE__ */ new Set()), P(this, "mutationCb"), P(this, "blockClass"), P(this, "blockSelector"), P(this, "maskTextClass"), P(this, "maskTextSelector"), P(this, "inlineStylesheet"), P(this, "maskInputOptions"), P(this, "maskTextFn"), P(this, "maskInputFn"), P(this, "keepIframeSrcFn"), P(this, "recordCanvas"), P(this, "inlineImages"), P(this, "slimDOMOptions"), P(this, "dataURLOptions"), P(this, "doc"), P(this, "mirror"), P(this, "iframeManager"), P(this, "stylesheetManager"), P(this, "shadowDomManager"), P(this, "canvasManager"), P(this, "processedNodeManager"), P(this, "unattachedDoc"), P(this, "processMutations", (t) => {
      t.forEach(this.processMutation), this.emit();
    }), P(this, "emit", () => {
      if (this.frozen || this.locked)
        return;
      const t = [], r = /* @__PURE__ */ new Set(), n = new Ud(), i = (o) => {
        let p = o, a = rr;
        for (; a === rr; )
          p = p && p.nextSibling, a = p && this.mirror.getId(p);
        return a;
      }, s = (o) => {
        const p = X.parentNode(o);
        if (!p || !$a(o))
          return;
        let a = !1;
        if (o.nodeType === Node.TEXT_NODE) {
          const m = p.tagName;
          if (m === "TEXTAREA")
            return;
          m === "STYLE" && this.addedSet.has(p) && (a = !0);
        }
        const h = Qt(p) ? this.mirror.getId(Na(o)) : this.mirror.getId(p), u = i(o);
        if (h === -1 || u === -1)
          return n.addNode(o);
        const c = Ut(o, {
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
            Ta(m, this.mirror) && this.iframeManager.addIframe(m), Pa(m, this.mirror) && this.stylesheetManager.trackLinkElement(
              m
            ), pi(o) && this.shadowDomManager.addShadowRoot(X.shadowRoot(o), this.doc);
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
          parentId: h,
          nextId: u,
          node: c
        }), r.add(c.id));
      };
      for (; this.mapRemoves.length; )
        this.mirror.removeNodeFromMap(this.mapRemoves.shift());
      for (const o of this.movedSet)
        Co(this.removesSubTreeCache, o, this.mirror) && !this.movedSet.has(X.parentNode(o)) || s(o);
      for (const o of this.addedSet)
        !Eo(this.droppedSet, o) && !Co(this.removesSubTreeCache, o, this.mirror) || Eo(this.movedSet, o) ? s(o) : this.droppedSet.add(o);
      let l = null;
      for (; n.length; ) {
        let o = null;
        if (l) {
          const p = this.mirror.getId(X.parentNode(l.value)), a = i(l.value);
          p !== -1 && a !== -1 && (o = l);
        }
        if (!o) {
          let p = n.tail;
          for (; p; ) {
            const a = p;
            if (p = p.previous, a) {
              const h = this.mirror.getId(X.parentNode(a.value));
              if (i(a.value) === -1) continue;
              if (h !== -1) {
                o = a;
                break;
              } else {
                const c = a.value, m = X.parentNode(c);
                if (m && m.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                  const f = X.host(m);
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
          const p = o.node, a = X.parentNode(p);
          return a && a.tagName === "TEXTAREA" && this.genTextAreaValueMutation(a), {
            id: this.mirror.getId(p),
            value: o.value
          };
        }).filter((o) => !r.has(o.id)).filter((o) => this.mirror.has(o.id)),
        attributes: this.attributes.map((o) => {
          const { attributes: p } = o;
          if (typeof p.style == "string") {
            const a = JSON.stringify(o.styleDiff), h = JSON.stringify(o._unchangedStyles);
            a.length < p.style.length && (a + h).split("var(").length === p.style.split("var(").length && (p.style = o.styleDiff);
          }
          return {
            id: this.mirror.getId(o.node),
            attributes: p
          };
        }).filter((o) => !r.has(o.id)).filter((o) => this.mirror.has(o.id)),
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
        X.childNodes(t),
        (i) => X.textContent(i) || ""
      ).join("");
      r.attributes.value = Lr({
        element: t,
        maskInputOptions: this.maskInputOptions,
        tagName: t.tagName,
        type: Ar(t),
        value: n,
        maskInputFn: this.maskInputFn
      });
    }), P(this, "processMutation", (t) => {
      if (!oi(t.target, this.mirror, this.slimDOMOptions))
        switch (t.type) {
          case "characterData": {
            const r = X.textContent(t.target);
            !Ae(t.target, this.blockClass, this.blockSelector, !1) && r !== t.oldValue && this.texts.push({
              value: la(
                t.target,
                this.maskTextClass,
                this.maskTextSelector,
                !0
                // checkAncestors
              ) && r ? this.maskTextFn ? this.maskTextFn(r, La(t.target)) : r.replace(/[\S]/g, "*") : r,
              node: t.target
            });
            break;
          }
          case "attributes": {
            const r = t.target;
            let n = t.attributeName, i = t.target.getAttribute(n);
            if (n === "value") {
              const l = Ar(r);
              i = Lr({
                element: r,
                maskInputOptions: this.maskInputOptions,
                tagName: r.tagName,
                type: l,
                value: i,
                maskInputFn: this.maskInputFn
              });
            }
            if (Ae(t.target, this.blockClass, this.blockSelector, !1) || i === t.oldValue)
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
            }, this.attributes.push(s), this.attributeMap.set(t.target, s)), n === "type" && r.tagName === "INPUT" && (t.oldValue || "").toLowerCase() === "password" && r.setAttribute("data-rr-is-password", "true"), !aa(r.tagName, n))
              if (s.attributes[n] = oa(
                this.doc,
                Rt(r.tagName),
                Rt(n),
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
                  const o = r.style.getPropertyValue(d), p = r.style.getPropertyPriority(d);
                  o !== l.style.getPropertyValue(d) || p !== l.style.getPropertyPriority(d) ? p === "" ? s.styleDiff[d] = o : s.styleDiff[d] = [o, p] : s._unchangedStyles[d] = [o, p];
                }
                for (const d of Array.from(l.style))
                  r.style.getPropertyValue(d) === "" && (s.styleDiff[d] = !1);
              } else n === "open" && r.tagName === "DIALOG" && (r.matches("dialog:modal") ? s.attributes.rr_open_mode = "modal" : s.attributes.rr_open_mode = "non-modal");
            break;
          }
          case "childList": {
            if (Ae(t.target, this.blockClass, this.blockSelector, !0))
              return;
            if (t.target.tagName === "TEXTAREA") {
              this.genTextAreaValueMutation(t.target);
              return;
            }
            t.addedNodes.forEach((r) => this.genAdds(r, t.target)), t.removedNodes.forEach((r) => {
              const n = this.mirror.getId(r), i = Qt(t.target) ? this.mirror.getId(X.host(t.target)) : this.mirror.getId(t.target);
              Ae(t.target, this.blockClass, this.blockSelector, !1) || oi(r, this.mirror, this.slimDOMOptions) || !$d(r, this.mirror) || (this.addedSet.has(r) ? (hi(this.addedSet, r), this.droppedSet.add(r)) : this.addedSet.has(t.target) && n === -1 || Aa(t.target, this.mirror) || (this.movedSet.has(r) && this.movedMap[So(n, i)] ? hi(this.movedSet, r) : (this.removes.push({
                parentId: i,
                id: n,
                isShadow: Qt(t.target) && er(t.target) ? !0 : void 0
              }), qd(r, this.removesSubTreeCache))), this.mapRemoves.push(r));
            });
            break;
          }
        }
    }), P(this, "genAdds", (t, r) => {
      if (!this.processedNodeManager.inOtherBuffer(t, this) && !(this.addedSet.has(t) || this.movedSet.has(t))) {
        if (this.mirror.hasNode(t)) {
          if (oi(t, this.mirror, this.slimDOMOptions))
            return;
          this.movedSet.add(t);
          let n = null;
          r && this.mirror.hasNode(r) && (n = this.mirror.getId(r)), n && n !== -1 && (this.movedMap[So(this.mirror.getId(t), n)] = !0);
        } else
          this.addedSet.add(t), this.droppedSet.delete(t);
        Ae(t, this.blockClass, this.blockSelector, !1) || (X.childNodes(t).forEach((n) => this.genAdds(n)), pi(t) && X.childNodes(X.shadowRoot(t)).forEach((n) => {
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
function hi(e, t) {
  e.delete(t), X.childNodes(t).forEach((r) => hi(e, r));
}
function qd(e, t) {
  const r = [e];
  for (; r.length; ) {
    const n = r.pop();
    t.has(n) || (t.add(n), X.childNodes(n).forEach((i) => r.push(i)));
  }
}
function Co(e, t, r) {
  return e.size === 0 ? !1 : Wd(e, t);
}
function Wd(e, t, r) {
  const n = X.parentNode(t);
  return n ? e.has(n) : !1;
}
function Eo(e, t) {
  return e.size === 0 ? !1 : Da(e, t);
}
function Da(e, t) {
  const r = X.parentNode(t);
  return r ? e.has(r) ? !0 : Da(e, r) : !1;
}
let tr;
function jd(e) {
  tr = e;
}
function Hd() {
  tr = void 0;
}
const te = (e) => tr ? (...r) => {
  try {
    return e(...r);
  } catch (n) {
    if (tr && tr(n) === !0)
      return;
    throw n;
  }
} : e, Ct = [];
function ar(e) {
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
function za(e, t) {
  const r = new Bd();
  Ct.push(r), r.init(e);
  const [n, i] = Ma(), s = new n(
    te(r.processMutations.bind(r))
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
function Vd({
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
  const o = ir(
    te(
      (h) => {
        const u = Date.now() - d;
        e(
          l.map((c) => (c.timeOffset -= u, c)),
          h
        ), l = [], d = null;
      }
    ),
    s
  ), p = te(
    ir(
      te((h) => {
        const u = ar(h), { clientX: c, clientY: m } = di(h) ? h.changedTouches[0] : h;
        d || (d = nr()), l.push({
          x: c,
          y: m,
          id: n.getId(u),
          timeOffset: nr() - d
        }), o(
          typeof DragEvent < "u" && h instanceof DragEvent ? ee.Drag : h instanceof MouseEvent ? ee.MouseMove : ee.TouchMove
        );
      }),
      i,
      {
        trailing: !1
      }
    )
  ), a = [
    Le("mousemove", p, r),
    Le("touchmove", p, r),
    Le("drag", p, r)
  ];
  return te(() => {
    a.forEach((h) => h());
  });
}
function Gd({
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
  const p = (a) => (h) => {
    const u = ar(h);
    if (Ae(u, n, i, !0))
      return;
    let c = null, m = a;
    if ("pointerType" in h) {
      switch (h.pointerType) {
        case "mouse":
          c = it.Mouse;
          break;
        case "touch":
          c = it.Touch;
          break;
        case "pen":
          c = it.Pen;
          break;
      }
      c === it.Touch ? Ne[a] === Ne.MouseDown ? m = "TouchStart" : Ne[a] === Ne.MouseUp && (m = "TouchEnd") : it.Pen;
    } else di(h) && (c = it.Touch);
    c !== null ? (o = c, (m.startsWith("Touch") && c === it.Touch || m.startsWith("Mouse") && c === it.Mouse) && (c = null)) : Ne[a] === Ne.Click && (c = o, o = null);
    const f = di(h) ? h.changedTouches[0] : h;
    if (!f)
      return;
    const g = r.getId(u), { clientX: k, clientY: b } = f;
    te(e)({
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
    let h = Rt(a);
    const u = p(a);
    if (window.PointerEvent)
      switch (Ne[a]) {
        case Ne.MouseDown:
        case Ne.MouseUp:
          h = h.replace(
            "mouse",
            "pointer"
          );
          break;
        case Ne.TouchStart:
        case Ne.TouchEnd:
          return;
      }
    d.push(Le(h, u, t));
  }), te(() => {
    d.forEach((a) => a());
  });
}
function Fa({
  scrollCb: e,
  doc: t,
  mirror: r,
  blockClass: n,
  blockSelector: i,
  sampling: s
}) {
  const l = te(
    ir(
      te((d) => {
        const o = ar(d);
        if (!o || Ae(o, n, i, !0))
          return;
        const p = r.getId(o);
        if (o === t && t.defaultView) {
          const a = Ra(t.defaultView);
          e({
            id: p,
            x: a.left,
            y: a.top
          });
        } else
          e({
            id: p,
            x: o.scrollLeft,
            y: o.scrollTop
          });
      }),
      s.scroll || 100
    )
  );
  return Le("scroll", l, t);
}
function Yd({ viewportResizeCb: e }, { win: t }) {
  let r = -1, n = -1;
  const i = te(
    ir(
      te(() => {
        const s = Oa(), l = Ia();
        (r !== s || n !== l) && (e({
          width: Number(l),
          height: Number(s)
        }), r = s, n = l);
      }),
      200
    )
  );
  return Le("resize", i, t);
}
const Kd = ["INPUT", "TEXTAREA", "SELECT"], Mo = /* @__PURE__ */ new WeakMap();
function Xd({
  inputCb: e,
  doc: t,
  mirror: r,
  blockClass: n,
  blockSelector: i,
  ignoreClass: s,
  ignoreSelector: l,
  maskInputOptions: d,
  maskInputFn: o,
  sampling: p,
  userTriggeredOnInput: a
}) {
  function h(b) {
    let w = ar(b);
    const S = b.isTrusted, v = w && w.tagName;
    if (w && v === "OPTION" && (w = X.parentElement(w)), !w || !v || Kd.indexOf(v) < 0 || Ae(w, n, i, !0) || w.classList.contains(s) || l && w.matches(l))
      return;
    let y = w.value, x = !1;
    const M = Ar(w) || "";
    M === "radio" || M === "checkbox" ? x = w.checked : (d[v.toLowerCase()] || d[M]) && (y = Lr({
      element: w,
      maskInputOptions: d,
      tagName: v,
      type: M,
      value: y,
      maskInputFn: o
    })), u(
      w,
      a ? { text: y, isChecked: x, userTriggered: S } : { text: y, isChecked: x }
    );
    const A = w.name;
    M === "radio" && A && x && t.querySelectorAll(`input[type="radio"][name="${A}"]`).forEach((R) => {
      if (R !== w) {
        const j = R.value;
        u(
          R,
          a ? { text: j, isChecked: !x, userTriggered: !1 } : { text: j, isChecked: !x }
        );
      }
    });
  }
  function u(b, w) {
    const S = Mo.get(b);
    if (!S || S.text !== w.text || S.isChecked !== w.isChecked) {
      Mo.set(b, w);
      const v = r.getId(b);
      te(e)({
        ...w,
        id: v
      });
    }
  }
  const m = (p.input === "last" ? ["change"] : ["input", "change"]).map(
    (b) => Le(b, te(h), t)
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
      (b) => Xr(
        b[0],
        b[1],
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
    m.forEach((b) => b());
  });
}
function Nr(e) {
  const t = [];
  function r(n, i) {
    if (kr("CSSGroupingRule") && n.parentRule instanceof CSSGroupingRule || kr("CSSMediaRule") && n.parentRule instanceof CSSMediaRule || kr("CSSSupportsRule") && n.parentRule instanceof CSSSupportsRule || kr("CSSConditionRule") && n.parentRule instanceof CSSConditionRule) {
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
function Jd({ styleSheetRuleCb: e, mirror: t, stylesheetManager: r }, { win: n }) {
  if (!n.CSSStyleSheet || !n.CSSStyleSheet.prototype)
    return () => {
    };
  const i = n.CSSStyleSheet.prototype.insertRule;
  n.CSSStyleSheet.prototype.insertRule = new Proxy(i, {
    apply: te(
      (a, h, u) => {
        const [c, m] = u, { id: f, styleId: g } = ht(
          h,
          t,
          r.styleMirror
        );
        return (f && f !== -1 || g && g !== -1) && e({
          id: f,
          styleId: g,
          adds: [{ rule: c, index: m }]
        }), a.apply(h, u);
      }
    )
  }), n.CSSStyleSheet.prototype.addRule = function(a, h, u = this.cssRules.length) {
    const c = `${a} { ${h} }`;
    return n.CSSStyleSheet.prototype.insertRule.apply(this, [c, u]);
  };
  const s = n.CSSStyleSheet.prototype.deleteRule;
  n.CSSStyleSheet.prototype.deleteRule = new Proxy(s, {
    apply: te(
      (a, h, u) => {
        const [c] = u, { id: m, styleId: f } = ht(
          h,
          t,
          r.styleMirror
        );
        return (m && m !== -1 || f && f !== -1) && e({
          id: m,
          styleId: f,
          removes: [{ index: c }]
        }), a.apply(h, u);
      }
    )
  }), n.CSSStyleSheet.prototype.removeRule = function(a) {
    return n.CSSStyleSheet.prototype.deleteRule.apply(this, [a]);
  };
  let l;
  n.CSSStyleSheet.prototype.replace && (l = n.CSSStyleSheet.prototype.replace, n.CSSStyleSheet.prototype.replace = new Proxy(l, {
    apply: te(
      (a, h, u) => {
        const [c] = u, { id: m, styleId: f } = ht(
          h,
          t,
          r.styleMirror
        );
        return (m && m !== -1 || f && f !== -1) && e({
          id: m,
          styleId: f,
          replace: c
        }), a.apply(h, u);
      }
    )
  }));
  let d;
  n.CSSStyleSheet.prototype.replaceSync && (d = n.CSSStyleSheet.prototype.replaceSync, n.CSSStyleSheet.prototype.replaceSync = new Proxy(d, {
    apply: te(
      (a, h, u) => {
        const [c] = u, { id: m, styleId: f } = ht(
          h,
          t,
          r.styleMirror
        );
        return (m && m !== -1 || f && f !== -1) && e({
          id: m,
          styleId: f,
          replaceSync: c
        }), a.apply(h, u);
      }
    )
  }));
  const o = {};
  xr("CSSGroupingRule") ? o.CSSGroupingRule = n.CSSGroupingRule : (xr("CSSMediaRule") && (o.CSSMediaRule = n.CSSMediaRule), xr("CSSConditionRule") && (o.CSSConditionRule = n.CSSConditionRule), xr("CSSSupportsRule") && (o.CSSSupportsRule = n.CSSSupportsRule));
  const p = {};
  return Object.entries(o).forEach(([a, h]) => {
    p[a] = {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      insertRule: h.prototype.insertRule,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      deleteRule: h.prototype.deleteRule
    }, h.prototype.insertRule = new Proxy(
      p[a].insertRule,
      {
        apply: te(
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
                    ...Nr(c),
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
      p[a].deleteRule,
      {
        apply: te(
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
                { index: [...Nr(c), f] }
              ]
            }), u.apply(c, m);
          }
        )
      }
    );
  }), te(() => {
    n.CSSStyleSheet.prototype.insertRule = i, n.CSSStyleSheet.prototype.deleteRule = s, l && (n.CSSStyleSheet.prototype.replace = l), d && (n.CSSStyleSheet.prototype.replaceSync = d), Object.entries(o).forEach(([a, h]) => {
      h.prototype.insertRule = p[a].insertRule, h.prototype.deleteRule = p[a].deleteRule;
    });
  });
}
function Ua({
  mirror: e,
  stylesheetManager: t
}, r) {
  var n, i, s;
  let l = null;
  r.nodeName === "#document" ? l = e.getId(r) : l = e.getId(X.host(r));
  const d = r.nodeName === "#document" ? (n = r.defaultView) == null ? void 0 : n.Document : (s = (i = r.ownerDocument) == null ? void 0 : i.defaultView) == null ? void 0 : s.ShadowRoot, o = d != null && d.prototype ? Object.getOwnPropertyDescriptor(
    d == null ? void 0 : d.prototype,
    "adoptedStyleSheets"
  ) : void 0;
  return l === null || l === -1 || !d || !o ? () => {
  } : (Object.defineProperty(r, "adoptedStyleSheets", {
    configurable: o.configurable,
    enumerable: o.enumerable,
    get() {
      var p;
      return (p = o.get) == null ? void 0 : p.call(this);
    },
    set(p) {
      var a;
      const h = (a = o.set) == null ? void 0 : a.call(this, p);
      if (l !== null && l !== -1)
        try {
          t.adoptStyleSheets(p, l);
        } catch {
        }
      return h;
    }
  }), te(() => {
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
function Zd({
  styleDeclarationCb: e,
  mirror: t,
  ignoreCSSAttributes: r,
  stylesheetManager: n
}, { win: i }) {
  const s = i.CSSStyleDeclaration.prototype.setProperty;
  i.CSSStyleDeclaration.prototype.setProperty = new Proxy(s, {
    apply: te(
      (d, o, p) => {
        var a;
        const [h, u, c] = p;
        if (r.has(h))
          return s.apply(o, [h, u, c]);
        const { id: m, styleId: f } = ht(
          (a = o.parentRule) == null ? void 0 : a.parentStyleSheet,
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
          index: Nr(o.parentRule)
        }), d.apply(o, p);
      }
    )
  });
  const l = i.CSSStyleDeclaration.prototype.removeProperty;
  return i.CSSStyleDeclaration.prototype.removeProperty = new Proxy(l, {
    apply: te(
      (d, o, p) => {
        var a;
        const [h] = p;
        if (r.has(h))
          return l.apply(o, [h]);
        const { id: u, styleId: c } = ht(
          (a = o.parentRule) == null ? void 0 : a.parentStyleSheet,
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
          index: Nr(o.parentRule)
        }), d.apply(o, p);
      }
    )
  }), te(() => {
    i.CSSStyleDeclaration.prototype.setProperty = s, i.CSSStyleDeclaration.prototype.removeProperty = l;
  });
}
function Qd({
  mediaInteractionCb: e,
  blockClass: t,
  blockSelector: r,
  mirror: n,
  sampling: i,
  doc: s
}) {
  const l = te(
    (o) => ir(
      te((p) => {
        const a = ar(p);
        if (!a || Ae(a, t, r, !0))
          return;
        const { currentTime: h, volume: u, muted: c, playbackRate: m, loop: f } = a;
        e({
          type: o,
          id: n.getId(a),
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
    Le("play", l(zt.Play), s),
    Le("pause", l(zt.Pause), s),
    Le("seeked", l(zt.Seeked), s),
    Le("volumechange", l(zt.VolumeChange), s),
    Le("ratechange", l(zt.RateChange), s)
  ];
  return te(() => {
    d.forEach((o) => o());
  });
}
function ep({ fontCb: e, doc: t }) {
  const r = t.defaultView;
  if (!r)
    return () => {
    };
  const n = [], i = /* @__PURE__ */ new WeakMap(), s = r.FontFace;
  r.FontFace = function(o, p, a) {
    const h = new s(o, p, a);
    return i.set(h, {
      family: o,
      buffer: typeof p != "string",
      descriptors: a,
      fontSource: typeof p == "string" ? p : JSON.stringify(Array.from(new Uint8Array(p)))
    }), h;
  };
  const l = Lt(
    t.fonts,
    "add",
    function(d) {
      return function(o) {
        return setTimeout(
          te(() => {
            const p = i.get(o);
            p && (e(p), i.delete(o));
          }),
          0
        ), d.apply(this, [o]);
      };
    }
  );
  return n.push(() => {
    r.FontFace = s;
  }), n.push(l), te(() => {
    n.forEach((d) => d());
  });
}
function tp(e) {
  const { doc: t, mirror: r, blockClass: n, blockSelector: i, selectionCb: s } = e;
  let l = !0;
  const d = te(() => {
    const o = t.getSelection();
    if (!o || l && (o != null && o.isCollapsed)) return;
    l = o.isCollapsed || !1;
    const p = [], a = o.rangeCount || 0;
    for (let h = 0; h < a; h++) {
      const u = o.getRangeAt(h), { startContainer: c, startOffset: m, endContainer: f, endOffset: g } = u;
      Ae(c, n, i, !0) || Ae(f, n, i, !0) || p.push({
        start: r.getId(c),
        startOffset: m,
        end: r.getId(f),
        endOffset: g
      });
    }
    s({ ranges: p });
  });
  return d(), Le("selectionchange", d);
}
function rp({
  doc: e,
  customElementCb: t
}) {
  const r = e.defaultView;
  return !r || !r.customElements ? () => {
  } : Lt(
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
function np(e, t) {
  const {
    mutationCb: r,
    mousemoveCb: n,
    mouseInteractionCb: i,
    scrollCb: s,
    viewportResizeCb: l,
    inputCb: d,
    mediaInteractionCb: o,
    styleSheetRuleCb: p,
    styleDeclarationCb: a,
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
    t.scroll && t.scroll(...f), s(...f);
  }, e.viewportResizeCb = (...f) => {
    t.viewportResize && t.viewportResize(...f), l(...f);
  }, e.inputCb = (...f) => {
    t.input && t.input(...f), d(...f);
  }, e.mediaInteractionCb = (...f) => {
    t.mediaInteaction && t.mediaInteaction(...f), o(...f);
  }, e.styleSheetRuleCb = (...f) => {
    t.styleSheetRule && t.styleSheetRule(...f), p(...f);
  }, e.styleDeclarationCb = (...f) => {
    t.styleDeclaration && t.styleDeclaration(...f), a(...f);
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
function ip(e, t = {}) {
  const r = e.doc.defaultView;
  if (!r)
    return () => {
    };
  np(e, t);
  let n, i = () => {
  };
  e.recordDOM && ([n, i] = za(e, e.doc));
  const s = Vd(e), l = Gd(e), d = Fa(e), o = Yd(e, {
    win: r
  }), p = Xd(e), a = Qd(e);
  let h = () => {
  }, u = () => {
  }, c = () => {
  }, m = () => {
  };
  e.recordDOM && (h = Jd(e, { win: r }), u = Ua(e, e.doc), c = Zd(e, {
    win: r
  }), e.collectFonts && (m = ep(e)));
  const f = tp(e), g = rp(e), k = [];
  for (const b of e.plugins)
    k.push(
      b.observer(b.callback, r, b.options)
    );
  return te(() => {
    Ct.forEach((b) => b.reset()), n == null || n.disconnect(), i(), s(), l(), d(), o(), p(), a(), h(), u(), c(), m(), f(), g(), k.forEach((b) => b());
  });
}
function kr(e) {
  return typeof window[e] < "u";
}
function xr(e) {
  return !!(typeof window[e] < "u" && // Note: Generally, this check _shouldn't_ be necessary
  // However, in some scenarios (e.g. jsdom) this can sometimes fail, so we check for it here
  window[e].prototype && "insertRule" in window[e].prototype && "deleteRule" in window[e].prototype);
}
class Ro {
  constructor(t) {
    P(this, "iframeIdToRemoteIdMap", /* @__PURE__ */ new WeakMap()), P(this, "iframeRemoteIdToIdMap", /* @__PURE__ */ new WeakMap()), this.generateIdFn = t;
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
class sp {
  constructor(t) {
    P(this, "iframes", /* @__PURE__ */ new WeakMap()), P(this, "crossOriginIframeMap", /* @__PURE__ */ new WeakMap()), P(this, "crossOriginIframeMirror", new Ro(sa)), P(this, "crossOriginIframeStyleMirror"), P(this, "crossOriginIframeRootIdMap", /* @__PURE__ */ new WeakMap()), P(this, "mirror"), P(this, "mutationCb"), P(this, "wrappedEmit"), P(this, "loadListener"), P(this, "stylesheetManager"), P(this, "recordCrossOriginIframes"), this.mutationCb = t.mutationCb, this.wrappedEmit = t.wrappedEmit, this.stylesheetManager = t.stylesheetManager, this.recordCrossOriginIframes = t.recordCrossOriginIframes, this.crossOriginIframeStyleMirror = new Ro(
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
      case ne.FullSnapshot: {
        this.crossOriginIframeMirror.reset(t), this.crossOriginIframeStyleMirror.reset(t), this.replaceIdOnNode(r.data.node, t);
        const i = r.data.node.id;
        return this.crossOriginIframeRootIdMap.set(t, i), this.patchRootIdOnNode(r.data.node, i), {
          timestamp: r.timestamp,
          type: ne.IncrementalSnapshot,
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
      case ne.Meta:
      case ne.Load:
      case ne.DomContentLoaded:
        return !1;
      case ne.Plugin:
        return r;
      case ne.Custom:
        return this.replaceIds(
          r.data.payload,
          t,
          ["id", "parentId", "previousId", "nextId"]
        ), r;
      case ne.IncrementalSnapshot:
        switch (r.data.source) {
          case ee.Mutation:
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
    t.type !== _a.Document && !t.rootId && (t.rootId = r), "childNodes" in t && t.childNodes.forEach((n) => {
      this.patchRootIdOnNode(n, r);
    });
  }
}
class op {
  constructor(t) {
    P(this, "shadowDoms", /* @__PURE__ */ new WeakSet()), P(this, "mutationCb"), P(this, "scrollCb"), P(this, "bypassOptions"), P(this, "mirror"), P(this, "restoreHandlers", []), this.mutationCb = t.mutationCb, this.scrollCb = t.scrollCb, this.bypassOptions = t.bypassOptions, this.mirror = t.mirror, this.init();
  }
  init() {
    this.reset(), this.patchAttachShadow(Element, document);
  }
  addShadowRoot(t, r) {
    if (!er(t) || this.shadowDoms.has(t)) return;
    this.shadowDoms.add(t);
    const [n] = za(
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
      Fa({
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
        this.mirror.getId(X.host(t))
      ), this.restoreHandlers.push(
        Ua(
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
      Lt(
        t.prototype,
        "attachShadow",
        function(i) {
          return function(s) {
            const l = i.call(this, s), d = X.shadowRoot(this);
            return d && $a(this) && n.addShadowRoot(d, r), l;
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
var Bt = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", ap = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (var Sr = 0; Sr < Bt.length; Sr++)
  ap[Bt.charCodeAt(Sr)] = Sr;
var lp = function(e) {
  var t = new Uint8Array(e), r, n = t.length, i = "";
  for (r = 0; r < n; r += 3)
    i += Bt[t[r] >> 2], i += Bt[(t[r] & 3) << 4 | t[r + 1] >> 4], i += Bt[(t[r + 1] & 15) << 2 | t[r + 2] >> 6], i += Bt[t[r + 2] & 63];
  return n % 3 === 2 ? i = i.substring(0, i.length - 1) + "=" : n % 3 === 1 && (i = i.substring(0, i.length - 2) + "=="), i;
};
const Oo = /* @__PURE__ */ new Map();
function cp(e, t) {
  let r = Oo.get(e);
  return r || (r = /* @__PURE__ */ new Map(), Oo.set(e, r)), r.has(t) || r.set(t, []), r.get(t);
}
const Ba = (e, t, r) => {
  if (!e || !(Wa(e, t) || typeof e == "object"))
    return;
  const n = e.constructor.name, i = cp(r, n);
  let s = i.indexOf(e);
  return s === -1 && (s = i.length, i.push(e)), s;
};
function Cr(e, t, r) {
  if (e instanceof Array)
    return e.map((n) => Cr(n, t, r));
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
    const n = e.constructor.name, i = lp(e);
    return {
      rr_type: n,
      base64: i
    };
  } else {
    if (e instanceof DataView)
      return {
        rr_type: e.constructor.name,
        args: [
          Cr(e.buffer, t, r),
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
          args: [Cr(e.data, t, r), e.width, e.height]
        };
      if (Wa(e, t) || typeof e == "object") {
        const n = e.constructor.name, i = Ba(e, t, r);
        return {
          rr_type: n,
          index: i
        };
      }
    }
  }
  return e;
}
const qa = (e, t, r) => e.map((n) => Cr(n, t, r)), Wa = (e, t) => !![
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
function up(e, t, r, n) {
  const i = [], s = Object.getOwnPropertyNames(
    t.CanvasRenderingContext2D.prototype
  );
  for (const l of s)
    try {
      if (typeof t.CanvasRenderingContext2D.prototype[l] != "function")
        continue;
      const d = Lt(
        t.CanvasRenderingContext2D.prototype,
        l,
        function(o) {
          return function(...p) {
            return Ae(this.canvas, r, n, !0) || setTimeout(() => {
              const a = qa(p, t, this);
              e(this.canvas, {
                type: Gt["2D"],
                property: l,
                args: a
              });
            }, 0), o.apply(this, p);
          };
        }
      );
      i.push(d);
    } catch {
      const d = Xr(
        t.CanvasRenderingContext2D.prototype,
        l,
        {
          set(o) {
            e(this.canvas, {
              type: Gt["2D"],
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
function dp(e) {
  return e === "experimental-webgl" ? "webgl" : e;
}
function Io(e, t, r, n) {
  const i = [];
  try {
    const s = Lt(
      e.HTMLCanvasElement.prototype,
      "getContext",
      function(l) {
        return function(d, ...o) {
          if (!Ae(this, t, r, !0)) {
            const p = dp(d);
            if ("__context" in this || (this.__context = p), n && ["webgl", "webgl2"].includes(p))
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
function Lo(e, t, r, n, i, s) {
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
        const p = Lt(
          e,
          o,
          function(a) {
            return function(...h) {
              const u = a.apply(this, h);
              if (Ba(u, s, this), "tagName" in this.canvas && !Ae(this.canvas, n, i, !0)) {
                const c = qa(h, s, this), m = {
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
        l.push(p);
      } catch {
        const p = Xr(e, o, {
          set(a) {
            r(this.canvas, {
              type: t,
              property: o,
              args: [a],
              setter: !0
            });
          }
        });
        l.push(p);
      }
  return l;
}
function pp(e, t, r, n) {
  const i = [];
  return typeof t.WebGLRenderingContext < "u" && i.push(
    ...Lo(
      t.WebGLRenderingContext.prototype,
      Gt.WebGL,
      e,
      r,
      n,
      t
    )
  ), typeof t.WebGL2RenderingContext < "u" && i.push(
    ...Lo(
      t.WebGL2RenderingContext.prototype,
      Gt.WebGL2,
      e,
      r,
      n,
      t
    )
  ), () => {
    i.forEach((s) => s());
  };
}
const ja = `(function() {
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
`, Ao = typeof self < "u" && self.Blob && new Blob([ja], { type: "text/javascript;charset=utf-8" });
function hp(e) {
  let t;
  try {
    if (t = Ao && (self.URL || self.webkitURL).createObjectURL(Ao), !t) throw "";
    const r = new Worker(t, {
      name: e == null ? void 0 : e.name
    });
    return r.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(t);
    }), r;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(ja),
      {
        name: e == null ? void 0 : e.name
      }
    );
  } finally {
    t && (self.URL || self.webkitURL).revokeObjectURL(t);
  }
}
class fp {
  constructor(t) {
    P(this, "pendingCanvasMutations", /* @__PURE__ */ new Map()), P(this, "rafStamps", { latestId: 0, invokeId: null }), P(this, "mirror"), P(this, "mutationCb"), P(this, "resetObservers"), P(this, "frozen", !1), P(this, "locked", !1), P(this, "processMutation", (o, p) => {
      (this.rafStamps.invokeId && this.rafStamps.latestId !== this.rafStamps.invokeId || !this.rafStamps.invokeId) && (this.rafStamps.invokeId = this.rafStamps.latestId), this.pendingCanvasMutations.has(o) || this.pendingCanvasMutations.set(o, []), this.pendingCanvasMutations.get(o).push(p);
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
    const l = Io(
      r,
      n,
      i,
      !0
    ), d = /* @__PURE__ */ new Map(), o = new hp();
    o.onmessage = (m) => {
      const { id: f } = m.data;
      if (d.set(f, !1), !("base64" in m.data)) return;
      const { base64: g, type: k, width: b, height: w } = m.data;
      this.mutationCb({
        id: f,
        type: Gt["2D"],
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
    const p = 1e3 / t;
    let a = 0, h;
    const u = () => {
      const m = [];
      return r.document.querySelectorAll("canvas").forEach((f) => {
        Ae(f, n, i, !0) || m.push(f);
      }), m;
    }, c = (m) => {
      if (a && m - a < p) {
        h = requestAnimationFrame(c);
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
      }), h = requestAnimationFrame(c);
    };
    h = requestAnimationFrame(c), this.resetObservers = () => {
      l(), cancelAnimationFrame(h);
    };
  }
  initCanvasMutationObserver(t, r, n) {
    this.startRAFTimestamping(), this.startPendingCanvasMutationFlusher();
    const i = Io(
      t,
      r,
      n,
      !1
    ), s = up(
      this.processMutation.bind(this),
      t,
      r,
      n
    ), l = pp(
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
class mp {
  constructor(t) {
    P(this, "trackedLinkElements", /* @__PURE__ */ new WeakSet()), P(this, "mutationCb"), P(this, "adoptedStyleSheetCb"), P(this, "styleMirror", new Dd()), this.mutationCb = t.mutationCb, this.adoptedStyleSheetCb = t.adoptedStyleSheetCb;
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
          rule: ra(d, s.href),
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
class gp {
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
let ge, Er, ai, $r = !1;
try {
  if (Array.from([1], (e) => e * 2)[0] !== 2) {
    const e = document.createElement("iframe");
    document.body.appendChild(e), Array.from = ((as = e.contentWindow) == null ? void 0 : as.Array.from) || Array.from, document.body.removeChild(e);
  }
} catch (e) {
  console.debug("Unable to override Array.from", e);
}
const Ve = Su();
function yt(e = {}) {
  const {
    emit: t,
    checkoutEveryNms: r,
    checkoutEveryNth: n,
    blockClass: i = "rr-block",
    blockSelector: s = null,
    ignoreClass: l = "rr-ignore",
    ignoreSelector: d = null,
    maskTextClass: o = "rr-mask",
    maskTextSelector: p = null,
    inlineStylesheet: a = !0,
    maskAllInputs: h,
    maskInputOptions: u,
    slimDOMOptions: c,
    maskInputFn: m,
    maskTextFn: f,
    hooks: g,
    packFn: k,
    sampling: b = {},
    dataURLOptions: w = {},
    mousemoveWait: S,
    recordDOM: v = !0,
    recordCanvas: y = !1,
    recordCrossOriginIframes: x = !1,
    recordAfter: M = e.recordAfter === "DOMContentLoaded" ? e.recordAfter : "load",
    userTriggeredOnInput: A = !1,
    collectFonts: R = !1,
    inlineImages: j = !1,
    plugins: z,
    keepIframeSrcFn: E = () => !1,
    ignoreCSSAttributes: Te = /* @__PURE__ */ new Set([]),
    errorHandler: ye
  } = e;
  jd(ye);
  const ie = x ? window.parent === window : !0;
  let se = !1;
  if (!ie)
    try {
      window.parent.document && (se = !1);
    } catch {
      se = !0;
    }
  if (ie && !t)
    throw new Error("emit function is required");
  if (!ie && !se)
    return () => {
    };
  S !== void 0 && b.mousemove === void 0 && (b.mousemove = S), Ve.reset();
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
  } : u !== void 0 ? u : { password: !0 }, ve = ca(c);
  _d();
  let le, Z = 0;
  const xe = (H) => {
    for (const fe of z || [])
      fe.eventProcessor && (H = fe.eventProcessor(H));
    return k && // Disable packing events which will be emitted to parent frames.
    !se && (H = k(H)), H;
  };
  ge = (H, fe) => {
    var Q;
    const ce = H;
    if (ce.timestamp = nr(), (Q = Ct[0]) != null && Q.isFrozen() && ce.type !== ne.FullSnapshot && !(ce.type === ne.IncrementalSnapshot && ce.data.source === ee.Mutation) && Ct.forEach((me) => me.unfreeze()), ie)
      t == null || t(xe(ce), fe);
    else if (se) {
      const me = {
        type: "rrweb",
        event: xe(ce),
        origin: window.location.origin,
        isCheckout: fe
      };
      window.parent.postMessage(me, "*");
    }
    if (ce.type === ne.FullSnapshot)
      le = ce, Z = 0;
    else if (ce.type === ne.IncrementalSnapshot) {
      if (ce.data.source === ee.Mutation && ce.data.isAttachIframe)
        return;
      Z++;
      const me = n && Z >= n, Y = r && ce.timestamp - le.timestamp > r;
      (me || Y) && Er(!0);
    }
  };
  const L = (H) => {
    ge({
      type: ne.IncrementalSnapshot,
      data: {
        source: ee.Mutation,
        ...H
      }
    });
  }, Pe = (H) => ge({
    type: ne.IncrementalSnapshot,
    data: {
      source: ee.Scroll,
      ...H
    }
  }), Se = (H) => ge({
    type: ne.IncrementalSnapshot,
    data: {
      source: ee.CanvasMutation,
      ...H
    }
  }), at = (H) => ge({
    type: ne.IncrementalSnapshot,
    data: {
      source: ee.AdoptedStyleSheet,
      ...H
    }
  }), oe = new mp({
    mutationCb: L,
    adoptedStyleSheetCb: at
  }), ke = new sp({
    mirror: Ve,
    mutationCb: L,
    stylesheetManager: oe,
    recordCrossOriginIframes: x,
    wrappedEmit: ge
  });
  for (const H of z || [])
    H.getMirror && H.getMirror({
      nodeMirror: Ve,
      crossOriginIframeMirror: ke.crossOriginIframeMirror,
      crossOriginIframeStyleMirror: ke.crossOriginIframeStyleMirror
    });
  const Ce = new gp();
  ai = new fp({
    recordCanvas: y,
    mutationCb: Se,
    win: window,
    blockClass: i,
    blockSelector: s,
    mirror: Ve,
    sampling: b.canvas,
    dataURLOptions: w
  });
  const je = new op({
    mutationCb: L,
    scrollCb: Pe,
    bypassOptions: {
      blockClass: i,
      blockSelector: s,
      maskTextClass: o,
      maskTextSelector: p,
      inlineStylesheet: a,
      maskInputOptions: he,
      dataURLOptions: w,
      maskTextFn: f,
      maskInputFn: m,
      recordCanvas: y,
      inlineImages: j,
      sampling: b,
      slimDOMOptions: ve,
      iframeManager: ke,
      stylesheetManager: oe,
      canvasManager: ai,
      keepIframeSrcFn: E,
      processedNodeManager: Ce
    },
    mirror: Ve
  });
  Er = (H = !1) => {
    if (!v)
      return;
    ge(
      {
        type: ne.Meta,
        data: {
          href: window.location.href,
          width: Ia(),
          height: Oa()
        }
      },
      H
    ), oe.reset(), je.init(), Ct.forEach((Q) => Q.lock());
    const fe = Gu(document, {
      mirror: Ve,
      blockClass: i,
      blockSelector: s,
      maskTextClass: o,
      maskTextSelector: p,
      inlineStylesheet: a,
      maskAllInputs: he,
      maskTextFn: f,
      maskInputFn: m,
      slimDOM: ve,
      dataURLOptions: w,
      recordCanvas: y,
      inlineImages: j,
      onSerialize: (Q) => {
        Ta(Q, Ve) && ke.addIframe(Q), Pa(Q, Ve) && oe.trackLinkElement(Q), pi(Q) && je.addShadowRoot(X.shadowRoot(Q), document);
      },
      onIframeLoad: (Q, ce) => {
        ke.attachIframe(Q, ce), je.observeAttachShadow(Q);
      },
      onStylesheetLoad: (Q, ce) => {
        oe.attachLinkElement(Q, ce);
      },
      keepIframeSrcFn: E
    });
    if (!fe)
      return console.warn("Failed to snapshot the document");
    ge(
      {
        type: ne.FullSnapshot,
        data: {
          node: fe,
          initialOffset: Ra(window)
        }
      },
      H
    ), Ct.forEach((Q) => Q.unlock()), document.adoptedStyleSheets && document.adoptedStyleSheets.length > 0 && oe.adoptStyleSheets(
      document.adoptedStyleSheets,
      Ve.getId(document)
    );
  };
  try {
    const H = [], fe = (ce) => {
      var me;
      return te(ip)(
        {
          mutationCb: L,
          mousemoveCb: (Y, Ze) => ge({
            type: ne.IncrementalSnapshot,
            data: {
              source: Ze,
              positions: Y
            }
          }),
          mouseInteractionCb: (Y) => ge({
            type: ne.IncrementalSnapshot,
            data: {
              source: ee.MouseInteraction,
              ...Y
            }
          }),
          scrollCb: Pe,
          viewportResizeCb: (Y) => ge({
            type: ne.IncrementalSnapshot,
            data: {
              source: ee.ViewportResize,
              ...Y
            }
          }),
          inputCb: (Y) => ge({
            type: ne.IncrementalSnapshot,
            data: {
              source: ee.Input,
              ...Y
            }
          }),
          mediaInteractionCb: (Y) => ge({
            type: ne.IncrementalSnapshot,
            data: {
              source: ee.MediaInteraction,
              ...Y
            }
          }),
          styleSheetRuleCb: (Y) => ge({
            type: ne.IncrementalSnapshot,
            data: {
              source: ee.StyleSheetRule,
              ...Y
            }
          }),
          styleDeclarationCb: (Y) => ge({
            type: ne.IncrementalSnapshot,
            data: {
              source: ee.StyleDeclaration,
              ...Y
            }
          }),
          canvasMutationCb: Se,
          fontCb: (Y) => ge({
            type: ne.IncrementalSnapshot,
            data: {
              source: ee.Font,
              ...Y
            }
          }),
          selectionCb: (Y) => {
            ge({
              type: ne.IncrementalSnapshot,
              data: {
                source: ee.Selection,
                ...Y
              }
            });
          },
          customElementCb: (Y) => {
            ge({
              type: ne.IncrementalSnapshot,
              data: {
                source: ee.CustomElement,
                ...Y
              }
            });
          },
          blockClass: i,
          ignoreClass: l,
          ignoreSelector: d,
          maskTextClass: o,
          maskTextSelector: p,
          maskInputOptions: he,
          inlineStylesheet: a,
          sampling: b,
          recordDOM: v,
          recordCanvas: y,
          inlineImages: j,
          userTriggeredOnInput: A,
          collectFonts: R,
          doc: ce,
          maskInputFn: m,
          maskTextFn: f,
          keepIframeSrcFn: E,
          blockSelector: s,
          slimDOMOptions: ve,
          dataURLOptions: w,
          mirror: Ve,
          iframeManager: ke,
          stylesheetManager: oe,
          shadowDomManager: je,
          processedNodeManager: Ce,
          canvasManager: ai,
          ignoreCSSAttributes: Te,
          plugins: ((me = z == null ? void 0 : z.filter((Y) => Y.observer)) == null ? void 0 : me.map((Y) => ({
            observer: Y.observer,
            options: Y.options,
            callback: (Ze) => ge({
              type: ne.Plugin,
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
    ke.addLoadListener((ce) => {
      try {
        H.push(fe(ce.contentDocument));
      } catch (me) {
        console.warn(me);
      }
    });
    const Q = () => {
      Er(), H.push(fe(document)), $r = !0;
    };
    return ["interactive", "complete"].includes(document.readyState) ? Q() : (H.push(
      Le("DOMContentLoaded", () => {
        ge({
          type: ne.DomContentLoaded,
          data: {}
        }), M === "DOMContentLoaded" && Q();
      })
    ), H.push(
      Le(
        "load",
        () => {
          ge({
            type: ne.Load,
            data: {}
          }), M === "load" && Q();
        },
        window
      )
    )), () => {
      H.forEach((ce) => {
        try {
          ce();
        } catch (me) {
          String(me).toLowerCase().includes("cross-origin") || console.warn(me);
        }
      }), Ce.destroy(), $r = !1, Hd();
    };
  } catch (H) {
    console.warn(H);
  }
}
yt.addCustomEvent = (e, t) => {
  if (!$r)
    throw new Error("please add custom event after start recording");
  ge({
    type: ne.Custom,
    data: {
      tag: e,
      payload: t
    }
  });
};
yt.freezePage = () => {
  Ct.forEach((e) => e.freeze());
};
yt.takeFullSnapshot = (e) => {
  if (!$r)
    throw new Error("please take full snapshot after start recording");
  Er(e);
};
yt.mirror = Ve;
var To;
(function(e) {
  e[e.NotStarted = 0] = "NotStarted", e[e.Running = 1] = "Running", e[e.Stopped = 2] = "Stopped";
})(To || (To = {}));
const { addCustomEvent: sh } = yt, { freezePage: oh } = yt, { takeFullSnapshot: ah } = yt, li = 2, yp = 4;
class bp {
  constructor(t) {
    ur(this, "events", []);
    ur(this, "lastMeta", null);
    ur(this, "lastFull", null);
    this.opts = t;
  }
  push(t) {
    t.type === yp && (this.lastMeta = t), t.type === li && (this.lastFull = t, this.events = []), this.events.push(t), this.prune();
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
    return !this.events.some((n) => n.type === li) && this.lastFull && (this.lastMeta && t.push(this.lastMeta), t.push(this.lastFull)), [...t, ...this.events];
  }
  /** True when the buffer can produce a scrubbable replay (a full snapshot + at least one more event). */
  isPlayable() {
    const t = this.snapshot();
    return t.some((n) => n.type === li) && t.length >= 2;
  }
  clear() {
    this.events = [], this.lastMeta = null, this.lastFull = null;
  }
}
function vp(e, t = {}) {
  const r = new bp({
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
const Ha = "klav-sims-live", Va = "klav-sims-overlay", Po = "klav-sims-ext-css";
let Ue = null, St = null, $e = null, qt = null;
const _r = /* @__PURE__ */ new Map(), We = /* @__PURE__ */ new Map();
let Ga = 0, et = !1, Et = null, jt = null, lr = !1, Ie = null, Zt = null, ft = null, mt = null, Ye = null, Mt = null, Ge = null, Qe = null, Ke = null, Wt = null;
const Dr = /* @__PURE__ */ new Set();
function wp(e) {
  return String(e || "").trim().toLowerCase().replace(/\s+/g, " ");
}
function Ya(e, t) {
  return `${e}::${wp(t.text)}`;
}
function Ka(e) {
  try {
    document.dispatchEvent(new CustomEvent("klavity:sims-live", { detail: { active: e } }));
  } catch {
  }
}
const kp = `
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
`, xp = `
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
function No(e, t) {
  const r = e.replace("#", ""), n = (d) => parseInt(d, 16), [i, s, l] = r.length === 3 ? [n(r[0] + r[0]), n(r[1] + r[1]), n(r[2] + r[2])] : [n(r.slice(0, 2)), n(r.slice(2, 4)), n(r.slice(4, 6))];
  return `rgba(${i},${s},${l},${t})`;
}
function Sp(e) {
  if (e.suggestedBug) return !0;
  const t = String(e.priority ?? "").trim().toLowerCase();
  if (t && t !== "none") return !0;
  const r = String(e.sentiment ?? "").trim().toLowerCase();
  return r ? !(/* @__PURE__ */ new Set(["positive", "satisfied", "delighted", "neutral", "none"])).has(r) : !1;
}
function fi() {
  var e, t;
  try {
    return ((t = (e = window.matchMedia) == null ? void 0 : e.call(window, "(prefers-reduced-motion: reduce)")) == null ? void 0 : t.matches) ?? !1;
  } catch {
    return !1;
  }
}
function Cp(e) {
  return new Promise((t) => setTimeout(t, e));
}
function Ht(e) {
  const t = String(e.priority ?? "").trim().toLowerCase();
  return t === "high" || t === "critical" || t === "urgent" ? "HIGH" : t === "medium" || t === "med" ? "MED" : t === "low" ? "LOW" : e.suggestedBug ? "HIGH" : null;
}
const Xa = { HIGH: "h", MED: "m", LOW: "l" }, $o = { HIGH: 0, MED: 1, LOW: 2 };
function Ep(e) {
  if (!e) return !1;
  if (e === $e || e === Ue || e.id === Va || e.id === Ha || e.id === "klavity-widget-host") return !0;
  const t = e.classList;
  return !!t && t.contains("klav-halo");
}
function Mp(e) {
  const t = [];
  for (const r of [$e, Ue])
    r && (t.push({ el: r, vis: r.style.visibility }), r.style.visibility = "hidden");
  try {
    return e();
  } finally {
    for (const { el: r, vis: n } of t) r.style.visibility = n;
  }
}
function Ja(e) {
  const t = e.targetViewport;
  return {
    scrollX: Number.isFinite(t == null ? void 0 : t.scrollX) ? Number(t.scrollX) : window.scrollX,
    scrollY: Number.isFinite(t == null ? void 0 : t.scrollY) ? Number(t.scrollY) : window.scrollY,
    width: Math.max(1, Number.isFinite(t == null ? void 0 : t.width) ? Number(t.width) : window.innerWidth),
    height: Math.max(1, Number.isFinite(t == null ? void 0 : t.height) ? Number(t.height) : window.innerHeight)
  };
}
function Za(e, t) {
  return new DOMRect(
    t.scrollX + e.x * t.width,
    t.scrollY + e.y * t.height,
    Math.max(1, e.w * t.width),
    Math.max(1, e.h * t.height)
  );
}
function _o(e) {
  return Math.max(0, e.width) * Math.max(0, e.height);
}
function Rp(e, t) {
  const r = Math.max(e.left, t.left), n = Math.min(e.right, t.right), i = Math.max(e.top, t.top), s = Math.min(e.bottom, t.bottom);
  return Math.max(0, n - r) * Math.max(0, s - i);
}
function Op(e) {
  return new DOMRect(e.left + window.scrollX, e.top + window.scrollY, e.width, e.height);
}
function Qa(e) {
  if (!e || !(e instanceof HTMLElement) || e === document.body || e === document.documentElement || Ep(e)) return !1;
  const t = e.getBoundingClientRect();
  if (t.width < 8 || t.height < 8) return !1;
  try {
    const r = getComputedStyle(e);
    if (r.display === "none" || r.visibility === "hidden" || Number(r.opacity) === 0) return !1;
  } catch {
  }
  return !0;
}
function Ip(e, t) {
  return Mp(() => {
    const r = /* @__PURE__ */ new Set(), n = [], i = (l) => {
      let d = l;
      for (; d && d !== document.body && d !== document.documentElement; )
        !r.has(d) && Qa(d) && (r.add(d), n.push(d)), d = d.parentElement;
    }, s = typeof document.elementsFromPoint == "function" ? document.elementsFromPoint(e, t) : [document.elementFromPoint(e, t)].filter(Boolean);
    for (const l of s) i(l);
    return n;
  });
}
function Lp(e, t) {
  const r = Ja(t), n = Za(e, r), i = Math.max(2, Math.min(window.innerWidth - 2, n.left + n.width / 2 - window.scrollX)), s = Math.max(2, Math.min(window.innerHeight - 2, n.top + n.height / 2 - window.scrollY)), l = Ip(i, s);
  if (!l.length) return null;
  const d = Math.max(1, _o(n));
  let o = null, p = -1 / 0;
  for (const a of l) {
    const h = Op(a.getBoundingClientRect()), u = Rp(h, n);
    if (u <= 0) continue;
    const c = Math.max(1, _o(h)), m = u / d, f = Math.max(0, (c - u) / c), g = a.tagName.toLowerCase(), k = /^(button|a|input|textarea|select|label|section|article|nav|header|footer|main|form)$/.test(g) ? 0.18 : 0, b = c > window.innerWidth * window.innerHeight * 0.92 ? 0.8 : 0, w = m - f * 0.35 + k - b;
    w > p && (o = a, p = w);
  }
  return o ?? l[0] ?? null;
}
async function Ap(e, t) {
  if (e >= window.scrollX + 80 && e <= window.scrollX + window.innerWidth - 80 && t >= window.scrollY + 80 && t <= window.scrollY + window.innerHeight - 80) return;
  const i = Math.max(0, document.documentElement.scrollHeight - window.innerHeight), s = Math.max(0, document.documentElement.scrollWidth - window.innerWidth), l = Math.max(0, Math.min(i, t - window.innerHeight * 0.38)), d = Math.max(0, Math.min(s, e - window.innerWidth * 0.45));
  try {
    window.scrollTo({ top: l, left: d, behavior: fi() ? "auto" : "smooth" });
  } catch {
    window.scrollTo(d, l);
  }
  await Cp(fi() ? 80 : 520);
}
const Tp = /* @__PURE__ */ new Set([
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
function Pp(e) {
  const t = /* @__PURE__ */ new Set();
  return String(e || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((r) => r.length < 4 || Tp.has(r) || t.has(r) ? !1 : (t.add(r), !0));
}
function Np(e) {
  const t = Pp(e.text);
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
    if (!Qa(l)) continue;
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
    const p = t.reduce((f, g) => f + (o.includes(g) ? 1 : 0), 0);
    if (!p) continue;
    const a = l.tagName.toLowerCase(), h = /^(button|a|input|textarea|select|label|h1|h2|h3|section|article|nav|header|footer|main|form)$/.test(a) ? 0.6 : 0, c = Math.max(1, d.width * d.height) > window.innerWidth * window.innerHeight * 0.85 ? 1.1 : 0, m = p / t.length + h - c;
    m > i && (n = l, i = m);
  }
  return n;
}
async function $p(e, t = {}) {
  if (e.region) {
    const r = Ja(e), n = Za(e.region, r);
    t.scroll !== !1 && await Ap(n.left + n.width / 2, n.top + n.height / 2);
    const i = Lp(e.region, e);
    if (i) return i;
  }
  return Np(e);
}
function _p() {
  if (Ue && St) return St;
  Ue = document.createElement("div"), Ue.id = Ha, Ue.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;", St = Ue.attachShadow({ mode: "open" }), Hc(St);
  const e = document.createElement("style");
  return e.textContent = kp, St.appendChild(e), document.body.appendChild(Ue), St;
}
function el() {
  if ($e) return $e;
  if (!document.getElementById(Po)) {
    const e = document.createElement("style");
    e.id = Po, e.textContent = xp, document.head.appendChild(e);
  }
  return $e = document.createElement("div"), $e.id = Va, $e.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;z-index:2147483640;pointer-events:none;overflow:visible;", document.body.appendChild($e), $e;
}
function tl(e, t) {
  return Wc({
    name: e.name,
    initials: e.initials,
    photoUrl: e.photoUrl,
    color: e.accent,
    animate: !1,
    legs: !0,
    size: t
  });
}
function Dp(e, t = [], r = {}) {
  if (typeof document > "u") return;
  gi();
  const n = _p();
  el(), qt = new AbortController();
  const i = e === "all" ? t : t.filter((h) => e.includes(h.id));
  if (!i.length) {
    console.warn("[KlavitySims] deploy(): no matching Sims — panel not mounted."), gi();
    return;
  }
  i.slice(0, 8).forEach((h) => {
    const u = h.accent || "#6366f1", c = h.initials || h.name.slice(0, 2).toUpperCase();
    _r.set(h.id, { simId: h.id, accent: u, initials: c, name: h.name, photoUrl: h.photoUrl });
  });
  const s = document.createElement("div");
  s.className = "ksl-root", n.appendChild(s), Ke = document.createElement("div"), Ke.className = "ksl-sr", Ke.id = "ksl-announcer", Ke.setAttribute("aria-live", "polite"), Ke.setAttribute("aria-atomic", "true"), s.appendChild(Ke), Ie = document.createElement("button"), Ie.type = "button", Ie.className = "ksl-launcher", Ie.setAttribute("aria-label", "Open Sims feedback panel"), Ie.addEventListener("click", () => zp());
  const l = document.createElement("span");
  l.className = "ksl-pill", Zt = document.createElement("span"), Zt.className = "ksl-pill-avatars", ft = document.createElement("span"), ft.className = "ksl-pill-txt", l.append(Zt, ft), mt = document.createElement("span"), mt.className = "ksl-pill-badge", mt.hidden = !0, Ie.append(l, mt), s.appendChild(Ie), i.slice(0, 3).forEach((h) => {
    const u = _r.get(h.id);
    u && Zt.appendChild(tl(u, 26));
  }), Ye = document.createElement("section"), Ye.className = "ksl-panel", Ye.setAttribute("aria-label", "Sims feedback"), Ye.setAttribute("role", "dialog");
  const d = document.createElement("div");
  d.className = "ksl-head";
  const o = document.createElement("div");
  o.className = "ksl-title-row";
  const p = document.createElement("div");
  p.className = "ksl-title", p.textContent = "Sims feedback";
  const a = document.createElement("button");
  a.type = "button", a.className = "ksl-icon-btn", a.title = "Minimize", a.setAttribute("aria-label", "Minimize Sims feedback panel"), a.innerHTML = J("x", { size: 15 }), a.addEventListener("click", () => Do()), o.append(p, a), Mt = document.createElement("div"), Mt.className = "ksl-count", Ge = document.createElement("div"), Ge.className = "ksl-chips", d.append(o, Mt, Ge), Qe = document.createElement("div"), Qe.className = "ksl-list", Qe.setAttribute("role", "list"), Ye.append(d, Qe), s.appendChild(Ye), document.addEventListener("keydown", (h) => {
    h.key === "Escape" && et && Do();
  }, { signal: qt.signal }), Ka(!0), Kt();
}
function rl(e) {
  lr = e, Ie == null || Ie.classList.toggle("is-reviewing", e), Kt(), et && Yt();
}
function zp() {
  !Ye || !Ie || (et = !0, Ye.classList.add("is-open"), Ie.hidden = !0, Yt());
}
function Do() {
  !Ye || !Ie || (et = !1, Ye.classList.remove("is-open"), Ie.hidden = !1, Kt());
}
function nl() {
  const e = Array.from(We.values()), t = new Set(e.map((n) => n.entry.simId)), r = e.filter((n) => Ht(n.obs) === "HIGH").length;
  return { total: e.length, sims: t.size, high: r };
}
function Kt() {
  const e = nl();
  ft && (lr && e.total === 0 ? ft.innerHTML = "Your Sims are reviewing…" : e.total === 0 ? ft.innerHTML = "Sims are watching this page" : ft.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from your Sims`), mt && (mt.hidden = e.high === 0, mt.textContent = `${e.high} high`), et && il(e);
}
function il(e) {
  Mt && (e.total === 0 ? Mt.innerHTML = lr ? "Your Sims are reviewing this page…" : "No findings yet — your Sims are watching." : Mt.innerHTML = `<b>${e.total}</b> finding${e.total === 1 ? "" : "s"} from <b>${e.sims}</b> Sim${e.sims === 1 ? "" : "s"}` + (e.high > 0 ? ` · <span class="ksl-hi">${e.high} high</span>` : "")), Fp();
}
function Fp() {
  if (!Ge) return;
  const e = Array.from(We.values());
  if (Ge.hidden = e.length === 0, Ge.textContent = "", !e.length) return;
  const t = document.createElement("span");
  t.className = "ksl-chips-label", t.textContent = "Sim", Ge.appendChild(t);
  const r = /* @__PURE__ */ new Map();
  e.forEach((i) => {
    const s = r.get(i.entry.simId) ?? { entry: i.entry, n: 0 };
    s.n += 1, r.set(i.entry.simId, s);
  }), r.forEach(({ entry: i, n: s }) => {
    const l = document.createElement("button");
    l.type = "button", l.className = "ksl-chip" + (Et === i.simId ? " is-on" : ""), l.setAttribute("aria-pressed", String(Et === i.simId));
    const d = document.createElement("span");
    d.className = "ksl-dot", d.style.background = i.accent, l.append(d, document.createTextNode(`${i.initials} · ${s}`)), l.addEventListener("click", () => {
      Et = Et === i.simId ? null : i.simId, Yt();
    }), Ge.appendChild(l);
  });
  const n = document.createElement("span");
  n.className = "ksl-chips-label", n.style.marginLeft = "6px", n.textContent = "Priority", Ge.appendChild(n), ["HIGH", "MED", "LOW"].forEach((i) => {
    const s = e.filter((o) => Ht(o.obs) === i).length;
    if (!s) return;
    const l = document.createElement("button");
    l.type = "button";
    const d = jt === i;
    l.className = "ksl-chip" + (d ? ` sev-on-${Xa[i]}` : ""), l.setAttribute("aria-pressed", String(d)), l.textContent = `${i} · ${s}`, l.addEventListener("click", () => {
      jt = jt === i ? null : i, Yt();
    }), Ge.appendChild(l);
  });
}
function Up() {
  return Array.from(We.values()).filter((e) => !Et || e.entry.simId === Et).filter((e) => !jt || Ht(e.obs) === jt).sort((e, t) => {
    const r = Ht(e.obs), n = Ht(t.obs), i = r ? $o[r] : 3, s = n ? $o[n] : 3;
    return i - s;
  });
}
function Bp(e) {
  const { entry: t, obs: r } = e, n = Ht(r), i = document.createElement("div");
  i.className = "ksl-row", i.setAttribute("role", "listitem"), i.dataset.id = e.id, i.style.borderLeftColor = t.accent;
  const s = document.createElement("div");
  s.className = "ksl-r-head", s.appendChild(tl(t, 26));
  const l = document.createElement("span");
  l.className = "ksl-r-name", l.style.color = t.accent, l.textContent = t.name, s.appendChild(l);
  const d = String(r.sentiment ?? "").trim();
  if (d) {
    const m = document.createElement("span");
    m.className = "ksl-r-sent", m.textContent = d, s.appendChild(m);
  }
  if (n) {
    const m = document.createElement("span");
    m.className = `ksl-sev ${Xa[n]}`, m.setAttribute("aria-label", `Priority: ${n}`), m.textContent = n, s.appendChild(m);
  }
  i.appendChild(s);
  const o = document.createElement("div");
  o.className = "ksl-r-obs", o.textContent = r.text || "", i.appendChild(o);
  const p = document.createElement("button");
  p.type = "button", p.className = "ksl-r-expand", p.textContent = "Show more", p.addEventListener("click", () => {
    const m = i.classList.toggle("is-expanded");
    p.textContent = m ? "Show less" : "Show more";
  }), i.appendChild(p);
  const a = document.createElement("div");
  a.className = "ksl-r-actions";
  const h = document.createElement("button");
  h.type = "button", h.className = "ksl-r-act track", h.innerHTML = J("bug", { size: 12 }) + " Track as Bug", h.setAttribute("aria-label", `Track feedback from ${t.name} as a bug`), h.addEventListener("click", () => {
    var m;
    (m = Mr.onTriage) == null || m.call(Mr, r, t.name), zo(e.id);
  });
  const u = document.createElement("button");
  u.type = "button", u.className = "ksl-r-act jump", u.innerHTML = J("map-pin", { size: 12 }) + " Jump to on page", u.setAttribute("aria-label", `Jump to where ${t.name} flagged this`), u.addEventListener("click", () => {
    Wp(e.id);
  });
  const c = document.createElement("button");
  return c.type = "button", c.className = "ksl-r-act dismiss", c.textContent = "Dismiss", c.setAttribute("aria-label", `Dismiss feedback from ${t.name}`), c.addEventListener("click", () => {
    zo(e.id);
  }), a.append(h, u, c), i.appendChild(a), i;
}
function qp(e) {
  e.querySelectorAll(".ksl-row").forEach((t) => {
    const r = t.querySelector(".ksl-r-obs");
    r && r.scrollHeight - r.clientHeight > 4 && t.classList.add("is-clamped");
  });
}
function Yt() {
  if (!Qe || !et) {
    Kt();
    return;
  }
  const e = nl();
  il(e);
  const t = Up();
  if (Qe.textContent = "", !t.length) {
    const n = document.createElement("div");
    n.className = "ksl-empty";
    const i = We.size > 0;
    if (lr && !i) {
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
    Qe.appendChild(n), We.forEach((s) => {
      s.rowEl = null;
    });
    return;
  }
  t.forEach((n) => {
    const i = Bp(n);
    n.rowEl = i, Qe.appendChild(i);
  });
  const r = new Set(t.map((n) => n.id));
  We.forEach((n) => {
    r.has(n.id) || (n.rowEl = null);
  }), qp(Qe);
}
function mi() {
  Wt == null || Wt(), Wt = null;
}
async function Wp(e) {
  const t = We.get(e);
  if (!t) return;
  const r = await $p(t.obs, { scroll: !0 });
  !r || !$e || jp(r, t.entry.accent);
}
function jp(e, t) {
  mi();
  const r = el(), n = document.createElement("div");
  n.className = "klav-halo", n.style.borderColor = t, n.style.boxShadow = `0 0 0 4px ${No(t, 0.16)},0 0 24px ${No(t, 0.2)}`, r.appendChild(n);
  const i = new AbortController(), s = () => {
    const p = e.getBoundingClientRect(), a = p.width > 0 && p.height > 0 && p.bottom > 0 && p.right > 0 && p.top < window.innerHeight && p.left < window.innerWidth;
    n.style.display = a ? "" : "none", a && (n.style.left = `${p.left - 5}px`, n.style.top = `${p.top - 5}px`, n.style.width = `${p.width + 10}px`, n.style.height = `${p.height + 10}px`);
  }, l = () => requestAnimationFrame(s);
  s(), window.addEventListener("scroll", l, { passive: !0, signal: i.signal }), window.addEventListener("resize", l, { signal: i.signal });
  const d = setTimeout(() => {
    n.style.opacity = "0", n.style.transition = "opacity .3s ease", setTimeout(() => {
      Wt === o && mi();
    }, 320);
  }, 3200), o = () => {
    clearTimeout(d), i.abort(), n.remove();
  };
  Wt = o;
}
function Hp(e, t) {
  const r = `f_${e.simId}_${++Ga}`;
  We.set(r, { id: r, entry: e, obs: t, rowEl: null }), et ? Yt() : Kt(), Ke && (Ke.textContent = "", requestAnimationFrame(() => {
    Ke && (Ke.textContent = `${e.name}: ${t.text || ""}`);
  }));
}
function Vp(e) {
  const t = We.get(e);
  if (!t) return;
  const r = () => {
    We.delete(e), et ? Yt() : Kt();
  };
  t.rowEl && et ? (t.rowEl.classList.add("is-removing"), setTimeout(r, fi() ? 0 : 300)) : r();
}
function zo(e) {
  const t = We.get(e);
  t && (Dr.add(Ya(t.entry.simId, t.obs)), Vp(e));
}
function Gp(e, t, r) {
  if (!Ue) return;
  const n = _r.get(e);
  if (!n) {
    console.warn(`[KlavitySims] renderFeedback: simId "${e}" not registered`);
    return;
  }
  if (r.length) {
    rl(!1);
    for (const i of r) {
      if (!Sp(i)) continue;
      const s = Ya(e, i);
      Dr.has(s) || (Dr.add(s), Hp(n, i));
    }
  }
}
function gi() {
  mi(), We.clear(), Ga = 0, _r.clear(), Dr.clear(), et = !1, Et = null, jt = null, lr = !1, qt == null || qt.abort(), qt = null, Ie = null, Zt = null, ft = null, mt = null, Ye = null, Mt = null, Ge = null, Qe = null, Ke = null, $e == null || $e.remove(), $e = null, Ue == null || Ue.remove(), Ue = null, St = null, Ka(!1);
}
const Mr = {
  deploy: Dp,
  setReviewing: rl,
  renderFeedback: Gp,
  undeploy: gi,
  onTriage: null
};
function Yp() {
  typeof window > "u" || window.KlavitySims || (window.KlavitySims = Mr);
}
typeof window < "u" && Yp();
const Fo = "klav-ao-css", Kp = "klav-ao-overlay";
function Xp(e, t, r, n, i, s = 10) {
  const o = !(e.y - r - 14 >= s), p = o ? e.y + e.h + 14 : e.y - r - 14, a = Math.max(s, Math.min(p, i - r - s));
  return { left: Math.max(s, Math.min(e.x, n - t - s)), top: a, below: o };
}
const Jp = `
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
let xt = null, Zp = 1;
const zr = /* @__PURE__ */ new Map();
function Uo(e, t) {
  const r = e.replace("#", ""), n = (d) => parseInt(d, 16), [i, s, l] = r.length === 3 ? [n(r[0] + r[0]), n(r[1] + r[1]), n(r[2] + r[2])] : [n(r.slice(0, 2)), n(r.slice(2, 4)), n(r.slice(4, 6))];
  return `rgba(${i},${s},${l},${t})`;
}
function Qp() {
  if (xt) return xt;
  if (!document.getElementById(Fo)) {
    const e = document.createElement("style");
    e.id = Fo, e.textContent = Jp, document.head.appendChild(e);
  }
  return xt = document.createElement("div"), xt.id = Kp, xt.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;pointer-events:none;overflow:visible;z-index:2147483640;", document.body.appendChild(xt), xt;
}
function lh(e, t, r = {}) {
  const n = Qp(), i = r.color ?? "#6366f1", s = `klav-ao-${Zp++}`, l = 5, d = document.createElement("div");
  d.className = "klav-ao-halo", d.dataset.aoId = s, d.style.left = e.x - l + "px", d.style.top = e.y - l + "px", d.style.width = e.w + l * 2 + "px", d.style.height = e.h + l * 2 + "px", d.style.borderColor = i, d.style.boxShadow = `0 0 0 4px ${Uo(i, 0.14)},0 0 24px ${Uo(i, 0.18)}`, n.appendChild(d);
  let o = null;
  if (t) {
    const h = { x: e.x - l, y: e.y - l, w: e.w + l * 2, h: e.h + l * 2 }, { left: u, top: c, below: m } = Xp(
      h,
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
    b.className = "klav-ao-dismiss", b.textContent = "Dismiss", b.addEventListener("click", () => sl(s)), o.appendChild(f), o.appendChild(b), n.appendChild(o);
  }
  return zr.set(s, { halo: d, pin: o }), s;
}
function sl(e) {
  const t = zr.get(e);
  if (!t) return;
  zr.delete(e);
  const { halo: r, pin: n } = t;
  n ? (n.classList.add("is-out"), r.style.animation = "klav-ao-pin-out .22s ease-in forwards", setTimeout(() => {
    n.remove(), r.remove();
  }, 240)) : r.remove();
}
function ch() {
  for (const e of [...zr.keys()]) sl(e);
}
let ol = _t;
const al = { consoleErrors: [], networkFailures: [] };
let ll, cl, Vt = null;
function ul(e) {
  const t = {};
  for (const [r, n] of Object.entries(e))
    n != null && (t[String(r).slice(0, 64)] = String(n).slice(0, 1e3));
  return t;
}
async function Bo() {
  return fc(document.body, {
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
function eh() {
  return Sc(al, { identity: ll, metadata: cl });
}
async function th(e) {
  return yc(
    { type: e.type, description: e.description, context: e.context, screenshots: e.screenshots, replayEvents: e.replayEvents },
    ol,
    { jira: Gc, linear: Yc, github: Kc, plane: Xc, backend: Zc }
  );
}
function zi(e = "bug") {
  const t = $c(e, {
    onCaptureFull: Bo,
    onSubmit: async (r) => th({
      type: r.type,
      description: r.description,
      context: eh(),
      screenshots: r.screenshots,
      replayEvents: (Vt == null ? void 0 : Vt.getEvents()) ?? []
    })
  });
  setTimeout(async () => {
    try {
      const r = await Bo();
      t.addScreenshot(r);
    } catch {
    }
  }, 200);
}
function rh() {
  Cc(al, { consoleLevels: !0 });
}
function dl(e) {
  ll = e ? ul(e) : void 0;
}
function pl(e) {
  cl = e ? ul(e) : void 0;
}
function nh() {
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
      t.remove(), document.removeEventListener("click", r), i && zi(i);
    }), setTimeout(() => document.addEventListener("click", r), 0);
  });
}
function hl(e = {}) {
  if (ol = {
    ..._t,
    ...e,
    jira: { ..._t.jira, ...e.jira },
    linear: { ..._t.linear, ...e.linear },
    github: { ..._t.github, ...e.github },
    plane: { ..._t.plane, ...e.plane }
  }, rh(), nh(), !Vt)
    try {
      Vt = vp(yt);
    } catch {
      Vt = null;
    }
}
typeof window < "u" && (window.KlavitySnap = { init: hl, openModal: zi, identify: dl, setMetadata: pl });
const uh = { init: hl, openModal: zi, identify: dl, setMetadata: pl };
export {
  Mr as KlavitySims,
  Mr as SimsLive,
  sl as clearAnnotation,
  ch as clearAnnotations,
  uh as default,
  dl as identify,
  hl as init,
  Yp as installKlavitySims,
  zi as openModal,
  pl as setMetadata,
  lh as showAnnotation
};
